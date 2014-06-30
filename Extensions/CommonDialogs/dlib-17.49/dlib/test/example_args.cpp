// Copyright (C) 2008  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.

#include "tester.h"

// This is called an unnamed-namespace and it has the effect of making everything 
// inside this file "private" so that everything you declare will have static linkage.  
// Thus we won't have any multiply defined symbol errors coming out of the linker when 
// we try to compile the test suite.
namespace  
{
    // Declare the logger we will use in this test.  The name of the logger 
    // should start with "test."
    dlib::logger dlog("test.example_args");

    using namespace test;

    class example_args_tester : public tester
    {
        /*!
            WHAT THIS OBJECT REPRESENTS
                This object represents a unit test.  When it is constructed
                it adds itself into the testing framework.
                
                This particular test requires the user to supply a command line 
                argument when they run it.
        !*/
    public:
        example_args_tester (
        ) :
            tester (
                "test_example_args",                // the command line argument name for this test
                "Run example tests with argument.", // the command line argument description
                1                                   // the number of command line arguments for this test
            )
        {}

        void perform_test (
            const std::string& arg
        )
        {
            // This message gets logged to the file debug.txt if the user has enabled logging by
            // supplying the -d option on the command line (and they haven't set the logging level
            // to something higher than LINFO).
            dlog << dlib::LINFO << "some message you want to log";
            dlog << dlib::LINFO << "the argument passed to this test was " << arg;

            // This test is considered a success if this function doesn't throw an exception.  
            // So we can use the DLIB_TEST_MSG macro to perform our tests since it throws an 
            // exception containing a message if its first argument is false.  

            // make sure 3 is bigger than 2
            DLIB_TEST_MSG(3 > 2,"This message prints if your compiler doesn't know 3 is bigger than 2");

            // make sure 5 is not equal to 9
            DLIB_TEST_MSG(5 != 9,"This message prints if your compiler thinks 5 is the same as 9");

            // If your test takes a long time to run you can also call print_spinner() 
            // periodically.  This will cause a spinning / character to display on the
            // console to indicate to the user that your test is still running (rather
            // than hung) 
            print_spinner();
        }

    };

    // Create an instance of this object.  Doing this causes this test
    // to be automatically inserted into the testing framework whenever this cpp file
    // is linked into the project.  Note that since we are inside an unnamed-namespace 
    // we won't get any linker errors about the symbol a being defined multiple times. 
    example_args_tester a;
}



