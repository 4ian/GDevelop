// Copyright (C) 2011  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#ifndef DLIB_RANDOMLY_COlOR_IMAGE_Hh_
#define DLIB_RANDOMLY_COlOR_IMAGE_Hh_

#include "colormaps_abstract.h"
#include "../hash.h"
#include "../pixel.h"
#include "../matrix.h"

namespace dlib
{

// ----------------------------------------------------------------------------------------

    template <typename T>
    struct op_randomly_color_image : does_not_alias 
    {
        op_randomly_color_image( const T& img_) : img(img_){}

        const T& img;

        const static long cost = 7;
        const static long NR = 0;
        const static long NC = 0;
        typedef rgb_pixel type;
        typedef const rgb_pixel const_ret_type;
        typedef default_memory_manager mem_manager_type;
        typedef row_major_layout layout_type;

        const_ret_type apply (long r, long c ) const 
        { 
            const unsigned long gray = get_pixel_intensity(mat(img)(r,c));
            if (gray != 0)
            {
                const uint32 h = murmur_hash3_2(gray,0);
                rgb_pixel pix;
                pix.red   = static_cast<unsigned char>(h)%200 + 55;
                pix.green = static_cast<unsigned char>(h>>8)%200 + 55;
                pix.blue  = static_cast<unsigned char>(h>>16)%200 + 55;
                return pix;
            }
            else
            {
                // keep black pixels black
                return rgb_pixel(0,0,0);
            }
        }

        long nr () const { return num_rows(img); }
        long nc () const { return num_columns(img); }
    }; 

    template <
        typename image_type
        >
    const matrix_op<op_randomly_color_image<image_type> >  
    randomly_color_image (
        const image_type& img
    )
    {
        typedef op_randomly_color_image<image_type> op;
        return matrix_op<op>(op(img));
    }

// ----------------------------------------------------------------------------------------

    inline rgb_pixel colormap_heat (
        double value,
        double min_val,
        double max_val
    )
    {
        // scale the gray value into the range [0, 1]
        const double gray = put_in_range(0, 1, (value - min_val)/(max_val-min_val));
        rgb_pixel pix(0,0,0);

        pix.red = static_cast<unsigned char>(std::min(gray/0.4,1.0)*255 + 0.5);

        if (gray > 0.4)
        {
            pix.green = static_cast<unsigned char>(std::min((gray-0.4)/0.4,1.0)*255 + 0.5);
        }
        if (gray > 0.8)
        {
            pix.blue = static_cast<unsigned char>(std::min((gray-0.8)/0.2,1.0)*255 + 0.5);
        }

        return pix;
    }

// ----------------------------------------------------------------------------------------

    template <typename T>
    struct op_heatmap : does_not_alias 
    {
        op_heatmap( 
            const T& img_,
            const double max_val_,
            const double min_val_
            ) : img(img_), max_val(max_val_), min_val(min_val_){}

        const T& img;

        const double max_val;
        const double min_val;

        const static long cost = 7;
        const static long NR = 0;
        const static long NC = 0;
        typedef rgb_pixel type;
        typedef const rgb_pixel const_ret_type;
        typedef default_memory_manager mem_manager_type;
        typedef row_major_layout layout_type;

        const_ret_type apply (long r, long c ) const 
        { 
            return colormap_heat(get_pixel_intensity(mat(img)(r,c)), min_val, max_val);
        }

        long nr () const { return num_rows(img); }
        long nc () const { return num_columns(img); }
    }; 

    template <
        typename image_type
        >
    const matrix_op<op_heatmap<image_type> >  
    heatmap (
        const image_type& img,
        double max_val,
        double min_val = 0
    )
    {
        typedef op_heatmap<image_type> op;
        return matrix_op<op>(op(img,max_val,min_val));
    }

    template <
        typename image_type
        >
    const matrix_op<op_heatmap<image_type> >  
    heatmap (
        const image_type& img
    )
    {
        typedef op_heatmap<image_type> op;
        return matrix_op<op>(op(img,max(mat(img)),min(mat(img))));
    }

// ----------------------------------------------------------------------------------------

    inline rgb_pixel colormap_jet (
        double value,
        double min_val,
        double max_val
    )
    {
        // scale the gray value into the range [0, 8]
        const double gray = 8*put_in_range(0, 1, (value - min_val)/(max_val-min_val));
        rgb_pixel pix;
        // s is the slope of color change
        const double s = 1.0/2.0;

        if (gray <= 1)
        {
            pix.red = 0;
            pix.green = 0;
            pix.blue = static_cast<unsigned char>((gray+1)*s*255 + 0.5);
        }
        else if (gray <= 3)
        {
            pix.red = 0;
            pix.green = static_cast<unsigned char>((gray-1)*s*255 + 0.5);
            pix.blue = 255;
        }
        else if (gray <= 5)
        {
            pix.red = static_cast<unsigned char>((gray-3)*s*255 + 0.5);
            pix.green = 255;
            pix.blue = static_cast<unsigned char>((5-gray)*s*255 + 0.5);
        }
        else if (gray <= 7)
        {
            pix.red = 255;
            pix.green = static_cast<unsigned char>((7-gray)*s*255 + 0.5);
            pix.blue = 0;
        }
        else
        {
            pix.red = static_cast<unsigned char>((9-gray)*s*255 + 0.5);
            pix.green = 0;
            pix.blue = 0;
        }

        return pix;
    }

// ----------------------------------------------------------------------------------------

    template <typename T>
    struct op_jet : does_not_alias 
    {
        op_jet( 
            const T& img_,
            const double max_val_,
            const double min_val_
            ) : img(img_), max_val(max_val_), min_val(min_val_){}

        const T& img;

        const double max_val;
        const double min_val;

        const static long cost = 7;
        const static long NR = 0;
        const static long NC = 0;
        typedef rgb_pixel type;
        typedef const rgb_pixel const_ret_type;
        typedef default_memory_manager mem_manager_type;
        typedef row_major_layout layout_type;

        const_ret_type apply (long r, long c ) const 
        { 
            return colormap_jet(get_pixel_intensity(mat(img)(r,c)), min_val, max_val);
        }

        long nr () const { return num_rows(img); }
        long nc () const { return num_columns(img); }
    }; 

    template <
        typename image_type
        >
    const matrix_op<op_jet<image_type> >  
    jet (
        const image_type& img,
        double max_val,
        double min_val = 0
    )
    {
        typedef op_jet<image_type> op;
        return matrix_op<op>(op(img,max_val,min_val));
    }

    template <
        typename image_type
        >
    const matrix_op<op_jet<image_type> >  
    jet (
        const image_type& img
    )
    {
        typedef op_jet<image_type> op;
        return matrix_op<op>(op(img,max(mat(img)),min(mat(img))));
    }

// ----------------------------------------------------------------------------------------

}

#endif // DLIB_RANDOMLY_COlOR_IMAGE_Hh_

