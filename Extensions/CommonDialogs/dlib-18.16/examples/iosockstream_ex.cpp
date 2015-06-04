// The contents of this file are in the public domain. See LICENSE_FOR_EXAMPLE_PROGRAMS.txt
/*

    This is an example illustrating the use of the iosockstream object from the
    dlib C++ Library.

    This program simply connects to www.google.com at port 80 and requests the
    main Google web page.  It then prints what it gets back from Google to the
    screen.


    For those of you curious about HTTP check out the excellent introduction at
    http://www.jmarshall.com/easy/http/
*/

#include <dlib/iosockstream.h>
#include <iostream>

using namespace std;
using namespace dlib;

int main()
{
    try
    {
        // Connect to Google's web server which listens on port 80.  If this
        // fails it will throw a dlib::socket_error exception.  
        iosockstream stream("www.google.com:80");

        // At this point, we can use stream the same way we would use any other
        // C++ iostream object.  So to test it out, let's make a HTTP GET request
        // for the main Google page.
        stream << "GET / HTTP/1.0\r\n\r\n";

        // Here we print each character we get back one at a time. 
        while (stream.peek() != EOF)
        {
            cout << (char)stream.get();
        }
    }
    catch (exception& e)
    {
        cout << e.what() << endl;
    }
}


