// Copyright (C) 2006  Davis E. King (davisking@users.sourceforge.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#undef DLIB_MATRIx_UTILITIES_ABSTRACT_
#ifdef DLIB_MATRIx_UTILITIES_ABSTRACT_

#include "matrix_abstract.h"
#include <complex>
#include "pixel.h"
#include "../geometry.h"
#inclue <vector>

namespace dlib
{

// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------
//                             Elementary matrix operations
// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------

    const matrix_exp diag (
        const matrix_exp& m
    );
    /*!
        requires
            - m is a square matrix
        ensures
            - returns a column vector R that contains the elements from the diagonal 
              of m in the order R(0)==m(0,0), R(1)==m(1,1), R(2)==m(2,2) and so on.
    !*/

// ----------------------------------------------------------------------------------------

    const matrix_exp diagm (
        const matrix_exp& m
    );
    /*!
        requires
            - m is a row or column matrix
        ensures
            - returns a square matrix M such that:
                - diag(M) == m
                - non diagonal elements of M are 0
    !*/

// ----------------------------------------------------------------------------------------

    const matrix_exp trans (
        const matrix_exp& m
    );
    /*!
        ensures
            - returns the transpose of the matrix m
    !*/

// ----------------------------------------------------------------------------------------

    template <
        typename T, 
        long NR, 
        long NC, 
        T val
        >
    const matrix_exp uniform_matrix (
    );
    /*!
        requires
            - NR > 0 && NC > 0
        ensures
            - returns an NR by NC matrix with elements of type T and all set to val.
    !*/

// ----------------------------------------------------------------------------------------

    template <
        long NR, 
        long NC,
        typename T
        >
    const matrix_exp uniform_matrix (
        const T& val
    );
    /*!
        requires
            - NR > 0 && NC > 0
        ensures
            - returns an NR by NC matrix with elements of type T and all set to val.
    !*/

// ----------------------------------------------------------------------------------------

    template <
        typename T
        >
    const matrix_exp uniform_matrix (
        long nr,
        long nc,
        const T& val
    );
    /*!
        requires
            - nr > 0 && nc > 0
        ensures
            - returns an nr by nc matrix with elements of type T and all set to val.
    !*/

// ----------------------------------------------------------------------------------------

    template <
        typename T
        >
    const matrix_exp identity_matrix (
        long N
    );
    /*!
        requires
            - N > 0
        ensures
            - returns an N by N identity matrix with elements of type T.
    !*/

// ----------------------------------------------------------------------------------------

    template <
        typename T, 
        long N
        >
    const matrix_exp identity_matrix (
    );
    /*!
        requires
            - N > 0
        ensures
            - returns an N by N identity matrix with elements of type T.
    !*/

// ----------------------------------------------------------------------------------------

    template <
        long R,
        long C
        >
    const matrix_exp rotate (
        const matrix_exp& m
    );
    /*!
        requires
            - R < m.nr()
            - C < m.nc()
        ensures
            - returns a matrix R such that:
                - R::type == the same type that was in m
                - R has the same dimensions as m
                - for all valid r and c:
                  R( (r+R)%m.nr() , (c+C)%m.nc() ) == m(r,c)
    !*/

// ----------------------------------------------------------------------------------------

    template <
        typename vector_type
        >
    const matrix_exp vector_to_matrix (
        const vector_type& vector
    );
    /*!
        requires
            - vector_type is an implementation of array/array_kernel_abstract.h or
              std::vector or dlib::std_vector_c or dlib::matrix
        ensures
            - if (vector_type is a dlib::matrix) then
                - returns a reference to vector
            - else
                - returns a matrix R such that:
                    - R.nr() == vector.size() 
                    - R.nc() == 1 
                    - for all valid r:
                      R(r) == vector[r]
    !*/

// ----------------------------------------------------------------------------------------

    template <
        typename array_type
        >
    const matrix_exp array_to_matrix (
        const array_type& array
    );
    /*!
        requires
            - array_type is an implementation of array2d/array2d_kernel_abstract.h
              or dlib::matrix
        ensures
            - if (array_type is a dlib::matrix) then
                - returns a reference to array 
            - else
                - returns a matrix R such that:
                    - R.nr() == array.nr() 
                    - R.nc() == array.nc()
                    - for all valid r and c:
                      R(r, c) == array[r][c]
    !*/

// ----------------------------------------------------------------------------------------

