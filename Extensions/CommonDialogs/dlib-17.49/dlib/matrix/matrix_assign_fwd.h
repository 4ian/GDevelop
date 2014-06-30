// Copyright (C) 2008  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#ifndef DLIB_MATRIx_ASSIGn_FWD_
#define DLIB_MATRIx_ASSIGn_FWD_

#include "../enable_if.h"
#include "matrix_data_layout.h"
#include "../algs.h"

namespace dlib
{
    
    /*
        The point of the matrix_assign() functions is to contain all the various 
        optimizations that help the matrix assign a matrix_exp to an actual matrix 
        object quickly.
    */

// ----------------------------------------------------------------------------------------

    namespace ma
    {
        // This template here controls how big a compile time sized matrix needs
        // to be for it to get passed into the optimized versions of the 
        // matrix_assign() function.  So small matrices are evaluated with a simple
        // loop like the ones in this file and bigger matrices may get sent to BLAS
        // routines or some other kind of optimized thing.
        template < typename EXP, typename enable = void >
        struct is_small_matrix { static const bool value = false; };
        template < typename EXP >
        struct is_small_matrix<EXP, typename enable_if_c<EXP::NR>=1 && EXP::NC>=1 &&
        EXP::NR<=17 && EXP::NC<=17 && (EXP::cost <= 70)>::type> { static const bool value = true; };

        // I wouldn't use this mul object to do the multiply but visual studio 7.1 wouldn't
        // compile otherwise.
        template <long a, long b>
        struct mul { const static long value = a*b; };

        template < typename EXP, typename enable = void >
        struct is_very_small_matrix { static const bool value = false; };
        template < typename EXP >
        struct is_very_small_matrix<EXP, typename enable_if_c<EXP::NR>=1 && EXP::NC>=1 &&
        (mul<EXP::NR,EXP::NC>::value <= 16) && (EXP::cost <= 70)>::type> { static const bool value = true; };


        template < typename EXP, typename enable = void >
        struct has_column_major_layout { static const bool value = false; };
        template < typename EXP >
        struct has_column_major_layout<EXP, typename enable_if<is_same_type<typename EXP::layout_type, column_major_layout> >::type > 
        { static const bool value = true; };


        
    }

// ----------------------------------------------------------------------------------------

    template <
        typename EXP
        >
    class matrix_exp;

// ----------------------------------------------------------------------------------------

    template <typename EXP1, typename EXP2>
    inline typename disable_if<ma::has_column_major_layout<EXP1> >::type  
    matrix_assign_default (
        EXP1& dest,
        const EXP2& src
    )
    /*!
        requires
            - src.destructively_aliases(dest) == false
            - dest.nr() == src.nr()
            - dest.nc() == src.nc()
        ensures
            - #dest == src
    !*/
    {
        for (long r = 0; r < src.nr(); ++r)
        {
            for (long c = 0; c < src.nc(); ++c)
            {
                dest(r,c) = src(r,c);
            }
        }
    }

// ----------------------------------------------------------------------------------------

    template <typename EXP1, typename EXP2>
    inline typename enable_if<ma::has_column_major_layout<EXP1> >::type  
    matrix_assign_default (
        EXP1& dest,
        const EXP2& src
    )
    /*!
        requires
            - src.destructively_aliases(dest) == false
            - dest.nr() == src.nr()
            - dest.nc() == src.nc()
        ensures
            - #dest == src
    !*/
    {
        for (long c = 0; c < src.nc(); ++c)
        {
            for (long r = 0; r < src.nr(); ++r)
            {
                dest(r,c) = src(r,c);
            }
        }
    }

// ----------------------------------------------------------------------------------------

    template <typename EXP1, typename EXP2>
    inline typename disable_if<ma::has_column_major_layout<EXP1> >::type  
    matrix_assign_default (
        EXP1& dest,
        const EXP2& src,
        typename EXP2::type alpha,
        bool add_to
    )
    /*!
        requires
            - src.destructively_aliases(dest) == false
            - dest.nr() == src.nr()
            - dest.nc() == src.nc()
        ensures
            - if (add_to == false) then
                - #dest == alpha*src
            - else
                - #dest == dest + alpha*src
    !*/
    {
        if (add_to)
        {
            if (alpha == static_cast<typename EXP2::type>(1))
            {
                for (long r = 0; r < src.nr(); ++r)
                {
                    for (long c = 0; c < src.nc(); ++c)
                    {
                        dest(r,c) += src(r,c);
                    }
                }
            }
            else if (alpha == static_cast<typename EXP2::type>(-1))
            {
                for (long r = 0; r < src.nr(); ++r)
                {
                    for (long c = 0; c < src.nc(); ++c)
                    {
                        dest(r,c) -= src(r,c);
                    }
                }
            }
            else
            {
                for (long r = 0; r < src.nr(); ++r)
                {
                    for (long c = 0; c < src.nc(); ++c)
                    {
                        dest(r,c) += alpha*src(r,c);
                    }
                }
            }
        }
        else
        {
            if (alpha == static_cast<typename EXP2::type>(1))
            {
                for (long r = 0; r < src.nr(); ++r)
                {
                    for (long c = 0; c < src.nc(); ++c)
                    {
                        dest(r,c) = src(r,c);
                    }
                }
            }
            else
            {
                for (long r = 0; r < src.nr(); ++r)
                {
                    for (long c = 0; c < src.nc(); ++c)
                    {
                        dest(r,c) = alpha*src(r,c);
                    }
                }
            }
        }
    }

// ----------------------------------------------------------------------------------------

