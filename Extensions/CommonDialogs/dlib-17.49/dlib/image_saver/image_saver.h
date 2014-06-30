// Copyright (C) 2006  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#ifndef DLIB_IMAGE_SAVEr_
#define DLIB_IMAGE_SAVEr_

#include "image_saver_abstract.h"
#include <iostream>
#include <fstream>
#include <sstream>
#include "../algs.h"
#include "../pixel.h"
#include "../byte_orderer.h"
#include "../entropy_encoder.h"
#include "../entropy_encoder_model.h"
#include "dng_shared.h"
#include "../uintn.h"
#include "../dir_nav.h"

namespace dlib
{

// ----------------------------------------------------------------------------------------

    class image_save_error : public dlib::error { 
    public: image_save_error(const std::string& str) : error(EIMAGE_SAVE,str){}
    };

// ----------------------------------------------------------------------------------------

    template <
        typename image_type,
        bool grayscale = pixel_traits<typename image_type::type>::grayscale
        >
    struct save_bmp_helper;


    template <typename image_type>
    struct save_bmp_helper<image_type,false>
    {
        static void save_bmp (
            const image_type& image,
            std::ostream& out 
        )
        {
            // we are going to write out a 24bit color image.
            byte_orderer::kernel_1a bo;

            out.write("BM",2);
            
            if (!out)
                throw image_save_error("error writing image to output stream");


            unsigned long pad = 4 - (image.nc()*3)%4;
            if (pad == 4)
                pad = 0;

            unsigned long bfSize = 14 + 40 + (image.nc()*3 + pad)*image.nr();
            unsigned long bfReserved = 0;
            unsigned long bfOffBits = 14 + 40;
            unsigned long biSize = 40;
            unsigned long biWidth = image.nc();
            unsigned long biHeight = image.nr();
            unsigned short biPlanes = 1;
            unsigned short biBitCount = 24;
            unsigned long biCompression = 0;
            unsigned long biSizeImage = 0;
            unsigned long biXPelsPerMeter = 0;
            unsigned long biYPelsPerMeter = 0;
            unsigned long biClrUsed = 0;
            unsigned long biClrImportant = 0;

            bo.host_to_little(bfSize);
            bo.host_to_little(bfOffBits);
            bo.host_to_little(biSize);
            bo.host_to_little(biWidth);
            bo.host_to_little(biHeight);
            bo.host_to_little(biPlanes);
            bo.host_to_little(biBitCount);

            out.write((char*)&bfSize,4);
            out.write((char*)&bfReserved,4);
            out.write((char*)&bfOffBits,4);
            out.write((char*)&biSize,4);
            out.write((char*)&biWidth,4);
            out.write((char*)&biHeight,4);
            out.write((char*)&biPlanes,2);
            out.write((char*)&biBitCount,2);
            out.write((char*)&biCompression,4);
            out.write((char*)&biSizeImage,4);
            out.write((char*)&biXPelsPerMeter,4);
            out.write((char*)&biYPelsPerMeter,4);
            out.write((char*)&biClrUsed,4);
            out.write((char*)&biClrImportant,4);


            if (!out)
                throw image_save_error("error writing image to output stream");

            // now we write out the pixel data
            for (long row = image.nr()-1; row >= 0; --row)
            {
                for (long col = 0; col < image.nc(); ++col)
                {
                    rgb_pixel p;
                    p.red = 0;
                    p.green = 0;
                    p.blue = 0;
                    assign_pixel(p,image[row][col]);
                    out.write((char*)&p.blue,1);
                    out.write((char*)&p.green,1);
                    out.write((char*)&p.red,1);
                }

                // write out some zeros so that this line is a multiple of 4 bytes
                for (unsigned long i = 0; i < pad; ++i)
                {
                    unsigned char p = 0;
                    out.write((char*)&p,1);
                }
            }

            if (!out)
                throw image_save_error("error writing image to output stream");
        }
    };

