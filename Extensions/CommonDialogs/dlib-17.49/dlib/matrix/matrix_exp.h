// Copyright (C) 2006  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#ifndef DLIB_MATRIx_EXP_h_
#define DLIB_MATRIx_EXP_h_

#include "../algs.h"
#include "../is_kind.h"
#include "matrix_fwd.h"
#include "matrix_exp_abstract.h"

namespace dlib
{

// ----------------------------------------------------------------------------------------

    // We want to return the compile time constant if our NR and NC dimensions
    // aren't zero but if they are then we want to call ref_.nx() and return
    // the correct values. 
    template < typename exp_type, long NR >
    struct get_nr_helper
    {
        static inline long get(const exp_type&) { return NR; }
    };

    template < typename exp_type >
    struct get_nr_helper<exp_type,0>
    {
        static inline long get(const exp_type& m) { return m.nr(); }
    };

    template < typename exp_type, long NC >
    struct get_nc_helper
    {
        static inline long get(const exp_type&) { return NC; }
    };

    template < typename exp_type >
    struct get_nc_helper<exp_type,0>
    {
        static inline long get(const exp_type& m) { return m.nc(); }
    };

    template <typename EXP>
    struct matrix_traits
    {
        typedef typename EXP::type type;
        typedef typename EXP::const_ret_type const_ret_type;
        typedef typename EXP::mem_manager_type mem_manager_type;
        typedef typename EXP::layout_type layout_type;
        const static long NR = EXP::NR;
        const static long NC = EXP::NC;
        const static long cost = EXP::cost;
    };

// ----------------------------------------------------------------------------------------

    template <
        typename EXP
        >
    class matrix_exp 
    {
        /*!
            REQUIREMENTS ON EXP
                EXP should be something convertible to a matrix_exp.  That is,
                it should inherit from matrix_exp
        !*/

    public:
        typedef typename matrix_traits<EXP>::type type;
        typedef type value_type;
        typedef typename matrix_traits<EXP>::const_ret_type const_ret_type;
        typedef typename matrix_traits<EXP>::mem_manager_type mem_manager_type;
        typedef typename matrix_traits<EXP>::layout_type layout_type;
        const static long NR = matrix_traits<EXP>::NR;
        const static long NC = matrix_traits<EXP>::NC;
        const static long cost = matrix_traits<EXP>::cost;

        typedef matrix<type,NR,NC,mem_manager_type,layout_type> matrix_type;
        typedef EXP exp_type;

        inline const_ret_type operator() (
            long r,
            long c
        ) const 
        { 
            DLIB_ASSERT(r < nr() && c < nc() && r >= 0 && c >= 0, 
                "\tconst type matrix_exp::operator(r,c)"
                << "\n\tYou must give a valid row and column"
                << "\n\tr:    " << r 
                << "\n\tc:    " << c
                << "\n\tnr(): " << nr()
                << "\n\tnc(): " << nc() 
                << "\n\tthis: " << this
                );
            return ref()(r,c); 
        }

        const_ret_type operator() (
            long i
        ) const 
        {
            COMPILE_TIME_ASSERT(NC == 1 || NC == 0 || NR == 1 || NR == 0);
            DLIB_ASSERT(nc() == 1 || nr() == 1, 
                "\tconst type matrix_exp::operator(i)"
                << "\n\tYou can only use this operator on column or row vectors"
                << "\n\ti:    " << i
                << "\n\tnr(): " << nr()
                << "\n\tnc(): " << nc()
                << "\n\tthis: " << this
                );
            DLIB_ASSERT( ((nc() == 1 && i < nr()) || (nr() == 1 && i < nc())) && i >= 0, 
                "\tconst type matrix_exp::operator(i)"
                << "\n\tYou must give a valid row/column number"
                << "\n\ti:    " << i
                << "\n\tnr(): " << nr()
                << "\n\tnc(): " << nc()
                << "\n\tthis: " << this
                );
            if (nc() == 1)
                return ref()(i,0);
            else
                return ref()(0,i);
        }

        long size (
        ) const { return nr()*nc(); }

        long nr (
        ) const { return get_nr_helper<exp_type,NR>::get(ref()); }

        long nc (
        ) const { return get_nc_helper<exp_type,NC>::get(ref()); }

        template <typename U>
        bool aliases (
            const matrix_exp<U>& item
        ) const { return ref().aliases(item); }

        template <typename U>
        bool destructively_aliases (
            const matrix_exp<U>& item
        ) const { return ref().destructively_aliases(item); }

        inline const exp_type& ref (
        ) const { return *static_cast<const exp_type*>(this); }

        inline operator const type (
        ) const 
        {
            COMPILE_TIME_ASSERT(NC == 1 || NC == 0);
            COMPILE_TIME_ASSERT(NR == 1 || NR == 0);
            DLIB_ASSERT(nr() == 1 && nc() == 1, 
                "\tmatrix_exp::operator const type() const"
                << "\n\tYou can only use this operator on a 1x1 matrix"
                << "\n\tnr(): " << nr()
                << "\n\tnc(): " << nc()
                << "\n\tthis: " << this
                );

            // Put the expression contained in this matrix_exp into
            // a temporary 1x1 matrix so that the expression will encounter
            // all the overloads of matrix_assign() and have the chance to
            // go through any applicable optimizations.
            matrix<type,1,1,mem_manager_type,layout_type> temp(ref());
            return temp(0);
        }

    protected:
        matrix_exp() {}
        matrix_exp(const matrix_exp& ) {}

    private:

        matrix_exp& operator= (const matrix_exp&);
    };

// ----------------------------------------------------------------------------------------

    // something is a matrix if it is convertible to a matrix_exp object
    template <typename T>
    struct is_matrix<T, typename enable_if<is_convertible<T, const matrix_exp<typename T::exp_type>& > >::type > 
    { static const bool value = true; }; 
    /*
        is_matrix<T>::value == 1 if T is a matrix type else 0
    */

// ----------------------------------------------------------------------------------------

    template <
        typename EXP
        >
    class matrix_diag_exp : public matrix_exp<EXP> 
    {
        /*!
            This is a matrix expression type used to represent diagonal matrices.
            That is, square matrices with all off diagonal elements equal to 0.
        !*/

    protected:
        matrix_diag_exp() {}
        matrix_diag_exp(const matrix_diag_exp& item ):matrix_exp<EXP>(item) {}
    };

// ----------------------------------------------------------------------------------------

}

#endif // DLIB_MATRIx_EXP_h_

