// Copyright (C) 2010  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#undef DLIB_SIMPLIFY_LINEAR_DECiSION_FUNCTION_ABSTRACT_H__
#ifdef DLIB_SIMPLIFY_LINEAR_DECiSION_FUNCTION_ABSTRACT_H__

#include "../algs.h"
#include "function_abstract.h"
#include "sparse_kernel_abstract.h"
#include "kernel_abstract.h"

namespace dlib
{

// ----------------------------------------------------------------------------------------

    template <
        typename T
        >
    decision_function<sparse_linear_kernel<T> > simplify_linear_decision_function (
        const decision_function<sparse_linear_kernel<T> >& df
    );
    /*!
        requires
            - T must be a sparse vector as defined in dlib/svm/sparse_vector_abstract.h
        ensures
            - returns a simplified version of df that only has one basis vector.  That
              is, returns a decision function D such that:
                - D.basis_vectors.size() == 1 (or 0 if df is empty)
                - for all possible x: D(x) == df(x)
    !*/

// ----------------------------------------------------------------------------------------

    template <
        typename T
        >
    decision_function<linear_kernel<T> > simplify_linear_decision_function (
        const decision_function<linear_kernel<T> >& df
    );
    /*!
        requires
            - T must be a dlib::matrix object 
        ensures
            - returns a simplified version of df that only has one basis vector.  That
              is, returns a decision function D such that:
                - D.basis_vectors.size() == 1 (or 0 if df is empty)
                - for all possible x: D(x) == df(x)
    !*/

// ----------------------------------------------------------------------------------------

    template <
        typename T
        >
    decision_function<linear_kernel<T> > simplify_linear_decision_function (
        const normalized_function<decision_function<linear_kernel<T> >, vector_normalizer<T> >& df
    );
    /*!
        requires
            - T must be a dlib::matrix object 
        ensures
            - returns a simplified version of df that only has one basis vector and 
              doesn't involve an explicit vector_normalizer.  That is, returns a 
              decision function D such that:
                - D.basis_vectors.size() == 1 (or 0 if df is empty)
                - for all possible x: D(x) == df(x)
    !*/

// ----------------------------------------------------------------------------------------

}

#endif // DLIB_SIMPLIFY_LINEAR_DECiSION_FUNCTION_ABSTRACT_H__

