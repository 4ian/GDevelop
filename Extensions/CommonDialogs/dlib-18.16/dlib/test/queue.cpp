// Copyright (C) 2003  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.


#include <sstream>
#include <string>
#include <cstdlib>
#include <ctime>
#include <dlib/queue.h>
#include <dlib/memory_manager_global.h>

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
    logger dlog("test.queue");

    template <
        typename queue
        >
    void queue_sort_test (
    )
    /*!
        requires
            - queue is an implementation of queue/queue_sort_abstract.h 
              is instantiated with int
        ensures
            - runs tests on queue for compliance with the specs
    !*/
    {        

        print_spinner();
        srand(static_cast<unsigned int>(time(0)));

        queue q,q2;

        enumerable<int>& e = q;

        // I will use these DLIB_TEST_MSG macros to assert that conditions are true.  If they are
        // false then it means we have detected an error in the queue object.  CASSERT
        // will then throw an exception which we will catch at the end of this function and
        // report as an error/failed test.
        DLIB_TEST(e.at_start() == true);

        int a = 0;

        DLIB_TEST(q.size() == 0);
        DLIB_TEST(q.at_start() == true);
        DLIB_TEST(q.current_element_valid() == false);

        q.sort();

        DLIB_TEST(q.size() == 0);
        DLIB_TEST(q.at_start() == true);
        DLIB_TEST(q.current_element_valid() == false);

        DLIB_TEST (q.move_next() == false);
        DLIB_TEST (q.move_next() == false);
        DLIB_TEST (q.move_next() == false);
        DLIB_TEST (q.move_next() == false);
        DLIB_TEST (q.move_next() == false);
        DLIB_TEST (q.move_next() == false);


        DLIB_TEST(q.size() == 0);
        DLIB_TEST(q.at_start() == false);
        DLIB_TEST(q.current_element_valid() == false);


        q.reset();

        DLIB_TEST(q.size() == 0);
        DLIB_TEST(q.at_start() == true);
        DLIB_TEST(q.current_element_valid() == false);











        q.clear();
        q2.clear();
        DLIB_TEST(q.size() == 0);
        DLIB_TEST(q2.size() == 0);

        for (int i = 0; i < 10000; ++i)
        {
            int a = i;
            q.enqueue(a);
        }

        q2.cat(q);

        DLIB_TEST(q.size() == 0);
        DLIB_TEST(q2.size() == 10000);

        int g = 0;
        while (q2.move_next())
        {
            DLIB_TEST_MSG(q2.element() == g,g);
            ++g;
        }

        for (int i = 0;i < 10000; ++i)
        {
            int a = 0;
            q2.dequeue(a);
            DLIB_TEST(a == i);
        }

        DLIB_TEST(q.size() == 0);
        DLIB_TEST(q2.size() == 0);
        q.clear();
        q2.clear();




        print_spinner();


        dlog << LTRACE << "creating big pre-sorted queue";
        q.clear();
        DLIB_TEST(q.size() == 0);

        for (int i = 0; i < 10000; ++i)
        {
            int a = i;
            q.enqueue(a);
        }

        dlog << LTRACE << "sorting already sorted queue";
        q.sort();


        dlog << LTRACE << "done sorting, checking the results";
        for (int i = 0; i < 10000; ++i)
        {
            q.dequeue(a);
            DLIB_TEST(a == i);
        }


        q.clear();
        dlog << LTRACE << "done with the big pre-sorted queue test";















        q.clear();
        q2.clear();
        DLIB_TEST(q.size() == 0);
        DLIB_TEST(q2.size() == 0);

        for (int i = 0; i < 1; ++i)
        {
            int a = i;
            q.enqueue(a);
        }

        q2.cat(q);

        DLIB_TEST(q.size() == 0);
        DLIB_TEST(q2.size() == 1);



        g = 0;
        while (q2.move_next())
        {
            DLIB_TEST_MSG(q2.element() == g,g);
            ++g;
        }

        for (int i = 0;i < 1; ++i)
        {
            int a = 0;
            q2.dequeue(a);
            DLIB_TEST(a == i);
        }

        DLIB_TEST(q.size() == 0);
        DLIB_TEST(q2.size() == 0);
        q.clear();
        q2.clear();







        print_spinner();











        for (int j = 0; j < 3; ++j)
        {
            for (int i = 0; i < 10000; ++i)
            {
                a = ::rand();
                q.enqueue(a);
            }

            while (q.move_next()) ;

            DLIB_TEST(q.at_start() == false);

            q.sort();

            DLIB_TEST(q.at_start() == true);

            // serialize the state of q, then clear q, then
            // load the state back into q.
            ostringstream sout;
            serialize(q,sout);
            DLIB_TEST(q.at_start() == true);
            istringstream sin(sout.str());
            q.clear();
            deserialize(q,sin);


            DLIB_TEST(q.at_start() == true);

            a = 0;
            int last = 0;
            while (q.move_next())
            {
                ++a;
                DLIB_TEST_MSG(last <= q.element(),"items weren't actually sorted");
                last = q.element();
                DLIB_TEST(q.current_element_valid() == true);
                DLIB_TEST(q.at_start() == false);
                DLIB_TEST(q.current_element_valid() == true);


            }
            DLIB_TEST_MSG(a == 10000,"some items were lost between the sorting and iterating");


            DLIB_TEST(q.size() == 10000);
            swap(q,q2);
            DLIB_TEST(q2.at_start() == false);
            DLIB_TEST(q2.current_element_valid() == false);

            DLIB_TEST (q2.move_next() == false);
            DLIB_TEST (q2.move_next() == false);
            DLIB_TEST (q2.move_next() == false);
            DLIB_TEST (q2.move_next() == false);
            DLIB_TEST (q2.move_next() == false);
            DLIB_TEST (q2.move_next() == false);


            DLIB_TEST(q2.size() == 10000);
            DLIB_TEST(q2.at_start() == false);
            DLIB_TEST(q2.current_element_valid() == false);

            q2.clear();

            q.swap(q2);

            DLIB_TEST(q.size() == 0);
            DLIB_TEST(q.at_start() == true);
            DLIB_TEST(q.current_element_valid() == false);
        }



        print_spinner();



        // try the above code but this time with just one element
        // in the queue
        for (int j = 0; j < 3; ++j)
        {
            for (int i = 0; i < 1; ++i)
            {
                a = ::rand();
                q.enqueue(a);
            }

            q.sort();

            a = 0;
            int last = 0;
            while (q.move_next())
            {
                ++a;
                DLIB_TEST_MSG(last <= q.element(),"items weren't actually sorted");
                DLIB_TEST(q.current_element_valid() == true);

            }
            DLIB_TEST_MSG(a == 1,"some items were lost between the sorting and iterating");


            DLIB_TEST(q.size() == 1);
            DLIB_TEST(q.at_start() == false);
            DLIB_TEST(q.current_element_valid() == false);

            q.clear();

            DLIB_TEST(q.size() == 0);
            DLIB_TEST(q.at_start() == true);
            DLIB_TEST(q.current_element_valid() == false);
        }


        print_spinner();

        {
            q.clear();
            remover<int>& go = q;
            for (int i = 0; i < 100; ++i)
            {
                int a = 3;
                q.enqueue(a);
            }
            DLIB_TEST(go.size() == 100);                
            for (int i = 0; i < 100; ++i)
            {
                int a = 9;
                q.remove_any(a);
                DLIB_TEST(a == 3);
            }
            DLIB_TEST(go.size() == 0);
        }

    }


    struct factory
    {
        template <typename U>
        struct return_type {
            typedef typename memory_manager<U>::kernel_3c type;
        };

        template <typename U>
        static typename return_type<U>::type* get_instance (
        )
        {
            static typename return_type<U>::type a;
            return &a;
        }
    };




    class queue_tester : public tester
    {
        /*!
            WHAT THIS OBJECT REPRESENTS
                This object represents a test for the queue object.  When it is constructed
                it adds itself into the testing framework.  The command line switch is
                specified as test_queue by passing that string to the tester constructor.
        !*/
    public:
        queue_tester (
        ) :
            tester ("test_queue",
                    "Runs tests on the queue component.")
        {}

        void perform_test (
        )
        {
            // There are multiple implementations of the queue object so use
            // the templated function defined above to test them all and report
            // a failed test if any of them don't pass.

            typedef dlib::memory_manager_global<char,factory>::kernel_1a mm;


            dlog << LINFO << "testing sort_1a_c";
            queue_sort_test<queue<int, mm>::sort_1a_c>  ();
            dlog << LINFO << "testing sort_1a";
            queue_sort_test<queue<int, mm>::sort_1a>();
            dlog << LINFO << "testing sort_1b";
            queue_sort_test<queue<int, mm>::sort_1b>  ();
            dlog << LINFO << "testing sort_1b_c";
            queue_sort_test<queue<int, mm>::sort_1b_c>();
            dlog << LINFO << "testing sort_1c";
            queue_sort_test<queue<int, mm>::sort_1c>  ();
            dlog << LINFO << "testing sort_1c_c";
            queue_sort_test<queue<int, mm>::sort_1c_c>();
        }
    } a;

}

