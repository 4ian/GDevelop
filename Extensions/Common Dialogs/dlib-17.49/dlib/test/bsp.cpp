// Copyright (C) 2012  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.


#include <dlib/bsp.h>
#include <dlib/threads.h>
#include <dlib/pipe.h>
#include <dlib/matrix.h>

#include "tester.h"

namespace  
{

    using namespace test;
    using namespace dlib;
    using namespace std;

    logger dlog("test.bsp");


    template <typename funct>
    struct callfunct_helper
    {
        callfunct_helper (
            funct f_,
            int port_,
            bool& error_occurred_
        ) :f(f_), port(port_), error_occurred(error_occurred_) {}

        funct f;
        int port;
        bool& error_occurred;

        void operator() (
        ) const
        {
            try
            {
                bsp_listen(port, f);
            }
            catch (exception& e)
            {
                dlog << LERROR << "error calling bsp_listen(): " << e.what();
                error_occurred = true;
            }
        }
    };

    template <typename funct>
    callfunct_helper<funct> callfunct(funct f, int port, bool& error_occurred)
    {
        return callfunct_helper<funct>(f,port,error_occurred);

    }

// ----------------------------------------------------------------------------------------

    template <typename funct>
    struct callfunct_helper_pn
    {
        callfunct_helper_pn (
            funct f_,
            int port_,
            bool& error_occurred_,
            dlib::pipe<unsigned short>& port_pipe_
        ) :f(f_), port(port_), error_occurred(error_occurred_), port_pipe(port_pipe_) {}

        funct f;
        int port;
        bool& error_occurred;
        dlib::pipe<unsigned short>& port_pipe;

        struct helper
        {
            helper (
                dlib::pipe<unsigned short>& port_pipe_
            ) : port_pipe(port_pipe_) {}

            dlib::pipe<unsigned short>& port_pipe;

            void operator() (unsigned short p) { port_pipe.enqueue(p); }
        };

        void operator() (
        ) const
        {
            try
            {
                bsp_listen_dynamic_port(port, helper(port_pipe), f);
            }
            catch (exception& e)
            {
                dlog << LERROR << "error calling bsp_listen_dynamic_port(): " << e.what();
                error_occurred = true;
            }
        }
    };

    template <typename funct>
    callfunct_helper_pn<funct> callfunct(funct f, int port, bool& error_occurred, dlib::pipe<unsigned short>& port_pipe)
    {
        return callfunct_helper_pn<funct>(f,port,error_occurred,port_pipe);
    }

// ----------------------------------------------------------------------------------------

    void sum_array_driver (
        bsp_context& obj,
        const std::vector<int>& v,
        int& result
    )
    {
        obj.broadcast(v);

        result = 0;
        int val;
        while(obj.try_receive(val))
            result += val;
    }

    void sum_array_other (
        bsp_context& obj
    )
    {
        std::vector<int> v;
        obj.receive(v);

        int sum = 0;
        for (unsigned long i = 0; i < v.size(); ++i)
            sum += v[i];

        obj.send(sum, 0);


    }


    void dotest1()
    {
        dlog << LINFO << "start dotest1()";
        print_spinner();
        bool error_occurred = false;
        {
            thread_function t1(callfunct(sum_array_other, 12345, error_occurred));
            thread_function t2(callfunct(sum_array_other, 12346, error_occurred));
            thread_function t3(callfunct(sum_array_other, 12347, error_occurred));
            std::vector<int> v;
            int true_value = 0;
            for (int i = 0; i < 10; ++i)
            {
                v.push_back(i);
                true_value += i;
            }

            // wait a little bit for the threads to start up
            dlib::sleep(200);

            try
            {
                int result;
                std::vector<network_address> hosts;
                hosts.push_back("127.0.0.1:12345");
                hosts.push_back("localhost:12346");
                hosts.push_back("127.0.0.1:12347");
                bsp_connect(hosts, sum_array_driver, dlib::ref(v), dlib::ref(result));

                dlog << LINFO << "result: "<< result;
                dlog << LINFO << "should be: "<< 3*true_value; 
                DLIB_TEST(result == 3*true_value);
            }
            catch (std::exception& e)
            {
                dlog << LERROR << "error during bsp_context: " << e.what();
                DLIB_TEST(false);
            }
        }
        DLIB_TEST(error_occurred == false);
    }

// ----------------------------------------------------------------------------------------