    template <typename image_type>
    struct save_bmp_helper<image_type,true>
    {
        static void save_bmp (
            const image_type& image,
            std::ostream& out
        )
        {
            // we are going to write out an 8bit color image.
            byte_orderer::kernel_1a bo;

            out.write("BM",2);
            
            if (!out)
                throw image_save_error("error writing image to output stream");

            unsigned long pad = 4 - image.nc()%4;
            if (pad == 4)
                pad = 0;

            unsigned long bfSize = 14 + 40 + (image.nc() + pad)*image.nr() + 256*4;
            unsigned long bfReserved = 0;
            unsigned long bfOffBits = 14 + 40 + 256*4;
            unsigned long biSize = 40;
            unsigned long biWidth = image.nc();
            unsigned long biHeight = image.nr();
            unsigned short biPlanes = 1;
            unsigned short biBitCount = 8;
            unsigned long biCompression = 0;
            unsigned long biSizeImage = 0;
            unsigned long biXPelsPerMeter = 0;
            unsigned long biYPelsPerMeter = 0;
            unsigned long biClrUsed = 0;
            unsigned long biClrImportant = 0;

            bo.host_to_little(bfSize);
            bo.host_to_little(bfOffBits);
            bo.host_to_little(biSize);
            bo.host_to_little(biWidth);
            bo.host_to_little(biHeight);
            bo.host_to_little(biPlanes);
            bo.host_to_little(biBitCount);

            out.write((char*)&bfSize,4);
            out.write((char*)&bfReserved,4);
            out.write((char*)&bfOffBits,4);
            out.write((char*)&biSize,4);
            out.write((char*)&biWidth,4);
            out.write((char*)&biHeight,4);
            out.write((char*)&biPlanes,2);
            out.write((char*)&biBitCount,2);
            out.write((char*)&biCompression,4);
            out.write((char*)&biSizeImage,4);
            out.write((char*)&biXPelsPerMeter,4);
            out.write((char*)&biYPelsPerMeter,4);
            out.write((char*)&biClrUsed,4);
            out.write((char*)&biClrImportant,4);


            // write out the color palette
            for (unsigned int i = 0; i <= 255; ++i)
            {
                unsigned char ch = static_cast<unsigned char>(i);
                out.write((char*)&ch,1);
                out.write((char*)&ch,1);
                out.write((char*)&ch,1);
                ch = 0;
                out.write((char*)&ch,1);
            }

            if (!out)
                throw image_save_error("error writing image to output stream");

            // now we write out the pixel data
            for (long row = image.nr()-1; row >= 0; --row)
            {
                for (long col = 0; col < image.nc(); ++col)
                {
                    unsigned char p = 0;
                    assign_pixel(p,image[row][col]);
                    out.write((char*)&p,1);
                }

                // write out some zeros so that this line is a multiple of 4 bytes
                for (unsigned long i = 0; i < pad; ++i)
                {
                    unsigned char p = 0;
                    out.write((char*)&p,1);
                }
            }

            if (!out)
                throw image_save_error("error writing image to output stream");

        }
    };

// ----------------------------------------------------------------------------------------

    template <
        typename image_type 
        >
    inline void save_bmp (
        const image_type& image,
        std::ostream& out
    )
    {
        save_bmp_helper<image_type>::save_bmp(image,out);
    }

// ----------------------------------------------------------------------------------------

    namespace dng_helpers_namespace
    {

        template <
            typename image_type,
            int pixel_type = static_switch <
                pixel_traits<typename image_type::type>::grayscale && sizeof(typename image_type::type) == 1,
                pixel_traits<typename image_type::type>::rgb,
                pixel_traits<typename image_type::type>::hsi,
                false,
                pixel_traits<typename image_type::type>::rgb_alpha,
                false,
                pixel_traits<typename image_type::type>::grayscale && sizeof(typename image_type::type) != 1
                >::value
            >
        struct save_dng_helper;

        typedef entropy_encoder::kernel_2a encoder_type;
        typedef entropy_encoder_model<256,encoder_type>::kernel_5a eem_type; 

