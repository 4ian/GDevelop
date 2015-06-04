// Copyright (C) 2006  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#ifndef DLIB_MORPHOLOGICAL_OPERATIONs_
#define DLIB_MORPHOLOGICAL_OPERATIONs_

#include "../pixel.h"
#include "thresholding.h"
#include "morphological_operations_abstract.h"
#include "assign_image.h"

namespace dlib
{

// ----------------------------------------------------------------------------------------

    namespace morphological_operations_helpers
    {
        template <typename image_type>
        bool is_binary_image (
            const image_type& img_
        )
        /*!
            ensures
                - returns true if img_ contains only on_pixel and off_pixel values.
                - returns false otherwise
        !*/
        {
            const_image_view<image_type> img(img_);
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
        const in_image_type& in_img_,
        out_image_type& out_img_,
        const unsigned char (&structuring_element)[M][N]
    )
    {
        typedef typename image_traits<in_image_type>::pixel_type in_pixel_type;
        typedef typename image_traits<out_image_type>::pixel_type out_pixel_type;
        COMPILE_TIME_ASSERT( pixel_traits<in_pixel_type>::has_alpha == false );
        COMPILE_TIME_ASSERT( pixel_traits<out_pixel_type>::has_alpha == false );

        using namespace morphological_operations_helpers;
        COMPILE_TIME_ASSERT(M%2 == 1);
        COMPILE_TIME_ASSERT(N%2 == 1);
        DLIB_ASSERT(is_same_object(in_img_,out_img_) == false,
            "\tvoid binary_dilation()"
            << "\n\tYou must give two different image objects"
            );
        COMPILE_TIME_ASSERT(pixel_traits<in_pixel_type>::grayscale);
        DLIB_ASSERT(is_binary_image(in_img_) ,
            "\tvoid binary_dilation()"
            << "\n\tin_img must be a binary image"
            );
        DLIB_ASSERT(is_binary_image(structuring_element) ,
            "\tvoid binary_dilation()"
            << "\n\tthe structuring_element must be a binary image"
            );


        const_image_view<in_image_type> in_img(in_img_);
        image_view<out_image_type> out_img(out_img_);

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
        const in_image_type& in_img_,
        out_image_type& out_img_,
        const unsigned char (&structuring_element)[M][N]
    )
    {
        typedef typename image_traits<in_image_type>::pixel_type in_pixel_type;
        typedef typename image_traits<out_image_type>::pixel_type out_pixel_type;
        COMPILE_TIME_ASSERT( pixel_traits<in_pixel_type>::has_alpha == false );
        COMPILE_TIME_ASSERT( pixel_traits<out_pixel_type>::has_alpha == false );

        using namespace morphological_operations_helpers;
        COMPILE_TIME_ASSERT(M%2 == 1);
        COMPILE_TIME_ASSERT(N%2 == 1);
        DLIB_ASSERT(is_same_object(in_img_,out_img_) == false,
            "\tvoid binary_erosion()"
            << "\n\tYou must give two different image objects"
            );
        COMPILE_TIME_ASSERT(pixel_traits<in_pixel_type>::grayscale);
        DLIB_ASSERT(is_binary_image(in_img_) ,
            "\tvoid binary_erosion()"
            << "\n\tin_img must be a binary image"
            );
        DLIB_ASSERT(is_binary_image(structuring_element) ,
            "\tvoid binary_erosion()"
            << "\n\tthe structuring_element must be a binary image"
            );

        const_image_view<in_image_type> in_img(in_img_);
        image_view<out_image_type> out_img(out_img_);


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
        typedef typename image_traits<in_image_type>::pixel_type in_pixel_type;
        typedef typename image_traits<out_image_type>::pixel_type out_pixel_type;
        COMPILE_TIME_ASSERT( pixel_traits<in_pixel_type>::has_alpha == false );
        COMPILE_TIME_ASSERT( pixel_traits<out_pixel_type>::has_alpha == false );

        using namespace morphological_operations_helpers;
        COMPILE_TIME_ASSERT(M%2 == 1);
        COMPILE_TIME_ASSERT(N%2 == 1);
        DLIB_ASSERT(is_same_object(in_img,out_img) == false,
            "\tvoid binary_open()"
            << "\n\tYou must give two different image objects"
            );
        COMPILE_TIME_ASSERT(pixel_traits<in_pixel_type>::grayscale);
        DLIB_ASSERT(is_binary_image(in_img) ,
            "\tvoid binary_open()"
            << "\n\tin_img must be a binary image"
            );
        DLIB_ASSERT(is_binary_image(structuring_element) ,
            "\tvoid binary_open()"
            << "\n\tthe structuring_element must be a binary image"
            );


        // if there isn't any input image then don't do anything
        if (num_rows(in_img)*num_columns(in_img) == 0)
        {
            set_image_size(out_img, 0,0);
            return;
        }

        set_image_size(out_img, num_rows(in_img), num_columns(in_img));

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
                swap(temp1, temp2);
                binary_erosion(temp2,temp1,structuring_element);
            }

