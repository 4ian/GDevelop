// The contents of this file are in the public domain. See LICENSE_FOR_EXAMPLE_PROGRAMS.txt
/*
    This is a very simple example that illustrates the use of the
    thread_function object from the dlib C++ Library.

    The output of the programs should look like this:

        45.6
        9.999
        I have no args!
        val: 3
*/


#include <iostream>
#include <dlib/threads.h>
#include <dlib/ref.h>

using namespace dlib;
using namespace std;

void thread_1(double a)
{
    cout << a << endl;
}

void thread_2 ()
{
    cout << "I have no args!" << endl;
}

void thread_increment(double& a)
{
    a += 1;
}

int main()
{
    // create a thread that will call thread_1(45.6)
    thread_function t1(thread_1,45.6);
    // wait for the t1 thread to end
    t1.wait();


    // create a thread that will call thread_1(9.999)
    thread_function t2(thread_1,9.999);
    // wait for the t2 thread to end
    t2.wait();


    // create a thread that will call thread_2()
    thread_function t3(thread_2);


    // Note that we can also use the ref() function to pass a variable
    // to a thread by reference.  For example, the thread below adds
    // one to val.
    double val = 2;
    thread_function t4(thread_increment, dlib::ref(val));
    t4.wait(); // wait for t4 to finish before printing val.
    // Print val.  It will now have a value of 3.
    cout << "val: " << val << endl;



    // At this point we will automatically wait for t3 to end because
    // the destructor for thread_function objects always wait for their
    // thread to terminate.
}


