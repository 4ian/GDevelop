// Copyright (C) 2013  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#undef DLIB_DRAW_SURf_POINTS_ABSTRACT_H_
#ifdef DLIB_DRAW_SURf_POINTS_ABSTRACT_H_

#include "surf_abstract.h"
#include "../gui_widgets.h"

namespace dlib
{

// ----------------------------------------------------------------------------------------

    void draw_surf_points (
        image_window& win,
        const std::vector<surf_point>& sp
    );
    /*!
        ensures
            - draws all the SURF points in sp onto the given image_window.  They
              are drawn as overlay circles with extra lines to indicate the rotation
              of the SURF descriptor.
    !*/

// ----------------------------------------------------------------------------------------

}

#endif // DLIB_DRAW_SURf_POINTS_ABSTRACT_H_