            // do the extra dilations 
            for (unsigned long i = 1; i < iter; ++i)
            {
                swap(temp1, temp2);
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
        typedef typename image_traits<in_image_type>::pixel_type in_pixel_type;
        typedef typename image_traits<out_image_type>::pixel_type out_pixel_type;
        COMPILE_TIME_ASSERT( pixel_traits<in_pixel_type>::has_alpha == false );
        COMPILE_TIME_ASSERT( pixel_traits<out_pixel_type>::has_alpha == false );


        using namespace morphological_operations_helpers;
        COMPILE_TIME_ASSERT(M%2 == 1);
        COMPILE_TIME_ASSERT(N%2 == 1);
        DLIB_ASSERT(is_same_object(in_img,out_img) == false,
            "\tvoid binary_close()"
            << "\n\tYou must give two different image objects"
            );
        COMPILE_TIME_ASSERT(pixel_traits<in_pixel_type>::grayscale);
        DLIB_ASSERT(is_binary_image(in_img) ,
            "\tvoid binary_close()"
            << "\n\tin_img must be a binary image"
            );
        DLIB_ASSERT(is_binary_image(structuring_element) ,
            "\tvoid binary_close()"
            << "\n\tthe structuring_element must be a binary image"
            );


        // if there isn't any input image then don't do anything
        if (num_rows(in_img)*num_columns(in_img) == 0)
        {
            set_image_size(out_img, 0,0);
            return;
        }

        set_image_size(out_img, num_rows(in_img), num_columns(in_img));

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
                swap(temp1, temp2);
                binary_dilation(temp2,temp1,structuring_element);
            }

