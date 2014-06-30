// Copyright (C) 2008  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#undef DLIB_EDGE_DETECTOr_ABSTRACT_
#ifdef DLIB_EDGE_DETECTOr_ABSTRACT_

#include "../pixel.h"

namespace dlib
{

// ----------------------------------------------------------------------------------------

    template <
        typename T
        >
    inline char edge_orientation (
        const T& x,
        const T& y
    );
    /*!
        ensures
            - returns the orientation of the line drawn from the origin to the point (x,y).
              The orientation is represented pictorially using the four ascii 
              characters /,|,\, and -.
            - if (the line is horizontal) then 
                returns '-' 
            - if (the line is vertical) then 
                returns '|' 
            - if (the line is diagonal with a positive slope) then 
                returns '/' 
            - if (the line is diagonal with a negative slope) then 
                returns '\\' 
    !*/

// ----------------------------------------------------------------------------------------

    template <
        typename in_image_type,
        typename out_image_type
        >
    void sobel_edge_detector (
        const in_image_type& in_img,
        out_image_type& horz,
        out_image_type& vert
    );
    /*!
        requires
            - in_image_type == is an implementation of array2d/array2d_kernel_abstract.h
            - out_image_type == is an implementation of array2d/array2d_kernel_abstract.h
            - pixel_traits<typename in_image_type::type> must be defined
            - pixel_traits<typename out_image_type::type>::is_unsigned == false
            - is_same_object(in_img,horz) == false
            - is_same_object(in_img,vert) == false
            - is_same_object(horz,vert) == false
        ensures
            - Applies the sobel edge detector to the given input image and stores the resulting
              edge detections in the horz and vert images
            - #horz.nr() == in_img.nr()
            - #horz.nc() == in_img.nc()
            - #vert.nr() == in_img.nr()
            - #vert.nc() == in_img.nc()
            - for all valid r and c:    
                - #horz[r][c] == the magnitude of the horizontal gradient at the point in_img[r][c]
                - #vert[r][c] == the magnitude of the vertical gradient at the point in_img[r][c]
                - edge_orientation(#vert[r][c], #horz[r][c]) == the edge direction at this point in 
                  the image
    !*/
    
// ----------------------------------------------------------------------------------------

    template <
        typename in_image_type,
        typename out_image_type
        >
    void suppress_non_maximum_edges (
        const in_image_type& horz,
        const in_image_type& vert,
        out_image_type& out_img
    );
    /*!
        requires
            - in_image_type == is an implementation of array2d/array2d_kernel_abstract.h
            - out_image_type == is an implementation of array2d/array2d_kernel_abstract.h
            - pixel_traits<typename out_image_type::type> must be defined
            - horz.nr() == vert.nr()
            - horz.nc() == vert.nc()
            - is_same_object(out_img, horz) == false
            - is_same_object(out_img, vert) == false
            - in_image_type::type == A signed scalar type (e.g. int, double, etc.) 
        ensures
            - #out_img.nr() = horz.nr()
            - #out_img.nc() = horz.nc()
            - let edge_strength(r,c) == sqrt(pow(horz[r][c],2) + pow(vert[r][c],2))
              (i.e. The Euclidean norm of the gradient)
            - for all valid r and c:
                - if (edge_strength(r,c) is at a maximum with respect to its 2 neighboring
                  pixels along the line given by edge_orientation(vert[r][c],horz[r][c])) then
                    - performs assign_pixel(#out_img[r][c], edge_strength(r,c))
                - else
                    - performs assign_pixel(#out_img[r][c], 0)
    !*/
    
// ----------------------------------------------------------------------------------------

}

#endif // DLIB_EDGE_DETECTOr_ABSTRACT_


