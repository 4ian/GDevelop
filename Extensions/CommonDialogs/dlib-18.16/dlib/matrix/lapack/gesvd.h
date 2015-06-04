// Copyright (C) 2010  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#ifndef DLIB_LAPACk_SVD_Hh_
#define DLIB_LAPACk_SVD_Hh_

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
                void DLIB_FORTRAN_ID(dgesvd) (const char* jobu, const char* jobvt,
                                              const integer* m, const integer* n, double* a, const integer* lda,
                                              double* s, double* u, const integer* ldu,
                                              double* vt, const integer* ldvt,
                                              double* work, const integer* lwork, integer* info);

                void DLIB_FORTRAN_ID(sgesvd) (const char* jobu, const char* jobvt,
                                              const integer* m, const integer* n, float* a, const integer* lda,
                                              float* s, float* u, const integer* ldu,
                                              float* vt, const integer* ldvt,
                                              float* work, const integer* lwork, integer* info);

            }

            inline integer gesvd (const char jobu, const char jobvt,
                              const integer m, const integer n, double* a, const integer lda,
                              double* s, double* u, const integer ldu,
                              double* vt, const integer ldvt,
                              double* work, const integer lwork)
            {
                integer info = 0;
                DLIB_FORTRAN_ID(dgesvd)(&jobu, &jobvt, &m, &n, a, &lda, s, u, &ldu, vt, &ldvt, work, &lwork, &info);
                return info;
            }

            inline integer gesvd (const char jobu, const char jobvt,
                              const integer m, const integer n, float* a, const integer lda,
                              float* s, float* u, const integer ldu,
                              float* vt, const integer ldvt,
                              float* work, const integer lwork)
            {
                integer info = 0;
                DLIB_FORTRAN_ID(sgesvd)(&jobu, &jobvt, &m, &n, a, &lda, s, u, &ldu, vt, &ldvt, work, &lwork, &info);
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

/*  DGESVD computes the singular value decomposition (SVD) of a real */
/*  M-by-N matrix A, optionally computing the left and/or right singular */
/*  vectors. The SVD is written */

/*       A = U * SIGMA * transpose(V) */

/*  where SIGMA is an M-by-N matrix which is zero except for its */
/*  min(m,n) diagonal elements, U is an M-by-M orthogonal matrix, and */
/*  V is an N-by-N orthogonal matrix.  The diagonal elements of SIGMA */
/*  are the singular values of A; they are real and non-negative, and */
/*  are returned in descending order.  The first min(m,n) columns of */
/*  U and V are the left and right singular vectors of A. */

/*  Note that the routine returns V**T, not V. */

/*  Arguments */
/*  ========= */

/*  JOBU    (input) CHARACTER*1 */
/*          Specifies options for computing all or part of the matrix U: */
/*          = 'A':  all M columns of U are returned in array U: */
/*          = 'S':  the first min(m,n) columns of U (the left singular */
/*                  vectors) are returned in the array U; */
/*          = 'O':  the first min(m,n) columns of U (the left singular */
/*                  vectors) are overwritten on the array A; */
/*          = 'N':  no columns of U (no left singular vectors) are */
/*                  computed. */

/*  JOBVT   (input) CHARACTER*1 */
/*          Specifies options for computing all or part of the matrix */
/*          V**T: */
/*          = 'A':  all N rows of V**T are returned in the array VT; */
/*          = 'S':  the first min(m,n) rows of V**T (the right singular */
/*                  vectors) are returned in the array VT; */
/*          = 'O':  the first min(m,n) rows of V**T (the right singular */
/*                  vectors) are overwritten on the array A; */
/*          = 'N':  no rows of V**T (no right singular vectors) are */
/*                  computed. */

/*          JOBVT and JOBU cannot both be 'O'. */

/*  M       (input) INTEGER */
/*          The number of rows of the input matrix A.  M >= 0. */

/*  N       (input) INTEGER */
/*          The number of columns of the input matrix A.  N >= 0. */

/*  A       (input/output) DOUBLE PRECISION array, dimension (LDA,N) */
/*          On entry, the M-by-N matrix A. */
/*          On exit, */
/*          if JOBU = 'O',  A is overwritten with the first min(m,n) */
/*                          columns of U (the left singular vectors, */
/*                          stored columnwise); */
/*          if JOBVT = 'O', A is overwritten with the first min(m,n) */
/*                          rows of V**T (the right singular vectors, */
/*                          stored rowwise); */
/*          if JOBU .ne. 'O' and JOBVT .ne. 'O', the contents of A */
/*                          are destroyed. */

/*  LDA     (input) INTEGER */
/*          The leading dimension of the array A.  LDA >= max(1,M). */

/*  S       (output) DOUBLE PRECISION array, dimension (min(M,N)) */
/*          The singular values of A, sorted so that S(i) >= S(i+1). */

/*  U       (output) DOUBLE PRECISION array, dimension (LDU,UCOL) */
/*          (LDU,M) if JOBU = 'A' or (LDU,min(M,N)) if JOBU = 'S'. */
/*          If JOBU = 'A', U contains the M-by-M orthogonal matrix U; */
/*          if JOBU = 'S', U contains the first min(m,n) columns of U */
/*          (the left singular vectors, stored columnwise); */
/*          if JOBU = 'N' or 'O', U is not referenced. */

/*  LDU     (input) INTEGER */
/*          The leading dimension of the array U.  LDU >= 1; if */
/*          JOBU = 'S' or 'A', LDU >= M. */

/*  VT      (output) DOUBLE PRECISION array, dimension (LDVT,N) */
/*          If JOBVT = 'A', VT contains the N-by-N orthogonal matrix */
/*          V**T; */
/*          if JOBVT = 'S', VT contains the first min(m,n) rows of */
/*          V**T (the right singular vectors, stored rowwise); */
/*          if JOBVT = 'N' or 'O', VT is not referenced. */

/*  LDVT    (input) INTEGER */
/*          The leading dimension of the array VT.  LDVT >= 1; if */
/*          JOBVT = 'A', LDVT >= N; if JOBVT = 'S', LDVT >= min(M,N). */

/*  WORK    (workspace/output) DOUBLE PRECISION array, dimension (MAX(1,LWORK)) */
/*          On exit, if INFO = 0, WORK(1) returns the optimal LWORK; */
/*          if INFO > 0, WORK(2:MIN(M,N)) contains the unconverged */
/*          superdiagonal elements of an upper bidiagonal matrix B */
/*          whose diagonal is in S (not necessarily sorted). B */
/*          satisfies A = U * B * VT, so it has the same singular values */
/*          as A, and singular vectors related by U and VT. */

/*  LWORK   (input) INTEGER */
/*          The dimension of the array WORK. */
/*          LWORK >= MAX(1,3*MIN(M,N)+MAX(M,N),5*MIN(M,N)). */
/*          For good performance, LWORK should generally be larger. */

/*          If LWORK = -1, then a workspace query is assumed; the routine */
/*          only calculates the optimal size of the WORK array, returns */
/*          this value as the first entry of the WORK array, and no error */
/*          message related to LWORK is issued by XERBLA. */

/*  INFO    (output) INTEGER */
/*          = 0:  successful exit. */
/*          < 0:  if INFO = -i, the i-th argument had an illegal value. */
/*          > 0:  if DBDSQR did not converge, INFO specifies how many */
/*                superdiagonals of an intermediate bidiagonal form B */
/*                did not converge to zero. See the description of WORK */
/*                above for details. */

    // ------------------------------------------------------------------------------------

        template <
            typename T, 
            long NR1, long NR2, long NR3, long NR4,
            long NC1, long NC2, long NC3, long NC4,
            typename MM
            >
        int gesvd (
            const char jobu,
            const char jobvt,
            matrix<T,NR1,NC1,MM,column_major_layout>& a,
            matrix<T,NR2,NC2,MM,column_major_layout>& s,
            matrix<T,NR3,NC3,MM,column_major_layout>& u,
            matrix<T,NR4,NC4,MM,column_major_layout>& vt
        )
        {
            matrix<T,0,1,MM,column_major_layout> work;

            const long m = a.nr();
            const long n = a.nc();
            s.set_size(std::min(m,n), 1);

            if (jobu == 'A')
                u.set_size(m,m);
            else if (jobu == 'S')
                u.set_size(m, std::min(m,n));
            else
                u.set_size(NR3?NR3:1, NC3?NC3:1);

            if (jobvt == 'A')
                vt.set_size(n,n);
            else if (jobvt == 'S')
                vt.set_size(std::min(m,n), n);
            else
                vt.set_size(NR4?NR4:1, NC4?NC4:1);


            if (jobu == 'O' || jobvt == 'O')
            {
                DLIB_CASSERT(false, "job == 'O' not supported");
            }


            // figure out how big the workspace needs to be.
            T work_size = 1;
            int info = binding::gesvd(jobu, jobvt, a.nr(), a.nc(), &a(0,0), a.nr(),
                                      &s(0,0), &u(0,0), u.nr(), &vt(0,0), vt.nr(),
                                      &work_size, -1);

            if (info != 0)
                return info;

            if (work.size() < work_size)
                work.set_size(static_cast<long>(work_size), 1);

            // compute the actual SVD
            info = binding::gesvd(jobu, jobvt, a.nr(), a.nc(), &a(0,0), a.nr(),
                                  &s(0,0), &u(0,0), u.nr(), &vt(0,0), vt.nr(),
                                  &work(0,0), work.size());

            return info;
        }

    // ------------------------------------------------------------------------------------

        template <
            typename T, 
            long NR1, long NR2, long NR3, long NR4,
            long NC1, long NC2, long NC3, long NC4,
            typename MM
            >
        int gesvd (
            char jobu,
            char jobvt,
            matrix<T,NR1,NC1,MM,row_major_layout>& a,
            matrix<T,NR2,NC2,MM,row_major_layout>& s,
            matrix<T,NR3,NC3,MM,row_major_layout>& u_,
            matrix<T,NR4,NC4,MM,row_major_layout>& vt_
        )
        {
            matrix<T,0,1,MM,row_major_layout> work;

            // Row major order matrices are transposed from LAPACK's point of view.
            matrix<T,NR4,NC4,MM,row_major_layout>& u = vt_;
            matrix<T,NR3,NC3,MM,row_major_layout>& vt = u_;
            std::swap(jobu, jobvt);

            const long m = a.nc();
            const long n = a.nr();
            s.set_size(std::min(m,n), 1);

            if (jobu == 'A')
                u.set_size(m,m);
            else if (jobu == 'S')
                u.set_size(std::min(m,n), m);
            else
                u.set_size(NR4?NR4:1, NC4?NC4:1);

            if (jobvt == 'A')
                vt.set_size(n,n);
            else if (jobvt == 'S')
                vt.set_size(n, std::min(m,n));
            else
                vt.set_size(NR3?NR3:1, NC3?NC3:1);

            if (jobu == 'O' || jobvt == 'O')
            {
                DLIB_CASSERT(false, "job == 'O' not supported");
            }


            // figure out how big the workspace needs to be.
            T work_size = 1;
            int info = binding::gesvd(jobu, jobvt, m, n, &a(0,0), a.nc(),
                                      &s(0,0), &u(0,0), u.nc(), &vt(0,0), vt.nc(),
                                      &work_size, -1);

            if (info != 0)
                return info;

            if (work.size() < work_size)
                work.set_size(static_cast<long>(work_size), 1);

            // compute the actual SVD
            info = binding::gesvd(jobu, jobvt, m, n, &a(0,0), a.nc(),
                                  &s(0,0), &u(0,0), u.nc(), &vt(0,0), vt.nc(),
                                  &work(0,0), work.size());

            return info;
        }

    // ------------------------------------------------------------------------------------

    }

}

// ----------------------------------------------------------------------------------------

#endif // DLIB_LAPACk_SVD_Hh_

