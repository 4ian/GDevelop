// Copyright (C) 2003  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#ifndef DLIB_BIGINT_KERNEl_C_
#define DLIB_BIGINT_KERNEl_C_

#include "bigint_kernel_abstract.h"
#include "../algs.h"
#include "../assert.h"
#include <iostream>

namespace dlib
{

// ----------------------------------------------------------------------------------------

    template <
        typename bigint_base
        >
    class bigint_kernel_c 
    {
        bigint_base data;

        explicit bigint_kernel_c (
            const bigint_base& item
        ) : data(item) {}

    public:


        bigint_kernel_c (
        );

        bigint_kernel_c (
            uint32 value
        );

        bigint_kernel_c (
            const bigint_kernel_c<bigint_base>& item
        );

        ~bigint_kernel_c (
        );

        const bigint_kernel_c<bigint_base> operator+ (
            const bigint_kernel_c<bigint_base>& rhs
        ) const;

        bigint_kernel_c<bigint_base>& operator+= (
            const bigint_kernel_c<bigint_base>& rhs
        );

        const bigint_kernel_c<bigint_base> operator- (
            const bigint_kernel_c<bigint_base>& rhs
        ) const;
        bigint_kernel_c<bigint_base>& operator-= (
            const bigint_kernel_c<bigint_base>& rhs
        );

        const bigint_kernel_c<bigint_base> operator* (
            const bigint_kernel_c<bigint_base>& rhs
        ) const;

        bigint_kernel_c<bigint_base>& operator*= (
            const bigint_kernel_c<bigint_base>& rhs
        );

        const bigint_kernel_c<bigint_base> operator/ (
            const bigint_kernel_c<bigint_base>& rhs
        ) const;

        bigint_kernel_c<bigint_base>& operator/= (
            const bigint_kernel_c<bigint_base>& rhs
        );

        const bigint_kernel_c<bigint_base> operator% (
            const bigint_kernel_c<bigint_base>& rhs
        ) const;

        bigint_kernel_c<bigint_base>& operator%= (
            const bigint_kernel_c<bigint_base>& rhs
        );

        bool operator < (
            const bigint_kernel_c<bigint_base>& rhs
        ) const;

        bool operator == (
            const bigint_kernel_c<bigint_base>& rhs
        ) const;

        bigint_kernel_c<bigint_base>& operator= (
            const bigint_kernel_c<bigint_base>& rhs
        );

        template <typename T>
        friend std::ostream& operator<< (
            std::ostream& out,
            const bigint_kernel_c<T>& rhs
        );

        template <typename T>
        friend std::istream& operator>>  (
            std::istream& in,
            bigint_kernel_c<T>& rhs
        );

        bigint_kernel_c<bigint_base>& operator++ (
        );

        const bigint_kernel_c<bigint_base> operator++ (
            int
        );

        bigint_kernel_c<bigint_base>& operator-- (
        );

        const bigint_kernel_c<bigint_base> operator-- (
            int
        );

        template <typename T>
        friend const bigint_kernel_c<T> operator+  (
            uint16 lhs,
            const bigint_kernel_c<T>& rhs
        );

        template <typename T>
        friend const bigint_kernel_c<T> operator+  (
            const bigint_kernel_c<T>& lhs,
            uint16 rhs
        );

        bigint_kernel_c<bigint_base>& operator+= (
            uint16 rhs
        );

        template <typename T>
        friend const bigint_kernel_c<T> operator-  (
            uint16 lhs,
            const bigint_kernel_c<T>& rhs
        );

        template <typename T>
        friend const bigint_kernel_c<T> operator-  (
            const bigint_kernel_c<T>& lhs,
            uint16 rhs
        );

        bigint_kernel_c<bigint_base>& operator-= (
            uint16 rhs
        );

        template <typename T>
        friend const bigint_kernel_c<T> operator*  (
            uint16 lhs,
            const bigint_kernel_c<T>& rhs
        );

        template <typename T>
        friend const bigint_kernel_c<T> operator*  (
            const bigint_kernel_c<T>& lhs,
            uint16 rhs
        );

        bigint_kernel_c<bigint_base>& operator*= (
            uint16 rhs
        );

        template <typename T>
        friend const bigint_kernel_c<T> operator/  (
            uint16 lhs,
            const bigint_kernel_c<T>& rhs
        );

