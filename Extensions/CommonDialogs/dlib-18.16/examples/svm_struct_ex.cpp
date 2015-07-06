// The contents of this file are in the public domain. See LICENSE_FOR_EXAMPLE_PROGRAMS.txt
/*

    This is an example illustrating the use of the structural SVM solver from the dlib C++
    Library.  Therefore, this example teaches you the central ideas needed to setup a
    structural SVM model for your machine learning problems.  To illustrate the process, we
    use dlib's structural SVM solver to learn the parameters of a simple multi-class
    classifier.  We first discuss the multi-class classifier model and then walk through
    using the structural SVM tools to find the parameters of this classification model.   

*/


#include <iostream>
#include <dlib/svm_threaded.h>

using namespace std;
using namespace dlib;


// Before we start, we define three typedefs we will use throughout this program.  The
// first is used to represent the parameter vector the structural SVM is learning, the
// second is used to represent the "sample type".  In this example program it is just a
// vector but in general when using a structural SVM your sample type can be anything you
// want (e.g. a string or an image).  The last typedef is the type used to represent the
// PSI vector which is part of the structural SVM model which we will explain in detail
// later on.  But the important thing to note here is that you can use either a dense
// representation (i.e. a dlib::matrix object) or a sparse representation for the PSI
// vector.  See svm_sparse_ex.cpp for an introduction to sparse vectors in dlib.  Here we
// use the same type for each of these three things to keep the example program simple.
typedef matrix<double,0,1> column_vector;       // Must be a dlib::matrix type.
typedef matrix<double,0,1> sample_type;         // Can be anything you want.
typedef matrix<double,0,1> feature_vector_type; // Must be dlib::matrix or some kind of sparse vector.

// ----------------------------------------------------------------------------------------

int           predict_label                (const column_vector& weights, const sample_type& sample);
column_vector train_three_class_classifier (const std::vector<sample_type>& samples, const std::vector<int>& labels);

// ----------------------------------------------------------------------------------------

int main()
{
    // In this example, we have three types of samples: class 0, 1, or 2.  That is, each of
    // our sample vectors falls into one of three classes.  To keep this example very
    // simple, each sample vector is zero everywhere except at one place.  The non-zero
    // dimension of each vector determines the class of the vector.  So for example, the
    // first element of samples has a class of 1 because samples[0](1) is the only non-zero
    // element of samples[0].   
    sample_type samp(3);
    std::vector<sample_type> samples;
    samp = 0,2,0; samples.push_back(samp);
    samp = 1,0,0; samples.push_back(samp);
    samp = 0,4,0; samples.push_back(samp);
    samp = 0,0,3; samples.push_back(samp);
    // Since we want to use a machine learning method to learn a 3-class classifier we need
    // to record the labels of our samples.  Here samples[i] has a class label of labels[i].
    std::vector<int> labels;
    labels.push_back(1);
    labels.push_back(0);
    labels.push_back(1);
    labels.push_back(2);


    // Now that we have some training data we can tell the structural SVM to learn the
    // parameters of our 3-class classifier model.  The details of this will be explained
    // later.  For now, just note that it finds the weights (i.e. a vector of real valued
    // parameters) such that predict_label(weights, sample) always returns the correct
    // label for a sample vector. 
    column_vector weights = train_three_class_classifier(samples, labels);

    // Print the weights and then evaluate predict_label() on each of our training samples.
    // Note that the correct label is predicted for each sample.
    cout << weights << endl;
    for (unsigned long i = 0; i < samples.size(); ++i)
        cout << "predicted label for sample["<<i<<"]: " << predict_label(weights, samples[i]) << endl;
}

// ----------------------------------------------------------------------------------------

int predict_label (
    const column_vector& weights,
    const sample_type& sample
)
/*!
    requires
        - weights.size() == 9
        - sample.size() == 3
    ensures
        - Given the 9-dimensional weight vector which defines a 3 class classifier, this
          function predicts the class of the given 3-dimensional sample vector.
          Therefore, the output of this function is either 0, 1, or 2 (i.e. one of the
          three possible labels).
!*/
{
    // Our 3-class classifier model can be thought of as containing 3 separate linear
    // classifiers.  So to predict the class of a sample vector we evaluate each of these
    // three classifiers and then whatever classifier has the largest output "wins" and
    // predicts the label of the sample.  This is the popular one-vs-all multi-class
    // classifier model.  
    //
    // Keeping this in mind, the code below simply pulls the three separate weight vectors
    // out of weights and then evaluates each against sample.  The individual classifier
    // scores are stored in scores and the highest scoring index is returned as the label.
    column_vector w0, w1, w2;
    w0 = rowm(weights, range(0,2));
    w1 = rowm(weights, range(3,5));
    w2 = rowm(weights, range(6,8));

    column_vector scores(3);
    scores = dot(w0, sample), dot(w1, sample), dot(w2, sample);

    return index_of_max(scores);
}

// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------

class three_class_classifier_problem : public structural_svm_problem_threaded<column_vector, feature_vector_type>
{
    /*!
        Now we arrive at the meat of this example program.  To use dlib's structural SVM
        solver you need to define an object which tells the structural SVM solver what to
        do for your problem.  In this example, this is done by defining the three_class_classifier_problem 
        object which inherits from structural_svm_problem_threaded.  Before we get into the
        details, we first discuss some background information on structural SVMs.  
        
        A structural SVM is a supervised machine learning method for learning to predict
        complex outputs.  This is contrasted with a binary classifier which makes only simple
        yes/no predictions.  A structural SVM, on the other hand, can learn to predict
        complex outputs such as entire parse trees or DNA sequence alignments.  To do this,
        it learns a function F(x,y) which measures how well a particular data sample x
        matches a label y, where a label is potentially a complex thing like a parse tree.
        However, to keep this example program simple we use only a 3 category label output. 
       
        At test time, the best label for a new x is given by the y which maximizes F(x,y).
        To put this into the context of the current example, F(x,y) computes the score for
        a given sample and class label.  The predicted class label is therefore whatever
        value of y which makes F(x,y) the biggest.  This is exactly what predict_label()
        does.  That is, it computes F(x,0), F(x,1), and F(x,2) and then reports which label
        has the biggest value.
       
        At a high level, a structural SVM can be thought of as searching the parameter space
        of F(x,y) for the set of parameters that make the following inequality true as often
        as possible:
            F(x_i,y_i) > max{over all incorrect labels of x_i} F(x_i, y_incorrect)
        That is, it seeks to find the parameter vector such that F(x,y) always gives the
        highest score to the correct output.  To define the structural SVM optimization
        problem precisely, we first introduce some notation:
            - let PSI(x,y)    == the joint feature vector for input x and a label y.
            - let F(x,y|w)    == dot(w,PSI(x,y)).  
              (we use the | notation to emphasize that F() has the parameter vector of
              weights called w)
            - let LOSS(idx,y) == the loss incurred for predicting that the idx-th training 
              sample has a label of y.  Note that LOSS() should always be >= 0 and should
              become exactly 0 when y is the correct label for the idx-th sample.  Moreover,
              it should notionally indicate how bad it is to predict y for the idx'th sample.
            - let x_i == the i-th training sample.
            - let y_i == the correct label for the i-th training sample.
            - The number of data samples is N.
       
        Then the optimization problem solved by dlib's structural SVM solver is the following:
            Minimize: h(w) == 0.5*dot(w,w) + C*R(w)
       
            Where R(w) == sum from i=1 to N: 1/N * sample_risk(i,w)
            and sample_risk(i,w) == max over all Y: LOSS(i,Y) + F(x_i,Y|w) - F(x_i,y_i|w)
            and C > 0
       
        You can think of the sample_risk(i,w) as measuring the degree of error you would make
        when predicting the label of the i-th sample using parameters w.  That is, it is zero
        only when the correct label would be predicted and grows larger the more "wrong" the
        predicted output becomes.  Therefore, the objective function is minimizing a balance
        between making the weights small (typically this reduces overfitting) and fitting the
        training data.  The degree to which you try to fit the data is controlled by the C
        parameter.
       
        For a more detailed introduction to structured support vector machines you should
        consult the following paper: 
            Predicting Structured Objects with Support Vector Machines by 
            Thorsten Joachims, Thomas Hofmann, Yisong Yue, and Chun-nam Yu
       
    !*/

public:

    // Finally, we come back to the code.  To use dlib's structural SVM solver you need to
    // provide the things discussed above.  This is the number of training samples, the
    // dimensionality of PSI(), as well as methods for calculating the loss values and
    // PSI() vectors.  You will also need to write code that can compute: max over all Y:
    // LOSS(i,Y) + F(x_i,Y|w).  In particular, the three_class_classifier_problem class is
    // required to implement the following four virtual functions:
    //   - get_num_dimensions()
    //   - get_num_samples() 
    //   - get_truth_joint_feature_vector()
    //   - separation_oracle()


