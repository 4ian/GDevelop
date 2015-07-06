// Copyright (C) 2009  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
// This code was adapted from code from the JAMA part of NIST's TNT library.
//    See: http://math.nist.gov/tnt/ 
#ifndef DLIB_MATRIX_QR_DECOMPOSITION_H
#define DLIB_MATRIX_QR_DECOMPOSITION_H

#include "matrix.h" 
#include "matrix_utilities.h"
#include "matrix_subexp.h"

#ifdef DLIB_USE_LAPACK
#include "lapack/geqrf.h"
#include "lapack/ormqr.h"
#endif

#include "matrix_trsm.h"

namespace dlib 
{

    template <
        typename matrix_exp_type
        >
    class qr_decomposition 
    {

    public:

        const static long NR = matrix_exp_type::NR;
        const static long NC = matrix_exp_type::NC;
        typedef typename matrix_exp_type::type type;
        typedef typename matrix_exp_type::mem_manager_type mem_manager_type;
        typedef typename matrix_exp_type::layout_type layout_type;

        typedef matrix<type,0,0,mem_manager_type,layout_type>  matrix_type;

        // You have supplied an invalid type of matrix_exp_type.  You have
        // to use this object with matrices that contain float or double type data.
        COMPILE_TIME_ASSERT((is_same_type<float, type>::value || 
                             is_same_type<double, type>::value ));



        template <typename EXP>
        qr_decomposition(
            const matrix_exp<EXP>& A
        );

        bool is_full_rank(
        ) const;

        long nr(
        ) const;

        long nc(
        ) const;

        const matrix_type get_r (
        ) const;

        const matrix_type get_q (
        ) const;

        void get_q (
            matrix_type& Q
        ) const;

        template <typename EXP>
        const matrix_type solve (
            const matrix_exp<EXP>& B
        ) const;

    private:

#ifndef DLIB_USE_LAPACK
        template <typename EXP>
        const matrix_type solve_mat (
            const matrix_exp<EXP>& B
        ) const;

        template <typename EXP>
        const matrix_type solve_vect (
            const matrix_exp<EXP>& B
        ) const;
#endif


        /** Array for internal storage of decomposition.
        @serial internal array storage.
        */
        matrix<type,0,0,mem_manager_type,column_major_layout> QR_;

        /** Row and column dimensions.
        @serial column dimension.
        @serial row dimension.
        */
        long m, n;

        /** Array for internal storage of diagonal of R.
        @serial diagonal of R.
        */
        typedef matrix<type,0,1,mem_manager_type,column_major_layout> column_vector_type;
        column_vector_type tau;
        column_vector_type Rdiag;


    };

// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------
//                                      Member functions
// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------

    template <typename matrix_exp_type>
    template <typename EXP>
    qr_decomposition<matrix_exp_type>::
    qr_decomposition(
        const matrix_exp<EXP>& A
    )		
    {
        COMPILE_TIME_ASSERT((is_same_type<type, typename EXP::type>::value));

        // make sure requires clause is not broken
        DLIB_ASSERT(A.nr() >= A.nc() && A.size() > 0,
            "\tqr_decomposition::qr_decomposition(A)"
            << "\n\tInvalid inputs were given to this function"
            << "\n\tA.nr():   " << A.nr()
            << "\n\tA.nc():   " << A.nc()
            << "\n\tA.size(): " << A.size()
            << "\n\tthis:     " << this
            );


        QR_ = A;
        m = A.nr();
        n = A.nc();

#ifdef DLIB_USE_LAPACK

        lapack::geqrf(QR_, tau);
        Rdiag = diag(QR_);

#else
        Rdiag.set_size(n);
        long i=0, j=0, k=0;

        // Main loop.
        for (k = 0; k < n; k++) 
        {
            // Compute 2-norm of k-th column without under/overflow.
            type nrm = 0;
            for (i = k; i < m; i++) 
            {
                nrm = hypot(nrm,QR_(i,k));
            }

            if (nrm != 0.0) 
            {
                // Form k-th Householder vector.
                if (QR_(k,k) < 0) 
                {
                    nrm = -nrm;
                }
                for (i = k; i < m; i++) 
                {
                    QR_(i,k) /= nrm;
                }
                QR_(k,k) += 1.0;

                // Apply transformation to remaining columns.
                for (j = k+1; j < n; j++) 
                {
                    type s = 0.0; 
                    for (i = k; i < m; i++) 
                    {
                        s += QR_(i,k)*QR_(i,j);
                    }
                    s = -s/QR_(k,k);
                    for (i = k; i < m; i++) 
                    {
                        QR_(i,j) += s*QR_(i,k);
                    }
                }
            }
            Rdiag(k) = -nrm;
        }
#endif
    }

// ----------------------------------------------------------------------------------------

