// Copyright (C) 2006  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#undef DLIB_MATRIx_MATH_FUNCTIONS_ABSTRACT_
#ifdef DLIB_MATRIx_MATH_FUNCTIONS_ABSTRACT_

#include "matrix_abstract.h"

namespace dlib
{

// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------
//                          Exponential Functions 
// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------

    const matrix_exp exp (
        const matrix_exp& m
    );
    /*!
        ensures
            - returns a matrix R such that:
                - R::type == the same type that was in m
                - R has the same dimensions as m
                - for all valid r and c:
                  R(r,c) == std::exp(m(r,c)) 
    !*/

// ----------------------------------------------------------------------------------------

    const matrix_exp log10 (
        const matrix_exp& m
    );
    /*!
        ensures
            - returns a matrix R such that:
                - R::type == the same type that was in m
                - R has the same dimensions as m
                - for all valid r and c:
                  R(r,c) == std::log10(m(r,c)) 
    !*/

// ----------------------------------------------------------------------------------------

    const matrix_exp log (
        const matrix_exp& m
    );
    /*!
        ensures
            - returns a matrix R such that:
                - R::type == the same type that was in m
                - R has the same dimensions as m
                - for all valid r and c:
                  R(r,c) == std::log(m(r,c)) 
    !*/

// ----------------------------------------------------------------------------------------

    const matrix_exp sqrt (
        const matrix_exp& m
    );
    /*!
        ensures
            - returns a matrix R such that:
                - R::type == the same type that was in m
                - R has the same dimensions as m
                - for all valid r and c:
                  R(r,c) == sqrt(m(r,c)) 
    !*/

// ----------------------------------------------------------------------------------------

    template <typename T>
    const matrix_exp pow (
        const matrix_exp& m,
        const T& e
    );
    /*!
        requires
            - matrix_exp::type == float, double, or long double 
        ensures
            - returns a matrix R such that:
                - R::type == the same type that was in m
                - R has the same dimensions as m
                - for all valid r and c:
                  R(r,c) == pow(m(r,c),e) 
    !*/

// ----------------------------------------------------------------------------------------

    template <typename T>
    const matrix_exp pow (
        const T& b,
        const matrix_exp& m
    );
    /*!
        requires
            - matrix_exp::type == float, double, or long double 
        ensures
            - returns a matrix R such that:
                - R::type == the same type that was in m
                - R has the same dimensions as m
                - for all valid r and c:
                  R(r,c) == pow(b, m(r,c)) 
    !*/

// ----------------------------------------------------------------------------------------

    const matrix_exp squared (
        const matrix_exp& m
    );
    /*!
        ensures
            - returns a matrix R such that:
                - R::type == the same type that was in m
                - R has the same dimensions as m
                - for all valid r and c:
                  R(r,c) == m(r,c)*m(r,c)
    !*/

// ----------------------------------------------------------------------------------------

    const matrix_exp cubed (
        const matrix_exp& m
    );
    /*!
        ensures
            - returns a matrix R such that:
                - R::type == the same type that was in m
                - R has the same dimensions as m
                - for all valid r and c:
                  R(r,c) == m(r,c)*m(r,c)*m(r,c)
    !*/

// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------
//                               Miscellaneous
// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------

    const matrix_exp sigmoid (
        const matrix_exp& m
    );
    /*!
        ensures
            - returns a matrix R such that:
                - R::type == the same type that was in m
                - R has the same dimensions as m
                - for all valid r and c:
                  R(r,c) == 1/(1 + exp(-m(r,c))) 
    !*/

// ----------------------------------------------------------------------------------------

    const matrix_exp abs (
        const matrix_exp& m
    );
    /*!
        ensures
            - returns a matrix R such that:
                - if (m contains std::complex<T> objects) then
                    - R::type == T 
                - else
                    - R::type == the same type that was in m
                - R has the same dimensions as m
                - for all valid r and c:
                  R(r,c) == std::abs(m(r,c)) 
                  (note that if m is complex then std::abs(val) performs sqrt(std::norm(val))
    !*/

// ----------------------------------------------------------------------------------------

    const matrix_exp reciprocal (
        const matrix_exp& m
    );
    /*!
        requires
            - matrix_exp::type == float, double, long double, std::complex<float>,
              std::complex<double>, or std::complex<long double>
        ensures
            - returns a matrix R such that:
                - R::type == the same type that was in m
                - R has the same dimensions as m
                - for all valid r and c:
                    - if (m(r,c) != 0) then
                        - R(r,c) == 1.0/m(r,c) 
                    - else
                        - R(r,c) == 0
    !*/

// ----------------------------------------------------------------------------------------

