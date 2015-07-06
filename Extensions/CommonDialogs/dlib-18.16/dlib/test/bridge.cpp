// Copyright (C) 2011  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.

#include <sstream>
#include <string>
#include <cstdlib>
#include <ctime>
#include <dlib/bridge.h>
#include <dlib/type_safe_union.h>

#include "tester.h"

namespace  
{
    using namespace test;
    using namespace dlib;
    using namespace std;

    logger dlog("test.bridge");

    const unsigned short testing_port = 41238;

    void do_test1()
    {
        dlib::pipe<int> in(0), out(0);

        bridge b1(connect_to_ip_and_port("127.0.0.1",testing_port), receive(in));
        bridge b2(listen_on_port(testing_port), transmit(out));

        for (int i = 0; i < 100; ++i)
        {
            int val = i;
            out.enqueue(val);
            val = 0;
            in.dequeue(val);
            DLIB_TEST(val == i);
        }
    }

    void do_test2()
    {
        dlib::pipe<int> in(0), out(0), echo_pipe(0);

        bridge b2(listen_on_port(testing_port), transmit(out), receive(in));
        bridge echo(connect_to_ip_and_port("127.0.0.1",testing_port), receive(echo_pipe), transmit(echo_pipe));

        for (int i = 0; i < 100; ++i)
        {
            int val = i;
            out.enqueue(val);
            val = 0;
            in.dequeue(val);
            DLIB_TEST(val == i);
        }
    }

    void do_test3()
    {
        dlib::pipe<int> in(10), out(10), echo_pipe(10);

        bridge b2(listen_on_port(testing_port), transmit(out), receive(in));
        bridge echo(connect_to_ip_and_port("127.0.0.1",testing_port), receive(echo_pipe), transmit(echo_pipe));

        b2.reconfigure(listen_on_port(testing_port), transmit(out), receive(in));

        for (int i = 0; i < 100; ++i)
        {
            int val = i;
            out.enqueue(val);
            val = 0;
            in.dequeue(val);
            DLIB_TEST(val == i);
        }
    }

    void do_test4()
    {
        dlib::pipe<int> in(0), out(0), echo_pipe(0);

        bridge b2, echo;
        b2.reconfigure(listen_on_port(testing_port), receive(in), transmit(out));
        echo.reconfigure(connect_to_ip_and_port("127.0.0.1",testing_port), transmit(echo_pipe), receive(echo_pipe));

        for (int i = 0; i < 100; ++i)
        {
            int val = i;
            out.enqueue(val);
            val = 0;
            in.dequeue(val);
            DLIB_TEST(val == i);
        }
    }

    void do_test5(int pipe_size)
    {
        typedef type_safe_union<int, bridge_status> tsu_type;

        dlib::pipe<tsu_type> out(pipe_size);
        dlib::pipe<tsu_type> in(pipe_size);
        dlib::pipe<bridge_status> out_status(pipe_size);

        bridge b1(connect_to_ip_and_port("127.0.0.1",testing_port), receive(in));
        tsu_type msg;

        msg = b1.get_bridge_status();
        DLIB_TEST(msg.contains<bridge_status>() == true);
        DLIB_TEST(msg.get<bridge_status>().is_connected == false);
        DLIB_TEST(msg.get<bridge_status>().foreign_ip == "");
        DLIB_TEST(msg.get<bridge_status>().foreign_port == 0);

        {
            bridge b2(listen_on_port(testing_port), transmit(out), receive(out_status));

            in.dequeue(msg);
            DLIB_TEST(msg.contains<bridge_status>() == true);
            DLIB_TEST(msg.get<bridge_status>().is_connected == true);
            DLIB_TEST(msg.get<bridge_status>().foreign_ip == "127.0.0.1");
            DLIB_TEST(msg.get<bridge_status>().foreign_port == testing_port);
            msg = b1.get_bridge_status();
            DLIB_TEST(msg.contains<bridge_status>() == true);
            DLIB_TEST(msg.get<bridge_status>().is_connected == true);
            DLIB_TEST(msg.get<bridge_status>().foreign_ip == "127.0.0.1");
            DLIB_TEST(msg.get<bridge_status>().foreign_port == testing_port);

            bridge_status temp;
            out_status.dequeue(temp);
            DLIB_TEST(temp.is_connected == true);
            DLIB_TEST(temp.foreign_ip == "127.0.0.1");

            for (int i = 0; i < 100; ++i)
            {
                msg = i;
                out.enqueue(msg);

                msg.get<int>() = 0;

                in.dequeue(msg);
                DLIB_TEST(msg.contains<int>() == true);
                DLIB_TEST(msg.get<int>() == i);
            }

        }

        in.dequeue(msg);
        DLIB_TEST(msg.contains<bridge_status>() == true);
        DLIB_TEST(msg.get<bridge_status>().is_connected == false);
        DLIB_TEST(msg.get<bridge_status>().foreign_ip == "127.0.0.1");
        DLIB_TEST(msg.get<bridge_status>().foreign_port == testing_port);
    }

