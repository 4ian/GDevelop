// Copyright (C) 2011  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#ifndef DLIB_STRUCTURAL_SVM_DISTRIBUTeD_Hh_
#define DLIB_STRUCTURAL_SVM_DISTRIBUTeD_Hh_


#include "structural_svm_distributed_abstract.h"
#include "structural_svm_problem.h"
#include "../bridge.h"
#include "../smart_pointers.h"
#include "../misc_api.h"
#include "../statistics.h"


#include "../threads.h"
#include "../pipe.h"
#include "../type_safe_union.h"
#include <iostream>
#include <vector>

namespace dlib
{

// ----------------------------------------------------------------------------------------

    namespace impl
    {

        template <typename matrix_type>
        struct oracle_response
        {
            typedef typename matrix_type::type scalar_type;

            matrix_type subgradient;
            scalar_type loss;
            long num;

            friend void swap (oracle_response& a, oracle_response& b)
            {
                a.subgradient.swap(b.subgradient);
                std::swap(a.loss, b.loss);
                std::swap(a.num, b.num);
            }

            friend void serialize (const oracle_response& item, std::ostream& out)
            {
                serialize(item.subgradient, out);
                dlib::serialize(item.loss, out);
                dlib::serialize(item.num, out);
            }

            friend void deserialize (oracle_response& item, std::istream& in)
            {
                deserialize(item.subgradient, in);
                dlib::deserialize(item.loss, in);
                dlib::deserialize(item.num, in);
            }
        };

    // ----------------------------------------------------------------------------------------

        template <typename matrix_type>
        struct oracle_request
        {
            typedef typename matrix_type::type scalar_type;

            matrix_type current_solution;
            scalar_type saved_current_risk_gap;
            bool skip_cache;
            bool converged;

            friend void swap (oracle_request& a, oracle_request& b)
            {
                a.current_solution.swap(b.current_solution);
                std::swap(a.saved_current_risk_gap, b.saved_current_risk_gap);
                std::swap(a.skip_cache, b.skip_cache);
                std::swap(a.converged, b.converged);
            }

            friend void serialize (const oracle_request& item, std::ostream& out)
            {
                serialize(item.current_solution, out);
                dlib::serialize(item.saved_current_risk_gap, out);
                dlib::serialize(item.skip_cache, out);
                dlib::serialize(item.converged, out);
            }

            friend void deserialize (oracle_request& item, std::istream& in)
            {
                deserialize(item.current_solution, in);
                dlib::deserialize(item.saved_current_risk_gap, in);
                dlib::deserialize(item.skip_cache, in);
                dlib::deserialize(item.converged, in);
            }
        };

    }

// ----------------------------------------------------------------------------------------

    class svm_struct_processing_node : noncopyable
    {
    public:

        template <
            typename T,
            typename U 
            >
        svm_struct_processing_node (
            const structural_svm_problem<T,U>& problem,
            unsigned short port,
            unsigned short num_threads
        )
        {
            // make sure requires clause is not broken
            DLIB_ASSERT(port != 0 && problem.get_num_samples() != 0 &&
                        problem.get_num_dimensions() != 0,
                "\t svm_struct_processing_node()"
                << "\n\t Invalid arguments were given to this function"
                << "\n\t port: " << port 
                << "\n\t problem.get_num_samples():    " << problem.get_num_samples() 
                << "\n\t problem.get_num_dimensions(): " << problem.get_num_dimensions() 
                << "\n\t this: " << this
                );

            the_problem.reset(new node_type<T,U>(problem, port, num_threads));
        }

    private:

        struct base
        {
            virtual ~base(){}
        };

        template <
            typename matrix_type,
            typename feature_vector_type 
            >
        class node_type : public base, threaded_object
        {
        public:
            typedef typename matrix_type::type scalar_type;

