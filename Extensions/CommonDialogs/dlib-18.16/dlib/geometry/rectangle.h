// Copyright (C) 2005  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#ifndef DLIB_RECTANGLe_
#define DLIB_RECTANGLe_

#include "rectangle_abstract.h"
#include "../algs.h"
#include <algorithm>
#include <iostream>
#include "../serialize.h"
#include "vector.h"
#include "../image_processing/generic_image.h"

namespace dlib
{

// ----------------------------------------------------------------------------------------
    
    class rectangle
    {
        /*!
            INITIAL VALUE
                The initial value of this object is defined by its constructor.

            CONVENTION
                left() == l
                top() == t
                right() == r
                bottom() == b
        !*/

    public:

        rectangle (
            long l_,
            long t_,
            long r_,
            long b_
        ) :
            l(l_),
            t(t_),
            r(r_),
            b(b_)
        {}

        rectangle (
            unsigned long w,
            unsigned long h
        ) :
            l(0),
            t(0),
            r(static_cast<long>(w)-1),
            b(static_cast<long>(h)-1)
        {
            DLIB_ASSERT((w > 0 && h > 0) || (w == 0 && h == 0),
                "\trectangle(width,height)"
                << "\n\twidth and height must be > 0 or both == 0"
                << "\n\twidth:  " << w 
                << "\n\theight: " << h 
                << "\n\tthis: " << this
                );
        }

        rectangle (
            const point& p
        ) :
            l(p.x()),
            t(p.y()),
            r(p.x()),
            b(p.y())
        {
        }

        rectangle (
            const point& p1,
            const point& p2
        )
        {
            *this = rectangle(p1) + rectangle(p2);
        }

        template <typename T>
        rectangle (
            const vector<T,2>& p1,
            const vector<T,2>& p2
        )
        {
            *this = rectangle(p1) + rectangle(p2);
        }

        rectangle (
        ) :
            l(0),
            t(0),
            r(-1),
            b(-1)
        {}

        long top (
        ) const { return t; }

        long& top (
        ) { return t; }

        void set_top (
            long top_
        ) { t = top_; }

        long left (
        ) const { return l; }

        long& left (
        ) { return l; }

        void set_left (
            long left_
        ) { l = left_; }

        long right (
        ) const { return r; }

        long& right (
        ) { return r; }

        void set_right (
            long right_
        ) { r = right_; }

        long bottom (
        ) const { return b; }

        long& bottom (
        ) { return b; }

        void set_bottom (
            long bottom_
        ) { b = bottom_; }

        const point tl_corner (
        ) const { return point(left(), top()); }

        const point bl_corner (
        ) const { return point(left(), bottom()); } 

        const point tr_corner (
        ) const { return point(right(), top()); }

        const point br_corner (
        ) const { return point(right(), bottom()); }
       
        unsigned long width (
        ) const 
        { 
            if (is_empty())
                return 0;
            else
                return r - l + 1; 
        }

        unsigned long height (
        ) const 
        { 
            if (is_empty())
                return 0;
            else
                return b - t + 1; 
        }

        unsigned long area (
        ) const
        {
            return width()*height();
        }

        bool is_empty (
        ) const { return (t > b || l > r); }

        rectangle operator + (
            const rectangle& rhs
        ) const
        {
            if (rhs.is_empty())
                return *this;
            else if (is_empty())
                return rhs;

            return rectangle (
                std::min(l,rhs.l),
                std::min(t,rhs.t),
                std::max(r,rhs.r),
                std::max(b,rhs.b)
                );
        }

        rectangle intersect (
            const rectangle& rhs
        ) const
        {
            return rectangle (
                std::max(l,rhs.l),
                std::max(t,rhs.t),
                std::min(r,rhs.r),
                std::min(b,rhs.b)
                );
        }

        bool contains (
            const point& p
        ) const
        {
            if (p.x() < l || p.x() > r || p.y() < t || p.y() > b)
                return false;
            return true;
        }

        bool contains (
            long x,
            long y
        ) const
        {
            if (x < l || x > r || y < t || y > b)
                return false;
            return true;
        }

        bool contains (
            const rectangle& rect
        ) const
        {
            return (rect + *this == *this);
        }

        rectangle& operator+= (
            const point& p 
        )
        {
            *this = *this + rectangle(p);
            return *this;
        }

        rectangle& operator+= (
            const rectangle& rect
        )
        {
            *this = *this + rect;
            return *this;
        }

