// The contents of this file are in the public domain. See LICENSE_FOR_EXAMPLE_PROGRAMS.txt
/*

    This is an example illustrating the use of the threaded_object 
    from the dlib C++ Library.


    This is a very simple example.  It creates a single thread that
    just prints messages to the screen.
*/


#include <iostream>
#include <dlib/threads.h>
#include <dlib/misc_api.h>  // for dlib::sleep

using namespace std;
using namespace dlib;

class my_object : public threaded_object
{
public:
    my_object()
    {
        // Start our thread going in the thread() function
        start();
    }

    ~my_object()
    {
        // Tell the thread() function to stop.  This will cause should_stop() to 
        // return true so the thread knows what to do.
        stop();

        // Wait for the thread to stop before letting this object destruct itself.
        // Also note, you are *required* to wait for the thread to end before 
        // letting this object destruct itself.
        wait();
    }

private:

    void thread()
    {
        // This is our thread.  It will loop until it is told that it should terminate.
        while (should_stop() == false)
        {
            cout << "hurray threads!" << endl;
            dlib::sleep(500);
        }
    }
};

int main()
{
    // Create an instance of our threaded object.   
    my_object t;

    dlib::sleep(4000);
    
    // Tell the threaded object to pause its thread.  This causes the
    // thread to block on its next call to should_stop().
    t.pause();

    dlib::sleep(3000);
    cout << "starting thread back up from paused state" << endl;

    // Tell the thread to unpause itself.  This causes should_stop() to unblock 
    // and to let the thread continue.
    t.start();

    dlib::sleep(4000);

    // Let the program end.  When t is destructed it will gracefully terminate your
    // thread because we have set the destructor up to do so.
}



