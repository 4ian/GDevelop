// The contents of this file are in the public domain. See LICENSE_FOR_EXAMPLE_PROGRAMS.txt
/*

    This is an example illustrating the use of the kernel ridge regression 
    object from the dlib C++ Library.  

    This example creates a simple set of data to train on and then shows
    you how to use the kernel ridge regression tool to find a good decision 
    function that can classify examples in our data set.


    The data used in this example will be 2 dimensional data and will
    come from a distribution where points with a distance less than 13
    from the origin are labeled +1 and all other points are labeled
    as -1.  All together, the dataset will contain 10201 sample points.
        
*/


#include <iostream>
#include <dlib/svm.h>

using namespace std;
using namespace dlib;


int main()
{
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


    // Now we make objects to contain our samples and their respective labels.
    std::vector<sample_type> samples;
    std::vector<double> labels;

    // Now let's put some data into our samples and labels objects.  We do this
    // by looping over a bunch of points and labeling them according to their
    // distance from the origin.
    for (double r = -20; r <= 20; r += 0.4)
    {
        for (double c = -20; c <= 20; c += 0.4)
        {
            sample_type samp;
            samp(0) = r;
            samp(1) = c;
            samples.push_back(samp);

            // if this point is less than 13 from the origin
            if (sqrt((double)r*r + c*c) <= 13)
                labels.push_back(+1);
            else
                labels.push_back(-1);

        }
    }

    cout << "samples generated: " << samples.size() << endl;
    cout << "  number of +1 samples: " << sum(mat(labels) > 0) << endl;
    cout << "  number of -1 samples: " << sum(mat(labels) < 0) << endl;

    // Here we normalize all the samples by subtracting their mean and dividing by their standard deviation.
    // This is generally a good idea since it often heads off numerical stability problems and also 
    // prevents one large feature from smothering others.  Doing this doesn't matter much in this example
    // so I'm just doing this here so you can see an easy way to accomplish this with 
    // the library.  
    vector_normalizer<sample_type> normalizer;
    // let the normalizer learn the mean and standard deviation of the samples
    normalizer.train(samples);
    // now normalize each sample
    for (unsigned long i = 0; i < samples.size(); ++i)
        samples[i] = normalizer(samples[i]); 


    // here we make an instance of the krr_trainer object that uses our kernel type.
    krr_trainer<kernel_type> trainer;

    // The krr_trainer has the ability to perform leave-one-out cross-validation.
    // It does this to automatically determine the regularization parameter.  Since
    // we are performing classification instead of regression we should be sure to
    // call use_classification_loss_for_loo_cv().  This function tells it to measure 
    // errors in terms of the number of classification mistakes instead of mean squared 
    // error between decision function output values and labels.  
    trainer.use_classification_loss_for_loo_cv();


    // Now we loop over some different gamma values to see how good they are.  
    cout << "\ndoing leave-one-out cross-validation" << endl;
    for (double gamma = 0.000001; gamma <= 1; gamma *= 5)
    {
        // tell the trainer the parameters we want to use
        trainer.set_kernel(kernel_type(gamma));

        // loo_values will contain the LOO predictions for each sample.  In the case
        // of perfect prediction it will end up being a copy of labels.
        std::vector<double> loo_values; 
        trainer.train(samples, labels, loo_values);

        // Print gamma and the fraction of samples correctly classified during LOO cross-validation.
        const double classification_accuracy = mean_sign_agreement(labels, loo_values);
        cout << "gamma: " << gamma << "     LOO accuracy: " << classification_accuracy << endl;
    }


    // From looking at the output of the above loop it turns out that a good value for 
    // gamma for this problem is 0.000625.  So that is what we will use.
    trainer.set_kernel(kernel_type(0.000625));
    typedef decision_function<kernel_type> dec_funct_type;
    typedef normalized_function<dec_funct_type> funct_type;


    // Here we are making an instance of the normalized_function object.  This object provides a convenient 
    // way to store the vector normalization information along with the decision function we are
    // going to learn.  
    funct_type learned_function;
    learned_function.normalizer = normalizer;  // save normalization information
    learned_function.function = trainer.train(samples, labels); // perform the actual training and save the results

    // print out the number of basis vectors in the resulting decision function
    cout << "\nnumber of basis vectors in our learned_function is " 
         << learned_function.function.basis_vectors.size() << endl;

    // Now let's try this decision_function on some samples we haven't seen before.
    // The decision function will return values >= 0 for samples it predicts
    // are in the +1 class and numbers < 0 for samples it predicts to be in the -1 class.
    sample_type sample;

    sample(0) = 3.123;
    sample(1) = 2;
    cout << "This is a +1 class example, the classifier output is " << learned_function(sample) << endl;

    sample(0) = 3.123;
    sample(1) = 9.3545;
    cout << "This is a +1 class example, the classifier output is " << learned_function(sample) << endl;

    sample(0) = 13.123;
    sample(1) = 9.3545;
    cout << "This is a -1 class example, the classifier output is " << learned_function(sample) << endl;

    sample(0) = 13.123;
    sample(1) = 0;
    cout << "This is a -1 class example, the classifier output is " << learned_function(sample) << endl;


    // We can also train a decision function that reports a well conditioned probability 
    // instead of just a number > 0 for the +1 class and < 0 for the -1 class.  An example 
    // of doing that follows:
    typedef probabilistic_decision_function<kernel_type> probabilistic_funct_type;  
    typedef normalized_function<probabilistic_funct_type> pfunct_type;

    // The train_probabilistic_decision_function() is going to perform 3-fold cross-validation.
    // So it is important that the +1 and -1 samples be distributed uniformly across all the folds.
    // calling randomize_samples() will make sure that is the case.   
    randomize_samples(samples, labels);

    pfunct_type learned_pfunct; 
    learned_pfunct.normalizer = normalizer;
    learned_pfunct.function = train_probabilistic_decision_function(trainer, samples, labels, 3);
    // Now we have a function that returns the probability that a given sample is of the +1 class.  

    // print out the number of basis vectors in the resulting decision function.  
    // (it should be the same as in the one above)
    cout << "\nnumber of basis vectors in our learned_pfunct is " 
         << learned_pfunct.function.decision_funct.basis_vectors.size() << endl;

    sample(0) = 3.123;
    sample(1) = 2;
    cout << "This +1 class example should have high probability.  Its probability is: " 
         << learned_pfunct(sample) << endl;

    sample(0) = 3.123;
    sample(1) = 9.3545;
    cout << "This +1 class example should have high probability.  Its probability is: " 
         << learned_pfunct(sample) << endl;

    sample(0) = 13.123;
    sample(1) = 9.3545;
    cout << "This -1 class example should have low probability.  Its probability is: " 
         << learned_pfunct(sample) << endl;

    sample(0) = 13.123;
    sample(1) = 0;
    cout << "This -1 class example should have low probability.  Its probability is: " 
         << learned_pfunct(sample) << endl;



    // Another thing that is worth knowing is that just about everything in dlib is serializable.
    // So for example, you can save the learned_pfunct object to disk and recall it later like so:
    serialize("saved_function.dat") << learned_pfunct;

    // Now let's open that file back up and load the function object it contains.
    deserialize("saved_function.dat") >> learned_pfunct;

}

