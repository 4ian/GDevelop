// Copyright (C) 2006  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#ifndef DLIB_MATRIx_MAT_Hh_
#define DLIB_MATRIx_MAT_Hh_

#include "matrix_mat_abstract.h"
#include "../stl_checked.h"
#include <vector>
#include "matrix_op.h"
#include "../array2d.h"
#include "../array.h"
#include "../image_processing/generic_image.h"


namespace dlib
{

// ----------------------------------------------------------------------------------------
    
    template <
        typename EXP
        >
    const matrix_exp<EXP>& mat (
        const matrix_exp<EXP>& m
    )
    {
        return m;
    }

// ----------------------------------------------------------------------------------------

    template <typename image_type, typename pixel_type>
    struct op_image_to_mat : does_not_alias 
    {
        op_image_to_mat( const image_type& img) : imgview(img){}

        const_image_view<image_type> imgview;

        const static long cost = 1;
        const static long NR = 0;
        const static long NC = 0;
        typedef pixel_type type;
        typedef const pixel_type& const_ret_type;
        typedef default_memory_manager mem_manager_type;
        typedef row_major_layout layout_type;

        const_ret_type apply (long r, long c ) const { return imgview[r][c]; }

        long nr () const { return imgview.nr(); }
        long nc () const { return imgview.nc(); }
    }; 

// ----------------------------------------------------------------------------------------

    template <
        typename image_type
        > // The reason we disable this if it is a matrix is because this matrix_op claims
          // to not alias any matrix.  But obviously that would be a problem if we let it
          // take a matrix.
    const typename disable_if<is_matrix<image_type>,matrix_op<op_image_to_mat<image_type, typename image_traits<image_type>::pixel_type> > >::type mat (
        const image_type& img 
    )
    {
        typedef op_image_to_mat<image_type, typename image_traits<image_type>::pixel_type> op;
        return matrix_op<op>(op(img));
    }

// ----------------------------------------------------------------------------------------

    template <typename image_type>
    struct op_image_view_to_mat : does_not_alias 
    {
        op_image_view_to_mat( const image_view<image_type>& img) : imgview(img){}

        typedef typename image_traits<image_type>::pixel_type pixel_type;

        const image_view<image_type>& imgview;

        const static long cost = 1;
        const static long NR = 0;
        const static long NC = 0;
        typedef pixel_type type;
        typedef const pixel_type& const_ret_type;
        typedef default_memory_manager mem_manager_type;
        typedef row_major_layout layout_type;

        const_ret_type apply (long r, long c ) const { return imgview[r][c]; }

        long nr () const { return imgview.nr(); }
        long nc () const { return imgview.nc(); }
    }; 

    template <
        typename image_type
        > 
    const matrix_op<op_image_view_to_mat<image_type> > mat (
        const image_view<image_type>& img 
    )
    {
        typedef op_image_view_to_mat<image_type> op;
        return matrix_op<op>(op(img));
    }

// ----------------------------------------------------------------------------------------

    template <typename image_type>
    struct op_const_image_view_to_mat : does_not_alias 
    {
        op_const_image_view_to_mat( const const_image_view<image_type>& img) : imgview(img){}

        typedef typename image_traits<image_type>::pixel_type pixel_type;

        const const_image_view<image_type>& imgview;

        const static long cost = 1;
        const static long NR = 0;
        const static long NC = 0;
        typedef pixel_type type;
        typedef const pixel_type& const_ret_type;
        typedef default_memory_manager mem_manager_type;
        typedef row_major_layout layout_type;

        const_ret_type apply (long r, long c ) const { return imgview[r][c]; }

        long nr () const { return imgview.nr(); }
        long nc () const { return imgview.nc(); }
    }; 

    template <
        typename image_type
        > 
    const matrix_op<op_const_image_view_to_mat<image_type> > mat (
        const const_image_view<image_type>& img 
    )
    {
        typedef op_const_image_view_to_mat<image_type> op;
        return matrix_op<op>(op(img));
    }

// ----------------------------------------------------------------------------------------

    template <typename T>
    struct op_array_to_mat : does_not_alias 
    {
        op_array_to_mat( const T& vect_) : vect(vect_){}

        const T& vect;