    void do_test5_5(int pipe_size)
    {
        typedef type_safe_union<int, bridge_status> tsu_type;

        dlib::pipe<tsu_type> out(pipe_size);
        dlib::pipe<tsu_type> in(pipe_size);
        dlib::pipe<bridge_status> out_status(pipe_size);

        bridge b1(connect_to_ip_and_port("127.0.0.1",testing_port), receive(in));
        tsu_type msg;

        bridge b2(listen_on_port(testing_port), transmit(out), receive(out_status));

        in.dequeue(msg);
        DLIB_TEST(msg.contains<bridge_status>() == true);
        DLIB_TEST(msg.get<bridge_status>().is_connected == true);
        DLIB_TEST(msg.get<bridge_status>().foreign_ip == "127.0.0.1");
        DLIB_TEST(msg.get<bridge_status>().foreign_port == testing_port);

        bridge_status temp;
        out_status.dequeue(temp);
        DLIB_TEST(temp.is_connected == true);
        DLIB_TEST(temp.foreign_ip == "127.0.0.1");

        for (int i = 0; i < 100; ++i)
        {
            msg = i;
            out.enqueue(msg);

            msg.get<int>() = 0;

            in.dequeue(msg);
            DLIB_TEST(msg.contains<int>() == true);
            DLIB_TEST(msg.get<int>() == i);
        }

        b2.clear();
        msg = b2.get_bridge_status();
        DLIB_TEST(msg.contains<bridge_status>() == true);
        DLIB_TEST(msg.get<bridge_status>().is_connected == false);
        DLIB_TEST(msg.get<bridge_status>().foreign_ip == "");
        DLIB_TEST(msg.get<bridge_status>().foreign_port == 0);

        in.dequeue(msg);
        DLIB_TEST(msg.contains<bridge_status>() == true);
        DLIB_TEST(msg.get<bridge_status>().is_connected == false);
        DLIB_TEST(msg.get<bridge_status>().foreign_ip == "127.0.0.1");
        DLIB_TEST(msg.get<bridge_status>().foreign_port == testing_port);
    }

    void do_test6()
    {
        dlib::pipe<int> in(0), out(300);

        bridge b1(connect_to_ip_and_port("127.0.0.1",testing_port), receive(in));
        bridge b2(listen_on_port(testing_port), transmit(out));

        for (int i = 0; i < 100; ++i)
        {
            int val = i;
            out.enqueue(val);
        }

        int val = 10;
        in.dequeue(val);
        DLIB_TEST(val == 0);
        dlib::sleep(100);
        in.dequeue(val);
        DLIB_TEST(val == 1);
        dlib::sleep(100);
    }

    class test_bridge : public tester
    {
    public:
        test_bridge (
        ) :
            tester ("test_bridge",
                    "Runs tests on the bridge component.")
        {}

        void perform_test (
        )
        {
            dlog << LINFO << "testing bridge, using local port number of " << testing_port; 

            print_spinner();
            do_test1();
            print_spinner();
            do_test2();
            print_spinner();
            do_test3();
            print_spinner();
            do_test4();
            print_spinner();
            for (int i = 0; i < 5; ++i)
                do_test5(i);
            do_test5_5(1);
            print_spinner();
            do_test6();
        }
    } a;



}



