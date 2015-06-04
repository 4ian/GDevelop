// The contents of this file are in the public domain. See LICENSE_FOR_EXAMPLE_PROGRAMS.txt
/*

    This is an example illustrating the use of the multilayer perceptron 
    from the dlib C++ Library.  

    This example creates a simple set of data to train on and shows
    you how to train a mlp object on that data.


    The data used in this example will be 2 dimensional data and will
    come from a distribution where points with a distance less than 10
    from the origin are labeled 1 and all other points are labeled
    as 0.
        
*/


#include <iostream>
#include <dlib/mlp.h>

using namespace std;
using namespace dlib;


int main()
{
    // The mlp takes column vectors as input and gives column vectors as output.  The dlib::matrix
    // object is used to represent the column vectors. So the first thing we do here is declare 
    // a convenient typedef for the matrix object we will be using.

    // This typedef declares a matrix with 2 rows and 1 column.  It will be the
    // object that contains each of our 2 dimensional samples.   (Note that if you wanted 
    // more than 2 features in this vector you can simply change the 2 to something else)
    typedef matrix<double, 2, 1> sample_type;


    // make an instance of a sample matrix so we can use it below
    sample_type sample;

    // Create a multi-layer perceptron network.   This network has 2 nodes on the input layer 
    // (which means it takes column vectors of length 2 as input) and 5 nodes in the first 
    // hidden layer.  Note that the other 4 variables in the mlp's constructor are left at
    // their default values.  
    mlp::kernel_1a_c net(2,5);

    // Now let's put some data into our sample and train on it.  We do this
    // by looping over 41*41 points and labeling them according to their
    // distance from the origin.
    for (int i = 0; i < 1000; ++i)
    {
        for (int r = -20; r <= 20; ++r)
        {
            for (int c = -20; c <= 20; ++c)
            {
                sample(0) = r;
                sample(1) = c;

                // if this point is less than 10 from the origin
                if (sqrt((double)r*r + c*c) <= 10)
                    net.train(sample,1);
                else
                    net.train(sample,0);
            }
        }
    }

    // Now we have trained our mlp.  Let's see how well it did.  
    // Note that if you run this program multiple times you will get different results. This
    // is because the mlp network is randomly initialized.

    // each of these statements prints out the output of the network given a particular sample.

    sample(0) = 3.123;
    sample(1) = 4;
    cout << "This sample should be close to 1 and it is classified as a " << net(sample) << endl;

    sample(0) = 13.123;
    sample(1) = 9.3545;
    cout << "This sample should be close to 0 and it is classified as a " << net(sample) << endl;

    sample(0) = 13.123;
    sample(1) = 0;
    cout << "This sample should be close to 0 and it is classified as a " << net(sample) << endl;
}

