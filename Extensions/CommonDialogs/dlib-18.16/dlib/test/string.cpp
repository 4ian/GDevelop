// Copyright (C) 2007  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.


#include <sstream>
#include <string>
#include <cstdlib>
#include <ctime>
#include <dlib/string.h>

#include "tester.h"

namespace  
{
    using namespace test;
    using namespace dlib;
    using namespace std;

    logger dlog("test.string");


    void string_test (
    )
    /*!
        ensures
            - runs tests on string functions for compliance with the specs 
    !*/
    {        

        print_spinner();

        string a = "  davis  ";
        string A = "  DAVIS  ";
        string empty = "    ";

        dlog << LTRACE << 1;

        double dval;
        int ival;
        bool bval;

        DLIB_TEST_MSG(string_cast<int>("5") == 5,string_cast<int>("5"));
        DLIB_TEST_MSG(string_cast<int>("0x5") == 5,string_cast<int>("0x5"));
        DLIB_TEST_MSG(string_cast<int>("0xA") == 10,string_cast<int>("0xA"));
        DLIB_TEST(string_cast<float>("0.5") == 0.5);
        DLIB_TEST((dval = sa ="0.5") == 0.5);
        DLIB_TEST(string_cast<std::string>("0.5 !") == "0.5 !");
        DLIB_TEST(string_cast<bool>("true") == true);
        DLIB_TEST((bval = sa = "true") == true);
        DLIB_TEST(string_cast<bool>("false") == false);
        DLIB_TEST(string_cast<bool>("TRUE") == true);
        DLIB_TEST(string_cast<bool>("FALSE") == false);
        DLIB_TEST((bval = sa = "FALSE") == false);

        dlog << LTRACE << 2;

        DLIB_TEST_MSG(string_cast<int>(L"5") == 5,string_cast<int>("5"));
        DLIB_TEST_MSG((ival = sa = L"5") == 5,string_cast<int>("5"));
        dlog << LTRACE << 2.1;
        DLIB_TEST_MSG(string_cast<int>(L"0x5") == 5,string_cast<int>("0x5"));
        DLIB_TEST_MSG(string_cast<int>(L"0xA") == 10,string_cast<int>("0xA"));
        DLIB_TEST(string_cast<float>(L"0.5") == 0.5);
        DLIB_TEST(string_cast<std::string>(L"0.5 !") == "0.5 !");
        DLIB_TEST(string_cast<bool>(L"true") == true);
        DLIB_TEST(string_cast<bool>(L"false") == false);
        DLIB_TEST(string_cast<bool>(L"TRUE") == true);
        DLIB_TEST((bval = sa = L"TRUE") == true);
        DLIB_TEST(string_cast<bool>(L"FALSE") == false);

        dlog << LTRACE << 3;

        DLIB_TEST(cast_to_string(5) == "5");
        DLIB_TEST(cast_to_string(5.5) == "5.5");

        dlog << LTRACE << 4;
        DLIB_TEST(cast_to_wstring(5) == L"5");
        DLIB_TEST(cast_to_wstring(5.5) == L"5.5");
        dlog << LTRACE << 5;
        DLIB_TEST(toupper(a) == A);
        DLIB_TEST(toupper(A) == A);
        DLIB_TEST(tolower(a) == a);
        DLIB_TEST(tolower(A) == a);
        DLIB_TEST(trim(a) == "davis");
        DLIB_TEST(ltrim(a) == "davis  ");
        DLIB_TEST(rtrim(a) == "  davis");
        DLIB_TEST(trim(string_cast<wstring>(a)) == L"davis");
        DLIB_TEST(ltrim(string_cast<wstring>(a)) == L"davis  ");
        DLIB_TEST(rtrim(string_cast<wstring>(a)) == L"  davis");
        DLIB_TEST(trim(a, " ") == "davis");
        DLIB_TEST(ltrim(a, " ") == "davis  ");
        DLIB_TEST(rtrim(a, " ") == "  davis");
        DLIB_TEST(trim(empty) == "");
        DLIB_TEST(ltrim(empty) == "");
        DLIB_TEST(rtrim(empty) == "");
        DLIB_TEST(trim(string_cast<wstring>(empty)) == L"");
        DLIB_TEST(ltrim(string_cast<wstring>(empty)) == L"");
        DLIB_TEST(rtrim(string_cast<wstring>(empty)) == L"");
        DLIB_TEST(trim(empty, " ") == "");
        DLIB_TEST(ltrim(empty, " ") == "");
        DLIB_TEST(rtrim(empty, " ") == "");


        dlog << LTRACE << 6;
        DLIB_TEST( (lpad(wstring(L"davis"), 10) == L"     davis")); 
        DLIB_TEST( (rpad(wstring(L"davis"), 10) == L"davis     ")); 
        DLIB_TEST( (pad(wstring(L"davis"), 10) ==  L"  davis   ")); 

        DLIB_TEST( (lpad(string("davis"), -10) == "davis")); 
        DLIB_TEST( (rpad(string("davis"), -10) == "davis")); 
        DLIB_TEST( (pad(string("davis"), -10) == "davis")); 
        DLIB_TEST( (lpad(string("davis"), 10) == "     davis")); 
        DLIB_TEST( (rpad(string("davis"), 10) == "davis     ")); 
        DLIB_TEST( (pad(string("davis"), 10) ==  "  davis   ")); 
        DLIB_TEST( (lpad(string("davis"), 10, string("*")) == "*****davis")); 
        DLIB_TEST( (rpad(string("davis"), 10, string("*")) == "davis*****")); 
        DLIB_TEST( (pad(string("davis"), 10, string("*")) == "**davis***")); 
        DLIB_TEST( (lpad(string("davis"), 10, string("_-")) == "_-_-_davis")); 
        DLIB_TEST( (rpad(string("davis"), 10, string("_-")) == "davis_-_-_")); 
        DLIB_TEST( (pad(string("davis"), 10, string("_-")) == "_-davis_-_")); 
        DLIB_TEST( (lpad(string("davis"), 10, string("willy wanka")) == "willydavis")); 
        DLIB_TEST( (rpad(string("davis"), 10, string("willy wanka")) == "daviswilly")); 
        DLIB_TEST( (pad(string("davis"), 10, string("willy wanka")) == "widaviswil")); 
        DLIB_TEST( (lpad(string("davis"), 10, "*")) == "*****davis"); 
        DLIB_TEST( (rpad(string("davis"), 10, "*") == "davis*****")); 
        DLIB_TEST( (pad(string("davis"), 10, "*") == "**davis***")); 
        DLIB_TEST( (lpad(string("davis"), 10, "_-") == "_-_-_davis")); 
        DLIB_TEST( (rpad(string("davis"), 10, "_-") == "davis_-_-_")); 
        DLIB_TEST( (pad(string("davis"), 10, "_-") == "_-davis_-_")); 
        DLIB_TEST( (lpad(string("davis"), 10, "willy wanka") == "willydavis")); 
        DLIB_TEST( (rpad(string("davis"), 10, "willy wanka") == "daviswilly")); 
        DLIB_TEST( (pad(string("davis"), 10, "willy wanka") == "widaviswil")); 
        dlog << LTRACE << 7;

        a = "file.txt";
        DLIB_TEST( (left_substr(a,string(".")) == "file"));
        DLIB_TEST( (left_substr(a,".") == "file"));
        DLIB_TEST( (right_substr(a,string(".")) == "txt"));
        DLIB_TEST( (right_substr(a,".") == "txt"));

        DLIB_TEST( (left_substr(a," ") == "file.txt"));
        DLIB_TEST( (right_substr(a," ") == ""));

        DLIB_TEST( (left_substr(a,"") == "file.txt"));
        DLIB_TEST( (right_substr(a,"") == ""));

        wstring ws = L"file.txt";
        DLIB_TEST( (left_substr(ws,wstring(L".")) == L"file"));
        DLIB_TEST_MSG( (left_substr(ws,L".") == L"file"), L"");
        DLIB_TEST( (right_substr(ws,wstring(L".")) == L"txt"));
        DLIB_TEST_MSG( (right_substr(ws,L".") == L"txt"), L"");


        dlog << LTRACE << 8;
        {
            ostringstream sout;
            wchar_t w = 85;
            char c = 4;
            serialize(w,sout);
            serialize(c,sout);
            w = static_cast<wchar_t>(-1);
            serialize(w,sout);
            c = static_cast<char>(-1);
            serialize(c,sout);

            istringstream sin(sout.str());
            w = 0;
            c = 0;
            deserialize(w,sin);
            deserialize(c,sin);
            DLIB_TEST(w == 85);
            DLIB_TEST(c == 4);
            deserialize(w,sin);
            deserialize(c,sin);
            DLIB_TEST(w == static_cast<wchar_t>(-1));
            DLIB_TEST(c == static_cast<char>(-1));

            wstring str = L"test string";

            sout.str("");
            serialize(str, sout);
            sin.clear();
            sin.str(sout.str());
            str = L"something else";
            deserialize(str,sin);
            DLIB_TEST(str == L"test string");
        }
    }


