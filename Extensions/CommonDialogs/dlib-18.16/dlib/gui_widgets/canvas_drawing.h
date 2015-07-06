// Copyright (C) 2005  Davis E. King (davis@dlib.net), and Nils Labugt
// License: Boost Software License   See LICENSE.txt for the full license.

#ifndef DLIB_GUI_CANVAS_DRAWINg_
#define DLIB_GUI_CANVAS_DRAWINg_

#include "canvas_drawing_abstract.h"
#include "../gui_core.h"
#include "../algs.h"
#include "../array2d.h"
#include "../pixel.h"
#include "../image_transforms/assign_image.h"
#include "../geometry.h"
#include <cmath>

namespace dlib
{

// ----------------------------------------------------------------------------------------

    template <typename pixel_type>
    void draw_line (
        const canvas& c,
        const point& p1,
        const point& p2,
        const pixel_type& pixel, 
        const rectangle& area = rectangle(std::numeric_limits<long>::min(), std::numeric_limits<long>::min(),
                                          std::numeric_limits<long>::max(), std::numeric_limits<long>::max())
    )
    {
        rectangle valid_area(c.intersect(area));
        long x1 = p1.x();
        long y1 = p1.y();
        long x2 = p2.x();
        long y2 = p2.y();
        if (x1 == x2)
        {
            // if the x coordinate is inside the canvas's area
            if (x1 <= valid_area.right() && x1 >= valid_area.left())
            {
                // make sure y1 comes before y2
                if (y1 > y2)
                    swap(y1,y2);

                y1 = std::max(y1,valid_area.top());
                y2 = std::min(y2,valid_area.bottom());
                // this is a vertical line
                for (long y = y1; y <= y2; ++y)
                {
                    assign_pixel(c[y-c.top()][x1-c.left()], pixel);
                }
            }
        }
        else if (y1 == y2)
        {
            // if the y coordinate is inside the canvas's area
            if (y1 <= valid_area.bottom() && y1 >= valid_area.top())
            {
                // make sure x1 comes before x2
                if (x1 > x2)
                    swap(x1,x2);

                x1 = std::max(x1,valid_area.left());
                x2 = std::min(x2,valid_area.right());
                // this is a horizontal line
                for (long x = x1; x <= x2; ++x)
                {
                    assign_pixel(c[y1-c.top()][x-c.left()], pixel);
                }
            }
        }
        else
        {
            rgb_alpha_pixel alpha_pixel;
            assign_pixel(alpha_pixel, pixel);
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
                        assign_pixel(c[y-c.top()][x-c.left()], alpha_pixel);
                    }
                    if (y+1 >= valid_area.top() && y+1 <= valid_area.bottom())
                    {
                        alpha_pixel.alpha = static_cast<unsigned char>((dy-y)*max_alpha);
                        assign_pixel(c[y+1-c.top()][x-c.left()], alpha_pixel);
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
                        assign_pixel(c[y-c.top()][x-c.left()], alpha_pixel);
                    }
                    if (x+1 >= valid_area.left() && x+1 <= valid_area.right())
                    {
                        alpha_pixel.alpha = static_cast<unsigned char>((dx-x)*max_alpha);
                        assign_pixel(c[y-c.top()][x+1-c.left()], alpha_pixel);
                    }
                } 
            }
        }

    }
    inline void draw_line (
        const canvas& c,
        const point& p1,
        const point& p2
    ){ draw_line(c,p1,p2,0); }

// ----------------------------------------------------------------------------------------

    void draw_sunken_rectangle (
        const canvas& c,
        const rectangle& border,
        unsigned char alpha = 255
    );

// ----------------------------------------------------------------------------------------

    template <typename pixel_type>
    inline void draw_pixel (
        const canvas& c,
        const point& p,
        const pixel_type& pixel 
    )
    {
        if (c.contains(p))
        {
            assign_pixel(c[p.y()-c.top()][p.x()-c.left()],pixel);
        }
    }

