// Copyright (C) 2008  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#ifndef DLIB_MATRIx_ASSIGn_
#define DLIB_MATRIx_ASSIGn_

#include "matrix.h"
#include "matrix_utilities.h"
#include "matrix_subexp.h"
#include "../enable_if.h"
#include "matrix_assign_fwd.h"
#include "matrix_default_mul.h"
#include "matrix_conj_trans.h"
#include "matrix_mat.h"

namespace dlib
{
    /*
        This file contains some templates that are used inside the matrix_blas_bindings.h
        file to bind various matrix expressions to optimized code for carrying them out.
    */

// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------

    namespace blas_bindings 
    {

    // ------------------------------------------------------------------------------------

        template <typename T>
        void zero_matrix (
            T& m
        )
        {
            for (long r = 0; r < m.nr(); ++r)
            {
                for (long c = 0; c < m.nc(); ++c)
                {
                    m(r,c) = 0;
                }
            }
        }

    // ------------------------------------------------------------------------------------

    // This template struct is used to tell us if a matrix expression contains a matrix multiply.
        template <typename T>
        struct has_matrix_multiply
        {
            const static bool value = false;
        };

        template <typename T, typename U> 
        struct has_matrix_multiply<matrix_multiply_exp<T,U> > 
        { const static bool value = true; };

        template <typename T, typename U> 
        struct has_matrix_multiply<matrix_add_exp<T,U> >  
        { const static bool value = has_matrix_multiply<T>::value || has_matrix_multiply<U>::value; };

        template <typename T, typename U> 
        struct has_matrix_multiply<matrix_subtract_exp<T,U> >  
        { const static bool value = has_matrix_multiply<T>::value || has_matrix_multiply<U>::value; };

        template <typename T, bool Tb> 
        struct has_matrix_multiply<matrix_mul_scal_exp<T,Tb> >  
        { const static bool value = true; };

        template <typename T> 
        struct has_matrix_multiply<matrix_div_scal_exp<T> >  
        { const static bool value = has_matrix_multiply<T>::value; };

        template <typename T> 
        struct has_matrix_multiply<matrix_op<T> >  
        { const static bool value = has_matrix_multiply<T>::value; };

        template <typename T> 
        struct has_matrix_multiply<op_trans<T> >  
        { const static bool value = has_matrix_multiply<T>::value; };

        template <typename T> 
        struct has_matrix_multiply<op_conj_trans<T> >  
        { const static bool value = has_matrix_multiply<T>::value; };

        template <typename T> 
        struct has_matrix_multiply<op_conj<T> >  
        { const static bool value = has_matrix_multiply<T>::value; };

    // ------------------------------------------------------------------------------------
    // ------------------------------------------------------------------------------------
    // ------------------------------------------------------------------------------------

        const int unknown_matrix = 0;
        const int general_matrix = 1;
        const int row_matrix = 2;
        const int column_matrix = 3;

    // ------------------------------------------------------------------------------------

        template <typename T>
        struct matrix_type_id
        {
            const static int value = unknown_matrix;
        };

        template <typename T, long NR, long NC, typename MM, typename L>
        struct matrix_type_id<matrix<T,NR,NC,MM,L> >
        {
            const static int value = general_matrix;
        };

        template <typename T, long NR, typename MM, typename L>
        struct matrix_type_id<matrix<T,NR,1,MM,L> >
        {
            const static int value = column_matrix;
        };

        template <typename T, typename MM, typename L>
        struct matrix_type_id<matrix<T,1,1,MM,L> >
        {
            const static int value = column_matrix;
        };

        template <typename T, long NC, typename MM, typename L>
        struct matrix_type_id<matrix<T,1,NC,MM,L> >
        {
            const static int value = row_matrix;
        };

    // ------------------------------------------------------------------------------------

        template <typename T, long NR, long NC, typename MM, typename L>
        struct matrix_type_id<matrix_op<op_colm<matrix<T,NR,NC,MM,L> > > >
        {
            const static int value = column_matrix;
        };

        template <typename T, long NR, long NC, typename MM, typename L>
        struct matrix_type_id<matrix_op<op_rowm<matrix<T,NR,NC,MM,L> > > >
        {
            const static int value = row_matrix;
        };

        template <typename T, long NR, long NC, typename MM, typename L>
        struct matrix_type_id<matrix_op<op_colm2<matrix<T,NR,NC,MM,L> > > >
        {
            const static int value = column_matrix;
        };

