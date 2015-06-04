// Copyright (C) 2011  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#undef DLIB_STRUCTURAL_SVM_ObJECT_DETECTION_PROBLEM_ABSTRACT_Hh_
#ifdef DLIB_STRUCTURAL_SVM_ObJECT_DETECTION_PROBLEM_ABSTRACT_Hh_

#include "../matrix.h"
#include "structural_svm_problem_threaded_abstract.h"
#include <sstream>
#include "../image_processing/full_object_detection_abstract.h"
#include "../image_processing/box_overlap_testing.h"

namespace dlib
{

// ----------------------------------------------------------------------------------------

    class impossible_labeling_error : public dlib::error 
    { 
        /*!
            WHAT THIS OBJECT REPRESENTS
                This is the exception thrown by the structural_svm_object_detection_problem
                when it detects that the image_scanner_type it is working with is incapable
                of representing the truth rectangles it has been asked to predict.  

                This kind of problem can happen when the test_box_overlap object indicates
                that two ground truth rectangles overlap and are therefore not allowed to
                both be output at the same time.  Or alternatively, if there are not enough
                detection templates to cover the variety of truth rectangle shapes.
        !*/
    };

// ----------------------------------------------------------------------------------------

    template <
        typename image_scanner_type,
        typename image_array_type 
        >
    class structural_svm_object_detection_problem : public structural_svm_problem_threaded<matrix<double,0,1> >,
                                                    noncopyable
    {
        /*!
            REQUIREMENTS ON image_scanner_type
                image_scanner_type must be an implementation of 
                dlib/image_processing/scan_fhog_pyramid_abstract.h or
                dlib/image_processing/scan_image_custom_abstract.h or
                dlib/image_processing/scan_image_pyramid_abstract.h or
                dlib/image_processing/scan_image_boxes_abstract.h

            REQUIREMENTS ON image_array_type
                image_array_type must be an implementation of dlib/array/array_kernel_abstract.h 
                and it must contain objects which can be accepted by image_scanner_type::load().

            WHAT THIS OBJECT REPRESENTS
                This object is a tool for learning the parameter vector needed to use a
                scan_image_pyramid, scan_fhog_pyramid, scan_image_custom, or
                scan_image_boxes object.  

                It learns the parameter vector by formulating the problem as a structural 
                SVM problem.  The exact details of the method are described in the paper 
                Max-Margin Object Detection by Davis E. King (http://arxiv.org/abs/1502.00046).


        !*/

    public:

        structural_svm_object_detection_problem(
            const image_scanner_type& scanner,
            const test_box_overlap& overlap_tester,
            const bool auto_overlap_tester,
            const image_array_type& images,
            const std::vector<std::vector<full_object_detection> >& truth_object_detections,
            const std::vector<std::vector<rectangle> >& ignore,
            const test_box_overlap& ignore_overlap_tester,
            unsigned long num_threads = 2
        );
        /*!
            requires
                - is_learning_problem(images, truth_object_detections)
                - ignore.size() == images.size()
                - scanner.get_num_detection_templates() > 0
                - scanner.load(images[0]) must be a valid expression.
                - for all valid i, j:
                    - truth_object_detections[i][j].num_parts() == scanner.get_num_movable_components_per_detection_template() 
                    - all_parts_in_rect(truth_object_detections[i][j]) == true
            ensures
                - This object attempts to learn a mapping from the given images to the
                  object locations given in truth_object_detections.  In particular, it
                  attempts to learn to predict truth_object_detections[i] based on
                  images[i].  Or in other words, this object can be used to learn a
                  parameter vector, w, such that an object_detector declared as:
                    object_detector<image_scanner_type> detector(scanner,get_overlap_tester(),w)
                  results in a detector object which attempts to compute the locations of
                  all the objects in truth_object_detections.  So if you called
                  detector(images[i]) you would hopefully get a list of rectangles back
                  that had truth_object_detections[i].size() elements and contained exactly
                  the rectangles indicated by truth_object_detections[i].
                - if (auto_overlap_tester == true) then
                    - #get_overlap_tester() == a test_box_overlap object that is configured
                      using the find_tight_overlap_tester() routine and the contents of
                      truth_object_detections. 
                - else
                    - #get_overlap_tester() == overlap_tester
                - #get_match_eps() == 0.5
                - This object will use num_threads threads during the optimization 
                  procedure.  You should set this parameter equal to the number of 
                  available processing cores on your machine.
                - #get_loss_per_missed_target() == 1
                - #get_loss_per_false_alarm() == 1
                - for all valid i:
                    - Within images[i] any detections that match against a rectangle in
                      ignore[i], according to ignore_overlap_tester, are ignored.  That is,
                      the optimizer doesn't care if the detector outputs a detection that
                      matches any of the ignore rectangles or if it fails to output a
                      detection for an ignore rectangle.  Therefore, if there are objects
                      in your dataset that you are unsure you want to detect or otherwise
                      don't care if the detector gets or doesn't then you can mark them
                      with ignore rectangles and the optimizer will simply ignore them. 
        !*/

        test_box_overlap get_overlap_tester (
        ) const;
        /*!
            ensures
                - returns the overlap tester used by this object.  
        !*/

        void set_match_eps (
            double eps
        );
        /*!
            requires
                - 0 < eps < 1
            ensures
                - #get_match_eps() == eps
        !*/

        double get_match_eps (
        ) const;
        /*!
            ensures
                - returns the amount of alignment necessary for a detection to be considered
                  as matching with a ground truth rectangle.  The precise formula for determining
                  if two rectangles match each other is the following, rectangles A and B match 
                  if and only if:
                    A.intersect(B).area()/(A+B).area() > get_match_eps()
        !*/

        double get_loss_per_missed_target (
        ) const;
        /*!
            ensures
                - returns the amount of loss experienced for failing to detect one of the
                  targets.
        !*/

        void set_loss_per_missed_target (
            double loss
        );
        /*!
            requires
                - loss > 0
            ensures
                - #get_loss_per_missed_target() == loss
        !*/

        double get_loss_per_false_alarm (
        ) const;
        /*!
            ensures
                - returns the amount of loss experienced for emitting a false alarm detection.
                  Or in other words, the loss for generating a detection that doesn't correspond 
                  to one of the truth rectangles.
        !*/

        void set_loss_per_false_alarm (
            double loss
        );
        /*!
            requires
                - loss > 0
            ensures
                - #get_loss_per_false_alarm() == loss
        !*/

    };

// ----------------------------------------------------------------------------------------

}

#endif // DLIB_STRUCTURAL_SVM_ObJECT_DETECTION_PROBLEM_ABSTRACT_Hh_