        bool operator== (
            const rectangle& rect 
        ) const 
        {
            return (l == rect.l) && (t == rect.t) && (r == rect.r) && (b == rect.b);
        }

        bool operator!= (
            const rectangle& rect 
        ) const 
        {
            return !(*this == rect);
        }

    private:
        long l;
        long t;
        long r;
        long b;   
    };

// ----------------------------------------------------------------------------------------

    inline void serialize (
        const rectangle& item, 
        std::ostream& out
    )
    {
        try
        {
            serialize(item.left(),out); 
            serialize(item.top(),out); 
            serialize(item.right(),out); 
            serialize(item.bottom(),out); 
        }
        catch (serialization_error& e)
        {
            throw serialization_error(e.info + "\n   while serializing an object of type rectangle");
        }
    }

    inline void deserialize (
        rectangle& item, 
        std::istream& in
    )
    {
        try
        {
            deserialize(item.left(),in); 
            deserialize(item.top(),in); 
            deserialize(item.right(),in); 
            deserialize(item.bottom(),in); 
        }
        catch (serialization_error& e)
        {
            throw serialization_error(e.info + "\n   while deserializing an object of type rectangle");
        }
    }

    inline std::ostream& operator<< (
        std::ostream& out, 
        const rectangle& item 
    )   
    {
        out << "[(" << item.left() << ", " << item.top() << ") (" << item.right() << ", " << item.bottom() << ")]";
        return out;
    }

    inline std::istream& operator>>(
        std::istream& in, 
        rectangle& item 
    )
    {
        // ignore any whitespace
        while (in.peek() == ' ' || in.peek() == '\t' || in.peek() == '\r' || in.peek() == '\n')
            in.get();
        // now eat the leading '[' character
        if (in.get() != '[')
        {
            in.setstate(in.rdstate() | std::ios::failbit);
            return in;
        }

        point p1, p2;
        in >> p1;
        in >> p2;
        item = rectangle(p1) + rectangle(p2);

        // ignore any whitespace
        while (in.peek() == ' ' || in.peek() == '\t' || in.peek() == '\r' || in.peek() == '\n')
            in.get();
        // now eat the trailing ']' character
        if (in.get() != ']')
        {
            in.setstate(in.rdstate() | std::ios::failbit);
        }
        return in;
    }

// ----------------------------------------------------------------------------------------

    inline const rectangle centered_rect (
        long x,
        long y,
        unsigned long width,
        unsigned long height
    )
    {
        rectangle result;
        result.set_left ( x - static_cast<long>(width) / 2 );
        result.set_top ( y - static_cast<long>(height) / 2 );
        result.set_right ( result.left() + width - 1 );
        result.set_bottom ( result.top() + height - 1 );
        return result;
    }

// ----------------------------------------------------------------------------------------

    inline rectangle intersect (
        const rectangle& a,
        const rectangle& b
    ) { return a.intersect(b); }

// ----------------------------------------------------------------------------------------

    inline unsigned long area (
        const rectangle& a
    ) { return a.area(); }

// ----------------------------------------------------------------------------------------

    inline point center (
        const dlib::rectangle& rect
    )
    {
        point temp(rect.left() + rect.right() + 1,
                   rect.top() + rect.bottom() + 1);

        if (temp.x() < 0)
            temp.x() -= 1;

        if (temp.y() < 0)
            temp.y() -= 1;

        return temp/2;
    }

// ----------------------------------------------------------------------------------------

    inline dlib::vector<double,2> dcenter (
        const dlib::rectangle& rect
    )
    {
        dlib::vector<double,2> temp(rect.left() + rect.right(),
                                    rect.top() + rect.bottom());

        return temp/2.0;
    }

// ----------------------------------------------------------------------------------------

    inline long distance_to_rect_edge (
        const rectangle& rect,
        const point& p
    )
    {
        using std::max;
        using std::min;
        using std::abs;

        const long dist_x = min(abs(p.x()-rect.left()), abs(p.x()-rect.right()));
        const long dist_y = min(abs(p.y()-rect.top()),  abs(p.y()-rect.bottom()));

        if (rect.contains(p))
            return min(dist_x,dist_y);
        else if (rect.left() <= p.x() && p.x() <= rect.right())
            return dist_y;
        else if (rect.top() <= p.y() && p.y() <= rect.bottom())
            return dist_x;
        else
            return dist_x + dist_y;
    }

// ----------------------------------------------------------------------------------------