            node_type(
                const structural_svm_problem<matrix_type,feature_vector_type>& prob,
                unsigned short port,
                unsigned long num_threads
            ) : in(3),out(3), problem(prob), tp(num_threads)
            {
                b.reconfigure(listen_on_port(port), receive(in), transmit(out));

                start();
            }

            ~node_type()
            {
                in.disable();
                out.disable();
                wait();
            }

        private:

            void thread()
            {
                using namespace impl;
                tsu_in msg; 
                tsu_out temp;

                timestamper ts;
                running_stats<double> with_buffer_time;
                running_stats<double> without_buffer_time;
                unsigned long num_iterations_executed = 0;

                while (in.dequeue(msg))
                {
                    // initialize the cache and compute psi_true.
                    if (cache.size() == 0)
                    {
                        cache.resize(problem.get_num_samples());
                        for (unsigned long i = 0; i < cache.size(); ++i)
                            cache[i].init(&problem,i);

                        psi_true.set_size(problem.get_num_dimensions(),1);
                        psi_true = 0;

                        const unsigned long num = problem.get_num_samples();
                        feature_vector_type ftemp;
                        for (unsigned long i = 0; i < num; ++i)
                        {
                            cache[i].get_truth_joint_feature_vector_cached(ftemp);

                            subtract_from(psi_true, ftemp);
                        }
                    }


                    if (msg.template contains<bridge_status>() && 
                        msg.template get<bridge_status>().is_connected)
                    {
                        temp = problem.get_num_dimensions();
                        out.enqueue(temp);

                    }
                    else if (msg.template contains<oracle_request<matrix_type> >())
                    {
                        ++num_iterations_executed;

                        const oracle_request<matrix_type>& req = msg.template get<oracle_request<matrix_type> >();

                        oracle_response<matrix_type>& data = temp.template get<oracle_response<matrix_type> >();

                        data.subgradient = psi_true;
                        data.loss = 0;

                        data.num = problem.get_num_samples();

                        const uint64 start_time = ts.get_timestamp();

                        // pick fastest buffering strategy
                        bool buffer_subgradients_locally = with_buffer_time.mean() < without_buffer_time.mean();

                        // every 50 iterations we should try to flip the buffering scheme to see if
                        // doing it the other way might be better.  
                        if ((num_iterations_executed%50) == 0)
                        {
                            buffer_subgradients_locally = !buffer_subgradients_locally;
                        }

                        binder b(*this, req, data, buffer_subgradients_locally);
                        parallel_for_blocked(tp, 0, data.num, b, &binder::call_oracle);

                        const uint64 stop_time = ts.get_timestamp();
                        if (buffer_subgradients_locally)
                            with_buffer_time.add(stop_time-start_time);
                        else
                            without_buffer_time.add(stop_time-start_time);

                        out.enqueue(temp);
                    }
                }
            }

            struct binder
            {
                binder (
                    const node_type& self_,
                    const impl::oracle_request<matrix_type>& req_,
                    impl::oracle_response<matrix_type>& data_,
                    bool buffer_subgradients_locally_
                ) : self(self_), req(req_), data(data_),
                    buffer_subgradients_locally(buffer_subgradients_locally_) {}