    const matrix_exp reciprocal_max (
        const matrix_exp& m
    );
    /*!
        requires
            - matrix_exp::type == float, double, long double
        ensures
            - returns a matrix R such that:
                - R::type == the same type that was in m
                - R has the same dimensions as m
                - for all valid r and c:
                    - if (m(r,c) != 0) then
                        - R(r,c) == 1.0/m(r,c) 
                    - else
                        - R(r,c) == std::numeric_limits<R::type>::max() 
    !*/

// ----------------------------------------------------------------------------------------

    const matrix_exp normalize (
        const matrix_exp& m
    );
    /*!
        requires
            - matrix_exp::type == float, double, or long double 
        ensures
            - if (sqrt(sum(squared(m))) != 0) then
                - returns m/sqrt(sum(squared(m)))
            - else
                - returns m
    !*/

// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------
//                          Rounding numbers one way or another
// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------

    const matrix_exp round (
        const matrix_exp& m
    );
    /*!
        requires
            - is_built_in_scalar_type<matrix_exp::type>::value == true
              (i.e. m must contain a type like int, float, double, long, etc.)
        ensures
            - if (m contains integers) then
                - returns m unmodified
            - else
                - returns a matrix R such that:
                    - R::type == the same type that was in m
                    - R has the same dimensions as m
                    - for all valid r and c:
                      R(r,c) == m(r,c) rounded to the nearest integral value
    !*/

// ----------------------------------------------------------------------------------------

    const matrix_exp ceil (
        const matrix_exp& m
    );
    /*!
        ensures
            - returns a matrix R such that:
                - R::type == the same type that was in m
                - R has the same dimensions as m
                - for all valid r and c:
                  R(r,c) == std::ceil(m(r,c)) 
    !*/

// ----------------------------------------------------------------------------------------

    const matrix_exp floor (
        const matrix_exp& m
    );
    /*!
        ensures
            - returns a matrix R such that:
                - R::type == the same type that was in m
                - R has the same dimensions as m
                - for all valid r and c:
                  R(r,c) == std::floor(m(r,c)) 
    !*/

// ----------------------------------------------------------------------------------------

    const matrix_exp round_zeros (
        const matrix_exp& m
    );
    /*!
        requires
            - is_built_in_scalar_type<matrix_exp::type>::value == true
              (i.e. m must contain a type like int, float, double, long, etc.)
        ensures
            - if (m contains integers) then
                - returns m unmodified
            - else
                - returns a matrix R such that:
                    - R::type == the same type that was in m
                    - R has the same dimensions as m
                    - let eps == 10*std::numeric_limits<matrix_exp::type>::epsilon()
                    - for all valid r and c:
                        - if (abs(m(r,c)) >= eps) then
                            - R(r,c) == m(r,c)
                        - else
                            - R(r,c) == 0
    !*/

// ----------------------------------------------------------------------------------------

    const matrix_exp round_zeros (
        const matrix_exp& m,
        matrix_exp::type eps 
    );
    /*!
        requires
            - is_built_in_scalar_type<matrix_exp::type>::value == true
              (i.e. m must contain a type like int, float, double, long, etc.)
        ensures
            - returns a matrix R such that:
                - R::type == the same type that was in m
                - R has the same dimensions as m
                - for all valid r and c:
                    - if (abs(m(r,c)) >= eps) then
                        - R(r,c) == m(r,c)
                    - else
                        - R(r,c) == 0
    !*/

// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------
//                              Complex number utility functions
// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------

    const matrix_exp conj (
        const matrix_exp& m
    );
    /*!
        requires
            - matrix_exp::type == std::complex<T>
        ensures
            - returns a matrix R such that:
                - R::type == std::complex<T>
                - R has the same dimensions as m
                - for all valid r and c:
                  R(r,c) == std::conj(m(r,c))
    !*/

// ----------------------------------------------------------------------------------------

    const matrix_exp norm (
        const matrix_exp& m
    );
    /*!
        requires
            - matrix_exp::type == std::complex<T>
        ensures
            - returns a matrix R such that:
                - R::type == T
                - R has the same dimensions as m
                - for all valid r and c:
                  R(r,c) == std::norm(m(r,c))
                  (note that std::norm(val) == val.real()*val.real() + val.imag()*val.imag())
    !*/

// ----------------------------------------------------------------------------------------

    const matrix_exp imag (
        const matrix_exp& m
    );
    /*!
        requires
            - matrix_exp::type == std::complex<T>
        ensures
            - returns a matrix R such that:
                - R::type == T
                - R has the same dimensions as m
                - for all valid r and c:
                  R(r,c) == std::imag(m(r,c))
    !*/

// ----------------------------------------------------------------------------------------

    const matrix_exp real (
        const matrix_exp& m
    );
    /*!
        requires
            - matrix_exp::type == std::complex<T>
        ensures
            - returns a matrix R such that:
                - R::type == T
                - R has the same dimensions as m
                - for all valid r and c:
                  R(r,c) == std::real(m(r,c))
    !*/

// ----------------------------------------------------------------------------------------

