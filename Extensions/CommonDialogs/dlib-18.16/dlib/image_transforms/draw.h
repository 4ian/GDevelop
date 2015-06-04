// Copyright (C) 2008  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#ifndef DLIB_DRAW_IMAGe_
#define DLIB_DRAW_IMAGe_

#include "draw_abstract.h"
#include "../algs.h"
#include "../pixel.h"
#include "../matrix.h"
#include <cmath>

namespace dlib
{

// ----------------------------------------------------------------------------------------

    template <
        typename image_type,
        typename pixel_type
        >
    void draw_line (
        long x1,
        long y1,
        long x2,
        long y2,
        image_type& c_,
        const pixel_type& val
    ) 
    {
        image_view<image_type> c(c_);
        if (x1 == x2)
        {
            // make sure y1 comes before y2
            if (y1 > y2)
                swap(y1,y2);

            if (x1 < 0 || x1 >= c.nc())
                return;


            // this is a vertical line
            for (long y = y1; y <= y2; ++y)
            {
                if (y < 0 || y >= c.nr())
                    continue;

                assign_pixel(c[y][x1], val);
            }
        }
        else if (y1 == y2)
        {

            // make sure x1 comes before x2
            if (x1 > x2)
                swap(x1,x2);

            if (y1 < 0 || y1 >= c.nr())
                return;

            // this is a horizontal line
            for (long x = x1; x <= x2; ++x)
            {
                if (x < 0 || x >= c.nc())
                    continue;

                assign_pixel(c[y1][x] , val);
            }
        }
        else
        {
            // This part is a little more complicated because we are going to perform alpha
            // blending so the diagonal lines look nice.
            const rectangle valid_area = get_rect(c);
            rgb_alpha_pixel alpha_pixel;
            assign_pixel(alpha_pixel, val);
            const unsigned char max_alpha = alpha_pixel.alpha;

            const long rise = (((long)y2) - ((long)y1));
            const long run = (((long)x2) - ((long)x1));
            if (std::abs(rise) < std::abs(run))
            {
                const double slope = ((double)rise)/run;


                double first, last;


                if (x1 > x2)                
                {
                    first = std::max(x2,valid_area.left());
                    last = std::min(x1,valid_area.right());
                }
                else
                {
                    first = std::max(x1,valid_area.left());
                    last = std::min(x2,valid_area.right());
                }                             

                long y;
                long x;
                const double x1f = x1;
                const double y1f = y1;
                for (double i = first; i <= last; ++i)
                {   
                    const double dy = slope*(i-x1f) + y1f;
                    const double dx = i;

                    y = static_cast<long>(dy);
                    x = static_cast<long>(dx);


                    if (y >= valid_area.top() && y <= valid_area.bottom())
                    {
                        alpha_pixel.alpha = static_cast<unsigned char>((1.0-(dy-y))*max_alpha);
                        assign_pixel(c[y][x], alpha_pixel);
                    }
                    if (y+1 >= valid_area.top() && y+1 <= valid_area.bottom())
                    {
                        alpha_pixel.alpha = static_cast<unsigned char>((dy-y)*max_alpha);
                        assign_pixel(c[y+1][x], alpha_pixel);
                    }
                }         
            }
            else
            {
                const double slope = ((double)run)/rise;


                double first, last;


                if (y1 > y2)                
                {
                    first = std::max(y2,valid_area.top());
                    last = std::min(y1,valid_area.bottom());
                }
                else
                {
                    first = std::max(y1,valid_area.top());
                    last = std::min(y2,valid_area.bottom());
                }                             

                long x;
                long y;
                const double x1f = x1;
                const double y1f = y1;
                for (double i = first; i <= last; ++i)
                {   
                    const double dx = slope*(i-y1f) + x1f;
                    const double dy = i;

                    y = static_cast<long>(dy);
                    x = static_cast<long>(dx);

                    if (x >= valid_area.left() && x <= valid_area.right())
                    {
                        alpha_pixel.alpha = static_cast<unsigned char>((1.0-(dx-x))*max_alpha);
                        assign_pixel(c[y][x], alpha_pixel);
                    }
                    if (x+1 >= valid_area.left() && x+1 <= valid_area.right())
                    {
                        alpha_pixel.alpha = static_cast<unsigned char>((dx-x)*max_alpha);
                        assign_pixel(c[y][x+1], alpha_pixel);
                    }
                } 
            }
        }

    }

// ----------------------------------------------------------------------------------------

    template <
        typename image_type,
        typename pixel_type
        >
    void draw_line (
        image_type& c,
        const point& p1,
        const point& p2,
        const pixel_type& val
    ) 
    {
        draw_line(p1.x(),p1.y(),p2.x(),p2.y(),c,val);
    }

// ----------------------------------------------------------------------------------------

    template <
        typename image_type,
        typename pixel_type
        >
    void draw_rectangle (
        image_type& c,
        const rectangle& rect,
        const pixel_type& val
    ) 
    {
        draw_line(c, rect.tl_corner(), rect.tr_corner(), val);
        draw_line(c, rect.bl_corner(), rect.br_corner(), val);
        draw_line(c, rect.tl_corner(), rect.bl_corner(), val);
        draw_line(c, rect.tr_corner(), rect.br_corner(), val);
    }

// ----------------------------------------------------------------------------------------

