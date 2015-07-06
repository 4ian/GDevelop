// Copyright (C) 2003  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#ifndef DLIB_MAP_KERNEl_C_
#define DLIB_MAP_KERNEl_C_

#include "map_kernel_abstract.h"
#include "../algs.h"
#include "../assert.h"
#include "../interfaces/map_pair.h"

namespace dlib
{

    template <
        typename map_base
        >
    class map_kernel_c : public map_base
    {

        typedef typename map_base::domain_type domain;
        typedef typename map_base::range_type range;
        
        public:
            void add (
                domain& d,
                range& r
            );

            void remove_any (
                domain& d,
                range& r
            );

            void remove (
                const domain& d,
                domain& d_copy,
                range& r
            );

            void destroy (
                const domain& d
            );

            range& operator[] (
                const domain& d
            );

            const range& operator[] (
                const domain& d
            ) const;

            const map_pair<domain,range>& element (
            ) const
            {
                // make sure requires clause is not broken
                DLIB_CASSERT(this->current_element_valid() == true,
                    "\tconst map_pair<domain,range>& map::element"
                    << "\n\tyou can't access the current element if it doesn't exist"
                    << "\n\tthis: " << this
                    );

                // call the real function
                return map_base::element();
            }

            map_pair<domain,range>& element (
            )
            {
                // make sure requires clause is not broken
                DLIB_CASSERT(this->current_element_valid() == true,
                    "\tmap_pair<domain,range>& map::element"
                    << "\n\tyou can't access the current element if it doesn't exist"
                    << "\n\tthis: " << this
                    );

                // call the real function
                return map_base::element();
            }

    };

    template <
        typename map_base
        >
    inline void swap (
        map_kernel_c<map_base>& a, 
        map_kernel_c<map_base>& b 
    ) { a.swap(b); }  

// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------
    // member function definitions
// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------

    template <
        typename map_base
        >
    void map_kernel_c<map_base>::
    add (
        domain& d,
        range& r
    )
    {
        // make sure requires clause is not broken
        DLIB_CASSERT( (!this->is_in_domain(d)) &&
                (static_cast<void*>(&d) != static_cast<void*>(&r)),
            "\tvoid map::add"
            << "\n\tdomain element being added must not already be in the map"
            << "\n\tand d and r must not be the same variable"
            << "\n\tis_in_domain(d): " << (this->is_in_domain(d) ? "true" : "false")
            << "\n\tthis: " << this
            << "\n\t&d:   " << static_cast<void*>(&d)
            << "\n\t&r:   " << static_cast<void*>(&r)
            );

        // call the real function
        map_base::add(d,r);
    }

// ----------------------------------------------------------------------------------------

    template <
        typename map_base
        >
    void map_kernel_c<map_base>::
    remove_any (
        domain& d,
        range& r
    )
    {
        // make sure requires clause is not broken
        DLIB_CASSERT( (this->size() > 0)  &&
                (static_cast<void*>(&d) != static_cast<void*>(&r)),
            "\tvoid map::remove_any"
            << "\n\tsize() must be greater than zero if something is going to be removed"
            << "\n\tand d and r must not be the same variable."
            << "\n\tsize(): " << this->size() 
            << "\n\tthis:   " << this
            << "\n\t&d:     " << static_cast<void*>(&d)
            << "\n\t&r:     " << static_cast<void*>(&r)
            );

        // call the real function
        map_base::remove_any(d,r);
    }

// ----------------------------------------------------------------------------------------

    template <
        typename map_base
        >
    void map_kernel_c<map_base>::
    remove (
        const domain& d,
        domain& d_copy,
        range& r
    )
    {
        // make sure requires clause is not broken
        DLIB_CASSERT( (this->is_in_domain(d)) &&
                (static_cast<const void*>(&d) != static_cast<void*>(&r)) &&
                (static_cast<void*>(&r) != static_cast<void*>(&d_copy)) &&
                (static_cast<const void*>(&d) != static_cast<void*>(&d_copy)),
            "\tvoid map::remove"
            << "\n\tcan't remove something that isn't in the map or if the paremeters actually"
            << "\n\tare the same variable.  Either way can't remove."
            << "\n\tis_in_domain(d): " << (this->is_in_domain(d) ? "true" : "false")
            << "\n\tthis:      " << this
            << "\n\t&d:        " << static_cast<const void*>(&d)
            << "\n\t&r:        " << static_cast<void*>(&r)
            << "\n\t&d_copy:   " << static_cast<void*>(&d_copy)
            );

        // call the real function
        map_base::remove(d,d_copy,r);
    }

// ----------------------------------------------------------------------------------------

    template <
        typename map_base
        >
    void map_kernel_c<map_base>::
    destroy (
        const domain& d
    )
    {
        // make sure requires clause is not broken
        DLIB_CASSERT(this->is_in_domain(d),
            "\tvoid map::destroy"
            << "\n\tcan't remove something that isn't in the map"
            << "\n\tthis:      " << this
            << "\n\t&d:        " << static_cast<const void*>(&d)
            );

        // call the real function
        map_base::destroy(d);
    }

// ----------------------------------------------------------------------------------------

    template <
        typename map_base
        >
    typename map_base::range_type& map_kernel_c<map_base>::
    operator[] (
        const domain& d
    )
    {
        // make sure requires clause is not broken
        DLIB_CASSERT( this->is_in_domain(d),
            "\trange& map::operator[]"
            << "\n\td must be in the domain of the map"
            << "\n\tthis: " << this
            );

        // call the real function
        return map_base::operator[](d);
    }

// ----------------------------------------------------------------------------------------

    template <
        typename map_base
        >
    const typename map_base::range_type& map_kernel_c<map_base>::
    operator[] (
        const domain& d
    ) const
    {
        // make sure requires clause is not broken
        DLIB_CASSERT( this->is_in_domain(d),
            "\tconst range& map::operator[]"
            << "\n\td must be in the domain of the map"
            << "\n\tthis: " << this
            );

        // call the real function
        return map_base::operator[](d);
    }
    
// ----------------------------------------------------------------------------------------

}

#endif // DLIB_MAP_KERNEl_C_

