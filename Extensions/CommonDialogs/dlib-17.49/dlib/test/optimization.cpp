// Copyright (C) 2008  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.


#include <dlib/optimization.h>
#include <sstream>
#include <string>
#include <cstdlib>
#include <ctime>
#include <vector>
#include "../stl_checked.h"
#include "../array.h"
#include "../rand.h"

#include "tester.h"


namespace  
{

    using namespace test;
    using namespace dlib;
    using namespace std;

    logger dlog("test.optimization");

// ----------------------------------------------------------------------------------------

    bool approx_equal (
        double a,
        double b
    )
    {
        return std::abs(a - b) < 100*std::numeric_limits<double>::epsilon();
    }

// ----------------------------------------------------------------------------------------

    long total_count = 0;


    template <typename T>
    double apq ( const T& x)
    {
        DLIB_ASSERT(x.nr() > 1 && x.nc() == 1,"");
        COMPILE_TIME_ASSERT(is_matrix<T>::value);
        double temp = 0;
        for (long r = 0; r < x.nr(); ++r)
        {
            temp += (r+1)*x(r)*x(r);
        }

        ++total_count;

        return temp + 1/100.0*(x(0) + x(x.nr()-1))*(x(0) + x(x.nr()-1));
    }

    template <typename T>
    T der_apq ( const T& x)
    {
        DLIB_ASSERT(x.nr() > 1 && x.nc() == 1,"");
        COMPILE_TIME_ASSERT(is_matrix<T>::value);
        T temp(x.nr());
        for (long r = 0; r < x.nr(); ++r)
        {
            temp(r) = 2*(r+1)*x(r) ;
        }

        temp(0) += 1/50.0*(x(0) + x(x.nr()-1));
        temp(x.nr()-1) += 1/50.0*(x(0) + x(x.nr()-1));

        ++total_count;

        return temp;
    }

// ----------------------------------------------------------------------------------------

    // Rosenbrock's function.  minimum at (1,1)
    double rosen ( const matrix<double,2,1>& x)
    {
        ++total_count;
        return 100*pow(x(1) - x(0)*x(0),2) + pow(1 - x(0),2);
    }

    matrix<double,2,1> der_rosen ( const matrix<double,2,1>& x)
    {
        ++total_count;
        matrix<double,2,1> res;
        res(0) = -400*x(0)*(x(1)-x(0)*x(0)) - 2*(1-x(0));
        res(1) = 200*(x(1)-x(0)*x(0));
        return res;
    }

// ----------------------------------------------------------------------------------------

    // negative of Rosenbrock's function.  minimum at (1,1)
    double neg_rosen ( const matrix<double,2,1>& x)
    {
        ++total_count;
        return -(100*pow(x(1) - x(0)*x(0),2) + pow(1 - x(0),2));
    }

    matrix<double,2,1> der_neg_rosen ( const matrix<double,2,1>& x)
    {
        ++total_count;
        matrix<double,2,1> res;
        res(0) = -400*x(0)*(x(1)-x(0)*x(0)) - 2*(1-x(0));
        res(1) = 200*(x(1)-x(0)*x(0));
        return -res;
    }

// ----------------------------------------------------------------------------------------

    double simple ( const matrix<double,2,1>& x)
    {
        ++total_count;
        return 10*x(0)*x(0) + x(1)*x(1);
    }

    matrix<double,2,1> der_simple ( const matrix<double,2,1>& x)
    {
        ++total_count;
        matrix<double,2,1> res;
        res(0) = 20*x(0);
        res(1) = 2*x(1);
        return res;
    }

// ----------------------------------------------------------------------------------------

    double powell ( const matrix<double,4,1>& x)
    {
        ++total_count;
        return pow(x(0) + 10*x(1),2) +
            pow(std::sqrt(5.0)*(x(2) - x(3)),2) + 
            pow((x(1) - 2*x(2))*(x(1) - 2*x(2)),2) +
            pow(std::sqrt(10.0)*(x(0) - x(3))*(x(0) - x(3)),2);
    }

// ----------------------------------------------------------------------------------------

// a simple function with a minimum at zero
    double single_variable_function ( double x)
    {
        ++total_count;
        return 3*x*x + 5;
    }

// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------

