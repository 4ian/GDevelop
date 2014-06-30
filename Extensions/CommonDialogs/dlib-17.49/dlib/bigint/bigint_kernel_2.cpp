// Copyright (C) 2003  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#ifndef DLIB_BIGINT_KERNEL_2_CPp_
#define DLIB_BIGINT_KERNEL_2_CPp_
#include "bigint_kernel_2.h"

#include <iostream>
#include <cmath>

namespace dlib
{

// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------
    // member/friend function definitions
// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------

    bigint_kernel_2::
    bigint_kernel_2 (
    ) :
        slack(25),
        data(new data_record(slack))
    {}

// ----------------------------------------------------------------------------------------

    bigint_kernel_2::
    bigint_kernel_2 (
        uint32 value
    ) :
        slack(25),
        data(new data_record(slack))
    {
        *(data->number) = static_cast<uint16>(value&0xFFFF);
        *(data->number+1) = static_cast<uint16>((value>>16)&0xFFFF);
        if (*(data->number+1) != 0)
            data->digits_used = 2;
    }

// ----------------------------------------------------------------------------------------

    bigint_kernel_2::
    bigint_kernel_2 (
        const bigint_kernel_2& item
    ) :
        slack(25),
        data(item.data)
    {
        data->references += 1;
    }

// ----------------------------------------------------------------------------------------

    bigint_kernel_2::
    ~bigint_kernel_2 (
    )
    {
        if (data->references == 1)
        {
            delete data;
        }
        else
        {
            data->references -= 1;
        }
    }

// ----------------------------------------------------------------------------------------

    const bigint_kernel_2 bigint_kernel_2::
    operator+ (
        const bigint_kernel_2& rhs
    ) const
    {
        data_record* temp = new data_record (
                    std::max(rhs.data->digits_used,data->digits_used) + slack
                    );
        long_add(data,rhs.data,temp);
        return bigint_kernel_2(temp,0);
    }

// ----------------------------------------------------------------------------------------

    bigint_kernel_2& bigint_kernel_2::
    operator+= (
        const bigint_kernel_2& rhs
    )
    {
        // if there are other references to our data
        if (data->references != 1)
        {
            data_record* temp = new data_record(std::max(data->digits_used,rhs.data->digits_used)+slack);
            data->references -= 1;   
            long_add(data,rhs.data,temp);
            data = temp;
        }
        // if data is not big enough for the result
        else if (data->size <= std::max(data->digits_used,rhs.data->digits_used))
        {
            data_record* temp = new data_record(std::max(data->digits_used,rhs.data->digits_used)+slack);
            long_add(data,rhs.data,temp);
            delete data;
            data = temp;
        }
        // there is enough size and no references
        else
        {
            long_add(data,rhs.data,data);
        }
        return *this;
    }

// ----------------------------------------------------------------------------------------

    const bigint_kernel_2 bigint_kernel_2::
    operator- (
        const bigint_kernel_2& rhs
    ) const
    {
        data_record* temp = new data_record (
                    data->digits_used + slack
                    );
        long_sub(data,rhs.data,temp);
        return bigint_kernel_2(temp,0);
    }

// ----------------------------------------------------------------------------------------

    bigint_kernel_2& bigint_kernel_2::
    operator-= (
        const bigint_kernel_2& rhs
    )
    {
        // if there are other references to this data 
        if (data->references != 1)
        {
            data_record* temp = new data_record(data->digits_used+slack);
            data->references -= 1;
            long_sub(data,rhs.data,temp);
            data = temp;
        }
        else
        {
            long_sub(data,rhs.data,data);
        }
        return *this;
    }

// ----------------------------------------------------------------------------------------

    const bigint_kernel_2 bigint_kernel_2::
    operator* (
        const bigint_kernel_2& rhs
    ) const
    {
        data_record* temp = new data_record (
                    data->digits_used + rhs.data->digits_used + slack
                    );
        long_mul(data,rhs.data,temp);
        return bigint_kernel_2(temp,0);
    }

// ----------------------------------------------------------------------------------------

    bigint_kernel_2& bigint_kernel_2::
    operator*= (
        const bigint_kernel_2& rhs
    )
    {
        // create a data_record to store the result of the multiplication in
        data_record* temp = new data_record(rhs.data->digits_used+data->digits_used+slack);        
        long_mul(data,rhs.data,temp);

        // if there are other references to data
        if (data->references != 1)
        {
            data->references -= 1;
        }
        else
        {
            delete data;
        }
        data = temp;
        return *this;
    }

// ----------------------------------------------------------------------------------------

    const bigint_kernel_2 bigint_kernel_2::
    operator/ (
        const bigint_kernel_2& rhs
    ) const
    {
        data_record* temp = new data_record(data->digits_used+slack);
        data_record* remainder;
        try {
            remainder = new data_record(data->digits_used+slack);           
        } catch (...) { delete temp; throw; }

        long_div(data,rhs.data,temp,remainder);
        delete remainder;
    

        return bigint_kernel_2(temp,0);
    }

// ----------------------------------------------------------------------------------------

    bigint_kernel_2& bigint_kernel_2::
    operator/= (
        const bigint_kernel_2& rhs
    )
    {

        data_record* temp = new data_record(data->digits_used+slack);
        data_record* remainder;
        try {
            remainder = new data_record(data->digits_used+slack);
        } catch (...) { delete temp; throw; }    

        long_div(data,rhs.data,temp,remainder);

        // check if there are other references to data
        if (data->references != 1)
        {
            data->references -= 1;
        }
        // if there are no references to data then it must be deleted
        else
        {
            delete data;
        }
        data = temp;
        delete remainder;

        
        return *this;
    }

// ----------------------------------------------------------------------------------------

