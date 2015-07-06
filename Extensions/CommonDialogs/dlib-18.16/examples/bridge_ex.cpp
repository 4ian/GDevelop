// The contents of this file are in the public domain. See LICENSE_FOR_EXAMPLE_PROGRAMS.txt


/*
    This is an example showing how to use the bridge object from from the 
    dlib C++ Library to send messages via TCP/IP.

    In particular, this example will walk you through four progressively
    more complex use cases of the bridge object.  Note that this example
    program assumes you are already familiar with the pipe object and at
    least the contents of the pipe_ex_2.cpp example program.
*/


// =========== Example program output ===========
/*
     ---- Running example 1 ---- 
    dequeued value: 1
    dequeued value: 2
    dequeued value: 3

     ---- Running example 2 ---- 
    dequeued value: 1
    dequeued value: 2
    dequeued value: 3

     ---- Running example 3 ---- 
    dequeued int:    1
    dequeued int:    2
    dequeued struct: 3   some string

     ---- Running example 4 ---- 
    bridge 1 status: is_connected: true
    bridge 1 status: foreign_ip:   127.0.0.1
    bridge 1 status: foreign_port: 43156
    bridge 2 status: is_connected: true
    bridge 2 status: foreign_ip:   127.0.0.1
    bridge 2 status: foreign_port: 12345
    dequeued int:    1
    dequeued int:    2
    dequeued struct: 3   some string
    bridge 1 status: is_connected: false
    bridge 1 status: foreign_ip:   127.0.0.1
    bridge 1 status: foreign_port: 12345
*/


#include <dlib/bridge.h>
#include <dlib/type_safe_union.h>
#include <iostream>

using namespace dlib;
using namespace std;

// ----------------------------------------------------------------------------------------

void run_example_1();
void run_example_2();
void run_example_3();
void run_example_4();

// ----------------------------------------------------------------------------------------

int main()
{
    run_example_1();
    run_example_2();
    run_example_3();
    run_example_4();
}

// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------

void run_example_1(
)
{
    cout << "\n ---- Running example 1 ---- " << endl;

    /*
        The idea of the bridge is basically to allow two different dlib::pipe objects
        to be connected together via a TCP connection.  This is best illustrated by
        the following short example.  In it we create two pipes, in and out.  When
        an object is enqueued into the out pipe it will be automatically sent 
        through a TCP connection and once received at the other end it will be 
        inserted into the in pipe.
    */
    dlib::pipe<int> in(4), out(4);


    // This bridge will listen on port 12345 for an incoming TCP connection.  Then
    // it will read data from that connection and put it into the in pipe.
    bridge b2(listen_on_port(12345), receive(in));

    // This bridge will initiate a TCP connection and then start dequeuing 
    // objects from out and transmitting them over the connection.
    bridge b1(connect_to_ip_and_port("127.0.0.1", 12345), transmit(out));

    // As an aside, in a real program, each of these bridges and pipes would be in a 
    // separate application.  But to make this example self contained they are both 
    // right here.



    // Now let's put some things into the out pipe
    int value = 1;
    out.enqueue(value);

    value = 2;
    out.enqueue(value);

    value = 3;
    out.enqueue(value);


    // Now those 3 ints can be dequeued from the in pipe.  They will show up
    // in the same order they were inserted into the out pipe.
    in.dequeue(value);
    cout << "dequeued value: "<< value << endl;
    in.dequeue(value);
    cout << "dequeued value: "<< value << endl;
    in.dequeue(value);
    cout << "dequeued value: "<< value << endl;
}

// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------

void run_example_2(
)
{
    cout << "\n ---- Running example 2 ---- " << endl;

    /*
        This example makes a simple echo server on port 12345.  When an object
        is inserted into the out pipe it will be sent over a TCP connection, get 
        put into the echo pipe and then immediately read out of the echo pipe and
        sent back over the TCP connection where it will finally be placed into the in
        pipe.
    */

    dlib::pipe<int> in(4), out(4), echo(4);

    // Just like TCP connections, a bridge can send data both directions.  The directionality
    // of a pipe is indicated by the receive() and transmit() type decorations.  Also, the order
    // they are listed doesn't matter.
    bridge echo_bridge(listen_on_port(12345), receive(echo), transmit(echo));

    // Note that you can also specify the ip and port as a string by using connect_to().
    bridge b1(connect_to("127.0.0.1:12345"), transmit(out), receive(in));


    int value = 1;
    out.enqueue(value);

    value = 2;
    out.enqueue(value);

    value = 3;
    out.enqueue(value);


    in.dequeue(value);
    cout << "dequeued value: "<< value << endl;
    in.dequeue(value);
    cout << "dequeued value: "<< value << endl;
    in.dequeue(value);
    cout << "dequeued value: "<< value << endl;
}

// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------

struct my_example_object
{
    /*
        All objects passing through a dlib::bridge must be serializable.  This
        means there must exist global functions called serialize() and deserialize()
        which can convert an object into a bit stream and then reverse the process.

        This example object illustrates how this is done.
    */

    int value;
    std::string str;
};

void serialize (const my_example_object& item, std::ostream& out)
{
    /*
        serialize() just needs to write the state of item to the output stream.
        You can do this however you like.  Below, I'm using the serialize functions
        for int and std::string which come with dlib.  But again, you can do whatever
        you want here.
    */
    dlib::serialize(item.value, out);
    dlib::serialize(item.str, out);
}

