// The contents of this file are in the public domain. See LICENSE_FOR_EXAMPLE_PROGRAMS.txt

/*
    This is an example illustrating the use of the member_function_pointer object 
    from the dlib C++ Library.

*/


#include <iostream>
#include <dlib/member_function_pointer.h>

using namespace dlib;
using namespace std;

// ----------------------------------------------------------------------------------------

class example_object 
{
public:

    void do_something (
    )
    {
        cout << "hello world" << endl;
    }

    void print_this_number (
        int num
    )
    {
        cout << "number you gave me = " << num << endl;
    }

};

// ----------------------------------------------------------------------------------------

int main()
{
    // create a pointer that can point to member functions that take no arguments
    member_function_pointer<> mfp1;

    // create a pointer that can point to member functions that take a single int argument
    member_function_pointer<int> mfp2;

    example_object obj;

    // now we set the mfp1 pointer to point to the member function do_something() 
    // on the obj object.
    mfp1.set(obj, &example_object::do_something);


    // now we set the mfp1 pointer to point to the member function print_this_number() 
    // on the obj object.
    mfp2.set(obj, &example_object::print_this_number);


    // Now we can call the function this pointer points to.  This calls the function
    // obj.do_something() via our member function pointer.
    mfp1();

    // Now we can call the function this pointer points to.  This calls the function
    // obj.print_this_number(5) via our member function pointer.
    mfp2(5);


    // The above example shows a very simple use of the member_function_pointer. 
    // A more interesting use of the member_function_pointer is in the implementation
    // of callbacks or event handlers.  For example, when you register an event
    // handler for a dlib::button click it uses a member_function_pointer 
    // internally to save and later call your event handler.  
}

// ----------------------------------------------------------------------------------------



