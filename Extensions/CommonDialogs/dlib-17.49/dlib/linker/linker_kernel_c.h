// Copyright (C) 2003  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#ifndef DLIB_LINKER_KERNEl_C_
#define DLIB_LINKER_KERNEl_C_

#include "linker_kernel_abstract.h"
#include "../sockets.h"
#include "../algs.h"
#include "../assert.h"

namespace dlib
{


    template <
        typename linker_base
        >
    class linker_kernel_c : public linker_base
    {
        
        public:

            void link (
                connection& a,
                connection& b
            );

    };


// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------
    // member function definitions
// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------

    template <
        typename linker_base
        >
    void linker_kernel_c<linker_base>::
    link (
        connection& a,
        connection& b
    )
    {
        // make sure requires clause is not broken
        DLIB_CASSERT( 
            this->is_running() == false ,
            "\tvoid linker::link"
            << "\n\tis_running() == " << this->is_running() 
            << "\n\tthis: " << this
            );

        // call the real function
        linker_base::link(a,b);
    }

// ----------------------------------------------------------------------------------------

}

#endif // DLIB_LINKER_KERNEl_C_