    const bigint_kernel_2 bigint_kernel_2::
    operator% (
        const bigint_kernel_2& rhs
    ) const
    {
        data_record* temp = new data_record(data->digits_used+slack);
        data_record* remainder;
        try {
            remainder = new data_record(data->digits_used+slack);
        } catch (...) { delete temp; throw; }

        long_div(data,rhs.data,temp,remainder);
        delete temp;
        return bigint_kernel_2(remainder,0);
    }

// ----------------------------------------------------------------------------------------

    bigint_kernel_2& bigint_kernel_2::
    operator%= (
        const bigint_kernel_2& rhs
    )
    {
        data_record* temp = new data_record(data->digits_used+slack);
        data_record* remainder;
        try {
            remainder = new data_record(data->digits_used+slack);
        } catch (...) { delete temp; throw; }

        long_div(data,rhs.data,temp,remainder);

        // check if there are other references to data
        if (data->references != 1)
        {
            data->references -= 1;
        }
        // if there are no references to data then it must be deleted
        else
        {
            delete data;
        }
        data = remainder;
        delete temp;
        return *this;
    }

// ----------------------------------------------------------------------------------------

    bool bigint_kernel_2::
    operator < (
        const bigint_kernel_2& rhs
    ) const
    {
        return is_less_than(data,rhs.data);
    }

// ----------------------------------------------------------------------------------------

    bool bigint_kernel_2::
    operator == (
        const bigint_kernel_2& rhs
    ) const
    {
        return is_equal_to(data,rhs.data);
    }

// ----------------------------------------------------------------------------------------

    bigint_kernel_2& bigint_kernel_2::
    operator= (
        const bigint_kernel_2& rhs
    )
    {
        if (this == &rhs)
            return *this;

        // if we have the only reference to our data then delete it
        if (data->references == 1)
        {
            delete data;
            data = rhs.data;
            data->references += 1;
        }
        else
        {
            data->references -= 1;
            data = rhs.data;
            data->references += 1;
        }

        return *this;
    }

// ----------------------------------------------------------------------------------------

    std::ostream& operator<< (
        std::ostream& out_,
        const bigint_kernel_2& rhs
    )
    {
        std::ostream out(out_.rdbuf());

        typedef bigint_kernel_2 bigint;
        
        bigint::data_record* temp = new bigint::data_record(*rhs.data,0);



        // get a char array big enough to hold the number in ascii format
        char* str;
        try {
            str = new char[(rhs.data->digits_used)*5+10];
        } catch (...) { delete temp; throw; }

        char* str_start = str;
        str += (rhs.data->digits_used)*5+9;
        *str = 0; --str;


        uint16 remainder;
        rhs.short_div(temp,10000,temp,remainder);

        // pull the digits out of remainder
        char a = remainder % 10 + '0';
        remainder /= 10;
        char b = remainder % 10 + '0';
        remainder /= 10;
        char c = remainder % 10 + '0';
        remainder /= 10;
        char d = remainder % 10 + '0';
        remainder /= 10;


        *str = a; --str;
        *str = b; --str;
        *str = c; --str;
        *str = d; --str;


        // keep looping until temp represents zero
        while (temp->digits_used != 1 || *(temp->number) != 0)
        {            
            rhs.short_div(temp,10000,temp,remainder);

            // pull the digits out of remainder
            char a = remainder % 10 + '0';
            remainder /= 10;
            char b = remainder % 10 + '0';
            remainder /= 10;
            char c = remainder % 10 + '0';
            remainder /= 10;
            char d = remainder % 10 + '0';
            remainder /= 10;

            *str = a; --str;
            *str = b; --str;
            *str = c; --str;
            *str = d; --str;              
        }

        // throw away and extra leading zeros
        ++str;
        if (*str == '0')
            ++str;
        if (*str == '0')
            ++str;
        if (*str == '0')
            ++str;


        

        out << str;
        delete [] str_start;
        delete temp;
        return out_;

    }

// ----------------------------------------------------------------------------------------

    std::istream& operator>> (
        std::istream& in_,
        bigint_kernel_2& rhs
    )
    {
        std::istream in(in_.rdbuf());

        // ignore any leading whitespaces
        while (in.peek() == ' ' || in.peek() == '\t' || in.peek() == '\n')
        {
            in.get();
        }

        // if the first digit is not an integer then this is an error
        if ( !(in.peek() >= '0' && in.peek() <= '9'))
        {
            in_.clear(std::ios::failbit);
            return in_;
        }

        int num_read;
        bigint_kernel_2 temp;
        do
        {

            // try to get 4 chars from in
            num_read = 1;
            char a = 0;
            char b = 0; 
            char c = 0;
            char d = 0;

            if (in.peek() >= '0' && in.peek() <= '9')
            {
                num_read *= 10;
                a = in.get();
            }
            if (in.peek() >= '0' && in.peek() <= '9')
            {
                num_read *= 10;
                b = in.get();
            }
            if (in.peek() >= '0' && in.peek() <= '9')
            {
                num_read *= 10;
                c = in.get();
            }
            if (in.peek() >= '0' && in.peek() <= '9')
            {
                num_read *= 10;
                d = in.get();
            }
            
            // merge the for digits into an uint16
            uint16 num = 0;
            if (a != 0)
            {
                num = a - '0';
            }
            if (b != 0)
            {
                num *= 10;
                num += b - '0';
            }
            if (c != 0)
            {
                num *= 10;
                num += c - '0';
            }
            if (d != 0)
            {
                num *= 10;
                num += d - '0';
            }


            if (num_read != 1)
            {
                // shift the digits in temp left by the number of new digits we just read
                temp *= num_read;
                // add in new digits
                temp += num;
            }

        } while (num_read == 10000);


        rhs = temp;
        return in_;
    }

// ----------------------------------------------------------------------------------------

