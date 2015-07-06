// Copyright (C) 2007  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#undef DLIB_SCOPED_PTr_ABSTRACT_
#ifdef DLIB_SCOPED_PTr_ABSTRACT_

#include "../noncopyable.h"

namespace dlib
{

// ----------------------------------------------------------------------------------------

    template <typename T>
    struct default_deleter
    {
        void operator() (
            T* item
        ) const;
        /*!
            ensures
                - if (T is an array type (e.g. int[])) then
                    - performs "delete [] item;"
                - else
                    - performs "delete item;"
        !*/
    };

// ----------------------------------------------------------------------------------------

    template <
        typename T,
        typename deleter = default_deleter<T>
        > 
    class scoped_ptr : noncopyable 
    {
        /*!
            REQUIREMENTS ON deleter
                Must be a function object that performs deallocation of a pointer
                of type T.  For example, see the default_deleter type defined above.
                It must also not throw when constructed or when performing a delete.

            INITIAL VALUE
                defined by constructor

            WHAT THIS OBJECT REPRESENTS
                This is a smart pointer class inspired by the implementation of the scoped_ptr 
                class found in the Boost C++ library.  So this is a simple smart pointer 
                class which guarantees that the pointer contained within it will always be 
                deleted.   
                
                The class does not permit copying and so does not do any kind of 
                reference counting.  Thus it is very simply and quite fast.
                
                Note that this class allows you to use pointers to arrays as well as 
                pointers to single items.  To let it know that it is supposed to point
                to an array you have to declare it using the bracket syntax.  Consider
                the following examples:

                    // This is how you make a scoped pointer to a single thing
                    scoped_ptr<int> single_item(new int);
                    
                    // This is how you can use a scoped pointer to contain array pointers.
                    // Note the use of [].  This ensures that the proper version of delete
                    // is called.
                    scoped_ptr<int[]> array_of_ints(new int[50]);
        !*/

    public:
        typedef T element_type;
        typedef deleter deleter_type;

        explicit scoped_ptr (
            T* p = 0
        );
        /*!
            ensures
                - #get() == p
        !*/

        ~scoped_ptr(
        );
        /*!
            ensures
                - if (get() != 0) then
                    - calls deleter()(get())
                      (i.e. uses the deleter type to delete the pointer that is
                      contained in this scoped pointer)
        !*/

        void reset (
            T* p = 0
        );
        /*!
            ensures
                - if (get() != 0) then
                    - calls deleter()(get())
                      (i.e. uses the deleter type to delete the pointer that is
                      contained in this scoped pointer)
                - #get() == p
                  (i.e. makes this object contain a pointer to p instead of whatever it 
                  used to contain)
        !*/

        T& operator*(
        ) const;
        /*!
            requires
                - get() != 0
                - T is NOT an array type (e.g. not int[])
            ensures
                - returns a reference to *get()
        !*/

        T* operator->(
        ) const;
        /*!
            requires
                - get() != 0
                - T is NOT an array type (e.g. not int[])
            ensures
                - returns the pointer contained in this object
        !*/

        T& operator[](
            unsigned long idx
        ) const;
        /*!
            requires
                - get() != 0
                - T is an array type (e.g. int[])
            ensures
                - returns get()[idx] 
        !*/

        T* get(
        ) const;
        /*!
            ensures
                - returns the pointer contained in this object
        !*/

        operator bool(
        ) const;
        /*!
            ensures
                - returns get() != 0
        !*/

        void swap(
            scoped_ptr& b
        );
        /*!
            ensures
                - swaps *this and item
        !*/
    };

    template <
        typename T
        > 
    void swap(
        scoped_ptr<T>& a, 
        scoped_ptr<T>& b
    ) { a.swap(b); }
    /*!
        provides a global swap function
    !*/
}

#endif // DLIB_SCOPED_PTr_ABSTRACT_


