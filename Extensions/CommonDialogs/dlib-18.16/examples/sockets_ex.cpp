// The contents of this file are in the public domain. See LICENSE_FOR_EXAMPLE_PROGRAMS.txt
/*

    This is an example illustrating the use of the sockets and
    server components from the dlib C++ Library.

    This is a simple echo server.  It listens on port 1234 for incoming
    connections and just echos back any data it receives.  

*/




#include <dlib/sockets.h>
#include <dlib/server.h>
#include <iostream>

using namespace dlib;
using namespace std;



class serv : public server
{
    void on_connect  (
        connection& con
    )
    {
        char ch;
        while (con.read(&ch,1) > 0)
        {
            // we are just reading one char at a time and writing it back
            // to the connection.  If there is some problem writing the char
            // then we quit the loop.  
            if (con.write(&ch,1) != 1)
                break;
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

