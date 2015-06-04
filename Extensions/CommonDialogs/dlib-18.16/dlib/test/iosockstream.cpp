// Copyright (C) 2012  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.


#include <sstream>
#include <string>
#include <cstdlib>
#include <ctime>
#include <dlib/iosockstream.h>
#include <dlib/server.h>
#include <vector>

#include "tester.h"

namespace  
{

    using namespace test;
    using namespace dlib;
    using namespace std;


    logger dlog("test.iosockstream");

// ----------------------------------------------------------------------------------------

    class serv : public server_iostream
    {
        virtual void on_connect (
            std::istream& in,
            std::ostream& out,
            const std::string& ,
            const std::string& ,
            unsigned short ,
            unsigned short ,
            uint64 
        )
        {
            try
            {
                dlog << LINFO << "serv1: serving connection";

                std::string temp;
                in >> temp;
                DLIB_TEST(temp == "word");
                in >> temp;
                DLIB_TEST(temp == "another");
                out << "yay words ";
                in >> temp;
                DLIB_TEST(temp == "yep");
            }
            catch (error& e)
            {
                error_string = e.what();
            }

        }


    public:
        std::string error_string;

    };

    class serv2 : public server_iostream
    {
        virtual void on_connect (
            std::istream& ,
            std::ostream& out,
            const std::string& ,
            const std::string& ,
            unsigned short ,
            unsigned short ,
            uint64 
        )
        {
            try
            {
                dlog << LINFO << "serv2: serving connection";

                out << "one two three four five";
            }
            catch (error& e)
            {
                error_string = e.what();
            }

        }


    public:
        std::string error_string;

    };

// ----------------------------------------------------------------------------------------

    void test1()
    {
        dlog << LINFO << "in test1()";
        serv theserv;
        theserv.set_listening_port(12345);
        theserv.start_async();

        // wait a little bit to make sure the server has started listening before we try 
        // to connect to it.
        dlib::sleep(500);

        for (int i = 0; i < 200; ++i)
        {
            dlog << LINFO << "i: " << i;
            print_spinner();
            iosockstream stream("localhost:12345");

            stream << "word another ";
            std::string temp;
            stream >> temp;
            DLIB_TEST(temp == "yay");
            stream >> temp;
            DLIB_TEST(temp == "words");
            stream << "yep ";
        }

        // Just to make sure the server finishes processing the last connection before
        // we kill it and accidentally trigger a DLIB_TEST().
        dlib::sleep(500);

        if (theserv.error_string.size() != 0)
            throw error(theserv.error_string);
    }

// ----------------------------------------------------------------------------------------

    void test2()
    {
        dlog << LINFO << "in test2()";
        serv2 theserv;
        theserv.set_listening_port(12345);
        theserv.start_async();

        // wait a little bit to make sure the server has started listening before we try 
        // to connect to it.
        dlib::sleep(500);

        for (int i = 0; i < 200; ++i)
        {
            dlog << LINFO << "i: " << i;
            print_spinner();
            iosockstream stream("localhost:12345");

            std::string temp;
            stream >> temp; DLIB_TEST(temp == "one");
            stream >> temp; DLIB_TEST(temp == "two");
            stream >> temp; DLIB_TEST(temp == "three");
            stream >> temp; DLIB_TEST(temp == "four");
            stream >> temp; DLIB_TEST(temp == "five");
        }
    }

// ----------------------------------------------------------------------------------------

    class test_iosockstream : public tester
    {
    public:
        test_iosockstream (
        ) :
            tester ("test_iosockstream",
                    "Runs tests on the iosockstream component.")
        {}

        void perform_test (
        )
        {
            test1();
            test2();
        }
    } a;

}


