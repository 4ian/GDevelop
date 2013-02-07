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
        int& counter_gemv() { static int counter = 0; return counter; }
#endif

    }
}

namespace  
{
    using namespace test;
    using namespace std;
    // Declare the logger we will use in this test.  The name of the logger 
    // should start with "test."
    dlib::logger dlog("test.gemv");


    class blas_bindings_gemv_tester : public tester
    {
    public:
        blas_bindings_gemv_tester (
        ) :
            tester (
                "test_gemv", // the command line argument name for this test
                "Run tests for GEMV routines.", // the command line argument description
                0                     // the number of command line arguments for this test
            )
        {}

        template <typename matrix_type, typename rv_type, typename cv_type>
        void test_gemv_stuff(
            matrix_type& m,
            cv_type& cv,
            rv_type& rv
        ) const
        {
            using namespace dlib;
            using namespace dlib::blas_bindings;

            cv_type cv2;
            rv_type rv2;
            typedef typename matrix_type::type scalar_type;
            scalar_type val;

            counter_gemv() = 0;
            cv2 = m*cv;
            DLIB_TEST(counter_gemv() == 1);

            counter_gemv() = 0;
            cv2 = m*2*cv;
            DLIB_TEST(counter_gemv() == 1);

            counter_gemv() = 0;
            cv2 = m*2*trans(rv);
            DLIB_TEST(counter_gemv() == 1);

            counter_gemv() = 0;
            rv2 = trans(m*2*cv);
            DLIB_TEST(counter_gemv() == 1);

            counter_gemv() = 0;
            rv2 = rv*m;
            DLIB_TEST(counter_gemv() == 1);

            counter_gemv() = 0;
            rv2 = (rv + rv)*m;
            DLIB_TEST(counter_gemv() == 1);

            counter_gemv() = 0;
            rv2 = trans(cv)*m;
            DLIB_TEST(counter_gemv() == 1);
            dlog << dlib::LTRACE << 1;

            counter_gemv() = 0;
            rv2 = trans(cv)*trans(m) + rv*trans(m);
            DLIB_TEST(counter_gemv() == 2);
            dlog << dlib::LTRACE << 2;

            counter_gemv() = 0;
            cv2 = m*trans(trans(cv)*trans(m) + 3*rv*trans(m));
            DLIB_TEST(counter_gemv() == 3);

            // This does one dot and one gemv
            counter_gemv() = 0;
            val = trans(cv)*m*trans(rv);
            DLIB_TEST_MSG(counter_gemv() == 1, counter_gemv());

            // This does one dot and two gemv 
            counter_gemv() = 0;
            val = (trans(cv)*m)*(m*trans(rv));
            DLIB_TEST_MSG(counter_gemv() == 2, counter_gemv());

            // This does one dot and two gemv 
            counter_gemv() = 0;
            val = trans(cv)*m*trans(m)*trans(rv);
            DLIB_TEST_MSG(counter_gemv() == 2, counter_gemv());
        }


        template <typename matrix_type, typename rv_type, typename cv_type>
        void test_gemv_stuff_conj(
            matrix_type& m,
            cv_type& cv,
            rv_type& rv
        ) const
        {
            using namespace dlib;
            using namespace dlib::blas_bindings;

            cv_type cv2;
            rv_type rv2;

            counter_gemv() = 0;
            cv2 = trans(cv)*conj(m);
            DLIB_TEST(counter_gemv() == 1);

            counter_gemv() = 0;
            cv2 = conj(trans(m))*rv;
            DLIB_TEST(counter_gemv() == 1);

            counter_gemv() = 0;
            cv2 = conj(trans(m))*trans(cv);
            DLIB_TEST(counter_gemv() == 1);

            counter_gemv() = 0;
            cv2 = trans(trans(cv)*conj(2*m) + conj(3*trans(m))*rv + conj(trans(m)*3)*trans(cv));
            DLIB_TEST(counter_gemv() == 3);

        }

        void perform_test (
        )
        {
            using namespace dlib;
            typedef dlib::memory_manager<char>::kernel_1a mm;

            dlog << dlib::LINFO << "test double";
            {
                matrix<double> m = randm(4,4);
                matrix<double,0,1> cv = randm(4,1);
                matrix<double,1,0> rv = randm(1,4);
                test_gemv_stuff(m,cv,rv);
            }

            dlog << dlib::LINFO << "test float";
            {
                matrix<float> m = matrix_cast<float>(randm(4,4));
                matrix<float,0,1> cv = matrix_cast<float>(randm(4,1));
                matrix<float,1,0> rv = matrix_cast<float>(randm(1,4));
                test_gemv_stuff(m,cv,rv);
            }

            dlog << dlib::LINFO << "test complex<double>";
            {
                matrix<complex<double> > m = complex_matrix(randm(4,4), randm(4,4));
                matrix<complex<double>,0,1> cv = complex_matrix(randm(4,1), randm(4,1));
                matrix<complex<double>,1,0> rv = complex_matrix(randm(1,4), randm(1,4));
                test_gemv_stuff(m,cv,rv);
            }

            dlog << dlib::LINFO << "test complex<float>";
            {
                matrix<complex<float> > m = matrix_cast<complex<float> >(complex_matrix(randm(4,4), randm(4,4)));
                matrix<complex<float>,0,1> cv = matrix_cast<complex<float> >(complex_matrix(randm(4,1), randm(4,1)));
                matrix<complex<float>,1,0> rv = matrix_cast<complex<float> >(complex_matrix(randm(1,4), randm(1,4)));
                test_gemv_stuff(m,cv,rv);
            }


            dlog << dlib::LINFO << "test double";
            {
                matrix<double,0,0,mm,column_major_layout> m = randm(4,4);
                matrix<double,0,1,mm,column_major_layout> cv = randm(4,1);
                matrix<double,1,0,mm,column_major_layout> rv = randm(1,4);
                test_gemv_stuff(m,cv,rv);
            }

            dlog << dlib::LINFO << "test float";
            {
                matrix<float,0,0,mm,column_major_layout> m = matrix_cast<float>(randm(4,4));
                matrix<float,0,1,mm,column_major_layout> cv = matrix_cast<float>(randm(4,1));
                matrix<float,1,0,mm,column_major_layout> rv = matrix_cast<float>(randm(1,4));
                test_gemv_stuff(m,cv,rv);
            }

            dlog << dlib::LINFO << "test complex<double>";
            {
                matrix<complex<double>,0,0,mm,column_major_layout > m = complex_matrix(randm(4,4), randm(4,4));
                matrix<complex<double>,0,1,mm,column_major_layout> cv = complex_matrix(randm(4,1), randm(4,1));
                matrix<complex<double>,1,0,mm,column_major_layout> rv = complex_matrix(randm(1,4), randm(1,4));
                test_gemv_stuff(m,cv,rv);
            }

            dlog << dlib::LINFO << "test complex<float>";
            {
                matrix<complex<float>,0,0,mm,column_major_layout > m = matrix_cast<complex<float> >(complex_matrix(randm(4,4), randm(4,4)));
                matrix<complex<float>,0,1,mm,column_major_layout> cv = matrix_cast<complex<float> >(complex_matrix(randm(4,1), randm(4,1)));
                matrix<complex<float>,1,0,mm,column_major_layout> rv = matrix_cast<complex<float> >(complex_matrix(randm(1,4), randm(1,4)));
                test_gemv_stuff(m,cv,rv);
            }


            print_spinner();
        }
    };

    blas_bindings_gemv_tester a;

}


