// Copyright (C) 2008  Davis E. King (davisking@users.sourceforge.net)
// License: Boost Software License   See LICENSE.txt for the full license.


#include <dlib/optimization.h>
#include <sstream>
#include <string>
#include <cstdlib>
#include <ctime>
#include <vector>
#include "../stl_checked.h"
#include "../array.h"

#include "tester.h"


namespace  
{

    using namespace test;
    using namespace dlib;
    using namespace std;

    logger dlog("test.optimization");

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

        dlog << LINFO << "testing with apq and the start point: " << trans(p);

        total_count = 0;
        x = p;
        find_min_quasi_newton(wrap_function(apq<T>), wrap_function(der_apq<T>), x, minf, eps);
        DLIB_CASSERT(dlib::equal(x,opt, 1e-5),opt-x);
        dlog << LINFO << "find_min_quasi_newton got apq in " << total_count;

        total_count = 0;
        x = p;
        find_min_conjugate_gradient(wrap_function(apq<T>), wrap_function(der_apq<T>), x, minf, eps);
        DLIB_CASSERT(dlib::equal(x,opt, 1e-5),opt-x);
        dlog << LINFO << "find_min_conjugate_gradient got apq in " << total_count;

        total_count = 0;
        x = p;
        find_min_quasi_newton(wrap_function(apq<T>), derivative(wrap_function(apq<T>)), x, minf, eps);
        DLIB_CASSERT(dlib::equal(x,opt, 1e-5),opt-x);
        dlog << LINFO << "find_min_quasi_newton got apq/noder in " << total_count;

        total_count = 0;
        x = p;
        find_min_conjugate_gradient(wrap_function(apq<T>), derivative(wrap_function(apq<T>)), x, minf, eps);
        DLIB_CASSERT(dlib::equal(x,opt, 1e-5),opt-x);
        dlog << LINFO << "find_min_conjugate_gradient got apq/noder in " << total_count;

        total_count = 0;
        x = p;
        find_min_quasi_newton2(wrap_function(apq<T>), x, minf, eps);
        DLIB_CASSERT(dlib::equal(x,opt, 1e-5),opt-x);
        dlog << LINFO << "find_min_quasi_newton got apq/noder2 in " << total_count;

        total_count = 0;
        x = p;
        find_min_conjugate_gradient2(wrap_function(apq<T>), x, minf, eps);
        DLIB_CASSERT(dlib::equal(x,opt, 1e-5),opt-x);
        dlog << LINFO << "find_min_conjugate_gradient got apq/noder2 in " << total_count;
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

        dlog << LINFO << "testing with powell and the start point: " << trans(p);

        /*
        total_count = 0;
        x = p;
        find_min_quasi_newton(&powell, derivative(&powell,1e-8), x, minf, eps);
        DLIB_CASSERT(dlib::equal(x,opt, 1e-2),opt-x);
        dlog << LINFO << "find_min_quasi_newton got powell/noder in " << total_count;

        total_count = 0;
        x = p;
        find_min_conjugate_gradient(&powell, derivative(&powell,1e-9), x, minf, eps);
        DLIB_CASSERT(dlib::equal(x,opt, 1e-2),opt-x);
        dlog << LINFO << "find_min_conjugate_gradient got powell/noder in " << total_count;
        */

        total_count = 0;
        x = p;
        find_min_quasi_newton2(&powell, x, minf, eps, 1e-10);
        DLIB_CASSERT(dlib::equal(x,opt, 1e-1),opt-x);
        dlog << LINFO << "find_min_quasi_newton got powell/noder2 in " << total_count;

        total_count = 0;
        x = p;
        find_min_conjugate_gradient2(&powell, x, minf, eps, 1e-10);
        DLIB_CASSERT(dlib::equal(x,opt, 1e-1),opt-x);
        dlog << LINFO << "find_min_conjugate_gradient got powell/noder2 in " << total_count;
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

        dlog << LINFO << "testing with simple and the start point: " << trans(p);

        total_count = 0;
        x = p;
        find_min_quasi_newton(&simple, &der_simple, x, minf, eps);
        DLIB_CASSERT(dlib::equal(x,opt, 1e-5),opt-x);
        dlog << LINFO << "find_min_quasi_newton got simple in " << total_count;

        total_count = 0;
        x = p;
        find_min_conjugate_gradient(&simple, &der_simple, x, minf, eps);
        DLIB_CASSERT(dlib::equal(x,opt, 1e-5),opt-x);
        dlog << LINFO << "find_min_conjugate_gradient got simple in " << total_count;

        total_count = 0;
        x = p;
        find_min_quasi_newton(&simple, derivative(&simple), x, minf, eps);
        DLIB_CASSERT(dlib::equal(x,opt, 1e-5),opt-x);
        dlog << LINFO << "find_min_quasi_newton got simple/noder in " << total_count;

