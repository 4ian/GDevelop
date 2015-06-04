// Copyright (C) 2010  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.


#include <dlib/optimization.h>
#include "optimization_test_functions.h"
#include <sstream>
#include <string>
#include <cstdlib>
#include <ctime>
#include <vector>
#include "../rand.h"

#include "tester.h"


namespace  
{

    using namespace test;
    using namespace dlib;
    using namespace std;
    using namespace dlib::test_functions;

    logger dlog("test.least_squares");

// ----------------------------------------------------------------------------------------

    void test_with_chebyquad()
    {
        print_spinner();
        {
            matrix<double,0,1> ch;

            ch = chebyquad_start(2);

            solve_least_squares(objective_delta_stop_strategy(1e-13, 80),
                                chebyquad_residual,
                                derivative(chebyquad_residual),
                                range(0,ch.size()-1),
                                ch);

            dlog << LINFO << "chebyquad 2 obj: " << chebyquad(ch);
            dlog << LINFO << "chebyquad 2 der: " << length(chebyquad_derivative(ch));
            dlog << LINFO << "chebyquad 2 error: " << length(ch - chebyquad_solution(2));

            DLIB_TEST(length(ch - chebyquad_solution(2)) < 1e-5);

        }
        {
            matrix<double,0,1> ch;

            ch = chebyquad_start(2);

            solve_least_squares_lm(objective_delta_stop_strategy(1e-13, 80),
                                chebyquad_residual,
                                derivative(chebyquad_residual),
                                range(0,ch.size()-1),
                                ch);

            dlog << LINFO << "LM chebyquad 2 obj: " << chebyquad(ch);
            dlog << LINFO << "LM chebyquad 2 der: " << length(chebyquad_derivative(ch));
            dlog << LINFO << "LM chebyquad 2 error: " << length(ch - chebyquad_solution(2));

            DLIB_TEST(length(ch - chebyquad_solution(2)) < 1e-5);

        }

        print_spinner();
        {
            matrix<double,2,1> ch;

            ch = chebyquad_start(2);

            solve_least_squares(objective_delta_stop_strategy(1e-13, 80),
                                chebyquad_residual,
                                derivative(chebyquad_residual),
                                range(0,ch.size()-1),
                                ch);

            dlog << LINFO << "chebyquad 2 obj: " << chebyquad(ch);
            dlog << LINFO << "chebyquad 2 der: " << length(chebyquad_derivative(ch));
            dlog << LINFO << "chebyquad 2 error: " << length(ch - chebyquad_solution(2));

            DLIB_TEST(length(ch - chebyquad_solution(2)) < 1e-5);

        }
        print_spinner();
        {
            matrix<double,2,1> ch;

            ch = chebyquad_start(2);

            solve_least_squares_lm(objective_delta_stop_strategy(1e-13, 80),
                                chebyquad_residual,
                                derivative(chebyquad_residual),
                                range(0,ch.size()-1),
                                ch);

            dlog << LINFO << "LM chebyquad 2 obj: " << chebyquad(ch);
            dlog << LINFO << "LM chebyquad 2 der: " << length(chebyquad_derivative(ch));
            dlog << LINFO << "LM chebyquad 2 error: " << length(ch - chebyquad_solution(2));

            DLIB_TEST(length(ch - chebyquad_solution(2)) < 1e-5);

        }

        print_spinner();
        {
            matrix<double,0,1> ch;

            ch = chebyquad_start(4);

            solve_least_squares(objective_delta_stop_strategy(1e-13, 80),
                                chebyquad_residual,
                                derivative(chebyquad_residual),
                                range(0,ch.size()-1),
                                ch);

            dlog << LINFO << "chebyquad 4 obj: " << chebyquad(ch);
            dlog << LINFO << "chebyquad 4 der: " << length(chebyquad_derivative(ch));
            dlog << LINFO << "chebyquad 4 error: " << length(ch - chebyquad_solution(4));

            DLIB_TEST(length(ch - chebyquad_solution(4)) < 1e-5);

        }
        print_spinner();
        {
            matrix<double,0,1> ch;

            ch = chebyquad_start(4);

            solve_least_squares_lm(objective_delta_stop_strategy(1e-13, 80),
                                chebyquad_residual,
                                derivative(chebyquad_residual),
                                range(0,ch.size()-1),
                                ch);

            dlog << LINFO << "LM chebyquad 4 obj: " << chebyquad(ch);
            dlog << LINFO << "LM chebyquad 4 der: " << length(chebyquad_derivative(ch));
            dlog << LINFO << "LM chebyquad 4 error: " << length(ch - chebyquad_solution(4));

            DLIB_TEST(length(ch - chebyquad_solution(4)) < 1e-5);

        }


        print_spinner();
        {
            matrix<double,0,1> ch;

            ch = chebyquad_start(6);

            solve_least_squares(objective_delta_stop_strategy(1e-13, 80),
                                chebyquad_residual,
                                derivative(chebyquad_residual),
                                range(0,ch.size()-1),
                                ch);

            dlog << LINFO << "chebyquad 6 obj: " << chebyquad(ch);
            dlog << LINFO << "chebyquad 6 der: " << length(chebyquad_derivative(ch));
            dlog << LINFO << "chebyquad 6 error: " << length(ch - chebyquad_solution(6));

            // the ch variable contains a permutation of what is in chebyquad_solution(6).
            // Apparently there is more than one minimum?.  Just check that the objective 
            // goes to zero.
            DLIB_TEST(chebyquad(ch) < 1e-10);

        }
        print_spinner();
        {
            matrix<double,0,1> ch;

            ch = chebyquad_start(6);

            solve_least_squares_lm(objective_delta_stop_strategy(1e-13, 80),
                                chebyquad_residual,
                                derivative(chebyquad_residual),
                                range(0,ch.size()-1),
                                ch);

            dlog << LINFO << "LM chebyquad 6 obj: " << chebyquad(ch);
            dlog << LINFO << "LM chebyquad 6 der: " << length(chebyquad_derivative(ch));
            dlog << LINFO << "LM chebyquad 6 error: " << length(ch - chebyquad_solution(6));

            DLIB_TEST(chebyquad(ch) < 1e-10);

        }


        print_spinner();
        {
            matrix<double,0,1> ch;

            ch = chebyquad_start(8);

            solve_least_squares(objective_delta_stop_strategy(1e-13, 80),
                                chebyquad_residual,
                                derivative(chebyquad_residual),
                                range(0,ch.size()-1),
                                ch);

            dlog << LINFO << "chebyquad 8 obj: " << chebyquad(ch);
            dlog << LINFO << "chebyquad 8 der: " << length(chebyquad_derivative(ch));
            dlog << LINFO << "chebyquad 8 error: " << length(ch - chebyquad_solution(8));

            DLIB_TEST(length(ch - chebyquad_solution(8)) < 1e-5);

        }
        print_spinner();
        {
            matrix<double,0,1> ch;

            ch = chebyquad_start(8);

            solve_least_squares_lm(objective_delta_stop_strategy(1e-13, 80),
                                chebyquad_residual,
                                derivative(chebyquad_residual),
                                range(0,ch.size()-1),
                                ch);

            dlog << LINFO << "LM chebyquad 8 obj: " << chebyquad(ch);
            dlog << LINFO << "LM chebyquad 8 der: " << length(chebyquad_derivative(ch));
            dlog << LINFO << "LM chebyquad 8 error: " << length(ch - chebyquad_solution(8));

            DLIB_TEST(length(ch - chebyquad_solution(8)) < 1e-5);

        }
    }

// ----------------------------------------------------------------------------------------

