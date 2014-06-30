// Copyright (C) 2012  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#ifndef DLIB_INTERPOlATION__
#define DLIB_INTERPOlATION__ 

#include "interpolation_abstract.h"
#include "../pixel.h"
#include "../matrix.h"
#include "assign_image.h"

namespace dlib
{

// ----------------------------------------------------------------------------------------

    class interpolate_nearest_neighbor
    {
    public:

        template <typename image_type>
        bool operator() (
            const image_type& img,
            const dlib::point& p,
            typename image_type::type& result
        ) const
        {
            if (get_rect(img).contains(p))
            {
                result = img[p.y()][p.x()];
                return true;
            }
            else
            {
                return false;
            }
        }

    };

// ----------------------------------------------------------------------------------------

    class interpolate_bilinear
    {
        template <typename T>
        struct is_rgb_image 
        {
            const static bool value = pixel_traits<typename T::type>::rgb;
        };

    public:

        template <typename T, typename image_type>
        typename disable_if<is_rgb_image<image_type>,bool>::type operator() (
            const image_type& img,
            const dlib::vector<T,2>& p,
            typename image_type::type& result
        ) const
        {
            COMPILE_TIME_ASSERT(pixel_traits<typename image_type::type>::has_alpha == false);

            const long top    = static_cast<long>(std::floor(p.y()));
            const long bottom = static_cast<long>(std::ceil (p.y()));
            const long left   = static_cast<long>(std::floor(p.x()));
            const long right  = static_cast<long>(std::ceil (p.x()));


            // if the interpolation goes outside img 
            if (!get_rect(img).contains(rectangle(left,top,right,bottom))) 
                return false;

            const double lr_frac = p.x() - std::floor(p.x());
            const double tb_frac = p.y() - std::floor(p.y());

            double tl = 0, tr = 0, bl = 0, br = 0;

            assign_pixel(tl, img[top][left]);
            assign_pixel(tr, img[top][right]);
            assign_pixel(bl, img[bottom][left]);
            assign_pixel(br, img[bottom][right]);
            
            double temp = (1-tb_frac)*((1-lr_frac)*tl + lr_frac*tr) + 
                              tb_frac*((1-lr_frac)*bl + lr_frac*br);
                            
            assign_pixel(result, temp);
            return true;
        }

        template <typename T, typename image_type>
        typename enable_if<is_rgb_image<image_type>,bool>::type operator() (
            const image_type& img,
            const dlib::vector<T,2>& p,
            typename image_type::type& result
        ) const
        {
            COMPILE_TIME_ASSERT(pixel_traits<typename image_type::type>::has_alpha == false);

            const long top    = static_cast<long>(std::floor(p.y()));
            const long bottom = static_cast<long>(std::ceil (p.y()));
            const long left   = static_cast<long>(std::floor(p.x()));
            const long right  = static_cast<long>(std::ceil (p.x()));


            // if the interpolation goes outside img 
            if (!get_rect(img).contains(rectangle(left,top,right,bottom))) 
                return false;

            const double lr_frac = p.x() - std::floor(p.x());
            const double tb_frac = p.y() - std::floor(p.y());

            double tl, tr, bl, br;

            tl = img[top][left].red;
            tr = img[top][right].red;
            bl = img[bottom][left].red;
            br = img[bottom][right].red;
            const double red = (1-tb_frac)*((1-lr_frac)*tl + lr_frac*tr) + 
                                   tb_frac*((1-lr_frac)*bl + lr_frac*br);

            tl = img[top][left].green;
            tr = img[top][right].green;
            bl = img[bottom][left].green;
            br = img[bottom][right].green;
            const double green = (1-tb_frac)*((1-lr_frac)*tl + lr_frac*tr) + 
                                   tb_frac*((1-lr_frac)*bl + lr_frac*br);

            tl = img[top][left].blue;
            tr = img[top][right].blue;
            bl = img[bottom][left].blue;
            br = img[bottom][right].blue;
            const double blue = (1-tb_frac)*((1-lr_frac)*tl + lr_frac*tr) + 
                                   tb_frac*((1-lr_frac)*bl + lr_frac*br);
                            
            assign_pixel(result.red, red);
            assign_pixel(result.green, green);
            assign_pixel(result.blue, blue);
            return true;
        }
    };

// ----------------------------------------------------------------------------------------

