// Copyright (C) 2008  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#ifndef DLIB_MATRIx_BLAS_BINDINGS_
#define DLIB_MATRIx_BLAS_BINDINGS_

#ifndef DLIB_USE_BLAS
#error "DLIB_USE_BLAS should be defined if you want to use the BLAS bindings"
#endif

#include "matrix_assign.h"
#include "matrix_conj_trans.h"
#include "cblas_constants.h"

//#include <iostream>
//using namespace std;

namespace dlib
{


    namespace blas_bindings 
    {

#ifdef DLIB_TEST_BLAS_BINDINGS
        int& counter_gemm();
        int& counter_gemv();
        int& counter_ger();
        int& counter_dot();
        int& counter_axpy();
        int& counter_scal();

        #define DLIB_TEST_BLAS_BINDING_GEMM ++counter_gemm();
        #define DLIB_TEST_BLAS_BINDING_GEMV ++counter_gemv();
        #define DLIB_TEST_BLAS_BINDING_GER ++counter_ger();
        #define DLIB_TEST_BLAS_BINDING_DOT ++counter_dot();
        #define DLIB_TEST_BLAS_BINDING_AXPY ++counter_axpy();
        #define DLIB_TEST_BLAS_BINDING_SCAL ++counter_scal();
#else
        #define DLIB_TEST_BLAS_BINDING_GEMM 
        #define DLIB_TEST_BLAS_BINDING_GEMV 
        #define DLIB_TEST_BLAS_BINDING_GER 
        #define DLIB_TEST_BLAS_BINDING_DOT 
        #define DLIB_TEST_BLAS_BINDING_AXPY
        #define DLIB_TEST_BLAS_BINDING_SCAL
#endif

        extern "C"
        {
            // Here we declare the prototypes for the CBLAS calls used by the BLAS bindings below

            void cblas_saxpy(const int N, const float alpha, const float *X,
                            const int incX, float *Y, const int incY);
            void cblas_daxpy(const int N, const double alpha, const double *X,
                            const int incX, double *Y, const int incY);
            void cblas_caxpy(const int N, const void *alpha, const void *X,
                            const int incX, void *Y, const int incY);
            void cblas_zaxpy(const int N, const void *alpha, const void *X,
                            const int incX, void *Y, const int incY);

            void cblas_sscal(const int N, const float alpha, float *X, const int incX);
            void cblas_dscal(const int N, const double alpha, double *X, const int incX);
            void cblas_cscal(const int N, const void *alpha, void *X, const int incX);
            void cblas_zscal(const int N, const void *alpha, void *X, const int incX);

            void cblas_sgemm(const enum CBLAS_ORDER Order, const enum CBLAS_TRANSPOSE TransA,
                             const enum CBLAS_TRANSPOSE TransB, const int M, const int N,
                             const int K, const float alpha, const float *A,
                             const int lda, const float *B, const int ldb,
                             const float beta, float *C, const int ldc);
            void cblas_dgemm(const enum CBLAS_ORDER Order, const enum CBLAS_TRANSPOSE TransA,
                             const enum CBLAS_TRANSPOSE TransB, const int M, const int N,
                             const int K, const double alpha, const double *A,
                             const int lda, const double *B, const int ldb,
                             const double beta, double *C, const int ldc);
            void cblas_cgemm(const enum CBLAS_ORDER Order, const enum CBLAS_TRANSPOSE TransA,
                             const enum CBLAS_TRANSPOSE TransB, const int M, const int N,
                             const int K, const void *alpha, const void *A,
                             const int lda, const void *B, const int ldb,
                             const void *beta, void *C, const int ldc);
            void cblas_zgemm(const enum CBLAS_ORDER Order, const enum CBLAS_TRANSPOSE TransA,
                             const enum CBLAS_TRANSPOSE TransB, const int M, const int N,
                             const int K, const void *alpha, const void *A,
                             const int lda, const void *B, const int ldb,
                             const void *beta, void *C, const int ldc);
            void cblas_sgemv(const enum CBLAS_ORDER order,
                             const enum CBLAS_TRANSPOSE TransA, const int M, const int N,
                             const float alpha, const float *A, const int lda,
                             const float *X, const int incX, const float beta,
                             float *Y, const int incY);
            void cblas_dgemv(const enum CBLAS_ORDER order,
                             const enum CBLAS_TRANSPOSE TransA, const int M, const int N,
                             const double alpha, const double *A, const int lda,
                             const double *X, const int incX, const double beta,
                             double *Y, const int incY);
            void cblas_cgemv(const enum CBLAS_ORDER order,
                             const enum CBLAS_TRANSPOSE TransA, const int M, const int N,
                             const void *alpha, const void *A, const int lda,
                             const void *X, const int incX, const void *beta,
                             void *Y, const int incY);
            void cblas_zgemv(const enum CBLAS_ORDER order,
                             const enum CBLAS_TRANSPOSE TransA, const int M, const int N,
                             const void *alpha, const void *A, const int lda,
                             const void *X, const int incX, const void *beta,
                             void *Y, const int incY);
            void cblas_sger(const enum CBLAS_ORDER order, const int M, const int N,
                            const float alpha, const float *X, const int incX,
                            const float *Y, const int incY, float *A, const int lda);
            void cblas_dger(const enum CBLAS_ORDER order, const int M, const int N,
                            const double alpha, const double *X, const int incX,
                            const double *Y, const int incY, double *A, const int lda);
            void cblas_cgerc(const enum CBLAS_ORDER order, const int M, const int N,
                             const void *alpha, const void *X, const int incX,
                             const void *Y, const int incY, void *A, const int lda);
            void cblas_zgerc(const enum CBLAS_ORDER order, const int M, const int N,
                             const void *alpha, const void *X, const int incX,
                             const void *Y, const int incY, void *A, const int lda);
            float  cblas_sdot(const int N, const float  *X, const int incX,
                              const float  *Y, const int incY);
            double cblas_ddot(const int N, const double *X, const int incX,
                              const double *Y, const int incY);
            void   cblas_cdotu_sub(const int N, const void *X, const int incX,
                                   const void *Y, const int incY, void *dotu);
            void   cblas_zdotu_sub(const int N, const void *X, const int incX,
                                   const void *Y, const int incY, void *dotu);
            void   cblas_cdotc_sub(const int N, const void *X, const int incX,
                                   const void *Y, const int incY, void *dotc);
            void   cblas_zdotc_sub(const int N, const void *X, const int incX,
                                   const void *Y, const int incY, void *dotc);
            void cblas_cgeru(const enum CBLAS_ORDER order, const int M, const int N,
                             const void *alpha, const void *X, const int incX,
                             const void *Y, const int incY, void *A, const int lda);
            void cblas_zgeru(const enum CBLAS_ORDER order, const int M, const int N,
                             const void *alpha, const void *X, const int incX,
                             const void *Y, const int incY, void *A, const int lda);
        }

    // ----------------------------------------------------------------------------------------
    // ----------------------------------------------------------------------------------------

        inline void cblas_axpy(const int N, const float alpha, const float *X,
                        const int incX, float *Y, const int incY)
        {
            DLIB_TEST_BLAS_BINDING_AXPY;
            cblas_saxpy(N, alpha, X, incX, Y, incY);
        }

        inline void cblas_axpy(const int N, const double alpha, const double *X,
                        const int incX, double *Y, const int incY)
        {
            DLIB_TEST_BLAS_BINDING_AXPY;
            cblas_daxpy(N, alpha, X, incX, Y, incY);
        }

        inline void cblas_axpy(const int N, const std::complex<float>& alpha, const std::complex<float> *X,
                        const int incX, std::complex<float> *Y, const int incY)
        {
            DLIB_TEST_BLAS_BINDING_AXPY;
            cblas_caxpy(N, &alpha, X, incX, Y, incY);
        }

        inline void cblas_axpy(const int N, const std::complex<double>& alpha, const std::complex<double> *X,
                        const int incX, std::complex<double> *Y, const int incY)
        {
            DLIB_TEST_BLAS_BINDING_AXPY;
            cblas_zaxpy(N, &alpha, X, incX, Y, incY);
        }

    // ----------------------------------------------------------------------------------------

        inline void cblas_scal(const int N, const float alpha, float *X)
        {
            DLIB_TEST_BLAS_BINDING_SCAL;
            cblas_sscal(N, alpha, X, 1);
        }

        inline void cblas_scal(const int N, const double alpha, double *X)
        {
            DLIB_TEST_BLAS_BINDING_SCAL;
            cblas_dscal(N, alpha, X, 1);
        }

        inline void cblas_scal(const int N, const std::complex<float>& alpha, std::complex<float> *X)
        {
            DLIB_TEST_BLAS_BINDING_SCAL;
            cblas_cscal(N, &alpha, X, 1);
        }

