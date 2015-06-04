// Copyright (C) 2011  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.


#include <sstream>
#include <string>
#include <cstdlib>
#include <ctime>
#include <cmath>
#include <dlib/crc32.h>

#include "tester.h"

namespace  
{

    using namespace test;
    using namespace dlib;
    using namespace std;

    logger dlog("test.crc32");


    class crc32_tester : public tester
    {
    public:
        crc32_tester (
        ) :
            tester ("test_crc32",
                    "Runs tests on the crc32 component.")
        {}

        void perform_test (
        )
        {
            DLIB_TEST(crc32("davis").get_checksum() == 0x0445527C);

            crc32 c, c2;
            DLIB_TEST(c.get_checksum() == 0);
            c.add("davis");
            DLIB_TEST(c.get_checksum() == 0x0445527C);
            DLIB_TEST(c2.get_checksum() == 0);
            c2 = c;
            DLIB_TEST(c2.get_checksum() == 0x0445527C);
            crc32 c3(c);
            DLIB_TEST(c3.get_checksum() == 0x0445527C);
            c.add('a');
            c2.add('a');
            c3.add('a');
            DLIB_TEST(c.get_checksum() == 0xB100C606);
            DLIB_TEST(c2.get_checksum() == 0xB100C606);
            DLIB_TEST(c3.get_checksum() == 0xB100C606);


            crc32::kernel_1a cold;
            DLIB_TEST(cold.get_checksum() == 0);
            cold.add("davis");
            DLIB_TEST(cold.get_checksum() == 0x0445527C);

            c.clear();
            DLIB_TEST(c.get_checksum() == 0);
            c.add("davis");
            DLIB_TEST(c.get_checksum() == 0x0445527C);

            std::vector<char> buf;
            for (int i = 0; i < 4000; ++i)
                buf.push_back(i);
            DLIB_TEST(crc32(buf) == 492662731);
        }
    } a;

}


