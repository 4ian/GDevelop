// Copyright (C) 2005  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#ifndef DLIB_STATIC_SET_COMPARe_1_
#define DLIB_STATIC_SET_COMPARe_1_

#include "static_set_compare_abstract.h"

#include "../algs.h"



namespace dlib
{

    template <
        typename static_set_base 
        >
    class static_set_compare_1 : public static_set_base
    {

        public:

            bool operator< (
                const static_set_compare_1& rhs
            ) const;

            bool operator== (
                const static_set_compare_1& rhs
            ) const;

    };


    template <
        typename static_set_base
        >
    inline void swap (
        static_set_compare_1<static_set_base>& a, 
        static_set_compare_1<static_set_base>& b 
    ) { a.swap(b); }  

// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------
    // member function definitions
// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------

    template <
        typename static_set_base
        >
    bool static_set_compare_1<static_set_base>::
    operator< (
        const static_set_compare_1<static_set_base>& rhs
    ) const
    {
        bool result = false;
        if (static_set_base::size() < rhs.size())
            result = true;

        if (static_set_base::size() == rhs.size())
        {
            rhs.reset();
            static_set_base::reset();
            while (rhs.move_next())
            {
                static_set_base::move_next();
                if (static_set_base::element() < rhs.element())
                {
                    result = true;
                    break;
                }
                else if (rhs.element() < static_set_base::element())
                {
                    break;
                }
            }            
        }

        static_set_base::reset();
        rhs.reset();

        return result;
    }

// ----------------------------------------------------------------------------------------

    template <
        typename static_set_base
        >
    bool static_set_compare_1<static_set_base>::
    operator== (
        const static_set_compare_1<static_set_base>& rhs
    ) const
    {
        bool result = true;
        if (static_set_base::size() != rhs.size())
            result = false;


        rhs.reset();
        static_set_base::reset();
        while (rhs.move_next() && static_set_base::move_next())
        {            
            if (!(rhs.element() == static_set_base::element()))
            {
                result = false;
                break;
            }
        }

        static_set_base::reset();
        rhs.reset();

        return result;
    }

// ----------------------------------------------------------------------------------------

}

#endif // DLIB_STATIC_SET_COMPARe_1_