        inline void cblas_scal(const int N, const std::complex<double>& alpha, std::complex<double> *X)
        {
            DLIB_TEST_BLAS_BINDING_SCAL;
            cblas_zscal(N, &alpha, X, 1);
        }

    // ----------------------------------------------------------------------------------------

        inline void cblas_gemm( const enum CBLAS_ORDER Order, const enum CBLAS_TRANSPOSE TransA,
                                const enum CBLAS_TRANSPOSE TransB, const int M, const int N,
                                const int K, const float alpha, const float *A,
                                const int lda, const float *B, const int ldb,
                                const float beta, float *C, const int ldc)
        {
            DLIB_TEST_BLAS_BINDING_GEMM;
            cblas_sgemm( Order, TransA, TransB,  M,  N,
                          K,  alpha, A, lda, B,  ldb, beta, C,  ldc);
        }

        inline void cblas_gemm(const enum CBLAS_ORDER Order, const enum CBLAS_TRANSPOSE TransA,
                         const enum CBLAS_TRANSPOSE TransB, const int M, const int N,
                         const int K, const double alpha, const double *A,
                         const int lda, const double *B, const int ldb,
                         const double beta, double *C, const int ldc)
        {
            DLIB_TEST_BLAS_BINDING_GEMM;
            cblas_dgemm( Order, TransA, TransB,  M,  N,
                          K,  alpha, A, lda, B,  ldb, beta, C,  ldc);
        }

        inline void cblas_gemm(const enum CBLAS_ORDER Order, const enum CBLAS_TRANSPOSE TransA,
                         const enum CBLAS_TRANSPOSE TransB, const int M, const int N,
                         const int K, const std::complex<float>& alpha, const std::complex<float> *A,
                         const int lda, const std::complex<float> *B, const int ldb,
                         const std::complex<float>& beta, std::complex<float> *C, const int ldc)
        {
            DLIB_TEST_BLAS_BINDING_GEMM;
            cblas_cgemm( Order, TransA, TransB,  M,  N,
                          K,  &alpha, A, lda, B,  ldb, &beta, C,  ldc);
        }

        inline void cblas_gemm(const enum CBLAS_ORDER Order, const enum CBLAS_TRANSPOSE TransA,
                         const enum CBLAS_TRANSPOSE TransB, const int M, const int N,
                         const int K, const std::complex<double>& alpha, const std::complex<double> *A,
                         const int lda, const std::complex<double> *B, const int ldb,
                         const std::complex<double>& beta, std::complex<double> *C, const int ldc)
        {
            DLIB_TEST_BLAS_BINDING_GEMM;
            cblas_zgemm( Order, TransA, TransB,  M,  N,
                          K,  &alpha, A, lda, B,  ldb, &beta, C,  ldc);
        }

    // ----------------------------------------------------------------------------------------

        inline void cblas_gemv(const enum CBLAS_ORDER order,
                        const enum CBLAS_TRANSPOSE TransA, const int M, const int N,
                        const float alpha, const float *A, const int lda,
                        const float *X, const int incX, const float beta,
                        float *Y, const int incY)
        {
            DLIB_TEST_BLAS_BINDING_GEMV;
            cblas_sgemv(order, TransA, M, N, alpha, A, lda, X, incX, beta, Y, incY);
        }

        inline void cblas_gemv(const enum CBLAS_ORDER order,
                        const enum CBLAS_TRANSPOSE TransA, const int M, const int N,
                        const double alpha, const double *A, const int lda,
                        const double *X, const int incX, const double beta,
                        double *Y, const int incY)
        {
            DLIB_TEST_BLAS_BINDING_GEMV;
            cblas_dgemv(order, TransA, M, N, alpha, A, lda, X, incX, beta, Y, incY);
        }

        inline void cblas_gemv(const enum CBLAS_ORDER order,
                        const enum CBLAS_TRANSPOSE TransA, const int M, const int N,
                        const std::complex<float>& alpha, const std::complex<float> *A, const int lda,
                        const std::complex<float> *X, const int incX, const std::complex<float>& beta,
                        std::complex<float> *Y, const int incY)
        {
            DLIB_TEST_BLAS_BINDING_GEMV;
            cblas_cgemv(order, TransA, M, N, &alpha, A, lda, X, incX, &beta, Y, incY);
        }

        inline void cblas_gemv(const enum CBLAS_ORDER order,
                        const enum CBLAS_TRANSPOSE TransA, const int M, const int N,
                        const std::complex<double>& alpha, const std::complex<double> *A, const int lda,
                        const std::complex<double> *X, const int incX, const std::complex<double>& beta,
                        std::complex<double> *Y, const int incY)
        {
            DLIB_TEST_BLAS_BINDING_GEMV;
            cblas_zgemv(order, TransA, M, N, &alpha, A, lda, X, incX, &beta, Y, incY);
        }

    // ----------------------------------------------------------------------------------------

        inline void cblas_ger(const enum CBLAS_ORDER order, const int M, const int N,
                        const std::complex<float>& alpha, const std::complex<float> *X, const int incX,
                        const std::complex<float> *Y, const int incY, std::complex<float> *A, const int lda)
        {
            DLIB_TEST_BLAS_BINDING_GER;
            cblas_cgeru (order,  M, N, &alpha, X, incX, Y, incY, A, lda);
        }

        inline void cblas_ger(const enum CBLAS_ORDER order, const int M, const int N,
                        const std::complex<double>& alpha, const std::complex<double> *X, const int incX,
                        const std::complex<double> *Y, const int incY, std::complex<double> *A, const int lda)
        {
            DLIB_TEST_BLAS_BINDING_GER;
            cblas_zgeru (order,  M, N, &alpha, X, incX, Y, incY, A, lda);
        }

        inline void cblas_ger(const enum CBLAS_ORDER order, const int M, const int N,
                        const float alpha, const float *X, const int incX,
                        const float *Y, const int incY, float *A, const int lda)
        {
            DLIB_TEST_BLAS_BINDING_GER;
            cblas_sger (order,  M, N, alpha, X, incX, Y, incY, A, lda);
        }

        inline void cblas_ger(const enum CBLAS_ORDER order, const int M, const int N,
                        const double alpha, const double *X, const int incX,
                        const double *Y, const int incY, double *A, const int lda)
        {
            DLIB_TEST_BLAS_BINDING_GER;
            cblas_dger (order,  M, N, alpha, X, incX, Y, incY, A, lda);
        }

    // ----------------------------------------------------------------------------------------

        inline void cblas_gerc(const enum CBLAS_ORDER order, const int M, const int N,
                        const std::complex<float>& alpha, const std::complex<float> *X, const int incX,
                        const std::complex<float> *Y, const int incY, std::complex<float> *A, const int lda)
        {
            DLIB_TEST_BLAS_BINDING_GER;
            cblas_cgerc (order,  M, N, &alpha, X, incX, Y, incY, A, lda);
        }

        inline void cblas_gerc(const enum CBLAS_ORDER order, const int M, const int N,
                        const std::complex<double>& alpha, const std::complex<double> *X, const int incX,
                        const std::complex<double> *Y, const int incY, std::complex<double> *A, const int lda)
        {
            DLIB_TEST_BLAS_BINDING_GER;
            cblas_zgerc (order,  M, N, &alpha, X, incX, Y, incY, A, lda);
        }

    // ----------------------------------------------------------------------------------------

        inline float cblas_dot(const int N, const float  *X, const int incX,
                        const float  *Y, const int incY)
        {
            DLIB_TEST_BLAS_BINDING_DOT;
            return cblas_sdot(N, X, incX, Y, incY);
        }

        inline double cblas_dot(const int N, const double *X, const int incX,
                        const double *Y, const int incY)
        {
            DLIB_TEST_BLAS_BINDING_DOT;
            return cblas_ddot(N, X, incX, Y, incY);
        }

        inline std::complex<float> cblas_dot(const int N, const std::complex<float> *X, const int incX,
                            const std::complex<float> *Y, const int incY)
        {
            DLIB_TEST_BLAS_BINDING_DOT;
            std::complex<float> result;
            cblas_cdotu_sub(N, X, incX, Y, incY, &result);
            return result;
        }

        inline std::complex<double> cblas_dot(const int N, const std::complex<double> *X, const int incX,
                            const std::complex<double> *Y, const int incY)
        {
            DLIB_TEST_BLAS_BINDING_DOT;
            std::complex<double> result;
            cblas_zdotu_sub(N, X, incX, Y, incY, &result);
            return result;
        }

    // ----------------------------------------------------------------------------------------

        inline std::complex<float> cblas_dotc(const int N, const std::complex<float> *X, const int incX,
                            const std::complex<float> *Y, const int incY)
        {
            DLIB_TEST_BLAS_BINDING_DOT;
            std::complex<float> result;
            cblas_cdotc_sub(N, X, incX, Y, incY, &result);
            return result;
        }

