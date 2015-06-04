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
        int& counter_dot() { static int counter = 0; return counter; }
#endif

    }
}

namespace  
{
    using namespace test;
    using namespace std;
    // Declare the logger we will use in this test.  The name of the logger 
    // should start with "test."
    dlib::logger dlog("test.dot");


    class blas_bindings_dot_tester : public tester
    {
    public:
        blas_bindings_dot_tester (
        ) :
            tester (
                "test_dot", // the command line argument name for this test
                "Run tests for DOT routines.", // the command line argument description
                0                     // the number of command line arguments for this test
            )
        {}

        void test_mat_bindings()
        {
            using namespace dlib;
            using namespace dlib::blas_bindings;
            matrix<double,1,0> rv(10);
            matrix<double,0,1> cv(10);
            double val;

            rv = 1; cv = 1;
            counter_dot() = 0;
            val = rv*cv;
            DLIB_TEST(val == 10);
            DLIB_TEST(counter_dot() == 1);

            rv = 1; cv = 1;
            counter_dot() = 0;
            val = rv*mat(&cv(0),cv.size());
            DLIB_TEST(val == 10);
            DLIB_TEST(counter_dot() == 1);

            rv = 1; cv = 1;
            counter_dot() = 0;
            val = trans(mat(&rv(0),rv.size()))*mat(&cv(0),cv.size());
            DLIB_TEST(val == 10);
            DLIB_TEST(counter_dot() == 1);

            std::vector<double> sv(10,1);
            rv = 1; 
            counter_dot() = 0;
            val = trans(mat(&rv(0),rv.size()))*mat(sv);
            DLIB_TEST(val == 10);
            DLIB_TEST(counter_dot() == 1);


            counter_dot() = 0;
            val = trans(mat(sv))*mat(sv);
            DLIB_TEST(val == 10);
            DLIB_TEST(counter_dot() == 1);

            std_vector_c<double> svc(10,1);
            counter_dot() = 0;
            val = trans(mat(svc))*mat(svc);
            DLIB_TEST(val == 10);
            DLIB_TEST(counter_dot() == 1);


            dlib::array<double> arr(10);
            for (unsigned int i = 0; i < arr.size(); ++i)
                arr[i] = 1;
            counter_dot() = 0;
            val = trans(mat(arr))*mat(arr);
            DLIB_TEST(val == 10);
            DLIB_TEST(counter_dot() == 1);
        }

        template <typename matrix_type, typename cv_type, typename rv_type>
        void test_dot_stuff(
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
            typedef typename matrix_type::type scalar_type;
            scalar_type val;

            counter_dot() = 0;
            m2 = rv*cv;
            DLIB_TEST(counter_dot() == 1);

            counter_dot() = 0;
            val = rv*cv;
            DLIB_TEST(counter_dot() == 1);

            counter_dot() = 0;
            val = rv*3*cv;
            DLIB_TEST(counter_dot() == 1);

            counter_dot() = 0;
            val = rv*trans(rv)*3;
            DLIB_TEST(counter_dot() == 1);

            counter_dot() = 0;
            val = trans(rv*trans(rv)*3 + trans(cv)*cv);
            DLIB_TEST(counter_dot() == 2);


            counter_dot() = 0;
            val = trans(cv)*cv;
            DLIB_TEST(counter_dot() == 1);

            counter_dot() = 0;
            val = trans(cv)*trans(rv);
            DLIB_TEST(counter_dot() == 1);

            counter_dot() = 0;
            val = dot(rv,cv);
            DLIB_TEST(counter_dot() == 1);

            counter_dot() = 0;
            val = dot(rv,colm(cv,0));
            DLIB_TEST(counter_dot() == 1);

            counter_dot() = 0;
            val = dot(cv,cv);
            DLIB_TEST(counter_dot() == 1);

            counter_dot() = 0;
            val = dot(colm(cv,0,cv.size()),colm(cv,0));
            DLIB_TEST(counter_dot() == 1);

            counter_dot() = 0;
            val = dot(rv,rv);
            DLIB_TEST(counter_dot() == 1);

            counter_dot() = 0;
            val = dot(rv,trans(rv));
            DLIB_TEST(counter_dot() == 1);

            counter_dot() = 0;
            val = dot(trans(cv),cv);
            DLIB_TEST(counter_dot() == 1);

            counter_dot() = 0;
            val = dot(trans(cv),trans(rv));
            DLIB_TEST(counter_dot() == 1);


            // This does one dot and one gemv
            counter_dot() = 0;
            val = trans(cv)*m*trans(rv);
            DLIB_TEST_MSG(counter_dot() == 1, counter_dot());

            // This does one dot and two gemv 
            counter_dot() = 0;
            val = (trans(cv)*m)*(m*trans(rv));
            DLIB_TEST_MSG(counter_dot() == 1, counter_dot());

            // This does one dot and two gemv 
            counter_dot() = 0;
            val = trans(cv)*m*trans(m)*trans(rv);
            DLIB_TEST_MSG(counter_dot() == 1, counter_dot());
        }


