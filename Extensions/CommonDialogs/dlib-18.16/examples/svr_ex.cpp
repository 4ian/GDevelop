// The contents of this file are in the public domain. See LICENSE_FOR_EXAMPLE_PROGRAMS.txt
/*
    This is an example illustrating the use of the epsilon-insensitive support vector 
    regression object from the dlib C++ Library.

    In this example we will draw some points from the sinc() function and do a
    non-linear regression on them.
*/

#include <iostream>
#include <vector>

#include <dlib/svm.h>

using namespace std;
using namespace dlib;

// Here is the sinc function we will be trying to learn with the svr_trainer 
// object.
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


    std::vector<sample_type> samples;
    std::vector<double> targets;

    // The first thing we do is pick a few training points from the sinc() function.
    sample_type m;
    for (double x = -10; x <= 4; x += 1)
    {
        m(0) = x;

        samples.push_back(m);
        targets.push_back(sinc(x));
    }

    // Now setup a SVR trainer object.  It has three parameters, the kernel and
    // two parameters specific to SVR.  
    svr_trainer<kernel_type> trainer;
    trainer.set_kernel(kernel_type(0.1));

    // This parameter is the usual regularization parameter.  It determines the trade-off 
    // between trying to reduce the training error or allowing more errors but hopefully 
    // improving the generalization of the resulting function.  Larger values encourage exact 
    // fitting while smaller values of C may encourage better generalization.
    trainer.set_c(10);

    // Epsilon-insensitive regression means we do regression but stop trying to fit a data 
    // point once it is "close enough" to its target value.  This parameter is the value that 
    // controls what we mean by "close enough".  In this case, I'm saying I'm happy if the
    // resulting regression function gets within 0.001 of the target value.
    trainer.set_epsilon_insensitivity(0.001);

    // Now do the training and save the results
    decision_function<kernel_type> df = trainer.train(samples, targets);

    // now we output the value of the sinc function for a few test points as well as the 
    // value predicted by SVR.
    m(0) = 2.5; cout << sinc(m(0)) << "   " << df(m) << endl;
    m(0) = 0.1; cout << sinc(m(0)) << "   " << df(m) << endl;
    m(0) = -4;  cout << sinc(m(0)) << "   " << df(m) << endl;
    m(0) = 5.0; cout << sinc(m(0)) << "   " << df(m) << endl;

    // The output is as follows:
    //  0.239389   0.23905
    //  0.998334   0.997331
    // -0.189201   -0.187636
    // -0.191785   -0.218924

    // The first column is the true value of the sinc function and the second
    // column is the output from the SVR estimate.  

    // We can also do 5-fold cross-validation and find the mean squared error and R-squared
    // values.  Note that we need to randomly shuffle the samples first.  See the svm_ex.cpp 
    // for a discussion of why this is important. 
    randomize_samples(samples, targets);
    cout << "MSE and R-Squared: "<< cross_validate_regression_trainer(trainer, samples, targets, 5) << endl;
    // The output is: 
    // MSE and R-Squared: 1.65984e-05    0.999901
}


