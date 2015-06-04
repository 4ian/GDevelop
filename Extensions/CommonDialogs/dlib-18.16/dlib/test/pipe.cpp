// Copyright (C) 2006  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.


#include <sstream>
#include <string>
#include <cstdlib>
#include <ctime>
#include <dlib/misc_api.h>
#include <dlib/pipe.h>

#include "tester.h"

namespace  
{
    using namespace test;
    using namespace dlib;
    using namespace std;

    logger dlog("test.pipe");

    namespace pipe_kernel_test_helpers
    {
        const unsigned long proc1_count = 10000;
        dlib::mutex m;
        signaler s(m);
        unsigned long threads_running = 0;
        bool found_error;

        inline void add_running_thread (
        )
        {
            auto_mutex M(m);
            ++threads_running;
        }

        inline void remove_running_thread (
        )
        {
            auto_mutex M(m);
            --threads_running;
            s.broadcast();
        }

        inline void wait_for_threads (
        )
        {
            auto_mutex M(m);
            while (threads_running > 0)
                s.wait();
        }

        template <
            typename pipe
            >
        void threadproc1 (
            void* param
        )
        {
            add_running_thread();
            pipe& p = *static_cast<pipe*>(param);
            try
            {

                int last = -1;
                for (unsigned long i = 0; i < proc1_count; ++i)
                {
                    int cur=0;
                    DLIB_TEST(p.dequeue(cur) == true);
                    DLIB_TEST(last + 1 == cur);
                    last = cur;
                }
                DLIB_TEST(p.size() == 0);
            }
            catch(exception& e)
            {
                auto_mutex M(m);
                found_error = true;
                cout << "\n\nERRORS FOUND" << endl;
                cout << e.what() << endl;
                dlog << LWARN << "ERRORS FOUND";
                dlog << LWARN << e.what();
                p.disable();
            }        

            remove_running_thread();
        }


        template <
            typename pipe
            >
        void threadproc2 (
            void* param
        )
        {
            add_running_thread();
            pipe& p = *static_cast<pipe*>(param);
            try
            {

                int last = -1;
                int cur;
                while (p.dequeue(cur))
                {
                    DLIB_TEST(last < cur);
                    last = cur;
                }
                auto_mutex M(m);
            }
            catch(exception& e)
            {
                auto_mutex M(m);
                found_error = true;
                cout << "\n\nERRORS FOUND" << endl;
                cout << e.what() << endl;
                dlog << LWARN << "ERRORS FOUND";
                dlog << LWARN << e.what();
                p.disable();
            }        
            remove_running_thread();
        }



        template <
            typename pipe
            >
        void threadproc3 (
            void* param
        )
        {
            add_running_thread();
            pipe& p = *static_cast<pipe*>(param);
            try
            {

                int last = -1;
                int cur;
                while (p.dequeue_or_timeout(cur,100000))
                {
                    DLIB_TEST(last < cur);
                    last = cur;
                }
                auto_mutex M(m);
            }
            catch(exception& e)
            {
                auto_mutex M(m);
                found_error = true;
                cout << "\n\nERRORS FOUND" << endl;
                cout << e.what() << endl;
                dlog << LWARN << "ERRORS FOUND";
                dlog << LWARN << e.what();
                p.disable();
            }        
            remove_running_thread();
        }


    }

// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------

    template<typename in_type, typename out_type>
    class PipelineProcessor : private dlib::threaded_object
    {
    public:
        PipelineProcessor(
            dlib::pipe<in_type> & in,
            dlib::pipe<out_type> & out) :
            InPipe(in),
            OutPipe(out),
            InMsg(),
            OutMsg() {
                start();
            }

        ~PipelineProcessor() {
            // signal the thread to stop
            stop();
            wait();
        }

    private:
        dlib::pipe<in_type> & InPipe;
        dlib::pipe<out_type> & OutPipe;

        in_type InMsg;
        out_type OutMsg;

        void thread() 
        {
            while (!should_stop()) {
                if(InPipe.dequeue_or_timeout(InMsg, 100)) 
                {
                    // if function signals ready to send OutMsg
                    while (!OutPipe.enqueue_or_timeout(OutMsg, 100)) 
                    {
                        // try to send until should stop
                        if (should_stop()) 
                        {
                            return;
                        }
                    }
                }
            }
        };
    };


    void do_zero_size_test_with_timeouts()
    {
        dlog << LINFO << "in do_zero_size_test_with_timeouts()";
        // make sure we can get though this without deadlocking
        for (int k = 0; k < 10; ++k)
        {
            dlib::pipe<int> in_pipe(10);
            dlib::pipe<float> out_pipe(0);
            {
                PipelineProcessor<int, float> pp(in_pipe, out_pipe);

                int in = 1;
                in_pipe.enqueue(in);
                in = 2;
                in_pipe.enqueue(in);
                in = 3;
                in_pipe.enqueue(in);
                // sleep to make sure thread enqueued
                dlib::sleep(100);

                float out = 1.0f;
                out_pipe.dequeue(out);
                dlib::sleep(100);
            }
            print_spinner();
        }

    }

// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------

