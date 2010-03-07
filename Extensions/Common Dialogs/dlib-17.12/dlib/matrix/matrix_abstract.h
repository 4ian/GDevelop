// Copyright (C) 2006  Davis E. King (davisking@users.sourceforge.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#undef DLIB_MATRIx_ABSTRACT_
#ifdef DLIB_MATRIx_ABSTRACT_

#include "../serialize.h"
#include "../memory_manager.h"

namespace dlib
{

// ----------------------------------------------------------------------------------------

    template <
        typename T,
        long num_rows,
        long num_cols,
        typename mem_manager
        >
    class matrix; 

// ----------------------------------------------------------------------------------------

    template <
        typename T,
        long num_rows,
        long num_cols,
        typename mem_manager
        >
    class matrix_ref
    {
        /*!
            WHAT THIS OBJECT REPRESENTS
                This object represents a copyable (via the copy constructor but not
                operator=) reference to a matrix object.  
        !*/
    public:
        typedef T type;
        typedef matrix_ref ref_type;
        typedef mem_manager mem_manager_type;
        const static long NR = num_rows;
        const static long NC = num_cols;

        matrix_ref (
            const matrix<T,num_rows,num_cols,mem_manager>& m
        );
        /*!
            ensures
                - #aliases(m) == true
                  (i.e. #*this references/aliases the matrix m.)
        !*/

        matrix_ref (
            const matrix_ref& r
        );
        /*!
            ensures
                - #*this references/aliases the same matrix as r does.
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

        long nr (
        ) const;
        /*!
            ensures
                - returns the number of rows in the matrix referenced by *this
        !*/

        long nc (
        ) const;
        /*!
            ensures
                - returns the number of columns in the matrix referenced by *this
        !*/

        long size (
        ) const;
        /*!
            ensures
                - returns nr()*nc()
        !*/

        template <typename U, long iNR, long iNC, typename mm>
        bool destructively_aliases (
            const matrix<U,iNR,iNC,mm>& item
        ) const;
        /*!
            ensures
                - returns false
        !*/

        template <typename U, long iNR, long iNC, typename mm>
        bool aliases (
            const matrix<U,iNR,iNC,mm>& item
        ) const;
        /*!
            ensures
                - if (item is the matrix referenced by *this) then
                    - returns true
                - else
                    - returns false
        !*/

        const ref_type& ref(
        ) const { return *this; }
        /*!
            ensures
                - returns *this
        !*/

    private:
        // no assignment operator
        matrix_ref& operator=(const matrix_ref&);
    };

// ----------------------------------------------------------------------------------------

    template <
        typename EXP
        >
    class matrix_exp
    {
        /*!
            REQUIREMENTS ON EXP
                - must be a matrix_exp or matrix_ref object (or an object with 
                  a compatible interface)

            WHAT THIS OBJECT REPRESENTS
                This object represents an expression that evaluates to a matrix 
                of nr() rows and nc() columns.  
                
                The reason for having an object that represents an expression is that it 
                allows us to use the "expression templates" technique to eliminate the 
                temporary matrix objects that would normally be returned from expressions 
                such as M = A+B+C+D;  Normally each invocation of the + operator would
                construct and return a temporary matrix object but using this technique we 
                can avoid creating all of these temporary objects and receive a large 
                speed boost.

                Note that every time you invoke operator() on this object it recomputes 
                its result which may not be what you want to do.  For example, if you 
                are going to be accessing the same element over and over it might 
                be faster to assign the matrix_exp to a temporary matrix and then 
                use that temporary.
        !*/

    public:
        typedef typename EXP::type type;
        typedef typename EXP::ref_type ref_type;
        typedef typename EXP::mem_manager_type mem_manager_type;
        const static long NR = EXP::NR;
        const static long NC = EXP::NC;
        typedef matrix<type,NR,NC, mem_manager_type> matrix_type;

        matrix_exp (
            const EXP& exp
        ); 
        /*!
            ensures
                - #ref() == exp.ref()
        !*/

        const type operator() (
            long r,
            long c
        ) const;
        /*!
            requires
                - 0 <= r < nr()
                - 0 <= c < nc()
            ensures
                - returns ref()(r,c)
                  (i.e. returns the value at the given row and column that would be in
                  the matrix represented by this matrix expression)
        !*/