    const bigint_kernel_2 operator+ (
        uint16 lhs,
        const bigint_kernel_2& rhs
    )
    {
        typedef bigint_kernel_2 bigint;
        bigint::data_record* temp = new bigint::data_record
                (rhs.data->digits_used+rhs.slack);

        rhs.short_add(rhs.data,lhs,temp);
        return bigint_kernel_2(temp,0);
    }

// ----------------------------------------------------------------------------------------

    const bigint_kernel_2 operator+ (
        const bigint_kernel_2& lhs,
        uint16 rhs
    )
    {
        typedef bigint_kernel_2 bigint;
        bigint::data_record* temp = new bigint::data_record
                (lhs.data->digits_used+lhs.slack);

        lhs.short_add(lhs.data,rhs,temp);
        return bigint_kernel_2(temp,0);
    }

// ----------------------------------------------------------------------------------------

    bigint_kernel_2& bigint_kernel_2::
    operator+= (
        uint16 rhs
    )
    {
        // if there are other references to this data 
        if (data->references != 1)
        {
            data_record* temp = new data_record(data->digits_used+slack);
            data->references -= 1;    
            short_add(data,rhs,temp);
            data = temp;
        }
        // or if we need to enlarge data then do so
        else if (data->digits_used == data->size)
        {
            data_record* temp = new data_record(data->digits_used+slack);
            short_add(data,rhs,temp);
            delete data;
            data = temp;
        }
        // or if there is plenty of space and no references
        else
        {
            short_add(data,rhs,data);
        }
        return *this;
    }

// ----------------------------------------------------------------------------------------

    const bigint_kernel_2 operator- (
        uint16 lhs,
        const bigint_kernel_2& rhs
    )
    {
        typedef bigint_kernel_2 bigint;
        bigint::data_record* temp = new bigint::data_record(rhs.slack);

        *(temp->number) = lhs - *(rhs.data->number);

        return bigint_kernel_2(temp,0);
    }

// ----------------------------------------------------------------------------------------

    const bigint_kernel_2 operator- (
        const bigint_kernel_2& lhs,
        uint16 rhs
    )
    {
        typedef bigint_kernel_2 bigint;
        bigint::data_record* temp = new bigint::data_record
                (lhs.data->digits_used+lhs.slack);

        lhs.short_sub(lhs.data,rhs,temp);
        return bigint_kernel_2(temp,0);
    }

// ----------------------------------------------------------------------------------------

    bigint_kernel_2& bigint_kernel_2::
    operator-= (
        uint16 rhs
    )
    {
        // if there are other references to this data 
        if (data->references != 1)
        {
            data_record* temp = new data_record(data->digits_used+slack);
            data->references -= 1;
            short_sub(data,rhs,temp);
            data = temp;
        }
        else
        {
            short_sub(data,rhs,data);
        }
        return *this;
    }

// ----------------------------------------------------------------------------------------

    const bigint_kernel_2 operator* (
        uint16 lhs,
        const bigint_kernel_2& rhs
    )
    {
        typedef bigint_kernel_2 bigint;
        bigint::data_record* temp = new bigint::data_record
                (rhs.data->digits_used+rhs.slack);

        rhs.short_mul(rhs.data,lhs,temp);
        return bigint_kernel_2(temp,0);        
    }

// ----------------------------------------------------------------------------------------

    const bigint_kernel_2 operator* (
        const bigint_kernel_2& lhs,
        uint16 rhs
    )
    {
        typedef bigint_kernel_2 bigint;
        bigint::data_record* temp = new bigint::data_record
                (lhs.data->digits_used+lhs.slack);

        lhs.short_mul(lhs.data,rhs,temp);
        return bigint_kernel_2(temp,0);  
    }

// ----------------------------------------------------------------------------------------

    bigint_kernel_2& bigint_kernel_2::
    operator*= (
        uint16 rhs
    )
    {
        // if there are other references to this data 
        if (data->references != 1)
        {
            data_record* temp = new data_record(data->digits_used+slack);
            data->references -= 1;
            short_mul(data,rhs,temp);
            data = temp;
        }
        // or if we need to enlarge data
        else if (data->digits_used == data->size)
        {
            data_record* temp = new data_record(data->digits_used+slack);
            short_mul(data,rhs,temp);
            delete data;
            data = temp;
        }
        else
        {
            short_mul(data,rhs,data);
        }
        return *this;
    }

// ----------------------------------------------------------------------------------------

    const bigint_kernel_2 operator/ (
        uint16 lhs,
        const bigint_kernel_2& rhs
    )
    {
        typedef bigint_kernel_2 bigint;
        bigint::data_record* temp = new bigint::data_record(rhs.slack);

        // if rhs might not be bigger than lhs
        if (rhs.data->digits_used == 1)
        {
            *(temp->number) = lhs/ *(rhs.data->number);
        }
        
        return bigint_kernel_2(temp,0);  
    }

// ----------------------------------------------------------------------------------------

    const bigint_kernel_2 operator/ (
        const bigint_kernel_2& lhs,
        uint16 rhs
    )
    {
        typedef bigint_kernel_2 bigint;
        bigint::data_record* temp = new bigint::data_record
                (lhs.data->digits_used+lhs.slack);

        uint16 remainder;
        lhs.short_div(lhs.data,rhs,temp,remainder);
        return bigint_kernel_2(temp,0);  
    }

// ----------------------------------------------------------------------------------------