void deserialize (my_example_object& item, std::istream& in)
{
    /*
        deserialize() is just the inverse of serialize().  Again, you can do
        whatever you want here so long as it correctly reconstructs item.  This
        also means that deserialize() must always consume as many bytes as serialize()
        generates.
    */
    dlib::deserialize(item.value, in);
    dlib::deserialize(item.str, in);
}

// ----------------------------------------------------------------------------------------

void run_example_3(
)
{
    cout << "\n ---- Running example 3 ---- " << endl;

    /*
        In this example we will just send ints and my_example_object objects
        over a TCP connection.  Since we are sending more than one type of
        object through a pipe we will need to use the type_safe_union.
    */

    typedef type_safe_union<int, my_example_object> tsu_type;

    dlib::pipe<tsu_type> in(4), out(4);

    // Note that we don't have to start the listening bridge first.  If b2
    // fails to make a connection it will just keep trying until successful.
    bridge b2(connect_to("127.0.0.1:12345"), receive(in));
    // We don't have to configure a bridge in it's constructor.  If it's 
    // more convenient we can do so by calling reconfigure() instead.
    bridge b1;
    b1.reconfigure(listen_on_port(12345), transmit(out));

    tsu_type msg;

    msg = 1;
    out.enqueue(msg);

    msg = 2;
    out.enqueue(msg);

    msg.get<my_example_object>().value = 3;
    msg.get<my_example_object>().str = "some string";
    out.enqueue(msg);


    // dequeue the three objects we sent and print them on the screen.
    for (int i = 0; i < 3; ++i)
    {
        in.dequeue(msg);
        if (msg.contains<int>())
        {
            cout << "dequeued int:    "<< msg.get<int>() << endl;
        }
        else if (msg.contains<my_example_object>())
        {
            cout << "dequeued struct: "<< msg.get<my_example_object>().value << "   " 
                                       << msg.get<my_example_object>().str << endl;
        }
    }
}

// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------

void run_example_4(
)
{
    cout << "\n ---- Running example 4 ---- " << endl;

    /*
        This final example is the same as example 3 except we will also now be getting 
        status messages from the bridges.  These bridge_status messages tell us the 
        state of the TCP connection associated with a bridge.  Is it connected or not?  
        Who it is connected to?

        The way you get these status messages is by ensuring that your receive pipe is 
        capable of storing bridge_status objects.  If it is then the bridge will 
        automatically insert bridge_status messages into your receive pipe whenever 
        there is a status change. 

        There are only two kinds of status changes.  The establishment of a connection 
        or the closing of a connection.   Also, a connection which closes due to you 
        calling clear(), reconfigure(), or destructing a bridge does not generate a 
        status message since, in this case, you already know about it and just want 
        the bridge to destroy itself as quickly as possible.
    */


    typedef type_safe_union<int, my_example_object, bridge_status> tsu_type;

    dlib::pipe<tsu_type> in(4), out(4);
    dlib::pipe<bridge_status> b1_status(4);

    // setup both bridges to have receive pipes capable of holding bridge_status messages.
    bridge b1(listen_on_port(12345), transmit(out), receive(b1_status));
    // Note that we can also use a hostname with connect_to() instead of supplying an IP address.
    bridge b2(connect_to("localhost:12345"), receive(in));

    tsu_type msg;
    bridge_status bs;

    // Once a connection is established it will generate a status message from each bridge. 
    // Let's get those and print them.  
    b1_status.dequeue(bs);
    cout << "bridge 1 status: is_connected: " << boolalpha << bs.is_connected << endl;
    cout << "bridge 1 status: foreign_ip:   " << bs.foreign_ip << endl;
    cout << "bridge 1 status: foreign_port: " << bs.foreign_port << endl;

    in.dequeue(msg);
    bs = msg.get<bridge_status>();
    cout << "bridge 2 status: is_connected: " << bs.is_connected << endl;
    cout << "bridge 2 status: foreign_ip:   " << bs.foreign_ip << endl;
    cout << "bridge 2 status: foreign_port: " << bs.foreign_port << endl;



    msg = 1;
    out.enqueue(msg);

    msg = 2;
    out.enqueue(msg);

    msg.get<my_example_object>().value = 3;
    msg.get<my_example_object>().str = "some string";
    out.enqueue(msg);


    // Read the 3 things we sent over the connection.
    for (int i = 0; i < 3; ++i)
    {
        in.dequeue(msg);
        if (msg.contains<int>())
        {
            cout << "dequeued int:    "<< msg.get<int>() << endl;
        }
        else if (msg.contains<my_example_object>())
        {
            cout << "dequeued struct: "<< msg.get<my_example_object>().value << "   " 
                                       << msg.get<my_example_object>().str << endl;
        }
    }

    // cause bridge 1 to shutdown completely.  This will close the connection and
    // therefore bridge 2 will generate a status message indicating the connection
    // just closed.
    b1.clear();
    in.dequeue(msg);
    bs = msg.get<bridge_status>();
    cout << "bridge 1 status: is_connected: " << bs.is_connected << endl;
    cout << "bridge 1 status: foreign_ip:   " << bs.foreign_ip << endl;
    cout << "bridge 1 status: foreign_port: " << bs.foreign_port << endl;
}

// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------

