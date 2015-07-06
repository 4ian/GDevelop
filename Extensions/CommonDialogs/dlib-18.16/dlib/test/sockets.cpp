// Copyright (C) 2006  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.


#include <sstream>
#include <string>
#include <cstdlib>
#include <ctime>
#include <dlib/sockets.h>
#include <dlib/server.h>
#include <dlib/misc_api.h>

#include "tester.h"

namespace  {

    using namespace test;
    using namespace dlib;
    using namespace std;

    dlib::mutex gm;
    dlib::signaler gs(gm);
    const char magic_num = 42;
    const int min_bytes_sent = 10000;
    int assigned_port;

    logger dlog("test.sockets");

// ----------------------------------------------------------------------------------------

    class serv : public server::kernel_1a_c
    {
    public:
        serv (
        ) :
            error_occurred (false),
            got_connections(false)
        {}

        void on_listening_port_assigned (
        )
        {
            auto_mutex M(gm);
            assigned_port = get_listening_port();
            gs.broadcast();
        }


        void on_connect (
            connection& con
        )
        {
            dlog << LINFO << "in serv::on_connect(): got new connection";
            int status;
            int count = 0;
            char buf[100];
            while ((status = con.read(buf,sizeof(buf))) > 0)
            {
                for (int i = 0; i < status; ++i)
                {
                    if (buf[i] != magic_num)
                    {
                        tag = 4.0;
                        error_occurred = true;
                    }
                }
                count += status;
            }
            if (count != min_bytes_sent)
            {
                tag = 5.0;
                error_occurred = true;
            }
            got_connections = true;
            dlog << LINFO << "in serv::on_connect(): on_connect ending";
        }

        bool error_occurred;
        bool got_connections;
        double tag;
    };

// ----------------------------------------------------------------------------------------

    class thread_container : public multithreaded_object
    {
    public:

        serv& srv;

        thread_container (
            serv& srv_
        ) : srv(srv_)
        {
            for (int i = 0; i < 10; ++i)
                register_thread(*this, &thread_container::thread_proc);

            // start up the threads
            start();
        }

        ~thread_container ()
        {
            // wait for all threads to terminate
            wait();
        }

        void thread_proc (
        )
        {
            try
            {
                dlog << LTRACE << "enter thread";
                {
                    auto_mutex M(gm);
                    while (assigned_port == 0)
                        gs.wait();
                }

                int status;
                scoped_ptr<connection> con;
                string hostname;
                string ip;
                status = get_local_hostname(hostname);
                if (status)
                {
                    srv.tag = 1.0;
                    srv.error_occurred = true;
                    srv.clear();
                    dlog << LERROR << "leaving thread, line: " << __LINE__;
                    dlog << LERROR << "get_local_hostname() failed";
                    return;
                }

                status = hostname_to_ip(hostname,ip);
                if (status)
                {
                    srv.tag = 2.0;
                    srv.error_occurred = true;
                    srv.clear();
                    dlog << LERROR << "leaving thread, line: " << __LINE__;
                    dlog << LERROR << "hostname_to_ip() failed";
                    return;
                }

                dlog << LTRACE << "try to connect to the server at port " << srv.get_listening_port();
                status = create_connection(con,srv.get_listening_port(),ip);
                if (status)
                {
                    srv.tag = 3.0;
                    srv.error_occurred = true;
                    srv.clear();
                    dlog << LERROR << "leaving thread, line: " << __LINE__;
                    dlog << LERROR << "create_connection() failed";
                    return;
                }

                dlog << LTRACE << "sending magic_num to server";
                int i;
                for (i = 0; i < min_bytes_sent; ++i)
                {
                    con->write(&magic_num,1); 
                }

                dlog << LTRACE << "shutting down connection to server";
                close_gracefully(con);
                dlog << LTRACE << "finished calling close_gracefully() on the connection";
            }
            catch (exception& e)
            {
                srv.error_occurred = true;
                dlog << LERROR << "exception thrown in thread_proc(): " << e.what();
                cout << "exception thrown in thread_proc(): " << e.what();
            }
            dlog << LTRACE << "exit thread";
        }
    };

    void run_server(serv* srv)
    {
        dlog << LTRACE << "calling srv.start()";
        srv->start();
        dlog << LTRACE << "srv.start() just ended.";
    }

    void sockets_test (
    )
    /*!
        requires
            - sockets is an implementation of sockets/sockets_kernel_abstract.h 
              is instantiated with int
        ensures
            - runs tests on sockets for compliance with the specs
    !*/
    {        

        dlog << LTRACE << "starting test";
        serv srv;

        assigned_port = 0;


        dlog << LTRACE << "spawning threads";
        thread_container stuff(srv);



        thread_function thread2(run_server, &srv);

        // wait until all the sending threads have ended
        stuff.wait();

        if (srv.error_occurred)
        {
            dlog << LDEBUG << "tag: " << srv.tag;
        }

        srv.clear();

        dlog << LTRACE << "ending successful test";
        DLIB_TEST( !srv.error_occurred); 
        DLIB_TEST( srv.got_connections); 
    }

// ----------------------------------------------------------------------------------------


    class sockets_tester : public tester
    {
    public:
        sockets_tester (
        ) :
            tester ("test_sockets",
                    "Runs tests on the sockets component.")
        {}

        void perform_test (
        )
        {
            sockets_test();
        }
    } a;

}