// ----------------------------------------------------------------------------------------

    template <typename pixel_type>
    void draw_checkered (
        const canvas& c,
        const rectangle& a,
        const pixel_type& pixel1,
        const pixel_type& pixel2
    )
    {
        rectangle area = a.intersect(c);
        if (area.is_empty())
            return;

        for (long i = area.left(); i <= area.right(); ++i)
        {
            for (long j = area.top(); j <= area.bottom(); ++j)
            {
                canvas::pixel& p = c[j - c.top()][i - c.left()];
                if ((j&0x1) ^ (i&0x1))
                {
                    assign_pixel(p,pixel1);
                }
                else
                {
                    assign_pixel(p,pixel2);
                }
            }
        }
    }

// ----------------------------------------------------------------------------------------

    void draw_button_down (
        const canvas& c,
        const rectangle& btn,
        unsigned char alpha = 255
    );

// ----------------------------------------------------------------------------------------

    void draw_button_up (
        const canvas& c,
        const rectangle& btn,
        unsigned char alpha = 255
    );

// ----------------------------------------------------------------------------------------

    template <typename pixel_type>
    void draw_circle (
        const canvas& c,
        const point& center_point,
        double radius,
        const pixel_type& pixel,
        const rectangle& area = rectangle(std::numeric_limits<long>::min(), std::numeric_limits<long>::min(),
                                          std::numeric_limits<long>::max(), std::numeric_limits<long>::max())
    )
    {
        using std::sqrt;
        rectangle valid_area(c.intersect(area));
        const long x = center_point.x();
        const long y = center_point.y();
        if (radius > 1)
        {
            long first_x = static_cast<long>(x - radius + 0.5);
            long last_x = static_cast<long>(x + radius + 0.5);
            const double rs = radius*radius;

            // ensure that we only loop over the part of the x dimension that this
            // canvas contains.
            if (first_x < valid_area.left())
                first_x = valid_area.left();
            if (last_x > valid_area.right())
                last_x = valid_area.right();

            long top, bottom;

            top = static_cast<long>(sqrt(std::max(rs - (first_x-x-0.5)*(first_x-x-0.5),0.0))+0.5);
            top += y;
            long last = top;

            // draw the left half of the circle
            long middle = std::min(x-1,last_x);
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
                    if (top >= valid_area.top() && top <= valid_area.bottom() )
                    {
                        assign_pixel(c[top-c.top()][i-c.left()],pixel);
                    }

                    if (bottom >= valid_area.top() && bottom <= valid_area.bottom() )
                    {
                        assign_pixel(c[bottom-c.top()][i-c.left()],pixel);
                    }
                    --top;
                }

                last = temp;
            }

            middle = std::max(x,first_x);
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
                    if (top >= valid_area.top() && top <= valid_area.bottom() )
                    {
                        assign_pixel(c[top-c.top()][i-c.left()],pixel);
                    }

                    if (bottom >= valid_area.top() && bottom <= valid_area.bottom() )
                    {
                        assign_pixel(c[bottom-c.top()][i-c.left()],pixel);
                    }
                    --top;
                }

                last = temp;
            }
        }
        else if (radius == 1 &&
                 x >= valid_area.left() && x <= valid_area.right() &&
                 y >= valid_area.top() && y <= valid_area.bottom() )
        {
            assign_pixel(c[y-c.top()][x-c.left()], pixel);
        }
    }
    inline void draw_circle (
        const canvas& c,
        const point& center_point,
        double radius
    ){ draw_circle(c, center_point, radius, 0); }

