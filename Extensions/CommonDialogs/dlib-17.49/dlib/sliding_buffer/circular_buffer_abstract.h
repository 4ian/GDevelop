// Copyright (C) 2012  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#undef DLIB_CIRCULAR_BuFFER_ABSTRACT_H__
#ifdef DLIB_CIRCULAR_BuFFER_ABSTRACT_H__

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
        /*!
            REQUIREMENTS ON T
                T must have a default constructor and be copyable.

            POINTERS AND REFERENCES TO INTERNAL DATA
                swap(), size(), front(), back(), and operator[] functions do 
                not invalidate pointers or references to internal data.
                All other functions have no such guarantee.

            INITIAL VALUE
                - size() == 0

            WHAT THIS OBJECT REPRESENTS
                This object is a circular buffer of objects of type T.  This means 
                that when objects are pushed onto one of its ends it does not grow 
                in size.  Instead, it shifts all elements over one to make room for 
                the new element and the element at the opposing end falls off the 
                buffer and is lost.
        !*/

    public:
        typedef default_memory_manager mem_manager_type;
        typedef T value_type;
        typedef T type;

        circular_buffer(
        );
        /*!
            ensures
                - #size() == 0
                - this object is properly initialized
        !*/

        void clear (
        );
        /*!
            ensures
                - this object has its initial value
                - #size() == 0
        !*/

        T& operator[] ( 
            unsigned long i
        ) const;
        /*!
            requires
                - i < size()
            ensures
                - returns a non-const reference to the i-th element of this circular buffer
        !*/

        const T& operator[] ( 
            unsigned long i
        ) const;
        /*!
            requires
                - i < size()
            ensures
                - returns a const reference to the i-th element of this circular buffer
        !*/

        void resize(
            unsigned long new_size
        ); 
        /*!
            ensures
                - #size() == new_size
        !*/

        void assign(
            unsigned long new_size, 
            const T& value
        ); 
        /*!
            ensures
                - #size() == new_size 
                - for all valid i:
                    - (*this)[i] == value
        !*/

        unsigned long size(
        ) const; 
        /*!
            ensures
                - returns the number of elements in this circular buffer
        !*/

        T& front(
        );
        /*!
            requires
                - size() > 0
            ensures
                - returns a reference to (*this)[0]
        !*/

        const T& front(
        ) const;
        /*!
            requires
                - size() > 0
            ensures
                - returns a const reference to (*this)[0]
        !*/

        T& back(
        );
        /*!
            requires
                - size() > 0
            ensures
                - returns a reference to (*this)[size()-1]
        !*/

        const T& back(
        ) const;
        /*!
            requires
                - size() > 0
            ensures
                - returns a const reference to (*this)[size()-1]
        !*/

        void push_front(
            const T& value
        );
        /*!
            ensures
                - #size() == size()
                  (i.e. the size of this object does not change)
                - if (size() != 0) then
                    - #front() == value
                    - all items are shifted over such that, 
                        - #(*this)[1] == (*this)[0]
                        - #(*this)[2] == (*this)[1]
                        - #(*this)[3] == (*this)[2]
                        - etc.
                        - back() is shifted out of the circular buffer
                - else
                    - This function has no effect on this object 
        !*/

        void push_back(
            const T& value
        );
        /*!
            ensures
                - #size() == size()
                  (i.e. the size of this object does not change)
                - if (size() != 0) then
                    - #back() == value
                    - all items are shifted over such that, 
                        - front() is shifted out of the circular buffer 
                        - #(*this)[0] == (*this)[1]
                        - #(*this)[1] == (*this)[2]
                        - #(*this)[2] == (*this)[3]
                        - etc.
                - else
                    - This function has no effect on this object 
        !*/

        void swap (
            circular_buffer& item
        );
        /*!
            ensures
                - swaps *this with item
        !*/

    };

// ----------------------------------------------------------------------------------------

    template <
        typename T
        >
    void swap (
        circular_buffer<T>& a, 
        circular_buffer<T>& b 
    ) { a.swap(b); }   
    /*!
        provides a global swap function
    !*/

    template <
        typename T
        >
    void serialize (
        const circular_buffer<T>& item, 
        std::ostream& out 
    );   
    /*!
        provides serialization support 
    !*/

    template <
        typename T
        >
    void deserialize (
        circular_buffer<T>& item, 
        std::istream& in
    );   
    /*!
        provides deserialization support 
    !*/

// ----------------------------------------------------------------------------------------

}

#endif // DLIB_CIRCULAR_BuFFER_ABSTRACT_H__


