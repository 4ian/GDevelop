// Copyright (C) 2007  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.


#include <sstream>
#include <string>
#include <cstdlib>
#include <ctime>
#include <dlib/config_reader.h>
#include <dlib/cmd_line_parser.h>

#include "tester.h"

// This is called an unnamed-namespace and it has the effect of making everything inside this file "private"
// so that everything you declare will have static linkage.  Thus we won't have any multiply
// defined symbol errors coming out of the linker when we try to compile the test suite.
namespace  
{

    using namespace test;
    using namespace dlib;
    using namespace std;

    // Declare the logger we will use in this test.  The name of the tester 
    // should start with "test."
    logger dlog("test.config_reader");

    template <
        typename config_reader
        >
    void do_the_tests (
        config_reader& cr
    )
    {
        DLIB_TEST(cr.is_key_defined("global"));
        DLIB_TEST(cr.is_block_defined("all"));
        DLIB_TEST(cr.is_key_defined("globalasfd") == false);
        DLIB_TEST(cr.is_block_defined("all!") == false);
        DLIB_TEST(cr["global"] == "hmm");
        DLIB_TEST(cr["global2"] == "hmm2");

        std_vector_c<string> blocks;
        cr.block("all").get_blocks(blocks);
        DLIB_TEST(blocks.size() == 4); 
        cr.block("all").block("block1").get_blocks(blocks); DLIB_TEST(blocks.size() == 0); 
        cr.block("all").block("block2").get_blocks(blocks); DLIB_TEST(blocks.size() == 0); 
        cr.block("all").block("block3").get_blocks(blocks); DLIB_TEST(blocks.size() == 0); 
        cr.block("all").block("block4").get_blocks(blocks); DLIB_TEST(blocks.size() == 0); 

        DLIB_TEST(cr.block("all").block("block1").is_key_defined("name")); 
        DLIB_TEST(cr.block("all").block("block2").is_key_defined("name")); 
        DLIB_TEST(cr.block("all").block("block3").is_key_defined("name")); 
        DLIB_TEST(cr.block("all").block("block4").is_key_defined("name")); 
        DLIB_TEST(cr.block("all").block("block1").is_key_defined("age")); 
        DLIB_TEST(cr.block("all").block("block2").is_key_defined("age")); 
        DLIB_TEST(cr.block("all").block("block3").is_key_defined("age")); 
        DLIB_TEST(cr.block("all").block("block4").is_key_defined("age")); 

        DLIB_TEST(cr.block("all").block("block1")["name"] == "davis king"); 
        DLIB_TEST(cr.block("all").block("block2")["name"] == "joel"); 
        DLIB_TEST(cr.block("all").block("block3")["name"] == "john"); 
        DLIB_TEST(cr.block("all").block("block4")["name"] == "dude"); 
        DLIB_TEST(cr.block("all").block("block1")["age"] == "24"); 
        DLIB_TEST(cr.block("all").block("block2")["age"] == "24"); 
        DLIB_TEST(cr.block("all").block("block3")["age"] == "24"); 
        DLIB_TEST(cr.block("all").block("block4")["age"] == "53"); 


        int count2 = 0;
        cr.get_blocks(blocks);
        DLIB_TEST(blocks.size() == 1);
        DLIB_TEST(blocks[0] == "all");


        DLIB_TEST(cr.block("all").is_key_defined("global") == false);
        DLIB_TEST(cr.block("all").is_key_defined("global2") == false);
        DLIB_TEST(cr.block("all").is_key_defined("name") == false);
        DLIB_TEST(cr.block("all").is_key_defined("age") == false);

        cr.block("all").get_blocks(blocks);
        DLIB_TEST(blocks.size() == 4);
        std::vector<string> temp_blocks;
        for (unsigned long i = 0; i < blocks.size(); ++i)
        {
            ++count2;
            ostringstream sout;
            sout << "block" << count2;
            DLIB_TEST(blocks[i] == sout.str());

            cr.block("all").block(blocks[i]).get_blocks(temp_blocks);
            DLIB_TEST(temp_blocks.size() == 0);

            DLIB_TEST(cr.block("all").block(blocks[i]).is_key_defined("name"));
            DLIB_TEST(cr.block("all").block(blocks[i]).is_key_defined("age"));
        }



        bool found_error = false;
        try
        {
            cr.block("bogus_block");
        }
        catch (typename config_reader::config_reader_access_error& e)
        {
            DLIB_TEST(e.block_name == "bogus_block");
            DLIB_TEST(e.key_name == "");
            found_error = true;
        }
        DLIB_TEST(found_error);

        found_error = false;
        try
        {
            cr["bogus_key"];
        }
        catch (typename config_reader::config_reader_access_error& e)
        {
            DLIB_TEST(e.block_name == "");
            DLIB_TEST(e.key_name == "bogus_key");
            found_error = true;
        }
        DLIB_TEST(found_error);


        found_error = false;
        try
        {
            cr.block("all").block("block10");
        }
        catch (typename config_reader::config_reader_access_error& e)
        {
            DLIB_TEST(e.block_name == "block10");
            DLIB_TEST(e.key_name == "");
            found_error = true;
        }
        DLIB_TEST(found_error);

        found_error = false;
        try
        {
            cr.block("all")["msdofg"];
        }
        catch (typename config_reader::config_reader_access_error& e)
        {
            DLIB_TEST(e.block_name == "");
            DLIB_TEST(e.key_name == "msdofg");
            found_error = true;
        }
        DLIB_TEST(found_error);

    }



