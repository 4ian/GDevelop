// Copyright (C) 2014  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#ifndef DLIB_RENDER_FACE_DeTECTIONS_H_
#define DLIB_RENDER_FACE_DeTECTIONS_H_

#include "full_object_detection.h"
#include "../gui_widgets.h"
#include "render_face_detections_abstract.h"
#include <vector>

namespace dlib
{
    inline std::vector<image_window::overlay_line> render_face_detections (
        const std::vector<full_object_detection>& dets,
        const rgb_pixel color = rgb_pixel(0,255,0)
    )
    {
        std::vector<image_window::overlay_line> lines;
        for (unsigned long i = 0; i < dets.size(); ++i)
        {
            DLIB_CASSERT(dets[i].num_parts() == 68,
                "\t std::vector<image_window::overlay_line> render_face_detections()"
                << "\n\t Invalid inputs were given to this function. "
                << "\n\t dets["<<i<<"].num_parts():  " << dets[i].num_parts() 
            );

            const full_object_detection& d = dets[i];
            for (unsigned long i = 1; i <= 16; ++i)
                lines.push_back(image_window::overlay_line(d.part(i), d.part(i-1), color));

            for (unsigned long i = 28; i <= 30; ++i)
                lines.push_back(image_window::overlay_line(d.part(i), d.part(i-1), color));

            for (unsigned long i = 18; i <= 21; ++i)
                lines.push_back(image_window::overlay_line(d.part(i), d.part(i-1), color));
            for (unsigned long i = 23; i <= 26; ++i)
                lines.push_back(image_window::overlay_line(d.part(i), d.part(i-1), color));
            for (unsigned long i = 31; i <= 35; ++i)
                lines.push_back(image_window::overlay_line(d.part(i), d.part(i-1), color));
            lines.push_back(image_window::overlay_line(d.part(30), d.part(35), color));

            for (unsigned long i = 37; i <= 41; ++i)
                lines.push_back(image_window::overlay_line(d.part(i), d.part(i-1), color));
            lines.push_back(image_window::overlay_line(d.part(36), d.part(41), color));

            for (unsigned long i = 43; i <= 47; ++i)
                lines.push_back(image_window::overlay_line(d.part(i), d.part(i-1), color));
            lines.push_back(image_window::overlay_line(d.part(42), d.part(47), color));

            for (unsigned long i = 49; i <= 59; ++i)
                lines.push_back(image_window::overlay_line(d.part(i), d.part(i-1), color));
            lines.push_back(image_window::overlay_line(d.part(48), d.part(59), color));

            for (unsigned long i = 61; i <= 67; ++i)
                lines.push_back(image_window::overlay_line(d.part(i), d.part(i-1), color));
            lines.push_back(image_window::overlay_line(d.part(60), d.part(67), color));
        }
        return lines;
    }

// ----------------------------------------------------------------------------------------

    inline std::vector<image_window::overlay_line> render_face_detections (
        const full_object_detection& det,
        const rgb_pixel color = rgb_pixel(0,255,0)
    )
    {
        std::vector<full_object_detection> dets;
        dets.push_back(det);
        return render_face_detections(dets, color);
    }

// ----------------------------------------------------------------------------------------

}

#endif // DLIB_RENDER_FACE_DeTECTIONS_H_