        const type operator() (
            long i
        ) const;
        /*!
            requires
                - nc() == 1 || nr() == 1 (i.e. this must be a column or row vector)
                - if (nc() == 1) then
                    - 0 <= i < nr()
                - else
                    - 0 <= i < nc()
            ensures
                - if (nc() == 1) then
                    - returns (*this)(i,0)
                - else
                    - returns (*this)(0,i)
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

        long nr (
        ) const;
        /*!
            ensures
                - returns the number of rows in this matrix expression. 
        !*/

        long nc (
        ) const; 
        /*!
            ensures
                - returns the number of columns in this matrix expression.
        !*/

        long size (
        ) const;
        /*!
            ensures
                - returns nr()*nc()
        !*/

        template <typename U, long iNR, long iNC , typename mm>
        bool aliases (
            const matrix<U,iNR,iNC,mm>& item
        ) const;
        /*!
            ensures
                - if (this matrix expression contains/aliases the given matrix or contains
                  any subexpressions that contain/alias the given matrix) then
                    - returns true
                - else
                    - returns false
        !*/

        template <typename U, long iNR, long iNC, typename mm >
        bool destructively_aliases (
            const matrix<U,iNR,iNC,mm>& item
        ) const; 
        /*!
            ensures
                - if (aliases(item)) then 
                    - if (nr() != item.nr() || nc() != item.nc()
                        - returns true
                          (i.e. if this expression has different dimensions than item then
                          we have destructive aliasing)

                    - returns true if the following expression would evaluate incorrectly:
                      for (long r = 0; r < nr(); ++r)
                        for (long c = 0; c < nc(); ++c)
                          item(r,c) = (*this)(r,c)
                    - That is, if this matrix expression aliases item in such a way that a modification
                      to element item(r,c) causes a change in the value of something other than
                      (*this)(r,c) then this function returns true.  

                    - returns false if none of the above conditions say we should return true
                - else
                    - returns false
        !*/

        const ref_type& ref (
        ) const; 
        /*!
            ensures
                - returns a copyable reference to the subexpression contained in *this.
        !*/

    };

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
        typename mem_manager = memory_manager<char>::kernel_1a
        >
    class matrix : public matrix_exp<matrix_ref<T,num_rows,num_cols,mem_manager> > 
    {
        /*!
            REQUIREMENTS ON num_rows and num_cols
                both must be bigger than or equal to 0

            REQUIREMENTS ON mem_manager
                must be an implementation of memory_manager/memory_manager_kernel_abstract.h or
                must be an implementation of memory_manager_global/memory_manager_global_kernel_abstract.h or
                must be an implementation of memory_manager_stateless/memory_manager_stateless_kernel_abstract.h 
                mem_manager::type can be set to anything.

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

                Also note that the elements of this matrix are contiguous in memory and 
                stored in row major order.  Additionally, all memory allocations are
                performed using the memory manager object supplied as template argument.
        !*/

    public:
        typedef T type;
        typedef matrix_ref<T,num_rows,num_cols,mem_manager> ref_type;
        typedef mem_manager mem_manager_type;
        const static long NR = num_rows;
        const static long NC = num_cols;

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
        matrix (
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
                - if (nc() == 1) then
                    - 0 <= i < nr()
                - else
                    - 0 <= i < nc()
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
                - if (nc() == 1) then
                    - 0 <= i < nr()
                - else
                    - 0 <= i < nc()
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
                - nr() == m.nr()
                - nc() == m.nc()
            ensures
                - #(*this) == *this + m
                - returns *this
        !*/

        template <typename EXP>
        matrix& operator -= (
            const matrix_exp<EXP>& m
        );
        /*!
            requires
                - matrix_exp<EXP>::type == T
                - nr() == m.nr()
                - nc() == m.nc()
            ensures
                - #(*this) == *this - m
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
        typename mm
        >
    void swap(
        matrix<T,NR,NC,mm>& a,
        matrix<T,NR,NC,mm>& b
    ) { a.swap(b); }
    /*!
        Provides a global swap function
    !*/

    template <
        typename T,
        long NR,
        long NC,
        typename mm
        >
    void serialize (
        const matrix<T,NR,NC,mm>& item, 
        std::ostream& out
    );   
    /*!
        Provides serialization support 
    !*/

    template <
        typename T,
        long NR,
        long NC,
        typename mm
        >
    void deserialize (
        matrix<T,NR,NC,mm>& item, 
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

}

#endif // DLIB_MATRIx_ABSTRACT_

