// Copyright (C) 2013  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#ifndef DLIB_VECTOR_NORMALIZER_FRoBMETRIC_Hh_
#define DLIB_VECTOR_NORMALIZER_FRoBMETRIC_Hh_

#include "vector_normalizer_frobmetric_abstract.h"
#include "../matrix.h"
#include "../optimization.h"

namespace dlib
{

// ----------------------------------------------------------------------------------------

    template <
        typename matrix_type
        >
    struct frobmetric_training_sample 
    {
        matrix_type anchor_vect;
        std::vector<matrix_type> near_vects;
        std::vector<matrix_type> far_vects;

        unsigned long num_triples (
        ) const { return near_vects.size() * far_vects.size(); }

        void clear()
        {
            near_vects.clear();
            far_vects.clear();
        }
    };

    template <
        typename matrix_type
        >
    void serialize(const frobmetric_training_sample<matrix_type>& item, std::ostream& out)
    {
        int version = 1;
        serialize(version, out);
        serialize(item.anchor_vect, out);
        serialize(item.near_vects, out);
        serialize(item.far_vects, out);
    }

    template <
        typename matrix_type
        >
    void deserialize(frobmetric_training_sample<matrix_type>& item, std::istream& in)
    {
        int version = 0;
        deserialize(version, in);
        if (version != 1)
            throw serialization_error("Unexpected version found while deserializing dlib::frobmetric_training_sample.");
        deserialize(item.anchor_vect, in);
        deserialize(item.near_vects, in);
        deserialize(item.far_vects, in);
    }

// ----------------------------------------------------------------------------------------

    template <
        typename matrix_type
        >
    class vector_normalizer_frobmetric
    {

    public:
        typedef typename matrix_type::mem_manager_type mem_manager_type;
        typedef typename matrix_type::type scalar_type;
        typedef matrix_type result_type;

    private:
        struct compact_frobmetric_training_sample 
        {
            std::vector<matrix_type> near_vects;
            std::vector<matrix_type> far_vects;
        };

        struct objective
        {
            objective (
                const std::vector<compact_frobmetric_training_sample>& samples_,
                matrix<double,0,0,mem_manager_type>& Aminus_,
                const matrix<double,0,1,mem_manager_type>& bias_ 
            ) : samples(samples_), Aminus(Aminus_), bias(bias_) {}
            
            double operator()(const matrix<double,0,1,mem_manager_type>& u) const
            {
                long idx = 0;
                const long dims = samples[0].far_vects[0].size();
                // Here we compute \hat A from the paper, which we refer to as just A in
                // the code.  
                matrix<double,0,0,mem_manager_type> A(dims,dims);
                A = 0;
                std::vector<double> ufar, unear;
                for (unsigned long i = 0; i < samples.size(); ++i)
                {
                    ufar.assign(samples[i].far_vects.size(),0);
                    unear.assign(samples[i].near_vects.size(),0);
                    for (unsigned long j = 0; j < unear.size(); ++j)
                    {
                        for (unsigned long k = 0; k < ufar.size(); ++k)
                        {
                            const double val = u(idx++);
                            ufar[k] -= val;
                            unear[j] += val;
                        }
                    }
                    for (unsigned long j = 0; j < unear.size(); ++j)
                        A += unear[j]*samples[i].near_vects[j]*trans(samples[i].near_vects[j]);
                    for (unsigned long j = 0; j < ufar.size(); ++j)
                        A += ufar[j]*samples[i].far_vects[j]*trans(samples[i].far_vects[j]);
                }

                eigenvalue_decomposition<matrix<double,0,0,mem_manager_type> > ed(make_symmetric(A));
                Aminus = ed.get_pseudo_v()*diagm(upperbound(ed.get_real_eigenvalues(),0))*trans(ed.get_pseudo_v());
                // Do this to avoid numeric instability later on since the above
                // computation can make Aminus slightly non-symmetric.
                Aminus = make_symmetric(Aminus);

                return dot(u,bias) - 0.5*sum(squared(Aminus));
            }

