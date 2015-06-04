// Copyright (C) 2010  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#ifndef DLIB_IMAGE_PYRaMID_Hh_
#define DLIB_IMAGE_PYRaMID_Hh_

#include "image_pyramid_abstract.h"
#include "../pixel.h"
#include "../array2d.h"
#include "../geometry.h"
#include "spatial_filtering.h"

namespace dlib
{

// ----------------------------------------------------------------------------------------

    class pyramid_disable : noncopyable
    {
    public:

        template <typename T>
        vector<double,2> point_down (
            const vector<T,2>& 
        ) const
        {
            return vector<double,2>(0,0);
        }

        template <typename T>
        vector<double,2> point_up (
            const vector<T,2>& 
        ) const
        {
            return vector<double,2>(0,0);
        }

    // -----------------------------

        template <typename T>
        vector<double,2> point_down (
            const vector<T,2>& p,
            unsigned int levels
        ) const
        {
            if (levels == 0)
                return p;
            else
                return vector<double,2>(0,0);
        }

        template <typename T>
        vector<double,2> point_up (
            const vector<T,2>& p,
            unsigned int levels
        ) const
        {
            if (levels == 0)
                return p;
            else
                return vector<double,2>(0,0);
        }

    // -----------------------------

        drectangle rect_up (
            const drectangle& rect
        ) const
        {
            return drectangle(point_up(rect.tl_corner()), point_up(rect.br_corner()));
        }

        drectangle rect_up (
            const drectangle& rect,
            unsigned int levels
        ) const
        {
            return drectangle(point_up(rect.tl_corner(),levels), point_up(rect.br_corner(),levels));
        }

    // -----------------------------

        drectangle rect_down (
            const drectangle& rect
        ) const
        {
            return drectangle(point_down(rect.tl_corner()), point_down(rect.br_corner()));
        }

        drectangle rect_down (
            const drectangle& rect,
            unsigned int levels
        ) const
        {
            return drectangle(point_down(rect.tl_corner(),levels), point_down(rect.br_corner(),levels));
        }

    // -----------------------------

    public:

        template <
            typename in_image_type,
            typename out_image_type
            >
        void operator() (
            // we do this #ifdef stuff to avoid compiler warnings about unused variables.
#ifdef ENABLE_ASSERTS
            const in_image_type& original,
#else
            const in_image_type& ,
#endif
            out_image_type& down
        ) const
        {
            // make sure requires clause is not broken
            DLIB_ASSERT(is_same_object(original, down) == false, 
                        "\t void pyramid_disable::operator()"
                        << "\n\t is_same_object(original, down): " << is_same_object(original, down) 
                        << "\n\t this:                           " << this
                        );

            typedef typename image_traits<in_image_type>::pixel_type in_pixel_type;
            typedef typename image_traits<out_image_type>::pixel_type out_pixel_type;
            COMPILE_TIME_ASSERT( pixel_traits<in_pixel_type>::has_alpha == false );
            COMPILE_TIME_ASSERT( pixel_traits<out_pixel_type>::has_alpha == false );

            set_image_size(down, 0, 0);
        }

        template <
            typename image_type
            >
        void operator() (
            image_type& img
        ) const
        {
            typedef typename image_traits<image_type>::pixel_type pixel_type;
            COMPILE_TIME_ASSERT( pixel_traits<pixel_type>::has_alpha == false );
            set_image_size(img, 0, 0);
        }
    };

// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------

    namespace impl
    {

        class pyramid_down_2_1 : noncopyable
        {
        public:

            template <typename T>
            vector<double,2> point_down (
                const vector<T,2>& p
            ) const
            {
                return p/2.0 - vector<double,2>(1.25,0.75);
            }

            template <typename T>
            vector<double,2> point_up (
                const vector<T,2>& p
            ) const
            {
                return (p + vector<T,2>(1.25,0.75))*2;
            }

        // -----------------------------

