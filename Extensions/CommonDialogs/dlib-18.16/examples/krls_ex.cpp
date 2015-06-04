// The contents of this file are in the public domain. See LICENSE_FOR_EXAMPLE_PROGRAMS.txt
/*
    This is an example illustrating the use of the krls object 
    from the dlib C++ Library.

    The krls object allows you to perform online regression.  This
    example will train an instance of it on the sinc function.

*/

#include <iostream>
#include <vector>

#include <dlib/svm.h>

using namespace std;
using namespace dlib;

// Here is the sinc function we will be trying to learn with the krls
// object.
double sinc(double x)
{
    if (x == 0)
        return 1;
    return sin(x)/x;
}

int main()
{
    // Here we declare that our samples will be 1 dimensional column vectors.  In general, 
    // you can use N dimensional vectors as inputs to the krls object.  But here we only 
    // have 1 dimension to make the example simple.  (Note that if you don't know the 
    // dimensionality of your vectors at compile time you can change the first number to 
    // a 0 and then set the size at runtime)
    typedef matrix<double,1,1> sample_type;

    // Now we are making a typedef for the kind of kernel we want to use.  I picked the
    // radial basis kernel because it only has one parameter and generally gives good
    // results without much fiddling.
    typedef radial_basis_kernel<sample_type> kernel_type;

    // Here we declare an instance of the krls object.  The first argument to the constructor
    // is the kernel we wish to use.  The second is a parameter that determines the numerical 
    // accuracy with which the object will perform part of the regression algorithm.  Generally
    // smaller values give better results but cause the algorithm to run slower.  You just have
    // to play with it to decide what balance of speed and accuracy is right for your problem.
    // Here we have set it to 0.001.
    krls<kernel_type> test(kernel_type(0.1),0.001);

    // now we train our object on a few samples of the sinc function.
    sample_type m;
    for (double x = -10; x <= 4; x += 1)
    {
        m(0) = x;
        test.train(m, sinc(x));
    }

    // now we output the value of the sinc function for a few test points as well as the 
    // value predicted by krls object.
    m(0) = 2.5; cout << sinc(m(0)) << "   " << test(m) << endl;
    m(0) = 0.1; cout << sinc(m(0)) << "   " << test(m) << endl;
    m(0) = -4;  cout << sinc(m(0)) << "   " << test(m) << endl;
    m(0) = 5.0; cout << sinc(m(0)) << "   " << test(m) << endl;

    // The output is as follows:
    // 0.239389   0.239362
    // 0.998334   0.998333
    // -0.189201   -0.189201
    // -0.191785   -0.197267


    // The first column is the true value of the sinc function and the second
    // column is the output from the krls estimate.  

    



    // Another thing that is worth knowing is that just about everything in dlib is serializable.
    // So for example, you can save the test object to disk and recall it later like so:
    serialize("saved_krls_object.dat") << test;

    // Now let's open that file back up and load the krls object it contains.
    deserialize("saved_krls_object.dat") >> test;

    // If you don't want to save the whole krls object (it might be a bit large) 
    // you can save just the decision function it has learned so far.  You can get 
    // the decision function out of it by calling test.get_decision_function() and
    // then you can serialize that object instead.  E.g.
    decision_function<kernel_type> funct = test.get_decision_function();
    serialize("saved_krls_function.dat") << funct;
}