        private:
            const std::vector<compact_frobmetric_training_sample>& samples;
            matrix<double,0,0,mem_manager_type>& Aminus;
            const matrix<double,0,1,mem_manager_type>& bias;
        };

        struct derivative
        {
            derivative (
                unsigned long num_triples_,
                const std::vector<compact_frobmetric_training_sample>& samples_,
                matrix<double,0,0,mem_manager_type>& Aminus_,
                const matrix<double,0,1,mem_manager_type>& bias_ 
            ) : num_triples(num_triples_), samples(samples_), Aminus(Aminus_), bias(bias_) {}
            
            matrix<double,0,1,mem_manager_type> operator()(const matrix<double,0,1,mem_manager_type>& ) const
            {
                // Note that Aminus is a function of u (the argument to this function), but
                // since Aminus will have been computed already by the most recent call to
                // the objective function we don't need to do anything with u.  We can just
                // use Aminus right away.
                matrix<double,0,1,mem_manager_type> grad(num_triples);
                
                long idx = 0;
                std::vector<double> ufar, unear;
                for (unsigned long i = 0; i < samples.size(); ++i)
                {
                    ufar.resize(samples[i].far_vects.size());
                    unear.resize(samples[i].near_vects.size());

                    for (unsigned long j = 0; j < unear.size(); ++j)
                        unear[j] = sum(pointwise_multiply(Aminus, samples[i].near_vects[j]*trans(samples[i].near_vects[j])));
                    for (unsigned long j = 0; j < ufar.size(); ++j)
                        ufar[j] = sum(pointwise_multiply(Aminus, samples[i].far_vects[j]*trans(samples[i].far_vects[j])));

                    for (unsigned long j = 0; j < samples[i].near_vects.size(); ++j)
                    {
                        for (unsigned long k = 0; k < samples[i].far_vects.size(); ++k)
                        {
                            grad(idx) = bias(idx) + ufar[k]-unear[j];
                            idx++;
                        }
                    }
                }

                return grad;
            }

        private:
            const unsigned long num_triples;
            const std::vector<compact_frobmetric_training_sample>& samples;
            matrix<double,0,0,mem_manager_type>& Aminus;
            const matrix<double,0,1,mem_manager_type>& bias;
        };


        class custom_stop_strategy
        {
        public:
            custom_stop_strategy(
                double C_,
                double eps_,
                bool be_verbose_,
                unsigned long max_iter_
            ) 
            {
                _c = C_;

                _cur_iter = 0;
                _gradient_thresh = eps_;
                _max_iter = max_iter_;
                _verbose = be_verbose_;
            }

            template <typename T>
            bool should_continue_search (
                const T& u,
                const double ,
                const T& grad
            ) 
            {
                ++_cur_iter;

                double max_gradient = 0;
                for (long i = 0; i < grad.size(); ++i)
                {
                    const bool at_lower_bound = (0 >= u(i) && grad(i) > 0);
                    const bool at_upper_bound = (_c/grad.size() <= u(i) && grad(i) < 0);
                    if (!at_lower_bound && !at_upper_bound)
                        max_gradient = std::max(std::abs(grad(i)), max_gradient);
                }

                if (_verbose)
                {
                    std::cout << "iteration: " << _cur_iter << "   max_gradient: "<< max_gradient << std::endl;
                }

                // Only stop when the largest non-bound-constrained element of the gradient
                // is lower than the threshold.
                if (max_gradient < _gradient_thresh)
                    return false;

                // Check if we have hit the max allowable number of iterations.  
                if (_cur_iter > _max_iter)
                {
                    return false;
                }

                return true;
            }

        private:
            bool _verbose;

            unsigned long _max_iter;
            unsigned long _cur_iter;
            double _c;
            double _gradient_thresh;
        };