        const static long cost = 1;
        const static long NR = 0;
        const static long NC = 1;
        typedef typename T::type type;
        typedef const typename T::type& const_ret_type;
        typedef typename T::mem_manager_type mem_manager_type;
        typedef row_major_layout layout_type;

        const_ret_type apply (long r, long  ) const { return vect[r]; }

        long nr () const { return vect.size(); }
        long nc () const { return 1; }
    }; 

// ----------------------------------------------------------------------------------------

    template <
        typename T,
        typename MM
        >
    const matrix_op<op_array_to_mat<array<T,MM> > > mat (
        const array<T,MM>& m 
    )
    {
        typedef op_array_to_mat<array<T,MM> > op;
        return matrix_op<op>(op(m));
    }

// ----------------------------------------------------------------------------------------

    namespace impl
    {
        template <typename U>
        struct not_bool { typedef U type; };
        template <>
        struct not_bool<const bool&> { typedef bool type; };
    }

    template <typename T>
    struct op_std_vect_to_mat : does_not_alias 
    {
        op_std_vect_to_mat( const T& vect_) : vect(vect_){}

        const T& vect;

        const static long cost = 1;
        const static long NR = 0;
        const static long NC = 1;
        typedef typename T::value_type type;
        // Since std::vector returns a proxy for bool types we need to make sure we don't
        // return an element by reference if it is a bool type.
        typedef typename impl::not_bool<const typename T::value_type&>::type const_ret_type;

        typedef default_memory_manager mem_manager_type;
        typedef row_major_layout layout_type;

        const_ret_type apply (long r, long ) const { return vect[r]; }

        long nr () const { return vect.size(); }
        long nc () const { return 1; }
    }; 

// ----------------------------------------------------------------------------------------

    template <
        typename value_type,
        typename alloc
        >
    const matrix_op<op_std_vect_to_mat<std::vector<value_type,alloc> > > mat (
        const std::vector<value_type,alloc>& vector
    )
    {
        typedef op_std_vect_to_mat<std::vector<value_type,alloc> > op;
        return matrix_op<op>(op(vector));
    }

// ----------------------------------------------------------------------------------------

    template <
        typename value_type,
        typename alloc
        >
    const matrix_op<op_std_vect_to_mat<std_vector_c<value_type,alloc> > > mat (
        const std_vector_c<value_type,alloc>& vector
    )
    {
        typedef op_std_vect_to_mat<std_vector_c<value_type,alloc> > op;
        return matrix_op<op>(op(vector));
    }

// ----------------------------------------------------------------------------------------

    template <typename T>
    struct op_pointer_to_col_vect : does_not_alias 
    {
        op_pointer_to_col_vect(
            const T* ptr_,
            const long size_
        ) : ptr(ptr_), size(size_){}

        const T* ptr;
        const long size;

        const static long cost = 1;
        const static long NR = 0;
        const static long NC = 1;
        typedef T type;
        typedef const T& const_ret_type;
        typedef default_memory_manager mem_manager_type;
        typedef row_major_layout layout_type;

        const_ret_type apply (long r, long ) const { return ptr[r]; }

        long nr () const { return size; }
        long nc () const { return 1; }
    }; 

// ----------------------------------------------------------------------------------------

    template <
        typename T
        >
    const matrix_op<op_pointer_to_col_vect<T> > mat (
        const T* ptr,
        long nr
    )
    {
        DLIB_ASSERT(nr > 0 , 
                    "\tconst matrix_exp mat(ptr, nr)"
                    << "\n\t nr must be bigger than 0"
                    << "\n\t nr: " << nr
        );
        typedef op_pointer_to_col_vect<T> op;
        return matrix_op<op>(op(ptr, nr));
    }

// ----------------------------------------------------------------------------------------

    template <typename T>
    struct op_pointer_to_mat : does_not_alias 
    {
        op_pointer_to_mat(
            const T* ptr_,
            const long nr_,
            const long nc_ 
        ) : ptr(ptr_), rows(nr_), cols(nc_){}

        const T* ptr;
        const long rows;
        const long cols;

        const static long cost = 1;
        const static long NR = 0;
        const static long NC = 0;
        typedef T type;
        typedef const T& const_ret_type;
        typedef default_memory_manager mem_manager_type;
        typedef row_major_layout layout_type;

        const_ret_type apply (long r, long c) const { return ptr[r*cols + c]; }

