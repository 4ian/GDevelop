// Copyright (C) 2003  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#undef DLIB_VECTOR_ABSTRACT_
#ifdef DLIB_VECTOR_ABSTRACT_

#include "../serialize.h"
#include <functional>
#include <iostream>
#include "../matrix/matrix_abstract.h"

namespace dlib
{
    template <
        typename T,
        long NR = 3
        >
    class vector : public matrix<T,NR,1>
    {
        /*!
            REQUIREMENTS ON T
                T should be some object that provides an interface that is 
                compatible with double, float, int, long and the like.

            REQUIREMENTS ON NR
                NR == 3 || NR == 2

            INITIAL VALUE
                x() == 0 
                y() == 0 
                z() == 0

            WHAT THIS OBJECT REPRESENTS
                This object represents a three dimensional vector.  If NR == 2 then
                this object is limited to representing points on the XY plane where
                Z is set to 0.

                Also note that this object performs the appropriate integer and 
                floating point conversions and promotions when vectors of mixed
                type are used together.  For example:
                    vector<int,3> vi;
                    vector<double,2> vd;
                    vd + vi == a vector<double,3> object type since that is what
                               is needed to contain the result of vi+vd without
                               any loss of information.
        !*/

    public:

        typedef T type;
        
        vector (
        );
        /*!
            ensures
               - #*this has been properly initialized
        !*/

        vector (
            const T _x,
            const T _y,
            const T _z
        );
        /*!
            requires
                - NR == 3
            ensures
                - #x() == _x 
                - #y() == _y 
                - #z() == _z 
        !*/

        vector (
            const T _x,
            const T _y
        );
        /*!
            requires
                - NR == 2
            ensures
                - #x() == _x 
                - #y() == _y 
                - #z() == 0
        !*/

        template <typename U, long NRv>
        vector (
            const vector<U,NRv>& v
        );
        /*!
            ensures
                - Initializes *this with the contents of v and does any rounding if necessary and also 
                  takes care of converting between 2 and 3 dimensional vectors.
                - if (U is a real valued type like float or double and T is an integral type like long) then
                    - if (NR == 3) then
                        - #x() == floor(v.x() + 0.5)
                        - #y() == floor(v.y() + 0.5)
                        - #z() == floor(v.z() + 0.5)
                    - else // NR == 2
                        - #x() == floor(v.x() + 0.5)
                        - #y() == floor(v.y() + 0.5)
                        - #z() == 0
                - else
                    - if (NR == 3) then
                        - #x() == v.x() 
                        - #y() == v.y() 
                        - #z() == v.z() 
                    - else // NR == 2
                        - #x() == v.x() 
                        - #y() == v.y() 
                        - #z() == 0
        !*/

        template <typename EXP>
        vector ( 
            const matrix_exp<EXP>& m
        );
        /*!
            requires
                - m.size() == NR
                - m.nr() == 1 || m.nc() == 1 (i.e. m must be a row or column matrix)
            ensures
                - Initializes *this with the contents of m and does any rounding if necessary and also 
                  takes care of converting between 2 and 3 dimensional vectors.
                - if (m contains real valued values like float or double and T is an integral type like long) then
                    - #x() == floor(m(0) + 0.5)
                    - #y() == floor(m(1) + 0.5)
                    - if (NR == 3) then
                        - #z() == floor(m(2) + 0.5)
                    - else
                        - #z() == 0
                - else
                    - #x() == m(0)
                    - #y() == m(1)
                    - if (NR == 3) then
                        - #z() == m(2)
                    - else
                        - #z() == 0
        !*/

        ~vector (
        );
        /*!
            ensures
                - all resources associated with *this have been released
        !*/


        double length(
        ) const;
        /*!
            ensures
                - returns the length of the vector
        !*/

        T& x (
        );
        /*!
            ensures
                - returns a reference to the x component of the vector
        !*/

        T& y (
        );
        /*!
            ensures
                - returns a reference to the y component of the vector
        !*/

        T& z (
        );
        /*!
            requires
                - NR == 3 (this function actually doesn't exist when NR != 3)
            ensures
                - returns a reference to the z component of the vector
        !*/

