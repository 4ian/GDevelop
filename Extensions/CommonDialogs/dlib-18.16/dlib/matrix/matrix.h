// Copyright (C) 2006  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#ifndef DLIB_MATRIx_
#define DLIB_MATRIx_

#include "matrix_exp.h"
#include "matrix_abstract.h"
#include "../algs.h"
#include "../serialize.h"
#include "../enable_if.h"
#include <sstream>
#include <algorithm>
#include "../memory_manager.h"
#include "../is_kind.h"
#include "matrix_data_layout.h"
#include "matrix_assign_fwd.h"
#include "matrix_op.h"

#ifdef _MSC_VER
// Disable the following warnings for Visual Studio

// This warning is:
//    "warning C4355: 'this' : used in base member initializer list"
// Which we get from this code but it is not an error so I'm turning this
// warning off and then turning it back on at the end of the file.
#pragma warning(disable : 4355)

#endif

namespace dlib
{

// ----------------------------------------------------------------------------------------

    // This template will perform the needed loop for element multiplication using whichever
    // dimension is provided as a compile time constant (if one is at all).
    template <
        typename LHS,
        typename RHS,
        long lhs_nc = LHS::NC,
        long rhs_nr = RHS::NR
        >
    struct matrix_multiply_helper 
    {
        typedef typename LHS::type type;
        template <typename RHS_, typename LHS_>
        inline const static type  eval (
            const RHS_& rhs,
            const LHS_& lhs,
            const long r, 
            const long c
        )  
        { 
            type temp = lhs(r,0)*rhs(0,c);
            for (long i = 1; i < rhs.nr(); ++i)
            {
                temp += lhs(r,i)*rhs(i,c);
            }
            return temp;
        }
    };

    template <
        typename LHS,
        typename RHS,
        long lhs_nc 
        >
    struct matrix_multiply_helper <LHS,RHS,lhs_nc,0>
    {
        typedef typename LHS::type type;
        template <typename RHS_, typename LHS_>
        inline const static type  eval (
            const RHS_& rhs,
            const LHS_& lhs,
            const long r, 
            const long c
        )  
        { 
            type temp = lhs(r,0)*rhs(0,c);
            for (long i = 1; i < lhs.nc(); ++i)
            {
                temp += lhs(r,i)*rhs(i,c);
            }
            return temp;
        }
    };

    template <typename LHS, typename RHS>
    class matrix_multiply_exp;

    template <typename LHS, typename RHS>
    struct matrix_traits<matrix_multiply_exp<LHS,RHS> >
    {
        typedef typename LHS::type type;
        typedef typename LHS::type const_ret_type;
        typedef typename LHS::mem_manager_type mem_manager_type;
        typedef typename LHS::layout_type layout_type;
        const static long NR = LHS::NR;
        const static long NC = RHS::NC;

#ifdef DLIB_USE_BLAS
        // if there are BLAS functions to be called then we want to make sure we
        // always evaluate any complex expressions so that the BLAS bindings can happen.
        const static bool lhs_is_costly = (LHS::cost > 2)&&(RHS::NC != 1 || LHS::cost >= 10000);
        const static bool rhs_is_costly = (RHS::cost > 2)&&(LHS::NR != 1 || RHS::cost >= 10000);
#else
        const static bool lhs_is_costly = (LHS::cost > 4)&&(RHS::NC != 1);
        const static bool rhs_is_costly = (RHS::cost > 4)&&(LHS::NR != 1);
#endif

        // Note that if we decide that one of the matrices is too costly we will evaluate it
        // into a temporary.  Doing this resets its cost back to 1.
        const static long lhs_cost = ((lhs_is_costly==true)? 1 : (LHS::cost));
        const static long rhs_cost = ((rhs_is_costly==true)? 1 : (RHS::cost));

        // The cost of evaluating an element of a matrix multiply is the cost of evaluating elements from
        // RHS and LHS times the number of rows/columns in the RHS/LHS matrix.  If we don't know the matrix
        // dimensions then just assume it is really large.
        const static long cost = ((tmax<LHS::NC,RHS::NR>::value!=0)? ((lhs_cost+rhs_cost)*tmax<LHS::NC,RHS::NR>::value):(10000));
    };

    template <typename T, bool is_ref> struct conditional_matrix_temp { typedef typename T::matrix_type type; };
    template <typename T> struct conditional_matrix_temp<T,true>      { typedef T& type; };

    template <
        typename LHS,
        typename RHS
        >
    class matrix_multiply_exp : public matrix_exp<matrix_multiply_exp<LHS,RHS> >
    {
        /*!
            REQUIREMENTS ON LHS AND RHS
                - must be matrix_exp objects.
        !*/
    public:

        typedef typename matrix_traits<matrix_multiply_exp>::type type;
        typedef typename matrix_traits<matrix_multiply_exp>::const_ret_type const_ret_type;
        typedef typename matrix_traits<matrix_multiply_exp>::mem_manager_type mem_manager_type;
        const static long NR = matrix_traits<matrix_multiply_exp>::NR;
        const static long NC = matrix_traits<matrix_multiply_exp>::NC;
        const static long cost = matrix_traits<matrix_multiply_exp>::cost;
        typedef typename matrix_traits<matrix_multiply_exp>::layout_type layout_type;


        const static bool lhs_is_costly = matrix_traits<matrix_multiply_exp>::lhs_is_costly;
        const static bool rhs_is_costly = matrix_traits<matrix_multiply_exp>::rhs_is_costly;
        const static bool either_is_costly = lhs_is_costly || rhs_is_costly;
        const static bool both_are_costly = lhs_is_costly && rhs_is_costly;

        typedef typename conditional_matrix_temp<const LHS,lhs_is_costly == false>::type LHS_ref_type;
        typedef typename conditional_matrix_temp<const RHS,rhs_is_costly == false>::type RHS_ref_type;

        // This constructor exists simply for the purpose of causing a compile time error if
        // someone tries to create an instance of this object with the wrong kind of objects.
        template <typename T1, typename T2>
        matrix_multiply_exp (T1,T2); 

        inline matrix_multiply_exp (
            const LHS& lhs_,
            const RHS& rhs_
        ) :
            lhs(lhs_),
            rhs(rhs_)
        {
            // You are trying to multiply two incompatible matrices together.  The number of columns 
            // in the matrix on the left must match the number of rows in the matrix on the right.
            COMPILE_TIME_ASSERT(LHS::NC == RHS::NR || LHS::NC*RHS::NR == 0);
            DLIB_ASSERT(lhs.nc() == rhs.nr() && lhs.size() > 0 && rhs.size() > 0, 
                "\tconst matrix_exp operator*(const matrix_exp& lhs, const matrix_exp& rhs)"
                << "\n\tYou are trying to multiply two incompatible matrices together"
                << "\n\tlhs.nr(): " << lhs.nr()
                << "\n\tlhs.nc(): " << lhs.nc()
                << "\n\trhs.nr(): " << rhs.nr()
                << "\n\trhs.nc(): " << rhs.nc()
                << "\n\t&lhs: " << &lhs 
                << "\n\t&rhs: " << &rhs 
                );

            // You can't multiply matrices together if they don't both contain the same type of elements.
            COMPILE_TIME_ASSERT((is_same_type<typename LHS::type, typename RHS::type>::value == true));
        }

        inline const type operator() (
            const long r, 
            const long c
        ) const 
        { 
            return matrix_multiply_helper<LHS,RHS>::eval(rhs,lhs,r,c);
        }

