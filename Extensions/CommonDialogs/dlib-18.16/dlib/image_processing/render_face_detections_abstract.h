// Copyright (C) 2014  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#undef DLIB_RENDER_FACE_DeTECTIONS_ABSTRACT_H_
#ifdef DLIB_RENDER_FACE_DeTECTIONS_ABSTRACT_H_

#include "full_object_detection_abstract.h"
#include "../gui_widgets.h"

namespace dlib
{

// ----------------------------------------------------------------------------------------

    inline std::vector<image_window::overlay_line> render_face_detections (
        const std::vector<full_object_detection>& dets,
        const rgb_pixel color = rgb_pixel(0,255,0)
    );
    /*!
        requires
            - for all valid i:
                - dets[i].num_parts() == 68
        ensures
            - Interprets the given objects as face detections with parts annotated using
              the iBUG face landmark scheme.  We then return a set of overlay lines that
              will draw the objects onto the screen in a way that properly draws the
              outline of the face features defined by the part locations.
            - returns a vector with dets.size() elements, each containing the lines
              necessary to render a face detection from dets.
    !*/

// ----------------------------------------------------------------------------------------

    inline std::vector<image_window::overlay_line> render_face_detections (
        const full_object_detection& det,
        const rgb_pixel color = rgb_pixel(0,255,0)
    );
    /*!
        requires
            - det.num_parts() == 68
        ensures
            - This function is identical to the above render_face_detections() routine
              except that it takes just a single full_object_detection instead of a
              std::vector of them.
    !*/

// ----------------------------------------------------------------------------------------

}

#endif // DLIB_RENDER_FACE_DeTECTIONS_ABSTRACT_H_