    template <
        typename config_reader
        >
    void config_reader_test (
    )
    /*!
        requires
            - config_reader is an implementation of config_reader/config_reader_kernel_abstract.h 
              is instantiated with int
        ensures
            - runs tests on config_reader for compliance with the specs
    !*/
    {        



        ostringstream sout;

        sout << "all#comment { { } \n";
        sout << "{ \n";
        sout << "    block1 \n";
        sout << "    { \n";
        sout << "        name = davis king \n";
        sout << "        age = 24 \n";
        sout << "    } \n";
        sout << " \n";
        sout << "    block2 \n";
        sout << "    { \n";
        sout << "        name= joel \n";
        sout << "        age =24 \n";
        sout << "    } \n";
        sout << " \n";
        sout << "    block3 \n";
        sout << "    { \n";
        sout << "        name = john \n";
        sout << "        age = 24 \n";
        sout << "    } \n";
        sout << "  #comment \n";
        sout << "#comment \n";
        sout << "    block4{  # comment";
        sout << "     \n";
        sout << "        name = dude \n";
        sout << "        age = 53}\n";
        sout << "     \n";
        sout << "} \n";
        sout << " \n";
        sout << " \n";
        sout << "global=hmm#comment \n";
        sout << "global2=hmm2 \n";
        sout << " # comment \n";

        string data = sout.str();

        config_reader cr2;
        for (int i = 0; i < 3; ++i)
        {
            istringstream sin;

            sin.clear();
            sin.str(data);

            config_reader cr(sin);
            sin.clear();
            sin.str(data);

            cr2.load_from(sin);

            do_the_tests(cr);
            do_the_tests(cr2);

            cr.clear();
            DLIB_TEST(cr.is_key_defined("global") == false);
        }


        sout.clear();
        sout.str("");

        {
            sout << "all#comment { { } \n";
            sout << "{ \n";
            sout << "    block1 \n";
            sout << "    { \n";
            sout << "        name = davis king \n";
            sout << "        age = 24 \n";
            sout << "    } \n";
            sout << " \n";
            sout << "    block2 \n";
            sout << "    { \n";
            sout << "        name= joel \n";
            sout << "        age =24 \n";
            sout << "    } \n";
            sout << " \n";
            sout << "    block3 \n";
            sout << "    {{ \n";  // error on this line
            sout << "        name = john \n";
            sout << "        age = 24 \n";
            sout << "    } \n";
            sout << "  #comment \n";
            sout << "#comment \n";
            sout << "    block4{  # comment";
            sout << "     \n";
            sout << "        name = dude \n";
            sout << "        age = 53}\n";
            sout << "     \n";
            sout << "} \n";
            sout << " \n";
            sout << " \n";
            sout << "global=hmm#comment \n";
            sout << "global2=hmm2 \n";
            sout << " # comment \n";

            istringstream sin(sout.str());

            bool error_found = false;
            try
            {
                cr2.load_from(sin);
            }
            catch (typename config_reader::config_reader_error& e)
            {
                error_found = true;
                DLIB_TEST(e.line_number == 16);
                DLIB_TEST(e.redefinition == false);
            }
            DLIB_TEST(error_found);
        }

        {
            sout.str("");
            sout.clear();
            sout << "all#comment { { } \n";
            sout << "{ \n";
            sout << "    block1 \n";
            sout << "    { \n";
            sout << "        name = davis king \n";
            sout << "        age = 24 \n";
            sout << "    } \n";
            sout << " \n";
            sout << "    block2 \n";
            sout << "    { \n";
            sout << "        name= joel \n";
            sout << "        age =24 \n";
            sout << "    } \n";
            sout << " \n";
            sout << "    block3 \n";
            sout << "    { \n";
            sout << "        name = john \n";
            sout << "        age = 24 \n";
            sout << "    } \n";
            sout << "  #comment \n";
            sout << "#comment \n";
            sout << "    block4{  # comment";
            sout << "     \n";
            sout << "        name = dude \n";
            sout << "        age = 53}\n";
            sout << "     \n";
            sout << "} \n";
            sout << " \n";
            sout << " \n";
            sout << "global=hmm#comment \n";
            sout << " \n";
            sout << "global=hmm2 \n";  // error on this line
            sout << " # comment \n";

            istringstream sin(sout.str());

            bool error_found = false;
            try
            {
                cr2.load_from(sin);
            }
            catch (typename config_reader::config_reader_error& e)
            {
                error_found = true;
                DLIB_TEST_MSG(e.line_number == 31,e.line_number);
                DLIB_TEST(e.redefinition == true);
            }
            DLIB_TEST(error_found);
        }


        {
            sout.str("");
            sout.clear();
            sout << "all#comment { { } \n";
            sout << "{ \n";
            sout << "    block1 \n";
            sout << "    { \n";
            sout << "        name = davis king \n";
            sout << "        age = 24 \n";
            sout << "    } \n";
            sout << " \n";
            sout << "    block2 \n";
            sout << "    { \n";
            sout << "        name= joel \n";
            sout << "        age =24 \n";
            sout << "    } block2{} \n";  // error on this line
            sout << " \n";
            sout << "    block3 \n";
            sout << "    { \n";
            sout << "        name = john \n";
            sout << "        age = 24 \n";
            sout << "    } \n";
            sout << "  #comment \n";
            sout << "#comment \n";
            sout << "    block4{  # comment";
            sout << "     \n";
            sout << "        name = dude \n";
            sout << "        age = 53}\n";
            sout << "     \n";
            sout << "} \n";
            sout << " \n";
            sout << " \n";
            sout << "global=hmm#comment \n";
            sout << " \n";
            sout << " # comment \n";

            istringstream sin(sout.str());

            bool error_found = false;
            try
            {
                cr2.load_from(sin);
            }
            catch (typename config_reader::config_reader_error& e)
            {
                error_found = true;
                DLIB_TEST_MSG(e.line_number == 13,e.line_number);
                DLIB_TEST(e.redefinition == true);
            }
            DLIB_TEST(error_found);
        }



    }


