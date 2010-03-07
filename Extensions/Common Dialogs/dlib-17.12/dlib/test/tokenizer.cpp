// Copyright (C) 2005  Davis E. King (davisking@users.sourceforge.net)
// License: Boost Software License   See LICENSE.txt for the full license.


#include <string>
#include <sstream>

#include <dlib/tokenizer.h>
#include "tester.h"

namespace  
{
    using namespace test;
    using namespace std;
    using namespace dlib;
  
    logger dlog("test.tokenizer");

    template <
        typename tok
        >
    void tokenizer_kernel_test (
    )
    /*!
        requires
            - tok is an implementation of tokenizer_kernel_abstract.h
        ensures
            - runs tests on tok for compliance with the specs 
    !*/
    {        

        print_spinner();

        tok test;

        DLIB_CASSERT(test.numbers() == "0123456789","");
        DLIB_CASSERT(test.uppercase_letters() == "ABCDEFGHIJKLMNOPQRSTUVWXYZ","");
        DLIB_CASSERT(test.lowercase_letters() == "abcdefghijklmnopqrstuvwxyz","");

        DLIB_CASSERT(test.get_identifier_body() == "_" + test.lowercase_letters() +
                     test.uppercase_letters() + test.numbers(),"");
        DLIB_CASSERT(test.get_identifier_head() == "_" + test.lowercase_letters() +
                     test.uppercase_letters(),"");

        DLIB_CASSERT(test.stream_is_set() == false,"");
        test.clear();
        DLIB_CASSERT(test.stream_is_set() == false,"");

        DLIB_CASSERT(test.get_identifier_body() == "_" + test.lowercase_letters() +
                     test.uppercase_letters() + test.numbers(),"");
        DLIB_CASSERT(test.get_identifier_head() == "_" + test.lowercase_letters() +
                     test.uppercase_letters(),"");

        tok test2;

        ostringstream sout;
        istringstream sin;
        test2.set_stream(sin);

        DLIB_CASSERT(test2.stream_is_set(),"");
        DLIB_CASSERT(&test2.get_stream() == &sin,"");

        int type;
        string token;

        test2.get_token(type,token);
        DLIB_CASSERT(type == tok::END_OF_FILE,"");
        test2.get_token(type,token);
        DLIB_CASSERT(type == tok::END_OF_FILE,"");
        test2.get_token(type,token);
        DLIB_CASSERT(type == tok::END_OF_FILE,"");            


        sin.clear();
        sin.str("  The cat 123asdf1234 ._ \n test.");

        test2.get_token(type,token);
        DLIB_CASSERT(type == tok::WHITE_SPACE,"");
        DLIB_CASSERT(token == "  ","");

        DLIB_CASSERT(test2.peek_type() == tok::IDENTIFIER,"");
        DLIB_CASSERT(test2.peek_token() == "The",""); 
        test2.get_token(type,token);
        DLIB_CASSERT(type == tok::IDENTIFIER,"");
        DLIB_CASSERT(token == "The","");            

        test2.get_token(type,token);
        DLIB_CASSERT(type == tok::WHITE_SPACE,"");
        DLIB_CASSERT(token == " ","");

        test2.get_token(type,token);
        DLIB_CASSERT(type == tok::IDENTIFIER,"");
        DLIB_CASSERT(token == "cat","");            

        test2.get_token(type,token);
        DLIB_CASSERT(type == tok::WHITE_SPACE,"");
        DLIB_CASSERT(token == " ","");

        test2.get_token(type,token);
        DLIB_CASSERT(type == tok::NUMBER,"");
        DLIB_CASSERT(token == "123","token: " << token);

        DLIB_CASSERT(test2.peek_type() == tok::IDENTIFIER,"");
        DLIB_CASSERT(test2.peek_token() == "asdf1234","");
        DLIB_CASSERT(test2.peek_type() == tok::IDENTIFIER,"");
        DLIB_CASSERT(test2.peek_token() == "asdf1234","");
        DLIB_CASSERT(test2.peek_type() == tok::IDENTIFIER,"");
        DLIB_CASSERT(test2.peek_token() == "asdf1234","");
        test2.get_token(type,token);
        DLIB_CASSERT(type == tok::IDENTIFIER,"");
        DLIB_CASSERT(token == "asdf1234","");

        test2.get_token(type,token);
        DLIB_CASSERT(type == tok::WHITE_SPACE,"");
        DLIB_CASSERT(token == " ","token: " << token);

        test2.get_token(type,token);
        DLIB_CASSERT(type == tok::CHAR,"");
        DLIB_CASSERT(token == ".","token: " << token);

        test2.get_token(type,token);
        DLIB_CASSERT(type == tok::IDENTIFIER,"");
        DLIB_CASSERT(token == "_","");

        DLIB_CASSERT(test2.peek_type() == tok::WHITE_SPACE,"");
        DLIB_CASSERT(test2.peek_token() == " ","token: \"" << token << "\"" <<
                     "\ntoken size: " << (unsigned int)token.size());

        swap(test,test2);

        DLIB_CASSERT(test2.stream_is_set() == false,"");

        DLIB_CASSERT(test.peek_type() == tok::WHITE_SPACE,"");
        DLIB_CASSERT(test.peek_token() == " ","token: \"" << token << "\"" <<
                     "\ntoken size: " << (unsigned int)token.size());
        test.get_token(type,token);
        DLIB_CASSERT(type == tok::WHITE_SPACE,"");
        DLIB_CASSERT(token == " ","token: \"" << token << "\"" <<
                     "\ntoken size: " << (unsigned int)token.size());

        test.get_token(type,token);
        DLIB_CASSERT(type == tok::END_OF_LINE,"token: " << token);
        DLIB_CASSERT(token == "\n","token: " << token);

        swap(test,test2);
        DLIB_CASSERT(test.stream_is_set() == false,"");

        test2.get_token(type,token);
        DLIB_CASSERT(type == tok::WHITE_SPACE,"");
        DLIB_CASSERT(token == " ","token: " << token);

        test2.get_token(type,token);
        DLIB_CASSERT(type == tok::IDENTIFIER,"");
        DLIB_CASSERT(token == "test","token: " << token);

        test2.get_token(type,token);
        DLIB_CASSERT(type == tok::CHAR,"");
        DLIB_CASSERT(token == ".","token: " << token);

        test2.get_token(type,token);
        DLIB_CASSERT(type == tok::END_OF_FILE,"");










        test2.set_identifier_token("_" + test.uppercase_letters() +
                                   test.lowercase_letters(),test.numbers() + "_" + test.uppercase_letters()
                                   +test.lowercase_letters());


        sin.clear();
        sin.str("  The cat 123asdf1234 ._ \n\r test.");

        test2.get_token(type,token);
        DLIB_CASSERT(type == tok::WHITE_SPACE,"");
        DLIB_CASSERT(token == "  ","");

        test2.get_token(type,token);
        DLIB_CASSERT(type == tok::IDENTIFIER,"");
        DLIB_CASSERT(token == "The","");            

        test2.get_token(type,token);
        DLIB_CASSERT(type == tok::WHITE_SPACE,"");
        DLIB_CASSERT(token == " ","");

        test2.get_token(type,token);
        DLIB_CASSERT(type == tok::IDENTIFIER,"");
        DLIB_CASSERT(token == "cat","");            

        test2.get_token(type,token);
        DLIB_CASSERT(type == tok::WHITE_SPACE,"");
        DLIB_CASSERT(token == " ","");

        test2.get_token(type,token);
        DLIB_CASSERT(type == tok::NUMBER,"");
        DLIB_CASSERT(token == "123","token: " << token);

        test2.get_token(type,token);
        DLIB_CASSERT(type == tok::IDENTIFIER,"");
        DLIB_CASSERT(token == "asdf1234","");

        test2.get_token(type,token);
        DLIB_CASSERT(type == tok::WHITE_SPACE,"");
        DLIB_CASSERT(token == " ","token: " << token);

        test2.get_token(type,token);
        DLIB_CASSERT(type == tok::CHAR,"");
        DLIB_CASSERT(token == ".","token: " << token);

        test2.get_token(type,token);
        DLIB_CASSERT(type == tok::IDENTIFIER,"");
        DLIB_CASSERT(token == "_","");

        swap(test,test2);

        DLIB_CASSERT(test2.stream_is_set() == false,"");

        test.get_token(type,token);
        DLIB_CASSERT(type == tok::WHITE_SPACE,"");
        DLIB_CASSERT(token == " ","token: \"" << token << "\"" <<
                     "\ntoken size: " << (unsigned int)token.size());

        test.get_token(type,token);
        DLIB_CASSERT(type == tok::END_OF_LINE,"token: " << token);
        DLIB_CASSERT(token == "\n","token: " << token);

        swap(test,test2);
        DLIB_CASSERT(test.stream_is_set() == false,"");

        test2.get_token(type,token);
        DLIB_CASSERT(type == tok::WHITE_SPACE,"");
        DLIB_CASSERT(token == "\r ","token: " << token);

        test2.get_token(type,token);
        DLIB_CASSERT(type == tok::IDENTIFIER,"");
        DLIB_CASSERT(token == "test","token: " << token);

        test2.get_token(type,token);
        DLIB_CASSERT(type == tok::CHAR,"");
        DLIB_CASSERT(token == ".","token: " << token);

        test2.get_token(type,token);
        DLIB_CASSERT(type == tok::END_OF_FILE,"");













        test2.set_identifier_token(test.uppercase_letters() +
                                   test.lowercase_letters(),test.numbers() + test.uppercase_letters()
                                   +test.lowercase_letters());


        sin.clear();
        sin.str("  The cat 123as_df1234 ._ \n test.");

        test2.get_token(type,token);
        DLIB_CASSERT(type == tok::WHITE_SPACE,"");
        DLIB_CASSERT(token == "  ","");

        test2.get_token(type,token);
        DLIB_CASSERT(type == tok::IDENTIFIER,"");
        DLIB_CASSERT(token == "The","");            

        test2.get_token(type,token);
        DLIB_CASSERT(type == tok::WHITE_SPACE,"");
        DLIB_CASSERT(token == " ","");

        test2.get_token(type,token);
        DLIB_CASSERT(type == tok::IDENTIFIER,"");
        DLIB_CASSERT(token == "cat","");            

        test2.get_token(type,token);
        DLIB_CASSERT(type == tok::WHITE_SPACE,"");
        DLIB_CASSERT(token == " ","");

        test2.get_token(type,token);
        DLIB_CASSERT(type == tok::NUMBER,"");
        DLIB_CASSERT(token == "123","token: " << token);

        test2.get_token(type,token);
        DLIB_CASSERT(type == tok::IDENTIFIER,"");
        DLIB_CASSERT(token == "as","");

        test2.get_token(type,token);
        DLIB_CASSERT(type == tok::CHAR,"");
        DLIB_CASSERT(token == "_","token: " << token);

        test2.get_token(type,token);
        DLIB_CASSERT(type == tok::IDENTIFIER,"");
        DLIB_CASSERT(token == "df1234","");

        test2.get_token(type,token);
        DLIB_CASSERT(type == tok::WHITE_SPACE,"");
        DLIB_CASSERT(token == " ","token: " << token);

        test2.get_token(type,token);
        DLIB_CASSERT(type == tok::CHAR,"");
        DLIB_CASSERT(token == ".","token: " << token);

        test2.get_token(type,token);
        DLIB_CASSERT(type == tok::CHAR,"");
        DLIB_CASSERT(token == "_","");

        swap(test,test2);

        DLIB_CASSERT(test2.stream_is_set() == false,"");

        test.get_token(type,token);
        DLIB_CASSERT(type == tok::WHITE_SPACE,"");
        DLIB_CASSERT(token == " ","token: \"" << token << "\"" <<
                     "\ntoken size: " << (unsigned int)token.size());

        test.get_token(type,token);
        DLIB_CASSERT(type == tok::END_OF_LINE,"token: " << token);
        DLIB_CASSERT(token == "\n","token: " << token);

        swap(test,test2);
        DLIB_CASSERT(test.stream_is_set() == false,"");

        test2.get_token(type,token);
        DLIB_CASSERT(type == tok::WHITE_SPACE,"");
        DLIB_CASSERT(token == " ","token: " << token);

        test2.get_token(type,token);
        DLIB_CASSERT(type == tok::IDENTIFIER,"");
        DLIB_CASSERT(token == "test","token: " << token);

        test2.get_token(type,token);
        DLIB_CASSERT(type == tok::CHAR,"");
        DLIB_CASSERT(token == ".","token: " << token);

        test2.get_token(type,token);
        DLIB_CASSERT(type == tok::END_OF_FILE,"");


    }





    class tokenizer_tester : public tester
    {
    public:
        tokenizer_tester (
        ) :
            tester ("test_tokenizer",
                    "Runs tests on the tokenizer component.")
        {}

        void perform_test (
        )
        {
            dlog << LINFO << "testing kernel_1a";
            tokenizer_kernel_test<tokenizer::kernel_1a>  ();
            dlog << LINFO << "testing kernel_1a_c";
            tokenizer_kernel_test<tokenizer::kernel_1a_c>();
        }
    } a;

}


