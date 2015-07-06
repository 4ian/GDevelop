// Copyright (C) 2008  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#undef DLIB_OPTIMIZATIOn_ABSTRACT_
#ifdef DLIB_OPTIMIZATIOn_ABSTRACT_

#include <cmath>
#include <limits>
#include "../matrix/matrix_abstract.h"
#include "../algs.h"
#include "optimization_search_strategies_abstract.h"
#include "optimization_stop_strategies_abstract.h"
#include "optimization_line_search_abstract.h"


namespace dlib
{

// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------
//                    Functions that transform other functions  
// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------

    template <
        typename funct
        >
    class central_differences;
    /*!
        This is a function object that represents the derivative of some other
        function. 

        Note that if funct is a function of a double then the derivative of 
        funct is just a double but if funct is a function of a dlib::matrix (i.e. a
        function of many variables) then its derivative is a gradient vector (a column
        vector in particular).
    !*/

    template <
        typename funct
        >
    const central_differences<funct> derivative(
        const funct& f, 
        double eps
    );
    /*!
        requires
            - f == a function that returns a scalar
            - f must have one of the following forms:
                - double f(double)
                - double f(dlib::matrix)  (where the matrix is a column vector)
                - double f(T, dlib::matrix)  (where the matrix is a column vector.  In 
                  this case the derivative of f is taken with respect to the second argument.)
            - eps > 0
        ensures
            - returns a function that represents the derivative of the function f.  It
              is approximated numerically by:
                  (f(x+eps)-f(x-eps))/(2*eps)
    !*/

    template <
        typename funct
        >
    const central_differences<funct> derivative(
        const funct& f
    );
    /*!
        ensures
            - returns derivative(f, 1e-7)
    !*/

// ----------------------------------------------------------------------------------------

    template <
        typename funct, 
        typename EXP1, 
        typename EXP2
        >
    clamped_function_object<funct,EXP1,EXP2> clamp_function (
        const funct& f,
        const matrix_exp<EXP1>& x_lower,
        const matrix_exp<EXP2>& x_upper 
    );
    /*!
        requires
            - f == a function that takes a matrix and returns a scalar value.  Moreover, f
              must be capable of taking in matrices with the same dimensions as x_lower and
              x_upper.  So f(x_lower) must be a valid expression that evaluates to a scalar
              value.
            - x_lower.nr() == x_upper.nr() && x_lower.nc() == x_upper.nc()
              (i.e. x_lower and x_upper must have the same dimensions)
            - x_lower and x_upper must contain the same type of elements.
        ensures
            - returns a function object that represents the function g(x) where
              g(x) == f(clamp(x,x_lower,x_upper))
    !*/

// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------
//                    Functions that perform unconstrained optimization 
// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------

    template <
        typename search_strategy_type,
        typename stop_strategy_type,
        typename funct, 
        typename funct_der, 
        typename T
        >
    double find_min (
        search_strategy_type search_strategy,
        stop_strategy_type stop_strategy,
        const funct& f, 
        const funct_der& der, 
        T& x, 
        double min_f
    );
    /*!
        requires
            - search_strategy == an object that defines a search strategy such as one 
              of the objects from dlib/optimization/optimization_search_strategies_abstract.h
            - stop_strategy == an object that defines a stop strategy such as one of 
              the objects from dlib/optimization/optimization_stop_strategies_abstract.h
            - f(x) must be a valid expression that evaluates to a double
            - der(x) must be a valid expression that evaluates to the derivative of f() at x.
            - is_col_vector(x) == true
        ensures
            - Performs an unconstrained minimization of the function f() using the given
              search_strategy and starting from the initial point x.  
            - The function is optimized until stop_strategy decides that an acceptable 
              point has been found or f(#x) < min_f.
            - #x == the value of x that was found to minimize f()
            - returns f(#x). 
            - When this function makes calls to f() and der() it always does so by
              first calling f() and then calling der().  That is, these two functions
              are always called in pairs with f() being called first and then der()
              being called second.
    !*/

// ----------------------------------------------------------------------------------------