    template <typename matrix_exp_type>
    long qr_decomposition<matrix_exp_type>::
    nr (
    ) const
    {
        return m;
    }

// ----------------------------------------------------------------------------------------

    template <typename matrix_exp_type>
    long qr_decomposition<matrix_exp_type>::
    nc (
    ) const
    {
        return n;
    }

// ----------------------------------------------------------------------------------------

    template <typename matrix_exp_type>
    bool qr_decomposition<matrix_exp_type>::
    is_full_rank(
    ) const		
    {
        type eps = max(abs(Rdiag));
        if (eps != 0)
            eps *= std::sqrt(std::numeric_limits<type>::epsilon())/100;
        else
            eps = 1;  // there is no max so just use 1

        // check if any of the elements of Rdiag are effectively 0
        return min(abs(Rdiag)) > eps;
    }

// ----------------------------------------------------------------------------------------

    template <typename matrix_exp_type>
    const typename qr_decomposition<matrix_exp_type>::matrix_type qr_decomposition<matrix_exp_type>::
    get_r(
    ) const
    {
        matrix_type R(n,n);
        for (long i = 0; i < n; i++) 
        {
            for (long j = 0; j < n; j++) 
            {
                if (i < j) 
                {
                    R(i,j) = QR_(i,j);
                } 
                else if (i == j) 
                {
                    R(i,j) = Rdiag(i);
                } 
                else 
                {
                    R(i,j) = 0.0;
                }
            }
        }
        return R;
    }

// ----------------------------------------------------------------------------------------

    template <typename matrix_exp_type>
    const typename qr_decomposition<matrix_exp_type>::matrix_type qr_decomposition<matrix_exp_type>::
    get_q(
    ) const
    {
        matrix_type Q;
        get_q(Q);
        return Q;
    }

// ----------------------------------------------------------------------------------------

    template <typename matrix_exp_type>
    void qr_decomposition<matrix_exp_type>::
    get_q(
        matrix_type& X
    ) const
    {
#ifdef DLIB_USE_LAPACK
        // Take only the first n columns of an identity matrix.  This way
        // X ends up being an m by n matrix.
        X = colm(identity_matrix<type>(m), range(0,n-1));

        // Compute Y = Q*X 
        lapack::ormqr('L','N', QR_, tau, X);

#else
        long i=0, j=0, k=0;

        X.set_size(m,n);
        for (k = n-1; k >= 0; k--) 
        {
            for (i = 0; i < m; i++) 
            {
                X(i,k) = 0.0;
            }
            X(k,k) = 1.0;
            for (j = k; j < n; j++) 
            {
                if (QR_(k,k) != 0) 
                {
                    type s = 0.0;
                    for (i = k; i < m; i++) 
                    {
                        s += QR_(i,k)*X(i,j);
                    }
                    s = -s/QR_(k,k);
                    for (i = k; i < m; i++) 
                    {
                        X(i,j) += s*QR_(i,k);
                    }
                }
            }
        }
#endif
    }

// ----------------------------------------------------------------------------------------

