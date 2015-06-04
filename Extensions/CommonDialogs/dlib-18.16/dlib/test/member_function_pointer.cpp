// Copyright (C) 2006  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.


#include <sstream>
#include <string>
#include <cstdlib>
#include <ctime>

#include <dlib/member_function_pointer.h>

#include "tester.h"

namespace  
{
    using namespace test;
    using namespace std;
    using namespace dlib;

    logger dlog("test.member_function_pointer");

    class mfp_test_helper_other
    {
    public:
        mfp_test_helper_other (
        ): i(-1) {}


        mutable int i;


        void go0 (
        ) { i = 0; }
        void go1 (
            int v1
        ) { i = 1*v1; }
        void go2 (
            int v1,int v2
        ) { i = 2*v1*v2; }
        void go3 (
            int v1,int v2,int v3
        ) { i = 3*v1*v2*v3; }
        void go4 (
            int v1,int v2,int v3,int v4
        ) { i = 4*v1*v2*v3*v4; }

    };


    class mfp_test_helper
    {
    public:
        mfp_test_helper (
        ): i(-1) {}


        mutable int i;


        void go0 (
        ) { i = 0; }
        void go1 (
            int v1
        ) { i = 1*v1; }
        void go2 (
            int v1,int v2
        ) { i = 2*v1*v2; }
        void go3 (
            int v1,int v2,int v3
        ) { i = 3*v1*v2*v3; }
        void go4 (
            int v1,int v2,int v3,int v4
        ) { i = 4*v1*v2*v3*v4; }

    };

    class mfp_test_helper_const
    {
    public:
        mfp_test_helper_const (
        ): i(-1) {}


        mutable int i;

        void go0 (
        ) const { i = 0; }
        void go1 (
            int v1
        ) const { i = 1*v1; }
        void go2 (
            int v1,int v2
        ) const { i = 2*v1*v2; }
        void go3 (
            int v1,int v2,int v3
        ) const { i = 3*v1*v2*v3; }
        void go4 (
            int v1,int v2,int v3,int v4
        ) const { i = 4*v1*v2*v3*v4; }
    };

