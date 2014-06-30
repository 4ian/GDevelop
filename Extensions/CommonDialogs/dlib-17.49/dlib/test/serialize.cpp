// Copyright (C) 2008  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.


#include <iostream>
#include <fstream>
#include <sstream>
#include <dlib/compress_stream.h>
#include <dlib/base64.h>
#include <string>
#include <cstdlib>
#include <ctime>
#include <dlib/serialize.h>

#include "tester.h"

namespace  
{

// ----------------------------------------------------------------------------------------

    using namespace test;
    using namespace dlib;
    using namespace std;

    struct test_object
    {
        signed char i1;
        signed short i2;
        signed long i3;
        unsigned char i4;
        unsigned short i5;
        unsigned long i6;
        uint64 i7;
        int64 i8;

        signed char i1_0;
        signed short i2_0;
        signed long i3_0;
        unsigned char i4_0;
        unsigned short i5_0;
        unsigned long i6_0;
        uint64 i7_0;
        int64 i8_0;

        signed char i1_n;
        signed short i2_n;
        signed long i3_n;


        float f1;
        double f2;
        long double f3;
        float f1_inf;
        double f2_inf;
        long double f3_inf;
        float f1_ninf;
        double f2_ninf;
        long double f3_ninf;
        float f1_qnan;
        double f2_qnan;
        long double f3_qnan;
        float f1_snan;
        double f2_snan;
        long double f3_snan;

        std::string s1;
        std::wstring s2;

        int array[10];

        bool b_true;
        bool b_false;


        void set_state_1(
        )
        {
            i1 = 1;
            i2 = 2;
            i3 = 3;
            i4 = 4;
            i5 = 5;
            i6 = 6;
            i7 = 7;
            i8 = 8;

            i1_0 = 0;
            i2_0 = 0;
            i3_0 = 0;
            i4_0 = 0;
            i5_0 = 0;
            i6_0 = 0;
            i7_0 = 0;
            i8_0 = 0;

            i1_n = -1;
            i2_n = -2;
            i3_n = -3;

            f1 = 123.456f;
            f2 = 543.341;
            f3 = 5234234.23;

            f1_inf = numeric_limits<float>::infinity();
            f2_inf = numeric_limits<double>::infinity();
            f3_inf = numeric_limits<long double>::infinity();
            f1_ninf = -numeric_limits<float>::infinity();
            f2_ninf = -numeric_limits<double>::infinity();
            f3_ninf = -numeric_limits<long double>::infinity();
            f1_qnan = numeric_limits<float>::quiet_NaN();
            f2_qnan = numeric_limits<double>::quiet_NaN();
            f3_qnan = numeric_limits<long double>::quiet_NaN();
            f1_snan = numeric_limits<float>::signaling_NaN();
            f2_snan = numeric_limits<double>::signaling_NaN();
            f3_snan = numeric_limits<long double>::signaling_NaN();

            s1 = "davis";
            s2 = L"yo yo yo";

            for (int i = 0; i < 10; ++i)
                array[i] = i; 

            b_true = true;
            b_false = false;
        }

        void set_state_2(
        )
        {
            i1 = 10;
            i2 = 20;
            i3 = 30;
            i4 = 40;
            i5 = 50;
            i6 = 60;
            i7 = 70;
            i8 = 80;

            i1_0 = 5;
            i2_0 = 6;
            i3_0 = 7;
            i4_0 = 8;
            i5_0 = 9;
            i6_0 = 10;
            i7_0 = 11;
            i8_0 = 12;

            i1_n = -13;
            i2_n = -25;
            i3_n = -12;

            f1 = 45.3f;
            f2 = 0.001;
            f3 = 2.332;

            f1_inf = f1;
            f2_inf = f2;
            f3_inf = f3;
            f1_ninf = f1;
            f2_ninf = f2;
            f3_ninf = f3;
            f1_qnan = f1;
            f2_qnan = f2;
            f3_qnan = f3;
            f1_snan = f1;
            f2_snan = f2;
            f3_snan = f3;

            s1 = "";
            s2 = L"";

            for (int i = 0; i < 10; ++i)
                array[i] = 10-i; 

            b_true = false;
            b_false = true;
        }

