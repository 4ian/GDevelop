// Copyright (C) 2014  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#ifndef DLIB_ARRAY2D_GENERIC_iMAGE_Hh_
#define DLIB_ARRAY2D_GENERIC_iMAGE_Hh_

#include "array2d_kernel.h"
#include "../image_processing/generic_image.h"

namespace dlib
{
    template <typename T, typename mm>
    struct image_traits<array2d<T,mm> >
    {
        typedef T pixel_type;
    };
    template <typename T, typename mm>
    struct image_traits<const array2d<T,mm> >
    {
        typedef T pixel_type;
    };

    template <typename T, typename mm>
    inline long num_rows( const array2d<T,mm>& img) { return img.nr(); }
    template <typename T, typename mm>
    inline long num_columns( const array2d<T,mm>& img) { return img.nc(); }

    template <typename T, typename mm>
    inline void set_image_size(
        array2d<T,mm>& img,
        long rows,
        long cols 
    ) { img.set_size(rows,cols); }

    template <typename T, typename mm>
    inline void* image_data(
        array2d<T,mm>& img
    )
    {
        if (img.size() != 0)
            return &img[0][0];
        else
            return 0;
    }

    template <typename T, typename mm>
    inline const void* image_data(
        const array2d<T,mm>& img
    )
    {
        if (img.size() != 0)
            return &img[0][0];
        else
            return 0;
    }

    template <typename T, typename mm>
    inline long width_step(
        const array2d<T,mm>& img
    ) 
    { 
        return img.width_step(); 
    }

}

#endif // DLIB_ARRAY2D_GENERIC_iMAGE_Hh_

