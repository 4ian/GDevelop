// The contents of this file are in the public domain. See LICENSE_FOR_EXAMPLE_PROGRAMS.txt
/*

    This is an example that shows some reasonable ways you can perform
    model selection with the dlib C++ Library.  

    It will create a simple set of data and then show you how to use 
    the cross validation and optimization routines to determine good model 
    parameters for the purpose of training an svm to classify the sample data.

    The data used in this example will be 2 dimensional data and will
    come from a distribution where points with a distance less than 10
    from the origin are labeled +1 and all other points are labeled
    as -1.
        

    As an side, you should probably read the svm_ex.cpp and matrix_ex.cpp example 
    programs before you read this one.
*/


#include <iostream>
#include <dlib/svm.h>

using namespace std;
using namespace dlib;

// The svm functions use column vectors to contain a lot of the data on which they 
// operate. So the first thing we do here is declare a convenient typedef.  

// This typedef declares a matrix with 2 rows and 1 column.  It will be the
// object that contains each of our 2 dimensional samples.   
typedef matrix<double, 2, 1> sample_type;

// This is a typedef for the type of kernel we are going to use in this example.
// In this case I have selected the radial basis kernel that can operate on our
// 2D sample_type objects
typedef radial_basis_kernel<sample_type> kernel_type;




class cross_validation_objective
{
    /*!
        WHAT THIS OBJECT REPRESENTS
            This object is a simple function object that takes a set of model
            parameters and returns a number indicating how "good" they are.  It
            does this by performing 10 fold cross validation on our dataset
            and reporting the accuracy.

            See below in main() for how this object gets used. 
    !*/
public:

    cross_validation_objective (
        const std::vector<sample_type>& samples_,
        const std::vector<double>& labels_
    ) : samples(samples_), labels(labels_) {}

    double operator() (
        const matrix<double>& params
    ) const
    {
        // Pull out the two SVM model parameters.  Note that, in this case,
        // I have setup the parameter search to operate in log scale so we have
        // to remember to call exp() to put the parameters back into a normal scale.
        const double gamma = exp(params(0));
        const double nu    = exp(params(1));

        // Make an SVM trainer and tell it what the parameters are supposed to be.
        svm_nu_trainer<kernel_type> trainer;
        trainer.set_kernel(kernel_type(gamma));
        trainer.set_nu(nu);

        // Finally, perform 10-fold cross validation and then print and return the results.
        matrix<double> result = cross_validate_trainer(trainer, samples, labels, 10);
        cout << "gamma: " << setw(11) << gamma << "  nu: " << setw(11) << nu <<  "  cross validation accuracy: " << result;

        // Here I'm returning the harmonic mean between the accuracies of each class.
        // However, you could do something else.  For example, you might care a lot more
        // about correctly predicting the +1 class, so you could penalize results that
        // didn't obtain a high accuracy on that class.  You might do this by using 
        // something like a weighted version of the F1-score (see http://en.wikipedia.org/wiki/F1_score).     
        return 2*prod(result)/sum(result);
    }

    const std::vector<sample_type>& samples;
    const std::vector<double>& labels;

};


