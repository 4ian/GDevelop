// Copyright (C) 2010  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#ifndef DLIB_LAPACk_ES_H__
#define DLIB_LAPACk_ES_H__

#include "fortran_id.h"
#include "../matrix.h"

namespace dlib
{
    namespace lapack
    {
        namespace binding
        {
#if defined(__alpha__) || defined(__sparc64__) || defined(__x86_64__) || defined(__ia64__)
            typedef int logical;
#else
            typedef long int logical;
#endif
            typedef logical (*L_fp)(...);

            extern "C"
            {
                void DLIB_FORTRAN_ID(dgees) (char *jobvs, char *sort, L_fp select, integer *n, 
                                             double *a, integer *lda, integer *sdim, double *wr, 
                                             double *wi, double *vs, integer *ldvs, double *work, 
                                             integer *lwork, logical *bwork, integer *info);

                void DLIB_FORTRAN_ID(sgees) (char *jobvs, char *sort, L_fp select, integer *n, 
                                             float *a, integer *lda, integer *sdim, float *wr, 
                                             float *wi, float *vs, integer *ldvs, float *work, 
                                             integer *lwork, logical *bwork, integer *info);

            }

            inline int gees (char jobvs, integer n, 
                             double *a, integer lda, double *wr, 
                             double *wi, double *vs, integer ldvs, double *work, 
                             integer lwork)
            {
                // No sorting allowed
                integer info = 0;
                char sort = 'N';
                L_fp fnil = 0;
                logical nil = 0;
                integer sdim = 0;
                DLIB_FORTRAN_ID(dgees)(&jobvs, &sort, fnil, &n,
                                       a, &lda, &sdim, wr,
                                       wi, vs, &ldvs, work,
                                       &lwork, &nil, &info);
                return info;
            }


