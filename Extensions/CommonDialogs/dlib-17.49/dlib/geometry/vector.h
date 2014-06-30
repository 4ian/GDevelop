// Copyright (C) 2003  Davis E. King (davis@dlib.net)
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
#include <limits>

#if defined(_MSC_VER) && _MSC_VER < 1400
// Despite my efforts to disabuse visual studio of its usual nonsense I can't find a 
// way to make this warning go away without just disabling it.   This is the warning:
//   dlib\geometry\vector.h(129) : warning C4805: '==' : unsafe mix of type 'std::numeric_limits<_Ty>::is_integer' and type 'bool' in operation
// 
#pragma warning(disable:4805)
#endif

namespace dlib
{

    template <
        typename T,
        long NR = 3
        >
    class vector;

// ----------------------------------------------------------------------------------------

    template <typename T, typename U, typename enabled = void> 
    struct vect_promote;

    template <typename T, typename U, bool res = (sizeof(T) <= sizeof(U))>
    struct largest_type
    {
        typedef T type;
    };
    template <typename T, typename U>
    struct largest_type<T,U,true>
    {
        typedef U type;
    };

    template <typename T, typename U> 
    struct vect_promote<T,U, typename enable_if_c<std::numeric_limits<T>::is_integer == std::numeric_limits<U>::is_integer>::type> 
    { 
        // If both T and U are both either integral or non-integral then just
        // use the biggest one
        typedef typename largest_type<T,U>::type type;
    };

    template <typename T, typename U> 
    struct vect_promote<T,U, typename enable_if_c<std::numeric_limits<T>::is_integer != std::numeric_limits<U>::is_integer>::type> 
    { 
        typedef double type;
    };

// ----------------------------------------------------------------------------------------

    // This insanity here is to work around a bug in visual studio 8.   These two rebind
    // structures are actually declared at a few points in this file because just having the
    // one declaration here isn't enough for visual studio.  It takes the three spread around
    // to avoid all its bugs. 
    template <typename T, long N>
    struct vc_rebind
    {
        typedef vector<T,N> type;
    };
    template <typename T, typename U, long N>
    struct vc_rebind_promote
    {
        typedef vector<typename vect_promote<T,U>::type,N> type;
    };

// ----------------------------------------------------------------------------------------

    template <typename T, typename U, typename enabled = void>
    struct vector_assign_helper
    {
        template <long NR>
        static void assign (
            vector<T,2>& dest,
            const vector<U,NR>& src
        )
        {
            dest.x() = static_cast<T>(src.x());
            dest.y() = static_cast<T>(src.y());
        }

        template <long NR>
        static void assign (
            vector<T,3>& dest,
            const vector<U,NR>& src
        )
        {
            dest.x() = static_cast<T>(src.x());
            dest.y() = static_cast<T>(src.y());
            dest.z() = static_cast<T>(src.z());
        }

        template <typename EXP>
        static void assign (
            vector<T,2>& dest,
            const matrix_exp<EXP>& m
        )
        {
            T x = static_cast<T>(m(0));
            T y = static_cast<T>(m(1));
            dest.x() = x;
            dest.y() = y;
        }

        template <typename EXP>
        static void assign (
            vector<T,3>& dest,
            const matrix_exp<EXP>& m
        )
        {
            T x = static_cast<T>(m(0));
            T y = static_cast<T>(m(1));
            T z = static_cast<T>(m(2));

            dest.x() = x;
            dest.y() = y;
            dest.z() = z;
        }
    };

