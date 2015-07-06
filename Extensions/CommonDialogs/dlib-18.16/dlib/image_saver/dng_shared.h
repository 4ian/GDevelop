// Copyright (C) 2007  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#ifndef DLIB_DNG_SHAREd_
#define DLIB_DNG_SHAREd_

#include "../pixel.h"
#include <cmath>
#include "../uintn.h"

namespace dlib
{

    namespace dng_helpers_namespace
    {
        enum 
        {
            grayscale = 1,
            rgb,
            hsi,
            rgb_paeth,
            rgb_alpha,
            rgb_alpha_paeth,
            grayscale_16bit,
            grayscale_float
        };

        const unsigned long dng_magic_byte = 100;

        template <typename T>
        rgb_pixel predictor_rgb_paeth (const T& img, long row, long col)
        /*
            This is similar to the Paeth filter from the PNG image format.
        */
        {
            // a = left, b = above, c = upper left
            rgb_pixel a(0,0,0), b(0,0,0), c(0,0,0);


            const long c1 = col-1;
            const long r1 = row-1;

            if (c1 >= 0)            
                assign_pixel(a, img[row][c1]);
            else
                assign_pixel(a,(unsigned char)0);

            if (c1 >= 0 && r1 >= 0) 
                assign_pixel(c, img[r1][c1]);
            else
                assign_pixel(c,(unsigned char)0);

            if (r1 >= 0)            
                assign_pixel(b, img[r1][col]);
            else
                assign_pixel(b,(unsigned char)0);


            rgb_pixel p;
            p.red = a.red + b.red - c.red;
            p.green = a.green + b.green - c.green;
            p.blue = a.blue + b.blue - c.blue;

            short pa = std::abs((short)p.red - (short)a.red) +
                       std::abs((short)p.green - (short)a.green) +
                       std::abs((short)p.blue - (short)a.blue);
            short pb = std::abs((short)p.red - (short)b.red) +
                       std::abs((short)p.green - (short)b.green) +
                       std::abs((short)p.blue - (short)b.blue);
            short pc = std::abs((short)p.red - (short)c.red) +
                       std::abs((short)p.green - (short)c.green) +
                       std::abs((short)p.blue - (short)c.blue);

            if (pa <= pb && pa <= pc) 
                return a;
            else if (pb <= pc) 
                return b;
            else 
                return c;
        }


        template <typename T>
        rgb_pixel predictor_rgb (const T& img, long row, long col)
        {
            // a = left, b = above, c = upper left
            rgb_pixel a(0,0,0), b(0,0,0), c(0,0,0);


            const long c1 = col-1;
            const long r1 = row-1;

            if (c1 >= 0)            
                assign_pixel(a, img[row][c1]);
            else
                assign_pixel(a,(unsigned char)0);

            if (c1 >= 0 && r1 >= 0) 
                assign_pixel(c, img[r1][c1]);
            else
                assign_pixel(c,(unsigned char)0);

            if (r1 >= 0)            
                assign_pixel(b, img[r1][col]);
            else
                assign_pixel(b,(unsigned char)0);


            rgb_pixel p;
            p.red = a.red + b.red - c.red;
            p.green = a.green + b.green - c.green;
            p.blue = a.blue + b.blue - c.blue;
            return p;
        }

