// Copyright (C) 2013  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#ifndef DLIB_ARRAY_tOOLS_H_
#define DLIB_ARRAY_tOOLS_H_

#include "../assert.h"
#include "array_tools_abstract.h"

namespace dlib
{
    template <typename T>
    void split_array (
        T& a,
        T& b,
        double frac
    )
    {
        // make sure requires clause is not broken
        DLIB_ASSERT(0 <= frac && frac <= 1,
            "\t void split_array()"
            << "\n\t frac must be between 0 and 1."
            << "\n\t frac: " << frac
            );

        const unsigned long asize = static_cast<unsigned long>(a.size()*frac);
        const unsigned long bsize = a.size()-asize;

        b.resize(bsize);
        for (unsigned long i = 0; i < b.size(); ++i)
        {
            swap(b[i], a[i+asize]);
        }
        a.resize(asize);
    }
}

#endif // DLIB_ARRAY_tOOLS_H_

