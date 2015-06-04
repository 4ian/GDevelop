// The contents of this file are in the public domain. See LICENSE_FOR_EXAMPLE_PROGRAMS.txt
/*
    This is an example illustrating the use of the kernel ridge regression 
    object from the dlib C++ Library.

    This example will train on data from the sinc function.

*/

#include <iostream>
#include <vector>

#include <dlib/svm.h>

using namespace std;
using namespace dlib;

// Here is the sinc function we will be trying to learn with kernel ridge regression 
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

    // Here we declare an instance of the krr_trainer object.  This is the
    // object that we will later use to do the training.
    krr_trainer<kernel_type> trainer;

    // Here we set the kernel we want to use for training.   The radial_basis_kernel 
    // has a parameter called gamma that we need to determine.  As a rule of thumb, a good 
    // gamma to try is 1.0/(mean squared distance between your sample points).  So 
    // below we are using a similar value computed from at most 2000 randomly selected
    // samples.
    const double gamma = 3.0/compute_mean_squared_distance(randomly_subsample(samples, 2000));
    cout << "using gamma of " << gamma << endl;
    trainer.set_kernel(kernel_type(gamma));

    // now train a function based on our sample points
    decision_function<kernel_type> test = trainer.train(samples, labels);

    // now we output the value of the sinc function for a few test points as well as the 
    // value predicted by our regression.
    m(0) = 2.5; cout << sinc(m(0)) << "   " << test(m) << endl;
    m(0) = 0.1; cout << sinc(m(0)) << "   " << test(m) << endl;
    m(0) = -4;  cout << sinc(m(0)) << "   " << test(m) << endl;
    m(0) = 5.0; cout << sinc(m(0)) << "   " << test(m) << endl;

    // The output is as follows:
    //using gamma of 0.075
    //    0.239389   0.239389
    //    0.998334   0.998362
    //    -0.189201   -0.189254
    //    -0.191785   -0.186618

    // The first column is the true value of the sinc function and the second
    // column is the output from the krr estimate.  


    // Note that the krr_trainer has the ability to tell us the leave-one-out predictions
    // for each sample.  
    std::vector<double> loo_values;
    trainer.train(samples, labels, loo_values);
    cout << "mean squared LOO error: " << mean_squared_error(labels,loo_values) << endl;
    cout << "R^2 LOO value:          " << r_squared(labels,loo_values) << endl;
    // Which outputs the following:
    // mean squared LOO error: 8.29575e-07
    // R^2 LOO value:          0.999995





    // Another thing that is worth knowing is that just about everything in dlib is serializable.
    // So for example, you can save the test object to disk and recall it later like so:
    serialize("saved_function.dat") << test;

    // Now let's open that file back up and load the function object it contains.
    deserialize("saved_function.dat") >> test;

}


