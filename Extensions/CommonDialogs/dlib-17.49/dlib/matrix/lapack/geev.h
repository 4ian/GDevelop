// Copyright (C) 2010  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#ifndef DLIB_LAPACk_GEEV_H__
#define DLIB_LAPACk_GEEV_H__

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
                void DLIB_FORTRAN_ID(dgeev) (char *jobvl, char *jobvr, integer *n, double * a, 
                                             integer *lda, double *wr, double *wi, double *vl, 
                                             integer *ldvl, double *vr, integer *ldvr, double *work, 
                                             integer *lwork, integer *info);

                void DLIB_FORTRAN_ID(sgeev) (char *jobvl, char *jobvr, integer *n, float * a, 
                                             integer *lda, float *wr, float *wi, float *vl, 
                                             integer *ldvl, float *vr, integer *ldvr, float *work, 
                                             integer *lwork, integer *info);

            }

            inline int geev (char jobvl, char jobvr, integer n, double *a, 
                             integer lda, double *wr, double *wi, double *vl, 
                             integer ldvl, double *vr, integer ldvr, double *work, 
                             integer lwork)
            {
                integer info = 0;
                DLIB_FORTRAN_ID(dgeev)(&jobvl, &jobvr, &n, a,
                                       &lda, wr, wi, vl, 
                                       &ldvl, vr, &ldvr, work,
                                       &lwork, &info);
                return info;
            }

            inline int geev (char jobvl, char jobvr, integer n, float *a, 
                             integer lda, float *wr, float *wi, float *vl, 
                             integer ldvl, float *vr, integer ldvr, float *work, 
                             integer lwork)
            {
                integer info = 0;
                DLIB_FORTRAN_ID(sgeev)(&jobvl, &jobvr, &n, a,
                                       &lda, wr, wi, vl, 
                                       &ldvl, vr, &ldvr, work,
                                       &lwork, &info);
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

/*  DGEEV computes for an N-by-N real nonsymmetric matrix A, the */
/*  eigenvalues and, optionally, the left and/or right eigenvectors. */

/*  The right eigenvector v(j) of A satisfies */
/*                   A * v(j) = lambda(j) * v(j) */
/*  where lambda(j) is its eigenvalue. */
/*  The left eigenvector u(j) of A satisfies */
/*                u(j)**H * A = lambda(j) * u(j)**H */
/*  where u(j)**H denotes the conjugate transpose of u(j). */

/*  The computed eigenvectors are normalized to have Euclidean norm */
/*  equal to 1 and largest component real. */

/*  Arguments */
/*  ========= */

/*  JOBVL   (input) CHARACTER*1 */
/*          = 'N': left eigenvectors of A are not computed; */
/*          = 'V': left eigenvectors of A are computed. */

/*  JOBVR   (input) CHARACTER*1 */
/*          = 'N': right eigenvectors of A are not computed; */
/*          = 'V': right eigenvectors of A are computed. */

/*  N       (input) INTEGER */
/*          The order of the matrix A. N >= 0. */

/*  A       (input/output) DOUBLE PRECISION array, dimension (LDA,N) */
/*          On entry, the N-by-N matrix A. */
/*          On exit, A has been overwritten. */

/*  LDA     (input) INTEGER */
/*          The leading dimension of the array A.  LDA >= max(1,N). */

/*  WR      (output) DOUBLE PRECISION array, dimension (N) */
/*  WI      (output) DOUBLE PRECISION array, dimension (N) */
/*          WR and WI contain the real and imaginary parts, */
/*          respectively, of the computed eigenvalues.  Complex */
/*          conjugate pairs of eigenvalues appear consecutively */
/*          with the eigenvalue having the positive imaginary part */
/*          first. */

/*  VL      (output) DOUBLE PRECISION array, dimension (LDVL,N) */
/*          If JOBVL = 'V', the left eigenvectors u(j) are stored one */
/*          after another in the columns of VL, in the same order */
/*          as their eigenvalues. */
/*          If JOBVL = 'N', VL is not referenced. */
/*          If the j-th eigenvalue is real, then u(j) = VL(:,j), */
/*          the j-th column of VL. */
/*          If the j-th and (j+1)-st eigenvalues form a complex */
/*          conjugate pair, then u(j) = VL(:,j) + i*VL(:,j+1) and */
/*          u(j+1) = VL(:,j) - i*VL(:,j+1). */

/*  LDVL    (input) INTEGER */
/*          The leading dimension of the array VL.  LDVL >= 1; if */
/*          JOBVL = 'V', LDVL >= N. */

/*  VR      (output) DOUBLE PRECISION array, dimension (LDVR,N) */
/*          If JOBVR = 'V', the right eigenvectors v(j) are stored one */
/*          after another in the columns of VR, in the same order */
/*          as their eigenvalues. */
/*          If JOBVR = 'N', VR is not referenced. */
/*          If the j-th eigenvalue is real, then v(j) = VR(:,j), */
/*          the j-th column of VR. */
/*          If the j-th and (j+1)-st eigenvalues form a complex */
/*          conjugate pair, then v(j) = VR(:,j) + i*VR(:,j+1) and */
/*          v(j+1) = VR(:,j) - i*VR(:,j+1). */

/*  LDVR    (input) INTEGER */
/*          The leading dimension of the array VR.  LDVR >= 1; if */
/*          JOBVR = 'V', LDVR >= N. */

/*  WORK    (workspace/output) DOUBLE PRECISION array, dimension (MAX(1,LWORK)) */
/*          On exit, if INFO = 0, WORK(1) returns the optimal LWORK. */

/*  LWORK   (input) INTEGER */
/*          The dimension of the array WORK.  LWORK >= max(1,3*N), and */
/*          if JOBVL = 'V' or JOBVR = 'V', LWORK >= 4*N.  For good */
/*          performance, LWORK must generally be larger. */

/*          If LWORK = -1, then a workspace query is assumed; the routine */
/*          only calculates the optimal size of the WORK array, returns */
/*          this value as the first entry of the WORK array, and no error */
/*          message related to LWORK is issued by XERBLA. */

/*  INFO    (output) INTEGER */
/*          = 0:  successful exit */
/*          < 0:  if INFO = -i, the i-th argument had an illegal value. */
/*          > 0:  if INFO = i, the QR algorithm failed to compute all the */
/*                eigenvalues, and no eigenvectors have been computed; */
/*                elements i+1:N of WR and WI contain eigenvalues which */
/*                have converged. */

    // ------------------------------------------------------------------------------------

        template <
            typename T, 
            long NR1, long NR2, long NR3, long NR4, long NR5,
            long NC1, long NC2, long NC3, long NC4, long NC5,
            typename MM,
            typename layout
            >
        int geev (
            const char jobvl,
            const char jobvr,
            matrix<T,NR1,NC1,MM,column_major_layout>& a,
            matrix<T,NR2,NC2,MM,layout>& wr,
            matrix<T,NR3,NC3,MM,layout>& wi,
            matrix<T,NR4,NC4,MM,column_major_layout>& vl,
            matrix<T,NR5,NC5,MM,column_major_layout>& vr
        )
        {
            matrix<T,0,1,MM,column_major_layout> work;

            const long n = a.nr();

            wr.set_size(n,1);
            wi.set_size(n,1);

            if (jobvl == 'V')
                vl.set_size(n,n);
            else
                vl.set_size(NR4?NR4:1, NC4?NC4:1);

            if (jobvr == 'V')
                vr.set_size(n,n);
            else
                vr.set_size(NR5?NR5:1, NC5?NC5:1);


            // figure out how big the workspace needs to be.
            T work_size = 1;
            int info = binding::geev(jobvl, jobvr, n, &a(0,0),
                                     a.nr(), &wr(0,0), &wi(0,0), &vl(0,0),
                                     vl.nr(), &vr(0,0), vr.nr(), &work_size, 
                                     -1);

            if (info != 0)
                return info;

            if (work.size() < work_size)
                work.set_size(static_cast<long>(work_size), 1);

            // compute the actual decomposition 
            info = binding::geev(jobvl, jobvr, n, &a(0,0),
                                 a.nr(), &wr(0,0), &wi(0,0), &vl(0,0),
                                 vl.nr(), &vr(0,0), vr.nr(), &work(0,0), 
                                 work.size());

            return info;
        }

    // ------------------------------------------------------------------------------------

    }

}

// ----------------------------------------------------------------------------------------

#endif // DLIB_LAPACk_GEEV_H__


