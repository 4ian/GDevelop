// Copyright (C) 2011  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#undef DLIB_CROSS_VALIDATE_OBJECT_DETECTION_TRaINER_ABSTRACT_Hh_
#ifdef DLIB_CROSS_VALIDATE_OBJECT_DETECTION_TRaINER_ABSTRACT_Hh_

#include <vector>
#include "../matrix.h"
#include "../geometry.h"
#include "../image_processing/full_object_detection_abstract.h"

namespace dlib
{

// ----------------------------------------------------------------------------------------

    template <
        typename object_detector_type,
        typename image_array_type
        >
    const matrix<double,1,3> test_object_detection_function (
        object_detector_type& detector,
        const image_array_type& images,
        const std::vector<std::vector<full_object_detection> >& truth_dets,
        const std::vector<std::vector<rectangle> >& ignore,
        const test_box_overlap& overlap_tester = test_box_overlap(),
        const double adjust_threshold = 0
    );
    /*!
        requires
            - is_learning_problem(images,truth_dets)
            - images.size() == ignore.size()
            - object_detector_type == some kind of object detector function object
              (e.g. object_detector)
            - image_array_type must be an implementation of dlib/array/array_kernel_abstract.h 
              and it must contain objects which can be accepted by detector().
        ensures
            - Tests the given detector against the supplied object detection problem and
              returns the precision, recall, and average precision.  Note that the task is
              to predict, for each images[i], the set of object locations given by
              truth_dets[i].  Additionally, any detections on image[i] that match a box in
              ignore[i] are ignored.  That is, detections matching a box in ignore[i] do
              not count as a false alarm and similarly if any element of ignore[i] goes
              undetected it does not count as a missed detection.  So we say that ignore[i]
              contains a set of boxes that we "don't care" if they are detected or not.
            - In particular, returns a matrix M such that:  
                - M(0) == the precision of the detector object.  This is a number
                  in the range [0,1] which measures the fraction of detector outputs
                  which correspond to a real target.  A value of 1 means the detector
                  never produces any false alarms while a value of 0 means it only
                  produces false alarms.
                - M(1) == the recall of the detector object.  This is a number in the
                  range [0,1] which measures the fraction of targets found by the
                  detector.  A value of 1 means the detector found all the targets
                  in truth_dets while a value of 0 means the detector didn't locate
                  any of the targets.
                - M(2) == the average precision of the detector object.  This is a number
                  in the range [0,1] which measures the overall quality of the detector.
                  We compute this by taking all the detections output by the detector and
                  ordering them in descending order of their detection scores.  Then we use
                  the average_precision() routine to score the ranked listing and store the
                  output into M(2).
                - This function considers a detector output D to match a rectangle T if and
                  only if overlap_tester(T,D) returns true. 
                - Note that you can use the adjust_threshold argument to raise or lower the
                  detection threshold.  This value is passed into the identically named
                  argument to the detector object and therefore influences the number of
                  output detections.  It can be useful, for example, to lower the detection
                  threshold because it results in more detections being output by the
                  detector, and therefore provides more information in the ranking,
                  possibly raising the average precision.
    !*/

    template <
        typename object_detector_type,
        typename image_array_type
        >
    const matrix<double,1,3> test_object_detection_function (
        object_detector_type& detector,
        const image_array_type& images,
        const std::vector<std::vector<rectangle> >& truth_dets,
        const std::vector<std::vector<rectangle> >& ignore,
        const test_box_overlap& overlap_tester = test_box_overlap(),
        const double adjust_threshold = 0
    );
    /*!
        requires
            - All the requirements of the above test_object_detection_function() routine.
        ensures
            - converts all the rectangles in truth_dets into full_object_detection objects
              via full_object_detection's rectangle constructor.  Then invokes
              test_object_detection_function() on the full_object_detections and returns
              the results.  
    !*/

    template <
        typename object_detector_type,
        typename image_array_type
        >
    const matrix<double,1,3> test_object_detection_function (
        object_detector_type& detector,
        const image_array_type& images,
        const std::vector<std::vector<rectangle> >& truth_dets,
        const test_box_overlap& overlap_tester = test_box_overlap(),
        const double adjust_threshold = 0
    );
    /*!
        requires
            - All the requirements of the above test_object_detection_function() routine.
        ensures
            - This function simply invokes test_object_detection_function() with all the
              given arguments and an empty set of ignore rectangles and returns the results.
    !*/

