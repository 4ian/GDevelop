// Copyright (C) 2003  Davis E. King (davisking@users.sourceforge.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#undef DLIB_ARRAY_SORt_ABSTRACT_
#ifdef DLIB_ARRAY_SORt_ABSTRACT_

#include "array_kernel_abstract.h"

namespace dlib
{

    template <
        typename array_base
        >
    class array_sort : public array_base
    {

        /*!
            REQUIREMENTS ON ARRAY_BASE
                must be an implementation of array/array_kernel_abstract.h 

            POINTERS AND REFERENCES
                sort() may invalidate pointers and references to internal data.

            WHAT THIS EXTENSION DOES FOR ARRAY
                This gives an array the ability to sort its contents by calling sort().
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
        typename array_base
        >
    inline void swap (
        array_sort<array_base>& a, 
        array_sort<array_base>& b 
    ) { a.swap(b); }
    /*!
        provides a global swap function
    !*/

}

#endif // DLIB_ARRAY_SORt_ABSTRACT_

