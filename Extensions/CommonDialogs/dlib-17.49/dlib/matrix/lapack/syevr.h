// Copyright (C) 2010  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#ifndef DLIB_LAPACk_EVR_H__
#define DLIB_LAPACk_EVR_H__

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
                void DLIB_FORTRAN_ID(dsyevr) (char *jobz, char *range, char *uplo, integer *n, 
                                              double *a, integer *lda, double *vl, double *vu, integer * il, 
                                              integer *iu, double *abstol, integer *m, double *w, 
                                              double *z__, integer *ldz, integer *isuppz, double *work, 
                                              integer *lwork, integer *iwork, integer *liwork, integer *info);

                void DLIB_FORTRAN_ID(ssyevr) (char *jobz, char *range, char *uplo, integer *n, 
                                              float *a, integer *lda, float *vl, float *vu, integer * il, 
                                              integer *iu, float *abstol, integer *m, float *w, 
                                              float *z__, integer *ldz, integer *isuppz, float *work, 
                                              integer *lwork, integer *iwork, integer *liwork, integer *info);
            }

            inline int syevr (char jobz, char range, char uplo, integer n, 
                              double* a, integer lda, double vl, double vu, integer il, 
                              integer iu, double abstol, integer *m, double *w, 
                              double *z, integer ldz, integer *isuppz, double *work, 
                              integer lwork, integer *iwork, integer liwork)
            {
                integer info = 0;
                DLIB_FORTRAN_ID(dsyevr)(&jobz, &range, &uplo, &n,
                                        a, &lda, &vl, &vu, &il,
                                        &iu, &abstol, m, w,
                                        z, &ldz, isuppz, work,
                                        &lwork, iwork, &liwork, &info);
                return info;
            }

            inline int syevr (char jobz, char range, char uplo, integer n, 
                              float* a, integer lda, float vl, float vu, integer il, 
                              integer iu, float abstol, integer *m, float *w, 
                              float *z, integer ldz, integer *isuppz, float *work, 
                              integer lwork, integer *iwork, integer liwork)
            {
                integer info = 0;
                DLIB_FORTRAN_ID(ssyevr)(&jobz, &range, &uplo, &n,
                                        a, &lda, &vl, &vu, &il,
                                        &iu, &abstol, m, w,
                                        z, &ldz, isuppz, work,
                                        &lwork, iwork, &liwork, &info);
                return info;
            }

        }

    // ------------------------------------------------------------------------------------

        /*

*  -- LAPACK driver routine (version 3.1) --
*     Univ. of Tennessee, Univ. of California Berkeley and NAG Ltd..
*     November 2006
*
*     .. Scalar Arguments ..
      CHARACTER          JOBZ, RANGE, UPLO
      INTEGER            IL, INFO, IU, LDA, LDZ, LIWORK, LWORK, M, N
      DOUBLE PRECISION   ABSTOL, VL, VU
*     ..
*     .. Array Arguments ..
      INTEGER            ISUPPZ( * ), IWORK( * )
      DOUBLE PRECISION   A( LDA, * ), W( * ), WORK( * ), Z( LDZ, * )
*     ..
*
*  Purpose
*  =======
*
*  DSYEVR computes selected eigenvalues and, optionally, eigenvectors
*  of a real symmetric matrix A.  Eigenvalues and eigenvectors can be
*  selected by specifying either a range of values or a range of
*  indices for the desired eigenvalues.
*
*  DSYEVR first reduces the matrix A to tridiagonal form T with a call
*  to DSYTRD.  Then, whenever possible, DSYEVR calls DSTEMR to compute
*  the eigenspectrum using Relatively Robust Representations.  DSTEMR
*  computes eigenvalues by the dqds algorithm, while orthogonal
*  eigenvectors are computed from various "good" L D L^T representations
*  (also known as Relatively Robust Representations). Gram-Schmidt
*  orthogonalization is avoided as far as possible. More specifically,
*  the various steps of the algorithm are as follows.
*
*  For each unreduced block (submatrix) of T,
*     (a) Compute T - sigma I  = L D L^T, so that L and D
*         define all the wanted eigenvalues to high relative accuracy.
*         This means that small relative changes in the entries of D and L
*         cause only small relative changes in the eigenvalues and
*         eigenvectors. The standard (unfactored) representation of the
*         tridiagonal matrix T does not have this property in general.
*     (b) Compute the eigenvalues to suitable accuracy.
*         If the eigenvectors are desired, the algorithm attains full
*         accuracy of the computed eigenvalues only right before
*         the corresponding vectors have to be computed, see steps c) and d).
*     (c) For each cluster of close eigenvalues, select a new
*         shift close to the cluster, find a new factorization, and refine
*         the shifted eigenvalues to suitable accuracy.
*     (d) For each eigenvalue with a large enough relative separation compute
*         the corresponding eigenvector by forming a rank revealing twisted
*         factorization. Go back to (c) for any clusters that remain.
*
*  The desired accuracy of the output can be specified by the input
*  parameter ABSTOL.
*
*  For more details, see DSTEMR's documentation and:
*  - Inderjit S. Dhillon and Beresford N. Parlett: "Multiple representations
*    to compute orthogonal eigenvectors of symmetric tridiagonal matrices,"
*    Linear Algebra and its Applications, 387(1), pp. 1-28, August 2004.
*  - Inderjit Dhillon and Beresford Parlett: "Orthogonal Eigenvectors and
*    Relative Gaps," SIAM Journal on Matrix Analysis and Applications, Vol. 25,
*    2004.  Also LAPACK Working Note 154.
*  - Inderjit Dhillon: "A new O(n^2) algorithm for the symmetric
*    tridiagonal eigenvalue/eigenvector problem",
*    Computer Science Division Technical Report No. UCB/CSD-97-971,
*    UC Berkeley, May 1997.
*
*
*  Note 1 : DSYEVR calls DSTEMR when the full spectrum is requested
*  on machines which conform to the ieee-754 floating point standard.
*  DSYEVR calls DSTEBZ and SSTEIN on non-ieee machines and
*  when partial spectrum requests are made.
*
*  Normal execution of DSTEMR may create NaNs and infinities and
*  hence may abort due to a floating point exception in environments
*  which do not handle NaNs and infinities in the ieee standard default
*  manner.
*
*  Arguments
*  =========
*
*  JOBZ    (input) CHARACTER*1
*          = 'N':  Compute eigenvalues only;
*          = 'V':  Compute eigenvalues and eigenvectors.
*
*  RANGE   (input) CHARACTER*1
*          = 'A': all eigenvalues will be found.
*          = 'V': all eigenvalues in the half-open interval (VL,VU]
*                 will be found.
*          = 'I': the IL-th through IU-th eigenvalues will be found.
********** For RANGE = 'V' or 'I' and IU - IL < N - 1, DSTEBZ and
********** DSTEIN are called
*
*  UPLO    (input) CHARACTER*1
*          = 'U':  Upper triangle of A is stored;
*          = 'L':  Lower triangle of A is stored.
*
*  N       (input) INTEGER
*          The order of the matrix A.  N >= 0.
*
*  A       (input/output) DOUBLE PRECISION array, dimension (LDA, N)
*          On entry, the symmetric matrix A.  If UPLO = 'U', the
*          leading N-by-N upper triangular part of A contains the
*          upper triangular part of the matrix A.  If UPLO = 'L',
*          the leading N-by-N lower triangular part of A contains
*          the lower triangular part of the matrix A.
*          On exit, the lower triangle (if UPLO='L') or the upper
*          triangle (if UPLO='U') of A, including the diagonal, is
*          destroyed.
*
*  LDA     (input) INTEGER
*          The leading dimension of the array A.  LDA >= max(1,N).
*
*  VL      (input) DOUBLE PRECISION
*  VU      (input) DOUBLE PRECISION
*          If RANGE='V', the lower and upper bounds of the interval to
*          be searched for eigenvalues. VL < VU.
*          Not referenced if RANGE = 'A' or 'I'.
*
*  IL      (input) INTEGER
*  IU      (input) INTEGER
*          If RANGE='I', the indices (in ascending order) of the
*          smallest and largest eigenvalues to be returned.
*          1 <= IL <= IU <= N, if N > 0; IL = 1 and IU = 0 if N = 0.
*          Not referenced if RANGE = 'A' or 'V'.
*
*  ABSTOL  (input) DOUBLE PRECISION
*          The absolute error tolerance for the eigenvalues.
*          An approximate eigenvalue is accepted as converged
*          when it is determined to lie in an interval [a,b]
*          of width less than or equal to
*
*                  ABSTOL + EPS *   max( |a|,|b| ) ,
*
*          where EPS is the machine precision.  If ABSTOL is less than
*          or equal to zero, then  EPS*|T|  will be used in its place,
*          where |T| is the 1-norm of the tridiagonal matrix obtained
*          by reducing A to tridiagonal form.
*
*          See "Computing Small Singular Values of Bidiagonal Matrices
*          with Guaranteed High Relative Accuracy," by Demmel and
*          Kahan, LAPACK Working Note #3.
*
*          If high relative accuracy is important, set ABSTOL to
*          DLAMCH( 'Safe minimum' ).  Doing so will guarantee that
*          eigenvalues are computed to high relative accuracy when
*          possible in future releases.  The current code does not
*          make any guarantees about high relative accuracy, but
*          future releases will. See J. Barlow and J. Demmel,
*          "Computing Accurate Eigensystems of Scaled Diagonally
*          Dominant Matrices", LAPACK Working Note #7, for a discussion
*          of which matrices define their eigenvalues to high relative
*          accuracy.
*
*  M       (output) INTEGER
*          The total number of eigenvalues found.  0 <= M <= N.
*          If RANGE = 'A', M = N, and if RANGE = 'I', M = IU-IL+1.
*
*  W       (output) DOUBLE PRECISION array, dimension (N)
*          The first M elements contain the selected eigenvalues in
*          ascending order.
*
*  Z       (output) DOUBLE PRECISION array, dimension (LDZ, max(1,M))
*          If JOBZ = 'V', then if INFO = 0, the first M columns of Z
*          contain the orthonormal eigenvectors of the matrix A
*          corresponding to the selected eigenvalues, with the i-th
*          column of Z holding the eigenvector associated with W(i).
*          If JOBZ = 'N', then Z is not referenced.
*          Note: the user must ensure that at least max(1,M) columns are
*          supplied in the array Z; if RANGE = 'V', the exact value of M
*          is not known in advance and an upper bound must be used.
*          Supplying N columns is always safe.
*
*  LDZ     (input) INTEGER
*          The leading dimension of the array Z.  LDZ >= 1, and if
*          JOBZ = 'V', LDZ >= max(1,N).
*
*  ISUPPZ  (output) INTEGER array, dimension ( 2*max(1,M) )
*          The support of the eigenvectors in Z, i.e., the indices
*          indicating the nonzero elements in Z. The i-th eigenvector
*          is nonzero only in elements ISUPPZ( 2*i-1 ) through
*          ISUPPZ( 2*i ).
********** Implemented only for RANGE = 'A' or 'I' and IU - IL = N - 1
*
*  WORK    (workspace/output) DOUBLE PRECISION array, dimension (MAX(1,LWORK))
*          On exit, if INFO = 0, WORK(1) returns the optimal LWORK.
*
*  LWORK   (input) INTEGER
*          The dimension of the array WORK.  LWORK >= max(1,26*N).
*          For optimal efficiency, LWORK >= (NB+6)*N,
*          where NB is the max of the blocksize for DSYTRD and DORMTR
*          returned by ILAENV.
*
*          If LWORK = -1, then a workspace query is assumed; the routine
*          only calculates the optimal size of the WORK array, returns
*          this value as the first entry of the WORK array, and no error
*          message related to LWORK is issued by XERBLA.
*
*  IWORK   (workspace/output) INTEGER array, dimension (MAX(1,LIWORK))
*          On exit, if INFO = 0, IWORK(1) returns the optimal LWORK.
*
*  LIWORK  (input) INTEGER
*          The dimension of the array IWORK.  LIWORK >= max(1,10*N).
*
*          If LIWORK = -1, then a workspace query is assumed; the
*          routine only calculates the optimal size of the IWORK array,
*          returns this value as the first entry of the IWORK array, and
*          no error message related to LIWORK is issued by XERBLA.
*
*  INFO    (output) INTEGER
*          = 0:  successful exit
*          < 0:  if INFO = -i, the i-th argument had an illegal value
*          > 0:  Internal error
*
*  Further Details
*  ===============
*
*  Based on contributions by
*     Inderjit Dhillon, IBM Almaden, USA
*     Osni Marques, LBNL/NERSC, USA
*     Ken Stanley, Computer Science Division, University of
*       California at Berkeley, USA
*     Jason Riedy, Computer Science Division, University of
*       California at Berkeley, USA
*
* =====================================================================

        */

    // ------------------------------------------------------------------------------------

        template <
            typename T, 
            long NR1, long NR2, long NR3, long NR4,
            long NC1, long NC2, long NC3, long NC4,
            typename MM
            >
        int syevr (
            const char jobz,
            const char range,
            const char uplo,
            matrix<T,NR1,NC1,MM,column_major_layout>& a,
            const double vl,
            const double vu,
            const integer il,
            const integer iu,
            const double abstol,
            integer& num_eigenvalues_found,
            matrix<T,NR2,NC2,MM,column_major_layout>& w,
            matrix<T,NR3,NC3,MM,column_major_layout>& z,
            matrix<integer,NR4,NC4,MM,column_major_layout>& isuppz
        )
        {
            matrix<T,0,1,MM,column_major_layout> work;
            matrix<integer,0,1,MM,column_major_layout> iwork;

            const long n = a.nr();

            w.set_size(n,1);

            isuppz.set_size(2*n, 1);

            if (jobz == 'V')
            {
                z.set_size(n,n);
            }
            else
            {
                z.set_size(NR3?NR3:1, NC3?NC3:1);
            }

            // figure out how big the workspace needs to be.
            T work_size = 1;
            integer iwork_size = 1;
            int info = binding::syevr(jobz, range, uplo, n, &a(0,0),
                                      a.nr(), vl, vu, il, iu, abstol, &num_eigenvalues_found,
                                      &w(0,0), &z(0,0), z.nr(), &isuppz(0,0), &work_size, -1,
                                      &iwork_size, -1);

            if (info != 0)
                return info;

            if (work.size() < work_size)
                work.set_size(static_cast<long>(work_size), 1);
            if (iwork.size() < iwork_size)
                iwork.set_size(iwork_size, 1);

            // compute the actual decomposition 
            info = binding::syevr(jobz, range, uplo, n, &a(0,0),
                                  a.nr(), vl, vu, il, iu, abstol, &num_eigenvalues_found,
                                  &w(0,0), &z(0,0), z.nr(), &isuppz(0,0), &work(0,0), work.size(),
                                  &iwork(0,0), iwork.size());


            return info;
        }

    // ------------------------------------------------------------------------------------

        template <
            typename T, 
            long NR1, long NR2, long NR3, long NR4,
            long NC1, long NC2, long NC3, long NC4,
            typename MM
            >
        int syevr (
            const char jobz,
            const char range,
            char uplo,
            matrix<T,NR1,NC1,MM,row_major_layout>& a,
            const double vl,
            const double vu,
            const integer il,
            const integer iu,
            const double abstol,
            integer& num_eigenvalues_found,
            matrix<T,NR2,NC2,MM,row_major_layout>& w,
            matrix<T,NR3,NC3,MM,row_major_layout>& z,
            matrix<integer,NR4,NC4,MM,row_major_layout>& isuppz
        )
        {
            matrix<T,0,1,MM,row_major_layout> work;
            matrix<integer,0,1,MM,row_major_layout> iwork;

            if (uplo == 'L')
                uplo = 'U';
            else
                uplo = 'L';

            const long n = a.nr();

            w.set_size(n,1);

            isuppz.set_size(2*n, 1);

            if (jobz == 'V')
            {
                z.set_size(n,n);
            }
            else
            {
                z.set_size(NR3?NR3:1, NC3?NC3:1);
            }

            // figure out how big the workspace needs to be.
            T work_size = 1;
            integer iwork_size = 1;
            int info = binding::syevr(jobz, range, uplo, n, &a(0,0),
                                      a.nc(), vl, vu, il, iu, abstol, &num_eigenvalues_found,
                                      &w(0,0), &z(0,0), z.nc(), &isuppz(0,0), &work_size, -1,
                                      &iwork_size, -1);

            if (info != 0)
                return info;

            if (work.size() < work_size)
                work.set_size(static_cast<long>(work_size), 1);
            if (iwork.size() < iwork_size)
                iwork.set_size(iwork_size, 1);

            // compute the actual decomposition 
            info = binding::syevr(jobz, range, uplo, n, &a(0,0),
                                  a.nc(), vl, vu, il, iu, abstol, &num_eigenvalues_found,
                                  &w(0,0), &z(0,0), z.nc(), &isuppz(0,0), &work(0,0), work.size(),
                                  &iwork(0,0), iwork.size());

            z = trans(z);

            return info;
        }

    // ------------------------------------------------------------------------------------

    }

}

// ----------------------------------------------------------------------------------------

#endif // DLIB_LAPACk_EVR_H__



