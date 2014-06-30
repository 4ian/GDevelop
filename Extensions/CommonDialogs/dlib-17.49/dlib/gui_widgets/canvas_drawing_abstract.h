// Copyright (C) 2005  Davis E. King (davis@dlib.net), and Nils Labugt
// License: Boost Software License   See LICENSE.txt for the full license.
#undef DLIB_GUI_CANVAS_DRAWINg_ABSTRACT_
#ifdef DLIB_GUI_CANVAS_DRAWINg_ABSTRACT_ 

#include "../gui_core.h"
#include "../pixel.h"

namespace dlib
{

// ----------------------------------------------------------------------------------------

    template <
        typename pixel_type
        >
    void draw_line (
        const canvas& c,
        const point& p1,
        const point& p2,
        const pixel_type& pixel = rgb_pixel(0,0,0),
        const rectangle& area = rectangle(-infinity,-infinity,infinity,infinity)
    );
    /*!
        requires
            - pixel_traits<pixel_type> is defined
        ensures
            - draws the part of the line from p1 to p1 that overlaps with
              the canvas and area onto the canvas.  
            - Uses the given pixel color.
    !*/

// ----------------------------------------------------------------------------------------

    template <
        typename pixel_type
        >
    void draw_rectangle (
        const canvas& c,
        rectangle rect,
        const pixel_type& pixel = rgb_pixel(0,0,0),
        const rectangle& area = rectangle(-infinity,-infinity,infinity,infinity)
    );
    /*!
        requires
            - pixel_traits<pixel_type> is defined
        ensures
            - Draws the part of the rectangle that overlaps with
              the canvas and area onto the canvas.  
            - Uses the given pixel color.
    !*/

// ----------------------------------------------------------------------------------------

    template <
        typename pixel_type
        >
    void draw_circle (
        const canvas& c,
        const point& center_point,
        double radius,
        const pixel_type& pixel = rgb_pixel(0,0,0),
        const rectangle& area = rectangle(-infinity,-infinity,infinity,infinity)
    );
    /*!
        requires
            - pixel_traits<pixel_type> is defined
        ensures
            - draws the part of the circle centered at center_point with the given radius 
              that overlaps with the canvas and area onto the canvas.  
            - Uses the given pixel color.
    !*/

// ----------------------------------------------------------------------------------------

    template <
        typename pixel_type
        >
    void draw_pixel (
        const canvas& c,
        const point& p,
        const pixel_type& pixel 
    );
    /*!
        requires
            - pixel_traits<pixel_type> is defined
        ensures
            - if (c.contains(p)) then
                - sets the pixel in c that represents the point p to the 
                  given pixel color.
    !*/

// ----------------------------------------------------------------------------------------

    template <
        typename pixel_type
        >
    void draw_solid_circle (
        const canvas& c,
        const point& center_point,
        double radius,
        const pixel_type& pixel = rgb_pixel(0,0,0),
        const rectangle& area = rectangle(-infinity,-infinity,infinity,infinity)
    );
    /*!
        requires
            - pixel_traits<pixel_type> is defined
        ensures
            - draws the part of the solid circle centered at center_point with the given 
              radius that overlaps with the canvas and area onto the canvas.  
              ("solid" means that the interior is also filled in with the given
              pixel color)
            - Uses the given pixel color.
    !*/

// ----------------------------------------------------------------------------------------

    void draw_button_down (
        const canvas& c,
        const rectangle& btn,
        unsigned char alpha = 255
    );
    /*!
        requires
            - 0 <= alpha <= 255
        ensures
            - draws the border of a button onto canvas c:
                - the border will be that of a button that is depressed
                - only the part of the border that overlaps with the canvas object
                  will be drawn.
                - the border will be for the button whose area is defined by the
                  rectangle btn.
            - performs alpha blending such that the button is drawn with full opacity 
              when alpha is 255 and fully transparent when alpha is 0.
    !*/

// ----------------------------------------------------------------------------------------

    void draw_sunken_rectangle (
        const canvas& c,
        const rectangle& border,
        unsigned char alpha = 255
    );
    /*!
        requires
            - 0 <= alpha <= 255
        ensures
            - draws a sunken rectangle around the given border.
              (This is the type of border used for text_fields and
              check_boxes and the like).
            - performs alpha blending such that the rectangle is drawn with full opacity 
              when alpha is 255 and fully transparent when alpha is 0.
    !*/

// ----------------------------------------------------------------------------------------