        inline const type operator() ( long i ) const 
        { return matrix_exp<matrix_multiply_exp>::operator()(i); }

        long nr (
        ) const { return lhs.nr(); }

        long nc (
        ) const { return rhs.nc(); }

        template <typename U>
        bool aliases (
            const matrix_exp<U>& item
        ) const { return lhs.aliases(item) || rhs.aliases(item); }

        template <typename U>
        bool destructively_aliases (
            const matrix_exp<U>& item
        ) const { return aliases(item); }

        LHS_ref_type lhs;
        RHS_ref_type rhs;
    };

    template < typename EXP1, typename EXP2 >
    inline const matrix_multiply_exp<EXP1, EXP2> operator* (
        const matrix_exp<EXP1>& m1,
        const matrix_exp<EXP2>& m2
    )
    {
        return matrix_multiply_exp<EXP1, EXP2>(m1.ref(), m2.ref());
    }

    template <typename M, bool use_reference = true>
    class matrix_mul_scal_exp;

    // -------------------------

    // Now we declare some overloads that cause any scalar multiplications to percolate 
    // up and outside of any matrix multiplies.  Note that we are using the non-reference containing
    // mode of the matrix_mul_scal_exp object since we are passing in locally constructed matrix_multiply_exp 
    // objects.  So the matrix_mul_scal_exp object will contain copies of matrix_multiply_exp objects
    // rather than references to them.  This could result in extra matrix copies if the matrix_multiply_exp
    // decided it should evaluate any of its arguments.  So we also try to not apply this percolating operation 
    // if the matrix_multiply_exp would contain a fully evaluated copy of the original matrix_mul_scal_exp 
    // expression.
    // 
    // Also, the reason we want to apply this transformation in the first place is because it (1) makes
    // the expressions going into matrix multiply expressions simpler and (2) it makes it a lot more
    // straightforward to bind BLAS calls to matrix expressions involving scalar multiplies.
    template < typename EXP1, typename EXP2 >
    inline const typename disable_if_c< matrix_multiply_exp<matrix_mul_scal_exp<EXP1>, matrix_mul_scal_exp<EXP2> >::both_are_costly ,      
                                        matrix_mul_scal_exp<matrix_multiply_exp<EXP1, EXP2>,false> >::type operator* (
        const matrix_mul_scal_exp<EXP1>& m1,
        const matrix_mul_scal_exp<EXP2>& m2
    )
    {
        typedef matrix_multiply_exp<EXP1, EXP2> exp1;
        typedef matrix_mul_scal_exp<exp1,false> exp2;
        return exp2(exp1(m1.m, m2.m), m1.s*m2.s);
    }

    template < typename EXP1, typename EXP2 >
    inline const typename disable_if_c< matrix_multiply_exp<matrix_mul_scal_exp<EXP1>, EXP2 >::lhs_is_costly ,      
                                      matrix_mul_scal_exp<matrix_multiply_exp<EXP1, EXP2>,false> >::type operator* (
        const matrix_mul_scal_exp<EXP1>& m1,
        const matrix_exp<EXP2>& m2
    )
    {
        typedef matrix_multiply_exp<EXP1, EXP2> exp1;
        typedef matrix_mul_scal_exp<exp1,false> exp2;
        return exp2(exp1(m1.m, m2.ref()), m1.s);
    }

    template < typename EXP1, typename EXP2 >
    inline const typename disable_if_c< matrix_multiply_exp<EXP1, matrix_mul_scal_exp<EXP2> >::rhs_is_costly ,      
                                      matrix_mul_scal_exp<matrix_multiply_exp<EXP1, EXP2>,false> >::type operator* (
        const matrix_exp<EXP1>& m1,
        const matrix_mul_scal_exp<EXP2>& m2
    )
    {
        typedef matrix_multiply_exp<EXP1, EXP2> exp1;
        typedef matrix_mul_scal_exp<exp1,false> exp2;
        return exp2(exp1(m1.ref(), m2.m), m2.s);
    }

// ----------------------------------------------------------------------------------------

    template <typename LHS, typename RHS>
    class matrix_add_exp;

    template <typename LHS, typename RHS>
    struct matrix_traits<matrix_add_exp<LHS,RHS> >
    {
        typedef typename LHS::type type;
        typedef typename LHS::type const_ret_type;
        typedef typename LHS::mem_manager_type mem_manager_type;
        typedef typename LHS::layout_type layout_type;
        const static long NR = (RHS::NR > LHS::NR) ? RHS::NR : LHS::NR;
        const static long NC = (RHS::NC > LHS::NC) ? RHS::NC : LHS::NC;
        const static long cost = LHS::cost+RHS::cost+1;
    };

    template <
        typename LHS,
        typename RHS
        >
    class matrix_add_exp : public matrix_exp<matrix_add_exp<LHS,RHS> >
    {
        /*!
            REQUIREMENTS ON LHS AND RHS
                - must be matrix_exp objects. 
        !*/
    public:
        typedef typename matrix_traits<matrix_add_exp>::type type;
        typedef typename matrix_traits<matrix_add_exp>::const_ret_type const_ret_type;
        typedef typename matrix_traits<matrix_add_exp>::mem_manager_type mem_manager_type;
        const static long NR = matrix_traits<matrix_add_exp>::NR;
        const static long NC = matrix_traits<matrix_add_exp>::NC;
        const static long cost = matrix_traits<matrix_add_exp>::cost;
        typedef typename matrix_traits<matrix_add_exp>::layout_type layout_type;

        // This constructor exists simply for the purpose of causing a compile time error if
        // someone tries to create an instance of this object with the wrong kind of objects.
        template <typename T1, typename T2>
        matrix_add_exp (T1,T2); 

        matrix_add_exp (
            const LHS& lhs_,
            const RHS& rhs_
        ) :
            lhs(lhs_),
            rhs(rhs_)
        {
            // You can only add matrices together if they both have the same number of rows and columns.
            COMPILE_TIME_ASSERT(LHS::NR == RHS::NR || LHS::NR == 0 || RHS::NR == 0);
            COMPILE_TIME_ASSERT(LHS::NC == RHS::NC || LHS::NC == 0 || RHS::NC == 0);
            DLIB_ASSERT(lhs.nc() == rhs.nc() &&
                   lhs.nr() == rhs.nr(), 
                "\tconst matrix_exp operator+(const matrix_exp& lhs, const matrix_exp& rhs)"
                << "\n\tYou are trying to add two incompatible matrices together"
                << "\n\tlhs.nr(): " << lhs.nr()
                << "\n\tlhs.nc(): " << lhs.nc()
                << "\n\trhs.nr(): " << rhs.nr()
                << "\n\trhs.nc(): " << rhs.nc()
                << "\n\t&lhs: " << &lhs 
                << "\n\t&rhs: " << &rhs 
                );

            // You can only add matrices together if they both contain the same types of elements.
            COMPILE_TIME_ASSERT((is_same_type<typename LHS::type, typename RHS::type>::value == true));
        }

        const type operator() (
            long r, 
            long c
        ) const { return lhs(r,c) + rhs(r,c); }

        inline const type operator() ( long i ) const 
        { return matrix_exp<matrix_add_exp>::operator()(i); }

        template <typename U>
        bool aliases (
            const matrix_exp<U>& item
        ) const { return lhs.aliases(item) || rhs.aliases(item); }