        inline std::complex<double> cblas_dotc(const int N, const std::complex<double> *X, const int incX,
                            const std::complex<double> *Y, const int incY)
        {
            DLIB_TEST_BLAS_BINDING_DOT;
            std::complex<double> result;
            cblas_zdotc_sub(N, X, incX, Y, incY, &result);
            return result;
        }

    // ----------------------------------------------------------------------------------------
    // ----------------------------------------------------------------------------------------
    // Helpers for determining the data pointer, LDA, and incX arguments to BLAS functions.

        template <typename T, long NR, long NC, typename MM>
        int get_ld (const matrix<T,NR,NC,MM,row_major_layout>& m) { return m.nc(); }

        template <typename T, long NR, long NC, typename MM>
        int get_ld (const matrix<T,NR,NC,MM,column_major_layout>& m) { return m.nr(); }


        template <typename T, long NR, long NC, typename MM>
        int get_ld (const matrix_op<op_subm<matrix<T,NR,NC,MM,row_major_layout> > >& m) { return m.op.m.nc(); }

        template <typename T, long NR, long NC, typename MM>
        int get_ld (const matrix_op<op_subm<matrix<T,NR,NC,MM,column_major_layout> > >& m) { return m.op.m.nr(); }

        template <typename T, long NR, long NC, typename MM>
        int get_ld (const assignable_sub_matrix<T,NR,NC,MM,row_major_layout>& m) { return m.m.nc(); }

        template <typename T, long NR, long NC, typename MM>
        int get_ld (const assignable_sub_matrix<T,NR,NC,MM,column_major_layout>& m) { return m.m.nr(); }

        template <typename T, typename MM>
        int get_ld (const matrix_op<op_array2d_to_mat<array2d<T,MM> > >& m) { return m.nc(); }
        template <typename T, typename MM>
        int get_ld (const matrix_op<op_array_to_mat<array<T,MM> > >& m) { return m.nc(); }
        template < typename value_type, typename alloc >
        int get_ld (const matrix_op<op_std_vect_to_mat<std::vector<value_type,alloc> > >& m) { return m.nc(); }
        template < typename value_type, typename alloc >
        int get_ld (const matrix_op<op_std_vect_to_mat<std_vector_c<value_type,alloc> > >& m) { return m.nc(); }
        template <typename T>
        int get_ld (const matrix_op<op_pointer_to_col_vect<T> >& m) { return m.nc(); }
        template <typename T>
        int get_ld (const matrix_op<op_pointer_to_mat<T> >& m) { return m.nc(); }

        // --------

        template <typename T, typename MM>
        int get_inc (const matrix_op<op_array2d_to_mat<array2d<T,MM> > >& ) { return 1; }
        template <typename T, typename MM>
        int get_inc (const matrix_op<op_array_to_mat<array<T,MM> > >& ) { return 1; }
        template < typename value_type, typename alloc >
        int get_inc (const matrix_op<op_std_vect_to_mat<std::vector<value_type,alloc> > >& ) { return 1; }
        template < typename value_type, typename alloc >
        int get_inc (const matrix_op<op_std_vect_to_mat<std_vector_c<value_type,alloc> > >& ) { return 1; }
        template <typename T>
        int get_inc (const matrix_op<op_pointer_to_col_vect<T> >& ) { return 1; }
        template <typename T>
        int get_inc (const matrix_op<op_pointer_to_mat<T> >& ) { return 1; }

        template <typename T, long NR, long NC, typename MM, typename L>
        int get_inc (const matrix<T,NR,NC,MM,L>& ) { return 1; }

        template <typename T, long NR, long NC, typename MM>
        int get_inc(const matrix_op<op_colm<matrix<T,NR,NC,MM,row_major_layout> > >& m)
        {
            return m.op.m.nc();
        }

        template <typename T, long NR, long NC, typename MM>
        int get_inc(const matrix_op<op_rowm<matrix<T,NR,NC,MM,row_major_layout> > >& )
        {
            return 1;
        }

        template <typename T, long NR, long NC, typename MM>
        int get_inc(const matrix_op<op_colm2<matrix<T,NR,NC,MM,row_major_layout> > >& m)
        {
            return m.op.m.nc();
        }

        template <typename T, long NR, long NC, typename MM>
        int get_inc(const matrix_op<op_rowm2<matrix<T,NR,NC,MM,row_major_layout> > >& )
        {
            return 1;
        }



        template <typename T, long NR, long NC, typename MM>
        int get_inc(const matrix_op<op_colm<matrix<T,NR,NC,MM,column_major_layout> > >& )
        {
            return 1;
        }

        template <typename T, long NR, long NC, typename MM>
        int get_inc(const matrix_op<op_rowm<matrix<T,NR,NC,MM,column_major_layout> > >& m)
        {
            return m.op.m.nr();
        }

        template <typename T, long NR, long NC, typename MM>
        int get_inc(const matrix_op<op_colm2<matrix<T,NR,NC,MM,column_major_layout> > >& )
        {
            return 1;
        }

        template <typename T, long NR, long NC, typename MM>
        int get_inc(const matrix_op<op_rowm2<matrix<T,NR,NC,MM,column_major_layout> > >& m)
        {
            return m.op.m.nr();
        }



        template <typename T, long NR, long NC, typename MM>
        int get_inc(const assignable_row_matrix<T,NR,NC,MM,row_major_layout>& )
        {
            return 1;
        }

        template <typename T, long NR, long NC, typename MM>
        int get_inc(const assignable_row_matrix<T,NR,NC,MM,column_major_layout>& m)
        {
            return m.m.nr();
        }

        template <typename T, long NR, long NC, typename MM>
        int get_inc(const assignable_col_matrix<T,NR,NC,MM,row_major_layout>& m)
        {
            return m.m.nc();
        }

        template <typename T, long NR, long NC, typename MM>
        int get_inc(const assignable_col_matrix<T,NR,NC,MM,column_major_layout>& )
        {
            return 1;
        }

        // --------

        template <typename T, long NR, long NC, typename MM, typename L>
        const T* get_ptr (const matrix<T,NR,NC,MM,L>& m) { return &m(0,0); }

        template <typename T, long NR, long NC, typename MM, typename L>
        T* get_ptr (matrix<T,NR,NC,MM,L>& m) { return &m(0,0); }

        template <typename T, long NR, long NC, typename MM, typename L>
        const T* get_ptr (const matrix_op<op_subm<matrix<T,NR,NC,MM,L> > >& m) { return &m.op.m(m.op.r_,m.op.c_); }

        template <typename T, long NR, long NC, typename MM, typename L>
        const T* get_ptr (const matrix_op<op_colm<matrix<T,NR,NC,MM,L> > >& m) { return &m.op.m(0,m.op.col); }

        template <typename T, long NR, long NC, typename MM, typename L>
        const T* get_ptr (const matrix_op<op_rowm<matrix<T,NR,NC,MM,L> > >& m) { return &m.op.m(m.op.row,0); }

        template <typename T, long NR, long NC, typename MM, typename L>
        const T* get_ptr (const matrix_op<op_colm2<matrix<T,NR,NC,MM,L> > >& m) { return &m.op.m(0,m.op.col); }

        template <typename T, long NR, long NC, typename MM, typename L>
        const T* get_ptr (const matrix_op<op_rowm2<matrix<T,NR,NC,MM,L> > >& m) { return &m.op.m(m.op.row,0); }


        template <typename T, long NR, long NC, typename MM, typename L>
        T* get_ptr (assignable_col_matrix<T,NR,NC,MM,L>& m) { return &m(0,0); }

        template <typename T, long NR, long NC, typename MM, typename L>
        T* get_ptr (assignable_row_matrix<T,NR,NC,MM,L>& m) { return &m(0,0); }

        template <typename T, long NR, long NC, typename MM, typename L>
        T* get_ptr (assignable_sub_matrix<T,NR,NC,MM,L>& m) { return &m(0,0); }

        template <typename T, typename MM>
        const T* get_ptr (const matrix_op<op_array2d_to_mat<array2d<T,MM> > >& m) { return &m.op.array[0][0]; }
        template <typename T, typename MM>
        const T* get_ptr (const matrix_op<op_array_to_mat<array<T,MM> > >& m) { return &m.op.vect[0]; }
        template < typename T, typename alloc >
        const T* get_ptr (const matrix_op<op_std_vect_to_mat<std::vector<T,alloc> > >& m) { return &m.op.vect[0]; }
        template < typename T, typename alloc >
        const T* get_ptr (const matrix_op<op_std_vect_to_mat<std_vector_c<T,alloc> > >& m) { return &m.op.vect[0]; }
        template <typename T>
        const T* get_ptr (const matrix_op<op_pointer_to_col_vect<T> >& m) { return m.op.ptr; }
        template <typename T>
        const T* get_ptr (const matrix_op<op_pointer_to_mat<T> >& m) { return m.op.ptr; }