    public:
        vector_normalizer_frobmetric (
        )
        {
            verbose = false;
            eps = 0.1;
            C = 1;
            max_iter = 5000;
            _use_identity_matrix_prior = false;
        }

        bool uses_identity_matrix_prior (
        ) const
        {
            return _use_identity_matrix_prior;
        }

        void set_uses_identity_matrix_prior (
            bool use_prior
        )
        {
            _use_identity_matrix_prior = use_prior;
        }

        void be_verbose(
        )
        {
            verbose = true;
        }

        void set_epsilon (
            double eps_
        )
        {
            // make sure requires clause is not broken
            DLIB_ASSERT(eps_ > 0,
                "\t void vector_normalizer_frobmetric::set_epsilon(eps_)"
                << "\n\t invalid inputs were given to this function"
                << "\n\t eps: " << eps_ 
                );
            eps = eps_;
        }

        double get_epsilon (
        ) const 
        {
            return eps;
        }

        void set_c (
            double C_ 
        )
        {
            // make sure requires clause is not broken
            DLIB_ASSERT(C_ > 0,
                "\t void vector_normalizer_frobmetric::set_c()"
                << "\n\t C_ must be greater than 0"
                << "\n\t C_:    " << C_ 
                << "\n\t this: " << this
                );

            C = C_;
        }

        void set_max_iterations (
            unsigned long max_iterations
        )
        {
            max_iter = max_iterations;
        }

        unsigned long get_max_iterations (
        ) const
        {
            return max_iter;
        }

        double get_c (
        ) const
        {
            return C;
        }

        void be_quiet (
        )
        {
            verbose = false;
        }
       
