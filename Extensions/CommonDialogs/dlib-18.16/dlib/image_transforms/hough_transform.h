// Copyright (C) 2014  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#ifndef DLIB_HOUGH_tRANSFORM_Hh_
#define DLIB_HOUGH_tRANSFORM_Hh_

#include "hough_transform_abstract.h"
#include "../image_processing/generic_image.h"
#include "../geometry.h"
#include "../algs.h"
#include "assign_image.h"
#include <limits>

namespace dlib
{

// ----------------------------------------------------------------------------------------

    class hough_transform
    {

    public:
        explicit hough_transform (
            unsigned long size_
        ) : _size(size_) 
        {
            DLIB_CASSERT(size_ > 0,
                "\t hough_transform::hough_transform(size_)"
                << "\n\t Invalid arguments given to this function."
                );

            even_size = _size - (_size%2);

            const point cent = center(rectangle(0,0,size_-1,size_-1));
            xcos_theta.set_size(size_, size_);
            ysin_theta.set_size(size_, size_);

            std::vector<double> cos_theta(size_), sin_theta(size_);
            const double scale = 1<<16;
            for (unsigned long t = 0; t < size_; ++t)
            {
                double theta = t*pi/even_size;

                cos_theta[t] = scale*std::cos(theta)/sqrt_2;
                sin_theta[t] = scale*std::sin(theta)/sqrt_2;
            }
            const double offset = scale*even_size/4.0 + 0.5;

            for (unsigned long c = 0; c < size_; ++c)
            {
                const long x = c - cent.x();
                for (unsigned long t = 0; t < size_; ++t)
                    xcos_theta(c,t) = static_cast<int32>(x*cos_theta[t] + offset);
            }
            for (unsigned long r = 0; r < size_; ++r)
            {
                const long y = r - cent.y();
                for (unsigned long t = 0; t < size_; ++t)
                    ysin_theta(r,t) = static_cast<int32>(y*sin_theta[t] + offset);
            }
        }

        unsigned long size(
        ) const { return _size; }

        long nr(
        ) const { return _size; }

        long nc(
        ) const { return _size; }

        std::pair<point, point> get_line (
            const point& p
        ) const
        {
            DLIB_ASSERT(rectangle(0,0,size()-1,size()-1).contains(p) == true,
                "\t pair<point,point> hough_transform::get_line(point)"
                << "\n\t Invalid arguments given to this function."
                << "\n\t p:      " << p 
                << "\n\t size(): " << size()
                );

            // First we compute the radius measured in pixels from the center and the theta
            // angle in radians.
            typedef dlib::vector<double,2> vect;
            const rectangle box(0,0,size()-1,size()-1);
            const vect cent = center(box);
            double theta = p.x()-cent.x();
            double radius = p.y()-cent.y();
            theta = theta*pi/even_size;
            radius = radius*sqrt_2 + 0.5;

            // now make a line segment on the line.
            vect v1 = cent + vect(size()+1000,0) + vect(0,radius);
            vect v2 = cent - vect(size()+1000,0) + vect(0,radius);
            point p1 = rotate_point(cent, v1, theta);
            point p2 = rotate_point(cent, v2, theta);

            clip_line_to_rectangle(box, p1, p2);

            return std::make_pair(p1,p2);
        }

