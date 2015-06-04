// Copyright (C) 2010  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#ifndef DLIB_MATRiX_TRSM_Hh_
#define DLIB_MATRiX_TRSM_Hh_
#include "lapack/fortran_id.h"
#include "cblas_constants.h"

namespace dlib
{
    namespace blas_bindings
    {

        extern "C"
        {
            void cblas_strsm(const enum CBLAS_ORDER Order, const enum CBLAS_SIDE Side,
                             const enum CBLAS_UPLO Uplo, const enum CBLAS_TRANSPOSE TransA,
                             const enum CBLAS_DIAG Diag, const int M, const int N,
                             const float alpha, const float *A, const int lda,
                             float *B, const int ldb);

            void cblas_dtrsm(const enum CBLAS_ORDER Order, const enum CBLAS_SIDE Side,
                             const enum CBLAS_UPLO Uplo, const enum CBLAS_TRANSPOSE TransA,
                             const enum CBLAS_DIAG Diag, const int M, const int N,
                             const double alpha, const double *A, const int lda,
                             double *B, const int ldb);
        }

    // ------------------------------------------------------------------------------------

/*  Purpose */
/*  ======= */

/*  DTRSM  solves one of the matrix equations */

/*     op( A )*X = alpha*B,   or   X*op( A ) = alpha*B, */

/*  where alpha is a scalar, X and B are m by n matrices, A is a unit, or */
/*  non-unit,  upper or lower triangular matrix  and  op( A )  is one  of */

/*     op( A ) = A   or   op( A ) = A'. */

/*  The matrix X is overwritten on B. */

/*  Arguments */
/*  ========== */

/*  SIDE   - CHARACTER*1. */
/*           On entry, SIDE specifies whether op( A ) appears on the left */
/*           or right of X as follows: */

/*              SIDE = 'L' or 'l'   op( A )*X = alpha*B. */

/*              SIDE = 'R' or 'r'   X*op( A ) = alpha*B. */

/*           Unchanged on exit. */

/*  UPLO   - CHARACTER*1. */
/*           On entry, UPLO specifies whether the matrix A is an upper or */
/*           lower triangular matrix as follows: */

/*              UPLO = 'U' or 'u'   A is an upper triangular matrix. */

/*              UPLO = 'L' or 'l'   A is a lower triangular matrix. */

/*           Unchanged on exit. */

/*  TRANSA - CHARACTER*1. */
/*           On entry, TRANSA specifies the form of op( A ) to be used in */
/*           the matrix multiplication as follows: */

/*              TRANSA = 'N' or 'n'   op( A ) = A. */

/*              TRANSA = 'T' or 't'   op( A ) = A'. */

/*              TRANSA = 'C' or 'c'   op( A ) = A'. */

/*           Unchanged on exit. */

/*  DIAG   - CHARACTER*1. */
/*           On entry, DIAG specifies whether or not A is unit triangular */
/*           as follows: */

/*              DIAG = 'U' or 'u'   A is assumed to be unit triangular. */

/*              DIAG = 'N' or 'n'   A is not assumed to be unit */
/*                                  triangular. */

/*           Unchanged on exit. */

/*  M      - INTEGER. */
/*           On entry, M specifies the number of rows of B. M must be at */
/*           least zero. */
/*           Unchanged on exit. */

/*  N      - INTEGER. */
/*           On entry, N specifies the number of columns of B.  N must be */
/*           at least zero. */
/*           Unchanged on exit. */

/*  ALPHA  - DOUBLE PRECISION. */
/*           On entry,  ALPHA specifies the scalar  alpha. When  alpha is */
/*           zero then  A is not referenced and  B need not be set before */
/*           entry. */
/*           Unchanged on exit. */

/*  A      - DOUBLE PRECISION array of DIMENSION ( LDA, k ), where k is m */
/*           when  SIDE = 'L' or 'l'  and is  n  when  SIDE = 'R' or 'r'. */
/*           Before entry  with  UPLO = 'U' or 'u',  the  leading  k by k */
/*           upper triangular part of the array  A must contain the upper */
/*           triangular matrix  and the strictly lower triangular part of */
/*           A is not referenced. */
/*           Before entry  with  UPLO = 'L' or 'l',  the  leading  k by k */
/*           lower triangular part of the array  A must contain the lower */
/*           triangular matrix  and the strictly upper triangular part of */
/*           A is not referenced. */
/*           Note that when  DIAG = 'U' or 'u',  the diagonal elements of */
/*           A  are not referenced either,  but are assumed to be  unity. */
/*           Unchanged on exit. */

/*  LDA    - INTEGER. */
/*           On entry, LDA specifies the first dimension of A as declared */
/*           in the calling (sub) program.  When  SIDE = 'L' or 'l'  then */
/*           LDA  must be at least  max( 1, m ),  when  SIDE = 'R' or 'r' */
/*           then LDA must be at least max( 1, n ). */
/*           Unchanged on exit. */

/*  B      - DOUBLE PRECISION array of DIMENSION ( LDB, n ). */
/*           Before entry,  the leading  m by n part of the array  B must */
/*           contain  the  right-hand  side  matrix  B,  and  on exit  is */
/*           overwritten by the solution matrix  X. */

/*  LDB    - INTEGER. */
/*           On entry, LDB specifies the first dimension of B as declared */
/*           in  the  calling  (sub)  program.   LDB  must  be  at  least */
/*           max( 1, m ). */
/*           Unchanged on exit. */


/*  Level 3 Blas routine. */


/*  -- Written on 8-February-1989. */
/*     Jack Dongarra, Argonne National Laboratory. */
/*     Iain Duff, AERE Harwell. */
/*     Jeremy Du Croz, Numerical Algorithms Group Ltd. */
/*     Sven Hammarling, Numerical Algorithms Group Ltd. */