        template <typename image_type >
        struct save_dng_helper<image_type, grayscale_16bit>
        {
            static void save_dng (
                const image_type& image,
                std::ostream& out 
            )
            {
                out.write("DNG",3);
                unsigned long version = 1;
                serialize(version,out);
                unsigned long type = grayscale_16bit;
                serialize(type,out);
                serialize(image.nc(),out);
                serialize(image.nr(),out);

                encoder_type encoder;
                encoder.set_stream(out);

                eem_type eem(encoder);
                for (long r = 0; r < image.nr(); ++r)
                {
                    for (long c = 0; c < image.nc(); ++c)
                    {
                        uint16 cur;
                        assign_pixel(cur, image[r][c]);
                        cur -= predictor_grayscale_16(image,r,c);
                        unsigned char byte1 = cur&0xFF;
                        unsigned char byte2 = cur>>8;
                        eem.encode(byte2);
                        eem.encode(byte1);
                    }
                }
                // write out the magic byte to mark the end of the data
                eem.encode(dng_magic_byte);
                eem.encode(dng_magic_byte);
                eem.encode(dng_magic_byte);
                eem.encode(dng_magic_byte);
            }
        };


        template <typename image_type>
        struct save_dng_helper<image_type, grayscale>
        {
            static void save_dng (
                const image_type& image,
                std::ostream& out 
            )
            {
                out.write("DNG",3);
                unsigned long version = 1;
                serialize(version,out);
                unsigned long type = grayscale;
                serialize(type,out);
                serialize(image.nc(),out);
                serialize(image.nr(),out);

                encoder_type encoder;
                encoder.set_stream(out);

                eem_type eem(encoder);
                for (long r = 0; r < image.nr(); ++r)
                {
                    for (long c = 0; c < image.nc(); ++c)
                    {
                        unsigned char cur;
                        assign_pixel(cur, image[r][c]);
                        eem.encode(cur - predictor_grayscale(image,r,c));
                    }
                }
                // write out the magic byte to mark the end of the data
                eem.encode(dng_magic_byte);
                eem.encode(dng_magic_byte);
                eem.encode(dng_magic_byte);
                eem.encode(dng_magic_byte);
            }
        };

        template <typename image_type>
        struct save_dng_helper<image_type,rgb>
        {
            static void save_dng (
                const image_type& image,
                std::ostream& out
            )
            {
                out.write("DNG",3);
                unsigned long version = 1;
                serialize(version,out);

                unsigned long type = rgb;
                // if this is a small image then we will use a different predictor
                if (image.size() < 4000)
                    type = rgb_paeth;

                serialize(type,out);
                serialize(image.nc(),out);
                serialize(image.nr(),out);

                encoder_type encoder;
                encoder.set_stream(out);

                rgb_pixel pre, cur;
                eem_type eem(encoder);

                if (type == rgb)
                {
                    for (long r = 0; r < image.nr(); ++r)
                    {
                        for (long c = 0; c < image.nc(); ++c)
                        {
                            pre = predictor_rgb(image,r,c);
                            assign_pixel(cur, image[r][c]);

                            eem.encode((unsigned char)(cur.red - pre.red));
                            eem.encode((unsigned char)(cur.green - pre.green));
                            eem.encode((unsigned char)(cur.blue - pre.blue));
                        }
                    }
                }
                else
                {
                    for (long r = 0; r < image.nr(); ++r)
                    {
                        for (long c = 0; c < image.nc(); ++c)
                        {
                            pre = predictor_rgb_paeth(image,r,c);
                            assign_pixel(cur, image[r][c]);

                            eem.encode((unsigned char)(cur.red - pre.red));
                            eem.encode((unsigned char)(cur.green - pre.green));
                            eem.encode((unsigned char)(cur.blue - pre.blue));
                        }
                    }
                }
                // write out the magic byte to mark the end of the data
                eem.encode(dng_magic_byte);
                eem.encode(dng_magic_byte);
                eem.encode(dng_magic_byte);
                eem.encode(dng_magic_byte);
            }
        };

