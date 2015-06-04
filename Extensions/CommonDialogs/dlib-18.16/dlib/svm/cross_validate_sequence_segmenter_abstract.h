// Copyright (C) 2013  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#undef DLIB_CROSS_VALIDATE_SEQUENCE_sEGMENTER_ABSTRACT_Hh_
#ifdef DLIB_CROSS_VALIDATE_SEQUENCE_sEGMENTER_ABSTRACT_Hh_

#include "sequence_segmenter_abstract.h"
#include "../matrix.h"

namespace dlib
{

// ----------------------------------------------------------------------------------------

    template <
        typename sequence_segmenter_type,
        typename sequence_type 
        >
    const matrix<double,1,3> test_sequence_segmenter (
        const sequence_segmenter_type& segmenter,
        const std::vector<sequence_type>& samples,
        const std::vector<std::vector<std::pair<unsigned long,unsigned long> > >& segments 
    );
    /*!
        requires
            - is_sequence_segmentation_problem(samples, segments) == true
            - sequence_segmenter_type == dlib::sequence_segmenter or an object with a
              compatible interface.
        ensures
            - Tests segmenter against the given samples and truth segments and returns the
              precision, recall, and F1-score obtained by the segmenter.  That is, the goal
              of the segmenter should be to predict segments[i] given samples[i] as input.
              The test_sequence_segmenter() routine therefore measures how well the
              segmenter is able to perform this task.
            - Returns a row matrix M with the following properties:
                - M(0) == The precision of the segmenter measured against the task of
                  detecting the segments of each sample.  This is a number in the range 0
                  to 1 and represents the fraction of segments output by the segmenter
                  which correspond to true segments for each sample.
                - M(1) == The recall of the segmenter measured against the task of
                  detecting the segments of each sample.  This is a number in the range 0
                  to 1 and represents the fraction of the true segments found by the
                  segmenter. 
                - M(2) == The F1-score for the segmenter.  This is the harmonic mean of
                  M(0) and M(1).
    !*/

// ----------------------------------------------------------------------------------------

    template <
        typename trainer_type,
        typename sequence_type 
        >
    const matrix<double,1,3> cross_validate_sequence_segmenter (
        const trainer_type& trainer,
        const std::vector<sequence_type>& samples,
        const std::vector<std::vector<std::pair<unsigned long,unsigned long> > >& segments,
        const long folds
    );
    /*!
        requires
            - is_sequence_segmentation_problem(samples, segments) == true
            - 1 < folds <= samples.size()
            - trainer_type == dlib::structural_sequence_segmentation_trainer or an object
              with a compatible interface.
        ensures
            - Performs k-fold cross validation by using the given trainer to solve the
              given sequence segmentation problem for the given number of folds.  Each fold
              is tested using the output of the trainer and the results from all folds are
              summarized and returned. 
            - This function returns the precision, recall, and F1-score for the trainer.
              In particular, the output is the same as the output from the
              test_sequence_segmenter() routine defined above.
    !*/

// ----------------------------------------------------------------------------------------

}

#endif // DLIB_CROSS_VALIDATE_SEQUENCE_sEGMENTER_ABSTRACT_Hh_

