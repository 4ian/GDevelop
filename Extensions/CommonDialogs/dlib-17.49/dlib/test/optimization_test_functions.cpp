// Copyright (C) 2010  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#include "optimization_test_functions.h"

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

        matrix<double,0,1> chebyquad_residuals(const matrix<double,0,1>& x)
        {
            matrix<double,0,1> fvec(x.size());
            const int n = x.size();
            int i;
            int j;
            double t;
            double t1;
            double t2;
            double th;
            fvec = 0;

            for (j = 1; j <= n; ++j)
            {
                t1 = 1.0E+00;
                t2 = 2.0E+00 * x(j-1) - 1.0E+00;
                t = 2.0E+00 * t2;
                for (i = 1; i <= n; ++i)
                {
                    fvec(i-1) = fvec(i-1) + t2;
                    th = t * t2 - t1;
                    t1 = t2;
                    t2 = th;
                }
            }

            for (i = 1; i <= n; ++i)
            {
                fvec(i-1) = fvec(i-1) / (double) ( n );
                if ( ( i%2 ) == 0 ) 
                    fvec(i-1) = fvec(i-1) + 1.0E+00 / ( (double)i*i - 1.0E+00 );
            }

            return fvec;
        }

    // ----------------------------------------------------------------------------------------

        double chebyquad_residual(int i, const matrix<double,0,1>& x)
        {
            return chebyquad_residuals(x)(i);
        }

    // ----------------------------------------------------------------------------------------

        int& chebyquad_calls() 
        {
            static int count = 0;
            return count;
        }

        double chebyquad(const matrix<double,0,1>& x )
        {
            chebyquad_calls()++;
            return sum(squared(chebyquad_residuals(x)));
        }

    // ----------------------------------------------------------------------------------------

        matrix<double,0,1> chebyquad_derivative (const matrix<double,0,1>& x)
        {
            const int n = x.size();
            matrix<double,0,1> fvec = chebyquad_residuals(x);
            matrix<double,0,1> g(n);
            int i;
            int j;
            double s1;
            double s2;
            double t;
            double t1;
            double t2;
            double th;

            for (j = 1; j <= n; ++j)
            {
                g(j-1) = 0.0E+00;
                t1 = 1.0E+00;
                t2 = 2.0E+00 * x(j-1) - 1.0E+00;
                t = 2.0E+00 * t2;
                s1 = 0.0E+00;
                s2 = 2.0E+00;
                for (i = 1; i <= n; ++i)
                {
                    g(j-1) = g(j-1) + fvec(i-1) * s2;
                    th = 4.0E+00 * t2 + t * s2 - s1;
                    s1 = s2;
                    s2 = th;
                    th = t * t2 - t1;
                    t1 = t2;
                    t2 = th;
                }
            }

            g = 2.0E+00 * g / (double) ( n );

            return g;
        }

    // ----------------------------------------------------------------------------------------

        matrix<double,0,1> chebyquad_start (int n)
        {
            int i;
            matrix<double,0,1> x(n);

            for (i = 1; i <= n; ++i)
                x(i-1) = double ( i ) / double ( n + 1 );

            return x;
        }

    // ----------------------------------------------------------------------------------------

        matrix<double,0,1> chebyquad_solution (int n)
        {
            matrix<double,0,1> x(n);

            x = 0;
            switch (n)
            {
                case 2:
                    x = 0.2113249E+00, 0.7886751E+00;
                    break;
                case 4:
                    x = 0.1026728E+00, 0.4062037E+00, 0.5937963E+00, 0.8973272E+00;
                    break;
                case 6:
                    x = 0.066877E+00, 0.288741E+00, 0.366682E+00, 0.633318E+00, 0.711259E+00, 0.933123E+00;
                    break;
                case 8:
                    x = 0.043153E+00, 0.193091E+00, 0.266329E+00, 0.500000E+00, 0.500000E+00, 0.733671E+00, 0.806910E+00, 0.956847E+00;
                    break;
                default:
                    std::ostringstream sout;
                    sout << "don't know chebyquad solution for n = " << n;
                    throw dlib::error(sout.str());
                    break;
            }

            return x;
        }

    // ----------------------------------------------------------------------------------------

        matrix<double> chebyquad_hessian(const matrix<double,0,1>& x)
        {
            const int lda = x.size();
            const int n = x.size();
            double d1;
            double d2;
            matrix<double,0,1> fvec = chebyquad_residuals(x);
            matrix<double,0,1> gvec(n);
            matrix<double> h(lda,n);
            int i;
            int j;
            int k;
            double p1;
            double p2;
            double s1;
            double s2;
            double ss1;
            double ss2;
            double t;
            double t1;
            double t2;
            double th;
            double tt;
            double tth;
            double tt1;
            double tt2;
            h = 0;

            d1 = 1.0E+00 / double ( n );
            d2 = 2.0E+00 * d1;

            for (j = 1; j <= n; ++j)
            {

                h(j-1,j-1) = 4.0E+00 * d1;
                t1 = 1.0E+00;
                t2 = 2.0E+00 * x(j-1) - 1.0E+00;
                t = 2.0E+00 * t2;
                s1 = 0.0E+00;
                s2 = 2.0E+00;
                p1 = 0.0E+00;
                p2 = 0.0E+00;
                gvec(0) = s2;

                for (i = 2; i <= n; ++i)
                {
                    th = 4.0E+00 * t2 + t * s2 - s1;
                    s1 = s2;
                    s2 = th;
                    th = t * t2 - t1;
                    t1 = t2;
                    t2 = th;
                    th = 8.0E+00 * s1 + t * p2 - p1;
                    p1 = p2;
                    p2 = th;
                    gvec(i-1) = s2;
                    h(j-1,j-1) = h(j-1,j-1) + fvec(i-1) * th + d1 * s2*s2;
                }

                h(j-1,j-1) = d2 * h(j-1,j-1);

                for (k = 1; k <= j-1; ++k)
                {

                    h(j-1,k-1) = 0.0;
                    tt1 = 1.0E+00;
                    tt2 = 2.0E+00 * x(k-1) - 1.0E+00;
                    tt = 2.0E+00 * tt2;
                    ss1 = 0.0E+00;
                    ss2 = 2.0E+00;

                    for (i = 1; i <= n; ++i)
                    {
                        h(j-1,k-1) = h(j-1,k-1) + ss2 * gvec(i-1);
                        tth = 4.0E+00 * tt2 + tt * ss2 - ss1;
                        ss1 = ss2;
                        ss2 = tth;
                        tth = tt * tt2 - tt1;
                        tt1 = tt2;
                        tt2 = tth;
                    }

                    h(j-1,k-1) = d2 * d1 * h(j-1,k-1);

                }

            }

            h = make_symmetric(h);
            return h;
        }

    // ----------------------------------------------------------------------------------------
    // ----------------------------------------------------------------------------------------
    // ----------------------------------------------------------------------------------------
    // ----------------------------------------------------------------------------------------

        double brown_residual (int i, const matrix<double,4,1>& x)
        /*!
            requires
                - 1 <= i <= 20
            ensures
                - returns the ith brown residual
        !*/
        {
            double c;
            double f;
            double f1;
            double f2;

            f = 0.0E+00;


            c = double ( i ) / 5.0E+00;
            f1 = x(0) + c * x(1) - std::exp ( c );
            f2 = x(2) + std::sin ( c ) * x(3) - std::cos ( c );

            f = f1*f1 + f2*f2; 

            return f;
        }

    // ----------------------------------------------------------------------------------------

        double brown ( const matrix<double,4,1>& x)
        {
            double f;
            int i;

            f = 0;

            for (i = 1; i <= 20; ++i)
            {
                f += std::pow(brown_residual(i, x), 2);
            }

            return f;
        }

    // ----------------------------------------------------------------------------------------

        matrix<double,4,1> brown_derivative ( const matrix<double,4,1>& x)
        {
            double c;
            double df1dx1;
            double df1dx2;
            double df2dx3;
            double df2dx4;
            double f1;
            double f2;
            matrix<double,4,1> g;
            int i;

            g = 0;

            for (i = 1; i <= 20; ++i)
            {

                c = double ( i ) / 5.0E+00;

                f1 = x(0) + c * x(1) - std::exp ( c );
                f2 = x(2) + std::sin ( c ) * x(3) - std::cos ( c );

                df1dx1 = 1.0E+00;
                df1dx2 = c;
                df2dx3 = 1.0E+00;
                df2dx4 = std::sin ( c );

                using std::pow;
                g(0) = g(0) + 4.0E+00 * ( pow(f1,3) * df1dx1 + f1 * pow(f2,2) * df1dx1 );
                g(1) = g(1) + 4.0E+00 * ( pow(f1,3) * df1dx2 + f1 * pow(f2,2) * df1dx2 );
                g(2) = g(2) + 4.0E+00 * ( pow(f1,2) * f2 * df2dx3 + pow(f2,3) * df2dx3 );
                g(3) = g(3) + 4.0E+00 * ( pow(f1,2) * f2 * df2dx4 + pow(f2,3) * df2dx4 );

            }

            return g;
        }

    // ----------------------------------------------------------------------------------------

        matrix<double,4,4> brown_hessian ( const matrix<double,4,1>& x)
        {
            double c;
            double df1dx1;
            double df1dx2;
            double df2dx3;
            double df2dx4;
            double f1;
            double f2;
            matrix<double,4,4> h;
            int i;

            h = 0;

            for (i = 1; i <= 20; ++i)
            {

                c = double ( i ) / 5.0E+00;

                f1 = x(0) + c * x(1) - std::exp ( c );
                f2 = x(2) + std::sin ( c ) * x(3) - std::cos ( c );

                df1dx1 = 1.0E+00;
                df1dx2 = c;
                df2dx3 = 1.0E+00;
                df2dx4 = std::sin ( c );

                using std::pow;
                h(0,0) = h(0,0) + 12.0E+00 * pow(f1,2) * df1dx1 * df1dx1 + 4.0E+00 * pow(f2,2) * df1dx1 * df1dx1;
                h(0,1) = h(0,1) + 12.0E+00 * pow(f1,2) * df1dx1 * df1dx2 + 4.0E+00 * pow(f2,2) * df1dx1 * df1dx2;
                h(0,2) = h(0,2) + 8.0E+00 * f1 * f2 * df1dx1 * df2dx3;
                h(0,3) = h(0,3) + 8.0E+00 * f1 * f2 * df1dx1 * df2dx4;

                h(1,0) = h(1,0) + 12.0E+00 * pow(f1,2) * df1dx2 * df1dx1 + 4.0E+00 * pow(f2,2) * df1dx2 * df1dx1;
                h(1,1) = h(1,1) + 12.0E+00 * pow(f1,2) * df1dx2 * df1dx2 + 4.0E+00 * pow(f2,2) * df1dx2 * df1dx1;
                h(1,2) = h(1,2) + 8.0E+00 * f1 * f2 * df1dx2 * df2dx3;
                h(1,3) = h(1,3) + 8.0E+00 * f1 * f2 * df1dx2 * df2dx4;

                h(2,0) = h(2,0) + 8.0E+00 * f1 * f2 * df2dx3 * df1dx1;
                h(2,1) = h(2,1) + 8.0E+00 * f1 * f2 * df2dx3 * df1dx2;
                h(2,2) = h(2,2) + 4.0E+00 * pow(f1,2) * df2dx3 * df2dx3 + 12.0E+00 * pow(f2,2) * df2dx3 * df2dx3;
                h(2,3) = h(2,3) + 4.0E+00 * pow(f1,2) * df2dx4 * df2dx3 + 12.0E+00 * pow(f2,2) * df2dx3 * df2dx4;

                h(3,0) = h(3,0) + 8.0E+00 * f1 * f2 * df2dx4 * df1dx1;
                h(3,1) = h(3,1) + 8.0E+00 * f1 * f2 * df2dx4 * df1dx2;
                h(3,2) = h(3,2) + 4.0E+00 * pow(f1,2) * df2dx3 * df2dx4 + 12.0E+00 * pow(f2,2) * df2dx4 * df2dx3;
                h(3,3) = h(3,3) + 4.0E+00 * pow(f1,2) * df2dx4 * df2dx4 + 12.0E+00 * pow(f2,2) * df2dx4 * df2dx4;

            }

            return make_symmetric(h);
        }

    // ----------------------------------------------------------------------------------------

        matrix<double,4,1> brown_start ()
        {
            matrix<double,4,1> x;
            x = 25.0E+00, 5.0E+00, -5.0E+00, -1.0E+00;
            return x;
        }

    // ----------------------------------------------------------------------------------------

        matrix<double,4,1> brown_solution ()
        {
            matrix<double,4,1> x;
            // solution from original documentation.
            //x = -11.5844E+00, 13.1999E+00, -0.406200E+00, 0.240998E+00;
            x = -11.594439905669450042, 13.203630051593080452, -0.40343948856573402795, 0.23677877338218666914;
            return x;
        }

    // ----------------------------------------------------------------------------------------

    }
}


