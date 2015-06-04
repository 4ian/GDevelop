// Copyright (C) 2010  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#undef DLIB_AnY_ABSTRACT_H_
#ifdef DLIB_AnY_ABSTRACT_H_

#include <typeinfo>

namespace dlib
{

// ----------------------------------------------------------------------------------------

    class bad_any_cast : public std::bad_cast 
    {
        /*!
            WHAT THIS OBJECT REPRESENTS
                This object is the exception class used by the any object.
                It is used to indicate when someone attempts to cast an any
                object into a type which isn't contained in the any object.
        !*/

    public:
          virtual const char* what() const throw() { return "bad_any_cast"; }
    };

// ----------------------------------------------------------------------------------------

    class any
    {
        /*!
            INITIAL VALUE
                - is_empty() == true
                - for all T: contains<T>() == false

            WHAT THIS OBJECT REPRESENTS
                This object is basically a type-safe version of a void*.  In particular,
                it is a container which can contain only one object but the object may
                be of any type.  

                It is somewhat like the type_safe_union except you don't have to declare 
                the set of possible content types beforehand.  So in some sense this is 
                like a less type-strict version of the type_safe_union.
        !*/

    public:

        any(
        );
        /*!
            ensures
                - this object is properly initialized
        !*/

        any (
            const any& item
        );
        /*!
            ensures
                - copies the state of item into *this.  
                - Note that *this and item will contain independent copies of the
                  contents of item.  That is, this function performs a deep
                  copy and therefore does not result in *this containing
                  any kind of reference to item.
        !*/

        template < typename T >
        any (
            const T& item
        );
        /*!
            ensures
                - #contains<T>() == true
                - #cast_to<T>() == item
                  (i.e. a copy of item will be stored in *this)
        !*/

        void clear (
        );
        /*!
            ensures
                - #*this will have its default value.  I.e. #is_empty() == true
        !*/

        template <typename T>
        bool contains (
        ) const;
        /*!
            ensures
                - if (this object currently contains an object of type T) then
                    - returns true
                - else
                    - returns false
        !*/

        bool is_empty(
        ) const;
        /*!
            ensures
                - if (this object contains any kind of object) then
                    - returns false 
                - else
                    - returns true 
        !*/

        template <typename T>
        T& cast_to(
        );
        /*!
            ensures
                - if (contains<T>() == true) then
                    - returns a non-const reference to the object contained within *this
                - else
                    - throws bad_any_cast
        !*/

        template <typename T>
        const T& cast_to(
        ) const;
        /*!
            ensures
                - if (contains<T>() == true) then
                    - returns a const reference to the object contained within *this
                - else
                    - throws bad_any_cast
        !*/

        template <typename T>
        T& get(
        );
        /*!
            ensures
                - #is_empty() == false
                - #contains<T>() == true
                - if (contains<T>() == true)
                    - returns a non-const reference to the object contained in *this.
                - else
                    - Constructs an object of type T inside *this
                    - Any previous object stored in this any object is destructed and its
                      state is lost.
                    - returns a non-const reference to the newly created T object.
        !*/

        any& operator= (
            const any& item
        );
        /*!
            ensures
                - copies the state of item into *this.  
                - Note that *this and item will contain independent copies of the
                  contents of item.  That is, this function performs a deep
                  copy and therefore does not result in *this containing
                  any kind of reference to item.
        !*/

        void swap (
            any& item
        );
        /*!
            ensures
                - swaps *this and item
                - does not invalidate pointers or references to the object contained 
                  inside *this or item.  Moreover, a pointer or reference to the object in 
                  *this will now refer to the contents of #item and vice versa.
        !*/

    };

// ----------------------------------------------------------------------------------------

    inline void swap (
        any& a,
        any& b
    ) { a.swap(b); }
    /*!
        provides a global swap function
    !*/

// ----------------------------------------------------------------------------------------

    template <
        typename T
        > 
    T& any_cast(
        any& a
    ) { return a.cast_to<T>(); }
    /*!
        ensures
            - returns a.cast_to<T>()
    !*/

// ----------------------------------------------------------------------------------------

    template <
        typename T
        > 
    const T& any_cast(
        const any& a
    ) { return a.cast_to<T>(); }
    /*!
        ensures
            - returns a.cast_to<T>()
    !*/

// ----------------------------------------------------------------------------------------

}

#endif // DLIB_AnY_ABSTRACT_H_