    class interpolate_quadratic
    {
        template <typename T>
        struct is_rgb_image 
        {
            const static bool value = pixel_traits<typename T::type>::rgb;
        };

    public:

        template <typename T, typename image_type>
        typename disable_if<is_rgb_image<image_type>,bool>::type operator() (
            const image_type& img,
            const dlib::vector<T,2>& p,
            typename image_type::type& result
        ) const
        {
            COMPILE_TIME_ASSERT(pixel_traits<typename image_type::type>::has_alpha == false);

            const point pp(p);

            // if the interpolation goes outside img 
            if (!get_rect(img).contains(grow_rect(pp,1))) 
                return false;

            const long r = pp.y();
            const long c = pp.x();

            const double temp = interpolate(p-pp, 
                                    img[r-1][c-1],
                                    img[r-1][c  ],
                                    img[r-1][c+1],
                                    img[r  ][c-1],
                                    img[r  ][c  ],
                                    img[r  ][c+1],
                                    img[r+1][c-1],
                                    img[r+1][c  ],
                                    img[r+1][c+1]);

            assign_pixel(result, temp);
            return true;
        }

        template <typename T, typename image_type>
        typename enable_if<is_rgb_image<image_type>,bool>::type operator() (
            const image_type& img,
            const dlib::vector<T,2>& p,
            typename image_type::type& result
        ) const
        {
            COMPILE_TIME_ASSERT(pixel_traits<typename image_type::type>::has_alpha == false);

            const point pp(p);

            // if the interpolation goes outside img 
            if (!get_rect(img).contains(grow_rect(pp,1))) 
                return false;

            const long r = pp.y();
            const long c = pp.x();

            const double red = interpolate(p-pp, 
                            img[r-1][c-1].red,
                            img[r-1][c  ].red,
                            img[r-1][c+1].red,
                            img[r  ][c-1].red,
                            img[r  ][c  ].red,
                            img[r  ][c+1].red,
                            img[r+1][c-1].red,
                            img[r+1][c  ].red,
                            img[r+1][c+1].red);
            const double green = interpolate(p-pp, 
                            img[r-1][c-1].green,
                            img[r-1][c  ].green,
                            img[r-1][c+1].green,
                            img[r  ][c-1].green,
                            img[r  ][c  ].green,
                            img[r  ][c+1].green,
                            img[r+1][c-1].green,
                            img[r+1][c  ].green,
                            img[r+1][c+1].green);
            const double blue = interpolate(p-pp, 
                            img[r-1][c-1].blue,
                            img[r-1][c  ].blue,
                            img[r-1][c+1].blue,
                            img[r  ][c-1].blue,
                            img[r  ][c  ].blue,
                            img[r  ][c+1].blue,
                            img[r+1][c-1].blue,
                            img[r+1][c  ].blue,
                            img[r+1][c+1].blue);


            assign_pixel(result.red, red);
            assign_pixel(result.green, green);
            assign_pixel(result.blue, blue);

            return true;
        }

    private:

