// Copyright (C) 2003  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#ifndef DLIB_HASH_TABLE_KERNEl_C_
#define DLIB_HASH_TABLE_KERNEl_C_

#include "hash_table_kernel_abstract.h"
#include "../algs.h"
#include "../interfaces/map_pair.h"
#include "../assert.h"

namespace dlib 
{

    template <
        typename ht_base        
        >
    class hash_table_kernel_c : public ht_base
    {
        typedef typename ht_base::domain_type domain;
        typedef typename ht_base::range_type range;
        public:

            explicit hash_table_kernel_c (
                unsigned long expnum
            ) :
                ht_base(expnum)
            {
                DLIB_CASSERT(expnum < 32,
                    "\thash_table::hash_table(unsigned long)"
                    << "\n\tyou can't set expnum >= 32"
                    << "\n\tthis:       " << this
                    << "\n\texpnum:     " << expnum
                    );                   
            }

            void remove (
                const domain& d,
                domain& d_copy,
                range& r
            );

            void remove_any (
                domain& d,
                range& r
            );

            void add (
                domain& d,
                range& r
            );

            void destroy (
                const domain& d
            );

            const map_pair<domain,range>& element (
            ) const
            {
                DLIB_CASSERT(this->current_element_valid() == true,
                    "\tconst map_pair<domain,range>& hash_table::element() const"
                    << "\n\tyou can't access the current element if it doesn't exist"
                    << "\n\tthis: " << this
                    );

                return ht_base::element();
            }

            map_pair<domain,range>& element (
            )
            {
                DLIB_CASSERT(this->current_element_valid() == true,
                    "\tmap_pair<domain,range>& hash_table::element()"
                    << "\n\tyou can't access the current element if it doesn't exist"
                    << "\n\tthis: " << this
                    );

                return ht_base::element();
            }


    };


    template <
        typename ht_base        
        >
    inline void swap (
        hash_table_kernel_c<ht_base>& a, 
        hash_table_kernel_c<ht_base>& b 
    ) { a.swap(b); }

// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------
    // member function definitions
// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------

    template <
        typename ht_base        
        >
    void hash_table_kernel_c<ht_base>::
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
            << "\n\tthe element must be in the table for it to be removed"
            << "\n\tthis:       " << this
            << "\n\t&d:         " << &d 
            << "\n\t&d_copy:    " << &d_copy
            << "\n\t&r:         " << &r
            );

        ht_base::remove(d,d_copy,r);
    }

// ----------------------------------------------------------------------------------------

    template <
        typename ht_base        
        >
    void hash_table_kernel_c<ht_base>::
    add(
        domain& d,
        range& r
    )
    {
        DLIB_CASSERT( static_cast<const void*>(&d) != static_cast<void*>(&r),
            "\tvoid binary_search_tree::add"
            << "\n\tyou can't call add() and give the same object to both arguments."
            << "\n\tthis:       " << this
            << "\n\t&d:         " << &d
            << "\n\t&r:         " << &r
            << "\n\tsize():     " << this->size()
            );

        ht_base::add(d,r);
    }

// ----------------------------------------------------------------------------------------

    template <
        typename ht_base        
        >
    void hash_table_kernel_c<ht_base>::
    destroy(
        const domain& d
    )
    {
        DLIB_CASSERT((*this)[d] != 0,
            "\tvoid hash_table::destroy"
            << "\n\tthe element must be in the table for it to be destroyed"
            << "\n\tthis:  " << this
            << "\n\t&d:    " << &d 
            );

        ht_base::destroy(d);
    }

// ----------------------------------------------------------------------------------------

    template <
        typename ht_base        
        >
    void hash_table_kernel_c<ht_base>::
    remove_any(
        domain& d,
        range& r
    )
    {
        DLIB_CASSERT(this->size() != 0 && 
            (static_cast<const void*>(&d) != static_cast<void*>(&r)),
            "\tvoid hash_table::remove_any"
            << "\n\ttable must not be empty if something is going to be removed"
            << "\n\tthis: " << this
            << "\n\t&d:   " << &d
            << "\n\t&r:   " << &r
            );

        ht_base::remove_any(d,r);
    }

// ----------------------------------------------------------------------------------------

}

#endif // DLIB_HASH_TABLE_KERNEl_C_

