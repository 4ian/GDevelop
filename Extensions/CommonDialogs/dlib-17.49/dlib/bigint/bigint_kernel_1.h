// Copyright (C) 2003  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#ifndef DLIB_BIGINT_KERNEl_1_
#define DLIB_BIGINT_KERNEl_1_

#include "bigint_kernel_abstract.h"
#include "../algs.h"
#include "../serialize.h"
#include "../uintn.h"
#include <iosfwd>

namespace dlib
{
    
    using namespace dlib::relational_operators; // defined in algs.h

    class bigint_kernel_1 
    {
        /*!
            INITIAL VALUE
                slack               == 25
                data->number[0]     == 0 
                data->size          == slack 
                data->references    == 1 
                data->digits_used   == 1
                

            CONVENTION
                slack  == the number of extra digits placed into the number when it is 
                    created.  the slack value should never be less than 1

                data->number == pointer to an array of data->size uint16s.
                    data represents a string of base 65535 numbers with data[0] being
                    the least significant bit and data[data->digits_used-1] being the most 
                    significant


                NOTE: In the comments I will consider a word to be a 16 bit value


                data->digits_used == the number of significant digits in the number.
                    data->digits_used tells us the number of used elements in the 
                    data->number array so everything beyond data->number[data->digits_used-1] 
                    is undefined

                data->references == the number of bigint_kernel_1 objects which refer
                    to this data_record



        !*/


        struct data_record
        {


            explicit data_record(
                uint32 size_
            ) : 
                size(size_),
                number(new uint16[size_]),
                references(1),
                digits_used(1)
            {*number = 0;}
            /*!
                ensures
                    - initializes *this to represent zero
            !*/

            data_record(
                const data_record& item,
                uint32 additional_size
            ) :
                size(item.digits_used + additional_size),
                number(new uint16[size]),
                references(1),
                digits_used(item.digits_used)
            {
                uint16* source = item.number;
                uint16* dest = number;
                uint16* end = source + digits_used;
                while (source != end)
                {
                    *dest = *source;
                    ++dest;
                    ++source;
                }
            }
            /*!
                ensures
                    - *this is a copy of item except with 
                      size == item.digits_used + additional_size
            !*/

            ~data_record(
            )
            {
                delete [] number;
            }


            const uint32 size;
            uint16* number;
            uint32 references;            
            uint32 digits_used;

        private:
            // no copy constructor
            data_record ( data_record&);
        };



        // note that the second parameter is just there 
        // to resolve the ambiguity between this constructor and 
        // bigint_kernel_1(uint32)
        explicit bigint_kernel_1 (
            data_record* data_, int
        ): slack(25),data(data_) {}
        /*!
            ensures
                - *this is initialized with data_ as its data member
        !*/


    public:

        bigint_kernel_1 (
        );

        bigint_kernel_1 (
            uint32 value
        );

        bigint_kernel_1 (
            const bigint_kernel_1& item
        );

        virtual ~bigint_kernel_1 (
        );

        const bigint_kernel_1 operator+ (
            const bigint_kernel_1& rhs
        ) const;

        bigint_kernel_1& operator+= (
            const bigint_kernel_1& rhs
        );

        const bigint_kernel_1 operator- (
            const bigint_kernel_1& rhs
        ) const;

        bigint_kernel_1& operator-= (
            const bigint_kernel_1& rhs
        );

        const bigint_kernel_1 operator* (
            const bigint_kernel_1& rhs
        ) const;

        bigint_kernel_1& operator*= (
            const bigint_kernel_1& rhs
        );

        const bigint_kernel_1 operator/ (
            const bigint_kernel_1& rhs
        ) const;

        bigint_kernel_1& operator/= (
            const bigint_kernel_1& rhs
        );

        const bigint_kernel_1 operator% (
            const bigint_kernel_1& rhs
        ) const;

        bigint_kernel_1& operator%= (
            const bigint_kernel_1& rhs
        );

        bool operator < (
            const bigint_kernel_1& rhs
        ) const;

        bool operator == (
            const bigint_kernel_1& rhs
        ) const;

        bigint_kernel_1& operator= (
            const bigint_kernel_1& rhs
        );

        friend std::ostream& operator<< (
            std::ostream& out,
            const bigint_kernel_1& rhs
        );

        friend std::istream& operator>> (
            std::istream& in,
            bigint_kernel_1& rhs
        );

        bigint_kernel_1& operator++ (
        );

        const bigint_kernel_1 operator++ (
            int
        );

        bigint_kernel_1& operator-- (
        );

        const bigint_kernel_1 operator-- (
            int
        );

        friend const bigint_kernel_1 operator+ (
            uint16 lhs,
            const bigint_kernel_1& rhs
        );

        friend const bigint_kernel_1 operator+ (
            const bigint_kernel_1& lhs,
            uint16 rhs
        );

        bigint_kernel_1& operator+= (
            uint16 rhs
        );

        friend const bigint_kernel_1 operator- (
            uint16 lhs,
            const bigint_kernel_1& rhs
        );

        friend const bigint_kernel_1 operator- (
            const bigint_kernel_1& lhs,
            uint16 rhs
        );

        bigint_kernel_1& operator-= (
            uint16 rhs
        );

        friend const bigint_kernel_1 operator* (
            uint16 lhs,
            const bigint_kernel_1& rhs
        );

        friend const bigint_kernel_1 operator* (
            const bigint_kernel_1& lhs,
            uint16 rhs
        );