        template <typename U>
        bool destructively_aliases (
            const matrix_exp<U>& item
        ) const { return lhs.destructively_aliases(item) || rhs.destructively_aliases(item); }

        long nr (
        ) const { return lhs.nr(); }

        long nc (
        ) const { return lhs.nc(); }

        const LHS& lhs;
        const RHS& rhs;
    };

    template <
        typename EXP1,
        typename EXP2
        >
    inline const matrix_add_exp<EXP1, EXP2> operator+ (
        const matrix_exp<EXP1>& m1,
        const matrix_exp<EXP2>& m2
    )
    {
        return matrix_add_exp<EXP1, EXP2>(m1.ref(),m2.ref());
    }

// ----------------------------------------------------------------------------------------

    template <typename LHS, typename RHS>
    class matrix_subtract_exp;

    template <typename LHS, typename RHS>
    struct matrix_traits<matrix_subtract_exp<LHS,RHS> >
    {
        typedef typename LHS::type type;
        typedef typename LHS::type const_ret_type;
        typedef typename LHS::mem_manager_type mem_manager_type;
        typedef typename LHS::layout_type layout_type;
        const static long NR = (RHS::NR > LHS::NR) ? RHS::NR : LHS::NR;
        const static long NC = (RHS::NC > LHS::NC) ? RHS::NC : LHS::NC;
        const static long cost = LHS::cost+RHS::cost+1;
    };

    template <
        typename LHS,
        typename RHS
        >
    class matrix_subtract_exp : public matrix_exp<matrix_subtract_exp<LHS,RHS> >
    {
        /*!
            REQUIREMENTS ON LHS AND RHS
                - must be matrix_exp objects. 
        !*/
    public:
        typedef typename matrix_traits<matrix_subtract_exp>::type type;
        typedef typename matrix_traits<matrix_subtract_exp>::const_ret_type const_ret_type;
        typedef typename matrix_traits<matrix_subtract_exp>::mem_manager_type mem_manager_type;
        const static long NR = matrix_traits<matrix_subtract_exp>::NR;
        const static long NC = matrix_traits<matrix_subtract_exp>::NC;
        const static long cost = matrix_traits<matrix_subtract_exp>::cost;
        typedef typename matrix_traits<matrix_subtract_exp>::layout_type layout_type;


        // This constructor exists simply for the purpose of causing a compile time error if
        // someone tries to create an instance of this object with the wrong kind of objects.
        template <typename T1, typename T2>
        matrix_subtract_exp (T1,T2); 

        matrix_subtract_exp (
            const LHS& lhs_,
            const RHS& rhs_
        ) : 
            lhs(lhs_),
            rhs(rhs_)
        {
            // You can only subtract one matrix from another if they both have the same number of rows and columns.
            COMPILE_TIME_ASSERT(LHS::NR == RHS::NR || LHS::NR == 0 || RHS::NR == 0);
            COMPILE_TIME_ASSERT(LHS::NC == RHS::NC || LHS::NC == 0 || RHS::NC == 0);
            DLIB_ASSERT(lhs.nc() == rhs.nc() &&
                   lhs.nr() == rhs.nr(), 
                "\tconst matrix_exp operator-(const matrix_exp& lhs, const matrix_exp& rhs)"
                << "\n\tYou are trying to subtract two incompatible matrices"
                << "\n\tlhs.nr(): " << lhs.nr()
                << "\n\tlhs.nc(): " << lhs.nc()
                << "\n\trhs.nr(): " << rhs.nr()
                << "\n\trhs.nc(): " << rhs.nc()
                << "\n\t&lhs: " << &lhs 
                << "\n\t&rhs: " << &rhs 
                );

            // You can only subtract one matrix from another if they both contain elements of the same type.
            COMPILE_TIME_ASSERT((is_same_type<typename LHS::type, typename RHS::type>::value == true));
        }

        const type operator() (
            long r, 
            long c
        ) const { return lhs(r,c) - rhs(r,c); }

        inline const type operator() ( long i ) const 
        { return matrix_exp<matrix_subtract_exp>::operator()(i); }

        template <typename U>
        bool aliases (
            const matrix_exp<U>& item
        ) const { return lhs.aliases(item) || rhs.aliases(item); }

        template <typename U>
        bool destructively_aliases (
            const matrix_exp<U>& item
        ) const { return lhs.destructively_aliases(item) || rhs.destructively_aliases(item); }

        long nr (
        ) const { return lhs.nr(); }

        long nc (
        ) const { return lhs.nc(); }

        const LHS& lhs;
        const RHS& rhs;
    };

    template <
        typename EXP1,
        typename EXP2
        >
    inline const matrix_subtract_exp<EXP1, EXP2> operator- (
        const matrix_exp<EXP1>& m1,
        const matrix_exp<EXP2>& m2
    )
    {
        return matrix_subtract_exp<EXP1, EXP2>(m1.ref(),m2.ref());
    }

// ----------------------------------------------------------------------------------------

    template <typename M>
    class matrix_div_scal_exp;

    template <typename M>
    struct matrix_traits<matrix_div_scal_exp<M> >
    {
        typedef typename M::type type;
        typedef typename M::type const_ret_type;
        typedef typename M::mem_manager_type mem_manager_type;
        typedef typename M::layout_type layout_type;
        const static long NR = M::NR;
        const static long NC = M::NC;
        const static long cost = M::cost+1;
    };

    template <
        typename M
        >
    class matrix_div_scal_exp : public matrix_exp<matrix_div_scal_exp<M> >
    {
        /*!
            REQUIREMENTS ON M 
                - must be a matrix_exp object.
        !*/
    public:
        typedef typename matrix_traits<matrix_div_scal_exp>::type type;
        typedef typename matrix_traits<matrix_div_scal_exp>::const_ret_type const_ret_type;
        typedef typename matrix_traits<matrix_div_scal_exp>::mem_manager_type mem_manager_type;
        const static long NR = matrix_traits<matrix_div_scal_exp>::NR;
        const static long NC = matrix_traits<matrix_div_scal_exp>::NC;
        const static long cost = matrix_traits<matrix_div_scal_exp>::cost;
        typedef typename matrix_traits<matrix_div_scal_exp>::layout_type layout_type;


        // This constructor exists simply for the purpose of causing a compile time error if
        // someone tries to create an instance of this object with the wrong kind of objects.
        template <typename T1>
        matrix_div_scal_exp (T1, const type&); 

        matrix_div_scal_exp (
            const M& m_,
            const type& s_
        ) :
            m(m_),
            s(s_)
        {}

        const type operator() (
            long r, 
            long c
        ) const { return m(r,c)/s; }

        inline const type operator() ( long i ) const 
        { return matrix_exp<matrix_div_scal_exp>::operator()(i); }

        template <typename U>
        bool aliases (
            const matrix_exp<U>& item
        ) const { return m.aliases(item); }

        template <typename U>
        bool destructively_aliases (
            const matrix_exp<U>& item
        ) const { return m.destructively_aliases(item); }

        long nr (
        ) const { return m.nr(); }

        long nc (
        ) const { return m.nc(); }

        const M& m;
        const type s;
    };

    template <
        typename EXP,
        typename S
        >
    inline const typename enable_if_c<std::numeric_limits<typename EXP::type>::is_integer, matrix_div_scal_exp<EXP> >::type operator/ (
        const matrix_exp<EXP>& m,
        const S& s
    )
    {
        return matrix_div_scal_exp<EXP>(m.ref(),static_cast<typename EXP::type>(s));
    }

// ----------------------------------------------------------------------------------------