    void test_with_brown()
    {
        print_spinner();
        {
            matrix<double,4,1> ch;

            ch = brown_start();

            solve_least_squares(objective_delta_stop_strategy(1e-13, 300),
                                brown_residual,
                                derivative(brown_residual),
                                range(1,20),
                                ch);

            dlog << LINFO << "brown obj: " << brown(ch);
            dlog << LINFO << "brown der: " << length(brown_derivative(ch));
            dlog << LINFO << "brown error: " << length(ch - brown_solution());

            DLIB_TEST_MSG(length(ch - brown_solution()) < 1e-5,length(ch - brown_solution()) );

        }
        print_spinner();
        {
            matrix<double,4,1> ch;

            ch = brown_start();

            solve_least_squares_lm(objective_delta_stop_strategy(1e-13, 80),
                                brown_residual,
                                derivative(brown_residual),
                                range(1,20),
                                ch);

            dlog << LINFO << "LM brown obj: " << brown(ch);
            dlog << LINFO << "LM brown der: " << length(brown_derivative(ch));
            dlog << LINFO << "LM brown error: " << length(ch - brown_solution());

            DLIB_TEST(length(ch - brown_solution()) < 1e-5);

        }
    }

// ----------------------------------------------------------------------------------------

// These functions are declared here because wrapping the real rosen functions in this
// way avoids triggering a bug in visual studio 2005 which prevents this code from compiling.
    double rosen_residual_double (int i, const matrix<double,2,1>& m)
    { return rosen_residual(i,m); }
    float rosen_residual_float (int i, const matrix<float,2,1>& m)
    { return rosen_residual(i,m); }

