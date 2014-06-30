// Copyright (C) 2010  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#ifndef DLIB_UNORDERED_PAiR_H__
#define DLIB_UNORDERED_PAiR_H__

#include "serialize.h"

namespace dlib
{

// ----------------------------------------------------------------------------------------

    template <
        typename T
        >
    struct unordered_pair 
    {
        /*!
            REQUIREMENTS ON T
                T must be default constructable, copyable, and comparable using
                operator < and ==

            WHAT THIS OBJECT REPRESENTS
                This object is very similar to the std::pair struct except unordered_pair 
                is only capable of representing an unordered set of two items rather than 
                an ordered list of two items like std::pair.  

                This is best illustrated by example.  Suppose we have the following
                five variables:
                    std::pair<int,int> p1(1, 5), p2(5,1);
                    unordered_pair<int> up1(1,5), up2(5,1), up3(6,7);

                Then it is the case that:   
                    up1 == up2
                    up1 != up3
                    p1 != p2

               So the unordered_pair doesn't care about the order of the arguments.
               In this case, up1 and up2 are both equivalent.

        !*/

        typedef T type;
        typedef T first_type;
        typedef T second_type;

        const T first;
        const T second;

        unordered_pair() : first(), second() 
        /*!
            ensures
                - #first and #second are default initialized
        !*/ {}

        unordered_pair(
            const T& a, 
            const T& b
        ) :
            first( a < b ? a : b),
            second(a < b ? b : a)
        /*!
            ensures
                - #first <= #second
                - #first and #second contain copies of the items a and b.
        !*/ {}

        template <typename U>
        unordered_pair (
            const unordered_pair <U>& p
        ) :
            first(p.first),
            second(p.second)
        /*!
            ensures
                - #*this is a copy of p
        !*/ {}

        unordered_pair& operator= (
            const unordered_pair& item
        ) 
        /*!
            ensures
                - #*this == item
        !*/
        {
            const_cast<T&>(first) = item.first;
            const_cast<T&>(second) = item.second;
            return *this;
        }
    };

// ----------------------------------------------------------------------------------------

    template <typename T>
    bool operator==(const unordered_pair<T>& a, const unordered_pair <T>& b)
    {
        return a.first == b.first && a.second == b.second;
    }

    template <typename T>
    bool operator!=(const unordered_pair<T>& a, const unordered_pair <T>& b)
    {
        return !(a == b);
    }

    template <typename T>
    bool operator<(const unordered_pair<T>& a, const unordered_pair<T>& b)
    {
        return (a.first < b.first || (!(b.first < a.first) && a.second < b.second));
    }

    template <typename T>
    bool operator>(const unordered_pair<T>& a, const unordered_pair <T>& b)
    {
        return b < a;
    }

    template <typename T>
    bool operator<=(const unordered_pair<T>& a, const unordered_pair <T>& b)
    {
        return !(b < a);
    }

    template <typename T>
    bool operator>=(const unordered_pair<T>& a, const unordered_pair <T>& b)
    {
        return !(a < b);
    }

    template <typename T>
    unordered_pair<T> make_unordered_pair (const T& a, const T& b)
    {
        return unordered_pair<T>(a,b);
    }

// ----------------------------------------------------------------------------------------

    template <typename T>
    void serialize (
        const unordered_pair<T>& item,
        std::ostream& out
    )
    {
        try
        { 
            serialize(item.first,out); 
            serialize(item.second,out); 
        }
        catch (serialization_error& e)
        { throw serialization_error(e.info + "\n   while serializing object of type unordered_pair"); }
    }

    template <typename T>
    void deserialize (
        unordered_pair<T>& item,
        std::istream& in 
    )
    {
        try
        { 
            T a, b;
            deserialize(a,in); 
            deserialize(b,in); 
            item = make_unordered_pair(a,b);
        }
        catch (serialization_error& e)
        { throw serialization_error(e.info + "\n   while deserializing object of type unordered_pair"); }
    }

// ----------------------------------------------------------------------------------------

}

#endif // DLIB_UNORDERED_PAiR_H__

