// The contents of this file are in the public domain. See LICENSE_FOR_EXAMPLE_PROGRAMS.txt
/*

    This is an example illustrating the use of the Bulk Synchronous Parallel (BSP)
    processing tools from the dlib C++ Library.  These tools allow you to easily setup a
    number of processes running on different computers which cooperate to compute some
    result.  

    In this example, we will use the BSP tools to find the minimizer of a simple function.  
    In particular, we will setup a nested grid search where different parts of the grid are
    searched in parallel by different processes.  


    To run this program you should do the following (supposing you want to use three BSP
    nodes to do the grid search and, to make things easy, you will run them all on your
    current computer):  

        1. Open three command windows and navigate each to the folder containing the 
           compiled bsp_ex.cpp program.  Let's call these window 1, window 2, and window 3.

        2. In window 1 execute this command:
             ./bsp_ex -l12345
           This will start a listening BSP node that listens on port 12345.  The BSP node
           won't do anything until we tell all the nodes to start running in step 4 below.

        3.  In window 2 execute this command:
             ./bsp_ex -l12346
           This starts another listening BSP node.  Note that since we are running this 
           example all on one computer you need to use different listening port numbers
           for each listening node.

        4. In window 3 execute this command:
             ./bsp_ex localhost:12345 localhost:12346
           This will start a BSP node that connects to the others and gets them all running.
           Additionally, as you will see when we go over the code below, it will also print
           the final output of the BSP process, which is the minimizer of our test function.
           Once it terminates, all the other BSP nodes will also automatically terminate.
*/





#include <dlib/cmd_line_parser.h>
#include <dlib/bsp.h>
#include <dlib/matrix.h>

#include <iostream>

using namespace std;
using namespace dlib;

// ----------------------------------------------------------------------------------------

// These are the functions executed by the BSP nodes.  They are defined below.
void bsp_job_node_0      (bsp_context& bsp, double& min_value, double& optimal_x);
void bsp_job_other_nodes (bsp_context& bsp, long grid_resolution);

// ----------------------------------------------------------------------------------------

int main(int argc, char** argv)
{
    try
    {
        // Use the dlib command_line_parser to parse the command line.  See the
        // compress_stream_ex.cpp example program for an introduction to the command line
        // parser.
        command_line_parser parser;
        parser.add_option("h","Display this help message.");
        parser.add_option("l","Run as a listening BSP node.",1);
        parser.parse(argc, argv);
        parser.check_option_arg_range("l", 1, 65535);


        // Print a help message if the user gives -h on the command line.
        if (parser.option("h"))
        {
            // display all the command line options
            cout << "Usage: bsp_ex (-l port | <list of hosts>)\n";
            parser.print_options(); 
            return 0;
        }


        // If the command line contained -l 
        if (parser.option("l"))
        {
            // Get the argument to -l
            const unsigned short listening_port = get_option(parser, "l", 0);
            cout << "Listening on port " << listening_port << endl;

            const long grid_resolution = 100;

            // bsp_listen() starts a listening BSP job.  This means that it will wait until
            // someone calls bsp_connect() and connects to it before it starts running.
            // However, once it starts it will call bsp_job_other_nodes() which will then
            // do all the real work.
            // 
            // The first argument is the port to listen on.  The second argument is the
            // function which it should run to do all the work.  The other arguments are
            // optional and allow you to pass values into the bsp_job_other_nodes()
            // routine.  In this case, we are passing the grid_resolution to
            // bsp_job_other_nodes().
            bsp_listen(listening_port, bsp_job_other_nodes, grid_resolution);
        }
        else
        {
            if (parser.number_of_arguments() == 0)
            {
                cout << "You must give some listening BSP nodes as arguments to this program!" << endl;
                return 0;
            }

            // Take the hostname:port strings from the command line and put them into the
            // vector of hosts.
            std::vector<network_address> hosts;
            for (unsigned long i = 0; i < parser.number_of_arguments(); ++i)
                hosts.push_back(parser[i]);

            double min_value, optimal_x;

            // Calling bsp_connect() does two things.  First, it tells all the BSP jobs
            // listed in the hosts vector to start running.  Second, it starts a locally
            // running BSP job that executes bsp_job_node_0() and passes it any arguments
            // listed after bsp_job_node_0.  So in this case it passes it the 3rd and 4th
            // arguments.  
            // 
            // Note also that we use dlib::ref() which causes these arguments to be passed
            // by reference.  This means that bsp_job_node_0() will be able to modify them
            // and we will see the results here in main() after bsp_connect() terminates.
            bsp_connect(hosts, bsp_job_node_0, dlib::ref(min_value), dlib::ref(optimal_x));

            // bsp_connect() and bsp_listen() block until all the BSP nodes have terminated.
            // Therefore, we won't get to this part of the code until the BSP processing
            // has finished.  But once we do we can print the results like so:
            cout << "optimal_x: "<< optimal_x << endl;
            cout << "min_value: "<< min_value << endl;
        }

    }
    catch (std::exception& e)
    {
        cout << "error in main(): " << e.what() << endl;
    }
}

