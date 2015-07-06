// The contents of this file are in the public domain. See LICENSE_FOR_EXAMPLE_PROGRAMS.txt
/*

    This is an example showing how to use sparse feature vectors with
    the dlib C++ library's machine learning tools.

    This example creates a simple binary classification problem and shows
    you how to train a support vector machine on that data.

    The data used in this example will be 100 dimensional data and will
    come from a simple linearly separable distribution.  
*/


#include <iostream>
#include <ctime>
#include <vector>
#include <dlib/svm.h>

using namespace std;
using namespace dlib;


int main()
{
    // In this example program we will be dealing with feature vectors that are sparse (i.e. most
    // of the values in each vector are zero).  So rather than using a dlib::matrix we can use
    // one of the containers from the STL to represent our sample vectors.  In particular, we 
    // can use the std::map to represent sparse vectors.  (Note that you don't have to use std::map.
    // Any STL container of std::pair objects that is sorted can be used.  So for example, you could 
    // use a std::vector<std::pair<unsigned long,double> > here so long as you took care to sort every vector)
    typedef std::map<unsigned long,double> sample_type;


    // This is a typedef for the type of kernel we are going to use in this example.
    // Since our data is linearly separable I picked the linear kernel.  Note that if you
    // are using a sparse vector representation like std::map then you have to use a kernel
    // meant to be used with that kind of data type.  
    typedef sparse_linear_kernel<sample_type> kernel_type;


    // Here we create an instance of the pegasos svm trainer object we will be using.
    svm_pegasos<kernel_type> trainer;
    // Here we setup a parameter to this object.  See the dlib documentation for a 
    // description of what this parameter does. 
    trainer.set_lambda(0.00001);

    // Let's also use the svm trainer specially optimized for the linear_kernel and
    // sparse_linear_kernel.
    svm_c_linear_trainer<kernel_type> linear_trainer;
    // This trainer solves the "C" formulation of the SVM.  See the documentation for
    // details.
    linear_trainer.set_c(10);

    std::vector<sample_type> samples;
    std::vector<double> labels;

    // make an instance of a sample vector so we can use it below
    sample_type sample;


    // Now let's go into a loop and randomly generate 10000 samples.
    srand(time(0));
    double label = +1;
    for (int i = 0; i < 10000; ++i)
    {
        // flip this flag
        label *= -1;

        sample.clear();

        // now make a random sparse sample with at most 10 non-zero elements
        for (int j = 0; j < 10; ++j)
        {
            int idx = std::rand()%100;
            double value = static_cast<double>(std::rand())/RAND_MAX;

            sample[idx] = label*value;
        }

        // let the svm_pegasos learn about this sample.  
        trainer.train(sample,label);

        // Also save the samples we are generating so we can let the svm_c_linear_trainer
        // learn from them below.  
        samples.push_back(sample);
        labels.push_back(label);
    }

    // In addition to the rule we learned with the pegasos trainer, let's also use our
    // linear_trainer to learn a decision rule.
    decision_function<kernel_type> df = linear_trainer.train(samples, labels);

    // Now we have trained our SVMs.  Let's test them out a bit.  
    // Each of these statements prints the output of the SVMs given a particular sample.  
    // Each SVM outputs a number > 0 if a sample is predicted to be in the +1 class and < 0 
    // if a sample is predicted to be in the -1 class.


    sample.clear();
    sample[4] = 0.3;
    sample[10] = 0.9;
    cout << "This is a +1 example, its SVM output is: " << trainer(sample) << endl;
    cout << "df: " << df(sample) << endl;

    sample.clear();
    sample[83] = -0.3;
    sample[26] = -0.9;
    sample[58] = -0.7;
    cout << "This is a -1 example, its SVM output is: " << trainer(sample) << endl;
    cout << "df: " << df(sample) << endl;

    sample.clear();
    sample[0] = -0.2;
    sample[9] = -0.8;
    cout << "This is a -1 example, its SVM output is: " << trainer(sample) << endl;
    cout << "df: " << df(sample) << endl;

}