    bigint_kernel_2& bigint_kernel_2::
    operator/= (
        uint16 rhs
    )
    {
        uint16 remainder;
        // if there are other references to this data
        if (data->references != 1)
        {
            data_record* temp = new data_record(data->digits_used+slack);
            data->references -= 1;
            short_div(data,rhs,temp,remainder);    
            data = temp;
        }
        else
        {
            short_div(data,rhs,data,remainder);
        }
        return *this;
    }

// ----------------------------------------------------------------------------------------

    const bigint_kernel_2 operator% (
        uint16 lhs,
        const bigint_kernel_2& rhs
    )
    {
        typedef bigint_kernel_2 bigint;
        // temp is zero by default
        bigint::data_record* temp = new bigint::data_record(rhs.slack);

        if (rhs.data->digits_used == 1)
        {
            // if rhs is just an uint16 inside then perform the modulus
            *(temp->number) = lhs % *(rhs.data->number);
        }
        else
        {
            // if rhs is bigger than lhs then the answer is lhs
            *(temp->number) = lhs;
        }
        
        return bigint_kernel_2(temp,0);  
    }

// ----------------------------------------------------------------------------------------

    const bigint_kernel_2 operator% (
        const bigint_kernel_2& lhs,
        uint16 rhs
    )
    {
        typedef bigint_kernel_2 bigint;
        bigint::data_record* temp = new bigint::data_record(lhs.data->digits_used+lhs.slack);

        uint16 remainder;

        lhs.short_div(lhs.data,rhs,temp,remainder);
        temp->digits_used = 1;
        *(temp->number) = remainder;
        return bigint_kernel_2(temp,0);          
    }

// ----------------------------------------------------------------------------------------

    bigint_kernel_2& bigint_kernel_2::
    operator%= (
        uint16 rhs
    )
    {
        uint16 remainder;
        // if there are other references to this data
        if (data->references != 1)
        {
            data_record* temp = new data_record(data->digits_used+slack);
            data->references -= 1;
            short_div(data,rhs,temp,remainder);
            data = temp;
        }
        else
        {
            short_div(data,rhs,data,remainder);
        }

        data->digits_used = 1;
        *(data->number) = remainder;
        return *this;
    }

// ----------------------------------------------------------------------------------------

    bool operator < (
        uint16 lhs,
        const bigint_kernel_2& rhs
    )
    {
        return (rhs.data->digits_used > 1 || lhs < *(rhs.data->number) );
    }

// ----------------------------------------------------------------------------------------

    bool operator < (
        const bigint_kernel_2& lhs,
        uint16 rhs
    )
    {
        return (lhs.data->digits_used == 1 && *(lhs.data->number) < rhs);
    }

// ----------------------------------------------------------------------------------------

    bool operator == (
        const bigint_kernel_2& lhs,
        uint16 rhs
    )
    {
        return (lhs.data->digits_used == 1 && *(lhs.data->number) == rhs);
    }

// ----------------------------------------------------------------------------------------

    bool operator == (
        uint16 lhs,
        const bigint_kernel_2& rhs
    )
    {
        return (rhs.data->digits_used == 1 && *(rhs.data->number) == lhs);
    }

// ----------------------------------------------------------------------------------------

    bigint_kernel_2& bigint_kernel_2::
    operator= (
        uint16 rhs
    )
    {
        // check if there are other references to our data
        if (data->references != 1)
        {
            data->references -= 1;
            try {
                data = new data_record(slack);
            } catch (...) { data->references += 1; throw; }
        }
        else
        {
            data->digits_used = 1;
        }
        
        *(data->number) = rhs;

        return *this;
    }

// ----------------------------------------------------------------------------------------

    bigint_kernel_2& bigint_kernel_2::
    operator++ (
    )
    {
        // if there are other references to this data then make a copy of it
        if (data->references != 1)
        {
            data_record* temp = new data_record(data->digits_used+slack);
            data->references -= 1;
            increment(data,temp);
            data = temp;
        }
        // or if we need to enlarge data then do so
        else if (data->digits_used == data->size)
        {
            data_record* temp = new data_record(data->digits_used+slack);
            increment(data,temp);
            delete data;
            data = temp;
        }
        else
        {
            increment(data,data);
        }

        return *this;
    }

// ----------------------------------------------------------------------------------------

    const bigint_kernel_2 bigint_kernel_2::
    operator++ (
        int
    )
    {
        data_record* temp; // this is the copy of temp we will return in the end
         
        data_record* temp2 = new data_record(data->digits_used+slack);
        increment(data,temp2);
        
        temp = data;
        data = temp2;

        return bigint_kernel_2(temp,0);
    }

// ----------------------------------------------------------------------------------------

    bigint_kernel_2& bigint_kernel_2::
    operator-- (
    )
    {
        // if there are other references to this data 
        if (data->references != 1)
        {
            data_record* temp = new data_record(data->digits_used+slack);
            data->references -= 1;
            decrement(data,temp);
            data = temp;
        }
        else
        {
            decrement(data,data);
        }

        return *this;
    }

// ----------------------------------------------------------------------------------------

    const bigint_kernel_2 bigint_kernel_2::
    operator-- (
        int
    )
    {
        data_record* temp; // this is the copy of temp we will return in the end
         
        data_record* temp2 = new data_record(data->digits_used+slack);
        decrement(data,temp2);
        
        temp = data;
        data = temp2;

        return bigint_kernel_2(temp,0);
    }

// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------
    // private member function definitions
// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------

