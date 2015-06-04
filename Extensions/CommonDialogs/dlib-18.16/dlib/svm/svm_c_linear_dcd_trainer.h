// Copyright (C) 2012  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#ifndef DLIB_SVm_C_LINEAR_DCD_TRAINER_Hh_ 
#define DLIB_SVm_C_LINEAR_DCD_TRAINER_Hh_

#include "svm_c_linear_dcd_trainer_abstract.h"
#include <cmath>
#include <limits>
#include "../matrix.h"
#include "../algs.h"
#include "../rand.h"

#include "function.h"
#include "kernel.h"

namespace dlib 
{

// ----------------------------------------------------------------------------------------

    template <
        typename K 
        >
    class svm_c_linear_dcd_trainer
    {
    public:
        typedef K kernel_type;
        typedef typename kernel_type::scalar_type scalar_type;
        typedef typename kernel_type::sample_type sample_type;
        typedef typename kernel_type::mem_manager_type mem_manager_type;
        typedef decision_function<kernel_type> trained_function_type;
        typedef typename decision_function<K>::sample_vector_type sample_vector_type;
        typedef typename decision_function<K>::scalar_vector_type scalar_vector_type;

        // You are getting a compiler error on this line because you supplied a non-linear
        // kernel to the svm_c_linear_dcd_trainer object.  You have to use one of the
        // linear kernels with this trainer.
        COMPILE_TIME_ASSERT((is_same_type<K, linear_kernel<sample_type> >::value ||
                             is_same_type<K, sparse_linear_kernel<sample_type> >::value ));

        svm_c_linear_dcd_trainer (
        ) :
            Cpos(1),
            Cneg(1),
            eps(0.1),
            max_iterations(10000),
            verbose(false),
            have_bias(true),
            last_weight_1(false),
            do_shrinking(true)
        {
        }

        explicit svm_c_linear_dcd_trainer (
            const scalar_type& C_
        ) :
            Cpos(C_),
            Cneg(C_),
            eps(0.1),
            max_iterations(10000),
            verbose(false),
            have_bias(true),
            last_weight_1(false),
            do_shrinking(true)
        {
            // make sure requires clause is not broken
            DLIB_ASSERT(0 < C_,
                "\tsvm_c_trainer::svm_c_linear_dcd_trainer(kernel,C)"
                << "\n\t invalid inputs were given to this function"
                << "\n\t C_: " << C_
                );
        }

        bool includes_bias (
        ) const 
        { 
            return have_bias; 
        }

        void include_bias (
            bool should_have_bias
        ) 
        { 
            have_bias = should_have_bias; 
        }

        bool forces_last_weight_to_1 (
        ) const
        {
            return last_weight_1;
        }

        void force_last_weight_to_1 (
            bool should_last_weight_be_1
        )
        {
            last_weight_1 = should_last_weight_be_1;
        }

        bool shrinking_enabled (
        ) const { return do_shrinking; }

        void enable_shrinking (
            bool enabled
        ) { do_shrinking = enabled; }

        void be_verbose (
        )
        {
            verbose = true;
        }

        void be_quiet (
        )
        {
            verbose = false;
        }

        void set_epsilon (
            scalar_type eps_
        )
        {
            // make sure requires clause is not broken
            DLIB_ASSERT(eps_ > 0,
                "\tvoid svm_c_linear_dcd_trainer::set_epsilon(eps_)"
                << "\n\t invalid inputs were given to this function"
                << "\n\t eps_: " << eps_ 
                );
            eps = eps_;
        }

        const scalar_type get_epsilon (
        ) const
        { 
            return eps;
        }

        const kernel_type& get_kernel (
        ) const
        {
            return kernel_type();
        }

        unsigned long get_max_iterations (
        ) const { return max_iterations; }

        void set_max_iterations (
            unsigned long max_iter
        ) 
        {
            max_iterations = max_iter;
        }

        void set_c (
            scalar_type C 
        )
        {
            // make sure requires clause is not broken
            DLIB_ASSERT(C > 0,
                "\t void svm_c_linear_dcd_trainer::set_c()"
                << "\n\t C must be greater than 0"
                << "\n\t C:    " << C 
                << "\n\t this: " << this
                );

            Cpos = C;
            Cneg = C;
        }

        const scalar_type get_c_class1 (
        ) const
        {
            return Cpos;
        }

        const scalar_type get_c_class2 (
        ) const
        {
            return Cneg;
        }

        void set_c_class1 (
            scalar_type C
        )
        {
            // make sure requires clause is not broken
            DLIB_ASSERT(C > 0,
                "\t void svm_c_linear_dcd_trainer::set_c_class1()"
                << "\n\t C must be greater than 0"
                << "\n\t C:    " << C 
                << "\n\t this: " << this
                );

            Cpos = C;
        }

