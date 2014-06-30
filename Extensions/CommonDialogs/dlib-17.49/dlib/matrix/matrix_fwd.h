// Copyright (C) 2006  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#ifndef DLIB_MATRIx_FWD
#define DLIB_MATRIx_FWD

#include "../algs.h"

namespace dlib
{

// ----------------------------------------------------------------------------------------

    struct row_major_layout;

// ----------------------------------------------------------------------------------------

    template <
        typename T,
        long num_rows = 0,
        long num_cols = 0,
        typename mem_manager = default_memory_manager,
        typename layout = row_major_layout 
        >
    class matrix; 

// ----------------------------------------------------------------------------------------

}

#endif // DLIB_MATRIx_FWD

