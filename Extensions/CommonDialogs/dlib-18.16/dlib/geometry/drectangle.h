// Copyright (C) 2015  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#ifndef DLIB_DRECTANGLe_
#define DLIB_DRECTANGLe_

#include "drectangle_abstract.h"
#include "rectangle.h"

namespace dlib
{
    class drectangle;
    drectangle operator* (
        const drectangle& rect,
        const double& scale 
    );

// ----------------------------------------------------------------------------------------

    class drectangle
    {
    public:

        drectangle (
        ) : l(0), t(0), r(-1), b(-1) {}

        drectangle (
            double l_,
            double t_,
            double r_,
            double b_
        ) :
            l(l_),
            t(t_),
            r(r_),
            b(b_)
        {}

        drectangle (
            const dlib::vector<double,2>& p
        ) :
            l(p.x()),
            t(p.y()),
            r(p.x()),
            b(p.y())
        {
        }

        template <typename T, typename U>
        drectangle (
            const vector<T,2>& p1,
            const vector<U,2>& p2
        )
        {
            *this = drectangle(p1) + drectangle(p2);
        }

        drectangle (
            const rectangle& rect
        ) : l(rect.left()), 
            t(rect.top()),
            r(rect.right()),
            b(rect.bottom()) {}

        operator rectangle (
        ) const
        {
            return rectangle((long)std::floor(l+0.5), 
                             (long)std::floor(t+0.5),
                             (long)std::floor(r+0.5),
                             (long)std::floor(b+0.5));
        }

        double left()   const { return l; }
        double top()    const { return t; }
        double right()  const { return r; }
        double bottom() const { return b; }

        double& left()   { return l; }
        double& top()    { return t; }
        double& right()  { return r; }
        double& bottom() { return b; }

        const dlib::vector<double,2> tl_corner (
        ) const { return dlib::vector<double,2>(left(), top()); }

        const dlib::vector<double,2> bl_corner (
        ) const { return dlib::vector<double,2>(left(), bottom()); } 

        const dlib::vector<double,2> tr_corner (
        ) const { return dlib::vector<double,2>(right(), top()); }

        const dlib::vector<double,2> br_corner (
        ) const { return dlib::vector<double,2>(right(), bottom()); }

        double width (
        ) const 
        { 
            if (is_empty())
                return 0;
            else
                return r - l + 1; 
        }

        double height (
        ) const 
        { 
            if (is_empty())
                return 0;
            else
                return b - t + 1; 
        }

        double area (
        ) const
        {
            return width()*height();
        }

        bool is_empty (
        ) const { return (t > b || l > r); }

        drectangle operator + (
            const drectangle& rhs
        ) const
        {
            if (rhs.is_empty())
                return *this;
            else if (is_empty())
                return rhs;

            return drectangle (
                std::min(l,rhs.l),
                std::min(t,rhs.t),
                std::max(r,rhs.r),
                std::max(b,rhs.b)
                );
        }

        drectangle intersect (
            const drectangle& rhs
        ) const
        {
            return drectangle (
                std::max(l,rhs.l),
                std::max(t,rhs.t),
                std::min(r,rhs.r),
                std::min(b,rhs.b)
                );
        }

        bool contains (
            const dlib::vector<double,2>& p
        ) const
        {
            if (p.x() < l || p.x() > r || p.y() < t || p.y() > b)
                return false;
            return true;
        }

        bool contains (
            const drectangle& rect
        ) const
        {
            if (rect.is_empty())
                return true;
            if (l <= rect.left() &&
                r >= rect.right() &&
                t <= rect.top() &&
                b >= rect.bottom())
                return true;
            return false;
        }

        drectangle& operator *= (
            const double& scale
        )
        {
            *this = *this*scale;
            return *this;
        }

        drectangle& operator /= (
            const double& scale
        )
        {
            *this = *this*(1.0/scale);
            return *this;
        }

        drectangle& operator += (
            const dlib::vector<double,2>& p
        )
        {
            *this = *this + drectangle(p);
            return *this;
        }


