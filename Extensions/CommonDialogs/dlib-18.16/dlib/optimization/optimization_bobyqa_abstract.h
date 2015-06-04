// Copyright (C) 2009  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#undef DLIB_OPTIMIZATIOn_BOBYQA_ABSTRACT_Hh_
#ifdef DLIB_OPTIMIZATIOn_BOBYQA_ABSTRACT_Hh_

#include "../matrix.h"

// ----------------------------------------------------------------------------------------

/*
    This file defines the dlib interface to the BOBYQA software developed by M.J.D Powell.
    BOBYQA is a method for optimizing a function in the absence of derivative information.  
    Powell described it as a method that seeks the least value of a function of many 
    variables, by applying a trust region method that forms quadratic models by 
    interpolation.  There is usually some freedom in the interpolation conditions, 
    which is taken up by minimizing the Frobenius norm of the change to the second 
    derivative of the model, beginning with the zero matrix. The values of the variables 
    are constrained by upper and lower bounds.  


    The following paper, published in 2009 by Powell, describes the
    detailed working of the BOBYQA algorithm.  

        The BOBYQA algorithm for bound constrained optimization 
        without derivatives by M.J.D. Powell
*/

// ----------------------------------------------------------------------------------------

namespace dlib
{
    class bobyqa_failure : public error;
    /*!
        This is the exception class used by the functions defined in this file.
    !*/

// ----------------------------------------------------------------------------------------

    template <
        typename funct,
        typename T, 
        typename U
        >
    double find_min_bobyqa (
        const funct& f,
        T& x,
        long npt,
        const U& x_lower,
        const U& x_upper,
        const double rho_begin,
        const double rho_end,
        const long max_f_evals
    );
    /*!
        requires
            - f(x) must be a valid expression that evaluates to a double
            - is_col_vector(x) == true
            - is_col_vector(x_lower) == true
            - is_col_vector(x_upper) == true
            - x.size() == x_lower.size() == x_upper.size()
            - x.size() > 1
            - x.size() + 2 <= npt <= (x.size()+1)*(x.size()+2)/2
            - 0 < rho_end < rho_begin
            - min(x_upper - x_lower) > 2*rho_begin
              (i.e. the lower and upper bounds on each x element must be larger than 2*rho_begin)
            - min(x - x_lower) >= 0 && min(x_upper - x) >= 0
              (i.e. the given x should be within the bounds defined by x_lower and x_upper)
            - max_f_evals > 1
        ensures
            - Performs a constrained minimization of the function f() starting from 
              the initial point x.  
            - The BOBYQA algorithm uses a number of interpolating points to perform its
              work.  The npt argument controls how many points get used.  Typically,
              a good value to use is 2*x.size()+1.
            - #x == the value of x (within the bounds defined by x_lower and x_upper) that 
              was found to minimize f().  More precisely:
                - min(#x - x_lower) >= 0 && min(x_upper - #x) >= 0
            - returns f(#x). 
            - rho_begin and rho_end are used as the initial and final values of a trust 
              region radius.  Typically, rho_begin should be about one tenth of the greatest 
              expected change to a variable, while rho_end should indicate the accuracy that 
              is required in the final values of the variables. 
        throws
            - bobyqa_failure
                This exception is thrown if the algorithm is unable to make progress towards
                solving the problem.  This may occur because the algorithm detects excessive
                numerical errors or because max_f_evals of f() have occurred without reaching
                convergence.
    !*/

// ----------------------------------------------------------------------------------------

    template <
        typename funct,
        typename T, 
        typename U
        >
    double find_max_bobyqa (
        const funct& f,
        T& x,
        long npt,
        const U& x_lower,
        const U& x_upper,
        const double rho_begin,
        const double rho_end,
        const long max_f_evals
    );
    /*!
        This function is identical to the find_min_bobyqa() routine defined above
        except that it negates the f() function before performing optimization.  
        Thus this function will attempt to find the maximizer of f() rather than 
        the minimizer.
    !*/

// ----------------------------------------------------------------------------------------

}

#endif // DLIB_OPTIMIZATIOn_BOBYQA_ABSTRACT_Hh_