            template <typename T>
            vector<double,2> point_down (
                const vector<T,2>& p,
                unsigned int levels
            ) const
            {
                vector<double,2> temp = p;
                for (unsigned int i = 0; i < levels; ++i)
                    temp = point_down(temp);
                return temp;
            }

            template <typename T>
            vector<double,2> point_up (
                const vector<T,2>& p,
                unsigned int levels
            ) const
            {
                vector<double,2> temp = p;
                for (unsigned int i = 0; i < levels; ++i)
                    temp = point_up(temp);
                return temp;
            }

        // -----------------------------

            drectangle rect_up (
                const drectangle& rect
            ) const
            {
                return drectangle(point_up(rect.tl_corner()), point_up(rect.br_corner()));
            }

            drectangle rect_up (
                const drectangle& rect,
                unsigned int levels
            ) const
            {
                return drectangle(point_up(rect.tl_corner(),levels), point_up(rect.br_corner(),levels));
            }

        // -----------------------------

            drectangle rect_down (
                const drectangle& rect
            ) const
            {
                return drectangle(point_down(rect.tl_corner()), point_down(rect.br_corner()));
            }

            drectangle rect_down (
                const drectangle& rect,
                unsigned int levels
            ) const
            {
                return drectangle(point_down(rect.tl_corner(),levels), point_down(rect.br_corner(),levels));
            }

        // -----------------------------

        private:
            template <typename T, typename U>
            struct both_images_rgb
            {
                typedef typename image_traits<T>::pixel_type T_pix;
                typedef typename image_traits<U>::pixel_type U_pix;
                const static bool value = pixel_traits<T_pix>::rgb && pixel_traits<U_pix>::rgb;
            };
        public:

            template <
                typename in_image_type,
                typename out_image_type
                >
            typename disable_if<both_images_rgb<in_image_type,out_image_type> >::type operator() (
                const in_image_type& original_,
                out_image_type& down_
            ) const
            {
                // make sure requires clause is not broken
                DLIB_ASSERT( is_same_object(original_, down_) == false, 
                            "\t void pyramid_down_2_1::operator()"
                            << "\n\t is_same_object(original_, down_): " << is_same_object(original_, down_) 
                            << "\n\t this:                           " << this
                            );

                typedef typename image_traits<in_image_type>::pixel_type in_pixel_type;
                typedef typename image_traits<out_image_type>::pixel_type out_pixel_type;
                COMPILE_TIME_ASSERT( pixel_traits<in_pixel_type>::has_alpha == false );
                COMPILE_TIME_ASSERT( pixel_traits<out_pixel_type>::has_alpha == false );

                const_image_view<in_image_type> original(original_);
                image_view<out_image_type> down(down_);

                if (original.nr() <= 8 || original.nc() <= 8)
                {
                    down.clear();
                    return;
                }

                typedef typename pixel_traits<in_pixel_type>::basic_pixel_type bp_type;
                typedef typename promote<bp_type>::type ptype;
                array2d<ptype> temp_img;
                temp_img.set_size(original.nr(), (original.nc()-3)/2);
                down.set_size((original.nr()-3)/2, (original.nc()-3)/2);


                // This function applies a 5x5 Gaussian filter to the image.  It
                // does this by separating the filter into its horizontal and vertical
                // components and then downsamples the image by dropping every other
                // row and column.  Note that we can do these things all together in
                // one step.

                // apply row filter
                for (long r = 0; r < temp_img.nr(); ++r)
                {
                    long oc = 0;
                    for (long c = 0; c < temp_img.nc(); ++c)
                    {
                        ptype pix1;
                        ptype pix2;
                        ptype pix3;
                        ptype pix4;
                        ptype pix5;

                        assign_pixel(pix1, original[r][oc]);
                        assign_pixel(pix2, original[r][oc+1]);
                        assign_pixel(pix3, original[r][oc+2]);
                        assign_pixel(pix4, original[r][oc+3]);
                        assign_pixel(pix5, original[r][oc+4]);

                        pix2 *= 4;
                        pix3 *= 6;
                        pix4 *= 4;
                        
                        assign_pixel(temp_img[r][c], pix1 + pix2 + pix3 + pix4 + pix5);
                        oc += 2;
                    }
                }


                // apply column filter
                long dr = 0;
                for (long r = 2; r < temp_img.nr()-2; r += 2)
                {
                    for (long c = 0; c < temp_img.nc(); ++c)
                    {
                        ptype temp = temp_img[r-2][c] + 
                                    temp_img[r-1][c]*4 +  
                                    temp_img[r  ][c]*6 +  
                                    temp_img[r-1][c]*4 +  
                                    temp_img[r-2][c];  

                        assign_pixel(down[dr][c],temp/256);
                    }
                    ++dr;
                }

            }

