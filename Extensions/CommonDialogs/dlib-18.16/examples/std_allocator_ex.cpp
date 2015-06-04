// The contents of this file are in the public domain. See LICENSE_FOR_EXAMPLE_PROGRAMS.txt
/*
    This is an example illustrating the use of the dlib::std_allocator object.

    In this example we will create the necessary typedefs to give the
    dlib::std_allocator object to the standard string and vector objects
    in the STL.  Thus we will create versions of std::string and std::vector
    that perform all their memory allocations and deallocations via one of 
    the dlib memory manager objects.
*/


// include everything we need for this example
#include <vector>
#include <iostream>
#include <string>
#include <dlib/std_allocator.h>
#include <dlib/memory_manager.h>
#include <dlib/memory_manager_stateless.h>

using namespace std;
using namespace dlib;


int main()
{
    // Make a typedef for an allocator that uses the thread safe memory_manager_stateless object with a 
    // global memory pool.  This version of the memory_manager_stateless object keeps everything it allocates
    // in a global memory pool and doesn't release any memory until the program terminates.
    typedef std_allocator<char, memory_manager_stateless<char>::kernel_2_3a> alloc_char_with_global_memory_pool;

    // Now make a typedef for a C++ standard string that uses our new allocator type
    typedef std::basic_string<char, char_traits<char>, alloc_char_with_global_memory_pool > dstring;


    // typedef another allocator for dstring objects
    typedef std_allocator<dstring, memory_manager_stateless<char>::kernel_2_3a> alloc_dstring_with_global_memory_pool;

    // Now make a typedef for a C++ standard vector that uses our new allocator type and also contains the new dstring
    typedef std::vector<dstring, alloc_dstring_with_global_memory_pool > dvector;

    // Now we can use the string and vector we have as we normally would.  So for example, I can make a
    // dvector and add 4 strings into it like so:
    dvector v;
    v.push_back("one");
    v.push_back("two");
    v.push_back("three");
    v.push_back("four");

    // And now we print out the contents of our vector
    for (unsigned long i = 0; i < v.size(); ++i)
    {
        cout << v[i] << endl;
    }

}

