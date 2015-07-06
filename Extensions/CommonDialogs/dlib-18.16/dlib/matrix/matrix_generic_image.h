// Copyright (C) 2014  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#ifndef DLIB_MATRIX_GENERIC_iMAGE_Hh_
#define DLIB_MATRIX_GENERIC_iMAGE_Hh_

#include "matrix.h"
#include "../image_processing/generic_image.h"

namespace dlib
{
    template <
        typename T,
        long NR,
        long NC,
        typename MM
        >
    struct image_traits<matrix<T,NR,NC,MM> >
    {
        typedef T pixel_type;
    };

    template <
        typename T,
        long NR,
        long NC,
        typename MM
        >
    struct image_traits<const matrix<T,NR,NC,MM> >
    {
        typedef T pixel_type;
    };

    template <
        typename T,
        long NR,
        long NC,
        typename MM
        >
    inline long num_rows( const matrix<T,NR,NC,MM>& img) { return img.nr(); }

    template <
        typename T,
        long NR,
        long NC,
        typename MM
        >
    inline long num_columns( const matrix<T,NR,NC,MM>& img) { return img.nc(); }

    template <
        typename T,
        long NR,
        long NC,
        typename MM
        >
    inline void set_image_size(
        matrix<T,NR,NC,MM>& img,
        long rows,
        long cols 
    ) { img.set_size(rows,cols); }

    template <
        typename T,
        long NR,
        long NC,
        typename MM
        >
    inline void* image_data(
        matrix<T,NR,NC,MM>& img
    )
    {
        if (img.size() != 0)
            return &img(0,0);
        else
            return 0;
    }

    template <
        typename T,
        long NR,
        long NC,
        typename MM
        >
    inline const void* image_data(
        const matrix<T,NR,NC,MM>& img
    )
    {
        if (img.size() != 0)
            return &img(0,0);
        else
            return 0;
    }

    template <
        typename T,
        long NR,
        long NC,
        typename MM
        >
    inline long width_step(
        const matrix<T,NR,NC,MM>& img
    ) 
    { 
        return img.nc()*sizeof(T);
    }

}

#endif // DLIB_MATRIX_GENERIC_iMAGE_Hh_