        template <typename T>
        friend const bigint_kernel_c<T> operator/  (
            const bigint_kernel_c<T>& lhs,
            uint16 rhs
        );

        bigint_kernel_c<bigint_base>& operator/= (
            uint16 rhs
        );

        template <typename T>
        friend const bigint_kernel_c<T> operator%  (
            uint16 lhs,
            const bigint_kernel_c<T>& rhs
        );

        template <typename T>
        friend const bigint_kernel_c<T> operator%  (
            const bigint_kernel_c<T>& lhs,
            uint16 rhs
        );

        bigint_kernel_c<bigint_base>& operator%= (
            uint16 rhs
        );

        template <typename T>
        friend bool operator <  (
            uint16 lhs,
            const bigint_kernel_c<T>& rhs
        );

        template <typename T>
        friend bool operator <  (
            const bigint_kernel_c<T>& lhs,
            uint16 rhs
        );

        template <typename T>
        friend bool operator ==  (
            const bigint_kernel_c<T>& lhs,
            uint16 rhs
        );

        template <typename T>
        friend bool operator ==  (
            uint16 lhs,
            const bigint_kernel_c<T>& rhs
        );

        bigint_kernel_c<bigint_base>& operator= (
            uint16 rhs
        );


        void swap (
            bigint_kernel_c<bigint_base>& item
        ) { data.swap(item.data); }

    };

    template <
        typename bigint_base
        >
    void swap (
        bigint_kernel_c<bigint_base>& a,
        bigint_kernel_c<bigint_base>& b
    ) { a.swap(b); }


// ----------------------------------------------------------------------------------------

    template <
        typename bigint_base
        >
    inline void serialize (
        const bigint_kernel_c<bigint_base>& item, 
        std::ostream& out
    )
    { 
        std::ios::fmtflags oldflags = out.flags();  
        out.flags(); 
        out << item << ' '; 
        out.flags(oldflags); 
        if (!out) throw serialization_error("Error serializing object of type bigint_kernel_c"); 
    }   

    template <
        typename bigint_base
        >
    inline void deserialize (
        bigint_kernel_c<bigint_base>& item, 
        std::istream& in
    ) 
    { 
        std::ios::fmtflags oldflags = in.flags();  
        in.flags(); 
        in >> item; in.flags(oldflags); 
        if (in.get() != ' ') 
        {
            item = 0;
            throw serialization_error("Error deserializing object of type bigint_kernel_c"); 
        }
    }   

// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------
    // member function definitions
// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------

    template <
        typename bigint_base
        >
    bigint_kernel_c<bigint_base>::
    bigint_kernel_c (
    )
    {}

// ----------------------------------------------------------------------------------------

    template <
        typename bigint_base
        >
    bigint_kernel_c<bigint_base>::
    bigint_kernel_c (
        uint32 value
    ) : 
        data(value)
    {
        // make sure requires clause is not broken
        DLIB_CASSERT( value <= 0xFFFFFFFF ,
            "\tbigint::bigint(uint16)"
            << "\n\t value must be <= (2^32)-1"
            << "\n\tthis:  " << this
            << "\n\tvalue:   " << value
            );        
    }

// ----------------------------------------------------------------------------------------

    template <
        typename bigint_base
        >
    bigint_kernel_c<bigint_base>::
    bigint_kernel_c (
        const bigint_kernel_c<bigint_base>& item
    ) :
        data(item.data)
    {}

// ----------------------------------------------------------------------------------------

    template <
        typename bigint_base
        >
    bigint_kernel_c<bigint_base>::
    ~bigint_kernel_c (
    )
    {}

// ----------------------------------------------------------------------------------------

    template <
        typename bigint_base
        >
    const bigint_kernel_c<bigint_base> bigint_kernel_c<bigint_base>::
    operator+ (
        const bigint_kernel_c<bigint_base>& rhs
    ) const
    {
        return bigint_kernel_c<bigint_base>(data + rhs.data);
    }

// ----------------------------------------------------------------------------------------

    template <
        typename bigint_base
        >
    bigint_kernel_c<bigint_base>& bigint_kernel_c<bigint_base>::
    operator+= (
        const bigint_kernel_c<bigint_base>& rhs
    )
    {
        data += rhs.data;
        return *this;
    }

// ----------------------------------------------------------------------------------------