        template <typename T>
        void local_trsm(
            const enum CBLAS_ORDER Order,
            enum CBLAS_SIDE Side,
            enum CBLAS_UPLO Uplo, 
            const enum CBLAS_TRANSPOSE TransA,
            const enum CBLAS_DIAG Diag, 
            long m, 
            long n, 
            T alpha, 
            const T *a, 
            long lda, 
            T *b, 
            long ldb
        )
        /*!
            This is a copy of the dtrsm routine from the netlib.org BLAS which was run though
            f2c and converted into this form for use when a BLAS library is not available.
        !*/
        {
            if (Order == CblasRowMajor)
            {
                // since row major ordering looks like transposition to FORTRAN we need to flip a
                // few things.
                if (Side == CblasLeft)
                    Side = CblasRight;
                else
                    Side = CblasLeft;

                if (Uplo == CblasUpper)
                    Uplo = CblasLower;
                else
                    Uplo = CblasUpper;

                std::swap(m,n);
            }

            /* System generated locals */
            long a_dim1, a_offset, b_dim1, b_offset, i__1, i__2, i__3;

            /* Local variables */
            long i__, j, k, info;
            T temp;
            bool lside;
            long nrowa;
            bool upper;
            bool nounit;

            /* Parameter adjustments */
            a_dim1 = lda;
            a_offset = 1 + a_dim1;
            a -= a_offset;
            b_dim1 = ldb;
            b_offset = 1 + b_dim1;
            b -= b_offset;

            /* Function Body */
            lside = (Side == CblasLeft);
            if (lside) 
            {
                nrowa = m;
            } else 
            {
                nrowa = n;
            }
            nounit = (Diag == CblasNonUnit); 
            upper = (Uplo == CblasUpper); 

            info = 0;
            if (! lside && ! (Side == CblasRight)) {
                info = 1;
            } else if (! upper && !(Uplo == CblasLower) ) {
                info = 2;
            } else if (!(TransA == CblasNoTrans) && 
                       !(TransA == CblasTrans) && 
                       !(TransA == CblasConjTrans))  {
                info = 3;
            } else if (!(Diag == CblasUnit) && 
                       !(Diag == CblasNonUnit) ) {
                info = 4;
            } else if (m < 0) {
                info = 5;
            } else if (n < 0) {
                info = 6;
            } else if (lda < std::max<long>(1,nrowa)) {
                info = 9;
            } else if (ldb < std::max<long>(1,m)) {
                info = 11;
            }
            DLIB_CASSERT( info == 0, "Invalid inputs given to local_trsm");

            /*     Quick return if possible. */

            if (m == 0 || n == 0) {
                return;
            }

            /*     And when  alpha.eq.zero. */

            if (alpha == 0.) {
                i__1 = n;
                for (j = 1; j <= i__1; ++j) {
                    i__2 = m;
                    for (i__ = 1; i__ <= i__2; ++i__) {
                        b[i__ + j * b_dim1] = 0.;
                        /* L10: */
                    }
                    /* L20: */
                }
                return;
            }

            /*     Start the operations. */

            if (lside) {
                if (TransA == CblasNoTrans) {

                    /*           Form  B := alpha*inv( A )*B. */

                    if (upper) {
                        i__1 = n;
                        for (j = 1; j <= i__1; ++j) {
                            if (alpha != 1.) {
                                i__2 = m;
                                for (i__ = 1; i__ <= i__2; ++i__) {
                                    b[i__ + j * b_dim1] = alpha * b[i__ + j * b_dim1]
                                        ;
                                    /* L30: */
                                }
                            }
                            for (k = m; k >= 1; --k) {
                                if (b[k + j * b_dim1] != 0.) {
                                    if (nounit) {
                                        b[k + j * b_dim1] /= a[k + k * a_dim1];
                                    }
                                    i__2 = k - 1;
                                    for (i__ = 1; i__ <= i__2; ++i__) {
                                        b[i__ + j * b_dim1] -= b[k + j * b_dim1] * a[
                                            i__ + k * a_dim1];
                                        /* L40: */
                                    }
                                }
                                /* L50: */
                            }
                            /* L60: */
                        }
                    } else {
                        i__1 = n;
                        for (j = 1; j <= i__1; ++j) {
                            if (alpha != 1.) {
                                i__2 = m;
                                for (i__ = 1; i__ <= i__2; ++i__) {
                                    b[i__ + j * b_dim1] = alpha * b[i__ + j * b_dim1]
                                        ;
                                    /* L70: */
                                }
                            }
                            i__2 = m;
                            for (k = 1; k <= i__2; ++k) {
                                if (b[k + j * b_dim1] != 0.) {
                                    if (nounit) {
                                        b[k + j * b_dim1] /= a[k + k * a_dim1];
                                    }
                                    i__3 = m;
                                    for (i__ = k + 1; i__ <= i__3; ++i__) {
                                        b[i__ + j * b_dim1] -= b[k + j * b_dim1] * a[
                                            i__ + k * a_dim1];
                                        /* L80: */
                                    }
                                }
                                /* L90: */
                            }
                            /* L100: */
                        }
                    }
                } else {

                    /*           Form  B := alpha*inv( A' )*B. */

                    if (upper) {
                        i__1 = n;
                        for (j = 1; j <= i__1; ++j) {
                            i__2 = m;
                            for (i__ = 1; i__ <= i__2; ++i__) {
                                temp = alpha * b[i__ + j * b_dim1];
                                i__3 = i__ - 1;
                                for (k = 1; k <= i__3; ++k) {
                                    temp -= a[k + i__ * a_dim1] * b[k + j * b_dim1];
                                    /* L110: */
                                }
                                if (nounit) {
                                    temp /= a[i__ + i__ * a_dim1];
                                }
                                b[i__ + j * b_dim1] = temp;
                                /* L120: */
                            }
                            /* L130: */
                        }
                    } else {
                        i__1 = n;
                        for (j = 1; j <= i__1; ++j) {
                            for (i__ = m; i__ >= 1; --i__) {
                                temp = alpha * b[i__ + j * b_dim1];
                                i__2 = m;
                                for (k = i__ + 1; k <= i__2; ++k) {
                                    temp -= a[k + i__ * a_dim1] * b[k + j * b_dim1];
                                    /* L140: */
                                }
                                if (nounit) {
                                    temp /= a[i__ + i__ * a_dim1];
                                }
                                b[i__ + j * b_dim1] = temp;
                                /* L150: */
                            }
                            /* L160: */
                        }
                    }
                }
            } else {
                if (TransA == CblasNoTrans) {

                    /*           Form  B := alpha*B*inv( A ). */

                    if (upper) {
                        i__1 = n;
                        for (j = 1; j <= i__1; ++j) {
                            if (alpha != 1.) {
                                i__2 = m;
                                for (i__ = 1; i__ <= i__2; ++i__) {
                                    b[i__ + j * b_dim1] = alpha * b[i__ + j * b_dim1]
                                        ;
                                    /* L170: */
                                }
                            }
                            i__2 = j - 1;
                            for (k = 1; k <= i__2; ++k) {
                                if (a[k + j * a_dim1] != 0.) {
                                    i__3 = m;
                                    for (i__ = 1; i__ <= i__3; ++i__) {
                                        b[i__ + j * b_dim1] -= a[k + j * a_dim1] * b[
                                            i__ + k * b_dim1];
                                        /* L180: */
                                    }
                                }
                                /* L190: */
                            }
                            if (nounit) {
                                temp = 1. / a[j + j * a_dim1];
                                i__2 = m;
                                for (i__ = 1; i__ <= i__2; ++i__) {
                                    b[i__ + j * b_dim1] = temp * b[i__ + j * b_dim1];
                                    /* L200: */
                                }
                            }
                            /* L210: */
                        }
                    } else {
                        for (j = n; j >= 1; --j) {
                            if (alpha != 1.) {
                                i__1 = m;
                                for (i__ = 1; i__ <= i__1; ++i__) {
                                    b[i__ + j * b_dim1] = alpha * b[i__ + j * b_dim1]
                                        ;
                                    /* L220: */
                                }
                            }
                            i__1 = n;
                            for (k = j + 1; k <= i__1; ++k) {
                                if (a[k + j * a_dim1] != 0.) {
                                    i__2 = m;
                                    for (i__ = 1; i__ <= i__2; ++i__) {
                                        b[i__ + j * b_dim1] -= a[k + j * a_dim1] * b[
                                            i__ + k * b_dim1];
                                        /* L230: */
                                    }
                                }
                                /* L240: */
                            }
                            if (nounit) {
                                temp = 1. / a[j + j * a_dim1];
                                i__1 = m;
                                for (i__ = 1; i__ <= i__1; ++i__) {
                                    b[i__ + j * b_dim1] = temp * b[i__ + j * b_dim1];
                                    /* L250: */
                                }
                            }
                            /* L260: */
                        }
                    }
                } else {

                    /*           Form  B := alpha*B*inv( A' ). */

                    if (upper) {
                        for (k = n; k >= 1; --k) {
                            if (nounit) {
                                temp = 1. / a[k + k * a_dim1];
                                i__1 = m;
                                for (i__ = 1; i__ <= i__1; ++i__) {
                                    b[i__ + k * b_dim1] = temp * b[i__ + k * b_dim1];
                                    /* L270: */
                                }
                            }
                            i__1 = k - 1;
                            for (j = 1; j <= i__1; ++j) {
                                if (a[j + k * a_dim1] != 0.) {
                                    temp = a[j + k * a_dim1];
                                    i__2 = m;
                                    for (i__ = 1; i__ <= i__2; ++i__) {
                                        b[i__ + j * b_dim1] -= temp * b[i__ + k * 
                                            b_dim1];
                                        /* L280: */
                                    }
                                }
                                /* L290: */
                            }
                            if (alpha != 1.) {
                                i__1 = m;
                                for (i__ = 1; i__ <= i__1; ++i__) {
                                    b[i__ + k * b_dim1] = alpha * b[i__ + k * b_dim1]
                                        ;
                                    /* L300: */
                                }
                            }
                            /* L310: */
                        }
                    } else {
                        i__1 = n;
                        for (k = 1; k <= i__1; ++k) {
                            if (nounit) {
                                temp = 1. / a[k + k * a_dim1];
                                i__2 = m;
                                for (i__ = 1; i__ <= i__2; ++i__) {
                                    b[i__ + k * b_dim1] = temp * b[i__ + k * b_dim1];
                                    /* L320: */
                                }
                            }
                            i__2 = n;
                            for (j = k + 1; j <= i__2; ++j) {
                                if (a[j + k * a_dim1] != 0.) {
                                    temp = a[j + k * a_dim1];
                                    i__3 = m;
                                    for (i__ = 1; i__ <= i__3; ++i__) {
                                        b[i__ + j * b_dim1] -= temp * b[i__ + k * 
                                            b_dim1];
                                        /* L330: */
                                    }
                                }
                                /* L340: */
                            }
                            if (alpha != 1.) {
                                i__2 = m;
                                for (i__ = 1; i__ <= i__2; ++i__) {
                                    b[i__ + k * b_dim1] = alpha * b[i__ + k * b_dim1]
                                        ;
                                    /* L350: */
                                }
                            }
                            /* L360: */
                        }
                    }
                }
            }
        } 

