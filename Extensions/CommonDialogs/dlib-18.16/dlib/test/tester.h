// Copyright (C) 2006  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#ifndef DLIB_TESTEr_
#define DLIB_TESTEr_

#include <iostream>
#include <string>
#include <dlib/map.h>
#include <dlib/logger.h>
#include <dlib/assert.h>
#include <dlib/algs.h>
#include <typeinfo>

#ifdef  __INTEL_COMPILER
// ignore the bogus warning about not overloading perform_test() all the way
#pragma warning (disable: 654)
#endif


#define DLIB_TEST(_exp) check_test(_exp, __LINE__, __FILE__, #_exp);

#define DLIB_TEST_MSG(_exp,_message)                                        \
    {increment_test_count(); if ( !(_exp) )                                 \
    {                                                                       \
        std::ostringstream dlib_o_out;                                       \
        dlib_o_out << "\n\nError occurred at line " << __LINE__ << ".\n";    \
        dlib_o_out << "Error occurred in file " << __FILE__ << ".\n";        \
        dlib_o_out << "Failing expression was " << #_exp << ".\n";           \
        dlib_o_out << _message << "\n";                                      \
        throw dlib::error(dlib_o_out.str());                                 \
    }}

namespace test
{
    class tester;
    typedef dlib::map<std::string,tester*>::kernel_1a_c map_of_testers;

    map_of_testers& testers (
    );

// -----------------------------------------------------------------------------

    void check_test (
        bool _exp,
        long line,
        const char* file,
        const char* _exp_str
    );
    
// -----------------------------------------------------------------------------

// This bool controls any cout statements in this program.  Only print to 
// standard out if we should be verbose.  The default is true
    extern bool be_verbose;

// -----------------------------------------------------------------------------

    dlib::uint64 number_of_testing_statements_executed (
    );
    /*!
        ensures
            - returns the total number of DLIB_TEST and DLIB_TEST_MSG
              statements executed since program startup.
    !*/

    void increment_test_count (
    );
    /*!
        ensures
            - increments number_of_testing_statements_executed()
    !*/

// -----------------------------------------------------------------------------

    void print_spinner (
    );
    /*!
        ensures
            - reprints the spinner
    !*/

// -----------------------------------------------------------------------------

    class tester
    {
        /*!
            WHAT THIS OBJECT REPRESENTS
                This object represents a generic regression test.
        !*/

    public:

        tester (
            const std::string& switch_name,
            const std::string& description_,
            unsigned long num_of_args_ = 0
        );
        /*!
            requires
                - testers().is_in_domain(switch_name) == false
            ensures
                - #cmd_line_switch() == switch_name
                - #description() == description_
                - #num_of_args() == num_of_args_
                - adds this tester to the testers() map.
        !*/

        virtual ~tester (
        ){}

        const std::string& cmd_line_switch (
        ) const;
        /*!
            ensures
                - returns the name of the command line switch for this tester.
        !*/

        const std::string& description (
        ) const;
        /*!
            ensures
                - returns the description of what this tester tests.
        !*/

        unsigned long num_of_args (
        ) const;
        /*!
            ensures
                - returns the number of arguments this test expects
        !*/

        virtual void perform_test (
        );
        /*!
            requires
                - is invoked when number_of_args() == 0
            ensures
                - performs the test and throws an exception 
                  derived from std::exception if the test fails.
        !*/

        virtual void perform_test (
            const std::string& arg 
        );
        /*!
            requires
                - is invoked when number_of_args() == 1
            ensures
                - performs the test and throws an exception 
                  derived from std::exception if the test fails.
        !*/

        virtual void perform_test (
            const std::string& arg1, 
            const std::string& arg2 
        );
        /*!
            requires
                - is invoked when number_of_args() == 2
            ensures
                - performs the test and throws an exception 
                  derived from std::exception if the test fails.
        !*/

    private:

    // ---------------------------------------------------------------------------
    //             Implementation Details
    // ---------------------------------------------------------------------------

        /*!
            CONVENTION
                - switch_name == cmd_line_switch()
                - description_ == description()
                - num_of_args_ == num_of_args()
                - test::tester[switch_name] == this
        !*/

        const std::string switch_name;
        const std::string description_;
        const unsigned long num_of_args_;
    };

}

#endif // DLIB_TESTEr_