    template <
        typename bigint_base
        >
    const bigint_kernel_c<bigint_base> bigint_kernel_c<bigint_base>::
    operator- (
        const bigint_kernel_c<bigint_base>& rhs
    ) const
    {
        // make sure requires clause is not broken
        DLIB_CASSERT( !(*this < rhs),
            "\tconst bigint bigint::operator-(const bigint&)"
            << "\n\t *this should not be less than rhs"
            << "\n\tthis:  " << this
            << "\n\t*this: " << *this 
            << "\n\trhs:   " << rhs
            );

        // call the real function
        return bigint_kernel_c<bigint_base>(data-rhs.data);
    }

// ----------------------------------------------------------------------------------------

    template <
        typename bigint_base
        >
    bigint_kernel_c<bigint_base>& bigint_kernel_c<bigint_base>::
    operator-= (
        const bigint_kernel_c<bigint_base>& rhs
    )
    {
        // make sure requires clause is not broken
        DLIB_CASSERT( !(*this < rhs),
            "\tbigint& bigint::operator-=(const bigint&)"
            << "\n\t *this should not be less than rhs"
            << "\n\tthis:  " << this
            << "\n\t*this: " << *this 
            << "\n\trhs:   " << rhs
            );

        // call the real function
        data -= rhs.data;
        return *this;
    }

// ----------------------------------------------------------------------------------------

    template <
        typename bigint_base
        >
    const bigint_kernel_c<bigint_base> bigint_kernel_c<bigint_base>::
    operator* (
        const bigint_kernel_c<bigint_base>& rhs
    ) const
    {
        return bigint_kernel_c<bigint_base>(data * rhs.data );
    }

// ----------------------------------------------------------------------------------------

    template <
        typename bigint_base
        >
    bigint_kernel_c<bigint_base>& bigint_kernel_c<bigint_base>::
    operator*= (
        const bigint_kernel_c<bigint_base>& rhs
    )
    {
        data *= rhs.data;
        return *this;
    }

// ----------------------------------------------------------------------------------------

    template <
        typename bigint_base
        >
    const bigint_kernel_c<bigint_base> bigint_kernel_c<bigint_base>::
    operator/ (
        const bigint_kernel_c<bigint_base>& rhs
    ) const
    {
        //make sure requires clause is not broken
        DLIB_CASSERT( !(rhs == 0),
            "\tconst bigint bigint::operator/(const bigint&)"
            << "\n\t can't divide by zero"
            << "\n\tthis:  " << this
            );

        // call the real function
        return bigint_kernel_c<bigint_base>(data/rhs.data);
    }

// ----------------------------------------------------------------------------------------

    template <
        typename bigint_base
        >
    bigint_kernel_c<bigint_base>& bigint_kernel_c<bigint_base>::
    operator/= (
        const bigint_kernel_c<bigint_base>& rhs
    )
    {
        // make sure requires clause is not broken
        DLIB_CASSERT( !(rhs == 0),
            "\tbigint& bigint::operator/=(const bigint&)"
            << "\n\t can't divide by zero"
            << "\n\tthis:  " << this
            );

        // call the real function
        data /= rhs.data;
        return *this;
    }

// ----------------------------------------------------------------------------------------

    template <
        typename bigint_base
        >
    const bigint_kernel_c<bigint_base> bigint_kernel_c<bigint_base>::
    operator% (
        const bigint_kernel_c<bigint_base>& rhs
    ) const
    {
        // make sure requires clause is not broken
        DLIB_CASSERT( !(rhs == 0),
            "\tconst bigint bigint::operator%(const bigint&)"
            << "\n\t can't divide by zero"
            << "\n\tthis:  " << this
            );

        // call the real function
        return bigint_kernel_c<bigint_base>(data%rhs.data);
    }

// ----------------------------------------------------------------------------------------

    template <
        typename bigint_base
        >
    bigint_kernel_c<bigint_base>& bigint_kernel_c<bigint_base>::
    operator%= (
        const bigint_kernel_c<bigint_base>& rhs
    )
    {
        // make sure requires clause is not broken
        DLIB_CASSERT( !(rhs == 0),
            "\tbigint& bigint::operator%=(const bigint&)"
            << "\n\t can't divide by zero"
            << "\n\tthis:  " << this
            );

        // call the real function
        data %= rhs.data;
        return *this;
    }

// ----------------------------------------------------------------------------------------