    // ----------------------------------------------------------------------------------------
    // ----------------------------------------------------------------------------------------

        // Here we declare some matrix objects for use in the DLIB_ADD_BLAS_BINDING macro.  These
        // extern declarations don't actually correspond to any real matrix objects.  They are
        // simply here so we can build matrix expressions with the DLIB_ADD_BLAS_BINDING marco.


        // Note that the fact that these are double matrices isn't important, it is just a placeholder in this case.  
        extern matrix<double> m;     // general matrix 
        extern matrix<double,1,0> rv;  // general row vector
        extern matrix<double,0,1> cv;  // general column vector
        extern const double s;

    // ----------------------------------------------------------------------------------------
    // ----------------------------------------------------------------------------------------
    //                       AXPY/SCAL overloads
    // ----------------------------------------------------------------------------------------
    // ----------------------------------------------------------------------------------------

        DLIB_ADD_BLAS_BINDING(m)
        {

            const int N = static_cast<int>(src.size());
            if (transpose == false && N != 0)
            {
                if (add_to)
                {
                    cblas_axpy(N, alpha, get_ptr(src), 1, get_ptr(dest), 1);
                }
                else
                {
                    if (get_ptr(src) == get_ptr(dest))
                    {
                        cblas_scal(N, alpha, get_ptr(dest));
                    }
                    else
                    {
                        matrix_assign_default(dest, src, alpha, add_to);
                    }
                }
            }
            else
            {
                matrix_assign_default(dest, trans(src), alpha, add_to);
            }

        } DLIB_END_BLAS_BINDING

        DLIB_ADD_BLAS_BINDING(rv)
        {

            const int N = static_cast<int>(src.size());
            if (transpose == false && N != 0)
            {
                if (add_to)
                {
                    cblas_axpy(N, alpha, get_ptr(src), 1, get_ptr(dest), 1);
                }
                else
                {
                    if (get_ptr(src) == get_ptr(dest))
                    {
                        cblas_scal(N, alpha, get_ptr(dest));
                    }
                    else
                    {
                        matrix_assign_default(dest, src, alpha, add_to);
                    }
                }
            }
            else
            {
                matrix_assign_default(dest, trans(src), alpha, add_to);
            }

        } DLIB_END_BLAS_BINDING

        DLIB_ADD_BLAS_BINDING(cv)
        {

            const int N = static_cast<int>(src.size());
            if (transpose == false && N != 0)
            {
                if (add_to)
                {
                    cblas_axpy(N, alpha, get_ptr(src), 1, get_ptr(dest), 1);
                }
                else
                {
                    if (get_ptr(src) == get_ptr(dest))
                    {
                        cblas_scal(N, alpha, get_ptr(dest));
                    }
                    else
                    {
                        matrix_assign_default(dest, src, alpha, add_to);
                    }
                }
            }
            else
            {
                matrix_assign_default(dest, trans(src), alpha, add_to);
            }

        } DLIB_END_BLAS_BINDING

    // ----------------------------------------------------------------------------------------
    // ----------------------------------------------------------------------------------------
    //                       GEMM overloads
    // ----------------------------------------------------------------------------------------
    // ----------------------------------------------------------------------------------------

        DLIB_ADD_BLAS_BINDING(m*m)
        {
            //cout << "BLAS GEMM: m*m" << endl;
            const bool is_row_major_order = is_same_type<typename dest_exp::layout_type,row_major_layout>::value;  
            const CBLAS_ORDER Order = is_row_major_order ? CblasRowMajor : CblasColMajor;
            const int M = static_cast<int>(src.nr());
            const int N = static_cast<int>(src.nc());
            const int K = static_cast<int>(src.lhs.nc());
            const T* A = get_ptr(src.lhs);
            const int lda = get_ld(src.lhs);
            const T* B = get_ptr(src.rhs);
            const int ldb = get_ld(src.rhs);

            const T beta = static_cast<T>(add_to?1:0);
            T* C = get_ptr(dest);
            const int ldc = get_ld(dest);

            if (transpose == false)
                cblas_gemm(Order, CblasNoTrans, CblasNoTrans, M, N, K, alpha, A, lda, B, ldb, beta, C, ldc);
            else
                cblas_gemm(Order, CblasTrans, CblasTrans, N, M, K, alpha, B, ldb, A, lda, beta, C, ldc);

        } DLIB_END_BLAS_BINDING

        // --------------------------------------

        DLIB_ADD_BLAS_BINDING(trans(m)*m)
        {
            //cout << "BLAS GEMM: trans(m)*m" << endl;
            const bool is_row_major_order = is_same_type<typename dest_exp::layout_type,row_major_layout>::value;  
            const CBLAS_ORDER Order = is_row_major_order ? CblasRowMajor : CblasColMajor;
            const CBLAS_TRANSPOSE TransA = CblasTrans;
            const CBLAS_TRANSPOSE TransB = CblasNoTrans;
            const int M = static_cast<int>(src.nr());
            const int N = static_cast<int>(src.nc());
            const int K = static_cast<int>(src.lhs.nc());
            const T* A = get_ptr(src.lhs.op.m);
            const int lda = get_ld(src.lhs.op.m);
            const T* B = get_ptr(src.rhs);
            const int ldb = get_ld(src.rhs);

            const T beta = static_cast<T>(add_to?1:0);
            T* C = get_ptr(dest);
            const int ldc = get_ld(dest);

            if (transpose == false)
                cblas_gemm(Order, TransA, TransB, M, N, K, alpha, A, lda, B, ldb, beta, C, ldc);
            else
                cblas_gemm(Order, TransA, TransB, N, M, K, alpha, B, ldb, A, lda, beta, C, ldc);

        } DLIB_END_BLAS_BINDING

        // --------------------------------------

        DLIB_ADD_BLAS_BINDING(m*trans(m))
        {
            //cout << "BLAS GEMM: m*trans(m)" << endl;
            const bool is_row_major_order = is_same_type<typename dest_exp::layout_type,row_major_layout>::value;  
            const CBLAS_ORDER Order = is_row_major_order ? CblasRowMajor : CblasColMajor;
            const CBLAS_TRANSPOSE TransA = CblasNoTrans;
            const CBLAS_TRANSPOSE TransB = CblasTrans;
            const int M = static_cast<int>(src.nr());
            const int N = static_cast<int>(src.nc());
            const int K = static_cast<int>(src.lhs.nc());
            const T* A = get_ptr(src.lhs);
            const int lda = get_ld(src.lhs);
            const T* B = get_ptr(src.rhs.op.m);
            const int ldb = get_ld(src.rhs.op.m);

            const T beta = static_cast<T>(add_to?1:0);
            T* C = get_ptr(dest);
            const int ldc = get_ld(dest);

            if (transpose == false)
                cblas_gemm(Order, TransA, TransB, M, N, K, alpha, A, lda, B, ldb, beta, C, ldc);
            else
                cblas_gemm(Order, TransA, TransB, N, M, K, alpha, B, ldb, A, lda, beta, C, ldc);

        } DLIB_END_BLAS_BINDING

        // --------------------------------------

        DLIB_ADD_BLAS_BINDING(trans(m)*trans(m))
        {
            //cout << "BLAS GEMM: trans(m)*trans(m)" << endl;
            const bool is_row_major_order = is_same_type<typename dest_exp::layout_type,row_major_layout>::value;  
            const CBLAS_ORDER Order = is_row_major_order ? CblasRowMajor : CblasColMajor;
            const int M = static_cast<int>(src.nr());
            const int N = static_cast<int>(src.nc());
            const int K = static_cast<int>(src.lhs.nc());
            const T* A = get_ptr(src.lhs.op.m);
            const int lda = get_ld(src.lhs.op.m);
            const T* B = get_ptr(src.rhs.op.m);
            const int ldb = get_ld(src.rhs.op.m);

            const T beta = static_cast<T>(add_to?1:0);
            T* C = get_ptr(dest);
            const int ldc = get_ld(dest);

            if (transpose == false)
                cblas_gemm(Order, CblasTrans, CblasTrans, M, N, K, alpha, A, lda, B, ldb, beta, C, ldc);
            else
                cblas_gemm(Order, CblasNoTrans, CblasNoTrans, N, M, K, alpha, B, ldb, A, lda, beta, C, ldc);
        } DLIB_END_BLAS_BINDING

        // --------------------------------------
        // --------------------------------------
        // --------------------------------------

