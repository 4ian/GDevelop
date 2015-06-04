// Copyright (C) 2012  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#ifndef DLIB_SVM_RANK_TrAINER_Hh_
#define DLIB_SVM_RANK_TrAINER_Hh_

#include "svm_rank_trainer_abstract.h"

#include "ranking_tools.h"
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
    class oca_problem_ranking_svm : public oca_problem<matrix_type >
    {
    public:
        /*
            This class is used as part of the implementation of the svm_rank_trainer
            defined towards the end of this file.
        */

        typedef typename matrix_type::type scalar_type;

        oca_problem_ranking_svm(
            const scalar_type C_,
            const std::vector<ranking_pair<sample_type> >& samples_,
            const bool be_verbose_,
            const scalar_type eps_,
            const unsigned long max_iter,
            const unsigned long dims_
        ) :
            samples(samples_),
            C(C_),
            be_verbose(be_verbose_),
            eps(eps_),
            max_iterations(max_iter),
            dims(dims_)
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
            return dims;
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
            subgradient.set_size(w.size(),1);
            subgradient = 0;
            risk = 0;

            // Note that we want the risk value to be in terms of the fraction of overall
            // rank flips.  So a risk of 0.1 would mean that rank flips happen < 10% of the
            // time.


            std::vector<double> rel_scores;
            std::vector<double> nonrel_scores;
            std::vector<unsigned long> rel_counts;
            std::vector<unsigned long> nonrel_counts;

            unsigned long total_pairs = 0;

            // loop over all the samples and compute the risk and its subgradient at the current solution point w
            for (unsigned long i = 0; i < samples.size(); ++i)
            {
                rel_scores.resize(samples[i].relevant.size());
                nonrel_scores.resize(samples[i].nonrelevant.size());

                for (unsigned long k = 0; k < rel_scores.size(); ++k)
                    rel_scores[k] = dot(samples[i].relevant[k], w);

                for (unsigned long k = 0; k < nonrel_scores.size(); ++k)
                    nonrel_scores[k] = dot(samples[i].nonrelevant[k], w) + 1;

                count_ranking_inversions(rel_scores, nonrel_scores, rel_counts, nonrel_counts);

                total_pairs += rel_scores.size()*nonrel_scores.size();

                for (unsigned long k = 0; k < rel_counts.size(); ++k)
                {
                    if (rel_counts[k] != 0)
                    {
                        risk -= rel_counts[k]*rel_scores[k];
                        subtract_from(subgradient, samples[i].relevant[k], rel_counts[k]); 
                    }
                }

                for (unsigned long k = 0; k < nonrel_counts.size(); ++k)
                {
                    if (nonrel_counts[k] != 0)
                    {
                        risk += nonrel_counts[k]*nonrel_scores[k];
                        add_to(subgradient, samples[i].nonrelevant[k], nonrel_counts[k]); 
                    }
                }

            }

            const scalar_type scale = 1.0/total_pairs;

            risk *= scale;
            subgradient = scale*subgradient;
        }

    private:

    // -----------------------------------------------------
    // -----------------------------------------------------


        const std::vector<ranking_pair<sample_type> >& samples;
        const scalar_type C;

        const bool be_verbose;
        const scalar_type eps;
        const unsigned long max_iterations;
        const unsigned long dims;
    };

// ----------------------------------------------------------------------------------------

    template <
        typename matrix_type, 
        typename sample_type,
        typename scalar_type
        >
    oca_problem_ranking_svm<matrix_type, sample_type> make_oca_problem_ranking_svm (
        const scalar_type C,
        const std::vector<ranking_pair<sample_type> >& samples,
        const bool be_verbose,
        const scalar_type eps,
        const unsigned long max_iterations,
        const unsigned long dims
    )
    {
        return oca_problem_ranking_svm<matrix_type, sample_type>(
            C, samples, be_verbose, eps, max_iterations, dims);
    }

