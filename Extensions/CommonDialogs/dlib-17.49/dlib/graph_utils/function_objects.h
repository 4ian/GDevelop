// Copyright (C) 2010  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#ifndef DLIB_MR_FUNCTION_ObJECTS_H__
#define DLIB_MR_FUNCTION_ObJECTS_H__

#include "function_objects_abstract.h"
#include "../matrix.h"
#include <cmath>
#include <limits>

namespace dlib
{

// ----------------------------------------------------------------------------------------

    struct squared_euclidean_distance
    {
        squared_euclidean_distance (
        ) : 
            lower(0),
            upper(std::numeric_limits<double>::infinity())
        {}

        squared_euclidean_distance (
            const double l,
            const double u
        ) :
            lower(l),
            upper(u)
        {}

        const double lower;
        const double upper;

        template <typename sample_type>
        double operator() (
            const sample_type& a,
            const sample_type& b
        ) const
        { 
            const double len = length_squared(a-b);
            if (lower <= len && len <= upper)
                return len;
            else
                return std::numeric_limits<double>::infinity();
        }
    };

// ----------------------------------------------------------------------------------------

    struct use_weights_of_one 
    {
        template <typename edge_type>
        double operator() (
            const edge_type&
        ) const
        { 
            return 1;
        }
    };

// ----------------------------------------------------------------------------------------

    struct use_gaussian_weights 
    {
        use_gaussian_weights (
        ) 
        {
            gamma = 0.1;
        }

        use_gaussian_weights (
            double g
        )
        {
            gamma = g;
        }

        double gamma;

        template <typename edge_type>
        double operator() (
            const edge_type& e
        ) const
        { 
            return std::exp(-gamma*e.distance());
        }
    };

// ----------------------------------------------------------------------------------------

}

#endif // DLIB_MR_FUNCTION_ObJECTS_H__


