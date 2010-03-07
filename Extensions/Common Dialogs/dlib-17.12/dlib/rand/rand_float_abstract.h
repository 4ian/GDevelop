// Copyright (C) 2007  Davis E. King (davisking@users.sourceforge.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#undef DLIB_RAND_FLOAt_ABSTRACT_
#ifdef DLIB_RAND_FLOAt_ABSTRACT_ 


#include "rand_kernel_abstract.h"

namespace dlib
{

    template <
        typename rand_base
        >
    class rand_float : public rand_base
    {

        /*!
            REQUIREMENTS ON RAND_BASE
                RAND_BASE is instantiated with type T and
                is an implementation of rand/rand_kernel_abstract.h

            WHAT THIS EXTENSION DOES FOR RAND 
                This gives rand the ability to generate random float values.
        !*/


        public:

            float get_random_float (
            );
            /*!
                ensures
                    - returns a random float number N where:  0.0 <= N < 1.0.
                throws
                    - std::bad_alloc
            !*/

            double get_random_double (
            );
            /*!
                ensures
                    - returns a random double number N where:  0.0 <= N < 1.0.
                throws
                    - std::bad_alloc
            !*/
    };

    template <
        template rand_base
        >
    inline void swap (
        rand_float<rand_base>& a, 
        rand_float<rand_base>& b 
    ) { a.swap(b); }  
    /*!
        provides a global swap function
    !*/

}

#endif // DLIB_RAND_FLOAt_ABSTRACT_


