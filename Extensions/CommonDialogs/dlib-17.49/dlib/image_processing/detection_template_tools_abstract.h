// Copyright (C) 2011  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#undef DLIB_DETECTION_TEMPlATE_TOOLS_ABSTRACT_H__
#ifdef DLIB_DETECTION_TEMPlATE_TOOLS_ABSTRACT_H__

#include "../geometry.h"
#include <utility>
#include <vector>

namespace dlib
{

// ----------------------------------------------------------------------------------------

    rectangle compute_box_dimensions (
        const double width_to_height_ratio,
        const double area
    );
    /*!
        requires
            - area > 0
            - width_to_height_ratio > 0
        ensures
            - returns a rectangle with the given area and width_to_height_ratio.
            - In particular, returns a rectangle R such that:
                - R.area() == area (to within integer precision)
                - R.width()/R.height() == width_to_height_ratio (to within integer precision)
                - center(R) == point(0,0)
    !*/

// ----------------------------------------------------------------------------------------

    std::vector<rectangle> create_single_box_detection_template (
        const rectangle& object_box 
    );
    /*!
        ensures
            - returns a vector that contains only object_box.  
            - In particular, returns a vector V such that:
                - V.size() == 1
                - V[0] == object_box
    !*/

// ----------------------------------------------------------------------------------------

    std::vector<rectangle> create_overlapped_2x2_detection_template (
        const rectangle& object_box 
    );
    /*!
        ensures
            - Divides object_box up into four overlapping regions, the
              top half, bottom half, left half, and right half.  These
              four rectangles are returned inside a std::vector.
            - In particular, returns a vector V such that:
                - V.size() == 4
                - V[0] == top half of object_box 
                - V[1] == bottom half of object_box 
                - V[2] == left half of object_box 
                - V[3] == right half of object_box 
                - for all valid i: object_box.contains(V[i]) == true
    !*/

// ----------------------------------------------------------------------------------------

    std::vector<rectangle> create_grid_detection_template (
        const rectangle& object_box,
        unsigned int cells_x,
        unsigned int cells_y
    );
    /*!
        requires
            - cells_x > 0
            - cells_y > 0
        ensures
            - Divides object_box up into a grid and returns a vector 
              containing all the rectangles corresponding to elements
              of the grid.  Moreover, the grid will be cells_x elements
              wide and cells_y elements tall.
            - In particular, returns a vector V such that:
                - V.size() == cells_x*cells_y 
                - for all valid i: 
                    - object_box.contains(V[i]) == true
                    - V[i] == The rectangle corresponding to the ith grid
                      element. 
    !*/

// ----------------------------------------------------------------------------------------

}


#endif // DLIB_DETECTION_TEMPlATE_TOOLS_ABSTRACT_H__



