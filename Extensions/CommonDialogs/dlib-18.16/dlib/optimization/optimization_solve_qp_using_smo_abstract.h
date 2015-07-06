// Copyright (C) 2010  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#undef DLIB_OPTIMIZATION_SOLVE_QP_UsING_SMO_ABSTRACT_Hh_
#ifdef DLIB_OPTIMIZATION_SOLVE_QP_UsING_SMO_ABSTRACT_Hh_

#include "../matrix.h"

namespace dlib
{

// ----------------------------------------------------------------------------------------

    template <
        typename EXP1,
        typename EXP2,
        typename T, long NR, long NC, typename MM, typename L
        >
    unsigned long solve_qp_using_smo ( 
        const matrix_exp<EXP1>& Q,
        const matrix_exp<EXP2>& b,
        matrix<T,NR,NC,MM,L>& alpha,
        T eps,
        unsigned long max_iter
    );
    /*!
        requires
            - Q.nr() == Q.nc()
            - is_col_vector(b) == true
            - is_col_vector(alpha) == true
            - b.size() == alpha.size() == Q.nr()
            - alpha.size() > 0
            - min(alpha) >= 0
            - eps > 0
            - max_iter > 0
        ensures
            - Let C == sum(alpha) (i.e. C is the sum of the alpha values you 
              supply to this function)
            - This function solves the following quadratic program:
                Minimize: f(alpha) == 0.5*trans(alpha)*Q*alpha - trans(alpha)*b
                subject to the following constraints:
                    - sum(alpha) == C (i.e. the sum of alpha values doesn't change)
                    - min(alpha) >= 0 (i.e. all alpha values are nonnegative)
                Where f is convex.  This means that Q should be positive-semidefinite.
            - The solution to the above QP will be stored in #alpha.
            - This function uses a simple implementation of the sequential minimal
              optimization algorithm.  It starts the algorithm with the given alpha
              and it works on the problem until the duality gap (i.e. how far away
              we are from the optimum solution) is less than eps.  So eps controls 
              how accurate the solution is and smaller values result in better solutions.
            - At most max_iter iterations of optimization will be performed.  
            - returns the number of iterations performed.  If this method fails to
              converge to eps accuracy then the number returned will be max_iter+1.
    !*/

// ----------------------------------------------------------------------------------------

    template <
        typename EXP1,
        typename EXP2,
        typename EXP3,
        typename T, long NR, long NC, typename MM, typename L
        >
    unsigned long solve_qp4_using_smo ( 
        const matrix_exp<EXP1>& A,
        const matrix_exp<EXP2>& Q,
        const matrix_exp<EXP3>& b,
        matrix<T,NR,NC,MM,L>& alpha,
        T eps,
        unsigned long max_iter
    );
    /*!
        requires
            - A.nc() == alpha.size()
            - Q.nr() == Q.nc()
            - is_col_vector(b) == true
            - is_col_vector(alpha) == true
            - b.size() == alpha.size() == Q.nr()
            - alpha.size() > 0
            - min(alpha) >= 0
            - eps > 0
            - max_iter > 0
        ensures
            - Let C == sum(alpha) (i.e. C is the sum of the alpha values you 
              supply to this function)
            - This function solves the following quadratic program:
                Minimize: f(alpha,lambda) == 0.5*trans(alpha)*Q*alpha - trans(alpha)*b + 
                                             0.5*trans(lambda)*lambda - trans(lambda)*A*alpha
                subject to the following constraints:
                    - sum(alpha)  == C (i.e. the sum of alpha values doesn't change)
                    - min(alpha)  >= 0 (i.e. all alpha values are nonnegative)
                    - min(lambda) >= 0 (i.e. all lambda values are nonnegative)
                Where f is convex.  This means that Q should be positive-semidefinite.
            - The solution to the above QP will be stored in #alpha.  The optimal
              lambda is not output since its value is given by the following expression:
                lowerbound(A*alpha,0)
            - This function uses a simple implementation of the sequential minimal
              optimization algorithm.  It starts the algorithm with the given alpha
              and it works on the problem until the duality gap (i.e. how far away
              we are from the optimum solution) is less than eps.  So eps controls 
              how accurate the solution is and smaller values result in better solutions.
            - At most max_iter iterations of optimization will be performed.  
            - returns the number of iterations performed.  If this method fails to
              converge to eps accuracy then the number returned will be max_iter+1.
    !*/

// ----------------------------------------------------------------------------------------

}

#endif // DLIB_OPTIMIZATION_SOLVE_QP_UsING_SMO_ABSTRACT_Hh_


