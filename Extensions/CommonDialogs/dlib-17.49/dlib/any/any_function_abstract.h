// Copyright (C) 2011  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#undef DLIB_AnY_FUNCTION_ABSTRACT_H_
#ifdef DLIB_AnY_FUNCTION_ABSTRACT_H_

#include "any_abstract.h"
#include "../algs.h"

namespace dlib
{

// ----------------------------------------------------------------------------------------

    template <
        typename function_type
        >
    class any_function
    {
        /*!
            REQUIREMENTS ON function_type
                This type should be a function signature.  Some examples are:
                    void (int,int)  // a function returning nothing and taking two ints
                    void ()         // a function returning nothing and taking no arguments
                    char (double&)  // a function returning a char and taking a reference to a double

                The number of arguments in the function must be no greater than 10.

            INITIAL VALUE
                - is_empty() == true
                - for all T: contains<T>() == false

            WHAT THIS OBJECT REPRESENTS
                This object is a version of dlib::any that is restricted to containing 
                elements which are some kind of function object with an operator() which
                matches the function signature defined by function_type.


                Here is an example:
                    #include <iostream>
                    #include <string>
                    #include "dlib/any.h"
                    using namespace std;
                    void print_message(string str) { cout << str << endl; }

                    int main()
                    {
                        dlib::any_function<void(string)> f;
                        f = print_message;
                        f("hello world"); // calls print_message("hello world")
                    }

                Note that any_function objects can be used to store general function 
                objects (i.e. defined by a class with an overloaded operator()) in
                addition to regular global functions.  
        !*/

    public:

        // This is the type of object returned by function_type functions.
        typedef result_type_for_function_type result_type;
        // Typedefs defining the argument types.  If an argument does not exist
        // then it is set to void.
        typedef type_of_first_argument_in_funct_type  arg1_type;
        typedef type_of_second_argument_in_funct_type arg2_type;
        ...
        typedef type_of_last_argument_in_funct_type   arg10_type;
        const static unsigned long num_args = total_number_of_non_void_arguments;

        any_function(
        );
        /*!
            ensures
                - this object is properly initialized
        !*/

        any_function (
            const any_function& item
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
        any_function (
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

        bool is_set (
        ) const;
        /*!
            ensures
                - returns !is_empty()
        !*/

        result_type operator() (
        ) const;
        /*!
            requires
                - is_empty() == false
                - the signature defined by function_type takes no arguments
            ensures
                - Let F denote the function object contained within *this.  Then
                  this function performs:
                    return F()
                  or if result_type is void then this function performs:
                    F()
        !*/

        result_type operator() (
            const arg1_type& a1
        ) const;
        /*!
            requires
                - is_empty() == false
                - the signature defined by function_type takes one argument
            ensures
                - Let F denote the function object contained within *this.  Then
                  this function performs:
                    return F(a1)
                  or if result_type is void then this function performs:
                    F(a1)
        !*/

        result_type operator() (
            const arg1_type& a1,
            const arg2_type& a2
        ) const;
        /*!
            requires
                - is_empty() == false
                - the signature defined by function_type takes two arguments
            ensures
                - Let F denote the function object contained within *this.  Then
                  this function performs:
                    return F(a1,a2)
                  or if result_type is void then this function performs:
                    F(a1,a2)
        !*/

        /* !!!!!!!!!  NOTE  !!!!!!!!!

           In addition to the above, operator() is defined for up to 10 arguments.
           They are not listed here because it would clutter the documentation. 

           !!!!!!!!!  NOTE  !!!!!!!!!  */

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
                    - Any previous object stored in this any_function object is destructed and its
                      state is lost.
                    - returns a non-const reference to the newly created T object.
        !*/

        any_function& operator= (
            const any_function& item
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
            any_function& item
        );
        /*!
            ensures
                - swaps *this and item
        !*/

    };

// ----------------------------------------------------------------------------------------

    template <
        typename function_type
        >
    inline void swap (
        any_function<function_type>& a,
        any_function<function_type>& b
    ) { a.swap(b); }
    /*!
        provides a global swap function
    !*/

// ----------------------------------------------------------------------------------------

    template <
        typename T,
        typename function_type
        > 
    T& any_cast(
        any_function<function_type>& a
    ) { return a.cast_to<T>(); }
    /*!
        ensures
            - returns a.cast_to<T>()
    !*/

// ----------------------------------------------------------------------------------------

    template <
        typename T,
        typename function_type
        > 
    const T& any_cast(
        const any_function<function_type>& a
    ) { return a.cast_to<T>(); }
    /*!
        ensures
            - returns a.cast_to<T>()
    !*/

// ----------------------------------------------------------------------------------------

}

#endif // DLIB_AnY_FUNCTION_ABSTRACT_H_

