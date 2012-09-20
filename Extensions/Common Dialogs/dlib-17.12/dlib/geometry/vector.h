// Copyright (C) 2003  Davis E. King (davisking@users.sourceforge.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#ifndef DLIB_VECTOr_H_
#define DLIB_VECTOr_H_

#include <cmath>
#include "vector_abstract.h"
#include "../algs.h"
#include "../serialize.h"
#include <functional>
#include <iostream>
#include "../matrix/matrix.h"

namespace dlib
{
    class point;

    template <
        typename T
        >
    class vector
    {
        /*!
            INITIAL VALUE
                - x_value == 0
                - y_value == 0  
                - z_value == 0 

            CONVENTION
                - x_value == x() 
                - y_value == y() 
                - z_value == z()

        !*/

    public:

        typedef T type;
        
        vector (
        ) :
            x_value(0.0),
            y_value(0.0),
            z_value(0.0)
        {}

        // ---------------------------------------

        vector (
            const T _x,
            const T _y,
            const T _z
        ) :
            x_value(_x),
            y_value(_y),
            z_value(_z)
        {}

        // ---------------------------------------

        vector (
            const vector& v
        ) :
            x_value(v.x_value),
            y_value(v.y_value),
            z_value(v.z_value)
        {}

        // ---------------------------------------

        inline vector (
            const point& p
        );

        // ---------------------------------------

        template <typename EXP>
        vector ( const matrix_exp<EXP>& m)
        {
            // make sure requires clause is not broken
            DLIB_ASSERT((m.nr() == 1 || m.nc() == 1) && m.size() == 3,
                "\t vector(const matrix_exp& m)"
                << "\n\t the given matrix is of the wrong size"
                << "\n\t m.nr():   " << m.nr() 
                << "\n\t m.nc():   " << m.nc() 
                << "\n\t m.size(): " << m.size() 
                << "\n\t this: " << this
                );
            x_value = m(0);
            y_value = m(1);
            z_value = m(2);
        }

        template <long NR, long NC, typename MM>
        operator matrix<T,NR, NC, MM> () const
        {
            matrix<T,3,1> m;
            m(0) = x_value;
            m(1) = y_value;
            m(2) = z_value;
            return m;
        }

        // ---------------------------------------

        ~vector (
        ){}

        // ---------------------------------------

        T length(
        ) const 
        { 
            return (T)std::sqrt((double)(x_value*x_value + y_value*y_value + z_value*z_value)); 
        }

        // ---------------------------------------

        vector normalize (
        ) const 
        {
            T tmp = (T)std::sqrt((double)(x_value*x_value + y_value*y_value + z_value*z_value));
            return vector ( x_value/tmp,
                                     y_value/tmp,
                                     z_value/tmp
                                    );
        }

        // ---------------------------------------

        T& x (
        ) 
        { 
            return x_value; 
        }

        // ---------------------------------------

        T& y (
        ) 
        { 
            return y_value; 
        }

        // ---------------------------------------

        T& z (
        ) 
        { 
            return z_value; 
        }

        // ---------------------------------------

        const T& x (
        ) const
        { 
            return x_value; 
        }

        // ---------------------------------------

        const T& y (
        ) const 
        { 
            return y_value; 
        }

        // ---------------------------------------

        const T& z (
        ) const
        { 
            return z_value; 
        }

        // ---------------------------------------

        T dot (
            const vector& rhs
        ) const 
        { 
            return x_value*rhs.x_value + y_value*rhs.y_value + z_value*rhs.z_value; 
        }

        // ---------------------------------------

        vector cross (
            const vector& rhs
        ) const
        {
            return vector (
                y_value*rhs.z_value - z_value*rhs.y_value,
                z_value*rhs.x_value - x_value*rhs.z_value,
                x_value*rhs.y_value - y_value*rhs.x_value
                );
        }

        // ---------------------------------------

        vector operator+ (
            const vector& rhs
        ) const
        {
            return vector (
                x_value+rhs.x_value,
                y_value+rhs.y_value,
                z_value+rhs.z_value
            );
        }

        // ---------------------------------------

        vector operator- (
            const vector& rhs
        ) const
        {
            return vector (
                x_value-rhs.x_value,
                y_value-rhs.y_value,
                z_value-rhs.z_value
            );
        }

        // ---------------------------------------

        vector& operator= (
            const vector& rhs
        )
        {
            x_value = rhs.x_value;
            y_value = rhs.y_value;
            z_value = rhs.z_value;
            return *this;
        }

        // ---------------------------------------

        vector operator/ (
            const T rhs
        ) const
        {
            return vector (
                x_value/rhs,
                y_value/rhs,
                z_value/rhs
            );
        }

        // ---------------------------------------

        vector& operator += (
            const vector& rhs
        )
        {
            x_value += rhs.x_value;
            y_value += rhs.y_value;
            z_value += rhs.z_value;
            return *this;
        }

        // ---------------------------------------

        vector& operator -= (
            const vector& rhs
        )
        {
            x_value -= rhs.x_value;
            y_value -= rhs.y_value;
            z_value -= rhs.z_value;
            return *this;
        }

