// Copyright (C) 2006  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#undef DLIB_MATRIx_UTILITIES_ABSTRACT_
#ifdef DLIB_MATRIx_UTILITIES_ABSTRACT_

#include "matrix_abstract.h"
#include <complex>
#include "../pixel.h"
#include "../geometry/rectangle.h"
#inclue <vector>

namespace dlib
{

// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------
//                                   Simple matrix utilities 
// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------

    const matrix_exp diag (
        const matrix_exp& m
    );
    /*!
        ensures
            - returns a column vector R that contains the elements from the diagonal 
              of m in the order R(0)==m(0,0), R(1)==m(1,1), R(2)==m(2,2) and so on.
    !*/

    template <typename EXP>
    struct diag_exp
    {
        /*!
            WHAT THIS OBJECT REPRESENTS
                This struct allows you to determine the type of matrix expression 
                object returned from the diag() function.  An example makes its
                use clear:

                template <typename EXP>
                void do_something( const matrix_exp<EXP>& mat)
                {
                    // d is a matrix expression that aliases mat.
                    typename diag_exp<EXP>::type d = diag(mat);

                    // Print the diagonal of mat.  So we see that by using
                    // diag_exp we can save the object returned by diag() in
                    // a local variable.    
                    cout << d << endl;

                    // Note that you can only save the return value of diag() to
                    // a local variable if the argument to diag() has a lifetime
                    // beyond the diag() expression.  The example shown above is
                    // OK but the following would result in undefined behavior:
                    typename diag_exp<EXP>::type bad = diag(mat + mat);
                }
        !*/
        typedef type_of_expression_returned_by_diag type;
    };

// ----------------------------------------------------------------------------------------

    const matrix_exp diagm (
        const matrix_exp& m
    );
    /*!
        requires
            - is_vector(m) == true
              (i.e. m is a row or column matrix)
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

    const matrix_type::type dot (
        const matrix_exp& m1,
        const matrix_exp& m2
    );
    /*!
        requires
            - is_vector(m1) == true
            - is_vector(m2) == true
            - m1.size() == m2.size()
            - m1.size() > 0
        ensures
            - returns the dot product between m1 and m2. That is, this function 
              computes and returns the sum, for all i, of m1(i)*m2(i).
    !*/

// ----------------------------------------------------------------------------------------

    const matrix_exp lowerm (
        const matrix_exp& m
    );
    /*!
        ensures
            - returns a matrix M such that:
                - M::type == the same type that was in m
                - M has the same dimensions as m
                - M is the lower triangular part of m.  That is:
                    - if (r >= c) then
                        - M(r,c) == m(r,c)
                    - else
                        - M(r,c) == 0
    !*/

// ----------------------------------------------------------------------------------------

    const matrix_exp lowerm (
        const matrix_exp& m,
        const matrix_exp::type scalar_value
    );
    /*!
        ensures
            - returns a matrix M such that:
                - M::type == the same type that was in m
                - M has the same dimensions as m
                - M is the lower triangular part of m except that the diagonal has
                  been set to scalar_value.  That is:
                    - if (r > c) then
                        - M(r,c) == m(r,c)
                    - else if (r == c) then
                        - M(r,c) == scalar_value 
                    - else
                        - M(r,c) == 0
    !*/

// ----------------------------------------------------------------------------------------

    const matrix_exp upperm (
        const matrix_exp& m
    );
    /*!
        ensures
            - returns a matrix M such that:
                - M::type == the same type that was in m
                - M has the same dimensions as m
                - M is the upper triangular part of m.  That is:
                    - if (r <= c) then
                        - M(r,c) == m(r,c)
                    - else
                        - M(r,c) == 0
    !*/

// ----------------------------------------------------------------------------------------

    const matrix_exp upperm (
        const matrix_exp& m,
        const matrix_exp::type scalar_value
    );
    /*!
        ensures
            - returns a matrix M such that:
                - M::type == the same type that was in m
                - M has the same dimensions as m
                - M is the upper triangular part of m except that the diagonal has
                  been set to scalar_value.  That is:
                    - if (r < c) then
                        - M(r,c) == m(r,c)
                    - else if (r == c) then
                        - M(r,c) == scalar_value 
                    - else
                        - M(r,c) == 0
    !*/

// ----------------------------------------------------------------------------------------

