// The contents of this file are in the public domain. See LICENSE_FOR_EXAMPLE_PROGRAMS.txt
/*

    This is an example illustrating the use of the server_iostream object from
    the dlib C++ Library.

    This is a simple echo server.  It listens on port 1234 for incoming
    connections and just echos back any text it receives, but in upper case.  So
    basically it is the same as the sockets_ex.cpp example program  except it
    uses iostreams. 

    To test it out you can just open a command prompt and type:
    telnet localhost 1234

    Then you can type away.

*/




#include <dlib/server.h>
#include <iostream>

using namespace dlib;
using namespace std;



class serv : public server_iostream
{

    void on_connect  (
        std::istream& in,
        std::ostream& out,
        const std::string& foreign_ip,
        const std::string& local_ip,
        unsigned short foreign_port,
        unsigned short local_port,
        uint64 connection_id
    )
    {
        // The details of the connection are contained in the last few arguments to
        // on_connect().  For more information, see the documentation for the
        // server_iostream.  However, the main arguments of interest are the two streams.
        // Here we also print the IP address of the remote machine.
        cout << "Got a connection from " << foreign_ip << endl;

        // Loop until we hit the end of the stream.  This happens when the connection
        // terminates.
        while (in.peek() != EOF)
        {
            // get the next character from the client
            char ch = in.get();

            // now echo it back to them
            out << (char)toupper(ch);
        }
    }

};


int main()
{
    try
    {
        serv our_server;

        // set up the server object we have made
        our_server.set_listening_port(1234);
        // Tell the server to begin accepting connections.
        our_server.start_async();

        cout << "Press enter to end this program" << endl;
        cin.get();
    }
    catch (exception& e)
    {
        cout << e.what() << endl;
    }
}


