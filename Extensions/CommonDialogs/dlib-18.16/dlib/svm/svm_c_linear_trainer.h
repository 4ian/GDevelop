// Copyright (C) 2010  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#ifndef DLIB_SVM_C_LiNEAR_TRAINER_Hh_
#define DLIB_SVM_C_LiNEAR_TRAINER_Hh_

#include "svm_c_linear_trainer_abstract.h"
#include "../algs.h"
#include "../optimization.h"
#include "../matrix.h"
#include "function.h"
#include "kernel.h"
#include <iostream>
#include <vector>
#include "sparse_vector.h"

namespace dlib
{

// ----------------------------------------------------------------------------------------

    template <
        typename matrix_type, 
        typename in_sample_vector_type,
        typename in_scalar_vector_type
        >
    class oca_problem_c_svm : public oca_problem<matrix_type >
    {
    public:
        /*
            This class is used as part of the implementation of the svm_c_linear_trainer
            defined towards the end of this file.


            The bias parameter is dealt with by imagining that each sample vector has -1
            as its last element.
        */

        typedef typename matrix_type::type scalar_type;

        oca_problem_c_svm(
            const scalar_type C_pos,
            const scalar_type C_neg,
            const in_sample_vector_type& samples_,
            const in_scalar_vector_type& labels_,
            const bool be_verbose_,
            const scalar_type eps_,
            const unsigned long max_iter,
            const unsigned long dims_
        ) :
            samples(samples_),
            labels(labels_),
            C(std::min(C_pos,C_neg)),
            Cpos(C_pos/C),
            Cneg(C_neg/C),
            be_verbose(be_verbose_),
            eps(eps_),
            max_iterations(max_iter),
            dims(dims_)
        {
            dot_prods.resize(samples.size());
            is_first_call = true;
        }

        virtual scalar_type get_c (
        ) const 
        {
            return C;
        }

        virtual long get_num_dimensions (
        ) const 
        {
            // plus 1 for the bias term
            return dims + 1;
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
            if (be_verbose)
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

            if (num_iterations >= max_iterations)
                return true;

            if (current_risk_gap < eps)
                return true;

            return false;
        }

        virtual bool risk_has_lower_bound (
            scalar_type& lower_bound
        ) const 
        { 
            lower_bound = 0;
            return true; 
        }

        virtual void get_risk (
            matrix_type& w,
            scalar_type& risk,
            matrix_type& subgradient
        ) const 
        {
            line_search(w);

            subgradient.set_size(w.size(),1);
            subgradient = 0;
            risk = 0;


            // loop over all the samples and compute the risk and its subgradient at the current solution point w
            for (long i = 0; i < samples.size(); ++i)
            {
                // multiply current SVM output for the ith sample by its label
                const scalar_type df_val = labels(i)*dot_prods[i];

                if (labels(i) > 0)
                    risk += Cpos*std::max<scalar_type>(0.0,1 - df_val);
                else
                    risk += Cneg*std::max<scalar_type>(0.0,1 - df_val);

                if (df_val < 1)
                {
                    if (labels(i) > 0)
                    {
                        subtract_from(subgradient, samples(i), Cpos);

                        subgradient(subgradient.size()-1) += Cpos;
                    }
                    else
                    {
                        add_to(subgradient, samples(i), Cneg);

                        subgradient(subgradient.size()-1) -= Cneg;
                    }
                }
            }

            scalar_type scale = 1.0/samples.size();

            risk *= scale;
            subgradient = scale*subgradient;
        }

    private:

    // -----------------------------------------------------
    // -----------------------------------------------------