// ----------------------------------------------------------------------------------------

    template <
        typename K 
        >
    class svm_rank_trainer
    {

    public:
        typedef K kernel_type;
        typedef typename kernel_type::scalar_type scalar_type;
        typedef typename kernel_type::sample_type sample_type;
        typedef typename kernel_type::mem_manager_type mem_manager_type;
        typedef decision_function<kernel_type> trained_function_type;

        // You are getting a compiler error on this line because you supplied a non-linear kernel
        // to the svm_rank_trainer object.  You have to use one of the linear kernels with this
        // trainer.
        COMPILE_TIME_ASSERT((is_same_type<K, linear_kernel<sample_type> >::value ||
                             is_same_type<K, sparse_linear_kernel<sample_type> >::value ));

        svm_rank_trainer (
        )
        {
            C = 1;
            verbose = false;
            eps = 0.001;
            max_iterations = 10000;
            learn_nonnegative_weights = false;
            last_weight_1 = false;
        }

        explicit svm_rank_trainer (
            const scalar_type& C_ 
        )
        {
            // make sure requires clause is not broken
            DLIB_ASSERT(C_ > 0,
                "\t svm_rank_trainer::svm_rank_trainer()"
                << "\n\t C_ must be greater than 0"
                << "\n\t C_:    " << C_ 
                << "\n\t this: " << this
                );

            C = C_;
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
                "\t void svm_rank_trainer::set_epsilon()"
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

        void set_prior (
            const trained_function_type& prior_
        )
        {
            // make sure requires clause is not broken
            DLIB_ASSERT(prior_.basis_vectors.size() == 1 &&
                        prior_.alpha(0) == 1,
                "\t void svm_rank_trainer::set_prior()"
                << "\n\t The supplied prior could not have been created by this object's train() method."
                << "\n\t prior_.basis_vectors.size(): " << prior_.basis_vectors.size() 
                << "\n\t prior_.alpha(0):             " << prior_.alpha(0) 
                << "\n\t this: " << this
                );

            prior = sparse_to_dense(prior_.basis_vectors(0));
            learn_nonnegative_weights = false;
            last_weight_1 = false;
        }

        bool has_prior (
        ) const
        {
            return prior.size() != 0;
        }

        void set_c (
            scalar_type C_ 
        )
        {
            // make sure requires clause is not broken
            DLIB_ASSERT(C_ > 0,
                "\t void svm_rank_trainer::set_c()"
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
            const std::vector<ranking_pair<sample_type> >& samples
        ) const
        {
            // make sure requires clause is not broken
            DLIB_CASSERT(is_ranking_problem(samples) == true,
                "\t decision_function svm_rank_trainer::train(samples)"
                << "\n\t invalid inputs were given to this function"
                << "\n\t samples.size(): " << samples.size() 
                << "\n\t is_ranking_problem(samples): " << is_ranking_problem(samples)
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

            if (has_prior())
            {
                if (is_matrix<sample_type>::value)
                {
                    // make sure requires clause is not broken
                    DLIB_CASSERT(num_dims == (unsigned long)prior.size(),
                        "\t decision_function svm_rank_trainer::train(samples)"
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
                if ((unsigned long)prior.size() < dims)
                {
                    matrix<scalar_type,0,1> prior_temp = join_cols(prior, zeros_matrix<scalar_type>(dims-prior.size(),1));
                    solver( make_oca_problem_ranking_svm<w_type>(C, samples, verbose, eps, max_iterations, dims), 
                        w, 
                        prior_temp);
                }
                else
                {
                    solver( make_oca_problem_ranking_svm<w_type>(C, samples, verbose, eps, max_iterations, dims), 
                        w, 
                        prior);
                }

            }
            else
            {
                solver( make_oca_problem_ranking_svm<w_type>(C, samples, verbose, eps, max_iterations, num_dims), 
                    w, 
                    num_nonnegative,
                    force_weight_1_idx);
            }


            // put the solution into a decision function and then return it
            decision_function<kernel_type> df;
            df.b = 0;
            df.basis_vectors.set_size(1);
            // Copy the results into the output basis vector.  The output vector might be a
            // sparse vector container so we need to use this special kind of copy to
            // handle that case.
            assign(df.basis_vectors(0), matrix_cast<scalar_type>(w));
            df.alpha.set_size(1);
            df.alpha(0) = 1;

            return df;
        }

        const decision_function<kernel_type> train (
            const ranking_pair<sample_type>& sample
        ) const
        {
            return train(std::vector<ranking_pair<sample_type> >(1, sample));
        }

    private:

        scalar_type C;
        oca solver;
        scalar_type eps;
        bool verbose;
        unsigned long max_iterations;
        bool learn_nonnegative_weights;
        bool last_weight_1;
        matrix<scalar_type,0,1> prior;
    }; 

// ----------------------------------------------------------------------------------------

}

#endif // DLIB_SVM_RANK_TrAINER_Hh_

