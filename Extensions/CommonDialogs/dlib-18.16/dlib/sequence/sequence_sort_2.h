// Copyright (C) 2003  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#ifndef DLIB_SEQUENCE_SORt_2_
#define DLIB_SEQUENCE_SORt_2_

#include "sequence_sort_abstract.h"
#include "../algs.h"
#include "../sort.h"

namespace dlib
{

    template <
        typename seq_base 
        >
    class sequence_sort_2 : public seq_base
    {
        typedef typename seq_base::type T;

    public:

        /*!
            this is a version of the QuickSort algorithm
            this uses the dlib::qsort_array function
        !*/

        void sort (
        );


    };

    template <
        typename seq_base
        >
    inline void swap (
        sequence_sort_2<seq_base>& a, 
        sequence_sort_2<seq_base>& b 
    ) { a.swap(b); }    

// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------
// member function definitions
// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------

    template <
        typename seq_base
        >
    void sequence_sort_2<seq_base>::
    sort (
    )
    {
        if (this->size() > 1)
        {
            dlib::qsort_array(*this,0,this->size()-1);
        }
    }

// ----------------------------------------------------------------------------------------

}

#endif // DLIB_SEQUENCE_SORt_2_

