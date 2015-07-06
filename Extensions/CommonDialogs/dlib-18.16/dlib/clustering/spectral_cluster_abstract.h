// Copyright (C) 2015  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#undef DLIB_SPECTRAL_CLUSTEr_ABSTRACT_H_
#ifdef DLIB_SPECTRAL_CLUSTEr_ABSTRACT_H_

#include <vector>

namespace dlib
{
    template <
        typename kernel_type,
        typename vector_type
        >
    std::vector<unsigned long> spectral_cluster (
        const kernel_type& k,
        const vector_type& samples,
        const unsigned long num_clusters
    );
    /*!
        requires
            - samples must be something with an interface compatible with std::vector.
            - The following expression must evaluate to a double or float:
                k(samples[i], samples[j])
            - num_clusters > 0
        ensures
            - Performs the spectral clustering algorithm described in the paper: 
              On spectral clustering: Analysis and an algorithm by Ng, Jordan, and Weiss.
              and returns the results.
            - This function clusters the input data samples into num_clusters clusters and
              returns a vector that indicates which cluster each sample falls into.  In
              particular, we return an array A such that:
                - A.size() == samples.size()
                - A[i] == the cluster assignment of samples[i].
                - for all valid i: 0 <= A[i] < num_clusters 
            - The "similarity" of samples[i] with samples[j] is given by
              k(samples[i],samples[j]).  This means that k() should output a number >= 0
              and the number should be larger for samples that are more similar.
    !*/
}

#endif // DLIB_SPECTRAL_CLUSTEr_ABSTRACT_H_