    const matrix_exp make_symmetric (
        const matrix_exp& m
    );
    /*!
        requires
            - m.nr() == m.nc()
              (i.e. m must be a square matrix)
        ensures
            - returns a matrix M such that:
                - M::type == the same type that was in m
                - M has the same dimensions as m
                - M is a symmetric matrix, that is, M == trans(M) and
                  it is constructed from the lower triangular part of m.  Specifically,
                  we have:
                    - lowerm(M) == lowerm(m)
                    - upperm(M) == trans(lowerm(m))
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
        typename T,
        long NR, 
        long NC
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
            - nr >= 0 && nc >= 0
        ensures
            - returns an nr by nc matrix with elements of type T and all set to val.
    !*/

// ----------------------------------------------------------------------------------------

    const matrix_exp ones_matrix (
        const matrix_exp& mat
    );
    /*!
        requires
            - mat.nr() >= 0 && mat.nc() >= 0
        ensures
            - Let T denote the type of element in mat. Then this function
              returns uniform_matrix<T>(mat.nr(), mat.nc(), 1)
    !*/

// ----------------------------------------------------------------------------------------

    template <
        typename T
        >
    const matrix_exp ones_matrix (
        long nr,
        long nc
    );
    /*!
        requires
            - nr >= 0 && nc >= 0
        ensures
            - returns uniform_matrix<T>(nr, nc, 1)
    !*/

// ----------------------------------------------------------------------------------------

    const matrix_exp zeros_matrix (
        const matrix_exp& mat
    );
    /*!
        requires
            - mat.nr() >= 0 && mat.nc() >= 0
        ensures
            - Let T denote the type of element in mat. Then this function
              returns uniform_matrix<T>(mat.nr(), mat.nc(), 0)
    !*/

// ----------------------------------------------------------------------------------------

    template <
        typename T
        >
    const matrix_exp zeros_matrix (
        long nr,
        long nc
    );
    /*!
        requires
            - nr >= 0 && nc >= 0
        ensures
            - returns uniform_matrix<T>(nr, nc, 0)
    !*/

// ----------------------------------------------------------------------------------------

    const matrix_exp identity_matrix (
        const matrix_exp& mat
    );
    /*!
        requires
            - mat.nr() == mat.nc()
        ensures
            - returns an identity matrix with the same dimensions as mat and
              containing the same type of elements as mat.
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

    const matrix_exp linspace (
        double start,
        double end,
        long num
    );
    /*!
        requires
            - num >= 0
        ensures
            - returns a matrix M such that:
                - M::type == double 
                - is_row_vector(M) == true
                - M.size() == num
                - M == a row vector with num linearly spaced values beginning with start
                  and stopping with end.  
                - M(num-1) == end 
                - if (num > 1) then
                    - M(0) == start
    !*/

// ----------------------------------------------------------------------------------------

    const matrix_exp logspace (
        double start,
        double end,
        long num
    );
    /*!
        requires
            - num >= 0
        ensures
            - returns a matrix M such that:
                - M::type == double 
                - is_row_vector(M) == true
                - M.size() == num
                - M == a row vector with num logarithmically spaced values beginning with 
                  10^start and stopping with 10^end.  
                  (i.e. M == pow(10, linspace(start, end, num)))
                - M(num-1) == 10^end
    !*/

// ----------------------------------------------------------------------------------------

    const matrix_exp linpiece (
        const double val,
        const matrix_exp& joints
    );
    /*!
        requires
            - is_vector(joints) == true
            - joints.size() >= 2
            - for all valid i < j:
                - joints(i) < joints(j)
        ensures
            - linpiece() is useful for creating piecewise linear functions of val.  For
              example, if w is a parameter vector then you can represent a piecewise linear
              function of val as: f(val) = dot(w, linpiece(val, linspace(0,100,5))).  In
              this case, f(val) is piecewise linear on the intervals [0,25], [25,50],
              [50,75], [75,100].  Moreover, w(i) defines the derivative of f(val) in the
              i-th interval.  Finally, outside the interval [0,100] f(val) has a derivative
              of zero and f(0) == 0.
            - To be precise, this function returns a column vector L such that:
                - L.size() == joints.size()-1
                - is_col_vector(L) == true
                - L contains the same type of elements as joints.
                - for all valid i:
                - if (joints(i) < val)
                    - L(i) == min(val,joints(i+1)) - joints(i)
                - else
                    - L(i) == 0
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
        ensures
            - returns a matrix R such that:
                - R::type == the same type that was in m
                - R has the same dimensions as m
                - for all valid r and c:
                  R( (r+R)%m.nr() , (c+C)%m.nc() ) == m(r,c)
    !*/

// ----------------------------------------------------------------------------------------

