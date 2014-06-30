// Copyright (C) 2003  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#undef DLIB_BIGINT_KERNEl_ABSTRACT_
#ifdef DLIB_BIGINT_KERNEl_ABSTRACT_

#include <iosfwd>
#include "../algs.h"
#include "../serialize.h"
#include "../uintn.h"

namespace dlib
{
    using namespace dlib::relational_operators; // defined in algs.h

    class bigint 
    {
        /*!
            INITIAL VALUE
                *this == 0

            WHAT THIS OBJECT REPRESENTS
                This object represents an arbitrary precision unsigned integer

                the following operators are supported:
                operator +
                operator +=
                operator -
                operator -=
                operator *
                operator *=
                operator /
                operator /=
                operator %
                operator %=
                operator ==
                operator <
                operator =
                operator << (for writing to ostreams)
                operator >> (for reading from istreams)
                operator++       // pre increment
                operator++(int)  // post increment
                operator--       // pre decrement
                operator--(int)  // post decrement


                the other comparason operators(>, !=, <=, and >=) are 
                available and come from the templates in dlib::relational_operators

            THREAD SAFETY
                bigint may be reference counted so it is very unthread safe.
                use with care in a multithreaded program

        !*/

    public:

        bigint (
        );
        /*!
            ensures
                - #*this is properly initialized
            throws
                - std::bad_alloc
                    if this is thrown the bigint will be unusable but 
                    will not leak memory
        !*/

        bigint (
            uint32 value
        );
        /*!
            requires
                - value <= (2^32)-1
            ensures
                - #*this is properly initialized
                - #*this == value
            throws
                - std::bad_alloc
                    if this is thrown the bigint will be unusable but 
                    will not leak memory
        !*/

        bigint (
            const bigint& item
        );
        /*!
            ensures
                - #*this is properly initialized 
                - #*this == value
            throws
                - std::bad_alloc
                    if this is thrown the bigint will be unusable but 
                    will not leak memory
        !*/

        virtual ~bigint (
        );
        /*!
            ensures
                - all resources associated with #*this have been released
        !*/

        const bigint operator+ (
            const bigint& rhs
        ) const;
        /*!
            ensures
                - returns the result of adding rhs to *this
            throws
                - std::bad_alloc
                    if this function throws then it has no effect
        !*/

        bigint& operator+= (
            const bigint& rhs
        );
        /*!
            ensures
                - #*this == *this + rhs
                - returns #*this
            throws
                - std::bad_alloc
                    if this function throws then it has no effect                                        
        !*/

        const bigint operator- (
            const bigint& rhs
        ) const;
        /*!
            requires
                - *this >= rhs
            ensures
                - returns the result of subtracting rhs from *this
            throws
                - std::bad_alloc
                    if this function throws then it has no effect
        !*/

        bigint& operator-= (
            const bigint& rhs
        );
        /*!
            requires
                - *this >= rhs            
            ensures
                - #*this == *this - rhs
                - returns #*this
            throws
                - std::bad_alloc
                    if this function throws then it has no effect
        !*/

        const bigint operator* (
            const bigint& rhs
        ) const;
        /*!
            ensures
                - returns the result of multiplying *this and rhs
            throws
                - std::bad_alloc
                    if this function throws then it has no effect
        !*/

        bigint& operator*= (
            const bigint& rhs
        );
        /*!
            ensures
                - #*this == *this * rhs
                - returns #*this
            throws
                - std::bad_alloc
                    if this function throws then it has no effect
        !*/

        const bigint operator/ (
            const bigint& rhs
        ) const;
        /*!
            requires
                - rhs != 0
            ensures
                - returns the result of dividing *this by rhs
            throws
                - std::bad_alloc
                    if this function throws then it has no effect
        !*/

        bigint& operator/= (
            const bigint& rhs
        );
        /*!
            requires
                - rhs != 0
            ensures
                - #*this == *this / rhs
                - returns #*this
            throws
                - std::bad_alloc
                    if this function throws then it has no effect
        !*/

        const bigint operator% (
            const bigint& rhs
        ) const;
        /*!
            requires
                - rhs != 0
            ensures
                - returns the result of *this mod rhs
            throws
                - std::bad_alloc
                    if this function throws then it has no effect
        !*/

