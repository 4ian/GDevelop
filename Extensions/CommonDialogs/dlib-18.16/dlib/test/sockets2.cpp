// Copyright (C) 2008  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.

#include "tester.h"
#include <dlib/sockets.h>
#include <dlib/threads.h>
#include <dlib/array.h>
#include <algorithm>

// This is called an unnamed-namespace and it has the effect of making everything 
// inside this file "private" so that everything you declare will have static linkage.  
// Thus we won't have any multiply defined symbol errors coming out of the linker when 
// we try to compile the test suite.
namespace  
{
    using namespace test;
    using namespace dlib;
    using namespace std;
    // Declare the logger we will use in this test.  The name of the logger 
    // should start with "test."
    dlib::logger dlog("test.sockets2");


    class sockets2_tester : public tester, private multithreaded_object 
    {
        /*!
            WHAT THIS OBJECT REPRESENTS
                This object represents a unit test.  When it is constructed
                it adds itself into the testing framework.
        !*/

        short port_num;
        string data_to_send;

        bool test_failed;

        void write_thread (
        )
        {
            try
            {
                scoped_ptr<connection> con(connect("127.0.0.1", port_num));

                // Send a copy of the data down the connection so we can test our the read() function
                // that uses timeouts in the main thread.
                if (con->write(data_to_send.data(), data_to_send.size()) != (int)data_to_send.size())
                {
                    test_failed = true;
                    dlog << LERROR << "failed to send all the data down the connection";
                }

                close_gracefully(con,300000);
            }
            catch (exception& e)
            {
                test_failed = true;
                dlog << LERROR << e.what();
            }
        }

        void no_write_thread (
        )
        {
            try
            {
                scoped_ptr<connection> con(connect("127.0.0.1", port_num));

                // just do nothing until the connection closes
                char ch;
                con->read(&ch, 1);
                dlog << LDEBUG << "silent connection finally closing";
            }
            catch (exception& e)
            {
                test_failed = true;
                dlog << LERROR << e.what();
            }
        }

    public:
        sockets2_tester (
        ) :
            tester (
                "test_sockets2",       // the command line argument name for this test
                "Run sockets2 tests.", // the command line argument description
                0                     // the number of command line arguments for this test
            )
        {
            register_thread(*this, &sockets2_tester::write_thread);
            register_thread(*this, &sockets2_tester::write_thread);
            register_thread(*this, &sockets2_tester::write_thread);
            register_thread(*this, &sockets2_tester::write_thread);
            register_thread(*this, &sockets2_tester::write_thread);
            register_thread(*this, &sockets2_tester::no_write_thread);
        }

        void perform_test (
        )
        {
            run_tests(0);
            run_tests(40);
        }

        void run_tests (
            unsigned long timeout_to_use
        )
        {
            // make sure there aren't any threads running
            wait();

            port_num = 5000;
            test_failed = false;

            print_spinner();
            data_to_send = "oi 2m3ormao2m fo2im3fo23mi o2mi3 foa2m3fao23ifm2o3fmia23oima23iom3giugbiua";
            // make the block of data much larger
            for (int i = 0; i < 11; ++i)
                data_to_send = data_to_send + data_to_send;

            dlog << LINFO << "data block size: " << data_to_send.size();


            scoped_ptr<listener> list;
            DLIB_TEST(create_listener(list, port_num, "127.0.0.1") == 0);
            DLIB_TEST(list);

            // kick off the sending threads
            start();


            dlib::array<scoped_ptr<connection> > cons;
            std::vector<long> bytes_received(6,0);
            scoped_ptr<connection> con_temp;
            
            // accept the 6 connections we should get
            for (int i = 0; i < 6; ++i)
            {
                DLIB_TEST(list->accept(con_temp) == 0);
                cons.push_back(con_temp);
                print_spinner();
            }

            int finished_cons = 0;

            // now receive all the bytes from the sending threads
            while (finished_cons < 5)
            {
                for (unsigned long i = 0; i < cons.size(); ++i)
                {
                    if (cons[i])
                    {
                        const int buf_size = 3000;
                        char buf[buf_size];

                        int status = cons[i]->read(buf, buf_size, timeout_to_use);

                        if (status > 0)
                        {
                            DLIB_TEST(equal(buf, buf+status, data_to_send.begin()+bytes_received[i]));
                            bytes_received[i] += status;
                        }
                        else if (status == 0)
                        {
                            // the connection is closed to kill it
                            cons[i].reset();
                            ++finished_cons;
                        }
                    }
                }
                print_spinner();
            }

            for (unsigned long i = 0; i < bytes_received.size(); ++i)
            {
                DLIB_TEST(bytes_received[i] == (long)data_to_send.size() || cons[i]);
            }


            dlog << LINFO << "All data received correctly";

            cons.clear();


            print_spinner();

            DLIB_TEST(test_failed == false);


            // wait for all the sending threads to terminate
            wait();
        }
    };

    // Create an instance of this object.  Doing this causes this test
    // to be automatically inserted into the testing framework whenever this cpp file
    // is linked into the project.  Note that since we are inside an unnamed-namespace 
    // we won't get any linker errors about the symbol a being defined multiple times. 
    sockets2_tester a;

}


