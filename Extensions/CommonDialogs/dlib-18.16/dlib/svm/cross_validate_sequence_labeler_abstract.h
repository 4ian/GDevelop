// Copyright (C) 2011  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#undef DLIB_CROSS_VALIDATE_SEQUENCE_LABeLER_ABSTRACT_Hh_
#ifdef DLIB_CROSS_VALIDATE_SEQUENCE_LABeLER_ABSTRACT_Hh_

#include <vector>
#include "../matrix.h"
#include "svm.h"


namespace dlib
{

// ----------------------------------------------------------------------------------------

    template <
        typename sequence_labeler_type,
        typename sequence_type 
        >
    const matrix<double> test_sequence_labeler (
        const sequence_labeler_type& labeler,
        const std::vector<sequence_type>& samples,
        const std::vector<std::vector<unsigned long> >& labels
    );
    /*!
        requires
            - is_sequence_labeling_problem(samples, labels)
            - sequence_labeler_type == dlib::sequence_labeler or an object with a 
              compatible interface.
        ensures
            - Tests labeler against the given samples and labels and returns a confusion 
              matrix summarizing the results.
            - The confusion matrix C returned by this function has the following properties.
                - C.nc() == labeler.num_labels()
                - C.nr() == labeler.num_labels() 
                - C(T,P) == the number of times a sequence element with label T was predicted
                  to have a label of P.
            - Any samples with a label value >= labeler.num_labels() are ignored.  That 
              is, samples with labels the labeler hasn't ever seen before are ignored.
    !*/

// ----------------------------------------------------------------------------------------

    template <
        typename trainer_type,
        typename sequence_type
        >
    const matrix<double> cross_validate_sequence_labeler (
        const trainer_type& trainer,
        const std::vector<sequence_type>& samples,
        const std::vector<std::vector<unsigned long> >& labels,
        const long folds
    );
    /*!
        requires
            - is_sequence_labeling_problem(samples, labels)
            - 1 < folds <= samples.size()
            - for all valid i and j: labels[i][j] < trainer.num_labels()
            - trainer_type == dlib::structural_sequence_labeling_trainer or an object
              with a compatible interface.
        ensures
            - performs k-fold cross validation by using the given trainer to solve the
              given sequence labeling problem for the given number of folds.  Each fold 
              is tested using the output of the trainer and the confusion matrix from all 
              folds is summed and returned.
            - The total confusion matrix is computed by running test_sequence_labeler()
              on each fold and summing its output.
            - The number of folds used is given by the folds argument.
            - The confusion matrix C returned by this function has the following properties.
                - C.nc() == trainer.num_labels()
                - C.nr() == trainer.num_labels() 
                - C(T,P) == the number of times a sequence element with label T was predicted
                  to have a label of P.
    !*/

// ----------------------------------------------------------------------------------------

}

#endif // DLIB_CROSS_VALIDATE_SEQUENCE_LABeLER_ABSTRACT_Hh_



