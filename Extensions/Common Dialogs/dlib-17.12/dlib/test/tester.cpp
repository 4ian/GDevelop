// Copyright (C) 2006  Davis E. King (davisking@users.sourceforge.net)
// License: Boost Software License   See LICENSE.txt for the full license.

#include <string>
#include "tester.h"
#include <cstdlib>
#include <dlib/threads.h>

namespace test
{

    static dlib::mutex spinner_mutex;

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

// -----------------------------------------------------------------------------

}



