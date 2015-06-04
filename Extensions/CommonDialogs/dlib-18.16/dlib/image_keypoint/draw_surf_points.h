// Copyright (C) 2013  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#ifndef DLIB_DRAW_SURf_POINTS_H_
#define DLIB_DRAW_SURf_POINTS_H_

#include "surf.h"
#include "../gui_widgets.h"
#include "draw_surf_points_abstract.h"

namespace dlib
{

// ----------------------------------------------------------------------------------------
    inline void draw_surf_points (
        image_window& win,
        const std::vector<surf_point>& sp
    )
    {
        for (unsigned long i = 0; i < sp.size(); ++i)
        {
            const unsigned long radius = static_cast<unsigned long>(sp[i].p.scale*3);
            const point center(sp[i].p.center);
            point direction = center + point(radius,0);
            // SURF descriptors are rotated by sp[i].angle.  So we want to include a visual
            // indication of this rotation on our overlay.
            direction = rotate_point(center, direction, sp[i].angle);

            win.add_overlay(image_display::overlay_circle(center, radius, rgb_pixel(0,255,0)));
            // Draw a line showing the orientation of the SURF descriptor.
            win.add_overlay(center, direction, rgb_pixel(255,0,0));
        }
    }

// ----------------------------------------------------------------------------------------

}

#endif // DLIB_DRAW_SURf_POINTS_H_


