// Copyright (C) 2005  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#ifndef DLIB_SET_COMPARe_1_
#define DLIB_SET_COMPARe_1_

#include "set_compare_abstract.h"

#include "../algs.h"



namespace dlib
{

    template <
        typename set_base 
        >
    class set_compare_1 : public set_base
    {

        public:

            bool operator< (
                const set_compare_1& rhs
            ) const;

            bool operator== (
                const set_compare_1& rhs
            ) const;

    };


    template <
        typename set_base
        >
    inline void swap (
        set_compare_1<set_base>& a, 
        set_compare_1<set_base>& b 
    ) { a.swap(b); }  

// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------
    // member function definitions
// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------

    template <
        typename set_base
        >
    bool set_compare_1<set_base>::
    operator< (
        const set_compare_1<set_base>& rhs
    ) const
    {
        bool result = false;
        if (set_base::size() < rhs.size())
            result = true;

        if (set_base::size() == rhs.size())
        {
            rhs.reset();
            set_base::reset();
            while (rhs.move_next())
            {
                set_base::move_next();
                if (set_base::element() < rhs.element())
                {
                    result = true;
                    break;
                }
                else if (rhs.element() < set_base::element())
                {
                    break;
                }
            }            
        }

        set_base::reset();
        rhs.reset();

        return result;
    }

// ----------------------------------------------------------------------------------------

    template <
        typename set_base
        >
    bool set_compare_1<set_base>::
    operator== (
        const set_compare_1<set_base>& rhs
    ) const
    {
        bool result = true;
        if (set_base::size() != rhs.size())
            result = false;


        rhs.reset();
        set_base::reset();
        while (rhs.move_next() && set_base::move_next())
        {            
            if (!(rhs.element() == set_base::element()))
            {
                result = false;
                break;
            }
        }

        set_base::reset();
        rhs.reset();

        return result;
    }

// ----------------------------------------------------------------------------------------

}

#endif // DLIB_SET_COMPARe_1_

