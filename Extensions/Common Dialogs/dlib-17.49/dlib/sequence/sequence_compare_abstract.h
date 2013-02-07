// Copyright (C) 2003  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#undef DLIB_SEQUENCE_COMPARe_ABSTRACT_
#ifdef DLIB_SEQUENCE_COMPARe_ABSTRACT_

#include "sequence_kernel_abstract.h"

#include "../algs.h"


namespace dlib
{

    template <
        typename seq_base
        >
    class sequence_compare : public seq_base
    {

        /*!
            REQUIREMENTS ON T
                T must implement operator< for its type and
                T must implement operator== for its type

            REQUIREMENTS ON SEQUENCE_BASE
                must be an implementation of sequence/sequence_kernel_abstract.h


            POINTERS AND REFERENCES TO INTERNAL DATA
                operator== and operator< do not invalidate pointers or references to 
                data members

            WHAT THIS EXTENSION DOES FOR sequence
                This gives a sequence the ability to compare itself to other 
                sequences using the < and == operators. 
        !*/

    public:

        bool operator< (
            const sequence_compare& rhs
        ) const;
        /*!
            ensures
                - returns true if there exists an integer j such that 0 <= j < size() 
                  and for all integers i such that 0 <= i < j where it is true that
                  (*this)[i] <= rhs[i] and (*this)[j] < rhs[j] 
                - returns false if there is no j that will satisfy the above conditions
        !*/

        bool operator== (
            const sequence_compare& rhs
        ) const;
        /*!
            ensures
                - returns true if for all i: (*this)[i] == rhs[i] else returns false                   
        !*/

    };

    template <
        typename seq_base
        >
    inline void swap (
        sequence_compare<seq_base>& a, 
        sequence_compare<seq_base>& b 
    ) { a.swap(b); } 
    /*!
        provides a global swap function
    !*/

}

#endif // DLIB_SEQUENCE_COMPARe_ABSTRACT_

