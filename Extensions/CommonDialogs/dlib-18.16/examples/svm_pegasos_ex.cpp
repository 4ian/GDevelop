// The contents of this file are in the public domain. See LICENSE_FOR_EXAMPLE_PROGRAMS.txt
/*

    This is an example illustrating the use of the dlib C++ library's
    implementation of the pegasos algorithm for online training of support 
    vector machines.   

    This example creates a simple binary classification problem and shows
    you how to train a support vector machine on that data.

    The data used in this example will be 2 dimensional data and will
    come from a distribution where points with a distance less than 10
    from the origin are labeled +1 and all other points are labeled
    as -1.
        
*/


#include <iostream>
#include <ctime>
#include <vector>
#include <dlib/svm.h>

using namespace std;
using namespace dlib;


int main()
{
    // The svm functions use column vectors to contain a lot of the data on which they 
    // operate. So the first thing we do here is declare a convenient typedef.  

    // This typedef declares a matrix with 2 rows and 1 column.  It will be the
    // object that contains each of our 2 dimensional samples.   (Note that if you wanted 
    // more than 2 features in this vector you can simply change the 2 to something else.
    // Or if you don't know how many features you want until runtime then you can put a 0
    // here and use the matrix.set_size() member function)
    typedef matrix<double, 2, 1> sample_type;


    // This is a typedef for the type of kernel we are going to use in this example.
    // In this case I have selected the radial basis kernel that can operate on our
    // 2D sample_type objects
    typedef radial_basis_kernel<sample_type> kernel_type;


    // Here we create an instance of the pegasos svm trainer object we will be using.
    svm_pegasos<kernel_type> trainer;
    // Here we setup the parameters to this object.  See the dlib documentation for a 
    // description of what these parameters are. 
    trainer.set_lambda(0.00001);
    trainer.set_kernel(kernel_type(0.005));

    // Set the maximum number of support vectors we want the trainer object to use
    // in representing the decision function it is going to learn.  In general, 
    // supplying a bigger number here will only ever give you a more accurate
    // answer.  However, giving a smaller number will make the algorithm run
    // faster and decision rules that involve fewer support vectors also take
    // less time to evaluate.  
    trainer.set_max_num_sv(10);

    std::vector<sample_type> samples;
    std::vector<double> labels;

    // make an instance of a sample matrix so we can use it below
    sample_type sample, center;

    center = 20, 20;

    // Now let's go into a loop and randomly generate 1000 samples.
    srand(time(0));
    for (int i = 0; i < 10000; ++i)
    {
        // Make a random sample vector. 
        sample = randm(2,1)*40 - center;

        // Now if that random vector is less than 10 units from the origin then it is in 
        // the +1 class.
        if (length(sample) <= 10)
        {
            // let the svm_pegasos learn about this sample
            trainer.train(sample,+1);

            // save this sample so we can use it with the batch training examples below
            samples.push_back(sample);
            labels.push_back(+1);
        }
        else
        {
            // let the svm_pegasos learn about this sample
            trainer.train(sample,-1);

            // save this sample so we can use it with the batch training examples below
            samples.push_back(sample);
            labels.push_back(-1);
        }
    }

    // Now we have trained our SVM.  Let's see how well it did.  
    // Each of these statements prints out the output of the SVM given a particular sample.  
    // The SVM outputs a number > 0 if a sample is predicted to be in the +1 class and < 0 
    // if a sample is predicted to be in the -1 class.

    sample(0) = 3.123;
    sample(1) = 4;
    cout << "This is a +1 example, its SVM output is: " << trainer(sample) << endl;

    sample(0) = 13.123;
    sample(1) = 9.3545;
    cout << "This is a -1 example, its SVM output is: " << trainer(sample) << endl;

    sample(0) = 13.123;
    sample(1) = 0;
    cout << "This is a -1 example, its SVM output is: " << trainer(sample) << endl;





    // The previous part of this example program showed you how to perform online training
    // with the pegasos algorithm.  But it is often the case that you have a dataset and you 
    // just want to perform batch learning on that dataset and get the resulting decision
    // function.  To support this the dlib library provides functions for converting an online
    // training object like svm_pegasos into a batch training object.  

    // First let's clear out anything in the trainer object.
    trainer.clear();

    // Now to begin with, you might want to compute the cross validation score of a trainer object
    // on your data.  To do this you should use the batch_cached() function to convert the svm_pegasos object
    // into a batch training object.  Note that the second argument to batch_cached() is the minimum 
    // learning rate the trainer object must report for the batch_cached() function to consider training
    // complete.  So smaller values of this parameter cause training to take longer but may result
    // in a more accurate solution. 
    // Here we perform 4-fold cross validation and print the results
    cout << "cross validation: " << cross_validate_trainer(batch_cached(trainer,0.1), samples, labels, 4);

    // Here is an example of creating a decision function.  Note that we have used the verbose_batch_cached()
    // function instead of batch_cached() as above.  They do the same things except verbose_batch_cached() will
    // print status messages to standard output while training is under way.
    decision_function<kernel_type> df = verbose_batch_cached(trainer,0.1).train(samples, labels);

    // At this point we have obtained a decision function from the above batch mode training.
    // Now we can use it on some test samples exactly as we did above.

    sample(0) = 3.123;
    sample(1) = 4;
    cout << "This is a +1 example, its SVM output is: " << df(sample) << endl;

    sample(0) = 13.123;
    sample(1) = 9.3545;
    cout << "This is a -1 example, its SVM output is: " << df(sample) << endl;

    sample(0) = 13.123;
    sample(1) = 0;
    cout << "This is a -1 example, its SVM output is: " << df(sample) << endl;


}

