// Copyright (C) 2003  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#ifndef DLIB_QUEUE_KERNEl_C_
#define DLIB_QUEUE_KERNEl_C_

#include "queue_kernel_abstract.h"
#include "../algs.h"
#include "../assert.h"

namespace dlib
{


    template <
        typename queue_base // is an implementation of queue_kernel_abstract.h
        >
    class queue_kernel_c : public queue_base
    {
        typedef typename queue_base::type T;

        public:

            void dequeue (
                T& item
            );

            T& current (
            );

            const T& current (
            ) const;

            const T& element (
            ) const;

            T& element (
            );

            void remove_any (
                T& item
            );

    };

    template <
        typename queue_base
        >
    inline void swap (
        queue_kernel_c<queue_base>& a, 
        queue_kernel_c<queue_base>& b 
    ) { a.swap(b); }

// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------
    // member function definitions
// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------

    template <
        typename queue_base
        >
    void queue_kernel_c<queue_base>::
    dequeue (
        T& item
    )
    {

        // make sure requires clause is not broken
        DLIB_CASSERT(this->size() != 0,
            "\tvoid queue::dequeue"
            << "\n\tsize of queue should not be zero"
            << "\n\tthis: " << this
            );

        // call the real function
        queue_base::dequeue(item);

    }

// ----------------------------------------------------------------------------------------

    template <
        typename queue_base
        >
    const typename queue_base::type& queue_kernel_c<queue_base>::
    current (
    ) const
    {
        // make sure requires clause is not broken
        DLIB_CASSERT(this->size() != 0,
            "\tconst T& queue::current"
            << "\n\tsize of queue should not be zero"
            << "\n\tthis: " << this
            );

        // call the real function
        return queue_base::current();
    }

// ----------------------------------------------------------------------------------------

    template <
        typename queue_base
        >
    typename queue_base::type& queue_kernel_c<queue_base>::
    current (
    ) 
    {
        // make sure requires clause is not broken
        DLIB_CASSERT(this->size() != 0,
            "\tT& queue::current"
            << "\n\tsize of queue should not be zero"
            << "\n\tthis: " << this
            );

        // call the real function
        return queue_base::current();
    }

// ----------------------------------------------------------------------------------------

    template <
        typename queue_base
        >
    const typename queue_base::type& queue_kernel_c<queue_base>::
    element (
    ) const
    {
        // make sure requires clause is not broken
        DLIB_CASSERT(this->current_element_valid() == true,
            "\tconst T& queue::element"
            << "\n\tyou can't access the current element if it doesn't exist"
            << "\n\tthis: " << this
            );

        // call the real function
        return queue_base::element();
    }

// ----------------------------------------------------------------------------------------

    template <
        typename queue_base
        >
    typename queue_base::type& queue_kernel_c<queue_base>::
    element (
    ) 
    {
        // make sure requires clause is not broken
        DLIB_CASSERT(this->current_element_valid() == true,
            "\tT& queue::element"
            << "\n\tyou can't access the current element if it doesn't exist"
            << "\n\tthis: " << this
            );

        // call the real function
        return queue_base::element();
    }

// ----------------------------------------------------------------------------------------

    template <
        typename queue_base
        >
    void queue_kernel_c<queue_base>::
    remove_any (
        T& item
    ) 
    {
        // make sure requires clause is not broken
        DLIB_CASSERT( (this->size() > 0),
            "\tvoid queue::remove_any"
            << "\n\tsize() must be greater than zero if something is going to be removed"
            << "\n\tsize(): " << this->size() 
            << "\n\tthis:   " << this
            );

        // call the real function
        queue_base::remove_any(item);
    }

// ----------------------------------------------------------------------------------------

}

#endif // DLIB_QUEUE_KERNEl_C_