    template <
        typename bigint_base
        >
    bool bigint_kernel_c<bigint_base>::
    operator < (
        const bigint_kernel_c<bigint_base>& rhs
    ) const
    {
        return data < rhs.data;
    }

// ----------------------------------------------------------------------------------------

    template <
        typename bigint_base
        >
    bool bigint_kernel_c<bigint_base>::
    operator == (
        const bigint_kernel_c<bigint_base>& rhs
    ) const
    {
        return data == rhs.data;
    }

// ----------------------------------------------------------------------------------------

    template <
        typename bigint_base
        >
    bigint_kernel_c<bigint_base>& bigint_kernel_c<bigint_base>::
    operator= (
        const bigint_kernel_c<bigint_base>& rhs
    )
    {
        data = rhs.data;
        return *this;
    }

// ----------------------------------------------------------------------------------------

    template <
        typename bigint_base
        >
    std::ostream& operator<< (
        std::ostream& out,
        const bigint_kernel_c<bigint_base>& rhs
    )
    {
        out << rhs.data;
        return out;
    }

// ----------------------------------------------------------------------------------------

    template <
        typename bigint_base
        >
    std::istream& operator>> (
        std::istream& in,
        bigint_kernel_c<bigint_base>& rhs
    )
    {
        in >> rhs.data;
        return in;
    }

// ----------------------------------------------------------------------------------------

    template <
        typename bigint_base
        >
    bigint_kernel_c<bigint_base>& bigint_kernel_c<bigint_base>::
    operator++ (
    )
    {
        ++data;
        return *this;
    }

// ----------------------------------------------------------------------------------------

    template <
        typename bigint_base
        >
    const bigint_kernel_c<bigint_base> bigint_kernel_c<bigint_base>::
    operator++ (
        int
    )
    {
        return bigint_kernel_c<bigint_base>(data++);
    }

// ----------------------------------------------------------------------------------------

    template <
        typename bigint_base
        >
    bigint_kernel_c<bigint_base>& bigint_kernel_c<bigint_base>::
    operator-- (
    )
    {
        // make sure requires clause is not broken
        DLIB_CASSERT( !(*this == 0),
            "\tbigint& bigint::operator--()"
            << "\n\t *this to subtract from *this it must not be zero to begin with"
            << "\n\tthis:  " << this
            );

        // call the real function
        --data;
        return *this;
    }

// ----------------------------------------------------------------------------------------

    template <
        typename bigint_base
        >
    const bigint_kernel_c<bigint_base> bigint_kernel_c<bigint_base>::
    operator-- (
        int
    )
    {
        // make sure requires clause is not broken
        DLIB_CASSERT( !(*this == 0),
            "\tconst bigint bigint::operator--(int)"
            << "\n\t *this to subtract from *this it must not be zero to begin with"
            << "\n\tthis:  " << this
            );

        // call the real function
        return bigint_kernel_c<bigint_base>(data--);
    }

// ----------------------------------------------------------------------------------------

    template <
        typename bigint_base
        >
    const bigint_kernel_c<bigint_base> operator+ (
        uint16 l,
        const bigint_kernel_c<bigint_base>& rhs
    )
    {
        uint32 lhs = l;
        // make sure requires clause is not broken
        DLIB_CASSERT( lhs <= 65535,
            "\tconst bigint operator+(uint16, const bigint&)"
            << "\n\t lhs must be <= 65535"
            << "\n\trhs:   " << rhs
            << "\n\tlhs:   " << lhs
            );

        return bigint_kernel_c<bigint_base>(static_cast<uint16>(lhs)+rhs.data);
    }

// ----------------------------------------------------------------------------------------

    template <
        typename bigint_base
        >
    const bigint_kernel_c<bigint_base> operator+ (
        const bigint_kernel_c<bigint_base>& lhs,
        uint16 r
    )
    {
        uint32 rhs = r;
        // make sure requires clause is not broken
        DLIB_CASSERT( rhs <= 65535,
            "\tconst bigint operator+(const bigint&, uint16)"
            << "\n\t rhs must be <= 65535"
            << "\n\trhs:   " << rhs
            << "\n\tlhs:   " << lhs
            );

        return bigint_kernel_c<bigint_base>(lhs.data+static_cast<uint16>(rhs));
    }

// ----------------------------------------------------------------------------------------

