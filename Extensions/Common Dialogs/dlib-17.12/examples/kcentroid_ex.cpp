/*
    This is an example illustrating the use of the kcentroid object 
    from the dlib C++ Library.

    The kcentroid object is an implementation of an algorithm that recursively
    computes the centroid (i.e. average) of a set of points.  The interesting
    thing about dlib::kcentroid is that it does so in a kernel induced feature
    space.  This means that you can use it as a non-linear one-class classifier.
    So you might use it to perform online novelty detection.  
    
    This example will train an instance of it on points from the sinc function.

*/

#include <iostream>
#include <vector>

#include "dlib/svm.h"
#include "dlib/statistics.h"

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
    // Here we declare that our samples will be 2 dimensional column vectors.  
    // (Note that if you don't know the dimensionality of your vectors at compile time
    // you can change the 2 to a 0 and then set the size at runtime)
    typedef matrix<double,2,1> sample_type;

    // Now we are making a typedef for the kind of kernel we want to use.  I picked the
    // radial basis kernel because it only has one parameter and generally gives good
    // results without much fiddling.
    typedef radial_basis_kernel<sample_type> kernel_type;

    // Here we declare an instance of the kcentroid object.  The first argument to the constructor
    // is the kernel we wish to use.  The second is a parameter that determines the numerical 
    // accuracy with which the object will perform part of the learning algorithm.  Generally
    // smaller values give better results but cause the algorithm to run slower.  You just have
    // to play with it to decide what balance of speed and accuracy is right for your problem.
    // Here we have set it to 0.01.
    //
    // Also, since we are using the radial basis kernel we have to pick the RBF width parameter.
    // Here we have it set to 0.1.  But in general, a reasonable way of picking this value is
    // to start with some initial guess and to just run the algorithm.  Then print out 
    // test.dictionary_size() to see how many support vectors the kcentroid object is using.
    // And a good rule of thumb is that you should have somewhere in the range of 10-100 
    // support vectors.  So if you aren't in that range then you can change the RBF parameter.
    // Making it smaller will decrease the dictionary size and making it bigger will increase
    // the dictionary size.   
    //
    // So what I often do is I set the kcentroid's second parameter to 0.01 or 0.001.  Then
    // I find an RBF kernel parameter that gives me the number of support vectors that I 
    // feel is appropriate for the problem I'm trying to solve.  Again, this just comes down
    // to playing with it and getting a feel for how things work.  
    kcentroid<kernel_type> test(kernel_type(0.1),0.01);


    // now we train our object on a few samples of the sinc function.
    sample_type m;
    for (double x = -15; x <= 8; x += 1)
    {
        m(0) = x;
        m(1) = sinc(x);
        test.train(m);
    }

    running_stats<double> rs;

    // Now lets output the distance from the centroid to some points that are from the sinc function.
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
    // Lets output the distance from the centroid to some points that are NOT from the sinc function.
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

    // The output is as follows:
    /*
        Points that are on the sinc function:
            0.869861
            0.869861
            0.873182
            0.872628
            0.870352
            0.869861
            0.872628

        Points that are NOT on the sinc function:
            1.06306 is 125.137 standard deviations from sinc.
            1.0215 is 98.0313 standard deviations from sinc.
            0.92136 is 32.717 standard deviations from sinc.
            0.918282 is 30.7096 standard deviations from sinc.
            0.930931 is 38.9595 standard deviations from sinc.
            0.897916 is 17.4264 standard deviations from sinc.
            0.913855 is 27.822 standard deviations from sinc.
    */

    // So we can see that in this example the kcentroid object correctly indicates that 
    // the non-sinc points are definitely not points from the sinc function.
}