        template <
            typename image_type
            >
        point get_best_hough_point (
            const point& p,
            const image_type& himg_
        )
        {
            const const_image_view<image_type> himg(himg_);

            DLIB_ASSERT(himg.nr() == size() && himg.nc() == size() &&
                rectangle(0,0,size()-1,size()-1).contains(p) == true,
                "\t point hough_transform::get_best_hough_point()"
                << "\n\t Invalid arguments given to this function."
                << "\n\t himg.nr(): " << himg.nr()
                << "\n\t himg.nc(): " << himg.nc()
                << "\n\t size():    " << size()
                << "\n\t p:         " << p 
                );


            typedef typename image_traits<image_type>::pixel_type pixel_type;
            COMPILE_TIME_ASSERT(pixel_traits<pixel_type>::grayscale == true);
            pixel_type best_val = std::numeric_limits<pixel_type>::min();
            point best_point;


            const long max_n8 = (himg.nc()/8)*8;
            const long max_n4 = (himg.nc()/4)*4;
            const long r = p.y();
            const long c = p.x();

            const int32* ysin = &ysin_theta(r,0);
            const int32* xcos = &xcos_theta(c,0);
            long t = 0;
            while(t < max_n8)
            {
                long rr0 = (*xcos++ + *ysin++)>>16;
                long rr1 = (*xcos++ + *ysin++)>>16;
                long rr2 = (*xcos++ + *ysin++)>>16;
                long rr3 = (*xcos++ + *ysin++)>>16;
                long rr4 = (*xcos++ + *ysin++)>>16;
                long rr5 = (*xcos++ + *ysin++)>>16;
                long rr6 = (*xcos++ + *ysin++)>>16;
                long rr7 = (*xcos++ + *ysin++)>>16;

                if (himg[rr0][t++] > best_val)
                {
                    best_val = himg[rr0][t-1];
                    best_point.x() = t-1;
                    best_point.y() = rr0;
                }
                if (himg[rr1][t++] > best_val)
                {
                    best_val = himg[rr1][t-1];
                    best_point.x() = t-1;
                    best_point.y() = rr1;
                }
                if (himg[rr2][t++] > best_val)
                {
                    best_val = himg[rr2][t-1];
                    best_point.x() = t-1;
                    best_point.y() = rr2;
                }
                if (himg[rr3][t++] > best_val)
                {
                    best_val = himg[rr3][t-1];
                    best_point.x() = t-1;
                    best_point.y() = rr3;
                }
                if (himg[rr4][t++] > best_val)
                {
                    best_val = himg[rr4][t-1];
                    best_point.x() = t-1;
                    best_point.y() = rr4;
                }
                if (himg[rr5][t++] > best_val)
                {
                    best_val = himg[rr5][t-1];
                    best_point.x() = t-1;
                    best_point.y() = rr5;
                }
                if (himg[rr6][t++] > best_val)
                {
                    best_val = himg[rr6][t-1];
                    best_point.x() = t-1;
                    best_point.y() = rr6;
                }
                if (himg[rr7][t++] > best_val)
                {
                    best_val = himg[rr7][t-1];
                    best_point.x() = t-1;
                    best_point.y() = rr7;
                }
            }
            while(t < max_n4)
            {
                long rr0 = (*xcos++ + *ysin++)>>16;
                long rr1 = (*xcos++ + *ysin++)>>16;
                long rr2 = (*xcos++ + *ysin++)>>16;
                long rr3 = (*xcos++ + *ysin++)>>16;
                if (himg[rr0][t++] > best_val)
                {
                    best_val = himg[rr0][t-1];
                    best_point.x() = t-1;
                    best_point.y() = rr0;
                }
                if (himg[rr1][t++] > best_val)
                {
                    best_val = himg[rr1][t-1];
                    best_point.x() = t-1;
                    best_point.y() = rr1;
                }
                if (himg[rr2][t++] > best_val)
                {
                    best_val = himg[rr2][t-1];
                    best_point.x() = t-1;
                    best_point.y() = rr2;
                }
                if (himg[rr3][t++] > best_val)
                {
                    best_val = himg[rr3][t-1];
                    best_point.x() = t-1;
                    best_point.y() = rr3;
                }
            }
            while(t < himg.nc())
            {
                long rr0 = (*xcos++ + *ysin++)>>16;
                if (himg[rr0][t++] > best_val)
                {
                    best_val = himg[rr0][t-1];
                    best_point.x() = t-1;
                    best_point.y() = rr0;
                }
            }

            return best_point;
        }