    const rectangle get_rect (  
        const matrix_exp& m
    );
    /*!
        ensures
            - returns rectangle(0, 0, m.nc()-1, m.nr()-1)
              (i.e. returns a rectangle that has the same dimensions as
              the matrix m)
    !*/

// ----------------------------------------------------------------------------------------

    const matrix_exp subm (
        const matrix_exp& m,
        long row,
        long col,
        long nr,
        long nc
    );
    /*!
        requires
            - row >= 0
            - row + nr <= m.nr()
            - col >= 0
            - col + nc <= m.nc()
        ensures
            - returns a matrix R such that:
                - R.nr() == nr 
                - R.nc() == nc
                - for all valid r and c:
                  R(r, c) == m(r+row,c+col)
    !*/

// ----------------------------------------------------------------------------------------

    const matrix_exp subm (
        const matrix_exp& m,
        const rectangle& rect
    );
    /*!
        requires
            - get_rect(m).contains(rect) == true
              (i.e. rect is a region inside the matrix m)
        ensures
            - returns a matrix R such that:
                - R.nr() == rect.height()  
                - R.nc() == rect.width()
                - for all valid r and c:
                  R(r, c) == m(r+rect.top(), c+rect.left())
    !*/

// ----------------------------------------------------------------------------------------

    const matrix_exp rowm (
        const matrix_exp& m,
        long row
    );
    /*!
        requires
            - 0 <= row < m.nr()
        ensures
            - returns a matrix R such that:
                - R.nr() == 1
                - R.nc() == m.nc()
                - for all valid i:
                  R(i) == m(row,i)
    !*/

// ----------------------------------------------------------------------------------------

    const matrix_exp colm (
        const matrix_exp& m,
        long col 
    );
    /*!
        requires
            - 0 <= col < m.nr()
        ensures
            - returns a matrix R such that:
                - R.nr() == m.nr() 
                - R.nc() == 1
                - for all valid i:
                  R(i) == m(i,col)
    !*/

// ----------------------------------------------------------------------------------------

    assignable_matrix_expression set_subm (
        matrix& m,
        long row,
        long col,
        long nr,
        long nc
    );
    /*!
        requires
            - row >= 0
            - row + nr <= m.nr()
            - col >= 0
            - col + nc <= m.nc()
        ensures
            - statements of the following form:
                - set_subm(m,row,col,nr,nc) = some_matrix;
              result in it being the case that:
                - subm(m,row,col,nr,nc) == some_matrix.

            - statements of the following form:
                - set_subm(m,row,col,nr,nc) = scalar_value;
              result in it being the case that:
                - subm(m,row,col,nr,nc) == uniform_matrix<matrix::type>(nr,nc,scalar_value).
    !*/

// ----------------------------------------------------------------------------------------

    assignable_matrix_expression set_subm (
        matrix& m,
        const rectangle& rect
    );
    /*!
        requires
            - get_rect(m).contains(rect) == true
              (i.e. rect is a region inside the matrix m)
        ensures
            - statements of the following form:
                - set_subm(m,rect) = some_matrix;
              result in it being the case that:
                - subm(m,rect) == some_matrix.

            - statements of the following form:
                - set_subm(m,rect) = scalar_value;
              result in it being the case that:
                - subm(m,rect) == uniform_matrix<matrix::type>(nr,nc,scalar_value).
    !*/

// ----------------------------------------------------------------------------------------

    assignable_matrix_expression set_rowm (
        matrix& m,
        long row
    );
    /*!
        requires
            - 0 <= row < m.nr()
        ensures
            - statements of the following form:
                - set_rowm(m,row) = some_matrix;
              result in it being the case that:
                - rowm(m,row) == some_matrix.

            - statements of the following form:
                - set_rowm(m,row) = scalar_value;
              result in it being the case that:
                - rowm(m,row) == uniform_matrix<matrix::type>(1,nc,scalar_value).
    !*/

// ----------------------------------------------------------------------------------------

    assignable_matrix_expression set_colm (
        matrix& m,
        long col 
    );
    /*!
        requires
            - 0 <= col < m.nr()
        ensures
            - statements of the following form:
                - set_colm(m,col) = some_matrix;
              result in it being the case that:
                - colm(m,col) == some_matrix.

            - statements of the following form:
                - set_colm(m,col) = scalar_value;
              result in it being the case that:
                - colm(m,col) == uniform_matrix<matrix::type>(nr,1,scalar_value).
    !*/

// ----------------------------------------------------------------------------------------