    template <
        typename bigint_base
        >
    bigint_kernel_c<bigint_base>& bigint_kernel_c<bigint_base>::
    operator+= (
        uint16 r
    )
    {
        uint32 rhs = r;
        // make sure requires clause is not broken
        DLIB_CASSERT( rhs <= 65535,
            "\tbigint& bigint::operator+=(uint16)"
            << "\n\t rhs must be <= 65535"
            << "\n\tthis:  " << this
            << "\n\t*this: " << *this 
            << "\n\trhs:   " << rhs
            );

        data += rhs;
        return *this;
    }

// ----------------------------------------------------------------------------------------

    template <
        typename bigint_base
        >
    const bigint_kernel_c<bigint_base> operator- (
        uint16 l,
        const bigint_kernel_c<bigint_base>& rhs
    )
    {
        uint32 lhs = l;
        // make sure requires clause is not broken
        DLIB_CASSERT( !(static_cast<uint16>(lhs) < rhs) && lhs <= 65535,
            "\tconst bigint operator-(uint16,const bigint&)"
            << "\n\t lhs must be greater than or equal to rhs and lhs <= 65535"
            << "\n\tlhs:   " << lhs
            << "\n\trhs:   " << rhs
            << "\n\t&lhs:  " << &lhs
            << "\n\t&rhs:  " << &rhs
            );

        // call the real function
        return bigint_kernel_c<bigint_base>(static_cast<uint16>(lhs)-rhs.data);
    }

// ----------------------------------------------------------------------------------------

    template <
        typename bigint_base
        >
    const bigint_kernel_c<bigint_base> operator- (
        const bigint_kernel_c<bigint_base>& lhs,
        uint16 r
    )
    {
        uint32 rhs = r;
        // make sure requires clause is not broken
        DLIB_CASSERT( !(lhs < static_cast<uint16>(rhs)) && rhs <= 65535,
            "\tconst bigint operator-(const bigint&,uint16)"
            << "\n\t lhs must be greater than or equal to rhs and rhs <= 65535"
            << "\n\tlhs:   " << lhs
            << "\n\trhs:   " << rhs
            << "\n\t&lhs:  " << &lhs
            << "\n\t&rhs:  " << &rhs
            );

        // call the real function
        return bigint_kernel_c<bigint_base>(lhs.data-static_cast<uint16>(rhs));
    }

// ----------------------------------------------------------------------------------------

    template <
        typename bigint_base
        >
    bigint_kernel_c<bigint_base>& bigint_kernel_c<bigint_base>::
    operator-= (
        uint16 r
    )
    {
        uint32 rhs = r;
        // make sure requires clause is not broken
        DLIB_CASSERT( !(*this < static_cast<uint16>(rhs)) && rhs <= 65535,
            "\tbigint& bigint::operator-=(uint16)"
            << "\n\t *this must not be less than rhs and rhs <= 65535"
            << "\n\tthis:  " << this
            << "\n\t*this: " << *this
            << "\n\trhs:   " << rhs
            );

        // call the real function
        data -= static_cast<uint16>(rhs);
        return *this;
    }

// ----------------------------------------------------------------------------------------

    template <
        typename bigint_base
        >
    const bigint_kernel_c<bigint_base> operator* (
        uint16 l,
        const bigint_kernel_c<bigint_base>& rhs
    )
    {
        uint32 lhs = l;
        // make sure requires clause is not broken
        DLIB_CASSERT( lhs <= 65535,
            "\tconst bigint operator*(uint16, const bigint&)"
            << "\n\t lhs must be <= 65535"
            << "\n\trhs:   " << rhs
            << "\n\tlhs:   " << lhs
            );

        return bigint_kernel_c<bigint_base>(lhs*rhs.data);
    }

// ----------------------------------------------------------------------------------------