// ----------------------------------------------------------------------------------------

    template <typename pixel_type>
    void draw_solid_circle (
        const canvas& c,
        const point& center_point,
        double radius,
        const pixel_type& pixel,
        const rectangle& area = rectangle(std::numeric_limits<long>::min(), std::numeric_limits<long>::min(),
                                          std::numeric_limits<long>::max(), std::numeric_limits<long>::max())
    )
    {
        using std::sqrt;
        rectangle valid_area(c.intersect(area));
        const long x = center_point.x();
        const long y = center_point.y();
        if (radius > 1)
        {
            long first_x = static_cast<long>(x - radius + 0.5);
            long last_x = static_cast<long>(x + radius + 0.5);
            const double rs = radius*radius;

            // ensure that we only loop over the part of the x dimension that this
            // canvas contains.
            if (first_x < valid_area.left())
                first_x = valid_area.left();
            if (last_x > valid_area.right())
                last_x = valid_area.right();

            long top, bottom;

            top = static_cast<long>(sqrt(std::max(rs - (first_x-x-0.5)*(first_x-x-0.5),0.0))+0.5);
            top += y;
            long last = top;

            // draw the left half of the circle
            long middle = std::min(x-1,last_x);
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
                    draw_line(c, point(i,top),point(i,bottom),pixel,area);
                    --top;
                }

                last = temp;
            }

            middle = std::max(x,first_x);
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
                    draw_line(c, point(i,top),point(i,bottom),pixel,area);
                    --top;
                }

                last = temp;
            }
        }
        else if (radius == 1 &&
                 x >= valid_area.left() && x <= valid_area.right() &&
                 y >= valid_area.top() && y <= valid_area.bottom() )
        {
            assign_pixel(c[y-c.top()][x-c.left()], pixel);
        }
    }
    inline void draw_solid_circle (
        const canvas& c,
        const point& center_point,
        double radius
    ) { draw_solid_circle(c, center_point, radius, 0); }

