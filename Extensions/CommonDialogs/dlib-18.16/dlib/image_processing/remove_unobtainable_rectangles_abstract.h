// Copyright (C) 2013  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#undef DLIB_REMOVE_UnOBTAINABLE_RECTANGLES_ABSTRACT_Hh_
#ifdef DLIB_REMOVE_UnOBTAINABLE_RECTANGLES_ABSTRACT_Hh_

#include "scan_image_pyramid_abstract.h"
#include "scan_image_boxes_abstract.h"
#include "scan_image_custom_abstract.h"
#include "scan_fhog_pyramid_abstract.h"
#include "../svm/structural_object_detection_trainer_abstract.h"
#include "../geometry.h"


namespace dlib
{

// ----------------------------------------------------------------------------------------

    template <
        typename image_scanner_type,
        typename image_array_type
        >
    std::vector<std::vector<rectangle> > remove_unobtainable_rectangles (
        const structural_object_detection_trainer<image_scanner_type>& trainer,
        const image_array_type& images,
        std::vector<std::vector<rectangle> >& object_locations
    );
    /*!
        requires
            - image_scanner_type must be either scan_image_boxes, scan_image_pyramid,
              scan_image_custom, or scan_fhog_pyramid.
            - images.size() == object_locations.size()
        ensures
            - Recall that the image scanner objects can't produce all possible rectangles
              as object detections since they only consider a limited subset of all possible
              object positions.  Moreover, the structural_object_detection_trainer requires
              its input training data to not contain any object positions which are unobtainable
              by its scanner object.  Therefore, remove_unobtainable_rectangles() is a tool
              to filter out these unobtainable rectangles from the training data before giving
              it to a structural_object_detection_trainer.
            - This function interprets object_locations[i] as the set of object positions for
              image[i], for all valid i.
            - In particular, this function removes unobtainable rectangles from object_locations
              and also returns a vector V such that:
                - V.size() == object_locations.size()
                - for all valid i:
                    - V[i] == the set of rectangles removed from object_locations[i]
    !*/

// ----------------------------------------------------------------------------------------

}

#endif // DLIB_REMOVE_UnOBTAINABLE_RECTANGLES_ABSTRACT_Hh_


