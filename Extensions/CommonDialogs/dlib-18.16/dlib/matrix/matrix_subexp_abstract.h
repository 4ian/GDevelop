// Copyright (C) 2006  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#undef DLIB_MATRIx_SUBEXP_ABSTRACT_
#ifdef DLIB_MATRIx_SUBEXP_ABSTRACT_

#include "matrix_abstract.h"
#include "../geometry/rectangle.h"

namespace dlib
{

// ----------------------------------------------------------------------------------------

    template <long start, long inc, long end>
    const matrix_exp range (
    );
    /*!
        requires
            - inc > 0
        ensures
            - returns a matrix R such that:
                - R::type == long
                - R.nr() == 1
                - R.nc() == abs(end - start)/inc + 1
                - if (start <= end) then
                    - R(i) == start + i*inc
                - else
                    - R(i) == start - i*inc
    !*/

    template <long start, long end>
    const matrix_exp range (
    ) { return range<start,1,end>(); }

    const matrix_exp range (
        long start,
        long inc,
        long end
    ); 
    /*!
        requires
            - inc > 0
        ensures
            - returns a matrix R such that:
                - R::type == long
                - R.nr() == 1
                - R.nc() == abs(end - start)/inc + 1
                - if (start <= end) then
                    - R(i) == start + i*inc
                - else
                    - R(i) == start - i*inc
    !*/

    const matrix_exp range (
        long start,
        long end
    ) { return range(start,1,end); }

// ----------------------------------------------------------------------------------------

    const matrix_exp subm (
        const matrix_exp& m,
        const matrix_exp& rows,
        const matrix_exp& cols,
    );
    /*!
        requires
            - rows and cols contain integral elements (e.g. int, long)
            - 0 <= min(rows) && max(rows) < m.nr() 
            - 0 <= min(cols) && max(cols) < m.nc()
            - rows.nr() == 1 || rows.nc() == 1
            - cols.nr() == 1 || cols.nc() == 1
              (i.e. rows and cols must be vectors)
        ensures
            - returns a matrix R such that:
                - R::type == the same type that was in m
                - R.nr() == rows.size()
                - R.nc() == cols.size()
                - for all valid r and c:
                  R(r,c) == m(rows(r),cols(c))
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
            - col >= 0
            - nr >= 0
            - nc >= 0
            - row + nr <= m.nr()
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

    template <typename EXP>
    struct rowm_exp
    {
        /*!
            WHAT THIS OBJECT REPRESENTS
                This struct allows you to determine the type of matrix expression 
                object returned from the rowm(m,row) function.  An example makes its
                use clear:

                template <typename EXP>
                void do_something( const matrix_exp<EXP>& mat)
                {
                    // r is a matrix expression that aliases mat.
                    typename rowm_exp<EXP>::type r = rowm(mat,0);

                    // Print the first row of mat.  So we see that by using
                    // rowm_exp we can save the object returned by rowm() in
                    // a local variable.    
                    cout << r << endl;

                    // Note that you can only save the return value of rowm() to
                    // a local variable if the argument to rowm() has a lifetime
                    // beyond the rowm() expression.  The example shown above is
                    // OK but the following would result in undefined behavior:
                    typename rowm_exp<EXP>::type bad = rowm(mat + mat,0);
                }
        !*/
        typedef type_of_expression_returned_by_rowm type;
    };

// ----------------------------------------------------------------------------------------

    const matrix_exp rowm (
        const matrix_exp& m,
        long row,
        long length
    );
    /*!
        requires
            - 0 <= row < m.nr()
            - 0 <= length <= m.nc()
        ensures
            - returns a matrix R such that:
                - R.nr() == 1
                - R.nc() == length
                - for all valid i:
                  R(i) == m(row,i)
    !*/

// ----------------------------------------------------------------------------------------

    const matrix_exp rowm (
        const matrix_exp& m,
        const matrix_exp& rows
    );
    /*!
        requires
            - rows contains integral elements (e.g. int, long)
            - 0 <= min(rows) && max(rows) < m.nr() 
            - rows.nr() == 1 || rows.nc() == 1
              (i.e. rows must be a vector)
        ensures
            - returns a matrix R such that:
                - R::type == the same type that was in m
                - R.nr() == rows.size()
                - R.nc() == m.nc() 
                - for all valid r and c:
                  R(r,c) == m(rows(r),c)
    !*/

// ----------------------------------------------------------------------------------------

    const matrix_exp colm (
        const matrix_exp& m,
        long col 
    );
    /*!
        requires
            - 0 <= col < m.nc()
        ensures
            - returns a matrix R such that:
                - R.nr() == m.nr() 
                - R.nc() == 1
                - for all valid i:
                  R(i) == m(i,col)
    !*/

    template <typename EXP>
    struct colm_exp
    {
        /*!
            WHAT THIS OBJECT REPRESENTS
                This struct allows you to determine the type of matrix expression 
                object returned from the colm(m,col) function.  An example makes its
                use clear:

                template <typename EXP>
                void do_something( const matrix_exp<EXP>& mat)
                {
                    // c is a matrix expression that aliases mat.
                    typename colm_exp<EXP>::type c = colm(mat,0);

                    // Print the first column of mat.  So we see that by using
                    // colm_exp we can save the object returned by colm() in
                    // a local variable.    
                    cout << c << endl;

                    // Note that you can only save the return value of colm() to
                    // a local variable if the argument to colm() has a lifetime
                    // beyond the colm() expression.  The example shown above is
                    // OK but the following would result in undefined behavior:
                    typename colm_exp<EXP>::type bad = colm(mat + mat,0);
                }
        !*/
        typedef type_of_expression_returned_by_colm type;
    };