    template <
        typename search_strategy_type,
        typename stop_strategy_type,
        typename funct, 
        typename funct_der, 
        typename T
        >
    double find_max (
        search_strategy_type search_strategy,
        stop_strategy_type stop_strategy,
        const funct& f, 
        const funct_der& der, 
        T& x, 
        double max_f
    );
    /*!
        requires
            - search_strategy == an object that defines a search strategy such as one 
              of the objects from dlib/optimization/optimization_search_strategies_abstract.h
            - stop_strategy == an object that defines a stop strategy such as one of 
              the objects from dlib/optimization/optimization_stop_strategies_abstract.h
            - f(x) must be a valid expression that evaluates to a double
            - der(x) must be a valid expression that evaluates to the derivative of f() at x.
            - is_col_vector(x) == true
        ensures
            - Performs an unconstrained maximization of the function f() using the given
              search_strategy and starting from the initial point x.  
            - The function is optimized until stop_strategy decides that an acceptable 
              point has been found or f(#x) > max_f.
            - #x == the value of x that was found to maximize f()
            - returns f(#x). 
            - When this function makes calls to f() and der() it always does so by
              first calling f() and then calling der().  That is, these two functions
              are always called in pairs with f() being called first and then der()
              being called second.
            - Note that this function solves the maximization problem by converting it 
              into a minimization problem.  Therefore, the values of f and its derivative
              reported to the stopping strategy will be negated.  That is, stop_strategy
              will see -f() and -der().  All this really means is that the status messages
              from a stopping strategy in verbose mode will display a negated objective
              value.
    !*/

// ----------------------------------------------------------------------------------------

    template <
        typename search_strategy_type,
        typename stop_strategy_type,
        typename funct,
        typename T
        >
    double find_min_using_approximate_derivatives (
        search_strategy_type search_strategy,
        stop_strategy_type stop_strategy,
        const funct& f,
        T& x,
        double min_f,
        double derivative_eps = 1e-7
    );
    /*!
        requires
            - search_strategy == an object that defines a search strategy such as one 
              of the objects from dlib/optimization/optimization_search_strategies_abstract.h
            - stop_strategy == an object that defines a stop strategy such as one of 
              the objects from dlib/optimization/optimization_stop_strategies_abstract.h
            - f(x) must be a valid expression that evaluates to a double
            - is_col_vector(x) == true
            - derivative_eps > 0 
        ensures
            - Performs an unconstrained minimization of the function f() using the given
              search_strategy and starting from the initial point x.  
            - The function is optimized until stop_strategy decides that an acceptable 
              point has been found or f(#x) < min_f.
            - #x == the value of x that was found to minimize f()
            - returns f(#x). 
            - Uses the dlib::derivative(f,derivative_eps) function to compute gradient
              information.
    !*/

// ----------------------------------------------------------------------------------------

    template <
        typename search_strategy_type,
        typename stop_strategy_type,
        typename funct,
        typename T
        >
    double find_max_using_approximate_derivatives (
        search_strategy_type search_strategy,
        stop_strategy_type stop_strategy,
        const funct& f,
        T& x,
        double max_f,
        double derivative_eps = 1e-7
    );
    /*!
        requires
            - search_strategy == an object that defines a search strategy such as one 
              of the objects from dlib/optimization/optimization_search_strategies_abstract.h
            - stop_strategy == an object that defines a stop strategy such as one of 
              the objects from dlib/optimization/optimization_stop_strategies_abstract.h
            - f(x) must be a valid expression that evaluates to a double
            - is_col_vector(x) == true
            - derivative_eps > 0 
        ensures
            - Performs an unconstrained maximization of the function f() using the given
              search_strategy and starting from the initial point x.  
            - The function is optimized until stop_strategy decides that an acceptable 
              point has been found or f(#x) > max_f.
            - #x == the value of x that was found to maximize f()
            - returns f(#x). 
            - Uses the dlib::derivative(f,derivative_eps) function to compute gradient
              information.
            - Note that this function solves the maximization problem by converting it 
              into a minimization problem.  Therefore, the values of f and its derivative
              reported to the stopping strategy will be negated.  That is, stop_strategy
              will see -f() and -der().  All this really means is that the status messages
              from a stopping strategy in verbose mode will display a negated objective
              value.
    !*/

// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------
//                  Functions that perform box constrained optimization 
// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------

