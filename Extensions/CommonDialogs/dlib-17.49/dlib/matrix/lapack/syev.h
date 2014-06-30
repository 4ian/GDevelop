// Copyright (C) 2010  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#ifndef DLIB_LAPACk_EV_H__
#define DLIB_LAPACk_EV_H__

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
                void DLIB_FORTRAN_ID(dsyev) (char *jobz, char *uplo, integer *n, double *a,
                                             integer *lda, double *w, double *work, integer *lwork, 
                                             integer *info);

                void DLIB_FORTRAN_ID(ssyev) (char *jobz, char *uplo, integer *n, float *a,
                                             integer *lda, float *w, float *work, integer *lwork, 
                                             integer *info);

            }

            inline int syev (char jobz, char uplo, integer n, double *a,
                             integer lda, double *w, double *work, integer lwork)
            {
                integer info = 0;
                DLIB_FORTRAN_ID(dsyev)(&jobz, &uplo, &n, a,
                                       &lda, w, work, &lwork, &info);
                return info;
            }

            inline int syev (char jobz, char uplo, integer n, float *a,
                             integer lda, float *w, float *work, integer lwork)
            {
                integer info = 0;
                DLIB_FORTRAN_ID(ssyev)(&jobz, &uplo, &n, a,
                                       &lda, w, work, &lwork, &info);
                return info;
            }


        }

    // ------------------------------------------------------------------------------------

/*  -- LAPACK driver routine (version 3.1) -- */
/*     Univ. of Tennessee, Univ. of California Berkeley and NAG Ltd.. */
/*     November 2006 */

/*     .. Scalar Arguments .. */
/*     .. */
/*     .. Array Arguments .. */
/*     .. */

/*  Purpose */
/*  ======= */

/*  DSYEV computes all eigenvalues and, optionally, eigenvectors of a */
/*  real symmetric matrix A. */

/*  Arguments */
/*  ========= */

/*  JOBZ    (input) CHARACTER*1 */
/*          = 'N':  Compute eigenvalues only; */
/*          = 'V':  Compute eigenvalues and eigenvectors. */

/*  UPLO    (input) CHARACTER*1 */
/*          = 'U':  Upper triangle of A is stored; */
/*          = 'L':  Lower triangle of A is stored. */

/*  N       (input) INTEGER */
/*          The order of the matrix A.  N >= 0. */

/*  A       (input/output) DOUBLE PRECISION array, dimension (LDA, N) */
/*          On entry, the symmetric matrix A.  If UPLO = 'U', the */
/*          leading N-by-N upper triangular part of A contains the */
/*          upper triangular part of the matrix A.  If UPLO = 'L', */
/*          the leading N-by-N lower triangular part of A contains */
/*          the lower triangular part of the matrix A. */
/*          On exit, if JOBZ = 'V', then if INFO = 0, A contains the */
/*          orthonormal eigenvectors of the matrix A. */
/*          If JOBZ = 'N', then on exit the lower triangle (if UPLO='L') */
/*          or the upper triangle (if UPLO='U') of A, including the */
/*          diagonal, is destroyed. */

/*  LDA     (input) INTEGER */
/*          The leading dimension of the array A.  LDA >= max(1,N). */

/*  W       (output) DOUBLE PRECISION array, dimension (N) */
/*          If INFO = 0, the eigenvalues in ascending order. */

/*  WORK    (workspace/output) DOUBLE PRECISION array, dimension (MAX(1,LWORK)) */
/*          On exit, if INFO = 0, WORK(1) returns the optimal LWORK. */

/*  LWORK   (input) INTEGER */
/*          The length of the array WORK.  LWORK >= max(1,3*N-1). */
/*          For optimal efficiency, LWORK >= (NB+2)*N, */
/*          where NB is the blocksize for DSYTRD returned by ILAENV. */

/*          If LWORK = -1, then a workspace query is assumed; the routine */
/*          only calculates the optimal size of the WORK array, returns */
/*          this value as the first entry of the WORK array, and no error */
/*          message related to LWORK is issued by XERBLA. */

/*  INFO    (output) INTEGER */
/*          = 0:  successful exit */
/*          < 0:  if INFO = -i, the i-th argument had an illegal value */
/*          > 0:  if INFO = i, the algorithm failed to converge; i */
/*                off-diagonal elements of an intermediate tridiagonal */
/*                form did not converge to zero. */


    // ------------------------------------------------------------------------------------

        template <
            typename T, 
            long NR1, long NR2, 
            long NC1, long NC2,
            typename MM
            >
        int syev (
            const char jobz,
            const char uplo,
            matrix<T,NR1,NC1,MM,column_major_layout>& a,
            matrix<T,NR2,NC2,MM,column_major_layout>& w
        )
        {
            matrix<T,0,1,MM,column_major_layout> work;

            const long n = a.nr();

            w.set_size(n,1);


            // figure out how big the workspace needs to be.
            T work_size = 1;
            int info = binding::syev(jobz, uplo, n, &a(0,0),
                                     a.nr(), &w(0,0), &work_size, -1);

            if (info != 0)
                return info;

            if (work.size() < work_size)
                work.set_size(static_cast<long>(work_size), 1);

            // compute the actual decomposition 
            info = binding::syev(jobz, uplo, n, &a(0,0),
                                 a.nr(), &w(0,0), &work(0,0), work.size());

            return info;
        }

    // ------------------------------------------------------------------------------------

        template <
            typename T, 
            long NR1, long NR2, 
            long NC1, long NC2,
            typename MM
            >
        int syev (
            char jobz,
            char uplo,
            matrix<T,NR1,NC1,MM,row_major_layout>& a,
            matrix<T,NR2,NC2,MM,row_major_layout>& w
        )
        {
            matrix<T,0,1,MM,row_major_layout> work;

            if (uplo == 'L')
                uplo = 'U';
            else
                uplo = 'L';

            const long n = a.nr();

            w.set_size(n,1);


            // figure out how big the workspace needs to be.
            T work_size = 1;
            int info = binding::syev(jobz, uplo, n, &a(0,0),
                                     a.nc(), &w(0,0), &work_size, -1);

            if (info != 0)
                return info;

            if (work.size() < work_size)
                work.set_size(static_cast<long>(work_size), 1);

            // compute the actual decomposition 
            info = binding::syev(jobz, uplo, n, &a(0,0),
                                 a.nc(), &w(0,0), &work(0,0), work.size());


            a = trans(a);

            return info;
        }

    // ------------------------------------------------------------------------------------

    }

}

// ----------------------------------------------------------------------------------------

#endif // DLIB_LAPACk_EV_H__