    // ------------------------------------------------------------------------------------

        inline void cblas_trsm(const enum CBLAS_ORDER Order, const enum CBLAS_SIDE Side,
                               const enum CBLAS_UPLO Uplo, const enum CBLAS_TRANSPOSE TransA,
                               const enum CBLAS_DIAG Diag, const int M, const int N,
                               const float alpha, const float *A, const int lda,
                               float *B, const int ldb)
        {
#ifdef DLIB_USE_BLAS
            if (M > 4)
            {
                cblas_strsm(Order, Side, Uplo, TransA, Diag, M, N, alpha, A, lda, B, ldb);
                return;
            }
#endif
            local_trsm(Order, Side, Uplo, TransA, Diag, M, N, alpha, A, lda, B, ldb);
        }

        inline void cblas_trsm(const enum CBLAS_ORDER Order, const enum CBLAS_SIDE Side,
                               const enum CBLAS_UPLO Uplo, const enum CBLAS_TRANSPOSE TransA,
                               const enum CBLAS_DIAG Diag, const int M, const int N,
                               const double alpha, const double *A, const int lda,
                               double *B, const int ldb)
        {
#ifdef DLIB_USE_BLAS
            if (M > 4)
            {
                cblas_dtrsm(Order, Side, Uplo, TransA, Diag, M, N, alpha, A, lda, B, ldb);
                return;
            }
#endif
            local_trsm(Order, Side, Uplo, TransA, Diag, M, N, alpha, A, lda, B, ldb);
        }

