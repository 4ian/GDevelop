// Copyright (C) 2010  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#ifndef DLIB_LAPACk_POTRF_Hh_
#define DLIB_LAPACk_POTRF_Hh_

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
                void DLIB_FORTRAN_ID(dpotrf) (char *uplo, integer *n, double *a, 
                                              integer* lda, integer *info);

                void DLIB_FORTRAN_ID(spotrf) (char *uplo, integer *n, float *a, 
                                              integer* lda, integer *info);

            }

            inline int potrf (char uplo, integer n, double *a, integer lda)
            {
                integer info = 0;
                DLIB_FORTRAN_ID(dpotrf)(&uplo, &n, a, &lda, &info);
                return info;
            }

            inline int potrf (char uplo, integer n, float *a, integer lda)
            {
                integer info = 0;
                DLIB_FORTRAN_ID(spotrf)(&uplo, &n, a, &lda, &info);
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

/*  DPOTRF computes the Cholesky factorization of a real symmetric */
/*  positive definite matrix A. */

/*  The factorization has the form */
/*     A = U**T * U,  if UPLO = 'U', or */
/*     A = L  * L**T,  if UPLO = 'L', */
/*  where U is an upper triangular matrix and L is lower triangular. */

/*  This is the block version of the algorithm, calling Level 3 BLAS. */

/*  Arguments */
/*  ========= */

/*  UPLO    (input) CHARACTER*1 */
/*          = 'U':  Upper triangle of A is stored; */
/*          = 'L':  Lower triangle of A is stored. */

/*  N       (input) INTEGER */
/*          The order of the matrix A.  N >= 0. */

/*  A       (input/output) DOUBLE PRECISION array, dimension (LDA,N) */
/*          On entry, the symmetric matrix A.  If UPLO = 'U', the leading */
/*          N-by-N upper triangular part of A contains the upper */
/*          triangular part of the matrix A, and the strictly lower */
/*          triangular part of A is not referenced.  If UPLO = 'L', the */
/*          leading N-by-N lower triangular part of A contains the lower */
/*          triangular part of the matrix A, and the strictly upper */
/*          triangular part of A is not referenced. */

/*          On exit, if INFO = 0, the factor U or L from the Cholesky */
/*          factorization A = U**T*U or A = L*L**T. */

/*  LDA     (input) INTEGER */
/*          The leading dimension of the array A.  LDA >= max(1,N). */

/*  INFO    (output) INTEGER */
/*          = 0:  successful exit */
/*          < 0:  if INFO = -i, the i-th argument had an illegal value */
/*          > 0:  if INFO = i, the leading minor of order i is not */
/*                positive definite, and the factorization could not be */
/*                completed. */


    // ------------------------------------------------------------------------------------

        template <
            typename T, 
            long NR1,
            long NC1, 
            typename MM
            >
        int potrf (
            char uplo,
            matrix<T,NR1,NC1,MM,column_major_layout>& a
        )
        {
            // compute the actual decomposition 
            int info = binding::potrf(uplo, a.nr(), &a(0,0), a.nr());

            // If it fails part way though the factorization then make sure
            // the end of the matrix gets properly initialized with zeros.
            if (info > 0)
            {
                if (uplo == 'L')
                    set_colm(a, range(info-1, a.nc()-1)) = 0;
                else
                    set_rowm(a, range(info-1, a.nr()-1)) = 0;
            }

            return info;
        }

    // ------------------------------------------------------------------------------------

        template <
            typename T, 
            long NR1,
            long NC1, 
            typename MM
            >
        int potrf (
            char uplo,
            matrix<T,NR1,NC1,MM,row_major_layout>& a
        )
        {
            // since we are working on a row major order matrix we need to ask
            // LAPACK for the transpose of whatever the user asked for.

            if (uplo == 'L')
                uplo = 'U';
            else
                uplo = 'L';

            // compute the actual decomposition 
            int info = binding::potrf(uplo, a.nr(), &a(0,0), a.nr());

            // If it fails part way though the factorization then make sure
            // the end of the matrix gets properly initialized with zeros.
            if (info > 0)
            {
                if (uplo == 'U')
                    set_colm(a, range(info-1, a.nc()-1)) = 0;
                else
                    set_rowm(a, range(info-1, a.nr()-1)) = 0;
            }

            return info;
        }

    // ------------------------------------------------------------------------------------

    }

}

// ----------------------------------------------------------------------------------------

#endif // DLIB_LAPACk_POTRF_Hh_


