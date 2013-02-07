// Copyright (C) 2009  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.

#include "../tester.h"
#include <dlib/geometry.h>
#include <dlib/matrix.h>

#ifndef DLIB_USE_BLAS
#error "BLAS bindings must be used for this test to make any sense"
#endif

namespace dlib
{
    namespace blas_bindings
    {

#ifdef DLIB_TEST_BLAS_BINDINGS
        extern int& counter_gemm();
        extern int& counter_gemv(); 
        extern int& counter_ger();
        extern int& counter_dot();
#endif

    }
}

namespace  
{
    using namespace test;
    using namespace std;
    // Declare the logger we will use in this test.  The name of the logger 
    // should start with "test."
    dlib::logger dlog("test.vector");


    class vector_tester : public tester
    {
    public:
        vector_tester (
        ) :
            tester (
                "test_vector", // the command line argument name for this test
                "Run tests on dlib::vector.", // the command line argument description
                0                     // the number of command line arguments for this test
            )
        {}

        template <typename type>
        void test_vector(
        ) const
        {
            using namespace dlib;
            using namespace dlib::blas_bindings;

            dlib::vector<type,2> a2, b2, c2;
            dlib::vector<type,3> a3, b3, c3;

            matrix<type> mat2(2,2), mat3(3,3);
            mat2 = 0;
            mat3 = 0;

            type var = 0;

            // We want to make sure that the BLAS bindings are being called for the 2D and 3D vectors.  That would
            // be very slow.
            counter_gemm() = 0;
            counter_gemv() = 0;
            counter_ger() = 0;
            counter_dot() = 0;

            var = trans(a2)*(a2);
            var = dot(a2,a2);

            a2 = mat2*b2;
            var = trans(b2)*mat2*b2;

            var = trans(a3)*(a3);
            var = dot(a3,a3);

            a3 = mat3*b3;
            var = trans(b3)*mat3*b3;

            mat3 = c3*trans(a3);
            mat2 = c2*trans(a2);

            DLIB_TEST(counter_gemm() == 0 && counter_gemv() == 0 && counter_ger() == 0 && counter_dot() == 0);

        }

        void perform_test (
        )
        {
            using namespace dlib;

            dlog << dlib::LINFO << "test double";
            test_vector<double>();

            dlog << dlib::LINFO << "test float";
            test_vector<float>();

            dlog << dlib::LINFO << "test int";
            test_vector<int>();

            dlog << dlib::LINFO << "test short";
            test_vector<short>();

            print_spinner();
        }
    };

    vector_tester a;

}