        private:
            struct rgbptype 
            {
                uint16 red;
                uint16 green;
                uint16 blue;
            };
        public:
        // ------------------------------------------
        //       OVERLOAD FOR RGB TO RGB IMAGES
        // ------------------------------------------
            template <
                typename in_image_type,
                typename out_image_type
                >
            typename enable_if<both_images_rgb<in_image_type,out_image_type> >::type operator() (
                const in_image_type& original_,
                out_image_type& down_
            ) const
            {
                // make sure requires clause is not broken
                DLIB_ASSERT( is_same_object(original_, down_) == false, 
                            "\t void pyramid_down_2_1::operator()"
                            << "\n\t is_same_object(original_, down_): " << is_same_object(original_, down_) 
                            << "\n\t this:                           " << this
                            );

                typedef typename image_traits<in_image_type>::pixel_type in_pixel_type;
                typedef typename image_traits<out_image_type>::pixel_type out_pixel_type;
                COMPILE_TIME_ASSERT( pixel_traits<in_pixel_type>::has_alpha == false );
                COMPILE_TIME_ASSERT( pixel_traits<out_pixel_type>::has_alpha == false );

                const_image_view<in_image_type> original(original_);
                image_view<out_image_type> down(down_);

                if (original.nr() <= 8 || original.nc() <= 8)
                {
                    down.clear();
                    return;
                }

                array2d<rgbptype> temp_img;
                temp_img.set_size(original.nr(), (original.nc()-3)/2);
                down.set_size((original.nr()-3)/2, (original.nc()-3)/2);


                // This function applies a 5x5 Gaussian filter to the image.  It
                // does this by separating the filter into its horizontal and vertical
                // components and then downsamples the image by dropping every other
                // row and column.  Note that we can do these things all together in
                // one step.

                // apply row filter
                for (long r = 0; r < temp_img.nr(); ++r)
                {
                    long oc = 0;
                    for (long c = 0; c < temp_img.nc(); ++c)
                    {
                        rgbptype pix1;
                        rgbptype pix2;
                        rgbptype pix3;
                        rgbptype pix4;
                        rgbptype pix5;

                        pix1.red = original[r][oc].red;
                        pix2.red = original[r][oc+1].red;
                        pix3.red = original[r][oc+2].red;
                        pix4.red = original[r][oc+3].red;
                        pix5.red = original[r][oc+4].red;
                        pix1.green = original[r][oc].green;
                        pix2.green = original[r][oc+1].green;
                        pix3.green = original[r][oc+2].green;
                        pix4.green = original[r][oc+3].green;
                        pix5.green = original[r][oc+4].green;
                        pix1.blue = original[r][oc].blue;
                        pix2.blue = original[r][oc+1].blue;
                        pix3.blue = original[r][oc+2].blue;
                        pix4.blue = original[r][oc+3].blue;
                        pix5.blue = original[r][oc+4].blue;

                        pix2.red *= 4;
                        pix3.red *= 6;
                        pix4.red *= 4;

                        pix2.green *= 4;
                        pix3.green *= 6;
                        pix4.green *= 4;

                        pix2.blue *= 4;
                        pix3.blue *= 6;
                        pix4.blue *= 4;
                        
                        rgbptype temp;
                        temp.red = pix1.red + pix2.red + pix3.red + pix4.red + pix5.red;
                        temp.green = pix1.green + pix2.green + pix3.green + pix4.green + pix5.green;
                        temp.blue = pix1.blue + pix2.blue + pix3.blue + pix4.blue + pix5.blue;

                        temp_img[r][c] = temp;

                        oc += 2;
                    }
                }


                // apply column filter
                long dr = 0;
                for (long r = 2; r < temp_img.nr()-2; r += 2)
                {
                    for (long c = 0; c < temp_img.nc(); ++c)
                    {
                        rgbptype temp;
                        temp.red = temp_img[r-2][c].red + 
                                temp_img[r-1][c].red*4 +  
                                temp_img[r  ][c].red*6 +  
                                temp_img[r-1][c].red*4 +  
                                temp_img[r-2][c].red;  
                        temp.green = temp_img[r-2][c].green + 
                                    temp_img[r-1][c].green*4 +  
                                    temp_img[r  ][c].green*6 +  
                                    temp_img[r-1][c].green*4 +  
                                    temp_img[r-2][c].green;  
                        temp.blue = temp_img[r-2][c].blue + 
                                    temp_img[r-1][c].blue*4 +  
                                    temp_img[r  ][c].blue*6 +  
                                    temp_img[r-1][c].blue*4 +  
                                    temp_img[r-2][c].blue;  

                        down[dr][c].red = temp.red/256;
                        down[dr][c].green = temp.green/256;
                        down[dr][c].blue = temp.blue/256;
                    }
                    ++dr;
                }

            }