    void test_apq (
        const matrix<double,0,1> p
    )
    {
        typedef matrix<double,0,1> T;
        const double eps = 1e-12;
        const double minf = -10;
        matrix<double,0,1> x(p.nr()), opt(p.nr());
        set_all_elements(opt, 0);
        double val = 0;

        if (p.size() < 20)
            dlog << LINFO << "testing with apq and the start point: " << trans(p);
        else
            dlog << LINFO << "testing with apq and a big vector with " << p.size() << " components.";

        // don't use bfgs on really large vectors
        if (p.size() < 20)
        {
            total_count = 0;
            x = p;
            val = find_min(bfgs_search_strategy(), 
                     objective_delta_stop_strategy(eps),
                     wrap_function(apq<T>), wrap_function(der_apq<T>), x, minf);
            DLIB_TEST_MSG(dlib::equal(x,opt, 1e-5),opt-x);
            DLIB_TEST(approx_equal(val , apq(x)));
            dlog << LINFO << "find_min() bgfs: got apq in " << total_count;

            total_count = 0;
            x = p;
            find_min(bfgs_search_strategy(), 
                     gradient_norm_stop_strategy(),
                     wrap_function(apq<T>), wrap_function(der_apq<T>), x, minf);
            DLIB_TEST_MSG(dlib::equal(x,opt, 1e-5),opt-x);
            dlog << LINFO << "find_min() bgfs(gn): got apq in " << total_count;
        }


        if (p.size() < 100)
        {
            total_count = 0;
            x = p;
            val=find_min_bobyqa(wrap_function(apq<T>), x, 2*x.size()+1,
                            uniform_matrix<double>(x.size(),1,-1e100),
                            uniform_matrix<double>(x.size(),1,1e100),
                            (max(abs(x))+1)/10,
                            1e-6,
                            10000);
            DLIB_TEST_MSG(dlib::equal(x,opt, 1e-5),opt-x);
            DLIB_TEST(approx_equal(val , apq(x)));
            dlog << LINFO << "find_min_bobyqa(): got apq in " << total_count;
        }

        total_count = 0;
        x = p;
        val=find_min(lbfgs_search_strategy(10), 
                 objective_delta_stop_strategy(eps),
                 wrap_function(apq<T>), wrap_function(der_apq<T>), x, minf);
        DLIB_TEST_MSG(dlib::equal(x,opt, 1e-5),opt-x);
        DLIB_TEST(approx_equal(val , apq(x)));
        dlog << LINFO << "find_min() lbgfs-10: got apq in " << total_count;


        total_count = 0;
        x = p;
        val=find_min(lbfgs_search_strategy(1), 
                 objective_delta_stop_strategy(eps),
                 wrap_function(apq<T>), wrap_function(der_apq<T>), x, minf);
        DLIB_TEST_MSG(dlib::equal(x,opt, 1e-5),opt-x);
        DLIB_TEST(approx_equal(val , apq(x)));
        dlog << LINFO << "find_min() lbgfs-1: got apq in " << total_count;


        total_count = 0;
        x = p;
        val=find_min(cg_search_strategy(),
                 objective_delta_stop_strategy(eps),
                 wrap_function(apq<T>), wrap_function(der_apq<T>), x, minf);
        DLIB_TEST_MSG(dlib::equal(x,opt, 1e-5),opt-x);
        DLIB_TEST(approx_equal(val , apq(x)));
        dlog << LINFO << "find_min() cg: got apq in " << total_count;


        // don't do approximate derivative tests if the input point is really long
        if (p.size() < 20)
        {
            total_count = 0;
            x = p;
            val=find_min(bfgs_search_strategy(),
                     objective_delta_stop_strategy(eps),
                     wrap_function(apq<T>), derivative(wrap_function(apq<T>)), x, minf);
            DLIB_TEST_MSG(dlib::equal(x,opt, 1e-5),opt-x);
            DLIB_TEST(approx_equal(val , apq(x)));
            dlog << LINFO << "find_min() bfgs: got apq/noder in " << total_count;


            total_count = 0;
            x = p;
            val=find_min(cg_search_strategy(),
                     objective_delta_stop_strategy(eps),
                     wrap_function(apq<T>), derivative(wrap_function(apq<T>)), x, minf);
            DLIB_TEST_MSG(dlib::equal(x,opt, 1e-5),opt-x);
            DLIB_TEST(approx_equal(val , apq(x)));
            dlog << LINFO << "find_min() cg: got apq/noder in " << total_count;


            total_count = 0;
            x = p;
            val=find_min_using_approximate_derivatives(bfgs_search_strategy(),
                                                   objective_delta_stop_strategy(eps), 
                                                   wrap_function(apq<T>), x, minf);
            DLIB_TEST_MSG(dlib::equal(x,opt, 1e-5),opt-x);
            DLIB_TEST(approx_equal(val , apq(x)));
            dlog << LINFO << "find_min() bfgs: got apq/noder2 in " << total_count;


            total_count = 0;
            x = p;
            val=find_min_using_approximate_derivatives(lbfgs_search_strategy(10),
                                                   objective_delta_stop_strategy(eps), 
                                                   wrap_function(apq<T>), x, minf);
            DLIB_TEST_MSG(dlib::equal(x,opt, 1e-5),opt-x);
            dlog << LINFO << "find_min() lbfgs-10: got apq/noder2 in " << total_count;


            total_count = 0;
            x = p;
            val=find_min_using_approximate_derivatives(cg_search_strategy(),
                                                   objective_delta_stop_strategy(eps),
                                                   wrap_function(apq<T>), x, minf);
            DLIB_TEST_MSG(dlib::equal(x,opt, 1e-5),opt-x);
            DLIB_TEST(approx_equal(val , apq(x)));
            dlog << LINFO << "find_min() cg: got apq/noder2 in " << total_count;
        }
    }