    template <typename matrix_exp_type>
    template <typename EXP>
    const typename qr_decomposition<matrix_exp_type>::matrix_type qr_decomposition<matrix_exp_type>::
    solve(
        const matrix_exp<EXP>& B
    ) const
    {
        COMPILE_TIME_ASSERT((is_same_type<type, typename EXP::type>::value));

        // make sure requires clause is not broken
        DLIB_ASSERT(B.nr() == nr(),
            "\tconst matrix_type qr_decomposition::solve(B)"
            << "\n\tInvalid inputs were given to this function"
            << "\n\tB.nr():         " << B.nr()
            << "\n\tnr():           " << nr()
            << "\n\tthis:           " << this
            );

#ifdef DLIB_USE_LAPACK

        using namespace blas_bindings;
        matrix<type,0,0,mem_manager_type,column_major_layout> X(B);
        // Compute Y = transpose(Q)*B
        lapack::ormqr('L','T',QR_, tau, X);
        // Solve R*X = Y;
        triangular_solver(CblasLeft, CblasUpper, CblasNoTrans, CblasNonUnit, QR_, X, n);

        /* return n x nx portion of X */
        return subm(X,0,0,n,B.nc());

#else
        // just call the right version of the solve function
        if (B.nc() == 1)
            return solve_vect(B);
        else
            return solve_mat(B);
#endif
    }

// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------
//                           Private member functions
// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------

#ifndef DLIB_USE_LAPACK

    template <typename matrix_exp_type>
    template <typename EXP>
    const typename qr_decomposition<matrix_exp_type>::matrix_type qr_decomposition<matrix_exp_type>::
    solve_vect(
        const matrix_exp<EXP>& B
    ) const
    {

        column_vector_type x(B);

        // Compute Y = transpose(Q)*B
        for (long k = 0; k < n; k++) 
        {
            type s = 0.0; 
            for (long i = k; i < m; i++) 
            {
                s += QR_(i,k)*x(i);
            }
            s = -s/QR_(k,k);
            for (long i = k; i < m; i++) 
            {
                x(i) += s*QR_(i,k);
            }
        }
        // Solve R*X = Y;
        for (long k = n-1; k >= 0; k--) 
        {
            x(k) /= Rdiag(k);
            for (long i = 0; i < k; i++) 
            {
                x(i) -= x(k)*QR_(i,k);
            }
        }


        /* return n x 1 portion of x */
        return colm(x,0,n);
    }

// ----------------------------------------------------------------------------------------

    template <typename matrix_exp_type>
    template <typename EXP>
    const typename qr_decomposition<matrix_exp_type>::matrix_type qr_decomposition<matrix_exp_type>::
    solve_mat(
        const matrix_exp<EXP>& B
    ) const
    {
        const long nx = B.nc(); 
        matrix_type X(B);
        long i=0, j=0, k=0;

        // Compute Y = transpose(Q)*B
        for (k = 0; k < n; k++) 
        {
            for (j = 0; j < nx; j++) 
            {
                type s = 0.0; 
                for (i = k; i < m; i++) 
                {
                    s += QR_(i,k)*X(i,j);
                }
                s = -s/QR_(k,k);
                for (i = k; i < m; i++) 
                {
                    X(i,j) += s*QR_(i,k);
                }
            }
        }
        // Solve R*X = Y;
        for (k = n-1; k >= 0; k--) 
        {
            for (j = 0; j < nx; j++) 
            {
                X(k,j) /= Rdiag(k);
            }
            for (i = 0; i < k; i++) 
            {
                for (j = 0; j < nx; j++) 
                {
                    X(i,j) -= X(k,j)*QR_(i,k);
                }
            }
        }

        /* return n x nx portion of X */
        return subm(X,0,0,n,nx);
    }

// ----------------------------------------------------------------------------------------

#endif // DLIB_USE_LAPACK not defined

} 

#endif // DLIB_MATRIX_QR_DECOMPOSITION_H 



