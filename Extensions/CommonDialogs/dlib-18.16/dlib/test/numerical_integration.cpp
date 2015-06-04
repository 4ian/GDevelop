// Copyright (C) 2013 Steve Taylor (steve98654@gmail.com)
// License: Boost Software License   See LICENSE.txt for the full license.

// This function test battery is given in:
//
// Test functions taken from Pedro Gonnet's dissertation at ETH: 
// Adaptive Quadrature Re-Revisited
// http://e-collection.library.ethz.ch/eserv/eth:65/eth-65-02.pdf

#include <math.h>
#include <dlib/matrix.h>
#include <dlib/numeric_constants.h>
#include <dlib/numerical_integration.h>
#include "tester.h"

namespace  
{
    using namespace test;
    using namespace dlib;
    using namespace std;

    logger dlog("test.numerical_integration");

    class numerical_integration_tester : public tester
    {
    public:
        numerical_integration_tester (
        ) :
            tester ("test_numerical_integration",
                    "Runs tests on the numerical integration function.",
                    0
            )
        {}
        
        void perform_test()
        {

            dlog <<dlib::LINFO << "Testing integrate_function_adapt_simpson";

            matrix<double,23,1> m;
            double tol = 1e-10;
            double eps = 1e-8;

            m(0) = integrate_function_adapt_simp(&gg1, 0.0, 1.0, tol);
            m(1) = integrate_function_adapt_simp(&gg2, 0.0, 1.0, tol);
            m(2) = integrate_function_adapt_simp(&gg3, 0.0, 1.0, tol);
            m(3) = integrate_function_adapt_simp(&gg4, 0.0, 1.0, tol);
            m(4) = integrate_function_adapt_simp(&gg5, -1.0, 1.0, tol);
            m(5) = integrate_function_adapt_simp(&gg6, 0.0, 1.0, tol);
            m(6) = integrate_function_adapt_simp(&gg7, 0.0, 1.0, tol);
            m(7) = integrate_function_adapt_simp(&gg8, 0.0, 1.0, tol);
            m(8) = integrate_function_adapt_simp(&gg9, 0.0, 1.0, tol);
            m(9) = integrate_function_adapt_simp(&gg10, 0.0, 1.0, tol);
            m(10) = integrate_function_adapt_simp(&gg11, 0.0, 1.0, tol);
            m(11) = integrate_function_adapt_simp(&gg12, 1e-6, 1.0, tol);
            m(12) = integrate_function_adapt_simp(&gg13, 0.0, 10.0, tol);
            m(13) = integrate_function_adapt_simp(&gg14, 0.0, 10.0, tol);
            m(14) = integrate_function_adapt_simp(&gg15, 0.0, 10.0, tol);
            m(15) = integrate_function_adapt_simp(&gg16, 0.01, 1.0, tol);
            m(16) = integrate_function_adapt_simp(&gg17, 0.0, pi, tol);
            m(17) = integrate_function_adapt_simp(&gg18, 0.0, 1.0, tol);
            m(18) = integrate_function_adapt_simp(&gg19, -1.0, 1.0, tol);
            m(19) = integrate_function_adapt_simp(&gg20, 0.0, 1.0, tol);
            m(20) = integrate_function_adapt_simp(&gg21, 0.0, 1.0, tol);
            m(21) = integrate_function_adapt_simp(&gg22, 0.0, 5.0, tol);

            // Here we compare the approximated integrals against 
            // highly accurate approximations generated either from 
            // the exact integral values or Mathematica's NIntegrate 
            // function using a working precision of 20. 

            DLIB_TEST(abs(m(0) - 1.7182818284590452354) < 1e-11);
            DLIB_TEST(abs(m(1) - 0.7000000000000000000) < eps);
            DLIB_TEST(abs(m(2) - 0.6666666666666666667) < eps);
            DLIB_TEST(abs(m(3) - 0.2397141133444008336) < eps);
            DLIB_TEST(abs(m(4) - 1.5822329637296729331) < 1e-11);
            DLIB_TEST(abs(m(5) - 0.4000000000000000000) < eps);
            DLIB_TEST(abs(m(6) - 2.0000000000000000000) < 1e-4);
            DLIB_TEST(abs(m(7) - 0.8669729873399110375) < eps);
            DLIB_TEST(abs(m(8) - 1.1547005383792515290) < eps);
            DLIB_TEST(abs(m(9) - 0.6931471805599453094) < eps);
            DLIB_TEST(abs(m(10) - 0.3798854930417224753) < eps);
            DLIB_TEST(abs(m(11) - 0.7775036341124982763) < eps);
            DLIB_TEST(abs(m(12) - 0.5000000000000000000) < eps);
            DLIB_TEST(abs(m(13) - 1.0000000000000000000) < eps);
            DLIB_TEST(abs(m(14) - 0.4993633810764567446) < eps);
            DLIB_TEST(abs(m(15) - 0.1121393035410217   ) < eps);
            DLIB_TEST(abs(m(16) - 0.2910187828600526985) < eps);
            DLIB_TEST(abs(m(17) + 0.4342944819032518276) < 1e-5);
            DLIB_TEST(abs(m(18) - 1.56439644406905     ) < eps);
            DLIB_TEST(abs(m(19) - 0.1634949430186372261) < eps);
            DLIB_TEST(abs(m(20) - 0.0134924856494677726) < eps);
        }

