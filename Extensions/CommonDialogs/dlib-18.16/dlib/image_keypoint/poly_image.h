// Copyright (C) 2011  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#ifndef DLIB_POLY_ImAGE_Hh_
#define DLIB_POLY_ImAGE_Hh_

#include "poly_image_abstract.h"
#include "build_separable_poly_filters.h"
#include "../algs.h"
#include "../matrix.h"
#include "../array2d.h"
#include "../geometry.h"
#include <cmath>

namespace dlib
{

// ----------------------------------------------------------------------------------------

    template <
        long Downsample
        >
    class poly_image : noncopyable
    {
        COMPILE_TIME_ASSERT(Downsample >= 1);
    public:
        const static long downsample = Downsample;
        typedef matrix<double, 0, 1> descriptor_type;

        poly_image(
            long order_,
            long window_size_,
            bool normalization = true,
            bool rotation_invariance_ = false
        )
        {
            setup(order_, window_size_);
            set_uses_normalization(normalization);
            set_is_rotationally_invariant(rotation_invariance_);
        }

        poly_image (
        ) 
        {
            clear();
        }

        void clear (
        )
        {
            normalize = true;
            rotation_invariance = false;
            poly_coef.clear();
            order = 3;
            window_size = 13;
            border_size = (long)std::ceil(std::floor(window_size/2.0)/downsample);
            num_rows = 0;
            num_cols = 0;
            filters = build_separable_poly_filters(order, window_size);
        }

        long get_order (
        ) const
        {
            return order;
        }

        long get_window_size (
        ) const
        {
            return window_size;
        }

        void setup (
            long order_,
            long window_size_
        )
        {
            // make sure requires clause is not broken
            DLIB_ASSERT(1 <= order_ && order_ <= 6 &&
                        window_size_ >= 3 && (window_size_%2) == 1,
                "\t descriptor_type poly_image::setup()"
                << "\n\t Invalid arguments were given to this function."
                << "\n\t order_:       " << order_ 
                << "\n\t window_size_: " << window_size_ 
                << "\n\t this: " << this
                );


            poly_coef.clear();
            order = order_;
            window_size = window_size_;
            border_size = (long)std::ceil(std::floor(window_size/2.0)/downsample);
            num_rows = 0;
            num_cols = 0;
            filters = build_separable_poly_filters(order, window_size);
        }

        bool uses_normalization (
        ) const { return normalize; }

        void set_uses_normalization (
            bool normalization
        )
        {
            normalize = normalization;
        }

        bool is_rotationally_invariant (
        ) const { return rotation_invariance; }

        void set_is_rotationally_invariant (
            bool rotation_invariance_
        )
        {
            rotation_invariance = rotation_invariance_;
        }

        void copy_configuration (
            const poly_image& item
        )
        {
            normalize = item.normalize;
            rotation_invariance = item.rotation_invariance;
            if (order != item.order || 
                window_size != item.window_size)
            {
                order = item.order;
                window_size = item.window_size;
                border_size = item.border_size;
                filters = item.filters;
            }
        }

        template <
            typename image_type
            >
        inline void load (
            const image_type& img
        )
        {
            COMPILE_TIME_ASSERT( pixel_traits<typename image_traits<image_type>::pixel_type>::has_alpha == false );

            poly_coef.resize(get_num_dimensions());
            des.set_size(get_num_dimensions());


            if (normalize)
            {
                array2d<float> coef0;
                rectangle rect = filter_image(img, coef0, filters[0]);
                num_rows = rect.height();
                num_cols = rect.width();

                for (unsigned long i = 1; i < filters.size(); ++i)
                {
                    filter_image(img, poly_coef[i-1], filters[i]);

                    // intensity normalize everything
                    for (long r = 0; r < coef0.nr(); ++r)
                    {
                        for (long c = 0; c < coef0.nc(); ++c)
                        {
                            if (coef0[r][c] >= 1)
                                poly_coef[i-1][r][c] /= coef0[r][c];
                            else
                                poly_coef[i-1][r][c] = 0;
                        }
                    }
                }

                if (rotation_invariance)
                    rotate_polys(rect);
            }
            else
            {
                rectangle rect;
                for (unsigned long i = 0; i < filters.size(); ++i)
                {
                    rect = filter_image(img, poly_coef[i], filters[i]);
                }
                num_rows = rect.height();
                num_cols = rect.width();

                if (rotation_invariance)
                    rotate_polys(rect);
            }
        }

