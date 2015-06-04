// Copyright (C) 2006  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#ifndef DLIB_MATRIx_MATH_FUNCTIONS
#define DLIB_MATRIx_MATH_FUNCTIONS 

#include "matrix_math_functions_abstract.h"
#include "matrix_op.h"
#include "matrix_utilities.h"
#include "matrix.h"
#include "../algs.h"
#include <cmath>
#include <complex>
#include <limits>


namespace dlib
{

// ----------------------------------------------------------------------------------------

    DLIB_DEFINE_FUNCTION_M(op_sqrt, sqrt, std::sqrt ,7);
    DLIB_DEFINE_FUNCTION_M(op_log, log, std::log ,7);
    DLIB_DEFINE_FUNCTION_M(op_log10, log10, std::log10 ,7);
    DLIB_DEFINE_FUNCTION_M(op_exp, exp, std::exp ,7);

    DLIB_DEFINE_FUNCTION_M(op_conj, conj, std::conj ,2);

    DLIB_DEFINE_FUNCTION_M(op_ceil, ceil, std::ceil ,7);
    DLIB_DEFINE_FUNCTION_M(op_floor, floor, std::floor ,7);

    DLIB_DEFINE_FUNCTION_M(op_sin, sin, std::sin ,7);
    DLIB_DEFINE_FUNCTION_M(op_cos, cos, std::cos ,7);
    DLIB_DEFINE_FUNCTION_M(op_tan, tan, std::tan ,7);
    DLIB_DEFINE_FUNCTION_M(op_sinh, sinh, std::sinh ,7);
    DLIB_DEFINE_FUNCTION_M(op_cosh, cosh, std::cosh ,7);
    DLIB_DEFINE_FUNCTION_M(op_tanh, tanh, std::tanh ,7);
    DLIB_DEFINE_FUNCTION_M(op_asin, asin, std::asin ,7);
    DLIB_DEFINE_FUNCTION_M(op_acos, acos, std::acos ,7);
    DLIB_DEFINE_FUNCTION_M(op_atan, atan, std::atan ,7);

// ----------------------------------------------------------------------------------------

    namespace impl
    {
        template <typename type>
        inline type sigmoid (const type& val)
        {
            return static_cast<type>(1/(1 + std::exp(-val)));
        }

        template <typename type, typename S>
        inline type round_zeros_eps (const type& val, const S& eps)
        {
            // you can only round matrices that contain built in scalar types like double, long, float, etc.
            COMPILE_TIME_ASSERT(is_built_in_scalar_type<type>::value);

            if (val >= eps || val <= -eps)
                return val;
            else
                return 0;
        }

        template <typename type>
        inline type round_zeros (const type& val)
        {
            // you can only round matrices that contain built in scalar types like double, long, float, etc.
            COMPILE_TIME_ASSERT(is_built_in_scalar_type<type>::value);

            const type eps = 10*std::numeric_limits<type>::epsilon();
            if (val >= eps || val <= -eps)
                return val;
            else
                return 0;
        }

        template <typename type>
        inline type squared (const type& val)
        {
            return val*val;
        }

        template <typename type>
        inline type sign (const type& val)
        {
            if (val >= 0)
                return +1;
            else
                return -1;
        }

        template <typename type>
        type cubed (const type& val)
        {
            return val*val*val;
        }

        template <typename type, typename S>
        inline type pow1 (const type& val, const S& s)
        {
            // you can only call pow() on matrices that contain floats, doubles or long doubles.
            COMPILE_TIME_ASSERT((
                    is_same_type<type,float>::value == true || 
                    is_same_type<type,double>::value == true || 
                    is_same_type<type,long double>::value == true 
            ));

            return std::pow(val,static_cast<type>(s));
        }

        template <typename type, typename S>
        inline type pow2 (const S& s, const type& val)
        {
            // you can only call pow() on matrices that contain floats, doubles or long doubles.
            COMPILE_TIME_ASSERT((
                    is_same_type<type,float>::value == true || 
                    is_same_type<type,double>::value == true || 
                    is_same_type<type,long double>::value == true 
            ));

            return std::pow(static_cast<type>(s),val);
        }

        template <typename type>
        inline type reciprocal (const type& val)
        {
            // you can only compute reciprocal matrices that contain floats, doubles or long doubles.
            COMPILE_TIME_ASSERT((
                    is_same_type<type,float>::value == true || 
                    is_same_type<type,double>::value == true || 
                    is_same_type<type,long double>::value == true  ||
                    is_same_type<type,std::complex<float> >::value == true || 
                    is_same_type<type,std::complex<double> >::value == true || 
                    is_same_type<type,std::complex<long double> >::value == true 
            ));

            if (val != static_cast<type>(0))
                return static_cast<type>((type)1.0/val);
            else
                return 0;
        }

