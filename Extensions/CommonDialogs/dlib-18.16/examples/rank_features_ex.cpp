// The contents of this file are in the public domain. See LICENSE_FOR_EXAMPLE_PROGRAMS.txt
/*

    This is an example illustrating the use of the rank_features() function 
    from the dlib C++ Library.  

    This example creates a simple set of data and then shows
    you how to use the rank_features() function to find a good 
    set of features (where "good" means the feature set will probably
    work well with a classification algorithm).

    The data used in this example will be 4 dimensional data and will
    come from a distribution where points with a distance less than 10
    from the origin are labeled +1 and all other points are labeled
    as -1.  Note that this data is conceptually 2 dimensional but we
    will add two extra features for the purpose of showing what
    the rank_features() function does.
*/


#include <iostream>
#include <dlib/svm.h>
#include <dlib/rand.h>
#include <vector>

using namespace std;
using namespace dlib;


int main()
{

    // This first typedef declares a matrix with 4 rows and 1 column.  It will be the
    // object that contains each of our 4 dimensional samples.  
    typedef matrix<double, 4, 1> sample_type;



    // Now let's make some vector objects that can hold our samples 
    std::vector<sample_type> samples;
    std::vector<double> labels;

    dlib::rand rnd;

    for (int x = -30; x <= 30; ++x)
    {
        for (int y = -30; y <= 30; ++y)
        {
            sample_type samp;

            // the first two features are just the (x,y) position of our points and so
            // we expect them to be good features since our two classes here are points
            // close to the origin and points far away from the origin.
            samp(0) = x;
            samp(1) = y;

            // This is a worthless feature since it is just random noise.  It should
            // be indicated as worthless by the rank_features() function below.
            samp(2) = rnd.get_random_double();

            // This is a version of the y feature that is corrupted by random noise.  It
            // should be ranked as less useful than features 0, and 1, but more useful
            // than the above feature.
            samp(3) = y*0.2 + (rnd.get_random_double()-0.5)*10;

            // add this sample into our vector of samples.
            samples.push_back(samp);

            // if this point is less than 15 from the origin then label it as a +1 class point.  
            // otherwise it is a -1 class point
            if (sqrt((double)x*x + y*y) <= 15)
                labels.push_back(+1);
            else
                labels.push_back(-1);
        }
    }


    // Here we normalize all the samples by subtracting their mean and dividing by their standard deviation.
    // This is generally a good idea since it often heads off numerical stability problems and also 
    // prevents one large feature from smothering others.
    const sample_type m(mean(mat(samples)));  // compute a mean vector
    const sample_type sd(reciprocal(stddev(mat(samples)))); // compute a standard deviation vector
    // now normalize each sample
    for (unsigned long i = 0; i < samples.size(); ++i)
        samples[i] = pointwise_multiply(samples[i] - m, sd); 

    // This is another thing that is often good to do from a numerical stability point of view.  
    // However, in our case it doesn't really matter.   It's just here to show you how to do it.
    randomize_samples(samples,labels);



    // This is a typedef for the type of kernel we are going to use in this example.
    // In this case I have selected the radial basis kernel that can operate on our
    // 4D sample_type objects.  In general, I would suggest using the same kernel for
    // classification and feature ranking. 
    typedef radial_basis_kernel<sample_type> kernel_type;

    // The radial_basis_kernel has a parameter called gamma that we need to set.  Generally,
    // you should try the same gamma that you are using for training.  But if you don't
    // have a particular gamma in mind then you can use the following function to
    // find a reasonable default gamma for your data.  Another reasonable way to pick a gamma
    // is often to use 1.0/compute_mean_squared_distance(randomly_subsample(samples, 2000)).  
    // It computes the mean squared distance between 2000 randomly selected samples and often
    // works quite well.
    const double gamma = verbose_find_gamma_with_big_centroid_gap(samples, labels);

    // Next we declare an instance of the kcentroid object.  It is used by rank_features() 
    // two represent the centroids of the two classes.  The kcentroid has 3 parameters 
    // you need to set.  The first argument to the constructor is the kernel we wish to 
    // use.  The second is a parameter that determines the numerical accuracy with which 
    // the object will perform part of the ranking algorithm.  Generally, smaller values 
    // give better results but cause the algorithm to attempt to use more dictionary vectors 
    // (and thus run slower and use more memory).  The third argument, however, is the 
    // maximum number of dictionary vectors a kcentroid is allowed to use.  So you can use
    // it to put an upper limit on the runtime complexity.  
    kcentroid<kernel_type> kc(kernel_type(gamma), 0.001, 25);

    // And finally we get to the feature ranking. Here we call rank_features() with the kcentroid we just made,
    // the samples and labels we made above, and the number of features we want it to rank.  
    cout << rank_features(kc, samples, labels) << endl;

    // The output is:
    /*
        0 0.749265 
        1        1 
        3 0.933378 
        2 0.825179 
    */

    // The first column is a list of the features in order of decreasing goodness.  So the rank_features() function
    // is telling us that the samples[i](0) and samples[i](1) (i.e. the x and y) features are the best two.  Then
    // after that the next best feature is the samples[i](3) (i.e. the y corrupted by noise) and finally the worst
    // feature is the one that is just random noise.  So in this case rank_features did exactly what we would
    // intuitively expect.


    // The second column of the matrix is a number that indicates how much the features up to that point
    // contribute to the separation of the two classes.  So bigger numbers are better since they
    // indicate a larger separation.  The max value is always 1.  In the case below we see that the bad
    // features actually make the class separation go down.

    // So to break it down a little more.
    //    0 0.749265   <-- class separation of feature 0 all by itself
    //    1        1   <-- class separation of feature 0 and 1
    //    3 0.933378   <-- class separation of feature 0, 1, and 3
    //    2 0.825179   <-- class separation of feature 0, 1, 3, and 2
        

}