        long nr () const { return rows; }
        long nc () const { return cols; }
    }; 

// ----------------------------------------------------------------------------------------

    template <
        typename T
        >
    const matrix_op<op_pointer_to_mat<T> > mat (
        const T* ptr,
        long nr,
        long nc
    )
    {
        DLIB_ASSERT(nr > 0 && nc > 0 , 
                    "\tconst matrix_exp mat(ptr, nr, nc)"
                    << "\n\t nr and nc must be bigger than 0"
                    << "\n\t nr: " << nr
                    << "\n\t nc: " << nc
        );
        typedef op_pointer_to_mat<T> op;
        return matrix_op<op>(op(ptr,nr,nc));
    }

// ----------------------------------------------------------------------------------------

}

namespace arma
{
    template <typename T> class Mat;
}
namespace dlib
{
    template <typename T>
    struct op_arma_Mat_to_mat : does_not_alias 
    {
        op_arma_Mat_to_mat( const T& array_) : array(array_){}

        const T& array;

        const static long cost = 1;
        const static long NR = 0;
        const static long NC = 0;
        typedef typename T::elem_type type;
        typedef typename T::elem_type const_ret_type;
        typedef default_memory_manager mem_manager_type;
        typedef row_major_layout layout_type;

        const_ret_type apply (long r, long c ) const { return array(r,c); }

        long nr () const { return array.n_rows; }
        long nc () const { return array.n_cols; }
    }; 

// ----------------------------------------------------------------------------------------

    template <
        typename T
        >
    const matrix_op<op_arma_Mat_to_mat< ::arma::Mat<T> > > mat (
        const ::arma::Mat<T>& array
    )
    {
        typedef op_arma_Mat_to_mat< ::arma::Mat<T> > op;
        return matrix_op<op>(op(array));
    }
}

namespace Eigen
{
    template<typename _Scalar, int _Rows, int _Cols, int _Options, int _MaxRows, int _MaxCols>
    class Matrix;
}

namespace dlib
{
    template <typename T, int _Rows, int _Cols>
    struct op_eigen_Matrix_to_mat : does_not_alias 
    {
        op_eigen_Matrix_to_mat( const T& array_) : m(array_){}

        const T& m;

        const static long cost = 1;
        const static long NR = (_Rows > 0) ? _Rows : 0;
        const static long NC = (_Cols > 0) ? _Cols : 0;
        typedef typename T::Scalar type;
        typedef typename T::Scalar const_ret_type;
        typedef default_memory_manager mem_manager_type;
        typedef row_major_layout layout_type;

        const_ret_type apply (long r, long c ) const { return m(r,c); }

        long nr () const { return m.rows(); }
        long nc () const { return m.cols(); }
    }; 

// ----------------------------------------------------------------------------------------

    template <
        typename _Scalar, int _Rows, int _Cols, int _Options, int _MaxRows, int _MaxCols
        >
    const matrix_op<op_eigen_Matrix_to_mat< ::Eigen::Matrix<_Scalar,_Rows,_Cols,_Options,_MaxRows,_MaxCols>,_Rows,_Cols > > mat (
        const ::Eigen::Matrix<_Scalar,_Rows,_Cols,_Options,_MaxRows,_MaxCols>& m
    )
    {
        typedef op_eigen_Matrix_to_mat< ::Eigen::Matrix<_Scalar,_Rows,_Cols,_Options,_MaxRows,_MaxCols>,_Rows,_Cols > op;
        return matrix_op<op>(op(m));
    }

// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------
//                                  DEPRECATED FUNCTIONS
// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------

// vector_to_matrix(), array_to_matrix(), pointer_to_matrix(), and
// pointer_to_column_vector() have been deprecated in favor of the more uniform mat()
// function.  But they are here for backwards compatibility.

    template <
        typename vector_type
        >
    const typename disable_if<is_matrix<vector_type>, matrix_op<op_array_to_mat<vector_type> > >::type 
    vector_to_matrix (
        const vector_type& vector
    )
    {
        typedef op_array_to_mat<vector_type> op;
        return matrix_op<op>(op(vector));
    }

    template <
        typename vector_type
        >
    const typename enable_if<is_matrix<vector_type>,vector_type>::type& vector_to_matrix (
        const vector_type& vector
    )
    /*!
        This overload catches the case where the argument to this function is
        already a matrix.
    !*/
    {
        return vector;
    }