            template <
                typename image_type
                >
            void operator() (
                image_type& img
            ) const
            {
                image_type temp;
                (*this)(img, temp);
                swap(temp, img);
            }

        private:


        };

    // ----------------------------------------------------------------------------------------
    // ----------------------------------------------------------------------------------------
    // ----------------------------------------------------------------------------------------

        class pyramid_down_3_2 : noncopyable
        {
        public:

            template <typename T>
            vector<double,2> point_down (
                const vector<T,2>& p
            ) const
            {
                const double ratio = 2.0/3.0;
                return p*ratio - vector<double,2>(1,1);
            }

            template <typename T>
            vector<double,2> point_up (
                const vector<T,2>& p
            ) const
            {
                const double ratio = 3.0/2.0;
                return p*ratio + vector<T,2>(ratio,ratio);
            }

        // -----------------------------

            template <typename T>
            vector<double,2> point_down (
                const vector<T,2>& p,
                unsigned int levels
            ) const
            {
                vector<double,2> temp = p;
                for (unsigned int i = 0; i < levels; ++i)
                    temp = point_down(temp);
                return temp;
            }

            template <typename T>
            vector<double,2> point_up (
                const vector<T,2>& p,
                unsigned int levels
            ) const
            {
                vector<double,2> temp = p;
                for (unsigned int i = 0; i < levels; ++i)
                    temp = point_up(temp);
                return temp;
            }

        // -----------------------------

            drectangle rect_up (
                const drectangle& rect
            ) const
            {
                return drectangle(point_up(rect.tl_corner()), point_up(rect.br_corner()));
            }

            drectangle rect_up (
                const drectangle& rect,
                unsigned int levels
            ) const
            {
                return drectangle(point_up(rect.tl_corner(),levels), point_up(rect.br_corner(),levels));
            }

        // -----------------------------

            drectangle rect_down (
                const drectangle& rect
            ) const
            {
                return drectangle(point_down(rect.tl_corner()), point_down(rect.br_corner()));
            }

            drectangle rect_down (
                const drectangle& rect,
                unsigned int levels
            ) const
            {
                return drectangle(point_down(rect.tl_corner(),levels), point_down(rect.br_corner(),levels));
            }

