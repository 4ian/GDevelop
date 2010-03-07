/*
    This is a very simple example that illustrates the use of the
    thread_function object from the dlib C++ Library.

    The output of the programs should look like this:

        45.6
        9.999
        I have no args!
*/


#include <iostream>
#include "dlib/threads.h"

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



    // we will wait for t3 to end here because the destructor for
    // thread_function objects always waits for their thread to end
}


