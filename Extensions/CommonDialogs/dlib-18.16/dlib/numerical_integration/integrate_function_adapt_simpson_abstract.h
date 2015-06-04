// Copyright (C) 2013 Steve Taylor (steve98654@gmail.com)
// License: Boost Software License  See LICENSE.txt for the full license.
#undef DLIB_INTEGRATE_FUNCTION_ADAPT_SIMPSON_ABSTRACTh_
#ifdef DLIB_INTEGRATE_FUNCTION_ADAPT_SIMPSON_ABSTRACTh_

namespace dlib
{

    template <typename T, typename funct>
    T integrate_function_adapt_simp(
        const funct& f, 
        T a, 
        T b, 
        T tol = 1e-10
    );
    /*!
        requires 
            - b > a
            - tol > 0
            - T should be either float, double, or long double
            - The expression f(a) should be a valid expression that evaluates to a T.
              I.e. f() should be a real valued function of a single variable.
        ensures
            - returns an approximation of the integral of f over the domain [a,b] using the
              adaptive Simpson method outlined in Gander, W. and W. Gautshi, "Adaptive
              Quadrature -- Revisited" BIT, Vol. 40, (2000), pp.84-101
            - tol is a tolerance parameter that determines the overall accuracy of
              approximated integral.  We suggest a default value of 1e-10 for tol. 
    !*/

}

#endif // DLIB_INTEGRATE_FUNCTION_ADAPT_SIMPSON_ABSTRACTh_

