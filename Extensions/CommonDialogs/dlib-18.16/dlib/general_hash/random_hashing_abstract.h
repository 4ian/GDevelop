// Copyright (C) 2012  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#undef DLIB_RANDOM_HAsHING_ABSTRACT_Hh_ 
#ifdef DLIB_RANDOM_HAsHING_ABSTRACT_Hh_ 

#include "random_hashing_abstract.h"
#include "murmur_hash3.h"

namespace dlib
{

// ----------------------------------------------------------------------------------------

    double uniform_random_hash (
        const uint64& k1,
        const uint64& k2,
        const uint64& k3
    );
    /*!
        ensures
            - This function uses hashing to generate uniform random values in the range [0,1).
            - To define this function precisely, assume we have an arbitrary sequence of
              input triplets.  Then calling uniform_random_hash() on each of them should
              result in a sequence of double values that look like numbers sampled
              independently and uniformly at random from the interval [0,1).  This is true
              even if there is some simple pattern in the inputs.  For example, (0,0,0),
              (1,0,0), (2,0,0), (3,0,0), etc.
            - This function is deterministic.  That is, the same output is always returned
              when given the same input.
    !*/

// ----------------------------------------------------------------------------------------

    double gaussian_random_hash (
        const uint64& k1,
        const uint64& k2,
        const uint64& k3
    );
    /*!
        ensures
            - This function uses hashing to generate Gaussian distributed random values
              with mean 0 and variance 1.  
            - To define this function precisely, assume we have an arbitrary sequence of
              input triplets.  Then calling gaussian_random_hash() on each of them should
              result in a sequence of double values that look like numbers sampled
              independently from a standard normal distribution.  This is true even if
              there is some simple pattern in the inputs.  For example, (0,0,0), (1,0,0),
              (2,0,0), (3,0,0), etc.
            - This function is deterministic.  That is, the same output is always returned
              when given the same input.
    !*/

// ----------------------------------------------------------------------------------------

}

#endif // DLIB_RANDOM_HAsHING_ABSTRACT_Hh_