        template <typename type>
        inline type reciprocal_max (const type& val)
        {
            // you can only compute reciprocal_max matrices that contain floats, doubles or long doubles.
            COMPILE_TIME_ASSERT((
                    is_same_type<type,float>::value == true || 
                    is_same_type<type,double>::value == true || 
                    is_same_type<type,long double>::value == true 
            ));

            if (val != static_cast<type>(0))
                return static_cast<type>((type)1.0/val);
            else
                return std::numeric_limits<type>::max();
        }

    }

    DLIB_DEFINE_FUNCTION_M(op_sigmoid, sigmoid, impl::sigmoid, 7);
    DLIB_DEFINE_FUNCTION_MS(op_round_zeros, round_zeros, impl::round_zeros_eps, 7);
    DLIB_DEFINE_FUNCTION_M(op_round_zeros2, round_zeros, impl::round_zeros, 7);
    DLIB_DEFINE_FUNCTION_M(op_cubed, cubed, impl::cubed, 7);
    DLIB_DEFINE_FUNCTION_M(op_squared, squared, impl::squared, 6);
    DLIB_DEFINE_FUNCTION_M(op_sign, sign, impl::sign, 6);
    DLIB_DEFINE_FUNCTION_MS(op_pow1, pow, impl::pow1, 7);
    DLIB_DEFINE_FUNCTION_SM(op_pow2, pow, impl::pow2, 7);
    DLIB_DEFINE_FUNCTION_M(op_reciprocal, reciprocal, impl::reciprocal, 6);
    DLIB_DEFINE_FUNCTION_M(op_reciprocal_max, reciprocal_max, impl::reciprocal_max, 6);

// ----------------------------------------------------------------------------------------

    template <typename M, typename enabled = void>
    struct op_round : basic_op_m<M> 
    {
        op_round( const M& m_) : basic_op_m<M>(m_){}

        const static long cost = M::cost+7;
        typedef typename M::type type;
        typedef const typename M::type const_ret_type;
        const_ret_type apply (long r, long c) const
        { 
            return static_cast<type>(std::floor(this->m(r,c)+0.5)); 
        }
    };

    template <typename M>
    struct op_round<M,typename enable_if_c<std::numeric_limits<typename M::type>::is_integer>::type > 
    : basic_op_m<M>
    {
        op_round( const M& m_) : basic_op_m<M>(m_){}

        const static long cost = M::cost;
        typedef typename M::type type;
        typedef typename M::const_ret_type const_ret_type;
        const_ret_type apply (long r, long c) const
        { 
            return this->m(r,c);
        }
    };

    template <
        typename EXP
        >
    const matrix_op<op_round<EXP> > round (
        const matrix_exp<EXP>& m
    )
    {
        // you can only round matrices that contain built in scalar types like double, long, float, etc.
        COMPILE_TIME_ASSERT(is_built_in_scalar_type<typename EXP::type>::value);

        typedef op_round<EXP> op;
        return matrix_op<op>(op(m.ref()));
    }

// ----------------------------------------------------------------------------------------

    template <typename M>
    struct op_normalize : basic_op_m<M> 
    {
        typedef typename M::type type;

        op_normalize( const M& m_, const type& s_) : basic_op_m<M>(m_), s(s_){}

        const type s;

        const static long cost = M::cost+5;
        typedef const typename M::type const_ret_type;
        const_ret_type apply (long r, long c) const
        { 
            return this->m(r,c)*s;
        }
    };

    template <
        typename EXP
        >
    const matrix_op<op_normalize<EXP> > normalize (
        const matrix_exp<EXP>& m
    )
    {
        // you can only compute normalized matrices that contain floats, doubles or long doubles.
        COMPILE_TIME_ASSERT((
                is_same_type<typename EXP::type,float>::value == true || 
                is_same_type<typename EXP::type,double>::value == true || 
                is_same_type<typename EXP::type,long double>::value == true 
        ));


        typedef op_normalize<EXP> op;
        typename EXP::type temp = std::sqrt(sum(squared(m)));
        if (temp != 0.0)
            temp = 1.0/temp;

        return matrix_op<op>(op(m.ref(),temp));
    }

// ----------------------------------------------------------------------------------------

    template <typename M, typename return_type = typename M::type>
    struct op_abs : basic_op_m<M>
    {
        op_abs( const M& m_) : basic_op_m<M>(m_){}

        const static long cost = M::cost+7;
        typedef typename M::type type;
        typedef const typename M::type const_ret_type;
        const_ret_type apply ( long r, long c) const
        { 
            return static_cast<type>(std::abs(this->m(r,c))); 
        }
    };

    template <typename M, typename T>
    struct op_abs<M, std::complex<T> > : basic_op_m<M>
    {
        op_abs( const M& m_) : basic_op_m<M>(m_){}

        const static long cost = M::cost;
        typedef T type;
        typedef const T const_ret_type;
        const_ret_type apply ( long r, long c) const
        { 
            return static_cast<type>(std::abs(this->m(r,c))); 
        }
    };