        const T& x (
        ) const;
        /*!
            ensures
                - returns a const reference to the x component of the vector
        !*/

        const T& y (
        ) const;
        /*!
            ensures
                - returns a const reference to the y component of the vector
        !*/

        const T& z (
        ) const;
        /*!
            ensures
                - if (NR == 3) then
                    - returns a const reference to the z component of the vector
                - else
                    - return 0
                      (there isn't really a z in this case so we just return 0)
        !*/

        T dot (
            const vector& rhs
        ) const;
        /*!
            ensures
                - returns the result of the dot product between *this and rhs
        !*/

        vector<T,3> cross (
            const vector& rhs
        ) const;
        /*!
            ensures
                - returns the result of the cross product between *this and rhs
        !*/

        vector<double,NR> normalize (
        ) const;
        /*!
            ensures
                - returns a vector with length() == 1 and in the same direction as *this
        !*/

        vector operator+ (
            const vector& rhs
        ) const;
        /*!
            ensures
                - returns the result of adding *this to rhs
        !*/

        vector operator- (
            const vector& rhs
        ) const;
        /*!
            ensures
                - returns the result of subtracting rhs from *this
        !*/

        vector operator- (
        ) const;
        /*!
            ensures
                - returns -1*(*this) 
        !*/

        vector operator/ (
            const T rhs
        ) const;
        /*!
            ensures
                - returns the result of dividing *this by rhs 
        !*/

        vector& operator= (
            const vector& rhs
        );
        /*!
            ensures
                - #x() == rhs.x() 
                - #y() == rhs.y() 
                - #z() == rhs.z()
                - returns #*this
        !*/

        vector& operator += (
            const vector& rhs
        );
        /*!
            ensures
                - #*this == *this + rhs
                - returns #*this
        !*/

        vector& operator -= (
            const vector& rhs
        );
        /*!
            ensures
                - #*this == *this - rhs
                - returns #*this
        !*/

        vector& operator *= (
            const T rhs
        );
        /*!
            ensures
                - #*this == *this * rhs
                - returns #*this
        !*/

        vector& operator /= (
            const T rhs
        );
        /*!
            ensures
                - #*this == *this / rhs
                - returns #*this
        !*/

        template <typename U, long NR2>
        bool operator== (
            const vector<U,NR2>& rhs
        ) const;
        /*!
            ensures
                - if (x() == rhs.x() && y() == rhs.y() && z() == rhs.z()) then
                    - returns true
                - else
                    - returns false
        !*/

        template <typename U, long NR2>
        bool operator!= (
            const vector<U,NR2>& rhs
        ) const;
        /*!
            ensures
                - returns !((*this) == rhs)
        !*/

        void swap (
            vector& item
        );
        /*!
            ensures
                - swaps *this and item
        !*/

    };

// ----------------------------------------------------------------------------------------

    template<typename T, typename U, long NR>
    vector operator* (
        const vector<T,NR> & lhs,
        const U rhs
    );
    /*!
        ensures
            - returns the result of multiplying the scalar rhs by lhs
    !*/
    
    template<typename T, typename U, long NR>
    vector operator* (
        const U lhs,
        const vector<T,NR> & rhs   
    );
    /*! 
        ensures
            - returns the result of multiplying the scalar lhs by rhs
    !*/

    template<typename T, long NR>
    inline void swap (
        vector<T,NR> & a, 
        vector<T,NR> & b 
    ) { a.swap(b); }   
    /*!
        provides a global swap function
    !*/

    template<typename T, long NR>
    void serialize (
        const vector<T,NR>& item, 
        std::ostream& out
    );   
    /*!
        provides serialization support 
    !*/

    template<typename T, long NR>
    void deserialize (
        vector<T,NR>& item, 
        std::istream& in
    );   
    /*!
        provides deserialization support 
    !*/

    template<typename T>
    std::ostream& operator<< (
        std::ostream& out, 
        const vector<T,3>& item 
    );   
    /*!
        ensures
            - writes item to out in the form "(x, y, z)"
    !*/

    template<typename T>
    std::istream& operator>>(
        std::istream& in, 
        vector<T,3>& item 
    );   
    /*!
        ensures
            - reads a vector from the input stream in and stores it in #item.
              The data in the input stream should be of the form (x, y, z)
    !*/