        void assert_in_state_1 (
        )
        {
            DLIB_TEST (i1 == 1);
            DLIB_TEST (i2 == 2);
            DLIB_TEST (i3 == 3);
            DLIB_TEST (i4 == 4);
            DLIB_TEST (i5 == 5);
            DLIB_TEST (i6 == 6);
            DLIB_TEST (i7 == 7);
            DLIB_TEST (i8 == 8);

            DLIB_TEST (i1_0 == 0);
            DLIB_TEST (i2_0 == 0);
            DLIB_TEST (i3_0 == 0);
            DLIB_TEST (i4_0 == 0);
            DLIB_TEST (i5_0 == 0);
            DLIB_TEST (i6_0 == 0);
            DLIB_TEST (i7_0 == 0);
            DLIB_TEST (i8_0 == 0);

            DLIB_TEST (i1_n == -1);
            DLIB_TEST (i2_n == -2);
            DLIB_TEST (i3_n == -3);

            DLIB_TEST (abs(f1 -123.456) < 1e-5);
            DLIB_TEST (abs(f2 - 543.341) < 1e-10);
            DLIB_TEST (abs(f3 - 5234234.23) < 1e-10);

            DLIB_TEST (f1_inf == numeric_limits<float>::infinity());
            DLIB_TEST (f2_inf == numeric_limits<double>::infinity());
            DLIB_TEST (f3_inf == numeric_limits<long double>::infinity());
            DLIB_TEST (f1_ninf == -numeric_limits<float>::infinity());
            DLIB_TEST (f2_ninf == -numeric_limits<double>::infinity());
            DLIB_TEST (f3_ninf == -numeric_limits<long double>::infinity());
            DLIB_TEST (!(f1_qnan <= numeric_limits<float>::infinity() && f1_qnan >= -numeric_limits<float>::infinity() ));
            DLIB_TEST (!(f2_qnan <= numeric_limits<double>::infinity() && f1_qnan >= -numeric_limits<double>::infinity() ));
            DLIB_TEST (!(f3_qnan <= numeric_limits<long double>::infinity() && f1_qnan >= -numeric_limits<long double>::infinity() ));
            DLIB_TEST (!(f1_snan <= numeric_limits<float>::infinity() && f1_qnan >= -numeric_limits<float>::infinity() ));
            DLIB_TEST (!(f2_snan <= numeric_limits<double>::infinity() && f1_qnan >= -numeric_limits<double>::infinity() ));
            DLIB_TEST (!(f3_snan <= numeric_limits<long double>::infinity() && f1_qnan >= -numeric_limits<long double>::infinity() ));

            DLIB_TEST (s1 == "davis");
            DLIB_TEST (s2 == L"yo yo yo");

            for (int i = 0; i < 10; ++i)
            {
                DLIB_TEST (array[i] == i);
            }

            DLIB_TEST (b_true == true);
            DLIB_TEST (b_false == false);

        }

        void assert_in_state_2 (
        )
        {
            DLIB_TEST (i1 == 10);
            DLIB_TEST (i2 == 20);
            DLIB_TEST (i3 == 30);
            DLIB_TEST (i4 == 40);
            DLIB_TEST (i5 == 50);
            DLIB_TEST (i6 == 60);
            DLIB_TEST (i7 == 70);
            DLIB_TEST (i8 == 80);

            DLIB_TEST (i1_0 == 5);
            DLIB_TEST (i2_0 == 6);
            DLIB_TEST (i3_0 == 7);
            DLIB_TEST (i4_0 == 8);
            DLIB_TEST (i5_0 == 9);
            DLIB_TEST (i6_0 == 10);
            DLIB_TEST (i7_0 == 11);
            DLIB_TEST (i8_0 == 12);

            DLIB_TEST (i1_n == -13);
            DLIB_TEST (i2_n == -25);
            DLIB_TEST (i3_n == -12);

            DLIB_TEST (abs(f1 - 45.3) < 1e-5);
            DLIB_TEST (abs(f2 - 0.001) < 1e-10);
            DLIB_TEST (abs(f3 - 2.332) < 1e-10);
            DLIB_TEST (abs(f1_inf - 45.3) < 1e-5);
            DLIB_TEST (abs(f2_inf - 0.001) < 1e-10);
            DLIB_TEST (abs(f3_inf - 2.332) < 1e-10);
            DLIB_TEST (abs(f1_ninf - 45.3) < 1e-5);
            DLIB_TEST (abs(f2_ninf - 0.001) < 1e-10);
            DLIB_TEST (abs(f3_ninf - 2.332) < 1e-10);
            DLIB_TEST (abs(f1_qnan - 45.3) < 1e-5);
            DLIB_TEST (abs(f2_qnan - 0.001) < 1e-10);
            DLIB_TEST (abs(f3_qnan - 2.332) < 1e-10);
            DLIB_TEST (abs(f1_snan - 45.3) < 1e-5);
            DLIB_TEST (abs(f2_snan - 0.001) < 1e-10);
            DLIB_TEST (abs(f3_snan - 2.332) < 1e-10);

            DLIB_TEST (s1 == "");
            DLIB_TEST (s2 == L"");

            for (int i = 0; i < 10; ++i)
            {
                DLIB_TEST (array[i] == 10-i);
            }

            DLIB_TEST (b_true == false);
            DLIB_TEST (b_false == true);

        }

    };

// ----------------------------------------------------------------------------------------

