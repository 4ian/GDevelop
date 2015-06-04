// Copyright (C) 2011  Davis E. King (davis@dlib.net), Nils Labugt, Changjiang Yang (yangcha@leidos.com)
// License: Boost Software License   See LICENSE.txt for the full license.
#ifndef DLIB_LOAd_IMAGE_Hh_
#define DLIB_LOAd_IMAGE_Hh_

#include "load_image_abstract.h"
#include "../string.h"
#include "png_loader.h"
#include "jpeg_loader.h"
#include "image_loader.h"
#include <fstream>

namespace dlib
{
    namespace image_file_type
    {
        enum type
        {
            BMP,
            JPG,
            PNG,
            DNG,
            UNKNOWN
        };

        inline type read_type(const std::string& file_name) 
        {
            std::ifstream file(file_name.c_str(), std::ios::in|std::ios::binary);
            if (!file)
                throw image_load_error("Unable to open file: " + file_name);

            char buffer[9];
            file.read((char*)buffer, 8);
            buffer[8] = 0;

            // Determine the true image type using link:
            // http://en.wikipedia.org/wiki/List_of_file_signatures

            if (strcmp(buffer, "\x89\x50\x4E\x47\x0D\x0A\x1A\x0A") == 0) 
                return PNG;
            else if(buffer[0]=='\xff' && buffer[1]=='\xd8' && buffer[2]=='\xff') 
                return JPG;
            else if(buffer[0]=='B' && buffer[1]=='M') 
                return BMP;
            else if(buffer[0]=='D' && buffer[1]=='N' && buffer[2] == 'G') 
                return DNG;

            return UNKNOWN;
        }
    };

    template <typename image_type>
    void load_image (
        image_type& image,
        const std::string& file_name
    )
    {
        const image_file_type::type im_type = image_file_type::read_type(file_name);
        switch (im_type)
        {
            case image_file_type::BMP: load_bmp(image, file_name); return;
            case image_file_type::DNG: load_dng(image, file_name); return;
#ifdef DLIB_PNG_SUPPORT
            case image_file_type::PNG: load_png(image, file_name); return;
#endif
#ifdef DLIB_JPEG_SUPPORT
            case image_file_type::JPG: load_jpeg(image, file_name); return;
#endif
            default:  ;
        }

        if (im_type == image_file_type::JPG)
        {
            throw image_load_error("Unable to load image in file " + file_name + ".\n" +
                "You must #define DLIB_JPEG_SUPPORT and link to libjpeg to read JPEG files.\n" +
                "Do this by following the instructions at http://dlib.net/compile.html.");
        }
        else if (im_type == image_file_type::PNG)
        {
            throw image_load_error("Unable to load image in file " + file_name + ".\n" +
                "You must #define DLIB_PNG_SUPPORT and link to libpng to read PNG files.\n" +
                "Do this by following the instructions at http://dlib.net/compile.html.");
        }
        else
        {
            throw image_load_error("Unknown image file format: Unable to load image in file " + file_name);
        }
    }

}

#endif // DLIB_LOAd_IMAGE_Hh_ 