                void call_oracle (
                    long begin,
                    long end
                ) 
                {
                    // If we are only going to call the separation oracle once then don't
                    // run the slightly more complex for loop version of this code.  Or if
                    // we just don't want to run the complex buffering one.  The code later
                    // on decides if we should do the buffering based on how long it takes
                    // to execute.  We do this because, when the subgradient is really high
                    // dimensional it can take a lot of time to add them together.  So we
                    // might want to avoid doing that.
                    if (end-begin <= 1 || !buffer_subgradients_locally)
                    {
                        scalar_type loss;
                        feature_vector_type ftemp;
                        for (long i = begin; i < end; ++i)
                        {
                            self.cache[i].separation_oracle_cached(req.converged, 
                                                                   req.skip_cache, 
                                                                   req.saved_current_risk_gap,
                                                                   req.current_solution,
                                                                   loss,
                                                                   ftemp);

                            auto_mutex lock(self.accum_mutex);
                            data.loss += loss;
                            add_to(data.subgradient, ftemp);
                        }
                    }
                    else
                    {
                        scalar_type loss = 0;
                        matrix_type faccum(data.subgradient.size(),1);
                        faccum = 0;

                        feature_vector_type ftemp;

                        for (long i = begin; i < end; ++i)
                        {
                            scalar_type loss_temp;
                            self.cache[i].separation_oracle_cached(req.converged,
                                                                   req.skip_cache, 
                                                                   req.saved_current_risk_gap,
                                                                   req.current_solution,
                                                                   loss_temp,
                                                                   ftemp);
                            loss += loss_temp;
                            add_to(faccum, ftemp);
                        }

                        auto_mutex lock(self.accum_mutex);
                        data.loss += loss;
                        add_to(data.subgradient, faccum);
                    }
                }

                const node_type& self;
                const impl::oracle_request<matrix_type>& req;
                impl::oracle_response<matrix_type>& data;
                bool buffer_subgradients_locally;
            };



            typedef type_safe_union<impl::oracle_request<matrix_type>, bridge_status> tsu_in;
            typedef type_safe_union<impl::oracle_response<matrix_type> , long> tsu_out;

            pipe<tsu_in> in;
            pipe<tsu_out> out;
            bridge b;

            mutable matrix_type psi_true;
            const structural_svm_problem<matrix_type,feature_vector_type>& problem;
            mutable std::vector<cache_element_structural_svm<structural_svm_problem<matrix_type,feature_vector_type> > > cache;

            mutable thread_pool tp;
            mutex accum_mutex;
        };


        scoped_ptr<base> the_problem;
    };

// ----------------------------------------------------------------------------------------

    class svm_struct_controller_node : noncopyable
    {
    public:

        svm_struct_controller_node (
        ) :
            eps(0.001),
            max_iterations(10000),
            cache_based_eps(std::numeric_limits<double>::infinity()),
            verbose(false),
            C(1)
        {}

        double get_cache_based_epsilon (
        ) const
        {
            return cache_based_eps;
        }

        void set_cache_based_epsilon (
            double eps_
        )
        {
            // make sure requires clause is not broken
            DLIB_ASSERT(eps_ > 0,
                "\t void svm_struct_controller_node::set_cache_based_epsilon()"
                << "\n\t eps_ must be greater than 0"
                << "\n\t eps_: " << eps_ 
                << "\n\t this: " << this
                );

            cache_based_eps = eps_;
        }

        void set_epsilon (
            double eps_
        )
        {
            // make sure requires clause is not broken
            DLIB_ASSERT(eps_ > 0,
                "\t void svm_struct_controller_node::set_epsilon()"
                << "\n\t eps_ must be greater than 0"
                << "\n\t eps_: " << eps_ 
                << "\n\t this: " << this
                );

            eps = eps_;
        }

        double get_epsilon (
        ) const { return eps; }

        unsigned long get_max_iterations (
        ) const { return max_iterations; }

        void set_max_iterations (
            unsigned long max_iter
        ) 
        {
            max_iterations = max_iter;
        }

        void be_verbose (
        ) 
        {
            verbose = true;
        }

        void be_quiet(
        )
        {
            verbose = false;
        }

        void add_nuclear_norm_regularizer (
            long first_dimension,
            long rows,
            long cols,
            double regularization_strength
        )
        {
            // make sure requires clause is not broken
            DLIB_ASSERT(0 <= first_dimension  &&
                0 <= rows && 0 <= cols && 
                0 < regularization_strength,
                "\t void svm_struct_controller_node::add_nuclear_norm_regularizer()"
                << "\n\t Invalid arguments were given to this function."
                << "\n\t first_dimension:         " << first_dimension 
                << "\n\t rows:                    " << rows 
                << "\n\t cols:                    " << cols 
                << "\n\t regularization_strength: " << regularization_strength 
                << "\n\t this: " << this
                );

            impl::nuclear_norm_regularizer temp;
            temp.first_dimension = first_dimension;
            temp.nr = rows;
            temp.nc = cols;
            temp.regularization_strength = regularization_strength;
            nuclear_norm_regularizers.push_back(temp);
        }