        inline void cblas_trsm(const enum CBLAS_ORDER Order, const enum CBLAS_SIDE Side,
                               const enum CBLAS_UPLO Uplo, const enum CBLAS_TRANSPOSE TransA,
                               const enum CBLAS_DIAG Diag, const int M, const int N,
                               const long double alpha, const long double *A, const int lda,
                               long double *B, const int ldb)
        {
            local_trsm(Order, Side, Uplo, TransA, Diag, M, N, alpha, A, lda, B, ldb);
        }

    // ------------------------------------------------------------------------------------

        template <
            typename T,
            long NR1, long NR2,
            long NC1, long NC2,
            typename MM
            >
        inline void triangular_solver (
            const enum CBLAS_SIDE Side,
            const enum CBLAS_UPLO Uplo, 
            const enum CBLAS_TRANSPOSE TransA,
            const enum CBLAS_DIAG Diag,
            const matrix<T,NR1,NC1,MM,row_major_layout>& A,
            const T alpha,
            matrix<T,NR2,NC2,MM,row_major_layout>& B
        )
        {
            cblas_trsm(CblasRowMajor, Side,  Uplo, TransA, Diag, B.nr(), B.nc(),
                       alpha, &A(0,0), A.nc(), &B(0,0), B.nc());
        }

    // ------------------------------------------------------------------------------------

