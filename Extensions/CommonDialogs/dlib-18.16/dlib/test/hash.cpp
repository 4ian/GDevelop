// Copyright (C) 2011  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.

#include <sstream>
#include <string>
#include <cstdlib>
#include <ctime>
#include <dlib/hash.h>
#include <dlib/rand.h>
#include <dlib/matrix.h>
#include <dlib/byte_orderer.h>

#include "tester.h"

namespace  
{
    using namespace test;
    using namespace dlib;
    using namespace std;

    logger dlog("test.hash");


    template <typename T>
    void to_little (
        std::vector<T>& item
    )
    {
        byte_orderer bo;
        for (unsigned long i = 0; i < item.size(); ++i)
            bo.host_to_little(item[i]);
    }


    template <typename T>
    void to_little (
        matrix<T>& item
    )
    {
        byte_orderer bo;
        for (long r = 0; r < item.nr(); ++r)
        {
            for (long c = 0; c < item.nc(); ++c)
            {
                bo.host_to_little(item(r,c));
            }
        }
    }

    // Run the official test for MurmurHash3
    void murmur_hash_test()
    {
        uint8 key[256];
        uint32 hashes[256];
        uint32 final = 0;

        memset(key,0,sizeof(key));
        memset(hashes,0,sizeof(hashes));

        // Hash keys of the form {0}, {0,1}, {0,1,2}... up to N=255,using 256-N as
        // the seed.
        for(int i = 0; i < 256; i++)
        {
            key[i] = (uint8)i;

            hashes[i] = murmur_hash3(key,i,256-i);
        }

        byte_orderer bo;
        bo.host_to_little(hashes);
        final = murmur_hash3(hashes,sizeof(hashes),0);

        // using ostringstream to avoid compiler error in visual studio 2005
        ostringstream sout;
        sout << hex << final;
        dlog << LINFO << "final: "<< sout.str();
        DLIB_TEST(final == 0xB0F57EE3);
    }

    void murmur_hash_128_test()
    {
        uint8 key[256];
        uint64 hashes[256*2];
        uint32 final = 0;

        memset(key,0,sizeof(key));
        memset(hashes,0,sizeof(hashes));

        // Hash keys of the form {0}, {0,1}, {0,1,2}... up to N=255,using 256-N as
        // the seed.
        for(int i = 0; i < 256; i++)
        {
            key[i] = (uint8)i;

            const std::pair<uint64,uint64> temp = murmur_hash3_128bit(key,i,256-i);
            hashes[2*i]   = temp.first;
            hashes[2*i+1] = temp.second;
        }

        byte_orderer bo;
        bo.host_to_little(hashes);
        final = static_cast<uint32>(murmur_hash3_128bit(hashes,sizeof(hashes),0).first);

        // using ostringstream to avoid compiler error in visual studio 2005
        ostringstream sout;
        sout << hex << final;
        dlog << LINFO << "final 64: "<< sout.str();
        DLIB_TEST(final == 0x6384BA69);
    }

    void test_murmur_hash_128_4()
    {
        byte_orderer bo;
        dlib::rand rnd;
        for (int i = 0; i < 100; ++i)
        {
            uint32 buf[4] = { rnd.get_random_32bit_number(), 
                rnd.get_random_32bit_number(),
                rnd.get_random_32bit_number(),
                rnd.get_random_32bit_number()
            };

            bo.host_to_little(buf);

            std::pair<uint64,uint64> temp1, temp2;

            // Make sure the 4 integer version of murmur hash does the same thing 
            // as the memory block version.
            temp1 = murmur_hash3_128bit(buf, sizeof(buf), 0);
            temp2 = murmur_hash3_128bit(buf[0], buf[1], buf[2], buf[3]);
            DLIB_TEST( temp1.first == temp2.first);
            DLIB_TEST( temp1.second == temp2.second);
        }
    }

    void test_murmur_hash_128_3()
    {
        byte_orderer bo;
        dlib::rand rnd;
        for (int i = 0; i < 100; ++i)
        {
            uint64 buf[2] = { rnd.get_random_64bit_number(), 
                rnd.get_random_64bit_number(),
            };

            const uint32 seed = rnd.get_random_32bit_number();

            bo.host_to_little(buf);
            std::pair<uint64,uint64> temp1, temp2;

            // Make sure the 3 integer version of murmur hash does the same thing 
            // as the memory block version.
            temp1 = murmur_hash3_128bit(buf, sizeof(buf), seed);
            temp2 = murmur_hash3_128bit_3(buf[0], buf[1], seed);
            DLIB_TEST( temp1.first == temp2.first);
            DLIB_TEST( temp1.second == temp2.second);
        }
    }

