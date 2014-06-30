// Copyright (C) 2011  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#ifndef DLIB_STRUCTURAL_SVM_DISTRIBUTeD_H__
#define DLIB_STRUCTURAL_SVM_DISTRIBUTeD_H__


#include "structural_svm_distributed_abstract.h"
#include "structural_svm_problem.h"
#include "../bridge.h"
#include "../smart_pointers.h"


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
            scalar_type cur_risk_lower_bound;
            double eps;
            bool skip_cache;

            friend void swap (oracle_request& a, oracle_request& b)
            {
                a.current_solution.swap(b.current_solution);
                std::swap(a.cur_risk_lower_bound, b.cur_risk_lower_bound);
                std::swap(a.eps, b.eps);
                std::swap(a.skip_cache, b.skip_cache);
            }

            friend void serialize (const oracle_request& item, std::ostream& out)
            {
                serialize(item.current_solution, out);
                dlib::serialize(item.cur_risk_lower_bound, out);
                dlib::serialize(item.eps, out);
                dlib::serialize(item.skip_cache, out);
            }

            friend void deserialize (oracle_request& item, std::istream& in)
            {
                deserialize(item.current_solution, in);
                dlib::deserialize(item.cur_risk_lower_bound, in);
                dlib::deserialize(item.eps, in);
                dlib::deserialize(item.skip_cache, in);
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
                        const oracle_request<matrix_type>& req = msg.template get<oracle_request<matrix_type> >();

                        oracle_response<matrix_type>& data = temp.template get<oracle_response<matrix_type> >();

                        data.subgradient = psi_true;
                        data.loss = 0;

                        data.num = problem.get_num_samples();

                        // how many samples to process in a single task (aim for 100 jobs per thread)
                        const long block_size = std::max<long>(1, data.num / (1+tp.num_threads_in_pool()*100));

                        binder b(*this, req, data);
                        for (long i = 0; i < data.num; i+=block_size)
                        {
                            tp.add_task(b, &binder::call_oracle, i, std::min(i + block_size, data.num));
                        }
                        tp.wait_for_all_tasks();

                        out.enqueue(temp);
                    }
                }
            }

            struct binder
            {
                binder (
                    const node_type& self_,
                    const impl::oracle_request<matrix_type>& req_,
                    impl::oracle_response<matrix_type>& data_
                ) : self(self_), req(req_), data(data_) {}

                void call_oracle (
                    long begin,
                    long end
                ) 
                {
                    // If we are only going to call the separation oracle once then
                    // don't run the slightly more complex for loop version of this code.
                    if (end-begin <= 1)
                    {
                        scalar_type loss;
                        feature_vector_type ftemp;
                        self.cache[begin].separation_oracle_cached(req.skip_cache, 
                                                                   req.cur_risk_lower_bound,
                                                                   req.current_solution,
                                                                   loss,
                                                                   ftemp);

                        auto_mutex lock(self.accum_mutex);
                        data.loss += loss;
                        add_to(data.subgradient, ftemp);
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
                            self.cache[i].separation_oracle_cached(req.skip_cache, 
                                                                   req.cur_risk_lower_bound,
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
            verbose(false),
            C(1)
        {}

        void set_epsilon (
            double eps_
        )
        {
            // make sure requires clause is not broken
            DLIB_ASSERT(eps_ > 0,
                "\t void structural_svm_problem::set_epsilon()"
                << "\n\t eps_ must be greater than 0"
                << "\n\t eps_: " << eps_ 
                << "\n\t this: " << this
                );

            eps = eps_;
        }

        double get_epsilon (
        ) const { return eps; }

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

        double get_c (
        ) const { return C; }

        void set_c (
            double C_
        ) 
        { 
            // make sure requires clause is not broken
            DLIB_ASSERT(C_ > 0,
                "\t void structural_svm_problem::set_c()"
                << "\n\t C_ must be greater than 0"
                << "\n\t C_:    " << C_ 
                << "\n\t this: " << this
                );

            C = C_; 
        }

        void add_processing_node (
            const std::string& ip,
            unsigned short port
        )
        {
            // make sure requires clause is not broken
            DLIB_ASSERT(is_ip_address(ip) && port != 0,
                "\t void structural_svm_problem::add_processing_node()"
                << "\n\t Invalid inputs were given to this function"
                << "\n\t ip:   " << ip 
                << "\n\t port: " << port
                << "\n\t this: " << this
                );

            // check if this pair is already registered
            for (unsigned long i = 0; i < nodes.size(); ++i)
            {
                if (nodes[i] == make_pair(ip,port))
                {
                    return;
                }
            }

            nodes.push_back(make_pair(ip,port));
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

            problem_type<matrix_type> problem(nodes,eps,verbose,C);

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
        class problem_type : public oca_problem<matrix_type_>
        {
        public:
            typedef typename matrix_type_::type scalar_type;
            typedef matrix_type_ matrix_type;

            problem_type (
                const std::vector<std::pair<std::string,unsigned short> >& nodes_,
                double eps_,
                bool verbose_,
                double C_
            ) :
                nodes(nodes_),
                eps(eps_),
                verbose(verbose_),
                C(C_),
                in(3),
                cur_risk_lower_bound(0),
                skip_cache(true),
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
                    bridges[i].reset(new bridge(connect_to_ip_and_port(nodes[i].first,nodes[i].second), 
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



            virtual bool risk_has_lower_bound (
                scalar_type& lower_bound
            ) const 
            { 
                lower_bound = 0;
                return true; 
            }

            virtual bool optimization_status (
                scalar_type current_objective_value,
                scalar_type current_error_gap,
                scalar_type current_risk_value,
                scalar_type current_risk_gap,
                unsigned long num_cutting_planes,
                unsigned long num_iterations
            ) const 
            {
                if (verbose)
                {
                    using namespace std;
                    cout << "objective:     " << current_objective_value << endl;
                    cout << "objective gap: " << current_error_gap << endl;
                    cout << "risk:          " << current_risk_value << endl;
                    cout << "risk gap:      " << current_risk_gap << endl;
                    cout << "num planes:    " << num_cutting_planes << endl;
                    cout << "iter:          " << num_iterations << endl;
                    cout << endl;
                }

                cur_risk_lower_bound = std::max<scalar_type>(current_risk_value - current_risk_gap, 0);

                bool should_stop = false;

                if (current_risk_gap < eps)
                    should_stop = true;

                if (should_stop && !skip_cache)
                {
                    // Instead of stopping we shouldn't use the cache on the next iteration.  This way
                    // we can be sure to have the best solution rather than assuming the cache is up-to-date
                    // enough.
                    should_stop = false;
                    skip_cache = true;
                }
                else
                {
                    skip_cache = false;
                }


                return should_stop;
            }

            virtual scalar_type get_c (
            ) const 
            {
                return C;
            }

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
                    temp_out.template get<oracle_request<matrix_type> >().eps = eps;
                    temp_out.template get<oracle_request<matrix_type> >().cur_risk_lower_bound = cur_risk_lower_bound;
                    temp_out.template get<oracle_request<matrix_type> >().skip_cache = skip_cache;
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
            }

            std::vector<std::pair<std::string,unsigned short> > nodes;
            double eps;
            mutable bool verbose;
            double C;

            typedef type_safe_union<impl::oracle_request<matrix_type> > tsu_out;
            typedef type_safe_union<impl::oracle_response<matrix_type>, long> tsu_in;

            std::vector<shared_ptr<pipe<tsu_out> > > out_pipes;
            mutable pipe<tsu_in> in;
            std::vector<shared_ptr<bridge> > bridges;

            mutable scalar_type cur_risk_lower_bound;
            mutable bool skip_cache;
            long num_dims;
        };

        std::vector<std::pair<std::string,unsigned short> > nodes;
        double eps;
        mutable bool verbose;
        double C;
    };

// ----------------------------------------------------------------------------------------

}

#endif // DLIB_STRUCTURAL_SVM_DISTRIBUTeD_H__

