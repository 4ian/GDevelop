// The contents of this file are in the public domain. See LICENSE_FOR_EXAMPLE_PROGRAMS.txt
/*

    This is an example illustrating the use of the empirical_kernel_map 
    from the dlib C++ Library.

    This example program assumes you are familiar with some general elements of 
    the library.  In particular, you should have at least read the svm_ex.cpp 
    and matrix_ex.cpp examples.   


    Most of the machine learning algorithms in dlib are some flavor of "kernel machine".
    This means they are all simple linear algorithms that have been formulated such 
    that the only way they look at the data given by a user is via dot products between
    the data samples.  These algorithms are made more useful via the application of the
    so-called kernel trick.  This trick is to replace the dot product with a user 
    supplied function which takes two samples and returns a real number.  This function 
    is the kernel that is required by so many algorithms.  The most basic kernel is the 
    linear_kernel which is simply a normal dot product.  More interesting, however,
    are kernels which first apply some nonlinear transformation to the user's data samples 
    and then compute a dot product.  In this way, a simple algorithm that finds a linear
    plane to separate data (e.g. the SVM algorithm) can be made to solve complex 
    nonlinear learning problems.  
    
    An important element of the kernel trick is that these kernel functions perform 
    the nonlinear transformation implicitly.  That is, if you look at the implementations
    of these kernel functions you won't see code that transforms two input vectors in 
    some way and then computes their dot products.  Instead you will see a simple function
    that takes two input vectors and just computes a single real number via some simple
    process.  You can basically think of this as an optimization.  Imagine that originally 
    we wrote out the entire procedure to perform the nonlinear transformation and then
    compute the dot product but then noticed we could cancel a few terms here and there 
    and simplify the whole thing down into a more compact and easily evaluated form.
    The result is a nice function that computes what we want but we no longer get to see
    what those nonlinearly transformed input vectors are.  

    The empirical_kernel_map is a tool that undoes this.  It allows you to obtain these 
    nonlinearly transformed vectors.  It does this by taking a set of data samples from 
    the user (referred to as basis samples), applying the nonlinear transformation to all 
    of them, and then constructing a set of orthonormal basis vectors which spans the space 
    occupied by those transformed input samples.  Then if we wish to obtain the nonlinear 
    version of any data sample we can simply project it onto this orthonormal basis and 
    we obtain a regular vector of real numbers which represents the nonlinearly transformed 
    version of the data sample.  The empirical_kernel_map has been formulated to use only 
    dot products between data samples so it is capable of performing this service for any 
    user supplied kernel function. 
    
    The empirical_kernel_map is useful because it is often difficult to formulate an 
    algorithm in a way that uses only dot products.  So the empirical_kernel_map lets 
    us easily kernelize any algorithm we like by using this object during a preprocessing 
    step.  However, it should be noted that the algorithm is only practical when used 
    with at most a few thousand basis samples.  Fortunately, most datasets live in 
    subspaces that are relatively low dimensional.  So for these datasets, using the 
    empirical_kernel_map is practical assuming an appropriate set of basis samples can be 
    selected by the user.  To help with this dlib supplies the linearly_independent_subset_finder.  
    I also often find that just picking a random subset of the data as a basis works well.



    In what follows, we walk through the process of creating an empirical_kernel_map,
    projecting data to obtain the nonlinearly transformed vectors, and then doing a 
    few interesting things with the data.
*/




#include <dlib/svm.h>
#include <dlib/rand.h>
#include <iostream>
#include <vector>


using namespace std;
using namespace dlib;

// ----------------------------------------------------------------------------------------

// First let's make a typedef for the kind of samples we will be using. 
typedef matrix<double, 0, 1> sample_type;

// We will be using the radial_basis_kernel in this example program.
typedef radial_basis_kernel<sample_type> kernel_type;

// ----------------------------------------------------------------------------------------

void generate_concentric_circles (
    std::vector<sample_type>& samples,
    std::vector<double>& labels,
    const int num_points
);
/*!
    requires
        - num_points > 0
    ensures
        - generates two circles centered at the point (0,0), one of radius 1 and
          the other of radius 5.  These points are stored into samples.  labels will
          tell you if a given samples is from the smaller circle (its label will be 1)
          or from the larger circle (its label will be 2).
        - each circle will be made up of num_points
!*/

// ----------------------------------------------------------------------------------------

void test_empirical_kernel_map (
    const std::vector<sample_type>& samples,
    const std::vector<double>& labels,
    const empirical_kernel_map<kernel_type>& ekm
);
/*!
    This function computes various interesting things with the empirical_kernel_map.  
    See its implementation below for details.
!*/

