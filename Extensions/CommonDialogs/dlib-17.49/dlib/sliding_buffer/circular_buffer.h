// Copyright (C) 2012  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#ifndef DLIB_CIRCULAR_BuFFER_H__
#define DLIB_CIRCULAR_BuFFER_H__

#include "circular_buffer_abstract.h"
#include <vector>
#include "../algs.h"
#include "../serialize.h"

namespace dlib
{

// ----------------------------------------------------------------------------------------

    template <
        typename T
        >
    class circular_buffer
    {
    public:
        typedef default_memory_manager mem_manager_type;
        typedef T value_type;
        typedef T type;

        circular_buffer()
        {
            offset = 0;
        }

        void clear (
        )
        {
            offset = 0;
            data.clear();
        }

        T& operator[] ( unsigned long i) 
        { 
            DLIB_ASSERT(i < size(),
                "\t T& circular_buffer::operator[](i)"
                << "\n\t You have supplied an invalid index"
                << "\n\t this:   " << this
                << "\n\t i:      " << i 
                << "\n\t size(): " << size()
            );
            return data[(i+offset)%data.size()]; 
        }

        const T& operator[] ( unsigned long i) const 
        { 
            DLIB_ASSERT(i < size(),
                "\t const T& circular_buffer::operator[](i)"
                << "\n\t You have supplied an invalid index"
                << "\n\t this:   " << this
                << "\n\t i:      " << i 
                << "\n\t size(): " << size()
            );
            return data[(i+offset)%data.size()]; 
        }

        void resize(unsigned long size) 
        {  
            offset = 0;
            data.resize(size); 
        }

        void assign(
            unsigned long size, 
            const T& value
        ) 
        { 
            offset = 0;
            data.assign(size,value); 
        }

        unsigned long size() const { return data.size(); }

        void push_front(const T& value)
        {
            if (data.size() != 0)
            {
                offset = (offset - 1 + data.size())%data.size();
                data[offset] = value;
            }
        }

        void push_back(const T& value)
        {
            if (data.size() != 0)
            {
                data[offset] = value;
                offset = (offset + 1 + data.size())%data.size();
            }
        }

        T& front(
        ) 
        { 
            DLIB_CASSERT(size() > 0,
                "\t T& circular_buffer::front()"
                << "\n\t You can't call front() on an empty circular_buffer"
                << "\n\t this:   " << this
            );
            return (*this)[0];
        }

        const T& front(
        ) const
        { 
            DLIB_CASSERT(size() > 0,
                "\t const T& circular_buffer::front()"
                << "\n\t You can't call front() on an empty circular_buffer"
                << "\n\t this:   " << this
            );
            return (*this)[0];
        }

        T& back(
        ) 
        { 
            DLIB_CASSERT(size() > 0,
                "\t T& circular_buffer::back()"
                << "\n\t You can't call back() on an empty circular_buffer"
                << "\n\t this:   " << this
            );
            return (*this)[size()-1];
        }

        const T& back(
        ) const
        { 
            DLIB_CASSERT(size() > 0,
                "\t const T& circular_buffer::back()"
                << "\n\t You can't call back() on an empty circular_buffer"
                << "\n\t this:   " << this
            );
            return (*this)[size()-1];
        }

        void swap( circular_buffer& item)
        {
            std::swap(item.offset, offset);
            data.swap(item.data);
        }


    private:
        std::vector<T> data;

        unsigned long offset;
    };

// ----------------------------------------------------------------------------------------

    template <
        typename T
        >
    void swap (
        circular_buffer<T>& a, 
        circular_buffer<T>& b 
    ) { a.swap(b); }   

// ----------------------------------------------------------------------------------------

    template <
        typename T
        >
    void serialize (
        const circular_buffer<T>& item, 
        std::ostream& out 
    )   
    {
        try
        {
            serialize(item.size(),out);
            for (unsigned long i = 0; i < item.size(); ++i)
                serialize(item[i],out);
        }
        catch (serialization_error& e)
        { 
            throw serialization_error(e.info + "\n   while serializing object of type circular_buffer"); 
        }

    }

// ----------------------------------------------------------------------------------------

    template <
        typename T
        >
    void deserialize (
        circular_buffer<T>& item, 
        std::istream& in
    )   
    {
        try
        {
            unsigned long size;
            deserialize(size,in);
            item.resize(size);
            for (unsigned long i = 0; i < size; ++i)
                deserialize(item[i],in);
        }
        catch (serialization_error& e)
        { 
            item.clear();
            throw serialization_error(e.info + "\n   while deserializing object of type circular_buffer"); 
        }
    }

// ----------------------------------------------------------------------------------------

}

#endif // DLIB_CIRCULAR_BuFFER_H__

