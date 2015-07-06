// Copyright (C) 2010  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.


#include <dlib/optimization.h>
#include <sstream>
#include <string>
#include <cstdlib>
#include <ctime>
#include <vector>
#include <dlib/rand.h>
#include <dlib/string.h>
#include <dlib/statistics.h>

#include "tester.h"


namespace  
{

    using namespace test;
    using namespace dlib;
    using namespace std;

    logger dlog("test.opt_qp_solver");

// ----------------------------------------------------------------------------------------

    class test_smo
    {
    public:
        double penalty;
        double C;

        double operator() (
            const matrix<double,0,1>& alpha
        ) const
        {

            double obj =  0.5* trans(alpha)*Q*alpha - trans(alpha)*b;
            double c1 = pow(sum(alpha)-C,2);
            double c2 = sum(pow(pointwise_multiply(alpha, alpha<0), 2));

            obj += penalty*(c1 + c2);

            return obj;
        }

        matrix<double> Q, b;
    };

// ----------------------------------------------------------------------------------------

    class test_smo_derivative
    {
    public:
        double penalty;
        double C;

        matrix<double,0,1> operator() (
            const matrix<double,0,1>& alpha
        ) const
        {

            matrix<double,0,1> obj =  Q*alpha - b;
            matrix<double,0,1> c1 = uniform_matrix<double>(alpha.size(),1, 2*(sum(alpha)-C));
            matrix<double,0,1> c2 = 2*pointwise_multiply(alpha, alpha<0);
            
            return obj + penalty*(c1 + c2);
        }

        matrix<double> Q, b;
    };

// ----------------------------------------------------------------------------------------

    double compute_objective_value (
        const matrix<double,0,1>& w,
        const matrix<double>& A,
        const matrix<double,0,1>& b,
        const double C
    )
    {
        return 0.5*dot(w,w) + C*max(trans(A)*w + b);
    }

// ----------------------------------------------------------------------------------------

    void test_qp4_test1()
    {
        matrix<double> A(3,2);
        A = 1,2,
        -3,1,
        6,7;

        matrix<double,0,1> b(2);
        b = 1,
        2;

        const double C = 2;

        matrix<double,0,1> alpha(2), true_alpha(2);
        alpha = C/2, C/2;

        solve_qp4_using_smo(A, tmp(trans(A)*A), b, alpha, 1e-9, 800);
        matrix<double,0,1> w = lowerbound(-A*alpha, 0);

        dlog << LINFO << "*******************************************************";

        dlog << LINFO << "w:     " << trans(w);

        dlog << LINFO << "computed obj:      "<< compute_objective_value(w,A,b,C);
        w = 0;
        dlog << LINFO << "with true w obj:   "<< compute_objective_value(w,A,b,C);

        dlog << LINFO << "alpha:      " << trans(alpha);
        true_alpha = 0, 2;
        dlog << LINFO << "true alpha: "<< trans(true_alpha);

        dlog << LINFO << "alpha error: "<< max(abs(alpha-true_alpha));
        DLIB_TEST(max(abs(alpha-true_alpha)) < 1e-9);
    }

// ----------------------------------------------------------------------------------------

    void test_qp4_test2()
    {
        matrix<double> A(3,2);
        A = 1,2,
        3,-1,
        6,7;

        matrix<double,0,1> b(2);
        b = 1,
        2;

        const double C = 2;

        matrix<double,0,1> alpha(2), true_alpha(2);
        alpha = C/2, C/2;

        solve_qp4_using_smo(A, tmp(trans(A)*A), b, alpha, 1e-9, 800);
        matrix<double,0,1> w = lowerbound(-A*alpha, 0);

        dlog << LINFO << "*******************************************************";

        dlog << LINFO << "w:     " << trans(w);

        dlog << LINFO << "computed obj:      "<< compute_objective_value(w,A,b,C);
        w = 0, 0.25, 0;
        dlog << LINFO << "with true w obj:   "<< compute_objective_value(w,A,b,C);

        dlog << LINFO << "alpha:      " << trans(alpha);
        true_alpha = 0.43750, 1.56250;
        dlog << LINFO << "true alpha: "<< trans(true_alpha);

        dlog << LINFO << "alpha error: "<< max(abs(alpha-true_alpha));
        DLIB_TEST(max(abs(alpha-true_alpha)) < 1e-9);
    }

// ----------------------------------------------------------------------------------------