    void test_powell (
        const matrix<double,4,1> p
    )
    {
        const double eps = 1e-15;
        const double minf = -1;
        matrix<double,4,1> x, opt;
        opt(0) = 0;
        opt(1) = 0;
        opt(2) = 0;
        opt(3) = 0;

        double val = 0;

        dlog << LINFO << "testing with powell and the start point: " << trans(p);

        /*
        total_count = 0;
        x = p;
        val=find_min(bfgs_search_strategy(),
                 objective_delta_stop_strategy(eps),
                 &powell, derivative(&powell,1e-8), x, minf);
        DLIB_TEST_MSG(dlib::equal(x,opt, 1e-2),opt-x);
        DLIB_TEST(approx_equal(val , powell(x)));
        dlog << LINFO << "find_min() bfgs: got powell/noder in " << total_count;


        total_count = 0;
        x = p;
        val=find_min(cg_search_strategy(),
                 objective_delta_stop_strategy(eps),
                 &powell, derivative(&powell,1e-9), x, minf);
        DLIB_TEST_MSG(dlib::equal(x,opt, 1e-2),opt-x);
        DLIB_TEST(approx_equal(val , powell(x)));
        dlog << LINFO << "find_min() cg: got powell/noder in " << total_count;
        */

        total_count = 0;
        x = p;
        val=find_min_using_approximate_derivatives(bfgs_search_strategy(),
                                               objective_delta_stop_strategy(eps),
                                               &powell, x, minf, 1e-10);
        DLIB_TEST_MSG(dlib::equal(x,opt, 1e-1),opt-x);
        DLIB_TEST(approx_equal(val , powell(x)));
        dlog << LINFO << "find_min() bfgs: got powell/noder2 in " << total_count;


        total_count = 0;
        x = p;
        val=find_min_using_approximate_derivatives(lbfgs_search_strategy(4),
                                               objective_delta_stop_strategy(eps),
                                               &powell, x, minf, 1e-10);
        DLIB_TEST_MSG(dlib::equal(x,opt, 1e-1),opt-x);
        DLIB_TEST(approx_equal(val , powell(x)));
        dlog << LINFO << "find_min() lbfgs-4: got powell/noder2 in " << total_count;


        total_count = 0;
        x = p;
        val=find_min_using_approximate_derivatives(lbfgs_search_strategy(4),
                                               gradient_norm_stop_strategy(),
                                               &powell, x, minf, 1e-10);
        DLIB_TEST_MSG(dlib::equal(x,opt, 1e-1),opt-x);
        DLIB_TEST(approx_equal(val , powell(x)));
        dlog << LINFO << "find_min() lbfgs-4(gn): got powell/noder2 in " << total_count;


        total_count = 0;
        x = p;
        val=find_min_using_approximate_derivatives(cg_search_strategy(),
                                               objective_delta_stop_strategy(eps),
                                               &powell, x, minf, 1e-10);
        DLIB_TEST_MSG(dlib::equal(x,opt, 1e-1),opt-x);
        DLIB_TEST(approx_equal(val , powell(x)));
        dlog << LINFO << "find_min() cg: got powell/noder2 in " << total_count;


        total_count = 0;
        x = p;
        val=find_min_bobyqa(&powell, x, 2*x.size()+1,
                        uniform_matrix<double>(x.size(),1,-1e100),
                        uniform_matrix<double>(x.size(),1,1e100),
                        (max(abs(x))+1)/10,
                        1e-7,
                        10000);
        DLIB_TEST_MSG(dlib::equal(x,opt, 1e-3),opt-x);
        DLIB_TEST(approx_equal(val , powell(x)));
        dlog << LINFO << "find_min_bobyqa(): got powell in " << total_count;

    }



