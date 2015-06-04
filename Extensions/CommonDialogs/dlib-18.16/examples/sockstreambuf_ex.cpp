// The contents of this file are in the public domain. See LICENSE_FOR_EXAMPLE_PROGRAMS.txt
/*

    This is an example illustrating the use of the sockets and sockstreambuf
    components from the dlib C++ Library.  Note that there is also an
    iosockstream object in dlib that is often simpler to use, see
    iosockstream_ex.cpp for an example of its use.

    This program simply connects to www.google.com at port 80 and requests the
    main Google web page.  It then prints what it gets back from Google to the
    screen.


    For those of you curious about HTTP check out the excellent introduction at
    http://www.jmarshall.com/easy/http/
*/

#include <dlib/sockets.h>
#include <dlib/sockstreambuf.h>
#include <iostream>

using namespace std;
using namespace dlib;

int main()
{
    try
    {
        // Connect to Google's web server which listens on port 80.  If this
        // fails it will throw a dlib::socket_error exception.  Note that we
        // are using a smart pointer here to contain the connection pointer
        // returned from connect.  Doing this ensures that the connection
        // is deleted even if someone throws an exception somewhere in your code.
        scoped_ptr<connection> con(connect("www.google.com",80));


        {
            // Create a stream buffer for our connection
            sockstreambuf buf(con);
            // Now stick that stream buffer into an iostream object
            iostream stream(&buf);
            // This command causes the iostream to flush its output buffers
            // whenever someone makes a read request. 
            buf.flush_output_on_read();

            // Now we make the HTTP GET request for the main Google page.
            stream << "GET / HTTP/1.0\r\n\r\n";

            // Here we print each character we get back one at a time. 
            int ch = stream.get();
            while (ch != EOF)
            {
                cout << (char)ch;
                ch = stream.get();
            }

            // At the end of this scope buf will be destructed and flush 
            // anything it still contains to the connection.  Thus putting
            // this } here makes it safe to destroy the connection later on.
            // If we just destroyed the connection before buf was destructed
            // then buf might try to flush its data to a closed connection
            // which would be an error.
        }

        // Here we call close_gracefully().  It takes a connection and performs
        // a proper TCP shutdown by sending a FIN packet to the other end of the 
        // connection and waiting half a second for the other end to close the 
        // connection as well.  If half a second goes by without the other end 
        // responding then the connection is forcefully shutdown and deleted.  
        // 
        // You usually want to perform a graceful shutdown of your TCP connections 
        // because there might be some data you tried to send that is still buffered 
        // in the operating system's output buffers.  If you just killed the 
        // connection it might not be sent to the other side (although maybe 
        // you don't care, and in the case of this example it doesn't really matter.  
        // But I'm only putting this here for the purpose of illustration :-).  
        // In any case, this function is provided to allow you to perform a graceful 
        // close if you so choose.  
        // 
        // Also note that the timeout can be changed by suppling an optional argument 
        // to this function.
        close_gracefully(con);
    }
    catch (exception& e)
    {
        cout << e.what() << endl;
    }
}


