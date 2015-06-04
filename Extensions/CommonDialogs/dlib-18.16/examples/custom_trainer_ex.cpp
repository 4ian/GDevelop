// The contents of this file are in the public domain. See LICENSE_FOR_EXAMPLE_PROGRAMS.txt
/*
    This example program shows you how to create your own custom binary classification
    trainer object and use it with the multiclass classification tools in the dlib C++
    library.  This example assumes you have already become familiar with the concepts
    introduced in the multiclass_classification_ex.cpp example program.


    In this example we will create a very simple trainer object that takes a binary
    classification problem and produces a decision rule which says a test point has the
    same class as whichever centroid it is closest to.  

    The multiclass training dataset will consist of four classes.  Each class will be a blob 
    of points in one of the quadrants of the cartesian plane.   For fun, we will use 
    std::string labels and therefore the labels of these classes will be the following:
        "upper_left",
        "upper_right",
        "lower_left",
        "lower_right"
*/

#include <dlib/svm_threaded.h>

#include <iostream>
#include <vector>

#include <dlib/rand.h>

using namespace std;
using namespace dlib;

// Our data will be 2-dimensional data. So declare an appropriate type to contain these points.
typedef matrix<double,2,1> sample_type;

// ----------------------------------------------------------------------------------------

struct custom_decision_function
{
    /*!
        WHAT THIS OBJECT REPRESENTS
            This object is the representation of our binary decision rule.  
    !*/

    // centers of the two classes
    sample_type positive_center, negative_center;

    double operator() (
        const sample_type& x
    ) const
    {
        // if x is closer to the positive class then return +1 
        if (length(positive_center - x) < length(negative_center - x))
            return +1;
        else
            return -1;
    }
};

// Later on in this example we will save our decision functions to disk.  This
// pair of routines is needed for this functionality.
void serialize (const custom_decision_function& item, std::ostream& out)
{
    // write the state of item to the output stream
    serialize(item.positive_center, out);
    serialize(item.negative_center, out);
}

void deserialize (custom_decision_function& item, std::istream& in)
{
    // read the data from the input stream and store it in item
    deserialize(item.positive_center, in);
    deserialize(item.negative_center, in);
}

// ----------------------------------------------------------------------------------------

class simple_custom_trainer
{
    /*!
        WHAT THIS OBJECT REPRESENTS
            This is our example custom binary classifier trainer object.  It simply 
            computes the means of the +1 and -1 classes, puts them into our 
            custom_decision_function, and returns the results.

            Below we define the train() function.  I have also included the
            requires/ensures definition for a generic binary classifier's train()
    !*/
public:


    custom_decision_function train (
        const std::vector<sample_type>& samples,
        const std::vector<double>& labels
    ) const
    /*!
        requires
            - is_binary_classification_problem(samples, labels) == true
              (e.g. labels consists of only +1 and -1 values, samples.size() == labels.size())
        ensures
            - returns a decision function F with the following properties:
                - if (new_x is a sample predicted have +1 label) then
                    - F(new_x) >= 0
                - else
                    - F(new_x) < 0
    !*/
    {
        sample_type positive_center, negative_center;

        // compute sums of each class 
        positive_center = 0;
        negative_center = 0;
        for (unsigned long i = 0; i < samples.size(); ++i)
        {
            if (labels[i] == +1)
                positive_center += samples[i];
            else // this is a -1 sample
                negative_center += samples[i];
        }

        // divide by number of +1 samples
        positive_center /= sum(mat(labels) == +1);
        // divide by number of -1 samples
        negative_center /= sum(mat(labels) == -1);

        custom_decision_function df;
        df.positive_center = positive_center;
        df.negative_center = negative_center;

        return df;
    }
};

// ----------------------------------------------------------------------------------------

void generate_data (
    std::vector<sample_type>& samples,
    std::vector<string>& labels
);
/*!
    ensures
        - make some four class data as described above.  
        - each class will have 50 samples in it
!*/

// ----------------------------------------------------------------------------------------

