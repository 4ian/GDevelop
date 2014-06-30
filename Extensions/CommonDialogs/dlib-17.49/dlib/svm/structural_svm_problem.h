// Copyright (C) 2011  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#ifndef DLIB_STRUCTURAL_SVM_PRObLEM_H__
#define DLIB_STRUCTURAL_SVM_PRObLEM_H__

#include "structural_svm_problem_abstract.h"
#include "../algs.h"
#include <vector>
#include "../optimization/optimization_oca.h"
#include "../matrix.h"
#include "sparse_vector.h"
#include <iostream>

namespace dlib
{

// ----------------------------------------------------------------------------------------

    template <
        typename structural_svm_problem
        >
    class cache_element_structural_svm 
    {
    public:

        cache_element_structural_svm (
        ) : prob(0), sample_idx(0) {}

        typedef typename structural_svm_problem::scalar_type scalar_type;
        typedef typename structural_svm_problem::matrix_type matrix_type;
        typedef typename structural_svm_problem::feature_vector_type feature_vector_type;

        void init (
            const structural_svm_problem* prob_,
            const long idx
        )
        /*!
            ensures
                - This object will be a cache for the idx-th sample in the given
                  structural_svm_problem.
        !*/
        {
            prob = prob_;
            sample_idx = idx;

            loss.clear();
            psi.clear();
            lru_count.clear();

            if (prob->get_max_cache_size() != 0)
                prob->get_truth_joint_feature_vector(idx, true_psi);
        }

        void get_truth_joint_feature_vector_cached (
            feature_vector_type& psi 
        ) const
        {
            if (prob->get_max_cache_size() != 0)
                psi = true_psi;
            else
                prob->get_truth_joint_feature_vector(sample_idx, psi);
        }

        void separation_oracle_cached (
            const bool skip_cache,
            const scalar_type& cur_risk_lower_bound,
            const matrix_type& current_solution,
            scalar_type& out_loss,
            feature_vector_type& out_psi
        ) const
        {
            if (!skip_cache && prob->get_max_cache_size() != 0)
            {
                scalar_type best_risk = -std::numeric_limits<scalar_type>::infinity();
                unsigned long best_idx = 0;


                const scalar_type dot_true_psi = dot(true_psi, current_solution);

                // figure out which element in the cache is the best (i.e. has the biggest risk)
                long max_lru_count = 0;
                for (unsigned long i = 0; i < loss.size(); ++i)
                {
                    const scalar_type risk = loss[i] + dot(psi[i], current_solution) - dot_true_psi;
                    if (risk > best_risk)
                    {
                        best_risk = risk;
                        out_loss = loss[i];
                        best_idx = i;
                    }
                    if (lru_count[i] > max_lru_count)
                        max_lru_count = lru_count[i];
                }

                if (best_risk - cur_risk_lower_bound > prob->get_epsilon())
                {
                    out_psi = psi[best_idx];
                    lru_count[best_idx] = max_lru_count + 1;
                    return;
                }
            }


            prob->separation_oracle(sample_idx, current_solution, out_loss, out_psi);

            if (prob->get_max_cache_size() == 0)
                return;

            // if the cache is full
            if (loss.size() >= prob->get_max_cache_size())
            {
                // find least recently used cache entry for idx-th sample
                const long i       = index_of_min(vector_to_matrix(lru_count));

                // save our new data in the cache
                loss[i] = out_loss;
                psi[i]  = out_psi;

                const long max_use = max(vector_to_matrix(lru_count));
                // Make sure this new cache entry has the best lru count since we have used
                // it most recently.
                lru_count[i] = max_use + 1;
            }
            else
            {
                loss.push_back(out_loss);
                psi.push_back(out_psi);
                long max_use = 1;
                if (lru_count.size() != 0)
                    max_use = max(vector_to_matrix(lru_count)) + 1;
                lru_count.push_back(max_use);
            }
        }

        const structural_svm_problem* prob;

        long sample_idx;

        mutable feature_vector_type true_psi;
        mutable std::vector<scalar_type> loss;
        mutable std::vector<feature_vector_type> psi;
        mutable std::vector<long> lru_count;
    };

// ----------------------------------------------------------------------------------------