    // But first, we declare a constructor so we can populate our three_class_classifier_problem
    // object with the data we need to define our machine learning problem.  All we do here
    // is take in the training samples and their labels as well as a number indicating how
    // many threads the structural SVM solver will use.  You can declare this constructor
    // any way you like since it is not used by any of the dlib tools.
    three_class_classifier_problem (
        const std::vector<sample_type>& samples_,
        const std::vector<int>& labels_,
        const unsigned long num_threads
    ) : 
        structural_svm_problem_threaded<column_vector, feature_vector_type>(num_threads),
        samples(samples_),
        labels(labels_)
    {}

    feature_vector_type make_psi (
        const sample_type& x,
        const int label
    ) const
    /*!
        ensures
            - returns the vector PSI(x,label)
    !*/
    {
        // All we are doing here is taking x, which is a 3 dimensional sample vector in this
        // example program, and putting it into one of 3 places in a 9 dimensional PSI
        // vector, which we then return.  So this function returns PSI(x,label).  To see why
        // we setup PSI like this, recall how predict_label() works.  It takes in a 9
        // dimensional weight vector and breaks the vector into 3 pieces.  Each piece then
        // defines a different classifier and we use them in a one-vs-all manner to predict
        // the label.  So now that we are in the structural SVM code we have to define the
        // PSI vector to correspond to this usage.  That is, we need to setup PSI so that
        // argmax_y dot(weights,PSI(x,y)) == predict_label(weights,x).  This is how we tell
        // the structural SVM solver what kind of problem we are trying to solve.
        //
        // It's worth emphasizing that the single biggest step in using a structural SVM is
        // deciding how you want to represent PSI(x,label).  It is always a vector, but
        // deciding what to put into it to solve your problem is often not a trivial task.
        // Part of the difficulty is that you need an efficient method for finding the label
        // that makes dot(w,PSI(x,label)) the biggest.  Sometimes this is easy, but often
        // finding the max scoring label turns into a difficult combinatorial optimization
        // problem.  So you need to pick a PSI that doesn't make the label maximization step
        // intractable but also still well models your problem.  
        //
        // Finally, note that make_psi() is a helper routine we define in this example.  In
        // general, you are not required to implement it.  That is, all you must implement
        // are the four virtual functions defined below.


        // So let's make an empty 9-dimensional PSI vector
        feature_vector_type psi(get_num_dimensions());
        psi = 0; // zero initialize it

        // Now put a copy of x into the right place in PSI according to its label.  So for
        // example, if label is 1 then psi would be:  [0 0 0 x(0) x(1) x(2) 0 0 0]
        if (label == 0)
            set_rowm(psi,range(0,2)) = x;
        else if (label == 1)
            set_rowm(psi,range(3,5)) = x;
        else // the label must be 2 
            set_rowm(psi,range(6,8)) = x;

        return psi;
    }

    // We need to declare the dimensionality of the PSI vector (this is also the
    // dimensionality of the weight vector we are learning).  Similarly, we need to declare
    // the number of training samples.  We do this by defining the following virtual
    // functions.
    virtual long get_num_dimensions () const { return samples[0].size() * 3; }
    virtual long get_num_samples ()    const { return samples.size(); }

    // In get_truth_joint_feature_vector(), all you have to do is output the PSI() vector
    // for the idx-th training sample when it has its true label.  So here it outputs
    // PSI(samples[idx], labels[idx]).
    virtual void get_truth_joint_feature_vector (
        long idx,
        feature_vector_type& psi 
    ) const 
    {
        psi = make_psi(samples[idx], labels[idx]);
    }

