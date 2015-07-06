// Copyright (C) 2010  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#ifndef DLIB_LAPACk_ORMQR_Hh_
#define DLIB_LAPACk_ORMQR_Hh_

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
                void DLIB_FORTRAN_ID(dormqr) (char *side, char *trans, integer *m, integer *n, 
                                              integer *k, const double *a, integer *lda, const double *tau, 
                                              double * c_, integer *ldc, double *work, integer *lwork, 
                                              integer *info);

                void DLIB_FORTRAN_ID(sormqr) (char *side, char *trans, integer *m, integer *n, 
                                              integer *k, const float *a, integer *lda, const float *tau, 
                                              float * c_, integer *ldc, float *work, integer *lwork, 
                                              integer *info);

            }

            inline int ormqr (char side, char trans, integer m, integer n, 
                              integer k, const double *a, integer lda, const double *tau, 
                              double *c_, integer ldc, double *work, integer lwork)
            {
                integer info = 0;
                DLIB_FORTRAN_ID(dormqr)(&side, &trans, &m, &n,
                                        &k, a, &lda, tau,
                                        c_, &ldc, work, &lwork, &info);
                return info;
            }

            inline int ormqr (char side, char trans, integer m, integer n, 
                              integer k, const float *a, integer lda, const float *tau, 
                              float *c_, integer ldc, float *work, integer lwork)
            {
                integer info = 0;
                DLIB_FORTRAN_ID(sormqr)(&side, &trans, &m, &n,
                                        &k, a, &lda, tau,
                                        c_, &ldc, work, &lwork, &info);
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

/*  DORMQR overwrites the general real M-by-N matrix C with */

/*                  SIDE = 'L'     SIDE = 'R' */
/*  TRANS = 'N':      Q * C          C * Q */
/*  TRANS = 'T':      Q**T * C       C * Q**T */

/*  where Q is a real orthogonal matrix defined as the product of k */
/*  elementary reflectors */

/*        Q = H(1) H(2) . . . H(k) */

/*  as returned by DGEQRF. Q is of order M if SIDE = 'L' and of order N */
/*  if SIDE = 'R'. */

/*  Arguments */
/*  ========= */

/*  SIDE    (input) CHARACTER*1 */
/*          = 'L': apply Q or Q**T from the Left; */
/*          = 'R': apply Q or Q**T from the Right. */

/*  TRANS   (input) CHARACTER*1 */
/*          = 'N':  No transpose, apply Q; */
/*          = 'T':  Transpose, apply Q**T. */

/*  M       (input) INTEGER */
/*          The number of rows of the matrix C. M >= 0. */

/*  N       (input) INTEGER */
/*          The number of columns of the matrix C. N >= 0. */

/*  K       (input) INTEGER */
/*          The number of elementary reflectors whose product defines */
/*          the matrix Q. */
/*          If SIDE = 'L', M >= K >= 0; */
/*          if SIDE = 'R', N >= K >= 0. */

/*  A       (input) DOUBLE PRECISION array, dimension (LDA,K) */
/*          The i-th column must contain the vector which defines the */
/*          elementary reflector H(i), for i = 1,2,...,k, as returned by */
/*          DGEQRF in the first k columns of its array argument A. */
/*          A is modified by the routine but restored on exit. */

/*  LDA     (input) INTEGER */
/*          The leading dimension of the array A. */
/*          If SIDE = 'L', LDA >= max(1,M); */
/*          if SIDE = 'R', LDA >= max(1,N). */

/*  TAU     (input) DOUBLE PRECISION array, dimension (K) */
/*          TAU(i) must contain the scalar factor of the elementary */
/*          reflector H(i), as returned by DGEQRF. */

/*  C       (input/output) DOUBLE PRECISION array, dimension (LDC,N) */
/*          On entry, the M-by-N matrix C. */
/*          On exit, C is overwritten by Q*C or Q**T*C or C*Q**T or C*Q. */

/*  LDC     (input) INTEGER */
/*          The leading dimension of the array C. LDC >= max(1,M). */

/*  WORK    (workspace/output) DOUBLE PRECISION array, dimension (MAX(1,LWORK)) */
/*          On exit, if INFO = 0, WORK(1) returns the optimal LWORK. */

/*  LWORK   (input) INTEGER */
/*          The dimension of the array WORK. */
/*          If SIDE = 'L', LWORK >= max(1,N); */
/*          if SIDE = 'R', LWORK >= max(1,M). */
/*          For optimum performance LWORK >= N*NB if SIDE = 'L', and */
/*          LWORK >= M*NB if SIDE = 'R', where NB is the optimal */
/*          blocksize. */

/*          If LWORK = -1, then a workspace query is assumed; the routine */
/*          only calculates the optimal size of the WORK array, returns */
/*          this value as the first entry of the WORK array, and no error */
/*          message related to LWORK is issued by XERBLA. */

/*  INFO    (output) INTEGER */
/*          = 0:  successful exit */
/*          < 0:  if INFO = -i, the i-th argument had an illegal value */

    // ------------------------------------------------------------------------------------

        template <
            typename T, 
            long NR1, long NR2, long NR3,
            long NC1, long NC2, long NC3,
            typename MM,
            typename C_LAYOUT
            >
        int ormqr (
            char side, 
            char trans,
            const matrix<T,NR1,NC1,MM,column_major_layout>& a,
            const matrix<T,NR2,NC2,MM,column_major_layout>& tau,
            matrix<T,NR3,NC3,MM,C_LAYOUT>& c 
        )
        {
            long m = c.nr();
            long n = c.nc();
            const long k = a.nc();
            long ldc;
            if (is_same_type<C_LAYOUT,column_major_layout>::value)
            {
                ldc = c.nr();
            }
            else
            {
                // Since lapack expects c to be in column major layout we have to 
                // do something to make this work.  Since a row major layout matrix
                // will look just like a transposed C we can just swap a few things around.

                ldc = c.nc();
                swap(m,n);

                if (side == 'L')
                    side = 'R';
                else
                    side = 'L';

                if (trans == 'T')
                    trans = 'N';
                else
                    trans = 'T';
            }

            matrix<T,0,1,MM,column_major_layout> work;

            // figure out how big the workspace needs to be.
            T work_size = 1;
            int info = binding::ormqr(side, trans, m, n, 
                                      k, &a(0,0), a.nr(), &tau(0,0),
                                      &c(0,0), ldc, &work_size, -1);

            if (info != 0)
                return info;

            if (work.size() < work_size)
                work.set_size(static_cast<long>(work_size), 1);

            // compute the actual result 
            info = binding::ormqr(side, trans, m, n, 
                                  k, &a(0,0), a.nr(), &tau(0,0),
                                  &c(0,0), ldc, &work(0,0), work.size());

            return info;
        }

    // ------------------------------------------------------------------------------------

    }

}

// ----------------------------------------------------------------------------------------

#endif // DLIB_LAPACk_ORMQR_Hh_

