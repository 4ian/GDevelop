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
#include "../float_details.h"
#include "../vectorstream.h"
#include "../matrix/matrix_exp.h"
#include "../image_transforms/assign_image.h"

namespace dlib
{

// ----------------------------------------------------------------------------------------

    class image_save_error : public dlib::error { 
    public: image_save_error(const std::string& str) : error(EIMAGE_SAVE,str){}
    };

// ----------------------------------------------------------------------------------------

    template <
        typename image_type,
        bool grayscale = pixel_traits<typename image_traits<image_type>::pixel_type>::grayscale
        >
    struct save_bmp_helper;


    template <typename image_type>
    struct save_bmp_helper<image_type,false>
    {
        static void save_bmp (
            const image_type& image_,
            std::ostream& out 
        )
        {
            const_image_view<image_type> image(image_);
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
            const image_type& image_,
            std::ostream& out
        )
        {
            const_image_view<image_type> image(image_);
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
    inline typename disable_if<is_matrix<image_type> >::type save_bmp (
        const image_type& image,
        std::ostream& out
    )
    {
        save_bmp_helper<image_type>::save_bmp(image,out);
    }

    template <
        typename EXP 
        >
    inline void save_bmp (
        const matrix_exp<EXP>& image,
        std::ostream& out
    )
    {
        array2d<typename EXP::type> temp;
        assign_image(temp, image);
        save_bmp_helper<array2d<typename EXP::type> >::save_bmp(temp,out);
    }

// ----------------------------------------------------------------------------------------

    namespace dng_helpers_namespace
    {
        template <
            typename image_type,
            typename enabled = void
            >
        struct save_dng_helper;

        typedef entropy_encoder::kernel_2a encoder_type;
        typedef entropy_encoder_model<256,encoder_type>::kernel_5a eem_type; 

        typedef entropy_encoder_model<256,encoder_type>::kernel_4a eem_exp_type; 

        template <typename image_type >
        struct save_dng_helper<image_type, typename enable_if<is_float_type<typename image_traits<image_type>::pixel_type> >::type >
        {
            static void save_dng (
                const image_type& image_,
                std::ostream& out 
            )
            {
                const_image_view<image_type> image(image_);
                out.write("DNG",3);
                unsigned long version = 1;
                serialize(version,out);
                unsigned long type = grayscale_float;
                serialize(type,out);
                serialize(image.nc(),out);
                serialize(image.nr(),out);


                // Write the compressed exponent data into expbuf.  We will append it
                // to the stream at the end of the loops.
                std::vector<char> expbuf;
                expbuf.reserve(image.size()*2);
                vectorstream outexp(expbuf);
                encoder_type encoder;
                encoder.set_stream(outexp);

                eem_exp_type eem_exp(encoder);
                float_details prev;
                for (long r = 0; r < image.nr(); ++r)
                {
                    for (long c = 0; c < image.nc(); ++c)
                    {
                        float_details cur = image[r][c];
                        int16 exp = cur.exponent-prev.exponent;
                        int64 man = cur.mantissa-prev.mantissa;
                        prev = cur;

                        unsigned char ebyte1 = exp&0xFF;
                        unsigned char ebyte2 = exp>>8;
                        eem_exp.encode(ebyte1);
                        eem_exp.encode(ebyte2);

                        serialize(man, out);
                    }
                }
                // write out the magic byte to mark the end of the compressed data.
                eem_exp.encode(dng_magic_byte);
                eem_exp.encode(dng_magic_byte);
                eem_exp.encode(dng_magic_byte);
                eem_exp.encode(dng_magic_byte);

                encoder.clear();
                serialize(expbuf, out);
            }
        };


        template <typename image_type>
        struct is_non_float_non8bit_grayscale
        {
            typedef typename image_traits<image_type>::pixel_type pixel_type;
            const static bool value = pixel_traits<pixel_type>::grayscale && 
                                      sizeof(pixel_type) != 1 && 
                                      !is_float_type<pixel_type>::value;
        };

        template <typename image_type >
        struct save_dng_helper<image_type, typename enable_if<is_non_float_non8bit_grayscale<image_type> >::type>
        {
            static void save_dng (
                const image_type& image_,
                std::ostream& out 
            )
            {
                const_image_view<image_type> image(image_);
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
        struct is_8bit_grayscale
        {
            typedef typename image_traits<image_type>::pixel_type pixel_type;
            const static bool value = pixel_traits<pixel_type>::grayscale && sizeof(pixel_type) == 1;
        };

        template <typename image_type>
        struct save_dng_helper<image_type, typename enable_if<is_8bit_grayscale<image_type> >::type>
        {
            static void save_dng (
                const image_type& image_,
                std::ostream& out 
            )
            {
                const_image_view<image_type> image(image_);
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
                        cur -= predictor_grayscale(image,r,c);
                        eem.encode(cur);
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
        struct is_rgb_image
        {
            typedef typename image_traits<image_type>::pixel_type pixel_type;
            const static bool value = pixel_traits<pixel_type>::rgb;
        };

        template <typename image_type>
        struct save_dng_helper<image_type,typename enable_if<is_rgb_image<image_type> >::type>
        {
            static void save_dng (
                const image_type& image_,
                std::ostream& out
            )
            {
                const_image_view<image_type> image(image_);
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
        struct is_rgb_alpha_image
        {
            typedef typename image_traits<image_type>::pixel_type pixel_type;
            const static bool value = pixel_traits<pixel_type>::rgb_alpha;
        };

        template <typename image_type>
        struct save_dng_helper<image_type,typename enable_if<is_rgb_alpha_image<image_type> >::type>
        {
            static void save_dng (
                const image_type& image_,
                std::ostream& out
            )
            {
                const_image_view<image_type> image(image_);
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
        struct is_hsi_image
        {
            typedef typename image_traits<image_type>::pixel_type pixel_type;
            const static bool value = pixel_traits<pixel_type>::hsi;
        };

        template <typename image_type>
        struct save_dng_helper<image_type,typename enable_if<is_hsi_image<image_type> >::type>
        {
            static void save_dng (
                const image_type& image_,
                std::ostream& out
            )
            {
                const_image_view<image_type> image(image_);
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
    inline typename disable_if<is_matrix<image_type> >::type save_dng (
        const image_type& image,
        std::ostream& out
    )
    {
        using namespace dng_helpers_namespace;
        save_dng_helper<image_type>::save_dng(image,out);
    }

    template <
        typename EXP 
        >
    inline void save_dng (
        const matrix_exp<EXP>& image,
        std::ostream& out
    )
    {
        array2d<typename EXP::type> temp;
        assign_image(temp, image);
        using namespace dng_helpers_namespace;
        save_dng_helper<array2d<typename EXP::type> >::save_dng(temp,out);
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




