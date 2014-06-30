// Copyright (C) 2010  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#undef DLIB_SORT_BASIS_VECTORs_ABSTRACT_H__
#ifdef DLIB_SORT_BASIS_VECTORs_ABSTRACT_H__

#include <vector>

#include "../matrix.h"
#include "../statistics.h"

namespace dlib
{

// ----------------------------------------------------------------------------------------

    template <
        typename kernel_type,
        typename vect1_type,
        typename vect2_type,
        typename vect3_type
        >
    const std::vector<typename kernel_type::sample_type> sort_basis_vectors (
        const kernel_type& kern,
        const vect1_type& samples,
        const vect2_type& labels,
        const vect3_type& basis,
        double eps = 0.99
    );
    /*!
        requires
            - is_binary_classification_problem(samples, labels)
            - 0 < eps <= 1
            - basis.size() > 0
            - kernel_type is a kernel function object as defined in dlib/svm/kernel_abstract.h 
              It must be capable of operating on the elements of samples and basis.
            - vect1_type == a matrix or something convertible to a matrix via vector_to_matrix()
            - vect2_type == a matrix or something convertible to a matrix via vector_to_matrix()
            - vect3_type == a matrix or something convertible to a matrix via vector_to_matrix()
        ensures
            - A kernel based learning method ultimately needs to select a set of basis functions
              represented by a particular choice of kernel and a set of basis vectors.  
              sort_basis_vectors() attempts to order the elements of basis so that elements which are
              most useful in solving the binary classification problem defined by samples and
              labels come first. 
            - In particular, this function returns a std::vector, SB, of sorted basis vectors such that:
                - 0 < SB.size() <= basis.size()
                - SB will contain elements from basis but they will have been sorted so that 
                  the most useful elements come first (i.e. SB[0] is the most important). 
                - eps notionally controls how big SB will be.  Bigger eps corresponds to a 
                  bigger basis.  You can think of it like asking for eps percent of the 
                  discriminating power from the input basis.
    !*/

// ----------------------------------------------------------------------------------------

}

#endif // DLIB_SORT_BASIS_VECTORs_ABSTRACT_H__

