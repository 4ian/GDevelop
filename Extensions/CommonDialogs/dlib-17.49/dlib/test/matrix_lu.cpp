// Copyright (C) 2009  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.


#include <dlib/matrix.h>
#include <sstream>
#include <string>
#include <cstdlib>
#include <ctime>
#include <vector>
#include "../stl_checked.h"
#include "../array.h"
#include "../rand.h"
#include <dlib/string.h>

#include "tester.h"

namespace  
{

    using namespace test;
    using namespace dlib;
    using namespace std;

    logger dlog("test.matrix_lu");

    dlib::rand rnd;

// ----------------------------------------------------------------------------------------

    template <typename mat_type>
    const matrix<typename mat_type::type> symm(const mat_type& m) { return m*trans(m); }

// ----------------------------------------------------------------------------------------

    template <typename type>
    const matrix<type> randmat(long r, long c)
    {
        matrix<type> m(r,c);
        for (long row = 0; row < m.nr(); ++row)
        {
            for (long col = 0; col < m.nc(); ++col)
            {
                m(row,col) = static_cast<type>(rnd.get_random_double()); 
            }
        }

        return m;
    }

    template <typename type, long NR, long NC>
    const matrix<type,NR,NC> randmat()
    {
        matrix<type,NR,NC> m;
        for (long row = 0; row < m.nr(); ++row)
        {
            for (long col = 0; col < m.nc(); ++col)
            {
                m(row,col) = static_cast<type>(rnd.get_random_double()); 
            }
        }

        return m;
    }

// ----------------------------------------------------------------------------------------

    template <typename matrix_type>
    void test_lu ( const matrix_type& m)
    {
        typedef typename matrix_type::type type;
        const type eps = 10*max(abs(m))*sqrt(std::numeric_limits<type>::epsilon());
        dlog << LDEBUG << "test_lu():  " << m.nr() << " x " << m.nc() << "  eps: " << eps;
        print_spinner();


        lu_decomposition<matrix_type> test(m);

        DLIB_TEST(test.is_square() == (m.nr() == m.nc()));

        DLIB_TEST(test.nr() == m.nr());
        DLIB_TEST(test.nc() == m.nc());

        dlog << LDEBUG << "m.nr(): " << m.nr() << "  m.nc(): " << m.nc();

        type temp;
        DLIB_TEST_MSG( (temp= max(abs(test.get_l()*test.get_u() - rowm(m,test.get_pivot())))) < eps,temp);

        if (test.is_square())
        {
            // none of the matrices we should be passing in to test_lu() should be singular.  
            DLIB_TEST_MSG (abs(test.det()) > eps/100, "det: " << test.det() );
            dlog << LDEBUG << "big det: " << test.det();

            DLIB_TEST(test.is_singular() == false);

            matrix<type> m2;
            matrix<type,0,1> col;

            m2 = identity_matrix<type>(m.nr());
            DLIB_TEST_MSG(equal(m*test.solve(m2), m2,eps),max(abs(m*test.solve(m2)- m2)));
            m2 = randmat<type>(m.nr(),5);
            DLIB_TEST_MSG(equal(m*test.solve(m2), m2,eps),max(abs(m*test.solve(m2)- m2)));
            m2 = randmat<type>(m.nr(),1);
            DLIB_TEST_MSG(equal(m*test.solve(m2), m2,eps),max(abs(m*test.solve(m2)- m2)));
            col = randmat<type>(m.nr(),1);
            DLIB_TEST_MSG(equal(m*test.solve(col), col,eps),max(abs(m*test.solve(m2)- m2)));

            // now make us a singular matrix
            if (m.nr() > 1)
            {
                matrix<type> sm(m);
                set_colm(sm,0) = colm(sm,1);

                lu_decomposition<matrix_type> test2(sm);
                DLIB_TEST_MSG( (temp= max(abs(test2.get_l()*test2.get_u() - rowm(sm,test2.get_pivot())))) < eps,temp);

                // these checks are only accurate for small matrices
                if (test2.nr() < 100)
                {
                    DLIB_TEST_MSG(test2.is_singular() == true,"det: " << test2.det());
                    DLIB_TEST_MSG(abs(test2.det()) < eps,"det: " << test2.det());
                }

            }
        }

    }

// ----------------------------------------------------------------------------------------

    void matrix_test_double()
    {


        test_lu(10*randmat<double>(2,2));
        test_lu(10*randmat<double>(1,1));
        test_lu(10*symm(randmat<double>(2,2)));
        test_lu(10*randmat<double>(4,4));
        test_lu(10*randmat<double>(9,4));
        test_lu(10*randmat<double>(3,8));
        test_lu(10*randmat<double>(15,15));
        test_lu(2*symm(randmat<double>(15,15)));
        test_lu(10*randmat<double>(100,100));
        test_lu(10*randmat<double>(137,200));
        test_lu(10*randmat<double>(200,101));

        test_lu(10*randmat<double,2,2>());
        test_lu(10*randmat<double,1,1>());
        test_lu(10*randmat<double,4,3>());
        test_lu(10*randmat<double,4,4>());
        test_lu(10*randmat<double,9,4>());
        test_lu(10*randmat<double,3,8>());
        test_lu(10*randmat<double,15,15>());
        test_lu(10*randmat<double,100,100>());
        test_lu(10*randmat<double,137,200>());
        test_lu(10*randmat<double,200,101>());

        typedef matrix<double,0,0,default_memory_manager, column_major_layout> mat;
        test_lu(mat(3*randmat<double>(4,4)));
        test_lu(mat(3*randmat<double>(9,4)));
        test_lu(mat(3*randmat<double>(3,8)));
    }

// ----------------------------------------------------------------------------------------

    void matrix_test_float()
    {

    // -------------------------------

        test_lu(3*randmat<float>(1,1));
        test_lu(3*randmat<float>(2,2));
        test_lu(3*randmat<float>(4,4));
        test_lu(3*randmat<float>(9,4));
        test_lu(3*randmat<float>(3,8));
        test_lu(3*randmat<float>(137,200));
        test_lu(3*randmat<float>(200,101));

        test_lu(3*randmat<float,1,1>());
        test_lu(3*randmat<float,2,2>());
        test_lu(3*randmat<float,4,3>());
        test_lu(3*randmat<float,4,4>());
        test_lu(3*randmat<float,9,4>());
        test_lu(3*randmat<float,3,8>());
        test_lu(3*randmat<float,137,200>());
        test_lu(3*randmat<float,200,101>());

        typedef matrix<float,0,0,default_memory_manager, column_major_layout> mat;
        test_lu(mat(3*randmat<float>(4,4)));
        test_lu(mat(3*randmat<float>(9,4)));
        test_lu(mat(3*randmat<float>(3,8)));
    }

// ----------------------------------------------------------------------------------------

    class matrix_tester : public tester
    {
    public:
        matrix_tester (
        ) :
            tester ("test_matrix_lu",
                    "Runs tests on the matrix LU component.")
        {
            rnd.set_seed(cast_to_string(time(0)));
        }

        void perform_test (
        )
        {
            dlog << LINFO << "seed string: " << rnd.get_seed();

            dlog << LINFO << "begin testing with double";
            matrix_test_double();
            dlog << LINFO << "begin testing with float";
            matrix_test_float();
        }
    } a;

}



