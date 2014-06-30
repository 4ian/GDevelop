// Copyright (C) 2007  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.


#include <sstream>
#include <string>
#include <cstdlib>
#include <ctime>
#include <dlib/tuple.h>

#include "tester.h"

namespace  
{
    using namespace test;
    using namespace dlib;
    using namespace std;

    logger dlog("test.tuple");

    struct nil 
    {
        template <typename T>
        void operator() (
            const T& 
        ) const
        {
        }
    };


    struct inc 
    {
        template <typename T>
        void operator() (
            T& a
        ) const
        {
            a += 1;
        }
    };


    template <typename T>
    void check_const (
        const T& t
    )
    {
        t.template get<0>();

        typedef typename T::template get_type<0>::type type0;
        t.template get<type0>();
        t.template index<type0>();
    }

    template <typename T>
    void check_nonconst (
        T& t
    )
    {
        t.template get<0>();

        typedef typename T::template get_type<0>::type type0;
        t.template get<type0>();
        t.template index<type0>();
    }

    void tuple_test (
    )
    /*!
        ensures
            - runs tests on tuple functions for compliance with the specs 
    !*/
    {        

        print_spinner();

        using dlib::tuple;

        tuple<> a;
        tuple<int> b;
        tuple<int, float> c;


        a.get<1>();
        a.get<2>();
        a.get<3>();
        a.get<4>();
        a.get<5>();

        check_nonconst(b);
        check_nonconst(c);
        check_const(b);
        check_const(c);

        COMPILE_TIME_ASSERT((is_same_type<tuple<>::get_type<0>::type, null_type>::value));
        COMPILE_TIME_ASSERT((is_same_type<tuple<int>::get_type<0>::type, int>::value));
        COMPILE_TIME_ASSERT((is_same_type<tuple<int,float>::get_type<0>::type, int>::value));
        COMPILE_TIME_ASSERT((is_same_type<tuple<int,float>::get_type<1>::type, float>::value));
        COMPILE_TIME_ASSERT((is_same_type<tuple<int,float>::get_type<2>::type, null_type>::value));

        b.get<0>() = 8;
        DLIB_TEST(b.get<int>() == 8);
        DLIB_TEST(b.index<int>() == 0);

        c.get<0>() = 9;
        DLIB_TEST(c.get<int>() == 9);
        DLIB_TEST(c.index<int>() == 0);
        c.get<1>() = 3.0;
        DLIB_TEST(c.get<float>() == 3.0);
        DLIB_TEST(c.index<float>() == 1);



        {
            typedef tuple<int, short, long> T;
            T a, b;
            a.get<0>() = 1;
            a.get<1>() = 3;
            a.get<2>() = 2;

            b = a;

            inc i;
            nil n;
            a.for_each(inc());
            a.for_each(i);
            const_cast<const T&>(a).for_each(nil());
            const_cast<const T&>(a).for_each(n);

            DLIB_TEST(a.get<0>() == b.get<0>()+2);
            DLIB_TEST(a.get<1>() == b.get<1>()+2);
            DLIB_TEST(a.get<2>() == b.get<2>()+2);

            ostringstream sout;

            serialize(a,sout);
            istringstream sin(sout.str());
            deserialize(b,sin);

            DLIB_TEST(a.get<0>() == b.get<0>());
            DLIB_TEST(a.get<1>() == b.get<1>());
            DLIB_TEST(a.get<2>() == b.get<2>());

            a.for_index(i,0);
            a.for_index(inc(),1);
            const_cast<const T&>(a).for_index(n,2);
            const_cast<const T&>(a).for_index(nil(),0);

            DLIB_TEST(a.get<0>() == b.get<0>()+1);
            DLIB_TEST(a.get<1>() == b.get<1>()+1);
            DLIB_TEST(a.get<2>() == b.get<2>()+0);

            swap(a,b);

            DLIB_TEST(b.get<0>() == a.get<0>()+1);
            DLIB_TEST(b.get<1>() == a.get<1>()+1);
            DLIB_TEST(b.get<2>() == a.get<2>()+0);
        }


    }




    class tuple_tester : public tester
    {
    public:
        tuple_tester (
        ) :
            tester ("test_tuple",
                    "Runs tests on the tuple object")
        {}

        void perform_test (
        )
        {
            tuple_test();
        }
    } a;

}