            inline int gees (char jobvs, integer n, 
                             float *a, integer lda, float *wr, 
                             float *wi, float *vs, integer ldvs, float *work, 
                             integer lwork)
            {
                // No sorting allowed
                integer info = 0;
                char sort = 'N';
                L_fp fnil = 0;
                logical nil = 0;
                integer sdim = 0;
                DLIB_FORTRAN_ID(sgees)(&jobvs, &sort, fnil, &n,
                                       a, &lda, &sdim, wr,
                                       wi, vs, &ldvs, work,
                                       &lwork, &nil, &info);
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
/*     .. Function Arguments .. */
/*     .. */

/*  Purpose */
/*  ======= */

/*  DGEES computes for an N-by-N real nonsymmetric matrix A, the */
/*  eigenvalues, the real Schur form T, and, optionally, the matrix of */
/*  Schur vectors Z.  This gives the Schur factorization A = Z*T*(Z**T). */

/*  Optionally, it also orders the eigenvalues on the diagonal of the */
/*  real Schur form so that selected eigenvalues are at the top left. */
/*  The leading columns of Z then form an orthonormal basis for the */
/*  invariant subspace corresponding to the selected eigenvalues. */

/*  A matrix is in real Schur form if it is upper quasi-triangular with */
/*  1-by-1 and 2-by-2 blocks. 2-by-2 blocks will be standardized in the */
/*  form */
/*          [  a  b  ] */
/*          [  c  a  ] */

/*  where b*c < 0. The eigenvalues of such a block are a +- sqrt(bc). */

/*  Arguments */
/*  ========= */

/*  JOBVS   (input) CHARACTER*1 */
/*          = 'N': Schur vectors are not computed; */
/*          = 'V': Schur vectors are computed. */

/*  SORT    (input) CHARACTER*1 */
/*          Specifies whether or not to order the eigenvalues on the */
/*          diagonal of the Schur form. */
/*          = 'N': Eigenvalues are not ordered; */
/*          = 'S': Eigenvalues are ordered (see SELECT). */

/*  SELECT  (external procedure) LOGICAL FUNCTION of two DOUBLE PRECISION arguments */
/*          SELECT must be declared EXTERNAL in the calling subroutine. */
/*          If SORT = 'S', SELECT is used to select eigenvalues to sort */
/*          to the top left of the Schur form. */
/*          If SORT = 'N', SELECT is not referenced. */
/*          An eigenvalue WR(j)+sqrt(-1)*WI(j) is selected if */
/*          SELECT(WR(j),WI(j)) is true; i.e., if either one of a complex */
/*          conjugate pair of eigenvalues is selected, then both complex */
/*          eigenvalues are selected. */
/*          Note that a selected complex eigenvalue may no longer */
/*          satisfy SELECT(WR(j),WI(j)) = .TRUE. after ordering, since */
/*          ordering may change the value of complex eigenvalues */
/*          (especially if the eigenvalue is ill-conditioned); in this */
/*          case INFO is set to N+2 (see INFO below). */

/*  N       (input) INTEGER */
/*          The order of the matrix A. N >= 0. */

/*  A       (input/output) DOUBLE PRECISION array, dimension (LDA,N) */
/*          On entry, the N-by-N matrix A. */
/*          On exit, A has been overwritten by its real Schur form T. */

/*  LDA     (input) INTEGER */
/*          The leading dimension of the array A.  LDA >= max(1,N). */

/*  SDIM    (output) INTEGER */
/*          If SORT = 'N', SDIM = 0. */
/*          If SORT = 'S', SDIM = number of eigenvalues (after sorting) */
/*                         for which SELECT is true. (Complex conjugate */
/*                         pairs for which SELECT is true for either */
/*                         eigenvalue count as 2.) */

/*  WR      (output) DOUBLE PRECISION array, dimension (N) */
/*  WI      (output) DOUBLE PRECISION array, dimension (N) */
/*          WR and WI contain the real and imaginary parts, */
/*          respectively, of the computed eigenvalues in the same order */
/*          that they appear on the diagonal of the output Schur form T. */
/*          Complex conjugate pairs of eigenvalues will appear */
/*          consecutively with the eigenvalue having the positive */
/*          imaginary part first. */

/*  VS      (output) DOUBLE PRECISION array, dimension (LDVS,N) */
/*          If JOBVS = 'V', VS contains the orthogonal matrix Z of Schur */
/*          vectors. */
/*          If JOBVS = 'N', VS is not referenced. */

/*  LDVS    (input) INTEGER */
/*          The leading dimension of the array VS.  LDVS >= 1; if */
/*          JOBVS = 'V', LDVS >= N. */

/*  WORK    (workspace/output) DOUBLE PRECISION array, dimension (MAX(1,LWORK)) */
/*          On exit, if INFO = 0, WORK(1) contains the optimal LWORK. */

/*  LWORK   (input) INTEGER */
/*          The dimension of the array WORK.  LWORK >= max(1,3*N). */
/*          For good performance, LWORK must generally be larger. */

/*          If LWORK = -1, then a workspace query is assumed; the routine */
/*          only calculates the optimal size of the WORK array, returns */
/*          this value as the first entry of the WORK array, and no error */
/*          message related to LWORK is issued by XERBLA. */

/*  BWORK   (workspace) LOGICAL array, dimension (N) */
/*          Not referenced if SORT = 'N'. */

/*  INFO    (output) INTEGER */
/*          = 0: successful exit */
/*          < 0: if INFO = -i, the i-th argument had an illegal value. */
/*          > 0: if INFO = i, and i is */
/*             <= N: the QR algorithm failed to compute all the */
/*                   eigenvalues; elements 1:ILO-1 and i+1:N of WR and WI */
/*                   contain those eigenvalues which have converged; if */
/*                   JOBVS = 'V', VS contains the matrix which reduces A */
/*                   to its partially converged Schur form. */
/*             = N+1: the eigenvalues could not be reordered because some */
/*                   eigenvalues were too close to separate (the problem */
/*                   is very ill-conditioned); */
/*             = N+2: after reordering, roundoff changed values of some */
/*                   complex eigenvalues so that leading eigenvalues in */
/*                   the Schur form no longer satisfy SELECT=.TRUE.  This */
/*                   could also be caused by underflow due to scaling. */

    // ------------------------------------------------------------------------------------

        template <
            typename T, 
            long NR1, long NR2, long NR3, long NR4,
            long NC1, long NC2, long NC3, long NC4,
            typename MM,
            typename layout
            >
        int gees (
            const char jobz,
            matrix<T,NR1,NC1,MM,column_major_layout>& a,
            matrix<T,NR2,NC2,MM,layout>& wr,
            matrix<T,NR3,NC3,MM,layout>& wi,
            matrix<T,NR4,NC4,MM,column_major_layout>& vs
        )
        {
            matrix<T,0,1,MM,column_major_layout> work;

            const long n = a.nr();

            wr.set_size(n,1);
            wi.set_size(n,1);

            if (jobz == 'V')
                vs.set_size(n,n);
            else
                vs.set_size(NR4?NR4:1, NC4?NC4:1);

            // figure out how big the workspace needs to be.
            T work_size = 1;
            int info = binding::gees(jobz, n, 
                                     &a(0,0), a.nr(), &wr(0,0), 
                                     &wi(0,0), &vs(0,0), vs.nr(), &work_size, 
                                     -1);

            if (info != 0)
                return info;

            if (work.size() < work_size)
                work.set_size(static_cast<long>(work_size), 1);

            // compute the actual decomposition 
            info = binding::gees(jobz, n, 
                                 &a(0,0), a.nr(), &wr(0,0), 
                                 &wi(0,0), &vs(0,0), vs.nr(), &work(0,0), 
                                 work.size());

            return info;
        }

    // ------------------------------------------------------------------------------------

    }

}

// ----------------------------------------------------------------------------------------

#endif // DLIB_LAPACk_ES_H__