    template <
        typename object_detector_type,
        typename image_array_type
        >
    const matrix<double,1,3> test_object_detection_function (
        object_detector_type& detector,
        const image_array_type& images,
        const std::vector<std::vector<full_object_detection> >& truth_dets,
        const test_box_overlap& overlap_tester = test_box_overlap(),
        const double adjust_threshold = 0
    );
    /*!
        requires
            - All the requirements of the above test_object_detection_function() routine.
        ensures
            - This function simply invokes test_object_detection_function() with all the
              given arguments and an empty set of ignore rectangles and returns the results.
    !*/

// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------

    template <
        typename trainer_type,
        typename image_array_type
        >
    const matrix<double,1,3> cross_validate_object_detection_trainer (
        const trainer_type& trainer,
        const image_array_type& images,
        const std::vector<std::vector<full_object_detection> >& truth_dets,
        const std::vector<std::vector<rectangle> >& ignore,
        const long folds,
        const test_box_overlap& overlap_tester = test_box_overlap(),
        const double adjust_threshold = 0
    );
    /*!
        requires
            - is_learning_problem(images,truth_dets)
            - images.size() == ignore.size()
            - 1 < folds <= images.size()
            - trainer_type == some kind of object detection trainer (e.g structural_object_detection_trainer)
            - image_array_type must be an implementation of dlib/array/array_kernel_abstract.h 
              and it must contain objects which can be accepted by detector().
            - it is legal to call trainer.train(images, truth_dets)
        ensures
            - Performs k-fold cross-validation by using the given trainer to solve an
              object detection problem for the given number of folds.  Each fold is tested
              using the output of the trainer and a matrix summarizing the results is
              returned.  The matrix contains the precision, recall, and average
              precision of the trained detectors and is defined identically to the
              test_object_detection_function() routine defined at the top of this file.
    !*/

    template <
        typename trainer_type,
        typename image_array_type
        >
    const matrix<double,1,3> cross_validate_object_detection_trainer (
        const trainer_type& trainer,
        const image_array_type& images,
        const std::vector<std::vector<rectangle> >& truth_dets,
        const std::vector<std::vector<rectangle> >& ignore,
        const long folds,
        const test_box_overlap& overlap_tester = test_box_overlap(),
        const double adjust_threshold = 0
    );
    /*!
        requires
            - all the requirements of the above cross_validate_object_detection_trainer() routine.
        ensures
            - converts all the rectangles in truth_dets into full_object_detection objects
              via full_object_detection's rectangle constructor.  Then invokes
              cross_validate_object_detection_trainer() on the full_object_detections and
              returns the results.  
    !*/

    template <
        typename trainer_type,
        typename image_array_type
        >
    const matrix<double,1,3> cross_validate_object_detection_trainer (
        const trainer_type& trainer,
        const image_array_type& images,
        const std::vector<std::vector<rectangle> >& truth_dets,
        const long folds,
        const test_box_overlap& overlap_tester = test_box_overlap(),
        const double adjust_threshold = 0
    );
    /*!
        requires
            - All the requirements of the above cross_validate_object_detection_trainer() routine.
        ensures
            - This function simply invokes cross_validate_object_detection_trainer() with all
              the given arguments and an empty set of ignore rectangles and returns the results.
    !*/

    template <
        typename trainer_type,
        typename image_array_type
        >
    const matrix<double,1,3> cross_validate_object_detection_trainer (
        const trainer_type& trainer,
        const image_array_type& images,
        const std::vector<std::vector<full_object_detection> >& truth_dets,
        const long folds,
        const test_box_overlap& overlap_tester = test_box_overlap(),
        const double adjust_threshold = 0
    );
    /*!
        requires
            - All the requirements of the above cross_validate_object_detection_trainer() routine.
        ensures
            - This function simply invokes cross_validate_object_detection_trainer() with all
              the given arguments and an empty set of ignore rectangles and returns the results.
    !*/

// ----------------------------------------------------------------------------------------

}

#endif // DLIB_CROSS_VALIDATE_OBJECT_DETECTION_TRaINER_ABSTRACT_Hh_


