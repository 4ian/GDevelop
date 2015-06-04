// Copyright (C) 2011  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#ifndef DLIB_STRUCTURAL_SVM_PRObLEM_Hh_
#define DLIB_STRUCTURAL_SVM_PRObLEM_Hh_

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

    namespace impl
    {
        struct nuclear_norm_regularizer
        {
            long first_dimension;
            long nr;
            long nc;
            double regularization_strength;
        };
    }

// ----------------------------------------------------------------------------------------

    template <
        typename structural_svm_problem
        >
    class cache_element_structural_svm 
    {
    public:

        cache_element_structural_svm (
        ) : prob(0), sample_idx(0), last_true_risk_computed(std::numeric_limits<double>::infinity()) {}

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
            {
                prob->get_truth_joint_feature_vector(idx, true_psi);
                compact_sparse_vector(true_psi);
            }
        }

        void get_truth_joint_feature_vector_cached (
            feature_vector_type& psi 
        ) const
        {
            if (prob->get_max_cache_size() != 0)
                psi = true_psi;
            else
                prob->get_truth_joint_feature_vector(sample_idx, psi);

            if (is_matrix<feature_vector_type>::value)
            {
                DLIB_CASSERT((long)psi.size() == prob->get_num_dimensions(),
                    "The dimensionality of your PSI vector doesn't match get_num_dimensions()");
            }
        }

        void separation_oracle_cached (
            const bool use_only_cache,
            const bool skip_cache,
            const scalar_type& saved_current_risk_gap,
            const matrix_type& current_solution,
            scalar_type& out_loss,
            feature_vector_type& out_psi
        ) const
        {
            const bool cache_enabled = prob->get_max_cache_size() != 0;

            // Don't waste time computing this if the cache isn't going to be used.
            const scalar_type dot_true_psi = cache_enabled ? dot(true_psi, current_solution) : 0;

            scalar_type best_risk = -std::numeric_limits<scalar_type>::infinity();
            unsigned long best_idx = 0;
            long max_lru_count = 0;
            if (cache_enabled)
            {
                // figure out which element in the cache is the best (i.e. has the biggest risk)
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

                if (!skip_cache)
                {
                    // Check if the best psi vector in the cache is still good enough to use as
                    // a proxy for the true separation oracle.  If the risk value has dropped
                    // by enough to get into the stopping condition then the best psi isn't
                    // good enough. 
                    if ((best_risk + saved_current_risk_gap > last_true_risk_computed &&
                        best_risk >= 0) || use_only_cache)
                    {
                        out_psi = psi[best_idx];
                        lru_count[best_idx] = max_lru_count + 1;
                        return;
                    }
                }
            }


            prob->separation_oracle(sample_idx, current_solution, out_loss, out_psi);
            if (is_matrix<feature_vector_type>::value)
            {
                DLIB_CASSERT((long)out_psi.size() == prob->get_num_dimensions(),
                    "The dimensionality of your PSI vector doesn't match get_num_dimensions()");
            }

            if (!cache_enabled)
                return;

            compact_sparse_vector(out_psi);

            last_true_risk_computed = out_loss + dot(out_psi, current_solution) - dot_true_psi;

            // If the separation oracle is only solved approximately then the result might
            // not be as good as just selecting true_psi as the output.  So here we check
            // if that is the case. 
            if (last_true_risk_computed < 0 && best_risk < 0)
            {
                out_psi = true_psi;
                out_loss = 0;
            }
            // Alternatively, an approximate separation oracle might not do as well as just
            // selecting from the cache.  So if that is the case when just take the best
            // element from the cache.
            else if (last_true_risk_computed < best_risk) 
            {
                out_psi = psi[best_idx];
                out_loss = loss[best_idx];
                lru_count[best_idx] = max_lru_count + 1;
            }
            // if the cache is full
            else if (loss.size() >= prob->get_max_cache_size())
            {
                // find least recently used cache entry for idx-th sample
                const long i       = index_of_min(mat(lru_count));

                // save our new data in the cache
                loss[i] = out_loss;
                psi[i]  = out_psi;

                const long max_use = max(mat(lru_count));
                // Make sure this new cache entry has the best lru count since we have used
                // it most recently.
                lru_count[i] = max_use + 1;
            }
            else
            {
                // In this case we just append the new psi into the cache.

                loss.push_back(out_loss);
                psi.push_back(out_psi);
                long max_use = 1;
                if (lru_count.size() != 0)
                    max_use = max(mat(lru_count)) + 1;
                lru_count.push_back(max_use);
            }
        }

    private:
        // Do nothing if T isn't actually a sparse vector
        template <typename T> void compact_sparse_vector( T& ) const { }

        template <
            typename T,
            typename U,
            typename alloc
            >
        void compact_sparse_vector (
            std::vector<std::pair<T,U>,alloc>& vect
        ) const
        {
            // If the sparse vector has more entires than dimensions then it must have some 
            // duplicate elements.  So compact them using make_sparse_vector_inplace().
            if (vect.size() > (unsigned long)prob->get_num_dimensions())
            {
                make_sparse_vector_inplace(vect);
                // make sure the vector doesn't use more RAM than is necessary
                std::vector<std::pair<T,U>,alloc>(vect).swap(vect);
            }
        }

        const structural_svm_problem* prob;

        long sample_idx;

        mutable feature_vector_type true_psi;
        mutable std::vector<scalar_type> loss;
        mutable std::vector<feature_vector_type> psi;
        mutable std::vector<long> lru_count;
        mutable double last_true_risk_computed;
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
                - max_iterations == get_max_iterations()
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
            saved_current_risk_gap(0),
            eps(0.001),
            max_iterations(10000),
            verbose(false),
            skip_cache(true),
            count_below_eps(0),
            max_cache_size(5),
            converged(false),
            nuclear_norm_part(0),
            cache_based_eps(std::numeric_limits<scalar_type>::infinity()),
            C(1)
        {}

        scalar_type get_cache_based_epsilon (
        ) const
        {
            return cache_based_eps;
        }

        void set_cache_based_epsilon (
            scalar_type eps_
        )
        {
            // make sure requires clause is not broken
            DLIB_ASSERT(eps_ > 0,
                "\t void structural_svm_problem::set_cache_based_epsilon()"
                << "\n\t eps_ must be greater than 0"
                << "\n\t eps_: " << eps_ 
                << "\n\t this: " << this
                );

            cache_based_eps = eps_;
        }

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

        unsigned long get_max_iterations (
        ) const { return max_iterations; }

        void set_max_iterations (
            unsigned long max_iter
        ) 
        {
            max_iterations = max_iter;
        }

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

        void add_nuclear_norm_regularizer (
            long first_dimension,
            long rows,
            long cols,
            double regularization_strength
        )
        {
            // make sure requires clause is not broken
            DLIB_ASSERT(0 <= first_dimension && first_dimension < get_num_dimensions() &&
                0 <= rows && 0 <= cols && rows*cols+first_dimension <= get_num_dimensions() &&
                0 < regularization_strength,
                "\t void structural_svm_problem::add_nuclear_norm_regularizer()"
                << "\n\t Invalid arguments were given to this function."
                << "\n\t first_dimension:         " << first_dimension 
                << "\n\t rows:                    " << rows 
                << "\n\t cols:                    " << cols 
                << "\n\t get_num_dimensions():    " << get_num_dimensions() 
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
                if (nuclear_norm_regularizers.size() != 0)
                {
                    cout << "objective:             " << current_objective_value << endl;
                    cout << "objective gap:         " << current_error_gap << endl;
                    cout << "risk:                  " << current_risk_value-nuclear_norm_part << endl;
                    cout << "risk+nuclear norm:     " << current_risk_value << endl;
                    cout << "risk+nuclear norm gap: " << current_risk_gap << endl;
                    cout << "num planes:            " << num_cutting_planes << endl;
                    cout << "iter:                  " << num_iterations << endl;
                }
                else
                {
                    cout << "objective:     " << current_objective_value << endl;
                    cout << "objective gap: " << current_error_gap << endl;
                    cout << "risk:          " << current_risk_value << endl;
                    cout << "risk gap:      " << current_risk_gap << endl;
                    cout << "num planes:    " << num_cutting_planes << endl;
                    cout << "iter:          " << num_iterations << endl;
                }
                cout << endl;
            }

            if (num_iterations >= max_iterations)
                return true;

            saved_current_risk_gap = current_risk_gap;

            if (converged)
            {
                return (current_risk_gap < std::max(cache_based_eps,cache_based_eps*current_risk_value)) || 
                       (current_risk_gap == 0);
            }

            if (current_risk_gap < eps)
            {
                // Only stop when we see that the risk gap is small enough on a non-cached
                // iteration.  But even then, if we are supposed to do the cache based
                // refinement then we just mark that we have "converged" to avoid further
                // calls to the separation oracle and run all subsequent iterations off the
                // cache.
                if (skip_cache || max_cache_size == 0)
                {
                    converged = true;
                    skip_cache = false;
                    return (current_risk_gap < std::max(cache_based_eps,cache_based_eps*current_risk_value)) ||
                           (current_risk_gap == 0);
                }

                ++count_below_eps;

                // Only disable the cache if we have seen a few consecutive iterations that
                // look to have converged.
                if (count_below_eps > 1)
                {
                    // Instead of stopping we shouldn't use the cache on the next iteration.  This way
                    // we can be sure to have the best solution rather than assuming the cache is up-to-date
                    // enough.
                    skip_cache = true;
                    count_below_eps = 0;
                }
            }
            else
            {
                count_below_eps = 0;
                skip_cache = false;
            }

            return false;
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

            if (nuclear_norm_regularizers.size() != 0)
            {
                matrix_type grad; 
                scalar_type obj;
                compute_nuclear_norm_parts(w, grad, obj);
                risk += obj;
                subgradient += grad;
            }
        }

        virtual void call_separation_oracle_on_all_samples (
            const matrix_type& w,
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

        void compute_nuclear_norm_parts(
            const matrix_type& m,
            matrix_type& grad,
            scalar_type& obj
        ) const
        {
            obj = 0;
            grad.set_size(m.size(), 1);
            grad = 0;

            matrix<double> u,v,w,f;
            nuclear_norm_part = 0;
            for (unsigned long i = 0; i < nuclear_norm_regularizers.size(); ++i)
            {
                const long nr = nuclear_norm_regularizers[i].nr;
                const long nc = nuclear_norm_regularizers[i].nc;
                const long size = nr*nc;
                const long idx = nuclear_norm_regularizers[i].first_dimension;
                const double strength = nuclear_norm_regularizers[i].regularization_strength;

                f = matrix_cast<double>(reshape(rowm(m, range(idx, idx+size-1)), nr, nc));
                svd3(f, u,w,v);


                const double norm = sum(w);
                obj += strength*norm;
                nuclear_norm_part += strength*norm/C;

                f = u*trans(v);

                set_rowm(grad, range(idx, idx+size-1)) = matrix_cast<double>(strength*reshape_to_column_vector(f));
            }

            obj /= C;
            grad /= C;
        }

        void separation_oracle_cached (
            const long idx,
            const matrix_type& current_solution,
            scalar_type& loss,
            feature_vector_type& psi
        ) const 
        {
            cache[idx].separation_oracle_cached(converged,
                                                skip_cache, 
                                                saved_current_risk_gap,
                                                current_solution,
                                                loss,
                                                psi);
        }

        std::vector<impl::nuclear_norm_regularizer> nuclear_norm_regularizers;

        mutable scalar_type saved_current_risk_gap;
        mutable matrix_type psi_true;
        scalar_type eps;
        unsigned long max_iterations;
        mutable bool verbose;


        mutable std::vector<cache_element_structural_svm<structural_svm_problem> > cache;
        mutable bool skip_cache;
        mutable int count_below_eps;
        unsigned long max_cache_size;
        mutable bool converged;
        mutable double nuclear_norm_part;
        scalar_type cache_based_eps;

        scalar_type C;
    };

// ----------------------------------------------------------------------------------------

}

#endif // DLIB_STRUCTURAL_SVM_PRObLEM_Hh_

