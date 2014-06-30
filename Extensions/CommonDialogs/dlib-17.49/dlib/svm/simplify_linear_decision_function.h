// Copyright (C) 2010  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#ifndef DLIB_SIMPLIFY_LINEAR_DECiSION_FUNCTION_H__
#define DLIB_SIMPLIFY_LINEAR_DECiSION_FUNCTION_H__

#include "simplify_linear_decision_function_abstract.h"
#include "../algs.h"
#include "function.h"
#include "sparse_kernel.h"
#include "kernel.h"
#include <map>
#include <vector>

namespace dlib
{

// ----------------------------------------------------------------------------------------

    template <
        typename T
        >
    decision_function<sparse_linear_kernel<T> > simplify_linear_decision_function (
        const decision_function<sparse_linear_kernel<T> >& df
    )
    {
        // don't do anything if we don't have to
        if (df.basis_vectors.size() <= 1)
            return df;

        decision_function<sparse_linear_kernel<T> > new_df;

        new_df.b = df.b;
        new_df.basis_vectors.set_size(1);
        new_df.alpha.set_size(1);
        new_df.alpha(0) = 1;

        // now compute the weighted sum of all the sparse basis_vectors in df
        typedef typename T::value_type pair_type;
        typedef typename pair_type::first_type key_type;
        typedef typename pair_type::second_type value_type;
        std::map<key_type, value_type> accum;
        for (long i = 0; i < df.basis_vectors.size(); ++i)
        {
            typename T::const_iterator j = df.basis_vectors(i).begin();
            const typename T::const_iterator end = df.basis_vectors(i).end();
            for (; j != end; ++j)
            {
                accum[j->first] += df.alpha(i) * (j->second);
            }
        }

        new_df.basis_vectors(0) = T(accum.begin(), accum.end());

        return new_df;
    }

// ----------------------------------------------------------------------------------------

    template <
        typename T
        >
    decision_function<linear_kernel<T> > simplify_linear_decision_function (
        const decision_function<linear_kernel<T> >& df
    )
    {
        // don't do anything if we don't have to
        if (df.basis_vectors.size() <= 1)
            return df;

        decision_function<linear_kernel<T> > new_df;

        new_df.b = df.b;
        new_df.basis_vectors.set_size(1);
        new_df.alpha.set_size(1);
        new_df.alpha(0) = 1;

        // now compute the weighted sum of all the basis_vectors in df
        new_df.basis_vectors(0) = 0;
        for (long i = 0; i < df.basis_vectors.size(); ++i)
        {
            new_df.basis_vectors(0) += df.alpha(i) * df.basis_vectors(i);
        }

        return new_df;
    }

// ----------------------------------------------------------------------------------------

    template <
        typename T
        >
    decision_function<linear_kernel<T> > simplify_linear_decision_function (
        const normalized_function<decision_function<linear_kernel<T> >, vector_normalizer<T> >& df
    )
    {
        decision_function<linear_kernel<T> > new_df = simplify_linear_decision_function(df.function);

        // now incorporate the normalization stuff into new_df
        new_df.basis_vectors(0) = pointwise_multiply(new_df.basis_vectors(0), df.normalizer.std_devs());
        new_df.b += dot(new_df.basis_vectors(0), df.normalizer.means());

        return new_df;
    }

// ----------------------------------------------------------------------------------------

}

#endif // DLIB_SIMPLIFY_LINEAR_DECiSION_FUNCTION_H__