    // separation_oracle() is more interesting.  dlib's structural SVM solver will call
    // separation_oracle() many times during the optimization.  Each time it will give it
    // the current value of the parameter weights and separation_oracle() is supposed to
    // find the label that most violates the structural SVM objective function for the
    // idx-th sample.  Then the separation oracle reports the corresponding PSI vector and
    // loss value.  To state this more precisely, the separation_oracle() member function
    // has the following contract:
    //   requires
    //       - 0 <= idx < get_num_samples()
    //       - current_solution.size() == get_num_dimensions()
    //   ensures
    //       - runs the separation oracle on the idx-th sample.  We define this as follows: 
    //           - let X           == the idx-th training sample.
    //           - let PSI(X,y)    == the joint feature vector for input X and an arbitrary label y.
    //           - let F(X,y)      == dot(current_solution,PSI(X,y)).  
    //           - let LOSS(idx,y) == the loss incurred for predicting that the idx-th sample
    //             has a label of y.  Note that LOSS() should always be >= 0 and should
    //             become exactly 0 when y is the correct label for the idx-th sample.
    //
    //               Then the separation oracle finds a Y such that: 
    //                   Y = argmax over all y: LOSS(idx,y) + F(X,y) 
    //                   (i.e. It finds the label which maximizes the above expression.)
    //
    //               Finally, we can define the outputs of this function as:
    //               - #loss == LOSS(idx,Y) 
    //               - #psi == PSI(X,Y) 
    virtual void separation_oracle (
        const long idx,
        const column_vector& current_solution,
        scalar_type& loss,
        feature_vector_type& psi
    ) const 
    {
        // Note that the solver will use multiple threads to make concurrent calls to
        // separation_oracle(), therefore, you must implement it in a thread safe manner
        // (or disable threading by inheriting from structural_svm_problem instead of
        // structural_svm_problem_threaded).  However, if your separation oracle is not
        // very fast to execute you can get a very significant speed boost by using the
        // threaded solver.  In general, all you need to do to make your separation oracle
        // thread safe is to make sure it does not modify any global variables or members
        // of three_class_classifier_problem.  So it is usually easy to make thread safe.

        column_vector scores(3);

        // compute scores for each of the three classifiers
        scores = dot(rowm(current_solution, range(0,2)),  samples[idx]),
                 dot(rowm(current_solution, range(3,5)),  samples[idx]),
                 dot(rowm(current_solution, range(6,8)),  samples[idx]);

        // Add in the loss-augmentation.  Recall that we maximize LOSS(idx,y) + F(X,y) in
        // the separate oracle, not just F(X,y) as we normally would in predict_label().
        // Therefore, we must add in this extra amount to account for the loss-augmentation.
        // For our simple multi-class classifier, we incur a loss of 1 if we don't predict
        // the correct label and a loss of 0 if we get the right label.
        if (labels[idx] != 0)
            scores(0) += 1;
        if (labels[idx] != 1)
            scores(1) += 1;
        if (labels[idx] != 2)
            scores(2) += 1;

        // Now figure out which classifier has the largest loss-augmented score.
        const int max_scoring_label = index_of_max(scores);
        // And finally record the loss that was associated with that predicted label.
        // Again, the loss is 1 if the label is incorrect and 0 otherwise.
        if (max_scoring_label == labels[idx])
            loss = 0;
        else
            loss = 1;

        // Finally, compute the PSI vector corresponding to the label we just found and
        // store it into psi for output.
        psi = make_psi(samples[idx], max_scoring_label);
    }

private:

    // Here we hold onto the training data by reference.  You can hold it by value or by
    // any other method you like.
    const std::vector<sample_type>& samples;
    const std::vector<int>& labels;
};
    
// ----------------------------------------------------------------------------------------

// This function puts it all together.  In here we use the three_class_classifier_problem
// along with dlib's oca cutting plane solver to find the optimal weights given our
// training data.
column_vector train_three_class_classifier (
    const std::vector<sample_type>& samples,
    const std::vector<int>& labels
)
{
    const unsigned long num_threads = 4;
    three_class_classifier_problem problem(samples, labels, num_threads);

    // Before we run the solver we set up some general parameters.  First,
    // you can set the C parameter of the structural SVM by calling set_c().
    problem.set_c(1);

    // The epsilon parameter controls the stopping tolerance.  The optimizer will run until
    // R(w) is within epsilon of its optimal value. If you don't set this then it defaults
    // to 0.001.
    problem.set_epsilon(0.0001);

    // Uncomment this and the optimizer will print its progress to standard out.  You will
    // be able to see things like the current risk gap.  The optimizer continues until the
    // risk gap is below epsilon.
    //problem.be_verbose();

    // The optimizer uses an internal cache to avoid unnecessary calls to your
    // separation_oracle() routine.  This parameter controls the size of that cache.
    // Bigger values use more RAM and might make the optimizer run faster.  You can also
    // disable it by setting it to 0 which is good to do when your separation_oracle is
    // very fast.  If you don't call this function it defaults to a value of 5.
    //problem.set_max_cache_size(20);

    
    column_vector weights;
    // Finally, we create the solver and then run it.
    oca solver;
    solver(problem, weights);

    // Alternatively, if you wanted to require that the learned weights are all
    // non-negative then you can call the solver as follows and it will put a constraint on
    // the optimization problem which causes all elements of weights to be >= 0.  
    //solver(problem, weights, problem.get_num_dimensions());

    return weights;
}

// ----------------------------------------------------------------------------------------

