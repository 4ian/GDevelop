// Copyright (C) 2006  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.


#include <sstream>
#include <string>
#include <cstdlib>
#include <ctime>
#include <dlib/misc_api.h>
#include <dlib/threads.h>

#include "tester.h"

namespace  
{
    using namespace test;
    using namespace dlib;
    using namespace std;

    logger dlog("test.threads");

    class threads_tester : public tester
    {
    public:
        threads_tester (
        ) :
            tester ("test_threads",
                    "Runs tests on the threads component."),
            sm(cm)
        {}

        thread_specific_data<int> tsd;
        rmutex cm;
        rsignaler sm;
        int count;
        bool failure;

        void perform_test (
        )
        {
            failure = false;
            print_spinner();


            count = 10;
            if (!create_new_thread<threads_tester,&threads_tester::thread1>(*this)) failure = true;
            if (!create_new_thread<threads_tester,&threads_tester::thread2>(*this)) failure = true;
            if (!create_new_thread<threads_tester,&threads_tester::thread3>(*this)) failure = true;
            if (!create_new_thread<threads_tester,&threads_tester::thread4>(*this)) failure = true;
            if (!create_new_thread<threads_tester,&threads_tester::thread5>(*this)) failure = true;
            if (!create_new_thread<threads_tester,&threads_tester::thread6>(*this)) failure = true;
            if (!create_new_thread<threads_tester,&threads_tester::thread7>(*this)) failure = true;
            if (!create_new_thread<threads_tester,&threads_tester::thread8>(*this)) failure = true;
            if (!create_new_thread<threads_tester,&threads_tester::thread9>(*this)) failure = true;
            if (!create_new_thread<threads_tester,&threads_tester::thread10>(*this)) failure = true;

            thread(66);

            // this should happen in the main program thread
            if (is_dlib_thread())
                failure = true;

            auto_mutex M(cm);
            while (count > 0 && !failure)
                sm.wait();


            DLIB_TEST(!failure);
        }

        void thread_end_handler (
        )
        {
            auto_mutex M(cm);
            --count;
            if (count == 0)
                sm.signal();
        }

        void thread1() { thread(1); }
        void thread2() 
        { 
            thread(2); 
            if (is_dlib_thread() == false)
                failure = true;
        }
        void thread3() { thread(3); }
        void thread4() { thread(4); }
        void thread5() { thread(5); }
        void thread6() { thread(6); }
        void thread7() { thread(7); }
        void thread8() { thread(8); }
        void thread9() { thread(9); }
        void thread10() { thread(10); }

        void thread (
            int num
        )
        {
            dlog << LTRACE << "starting thread num " << num;
            if (is_dlib_thread())
                register_thread_end_handler(*this,&threads_tester::thread_end_handler);
            tsd.data() = num;
            for (int i = 0; i < 0x3FFFF; ++i)
            {
                if ((i&0xFFF) == 0)
                {
                    print_spinner();
                    dlib::sleep(10);
                }
                // if this isn't equal to num then there is a problem with the thread specific data stuff
                if (tsd.data() != num)
                {
                    auto_mutex M(cm);
                    failure = true;
                    sm.signal();
                }
            }
            dlog << LTRACE << "ending of thread num " << num;

        }
    } a;


}