// ----------------------------------------------------------------------------------------

    namespace impl
    {

        template <typename alloc>
        void get_convex_polygon_shape (
            const std::vector<point>& points,
            const long top,
            const long bottom,
            std::vector<double,alloc>& left_boundary,
            std::vector<double,alloc>& right_boundary
        )
        /*!
            requires
                - 0 <= top <= bottom 
            ensures
                - interprets points as the coordinates defining a convex polygon.  In
                  particular, we interpret points as a list of the vertices of the polygon
                  and assume they are ordered in clockwise order.
                - #left_boundary.size() == bottom-top+1
                - #right_boundary.size() == bottom-top+1
                - for all top <= y <= bottom:
                    - #left_boundary[y-top] == the x coordinate for the left most side of
                      the polygon at coordinate y.
                    - #right_boundary[y-top] == the x coordinate for the right most side of
                      the polygon at coordinate y.
        !*/
        {
            using std::min;
            using std::max;

            left_boundary.assign(bottom-top+1, std::numeric_limits<double>::infinity());
            right_boundary.assign(bottom-top+1, -std::numeric_limits<double>::infinity());

            // trace out the points along the edge of the polynomial and record them
            for (unsigned long i = 0; i < points.size(); ++i)
            {
                const point p1 = points[i];
                const point p2 = points[(i+1)%points.size()];

                if (p1.y() == p2.y())
                {
                    if (top <= p1.y() && p1.y() <= bottom)
                    {
                        const long y = p1.y() - top;
                        const double xmin = min(p1.x(), p2.x());
                        const double xmax = min(p1.x(), p2.x());
                        left_boundary[y]  = min(left_boundary[y], xmin);
                        right_boundary[y] = max(right_boundary[y], xmax);
                    }
                }
                else
                {
                    // Here we trace out the line from p1 to p2 and record where it hits.  

                    // x = m*y + b
                    const double m = (p2.x() - p1.x())/(double)(p2.y()-p1.y());
                    const double b = p1.x() - m*p1.y(); // because: x1 = m*y1 + b

                    const long ymin = max(top,min(p1.y(), p2.y()));
                    const long ymax = min(bottom,max(p1.y(), p2.y()));
                    for (long y = ymin; y <= ymax; ++y)
                    {
                        const double x = m*y + b;
                        const unsigned long idx = y-top;
                        left_boundary[idx]  = min(left_boundary[idx], x);
                        right_boundary[idx] = max(right_boundary[idx], x);
                    }
                }
            }
        }

    // ------------------------------------------------------------------------------------

    }

    template <typename pixel_type>
    void draw_solid_convex_polygon (
        const canvas& c,
        const std::vector<point>& polygon,
        const pixel_type& pixel,
        const rectangle& area = rectangle(std::numeric_limits<long>::min(), std::numeric_limits<long>::min(),
                                          std::numeric_limits<long>::max(), std::numeric_limits<long>::max())
    )
    {
        using std::max;
        using std::min;
        const rectangle valid_area(c.intersect(area));

        rectangle bounding_box;
        for (unsigned long i = 0; i < polygon.size(); ++i)
            bounding_box += polygon[i];

        // Don't do anything if the polygon is totally outside the area we can draw in
        // right now.
        if (bounding_box.intersect(valid_area).is_empty())
            return;

        rgb_alpha_pixel alpha_pixel;
        assign_pixel(alpha_pixel, pixel);
        const unsigned char max_alpha = alpha_pixel.alpha;

        // we will only want to loop over the part of left_boundary that is part of the
        // valid_area.
        long top = max(valid_area.top(),bounding_box.top());
        long bottom = min(valid_area.bottom(),bounding_box.bottom());

        // Since we look at the adjacent rows of boundary information when doing the alpha
        // blending, we want to make sure we always have some boundary information unless
        // we are at the absolute edge of the polygon.
        const long top_offset = (top == bounding_box.top()) ? 0 : 1;
        const long bottom_offset = (bottom == bounding_box.bottom()) ? 0 : 1;
        if (top != bounding_box.top())
            top -= 1;
        if (bottom != bounding_box.bottom())
            bottom += 1;

        std::vector<double> left_boundary;
        std::vector<double> right_boundary;
        impl::get_convex_polygon_shape(polygon, top, bottom, left_boundary, right_boundary);


        // draw the polygon row by row
        for (unsigned long i = top_offset; i < left_boundary.size(); ++i)
        {
            long left_x = static_cast<long>(std::ceil(left_boundary[i]));
            long right_x = static_cast<long>(std::floor(right_boundary[i]));

            left_x = max(left_x, valid_area.left());
            right_x = min(right_x, valid_area.right());

            if (i < left_boundary.size()-bottom_offset)
            {
                // draw the main body of the polygon
                for (long x = left_x; x <= right_x; ++x)
                {
                    const long y = i+top;
                    assign_pixel(c[y-c.top()][x-c.left()], pixel);
                }
            }

            if (i == 0)
                continue;

            // Now draw anti-aliased edges so they don't look all pixely.

            // Alpha blend the edges on the left side.
            double delta = left_boundary[i-1] - left_boundary[i];
            if (std::abs(delta) <= 1)
            {
                if (std::floor(left_boundary[i]) != left_x)
                {
                    const point p(static_cast<long>(std::floor(left_boundary[i])), i+top);
                    rgb_alpha_pixel temp = alpha_pixel;
                    temp.alpha = max_alpha-static_cast<unsigned char>((left_boundary[i]-p.x())*max_alpha);
                    if (valid_area.contains(p))
                        assign_pixel(c[p.y()-c.top()][p.x()-c.left()],temp);
                }
            }
            else if (delta < 0)  // on the bottom side
            {
                for (long x = static_cast<long>(std::ceil(left_boundary[i-1])); x < left_x; ++x)
                {
                    const point p(x, i+top);
                    rgb_alpha_pixel temp = alpha_pixel;
                    temp.alpha = static_cast<unsigned char>((x-left_boundary[i-1])/std::abs(delta)*max_alpha);
                    if (valid_area.contains(p))
                        assign_pixel(c[p.y()-c.top()][p.x()-c.left()],temp);
                }
            }
            else // on the top side
            {
                const long old_left_x = static_cast<long>(std::ceil(left_boundary[i-1]));
                for (long x = left_x; x < old_left_x; ++x)
                {
                    const point p(x, i+top-1);
                    rgb_alpha_pixel temp = alpha_pixel;
                    temp.alpha = static_cast<unsigned char>((x-left_boundary[i])/delta*max_alpha);
                    if (valid_area.contains(p))
                        assign_pixel(c[p.y()-c.top()][p.x()-c.left()],temp);
                }
            }


            // Alpha blend the edges on the right side
            delta = right_boundary[i-1] - right_boundary[i];
            if (std::abs(delta) <= 1)
            {
                if (std::ceil(right_boundary[i]) != right_x)
                {
                    const point p(static_cast<long>(std::ceil(right_boundary[i])), i+top);
                    rgb_alpha_pixel temp = alpha_pixel;
                    temp.alpha = max_alpha-static_cast<unsigned char>((p.x()-right_boundary[i])*max_alpha);
                    if (valid_area.contains(p))
                        assign_pixel(c[p.y()-c.top()][p.x()-c.left()],temp);
                }
            }
            else if (delta < 0) // on the top side
            {
                for (long x = static_cast<long>(std::floor(right_boundary[i-1]))+1; x <= right_x; ++x)
                {
                    const point p(x, i+top-1);
                    rgb_alpha_pixel temp = alpha_pixel;
                    temp.alpha = static_cast<unsigned char>((right_boundary[i]-x)/std::abs(delta)*max_alpha);
                    if (valid_area.contains(p))
                        assign_pixel(c[p.y()-c.top()][p.x()-c.left()],temp);
                }
            }
            else // on the bottom side
            {
                const long old_right_x = static_cast<long>(std::floor(right_boundary[i-1]));
                for (long x = right_x+1; x <= old_right_x; ++x)
                {
                    const point p(x, i+top);
                    rgb_alpha_pixel temp = alpha_pixel;
                    temp.alpha = static_cast<unsigned char>((right_boundary[i-1]-x)/delta*max_alpha);
                    if (valid_area.contains(p))
                        assign_pixel(c[p.y()-c.top()][p.x()-c.left()],temp);
                }
            }
        }
    }
    inline void draw_solid_convex_polygon (
        const canvas& c,
        const std::vector<point>& polygon
    ) { draw_solid_convex_polygon(c, polygon, 0); }

