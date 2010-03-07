// Copyright (C) 2005  Davis E. King (davisking@users.sourceforge.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#ifndef DLIB_RECTANGLe_
#define DLIB_RECTANGLe_

#include "rectangle_abstract.h"
#include "../algs.h"
#include <algorithm>
#include <iostream>
#include "../serialize.h"
#include "vector.h"

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

        template <typename T>
        rectangle (
            const vector<T>& v
        ) :
            l(static_cast<long>(v.x()+0.5)),
            t(static_cast<long>(v.y()+0.5)),
            r(static_cast<long>(v.x()+0.5)),
            b(static_cast<long>(v.y()+0.5))
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
            const vector<T>& v1,
            const vector<T>& v2
        )
        {
            *this = rectangle(v1) + rectangle(v2);
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


