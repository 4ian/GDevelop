// The contents of this file are in the public domain. See LICENSE_FOR_EXAMPLE_PROGRAMS.txt
/*

    This is an example illustrating the use of the thread_pool 
    object from the dlib C++ Library.


    This is a very simple example.  It creates a thread pool with 3
    threads and then sends a few simple tasks to the pool.
*/


#include <dlib/threads.h>
#include <dlib/misc_api.h>  // for dlib::sleep
#include <dlib/logger.h>
#include <vector>

using namespace dlib;

// We will be using the dlib logger object to print out messages in this example
// because its output is timestamped and labeled with the thread that the log
// message came from.  So this will make it easier to see what is going on in 
// this example.  Here we make an instance of the logger.  See the logger 
// documentation and examples for detailed information regarding its use.
logger dlog("main");


// Here we make an instance of the thread pool object
thread_pool tp(3);


// ----------------------------------------------------------------------------------------

class test
{
    /*
        The thread_pool accepts "tasks" from the user and schedules them for 
        execution in one of its threads when one becomes available.  Each task 
        is just a request to call a function.  So here we create a class called 
        test with a few member functions which we will have the thread pool call 
        as tasks.
    */
public:

    void task()
    {
        dlog << LINFO << "task start";

        future<int> var;

        var = 1;

        // Here we ask the thread pool to call this->subtask() and this->subtask2().
        // Note that calls to add_task() will return immediately if there is an 
        // available thread to hand the task off to.  However, if there isn't a 
        // thread ready then add_task() blocks until there is such a thread.
        // Also note that since task() is executed within the thread pool (see main() below)
        // calls to add_task() will execute the requested task within the calling thread
        // in cases where the thread pool is full.  This means it is always safe to 
        // spawn subtasks from within another task, which is what we are doing here.
        tp.add_task(*this,&test::subtask,var); // schedule call to this->subtask(var) 
        tp.add_task(*this,&test::subtask2);    // schedule call to this->subtask2() 

        // Since var is a future, this line will wait for the test::subtask task to 
        // finish before allowing us to access the contents of var.  Then var will 
        // return the integer it contains.  In this case result will be assigned 
        // the value 2 since var was incremented by subtask().
        int result = var;
        // print out the result
        dlog << LINFO << "var = " << result;

        // Wait for all the tasks we have started to finish.  Note that
        // wait_for_all_tasks() only waits for tasks which were started 
        // by the calling thread.  So you don't have to worry about other 
        // unrelated parts of your application interfering.  In this case
        // it just waits for subtask2() to finish.
        tp.wait_for_all_tasks();

        dlog << LINFO << "task end" ;
    }

    void subtask(int& a)
    {
        dlib::sleep(200);
        a = a + 1;
        dlog << LINFO << "subtask end ";
    }

    void subtask2()
    {
        dlib::sleep(300);
        dlog << LINFO << "subtask2 end ";
    }

};

// ----------------------------------------------------------------------------------------

class add_value
{
public:
    add_value(int value):val(value) { }

    void operator()( int& a )
    {
        a += val;
    }

private:
    int val;
};

// ----------------------------------------------------------------------------------------

int main()
{
    // tell the logger to print out everything
    dlog.set_level(LALL);


    dlog << LINFO << "schedule a few tasks";

    test mytask;
    // Schedule the thread pool to call mytask.task().  Note that all forms of add_task()
    // pass in the task object by reference.  This means you must make sure, in this case,
    // that mytask isn't destructed until after the task has finished executing.
    tp.add_task(mytask, &test::task);

    // You can also pass task objects to a thread pool by value.  So in this case we don't
    // have to worry about keeping our own instance of the task.  Here we construct a temporary 
    // add_value object and pass it right in and everything works like it should.
    future<int> num = 3;
    tp.add_task_by_value(add_value(7), num);  // adds 7 to num
    int result = num.get();
    dlog << LINFO << "result = " << result;   // prints result = 10





// uncomment this line if your compiler supports the new C++0x lambda functions
//#define COMPILER_SUPPORTS_CPP0X_LAMBDA_FUNCTIONS
#ifdef COMPILER_SUPPORTS_CPP0X_LAMBDA_FUNCTIONS

    // In the above examples we had to explicitly create task objects which is
    // inconvenient.  If you have a compiler which supports C++0x lambda functions
    // then you can use the following simpler method.

    // make a task which will just log a message
    tp.add_task_by_value([](){
                         dlog << LINFO << "A message from a lambda function running in another thread."; 
                         });

    // Here we make 10 different tasks, each assigns a different value into 
    // the elements of the vector vect.
    std::vector<int> vect(10);
    for (unsigned long i = 0; i < vect.size(); ++i)
    {
        // Make a lambda function which takes vect by reference and i by value.  So what
        // will happen is each assignment statement will run in a thread in the thread_pool.
        tp.add_task_by_value([&vect,i](){
                             vect[i] = i;
                             });
    }
    // Wait for all tasks which were requested by the main thread to complete.
    tp.wait_for_all_tasks();
    for (unsigned long i = 0; i < vect.size(); ++i)
    {
        dlog << LINFO << "vect["<<i<<"]: " << vect[i];
    }
#endif



    /* A possible run of this program might produce the following output (the first column is 
       the time the log message occurred and the value in [] is the thread id for the thread
       that generated the log message):

    1 INFO  [0] main: schedule a few tasks
    1 INFO  [1] main: task start
    1 INFO  [0] main: result = 10
  201 INFO  [2] main: subtask end 
  201 INFO  [1] main: var = 2
  201 INFO  [2] main: A message from a lambda function running in another thread.
  301 INFO  [3] main: subtask2 end 
  301 INFO  [1] main: task end
  301 INFO  [0] main: vect[0]: 0
  301 INFO  [0] main: vect[1]: 1
  301 INFO  [0] main: vect[2]: 2
  301 INFO  [0] main: vect[3]: 3
  301 INFO  [0] main: vect[4]: 4
  301 INFO  [0] main: vect[5]: 5
  301 INFO  [0] main: vect[6]: 6
  301 INFO  [0] main: vect[7]: 7
  301 INFO  [0] main: vect[8]: 8
  301 INFO  [0] main: vect[9]: 9
    */
}





