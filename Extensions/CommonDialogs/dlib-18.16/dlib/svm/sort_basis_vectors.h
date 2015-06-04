// Copyright (C) 2010  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#ifndef DLIB_SORT_BASIS_VECTORs_Hh_
#define DLIB_SORT_BASIS_VECTORs_Hh_

#include <vector>

#include "sort_basis_vectors_abstract.h"
#include "../matrix.h"
#include "../statistics.h"

namespace dlib
{

// ----------------------------------------------------------------------------------------

    namespace bs_impl 
    {
        template <typename EXP>
        typename EXP::matrix_type invert (
            const matrix_exp<EXP>& m
        )
        {
            eigenvalue_decomposition<EXP> eig(make_symmetric(m));

            typedef typename EXP::type scalar_type;
            typedef typename EXP::mem_manager_type mm_type;

            matrix<scalar_type,0,1,mm_type> vals = eig.get_real_eigenvalues();

            const scalar_type max_eig = max(abs(vals));
            const scalar_type thresh = max_eig*std::sqrt(std::numeric_limits<scalar_type>::epsilon());

            // Since m might be singular or almost singular we need to do something about
            // any very small eigenvalues.  So here we set the smallest eigenvalues to
            // be equal to a large value to make the inversion stable.  We can't just set
            // them to zero like in a normal pseudo-inverse since we want the resulting
            // inverse matrix to be full rank.
            for (long i = 0; i < vals.size(); ++i)
            {
                if (std::abs(vals(i)) < thresh)
                    vals(i) = max_eig;
            }

            // Build the inverse matrix.  This is basically a pseudo-inverse.
            return make_symmetric(eig.get_pseudo_v()*diagm(reciprocal(vals))*trans(eig.get_pseudo_v()));
        }

// ----------------------------------------------------------------------------------------

        template <
            typename kernel_type,
            typename vect1_type,
            typename vect2_type,
            typename vect3_type
            >
        const std::vector<typename kernel_type::sample_type> sort_basis_vectors_impl (
            const kernel_type& kern,
            const vect1_type& samples,
            const vect2_type& labels,
            const vect3_type& basis,
            double eps 
        )
        {
            DLIB_ASSERT(is_binary_classification_problem(samples, labels) &&
                        0 < eps && eps <= 1 && 
                        basis.size() > 0,
                        "\t void sort_basis_vectors()"
                        << "\n\t Invalid arguments were given to this function."
                        << "\n\t is_binary_classification_problem(samples, labels): " << is_binary_classification_problem(samples, labels)
                        << "\n\t basis.size(): " << basis.size() 
                        << "\n\t eps:          " << eps 
            );

            typedef typename kernel_type::scalar_type scalar_type;
            typedef typename kernel_type::mem_manager_type mm_type;

            typedef matrix<scalar_type,0,1,mm_type> col_matrix;
            typedef matrix<scalar_type,0,0,mm_type> gen_matrix;

            col_matrix c1_mean, c2_mean, temp, delta;


            col_matrix weights;

            running_covariance<gen_matrix> cov;

            // compute the covariance matrix and the means of the two classes.
            for (long i = 0; i < samples.size(); ++i)
            {
                temp = kernel_matrix(kern, basis, samples(i));
                cov.add(temp);
                if (labels(i) > 0)
                    c1_mean += temp;
                else
                    c2_mean += temp;
            }

            c1_mean /= sum(labels > 0);
            c2_mean /= sum(labels < 0);

            delta = c1_mean - c2_mean;

            gen_matrix cov_inv = bs_impl::invert(cov.covariance());


            matrix<long,0,1,mm_type> total_perm = trans(range(0, delta.size()-1));
            matrix<long,0,1,mm_type> perm = total_perm;

            std::vector<std::pair<scalar_type,long> > sorted_feats(delta.size());

            long best_size = delta.size();
            long misses = 0;
            matrix<long,0,1,mm_type> best_total_perm = perm;

            // Now we basically find fisher's linear discriminant over and over.  Each
            // time sorting the features so that the most important ones pile up together.
            weights = trans(chol(cov_inv))*delta;
            while (true)
            {

                for (unsigned long i = 0; i < sorted_feats.size(); ++i)
                    sorted_feats[i] = make_pair(std::abs(weights(i)), i);

                std::sort(sorted_feats.begin(), sorted_feats.end());

                // make a permutation vector according to the sorting
                for (long i = 0; i < perm.size(); ++i)
                    perm(i) = sorted_feats[i].second;


                // Apply the permutation.  Doing this gives the same result as permuting all the
                // features and then recomputing the delta and cov_inv from scratch.
                cov_inv = subm(cov_inv,perm,perm);
                delta = rowm(delta,perm);

                // Record all the permutations we have done so we will know how the final
                // weights match up with the original basis vectors when we are done.
                total_perm = rowm(total_perm, perm);

                // compute new Fisher weights for sorted features.
                weights = trans(chol(cov_inv))*delta;

                // Measure how many features it takes to account for eps% of the weights vector.
                const scalar_type total_weight = length_squared(weights);
                scalar_type weight_accum = 0;
                long size = 0;
                // figure out how to get eps% of the weights
                for (long i = weights.size()-1; i >= 0; --i)
                {
                    ++size;
                    weight_accum += weights(i)*weights(i);
                    if (weight_accum/total_weight > eps)
                        break;
                }

                // loop until the best_size stops dropping
                if (size < best_size)
                {
                    misses = 0;
                    best_size = size;
                    best_total_perm = total_perm;
                }
                else
                {
                    ++misses;

                    // Give up once we have had 10 rounds where we didn't find a weights vector with
                    // a smaller concentration of good features. 
                    if (misses >= 10)
                        break;
                }

            }

            // make sure best_size isn't zero
            if (best_size == 0)
                best_size = 1;

            std::vector<typename kernel_type::sample_type> sorted_basis;

            // permute the basis so that it matches up with the contents of the best weights 
            sorted_basis.resize(best_size);
            for (unsigned long i = 0; i < sorted_basis.size(); ++i)
            {
                // Note that we load sorted_basis backwards so that the most important
                // basis elements come first.  
                sorted_basis[i] = basis(best_total_perm(basis.size()-i-1));
            }

            return sorted_basis;
        }

    }

// ----------------------------------------------------------------------------------------

    template <
        typename kernel_type,
        typename vect1_type,
        typename vect2_type,
        typename vect3_type
        >
    const std::vector<typename kernel_type::sample_type> sort_basis_vectors (
        const kernel_type& kern,
        const vect1_type& samples,
        const vect2_type& labels,
        const vect3_type& basis,
        double eps = 0.99
    )
    {
        return bs_impl::sort_basis_vectors_impl(kern, 
                                                mat(samples),
                                                mat(labels),
                                                mat(basis),
                                                eps);
    }

// ----------------------------------------------------------------------------------------

}

#endif // DLIB_SORT_BASIS_VECTORs_Hh_