    void serialize (
        const test_object& item,
        std::ostream& out
    )
    {
        dlib::serialize(item.i1,out);
        dlib::serialize(item.i2,out);
        dlib::serialize(item.i3,out);
        dlib::serialize(item.i4,out);
        dlib::serialize(item.i5,out);
        dlib::serialize(item.i6,out);
        dlib::serialize(item.i7,out);
        dlib::serialize(item.i8,out);

        dlib::serialize(item.i1_0,out);
        dlib::serialize(item.i2_0,out);
        dlib::serialize(item.i3_0,out);
        dlib::serialize(item.i4_0,out);
        dlib::serialize(item.i5_0,out);
        dlib::serialize(item.i6_0,out);
        dlib::serialize(item.i7_0,out);
        dlib::serialize(item.i8_0,out);

        dlib::serialize(item.i1_n,out);
        dlib::serialize(item.i2_n,out);
        dlib::serialize(item.i3_n,out);


        dlib::serialize(item.f1,out);
        dlib::serialize(item.f2,out);
        dlib::serialize(item.f3,out);

        dlib::serialize(item.f1_inf,out);
        dlib::serialize(item.f2_inf,out);
        dlib::serialize(item.f3_inf,out);
        dlib::serialize(item.f1_ninf,out);
        dlib::serialize(item.f2_ninf,out);
        dlib::serialize(item.f3_ninf,out);
        dlib::serialize(item.f1_qnan,out);
        dlib::serialize(item.f2_qnan,out);
        dlib::serialize(item.f3_qnan,out);
        dlib::serialize(item.f1_snan,out);
        dlib::serialize(item.f2_snan,out);
        dlib::serialize(item.f3_snan,out);

        dlib::serialize(item.s1,out);
        dlib::serialize(item.s2,out);

        dlib::serialize(item.array,out);

        dlib::serialize(item.b_true,out);
        dlib::serialize(item.b_false,out);
    }

// ----------------------------------------------------------------------------------------

    void deserialize (
        test_object& item,
        std::istream& in 
    )
    {
        dlib::deserialize(item.i1,in);
        dlib::deserialize(item.i2,in);
        dlib::deserialize(item.i3,in);
        dlib::deserialize(item.i4,in);
        dlib::deserialize(item.i5,in);
        dlib::deserialize(item.i6,in);
        dlib::deserialize(item.i7,in);
        dlib::deserialize(item.i8,in);

        dlib::deserialize(item.i1_0,in);
        dlib::deserialize(item.i2_0,in);
        dlib::deserialize(item.i3_0,in);
        dlib::deserialize(item.i4_0,in);
        dlib::deserialize(item.i5_0,in);
        dlib::deserialize(item.i6_0,in);
        dlib::deserialize(item.i7_0,in);
        dlib::deserialize(item.i8_0,in);

        dlib::deserialize(item.i1_n,in);
        dlib::deserialize(item.i2_n,in);
        dlib::deserialize(item.i3_n,in);


        dlib::deserialize(item.f1,in);
        dlib::deserialize(item.f2,in);
        dlib::deserialize(item.f3,in);

        dlib::deserialize(item.f1_inf,in);
        dlib::deserialize(item.f2_inf,in);
        dlib::deserialize(item.f3_inf,in);
        dlib::deserialize(item.f1_ninf,in);
        dlib::deserialize(item.f2_ninf,in);
        dlib::deserialize(item.f3_ninf,in);
        dlib::deserialize(item.f1_qnan,in);
        dlib::deserialize(item.f2_qnan,in);
        dlib::deserialize(item.f3_qnan,in);
        dlib::deserialize(item.f1_snan,in);
        dlib::deserialize(item.f2_snan,in);
        dlib::deserialize(item.f3_snan,in);

        dlib::deserialize(item.s1,in);
        dlib::deserialize(item.s2,in);

        dlib::deserialize(item.array,in);

        dlib::deserialize(item.b_true,in);
        dlib::deserialize(item.b_false,in);
    }

// ----------------------------------------------------------------------------------------