            // do the extra erosions 
            for (unsigned long i = 1; i < iter; ++i)
            {
                swap(temp1, temp2);
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
        const in_image_type1& in_img1_,
        const in_image_type2& in_img2_,
        out_image_type& out_img_
    )
    {
        typedef typename image_traits<in_image_type1>::pixel_type in_pixel_type1;
        typedef typename image_traits<in_image_type2>::pixel_type in_pixel_type2;
        typedef typename image_traits<out_image_type>::pixel_type out_pixel_type;
        COMPILE_TIME_ASSERT( pixel_traits<in_pixel_type1>::has_alpha == false );
        COMPILE_TIME_ASSERT( pixel_traits<in_pixel_type2>::has_alpha == false );
        COMPILE_TIME_ASSERT( pixel_traits<out_pixel_type>::has_alpha == false );

        using namespace morphological_operations_helpers;
        COMPILE_TIME_ASSERT(pixel_traits<in_pixel_type1>::grayscale);
        COMPILE_TIME_ASSERT(pixel_traits<in_pixel_type2>::grayscale);
        DLIB_ASSERT(is_binary_image(in_img1_) ,
            "\tvoid binary_intersection()"
            << "\n\tin_img1 must be a binary image"
            );
        DLIB_ASSERT(is_binary_image(in_img2_) ,
            "\tvoid binary_intersection()"
            << "\n\tin_img2 must be a binary image"
            );

        const_image_view<in_image_type1> in_img1(in_img1_);
        const_image_view<in_image_type2> in_img2(in_img2_);
        image_view<out_image_type> out_img(out_img_);

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
        const in_image_type1& in_img1_,
        const in_image_type2& in_img2_,
        out_image_type& out_img_
    )
    {
        typedef typename image_traits<in_image_type1>::pixel_type in_pixel_type1;
        typedef typename image_traits<in_image_type2>::pixel_type in_pixel_type2;
        typedef typename image_traits<out_image_type>::pixel_type out_pixel_type;
        COMPILE_TIME_ASSERT( pixel_traits<in_pixel_type1>::has_alpha == false );
        COMPILE_TIME_ASSERT( pixel_traits<in_pixel_type2>::has_alpha == false );
        COMPILE_TIME_ASSERT( pixel_traits<out_pixel_type>::has_alpha == false );


        using namespace morphological_operations_helpers;
        COMPILE_TIME_ASSERT(pixel_traits<in_pixel_type1>::grayscale);
        COMPILE_TIME_ASSERT(pixel_traits<in_pixel_type2>::grayscale);
        DLIB_ASSERT(is_binary_image(in_img1_) ,
            "\tvoid binary_intersection()"
            << "\n\tin_img1 must be a binary image"
            );
        DLIB_ASSERT(is_binary_image(in_img2_) ,
            "\tvoid binary_intersection()"
            << "\n\tin_img2 must be a binary image"
            );

        const_image_view<in_image_type1> in_img1(in_img1_);
        const_image_view<in_image_type2> in_img2(in_img2_);
        image_view<out_image_type> out_img(out_img_);

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
        const in_image_type1& in_img1_,
        const in_image_type2& in_img2_,
        out_image_type& out_img_
    )
    {
        typedef typename image_traits<in_image_type1>::pixel_type in_pixel_type1;
        typedef typename image_traits<in_image_type2>::pixel_type in_pixel_type2;
        typedef typename image_traits<out_image_type>::pixel_type out_pixel_type;
        COMPILE_TIME_ASSERT( pixel_traits<in_pixel_type1>::has_alpha == false );
        COMPILE_TIME_ASSERT( pixel_traits<in_pixel_type2>::has_alpha == false );
        COMPILE_TIME_ASSERT( pixel_traits<out_pixel_type>::has_alpha == false );

        using namespace morphological_operations_helpers;
        COMPILE_TIME_ASSERT(pixel_traits<in_pixel_type1>::grayscale);
        COMPILE_TIME_ASSERT(pixel_traits<in_pixel_type2>::grayscale);
        DLIB_ASSERT(is_binary_image(in_img1_) ,
            "\tvoid binary_difference()"
            << "\n\tin_img1 must be a binary image"
            );
        DLIB_ASSERT(is_binary_image(in_img2_) ,
            "\tvoid binary_difference()"
            << "\n\tin_img2 must be a binary image"
            );

        const_image_view<in_image_type1> in_img1(in_img1_);
        const_image_view<in_image_type2> in_img2(in_img2_);
        image_view<out_image_type> out_img(out_img_);

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
        const in_image_type& in_img_,
        out_image_type& out_img_
    )
    {
        typedef typename image_traits<in_image_type>::pixel_type in_pixel_type;
        typedef typename image_traits<out_image_type>::pixel_type out_pixel_type;
        COMPILE_TIME_ASSERT( pixel_traits<in_pixel_type>::has_alpha == false );
        COMPILE_TIME_ASSERT( pixel_traits<out_pixel_type>::has_alpha == false );


        using namespace morphological_operations_helpers;
        COMPILE_TIME_ASSERT(pixel_traits<in_pixel_type>::grayscale);
        DLIB_ASSERT(is_binary_image(in_img_) ,
            "\tvoid binary_complement()"
            << "\n\tin_img must be a binary image"
            );

        const_image_view<in_image_type> in_img(in_img_);
        image_view<out_image_type> out_img(out_img_);

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
// ----------------------------------------------------------------------------------------

    namespace impl
    {
        template <typename image_type>
        inline bool should_remove_pixel (
            const image_type& img,
            long r,
            long c,
            int iter
        )
        {
            unsigned int p2 = img[r-1][c];
            unsigned int p3 = img[r-1][c+1];
            unsigned int p4 = img[r][c+1];
            unsigned int p5 = img[r+1][c+1];
            unsigned int p6 = img[r+1][c];
            unsigned int p7 = img[r+1][c-1];
            unsigned int p8 = img[r][c-1];
            unsigned int p9 = img[r-1][c-1];

            int A  = (p2 == 0 && p3 == 255) + (p3 == 0 && p4 == 255) + 
                (p4 == 0 && p5 == 255) + (p5 == 0 && p6 == 255) + 
                (p6 == 0 && p7 == 255) + (p7 == 0 && p8 == 255) +
                (p8 == 0 && p9 == 255) + (p9 == 0 && p2 == 255);
            int B  = p2 + p3 + p4 + p5 + p6 + p7 + p8 + p9;
            int m1 = iter == 0 ? (p2 * p4 * p6) : (p2 * p4 * p8);
            int m2 = iter == 0 ? (p4 * p6 * p8) : (p2 * p6 * p8);
            // Decide if we should remove the pixel img[r][c].  
            return (A == 1 && (B >= 2*255 && B <= 6*255) && m1 == 0 && m2 == 0);
        }

        template <typename image_type>
        inline void add_to_remove (
            std::vector<point>& to_remove,
            array2d<unsigned char>& marker, 
            const image_type& img,
            long r,
            long c,
            int iter
        )
        {
            if (marker[r][c]&&should_remove_pixel(img,r,c,iter)) 
            {
                to_remove.push_back(point(c,r));
                marker[r][c] = 0;
            }
        }

        template <typename image_type>
        inline bool is_bw_border_pixel(
            const image_type& img,
            long r,
            long c
        )
        {
            unsigned int p2 = img[r-1][c];
            unsigned int p3 = img[r-1][c+1];
            unsigned int p4 = img[r][c+1];
            unsigned int p5 = img[r+1][c+1];
            unsigned int p6 = img[r+1][c];
            unsigned int p7 = img[r+1][c-1];
            unsigned int p8 = img[r][c-1];
            unsigned int p9 = img[r-1][c-1];

            int B  = p2 + p3 + p4 + p5 + p6 + p7 + p8 + p9;
            // If you are on but at least one of your neighbors isn't.
            return B<8*255 && img[r][c];

        }

        inline void add_if(
            std::vector<point>& to_check2, 
            const array2d<unsigned char>& marker,
            long c,
            long r
        )
        {
            if (marker[r][c])
                to_check2.push_back(point(c,r));
        }

    } // end namespace impl

// ----------------------------------------------------------------------------------------

    template <
        typename image_type
        >
    void skeleton(
        image_type& img_
    )
    {
        /*
            The implementation of this function is based on the paper
            "A fast parallel algorithm for thinning digital patterns” by T.Y. Zhang and C.Y. Suen.
            and also the excellent discussion of it at:
            http://opencv-code.com/quick-tips/implementation-of-thinning-algorithm-in-opencv/
        */

        typedef typename image_traits<image_type>::pixel_type pixel_type;

        // This function only works on grayscale images
        COMPILE_TIME_ASSERT(pixel_traits<pixel_type>::grayscale);

        using namespace impl;
        // Note that it's important to zero the border for 2 reasons. First, it allows
        // thinning to being at the border of the image.  But more importantly, it causes
        // the mask to have a border of 0 pixels as well which we use later to avoid
        // indexing outside the image inside add_to_remove().
        zero_border_pixels(img_,1,1);
        image_view<image_type> img(img_);

        // We use the marker to keep track of pixels we have committed to removing but
        // haven't yet removed from img.
        array2d<unsigned char> marker(img.nr(), img.nc());
        assign_image(marker, img);


        // Begin by making a list of the pixels on the borders of binary blobs.
        std::vector<point> to_remove, to_check, to_check2;
        for (int r = 1; r < img.nr()-1; r++)
        {
            for (int c = 1; c < img.nc()-1; c++)
            {
                if (is_bw_border_pixel(img, r, c))
                {
                    to_check.push_back(point(c,r));
                }
            }
        }

        // Now start iteratively looking at the border pixels and removing them.
        while(to_check.size() != 0)
        {
            for (int iter = 0; iter <= 1; ++iter)
            {
                // Check which pixels we should remove
                to_remove.clear();
                for (unsigned long i = 0; i < to_check.size(); ++i)
                {
                    long r = to_check[i].y();
                    long c = to_check[i].x();
                    add_to_remove(to_remove, marker, img, r, c, iter);
                }
                for (unsigned long i = 0; i < to_check2.size(); ++i)
                {
                    long r = to_check2[i].y();
                    long c = to_check2[i].x();
                    add_to_remove(to_remove, marker, img, r, c, iter);
                }
                // Now remove those pixels.  Also add their neighbors into the "to check"
                // pixel list for the next iteration.
                for (unsigned long i = 0; i < to_remove.size(); ++i)
                {
                    long r = to_remove[i].y();
                    long c = to_remove[i].x();
                    // remove the pixel
                    img[r][c] = 0;
                    add_if(to_check2, marker, c-1, r-1);
                    add_if(to_check2, marker, c,   r-1);
                    add_if(to_check2, marker, c+1, r-1);
                    add_if(to_check2, marker, c-1, r);
                    add_if(to_check2, marker, c+1, r);
                    add_if(to_check2, marker, c-1, r+1);
                    add_if(to_check2, marker, c,   r+1);
                    add_if(to_check2, marker, c+1, r+1);
                }
            }
            to_check.clear();
            to_check.swap(to_check2);
        }
    }

// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------

}

#endif // DLIB_MORPHOLOGICAL_OPERATIONs_