    template <
        typename search_strategy_type,
        typename stop_strategy_type,
        typename funct, 
        typename funct_der, 
        typename T,
        typename EXP1,
        typename EXP2
        >
    double find_min_box_constrained (
        search_strategy_type search_strategy,
        stop_strategy_type stop_strategy,
        const funct& f, 
        const funct_der& der, 
        T& x,
        const matrix_exp<EXP1>& x_lower,
        const matrix_exp<EXP2>& x_upper
    );
    /*!
        requires
            - search_strategy == an object that defines a search strategy such as one 
              of the objects from dlib/optimization/optimization_search_strategies_abstract.h
            - stop_strategy == an object that defines a stop strategy such as one of 
              the objects from dlib/optimization/optimization_stop_strategies_abstract.h
            - f(x) must be a valid expression that evaluates to a double
            - der(x) must be a valid expression that evaluates to the derivative of f() at x.
            - is_col_vector(x) == true
            - is_col_vector(x_lower) == true
            - is_col_vector(x_upper) == true
            - x.size() == x_lower.size() == x_upper.size()
              (i.e. x, x_lower, and x_upper need to all be column vectors of the same dimensionality)
            - min(x_upper-x_lower) > 0
              (i.e. x_upper must contain upper bounds relative to x_lower)
        ensures
            - Performs a box constrained minimization of the function f() using the given
              search_strategy and starting from the initial point x.  That is, we try to
              find the x value that minimizes f(x) but is also within the box constraints 
              specified by x_lower and x_upper.  That is, we ensure that #x satisfies: 
                - min(#x - x_lower) >= 0 && min(x_upper - #x) >= 0
            - This function uses a backtracking line search along with a gradient projection
              step to handle the box constraints.
            - The function is optimized until stop_strategy decides that an acceptable
              point has been found. 
            - #x == the value of x that was found to minimize f() within the given box
              constraints.
            - returns f(#x). 
            - The last call to f() will be made with f(#x).  
            - When calling f() and der(), the input passed to them will always be inside
              the box constraints defined by x_lower and x_upper.
            - When calling der(x), it will always be the case that the last call to f() was
              made with the same x value.  This means that you can reuse any intermediate
              results from the previous call to f(x) inside der(x) rather than recomputing
              them inside der(x).
    !*/

// ----------------------------------------------------------------------------------------

    template <
        typename search_strategy_type,
        typename stop_strategy_type,
        typename funct, 
        typename funct_der, 
        typename T
        >
    double find_min_box_constrained (
        search_strategy_type search_strategy,
        stop_strategy_type stop_strategy,
        const funct& f, 
        const funct_der& der, 
        T& x,
        const double x_lower,
        const double x_upper
    );
    /*!
        requires
            - search_strategy == an object that defines a search strategy such as one 
              of the objects from dlib/optimization/optimization_search_strategies_abstract.h
            - stop_strategy == an object that defines a stop strategy such as one of 
              the objects from dlib/optimization/optimization_stop_strategies_abstract.h
            - f(x) must be a valid expression that evaluates to a double
            - der(x) must be a valid expression that evaluates to the derivative of f() at x.
            - is_col_vector(x) == true
            - x_lower < x_upper
        ensures
            - This function is identical to find_min_box_constrained() as defined above
              except that it takes x_lower and x_upper as doubles rather than column
              vectors.  In this case, all variables have the same lower bound of x_lower
              and similarly have the same upper bound of x_upper.  Therefore, this is just
              a convenience function for calling find_max_box_constrained() when all
              variables have the same bound constraints.
    !*/

// ----------------------------------------------------------------------------------------

