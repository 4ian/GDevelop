// Copyright (C) 2007  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#ifndef DLIB_SET_UTILs_
#define DLIB_SET_UTILs_

#include "../algs.h"
#include "set_utils_abstract.h"

namespace dlib
{

// ----------------------------------------------------------------------------------------

    template <
        typename T,
        typename U
        >
    unsigned long set_intersection_size (
        const T& a,
        const U& b
    )
    {
        if (is_same_object(a,b))
            return a.size();

        unsigned long num = 0;

        if (a.size() < b.size())
        {
            a.reset();
            while (a.move_next())
            {
                if (b.is_member(a.element()))
                    ++num;
            }
        }
        else
        {
            b.reset();
            while (b.move_next())
            {
                if (a.is_member(b.element()))
                    ++num;
            }
        }

        return num;
    }

// ----------------------------------------------------------------------------------------

    template <
        typename T,
        typename U,
        typename V
        >
    void set_union (
        const T& a,
        const U& b,
        V& u
    )
    {
        typedef typename T::type type;
        if (is_same_object(a,u) || is_same_object(b,u))
        {
            V local_u;
            type temp;
            a.reset();
            while (a.move_next())
            {
                temp = a.element();
                local_u.add(temp);
            }

            b.reset();
            while (b.move_next())
            {
                if (a.is_member(b.element()) == false)
                {
                    temp = b.element();
                    local_u.add(temp);
                }
            }

            local_u.swap(u);
        }
        else
        {
            u.clear();

            type temp;
            a.reset();
            while (a.move_next())
            {
                temp = a.element();
                u.add(temp);
            }

            b.reset();
            while (b.move_next())
            {
                if (a.is_member(b.element()) == false)
                {
                    temp = b.element();
                    u.add(temp);
                }
            }
        }
    }

// ----------------------------------------------------------------------------------------

    template <
        typename T,
        typename U,
        typename V
        >
    void set_intersection (
        const T& a,
        const U& b,
        V& i
    )
    {
        typedef typename T::type type;
        if (is_same_object(a,i) || is_same_object(b,i))
        {
            V local_i;

            type temp;

            if (a.size() < b.size())
            {
                a.reset();
                while (a.move_next())
                {
                    if (b.is_member(a.element()))
                    {
                        temp = a.element();
                        local_i.add(temp);
                    }
                }
            }
            else
            {
                b.reset();
                while (b.move_next())
                {
                    if (a.is_member(b.element()))
                    {
                        temp = b.element();
                        local_i.add(temp);
                    }
                }
            }

            local_i.swap(i);
        }
        else
        {
            i.clear();
            type temp;

            if (a.size() < b.size())
            {
                a.reset();
                while (a.move_next())
                {
                    if (b.is_member(a.element()))
                    {
                        temp = a.element();
                        i.add(temp);
                    }
                }
            }
            else
            {
                b.reset();
                while (b.move_next())
                {
                    if (a.is_member(b.element()))
                    {
                        temp = b.element();
                        i.add(temp);
                    }
                }
            }
        }
    }

// ----------------------------------------------------------------------------------------

    template <
        typename T,
        typename U,
        typename V
        >
    void set_difference (
        const T& a,
        const U& b,
        V& d 
    )
    {
        typedef typename T::type type;
        if (is_same_object(a,d) || is_same_object(b,d))
        {
            V local_d;

            type temp;

            a.reset();
            while (a.move_next())
            {
                if (b.is_member(a.element()) == false)
                {
                    temp = a.element();
                    local_d.add(temp);
                }
            }

            local_d.swap(d);
        }
        else
        {
            d.clear();
            type temp;

            a.reset();
            while (a.move_next())
            {
                if (b.is_member(a.element()) == false)
                {
                    temp = a.element();
                    d.add(temp);
                }
            }
        }
    }

// ----------------------------------------------------------------------------------------

}

#endif // DLIB_SET_UTILs_



