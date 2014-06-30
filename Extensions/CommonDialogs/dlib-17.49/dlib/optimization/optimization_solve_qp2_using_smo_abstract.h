// Copyright (C) 2007  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#undef DLIB_OPTIMIZATION_SOLVE_QP2_USING_SMO_ABSTRACT_H_
#ifdef DLIB_OPTIMIZATION_SOLVE_QP2_USING_SMO_ABSTRACT_H_

#include "../matrix/matrix_abstract.h"
#include "../algs.h"

namespace dlib
{

// ----------------------------------------------------------------------------------------

    class invalid_nu_error : public dlib::error 
    { 
        /*!
            WHAT THIS OBJECT REPRESENTS
                This object is an exception class used to indicate that a
                value of nu given to the solve_qp2_using_smo object is incompatible 
                with the constraints of the quadratic program.

                this->nu will be set to the invalid value of nu used.
        !*/

    public: 
        invalid_nu_error(const std::string& msg, double nu_) : dlib::error(msg), nu(nu_) {};
        const double nu;
    };

// ----------------------------------------------------------------------------------------

    template <
        typename T
        >
    typename T::type maximum_nu (
        const T& y
    );
    /*!
        requires
            - T == a matrix object or an object convertible to a matrix via vector_to_matrix()
            - is_col_vector(y) == true
            - y.size() > 1
            - sum((y == +1) + (y == -1)) == y.size()
              (i.e. all elements of y must be equal to +1 or -1)
        ensures
            - returns the maximum valid nu that can be used with solve_qp2_using_smo and
              the given y vector.
              (i.e. 2.0*min(sum(y == +1), sum(y == -1))/y.size())
    !*/

// ----------------------------------------------------------------------------------------

    template <
        typename matrix_type
        >
    class solve_qp2_using_smo
    {
        /*!
            REQUIREMENTS ON matrix_type
                Must be some type of dlib::matrix.

            WHAT THIS OBJECT REPRESENTS
                This object is a tool for solving the following quadratic programming
                problem using the sequential minimal optimization algorithm:  

                  Minimize: f(alpha) == 0.5*trans(alpha)*Q*alpha 
                  subject to the following constraints:
                    - sum(alpha) == nu*y.size() 
                    - 0 <= min(alpha) && max(alpha) <= 1 
                    - trans(y)*alpha == 0

                  Where all elements of y must be equal to +1 or -1 and f is convex.  
                  This means that Q should be symmetric and positive-semidefinite.
                
                
                This object implements the strategy used by the LIBSVM tool.  The following papers
                can be consulted for additional details:
                    - Chang and Lin, Training {nu}-Support Vector Classifiers: Theory and Algorithms
                    - Chih-Chung Chang and Chih-Jen Lin, LIBSVM : a library for support vector 
                      machines, 2001. Software available at http://www.csie.ntu.edu.tw/~cjlin/libsvm
        !*/

    public:

        typedef typename matrix_type::mem_manager_type mem_manager_type;
        typedef typename matrix_type::type scalar_type;
        typedef typename matrix_type::layout_type layout_type;
        typedef matrix<scalar_type,0,0,mem_manager_type,layout_type> general_matrix;
        typedef matrix<scalar_type,0,1,mem_manager_type,layout_type> column_matrix;

        template <
            typename EXP1,
            typename EXP2,
            long NR
            >
        unsigned long operator() ( 
            const matrix_exp<EXP1>& Q,
            const matrix_exp<EXP2>& y,
            const scalar_type nu,
            matrix<scalar_type,NR,1,mem_manager_type, layout_type>& alpha,
            scalar_type eps
        );
        /*!
            requires
                - Q.nr() == Q.nc()
                - is_col_vector(y) == true
                - y.size() == Q.nr()
                - y.size() > 1
                - sum((y == +1) + (y == -1)) == y.size()
                  (i.e. all elements of y must be equal to +1 or -1)
                - alpha must be capable of representing a vector of size y.size() elements
                - 0 < nu <= 1
                - eps > 0
            ensures
                - This function solves the quadratic program defined in this class's main comment.
                - The solution to the quadratic program will be stored in #alpha.
                - #alpha.size() == y.size()
                - This function uses an implementation of the sequential minimal optimization 
                  algorithm.  It runs until the KKT violation is less than eps.  So eps controls 
                  how accurate the solution is and smaller values result in better solutions.
                  (a reasonable eps is usually about 1e-3)
                - #get_gradient() == Q*(#alpha)
                  (i.e. stores the gradient of f() at #alpha in get_gradient())
                - returns the number of iterations performed.  
            throws
                - invalid_nu_error
                  This exception is thrown if nu >= maximum_nu(y).  
                  (some values of nu cause the constraints to become impossible to satisfy. 
                  If this is detected then an exception is thrown).
        !*/

        const column_matrix& get_gradient (
        ) const;
        /*!
            ensures
                - returns the gradient vector at the solution of the last problem solved
                  by this object.  If no problem has been solved then returns an empty
                  vector.
        !*/

    };

// ----------------------------------------------------------------------------------------

}

#endif // DLIB_OPTIMIZATION_SOLVE_QP2_USING_SMO_ABSTRACT_H_



