// Copyright (C) 2007  Davis E. King (davisking@users.sourceforge.net)
// License: Boost Software License   See LICENSE.txt for the full license.


#include <sstream>
#include <string>
#include <cstdlib>
#include <ctime>
#include <dlib/config_reader.h>

#include "tester.h"

// This is called an unnamed-namespace and it has the effect of making everything inside this file "private"
// so that everything you declare will have static linkage.  Thus we won't have any multiply
// defined symbol errors coming out of the linker when we try to compile the test suite.
namespace  
{

    using namespace test;
    using namespace dlib;
    using namespace std;

    template <
        typename config_reader
        >
    void do_the_tests (
        config_reader& cr
    )
    {
        DLIB_CASSERT(cr.is_key_defined("global"),"");
        DLIB_CASSERT(cr.is_block_defined("all"),"");
        DLIB_CASSERT(cr.is_key_defined("globalasfd") == false,"");
        DLIB_CASSERT(cr.is_block_defined("all!") == false,"");
        DLIB_CASSERT(cr.size() == 1,"");
        DLIB_CASSERT(cr["global"] == "hmm","");
        DLIB_CASSERT(cr["global2"] == "hmm2","");
        DLIB_CASSERT(cr.block("all").size() == 4,""); 
        DLIB_CASSERT(cr.block("all").block("block1").size() == 0,""); 
        DLIB_CASSERT(cr.block("all").block("block2").size() == 0,""); 
        DLIB_CASSERT(cr.block("all").block("block3").size() == 0,""); 
        DLIB_CASSERT(cr.block("all").block("block4").size() == 0,""); 

        DLIB_CASSERT(cr.block("all").block("block1").is_key_defined("name"),""); 
        DLIB_CASSERT(cr.block("all").block("block2").is_key_defined("name"),""); 
        DLIB_CASSERT(cr.block("all").block("block3").is_key_defined("name"),""); 
        DLIB_CASSERT(cr.block("all").block("block4").is_key_defined("name"),""); 
        DLIB_CASSERT(cr.block("all").block("block1").is_key_defined("age"),""); 
        DLIB_CASSERT(cr.block("all").block("block2").is_key_defined("age"),""); 
        DLIB_CASSERT(cr.block("all").block("block3").is_key_defined("age"),""); 
        DLIB_CASSERT(cr.block("all").block("block4").is_key_defined("age"),""); 

        DLIB_CASSERT(cr.block("all").block("block1")["name"] == "davis king",""); 
        DLIB_CASSERT(cr.block("all").block("block2")["name"] == "joel",""); 
        DLIB_CASSERT(cr.block("all").block("block3")["name"] == "john",""); 
        DLIB_CASSERT(cr.block("all").block("block4")["name"] == "dude",""); 
        DLIB_CASSERT(cr.block("all").block("block1")["age"] == "24",""); 
        DLIB_CASSERT(cr.block("all").block("block2")["age"] == "24",""); 
        DLIB_CASSERT(cr.block("all").block("block3")["age"] == "24",""); 
        DLIB_CASSERT(cr.block("all").block("block4")["age"] == "53",""); 


        int count1 = 0;
        int count2 = 0;
        while (cr.move_next())
        {
            ++count1;
            DLIB_CASSERT(cr.current_block_name() == "all","");
            DLIB_CASSERT(cr.element().is_key_defined("global") == false,"");
            DLIB_CASSERT(cr.element().is_key_defined("global2") == false,"");
            DLIB_CASSERT(cr.element().is_key_defined("name") == false,"");
            DLIB_CASSERT(cr.element().is_key_defined("age") == false,"");
            while (cr.element().move_next())
            {
                ++count2;
                ostringstream sout;
                sout << "block" << count2;
                DLIB_CASSERT(cr.element().current_block_name() == sout.str(),"");
                DLIB_CASSERT(cr.element().size() == 4,"");
                DLIB_CASSERT(cr.element().element().size() == 0,"");
                DLIB_CASSERT(cr.element().element().is_key_defined("name"),"");
                DLIB_CASSERT(cr.element().element().is_key_defined("age"),"");
            }
        }

        DLIB_CASSERT(count1 == 1,"");
        DLIB_CASSERT(count2 == 4,"");

    }


    // Declare the logger we will use in this test.  The name of the tester 
    // should start with "test."
    logger dlog("test.config_reader");

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
            DLIB_CASSERT(cr.size() == 0,"");
            DLIB_CASSERT(cr.is_key_defined("global") == false,"");
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
                DLIB_CASSERT(e.line_number == 16,"");
                DLIB_CASSERT(e.redefinition == false,"");
            }
            DLIB_CASSERT(error_found,"");
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
                DLIB_CASSERT(e.line_number == 31,e.line_number);
                DLIB_CASSERT(e.redefinition == true,"");
            }
            DLIB_CASSERT(error_found,"");
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
                DLIB_CASSERT(e.line_number == 13,e.line_number);
                DLIB_CASSERT(e.redefinition == true,"");
            }
            DLIB_CASSERT(error_found,"");
        }



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
            dlog << LINFO << "testing kernel_1a";
            print_spinner();
            config_reader_test<config_reader::kernel_1a>();

            dlog << LINFO << "testing kernel_1a_c";
            print_spinner();
            config_reader_test<config_reader::kernel_1a_c>();

            dlog << LINFO << "testing thread_safe_1a";
            print_spinner();
            config_reader_test<config_reader::thread_safe_1a>();

            dlog << LINFO << "testing thread_safe_1a_c";
            print_spinner();
            config_reader_test<config_reader::thread_safe_1a_c>();
        }
    } a;

}