    void test_murmur_hash_64_2()
    {
        byte_orderer bo;
        dlib::rand rnd;
        for (int i = 0; i < 100; ++i)
        {
            uint32 val = rnd.get_random_32bit_number();
            const uint32 seed = rnd.get_random_32bit_number();


            bo.host_to_little(val);
            uint32 temp1, temp2;

            // Make sure the 2 integer version of murmur hash does the same thing 
            // as the memory block version.
            temp1 = murmur_hash3(&val, sizeof(val), seed);
            temp2 = murmur_hash3_2(val, seed);
            DLIB_TEST(temp1 == temp2);
        }
    }

    void test_murmur_hash_64_3()
    {
        byte_orderer bo;
        dlib::rand rnd;
        for (int i = 0; i < 100; ++i)
        {
            uint32 buf[2] = {rnd.get_random_32bit_number(), 
                             rnd.get_random_32bit_number()};
            const uint32 seed = rnd.get_random_32bit_number();


            bo.host_to_little(buf);
            uint32 temp1, temp2;

            // Make sure the 2 integer version of murmur hash does the same thing 
            // as the memory block version.
            temp1 = murmur_hash3(&buf, sizeof(buf), seed);
            temp2 = murmur_hash3_3(buf[0], buf[1], seed);
            DLIB_TEST(temp1 == temp2);
        }
    }

// ----------------------------------------------------------------------------------------

    uint64  slow_count_bits ( uint64 v)
    {
        uint64 count = 0;
        for (int i = 0; i < 64; ++i)
        {
            if (v&1)
                ++count;
            v >>= 1;
        }
        return count;
    }


    uint32  slow_count_bits ( uint32 v)
    {
        uint32 count = 0;
        for (int i = 0; i < 32; ++i)
        {
            if (v&1)
                ++count;
            v >>= 1;
        }
        return count;
    }


// ----------------------------------------------------------------------------------------

    void test_hamming_stuff()
    {
        dlib::rand rnd;
        for (int i = 0; i < 10000; ++i)
        {
            uint32 v = rnd.get_random_32bit_number();
            uint64 v2 = rnd.get_random_64bit_number();
            DLIB_TEST(slow_count_bits(v) == count_bits(v));
            DLIB_TEST(slow_count_bits(v2) == count_bits(v2));
        }

        DLIB_TEST(hamming_distance((uint32)0x1F, (uint32)0x0F) == 1);
        DLIB_TEST(hamming_distance((uint32)0x1F, (uint32)0x1F) == 0);
        DLIB_TEST(hamming_distance((uint32)0x1F, (uint32)0x19) == 2);
        DLIB_TEST(hamming_distance((uint32)0x2F, (uint32)0x19) == 4);
    }

// ----------------------------------------------------------------------------------------

    class test_hash : public tester
    {
    public:
        test_hash (
        ) :
            tester ("test_hash",
                    "Runs tests on the hash routines.")
        {}