    // This is an overload for the case where you are converting from a floating point
    // type to an integral type.  These overloads make sure values are rounded to 
    // the nearest integral value.
    template <typename T, typename U>
    struct vector_assign_helper<T,U, typename enable_if_c<std::numeric_limits<T>::is_integer == true && 
                                                          std::numeric_limits<U>::is_integer == false>::type>
    {
        template <long NR>
        static void assign (
            vector<T,2>& dest,
            const vector<U,NR>& src
        )
        {
            dest.x() = static_cast<T>(std::floor(src.x() + 0.5));
            dest.y() = static_cast<T>(std::floor(src.y() + 0.5));
        }

        template <long NR>
        static void assign (
            vector<T,3>& dest,
            const vector<U,NR>& src
        )
        {
            dest.x() = static_cast<T>(std::floor(src.x() + 0.5));
            dest.y() = static_cast<T>(std::floor(src.y() + 0.5));
            dest.z() = static_cast<T>(std::floor(src.z() + 0.5));
        }

        template <typename EXP>
        static void assign (
            vector<T,3>& dest,
            const matrix_exp<EXP>& m
        )
        {
            dest.x() = static_cast<T>(std::floor(m(0) + 0.5));
            dest.y() = static_cast<T>(std::floor(m(1) + 0.5));
            dest.z() = static_cast<T>(std::floor(m(2) + 0.5));
        }

        template <typename EXP>
        static void assign (
            vector<T,2>& dest,
            const matrix_exp<EXP>& m
        )
        {
            dest.x() = static_cast<T>(std::floor(m(0) + 0.5));
            dest.y() = static_cast<T>(std::floor(m(1) + 0.5));
        }

    };

// ----------------------------------------------------------------------------------------

    template <typename T>
    class vector<T,3> : public matrix<T,3,1>
    {
        /*!
            INITIAL VALUE
                - x() == 0
                - y() == 0
                - z() == 0

            CONVENTION
                - (*this)(0) == x() 
                - (*this)(1) == y() 
                - (*this)(2) == z() 

        !*/

        // This insanity here is to work around a bug in visual studio 8.  
        template <typename V, long N>
        struct vc_rebind
        {
            typedef vector<V,N> type;
        };
            template <typename V, typename U, long N>
        struct vc_rebind_promote
        {
            typedef vector<typename vect_promote<V,U>::type,N> type;
        };

    public:

        typedef T type;
        
        vector (
        ) 
        {
            x() = 0;
            y() = 0;
            z() = 0;
        }

        // ---------------------------------------

        vector (
            const T _x,
            const T _y,
            const T _z
        ) 
        {
            x() = _x;
            y() = _y;
            z() = _z;
        }

        // ---------------------------------------

        vector (
            const vector& item
        ) : matrix<T,3,1>(item)
        {
        }

        // ---------------------------------------

        template <typename U>
        vector (
            const vector<U,2>& item
        )
        {
            // Do this so that we get the appropriate rounding depending on the relative
            // type of T and U.
            vector<T,2> temp(item);
            x() = temp.x();
            y() = temp.y();
            z() = 0;
        }

        // ---------------------------------------

        vector (
            const vector<T,2>& item
        )
        {
            x() = item.x();
            y() = item.y();
            z() = 0;
        }

        // ---------------------------------------

        template <typename U>
        vector (
            const vector<U,3>& item
        )
        {
            (*this) = item;
        }

        // ---------------------------------------

        template <typename EXP>
        vector ( const matrix_exp<EXP>& m)
        {
            (*this) = m;
        }

        // ---------------------------------------

        template <typename EXP>
        vector& operator = (
            const matrix_exp<EXP>& m
        )
        {
            // you can only assign vectors with 3 elements to a dlib::vector<T,3> object
            COMPILE_TIME_ASSERT(EXP::NR*EXP::NC == 3 || EXP::NR*EXP::NC == 0);

            // make sure requires clause is not broken
            DLIB_ASSERT((m.nr() == 1 || m.nc() == 1) && (m.size() == 3),
                "\t vector(const matrix_exp& m)"
                << "\n\t the given matrix is of the wrong size"
                << "\n\t m.nr():   " << m.nr() 
                << "\n\t m.nc():   " << m.nc() 
                << "\n\t m.size(): " << m.size() 
                << "\n\t this: " << this
                );

            vector_assign_helper<T, typename EXP::type>::assign(*this, m);
            return *this;
        }

        // ---------------------------------------

        template <typename U, long N>
        vector& operator = (
            const vector<U,N>& item
        )
        {
            vector_assign_helper<T,U>::assign(*this, item);
            return *this;
        }

        // ---------------------------------------

        vector& operator= (
            const vector& item
        )
        {
            x() = item.x();
            y() = item.y();
            z() = item.z();
            return *this;
        }

        // ---------------------------------------

        double length(
        ) const 
        { 
            return std::sqrt((double)(x()*x() + y()*y() + z()*z())); 
        }

        // ---------------------------------------