        void train (
            const std::vector<frobmetric_training_sample<matrix_type> >& samples
        )
        {
            // make sure requires clause is not broken
            DLIB_ASSERT(samples.size() > 0,
                "\tvoid vector_normalizer_frobmetric::train()"
                << "\n\t you have to give a nonempty set of samples to this function"
                );
#ifdef ENABLE_ASSERTS
            {
                const long dims = samples[0].anchor_vect.size();
                DLIB_ASSERT(dims != 0,
                    "\tvoid vector_normalizer_frobmetric::train()"
                    << "\n\t The dimension of the input vectors can't be zero."
                    );
                for (unsigned long i = 0; i < samples.size(); ++i)
                {
                    DLIB_ASSERT(is_col_vector(samples[i].anchor_vect), 
                        "\tvoid vector_normalizer_frobmetric::train()"
                        << "\n\t Invalid inputs were given to this function."
                        << "\n\t i: " << i
                        );
                    DLIB_ASSERT(samples[i].anchor_vect.size() == dims, 
                        "\tvoid vector_normalizer_frobmetric::train()"
                        << "\n\t Invalid inputs were given to this function."
                        << "\n\t i:    " << i
                        << "\n\t dims: " << dims
                        << "\n\t samples[i].anchor_vect.size(): " << samples[i].anchor_vect.size()
                        );

                    DLIB_ASSERT(samples[i].num_triples() != 0,
                        "\tvoid vector_normalizer_frobmetric::train()"
                        << "\n\t It is illegal for a training sample to have no data in it"
                        << "\n\t i:    " << i
                    );
                    for (unsigned long j = 0; j < samples[i].near_vects.size(); ++j)
                    {
                        DLIB_ASSERT(is_col_vector(samples[i].near_vects[j]), 
                            "\tvoid vector_normalizer_frobmetric::train()"
                            << "\n\t Invalid inputs were given to this function."
                            << "\n\t i: " << i
                            << "\n\t j: " << j
                            );
                        DLIB_ASSERT(samples[i].near_vects[j].size() == dims, 
                            "\tvoid vector_normalizer_frobmetric::train()"
                            << "\n\t Invalid inputs were given to this function."
                            << "\n\t i:    " << i
                            << "\n\t j:    " << j
                            << "\n\t dims: " << dims
                            << "\n\t samples[i].near_vects[j].size(): " << samples[i].near_vects[j].size()
                            );
                    }
                    for (unsigned long j = 0; j < samples[i].far_vects.size(); ++j)
                    {
                        DLIB_ASSERT(is_col_vector(samples[i].far_vects[j]), 
                            "\tvoid vector_normalizer_frobmetric::train()"
                            << "\n\t Invalid inputs were given to this function."
                            << "\n\t i: " << i
                            << "\n\t j: " << j
                            );
                        DLIB_ASSERT(samples[i].far_vects[j].size() == dims, 
                            "\tvoid vector_normalizer_frobmetric::train()"
                            << "\n\t Invalid inputs were given to this function."
                            << "\n\t i:    " << i
                            << "\n\t j:    " << j
                            << "\n\t dims: " << dims
                            << "\n\t samples[i].far_vects[j].size(): " << samples[i].far_vects[j].size()
                            );
                    }
                }
            }
#endif // end ENABLE_ASSERTS


            // compute the mean sample
            m = 0;
            for (unsigned long i = 0; i < samples.size(); ++i)
                m += samples[i].anchor_vect;
            m /= samples.size();

            DLIB_ASSERT(is_finite(m), "Some of the input vectors to vector_normalizer_frobmetric::train() have infinite or NaN values");

            // Now we need to find tform.  So we setup the optimization problem and run it
            // over the next few lines of code.
            unsigned long num_triples = 0;
            for (unsigned long i = 0; i < samples.size(); ++i)
                num_triples += samples[i].near_vects.size()*samples[i].far_vects.size();

            matrix<double,0,1,mem_manager_type> u(num_triples);
            matrix<double,0,1,mem_manager_type> bias(num_triples);
            u = 0;
            bias = 1;


            // precompute all the anchor_vect to far_vects/near_vects pairs
            std::vector<compact_frobmetric_training_sample> data(samples.size());
            unsigned long cnt = 0;
            std::vector<double> far_norm, near_norm;
            for (unsigned long i = 0; i < data.size(); ++i)
            {
                far_norm.clear();
                near_norm.clear();
                data[i].far_vects.reserve(samples[i].far_vects.size());
                data[i].near_vects.reserve(samples[i].near_vects.size());
                for (unsigned long j = 0; j < samples[i].far_vects.size(); ++j)
                {
                    data[i].far_vects.push_back(samples[i].anchor_vect - samples[i].far_vects[j]);
                    if (_use_identity_matrix_prior)
                        far_norm.push_back(length_squared(data[i].far_vects.back()));
                }
                for (unsigned long j = 0; j < samples[i].near_vects.size(); ++j)
                {
                    data[i].near_vects.push_back(samples[i].anchor_vect - samples[i].near_vects[j]);
                    if (_use_identity_matrix_prior)
                        near_norm.push_back(length_squared(data[i].near_vects.back()));
                }

                // Note that this loop only executes if _use_identity_matrix_prior == true.
                for (unsigned long j = 0; j < near_norm.size(); ++j)
                {
                    for (unsigned long k = 0; k < far_norm.size(); ++k)
                    {
                        bias(cnt++) = 1 - (far_norm[k] - near_norm[j]);
                    }
                }
            }

            // Now run the main part of the algorithm
            matrix<double,0,0,mem_manager_type> Aminus;
            find_max_box_constrained(lbfgs_search_strategy(10),
                                     custom_stop_strategy(C, eps, verbose, max_iter),
                                     objective(data, Aminus, bias),
                                     derivative(num_triples, data, Aminus, bias),
                                     u, 0, C/num_triples);


            // What we need is the optimal Aminus which is a function of u.  So we already
            // have what we need and just need to put it into tform.
            eigenvalue_decomposition<matrix<double,0,0,mem_manager_type> > ed(make_symmetric(-Aminus));
            matrix<double,0,1,mem_manager_type> eigs = ed.get_real_eigenvalues();
            // But first, discard the components that are zero to within the machine epsilon.
            const double tol = max(eigs)*std::numeric_limits<double>::epsilon();
            for (long i = 0; i < eigs.size(); ++i)
            {
                if (eigs(i) < tol)
                    eigs(i) = 0;
            }
            if (_use_identity_matrix_prior)
                tform = matrix_cast<scalar_type>(identity_matrix(Aminus) + diagm(sqrt(eigs))*trans(ed.get_pseudo_v()));
            else
                tform = matrix_cast<scalar_type>(diagm(sqrt(eigs))*trans(ed.get_pseudo_v()));

            // Pre-apply the transform to m so we don't have to do it inside operator()
            // every time it's called.
            m = tform*m;
        }

