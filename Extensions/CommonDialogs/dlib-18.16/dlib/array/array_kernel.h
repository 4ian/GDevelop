// Copyright (C) 2003  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#ifndef DLIB_ARRAY_KERNEl_2_
#define DLIB_ARRAY_KERNEl_2_

#include "array_kernel_abstract.h"
#include "../interfaces/enumerable.h"
#include "../algs.h"
#include "../serialize.h"
#include "../sort.h"
#include "../is_kind.h"

namespace dlib
{

    template <
        typename T,
        typename mem_manager = default_memory_manager 
        >
    class array : public enumerable<T>
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

        // These typedefs are here for backwards compatibility with old versions of dlib.
        typedef array kernel_1a;
        typedef array kernel_1a_c;
        typedef array kernel_2a;
        typedef array kernel_2a_c;
        typedef array sort_1a;
        typedef array sort_1a_c;
        typedef array sort_1b;
        typedef array sort_1b_c;
        typedef array sort_2a;
        typedef array sort_2a_c;
        typedef array sort_2b;
        typedef array sort_2b_c;
        typedef array expand_1a;
        typedef array expand_1a_c;
        typedef array expand_1b;
        typedef array expand_1b_c;
        typedef array expand_1c;
        typedef array expand_1c_c;
        typedef array expand_1d;
        typedef array expand_1d_c;




        typedef T type;
        typedef T value_type;
        typedef mem_manager mem_manager_type;

        array (
        ) :
            array_size(0),
            max_array_size(0),
            array_elements(0),
            pos(0),
            last_pos(0),
            _at_start(true)
        {}

        explicit array (
            unsigned long new_size
        ) :
            array_size(0),
            max_array_size(0),
            array_elements(0),
            pos(0),
            last_pos(0),
            _at_start(true)
        {
            resize(new_size);
        }

        ~array (
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
            array& item
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

        void sort (
        );

        void resize (
            unsigned long new_size
        );

        const T& back (
        ) const;

        T& back (
        );

        void pop_back (
        );

        void pop_back (
            T& item
        );

        void push_back (
            T& item
        );

        typedef T* iterator;
        typedef const T* const_iterator;
        iterator                begin()                         { return array_elements; }
        const_iterator          begin() const                   { return array_elements; }
        iterator                end()                           { return array_elements+array_size; }
        const_iterator          end() const                     { return array_elements+array_size; }

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
        array(array<T>&);        // copy constructor
        array<T>& operator=(array<T>&);    // assignment operator        

    };

    template <
        typename T,
        typename mem_manager 
        >
    inline void swap (
        array<T,mem_manager>& a, 
        array<T,mem_manager>& b 
    ) { a.swap(b); }

// ----------------------------------------------------------------------------------------