    const matrix_exp fliplr (
        const matrix_exp& m
    );
    /*!
        ensures
            - flips the matrix m from left to right and returns the result.  
              I.e. reverses the order of the columns.
            - returns a matrix M such that:
                - M::type == the same type that was in m
                - M has the same dimensions as m
                - for all valid r and c:
                  M(r,c) == m(r, m.nc()-c-1)
    !*/

// ----------------------------------------------------------------------------------------

    const matrix_exp flipud (
        const matrix_exp& m
    );
    /*!
        ensures
            - flips the matrix m from up to down and returns the result.  
              I.e. reverses the order of the rows.
            - returns a matrix M such that:
                - M::type == the same type that was in m
                - M has the same dimensions as m
                - for all valid r and c:
                  M(r,c) == m(m.nr()-r-1, c)
    !*/

// ----------------------------------------------------------------------------------------

    const matrix_exp flip (
        const matrix_exp& m
    );
    /*!
        ensures
            - flips the matrix m from up to down and left to right and returns the 
              result.  I.e. returns flipud(fliplr(m)).
            - returns a matrix M such that:
                - M::type == the same type that was in m
                - M has the same dimensions as m
                - for all valid r and c:
                  M(r,c) == m(m.nr()-r-1, m.nc()-c-1)
    !*/

// ----------------------------------------------------------------------------------------

    const matrix_exp reshape (
        const matrix_exp& m,
        long rows,
        long cols
    );
    /*!
        requires
            - m.size() == rows*cols
            - rows > 0
            - cols > 0
        ensures
            - returns a matrix M such that: 
                - M.nr() == rows
                - M.nc() == cols
                - M.size() == m.size()
                - for all valid r and c:
                    - let IDX = r*cols + c
                    - M(r,c) == m(IDX/m.nc(), IDX%m.nc())

            - i.e. The matrix m is reshaped into a new matrix of rows by cols
              dimension.  Additionally, the elements of m are laid into M in row major 
              order.
    !*/

// ----------------------------------------------------------------------------------------

    const matrix_exp reshape_to_column_vector (
        const matrix_exp& m
    );
    /*!
        ensures
            - returns a matrix M such that: 
                - is_col_vector(M) == true
                - M.size() == m.size()
                - for all valid r and c:
                    - m(r,c) == M(r*m.nc() + c)

            - i.e. The matrix m is reshaped into a column vector.  Note that
              the elements are pulled out in row major order.
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
            - m.nr() > R >= 0
            - m.nc() > C >= 0
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
            - m.nr() > R >= 0
            - m.nc() > C >= 0
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
            - m.nr() > R >= 0
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
            - m.nr() > R >= 0
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
            - m.nc() > C >= 0
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
            - m.nc() > C >= 0
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
        typename U,
        typename L
        >
    void set_all_elements (
        matrix<T,NR,NC,MM,L>& m,
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
              (This allows you to easily force a matrix_exp to fully evaluate)
    !*/

// ----------------------------------------------------------------------------------------

    template <
        typename T, 
        long NR, 
        long NC, 
        typename MM, 
        typename L
        >
    uint32 hash (
        const matrix<T,NR,NC,MM,L>& item,
        uint32 seed = 0
    );
    /*!
        requires
            - T is a standard layout type (e.g. a POD type like int, float, 
              or a simple struct).
        ensures
            - returns a 32bit hash of the data stored in item.  
            - Each value of seed results in a different hash function being used.  
              (e.g. hash(item,0) should generally not be equal to hash(item,1))
            - uses the murmur_hash3() routine to compute the actual hash.
            - Note that if the memory layout of the elements in item change between
              hardware platforms then hash() will give different outputs.  If you want
              hash() to always give the same output for the same input then you must 
              ensure that elements of item always have the same layout in memory.
              Typically this means using fixed width types and performing byte swapping
              to account for endianness before passing item to hash().
    !*/

// ----------------------------------------------------------------------------------------

    // if matrix_exp contains non-complex types (e.g. float, double)
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