    template <typename M, bool use_reference >
    struct matrix_traits<matrix_mul_scal_exp<M,use_reference> >
    {
        typedef typename M::type type;
        typedef typename M::type const_ret_type;
        typedef typename M::mem_manager_type mem_manager_type;
        typedef typename M::layout_type layout_type;
        const static long NR = M::NR;
        const static long NC = M::NC;
        const static long cost = M::cost+1;
    };

    template <typename T, bool is_ref> struct conditional_reference { typedef T type; };
    template <typename T> struct conditional_reference<T,true>      { typedef T& type; };


    template <
        typename M,
        bool use_reference
        >
    class matrix_mul_scal_exp : public matrix_exp<matrix_mul_scal_exp<M,use_reference> >
    {
        /*!
            REQUIREMENTS ON M 
                - must be a matrix_exp object.

        !*/
    public:
        typedef typename matrix_traits<matrix_mul_scal_exp>::type type;
        typedef typename matrix_traits<matrix_mul_scal_exp>::const_ret_type const_ret_type;
        typedef typename matrix_traits<matrix_mul_scal_exp>::mem_manager_type mem_manager_type;
        const static long NR = matrix_traits<matrix_mul_scal_exp>::NR;
        const static long NC = matrix_traits<matrix_mul_scal_exp>::NC;
        const static long cost = matrix_traits<matrix_mul_scal_exp>::cost;
        typedef typename matrix_traits<matrix_mul_scal_exp>::layout_type layout_type;

        // You aren't allowed to multiply a matrix of matrices by a scalar.   
        COMPILE_TIME_ASSERT(is_matrix<type>::value == false);

        // This constructor exists simply for the purpose of causing a compile time error if
        // someone tries to create an instance of this object with the wrong kind of objects.
        template <typename T1>
        matrix_mul_scal_exp (T1, const type&); 

        matrix_mul_scal_exp (
            const M& m_,
            const type& s_
        ) :
            m(m_),
            s(s_)
        {}

        const type operator() (
            long r, 
            long c
        ) const { return m(r,c)*s; }

        inline const type operator() ( long i ) const 
        { return matrix_exp<matrix_mul_scal_exp>::operator()(i); }

        template <typename U>
        bool aliases (
            const matrix_exp<U>& item
        ) const { return m.aliases(item); }

        template <typename U>
        bool destructively_aliases (
            const matrix_exp<U>& item
        ) const { return m.destructively_aliases(item); }

        long nr (
        ) const { return m.nr(); }

        long nc (
        ) const { return m.nc(); }

        typedef typename conditional_reference<const M,use_reference>::type M_ref_type;

        M_ref_type m;
        const type s;
    };

    template <
        typename EXP,
        typename S 
        >
    inline typename disable_if<is_matrix<S>, const matrix_mul_scal_exp<EXP> >::type operator* (
        const matrix_exp<EXP>& m,
        const S& s
    )
    {
        typedef typename EXP::type type;
        return matrix_mul_scal_exp<EXP>(m.ref(),static_cast<type>(s));
    }

    template <
        typename EXP,
        typename S,
        bool B
        >
    inline typename disable_if<is_matrix<S>, const matrix_mul_scal_exp<EXP> >::type operator* (
        const matrix_mul_scal_exp<EXP,B>& m,
        const S& s
    )
    {
        typedef typename EXP::type type;
        return matrix_mul_scal_exp<EXP>(m.m,static_cast<type>(s)*m.s);
    }

    template <
        typename EXP,
        typename S 
        >
    inline typename disable_if<is_matrix<S>, const matrix_mul_scal_exp<EXP> >::type operator* (
        const S& s,
        const matrix_exp<EXP>& m
    )
    {
        typedef typename EXP::type type;
        return matrix_mul_scal_exp<EXP>(m.ref(),static_cast<type>(s));
    }

    template <
        typename EXP,
        typename S,
        bool B
        >
    inline typename disable_if<is_matrix<S>, const matrix_mul_scal_exp<EXP> >::type operator* (
        const S& s,
        const matrix_mul_scal_exp<EXP,B>& m
    )
    {
        typedef typename EXP::type type;
        return matrix_mul_scal_exp<EXP>(m.m,static_cast<type>(s)*m.s);
    }

    template <
        typename EXP ,
        typename S
        >
    inline const typename disable_if_c<std::numeric_limits<typename EXP::type>::is_integer, matrix_mul_scal_exp<EXP> >::type operator/ (
        const matrix_exp<EXP>& m,
        const S& s
    )
    {
        typedef typename EXP::type type;
        const type one = 1;
        return matrix_mul_scal_exp<EXP>(m.ref(),one/static_cast<type>(s));
    }

    template <
        typename EXP,
        bool B,
        typename S
        >
    inline const typename disable_if_c<std::numeric_limits<typename EXP::type>::is_integer, matrix_mul_scal_exp<EXP> >::type operator/ (
        const matrix_mul_scal_exp<EXP,B>& m,
        const S& s
    )
    {
        typedef typename EXP::type type;
        return matrix_mul_scal_exp<EXP>(m.m,m.s/static_cast<type>(s));
    }

// ----------------------------------------------------------------------------------------

    template <typename M>
    struct op_s_div_m : basic_op_m<M> 
    {
        typedef typename M::type type;

        op_s_div_m( const M& m_, const type& s_) : basic_op_m<M>(m_), s(s_){}

        const type s;

        const static long cost = M::cost+1;
        typedef const typename M::type const_ret_type;
        const_ret_type apply (long r, long c) const
        { 
            return s/this->m(r,c);
        }
    };

    template <
        typename EXP,
        typename S
        >
    const typename disable_if<is_matrix<S>, matrix_op<op_s_div_m<EXP> > >::type operator/ (
        const S& val,
        const matrix_exp<EXP>& m
    )
    {
        typedef typename EXP::type type;

        typedef op_s_div_m<EXP> op;
        return matrix_op<op>(op(m.ref(), static_cast<type>(val)));
    }

// ----------------------------------------------------------------------------------------

    template <
        typename EXP
        >
    inline const matrix_mul_scal_exp<EXP> operator- (
        const matrix_exp<EXP>& m
    )
    {
        return matrix_mul_scal_exp<EXP>(m.ref(),-1);
    }

    template <
        typename EXP,
        bool B
        >
    inline const matrix_mul_scal_exp<EXP> operator- (
        const matrix_mul_scal_exp<EXP,B>& m
    )
    {
        return matrix_mul_scal_exp<EXP>(m.m,-1*m.s);
    }

// ----------------------------------------------------------------------------------------

    template <typename M>
    struct op_add_scalar : basic_op_m<M> 
    {
        typedef typename M::type type;

        op_add_scalar( const M& m_, const type& s_) : basic_op_m<M>(m_), s(s_){}

        const type s;

        const static long cost = M::cost+1;
        typedef const typename M::type const_ret_type;
        const_ret_type apply (long r, long c) const
        { 
            return this->m(r,c) + s;
        }
    };

    template <
        typename EXP,
        typename T
        >
    const typename disable_if<is_matrix<T>, matrix_op<op_add_scalar<EXP> > >::type operator+ (
        const matrix_exp<EXP>& m,
        const T& val
    )
    {
        typedef typename EXP::type type;

        typedef op_add_scalar<EXP> op;
        return matrix_op<op>(op(m.ref(), static_cast<type>(val)));
    }