// ----------------------------------------------------------------------------------------

    template <
        typename image_type 
        >
    void draw_image (
        const canvas& c,
        const point& p,
        const image_type& img,
        const rectangle& area_ = rectangle(std::numeric_limits<long>::min(), std::numeric_limits<long>::min(),
                                          std::numeric_limits<long>::max(), std::numeric_limits<long>::max())
    )
    {
        const long x = p.x();
        const long y = p.y();
        rectangle rect(x,y,img.nc()+x-1,img.nr()+y-1);
        rectangle area = c.intersect(rect).intersect(area_);
        if (area.is_empty())
            return;

        for (long row = area.top(); row <= area.bottom(); ++row)
        {
            for (long col = area.left(); col <= area.right(); ++col)
            {
                assign_pixel(c[row-c.top()][col-c.left()], img[row-rect.top()][col-rect.left()]);
            }
        }
    }

// ----------------------------------------------------------------------------------------

    template <
        typename image_type 
        >
    void draw_image (
        const canvas& c,
        const rectangle& rect,
        const image_type& img,
        const rectangle& area_ = rectangle(std::numeric_limits<long>::min(), std::numeric_limits<long>::min(),
                                          std::numeric_limits<long>::max(), std::numeric_limits<long>::max())
    )
    {
        const rectangle area = c.intersect(rect).intersect(area_);
        if (area.is_empty() || img.size() == 0)
            return;

        const matrix<long,1> x = matrix_cast<long>(round(linspace(0, img.nc()-1, rect.width())));
        const matrix<long,1> y = matrix_cast<long>(round(linspace(0, img.nr()-1, rect.height())));

        for (long row = area.top(); row <= area.bottom(); ++row)
        {
            const long r = y(row-rect.top());
            long cc = area.left() - rect.left();
            for (long col = area.left(); col <= area.right(); ++col)
            {
                assign_pixel(c[row-c.top()][col-c.left()], img[r][x(cc++)]);
            }
        }
    }

