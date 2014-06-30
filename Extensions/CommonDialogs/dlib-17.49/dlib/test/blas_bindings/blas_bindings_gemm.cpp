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
        int& counter_gemm() { static int counter = 0; return counter; }
#endif

    }
}

namespace  
{
    using namespace test;
    using namespace std;
    // Declare the logger we will use in this test.  The name of the logger 
    // should start with "test."
    dlib::logger dlog("test.gemm");


    class blas_bindings_gemm_tester : public tester
    {
    public:
        blas_bindings_gemm_tester (
        ) :
            tester (
                "test_gemm", // the command line argument name for this test
                "Run tests for GEMM routines.", // the command line argument description
                0                     // the number of command line arguments for this test
            )
        {}

        template <typename matrix_type>
        void test_gemm_stuff(
            const matrix_type& c
        ) const
        {
            using namespace dlib;
            using namespace dlib::blas_bindings;

            matrix_type b, a;
            a = c;

            counter_gemm() = 0;
            b = a*a;
            DLIB_TEST(counter_gemm() == 1);

            counter_gemm() = 0;
            b = a/2*a;
            DLIB_TEST(counter_gemm() == 1);

            counter_gemm() = 0;
            b = a*trans(a) + a;
            DLIB_TEST(counter_gemm() == 1);

            counter_gemm() = 0;
            b = (a+a)*(a+a);
            DLIB_TEST(counter_gemm() == 1);

            counter_gemm() = 0;
            b = a*(a-a);
            DLIB_TEST(counter_gemm() == 1);

            counter_gemm() = 0;
            b = trans(a)*trans(a) + a;
            DLIB_TEST(counter_gemm() == 1);

            counter_gemm() = 0;
            b = trans(trans(trans(a)*a + a));
            DLIB_TEST(counter_gemm() == 1);

            counter_gemm() = 0;
            b = a*a*a*a;
            DLIB_TEST(counter_gemm() == 3);
            b = c;

            counter_gemm() = 0;
            a = a*a*a*a;
            DLIB_TEST(counter_gemm() == 3);
            a = c;

            counter_gemm() = 0;
            a = (b + a*trans(a)*a*3*a)*trans(b);
            DLIB_TEST(counter_gemm() == 4);
            a = c;

            counter_gemm() = 0;
            a = trans((trans(b) + trans(a)*trans(a)*a*3*a)*trans(b));
            DLIB_TEST(counter_gemm() == 4);
            a = c;

            counter_gemm() = 0;
            a = trans((trans(b) + trans(a)*(a)*trans(a)*3*a)*trans(b));
            DLIB_TEST(counter_gemm() == 4);
            a = c;

            counter_gemm() = 0;
            a = trans((trans(b) + trans(a)*(a + b)*trans(a)*3*a)*trans(b));
            DLIB_TEST_MSG(counter_gemm() == 4, counter_gemm());
            a = c;

            counter_gemm() = 0;
            a = trans((trans(b) + trans(a)*(a*8 + b+b+b+b)*trans(a)*3*a)*trans(b));
            DLIB_TEST_MSG(counter_gemm() == 4, counter_gemm());
            a = c;
        }

