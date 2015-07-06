// Copyright (C) 2010  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#undef DLIB_OPTIMIZATIOn_LEAST_SQUARES_ABSTRACT_
#ifdef DLIB_OPTIMIZATIOn_LEAST_SQUARES_ABSTRACT_

#include "../matrix/matrix_abstract.h"
#include "optimization_trust_region_abstract.h"

namespace dlib
{

// ----------------------------------------------------------------------------------------

    template <
        typename stop_strategy_type,
        typename funct_type,
        typename funct_der_type,
        typename vector_type,
        typename T
        >
    double solve_least_squares (
        stop_strategy_type stop_strategy,
        const funct_type& f,
        const funct_der_type& der,
        const vector_type& list,
        T& x, 
        double radius = 1
    );
    /*!
        requires
            - stop_strategy == an object that defines a stop strategy such as one of 
              the objects from dlib/optimization/optimization_stop_strategies_abstract.h
            - list == a matrix or something convertible to a matrix via mat()
              such as a std::vector.
            - is_vector(list) == true
            - list.size() > 0
            - is_col_vector(x) == true
            - radius > 0
            - for all valid i:
                - f(list(i),x) must be a valid expression that evaluates to a floating point value.
                - der(list(i),x) must be a valid expression that evaluates to the derivative of f(list(i),x) 
                  with respect to x. This derivative must take the form of a column vector.
        ensures
            - This function performs an unconstrained minimization of the least squares
              function g(x) defined by:
                - g(x) = sum over all i: 0.5*pow( f(list(i),x), 2 )
            - This method combines the Levenberg-Marquardt method with a quasi-newton method
              for approximating the second order terms of the hessian and is appropriate for
              large residual problems (i.e. problems where the f() function isn't driven to 0).  
              In particular, it uses the method of Dennis, Gay, and Welsch as described in 
              Numerical Optimization by Nocedal and Wright (second edition).
            - Since this is a trust region algorithm, the radius parameter defines the initial 
              size of the trust region.  
            - The function is optimized until stop_strategy decides that an acceptable 
              point has been found or the trust region subproblem fails to make progress.
            - #x == the value of x that was found to minimize g()
            - returns g(#x). 
    !*/

// ----------------------------------------------------------------------------------------

    template <
        typename stop_strategy_type,
        typename funct_type,
        typename funct_der_type,
        typename vector_type,
        typename T
        >
    double solve_least_squares_lm (
        stop_strategy_type stop_strategy,
        const funct_type& f,
        const funct_der_type& der,
        const vector_type& list,
        T& x, 
        double radius = 1
    );
    /*!
        requires
            - stop_strategy == an object that defines a stop strategy such as one of 
              the objects from dlib/optimization/optimization_stop_strategies_abstract.h
            - list == a matrix or something convertible to a matrix via mat()
              such as a std::vector.
            - is_vector(list) == true
            - list.size() > 0
            - is_col_vector(x) == true
            - radius > 0
            - for all valid i:
                - f(list(i),x) must be a valid expression that evaluates to a floating point value.
                - der(list(i),x) must be a valid expression that evaluates to the derivative of f(list(i),x) 
                  with respect to x.  This derivative must take the form of a column vector.
        ensures
            - This function performs an unconstrained minimization of the least squares
              function g(x) defined by:
                - g(x) = sum over all i: 0.5*pow( f(list(i),x), 2 )
            - This method implements a plain Levenberg-Marquardt approach for approximating
              the hessian of g().  Therefore, it is most appropriate for small residual problems
              (i.e. problems where f() goes to 0 at the solution).
            - Since this is a trust region algorithm, the radius parameter defines the initial 
              size of the trust region.  
            - The function is optimized until stop_strategy decides that an acceptable 
              point has been found or the trust region subproblem fails to make progress.
            - #x == the value of x that was found to minimize g()
            - returns g(#x). 
    !*/

// ----------------------------------------------------------------------------------------

}

#endif // DLIB_OPTIMIZATIOn_LEAST_SQUARES_ABSTRACT_