    template <unsigned long id>
    void test2_job(bsp_context& obj)
    {
        if (obj.node_id() == id)
            dlib::sleep(100);
    }

    template <unsigned long id>
    void dotest2()
    {
        dlog << LINFO << "start dotest2()";
        print_spinner();
        bool error_occurred = false;
        {
            thread_function t1(callfunct(test2_job<id>, 12345, error_occurred));
            thread_function t2(callfunct(test2_job<id>, 12346, error_occurred));
            thread_function t3(callfunct(test2_job<id>, 12347, error_occurred));

            // wait a little bit for the threads to start up
            dlib::sleep(200);

            try
            {
                std::vector<network_address> hosts;
                hosts.push_back("127.0.0.1:12345");
                hosts.push_back("127.0.0.1:12346");
                hosts.push_back("127.0.0.1:12347");
                bsp_connect(hosts, test2_job<id>);
            }
            catch (std::exception& e)
            {
                dlog << LERROR << "error during bsp_context: " << e.what();
                DLIB_TEST(false);
            }

        }
        DLIB_TEST(error_occurred == false);
    }

// ----------------------------------------------------------------------------------------

    void test3_job_driver(bsp_context& obj, int& result)
    {

        obj.broadcast(obj.node_id());

        int accum = 0;
        int temp = 0;
        while(obj.try_receive(temp))
            accum += temp;

        // send to node 1 so it can sum everything
        if (obj.node_id() != 1)
            obj.send(accum, 1);

        while(obj.try_receive(temp))
            accum += temp;

        // Now hop the accum values along the nodes until the value from node 1 gets to
        // node 0.
        obj.send(accum, (obj.node_id()+1)%obj.number_of_nodes());
        obj.receive(accum);
        obj.send(accum, (obj.node_id()+1)%obj.number_of_nodes());
        obj.receive(accum);
        obj.send(accum, (obj.node_id()+1)%obj.number_of_nodes());
        obj.receive(accum);

        // this whole block is a noop since it doesn't end up doing anything.
        for (int k = 0; k < 100; ++k)
        {
            dlog << LINFO << "k: " << k;
            for (int i = 0; i < 4; ++i)
            {
                obj.send(accum, (obj.node_id()+1)%obj.number_of_nodes());
                obj.receive(accum);
            }
        }


        dlog << LINFO << "TERMINATE";
        if (obj.node_id() == 0)
            result = accum;
    }


    void test3_job(bsp_context& obj)
    {
        int junk;
        test3_job_driver(obj, junk);
    }


    void dotest3()
    {
        dlog << LINFO << "start dotest3()";
        print_spinner();
        bool error_occurred = false;
        {
            dlib::pipe<unsigned short> ports(5);
            thread_function t1(callfunct(test3_job, 12345, error_occurred, ports));
            thread_function t2(callfunct(test3_job, 0, error_occurred, ports));
            thread_function t3(callfunct(test3_job, 12347, error_occurred, ports));


            try
            {
                std::vector<network_address> hosts;
                unsigned short port;
                ports.dequeue(port); hosts.push_back(network_address("127.0.0.1",port)); dlog << LINFO << "PORT: " << port;
                ports.dequeue(port); hosts.push_back(network_address("127.0.0.1",port)); dlog << LINFO << "PORT: " << port;
                ports.dequeue(port); hosts.push_back(network_address("127.0.0.1",port)); dlog << LINFO << "PORT: " << port;
                int result = 0;
                const int expected =  1+2+3 + 0+2+3 + 0+1+3 + 0+1+2;
                bsp_connect(hosts, test3_job_driver, dlib::ref(result));

                dlog << LINFO << "result: " << result;
                dlog << LINFO << "should be: " << expected;
                DLIB_TEST(result == expected);
            }
            catch (std::exception& e)
            {
                dlog << LERROR << "error during bsp_context: " << e.what();
                DLIB_TEST(false);
            }

        }
        DLIB_TEST(error_occurred == false);
    }

// ----------------------------------------------------------------------------------------