    template <
        long R,
        long C
        >
    const matrix_exp removerc (
        const matrix_exp& m
    );
    /*!
        requires
            - m.nr() > R
            - m.nc() > C
        ensures
            - returns a matrix M such that:
                - M.nr() == m.nr() - 1
                - M.nc() == m.nc() - 1
                - M == m with its R row and C column removed
    !*/

// ----------------------------------------------------------------------------------------

    const matrix_exp removerc (
        const matrix_exp& m,
        long R,
        long C
    );
    /*!
        requires
            - m.nr() > R
            - m.nc() > C
        ensures
            - returns a matrix M such that:
                - M.nr() == m.nr() - 1
                - M.nc() == m.nc() - 1
                - M == m with its R row and C column removed
    !*/

// ----------------------------------------------------------------------------------------

    template <
        long R
        >
    const matrix_exp remove_row (
        const matrix_exp& m
    );
    /*!
        requires
            - m.nr() > R
        ensures
            - returns a matrix M such that:
                - M.nr() == m.nr() - 1
                - M.nc() == m.nc() 
                - M == m with its R row removed
    !*/

// ----------------------------------------------------------------------------------------

    const matrix_exp remove_row (
        const matrix_exp& m,
        long R
    );
    /*!
        requires
            - m.nr() > R
        ensures
            - returns a matrix M such that:
                - M.nr() == m.nr() - 1
                - M.nc() == m.nc() 
                - M == m with its R row removed
    !*/

// ----------------------------------------------------------------------------------------

    template <
        long C
        >
    const matrix_exp remove_col (
        const matrix_exp& m
    );
    /*!
        requires
            - m.nc() > C
        ensures
            - returns a matrix M such that:
                - M.nr() == m.nr() 
                - M.nc() == m.nc() - 1 
                - M == m with its C column removed
    !*/

// ----------------------------------------------------------------------------------------

    const matrix_exp remove_col (
        const matrix_exp& m,
        long C
    );
    /*!
        requires
            - m.nc() > C
        ensures
            - returns a matrix M such that:
                - M.nr() == m.nr() 
                - M.nc() == m.nc() - 1 
                - M == m with its C column removed
    !*/

// ----------------------------------------------------------------------------------------

    template <
       typename target_type
       >
    const matrix_exp matrix_cast (
        const matrix_exp& m
    );
    /*!
        ensures
            - returns a matrix R where for all valid r and c:
              R(r,c) == static_cast<target_type>(m(r,c))
              also, R has the same dimensions as m.
    !*/

// ----------------------------------------------------------------------------------------

    template <
        typename T,
        long NR,
        long NC,
        typename MM,
        typename U
        >
    void set_all_elements (
        matrix<T,NR,NC,MM>& m,
        U value
    );
    /*!
        ensures
            - for all valid r and c:
              m(r,c) == value
    !*/

// ----------------------------------------------------------------------------------------

    const matrix_exp::matrix_type tmp (
        const matrix_exp& m
    );
    /*!
        ensures
            - returns a temporary matrix object that is a copy of m. 
              (This is useful because it allows you to easily force a matrix_exp to 
              fully evaluate before giving it to some other function that queries
              the elements of the matrix more than once each, such as the matrix
              multiplication operator.)
    !*/

// ----------------------------------------------------------------------------------------

    bool equal (
        const matrix_exp& a,
        const matrix_exp& b,
        const matrix_exp::type epsilon = 100*std::numeric_limits<matrix_exp::type>::epsilon()
    );
    /*!
        ensures
            - if (a and b don't have the same dimensions) then
                - returns false
            - else if (there exists an r and c such that abs(a(r,c)-b(r,c)) > epsilon) then
                - returns false
            - else
                - returns true
    !*/

// ----------------------------------------------------------------------------------------

    const matrix_exp pointwise_multiply (
        const matrix_exp& a,
        const matrix_exp& b 
    );
    /*!
        requires
            - a.nr() == b.nr()
            - a.nc() == b.nc()
            - a and b both contain the same type of element
        ensures
            - returns a matrix R such that:
                - R::type == the same type that was in a and b.
                - R has the same dimensions as a and b. 
                - for all valid r and c:
                  R(r,c) == a(r,c) * b(r,c)
    !*/