        void set_c_class2 (
            scalar_type C
        )
        {
            // make sure requires clause is not broken
            DLIB_ASSERT(C > 0,
                "\t void svm_c_linear_dcd_trainer::set_c_class2()"
                << "\n\t C must be greater than 0"
                << "\n\t C:    " << C 
                << "\n\t this: " << this
                );

            Cneg = C;
        }

        class optimizer_state
        {
            friend class svm_c_linear_dcd_trainer;

        public:
            optimizer_state() : did_init(false) {}

        private:

            template <
                typename in_sample_vector_type
                >
            void init(
                const in_sample_vector_type& x,
                bool have_bias_,
                bool last_weight_1_
            )
            {
                const long new_dims = max_index_plus_one(x);
                long new_idx = 0;

                if (did_init)
                {
                    DLIB_CASSERT(have_bias_ == have_bias &&
                                 last_weight_1_ == last_weight_1, 
                                "\t decision_function svm_c_linear_dcd_trainer::train(x,y,state)"
                                << "\n\t The given state object is invalid because the previous trainer was configured differently."
                                << "\n\t have_bias_:     " << have_bias_
                                << "\n\t have_bias:      " << have_bias
                                << "\n\t last_weight_1_: " << last_weight_1_
                                << "\n\t last_weight_1:  " << last_weight_1
                                 );

                    DLIB_CASSERT( new_dims >= dims,
                                "\t decision_function svm_c_linear_dcd_trainer::train(x,y,state)"
                                << "\n\t The given state object is invalid because the training data dimensions have shrunk."
                                << "\n\t new_dims:  " << new_dims
                                << "\n\t dims:      " << dims 
                        );

                    DLIB_CASSERT( x.size() >= static_cast<long>(alpha.size()),
                                "\t decision_function svm_c_linear_dcd_trainer::train(x,y,state)"
                                << "\n\t The given state object is invalid because the training data has fewer samples than previously."
                                << "\n\t x.size():     " << x.size() 
                                << "\n\t alpha.size(): " << alpha.size() 
                        );

                    // make sure we amortize the cost of growing the alpha vector.
                    if (alpha.capacity() < static_cast<unsigned long>(x.size()))
                        alpha.reserve(x.size()*2);

                    new_idx = alpha.size();

                    // Make sure alpha has the same length as x.  So pad with extra zeros if
                    // necessary to make this happen.
                    alpha.resize(x.size(),0);


                    if (new_dims != dims)
                    {
                        // The only valid way the dimensions can be different here is if
                        // you are using a sparse vector type.  This is because we might
                        // have had training samples which just happened to not include all
                        // the features previously.  Therefore, max_index_plus_one() would
                        // have given too low of a result.  But for dense vectors it is
                        // definitely a user error if the dimensions don't match.

                        DLIB_CASSERT(is_matrix<sample_type>::value == false, 
                                "\t decision_function svm_c_linear_dcd_trainer::train(x,y,state)"
                                << "\n\t The given state object is invalid because the training data dimensions have changed."
                                << "\n\t new_dims:  " << new_dims
                                << "\n\t dims:      " << dims 
                            );

                        // extend w by the right number of elements
                        if (have_bias && !last_weight_1)
                        {
                            // Splice some zeros into the w vector so it will have the
                            // right length.  Here we are being careful to move the bias
                            // weight to the end of the resulting vector.
                            w = join_cols(join_cols(
                                    colm(w,0,dims), 
                                    zeros_matrix<scalar_type>(new_dims-dims,1)), 
                                    uniform_matrix<scalar_type>(1,1,w(dims))
                                    );
                        }
                        else
                        {
                            // Just concatenate the right number of zeros.
                            w = join_cols(w, zeros_matrix<scalar_type>(new_dims-dims,1));
                        }
                        dims = new_dims;
                    }

                }
                else
                {
                    did_init = true;
                    have_bias = have_bias_;
                    last_weight_1 = last_weight_1_;
                    dims = new_dims;

                    alpha.resize(x.size());

                    index.reserve(x.size());
                    Q.reserve(x.size());

                    if (have_bias && !last_weight_1)
                        w.set_size(dims+1);
                    else
                        w.set_size(dims);

                    w = 0;
                }

                for (long i = new_idx; i < x.size(); ++i)
                {
                    Q.push_back(length_squared(x(i)));

                    if (have_bias && !last_weight_1)
                    {
                        index.push_back(i);
                        Q.back() += 1;
                    }
                    else if (Q.back() != 0)
                    {
                        index.push_back(i);
                    }
                }

                if (last_weight_1)
                    w(dims-1) = 1;
            }

