// The contents of this file are in the public domain. See LICENSE_FOR_EXAMPLE_PROGRAMS.txt

#include "dlib/matrix.h"
using namespace dlib;
using namespace std;


/*!
    This file defines a function callable from MATLAB once you mex it. 

    It computes the same thing as the following MATLAB function:

        function [A, B] = example_mex_function(x, y, some_number)
            A = x+y;
            B = sum(sum(x+y));
            disp(['some_number: ' num2str(some_number)])
        end


    VALID INPUT AND OUTPUT ARGUMENTS
        The mex wrapper can handle the following kinds of input and output arguments:
            - Types corresponding to a MATLAB matrix
                - a dlib::matrix containing any kind of scalar value.
                - a dlib::array2d containing any kind of scalar value.
                - a dlib::vector containing any kind of scalar value.
                - a dlib::point

            - RGB color images
                - dlib::array2d<dlib::rgb_pixel> can be used to represent 
                  MATLAB uint8 MxNx3 images.

            - Types corresponding to a MATLAB scalar
                - any kind of scalar value, e.g. double, int, etc.

            - Types corresponding to a MATLAB string 
                - std::string 
        
            - Types corresponding to a MATLAB cell array
                - a std::vector or dlib::array containing any of the above 
                  types of objects or std::vector or dlib::array objects.
!*/


// You can also define default values for your input arguments.  So
// here we say that if the user in MATLAB doesn't provide the "some_number" 
// then it will get a value of 3.141.  
#define ARG_5_DEFAULT 3.141

// Make a function named mex_function() and put your code inside it.
// Note that the return type should be void.  Use non-const reference
// arguments to return outputs.  Finally, mex_function() must have no
// more than 10 arguments.
void mex_function (
    const matrix<double>& x,
    const matrix<double>& y,
    matrix<double>& out1,
    double& out2,
    double some_number 
) 
{
    out1 = x + y;
    out2 = sum(x+y);

    // we can also use cout to print things as usual:
    cout << "some_number: "<< some_number << endl;
}



// #including this brings in all the mex boiler plate needed by MATLAB.
#include "mex_wrapper.cpp"

