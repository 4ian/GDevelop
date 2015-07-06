// Copyright (C) 2013  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#undef DLIB_FIND_K_NEAREST_NEIGHBOrS_LSH_ABSTRACT_Hh_
#ifdef DLIB_FIND_K_NEAREST_NEIGHBOrS_LSH_ABSTRACT_Hh_

#include "../lsh/hashes_abstract.h"
#include "sample_pair_abstract.h"

namespace dlib
{

// ----------------------------------------------------------------------------------------

    template <
        typename vector_type,
        typename hash_function_type
        >
    void hash_samples (
        const vector_type& samples,
        const hash_function_type& hash_funct,
        const unsigned long num_threads,
        std::vector<typename hash_function_type::result_type>& hashes
    );
    /*!
        requires
            - hash_funct() is threadsafe.  This means that it must be safe for multiple
              threads to invoke the member functions of hash_funct() at the same time.
            - vector_type is any container that looks like a std::vector or dlib::array.
            - hash_funct must be a function object with an interface compatible with the
              objects defined in dlib/lsh/hashes_abstract.h.  In particular, hash_funct
              must be capable of hashing the elements in the samples vector.
        ensures
            - This function hashes all the elements in samples and stores the results in
              hashes.  It will also use num_threads concurrent threads to do this.  You
              should set this value equal to the number of processing cores on your
              computer for maximum speed.
            - #hashes.size() == 0
            - for all valid i:
                - #hashes[i] = hash_funct(samples[i])
                  (i.e. #hashes[i] will contain the hash of samples[i])
    !*/

// ----------------------------------------------------------------------------------------

    template <
        typename vector_type,
        typename distance_function_type,
        typename hash_function_type,
        typename alloc
        >
    void find_k_nearest_neighbors_lsh (
        const vector_type& samples,
        const distance_function_type& dist_funct,
        const hash_function_type& hash_funct,
        const unsigned long k,
        const unsigned long num_threads,
        std::vector<sample_pair, alloc>& edges,
        const unsigned long k_oversample = 20 
    );
    /*!
        requires
            - hash_funct and dist_funct are threadsafe.  This means that it must be safe
              for multiple threads to invoke the member functions of these objects at the
              same time.
            - k > 0
            - k_oversample > 0
            - dist_funct(samples[i], samples[j]) must be a valid expression that evaluates
              to a floating point number 
            - vector_type is any container that looks like a std::vector or dlib::array.
            - hash_funct must be a function object with an interface compatible with the
              objects defined in dlib/lsh/hashes_abstract.h.  In particular, hash_funct
              must be capable of hashing the elements in the samples vector.
        ensures
            - This function computes an approximate form of a k nearest neighbors graph of
              the elements in samples.  In particular, the way it works is that it first
              hashes all elements in samples using the provided locality sensitive hash
              function hash_funct().  Then it performs an exact k nearest neighbors on the
              hashes which can be done very quickly.  For each of these neighbors we
              compute the true distance using dist_funct() and the k nearest neighbors for
              each sample are stored into #edges.  
            - Note that samples with an infinite distance between them are considered to be
              not connected at all. Therefore, we exclude edges with such distances from
              being output.
            - for all valid i:
                - #edges[i].distance() == dist_funct(samples[#edges[i].index1()], samples[#edges[i].index2()])
                - #edges[i].distance() < std::numeric_limits<double>::infinity()
            - contains_duplicate_pairs(#edges) == false
            - This function will use num_threads concurrent threads of processing.  You
              should set this value equal to the number of processing cores on your
              computer for maximum speed.
            - The hash based k nearest neighbor step is approximate, however, you can
              improve the output accuracy by using a larger k value for this first step.
              Therefore, this function finds k*k_oversample nearest neighbors during the
              first hashing based step. 
    !*/

// ----------------------------------------------------------------------------------------

}

#endif // DLIB_FIND_K_NEAREST_NEIGHBOrS_LSH_ABSTRACT_Hh_