    template <
        typename bigint_base
        >
    const bigint_kernel_c<bigint_base> operator* (
        const bigint_kernel_c<bigint_base>& lhs,
        uint16 r
    )
    {
        uint32 rhs = r;
        // make sure requires clause is not broken
        DLIB_CASSERT( rhs <= 65535,
            "\tconst bigint operator*(const bigint&, uint16)"
            << "\n\t rhs must be <= 65535"
            << "\n\trhs:   " << rhs
            << "\n\tlhs:   " << lhs
            );

        return bigint_kernel_c<bigint_base>(lhs.data*rhs);
    }

// ----------------------------------------------------------------------------------------

    template <
        typename bigint_base
        >
    bigint_kernel_c<bigint_base>& bigint_kernel_c<bigint_base>::
    operator*= (
        uint16 r
    )
    {
        uint32 rhs = r;
        // make sure requires clause is not broken
        DLIB_CASSERT( rhs <= 65535,
            "\t bigint bigint::operator*=(uint16)"
            << "\n\t rhs must be <= 65535"
            << "\n\tthis:  " << this
            << "\n\t*this: " << *this 
            << "\n\trhs:   " << rhs
            );

        data *= static_cast<uint16>(rhs);
        return *this;
    }

// ----------------------------------------------------------------------------------------

    template <
        typename bigint_base
        >
    const bigint_kernel_c<bigint_base> operator/ (
        uint16 l,
        const bigint_kernel_c<bigint_base>& rhs
    )
    {
        uint32 lhs = l;
        // make sure requires clause is not broken
        DLIB_CASSERT( !(rhs == 0) && lhs <= 65535,
            "\tconst bigint operator/(uint16,const bigint&)"
            << "\n\t you can't divide by zero and lhs <= 65535"
            << "\n\t&lhs:  " << &lhs
            << "\n\t&rhs:  " << &rhs
            << "\n\tlhs:   " << lhs
            );

        // call the real function
        return bigint_kernel_c<bigint_base>(lhs/rhs.data);
    }

// ----------------------------------------------------------------------------------------

    template <
        typename bigint_base
        >
    const bigint_kernel_c<bigint_base> operator/ (
        const bigint_kernel_c<bigint_base>& lhs,
        uint16 r
    )
    {
        uint32 rhs = r;
        // make sure requires clause is not broken
        DLIB_CASSERT( !(rhs == 0) && rhs <= 65535,
            "\tconst bigint operator/(const bigint&,uint16)"
            << "\n\t you can't divide by zero and rhs <= 65535"
            << "\n\t&lhs:  " << &lhs
            << "\n\t&rhs:  " << &rhs
            << "\n\trhs:   " << rhs
            );

        // call the real function
        return bigint_kernel_c<bigint_base>(lhs.data/static_cast<uint16>(rhs));
    }

// ----------------------------------------------------------------------------------------

    template <
        typename bigint_base
        >
    bigint_kernel_c<bigint_base>& bigint_kernel_c<bigint_base>::
    operator/= (
        uint16 rhs
    )
    {
        // make sure requires clause is not broken
        DLIB_CASSERT( !(rhs == 0) && static_cast<uint32>(rhs) <= 65535,
            "\tbigint& bigint::operator/=(uint16)"
            << "\n\t you can't divide by zero and rhs must be <= 65535"
            << "\n\tthis:  " << this
            << "\n\trhs:   " << rhs
            );

        // call the real function
        data /= rhs;
        return *this;
    }

// ----------------------------------------------------------------------------------------

    template <
        typename bigint_base
        >
    const bigint_kernel_c<bigint_base> operator% (
        uint16 lhs,
        const bigint_kernel_c<bigint_base>& rhs
    )
    {
        // make sure requires clause is not broken
        DLIB_CASSERT( !(rhs == 0) && static_cast<uint32>(lhs) <= 65535,
            "\tconst bigint operator%(uint16,const bigint&)"
            << "\n\t you can't divide by zero and lhs must be <= 65535"
            << "\n\t&lhs:  " << &lhs
            << "\n\t&rhs:  " << &rhs
            << "\n\tlhs:   " << lhs
            );

        // call the real function
        return bigint_kernel_c<bigint_base>(lhs%rhs.data);
    }

// ----------------------------------------------------------------------------------------

