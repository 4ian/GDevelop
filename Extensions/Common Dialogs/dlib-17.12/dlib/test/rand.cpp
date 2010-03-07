// Copyright (C) 2006  Davis E. King (davisking@users.sourceforge.net)
// License: Boost Software License   See LICENSE.txt for the full license.


#include <sstream>
#include <string>
#include <cstdlib>
#include <ctime>
#include <cmath>
#include <dlib/rand.h>
#include <dlib/compress_stream.h>

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
        DLIB_CASSERT(compressed_size >= 8, "order 0 bps: " << compressed_size);
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
        DLIB_CASSERT(compressed_size >= 8, "order 1 bps: " << compressed_size);
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
        DLIB_CASSERT(compressed_size >= 8, "order 4 bps: " << compressed_size);
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
        DLIB_CASSERT(r.get_seed() == "","");
        r.set_seed(seed.str());

        DLIB_CASSERT(r.get_seed() == seed.str(),"");
        r.clear();
        DLIB_CASSERT(r.get_seed() == "","");
        swap(r,r2);
        DLIB_CASSERT(r.get_seed() == "","");
        r.set_seed(seed.str());
        DLIB_CASSERT(r.get_seed() == seed.str(),"");
        swap(r,r2);
        DLIB_CASSERT(r2.get_seed() == seed.str(),"");
        DLIB_CASSERT(r.get_seed() == "","");
        swap(r,r2);
        DLIB_CASSERT(r.get_seed() == seed.str(),"");
        DLIB_CASSERT(r2.get_seed() == "","");

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
            rand_test<dlib::rand::kernel_1a>();
        }
    } a;

}