        void line_search (
            matrix_type& w
        ) const
        /*!
            ensures
                - does a line search to find a better w
                - for all i: #dot_prods[i] == dot(colm(#w,0,w.size()-1), samples(i)) - #w(w.size()-1)
        !*/
        {
            // The reason for using w_size_m1 and not just w.size()-1 is because
            // doing it this way avoids an inane warning from gcc that can occur in some cases.
            const long w_size_m1 = w.size()-1;
            for (long i = 0; i < samples.size(); ++i)
                dot_prods[i] = dot(colm(w,0,w_size_m1), samples(i)) - w(w_size_m1);

            if (is_first_call)
            {
                is_first_call = false;
                best_so_far = w;
                dot_prods_best = dot_prods;
            }
            else
            {
                // do line search going from best_so_far to w.  Store results in w.  
                // Here we use the line search algorithm presented in section 3.1.1 of Franc and Sonnenburg.

                const scalar_type A0 = length_squared(best_so_far - w);
                const scalar_type BB0 = dot(best_so_far, w - best_so_far);

                const scalar_type scale_pos = (get_c()*Cpos)/samples.size();
                const scalar_type scale_neg = (get_c()*Cneg)/samples.size();

                ks.clear();
                ks.reserve(samples.size());

                scalar_type f0 = BB0;
                for (long i = 0; i < samples.size(); ++i)
                {
                    const scalar_type& scale = (labels(i)>0) ? scale_pos : scale_neg;

                    const scalar_type B = scale*labels(i) * ( dot_prods_best[i] - dot_prods[i]);
                    const scalar_type C = scale*(1 - labels(i)* dot_prods_best[i]);
                    // Note that if B is 0 then it doesn't matter what k is set to.  So 0 is fine.
                    scalar_type k = 0;
                    if (B != 0)
                        k = -C/B;

                    if (k > 0)
                        ks.push_back(helper(k, std::abs(B)));

                    if ( (B < 0 && k > 0) || (B > 0 && k <= 0) )
                        f0 += B;
                }

                scalar_type opt_k = 1;
                // ks.size() == 0 shouldn't happen but check anyway
                if (f0 >= 0 || ks.size() == 0)
                {
                    // Getting here means that we aren't searching in a descent direction.  
                    // We could take a zero step but instead lets just assign w to the new best
                    // so far point just to make sure we don't get stuck coming back to this 
                    // case over and over.  This might happen if we never move the best point 
                    // seen so far.

                    // So we let opt_k be 1
                }
                else
                {
                    std::sort(ks.begin(), ks.end());

                    // figure out where f0 goes positive.
                    for (unsigned long i = 0; i < ks.size(); ++i)
                    {
                        f0 += ks[i].B;
                        if (f0 + A0*ks[i].k >= 0)
                        {
                            opt_k = ks[i].k;
                            break;
                        }
                    }

                }

                // Don't let the step size get too big.  Otherwise we might pick huge steps
                // over and over that don't improve the cutting plane approximation.  
                if (opt_k > 1.0)
                {
                    opt_k = 1.0;
                }

                // take the step suggested by the line search
                best_so_far = (1-opt_k)*best_so_far + opt_k*w;

                // update best_so_far dot products
                for (unsigned long i = 0; i < dot_prods_best.size(); ++i)
                    dot_prods_best[i] = (1-opt_k)*dot_prods_best[i] + opt_k*dot_prods[i];


                const scalar_type mu = 0.1;
                // Make sure we always take a little bit of a step towards w regardless of what the
                // line search says to do.  We do this since it is possible that some steps won't 
                // advance the best_so_far point. So this ensures we always make some progress each 
                // iteration.
                w = (1-mu)*best_so_far + mu*w;

                // update dot products
                for (unsigned long i = 0; i < dot_prods.size(); ++i)
                    dot_prods[i] = (1-mu)*dot_prods_best[i] + mu*dot_prods[i];
            }
        }

        struct helper
        {
            helper(scalar_type k_, scalar_type B_) : k(k_), B(B_) {}
            scalar_type k;
            scalar_type B;

            bool operator< (const helper& item) const { return k < item.k; }
        };

        mutable std::vector<helper> ks;

        mutable bool is_first_call;
        mutable std::vector<scalar_type> dot_prods;

        mutable matrix_type best_so_far;  // best w seen so far
        mutable std::vector<scalar_type> dot_prods_best; // dot products between best_so_far and samples


        const in_sample_vector_type& samples;
        const in_scalar_vector_type& labels;
        const scalar_type C;
        const scalar_type Cpos;
        const scalar_type Cneg;

        const bool be_verbose;
        const scalar_type eps;
        const unsigned long max_iterations;
        const unsigned long dims;
    };

// ----------------------------------------------------------------------------------------

    template <
        typename matrix_type, 
        typename in_sample_vector_type,
        typename in_scalar_vector_type,
        typename scalar_type
        >
    oca_problem_c_svm<matrix_type, in_sample_vector_type, in_scalar_vector_type> make_oca_problem_c_svm (
        const scalar_type C_pos,
        const scalar_type C_neg,
        const in_sample_vector_type& samples,
        const in_scalar_vector_type& labels,
        const bool be_verbose,
        const scalar_type eps,
        const unsigned long max_iterations,
        const unsigned long dims
    )
    {
        return oca_problem_c_svm<matrix_type, in_sample_vector_type, in_scalar_vector_type>(
            C_pos, C_neg, samples, labels, be_verbose, eps, max_iterations, dims);
    }

// ----------------------------------------------------------------------------------------