    template <
        template  <typename P1 = void, typename P2 = void, typename P3 = void, typename P4 = void> class mfp,
        typename test_helper
        >
    void member_function_pointer_kernel_test (
    )
    /*!
        requires
            - mfp is an implementation of member_function_pointer/member_function_pointer_kernel_abstract.h 
        ensures
            - runs tests on mfp for compliance with the specs
    !*/
    {        


        test_helper helper;

        mfp<> a0, b0;
        mfp<int> a1, b1;
        mfp<int,int> a2, b2;
        mfp<int,int,int> a3, b3;
        mfp<int,int,int,int> a4, b4;

        mfp<> a0c, b0c;
        mfp<int> a1c, b1c;
        mfp<int,int> a2c, b2c;
        mfp<int,int,int> a3c, b3c;
        mfp<int,int,int,int> a4c, b4c;

        DLIB_TEST(a0c == b0c);
        DLIB_TEST(a1c == b1c);
        DLIB_TEST(a2c == b2c);
        DLIB_TEST(a3c == b3c);
        DLIB_TEST(a4c == b4c);
        DLIB_TEST((a0c != b0c) == false);
        DLIB_TEST((a1c != b1c) == false);
        DLIB_TEST((a2c != b2c) == false);
        DLIB_TEST((a3c != b3c) == false);
        DLIB_TEST((a4c != b4c) == false);

        DLIB_TEST(a0.is_set() == false);
        DLIB_TEST(b0.is_set() == false);
        DLIB_TEST(a0c.is_set() == false);
        DLIB_TEST(b0c.is_set() == false);

        DLIB_TEST(!a0 );
        DLIB_TEST(!b0 );
        DLIB_TEST(!a0c);
        DLIB_TEST(!b0c);

        DLIB_TEST(a1.is_set() == false);
        DLIB_TEST(b1.is_set() == false);
        DLIB_TEST(a1c.is_set() == false);
        DLIB_TEST(b1c.is_set() == false);

        DLIB_TEST(!a1 );
        DLIB_TEST(!b1 );
        DLIB_TEST(!a1c);
        DLIB_TEST(!b1c);


        DLIB_TEST(a2.is_set() == false);
        DLIB_TEST(b2.is_set() == false);
        DLIB_TEST(a2c.is_set() == false);
        DLIB_TEST(b2c.is_set() == false);

        DLIB_TEST(!a2);
        DLIB_TEST(!b2);
        DLIB_TEST(!a2c);
        DLIB_TEST(!b2c);

        DLIB_TEST(a3.is_set() == false);
        DLIB_TEST(b3.is_set() == false);
        DLIB_TEST(a3c.is_set() == false);
        DLIB_TEST(b3c.is_set() == false);

        DLIB_TEST(!a3);
        DLIB_TEST(!b3);
        DLIB_TEST(!a3c);
        DLIB_TEST(!b3c);

        DLIB_TEST(a4.is_set() == false);
        DLIB_TEST(b4.is_set() == false);
        DLIB_TEST(a4c.is_set() == false);
        DLIB_TEST(b4c.is_set() == false);

        DLIB_TEST(!a4);
        DLIB_TEST(!b4);
        DLIB_TEST(!a4c);
        DLIB_TEST(!b4c);

        a0.set(helper,&test_helper::go0);
        a0c.set(helper,&test_helper::go0);
        DLIB_TEST(a0.is_set() == true);
        DLIB_TEST(a0c.is_set() == true);
        DLIB_TEST(b0.is_set() == false);
        DLIB_TEST(b0c.is_set() == false);

        DLIB_TEST(a0);
        DLIB_TEST(a0c);
        DLIB_TEST(!b0);
        DLIB_TEST(!b0c);

        a0 = a0;
        DLIB_TEST(a0 == a0);
        DLIB_TEST(!(a0 != a0));
        DLIB_TEST(a0.is_set() == true);
        DLIB_TEST(a0c.is_set() == true);
        DLIB_TEST(b0.is_set() == false);
        DLIB_TEST(b0c.is_set() == false);

        DLIB_TEST(a0);
        DLIB_TEST(a0c);
        DLIB_TEST(!b0);
        DLIB_TEST(!b0c);

        swap(a0,b0);
        swap(a0c,b0c);
        DLIB_TEST(a0.is_set() == false);
        DLIB_TEST(a0c.is_set() == false);
        DLIB_TEST(b0.is_set() == true);
        DLIB_TEST(b0c.is_set() == true);

        DLIB_TEST(!a0);
        DLIB_TEST(!a0c);
        DLIB_TEST(b0);
        DLIB_TEST(b0c);

        a0 = b0;
        DLIB_TEST(a0 == a0);
        DLIB_TEST(a0 == b0);
        DLIB_TEST(!(a0 != b0));
        DLIB_TEST(a0.is_set() == true);
        DLIB_TEST(a0c.is_set() == false);
        DLIB_TEST(b0.is_set() == true);
        DLIB_TEST(b0c.is_set() == true);

        DLIB_TEST(a0 );
        DLIB_TEST(!a0c);
        DLIB_TEST(b0);
        DLIB_TEST(b0c);


        a0.clear();
        a0c.clear();
        b0.clear();
        b0c.clear();
        DLIB_TEST(a0.is_set() == false);
        DLIB_TEST(a0c.is_set() == false);
        DLIB_TEST(b0.is_set() == false);
        DLIB_TEST(b0c.is_set() == false);


        a1.set(helper,&test_helper::go1);
        a1c.set(helper,&test_helper::go1);
        DLIB_TEST(a1.is_set() == true);
        DLIB_TEST(a1c.is_set() == true);
        DLIB_TEST(b1.is_set() == false);
        DLIB_TEST(b1c.is_set() == false);
        swap(a1,b1);
        swap(a1c,b1c);
        DLIB_TEST(a1.is_set() == false);
        DLIB_TEST(a1c.is_set() == false);
        DLIB_TEST(b1.is_set() == true);
        DLIB_TEST(b1c.is_set() == true);

        DLIB_TEST(!a1);
        DLIB_TEST(!a1c);
        DLIB_TEST(b1);
        DLIB_TEST(b1c);


        a1 = b1;
        DLIB_TEST(a1 == a1);
        DLIB_TEST(a1 == b1);
        DLIB_TEST(!(a1 != b1));
        DLIB_TEST(a1.is_set() == true);
        DLIB_TEST(a1c.is_set() == false);
        DLIB_TEST(b1.is_set() == true);
        DLIB_TEST(b1c.is_set() == true);


        a1.clear();
        a1c.clear();
        b1.clear();
        b1c.clear();
        DLIB_TEST(a1.is_set() == false);
        DLIB_TEST(a1c.is_set() == false);
        DLIB_TEST(b1.is_set() == false);
        DLIB_TEST(b1c.is_set() == false);


        a2.set(helper,&test_helper::go2);
        a2c.set(helper,&test_helper::go2);
        DLIB_TEST(a2.is_set() == true);
        DLIB_TEST(a2c.is_set() == true);
        DLIB_TEST(b2.is_set() == false);
        DLIB_TEST(b2c.is_set() == false);
        swap(a2,b2);
        swap(a2c,b2c);
        DLIB_TEST(a2.is_set() == false);
        DLIB_TEST(a2c.is_set() == false);
        DLIB_TEST(b2.is_set() == true);
        DLIB_TEST(b2c.is_set() == true);

        DLIB_TEST(!a2);
        DLIB_TEST(!a2c);
        DLIB_TEST(b2);
        DLIB_TEST(b2c);
        if (b2)
        {
        }
        else
        {
            DLIB_TEST(false);
        }

        if (a2c)
        {
            DLIB_TEST(false);
        }
        else
        {
            DLIB_TEST(true);
        }

        a2 = b2;
        DLIB_TEST(a2 == a2);
        DLIB_TEST(a2 == b2);
        DLIB_TEST(!(a2 != b2));
        DLIB_TEST(a2.is_set() == true);
        DLIB_TEST(a2c.is_set() == false);
        DLIB_TEST(b2.is_set() == true);
        DLIB_TEST(b2c.is_set() == true);

        a2.clear();
        a2c.clear();
        b2.clear();
        b2c.clear();
        DLIB_TEST(a2.is_set() == false);
        DLIB_TEST(a2c.is_set() == false);
        DLIB_TEST(b2.is_set() == false);
        DLIB_TEST(b2c.is_set() == false);


        a3.set(helper,&test_helper::go3);
        a3c.set(helper,&test_helper::go3);
        DLIB_TEST(a3.is_set() == true);
        DLIB_TEST(a3c.is_set() == true);
        DLIB_TEST(b3.is_set() == false);
        DLIB_TEST(b3c.is_set() == false);
        swap(a3,b3);
        swap(a3c,b3c);
        DLIB_TEST(a3.is_set() == false);
        DLIB_TEST(a3c.is_set() == false);
        DLIB_TEST(b3.is_set() == true);
        DLIB_TEST(b3c.is_set() == true);

        a3 = b3;
        DLIB_TEST(a3 == a3);
        DLIB_TEST(a3 == b3);
        DLIB_TEST(!(a3 != b3));
        DLIB_TEST(a3.is_set() == true);
        DLIB_TEST(a3c.is_set() == false);
        DLIB_TEST(b3.is_set() == true);
        DLIB_TEST(b3c.is_set() == true);


        a3.clear();
        a3c.clear();
        b3.clear();
        b3c.clear();
        DLIB_TEST(a3.is_set() == false);
        DLIB_TEST(a3c.is_set() == false);
        DLIB_TEST(b3.is_set() == false);
        DLIB_TEST(b3c.is_set() == false);


        a4.set(helper,&test_helper::go4);
        a4c.set(helper,&test_helper::go4);
        DLIB_TEST(a4.is_set() == true);
        DLIB_TEST(a4c.is_set() == true);
        DLIB_TEST(b4.is_set() == false);
        DLIB_TEST(b4c.is_set() == false);
        swap(a4,b4);
        swap(a4c,b4c);
        DLIB_TEST(a4.is_set() == false);
        DLIB_TEST(a4c.is_set() == false);
        DLIB_TEST(b4.is_set() == true);
        DLIB_TEST(b4c.is_set() == true);

        a4 = b4;
        a4 = b4;
        a4 = b4;
        a4 = b4;
        DLIB_TEST(a4 == a4);
        DLIB_TEST(a4 == b4);
        DLIB_TEST(!(a4 != b4));
        DLIB_TEST(a4.is_set() == true);
        DLIB_TEST(a4c.is_set() == false);
        DLIB_TEST(b4.is_set() == true);
        DLIB_TEST(b4c.is_set() == true);


        a4.clear();
        a4c.clear();
        b4.clear();
        b4c.clear();
        DLIB_TEST(a4.is_set() == false);
        DLIB_TEST(a4c.is_set() == false);
        DLIB_TEST(b4.is_set() == false);
        DLIB_TEST(b4c.is_set() == false);


        a0.set(helper,&test_helper::go0);
        a0c.set(helper,&test_helper::go0);
        b0 = a0; 
        b0c = a0c;
        helper.i = -1; 
        a0();
        DLIB_TEST(helper.i == 0);
        helper.i = -1; 
        b0();
        DLIB_TEST(helper.i == 0);
        helper.i = -1; 
        a0c();
        DLIB_TEST(helper.i == 0);
        helper.i = -1; 
        b0c();
        DLIB_TEST(helper.i == 0);


        a1.set(helper,&test_helper::go1);
        a1c.set(helper,&test_helper::go1);
        b1 = a1;
        b1c = a1c;
        helper.i = -1; 
        a1(1);
        DLIB_TEST(helper.i == 1);
        helper.i = -1; 
        b1(10);
        DLIB_TEST(helper.i == 1*10);
        helper.i = -1; 
        a1c(20);
        DLIB_TEST(helper.i == 1*20);
        helper.i = -1; 
        b1c(30);
        DLIB_TEST(helper.i == 1*30);


        a2.set(helper,&test_helper::go2);
        a2c.set(helper,&test_helper::go2);
        b2 = a2;
        b2c = a2c;
        helper.i = -1; 
        a2(1,2);
        DLIB_TEST(helper.i == 2*1*2);
        helper.i = -1; 
        b2(3,4);
        DLIB_TEST(helper.i == 2*3*4);
        helper.i = -1; 
        a2c(5,6);
        DLIB_TEST(helper.i == 2*5*6);
        helper.i = -1; 
        b2c(7,8);
        DLIB_TEST(helper.i == 2*7*8);


        a3.set(helper,&test_helper::go3);
        a3c.set(helper,&test_helper::go3);
        b3 = a3;
        b3c = a3c;
        helper.i = -1; 
        a3(1,2,3);
        DLIB_TEST(helper.i == 3*1*2*3);
        helper.i = -1; 
        b3(4,5,6);
        DLIB_TEST(helper.i == 3*4*5*6);
        helper.i = -1; 
        a3c(7,8,9);
        DLIB_TEST(helper.i == 3*7*8*9);
        helper.i = -1; 
        b3c(1,2,3);
        DLIB_TEST(helper.i == 3*1*2*3);


        a4.set(helper,&test_helper::go4);
        a4c.set(helper,&test_helper::go4);
        DLIB_TEST(a4 == a4c);
        b4 = a4;
        b4c = a4c;
        helper.i = -1; 
        a4(1,2,3,4);
        DLIB_TEST(helper.i == 4*1*2*3*4);
        helper.i = -1; 
        b4(5,6,7,8);
        DLIB_TEST(helper.i == 4*5*6*7*8);
        helper.i = -1; 
        a4c(9,1,2,3);
        DLIB_TEST(helper.i == 4*9*1*2*3);
        helper.i = -1; 
        b4c(4,5,6,7);
        DLIB_TEST(helper.i == 4*4*5*6*7);

        DLIB_TEST(a4 == b4);
        DLIB_TEST(a4);
        DLIB_TEST(a4 == b4);
        a4.clear();
        DLIB_TEST(a4 != b4);
        DLIB_TEST(!a4);
        DLIB_TEST(a4 == 0);
        DLIB_TEST(a4 == a4);
        a4 = a4;
        DLIB_TEST(a4 != b4);
        DLIB_TEST(!a4);
        DLIB_TEST(a4 == a4);
        mfp_test_helper_other other;
        a4.set(other,&mfp_test_helper_other::go4);
        DLIB_TEST(a4 != b4);
        DLIB_TEST(a4);
        DLIB_TEST(a4 == a4);
        a4.set(helper,&test_helper::go4);
        DLIB_TEST(a4 == b4);
        DLIB_TEST(a4);
        DLIB_TEST(a4 == a4);



    }



    class member_function_pointer_tester : public tester
    {
    public:
        member_function_pointer_tester (
        ) :
            tester ("test_member_function_pointer",
                    "Runs tests on the member_function_pointer component.")
        {}

        void perform_test (
        )
        {
            member_function_pointer_kernel_test<member_function_pointer,mfp_test_helper>();
            member_function_pointer_kernel_test<member_function_pointer,mfp_test_helper_const>();
        }
    } a;

}


