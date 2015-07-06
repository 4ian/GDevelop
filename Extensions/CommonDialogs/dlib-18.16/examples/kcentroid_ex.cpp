// The contents of this file are in the public domain. See LICENSE_FOR_EXAMPLE_PROGRAMS.txt
/*
    This is an example illustrating the use of the kcentroid object 
    from the dlib C++ Library.

    The kcentroid object is an implementation of an algorithm that recursively
    computes the centroid (i.e. average) of a set of points.  The interesting
    thing about dlib::kcentroid is that it does so in a kernel induced feature
    space.  This means that you can use it as a non-linear one-class classifier.
    So you might use it to perform online novelty detection (although, it has
    other uses, see the svm_pegasos or kkmeans examples for example).  
    
    This example will train an instance of it on points from the sinc function.

*/

#include <iostream>
#include <vector>

#include <dlib/svm.h>
#include <dlib/statistics.h>

using namespace std;
using namespace dlib;

// Here is the sinc function we will be trying to learn with the kcentroid 
// object.
double sinc(double x)
{
    if (x == 0)
        return 1;
    return sin(x)/x;
}

int main()
{
    // Here we declare that our samples will be 2 dimensional column vectors.  
    // (Note that if you don't know the dimensionality of your vectors at compile time
    // you can change the 2 to a 0 and then set the size at runtime)
    typedef matrix<double,2,1> sample_type;

    // Now we are making a typedef for the kind of kernel we want to use.  I picked the
    // radial basis kernel because it only has one parameter and generally gives good
    // results without much fiddling.
    typedef radial_basis_kernel<sample_type> kernel_type;

    // Here we declare an instance of the kcentroid object.  The kcentroid has 3 parameters 
    // you need to set.  The first argument to the constructor is the kernel we wish to 
    // use.  The second is a parameter that determines the numerical accuracy with which 
    // the object will perform the centroid estimation.  Generally, smaller values 
    // give better results but cause the algorithm to attempt to use more dictionary vectors 
    // (and thus run slower and use more memory).  The third argument, however, is the 
    // maximum number of dictionary vectors a kcentroid is allowed to use.  So you can use
    // it to control the runtime complexity.  
    kcentroid<kernel_type> test(kernel_type(0.1),0.01, 15);


    // now we train our object on a few samples of the sinc function.
    sample_type m;
    for (double x = -15; x <= 8; x += 1)
    {
        m(0) = x;
        m(1) = sinc(x);
        test.train(m);
    }

    running_stats<double> rs;

    // Now let's output the distance from the centroid to some points that are from the sinc function.
    // These numbers should all be similar.  We will also calculate the statistics of these numbers
    // by accumulating them into the running_stats object called rs.  This will let us easily
    // find the mean and standard deviation of the distances for use below.
    cout << "Points that are on the sinc function:\n";
    m(0) = -1.5; m(1) = sinc(m(0)); cout << "   " << test(m) << endl;  rs.add(test(m));
    m(0) = -1.5; m(1) = sinc(m(0)); cout << "   " << test(m) << endl;  rs.add(test(m));
    m(0) = -0;   m(1) = sinc(m(0)); cout << "   " << test(m) << endl;  rs.add(test(m));
    m(0) = -0.5; m(1) = sinc(m(0)); cout << "   " << test(m) << endl;  rs.add(test(m));
    m(0) = -4.1; m(1) = sinc(m(0)); cout << "   " << test(m) << endl;  rs.add(test(m));
    m(0) = -1.5; m(1) = sinc(m(0)); cout << "   " << test(m) << endl;  rs.add(test(m));
    m(0) = -0.5; m(1) = sinc(m(0)); cout << "   " << test(m) << endl;  rs.add(test(m));

    cout << endl;
    // Let's output the distance from the centroid to some points that are NOT from the sinc function.
    // These numbers should all be significantly bigger than previous set of numbers.  We will also
    // use the rs.scale() function to find out how many standard deviations they are away from the 
    // mean of the test points from the sinc function.  So in this case our criterion for "significantly bigger"
    // is > 3 or 4 standard deviations away from the above points that actually are on the sinc function.
    cout << "Points that are NOT on the sinc function:\n";
    m(0) = -1.5; m(1) = sinc(m(0))+4;   cout << "   " << test(m) << " is " << rs.scale(test(m)) << " standard deviations from sinc." << endl;
    m(0) = -1.5; m(1) = sinc(m(0))+3;   cout << "   " << test(m) << " is " << rs.scale(test(m)) << " standard deviations from sinc." << endl;
    m(0) = -0;   m(1) = -sinc(m(0));    cout << "   " << test(m) << " is " << rs.scale(test(m)) << " standard deviations from sinc." << endl;
    m(0) = -0.5; m(1) = -sinc(m(0));    cout << "   " << test(m) << " is " << rs.scale(test(m)) << " standard deviations from sinc." << endl;
    m(0) = -4.1; m(1) = sinc(m(0))+2;   cout << "   " << test(m) << " is " << rs.scale(test(m)) << " standard deviations from sinc." << endl;
    m(0) = -1.5; m(1) = sinc(m(0))+0.9; cout << "   " << test(m) << " is " << rs.scale(test(m)) << " standard deviations from sinc." << endl;
    m(0) = -0.5; m(1) = sinc(m(0))+1;   cout << "   " << test(m) << " is " << rs.scale(test(m)) << " standard deviations from sinc." << endl;

    // And finally print out the mean and standard deviation of points that are actually from sinc().  
    cout << "\nmean: " << rs.mean() << endl;
    cout << "standard deviation: " << rs.stddev() << endl;

    // The output is as follows:
    /*
        Points that are on the sinc function:
            0.869913
            0.869913
            0.873408
            0.872807
            0.870432
            0.869913
            0.872807

        Points that are NOT on the sinc function:
            1.06366 is 119.65 standard deviations from sinc.
            1.02212 is 93.8106 standard deviations from sinc.
            0.921382 is 31.1458 standard deviations from sinc.
            0.918439 is 29.3147 standard deviations from sinc.
            0.931428 is 37.3949 standard deviations from sinc.
            0.898018 is 16.6121 standard deviations from sinc.
            0.914425 is 26.8183 standard deviations from sinc.

            mean: 0.871313
            standard deviation: 0.00160756
    */

    // So we can see that in this example the kcentroid object correctly indicates that 
    // the non-sinc points are definitely not points from the sinc function.
}


