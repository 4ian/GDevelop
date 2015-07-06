// Copyright (C) 2006  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#undef DLIB_MATRIx_MAT_ABSTRACT_Hh_
#ifdef DLIB_MATRIx_MAT_ABSTRACT_Hh_

#include "matrix_abstract.h"
#inclue <vector>
#include "../array/array_kernel_abstract.h"
#include "../array2d/array2d_kernel_abstract.h"

namespace dlib
{

// ----------------------------------------------------------------------------------------

    template <
        typename EXP
        >
    const matrix_exp<EXP>& mat (
        const matrix_exp<EXP>& m
    );
    /*!
        ensures
            - returns m
              (i.e. this function just returns the input matrix without any modifications)
    !*/

// ----------------------------------------------------------------------------------------

    template <
        typename image_type
        >
    const matrix_exp mat (
        const image_type& img
    );
    /*!
        requires
            - image_type == an image object that implements the interface defined in
              dlib/image_processing/generic_image.h or image_type is a image_view or
              const_image_view object.
        ensures
            - This function converts any kind of generic image object into a dlib::matrix
              expression.  Therefore, it is capable of converting objects like dlib::array2d
              of dlib::cv_image.
            - returns a matrix R such that:
                - R.nr() == array.nr() 
                - R.nc() == array.nc()
                - for all valid r and c:
                  R(r, c) == array[r][c]
    !*/

// ----------------------------------------------------------------------------------------

    template <
        typename T,
        typename MM
        >
    const matrix_exp mat (
        const array<T,MM>& m 
    );
    /*!
        ensures
            - returns a matrix R such that:
                - is_col_vector(R) == true 
                - R.size() == m.size()
                - for all valid r:
                  R(r) == m[r]
    !*/

// ----------------------------------------------------------------------------------------

    template <
        typename value_type,
        typename alloc
        >
    const matrix_exp mat (
        const std::vector<value_type,alloc>& vector
    );
    /*!
        ensures
            - returns a matrix R such that:
                - is_col_vector(R) == true 
                - R.size() == vector.size()
                - for all valid r:
                  R(r) == vector[r]
    !*/

// ----------------------------------------------------------------------------------------

    template <
        typename value_type,
        typename alloc
        >
    const matrix_exp mat (
        const std_vector_c<value_type,alloc>& vector
    );
    /*!
        ensures
            - returns a matrix R such that:
                - is_col_vector(R) == true 
                - R.size() == vector.size()
                - for all valid r:
                  R(r) == vector[r]
    !*/

// ----------------------------------------------------------------------------------------

    template <
        typename T
        >
    const matrix_exp mat (
        const T* ptr,
        long nr
    );
    /*!
        requires
            - nr > 0
            - ptr == a pointer to at least nr T objects
        ensures
            - returns a matrix M such that:
                - M.nr() == nr
                - m.nc() == 1
                - for all valid i:
                  M(i) == ptr[i]
            - Note that the returned matrix doesn't take "ownership" of
              the pointer and thus will not delete or free it.
    !*/

// ----------------------------------------------------------------------------------------

    template <
        typename T
        >
    const matrix_exp mat (
        const T* ptr,
        long nr,
        long nc
    );
    /*!
        requires
            - nr > 0
            - nc > 0
            - ptr == a pointer to at least nr*nc T objects
        ensures
            - returns a matrix M such that:
                - M.nr() == nr
                - m.nc() == nc 
                - for all valid r and c:
                  M(r,c) == ptr[r*nc + c]
                  (i.e. the pointer is interpreted as a matrix laid out in memory
                  in row major order)
            - Note that the returned matrix doesn't take "ownership" of
              the pointer and thus will not delete or free it.
    !*/

// ----------------------------------------------------------------------------------------

    template <
        typename T
        >
    const matrix_exp mat (
        const ::arma::Mat<T>& m
    );
    /*!
        ensures
            - Converts a matrix from the Armadillo library into a dlib matrix.
            - returns a matrix R such that:
                - R.nr() == m.n_rows 
                - R.nc() == m.n_cols
                - for all valid r:
                  R(r,c) == m(r,c)
    !*/

// ----------------------------------------------------------------------------------------

    template <
        typename _Scalar, 
        int _Rows, 
        int _Cols, 
        int _Options, 
        int _MaxRows, 
        int _MaxCols
        >
    const matrix_exp mat (
        const ::Eigen::Matrix<_Scalar,_Rows,_Cols,_Options,_MaxRows,_MaxCols>& m
    );
    /*!
        ensures
            - Converts a matrix from the Eigen library into a dlib matrix.
            - returns a matrix R such that:
                - R.nr() == m.rows()
                - R.nc() == m.cols()
                - for all valid r:
                  R(r,c) == m(r,c)
    !*/

// ----------------------------------------------------------------------------------------

    matrix<double,1,1>      mat (double value);
    matrix<float,1,1>       mat (float value);
    matrix<long double,1,1> mat (long double value);
    /*!
        ensures
            - Converts a scalar into a matrix containing just that scalar and returns the
              results.
    !*/

// ----------------------------------------------------------------------------------------

}

#endif // DLIB_MATRIx_MAT_ABSTRACT_Hh_