    template <
        typename EXP,
        typename T
        >
    const typename disable_if<is_matrix<T>, matrix_op<op_add_scalar<EXP> > >::type operator+ (
        const T& val,
        const matrix_exp<EXP>& m
    )
    {
        typedef typename EXP::type type;

        typedef op_add_scalar<EXP> op;
        return matrix_op<op>(op(m.ref(), static_cast<type>(val)));
    }

// ----------------------------------------------------------------------------------------

    template <typename M>
    struct op_subl_scalar : basic_op_m<M> 
    {
        typedef typename M::type type;

        op_subl_scalar( const M& m_, const type& s_) : basic_op_m<M>(m_), s(s_){}

        const type s;

        const static long cost = M::cost+1;
        typedef const typename M::type const_ret_type;
        const_ret_type apply (long r, long c) const
        { 
            return s - this->m(r,c) ;
        }
    };

    template <
        typename EXP,
        typename T
        >
    const typename disable_if<is_matrix<T>, matrix_op<op_subl_scalar<EXP> > >::type operator- (
        const T& val,
        const matrix_exp<EXP>& m
    )
    {
        typedef typename EXP::type type;

        typedef op_subl_scalar<EXP> op;
        return matrix_op<op>(op(m.ref(), static_cast<type>(val)));
    }

// ----------------------------------------------------------------------------------------

    template <typename M>
    struct op_subr_scalar : basic_op_m<M> 
    {
        typedef typename M::type type;

        op_subr_scalar( const M& m_, const type& s_) : basic_op_m<M>(m_), s(s_){}

        const type s;

        const static long cost = M::cost+1;
        typedef const typename M::type const_ret_type;
        const_ret_type apply (long r, long c) const
        { 
            return this->m(r,c) - s;
        }
    };

    template <
        typename EXP,
        typename T
        >
    const typename disable_if<is_matrix<T>, matrix_op<op_subr_scalar<EXP> > >::type operator- (
        const matrix_exp<EXP>& m,
        const T& val
    )
    {
        typedef typename EXP::type type;

        typedef op_subr_scalar<EXP> op;
        return matrix_op<op>(op(m.ref(), static_cast<type>(val)));
    }

// ----------------------------------------------------------------------------------------

    template <
        typename EXP1,
        typename EXP2
        >
    bool operator== (
        const matrix_exp<EXP1>& m1,
        const matrix_exp<EXP2>& m2
    )
    {
        if (m1.nr() == m2.nr() && m1.nc() == m2.nc())
        {
            for (long r = 0; r < m1.nr(); ++r)
            {
                for (long c = 0; c < m1.nc(); ++c)
                {
                    if (m1(r,c) != m2(r,c))
                        return false;
                }
            }
            return true;
        }
        return false;
    }

    template <
        typename EXP1,
        typename EXP2
        >
    inline bool operator!= (
        const matrix_exp<EXP1>& m1,
        const matrix_exp<EXP2>& m2
    ) { return !(m1 == m2); }

// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------

    template <
        typename T,
        long num_rows,
        long num_cols,
        typename mem_manager,
        typename layout
        >
    struct matrix_traits<matrix<T,num_rows, num_cols, mem_manager, layout> >
    {
        typedef T type;
        typedef const T& const_ret_type;
        typedef mem_manager mem_manager_type;
        typedef layout layout_type;
        const static long NR = num_rows;
        const static long NC = num_cols;
        const static long cost = 1;

    };

    template <
        typename T,
        long num_rows,
        long num_cols,
        typename mem_manager,
        typename layout
        >
    class matrix : public matrix_exp<matrix<T,num_rows,num_cols, mem_manager,layout> > 
    {

        COMPILE_TIME_ASSERT(num_rows >= 0 && num_cols >= 0); 

    public:
        typedef typename matrix_traits<matrix>::type type;
        typedef typename matrix_traits<matrix>::const_ret_type const_ret_type;
        typedef typename matrix_traits<matrix>::mem_manager_type mem_manager_type;
        typedef typename matrix_traits<matrix>::layout_type layout_type;
        const static long NR = matrix_traits<matrix>::NR;
        const static long NC = matrix_traits<matrix>::NC;
        const static long cost = matrix_traits<matrix>::cost;
        typedef T*          iterator;       
        typedef const T*    const_iterator; 

        matrix () 
        {
        }

        explicit matrix (
            long length 
        ) 
        {
            // This object you are trying to call matrix(length) on is not a column or 
            // row vector.
            COMPILE_TIME_ASSERT(NR == 1 || NC == 1);
            DLIB_ASSERT( length >= 0, 
                "\tmatrix::matrix(length)"
                << "\n\tlength must be at least 0"
                << "\n\tlength: " << length 
                << "\n\tNR:     " << NR 
                << "\n\tNC:     " << NC 
                << "\n\tthis:   " << this
                );

            if (NR == 1)
            {
                DLIB_ASSERT(NC == 0 || NC == length,
                    "\tmatrix::matrix(length)"
                    << "\n\tSince this is a statically sized matrix length must equal NC"
                    << "\n\tlength: " << length 
                    << "\n\tNR:     " << NR 
                    << "\n\tNC:     " << NC 
                    << "\n\tthis:   " << this
                    );

                data.set_size(1,length);
            }
            else
            {
                DLIB_ASSERT(NR == 0 || NR == length,
                    "\tvoid matrix::set_size(length)"
                    << "\n\tSince this is a statically sized matrix length must equal NR"
                    << "\n\tlength: " << length 
                    << "\n\tNR:     " << NR 
                    << "\n\tNC:     " << NC 
                    << "\n\tthis:   " << this
                    );

                data.set_size(length,1);
            }
        }

        matrix (
            long rows,
            long cols 
        )  
        {
            DLIB_ASSERT( (NR == 0 || NR == rows) && ( NC == 0 || NC == cols) && 
                    rows >= 0 && cols >= 0, 
                "\tvoid matrix::matrix(rows, cols)"
                << "\n\tYou have supplied conflicting matrix dimensions"
                << "\n\trows: " << rows
                << "\n\tcols: " << cols
                << "\n\tNR:   " << NR 
                << "\n\tNC:   " << NC 
                );
            data.set_size(rows,cols);
        }

        template <typename EXP>
        matrix (
            const matrix_exp<EXP>& m
        )
        {
            // You get an error on this line if the matrix m contains a type that isn't
            // the same as the type contained in the target matrix.
            COMPILE_TIME_ASSERT((is_same_type<typename EXP::type,type>::value == true) ||
                                (is_matrix<typename EXP::type>::value == true));

            // The matrix you are trying to assign m to is a statically sized matrix and 
            // m's dimensions don't match that of *this. 
            COMPILE_TIME_ASSERT(EXP::NR == NR || NR == 0 || EXP::NR == 0);
            COMPILE_TIME_ASSERT(EXP::NC == NC || NC == 0 || EXP::NC == 0);
            DLIB_ASSERT((NR == 0 || NR == m.nr()) && (NC == 0 || NC == m.nc()), 
                "\tmatrix& matrix::matrix(const matrix_exp& m)"
                << "\n\tYou are trying to assign a dynamically sized matrix to a statically sized matrix with the wrong size"
                << "\n\tNR:     " << NR
                << "\n\tNC:     " << NC
                << "\n\tm.nr(): " << m.nr()
                << "\n\tm.nc(): " << m.nc()
                << "\n\tthis:   " << this
                );

            data.set_size(m.nr(),m.nc());

            matrix_assign(*this, m);
        }

