// Copyright (C) 2006  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.

#include <string>
#include "tester.h"
#include <cstdlib>
#include <dlib/threads.h>

namespace test
{
// -----------------------------------------------------------------------------

    bool be_verbose = true;

// -----------------------------------------------------------------------------

    static dlib::mutex spinner_mutex;
    static dlib::mutex test_count_mutex;
    dlib::uint64 test_count = 0;

// -----------------------------------------------------------------------------

    dlib::uint64 number_of_testing_statements_executed (
    )
    {
        dlib::auto_mutex lock(test_count_mutex);
        return test_count;
    }

    void increment_test_count (
    )
    {
        test_count_mutex.lock();
        ++test_count;
        test_count_mutex.unlock();
    }

// -----------------------------------------------------------------------------

    void check_test (
        bool _exp,
        long line,
        const char* file,
        const char* _exp_str
    )
    {
        test_count_mutex.lock();
        ++test_count;
        test_count_mutex.unlock();
        if ( !(_exp) )                                                         
        {                                                                       
            std::ostringstream dlib__out;                                       
            dlib__out << "\n\nError occurred at line " << line << ".\n";    
            dlib__out << "Error occurred in file " << file << ".\n";      
            dlib__out << "Failing expression was " << _exp_str << ".\n";           
            throw dlib::error(dlib__out.str());      
        }
    }                                                                      

// -----------------------------------------------------------------------------

    map_of_testers& testers (
    )
    {
        static map_of_testers t;
        return t;
    }

// -----------------------------------------------------------------------------

    tester::
    tester (
        const std::string& switch_name_,
        const std::string& description__,
        unsigned long num_of_args__
    ) :
        switch_name(switch_name_),
        description_(description__),
        num_of_args_(num_of_args__)
    {
        using namespace std;
        if (testers().is_in_domain(switch_name))
        {
            cerr << "ERROR: More than one tester has been defined with the switch '" << switch_name << "'." << endl;
            exit(1);
        }

        string temp(switch_name);
        tester* t = this;
        testers().add(temp,t);
    }

// -----------------------------------------------------------------------------

    const std::string& tester::
    cmd_line_switch (
    ) const
    {
        return switch_name;
    }

// -----------------------------------------------------------------------------

    const std::string& tester::
    description (
    ) const
    {
        return description_;
    }

// -----------------------------------------------------------------------------

    unsigned long tester::
    num_of_args (
    ) const
    {
        return num_of_args_;
    }

// -----------------------------------------------------------------------------

    void tester::
    perform_test (
    )
    {
    }

// -----------------------------------------------------------------------------

    void tester::
    perform_test (
        const std::string&  
    )
    {
    }

// -----------------------------------------------------------------------------

    void tester::
    perform_test (
        const std::string&, 
        const std::string& 
    )
    {
    }

// -----------------------------------------------------------------------------

    void print_spinner (
    )
    {
        if (be_verbose)
        {
            using namespace std;
            dlib::auto_mutex M(spinner_mutex);
            static int i = 0;
            cout << "\b\b";
            switch (i)
            {
                case 0: cout << '|'; break;
                case 1: cout << '/'; break;
                case 2: cout << '-'; break;
                case 3: cout << '\\'; break;
            }
            cout << " " << flush;
            i = (i+1)%4;
        }
    }

// -----------------------------------------------------------------------------

}