    template <
        typename T,
        typename mem_manager
        >
    void serialize (
        const array<T,mem_manager>& item,  
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
            throw serialization_error(e.info + "\n   while serializing object of type array"); 
        }
    }

    template <
        typename T,
        typename mem_manager
        >
    void deserialize (
        array<T,mem_manager>& item,  
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
            throw serialization_error(e.info + "\n   while deserializing object of type array"); 
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
    array<T,mem_manager>::
    ~array (
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
    void array<T,mem_manager>::
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
    const T& array<T,mem_manager>::
    operator[] (
        unsigned long pos
    ) const
    {
        // make sure requires clause is not broken
        DLIB_ASSERT( pos < this->size() , 
            "\tconst T& array::operator[]"
            << "\n\tpos must < size()" 
            << "\n\tpos: " << pos 
            << "\n\tsize(): " << this->size()
            << "\n\tthis: " << this
            );

        return array_elements[pos];
    }

// ----------------------------------------------------------------------------------------

    template <
        typename T,
        typename mem_manager
        >
    T& array<T,mem_manager>::
    operator[] (
        unsigned long pos
    ) 
    {
        // make sure requires clause is not broken
        DLIB_ASSERT( pos < this->size() , 
            "\tT& array::operator[]"
            << "\n\tpos must be < size()" 
            << "\n\tpos: " << pos 
            << "\n\tsize(): " << this->size()
            << "\n\tthis: " << this
            );

        return array_elements[pos];
    }

// ----------------------------------------------------------------------------------------

    template <
        typename T,
        typename mem_manager
        >
    void array<T,mem_manager>::
    set_size (
        unsigned long size
    )
    {
        // make sure requires clause is not broken
        DLIB_CASSERT(( size <= this->max_size() ),
            "\tvoid array::set_size"
            << "\n\tsize must be <= max_size()"
            << "\n\tsize: " << size 
            << "\n\tmax size: " << this->max_size()
            << "\n\tthis: " << this
            );

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
    unsigned long array<T,mem_manager>::
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
    void array<T,mem_manager>::
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
    unsigned long array<T,mem_manager>::
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
    void array<T,mem_manager>::
    swap (
        array<T,mem_manager>& item
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
    bool array<T,mem_manager>::
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
    void array<T,mem_manager>::
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
    bool array<T,mem_manager>::
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
    const T& array<T,mem_manager>::
    element (
    ) const
    {
        // make sure requires clause is not broken
        DLIB_ASSERT(this->current_element_valid(),
            "\tconst T& array::element()"
            << "\n\tThe current element must be valid if you are to access it."
            << "\n\tthis: " << this
            );

        return *pos;
    }

// ----------------------------------------------------------------------------------------

    template <
        typename T,
        typename mem_manager
        >
    T& array<T,mem_manager>::
    element (
    )
    {
        // make sure requires clause is not broken
        DLIB_ASSERT(this->current_element_valid(),
            "\tT& array::element()"
            << "\n\tThe current element must be valid if you are to access it."
            << "\n\tthis: " << this
            );

        return *pos;
    }

// ----------------------------------------------------------------------------------------

    template <
        typename T,
        typename mem_manager
        >
    bool array<T,mem_manager>::
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
// ----------------------------------------------------------------------------------------
//                              Yet more functions
// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------

    template <
        typename T,
        typename mem_manager
        >
    void array<T,mem_manager>::
    sort (
    )
    {
        if (this->size() > 1)
        {
            // call the quick sort function for arrays that is in algs.h
            dlib::qsort_array(*this,0,this->size()-1);
        }
        this->reset();
    }

// ----------------------------------------------------------------------------------------

    template <
        typename T,
        typename mem_manager
        >
    void array<T,mem_manager>::
    resize (
        unsigned long new_size
    )
    {
        if (this->max_size() < new_size)
        {
            array temp;
            temp.set_max_size(new_size);
            temp.set_size(new_size);
            for (unsigned long i = 0; i < this->size(); ++i)
            {
                exchange((*this)[i],temp[i]);
            }
            temp.swap(*this);
        }
        else
        {
            this->set_size(new_size);
        }
    }

// ----------------------------------------------------------------------------------------

    template <
        typename T,
        typename mem_manager
        >
    T& array<T,mem_manager>::
    back (
    ) 
    {
        // make sure requires clause is not broken
        DLIB_ASSERT( this->size() > 0 , 
                      "\tT& array::back()"
                      << "\n\tsize() must be bigger than 0" 
                      << "\n\tsize(): " << this->size()
                      << "\n\tthis:   " << this
        );

        return (*this)[this->size()-1];
    }

// ----------------------------------------------------------------------------------------

    template <
        typename T,
        typename mem_manager
        >
    const T& array<T,mem_manager>::
    back (
    ) const
    {
        // make sure requires clause is not broken
        DLIB_ASSERT( this->size() > 0 , 
                      "\tconst T& array::back()"
                      << "\n\tsize() must be bigger than 0" 
                      << "\n\tsize(): " << this->size()
                      << "\n\tthis:   " << this
        );

        return (*this)[this->size()-1];
    }

// ----------------------------------------------------------------------------------------

    template <
        typename T,
        typename mem_manager
        >
    void array<T,mem_manager>::
    pop_back (
        T& item
    ) 
    {
        // make sure requires clause is not broken
        DLIB_ASSERT( this->size() > 0 , 
                      "\tvoid array::pop_back()"
                      << "\n\tsize() must be bigger than 0" 
                      << "\n\tsize(): " << this->size()
                      << "\n\tthis:   " << this
        );

        exchange(item,(*this)[this->size()-1]);
        this->set_size(this->size()-1);
    }

// ----------------------------------------------------------------------------------------

    template <
        typename T,
        typename mem_manager
        >
    void array<T,mem_manager>::
    pop_back (
    ) 
    {
        // make sure requires clause is not broken
        DLIB_ASSERT( this->size() > 0 , 
                      "\tvoid array::pop_back()"
                      << "\n\tsize() must be bigger than 0" 
                      << "\n\tsize(): " << this->size()
                      << "\n\tthis:   " << this
        );

        this->set_size(this->size()-1);
    }

// ----------------------------------------------------------------------------------------

    template <
        typename T,
        typename mem_manager
        >
    void array<T,mem_manager>::
    push_back (
        T& item
    ) 
    {
        if (this->max_size() == this->size())
        {
            // double the size of the array
            array temp;
            temp.set_max_size(this->size()*2 + 1);
            temp.set_size(this->size()+1);
            for (unsigned long i = 0; i < this->size(); ++i)
            {
                exchange((*this)[i],temp[i]);
            }
            exchange(item,temp[temp.size()-1]);
            temp.swap(*this);
        }
        else
        {
            this->set_size(this->size()+1);
            exchange(item,(*this)[this->size()-1]);
        }
    }

// ----------------------------------------------------------------------------------------

    template <typename T, typename MM>
    struct is_array <array<T,MM> >  
    {
        const static bool value = true;
    };

// ----------------------------------------------------------------------------------------

}

#endif // DLIB_ARRAY_KERNEl_2_

