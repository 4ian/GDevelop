// Copyright (C) 2008  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.


#include <sstream>
#include <string>
#include <cstdlib>
#include <ctime>
#include <dlib/algs.h>

#include "tester.h"

namespace  
{
    using namespace test;
    using namespace dlib;
    using namespace std;

    logger dlog("test.metaprogramming");


    void metaprogramming_test (
    )
    /*!
        ensures
            - runs tests on template metaprogramming objects and functions for compliance with the specs 
    !*/
    {        

        print_spinner();

        DLIB_TEST(is_signed_type<signed char>::value == true);
        DLIB_TEST(is_signed_type<signed short>::value == true);
        DLIB_TEST(is_signed_type<signed int>::value == true);
        DLIB_TEST(is_signed_type<signed long>::value == true);
        DLIB_TEST(is_unsigned_type<signed char>::value == false);
        DLIB_TEST(is_unsigned_type<signed short>::value == false);
        DLIB_TEST(is_unsigned_type<signed int>::value == false);
        DLIB_TEST(is_unsigned_type<signed long>::value == false);

        DLIB_TEST(is_unsigned_type<unsigned char>::value == true);
        DLIB_TEST(is_unsigned_type<unsigned short>::value == true);
        DLIB_TEST(is_unsigned_type<unsigned int>::value == true);
        DLIB_TEST(is_unsigned_type<unsigned long>::value == true);
        DLIB_TEST(is_signed_type<unsigned char>::value == false);
        DLIB_TEST(is_signed_type<unsigned short>::value == false);
        DLIB_TEST(is_signed_type<unsigned int>::value == false);
        DLIB_TEST(is_signed_type<unsigned long>::value == false);


        COMPILE_TIME_ASSERT(is_signed_type<signed char>::value == true);
        COMPILE_TIME_ASSERT(is_signed_type<signed short>::value == true);
        COMPILE_TIME_ASSERT(is_signed_type<signed int>::value == true);
        COMPILE_TIME_ASSERT(is_signed_type<signed long>::value == true);
        COMPILE_TIME_ASSERT(is_unsigned_type<signed char>::value == false);
        COMPILE_TIME_ASSERT(is_unsigned_type<signed short>::value == false);
        COMPILE_TIME_ASSERT(is_unsigned_type<signed int>::value == false);
        COMPILE_TIME_ASSERT(is_unsigned_type<signed long>::value == false);

        COMPILE_TIME_ASSERT(is_unsigned_type<unsigned char>::value == true);
        COMPILE_TIME_ASSERT(is_unsigned_type<unsigned short>::value == true);
        COMPILE_TIME_ASSERT(is_unsigned_type<unsigned int>::value == true);
        COMPILE_TIME_ASSERT(is_unsigned_type<unsigned long>::value == true);
        COMPILE_TIME_ASSERT(is_signed_type<unsigned char>::value == false);
        COMPILE_TIME_ASSERT(is_signed_type<unsigned short>::value == false);
        COMPILE_TIME_ASSERT(is_signed_type<unsigned int>::value == false);
        COMPILE_TIME_ASSERT(is_signed_type<unsigned long>::value == false);


    }




    class metaprogramming_tester : public tester
    {
    public:
        metaprogramming_tester (
        ) :
            tester ("test_metaprogramming",
                    "Runs tests on the metaprogramming objects and functions.")
        {}

        void perform_test (
        )
        {
            metaprogramming_test();
        }
    } a;

}