        template <typename matrix_type, typename cv_type, typename rv_type>
        void test_dot_stuff_conj(
            matrix_type& ,
            rv_type& rv,
            cv_type& cv
        ) const
        {
            using namespace dlib;
            using namespace dlib::blas_bindings;

            rv_type rv2;
            cv_type cv2;
            matrix_type m2;
            typedef typename matrix_type::type scalar_type;
            scalar_type val;

            counter_dot() = 0;
            val = conj(rv)*cv;
            DLIB_TEST(counter_dot() == 1);

            counter_dot() = 0;
            val = trans(conj(cv))*cv;
            DLIB_TEST(counter_dot() == 1);

            counter_dot() = 0;
            val = trans(conj(cv))*trans(rv);
            DLIB_TEST(counter_dot() == 1);

            counter_dot() = 0;
            val = trans(conj(cv))*3*trans(rv);
            DLIB_TEST(counter_dot() == 1);
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
                test_dot_stuff(m,rv,cv);
            }

            dlog << dlib::LINFO << "test float";
            {
                matrix<float> m = matrix_cast<float>(randm(4,4));
                matrix<float,1,0> rv = matrix_cast<float>(randm(1,4));
                matrix<float,0,1> cv = matrix_cast<float>(randm(4,1));
                test_dot_stuff(m,rv,cv);
            }

            dlog << dlib::LINFO << "test complex<double>";
            {
                matrix<complex<double> > m = complex_matrix(randm(4,4), randm(4,4));
                matrix<complex<double>,1,0> rv = complex_matrix(randm(1,4), randm(1,4));
                matrix<complex<double>,0,1> cv = complex_matrix(randm(4,1), randm(4,1));
                test_dot_stuff(m,rv,cv);
                test_dot_stuff_conj(m,rv,cv);
            }

            dlog << dlib::LINFO << "test complex<float>";
            {
                matrix<complex<float> > m = matrix_cast<complex<float> >(complex_matrix(randm(4,4), randm(4,4)));
                matrix<complex<float>,1,0> rv = matrix_cast<complex<float> >(complex_matrix(randm(1,4), randm(1,4)));
                matrix<complex<float>,0,1> cv = matrix_cast<complex<float> >(complex_matrix(randm(4,1), randm(4,1)));
                test_dot_stuff(m,rv,cv);
                test_dot_stuff_conj(m,rv,cv);
            }


            dlog << dlib::LINFO << "test double, column major";
            {
                matrix<double,0,0,mm,column_major_layout> m = randm(4,4);
                matrix<double,1,0,mm,column_major_layout> rv = randm(1,4);
                matrix<double,0,1,mm,column_major_layout> cv = randm(4,1);
                test_dot_stuff(m,rv,cv);
            }

            dlog << dlib::LINFO << "test float, column major";
            {
                matrix<float,0,0,mm,column_major_layout> m = matrix_cast<float>(randm(4,4));
                matrix<float,1,0,mm,column_major_layout> rv = matrix_cast<float>(randm(1,4));
                matrix<float,0,1,mm,column_major_layout> cv = matrix_cast<float>(randm(4,1));
                test_dot_stuff(m,rv,cv);
            }

            dlog << dlib::LINFO << "test complex<double>, column major";
            {
                matrix<complex<double>,0,0,mm,column_major_layout > m = complex_matrix(randm(4,4), randm(4,4));
                matrix<complex<double>,1,0,mm,column_major_layout> rv = complex_matrix(randm(1,4), randm(1,4));
                matrix<complex<double>,0,1,mm,column_major_layout> cv = complex_matrix(randm(4,1), randm(4,1));
                test_dot_stuff(m,rv,cv);
                test_dot_stuff_conj(m,rv,cv);
            }

            dlog << dlib::LINFO << "test complex<float>, column major";
            {
                matrix<complex<float>,0,0,mm,column_major_layout > m = matrix_cast<complex<float> >(complex_matrix(randm(4,4), randm(4,4)));
                matrix<complex<float>,1,0,mm,column_major_layout> rv = matrix_cast<complex<float> >(complex_matrix(randm(1,4), randm(1,4)));
                matrix<complex<float>,0,1,mm,column_major_layout> cv = matrix_cast<complex<float> >(complex_matrix(randm(4,1), randm(4,1)));
                test_dot_stuff(m,rv,cv);
                test_dot_stuff_conj(m,rv,cv);
            }


            test_mat_bindings();

            print_spinner();
        }
    };

    blas_bindings_dot_tester a;

}