    // if matrix_exp contains std::complex types 
    bool equal (
        const matrix_exp& a,
        const matrix_exp& b,
        const matrix_exp::type::value_type epsilon = 100*std::numeric_limits<matrix_exp::type::value_type>::epsilon()
    );
    /*!
        ensures
            - if (a and b don't have the same dimensions) then
                - returns false
            - else if (there exists an r and c such that abs(real(a(r,c)-b(r,c))) > epsilon 
              or abs(imag(a(r,c)-b(r,c))) > epsilon) then
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
            - a and b both contain the same type of element (one or both
              can also be of type std::complex so long as the underlying type
              in them is the same)
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

    const matrix_exp join_rows (
        const matrix_exp& a,
        const matrix_exp& b 
    );
    /*!
        requires
            - a.nr() == b.nr() || a.size() == 0 || b.size() == 0
            - a and b both contain the same type of element
        ensures
            - This function joins two matrices together by concatenating their rows.
            - returns a matrix R such that:
                - R::type == the same type that was in a and b.
                - R.nr() == a.nr() == b.nr()
                - R.nc() == a.nc() + b.nc()
                - for all valid r and c:
                    - if (c < a.nc()) then
                        - R(r,c) == a(r,c) 
                    - else
                        - R(r,c) == b(r, c-a.nc()) 
    !*/

// ----------------------------------------------------------------------------------------

    const matrix_exp join_cols (
        const matrix_exp& a,
        const matrix_exp& b 
    );
    /*!
        requires
            - a.nc() == b.nc() || a.size() == 0 || b.size() == 0
            - a and b both contain the same type of element
        ensures
            - This function joins two matrices together by concatenating their columns.
            - returns a matrix R such that:
                - R::type == the same type that was in a and b.
                - R.nr() == a.nr() + b.nr()
                - R.nc() == a.nc() == b.nc()
                - for all valid r and c:
                    - if (r < a.nr()) then
                        - R(r,c) == a(r,c) 
                    - else
                        - R(r,c) == b(r-a.nr(), c) 
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
                - R.nr() == a.nr() * b.nr()  
                - R.nc() == a.nc() * b.nc()  
                - for all valid r and c:
                  R(r,c) == a(r/b.nr(), c/b.nc()) * b(r%b.nr(), c%b.nc())
                - I.e. R is the tensor product of matrix a with matrix b
    !*/

// ----------------------------------------------------------------------------------------

    const matrix_exp cartesian_product (
        const matrix_exp& A,
        const matrix_exp& B 
    );
    /*!
        requires
            - A and B both contain the same type of element
        ensures
            - Think of A and B as sets of column vectors.  Then this function 
              returns a matrix that contains a set of column vectors that is
              the Cartesian product of the sets A and B.  That is, the resulting
              matrix contains every possible combination of vectors from both A and
              B.
            - returns a matrix R such that:
                - R::type == the same type that was in A and B.
                - R.nr() == A.nr() + B.nr()  
                - R.nc() == A.nc() * B.nc()  
                - Each column of R is the concatenation of a column vector
                  from A with a column vector from B.  
                - for all valid r and c:
                    - if (r < A.nr()) then
                        - R(r,c) == A(r, c/B.nc())
                    - else
                        - R(r,c) == B(r-A.nr(), c%B.nc())
    !*/

// ----------------------------------------------------------------------------------------

    const matrix_exp scale_columns (
        const matrix_exp& m,
        const matrix_exp& v
    );
    /*!
        requires
            - is_vector(v) == true
            - v.size() == m.nc()
            - m and v both contain the same type of element
        ensures
            - returns a matrix R such that:
                - R::type == the same type that was in m and v.
                - R has the same dimensions as m. 
                - for all valid r and c:
                  R(r,c) == m(r,c) * v(c)
                - i.e. R is the result of multiplying each of m's columns by
                  the corresponding scalar in v.

            - Note that this function is identical to the expression m*diagm(v).  
              That is, the * operator is overloaded for this case and will invoke
              scale_columns() automatically as appropriate.
    !*/

// ----------------------------------------------------------------------------------------