// ----------------------------------------------------------------------------------------

int main()
{
    std::vector<sample_type> samples;
    std::vector<double> labels;

    // Declare an instance of the kernel we will be using.  
    const kernel_type kern(0.1);

    // create a dataset with two concentric circles.  There will be 100 points on each circle.
    generate_concentric_circles(samples, labels, 100);

    empirical_kernel_map<kernel_type> ekm;


    // Here we create an empirical_kernel_map using all of our data samples as basis samples.  
    cout << "\n\nBuilding an empirical_kernel_map with " << samples.size() << " basis samples." << endl;
    ekm.load(kern, samples);
    cout << "Test the empirical_kernel_map when loaded with every sample." << endl;
    test_empirical_kernel_map(samples, labels, ekm);






    // create a new dataset with two concentric circles.  There will be 1000 points on each circle.
    generate_concentric_circles(samples, labels, 1000);
    // Rather than use all 2000 samples as basis samples we are going to use the 
    // linearly_independent_subset_finder to pick out a good basis set.  The idea behind this 
    // object is to try and find the 40 or so samples that best spans the subspace containing all the 
    // data.  
    linearly_independent_subset_finder<kernel_type> lisf(kern, 40);
    // populate lisf with samples.  We have configured it to allow at most 40 samples but this function 
    // may determine that fewer samples are necessary to form a good basis.  In this example program
    // it will select only 26.
    fill_lisf(lisf, samples);

    // Now reload the empirical_kernel_map but this time using only our small basis  
    // selected using the linearly_independent_subset_finder.
    cout << "\n\nBuilding an empirical_kernel_map with " << lisf.size() << " basis samples." << endl;
    ekm.load(lisf);
    cout << "Test the empirical_kernel_map when loaded with samples from the lisf object." << endl;
    test_empirical_kernel_map(samples, labels, ekm);


    cout << endl;
}

// ----------------------------------------------------------------------------------------