    template <
        typename image_type,
        typename pixel_type
        >
    void draw_rectangle (
        image_type& c,
        const rectangle& rect,
        const pixel_type& val,
        unsigned int thickness
    ) 
    {
        for (unsigned int i = 0; i < thickness; ++i)
        {
            if ((i%2)==0)
                draw_rectangle(c,shrink_rect(rect,(i+1)/2),val);
            else
                draw_rectangle(c,grow_rect(rect,(i+1)/2),val);
        }
    }

// ----------------------------------------------------------------------------------------

    template <
        typename image_type,
        typename pixel_type
        >
    void fill_rect (
        image_type& img_,
        const rectangle& rect,
        const pixel_type& pixel
    )
    {
        image_view<image_type> img(img_);
        rectangle area = rect.intersect(get_rect(img));

        for (long r = area.top(); r <= area.bottom(); ++r)
        {
            for (long c = area.left(); c <= area.right(); ++c)
            {
                assign_pixel(img[r][c], pixel);
            }
        }
    }

// ----------------------------------------------------------------------------------------

    template <
        typename image_array_type
        >
    matrix<typename image_traits<typename image_array_type::value_type>::pixel_type> tile_images (
        const image_array_type& images
    )
    {
        typedef typename image_traits<typename image_array_type::value_type>::pixel_type T;

        if (images.size() == 0)
            return matrix<T>();

        const unsigned long size_nc = square_root(images.size());
        const unsigned long size_nr = (size_nc*(size_nc-1)>=images.size())? size_nc-1 : size_nc;
        // Figure out the size we have to use for each chip in the big main image.  We will
        // use the largest dimensions seen across all the chips.
        long nr = 0;
        long nc = 0;
        for (unsigned long i = 0; i < images.size(); ++i)
        {
            nr = std::max(num_rows(images[i]), nr);
            nc = std::max(num_columns(images[i]), nc);
        }

        matrix<T> temp(size_nr*nr, size_nc*nc);
        T background_color;
        assign_pixel(background_color, 0);
        temp = background_color;
        unsigned long idx = 0;
        for (unsigned long r = 0; r < size_nr; ++r)
        {
            for (unsigned long c = 0; c < size_nc; ++c)
            {
                if (idx < images.size())
                {
                    set_subm(temp, r*nr, c*nc, nr, nc) = mat(images[idx]);
                }
                ++idx;
            }
        }
        return temp;
    }

// ----------------------------------------------------------------------------------------

    template <
        typename image_type,
        typename pixel_type
        >
    void draw_solid_circle (
        image_type& img_,
        const dpoint& center_point,
        double radius,
        const pixel_type& pixel
    )
    {
        image_view<image_type> img(img_);
        using std::sqrt;
        const rectangle valid_area(get_rect(img));
        const double x = center_point.x();
        const double y = center_point.y();
        const point cp(center_point);
        if (radius > 1)
        {
            long first_x = static_cast<long>(x - radius + 0.5);
            long last_x = static_cast<long>(x + radius + 0.5);
            const double rs = radius*radius;

            // ensure that we only loop over the part of the x dimension that this
            // image contains.
            if (first_x < valid_area.left())
                first_x = valid_area.left();
            if (last_x > valid_area.right())
                last_x = valid_area.right();

            long top, bottom;

            top = static_cast<long>(sqrt(std::max(rs - (first_x-x-0.5)*(first_x-x-0.5),0.0))+0.5);
            top += y;
            long last = top;

            // draw the left half of the circle
            long middle = std::min(cp.x()-1,last_x);
            for (long i = first_x; i <= middle; ++i)
            {
                double a = i - x + 0.5;
                // find the top of the arc
                top = static_cast<long>(sqrt(std::max(rs - a*a,0.0))+0.5);
                top += y;
                long temp = top;

                while(top >= last) 
                {
                    bottom = y - top + y;
                    draw_line(img_, point(i,top),point(i,bottom),pixel);
                    --top;
                }

                last = temp;
            }

            middle = std::max(cp.x(),first_x);
            top = static_cast<long>(sqrt(std::max(rs - (last_x-x+0.5)*(last_x-x+0.5),0.0))+0.5);
            top += y;
            last = top;
            // draw the right half of the circle
            for (long i = last_x; i >= middle; --i)
            {
                double a = i - x - 0.5;
                // find the top of the arc
                top = static_cast<long>(sqrt(std::max(rs - a*a,0.0))+0.5);
                top += y;
                long temp = top;

                while(top >= last) 
                {
                    bottom = y - top + y;
                    draw_line(img_, point(i,top),point(i,bottom),pixel);
                    --top;
                }

                last = temp;
            }
        }
        else if (valid_area.contains(cp))
        {
            // For circles smaller than a pixel we will just alpha blend them in proportion
            // to how small they are.
            rgb_alpha_pixel temp;
            assign_pixel(temp, pixel);
            temp.alpha = static_cast<unsigned char>(255*radius + 0.5);
            assign_pixel(img[cp.y()][cp.x()], temp);
        }
    }

// ----------------------------------------------------------------------------------------

}

#endif // DLIB_DRAW_IMAGe_