    // This function returns the contents of the file 'stuff.bin'
    const std::string get_decoded_string()
    {
        dlib::base64::kernel_1a base64_coder;
        dlib::compress_stream::kernel_1ea compressor;
        std::ostringstream sout;
        std::istringstream sin;


        // The base64 encoded data from the file 'stuff.bin' we want to decode and return.
        sout << "AVaifX9zEbXa9aocsrcRuvnNrR3WLuuU5eLWiy0UeXmnKXGLKZz8V44gzT4CM6wnCmAHFQug8G3C";
        sout << "4cuLdNgp2ApkeLcvwFNJRENE0ShrRaxEBFEA8nah7vm8B2VmgImNblCejuP5IcDt60EaCKlqiit8";
        sout << "+JGrzYxqBm3xFS4P+qlOROdbxc7pXBmUdh0rqNSEvn0FBPdoqY/5SpHgA2yAcH8XFrM1cdu0xS3P";
        sout << "8PBcmLMJ7bFdzplwhrjuxtm4NfEOi6Rl9sU44AXycYgJd0+uH+dyoI9X3co5b3YWJtjvdVeztNAr";
        sout << "BfSPfR6oAVNfiMBG7QA=";


        // Put the data into the istream sin
        sin.str(sout.str());
        sout.str("");

        // Decode the base64 text into its compressed binary form
        base64_coder.decode(sin,sout);
        sin.clear();
        sin.str(sout.str());
        sout.str("");

        // Decompress the data into its original form
        compressor.decompress(sin,sout);

        // Return the decoded and decompressed data
        return sout.str();
    }

// ----------------------------------------------------------------------------------------

    // Declare the logger we will use in this test.  The name of the tester 
    // should start with "test."
    logger dlog("test.serialize");

    void serialize_test (
    )
    /*!
        ensures
            - runs tests on the serialization code for compliance with the specs
    !*/
    {        


        print_spinner();

        ostringstream sout;
        test_object obj;

        obj.set_state_1();
        obj.assert_in_state_1();
        serialize(obj, sout);
        obj.assert_in_state_1();

        obj.set_state_2();
        obj.assert_in_state_2();
        serialize(obj, sout);
        obj.assert_in_state_2();


        istringstream sin(sout.str());

        deserialize(obj,sin);
        obj.assert_in_state_1();
        deserialize(obj,sin);
        obj.assert_in_state_2();


        // now do the same thing as above but deserialize from some stored binary
        // data to make sure the serialized values are portable between different
        // machines

        sin.clear();
        sin.str(get_decoded_string());

        deserialize(obj,sin);
        obj.assert_in_state_1();
        deserialize(obj,sin);
        obj.assert_in_state_2();

        /*
        // This is the code that produced the encoded data stored in the get_decoded_string() function
            ofstream fout("stuff.bin",ios::binary);
            obj.set_state_1();
            obj.assert_in_state_1();
            serialize(obj, fout);
            obj.assert_in_state_1();

            obj.set_state_2();
            obj.assert_in_state_2();
            serialize(obj, fout);
            obj.assert_in_state_2();
            */

    }


    template <typename T>
    void test_vector (
    )
    {
        std::vector<T> a, b;

        for (int i = -10; i < 30; ++i)
        {
            a.push_back(i);
        }

        ostringstream sout;
        dlib::serialize(a, sout);
        istringstream sin(sout.str());

        dlib::deserialize(b, sin);


        DLIB_TEST(a.size() == b.size());
        DLIB_TEST(a.size() == 40);
        for (unsigned long i = 0; i < a.size(); ++i)
        {
            DLIB_TEST(a[i] == b[i]);
        }
    }



    class serialize_tester : public tester
    {
        /*!
            WHAT THIS OBJECT REPRESENTS
                This object represents a test for the serialization .  When it is constructed
                it adds itself into the testing framework.  The command line switch is
                specified as test_serialize by passing that string to the tester constructor.
        !*/
    public:
        serialize_tester (
        ) :
            tester ("test_serialize",
                    "Runs tests on the serialization code.")
        {}

        void perform_test (
        )
        {
            serialize_test();
            test_vector<char>();
            test_vector<unsigned char>();
            test_vector<int>();
        }
    } a;


}