    const matrix_exp scale_rows (
        const matrix_exp& m,
        const matrix_exp& v
    );
    /*!
        requires
            - is_vector(v) == true
            - v.size() == m.nr()
            - m and v both contain the same type of element
        ensures
            - returns a matrix R such that:
                - R::type == the same type that was in m and v.
                - R has the same dimensions as m. 
                - for all valid r and c:
                  R(r,c) == m(r,c) * v(r)
                - i.e. R is the result of multiplying each of m's rows by
                  the corresponding scalar in v.

            - Note that this function is identical to the expression diagm(v)*m.  
              That is, the * operator is overloaded for this case and will invoke
              scale_rows() automatically as appropriate.
    !*/

// ----------------------------------------------------------------------------------------

    template <typename T>
    void sort_columns (
        matrix<T>& m,
        matrix<T>& v
    );
    /*!
        requires
            - is_col_vector(v) == true
            - v.size() == m.nc()
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
            - is_col_vector(v) == true
            - v.size() == m.nc()
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
            - is_vector(m) == true
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
            - is_vector(m) == true
        ensures
            - returns sqrt(sum(squared(m)))
              (i.e. returns the length of the vector m)
            - if (m contains integer valued elements) then  
                - The return type is a double that represents the length.  Therefore, the
                  return value of length() is always represented using a floating point
                  type. 
    !*/

// ----------------------------------------------------------------------------------------

    bool is_row_vector (
        const matrix_exp& m
    );
    /*!
        ensures
            - if (m.nr() == 1) then
                - return true
            - else
                - returns false
    !*/

    bool is_col_vector (
        const matrix_exp& m
    );
    /*!
        ensures
            - if (m.nc() == 1) then
                - return true
            - else
                - returns false
    !*/

    bool is_vector (
        const matrix_exp& m
    );
    /*!
        ensures
            - if (is_row_vector(m) || is_col_vector(m)) then
                - return true
            - else
                - returns false
    !*/

// ----------------------------------------------------------------------------------------

    bool is_finite (
        const matrix_exp& m
    );
    /*!
        ensures
            - returns true if all the values in m are finite values and also not any kind
              of NaN value.
    !*/

// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------
//                      Thresholding relational operators 
// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------

    template <typename S>
    const matrix_exp operator< (
        const matrix_exp& m,
        const S& s
    );
    /*!
        requires
            - is_built_in_scalar_type<S>::value == true 
            - is_built_in_scalar_type<matrix_exp::type>::value == true
        ensures
            - returns a matrix R such that:
                - R::type == the same type that was in m.
                - R has the same dimensions as m. 
                - for all valid r and c:
                    - if (m(r,c) < s) then
                        - R(r,c) == 1
                    - else
                        - R(r,c) == 0
                - i.e. R is a binary matrix of all 1s or 0s.
    !*/

// ----------------------------------------------------------------------------------------

    template <typename S>
    const matrix_exp operator< (
        const S& s,
        const matrix_exp& m
    );
    /*!
        requires
            - is_built_in_scalar_type<S>::value == true 
            - is_built_in_scalar_type<matrix_exp::type>::value == true
        ensures
            - returns a matrix R such that:
                - R::type == the same type that was in m.
                - R has the same dimensions as m. 
                - for all valid r and c:
                    - if (s < m(r,c)) then
                        - R(r,c) == 1
                    - else
                        - R(r,c) == 0
                - i.e. R is a binary matrix of all 1s or 0s.
    !*/

// ----------------------------------------------------------------------------------------

    template <typename S>
    const matrix_exp operator<= (
        const matrix_exp& m,
        const S& s
    );
    /*!
        requires
            - is_built_in_scalar_type<S>::value == true 
            - is_built_in_scalar_type<matrix_exp::type>::value == true
        ensures
            - returns a matrix R such that:
                - R::type == the same type that was in m.
                - R has the same dimensions as m. 
                - for all valid r and c:
                    - if (m(r,c) <= s) then
                        - R(r,c) == 1
                    - else
                        - R(r,c) == 0
                - i.e. R is a binary matrix of all 1s or 0s.
    !*/

// ----------------------------------------------------------------------------------------

    template <typename S>
    const matrix_exp operator<= (
        const S& s,
        const matrix_exp& m
    );
    /*!
        requires
            - is_built_in_scalar_type<S>::value == true 
            - is_built_in_scalar_type<matrix_exp::type>::value == true
        ensures
            - returns a matrix R such that:
                - R::type == the same type that was in m.
                - R has the same dimensions as m. 
                - for all valid r and c:
                    - if (s <= m(r,c)) then
                        - R(r,c) == 1
                    - else
                        - R(r,c) == 0
                - i.e. R is a binary matrix of all 1s or 0s.
    !*/

// ----------------------------------------------------------------------------------------

