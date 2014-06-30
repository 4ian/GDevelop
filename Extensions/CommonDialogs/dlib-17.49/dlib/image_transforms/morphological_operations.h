// Copyright (C) 2006  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#ifndef DLIB_MORPHOLOGICAL_OPERATIONs_
#define DLIB_MORPHOLOGICAL_OPERATIONs_

#include "../pixel.h"
#include "thresholding.h"
#include "morphological_operations_abstract.h"

namespace dlib
{

// ----------------------------------------------------------------------------------------

    namespace morphological_operations_helpers
    {
        template <typename image_type>
        bool is_binary_image (
            const image_type& img
        )
        /*!
            ensures
                - returns true if img contains only on_pixel and off_pixel values.
                - returns false otherwise
        !*/
        {
            for (long r = 0; r < img.nr(); ++r)
            {
                for (long c = 0; c < img.nc(); ++c)
                {
                    if (img[r][c] != on_pixel && img[r][c] != off_pixel)
                    {
                        return false;
                    }
                }
            }
            return true;
        }

        template <
            long M,
            long N
            >
        bool is_binary_image (
            const unsigned char (&structuring_element)[M][N]
        )
        /*!
            ensures
                - returns true if structuring_element contains only on_pixel and off_pixel values.
                - returns false otherwise
        !*/
        {
            for (long m = 0; m < M; ++m)
            {
                for (long n = 0; n < N; ++n)
                {
                    if (structuring_element[m][n] != on_pixel &&
                        structuring_element[m][n] != off_pixel)
                    {
                        return false;
                    }
                }
            }
            return true;
        }

    }

// ----------------------------------------------------------------------------------------

    template <
        typename in_image_type,
        typename out_image_type,
        long M,
        long N
        >
    void binary_dilation (
        const in_image_type& in_img,
        out_image_type& out_img,
        const unsigned char (&structuring_element)[M][N]
    )
    {
        COMPILE_TIME_ASSERT( pixel_traits<typename in_image_type::type>::has_alpha == false );
        COMPILE_TIME_ASSERT( pixel_traits<typename out_image_type::type>::has_alpha == false );

        using namespace morphological_operations_helpers;
        COMPILE_TIME_ASSERT(M%2 == 1);
        COMPILE_TIME_ASSERT(N%2 == 1);
        DLIB_ASSERT(is_same_object(in_img,out_img) == false,
            "\tvoid binary_dilation()"
            << "\n\tYou must give two different image objects"
            );
        COMPILE_TIME_ASSERT(pixel_traits<typename in_image_type::type>::grayscale);
        DLIB_ASSERT(is_binary_image(in_img) ,
            "\tvoid binary_dilation()"
            << "\n\tin_img must be a binary image"
            );
        DLIB_ASSERT(is_binary_image(structuring_element) ,
            "\tvoid binary_dilation()"
            << "\n\tthe structuring_element must be a binary image"
            );



        // if there isn't any input image then don't do anything
        if (in_img.size() == 0)
        {
            out_img.clear();
            return;
        }

        out_img.set_size(in_img.nr(),in_img.nc());

        // apply the filter to the image
        for (long r = 0; r < in_img.nr(); ++r)
        {
            for (long c = 0; c < in_img.nc(); ++c)
            {
                unsigned char out_pixel = off_pixel;
                for (long m = 0; m < M && out_pixel == off_pixel; ++m)
                {
                    for (long n = 0; n < N && out_pixel == off_pixel; ++n)
                    {
                        if (structuring_element[m][n] == on_pixel)
                        {
                            // if this pixel is inside the image then get it from the image
                            // but if it isn't just pretend it was an off_pixel value
                            if (r+m >= M/2 && c+n >= N/2 &&
                                r+m-M/2 < in_img.nr() && c+n-N/2 < in_img.nc())
                            {
                                out_pixel = in_img[r+m-M/2][c+n-N/2];
                            }
                        }
                    }
                }
                assign_pixel(out_img[r][c], out_pixel);
            }
        }
    }

// ----------------------------------------------------------------------------------------