    private:
        double l;
        double t;
        double r;
        double b;
    };

// ----------------------------------------------------------------------------------------

    inline void serialize (
        const drectangle& item, 
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
            throw serialization_error(e.info + "\n   while serializing an object of type drectangle");
        }
    }

    inline void deserialize (
        drectangle& item, 
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
            throw serialization_error(e.info + "\n   while deserializing an object of type drectangle");
        }
    }

    inline std::ostream& operator<< (
        std::ostream& out, 
        const drectangle& item 
    )   
    {
        out << "[(" << item.left() << ", " << item.top() << ") (" << item.right() << ", " << item.bottom() << ")]";
        return out;
    }

    inline std::istream& operator>>(
        std::istream& in, 
        drectangle& item 
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

        dlib::vector<double,2> p1, p2;
        in >> p1;
        in >> p2;
        item = drectangle(p1) + drectangle(p2);

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

    inline dlib::vector<double,2> center (
        const drectangle& rect
    )
    {
        dlib::vector<double,2> temp(rect.left() + rect.right(),
                                    rect.top() + rect.bottom());

        return temp/2.0;
    }

    inline dlib::vector<double,2> dcenter (
        const drectangle& rect
    )
    {
        return center(rect);
    }

    inline drectangle operator* (
        const drectangle& rect,
        const double& scale 
    )
    {
        if (!rect.is_empty())
        {
            const double width = (rect.right()-rect.left())*scale;
            const double height = (rect.bottom()-rect.top())*scale;
            const dlib::vector<double,2> p = center(rect);
            return drectangle(p.x()-width/2, p.y()-height/2, p.x()+width/2, p.y()+height/2);
        }
        else
        {
            return rect;
        }
    }

    inline drectangle operator* (
        const double& scale,
        const drectangle& rect
    )
    {
        return rect*scale;
    }

    inline drectangle operator/ (
        const drectangle& rect,
        const double& scale
    )
    {
        return rect*(1.0/scale);
    }

    inline drectangle operator+ (
        const drectangle& r,
        const dlib::vector<double,2>& p
    )
    {
        return r + drectangle(p);
    }

    inline drectangle operator+ (
        const dlib::vector<double,2>& p,
        const drectangle& r
    )
    {
        return r + drectangle(p);
    }

    template <typename T>
    inline drectangle translate_rect (
        const drectangle& rect,
        const dlib::vector<T,2>& p
    )
    {
        drectangle result;
        result.top    () = rect.top()    + p.y();
        result.bottom () = rect.bottom() + p.y();
        result.left   () = rect.left()   + p.x();
        result.right  () = rect.right()  + p.x();
        return result;
    }

    inline drectangle intersect (
        const drectangle& a,
        const drectangle& b
    ) { return a.intersect(b); }

    inline double area (
        const drectangle& a
    ) { return a.area(); }

    inline drectangle centered_drect (
        const dlib::vector<double,2>& p,
        double width,
        double height
    )
    {
        width--;
        height--;

        return drectangle(p.x()-width/2, p.y()-height/2, p.x()+width/2, p.y()+height/2);
    }

    inline const drectangle shrink_rect (
        const drectangle& rect,
        double num 
    )
    {
        return drectangle(rect.left()+num, rect.top()+num, rect.right()-num, rect.bottom()-num);
    }

    inline const drectangle grow_rect (
        const drectangle& rect,
        double num 
    )
    {
        return shrink_rect(rect, -num);
    }

    inline const drectangle shrink_rect (
        const drectangle& rect,
        double width,
        double height
    )
    {
        return drectangle(rect.left()+width, rect.top()+height, rect.right()-width, rect.bottom()-height);
    }

    inline const drectangle grow_rect (
        const drectangle& rect,
        double width,
        double height
    )
    {
        return shrink_rect(rect, -width, -height);
    }

// ----------------------------------------------------------------------------------------

}

#endif // DLIB_DRECTANGLe_

