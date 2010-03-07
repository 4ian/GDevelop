// Copyright (C) 2003  Davis E. King (davisking@users.sourceforge.net)
// License: GNU LGPL   See LICENSE.txt for the full license.
#ifndef DLIB_ARRAY_KERNEl_2_
#define DLIB_ARRAY_KERNEl_2_

#include "array_kernel_abstract.h"
#include "../interfaces/enumerable.h"
#include "../algs.h"
#include "../serialize.h"

namespace dlib
{

    template <
        typename T,
        typename mem_manager = memory_manager<char>::kernel_1a
        >
    class array_kernel_2 : public enumerable<T>
    {

        /*!
            INITIAL VALUE
                - array_size == 0    
                - max_array_size == 0
                - array_elements == 0
                - pos == 0
                - last_pos == 0
                - _at_start == true

            CONVENTION
                - array_size == size() 
                - max_array_size == max_size() 
                - if (max_array_size > 0)
                    - array_elements == pointer to max_array_size elements of type T
                - else
                    - array_elements == 0

                - if (array_size > 0) 
                    - last_pos == array_elements + array_size - 1
                - else
                    - last_pos == 0


                - at_start() == _at_start 
                - current_element_valid() == pos != 0
                - if (current_element_valid()) then
                    - *pos == element()
        !*/

    public:

        typedef T type;
        typedef mem_manager mem_manager_type;

        array_kernel_2 (
        ) :
            array_size(0),
            max_array_size(0),
            array_elements(0),
            pos(0),
            last_pos(0),
            _at_start(true)
        {}

        virtual ~array_kernel_2 (
        ); 

        void clear (
        );

        inline const T& operator[] (
            unsigned long pos
        ) const;

        inline T& operator[] (
            unsigned long pos
        );

        void set_size (
            unsigned long size
        );

        inline unsigned long max_size(
        ) const;

        void set_max_size(
            unsigned long max
        );

        void swap (
            array_kernel_2& item
        );

        // functions from the enumerable interface
        inline unsigned long size (
        ) const;

        inline bool at_start (
        ) const;

        inline void reset (
        ) const;

        bool current_element_valid (
        ) const;

        inline const T& element (
        ) const;

        inline T& element (
        );

        bool move_next (
        ) const;

    private:

        typename mem_manager::template rebind<T>::other pool;

        // data members
        unsigned long array_size;
        unsigned long max_array_size;
        T* array_elements;

        mutable T* pos;
        T* last_pos;
        mutable bool _at_start;

        // restricted functions
        array_kernel_2(array_kernel_2<T>&);        // copy constructor
        array_kernel_2<T>& operator=(array_kernel_2<T>&);    // assignment operator        

    };

    template <
        typename T,
        typename mem_manager 
        >
    inline void swap (
        array_kernel_2<T,mem_manager>& a, 
        array_kernel_2<T,mem_manager>& b 
    ) { a.swap(b); }

// ----------------------------------------------------------------------------------------

    template <
        typename T,
        typename mem_manager
        >
    void serialize (
        const array_kernel_2<T,mem_manager>& item,  
        std::ostream& out
    )
    {
        try
        {
            serialize(item.max_size(),out);
            serialize(item.size(),out);

            for (unsigned long i = 0; i < item.size(); ++i)
                serialize(item[i],out);
        }
        catch (serialization_error e)
        { 
            throw serialization_error(e.info + "\n   while serializing object of type array_kernel_2"); 
        }
    }

    template <
        typename T,
        typename mem_manager
        >
    void deserialize (
        array_kernel_2<T,mem_manager>& item,  
        std::istream& in
    )
    {
        try
        {
            unsigned long max_size, size;
            deserialize(max_size,in);
            deserialize(size,in);
            item.set_max_size(max_size);
            item.set_size(size);
            for (unsigned long i = 0; i < size; ++i)
                deserialize(item[i],in);
        }
        catch (serialization_error e)
        { 
            item.clear();
            throw serialization_error(e.info + "\n   while deserializing object of type array_kernel_2"); 
        }
    }

// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------
// member function definitions
// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------

    template <
        typename T,
        typename mem_manager
        >
    array_kernel_2<T,mem_manager>::
    ~array_kernel_2 (
    )
    {
        if (array_elements)
        {
            pool.deallocate_array(array_elements);
        }
    }

// ----------------------------------------------------------------------------------------

    template <
        typename T,
        typename mem_manager
        >
    void array_kernel_2<T,mem_manager>::
    clear (
    )
    {
        reset();
        last_pos = 0;
        array_size = 0;
        if (array_elements)
        {
            pool.deallocate_array(array_elements);
        }
        array_elements = 0;
        max_array_size = 0;

    }

// ----------------------------------------------------------------------------------------