        // -----------------------------

        private:
            template <typename T, typename U>
            struct both_images_rgb
            {
                typedef typename image_traits<T>::pixel_type T_pix;
                typedef typename image_traits<U>::pixel_type U_pix;
                const static bool value = pixel_traits<T_pix>::rgb && pixel_traits<U_pix>::rgb;
            };
        public:

            template <
                typename in_image_type,
                typename out_image_type
                >
            typename disable_if<both_images_rgb<in_image_type,out_image_type> >::type operator() (
                const in_image_type& original_,
                out_image_type& down_
            ) const
            {
                // make sure requires clause is not broken
                DLIB_ASSERT(is_same_object(original_, down_) == false, 
                            "\t void pyramid_down_3_2::operator()"
                            << "\n\t is_same_object(original_, down_): " << is_same_object(original_, down_) 
                            << "\n\t this:                           " << this
                            );

                typedef typename image_traits<in_image_type>::pixel_type in_pixel_type;
                typedef typename image_traits<out_image_type>::pixel_type out_pixel_type;
                COMPILE_TIME_ASSERT( pixel_traits<in_pixel_type>::has_alpha == false );
                COMPILE_TIME_ASSERT( pixel_traits<out_pixel_type>::has_alpha == false );

                const_image_view<in_image_type> original(original_);
                image_view<out_image_type> down(down_);

                if (original.nr() <= 8 || original.nc() <= 8)
                {
                    down.clear();
                    return;
                }

                const long size_in = 3;
                const long size_out = 2;

                typedef typename pixel_traits<in_pixel_type>::basic_pixel_type bp_type;
                typedef typename promote<bp_type>::type ptype;
                const long full_nr =  size_out*((original.nr()-2)/size_in);
                const long part_nr = (size_out*(original.nr()-2))/size_in;
                const long full_nc =  size_out*((original.nc()-2)/size_in);
                const long part_nc = (size_out*(original.nc()-2))/size_in;
                down.set_size(part_nr, part_nc);


                long rr = 1;
                long r;
                for (r = 0; r < full_nr; r+=size_out)
                {
                    long cc = 1;
                    long c;
                    for (c = 0; c < full_nc; c+=size_out)
                    {
                        ptype block[size_in][size_in];
                        separable_3x3_filter_block_grayscale(block, original_, rr, cc, 2, 12, 2);

                        // bi-linearly interpolate block 
                        assign_pixel(down[r][c]     , (block[0][0]*9 + block[1][0]*3 + block[0][1]*3 + block[1][1])/(16*256));
                        assign_pixel(down[r][c+1]   , (block[0][2]*9 + block[1][2]*3 + block[0][1]*3 + block[1][1])/(16*256));
                        assign_pixel(down[r+1][c]   , (block[2][0]*9 + block[1][0]*3 + block[2][1]*3 + block[1][1])/(16*256));
                        assign_pixel(down[r+1][c+1] , (block[2][2]*9 + block[1][2]*3 + block[2][1]*3 + block[1][1])/(16*256));

                        cc += size_in;
                    }
                    if (part_nc - full_nc == 1)
                    {
                        ptype block[size_in][2];
                        separable_3x3_filter_block_grayscale(block, original_, rr, cc, 2, 12, 2);

                        // bi-linearly interpolate partial block 
                        assign_pixel(down[r][c]     , (block[0][0]*9 + block[1][0]*3 + block[0][1]*3 + block[1][1])/(16*256));
                        assign_pixel(down[r+1][c]   , (block[2][0]*9 + block[1][0]*3 + block[2][1]*3 + block[1][1])/(16*256));
                    }
                    rr += size_in;
                }
                if (part_nr - full_nr == 1)
                {
                    long cc = 1;
                    long c;
                    for (c = 0; c < full_nc; c+=size_out)
                    {
                        ptype block[2][size_in];
                        separable_3x3_filter_block_grayscale(block, original_, rr, cc, 2, 12, 2);

                        // bi-linearly interpolate partial block 
                        assign_pixel(down[r][c]     , (block[0][0]*9 + block[1][0]*3 + block[0][1]*3 + block[1][1])/(16*256));
                        assign_pixel(down[r][c+1]   , (block[0][2]*9 + block[1][2]*3 + block[0][1]*3 + block[1][1])/(16*256));

                        cc += size_in;
                    }
                    if (part_nc - full_nc == 1)
                    {
                        ptype block[2][2];
                        separable_3x3_filter_block_grayscale(block, original_, rr, cc, 2, 12, 2);

                        // bi-linearly interpolate partial block 
                        assign_pixel(down[r][c]     , (block[0][0]*9 + block[1][0]*3 + block[0][1]*3 + block[1][1])/(16*256));
                    }
                }

            }