        bigint_kernel_1& operator*= (
            uint16 rhs
        );

        friend const bigint_kernel_1 operator/ (
            uint16 lhs,
            const bigint_kernel_1& rhs
        );

        friend const bigint_kernel_1 operator/ (
            const bigint_kernel_1& lhs,
            uint16 rhs
        );

        bigint_kernel_1& operator/= (
            uint16 rhs
        );

        friend const bigint_kernel_1 operator% (
            uint16 lhs,
            const bigint_kernel_1& rhs
        );

        friend const bigint_kernel_1 operator% (
            const bigint_kernel_1& lhs,
            uint16 rhs
        );

        bigint_kernel_1& operator%= (
            uint16 rhs
        );

        friend bool operator < (
            uint16 lhs,
            const bigint_kernel_1& rhs
        );

        friend bool operator < (
            const bigint_kernel_1& lhs,
            uint16 rhs
        );

        friend bool operator == (
            const bigint_kernel_1& lhs,
            uint16 rhs
        );

        friend bool operator == (
            uint16 lhs,
            const bigint_kernel_1& rhs
        );

        bigint_kernel_1& operator= (
            uint16 rhs
        );


        void swap (
            bigint_kernel_1& item
        ) { data_record* temp = data; data = item.data; item.data = temp; }


    private:

        void long_add (
            const data_record* lhs,
            const data_record* rhs,
            data_record* result
        ) const;
        /*!
            requires
                - result->size >= max(lhs->digits_used,rhs->digits_used) + 1
            ensures
                - result == lhs + rhs
        !*/

        void long_sub (
            const data_record* lhs,
            const data_record* rhs,
            data_record* result
        ) const;
        /*!
            requires
                - lhs >= rhs 
                - result->size >= lhs->digits_used
            ensures
                - result == lhs - rhs
        !*/

        void long_div (
            const data_record* lhs,
            const data_record* rhs,
            data_record* result,
            data_record* remainder
        ) const;
        /*!
            requires 
                - rhs != 0 
                - result->size >= lhs->digits_used 
                - remainder->size >= lhs->digits_used 
                - each parameter is unique (i.e. lhs != result, lhs != remainder, etc.)
            ensures
                - result == lhs / rhs
                - remainder == lhs % rhs
        !*/

        void long_mul (
            const data_record* lhs,
            const data_record* rhs,
            data_record* result
        ) const;
        /*!
            requires
                - result->size >= lhs->digits_used + rhs->digits_used 
                - result != lhs 
                - result != rhs
            ensures
                - result == lhs * rhs
        !*/

        void short_add (
            const data_record* data,
            uint16 value,
            data_record* result            
        ) const;
        /*!
            requires
                - result->size >= data->size + 1
            ensures
                - result == data + value
        !*/

        void short_sub (
            const data_record* data,
            uint16 value,
            data_record* result
        ) const;
        /*!
            requires
                - data >= value 
                - result->size >= data->digits_used
            ensures
                - result == data - value
        !*/

        void short_mul (
            const data_record* data,
            uint16 value,
            data_record* result            
        ) const;
        /*!
            requires
                - result->size >= data->digits_used + 1
            ensures
                - result == data * value
        !*/

        void short_div (
            const data_record* data,            
            uint16 value,
            data_record* result,
            uint16& remainder
        ) const;
        /*!
            requires
                - value != 0 
                - result->size >= data->digits_used
            ensures
                - result = data*value 
                - remainder = data%value
        !*/

        void shift_left (
            const data_record* data,
            data_record* result,
            uint32 shift_amount
        ) const;
        /*!
            requires
                - result->size >= data->digits_used + shift_amount/8 + 1
            ensures
                - result == data << shift_amount
        !*/

        void shift_right (
            const data_record* data,
            data_record* result
        ) const;
        /*!
            requires
                - result->size >= data->digits_used 
            ensures
                - result == data >> 1
        !*/

        bool is_less_than (
            const data_record* lhs,
            const data_record* rhs
        ) const;
        /*! 
            ensures
                - returns true if lhs < rhs 
                - returns false otherwise
        !*/ 

        bool is_equal_to (
            const data_record* lhs,
            const data_record* rhs
        ) const;
        /*!
            ensures
                - returns true if lhs == rhs 
                - returns false otherwise
        !*/

        void increment (
            const data_record* source,
            data_record* dest
        ) const;
        /*!
            requires
                - dest->size >= source->digits_used + 1
            ensures
                - dest = source + 1
        !*/

        void decrement (
            const data_record* source,
            data_record* dest
        ) const;
        /*!
            requires
                source != 0
            ensuers
                dest = source - 1
        !*/

        // member data
        const uint32 slack;
        data_record* data;     
        
        

    };

    inline void swap (
        bigint_kernel_1& a,
        bigint_kernel_1& b
    ) { a.swap(b); }

    inline void serialize (
        const bigint_kernel_1& item, 
        std::ostream& out
    )
    { 
        std::ios::fmtflags oldflags = out.flags();  
        out.flags(); 
        out << item << ' '; 
        out.flags(oldflags); 
        if (!out) throw serialization_error("Error serializing object of type bigint_kernel_c"); 
    }   

    inline void deserialize (
        bigint_kernel_1& item, 
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

}

#ifdef NO_MAKEFILE
#include "bigint_kernel_1.cpp"
#endif

#endif // DLIB_BIGINT_KERNEl_1_

