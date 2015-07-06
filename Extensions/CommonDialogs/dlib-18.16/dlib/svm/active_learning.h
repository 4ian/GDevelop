// Copyright (C) 2012  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#ifndef DLIB_ACTIVE_LEARnING_Hh_
#define DLIB_ACTIVE_LEARnING_Hh_

#include "active_learning_abstract.h"

#include "svm_c_linear_dcd_trainer.h"
#include <vector>

namespace dlib
{

    enum active_learning_mode
    {
        max_min_margin,
        ratio_margin
    };
    
// ----------------------------------------------------------------------------------------

    template <
        typename kernel_type,
        typename in_sample_vector_type,
        typename in_scalar_vector_type,
        typename in_sample_vector_type2
        >
    std::vector<unsigned long> impl_rank_unlabeled_training_samples (
        const svm_c_linear_dcd_trainer<kernel_type>& trainer,
        const in_sample_vector_type& samples,
        const in_scalar_vector_type& labels,
        const in_sample_vector_type2& unlabeled_samples,
        const active_learning_mode mode 
    )
    {
        DLIB_ASSERT(is_vector(unlabeled_samples) &&
                     (samples.size() == 0 || is_learning_problem(samples, labels)) ,
                "\t std::vector<unsigned long> rank_unlabeled_training_samples()"
                << "\n\t Invalid inputs were given to this function"
                << "\n\t is_vector(unlabeled_samples):         " << is_vector(unlabeled_samples) 
                << "\n\t is_learning_problem(samples, labels): " << is_learning_problem(samples, labels) 
                << "\n\t samples.size(): " << samples.size() 
                << "\n\t labels.size():  " << labels.size() 
                );

        // If there aren't any training samples then all unlabeled_samples are equally good.
        // So just report an arbitrary ordering.
        if (samples.size() == 0 || unlabeled_samples.size() == 0)
        {
            std::vector<unsigned long> ret(unlabeled_samples.size());
            for (unsigned long i = 0; i < ret.size(); ++i)
                ret[i] = i;

            return ret;
        }

        // We are going to score each unlabeled sample and put the score and index into
        // results.  Then at the end of this function we just sort it and return the indices.
        std::vector<std::pair<double, unsigned long> > results;
        results.resize(unlabeled_samples.size());

        // make sure we use this trainer's ability to warm start itself since that will make
        // this whole function run a lot faster.  But first, we need to find out what the state
        // we will be warm starting from is. 
        typedef typename svm_c_linear_dcd_trainer<kernel_type>::optimizer_state optimizer_state;
        optimizer_state state;
        trainer.train(samples, labels, state); // call train() just to get state

        decision_function<kernel_type> df;

        std::vector<typename kernel_type::sample_type> temp_samples;
        std::vector<typename kernel_type::scalar_type> temp_labels;
        temp_samples.reserve(samples.size()+1);
        temp_labels.reserve(labels.size()+1);
        temp_samples.assign(samples.begin(), samples.end());
        temp_labels.assign(labels.begin(), labels.end());
        temp_samples.resize(temp_samples.size()+1);
        temp_labels.resize(temp_labels.size()+1);


        for (long i = 0; i < unlabeled_samples.size(); ++i)
        {
            temp_samples.back() = unlabeled_samples(i);
            // figure out the margin for each possible labeling of this sample.

            optimizer_state temp(state);
            temp_labels.back() = +1;
            df = trainer.train(temp_samples, temp_labels, temp);
            const double margin_p = temp_labels.back()*df(temp_samples.back());

            temp = state;
            temp_labels.back() = -1;
            df = trainer.train(temp_samples, temp_labels, temp);
            const double margin_n = temp_labels.back()*df(temp_samples.back());

            if (mode == max_min_margin)
            {
                // The score for this sample is its min possible margin over possible labels.
                // Therefore, this score measures how much flexibility we have to label this
                // sample however we want.  The intuition being that the most useful points to
                // label are the ones that are still free to obtain either label.
                results[i] = std::make_pair(std::min(margin_p, margin_n), i);
            }
            else
            {
                // In this case, the score for the sample is a ratio that tells how close the
                // two margin values are to each other.  The closer they are the better.  So in
                // this case we are saying we are looking for samples that have the same
                // preference for either class label. 
                if (std::abs(margin_p) >= std::abs(margin_n))
                {
                    if (margin_p != 0)
                        results[i] = std::make_pair(margin_n/margin_p, i);
                    else // if both are == 0 then say 0/0 == 1
                        results[i] = std::make_pair(1, i);
                }
                else
                {
                    results[i] = std::make_pair(margin_p/margin_n, i);
                }
            }
        }

        // sort the results so the highest scoring samples come first.
        std::sort(results.rbegin(), results.rend());

        // transfer results into a vector with just sample indices so we can return it.
        std::vector<unsigned long> ret(results.size());
        for (unsigned long i = 0; i < ret.size(); ++i)
            ret[i] = results[i].second;
        return ret;
    }

// ----------------------------------------------------------------------------------------

    template <
        typename kernel_type,
        typename in_sample_vector_type,
        typename in_scalar_vector_type,
        typename in_sample_vector_type2
        >
    std::vector<unsigned long> rank_unlabeled_training_samples (
        const svm_c_linear_dcd_trainer<kernel_type>& trainer,
        const in_sample_vector_type& samples,
        const in_scalar_vector_type& labels,
        const in_sample_vector_type2& unlabeled_samples,
        const active_learning_mode mode = max_min_margin
    )
    {
        return impl_rank_unlabeled_training_samples(trainer,
                                                    mat(samples),
                                                    mat(labels),
                                                    mat(unlabeled_samples),
                                                    mode);
    }

// ----------------------------------------------------------------------------------------

}

#endif // DLIB_ACTIVE_LEARnING_Hh_

