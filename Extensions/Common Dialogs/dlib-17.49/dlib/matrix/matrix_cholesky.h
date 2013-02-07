// Copyright (C) 2009  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
// This code was adapted from code from the JAMA part of NIST's TNT library.
//    See: http://math.nist.gov/tnt/ 
#ifndef DLIB_MATRIX_CHOLESKY_DECOMPOSITION_H
#define DLIB_MATRIX_CHOLESKY_DECOMPOSITION_H

#include "matrix.h" 
#include "matrix_utilities.h"
#include "matrix_subexp.h"
#include <cmath>

#ifdef DLIB_USE_LAPACK
#include "lapack/potrf.h"
#endif

#include "matrix_trsm.h"

namespace dlib 
{

    template <
        typename matrix_exp_type
        >
    class cholesky_decomposition
    {

    public:

        const static long NR = matrix_exp_type::NR;
        const static long NC = matrix_exp_type::NC;
        typedef typename matrix_exp_type::type type;
        typedef typename matrix_exp_type::mem_manager_type mem_manager_type;
        typedef typename matrix_exp_type::layout_type layout_type;

        typedef matrix<type,0,0,mem_manager_type,layout_type>  matrix_type;
        typedef matrix<type,NR,1,mem_manager_type,layout_type> column_vector_type;

        // You have supplied an invalid type of matrix_exp_type.  You have
        // to use this object with matrices that contain float or double type data.
        COMPILE_TIME_ASSERT((is_same_type<float, type>::value || 
                             is_same_type<double, type>::value ));



        template <typename EXP>
        cholesky_decomposition(
            const matrix_exp<EXP>& A
        );

        bool is_spd(
        ) const;

        const matrix_type& get_l(
        ) const;

        template <typename EXP>
        const typename EXP::matrix_type solve (
            const matrix_exp<EXP>& B
        ) const;

    private:

        matrix_type L_;     // lower triangular factor
        bool isspd;         // true if matrix to be factored was SPD
    };

// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------
//                                      Member functions
// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------

    template <typename matrix_exp_type>
    bool cholesky_decomposition<matrix_exp_type>::
    is_spd(
    ) const
    {
        return isspd;
    }

// ----------------------------------------------------------------------------------------

    template <typename matrix_exp_type>
    const typename cholesky_decomposition<matrix_exp_type>::matrix_type& cholesky_decomposition<matrix_exp_type>::
    get_l(
    ) const
    {
        return L_;
    }

// ----------------------------------------------------------------------------------------

    template <typename matrix_exp_type>
    template <typename EXP>
    cholesky_decomposition<matrix_exp_type>::
    cholesky_decomposition(
        const matrix_exp<EXP>& A_
    )
    {
        using std::sqrt;
        COMPILE_TIME_ASSERT((is_same_type<type, typename EXP::type>::value));

        // make sure requires clause is not broken
        DLIB_ASSERT(A_.nr() == A_.nc() && A_.size() > 0,
            "\tcholesky_decomposition::cholesky_decomposition(A_)"
            << "\n\tYou can only use this on square matrices"
            << "\n\tA_.nr():   " << A_.nr()
            << "\n\tA_.nc():   " << A_.nc()
            << "\n\tA_.size(): " << A_.size()
            << "\n\tthis:      " << this
            );

#ifdef DLIB_USE_LAPACK
        L_ = A_;
        const type eps = max(abs(diag(L_)))*std::sqrt(std::numeric_limits<type>::epsilon())/100;

        // check if the matrix is actually symmetric
        bool is_symmetric = true;
        for (long r = 0; r < L_.nr() && is_symmetric; ++r)
        {
            for (long c = r+1; c < L_.nc() && is_symmetric; ++c)
            {
                // this is approximately doing: is_symmetric = is_symmetric && ( L_(k,j) == L_(j,k))
                is_symmetric = is_symmetric && (std::abs(L_(r,c) - L_(c,r)) < eps ); 
            }
        }

        // now compute the actual cholesky decomposition
        int info = lapack::potrf('L', L_);

        // check if it's really SPD
        if (info == 0 && is_symmetric && min(abs(diag(L_))) > eps*100)
            isspd = true;
        else
            isspd = false;

        L_ = lowerm(L_);
#else
        const_temp_matrix<EXP> A(A_);


        isspd = true;

        const long n = A.nc();
        L_.set_size(n,n); 

        const type eps = max(abs(diag(A)))*std::sqrt(std::numeric_limits<type>::epsilon())/100;

        // Main loop.
        for (long j = 0; j < n; j++) 
        {
            type d(0.0);
            for (long k = 0; k < j; k++) 
            {
                type s(0.0);
                for (long i = 0; i < k; i++) 
                {
                    s += L_(k,i)*L_(j,i);
                }

                // if L_(k,k) != 0
                if (std::abs(L_(k,k)) > eps)
                {
                    s = (A(j,k) - s)/L_(k,k);
                }
                else
                {
                    s = (A(j,k) - s);
                    isspd = false;
                }

                L_(j,k) = s;

                d = d + s*s;

                // this is approximately doing: isspd = isspd && ( A(k,j) == A(j,k))
                isspd = isspd && (std::abs(A(k,j) - A(j,k)) < eps ); 
            }
            d = A(j,j) - d;
            isspd = isspd && (d > eps);
            L_(j,j) = sqrt(d > 0.0 ? d : 0.0);
            for (long k = j+1; k < n; k++) 
            {
                L_(j,k) = 0.0;
            }
        }
#endif
    }

// ----------------------------------------------------------------------------------------

    template <typename matrix_exp_type>
    template <typename EXP>
    const typename EXP::matrix_type cholesky_decomposition<matrix_exp_type>::
    solve(
        const matrix_exp<EXP>& B
    ) const
    {
        COMPILE_TIME_ASSERT((is_same_type<type, typename EXP::type>::value));

        // make sure requires clause is not broken
        DLIB_ASSERT(L_.nr() == B.nr(),
            "\tconst matrix cholesky_decomposition::solve(B)"
            << "\n\tInvalid arguments were given to this function."
            << "\n\tL_.nr():  " << L_.nr() 
            << "\n\tB.nr():   " << B.nr() 
            << "\n\tthis:     " << this
            );

        matrix<type, NR, EXP::NC, mem_manager_type, layout_type>  X(B); 

        using namespace blas_bindings;
        // Solve L*y = b;
        triangular_solver(CblasLeft, CblasLower, CblasNoTrans, CblasNonUnit, L_, X);
        // Solve L'*X = Y;
        triangular_solver(CblasLeft, CblasLower, CblasTrans, CblasNonUnit, L_, X);
        return X;
    }

// ----------------------------------------------------------------------------------------



} 

#endif // DLIB_MATRIX_CHOLESKY_DECOMPOSITION_H 