    template <
        typename in_image_type,
        typename out_image_type,
        long M,
        long N
        >
    void binary_erosion (
        const in_image_type& in_img,
        out_image_type& out_img,
        const unsigned char (&structuring_element)[M][N]
    )
    {
        COMPILE_TIME_ASSERT( pixel_traits<typename in_image_type::type>::has_alpha == false );
        COMPILE_TIME_ASSERT( pixel_traits<typename out_image_type::type>::has_alpha == false );

        using namespace morphological_operations_helpers;
        COMPILE_TIME_ASSERT(M%2 == 1);
        COMPILE_TIME_ASSERT(N%2 == 1);
        DLIB_ASSERT(is_same_object(in_img,out_img) == false,
            "\tvoid binary_erosion()"
            << "\n\tYou must give two different image objects"
            );
        COMPILE_TIME_ASSERT(pixel_traits<typename in_image_type::type>::grayscale);
        DLIB_ASSERT(is_binary_image(in_img) ,
            "\tvoid binary_erosion()"
            << "\n\tin_img must be a binary image"
            );
        DLIB_ASSERT(is_binary_image(structuring_element) ,
            "\tvoid binary_erosion()"
            << "\n\tthe structuring_element must be a binary image"
            );



        // if there isn't any input image then don't do anything
        if (in_img.size() == 0)
        {
            out_img.clear();
            return;
        }

        out_img.set_size(in_img.nr(),in_img.nc());

        // apply the filter to the image
        for (long r = 0; r < in_img.nr(); ++r)
        {
            for (long c = 0; c < in_img.nc(); ++c)
            {
                unsigned char out_pixel = on_pixel;
                for (long m = 0; m < M && out_pixel == on_pixel; ++m)
                {
                    for (long n = 0; n < N && out_pixel == on_pixel; ++n)
                    {
                        if (structuring_element[m][n] == on_pixel)
                        {
                            // if this pixel is inside the image then get it from the image
                            // but if it isn't just pretend it was an off_pixel value
                            if (r+m >= M/2 && c+n >= N/2 &&
                                r+m-M/2 < in_img.nr() && c+n-N/2 < in_img.nc())
                            {
                                out_pixel = in_img[r+m-M/2][c+n-N/2];
                            }
                            else
                            {
                                out_pixel = off_pixel;
                            }
                        }
                    }
                }
                assign_pixel(out_img[r][c], out_pixel);
            }
        }
    }

// ----------------------------------------------------------------------------------------

    template <
        typename in_image_type,
        typename out_image_type,
        long M,
        long N
        >
    void binary_open (
        const in_image_type& in_img,
        out_image_type& out_img,
        const unsigned char (&structuring_element)[M][N],
        const unsigned long iter = 1
    )
    {
        COMPILE_TIME_ASSERT( pixel_traits<typename in_image_type::type>::has_alpha == false );
        COMPILE_TIME_ASSERT( pixel_traits<typename out_image_type::type>::has_alpha == false );

        using namespace morphological_operations_helpers;
        COMPILE_TIME_ASSERT(M%2 == 1);
        COMPILE_TIME_ASSERT(N%2 == 1);
        DLIB_ASSERT(is_same_object(in_img,out_img) == false,
            "\tvoid binary_open()"
            << "\n\tYou must give two different image objects"
            );
        COMPILE_TIME_ASSERT(pixel_traits<typename in_image_type::type>::grayscale);
        DLIB_ASSERT(is_binary_image(in_img) ,
            "\tvoid binary_open()"
            << "\n\tin_img must be a binary image"
            );
        DLIB_ASSERT(is_binary_image(structuring_element) ,
            "\tvoid binary_open()"
            << "\n\tthe structuring_element must be a binary image"
            );


        // if there isn't any input image then don't do anything
        if (in_img.size() == 0)
        {
            out_img.clear();
            return;
        }

        out_img.set_size(in_img.nr(),in_img.nc());

        if (iter == 0)
        {
            // just copy the image over
            assign_image(out_img, in_img);
        }
        else if (iter == 1)
        {
            in_image_type temp;
            binary_erosion(in_img,temp,structuring_element);
            binary_dilation(temp,out_img,structuring_element);
        }
        else
        {
            in_image_type temp1, temp2;
            binary_erosion(in_img,temp1,structuring_element);

            // do the extra erosions
            for (unsigned long i = 1; i < iter; ++i)
            {
                temp1.swap(temp2);
                binary_erosion(temp2,temp1,structuring_element);
            }

            // do the extra dilations 
            for (unsigned long i = 1; i < iter; ++i)
            {
                temp1.swap(temp2);
                binary_dilation(temp2,temp1,structuring_element);
            }

            binary_dilation(temp1,out_img,structuring_element);
        }
    }

// ----------------------------------------------------------------------------------------

