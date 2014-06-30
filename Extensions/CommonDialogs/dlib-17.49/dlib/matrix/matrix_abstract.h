// Copyright (C) 2006  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#undef DLIB_MATRIx_ABSTRACT_
#ifdef DLIB_MATRIx_ABSTRACT_

#include "matrix_exp_abstract.h"
#include "../serialize.h"
#include "../algs.h"
#include "matrix_data_layout_abstract.h"

namespace dlib
{

// ----------------------------------------------------------------------------------------

    /*
        Note that these operator prototypes are not correct C++ (the real versions, which 
        you can see in the implementation are really complex and so probably would 
        distract/confuse people if shown here).  Think of this as just a list of the 
        operators available to you and what they do.
    */

    const matrix_exp operator* (
        const matrix_exp& m1,
        const matrix_exp& m2
    );
    /*!
        requires
            - m1.nc() == m2.nr()
            - m1.size() > 0 && m2.size() > 0
              (you can't multiply any sort of empty matrices together)
            - m1 and m2 both contain elements of the same type
        ensures
            - returns the result of doing the matrix multiplication m1*m2.  The resulting
              matrix will have m1.nr() rows and m2.nc() columns.
    !*/

    const matrix_exp operator+ (
        const matrix_exp& m1,
        const matrix_exp& m2
    );
    /*!
        requires
            - m1.nr() == m2.nr()
            - m1.nc() == m2.nc()
            - m1 and m2 both contain elements of the same type
        ensures
            - returns a matrix R such that for all valid r and c:
              R(r,c) == m1(r,c) + m2(r,c)
              (i.e. returns the result of doing a pairwise addition of the matrices m1 and m2.)
              The resulting matrix will have the same dimensions as the originals.
    !*/

    const matrix_exp operator- (
        const matrix_exp& m1,
        const matrix_exp& m2
    );
    /*!
        requires
            - m1.nr() == m2.nr()
            - m1.nc() == m2.nc()
            - m1 and m2 both contain elements of the same type
        ensures
            - returns a matrix R such that for all valid r and c:
              R(r,c) == m1(r,c) - m2(r,c)
              (i.e. returns the result of doing a pairwise subtraction of the matrices m1 and m2.)
              The resulting matrix will have the same dimensions as the originals.
    !*/

    template <typename T>
    const matrix_exp operator* (
        const matrix_exp& m,
        const T& value
    );
    /*!
        ensures
            - returns the result of multiplying all the elements of matrix m by the given 
              scalar value.  The resulting matrix will have the same dimensions as m.
    !*/

    template <typename T>
    const matrix_exp operator* (
        const T& value,
        const matrix_exp& m
    );
    /*!
        ensures
            - returns the result of multiplying all the elements of matrix m by the given 
              scalar value.  The resulting matrix will have the same dimensions as m.
    !*/

    const matrix_exp operator- (
        const matrix_exp& m
    );
    /*!
        ensures
            - returns -1*m
    !*/

    template <typename T>
    const matrix_exp operator/ (
        const matrix_exp& m,
        const T& value
    );
    /*!
        ensures
            - returns the result of dividing all the elements of matrix m by the given 
              scalar value.  The resulting matrix will have the same dimensions as m.
    !*/

    template <typename T>
    const matrix_exp operator/ (
        const T& value,
        const matrix_exp& m
    );
    /*!
        ensures
            - returns the result of dividing the given scalar value by all the elements 
              of matrix m.  The resulting matrix will have the same dimensions as m.
    !*/

    template <typename T>
    const matrix_exp operator+ (
        const matrix_exp& m,
        const T& value
    );
    /*!
        ensures
            - returns the result of adding value to all the elements of matrix m.  
              The resulting matrix will have the same dimensions as m.
    !*/

    template <typename T>
    const matrix_exp operator+ (
        const T& value,
        const matrix_exp& m
    );
    /*!
        ensures
            - returns the result of adding value to all the elements of matrix m.  
              The resulting matrix will have the same dimensions as m.
    !*/

    template <typename T>
    const matrix_exp operator- (
        const matrix_exp& m,
        const T& value
    );
    /*!
        ensures
            - returns the result of subtracting value from all the elements of matrix m.  
              The resulting matrix will have the same dimensions as m.
    !*/

    template <typename T>
    const matrix_exp operator- (
        const T& value,
        const matrix_exp& m
    );
    /*!
        ensures
            - Returns a matrix M such that:
                - M has the same dimensions as m
                - M contains the same type of element as m
                - for all valid r and c:
                    - M(r,c) == value - m(r,c)
    !*/

