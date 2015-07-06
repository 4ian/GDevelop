// The contents of this file are in the public domain. See LICENSE_FOR_EXAMPLE_PROGRAMS.txt

#include "call_matlab.h"
#include "dlib/matrix.h"

using namespace dlib;
using namespace std;

/*
    This mex function takes a MATLAB function handle, calls it, and
    returns the results.

    For example, you can call this function in MATLAB like so:
        A = magic(3)
        y = example_mex_callback(A, @(x)x+x)

    This will result in y containing the value 2*A.
*/

void mex_function (
    const matrix<double>& A,
    const function_handle& f,
    matrix<double>& result
) 
{
    // The f argument to this function is a function handle passed from MATLAB.  To
    // call it we use the following syntax:
    call_matlab(f, A, returns(result));
    // This is equivalent to result = f(A). Therefore, the returns(variable) syntax 
    // is used to indicate which variables are outputs of the function.




    // Another thing we can do is call MATLAB functions based on their string name
    // rather than a function_handle.  Here is an example of calling eigs().   
    matrix<double> m(2,2);
    m = 1,2,
        3,4;
    matrix<double> v,d;

    // This is equivalent to [v,d] = eigs(m);
    call_matlab("eigs", m, returns(v), returns(d));
    cout << "eigenvectors: \n" << v << endl;
    cout << "eigenvalues:  \n" << d << endl;
}



// #including this brings in all the mex boiler plate needed by MATLAB.
#include "mex_wrapper.cpp"