    void test4_job_driver(bsp_context& obj, int& result)
    {

        obj.broadcast(obj.node_id());

        int accum = 0;
        int temp = 0;
        while(obj.try_receive(temp))
            accum += temp;

        // send to node 1 so it can sum everything
        if (obj.node_id() != 1)
            obj.send(accum, 1);

        while(obj.try_receive(temp))
            accum += temp;

        // Now hop the accum values along the nodes until the value from node 1 gets to
        // node 0.
        obj.send(accum, (obj.node_id()+1)%obj.number_of_nodes());
        obj.receive(accum);
        obj.send(accum, (obj.node_id()+1)%obj.number_of_nodes());
        obj.receive(accum);
        obj.send(accum, (obj.node_id()+1)%obj.number_of_nodes());
        obj.receive(accum);

        // this whole block is a noop since it doesn't end up doing anything.
        for (int k = 0; k < 40; ++k)
        {
            dlog << LINFO << "k: " << k;
            for (int i = 0; i < 4; ++i)
            {
                obj.send(accum, (obj.node_id()+1)%obj.number_of_nodes());
                obj.receive(accum);

                obj.receive();
            }
        }


        dlog << LINFO << "TERMINATE";
        if (obj.node_id() == 0)
            result = accum;
    }


    void test4_job(bsp_context& obj)
    {
        int junk;
        test4_job_driver(obj, junk);
    }


    void dotest4()
    {
        dlog << LINFO << "start dotest4()";
        print_spinner();
        bool error_occurred = false;
        {
            dlib::pipe<unsigned short> ports(5);
            thread_function t1(callfunct(test4_job, 0, error_occurred, ports));
            thread_function t2(callfunct(test4_job, 0, error_occurred, ports));
            thread_function t3(callfunct(test4_job, 0, error_occurred, ports));


            try
            {
                std::vector<network_address> hosts;
                unsigned short port;
                ports.dequeue(port); hosts.push_back(network_address("127.0.0.1",port)); dlog << LINFO << "PORT: " << port;
                ports.dequeue(port); hosts.push_back(network_address("127.0.0.1",port)); dlog << LINFO << "PORT: " << port;
                ports.dequeue(port); hosts.push_back(network_address("127.0.0.1",port)); dlog << LINFO << "PORT: " << port;
                int result = 0;
                const int expected =  1+2+3 + 0+2+3 + 0+1+3 + 0+1+2;
                bsp_connect(hosts, test4_job_driver, dlib::ref(result));

                dlog << LINFO << "result: " << result;
                dlog << LINFO << "should be: " << expected;
                DLIB_TEST(result == expected);
            }
            catch (std::exception& e)
            {
                dlog << LERROR << "error during bsp_context: " << e.what();
                DLIB_TEST(false);
            }

        }
        DLIB_TEST(error_occurred == false);
    }

// ----------------------------------------------------------------------------------------

    void test5_job(
        bsp_context& ,
        int& val
    )
    {
        val = 25;
    }

    void dotest5()
    {
        dlog << LINFO << "start dotest5()";
        print_spinner();
        std::vector<network_address> hosts;
        int val = 0;
        bsp_connect(hosts, test5_job, dlib::ref(val));
        DLIB_TEST(val == 25);
    }

// ----------------------------------------------------------------------------------------

