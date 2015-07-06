// Copyright (C) 2010  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#undef DLIB_OPTIMIZATION_TRUST_REGIoN_H_ABSTRACTh_
#ifdef DLIB_OPTIMIZATION_TRUST_REGIoN_H_ABSTRACTh_

#include "../matrix/matrix_abstract.h"

namespace dlib
{

// ----------------------------------------------------------------------------------------

    template <
        typename EXP1,
        typename EXP2,
        typename T, long NR, long NC, typename MM, typename L
        >
    unsigned long solve_trust_region_subproblem ( 
        const matrix_exp<EXP1>& B,
        const matrix_exp<EXP2>& g,
        const typename EXP1::type radius,
        matrix<T,NR,NC,MM,L>& p,
        double eps,
        unsigned long max_iter
    );
    /*!
        requires
            - B == trans(B)
              (i.e. B should be a symmetric matrix)
            - B.nr() == B.nc()
            - is_col_vector(g) == true
            - g.size() == B.nr()
            - p is capable of containing a column vector the size of g
              (i.e. p = g; should be a legal expression)
            - radius > 0
            - eps > 0
            - max_iter > 0
        ensures
            - This function solves the following optimization problem:
                Minimize: f(p) == 0.5*trans(p)*B*p + trans(g)*p
                subject to the following constraint:
                    - length(p) <= radius
            - returns the number of iterations performed.  If this method fails to
              converge to eps accuracy then the number returned will be max_iter+1.
            - if this function returns 0 or 1 then we are not hitting the radius bound.
              Otherwise, the radius constraint is active and std::abs(length(#p)-radius) <= eps.
    !*/

// ----------------------------------------------------------------------------------------

    class function_model 
    {
        /*!
            WHAT THIS OBJECT REPRESENTS
                This object defines the interface for a function model
                used by the trust-region optimizers defined below.

                In particular, this object represents a function f() and
                its associated derivative and hessian.

        !*/

    public:

        // Define the type used to represent column vectors
        typedef matrix<double,0,1> column_vector;
        // Define the type used to represent the hessian matrix
        typedef matrix<double> general_matrix;

        double operator() ( 
            const column_vector& x
        ) const;
        /*!
            ensures
                - returns f(x)
                  (i.e. evaluates this model at the given point and returns the value)
        !*/

        void get_derivative_and_hessian (
            const column_vector& x,
            column_vector& d,
            general_matrix& h
        ) const;
        /*!
            ensures
                - #d == the derivative of f() at x
                - #h == the hessian matrix of f() at x
                - is_col_vector(#d) == true
                - #d.size() == x.size()
                - #h.nr() == #h.nc() == x.size()
                - #h == trans(#h)
        !*/
    };

// ----------------------------------------------------------------------------------------

    template <
        typename stop_strategy_type,
        typename funct_model
        >
    double find_min_trust_region (
        stop_strategy_type stop_strategy,
        const funct_model& model, 
        typename funct_model::column_vector& x, 
        double radius = 1
    );
    /*!
        requires
            - stop_strategy == an object that defines a stop strategy such as one of 
              the objects from dlib/optimization/optimization_stop_strategies_abstract.h
            - is_col_vector(x) == true
            - radius > 0
            - model must be an object with an interface as defined by the function_model
              example object shown above.
        ensures
            - Performs an unconstrained minimization of the function defined by model 
              starting from the initial point x.  This function uses a trust region
              algorithm to perform the minimization.  The radius parameter defines
              the initial size of the trust region.
            - The function is optimized until stop_strategy decides that an acceptable 
              point has been found or the trust region subproblem fails to make progress.
            - #x == the value of x that was found to minimize model()
            - returns model(#x). 
            - When this function makes calls to model.get_derivative_and_hessian() it always 
              does so by first calling model() and then calling model.get_derivative_and_hessian().  
              That is, any call to model.get_derivative_and_hessian(val) will always be 
              preceded by a call to model(val) with the same value.  This way you can reuse 
              any redundant computations performed by model() and model.get_derivative_and_hessian()
              as appropriate.
    !*/

// ----------------------------------------------------------------------------------------

    template <
        typename stop_strategy_type,
        typename funct_model
        >
    double find_max_trust_region (
        stop_strategy_type stop_strategy,
        const funct_model& model, 
        typename funct_model::column_vector& x, 
        double radius = 1
    );
    /*!
        requires
            - stop_strategy == an object that defines a stop strategy such as one of 
              the objects from dlib/optimization/optimization_stop_strategies_abstract.h
            - is_col_vector(x) == true
            - radius > 0
            - model must be an object with an interface as defined by the function_model
              example object shown above.
        ensures
            - Performs an unconstrained maximization of the function defined by model 
              starting from the initial point x.  This function uses a trust region
              algorithm to perform the maximization.  The radius parameter defines
              the initial size of the trust region.
            - The function is optimized until stop_strategy decides that an acceptable 
              point has been found or the trust region subproblem fails to make progress.
            - #x == the value of x that was found to maximize model()
            - returns model(#x). 
            - When this function makes calls to model.get_derivative_and_hessian() it always 
              does so by first calling model() and then calling model.get_derivative_and_hessian().  
              That is, any call to model.get_derivative_and_hessian(val) will always be 
              preceded by a call to model(val) with the same value.  This way you can reuse 
              any redundant computations performed by model() and model.get_derivative_and_hessian()
              as appropriate.
            - Note that this function solves the maximization problem by converting it 
              into a minimization problem.  Therefore, the values of model() and its derivative
              reported to the stopping strategy will be negated.  That is, stop_strategy
              will see -model() and -derivative.  All this really means is that the status 
              messages from a stopping strategy in verbose mode will display a negated objective
              value.
    !*/

// ----------------------------------------------------------------------------------------

}

#endif // DLIB_OPTIMIZATION_TRUST_REGIoN_H_ABSTRACTh_