int main()
{
    std::vector<sample_type> samples;
    std::vector<string> labels;

    // First, get our labeled set of training data
    generate_data(samples, labels);

    cout << "samples.size(): "<< samples.size() << endl;

    // Define the trainer we will use.  The second template argument specifies the type
    // of label used, which is string in this case.
    typedef one_vs_one_trainer<any_trainer<sample_type>, string> ovo_trainer;


    ovo_trainer trainer;

    // Now tell the one_vs_one_trainer that, by default, it should use the simple_custom_trainer
    // to solve the individual binary classification subproblems.
    trainer.set_trainer(simple_custom_trainer());

    // Next, to make things a little more interesting, we will setup the one_vs_one_trainer
    // to use kernel ridge regression to solve the upper_left vs lower_right binary classification
    // subproblem.  
    typedef radial_basis_kernel<sample_type> rbf_kernel;
    krr_trainer<rbf_kernel> rbf_trainer;
    rbf_trainer.set_kernel(rbf_kernel(0.1));
    trainer.set_trainer(rbf_trainer, "upper_left", "lower_right");


    // Now let's do 5-fold cross-validation using the one_vs_one_trainer we just setup.
    // As an aside, always shuffle the order of the samples before doing cross validation.  
    // For a discussion of why this is a good idea see the svm_ex.cpp example.
    randomize_samples(samples, labels);
    cout << "cross validation: \n" << cross_validate_multiclass_trainer(trainer, samples, labels, 5) << endl;
    // This dataset is very easy and everything is correctly classified.  Therefore, the output of 
    // cross validation is the following confusion matrix.
    /*
        50  0  0  0 
         0 50  0  0 
         0  0 50  0 
         0  0  0 50 
    */


    // We can also obtain the decision rule as always.
    one_vs_one_decision_function<ovo_trainer> df = trainer.train(samples, labels);

    cout << "predicted label: "<< df(samples[0])  << ", true label: "<< labels[0] << endl;
    cout << "predicted label: "<< df(samples[90]) << ", true label: "<< labels[90] << endl;
    // The output is:
    /*
        predicted label: upper_right, true label: upper_right
        predicted label: lower_left, true label: lower_left
    */


    // Finally, let's save our multiclass decision rule to disk.  Remember that we have
    // to specify the types of binary decision function used inside the one_vs_one_decision_function.
    one_vs_one_decision_function<ovo_trainer, 
            custom_decision_function,                             // This is the output of the simple_custom_trainer 
            decision_function<radial_basis_kernel<sample_type> >  // This is the output of the rbf_trainer
        > df2, df3;

    df2 = df;
    // save to a file called df.dat
    serialize("df.dat") << df2;

    // load the function back in from disk and store it in df3.  
    deserialize("df.dat") >> df3;


    // Test df3 to see that this worked.
    cout << endl;
    cout << "predicted label: "<< df3(samples[0])  << ", true label: "<< labels[0] << endl;
    cout << "predicted label: "<< df3(samples[90]) << ", true label: "<< labels[90] << endl;
    // Test df3 on the samples and labels and print the confusion matrix.
    cout << "test deserialized function: \n" << test_multiclass_decision_function(df3, samples, labels) << endl;

}

// ----------------------------------------------------------------------------------------

void generate_data (
    std::vector<sample_type>& samples,
    std::vector<string>& labels
)
{
    const long num = 50;

    sample_type m;

    dlib::rand rnd;


    // add some points in the upper right quadrant
    m = 10, 10;
    for (long i = 0; i < num; ++i)
    {
        samples.push_back(m + randm(2,1,rnd));
        labels.push_back("upper_right");
    }

    // add some points in the upper left quadrant
    m = -10, 10;
    for (long i = 0; i < num; ++i)
    {
        samples.push_back(m + randm(2,1,rnd));
        labels.push_back("upper_left");
    }

    // add some points in the lower right quadrant
    m = 10, -10;
    for (long i = 0; i < num; ++i)
    {
        samples.push_back(m + randm(2,1,rnd));
        labels.push_back("lower_right");
    }

    // add some points in the lower left quadrant
    m = -10, -10;
    for (long i = 0; i < num; ++i)
    {
        samples.push_back(m + randm(2,1,rnd));
        labels.push_back("lower_left");
    }

}

// ----------------------------------------------------------------------------------------