    template <
        typename in_image_type,
        typename out_image_type,
        long M,
        long N
        >
    void binary_close (
        const in_image_type& in_img,
        out_image_type& out_img,
        const unsigned char (&structuring_element)[M][N],
        const unsigned long iter = 1
    )
    {
        COMPILE_TIME_ASSERT( pixel_traits<typename in_image_type::type>::has_alpha == false );
        COMPILE_TIME_ASSERT( pixel_traits<typename out_image_type::type>::has_alpha == false );

        using namespace morphological_operations_helpers;
        COMPILE_TIME_ASSERT(M%2 == 1);
        COMPILE_TIME_ASSERT(N%2 == 1);
        DLIB_ASSERT(is_same_object(in_img,out_img) == false,
            "\tvoid binary_close()"
            << "\n\tYou must give two different image objects"
            );
        COMPILE_TIME_ASSERT(pixel_traits<typename in_image_type::type>::grayscale);
        DLIB_ASSERT(is_binary_image(in_img) ,
            "\tvoid binary_close()"
            << "\n\tin_img must be a binary image"
            );
        DLIB_ASSERT(is_binary_image(structuring_element) ,
            "\tvoid binary_close()"
            << "\n\tthe structuring_element must be a binary image"
            );


        // if there isn't any input image then don't do anything
        if (in_img.size() == 0)
        {
            out_img.clear();
            return;
        }

        out_img.set_size(in_img.nr(),in_img.nc());

        if (iter == 0)
        {
            // just copy the image over
            assign_image(out_img, in_img);
        }
        else if (iter == 1)
        {
            in_image_type temp;
            binary_dilation(in_img,temp,structuring_element);
            binary_erosion(temp,out_img,structuring_element);
        }
        else
        {
            in_image_type temp1, temp2;
            binary_dilation(in_img,temp1,structuring_element);

            // do the extra dilations 
            for (unsigned long i = 1; i < iter; ++i)
            {
                temp1.swap(temp2);
                binary_dilation(temp2,temp1,structuring_element);
            }

            // do the extra erosions 
            for (unsigned long i = 1; i < iter; ++i)
            {
                temp1.swap(temp2);
                binary_erosion(temp2,temp1,structuring_element);
            }

            binary_erosion(temp1,out_img,structuring_element);
        }
    }

// ----------------------------------------------------------------------------------------