    void test_get_option()
    {
        const char* argv[100];            
        int argc;

        // program --opt 4 -d dude 
        argv[0] = "program";
        argv[1] = "--opt";
        argv[2] = "4";
        argv[3] = "-d";
        argv[4] = "dude";
        argc = 5;

        std::ostringstream sout;
        sout << "block#comment { { } \n";
        sout << "{ \n";
        sout << "  opt = 5 \n";
        sout << "  a = 6 \n";
        sout << "  d = joel \n";
        sout << "  subblock {} \n";
        sout << "} \n";
        sout << " \n";
        sout << " \n";
        sout << "opt = 8 \n";
        sout << "d = davis \n";
        sout << "a = 50 \n";
        sout << " # comment \n";

        std::istringstream sin(sout.str());

        config_reader cr(sin);

        dlib::cmd_line_parser<char>::kernel_1a_c parser;

        parser.add_option("opt","",1);
        parser.add_option("d","",1);
        parser.add_option("a","",1);
        parser.add_option("b","",1);
        parser.parse(argc, argv);

        DLIB_TEST(get_option(cr, "d", "default") == "davis");
        DLIB_TEST(get_option(cr, "opt", "default") == "8");
        DLIB_TEST(get_option(cr, "opt", 1) == 8);
        DLIB_TEST(get_option(cr, "optasdf", 1) == 1);
        DLIB_TEST(get_option(cr, "optasdf", 1.1) == 1.1);
        DLIB_TEST(get_option(cr.block("block"), "d", "default") == "joel");
        DLIB_TEST(get_option(cr.block("block"), "opt", "default") == "5");
        DLIB_TEST(get_option(cr.block("block"), "opt", 1) == 5);
        DLIB_TEST(get_option(cr.block("block").block("subblock"), "d", "default") == "default");
        DLIB_TEST(get_option(cr.block("block").block("subblock"), "opt", "default") == "default");
        DLIB_TEST(get_option(cr.block("block").block("subblock"), "opt", 1) == 1);
        DLIB_TEST(get_option(cr, "block.d", "default") == "joel");
        DLIB_TEST(get_option(cr, "block.opt", "default") == "5");
        DLIB_TEST(get_option(cr, "block.opt", 1) == 5);
        DLIB_TEST(get_option(cr, "block.asdf.d", "default") == "default");
        DLIB_TEST(get_option(cr, "block.asdf.opt", "default") == "default");
        DLIB_TEST(get_option(cr, "block.asdf.opt", 2) == 2);
        DLIB_TEST(get_option(cr, "block.subblock.d", "default") == "default");
        DLIB_TEST(get_option(cr, "block.subblock.opt", "default") == "default");
        DLIB_TEST(get_option(cr, "block.subblock.opt", 2) == 2);

        DLIB_TEST(get_option(parser, "opt", 99) == 4);
        DLIB_TEST(get_option(parser, "d", "stuff") == "dude");
        DLIB_TEST(get_option(parser, "a", "stuff") == "stuff");
        DLIB_TEST(get_option(parser, "a", 99) == 99);

        DLIB_TEST(get_option(parser, cr, "d", "default") == "dude");
        DLIB_TEST(get_option(cr, parser, "d", "default") == "dude");
        DLIB_TEST(get_option(parser, cr, "a", 2) == 50);
        DLIB_TEST(get_option(cr, parser, "a", 2) == 50);
        DLIB_TEST(get_option(parser, cr, "opt", 2) == 4);
        DLIB_TEST(get_option(cr, parser, "opt", 2) == 4);
        DLIB_TEST(get_option(parser, cr, "b", 2) == 2);
        DLIB_TEST(get_option(cr, parser, "b", 2) == 2);

        DLIB_TEST(get_option(parser, cr.block("block"), "a", 2) == 6);
        DLIB_TEST(get_option(cr.block("block"), parser, "a", 2) == 6);
    }


    class config_reader_tester : public tester
    {
        /*!
            WHAT THIS OBJECT REPRESENTS
                This object represents a test for the config_reader object.  When it is constructed
                it adds itself into the testing framework.  The command line switch is
                specified as test_config_reader by passing that string to the tester constructor.
        !*/
    public:
        config_reader_tester (
        ) :
            tester ("test_config_reader",
                    "Runs tests on the config_reader component.")
        {}

        void perform_test (
        )
        {
            dlog << LINFO << "testing config_reader";
            print_spinner();
            config_reader_test<config_reader>();

            dlog << LINFO << "testing config_reader_thread_safe";
            print_spinner();
            config_reader_test<config_reader_thread_safe>();

            dlog << LINFO << "testing get_option()";
            print_spinner();
            test_get_option();
        }
    } a;

}


