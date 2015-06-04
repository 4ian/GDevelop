// Copyright (C) 2009  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.


#include <sstream>
#include <string>
#include <cstdlib>
#include <ctime>
#include <dlib/type_safe_union.h>

#include "tester.h"

namespace  
{
    using namespace test;
    using namespace dlib;
    using namespace std;

    logger dlog("test.type_safe_union");

    struct can_not_copy: noncopyable {};
    void serialize(const can_not_copy&, std::ostream&) {}
    void deserialize(can_not_copy&, std::istream&) {}

    void swap(can_not_copy&, can_not_copy&) {}

    class test
    {

    private:

        enum kind
        {
            FLOAT, DOUBLE, CHAR, STRING, NONE
        };

        void operator() (float val)
        {
            DLIB_TEST(val == f_val);
            last_kind = FLOAT;
        }

        void operator() (double val)
        {
            DLIB_TEST(val == d_val);
            last_kind = DOUBLE;
        }

        void operator() (char val)
        {
            DLIB_TEST(val == c_val);
            last_kind = CHAR;
        }

        void operator()(std::string& val)
        {
            DLIB_TEST(val == s_val);
            last_kind = STRING;
        }

        void operator()(const std::string& val)
        {
            DLIB_TEST(val == s_val);
            last_kind = STRING;
        }

    // ------------------------------

        friend class type_safe_union<float, double, char, std::string>;
        typedef      type_safe_union<float, double, char, std::string> tsu;
        tsu a, b, c;

        float f_val;
        double d_val;
        char c_val;
        std::string s_val;

        kind last_kind;