        typename vc_rebind<double,3>::type normalize (
        ) const 
        {
            const double tmp = std::sqrt((double)(x()*x() + y()*y() + z()*z()));
            return vector<double,3> ( x()/tmp,
                                      y()/tmp,
                                      z()/tmp
            );
        }

        // ---------------------------------------

        T& x (
        ) 
        { 
            return (*this)(0);
        }

        // ---------------------------------------

        T& y (
        ) 
        { 
            return (*this)(1);
        }

        // ---------------------------------------

        T& z (
        ) 
        { 
            return (*this)(2);
        }

        // ---------------------------------------

        const T& x (
        ) const
        { 
            return (*this)(0);
        }

        // ---------------------------------------

        const T& y (
        ) const 
        { 
            return (*this)(1);
        }

        // ---------------------------------------

        const T& z (
        ) const
        { 
            return (*this)(2);
        }

        // ---------------------------------------

        T dot (
            const vector& rhs
        ) const 
        { 
            return x()*rhs.x() + y()*rhs.y() + z()*rhs.z();
        }

        // ---------------------------------------

        template <typename U, long N>
        typename vect_promote<T,U>::type dot (
            const vector<U,N>& rhs
        ) const 
        { 
            return x()*rhs.x() + y()*rhs.y() + z()*rhs.z();
        }

        // ---------------------------------------

        template <typename U, long N>
        typename vc_rebind_promote<T,U,3>::type cross (
            const vector<U,N>& rhs
        ) const
        {
            typedef vector<typename vect_promote<T,U>::type,3> ret_type;

            return ret_type (
                y()*rhs.z() - z()*rhs.y(),
                z()*rhs.x() - x()*rhs.z(),
                x()*rhs.y() - y()*rhs.x()
                );
        }

        // ---------------------------------------

        vector& operator += (
            const vector& rhs
        )
        {
            x() += rhs.x();
            y() += rhs.y();
            z() += rhs.z();
            return *this;
        }

        // ---------------------------------------

        vector& operator -= (
            const vector& rhs
        )
        {
            x() -= rhs.x();
            y() -= rhs.y();
            z() -= rhs.z();
            return *this;
        }

        // ---------------------------------------

        vector& operator /= (
            const T& rhs
        )
        {
            x() /= rhs;
            y() /= rhs;
            z() /= rhs;
            return *this;
        }

        // ---------------------------------------

        vector& operator *= (
            const T& rhs
        )
        {
            x() *= rhs;
            y() *= rhs;
            z() *= rhs;
            return *this;
        }

        // ---------------------------------------

        vector operator - (
        ) const
        {
            return vector(-x(), -y(), -z());
        }

        // ---------------------------------------

        template <typename U>
        typename vc_rebind_promote<T,U,3>::type operator / (
            const U& val
        ) const
        {
            typedef vector<typename vect_promote<T,U>::type,3> ret_type;
            return ret_type(x()/val, y()/val, z()/val);
        }

        // ---------------------------------------

        template <typename U, long NR2>
        bool operator== (
            const vector<U,NR2>& rhs
        ) const
        {
            return x()==rhs.x() && y()==rhs.y() && z()==rhs.z();
        }

        // ---------------------------------------

        template <typename U, long NR2>
        bool operator!= (
            const vector<U,NR2>& rhs
        ) const
        {
            return !(*this == rhs);
        }

        // ---------------------------------------

        void swap (
            vector& item
        )
        {
            dlib::exchange(x(), item.x());
            dlib::exchange(y(), item.y());
            dlib::exchange(z(), item.z());
        }

        // ---------------------------------------

    };

// ----------------------------------------------------------------------------------------

    template <typename T>
    class vector<T,2> : public matrix<T,2,1>
    {
        /*!
            INITIAL VALUE
                - x() == 0
                - y() == 0

            CONVENTION
                - (*this)(0) == x() 
                - (*this)(1) == y() 
                - z() == 0
        !*/

        // This insanity here is to work around a bug in visual studio 8.  
        template <typename V, long N>
        struct vc_rebind
        {
            typedef vector<V,N> type;
        };
            template <typename V, typename U, long N>
        struct vc_rebind_promote
        {
            typedef vector<typename vect_promote<V,U>::type,N> type;
        };


    public:

        typedef T type;
        