    template <
        typename T,
        typename mem_manager
        >
    const T& array_kernel_2<T,mem_manager>::
    operator[] (
        unsigned long pos
    ) const
    {
        return array_elements[pos];
    }

// ----------------------------------------------------------------------------------------

    template <
        typename T,
        typename mem_manager
        >
    T& array_kernel_2<T,mem_manager>::
    operator[] (
        unsigned long pos
    ) 
    {
        return array_elements[pos];
    }

// ----------------------------------------------------------------------------------------

    template <
        typename T,
        typename mem_manager
        >
    void array_kernel_2<T,mem_manager>::
    set_size (
        unsigned long size
    )
    {
        reset();
        array_size = size;
        if (size > 0)
            last_pos = array_elements + size - 1;
        else
            last_pos = 0;
    }

// ----------------------------------------------------------------------------------------

    template <
        typename T,
        typename mem_manager
        >
    unsigned long array_kernel_2<T,mem_manager>::
    size (
    ) const
    {
        return array_size;
    }

// ----------------------------------------------------------------------------------------

    template <
        typename T,
        typename mem_manager
        >
    void array_kernel_2<T,mem_manager>::
    set_max_size(
        unsigned long max
    )
    {
        reset();
        array_size = 0;
        last_pos = 0;
        if (max != 0)
        {
            // if new max size is different
            if (max != max_array_size)
            {
                if (array_elements)
                {
                    pool.deallocate_array(array_elements);
                }
                // try to get more memroy
                try { array_elements = pool.allocate_array(max); }
                catch (...) { array_elements = 0;  max_array_size = 0; throw; }
                max_array_size = max;
            }

        }
        // if the array is being made to be zero
        else
        {
            if (array_elements)
                pool.deallocate_array(array_elements);
            max_array_size = 0;
            array_elements = 0;
        }
    }

// ----------------------------------------------------------------------------------------

    template <
        typename T,
        typename mem_manager
        >
    unsigned long array_kernel_2<T,mem_manager>::
    max_size (
    ) const
    {
        return max_array_size;
    }

// ----------------------------------------------------------------------------------------

    template <
        typename T,
        typename mem_manager
        >
    void array_kernel_2<T,mem_manager>::
    swap (
        array_kernel_2<T,mem_manager>& item
    )
    {
        unsigned long    array_size_temp        = item.array_size;
        unsigned long    max_array_size_temp    = item.max_array_size;
        T*               array_elements_temp    = item.array_elements;

        item.array_size         = array_size;
        item.max_array_size     = max_array_size;
        item.array_elements     = array_elements;

        array_size        = array_size_temp;
        max_array_size    = max_array_size_temp;
        array_elements    = array_elements_temp;

        exchange(_at_start,item._at_start);
        exchange(pos,item.pos);
        exchange(last_pos,item.last_pos);
        pool.swap(item.pool);
    }

// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------
//           enumerable function definitions
// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------

    template <
        typename T,
        typename mem_manager
        >
    bool array_kernel_2<T,mem_manager>::
    at_start (
    ) const
    {
        return _at_start;
    }

// ----------------------------------------------------------------------------------------

    template <
        typename T,
        typename mem_manager
        >
    void array_kernel_2<T,mem_manager>::
    reset (
    ) const
    {
        _at_start = true;
        pos = 0;
    }

// ----------------------------------------------------------------------------------------

    template <
        typename T,
        typename mem_manager
        >
    bool array_kernel_2<T,mem_manager>::
    current_element_valid (
    ) const
    {
        return pos != 0;
    }

// ----------------------------------------------------------------------------------------

    template <
        typename T,
        typename mem_manager
        >
    const T& array_kernel_2<T,mem_manager>::
    element (
    ) const
    {
        return *pos;
    }

// ----------------------------------------------------------------------------------------

    template <
        typename T,
        typename mem_manager
        >
    T& array_kernel_2<T,mem_manager>::
    element (
    )
    {
        return *pos;
    }

// ----------------------------------------------------------------------------------------

    template <
        typename T,
        typename mem_manager
        >
    bool array_kernel_2<T,mem_manager>::
    move_next (
    ) const
    {
        if (!_at_start)
        {
            if (pos < last_pos)
            {
                ++pos;
                return true;
            }
            else
            {
                pos = 0;
                return false;
            }
        }
        else
        {
            _at_start = false;
            if (array_size > 0)
            {
                pos = array_elements;
                return true;
            }
            else
            {
                return false;
            }
        }
    }

// ----------------------------------------------------------------------------------------

}

#endif // DLIB_ARRAY_KERNEl_2_

