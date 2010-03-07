// Copyright (C) 2008  Davis E. King (davisking@users.sourceforge.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#ifndef DLIB_KERNEL_FEATURE_RANKINg_H_
#define DLIB_KERNEL_FEATURE_RANKINg_H_

#include <vector>
#include <limits>

#include "feature_ranking_abstract.h"
#include "kcentroid.h"

namespace dlib
{

// ----------------------------------------------------------------------------------------

    template <
        typename kernel_type,
        typename sample_matrix_type,
        typename label_matrix_type
        >
    matrix<typename kernel_type::scalar_type,0,2,typename kernel_type::mem_manager_type> rank_features_impl (
        const kcentroid<kernel_type>& kc,
        const sample_matrix_type& samples,
        const label_matrix_type& labels
    )
    {
        /*
            This function ranks features by doing recursive feature elimination

        */
        typedef typename kernel_type::scalar_type scalar_type;
        typedef typename kernel_type::sample_type sample_type;
        typedef typename kernel_type::mem_manager_type mm;


        // make sure requires clause is not broken
        DLIB_ASSERT(is_binary_classification_problem(samples, labels) == true,
            "\tmatrix rank_features()"
            << "\n\t you have given invalid arguments to this function"
            );

        matrix<scalar_type,0,2,mm> results(samples(0).nr(), 2);
        matrix<scalar_type,sample_matrix_type::type::NR,1,mm> mask(samples(0).nr());
        set_all_elements(mask,1);

        // figure out what the separation is between the two centroids when all the features are 
        // present.
        scalar_type first_separation;
        {
            kcentroid<kernel_type> c1(kc);
            kcentroid<kernel_type> c2(kc);
            // find the centers of each class
            for (long s = 0; s < samples.size(); ++s)
            {
                if (labels(s) < 0)
                {
                    c1.train(samples(s));
                }
                else
                {
                    c2.train(samples(s));
                }

            }
            first_separation = c1(c2);
        }


        using namespace std;

        for (long i = results.nr()-1; i >= 0; --i)
        {
            long worst_feature_idx = 0;
            scalar_type worst_feature_score = -std::numeric_limits<scalar_type>::infinity();

            // figure out which feature to remove next
            for (long j = 0; j < mask.size(); ++j)
            {
                // skip features we have already removed
                if (mask(j) == 0)
                    continue;

                kcentroid<kernel_type> c1(kc);
                kcentroid<kernel_type> c2(kc);

                // temporarily remove this feature from the working set of features
                mask(j) = 0;

                // find the centers of each class
                for (long s = 0; s < samples.size(); ++s)
                {
                    if (labels(s) < 0)
                    {
                        c1.train(pointwise_multiply(samples(s),mask));
                    }
                    else
                    {
                        c2.train(pointwise_multiply(samples(s),mask));
                    }

                }

                // find the distance between the two centroids and use that
                // as the score
                const double score = c1(c2);

                if (score > worst_feature_score)
                {
                    worst_feature_score = score;
                    worst_feature_idx = j;
                }

                // add this feature back to the working set of features
                mask(j) = 1;

            }

            // now that we know what the next worst feature is record it 
            mask(worst_feature_idx) = 0;
            results(i,0) = worst_feature_idx;
            results(i,1) = worst_feature_score; 
        }

        // now normalize the results 
        const scalar_type max_separation = std::max(max(colm(results,1)), first_separation);
        set_colm(results,1) = colm(results,1)/max_separation;
        for (long r = 0; r < results.nr()-1; ++r)
        {
            results(r,1) = results(r+1,1);
        }
        results(results.nr()-1,1) = first_separation/max_separation;

        return results;
    }

// ----------------------------------------------------------------------------------------

    template <
        typename kernel_type,
        typename sample_matrix_type,
        typename label_matrix_type
        >
    matrix<typename kernel_type::scalar_type,0,2,typename kernel_type::mem_manager_type> rank_features (
        const kcentroid<kernel_type>& kc,
        const sample_matrix_type& samples,
        const label_matrix_type& labels
    )
    {
        return rank_features_impl(kc, vector_to_matrix(samples), vector_to_matrix(labels));
    }

// ----------------------------------------------------------------------------------------