    void test_split()
    {
        std::vector<string> v;

        string str;
        string delim = " , ";

        v = split(string("one, two,three four")," ,");
        DLIB_TEST(v.size() == 4);
        DLIB_TEST(v[0] == "one");
        DLIB_TEST(v[1] == "two");
        DLIB_TEST(v[2] == "three");
        DLIB_TEST(v[3] == "four");

        v = split(string("one, two,three four"),delim);
        DLIB_TEST(v.size() == 4);
        DLIB_TEST(v[0] == "one");
        DLIB_TEST(v[1] == "two");
        DLIB_TEST(v[2] == "three");
        DLIB_TEST(v[3] == "four");

        v = split(string(""));
        DLIB_TEST(v.size() == 0);

        v = split(string("   "));
        DLIB_TEST(v.size() == 0);

        v = split(string(" one two  "));
        DLIB_TEST(v.size() == 2);
        DLIB_TEST(v[0] == "one");
        DLIB_TEST(v[1] == "two");

        v = split(string(" one   "));
        DLIB_TEST(v.size() == 1);
        DLIB_TEST(v[0] == "one");

        v = split(string("one"));
        DLIB_TEST(v.size() == 1);
        DLIB_TEST(v[0] == "one");

        v = split(string("o"));
        DLIB_TEST(v.size() == 1);
        DLIB_TEST(v[0] == "o");


        std::vector<wstring> wv;
        wstring wstr = L"test string";
        wv = split(wstr);
        DLIB_TEST(wv.size() == 2);
        DLIB_TEST(wv[0] == L"test");
        DLIB_TEST(wv[1] == L"string");
        wv = split(wstr,L" ");
        DLIB_TEST(wv.size() == 2);
        DLIB_TEST(wv[0] == L"test");
        DLIB_TEST(wv[1] == L"string");


        wstr = L"test string hah";
        DLIB_TEST(split_on_first(wstr).first == L"test");
        DLIB_TEST(split_on_first(wstr).second == L"string hah");
        DLIB_TEST(split_on_first(wstr,L"#").first == L"test string hah");
        DLIB_TEST(split_on_first(wstr,L"#").second == L"");
        DLIB_TEST(split_on_last(wstr).first == L"test string");
        DLIB_TEST(split_on_last(wstr).second == L"hah");
        DLIB_TEST(split_on_last(wstr,L"#").first == L"test string hah");
        DLIB_TEST(split_on_last(wstr,L"#").second == L"");
        wstr = L"";
        DLIB_TEST(split_on_first(wstr).first == L"");
        DLIB_TEST(split_on_first(wstr).second == L"");

        str = "test string hah";
        DLIB_TEST(split_on_first(str).first == "test");
        DLIB_TEST(split_on_first(str).second == "string hah");
        DLIB_TEST(split_on_first(str,"#").first == "test string hah");
        DLIB_TEST(split_on_first(str,"#").second == "");
        DLIB_TEST(split_on_last(str).first == "test string");
        DLIB_TEST(split_on_last(str).second == "hah");
        DLIB_TEST(split_on_last(str,"#").first == "test string hah");
        DLIB_TEST(split_on_last(str,"#").second == "");
        str = "";
        DLIB_TEST(split_on_first(str).first == "");
        DLIB_TEST(split_on_first(str).second == "");

        wstr = L"test.string.hah";
        DLIB_TEST(split_on_first(wstr,L".").first == L"test");
        DLIB_TEST(split_on_first(wstr,L".").second == L"string.hah");
        DLIB_TEST(split_on_first(wstr).first == L"test.string.hah");
        DLIB_TEST(split_on_first(wstr).second == L"");
        DLIB_TEST(split_on_last(wstr,L".").first == L"test.string");
        DLIB_TEST(split_on_last(wstr,L".").second == L"hah");
        DLIB_TEST(split_on_last(wstr).first == L"test.string.hah");
        DLIB_TEST(split_on_last(wstr).second == L"");
        wstr = L"";
        DLIB_TEST(split_on_first(wstr).first == L"");
        DLIB_TEST(split_on_first(wstr).second == L"");

        str = "test.string.hah";
        DLIB_TEST(split_on_first(str,".").first == "test");
        DLIB_TEST(split_on_first(str,".").second == "string.hah");
        DLIB_TEST(split_on_first(str).first == "test.string.hah");
        DLIB_TEST(split_on_first(str).second == "");
        DLIB_TEST(split_on_last(str,".").first == "test.string");
        DLIB_TEST(split_on_last(str,".").second == "hah");
        DLIB_TEST(split_on_last(str).first == "test.string.hah");
        DLIB_TEST(split_on_last(str).second == "");
        str = "";
        DLIB_TEST(split_on_first(str).first == "");
        DLIB_TEST(split_on_first(str).second == "");
    }



    class string_tester : public tester
    {
    public:
        string_tester (
        ) :
            tester ("test_string",
                    "Runs tests on the string objects and functions.")
        {}

        void perform_test (
        )
        {
            string_test();
            test_split();
        }
    } a;

}