        void unload()
        {
            poly_coef.clear();
            num_rows = 0;
            num_cols = 0;
        }

        inline unsigned long size (
        ) const { return static_cast<unsigned long>(nr()*nc()); }

        inline long nr (
        ) const { return num_rows; }

        inline long nc (
        ) const { return num_cols; }

        long get_num_dimensions (
        ) const
        {
            if (normalize)
            {
                // -1 because we discard the constant term of the polynomial.
                return filters.size()-1;
            }
            else
            {
                return filters.size();
            }
        }

        inline const descriptor_type& operator() (
            long row,
            long col
        ) const
        {
            // make sure requires clause is not broken
            DLIB_ASSERT( 0 <= row && row < nr() &&
                         0 <= col && col < nc(),
                "\t descriptor_type poly_image::operator()()"
                << "\n\t invalid row or col argument"
                << "\n\t row:  " << row
                << "\n\t col:  " << col 
                << "\n\t nr(): " << nr() 
                << "\n\t nc(): " << nc() 
                << "\n\t this: " << this
                );

            // add because of the zero border around the poly_coef images
            row += border_size;
            col += border_size;

            for (long i = 0; i < des.size(); ++i)
                des(i) = poly_coef[i][row][col];

            return des;
        }

        const rectangle get_block_rect (
            long row,
            long col
        ) const
        {
            return centered_rect(Downsample*point(col+border_size, row+border_size), 
                                 window_size, window_size);
        }

        const point image_to_feat_space (
            const point& p
        ) const
        {
            return p/Downsample - point(border_size, border_size);
        }

        const rectangle image_to_feat_space (
            const rectangle& rect
        ) const
        {
            return rectangle(image_to_feat_space(rect.tl_corner()), image_to_feat_space(rect.br_corner()));
        }

        const point feat_to_image_space (
            const point& p
        ) const
        {
            return (p + point(border_size, border_size))*Downsample;
        }

        const rectangle feat_to_image_space (
            const rectangle& rect
        ) const
        {
            return rectangle(feat_to_image_space(rect.tl_corner()), feat_to_image_space(rect.br_corner()));
        }



        friend void serialize (const poly_image& item, std::ostream& out) 
        {
            int version = 1;
            serialize(version, out);
            serialize(item.poly_coef, out);
            serialize(item.order, out);
            serialize(item.window_size, out);
            serialize(item.border_size, out);
            serialize(item.num_rows, out);
            serialize(item.num_cols, out);
            serialize(item.normalize, out);
            serialize(item.rotation_invariance, out);
            serialize(item.filters, out);
        }

        friend void deserialize (poly_image& item, std::istream& in )
        {
            int version = 0;
            deserialize(version, in);
            if (version != 1)
                throw dlib::serialization_error("Unexpected version found while deserializing dlib::poly_image");

            deserialize(item.poly_coef, in);
            deserialize(item.order, in);
            deserialize(item.window_size, in);
            deserialize(item.border_size, in);
            deserialize(item.num_rows, in);
            deserialize(item.num_cols, in);
            deserialize(item.normalize, in);
            deserialize(item.rotation_invariance, in);
            deserialize(item.filters, in);
        }

    private:

        matrix<float,2,1> rotate_order_1 (
            const matrix<float,2,1>& w,
            double cos_theta,
            double sin_theta
        ) const
        {
            const double w1 = w(0);
            const double w2 = w(1);
            matrix<double,2,2> M;
            M = w1,  w2,
                w2, -w1;

            matrix<double,2,1> x;
            x = cos_theta, 
                sin_theta;

            return matrix_cast<float>(M*x);
        }

