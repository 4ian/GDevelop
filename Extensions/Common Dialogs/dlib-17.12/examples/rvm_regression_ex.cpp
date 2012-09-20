/*
    This is an example illustrating the use of the RVM regression object 
    from the dlib C++ Library.

    This example will train on data from the sinc function.

*/

#include <iostream>
#include <vector>

#include "dlib/svm.h"

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

    // Now we are making a typedef for the kind of kernel we want to use.  I picked the
    // radial basis kernel because it only has one parameter and generally gives good
    // results without much fiddling.
    typedef radial_basis_kernel<sample_type> kernel_type;

    // Here we declare an instance of the rvm_regression_trainer object.  This is the
    // object that we will later use to do the training.
    rvm_regression_trainer<kernel_type> trainer;
    // Here we set the kernel we want to use for training.  The 0.05 is the gamma 
    // parameter to the radial_basis_kernel.
    trainer.set_kernel(kernel_type(0.05));

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

    // now train a function based on our sample points
    decision_function<kernel_type> test = trainer.train(samples, labels);

    // now we output the value of the sinc function for a few test points as well as the 
    // value predicted by our regression.
    m(0) = 2.5; cout << sinc(m(0)) << "   " << test(m) << endl;
    m(0) = 0.1; cout << sinc(m(0)) << "   " << test(m) << endl;
    m(0) = -4;  cout << sinc(m(0)) << "   " << test(m) << endl;
    m(0) = 5.0; cout << sinc(m(0)) << "   " << test(m) << endl;

    // The output is as follows:
    //0.239389   0.240989
    //0.998334   0.999538
    //-0.189201   -0.188453
    //-0.191785   -0.226516


    // The first column is the true value of the sinc function and the second
    // column is the output from the rvm estimate.  



    // Another thing that is worth knowing is that just about everything in dlib is serializable.
    // So for example, you can save the test object to disk and recall it later like so:
    ofstream fout("saved_function.dat",ios::binary);
    serialize(test,fout);
    fout.close();

    // now lets open that file back up and load the function object it contains
    ifstream fin("saved_function.dat",ios::binary);
    deserialize(test, fin);


}









