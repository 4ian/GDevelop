// Copyright (C) 2006  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.


#include <sstream>
#include <string>
#include <cstdlib>
#include <ctime>

#include <dlib/reference_counter.h>
#include "tester.h"

namespace  
{

    using namespace test;
    using namespace std;
    using namespace dlib;

    logger dlog("test.reference_counter");

    template <
        typename ref_counter 
        >
    void reference_counter_test (
    )
    /*!
        requires
            - ref_counter is an implementation of reference_counter/reference_counter_kernel_abstract.h 
              and is instantiated to contain an int 
        ensures
            - runs tests on reference_counter for compliance with the specs 
    !*/
    {        

        ref_counter a, b, c;

        for (long i = 0; i < 10; ++i)
        {
            print_spinner();
            for (long j = 0; j < 10000; ++j)
            {
                a.modify() = j;
                b.modify() = j+1;
                c.modify() = j+2;
                DLIB_ASSERT(a.access() == j,"");
                DLIB_ASSERT(b.access() == j+1,"");
                DLIB_ASSERT(c.access() == j+2,"");
                DLIB_ASSERT(a.modify() == j,"");
                DLIB_ASSERT(b.modify() == j+1,"");
                DLIB_ASSERT(c.modify() == j+2,"");
                DLIB_ASSERT(a.access() == j,"");
                DLIB_ASSERT(b.access() == j+1,"");
                DLIB_ASSERT(c.access() == j+2,"");
                DLIB_ASSERT(a.modify() == j,"");
                DLIB_ASSERT(b.modify() == j+1,"");
                DLIB_ASSERT(c.modify() == j+2,"");
                a = c;
                DLIB_ASSERT(a.access() == j+2,"");
                DLIB_ASSERT(b.access() == j+1,"");
                DLIB_ASSERT(c.access() == j+2,"");
                DLIB_ASSERT(a.modify() == j+2,"");
                DLIB_ASSERT(b.modify() == j+1,"");
                DLIB_ASSERT(c.modify() == j+2,"");
                DLIB_ASSERT(a.access() == j+2,"");
                DLIB_ASSERT(b.access() == j+1,"");
                DLIB_ASSERT(c.access() == j+2,"");
                DLIB_ASSERT(a.modify() == j+2,"");
                DLIB_ASSERT(b.modify() == j+1,"");
                DLIB_ASSERT(c.modify() == j+2,"");

                a = b = c;
                DLIB_ASSERT(a.access() == b.access(),"");
                DLIB_ASSERT(a.access() == c.access(),"");
                DLIB_ASSERT(c.access() == b.access(),"");
                a.modify() = j;
                DLIB_ASSERT(a.access() == j,"");
                DLIB_ASSERT(a.access() != b.access(),"");
                DLIB_ASSERT(a.access() != c.access(),"");
                DLIB_ASSERT(c.access() == b.access(),"");
                DLIB_ASSERT(c.access() == j+2,"");
                DLIB_ASSERT(b.access() == j+2,"");

                DLIB_ASSERT(a.access() == j,"");
                a = a;
                DLIB_ASSERT(a.access() == j,"");
                c = c;
                DLIB_ASSERT(c.access() == j+2,"");
                DLIB_ASSERT(b.access() == j+2,"");
                swap(a,c);
                DLIB_ASSERT(a.access() == j+2,"");
                DLIB_ASSERT(c.access() == j,"");
                DLIB_ASSERT(b.access() == j+2,"");
            }
        }

    }





    class reference_counter_tester : public tester
    {
    public:
        reference_counter_tester (
        ) :
            tester ("test_reference_counter",
                    "Runs tests on the reference_counter component.")
        {}

        void perform_test (
        )
        {
            dlog << LINFO << "testing kernel_1a";
            reference_counter_test<reference_counter<int>::kernel_1a>  ();
        }
    } a;

}