    void bigint_kernel_2::
    short_add (
        const data_record* data,        
        uint16 value,
        data_record* result
    ) const
    {
        // put value into the carry part of temp
        uint32 temp = value;
        temp <<= 16;

        
        const uint16* number = data->number;
        const uint16* end = number + data->digits_used; // one past the end of number
        uint16* r = result->number;

        while (number != end)
        {
            // add *number and the current carry
            temp = *number + (temp>>16);
            // put the low word of temp into *r
            *r = static_cast<uint16>(temp & 0xFFFF);

            ++number;
            ++r;
        }

        // if there is a final carry
        if ((temp>>16) != 0)
        {
            result->digits_used = data->digits_used + 1;
            // store the carry in the most significant digit of the result
            *r = static_cast<uint16>(temp>>16); 
        }
        else
        {
            result->digits_used = data->digits_used;
        }
    }

// ----------------------------------------------------------------------------------------

    void bigint_kernel_2::
    short_sub (
        const data_record* data,        
        uint16 value,
        data_record* result
    ) const
    {
        

        const uint16* number = data->number;
        const uint16* end = number + data->digits_used - 1;
        uint16* r = result->number;

        uint32 temp = *number - value;

        // put the low word of temp into *data 
        *r = static_cast<uint16>(temp & 0xFFFF);

        
        while (number != end)
        {
            ++number;
            ++r;

            // subtract the carry from *number 
            temp = *number - (temp>>31);

            // put the low word of temp into *r 
            *r = static_cast<uint16>(temp & 0xFFFF);
        }

        // if we lost a digit in the subtraction
        if (*r == 0)
        {
            if (data->digits_used == 1)
                result->digits_used = 1;
            else
                result->digits_used = data->digits_used - 1;
        }
        else
        {
            result->digits_used = data->digits_used;
        }


    }

// ----------------------------------------------------------------------------------------

    void bigint_kernel_2::
    short_mul (
        const data_record* data,        
        uint16 value,
        data_record* result
    ) const
    {
        
        uint32 temp = 0;


        const uint16* number = data->number;        
        uint16* r = result->number;
        const uint16* end = r + data->digits_used;



        while ( r != end)
        {

            // multiply *data and value and add in the carry
            temp = *number*(uint32)value + (temp>>16);

            // put the low word of temp into *data
            *r = static_cast<uint16>(temp & 0xFFFF);

            ++number;
            ++r;
        }

        // if there is a final carry
        if ((temp>>16) != 0)
        {
            result->digits_used = data->digits_used + 1;
            // put the final carry into the most significant digit of the result
            *r = static_cast<uint16>(temp>>16);
        }
        else
        {
            result->digits_used = data->digits_used;
        }


    }

// ----------------------------------------------------------------------------------------

    void bigint_kernel_2::
    short_div (
        const data_record* data,        
        uint16 value,   
        data_record* result,
        uint16& rem
    ) const
    {
        
        uint16 remainder = 0;
        uint32 temp;

        

        const uint16* number = data->number + data->digits_used - 1;
        const uint16* end = number - data->digits_used;
        uint16* r = result->number + data->digits_used - 1;


        // if we are losing a digit in this division
        if (*number < value)
        {
            if (data->digits_used == 1)
                result->digits_used = 1;
            else
                result->digits_used = data->digits_used - 1;
        }
        else
        {
            result->digits_used = data->digits_used;
        }


        // perform the actual division
        while (number != end)
        {
           
            temp = *number + (((uint32)remainder)<<16);

            *r = static_cast<uint16>(temp/value);
            remainder = static_cast<uint16>(temp%value);

            --number;
            --r;
        }

        rem = remainder;
    }

// ----------------------------------------------------------------------------------------

    void bigint_kernel_2::
    long_add (
        const data_record* lhs,
        const data_record* rhs,
        data_record* result
    ) const
    {
        // put value into the carry part of temp
        uint32 temp=0;        

        uint16* min_num;  // the number with the least digits used
        uint16* max_num;  // the number with the most digits used
        uint16* min_end;  // one past the end of min_num
        uint16* max_end;  // one past the end of max_num
        uint16* r = result->number;

        uint32 max_digits_used;
        if (lhs->digits_used < rhs->digits_used)
        {
            max_digits_used = rhs->digits_used;
            min_num = lhs->number;
            max_num = rhs->number;
            min_end = min_num + lhs->digits_used;
            max_end = max_num + rhs->digits_used;
        }
        else
        {
            max_digits_used = lhs->digits_used;
            min_num = rhs->number;
            max_num = lhs->number;
            min_end = min_num + rhs->digits_used;
            max_end = max_num + lhs->digits_used;
        }

        


        while (min_num != min_end)
        {
            // add *min_num, *max_num and the current carry
            temp = *min_num + *max_num + (temp>>16);
            // put the low word of temp into *r
            *r = static_cast<uint16>(temp & 0xFFFF);

            ++min_num;
            ++max_num;
            ++r;
        }


        while (max_num != max_end)
        {
            // add *max_num and the current carry
            temp = *max_num + (temp>>16);
            // put the low word of temp into *r
            *r = static_cast<uint16>(temp & 0xFFFF);

            ++max_num;
            ++r;
        }        

        // check if there was a final carry
        if ((temp>>16) != 0)
        {
            result->digits_used = max_digits_used + 1;
            // put the carry into the most significant digit in the result
            *r = static_cast<uint16>(temp>>16);
        }
        else
        {
            result->digits_used = max_digits_used;
        }

        
    }

// ----------------------------------------------------------------------------------------