        // ---------------------------------------

        vector& operator *= (
            const T rhs
        )
        {
            x_value *= rhs;
            y_value *= rhs;
            z_value *= rhs;
            return *this;
        }

        // ---------------------------------------

        vector& operator /= (
            const T rhs
        )
        {
            x_value /= rhs;
            y_value /= rhs;
            z_value /= rhs;
            return *this;
        }

        // ---------------------------------------

        bool operator== (
            const vector& rhs
        ) const
        {
            return (x_value == rhs.x_value &&
                    y_value == rhs.y_value &&
                    z_value == rhs.z_value );
        }

        // ---------------------------------------

        bool operator!= (
            const vector& rhs
        ) const
        {
            return !((*this) == rhs);
        }

        // ---------------------------------------

        void swap (
            vector& item
        )
        {
            exchange(x_value,item.x_value);
            exchange(y_value,item.y_value);
            exchange(z_value,item.z_value);
        }

        // ---------------------------------------

        private:
            T x_value;
            T y_value;
            T z_value;

    };

// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------

    template<typename T, typename U>
    inline vector<T>  operator* (
        const vector<T> & lhs,
        const U rhs
    )
    {
        return vector<T>  (
            lhs.x()*rhs,
            lhs.y()*rhs,
            lhs.z()*rhs
        );
    }

// ----------------------------------------------------------------------------------------

    template<typename T, typename U>
    inline vector<T>  operator* (
        const U lhs,
        const vector<T> & rhs   
    ) { return rhs*lhs; }

// ----------------------------------------------------------------------------------------

    template<typename T>
    inline void swap (
        vector<T> & a, 
        vector<T> & b 
    ) { a.swap(b); }   

// ----------------------------------------------------------------------------------------

    template<typename T>
    inline void serialize (
        const vector<T> & item,  
        std::ostream& out
    )
    {
        try
        {
            serialize(item.x(),out);
            serialize(item.y(),out);
            serialize(item.z(),out);
        }
        catch (serialization_error e)
        { 
            throw serialization_error(e.info + "\n   while serializing object of type vector"); 
        }
    }

    template<typename T>
    inline void deserialize (
        vector<T> & item,  
        std::istream& in
    )
    {
        try
        {
            deserialize(item.x(),in);
            deserialize(item.y(),in);
            deserialize(item.z(),in);
        }
        catch (serialization_error e)
        { 
            item.x() = 0;
            item.y() = 0;
            item.z() = 0;
            throw serialization_error(e.info + "\n   while deserializing object of type vector"); 
        }
    }

// ----------------------------------------------------------------------------------------

    template<typename T>
    std::ostream& operator<< (
        std::ostream& out, 
        const vector<T>& item 
    )
    {
        out << "(" << item.x() << ", " << item.y() << ", " << item.z() << ")";
        return out;
    }

    template<typename T>
    std::istream& operator>>(
        std::istream& in, 
        vector<T>& item 
    )   
    {

        // eat all the crap up to the '(' 
        while (in.peek() == ' ' || in.peek() == '\t' || in.peek() == '\r' || in.peek() == '\n')
            in.get();

        // there should be a '(' if not then this is an error
        if (in.get() != '(')
        {
            in.setstate(in.rdstate() | std::ios::failbit);
            return in;
        }

        // eat all the crap up to the first number 
        while (in.peek() == ' ' || in.peek() == '\t')
            in.get();
        in >> item.x();

        if (!in.good())
            return in;
              
        // eat all the crap up to the next number
        while (in.peek() == ' ' || in.peek() == '\t' || in.peek() == ',')
            in.get();
        in >> item.y();

        if (!in.good())
            return in;
              
        // eat all the crap up to the next number
        while (in.peek() == ' ' || in.peek() == '\t' || in.peek() == ',')
            in.get();
        in >> item.z();

        if (!in.good())
            return in;
              
        // eat all the crap up to the ')'
        while (in.peek() == ' ' || in.peek() == '\t')
            in.get();

        // there should be a ')' if not then this is an error
        if (in.get() != ')')
            in.setstate(in.rdstate() | std::ios::failbit);
        return in;
    }

// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------

    class point
    {
        /*!
            INITIAL VALUE
                The initial value of this object is defined by its constructor.                

            CONVENTION
                - x_ == x()
                - y_ == y()
        !*/

    public:

        point (
        ) : x_(0), y_(0) {}

        point (
            long x__,
            long y__
        )
        {
            x_ = x__;
            y_ = y__;
        }

        point (
            const point& p
        )
        {
            x_ = p.x_;
            y_ = p.y_;
        }

        template <typename T>
        point (
            const vector<T>& v
        ) :
            x_(static_cast<long>(v.x()+0.5)),
            y_(static_cast<long>(v.y()+0.5))
        {}

        long x (
        ) const { return x_; }

        long y (
        ) const { return y_; }

        long& x (
        ) { return x_; }

        long& y (
        ) { return y_; }