    template <typename S>
    const matrix_exp operator> (
        const matrix_exp& m,
        const S& s
    );
    /*!
        requires
            - is_built_in_scalar_type<S>::value == true 
            - is_built_in_scalar_type<matrix_exp::type>::value == true
        ensures
            - returns a matrix R such that:
                - R::type == the same type that was in m.
                - R has the same dimensions as m. 
                - for all valid r and c:
                    - if (m(r,c) > s) then
                        - R(r,c) == 1
                    - else
                        - R(r,c) == 0
                - i.e. R is a binary matrix of all 1s or 0s.
    !*/

// ----------------------------------------------------------------------------------------

    template <typename S>
    const matrix_exp operator> (
        const S& s,
        const matrix_exp& m
    );
    /*!
        requires
            - is_built_in_scalar_type<S>::value == true 
            - is_built_in_scalar_type<matrix_exp::type>::value == true
        ensures
            - returns a matrix R such that:
                - R::type == the same type that was in m.
                - R has the same dimensions as m. 
                - for all valid r and c:
                    - if (s > m(r,c)) then
                        - R(r,c) == 1
                    - else
                        - R(r,c) == 0
                - i.e. R is a binary matrix of all 1s or 0s.
    !*/

// ----------------------------------------------------------------------------------------

    template <typename S>
    const matrix_exp operator>= (
        const matrix_exp& m,
        const S& s
    );
    /*!
        requires
            - is_built_in_scalar_type<S>::value == true 
            - is_built_in_scalar_type<matrix_exp::type>::value == true
        ensures
            - returns a matrix R such that:
                - R::type == the same type that was in m.
                - R has the same dimensions as m. 
                - for all valid r and c:
                    - if (m(r,c) >= s) then
                        - R(r,c) == 1
                    - else
                        - R(r,c) == 0
                - i.e. R is a binary matrix of all 1s or 0s.
    !*/

// ----------------------------------------------------------------------------------------

    template <typename S>
    const matrix_exp operator>= (
        const S& s,
        const matrix_exp& m
    );
    /*!
        requires
            - is_built_in_scalar_type<S>::value == true 
            - is_built_in_scalar_type<matrix_exp::type>::value == true
        ensures
            - returns a matrix R such that:
                - R::type == the same type that was in m.
                - R has the same dimensions as m. 
                - for all valid r and c:
                    - if (s >= m(r,c)) then
                        - R(r,c) == 1
                    - else
                        - R(r,c) == 0
                - i.e. R is a binary matrix of all 1s or 0s.
    !*/

// ----------------------------------------------------------------------------------------

    template <typename S>
    const matrix_exp operator== (
        const matrix_exp& m,
        const S& s
    );
    /*!
        requires
            - is_built_in_scalar_type<S>::value == true 
            - is_built_in_scalar_type<matrix_exp::type>::value == true
        ensures
            - returns a matrix R such that:
                - R::type == the same type that was in m.
                - R has the same dimensions as m. 
                - for all valid r and c:
                    - if (m(r,c) == s) then
                        - R(r,c) == 1
                    - else
                        - R(r,c) == 0
                - i.e. R is a binary matrix of all 1s or 0s.
    !*/

// ----------------------------------------------------------------------------------------

    template <typename S>
    const matrix_exp operator== (
        const S& s,
        const matrix_exp& m
    );
    /*!
        requires
            - is_built_in_scalar_type<S>::value == true 
            - is_built_in_scalar_type<matrix_exp::type>::value == true
        ensures
            - returns a matrix R such that:
                - R::type == the same type that was in m.
                - R has the same dimensions as m. 
                - for all valid r and c:
                    - if (s == m(r,c)) then
                        - R(r,c) == 1
                    - else
                        - R(r,c) == 0
                - i.e. R is a binary matrix of all 1s or 0s.
    !*/

// ----------------------------------------------------------------------------------------

    template <typename S>
    const matrix_exp operator!= (
        const matrix_exp& m,
        const S& s
    );
    /*!
        requires
            - is_built_in_scalar_type<S>::value == true 
            - is_built_in_scalar_type<matrix_exp::type>::value == true
        ensures
            - returns a matrix R such that:
                - R::type == the same type that was in m.
                - R has the same dimensions as m. 
                - for all valid r and c:
                    - if (m(r,c) != s) then
                        - R(r,c) == 1
                    - else
                        - R(r,c) == 0
                - i.e. R is a binary matrix of all 1s or 0s.
    !*/

// ----------------------------------------------------------------------------------------