    template <typename EXP1, typename EXP2>
    inline typename enable_if<ma::has_column_major_layout<EXP1> >::type  
    matrix_assign_default (
        EXP1& dest,
        const EXP2& src,
        typename EXP2::type alpha,
        bool add_to
    )
    /*!
        requires
            - src.destructively_aliases(dest) == false
            - dest.nr() == src.nr()
            - dest.nc() == src.nc()
        ensures
            - if (add_to == false) then
                - #dest == alpha*src
            - else
                - #dest == dest + alpha*src
    !*/
    {
        if (add_to)
        {
            if (alpha == static_cast<typename EXP2::type>(1))
            {
                for (long c = 0; c < src.nc(); ++c)
                {
                    for (long r = 0; r < src.nr(); ++r)
                    {
                        dest(r,c) += src(r,c);
                    }
                }
            }
            else if (alpha == static_cast<typename EXP2::type>(-1))
            {
                for (long c = 0; c < src.nc(); ++c)
                {
                    for (long r = 0; r < src.nr(); ++r)
                    {
                        dest(r,c) -= src(r,c);
                    }
                }
            }
            else
            {
                for (long c = 0; c < src.nc(); ++c)
                {
                    for (long r = 0; r < src.nr(); ++r)
                    {
                        dest(r,c) += alpha*src(r,c);
                    }
                }
            }
        }
        else
        {
            if (alpha == static_cast<typename EXP2::type>(1))
            {
                for (long c = 0; c < src.nc(); ++c)
                {
                    for (long r = 0; r < src.nr(); ++r)
                    {
                        dest(r,c) = src(r,c);
                    }
                }
            }
            else
            {
                for (long c = 0; c < src.nc(); ++c)
                {
                    for (long r = 0; r < src.nr(); ++r)
                    {
                        dest(r,c) = alpha*src(r,c);
                    }
                }
            }
        }
    }

// ----------------------------------------------------------------------------------------

    template <
        typename matrix_dest_type,
        typename src_exp 
        >
    void matrix_assign_big (
        matrix_dest_type& dest,
        const matrix_exp<src_exp>& src
    )
    {
        matrix_assign_default(dest,src);
    }

// ----------------------------------------------------------------------------------------

    template <
        typename matrix_dest_type,
        typename src_exp 
        >
    inline typename disable_if<ma::is_small_matrix<src_exp> >::type matrix_assign (
        matrix_dest_type& dest,
        const matrix_exp<src_exp>& src
    )
    /*!
        requires
            - src.destructively_aliases(dest) == false
            - dest.nr() == src.nr()
            - dest.nc() == src.nc()
        ensures
            - #dest == src
    !*/
    {
        // Call src.ref() here so that the derived type of the matrix_exp shows 
        // up so we can overload matrix_assign_big() based on various matrix expression
        // types.
        matrix_assign_big(dest,src.ref());
    }

// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------

// this code is here to perform an unrolled version of the matrix_assign() function
    template < typename DEST, typename SRC, long NR, long NC,
    long R = 0, long C = 0, bool base_case = (R==NR) >
    struct matrix_unroll_helper
    {
        inline static void go ( DEST& dest, const SRC& src)
        {
            dest(R,C) = src(R,C);
            matrix_unroll_helper<DEST,SRC,NR,NC, R + (C+1)/NC,  (C+1)%NC>::go(dest,src);
        }
    };

    template < typename DEST, typename SRC, long NR, long NC, long R, long C >
    struct matrix_unroll_helper<DEST,SRC,NR,NC,R,C,true>
    { inline static void go ( DEST& , const SRC& ) {} };

    template <typename DEST, typename SRC>
    inline void matrix_assign_unrolled (
        DEST& dest,
        const SRC& src
    )
    /*!
        requires
            - src.destructively_aliases(dest) == false
            - dest.nr() == src.nr()
            - dest.nc() == src.nc()
        ensures
            - #dest == src
    !*/
    {
        COMPILE_TIME_ASSERT(SRC::NR*SRC::NC != 0);
        matrix_unroll_helper<DEST,SRC, SRC::NR, SRC::NC>::go(dest,src);
    }

// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------

    template <
        typename matrix_dest_type,
        typename src_exp 
        >
    inline typename enable_if_c<ma::is_small_matrix<src_exp>::value && ma::is_very_small_matrix<src_exp>::value==false >::type matrix_assign (
        matrix_dest_type& dest,
        const matrix_exp<src_exp>& src
    )
    /*!
        requires
            - src.destructively_aliases(dest) == false
            - dest.nr() == src.nr()
            - dest.nc() == src.nc()
        ensures
            - #dest == src
    !*/
    {
        matrix_assign_default(dest,src.ref());
    }

// ----------------------------------------------------------------------------------------

    template <
        typename matrix_dest_type,
        typename src_exp 
        >
    inline typename enable_if_c<ma::is_small_matrix<src_exp>::value && ma::is_very_small_matrix<src_exp>::value==true >::type matrix_assign (
        matrix_dest_type& dest,
        const matrix_exp<src_exp>& src
    )
    /*!
        requires
            - src.destructively_aliases(dest) == false
            - dest.nr() == src.nr()
            - dest.nc() == src.nc()
        ensures
            - #dest == src
    !*/
    {
        matrix_assign_unrolled(dest,src.ref());
    }

// ----------------------------------------------------------------------------------------

}

#endif // DLIB_MATRIx_ASSIGn_FWD_


