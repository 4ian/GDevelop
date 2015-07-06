// The contents of this file are in the public domain. See LICENSE_FOR_EXAMPLE_PROGRAMS.txt

/*

    This is an example illustrating the use of the threading api from the dlib
    C++ Library.


    This is a very simple example.  It makes some threads and just waits for
    them to terminate.  It should be noted that this example shows how to use
    the lowest level of the dlib threading API.  Often, other higher level tools
    are more appropriate.  For examples of higher level tools see the
    documentation on the pipe, thread_pool, thread_function, or 
    threaded_object.
*/


#include <iostream>
#include <dlib/threads.h>
#include <dlib/misc_api.h>  // for dlib::sleep

using namespace std;
using namespace dlib;

int thread_count = 10;
dlib::mutex count_mutex; // This is a mutex we will use to guard the thread_count variable.  Note that the mutex doesn't know
                   // anything about the thread_count variable.  Only our usage of a mutex determines what it guards.  
                   // In this case we are going to make sure this mutex is always locked before we touch the
                   // thread_count variable.

signaler count_signaler(count_mutex);  // This is a signaler we will use to signal when
                                       // the thread_count variable is changed.  Note that it is
                                       // associated with the count_mutex.  This means that
                                       // when you call count_signaler.wait() it will automatically 
                                       // unlock count_mutex for you. 


void thread (void*)
{
    // just sleep for a second
    dlib::sleep(1000);

    // Now signal that this thread is ending.  First we should get a lock on the
    // count_mutex so we can safely mess with thread_count.  A convenient way to do this
    // is to use an auto_mutex object.  Its constructor takes a mutex object and locks
    // it right away, it then unlocks the mutex when the auto_mutex object is destructed.
    // Note that this happens even if an exception is thrown.  So it ensures that you 
    // don't somehow quit your function without unlocking your mutex.
    auto_mutex locker(count_mutex);
    --thread_count;
    // Now we signal this change.  This will cause one thread that is currently waiting
    // on a call to count_signaler.wait() to unblock.  
    count_signaler.signal();

    // At the end of this function locker goes out of scope and gets destructed, thus
    // unlocking count_mutex for us.
}

int main()
{

    cout << "Create some threads" << endl;
    for (int i = 0; i < thread_count; ++i)
    {
        // Create some threads.  This 0 we are passing in here is the argument that gets 
        // passed to the thread function (a void pointer) but we aren't using it in this 
        // example program so i'm just using 0.
        create_new_thread(thread,0);
    }
    cout << "Done creating threads, now we wait for them to end" << endl;


    // Again we use an auto_mutex to get a lock.  We don't have to do it this way
    // but it is convenient.  Also note that we can name the auto_mutex object anything. 
    auto_mutex some_random_unused_name(count_mutex);
    
    // Now we wait in a loop for thread_count to be 0.  Note that it is important to do this in a
    // loop because it is possible to get spurious wakeups from calls to wait() on some 
    // platforms.  So this guards against that and it also makes the code easy to understand.
    while (thread_count > 0)
        count_signaler.wait(); // This puts this thread to sleep until we get a signal to look at the 
                               // thread_count variable.  It also unlocks the count_mutex before it 
                               // goes to sleep and then relocks it when it wakes back up.  Again,
                               // note that it is possible for wait() to return even if no one signals you. 
                               // This is just weird junk you have to deal with on some platforms.  So 
                               // don't try to be clever and write code that depends on the number of 
                               // times wait() returns because it won't always work.


    cout << "All threads done, ending program" << endl;
}