    void bigint_kernel_2::
    long_sub (
        const data_record* lhs,
        const data_record* rhs,
        data_record* result
    ) const
    {


        const uint16* number1 = lhs->number;
        const uint16* number2 = rhs->number;
        const uint16* end = number2 + rhs->digits_used;
        uint16* r = result->number;



        uint32 temp =0;

        
        while (number2 != end)
        {

            // subtract *number2 from *number1 and then subtract any carry
            temp = *number1 - *number2 - (temp>>31);

            // put the low word of temp into *r 
            *r = static_cast<uint16>(temp & 0xFFFF);

            ++number1;
            ++number2;
            ++r;
        }

        end = lhs->number + lhs->digits_used;
        while (number1 != end)
        {

            // subtract the carry from *number1 
            temp = *number1 - (temp>>31);

            // put the low word of temp into *r 
            *r = static_cast<uint16>(temp & 0xFFFF);

            ++number1;
            ++r;
        }

        // if we are using one less digit
        if (*(r-1) == 0)
        {
            if (lhs->digits_used != 1)
                result->digits_used = lhs->digits_used - 1;
            else
                result->digits_used = 1;
        }
        else
        {
            result->digits_used = lhs->digits_used;
        }
    }

// ----------------------------------------------------------------------------------------

    void bigint_kernel_2::
    long_div (
        const data_record* lhs,
        const data_record* rhs,
        data_record* result,
        data_record* remainder
    ) const
    {
        // zero result
        result->digits_used = 1;
        *(result->number) = 0;

        uint16* a;
        uint16* b;
        uint16* end;

        // copy lhs into remainder
        remainder->digits_used = lhs->digits_used;
        a = remainder->number;
        end = a + remainder->digits_used;
        b = lhs->number;
        while (a != end)
        {
            *a = *b;
            ++a;
            ++b;
        }


        // if rhs is bigger than lhs then result == 0 and remainder == lhs
        // so then we can quit right now
        if (is_less_than(lhs,rhs))
        {
            return;            
        }


        // make a temporary number
        data_record temp(lhs->digits_used + slack);


        // shift rhs left until it is one shift away from being larger than lhs and
        // put the number of left shifts necessary into shifts
        uint32 shifts; 
        shifts = (lhs->digits_used - rhs->digits_used) * 8;

        shift_left(rhs,&temp,shifts);


        // while (lhs > temp)
        while (is_less_than(&temp,lhs))
        {
            shift_left(&temp,&temp,1);
            ++shifts;
        }
        // make sure lhs isn't smaller than temp
        while (is_less_than(lhs,&temp))
        {
            shift_right(&temp,&temp);
            --shifts;
        }

        
        
        // we want to execute the loop shifts +1 times
        ++shifts;
        while (shifts != 0)
        {
            shift_left(result,result,1);
            // if (temp <= remainder)
            if (!is_less_than(remainder,&temp))
            {
                long_sub(remainder,&temp,remainder);
                
                // increment result
                uint16* r = result->number;
                uint16* end = r + result->digits_used;
                while (true)
                {
                    ++(*r);
                    // if there was no carry then we are done
                    if (*r != 0)
                        break;

                    ++r;

                    // if we hit the end of r and there is still a carry then
                    // the next digit of r is 1 and there is one more digit used
                    if (r == end)
                    {
                        *r = 1;
                        ++(result->digits_used);
                        break;
                    }
                }
            }
            shift_right(&temp,&temp);
            --shifts;
        }
        
        
    }

// ----------------------------------------------------------------------------------------