    void test_qp4_test3()
    {
        matrix<double> A(3,2);
        A = 1,2,
        -3,-1,
        6,7;

        matrix<double,0,1> b(2);
        b = 1,
        2;

        const double C = 2;

        matrix<double,0,1> alpha(2), true_alpha(2);
        alpha = C/2, C/2;

        solve_qp4_using_smo(A, tmp(trans(A)*A), b, alpha, 1e-9, 800);
        matrix<double,0,1> w = lowerbound(-A*alpha, 0);

        dlog << LINFO << "*******************************************************";

        dlog << LINFO << "w:     " << trans(w);

        dlog << LINFO << "computed obj:      "<< compute_objective_value(w,A,b,C);
        w = 0, 2, 0;
        dlog << LINFO << "with true w obj:   "<< compute_objective_value(w,A,b,C);

        dlog << LINFO << "alpha:      " << trans(alpha);
        true_alpha = 0, 2;
        dlog << LINFO << "true alpha: "<< trans(true_alpha);

        dlog << LINFO << "alpha error: "<< max(abs(alpha-true_alpha));
        DLIB_TEST(max(abs(alpha-true_alpha)) < 1e-9);
    }

// ----------------------------------------------------------------------------------------

    void test_qp4_test5()
    {
        matrix<double> A(3,3);
        A = 1,2,4,
        3,1,6,
        6,7,-2;

        matrix<double,0,1> b(3);
        b = 1,
        2,
        3;

        const double C = 2;

        matrix<double,0,1> alpha(3), true_alpha(3);
        alpha = C/2, C/2, 0;

        solve_qp4_using_smo(A, tmp(trans(A)*A), b, alpha, 1e-9, 800);
        matrix<double,0,1> w = lowerbound(-A*alpha, 0);


        dlog << LINFO << "*******************************************************";

        dlog << LINFO << "w:     " << trans(w);

        dlog << LINFO << "computed obj:      "<< compute_objective_value(w,A,b,C);
        w = 0, 0, 0.11111111111111111111;
        dlog << LINFO << "with true w obj:   "<< compute_objective_value(w,A,b,C);

        dlog << LINFO << "alpha:      " << trans(alpha);
        true_alpha = 0, 0.432098765432099, 1.567901234567901;
        dlog << LINFO << "true alpha: "<< trans(true_alpha);

        dlog << LINFO << "alpha error: "<< max(abs(alpha-true_alpha));
        DLIB_TEST(max(abs(alpha-true_alpha)) < 1e-9);
    }

// ----------------------------------------------------------------------------------------

    void test_qp4_test4()
    {
        matrix<double> A(3,2);
        A = 1,2,
        3,1,
        6,7;

        matrix<double,0,1> b(2);
        b = 1,
        2;

        const double C = 2;

        matrix<double,0,1> alpha(2), true_alpha(2);
        alpha = C/2, C/2;

        solve_qp4_using_smo(A, tmp(trans(A)*A), b, alpha, 1e-9, 800);
        matrix<double,0,1> w = lowerbound(-A*alpha, 0);

        dlog << LINFO << "*******************************************************";

        dlog << LINFO << "w:     " << trans(w);

        dlog << LINFO << "computed obj:      "<< compute_objective_value(w,A,b,C);
        w = 0, 0, 0;
        dlog << LINFO << "with true w obj:   "<< compute_objective_value(w,A,b,C);

        dlog << LINFO << "alpha:      " << trans(alpha);
        true_alpha = 0, 2;
        dlog << LINFO << "true alpha: "<< trans(true_alpha);

        dlog << LINFO << "alpha error: "<< max(abs(alpha-true_alpha));
        DLIB_TEST(max(abs(alpha-true_alpha)) < 1e-9);
    }

    void test_qp4_test6()
    {
        matrix<double> A(3,3);
        A = 1,2,4,
        3,1,6,
        6,7,-2;

        matrix<double,0,1> b(3);
        b = -1,
        -2,
        -3;

        const double C = 2;

        matrix<double,0,1> alpha(3), true_alpha(3);
        alpha = C/2, C/2, 0;

        solve_qp4_using_smo(A, tmp(trans(A)*A), b, alpha, 1e-9, 800);
        matrix<double,0,1> w = lowerbound(-A*alpha, 0);

        dlog << LINFO << "*******************************************************";

        dlog << LINFO << "w:     " << trans(w);

        dlog << LINFO << "computed obj:      "<< compute_objective_value(w,A,b,C);
        w = 0, 0, 0;
        dlog << LINFO << "with true w obj:   "<< compute_objective_value(w,A,b,C);

        dlog << LINFO << "alpha:      " << trans(alpha);
        true_alpha = 2, 0, 0;
        dlog << LINFO << "true alpha: "<< trans(true_alpha);

        dlog << LINFO << "alpha error: "<< max(abs(alpha-true_alpha));
        DLIB_TEST(max(abs(alpha-true_alpha)) < 1e-9);
    }