        bigint& operator%= (
            const bigint& rhs
        );
        /*!
            requires
                - rhs != 0
            ensures
                - #*this == *this % rhs
                - returns #*this
            throws
                - std::bad_alloc
                    if this function throws then it has no effect
        !*/

        bool operator < (
            const bigint& rhs
        ) const;
        /*!
            ensures
                - returns true if *this is less than rhs 
                - returns false otherwise
        !*/

        bool operator == (
            const bigint& rhs
        ) const;
        /*!
            ensures
                - returns true if *this and rhs represent the same number 
                - returns false otherwise
        !*/

        bigint& operator= (
            const bigint& rhs
        );
        /*!
            ensures
                - #*this == rhs
            throws
                - std::bad_alloc
                    if this function throws then it has no effect
        !*/


        friend std::ostream& operator<< (
            std::ostream& out,
            const bigint& rhs
        );
        /*!
            ensures
                - the number in *this has been written to #out as a base ten number
            throws
                - std::bad_alloc
                    if this function throws then it has no effect (nothing
                    is written to out)
        !*/

        friend std::istream& operator>> (
            std::istream& in,
            bigint& rhs
        );
        /*!
            ensures
                - reads a number from in and puts it into #*this 
                - if (there is no positive base ten number on the input stream ) then 
                    - #in.fail() == true
            throws
                - std::bad_alloc
                    if this function throws the value in rhs is undefined and some
                    characters may have been read from in.  rhs is still usable though,
                    its value is just unknown.
        !*/


        bigint& operator++ (
        );
        /*!
            ensures
                - #*this == *this + 1 
                - returns #*this
            throws
                - std::bad_alloc
                    if this function throws then it has no effect
        !*/

        const bigint operator++ (
            int
        );
        /*!
            ensures
                - #*this == *this + 1
                - returns *this
            throws
                - std::bad_alloc
                    if this function throws then it has no effect
        !*/

        bigint& operator-- (
        );
        /*! 
            requires
                - *this != 0
            ensures
                - #*this == *this - 1
                - returns #*this
            throws
                - std::bad_alloc
                    if this function throws then it has no effect
        !*/

        const bigint operator-- (
            int
        );
        /*!
            requires
                - *this != 0
            ensures
                - #*this == *this - 1
                - returns *this
            throws
                - std::bad_alloc
                    if this function throws then it has no effect
        !*/

        void swap (
            bigint& item
        );
        /*!
            ensures
                - swaps *this and item
        !*/ 


        // ------------------------------------------------------------------
        // ----    The following functions are identical to the above   -----
        // ----  but take uint16 as one of their arguments. They  ---
        // ----  exist only to allow for a more efficient implementation  ---
        // ------------------------------------------------------------------


        friend const bigint operator+ (
            uint16 lhs,
            const bigint& rhs
        );
        /*!
            requires
                - lhs <= 65535
            ensures
                - returns the result of adding rhs to lhs
            throws
                - std::bad_alloc
                    if this function throws then it has no effect
        !*/

        friend const bigint operator+ (
            const bigint& lhs,
            uint16 rhs
        );
        /*!
            requires
                - rhs <= 65535
            ensures
                - returns the result of adding rhs to lhs
            throws
                - std::bad_alloc
                    if this function throws then it has no effect
        !*/

        bigint& operator+= (
            uint16 rhs
        );
        /*!
            requires
                - rhs <= 65535
            ensures
                - #*this == *this + rhs                
                - returns #this
            throws
                - std::bad_alloc
                    if this function throws then it has no effect
        !*/

        friend const bigint operator- (
            uint16 lhs,
            const bigint& rhs
        );
        /*!
            requires
                - lhs >= rhs 
                - lhs <= 65535
            ensures
                - returns the result of subtracting rhs from lhs
            throws
                - std::bad_alloc
                    if this function throws then it has no effect
        !*/

        friend const bigint operator- (
            const bigint& lhs,
            uint16 rhs
        );
        /*!
            requires
                - lhs >= rhs 
                - rhs <= 65535
            ensures
                - returns the result of subtracting rhs from lhs
            throws
                - std::bad_alloc
                    if this function throws then it has no effect
        !*/

        bigint& operator-= (
            uint16 rhs
        );
        /*!
            requires
                - *this >= rhs 
                - rhs <= 65535
            ensures
                - #*this == *this - rhs
                - returns #*this
            throws
                - std::bad_alloc
                    if this function throws then it has no effect
        !*/

