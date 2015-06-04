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

    DLIB_MAKE_HAS_MEMBER_FUNCTION_TEST(has_booya_template, void, template booya<int>, (std::string)const);
    DLIB_MAKE_HAS_MEMBER_FUNCTION_TEST(has_booya2_template, void, template booya2<int>, (int)const);
    DLIB_MAKE_HAS_MEMBER_FUNCTION_TEST(has_funct_int, void, funct, (int));
    DLIB_MAKE_HAS_MEMBER_FUNCTION_TEST(has_funct_double, void, funct, (double));
    DLIB_MAKE_HAS_MEMBER_FUNCTION_TEST(has_funct_f, float, funct_f, (int));

    class htest
    {
    public:
        template <typename EXP>
        void booya(std::string) const {}

        template <typename EXP>
        void booya2(EXP) const {}

        void funct(double) {}
    };

    class htest2
    {
    public:

        void funct(int) {}

        float funct_f(int) { return 0;}
    };

    void test_metaprog()
    {
        DLIB_TEST(has_booya2_template<htest>::value  == true)
        DLIB_TEST(has_booya2_template<htest2>::value == false)

#if _MSC_VER > 1600 // there is a bug in visual studio 2010 and older that prevents this test from working
        DLIB_TEST(has_booya_template<htest>::value  == true)
#endif

        DLIB_TEST(has_booya_template<htest2>::value == false)

        DLIB_TEST(has_funct_int<htest>::value  == false)
        DLIB_TEST(has_funct_int<htest2>::value == true)
        DLIB_TEST(has_funct_double<htest>::value  == true)
        DLIB_TEST(has_funct_double<htest2>::value == false)

        DLIB_TEST(has_funct_f<htest>::value  == false)
        DLIB_TEST(has_funct_f<htest2>::value == true)
    }

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

            test_metaprog();
        }
    };

    // Create an instance of this object.  Doing this causes this test
    // to be automatically inserted into the testing framework whenever this cpp file
    // is linked into the project.  Note that since we are inside an unnamed-namespace 
    // we won't get any linker errors about the symbol a being defined multiple times. 
    is_same_object_tester a;

}