    void test_simple (
        const matrix<double,2,1> p
    )
    {
        const double eps = 1e-12;
        const double minf = -10000;
        matrix<double,2,1> x, opt;
        opt(0) = 0;
        opt(1) = 0;
        double val = 0;

        dlog << LINFO << "testing with simple and the start point: " << trans(p);

        total_count = 0;
        x = p;
        val=find_min(bfgs_search_strategy(),
                 objective_delta_stop_strategy(eps),
                 &simple, &der_simple, x, minf);
        DLIB_TEST_MSG(dlib::equal(x,opt, 1e-5),opt-x);
        DLIB_TEST(approx_equal(val , simple(x)));
        dlog << LINFO << "find_min() bfgs: got simple in " << total_count;


        total_count = 0;
        x = p;
        val=find_min(bfgs_search_strategy(),
                 gradient_norm_stop_strategy(),
                 &simple, &der_simple, x, minf);
        DLIB_TEST_MSG(dlib::equal(x,opt, 1e-5),opt-x);
        DLIB_TEST(approx_equal(val , simple(x)));
        dlog << LINFO << "find_min() bfgs(gn): got simple in " << total_count;


        total_count = 0;
        x = p;
        val=find_min(lbfgs_search_strategy(3),
                 objective_delta_stop_strategy(eps),
                 &simple, &der_simple, x, minf);
        DLIB_TEST_MSG(dlib::equal(x,opt, 1e-5),opt-x);
        DLIB_TEST(approx_equal(val , simple(x)));
        dlog << LINFO << "find_min() lbfgs-3: got simple in " << total_count;


        total_count = 0;
        x = p;
        val=find_min(cg_search_strategy(),
                 objective_delta_stop_strategy(eps),
                 &simple, &der_simple, x, minf);
        DLIB_TEST_MSG(dlib::equal(x,opt, 1e-5),opt-x);
        DLIB_TEST(approx_equal(val , simple(x)));
        dlog << LINFO << "find_min() cg: got simple in " << total_count;



        total_count = 0;
        x = p;
        val=find_min(bfgs_search_strategy(),
                 objective_delta_stop_strategy(eps),
                 &simple, derivative(&simple), x, minf);
        DLIB_TEST_MSG(dlib::equal(x,opt, 1e-5),opt-x);
        DLIB_TEST(approx_equal(val , simple(x)));
        dlog << LINFO << "find_min() bfgs: got simple/noder in " << total_count;


        total_count = 0;
        x = p;
        val=find_min(lbfgs_search_strategy(8),
                 objective_delta_stop_strategy(eps),
                 &simple, derivative(&simple), x, minf);
        DLIB_TEST_MSG(dlib::equal(x,opt, 1e-5),opt-x);
        DLIB_TEST(approx_equal(val , simple(x)));
        dlog << LINFO << "find_min() lbfgs-8: got simple/noder in " << total_count;


        total_count = 0;
        x = p;
        val=find_min(cg_search_strategy(),
                 objective_delta_stop_strategy(eps),
                 &simple, derivative(&simple), x, minf);
        DLIB_TEST_MSG(dlib::equal(x,opt, 1e-5),opt-x);
        DLIB_TEST(approx_equal(val , simple(x)));
        dlog << LINFO << "find_min() cg: got simple/noder in " << total_count;



        total_count = 0;
        x = p;
        val=find_min_using_approximate_derivatives(bfgs_search_strategy(),
                                               objective_delta_stop_strategy(eps),
                                               &simple, x, minf);
        DLIB_TEST_MSG(dlib::equal(x,opt, 1e-5),opt-x);
        DLIB_TEST(approx_equal(val , simple(x)));
        dlog << LINFO << "find_min() bfgs: got simple/noder2 in " << total_count;


        total_count = 0;
        x = p;
        val=find_min_using_approximate_derivatives(lbfgs_search_strategy(6),
                                               objective_delta_stop_strategy(eps),
                                               &simple, x, minf);
        DLIB_TEST_MSG(dlib::equal(x,opt, 1e-5),opt-x);
        DLIB_TEST(approx_equal(val , simple(x)));
        dlog << LINFO << "find_min() lbfgs-6: got simple/noder2 in " << total_count;


        total_count = 0;
        x = p;
        val=find_min_using_approximate_derivatives(cg_search_strategy(),
                                               objective_delta_stop_strategy(eps),
                                               &simple, x, minf);
        DLIB_TEST_MSG(dlib::equal(x,opt, 1e-5),opt-x);
        DLIB_TEST(approx_equal(val , simple(x)));
        dlog << LINFO << "find_min() cg: got simple/noder2 in " << total_count;


        total_count = 0;
        x = p;
        val=find_min_bobyqa(&simple, x, 2*x.size()+1,
                        uniform_matrix<double>(x.size(),1,-1e100),
                        uniform_matrix<double>(x.size(),1,1e100),
                        (max(abs(x))+1)/10,
                        1e-6,
                        10000);
        DLIB_TEST_MSG(dlib::equal(x,opt, 1e-5),opt-x);
        DLIB_TEST(approx_equal(val , simple(x)));
        dlog << LINFO << "find_min_bobyqa(): got simple in " << total_count;

    }