        vector (
        ) 
        {
            x() = 0;
            y() = 0;
        }

        // ---------------------------------------

        vector (
            const T _x,
            const T _y
        ) 
        {
            x() = _x;
            y() = _y;
        }

        // ---------------------------------------

        template <typename U>
        vector (
            const vector<U,3>& item
        )
        {
            // Do this so that we get the appropriate rounding depending on the relative
            // type of T and U.
            vector<T,3> temp(item);
            x() = temp.x();
            y() = temp.y();
        }

        // ---------------------------------------

        vector (
            const vector& item
        ) : matrix<T,2,1>(item)
        {
        }

        // ---------------------------------------

        vector (
            const vector<T,3>& item
        )
        {
            x() = item.x();
            y() = item.y();
        }

        // ---------------------------------------

        template <typename U>
        vector (
            const vector<U,2>& item
        )
        {
            (*this) = item;
        }

        // ---------------------------------------

        template <typename EXP>
        vector ( const matrix_exp<EXP>& m)
        {
            (*this) = m;
        }

        // ---------------------------------------

        template <typename EXP>
        vector& operator = (
            const matrix_exp<EXP>& m
        )
        {
            // you can only assign vectors with 2 elements to a dlib::vector<T,2> object
            COMPILE_TIME_ASSERT(EXP::NR*EXP::NC == 2 || EXP::NR*EXP::NC == 0);

            // make sure requires clause is not broken
            DLIB_ASSERT((m.nr() == 1 || m.nc() == 1) && (m.size() == 2),
                "\t vector(const matrix_exp& m)"
                << "\n\t the given matrix is of the wrong size"
                << "\n\t m.nr():   " << m.nr() 
                << "\n\t m.nc():   " << m.nc() 
                << "\n\t m.size(): " << m.size() 
                << "\n\t this: " << this
                );

            vector_assign_helper<T, typename EXP::type>::assign(*this, m);
            return *this;
        }

        // ---------------------------------------

        template <typename U, long N>
        vector& operator = (
            const vector<U,N>& item
        )
        {
            vector_assign_helper<T,U>::assign(*this, item);
            return *this;
        }

        // ---------------------------------------

        vector& operator= (
            const vector& item
        )
        {
            x() = item.x();
            y() = item.y();
            return *this;
        }

        // ---------------------------------------

        double length(
        ) const 
        { 
            return std::sqrt((double)(x()*x() + y()*y())); 
        }

        // ---------------------------------------


        typename vc_rebind<double,2>::type normalize (
        ) const 
        {
            const double tmp = std::sqrt((double)(x()*x() + y()*y()));
            return vector<double,2> ( x()/tmp,
                         y()/tmp
            );
        }

        // ---------------------------------------

        T& x (
        ) 
        { 
            return (*this)(0);
        }

        // ---------------------------------------

        T& y (
        ) 
        { 
            return (*this)(1);
        }

        // ---------------------------------------

        const T& x (
        ) const
        { 
            return (*this)(0);
        }

        // ---------------------------------------

        const T& y (
        ) const 
        { 
            return (*this)(1);
        }

        // ---------------------------------------

        const T z (
        ) const
        {
            return 0;
        }

        // ---------------------------------------

        T dot (
            const vector& rhs
        ) const 
        { 
            return x()*rhs.x() + y()*rhs.y();
        }

        // ---------------------------------------

        template <typename U, long N>
        typename vect_promote<T,U>::type dot (
            const vector<U,N>& rhs
        ) const 
        { 
            return x()*rhs.x() + y()*rhs.y() + z()*rhs.z();
        }

        // ---------------------------------------

        vector& operator += (
            const vector& rhs
        )
        {
            x() += rhs.x();
            y() += rhs.y();
            return *this;
        }

        // ---------------------------------------

        vector& operator -= (
            const vector& rhs
        )
        {
            x() -= rhs.x();
            y() -= rhs.y();
            return *this;
        }

        // ---------------------------------------

        vector& operator /= (
            const T& rhs
        )
        {
            x() /= rhs;
            y() /= rhs;
            return *this;
        }

        // ---------------------------------------

        vector& operator *= (
            const T& rhs
        )
        {
            x() *= rhs;
            y() *= rhs;
            return *this;
        }

        // ---------------------------------------

