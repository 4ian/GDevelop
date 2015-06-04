// Copyright (C) 2011  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#undef DLIB_OBJECT_DeTECTOR_ABSTRACT_Hh_
#ifdef DLIB_OBJECT_DeTECTOR_ABSTRACT_Hh_

#include "../geometry.h"
#include <vector>
#include "box_overlap_testing_abstract.h"
#include "full_object_detection_abstract.h"

namespace dlib
{

// ----------------------------------------------------------------------------------------

    struct rect_detection
    {
        double detection_confidence;
        unsigned long weight_index;
        rectangle rect;
    };

    struct full_detection
    {
        double detection_confidence;
        unsigned long weight_index;
        full_object_detection rect;
    };

// ----------------------------------------------------------------------------------------

    template <
        typename image_scanner_type_
        >
    class object_detector
    {
        /*!
            REQUIREMENTS ON image_scanner_type_
                image_scanner_type_ must be an implementation of 
                dlib/image_processing/scan_image_pyramid_abstract.h or 
                dlib/image_processing/scan_fhog_pyramid.h or 
                dlib/image_processing/scan_image_custom.h or 
                dlib/image_processing/scan_image_boxes_abstract.h 

            WHAT THIS OBJECT REPRESENTS
                This object is a tool for detecting the positions of objects in an image.
                In particular, it is a simple container to aggregate an instance of an image 
                scanner (i.e. scan_image_pyramid, scan_fhog_pyramid, scan_image_custom, or
                scan_image_boxes), the weight vector needed by one of these image scanners,
                and finally an instance of test_box_overlap.  The test_box_overlap object
                is used to perform non-max suppression on the output of the image scanner
                object.  

                Note further that this object can contain multiple weight vectors.  In this
                case, it will run the image scanner multiple times, once with each of the
                weight vectors.  Then it will aggregate the results from all runs, perform
                non-max suppression and then return the results.  Therefore, the object_detector 
                can also be used as a container for a set of object detectors that all use
                the same image scanner but different weight vectors.  This is useful since
                the object detection procedure has two parts.  A loading step where the
                image is loaded into the scanner, then a detect step which uses the weight
                vector to locate objects in the image.  Since the loading step is independent 
                of the weight vector it is most efficient to run multiple detectors by
                performing one load into a scanner followed by multiple detect steps.  This
                avoids unnecessarily loading the same image into the scanner multiple times.  
        !*/
    public:
        typedef image_scanner_type_ image_scanner_type;
        typedef typename image_scanner_type::feature_vector_type feature_vector_type;

        object_detector (
        );
        /*!
            ensures
                - This detector won't generate any detections when
                  presented with an image.
                - #num_detectors() == 0
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
            const test_box_overlap& overlap_tester,
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
                - #num_detectors() == 1
        !*/

        object_detector (
            const image_scanner_type& scanner, 
            const test_box_overlap& overlap_tester,
            const std::vector<feature_vector_type>& w 
        );
        /*!
            requires
                - for all valid i:
                    - w[i].size() == scanner.get_num_dimensions() + 1
                - scanner.get_num_detection_templates() > 0
                - w.size() > 0
            ensures
                - When the operator() member function is called it will invoke
                  get_scanner().detect(w[i],dets,w[i](w[i].size()-1)) for all valid i.  Then it
                  will take all the detections output by the calls to detect() and suppress
                  overlapping detections, and finally report the results.
                - when #*this is used to detect objects, the set of output detections will
                  never contain any overlaps with respect to overlap_tester.  That is, for
                  all pairs of returned detections A and B, we will always have:
                    overlap_tester(A,B) == false
                - for all valid i:
                    - #get_w(i) == w[i]
                - #num_detectors() == w.size()
                - #get_overlap_tester() == overlap_tester
                - #get_scanner() == scanner
                  (note that only the "configuration" of scanner is copied.
                  I.e. the copy is done using copy_configuration())
        !*/

        explicit object_detector (
            const std::vector<object_detector>& detectors
        );
        /*!
            requires
                - detectors.size() != 0
                - All the detectors must use compatibly configured scanners.  That is, it
                  must make sense for the weight vector from one detector to be used with
                  the scanner from any other.
                - for all valid i:
                    - detectors[i].get_scanner().get_num_dimensions() == detectors[0].get_scanner().get_num_dimensions()
                      (i.e. all the detectors use scanners that use the same kind of feature vectors.)
            ensures
                - Very much like the above constructor, this constructor takes all the
                  given detectors and packs them into #*this.  That is, invoking operator()
                  on #*this will run all the detectors, perform non-max suppression, and
                  then report the results.
                - When #*this is used to detect objects, the set of output detections will
                  never contain any overlaps with respect to overlap_tester.  That is, for
                  all pairs of returned detections A and B, we will always have:
                    overlap_tester(A,B) == false
                - #num_detectors() == The sum of detectors[i].num_detectors() for all valid i. 
                - #get_overlap_tester() == detectors[0].get_overlap_tester()
                - #get_scanner() == detectors[0].get_scanner()
                  (note that only the "configuration" of scanner is copied.  I.e. the copy
                  is done using copy_configuration())
        !*/