        template <typename T, long NR, long NC, typename MM, typename L>
        struct matrix_type_id<matrix_op<op_rowm2<matrix<T,NR,NC,MM,L> > > >
        {
            const static int value = row_matrix;
        };

        template <typename T, long NR, long NC, typename MM, typename L>
        struct matrix_type_id<matrix_op<op_subm<matrix<T,NR,NC,MM,L> > > >
        {
            const static int value = general_matrix;
        };

        template < typename T, typename MM >
        struct matrix_type_id<matrix_op<op_array2d_to_mat<array2d<T,MM> > > >
        { const static int value = general_matrix; };

        template < typename T, typename MM >
        struct matrix_type_id<matrix_op<op_array_to_mat<array<T,MM> > > >
        { const static int value = column_matrix; };

        template < typename value_type, typename alloc >
        struct matrix_type_id<matrix_op<op_std_vect_to_mat<std::vector<value_type,alloc> > > >
        { const static int value = column_matrix; };

        template < typename value_type, typename alloc >
        struct matrix_type_id<matrix_op<op_std_vect_to_mat<std_vector_c<value_type,alloc> > > >
        { const static int value = column_matrix; };

        template < typename T >
        struct matrix_type_id<matrix_op<op_pointer_to_col_vect<T> > >
        { const static int value = column_matrix; };
        template < typename T >
        struct matrix_type_id<matrix_op<op_pointer_to_mat<T> > >
        { const static int value = general_matrix; };

    // ------------------------------------------------------------------------------------

        template <typename T, typename U>
        struct same_matrix
        {
            const static int T_id = matrix_type_id<T>::value;
            const static int U_id = matrix_type_id<U>::value;
            // The check for unknown_matrix is here so that we can be sure that matrix types
            // other than the ones specifically enumerated above never get pushed into
            // any of the BLAS bindings.  So saying they are never the same as anything
            // else prevents them from matching any of the BLAS bindings.
            const static bool value = (T_id == U_id) && (T_id != unknown_matrix);
        };

    // ------------------------------------------------------------------------------------
    // ------------------------------------------------------------------------------------
    // ------------------------------------------------------------------------------------

    // This template struct is used to tell us if two matrix expressions both contain the same
    // sequence of operators, expressions.    It also only has a value of true if the T expression
    // contains only matrices with the given layout. 
        template <typename T, typename U, typename layout>
        struct same_exp
        {
            const static bool value = (is_same_type<typename T::exp_type, typename U::exp_type>::value ||
                                       same_matrix<typename T::exp_type, typename U::exp_type>::value) &&
                                is_same_type<typename T::layout_type,layout>::value;

        };

        // Used only below.  They help strip off the const and & qualifiers that can show up 
        // in the LHS_ref_type and RHS_ref_type typedefs.
        template <typename T> struct noref{ typedef T type;};
        template <typename T> struct noref<T&>{ typedef T type;}; 
        template <typename T> struct noref<const T&>{ typedef T type;}; 
        template <typename T> struct noref<const T>{ typedef T type;}; 

        template <typename Tlhs, typename Ulhs, typename Trhs, typename Urhs, typename layout> 
        struct same_exp<matrix_multiply_exp<Tlhs,Trhs>, matrix_multiply_exp<Ulhs,Urhs>,layout > 
        { 
            // The reason this case is more complex than the others is because the matrix_multiply_exp 
            // will use a temporary matrix instead of Tlhs or Trhs in the event that one of these 
            // types corresponds to an expensive expression.  So we have to use the type that really
            // gets used.  The following typedefs are here to pick out that true type.
            typedef typename matrix_multiply_exp<Tlhs,Trhs>::LHS_ref_type T_LHS_ref_type;
            typedef typename matrix_multiply_exp<Tlhs,Trhs>::RHS_ref_type T_RHS_ref_type;
            typedef typename noref<T_LHS_ref_type>::type T_lhs_type;
            typedef typename noref<T_RHS_ref_type>::type T_rhs_type;

            typedef typename matrix_multiply_exp<Ulhs,Urhs>::LHS_ref_type U_LHS_ref_type;
            typedef typename matrix_multiply_exp<Ulhs,Urhs>::RHS_ref_type U_RHS_ref_type;
            typedef typename noref<U_LHS_ref_type>::type U_lhs_type;
            typedef typename noref<U_RHS_ref_type>::type U_rhs_type;

