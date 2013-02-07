// Copyright (C) 2003  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#ifndef DLIB_HASH_SET_KERNEl_C_
#define DLIB_HASH_SET_KERNEl_C_

#include "hash_set_kernel_abstract.h"
#include "../algs.h"
#include "../assert.h"

namespace dlib
{

    template <
        typename hash_set_base
        >
    class hash_set_kernel_c : public hash_set_base
    {
        typedef typename hash_set_base::type T;
        public:

            void add (
                T& item
            );

            void remove_any (
                T& item
            );

            void remove (
                const T& item,
                T& item_copy
            );

            void destroy (
                const T& item
            );

            const T& element (
            ) const;

            const T& element (
            );


    };


    template <
        typename hash_set_base
        >
    inline void swap (
        hash_set_kernel_c<hash_set_base>& a, 
        hash_set_kernel_c<hash_set_base>& b 
    ) { a.swap(b); } 

// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------
    // member function definitions
// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------

    template <
        typename hash_set_base
        >
    void hash_set_kernel_c<hash_set_base>::
    add(
        T& item
    )
    {
        // make sure requires clause is not broken
        DLIB_CASSERT( !this->is_member(item),
            "\tvoid hash_set::add"
            << "\n\titem being added must not already be in the hash_set"
            << "\n\tthis: " << this
            );

        // call the real function
        hash_set_base::add(item);
    }

// ----------------------------------------------------------------------------------------

    template <
        typename hash_set_base
        >
    void hash_set_kernel_c<hash_set_base>::
    remove (
        const T& item,
        T& item_copy
    )
    {
        // make sure requires clause is not broken
        DLIB_CASSERT( this->is_member(item) &&
                (static_cast<const void*>(&item) != static_cast<void*>(&item_copy)),
            "\tvoid hash_set::remove"
            << "\n\titem should be in the hash_set if it's going to be removed"
            << "\n\tthis:       " << this
            << "\n\t&item:      " << &item
            << "\n\t&item_copy: " << &item_copy
            );

        // call the real function
        hash_set_base::remove(item,item_copy);
    }

// ----------------------------------------------------------------------------------------

    template <
        typename hash_set_base
        >
    void hash_set_kernel_c<hash_set_base>::
    destroy (
        const T& item
    )
    {
        // make sure requires clause is not broken
        DLIB_CASSERT( this->is_member(item),
            "\tvoid hash_set::destroy"
            << "\n\titem should be in the hash_set if it's going to be removed"
            << "\n\tthis:       " << this
            << "\n\t&item:      " << &item
            );

        // call the real function
        hash_set_base::destroy(item);
    }

// ----------------------------------------------------------------------------------------

    template <
        typename hash_set_base
        >
    void hash_set_kernel_c<hash_set_base>::
    remove_any (
        T& item
    ) 
    {
        // make sure requires clause is not broken
        DLIB_CASSERT( this->size() != 0,
            "\tvoid hash_set::remove_any"
            << "\n\tsize must be greater than zero if an item is to be removed"
            << "\n\tthis: " << this
            );

        // call the real function
        hash_set_base::remove_any(item);
    }

// ----------------------------------------------------------------------------------------

    template <
        typename hash_set_base
        >
    const typename hash_set_base::type& hash_set_kernel_c<hash_set_base>::
    element (
    ) const
    {
        DLIB_CASSERT(this->current_element_valid() == true,
            "\tconst T& hash_set::element()"
            << "\n\tyou can't access the current element if it doesn't exist"
            << "\n\tthis: " << this
            );

        return hash_set_base::element();
    }

// ----------------------------------------------------------------------------------------

    template <
        typename hash_set_base
        >
    const typename hash_set_base::type& hash_set_kernel_c<hash_set_base>::
    element (
    ) 
    {
        DLIB_CASSERT(this->current_element_valid() == true,
            "\tT& hash_set::element()"
            << "\n\tyou can't access the current element if it doesn't exist"
            << "\n\tthis: " << this
            );

        return hash_set_base::element();
    }

// ----------------------------------------------------------------------------------------

}

#endif // DLIB_HASH_SET_KERNEl_C_