    void test_qp4_test7()
    {
        matrix<double> A(3,3);
        A = -1,2,4,
        -3,1,6,
        -6,7,-2;

        matrix<double,0,1> b(3);
        b = -1,
        -2,
        3;

        matrix<double> Q(3,3);
        Q = 4,-5,6,
        1,-4,2,
        -9,-4,5;
        Q = Q*trans(Q);

        const double C = 2;

        matrix<double,0,1> alpha(3), true_alpha(3);
        alpha = C/2, C/2, 0;

        solve_qp4_using_smo(A, Q, b, alpha, 1e-9, 800);

        dlog << LINFO << "*******************************************************";

        dlog << LINFO << "alpha:      " << trans(alpha);
        true_alpha = 0, 2, 0;
        dlog << LINFO << "true alpha: "<< trans(true_alpha);

        dlog << LINFO << "alpha error: "<< max(abs(alpha-true_alpha));
        DLIB_TEST(max(abs(alpha-true_alpha)) < 1e-9);

    }

// ----------------------------------------------------------------------------------------

    void test_solve_qp4_using_smo()
    {
        test_qp4_test1();
        test_qp4_test2();
        test_qp4_test3();
        test_qp4_test4();
        test_qp4_test5();
        test_qp4_test6();
        test_qp4_test7();
    }

// ----------------------------------------------------------------------------------------

    class opt_qp_solver_tester : public tester
    {
        /*
            The idea here is just to solve the same problem with two different
            methods and check that they basically agree.  The SMO solver should be
            very accurate but for this problem the BFGS solver is relatively
            inaccurate.  So this test is really just a sanity check on the SMO
            solver.
        */
    public:
        opt_qp_solver_tester (
        ) :
            tester ("test_opt_qp_solver",
                    "Runs tests on the solve_qp_using_smo component.")
        {
            thetime = time(0);
        }

        time_t thetime;
        dlib::rand rnd;

        void perform_test(
        )
        {
            print_spinner();
            test_solve_qp4_using_smo();
            print_spinner();

            ++thetime;
            //dlog << LINFO << "time seed: " << thetime;
            //rnd.set_seed(cast_to_string(thetime));

            running_stats<double> rs;

            for (int i = 0; i < 40; ++i)
            {
                for (long dims = 1; dims < 6; ++dims)
                {
                    rs.add(do_the_test(dims, 1.0));
                }
            }

            for (int i = 0; i < 40; ++i)
            {
                for (long dims = 1; dims < 6; ++dims)
                {
                    rs.add(do_the_test(dims, 5.0));
                }
            }

            dlog << LINFO << "disagreement mean: " << rs.mean();
            dlog << LINFO << "disagreement stddev: " << rs.stddev();
            DLIB_TEST_MSG(rs.mean() < 0.001, rs.mean());
            DLIB_TEST_MSG(rs.stddev() < 0.001, rs.stddev());
        }

        double do_the_test (
            const long dims,
            double C
        )
        {
            print_spinner();
            dlog << LINFO << "dims: " << dims;
            dlog << LINFO << "testing with C == " << C;
            test_smo test;

            test.Q = randm(dims, dims, rnd);
            test.Q = trans(test.Q)*test.Q;
            test.b = randm(dims,1, rnd);
            test.C = C;

            test_smo_derivative der;
            der.Q = test.Q;
            der.b = test.b;
            der.C = test.C;


            matrix<double,0,1> x(dims), alpha(dims);


            test.penalty = 20000;
            der.penalty = test.penalty;

            alpha = C/alpha.size();
            x = alpha;

            const unsigned long max_iter = 400000;
            solve_qp_using_smo(test.Q, test.b, alpha, 0.00000001, max_iter);
            DLIB_TEST_MSG(abs(sum(alpha) - C) < 1e-13, abs(sum(alpha) - C) );
            dlog << LTRACE << "alpha: " << alpha;
            dlog << LINFO << "SMO: true objective: "<< 0.5*trans(alpha)*test.Q*alpha - trans(alpha)*test.b;


            double obj = find_min(bfgs_search_strategy(),
                                  objective_delta_stop_strategy(1e-13, 5000),
                                  test,
                                  der,
                                  x,
                                  -10);


            dlog << LINFO << "BFGS: objective: " << obj;
            dlog << LINFO << "BFGS: true objective: "<< 0.5*trans(x)*test.Q*x - trans(x)*test.b;
            dlog << LINFO << "sum(x): " << sum(x);
            dlog << LINFO << x;

            double disagreement = max(abs(x-alpha));
            dlog << LINFO << "Disagreement: " << disagreement;
            return disagreement;
        }
    } a;

}



