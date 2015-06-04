// Copyright (C) 2013  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#ifndef DLIB_SVR_LINEAR_TrAINER_Hh_
#define DLIB_SVR_LINEAR_TrAINER_Hh_

#include "svr_linear_trainer_abstract.h"

#include "../algs.h"
#include "../optimization.h"
#include "function.h"
#include "kernel.h"
#include "sparse_vector.h"
#include <iostream>

namespace dlib
{

// ----------------------------------------------------------------------------------------

    template <
        typename matrix_type, 
        typename sample_type 
        >
    class oca_problem_linear_svr : public oca_problem<matrix_type >
    {
    public:
        /*
            This class is used as part of the implementation of the svr_linear_trainer 
            defined towards the end of this file.
        */

        typedef typename matrix_type::type scalar_type;

        oca_problem_linear_svr(
            const scalar_type C_,
            const std::vector<sample_type>& samples_,
            const std::vector<scalar_type>& targets_,
            const bool be_verbose_,
            const scalar_type eps_,
            const scalar_type eps_insensitivity_,
            const unsigned long max_iter
        ) :
            samples(samples_),
            targets(targets_),
            C(C_),
            be_verbose(be_verbose_),
            eps(eps_),
            eps_insensitivity(eps_insensitivity_),
            max_iterations(max_iter)
        {
        }

        virtual scalar_type get_c (
        ) const 
        {
            return C;
        }

        virtual long get_num_dimensions (
        ) const 
        {
            // plus one for the bias term
            return max_index_plus_one(samples) + 1;
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
            current_risk_value /= samples.size();
            current_risk_gap /= samples.size();
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

            if (current_risk_gap < eps*eps_insensitivity)
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
            subgradient.set_size(w.size(),1);
            subgradient = 0;
            risk = 0;

            // loop over all the samples and compute the risk and its subgradient at the current solution point w
            for (unsigned long i = 0; i < samples.size(); ++i)
            {
                const long w_size_m1 = w.size()-1;
                const scalar_type prediction = dot(colm(w,0,w_size_m1), samples[i]) - w(w_size_m1);

                if (std::abs(prediction - targets[i]) > eps_insensitivity)
                {
                    if (prediction < targets[i])
                    {
                        subtract_from(subgradient, samples[i]); 
                        subgradient(w_size_m1) += 1;
                    }
                    else
                    {
                        add_to(subgradient, samples[i]); 
                        subgradient(w_size_m1) -= 1;
                    }

                    risk += std::abs(prediction - targets[i]) - eps_insensitivity;
                }
            }
        }

    private:

    // -----------------------------------------------------
    // -----------------------------------------------------


        const std::vector<sample_type>& samples;
        const std::vector<scalar_type>& targets;
        const scalar_type C;

        const bool be_verbose;
        const scalar_type eps;
        const scalar_type eps_insensitivity;
        const unsigned long max_iterations;
    };

// ----------------------------------------------------------------------------------------

    template <
        typename matrix_type, 
        typename sample_type,
        typename scalar_type
        >
    oca_problem_linear_svr<matrix_type, sample_type> make_oca_problem_linear_svr (
        const scalar_type C,
        const std::vector<sample_type>& samples,
        const std::vector<scalar_type>& targets,
        const bool be_verbose,
        const scalar_type eps,
        const scalar_type eps_insensitivity,
        const unsigned long max_iterations
    )
    {
        return oca_problem_linear_svr<matrix_type, sample_type>(
            C, samples, targets, be_verbose, eps, eps_insensitivity, max_iterations);
    }

// ----------------------------------------------------------------------------------------

    template <
        typename K 
        >
    class svr_linear_trainer
    {

    public:
        typedef K kernel_type;
        typedef typename kernel_type::scalar_type scalar_type;
        typedef typename kernel_type::sample_type sample_type;
        typedef typename kernel_type::mem_manager_type mem_manager_type;
        typedef decision_function<kernel_type> trained_function_type;

        // You are getting a compiler error on this line because you supplied a non-linear kernel
        // to the svr_linear_trainer object.  You have to use one of the linear kernels with this
        // trainer.
        COMPILE_TIME_ASSERT((is_same_type<K, linear_kernel<sample_type> >::value ||
                             is_same_type<K, sparse_linear_kernel<sample_type> >::value ));

