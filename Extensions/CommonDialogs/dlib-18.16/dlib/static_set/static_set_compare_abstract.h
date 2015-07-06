// Copyright (C) 2005  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#undef DLIB_STATIC_SET_COMPARe_ABSTRACT_
#ifdef DLIB_STATIC_SET_COMPARe_ABSTRACT_

#include "static_set_kernel_abstract.h"

#include "../algs.h"


namespace dlib
{

    template <
        typename static_set_base
        >
    class static_set_compare : public static_set_base
    {

        /*!
            REQUIREMENTS ON static_set_base
                must an implementation of static_set/static_set_kernel_abstract.h

            POINTERS AND REFERENCES TO INTERNAL DATA
                operator== and operator< invalidate pointers or references to 
                data members.

            WHAT THIS EXTENSION DOES FOR static_set
                This gives a static_set the ability to compare itself to other 
                static_sets using the < and == operators. 

                The < operator is conceptually weird for sets.  It is useful 
                though because it allows you to make sets of sets since
                sets require that their containing type implement operator<.

                Also note that it is the case that for any two sets a and b 
                if (a<b) == false and (b<a) == false then a == b. 
               

            NOTATION
                For the purposes of defining what these operators do I will 
                use the operator[] to reference the elements of the static_sets.
                operator[] is defined to access the elements of the static_set in 
                the same order they would be enumerated by the enumerable 
                interface.
        !*/

        public:

            bool operator< (
                const static_set_compare& rhs
            ) const;
            /*!
                ensures
                    - #at_start() == true
                    - if (size() < rhs.size()) then
                        - returns true
                    - else if (size() > rhs.size()) then
                        - returns false
                    - else
                        - returns true if there exists an integer j such that 0 <= j < size() 
                          and for all integers i such that 0 <= i < j where it is true that
                          (*this)[i] == rhs[i] and (*this)[j] < rhs[j] 
                        - returns false if there is no j that will satisfy the above conditions.                    
            !*/

            bool operator== (
                const static_set_compare& rhs
            ) const;
            /*!
                ensures
                    - #at_start() == true
                    - returns true if *this and rhs contain the same elements.
                      returns false otherwise.
            !*/
    };


    template <
        typename static_set_base
        >
    inline void swap (
        static_set_compare<static_set_base>& a, 
        static_set_compare<static_set_base>& b 
    ) { a.swap(b); } 
    /*!
        provides a global swap function
    !*/

}

#endif // DLIB_STATIC_SET_COMPARe_ABSTRACT_

