// Copyright (C) 2010  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#ifndef DLIB_OPTIMIZATION_TEST_FUNCTiONS_H___
#define DLIB_OPTIMIZATION_TEST_FUNCTiONS_H___

#include <dlib/matrix.h>
#include <sstream>
#include <cmath>

/*

    Most of the code in this file is converted from the set of Fortran 90 routines 
    created by John Burkardt.

    The original Fortran can be found here: http://orion.math.iastate.edu/burkardt/f_src/testopt/testopt.html

*/


namespace dlib
{
    namespace test_functions
    {

    // ----------------------------------------------------------------------------------------

        matrix<double,0,1> chebyquad_residuals(const matrix<double,0,1>& x);

        double chebyquad_residual(int i, const matrix<double,0,1>& x);

        int& chebyquad_calls();

        double chebyquad(const matrix<double,0,1>& x );

        matrix<double,0,1> chebyquad_derivative (const matrix<double,0,1>& x);

        matrix<double,0,1> chebyquad_start (int n);

        matrix<double,0,1> chebyquad_solution (int n);

        matrix<double> chebyquad_hessian(const matrix<double,0,1>& x);

    // ----------------------------------------------------------------------------------------

        class chebyquad_function_model 
        {
        public:

            // Define the type used to represent column vectors
            typedef matrix<double,0,1> column_vector;
            // Define the type used to represent the hessian matrix
            typedef matrix<double> general_matrix;

            double operator() ( 
                const column_vector& x
            ) const
            {
                return chebyquad(x);
            }

            void get_derivative_and_hessian (
                const column_vector& x,
                column_vector& d,
                general_matrix& h
            ) const
            {
                d = chebyquad_derivative(x);
                h = chebyquad_hessian(x);
            }
        };

    // ----------------------------------------------------------------------------------------
    // ----------------------------------------------------------------------------------------
    // ----------------------------------------------------------------------------------------
    // ----------------------------------------------------------------------------------------

        double brown_residual (int i, const matrix<double,4,1>& x);
        /*!
            requires
                - 1 <= i <= 20
            ensures
                - returns the ith brown residual
        !*/

        double brown ( const matrix<double,4,1>& x);

        matrix<double,4,1> brown_derivative ( const matrix<double,4,1>& x);

        matrix<double,4,4> brown_hessian ( const matrix<double,4,1>& x);

        matrix<double,4,1> brown_start ();

        matrix<double,4,1> brown_solution ();

        class brown_function_model 
        {
        public:

            // Define the type used to represent column vectors
            typedef matrix<double,4,1> column_vector;
            // Define the type used to represent the hessian matrix
            typedef matrix<double> general_matrix;

            double operator() ( 
                const column_vector& x
            ) const
            {
                return brown(x);
            }

            void get_derivative_and_hessian (
                const column_vector& x,
                column_vector& d,
                general_matrix& h
            ) const
            {
                d = brown_derivative(x);
                h = brown_hessian(x);
            }
        };

    // ----------------------------------------------------------------------------------------
    // ----------------------------------------------------------------------------------------
    // ----------------------------------------------------------------------------------------
    // ----------------------------------------------------------------------------------------

        template <typename T>
        matrix<T,2,1> rosen_big_start()
        {
            matrix<T,2,1> x;
            x = -1.2, -1;
            return x;
        }

    // This is a variation on the Rosenbrock test function but with large residuals.  The
    // minimum is at 1, 1 and the objective value is 1.
        template <typename T>
        T rosen_big_residual (int i, const matrix<T,2,1>& m)
        {
            using std::pow;
            const T x = m(0); 
            const T y = m(1);

            if (i == 1)
            {
                return 100*pow(y - x*x,2)+1.0;
            }
            else 
            {
                return pow(1 - x,2) + 1.0;
            }
        }

        template <typename T>
        T rosen_big ( const matrix<T,2,1>& m)
        {
            using std::pow;
            return 0.5*(pow(rosen_big_residual(1,m),2) + pow(rosen_big_residual(2,m),2));
        }

        template <typename T>
        matrix<T,2,1> rosen_big_solution ()
        {
            matrix<T,2,1> x;
            // solution from original documentation.
            x = 1,1;
            return x;
        }

    // ----------------------------------------------------------------------------------------
    // ----------------------------------------------------------------------------------------
    // ----------------------------------------------------------------------------------------
    // ----------------------------------------------------------------------------------------

        template <typename T>
        matrix<T,2,1> rosen_start()
        {
            matrix<T,2,1> x;
            x = -1.2, -1;
            return x;
        }

        template <typename T>
        T rosen ( const matrix<T,2,1>& m)
        {
            const T x = m(0); 
            const T y = m(1);

            using std::pow;
            // compute Rosenbrock's function and return the result
            return 100.0*pow(y - x*x,2) + pow(1 - x,2);
        }

        template <typename T>
        T rosen_residual (int i, const matrix<T,2,1>& m)
        {
            const T x = m(0); 
            const T y = m(1);


            if (i == 1)
            {
                return 10*(y - x*x);
            }
            else
            {
                return 1 - x;
            }
        }

        template <typename T>
        matrix<T,2,1> rosen_residual_derivative (int i, const matrix<T,2,1>& m)
        {
            const T x = m(0); 

            matrix<T,2,1> d;

            if (i == 1)
            {
                d = -20*x, 10;
            }
            else
            {
                d = -1, 0;
            }
            return d;
        }

        template <typename T>
        const matrix<T,2,1> rosen_derivative ( const matrix<T,2,1>& m)
        {
            const T x = m(0);
            const T y = m(1);

            // make us a column vector of length 2
            matrix<T,2,1> res(2);

            // now compute the gradient vector
            res(0) = -400*x*(y-x*x) - 2*(1-x); // derivative of rosen() with respect to x
            res(1) = 200*(y-x*x);              // derivative of rosen() with respect to y
            return res;
        }

        template <typename T>
        const matrix<T,2,2> rosen_hessian ( const matrix<T,2,1>& m)
        {
            const T x = m(0);
            const T y = m(1);

            // make us a column vector of length 2
            matrix<T,2,2> res;

            // now compute the gradient vector
            res(0,0) = -400*y + 3*400*x*x + 2; 
            res(1,1) = 200;              

            res(0,1) = -400*x;              
            res(1,0) = -400*x;              
            return res;
        }

        template <typename T>
        matrix<T,2,1> rosen_solution ()
        {
            matrix<T,2,1> x;
            // solution from original documentation.
            x = 1,1;
            return x;
        }

    // ------------------------------------------------------------------------------------

        template <typename T>
        struct rosen_function_model
        {
            typedef matrix<T,2,1> column_vector;
            typedef matrix<T,2,2> general_matrix;

            T operator() ( column_vector x) const
            {
                return static_cast<T>(rosen(x));
            }

            void get_derivative_and_hessian (
                const column_vector& x,
                column_vector& d,
                general_matrix& h
            ) const 
            {
                d = rosen_derivative(x);
                h = rosen_hessian(x);
            }

        };

    // ----------------------------------------------------------------------------------------

    }
}

#endif // DLIB_OPTIMIZATION_TEST_FUNCTiONS_H___