    double f ( double x)
    {
        return std::pow(x-2.0, 2.0);
    }


    void bsp_job_node_0 (
        bsp_context& context,
        double& min_value,
        double& optimal_x
    )
    {
        double left = -100;
        double right = 100;

        min_value = std::numeric_limits<double>::infinity();
        double interval_width = std::abs(right-left);

        // This is doing a BSP based grid search for the minimum of f().  Here we 
        // do 100 iterations where we keep shrinking the grid size.
        for (int i = 0; i < 100; ++i)
        {
            context.broadcast(left);
            context.broadcast(right);

            for (unsigned int k = 1; k < context.number_of_nodes(); ++k)
            {
                std::pair<double,double> val;
                context.receive(val);
                if (val.second < min_value)
                {
                    min_value = val.second;
                    optimal_x = val.first;
                }
            }

            interval_width *= 0.5;
            left  = optimal_x - interval_width/2;
            right = optimal_x + interval_width/2;
        }
    }


    void bsp_job_other_nodes (
        bsp_context& context
    )
    {
        double left, right;
        while (context.try_receive(left))
        {
            context.receive(right);

            const double l = (context.node_id()-1)/(context.number_of_nodes()-1.0);
            const double r = context.node_id()    /(context.number_of_nodes()-1.0);

            const double width = right-left;
            matrix<double> values_to_check = linspace(left +l*width, left + r*width, 100);

            double best_x = 0;
            double best_val = std::numeric_limits<double>::infinity();
            for (long j = 0; j < values_to_check.size(); ++j)
            {
                double temp = f(values_to_check(j));
                if (temp < best_val)
                {
                    best_val = temp;
                    best_x = values_to_check(j);
                }
            }

            context.send(make_pair(best_x, best_val), 0);
        }
    }

    void dotest6()
    {
        dlog << LINFO << "start dotest6()";
        print_spinner();
        bool error_occurred = false;
        {
            dlib::pipe<unsigned short> ports(5);
            thread_function t1(callfunct(bsp_job_other_nodes, 0, error_occurred, ports));
            thread_function t2(callfunct(bsp_job_other_nodes, 0, error_occurred, ports));
            thread_function t3(callfunct(bsp_job_other_nodes, 0, error_occurred, ports));


            try
            {
                std::vector<network_address> hosts;
                unsigned short port;
                ports.dequeue(port); hosts.push_back(network_address("127.0.0.1",port)); dlog << LINFO << "PORT: " << port;
                ports.dequeue(port); hosts.push_back(network_address("127.0.0.1",port)); dlog << LINFO << "PORT: " << port;
                ports.dequeue(port); hosts.push_back(network_address("127.0.0.1",port)); dlog << LINFO << "PORT: " << port;
                double min_value = 10, optimal_x = 0;
                bsp_connect(hosts, bsp_job_node_0, dlib::ref(min_value), dlib::ref(optimal_x));

                dlog << LINFO << "min_value: " << min_value;
                dlog << LINFO << "optimal_x: " << optimal_x;
                DLIB_TEST(std::abs(min_value - 0) < 1e-14);
                DLIB_TEST(std::abs(optimal_x - 2) < 1e-14);
            }
            catch (std::exception& e)
            {
                dlog << LERROR << "error during bsp_context: " << e.what();
                DLIB_TEST(false);
            }

        }
        DLIB_TEST(error_occurred == false);
    }
// ----------------------------------------------------------------------------------------

    class bsp_tester : public tester
    {

    public:
        bsp_tester (
        ) :
            tester ("test_bsp",
                    "Runs tests on the BSP components.")
        {}

        void perform_test (
        )
        {
            for (int i = 0; i < 3; ++i)
            {
                dotest1();
                dotest2<0>();
                dotest2<1>();
                dotest2<2>();
                dotest3();
                dotest4();
                dotest5();
                dotest6();
            }
        }
    } a;

}