            const static bool value = same_exp<T_lhs_type,U_lhs_type,layout>::value && 
                                      same_exp<T_rhs_type,U_rhs_type,layout>::value; 
        };

        template <typename Tlhs, typename Ulhs, typename Trhs, typename Urhs, typename layout> 
        struct same_exp<matrix_add_exp<Tlhs,Trhs>, matrix_add_exp<Ulhs,Urhs>, layout > 
        { const static bool value = same_exp<Tlhs,Ulhs,layout>::value && same_exp<Trhs,Urhs,layout>::value; };

        template <typename Tlhs, typename Ulhs, typename Trhs, typename Urhs, typename layout> 
        struct same_exp<matrix_subtract_exp<Tlhs,Trhs>, matrix_subtract_exp<Ulhs,Urhs>, layout > 
        { const static bool value = same_exp<Tlhs,Ulhs,layout>::value && same_exp<Trhs,Urhs,layout>::value; };

        template <typename T, typename U, bool Tb, bool Ub, typename layout> 
        struct same_exp<matrix_mul_scal_exp<T,Tb>, matrix_mul_scal_exp<U,Ub>, layout > 
        { const static bool value = same_exp<T,U,layout>::value; };

        template <typename T, typename U, typename layout> 
        struct same_exp<matrix_div_scal_exp<T>, matrix_div_scal_exp<U>, layout > 
        { const static bool value = same_exp<T,U,layout>::value; };

        template <typename T, typename U, typename layout> 
        struct same_exp<matrix_op<op_trans<T> >, matrix_op<op_trans<U> >, layout > 
        { const static bool value = same_exp<T,U,layout>::value; };

        template <typename T, typename U, typename layout> 
        struct same_exp<matrix_op<op_conj<T> >, matrix_op<op_conj<U> >, layout > 
        { const static bool value = same_exp<T,U,layout>::value; };

        template <typename T, typename U, typename layout> 
        struct same_exp<matrix_op<op_conj_trans<T> >, matrix_op<op_conj_trans<U> >, layout > 
        { const static bool value = same_exp<T,U,layout>::value; };

    // ------------------------------------------------------------------------------------

        struct yes_type
        {
            char ch;
        };
        struct no_type
        {
            yes_type a, b;
        };

        // This is a helper that is used below to apply the same_exp template to matrix expressions.
        template <typename T, typename layout, typename U>
        typename enable_if<same_exp<T,U,layout>,yes_type>::type test(U);
        template <typename T, typename layout, typename U>
        typename disable_if<same_exp<T,U,layout>,no_type>::type test(U);

    // ------------------------------------------------------------------------------------

        template <
            typename dest_exp,
            typename src_exp,
            typename enabled = void
            >
        struct matrix_assign_blas_helper
        {
            // We are in the default version of the blas helper so this
            // means there wasn't any more specific overload.  So just
            // let the default matrix assignment happen.
            template <typename EXP>
            static void assign (
                dest_exp& dest,
                const EXP& src,
                typename src_exp::type alpha,
                bool add_to,
                bool transpose
            )
            {
                if (transpose == false)
                    matrix_assign_default(dest,src,alpha,add_to);
                else
                    matrix_assign_default(dest,trans(src),alpha,add_to);
            }

            // If we know this is a matrix multiply then apply the
            // default dlib matrix multiply to speed things up a bit more
            // than the above default function would.
            template <typename EXP1, typename EXP2>
            static void assign (
                dest_exp& dest,
                const matrix_multiply_exp<EXP1,EXP2>& src,
                typename src_exp::type alpha,
                bool add_to,
                bool transpose
            )
            {
                // At some point I need to improve the default (i.e. non BLAS) matrix 
                // multiplication algorithm...

                if (alpha == static_cast<typename src_exp::type>(1))
                {
                    if (add_to == false)
                    {
                        zero_matrix(dest);
                    }

                    if (transpose == false)
                        default_matrix_multiply(dest, src.lhs, src.rhs);
                    else
                        default_matrix_multiply(dest, trans(src.rhs), trans(src.lhs));
                }
                else
                {
                    if (add_to)
                    {
                        typename dest_exp::matrix_type temp(dest.nr(),dest.nc());
                        zero_matrix(temp);

                        if (transpose == false)
                            default_matrix_multiply(temp, src.lhs, src.rhs);
                        else
                            default_matrix_multiply(temp, trans(src.rhs), trans(src.lhs));

                        matrix_assign_default(dest,temp, alpha,true);
                    }
                    else
                    {
                        zero_matrix(dest);
                        
                        if (transpose == false)
                            default_matrix_multiply(dest, src.lhs, src.rhs);
                        else
                            default_matrix_multiply(dest, trans(src.rhs), trans(src.lhs));

                        matrix_assign_default(dest,dest, alpha, false);
                    }
                }
            }
        };