    template <
        typename search_strategy_type,
        typename stop_strategy_type,
        typename funct, 
        typename funct_der, 
        typename T,
        typename EXP1,
        typename EXP2
        >
    double find_max_box_constrained (
        search_strategy_type search_strategy,
        stop_strategy_type stop_strategy,
        const funct& f, 
        const funct_der& der, 
        T& x,
        const matrix_exp<EXP1>& x_lower,
        const matrix_exp<EXP2>& x_upper
    );
    /*!
        requires
            - search_strategy == an object that defines a search strategy such as one 
              of the objects from dlib/optimization/optimization_search_strategies_abstract.h
            - stop_strategy == an object that defines a stop strategy such as one of 
              the objects from dlib/optimization/optimization_stop_strategies_abstract.h
            - f(x) must be a valid expression that evaluates to a double
            - der(x) must be a valid expression that evaluates to the derivative of f() at x.
            - is_col_vector(x) == true
            - is_col_vector(x_lower) == true
            - is_col_vector(x_upper) == true
            - x.size() == x_lower.size() == x_upper.size()
              (i.e. x, x_lower, and x_upper need to all be column vectors of the same dimensionality)
            - min(x_upper-x_lower) > 0
              (i.e. x_upper must contain upper bounds relative to x_lower)
        ensures
            - Performs a box constrained maximization of the function f() using the given
              search_strategy and starting from the initial point x.  That is, we try to
              find the x value that maximizes f(x) but is also within the box constraints 
              specified by x_lower and x_upper.  That is, we ensure that #x satisfies: 
                - min(#x - x_lower) >= 0 && min(x_upper - #x) >= 0
            - This function uses a backtracking line search along with a gradient projection
              step to handle the box constraints.
            - The function is optimized until stop_strategy decides that an acceptable
              point has been found. 
            - #x == the value of x that was found to maximize f() within the given box
              constraints.
            - returns f(#x). 
            - The last call to f() will be made with f(#x).  
            - When calling f() and der(), the input passed to them will always be inside
              the box constraints defined by x_lower and x_upper.
            - When calling der(x), it will always be the case that the last call to f() was
              made with the same x value.  This means that you can reuse any intermediate
              results from the previous call to f(x) inside der(x) rather than recomputing
              them inside der(x).
            - Note that this function solves the maximization problem by converting it 
              into a minimization problem.  Therefore, the values of f and its derivative
              reported to the stopping strategy will be negated.  That is, stop_strategy
              will see -f() and -der().  All this really means is that the status messages
              from a stopping strategy in verbose mode will display a negated objective
              value.
    !*/

// ----------------------------------------------------------------------------------------
    
    template <
        typename search_strategy_type,
        typename stop_strategy_type,
        typename funct, 
        typename funct_der, 
        typename T
        >
    double find_max_box_constrained (
        search_strategy_type search_strategy,
        stop_strategy_type stop_strategy,
        const funct& f, 
        const funct_der& der, 
        T& x,
        const double x_lower,
        const double x_upper
    );
    /*!
        requires
            - search_strategy == an object that defines a search strategy such as one 
              of the objects from dlib/optimization/optimization_search_strategies_abstract.h
            - stop_strategy == an object that defines a stop strategy such as one of 
              the objects from dlib/optimization/optimization_stop_strategies_abstract.h
            - f(x) must be a valid expression that evaluates to a double
            - der(x) must be a valid expression that evaluates to the derivative of f() at x.
            - is_col_vector(x) == true
            - x_lower < x_upper
        ensures
            - This function is identical to find_max_box_constrained() as defined above
              except that it takes x_lower and x_upper as doubles rather than column
              vectors.  In this case, all variables have the same lower bound of x_lower
              and similarly have the same upper bound of x_upper.  Therefore, this is just
              a convenience function for calling find_max_box_constrained() when all
              variables have the same bound constraints.
    !*/

// ----------------------------------------------------------------------------------------

}

#endif // DLIB_OPTIMIZATIOn_ABSTRACT_



