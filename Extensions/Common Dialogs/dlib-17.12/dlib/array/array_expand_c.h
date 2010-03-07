// Copyright (C) 2008  Davis E. King (davisking@users.sourceforge.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#ifndef DLIB_ARRAY_EXPAND_C_
#define DLIB_ARRAY_EXPAND_C_

#include "array_expand_abstract.h"
#include "../algs.h"
#include "../assert.h"

namespace dlib
{

    template <
        typename array_base
        >
    class array_expand_c : public array_base
    {
        typedef typename array_base::type T;
    public:


        const T& back (
        ) const;

        T& back (
        );

        void pop_back (
        );

        void pop_back (
            T& item
        );
    };

    template <
        typename array_base
        >
    inline void swap (
        array_expand_c<array_base>& a, 
        array_expand_c<array_base>& b 
    ) { a.swap(b); }   

// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------
// member function definitions
// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------

    template <
        typename array_base
        >
    typename array_base::type& array_expand_c<array_base>::
    back (
    )
    {
        // make sure requires clause is not broken
        DLIB_CASSERT( this->size() > 0 , 
                      "\tT& array_expand::back()"
                      << "\n\tsize() must be bigger than 0" 
                      << "\n\tsize(): " << this->size()
                      << "\n\tthis:   " << this
        );

        // call the real function
        return array_base::back();
    }

// ----------------------------------------------------------------------------------------

    template <
        typename array_base
        >
    const typename array_base::type& array_expand_c<array_base>::
    back (
    ) const
    {
        // make sure requires clause is not broken
        DLIB_CASSERT( this->size() > 0 , 
                      "\tconst T& array_expand::back()"
                      << "\n\tsize() must be bigger than 0" 
                      << "\n\tsize(): " << this->size()
                      << "\n\tthis:   " << this
        );

        // call the real function
        return array_base::back();
    }

// ----------------------------------------------------------------------------------------

    template <
        typename array_base
        >
    void array_expand_c<array_base>::
    pop_back (
    ) 
    {
        // make sure requires clause is not broken
        DLIB_CASSERT( this->size() > 0 , 
                      "\tvoid array_expand::pop_back()"
                      << "\n\tsize() must be bigger than 0" 
                      << "\n\tsize(): " << this->size()
                      << "\n\tthis:   " << this
        );

        // call the real function
        return array_base::pop_back();
    }

// ----------------------------------------------------------------------------------------

    template <
        typename array_base
        >
    void array_expand_c<array_base>::
    pop_back (
        typename array_base::type& item
    ) 
    {
        // make sure requires clause is not broken
        DLIB_CASSERT( this->size() > 0 , 
                      "\tvoid array_expand::pop_back()"
                      << "\n\tsize() must be bigger than 0" 
                      << "\n\tsize(): " << this->size()
                      << "\n\tthis:   " << this
        );

        // call the real function
        return array_base::pop_back(item);
    }

// ----------------------------------------------------------------------------------------

}

#endif // DLIB_ARRAY_EXPAND_C_