    template <
        typename EXP
        >
    const matrix_op<op_abs<EXP> > abs (
        const matrix_exp<EXP>& m
    )
    {
        typedef op_abs<EXP> op;
        return matrix_op<op>(op(m.ref()));
    }

// ----------------------------------------------------------------------------------------

    template <typename M>
    struct op_complex_matrix : basic_op_m<M>
    {
        op_complex_matrix( const M& m_) : basic_op_m<M>(m_){}

        const static long cost = M::cost+1;
        typedef std::complex<typename M::type> type;
        typedef const std::complex<typename M::type> const_ret_type;
        const_ret_type apply ( long r, long c) const
        { 
            return type(this->m(r,c));
        }
    };

    template <
        typename EXP
        >
    const matrix_op<op_complex_matrix<EXP> > complex_matrix (
        const matrix_exp<EXP>& m
    )
    {
        typedef op_complex_matrix<EXP> op;
        return matrix_op<op>(op(m.ref()));
    }

// ----------------------------------------------------------------------------------------

    template <typename M1, typename M2>
    struct op_complex_matrix2 : basic_op_mm<M1,M2>
    {
        op_complex_matrix2( const M1& m1_, const M2& m2_) : basic_op_mm<M1,M2>(m1_,m2_){}

        const static long cost = M1::cost+M2::cost+1;
        typedef std::complex<typename M1::type> type;
        typedef const std::complex<typename M1::type> const_ret_type;

        const_ret_type apply ( long r, long c) const
        { return type(this->m1(r,c), this->m2(r,c)); }
    };

    template <
        typename EXP1,
        typename EXP2
        >
    const matrix_op<op_complex_matrix2<EXP1,EXP2> > complex_matrix (
        const matrix_exp<EXP1>& real_part,
        const matrix_exp<EXP2>& imag_part 
    )
    {
        COMPILE_TIME_ASSERT((is_same_type<typename EXP1::type,typename EXP2::type>::value == true));
        COMPILE_TIME_ASSERT(EXP1::NR == EXP2::NR || EXP1::NR == 0 || EXP2::NR == 0);
        COMPILE_TIME_ASSERT(EXP1::NC == EXP2::NC || EXP1::NC == 0 || EXP2::NC == 0);

        DLIB_ASSERT(real_part.nr() == imag_part.nr() &&
               real_part.nc() == imag_part.nc(), 
            "\tconst matrix_exp::type complex_matrix(real_part, imag_part)"
            << "\n\tYou can only make a complex matrix from two equally sized matrices"
            << "\n\treal_part.nr(): " << real_part.nr()
            << "\n\treal_part.nc(): " << real_part.nc() 
            << "\n\timag_part.nr(): " << imag_part.nr()
            << "\n\timag_part.nc(): " << imag_part.nc() 
            );

        typedef op_complex_matrix2<EXP1,EXP2> op;
        return matrix_op<op>(op(real_part.ref(),imag_part.ref()));
    }

// ----------------------------------------------------------------------------------------

    template <typename M>
    struct op_norm : basic_op_m<M>
    {
        op_norm( const M& m_) : basic_op_m<M>(m_){}

        const static long cost = M::cost+6;
        typedef typename M::type::value_type type;
        typedef const typename M::type::value_type const_ret_type;
        const_ret_type apply ( long r, long c) const
        { return std::norm(this->m(r,c)); }
    };

    template <
        typename EXP
        >
    const matrix_op<op_norm<EXP> > norm (
        const matrix_exp<EXP>& m
    )
    {
        typedef op_norm<EXP> op;
        return matrix_op<op>(op(m.ref()));
    }

// ----------------------------------------------------------------------------------------

    template <typename M>
    struct op_real : basic_op_m<M>
    {
        op_real( const M& m_) : basic_op_m<M>(m_){}

        const static long cost = M::cost;
        typedef typename M::type::value_type type;
        typedef const typename M::type::value_type const_ret_type;
        const_ret_type apply ( long r, long c) const
        { return std::real(this->m(r,c)); }
    };

    template <
        typename EXP
        >
    const matrix_op<op_real<EXP> > real (
        const matrix_exp<EXP>& m
    )
    {
        typedef op_real<EXP> op;
        return matrix_op<op>(op(m.ref()));
    }

// ----------------------------------------------------------------------------------------

    template <typename M>
    struct op_imag : basic_op_m<M>
    {
        op_imag( const M& m_) : basic_op_m<M>(m_){}

        const static long cost = M::cost;
        typedef typename M::type::value_type type;
        typedef const typename M::type::value_type const_ret_type;
        const_ret_type apply (long r, long c) const
        { return std::imag(this->m(r,c)); }
    };

    template <
        typename EXP
        >
    const matrix_op<op_imag<EXP> > imag (
        const matrix_exp<EXP>& m
    )
    {
        typedef op_imag<EXP> op;
        return matrix_op<op>(op(m.ref()));
    }

// ----------------------------------------------------------------------------------------

}

#endif // DLIB_MATRIx_MATH_FUNCTIONS

