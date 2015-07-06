// Copyright (C) 2006  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.


#include <sstream>
#include <string>
#include <cstdlib>
#include <ctime>
#include <cmath>
#include <dlib/rand.h>
#include <dlib/compress_stream.h>
#include <dlib/hash.h>

#include "tester.h"

namespace  
{

    using namespace test;
    using namespace dlib;
    using namespace std;

    logger dlog("test.rand");

    void check_bpp (
        const std::string str
    )
    {
        istringstream rdata;
        ostringstream sout;
        rdata.str(str);
        double compressed_size;
        compress_stream::kernel_1a cs1;
        compress_stream::kernel_2a cs2;

        compress_stream_kernel_1<
            entropy_encoder_model_kernel_5<257,entropy_encoder::kernel_1a,4000000,4>,
            entropy_decoder_model_kernel_5<257,entropy_decoder::kernel_1a,4000000,4>,
            crc32::kernel_1a
            > cs3;


        print_spinner();

        rdata.clear();
        rdata.seekg(0);
        sout.clear();
        sout.str("");
        cs1.compress(rdata,sout);
        compressed_size = sout.str().size();
        compressed_size *= 8;
        compressed_size /= str.size();
        DLIB_TEST_MSG(compressed_size >= 8, "order 0 bps: " << compressed_size);
        dlog << LINFO << "order 0: " << compressed_size;

        print_spinner();

        rdata.clear();
        rdata.seekg(0);
        sout.clear();
        sout.str("");
        cs2.compress(rdata,sout);
        compressed_size = sout.str().size();
        compressed_size *= 8;
        compressed_size /= str.size();
        DLIB_TEST_MSG(compressed_size >= 8, "order 1 bps: " << compressed_size);
        dlog << LINFO << "order 1: " << compressed_size;

        print_spinner();

        rdata.clear();
        rdata.seekg(0);
        sout.clear();
        sout.str("");
        cs3.compress(rdata,sout);
        compressed_size = sout.str().size();
        compressed_size *= 8;
        compressed_size /= str.size();
        DLIB_TEST_MSG(compressed_size >= 8, "order 4 bps: " << compressed_size);
        dlog << LINFO << "order 4: " << compressed_size;

    }

    template <
        typename rand
        >
    void rand_test (
    )
    /*!
        requires
            - rand is an implementation of rand/rand_kernel_abstract.h 
              is instantiated with int
        ensures
            - runs tests on rand for compliance with the specs
    !*/
    {        

        ostringstream seed;
        seed << (unsigned int)time(0);

        ostringstream sout;


        rand r, r2;
        DLIB_TEST(r.get_seed() == "");
        r.set_seed(seed.str());

        DLIB_TEST(r.get_seed() == seed.str());
        r.clear();
        DLIB_TEST(r.get_seed() == "");
        swap(r,r2);
        DLIB_TEST(r.get_seed() == "");
        r.set_seed(seed.str());
        DLIB_TEST(r.get_seed() == seed.str());
        swap(r,r2);
        DLIB_TEST(r2.get_seed() == seed.str());
        DLIB_TEST(r.get_seed() == "");
        swap(r,r2);
        DLIB_TEST(r.get_seed() == seed.str());
        DLIB_TEST(r2.get_seed() == "");

        print_spinner();
        unsigned long size = 100000;
        for (unsigned long i = 0; i < size; ++i) 
        {
            uint32 ch = r.get_random_32bit_number();
            sout.write((char*)&ch,4);
        }

        check_bpp(sout.str());
        sout.clear();
        sout.str("");

        print_spinner();
        for (unsigned long i = 0; i < size; ++i) 
        {
            uint16 ch = r.get_random_16bit_number();
            sout.write((char*)&ch,2);
        }

        check_bpp(sout.str());
        sout.clear();
        sout.str("");

        print_spinner();
        for (unsigned long i = 0; i < size; ++i) 
        {
            unsigned char ch = r.get_random_8bit_number();
            sout.write((char*)&ch,1);
        }

        check_bpp(sout.str());
        sout.clear();
        sout.str("");


        // make sure the things can serialize right
        {
            r.clear();
            r2.clear();


            for (int i =0; i < 1000; ++i)
            {
                r.get_random_32bit_number();
                r.get_random_gaussian();
            }

            ostringstream sout;
            serialize(r, sout);

            istringstream sin(sout.str());
            deserialize(r2, sin);


            for (int i =0; i < 1000; ++i)
            {
                DLIB_TEST(r.get_random_32bit_number() == r2.get_random_32bit_number());
                DLIB_TEST(std::abs(r.get_random_gaussian() - r2.get_random_gaussian()) < 1e-14);
            }
        }


        // make sure calling clear() and set_seed("") do the same thing
        {
            r.clear();
            r2.set_seed("");
            rand r3;


            DLIB_TEST(r.get_seed() == r2.get_seed());
            DLIB_TEST(r.get_seed() == r3.get_seed());


            for (int i =0; i < 1000; ++i)
            {
                const uint32 num1 = r.get_random_32bit_number();
                const uint32 num2 = r2.get_random_32bit_number();
                const uint32 num3 = r3.get_random_32bit_number();
                DLIB_TEST( num1 == num2);
                DLIB_TEST( num1 == num3);
            }
        }

    }