        template <
            typename T,
            long NR1, long NR2,
            long NC1, long NC2,
            typename MM
            >
        inline void triangular_solver (
            const enum CBLAS_SIDE Side,
            const enum CBLAS_UPLO Uplo, 
            const enum CBLAS_TRANSPOSE TransA,
            const enum CBLAS_DIAG Diag,
            const matrix<T,NR1,NC1,MM,column_major_layout>& A,
            const T alpha,
            matrix<T,NR2,NC2,MM,column_major_layout>& B
        )
        {
            cblas_trsm(CblasColMajor, Side,  Uplo, TransA, Diag, B.nr(), B.nc(),
                       alpha, &A(0,0), A.nr(), &B(0,0), B.nr());
        }

    // ------------------------------------------------------------------------------------

        template <
            typename T,
            long NR1, long NR2,
            long NC1, long NC2,
            typename MM
            >
        inline void triangular_solver (
            const enum CBLAS_SIDE Side,
            const enum CBLAS_UPLO Uplo, 
            const enum CBLAS_TRANSPOSE TransA,
            const enum CBLAS_DIAG Diag,
            const matrix<T,NR1,NC1,MM,column_major_layout>& A,
            matrix<T,NR2,NC2,MM,column_major_layout>& B,
            long rows_of_B
        )
        {
            const T alpha = 1;
            cblas_trsm(CblasColMajor, Side,  Uplo, TransA, Diag, rows_of_B, B.nc(),
                       alpha, &A(0,0), A.nr(), &B(0,0), B.nr());
        }

    // ------------------------------------------------------------------------------------

        template <
            typename T,
            long NR1, long NR2,
            long NC1, long NC2,
            typename MM,
            typename layout
            >
        inline void triangular_solver (
            const enum CBLAS_SIDE Side,
            const enum CBLAS_UPLO Uplo, 
            const enum CBLAS_TRANSPOSE TransA,
            const enum CBLAS_DIAG Diag,
            const matrix<T,NR1,NC1,MM,layout>& A,
            matrix<T,NR2,NC2,MM,layout>& B
        )
        {
            const T alpha = 1;
            triangular_solver(Side, Uplo, TransA, Diag, A, alpha, B);
        }

    // ------------------------------------------------------------------------------------

    }
}

#endif // DLIB_MATRiX_TRSM_Hh_

