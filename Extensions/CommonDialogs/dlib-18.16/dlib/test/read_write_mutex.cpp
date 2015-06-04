// Copyright (C) 2010  Davis E. King (davis@dlib.net)
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

    logger dlog("test.read_write_mutex");

    class read_write_mutex_tester : public tester, multithreaded_object
    {
    public:
        read_write_mutex_tester (
        ) :
            tester ("test_read_write_mutex",
                    "Runs tests on the read_write_mutex component.")
        {
            register_thread(*this, &read_write_mutex_tester::thread_write);
            register_thread(*this, &read_write_mutex_tester::thread_write);
            register_thread(*this, &read_write_mutex_tester::thread_write);

            register_thread(*this, &read_write_mutex_tester::thread_readonly);
            register_thread(*this, &read_write_mutex_tester::thread_readonly);
            register_thread(*this, &read_write_mutex_tester::thread_readonly);
            register_thread(*this, &read_write_mutex_tester::thread_readonly2);
            register_thread(*this, &read_write_mutex_tester::thread_readonly2);
            register_thread(*this, &read_write_mutex_tester::thread_readonly2);

        }

        read_write_mutex m;

        dlib::mutex mut;
        int num_write;
        int num_read;
        int max_read;

        bool failure;

        void thread_write ()
        {
            // do this so that the readonly threads can get into their loops first.  This way
            // we can see if the mutex lets many readers into their area
            dlib::sleep(250);
            for (int i = 0; i < 6; ++i)
            {
                auto_mutex lock(m);

                mut.lock();
                ++num_write;
                mut.unlock();

                // only one write thread should ever be active at once
                if (num_write != 1)
                {
                    failure = true;
                    dlog << LERROR << "1";
                }

                dlib::sleep(300);

                // only one write thread should ever be active at once
                if (num_write != 1)
                {
                    failure = true;
                    dlog << LERROR << "2";
                }

                mut.lock();
                --num_write;
                mut.unlock();

                print_spinner();
            }
            dlog << LINFO << "exit thread_write()";
        }

        void do_readonly_stuff()
        {
            mut.lock();
            ++num_read;
            max_read = max(num_read, max_read);
            mut.unlock();

            if (num_write != 0)
            {
                failure = true;
                dlog << LERROR << "3";
            }

            dlib::sleep(300);

            if (num_write != 0)
            {
                failure = true;
                dlog << LERROR << "4";
            }

            mut.lock();
            max_read = max(num_read, max_read);
            --num_read;
            mut.unlock();

            print_spinner();
        }

        void thread_readonly ()
        {
            for (int i = 0; i < 6; ++i)
            {
                auto_mutex_readonly lock(m);
                DLIB_TEST(lock.has_read_lock());
                DLIB_TEST(!lock.has_write_lock());
                do_readonly_stuff();

                lock.lock_readonly();
                DLIB_TEST(lock.has_read_lock());
                DLIB_TEST(!lock.has_write_lock());
                lock.unlock();
                DLIB_TEST(!lock.has_read_lock());
                DLIB_TEST(!lock.has_write_lock());
                lock.lock_readonly();
                DLIB_TEST(lock.has_read_lock());
                DLIB_TEST(!lock.has_write_lock());
                lock.lock_write();
                DLIB_TEST(!lock.has_read_lock());
                DLIB_TEST(lock.has_write_lock());
                lock.lock_write();
                DLIB_TEST(!lock.has_read_lock());
                DLIB_TEST(lock.has_write_lock());
            }

            dlog << LINFO << "exit thread_readonly()";
        }

        void thread_readonly2 ()
        {
            for (int i = 0; i < 6; ++i)
            {
                m.lock_readonly();
                auto_unlock_readonly unlock(m);

                do_readonly_stuff();
            }
            dlog << LINFO << "exit thread_readonly2()";
        }


        void perform_test (
        )
        {
            num_write = 0;
            num_read = 0;
            max_read = 0;
            failure = false;

            // doing this big block of weird stuff should have no effect.  
            {
                m.unlock();

                m.lock_readonly();
                m.lock_readonly();
                m.unlock();
                m.unlock_readonly();
                m.unlock();
                m.unlock_readonly();

                m.unlock();
                m.unlock_readonly();

                m.lock();
                m.unlock_readonly();
                m.unlock_readonly();
                m.unlock();
            }


            // start up our testing threads
            start();

            // wait for the threads to finish
            wait();


            DLIB_TEST(failure == false);
            DLIB_TEST_MSG(max_read == 6, "max_read: "<< max_read);

        }

    } a;


}



