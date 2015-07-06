// Copyright (C) 2011  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.


#include <dlib/any.h>
#include <sstream>
#include <string>
#include <cstdlib>
#include <ctime>
#include <vector>
#include "../rand.h"

#include "tester.h"


namespace  
{

    using namespace test;
    using namespace dlib;
    using namespace std;

    logger dlog("test.any_function");

// ----------------------------------------------------------------------------------------

    int add ( int a, int b) { return a + b; }
    string cat ( string a, string b) { return a + b; }

// ----------------------------------------------------------------------------------------

    void set_vals1( int& a) { a = 1; }
    void set_vals2( int& a, int& b) { a = 1; b = 2; }
    void set_vals3( int& a, int& b, int& c) { a = 1; b = 2; c = 3; }
    void set_vals4( int& a, int& b, int& c, int& d) { a = 1; b = 2; c = 3; d = 4; }
    void set_vals5( int& a, int& b, int& c, int& d, int& e) { a = 1; b = 2; c = 3; d = 4; e = 5; }
    void set_vals6( int& a, int& b, int& c, int& d, int& e, int& f) { a = 1; b = 2; c = 3; d = 4; e = 5; f = 6; }
    void set_vals7( int& a, int& b, int& c, int& d, int& e, int& f, int& g) { a = 1; b = 2; c = 3; d = 4; e = 5; f = 6; g = 7; }

    void set_vals8( int& a, int& b, int& c, int& d, int& e, int& f, int& g, int& h) 
    { a = 1; b = 2; c = 3; d = 4; e = 5; f = 6; g = 7; h = 8; }

    void set_vals9( int& a, int& b, int& c, int& d, int& e, int& f, int& g, int& h, int& i) 
    { a = 1; b = 2; c = 3; d = 4; e = 5; f = 6; g = 7; h = 8; i = 9;}

    void set_vals10( int& a, int& b, int& c, int& d, int& e, int& f, int& g, int& h, int& i, int& j) 
    { a = 1; b = 2; c = 3; d = 4; e = 5; f = 6; g = 7; h = 8; i = 9; j = 10;}

    void zero_vals( int& a, int& b, int& c, int& d, int& e, int& f, int& g, int& h, int& i, int& j) 
    { a = 0; b = 0; c = 0; d = 0; e = 0; f = 0; g = 0; h = 0; i = 0; j = 0;}

// ----------------------------------------------------------------------------------------

    struct test
    {
        int operator()() const { return 4; }
    };

    struct test2
    {
        int v;

        test2() : v(0) {}
        test2(int val) : v(val) {}
        int operator()() const { return v; }
    };

// ----------------------------------------------------------------------------------------

    void test_contains_4(
        const any_function<int()> a
    )
    {
        DLIB_TEST(a.is_empty() == false);
        DLIB_TEST(a.is_set() == true);
        DLIB_TEST(a.contains<test>() == true);
        DLIB_TEST(a.contains<int(*)()>() == false);
        DLIB_TEST(any_cast<test>(a)() == 4);
        DLIB_TEST(a() == 4);
    }

// ----------------------------------------------------------------------------------------

    void run_test()
    {
        any_function<int()> a, b, c;

        DLIB_TEST(a.is_empty());
        DLIB_TEST(a.is_set()==false);
        DLIB_TEST(a.contains<int(*)()>() == false);
        DLIB_TEST(a.contains<test>() == false);
        DLIB_TEST(a.is_empty());

        a = b;

        swap(a,b);
        a.swap(b);

        a = test();
        test_contains_4(a);


        bool error = false;
        try
        {
            any_cast<int(*)()>(a);
        }
        catch (bad_any_cast&)
        {
            error = true;
        }
        DLIB_TEST(error);

        swap(a,b);

        test_contains_4(b);

        DLIB_TEST(a.is_empty());

        a = b;

        test_contains_4(a);

        c.get<test2>() = test2(10);
        DLIB_TEST(c.get<test2>().v == 10); 

        a = c;
        DLIB_TEST(a.cast_to<test2>().v == 10); 


        a.clear();
        DLIB_TEST(a.is_empty());
        error = false;
        try
        {
            any_cast<test>(a);
        }
        catch (bad_any_cast&)
        {
            error = true;
        }
        DLIB_TEST(error);

    }

// ----------------------------------------------------------------------------------------