    void test_rosen (
        const matrix<double,2,1> p
    )
    {
        const double eps = 1e-15;
        const double minf = -10;
        matrix<double,2,1> x, opt;
        opt(0) = 1;
        opt(1) = 1;

        double val = 0;

        dlog << LINFO << "testing with rosen and the start point: " << trans(p);

        total_count = 0;
        x = p;
        val=find_min(bfgs_search_strategy(),
                 objective_delta_stop_strategy(eps),
                 &rosen, &der_rosen, x, minf);
        DLIB_TEST_MSG(dlib::equal(x,opt, 1e-7),opt-x);
        DLIB_TEST(approx_equal(val , rosen(x)));
        dlog << LINFO << "find_min() bfgs: got rosen in " << total_count;


        total_count = 0;
        x = p;
        val=find_min(bfgs_search_strategy(),
                 gradient_norm_stop_strategy(),
                 &rosen, &der_rosen, x, minf);
        DLIB_TEST_MSG(dlib::equal(x,opt, 1e-7),opt-x);
        DLIB_TEST(approx_equal(val , rosen(x)));
        dlog << LINFO << "find_min() bfgs(gn): got rosen in " << total_count;


        total_count = 0;
        x = p;
        val=find_min(lbfgs_search_strategy(20),
                 objective_delta_stop_strategy(eps),
                 &rosen, &der_rosen, x, minf);
        DLIB_TEST_MSG(dlib::equal(x,opt, 1e-7),opt-x);
        DLIB_TEST(approx_equal(val , rosen(x)));
        dlog << LINFO << "find_min() lbfgs-20: got rosen in " << total_count;


        total_count = 0;
        x = p;
        val=find_min(cg_search_strategy(),
                 objective_delta_stop_strategy(eps),
                 &rosen, &der_rosen, x, minf);
        DLIB_TEST_MSG(dlib::equal(x,opt, 1e-7),opt-x);
        DLIB_TEST(approx_equal(val , rosen(x)));
        dlog << LINFO << "find_min() cg: got rosen in " << total_count;



        total_count = 0;
        x = p;
        val=find_min(bfgs_search_strategy(),
                 objective_delta_stop_strategy(eps),
                 &rosen, derivative(&rosen,1e-5), x, minf);
        DLIB_TEST_MSG(dlib::equal(x,opt, 1e-4),opt-x);
        DLIB_TEST(approx_equal(val , rosen(x)));
        dlog << LINFO << "find_min() bfgs: got rosen/noder in " << total_count;


        total_count = 0;
        x = p;
        val=find_min(lbfgs_search_strategy(5),
                 objective_delta_stop_strategy(eps),
                 &rosen, derivative(&rosen,1e-5), x, minf);
        DLIB_TEST_MSG(dlib::equal(x,opt, 1e-4),opt-x);
        DLIB_TEST(approx_equal(val , rosen(x)));
        dlog << LINFO << "find_min() lbfgs-5: got rosen/noder in " << total_count;


        total_count = 0;
        x = p;
        val=find_min(cg_search_strategy(),
                 objective_delta_stop_strategy(eps),
                 &rosen, derivative(&rosen,1e-5), x, minf);
        DLIB_TEST_MSG(dlib::equal(x,opt, 1e-4),opt-x);
        DLIB_TEST(approx_equal(val , rosen(x)));
        dlog << LINFO << "find_min() cg: got rosen/noder in " << total_count;


        total_count = 0;
        x = p;
        val=find_min_using_approximate_derivatives(cg_search_strategy(),
                                               objective_delta_stop_strategy(eps),
                                               &rosen, x, minf);
        DLIB_TEST_MSG(dlib::equal(x,opt, 1e-4),opt-x);
        DLIB_TEST(approx_equal(val , rosen(x)));
        dlog << LINFO << "find_min() cg: got rosen/noder2 in " << total_count;


        if (max(abs(p)) < 1000)
        {
            total_count = 0;
            x = p;
            val=find_min_bobyqa(&rosen, x, 2*x.size()+1,
                            uniform_matrix<double>(x.size(),1,-1e100),
                            uniform_matrix<double>(x.size(),1,1e100),
                            (max(abs(x))+1)/10,
                            1e-6,
                            10000);
            DLIB_TEST_MSG(dlib::equal(x,opt, 1e-5),opt-x);
            DLIB_TEST(approx_equal(val , rosen(x)));
            dlog << LINFO << "find_min_bobyqa(): got rosen in " << total_count;
        }
    }