    template <
        typename value_type,
        typename alloc
        >
    const matrix_op<op_std_vect_to_mat<std::vector<value_type,alloc> > > vector_to_matrix (
        const std::vector<value_type,alloc>& vector
    )
    {
        typedef op_std_vect_to_mat<std::vector<value_type,alloc> > op;
        return matrix_op<op>(op(vector));
    }

    template <
        typename value_type,
        typename alloc
        >
    const matrix_op<op_std_vect_to_mat<std_vector_c<value_type,alloc> > > vector_to_matrix (
        const std_vector_c<value_type,alloc>& vector
    )
    {
        typedef op_std_vect_to_mat<std_vector_c<value_type,alloc> > op;
        return matrix_op<op>(op(vector));
    }

// ----------------------------------------------------------------------------------------

    template <
        typename array_type
        >
    const typename enable_if<is_matrix<array_type>,array_type>::type& 
    array_to_matrix (
        const array_type& array
    )
    {
        return array;
    }

// ----------------------------------------------------------------------------------------

    template <typename T>
    struct op_array2d_to_mat : does_not_alias 
    {
        op_array2d_to_mat( const T& array_) : array(array_){}

        const T& array;

        const static long cost = 1;
        const static long NR = 0;
        const static long NC = 0;
        typedef typename T::type type;
        typedef const typename T::type& const_ret_type;
        typedef typename T::mem_manager_type mem_manager_type;
        typedef row_major_layout layout_type;

        const_ret_type apply (long r, long c ) const { return array[r][c]; }

        long nr () const { return array.nr(); }
        long nc () const { return array.nc(); }
    }; 

    // Note that we have this version of mat() because it's slightly faster executing
    // than the general one that handles any generic image.  This is because it avoids
    // calling image_data() which for array2d involves a single if statement but this
    // version here has no if statement in its construction.
    template < typename T, typename MM >
    const matrix_op<op_array2d_to_mat<array2d<T,MM> > > mat (
        const array2d<T,MM>& array
    )
    {
        typedef op_array2d_to_mat<array2d<T,MM> > op;
        return matrix_op<op>(op(array));
    }

    template <
        typename array_type
        >
    const typename disable_if<is_matrix<array_type>,matrix_op<op_array2d_to_mat<array_type> > >::type 
    array_to_matrix (
        const array_type& array
    )
    {
        typedef op_array2d_to_mat<array_type> op;
        return matrix_op<op>(op(array));
    }

// ----------------------------------------------------------------------------------------

    template <
        typename T
        >
    const matrix_op<op_pointer_to_mat<T> > pointer_to_matrix (
        const T* ptr,
        long nr,
        long nc
    )
    {
        DLIB_ASSERT(nr > 0 && nc > 0 , 
                    "\tconst matrix_exp pointer_to_matrix(ptr, nr, nc)"
                    << "\n\t nr and nc must be bigger than 0"
                    << "\n\t nr: " << nr
                    << "\n\t nc: " << nc
        );
        typedef op_pointer_to_mat<T> op;
        return matrix_op<op>(op(ptr,nr,nc));
    }

    template <
        typename T
        >
    const matrix_op<op_pointer_to_col_vect<T> > pointer_to_column_vector (
        const T* ptr,
        long nr
    )
    {
        DLIB_ASSERT(nr > 0 , 
                    "\tconst matrix_exp pointer_to_column_vector(ptr, nr)"
                    << "\n\t nr must be bigger than 0"
                    << "\n\t nr: " << nr
        );
        typedef op_pointer_to_col_vect<T> op;
        return matrix_op<op>(op(ptr, nr));
    }

// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------

    inline matrix<double,1,1> mat (
        double value
    )
    {
        matrix<double,1,1> temp;
        temp(0) = value;
        return temp;
    }

    inline matrix<float,1,1> mat (
        float value
    )
    {
        matrix<float,1,1> temp;
        temp(0) = value;
        return temp;
    }

    inline matrix<long double,1,1> mat (
        long double value
    )
    {
        matrix<long double,1,1> temp;
        temp(0) = value;
        return temp;
    }

// ----------------------------------------------------------------------------------------

}

#endif // DLIB_MATRIx_MAT_Hh_


