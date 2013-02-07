// Copyright (C) 2006  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.


#include <iostream>
#include <fstream>
#include <dlib/cmd_line_parser.h>
#include "tester.h"
#include <dlib/string.h>


using namespace std;
using namespace dlib;
using namespace test;

typedef cmd_line_parser<char>::check_1a_c clp;

static logger dlog("test.main");

int main (int argc, char** argv)
{
    try
    {
        clp parser;

        parser.add_option("runall","Run all the tests that don't take any arguments.");
        parser.add_option("h","Displays this information.");
        parser.add_option("n","How many times to run the selected tests. The default is 1.",1);
        parser.add_option("d","log debugging statements to file debug.txt.");
        parser.add_option("l","Set the logging level (all, trace, debug, info, warn, error, or fatal), the default is all.",1);
        parser.add_option("a","Append debugging messages to debug.txt rather than clearing the file at program startup.");
        parser.add_option("q","Be quiet.  Don't print the testing progress or results to standard out.");

        unsigned long num = 1;

        // add the options for all the different tests
        testers().reset();
        while (testers().move_next())
        {
            tester& test = *testers().element().value();
            parser.add_option(test.cmd_line_switch(), test.description(), test.num_of_args());
        }

        parser.parse(argc,argv);

        parser.check_option_arg_range("n",1,1000000000);
        const char* singles[] = {"d","l","a","n","h","runall","q"};
        parser.check_one_time_options(singles);
        const char* d_sub[] = {"l","a"};
        const char* l_args[] = {"all", "trace", "debug", "info", "warn", "error", "fatal"};
        parser.check_sub_options("d",d_sub);
        parser.check_option_arg_range("l",l_args);


        if (parser.option("n"))
        {
            num = string_cast<unsigned long>(parser.option("n").argument());
        }

        if (parser.option("q"))
        {
            be_verbose = false;
        }

        if (parser.option("h"))
        {
            cout << "Usage: test [options]\n";
            parser.print_options(cout);
            cout << "\n\n";
            return 0;
        }

        ofstream fout;
        if (parser.option("d"))
        {
            if (parser.option("a"))
                fout.open("debug.txt",ios::app);
            else
                fout.open("debug.txt");

            set_all_logging_output_streams(fout);

            if (parser.option("l").count() == 0)
                set_all_logging_levels(LALL);
            else if (parser.option("l").argument() == "all")
                set_all_logging_levels(LALL);
            else if (parser.option("l").argument() == "trace")
                set_all_logging_levels(LTRACE);
            else if (parser.option("l").argument() == "debug")
                set_all_logging_levels(LDEBUG);
            else if (parser.option("l").argument() == "info")
                set_all_logging_levels(LINFO);
            else if (parser.option("l").argument() == "warn")
                set_all_logging_levels(LWARN);
            else if (parser.option("l").argument() == "error")
                set_all_logging_levels(LERROR);
            else if (parser.option("l").argument() == "fatal")
                set_all_logging_levels(LFATAL);
        }
        else
        {
            set_all_logging_levels(LNONE);
        }

        unsigned long num_of_failed_tests = 0;
        unsigned long num_of_passed_tests = 0;
        for (unsigned long i = 0; i < num; ++i)
        {
            dlog << LINFO << "************ Starting Test Run " << i+1 << " of " << num << ". ************";

            // loop over all the testers and see if they are supposed to run
            testers().reset();
            while (testers().move_next())
            {
                tester& test= *testers().element().value();
                const clp::option_type& opt = parser.option(test.cmd_line_switch());
                // run the test for this option as many times as the user has requested.
                for (unsigned long j = 0; j < parser.option("runall").count() + opt.count(); ++j)
                {
                    // quit this loop if this option has arguments and this round through the loop is
                    // from the runall option being present.
                    if (test.num_of_args() > 0 && j == opt.count())
                        break;

                    if (be_verbose)
                        cout << "Running " << test.cmd_line_switch() << "   " << flush;

                    dlog << LINFO << "Running " << test.cmd_line_switch();
                    try
                    {
                        switch (test.num_of_args())
                        {
                            case 0:
                                test.perform_test();
                                break;
                            case 1:
                                test.perform_test(opt.argument(0,j));
                                break;
                            case 2:
                                test.perform_test(opt.argument(0,j), opt.argument(1,j));
                                break;
                            default:
                                cerr << "\n\nThe test '" << test.cmd_line_switch() << "' requested " << test.num_of_args()
                                    << " arguments but only 2 are supported." << endl;
                                dlog << LINFO << "The test '" << test.cmd_line_switch() << "' requested " << test.num_of_args()
                                    << " arguments but only 2 are supported.";
                                break;
                        }
                        if (be_verbose)
                            cout << "\r                                                                               \r";

                        ++num_of_passed_tests;

                    }
                    catch (std::exception& e)
                    {
                        if (be_verbose)
                        {
                            cout << "\n\n!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!\n";
                            cout << "!!!!!!!!!!!!!!!!!!!!!!!!!!!!! TEST FAILED: " << test.cmd_line_switch() 
                                << " !!!!!!!!!!!!!!!!!!!!!!!!!!!!!";
                            cout << "\n!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!\n\n";
                            cout << "Failure message from test: " << e.what() << endl;
                        }


                        dlog << LERROR << "!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!";
                        dlog << LERROR << "!!!!!!!!!!!!!!!!!!!!!!!!!!!!! TEST FAILED: " << test.cmd_line_switch() 
                            << " !!!!!!!!!!!!!!!!!!!!!!!!!!!!!";
                        dlog << LERROR << "!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!";
                        dlog << LERROR << "Failure message from test: " << e.what();
                        ++num_of_failed_tests;
                    }
                }
            }
        }
        dlog << LINFO << "Testing Finished";
        if (num_of_passed_tests == 0 && num_of_failed_tests == 0)
        {
            cout << "You didn't select any tests to run.\n";
            cout << "Try the -h option for more information.\n";
        }
        else if (num_of_failed_tests == 0)
        {
            if (be_verbose)
            {
                cout << "\n\nTesting Finished\n";
                cout << "Total number of individual testing statements executed: "<< number_of_testing_statements_executed() << endl;
                cout << "All tests completed successfully\n\n";
            }
            dlog << LINFO << "Total number of individual testing statements executed: "<< number_of_testing_statements_executed();
            dlog << LINFO << "All tests completed successfully";
        }
        else
        {
            if (be_verbose)
            {
                cout << "\n\nTesting Finished\n";
                cout << "Total number of individual testing statements executed: "<< number_of_testing_statements_executed() << endl;
                cout << "Number of failed tests: " << num_of_failed_tests << "\n";
                cout << "Number of passed tests: " << num_of_passed_tests << "\n\n";
            }
            dlog << LINFO << "Total number of individual testing statements executed: "<< number_of_testing_statements_executed();
            dlog << LWARN << "Number of failed tests: " << num_of_failed_tests;
            dlog << LWARN << "Number of passed tests: " << num_of_passed_tests;
        }

        return num_of_failed_tests;
    }
    catch (exception& e)
    {
        cout << e.what() << endl;
        cout << "\nTry the -h option for more information.\n";
        cout << endl;
    }
}