        matrix<float,3,1> rotate_order_2 (
            const matrix<float,3,1>& w,
            double cos_theta,
            double sin_theta
        ) const
        {
            const double w1 = w(0);
            const double w2 = w(1);
            const double w3 = w(2);
            matrix<double,3,3> M;
            M = w1, w2,           w3,
                w2, (2*w3-2*w1), -w2,
                w3, -w2,          w1;

            matrix<double,3,1> x;
            x = std::pow(cos_theta,2.0), 
                cos_theta*sin_theta,
                std::pow(sin_theta,2.0);

            return matrix_cast<float>(M*x);
        }

        matrix<float,4,1> rotate_order_3 (
            const matrix<float,4,1>& w,
            double cos_theta,
            double sin_theta
        ) const
        {
            const double w1 = w(0);
            const double w2 = w(1);
            const double w3 = w(2);
            const double w4 = w(3);
            matrix<double,4,4> M;
            M = w1, w2,            w3,           w4,
                w2, (2*w3-3*w1), (3*w4-2*w2),   -w3,
                w3, (3*w4-2*w2), (3*w1-2*w3),    w2,
                w4, -w3,           w2,          -w1;

            matrix<double,4,1> x;
            x = std::pow(cos_theta,3.0), 
                std::pow(cos_theta,2.0)*sin_theta,
                cos_theta*std::pow(sin_theta,2.0),
                std::pow(sin_theta,3.0);

            return matrix_cast<float>(M*x);
        }

        matrix<float,5,1> rotate_order_4 (
            const matrix<float,5,1>& w,
            double cos_theta,
            double sin_theta
        ) const
        {
            const double w1 = w(0);
            const double w2 = w(1);
            const double w3 = w(2);
            const double w4 = w(3);
            const double w5 = w(4);
            matrix<double,5,5> M;
            M = w1, w2,              w3,            w4,          w5,
                w2, (2*w3-4*w1), (3*w4-3*w2),      (4*w5-2*w3), -w4,
                w3, (3*w4-3*w2), (6*w1-4*w3+6*w5), (3*w2-3*w4),  w3,
                w4, (4*w5-2*w3), (3*w2-3*w4),      (2*w3-4*w1), -w2,
                w5, -w4,            w3,            -w2,          w1;

            matrix<double,5,1> x;
            x = std::pow(cos_theta,4.0), 
                std::pow(cos_theta,3.0)*sin_theta,
                std::pow(cos_theta,2.0)*std::pow(sin_theta,2.0),
                cos_theta*std::pow(sin_theta,3.0),
                std::pow(sin_theta,4.0);

            return matrix_cast<float>(M*x);
        }

        matrix<float,6,1> rotate_order_5 (
            const matrix<float,6,1>& w,
            double cos_theta,
            double sin_theta
        ) const
        {
            const double w1 = w(0);
            const double w2 = w(1);
            const double w3 = w(2);
            const double w4 = w(3);
            const double w5 = w(4);
            const double w6 = w(5);
            matrix<double,6,6> M;
            M = w1,     w2,          w3,             w4,                 w5,          w6,
                w2, (2*w3-5*w1), (3*w4-4*w2),       (4*w5-3*w3),        (5*w6-2*w4), -w5,
                w3, (3*w4-4*w2), (10*w1-6*w3+6*w5), (6*w2-6*w4+10*w6),  (3*w3-4*w5),  w4,
                w4, (4*w5-3*w3), (6*w2-6*w4+10*w6), (-10*w1+6*w3-6*w5), (3*w4-4*w2), -w3,
                w5, (5*w6-2*w4), (3*w3-4*w5),       (3*w4-4*w2),        (5*w1-2*w3),  w2,
                w6,    -w5,          w4,            -w3,                 w2,         -w1;

            matrix<double,6,1> x;
            x = std::pow(cos_theta,5.0), 
                std::pow(cos_theta,4.0)*sin_theta,
                std::pow(cos_theta,3.0)*std::pow(sin_theta,2.0),
                std::pow(cos_theta,2.0)*std::pow(sin_theta,3.0),
                cos_theta*std::pow(sin_theta,4.0),
                std::pow(sin_theta,5.0);

            return matrix_cast<float>(M*x);
        }

