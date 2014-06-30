// Copyright (C) 2007  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.


#include <sstream>
#include <string>
#include <cstdlib>
#include <ctime>

#include <dlib/timer.h>
#include <dlib/timeout.h>
#include "tester.h"

namespace  
{

    using namespace test;
    using namespace std;
    using namespace dlib;

    logger dlog("test.timer");

    class timer_test_helper
    {
    public:
        mutex m;
        int count;
        dlib::uint64 timestamp;
        dlib::timestamper ts;

        timer_test_helper():count(0), timestamp(0){}
        void add() 
        { 
            m.lock(); 
            ++count; 
            m.unlock(); 
        }

        void delayed_add()
        {
            dlib::sleep(1000);
            add();
        }

        void set_timestamp()
        {
            m.lock();
            timestamp = ts.get_timestamp();
            dlog << LTRACE << "in set_timestamp(), time is " << timestamp;
            dlib::sleep(1);
            m.unlock();
        }
    };

    template <
        typename timer_t
        >
    void timer_test2 (
    )
    /*!
        requires
            - timer_t is an implementation of timer/timer_kernel_abstract.h is instantiated 
              timer_test_helper
        ensures
            - runs tests on timer_t for compliance with the specs 
    !*/
    {        
        for (int j = 0; j < 4; ++j)
        {
            print_spinner();
            timer_test_helper h;

            timer_t t1(h,&timer_test_helper::set_timestamp);
            t1.set_delay_time(0);
            dlog << LTRACE << "t1.start()";
            t1.start();

            dlib::sleep(60);
            t1.stop_and_wait();

            dlib::uint64 cur_time = h.ts.get_timestamp();
            dlog << LTRACE << "get current time: " << cur_time;

            // make sure the action function has been called recently
            DLIB_TEST_MSG((cur_time-h.timestamp)/1000 < 30, (cur_time-h.timestamp)/1000);

        }
    }