// ----------------------------------------------------------------------------------------

/*
    We are going to use the BSP tools to find the minimum of f(x).  Note that
    it's minimizer is at x == 2.0.
*/
double f (double x)
{
    return std::pow(x-2.0, 2.0);
}

// ----------------------------------------------------------------------------------------

void bsp_job_node_0 (bsp_context& bsp, double& min_value, double& optimal_x)
{
    // This function is called by bsp_connect().  In general, any BSP node can do anything
    // you want.  However, in this example we use this node as a kind of controller for the
    // other nodes.  In particular, since we are doing a nested grid search, this node's
    // job will be to collect results from other nodes and then decide which part of the
    // number line subsequent iterations should focus on.  
    // 
    // Also, each BSP node has a node ID number.  You can determine it by calling
    // bsp.node_id().  However, the node spawned by a call to bsp_connect() always has a
    // node ID of 0 (hence the name of this function).  Additionally, all functions
    // executing a BSP task always take a bsp_context as their first argument.  This object
    // is the interface that allows BSP jobs to communicate with each other. 


    // Now let's get down to work.  Recall that we are trying to find the x value that
    // minimizes the f(x) defined above.  The grid search will start out by considering the
    // range [-1e100, 1e100] on the number line.  It will progressively narrow this window
    // until it has located the minimizer of f(x) to within 1e-15 of its true value.
    double left = -1e100;
    double right = 1e100;

    min_value = std::numeric_limits<double>::infinity();
    double interval_width = std::abs(right-left);

    // keep going until the window is smaller than 1e-15.
    while (right-left > 1e-15)
    {
        // At the start of each loop, we broadcast the current window to all the other BSP
        // nodes.  They will each search a separate part of the window and then report back
        // the smallest values they found in their respective sub-windows.  
        // 
        // Also, you can send/broadcast/receive anything that has global serialize() and
        // deserialize() routines defined for it.  Dlib comes with serialization functions
        // for a lot of types by default, so we don't have to define anything for this
        // example program.  However, if you want to send an object you defined then you
        // will need to write your own serialization functions.  See the documentation for
        // dlib's serialize() routine or the bridge_ex.cpp example program for an example.  
        bsp.broadcast(left);
        bsp.broadcast(right);

        // Receive the smallest values found from the other BSP nodes.
        for (unsigned int k = 1; k < bsp.number_of_nodes(); ++k)
        {
            // The other nodes will send std::pairs of x/f(x) values.  So that is what we
            // receive.
            std::pair<double,double> val;
            bsp.receive(val);
            // save the smallest result.
            if (val.second < min_value)
            {
                min_value = val.second;
                optimal_x = val.first;
            }
        }

        // Now narrow the search window by half.  
        interval_width *= 0.5;
        left  = optimal_x - interval_width/2;
        right = optimal_x + interval_width/2;
    }
}

// ----------------------------------------------------------------------------------------

void bsp_job_other_nodes (bsp_context& bsp, long grid_resolution)
{
    // This is the BSP job called by bsp_listen().  In these jobs we will receive window
    // ranges from the controller node, search our sub-window, and then report back the
    // location of the best x value we found.

    double left, right;

    // The try_receive() function will either return true with the next message or return
    // false if there aren't any more messages in flight between nodes and all other BSP
    // nodes are blocked on calls to receive or have terminated.  That is, try_receive()
    // only returns false if waiting for a message would result in all the BSP nodes
    // waiting forever.  
    // 
    // Therefore, try_receive() serves both as a message receiving tool as well as an
    // implicit form of barrier synchronization.  In this case, we use it to know when to
    // terminate.  That is, we know it is time to terminate if all the messages between
    // nodes have been received and all nodes are inactive due to either termination or
    // being blocked on a receive call.  This will happen once the controller node above
    // terminates since it will result in all the other nodes inevitably becoming blocked
    // on this try_receive() line with no messages to process.  
    while (bsp.try_receive(left))
    {
        bsp.receive(right);

        // Compute a sub-window range for us to search.  We use our node's ID value and the
        // total number of nodes to select a subset of the [left, right] window.  We will
        // store the grid points from our sub-window in values_to_check.
        const double l = (bsp.node_id()-1)/(bsp.number_of_nodes()-1.0);
        const double r = bsp.node_id()    /(bsp.number_of_nodes()-1.0);
        const double width = right-left;
        // Select grid_resolution number of points which are linearly spaced throughout our
        // sub-window.
        const matrix<double> values_to_check = linspace(left+l*width, left+r*width, grid_resolution);

        // Search all the points in values_to_check and figure out which one gives the
        // minimum value of f().
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

        // Report back the identity of the best point we found in our sub-window.  Note
        // that the second argument to send(), the 0, is the node ID to send to.  In this
        // case we send our results back to the controller node.
        bsp.send(make_pair(best_x, best_val), 0);
    }
}

// ----------------------------------------------------------------------------------------