        friend const bigint operator* (
            uint16 lhs,
            const bigint& rhs
        );
        /*!
            requires
                - lhs <= 65535
            ensures
                - returns the result of multiplying lhs and rhs
            throws
                - std::bad_alloc
                    if this function throws then it has no effect
        !*/

        friend const bigint operator* (
            const bigint& lhs,
            uint16 rhs
        );
        /*!
            requires
                - rhs <= 65535
            ensures
                - returns the result of multiplying lhs and rhs
            throws
                - std::bad_alloc
                    if this function throws then it has no effect
        !*/

        bigint& operator*= (
            uint16 rhs
        );
        /*!
            requires
                - rhs <= 65535
            ensures
                - #*this == *this * rhs
                - returns #*this
            throws
                - std::bad_alloc
                    if this function throws then it has no effect
        !*/

        friend const bigint operator/ (
            uint16 lhs,
            const bigint& rhs
        );
        /*!
            requires
                - rhs != 0 
                - lhs <= 65535
            ensures
                - returns the result of dividing lhs by rhs
            throws
                - std::bad_alloc
                    if this function throws then it has no effect
        !*/

        friend const bigint operator/ (
            const bigint& lhs,
            uint16 rhs
        );
        /*!
            requires
                - rhs != 0 
                - rhs <= 65535
            ensures
                - returns the result of dividing lhs by rhs
            throws
                - std::bad_alloc
                    if this function throws then it has no effect
        !*/

        bigint& operator/= (
            uint16 rhs
        );
        /*!
            requires
                - rhs != 0 
                - rhs <= 65535
            ensures
                - #*this == *this / rhs
                - returns #*this
            throws
                - std::bad_alloc
                    if this function throws then it has no effect
        !*/

        friend const bigint operator% (
            uint16 lhs,
            const bigint& rhs
        );
        /*!
            requires
                - rhs != 0 
                - lhs <= 65535
            ensures
                - returns the result of lhs mod rhs
            throws
                - std::bad_alloc
                    if this function throws then it has no effect
        !*/

        friend const bigint operator% (
            const bigint& lhs,
            uint16 rhs
        );
        /*!
            requires
                - rhs != 0 
                - rhs <= 65535
            ensures
                - returns the result of lhs mod rhs
            throws
                - std::bad_alloc
                    if this function throws then it has no effect
        !*/

        bigint& operator%= (
            uint16 rhs
        );
        /*!
            requires
                - rhs != 0 
                - rhs <= 65535
            ensures
                - #*this == *this % rhs
                - returns #*this
            throws
                - std::bad_alloc
                    if this function throws then it has no effect
        !*/


        friend bool operator < (
            uint16 lhs,
            const bigint& rhs
        );
        /*!
            requires
                - lhs <= 65535
            ensures
                - returns true if lhs is less than rhs 
                - returns false otherwise
        !*/

        friend bool operator < (
            const bigint& lhs,
            uint16 rhs
        );
        /*!
            requires
                - rhs <= 65535
            ensures
                - returns true if lhs is less than rhs 
                - returns false otherwise
        !*/

        friend bool operator == (
            const bigint& lhs,
            uint16 rhs
        );
        /*!
            requires
                - rhs <= 65535
            ensures
                - returns true if lhs and rhs represent the same number 
                - returns false otherwise
        !*/

        friend bool operator == (
            uint16 lhs,
            const bigint& rhs
        );
        /*!
            requires
                - lhs <= 65535
            ensures
                - returns true if lhs and rhs represent the same number 
                - returns false otherwise
        !*/

        bigint& operator= (
            uint16 rhs
        );
        /*!
            requires
                - rhs <= 65535
            ensures
                - #*this == rhs
                - returns #*this
            throws
                - std::bad_alloc
                    if this function throws then it has no effect
        !*/

    };   
   
    inline void swap (
        bigint& a, 
        bigint& b 
    ) { a.swap(b); }   
    /*!
        provides a global swap function
    !*/

    void serialize (
        const bigint& item, 
        std::istream& in
    );   
    /*!
        provides serialization support 
    !*/

    void deserialize (
        bigint& item, 
        std::istream& in
    );   
    /*!
        provides deserialization support 
    !*/

}

#endif // DLIB_BIGINT_KERNEl_ABSTRACT_

