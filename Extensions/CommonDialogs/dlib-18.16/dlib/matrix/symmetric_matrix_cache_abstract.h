// Copyright (C) 2010  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#define DLIB_SYMMETRIC_MATRIX_CAcHE_ABSTRACT_Hh_
#ifndef DLIB_SYMMETRIC_MATRIX_CAcHE_ABSTRACT_Hh_

#include "matrix_abstract.h"

namespace dlib 
{

// ----------------------------------------------------------------------------------------

    template <
        typename cache_element_type
        >
    const matrix_exp symmetric_matrix_cache (
        const matrix_exp& m,
        long max_size_megabytes
    );
    /*!
        requires
            - m.size() > 0
            - m.nr() == m.nc()
            - max_size_megabytes >= 0
        ensures
            - This function assumes that m is symmetric.  If m is not symmetric then it won't
              crash but you will get incorrect results.
            - This method creates a matrix expression which internally caches the elements
              of m so that they can be accessed quickly.  It is useful if m is some kind of
              complex matrix expression which is both very large and expensive to evaluate.
              An example would be a kernel_matrix() expression with an expensive kernel and
              a large number of samples.  Such an expression would result in a huge matrix,
              potentially too big to store in memory.  The symmetric_matrix_cache() then makes
              it easy to store just the parts of a matrix expression which are accessed most 
              often in memory.  The specific details are defined below.
            - returns a matrix M such that
                - M == m
                  (i.e. M represents the same matrix as m)
                - M will cache elements of m and hold them internally so they can be quickly 
                  accessed.  In particular, M will attempt to allocate no more than 
                  max_size_megabytes megabytes of memory for the purposes of caching
                  elements of m.  When an element of the matrix is accessed it is either
                  retrieved from the cache, or if this is not possible, then an entire
                  column of m is loaded into a part of the cache which hasn't been used
                  recently and the needed element returned.
                - diag(m) is always loaded into the cache and is stored separately from 
                  the cached columns.  That means accesses to the diagonal elements of m
                  are always fast.
                - M will store the cached elements of m as cache_element_type objects.
                  Typically, cache_element_type will be float or double.  
                - To avoid repeated cache lookups, the following operations are optimized for
                  use with the symmetric_matrix_cache():
                    - diag(M), rowm(M,row_idx), colm(M,col_idx)
                      These methods will perform only one cache lookup operation for an
                      entire row/column/diagonal worth of data.  
    !*/

// ----------------------------------------------------------------------------------------

}

#endif // DLIB_SYMMETRIC_MATRIX_CAcHE_ABSTRACT_Hh_

