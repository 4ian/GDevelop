// Copyright (C) 2006  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#undef DLIB_MATRIx_EXP_ABSTRACT_
#ifdef DLIB_MATRIx_EXP_ABSTRACT_

#include "matrix_fwd.h"

namespace dlib
{

// ----------------------------------------------------------------------------------------

    template <
        typename EXP
        >
    class matrix_exp
    {
        /*!
            REQUIREMENTS ON EXP
                - must be an object that inherits publicly from matrix_exp (this class).

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


                const_ret_type typedef (defined below)
                    The purpose of the const_ret_type typedef is to allow matrix expressions
                    to return their elements by reference when appropriate.  So const_ret_type 
                    should be one of the following types:
                        - const type
                        - const type& 
        !*/

    public:
        typedef typename EXP::type type;
        typedef type value_type; // Redefined for compatibility with the STL
        typedef typename EXP::const_ret_type const_ret_type;
        typedef typename EXP::mem_manager_type mem_manager_type;
        typedef typename EXP::layout_type layout_type;
        const static long cost = EXP::cost;
        const static long NR = EXP::NR;
        const static long NC = EXP::NC;
        typedef matrix<type,NR,NC, mem_manager_type,layout_type> matrix_type;
        typedef EXP exp_type;
        typedef matrix_exp_iterator<EXP> iterator;
        typedef matrix_exp_iterator<EXP> const_iterator;

        const_ret_type operator() (
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

        const_ret_type operator() (
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

        template <typename U>
        bool aliases (
            const matrix_exp<U>& item
        ) const;
        /*!
            ensures
                - if (A change to the state of item could cause a change to the state of *this
                      matrix_exp object.  ) then
                    - returns true
                    - This happens when this matrix_exp contains item in some way. 
                - else
                    - returns false
        !*/

        template <typename U>
        bool destructively_aliases (
            const matrix_exp<U>& item
        ) const; 
        /*!
            ensures
                - if (aliases(item)) then 
                    - if (nr() != item.nr() || nc() != item.nc()
                        - returns true
                          (i.e. if this expression has different dimensions than item then
                          we have destructive aliasing)

                    - returns true if the following assignment would evaluate incorrectly:
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

        inline const exp_type& ref (
        ) const; 
        /*!
            ensures
                - returns a reference to the expression contained in *this.
                  (i.e. returns *static_cast<const exp_type*>(this) )
        !*/

        const_iterator begin(
        ) const;
        /*!
            ensures
                - returns a forward access iterator pointing to the first element in this
                  matrix expression.
                - Since matrix_exp objects represent immutable views of a matrix, the
                  returned iterator does not allow the user to modify the matrix
                  expression's elements.
                - The iterator will iterate over the elements of the matrix in row major
                  order.
        !*/

        const_iterator end(
        ) const;
        /*!
            ensures
                - returns a forward access iterator pointing to one past the end of the
                  last element in this matrix expression.
        !*/

    protected:

        // Only derived classes of matrix_exp may call the matrix_exp constructors.
        matrix_exp(const matrix_exp&); 
        matrix_exp();

    private:
        // no one may ever use the assignment operator on a matrix_exp
        matrix_exp& operator= (const matrix_exp&);
    };

// ----------------------------------------------------------------------------------------

}

#endif // DLIB_MATRIx_EXP_ABSTRACT_