        matrix (
            const matrix& m
        ) : matrix_exp<matrix>(*this) 
        {
            data.set_size(m.nr(),m.nc());
            matrix_assign(*this, m);
        }

        template <typename U, size_t len>
        explicit matrix (
            U (&array)[len]
        ) 
        {
            COMPILE_TIME_ASSERT(NR*NC == len && len > 0);
            size_t idx = 0;
            for (long r = 0; r < NR; ++r)
            {
                for (long c = 0; c < NC; ++c)
                {
                    data(r,c) = static_cast<T>(array[idx]);
                    ++idx;
                }
            }
        }

        T& operator() (
            long r, 
            long c
        ) 
        { 
            DLIB_ASSERT(r < nr() && c < nc() &&
                   r >= 0 && c >= 0, 
                "\tT& matrix::operator(r,c)"
                << "\n\tYou must give a valid row and column"
                << "\n\tr:    " << r 
                << "\n\tc:    " << c
                << "\n\tnr(): " << nr()
                << "\n\tnc(): " << nc() 
                << "\n\tthis: " << this
                );
            return data(r,c); 
        }

        const T& operator() (
            long r, 
            long c
        ) const 
        { 
            DLIB_ASSERT(r < nr() && c < nc() &&
                   r >= 0 && c >= 0, 
                "\tconst T& matrix::operator(r,c)"
                << "\n\tYou must give a valid row and column"
                << "\n\tr:    " << r 
                << "\n\tc:    " << c
                << "\n\tnr(): " << nr()
                << "\n\tnc(): " << nc() 
                << "\n\tthis: " << this
                );
            return data(r,c);
        }

        T& operator() (
            long i
        ) 
        {
            // You can only use this operator on column vectors.
            COMPILE_TIME_ASSERT(NC == 1 || NC == 0 || NR == 1 || NR == 0);
            DLIB_ASSERT(nc() == 1 || nr() == 1, 
                "\tconst type matrix::operator(i)"
                << "\n\tYou can only use this operator on column or row vectors"
                << "\n\ti:    " << i
                << "\n\tnr(): " << nr()
                << "\n\tnc(): " << nc()
                << "\n\tthis: " << this
                );
            DLIB_ASSERT( 0 <= i && i < size(), 
                "\tconst type matrix::operator(i)"
                << "\n\tYou must give a valid row/column number"
                << "\n\ti:      " << i
                << "\n\tsize(): " << size()
                << "\n\tthis:   " << this
                );
            return data(i);
        }

        const T& operator() (
            long i
        ) const
        {
            // You can only use this operator on column vectors.
            COMPILE_TIME_ASSERT(NC == 1 || NC == 0 || NR == 1 || NR == 0);
            DLIB_ASSERT(nc() == 1 || nr() == 1, 
                "\tconst type matrix::operator(i)"
                << "\n\tYou can only use this operator on column or row vectors"
                << "\n\ti:    " << i
                << "\n\tnr(): " << nr()
                << "\n\tnc(): " << nc()
                << "\n\tthis: " << this
                );
            DLIB_ASSERT( 0 <= i && i < size(), 
                "\tconst type matrix::operator(i)"
                << "\n\tYou must give a valid row/column number"
                << "\n\ti:      " << i
                << "\n\tsize(): " << size()
                << "\n\tthis:   " << this
                );
            return data(i);
        }

        inline operator const type (
        ) const 
        {
            COMPILE_TIME_ASSERT(NC == 1 || NC == 0);
            COMPILE_TIME_ASSERT(NR == 1 || NR == 0);
            DLIB_ASSERT( nr() == 1 && nc() == 1 , 
                "\tmatrix::operator const type"
                << "\n\tYou can only attempt to implicit convert a matrix to a scalar if"
                << "\n\tthe matrix is a 1x1 matrix"
                << "\n\tnr(): " << nr() 
                << "\n\tnc(): " << nc() 
                << "\n\tthis: " << this
                );
            return data(0);
        }

        void set_size (
            long rows,
            long cols
        )
        {
            DLIB_ASSERT( (NR == 0 || NR == rows) && ( NC == 0 || NC == cols) &&
                    rows >= 0 && cols >= 0, 
                "\tvoid matrix::set_size(rows, cols)"
                << "\n\tYou have supplied conflicting matrix dimensions"
                << "\n\trows: " << rows
                << "\n\tcols: " << cols
                << "\n\tNR:   " << NR 
                << "\n\tNC:   " << NC 
                << "\n\tthis: " << this
                );
            if (nr() != rows || nc() != cols)
                data.set_size(rows,cols);
        }

        void set_size (
            long length
        )
        {
            // This object you are trying to call set_size(length) on is not a column or 
            // row vector.
            COMPILE_TIME_ASSERT(NR == 1 || NC == 1);
            DLIB_ASSERT( length >= 0, 
                "\tvoid matrix::set_size(length)"
                << "\n\tlength must be at least 0"
                << "\n\tlength: " << length 
                << "\n\tNR:     " << NR 
                << "\n\tNC:     " << NC 
                << "\n\tthis:   " << this
                );

            if (NR == 1)
            {
                DLIB_ASSERT(NC == 0 || NC == length,
                    "\tvoid matrix::set_size(length)"
                    << "\n\tSince this is a statically sized matrix length must equal NC"
                    << "\n\tlength: " << length 
                    << "\n\tNR:     " << NR 
                    << "\n\tNC:     " << NC 
                    << "\n\tthis:   " << this
                    );

                if (nc() != length)
                    data.set_size(1,length);
            }
            else
            {
                DLIB_ASSERT(NR == 0 || NR == length,
                    "\tvoid matrix::set_size(length)"
                    << "\n\tSince this is a statically sized matrix length must equal NR"
                    << "\n\tlength: " << length 
                    << "\n\tNR:     " << NR 
                    << "\n\tNC:     " << NC 
                    << "\n\tthis:   " << this
                    );

                if (nr() != length)
                    data.set_size(length,1);
            }
        }

        long nr (
        ) const { return data.nr(); }

        long nc (
        ) const { return data.nc(); }

        long size (
        ) const { return data.nr()*data.nc(); }

        template <typename U, size_t len>
        matrix& operator= (
            U (&array)[len]
        )
        {
            COMPILE_TIME_ASSERT(NR*NC == len && len > 0);
            size_t idx = 0;
            for (long r = 0; r < NR; ++r)
            {
                for (long c = 0; c < NC; ++c)
                {
                    data(r,c) = static_cast<T>(array[idx]);
                    ++idx;
                }
            }
            return *this;
        }