    inline const point nearest_point (
        const rectangle& rect,
        const point& p
    )
    {
        point temp(p);
        if (temp.x() < rect.left())
            temp.x() = rect.left();
        else if (temp.x() > rect.right())
            temp.x() = rect.right();

        if (temp.y() < rect.top())
            temp.y() = rect.top();
        else if (temp.y() > rect.bottom())
            temp.y() = rect.bottom();

        return temp;
    }

// ----------------------------------------------------------------------------------------

    template <typename T, typename U>
    double distance_to_line (
        const std::pair<vector<T,2>,vector<T,2> >& line,
        const vector<U,2>& p
    )
    {
        const vector<double,2> delta = p-line.second;
        const double along_dist = (line.first-line.second).normalize().dot(delta);
        return std::sqrt(std::max(0.0,delta.length_squared() - along_dist*along_dist));
    }

// ----------------------------------------------------------------------------------------

    inline void clip_line_to_rectangle (
        const rectangle& box,
        point& p1,
        point& p2
    )
    {
        // Now clip the line segment so it is contained inside box.
        if (p1.x() == p2.x())
        {
            if (!box.contains(p1))
                p1.y() = box.top();
            if (!box.contains(p2))
                p2.y() = box.bottom();
        }
        else if (p1.y() == p2.y())
        {
            if (!box.contains(p1))
                p1.x() = box.left();
            if (!box.contains(p2))
                p2.x() = box.right();
        }
        else
        {
            // We use these relations to find alpha values.  These values tell us
            // how to generate points intersecting the rectangle boundaries.  We then
            // test the resulting points for ones that are inside the rectangle and output
            // those.
            //box.left()  == alpha1*(p1.x()-p2.x()) + p2.x();
            //box.right() == alpha2*(p1.x()-p2.x()) + p2.x();

            const point d = p1-p2;
            double alpha1 = (box.left()  -p2.x())/(double)d.x();
            double alpha2 = (box.right() -p2.x())/(double)d.x();
            double alpha3 = (box.top()   -p2.y())/(double)d.y();
            double alpha4 = (box.bottom()-p2.y())/(double)d.y();

            const point c1 = alpha1*d + p2;
            const point c2 = alpha2*d + p2;
            const point c3 = alpha3*d + p2;
            const point c4 = alpha4*d + p2;

            if (!box.contains(p1))
                p1 = c1;
            if (!box.contains(p2))
                p2 = c2;
            if (box.contains(c3))
            {
                if (!box.contains(p2))
                    p2 = c3;
                else if (!box.contains(p1))
                    p1 = c3;
            }
            if (box.contains(c4))
            {
                if (!box.contains(p2))
                    p2 = c4;
                else if (!box.contains(p1))
                    p1 = c4;
            }
        }

        p1 = nearest_point(box, p1);
        p2 = nearest_point(box, p2);
    }

// ----------------------------------------------------------------------------------------

    inline const rectangle centered_rect (
        const point& p,
        unsigned long width,
        unsigned long height
    )
    {
        return centered_rect(p.x(),p.y(),width,height);
    }

// ----------------------------------------------------------------------------------------

    inline const rectangle centered_rect (
        const rectangle& rect,
        unsigned long width,
        unsigned long height
    )
    {
        return centered_rect((rect.left()+rect.right())/2,  (rect.top()+rect.bottom())/2, width, height);
    }

// ----------------------------------------------------------------------------------------

    inline const rectangle shrink_rect (
        const rectangle& rect,
        long num 
    )
    {
        return rectangle(rect.left()+num, rect.top()+num, rect.right()-num, rect.bottom()-num);
    }

// ----------------------------------------------------------------------------------------

    inline const rectangle grow_rect (
        const rectangle& rect,
        long num 
    )
    {
        return shrink_rect(rect, -num);
    }

// ----------------------------------------------------------------------------------------

    inline const rectangle shrink_rect (
        const rectangle& rect,
        long width,
        long height
    )
    {
        return rectangle(rect.left()+width, rect.top()+height, rect.right()-width, rect.bottom()-height);
    }

// ----------------------------------------------------------------------------------------

    inline const rectangle grow_rect (
        const rectangle& rect,
        long width,
        long height
    )
    {
        return shrink_rect(rect, -width, -height);
    }

// ----------------------------------------------------------------------------------------