        static double gg1(double x)
        {
            return pow(e,x);
        }
        
        static double gg2(double x)
        {
            if(x > 0.3)
            {
                return 1.0;
            }
            else
            {
                return 0;
            }
        }

        static double gg3(double x)
        {
            return pow(x,0.5);
        }

        static double gg4(double x)
        {
            return 23.0/25.0*cosh(x)-cos(x);
        }

        static double gg5(double x)
        {
            return 1/(pow(x,4) + pow(x,2) + 0.9);
        }

        static double gg6(double x)    
        {
            return pow(x,1.5);
        }
    
        static double gg7(double x)
        {
            return pow(x,-0.5);
        }

        static double gg8(double x)
        {
            return 1/(1 + pow(x,4));
        }

        static double gg9(double x)
        {
            return 2/(2 + sin(10*pi*x));
        }
    
        static double gg10(double x)
        {
            return 1/(1+x);
        }

        static double gg11(double x)
        {
            return 1.0/(1 + pow(e,x));
        }

        static double gg12(double x)
        {
            return x/(pow(e,x)-1.0);
        }

        static double gg13(double x)
        {
            return sqrt(50.0)*pow(e,-50.0*pi*x*x);
        }

        static double gg14(double x)
        {
            return 25.0*pow(e,-25.0*x);
        }

        static double gg15(double x)
        {
            return 50.0/(pi*(2500.0*x*x+1));
        }

        static double gg16(double x)
        {
            return 50.0*pow((sin(50.0*pi*x)/(50.0*pi*x)),2);
        }

        static double gg17(double x)
        {
            return cos(cos(x)+3*sin(x)+2*cos(2*x)+3*cos(3*x));
        }

        static double gg18(double x)
        {
            return log10(x);
        }

        static double gg19(double x)
        {
            return 1/(1.005+x*x);
        }

        static double gg20(double x)
        {
            return 1/cosh(20.0*(x-1.0/5.0)) + 1/cosh(400.0*(x-2.0/5.0)) 
                + 1/cosh(8000.0*(x-3.0/5.0));
        }

        static double gg21(double x)
        {
            return 1.0/(1.0+(230.0*x-30.0)*(230.0*x-30.0));
        }

        static double gg22(double x)
        {
            if(x < 1)
            {
                return (x + 1.0);
            }
            else if(x >= 1 && x <= 3)
            {
                return (3.0 - x);
            }
            else
            {
                return 2.0;
            }
        }

     };

    numerical_integration_tester a;
}