    template <
        typename kernel_type,
        typename sample_matrix_type,
        typename label_matrix_type
        >
    matrix<typename kernel_type::scalar_type,0,2,typename kernel_type::mem_manager_type> rank_features_impl (
        const kcentroid<kernel_type>& kc,
        const sample_matrix_type& samples,
        const label_matrix_type& labels,
        const long num_features
    )
    {
        /*
            This function ranks features by doing recursive feature addition 

        */
        typedef typename kernel_type::scalar_type scalar_type;
        typedef typename kernel_type::sample_type sample_type;
        typedef typename kernel_type::mem_manager_type mm;

        // make sure requires clause is not broken
        DLIB_ASSERT(is_binary_classification_problem(samples, labels) == true,
            "\tmatrix rank_features()"
            << "\n\t you have given invalid arguments to this function"
            );
        DLIB_ASSERT(0 < num_features && num_features <= samples(0).nr(),
            "\tmatrix rank_features()"
            << "\n\t you have given invalid arguments to this function"
            << "\n\t num_features:    " << num_features
            << "\n\t samples(0).nr(): " << samples(0).nr() 
            );

        matrix<scalar_type,0,2,mm> results(num_features, 2);
        matrix<scalar_type,sample_matrix_type::type::NR,1,mm> mask(samples(0).nr());
        set_all_elements(mask,0);

        using namespace std;

        for (long i = 0; i < results.nr(); ++i)
        {
            long best_feature_idx = 0;
            scalar_type best_feature_score = -std::numeric_limits<scalar_type>::infinity();

            // figure out which feature to add next
            for (long j = 0; j < mask.size(); ++j)
            {
                // skip features we have already added 
                if (mask(j) == 1)
                    continue;

                kcentroid<kernel_type> c1(kc);
                kcentroid<kernel_type> c2(kc);

                // temporarily add this feature to the working set of features
                mask(j) = 1;

                // find the centers of each class
                for (long s = 0; s < samples.size(); ++s)
                {
                    if (labels(s) < 0)
                    {
                        c1.train(pointwise_multiply(samples(s),mask));
                    }
                    else
                    {
                        c2.train(pointwise_multiply(samples(s),mask));
                    }

                }

                // find the distance between the two centroids and use that
                // as the score
                const double score = c1(c2);

                if (score > best_feature_score)
                {
                    best_feature_score = score;
                    best_feature_idx = j;
                }

                // take this feature back out of the working set of features
                mask(j) = 0;

            }

            // now that we know what the next best feature is record it 
            mask(best_feature_idx) = 1;
            results(i,0) = best_feature_idx;
            results(i,1) = best_feature_score; 
        }

        // now normalize the results 
        set_colm(results,1) = colm(results,1)/max(colm(results,1));

        return results;
    }

// ----------------------------------------------------------------------------------------

    template <
        typename kernel_type,
        typename sample_matrix_type,
        typename label_matrix_type
        >
    matrix<typename kernel_type::scalar_type,0,2,typename kernel_type::mem_manager_type> rank_features (
        const kcentroid<kernel_type>& kc,
        const sample_matrix_type& samples,
        const label_matrix_type& labels,
        const long num_features
    )
    {
        if (vector_to_matrix(samples).nr() > 0 && num_features == vector_to_matrix(samples)(0).nr())
        {
            // if we are going to rank them all then might as well do the recursive feature elimination version
            return rank_features_impl(kc, vector_to_matrix(samples), vector_to_matrix(labels));
        }
        else
        {
            return rank_features_impl(kc, vector_to_matrix(samples), vector_to_matrix(labels), num_features);
        }
    }

// ----------------------------------------------------------------------------------------

}

#endif // DLIB_KERNEL_FEATURE_RANKINg_H_


