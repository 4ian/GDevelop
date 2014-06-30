// Copyright (C) 2011  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#ifndef DLIB_SAVE_PnG_H__
#define DLIB_SAVE_PnG_H__

#include "save_png_abstract.h"
#include "image_saver.h"
#include "../array2d.h"
#include <vector>
#include <string>
#include "../pixel.h"

namespace dlib
{

// ----------------------------------------------------------------------------------------

    namespace impl
    {
        enum png_type
        {
            png_type_rgb,
            png_type_rgb_alpha,
            png_type_gray,
        };

        void impl_save_png (
            const std::string& file_name,
            std::vector<unsigned char*>& row_pointers,
            const long width,
            const png_type type,
            const int bit_depth
        );
    }

// ----------------------------------------------------------------------------------------

    template <
        typename image_type
        >
    void save_png(
        const image_type& img,
        const std::string& file_name
    )
    {
        // make sure requires clause is not broken
        DLIB_CASSERT(img.size() != 0,
            "\t save_png()"
            << "\n\t You can't save an empty image as a PNG"
            );


#ifndef DLIB_PNG_SUPPORT
            /* !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
                You are getting this error because you are trying to use save_png() 
                but you haven't defined DLIB_PNG_SUPPORT.  You must do so to use
                this function.   You must also make sure you set your build environment
                to link against the libpng library.
            !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!*/
            COMPILE_TIME_ASSERT(sizeof(image_type) == 0);
#else
        std::vector<unsigned char*> row_pointers(img.nr());
        typedef typename image_type::type pixel_type;

        if (is_same_type<rgb_pixel,pixel_type>::value)
        {
            for (unsigned long i = 0; i < row_pointers.size(); ++i)
                row_pointers[i] = (unsigned char*)(&img[i][0]);

            impl::impl_save_png(file_name, row_pointers, img.nc(), impl::png_type_rgb, 8);
        }
        else if (is_same_type<rgb_alpha_pixel,pixel_type>::value)
        {
            for (unsigned long i = 0; i < row_pointers.size(); ++i)
                row_pointers[i] = (unsigned char*)(&img[i][0]);

            impl::impl_save_png(file_name, row_pointers, img.nc(), impl::png_type_rgb_alpha, 8);
        }
        else if (pixel_traits<pixel_type>::hsi || pixel_traits<pixel_type>::rgb)
        {
            // convert from HSI to RGB (Or potentially RGB pixels that aren't laid out as R G B)
            array2d<rgb_pixel> temp_img;
            assign_image(temp_img, img);
            for (unsigned long i = 0; i < row_pointers.size(); ++i)
                row_pointers[i] = (unsigned char*)(&temp_img[i][0]);

            impl::impl_save_png(file_name, row_pointers, img.nc(), impl::png_type_rgb, 8);
        }
        else if (pixel_traits<pixel_type>::rgb_alpha)
        {
            // convert from RGBA pixels that aren't laid out as R G B A
            array2d<rgb_alpha_pixel> temp_img;
            assign_image(temp_img, img);
            for (unsigned long i = 0; i < row_pointers.size(); ++i)
                row_pointers[i] = (unsigned char*)(&temp_img[i][0]);

            impl::impl_save_png(file_name, row_pointers, img.nc(), impl::png_type_rgb_alpha, 8);
        }
        else // this is supposed to be grayscale 
        {
            DLIB_CASSERT(pixel_traits<pixel_type>::grayscale, "impossible condition detected");

            if (pixel_traits<pixel_type>::is_unsigned && sizeof(pixel_type) == 1)
            {
                for (unsigned long i = 0; i < row_pointers.size(); ++i)
                    row_pointers[i] = (unsigned char*)(&img[i][0]);

                impl::impl_save_png(file_name, row_pointers, img.nc(), impl::png_type_gray, 8);
            }
            else if (pixel_traits<pixel_type>::is_unsigned && sizeof(pixel_type) == 2)
            {
                for (unsigned long i = 0; i < row_pointers.size(); ++i)
                    row_pointers[i] = (unsigned char*)(&img[i][0]);

                impl::impl_save_png(file_name, row_pointers, img.nc(), impl::png_type_gray, 16);
            }
            else
            {
                // convert from whatever this is to 16bit grayscale 
                array2d<dlib::uint16> temp_img;
                assign_image(temp_img, img);
                for (unsigned long i = 0; i < row_pointers.size(); ++i)
                    row_pointers[i] = (unsigned char*)(&temp_img[i][0]);

                impl::impl_save_png(file_name, row_pointers, img.nc(), impl::png_type_gray, 16);
            }
        }


#endif

    }
}

#ifdef NO_MAKEFILE
#include "save_png.cpp"
#endif

#endif // DLIB_SAVE_PnG_H__

