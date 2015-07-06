// Copyright (C) 2010  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.


#include <sstream>
#include <string>
#include <cstdlib>
#include <ctime>
#include <dlib/stl_checked.h>

#include "tester.h"

// This is called an unnamed-namespace and it has the effect of making everything inside this file "private"
// so that everything you declare will have static linkage.  Thus we won't have any multiply
// defined symbol errors coming out of the linker when we try to compile the test suite.
namespace  
{

    using namespace test;
    using namespace dlib;
    using namespace std;

    // Declare the logger we will use in this test.  The name of the tester 
    // should start with "test."
    logger dlog("test.std_vector_c");


    class std_vector_c_tester : public tester
    {
        /*!
            WHAT THIS OBJECT REPRESENTS
                This object represents a test for the std_vector_c object.  When it is constructed
                it adds itself into the testing framework.  The command line switch is
                specified as test_std_vector_c by passing that string to the tester constructor.
        !*/
    public:
        std_vector_c_tester (
        ) :
            tester ("test_std_vector_c",
                    "Runs tests on the std_vector_c component.")
        {}

        void perform_test (
        )
        {
            std::vector<int> c;
            std_vector_c<int> a, b;
            a.push_back(3);
            a.push_back(2);
            a.push_back(1);

            DLIB_TEST(a[0] == 3);
            DLIB_TEST(a[1] == 2);
            DLIB_TEST(a[2] == 1);
            c = a;
            DLIB_TEST(c[0] == 3);
            DLIB_TEST(c[1] == 2);
            DLIB_TEST(c[2] == 1);
            DLIB_TEST(c.size() == 3);
            DLIB_TEST(a.size() == 3);
            DLIB_TEST(b.size() == 0);

            DLIB_TEST(a == c);
            DLIB_TEST(!(a != c));
            DLIB_TEST(a <= c);
            DLIB_TEST(a >= c);
            DLIB_TEST(!(a < c));
            DLIB_TEST(!(a > c));

            swap(b,c);
            DLIB_TEST(b[0] == 3);
            DLIB_TEST(b[1] == 2);
            DLIB_TEST(b[2] == 1);
            DLIB_TEST(c.size() == 0);
            DLIB_TEST(b.size() == 3);
            swap(c,b);
            DLIB_TEST(c[0] == 3);
            DLIB_TEST(c[1] == 2);
            DLIB_TEST(c[2] == 1);
            DLIB_TEST(c.size() == 3);
            DLIB_TEST(b.size() == 0);
            swap(a,b);
            DLIB_TEST(b[0] == 3);
            DLIB_TEST(b[1] == 2);
            DLIB_TEST(b[2] == 1);
            DLIB_TEST(b.size() == 3);
            DLIB_TEST(a.size() == 0);


            swap(b,c);
            swap(c,c);


            std_vector_c<int> h(a);
            std_vector_c<int> i(c);
            std::vector<int> j(b);
        }
    } a;

}