    template <
        typename K 
        >
    class svm_c_linear_trainer
    {

    public:
        typedef K kernel_type;
        typedef typename kernel_type::scalar_type scalar_type;
        typedef typename kernel_type::sample_type sample_type;
        typedef typename kernel_type::mem_manager_type mem_manager_type;
        typedef decision_function<kernel_type> trained_function_type;

        // You are getting a compiler error on this line because you supplied a non-linear kernel
        // to the svm_c_linear_trainer object.  You have to use one of the linear kernels with this
        // trainer.
        COMPILE_TIME_ASSERT((is_same_type<K, linear_kernel<sample_type> >::value ||
                             is_same_type<K, sparse_linear_kernel<sample_type> >::value ));

        svm_c_linear_trainer (
        )
        {
            Cpos = 1;
            Cneg = 1;
            verbose = false;
            eps = 0.001;
            max_iterations = 10000;
            learn_nonnegative_weights = false;
            last_weight_1 = false;
        }

        explicit svm_c_linear_trainer (
            const scalar_type& C 
        )
        {
            // make sure requires clause is not broken
            DLIB_ASSERT(C > 0,
                "\t svm_c_linear_trainer::svm_c_linear_trainer()"
                << "\n\t C must be greater than 0"
                << "\n\t C:    " << C 
                << "\n\t this: " << this
                );

            Cpos = C;
            Cneg = C;
            verbose = false;
            eps = 0.001;
            max_iterations = 10000;
            learn_nonnegative_weights = false;
            last_weight_1 = false;
        }

        void set_epsilon (
            scalar_type eps_
        )
        {
            // make sure requires clause is not broken
            DLIB_ASSERT(eps_ > 0,
                "\t void svm_c_linear_trainer::set_epsilon()"
                << "\n\t eps_ must be greater than 0"
                << "\n\t eps_: " << eps_ 
                << "\n\t this: " << this
                );

            eps = eps_;
        }