    bool operator== (
        const matrix_exp& m1,
        const matrix_exp& m2
    );
    /*!
        ensures
            - if (m1.nr() == m2.nr() && m1.nc() == m2.nc() &&
              for all valid r and c:  m1(r,c) == m2(r,c) ) then
                - returns true
            - else
                - returns false
    !*/

    bool operator!= (
        const matrix_exp& m1,
        const matrix_exp& m2
    );
    /*!
        ensures
            - returns !(m1 == m2)
    !*/

// ----------------------------------------------------------------------------------------

    template <
        typename T,
        long num_rows = 0,
        long num_cols = 0,
        typename mem_manager = default_memory_manager,
        typename layout = row_major_layout 
        >
    class matrix : public matrix_exp<matrix<T,num_rows,num_cols,mem_manager,layout> > 
    {
        /*!
            REQUIREMENTS ON num_rows and num_cols
                both must be bigger than or equal to 0

            REQUIREMENTS ON mem_manager
                must be an implementation of memory_manager/memory_manager_kernel_abstract.h or
                must be an implementation of memory_manager_global/memory_manager_global_kernel_abstract.h or
                must be an implementation of memory_manager_stateless/memory_manager_stateless_kernel_abstract.h 
                mem_manager::type can be set to anything.

            REQUIREMENTS ON layout
                Must be either row_major_layout or column_major_layout

            INITIAL VALUE
                - if (num_rows > 0) then
                    - nr() == num_rows
                - else
                    - nr() == 0

                - if (num_cols > 0) then
                    - nc() == num_cols
                - else
                    - nc() == 0

            WHAT THIS OBJECT REPRESENTS
                This object represents a matrix of nr() rows and nc() columns.  This object
                is also a matrix_exp.  Thus it can be used in all of the above
                global operators.

                The number of rows and columns of this object are determined by the template
                arguments num_rows and num_cols.  If num_rows or num_cols are 0 then
                the matrix starts out empty (i.e. nr() == 0 and nc() == 0) and you may change
                its size via the set_size() member function. 
                
                Setting num_rows or num_cols to something other than 0 causes that dimension
                to have a fixed size.  Setting a fixed size at compile time is useful because 
                any errors related to operating on matrices with incompatible dimensions will 
                be detected at compile time.  It also allows the compiler to perform loop 
                unrolling which can result in substantially faster code.

                Also note that the elements of this matrix are laid out in memory by the layout 
                object supplied as a template argument to this class.  The row_major_layout  
                sets elements down contiguously in memory and in row major order.  Additionally, 
                all memory allocations are performed using the memory manager object supplied as 
                a template argument to this class.
        !*/

    public:
        typedef T type;
        typedef mem_manager mem_manager_type;
        typedef layout layout_type;
        const static long NR = num_rows;
        const static long NC = num_cols;
        const static long cost = 1;

        matrix (
        );
        /*!
            ensures
                - #*this is properly initialized
                - #aliases(*this) == true
                - #ref().aliases(*this) == true
        !*/

        explicit matrix (
            long length 
        );
        /*!
            requires
                - NR == 1 || NC == 1 (i.e. this must be a column or row vector)
                - length >= 0 
                - if (NR == 1 && NC > 0) then
                    - length == NC
                - if (NC == 1 && NR > 0) then
                    - length == NR
            ensures
                - #*this is properly initialized
                - #aliases(*this) == true
                - #ref().aliases(*this) == true
                - if (NR == 1) then
                    - #nr() == 1
                    - #nc() == length
                - else
                    - #nr() == length
                    - #nc() == 1
        !*/

        matrix (
            long rows,
            long cols
        );
        /*!
            requires
                - rows == NR || NR == 0
                - cols == NC || NC == 0
                - rows >= 0 && cols >= 0
            ensures
                - #*this is properly initialized
                - #aliases(*this) == true
                - #ref().aliases(*this) == true
                - #nr() == rows
                - #nc() == cols
        !*/

        template <typename EXP>
        matrix (
            const matrix_exp<EXP>& m
        );
        /*!
            requires
                - matrix_exp<EXP>::type == T
                  (i.e. m contains the same type as *this does)
                - if (NR != 0) then NR == m.nr()
                - if (NC != 0) then NC == m.nc()
            ensures
                - #*this == m
                - #aliases(*this) == true
                - #ref().aliases(*this) == true
        !*/