    void test_neg_rosen (
        const matrix<double,2,1> p
    )
    {
        const double eps = 1e-15;
        const double maxf = 10;
        matrix<double,2,1> x, opt;
        opt(0) = 1;
        opt(1) = 1;

        double val = 0;

        dlog << LINFO << "testing with neg_rosen and the start point: " << trans(p);

        total_count = 0;
        x = p;
        val=find_max(
            bfgs_search_strategy(), 
            objective_delta_stop_strategy(eps), &neg_rosen, &der_neg_rosen, x, maxf);
        DLIB_TEST_MSG(dlib::equal(x,opt, 1e-7),opt-x);
        DLIB_TEST(approx_equal(val , neg_rosen(x)));
        dlog << LINFO << "find_max() bfgs: got neg_rosen in " << total_count;

        total_count = 0;
        x = p;
        val=find_max(
            lbfgs_search_strategy(5), 
            objective_delta_stop_strategy(eps), &neg_rosen, &der_neg_rosen, x, maxf);
        DLIB_TEST_MSG(dlib::equal(x,opt, 1e-7),opt-x);
        DLIB_TEST(approx_equal(val , neg_rosen(x)));
        dlog << LINFO << "find_max() lbfgs-5: got neg_rosen in " << total_count;

        total_count = 0;
        x = p;
        val=find_max(
            lbfgs_search_strategy(5), 
            objective_delta_stop_strategy(eps), &neg_rosen, derivative(&neg_rosen), x, maxf);
        DLIB_TEST_MSG(dlib::equal(x,opt, 1e-7),opt-x);
        DLIB_TEST(approx_equal(val , neg_rosen(x)));
        dlog << LINFO << "find_max() lbfgs-5: got neg_rosen/noder in " << total_count;


        total_count = 0;
        x = p;
        val=find_max_using_approximate_derivatives(
            cg_search_strategy(), 
            objective_delta_stop_strategy(eps), &neg_rosen, x, maxf);
        DLIB_TEST_MSG(dlib::equal(x,opt, 1e-7),opt-x);
        DLIB_TEST(approx_equal(val , neg_rosen(x)));
        dlog << LINFO << "find_max() cg: got neg_rosen/noder2 in " << total_count;


        total_count = 0;
        x = p;
        val=find_max_bobyqa(&neg_rosen, x, 2*x.size()+1,
                        uniform_matrix<double>(x.size(),1,-1e100),
                        uniform_matrix<double>(x.size(),1,1e100),
                        (max(abs(x))+1)/10,
                        1e-6,
                        10000);
        DLIB_TEST_MSG(dlib::equal(x,opt, 1e-5),opt-x);
        DLIB_TEST(approx_equal(val , neg_rosen(x)));
        dlog << LINFO << "find_max_bobyqa(): got neg_rosen in " << total_count;
    }

// ----------------------------------------------------------------------------------------