        vector operator - (
        ) const
        {
            return vector(-x(), -y());
        }

        // ---------------------------------------

        template <typename U>
        typename vc_rebind_promote<T,U,2>::type operator / (
            const U& val
        ) const
        {
            typedef vector<typename vect_promote<T,U>::type,2> ret_type;
            return ret_type(x()/val, y()/val);
        }

        // ---------------------------------------

        template <typename U, long NR2>
        bool operator== (
            const vector<U,NR2>& rhs
        ) const
        {
            return x()==rhs.x() && y()==rhs.y() && z()==rhs.z();
        }

        // ---------------------------------------

        bool operator== (
            const vector& rhs
        ) const
        {
            return x()==rhs.x() && y()==rhs.y();
        }

        // ---------------------------------------

        template <typename U, long NR2>
        bool operator!= (
            const vector<U,NR2>& rhs
        ) const
        {
            return !(*this == rhs);
        }

        // ---------------------------------------

        bool operator!= (
            const vector& rhs
        ) const
        {
            return !(*this == rhs);
        }

        // ---------------------------------------

        void swap (
            vector& item
        )
        {
            dlib::exchange(x(), item.x());
            dlib::exchange(y(), item.y());
        }

        // ---------------------------------------

        template <typename U, long N>
        typename vc_rebind_promote<T,U,3>::type cross (
            const vector<U,N>& rhs
        ) const
        {
            typedef vector<typename vect_promote<T,U>::type,3> ret_type;
            return ret_type (
                y()*rhs.z(),
                - x()*rhs.z(),
                x()*rhs.y() - y()*rhs.x()
                );
        }

        // ---------------------------------------

    };

// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------

    template <typename T, typename U>
    inline const typename vc_rebind_promote<T,U,2>::type operator+ (
        const vector<T,2>& lhs,
        const vector<U,2>& rhs 
    )
    {
        typedef typename vc_rebind_promote<T,U,2>::type ret_type;
        return ret_type(lhs.x()+rhs.x(), lhs.y()+rhs.y());
    }

// ----------------------------------------------------------------------------------------

    template <typename T, typename U>
    inline const typename vc_rebind_promote<T,U,3>::type operator+ (
        const vector<T,3>& lhs,
        const vector<U,3>& rhs 
    )
    {
        typedef typename vc_rebind_promote<T,U,3>::type ret_type;
        return ret_type(lhs.x()+rhs.x(), lhs.y()+rhs.y(), lhs.z()+rhs.z());
    }

// ----------------------------------------------------------------------------------------

    template <typename T, typename U>
    inline const typename vc_rebind_promote<T,U,3>::type operator+ (
        const vector<T,2>& lhs,
        const vector<U,3>& rhs 
    )
    {
        typedef typename vc_rebind_promote<T,U,3>::type ret_type;
        return ret_type(lhs.x()+rhs.x(), lhs.y()+rhs.y(), rhs.z());
    }

// ----------------------------------------------------------------------------------------

    template <typename T, typename U>
    inline const typename vc_rebind_promote<T,U,3>::type operator+ (
        const vector<T,3>& lhs,
        const vector<U,2>& rhs 
    )
    {
        typedef typename vc_rebind_promote<T,U,3>::type ret_type;
        return ret_type(lhs.x()+rhs.x(), lhs.y()+rhs.y(), lhs.z());
    }

// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------

    template <typename T, typename U>
    inline const typename vc_rebind_promote<T,U,2>::type operator- (
        const vector<T,2>& lhs,
        const vector<U,2>& rhs 
    )
    {
        typedef typename vc_rebind_promote<T,U,2>::type ret_type;
        return ret_type(lhs.x()-rhs.x(), lhs.y()-rhs.y());
    }

// ----------------------------------------------------------------------------------------

    template <typename T, typename U>
    inline const typename vc_rebind_promote<T,U,3>::type operator- (
        const vector<T,3>& lhs,
        const vector<U,3>& rhs 
    )
    {
        typedef typename vc_rebind_promote<T,U,3>::type ret_type;
        return ret_type(lhs.x()-rhs.x(), lhs.y()-rhs.y(), lhs.z()-rhs.z());
    }

// ----------------------------------------------------------------------------------------