        svr_linear_trainer (
        )
        {
            C = 1;
            verbose = false;
            eps = 0.01;
            max_iterations = 10000;
            learn_nonnegative_weights = false;
            last_weight_1 = false;
            eps_insensitivity = 0.1;
        }

        explicit svr_linear_trainer (
            const scalar_type& C_ 
        )
        {
            // make sure requires clause is not broken
            DLIB_ASSERT(C_ > 0,
                "\t svr_linear_trainer::svr_linear_trainer()"
                << "\n\t C_ must be greater than 0"
                << "\n\t C_:    " << C_ 
                << "\n\t this: " << this
                );

            C = C_;
            verbose = false;
            eps = 0.01;
            max_iterations = 10000;
            learn_nonnegative_weights = false;
            last_weight_1 = false;
            eps_insensitivity = 0.1;
        }

        void set_epsilon (
            scalar_type eps_
        )
        {
            // make sure requires clause is not broken
            DLIB_ASSERT(eps_ > 0,
                "\t void svr_linear_trainer::set_epsilon()"
                << "\n\t eps_ must be greater than 0"
                << "\n\t eps_: " << eps_ 
                << "\n\t this: " << this
                );

            eps = eps_;
        }

        const scalar_type get_epsilon (
        ) const { return eps; }

        void set_epsilon_insensitivity (
            scalar_type eps_
        )
        {
            // make sure requires clause is not broken
            DLIB_ASSERT(eps_ > 0,
                "\tvoid svr_linear_trainer::set_epsilon_insensitivity(eps_)"
                << "\n\t invalid inputs were given to this function"
                << "\n\t eps_: " << eps_ 
                );
            eps_insensitivity = eps_;
        }

        const scalar_type get_epsilon_insensitivity (
        ) const
        { 
            return eps_insensitivity;
        }

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
        }

        void set_c (
            scalar_type C_ 
        )
        {
            // make sure requires clause is not broken
            DLIB_ASSERT(C_ > 0,
                "\t void svr_linear_trainer::set_c()"
                << "\n\t C_ must be greater than 0"
                << "\n\t C_:    " << C_ 
                << "\n\t this: " << this
                );

            C = C_;
        }

        const scalar_type get_c (
        ) const
        {
            return C;
        }

        const decision_function<kernel_type> train (
            const std::vector<sample_type>& samples,
            const std::vector<scalar_type>& targets
        ) const
        {
            // make sure requires clause is not broken
            DLIB_CASSERT(is_learning_problem(samples, targets) == true,
                "\t decision_function svr_linear_trainer::train(samples, targets)"
                << "\n\t invalid inputs were given to this function"
                << "\n\t samples.size(): " << samples.size() 
                << "\n\t targets.size(): " << targets.size() 
                << "\n\t is_learning_problem(samples,targets): " << is_learning_problem(samples,targets)
                );


            typedef matrix<scalar_type,0,1> w_type;
            w_type w;

            const unsigned long num_dims = max_index_plus_one(samples);

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

            solver( make_oca_problem_linear_svr<w_type>(C, samples, targets, verbose, eps, eps_insensitivity, max_iterations), 
                    w, 
                    num_nonnegative,
                    force_weight_1_idx);


            // put the solution into a decision function and then return it
            decision_function<kernel_type> df;
            df.b = static_cast<scalar_type>(w(w.size()-1));
            df.basis_vectors.set_size(1);
            // Copy the plane normal into the output basis vector.  The output vector might be a
            // sparse vector container so we need to use this special kind of copy to handle that case.
            // As an aside, the reason for using max_index_plus_one() and not just w.size()-1 is because
            // doing it this way avoids an inane warning from gcc that can occur in some cases.
            const long out_size = max_index_plus_one(samples);
            assign(df.basis_vectors(0), matrix_cast<scalar_type>(colm(w, 0, out_size)));
            df.alpha.set_size(1);
            df.alpha(0) = 1;

            return df;
        }

    private:

        scalar_type C;
        oca solver;
        scalar_type eps;
        bool verbose;
        unsigned long max_iterations;
        bool learn_nonnegative_weights;
        bool last_weight_1;
        scalar_type eps_insensitivity;
    }; 

// ----------------------------------------------------------------------------------------

}

#endif // DLIB_SVR_LINEAR_TrAINER_Hh_