    void draw_button_up (
        const canvas& c,
        const rectangle& btn,
        unsigned char alpha = 255
    );
    /*!
        requires
            - 0 <= alpha <= 255
        ensures
            - draws the border of a button onto canvas c:
                - the border will be that of a button that is NOT depressed
                - only the part of the border that overlaps with the canvas object
                  will be drawn.
                - the border will be for the button whose area is defined by the
                  rectangle btn.
            - performs alpha blending such that the button is drawn with full opacity 
              when alpha is 255 and fully transparent when alpha is 0.
    !*/

// ----------------------------------------------------------------------------------------

    template <
        typename pixel_type
        >
    void draw_checkered (
        const canvas& c,
        const rectangle& area,
        const pixel_type& pixel1,
        const pixel_type& pixel2
    );
    /*!
        requires
            - pixel_traits<pixel_type> is defined
        ensures
            - fills the area on the given canvas defined by the rectangle area with a checkers 
              board pattern where every other pixel gets assigned either pixel1 or pixel2.
    !*/

// ----------------------------------------------------------------------------------------

    template <
        typename image_type 
        >
    void draw_image (
        const canvas& c
        const point& p,
        const image_type& image,
        const rectangle& area = rectangle(-infinity,-infinity,infinity,infinity)
    );
    /*!
        requires
            - image_type == an implementation of array2d/array2d_kernel_abstract.h
            - pixel_traits<typename image_type::type> is defined
        ensures
            - draws the given image object onto the canvas such that the upper left corner of the
              image will appear at the point p in the canvas's window.  (note that the
              upper left corner of the image is assumed to be the pixel image[0][0] and the
              lower right corner of the image is assumed to be image[image.nr()-1][image.nc()-1])
            - only draws the part of the image that overlaps with the area rectangle
    !*/

// ----------------------------------------------------------------------------------------

    template <
        typename pixel_type
        >
    void fill_rect (
        const canvas& c,
        const rectangle& rect,
        const pixel_type& pixel
    );
    /*!
        requires
            - pixel_traits<pixel_type> is defined
        ensures
            - fills the area defined by rect in the given canvas with the given pixel color.
    !*/

// ----------------------------------------------------------------------------------------

    template <
        typename pixel_type
        >
    void fill_rect_with_vertical_gradient (
        const canvas& c,
        const rectangle& rect,
        const pixel_type& pixel_top,
        const pixel_type& pixel_bottom,
        const rectangle& area = rectangle(-infinity,-infinity,infinity,infinity)
    );
    /*!
        requires
            - pixel_traits<pixel_type> is defined
        ensures
            - fills the rectangle defined by rect in the given canvas with the given colors.  
              The top of the area will have the pixel_top color and will slowly fade 
              towards the pixel_bottom color towards the bottom of rect.
            - only draws the part of the image that overlaps with the area rectangle
    !*/

// ----------------------------------------------------------------------------------------

    template <
        typename pixel_type
        >
    void fill_gradient_rounded (
        const canvas& c,
        const rectangle& rect,
        unsigned long radius,
        const pixel_type& top_color,
        const pixel_type& bottom_color,
        const rectangle& area = rectangle(-infinity,-infinity,infinity,infinity)
    );
    /*!
        requires
            - pixel_traits<pixel_type> is defined
        ensures
            - Fills the region defined by rect in the given canvas with the given colors.  
              The top of the region will have the top_color color and will slowly fade 
              towards the bottom_color color towards the bottom of rect.
            - The drawn rectangle will have rounded corners and with the amount of 
            - rounding given by the radius argument.
            - only the part of this object that overlaps with area and the canvas
              will be drawn on the canvas
    !*/

// ----------------------------------------------------------------------------------------

    template <
        typename pixel_type
        >
    void draw_rounded_rectangle (
        const canvas& c,
        const rectangle& rect,
        unsigned radius,
        const pixel_type& color,
        const rectangle& area = rectangle(-infinity,-infinity,infinity,infinity)
    );
    /*!
        requires
            - pixel_traits<pixel_type> is defined
        ensures
            - Draws the part of the rectangle that overlaps with
              the canvas onto the canvas.  
            - The drawn rectangle will have rounded corners and with the amount of 
              rounding given by the radius argument.
            - Uses the given pixel color.
            - only draws the part of the image that overlaps with the area rectangle
    !*/

// ----------------------------------------------------------------------------------------

}

#endif // DLIB_GUI_CANVAS_DRAWINg_ABSTRACT_