    void run_test2()
    {
        any_function<int(int,int)> f = &add;

        DLIB_TEST(f(1,3) == 4);

        any_function<string(string,string)> g(&cat);
        DLIB_TEST(g("one", "two") == "onetwo");
    }

// ----------------------------------------------------------------------------------------

    void run_test3()
    {
        any_function<void(int&)> f1;
        any_function<void(int&,int&)> f2;
        any_function<void(int&,int&,int&)> f3;
        any_function<void(int&,int&,int&,int&)> f4;
        any_function<void(int&,int&,int&,int&,int&)> f5;
        any_function<void(int&,int&,int&,int&,int&,int&)> f6;
        any_function<void(int&,int&,int&,int&,int&,int&,int&)> f7;
        any_function<void(int&,int&,int&,int&,int&,int&,int&,int&)> f8;
        any_function<void(int&,int&,int&,int&,int&,int&,int&,int&,int&)> f9;
        any_function<void(int&,int&,int&,int&,int&,int&,int&,int&,int&,int&)> f10;

        f1 = set_vals1;
        f2 = set_vals2;
        f3 = set_vals3;
        f4 = set_vals4;
        f5 = set_vals5;
        f6 = set_vals6;
        f7 = set_vals7;
        f8 = set_vals8;
        f9 = set_vals9;
        f10 = set_vals10;

        int a,b,c,d,e,f,g,h,i,j;

        zero_vals(a,b,c,d,e,f,g,h,i,j);

        f1(a);
        DLIB_TEST(a==1);
        zero_vals(a,b,c,d,e,f,g,h,i,j);

        f2(a,b);
        DLIB_TEST(a==1 && b==2);
        zero_vals(a,b,c,d,e,f,g,h,i,j);

        f3(a,b,c);
        DLIB_TEST(a==1 && b==2 && c==3);
        zero_vals(a,b,c,d,e,f,g,h,i,j);

        f4(a,b,c,d);
        DLIB_TEST(a==1 && b==2 && c==3 && d==4);
        zero_vals(a,b,c,d,e,f,g,h,i,j);

        f5(a,b,c,d,e);
        DLIB_TEST(a==1 && b==2 && c==3 && d==4 && e==5);
        zero_vals(a,b,c,d,e,f,g,h,i,j);

        f6(a,b,c,d,e,f);
        DLIB_TEST(a==1 && b==2 && c==3 && d==4 && e==5 && f==6);
        zero_vals(a,b,c,d,e,f,g,h,i,j);

        f7(a,b,c,d,e,f,g);
        DLIB_TEST(a==1 && b==2 && c==3 && d==4 && e==5 && f==6 && g==7);
        zero_vals(a,b,c,d,e,f,g,h,i,j);

        f8(a,b,c,d,e,f,g,h);
        DLIB_TEST(a==1 && b==2 && c==3 && d==4 && e==5 && f==6 && g==7 && h==8);
        zero_vals(a,b,c,d,e,f,g,h,i,j);

        f9(a,b,c,d,e,f,g,h,i);
        DLIB_TEST(a==1 && b==2 && c==3 && d==4 && e==5 && f==6 && g==7 && h==8 && i==9);
        zero_vals(a,b,c,d,e,f,g,h,i,j);
        
        f10(a,b,c,d,e,f,g,h,i,j);
        DLIB_TEST(a==1 && b==2 && c==3 && d==4 && e==5 && f==6 && g==7 && h==8 && i==9 && j==10);
        zero_vals(a,b,c,d,e,f,g,h,i,j);
    }
// ----------------------------------------------------------------------------------------

    class test_any_function : public tester
    {
    public:
        test_any_function (
        ) :
            tester ("test_any_function",
                    "Runs tests on the any_function component.")
        {}

        void perform_test (
        )
        {
            print_spinner();
            run_test();
            print_spinner();
            run_test2();
            print_spinner();
            run_test3();
        }
    } a;

}