int main()
{
    try
    {

        // Now we make objects to contain our samples and their respective labels.
        std::vector<sample_type> samples;
        std::vector<double> labels;

        // Now let's put some data into our samples and labels objects.  We do this
        // by looping over a bunch of points and labeling them according to their
        // distance from the origin.
        for (double r = -20; r <= 20; r += 0.8)
        {
            for (double c = -20; c <= 20; c += 0.8)
            {
                sample_type samp;
                samp(0) = r;
                samp(1) = c;
                samples.push_back(samp);

                // if this point is less than 10 from the origin
                if (sqrt(r*r + c*c) <= 10)
                    labels.push_back(+1);
                else
                    labels.push_back(-1);

            }
        }

        cout << "Generated " << samples.size() << " points" << endl;


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


        // Now that we have some data we want to train on it.  However, there are two parameters to the 
        // training.  These are the nu and gamma parameters.  Our choice for these parameters will 
        // influence how good the resulting decision function is.  To test how good a particular choice 
        // of these parameters is we can use the cross_validate_trainer() function to perform n-fold cross
        // validation on our training data.  However, there is a problem with the way we have sampled 
        // our distribution above.  The problem is that there is a definite ordering to the samples.  
        // That is, the first half of the samples look like they are from a different distribution 
        // than the second half.  This would screw up the cross validation process but we can 
        // fix it by randomizing the order of the samples with the following function call.
        randomize_samples(samples, labels);


        // The nu parameter has a maximum value that is dependent on the ratio of the +1 to -1 
        // labels in the training data.  This function finds that value.  The 0.999 is here because
        // the maximum allowable nu is strictly less than the value returned by maximum_nu().  So
        // rather than dealing with that below we can just back away from it a little bit here and then
        // not worry about it.
        const double max_nu = 0.999*maximum_nu(labels);



        // The first kind of model selection we will do is a simple grid search.  That is, below we just
        // generate a fixed grid of points (each point represents one possible setting of the model parameters)
        // and test each via cross validation.

        // This code generates a 4x4 grid of logarithmically spaced points.  The result is a matrix
        // with 2 rows and 16 columns where each column represents one of our points. 
        matrix<double> params = cartesian_product(logspace(log10(5.0), log10(1e-5), 4),  // gamma parameter
                                                  logspace(log10(max_nu), log10(1e-5), 4) // nu parameter
                                                  );
        // As an aside, if you wanted to do a grid search over points of dimensionality more than two
        // you would just nest calls to cartesian_product().  You can also use linspace() to generate 
        // linearly spaced points if that is more appropriate for the parameters you are working with.   


        // Next we loop over all the points we generated and check how good each is.
        cout << "Doing a grid search" << endl;
        matrix<double> best_result(2,1);
        best_result = 0;
        double best_gamma = 0.1, best_nu;
        for (long col = 0; col < params.nc(); ++col)
        {
            // pull out the current set of model parameters
            const double gamma = params(0, col);
            const double nu    = params(1, col);

            // setup a training object using our current parameters
            svm_nu_trainer<kernel_type> trainer;
            trainer.set_kernel(kernel_type(gamma));
            trainer.set_nu(nu);

            // Finally, do 10 fold cross validation and then check if the results are the best we have seen so far.
            matrix<double> result = cross_validate_trainer(trainer, samples, labels, 10);
            cout << "gamma: " << setw(11) << gamma << "  nu: " << setw(11) << nu <<  "  cross validation accuracy: " << result;

            // save the best results
            if (sum(result) > sum(best_result))
            {
                best_result = result;
                best_gamma = gamma;
                best_nu = nu;
            }
        }

        cout << "\n best result of grid search: " << sum(best_result) << endl;
        cout << " best gamma: " << best_gamma << "   best nu: " << best_nu << endl;



        // Grid search is a very simple brute force method.  Below we try out the BOBYQA algorithm.
        // It is a routine that performs optimization of a function in the absence of derivatives.  

        cout << "\n\n Try the BOBYQA algorithm" << endl;

        // We need to supply a starting point for the optimization.  Here we are using the best
        // result of the grid search.  Generally, you want to try and give a reasonable starting
        // point due to the possibility of the optimization getting stuck in a local maxima.  
        params.set_size(2,1);
        params = best_gamma, // initial gamma
                 best_nu;    // initial nu

        // We also need to supply lower and upper bounds for the search.  
        matrix<double> lower_bound(2,1), upper_bound(2,1);
        lower_bound = 1e-7,   // smallest allowed gamma
                      1e-7;   // smallest allowed nu
        upper_bound = 100,    // largest allowed gamma
                      max_nu; // largest allowed nu


        // For the gamma and nu SVM parameters it is generally a good idea to search
        // in log space.  So I'm just converting them into log space here before
        // we start the optimization.
        params = log(params);
        lower_bound = log(lower_bound);
        upper_bound = log(upper_bound);

        // Finally, ask BOBYQA to look for the best set of parameters.  Note that we are using the
        // cross validation function object defined at the top of the file.
        double best_score = find_max_bobyqa(
            cross_validation_objective(samples, labels), // Function to maximize
            params,                                      // starting point
            params.size()*2 + 1,                         // See BOBYQA docs, generally size*2+1 is a good setting for this
            lower_bound,                                 // lower bound 
            upper_bound,                                 // upper bound
            min(upper_bound-lower_bound)/10,             // search radius
            0.01,                                        // desired accuracy
            100                                          // max number of allowable calls to cross_validation_objective()
            );

        // Don't forget to convert back from log scale to normal scale
        params = exp(params);

        cout << " best result of BOBYQA: " << best_score << endl;
        cout << " best gamma: " << params(0) << "   best nu: " << params(1) << endl;

        // Also note that the find_max_bobyqa() function only works for optimization problems
        // with 2 variables or more.  If you only have a single variable then you should use
        // the find_max_single_variable() function.

    }
    catch (exception& e)
    {
        cout << e.what() << endl;
    }
}

