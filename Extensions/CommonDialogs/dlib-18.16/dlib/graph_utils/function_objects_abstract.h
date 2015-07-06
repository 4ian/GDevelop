// Copyright (C) 2010  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#undef DLIB_MR_FUNCTION_ObJECTS_ABSTRACT_Hh_
#ifdef DLIB_MR_FUNCTION_ObJECTS_ABSTRACT_Hh_

#include "../matrix.h"
#include <cmath>
#include "../svm/sparse_vector_abstract.h"

namespace dlib
{

// ----------------------------------------------------------------------------------------

    struct squared_euclidean_distance
    {
        /*!
            WHAT THIS OBJECT REPRESENTS
                This is a simple function object that computes squared euclidean distance
                between two dlib::matrix objects. 

            THREAD SAFETY
                This object has no mutable members.  Therefore, it is safe to call
                operator() on a single instance of this object simultaneously from multiple
                threads.
        !*/

        squared_euclidean_distance (
        );
        /*!
            ensures
                - #lower == 0
                - #upper == std::numeric_limits<double>::infinity()
        !*/

        squared_euclidean_distance (
            const double l,
            const double u
        );
        /*!
            ensures
                - #lower == l
                - #upper == u  
        !*/

        const double lower;
        const double upper;

        template <typename sample_type>
        double operator() (
            const sample_type& a,
            const sample_type& b
        ) const;
        /*!
            requires
                - sample_type should be a kind of dlib::matrix 
            ensures
                - let LEN = length_squared(a-b)
                - if (lower <= LEN <= upper) then
                    - returns LEN
                - else
                    - returns std::numeric_limits<double>::infinity()
        !*/
    };

// ----------------------------------------------------------------------------------------

    struct cosine_distance 
    {
        /*!
            WHAT THIS OBJECT REPRESENTS
                This is a simple function object that computes the cosine of the angle
                between two vectors and returns 1 - this quantity.   Moreover, this object
                works for both sparse and dense vectors.

            THREAD SAFETY
                This object has no mutable members.  Therefore, it is safe to call
                operator() on a single instance of this object simultaneously from multiple
                threads.
        !*/

        template <typename sample_type>
        double operator() (
            const sample_type& a,
            const sample_type& b
        ) const;
        /*!
            requires
                - sample_type is a dense vector (e.g. a dlib::matrix) or a sparse
                  vector as defined at the top of dlib/svm/sparse_vector_abstract.h
            ensures
                - let theta = the angle between a and b.  
                - returns 1 - cos(theta)
                  (e.g. this function returns 0 when a and b have an angle of 0 between
                  each other, 1 if they have a 90 degree angle, and a maximum of 2 if the
                  vectors have a 180 degree angle between each other).
                - zero length vectors are considered to have angles of 0 between all other
                  vectors.
        !*/
    };

// ----------------------------------------------------------------------------------------

    struct negative_dot_product_distance 
    {
        /*!
            WHAT THIS OBJECT REPRESENTS
                This is a simple function object that computes the dot product between two
                vectors and returns the negation of this value.  Moreover, this object
                works for both sparse and dense vectors.

            THREAD SAFETY
                This object has no mutable members.  Therefore, it is safe to call
                operator() on a single instance of this object simultaneously from multiple
                threads.
        !*/

        template <typename sample_type>
        double operator() (
            const sample_type& a,
            const sample_type& b
        ) const;
        /*!
            requires
                - sample_type is a dense vector (e.g. a dlib::matrix) or a sparse
                  vector as defined at the top of dlib/svm/sparse_vector_abstract.h
            ensures
                - returns -dot(a,b)
        !*/
    };

// ----------------------------------------------------------------------------------------

    struct use_weights_of_one 
    {
        /*!
            WHAT THIS OBJECT REPRESENTS
                This is a simple function object that takes a single argument
                and always returns 1 

            THREAD SAFETY
                This object has no mutable members.  Therefore, it is safe to call
                operator() on a single instance of this object simultaneously from multiple
                threads.
        !*/

        template <typename edge_type>
        double operator() (
            const edge_type&
        ) const;
        /*!
            ensures
                - returns 1
        !*/
    };

// ----------------------------------------------------------------------------------------

    struct use_gaussian_weights 
    {
        /*!
            WHAT THIS OBJECT REPRESENTS
                This is a simple function object that takes a single argument
                which should be an object similar to dlib::sample_pair.  

            THREAD SAFETY
                This object has no mutable members.  Therefore, it is safe to call
                operator() on a single instance of this object simultaneously from multiple
                threads.
        !*/

        use_gaussian_weights (
        );
        /*!
            ensures
                - #gamma == 0.1
        !*/

        use_gaussian_weights (
            double g
        );
        /*!
            ensures
                - #gamma == g
        !*/

        double gamma;

        template <typename edge_type>
        double operator() (
            const edge_type& e
        ) const;
        /*!
            requires
                - e.distance() must be a valid expression that returns a number
                  (e.g. edge_type might be dlib::sample_pair)
            ensures
                - returns std::exp(-gamma*e.distance());
        !*/
    };

// ----------------------------------------------------------------------------------------

}

#endif // DLIB_MR_FUNCTION_ObJECTS_ABSTRACT_Hh_