    template <
        typename pipe
        >
    void pipe_kernel_test (
    )
    /*!
        requires
            - pipe is an implementation of pipe/pipe_kernel_abstract.h and
              is instantiated with int
        ensures
            - runs tests on pipe for compliance with the specs 
    !*/
    {        
        using namespace pipe_kernel_test_helpers;
        found_error = false;


        print_spinner();
        pipe test(10), test2(100);
        pipe test_0(0), test2_0(0);
        pipe test_1(1), test2_1(1);

        DLIB_TEST(test.size() == 0);
        DLIB_TEST(test2.size() == 0);
        DLIB_TEST(test_0.size() == 0);
        DLIB_TEST(test2_0.size() == 0);
        DLIB_TEST(test_1.size() == 0);
        DLIB_TEST(test2_1.size() == 0);

        DLIB_TEST(test.is_enqueue_enabled() == true);
        DLIB_TEST(test.is_dequeue_enabled() == true);
        DLIB_TEST(test.is_enabled() == true);

        test.empty();
        test2.empty();
        DLIB_TEST(test.size() == 0);
        DLIB_TEST(test2.size() == 0);

        test_0.empty();
        test2_0.empty();
        DLIB_TEST(test_0.size() == 0);
        DLIB_TEST(test2_0.size() == 0);

        test_1.empty();
        test2_1.empty();
        DLIB_TEST(test_1.size() == 0);
        DLIB_TEST(test2_1.size() == 0);



        int a;
        a = 3;
        test.enqueue(a);
        DLIB_TEST(test.size() == 1);
        a = 5;
        test.enqueue(a);
        DLIB_TEST(test.size() == 2);

        a = 0;
        test.dequeue(a);
        DLIB_TEST(a == 3);
        DLIB_TEST(test.size() == 1);

        a = 0;
        test.dequeue(a);
        DLIB_TEST(a == 5);
        DLIB_TEST(test.size() == 0);


        print_spinner();
        {
            dlog << LINFO << "starting normal length pipe tests";
            create_new_thread(&threadproc1<pipe>,&test);
            create_new_thread(&threadproc2<pipe>,&test2);
            create_new_thread(&threadproc2<pipe>,&test2);
            create_new_thread(&threadproc2<pipe>,&test2);

            for (unsigned long i = 0; i < proc1_count; ++i)
            {
                a = i;
                test.enqueue(a);
            }
            DLIB_TEST(test.is_enqueue_enabled() == true);
            test.disable_enqueue();
            DLIB_TEST(test.is_enqueue_enabled() == false);
            for (unsigned long i = 0; i < proc1_count; ++i)
            {
                a = i;
                test.enqueue(a);
            }

            for (unsigned long i = 0; i < 100000; ++i)
            {
                a = i;
                if (i%2 == 0)
                    test2.enqueue(a);
                else
                    test2.enqueue_or_timeout(a,100000);
            }

            test2.wait_for_num_blocked_dequeues(3);
            DLIB_TEST(test2.size() == 0);
            test2.disable();

            wait_for_threads();
            DLIB_TEST(test2.size() == 0);

            test2.enable();

            print_spinner();

            create_new_thread(&threadproc3<pipe>,&test2);
            create_new_thread(&threadproc3<pipe>,&test2);


            for (unsigned long i = 0; i < 100000; ++i)
            {
                a = i;
                if (i%2 == 0)
                    test2.enqueue(a);
                else
                    test2.enqueue_or_timeout(a,100000);
            }

            test2.wait_for_num_blocked_dequeues(2);
            DLIB_TEST(test2.size() == 0);
            test2.disable();

            wait_for_threads();
            DLIB_TEST(test2.size() == 0);

        }


        print_spinner();
        {
            dlog << LINFO << "starting 0 length pipe tests";
            create_new_thread(&threadproc1<pipe>,&test_0);
            create_new_thread(&threadproc2<pipe>,&test2_0);
            create_new_thread(&threadproc2<pipe>,&test2_0);
            create_new_thread(&threadproc2<pipe>,&test2_0);
            dlog << LTRACE << "0: 1";

            for (unsigned long i = 0; i < proc1_count; ++i)
            {
                a = i;
                test_0.enqueue(a);
            }

            dlog << LTRACE << "0: 2";
            DLIB_TEST(test_0.is_enqueue_enabled() == true);
            test_0.disable_enqueue();
            DLIB_TEST(test_0.is_enqueue_enabled() == false);
            for (unsigned long i = 0; i < proc1_count; ++i)
            {
                a = i;
                test_0.enqueue(a);
            }

            dlog << LTRACE << "0: 3";
            for (unsigned long i = 0; i < 100000; ++i)
            {
                a = i;
                if (i%2 == 0)
                    test2_0.enqueue(a);
                else
                    test2_0.enqueue_or_timeout(a,100000);
            }

            print_spinner();
            dlog << LTRACE << "0: 4";
            test2_0.wait_for_num_blocked_dequeues(3);
            DLIB_TEST(test2_0.size() == 0);
            test2_0.disable();

            wait_for_threads();
            DLIB_TEST(test2_0.size() == 0);

            dlog << LTRACE << "0: 5";
            test2_0.enable();


            create_new_thread(&threadproc3<pipe>,&test2_0);
            create_new_thread(&threadproc3<pipe>,&test2_0);


            for (unsigned long i = 0; i < 20000; ++i)
            {
                if ((i%100) == 0)
                    print_spinner();

                a = i;
                if (i%2 == 0)
                    test2_0.enqueue(a);
                else
                    test2_0.enqueue_or_timeout(a,100000);
            }

            dlog << LTRACE << "0: 6";
            test2_0.wait_for_num_blocked_dequeues(2);
            DLIB_TEST(test2_0.size() == 0);
            test2_0.disable();

            wait_for_threads();
            DLIB_TEST(test2_0.size() == 0);

            dlog << LTRACE << "0: 7";
        }

        print_spinner();
        {
            dlog << LINFO << "starting 1 length pipe tests";
            create_new_thread(&threadproc1<pipe>,&test_1);
            create_new_thread(&threadproc2<pipe>,&test2_1);
            create_new_thread(&threadproc2<pipe>,&test2_1);
            create_new_thread(&threadproc2<pipe>,&test2_1);

            for (unsigned long i = 0; i < proc1_count; ++i)
            {
                a = i;
                test_1.enqueue(a);
            }
            DLIB_TEST(test_1.is_enqueue_enabled() == true);
            test_1.disable_enqueue();
            DLIB_TEST(test_1.is_enqueue_enabled() == false);
            for (unsigned long i = 0; i < proc1_count; ++i)
            {
                a = i;
                test_1.enqueue(a);
            }
            print_spinner();

            for (unsigned long i = 0; i < 100000; ++i)
            {
                a = i;
                if (i%2 == 0)
                    test2_1.enqueue(a);
                else
                    test2_1.enqueue_or_timeout(a,100000);
            }

            test2_1.wait_for_num_blocked_dequeues(3);
            DLIB_TEST(test2_1.size() == 0);
            test2_1.disable();

            wait_for_threads();
            DLIB_TEST(test2_1.size() == 0);

            test2_1.enable();


            create_new_thread(&threadproc3<pipe>,&test2_1);
            create_new_thread(&threadproc3<pipe>,&test2_1);


            for (unsigned long i = 0; i < 100000; ++i)
            {
                a = i;
                if (i%2 == 0)
                    test2_1.enqueue(a);
                else
                    test2_1.enqueue_or_timeout(a,100000);
            }

            test2_1.wait_for_num_blocked_dequeues(2);
            DLIB_TEST(test2_1.size() == 0);
            test2_1.disable();

            wait_for_threads();
            DLIB_TEST(test2_1.size() == 0);

        }

        test.enable_enqueue();
        test_0.enable_enqueue();
        test_1.enable_enqueue();

        DLIB_TEST(test.is_enabled());
        DLIB_TEST(test.is_enqueue_enabled());
        DLIB_TEST(test_0.is_enabled());
        DLIB_TEST(test_0.is_enqueue_enabled());
        DLIB_TEST(test_1.is_enabled());
        DLIB_TEST(test_1.is_enqueue_enabled());

        DLIB_TEST(test.size() == 0);
        DLIB_TEST(test_0.size() == 0);
        DLIB_TEST(test_1.size() == 0);
        DLIB_TEST(test.max_size() == 10);
        DLIB_TEST(test_0.max_size() == 0);
        DLIB_TEST(test_1.max_size() == 1);


        for (int i = 0; i < 100; ++i)
        {
            a = 1;
            test.enqueue_or_timeout(a,0);
            a = 1;
            test_0.enqueue_or_timeout(a,0);
            a = 1;
            test_1.enqueue_or_timeout(a,0);
        }

        DLIB_TEST_MSG(test.size() == 10,"size: " << test.size() );
        DLIB_TEST_MSG(test_0.size() == 0,"size: " << test.size() );
        DLIB_TEST_MSG(test_1.size() == 1,"size: " << test.size() );

        for (int i = 0; i < 10; ++i)
        {
            a = 0;
            DLIB_TEST(test.enqueue_or_timeout(a,10) == false);
            a = 0;
            DLIB_TEST(test_0.enqueue_or_timeout(a,10) == false);
            a = 0;
            DLIB_TEST(test_1.enqueue_or_timeout(a,10) == false);
        }

        DLIB_TEST_MSG(test.size() == 10,"size: " << test.size() );
        DLIB_TEST_MSG(test_0.size() == 0,"size: " << test.size() );
        DLIB_TEST_MSG(test_1.size() == 1,"size: " << test.size() );

        for (int i = 0; i < 10; ++i)
        {
            a = 0;
            DLIB_TEST(test.dequeue_or_timeout(a,0) == true);
            DLIB_TEST(a == 1);
        }

        DLIB_TEST(test.max_size() == 10);
        DLIB_TEST(test_0.max_size() == 0);
        DLIB_TEST(test_1.max_size() == 1);

        a = 0;
        DLIB_TEST(test_1.dequeue_or_timeout(a,0) == true);

        DLIB_TEST(test.max_size() == 10);
        DLIB_TEST(test_0.max_size() == 0);
        DLIB_TEST(test_1.max_size() == 1);


        DLIB_TEST_MSG(a == 1,"a: " << a);

        DLIB_TEST(test.size() == 0);
        DLIB_TEST(test_0.size() == 0);
        DLIB_TEST(test_1.size() == 0);

        DLIB_TEST(test.dequeue_or_timeout(a,0) == false);
        DLIB_TEST(test_0.dequeue_or_timeout(a,0) == false);
        DLIB_TEST(test_1.dequeue_or_timeout(a,0) == false);
        DLIB_TEST(test.dequeue_or_timeout(a,10) == false);
        DLIB_TEST(test_0.dequeue_or_timeout(a,10) == false);
        DLIB_TEST(test_1.dequeue_or_timeout(a,10) == false);

        DLIB_TEST(test.size() == 0);
        DLIB_TEST(test_0.size() == 0);
        DLIB_TEST(test_1.size() == 0);

        DLIB_TEST(found_error == false);




        {
            test.enable();
            test.enable_enqueue();
            test.empty();
            DLIB_TEST(test.size() == 0);
            DLIB_TEST(test.is_enabled() == true);
            DLIB_TEST(test.is_enqueue_enabled() == true);
            DLIB_TEST(test.is_dequeue_enabled() == true);
            test.disable_dequeue();
            dlog << LINFO << "Make sure disable_dequeue() works right...";
            DLIB_TEST(test.is_dequeue_enabled() == false);
            DLIB_TEST(test.dequeue(a) == false);
            test.wait_until_empty();
            a = 4;
            test.enqueue(a);
            test.wait_until_empty();
            test.wait_for_num_blocked_dequeues(4);
            DLIB_TEST(test.size() == 1);
            DLIB_TEST(test.dequeue(a) == false);
            DLIB_TEST(test.dequeue_or_timeout(a,10000) == false);
            DLIB_TEST(test.size() == 1);
            a = 0;
            test.enable_dequeue();
            DLIB_TEST(test.is_dequeue_enabled() == true);
            DLIB_TEST(test.dequeue(a) == true);
            DLIB_TEST(a == 4);
            test_1.wait_until_empty();
        }
        {
            test_1.enable();
            test_1.enable_enqueue();
            test_1.empty();
            DLIB_TEST(test_1.size() == 0);
            DLIB_TEST(test_1.is_enabled() == true);
            DLIB_TEST(test_1.is_enqueue_enabled() == true);
            DLIB_TEST(test_1.is_dequeue_enabled() == true);
            test_1.disable_dequeue();
            dlog << LINFO << "Make sure disable_dequeue() works right...";
            DLIB_TEST(test_1.is_dequeue_enabled() == false);
            DLIB_TEST(test_1.dequeue(a) == false);
            a = 4;
            test_1.wait_for_num_blocked_dequeues(4);
            test_1.wait_for_num_blocked_dequeues(0);
            test_1.enqueue(a);
            test_1.wait_until_empty();
            DLIB_TEST(test_1.size() == 1);
            DLIB_TEST(test_1.dequeue(a) == false);
            DLIB_TEST(test_1.dequeue_or_timeout(a,10000) == false);
            DLIB_TEST(test_1.size() == 1);
            a = 0;
            test_1.enable_dequeue();
            DLIB_TEST(test_1.is_dequeue_enabled() == true);
            DLIB_TEST(test_1.dequeue(a) == true);
            DLIB_TEST(a == 4);
            test_1.wait_until_empty();
        }

    }




    class pipe_tester : public tester
    {
    public:
        pipe_tester (
        ) :
            tester ("test_pipe",
                    "Runs tests on the pipe component.")
        {}

        void perform_test (
        )
        {
            pipe_kernel_test<dlib::pipe<int> >();

            do_zero_size_test_with_timeouts();
        }
    } a;

}