        template <typename EXP>
        matrix& operator= (
            const matrix_exp<EXP>& m
        )
        {
            // You get an error on this line if the matrix you are trying to 
            // assign m to is a statically sized matrix and  m's dimensions don't 
            // match that of *this. 
            COMPILE_TIME_ASSERT(EXP::NR == NR || NR == 0 || EXP::NR == 0);
            COMPILE_TIME_ASSERT(EXP::NC == NC || NC == 0 || EXP::NC == 0);
            DLIB_ASSERT((NR == 0 || nr() == m.nr()) && 
                   (NC == 0 || nc() == m.nc()), 
                "\tmatrix& matrix::operator=(const matrix_exp& m)"
                << "\n\tYou are trying to assign a dynamically sized matrix to a statically sized matrix with the wrong size"
                << "\n\tnr():   " << nr()
                << "\n\tnc():   " << nc()
                << "\n\tm.nr(): " << m.nr()
                << "\n\tm.nc(): " << m.nc()
                << "\n\tthis:   " << this
                );

            // You get an error on this line if the matrix m contains a type that isn't
            // the same as the type contained in the target matrix.
            COMPILE_TIME_ASSERT((is_same_type<typename EXP::type,type>::value == true) ||
                                (is_matrix<typename EXP::type>::value == true));
            if (m.destructively_aliases(*this) == false)
            {
                // This if statement is seemingly unnecessary since set_size() contains this
                // exact same if statement.  However, structuring the code this way causes
                // gcc to handle the way it inlines this function in a much more favorable way.
                if (data.nr() == m.nr() && data.nc() == m.nc())
                {
                    matrix_assign(*this, m);
                }
                else
                {
                    set_size(m.nr(),m.nc());
                    matrix_assign(*this, m);
                }
            }
            else
            {
                // we have to use a temporary matrix object here because
                // *this is aliased inside the matrix_exp m somewhere.
                matrix temp;
                temp.set_size(m.nr(),m.nc());
                matrix_assign(temp, m);
                temp.swap(*this);
            }
            return *this;
        }

        template <typename EXP>
        matrix& operator += (
            const matrix_exp<EXP>& m
        )
        {
            // The matrix you are trying to assign m to is a statically sized matrix and 
            // m's dimensions don't match that of *this. 
            COMPILE_TIME_ASSERT(EXP::NR == NR || NR == 0 || EXP::NR == 0);
            COMPILE_TIME_ASSERT(EXP::NC == NC || NC == 0 || EXP::NC == 0);
            COMPILE_TIME_ASSERT((is_same_type<typename EXP::type,type>::value == true));
            if (nr() == m.nr() && nc() == m.nc())
            {
                if (m.destructively_aliases(*this) == false)
                {
                    matrix_assign(*this, *this + m);
                }
                else
                {
                    // we have to use a temporary matrix object here because
                    // this->data is aliased inside the matrix_exp m somewhere.
                    matrix temp;
                    temp.set_size(m.nr(),m.nc());
                    matrix_assign(temp, *this + m);
                    temp.swap(*this);
                }
            }
            else
            {
                *this = m;
            }
            return *this;
        }


        template <typename EXP>
        matrix& operator -= (
            const matrix_exp<EXP>& m
        )
        {
            // The matrix you are trying to assign m to is a statically sized matrix and 
            // m's dimensions don't match that of *this. 
            COMPILE_TIME_ASSERT(EXP::NR == NR || NR == 0 || EXP::NR == 0);
            COMPILE_TIME_ASSERT(EXP::NC == NC || NC == 0 || EXP::NC == 0);
            COMPILE_TIME_ASSERT((is_same_type<typename EXP::type,type>::value == true));
            if (nr() == m.nr() && nc() == m.nc())
            {
                if (m.destructively_aliases(*this) == false)
                {
                    matrix_assign(*this, *this - m);
                }
                else
                {
                    // we have to use a temporary matrix object here because
                    // this->data is aliased inside the matrix_exp m somewhere.
                    matrix temp;
                    temp.set_size(m.nr(),m.nc());
                    matrix_assign(temp, *this - m);
                    temp.swap(*this);
                }
            }
            else
            {
                *this = -m;
            }
            return *this;
        }

        template <typename EXP>
        matrix& operator *= (
            const matrix_exp<EXP>& m
        )
        {
            *this = *this * m;
            return *this;
        }

        matrix& operator += (
            const matrix& m
        )
        {
            const long size = m.nr()*m.nc();
            if (nr() == m.nr() && nc() == m.nc())
            {
                for (long i = 0; i < size; ++i)
                    data(i) += m.data(i);
            }
            else
            {
                set_size(m.nr(), m.nc());
                for (long i = 0; i < size; ++i)
                    data(i) = m.data(i);
            }
            return *this;
        }

        matrix& operator -= (
            const matrix& m
        )
        {
            const long size = m.nr()*m.nc();
            if (nr() == m.nr() && nc() == m.nc())
            {
                for (long i = 0; i < size; ++i)
                    data(i) -= m.data(i);
            }
            else
            {
                set_size(m.nr(), m.nc());
                for (long i = 0; i < size; ++i)
                    data(i) = -m.data(i);
            }
            return *this;
        }

        matrix& operator += (
            const T val
        )
        {
            const long size = nr()*nc();
            for (long i = 0; i < size; ++i)
                data(i) += val;

            return *this;
        }

        matrix& operator -= (
            const T val
        )
        {
            const long size = nr()*nc();
            for (long i = 0; i < size; ++i)
                data(i) -= val;

            return *this;
        }

        matrix& operator *= (
            const T a
        )
        {
            *this = *this * a;
            return *this;
        }

        matrix& operator /= (
            const T a
        )
        {
            *this = *this / a;
            return *this;
        }

        matrix& operator= (
            const matrix& m
        )
        {
            if (this != &m)
            {
                set_size(m.nr(),m.nc());
                const long size = m.nr()*m.nc();
                for (long i = 0; i < size; ++i)
                    data(i) = m.data(i);
            }
            return *this;
        }

        void swap (
            matrix& item
        )
        {
            data.swap(item.data);
        }

        template <typename U>
        bool aliases (
            const matrix_exp<U>& 
        ) const { return false; }

        bool aliases (
            const matrix_exp<matrix<T,num_rows,num_cols, mem_manager,layout> >& item
        ) const { return (this == &item); }

        template <typename U>
        bool destructively_aliases (
            const matrix_exp<U>& 
        ) const { return false; }


        iterator begin() 
        {
            if (size() != 0)
                return &data(0,0);
            else
                return 0;
        }

        iterator end()
        {
            if (size() != 0)
                return &data(0,0)+size();
            else
                return 0;
        }

        const_iterator begin()  const
        {
            if (size() != 0)
                return &data(0,0);
            else
                return 0;
        }

        const_iterator end() const
        {
            if (size() != 0)
                return &data(0,0)+size();
            else
                return 0;
        }

    private:
        struct literal_assign_helper
        {
            /*
                This struct is a helper struct returned by the operator<<() function below.  It is
                used primarily to enable us to put DLIB_CASSERT statements on the usage of the
                operator<< form of matrix assignment.
            */

            literal_assign_helper(const literal_assign_helper& item) : m(item.m), r(item.r), c(item.c), has_been_used(false) {}
            explicit literal_assign_helper(matrix* m_): m(m_), r(0), c(0),has_been_used(false) {next();}
            ~literal_assign_helper()
            {
                DLIB_CASSERT(!has_been_used || r == m->nr(),
                             "You have used the matrix comma based assignment incorrectly by failing to\n"
                             "supply a full set of values for every element of a matrix object.\n");
            }

            const literal_assign_helper& operator, (
                const T& val
            ) const
            {
                DLIB_CASSERT(r < m->nr() && c < m->nc(),
                             "You have used the matrix comma based assignment incorrectly by attempting to\n" <<
                             "supply more values than there are elements in the matrix object being assigned to.\n\n" <<
                             "Did you forget to call set_size()?" 
                             << "\n\t r: " << r 
                             << "\n\t c: " << c 
                             << "\n\t m->nr(): " << m->nr()
                             << "\n\t m->nc(): " << m->nc());
                (*m)(r,c) = val;
                next();
                has_been_used = true;
                return *this;
            }

        private:

            friend class matrix;

