// Copyright (C) 2010  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#ifndef DLIB_LAPACk_SDD_H__
#define DLIB_LAPACk_SDD_H__

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
                void DLIB_FORTRAN_ID(dgesdd) (char const* jobz, 
                                              const integer* m, const integer* n, double* a, const integer* lda,
                                              double* s, double* u, const integer* ldu,
                                              double* vt, const integer* ldvt,
                                              double* work, const integer* lwork, integer* iwork, integer* info);

                void DLIB_FORTRAN_ID(sgesdd) (char const* jobz, 
                                              const integer* m, const integer* n, float* a, const integer* lda,
                                              float* s, float* u, const integer* ldu,
                                              float* vt, const integer* ldvt,
                                              float* work, const integer* lwork, integer* iwork, integer* info);

            }

            inline integer gesdd (const char jobz, 
                              const integer m, const integer n, double* a, const integer lda,
                              double* s, double* u, const integer ldu,
                              double* vt, const integer ldvt,
                              double* work, const integer lwork, integer* iwork)
            {
                integer info = 0;
                DLIB_FORTRAN_ID(dgesdd)(&jobz, &m, &n, a, &lda, s, u, &ldu, vt, &ldvt, work, &lwork, iwork, &info);
                return info;
            }

            inline integer gesdd (const char jobz, 
                              const integer m, const integer n, float* a, const integer lda,
                              float* s, float* u, const integer ldu,
                              float* vt, const integer ldvt,
                              float* work, const integer lwork, integer* iwork)
            {
                integer info = 0;
                DLIB_FORTRAN_ID(sgesdd)(&jobz, &m, &n, a, &lda, s, u, &ldu, vt, &ldvt, work, &lwork, iwork, &info);
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

/*  DGESDD computes the singular value decomposition (SVD) of a real */
/*  M-by-N matrix A, optionally computing the left and right singular */
/*  vectors.  If singular vectors are desired, it uses a */
/*  divide-and-conquer algorithm. */

/*  The SVD is written */

/*       A = U * SIGMA * transpose(V) */

/*  where SIGMA is an M-by-N matrix which is zero except for its */
/*  min(m,n) diagonal elements, U is an M-by-M orthogonal matrix, and */
/*  V is an N-by-N orthogonal matrix.  The diagonal elements of SIGMA */
/*  are the singular values of A; they are real and non-negative, and */
/*  are returned in descending order.  The first min(m,n) columns of */
/*  U and V are the left and right singular vectors of A. */

/*  Note that the routine returns VT = V**T, not V. */

/*  The divide and conquer algorithm makes very mild assumptions about */
/*  floating point arithmetic. It will work on machines with a guard */
/*  digit in add/subtract, or on those binary machines without guard */
/*  digits which subtract like the Cray X-MP, Cray Y-MP, Cray C-90, or */
/*  Cray-2. It could conceivably fail on hexadecimal or decimal machines */
/*  without guard digits, but we know of none. */

/*  Arguments */
/*  ========= */

/*  JOBZ    (input) CHARACTER*1 */
/*          Specifies options for computing all or part of the matrix U: */
/*          = 'A':  all M columns of U and all N rows of V**T are */
/*                  returned in the arrays U and VT; */
/*          = 'S':  the first min(M,N) columns of U and the first */
/*                  min(M,N) rows of V**T are returned in the arrays U */
/*                  and VT; */
/*          = 'O':  If M >= N, the first N columns of U are overwritten */
/*                  on the array A and all rows of V**T are returned in */
/*                  the array VT; */
/*                  otherwise, all columns of U are returned in the */
/*                  array U and the first M rows of V**T are overwritten */
/*                  in the array A; */
/*          = 'N':  no columns of U or rows of V**T are computed. */

/*  M       (input) INTEGER */
/*          The number of rows of the input matrix A.  M >= 0. */

/*  N       (input) INTEGER */
/*          The number of columns of the input matrix A.  N >= 0. */

/*  A       (input/output) DOUBLE PRECISION array, dimension (LDA,N) */
/*          On entry, the M-by-N matrix A. */
/*          On exit, */
/*          if JOBZ = 'O',  A is overwritten with the first N columns */
/*                          of U (the left singular vectors, stored */
/*                          columnwise) if M >= N; */
/*                          A is overwritten with the first M rows */
/*                          of V**T (the right singular vectors, stored */
/*                          rowwise) otherwise. */
/*          if JOBZ .ne. 'O', the contents of A are destroyed. */

/*  LDA     (input) INTEGER */
/*          The leading dimension of the array A.  LDA >= max(1,M). */

/*  S       (output) DOUBLE PRECISION array, dimension (min(M,N)) */
/*          The singular values of A, sorted so that S(i) >= S(i+1). */

/*  U       (output) DOUBLE PRECISION array, dimension (LDU,UCOL) */
/*          UCOL = M if JOBZ = 'A' or JOBZ = 'O' and M < N; */
/*          UCOL = min(M,N) if JOBZ = 'S'. */
/*          If JOBZ = 'A' or JOBZ = 'O' and M < N, U contains the M-by-M */
/*          orthogonal matrix U; */
/*          if JOBZ = 'S', U contains the first min(M,N) columns of U */
/*          (the left singular vectors, stored columnwise); */
/*          if JOBZ = 'O' and M >= N, or JOBZ = 'N', U is not referenced. */

/*  LDU     (input) INTEGER */
/*          The leading dimension of the array U.  LDU >= 1; if */
/*          JOBZ = 'S' or 'A' or JOBZ = 'O' and M < N, LDU >= M. */

/*  VT      (output) DOUBLE PRECISION array, dimension (LDVT,N) */
/*          If JOBZ = 'A' or JOBZ = 'O' and M >= N, VT contains the */
/*          N-by-N orthogonal matrix V**T; */
/*          if JOBZ = 'S', VT contains the first min(M,N) rows of */
/*          V**T (the right singular vectors, stored rowwise); */
/*          if JOBZ = 'O' and M < N, or JOBZ = 'N', VT is not referenced. */

/*  LDVT    (input) INTEGER */
/*          The leading dimension of the array VT.  LDVT >= 1; if */
/*          JOBZ = 'A' or JOBZ = 'O' and M >= N, LDVT >= N; */
/*          if JOBZ = 'S', LDVT >= min(M,N). */

/*  WORK    (workspace/output) DOUBLE PRECISION array, dimension (MAX(1,LWORK)) */
/*          On exit, if INFO = 0, WORK(1) returns the optimal LWORK; */

/*  LWORK   (input) INTEGER */
/*          The dimension of the array WORK. LWORK >= 1. */
/*          If JOBZ = 'N', */
/*            LWORK >= 3*min(M,N) + max(max(M,N),7*min(M,N)). */
/*          If JOBZ = 'O', */
/*            LWORK >= 3*min(M,N)*min(M,N) + */
/*                     max(max(M,N),5*min(M,N)*min(M,N)+4*min(M,N)). */
/*          If JOBZ = 'S' or 'A' */
/*            LWORK >= 3*min(M,N)*min(M,N) + */
/*                     max(max(M,N),4*min(M,N)*min(M,N)+4*min(M,N)). */
/*          For good performance, LWORK should generally be larger. */
/*          If LWORK = -1 but other input arguments are legal, WORK(1) */
/*          returns the optimal LWORK. */

/*  IWORK   (workspace) INTEGER array, dimension (8*min(M,N)) */

/*  INFO    (output) INTEGER */
/*          = 0:  successful exit. */
/*          < 0:  if INFO = -i, the i-th argument had an illegal value. */
/*          > 0:  DBDSDC did not converge, updating process failed. */

/*  Further Details */
/*  =============== */

/*  Based on contributions by */
/*     Ming Gu and Huan Ren, Computer Science Division, University of */
/*     California at Berkeley, USA */

    // ------------------------------------------------------------------------------------

        template <
            typename T, 
            long NR1, long NR2, long NR3, long NR4,
            long NC1, long NC2, long NC3, long NC4,
            typename MM
            >
        int gesdd (
            const char jobz,
            matrix<T,NR1,NC1,MM,column_major_layout>& a,
            matrix<T,NR2,NC2,MM,column_major_layout>& s,
            matrix<T,NR3,NC3,MM,column_major_layout>& u,
            matrix<T,NR4,NC4,MM,column_major_layout>& vt
        )
        {
            matrix<T,0,1,MM,column_major_layout> work;
            matrix<integer,0,1,MM,column_major_layout> iwork;

            const long m = a.nr();
            const long n = a.nc();
            s.set_size(std::min(m,n), 1);

            // make sure the iwork memory block is big enough
            if (iwork.size() < 8*std::min(m,n))
                iwork.set_size(8*std::min(m,n), 1);

            if (jobz == 'A')
            {
                u.set_size(m,m);
                vt.set_size(n,n);
            }
            else if (jobz == 'S')
            {
                u.set_size(m, std::min(m,n));
                vt.set_size(std::min(m,n), n);
            }
            else if (jobz == 'O')
            {
                DLIB_CASSERT(false, "jobz == 'O' not supported");
            }
            else
            {
                u.set_size(NR3?NR3:1, NC3?NC3:1);
                vt.set_size(NR4?NR4:1, NC4?NC4:1);
            }

            // figure out how big the workspace needs to be.
            T work_size = 1;
            int info = binding::gesdd(jobz, a.nr(), a.nc(), &a(0,0), a.nr(),
                                      &s(0,0), &u(0,0), u.nr(), &vt(0,0), vt.nr(),
                                      &work_size, -1, &iwork(0,0));

            if (info != 0)
                return info;

            // There is a bug in an older version of LAPACK in Debian etch 
            // that causes the gesdd to return the wrong value for work_size
            // when jobz == 'N'.  So verify the value of work_size.
            if (jobz == 'N')
            {
                using std::min; 
                using std::max; 
                const T min_work_size = 3*min(m,n) + max(max(m,n),7*min(m,n));
                if (work_size < min_work_size)
                    work_size = min_work_size;
            }

            if (work.size() < work_size)
                work.set_size(static_cast<long>(work_size), 1);

            // compute the actual SVD
            info = binding::gesdd(jobz, a.nr(), a.nc(), &a(0,0), a.nr(),
                                  &s(0,0), &u(0,0), u.nr(), &vt(0,0), vt.nr(),
                                  &work(0,0), work.size(), &iwork(0,0));

            return info;
        }

    // ------------------------------------------------------------------------------------

        template <
            typename T, 
            long NR1, long NR2, long NR3, long NR4,
            long NC1, long NC2, long NC3, long NC4,
            typename MM
            >
        int gesdd (
            const char jobz,
            matrix<T,NR1,NC1,MM,row_major_layout>& a,
            matrix<T,NR2,NC2,MM,row_major_layout>& s,
            matrix<T,NR3,NC3,MM,row_major_layout>& u_,
            matrix<T,NR4,NC4,MM,row_major_layout>& vt_
        )
        {
            matrix<T,0,1,MM,row_major_layout> work;
            matrix<integer,0,1,MM,row_major_layout> iwork;

            // Row major order matrices are transposed from LAPACK's point of view.
            matrix<T,NR4,NC4,MM,row_major_layout>& u = vt_;
            matrix<T,NR3,NC3,MM,row_major_layout>& vt = u_;


            const long m = a.nc();
            const long n = a.nr();
            s.set_size(std::min(m,n), 1);

            // make sure the iwork memory block is big enough
            if (iwork.size() < 8*std::min(m,n))
                iwork.set_size(8*std::min(m,n), 1);

            if (jobz == 'A')
            {
                u.set_size(m,m);
                vt.set_size(n,n);
            }
            else if (jobz == 'S')
            {
                u.set_size(std::min(m,n), m);
                vt.set_size(n, std::min(m,n));
            }
            else if (jobz == 'O')
            {
                DLIB_CASSERT(false, "jobz == 'O' not supported");
            }
            else
            {
                u.set_size(NR4?NR4:1, NC4?NC4:1);
                vt.set_size(NR3?NR3:1, NC3?NC3:1);
            }

            // figure out how big the workspace needs to be.
            T work_size = 1;
            int info = binding::gesdd(jobz, m, n, &a(0,0), a.nc(),
                                      &s(0,0), &u(0,0), u.nc(), &vt(0,0), vt.nc(),
                                      &work_size, -1, &iwork(0,0));

            if (info != 0)
                return info;

            // There is a bug in an older version of LAPACK in Debian etch 
            // that causes the gesdd to return the wrong value for work_size
            // when jobz == 'N'.  So verify the value of work_size.
            if (jobz == 'N')
            {
                using std::min; 
                using std::max; 
                const T min_work_size = 3*min(m,n) + max(max(m,n),7*min(m,n));
                if (work_size < min_work_size)
                    work_size = min_work_size;
            }


            if (work.size() < work_size)
                work.set_size(static_cast<long>(work_size), 1);

            // compute the actual SVD
            info = binding::gesdd(jobz, m, n, &a(0,0), a.nc(),
                                  &s(0,0), &u(0,0), u.nc(), &vt(0,0), vt.nc(),
                                  &work(0,0), work.size(), &iwork(0,0));

            return info;
        }

    // ------------------------------------------------------------------------------------

    }

}

// ----------------------------------------------------------------------------------------

#endif // DLIB_LAPACk_SDD_H__