    public:
        void test_stuff()
        {
            DLIB_TEST(a.is_empty() == true);
            DLIB_TEST(a.contains<char>() == false);
            DLIB_TEST(a.contains<float>() == false);
            DLIB_TEST(a.contains<double>() == false);
            DLIB_TEST(a.contains<std::string>() == false);
            DLIB_TEST(a.contains<long>() == false);

            DLIB_TEST(a.get_type_id<int>() == -1);
            DLIB_TEST(a.get_type_id<float>() == 1);
            DLIB_TEST(a.get_type_id<double>() == 2);
            DLIB_TEST(a.get_type_id<char>() == 3);
            DLIB_TEST(a.get_type_id<std::string>() == 4);
            DLIB_TEST(a.get_type_id<tsu>() == -1);


            f_val = 4.345f;
            a.get<float>() = f_val;
            DLIB_TEST(a.cast_to<float>() == f_val);
            DLIB_TEST(const_cast<const tsu&>(a).cast_to<float>() == f_val);
            bool exception_thrown = false;
            try {a.cast_to<char>(); }
            catch (bad_type_safe_union_cast&) { exception_thrown = true;}
            DLIB_TEST(exception_thrown);


            DLIB_TEST(a.is_empty() == false);
            DLIB_TEST(a.contains<char>() == false);
            DLIB_TEST(a.contains<float>() == true);
            DLIB_TEST(a.contains<double>() == false);
            DLIB_TEST(a.contains<std::string>() == false);
            DLIB_TEST(a.contains<long>() == false);


            last_kind = NONE;
            const_cast<const tsu&>(a).apply_to_contents(*this);
            DLIB_TEST(last_kind == FLOAT);

        // -----------

            d_val = 4.345;
            a.get<double>() = d_val;
            last_kind = NONE;
            a.apply_to_contents(*this);
            DLIB_TEST(last_kind == DOUBLE);

        // -----------

            c_val = 'a';
            a.get<char>() = c_val;
            last_kind = NONE;
            const_cast<const tsu&>(a).apply_to_contents(*this);
            DLIB_TEST(last_kind == CHAR);

        // -----------

            s_val = "test string";
            a.get<std::string>() = s_val;
            last_kind = NONE;
            a.apply_to_contents(*this);
            DLIB_TEST(last_kind == STRING);

            DLIB_TEST(a.cast_to<std::string>() == s_val);
            exception_thrown = false;
            try {a.cast_to<float>(); }
            catch (bad_type_safe_union_cast&) { exception_thrown = true;}
            DLIB_TEST(exception_thrown);

        // -----------
            DLIB_TEST(a.is_empty() == false);
            DLIB_TEST(a.contains<char>() == false);
            DLIB_TEST(a.contains<float>() == false);
            DLIB_TEST(a.contains<double>() == false);
            DLIB_TEST(a.contains<std::string>() == true);
            DLIB_TEST(a.contains<long>() == false);
        // -----------

            a.swap(b);

            DLIB_TEST(a.is_empty() == true);
            DLIB_TEST(a.contains<char>() == false);
            DLIB_TEST(a.contains<float>() == false);
            DLIB_TEST(a.contains<double>() == false);
            DLIB_TEST(a.contains<std::string>() == false);
            DLIB_TEST(a.contains<long>() == false);

            DLIB_TEST(b.is_empty() == false);
            DLIB_TEST(b.contains<char>() == false);
            DLIB_TEST(b.contains<float>() == false);
            DLIB_TEST(b.contains<double>() == false);
            DLIB_TEST(b.contains<std::string>() == true);
            DLIB_TEST(b.contains<long>() == false);


            last_kind = NONE;
            b.apply_to_contents(*this);
            DLIB_TEST(last_kind == STRING);

        // -----------

            b.swap(a);

            DLIB_TEST(b.is_empty() == true);
            DLIB_TEST(b.contains<char>() == false);
            DLIB_TEST(b.contains<float>() == false);
            DLIB_TEST(b.contains<double>() == false);
            DLIB_TEST(b.contains<std::string>() == false);
            DLIB_TEST(b.contains<long>() == false);

            DLIB_TEST(a.is_empty() == false);
            DLIB_TEST(a.contains<char>() == false);
            DLIB_TEST(a.contains<float>() == false);
            DLIB_TEST(a.contains<double>() == false);
            DLIB_TEST(a.contains<std::string>() == true);
            DLIB_TEST(a.contains<long>() == false);


            last_kind = NONE;
            a.apply_to_contents(*this);
            DLIB_TEST(last_kind == STRING);
            last_kind = NONE;
            b.apply_to_contents(*this);
            DLIB_TEST(last_kind == NONE);


            a.get<char>() = 'a';
            b.get<char>() = 'b';

            DLIB_TEST(a.is_empty() == false);
            DLIB_TEST(a.contains<char>() == true);
            DLIB_TEST(b.is_empty() == false);
            DLIB_TEST(b.contains<char>() == true);
            DLIB_TEST(a.contains<float>() == false);
            DLIB_TEST(b.contains<float>() == false);


            DLIB_TEST(a.get<char>() == 'a');
            DLIB_TEST(b.get<char>() == 'b');

            swap(a,b);


            DLIB_TEST(a.is_empty() == false);
            DLIB_TEST(a.contains<char>() == true);
            DLIB_TEST(b.is_empty() == false);
            DLIB_TEST(b.contains<char>() == true);
            DLIB_TEST(a.contains<float>() == false);
            DLIB_TEST(b.contains<float>() == false);

            DLIB_TEST(a.get<char>() == 'b');
            DLIB_TEST(b.get<char>() == 'a');

        // -----------

            a.get<char>() = 'a';
            b.get<std::string>() = "a string";

            DLIB_TEST(a.is_empty() == false);
            DLIB_TEST(a.contains<char>() == true);
            DLIB_TEST(b.is_empty() == false);
            DLIB_TEST(b.contains<char>() == false);
            DLIB_TEST(a.contains<std::string>() == false);
            DLIB_TEST(b.contains<std::string>() == true);


            DLIB_TEST(a.get<char>() == 'a');
            DLIB_TEST(b.get<std::string>() == "a string");

            swap(a,b);

            DLIB_TEST(b.is_empty() == false);
            DLIB_TEST(b.contains<char>() == true);
            DLIB_TEST(a.is_empty() == false);
            DLIB_TEST(a.contains<char>() == false);
            DLIB_TEST(b.contains<std::string>() == false);
            DLIB_TEST(a.contains<std::string>() == true);


            DLIB_TEST(b.get<char>() == 'a');
            DLIB_TEST(a.get<std::string>() == "a string");




            {
                type_safe_union<char, float, std::string> a, b, empty_union;

                ostringstream sout;
                istringstream sin;

                a.get<char>() = 'd';

                serialize(a, sout);

                sin.str(sout.str());
                deserialize(b, sin);

                DLIB_TEST(b.contains<int>() == false);
                DLIB_TEST(b.contains<float>() == false);
                DLIB_TEST(b.contains<char>() == true);
                DLIB_TEST(b.get<char>() == 'd');

                DLIB_TEST(a.contains<int>() == false);
                DLIB_TEST(a.contains<float>() == false);
                DLIB_TEST(a.contains<char>() == true);
                DLIB_TEST(a.get<char>() == 'd');

                sin.clear();
                sout.clear();
                sout.str("");

                a.get<std::string>() = "davis";

                serialize(a, sout);
                sin.str(sout.str());
                deserialize(b, sin);


                DLIB_TEST(b.contains<int>() == false);
                DLIB_TEST(b.contains<float>() == false);
                DLIB_TEST(b.contains<std::string>() == true);
                DLIB_TEST(b.get<std::string>() == "davis");

                sin.clear();
                sout.clear();
                sout.str("");

                serialize(empty_union, sout);
                sin.str(sout.str());
                deserialize(b, sin);

                DLIB_TEST(b.is_empty() == true);

            }

            {
                type_safe_union<char, float, std::string> a, b, empty_union;

                ostringstream sout;
                istringstream sin;

                a = 'd';

                serialize(a, sout);

                sin.str(sout.str());
                deserialize(b, sin);

                DLIB_TEST(b.contains<int>() == false);
                DLIB_TEST(b.contains<float>() == false);
                DLIB_TEST(b.contains<char>() == true);
                DLIB_TEST(b.get<char>() == 'd');

                DLIB_TEST(a.contains<int>() == false);
                DLIB_TEST(a.contains<float>() == false);
                DLIB_TEST(a.contains<char>() == true);
                DLIB_TEST(a.get<char>() == 'd');

                sin.clear();
                sout.clear();
                sout.str("");

                a = std::string("davis");

                serialize(a, sout);
                sin.str(sout.str());
                deserialize(b, sin);


                DLIB_TEST(b.contains<int>() == false);
                DLIB_TEST(b.contains<float>() == false);
                DLIB_TEST(b.contains<std::string>() == true);
                DLIB_TEST(b.get<std::string>() == "davis");

                sin.clear();
                sout.clear();
                sout.str("");

                serialize(empty_union, sout);
                sin.str(sout.str());
                deserialize(b, sin);

                DLIB_TEST(b.is_empty() == true);

            }

            {
                typedef type_safe_union<char, float, std::string, can_not_copy> tsu_type;
                tsu_type a('d'), aa(std::string("davis")), b, empty_union;

                ostringstream sout;
                istringstream sin;


                serialize(a, sout);

                sin.str(sout.str());
                deserialize(b, sin);

                DLIB_TEST(b.contains<int>() == false);
                DLIB_TEST(b.contains<float>() == false);
                DLIB_TEST(b.contains<char>() == true);
                DLIB_TEST(b.get<char>() == 'd');

                DLIB_TEST(a.contains<int>() == false);
                DLIB_TEST(a.contains<float>() == false);
                DLIB_TEST(a.contains<char>() == true);
                DLIB_TEST(a.get<char>() == 'd');

                DLIB_TEST(aa.contains<int>() == false);
                DLIB_TEST(aa.contains<float>() == false);
                DLIB_TEST(aa.contains<char>() == false);
                DLIB_TEST(aa.contains<std::string>() == true);

                sin.clear();
                sout.clear();
                sout.str("");


                serialize(aa, sout);
                sin.str(sout.str());
                deserialize(b, sin);


                DLIB_TEST(b.contains<int>() == false);
                DLIB_TEST(b.contains<float>() == false);
                DLIB_TEST(b.contains<std::string>() == true);
                DLIB_TEST(b.get<std::string>() == "davis");

                sin.clear();
                sout.clear();
                sout.str("");

                serialize(empty_union, sout);
                sin.str(sout.str());
                deserialize(b, sin);

                DLIB_TEST(b.is_empty() == true);

                a.get<can_not_copy>();
                DLIB_TEST(a.contains<can_not_copy>() == true);

            }
        }

    };



    class type_safe_union_tester : public tester
    {
    public:
        type_safe_union_tester (
        ) :
            tester ("test_type_safe_union",
                    "Runs tests on the type_safe_union object")
        {}

        void perform_test (
        )
        {
            for (int i = 0; i < 10; ++i)
            {
                test a;
                a.test_stuff();
            }
        }
    } a;

}




