// Copyright (C) 2009  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#undef DLIB_SVm_KERNEL_MATRIX_ABSTRACT_
#ifdef DLIB_SVm_KERNEL_MATRIX_ABSTRACT_

#include <vector>
#include "kernel_abstract.h"
#include "../matrix/matrix_abstract.h"
#include "../algs.h"

namespace dlib
{

// ----------------------------------------------------------------------------------------

    template <
        typename kernel_type,
        typename V
        >
    const matrix_exp kernel_matrix (
        const kernel_type& kernel,
        const V& v
    );
    /*!
        requires
            - kernel == a kernel function object as defined by the file dlib/svm/kernel_abstract.h.
              This kernel must also be capable of operating on the contents of v.
            - V == dlib::matrix, std::vector, dlib::std_vector_c, dlib::random_subset_selector, 
              dlib::linearly_independent_subset_finder, or kernel_type::sample_type.
            - if (V is a dlib::matrix) then
                - is_vector(v) == true
        ensures
            - if (V is of type kernel_type::sample_type) then
                - returns a matrix R such that:
                    - R::type == kernel_type::scalar_type
                    - R.size() == 1
                    - R(0,0) == kernel(v,v)
            - else
                - returns a matrix R such that:
                    - R::type == kernel_type::scalar_type
                    - R is a square matrix of v.size() rows by v.size() columns
                    - for all valid r and c:
                        - R(r,c) == kernel(v(r), v(c))
    !*/

// ----------------------------------------------------------------------------------------

    template <
        typename kernel_type,
        typename V1,
        typename V2
        >
    const matrix_exp kernel_matrix (
        const kernel_type& kernel,
        const V1& v1,
        const V2& v2
    );
    /*!
        requires
            - kernel == a kernel function object as defined by the file dlib/svm/kernel_abstract.h
              This kernel must also be capable of operating on the contents of v1 and v2.
            - V1 == dlib::matrix, std::vector, dlib::std_vector_c, dlib::random_subset_selector,  
              dlib::linearly_independent_subset_finder, or kernel_type::sample_type.
            - V2 == dlib::matrix, std::vector, dlib::std_vector_c, dlib::random_subset_selector, 
              dlib::linearly_independent_subset_finder, or kernel_type::sample_type.
            - if (V1 is a dlib::matrix) then
                - is_vector(v1) == true
            - if (V2 is a dlib::matrix) then
                - is_vector(v2) == true
        ensures
            - if (V1 and V2 are of type kernel_type::sample_type) then
                - returns a matrix R such that:
                    - R::type == kernel_type::scalar_type
                    - R.size() == 1
                    - R(0,0) == kernel(v1,v2)
            - else if (V1 is of type kernel_type::sample_type) then
                - returns a matrix R such that:
                    - R::type == kernel_type::scalar_type
                    - R.nr() == 1
                    - R.nc() == v2.size()
                    - for all valid c:
                        - R(0,c) == kernel(v1, v2(c))
            - else if (V2 is of type kernel_type::sample_type) then
                - returns a matrix R such that:
                    - R::type == kernel_type::scalar_type
                    - R.nr() == v1.size()
                    - R.nc() == 1
                    - for all valid r:
                        - R(r,0) == kernel(v1(r), v2)
            - else
                - returns a matrix R such that:
                    - R::type == kernel_type::scalar_type
                    - R.nr() == v1.size()
                    - R.nc() == v2.size()
                    - for all valid r and c:
                        - R(r,c) == kernel(v1(r), v2(c))


            A note about aliasing (see the examples/matrix_expressions_ex.cpp example program
            for a discussion of what aliasing is in the context of the dlib::matrix): 
                kernel_matrix() expressions can detect aliasing of an argument if that 
                argument is of type kernel_type::sample_type.  However, it can't detect
                aliasing though std::vectors or other "list of sample type" container class
                arguments.  This means that it is safe to assign a kernel_matrix() expression
                to a sample_type if V1 or V2 are of sample_type but not safe otherwise.  However,
                since the latter case results in a general n by m matrix rather than a column
                or row vector you shouldn't ever be doing it anyway.
    !*/

// ----------------------------------------------------------------------------------------

}
    
#endif // DLIB_SVm_KERNEL_MATRIX_ABSTRACT_

