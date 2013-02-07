// Copyright (C) 2003  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.


#include <sstream>
#include <string>
#include <ctime>
#include <cstdlib>

#include <dlib/compress_stream.h>

#include "tester.h"

namespace  
{

    using namespace test;
    using namespace std;
    using namespace dlib;

    logger dlog("test.compress_stream");

    template <
        typename cs
        >
    void compress_stream_kernel_test (
        unsigned long seed
    )
    /*!
        requires
            - cs is an implementation of compress_stream/compress_stream_kernel_abstract.h            
              the alphabet_size for cc is 256
        ensures
            - runs tests on cs for compliance with the specs 
    !*/
    {        


        srand(seed);

        cs test;


        dlog << LTRACE << 1;

        int count = 0;
        while (count < 2)
        {
            print_spinner();
            istringstream sin;
            ostringstream sout;
            string buffer;
            buffer.reserve(10000);
            // fill sin with a bunch of random data in the range 0 to 63
            for (int i = 0; i < 10000; ++i)
            {
                char temp = static_cast<char>(::rand()&0x3f);
                buffer.push_back(temp);
            }

            print_spinner();
            sin.str(buffer);
            string old_buffer = buffer;

            test.compress(sin,sout);
            buffer = sout.str();

            print_spinner();
            // corrput the data in buffer
            buffer[buffer.size()/2]++;

            sin.str(buffer);
            sout.str("");

            bool detected_error = false;
            try {
                test.decompress(sin,sout);
            } catch ( typename cs::decompression_error e )
            {
                detected_error = true;
                ++count;
            }
            

            DLIB_TEST_MSG(detected_error || sout.str() == old_buffer,(unsigned int)sout.str().size());



        } /**/


        dlog << LTRACE << 2;

        for (int j = 0; j < 2; ++j)
        {

            print_spinner();
            istringstream sin;
            ostringstream sout;

            string buffer;

            buffer.reserve(10);

            // make sure a single char can be compressed and decompressed
            for (int i = 0; i < 256; ++i)
            {
                sin.str("");
                sout.str("");
                char ch = static_cast<char>(i);
                buffer = ch;
                sin.str(buffer);

                test.compress(sin,sout);

                sin.str(sout.str());
                sout.str("");
                test.decompress(sin,sout);
                DLIB_TEST(sout.str() == buffer);                   
            }

            print_spinner();

            // make sure you can compress a single char, then append a new
            // compressed single char.  and make sure you can decode the
            // two streams.  Just to make sure the decoder doesn't leave 
            // extra bytes behind or eat more than it should.
            for (int i = 0; i < 500; ++i)
            {
                sin.str("");
                sin.clear();
                sout.str("");
                sout.clear();
                char ch = static_cast<char>(::rand()%256);
                char ch2 = static_cast<char>(::rand()%256);

                buffer = ch;
                sin.str(buffer);



                test.compress(sin,sout);




                buffer = ch2;
                sin.str(buffer);
                test.compress(sin,sout);

                sin.str(sout.str());

                sout.str("");
                test.decompress(sin,sout);
                buffer = ch;
                DLIB_TEST(sout.str() == buffer);




                sout.str("");
                test.decompress(sin,sout);
                buffer = ch2;
                DLIB_TEST(sout.str() == buffer);


            }
            print_spinner();


            // make sure you can compress and decompress the empty string
            sout.str("");
            sin.str("");
            test.compress(sin,sout);
            sin.str(sout.str());
            sout.str("");
            test.decompress(sin,sout);
            DLIB_TEST_MSG(sout.str() == "",sout.str());





            print_spinner();

            sin.str("");
            sout.str("");
            buffer = "";

            buffer.reserve(20000);
            // fill buffer with a bunch of random data in the range 0 to 63
            for (int i = 0; i < 20000; ++i)
            {
                char temp = static_cast<char>(::rand()&0x3f);
                buffer.push_back(temp);
            }

            sin.str(buffer);

            print_spinner();
            test.compress(sin,sout);

            sin.str(sout.str());
            sout.str("");

            print_spinner();
            test.decompress(sin,sout);

            DLIB_TEST(sout.str() == buffer);

            print_spinner();
        }

        dlog << LTRACE << 3;

        // this block will try to compress a bunch of 'a' chars
        {

            istringstream sin;
            ostringstream sout;

            string buffer;


            print_spinner();

            sin.str("");
            sout.str("");
            buffer = "";

            buffer.reserve(50000);
            // fill buffer with a bunch of 'a' chars
            for (int i = 0; i < 50000; ++i)
            {
                char temp = 'a';
                buffer.push_back(temp);
            }

            sin.str(buffer);

            print_spinner();
            test.compress(sin,sout);

            sin.str(sout.str());
            sout.str("");

            print_spinner();
            test.decompress(sin,sout);

            DLIB_TEST(sout.str() == buffer);

            print_spinner();

        }

        dlog << LTRACE << 4;

    }






    class compress_stream_tester : public tester
    {
    public:
        compress_stream_tester (
        ) :
            tester ("test_compress_stream",
                    "Runs tests on the compress_stream component.")
        {}

        void perform_test (
        )
        {
            const unsigned int seed = static_cast<unsigned int>(time(0));
            dlog << LINFO << "using seed: " << seed;

            dlog << LINFO << "testing kernel_1a";
            compress_stream_kernel_test<compress_stream::kernel_1a>(seed);
            dlog << LINFO << "testing kernel_1b";
            compress_stream_kernel_test<compress_stream::kernel_1b>(seed);
            dlog << LINFO << "testing kernel_1c";
            compress_stream_kernel_test<compress_stream::kernel_1c>(seed);
            dlog << LINFO << "testing kernel_1da";
            compress_stream_kernel_test<compress_stream::kernel_1da>(seed);
            dlog << LINFO << "testing kernel_1db";
            compress_stream_kernel_test<compress_stream::kernel_1db>(seed);
            dlog << LINFO << "testing kernel_1ea";
            compress_stream_kernel_test<compress_stream::kernel_1ea>(seed);
            dlog << LINFO << "testing kernel_1eb";
            compress_stream_kernel_test<compress_stream::kernel_1eb>(seed);
            dlog << LINFO << "testing kernel_1ec";
            compress_stream_kernel_test<compress_stream::kernel_1ec>(seed);
            dlog << LINFO << "testing kernel_2a";
            compress_stream_kernel_test<compress_stream::kernel_2a>(seed);
            dlog << LINFO << "testing kernel_3a";
            compress_stream_kernel_test<compress_stream::kernel_3a>(seed);
            dlog << LINFO << "testing kernel_3b";
            compress_stream_kernel_test<compress_stream::kernel_3b>(seed);
        }
    } a;

}