    template <typename S>
    const matrix_exp operator!= (
        const S& s,
        const matrix_exp& m
    );
    /*!
        requires
            - is_built_in_scalar_type<S>::value == true 
            - is_built_in_scalar_type<matrix_exp::type>::value == true
        ensures
            - returns a matrix R such that:
                - R::type == the same type that was in m.
                - R has the same dimensions as m. 
                - for all valid r and c:
                    - if (s != m(r,c)) then
                        - R(r,c) == 1
                    - else
                        - R(r,c) == 0
                - i.e. R is a binary matrix of all 1s or 0s.
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
            - returns the value of the smallest element of m.  If m contains complex
              elements then the element returned is the one with the smallest norm
              according to std::norm().
    !*/

// ----------------------------------------------------------------------------------------

    const matrix_exp::type max (
        const matrix_exp& m
    );
    /*!
        requires
            - m.size() > 0
        ensures
            - returns the value of the biggest element of m.  If m contains complex
              elements then the element returned is the one with the largest norm
              according to std::norm().
    !*/

// ----------------------------------------------------------------------------------------

    void find_min_and_max (
        const matrix_exp& m,
        matrix_exp::type& min_val,
        matrix_exp::type& max_val
    );
    /*!
        requires
            - m.size() > 0
        ensures
            - #min_val == min(m)
            - #max_val == max(m)
            - This function computes both the min and max in just one pass
              over the elements of the matrix m.
    !*/

// ----------------------------------------------------------------------------------------

    long index_of_max (
        const matrix_exp& m
    );
    /*!
        requires
            - is_vector(m) == true
            - m.size() > 0 
        ensures
            - returns the index of the largest element in m.  
              (i.e. m(index_of_max(m)) == max(m))
    !*/

// ----------------------------------------------------------------------------------------

    long index_of_min (
        const matrix_exp& m
    );
    /*!
        requires
            - is_vector(m) == true
            - m.size() > 0 
        ensures
            - returns the index of the smallest element in m.  
              (i.e. m(index_of_min(m)) == min(m))
    !*/

// ----------------------------------------------------------------------------------------

    point max_point (
        const matrix_exp& m
    );
    /*!
        requires
            - m.size() > 0
        ensures
            - returns the location of the maximum element of the array, that is, if the
              returned point is P then it will be the case that: m(P.y(),P.x()) == max(m).
    !*/

// ----------------------------------------------------------------------------------------

    dlib::vector<double,2> max_point_interpolated (
        const matrix_exp& m
    );
    /*!
        requires
            - m.size() > 0
        ensures
            - Like max_point(), this function finds the location in m with the largest
              value.  However, we additionally use some quadratic interpolation to find the
              location of the maximum point with sub-pixel accuracy.  Therefore, the
              returned point is equal to max_point(m) + some small sub-pixel delta.
    !*/

// ----------------------------------------------------------------------------------------

    point min_point (
        const matrix_exp& m
    );
    /*!
        requires
            - m.size() > 0
        ensures
            - returns the location of the minimum element of the array, that is, if the
              returned point is P then it will be the case that: m(P.y(),P.x()) == min(m).
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

    const matrix_exp sum_rows (
        const matrix_exp& m
    );
    /*!
        requires
            - m.size() > 0
        ensures
            - returns a row matrix that contains the sum of all the rows in m. 
            - returns a matrix M such that
                - M::type == the same type that was in m
                - M.nr() == 1
                - M.nc() == m.nc()
                - for all valid i:
                    - M(i) == sum(colm(m,i)) 
    !*/

// ----------------------------------------------------------------------------------------

    const matrix_exp sum_cols (
        const matrix_exp& m
    );
    /*!
        requires
            - m.size() > 0
        ensures
            - returns a column matrix that contains the sum of all the columns in m. 
            - returns a matrix M such that
                - M::type == the same type that was in m
                - M.nr() == m.nr() 
                - M.nc() == 1
                - for all valid i:
                    - M(i) == sum(rowm(m,i)) 
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

    const matrix_exp::type stddev (
        const matrix_exp& m
    );
    /*!
        ensures
            - returns sqrt(variance(m))
    !*/

// ----------------------------------------------------------------------------------------