        DLIB_ADD_BLAS_BINDING(trans(conj(m))*m)
        {
            //cout << "BLAS GEMM: trans(conj(m))*m" << endl;
            const bool is_row_major_order = is_same_type<typename dest_exp::layout_type,row_major_layout>::value;  
            const CBLAS_ORDER Order = is_row_major_order ? CblasRowMajor : CblasColMajor;
            const CBLAS_TRANSPOSE TransA = CblasConjTrans;
            const CBLAS_TRANSPOSE TransB = CblasNoTrans;
            const int M = static_cast<int>(src.nr());
            const int N = static_cast<int>(src.nc());
            const int K = static_cast<int>(src.lhs.nc());
            const T* A = get_ptr(src.lhs.op.m);
            const int lda = get_ld(src.lhs.op.m);
            const T* B = get_ptr(src.rhs);
            const int ldb = get_ld(src.rhs);

            const T beta = static_cast<T>(add_to?1:0);
            T* C = get_ptr(dest);
            const int ldc = get_ld(dest);

            if (transpose == false)
                cblas_gemm(Order, TransA, TransB, M, N, K, alpha, A, lda, B, ldb, beta, C, ldc);
            else
                matrix_assign_default(dest, trans(src), alpha, add_to);

        } DLIB_END_BLAS_BINDING

        // --------------------------------------

        DLIB_ADD_BLAS_BINDING(trans(conj(m))*trans(m))
        {
            //cout << "BLAS GEMM: trans(conj(m))*trans(m)" << endl;
            const bool is_row_major_order = is_same_type<typename dest_exp::layout_type,row_major_layout>::value;  
            const CBLAS_ORDER Order = is_row_major_order ? CblasRowMajor : CblasColMajor;
            const CBLAS_TRANSPOSE TransA = CblasConjTrans;
            const CBLAS_TRANSPOSE TransB = CblasTrans;
            const int M = static_cast<int>(src.nr());
            const int N = static_cast<int>(src.nc());
            const int K = static_cast<int>(src.lhs.nc());
            const T* A = get_ptr(src.lhs.op.m);
            const int lda = get_ld(src.lhs.op.m);
            const T* B = get_ptr(src.rhs.op.m);
            const int ldb = get_ld(src.rhs.op.m);

            const T beta = static_cast<T>(add_to?1:0);
            T* C = get_ptr(dest);
            const int ldc = get_ld(dest);

            if (transpose == false)
                cblas_gemm(Order, TransA, TransB, M, N, K, alpha, A, lda, B, ldb, beta, C, ldc);
            else
                matrix_assign_default(dest, trans(src), alpha, add_to);

        } DLIB_END_BLAS_BINDING

        // --------------------------------------

        DLIB_ADD_BLAS_BINDING(m*trans(conj(m)))
        {
            //cout << "BLAS GEMM: m*trans(conj(m))" << endl;
            const bool is_row_major_order = is_same_type<typename dest_exp::layout_type,row_major_layout>::value;  
            const CBLAS_ORDER Order = is_row_major_order ? CblasRowMajor : CblasColMajor;
            const CBLAS_TRANSPOSE TransA = CblasNoTrans;
            const CBLAS_TRANSPOSE TransB = CblasConjTrans;
            const int M = static_cast<int>(src.nr());
            const int N = static_cast<int>(src.nc());
            const int K = static_cast<int>(src.lhs.nc());
            const T* A = get_ptr(src.lhs);
            const int lda = get_ld(src.lhs);
            const T* B = get_ptr(src.rhs.op.m);
            const int ldb = get_ld(src.rhs.op.m);

            const T beta = static_cast<T>(add_to?1:0);
            T* C = get_ptr(dest);
            const int ldc = get_ld(dest);

            if (transpose == false)
                cblas_gemm(Order, TransA, TransB, M, N, K, alpha, A, lda, B, ldb, beta, C, ldc);
            else
                matrix_assign_default(dest, trans(src), alpha, add_to);
        } DLIB_END_BLAS_BINDING

        // --------------------------------------

        DLIB_ADD_BLAS_BINDING(trans(m)*trans(conj(m)))
        {
            const bool is_row_major_order = is_same_type<typename dest_exp::layout_type,row_major_layout>::value;  
            const CBLAS_ORDER Order = is_row_major_order ? CblasRowMajor : CblasColMajor;
            const CBLAS_TRANSPOSE TransA = CblasTrans;
            const CBLAS_TRANSPOSE TransB = CblasConjTrans;
            const int M = static_cast<int>(src.nr());
            const int N = static_cast<int>(src.nc());
            const int K = static_cast<int>(src.lhs.nc());
            const T* A = get_ptr(src.lhs.op.m);
            const int lda = get_ld(src.lhs.op.m);
            const T* B = get_ptr(src.rhs.op.m);
            const int ldb = get_ld(src.rhs.op.m);

            const T beta = static_cast<T>(add_to?1:0);
            T* C = get_ptr(dest);
            const int ldc = get_ld(dest);

            if (transpose == false)
                cblas_gemm(Order, TransA, TransB, M, N, K, alpha, A, lda, B, ldb, beta, C, ldc);
            else
                matrix_assign_default(dest, trans(src), alpha, add_to);
        } DLIB_END_BLAS_BINDING

        // --------------------------------------

        DLIB_ADD_BLAS_BINDING(trans(conj(m))*trans(conj(m)))
        {
            //cout << "BLAS GEMM: trans(conj(m))*trans(conj(m))" << endl;
            const bool is_row_major_order = is_same_type<typename dest_exp::layout_type,row_major_layout>::value;  
            const CBLAS_ORDER Order = is_row_major_order ? CblasRowMajor : CblasColMajor;
            const CBLAS_TRANSPOSE TransA = CblasConjTrans;
            const CBLAS_TRANSPOSE TransB = CblasConjTrans;
            const int M = static_cast<int>(src.nr());
            const int N = static_cast<int>(src.nc());
            const int K = static_cast<int>(src.lhs.nc());
            const T* A = get_ptr(src.lhs.op.m);
            const int lda = get_ld(src.lhs.op.m);
            const T* B = get_ptr(src.rhs.op.m);
            const int ldb = get_ld(src.rhs.op.m);

            const T beta = static_cast<T>(add_to?1:0);
            T* C = get_ptr(dest);
            const int ldc = get_ld(dest);

            if (transpose == false)
                cblas_gemm(Order, TransA, TransB, M, N, K, alpha, A, lda, B, ldb, beta, C, ldc);
            else
                matrix_assign_default(dest, trans(src), alpha, add_to);
        } DLIB_END_BLAS_BINDING

    // ----------------------------------------------------------------------------------------
    // ----------------------------------------------------------------------------------------
    //                       GEMV overloads
    // ----------------------------------------------------------------------------------------
    // ----------------------------------------------------------------------------------------

        DLIB_ADD_BLAS_BINDING(m*cv)
        {
            //cout << "BLAS GEMV: m*cv" << endl;
            const bool is_row_major_order = is_same_type<typename dest_exp::layout_type,row_major_layout>::value;  
            const CBLAS_ORDER Order = is_row_major_order ? CblasRowMajor : CblasColMajor;
            const CBLAS_TRANSPOSE TransA = CblasNoTrans;
            const int M = static_cast<int>(src.lhs.nr());
            const int N = static_cast<int>(src.lhs.nc());
            const T* A = get_ptr(src.lhs);
            const int lda = get_ld(src.lhs);
            const T* X = get_ptr(src.rhs);
            const int incX = get_inc(src.rhs);

            const T beta = static_cast<T>(add_to?1:0);
            T* Y = get_ptr(dest);
            const int incY = get_inc(dest);

            cblas_gemv(Order, TransA, M, N, alpha, A, lda, X, incX, beta, Y, incY);
        } DLIB_END_BLAS_BINDING

        // --------------------------------------

        DLIB_ADD_BLAS_BINDING(rv*m)
        {
            // Note that rv*m is the same as trans(m)*trans(rv)

            //cout << "BLAS GEMV: rv*m" << endl;
            const bool is_row_major_order = is_same_type<typename dest_exp::layout_type,row_major_layout>::value;  
            const CBLAS_ORDER Order = is_row_major_order ? CblasRowMajor : CblasColMajor;
            const CBLAS_TRANSPOSE TransA = CblasTrans;
            const int M = static_cast<int>(src.rhs.nr());
            const int N = static_cast<int>(src.rhs.nc());
            const T* A = get_ptr(src.rhs);
            const int lda = get_ld(src.rhs);
            const T* X = get_ptr(src.lhs);
            const int incX = get_inc(src.lhs);

            const T beta = static_cast<T>(add_to?1:0);
            T* Y = get_ptr(dest);
            const int incY = get_inc(dest);

            cblas_gemv(Order, TransA, M, N, alpha, A, lda, X, incX, beta, Y, incY);
        } DLIB_END_BLAS_BINDING

