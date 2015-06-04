// The contents of this file are in the public domain. See LICENSE_FOR_EXAMPLE_PROGRAMS.txt
/*

    This is an example illustrating the use of the queue component (and 
    to some degree the general idea behind most of the other container 
    classes) from the dlib C++ Library.

    It loads a queue with 20 random numbers.  Then it uses the enumerable 
    interface to print them all to the screen.  Then it sorts the numbers and 
    prints them to the screen.
*/




#include <dlib/queue.h>
#include <iostream>
#include <iomanip>
#include <ctime>
#include <cstdlib>


// I'm picking the version of the queue that is kernel_2a extended by
// the queue sorting extension.   This is just a normal queue but with the
// added member function sort() which sorts the queue.
typedef dlib::queue<int>::sort_1b_c queue_of_int;


using namespace std;
using namespace dlib;


int main()
{
    queue_of_int q;

    // initialize rand()
    srand(time(0));

    for (int i = 0; i < 20; ++i)
    {
        int a = rand()&0xFF;

        // note that adding a to the queue "consumes" the value of a because
        // all container classes move values around by swapping them rather
        // than copying them.   So a is swapped into the queue which results 
        // in a having an initial value for its type (for int types that value
        // is just some undefined value. )
        q.enqueue(a);

    }


    cout << "The contents of the queue are:\n";
    while (q.move_next())
        cout << q.element() << " ";

    cout << "\n\nNow we sort the queue and its contents are:\n";
    q.sort();  // note that we don't have to call q.reset() to put the enumerator
               // back at the start of the queue because calling sort() does
               // that automatically for us.  (In general, modifying a container
               // will reset the enumerator).
    while (q.move_next())
        cout << q.element() << " ";    


    cout << "\n\nNow we remove the numbers from the queue:\n";
    while (q.size() > 0)
    {
        int a;
        q.dequeue(a);
        cout << a << " ";
    }


    cout << endl;
}

