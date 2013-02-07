// Copyright (C) 2003  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#ifndef DLIB_STACK_KERNEl_C_
#define DLIB_STACK_KERNEl_C_

#include "stack_kernel_abstract.h"
#include "../algs.h"
#include "../assert.h"

namespace dlib
{

    template <
        typename stack_base
        >
    class stack_kernel_c : public stack_base
    {
        typedef typename stack_base::type T;
        public:
            void pop(
                T& item
            );

            T& current(
            );

            const T& current(
            ) const;

            const T& element( 
            ) const;

            T& element(
            );

            void remove_any (
                T& item
            );

    };


    template <
        typename stack_base
        >
    inline void swap (
        stack_kernel_c<stack_base>& a, 
        stack_kernel_c<stack_base>& b 
    ) { a.swap(b); } 

// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------
    // member function definitions
// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------

    template <
        typename stack_base
        >
    void stack_kernel_c<stack_base>::
    pop(
        T& item
    )
    {

        // make sure requires clause is not broken
        DLIB_CASSERT(this->size() != 0,
            "\tvoid stack::pop"
            << "\n\tsize of stack should not be zero"
            << "\n\tthis: " << this
            );
        
        // call the real function
        stack_base::pop(item);

    }

// ----------------------------------------------------------------------------------------

    template <
        typename stack_base
        >
    const typename stack_base::type& stack_kernel_c<stack_base>::
    current(
    ) const
    {
        // make sure requires clause is not broken
        DLIB_CASSERT(this->size() != 0,
            "\tconst T& stack::current"
            << "\n\tsize of stack should not be zero"
            << "\n\tthis: " << this
            );
    
        // call the real function
        return stack_base::current();

    }

// ----------------------------------------------------------------------------------------

    template <
        typename stack_base
        >
    typename stack_base::type& stack_kernel_c<stack_base>::
    current(
    )
    {
        // make sure requires clause is not broken
        DLIB_CASSERT(this->size() != 0,
            "\tT& stack::current"
            << "\n\tsize of stack should not be zero"
            << "\n\tthis: " << this
            );

        // call the real function
        return stack_base::current();

    }

// ----------------------------------------------------------------------------------------
    
    template <
        typename stack_base
        >
    typename stack_base::type& stack_kernel_c<stack_base>::
    element(
    )
    {
        // make sure requires clause is not broken
        DLIB_CASSERT(this->current_element_valid(),
            "\tT& stack::element"
            << "\n\tThe current element must be valid if you are to access it."
            << "\n\tthis: " << this
            );

        // call the real function
        return stack_base::element();

    }

// ----------------------------------------------------------------------------------------
    
    template <
        typename stack_base
        >
    const typename stack_base::type& stack_kernel_c<stack_base>::
    element(
    ) const
    {
        // make sure requires clause is not broken
        DLIB_CASSERT(this->current_element_valid(),
            "\tconst T& stack::element"
            << "\n\tThe current element must be valid if you are to access it."
            << "\n\tthis: " << this
            );

        // call the real function
        return stack_base::element();

    }

// ----------------------------------------------------------------------------------------
    
    template <
        typename stack_base
        >
    void stack_kernel_c<stack_base>::
    remove_any (
        T& item
    ) 
    {
        // make sure requires clause is not broken
        DLIB_CASSERT( (this->size() > 0),
            "\tvoid stack::remove_any"
            << "\n\tsize() must be greater than zero if something is going to be removed"
            << "\n\tsize(): " << this->size() 
            << "\n\tthis:   " << this
            );

        // call the real function
        stack_base::remove_any(item);
    }

// ----------------------------------------------------------------------------------------

}

#endif // DLIB_STACK_KERNEl_C_