    matrix<double,2,1> rosen_residual_derivative_double (int i, const matrix<double,2,1>& m)
    { return rosen_residual_derivative(i,m); }
    matrix<float,2,1> rosen_residual_derivative_float (int i, const matrix<float,2,1>& m)
    { return rosen_residual_derivative(i,m); }

    double rosen_big_residual_double (int i, const matrix<double,2,1>& m)
    { return rosen_big_residual(i,m); }

// ----------------------------------------------------------------------------------------

    void test_with_rosen()
    {

        print_spinner();
        {
            matrix<double,2,1> ch;

            ch = rosen_start<double>();

            solve_least_squares(objective_delta_stop_strategy(1e-13, 80),
                                rosen_residual_double,
                                rosen_residual_derivative_double,
                                range(1,20),
                                ch);

            dlog << LINFO << "rosen obj: " << rosen(ch);
            dlog << LINFO << "rosen error: " << length(ch - rosen_solution<double>());

            DLIB_TEST(length(ch - rosen_solution<double>()) < 1e-5);

        }
        print_spinner();
        {
            matrix<double,2,1> ch;

            ch = rosen_start<double>();

            solve_least_squares_lm(objective_delta_stop_strategy(1e-13, 80),
                                rosen_residual_double,
                                rosen_residual_derivative_double,
                                range(1,20),
                                ch);

            dlog << LINFO << "lm rosen obj: " << rosen(ch);
            dlog << LINFO << "lm rosen error: " << length(ch - rosen_solution<double>());

            DLIB_TEST(length(ch - rosen_solution<double>()) < 1e-5);

        }



        print_spinner();
        {
            matrix<double,2,1> ch;

            ch = rosen_start<double>();

            solve_least_squares(objective_delta_stop_strategy(1e-13, 80),
                                rosen_residual_double,
                                derivative(rosen_residual_double),
                                range(1,20),
                                ch);

            dlog << LINFO << "rosen obj: " << rosen(ch);
            dlog << LINFO << "rosen error: " << length(ch - rosen_solution<double>());

            DLIB_TEST(length(ch - rosen_solution<double>()) < 1e-5);

        }
        print_spinner();
        {
            matrix<float,2,1> ch;

            ch = rosen_start<float>();

            solve_least_squares(objective_delta_stop_strategy(1e-13, 80),
                                rosen_residual_float,
                                derivative(rosen_residual_float),
                                range(1,20),
                                ch);

            dlog << LINFO << "float rosen obj: " << rosen(ch);
            dlog << LINFO << "float rosen error: " << length(ch - rosen_solution<float>());

            DLIB_TEST(length(ch - rosen_solution<float>()) < 1e-5);

        }
        print_spinner();
        {
            matrix<float,2,1> ch;

            ch = rosen_start<float>();

            solve_least_squares_lm(objective_delta_stop_strategy(1e-13, 80),
                                rosen_residual_float,
                                derivative(rosen_residual_float),
                                range(1,20),
                                ch);

            dlog << LINFO << "LM float rosen obj: " << rosen(ch);
            dlog << LINFO << "LM float rosen error: " << length(ch - rosen_solution<float>());

            DLIB_TEST(length(ch - rosen_solution<float>()) < 1e-5);

        }
        print_spinner();
        {
            matrix<double,2,1> ch;

            ch = rosen_start<double>();

            solve_least_squares_lm(objective_delta_stop_strategy(1e-13, 80),
                                rosen_residual_double,
                                derivative(rosen_residual_double),
                                range(1,20),
                                ch);

            dlog << LINFO << "LM rosen obj: " << rosen(ch);
            dlog << LINFO << "LM rosen error: " << length(ch - rosen_solution<double>());

            DLIB_TEST(length(ch - rosen_solution<double>()) < 1e-5);

        }
        print_spinner();
        {
            matrix<double,2,1> ch;

            ch = rosen_big_start<double>();

            solve_least_squares(objective_delta_stop_strategy(1e-13, 80),
                                rosen_big_residual_double,
                                derivative(rosen_big_residual_double),
                                range(1,2),
                                ch);

            dlog << LINFO << "rosen big obj: " << rosen_big(ch);
            dlog << LINFO << "rosen big error: " << length(ch - rosen_big_solution<double>());

            DLIB_TEST(length(ch - rosen_big_solution<double>()) < 1e-5);

        }
    }

// ----------------------------------------------------------------------------------------

    class optimization_tester : public tester
    {
    public:
        optimization_tester (
        ) :
            tester ("test_least_squares",
                    "Runs tests on the least squares optimization component.")
        {}

        void perform_test (
        )
        {
            test_with_chebyquad();
            test_with_brown();
            test_with_rosen();
        }
    } a;

}