        template <typename U, size_t len>
        explicit matrix (
            U (&array)[len]
        );
        /*!
            requires
                - NR != 0 && NC != 0 (i.e. you can only use this constructor on statically sized matrices)
                - len == nr()*nc()  (i.e. the array you give here must be the right size)
            ensures
                - for all valid r and c:
                  #(*this)(r,c) == array[r*nc() + c]
                  (i.e. initializes this matrix with the contents of the given array)
                - #aliases(*this) == true
                - #ref().aliases(*this) == true
        !*/

        T& operator() (
            long r, 
            long c
        ); 
        /*!
            requires
                - 0 <= r < nr()
                - 0 <= c < nc()
            ensures
                - returns a reference to the value at the given row and column in 
                  this matrix.
        !*/

        const T& operator() (
            long r, 
            long c
        ) const;
        /*!
            requires
                - 0 <= r < nr()
                - 0 <= c < nc()
            ensures
                - returns a const reference to the value at the given row and column in 
                  this matrix.
        !*/

        T& operator() (
            long i
        ); 
        /*!
            requires
                - nc() == 1 || nr() == 1 (i.e. this must be a column or row vector)
                - 0 <= i < size()
            ensures
                - if (nc() == 1) then
                    - returns a reference to (*this)(i,0)
                - else
                    - returns a reference to (*this)(0,i)
        !*/

        const T& operator() (
            long i
        ) const;
        /*!
            requires
                - nc() == 1 || nr() == 1 (i.e. this must be a column or row vector)
                - 0 <= i < size()
            ensures
                - if (nc() == 1) then
                    - returns a reference to (*this)(i,0)
                - else
                    - returns a reference to (*this)(0,i)
        !*/

        operator const type (
        ) const;
        /*!
            requires
                - nr() == 1
                - nc() == 1
            ensures
                - returns (*this)(0,0)
        !*/

        long nr(
        ) const;
        /*!
            ensures
                - returns the number of rows in this matrix
        !*/

        long nc(
        ) const;
        /*!
            ensures
                - returns the number of columns in this matrix
        !*/

        long size (
        ) const;
        /*!
            ensures
                - returns nr()*nc()
        !*/

        void set_size (
            long rows,
            long cols
        );
        /*!
            requires
                - rows == NR || NR == 0
                - cols == NC || NC == 0
                - rows >= 0 && cols >= 0
            ensures
                - #nr() == rows
                - #nc() == cols
        !*/

        void set_size (
            long length
        );
        /*!
            requires
                - NR == 1 || NC == 1 (i.e. this must be a column or row vector)
                - length >= 0 
                - if (NR == 1 && NC > 0) then
                    - length == NC
                - if (NC == 1 && NR > 0) then
                    - length == NR
            ensures
                - if (NR == 1) then
                    - #nr() == 1
                    - #nc() == length
                - else
                    - #nr() == length
                    - #nc() == 1
        !*/

        template <typename U, size_t len>
        matrix& operator= (
            U (&array)[len]
        );
        /*!
            requires
                - len == nr()*nc()  (i.e. the array you give here must be the right size)
            ensures
                - for all valid r and c:
                  #(*this)(r,c) == array[r*nc() + c]
                  (i.e. loads this matrix with the contents of the given array)
                - returns *this
        !*/

        template <typename EXP>
        matrix& operator= (
            const matrix_exp<EXP>& m
        );
        /*!
            requires
                - matrix_exp<EXP>::type == T
                  (i.e. m contains the same type as *this does)
                - if (NR != 0) then NR == m.nr()
                - if (NC != 0) then NC == m.nc()
            ensures
                - copies the given matrix expression m to *this
                - returns *this
        !*/

        template <typename EXP>
        matrix& operator += (
            const matrix_exp<EXP>& m
        );
        /*!
            requires
                - matrix_exp<EXP>::type == T
            ensures
                - if (nr() == m.nr() && nc() == m.nc()) then
                    - #(*this) == *this + m
                - else
                    - #(*this) == m
                      (i.e. if the dimensions don't match then this function performs a 
                      normal assignment)
                - returns *this
        !*/

        template <typename EXP>
        matrix& operator -= (
            const matrix_exp<EXP>& m
        );
        /*!
            requires
                - matrix_exp<EXP>::type == T
            ensures
                - if (nr() == m.nr() && nc() == m.nc()) then
                    - #(*this) == *this - m
                - else
                    - #(*this) == -m
                - returns *this
        !*/

        template <typename EXP>
        matrix& operator *= (
            const matrix_exp<EXP>& m
        );
        /*!
            requires
                - matrix_exp<EXP>::type == T
                  (i.e. m must contain the same type of element as *this)
                - nc() == m.nr()
                - size() > 0 && m.size() > 0
                  (you can't multiply any sort of empty matrices together)
            ensures
                - #(*this) == *this * m
                - returns *this
        !*/