        unsigned long num_detectors (
        ) const; 
        /*!
            ensures
                - returns the number of weight vectors in this object.  Since each weight
                  vector logically represents an object detector, this returns the number
                  of object detectors contained in this object.
        !*/

        const feature_vector_type& get_w (
            unsigned long idx = 0
        ) const;
        /*!
            requires
                - idx < num_detectors
            ensures
                - returns the idx-th weight vector loaded into this object.  All the weight vectors
                  have the same dimension and logically each represents a different detector.
        !*/

        const test_box_overlap& get_overlap_tester (
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
        void operator() (
            const image_type& img,
            std::vector<rect_detection>& dets,
            double adjust_threshold = 0
        );
        /*!
            requires
                - img == an object which can be accepted by image_scanner_type::load()
            ensures
                - Performs object detection on the given image and stores the detected
                  objects into #dets.  In particular, we will have that:
                    - #dets is sorted such that the highest confidence detections come
                      first.  E.g. element 0 is the best detection, element 1 the next
                      best, and so on.
                    - #dets.size() == the number of detected objects.
                    - #dets[i].detection_confidence == The strength of the i-th detection.
                      Larger values indicate that the detector is more confident that
                      #dets[i] is a correct detection rather than being a false alarm.
                      Moreover, the detection_confidence is equal to the detection value
                      output by the scanner minus the threshold value stored at the end of
                      the weight vector in get_w(#dets[i].weight_index). 
                    - #dets[i].weight_index == the index for the weight vector that
                      generated this detection. 
                    - #dets[i].rect == the bounding box for the i-th detection.
                - #get_scanner() will have been loaded with img. Therefore, you can call
                  #get_scanner().get_feature_vector() to obtain the feature vectors or
                  #get_scanner().get_full_object_detection() to get the
                  full_object_detections for the resulting object detection boxes.
                - The detection threshold is adjusted by having adjust_threshold added to
                  it.  Therefore, an adjust_threshold value > 0 makes detecting objects
                  harder while a negative value makes it easier.  Moreover, the following
                  will be true for all valid i:
                    - #dets[i].detection_confidence >= adjust_threshold
                  This means that, for example, you can obtain the maximum possible number
                  of detections by setting adjust_threshold equal to negative infinity.
        !*/

        template <
            typename image_type
            >
        void operator() (
            const image_type& img,
            std::vector<full_detection>& dets,
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
        std::vector<rectangle> operator() (
            const image_type& img,
            const adjust_threshold = 0
        );
        /*!
            requires
                - img == an object which can be accepted by image_scanner_type::load()
            ensures
                - This function is identical to the above operator() routine, except that
                  it returns a std::vector<rectangle> which contains just the bounding
                  boxes of all the detections. 
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
                      detection.  This is the detection value output by the scanner minus
                      the threshold value stored at the end of the weight vector in get_w(). 
                    - #dets[i].second == the bounding box for the i-th detection.
                - #get_scanner() will have been loaded with img. Therefore, you can call
                  #get_scanner().get_feature_vector() to obtain the feature vectors or
                  #get_scanner().get_full_object_detection() to get the
                  full_object_detections for the resulting object detection boxes.
                - The detection threshold is adjusted by having adjust_threshold added to
                  it.  Therefore, an adjust_threshold value > 0 makes detecting objects
                  harder while a negative value makes it easier.  Moreover, the following
                  will be true for all valid i:
                    - #dets[i].first >= adjust_threshold
                  This means that, for example, you can obtain the maximum possible number
                  of detections by setting adjust_threshold equal to negative infinity.
        !*/

        template <
            typename image_type
            >
        void operator() (
            const image_type& img,
            std::vector<std::pair<double, full_object_detection> >& dets,
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
            std::vector<full_object_detection>& dets,
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

    template <typename T>
    void serialize (
        const object_detector<T>& item,
        std::ostream& out
    );
    /*!
        provides serialization support.  Note that this function only saves the
        configuration part of item.get_scanner().  That is, we use the scanner's
        copy_configuration() function to get a copy of the scanner that doesn't contain any
        loaded image data and we then save just the configuration part of the scanner.
        This means that any serialized object_detectors won't remember any images they have
        processed but will otherwise contain all their state and be able to detect objects
        in new images.
    !*/

// ----------------------------------------------------------------------------------------

    template <typename T>
    void deserialize (
        object_detector<T>& item,
        std::istream& in 
    );
    /*!
        provides deserialization support
    !*/

// ----------------------------------------------------------------------------------------

}

#endif // DLIB_OBJECT_DeTECTOR_ABSTRACT_Hh_