            template <typename T>
            typename enable_if<is_matrix<T>,scalar_type>::type length_squared (const T& x) const
            {
                if (!last_weight_1)
                {
                    return dlib::dot(x,x);
                }
                else
                {
                    // skip the last dimension
                    return dlib::dot(colm(x,0,x.size()-1), 
                                     colm(x,0,x.size()-1));
                }

            }

            template <typename T>
            typename disable_if<is_matrix<T>,scalar_type>::type length_squared (const T& x) const
            {
                if (!last_weight_1)
                {
                    return dlib::dot(x,x);
                }
                else
                {
                    scalar_type temp = 0;
                    typename T::const_iterator i;
                    for (i = x.begin(); i != x.end(); ++i)
                    {
                        // skip the last dimension
                        if (static_cast<long>(i->first) < dims-1)
                            temp += i->second*i->second;
                    }
                    return temp;
                }
            }


            bool did_init;
            bool have_bias;
            bool last_weight_1;
            std::vector<scalar_type> alpha;
            scalar_vector_type w;
            std::vector<scalar_type> Q;
            std::vector<long> index;
            long dims;
            dlib::rand rnd;

        public:
            friend void serialize(const optimizer_state& item, std::ostream& out)
            {
                const int version = 1;
                dlib::serialize(version, out);
                dlib::serialize(item.did_init, out);
                dlib::serialize(item.have_bias, out);
                dlib::serialize(item.last_weight_1, out);
                dlib::serialize(item.alpha, out);
                dlib::serialize(item.w, out);
                dlib::serialize(item.Q, out);
                dlib::serialize(item.index, out);
                dlib::serialize(item.dims, out);
                dlib::serialize(item.rnd, out);
            }

            friend void deserialize(optimizer_state& item, std::istream& in)
            {
                int version = 0;
                dlib::deserialize(version, in);
                if (version != 1)
                {
                    throw dlib::serialization_error(
                        "Error while deserializing dlib::svm_c_linear_dcd_trainer::optimizer_state, unexpected version."
                        );
                }

                dlib::deserialize(item.did_init, in);
                dlib::deserialize(item.have_bias, in);
                dlib::deserialize(item.last_weight_1, in);
                dlib::deserialize(item.alpha, in);
                dlib::deserialize(item.w, in);
                dlib::deserialize(item.Q, in);
                dlib::deserialize(item.index, in);
                dlib::deserialize(item.dims, in);
                dlib::deserialize(item.rnd, in);
            }

        };

        template <
            typename in_sample_vector_type,
            typename in_scalar_vector_type
            >
        const decision_function<kernel_type> train (
            const in_sample_vector_type& x,
            const in_scalar_vector_type& y
        ) const
        {
            optimizer_state state;
            return do_train(mat(x), mat(y), state);
        }

        template <
            typename in_sample_vector_type,
            typename in_scalar_vector_type
            >
        const decision_function<kernel_type> train (
            const in_sample_vector_type& x,
            const in_scalar_vector_type& y,
            optimizer_state& state 
        ) const
        {
            return do_train(mat(x), mat(y), state);
        }

    private:

    // ------------------------------------------------------------------------------------