        unsigned long num_nuclear_norm_regularizers (
        ) const { return nuclear_norm_regularizers.size(); }

        void clear_nuclear_norm_regularizers (
        ) { nuclear_norm_regularizers.clear(); }


        double get_c (
        ) const { return C; }

        void set_c (
            double C_
        ) 
        { 
            // make sure requires clause is not broken
            DLIB_ASSERT(C_ > 0,
                "\t void svm_struct_controller_node::set_c()"
                << "\n\t C_ must be greater than 0"
                << "\n\t C_:    " << C_ 
                << "\n\t this: " << this
                );

            C = C_; 
        }

        void add_processing_node (
            const network_address& addr
        )
        {
            // make sure requires clause is not broken
            DLIB_ASSERT(addr.port != 0,
                "\t void svm_struct_controller_node::add_processing_node()"
                << "\n\t Invalid inputs were given to this function"
                << "\n\t addr.host_address:   " << addr.host_address 
                << "\n\t addr.port: " << addr.port
                << "\n\t this: " << this
                );

            // check if this address is already registered
            for (unsigned long i = 0; i < nodes.size(); ++i)
            {
                if (nodes[i] == addr)
                {
                    return;
                }
            }
            
            nodes.push_back(addr);
        }

        void add_processing_node (
            const std::string& ip_or_hostname,
            unsigned short port
        )
        {
            add_processing_node(network_address(ip_or_hostname,port));
        }

        unsigned long get_num_processing_nodes (
        ) const
        {
            return nodes.size();
        }

        void remove_processing_nodes (
        ) 
        {
            nodes.clear();
        }

        template <typename matrix_type>
        double operator() (
            const oca& solver,
            matrix_type& w
        ) const
        {
            // make sure requires clause is not broken
            DLIB_ASSERT(get_num_processing_nodes() != 0,
                        "\t double svm_struct_controller_node::operator()"
                        << "\n\t You must add some processing nodes before calling this function."
                        << "\n\t this: " << this
            );

            problem_type<matrix_type> problem(nodes);
            problem.set_cache_based_epsilon(cache_based_eps);
            problem.set_epsilon(eps);
            problem.set_max_iterations(max_iterations);
            if (verbose)
                problem.be_verbose();
            problem.set_c(C);
            for (unsigned long i = 0; i < nuclear_norm_regularizers.size(); ++i)
            {
                problem.add_nuclear_norm_regularizer(
                    nuclear_norm_regularizers[i].first_dimension,
                    nuclear_norm_regularizers[i].nr,
                    nuclear_norm_regularizers[i].nc,
                    nuclear_norm_regularizers[i].regularization_strength);
            }

            return solver(problem, w);
        }

        class invalid_problem : public error
        {
        public:
            invalid_problem(
                const std::string& a
            ): error(a) {}
        };


    private:

        template <typename matrix_type_>
        class problem_type : public structural_svm_problem<matrix_type_>
        {
        public:
            typedef typename matrix_type_::type scalar_type;
            typedef matrix_type_ matrix_type;

