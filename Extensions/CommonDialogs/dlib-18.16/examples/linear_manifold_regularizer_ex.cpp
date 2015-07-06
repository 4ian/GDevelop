// The contents of this file are in the public domain. See LICENSE_FOR_EXAMPLE_PROGRAMS.txt
/*

    This is an example illustrating the use of the linear_manifold_regularizer 
    and empirical_kernel_map from the dlib C++ Library.

    This example program assumes you are familiar with some general elements of 
    the library.  In particular, you should have at least read the svm_ex.cpp 
    and matrix_ex.cpp examples.  You should also have read the empirical_kernel_map_ex.cpp
    example program as the present example builds upon it.



    This program shows an example of what is called semi-supervised learning.  
    That is, a small amount of labeled data is augmented with a large amount 
    of unlabeled data.  A learning algorithm is then run on all the data 
    and the hope is that by including the unlabeled data we will end up with
    a better result.


    In this particular example we will generate 200,000 sample points of
    unlabeled data along with 2 samples of labeled data.  The sample points
    will be drawn randomly from two concentric circles.  One labeled data
    point will be drawn from each circle.  The goal is to learn to
    correctly separate the two circles using only the 2 labeled points 
    and the unlabeled data.

    To do this we will first run an approximate form of k nearest neighbors
    to determine which of the unlabeled samples are closest together.  We will
    then make the manifold assumption, that is, we will assume that points close
    to each other should share the same classification label.  

    Once we have determined which points are near neighbors we will use the 
    empirical_kernel_map and linear_manifold_regularizer to transform all the 
    data points into a new vector space where any linear rule will have similar 
    output for points which we have decided are near neighbors.

    Finally, we will classify all the unlabeled data according to which of 
    the two labeled points are nearest.  Normally this would not work but by 
    using the manifold assumption we will be able to successfully classify
    all the unlabeled data.


    
    For further information on this subject you should begin with the following
    paper as it discusses a very similar application of manifold regularization.

        Beyond the Point Cloud: from Transductive to Semi-supervised Learning
        by Vikas Sindhwani, Partha Niyogi, and Mikhail Belkin




                    ******** SAMPLE PROGRAM OUTPUT ********

    Testing manifold regularization with an intrinsic_regularization_strength of 0.
    number of edges generated: 49998
    Running simple test...
    error: 0.37022
    error: 0.44036
    error: 0.376715
    error: 0.307545
    error: 0.463455
    error: 0.426065
    error: 0.416155
    error: 0.288295
    error: 0.400115
    error: 0.46347

    Testing manifold regularization with an intrinsic_regularization_strength of 10000.
    number of edges generated: 49998
    Running simple test...
    error: 0
    error: 0
    error: 0
    error: 0
    error: 0
    error: 0
    error: 0
    error: 0
    error: 0
    error: 0


*/

#include <dlib/manifold_regularization.h>
#include <dlib/svm.h>
#include <dlib/rand.h>
#include <dlib/statistics.h>
#include <iostream>
#include <vector>
#include <ctime>


using namespace std;
using namespace dlib;

// ----------------------------------------------------------------------------------------

// First let's make a typedef for the kind of samples we will be using. 
typedef matrix<double, 0, 1> sample_type;

// We will be using the radial_basis_kernel in this example program.
typedef radial_basis_kernel<sample_type> kernel_type;

// ----------------------------------------------------------------------------------------

void generate_circle (
    std::vector<sample_type>& samples,
    double radius,
    const long num
);
/*!
    requires
        - num > 0
        - radius > 0
    ensures
        - generates num points centered at (0,0) with the given radius.  Adds these
          points into the given samples vector.
!*/

// ----------------------------------------------------------------------------------------

void test_manifold_regularization (
    const double intrinsic_regularization_strength
);
/*!
    ensures
        - Runs an example test using the linear_manifold_regularizer with the given
          intrinsic_regularization_strength.   
!*/

// ----------------------------------------------------------------------------------------

int main()
{
    // Run the test without any manifold regularization. 
    test_manifold_regularization(0);

    // Run the test with manifold regularization.  You can think of this number as
    // a measure of how much we trust the manifold assumption.  So if you are really
    // confident that you can select neighboring points which should have the same
    // classification then make this number big.   
    test_manifold_regularization(10000.0);
}

// ----------------------------------------------------------------------------------------