        // --------------------------------------

        DLIB_ADD_BLAS_BINDING(trans(cv)*m)
        {
            // Note that trans(cv)*m is the same as trans(m)*cv

            //cout << "BLAS GEMV: trans(cv)*m" << endl;
            const bool is_row_major_order = is_same_type<typename dest_exp::layout_type,row_major_layout>::value;  
            const CBLAS_ORDER Order = is_row_major_order ? CblasRowMajor : CblasColMajor;
            const CBLAS_TRANSPOSE TransA = CblasTrans;
            const int M = static_cast<int>(src.rhs.nr());
            const int N = static_cast<int>(src.rhs.nc());
            const T* A = get_ptr(src.rhs);
            const int lda = get_ld(src.rhs);
            const T* X = get_ptr(src.lhs.op.m);
            const int incX = get_inc(src.lhs.op.m);

            const T beta = static_cast<T>(add_to?1:0);
            T* Y = get_ptr(dest);
            const int incY = get_inc(dest);

            cblas_gemv(Order, TransA, M, N, alpha, A, lda, X, incX, beta, Y, incY);
        } DLIB_END_BLAS_BINDING

        // --------------------------------------

        DLIB_ADD_BLAS_BINDING(m*trans(rv))
        {
            //cout << "BLAS GEMV: m*trans(rv)" << endl;
            const bool is_row_major_order = is_same_type<typename dest_exp::layout_type,row_major_layout>::value;  
            const CBLAS_ORDER Order = is_row_major_order ? CblasRowMajor : CblasColMajor;
            const CBLAS_TRANSPOSE TransA = CblasNoTrans;
            const int M = static_cast<int>(src.lhs.nr());
            const int N = static_cast<int>(src.lhs.nc());
            const T* A = get_ptr(src.lhs);
            const int lda = get_ld(src.lhs);
            const T* X = get_ptr(src.rhs.op.m);
            const int incX = get_inc(src.rhs.op.m);

            const T beta = static_cast<T>(add_to?1:0);
            T* Y = get_ptr(dest);
            const int incY = get_inc(dest);

            cblas_gemv(Order, TransA, M, N, alpha, A, lda, X, incX, beta, Y, incY);
        } DLIB_END_BLAS_BINDING

        // --------------------------------------
        // --------------------------------------
        // --------------------------------------

        DLIB_ADD_BLAS_BINDING(trans(m)*cv)
        {
            //cout << "BLAS GEMV: trans(m)*cv" << endl;
            const bool is_row_major_order = is_same_type<typename dest_exp::layout_type,row_major_layout>::value;  
            const CBLAS_ORDER Order = is_row_major_order ? CblasRowMajor : CblasColMajor;
            const CBLAS_TRANSPOSE TransA = CblasTrans;
            const int M = static_cast<int>(src.lhs.op.m.nr());
            const int N = static_cast<int>(src.lhs.op.m.nc());
            const T* A = get_ptr(src.lhs.op.m);
            const int lda = get_ld(src.lhs.op.m);
            const T* X = get_ptr(src.rhs);
            const int incX = get_inc(src.rhs);

            const T beta = static_cast<T>(add_to?1:0);
            T* Y = get_ptr(dest);
            const int incY = get_inc(dest);

            cblas_gemv(Order, TransA, M, N, alpha, A, lda, X, incX, beta, Y, incY);
        } DLIB_END_BLAS_BINDING

        // --------------------------------------

        DLIB_ADD_BLAS_BINDING(rv*trans(m))
        {
            // Note that rv*trans(m) is the same as m*trans(rv)

            //cout << "BLAS GEMV: rv*trans(m)" << endl;
            const bool is_row_major_order = is_same_type<typename dest_exp::layout_type,row_major_layout>::value;  
            const CBLAS_ORDER Order = is_row_major_order ? CblasRowMajor : CblasColMajor;
            const CBLAS_TRANSPOSE TransA = CblasNoTrans;
            const int M = static_cast<int>(src.rhs.op.m.nr());
            const int N = static_cast<int>(src.rhs.op.m.nc());
            const T* A = get_ptr(src.rhs.op.m);
            const int lda = get_ld(src.rhs.op.m);
            const T* X = get_ptr(src.lhs);
            const int incX = get_inc(src.lhs);

            const T beta = static_cast<T>(add_to?1:0);
            T* Y = get_ptr(dest);
            const int incY = get_inc(dest);

            cblas_gemv(Order, TransA, M, N, alpha, A, lda, X, incX, beta, Y, incY);
        } DLIB_END_BLAS_BINDING

        // --------------------------------------

        DLIB_ADD_BLAS_BINDING(trans(cv)*trans(m))
        {
            // Note that trans(cv)*trans(m) is the same as m*cv

            //cout << "BLAS GEMV: trans(cv)*trans(m)" << endl;
            const bool is_row_major_order = is_same_type<typename dest_exp::layout_type,row_major_layout>::value;  
            const CBLAS_ORDER Order = is_row_major_order ? CblasRowMajor : CblasColMajor;
            const CBLAS_TRANSPOSE TransA = CblasNoTrans;
            const int M = static_cast<int>(src.rhs.op.m.nr());
            const int N = static_cast<int>(src.rhs.op.m.nc());
            const T* A = get_ptr(src.rhs.op.m);
            const int lda = get_ld(src.rhs.op.m);
            const T* X = get_ptr(src.lhs.op.m);
            const int incX = get_inc(src.lhs.op.m);

            const T beta = static_cast<T>(add_to?1:0);
            T* Y = get_ptr(dest);
            const int incY = get_inc(dest);

            cblas_gemv(Order, TransA, M, N, alpha, A, lda, X, incX, beta, Y, incY);
        } DLIB_END_BLAS_BINDING

        // --------------------------------------

        DLIB_ADD_BLAS_BINDING(trans(m)*trans(rv))
        {
            //cout << "BLAS GEMV: trans(m)*trans(rv)" << endl;
            const bool is_row_major_order = is_same_type<typename dest_exp::layout_type,row_major_layout>::value;  
            const CBLAS_ORDER Order = is_row_major_order ? CblasRowMajor : CblasColMajor;
            const CBLAS_TRANSPOSE TransA = CblasTrans;
            const int M = static_cast<int>(src.lhs.op.m.nr());
            const int N = static_cast<int>(src.lhs.op.m.nc());
            const T* A = get_ptr(src.lhs.op.m);
            const int lda = get_ld(src.lhs.op.m);
            const T* X = get_ptr(src.rhs.op.m);
            const int incX = get_inc(src.rhs.op.m);

            const T beta = static_cast<T>(add_to?1:0);
            T* Y = get_ptr(dest);
            const int incY = get_inc(dest);

            cblas_gemv(Order, TransA, M, N, alpha, A, lda, X, incX, beta, Y, incY);
        } DLIB_END_BLAS_BINDING

        // --------------------------------------
        // --------------------------------------
        // --------------------------------------

        DLIB_ADD_BLAS_BINDING(trans(cv)*conj(m))
        {
            // Note that trans(cv)*conj(m) == conj(trans(m))*cv
            //cout << "BLAS GEMV: trans(cv)*conj(m)" << endl;
            const bool is_row_major_order = is_same_type<typename dest_exp::layout_type,row_major_layout>::value;  
            const CBLAS_ORDER Order = is_row_major_order ? CblasRowMajor : CblasColMajor;
            const CBLAS_TRANSPOSE TransA = CblasConjTrans;
            const int M = static_cast<int>(src.rhs.op.m.nr());
            const int N = static_cast<int>(src.rhs.op.m.nc());
            const T* A = get_ptr(src.rhs.op.m);
            const int lda = get_ld(src.rhs.op.m);
            const T* X = get_ptr(src.lhs.op.m);
            const int incX = get_inc(src.lhs.op.m);

            const T beta = static_cast<T>(add_to?1:0);
            T* Y = get_ptr(dest);
            const int incY = get_inc(dest);

            cblas_gemv(Order, TransA, M, N, alpha, A, lda, X, incX, beta, Y, incY);
        } DLIB_END_BLAS_BINDING

        // --------------------------------------

        DLIB_ADD_BLAS_BINDING(rv*conj(m))
        {
            // Note that rv*conj(m) == conj(trans(m))*cv
            //cout << "BLAS GEMV: rv*conj(m)" << endl;
            const bool is_row_major_order = is_same_type<typename dest_exp::layout_type,row_major_layout>::value;  
            const CBLAS_ORDER Order = is_row_major_order ? CblasRowMajor : CblasColMajor;
            const CBLAS_TRANSPOSE TransA = CblasConjTrans;
            const int M = static_cast<int>(src.rhs.op.m.nr());
            const int N = static_cast<int>(src.rhs.op.m.nc());
            const T* A = get_ptr(src.rhs.op.m);
            const int lda = get_ld(src.rhs.op.m);
            const T* X = get_ptr(src.lhs);
            const int incX = get_inc(src.lhs);

            const T beta = static_cast<T>(add_to?1:0);
            T* Y = get_ptr(dest);
            const int incY = get_inc(dest);

            cblas_gemv(Order, TransA, M, N, alpha, A, lda, X, incX, beta, Y, incY);
        } DLIB_END_BLAS_BINDING

