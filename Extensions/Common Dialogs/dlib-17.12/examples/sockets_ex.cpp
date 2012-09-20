/*

    This is an example illustrating the use of the sockets and
    server components from the dlib C++ Library.

    This is a simple echo server.  It listens on port 1234 for incoming
    connections and just echos back any data it receives.  

*/




#include "dlib/sockets.h"
#include "dlib/server.h"
#include <iostream>

using namespace dlib;
using namespace std;



class serv : public server::kernel_1a_c
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

serv our_server;

void thread()
{
    cout << "Press enter to end this program" << endl;
    cin.get();
    // this will cause the server to shut down which will in turn cause 
    // our_server.start() to unblock and thus the main() function will terminate.
    our_server.clear();
}



int main()
{
    try
    {
        // create a thread that will listen for the user to end this program
        thread_function t(thread);


        // set up the server object we have made
        our_server.set_listening_port(1234);
        our_server.set_max_connections(1000);

        // start the server
        our_server.start();

    }
    catch (exception& e)
    {
        cout << e.what() << endl;
    }
    catch (...)
    {
        cout << "Some error occurred" << endl;
    }
}