            problem_type (
                const std::vector<network_address>& nodes_
            ) :
                nodes(nodes_),
                in(3),
                num_dims(0)
            {

                // initialize all the transmit pipes
                out_pipes.resize(nodes.size());
                for (unsigned long i = 0; i < out_pipes.size(); ++i)
                {
                    out_pipes[i].reset(new pipe<tsu_out>(3));
                }

                // make bridges that connect to all our remote processing nodes
                bridges.resize(nodes.size());
                for (unsigned long i = 0; i< bridges.size(); ++i)
                {
                    bridges[i].reset(new bridge(connect_to(nodes[i]), 
                                                receive(in), transmit(*out_pipes[i])));
                }



                // The remote processing nodes are supposed to all send the problem dimensionality
                // upon connection. So get that and make sure everyone agrees on what it's supposed to be.
                tsu_in temp;
                unsigned long responses = 0;
                bool seen_dim = false;
                while (responses < nodes.size())
                {
                    in.dequeue(temp);
                    if (temp.template contains<long>())
                    {
                        ++responses;
                        // if this new dimension doesn't match what we have seen previously
                        if (seen_dim && num_dims != temp.template get<long>())
                        {
                            throw invalid_problem("remote hosts disagree on the number of dimensions!");
                        }
                        seen_dim = true;
                        num_dims = temp.template get<long>();
                    }
                }
            }

            // These functions are just here because the structural_svm_problem requires
            // them, but since we are overloading get_risk() they are never called so they
            // don't matter.
            virtual long get_num_samples () const {return 0;}
            virtual void get_truth_joint_feature_vector ( long , matrix_type&  ) const {}
            virtual void separation_oracle ( const long , const matrix_type& , scalar_type& , matrix_type& ) const {}

            virtual long get_num_dimensions (
            ) const
            {
                return num_dims;
            }

            virtual void get_risk (
                matrix_type& w,
                scalar_type& risk,
                matrix_type& subgradient
            ) const 
            {
                using namespace impl;
                subgradient.set_size(w.size(),1);
                subgradient = 0;

                // send out all the oracle requests
                tsu_out temp_out;
                for (unsigned long i = 0; i < out_pipes.size(); ++i)
                {
                    temp_out.template get<oracle_request<matrix_type> >().current_solution = w;
                    temp_out.template get<oracle_request<matrix_type> >().saved_current_risk_gap = this->saved_current_risk_gap;
                    temp_out.template get<oracle_request<matrix_type> >().skip_cache = this->skip_cache;
                    temp_out.template get<oracle_request<matrix_type> >().converged = this->converged;
                    out_pipes[i]->enqueue(temp_out);
                }

                // collect all the oracle responses  
                long num = 0;
                scalar_type total_loss = 0;
                tsu_in temp_in;
                unsigned long responses = 0;
                while (responses < out_pipes.size())
                {
                    in.dequeue(temp_in);
                    if (temp_in.template contains<oracle_response<matrix_type> >())
                    {
                        ++responses;
                        const oracle_response<matrix_type>& data = temp_in.template get<oracle_response<matrix_type> >();
                        subgradient += data.subgradient; 
                        total_loss += data.loss;
                        num += data.num;
                    }
                }

                subgradient /= num;
                total_loss /= num;
                risk = total_loss + dot(subgradient,w);

                if (this->nuclear_norm_regularizers.size() != 0)
                {
                    matrix_type grad; 
                    double obj;
                    this->compute_nuclear_norm_parts(w, grad, obj);
                    risk += obj;
                    subgradient += grad;
                }
            }

            std::vector<network_address> nodes;

            typedef type_safe_union<impl::oracle_request<matrix_type> > tsu_out;
            typedef type_safe_union<impl::oracle_response<matrix_type>, long> tsu_in;

            std::vector<shared_ptr<pipe<tsu_out> > > out_pipes;
            mutable pipe<tsu_in> in;
            std::vector<shared_ptr<bridge> > bridges;
            long num_dims;
        };

        std::vector<network_address> nodes;
        double eps;
        unsigned long max_iterations;
        double cache_based_eps;
        bool verbose;
        double C;
        std::vector<impl::nuclear_norm_regularizer> nuclear_norm_regularizers;
    };

// ----------------------------------------------------------------------------------------

}

#endif // DLIB_STRUCTURAL_SVM_DISTRIBUTeD_Hh_