        template <typename matrix_type>
        void test_gemm_stuff_conj(
            const matrix_type& c
        ) const
        {
            using namespace dlib;
            using namespace dlib::blas_bindings;

            matrix_type b, a;
            a = c;

            counter_gemm() = 0;
            b = a*conj(a);
            DLIB_TEST(counter_gemm() == 1);

            counter_gemm() = 0;
            b = a*trans(conj(a)) + a;
            DLIB_TEST(counter_gemm() == 1);

            counter_gemm() = 0;
            b = conj(trans(a))*trans(a) + a;
            DLIB_TEST(counter_gemm() == 1);

            counter_gemm() = 0;
            b = trans(trans(trans(a)*conj(a) + conj(a)));
            DLIB_TEST(counter_gemm() == 1);

            counter_gemm() = 0;
            b = a*a*conj(a)*a;
            DLIB_TEST(counter_gemm() == 3);
            b = c;

            counter_gemm() = 0;
            a = a*trans(conj(a))*a*a;
            DLIB_TEST(counter_gemm() == 3);
            a = c;

            counter_gemm() = 0;
            a = (b + a*trans(conj(a))*a*3*a)*trans(b);
            DLIB_TEST(counter_gemm() == 4);
            a = c;

            counter_gemm() = 0;
            a = (trans((conj(trans(b)) + trans(a)*conj(trans(a))*a*3*a)*trans(b)));
            DLIB_TEST(counter_gemm() == 4);
            a = c;

            counter_gemm() = 0;
            a = ((trans(b) + trans(a)*(a)*trans(a)*3*a)*trans(conj(b)));
            DLIB_TEST(counter_gemm() == 4);
            a = c;

            counter_gemm() = 0;
            a = trans((trans(b) + trans(a)*conj(a + b)*trans(a)*3*a)*trans(b));
            DLIB_TEST_MSG(counter_gemm() == 4, counter_gemm());
            a = c;

            counter_gemm() = 0;
            a = trans((trans(b) + trans(a)*(a*8 + b+b+b+b)*trans(a)*3*conj(a))*trans(b));
            DLIB_TEST_MSG(counter_gemm() == 4, counter_gemm());
            a = c;
        }

        void perform_test (
        )
        {
            using namespace dlib;
            typedef dlib::memory_manager<char>::kernel_1a mm;

            print_spinner();

            dlog << dlib::LINFO << "test double";
            {
                matrix<double> a = randm(4,4);
                test_gemm_stuff(a);
            }

            print_spinner();
            dlog << dlib::LINFO << "test float";
            {
                matrix<float> a = matrix_cast<float>(randm(4,4));
                test_gemm_stuff(a);
            }

            print_spinner();
            dlog << dlib::LINFO << "test complex<float>";
            {
                matrix<float> a = matrix_cast<float>(randm(4,4));
                matrix<float> b = matrix_cast<float>(randm(4,4));
                matrix<complex<float> > c = complex_matrix(a,b);
                test_gemm_stuff(c);
                test_gemm_stuff_conj(c);
            }

            print_spinner();
            dlog << dlib::LINFO << "test complex<double>";
            {
                matrix<double> a = matrix_cast<double>(randm(4,4));
                matrix<double> b = matrix_cast<double>(randm(4,4));
                matrix<complex<double> > c = complex_matrix(a,b);
                test_gemm_stuff(c);
                test_gemm_stuff_conj(c);
            }


            print_spinner();

            dlog << dlib::LINFO << "test double, column major";
            {
                matrix<double,100,100,mm,column_major_layout> a = randm(100,100);
                test_gemm_stuff(a);
            }

            print_spinner();
            dlog << dlib::LINFO << "test float, column major";
            {
                matrix<float,100,100,mm,column_major_layout> a = matrix_cast<float>(randm(100,100));
                test_gemm_stuff(a);
            }

            print_spinner();
            dlog << dlib::LINFO << "test complex<double>, column major";
            {
                matrix<double,100,100,mm,column_major_layout> a = matrix_cast<double>(randm(100,100));
                matrix<double,100,100,mm,column_major_layout> b = matrix_cast<double>(randm(100,100));
                matrix<complex<double>,100,100,mm,column_major_layout > c = complex_matrix(a,b);
                test_gemm_stuff(c);
                test_gemm_stuff_conj(c);
            }

            print_spinner();

            dlog << dlib::LINFO << "test complex<float>, column major";
            {
                matrix<float,100,100,mm,column_major_layout> a = matrix_cast<float>(randm(100,100));
                matrix<float,100,100,mm,column_major_layout> b = matrix_cast<float>(randm(100,100));
                matrix<complex<float>,100,100,mm,column_major_layout > c = complex_matrix(a,b);
                test_gemm_stuff(c);
                test_gemm_stuff_conj(c);
            }


            print_spinner();
        }
    };

    blas_bindings_gemm_tester a;

}