// ----------------------------------------------------------------------------------------

    const matrix_exp colm (
        const matrix_exp& m,
        long col,
        long length
    );
    /*!
        requires
            - 0 <= col < m.nc()
            - 0 <= length <= m.nr()
        ensures
            - returns a matrix R such that:
                - R.nr() == length 
                - R.nc() == 1
                - for all valid i:
                  R(i) == m(i,col)
    !*/

// ----------------------------------------------------------------------------------------

    const matrix_exp colm (
        const matrix_exp& m,
        const matrix_exp& cols
    );
    /*!
        requires
            - cols contains integral elements (e.g. int, long)
            - 0 <= min(cols) && max(cols) < m.nc() 
            - cols.nr() == 1 || cols.nc() == 1
              (i.e. cols must be a vector)
        ensures
            - returns a matrix R such that:
                - R::type == the same type that was in m
                - R.nr() == m.nr()
                - R.nc() == cols.size()
                - for all valid r and c:
                  R(r,c) == m(r,cols(c))
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
            - col >= 0
            - nr >= 0
            - nc >= 0
            - row + nr <= m.nr()
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

            - In addition to the normal assignment statements using the = symbol, you may
              also use the usual += and -= versions of the assignment operator.  In these
              cases, they have their usual effect.
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

            - In addition to the normal assignment statements using the = symbol, you may
              also use the usual += and -= versions of the assignment operator.  In these
              cases, they have their usual effect.
    !*/

// ----------------------------------------------------------------------------------------

    assignable_matrix_expression set_subm (
        matrix& m,
        const matrix_exp& rows,
        const matrix_exp& cols
    );
    /*!
        requires
            - rows and cols contain integral elements (e.g. int, long)
            - 0 <= min(rows) && max(rows) < m.nr() 
            - 0 <= min(cols) && max(cols) < m.nc()
            - rows.nr() == 1 || rows.nc() == 1
            - cols.nr() == 1 || cols.nc() == 1
              (i.e. rows and cols must be vectors)
        ensures
            - statements of the following form:
                - set_subm(m,rows,cols) = some_matrix;
              result in it being the case that:
                - subm(m,rows,cols) == some_matrix.

            - statements of the following form:
                - set_subm(m,rows,cols) = scalar_value;
              result in it being the case that:
                - subm(m,rows,cols) == uniform_matrix<matrix::type>(nr,nc,scalar_value).

            - In addition to the normal assignment statements using the = symbol, you may
              also use the usual += and -= versions of the assignment operator.  In these
              cases, they have their usual effect.
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

            - In addition to the normal assignment statements using the = symbol, you may
              also use the usual += and -= versions of the assignment operator.  In these
              cases, they have their usual effect.
    !*/

// ----------------------------------------------------------------------------------------

    assignable_matrix_expression set_rowm (
        matrix& m,
        const matrix_exp& rows
    );
    /*!
        requires
            - rows contains integral elements (e.g. int, long)
            - 0 <= min(rows) && max(rows) < m.nr() 
            - rows.nr() == 1 || rows.nc() == 1
              (i.e. rows must be a vector)
        ensures
            - statements of the following form:
                - set_rowm(m,rows) = some_matrix;
              result in it being the case that:
                - rowm(m,rows) == some_matrix.

            - statements of the following form:
                - set_rowm(m,rows) = scalar_value;
              result in it being the case that:
                - rowm(m,rows) == uniform_matrix<matrix::type>(nr,nc,scalar_value).

            - In addition to the normal assignment statements using the = symbol, you may
              also use the usual += and -= versions of the assignment operator.  In these
              cases, they have their usual effect.
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

            - In addition to the normal assignment statements using the = symbol, you may
              also use the usual += and -= versions of the assignment operator.  In these
              cases, they have their usual effect.
    !*/

// ----------------------------------------------------------------------------------------

    assignable_matrix_expression set_colm (
        matrix& m,
        const matrix_exp& cols
    );
    /*!
        requires
            - cols contains integral elements (e.g. int, long)
            - 0 <= min(cols) && max(cols) < m.nc() 
            - cols.nr() == 1 || cols.nc() == 1
              (i.e. cols must be a vector)
        ensures
            - statements of the following form:
                - set_colm(m,cols) = some_matrix;
              result in it being the case that:
                - colm(m,cols) == some_matrix.

            - statements of the following form:
                - set_colm(m,cols) = scalar_value;
              result in it being the case that:
                - colm(m,cols) == uniform_matrix<matrix::type>(nr,nc,scalar_value).

            - In addition to the normal assignment statements using the = symbol, you may
              also use the usual += and -= versions of the assignment operator.  In these
              cases, they have their usual effect.
    !*/

// ----------------------------------------------------------------------------------------

}

#endif // DLIB_MATRIx_SUBEXP_ABSTRACT_

