// Copyright (C) 2010  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#ifndef DLIB_LAPACk_GEQRF_H__
#define DLIB_LAPACk_GEQRF_H__

#include "fortran_id.h"
#include "../matrix.h"

namespace dlib
{
    namespace lapack
    {
        namespace binding
        {
            extern "C"
            {
                void DLIB_FORTRAN_ID(dgeqrf) (integer *m, integer *n, double *a, integer *
                                              lda, double *tau, double *work, integer *lwork, 
                                              integer *info);

                void DLIB_FORTRAN_ID(sgeqrf) (integer *m, integer *n, float *a, integer *
                                              lda, float *tau, float *work, integer *lwork, 
                                              integer *info);
            }

            inline int geqrf (integer m, integer n, double *a, integer lda, 
                              double *tau, double *work, integer lwork)
            {
                integer info = 0;
                DLIB_FORTRAN_ID(dgeqrf)(&m, &n, a, &lda,
                                        tau, work, &lwork, &info);
                return info;
            }

            inline int geqrf (integer m, integer n, float *a, integer lda, 
                              float *tau, float *work, integer lwork)
            {
                integer info = 0;
                DLIB_FORTRAN_ID(sgeqrf)(&m, &n, a, &lda,
                                        tau, work, &lwork, &info);
                return info;
            }


        }

    // ------------------------------------------------------------------------------------

/*  -- LAPACK routine (version 3.1) -- */
/*     Univ. of Tennessee, Univ. of California Berkeley and NAG Ltd.. */
/*     November 2006 */

/*     .. Scalar Arguments .. */
/*     .. */
/*     .. Array Arguments .. */
/*     .. */

/*  Purpose */
/*  ======= */

/*  DGEQRF computes a QR factorization of a real M-by-N matrix A: */
/*  A = Q * R. */

/*  Arguments */
/*  ========= */

/*  M       (input) INTEGER */
/*          The number of rows of the matrix A.  M >= 0. */

/*  N       (input) INTEGER */
/*          The number of columns of the matrix A.  N >= 0. */

/*  A       (input/output) DOUBLE PRECISION array, dimension (LDA,N) */
/*          On entry, the M-by-N matrix A. */
/*          On exit, the elements on and above the diagonal of the array */
/*          contain the min(M,N)-by-N upper trapezoidal matrix R (R is */
/*          upper triangular if m >= n); the elements below the diagonal, */
/*          with the array TAU, represent the orthogonal matrix Q as a */
/*          product of min(m,n) elementary reflectors (see Further */
/*          Details). */

/*  LDA     (input) INTEGER */
/*          The leading dimension of the array A.  LDA >= max(1,M). */

/*  TAU     (output) DOUBLE PRECISION array, dimension (min(M,N)) */
/*          The scalar factors of the elementary reflectors (see Further */
/*          Details). */

/*  WORK    (workspace/output) DOUBLE PRECISION array, dimension (MAX(1,LWORK)) */
/*          On exit, if INFO = 0, WORK(1) returns the optimal LWORK. */

/*  LWORK   (input) INTEGER */
/*          The dimension of the array WORK.  LWORK >= max(1,N). */
/*          For optimum performance LWORK >= N*NB, where NB is */
/*          the optimal blocksize. */

/*          If LWORK = -1, then a workspace query is assumed; the routine */
/*          only calculates the optimal size of the WORK array, returns */
/*          this value as the first entry of the WORK array, and no error */
/*          message related to LWORK is issued by XERBLA. */

/*  INFO    (output) INTEGER */
/*          = 0:  successful exit */
/*          < 0:  if INFO = -i, the i-th argument had an illegal value */

/*  Further Details */
/*  =============== */

/*  The matrix Q is represented as a product of elementary reflectors */

/*     Q = H(1) H(2) . . . H(k), where k = min(m,n). */

/*  Each H(i) has the form */

/*     H(i) = I - tau * v * v' */

/*  where tau is a real scalar, and v is a real vector with */
/*  v(1:i-1) = 0 and v(i) = 1; v(i+1:m) is stored on exit in A(i+1:m,i), */
/*  and tau in TAU(i). */


    // ------------------------------------------------------------------------------------

        template <
            typename T, 
            long NR1, long NR2,
            long NC1, long NC2,
            typename MM
            >
        int geqrf (
            matrix<T,NR1,NC1,MM,column_major_layout>& a,
            matrix<T,NR2,NC2,MM,column_major_layout>& tau
        )
        {
            matrix<T,0,1,MM,column_major_layout> work;

            tau.set_size(std::min(a.nr(), a.nc()), 1);

            // figure out how big the workspace needs to be.
            T work_size = 1;
            int info = binding::geqrf(a.nr(), a.nc(), &a(0,0), a.nr(),
                                      &tau(0,0), &work_size, -1);

            if (info != 0)
                return info;

            if (work.size() < work_size)
                work.set_size(static_cast<long>(work_size), 1);

            // compute the actual decomposition 
            info = binding::geqrf(a.nr(), a.nc(), &a(0,0), a.nr(),
                                  &tau(0,0), &work(0,0), work.size());

            return info;
        }

    // ------------------------------------------------------------------------------------

    }

}

// ----------------------------------------------------------------------------------------

#endif // DLIB_LAPACk_GEQRF_H__