        const scalar_type get_epsilon (
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

        void be_quiet (
        )
        {
            verbose = false;
        }

        void set_oca (
            const oca& item
        )
        {
            solver = item;
        }

        const oca get_oca (
        ) const
        {
            return solver;
        }

        const kernel_type get_kernel (
        ) const
        {
            return kernel_type();
        }

        bool learns_nonnegative_weights (
        ) const { return learn_nonnegative_weights; }
       
        void set_learns_nonnegative_weights (
            bool value
        )
        {
            learn_nonnegative_weights = value;
            if (learn_nonnegative_weights)
                prior.set_size(0); 
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
            if (last_weight_1)
                prior.set_size(0);
        }

        void set_prior (
            const trained_function_type& prior_
        )
        {
            // make sure requires clause is not broken
            DLIB_ASSERT(prior_.basis_vectors.size() == 1 &&
                        prior_.alpha(0) == 1,
                "\t void svm_c_linear_trainer::set_prior()"
                << "\n\t The supplied prior could not have been created by this object's train() method."
                << "\n\t prior_.basis_vectors.size(): " << prior_.basis_vectors.size() 
                << "\n\t prior_.alpha(0):             " << prior_.alpha(0) 
                << "\n\t this: " << this
                );

            prior = sparse_to_dense(prior_.basis_vectors(0));
            prior_b = prior_.b;
            learn_nonnegative_weights = false;
            last_weight_1 = false;
        }

        bool has_prior (
        ) const
        {
            return prior.size() != 0;
        }

        void set_c (
            scalar_type C 
        )
        {
            // make sure requires clause is not broken
            DLIB_ASSERT(C > 0,
                "\t void svm_c_linear_trainer::set_c()"
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
                "\t void svm_c_linear_trainer::set_c_class1()"
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
                "\t void svm_c_linear_trainer::set_c_class2()"
                << "\n\t C must be greater than 0"
                << "\n\t C:    " << C 
                << "\n\t this: " << this
                );

            Cneg = C;
        }

        template <
            typename in_sample_vector_type,
            typename in_scalar_vector_type
            >
        const decision_function<kernel_type> train (
            const in_sample_vector_type& x,
            const in_scalar_vector_type& y
        ) const
        {
            scalar_type obj;
            return do_train(mat(x),mat(y),obj);
        }


        template <
            typename in_sample_vector_type,
            typename in_scalar_vector_type
            >
        const decision_function<kernel_type> train (
            const in_sample_vector_type& x,
            const in_scalar_vector_type& y,
            scalar_type& svm_objective
        ) const
        {
            return do_train(mat(x),mat(y),svm_objective);
        }

    private:

        template <
            typename in_sample_vector_type,
            typename in_scalar_vector_type
            >
        const decision_function<kernel_type> do_train (
            const in_sample_vector_type& x,
            const in_scalar_vector_type& y,
            scalar_type& svm_objective
        ) const
        {
            // make sure requires clause is not broken
            DLIB_ASSERT(is_learning_problem(x,y) == true,
                "\t decision_function svm_c_linear_trainer::train(x,y)"
                << "\n\t invalid inputs were given to this function"
                << "\n\t x.nr(): " << x.nr() 
                << "\n\t y.nr(): " << y.nr() 
                << "\n\t x.nc(): " << x.nc() 
                << "\n\t y.nc(): " << y.nc() 
                << "\n\t is_learning_problem(x,y): " << is_learning_problem(x,y)
                );
#ifdef ENABLE_ASSERTS
            for (long i = 0; i < x.size(); ++i)
            {
                DLIB_ASSERT(y(i) == +1 || y(i) == -1,
                    "\t decision_function svm_c_linear_trainer::train(x,y)"
                    << "\n\t invalid inputs were given to this function"
                    << "\n\t y("<<i<<"): " << y(i)
                );
            }
#endif


            typedef matrix<scalar_type,0,1> w_type;
            w_type w;

            const unsigned long num_dims = max_index_plus_one(x);

            unsigned long num_nonnegative = 0;
            if (learn_nonnegative_weights)
            {
                num_nonnegative = num_dims;
            }

            unsigned long force_weight_1_idx = std::numeric_limits<unsigned long>::max(); 
            if (last_weight_1)
            {
                force_weight_1_idx = num_dims-1; 
            }


            if (has_prior())
            {
                if (is_matrix<sample_type>::value)
                {
                    // make sure requires clause is not broken
                    DLIB_CASSERT(num_dims == (unsigned long)prior.size(),
                        "\t decision_function svm_c_linear_trainer::train(x,y)"
                        << "\n\t The dimension of the training vectors must match the dimension of\n"
                        << "\n\t those used to create the prior."
                        << "\n\t num_dims:     " << num_dims 
                        << "\n\t prior.size(): " << prior.size() 
                    );
                }
                const unsigned long dims = std::max(num_dims, (unsigned long)prior.size());
                // In the case of sparse sample vectors, it is possible that the input
                // vector dimensionality is larger than the prior vector dimensionality.
                // We need to check for this case and pad prior with zeros if it is the
                // case.
                matrix<scalar_type,0,1> prior_temp = join_cols(join_cols(prior, 
                                                                         zeros_matrix<scalar_type>(dims-prior.size(),1)),
                                                                         mat(prior_b));

                svm_objective = solver(
                    make_oca_problem_c_svm<w_type>(Cpos, Cneg, x, y, verbose, eps, max_iterations, dims), 
                    w,
                    prior_temp);
            }
            else
            {
                svm_objective = solver(
                    make_oca_problem_c_svm<w_type>(Cpos, Cneg, x, y, verbose, eps, max_iterations, num_dims), 
                    w,
                    num_nonnegative,
                    force_weight_1_idx);
            }

            // put the solution into a decision function and then return it
            decision_function<kernel_type> df;
            df.b = static_cast<scalar_type>(w(w.size()-1));
            df.basis_vectors.set_size(1);
            // Copy the plane normal into the output basis vector.  The output vector might be a
            // sparse vector container so we need to use this special kind of copy to handle that case.
            // As an aside, the reason for using max_index_plus_one() and not just w.size()-1 is because
            // doing it this way avoids an inane warning from gcc that can occur in some cases.
            const long out_size = max_index_plus_one(x);
            assign(df.basis_vectors(0), matrix_cast<scalar_type>(colm(w, 0, out_size)));
            df.alpha.set_size(1);
            df.alpha(0) = 1;

            return df;
        }
        
        scalar_type Cpos;
        scalar_type Cneg;
        oca solver;
        scalar_type eps;
        bool verbose;
        unsigned long max_iterations;
        bool learn_nonnegative_weights;
        bool last_weight_1;
        matrix<scalar_type,0,1> prior;
        scalar_type prior_b;
    }; 

// ----------------------------------------------------------------------------------------

}

// ----------------------------------------------------------------------------------------


#endif // DLIB_SVM_C_LiNEAR_TRAINER_Hh_