    void test_single_variable_function (
        const double p
    )
    {
        const double eps = 1e-7;


        dlog << LINFO << "testing with single_variable_function and the start point: " << p;
        double out, x;

        total_count = 0;
        x = p;
        out = find_min_single_variable(&single_variable_function, x, -1e100, 1e100, eps, 1000);
        DLIB_TEST_MSG(std::abs(out-5) < 1e-6, out-5);
        DLIB_TEST_MSG(std::abs(x) < 1e-6, x);
        dlog << LINFO << "find_min_single_variable(): got single_variable_function in " << total_count;


        total_count = 0;
        x = p;
        out = -find_max_single_variable(negate_function(&single_variable_function), x, -1e100, 1e100, eps, 1000);
        DLIB_TEST_MSG(std::abs(out-5) < 1e-6, out-5);
        DLIB_TEST_MSG(std::abs(x) < 1e-6, x);
        dlog << LINFO << "find_max_single_variable(): got single_variable_function in " << total_count;


        if (p > 0)
        {
            total_count = 0;
            x = p;
            out = find_min_single_variable(&single_variable_function, x, -1e-4, 1e100, eps, 1000);
            DLIB_TEST_MSG(std::abs(out-5) < 1e-6, out-5);
            DLIB_TEST_MSG(std::abs(x) < 1e-6, x);
            dlog << LINFO << "find_min_single_variable(): got single_variable_function in " << total_count;


            if (p > 3)
            {
                total_count = 0;
                x = p;
                out = -find_max_single_variable(negate_function(&single_variable_function), x, 3, 1e100, eps, 1000);
                DLIB_TEST_MSG(std::abs(out - (3*3*3+5)) < 1e-6, out-(3*3*3+5));
                DLIB_TEST_MSG(std::abs(x-3) < 1e-6, x);
                dlog << LINFO << "find_max_single_variable(): got single_variable_function in " << total_count;
            }
        }

        if (p < 0)
        {
            total_count = 0;
            x = p;
            out = find_min_single_variable(&single_variable_function, x, -1e100, 1e-4, eps, 1000);
            DLIB_TEST_MSG(std::abs(out-5) < 1e-6, out-5);
            DLIB_TEST_MSG(std::abs(x) < 1e-6, x);
            dlog << LINFO << "find_min_single_variable(): got single_variable_function in " << total_count;

            if (p < -3)
            {
                total_count = 0;
                x = p;
                out = find_min_single_variable(&single_variable_function, x, -1e100, -3, eps, 1000);
                DLIB_TEST_MSG(std::abs(out - (3*3*3+5)) < 1e-6, out-(3*3*3+5));
                DLIB_TEST_MSG(std::abs(x+3) < 1e-6, x);
                dlog << LINFO << "find_min_single_variable(): got single_variable_function in " << total_count;
            }
        }

    }

// ----------------------------------------------------------------------------------------

