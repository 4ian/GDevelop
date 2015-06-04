// Copyright (C) 2003  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#ifndef DLIB_SET_KERNEl_C_
#define DLIB_SET_KERNEl_C_

#include "set_kernel_abstract.h"
#include "../algs.h"
#include "../assert.h"

namespace dlib
{

    template <
        typename set_base
        >
    class set_kernel_c : public set_base
    {
        typedef typename set_base::type T;
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
        );

        const T& element (
        ) const;
    };


    template <
        typename set_base
        >
    inline void swap (
        set_kernel_c<set_base>& a, 
        set_kernel_c<set_base>& b 
    ) { a.swap(b); } 

// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------
// member function definitions
// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------

    template <
        typename set_base
        >
    void set_kernel_c<set_base>::
    add(
        T& item
    )
    {
        // make sure requires clause is not broken
        DLIB_CASSERT( !this->is_member(item),
                 "\tvoid set::add"
                 << "\n\titem being added must not already be in the set"
                 << "\n\tthis: " << this
        );

        // call the real function
        set_base::add(item);
    }

// ----------------------------------------------------------------------------------------

    template <
        typename set_base
        >
    void set_kernel_c<set_base>::
    remove (
        const T& item,
        T& item_copy
    )
    {
        // make sure requires clause is not broken
        DLIB_CASSERT( this->is_member(item) &&
                 (static_cast<const void*>(&item) != static_cast<void*>(&item_copy)),
                 "\tvoid set::remove"
                 << "\n\titem should be in the set if it's going to be removed"
                 << "\n\tthis:            " << this
                 << "\n\t&item:           " << &item 
                 << "\n\t&item_copy:      " << &item_copy
                 << "\n\tis_member(item): " << (this->is_member(item)?"true":"false")
        );

        // call the real function
        set_base::remove(item,item_copy);
    }

// ----------------------------------------------------------------------------------------

    template <
        typename set_base
        >
    void set_kernel_c<set_base>::
    destroy (
        const T& item
    )
    {
        // make sure requires clause is not broken
        DLIB_CASSERT( this->is_member(item), 
                 "\tvoid set::destroy"
                 << "\n\titem should be in the set if it's going to be removed"
                 << "\n\tthis:            " << this
                 << "\n\t&item:           " << &item 
        );

        // call the real function
        set_base::destroy(item);
    }

// ----------------------------------------------------------------------------------------

    template <
        typename set_base
        >
    void set_kernel_c<set_base>::
    remove_any (
        T& item
    ) 
    {
        // make sure requires clause is not broken
        DLIB_CASSERT( this->size() != 0,
                 "\tvoid set::remove_any"
                 << "\n\tsize must be greater than zero if an item is to be removed"
                 << "\n\tthis: " << this
        );

        // call the real function
        set_base::remove_any(item);
    }

// ----------------------------------------------------------------------------------------

    template <
        typename set_base
        >
    const typename set_base::type& set_kernel_c<set_base>::
    element (
    ) const
    {
        // make sure requires clause is not broken
        DLIB_CASSERT(this->current_element_valid() == true,
                "\tconst T& set::element() const"
                << "\n\tyou can't access the current element if it doesn't exist"
                << "\n\tthis: " << this
        );

        // call the real function
        return set_base::element();
    }

// ----------------------------------------------------------------------------------------

    template <
        typename set_base
        >
    const typename set_base::type& set_kernel_c<set_base>::
    element (
    ) 
    {
        // make sure requires clause is not broken
        DLIB_CASSERT(this->current_element_valid() == true,
                "\tconst T& set::element"
                << "\n\tyou can't access the current element if it doesn't exist"
                << "\n\tthis: " << this
        );

        // call the real function
        return set_base::element();
    }

// ----------------------------------------------------------------------------------------


}

#endif // DLIB_SET_KERNEl_C_