    template <typename T, typename U>
    inline const typename vc_rebind_promote<T,U,3>::type operator- (
        const vector<T,2>& lhs,
        const vector<U,3>& rhs 
    )
    {
        typedef typename vc_rebind_promote<T,U,3>::type ret_type;
        return ret_type(lhs.x()-rhs.x(), lhs.y()-rhs.y(), -rhs.z());
    }

// ----------------------------------------------------------------------------------------

    template <typename T, typename U>
    inline const typename vc_rebind_promote<T,U,3>::type operator- (
        const vector<T,3>& lhs,
        const vector<U,2>& rhs 
    )
    {
        typedef typename vc_rebind_promote<T,U,3>::type ret_type;
        return ret_type(lhs.x()-rhs.x(), lhs.y()-rhs.y(), lhs.z());
    }

// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------

    template <typename T, typename U>
    inline typename disable_if<is_matrix<U>, const typename vc_rebind_promote<T,U,2>::type >::type operator* (
        const vector<T,2>& v,
        const U& s
    )
    {
        typedef typename vc_rebind_promote<T,U,2>::type ret_type;
        return ret_type(v.x()*s, v.y()*s);
    }

// ----------------------------------------------------------------------------------------

    template <typename T, typename U>
    inline typename disable_if<is_matrix<U>, const typename vc_rebind_promote<T,U,2>::type >::type operator* (
        const U& s,
        const vector<T,2>& v
    )
    {
        typedef typename vc_rebind_promote<T,U,2>::type ret_type;
        return ret_type(v.x()*s, v.y()*s);
    }

// ----------------------------------------------------------------------------------------

    template <typename T, typename U>
    inline typename disable_if<is_matrix<U>, const typename vc_rebind_promote<T,U,3>::type >::type operator* (
        const vector<T,3>& v,
        const U& s
    )
    {
        typedef typename vc_rebind_promote<T,U,3>::type ret_type;
        return ret_type(v.x()*s, v.y()*s, v.z()*s);
    }

// ----------------------------------------------------------------------------------------

    template <typename T, typename U>
    inline typename disable_if<is_matrix<U>, const typename vc_rebind_promote<T,U,3>::type >::type operator* (
        const U& s,
        const vector<T,3>& v
    )
    {
        typedef typename vc_rebind_promote<T,U,3>::type ret_type;
        return ret_type(v.x()*s, v.y()*s, v.z()*s);
    }

// ----------------------------------------------------------------------------------------

    template<typename T, long NR>
    inline void swap (
        vector<T,NR> & a, 
        vector<T,NR> & b 
    ) { a.swap(b); }   

// ----------------------------------------------------------------------------------------

    template<typename T>
    inline void serialize (
        const vector<T,3>& item,  
        std::ostream& out
    )
    {
        try
        {
            serialize(item.x(),out);
            serialize(item.y(),out);
            serialize(item.z(),out);
        }
        catch (serialization_error& e)
        { 
            throw serialization_error(e.info + "\n   while serializing object of type vector"); 
        }
    }

    template<typename T>
    inline void deserialize (
        vector<T,3>& item,  
        std::istream& in
    )
    {
        try
        {
            deserialize(item.x(),in);
            deserialize(item.y(),in);
            deserialize(item.z(),in);
        }
        catch (serialization_error& e)
        { 
            item.x() = 0;
            item.y() = 0;
            item.z() = 0;
            throw serialization_error(e.info + "\n   while deserializing object of type vector"); 
        }
    }

// ----------------------------------------------------------------------------------------

    template<typename T>
    inline void serialize (
        const vector<T,2>& item,  
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
            throw serialization_error(e.info + "\n   while serializing object of type vector"); 
        }
    }

    template<typename T>
    inline void deserialize (
        vector<T,2>& item,  
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
            item.x() = 0;
            item.y() = 0;
            throw serialization_error(e.info + "\n   while deserializing object of type vector"); 
        }
    }