// ----------------------------------------------------------------------------------------

    template <typename pixel_type>
    void draw_rounded_rectangle (
        const canvas& c,
        const rectangle& rect,
        unsigned radius,
        const pixel_type& color,
        const rectangle& area_ = rectangle(std::numeric_limits<long>::min(), std::numeric_limits<long>::min(),
                                          std::numeric_limits<long>::max(), std::numeric_limits<long>::max())
    )
    {
        if ( rect.intersect ( c ).is_empty() )
            return;

        draw_line ( c, point(rect.left() + radius + 1, rect.bottom()), 
                    point(rect.right() - radius - 1, rect.bottom()), color,area_ );

        draw_line ( c, point(rect.left() + radius + 1, rect.top()), 
                    point(rect.right() - radius - 1, rect.top()), color,area_ );

        draw_line ( c, point(rect.left(), rect.top() + radius + 1), 
                    point(rect.left(), rect.bottom() - radius - 1), color,area_ );

        draw_line ( c, point(rect.right(), rect.top() + radius + 1), 
                    point(rect.right(), rect.bottom() - radius - 1), color,area_ );

        unsigned x = radius, y = 0, old_x = x;

        point p;
        while ( x > y )
        {
            p = point(rect.left() + radius - y, rect.top() + radius - x);
            if (area_.contains(p)) draw_pixel (c, p , color );
            p = point(rect.right() - radius + y, rect.top() + radius - x);
            if (area_.contains(p)) draw_pixel (c, p , color );
            p = point(rect.right() - radius + y, rect.bottom() - radius + x);
            if (area_.contains(p)) draw_pixel (c, p , color );
            p = point(rect.left() + radius - y, rect.bottom() - radius + x);
            if (area_.contains(p)) draw_pixel (c, p , color );
            p = point(rect.left() + radius - x, rect.top() + radius - y);
            if (area_.contains(p)) draw_pixel (c, p , color );
            p = point(rect.right() - radius + x, rect.top() + radius - y);
            if (area_.contains(p)) draw_pixel (c, p , color );
            p = point(rect.right() - radius + x, rect.bottom() - radius + y);
            if (area_.contains(p)) draw_pixel (c, p , color );
            p = point(rect.left() + radius - x, rect.bottom() - radius + y);
            if (area_.contains(p)) draw_pixel (c, p , color );
            y++;
            old_x = x;
            x = square_root ( ( radius * radius - y * y ) * 4 ) / 2;
        }

        if ( x == y && old_x != x )
        {
            p = point(rect.left() + radius - y, rect.top() + radius - x);
            if (area_.contains(p)) draw_pixel (c, p , color );
            p = point(rect.right() - radius + y, rect.top() + radius - x);
            if (area_.contains(p)) draw_pixel (c, p , color );
            p = point(rect.right() - radius + y, rect.bottom() - radius + x);
            if (area_.contains(p)) draw_pixel (c, p , color );
            p = point(rect.left() + radius - y, rect.bottom() - radius + x);
            if (area_.contains(p)) draw_pixel (c, p , color );
        }
    }

