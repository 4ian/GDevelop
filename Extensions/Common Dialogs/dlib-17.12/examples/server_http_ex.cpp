/*

    This example illustrates the use of the HTTP extension to the server object 
    from the dlib C++ Library.
    It creates a server that always responds with a simple HTML form.

    To view the page this program displays you should go to http://localhost:5000

*/

#include <iostream>
#include <sstream>
#include <string>
#include "dlib/server.h"

using namespace dlib;
using namespace std;

class web_server : public server::http_1a_c
{
    void on_request (
        const std::string& path,
        std::string& result,
        const map_type& queries,
        const map_type& cookies,
        queue_type& new_cookies,
        const map_type& incoming_headers,
        map_type& response_headers,
        const std::string& foreign_ip,
        const std::string& local_ip,
        unsigned short foreign_port,
        unsigned short local_port
    )
    {
        try
        {
            ostringstream sout;
            // We are going to send back a page that contains an HTML form with two text input fields.
            // One field called name.  The HTML form uses the post method but could also use the get
            // method (just change method='post' to method='get').
            sout << " <html> <body> "
                << "<form action='/form_handler' method='post'> "
                << "User Name: <input name='user' type='text'><br>  "
                << "User password: <input name='pass' type='text'> <input type='submit'> "
                << " </form>"; 

            sout << "<br>  path = "         << path << endl;
            sout << "<br>  foreign_ip = "   << foreign_ip << endl;
            sout << "<br>  foreign_port = " << foreign_port << endl;
            sout << "<br>  local_ip = "     << local_ip << endl;
            sout << "<br>  local_port = "   << local_port << endl;


            // If this request is the result of the user submitting the form then echo back
            // the submission.
            if (path == "/form_handler")
            {
                sout << "<h2> Stuff from the query string </h2>" << endl;
                sout << "<br>  user = " << queries["user"] << endl;
                sout << "<br>  pass = " << queries["pass"] << endl;

                // save these form submissions as cookies.  
                string cookie;
                cookie = "user=" + queries["user"]; 
                new_cookies.enqueue(cookie);
                cookie = "pass=" + queries["pass"]; 
                new_cookies.enqueue(cookie);
            }


            // Echo any cookies back to the client browser 
            sout << "<h2>Cookies we got back from the server</h2>";
            cookies.reset();
            while (cookies.move_next())
            {
                sout << "<br/>" << cookies.element().key() << " = " << cookies.element().value() << endl;
            }

            sout << "<br/><br/>";

            sout << "<h2>HTTP Headers we sent to the server</h2>";
            // Echo out all the HTTP headers we received from the client web browser
            incoming_headers.reset();
            while (incoming_headers.move_next())
            {
                sout << "<br/>" << incoming_headers.element().key() << ": " << incoming_headers.element().value() << endl;
            }


            sout << "</body> </html>";

            result = sout.str();
        }
        catch (exception& e)
        {
            cout << e.what() << endl;
        }
    }

};

// create an instance of our web server
web_server our_web_server;

void thread()
{
    cout << "Press enter to end this program" << endl;
    cin.get();
    // this will cause the server to shut down which will in turn cause 
    // our_web_server.start() to unblock and thus the main() function will terminate.
    our_web_server.clear();
}

int main()
{
    try
    {
        // create a thread that will listen for the user to end this program
        thread_function t(thread);

        // make it listen on port 5000
        our_web_server.set_listening_port(5000);
        our_web_server.start();
    }
    catch (exception& e)
    {
        cout << e.what() << endl;
    }
}