    template<typename T>
    std::ostream& operator<< (
        std::ostream& out, 
        const vector<T,2>& item 
    );   
    /*!
        ensures
            - writes item to out in the form "(x, y)"
    !*/

    template<typename T>
    std::istream& operator>>(
        std::istream& in, 
        vector<T,2>& item 
    );   
    /*!
        ensures
            - reads a vector from the input stream in and stores it in #item.
              The data in the input stream should be of the form (x, y)
    !*/

// ----------------------------------------------------------------------------------------

    /*!A point
        This is just a typedef of the vector object. 
    !*/

    typedef vector<long,2> point;

// ----------------------------------------------------------------------------------------

    class point_transform_affine
    {
        /*!
            WHAT THIS OBJECT REPRESENTS
                This is an object that takes 2D points or vectors and 
                applies an affine transformation to them.
        !*/
    public:
        point_transform_affine (
            const matrix<double,2,2>& m,
            const dlib::vector<double,2>& b
        );
        /*!
            ensures
                - When (*this)(p) is invoked it will return a point P such that:
                    - P == m*p + b
        !*/

        const dlib::vector<double,2> operator() (
            const dlib::vector<double,2>& p
        ) const;
        /*!
            ensures
                - applies the affine transformation defined by this object's constructor
                  to p and returns the result.
        !*/

    };

// ----------------------------------------------------------------------------------------

    class point_transform
    {
        /*!
            WHAT THIS OBJECT REPRESENTS
                This is an object that takes 2D points or vectors and 
                rotates them around the origin by a given angle and then
                translates them.
        !*/
    public:
        point_transform (
            const double& angle,
            const dlib::vector<double,2>& translate
        )
        /*!
            ensures
                - When (*this)(p) is invoked it will return a point P such that:
                    - P is the point p rotated counter-clockwise around the origin 
                      angle radians and then shifted by having translate added to it.
                      (Note that this is counter clockwise with respect to the normal
                      coordinate system with positive y going up and positive x going
                      to the right)
        !*/

        template <typename T>
        const dlib::vector<T,2> operator() (
            const dlib::vector<T,2>& p
        ) const;
        /*!
            ensures
                - rotates p, then translates it and returns the result
        !*/
    };

// ----------------------------------------------------------------------------------------

    class point_rotator
    {
        /*!
            WHAT THIS OBJECT REPRESENTS
                This is an object that takes 2D points or vectors and 
                rotates them around the origin by a given angle.
        !*/
    public:
        point_rotator (
            const double& angle
        );
        /*!
            ensures
                - When (*this)(p) is invoked it will return a point P such that:
                    - P is the point p rotated counter-clockwise around the origin 
                      angle radians.
                      (Note that this is counter clockwise with respect to the normal
                      coordinate system with positive y going up and positive x going
                      to the right)
        !*/

        template <typename T>
        const dlib::vector<T,2> operator() (
            const dlib::vector<T,2>& p
        ) const;
        /*!
            ensures
                - rotates p and returns the result
        !*/
    };

// ----------------------------------------------------------------------------------------

    template <typename T>
    const dlib::vector<T,2> rotate_point (
        const dlib::vector<T,2> center,
        const dlib::vector<T,2> p,
        double angle
    );
    /*!
        ensures
            - returns a point P such that:
                - P is the point p rotated counter-clockwise around the given
                  center point by angle radians.
                  (Note that this is counter clockwise with respect to the normal
                  coordinate system with positive y going up and positive x going
                  to the right)
    !*/

// ----------------------------------------------------------------------------------------

    matrix<double,2,2> rotation_matrix (
         double angle
    );
    /*!
        ensures
            - returns a rotation matrix which rotates points around the origin in a
              counter-clockwise direction by angle radians.
              (Note that this is counter clockwise with respect to the normal
              coordinate system with positive y going up and positive x going
              to the right)
              Or in other words, this function returns a matrix M such that, given a
              point P, M*P gives a point which is P rotated by angle radians around
              the origin in a counter-clockwise direction.
    !*/

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

#endif // DLIB_VECTOR_ABSTRACT_