        matrix<float,7,1> rotate_order_6 (
            const matrix<float,7,1>& w,
            double cos_theta,
            double sin_theta
        ) const
        {
            const double w1 = w(0);
            const double w2 = w(1);
            const double w3 = w(2);
            const double w4 = w(3);
            const double w5 = w(4);
            const double w6 = w(5);
            const double w7 = w(6);
            matrix<double,7,7> M;
            M = w1,     w2,          w3,              w4,                           w5,                 w6,         w7,
                w2, (2*w3-6*w1), (3*w4-5*w2),        (4*w5-4*w3),                (5*w6-3*w4),         (6*w7-2*w5), -w6,
                w3, (3*w4-5*w2), (15*w1-8*w3+ 6*w5), ( 10*w2 -9*w4+10*w6),       (  6*w3-8*w5+15*w7), (3*w4-5*w6),  w5,
                w4, (4*w5-4*w3), (10*w2-9*w4+10*w6), (-20*w1+12*w3-12*w5+20*w7), (-10*w2+9*w4-10*w6), (4*w5-4*w3), -w4,
                w5, (5*w6-3*w4), ( 6*w3-8*w5+15*w7), (-10*w2 +9*w4-10*w6),       ( 15*w1-8*w3 +6*w5), (5*w2-3*w4),  w3,
                w6, (6*w7-2*w5), (3*w4-5*w6),        (4*w5-4*w3),                (5*w2-3*w4),         (2*w3-6*w1), -w2,
                w7,     -w6,          w5,            -w4,                          w3,                 -w2,         w1;

            matrix<double,7,1> x;
            x = std::pow(cos_theta,6.0), 
                std::pow(cos_theta,5.0)*sin_theta,
                std::pow(cos_theta,4.0)*std::pow(sin_theta,2.0),
                std::pow(cos_theta,3.0)*std::pow(sin_theta,3.0),
                std::pow(cos_theta,2.0)*std::pow(sin_theta,4.0),
                cos_theta*std::pow(sin_theta,5.0),
                std::pow(sin_theta,6.0);

            return matrix_cast<float>(M*x);
        }

