// Copyright (C) 2008  Davis E. King (davisking@users.sourceforge.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#undef DLIB_DRAW_IMAGe_ABSTRACT
#ifdef DLIB_DRAW_IMAGe_ABSTRACT


namespace dlib
{

// ----------------------------------------------------------------------------------------

    template <
        typename image_type
        >
    void draw_line (
        long x1,
        long y1,
        long x2,
        long y2,
        image_type& img,
        typename image_type::type val
    );
    /*!
        requires
            - image_type == is an implementation of array2d/array2d_kernel_abstract.h
        ensures
            - #img.nr() == img.nr() && #img.nc() == img.nc()
              (i.e. the dimensions of the input image are not chanaged)
            - for all valid r and c that are on the line between point (x1,y1)
              and point (x2,y2):
                - performs img[r][c] = val
                  (i.e. it draws the line from (x1,y1) to (x2,y2) onto the image)
    !*/

// ----------------------------------------------------------------------------------------

}

#endif // DLIB_DRAW_IMAGe_ABSTRACT



