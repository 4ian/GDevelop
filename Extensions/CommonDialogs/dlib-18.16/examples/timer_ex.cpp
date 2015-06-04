// The contents of this file are in the public domain. See LICENSE_FOR_EXAMPLE_PROGRAMS.txt


/*
    This is an example illustrating the use of the timer object from the dlib C++ Library.

    The timer is an object that calls some user specified member function at regular
    intervals from another thread.
*/


#include <dlib/timer.h>
#include <dlib/misc_api.h> // for dlib::sleep
#include <iostream>

using namespace dlib;
using namespace std;

// ----------------------------------------------------------------------------------------

class timer_example
{
public:
    void action_function()
    {
        // print out a message so we can see that this function is being triggered
        cout << "action_function() called" << endl;
    }
};

// ----------------------------------------------------------------------------------------

int main()
{
    timer_example e;

    // Here we construct our timer object.  It needs two things.  The second argument is
    // the member function it is going to call at regular intervals and the first argument
    // is the object instance it will call that member function on.
    timer<timer_example> t(e, &timer_example::action_function);

    // Set the timer object to trigger every second
    t.set_delay_time(1000);

    // Start the timer.  It will start calling the action function 1 second from this call
    // to start.
    t.start();

    // Sleep for 10 seconds before letting the program end.  
    dlib::sleep(10000);

    // The timer will destruct itself properly and stop calling the action_function.
}

// ----------------------------------------------------------------------------------------

