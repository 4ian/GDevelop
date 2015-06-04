// The contents of this file are in the public domain.  See LICENSE_FOR_EXAMPLE_PROGRAMS.txt
/*

    This example demonstrates the usage of the numerical quadrature function
    integrate_function_adapt_simp().  This function takes as input a single variable
    function, the endpoints of a domain over which the function will be integrated, and a
    tolerance parameter.  It outputs an approximation of the integral of this function over
    the specified domain.  The algorithm is based on the adaptive Simpson method outlined in: 

        Numerical Integration method based on the adaptive Simpson method in
        Gander, W. and W. Gautschi, "Adaptive Quadrature – Revisited,"
        BIT, Vol. 40, 2000, pp. 84-101

*/

#include <iostream>
#include <dlib/matrix.h>
#include <dlib/numeric_constants.h>
#include <dlib/numerical_integration.h>

using namespace std;
using namespace dlib;

// Here we the set of functions that we wish to integrate and comment in the domain of
// integration.

// x in [0,1]
double gg1(double x)
{
    return pow(e,x);
}   

// x in [0,1]
double gg2(double x)
{
    return x*x;
}

// x in [0, pi]
double gg3(double x)
{
    return 1/(x*x + cos(x)*cos(x));
}

// x in [-pi, pi]
double gg4(double x)
{
    return sin(x);
}

// x in [0,2]
double gg5(double x)
{
    return 1/(1 + x*x);
}

int main()
{
    // We first define a tolerance parameter.  Roughly speaking, a lower tolerance will
    // result in a more accurate approximation of the true integral.  However, there are 
    // instances where too small of a tolerance may yield a less accurate approximation
    // than a larger tolerance.  We recommend taking the tolerance to be in the
    // [1e-10, 1e-8] region.
    
    double tol = 1e-10;


    // Here we compute the integrals of the five functions defined above using the same 
    // tolerance level for each.

    double m1 = integrate_function_adapt_simp(&gg1, 0.0, 1.0, tol);
    double m2 = integrate_function_adapt_simp(&gg2, 0.0, 1.0, tol);
    double m3 = integrate_function_adapt_simp(&gg3, 0.0, pi, tol);
    double m4 = integrate_function_adapt_simp(&gg4, -pi, pi, tol);
    double m5 = integrate_function_adapt_simp(&gg5, 0.0, 2.0, tol);

    // We finally print out the values of each of the approximated integrals to ten
    // significant digits.

    cout << "\nThe integral of exp(x) for x in [0,1] is "          << std::setprecision(10) <<  m1  << endl; 
    cout << "The integral of x^2 for in [0,1] is "                 << std::setprecision(10) <<  m2  << endl; 
    cout << "The integral of 1/(x^2 + cos(x)^2) for in [0,pi] is " << std::setprecision(10) <<  m3  << endl;
    cout << "The integral of sin(x) for in [-pi,pi] is "           << std::setprecision(10) <<  m4  << endl;
    cout << "The integral of 1/(1+x^2) for in [0,2] is "           << std::setprecision(10) <<  m5  << endl;
    cout << endl;

    return 0;
}