        long in_vector_size (
        ) const
        {
            return m.nr();
        }

        long out_vector_size (
        ) const
        {
            return m.nr();
        }

        const matrix<scalar_type,0,1,mem_manager_type>& transformed_means (
        ) const
        {
            return m;
        }

        const matrix<scalar_type,0,0,mem_manager_type>& transform (
        ) const
        {
            return tform;
        }

        const result_type& operator() (
            const matrix_type& x
        ) const
        {
            // make sure requires clause is not broken
            DLIB_ASSERT(in_vector_size() != 0 && in_vector_size() == x.size() && 
                is_col_vector(x) == true,
                "\tmatrix vector_normalizer_frobmetric::operator()"
                << "\n\t you have given invalid arguments to this function"
                << "\n\t in_vector_size(): " << in_vector_size()
                << "\n\t x.size():         " << x.size()
                << "\n\t is_col_vector(x): " << is_col_vector(x)
                << "\n\t this:             " << this
                );

            temp_out = tform*x-m;
            return temp_out;
        }

        template <typename mt>
        friend void deserialize (
            vector_normalizer_frobmetric<mt>& item, 
            std::istream& in
        ); 

        template <typename mt>
        friend void serialize (
            const vector_normalizer_frobmetric<mt>& item, 
            std::ostream& out 
        );

    private:

        // ------------------- private data members -------------------

        matrix_type m;
        matrix<scalar_type,0,0,mem_manager_type> tform;
        bool verbose;
        double eps;
        double C;
        unsigned long max_iter;
        bool _use_identity_matrix_prior;

        // This is just a temporary variable that doesn't contribute to the
        // state of this object.
        mutable matrix_type temp_out;
    };

// ----------------------------------------------------------------------------------------

    template <
        typename matrix_type
        >
    void serialize (
        const vector_normalizer_frobmetric<matrix_type>& item, 
        std::ostream& out 
    )
    {
        const int version = 2;
        serialize(version, out);

        serialize(item.m, out);
        serialize(item.tform, out);
        serialize(item.verbose, out);
        serialize(item.eps, out);
        serialize(item.C, out);
        serialize(item.max_iter, out);
        serialize(item._use_identity_matrix_prior, out);
    }

// ----------------------------------------------------------------------------------------

    template <
        typename matrix_type
        >
    void deserialize (
        vector_normalizer_frobmetric<matrix_type>& item, 
        std::istream& in
    )   
    {
        int version = 0;
        deserialize(version, in);
        if (version != 1 && version != 2)
            throw serialization_error("Unsupported version found while deserializing dlib::vector_normalizer_frobmetric.");

        deserialize(item.m, in);
        deserialize(item.tform, in);
        deserialize(item.verbose, in);
        deserialize(item.eps, in);
        deserialize(item.C, in);
        deserialize(item.max_iter, in);
        if (version == 2)
            deserialize(item._use_identity_matrix_prior, in);
        else
            item._use_identity_matrix_prior = false;
    }

// ----------------------------------------------------------------------------------------

}

#endif // DLIB_VECTOR_NORMALIZER_FRoBMETRIC_Hh_