        private:
            struct rgbptype 
            {
                uint32 red;
                uint32 green;
                uint32 blue;
            };

        public:
        // ------------------------------------------
        //       OVERLOAD FOR RGB TO RGB IMAGES
        // ------------------------------------------
            template <
                typename in_image_type,
                typename out_image_type
                >
            typename enable_if<both_images_rgb<in_image_type,out_image_type> >::type operator() (
                const in_image_type& original_,
                out_image_type& down_
            ) const
            {
                // make sure requires clause is not broken
                DLIB_ASSERT( is_same_object(original_, down_) == false, 
                            "\t void pyramid_down_3_2::operator()"
                            << "\n\t is_same_object(original_, down_): " << is_same_object(original_, down_) 
                            << "\n\t this:                           " << this
                            );

                typedef typename image_traits<in_image_type>::pixel_type in_pixel_type;
                typedef typename image_traits<out_image_type>::pixel_type out_pixel_type;
                COMPILE_TIME_ASSERT( pixel_traits<in_pixel_type>::has_alpha == false );
                COMPILE_TIME_ASSERT( pixel_traits<out_pixel_type>::has_alpha == false );

                const_image_view<in_image_type> original(original_);
                image_view<out_image_type> down(down_);

                if (original.nr() <= 8 || original.nc() <= 8)
                {
                    down.clear();
                    return;
                }

                const long size_in = 3;
                const long size_out = 2;

                const long full_nr =  size_out*((original.nr()-2)/size_in);
                const long part_nr = (size_out*(original.nr()-2))/size_in;
                const long full_nc =  size_out*((original.nc()-2)/size_in);
                const long part_nc = (size_out*(original.nc()-2))/size_in;
                down.set_size(part_nr, part_nc);


                long rr = 1;
                long r;
                for (r = 0; r < full_nr; r+=size_out)
                {
                    long cc = 1;
                    long c;
                    for (c = 0; c < full_nc; c+=size_out)
                    {
                        rgbptype block[size_in][size_in];
                        separable_3x3_filter_block_rgb(block, original_, rr, cc, 2, 12, 2);

                        // bi-linearly interpolate block 
                        down[r][c].red       = (block[0][0].red*9   + block[1][0].red*3   + block[0][1].red*3   + block[1][1].red)/(16*256);
                        down[r][c].green     = (block[0][0].green*9 + block[1][0].green*3 + block[0][1].green*3 + block[1][1].green)/(16*256);
                        down[r][c].blue      = (block[0][0].blue*9  + block[1][0].blue*3  + block[0][1].blue*3  + block[1][1].blue)/(16*256);

                        down[r][c+1].red     = (block[0][2].red*9   + block[1][2].red*3   + block[0][1].red*3   + block[1][1].red)/(16*256);
                        down[r][c+1].green   = (block[0][2].green*9 + block[1][2].green*3 + block[0][1].green*3 + block[1][1].green)/(16*256);
                        down[r][c+1].blue    = (block[0][2].blue*9  + block[1][2].blue*3  + block[0][1].blue*3  + block[1][1].blue)/(16*256);

                        down[r+1][c].red     = (block[2][0].red*9   + block[1][0].red*3   + block[2][1].red*3   + block[1][1].red)/(16*256);
                        down[r+1][c].green   = (block[2][0].green*9 + block[1][0].green*3 + block[2][1].green*3 + block[1][1].green)/(16*256);
                        down[r+1][c].blue    = (block[2][0].blue*9  + block[1][0].blue*3  + block[2][1].blue*3  + block[1][1].blue)/(16*256);

                        down[r+1][c+1].red   = (block[2][2].red*9   + block[1][2].red*3   + block[2][1].red*3   + block[1][1].red)/(16*256);
                        down[r+1][c+1].green = (block[2][2].green*9 + block[1][2].green*3 + block[2][1].green*3 + block[1][1].green)/(16*256);
                        down[r+1][c+1].blue  = (block[2][2].blue*9  + block[1][2].blue*3  + block[2][1].blue*3  + block[1][1].blue)/(16*256);

                        cc += size_in;
                    }
                    if (part_nc - full_nc == 1)
                    {
                        rgbptype block[size_in][2];
                        separable_3x3_filter_block_rgb(block, original_, rr, cc, 2, 12, 2);

                        // bi-linearly interpolate partial block 
                        down[r][c].red       = (block[0][0].red*9   + block[1][0].red*3   + block[0][1].red*3   + block[1][1].red)/(16*256);
                        down[r][c].green     = (block[0][0].green*9 + block[1][0].green*3 + block[0][1].green*3 + block[1][1].green)/(16*256);
                        down[r][c].blue      = (block[0][0].blue*9  + block[1][0].blue*3  + block[0][1].blue*3  + block[1][1].blue)/(16*256);

                        down[r+1][c].red     = (block[2][0].red*9   + block[1][0].red*3   + block[2][1].red*3   + block[1][1].red)/(16*256);
                        down[r+1][c].green   = (block[2][0].green*9 + block[1][0].green*3 + block[2][1].green*3 + block[1][1].green)/(16*256);
                        down[r+1][c].blue    = (block[2][0].blue*9  + block[1][0].blue*3  + block[2][1].blue*3  + block[1][1].blue)/(16*256);
                    }
                    rr += size_in;
                }
                if (part_nr - full_nr == 1)
                {
                    long cc = 1;
                    long c;
                    for (c = 0; c < full_nc; c+=size_out)
                    {
                        rgbptype block[2][size_in];
                        separable_3x3_filter_block_rgb(block, original_, rr, cc, 2, 12, 2);

                        // bi-linearly interpolate partial block 
                        down[r][c].red       = (block[0][0].red*9   + block[1][0].red*3   + block[0][1].red*3   + block[1][1].red)/(16*256);
                        down[r][c].green     = (block[0][0].green*9 + block[1][0].green*3 + block[0][1].green*3 + block[1][1].green)/(16*256);
                        down[r][c].blue      = (block[0][0].blue*9  + block[1][0].blue*3  + block[0][1].blue*3  + block[1][1].blue)/(16*256);

                        down[r][c+1].red     = (block[0][2].red*9   + block[1][2].red*3   + block[0][1].red*3   + block[1][1].red)/(16*256);
                        down[r][c+1].green   = (block[0][2].green*9 + block[1][2].green*3 + block[0][1].green*3 + block[1][1].green)/(16*256);
                        down[r][c+1].blue    = (block[0][2].blue*9  + block[1][2].blue*3  + block[0][1].blue*3  + block[1][1].blue)/(16*256);

                        cc += size_in;
                    }
                    if (part_nc - full_nc == 1)
                    {
                        rgbptype block[2][2];
                        separable_3x3_filter_block_rgb(block, original_, rr, cc, 2, 12, 2);

                        // bi-linearly interpolate partial block 
                        down[r][c].red       = (block[0][0].red*9   + block[1][0].red*3   + block[0][1].red*3   + block[1][1].red)/(16*256);
                        down[r][c].green     = (block[0][0].green*9 + block[1][0].green*3 + block[0][1].green*3 + block[1][1].green)/(16*256);
                        down[r][c].blue      = (block[0][0].blue*9  + block[1][0].blue*3  + block[0][1].blue*3  + block[1][1].blue)/(16*256);
                    }
                }
            }