        /*  tl tm tr
            ml mm mr
            bl bm br
        */
        // The above is the pixel layout in our little 3x3 neighborhood.  interpolate() will 
        // fit a quadratic to these 9 pixels and then use that quadratic to find the interpolated 
        // value at point p.
        inline double interpolate(
            const dlib::vector<double,2>& p,
            double tl, double tm, double tr, 
            double ml, double mm, double mr, 
            double bl, double bm, double br
        ) const
        {
            matrix<double,6,1> w;
            // x
            w(0) = (tr + mr + br - tl - ml - bl)*0.16666666666;
            // y
            w(1) = (bl + bm + br - tl - tm - tr)*0.16666666666;
            // x^2
            w(2) = (tl + tr + ml + mr + bl + br)*0.16666666666 - (tm + mm + bm)*0.333333333;
            // x*y
            w(3) = (tl - tr - bl + br)*0.25;
            // y^2
            w(4) = (tl + tm + tr + bl + bm + br)*0.16666666666 - (ml + mm + mr)*0.333333333;
            // 1 (constant term)
            w(5) = (tm + ml + mr + bm)*0.222222222 - (tl + tr + bl + br)*0.11111111 + (mm)*0.55555556;

            const double x = p.x();
            const double y = p.y();

            matrix<double,6,1> z;
            z = x, y, x*x, x*y, y*y, 1.0;
                            
            return dot(w,z);
        }
    };

// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------

    class black_background
    {
    public:
        template <typename pixel_type>
        void operator() ( pixel_type& p) const { assign_pixel(p, 0); }
    };

    class white_background
    {
    public:
        template <typename pixel_type>
        void operator() ( pixel_type& p) const { assign_pixel(p, 255); }
    };

    class no_background
    {
    public:
        template <typename pixel_type>
        void operator() ( pixel_type& ) const { }
    };

// ----------------------------------------------------------------------------------------

    template <
        typename image_type,
        typename interpolation_type,
        typename point_mapping_type,
        typename background_type
        >
    void transform_image (
        const image_type& in_img,
        image_type& out_img,
        const interpolation_type& interp,
        const point_mapping_type& map_point,
        const background_type& set_background,
        const rectangle& area
    )
    {
        // make sure requires clause is not broken
        DLIB_ASSERT( get_rect(out_img).contains(area) == true &&
                     is_same_object(in_img, out_img) == false ,
            "\t void transform_image()"
            << "\n\t Invalid inputs were given to this function."
            << "\n\t get_rect(out_img).contains(area): " << get_rect(out_img).contains(area)
            << "\n\t get_rect(out_img): " << get_rect(out_img)
            << "\n\t area:              " << area
            << "\n\t is_same_object(in_img, out_img):  " << is_same_object(in_img, out_img)
            );


        for (long r = area.top(); r <= area.bottom(); ++r)
        {
            for (long c = area.left(); c <= area.right(); ++c)
            {
                if (!interp(in_img, map_point(dlib::vector<double,2>(c,r)), out_img[r][c]))
                    set_background(out_img[r][c]);
            }
        }
    }

// ----------------------------------------------------------------------------------------

    template <
        typename image_type,
        typename interpolation_type,
        typename point_mapping_type,
        typename background_type
        >
    void transform_image (
        const image_type& in_img,
        image_type& out_img,
        const interpolation_type& interp,
        const point_mapping_type& map_point,
        const background_type& set_background
    )
    {
        // make sure requires clause is not broken
        DLIB_ASSERT( is_same_object(in_img, out_img) == false ,
            "\t void transform_image()"
            << "\n\t Invalid inputs were given to this function."
            << "\n\t is_same_object(in_img, out_img):  " << is_same_object(in_img, out_img)
            );

        transform_image(in_img, out_img, interp, map_point, set_background, get_rect(out_img));
    }

// ----------------------------------------------------------------------------------------

    template <
        typename image_type,
        typename interpolation_type,
        typename point_mapping_type
        >
    void transform_image (
        const image_type& in_img,
        image_type& out_img,
        const interpolation_type& interp,
        const point_mapping_type& map_point
    )
    {
        // make sure requires clause is not broken
        DLIB_ASSERT( is_same_object(in_img, out_img) == false ,
            "\t void transform_image()"
            << "\n\t Invalid inputs were given to this function."
            << "\n\t is_same_object(in_img, out_img):  " << is_same_object(in_img, out_img)
            );


        transform_image(in_img, out_img, interp, map_point, black_background(), get_rect(out_img));
    }

// ----------------------------------------------------------------------------------------

