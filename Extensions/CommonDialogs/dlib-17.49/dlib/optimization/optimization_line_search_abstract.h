// Copyright (C) 2008  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#undef DLIB_OPTIMIZATIOn_ABSTRACT_
#ifdef DLIB_OPTIMIZATIOn_ABSTRACT_

#include <cmath>
#include <limits>
#include "../matrix/matrix_abstract.h"
#include "../algs.h"


namespace dlib
{

// ----------------------------------------------------------------------------------------

    template <
        typename funct, 
        typename T
        >
    class line_search_funct; 
    /*!
        This object is a function object that represents a line search function.

        Moreover, it represents a function with the signature:
            double l(double x)
    !*/

    template <
        typename funct, 
        typename T
        >
    const line_search_funct<funct,T> make_line_search_function (
        const funct& f, 
        const T& start, 
        const T& direction
    ); 
    /*!
        requires
            - is_col_vector(start) && is_col_vector(direction) && start.size() == direction.size() 
              (i.e. start and direction should be column vectors of the same size)
            - f must return either a double or a column vector the same length as start
            - f(start + 1.5*direction) should be a valid expression
        ensures
            - if (f returns a double) then
                - returns a line search function that computes l(x) == f(start + x*direction)
            - else
                - returns a line search function that computes l(x) == dot(f(start + x*direction),direction).
                  That is, we assume f is the derivative of some other function and that what
                  f returns is a gradient vector. 
                  So the following two expressions both create the derivative of l(x): 
                    - derivative(make_line_search_function(funct,start,direction))
                    - make_line_search_function(derivative(funct),start,direction)
    !*/

    template <
        typename funct, 
        typename T
        >
    const line_search_funct<funct,T> make_line_search_function (
        const funct& f, 
        const T& start, 
        const T& direction,
        double& f_out
    ); 
    /*!
        This function is identical to the above three argument version of make_line_search_function() 
        except that, if f() outputs a double, every time f() is evaluated its output is also stored 
        into f_out.
    !*/

    template <
        typename funct, 
        typename T
        >
    const line_search_funct<funct,T> make_line_search_function (
        const funct& f, 
        const T& start, 
        const T& direction,
        T& gradient_out
    ); 
    /*!
        This function is identical to the above three argument version of make_line_search_function() 
        except that, if f() outputs a column vector, every time f() is evaluated its output is also 
        stored into gradient_out.
    !*/

// ----------------------------------------------------------------------------------------

    inline double poly_min_extrap (
        double f0,
        double d0,
        double f1,
        double d1
    );
    /*!
        ensures
            - let c(x) be a 3rd degree polynomial such that:
                - c(0) == f0
                - c(1) == f1
                - derivative of c(x) at x==0 is d0
                - derivative of c(x) at x==1 is d1
            - returns the point in the range [0,1] that minimizes the polynomial c(x) 
    !*/

// ----------------------------------------------------------------------------------------

    inline double lagrange_poly_min_extrap (
        double p1, 
        double p2,
        double p3,
        double f1,
        double f2,
        double f3
    );
    /*!
        requires
            - f1 >= f2 <= f3
            - p1 < p2 < p3
        ensures
            - let c(x) be the second order Lagrange polynomial that interpolates the
              points p1, p2, and p3 where c(p1)==f1, c(p2)==f2, and c(p3)==f3
            - this function returns the point in the range [p1,p3] that minimizes 
              the polynomial c(x) 
    !*/

// ----------------------------------------------------------------------------------------

    template <
        typename funct, 
        typename funct_der
        >
    double line_search (
        const funct& f, 
        const double f0,
        const funct_der& der, 
        const double d0,
        double rho, 
        double sigma, 
        double min_f,
        unsigned long max_iter
    )
    /*!
        requires
            - 0 < rho < sigma < 1
            - f and der are scalar functions of scalars
              (e.g. line_search_funct objects)
            - der is the derivative of f
            - f0 == f(0)
            - d0 == der(0)
            - max_iter > 0
        ensures
            - Performs a line search and uses the strong Wolfe conditions to decide when
              the search can stop.  
                - rho == the parameter of the Wolfe sufficient decrease condition
                - sigma == the parameter of the Wolfe curvature condition
                - max_iter == the maximum number of iterations allowable.  After this
                  many evaluations of f() line_search() is guaranteed to terminate.
            - returns a value alpha such that f(alpha) is significantly closer to 
              the minimum of f than f(0).
            - It is assumed that the minimum possible value of f(x) is min_f.  So if
              an alpha is found such that f(alpha) <= min_f then the search stops
              immediately.
            - This function is also optimized for the case where der(0) is negative.  I.e.
              positive values of the argument to f() should be in a descent direction.  
            - When this function makes calls to f() and der() it always does so by
              first calling f() and then calling der().  That is, these two functions
              are always called in pairs with f() being called first and then der()
              being called second.
    !*/

    /*
        A good discussion of the Wolfe conditions and line search algorithms in 
        general can be found in the book Practical Methods of Optimization by R. Fletcher
        and also in the more recent book Numerical Optimization by Nocedal and Wright.
    */

// ----------------------------------------------------------------------------------------

    class optimize_single_variable_failure : public error;
    /*!
        This is the exception class used by the functions defined below.
    !*/

// ----------------------------------------------------------------------------------------

    template <
        typename funct
        >
    double find_min_single_variable (
        const funct& f,
        double& starting_point,
        const double begin = -1e200,
        const double end = 1e200,
        const double eps = 1e-3,
        const long max_iter = 100
    )
    /*!
        requires
            - eps > 0
            - max_iter > 1
            - begin <= starting_point <= end
            - f must be a function of a double that returns a double
              (e.g. f(starting_point) should be a valid expression that evaluates to a double)
        ensures
            - Finds a point P such that:
                - P is a local minimum of the function f().   
                - begin <= P <= end
            - Evaluates f() no more than max_iter times
            - Stops searching when the window around the minimum point is smaller than eps.
              The search will begin with the given starting_point.
            - #starting_point == P
            - returns f(P)
        throws
            - optimize_single_variable_failure 
                This exception is thrown if max_iter iterations are performed without 
                determining the min point to the requested accuracy of eps.
    !*/

// ----------------------------------------------------------------------------------------

    template <
        typename funct
        >
    double find_max_single_variable (
        const funct& f,
        double& starting_point,
        const double begin = -1e200,
        const double end = 1e200,
        const double eps = 1e-3,
        const long max_iter = 100
    )
    /*!
        requires
            - eps > 0
            - max_iter > 1
            - begin <= starting_point <= end
            - f must be a function of a double that returns a double
              (e.g. f(starting_point) should be a valid expression that evaluates to a double)
        ensures
            - Finds a point P such that:
                - P is a local maximum of the function f().   
                - begin <= P <= end
            - Evaluates f() no more than max_iter times
            - Stops searching when the window around the minimum point is smaller than eps.
              The search will begin with the given starting_point.
            - #starting_point == P
            - returns f(P)
        throws
            - optimize_single_variable_failure 
                This exception is thrown if max_iter iterations are performed without 
                determining the max point to the requested accuracy of eps.
    !*/

// ----------------------------------------------------------------------------------------

}

#endif // DLIB_OPTIMIZATIOn_ABSTRACT_

