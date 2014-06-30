// Copyright (C) 2010  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.

#include "tester.h"
#include <dlib/svm.h>
#include <vector>
#include <sstream>

namespace  
{
    using namespace test;
    using namespace dlib;
    using namespace std;
    dlib::logger dlog("test.is_same_object");


    class is_same_object_tester : public tester
    {
        /*!
            WHAT THIS OBJECT REPRESENTS
                This object represents a unit test.  When it is constructed
                it adds itself into the testing framework.
        !*/
    public:
        is_same_object_tester (
        ) :
            tester (
                "test_is_same_object",       // the command line argument name for this test
                "Run tests on the is_same_object function.", // the command line argument description
                0                     // the number of command line arguments for this test
            )
        {
        }

        struct base {};
        struct derived : public base {};

        template <bool truth>
        void go(const base& a, const base& b)
        {
            DLIB_TEST( is_same_object(a,b) == truth) ;
            DLIB_TEST( is_same_object(b,a) == truth) ;
        }


        template <bool truth>
        void go2(const base& a, const derived& b)
        {
            DLIB_TEST( is_same_object(a,b) == truth) ;
            DLIB_TEST( is_same_object(b,a) == truth) ;
        }


        void perform_test (
        )
        {
            print_spinner();

            int a, b;
            double d;
            DLIB_TEST( is_same_object(a,a) == true) ;
            DLIB_TEST( is_same_object(a,b) == false) ;
            DLIB_TEST( is_same_object(d,b) == false) ;
            DLIB_TEST( is_same_object(d,d) == true) ;

            base sb;
            derived sd, sd2;

            DLIB_TEST( is_same_object(sb,sd) == false) ;
            DLIB_TEST( is_same_object(sd,sb) == false) ;

            go<true>(sd, sd);
            go<false>(sd, sd2);
            go<true>(sb, sb);
            go<false>(sd, sb);

            go2<true>(sd, sd);
            go2<false>(sd2, sd);
            go2<false>(sd, sd2);
            go2<false>(sb, sd);

        }
    };

    // Create an instance of this object.  Doing this causes this test
    // to be automatically inserted into the testing framework whenever this cpp file
    // is linked into the project.  Note that since we are inside an unnamed-namespace 
    // we won't get any linker errors about the symbol a being defined multiple times. 
    is_same_object_tester a;

}



