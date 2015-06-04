// Copyright (C) 2013  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#undef DLIB_FRONTAL_FACE_DETECTOr_ABSTRACT_Hh_
#ifdef DLIB_FRONTAL_FACE_DETECTOr_ABSTRACT_Hh_

#include "object_detector_abstract.h"
#include "scan_fhog_pyramid_abstract.h"
#include "../image_transforms/image_pyramid_abstract.h"

namespace dlib
{
    typedef object_detector<scan_fhog_pyramid<pyramid_down<6> > > frontal_face_detector;

    frontal_face_detector get_frontal_face_detector(
    );
    /*!
        ensures
            - returns an object_detector that is configured to find human faces that are
              looking more or less towards the camera.
    !*/

}

#endif // DLIB_FRONTAL_FACE_DETECTOr_ABSTRACT_Hh_