    template <typename rand_type>
    void test_normal_numbers(
        rand_type& rnd
    )
    {
        print_spinner();
        dlog << LINFO << "test normality";
        double cnt1 = 0; // num <= -1.2
        double cnt2 = 0; // num <= -0.5 
        double cnt3 = 0; // num <= 0
        double cnt4 = 0; // num <= 0.5
        double cnt5 = 0; // num <= 1.2

        const unsigned long total = 1000000;
        for (unsigned long i = 0; i < total; ++i)
        {
            const double r = rnd.get_random_gaussian();
            if (r <= -1.2) cnt1 += 1;
            if (r <= -0.5) cnt2 += 1;
            if (r <=  0)   cnt3 += 1;
            if (r <=  0.5) cnt4 += 1;
            if (r <=  1.2) cnt5 += 1;
        }

        cnt1 /= total;
        cnt2 /= total;
        cnt3 /= total;
        cnt4 /= total;
        cnt5 /= total;

        dlog << LINFO << "cnt1: "<< cnt1;
        dlog << LINFO << "cnt2: "<< cnt2;
        dlog << LINFO << "cnt3: "<< cnt3;
        dlog << LINFO << "cnt4: "<< cnt4;
        dlog << LINFO << "cnt5: "<< cnt5;

        DLIB_TEST(std::abs(cnt1 - 0.11507) < 0.001);
        DLIB_TEST(std::abs(cnt2 - 0.30854) < 0.001);
        DLIB_TEST(std::abs(cnt3 - 0.5)     < 0.001);
        DLIB_TEST(std::abs(cnt4 - 0.69146) < 0.001);
        DLIB_TEST(std::abs(cnt5 - 0.88493) < 0.001);

    }

    void test_gaussian_random_hash()
    {
        print_spinner();
        dlog << LINFO << "test_gaussian_random_hash()";
        double cnt1 = 0; // num <= -1.2
        double cnt2 = 0; // num <= -0.5 
        double cnt3 = 0; // num <= 0
        double cnt4 = 0; // num <= 0.5
        double cnt5 = 0; // num <= 1.2

        const unsigned long total = 1000000;
        for (unsigned long i = 0; i < total; ++i)
        {
            const double r = gaussian_random_hash(i,0,0);
            if (r <= -1.2) cnt1 += 1;
            if (r <= -0.5) cnt2 += 1;
            if (r <=  0)   cnt3 += 1;
            if (r <=  0.5) cnt4 += 1;
            if (r <=  1.2) cnt5 += 1;
        }
        for (unsigned long i = 0; i < total; ++i)
        {
            const double r = gaussian_random_hash(0,i,0);
            if (r <= -1.2) cnt1 += 1;
            if (r <= -0.5) cnt2 += 1;
            if (r <=  0)   cnt3 += 1;
            if (r <=  0.5) cnt4 += 1;
            if (r <=  1.2) cnt5 += 1;
        }
        for (unsigned long i = 0; i < total; ++i)
        {
            const double r = gaussian_random_hash(0,0,i);
            if (r <= -1.2) cnt1 += 1;
            if (r <= -0.5) cnt2 += 1;
            if (r <=  0)   cnt3 += 1;
            if (r <=  0.5) cnt4 += 1;
            if (r <=  1.2) cnt5 += 1;
        }

        cnt1 /= total*3;
        cnt2 /= total*3;
        cnt3 /= total*3;
        cnt4 /= total*3;
        cnt5 /= total*3;

        dlog << LINFO << "cnt1: "<< cnt1;
        dlog << LINFO << "cnt2: "<< cnt2;
        dlog << LINFO << "cnt3: "<< cnt3;
        dlog << LINFO << "cnt4: "<< cnt4;
        dlog << LINFO << "cnt5: "<< cnt5;

        DLIB_TEST(std::abs(cnt1 - 0.11507) < 0.001);
        DLIB_TEST(std::abs(cnt2 - 0.30854) < 0.001);
        DLIB_TEST(std::abs(cnt3 - 0.5)     < 0.001);
        DLIB_TEST(std::abs(cnt4 - 0.69146) < 0.001);
        DLIB_TEST(std::abs(cnt5 - 0.88493) < 0.001);
    }