    void bigint_kernel_2::
    long_mul (
        const data_record* lhs,
        const data_record* rhs,
        data_record* result
    ) const
    {
        // if one of the numbers is small then use this simple but O(n^2) algorithm
        if (std::min(lhs->digits_used, rhs->digits_used) < 10)
        {
            // make result be zero
            result->digits_used = 1;
            *(result->number) = 0;


            const data_record* aa;
            const data_record* bb;

            if (lhs->digits_used < rhs->digits_used)
            {
                // make copies of lhs and rhs and give them an appropriate amount of
                // extra memory so there won't be any overflows
                aa = lhs;
                bb = rhs;
            }
            else
            {
                // make copies of lhs and rhs and give them an appropriate amount of
                // extra memory so there won't be any overflows
                aa = rhs;
                bb = lhs;
            }

            // copy the larger(approximately) of lhs and rhs into b
            data_record b(*bb,aa->digits_used+slack); 


            uint32 shift_value = 0;
            uint16* anum = aa->number;
            uint16* end = anum + aa->digits_used;
            while (anum != end )
            {
                uint16 bit = 0x0001;

                for (int i = 0; i < 16; ++i)
                {
                    // if the specified bit of a is 1
                    if ((*anum & bit) != 0)
                    {
                        shift_left(&b,&b,shift_value);
                        shift_value = 0;
                        long_add(&b,result,result);
                    }
                    ++shift_value;
                    bit <<= 1;
                }

                ++anum;                        
            }
        }
        else  // else if both lhs and rhs are large then use the more complex 
              // O(n*logn) algorithm
        {
            uint32 size = 1;
            // make size a power of 2
            while (size < (lhs->digits_used + rhs->digits_used)*2)  
            {
                size *= 2;
            }

            // allocate some temporary space so we can do the FFT
            ct* a = new ct[size];
            ct* b; try {b = new ct[size]; } catch (...) { delete [] a; throw; }

            // load lhs into the a array.  We are breaking the input number into 
            // 8bit chunks for the purpose of using this fft algorithm.  The reason 
            // for this is so that we have smaller numbers coming out of the final 
            // ifft.  This helps avoid overflow.
            for (uint32 i = 0; i < lhs->digits_used; ++i)
            {
                a[i*2] = ct((t)(lhs->number[i]&0xFF),0);
                a[i*2+1] = ct((t)(lhs->number[i]>>8),0);
            }
            for (uint32 i = lhs->digits_used*2; i < size; ++i)
            {
                a[i] = 0;
            }

            // load rhs into the b array
            for (uint32 i = 0; i < rhs->digits_used; ++i)
            {
                b[i*2] = ct((t)(rhs->number[i]&0xFF),0);
                b[i*2+1] = ct((t)(rhs->number[i]>>8),0);
            }
            for (uint32 i = rhs->digits_used*2; i < size; ++i)
            {
                b[i] = 0;
            }

            // perform the forward fft of a and b
            fft(a,size);
            fft(b,size);

            const double l = 1.0/size;

            // do the pointwise multiply of a and b and also apply the scale
            // factor in this loop too.
            for (unsigned long i = 0; i < size; ++i)
            {
                a[i] = l*a[i]*b[i];
            }

            // Now compute the inverse fft of the pointwise multiplication of a and b.  
            // This is basically the result.  We just have to take care of any carries 
            // that should happen.
            ifft(a,size);

            // loop over the result and propigate any carries that need to take place.  
            // We will also be moving the resulting numbers into result->number at 
            // the same time.
            uint64 carry = 0;
            result->digits_used = 0;
            int zeros = 0;
            const uint32 len = lhs->digits_used + rhs->digits_used;
            for (unsigned long i = 0; i < len; ++i)
            {
                uint64 num1 = static_cast<uint64>(floor(a[i*2].real()+0.5));
                num1 += carry;
                carry = 0;
                if (num1 > 255)
                {
                    carry = num1 >> 8;
                    num1 = (num1&0xFF);
                }

                uint64 num2 = static_cast<uint64>(floor(a[i*2+1].real()+0.5));
                num2 += carry;
                carry = 0;
                if (num2 > 255)
                {
                    carry = num2 >> 8;
                    num2 = (num2&0xFF);
                }

                // put the new number into its final place
                num1 = (num2<<8) | num1;
                result->number[i] = static_cast<uint16>(num1);

                // keep track of the number of leading zeros
                if (num1 == 0)
                    ++zeros;
                else
                    zeros = 0;
                ++(result->digits_used);
            }

            // adjust digits_used so that it reflects the actual number
            // of non-zero digits in our representation.
            result->digits_used -= zeros;

            // if the result was zero then adjust the result accordingly
            if (result->digits_used == 0)
            {
                // make result be zero
                result->digits_used = 1;
                *(result->number) = 0;
            }

            // free all the temporary buffers
            delete [] a;
            delete [] b;
        }
    }

// ----------------------------------------------------------------------------------------

    void bigint_kernel_2::
    shift_left (
        const data_record* data,
        data_record* result,
        uint32 shift_amount
    ) const
    {
        uint32 offset = shift_amount/16;
        shift_amount &= 0xf;  // same as shift_amount %= 16;

        uint16* r = result->number + data->digits_used + offset; // result
        uint16* end = data->number;
        uint16* s = end + data->digits_used; // source
        const uint32 temp = 16 - shift_amount;

        *r = (*(--s) >> temp);
        // set the number of digits used in the result
        // if the upper bits from *s were zero then don't count this first word
        if (*r == 0)
        {
            result->digits_used = data->digits_used + offset;
        }
        else
        {
            result->digits_used = data->digits_used + offset + 1;
        }
        --r;

        while (s != end)
        {
            *r = ((*s << shift_amount) | ( *(s-1) >> temp));
            --r;
            --s;
        }
        *r = *s << shift_amount;

        // now zero the rest of the result
        end = result->number;
        while (r != end)
            *(--r) = 0;

    }

// ----------------------------------------------------------------------------------------

    void bigint_kernel_2::
    shift_right (
        const data_record* data,
        data_record* result
    ) const
    {

            uint16* r = result->number; // result
            uint16* s = data->number; // source
            uint16* end = s + data->digits_used - 1;

            while (s != end)
            {
                *r = (*s >> 1) | (*(s+1) << 15);
                ++r;
                ++s;
            }
            *r = *s >> 1;


            // calculate the new number for digits_used
            if (*r == 0)
            {
                if (data->digits_used != 1)
                    result->digits_used = data->digits_used - 1;
                else
                    result->digits_used = 1;
            }
            else
            {
                result->digits_used = data->digits_used;
            }
  

    }

// ----------------------------------------------------------------------------------------

    bool bigint_kernel_2::
    is_less_than (
        const data_record* lhs,
        const data_record* rhs
    ) const
    {
        uint32 lhs_digits_used = lhs->digits_used;
        uint32 rhs_digits_used = rhs->digits_used;

        // if lhs is definitely less than rhs
        if (lhs_digits_used < rhs_digits_used )
            return true;
        // if lhs is definitely greater than rhs
        else if (lhs_digits_used > rhs_digits_used)
            return false;
        else 
        {
            uint16* end = lhs->number;
            uint16* l = end         + lhs_digits_used;
            uint16* r = rhs->number + rhs_digits_used;
            
            while (l != end)
            {
                --l;
                --r;
                if (*l < *r)
                    return true;
                else if (*l > *r)
                    return false;
            }

            // at this point we know that they are equal
            return false;
        }

    }

// ----------------------------------------------------------------------------------------