    const matrix_exp pointwise_multiply (
        const matrix_exp& a,
        const matrix_exp& b,
        const matrix_exp& c 
    );
    /*!
        performs pointwise_multiply(a,pointwise_multiply(b,c));
    !*/

    const matrix_exp pointwise_multiply (
        const matrix_exp& a,
        const matrix_exp& b,
        const matrix_exp& c,
        const matrix_exp& d 
    );
    /*!
        performs pointwise_multiply(pointwise_multiply(a,b),pointwise_multiply(c,d));
    !*/

// ----------------------------------------------------------------------------------------

    const matrix_exp tensor_product (
        const matrix_exp& a,
        const matrix_exp& b 
    );
    /*!
        requires
            - a and b both contain the same type of element
        ensures
            - returns a matrix R such that:
                - R::type == the same type that was in a and b.
                - R.nr() == a.nr()*b.nr()  
                - R.nc() == a.nc()*b.nc()  
                - for all valid r and c:
                  R(r,c) == a(r/b.nr(), c/b.nc()) * b(r%b.nr(), c%b.nc())
                - I.e. R is the tensor product of matrix a with matrix b
    !*/

// ----------------------------------------------------------------------------------------

    const matrix_exp scale_columns (
        const matrix_exp& m,
        const matrix_exp& v
    );
    /*!
        requires
            - v.nc() == 1 (i.e. v is a column vector)
            - v.nr() == m.nc()
            - m and v both contain the same type of element
        ensures
            - returns a matrix R such that:
                - R::type == the same type that was in m and v.
                - R has the same dimensions as m. 
                - for all valid r and c:
                  R(r,c) == m(r,c) * v(c)
                - i.e. R is the result of multiplying each of m's columns by
                  the corresponding scalar in v.
    !*/

// ----------------------------------------------------------------------------------------

    template <typename T>
    void sort_columns (
        matrix<T>& m,
        matrix<T>& v
    );
    /*!
        requires
            - v.nc() == 1 (i.e. v is a column vector)
            - v.nr() == m.nc()
            - m and v both contain the same type of element
        ensures
            - the dimensions for m and v are not changed
            - sorts the columns of m according to the values in v.
              i.e. 
                - #v == the contents of v but in sorted order according to
                  operator<.  So smaller elements come first.
                - Let #v(new(i)) == v(i) (i.e. new(i) is the index element i moved to)
                - colm(#m,new(i)) == colm(m,i) 
    !*/

// ----------------------------------------------------------------------------------------

    template <typename T>
    void rsort_columns (
        matrix<T>& m,
        matrix<T>& v
    );
    /*!
        requires
            - v.nc() == 1 (i.e. v is a column vector)
            - v.nr() == m.nc()
            - m and v both contain the same type of element
        ensures
            - the dimensions for m and v are not changed
            - sorts the columns of m according to the values in v.
              i.e. 
                - #v == the contents of v but in sorted order according to
                  operator>.  So larger elements come first.
                - Let #v(new(i)) == v(i) (i.e. new(i) is the index element i moved to)
                - colm(#m,new(i)) == colm(m,i) 
    !*/

// ----------------------------------------------------------------------------------------

    const matrix_exp::type length_squared (
        const matrix_exp& m
    );
    /*!
        requires
            - m.nr() == 1 || m.nc() == 1
              (i.e. m must be a vector)
        ensures
            - returns sum(squared(m))
              (i.e. returns the square of the length of the vector m)
    !*/

// ----------------------------------------------------------------------------------------

    const matrix_exp::type length (
        const matrix_exp& m
    );
    /*!
        requires
            - m.nr() == 1 || m.nc() == 1
              (i.e. m must be a vector)
        ensures
            - returns sqrt(sum(squared(m)))
              (i.e. returns the length of the vector m)
    !*/

// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------
//                             Linear algebra functions 
// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------

    const matrix_exp::matrix_type inv (
        const matrix_exp& m
    );
    /*!
        requires
            - m is a square matrix
        ensures
            - returns the inverse of m 
              (Note that if m is singular or so close to being singular that there
              is a lot of numerical error then the returned matrix will be bogus.  
              You can check by seeing if m*inv(m) is an identity matrix)
    !*/

// ----------------------------------------------------------------------------------------

    const matrix pinv (
        const matrix_exp& m
    );
    /*!
        ensures
            - returns the Moore-Penrose pseudoinverse of m.
            - The returned matrix has m.nc() rows and m.nr() columns.
    !*/

// ----------------------------------------------------------------------------------------