    template <
        typename in_image_type1,
        typename in_image_type2,
        typename out_image_type
        >
    void binary_intersection (
        const in_image_type1& in_img1,
        const in_image_type2& in_img2,
        out_image_type& out_img
    )
    {
        COMPILE_TIME_ASSERT( pixel_traits<typename in_image_type1::type>::has_alpha == false );
        COMPILE_TIME_ASSERT( pixel_traits<typename in_image_type2::type>::has_alpha == false );
        COMPILE_TIME_ASSERT( pixel_traits<typename out_image_type::type>::has_alpha == false );

        using namespace morphological_operations_helpers;
        COMPILE_TIME_ASSERT(pixel_traits<typename in_image_type1::type>::grayscale);
        COMPILE_TIME_ASSERT(pixel_traits<typename in_image_type2::type>::grayscale);
        DLIB_ASSERT(is_binary_image(in_img1) ,
            "\tvoid binary_intersection()"
            << "\n\tin_img1 must be a binary image"
            );
        DLIB_ASSERT(is_binary_image(in_img2) ,
            "\tvoid binary_intersection()"
            << "\n\tin_img2 must be a binary image"
            );
        DLIB_ASSERT(in_img1.nc() == in_img2.nc(),
            "\tvoid binary_intersection()"
            << "\n\tin_img1 and in_img2 must have the same ncs."
            << "\n\tin_img1.nc(): " << in_img1.nc()
            << "\n\tin_img2.nc(): " << in_img2.nc()
            );
        DLIB_ASSERT(in_img1.nr() == in_img2.nr(),
            "\tvoid binary_intersection()"
            << "\n\tin_img1 and in_img2 must have the same nrs."
            << "\n\tin_img1.nr(): " << in_img1.nr()
            << "\n\tin_img2.nr(): " << in_img2.nr()
            );
            


        // if there isn't any input image then don't do anything
        if (in_img1.size() == 0)
        {
            out_img.clear();
            return;
        }

        out_img.set_size(in_img1.nr(),in_img1.nc());

        for (long r = 0; r < in_img1.nr(); ++r)
        {
            for (long c = 0; c < in_img1.nc(); ++c)
            {
                if (in_img1[r][c] == on_pixel && in_img2[r][c] == on_pixel)
                    assign_pixel(out_img[r][c], on_pixel);
                else
                    assign_pixel(out_img[r][c], off_pixel);
            }
        }
    }

// ----------------------------------------------------------------------------------------

    template <
        typename in_image_type1,
        typename in_image_type2,
        typename out_image_type
        >
    void binary_union (
        const in_image_type1& in_img1,
        const in_image_type2& in_img2,
        out_image_type& out_img
    )
    {
        COMPILE_TIME_ASSERT( pixel_traits<typename in_image_type1::type>::has_alpha == false );
        COMPILE_TIME_ASSERT( pixel_traits<typename in_image_type2::type>::has_alpha == false );
        COMPILE_TIME_ASSERT( pixel_traits<typename out_image_type::type>::has_alpha == false );

        using namespace morphological_operations_helpers;
        COMPILE_TIME_ASSERT(pixel_traits<typename in_image_type1::type>::grayscale);
        COMPILE_TIME_ASSERT(pixel_traits<typename in_image_type2::type>::grayscale);
        DLIB_ASSERT(is_binary_image(in_img1) ,
            "\tvoid binary_intersection()"
            << "\n\tin_img1 must be a binary image"
            );
        DLIB_ASSERT(is_binary_image(in_img2) ,
            "\tvoid binary_intersection()"
            << "\n\tin_img2 must be a binary image"
            );
        DLIB_ASSERT(in_img1.nc() == in_img2.nc(),
            "\tvoid binary_intersection()"
            << "\n\tin_img1 and in_img2 must have the same ncs."
            << "\n\tin_img1.nc(): " << in_img1.nc()
            << "\n\tin_img2.nc(): " << in_img2.nc()
            );
        DLIB_ASSERT(in_img1.nr() == in_img2.nr(),
            "\tvoid binary_intersection()"
            << "\n\tin_img1 and in_img2 must have the same nrs."
            << "\n\tin_img1.nr(): " << in_img1.nr()
            << "\n\tin_img2.nr(): " << in_img2.nr()
            );
            


        // if there isn't any input image then don't do anything
        if (in_img1.size() == 0)
        {
            out_img.clear();
            return;
        }

        out_img.set_size(in_img1.nr(),in_img1.nc());

        for (long r = 0; r < in_img1.nr(); ++r)
        {
            for (long c = 0; c < in_img1.nc(); ++c)
            {
                if (in_img1[r][c] == on_pixel || in_img2[r][c] == on_pixel)
                    assign_pixel(out_img[r][c], on_pixel);
                else
                    assign_pixel(out_img[r][c], off_pixel);
            }
        }
    }

// ----------------------------------------------------------------------------------------

