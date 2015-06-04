// The contents of this file are in the public domain. See LICENSE_FOR_EXAMPLE_PROGRAMS.txt
/*
    This is an example illustrating the use of the krls object 
    from the dlib C++ Library.

    The krls object allows you to perform online regression.  This
    example will use the krls object to perform filtering of a signal
    corrupted by uniformly distributed noise.
*/

#include <iostream>

#include <dlib/svm.h>
#include <dlib/rand.h>

using namespace std;
using namespace dlib;

// Here is the function we will be trying to learn with the krls
// object.
double sinc(double x)
{
    if (x == 0)
        return 1;

    // also add in x just to make this function a little more complex
    return sin(x)/x + x;
}

int main()
{
    // Here we declare that our samples will be 1 dimensional column vectors.  The reason for
    // using a matrix here is that in general you can use N dimensional vectors as inputs to the
    // krls object.  But here we only have 1 dimension to make the example simple.
    typedef matrix<double,1,1> sample_type;


    // Now we are making a typedef for the kind of kernel we want to use.  I picked the
    // radial basis kernel because it only has one parameter and generally gives good
    // results without much fiddling.
    typedef radial_basis_kernel<sample_type> kernel_type;


    // Here we declare an instance of the krls object.  The first argument to the constructor
    // is the kernel we wish to use.  The second is a parameter that determines the numerical 
    // accuracy with which the object will perform part of the regression algorithm.  Generally
    // smaller values give better results but cause the algorithm to run slower (because it tries
    // to use more "dictionary vectors" to represent the function it is learning.  
    // You just have to play with it to decide what balance of speed and accuracy is right 
    // for your problem.  Here we have set it to 0.001.
    //
    // The last argument is the maximum number of dictionary vectors the algorithm is allowed
    // to use.  The default value for this field is 1,000,000 which is large enough that you 
    // won't ever hit it in practice.  However, here we have set it to the much smaller value
    // of 7.  This means that once the krls object accumulates 7 dictionary vectors it will 
    // start discarding old ones in favor of new ones as it goes through the training process.  
    // In other words, the algorithm "forgets" about old training data and focuses on recent
    // training samples. So the bigger the maximum dictionary size the longer its memory will 
    // be.  But in this example program we are doing filtering so we only care about the most 
    // recent data.  So using a small value is appropriate here since it will result in much
    // faster filtering and won't introduce much error.
    krls<kernel_type> test(kernel_type(0.05),0.001,7);

    dlib::rand rnd;

    // Now let's loop over a big range of values from the sinc() function.  Each time
    // adding some random noise to the data we send to the krls object for training.
    sample_type m;
    double mse_noise = 0;
    double mse = 0;
    double count = 0;
    for (double x = -20; x <= 20; x += 0.01)
    {
        m(0) = x;
        // get a random number between -0.5 and 0.5
        const double noise = rnd.get_random_double()-0.5;

        // train on this new sample
        test.train(m, sinc(x)+noise);

        // once we have seen a bit of data start measuring the mean squared prediction error.
        // Also measure the mean squared error due to the noise.
        if (x > -19)
        {
            ++count;
            mse += pow(sinc(x) - test(m),2);
            mse_noise += pow(noise,2);
        }
    }

    mse /= count;
    mse_noise /= count;

    // Output the ratio of the error from the noise and the mean squared prediction error.  
    cout << "prediction error:                   " << mse << endl;
    cout << "noise:                              " << mse_noise << endl;
    cout << "ratio of noise to prediction error: " << mse_noise/mse << endl;

    // When the program runs it should print the following:
    //    prediction error:                   0.00735201
    //    noise:                              0.0821628
    //    ratio of noise to prediction error: 11.1756

    // And we see that the noise has been significantly reduced by filtering the points 
    // through the krls object.

}


