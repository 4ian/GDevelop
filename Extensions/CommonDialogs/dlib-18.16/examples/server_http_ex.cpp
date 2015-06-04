// The contents of this file are in the public domain. See LICENSE_FOR_EXAMPLE_PROGRAMS.txt
/*

    This example illustrates the use of the HTTP extension to the server object 
    from the dlib C++ Library.
    It creates a server that always responds with a simple HTML form.

    To view the page this program displays you should go to http://localhost:5000

*/

#include <iostream>
#include <sstream>
#include <string>
#include <dlib/server.h>

using namespace dlib;
using namespace std;

class web_server : public server_http
{
    const std::string on_request ( 
        const incoming_things& incoming,
        outgoing_things& outgoing
    )
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

        // Write out some of the inputs to this request so that they show up on the
        // resulting web page.
        sout << "<br>  path = "         << incoming.path << endl;
        sout << "<br>  request_type = " << incoming.request_type << endl;
        sout << "<br>  content_type = " << incoming.content_type << endl;
        sout << "<br>  protocol = "     << incoming.protocol << endl;
        sout << "<br>  foreign_ip = "   << incoming.foreign_ip << endl;
        sout << "<br>  foreign_port = " << incoming.foreign_port << endl;
        sout << "<br>  local_ip = "     << incoming.local_ip << endl;
        sout << "<br>  local_port = "   << incoming.local_port << endl;
        sout << "<br>  body = \""       << incoming.body << "\"" << endl;


        // If this request is the result of the user submitting the form then echo back
        // the submission.
        if (incoming.path == "/form_handler")
        {
            sout << "<h2> Stuff from the query string </h2>" << endl;
            sout << "<br>  user = " << incoming.queries["user"] << endl;
            sout << "<br>  pass = " << incoming.queries["pass"] << endl;

            // save these form submissions as cookies.  
            outgoing.cookies["user"] = incoming.queries["user"];
            outgoing.cookies["pass"] = incoming.queries["pass"];
        }


        // Echo any cookies back to the client browser 
        sout << "<h2>Cookies the web browser sent to the server</h2>";
        for ( key_value_map::const_iterator ci = incoming.cookies.begin(); ci != incoming.cookies.end(); ++ci )
        {
            sout << "<br/>" << ci->first << " = " << ci->second << endl;
        }

        sout << "<br/><br/>";

        sout << "<h2>HTTP Headers the web browser sent to the server</h2>";
        // Echo out all the HTTP headers we received from the client web browser
        for ( key_value_map_ci::const_iterator ci = incoming.headers.begin(); ci != incoming.headers.end(); ++ci )
        {
            sout << "<br/>" << ci->first << ": " << ci->second << endl;
        }

        sout << "</body> </html>";

        return sout.str();
    }

};

int main()
{
    try
    {
        // create an instance of our web server
        web_server our_web_server;

        // make it listen on port 5000
        our_web_server.set_listening_port(5000);
        // Tell the server to begin accepting connections.
        our_web_server.start_async();

        cout << "Press enter to end this program" << endl;
        cin.get();
    }
    catch (exception& e)
    {
        cout << e.what() << endl;
    }
}


