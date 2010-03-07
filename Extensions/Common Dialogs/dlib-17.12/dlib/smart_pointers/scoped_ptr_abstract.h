// Copyright (C) 2007  Davis E. King (davisking@users.sourceforge.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#undef DLIB_SCOPED_PTr_ABSTRACT_
#ifdef DLIB_SCOPED_PTr_ABSTRACT_

#include "../noncopyable.h"

namespace dlib
{

    template <
        typename T
        > 
    class scoped_ptr : noncopyable 
    {
        /*!
            INITIAL VALUE
                defined by constructor

            WHAT THIS OBJECT REPRESENTS
                This is a implementation of the scoped_ptr class found in the Boost C++ 
                library.  It is a simple smart pointer class which guarantees that the 
                pointer contained within it will always be deleted.  
                
                The class does not permit copying and so does not do any kind of 
                reference counting.  Thus it is very simply and quite fast.
        !*/

    public:
        typedef T element_type;

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
                    - calls delete get()
        !*/

        void reset (
            T* p = 0
        );
        /*!
            ensures
                - if (get() != 0) then
                    - calls delete get()
                - #get() == p
                  (i.e. makes this object contain a pointer to p instead of whatever it 
                  used to contain)
        !*/

        T& operator*(
        ) const;
        /*!
            requires
                - get() != 0
            ensures
                - returns a reference to *get()
        !*/

        T* operator->(
        ) const;
        /*!
            requires
                - get() != 0
            ensures
                - returns the pointer contained in this object
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