        void perform_test (
        )
        {
            print_spinner();

            test_hamming_stuff();

            murmur_hash_test();
            murmur_hash_128_test();

            std::string str1 = "some random string";
            matrix<unsigned char> mat(2,2);

            mat = 1,2,3,4;

            matrix<uint64> mat2(2,3);

            mat2 = 1,2,3,4,5,6;

            to_little(mat2);

            std::vector<unsigned char> v(4);
            v[0] = 'c';
            v[1] = 'a';
            v[2] = 't';
            v[3] = '!';

            std::vector<uint16> v2(4);
            v[0] = 'c';
            v[1] = 'a';
            v[2] = 't';
            v[3] = '!';
            to_little(v2);

            std::map<unsigned char, unsigned char> m;
            m['c'] = 'C';
            m['a'] = 'A';
            m['t'] = 'T';

            dlog << LINFO << "hash(str1): "<< dlib::hash(str1);
            dlog << LINFO << "hash(v):    "<< dlib::hash(v);
            dlog << LINFO << "hash(v2):   "<< dlib::hash(v2);
            dlog << LINFO << "hash(m):    "<< dlib::hash(m);
            dlog << LINFO << "hash(mat):  "<< dlib::hash(mat);
            dlog << LINFO << "hash(mat2): "<< dlib::hash(mat2);

            uint32 ui1 = 123485393;
            uint64 ui2 = ui1;
            ui2 *= ui2;
            ui2 *= ui2;
            dlog << LINFO << "hash(ui1):                  "<< dlib::hash(ui1);
            dlog << LINFO << "hash(ui2):                  "<< dlib::hash(ui2);
            dlog << LINFO << "hash(make_pair(ui2,ui1)):   "<< dlib::hash(make_pair(ui2,ui1));
            dlog << LINFO << "hash(make_pair(ui2,ui2)):   "<< dlib::hash(make_pair(ui2,ui2));
            dlog << LINFO << "hash(make_pair(ui1,ui1)):   "<< dlib::hash(make_pair(ui1,ui1));
            dlog << LINFO << "hash(ui1,3):                "<< dlib::hash(ui1,3);
            dlog << LINFO << "hash(ui2,3):                "<< dlib::hash(ui2,3);
            dlog << LINFO << "hash(make_pair(ui2,ui1),3): "<< dlib::hash(make_pair(ui2,ui1),3);
            dlog << LINFO << "hash(make_pair(ui2,ui2),3): "<< dlib::hash(make_pair(ui2,ui2),3);
            dlog << LINFO << "hash(make_pair(ui1,ui1),3): "<< dlib::hash(make_pair(ui1,ui1),3);

            DLIB_TEST(dlib::hash(ui1) == 0x63e272e4);
            DLIB_TEST(dlib::hash(ui2) == 0xaf55561a);
            DLIB_TEST(dlib::hash(make_pair(ui2,ui1)) == 0x52685376);
            DLIB_TEST(dlib::hash(make_pair(ui2,ui2)) == 0xd25d6929);
            DLIB_TEST(dlib::hash(make_pair(ui1,ui1)) == 0xeea3b63e);
            DLIB_TEST(dlib::hash(ui1,3) == 0x95d1c4c0);
            DLIB_TEST(dlib::hash(ui2,3) == 0x6ada728d);
            DLIB_TEST(dlib::hash(make_pair(ui2,ui1),3) == 0x2f72a0ff);
            DLIB_TEST(dlib::hash(make_pair(ui2,ui2),3) == 0xac1407f0);
            DLIB_TEST(dlib::hash(make_pair(ui1,ui1),3) == 0x39ad637a);


            DLIB_TEST(dlib::hash(str1) == 0x3ffe6bf6);
            DLIB_TEST(dlib::hash(v)    == 0xf1af2ca6);
            DLIB_TEST(dlib::hash(v2)   == 0x63852afc);
            DLIB_TEST(dlib::hash(m)    == 0xaacc3f6f);
            DLIB_TEST(dlib::hash(mat)  == 0x3e349da5);
            DLIB_TEST(dlib::hash(mat2) == 0x3a95dc52);
            DLIB_TEST(murmur_hash3(&str1[0], str1.size(), 0) == 0x3ffe6bf6);

            dlog << LINFO << "hash(str1,1): "<< dlib::hash(str1,1);
            dlog << LINFO << "hash(v,3):    "<< dlib::hash(v,3);
            dlog << LINFO << "hash(v2,3):   "<< dlib::hash(v2,3);
            dlog << LINFO << "hash(m,4):    "<< dlib::hash(m,4);
            dlog << LINFO << "hash(mat,5):  "<< dlib::hash(mat,5);
            dlog << LINFO << "hash(mat2,6): "<< dlib::hash(mat2,6);

            DLIB_TEST(dlib::hash(str1,1) == 0xb17cea93);
            DLIB_TEST(dlib::hash(v,3)    == 0x7ec9284c);
            DLIB_TEST(dlib::hash(v2,3)   == 0xb2ce147f);
            DLIB_TEST(dlib::hash(m,4)    == 0xfa5e7ac2);
            DLIB_TEST(dlib::hash(mat,5)  == 0x8de27259);
            DLIB_TEST(dlib::hash(mat2,6) == 0xb8aa7714);
            DLIB_TEST(murmur_hash3(&str1[0], str1.size(), 1) == 0xb17cea93);

            test_murmur_hash_128_4();
            test_murmur_hash_128_3();
            test_murmur_hash_64_2();
            test_murmur_hash_64_3();
        }
    } a;



}



