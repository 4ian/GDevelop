// Copyright (C) 2011  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#undef DLIB_SCAN_IMaGE_PYRAMID_TOOLS_ABSTRACT_H__
#ifdef DLIB_SCAN_IMaGE_PYRAMID_TOOLS_ABSTRACT_H__

#include "scan_image_pyramid_abstract.h"
#include "../lsh/projection_hash_abstract.h"
#include "../image_keypoint/hashed_feature_image_abstract.h"

namespace dlib
{

// ----------------------------------------------------------------------------------------

    class image_hash_construction_failure : public error
    {
        /*!
            WHAT THIS OBJECT REPRESENTS
                This is the exception object used by the routines in this file.
        !*/
    };

// ----------------------------------------------------------------------------------------

    template <
        typename image_array,
        typename pyramid,
        typename feature_extractor
        >
    void setup_hashed_features (
        scan_image_pyramid<pyramid, hashed_feature_image<feature_extractor, projection_hash> >& scanner,
        const image_array& images,
        const feature_extractor& fe,
        int bits,
        unsigned long num_samples = 200000
    );
    /*!
        requires
            - 0 < bits <= 32
            - num_samples > 1
            - images.size() > 0
            - it must be valid to pass images[0] into scanner.load().
              (also, image_array must be an implementation of dlib/array/array_kernel_abstract.h)
        ensures
            - Creates a projection_hash suitable for hashing the feature vectors produced by
              fe and then configures scanner to use this hash function.
            - The hash function will map vectors into integers in the range [0, pow(2,bits))
            - The hash function will be setup so that it hashes a random sample of num_samples
              vectors from fe such that each bin ends up with roughly the same number of 
              elements in it.
        throws
            - image_hash_construction_failure
              This exception is thrown if there is a problem creating the projection_hash.
              This should only happen the images are so small they contain less than 2
              feature vectors.
    !*/

// ----------------------------------------------------------------------------------------

    template <
        typename image_array,
        typename pyramid,
        typename feature_extractor
        >
    void setup_hashed_features (
        scan_image_pyramid<pyramid, hashed_feature_image<feature_extractor, projection_hash> >& scanner,
        const image_array& images,
        int bits,
        unsigned long num_samples = 200000
    );
    /*!
        requires
            - 0 < bits <= 32
            - num_samples > 1
            - images.size() > 0
            - it must be valid to pass images[0] into scanner.load().
              (also, image_array must be an implementation of dlib/array/array_kernel_abstract.h)
        ensures
            - performs: setup_hashed_features(scanner, images, feature_extractor(), bits, num_samples)
        throws
            - image_hash_construction_failure
              This exception is thrown if there is a problem creating the projection_hash.
              This should only happen the images are so small they contain less than 2
              feature vectors.
    !*/

// ----------------------------------------------------------------------------------------

    template <
        typename image_scanner_type
        >
    std::vector<rectangle> determine_object_boxes (
        const image_scanner_type& scanner,
        const std::vector<rectangle>& rects,
        double min_match_score
    );
    /*!
        requires
            - 0 < min_match_score <= 1
            - image_scanner_type == an implementation of the scan_image_pyramid
              object defined in dlib/image_processing/scan_image_pyramid_tools_abstract.h
        ensures
            - returns a set of object boxes which, when used as detection
              templates with the given scanner, can attain at least
              min_match_score alignment with every element of rects.  Note that
              the alignment between two rectangles A and B is defined as
                (A.intersect(B).area())/(double)(A+B).area()
    !*/

// ----------------------------------------------------------------------------------------

    template <
        typename image_scanner_type
        >
    std::vector<rectangle> determine_object_boxes (
        const image_scanner_type& scanner,
        const std::vector<std::vector<rectangle> >& rects,
        double min_match_score
    );
    /*!
        requires
            - 0 < min_match_score <= 1
            - image_scanner_type == an implementation of the scan_image_pyramid
              object defined in dlib/image_processing/scan_image_pyramid_tools_abstract.h
        ensures
            - copies all rectangles in rects into a std::vector<rectangle> object, call it
              R.  Then this function returns determine_object_boxes(scanner,R,min_match_score).
              That is, it just called the version of determine_object_boxes() defined above
              and returns the results.
    !*/

// ----------------------------------------------------------------------------------------

    template <
        typename image_scanner_type
        >
    void setup_grid_detection_templates (
        image_scanner_type& scanner,
        const std::vector<std::vector<rectangle> >& rects,
        unsigned int cells_x,
        unsigned int cells_y,
        double min_match_score = 0.75
    );
    /*!
        requires
            - cells_x > 0
            - cells_y > 0
            - 0 < min_match_score <= 1
            - image_scanner_type == an implementation of the scan_image_pyramid
              object defined in dlib/image_processing/scan_image_pyramid_tools_abstract.h
        ensures
            - uses determine_object_boxes(scanner,rects,min_match_score) to obtain a set of
              object boxes and then adds them to the given scanner object as detection templates.
              Also uses create_grid_detection_template(object_box, cells_x, cells_y) to create
              each feature extraction region.  Therefore, the detection templates will extract
              features from a regular grid inside each object box.
    !*/
    
// ----------------------------------------------------------------------------------------

    template <
        typename image_scanner_type
        >
    void setup_grid_detection_templates_verbose (
        image_scanner_type& scanner,
        const std::vector<std::vector<rectangle> >& rects,
        unsigned int cells_x,
        unsigned int cells_y,
        double min_match_score = 0.75
    );
    /*!
        requires
            - cells_x > 0
            - cells_y > 0
            - 0 < min_match_score <= 1
            - image_scanner_type == an implementation of the scan_image_pyramid
              object defined in dlib/image_processing/scan_image_pyramid_tools_abstract.h
        ensures
            - this function is identical to setup_grid_detection_templates() except
              that it also outputs the selected detection templates to standard out.
    !*/
}

#endif // DLIB_SCAN_IMaGE_PYRAMID_TOOLS_ABSTRACT_H__