        template <typename image_type>
        struct save_dng_helper<image_type,rgb_alpha>
        {
            static void save_dng (
                const image_type& image,
                std::ostream& out
            )
            {
                out.write("DNG",3);
                unsigned long version = 1;
                serialize(version,out);

                unsigned long type = rgb_alpha;
                // if this is a small image then we will use a different predictor
                if (image.size() < 4000)
                    type = rgb_alpha_paeth;

                serialize(type,out);
                serialize(image.nc(),out);
                serialize(image.nr(),out);

                encoder_type encoder;
                encoder.set_stream(out);

                rgb_alpha_pixel pre, cur;
                eem_type eem(encoder);

                if (type == rgb_alpha)
                {
                    for (long r = 0; r < image.nr(); ++r)
                    {
                        for (long c = 0; c < image.nc(); ++c)
                        {
                            pre = predictor_rgb_alpha(image,r,c);
                            assign_pixel(cur, image[r][c]);

                            eem.encode((unsigned char)(cur.red - pre.red));
                            eem.encode((unsigned char)(cur.green - pre.green));
                            eem.encode((unsigned char)(cur.blue - pre.blue));
                            eem.encode((unsigned char)(cur.alpha - pre.alpha));
                        }
                    }
                }
                else
                {
                    for (long r = 0; r < image.nr(); ++r)
                    {
                        for (long c = 0; c < image.nc(); ++c)
                        {
                            pre = predictor_rgb_alpha_paeth(image,r,c);
                            assign_pixel(cur, image[r][c]);

                            eem.encode((unsigned char)(cur.red - pre.red));
                            eem.encode((unsigned char)(cur.green - pre.green));
                            eem.encode((unsigned char)(cur.blue - pre.blue));
                            eem.encode((unsigned char)(cur.alpha - pre.alpha));
                        }
                    }
                }
                // write out the magic byte to mark the end of the data
                eem.encode(dng_magic_byte);
                eem.encode(dng_magic_byte);
                eem.encode(dng_magic_byte);
                eem.encode(dng_magic_byte);
            }
        };

        template <typename image_type>
        struct save_dng_helper<image_type,hsi>
        {
            static void save_dng (
                const image_type& image,
                std::ostream& out
            )
            {
                out.write("DNG",3);
                unsigned long version = 1;
                serialize(version,out);
                unsigned long type = hsi;
                serialize(type,out);
                serialize(image.nc(),out);
                serialize(image.nr(),out);

                encoder_type encoder;
                encoder.set_stream(out);

                hsi_pixel pre, cur;
                eem_type eem(encoder);
                for (long r = 0; r < image.nr(); ++r)
                {
                    for (long c = 0; c < image.nc(); ++c)
                    {
                        pre = predictor_hsi(image,r,c);
                        assign_pixel(cur, image[r][c]);

                        eem.encode((unsigned char)(cur.h - pre.h));
                        eem.encode((unsigned char)(cur.s - pre.s));
                        eem.encode((unsigned char)(cur.i - pre.i));
                    }
                }
                // write out the magic byte to mark the end of the data
                eem.encode(dng_magic_byte);
                eem.encode(dng_magic_byte);
                eem.encode(dng_magic_byte);
                eem.encode(dng_magic_byte);
            }
        };
    }

// ----------------------------------------------------------------------------------------

    template <
        typename image_type 
        >
    inline void save_dng (
        const image_type& image,
        std::ostream& out
    )
    {
        using namespace dng_helpers_namespace;
        save_dng_helper<image_type>::save_dng(image,out);
    }

// ----------------------------------------------------------------------------------------

    template <typename image_type>
    void save_dng (
        const image_type& image,
        const std::string& file_name
    )
    {
        std::ofstream fout(file_name.c_str(), std::ios::binary);
        if (!fout)
            throw image_save_error("Unable to open " + file_name + " for writing.");
        save_dng(image, fout);
    }

// ----------------------------------------------------------------------------------------

    template <typename image_type>
    void save_bmp (
        const image_type& image,
        const std::string& file_name
    )
    {
        std::ofstream fout(file_name.c_str(), std::ios::binary);
        if (!fout)
            throw image_save_error("Unable to open " + file_name + " for writing.");
        save_bmp(image, fout);
    }

// ----------------------------------------------------------------------------------------

}

#endif // DLIB_IMAGE_SAVEr_