    template <
        typename bigint_base
        >
    const bigint_kernel_c<bigint_base> operator% (
        const bigint_kernel_c<bigint_base>& lhs,
        uint16 r
    )
    {
        uint32 rhs = r;
        // make sure requires clause is not broken
        DLIB_CASSERT( !(rhs == 0) && rhs <= 65535,
            "\tconst bigint operator%(const bigint&,uint16)"
            << "\n\t you can't divide by zero and rhs must be <= 65535"
            << "\n\t&lhs:  " << &lhs
            << "\n\t&rhs:  " << &rhs
            << "\n\trhs:   " << rhs
            );

        // call the real function
        return bigint_kernel_c<bigint_base>(lhs.data%static_cast<uint16>(rhs));
    }

// ----------------------------------------------------------------------------------------

    template <
        typename bigint_base
        >
    bigint_kernel_c<bigint_base>& bigint_kernel_c<bigint_base>::
    operator%= (
        uint16 r
    )
    {

        uint32 rhs = r;
        // make sure requires clause is not broken
        DLIB_CASSERT( !(rhs == 0) && rhs <= 65535,
            "\tbigint& bigint::operator%=(uint16)"
            << "\n\t you can't divide by zero and rhs must be <= 65535"
            << "\n\tthis:  " << this
            << "\n\trhs:   " << rhs
            );

        // call the real function
        data %= rhs;
        return *this;
    }

// ----------------------------------------------------------------------------------------

    template <
        typename bigint_base
        >
    bool operator < (
        uint16 l,
        const bigint_kernel_c<bigint_base>& rhs
    )
    {
        uint32 lhs = l;
        // make sure requires clause is not broken
        DLIB_CASSERT( lhs <= 65535,
            "\tbool operator<(uint16, const bigint&)"
            << "\n\t lhs must be <= 65535"
            << "\n\trhs:   " << rhs
            << "\n\tlhs:   " << lhs
            );

        return static_cast<uint16>(lhs) < rhs.data;
    }

// ----------------------------------------------------------------------------------------

    template <
        typename bigint_base
        >
    bool operator < (
        const bigint_kernel_c<bigint_base>& lhs,
        uint16 r
    )
    {
        uint32 rhs = r;
        // make sure requires clause is not broken
        DLIB_CASSERT( rhs <= 65535,
            "\tbool operator<(const bigint&, uint16)"
            << "\n\t rhs must be <= 65535"
            << "\n\trhs:   " << rhs
            << "\n\tlhs:   " << lhs
            );

        return lhs.data < static_cast<uint16>(rhs);
    }

// ----------------------------------------------------------------------------------------

    template <
        typename bigint_base
        >
    bool operator == (
        const bigint_kernel_c<bigint_base>& lhs,
        uint16 r
    )
    {
        uint32 rhs = r;
        // make sure requires clause is not broken
        DLIB_CASSERT( rhs <= 65535,
            "\tbool operator==(const bigint&, uint16)"
            << "\n\t rhs must be <= 65535"
            << "\n\trhs:   " << rhs
            << "\n\tlhs:   " << lhs
            );

        return lhs.data == static_cast<uint16>(rhs);
    }

// ----------------------------------------------------------------------------------------

    template <
        typename bigint_base
        >
    bool operator == (
        uint16 l,
        const bigint_kernel_c<bigint_base>& rhs
    )
    {
        uint32 lhs = l;
        // make sure requires clause is not broken
        DLIB_CASSERT( lhs <= 65535,
            "\tbool operator==(uint16, const bigint&)"
            << "\n\t lhs must be <= 65535"
            << "\n\trhs:   " << rhs
            << "\n\tlhs:   " << lhs
            );

        return static_cast<uint16>(lhs) == rhs.data;
    }

// ----------------------------------------------------------------------------------------

    template <
        typename bigint_base
        >
    bigint_kernel_c<bigint_base>& bigint_kernel_c<bigint_base>::
    operator= (
        uint16 r
    )
    {
        uint32 rhs = r;
        // make sure requires clause is not broken
        DLIB_CASSERT( rhs <= 65535,
            "\tbigint bigint::operator=(uint16)"
            << "\n\t rhs must be <= 65535"
            << "\n\t*this:  " << *this
            << "\n\tthis:   " << this
            << "\n\tlhs:    " << rhs
            );

        data = static_cast<uint16>(rhs);
        return *this;
    }

// ----------------------------------------------------------------------------------------

}

#endif // DLIB_BIGINT_KERNEl_C_

