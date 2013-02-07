// Copyright (C) 2003  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#undef DLIB_SEQUENCE_SORt_ABSTRACT_
#ifdef DLIB_SEQUENCE_SORt_ABSTRACT_

#include "sequence_kernel_abstract.h"

namespace dlib
{

    template <
        typename seq_base
        >
    class sequence_sort : public seq_base
    {

        /*!
            REQUIREMENTS ON T
                T must implement operator< for its type

            REQUIREMENTS ON seq_base 
                must be an implementation of sequence/sequence_kernel_abstract.h



            POINTERS AND REFERENCES TO INTERNAL DATA
                sort() may invalidate pointers and references to data members.

            WHAT THIS EXTENSION DOES FOR sequence
                this gives a sequence the ability to sort its contents by calling sort()
        !*/


    public:

        void sort (
        );
        /*!
            ensures
                - for all elements in #*this the ith element is <= the i+1 element
                - #at_start() == true
            throws
                - std::bad_alloc or any exception thrown by T's constructor
                    data may be lost if sort() throws
        !*/


    };


    template <
        typename seq_base
        >
    inline void swap (
        sequence_sort<seq_base>& a, 
        sequence_sort<seq_base>& b 
    ) { a.swap(b); } 
    /*!
        provides a global swap function
    !*/

}

#endif // DLIB_SEQUENCE_SORt_ABSTRACT_

