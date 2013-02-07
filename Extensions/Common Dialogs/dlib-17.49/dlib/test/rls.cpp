// Copyright (C) 2012  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.


#include <sstream>
#include <string>
#include <cstdlib>
#include <ctime>
#include <cmath>
#include <dlib/svm.h>

#include "tester.h"

namespace  
{

    using namespace test;
    using namespace dlib;
    using namespace std;

    logger dlog("test.rls");


    void test_rls()
    {
        dlib::rand rnd;

        running_stats<double> rs1, rs2, rs3, rs4, rs5;

        for (int k = 0; k < 2; ++k)
        {
            for (long num_vars = 1; num_vars < 4; ++num_vars)
            {
                print_spinner();
                for (long size = 1; size < 300; ++size)
                {
                    {
                        matrix<double> X = randm(size,num_vars,rnd);
                        matrix<double,0,1> Y = randm(size,1,rnd);


                        const double C = 1000;
                        const double forget_factor = 1.0;
                        rls r(forget_factor, C);
                        for (long i = 0; i < Y.size(); ++i)
                        {
                            r.train(trans(rowm(X,i)), Y(i));
                        }


                        matrix<double> w = pinv(1.0/C*identity_matrix<double>(X.nc()) + trans(X)*X)*trans(X)*Y;

                        rs1.add(length(r.get_w() - w));
                    }

                    {
                        matrix<double> X = randm(size,num_vars,rnd);
                        matrix<double,0,1> Y = randm(size,1,rnd);

                        matrix<double,0,1> G(size,1);

                        const double C = 10000;
                        const double forget_factor = 0.8;
                        rls r(forget_factor, C);
                        for (long i = 0; i < Y.size(); ++i)
                        {
                            r.train(trans(rowm(X,i)), Y(i));

                            G(i) = std::pow(forget_factor, i/2.0);
                        }

                        G = flipud(G);

                        X = diagm(G)*X;
                        Y = diagm(G)*Y;

                        matrix<double> w = pinv(1.0/C*identity_matrix<double>(X.nc()) + trans(X)*X)*trans(X)*Y;

                        rs5.add(length(r.get_w() - w));
                    }

                    {
                        matrix<double> X = randm(size,num_vars,rnd);
                        matrix<double> Y = colm(X,0)*10;


                        const double C = 1000000;
                        const double forget_factor = 1.0;
                        rls r(forget_factor, C);
                        for (long i = 0; i < Y.size(); ++i)
                        {
                            r.train(trans(rowm(X,i)), Y(i));
                        }


                        matrix<double> w = pinv(1.0/C*identity_matrix<double>(X.nc()) + trans(X)*X)*trans(X)*Y;

                        rs2.add(length(r.get_w() - w));
                    }

                    {
                        matrix<double> X = join_rows(randm(size,num_vars,rnd)-0.5, ones_matrix<double>(size,1));
                        matrix<double> Y = uniform_matrix<double>(size,1,10);


                        const double C = 1e7;
                        const double forget_factor = 1.0;

                        matrix<double> w = pinv(1.0/C*identity_matrix<double>(X.nc()) + trans(X)*X)*trans(X)*Y;

                        rls r(forget_factor, C);
                        for (long i = 0; i < Y.size(); ++i)
                        {
                            r.train(trans(rowm(X,i)), Y(i));
                            rs3.add(std::abs(r(trans(rowm(X,i))) - 10));
                        }


                    }
                    {
                        matrix<double> X = randm(size,num_vars,rnd)-0.5;
                        matrix<double> Y = colm(X,0)*10;


                        const double C = 1e6;
                        const double forget_factor = 0.7;


                        rls r(forget_factor, C);
                        DLIB_TEST(std::abs(r.get_c() - C) < 1e-10);
                        DLIB_TEST(std::abs(r.get_forget_factor() - forget_factor) < 1e-15);
                        DLIB_TEST(r.get_w().size() == 0);

                        for (long i = 0; i < Y.size(); ++i)
                        {
                            r.train(trans(rowm(X,i)), Y(i));
                            rs4.add(std::abs(r(trans(rowm(X,i))) - X(i,0)*10));
                        }

                        DLIB_TEST(r.get_w().size() == num_vars);

                        decision_function<linear_kernel<matrix<double,0,1> > > df = r.get_decision_function();
                        DLIB_TEST(std::abs(df(trans(rowm(X,0))) - r(trans(rowm(X,0)))) < 1e-15);
                    }
                }
            } 
        }

        dlog << LINFO << "rs1.mean(): " << rs1.mean();
        dlog << LINFO << "rs2.mean(): " << rs2.mean();
        dlog << LINFO << "rs3.mean(): " << rs3.mean();
        dlog << LINFO << "rs4.mean(): " << rs4.mean();
        dlog << LINFO << "rs5.mean(): " << rs5.mean();
        dlog << LINFO << "rs1.max(): " << rs1.max();
        dlog << LINFO << "rs2.max(): " << rs2.max();
        dlog << LINFO << "rs3.max(): " << rs3.max();
        dlog << LINFO << "rs4.max(): " << rs4.max();
        dlog << LINFO << "rs5.max(): " << rs5.max();

        DLIB_TEST_MSG(rs1.mean() < 1e-10, rs1.mean());
        DLIB_TEST_MSG(rs2.mean() < 1e-9, rs2.mean());
        DLIB_TEST_MSG(rs3.mean() < 1e-6, rs3.mean());
        DLIB_TEST_MSG(rs4.mean() < 1e-6, rs4.mean());
        DLIB_TEST_MSG(rs5.mean() < 1e-3, rs5.mean());

        DLIB_TEST_MSG(rs1.max() < 1e-10, rs1.max());
        DLIB_TEST_MSG(rs2.max() < 1e-6,  rs2.max());
        DLIB_TEST_MSG(rs3.max() < 0.001, rs3.max());
        DLIB_TEST_MSG(rs4.max() < 0.01,  rs4.max());
        DLIB_TEST_MSG(rs5.max() < 0.1,  rs5.max());
        
    }




    class rls_tester : public tester
    {
    public:
        rls_tester (
        ) :
            tester ("test_rls",
                    "Runs tests on the rls component.")
        {}

        void perform_test (
        )
        {
            test_rls();
        }
    } a;

}



