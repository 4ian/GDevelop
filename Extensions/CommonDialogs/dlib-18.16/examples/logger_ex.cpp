// The contents of this file are in the public domain. See LICENSE_FOR_EXAMPLE_PROGRAMS.txt

/*

    This is a simple example illustrating the use of the logger object from 
    the dlib C++ Library.


    The output of this program looks like this:

    0 INFO  [0] example: This is an informational message.
    0 DEBUG [0] example: The integer variable is set to 8
    0 WARN  [0] example: The variable is bigger than 4!  Its value is 8
    0 INFO  [0] example: we are going to sleep for half a second.
  503 INFO  [0] example: we just woke up
  503 INFO  [0] example: program ending

 
    The first column shows the number of milliseconds since program start at the time
    the message was printed, then the logging level of the message, then the thread that
    printed the message, then the logger's name and finally the message itself.  

*/


#include <dlib/logger.h>
#include <dlib/misc_api.h>

using namespace dlib;

// Create a logger object somewhere.  It is usually convenient to make it at the global scope
// which is what I am doing here.  The following statement creates a logger that is named example.
logger dlog("example");

int main()
{
    // Every logger has a logging level (given by dlog.level()).  Each log message is tagged with a
    // level and only levels equal to or higher than dlog.level() will be printed.  By default all 
    // loggers start with level() == LERROR.  In this case I'm going to set the lowest level LALL 
    // which means that dlog will print all logging messages it gets.
    dlog.set_level(LALL);


    // print our first message.  It will go to cout because that is the default.
    dlog << LINFO << "This is an informational message.";

    // now print a debug message.
    int variable = 8;
    dlog << LDEBUG << "The integer variable is set to " << variable;

    // the logger can be used pretty much like any ostream object.  But you have to give a logging
    // level first.  But after that you can chain << operators like normal.
    
    if (variable > 4)
        dlog << LWARN << "The variable is bigger than 4!  Its value is " << variable;



    dlog << LINFO << "we are going to sleep for half a second.";
    // sleep for half a second
    dlib::sleep(500);
    dlog << LINFO << "we just woke up";



    dlog << LINFO << "program ending";
}