        // This is a macro to help us add overloads for the matrix_assign_blas_helper template.  
        // Using this macro it is easy to add overloads for arbitrary matrix expressions.
#define DLIB_ADD_BLAS_BINDING(src_expression)                                               \
    template <typename T, typename L> struct BOOST_JOIN(blas,__LINE__)                      \
    { const static bool value = sizeof(yes_type) == sizeof(test<T,L>(src_expression)); };   \
                                                                                            \
    template < typename dest_exp, typename src_exp >                                       \
    struct matrix_assign_blas_helper<dest_exp, src_exp,                                    \
    typename enable_if<BOOST_JOIN(blas,__LINE__)<src_exp,typename dest_exp::layout_type> >::type > {   \
        static void assign (                                                                \
            dest_exp& dest,                                                                \
            const src_exp& src,                                                             \
            typename src_exp::type alpha,                                                   \
            bool add_to,                                                                    \
            bool DLIB_NO_WARN_UNUSED transpose                      \
        ) {                                                                                 \
            DLIB_NO_WARN_UNUSED typedef typename dest_exp::type T;                                             

#define DLIB_END_BLAS_BINDING }};

    // ------------------------------------------------------------------------------------
    // ------------------------------------------------------------------------------------
    // ------------------------------------------------------------------------------------

    // ------------------- Forward Declarations -------------------

        template <
            typename dest_exp,
            typename src_exp 
            >
        void matrix_assign_blas_proxy (
            dest_exp& dest,
            const src_exp& src,
            typename src_exp::type alpha,
            bool add_to,
            bool transpose
        );
        /*!
            requires
                - src.aliases(dest) == false
                - dest.nr() == src.nr()
                - dest.nc() == src.nc()
        !*/

        template <
            typename dest_exp,
            typename src_exp, typename src_exp2 
            >
        void matrix_assign_blas_proxy (
            dest_exp& dest,
            const matrix_add_exp<src_exp, src_exp2>& src,
            typename src_exp::type alpha,
            bool add_to,
            bool transpose
        );
        /*!
            requires
                - src.aliases(dest) == false
                - dest.nr() == src.nr()
                - dest.nc() == src.nc()
        !*/

        template <
            typename dest_exp,
            typename src_exp, bool Sb 
            >
        void matrix_assign_blas_proxy (
            dest_exp& dest,
            const matrix_mul_scal_exp<src_exp,Sb>& src,
            typename src_exp::type alpha,
            bool add_to,
            bool transpose
        );
        /*!
            requires
                - src.aliases(dest) == false
                - dest.nr() == src.nr()
                - dest.nc() == src.nc()
        !*/

        template <
            typename dest_exp,
            typename src_exp
            >
        void matrix_assign_blas_proxy (
            dest_exp& dest,
            const matrix_op<op_trans<src_exp> >& src,
            typename src_exp::type alpha,
            bool add_to,
            bool transpose
        );
        /*!
            requires
                - src.aliases(dest) == false
                - dest.nr() == src.nr()
                - dest.nc() == src.nc()
        !*/

        template <
            typename dest_exp,
            typename src_exp, typename src_exp2 
            >
        void matrix_assign_blas_proxy (
            dest_exp& dest,
            const matrix_subtract_exp<src_exp, src_exp2>& src,
            typename src_exp::type alpha,
            bool add_to,
            bool transpose
        );
        /*!
            requires
                - src.aliases(dest) == false
                - dest.nr() == src.nr()
                - dest.nc() == src.nc()
        !*/

    // ------------------------------------------------------------------------------------

        template <
            typename T, long NR, long NC, typename MM, typename L,
            typename src_exp 
            >
        void matrix_assign_blas (
            matrix<T,NR,NC,MM,L>& dest,
            const src_exp& src
        );

        template <
            typename T, long NR, long NC, typename MM, typename L,
            typename src_exp 
            >
        void matrix_assign_blas (
            matrix<T,NR,NC,MM,L>& dest,
            const matrix_add_exp<matrix<T,NR,NC,MM,L> ,src_exp>& src
        );
        /*!
            This function catches the expressions of the form:  
                M = M + exp; 
            and converts them into the appropriate matrix_assign_blas() call.
            This is an important case to catch because it is the expression used
            to represent the += matrix operator.
        !*/

        template <
            typename T, long NR, long NC, typename MM, typename L,
            typename src_exp 
            >
        void matrix_assign_blas (
            matrix<T,NR,NC,MM,L>& dest,
            const matrix_add_exp<src_exp, matrix<T,NR,NC,MM,L> >& src
        );
        /*!
            This function catches the expressions of the form:  
                M = exp + M; 
            and converts them into the appropriate matrix_assign_blas() call.
            This is an important case to catch because it is the expression used
            to represent the += matrix operator.
        !*/
            
        template <
            typename T, long NR, long NC, typename MM, typename L,
            typename src_exp 
            >
        void matrix_assign_blas (
            matrix<T,NR,NC,MM,L>& dest,
            const matrix_subtract_exp<matrix<T,NR,NC,MM,L> ,src_exp>& src
        );
        /*!
            This function catches the expressions of the form:  
                M = M - exp; 
            and converts them into the appropriate matrix_assign_blas() call.
            This is an important case to catch because it is the expression used
            to represent the -= matrix operator.
        !*/


        //   End of forward declarations for overloaded matrix_assign_blas functions

    // ------------------------------------------------------------------------------------
    // ------------------------------------------------------------------------------------
    // ------------------------------------------------------------------------------------

        template <
            typename dest_exp,
            typename src_exp 
            >
        void matrix_assign_blas_proxy (
            dest_exp& dest,
            const src_exp& src,
            typename src_exp::type alpha,
            bool add_to,
            bool transpose
        )
        {
            matrix_assign_blas_helper<dest_exp,src_exp>::assign(dest,src,alpha,add_to, transpose);
        }
            
    // ------------------------------------------------------------------------------------

        template <
            typename dest_exp,
            typename src_exp, typename src_exp2 
            >
        void matrix_assign_blas_proxy (
            dest_exp& dest,
            const matrix_add_exp<src_exp, src_exp2>& src,
            typename src_exp::type alpha,
            bool add_to,
            bool transpose
        )
        {
            if (has_matrix_multiply<src_exp>::value || has_matrix_multiply<src_exp2>::value)
            {
                matrix_assign_blas_proxy(dest, src.lhs, alpha, add_to, transpose);
                matrix_assign_blas_proxy(dest, src.rhs, alpha, true, transpose);
            }
            else
            {
                if (transpose == false)
                    matrix_assign_default(dest, src, alpha, add_to);
                else
                    matrix_assign_default(dest, trans(src), alpha, add_to);
            }
        }
            
    // ------------------------------------------------------------------------------------

        template <
            typename dest_exp,
            typename src_exp, bool Sb 
            >
        void matrix_assign_blas_proxy (
            dest_exp& dest,
            const matrix_mul_scal_exp<src_exp,Sb>& src,
            typename src_exp::type alpha,
            bool add_to,
            bool transpose
        )
        {
            matrix_assign_blas_proxy(dest, src.m, alpha*src.s, add_to, transpose);
        }
            
    // ------------------------------------------------------------------------------------

        template <
            typename dest_exp,
            typename src_exp
            >
        void matrix_assign_blas_proxy (
            dest_exp& dest,
            const matrix_op<op_trans<src_exp> >& src,
            typename src_exp::type alpha,
            bool add_to,
            bool transpose
        )
        {
            matrix_assign_blas_proxy(dest, src.op.m, alpha, add_to, !transpose);
        }
            
    // ------------------------------------------------------------------------------------

        template <
            typename dest_exp,
            typename src_exp, typename src_exp2 
            >
        void matrix_assign_blas_proxy (
            dest_exp& dest,
            const matrix_subtract_exp<src_exp, src_exp2>& src,
            typename src_exp::type alpha,
            bool add_to,
            bool transpose
        )
        {
            
            if (has_matrix_multiply<src_exp>::value || has_matrix_multiply<src_exp2>::value)
            {
                matrix_assign_blas_proxy(dest, src.lhs, alpha, add_to, transpose);
                matrix_assign_blas_proxy(dest, src.rhs, -alpha, true, transpose);
            }
            else
            {
                if (transpose == false)
                    matrix_assign_default(dest, src, alpha, add_to);
                else
                    matrix_assign_default(dest, trans(src), alpha, add_to);
            }
        }
            
    // ------------------------------------------------------------------------------------
    // ------------------------------------------------------------------------------------

    // Once we get into this function it means that we are dealing with a matrix of float,
    // double, complex<float>, or complex<double> and the src_exp contains at least one
    // matrix multiply.

        template <
            typename T, long NR, long NC, typename MM, typename L,
            long NR2, long NC2, bool Sb
            >
        void matrix_assign_blas (
            matrix<T,NR,NC,MM,L>& dest,
            const matrix_mul_scal_exp<matrix<T,NR2,NC2,MM,L>,Sb>& src
        )
        {
            // It's ok that we don't check for aliasing in this case because there isn't
            // any complex unrolling of successive + or - operators in this expression.
            matrix_assign_blas_proxy(dest,src.m,src.s,false, false);
        }
            
    // ------------------------------------------------------------------------------------

        template <
            typename T, long NR, long NC, typename MM, typename L,
            typename src_exp 
            >
        void matrix_assign_blas (
            matrix<T,NR,NC,MM,L>& dest,
            const src_exp& src
        )
        {
            if (src.aliases(dest))
            {
                matrix<T,NR,NC,MM,L> temp(dest.nr(),dest.nc());
                matrix_assign_blas_proxy(temp,src,1,false, false);
                temp.swap(dest);
            }
            else
            {
                matrix_assign_blas_proxy(dest,src,1,false, false);
            }
        }
            
    // ------------------------------------------------------------------------------------

        template <
            typename T, long NR, long NC, typename MM, typename L,
            typename src_exp 
            >
        void matrix_assign_blas (
            assignable_sub_matrix<T,NR,NC,MM,L>& dest,
            const src_exp& src
        )
        {
            if (src.aliases(dest.m))
            {
                matrix<T,NR,NC,MM,L> temp(dest.nr(),dest.nc());
                matrix_assign_blas_proxy(temp,src,1,false, false);
                matrix_assign_default(dest,temp);
            }
            else
            {
                matrix_assign_blas_proxy(dest,src,1,false, false);
            }
        }
            
    // ------------------------------------------------------------------------------------

        template <
            typename T, long NR, long NC, typename MM, typename L,
            typename src_exp 
            >
        void matrix_assign_blas (
            assignable_row_matrix<T,NR,NC,MM,L>& dest,
            const src_exp& src
        )
        {
            if (src.aliases(dest.m))
            {
                matrix<T,NR,NC,MM,L> temp(dest.nr(),dest.nc());
                matrix_assign_blas_proxy(temp,src,1,false, false);
                matrix_assign_default(dest,temp);
            }
            else
            {
                matrix_assign_blas_proxy(dest,src,1,false, false);
            }
        }
            
    // ------------------------------------------------------------------------------------

        template <
            typename T, long NR, long NC, typename MM, typename L,
            typename src_exp 
            >
        void matrix_assign_blas (
            assignable_col_matrix<T,NR,NC,MM,L>& dest,
            const src_exp& src
        )
        {
            if (src.aliases(dest.m))
            {
                matrix<T,NR,NC,MM,L> temp(dest.nr(),dest.nc());
                matrix_assign_blas_proxy(temp,src,1,false, false);
                matrix_assign_default(dest,temp);
            }
            else
            {
                matrix_assign_blas_proxy(dest,src,1,false, false);
            }
        }
            
    // ------------------------------------------------------------------------------------

        template <
            typename T, long NR, long NC, typename MM, typename L,
            typename src_exp 
            >
        void matrix_assign_blas (
            matrix<T,NR,NC,MM,L>& dest,
            const matrix_add_exp<matrix<T,NR,NC,MM,L> ,src_exp>& src
        )
        {
            if (src.rhs.aliases(dest) == false)
            {
                if (&src.lhs != &dest)
                {
                    dest = src.lhs;
                }

                matrix_assign_blas_proxy(dest, src.rhs, 1, true, false);
            }
            else
            {
                matrix<T,NR,NC,MM,L> temp(src.lhs);
                matrix_assign_blas_proxy(temp, src.rhs, 1, true, false);
                temp.swap(dest);
            }
        }

    // ------------------------------------------------------------------------------------

        template <
            typename T, long NR, long NC, typename MM, typename L,
            typename src_exp 
            >
        void matrix_assign_blas (
            matrix<T,NR,NC,MM,L>& dest,
            const matrix_add_exp<src_exp, matrix<T,NR,NC,MM,L> >& src
        )
        {
            // Just switch around the left and right hand sides of the incoming 
            // add expression and pass it back into matrix_assign_blas() so that
            // the above function will be called.
            typedef matrix_add_exp<matrix<T,NR,NC,MM,L> ,src_exp> swapped_add_exp;
            matrix_assign_blas(dest, swapped_add_exp(src.rhs, src.lhs)); 
        }
            
    // ------------------------------------------------------------------------------------

        template <
            typename T, long NR, long NC, typename MM, typename L,
            typename src_exp 
            >
        void matrix_assign_blas (
            matrix<T,NR,NC,MM,L>& dest,
            const matrix_subtract_exp<matrix<T,NR,NC,MM,L> ,src_exp>& src
        )
        {
            if (src.rhs.aliases(dest) == false)
            {
                if (&src.lhs != &dest)
                {
                    dest = src.lhs;
                }

                matrix_assign_blas_proxy(dest, src.rhs, -1, true, false);
            }
            else
            {
                matrix<T,NR,NC,MM,L> temp(src.lhs);
                matrix_assign_blas_proxy(temp, src.rhs, -1, true, false);
                temp.swap(dest);
            }
        }

    // ------------------------------------------------------------------------------------
    // ------------------------------------------------------------------------------------
    // ------------------------------------------------------------------------------------

    } // end of namespace blas_bindings 

    // ------------------------------------------------------------------------------------

    template <
        typename T, long NR, long NC, typename MM, typename L,
        typename src_exp 
        >
    inline typename enable_if_c<(is_same_type<T,float>::value ||
                                is_same_type<T,double>::value ||
                                is_same_type<T,std::complex<float> >::value ||
                                is_same_type<T,std::complex<double> >::value) &&
                                blas_bindings::has_matrix_multiply<src_exp>::value
    >::type matrix_assign_big (
        matrix<T,NR,NC,MM,L>& dest,
        const src_exp& src
    )
    {
        blas_bindings::matrix_assign_blas(dest,src);
    }

// ----------------------------------------------------------------------------------------

    template <
        typename T, long NR, long NC, typename MM, typename L,
        typename src_exp 
        >
    inline typename enable_if_c<(is_same_type<T,float>::value ||
                                is_same_type<T,double>::value ||
                                is_same_type<T,std::complex<float> >::value ||
                                is_same_type<T,std::complex<double> >::value) &&
                                blas_bindings::has_matrix_multiply<src_exp>::value
    >::type matrix_assign_big (
        assignable_sub_matrix<T,NR,NC,MM,L>& dest,
        const src_exp& src
    )
    {
        blas_bindings::matrix_assign_blas(dest,src);
    }

// ----------------------------------------------------------------------------------------

    template <
        typename T, long NR, long NC, typename MM, typename L,
        typename src_exp 
        >
    inline typename enable_if_c<(is_same_type<T,float>::value ||
                                is_same_type<T,double>::value ||
                                is_same_type<T,std::complex<float> >::value ||
                                is_same_type<T,std::complex<double> >::value) &&
                                blas_bindings::has_matrix_multiply<src_exp>::value
    >::type matrix_assign_big (
        assignable_row_matrix<T,NR,NC,MM,L>& dest,
        const src_exp& src
    )
    {
        blas_bindings::matrix_assign_blas(dest,src);
    }

// ----------------------------------------------------------------------------------------

    template <
        typename T, long NR, long NC, typename MM, typename L,
        typename src_exp 
        >
    inline typename enable_if_c<(is_same_type<T,float>::value ||
                                is_same_type<T,double>::value ||
                                is_same_type<T,std::complex<float> >::value ||
                                is_same_type<T,std::complex<double> >::value) &&
                                blas_bindings::has_matrix_multiply<src_exp>::value
    >::type matrix_assign_big (
        assignable_col_matrix<T,NR,NC,MM,L>& dest,
        const src_exp& src
    )
    {
        blas_bindings::matrix_assign_blas(dest,src);
    }

// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------

}

#endif // DLIB_MATRIx_ASSIGn_

