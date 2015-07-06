// The contents of this file are in the public domain. See LICENSE_FOR_EXAMPLE_PROGRAMS.txt

/*

    This is a somewhat complex example illustrating the use of the logger object 
    from the dlib C++ Library.  It will demonstrate using multiple loggers and threads.  


    The output of this program looks like this:
    0 INFO  [0] example: This is an informational message.
    0 WARN  [0] example: The variable is bigger than 4!  Its value is 8
    0 INFO  [0] example: make two threads
    0 WARN  [0] example.test_class: warning!  someone called warning()!
    0 INFO  [0] example: we are going to sleep for half a second.
    0 INFO  [1] example.thread: entering our thread
    0 WARN  [1] example.test_class: warning!  someone called warning()!
    0 INFO  [2] example.thread: entering our thread
    0 WARN  [2] example.test_class: warning!  someone called warning()!
  203 INFO  [1] example.thread: exiting our thread
  203 INFO  [2] example.thread: exiting our thread
  503 INFO  [0] example: we just woke up
  503 INFO  [0] example: program ending


*/


#include <dlib/logger.h>
#include <dlib/misc_api.h>
#include <dlib/threads.h>

using namespace dlib;

/*
    Here we create three loggers.  Note that it is the case that:
        - logp.is_child_of(logp) == true
        - logt.is_child_of(logp) == true
        - logc.is_child_of(logp) == true

    logp is the child of itself because all loggers are their own children :)  But the other
    two are child loggers of logp because their names start with logp.name() + "." which means
    that whenever you set a property on a logger it will also set that same property on all of
    the logger's children.
*/
logger logp("example");
logger logt("example.thread");
logger logc("example.test_class");

class test
{
public:
    test ()
    {
        // this message won't get logged because LINFO is too low
        logc << LINFO << "constructed a test object";
    }

    ~test ()
    {
        // this message won't get logged because LINFO is too low
        logc << LINFO << "destructed a test object";
    }

    void warning ()
    {
        logc << LWARN << "warning!  someone called warning()!";
    }
};

void thread (void*)
{
    logt << LINFO << "entering our thread";

    
    test mytest;
    mytest.warning();

    dlib::sleep(200);

    logt << LINFO << "exiting our thread";
}


void setup_loggers (
)
{
    // Create a logger that has the same name as our root logger logp.  This isn't very useful in 
    // this example program but if you had loggers defined in other files then you might not have
    // easy access to them when starting up your program and setting log levels.  This mechanism
    // allows you to manipulate the properties of any logger so long as you know its name.
    logger temp_log("example");

    // For this example I don't want to log debug messages so I'm setting the logging level of 
    // All our loggers to LINFO.  Note that this statement sets all three of our loggers to this
    // logging level because they are all children of temp_log.   
    temp_log.set_level(LINFO);


    // In addition I only want the example.test_class to print LWARN or higher messages so I'm going
    // to set that here too.  Note that we set this value after calling temp_log.set_level(). If we 
    // did it the other way around the set_level() call on temp_log would set logc_temp.level() and 
    // logc.level() back to LINFO since temp_log is a parent of logc_temp.
    logger logc_temp("example.test_class");
    logc_temp.set_level(LWARN);


    // Finally, note that you can also configure your loggers from a text config file.  
    // See the documentation for the configure_loggers_from_file() function for details.
}

int main()
{
    setup_loggers();

    // print our first message.  It will go to cout because that is the default.
    logp << LINFO << "This is an informational message.";

    int variable = 8;

    // Here is a debug message.  It won't print though because its log level is too low (it is below LINFO).
    logp << LDEBUG << "The integer variable is set to " << variable;

    
    if (variable > 4)
        logp << LWARN << "The variable is bigger than 4!  Its value is " << variable;

    logp << LINFO << "make two threads";
    create_new_thread(thread,0);
    create_new_thread(thread,0);

    test mytest;
    mytest.warning();

    logp << LINFO << "we are going to sleep for half a second.";
    // sleep for half a second
    dlib::sleep(500);
    logp << LINFO << "we just woke up";



    logp << LINFO << "program ending";


    // It is also worth pointing out that the logger messages are atomic.  This means, for example, that
    // in the above log statements that involve a string literal and a variable, no other thread can
    // come in and print a log message in-between the literal string and the variable.  This is good
    // because it means your messages don't get corrupted.  However, this also means that you shouldn't 
    // make any function calls inside a logging statement if those calls might try to log a message 
    // themselves since the atomic nature of the logger would cause your application to deadlock.
}



