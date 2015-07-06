// Copyright (C) 2011  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#undef DLIB_SETUP_HAShED_FEATURES_ABSTRACT_Hh_
#ifdef DLIB_SETUP_HAShED_FEATURES_ABSTRACT_Hh_

#include "scan_image_pyramid_abstract.h"
#include "scan_image_boxes_abstract.h"
#include "../lsh/projection_hash_abstract.h"
#include "../image_keypoint/hashed_feature_image_abstract.h"
#include "../image_keypoint/binned_vector_feature_image_abstract.h"

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
        typename image_scanner
        >
    void use_uniform_feature_weights (
        image_scanner& scanner
    );
    /*!
        requires
            - image_scanner should be either scan_image_pyramid or scan_image_boxes and
              should use the hashed_feature_image as its local feature extractor.
        ensures
            - #scanner.get_feature_extractor().uses_uniform_feature_weights() == true
              (i.e. Make the scanner's feature extractor use the uniform feature weighting
              scheme)
    !*/

// ----------------------------------------------------------------------------------------

    template <
        typename image_scanner
        >
    void use_relative_feature_weights (
        image_scanner& scanner
    );
    /*!
        requires
            - image_scanner should be either scan_image_pyramid or scan_image_boxes and
              should use the hashed_feature_image as its local feature extractor.
        ensures
            - #scanner.get_feature_extractor().uses_uniform_feature_weights() == false 
              (i.e. Make the scanner's feature extractor use the relative feature weighting
              scheme)
    !*/

// ----------------------------------------------------------------------------------------

    template <
        typename image_array,
        typename pyramid,
        typename feature_extractor
        template <typename fe, typename hash> class feature_image
        >
    void setup_hashed_features (
        scan_image_pyramid<pyramid, feature_image<feature_extractor, projection_hash> >& scanner,
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
            - feature_image == must be either hashed_feature_image, binned_vector_feature_image,
              or a type with a compatible interface.
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
        template <typename fe, typename hash> class feature_image
        >
    void setup_hashed_features (
        scan_image_pyramid<pyramid, feature_image<feature_extractor, projection_hash> >& scanner,
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
            - feature_image == must be either hashed_feature_image, binned_vector_feature_image,
              or a type with a compatible interface.
        ensures
            - performs: setup_hashed_features(scanner, images, feature_extractor(), bits, num_samples)
        throws
            - image_hash_construction_failure
              This exception is thrown if there is a problem creating the projection_hash.
              This should only happen the images are so small they contain less than 2
              feature vectors.
    !*/

// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------

    template <
        typename image_array,
        typename feature_extractor,
        template <typename fe, typename hash> class feature_image
        typename box_generator
        >
    void setup_hashed_features (
        scan_image_boxes<feature_image<feature_extractor, projection_hash>,box_generator>& scanner,
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
            - feature_image == must be either hashed_feature_image, binned_vector_feature_image,
              or a type with a compatible interface.
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
        typename feature_extractor,
        template <typename fe, typename hash> class feature_image
        typename box_generator
        >
    void setup_hashed_features (
        scan_image_boxes<feature_image<feature_extractor, projection_hash>,box_generator>& scanner,
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
            - feature_image == must be either hashed_feature_image, binned_vector_feature_image,
              or a type with a compatible interface.
        ensures
            - performs: setup_hashed_features(scanner, images, feature_extractor(), bits, num_samples)
        throws
            - image_hash_construction_failure
              This exception is thrown if there is a problem creating the projection_hash.
              This should only happen the images are so small they contain less than 2
              feature vectors.
    !*/

// ----------------------------------------------------------------------------------------

}

#endif // DLIB_SETUP_HAShED_FEATURES_ABSTRACT_Hh_


