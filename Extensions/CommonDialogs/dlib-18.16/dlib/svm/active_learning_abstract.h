// Copyright (C) 2012  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#undef DLIB_ACTIVE_LEARnING_ABSTRACT_Hh_
#ifdef DLIB_ACTIVE_LEARnING_ABSTRACT_Hh_

#include "svm_c_linear_dcd_trainer_abstract.h"
#include <vector>

namespace dlib
{

// ----------------------------------------------------------------------------------------

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
    std::vector<unsigned long> rank_unlabeled_training_samples (
        const svm_c_linear_dcd_trainer<kernel_type>& trainer,
        const in_sample_vector_type& samples,
        const in_scalar_vector_type& labels,
        const in_sample_vector_type2& unlabeled_samples,
        const active_learning_mode mode = max_min_margin
    );
    /*!
        requires
            - if (samples.size() != 0) then
                - it must be legal to call trainer.train(samples, labels)
                - is_learning_problem(samples, labels) == true
            - unlabeled_samples must contain the same kind of vectors as samples.
            - unlabeled_samples, samples, and labels must be matrices or types of 
              objects convertible to a matrix via mat().
            - is_vector(unlabeled_samples) == true
        ensures
            - Suppose that we wish to learn a binary classifier by calling
              trainer.train(samples, labels) but we are also interested in selecting one of
              the elements of unlabeled_samples to add to our training data.  Since doing
              this requires us to find out the label of the sample, a potentially tedious
              or expensive process, we would like to select the "best" element from
              unlabeled_samples for labeling.  The rank_unlabeled_training_samples()
              attempts to find this "best" element.  In particular, this function returns a
              ranked list of all the elements in unlabeled_samples such that that the
              "best" elements come first.
            - The method used by this function is described in the paper:
                Support Vector Machine Active Learning with Applications to Text Classification
                by Simon Tong and Daphne Koller
              In particular, this function implements the MaxMin Margin and Ratio Margin 
              selection strategies described in the paper.  Moreover, the mode argument
              to this function selects which of these strategies is used.
            - returns a std::vector V such that:
                - V contains a list of all the indices from unlabeled_samples.  Moreover,
                  they are ordered so that the most useful samples come first.
                - V.size() == unlabeled_samples.size()
                - unlabeled_samples[V[0]] == The best sample to add into the training set.
                - unlabeled_samples[V[1]] == The second best sample to add into the training set.
                - unlabeled_samples[V[i]] == The i-th best sample to add into the training set.
    !*/

// ----------------------------------------------------------------------------------------

}

#endif // DLIB_ACTIVE_LEARnING_ABSTRACT_Hh_


