// Copyright (C) 2007  Davis E. King (davisking@users.sourceforge.net)
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

        DLIB_CASSERT(string_cast<int>("5") == 5,string_cast<int>("5"));
        DLIB_CASSERT(string_cast<int>("0x5") == 5,string_cast<int>("0x5"));
        DLIB_CASSERT(string_cast<int>("0xA") == 10,string_cast<int>("0xA"));
        DLIB_CASSERT(string_cast<float>("0.5") == 0.5,"");
        DLIB_CASSERT(string_cast<std::string>("0.5 !") == "0.5 !","");
        DLIB_CASSERT(string_cast<bool>("true") == true,"");
        DLIB_CASSERT(string_cast<bool>("false") == false,"");
        DLIB_CASSERT(string_cast<bool>("TRUE") == true,"");
        DLIB_CASSERT(string_cast<bool>("FALSE") == false,"");

        dlog << LTRACE << 2;

        DLIB_CASSERT(string_cast<int>(L"5") == 5,string_cast<int>("5"));
        dlog << LTRACE << 2.1;
        DLIB_CASSERT(string_cast<int>(L"0x5") == 5,string_cast<int>("0x5"));
        DLIB_CASSERT(string_cast<int>(L"0xA") == 10,string_cast<int>("0xA"));
        DLIB_CASSERT(string_cast<float>(L"0.5") == 0.5,"");
        DLIB_CASSERT(string_cast<std::string>(L"0.5 !") == "0.5 !","");
        DLIB_CASSERT(string_cast<bool>(L"true") == true,"");
        DLIB_CASSERT(string_cast<bool>(L"false") == false,"");
        DLIB_CASSERT(string_cast<bool>(L"TRUE") == true,"");
        DLIB_CASSERT(string_cast<bool>(L"FALSE") == false,"");

        dlog << LTRACE << 3;

        DLIB_CASSERT(cast_to_string(5) == "5","");
        DLIB_CASSERT(cast_to_string(5.5) == "5.5","");

        dlog << LTRACE << 4;
        DLIB_CASSERT(cast_to_wstring(5) == L"5","");
        DLIB_CASSERT(cast_to_wstring(5.5) == L"5.5","");
        dlog << LTRACE << 5;
        DLIB_CASSERT(toupper(a) == A,"");
        DLIB_CASSERT(toupper(A) == A,"");
        DLIB_CASSERT(tolower(a) == a,"");
        DLIB_CASSERT(tolower(A) == a,"");
        DLIB_CASSERT(trim(a) == "davis","");
        DLIB_CASSERT(ltrim(a) == "davis  ","");
        DLIB_CASSERT(rtrim(a) == "  davis","");
        DLIB_CASSERT(trim(string_cast<wstring>(a)) == L"davis","");
        DLIB_CASSERT(ltrim(string_cast<wstring>(a)) == L"davis  ","");
        DLIB_CASSERT(rtrim(string_cast<wstring>(a)) == L"  davis","");
        DLIB_CASSERT(trim(a, " ") == "davis","");
        DLIB_CASSERT(ltrim(a, " ") == "davis  ","");
        DLIB_CASSERT(rtrim(a, " ") == "  davis","");
        DLIB_CASSERT(trim(empty) == "","");
        DLIB_CASSERT(ltrim(empty) == "","");
        DLIB_CASSERT(rtrim(empty) == "","");
        DLIB_CASSERT(trim(string_cast<wstring>(empty)) == L"","");
        DLIB_CASSERT(ltrim(string_cast<wstring>(empty)) == L"","");
        DLIB_CASSERT(rtrim(string_cast<wstring>(empty)) == L"","");
        DLIB_CASSERT(trim(empty, " ") == "","");
        DLIB_CASSERT(ltrim(empty, " ") == "","");
        DLIB_CASSERT(rtrim(empty, " ") == "","");


        dlog << LTRACE << 6;
        DLIB_CASSERT( (lpad(wstring(L"davis"), 10) == L"     davis"), ""); 
        DLIB_CASSERT( (rpad(wstring(L"davis"), 10) == L"davis     "), ""); 
        DLIB_CASSERT( (pad(wstring(L"davis"), 10) ==  L"  davis   "), ""); 

        DLIB_CASSERT( (lpad(string("davis"), -10) == "davis"), ""); 
        DLIB_CASSERT( (rpad(string("davis"), -10) == "davis"), ""); 
        DLIB_CASSERT( (pad(string("davis"), -10) == "davis"), ""); 
        DLIB_CASSERT( (lpad(string("davis"), 10) == "     davis"), ""); 
        DLIB_CASSERT( (rpad(string("davis"), 10) == "davis     "), ""); 
        DLIB_CASSERT( (pad(string("davis"), 10) ==  "  davis   "), ""); 
        DLIB_CASSERT( (lpad(string("davis"), 10, string("*")) == "*****davis"), ""); 
        DLIB_CASSERT( (rpad(string("davis"), 10, string("*")) == "davis*****"), ""); 
        DLIB_CASSERT( (pad(string("davis"), 10, string("*")) == "**davis***"), ""); 
        DLIB_CASSERT( (lpad(string("davis"), 10, string("_-")) == "_-_-_davis"), ""); 
        DLIB_CASSERT( (rpad(string("davis"), 10, string("_-")) == "davis_-_-_"), ""); 
        DLIB_CASSERT( (pad(string("davis"), 10, string("_-")) == "_-davis_-_"), ""); 
        DLIB_CASSERT( (lpad(string("davis"), 10, string("willy wanka")) == "willydavis"), ""); 
        DLIB_CASSERT( (rpad(string("davis"), 10, string("willy wanka")) == "daviswilly"), ""); 
        DLIB_CASSERT( (pad(string("davis"), 10, string("willy wanka")) == "widaviswil"), ""); 
        DLIB_CASSERT( (lpad(string("davis"), 10, "*")) == "*****davis", ""); 
        DLIB_CASSERT( (rpad(string("davis"), 10, "*") == "davis*****"), ""); 
        DLIB_CASSERT( (pad(string("davis"), 10, "*") == "**davis***"), ""); 
        DLIB_CASSERT( (lpad(string("davis"), 10, "_-") == "_-_-_davis"), ""); 
        DLIB_CASSERT( (rpad(string("davis"), 10, "_-") == "davis_-_-_"), ""); 
        DLIB_CASSERT( (pad(string("davis"), 10, "_-") == "_-davis_-_"), ""); 
        DLIB_CASSERT( (lpad(string("davis"), 10, "willy wanka") == "willydavis"), ""); 
        DLIB_CASSERT( (rpad(string("davis"), 10, "willy wanka") == "daviswilly"), ""); 
        DLIB_CASSERT( (pad(string("davis"), 10, "willy wanka") == "widaviswil"), ""); 
        dlog << LTRACE << 7;

        a = "file.txt";
        DLIB_CASSERT( (left_substr(a,string(".")) == "file"), "");
        DLIB_CASSERT( (left_substr(a,".") == "file"), "");
        DLIB_CASSERT( (right_substr(a,string(".")) == "txt"), "");
        DLIB_CASSERT( (right_substr(a,".") == "txt"), "");

        DLIB_CASSERT( (left_substr(a," ") == "file.txt"), "");
        DLIB_CASSERT( (right_substr(a," ") == ""), "");

        DLIB_CASSERT( (left_substr(a,"") == "file.txt"), "");
        DLIB_CASSERT( (right_substr(a,"") == ""), "");

        wstring ws = L"file.txt";
        DLIB_CASSERT( (left_substr(ws,wstring(L".")) == L"file"), "");
        DLIB_CASSERT( (left_substr(ws,L".") == L"file"), L"");
        DLIB_CASSERT( (right_substr(ws,wstring(L".")) == L"txt"), "");
        DLIB_CASSERT( (right_substr(ws,L".") == L"txt"), L"");


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
            DLIB_CASSERT(w == 85,"");
            DLIB_CASSERT(c == 4,"");
            deserialize(w,sin);
            deserialize(c,sin);
            DLIB_CASSERT(w == static_cast<wchar_t>(-1),"");
            DLIB_CASSERT(c == static_cast<char>(-1),"");

            wstring str = L"test string";

            sout.str("");
            serialize(str, sout);
            sin.clear();
            sin.str(sout.str());
            str = L"something else";
            deserialize(str,sin);
            DLIB_CASSERT(str == L"test string","");
        }
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
        }
    } a;

}



