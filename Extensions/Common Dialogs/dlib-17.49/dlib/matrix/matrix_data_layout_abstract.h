// Copyright (C) 2008  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#undef DLIB_MATRIx_DATA_LAYOUT_ABSTRACT_
#ifdef DLIB_MATRIx_DATA_LAYOUT_ABSTRACT_

#include "../algs.h"

namespace dlib
{

// ----------------------------------------------------------------------------------------

    struct row_major_layout
    {
        /*!
            This is the default matrix layout.  Any matrix object that uses this
            layout will be laid out in memory in row major order.  Additionally,
            all elements are contiguous (e.g. there isn't any padding at the ends of
            rows or anything like that)
        !*/
    };

// ----------------------------------------------------------------------------------------

    struct column_major_layout
    {
        /*!
            Any matrix object that uses this layout will be laid out in memory in 
            column major order.  Additionally, all elements are contiguous (e.g. 
            there isn't any padding at the ends of rows or anything like that)
        !*/
    };

// ----------------------------------------------------------------------------------------

}

#endif // DLIB_MATRIx_DATA_LAYOUT_ABSTRACT_


