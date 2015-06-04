// Copyright (C) 2011  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.


#include <sstream>
#include <string>
#include <cstdlib>
#include <ctime>
#include <cmath>
#include <dlib/byte_orderer.h>

#include "tester.h"

namespace  
{

    using namespace test;
    using namespace dlib;
    using namespace std;

    logger dlog("test.byte_orderer");


    class byte_orderer_tester : public tester
    {
    public:
        byte_orderer_tester (
        ) :
            tester ("test_byte_orderer",
                    "Runs tests on the byte_orderer component.")
        {}

        void perform_test (
        )
        {
            byte_orderer bo;

            union data
            {
                unsigned char b[4];
                dlib::uint32 val;
            };

            data a;

            a.val = 1;

            if (bo.host_is_little_endian())
            {
                DLIB_TEST(a.b[0] == 1);
                DLIB_TEST(a.b[1] == 0);
                DLIB_TEST(a.b[2] == 0);
                DLIB_TEST(a.b[3] == 0);

                bo.host_to_big(a.val);

                DLIB_TEST(a.b[0] == 0);
                DLIB_TEST(a.b[1] == 0);
                DLIB_TEST(a.b[2] == 0);
                DLIB_TEST(a.b[3] == 1);

                bo.big_to_host(a.val);

                DLIB_TEST(a.b[0] == 1);
                DLIB_TEST(a.b[1] == 0);
                DLIB_TEST(a.b[2] == 0);
                DLIB_TEST(a.b[3] == 0);

                DLIB_TEST(a.val == 1);
                bo.host_to_network(a.val);
                DLIB_TEST(a.val == 0x01000000);
                bo.network_to_host(a.val);
                DLIB_TEST(a.val == 1);
            }
            else
            {
                DLIB_TEST(a.b[0] == 0);
                DLIB_TEST(a.b[1] == 0);
                DLIB_TEST(a.b[2] == 0);
                DLIB_TEST(a.b[3] == 1);

                bo.host_to_little(a.val);

                DLIB_TEST(a.b[0] == 1);
                DLIB_TEST(a.b[1] == 0);
                DLIB_TEST(a.b[2] == 0);
                DLIB_TEST(a.b[3] == 0);

                bo.little_to_host(a.val);

                DLIB_TEST(a.b[0] == 0);
                DLIB_TEST(a.b[1] == 0);
                DLIB_TEST(a.b[2] == 0);
                DLIB_TEST(a.b[3] == 1);


                DLIB_TEST(a.val == 1);
                bo.network_to_host(a.val);
                DLIB_TEST(a.val == 1);
                bo.host_to_network(a.val);
                DLIB_TEST(a.val == 1);

            }


        }
    } a;

}


