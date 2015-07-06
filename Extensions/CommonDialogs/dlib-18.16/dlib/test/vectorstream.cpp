// Copyright (C) 2012  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.


#include <dlib/vectorstream.h>

#include <sstream>
#include <string>
#include <cstdlib>
#include <ctime>
#include <vector>

#include "tester.h"

namespace  
{

    using namespace test;
    using namespace dlib;
    using namespace std;


    logger dlog("test.vectorstream");

// ----------------------------------------------------------------------------------------

    void test1()
    {
        print_spinner();

        std::vector<char> buf;
        vectorstream s(buf);

        for (int i = -1000; i <= 1000; ++i)
        {
            char ch = i;
            s.put(ch);
        }

        DLIB_TEST(buf.size() == 2001);

        int cnt = -1000;
        for (unsigned long i = 0; i < buf.size(); ++i)
        {
            char ch = cnt;
            DLIB_TEST(buf[i] == ch);
            ++cnt;
        }

        for (int i = -1000; i <= 1000; ++i)
        {
            DLIB_TEST(s.peek() != EOF)
            char ch1 = i;
            char ch2 = s.get();
            DLIB_TEST(ch1 == ch2);
        }

        DLIB_TEST(s.peek() == EOF);
        DLIB_TEST(s.get() == EOF);

        s.clear();
        s.seekg(6);

        for (int i = -1000+6; i <= 1000; ++i)
        {
            DLIB_TEST(s.peek() != EOF)
            char ch1 = i;
            char ch2 = s.get();
            DLIB_TEST(ch1 == ch2);
        }

        DLIB_TEST(s.peek() == EOF);
        DLIB_TEST(s.get() == EOF);

        std::string temp;
        temp = "one two three!";

        s.seekg(0);
        buf.clear();
        s.clear();

        serialize(temp, s);
        std::string temp2;
        deserialize(temp2, s);
        DLIB_TEST(temp2 == temp);

        s.put('1');
        s.put('2');
        s.put('3');
        s.put('4');
        DLIB_TEST(s.get() == '1');
        DLIB_TEST(s.get() == '2');
        DLIB_TEST(s.get() == '3');
        DLIB_TEST(s.get() == '4');

        s.putback('4');
        DLIB_TEST(s.get() == '4');
        s.putback('4');
        s.putback('3');
        s.putback('2');
        s.putback('1');
        DLIB_TEST(s.get() == '1');
        DLIB_TEST(s.get() == '2');
        DLIB_TEST(s.get() == '3');
        DLIB_TEST(s.get() == '4');
        DLIB_TEST(s.good() == true);
        DLIB_TEST(s.get() == EOF);
        DLIB_TEST(s.good() == false);

        // make sure seeking to a crazy offset doesn't mess things up
        s.clear();
        s.seekg(1000000);
        DLIB_TEST(s.get() == EOF);
        DLIB_TEST(s.good() == false);
        s.clear();
        s.seekg(1000000);
        char sbuf[100];
        s.read(sbuf, sizeof(sbuf));
        DLIB_TEST(s.good() == false);
    }

// ----------------------------------------------------------------------------------------

    class test_vectorstream : public tester
    {
    public:
        test_vectorstream (
        ) :
            tester ("test_vectorstream",
                    "Runs tests on the vectorstream component.")
        {}

        void perform_test (
        )
        {
            test1();
        }
    } a;

}


