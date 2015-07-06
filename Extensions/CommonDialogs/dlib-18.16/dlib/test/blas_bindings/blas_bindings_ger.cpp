// Copyright (C) 2009  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.

#include "../tester.h"
#include <dlib/matrix.h>

#ifndef DLIB_USE_BLAS
#error "BLAS bindings must be used for this test to make any sense"
#endif

namespace dlib
{
    namespace blas_bindings
    {
        // This is a little screwy.  This function is used inside the BLAS
        // bindings to count how many times each of the BLAS functions get called.
#ifdef DLIB_TEST_BLAS_BINDINGS
        int& counter_ger() { static int counter = 0; return counter; }
#endif

    }
}

namespace  
{
    using namespace test;
    using namespace std;
    // Declare the logger we will use in this test.  The name of the logger 
    // should start with "test."
    dlib::logger dlog("test.ger");


    class blas_bindings_ger_tester : public tester
    {
    public:
        blas_bindings_ger_tester (
        ) :
            tester (
                "test_ger", // the command line argument name for this test
                "Run tests for GER routines.", // the command line argument description
                0                     // the number of command line arguments for this test
            )
        {}

        template <typename matrix_type, typename cv_type, typename rv_type>
        void test_ger_stuff(
            matrix_type& m,
            rv_type& rv,
            cv_type& cv
        ) const
        {
            using namespace dlib;
            using namespace dlib::blas_bindings;

            rv_type rv2;
            cv_type cv2;
            matrix_type m2;

            counter_ger() = 0;
            m2 = m + cv*rv;
            DLIB_TEST_MSG(counter_ger() == 1, counter_ger());

            counter_ger() = 0;
            m += trans(rv)*rv;
            DLIB_TEST(counter_ger() == 1);

            counter_ger() = 0;
            m += trans(rv)*trans(cv);
            DLIB_TEST(counter_ger() == 1);

            counter_ger() = 0;
            m += cv*trans(cv);
            DLIB_TEST(counter_ger() == 1);

            counter_ger() = 0;
            m += trans(rv)*rv + trans(cv*3*rv);
            DLIB_TEST(counter_ger() == 2);
        }


        template <typename matrix_type, typename cv_type, typename rv_type>
        void test_ger_stuff_conj(
            matrix_type& m,
            rv_type& rv,
            cv_type& cv
        ) const
        {
            using namespace dlib;
            using namespace dlib::blas_bindings;

            rv_type rv2;
            cv_type cv2;
            matrix_type m2;

            counter_ger() = 0;
            m += cv*conj(rv);
            DLIB_TEST_MSG(counter_ger() == 1, counter_ger());

            counter_ger() = 0;
            m += trans(rv)*conj(rv);
            DLIB_TEST(counter_ger() == 1);

            counter_ger() = 0;
            m += trans(rv)*conj(trans(cv));
            DLIB_TEST(counter_ger() == 1);

            counter_ger() = 0;
            m += cv*trans(conj(cv));
            DLIB_TEST(counter_ger() == 1);

            counter_ger() = 0;
            m += trans(rv)*rv + trans(cv*3*conj(rv));
            DLIB_TEST(counter_ger() == 2);
        }

        void perform_test (
        )
        {
            using namespace dlib;
            typedef dlib::memory_manager<char>::kernel_1a mm;

            dlog << dlib::LINFO << "test double";
            {
                matrix<double> m = randm(4,4);
                matrix<double,1,0> rv = randm(1,4);
                matrix<double,0,1> cv = randm(4,1);
                test_ger_stuff(m,rv,cv);
            }

            dlog << dlib::LINFO << "test float";
            {
                matrix<float> m = matrix_cast<float>(randm(4,4));
                matrix<float,1,0> rv = matrix_cast<float>(randm(1,4));
                matrix<float,0,1> cv = matrix_cast<float>(randm(4,1));
                test_ger_stuff(m,rv,cv);
            }

            dlog << dlib::LINFO << "test complex<double>";
            {
                matrix<complex<double> > m = complex_matrix(randm(4,4), randm(4,4));
                matrix<complex<double>,1,0> rv = complex_matrix(randm(1,4), randm(1,4));
                matrix<complex<double>,0,1> cv = complex_matrix(randm(4,1), randm(4,1));
                test_ger_stuff(m,rv,cv);
                test_ger_stuff_conj(m,rv,cv);
            }

            dlog << dlib::LINFO << "test complex<float>";
            {
                matrix<complex<float> > m = matrix_cast<complex<float> >(complex_matrix(randm(4,4), randm(4,4)));
                matrix<complex<float>,1,0> rv = matrix_cast<complex<float> >(complex_matrix(randm(1,4), randm(1,4)));
                matrix<complex<float>,0,1> cv = matrix_cast<complex<float> >(complex_matrix(randm(4,1), randm(4,1)));
                test_ger_stuff(m,rv,cv);
                test_ger_stuff_conj(m,rv,cv);
            }


            dlog << dlib::LINFO << "test double";
            {
                matrix<double,0,0,mm,column_major_layout> m = randm(4,4);
                matrix<double,1,0,mm,column_major_layout> rv = randm(1,4);
                matrix<double,0,1,mm,column_major_layout> cv = randm(4,1);
                test_ger_stuff(m,rv,cv);
            }

            dlog << dlib::LINFO << "test float";
            {
                matrix<float,0,0,mm,column_major_layout> m = matrix_cast<float>(randm(4,4));
                matrix<float,1,0,mm,column_major_layout> rv = matrix_cast<float>(randm(1,4));
                matrix<float,0,1,mm,column_major_layout> cv = matrix_cast<float>(randm(4,1));
                test_ger_stuff(m,rv,cv);
            }

            dlog << dlib::LINFO << "test complex<double>";
            {
                matrix<complex<double>,0,0,mm,column_major_layout > m = complex_matrix(randm(4,4), randm(4,4));
                matrix<complex<double>,1,0,mm,column_major_layout> rv = complex_matrix(randm(1,4), randm(1,4));
                matrix<complex<double>,0,1,mm,column_major_layout> cv = complex_matrix(randm(4,1), randm(4,1));
                test_ger_stuff(m,rv,cv);
                test_ger_stuff_conj(m,rv,cv);
            }

            dlog << dlib::LINFO << "test complex<float>";
            {
                matrix<complex<float>,0,0,mm,column_major_layout > m = matrix_cast<complex<float> >(complex_matrix(randm(4,4), randm(4,4)));
                matrix<complex<float>,1,0,mm,column_major_layout> rv = matrix_cast<complex<float> >(complex_matrix(randm(1,4), randm(1,4)));
                matrix<complex<float>,0,1,mm,column_major_layout> cv = matrix_cast<complex<float> >(complex_matrix(randm(4,1), randm(4,1)));
                test_ger_stuff(m,rv,cv);
                test_ger_stuff_conj(m,rv,cv);
            }


            print_spinner();
        }
    };

    blas_bindings_ger_tester a;

}