            template <
                typename image_type
                >
            void operator() (
                image_type& img
            ) const
            {
                image_type temp;
                (*this)(img, temp);
                swap(temp, img);
            }
        private:


        };

    }

// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------

    template <
        unsigned int N
        >
    class pyramid_down : noncopyable
    {
    public:

        COMPILE_TIME_ASSERT(N > 0);

        template <typename T>
        vector<double,2> point_down (
            const vector<T,2>& p
        ) const
        {
            const double ratio = (N-1.0)/N;
            return p*ratio;
        }

        template <typename T>
        vector<double,2> point_up (
            const vector<T,2>& p
        ) const
        {
            const double ratio = N/(N-1.0);
            return p*ratio;
        }

    // -----------------------------

        template <typename T>
        vector<double,2> point_down (
            const vector<T,2>& p,
            unsigned int levels
        ) const
        {
            vector<double,2> temp = p;
            for (unsigned int i = 0; i < levels; ++i)
                temp = point_down(temp);
            return temp;
        }

        template <typename T>
        vector<double,2> point_up (
            const vector<T,2>& p,
            unsigned int levels
        ) const
        {
            vector<double,2> temp = p;
            for (unsigned int i = 0; i < levels; ++i)
                temp = point_up(temp);
            return temp;
        }

    // -----------------------------