void test_empirical_kernel_map (
    const std::vector<sample_type>& samples,
    const std::vector<double>& labels,
    const empirical_kernel_map<kernel_type>& ekm
)
{

    std::vector<sample_type> projected_samples;

    // The first thing we do is compute the nonlinearly projected vectors using the 
    // empirical_kernel_map.  
    for (unsigned long i = 0; i < samples.size(); ++i)
    {
        projected_samples.push_back(ekm.project(samples[i]));
    }

    // Note that a kernel matrix is just a matrix M such that M(i,j) == kernel(samples[i],samples[j]).
    // So below we are computing the normal kernel matrix as given by the radial_basis_kernel and the
    // input samples.  We also compute the kernel matrix for all the projected_samples as given by the 
    // linear_kernel.  Note that the linear_kernel just computes normal dot products.  So what we want to
    // see is that the dot products between all the projected_samples samples are the same as the outputs
    // of the kernel function for their respective untransformed input samples.  If they match then
    // we know that the empirical_kernel_map is working properly.
    const matrix<double> normal_kernel_matrix = kernel_matrix(ekm.get_kernel(), samples);
    const matrix<double> new_kernel_matrix = kernel_matrix(linear_kernel<sample_type>(), projected_samples);

    cout << "Max kernel matrix error: " << max(abs(normal_kernel_matrix - new_kernel_matrix)) << endl;
    cout << "Mean kernel matrix error: " << mean(abs(normal_kernel_matrix - new_kernel_matrix)) << endl;
    /*
        Example outputs from these cout statements.
        For the case where we use all samples as basis samples:
            Max kernel matrix error: 7.32747e-15
            Mean kernel matrix error: 7.47789e-16

        For the case where we use only 26 samples as basis samples:
            Max kernel matrix error: 0.000953573
            Mean kernel matrix error: 2.26008e-05


        Note that if we use enough basis samples we can perfectly span the space of input samples.
        In that case we get errors that are essentially just rounding noise (Moreover, using all the 
        samples is always enough since they are always within their own span).  Once we start 
        to use fewer basis samples we may begin to get approximation error.  In the second case we 
        used 26 and we can see that the data doesn't really lay exactly in a 26 dimensional subspace.  
        But it is pretty close.  
    */



    // Now let's do something more interesting.  The following loop finds the centroids
    // of the two classes of data.
    sample_type class1_center; 
    sample_type class2_center; 
    for (unsigned long i = 0; i < projected_samples.size(); ++i)
    {
        if (labels[i] == 1)
            class1_center += projected_samples[i];
        else
            class2_center += projected_samples[i];
    }

    const int points_per_class = samples.size()/2;
    class1_center /= points_per_class;
    class2_center /= points_per_class;


    // Now classify points by which center they are nearest.  Recall that the data
    // is made up of two concentric circles.  Normally you can't separate two concentric
    // circles by checking which points are nearest to each center since they have the same
    // centers.  However, the kernel trick makes the data separable and the loop below will 
    // perfectly classify each data point.
    for (unsigned long i = 0; i < projected_samples.size(); ++i)
    {
        double distance_to_class1 = length(projected_samples[i] - class1_center);
        double distance_to_class2 = length(projected_samples[i] - class2_center);

        bool predicted_as_class_1 = (distance_to_class1 < distance_to_class2);

        // Now print a message for any misclassified points.
        if (predicted_as_class_1 == true && labels[i] != 1)
            cout << "A point was misclassified" << endl;

        if (predicted_as_class_1 == false && labels[i] != 2)
            cout << "A point was misclassified" << endl;
    }



    // Next, note that classifying a point based on its distance between two other 
    // points is the same thing as using the plane that lies between those two points 
    // as a decision boundary.  So let's compute that decision plane and use it to classify 
    // all the points.
    
    sample_type plane_normal_vector = class1_center - class2_center;
    // The point right in the center of our two classes should be on the deciding plane, not
    // on one side or the other.  This consideration brings us to the formula for the bias.
    double bias = dot((class1_center+class2_center)/2, plane_normal_vector);

    // Now classify points by which side of the plane they are on.
    for (unsigned long i = 0; i < projected_samples.size(); ++i)
    {
        double side = dot(plane_normal_vector, projected_samples[i]) - bias;

        bool predicted_as_class_1 = (side > 0);

        // Now print a message for any misclassified points.
        if (predicted_as_class_1 == true && labels[i] != 1)
            cout << "A point was misclassified" << endl;

        if (predicted_as_class_1 == false && labels[i] != 2)
            cout << "A point was misclassified" << endl;
    }


    // It would be nice to convert this decision rule into a normal decision_function object and
    // dispense with the empirical_kernel_map.  Happily, it is possible to do so.  Consider the
    // following example code:
    decision_function<kernel_type> dec_funct = ekm.convert_to_decision_function(plane_normal_vector);
    // The dec_funct now computes dot products between plane_normal_vector and the projection
    // of any sample point given to it.  All that remains is to account for the bias. 
    dec_funct.b = bias;

    // now classify points by which side of the plane they are on.
    for (unsigned long i = 0; i < samples.size(); ++i)
    {
        double side = dec_funct(samples[i]);

        // And let's just check that the dec_funct really does compute the same thing as the previous equation.
        double side_alternate_equation = dot(plane_normal_vector, projected_samples[i]) - bias;
        if (abs(side-side_alternate_equation) > 1e-14)
            cout << "dec_funct error: " << abs(side-side_alternate_equation) << endl;

        bool predicted_as_class_1 = (side > 0);

        // Now print a message for any misclassified points.
        if (predicted_as_class_1 == true && labels[i] != 1)
            cout << "A point was misclassified" << endl;

        if (predicted_as_class_1 == false && labels[i] != 2)
            cout << "A point was misclassified" << endl;
    }

}

// ----------------------------------------------------------------------------------------

void generate_concentric_circles (
    std::vector<sample_type>& samples,
    std::vector<double>& labels,
    const int num
)
{
    sample_type m(2,1);
    samples.clear();
    labels.clear();

    dlib::rand rnd;

    // make some samples near the origin
    double radius = 1.0;
    for (long i = 0; i < num; ++i)
    {
        double sign = 1;
        if (rnd.get_random_double() < 0.5)
            sign = -1;
        m(0) = 2*radius*rnd.get_random_double()-radius;
        m(1) = sign*sqrt(radius*radius - m(0)*m(0));

        samples.push_back(m);
        labels.push_back(1);
    }

    // make some samples in a circle around the origin but far away
    radius = 5.0;
    for (long i = 0; i < num; ++i)
    {
        double sign = 1;
        if (rnd.get_random_double() < 0.5)
            sign = -1;
        m(0) = 2*radius*rnd.get_random_double()-radius;
        m(1) = sign*sqrt(radius*radius - m(0)*m(0));

        samples.push_back(m);
        labels.push_back(2);
    }
}

// ----------------------------------------------------------------------------------------