        void rotate_polys (
            const rectangle& rect
        )
        /*!
            ensures
                - rotates all the polynomials in poly_coef so that they are
                  rotationally invariant
        !*/
        {
            // The idea here is to use a rotation matrix to rotate the 
            // coordinate system for the polynomial so that the x axis
            // always lines up with the gradient vector (or direction of
            // max curvature).  This way we can make the representation 
            // rotation invariant.

            // Note that the rotation matrix is given by:
            // [ cos_theta -sin_theta ]
            // [ sin_theta cos_theta  ]

            // need to offset poly_coef to get past the constant term if there isn't any normalization.
            const int off = (normalize) ? 0 : 1;

            for (long r = rect.top(); r <= rect.bottom(); ++r)
            {
                for (long c = rect.left(); c <= rect.right(); ++c)
                {
                    dlib::vector<double,2> g(poly_coef[off+0][r][c],
                                             poly_coef[off+1][r][c]);

                    const double len = g.length();
                    if (len != 0)
                    {
                        g /= len;
                    }
                    else
                    {
                        g.x() = 1;
                        g.y() = 0;
                    }
                    // since we normalized g we can find the sin/cos of its angle easily. 
                    const double cos_theta = g.x();
                    const double sin_theta = g.y();

                    if (order >= 1)
                    {
                        matrix<float,2,1> w;
                        w = poly_coef[off+0][r][c],
                            poly_coef[off+1][r][c];
                        w = rotate_order_1(w, cos_theta, sin_theta);
                        poly_coef[off+0][r][c] = w(0);
                        poly_coef[off+1][r][c] = w(1);
                    }
                    if (order >= 2)
                    {
                        matrix<float,3,1> w;
                        w = poly_coef[off+2][r][c],
                            poly_coef[off+3][r][c],
                            poly_coef[off+4][r][c];
                        w = rotate_order_2(w, cos_theta, sin_theta);
                        poly_coef[off+2][r][c] = w(0);
                        poly_coef[off+3][r][c] = w(1);
                        poly_coef[off+4][r][c] = w(2);
                    }
                    if (order >= 3)
                    {
                        matrix<float,4,1> w;
                        w = poly_coef[off+5][r][c],
                            poly_coef[off+6][r][c],
                            poly_coef[off+7][r][c],
                            poly_coef[off+8][r][c];
                        w = rotate_order_3(w, cos_theta, sin_theta);
                        poly_coef[off+5][r][c] = w(0);
                        poly_coef[off+6][r][c] = w(1);
                        poly_coef[off+7][r][c] = w(2);
                        poly_coef[off+8][r][c] = w(3);
                    }
                    if (order >= 4)
                    {
                        matrix<float,5,1> w;
                        w = poly_coef[off+9][r][c],
                            poly_coef[off+10][r][c],
                            poly_coef[off+11][r][c],
                            poly_coef[off+12][r][c],
                            poly_coef[off+13][r][c];
                        w = rotate_order_4(w, cos_theta, sin_theta);
                        poly_coef[off+9][r][c]  = w(0);
                        poly_coef[off+10][r][c] = w(1);
                        poly_coef[off+11][r][c] = w(2);
                        poly_coef[off+12][r][c] = w(3);
                        poly_coef[off+13][r][c] = w(4);
                    }
                    if (order >= 5)
                    {
                        matrix<float,6,1> w;
                        w = poly_coef[off+14][r][c],
                            poly_coef[off+15][r][c],
                            poly_coef[off+16][r][c],
                            poly_coef[off+17][r][c],
                            poly_coef[off+18][r][c],
                            poly_coef[off+19][r][c];
                        w = rotate_order_5(w, cos_theta, sin_theta);
                        poly_coef[off+14][r][c] = w(0);
                        poly_coef[off+15][r][c] = w(1);
                        poly_coef[off+16][r][c] = w(2);
                        poly_coef[off+17][r][c] = w(3);
                        poly_coef[off+18][r][c] = w(4);
                        poly_coef[off+19][r][c] = w(5);
                    }
                    if (order >= 6)
                    {
                        matrix<float,7,1> w;
                        w = poly_coef[off+20][r][c],
                            poly_coef[off+21][r][c],
                            poly_coef[off+22][r][c],
                            poly_coef[off+23][r][c],
                            poly_coef[off+24][r][c],
                            poly_coef[off+25][r][c],
                            poly_coef[off+26][r][c];
                        w = rotate_order_6(w, cos_theta, sin_theta);
                        poly_coef[off+20][r][c] = w(0);
                        poly_coef[off+21][r][c] = w(1);
                        poly_coef[off+22][r][c] = w(2);
                        poly_coef[off+23][r][c] = w(3);
                        poly_coef[off+24][r][c] = w(4);
                        poly_coef[off+25][r][c] = w(5);
                        poly_coef[off+26][r][c] = w(6);
                    }
                }
            }

        }

        template <typename image_type>
        rectangle filter_image (
            const image_type& img,
            array2d<float>& out,
            const std::vector<separable_filter_type>& filter
        ) const
        {
            rectangle rect = spatially_filter_image_separable_down(downsample, img, out, filter[0].first, filter[0].second);
            for (unsigned long i = 1; i < filter.size(); ++i)
            {
                spatially_filter_image_separable_down(downsample, img, out, filter[i].first, filter[i].second, 1, false, true);
            }
            return rect;
        }



        std::vector<std::vector<separable_filter_type> > filters;

        dlib::array<array2d<float> > poly_coef;
        long order;
        long window_size;
        long border_size;
        long num_rows;
        long num_cols;

        bool normalize;
        bool rotation_invariance;

        mutable descriptor_type des;
    };

// ----------------------------------------------------------------------------------------

}

#endif // DLIB_POLY_ImAGE_Hh_


