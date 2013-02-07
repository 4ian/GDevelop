// Copyright (C) 2006  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#ifndef DLIB_BYTE_ORDEREr_KERNEL_1_ 
#define DLIB_BYTE_ORDEREr_KERNEL_1_ 

#include "byte_orderer_kernel_abstract.h"
#include "../algs.h"
#include "../assert.h"

namespace dlib
{

    class byte_orderer 
    {
        /*!
            INITIAL VALUE
                - if (this machine is little endian) then
                    - little_endian == true
                - else
                    - little_endian == false

            CONVENTION
                - host_is_big_endian() == !little_endian
                - host_is_little_endian() == little_endian

                - if (this machine is little endian) then
                    - little_endian == true
                - else
                    - little_endian == false


        !*/


    public:

        // this is here for backwards compatibility with older versions of dlib.
        typedef byte_orderer kernel_1a;

        byte_orderer (        
        )
        {
            // This will probably never be false but if it is then it means chars are not 8bits
            // on this system.  Which is a problem for this object.
            COMPILE_TIME_ASSERT(sizeof(short) >= 2);

            unsigned long temp = 1;
            unsigned char* ptr = reinterpret_cast<unsigned char*>(&temp);
            if (*ptr == 1)
                little_endian = true;
            else
                little_endian = false;
        }

        virtual ~byte_orderer (
        ){}

        bool host_is_big_endian (
        ) const { return !little_endian; }

        bool host_is_little_endian (
        ) const { return little_endian; }

        template <
            typename T
            >
        inline void host_to_network (
            T& item
        ) const
        { if (little_endian) flip(item); }

        template <
            typename T
            >
        inline void network_to_host (
            T& item
        ) const { if (little_endian) flip(item); }

        template <
            typename T
            >
        void host_to_big (
            T& item
        ) const { if (little_endian) flip(item); }

        template <
            typename T
            >
        void big_to_host (
            T& item
        ) const { if (little_endian) flip(item); }

        template <
            typename T
            >
        void host_to_little (
            T& item
        ) const { if (!little_endian) flip(item); }

        template <
            typename T
            >
        void little_to_host (
            T& item
        ) const { if (!little_endian) flip(item); }


    private:

        template <
            typename T,
            size_t size
            >
        inline void flip (
            T (&array)[size]
        ) const
        /*!
            ensures
                - flips the bytes in every element of this array
        !*/
        {
            for (size_t i = 0; i < size; ++i)
            {
                flip(array[i]);
            }
        }

        template <
            typename T
            >
        inline void flip (
            T& item
        ) const
        /*!
            ensures
                - reverses the byte ordering in item
        !*/
        {
            DLIB_ASSERT_HAS_STANDARD_LAYOUT(T);

            T value;

            // If you are getting this as an error then you are probably using
            // this object wrong.  If you think you aren't then send me (Davis) an
            // email and I'll either set you straight or change/remove this check so
            // your stuff works :)
            COMPILE_TIME_ASSERT(sizeof(T) <= sizeof(long double));

            // If you are getting a compile error on this line then it means T is
            // a pointer type.  It doesn't make any sense to byte swap pointers
            // since they have no meaning outside the context of their own process.
            // So you probably just forgot to dereference that pointer before passing
            // it to this function  :)
            COMPILE_TIME_ASSERT(is_pointer_type<T>::value == false);


            const size_t size = sizeof(T);
            unsigned char* const ptr = reinterpret_cast<unsigned char*>(&item);
            unsigned char* const ptr_temp = reinterpret_cast<unsigned char*>(&value);
            for (size_t i = 0; i < size; ++i)
                ptr_temp[size-i-1] = ptr[i];

            item = value;
        }

        bool little_endian;
    };    

    // make flip not do anything at all for chars
    template <> inline void byte_orderer::flip<char> ( char& ) const {} 
    template <> inline void byte_orderer::flip<unsigned char> ( unsigned char& ) const {} 
    template <> inline void byte_orderer::flip<signed char> ( signed char& ) const {} 
}

#endif // DLIB_BYTE_ORDEREr_KERNEL_1_ 

