// Copyright (C) 2005  Davis E. King (davis@dlib.net)
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

        DLIB_TEST(test.numbers() == "0123456789");
        DLIB_TEST(test.uppercase_letters() == "ABCDEFGHIJKLMNOPQRSTUVWXYZ");
        DLIB_TEST(test.lowercase_letters() == "abcdefghijklmnopqrstuvwxyz");

        DLIB_TEST_MSG(test.get_identifier_body() == "_" + test.lowercase_letters() +
                     test.uppercase_letters() + test.numbers(),"");
        DLIB_TEST_MSG(test.get_identifier_head() == "_" + test.lowercase_letters() +
                     test.uppercase_letters(),"");

        DLIB_TEST(test.stream_is_set() == false);
        test.clear();
        DLIB_TEST(test.stream_is_set() == false);

        DLIB_TEST_MSG(test.get_identifier_body() == "_" + test.lowercase_letters() +
                     test.uppercase_letters() + test.numbers(),"");
        DLIB_TEST_MSG(test.get_identifier_head() == "_" + test.lowercase_letters() +
                     test.uppercase_letters(),"");

        tok test2;

        ostringstream sout;
        istringstream sin;
        test2.set_stream(sin);

        DLIB_TEST(test2.stream_is_set());
        DLIB_TEST(&test2.get_stream() == &sin);

        int type;
        string token;

        test2.get_token(type,token);
        DLIB_TEST(type == tok::END_OF_FILE);
        test2.get_token(type,token);
        DLIB_TEST(type == tok::END_OF_FILE);
        test2.get_token(type,token);
        DLIB_TEST(type == tok::END_OF_FILE);            


        sin.clear();
        sin.str("  The cat 123asdf1234 ._ \n test.");

        test2.get_token(type,token);
        DLIB_TEST(type == tok::WHITE_SPACE);
        DLIB_TEST(token == "  ");

        DLIB_TEST(test2.peek_type() == tok::IDENTIFIER);
        DLIB_TEST(test2.peek_token() == "The"); 
        test2.get_token(type,token);
        DLIB_TEST(type == tok::IDENTIFIER);
        DLIB_TEST(token == "The");            

        test2.get_token(type,token);
        DLIB_TEST(type == tok::WHITE_SPACE);
        DLIB_TEST(token == " ");

        test2.get_token(type,token);
        DLIB_TEST(type == tok::IDENTIFIER);
        DLIB_TEST(token == "cat");            

        test2.get_token(type,token);
        DLIB_TEST(type == tok::WHITE_SPACE);
        DLIB_TEST(token == " ");

        test2.get_token(type,token);
        DLIB_TEST(type == tok::NUMBER);
        DLIB_TEST_MSG(token == "123","token: " << token);

        DLIB_TEST(test2.peek_type() == tok::IDENTIFIER);
        DLIB_TEST(test2.peek_token() == "asdf1234");
        DLIB_TEST(test2.peek_type() == tok::IDENTIFIER);
        DLIB_TEST(test2.peek_token() == "asdf1234");
        DLIB_TEST(test2.peek_type() == tok::IDENTIFIER);
        DLIB_TEST(test2.peek_token() == "asdf1234");
        test2.get_token(type,token);
        DLIB_TEST(type == tok::IDENTIFIER);
        DLIB_TEST(token == "asdf1234");

        test2.get_token(type,token);
        DLIB_TEST(type == tok::WHITE_SPACE);
        DLIB_TEST_MSG(token == " ","token: " << token);

        test2.get_token(type,token);
        DLIB_TEST(type == tok::CHAR);
        DLIB_TEST_MSG(token == ".","token: " << token);

        test2.get_token(type,token);
        DLIB_TEST(type == tok::IDENTIFIER);
        DLIB_TEST(token == "_");

        DLIB_TEST(test2.peek_type() == tok::WHITE_SPACE);
        DLIB_TEST_MSG(test2.peek_token() == " ","token: \"" << token << "\"" <<
                     "\ntoken size: " << (unsigned int)token.size());

        swap(test,test2);

        DLIB_TEST(test2.stream_is_set() == false);

        DLIB_TEST(test.peek_type() == tok::WHITE_SPACE);
        DLIB_TEST_MSG(test.peek_token() == " ","token: \"" << token << "\"" <<
                     "\ntoken size: " << (unsigned int)token.size());
        test.get_token(type,token);
        DLIB_TEST(type == tok::WHITE_SPACE);
        DLIB_TEST_MSG(token == " ","token: \"" << token << "\"" <<
                     "\ntoken size: " << (unsigned int)token.size());

        test.get_token(type,token);
        DLIB_TEST_MSG(type == tok::END_OF_LINE,"token: " << token);
        DLIB_TEST_MSG(token == "\n","token: " << token);

        swap(test,test2);
        DLIB_TEST(test.stream_is_set() == false);

        test2.get_token(type,token);
        DLIB_TEST(type == tok::WHITE_SPACE);
        DLIB_TEST_MSG(token == " ","token: " << token);

        test2.get_token(type,token);
        DLIB_TEST(type == tok::IDENTIFIER);
        DLIB_TEST_MSG(token == "test","token: " << token);

        test2.get_token(type,token);
        DLIB_TEST(type == tok::CHAR);
        DLIB_TEST_MSG(token == ".","token: " << token);

        test2.get_token(type,token);
        DLIB_TEST(type == tok::END_OF_FILE);










        test2.set_identifier_token("_" + test.uppercase_letters() +
                                   test.lowercase_letters(),test.numbers() + "_" + test.uppercase_letters()
                                   +test.lowercase_letters());


        sin.clear();
        sin.str("  The cat 123asdf1234 ._ \n\r test.");

        test2.get_token(type,token);
        DLIB_TEST(type == tok::WHITE_SPACE);
        DLIB_TEST(token == "  ");

        test2.get_token(type,token);
        DLIB_TEST(type == tok::IDENTIFIER);
        DLIB_TEST(token == "The");            

        test2.get_token(type,token);
        DLIB_TEST(type == tok::WHITE_SPACE);
        DLIB_TEST(token == " ");

        test2.get_token(type,token);
        DLIB_TEST(type == tok::IDENTIFIER);
        DLIB_TEST(token == "cat");            

        test2.get_token(type,token);
        DLIB_TEST(type == tok::WHITE_SPACE);
        DLIB_TEST(token == " ");

        test2.get_token(type,token);
        DLIB_TEST(type == tok::NUMBER);
        DLIB_TEST_MSG(token == "123","token: " << token);

        test2.get_token(type,token);
        DLIB_TEST(type == tok::IDENTIFIER);
        DLIB_TEST(token == "asdf1234");

        test2.get_token(type,token);
        DLIB_TEST(type == tok::WHITE_SPACE);
        DLIB_TEST_MSG(token == " ","token: " << token);

        test2.get_token(type,token);
        DLIB_TEST(type == tok::CHAR);
        DLIB_TEST_MSG(token == ".","token: " << token);

        test2.get_token(type,token);
        DLIB_TEST(type == tok::IDENTIFIER);
        DLIB_TEST(token == "_");

        swap(test,test2);

        DLIB_TEST(test2.stream_is_set() == false);

        test.get_token(type,token);
        DLIB_TEST(type == tok::WHITE_SPACE);
        DLIB_TEST_MSG(token == " ","token: \"" << token << "\"" <<
                     "\ntoken size: " << (unsigned int)token.size());

        test.get_token(type,token);
        DLIB_TEST_MSG(type == tok::END_OF_LINE,"token: " << token);
        DLIB_TEST_MSG(token == "\n","token: " << token);

        swap(test,test2);
        DLIB_TEST(test.stream_is_set() == false);

        test2.get_token(type,token);
        DLIB_TEST(type == tok::WHITE_SPACE);
        DLIB_TEST_MSG(token == "\r ","token: " << token);

        test2.get_token(type,token);
        DLIB_TEST(type == tok::IDENTIFIER);
        DLIB_TEST_MSG(token == "test","token: " << token);

        test2.get_token(type,token);
        DLIB_TEST(type == tok::CHAR);
        DLIB_TEST_MSG(token == ".","token: " << token);

        test2.get_token(type,token);
        DLIB_TEST(type == tok::END_OF_FILE);













        test2.set_identifier_token(test.uppercase_letters() +
                                   test.lowercase_letters(),test.numbers() + test.uppercase_letters()
                                   +test.lowercase_letters());


        sin.clear();
        sin.str("  The cat 123as_df1234 ._ \n test.");

        test2.get_token(type,token);
        DLIB_TEST(type == tok::WHITE_SPACE);
        DLIB_TEST(token == "  ");

        test2.get_token(type,token);
        DLIB_TEST(type == tok::IDENTIFIER);
        DLIB_TEST(token == "The");            

        test2.get_token(type,token);
        DLIB_TEST(type == tok::WHITE_SPACE);
        DLIB_TEST(token == " ");

        test2.get_token(type,token);
        DLIB_TEST(type == tok::IDENTIFIER);
        DLIB_TEST(token == "cat");            

        test2.get_token(type,token);
        DLIB_TEST(type == tok::WHITE_SPACE);
        DLIB_TEST(token == " ");

        test2.get_token(type,token);
        DLIB_TEST(type == tok::NUMBER);
        DLIB_TEST_MSG(token == "123","token: " << token);

        test2.get_token(type,token);
        DLIB_TEST(type == tok::IDENTIFIER);
        DLIB_TEST(token == "as");

        test2.get_token(type,token);
        DLIB_TEST(type == tok::CHAR);
        DLIB_TEST_MSG(token == "_","token: " << token);

        test2.get_token(type,token);
        DLIB_TEST(type == tok::IDENTIFIER);
        DLIB_TEST(token == "df1234");

        test2.get_token(type,token);
        DLIB_TEST(type == tok::WHITE_SPACE);
        DLIB_TEST_MSG(token == " ","token: " << token);

        test2.get_token(type,token);
        DLIB_TEST(type == tok::CHAR);
        DLIB_TEST_MSG(token == ".","token: " << token);

        test2.get_token(type,token);
        DLIB_TEST(type == tok::CHAR);
        DLIB_TEST(token == "_");

        swap(test,test2);

        DLIB_TEST(test2.stream_is_set() == false);

        test.get_token(type,token);
        DLIB_TEST(type == tok::WHITE_SPACE);
        DLIB_TEST_MSG(token == " ","token: \"" << token << "\"" <<
                     "\ntoken size: " << (unsigned int)token.size());

        test.get_token(type,token);
        DLIB_TEST_MSG(type == tok::END_OF_LINE,"token: " << token);
        DLIB_TEST_MSG(token == "\n","token: " << token);

        swap(test,test2);
        DLIB_TEST(test.stream_is_set() == false);

        test2.get_token(type,token);
        DLIB_TEST(type == tok::WHITE_SPACE);
        DLIB_TEST_MSG(token == " ","token: " << token);

        test2.get_token(type,token);
        DLIB_TEST(type == tok::IDENTIFIER);
        DLIB_TEST_MSG(token == "test","token: " << token);

        test2.get_token(type,token);
        DLIB_TEST(type == tok::CHAR);
        DLIB_TEST_MSG(token == ".","token: " << token);

        test2.get_token(type,token);
        DLIB_TEST(type == tok::END_OF_FILE);


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


