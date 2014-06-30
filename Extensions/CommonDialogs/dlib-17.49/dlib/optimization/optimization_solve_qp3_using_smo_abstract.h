// Copyright (C) 2010  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#undef DLIB_OPTIMIZATION_SOLVE_QP3_USING_SMO_ABSTRACT_H_
#ifdef DLIB_OPTIMIZATION_SOLVE_QP3_USING_SMO_ABSTRACT_H_

#include "../matrix/matrix_abstract.h"
#include "../algs.h"

namespace dlib
{

// ----------------------------------------------------------------------------------------

    class invalid_qp3_error : public dlib::error 
    { 
        /*!
            WHAT THIS OBJECT REPRESENTS
                This object is an exception class used to indicate that the values 
                of B, Cp, and Cn given to the solve_qp3_using_smo object are incompatible 
                with the constraints of the quadratic program.

                this->B, this->Cp, and this->Cn will be set to the invalid values used.
        !*/

    public: 
        invalid_qp3_error( const std::string& msg, double B_, double Cp_, double Cn_) : 
            dlib::error(msg), B(B_), Cp(Cp_), Cn(Cn_) {};

        const double B;
        const double Cp;
        const double Cn;
    };

// ----------------------------------------------------------------------------------------

    template <
        typename matrix_type
        >
    class solve_qp3_using_smo
    {
        /*!
            REQUIREMENTS ON matrix_type
                Must be some type of dlib::matrix.

            WHAT THIS OBJECT REPRESENTS
                This object is a tool for solving the following quadratic programming
                problem using the sequential minimal optimization algorithm:  

                  Minimize: f(alpha) == 0.5*trans(alpha)*Q*alpha + trans(p)*alpha
                  subject to the following constraints:
                    - for all i such that y(i) == +1:  0 <= alpha(i) <= Cp 
                    - for all i such that y(i) == -1:  0 <= alpha(i) <= Cn 
                    - trans(y)*alpha == B 

                  Where all elements of y must be equal to +1 or -1 and f is convex.  
                  This means that Q should be symmetric and positive-semidefinite.
                
                
                This object implements the strategy used by the LIBSVM tool.  The following papers
                can be consulted for additional details:
                    - Chih-Chung Chang and Chih-Jen Lin, LIBSVM : a library for support vector 
                      machines, 2001. Software available at http://www.csie.ntu.edu.tw/~cjlin/libsvm
                    - Working Set Selection Using Second Order Information for Training Support Vector Machines by
                      Fan, Chen, and Lin.  In the Journal of Machine Learning Research 2005.
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
            typename EXP3,
            long NR
            >
        unsigned long operator() ( 
            const matrix_exp<EXP1>& Q,
            const matrix_exp<EXP2>& p,
            const matrix_exp<EXP3>& y,
            const scalar_type B,
            const scalar_type Cp,
            const scalar_type Cn,
            matrix<scalar_type,NR,1,mem_manager_type, layout_type>& alpha,
            scalar_type eps
        );
        /*!
            requires
                - Q.nr() == Q.nc()
                - is_col_vector(y) == true
                - is_col_vector(p) == true
                - p.size() == y.size() == Q.nr()
                - y.size() > 0
                - sum((y == +1) + (y == -1)) == y.size()
                  (i.e. all elements of y must be equal to +1 or -1)
                - alpha must be capable of representing a vector of size y.size() elements
                - Cp > 0
                - Cn > 0
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
                - invalid_qp3_error
                  This exception is thrown if the given parameters cause the constraints
                  of the quadratic programming problem to be impossible to satisfy. 
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

#endif // DLIB_OPTIMIZATION_SOLVE_QP3_USING_SMO_ABSTRACT_H_