    bool bigint_kernel_2::
    is_equal_to (
        const data_record* lhs,
        const data_record* rhs
    ) const
    {
        // if lhs and rhs are definitely not equal
        if (lhs->digits_used != rhs->digits_used )
        {
            return false;
        }
        else 
        {            
            uint16* l = lhs->number;
            uint16* r = rhs->number;
            uint16* end = l + lhs->digits_used;
            
            while (l != end)
            {
                if (*l != *r)
                    return false;
                ++l;
                ++r;
            }

            // at this point we know that they are equal
            return true;
        }

    }

// ----------------------------------------------------------------------------------------

    void bigint_kernel_2::
    increment (
        const data_record* source,
        data_record* dest
    ) const
    {
        uint16* s = source->number;
        uint16* d = dest->number;
        uint16* end = s + source->digits_used;
        while (true)
        {
            *d = *s + 1;

            // if there was no carry then break out of the loop
            if (*d != 0)
            {
                dest->digits_used = source->digits_used;

                // copy the rest of the digits over to d
                ++d; ++s;
                while (s != end)
                {
                    *d = *s;
                    ++d;
                    ++s;
                }

                break;
            }
            

            ++s;            

            // if we have hit the end of s and there was a carry up to this point
            // then just make the next digit 1 and add one to the digits used
            if (s == end)
            {
                ++d;
                dest->digits_used = source->digits_used + 1;
                *d = 1;
                break;
            }

            ++d;
        }
    }

// ----------------------------------------------------------------------------------------

    void bigint_kernel_2::
    decrement (
        const data_record* source,
        data_record* dest
    ) const
    {
        uint16* s = source->number;
        uint16* d = dest->number;
        uint16* end = s + source->digits_used;
        while (true)
        {
            *d = *s - 1;

            // if there was no carry then break out of the loop
            if (*d != 0xFFFF)
            {
                // if we lost a digit in the subtraction 
                if (*d == 0 && s+1 == end)
                {
                    if (source->digits_used == 1)
                        dest->digits_used = 1;
                    else
                        dest->digits_used = source->digits_used - 1;
                }
                else
                {
                    dest->digits_used = source->digits_used;
                }
                break;
            }
            else
            {
                ++d;
                ++s;
            }

        }

        // copy the rest of the digits over to d
        ++d;
        ++s;
        while (s != end)
        {
            *d = *s;
            ++d;
            ++s;
        }
    }

// ----------------------------------------------------------------------------------------

    void bigint_kernel_2::
    fft (
        ct* data, 
        unsigned long len
    ) const 
    {
        const t pi2 = -2.0*3.1415926535897932384626433832795028841971693993751;

        const unsigned long half = len/2;

        std::vector<ct> twiddle_factors;
        twiddle_factors.resize(half);

        // compute the complex root of unity w
        const t temp = pi2/len;
        ct w = ct(cos(temp),sin(temp));

        ct w_pow = 1;

        // compute the twiddle factors
        for (std::vector<ct>::size_type j = 0; j < twiddle_factors.size(); ++j)
        {
            twiddle_factors[j] = w_pow; 
            w_pow *= w;
        }

        ct a, b;

        // now compute the decimation in frequency.  This first
        // outer loop loops log2(len) number of times
        unsigned long skip = 1;
        for (unsigned long step = half; step != 0; step >>= 1)
        {
            // do blocks of butterflies in this loop
            for (unsigned long j = 0; j < len; j += step*2)
            {
                // do step butterflies
                for (unsigned long k = 0; k < step; ++k)
                {
                    const unsigned long a_idx = j+k;
                    const unsigned long b_idx = j+k+step;
                    a = data[a_idx] + data[b_idx];
                    b = (data[a_idx] - data[b_idx])*twiddle_factors[k*skip];
                    data[a_idx] = a;
                    data[b_idx] = b;
                }
            }
            skip *= 2;
        }
    }

// ----------------------------------------------------------------------------------------

    void bigint_kernel_2::
    ifft(
        ct* data, 
        unsigned long len
    ) const 
    {
        const t pi2 = 2.0*3.1415926535897932384626433832795028841971693993751;

        const unsigned long half = len/2;

        std::vector<ct> twiddle_factors;
        twiddle_factors.resize(half);

        // compute the complex root of unity w
        const t temp = pi2/len;
        ct w = ct(cos(temp),sin(temp));

        ct w_pow = 1;

        // compute the twiddle factors
        for (std::vector<ct>::size_type j = 0; j < twiddle_factors.size(); ++j)
        {
            twiddle_factors[j] = w_pow; 
            w_pow *= w;
        }

        ct a, b;

        // now compute the inverse decimation in frequency.  This first
        // outer loop loops log2(len) number of times
        unsigned long skip = half;
        for (unsigned long step = 1; step <= half; step <<= 1)
        {
            // do blocks of butterflies in this loop
            for (unsigned long j = 0; j < len; j += step*2)
            {
                // do step butterflies
                for (unsigned long k = 0; k < step; ++k)
                {
                    const unsigned long a_idx = j+k;
                    const unsigned long b_idx = j+k+step;
                    data[b_idx] *= twiddle_factors[k*skip];
                    a = data[a_idx] + data[b_idx];
                    b = data[a_idx] - data[b_idx];
                    data[a_idx] = a;
                    data[b_idx] = b;
                }
            }
            skip /= 2;
        }
    }

// ----------------------------------------------------------------------------------------

}
#endif // DLIB_BIGINT_KERNEL_2_CPp_