        template <
            typename in_image_type,
            typename out_image_type
            >
        void operator() (
            const in_image_type& img_,
            const rectangle& box,
            out_image_type& himg_
        ) const
        {
            typedef typename image_traits<in_image_type>::pixel_type in_pixel_type;
            typedef typename image_traits<out_image_type>::pixel_type out_pixel_type;

            DLIB_CASSERT(box.width() == size() && box.height() == size(),
                "\t hough_transform::hough_transform(size_)"
                << "\n\t Invalid arguments given to this function."
                << "\n\t box.width():  " << box.width()
                << "\n\t box.height(): " << box.height()
                << "\n\t size():       " << size()
                );

            COMPILE_TIME_ASSERT(pixel_traits<in_pixel_type>::grayscale == true);
            COMPILE_TIME_ASSERT(pixel_traits<out_pixel_type>::grayscale == true);

            const_image_view<in_image_type> img(img_);
            image_view<out_image_type> himg(himg_);

            himg.set_size(size(), size());
            assign_all_pixels(himg, 0);

            const rectangle area = box.intersect(get_rect(img));

            const long max_n8 = (himg.nc()/8)*8;
            const long max_n4 = (himg.nc()/4)*4;
            for (long r = area.top(); r <= area.bottom(); ++r)
            {
                const int32* ysin_base = &ysin_theta(r-box.top(),0);
                for (long c = area.left(); c <= area.right(); ++c)
                {
                    const out_pixel_type val = static_cast<out_pixel_type>(img[r][c]);
                    if (val != 0)
                    {
                        /*
                        // The code in this comment is equivalent to the more complex but
                        // faster code below.  We keep this simple version of the Hough
                        // transform implementation here just to document what it's doing
                        // more clearly.
                        const point cent = center(box);
                        const long x = c - cent.x();
                        const long y = r - cent.y();
                        for (long t = 0; t < himg.nc(); ++t)
                        {
                            double theta = t*pi/even_size;
                            double radius = (x*std::cos(theta) + y*std::sin(theta))/sqrt_2 + even_size/2 + 0.5;
                            long rr = static_cast<long>(radius);
                            himg[rr][t] += val;
                        }
                        continue;
                        */

                        // Run the speed optimized version of the code in the above
                        // comment.
                        const int32* ysin = ysin_base;
                        const int32* xcos = &xcos_theta(c-box.left(),0);
                        long t = 0;
                        while(t < max_n8)
                        {
                            long rr0 = (*xcos++ + *ysin++)>>16;
                            long rr1 = (*xcos++ + *ysin++)>>16;
                            long rr2 = (*xcos++ + *ysin++)>>16;
                            long rr3 = (*xcos++ + *ysin++)>>16;
                            long rr4 = (*xcos++ + *ysin++)>>16;
                            long rr5 = (*xcos++ + *ysin++)>>16;
                            long rr6 = (*xcos++ + *ysin++)>>16;
                            long rr7 = (*xcos++ + *ysin++)>>16;

                            himg[rr0][t++] += val;
                            himg[rr1][t++] += val;
                            himg[rr2][t++] += val;
                            himg[rr3][t++] += val;
                            himg[rr4][t++] += val;
                            himg[rr5][t++] += val;
                            himg[rr6][t++] += val;
                            himg[rr7][t++] += val;
                        }
                        while(t < max_n4)
                        {
                            long rr0 = (*xcos++ + *ysin++)>>16;
                            long rr1 = (*xcos++ + *ysin++)>>16;
                            long rr2 = (*xcos++ + *ysin++)>>16;
                            long rr3 = (*xcos++ + *ysin++)>>16;
                            himg[rr0][t++] += val;
                            himg[rr1][t++] += val;
                            himg[rr2][t++] += val;
                            himg[rr3][t++] += val;
                        }
                        while(t < himg.nc())
                        {
                            long rr0 = (*xcos++ + *ysin++)>>16;
                            himg[rr0][t++] += val;
                        }
                    }
                }
            }
        }

    private:

        unsigned long _size;
        unsigned long even_size; // equal to _size if _size is even, otherwise equal to _size-1.
        matrix<int32> xcos_theta, ysin_theta;
    };
}

#endif // DLIB_HOUGH_tRANSFORM_Hh_