        drectangle rect_up (
            const drectangle& rect
        ) const
        {
            return drectangle(point_up(rect.tl_corner()), point_up(rect.br_corner()));
        }

        drectangle rect_up (
            const drectangle& rect,
            unsigned int levels
        ) const
        {
            return drectangle(point_up(rect.tl_corner(),levels), point_up(rect.br_corner(),levels));
        }

    // -----------------------------

        drectangle rect_down (
            const drectangle& rect
        ) const
        {
            return drectangle(point_down(rect.tl_corner()), point_down(rect.br_corner()));
        }

        drectangle rect_down (
            const drectangle& rect,
            unsigned int levels
        ) const
        {
            return drectangle(point_down(rect.tl_corner(),levels), point_down(rect.br_corner(),levels));
        }

        template <
            typename in_image_type,
            typename out_image_type
            >
        void operator() (
            const in_image_type& original,
            out_image_type& down
        ) const
        {
            // make sure requires clause is not broken
            DLIB_ASSERT(is_same_object(original, down) == false, 
                        "\t void pyramid_down::operator()"
                        << "\n\t is_same_object(original, down): " << is_same_object(original, down) 
                        << "\n\t this:                           " << this
                        );

            typedef typename image_traits<in_image_type>::pixel_type in_pixel_type;
            typedef typename image_traits<out_image_type>::pixel_type out_pixel_type;
            COMPILE_TIME_ASSERT( pixel_traits<in_pixel_type>::has_alpha == false );
            COMPILE_TIME_ASSERT( pixel_traits<out_pixel_type>::has_alpha == false );


            set_image_size(down, ((N-1)*num_rows(original))/N, ((N-1)*num_columns(original))/N);
            resize_image(original, down);
        }

        template <
            typename image_type
            >
        void operator() (
            image_type& img
        ) const
        {
            image_type temp;
            (*this)(img, temp);
            swap(temp, img);
        }
    };

    template <>
    class pyramid_down<1> : public pyramid_disable {};

    template <>
    class pyramid_down<2> : public dlib::impl::pyramid_down_2_1 {};

    template <>
    class pyramid_down<3> : public dlib::impl::pyramid_down_3_2 {};

// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------

}

#endif // DLIB_IMAGE_PYRaMID_Hh_

