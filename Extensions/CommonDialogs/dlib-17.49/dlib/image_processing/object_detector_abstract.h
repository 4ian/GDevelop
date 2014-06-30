// Copyright (C) 2011  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#undef DLIB_OBJECT_DeTECTOR_ABSTRACT_H__
#ifdef DLIB_OBJECT_DeTECTOR_ABSTRACT_H__

#include "../geometry.h"
#include <vector>
#include "box_overlap_testing_abstract.h"
#include "full_object_detection_abstract.h"

namespace dlib
{

// ----------------------------------------------------------------------------------------

    template <
        typename image_scanner_type,
        typename overlap_tester_type = test_box_overlap
        >
    class object_detector
    {
        /*!
            REQUIREMENTS ON overlap_tester_type
                overlap_tester_type must be an implementation of the test_box_overlap
                object defined in dlib/image_processing/box_overlap_testing_abstract.h.

            REQUIREMENTS ON image_scanner_type
                image_scanner_type must be an implementation of 
                dlib/image_processing/scan_image_pyramid_abstract.h

            WHAT THIS OBJECT REPRESENTS
                This object is a tool for detecting the positions of objects in 
                an image.  In particular, it is a simple container to aggregate 
                an instance of the scan_image_pyramid class, the weight vector 
                needed by scan_image_pyramid, and finally an instance of 
                test_box_overlap.  The test_box_overlap object is used to perform 
                non-max suppression on the output of the scan_image_pyramid object.  
        !*/
    public:
        typedef typename image_scanner_type::feature_vector_type feature_vector_type;

        object_detector (
        );
        /*!
            ensures
                - This detector won't generate any detections when
                  presented with an image.
        !*/

        object_detector (
            const object_detector& item 
        );
        /*!
            ensures
                - #*this is a copy of item
                - #get_scanner() == item.get_scanner()
                  (note that only the "configuration" of item.get_scanner() is copied.
                  I.e. the copy is done using copy_configuration())
        !*/

        object_detector (
            const image_scanner_type& scanner, 
            const overlap_tester_type& overlap_tester,
            const feature_vector_type& w 
        );
        /*!
            requires
                - w.size() == scanner.get_num_dimensions() + 1
                - scanner.get_num_detection_templates() > 0
            ensures
                - When the operator() member function is called it will
                  invoke scanner.detect(w,dets,w(w.size()-1)), suppress
                  overlapping detections, and then report the results.
                - when #*this is used to detect objects, the set of
                  output detections will never contain any overlaps
                  with respect to overlap_tester.  That is, for all 
                  pairs of returned detections A and B, we will always
                  have: overlap_tester(A,B) == false
                - #get_w() == w
                - #get_overlap_tester() == overlap_tester
                - #get_scanner() == scanner
                  (note that only the "configuration" of scanner is copied.
                  I.e. the copy is done using copy_configuration())
        !*/

        const feature_vector_type& get_w (
        ) const;
        /*!
            ensures
                - returns the weight vector used by this object
        !*/

        const overlap_tester_type& get_overlap_tester (
        ) const;
        /*!
            ensures
                - returns the overlap tester used by this object
        !*/

        const image_scanner_type& get_scanner (
        ) const;
        /*!
            ensures
                - returns the image scanner used by this object.  
        !*/

        object_detector& operator= (
            const object_detector& item 
        );
        /*!
            ensures
                - #*this is a copy of item
                - #get_scanner() == item.get_scanner()
                  (note that only the "configuration" of item.get_scanner() is 
                  copied.  I.e. the copy is done using copy_configuration())
                - returns #*this
        !*/

        template <
            typename image_type
            >
        std::vector<rectangle> operator() (
            const image_type& img
        );
        /*!
            requires
                - img == an object which can be accepted by image_scanner_type::load()
            ensures
                - performs object detection on the given image and returns a
                  vector which indicates the locations of all detected objects.
                - The returned vector will be sorted in the sense that the highest
                  confidence detections come first.  E.g. element 0 is the best detection,
                  element 1 the next best, and so on.
                - #get_scanner() will have been loaded with img. Therefore, you can call
                  #get_scanner().get_feature_vector() to obtain the feature vectors or
                  #get_scanner().get_full_object_detection() to get the
                  full_object_detections for the resulting object detection boxes.
        !*/

        template <
            typename image_type
            >
        void operator() (
            const image_type& img,
            std::vector<std::pair<double, rectangle> >& dets,
            double adjust_threshold = 0
        );
        /*!
            requires
                - img == an object which can be accepted by image_scanner_type::load()
            ensures
                - performs object detection on the given image and stores the
                  detected objects into #dets.  In particular, we will have that:
                    - #dets is sorted such that the highest confidence detections 
                      come first.  E.g. element 0 is the best detection, element 1 
                      the next best, and so on.
                    - #dets.size() == the number of detected objects.
                    - #dets[i].first gives the "detection confidence", of the i-th 
                      detection.  This is the detection value output by the scanner 
                      minus the threshold, therefore this is a value > 0.
                    - #dets[i].second == the bounding box for the i-th detection.
                - #get_scanner() will have been loaded with img. Therefore, you can call
                  #get_scanner().get_feature_vector() to obtain the feature vectors or
                  #get_scanner().get_full_object_detection() to get the
                  full_object_detections for the resulting object detection boxes.
                - The detection threshold is adjusted by having adjust_threshold added
                  to it.  Therefore, an adjust_threshold value > 0 makes detecting
                  objects harder while a negative one makes it easier.
        !*/

        template <
            typename image_type
            >
        void operator() (
            const image_type& img,
            std::vector<std::pair<double, full_object_detection> >& final_dets,
            double adjust_threshold = 0
        );
        /*!
            requires
                - img == an object which can be accepted by image_scanner_type::load()
            ensures
                - This function is identical to the above operator() routine, except that
                  it outputs full_object_detections instead of rectangles.  This means that
                  the output includes part locations.  In particular, calling this function
                  is the same as calling the above operator() routine and then using
                  get_scanner().get_full_object_detection() to resolve all the rectangles
                  into full_object_detections.  Therefore, this version of operator() is
                  simply a convenience function for performing this set of operations.
        !*/

        template <
            typename image_type
            >
        void operator() (
            const image_type& img,
            std::vector<full_object_detection>& final_dets,
            double adjust_threshold = 0
        );
        /*!
            requires
                - img == an object which can be accepted by image_scanner_type::load()
            ensures
                - This function is identical to the above operator() routine, except that
                  it doesn't include a double valued score.  That is, it just outputs the
                  full_object_detections.
        !*/
    };

// ----------------------------------------------------------------------------------------

    template <typename T, typename U>
    void serialize (
        const object_detector<T,U>& item,
        std::ostream& out
    );
    /*!
        provides serialization support
    !*/

// ----------------------------------------------------------------------------------------

    template <typename T, typename U>
    void deserialize (
        object_detector<T,U>& item,
        std::istream& in 
    );
    /*!
        provides deserialization support
    !*/

// ----------------------------------------------------------------------------------------

}

#endif // DLIB_OBJECT_DeTECTOR_ABSTRACT_H__