        // --------------------------------------

        DLIB_ADD_BLAS_BINDING(trans(conj(m))*cv)
        {
            //cout << "BLAS GEMV: trans(conj(m))*cv" << endl;
            const bool is_row_major_order = is_same_type<typename dest_exp::layout_type,row_major_layout>::value;  
            const CBLAS_ORDER Order = is_row_major_order ? CblasRowMajor : CblasColMajor;
            const CBLAS_TRANSPOSE TransA = CblasConjTrans;
            const int M = static_cast<int>(src.lhs.op.m.nr());
            const int N = static_cast<int>(src.lhs.op.m.nc());
            const T* A = get_ptr(src.lhs.op.m);
            const int lda = get_ld(src.lhs.op.m);
            const T* X = get_ptr(src.rhs);
            const int incX = get_inc(src.rhs);

            const T beta = static_cast<T>(add_to?1:0);
            T* Y = get_ptr(dest);
            const int incY = get_inc(dest);

            cblas_gemv(Order, TransA, M, N, alpha, A, lda, X, incX, beta, Y, incY);
        } DLIB_END_BLAS_BINDING

        // --------------------------------------

        DLIB_ADD_BLAS_BINDING(trans(conj(m))*trans(rv))
        {
            //cout << "BLAS GEMV: trans(conj(m))*trans(rv)" << endl;
            const bool is_row_major_order = is_same_type<typename dest_exp::layout_type,row_major_layout>::value;  
            const CBLAS_ORDER Order = is_row_major_order ? CblasRowMajor : CblasColMajor;
            const CBLAS_TRANSPOSE TransA = CblasConjTrans;
            const int M = static_cast<int>(src.lhs.op.m.nr());
            const int N = static_cast<int>(src.lhs.op.m.nc());
            const T* A = get_ptr(src.lhs.op.m);
            const int lda = get_ld(src.lhs.op.m);
            const T* X = get_ptr(src.rhs.op.m);
            const int incX = get_inc(src.rhs.op.m);

            const T beta = static_cast<T>(add_to?1:0);
            T* Y = get_ptr(dest);
            const int incY = get_inc(dest);

            cblas_gemv(Order, TransA, M, N, alpha, A, lda, X, incX, beta, Y, incY);
        } DLIB_END_BLAS_BINDING

    // ----------------------------------------------------------------------------------------
    // ----------------------------------------------------------------------------------------
    //                       GER overloads
    // ----------------------------------------------------------------------------------------
    // ----------------------------------------------------------------------------------------

        DLIB_ADD_BLAS_BINDING(cv*rv)
        {
            //cout << "BLAS GER: cv*rv" << endl;
            const bool is_row_major_order = is_same_type<typename dest_exp::layout_type,row_major_layout>::value;  
            const CBLAS_ORDER Order = is_row_major_order ? CblasRowMajor : CblasColMajor;
            const int M = static_cast<int>(dest.nr());
            const int N = static_cast<int>(dest.nc());
            const T* X = get_ptr(src.lhs);
            const int incX = get_inc(src.lhs);
            const T* Y = get_ptr(src.rhs);
            const int incY = get_inc(src.rhs);

            if (add_to == false)
                zero_matrix(dest);

            T* A = get_ptr(dest);
            const int lda = get_ld(dest);

            if (transpose == false)
                cblas_ger(Order, M, N, alpha, X, incX, Y, incY, A, lda);
            else
                cblas_ger(Order, M, N, alpha, Y, incY, X, incX, A, lda);

        } DLIB_END_BLAS_BINDING

        // --------------------------------------

        DLIB_ADD_BLAS_BINDING(trans(rv)*rv)
        {
            //cout << "BLAS GER: trans(rv)*rv" << endl;
            const bool is_row_major_order = is_same_type<typename dest_exp::layout_type,row_major_layout>::value;  
            const CBLAS_ORDER Order = is_row_major_order ? CblasRowMajor : CblasColMajor;
            const int M = static_cast<int>(dest.nr());
            const int N = static_cast<int>(dest.nc());
            const T* X = get_ptr(src.lhs.op.m);
            const int incX = get_inc(src.lhs.op.m);
            const T* Y = get_ptr(src.rhs);
            const int incY = get_inc(src.rhs);

            if (add_to == false)
                zero_matrix(dest);

            T* A = get_ptr(dest);
            const int lda = get_ld(dest);

            if (transpose == false)
                cblas_ger(Order, M, N, alpha, X, incX, Y, incY, A, lda);
            else
                cblas_ger(Order, M, N, alpha, Y, incY, X, incX, A, lda);
        } DLIB_END_BLAS_BINDING

        // --------------------------------------

        DLIB_ADD_BLAS_BINDING(cv*trans(cv))
        {
            //cout << "BLAS GER: cv*trans(cv)" << endl;
            const bool is_row_major_order = is_same_type<typename dest_exp::layout_type,row_major_layout>::value;  
            const CBLAS_ORDER Order = is_row_major_order ? CblasRowMajor : CblasColMajor;
            const int M = static_cast<int>(dest.nr());
            const int N = static_cast<int>(dest.nc());
            const T* X = get_ptr(src.lhs);
            const int incX = get_inc(src.lhs);
            const T* Y = get_ptr(src.rhs.op.m);
            const int incY = get_inc(src.rhs.op.m);

            if (add_to == false)
                zero_matrix(dest);

            T* A = get_ptr(dest);
            const int lda = get_ld(dest);

            if (transpose == false)
                cblas_ger(Order, M, N, alpha, X, incX, Y, incY, A, lda);
            else
                cblas_ger(Order, M, N, alpha, Y, incY, X, incX, A, lda);
        } DLIB_END_BLAS_BINDING

        // --------------------------------------

        DLIB_ADD_BLAS_BINDING(trans(rv)*trans(cv))
        {
            //cout << "BLAS GER: trans(rv)*trans(cv)" << endl;
            const bool is_row_major_order = is_same_type<typename dest_exp::layout_type,row_major_layout>::value;  
            const CBLAS_ORDER Order = is_row_major_order ? CblasRowMajor : CblasColMajor;
            const int M = static_cast<int>(dest.nr());
            const int N = static_cast<int>(dest.nc());
            const T* X = get_ptr(src.lhs.op.m);
            const int incX = get_inc(src.lhs.op.m);
            const T* Y = get_ptr(src.rhs.op.m);
            const int incY = get_inc(src.rhs.op.m);

            if (add_to == false)
                zero_matrix(dest);

            T* A = get_ptr(dest);
            const int lda = get_ld(dest);

            if (transpose == false)
                cblas_ger(Order, M, N, alpha, X, incX, Y, incY, A, lda);
            else
                cblas_ger(Order, M, N, alpha, Y, incY, X, incX, A, lda);
        } DLIB_END_BLAS_BINDING

    // ----------------------------------------------------------------------------------------
    // ----------------------------------------------------------------------------------------
    //                       GERC overloads
    // ----------------------------------------------------------------------------------------
    // ----------------------------------------------------------------------------------------

        /*
        DLIB_ADD_BLAS_BINDING(cv*conj(rv))
        {
            //cout << "BLAS GERC: cv*conj(rv)" << endl;
            const bool is_row_major_order = is_same_type<typename dest_exp::layout_type,row_major_layout>::value;  
            const CBLAS_ORDER Order = is_row_major_order ? CblasRowMajor : CblasColMajor;
            const int M = static_cast<int>(dest.nr());
            const int N = static_cast<int>(dest.nc());
            const T* X = get_ptr(src.lhs);
            const int incX = get_inc(src.lhs);
            const T* Y = get_ptr(src.rhs.op.m);
            const int incY = get_inc(src.rhs.op.m);

            if (add_to == false)
                zero_matrix(dest);

            T* A = get_ptr(dest);
            const int lda = get_ld(dest);

            if (transpose == false)
                cblas_gerc(Order, M, N, alpha, X, incX, Y, incY, A, lda);
            else
                cblas_gerc(Order, M, N, alpha, Y, incY, X, incX, A, lda);
        } DLIB_END_BLAS_BINDING
        */

        // --------------------------------------

