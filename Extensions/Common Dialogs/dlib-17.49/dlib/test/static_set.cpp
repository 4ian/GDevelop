// Copyright (C) 2005  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.


#include <sstream>
#include <string>
#include <cstdlib>
#include <ctime>

#include <dlib/queue.h>
#include <dlib/static_set.h>
#include <dlib/set.h>
#include "tester.h"

namespace  
{

    using namespace test;
    using namespace std;
    using namespace dlib;

    logger dlog("test.static_set");

    template <
        typename set
        >
    void static_set_kernel_test (
    )
    /*!
        requires
            - set is an implementation of static_set/static_set_kernel_abstract.h and
              is instantiated to hold ints
        ensures
            - runs tests on set for compliance with the specs 
    !*/
    {        

        print_spinner();

        srand(static_cast<unsigned int>(time(0)));

        typedef queue<int>::kernel_2a_c queue_of_int;
        typedef dlib::set<int>::kernel_1a_c set_of_int;

        queue_of_int q, qb, qc;
        set_of_int ds;

        set S;
        S.load(ds);

        for (int k = 1; k < 1000; ++k)
        {
            q.clear();
            qb.clear();
            qc.clear();
            unsigned long num = k; 
            for (unsigned long i = 0; i < num; ++i)
            {
                int a = ::rand()&0xFF;
                int b = a;
                int c = a;
                q.enqueue(a);
                qb.enqueue(b);
                qc.enqueue(c);
            }



            set s;

            DLIB_TEST(s.size() == 0);
            DLIB_TEST(s.at_start());
            DLIB_TEST(s.current_element_valid() == false);
            DLIB_TEST(s.move_next() == false);
            DLIB_TEST(s.current_element_valid() == false);
            DLIB_TEST(s.at_start() == false);

            s.load(q);
            DLIB_TEST(s.at_start());
            set se;
            se.load(q);

            DLIB_TEST(se.size() == 0);
            DLIB_TEST(se.at_start() == true);
            DLIB_TEST(se.current_element_valid() == false);     
            DLIB_TEST(se.move_next() == false);
            DLIB_TEST(se.at_start() == false);
            DLIB_TEST(se.current_element_valid() == false);


            DLIB_TEST(s.size() == qb.size());
            DLIB_TEST(s.at_start() == true);
            DLIB_TEST(s.current_element_valid() == false);     
            DLIB_TEST(s.move_next() == true);
            DLIB_TEST(s.at_start() == false);
            DLIB_TEST(s.current_element_valid() == true);
            s.reset();
            se.reset();

            swap(se,s);

            DLIB_TEST(s.size() == 0);
            DLIB_TEST(s.at_start() == true);
            DLIB_TEST(s.current_element_valid() == false);     
            DLIB_TEST(s.move_next() == false);
            DLIB_TEST(s.at_start() == false);
            DLIB_TEST(s.current_element_valid() == false);

            DLIB_TEST(se.size() == qb.size());
            DLIB_TEST(se.at_start() == true);
            DLIB_TEST(se.current_element_valid() == false);     
            DLIB_TEST(se.move_next() == true);
            DLIB_TEST(se.at_start() == false);
            DLIB_TEST(se.current_element_valid() == true);
            s.reset();
            se.reset();

            swap(se,s);



            int last = 0;
            while (s.move_next())
            {
                DLIB_TEST(last <= s.element());
                last = s.element();
            }



            while (qb.move_next())
            {
                int a;
                qb.dequeue(a);
                DLIB_TEST(s.is_member(a));
                DLIB_TEST(!se.is_member(a));

                // make sure is_member() doesn't hang
                for (int l = 0; l < 100; ++l)
                {
                    int a = ::rand();
                    s.is_member(a);
                }
            }

            swap(s,se);

            // serialize the state of se, then clear se, then
            // load the state back into se.
            ostringstream sout;
            serialize(se,sout);
            DLIB_TEST(se.at_start() == true);
            istringstream sin(sout.str());
            se.clear();
            deserialize(se,sin);
            DLIB_TEST(se.at_start() == true);


            last = 0;
            while (se.move_next())
            {
                DLIB_TEST(last <= se.element());
                last = se.element();
            }


            DLIB_TEST(s.size() == 0);
            DLIB_TEST(se.size() == qc.size());

            while (qc.move_next())
            {
                int a;
                qc.dequeue(a);
                DLIB_TEST(se.is_member(a));
                DLIB_TEST(!s.is_member(a));
            }


        }
    }





    class static_set_tester : public tester
    {
    public:
        static_set_tester (
        ) :
            tester ("test_static_set",
                    "Runs tests on the static_set component.")
        {}

        void perform_test (
        )
        {
            dlog << LINFO << "testing kernel_1a";
            static_set_kernel_test<static_set<int>::kernel_1a>  ();
            dlog << LINFO << "testing kernel_1a_c";
            static_set_kernel_test<static_set<int>::kernel_1a_c>();
        }
    } a;

}