        total_count = 0;
        x = p;
        find_min_conjugate_gradient(&simple, derivative(&simple), x, minf, eps);
        DLIB_CASSERT(dlib::equal(x,opt, 1e-5),opt-x);
        dlog << LINFO << "find_min_conjugate_gradient got simple/noder in " << total_count;

        total_count = 0;
        x = p;
        find_min_quasi_newton2(&simple, x, minf, eps);
        DLIB_CASSERT(dlib::equal(x,opt, 1e-5),opt-x);
        dlog << LINFO << "find_min_quasi_newton got simple/noder2 in " << total_count;

        total_count = 0;
        x = p;
        find_min_conjugate_gradient2(&simple, x, minf, eps);
        DLIB_CASSERT(dlib::equal(x,opt, 1e-5),opt-x);
        dlog << LINFO << "find_min_conjugate_gradient got simple/noder2 in " << total_count;
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

        dlog << LINFO << "testing with rosen and the start point: " << trans(p);

        total_count = 0;
        x = p;
        find_min_quasi_newton(&rosen, &der_rosen, x, minf, eps);
        DLIB_CASSERT(dlib::equal(x,opt, 1e-7),opt-x);
        dlog << LINFO << "find_min_quasi_newton got rosen in " << total_count;

        total_count = 0;
        x = p;
        find_min_conjugate_gradient(&rosen, &der_rosen, x, minf, eps);
        DLIB_CASSERT(dlib::equal(x,opt, 1e-5),opt-x);
        dlog << LINFO << "find_min_conjugate_gradient got rosen in " << total_count;

        total_count = 0;
        x = p;
        find_min_quasi_newton(&rosen, derivative(&rosen), x, minf, eps);
        DLIB_CASSERT(dlib::equal(x,opt, 1e-4),opt-x);
        dlog << LINFO << "find_min_quasi_newton got rosen/noder in " << total_count;

        total_count = 0;
        x = p;
        find_min_conjugate_gradient(&rosen, derivative(&rosen), x, minf, eps);
        DLIB_CASSERT(dlib::equal(x,opt, 1e-4),opt-x);
        dlog << LINFO << "find_min_conjugate_gradient got rosen/noder in " << total_count;

        /* This test fails
        total_count = 0;
        x = p;
        find_min_quasi_newton2(&rosen, x, minf, eps, 1e-13);
        DLIB_CASSERT(dlib::equal(x,opt, 1e-2),opt-x);
        dlog << LINFO << "find_min_quasi_newton got rosen/noder2 in " << total_count;
        */

        total_count = 0;
        x = p;
        find_min_conjugate_gradient2(&rosen, x, minf, eps, 1e-11);
        DLIB_CASSERT(dlib::equal(x,opt, 1e-4),opt-x);
        dlog << LINFO << "find_min_conjugate_gradient got rosen/noder2 in " << total_count;
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

        p.set_size(2);


        // test with the rosen function
        p(0) = 9;
        p(1) = -4.9;
        test_rosen(p);

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
            DLIB_CASSERT(dlib::equal(der_rosen(m) , derivative(&rosen)(m),1e-5),"");

            DLIB_CASSERT(std::abs(derivative(make_line_search_function(&rosen,m,m))(0) - 
                                  make_line_search_function(derivative(&rosen),m,m)(0)) < 1e-5,"");
            DLIB_CASSERT(std::abs(derivative(make_line_search_function(&rosen,m,m))(1) - 
                                  make_line_search_function(derivative(&rosen),m,m)(1)) < 1e-5,"");

            DLIB_CASSERT(std::abs(derivative(make_line_search_function(&rosen,m,m))(0) - 
                                  make_line_search_function(&der_rosen,m,m)(0)) < 1e-5,"");
            DLIB_CASSERT(std::abs(derivative(make_line_search_function(&rosen,m,m))(1) - 
                                  make_line_search_function(&der_rosen,m,m)(1)) < 1e-5,"");
        }
        {
            matrix<double,2,1> m;
            m(0) = 1;
            m(1) = 2;
            DLIB_CASSERT(dlib::equal(der_rosen(m) , derivative(&rosen)(m),1e-5),"");

            DLIB_CASSERT(std::abs(derivative(make_line_search_function(&rosen,m,m))(0) - 
                                  make_line_search_function(derivative(&rosen),m,m)(0)) < 1e-5,"");
            DLIB_CASSERT(std::abs(derivative(make_line_search_function(&rosen,m,m))(1) - 
                                  make_line_search_function(derivative(&rosen),m,m)(1)) < 1e-5,"");

            DLIB_CASSERT(std::abs(derivative(make_line_search_function(&rosen,m,m))(0) - 
                                  make_line_search_function(&der_rosen,m,m)(0)) < 1e-5,"");
            DLIB_CASSERT(std::abs(derivative(make_line_search_function(&rosen,m,m))(1) - 
                                  make_line_search_function(&der_rosen,m,m)(1)) < 1e-5,"");
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


