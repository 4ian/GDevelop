// Copyright (C) 2006  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.

#include <sstream>
#include <string>
#include <cstdlib>
#include <ctime>
#include <dlib/base64.h>

#include "tester.h"

namespace  
{
    using namespace test;
    using namespace dlib;
    using namespace std;

    logger dlog("test.base64");

    template <
        typename base64
        >
    void base64_kernel_test (
    )
    /*!
        requires
            - base64 is an implementation of base64/base64_kernel_abstract.h 
        ensures
            - runs tests on base64 for compliance with the specs
    !*/
    {        

        const unsigned int seed = static_cast<unsigned int>(time(0));
        try 
        {
 
            srand(seed);

            base64 test;

            const string wiki_normal = "\
Man is distinguished, not only by his reason, but by this singular passion from other \
animals, which is a lust of the mind, that by a perseverance of delight in the continued \
and indefatigable generation of knowledge, exceeds the short vehemence of any carnal pleasure.";

            const string wiki_encoded = "\
TWFuIGlzIGRpc3Rpbmd1aXNoZWQsIG5vdCBvbmx5IGJ5IGhpcyByZWFzb24sIGJ1dCBieSB0\n\
aGlzIHNpbmd1bGFyIHBhc3Npb24gZnJvbSBvdGhlciBhbmltYWxzLCB3aGljaCBpcyBhIGx1\n\
c3Qgb2YgdGhlIG1pbmQsIHRoYXQgYnkgYSBwZXJzZXZlcmFuY2Ugb2YgZGVsaWdodCBpbiB0\n\
aGUgY29udGludWVkIGFuZCBpbmRlZmF0aWdhYmxlIGdlbmVyYXRpb24gb2Yga25vd2xlZGdl\n\
LCBleGNlZWRzIHRoZSBzaG9ydCB2ZWhlbWVuY2Ugb2YgYW55IGNhcm5hbCBwbGVhc3VyZS4=";



            string str;

            istringstream sin;
            ostringstream sout;

            sin.str(wiki_encoded);
            test.decode(sin,sout);
            DLIB_TEST_MSG(sout.str() == wiki_normal,
                   "sout.str(): " << sout.str() <<
                   "\nwiki_normal: " << wiki_normal);


            sout.str("");
            sin.str(wiki_normal);
            sin.clear();
            test.encode(sin,sout);

            string a(sout.str()), b(wiki_encoded);
            // we want to strip all the whitespace from a and b now
            sin.str(a);
            a.clear();
            sin >> str;
            while (sin)
            {
                a += str;
                sin >> str;
            }

            sin.clear();
            sin.str(b);
            b.clear();
            sin >> str;
            while (sin)
            {
                b += str;
                sin >> str;
            }
            sin.clear();

            DLIB_TEST_MSG(a == b,
                   "a: \n" << a <<
                   "\n\nb: \n" << b);



            sin.clear();
            sin.str("");
            sout.str("");
            test.encode(sin,sout);
            sin.str(sout.str());
            sout.str("");
            test.decode(sin,sout);
            DLIB_TEST(sout.str() == "");

            sin.clear();
            sin.str("a");
            sout.str("");
            test.encode(sin,sout);
            sin.str(sout.str());
            sout.str("");
            test.decode(sin,sout);
            DLIB_TEST(sout.str() == "a");

            sin.clear();
            sin.str("da");
            sout.str("");
            test.encode(sin,sout);
            sin.str(sout.str());
            sout.str("");
            test.decode(sin,sout);
            DLIB_TEST(sout.str() == "da");

            sin.clear();
            sin.str("dav");
            sout.str("");
            test.encode(sin,sout);
            sin.str(sout.str());
            sout.str("");
            test.decode(sin,sout);
            DLIB_TEST(sout.str() == "dav");

            sin.clear();
            sin.str("davi");
            sout.str("");
            test.encode(sin,sout);
            sin.str(sout.str());
            sout.str("");
            test.decode(sin,sout);
            DLIB_TEST(sout.str() == "davi");


            for (int i = 0; i < 1000; ++i)
            {
                str.clear();
                sin.clear();
                sout.str("");
                sin.str("");
                
                // fill str with random garbage
                const int size = rand()%2000;
                for (int j = 0; j < size; ++j)
                {
                    unsigned char ch = rand()&0xFF;
                    str += ch;
                }

                sin.str(str);
                test.encode(sin,sout);
                sin.clear();
                sin.str(sout.str());
                sout.str("");
                test.decode(sin,sout);

                DLIB_TEST(str == sout.str());


            }




        }
        catch (typename base64::decode_error& e)
        {
            DLIB_TEST_MSG(false, 
                "decode_error thrown when it shouldn't have been (" << seed << "):\n " 
                 << e.info);
        }
    }


    class base64_tester : public tester
    {
    public:
        base64_tester (
        ) :
            tester ("test_base64",
                    "Runs tests on the base64 component.")
        {}

        void perform_test (
        )
        {
            print_spinner();
            base64_kernel_test<base64>();
        }
    } a;



}