    const matrix_exp complex_matrix (
        const matrix_exp& real_part
    );
    /*!
        ensures
            - returns a matrix R such that:
                - R::type == std::complex<T> where T is whatever type real_part used.
                - R has the same dimensions as real_part. 
                - for all valid r and c:
                  R(r,c) == std::complex(real_part(r,c), 0)
    !*/

// ----------------------------------------------------------------------------------------

    const matrix_exp complex_matrix (
        const matrix_exp& real_part,
        const matrix_exp& imag_part
    );
    /*!
        requires
            - real_part.nr() == imag_part.nr()
            - real_part.nc() == imag_part.nc()
            - real_part and imag_part both contain the same type of element
        ensures
            - returns a matrix R such that:
                - R::type == std::complex<T> where T is whatever type real_part and imag_part used.
                - R has the same dimensions as real_part and imag_part
                - for all valid r and c:
                  R(r,c) == std::complex(real_part(r,c),imag_part(r,c))
    !*/

// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------
//                              Trigonometric Functions 
// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------

    const matrix_exp sin (
        const matrix_exp& m
    );
    /*!
        requires
            - matrix_exp::type == float, double, or long double 
        ensures
            - returns a matrix R such that:
                - R::type == the same type that was in m
                - R has the same dimensions as m
                - for all valid r and c:
                  R(r,c) == std::sin(m(r,c)) 
    !*/

// ----------------------------------------------------------------------------------------

    const matrix_exp cos (
        const matrix_exp& m
    );
    /*!
        requires
            - matrix_exp::type == float, double, or long double 
        ensures
            - returns a matrix R such that:
                - R::type == the same type that was in m
                - R has the same dimensions as m
                - for all valid r and c:
                  R(r,c) == std::cos(m(r,c)) 
    !*/

// ----------------------------------------------------------------------------------------

    const matrix_exp tan (
        const matrix_exp& m
    );
    /*!
        requires
            - matrix_exp::type == float, double, or long double 
        ensures
            - returns a matrix R such that:
                - R::type == the same type that was in m
                - R has the same dimensions as m
                - for all valid r and c:
                  R(r,c) == std::tan(m(r,c)) 
    !*/

// ----------------------------------------------------------------------------------------

    const matrix_exp asin (
        const matrix_exp& m
    );
    /*!
        requires
            - matrix_exp::type == float, double, or long double 
        ensures
            - returns a matrix R such that:
                - R::type == the same type that was in m
                - R has the same dimensions as m
                - for all valid r and c:
                  R(r,c) == std::asin(m(r,c)) 
    !*/

// ----------------------------------------------------------------------------------------

    const matrix_exp acos (
        const matrix_exp& m
    );
    /*!
        requires
            - matrix_exp::type == float, double, or long double 
        ensures
            - returns a matrix R such that:
                - R::type == the same type that was in m
                - R has the same dimensions as m
                - for all valid r and c:
                  R(r,c) == std::acos(m(r,c)) 
    !*/

// ----------------------------------------------------------------------------------------

    const matrix_exp atan (
        const matrix_exp& m
    );
    /*!
        requires
            - matrix_exp::type == float, double, or long double 
        ensures
            - returns a matrix R such that:
                - R::type == the same type that was in m
                - R has the same dimensions as m
                - for all valid r and c:
                  R(r,c) == std::atan(m(r,c)) 
    !*/

// ----------------------------------------------------------------------------------------

    const matrix_exp sinh (
        const matrix_exp& m
    );
    /*!
        requires
            - matrix_exp::type == float, double, or long double 
        ensures
            - returns a matrix R such that:
                - R::type == the same type that was in m
                - R has the same dimensions as m
                - for all valid r and c:
                  R(r,c) == std::sinh(m(r,c)) 
    !*/

// ----------------------------------------------------------------------------------------

    const matrix_exp cosh (
        const matrix_exp& m
    );
    /*!
        requires
            - matrix_exp::type == float, double, or long double 
        ensures
            - returns a matrix R such that:
                - R::type == the same type that was in m
                - R has the same dimensions as m
                - for all valid r and c:
                  R(r,c) == std::cosh(m(r,c)) 
    !*/

// ----------------------------------------------------------------------------------------

    const matrix_exp tanh (
        const matrix_exp& m
    );
    /*!
        requires
            - matrix_exp::type == float, double, or long double 
        ensures
            - returns a matrix R such that:
                - R::type == the same type that was in m
                - R has the same dimensions as m
                - for all valid r and c:
                  R(r,c) == std::tanh(m(r,c)) 
    !*/

// ----------------------------------------------------------------------------------------

}

#endif // DLIB_MATRIx_MATH_FUNCTIONS_ABSTRACT_