    template <
        typename image_type,
        typename interpolation_type
        >
    void rotate_image (
        const image_type& in_img,
        image_type& out_img,
        double angle,
        const interpolation_type& interp
    )
    {
        // make sure requires clause is not broken
        DLIB_ASSERT( is_same_object(in_img, out_img) == false ,
            "\t void rotate_image()"
            << "\n\t Invalid inputs were given to this function."
            << "\n\t is_same_object(in_img, out_img):  " << is_same_object(in_img, out_img)
            );

        const rectangle rimg = get_rect(in_img);


        // figure out bounding box for rotated rectangle
        rectangle rect;
        rect += rotate_point(center(rimg), rimg.tl_corner(), -angle);
        rect += rotate_point(center(rimg), rimg.tr_corner(), -angle);
        rect += rotate_point(center(rimg), rimg.bl_corner(), -angle);
        rect += rotate_point(center(rimg), rimg.br_corner(), -angle);
        out_img.set_size(rect.height(), rect.width());

        const matrix<double,2,2> R = rotation_matrix(angle);

        transform_image(in_img, out_img, interp, 
                        point_transform_affine(R, -R*dcenter(get_rect(out_img)) + dcenter(rimg)));
    }

// ----------------------------------------------------------------------------------------

    template <
        typename image_type
        >
    void rotate_image (
        const image_type& in_img,
        image_type& out_img,
        double angle
    )
    {
        // make sure requires clause is not broken
        DLIB_ASSERT( is_same_object(in_img, out_img) == false ,
            "\t void rotate_image()"
            << "\n\t Invalid inputs were given to this function."
            << "\n\t is_same_object(in_img, out_img):  " << is_same_object(in_img, out_img)
            );

        rotate_image(in_img, out_img, angle, interpolate_quadratic());
    }

// ----------------------------------------------------------------------------------------

    namespace impl
    {
        class helper_resize_image 
        {
        public:
            helper_resize_image(
                double x_scale_,
                double y_scale_
            ):
                x_scale(x_scale_),
                y_scale(y_scale_)
            {}

            dlib::vector<double,2> operator() (
                const dlib::vector<double,2>& p
            ) const
            {
                return dlib::vector<double,2>(p.x()*x_scale, p.y()*y_scale);
            }

        private:
            const double x_scale;
            const double y_scale;
        };
    }

    template <
        typename image_type,
        typename interpolation_type
        >
    void resize_image (
        const image_type& in_img,
        image_type& out_img,
        const interpolation_type& interp
    )
    {
        // make sure requires clause is not broken
        DLIB_ASSERT( is_same_object(in_img, out_img) == false ,
            "\t void resize_image()"
            << "\n\t Invalid inputs were given to this function."
            << "\n\t is_same_object(in_img, out_img):  " << is_same_object(in_img, out_img)
            );

        const double x_scale = (in_img.nc()-1)/(double)std::max<long>((out_img.nc()-1),1);
        const double y_scale = (in_img.nr()-1)/(double)std::max<long>((out_img.nr()-1),1);
        transform_image(in_img, out_img, interp, 
                        dlib::impl::helper_resize_image(x_scale,y_scale));
    }

// ----------------------------------------------------------------------------------------

    template <
        typename image_type
        >
    void resize_image (
        const image_type& in_img,
        image_type& out_img
    )
    {
        // make sure requires clause is not broken
        DLIB_ASSERT( is_same_object(in_img, out_img) == false ,
            "\t void resize_image()"
            << "\n\t Invalid inputs were given to this function."
            << "\n\t is_same_object(in_img, out_img):  " << is_same_object(in_img, out_img)
            );

        resize_image(in_img, out_img, interpolate_quadratic());
    }

// ----------------------------------------------------------------------------------------