        DLIB_ADD_BLAS_BINDING(cv*conj(trans(cv)))
        {
            //cout << "BLAS GERC: cv*conj(trans(cv))" << endl;
            const bool is_row_major_order = is_same_type<typename dest_exp::layout_type,row_major_layout>::value;  
            const CBLAS_ORDER Order = is_row_major_order ? CblasRowMajor : CblasColMajor;
            const int M = static_cast<int>(dest.nr());
            const int N = static_cast<int>(dest.nc());
            const T* X = get_ptr(src.lhs);
            const int incX = get_inc(src.lhs);
            const T* Y = get_ptr(src.rhs.op.m);
            const int incY = get_inc(src.rhs.op.m);


            if (transpose == false)
            {
                T* A = get_ptr(dest);
                const int lda = get_ld(dest);

                if (add_to == false)
                    zero_matrix(dest);

                cblas_gerc(Order, M, N, alpha, X, incX, Y, incY, A, lda);
            }
            else
            {
                matrix_assign_default(dest,trans(src),alpha,add_to);
                //cblas_gerc(Order, M, N, alpha, Y, incY, X, incX, A, lda);
            }
        } DLIB_END_BLAS_BINDING

        // --------------------------------------

        DLIB_ADD_BLAS_BINDING(trans(rv)*conj(trans(cv)))
        {
            //cout << "BLAS GERC: trans(rv)*conj(trans(cv))" << endl;
            const bool is_row_major_order = is_same_type<typename dest_exp::layout_type,row_major_layout>::value;  
            const CBLAS_ORDER Order = is_row_major_order ? CblasRowMajor : CblasColMajor;
            const int M = static_cast<int>(dest.nr());
            const int N = static_cast<int>(dest.nc());
            const T* X = get_ptr(src.lhs.op.m);
            const int incX = get_inc(src.lhs.op.m);
            const T* Y = get_ptr(src.rhs.op.m);
            const int incY = get_inc(src.rhs.op.m);


            if (transpose == false)
            {
                if (add_to == false)
                    zero_matrix(dest);

                T* A = get_ptr(dest);
                const int lda = get_ld(dest);

                cblas_gerc(Order, M, N, alpha, X, incX, Y, incY, A, lda);
            }
            else
            {
                matrix_assign_default(dest,trans(src),alpha,add_to);
                //cblas_gerc(Order, M, N, alpha, Y, incY, X, incX, A, lda);
            }
        } DLIB_END_BLAS_BINDING

        // --------------------------------------

        /*
        DLIB_ADD_BLAS_BINDING(trans(rv)*conj(rv))
        {
            //cout << "BLAS GERC: trans(rv)*conj(rv)" << endl;
            const bool is_row_major_order = is_same_type<typename dest_exp::layout_type,row_major_layout>::value;  
            const CBLAS_ORDER Order = is_row_major_order ? CblasRowMajor : CblasColMajor;
            const int M = static_cast<int>(dest.nr());
            const int N = static_cast<int>(dest.nc());
            const T* X = get_ptr(src.lhs.op.m);
            const int incX = get_inc(src.lhs.op.m);
            const T* Y = get_ptr(src.rhs.op.m);
            const int incY = get_inc(src.rhs.op.m);

            if (add_to == false)
                zero_matrix(dest);

            T* A = get_ptr(dest);
            const int lda = get_ld(dest);

            if (transpose == false)
                cblas_gerc(Order, M, N, alpha, X, incX, Y, incY, A, lda);
            else
                cblas_gerc(Order, M, N, alpha, Y, incY, X, incX, A, lda);
        } DLIB_END_BLAS_BINDING
        */

    // ----------------------------------------------------------------------------------------
    // ----------------------------------------------------------------------------------------
    //                       DOT overloads
    // ----------------------------------------------------------------------------------------
    // ----------------------------------------------------------------------------------------

        DLIB_ADD_BLAS_BINDING(rv*cv)
        {
            //cout << "BLAS DOT: rv*cv" << endl;
            const int N = static_cast<int>(src.lhs.size());
            const T* X = get_ptr(src.lhs);
            const int incX = get_inc(src.lhs);
            const T* Y = get_ptr(src.rhs);
            const int incY = get_inc(src.rhs);

            if (add_to == false)
                dest(0) = alpha*cblas_dot(N, X, incX, Y, incY);
            else
                dest(0) += alpha*cblas_dot(N, X, incX, Y, incY);

        } DLIB_END_BLAS_BINDING

        // --------------------------------------

        DLIB_ADD_BLAS_BINDING(trans(cv)*cv)
        {
            //cout << "BLAS DOT: trans(cv)*cv" << endl;
            const int N = static_cast<int>(src.lhs.size());
            const T* X = get_ptr(src.lhs.op.m);
            const int incX = get_inc(src.lhs.op.m);
            const T* Y = get_ptr(src.rhs);
            const int incY = get_inc(src.rhs);

            if (add_to == false)
                dest(0) = alpha*cblas_dot(N, X, incX, Y, incY);
            else
                dest(0) += alpha*cblas_dot(N, X, incX, Y, incY);

        } DLIB_END_BLAS_BINDING

        // --------------------------------------

        DLIB_ADD_BLAS_BINDING(rv*trans(rv))
        {
            //cout << "BLAS DOT: rv*trans(rv)" << endl;
            const int N = static_cast<int>(src.lhs.size());
            const T* X = get_ptr(src.lhs);
            const int incX = get_inc(src.lhs);
            const T* Y = get_ptr(src.rhs.op.m);
            const int incY = get_inc(src.rhs.op.m);

            if (add_to == false)
                dest(0) = alpha*cblas_dot(N, X, incX, Y, incY);
            else
                dest(0) += alpha*cblas_dot(N, X, incX, Y, incY);

        } DLIB_END_BLAS_BINDING

        // --------------------------------------

        DLIB_ADD_BLAS_BINDING(trans(cv)*trans(rv))
        {
            //cout << "BLAS DOT: trans(cv)*trans(rv)" << endl;
            const int N = static_cast<int>(src.lhs.op.m.size());
            const T* X = get_ptr(src.lhs.op.m);
            const int incX = get_inc(src.lhs.op.m);
            const T* Y = get_ptr(src.rhs.op.m);
            const int incY = get_inc(src.rhs.op.m);

            if (add_to == false)
                dest(0) = alpha*cblas_dot(N, X, incX, Y, incY);
            else
                dest(0) += alpha*cblas_dot(N, X, incX, Y, incY);

        } DLIB_END_BLAS_BINDING

    // ----------------------------------------------------------------------------------------
    // ----------------------------------------------------------------------------------------
    //                       DOTC overloads
    // ----------------------------------------------------------------------------------------
    // ----------------------------------------------------------------------------------------

        DLIB_ADD_BLAS_BINDING(conj(rv)*cv)
        {
            //cout << "BLAS DOTC: conj(rv)*cv" << endl;
            const int N = static_cast<int>(src.lhs.op.m.size());
            const T* X = get_ptr(src.lhs.op.m);
            const int incX = get_inc(src.lhs.op.m);
            const T* Y = get_ptr(src.rhs);
            const int incY = get_inc(src.rhs);

            if (add_to == false)
                dest(0) = alpha*cblas_dotc(N, X, incX, Y, incY);
            else
                dest(0) += alpha*cblas_dotc(N, X, incX, Y, incY);

        } DLIB_END_BLAS_BINDING

        // --------------------------------------

        DLIB_ADD_BLAS_BINDING(conj(trans(cv))*cv)
        {
            //cout << "BLAS DOTC: conj(trans(cv))*cv" << endl;
            const int N = static_cast<int>(src.lhs.op.m.size());
            const T* X = get_ptr(src.lhs.op.m);
            const int incX = get_inc(src.lhs.op.m);
            const T* Y = get_ptr(src.rhs);
            const int incY = get_inc(src.rhs);

            if (add_to == false)
                dest(0) = alpha*cblas_dotc(N, X, incX, Y, incY);
            else
                dest(0) += alpha*cblas_dotc(N, X, incX, Y, incY);

        } DLIB_END_BLAS_BINDING

        // --------------------------------------

        DLIB_ADD_BLAS_BINDING(trans(conj(cv))*trans(rv))
        {
            //cout << "BLAS DOTC: trans(conj(cv))*trans(rv)" << endl;
            const int N = static_cast<int>(src.lhs.op.m.size());
            const T* X = get_ptr(src.lhs.op.m);
            const int incX = get_inc(src.lhs.op.m);
            const T* Y = get_ptr(src.rhs.op.m);
            const int incY = get_inc(src.rhs.op.m);

            if (add_to == false)
                dest(0) = alpha*cblas_dotc(N, X, incX, Y, incY);
            else
                dest(0) += alpha*cblas_dotc(N, X, incX, Y, incY);

        } DLIB_END_BLAS_BINDING

    }

// ----------------------------------------------------------------------------------------

}

#endif // DLIB_MATRIx_BLAS_BINDINGS_