    template <
        typename timer_t
        >
    void timer_test (
    )
    /*!
        requires
            - timer_t is an implementation of timer/timer_kernel_abstract.h is instantiated 
              timer_test_helper
        ensures
            - runs tests on timer_t for compliance with the specs 
    !*/
    {        

        print_spinner();
        for (int j = 0; j < 3; ++j)
        {
            timer_test_helper h;

            timer_t t1(h,&timer_test_helper::add);
            timer_t t2(h,&timer_test_helper::add);
            timer_t t3(h,&timer_test_helper::add);

            DLIB_TEST(t1.delay_time() == 1000);
            DLIB_TEST(t2.delay_time() == 1000);
            DLIB_TEST(t3.delay_time() == 1000);
            DLIB_TEST(t1.is_running() == false);
            DLIB_TEST(t2.is_running() == false);
            DLIB_TEST(t3.is_running() == false);
            DLIB_TEST(t1.action_function() == &timer_test_helper::add);
            DLIB_TEST(t2.action_function() == &timer_test_helper::add);
            DLIB_TEST(t3.action_function() == &timer_test_helper::add);
            DLIB_TEST(&t1.action_object() == &h);
            DLIB_TEST(&t2.action_object() == &h);
            DLIB_TEST(&t3.action_object() == &h);

            t1.set_delay_time(1000);
            t2.set_delay_time(500);
            t3.set_delay_time(200);

            DLIB_TEST(t1.delay_time() == 1000);
            DLIB_TEST(t2.delay_time() == 500);
            DLIB_TEST(t3.delay_time() == 200);
            DLIB_TEST(t1.is_running() == false);
            DLIB_TEST(t2.is_running() == false);
            DLIB_TEST(t3.is_running() == false);
            DLIB_TEST(t1.action_function() == &timer_test_helper::add);
            DLIB_TEST(t2.action_function() == &timer_test_helper::add);
            DLIB_TEST(t3.action_function() == &timer_test_helper::add);
            DLIB_TEST(&t1.action_object() == &h);
            DLIB_TEST(&t2.action_object() == &h);
            DLIB_TEST(&t3.action_object() == &h);
            dlib::sleep(1100);
            print_spinner();
            DLIB_TEST(h.count == 0);

            t1.stop_and_wait();
            t2.stop_and_wait();
            t3.stop_and_wait();

            dlib::sleep(1100);
            print_spinner();
            DLIB_TEST(h.count == 0);
            DLIB_TEST(t1.delay_time() == 1000);
            DLIB_TEST(t2.delay_time() == 500);
            DLIB_TEST(t3.delay_time() == 200);
            DLIB_TEST(t1.is_running() == false);
            DLIB_TEST(t2.is_running() == false);
            DLIB_TEST(t3.is_running() == false);
            DLIB_TEST(t1.action_function() == &timer_test_helper::add);
            DLIB_TEST(t2.action_function() == &timer_test_helper::add);
            DLIB_TEST(t3.action_function() == &timer_test_helper::add);
            DLIB_TEST(&t1.action_object() == &h);
            DLIB_TEST(&t2.action_object() == &h);
            DLIB_TEST(&t3.action_object() == &h);

            t1.start();
            t2.start();
            t3.start();

            DLIB_TEST(t1.delay_time() == 1000);
            DLIB_TEST(t2.delay_time() == 500);
            DLIB_TEST(t3.delay_time() == 200);
            DLIB_TEST(t1.is_running() == true);
            DLIB_TEST(t2.is_running() == true);
            DLIB_TEST(t3.is_running() == true);
            DLIB_TEST(t1.action_function() == &timer_test_helper::add);
            DLIB_TEST(t2.action_function() == &timer_test_helper::add);
            DLIB_TEST(t3.action_function() == &timer_test_helper::add);
            DLIB_TEST(&t1.action_object() == &h);
            DLIB_TEST(&t2.action_object() == &h);
            DLIB_TEST(&t3.action_object() == &h);

            t1.stop();
            t2.stop();
            t3.stop();

            DLIB_TEST(t1.delay_time() == 1000);
            DLIB_TEST(t2.delay_time() == 500);
            DLIB_TEST(t3.delay_time() == 200);
            DLIB_TEST(t1.is_running() == false);
            DLIB_TEST(t2.is_running() == false);
            DLIB_TEST(t3.is_running() == false);
            DLIB_TEST(t1.action_function() == &timer_test_helper::add);
            DLIB_TEST(t2.action_function() == &timer_test_helper::add);
            DLIB_TEST(t3.action_function() == &timer_test_helper::add);
            DLIB_TEST(&t1.action_object() == &h);
            DLIB_TEST(&t2.action_object() == &h);
            DLIB_TEST(&t3.action_object() == &h);

            DLIB_TEST(h.count == 0);
            dlib::sleep(1100);
            print_spinner();
            DLIB_TEST(h.count == 0);

            for (int i = 1; i <= 3; ++i)
            {
                t1.start();
                t2.start();
                t3.start();

                DLIB_TEST(t1.is_running() == true);
                DLIB_TEST(t2.is_running() == true);
                DLIB_TEST(t3.is_running() == true);

                dlib::sleep(1100);
                // this should allow the timers to trigger 8 times
                t1.stop();
                t2.stop();
                t3.stop();

                DLIB_TEST_MSG(h.count == 8*i,"h.count: " << h.count << " i: " << i);
                dlib::sleep(1100);
                DLIB_TEST_MSG(h.count == 8*i,"h.count: " << h.count << " i: " << i);
            }


            h.count = 0;
            t1.start();
            dlib::sleep(300);
            DLIB_TEST_MSG(h.count == 0,h.count);
            t1.set_delay_time(400);
            dlib::sleep(200);
            DLIB_TEST_MSG(h.count == 1,h.count);
            dlib::sleep(250);
            DLIB_TEST_MSG(h.count == 1,h.count);
            dlib::sleep(100);
            DLIB_TEST_MSG(h.count == 2,h.count);
            t1.set_delay_time(2000);
            DLIB_TEST_MSG(h.count == 2,h.count);
            dlib::sleep(1000);
            DLIB_TEST_MSG(h.count == 2,h.count);
            t1.clear();

            h.count = 0;
            t3.start();
            DLIB_TEST(t3.is_running() == true);
            DLIB_TEST(t3.delay_time() == 200);
            DLIB_TEST_MSG(h.count == 0,h.count);
            t3.clear();
            DLIB_TEST(t3.is_running() == false);
            DLIB_TEST(t3.delay_time() == 1000);
            DLIB_TEST_MSG(h.count == 0,h.count);
            dlib::sleep(200);
            DLIB_TEST(t3.is_running() == false);
            DLIB_TEST(t3.delay_time() == 1000);
            DLIB_TEST_MSG(h.count == 0,h.count);


            {
                h.count = 0;
                timer_t t4(h,&timer_test_helper::delayed_add);
                t4.set_delay_time(100);
                t4.start();
                DLIB_TEST_MSG(h.count == 0,h.count);
                dlib::sleep(400);
                DLIB_TEST_MSG(h.count == 0,h.count);
                t4.stop_and_wait();
                DLIB_TEST_MSG(h.count == 1,h.count);
                DLIB_TEST(t4.is_running() == false);
            }

            {
                h.count = 0;
                timer_t t4(h,&timer_test_helper::delayed_add);
                t4.set_delay_time(100);
                t4.start();
                DLIB_TEST_MSG(h.count == 0,h.count);
                dlib::sleep(400);
                DLIB_TEST_MSG(h.count == 0,h.count);
                t4.clear();
                DLIB_TEST(t4.is_running() == false);
                DLIB_TEST_MSG(h.count == 0,h.count);
                t4.stop_and_wait();
                DLIB_TEST_MSG(h.count == 1,h.count);
                DLIB_TEST(t4.is_running() == false);
            }

            {
                h.count = 0;
                timer_t t5(h,&timer_test_helper::delayed_add);
                t5.set_delay_time(100);
                t5.start();
                DLIB_TEST_MSG(h.count == 0,h.count);
                dlib::sleep(400);
                DLIB_TEST_MSG(h.count == 0,h.count);
            }
            DLIB_TEST_MSG(h.count == 1,h.count);

        }

    }




    class timer_tester : public tester
    {
    public:
        timer_tester (
        ) :
            tester ("test_timer",
                    "Runs tests on the timer component.")
        {}

        void perform_test (
        )
        {
            dlog << LINFO << "testing kernel_1a with test_timer";
            timer_test<timer<timer_test_helper>::kernel_1a>  ();
            dlog << LINFO << "testing kernel_1a with test_timer2";
            timer_test2<timer<timer_test_helper>::kernel_1a>  ();

            dlog << LINFO << "testing kernel_2a with test_timer";
            timer_test<timer<timer_test_helper>::kernel_2a>  ();
            dlog << LINFO << "testing kernel_2a with test_timer2";
            timer_test2<timer<timer_test_helper>::kernel_2a>  ();
        }
    } a;

}