        matrix& operator *= (
            const T& a
        );
        /*!
            ensures
                - #(*this) == *this * a
                - returns *this
        !*/

        matrix& operator /= (
            const T& a
        );
        /*!
            ensures
                - #(*this) == *this / a
                - returns *this
        !*/

        matrix& operator += (
            const T& a
        );
        /*!
            ensures
                - #(*this) == *this + a
                - returns *this
        !*/

        matrix& operator -= (
            const T& a
        );
        /*!
            ensures
                - #(*this) == *this - a
                - returns *this
        !*/

        const literal_assign_helper operator = (
            const T& val
        );
        /*!
            This function is somewhat different than all the others defined in this file.
            The purpose of this function is to enable you to easily initialize a matrix object.
            For example:
                matrix<double> m(2,3);
                m = 1,2,3,
                    4,5,6;

            The above code creates a matrix m with 2 rows and 3 columns and sets it so that
            it contains the matrix | 1 2 3 |
                                   | 4 5 6 |

            You can also use this function to assign to all elements of a matrix.  So
            saying m = 3; would assign all elements of m equal to 3.

            Note that to use this method of assignment it is required that you supply 
            exactly m.size() or 1 values so that the matrix is fully initialized.  Supplying 
            fewer or more than that is an error that will cause a dlib::fatal_error to be 
            thrown.

            Note also that using an expression of the form m = scalar; when m.size() == 0
            is legal but has no effect on m.
        !*/

        void swap (
            matrix& item
        );
        /*!
            ensures
                - swaps *this and item
        !*/
    };

// ----------------------------------------------------------------------------------------

    template <
        typename T,
        long NR,
        long NC,
        typename mm,
        typename l
        >
    void swap(
        matrix<T,NR,NC,mm,l>& a,
        matrix<T,NR,NC,mm,l>& b
    ) { a.swap(b); }
    /*!
        Provides a global swap function
    !*/

    template <
        typename T,
        long NR,
        long NC,
        typename mm,
        typename l
        >
    void serialize (
        const matrix<T,NR,NC,mm,l>& item, 
        std::ostream& out
    );   
    /*!
        Provides serialization support 
    !*/

    template <
        typename T,
        long NR,
        long NC,
        typename mm,
        typename l
        >
    void deserialize (
        matrix<T,NR,NC,mm,l>& item, 
        std::istream& in
    );   
    /*!
        Provides deserialization support 
    !*/

    template <
        typename EXP
        >
    std::ostream& operator<< (
        std::ostream& out,
        const matrix_exp<EXP>& m
    );
    /*!
        ensures
            - writes m to the given out stream in a form suitable for human consumption.
            - returns out
    !*/

// ----------------------------------------------------------------------------------------

    template <typename EXP>
    class const_temp_matrix : public matrix_exp<const_temp_matrix<EXP> >, noncopyable 
    {
        /*!
            REQUIREMENTS ON EXP
                - must be an object that inherits publicly from matrix_exp.

            WHAT THIS OBJECT REPRESENTS
                This object represents a copy of a matrix expression.  The twist
                is that it only actually makes a copy of its input matrix expression
                if that matrix expression is costly to evaluate.  If it has
                low cost then this object just stores a reference.  

                This class is useful in cases where you write a function that
                takes a matrix_exp object as input and you want to do some
                intensive computation that looks at each element of that matrix_exp
                many times.  If the input matrix_exp has a high cost then you want
                to store it into a temporary matrix.  But if it has low cost then
                it is faster if you just use a reference to it.  The const_temp_matrix
                makes doing this easy.
        !*/
    public:

        const_temp_matrix (
            const matrix_exp<EXP>& item
        );
        /*!
            ensures
                - #*this == item
                - if (EXP::cost <= 1) then
                    - this const_temp_matrix stores a reference to the item matrix
                - else
                    - this const_temp_matrix creates a temporary matrix and copies 
                      item into it
        !*/

        const_temp_matrix (
            const EXP& item
        );
        /*!
            ensures
                - #*this == item
                - if (EXP::cost <= 1) then
                    - this const_temp_matrix stores a reference to the item matrix
                - else
                    - this const_temp_matrix creates a temporary matrix and copies 
                      item into it
        !*/
    };

// ----------------------------------------------------------------------------------------

}

#endif // DLIB_MATRIx_ABSTRACT_