    const matrix covariance (
        const matrix_exp& m
    );
    /*!
        requires
            - matrix_exp::type == a dlib::matrix object
            - is_col_vector(m) == true
            - m.size() > 1
            - for all valid i, j:
                - is_col_vector(m(i)) == true 
                - m(i).size() > 0
                - m(i).size() == m(j).size() 
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

    template <typename rand_gen>
    const matrix<double> randm( 
        long nr,
        long nc,
        rand_gen& rnd
    );
    /*!
        requires
            - nr >= 0
            - nc >= 0
            - rand_gen == an object that implements the rand/rand_float_abstract.h interface
        ensures
            - generates a random matrix using the given rnd random number generator
            - returns a matrix M such that
                - M::type == double
                - M.nr() == nr
                - M.nc() == nc
                - for all valid i, j:
                    - M(i,j) == a random number such that 0 <= M(i,j) < 1
    !*/

// ----------------------------------------------------------------------------------------

    inline const matrix<double> randm( 
        long nr,
        long nc
    );
    /*!
        requires
            - nr >= 0
            - nc >= 0
        ensures
            - generates a random matrix using std::rand() 
            - returns a matrix M such that
                - M::type == double
                - M.nr() == nr
                - M.nc() == nc
                - for all valid i, j:
                    - M(i,j) == a random number such that 0 <= M(i,j) < 1
    !*/

// ----------------------------------------------------------------------------------------

    inline const matrix_exp gaussian_randm (
        long nr,
        long nc,
        unsigned long seed = 0
    );
    /*!
        requires
            - nr >= 0
            - nc >= 0
        ensures
            - returns a matrix with its values filled with 0 mean unit variance Gaussian
              random numbers.  
            - Each setting of the seed results in a different random matrix.
            - The returned matrix is lazily evaluated using the expression templates
              technique.  This means that the returned matrix doesn't take up any memory
              and is only an expression template.  The values themselves are computed on
              demand using the gaussian_random_hash() routine.  
            - returns a matrix M such that
                - M::type == double
                - M.nr() == nr
                - M.nc() == nc
                - for all valid i, j:
                    - M(i,j) == gaussian_random_hash(i,j,seed) 
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
            - pixel_traits<P> must be defined
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

    const matrix_exp clamp (
        const matrix_exp& m,
        const matrix_exp::type& lower,
        const matrix_exp::type& upper
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

    const matrix_exp clamp (
        const matrix_exp& m,
        const matrix_exp& lower,
        const matrix_exp& upper
    );
    /*!
        requires
            - m.nr() == lower.nr()
            - m.nc() == lower.nc()
            - m.nr() == upper.nr()
            - m.nc() == upper.nc()
            - m, lower, and upper all contain the same type of elements. 
        ensures
            - returns a matrix R such that:
                - R::type == the same type that was in m
                - R has the same dimensions as m
                - for all valid r and c:
                    - if (m(r,c) > upper(r,c)) then
                        - R(r,c) == upper(r,c)
                    - else if (m(r,c) < lower(r,c)) then
                        - R(r,c) == lower(r,c)
                    - else
                        - R(r,c) == m(r,c)
    !*/

// ----------------------------------------------------------------------------------------

    const matrix_exp lowerbound (
        const matrix_exp& m,
        const matrix_exp::type& thresh 
    );
    /*!
        ensures
            - returns a matrix R such that:
                - R::type == the same type that was in m
                - R has the same dimensions as m
                - for all valid r and c:
                    - if (m(r,c) >= thresh) then
                        - R(r,c) == m(r,c)
                    - else
                        - R(r,c) == thresh
    !*/

// ----------------------------------------------------------------------------------------

    const matrix_exp upperbound (
        const matrix_exp& m,
        const matrix_exp::type& thresh 
    );
    /*!
        ensures
            - returns a matrix R such that:
                - R::type == the same type that was in m
                - R has the same dimensions as m
                - for all valid r and c:
                    - if (m(r,c) <= thresh) then
                        - R(r,c) == m(r,c)
                    - else
                        - R(r,c) == thresh
    !*/

// ----------------------------------------------------------------------------------------

}

#endif // DLIB_MATRIx_UTILITIES_ABSTRACT_

