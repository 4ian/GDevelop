// Copyright (C) 2003  Davis E. King (davisking@users.sourceforge.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#ifndef DLIB_ARRAY_SORt_1_
#define DLIB_ARRAY_SORt_1_

#include "array_sort_abstract.h"
#include "../algs.h"
#include "../sort.h"

namespace dlib
{

    template <
        typename array_base
        >
    class array_sort_1 : public array_base
    {
        typedef typename array_base::type T;

        public:

            /*!
                this is a median of three version of the QuickSort algorithm and
                it swaps the entire array into a temporary C style array and sorts that and
                this uses the dlib::qsort_array function
            !*/

            void sort (
            );

    };

    template <
        typename array_base
        >
    inline void swap (
        array_sort_1<array_base>& a, 
        array_sort_1<array_base>& b 
    ) { a.swap(b); }

// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------
    // member function definitions
// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------

    template <
        typename array_base
        >
    void array_sort_1<array_base>::
    sort (
    )
    {
        if (this->size() > 1)
        {
            T* temp = new T[this->size()];
            
            for (unsigned long i = 0; i < this->size(); ++i)
                exchange(temp[i],(*this)[i]);
            
            // call the quick sort function for arrays that is in algs.h
            dlib::qsort_array(temp,0,this->size()-1);
            
            for (unsigned long i = 0; i < this->size(); ++i)
                exchange((*this)[i],temp[i]);
            
            delete [] temp;            
        }
        this->reset();
    }

// ----------------------------------------------------------------------------------------

}

#endif // DLIB_ARRAY_SORt_1_

