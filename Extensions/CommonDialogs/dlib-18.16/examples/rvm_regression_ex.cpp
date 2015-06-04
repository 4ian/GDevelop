// The contents of this file are in the public domain. See LICENSE_FOR_EXAMPLE_PROGRAMS.txt
/*
    This is an example illustrating the use of the RVM regression object 
    from the dlib C++ Library.

    This example will train on data from the sinc function.

*/

#include <iostream>
#include <vector>

#include <dlib/svm.h>

using namespace std;
using namespace dlib;

// Here is the sinc function we will be trying to learn with rvm regression 
double sinc(double x)
{
    if (x == 0)
        return 1;
    return sin(x)/x;
}

int main()
{
    // Here we declare that our samples will be 1 dimensional column vectors.  
    typedef matrix<double,1,1> sample_type;

    // Now sample some points from the sinc() function
    sample_type m;
    std::vector<sample_type> samples;
    std::vector<double> labels;
    for (double x = -10; x <= 4; x += 1)
    {
        m(0) = x;
        samples.push_back(m);
        labels.push_back(sinc(x));
    }

    // Now we are making a typedef for the kind of kernel we want to use.  I picked the
    // radial basis kernel because it only has one parameter and generally gives good
    // results without much fiddling.
    typedef radial_basis_kernel<sample_type> kernel_type;

    // Here we declare an instance of the rvm_regression_trainer object.  This is the
    // object that we will later use to do the training.
    rvm_regression_trainer<kernel_type> trainer;

    // Here we set the kernel we want to use for training.   The radial_basis_kernel 
    // has a parameter called gamma that we need to determine.  As a rule of thumb, a good 
    // gamma to try is 1.0/(mean squared distance between your sample points).  So 
    // below we are using a similar value.   Note also that using an inappropriately large
    // gamma will cause the RVM training algorithm to run extremely slowly.  What
    // "large" means is relative to how spread out your data is.  So it is important
    // to use a rule like this as a starting point for determining the gamma value
    // if you want to use the RVM.  It is also probably a good idea to normalize your
    // samples as shown in the rvm_ex.cpp example program.
    const double gamma = 2.0/compute_mean_squared_distance(samples);
    cout << "using gamma of " << gamma << endl;
    trainer.set_kernel(kernel_type(gamma));

    // One thing you can do to reduce the RVM training time is to make its
    // stopping epsilon bigger.  However, this might make the outputs less
    // reliable.  But sometimes it works out well.  0.001 is the default.
    trainer.set_epsilon(0.001);

    // now train a function based on our sample points
    decision_function<kernel_type> test = trainer.train(samples, labels);

    // now we output the value of the sinc function for a few test points as well as the 
    // value predicted by our regression.
    m(0) = 2.5; cout << sinc(m(0)) << "   " << test(m) << endl;
    m(0) = 0.1; cout << sinc(m(0)) << "   " << test(m) << endl;
    m(0) = -4;  cout << sinc(m(0)) << "   " << test(m) << endl;
    m(0) = 5.0; cout << sinc(m(0)) << "   " << test(m) << endl;

    // The output is as follows:
    //using gamma of 0.05
    //0.239389   0.240989
    //0.998334   0.999538
    //-0.189201   -0.188453
    //-0.191785   -0.226516


    // The first column is the true value of the sinc function and the second
    // column is the output from the rvm estimate.  



    // Another thing that is worth knowing is that just about everything in dlib is serializable.
    // So for example, you can save the test object to disk and recall it later like so:
    serialize("saved_function.dat") << test;

    // Now let's open that file back up and load the function object it contains.
    deserialize("saved_function.dat") >> test;

}


