// The contents of this file are in the public domain. See LICENSE_FOR_EXAMPLE_PROGRAMS.txt
/*

    This is an example showing how to define custom kernel functions for use with 
    the machine learning tools in the dlib C++ Library.

    This example assumes you are somewhat familiar with the machine learning
    tools in dlib.  In particular, you should be familiar with the krr_trainer
    and the matrix object.  So you may want to read the krr_classification_ex.cpp
    and matrix_ex.cpp example programs if you haven't already.
*/


#include <iostream>
#include <dlib/svm.h>

using namespace std;
using namespace dlib;

// ----------------------------------------------------------------------------------------

/*
    Here we define our new kernel.  It is the UKF kernel from 
        Facilitating the applications of support vector machine by using a new kernel
        by Rui Zhang and Wenjian Wang.


    
    In the context of the dlib library a kernel function object is an object with 
    an interface with the following properties:
        - a public typedef named sample_type
        - a public typedef named scalar_type which should be a float, double, or 
          long double type.
        - an overloaded operator() that operates on two items of sample_type 
          and returns a scalar_type.  
        - a public typedef named mem_manager_type that is an implementation of 
          dlib/memory_manager/memory_manager_kernel_abstract.h or
          dlib/memory_manager_global/memory_manager_global_kernel_abstract.h or
          dlib/memory_manager_stateless/memory_manager_stateless_kernel_abstract.h 
        - an overloaded == operator that tells you if two kernels are
          identical or not.

    Below we define such a beast for the UKF kernel.  In this case we are expecting the 
    sample type (i.e. the T type) to be a dlib::matrix.  However, note that you can design 
    kernels which operate on any type you like so long as you meet the above requirements.
*/

template < typename T >
struct ukf_kernel
{
    typedef typename T::type             scalar_type;
    typedef          T                   sample_type;
    // If your sample type, the T, doesn't have a memory manager then
    // you can use dlib::default_memory_manager here.
    typedef typename T::mem_manager_type mem_manager_type;

    ukf_kernel(const scalar_type g) : sigma(g) {}
    ukf_kernel() : sigma(0.1) {}

    scalar_type sigma;

    scalar_type operator() (
        const sample_type& a,
        const sample_type& b
    ) const
    { 
        // This is the formula for the UKF kernel from the above referenced paper.
        return 1/(length_squared(a-b) + sigma);
    }

    bool operator== (
        const ukf_kernel& k
    ) const
    {
        return sigma == k.sigma;
    }
};

// ----------------------------------------------------------------------------------------

/*
    Here we define serialize() and deserialize() functions for our new kernel.  Defining
    these functions is optional.  However, if you don't define them you won't be able
    to save your learned decision_function objects to disk. 
*/

template < typename T >
void serialize ( const ukf_kernel<T>& item, std::ostream& out)
{
    // save the state of the kernel to the output stream
    serialize(item.sigma, out);
}

template < typename T >
void deserialize ( ukf_kernel<T>& item, std::istream& in )
{
    deserialize(item.sigma, in);
}

// ----------------------------------------------------------------------------------------

/*
    This next thing, the kernel_derivative specialization is optional.  You only need
    to define it if you want to use the dlib::reduced2() or dlib::approximate_distance_function() 
    routines.  If so, then you need to supply code for computing the derivative of your kernel as 
    shown below.  Note also that you can only do this if your kernel operates on dlib::matrix
    objects which represent column vectors.
*/

namespace dlib
{
    template < typename T >
    struct kernel_derivative<ukf_kernel<T> >
    {
        typedef typename T::type             scalar_type;
        typedef          T                   sample_type;
        typedef typename T::mem_manager_type mem_manager_type;

        kernel_derivative(const ukf_kernel<T>& k_) : k(k_){}

        sample_type operator() (const sample_type& x, const sample_type& y) const
        {
            // return the derivative of the ukf kernel with respect to the second argument (i.e. y)
            return 2*(x-y)*std::pow(k(x,y),2);
        }

        const ukf_kernel<T>& k;
    };
}

// ----------------------------------------------------------------------------------------

int main()
{
    // We are going to be working with 2 dimensional samples and trying to perform
    // binary classification on them using our new ukf_kernel.
    typedef matrix<double, 2, 1> sample_type;

    typedef ukf_kernel<sample_type> kernel_type;


    // Now let's generate some training data
    std::vector<sample_type> samples;
    std::vector<double> labels;
    for (double r = -20; r <= 20; r += 0.9)
    {
        for (double c = -20; c <= 20; c += 0.9)
        {
            sample_type samp;
            samp(0) = r;
            samp(1) = c;
            samples.push_back(samp);

            // if this point is less than 13 from the origin
            if (sqrt(r*r + c*c) <= 13)
                labels.push_back(+1);
            else
                labels.push_back(-1);

        }
    }
    cout << "samples generated: " << samples.size() << endl;
    cout << "  number of +1 samples: " << sum(mat(labels) > 0) << endl;
    cout << "  number of -1 samples: " << sum(mat(labels) < 0) << endl;


    // A valid kernel must always give rise to kernel matrices which are symmetric 
    // and positive semidefinite (i.e. have nonnegative eigenvalues).  This next
    // bit of code makes a kernel matrix and checks if it has these properties.
    const matrix<double> K = kernel_matrix(kernel_type(0.1), randomly_subsample(samples, 500));
    cout << "\nIs it symmetric? (this value should be 0): "<< min(abs(K - trans(K))) << endl;
    cout << "Smallest eigenvalue (should be >= 0):      "  << min(real_eigenvalues(K)) << endl;


    // here we make an instance of the krr_trainer object that uses our new kernel.
    krr_trainer<kernel_type> trainer;
    trainer.use_classification_loss_for_loo_cv();


    // Finally, let's test how good our new kernel is by doing some leave-one-out cross-validation.
    cout << "\ndoing leave-one-out cross-validation" << endl;
    for (double sigma = 0.01; sigma <= 100; sigma *= 3)
    {
        // tell the trainer the parameters we want to use
        trainer.set_kernel(kernel_type(sigma));

        std::vector<double> loo_values; 
        trainer.train(samples, labels, loo_values);

        // Print sigma and the fraction of samples correctly classified during LOO cross-validation.
        const double classification_accuracy = mean_sign_agreement(labels, loo_values);
        cout << "sigma: " << sigma << "     LOO accuracy: " << classification_accuracy << endl;
    }




    const kernel_type kern(10);
    // Since it is very easy to make a mistake while coding a derivative it is a good idea
    // to compare your derivative function against a numerical approximation and see if
    // the results are similar.  If they are very different then you probably made a 
    // mistake.  So here we compare the results at a test point. 
    cout << "\nThese vectors should match, if they don't then we coded the kernel_derivative wrong!" << endl;
    cout << "approximate derivative: \n" <<               derivative(kern)(samples[0],samples[100]) << endl;
    cout << "exact derivative: \n" << kernel_derivative<kernel_type>(kern)(samples[0],samples[100]) << endl;

}

