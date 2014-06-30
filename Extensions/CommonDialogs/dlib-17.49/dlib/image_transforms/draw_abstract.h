// Copyright (C) 2008  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#undef DLIB_DRAW_IMAGe_ABSTRACT
#ifdef DLIB_DRAW_IMAGe_ABSTRACT


namespace dlib
{

// ----------------------------------------------------------------------------------------

    template <
        typename image_type,
        typename pixel_type
        >
    void draw_line (
        image_type& img,
        const point& p1,
        const point& p2,
        const pixel_type& val
    );
    /*!
        requires
            - image_type == is an implementation of array2d/array2d_kernel_abstract.h
            - pixel_traits<pixel_type> is defined
        ensures
            - #img.nr() == img.nr() && #img.nc() == img.nc()
              (i.e. the dimensions of the input image are not changed)
            - for all valid r and c that are on the line between point p1 and p2:
                - performs assign_pixel(img[r][c], val)
                  (i.e. it draws the line from p1 to p2 onto the image)
    !*/

// ----------------------------------------------------------------------------------------

    template <
        typename image_type,
        typename pixel_type
        >
    void draw_line (
        long x1,
        long y1,
        long x2,
        long y2,
        image_type& img,
        const pixel_type& val
    );
    /*!
        requires
            - image_type == is an implementation of array2d/array2d_kernel_abstract.h
            - pixel_traits<pixel_type> is defined
        ensures
            - performs draw_line(img, point(x1,y1), point(x2,y2), val)
    !*/

// ----------------------------------------------------------------------------------------

    template <
        typename image_type,
        typename pixel_type
        >
    void fill_rect (
        image_type& img,
        const rectangle& rect,
        const pixel_type& pixel
    );
    /*!
        requires
            - pixel_traits<pixel_type> is defined
        ensures
            - fills the area defined by rect in the given image with the given pixel value.
    !*/

// ----------------------------------------------------------------------------------------

}

#endif // DLIB_DRAW_IMAGe_ABSTRACT



