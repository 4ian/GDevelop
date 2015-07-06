// The contents of this file are in the public domain. See LICENSE_FOR_EXAMPLE_PROGRAMS.txt
/*
    This is an example illustrating the use of the running_stats object from the dlib C++
    Library.  It is a simple tool for computing basic statistics on a stream of numbers.
    In this example, we sample 100 points from the sinc function and then then compute the
    unbiased sample mean, variance, skewness, and excess kurtosis.

*/    
#include <iostream>
#include <vector>
#include <dlib/statistics.h>

using namespace std;
using namespace dlib;

// Here we define the sinc function so that we may generate sample data. We compute the mean,
// variance, skewness, and excess kurtosis of this sample data.

double sinc(double x)
{
    if (x == 0)
        return 1;
    return sin(x)/x;
}

int main()
{
    running_stats<double> rs;

    double tp1 = 0;
    double tp2 = 0;

    // We first generate the data and add it sequentially to our running_stats object.  We
    // then print every fifth data point.
    for (int x = 1; x <= 100; x++)
    {
        tp1 = x/100.0;
        tp2 = sinc(pi*x/100.0);
        rs.add(tp2);

        if(x % 5 == 0)
        {
            cout << " x = " << tp1 << " sinc(x) = " << tp2 << endl;
        }
    }

    // Finally, we compute and print the mean, variance, skewness, and excess kurtosis of
    // our data.

    cout << endl;
    cout << "Mean:           " << rs.mean() << endl;
    cout << "Variance:       " << rs.variance() << endl;
    cout << "Skewness:       " << rs.skewness() << endl;
    cout << "Excess Kurtosis " << rs.ex_kurtosis() << endl;

    return 0;
}

