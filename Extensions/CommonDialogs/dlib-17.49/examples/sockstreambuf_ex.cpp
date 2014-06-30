// The contents of this file are in the public domain. See LICENSE_FOR_EXAMPLE_PROGRAMS.txt
/*

    This is an example illustrating the use of the sockets,
    server and sockstreambuf components from the dlib C++ Library.

    This is a simple echo server.  It listens on port 1234 for incoming
    connections and just echos back any text it receives but in upper case.  
    So basically it is the same as the other sockets example except it 
    uses stream buffers.

    To test it out you can just open a command prompt and type:
    telnet localhost 1234

    Then you can type away.


    Also note that a good reference on the standard C++ iostream library can be 
    found at http://www.cplusplus.com/ref/iostream/
*/




#include "dlib/sockets.h"
#include "dlib/server.h"
#include "dlib/sockstreambuf.h"
#include <iostream>

using namespace dlib;
using namespace std;



class serv : public server
{

    void on_connect  (
        connection& con
    )
    {
        // create a sockstreambuf that reads/writes on our connection.  I'm using the
        // kernel_2a version here because it is generally the faster of the two versions in the
        // library.
        sockstreambuf::kernel_2a buf(&con);

        // Now we make an iostream object that reads/writes to our streambuffer.  A lot of people
        // don't seem to know that the C++ iostreams are as powerful as they are.  So what I'm doing
        // here isn't anything special and is totally portable.  You will be able to use this stream
        // object just as you would any iostream from the standard library.
        iostream stream(&buf);

        // This command causes our stream to flush its output buffers whenever you ask it for more 
        // data.  
        stream.tie(&stream);

        char ch;
        // Loop until we hit the end of the stream.  This happens when the connection terminates.
        while (stream.peek() != EOF)
        {
            // get the next character from the client
            ch = stream.get();

            // now echo it back to them
            stream << (char)toupper(ch);
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