        template <typename T>
        rgb_alpha_pixel predictor_rgb_alpha_paeth (const T& img, long row, long col)
        /*
            This is similar to the Paeth filter from the PNG image format.
        */
        {
            // a = left, b = above, c = upper left
            rgb_alpha_pixel a, b, c;


            const long c1 = col-1;
            const long r1 = row-1;

            if (c1 >= 0)            
                assign_pixel(a, img[row][c1]);
            else
                assign_pixel(a,(unsigned char)0);

            if (c1 >= 0 && r1 >= 0) 
                assign_pixel(c, img[r1][c1]);
            else
                assign_pixel(c,(unsigned char)0);

            if (r1 >= 0)            
                assign_pixel(b, img[r1][col]);
            else
                assign_pixel(b,(unsigned char)0);


            rgb_alpha_pixel p;
            p.red = a.red + b.red - c.red;
            p.green = a.green + b.green - c.green;
            p.blue = a.blue + b.blue - c.blue;

            short pa = std::abs((short)p.red - (short)a.red) +
                       std::abs((short)p.green - (short)a.green) +
                       std::abs((short)p.blue - (short)a.blue);
            short pb = std::abs((short)p.red - (short)b.red) +
                       std::abs((short)p.green - (short)b.green) +
                       std::abs((short)p.blue - (short)b.blue);
            short pc = std::abs((short)p.red - (short)c.red) +
                       std::abs((short)p.green - (short)c.green) +
                       std::abs((short)p.blue - (short)c.blue);

            if (pa <= pb && pa <= pc) 
                return a;
            else if (pb <= pc) 
                return b;
            else 
                return c;
        }


        template <typename T>
        rgb_alpha_pixel predictor_rgb_alpha (const T& img, long row, long col)
        {
            // a = left, b = above, c = upper left
            rgb_alpha_pixel a, b, c;


            const long c1 = col-1;
            const long r1 = row-1;

            if (c1 >= 0)            
                assign_pixel(a, img[row][c1]);
            else
                assign_pixel(a,(unsigned char)0);

            if (c1 >= 0 && r1 >= 0) 
                assign_pixel(c, img[r1][c1]);
            else
                assign_pixel(c,(unsigned char)0);

            if (r1 >= 0)            
                assign_pixel(b, img[r1][col]);
            else
                assign_pixel(b,(unsigned char)0);


            rgb_alpha_pixel p;
            p.red = a.red + b.red - c.red;
            p.green = a.green + b.green - c.green;
            p.blue = a.blue + b.blue - c.blue;
            p.alpha = a.alpha + b.alpha - c.alpha;
            return p;
        }


        template <typename T>
        hsi_pixel predictor_hsi (const T& img, long row, long col)
        {
            // a = left, b = above, c = upper left
            hsi_pixel a(0,0,0), b(0,0,0), c(0,0,0);


            const long c1 = col-1;
            const long r1 = row-1;

            if (c1 >= 0)            
                assign_pixel(a, img[row][c1]);
            else
                assign_pixel(a,(unsigned char)0);

            if (c1 >= 0 && r1 >= 0) 
                assign_pixel(c, img[r1][c1]);
            else
                assign_pixel(c,(unsigned char)0);

            if (r1 >= 0)            
                assign_pixel(b, img[r1][col]);
            else
                assign_pixel(b,(unsigned char)0);


            hsi_pixel p;
            p.h = a.h + b.h - c.h;
            p.s = a.s + b.s - c.s;
            p.i = a.i + b.i - c.i;
            return p;
        }

        template <typename T>
        unsigned char predictor_grayscale (const T& img, long row, long col)
        {
            // a = left, b = above, c = upper left
            unsigned char a = 0, b = 0, c = 0; 


            const long c1 = col-1;
            const long r1 = row-1;

            if (c1 >= 0)            
                assign_pixel(a, img[row][c1]);

            if (c1 >= 0 && r1 >= 0) 
                assign_pixel(c, img[r1][c1]);

            if (r1 >= 0)            
                assign_pixel(b, img[r1][col]);


            unsigned char p = a + b - c;
            return p;
        }

        template <typename T>
        uint16 predictor_grayscale_16 (const T& img, long row, long col)
        {
            // a = left, b = above, c = upper left
            uint16 a = 0, b = 0, c = 0; 


            const long c1 = col-1;
            const long r1 = row-1;

            if (c1 >= 0)            
                assign_pixel(a, img[row][c1]);

            if (c1 >= 0 && r1 >= 0) 
                assign_pixel(c, img[r1][c1]);

            if (r1 >= 0)            
                assign_pixel(b, img[r1][col]);


            uint16 p = a + b - c;
            return p;
        }

    }
}

#endif  // DLIB_DNG_SHAREd_