// ----------------------------------------------------------------------------------------

    template <typename pixel_type>
    void fill_gradient_rounded (
        const canvas& c,
        const rectangle& rect,
        unsigned long radius,
        const pixel_type& top_color,
        const pixel_type& bottom_color,
        const rectangle& area = rectangle(std::numeric_limits<long>::min(), std::numeric_limits<long>::min(),
                                          std::numeric_limits<long>::max(), std::numeric_limits<long>::max())

    )
    {
        rectangle valid_area(c.intersect(area.intersect(rect)));
        if ( valid_area.is_empty() )
            return;


        unsigned long m_prev = 0, m = radius, c_div = valid_area.height() - 1;

        const long c_top = valid_area.top();
        const long c_bottom = valid_area.bottom();

        for ( long y = c_top; y <= c_bottom;y++ )
        {

            unsigned long c_s = y - c_top;

            unsigned long c_t = c_bottom - y;


            if ( c_div == 0 )
            {
                // only a single round, just take the average color
                c_div = 2;
                c_s = c_t = 1;
            }

            rgb_alpha_pixel color;
            vector_to_pixel(color,
                            ((pixel_to_vector<unsigned long>(top_color)*c_t + pixel_to_vector<unsigned long>(bottom_color)*c_s)/c_div));

            unsigned long s = y - rect.top();

            unsigned long t = rect.bottom() - y;

            if ( s < radius )
            {
                m = radius - square_root ( ( radius * radius - ( radius - s ) * ( radius - s ) ) * 4 ) / 2;

                if ( s == m && m + 1 < m_prev )  // these are hacks to remove distracting artefacts at small radii
                    m++;
            }
            else if ( t < radius )
            {
                m = radius - square_root ( ( radius * radius - ( radius - t ) * ( radius - t ) ) * 4 ) / 2;

                if ( t == m && m == m_prev )
                    m++;
            }
            else
            {
                m = 0;
            }

            m_prev = m;

            draw_line ( c, point(rect.left() + m, y), 
                        point(rect.right() - m, y), color, valid_area );
        }
    }

// ----------------------------------------------------------------------------------------

    template <typename pixel_type>
    void draw_rectangle (
        const canvas& c,
        rectangle rect,
        const pixel_type& pixel,
        const rectangle& area = rectangle(std::numeric_limits<long>::min(), std::numeric_limits<long>::min(),
                                          std::numeric_limits<long>::max(), std::numeric_limits<long>::max())
    )
    {
        // top line
        draw_line(c, point(rect.left(),rect.top()),
                  point(rect.right(),rect.top()),
                  pixel, area);

        // bottom line
        draw_line(c, point(rect.left(),rect.bottom()),
                  point(rect.right(),rect.bottom()),
                  pixel, area);

        // left line
        draw_line(c, point(rect.left(),rect.top()),
                  point(rect.left(),rect.bottom()),
                  pixel, area);

        // right line
        draw_line(c, point(rect.right(),rect.top()),
                  point(rect.right(),rect.bottom()),
                  pixel, area);
    }
    inline void draw_rectangle (
        const canvas& c,
        rectangle rect
    ){ draw_rectangle(c, rect, 0); }

// ----------------------------------------------------------------------------------------

    template <typename pixel_type>
    void fill_rect (
        const canvas& c,
        const rectangle& rect,
        const pixel_type& pixel
    )
    {
        rectangle area = rect.intersect(c);
        for (long y = area.top(); y <= area.bottom(); ++y)
        {
            for (long x = area.left(); x <= area.right(); ++x)
            {
                assign_pixel(c[y-c.top()][x-c.left()], pixel);
            }
        }
    }

// ----------------------------------------------------------------------------------------

    template <typename pixel_type>
    void fill_rect_with_vertical_gradient (
        const canvas& c,
        const rectangle& rect,
        const pixel_type& pixel_top,
        const pixel_type& pixel_bottom,
        const rectangle& area_ = rectangle(std::numeric_limits<long>::min(), std::numeric_limits<long>::min(),
                                          std::numeric_limits<long>::max(), std::numeric_limits<long>::max())
    )
    {
        rectangle area = rect.intersect(c).intersect(area_);
        pixel_type pixel;

        const long s = rect.bottom()-rect.top();

        for (long y = area.top(); y <= area.bottom(); ++y)
        {
            const long t = rect.bottom()-y;
            const long b = y-rect.top();
            vector_to_pixel(pixel,
                    ((pixel_to_vector<long>(pixel_top)*t + 
                      pixel_to_vector<long>(pixel_bottom)*b)/s));

            for (long x = area.left(); x <= area.right(); ++x)
            {
                assign_pixel(c[y-c.top()][x-c.left()], pixel);
            }
        }
    }

// ----------------------------------------------------------------------------------------

}

#ifdef NO_MAKEFILE
#include "canvas_drawing.cpp"
#endif

#endif // DLIB_GUI_CANVAS_DRAWINg_

