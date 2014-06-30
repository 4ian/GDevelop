// Copyright (C) 2011  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#ifndef DLIB_DETECTION_TEMPlATE_TOOLS_H__
#define DLIB_DETECTION_TEMPlATE_TOOLS_H__

#include "detection_template_tools_abstract.h"
#include "../geometry.h"
#include "../matrix.h"
#include <utility>
#include <vector>
#include <cmath>

namespace dlib
{

// ----------------------------------------------------------------------------------------

    inline rectangle compute_box_dimensions (
        const double width_to_height_ratio,
        const double area
    )
    {
        // make sure requires clause is not broken
        DLIB_ASSERT(width_to_height_ratio > 0 && area > 0,
            "\t rectangle compute_box_dimensions()"
            << "\n\t Invalid arguments were given to this function. "
            << "\n\t width_to_height_ratio: " << width_to_height_ratio
            << "\n\t area: " << area 
            );

        /*
            width*height == area
            width/height == width_to_height_ratio
        */
        using namespace std;

        const int height = (int)std::floor(std::sqrt(area/width_to_height_ratio) + 0.5);
        const int width  = (int)std::floor(area/height + 0.5);

        return centered_rect(0,0,width,height);
    }

// ----------------------------------------------------------------------------------------

    inline std::vector<rectangle> create_single_box_detection_template (
        const rectangle& object_box 
    )
    {
        std::vector<rectangle> temp;
        temp.push_back(object_box);
        return temp;
    }

// ----------------------------------------------------------------------------------------

    inline std::vector<rectangle> create_overlapped_2x2_detection_template (
        const rectangle& object_box 
    )
    {
        std::vector<rectangle> result;

        const point c = center(object_box);

        result.push_back(rectangle() + c + object_box.tl_corner() + object_box.tr_corner());
        result.push_back(rectangle() + c + object_box.bl_corner() + object_box.br_corner());
        result.push_back(rectangle() + c + object_box.tl_corner() + object_box.bl_corner());
        result.push_back(rectangle() + c + object_box.tr_corner() + object_box.br_corner());

        return result;
    }

// ----------------------------------------------------------------------------------------

    inline std::vector<rectangle> create_grid_detection_template (
        const rectangle& object_box,
        unsigned int cells_x,
        unsigned int cells_y
    )
    {
        // make sure requires clause is not broken
        DLIB_ASSERT(cells_x > 0 && cells_y > 0,
            "\t std::vector<rectangle> create_grid_detection_template()"
            << "\n\t The number of cells along a dimension can't be zero. "
            << "\n\t cells_x: " << cells_x
            << "\n\t cells_y: " << cells_y
            );

        std::vector<rectangle> result;

        const matrix<double,1> x = linspace(object_box.left(), object_box.right(), cells_x+1);
        const matrix<double,1> y = linspace(object_box.top(), object_box.bottom(), cells_y+1);

        for (long j = 0; j+1 < y.size(); ++j)
        {
            for (long i = 0; i+1 < x.size(); ++i)
            {
                const dlib::vector<double,2> tl(x(i),y(j));
                const dlib::vector<double,2> br(x(i+1),y(j+1));
                result.push_back(rectangle(tl,br));
            }
        }

        return result;
    }

// ----------------------------------------------------------------------------------------

}


#endif // DLIB_DETECTION_TEMPlATE_TOOLS_H__


