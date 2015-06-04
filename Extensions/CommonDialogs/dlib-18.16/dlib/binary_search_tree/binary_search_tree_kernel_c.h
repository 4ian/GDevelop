// Copyright (C) 2003  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#ifndef DLIB_BINARY_SEARCH_TREE_KERNEl_C_
#define DLIB_BINARY_SEARCH_TREE_KERNEl_C_

#include "../interfaces/map_pair.h"
#include "binary_search_tree_kernel_abstract.h"
#include "../algs.h"
#include "../assert.h"

namespace dlib 
{

    template <
        typename bst_base
        >
    class binary_search_tree_kernel_c : public bst_base
    {
        typedef typename bst_base::domain_type domain;
        typedef typename bst_base::range_type range;

        public:

            binary_search_tree_kernel_c () {}

            void remove (
                const domain& d,
                domain& d_copy,
                range& r
            );

            void destroy (
                const domain& d
            );

            void add (
                domain& d,
                range& r
            );

            void remove_any (
                domain& d,
                range& r
            );

            const map_pair<domain, range>& element(
            ) const
            {
                DLIB_CASSERT(this->current_element_valid() == true,
                    "\tconst map_pair<domain,range>& binary_search_tree::element() const"
                    << "\n\tyou can't access the current element if it doesn't exist"
                    << "\n\tthis: " << this
                );

                return bst_base::element();
            }

            map_pair<domain, range>& element(
            )
            {
                DLIB_CASSERT(this->current_element_valid() == true,
                    "\tmap_pair<domain,range>& binary_search_tree::element()"
                    << "\n\tyou can't access the current element if it doesn't exist"
                    << "\n\tthis: " << this
                );

                return bst_base::element();
            }

            void remove_last_in_order (
                domain& d,
                range& r
            );

            void remove_current_element (
                domain& d,
                range& r
            );


    };


    template <
        typename bst_base
        >
    inline void swap (
        binary_search_tree_kernel_c<bst_base>& a, 
        binary_search_tree_kernel_c<bst_base>& b 
    ) { a.swap(b); }

// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------
    // member function definitions
// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------

    template <
        typename bst_base
        >
    void binary_search_tree_kernel_c<bst_base>::
    add (
        domain& d,
        range& r
    )
    {
        DLIB_CASSERT( static_cast<const void*>(&d) != static_cast<void*>(&r),
            "\tvoid binary_search_tree::add"
            << "\n\tyou can't call add() and give the same object to both parameters."
            << "\n\tthis:       " << this
            << "\n\t&d:         " << &d
            << "\n\t&r:         " << &r
            << "\n\tsize():     " << this->size()
            );

        bst_base::add(d,r);
    }

// ----------------------------------------------------------------------------------------

    template <
        typename bst_base
        >
    void binary_search_tree_kernel_c<bst_base>::
    destroy (
        const domain& d
    )
    {
        DLIB_CASSERT(this->operator[](d) != 0,
            "\tvoid binary_search_tree::destroy"
            << "\n\tthe element must be in the tree for it to be removed"
            << "\n\tthis:    " << this
            << "\n\t&d:      " << &d 
            );

        bst_base::destroy(d);
    }

// ----------------------------------------------------------------------------------------

    template <
        typename bst_base
        >
    void binary_search_tree_kernel_c<bst_base>::
    remove (
        const domain& d,
        domain& d_copy,
        range& r
    )
    {
        DLIB_CASSERT(this->operator[](d) != 0 &&
                (static_cast<const void*>(&d) != static_cast<void*>(&d_copy)) &&
                (static_cast<const void*>(&d) != static_cast<void*>(&r)) &&
                (static_cast<const void*>(&r) != static_cast<void*>(&d_copy)),
            "\tvoid binary_search_tree::remove"
            << "\n\tthe element must be in the tree for it to be removed"
            << "\n\tthis:       " << this
            << "\n\t&d:         " << &d 
            << "\n\t&d_copy:    " << &d_copy
            << "\n\t&r:         " << &r
            );

        bst_base::remove(d,d_copy,r);
    }

// ----------------------------------------------------------------------------------------

    template <
        typename bst_base
        >
    void binary_search_tree_kernel_c<bst_base>::
    remove_any(
        domain& d,
        range& r
    )
    {
        DLIB_CASSERT(this->size() != 0 && 
            (static_cast<const void*>(&d) != static_cast<void*>(&r)),
            "\tvoid binary_search_tree::remove_any"
            << "\n\ttree must not be empty if something is going to be removed"
            << "\n\tthis: " << this
            << "\n\t&d:   " << &d
            << "\n\t&r:   " << &r
            );

        bst_base::remove_any(d,r);
    }
 
// ----------------------------------------------------------------------------------------

    template <
        typename bst_base
        >
    void binary_search_tree_kernel_c<bst_base>::
    remove_last_in_order (
        domain& d,
        range& r
    )
    {
        DLIB_CASSERT(this->size() > 0, 
            "\tvoid binary_search_tree::remove_last_in_order()"
            << "\n\tyou can't remove an element if it doesn't exist"
            << "\n\tthis: " << this
            );

        bst_base::remove_last_in_order(d,r);
    }

// ----------------------------------------------------------------------------------------

    template <
        typename bst_base
        >
    void binary_search_tree_kernel_c<bst_base>::
    remove_current_element (
        domain& d,
        range& r
    ) 
    {
        DLIB_CASSERT(this->current_element_valid() == true,
            "\tvoid binary_search_tree::remove_current_element()"
            << "\n\tyou can't remove the current element if it doesn't exist"
            << "\n\tthis: " << this
            );

        bst_base::remove_current_element(d,r);
    }


// ----------------------------------------------------------------------------------------

}

#endif // DLIB_BINARY_SEARCH_TREE_KERNEl_C_