    void test_uniform_random_hash()
    {
        print_spinner();
        dlog << LINFO << "test_uniform_random_hash()";
        double cnt1 = 0; // num <= 0.2
        double cnt2 = 0; // num <= 0.4 
        double cnt3 = 0; // num <= 0.6
        double cnt4 = 0; // num <= 0.8
        double cnt5 = 0; // num <= 1.0

        double min_val = 10;
        double max_val = 0;

        const unsigned long total = 1000000;
        for (unsigned long i = 0; i < total; ++i)
        {
            const double r = uniform_random_hash(i,0,0);
            min_val = min(r,min_val);
            max_val = max(r,max_val);

            if (r <=  0.2) cnt1 += 1;
            if (r <=  0.4) cnt2 += 1;
            if (r <=  0.6) cnt3 += 1;
            if (r <=  0.8) cnt4 += 1;
            if (r <=  1.0) cnt5 += 1;
        }
        for (unsigned long i = 0; i < total; ++i)
        {
            const double r = uniform_random_hash(0,i,0);
            min_val = min(r,min_val);
            max_val = max(r,max_val);

            if (r <=  0.2) cnt1 += 1;
            if (r <=  0.4) cnt2 += 1;
            if (r <=  0.6) cnt3 += 1;
            if (r <=  0.8) cnt4 += 1;
            if (r <=  1.0) cnt5 += 1;
        }
        for (unsigned long i = 0; i < total; ++i)
        {
            const double r = uniform_random_hash(0,0,i);
            min_val = min(r,min_val);
            max_val = max(r,max_val);

            if (r <=  0.2) cnt1 += 1;
            if (r <=  0.4) cnt2 += 1;
            if (r <=  0.6) cnt3 += 1;
            if (r <=  0.8) cnt4 += 1;
            if (r <=  1.0) cnt5 += 1;
        }

        cnt1 /= total*3;
        cnt2 /= total*3;
        cnt3 /= total*3;
        cnt4 /= total*3;
        cnt5 /= total*3;

        dlog << LINFO << "cnt1: "<< cnt1;
        dlog << LINFO << "cnt2: "<< cnt2;
        dlog << LINFO << "cnt3: "<< cnt3;
        dlog << LINFO << "cnt4: "<< cnt4;
        dlog << LINFO << "cnt5: "<< cnt5;
        dlog << LINFO << "min_val: "<< min_val;
        dlog << LINFO << "max_val: "<< max_val;

        DLIB_TEST(std::abs(cnt1 - 0.2) < 0.001);
        DLIB_TEST(std::abs(cnt2 - 0.4) < 0.001);
        DLIB_TEST(std::abs(cnt3 - 0.6) < 0.001);
        DLIB_TEST(std::abs(cnt4 - 0.8) < 0.001);
        DLIB_TEST(std::abs(cnt5 - 1.0) < 0.001);
        DLIB_TEST(std::abs(min_val - 0.0) < 0.001);
        DLIB_TEST(std::abs(max_val - 1.0) < 0.001);
    }

    class rand_tester : public tester
    {
    public:
        rand_tester (
        ) :
            tester ("test_rand",
                    "Runs tests on the rand component.")
        {}

        void perform_test (
        )
        {
            dlog << LINFO << "testing kernel_1a";
            rand_test<dlib::rand>();
            rand_test<dlib::rand>();

            dlib::rand rnd;
            test_normal_numbers(rnd);
            test_gaussian_random_hash();
            test_uniform_random_hash();
        }
    } a;

}


