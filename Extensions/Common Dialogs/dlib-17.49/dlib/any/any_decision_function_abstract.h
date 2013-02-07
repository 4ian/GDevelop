// Copyright (C) 2010  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#undef DLIB_AnY_DECISION_FUNCTION_ABSTRACT_H_
#ifdef DLIB_AnY_DECISION_FUNCTION_ABSTRACT_H_

#include "any_abstract.h"
#include "../algs.h"

namespace dlib
{

// ----------------------------------------------------------------------------------------

    template <
        typename sample_type_,
        typename result_type_ = double
        >
    class any_decision_function
    {
        /*!
            INITIAL VALUE
                - is_empty() == true
                - for all T: contains<T>() == false

            WHAT THIS OBJECT REPRESENTS
                This object is a version of dlib::any that is restricted to containing 
                elements which are some kind of function object with an operator() with 
                the following signature: 
                    result_type operator()(const sample_type&) const

                It is intended to be used to contain dlib::decision_function objects and
                other types which represent learned decision functions.  It allows you
                to write code which contains and processes these decision functions
                without needing to know the specific types of decision functions used.
        !*/

    public:

        typedef sample_type_ sample_type;
        typedef result_type_ result_type;
        typedef default_memory_manager mem_manager_type;

        any_decision_function(
        );
        /*!
            ensures
                - this object is properly initialized
        !*/

        any_decision_function (
            const any_decision_function& item
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
        any_decision_function (
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

        result_type operator() (
            const sample_type& item
        ) const;
        /*!
            requires
                - is_empty() == false
            ensures
                - Let F denote the function object contained within *this.  Then
                  this function performs:
                    return F(item)
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
                    - Any previous object stored in this any_decision_function object is destructed and its
                      state is lost.
                    - returns a non-const reference to the newly created T object.
        !*/

        any_decision_function& operator= (
            const any_decision_function& item
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
            any_decision_function& item
        );
        /*!
            ensures
                - swaps *this and item
        !*/

    };

// ----------------------------------------------------------------------------------------

    template <
        typename sample_type,
        typename result_type
        >
    inline void swap (
        any_decision_function<sample_type,result_type>& a,
        any_decision_function<sample_type,result_type>& b
    ) { a.swap(b); }
    /*!
        provides a global swap function
    !*/

// ----------------------------------------------------------------------------------------

    template <
        typename T,
        typename sample_type,
        typename result_type
        > 
    T& any_cast(
        any_decision_function<sample_type,result_type>& a
    ) { return a.cast_to<T>(); }
    /*!
        ensures
            - returns a.cast_to<T>()
    !*/

// ----------------------------------------------------------------------------------------

    template <
        typename T,
        typename sample_type,
        typename result_type
        > 
    const T& any_cast(
        const any_decision_function<sample_type,result_type>& a
    ) { return a.cast_to<T>(); }
    /*!
        ensures
            - returns a.cast_to<T>()
    !*/

// ----------------------------------------------------------------------------------------

}

#endif // DLIB_AnY_DECISION_FUNCTION_ABSTRACT_H_



