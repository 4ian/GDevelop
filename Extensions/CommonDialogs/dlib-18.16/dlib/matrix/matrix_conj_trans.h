// Copyright (C) 2009  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#ifndef DLIB_MATRIx_CONJ_TRANS_FUNCTIONS
#define DLIB_MATRIx_CONJ_TRANS_FUNCTIONS 

#include "matrix_utilities.h"
#include "matrix_math_functions.h"
#include "matrix.h"
#include "../algs.h"
#include <cmath>
#include <complex>
#include <limits>


namespace dlib
{
    /*!
        The point of the two functions defined in this file is to make statements
        of the form conj(trans(m)) and trans(conj(m)) look the same so that it is
        easier to map them to BLAS functions later on.
    !*/

// ----------------------------------------------------------------------------------------

    template <typename M>
    struct op_conj_trans 
    {
        op_conj_trans( const M& m_) : m(m_){}
        const M& m;

        const static long cost = M::cost+1;
        const static long NR = M::NC;
        const static long NC = M::NR;
        typedef typename M::type type;
        typedef typename M::type const_ret_type;
        typedef typename M::mem_manager_type mem_manager_type;
        typedef typename M::layout_type layout_type;
        const_ret_type apply (long r, long c) const { return std::conj(m(c,r)); }

        long nr () const { return m.nc(); }
        long nc () const { return m.nr(); }

        template <typename U> bool aliases               ( const matrix_exp<U>& item) const { return m.aliases(item); }
        template <typename U> bool destructively_aliases ( const matrix_exp<U>& item) const { return m.aliases(item); }
    }; 

    template <typename EXP>
    const matrix_op<op_conj_trans<EXP> > trans (
        const matrix_op<op_conj<EXP> >& m
    )
    {
        typedef op_conj_trans<EXP> op;
        return matrix_op<op>(op(m.op.m));
    }

    template <typename EXP>
    const matrix_op<op_conj_trans<EXP> > conj (
        const matrix_op<op_trans<EXP> >& m
    )
    {
        typedef op_conj_trans<EXP> op;
        return matrix_op<op>(op(m.op.m));
    }

// ----------------------------------------------------------------------------------------

}

#endif // DLIB_MATRIx_CONJ_TRANS_FUNCTIONS


