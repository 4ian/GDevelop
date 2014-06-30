// Copyright (C) 2011  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#undef DLIB_CREATE_RANDOM_PROJECTION_HAsH_ABSTRACT_H__
#ifdef DLIB_CREATE_RANDOM_PROJECTION_HAsH_ABSTRACT_H__

#include "projection_hash_abstract.h"
#include "../rand.h"

namespace dlib
{

// ----------------------------------------------------------------------------------------

    template <
        typename vector_type
        >
    projection_hash create_random_projection_hash (
        const vector_type& v,
        const int bits
    );
    /*!
        requires
            - 0 < bits <= 32
            - v.size() > 1
            - vector_type == a std::vector or compatible type containing dlib::matrix 
              objects, each representing a column vector of the same size.
            - for all valid i, j:
                - is_col_vector(v[i]) == true 
                - v[i].size() > 0
                - v[i].size() == v[j].size() 
                - i.e. v contains only column vectors and all the column vectors
                  have the same non-zero length
        ensures
            - returns a hash function H such that:
                - H.num_hash_bins() == pow(2,bits)
                - H will be setup so that it hashes the contents of v such that
                  each bin ends up with roughly the same number of elements
                  in it.
    !*/

// ----------------------------------------------------------------------------------------

}

#endif // DLIB_CREATE_RANDOM_PROJECTION_HAsH_ABSTRACT_H__