void test_manifold_regularization (
    const double intrinsic_regularization_strength
)
{
    cout << "Testing manifold regularization with an intrinsic_regularization_strength of " 
         << intrinsic_regularization_strength << ".\n";

    std::vector<sample_type> samples;

    // Declare an instance of the kernel we will be using.  
    const kernel_type kern(0.1);

    const unsigned long num_points = 100000;

    // create a large dataset with two concentric circles.  There will be 100000 points on each circle
    // for a total of 200000 samples.
    generate_circle(samples, 2, num_points);  // circle of radius 2
    generate_circle(samples, 4, num_points);  // circle of radius 4

    // Create a set of sample_pairs that tells us which samples are "close" and should thus 
    // be classified similarly.  These edges will be used to define the manifold regularizer.
    // To find these edges we use a simple function that samples point pairs randomly and 
    // returns the top 5% with the shortest edges.
    std::vector<sample_pair> edges;
    find_percent_shortest_edges_randomly(samples, squared_euclidean_distance(), 0.05, 1000000, time(0), edges);

    cout << "number of edges generated: " << edges.size() << endl;

    empirical_kernel_map<kernel_type> ekm;

    // Since the circles are not linearly separable we will use an empirical kernel map to 
    // map them into a space where they are separable.  We create an empirical_kernel_map 
    // using a random subset of our data samples as basis samples.  Note, however, that even
    // though the circles are linearly separable in this new space given by the empirical_kernel_map
    // we still won't be able to correctly classify all the points given just the 2 labeled examples.
    // We will need to make use of the nearest neighbor information stored in edges.  To do that
    // we will use the linear_manifold_regularizer.
    ekm.load(kern, randomly_subsample(samples, 50));

    // Project all the samples into the span of our 50 basis samples
    for (unsigned long i = 0; i < samples.size(); ++i)
        samples[i] = ekm.project(samples[i]);


    // Now create the manifold regularizer.  The result is a transformation matrix that
    // embodies the manifold assumption discussed above.  
    linear_manifold_regularizer<sample_type> lmr;
    // use_gaussian_weights is a function object that tells lmr how to weight each edge.  In this
    // case we let the weight decay as edges get longer.  So shorter edges are more important than
    // longer edges.
    lmr.build(samples, edges, use_gaussian_weights(0.1));
    const matrix<double> T = lmr.get_transformation_matrix(intrinsic_regularization_strength);

    // Apply the transformation generated by the linear_manifold_regularizer to 
    // all our samples.
    for (unsigned long i = 0; i < samples.size(); ++i)
        samples[i] = T*samples[i];


    // For convenience, generate a projection_function and merge the transformation
    // matrix T into it.  That is, we will have: proj(x) == T*ekm.project(x).
    projection_function<kernel_type> proj = ekm.get_projection_function();
    proj.weights = T*proj.weights;

    cout << "Running simple test..." << endl;

    // Pick 2 different labeled points.  One on the inner circle and another on the outer.  
    // For each of these test points we will see if using the single plane that separates
    // them is a good way to separate the concentric circles.  We also do this a bunch 
    // of times with different randomly chosen points so we can see how robust the result is.
    for (int itr = 0; itr < 10; ++itr)
    {
        std::vector<sample_type> test_points;
        // generate a random point from the radius 2 circle
        generate_circle(test_points, 2, 1);
        // generate a random point from the radius 4 circle
        generate_circle(test_points, 4, 1);

        // project the two test points into kernel space.  Recall that this projection_function
        // has the manifold regularizer incorporated into it.  
        const sample_type class1_point = proj(test_points[0]);
        const sample_type class2_point = proj(test_points[1]);

        double num_wrong = 0;

        // Now attempt to classify all the data samples according to which point
        // they are closest to.  The output of this program shows that without manifold 
        // regularization this test will fail but with it it will perfectly classify
        // all the points.
        for (unsigned long i = 0; i < samples.size(); ++i)
        {
            double distance_to_class1 = length(samples[i] - class1_point);
            double distance_to_class2 = length(samples[i] - class2_point);

            bool predicted_as_class_1 = (distance_to_class1 < distance_to_class2);

            bool really_is_class_1 = (i < num_points);

            // now count how many times we make a mistake
            if (predicted_as_class_1 != really_is_class_1)
                ++num_wrong;
        }

        cout << "error: "<< num_wrong/samples.size() << endl;
    }

    cout << endl;
}

// ----------------------------------------------------------------------------------------

dlib::rand rnd;

void generate_circle (
    std::vector<sample_type>& samples,
    double radius,
    const long num
)
{
    sample_type m(2,1);

    for (long i = 0; i < num; ++i)
    {
        double sign = 1;
        if (rnd.get_random_double() < 0.5)
            sign = -1;
        m(0) = 2*radius*rnd.get_random_double()-radius;
        m(1) = sign*sqrt(radius*radius - m(0)*m(0));

        samples.push_back(m);
    }
}

// ----------------------------------------------------------------------------------------