    template <
        typename matrix_type_,
        typename feature_vector_type_ = matrix_type_
        >
    class structural_svm_problem : public oca_problem<matrix_type_> 
    {
    public:
        /*!
            CONVENTION
                - C == get_c()
                - eps == get_epsilon()
                - if (skip_cache) then
                    - we won't use the oracle cache when we need to evaluate the separation
                      oracle. Instead, we will directly call the user supplied separation_oracle().

                - get_max_cache_size() == max_cache_size

                - if (cache.size() != 0) then
                    - cache.size() == get_num_samples()
                    - for all i: cache[i] == the cached results of calls to separation_oracle()
                      for the i-th sample.
        !*/

        typedef matrix_type_ matrix_type;
        typedef typename matrix_type::type scalar_type;
        typedef feature_vector_type_ feature_vector_type;

        structural_svm_problem (
        ) :
            cur_risk_lower_bound(0),
            eps(0.001),
            verbose(false),
            skip_cache(true),
            max_cache_size(10),
            C(1)
        {}

        void set_epsilon (
            scalar_type eps_
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

        const scalar_type get_epsilon (
        ) const { return eps; }

        void set_max_cache_size (
            unsigned long max_size
        )
        {
            max_cache_size = max_size;
        }

        unsigned long get_max_cache_size (
        ) const { return max_cache_size; }

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

        scalar_type get_c (
        ) const { return C; }

        void set_c (
            scalar_type C_
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

        virtual long get_num_dimensions (
        ) const = 0;

        virtual long get_num_samples (
        ) const = 0;

        virtual void get_truth_joint_feature_vector (
            long idx,
            feature_vector_type& psi 
        ) const = 0;

        virtual void separation_oracle (
            const long idx,
            const matrix_type& current_solution,
            scalar_type& loss,
            feature_vector_type& psi
        ) const = 0;

    private:

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

        virtual void get_risk (
            matrix_type& w,
            scalar_type& risk,
            matrix_type& subgradient
        ) const 
        {
            feature_vector_type ftemp;
            const unsigned long num = get_num_samples();

            // initialize the cache and compute psi_true.
            if (cache.size() == 0)
            {
                cache.resize(get_num_samples());
                for (unsigned long i = 0; i < cache.size(); ++i)
                    cache[i].init(this,i);

                psi_true.set_size(w.size(),1);
                psi_true = 0;

                for (unsigned long i = 0; i < num; ++i)
                {
                    cache[i].get_truth_joint_feature_vector_cached(ftemp);

                    subtract_from(psi_true, ftemp);
                }
            }

            subgradient = psi_true;
            scalar_type total_loss = 0;
            call_separation_oracle_on_all_samples(w,subgradient,total_loss);

            subgradient /= num;
            total_loss /= num;
            risk = total_loss + dot(subgradient,w);
        }

        virtual void call_separation_oracle_on_all_samples (
            matrix_type& w,
            matrix_type& subgradient,
            scalar_type& total_loss
        ) const
        {
            feature_vector_type ftemp;
            const unsigned long num = get_num_samples();
            for (unsigned long i = 0; i < num; ++i)
            {
                scalar_type loss;
                separation_oracle_cached(i, w, loss, ftemp);
                total_loss += loss;
                add_to(subgradient, ftemp);
            }
        }

    protected:
        void separation_oracle_cached (
            const long idx,
            const matrix_type& current_solution,
            scalar_type& loss,
            feature_vector_type& psi
        ) const 
        {
            cache[idx].separation_oracle_cached(skip_cache, 
                                                cur_risk_lower_bound,
                                                current_solution,
                                                loss,
                                                psi);
        }
    private:


        mutable scalar_type cur_risk_lower_bound;
        mutable matrix_type psi_true;
        scalar_type eps;
        mutable bool verbose;


        mutable std::vector<cache_element_structural_svm<structural_svm_problem> > cache;
        mutable bool skip_cache;
        unsigned long max_cache_size;

        scalar_type C;
    };

// ----------------------------------------------------------------------------------------

}

#endif // DLIB_STRUCTURAL_SVM_PRObLEM_H__

