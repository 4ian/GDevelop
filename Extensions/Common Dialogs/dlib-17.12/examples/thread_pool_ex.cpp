/*

    This is an example illustrating the use of the thread_pool 
    object from the dlib C++ Library.


    This is a very simple example.  It creates a thread pool with 3
    threads and then sends a few simple tasks to the pool.
*/


#include "dlib/threads.h"
#include "dlib/misc_api.h"  // for dlib::sleep
#include "dlib/logger.h"

using namespace dlib;


// Here we make an instance of the thread pool object
thread_pool tp(3);


// We will be using the dlib logger object to print out messages in this example
// because its output is timestamped and labeled with the thread that the log
// message came from.  So this will make it easier to see what is going on in 
// this example.  Here we make an instance of the logger.  See the logger 
// documentation and examples for detailed information regarding its use.
logger dlog("main");

// ----------------------------------------------------------------------------------------

class test
{
    /*
        The thread_pool accepts "tasks" from the user and schedules them
        for execution in one of its threads when one becomes available.  Each
        task is just a request to call a member function on a particular object.
        So here we create a class called test with a few member functions which
        we will have the thread pool call as tasks.
    */
public:

    void task_0()
    {
        dlog << LINFO << "task_0 start";

        // Here we ask the thread pool to call this->subtask() three different times
        // with different arguments.  Note that calls to add_task() will return 
        // immediately if there is an available thread to hand the task off to, however,
        // if there isn't a thread ready then add_task blocks until there is such a thread.
        // Also note that since task_0() is executed within the thread pool (see main() below)
        // calls to add_task() will execute the requested task within the calling thread
        // in cases where the thread pool is full.  This means it is safe to have
        // tasks running in the thread pool spawn sub tasks which is what we are doing here.
        tp.add_task(*this,&test::subtask,1); // schedule call to this->subtask(1) 
        tp.add_task(*this,&test::subtask,2); // schedule call to this->subtask(2) 
        tp.add_task(*this,&test::subtask,3); // schedule call to this->subtask(3) 

        // wait_for_all_tasks() is a function that blocks until all tasks
        // submitted to the thread pool by the thread calling wait_for_all_tasks()
        // finish.  So this call blocks until the 3 tasks above are done.  
        tp.wait_for_all_tasks();

        dlog << LINFO << "task_0 end" ;
    }

    void subtask(long a)
    {
        dlib::sleep(200);
        dlog << LINFO << "subtask end " << a;
    }

    void task_1(long a, long b)
    {
        dlog << LINFO << "task_1 start: " << a << ", " << b;
        dlib::sleep(700);
        dlog << LINFO << "task_1 end: " << a << ", " << b;
    }

};

// ----------------------------------------------------------------------------------------

int main()
{
    // tell the logger to print out everything
    dlog.set_level(LALL);

    test a;

    dlog << LINFO << "schedule a few tasks";

    // schedule a call to a.task_1(10,11)
    tp.add_task(a, &test::task_1, 10, 11);

    // schedule the thread pool to call a.task_0().  
    uint64 id = tp.add_task(a, &test::task_0);

    // schedule a call to a.task_1(12,13)
    tp.add_task(a, &test::task_1, 12, 13);

    dlog << LINFO << "wait for a.task_0() to finish";
    // now wait for our a.task_0() task to finish.  To do this we use the id
    // returned by add_task to reference the task we want to wait for.
    tp.wait_for_task(id);
    dlog << LINFO << "a.task_0() finished, now start another task_1() call";

    // schedule a call to a.task_1(14,15)
    tp.add_task(a, &test::task_1, 14, 15);

    dlog << LINFO << "wait for all tasks to finish";
    // here we wait for all tasks which were requested by the main thread
    // to complete.
    tp.wait_for_all_tasks();
    dlog << LINFO << "all tasks finished";


    /* A possible run of this program might produce the following output (the first column is 
       the time the log message occurred and the value in [] is the thread id for the thread
       that generated the log message):

    0 INFO  [0] main: schedule a few tasks
    0 INFO  [1] main: task_1 start: 10, 11
    0 INFO  [2] main: task_0 start
  200 INFO  [2] main: subtask end 2
  200 INFO  [3] main: subtask end 1
  200 INFO  [3] main: task_1 start: 12, 13
  201 INFO  [0] main: wait for a.task_0() to finish
  400 INFO  [2] main: subtask end 3
  400 INFO  [2] main: task_0 end
  400 INFO  [0] main: a.task_0() finished, now start another task_1() call
  401 INFO  [2] main: task_1 start: 14, 15
  401 INFO  [0] main: wait for all tasks to finish
  700 INFO  [1] main: task_1 end: 10, 11
  901 INFO  [3] main: task_1 end: 12, 13
 1101 INFO  [2] main: task_1 end: 14, 15
 1101 INFO  [0] main: all tasks finished

    */
}