    void svd (
        const matrix_exp& m,
        matrix<matrix_exp::type>& u,
        matrix<matrix_exp::type>& w,
        matrix<matrix_exp::type>& v
    );
    /*!
        ensures
            - computes the singular value decomposition of m
            - m == #u*#w*trans(#v)
            - trans(#u)*#u == identity matrix
            - trans(#v)*#v == identity matrix
            - diag(#w) == the singular values of the matrix m in no 
              particular order.  All non-diagonal elements of #w are
              set to 0.
            - #u.nr() == m.nr()
            - #u.nc() == m.nc()
            - #w.nr() == m.nc()
            - #w.nc() == m.nc()
            - #v.nr() == m.nc()
            - #v.nc() == m.nc()
    !*/

// ----------------------------------------------------------------------------------------

    long svd2 (
        bool withu, 
        bool withv, 
        const matrix_exp& m,
        matrix<matrix_exp::type>& u,
        matrix<matrix_exp::type>& w,
        matrix<matrix_exp::type>& v
    );
    /*!
        requires
            - m.nr() >= m.nc()
        ensures
            - computes the singular value decomposition of matrix m
            - m == subm(#u,get_rect(m))*diagm(#w)*trans(#v)
            - trans(#u)*#u == identity matrix
            - trans(#v)*#v == identity matrix
            - #w == the singular values of the matrix m in no 
              particular order.  
            - #u.nr() == m.nr()
            - #u.nc() == m.nr()
            - #w.nr() == m.nc()
            - #w.nc() == 1 
            - #v.nr() == m.nc()
            - #v.nc() == m.nc()
            - if (widthu == false) then
                - ignore the above regarding #u, it isn't computed and its
                  output state is undefined.
            - if (widthv == false) then
                - ignore the above regarding #v, it isn't computed and its
                  output state is undefined.
            - returns an error code of 0, if no errors and 'k' if we fail to
              converge at the 'kth' singular value.
    !*/

// ----------------------------------------------------------------------------------------

    void svd3 (
        const matrix_exp& m,
        matrix<matrix_exp::type>& u,
        matrix<matrix_exp::type>& w,
        matrix<matrix_exp::type>& v
    );
    /*!
        ensures
            - computes the singular value decomposition of m
            - m == #u*diagm(#w)*trans(#v)
            - trans(#u)*#u == identity matrix
            - trans(#v)*#v == identity matrix
            - #w == the singular values of the matrix m in no 
              particular order.  
            - #u.nr() == m.nr()
            - #u.nc() == m.nc()
            - #w.nr() == m.nc()
            - #w.nc() == 1 
            - #v.nr() == m.nc()
            - #v.nc() == m.nc()
    !*/

// ----------------------------------------------------------------------------------------

    const matrix_exp::type det (
        const matrix_exp& m
    );
    /*!
        requires
            - m is a square matrix
        ensures
            - returns the determinant of m
    !*/

// ----------------------------------------------------------------------------------------

    const matrix_exp::matrix_type cholesky_decomposition (
        const matrix_exp& A
    );
    /*!
        requires
            - A is a square matrix
        ensures
            - if (A has a Cholesky Decomposition) then
                - returns the decomposition of A.  That is, returns a matrix L
                  such that L*trans(L) == A.  L will also be lower triangular.
            - else
                - returns a matrix with the same dimensions as A but it 
                  will have a bogus value.  I.e. it won't be a decomposition.
    !*/

// ----------------------------------------------------------------------------------------

    const matrix_exp::matrix_type inv_lower_triangular (
        const matrix_exp& A
    );
    /*!
        requires
            - A is a square matrix
        ensures
            - if (A is lower triangular) then
                - returns the inverse of A. 
            - else
                - returns a matrix with the same dimensions as A but it 
                  will have a bogus value.  I.e. it won't be an inverse.
    !*/

// ----------------------------------------------------------------------------------------

    const matrix_exp::matrix_type inv_upper_triangular (
        const matrix_exp& A
    );
    /*!
        requires
            - A is a square matrix
        ensures
            - if (A is upper triangular) then
                - returns the inverse of A. 
            - else
                - returns a matrix with the same dimensions as A but it 
                  will have a bogus value.  I.e. it won't be an inverse.
    !*/

// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------
//                              Statistics
// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------

    const matrix_exp::type min (
        const matrix_exp& m
    );
    /*!
        requires
            - m.size() > 0
        ensures
            - returns the value of the smallest element of m
    !*/

// ----------------------------------------------------------------------------------------

