// The contents of this file are in the public domain. See LICENSE_FOR_EXAMPLE_PROGRAMS.txt


/*
    This is an example showing how to use the type_safe_union and pipe object from
    from the dlib C++ Library to send messages between threads.

    In this example we will create a class with a single thread in it.  This thread
    will receive messages from a pipe object and simply print them to the screen.   
    The interesting thing about this example is that it shows how to use a pipe and
    type_safe_union to create a message channel between threads that can send many
    different types of objects in a type safe manner.
    


    Program output:
        got a float: 4.567
        got a string: string message
        got an int: 7
        got a string: yet another string message
*/


#include <dlib/threads.h>
#include <dlib/pipe.h>
#include <dlib/type_safe_union.h>
#include <iostream>

using namespace dlib;
using namespace std;

// ----------------------------------------------------------------------------------------

typedef type_safe_union<int, float, std::string> tsu_type;
/*  This is a typedef for the type_safe_union we will be using in this example.
    This type_safe_union object is a type-safe analogue of a union declared as follows:
        union our_union_type
        {
            int a;
            float b;
            std::string c;
        };
   
    Note that the above union isn't actually valid C++ code because it contains a
    non-POD type.  That is, you can't put a std::string or any non-trivial 
    C++ class in a union.   The type_safe_union, however, enables you to store non-POD 
    types such as the std::string.  
  
*/

// ----------------------------------------------------------------------------------------

class pipe_example : private threaded_object 
{
public:
    pipe_example(
    ) : 
        message_pipe(4) // This 4 here is the size of our message_pipe.  The significance is that
                    // if you try to enqueue more than 4 messages onto the pipe then enqueue() will
                    // block until there is room.  
    {
        // start the thread 
        start();
    }

    ~pipe_example (
    )
    {
        // wait for all the messages to be processed
        message_pipe.wait_until_empty();

        // Now disable the message_pipe.  Doing this will cause all calls to 
        // message_pipe.dequeue() to return false so our thread will terminate
        message_pipe.disable();

        // now block until our thread has terminated
        wait();
    }

    // Here we declare our pipe object.  It will contain our messages.
    dlib::pipe<tsu_type> message_pipe;

private:

    // When we call apply_to_contents() below these are the
    // functions which get called.   
    void operator() (int val)
    {
        cout << "got an int: " << val << endl;
    }

    void operator() (float val)
    {
        cout << "got a float: " << val << endl;
    }

    void operator() (std::string val)
    {
        cout << "got a string: " << val << endl;
    }

    void thread ()
    {
        tsu_type msg;

        // Here we loop on messages from the message_pipe.  
        while (message_pipe.dequeue(msg))
        {
            // Here we call the apply_to_contents() function on our type_safe_union.
            // It takes a function object and applies that function object
            // to the contents of the union.  In our case we have setup
            // the pipe_example class as our function object and so below we
            // tell the msg object to take whatever it contains and 
            // call (*this)(contained_object);   So what happens here is 
            // one of the three above functions gets called with the message 
            // we just got.  
            msg.apply_to_contents(*this);
        }
    }

    // Finally, note that since we declared the operator() member functions 
    // private we need to declare the type_safe_union as a friend of this 
    // class so that it will be able to call them.   
    friend class type_safe_union<int, float, std::string>;

};

// ----------------------------------------------------------------------------------------

int main()
{
    pipe_example pe;

    // Make one of our type_safe_union objects
    tsu_type msg;

    // Treat our msg as a float and assign it 4.567
    msg.get<float>() = 4.567f;
    // Now put the message into the pipe
    pe.message_pipe.enqueue(msg);

    // Put a string into the pipe
    msg.get<std::string>() = "string message";
    pe.message_pipe.enqueue(msg);

    // And now an int
    msg.get<int>() = 7;
    pe.message_pipe.enqueue(msg);

    // And another string
    msg.get<std::string>() = "yet another string message";
    pe.message_pipe.enqueue(msg);


    // the main function won't really terminate here.  It will call the destructor for pe
    // which will block until all the messages have been processed.
}

// ----------------------------------------------------------------------------------------