    template <
        typename in_image_type1,
        typename in_image_type2,
        typename out_image_type
        >
    void binary_difference (
        const in_image_type1& in_img1,
        const in_image_type2& in_img2,
        out_image_type& out_img
    )
    {
        COMPILE_TIME_ASSERT( pixel_traits<typename in_image_type1::type>::has_alpha == false );
        COMPILE_TIME_ASSERT( pixel_traits<typename in_image_type2::type>::has_alpha == false );
        COMPILE_TIME_ASSERT( pixel_traits<typename out_image_type::type>::has_alpha == false );

        using namespace morphological_operations_helpers;
        COMPILE_TIME_ASSERT(pixel_traits<typename in_image_type1::type>::grayscale);
        COMPILE_TIME_ASSERT(pixel_traits<typename in_image_type2::type>::grayscale);
        DLIB_ASSERT(is_binary_image(in_img1) ,
            "\tvoid binary_difference()"
            << "\n\tin_img1 must be a binary image"
            );
        DLIB_ASSERT(is_binary_image(in_img2) ,
            "\tvoid binary_difference()"
            << "\n\tin_img2 must be a binary image"
            );
        DLIB_ASSERT(in_img1.nc() == in_img2.nc(),
            "\tvoid binary_difference()"
            << "\n\tin_img1 and in_img2 must have the same ncs."
            << "\n\tin_img1.nc(): " << in_img1.nc()
            << "\n\tin_img2.nc(): " << in_img2.nc()
            );
        DLIB_ASSERT(in_img1.nr() == in_img2.nr(),
            "\tvoid binary_difference()"
            << "\n\tin_img1 and in_img2 must have the same nrs."
            << "\n\tin_img1.nr(): " << in_img1.nr()
            << "\n\tin_img2.nr(): " << in_img2.nr()
            );
            


        // if there isn't any input image then don't do anything
        if (in_img1.size() == 0)
        {
            out_img.clear();
            return;
        }

        out_img.set_size(in_img1.nr(),in_img1.nc());

        for (long r = 0; r < in_img1.nr(); ++r)
        {
            for (long c = 0; c < in_img1.nc(); ++c)
            {
                if (in_img1[r][c] == on_pixel && in_img2[r][c] == off_pixel)
                    assign_pixel(out_img[r][c], on_pixel);
                else
                    assign_pixel(out_img[r][c], off_pixel);
            }
        }
    }

// ----------------------------------------------------------------------------------------

    template <
        typename in_image_type,
        typename out_image_type
        >
    void binary_complement (
        const in_image_type& in_img,
        out_image_type& out_img
    )
    {
        COMPILE_TIME_ASSERT( pixel_traits<typename in_image_type::type>::has_alpha == false );
        COMPILE_TIME_ASSERT( pixel_traits<typename out_image_type::type>::has_alpha == false );

        using namespace morphological_operations_helpers;
        COMPILE_TIME_ASSERT(pixel_traits<typename in_image_type::type>::grayscale);
        DLIB_ASSERT(is_binary_image(in_img) ,
            "\tvoid binary_complement()"
            << "\n\tin_img must be a binary image"
            );


        // if there isn't any input image then don't do anything
        if (in_img.size() == 0)
        {
            out_img.clear();
            return;
        }

        out_img.set_size(in_img.nr(),in_img.nc());

        for (long r = 0; r < in_img.nr(); ++r)
        {
            for (long c = 0; c < in_img.nc(); ++c)
            {
                if (in_img[r][c] == on_pixel)
                    assign_pixel(out_img[r][c], off_pixel);
                else
                    assign_pixel(out_img[r][c], on_pixel);
            }
        }
    }

    template <
        typename image_type
        >
    void binary_complement (
        image_type& img
    )
    {
        binary_complement(img,img);
    }

// ----------------------------------------------------------------------------------------

}

#endif // DLIB_MORPHOLOGICAL_OPERATIONs_

