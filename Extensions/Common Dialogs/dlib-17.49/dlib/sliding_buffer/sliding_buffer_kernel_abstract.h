// Copyright (C) 2004  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#undef DLIB_SLIDING_BUFFER_KERNEl_ABSTRACT_
#ifdef DLIB_SLIDING_BUFFER_KERNEl_ABSTRACT_

#include "../algs.h"
#include "../interfaces/enumerable.h"
#include "../serialize.h"

namespace dlib
{

    template <
        typename T
        >
    class sliding_buffer : public enumerable<T>
    {
        /*!
            REQUIREMENTS ON T
                T must have a default constructor

            INITIAL VALUE
                size() == 0

            ENUMERATION ORDER
                The enumerator will iterate over the elements of the sliding_buffer in the
                order (*this)[0], (*this)[1], (*this)[2], ...

            WHAT THIS OBJECT REPRESENTS
                This object represents an array of T objects.  The main
                feature of this object is its ability to rotate its contents
                left or right.   An example will make it clear.

                suppose we have the following buffer (assuming T is a char):
                "some data!"    <-- the data in the buffer
                 9876543210     <-- the index numbers associated with each character

                applying rotate_left(2) to this buffer would give us
                "me data!so"
                 9876543210

                if instead of calling rotate_left we call rotate_right(3) instead we would have
                "ta!some da"
                 9876543210                              

                Also note that unless specified otherwise, no member functions
                of this object throw exceptions.
        !*/

    public:

        typedef T type;

        sliding_buffer (
        );
        /*!
            ensures                
                - #*this is properly initialized           
            throws
                - std::bad_alloc or any exception thrown by T's constructor.
        !*/

        virtual ~sliding_buffer (
        );
        /*!
            ensures
                - any resources associated with *this have been released
        !*/

        void clear(
        );
        /*!
            ensures
                - #*this has its initial value
            throws
                - std::bad_alloc or any exception thrown by T's constructor.
                    if this exception is thrown then #*this is unusable 
                    until clear() is called and succeeds
        !*/

        void set_size (
            unsigned long exp_size
        );
        /*!
            requires
                - 0 < exp_size < 32
            ensures
                - #size() == 2^exp_size
                - the value of all elements in the buffer are undefined
                - #at_start() == true
            throws
                - std::bad_alloc or any exception thrown by T's constructor.
                    if this exception is thrown then #size() == 0
        !*/

        void rotate_left (
            unsigned long amount
        );
        /*!
            ensures
                - for all i where 0 <= i < size():
                  (#*this)[i] == (*this)[(i-amount)&(size()-1)]
                  i.e. rotates the contents of *this left by amount spaces
                - #at_start() == true
        !*/

        void rotate_right (
            unsigned long amount
        );
        /*!
            ensures
                - for all i where 0 <= i < size():
                  (#*this)[i] == (*this)[(i+amount)&(size()-1)]
                  i.e. rotates the contents of *this right by amount spaces
                - #at_start() == true
        !*/

        unsigned long get_element_id (
            unsigned long index
        ) const;
        /*!
            requires
                - index < size()
            ensures 
                - returns an element id number that uniquely references the element at 
                  the given index.  (you can use this id to locate the new position of 
                  an element after the buffer has been rotated)
                - returned value is < size()
        !*/

        unsigned long get_element_index (
            unsigned long element_id 
        ) const;
        /*!
            require
                - element_id < size()
            ensures
                - returns the index of the element with the given element_id.
                  ( (*this)[get_element_index(element_id)] will always refer to the same element
                  no matter where it has been rotated to)
                - returned value is < size()
        !*/

        const T& operator[] (
            unsigned long index
        ) const;
        /*!
            requires
                - index < size()
            ensures
                - returns a const reference to the element in *this at position index
        !*/

        T& operator[] (
            unsigned long index
        );
        /*!
            requires
                - index < size()
            ensures
                - returns a reference to the element in *this at position index
        !*/

        void swap (
            sliding_buffer<T>& item
        );
        /*!
            ensures
                - swaps *this and item
        !*/ 

    private:

        // restricted functions
        sliding_buffer(sliding_buffer<T>&);        // copy constructor
        sliding_buffer<T>& operator=(sliding_buffer<T>&);    // assignment operator

    };      

    template <
        typename T
        >
    void swap (
        sliding_buffer<T>& a, 
        sliding_buffer<T>& b 
    ) { a.swap(b); }   
    /*!
        provides a global swap function
    !*/

    template <
        typename T
        >
    void deserialize (
        sliding_buffer<T>& item, 
        std::istream& in
    );   
    /*!
        provides deserialization support 
    !*/

}

#endif // DLIB_SLIDING_BUFFER_KERNEl_ABSTRACT_

