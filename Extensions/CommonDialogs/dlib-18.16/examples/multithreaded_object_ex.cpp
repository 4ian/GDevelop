// The contents of this file are in the public domain. See LICENSE_FOR_EXAMPLE_PROGRAMS.txt
/*

    This is an example illustrating the use of the multithreaded_object.

    This is a very simple example.  It creates 3 threads that
    just print messages to the screen.



    Example program output:
    0 INFO  [1] mto: thread1(): hurray threads!
    0 INFO  [2] mto: thread2(): hurray threads!
    0 INFO  [3] mto: thread2(): hurray threads!
  700 INFO  [1] mto: thread1(): hurray threads!
  800 INFO  [2] mto: thread2(): hurray threads!
  801 INFO  [3] mto: thread2(): hurray threads!
 1400 INFO  [1] mto: thread1(): hurray threads!
 1604 INFO  [2] mto: thread2(): hurray threads!
 1605 INFO  [3] mto: thread2(): hurray threads!
 2100 INFO  [1] mto: thread1(): hurray threads!
 2409 INFO  [2] mto: thread2(): hurray threads!
 2409 INFO  [3] mto: thread2(): hurray threads!
 2801 INFO  [1] mto: thread1(): hurray threads!
 3001 INFO  [0] mto: paused threads
 6001 INFO  [0] mto: starting threads back up from paused state
 6001 INFO  [2] mto: thread2(): hurray threads!
 6001 INFO  [1] mto: thread1(): hurray threads!
 6001 INFO  [3] mto: thread2(): hurray threads!
 6705 INFO  [1] mto: thread1(): hurray threads!
 6805 INFO  [2] mto: thread2(): hurray threads!
 6805 INFO  [3] mto: thread2(): hurray threads!
 7405 INFO  [1] mto: thread1(): hurray threads!
 7609 INFO  [2] mto: thread2(): hurray threads!
 7609 INFO  [3] mto: thread2(): hurray threads!
 8105 INFO  [1] mto: thread1(): hurray threads!
 8413 INFO  [2] mto: thread2(): hurray threads!
 8413 INFO  [3] mto: thread2(): hurray threads!
 8805 INFO  [1] mto: thread1(): hurray threads!

  The first column is the number of milliseconds since program start, the second
  column is the logging level, the third column is the thread id, and the rest
  is the log message.
*/


#include <iostream>
#include <dlib/threads.h>
#include <dlib/misc_api.h>  // for dlib::sleep
#include <dlib/logger.h>

using namespace std;
using namespace dlib;

logger dlog("mto");

class my_object : public multithreaded_object
{
public:
    my_object()
    {
        // register which functions we want to run as threads.  We want one thread running
        // thread1() and two threads to run thread2().  So we will have a total of 3 threads
        // running.
        register_thread(*this,&my_object::thread1);
        register_thread(*this,&my_object::thread2);
        register_thread(*this,&my_object::thread2);

        // start all our registered threads going by calling the start() function
        start();
    }

    ~my_object()
    {
        // Tell the thread() function to stop.  This will cause should_stop() to 
        // return true so the thread knows what to do.
        stop();

        // Wait for the threads to stop before letting this object destruct itself.
        // Also note, you are *required* to wait for the threads to end before 
        // letting this object destruct itself.
        wait();
    }

private:

    void thread1()
    {
        // This is a thread.  It will loop until it is told that it should terminate.
        while (should_stop() == false)
        {
            dlog << LINFO << "thread1(): hurray threads!";
            dlib::sleep(700);
        }
    }

    void thread2()
    {
        // This is a thread.  It will loop until it is told that it should terminate.
        while (should_stop() == false)
        {
            dlog << LINFO << "thread2(): hurray threads!";
            dlib::sleep(800);
        }
    }

};

int main()
{
    // tell the logger to output all messages
    dlog.set_level(LALL);

    // Create an instance of our multi-threaded object.   
    my_object t;

    dlib::sleep(3000);
    
    // Tell the multi-threaded object to pause its threads.  This causes the
    // threads to block on their next calls to should_stop().
    t.pause();
    dlog << LINFO << "paused threads";

    dlib::sleep(3000);
    dlog << LINFO << "starting threads back up from paused state";

    // Tell the threads to unpause themselves.  This causes should_stop() to unblock 
    // and to let the threads continue.
    t.start();

    dlib::sleep(3000);

    // Let the program end.  When t is destructed it will gracefully terminate your
    // threads because we have set the destructor up to do so.
}



