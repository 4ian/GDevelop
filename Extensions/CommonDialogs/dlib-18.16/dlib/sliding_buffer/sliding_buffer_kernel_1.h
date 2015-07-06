// Copyright (C) 2004  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#ifndef DLIB_SLIDING_BUFFER_KERNEl_1_
#define DLIB_SLIDING_BUFFER_KERNEl_1_

#include "sliding_buffer_kernel_abstract.h"
#include "../algs.h"
#include "../interfaces/enumerable.h"
#include "../serialize.h"

namespace dlib
{

    template <
        typename T
        >
    class sliding_buffer_kernel_1 : public enumerable<T>
    {
        /*!
            INITIAL VALUE
                - buffer_size == 0
                - buffer == 0
                - buffer_start == 0
                - current == 0
                - at_start_ == true

            CONVENTION
                - buffer_size == size()
                
                - element() == (*this)[current]
                - current_element_valid() == (current < buffer_size) && at_start_ == false
                - at_start() == at_start_

                - if (buffer_size != 0) then                    
                    - buffer[(buffer_start+i)&(mask)] == operator[](i)   
                    - mask == buffer_size-1
                - else
                    - buffer == 0
                    - buffer_size == 0
        !*/

    public:

        typedef T type;

        sliding_buffer_kernel_1 (
        ) :
            buffer_start(0),
            buffer_size(0),
            buffer(0),
            current(0),
            at_start_(true)
        {}

        virtual ~sliding_buffer_kernel_1 (
        ) { if (buffer) delete [] buffer; }

        void clear(
        ) 
        {
            buffer_size = 0; 
            if (buffer) delete [] buffer;
            buffer = 0;
            at_start_ = true;
            current = 0;
        }

        void set_size (
            unsigned long exp_size
        )
        {
            at_start_ = true;
            if (buffer) delete [] buffer;
            buffer_size = 1;
            while (exp_size != 0)
            {
                --exp_size;
                buffer_size <<= 1;            
            }
            mask = buffer_size-1;
            try { buffer = new T[buffer_size]; }
            catch (...) { buffer = 0; buffer_size = 0; throw; }
        }

        unsigned long size (
        ) const { return buffer_size; }

        void rotate_left (
            unsigned long amount
        ) { buffer_start = ((buffer_start-amount)&mask); at_start_ = true; }

        void rotate_right (
            unsigned long amount
        ) { buffer_start = ((buffer_start+amount)&mask); at_start_ = true;}

        const T& operator[] (
            unsigned long index
        ) const { return buffer[(buffer_start+index)&mask]; }

        T& operator[] (
            unsigned long index
        ) { return buffer[(buffer_start+index)&mask]; }

        unsigned long get_element_id(
            unsigned long index
        ) const { return ((buffer_start+index)&mask); }

        unsigned long get_element_index (
            unsigned long element_id 
        ) const { return ((element_id-buffer_start)&mask);}

        void swap (
            sliding_buffer_kernel_1<T>& item
        )
        {
            exchange(buffer_start,item.buffer_start);
            exchange(buffer_size,item.buffer_size);
            exchange(buffer,item.buffer);
            exchange(mask,item.mask);
            exchange(current,item.current);
            exchange(at_start_,item.at_start_);
        }


        bool at_start (
        ) const { return at_start_; }

        void reset (
        ) const { at_start_ = true; }

        bool current_element_valid (
        ) const { return (current < buffer_size) && (at_start_ == false); }

        const T& element (
        ) const { return (*this)[current]; }

        T& element (
        ) { return (*this)[current]; }

        bool move_next (
        ) const 
        { 
            if (at_start_ == false)
            {
                if (current+1 < buffer_size)
                {
                    ++current;
                    return true;
                }
                else
                {
                    current = buffer_size;
                    return false;
                }
            }
            else 
            {
                at_start_ = false;
                current = 0;
                return (buffer_size != 0);
            }
        }


    private:

        // data members
        unsigned long buffer_start;
        unsigned long buffer_size;
        T* buffer;
        unsigned long mask;


        mutable unsigned long current;
        mutable bool at_start_;

        // restricted functions
        sliding_buffer_kernel_1(sliding_buffer_kernel_1<T>&);        // copy constructor
        sliding_buffer_kernel_1<T>& operator=(sliding_buffer_kernel_1<T>&);    // assignment operator

    };      

    template <
        typename T
        >
    inline void swap (
        sliding_buffer_kernel_1<T>& a, 
        sliding_buffer_kernel_1<T>& b 
    ) { a.swap(b); }   

    template <
        typename T
        >
    void deserialize (
        sliding_buffer_kernel_1<T>& item, 
        std::istream& in
    )   
    {
        try
        {
            item.clear();
            unsigned long size;
            deserialize(size,in);
            if (size > 0)
            {
                int count = 0;
                while (size != 1)
                {
                    size /= 2;
                    ++count;
                }
                item.set_size(count);

                for (unsigned long i = 0; i < item.size(); ++i)
                    deserialize(item[i],in);
            }
        }
        catch (serialization_error e)
        { 
            item.clear();
            throw serialization_error(e.info + "\n   while deserializing object of type sliding_buffer_kernel_1"); 
        }
    }
}

#endif // DLIB_SLIDING_BUFFER_KERNEl_1_

