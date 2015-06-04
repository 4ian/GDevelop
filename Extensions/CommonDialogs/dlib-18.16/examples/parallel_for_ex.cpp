// The contents of this file are in the public domain. See LICENSE_FOR_EXAMPLE_PROGRAMS.txt
/*

    This is an example illustrating the use of the parallel for loop tools from the dlib
    C++ Library.

    Normally, a for loop executes the body of the loop in a serial manner.  This means
    that, for example, if it takes 1 second to execute the body of the loop and the body
    needs to execute 10 times then it will take 10 seconds to execute the entire loop.
    However, on modern multi-core computers we have the opportunity to speed this up by
    executing multiple steps of a for loop in parallel.  This example program will walk you
    though a few examples showing how to do just that.  
*/


#include <dlib/threads.h>
#include <dlib/misc_api.h>  // for dlib::sleep
#include <vector>
#include <iostream>

using namespace dlib;
using namespace std;

// ----------------------------------------------------------------------------------------

void print(const std::vector<int>& vect)
{
    for (unsigned long i = 0; i < vect.size(); ++i)
    {
        cout << vect[i] << endl;
    }
    cout << "\n**************************************\n";
}

// ----------------------------------------------------------------------------------------

void example_using_regular_non_parallel_loops();
void example_using_lambda_functions();
void example_without_using_lambda_functions();

// ----------------------------------------------------------------------------------------

int main()
{
    // We have 3 examples, each contained in a separate function.  Each example performs
    // exactly the same computation, however, the second two examples do so using parallel
    // for loops.  So the first example is here to show you what we are doing in terms of
    // classical non-parallel for loops.  Then the next two examples will illustrate two
    // ways to parallelize for loops in C++.  The first, and simplest way, uses C++11
    // lambda functions.  However, since lambda functions are a relatively recent addition
    // to C++ we also show how to write parallel for loops without using lambda functions.
    // This way, users who don't yet have access to a current C++ compiler can learn to
    // write parallel for loops as well.

    example_using_regular_non_parallel_loops();
    example_using_lambda_functions();
    example_without_using_lambda_functions();
}

// ----------------------------------------------------------------------------------------

void example_using_regular_non_parallel_loops()
{
    cout << "\nExample using regular non-parallel for loops\n" << endl;

    std::vector<int> vect;

    // put 10 elements into vect which are all equal to -1
    vect.assign(10, -1);

    // Now set each element equal to its index value.  We put a sleep call in here so that
    // when we run the same thing with a parallel for loop later on you will be able to
    // observe the speedup. 
    for (unsigned long i = 0; i < vect.size(); ++i)
    {
        vect[i] = i;
        dlib::sleep(1000); // sleep for 1 second
    }
    print(vect);



    // Assign only part of the elements in vect.
    vect.assign(10, -1);
    for (unsigned long i = 1; i < 5; ++i)
    {
        vect[i] = i;
        dlib::sleep(1000);
    }
    print(vect);



    // Sum all element sin vect.
    int sum = 0;
    vect.assign(10, 2);
    for (unsigned long i = 0; i < vect.size(); ++i)
    {
        dlib::sleep(1000);
        sum += vect[i];
    }

    cout << "sum: "<< sum << endl;
}

// ----------------------------------------------------------------------------------------

void example_using_lambda_functions()
{
// Change the next line to #if 1 if your compiler supports the new C++11 lambda functions. 
#if 0
    cout << "\nExample using parallel for loops\n" << endl;

    // This variable should be set to the number of processing cores on your computer since
    // it determines the amount of parallelism in the for loop.  
    const unsigned long num_threads = 10;

    std::vector<int> vect;

    vect.assign(10, -1);
    parallel_for(num_threads, 0, vect.size(), [&](long i){
        // The i variable is the loop counter as in a normal for loop.  So we simply need
        // to place the body of the for loop right here and we get the same behavior.  The
        // range for the for loop is determined by the 2nd and 3rd arguments to
        // parallel_for().
        vect[i] = i;
        dlib::sleep(1000);
    });
    print(vect);


    // Assign only part of the elements in vect.
    vect.assign(10, -1);
    parallel_for(num_threads, 1, 5, [&](long i){
        vect[i] = i;
        dlib::sleep(1000);
    });
    print(vect);


    // Note that things become a little more complex if the loop bodies are not totally
    // independent.  In the first two cases each iteration of the loop touched different
    // memory locations, so we didn't need to use any kind of thread synchronization.
    // However, in the summing loop we need to add some synchronization to protect the sum
    // variable.  This is easily accomplished by creating a mutex and locking it before
    // adding to sum.  More generally, you must ensure that the bodies of your parallel for
    // loops are thread safe using whatever means is appropriate for your code.  Since a
    // parallel for loop is implemented using threads, all the usual techniques for
    // ensuring thread safety can be used. 
    int sum = 0;
    dlib::mutex m;
    vect.assign(10, 2);
    parallel_for(num_threads, 0, vect.size(), [&](long i){
        // The sleep statements still execute in parallel.  
        dlib::sleep(1000);

        // Lock the m mutex.  The auto_mutex will automatically unlock at the closing }.
        // This will ensure only one thread can execute the sum += vect[i] statement at
        // a time.
        auto_mutex lock(m);
        sum += vect[i];
    });

    cout << "sum: "<< sum << endl;

#endif
}

// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------
//    The rest of this example program shows how to create parallel for loops without
//    using lambda functions.  So the first thing we do is explicitly create function
//    objects equivalent to the lambda functions we used.  Then we call parallel_for() 
//    as done above.
// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------

struct function_object
{
    function_object( std::vector<int>& vect_ ) : vect(vect_) {}

    std::vector<int>& vect;

    void operator() (long i) const
    {
        vect[i] = i;
        dlib::sleep(1000); 
    }
};

struct function_object_sum
{
    function_object_sum( const std::vector<int>& vect_, int& sum_ ) : vect(vect_), sum(sum_) {}

    const std::vector<int>& vect;
    int& sum;
    dlib::mutex m;

    void operator() (long i) const
    {
        dlib::sleep(1000); 
        auto_mutex lock(m);
        sum += vect[i];
    }
};

void example_without_using_lambda_functions()
{
    // Again, note that this function does exactly the same thing as
    // example_using_regular_non_parallel_loops() and example_using_lambda_functions().

    cout << "\nExample using parallel for loops and no lambda functions\n" << endl;

    const unsigned long num_threads = 10;
    std::vector<int> vect;


    vect.assign(10, -1); 
    parallel_for(num_threads, 0, vect.size(), function_object(vect));
    print(vect);


    vect.assign(10, -1);
    parallel_for(num_threads, 1, 5, function_object(vect));
    print(vect);


    int sum = 0;
    vect.assign(10, 2);
    function_object_sum funct(vect, sum);
    parallel_for(num_threads, 0, vect.size(), funct);
    cout << "sum: " << sum << endl;
}

// ----------------------------------------------------------------------------------------