    const matrix_exp::type max (
        const matrix_exp& m
    );
    /*!
        requires
            - m.size() > 0
        ensures
            - returns the value of the biggest element of m
    !*/

// ----------------------------------------------------------------------------------------

    const matrix_exp::type sum (
        const matrix_exp& m
    );
    /*!
        ensures
            - returns the sum of all elements in m
    !*/

// ----------------------------------------------------------------------------------------

    const matrix_exp::type prod (
        const matrix_exp& m
    );
    /*!
        ensures
            - returns the results of multiplying all elements of m together. 
    !*/

// ----------------------------------------------------------------------------------------

    const matrix_exp::type mean (
        const matrix_exp& m
    );
    /*!
        ensures
            - returns the mean of all elements in m. 
              (i.e. returns sum(m)/(m.nr()*m.nc()))
    !*/

// ----------------------------------------------------------------------------------------

    const matrix_exp::type variance (
        const matrix_exp& m
    );
    /*!
        ensures
            - returns the unbiased sample variance of all elements in m 
              (i.e. 1.0/(m.nr()*m.nc() - 1)*(sum of all pow(m(i,j) - mean(m),2)))
    !*/

// ----------------------------------------------------------------------------------------

    const matrix covariance (
        const matrix_exp& m
    );
    /*!
        requires
            - matrix_exp::type == a dlib::matrix object
            - m.nr() > 1
            - m.nc() == 1 (i.e. m is a column vector)
            - for all valid i, j:
                - m(i).nr() > 0
                - m(i).nc() == 1
                - m(i).nr() == m(j).nr() 
                - i.e. m contains only column vectors and all the column vectors
                  have the same non-zero length
        ensures
            - returns the unbiased sample covariance matrix for the set of samples
              in m.  
              (i.e. 1.0/(m.nr()-1)*(sum of all (m(i) - mean(m))*trans(m(i) - mean(m))))
            - the returned matrix will contain elements of type matrix_exp::type::type.
            - the returned matrix will have m(0).nr() rows and columns.
    !*/

// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------
//                                 Pixel and Image Utilities
// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------

    template <
        typename T,
        typename P
        >
    const matrix_exp pixel_to_vector (
        const P& pixel
    );
    /*!
        requires
            - pixel_traits<P>::has_alpha == false
        ensures
            - returns a matrix M such that:
                - M::type == T
                - M::NC == 1 
                - M::NR == pixel_traits<P>::num
                - if (pixel_traits<P>::grayscale) then
                    - M(0) == pixel 
                - if (pixel_traits<P>::rgb) then
                    - M(0) == pixel.red 
                    - M(1) == pixel.green 
                    - M(2) == pixel.blue 
                - if (pixel_traits<P>::hsi) then
                    - M(0) == pixel.h 
                    - M(1) == pixel.s 
                    - M(2) == pixel.i 
    !*/

// ----------------------------------------------------------------------------------------

    template <
        typename P
        >
    void vector_to_pixel (
        P& pixel,
        const matrix_exp& vector 
    );
    /*!
        requires
            - pixel_traits<P>::has_alpha == false
            - vector::NR == pixel_traits<P>::num
            - vector::NC == 1 
              (i.e. you have to use a statically dimensioned vector)
        ensures
            - if (pixel_traits<P>::grayscale) then
                - pixel == M(0) 
            - if (pixel_traits<P>::rgb) then
                - pixel.red   == M(0)  
                - pixel.green == M(1) 
                - pixel.blue  == M(2)  
            - if (pixel_traits<P>::hsi) then
                - pixel.h == M(0)
                - pixel.s == M(1)
                - pixel.i == M(2)
    !*/

// ----------------------------------------------------------------------------------------

    template <
        long lower,
        long upper 
        >
    const matrix_exp clamp (
        const matrix_exp& m
    );
    /*!
        ensures
            - returns a matrix R such that:
                - R::type == the same type that was in m
                - R has the same dimensions as m
                - for all valid r and c:
                    - if (m(r,c) > upper) then
                        - R(r,c) == upper
                    - else if (m(r,c) < lower) then
                        - R(r,c) == lower
                    - else
                        - R(r,c) == m(r,c)
    !*/

// ----------------------------------------------------------------------------------------

}

#endif // DLIB_MATRIx_UTILITIES_ABSTRACT_