            void next (
            ) const
            {
                ++c;
                if (c == m->nc())
                {
                    c = 0;
                    ++r;
                }
            }

            matrix* m;
            mutable long r;
            mutable long c;
            mutable bool has_been_used;
        };

    public:

        matrix& operator = (
            const literal_assign_helper& val
        ) 
        {  
            *this = *val.m;
            return *this;
        }

        const literal_assign_helper operator = (
            const T& val
        ) 
        {  
            // assign the given value to every spot in this matrix
            for (long r = 0; r < nr(); ++r)
            {
                for (long c = 0; c < nc(); ++c)
                {
                    data(r,c) = val;
                }
            }

            // Now return the literal_assign_helper so that the user
            // can use the overloaded comma notation to initialize 
            // the matrix if they want to.
            return literal_assign_helper(this); 
        }

    private:


        typename layout::template layout<T,NR,NC,mem_manager> data;
    };

// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------

    template <
        typename T,
        long NR,
        long NC,
        typename mm,
        typename l
        >
    void swap(
        matrix<T,NR,NC,mm,l>& a,
        matrix<T,NR,NC,mm,l>& b
    ) { a.swap(b); }

    template <
        typename T,
        long NR,
        long NC,
        typename mm,
        typename l
        >
    void serialize (
        const matrix<T,NR,NC,mm,l>& item, 
        std::ostream& out
    )
    {
        try
        {
            // The reason the serialization is a little funny is because we are trying to
            // maintain backwards compatibility with an older serialization format used by
            // dlib while also encoding things in a way that lets the array2d and matrix
            // objects have compatible serialization formats.
            serialize(-item.nr(),out);
            serialize(-item.nc(),out);
            for (long r = 0; r < item.nr(); ++r)
            {
                for (long c = 0; c < item.nc(); ++c)
                {
                    serialize(item(r,c),out);
                }
            }
        }
        catch (serialization_error& e)
        {
            throw serialization_error(e.info + "\n   while serializing dlib::matrix");
        }
    }

    template <
        typename T,
        long NR,
        long NC,
        typename mm,
        typename l
        >
    void deserialize (
        matrix<T,NR,NC,mm,l>& item, 
        std::istream& in
    )
    {
        try
        {
            long nr, nc;
            deserialize(nr,in); 
            deserialize(nc,in); 

            // this is the newer serialization format
            if (nr < 0 || nc < 0)
            {
                nr *= -1;
                nc *= -1;
            }

            if (NR != 0 && nr != NR)
                throw serialization_error("Error while deserializing a dlib::matrix.  Invalid rows");
            if (NC != 0 && nc != NC)
                throw serialization_error("Error while deserializing a dlib::matrix.  Invalid columns");

            item.set_size(nr,nc);
            for (long r = 0; r < nr; ++r)
            {
                for (long c = 0; c < nc; ++c)
                {
                    deserialize(item(r,c),in);
                }
            }
        }
        catch (serialization_error& e)
        {
            throw serialization_error(e.info + "\n   while deserializing a dlib::matrix");
        }
    }

    template <
        typename EXP
        >
    std::ostream& operator<< (
        std::ostream& out,
        const matrix_exp<EXP>& m
    )
    {
        using namespace std;
        const streamsize old = out.width();

        // first figure out how wide we should make each field
        string::size_type w = 0;
        ostringstream sout;
        for (long r = 0; r < m.nr(); ++r)
        {
            for (long c = 0; c < m.nc(); ++c)
            {
                sout << m(r,c); 
                w = std::max(sout.str().size(),w);
                sout.str("");
            }
        }

        // now actually print it
        for (long r = 0; r < m.nr(); ++r)
        {
            for (long c = 0; c < m.nc(); ++c)
            {
                out.width(static_cast<streamsize>(w));
                out << m(r,c) << " ";
            }
            out << "\n";
        }
        out.width(old);
        return out;
    }

    /*
    template <
        typename T, 
        long NR, 
        long NC,
        typename MM,
        typename L
        >
    std::istream& operator>> (
        std::istream& in,
        matrix<T,NR,NC,MM,L>& m
    );

    This function is defined inside the matrix_read_from_istream.h file.
    */

// ----------------------------------------------------------------------------------------

    class print_matrix_as_csv_helper 
    {
        /*!
            This object is used to define an io manipulator for matrix expressions.
            In particular, this code allows you to write statements like:
                cout << csv << yourmatrix;
            and have it print the matrix with commas separating each element.
        !*/
    public:
        print_matrix_as_csv_helper (std::ostream& out_) : out(out_) {}

        template <typename EXP>
        std::ostream& operator<< (
            const matrix_exp<EXP>& m
        ) 
        {
            for (long r = 0; r < m.nr(); ++r)
            {
                for (long c = 0; c < m.nc(); ++c)
                {
                    if (c+1 == m.nc())
                        out << m(r,c) << "\n";
                    else
                        out << m(r,c) << ", ";
                }
            }
            return out;
        }

    private:
        std::ostream& out;
    };

    class print_matrix_as_csv {};
    const print_matrix_as_csv csv = print_matrix_as_csv();
    inline print_matrix_as_csv_helper operator<< (
        std::ostream& out,
        const print_matrix_as_csv& 
    )
    {
        return print_matrix_as_csv_helper(out);
    }

// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------

    template <typename EXP>
    class const_temp_matrix;

    template <
        typename EXP
        >
    struct matrix_traits<const_temp_matrix<EXP> >
    {
        typedef typename EXP::type type;
        typedef typename EXP::const_ret_type const_ret_type;
        typedef typename EXP::mem_manager_type mem_manager_type;
        typedef typename EXP::layout_type layout_type;
        const static long NR = EXP::NR;
        const static long NC = EXP::NC;
        const static long cost = 1;
    };

    template <typename EXP>
    class const_temp_matrix : public matrix_exp<const_temp_matrix<EXP> >, noncopyable 
    {
    public:
        typedef typename matrix_traits<const_temp_matrix>::type type;
        typedef typename matrix_traits<const_temp_matrix>::const_ret_type const_ret_type;
        typedef typename matrix_traits<const_temp_matrix>::mem_manager_type mem_manager_type;
        typedef typename matrix_traits<const_temp_matrix>::layout_type layout_type;
        const static long NR = matrix_traits<const_temp_matrix>::NR;
        const static long NC = matrix_traits<const_temp_matrix>::NC;
        const static long cost = matrix_traits<const_temp_matrix>::cost;

        const_temp_matrix (
            const matrix_exp<EXP>& item
        ) :
            ref_(item.ref())
        {}
        const_temp_matrix (
            const EXP& item
        ) :
            ref_(item)
        {}

        const_ret_type operator() (
            long r, 
            long c
        ) const { return ref_(r,c); }

        const_ret_type operator() ( long i ) const 
        { return ref_(i); }

        template <typename U>
        bool aliases (
            const matrix_exp<U>& item
        ) const { return ref_.aliases(item); }

        template <typename U>
        bool destructively_aliases (
            const matrix_exp<U>& item
        ) const { return ref_.destructively_aliases(item); }

        long nr (
        ) const { return ref_.nr(); }

        long nc (
        ) const { return ref_.nc(); }

    private:

        typename conditional_matrix_temp<const EXP, (EXP::cost <= 1)>::type ref_;
    };

// ----------------------------------------------------------------------------------------

}

#ifdef _MSC_VER
// put that warning back to its default setting
#pragma warning(default : 4355)
#endif

#endif // DLIB_MATRIx_

