// The contents of this file are in the public domain. See LICENSE_FOR_EXAMPLE_PROGRAMS.txt


/*
    This is an example illustrating the use of the threading API and pipe object 
    from the dlib C++ Library.

    In this example we will create three threads that will read "jobs" off the end of 
    a pipe object and process them.  It shows you how you can use the pipe object
    to communicate between threads.  


    Example program output:
    0 INFO  [0] pipe_example: Add job 0 to pipe
    0 INFO  [0] pipe_example: Add job 1 to pipe
    0 INFO  [0] pipe_example: Add job 2 to pipe
    0 INFO  [0] pipe_example: Add job 3 to pipe
    0 INFO  [0] pipe_example: Add job 4 to pipe
    0 INFO  [0] pipe_example: Add job 5 to pipe
    0 INFO  [1] pipe_example: got job 0
    0 INFO  [0] pipe_example: Add job 6 to pipe
    0 INFO  [2] pipe_example: got job 1
    0 INFO  [0] pipe_example: Add job 7 to pipe
    0 INFO  [3] pipe_example: got job 2
  103 INFO  [0] pipe_example: Add job 8 to pipe
  103 INFO  [1] pipe_example: got job 3
  103 INFO  [0] pipe_example: Add job 9 to pipe
  103 INFO  [2] pipe_example: got job 4
  103 INFO  [0] pipe_example: Add job 10 to pipe
  103 INFO  [3] pipe_example: got job 5
  207 INFO  [0] pipe_example: Add job 11 to pipe
  207 INFO  [1] pipe_example: got job 6
  207 INFO  [0] pipe_example: Add job 12 to pipe
  207 INFO  [2] pipe_example: got job 7
  207 INFO  [0] pipe_example: Add job 13 to pipe
  207 INFO  [3] pipe_example: got job 8
  311 INFO  [1] pipe_example: got job 9
  311 INFO  [2] pipe_example: got job 10
  311 INFO  [3] pipe_example: got job 11
  311 INFO  [0] pipe_example: Add job 14 to pipe
  311 INFO  [0] pipe_example: main ending
  311 INFO  [0] pipe_example: destructing pipe object: wait for job_pipe to be empty
  415 INFO  [1] pipe_example: got job 12
  415 INFO  [2] pipe_example: got job 13
  415 INFO  [3] pipe_example: got job 14
  415 INFO  [0] pipe_example: destructing pipe object: job_pipe is empty
  519 INFO  [1] pipe_example: thread ending
  519 INFO  [2] pipe_example: thread ending
  519 INFO  [3] pipe_example: thread ending
  519 INFO  [0] pipe_example: destructing pipe object: all threads have ended


  The first column is the number of milliseconds since program start, the second
  column is the logging level, the third column is the thread id, and the rest
  is the log message.
*/


#include <dlib/threads.h>
#include <dlib/misc_api.h>  // for dlib::sleep
#include <dlib/pipe.h>
#include <dlib/logger.h>

using namespace dlib;

struct job
{
    /*
        This object represents the jobs we are going to send out to our threads.  
    */
    int id;
};

dlib::logger dlog("pipe_example");

// ----------------------------------------------------------------------------------------

class pipe_example : private multithreaded_object
{
public:
    pipe_example(
    ) : 
        job_pipe(4) // This 4 here is the size of our job_pipe.  The significance is that
                    // if you try to enqueue more than 4 jobs onto the pipe then enqueue() will
                    // block until there is room.  
    {
        // register 3 threads
        register_thread(*this,&pipe_example::thread);
        register_thread(*this,&pipe_example::thread);
        register_thread(*this,&pipe_example::thread);

        // start the 3 threads we registered above
        start();
    }

    ~pipe_example (
    )
    {
        dlog << LINFO << "destructing pipe object: wait for job_pipe to be empty";
        // wait for all the jobs to be processed
        job_pipe.wait_until_empty();

        dlog << LINFO << "destructing pipe object: job_pipe is empty";

        // now disable the job_pipe.  doing this will cause all calls to 
        // job_pipe.dequeue() to return false so our threads will terminate
        job_pipe.disable();

        // now block until all the threads have terminated
        wait();
        dlog << LINFO << "destructing pipe object: all threads have ended";
    }

    // Here we declare our pipe object.  It will contain our job objects.
    // There are only two requirements on the type of objects you can use in a
    // pipe, first they must have a default constructor and second they must
    // be swappable by a global swap().
    dlib::pipe<job> job_pipe;

private:
    void thread ()
    {
        job j;
        // Here we loop on jobs from the job_pipe.  
        while (job_pipe.dequeue(j))
        {
            // process our job j in some way.   
            dlog << LINFO << "got job " << j.id;

            // sleep for 0.1 seconds
            dlib::sleep(100);
        }
        dlog << LINFO << "thread ending";
    }

};

// ----------------------------------------------------------------------------------------

int main()
{
    // Set the dlog object so that it logs everything.
    dlog.set_level(LALL);

    pipe_example pe;

    for (int i = 0; i < 15; ++i)
    {
        dlog << LINFO << "Add job " << i << " to pipe";
        job j;
        j.id = i;


        // Add this job to the pipe.  One of our three threads will get it and process it.
        // It should also be pointed out that the enqueue() function uses the global
        // swap function to move jobs into the pipe.  This means that it modifies the
        // jobs we are passing in to it.  This allows you to implement a fast swap 
        // operator for your jobs.  For example, std::vector objects have a global
        // swap and it can execute in constant time by just swapping pointers inside 
        // std::vector.  This means that the dlib::pipe is effectively a zero-copy 
        // message passing system if you setup global swap for your jobs.   
        pe.job_pipe.enqueue(j);
    }

    dlog << LINFO << "main ending";

    // the main function won't really terminate here.  It will call the destructor for pe
    // which will block until all the jobs have been processed.
}

// ----------------------------------------------------------------------------------------