        const point operator+ (
            const point& rhs
        ) const
        {
            return point(x()+rhs.x(), y()+rhs.y());
        }

        const point operator- (
            const point& rhs
        ) const
        {
            return point(x()-rhs.x(), y()-rhs.y());
        }

        point& operator= (
            const point& p
        )
        {
            x_ = p.x_;
            y_ = p.y_;
            return *this;
        }

        point& operator+= (
            const point& rhs
        )
        {
            x_ += rhs.x_;
            y_ += rhs.y_;
            return *this;
        }

        point& operator-= (
            const point& rhs
        )
        {
            x_ -= rhs.x_;
            y_ -= rhs.y_;
            return *this;
        }

        bool operator== (
            const point& p
        ) const { return p.x_ == x_ && p.y_ == y_; } 

        bool operator!= (
            const point& p
        ) const { return p.x_ != x_ || p.y_ != y_; } 

    private:
        long x_;
        long y_;
    };

// ----------------------------------------------------------------------------------------

    inline void serialize (
        const point& item, 
        std::ostream& out
    )
    {
        try
        {
            serialize(item.x(),out); 
            serialize(item.y(),out); 
        }
        catch (serialization_error& e)
        {
            throw serialization_error(e.info + "\n   while serializing an object of type point");
        }
    }

    inline void deserialize (
        point& item, 
        std::istream& in
    )
    {
        try
        {
            deserialize(item.x(),in); 
            deserialize(item.y(),in); 
        }
        catch (serialization_error& e)
        {
            throw serialization_error(e.info + "\n   while deserializing an object of type point");
        }
    }

    inline std::ostream& operator<< (
        std::ostream& out, 
        const point& item 
    )   
    {
        out << "(" << item.x() << ", " << item.y() << ")";
        return out;
    }

    inline std::istream& operator>>(
        std::istream& in, 
        point& item 
    )
    {
        // eat all the crap up to the '(' 
        while (in.peek() == ' ' || in.peek() == '\t' || in.peek() == '\r' || in.peek() == '\n')
            in.get();

        // there should be a '(' if not then this is an error
        if (in.get() != '(')
        {
            in.setstate(in.rdstate() | std::ios::failbit);
            return in;
        }

        // eat all the crap up to the first number 
        while (in.peek() == ' ' || in.peek() == '\t')
            in.get();

        bool is_negative = false;
        if (in.peek() == '-')
        {
            in.get();
            is_negative = true;
        }

        // read in the number and store it in item.x()
        item.x() = 0;
        while (in.peek() >= '0' && in.peek() <= '9')
        {
            long temp = in.get()-'0';
            item.x() = item.x()*10 + temp;
        }
        if (is_negative)
            item.x() *= -1; 

        if (!in.good())
            return in;
              
        // eat all the crap up to the next number
        while (in.peek() == ' ' || in.peek() == '\t' || in.peek() == ',')
            in.get();

        is_negative = false;
        if (in.peek() == '-')
        {
            in.get();
            is_negative = true;
        }


        // read in the number and store it in item.y()
        item.y() = 0;
        while (in.peek() >= '0' && in.peek() <= '9')
        {
            long temp = in.get()-'0';
            item.y() = item.y()*10 + temp;
        }
        if (is_negative)
            item.y() *= -1; 

        if (!in.good())
            return in;
              
        // eat all the crap up to the ')'
        while (in.peek() == ' ' || in.peek() == '\t')
            in.get();

        // there should be a ')' if not then this is an error
        if (in.get() != ')')
            in.setstate(in.rdstate() | std::ios::failbit);
        return in;
    }

// ----------------------------------------------------------------------------------------

    template <typename T>
    vector<T>::vector (
        const point& p
    ) :
        x_value(p.x()),
        y_value(p.y()),
        z_value(0)
    {}

// ----------------------------------------------------------------------------------------

}

namespace std
{
    /*!
        Define std::less<vector<T> > so that you can use vectors in the associative containers.
    !*/
    template<typename T>
    struct less<dlib::vector<T> > : public binary_function<dlib::vector<T> ,dlib::vector<T> ,bool>
    {
        inline bool operator() (const dlib::vector<T> & a, const dlib::vector<T> & b) const
        { 
            if      (a.x() < b.x()) return true;
            else if (a.x() > b.x()) return false;
            else if (a.y() < b.y()) return true;
            else if (a.y() > b.y()) return false;
            else if (a.z() < b.z()) return true;
            else if (a.z() > b.z()) return false;
            else                    return false;
        }
    };

    /*!
        Define std::less<point> so that you can use points in the associative containers.
    !*/
    template<>
    struct less<dlib::point> : public binary_function<dlib::point,dlib::point,bool>
    {
        inline bool operator() (const dlib::point& a, const dlib::point& b) const
        { 
            if      (a.x() < b.x()) return true;
            else if (a.x() > b.x()) return false;
            else if (a.y() < b.y()) return true;
            else if (a.y() > b.y()) return false;
            else                    return false;
        }
    };
}

#endif // DLIB_VECTOr_H_