// ----------------------------------------------------------------------------------------

    template<typename T>
    std::ostream& operator<< (
        std::ostream& out, 
        const vector<T,3>& item 
    )
    {
        out << "(" << item.x() << ", " << item.y() << ", " << item.z() << ")";
        return out;
    }

    template<typename T>
    std::istream& operator>>(
        std::istream& in, 
        vector<T,3>& item 
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


    template<typename T>
    std::ostream& operator<< (
        std::ostream& out, 
        const vector<T,2>& item 
    )
    {
        out << "(" << item.x() << ", " << item.y() << ")";
        return out;
    }

    template<typename T>
    std::istream& operator>>(
        std::istream& in, 
        vector<T,2>& item 
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
              
        // eat all the crap up to the ')'
        while (in.peek() == ' ' || in.peek() == '\t')
            in.get();

        // there should be a ')' if not then this is an error
        if (in.get() != ')')
            in.setstate(in.rdstate() | std::ios::failbit);
        return in;
    }

// ----------------------------------------------------------------------------------------

    typedef vector<long,2> point;

// ----------------------------------------------------------------------------------------

    class point_rotator
    {
    public:
        point_rotator (
            const double& angle
        )
        {
            sin_angle = std::sin(angle);
            cos_angle = std::cos(angle);
        }

        template <typename T>
        const dlib::vector<T,2> operator() (
            const dlib::vector<T,2>& p
        ) const
        {
            double x = cos_angle*p.x() - sin_angle*p.y();
            double y = sin_angle*p.x() + cos_angle*p.y();

            return dlib::vector<double,2>(x,y);
        }

    private:
        double sin_angle;
        double cos_angle;
    };

// ----------------------------------------------------------------------------------------

    class point_transform
    {
    public:
        point_transform (
            const double& angle,
            const dlib::vector<double,2>& translate_
        )
        {
            sin_angle = std::sin(angle);
            cos_angle = std::cos(angle);
            translate = translate_;
        }

        template <typename T>
        const dlib::vector<T,2> operator() (
            const dlib::vector<T,2>& p
        ) const
        {
            double x = cos_angle*p.x() - sin_angle*p.y();
            double y = sin_angle*p.x() + cos_angle*p.y();

            return dlib::vector<double,2>(x,y) + translate;
        }

    private:
        double sin_angle;
        double cos_angle;
        dlib::vector<double,2> translate;
    };

// ----------------------------------------------------------------------------------------

    class point_transform_affine
    {
    public:
        point_transform_affine (
            const matrix<double,2,2>& m_,
            const dlib::vector<double,2>& b_
        ) :m(m_), b(b_)
        {
        }

        const dlib::vector<double,2> operator() (
            const dlib::vector<double,2>& p
        ) const
        {
            return m*p + b;
        }

    private:
        matrix<double,2,2> m;
        dlib::vector<double,2> b;
    };

// ----------------------------------------------------------------------------------------

    template <typename T>
    const dlib::vector<T,2> rotate_point (
        const dlib::vector<T,2>& center,
        const dlib::vector<T,2>& p,
        double angle
    )
    {
        point_rotator rot(angle);
        return rot(p-center)+center;
    }

// ----------------------------------------------------------------------------------------

    inline matrix<double,2,2> rotation_matrix (
         double angle
    )
    {
        const double ca = std::cos(angle);
        const double sa = std::sin(angle);

        matrix<double,2,2> m;
        m = ca, -sa,
            sa, ca;
        return m;
    }

// ----------------------------------------------------------------------------------------

}

namespace std
{
    /*!
        Define std::less<vector<T,3> > so that you can use vectors in the associative containers.
    !*/
    template<typename T>
    struct less<dlib::vector<T,3> > : public binary_function<dlib::vector<T,3> ,dlib::vector<T,3> ,bool>
    {
        inline bool operator() (const dlib::vector<T,3> & a, const dlib::vector<T,3> & b) const
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
        Define std::less<vector<T,2> > so that you can use vector<T,2>s in the associative containers.
    !*/
    template<typename T>
    struct less<dlib::vector<T,2> > : public binary_function<dlib::vector<T,2> ,dlib::vector<T,2> ,bool>
    {
        inline bool operator() (const dlib::vector<T,2> & a, const dlib::vector<T,2> & b) const
        { 
            if      (a.x() < b.x()) return true;
            else if (a.x() > b.x()) return false;
            else if (a.y() < b.y()) return true;
            else if (a.y() > b.y()) return false;
            else                    return false;
        }
    };
}

#if defined(_MSC_VER) && _MSC_VER < 1400
// turn this warning back on
#pragma warning(default:4805)
#endif

#endif // DLIB_VECTOr_H_