    template <
        typename image_type
        >
    void flip_image_left_right (
        const image_type& in_img,
        image_type& out_img
    )
    {
        // make sure requires clause is not broken
        DLIB_ASSERT( is_same_object(in_img, out_img) == false ,
            "\t void rotate_image()"
            << "\n\t Invalid inputs were given to this function."
            << "\n\t is_same_object(in_img, out_img):  " << is_same_object(in_img, out_img)
            );

        assign_image(out_img, fliplr(array_to_matrix(in_img)));
    }

// ----------------------------------------------------------------------------------------

    template <
        typename image_type
        >
    void flip_image_up_down (
        const image_type& in_img,
        image_type& out_img
    )
    {
        // make sure requires clause is not broken
        DLIB_ASSERT( is_same_object(in_img, out_img) == false ,
            "\t void rotate_image()"
            << "\n\t Invalid inputs were given to this function."
            << "\n\t is_same_object(in_img, out_img):  " << is_same_object(in_img, out_img)
            );

        assign_image(out_img, flipud(array_to_matrix(in_img)));
    }

// ----------------------------------------------------------------------------------------

    namespace impl
    {
        class helper_pyramid_up 
        {
        public:
            helper_pyramid_up(
                double x_scale_,
                double y_scale_,
                const dlib::vector<double,2> offset_
            ):
                x_scale(x_scale_),
                y_scale(y_scale_),
                offset(offset_)
            {}

            dlib::vector<double,2> operator() (
                const dlib::vector<double,2>& p
            ) const
            {
                return dlib::vector<double,2>((p.x()-offset.x())*x_scale, 
                                              (p.y()-offset.y())*y_scale);
            }

        private:
            const double x_scale;
            const double y_scale;
            const dlib::vector<double,2> offset;
        };
    }

    template <
        typename image_type,
        typename pyramid_type,
        typename interpolation_type
        >
    void pyramid_up (
        const image_type& in_img,
        image_type& out_img,
        const pyramid_type& pyr,
        unsigned int levels,
        const interpolation_type& interp
    )
    {
        // make sure requires clause is not broken
        DLIB_ASSERT( is_same_object(in_img, out_img) == false ,
            "\t void pyramid_up()"
            << "\n\t Invalid inputs were given to this function."
            << "\n\t is_same_object(in_img, out_img):  " << is_same_object(in_img, out_img)
            );

        if (in_img.size() == 0)
        {
            out_img.clear();
            return;
        }

        if (levels == 0)
        {
            assign_image(out_img, in_img);
            return;
        }

        rectangle rect = get_rect(in_img);
        rectangle uprect = pyr.rect_up(rect,levels);
        if (uprect.is_empty())
        {
            out_img.clear();
            return;
        }
        out_img.set_size(uprect.bottom()+1, uprect.right()+1);

        const double x_scale = (rect.width() -1)/(double)std::max<long>(1,(uprect.width() -1));
        const double y_scale = (rect.height()-1)/(double)std::max<long>(1,(uprect.height()-1));
        transform_image(in_img, out_img, interp, 
                        dlib::impl::helper_pyramid_up(x_scale,y_scale,  uprect.tl_corner()));

    }

// ----------------------------------------------------------------------------------------

    template <
        typename image_type,
        typename pyramid_type
        >
    void pyramid_up (
        const image_type& in_img,
        image_type& out_img,
        const pyramid_type& pyr,
        unsigned int levels = 1
    )
    {
        // make sure requires clause is not broken
        DLIB_ASSERT( is_same_object(in_img, out_img) == false ,
            "\t void pyramid_up()"
            << "\n\t Invalid inputs were given to this function."
            << "\n\t is_same_object(in_img, out_img):  " << is_same_object(in_img, out_img)
            );

        pyramid_up(in_img, out_img, pyr, levels, interpolate_quadratic());
    }

// ----------------------------------------------------------------------------------------

}

#endif // DLIB_INTERPOlATION__

