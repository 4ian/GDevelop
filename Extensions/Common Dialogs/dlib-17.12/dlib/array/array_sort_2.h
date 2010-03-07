// Copyright (C) 2003  Davis E. King (davisking@users.sourceforge.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#ifndef DLIB_ARRAY_SORt_2_
#define DLIB_ARRAY_SORt_2_

#include "array_sort_abstract.h"
#include "../algs.h"
#include "../sort.h"

namespace dlib
{

    template <
        typename array_base
        >
    class array_sort_2 : public array_base
    {

        public:

            /*!
                this is a median of three version of the QuickSort algorithm and
                this uses the dlib::qsort_array function
            !*/

            void sort (
            );

    };

    template <
        typename array_base
        >
    inline void swap (
        array_sort_2<array_base>& a, 
        array_sort_2<array_base>& b 
    ) { a.swap(b); }

// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------
    // member function definitions
// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------

    template <
        typename array_base
        >
    void array_sort_2<array_base>::
    sort (
    )
    {
        if (this->size() > 1)
        {
            // call the quick sort function for arrays that is in algs.h
            dlib::qsort_array(*this,0,this->size()-1);
        }
        this->reset();
    }

// ----------------------------------------------------------------------------------------

}

#endif // DLIB_ARRAY_SORt_2_