    void optimization_test (
    )
    /*!
        ensures
            - runs tests on the optimization stuff compliance with the specs
    !*/
    {        
        matrix<double,0,1> p;

        print_spinner();

        p.set_size(2);

        // test with single_variable_function
        test_single_variable_function(0);
        test_single_variable_function(1);
        test_single_variable_function(-10);
        test_single_variable_function(-100);
        test_single_variable_function(900.53);

        // test with the rosen function
        p(0) = 9;
        p(1) = -4.9;
        test_rosen(p);
        test_neg_rosen(p);

        p(0) = 0;
        p(1) = 0;
        test_rosen(p);

        p(0) = 5323;
        p(1) = 98248;
        test_rosen(p);

        // test with the simple function
        p(0) = 1;
        p(1) = 1;
        test_simple(p);

        p(0) = 0.5;
        p(1) = -9;
        test_simple(p);

        p(0) = 645;
        p(1) = 839485;
        test_simple(p);

        print_spinner();

        // test with the apq function
        p.set_size(5);

        p(0) = 1;
        p(1) = 1;
        p(2) = 1;
        p(3) = 1;
        p(4) = 1;
        test_apq(p);

        p(0) = 1;
        p(1) = 2;
        p(2) = 3;
        p(3) = 4;
        p(4) = 5;
        test_apq(p);

        p(0) = 1;
        p(1) = 2;
        p(2) = -3;
        p(3) = 4;
        p(4) = 5;
        test_apq(p);

        print_spinner();

        p(0) = 1;
        p(1) = 2324;
        p(2) = -3;
        p(3) = 4;
        p(4) = 534534;
        test_apq(p);

        p.set_size(10);
        p(0) = 1;
        p(1) = 2;
        p(2) = -3;
        p(3) = 4;
        p(4) = 5;
        p(5) = 1;
        p(6) = 2;
        p(7) = -3;
        p(8) = 4;
        p(9) = 5;
        test_apq(p);

        // test apq with a big vector
        p.set_size(500);
        dlib::rand rnd;
        for (long i = 0; i < p.size(); ++i)
        {
            p(i) = rnd.get_random_double()*20 - 10; 
        }
        test_apq(p);

        print_spinner();

        // test with the powell function
        p.set_size(4);

        p(0) = 3;
        p(1) = -1;
        p(2) = 0;
        p(3) = 1;
        test_powell(p);

        {
            matrix<double,2,1> m;
            m(0) = -0.43;
            m(1) = 0.919;
            DLIB_TEST(dlib::equal(der_rosen(m) , derivative(&rosen)(m),1e-5));

            DLIB_TEST_MSG(std::abs(derivative(make_line_search_function(&rosen,m,m))(0) - 
                                  make_line_search_function(derivative(&rosen),m,m)(0)) < 1e-5,"");
            DLIB_TEST_MSG(std::abs(derivative(make_line_search_function(&rosen,m,m))(1) - 
                                  make_line_search_function(derivative(&rosen),m,m)(1)) < 1e-5,"");

            DLIB_TEST_MSG(std::abs(derivative(make_line_search_function(&rosen,m,m))(0) - 
                                  make_line_search_function(&der_rosen,m,m)(0)) < 1e-5,"");
            DLIB_TEST_MSG(std::abs(derivative(make_line_search_function(&rosen,m,m))(1) - 
                                  make_line_search_function(&der_rosen,m,m)(1)) < 1e-5,"");
        }
        {
            matrix<double,2,1> m;
            m(0) = 1;
            m(1) = 2;
            DLIB_TEST(dlib::equal(der_rosen(m) , derivative(&rosen)(m),1e-5));

            DLIB_TEST_MSG(std::abs(derivative(make_line_search_function(&rosen,m,m))(0) - 
                                  make_line_search_function(derivative(&rosen),m,m)(0)) < 1e-5,"");
            DLIB_TEST_MSG(std::abs(derivative(make_line_search_function(&rosen,m,m))(1) - 
                                  make_line_search_function(derivative(&rosen),m,m)(1)) < 1e-5,"");

            DLIB_TEST_MSG(std::abs(derivative(make_line_search_function(&rosen,m,m))(0) - 
                                  make_line_search_function(&der_rosen,m,m)(0)) < 1e-5,"");
            DLIB_TEST_MSG(std::abs(derivative(make_line_search_function(&rosen,m,m))(1) - 
                                  make_line_search_function(&der_rosen,m,m)(1)) < 1e-5,"");
        }

        {
            matrix<double,2,1> m;
            m = 1,2;
            DLIB_TEST(std::abs(neg_rosen(m) - negate_function(&rosen)(m) ) < 1e-16);
        }

    }



    class optimization_tester : public tester
    {
    public:
        optimization_tester (
        ) :
            tester ("test_optimization",
                    "Runs tests on the optimization component.")
        {}

        void perform_test (
        )
        {
            optimization_test();
        }
    } a;

}