    inline const rectangle translate_rect (
        const rectangle& rect,
        const point& p
    )
    {
        rectangle result;
        result.set_top ( rect.top() + p.y() );
        result.set_bottom ( rect.bottom() + p.y() );
        result.set_left ( rect.left() + p.x() );
        result.set_right ( rect.right() + p.x() );
        return result;
    }

// ----------------------------------------------------------------------------------------

    inline const rectangle translate_rect (
        const rectangle& rect,
        long x,
        long y
    )
    {
        rectangle result;
        result.set_top ( rect.top() + y );
        result.set_bottom ( rect.bottom() + y );
        result.set_left ( rect.left() + x );
        result.set_right ( rect.right() + x );
        return result;
    }

// ----------------------------------------------------------------------------------------

    inline const rectangle resize_rect (
        const rectangle& rect,
        unsigned long width,
        unsigned long height
    )
    {
        return rectangle(rect.left(),rect.top(), 
                         rect.left()+width-1,
                         rect.top()+height-1);
    }

// ----------------------------------------------------------------------------------------

    inline const rectangle resize_rect_width (
        const rectangle& rect,
        unsigned long width
    )
    {
        return rectangle(rect.left(),rect.top(), 
                         rect.left()+width-1,
                         rect.bottom());
    }

// ----------------------------------------------------------------------------------------

    inline const rectangle resize_rect_height (
        const rectangle& rect,
        unsigned long height 
    )
    {
        return rectangle(rect.left(),rect.top(), 
                         rect.right(),
                         rect.top()+height-1);
    }

// ----------------------------------------------------------------------------------------

    inline const rectangle move_rect (
        const rectangle& rect,
        const point& p
    )
    {
        return rectangle(p.x(), p.y(), p.x()+rect.width()-1, p.y()+rect.height()-1);
    }

// ----------------------------------------------------------------------------------------

    inline const rectangle move_rect (
        const rectangle& rect,
        long x,
        long y 
    )
    {
        return rectangle(x, y, x+rect.width()-1, y+rect.height()-1);
    }

// ----------------------------------------------------------------------------------------

    inline rectangle set_aspect_ratio (
        const rectangle& rect,
        double ratio
    )
    {
        DLIB_ASSERT(ratio > 0,
            "\t rectangle set_aspect_ratio()"
            << "\n\t ratio: " << ratio 
            );

        // aspect ratio is w/h

        // we need to find the rectangle that is nearest to rect in area but
        // with an aspect ratio of ratio.

        // w/h == ratio
        // w*h == rect.area()

        if (ratio >= 1)
        {
            const long h = static_cast<long>(std::sqrt(rect.area()/ratio) + 0.5);
            const long w = static_cast<long>(h*ratio + 0.5);
            return centered_rect(rect, w, h);
        }
        else
        {
            const long w = static_cast<long>(std::sqrt(rect.area()*ratio) + 0.5);
            const long h = static_cast<long>(w/ratio + 0.5);
            return centered_rect(rect, w, h);
        }
    }

// ----------------------------------------------------------------------------------------

    template <
        typename T 
        >
    inline const rectangle get_rect (
        const T& m
    )
    {
        return rectangle(0, 0, num_columns(m)-1, num_rows(m)-1);
    }

// ----------------------------------------------------------------------------------------

    inline rectangle operator+ (
        const rectangle& r,
        const point& p
    )
    {
        return r + rectangle(p);
    }

// ----------------------------------------------------------------------------------------

    inline rectangle operator+ (
        const point& p,
        const rectangle& r
    )
    {
        return r + rectangle(p);
    }

// ----------------------------------------------------------------------------------------

}

namespace std
{
    /*!
        Define std::less<rectangle> so that you can use rectangles in the associative containers.
    !*/
    template<>
    struct less<dlib::rectangle> : public binary_function<dlib::rectangle ,dlib::rectangle,bool>
    {
        inline bool operator() (const dlib::rectangle& a, const dlib::rectangle& b) const
        { 
            if      (a.left() < b.left()) return true;
            else if (a.left() > b.left()) return false;
            else if (a.top() < b.top()) return true;
            else if (a.top() > b.top()) return false;
            else if (a.right() < b.right()) return true;
            else if (a.right() > b.right()) return false;
            else if (a.bottom() < b.bottom()) return true;
            else if (a.bottom() > b.bottom()) return false;
            else                    return false;
        }
    };
}

#endif // DLIB_RECTANGLe_