        template <
            typename in_sample_vector_type,
            typename in_scalar_vector_type
            >
        const decision_function<kernel_type> do_train (
            const in_sample_vector_type& x,
            const in_scalar_vector_type& y,
            optimizer_state& state 
        ) const
        {
            // make sure requires clause is not broken
            DLIB_ASSERT(is_learning_problem(x,y) == true,
                "\t decision_function svm_c_linear_dcd_trainer::train(x,y)"
                << "\n\t invalid inputs were given to this function"
                << "\n\t x.size(): " << x.size() 
                << "\n\t y.size(): " << y.size() 
                << "\n\t is_learning_problem(x,y): " << is_learning_problem(x,y)
                );
#ifdef ENABLE_ASSERTS
            for (long i = 0; i < x.size(); ++i)
            {
                DLIB_ASSERT(y(i) == +1 || y(i) == -1,
                    "\t decision_function svm_c_linear_dcd_trainer::train(x,y)"
                    << "\n\t invalid inputs were given to this function"
                    << "\n\t y("<<i<<"): " << y(i)
                );
            }
#endif

            state.init(x,have_bias,last_weight_1);

            std::vector<scalar_type>& alpha = state.alpha;
            scalar_vector_type& w = state.w;
            std::vector<long>& index = state.index;
            const long dims = state.dims;

            unsigned long active_size = index.size();

            scalar_type PG_max_prev = std::numeric_limits<scalar_type>::infinity();
            scalar_type PG_min_prev = -std::numeric_limits<scalar_type>::infinity();

            // main loop
            for (unsigned long iter = 0; iter < max_iterations; ++iter)
            {
                scalar_type PG_max = -std::numeric_limits<scalar_type>::infinity();
                scalar_type PG_min = std::numeric_limits<scalar_type>::infinity();

                // randomly shuffle the indices
                for (unsigned long i = 0; i < active_size; ++i)
                {
                    // pick a random index >= i
                    const long j = i + state.rnd.get_random_32bit_number()%(active_size-i);
                    std::swap(index[i], index[j]);
                }
                
                // for all the active training samples
                for (unsigned long ii = 0; ii < active_size; ++ii)
                {
                    const long i = index[ii];

                    const scalar_type G = y(i)*dot(w, x(i)) - 1;
                    const scalar_type C = (y(i) > 0) ? Cpos : Cneg;

                    scalar_type PG = 0;
                    if (alpha[i] == 0)
                    {
                        if (G > PG_max_prev)
                        {
                            // shrink the active set of training examples
                            --active_size;
                            std::swap(index[ii], index[active_size]);
                            --ii;
                            continue;
                        }

                        if (G < 0)
                            PG = G;
                    }
                    else if (alpha[i] == C)
                    {
                        if (G < PG_min_prev)
                        {
                            // shrink the active set of training examples
                            --active_size;
                            std::swap(index[ii], index[active_size]);
                            --ii;
                            continue;
                        }

                        if (G > 0)
                            PG = G;
                    }
                    else
                    {
                        PG = G;
                    }

                    if (PG > PG_max) 
                        PG_max = PG;
                    if (PG < PG_min) 
                        PG_min = PG;

                    // if PG != 0
                    if (std::abs(PG) > 1e-12)
                    {
                        const scalar_type alpha_old = alpha[i];
                        alpha[i] = std::min(std::max(alpha[i] - G/state.Q[i], (scalar_type)0.0), C);
                        const scalar_type delta = (alpha[i]-alpha_old)*y(i);
                        add_to(w, x(i), delta);
                        if (have_bias && !last_weight_1)
                            w(w.size()-1) -= delta;

                        if (last_weight_1)
                            w(dims-1) = 1;
                    }

                }

                if (verbose)
                {
                    using namespace std;
                    cout << "gap:         " << PG_max - PG_min << endl;
                    cout << "active_size: " << active_size << endl;
                    cout << "iter:        " << iter << endl;
                    cout << endl;
                }

                if (PG_max - PG_min <= eps)
                {
                    // stop if we are within eps tolerance and the last iteration
                    // was over all the samples
                    if (active_size == index.size())
                        break;

                    // Turn of shrinking on the next iteration.  We will stop if the
                    // tolerance is still <= eps when shrinking is off.
                    active_size = index.size();
                    PG_max_prev = std::numeric_limits<scalar_type>::infinity();
                    PG_min_prev = -std::numeric_limits<scalar_type>::infinity();
                }
                else if (do_shrinking)
                {
                    PG_max_prev = PG_max;
                    PG_min_prev = PG_min;
                    if (PG_max_prev <= 0)
                        PG_max_prev = std::numeric_limits<scalar_type>::infinity();
                    if (PG_min_prev >= 0)
                        PG_min_prev = -std::numeric_limits<scalar_type>::infinity();
                }

            } // end of main optimization loop




            // put the solution into a decision function and then return it
            decision_function<kernel_type> df;
            if (have_bias && !last_weight_1)
                df.b = w(w.size()-1);
            else
                df.b = 0;

            df.basis_vectors.set_size(1);
            // Copy the plane normal into the output basis vector.  The output vector might
            // be a sparse vector container so we need to use this special kind of copy to
            // handle that case.  
            assign(df.basis_vectors(0), colm(w, 0, dims));
            df.alpha.set_size(1);
            df.alpha(0) = 1;

            return df;
        }

        scalar_type dot (
            const scalar_vector_type& w,
            const sample_type& sample
        ) const
        {
            if (have_bias && !last_weight_1)
            {
                const long w_size_m1 = w.size()-1;
                return dlib::dot(colm(w,0,w_size_m1), sample) - w(w_size_m1);
            }
            else
            {
                return dlib::dot(w, sample);
            }
        }

    // ------------------------------------------------------------------------------------

        scalar_type Cpos;
        scalar_type Cneg;
        scalar_type eps;
        unsigned long max_iterations;
        bool verbose;
        bool have_bias; // having a bias means we pretend all x vectors have an extra element which is always -1.
        bool last_weight_1;
        bool do_shrinking;

    }; // end of class svm_c_linear_dcd_trainer

// ----------------------------------------------------------------------------------------


}

#endif // DLIB_SVm_C_LINEAR_DCD_TRAINER_Hh_


