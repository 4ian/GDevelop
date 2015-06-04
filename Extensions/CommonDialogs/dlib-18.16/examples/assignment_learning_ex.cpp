// The contents of this file are in the public domain. See LICENSE_FOR_EXAMPLE_PROGRAMS.txt
/*

    This is an example illustrating the use of the dlib machine learning tools for 
    learning to solve the assignment problem. 
    
    Many tasks in computer vision or natural language processing can be thought of 
    as assignment problems.  For example, in a computer vision application where 
    you are trying to track objects moving around in video, you likely need to solve
    an association problem every time you get a new video frame.  That is, each new 
    frame will contain objects (e.g. people, cars, etc.) and you will want to 
    determine which of these objects are actually things you have seen in previous 
    frames.  
   
    The assignment problem can be optimally solved using the well known Hungarian 
    algorithm.  However, this algorithm requires the user to supply some function 
    which measures the "goodness" of an individual association.  In many cases the 
    best way to measure this goodness isn't obvious and therefore machine learning 
    methods are used.  
    
    The remainder of this example will show you how to learn a goodness function
    which is optimal, in a certain sense, for use with the Hungarian algorithm.  To
    do this, we will make a simple dataset of example associations and use them to
    train a supervised machine learning method. 

    Finally, note that there is a whole example program dedicated to assignment
    learning problems where you are trying to make an object tracker.  So if that is
    what you are interested in then take a look at the learning_to_track_ex.cpp
    example program.
*/


#include <iostream>
#include <dlib/svm_threaded.h>

using namespace std;
using namespace dlib;


// ----------------------------------------------------------------------------------------

/*
    In an association problem, we will talk about the "Left Hand Set" (LHS) and the
    "Right Hand Set" (RHS).  The task will be to learn to map all elements of LHS to 
    unique elements of RHS.  If an element of LHS can't be mapped to a unique element of 
    RHS for some reason (e.g. LHS is bigger than RHS) then it can also be mapped to the 
    special -1 output, indicating no mapping to RHS.

    So the first step is to define the type of elements in each of these sets.  In the
    code below we will use column vectors in both LHS and RHS.  However, in general,
    they can each contain any type you like.  LHS can even contain a different type 
    than RHS.
*/

typedef dlib::matrix<double,0,1> column_vector;

// This type represents a pair of LHS and RHS.  That is, sample_type::first
// contains a left hand set and sample_type::second contains a right hand set.
typedef std::pair<std::vector<column_vector>, std::vector<column_vector> > sample_type;

// This type will contain the association information between LHS and RHS.  That is,
// it will determine which elements of LHS map to which elements of RHS.
typedef std::vector<long> label_type;

// In this example, all our LHS and RHS elements will be 3-dimensional vectors.
const unsigned long num_dims = 3;

void make_data (
    std::vector<sample_type>& samples,
    std::vector<label_type>& labels
);
/*!
    ensures
        - This function creates a training dataset of 5 example associations.  
        - #samples.size() == 5
        - #labels.size() == 5
        - for all valid i:
            - #samples[i].first == a left hand set
            - #samples[i].second == a right hand set
            - #labels[i] == a set of integers indicating how to map LHS to RHS.  To be
              precise:  
                - #samples[i].first.size() == #labels[i].size()
                - for all valid j:
                    -1 <= #labels[i][j] < #samples[i].second.size()
                    (A value of -1 indicates that #samples[i].first[j] isn't associated with anything.
                    All other values indicate the associating element of #samples[i].second)
                - All elements of #labels[i] which are not equal to -1 are unique.  That is,
                  multiple elements of #samples[i].first can't associate to the same element
                  in #samples[i].second.
!*/

// ----------------------------------------------------------------------------------------

struct feature_extractor
{
    /*!
        Recall that our task is to learn the "goodness of assignment" function for
        use with the Hungarian algorithm.  The dlib tools assume this function
        can be written as:
            match_score(l,r) == dot(w, PSI(l,r)) + bias
        where l is an element of LHS, r is an element of RHS, w is a parameter vector,
        bias is a scalar value, and PSI() is a user supplied feature extractor.

        This feature_extractor is where we implement PSI().  How you implement this
        is highly problem dependent.  
    !*/

    // The type of feature vector returned from get_features().  This must be either
    // a dlib::matrix or a sparse vector.
    typedef column_vector feature_vector_type;

    // The types of elements in the LHS and RHS sets
    typedef column_vector lhs_element;
    typedef column_vector rhs_element;


    unsigned long num_features() const
    {
        // Return the dimensionality of feature vectors produced by get_features()
        return num_dims;
    }

    void get_features (
        const lhs_element& left,
        const rhs_element& right,
        feature_vector_type& feats
    ) const
    /*!
        ensures
            - #feats == PSI(left,right)
              (i.e. This function computes a feature vector which, in some sense, 
              captures information useful for deciding if matching left to right 
              is "good").
    !*/
    {
        // Let's just use the squared difference between each vector as our features.
        // However, it should be emphasized that how to compute the features here is very
        // problem dependent.  
        feats = squared(left - right);
    }

};

// We need to define serialize() and deserialize() for our feature extractor if we want 
// to be able to serialize and deserialize our learned models.  In this case the 
// implementation is empty since our feature_extractor doesn't have any state.  But you 
// might define more complex feature extractors which have state that needs to be saved.
void serialize   (const feature_extractor& , std::ostream& ) {}
void deserialize (feature_extractor&       , std::istream& ) {}

// ----------------------------------------------------------------------------------------

int main()
{
    try
    {
        // Get a small bit of training data.
        std::vector<sample_type> samples;
        std::vector<label_type> labels;
        make_data(samples, labels);


        structural_assignment_trainer<feature_extractor> trainer;
        // This is the common SVM C parameter.  Larger values encourage the
        // trainer to attempt to fit the data exactly but might overfit. 
        // In general, you determine this parameter by cross-validation.
        trainer.set_c(10);
        // This trainer can use multiple CPU cores to speed up the training.  
        // So set this to the number of available CPU cores. 
        trainer.set_num_threads(4);

        // Do the training and save the results in assigner.
        assignment_function<feature_extractor> assigner = trainer.train(samples, labels);


        // Test the assigner on our data.  The output will indicate that it makes the
        // correct associations on all samples.
        cout << "Test the learned assignment function: " << endl;
        for (unsigned long i = 0; i < samples.size(); ++i)
        {
            // Predict the assignments for the LHS and RHS in samples[i].   
            std::vector<long> predicted_assignments = assigner(samples[i]);
            cout << "true labels:      " << trans(mat(labels[i]));
            cout << "predicted labels: " << trans(mat(predicted_assignments)) << endl;
        }

        // We can also use this tool to compute the percentage of assignments predicted correctly.
        cout << "training accuracy: " << test_assignment_function(assigner, samples, labels) << endl;


        // Since testing on your training data is a really bad idea, we can also do 5-fold cross validation.
        // Happily, this also indicates that all associations were made correctly.
        randomize_samples(samples, labels);
        cout << "cv accuracy:       " << cross_validate_assignment_trainer(trainer, samples, labels, 5) << endl;



        // Finally, the assigner can be serialized to disk just like most dlib objects.
        serialize("assigner.dat") << assigner;

        // recall from disk
        deserialize("assigner.dat") >> assigner;
    }
    catch (std::exception& e)
    {
        cout << "EXCEPTION THROWN" << endl;
        cout << e.what() << endl;
    }
}

// ----------------------------------------------------------------------------------------

void make_data (
    std::vector<sample_type>& samples,
    std::vector<label_type>& labels
)
{
    // Make four different vectors.  We will use them to make example assignments.
    column_vector A(num_dims), B(num_dims), C(num_dims), D(num_dims);
    A = 1,0,0;
    B = 0,1,0;
    C = 0,0,1;
    D = 0,1,1;

    std::vector<column_vector> lhs;
    std::vector<column_vector> rhs;
    label_type mapping;

    // In all the assignments to follow, we will only say an element of the LHS 
    // matches an element of the RHS if the two are equal.  So A matches with A, 
    // B with B, etc.  But never A with C, for example.
    // ------------------------

    lhs.resize(3);
    lhs[0] = A;
    lhs[1] = B;
    lhs[2] = C;

    rhs.resize(3);
    rhs[0] = B;
    rhs[1] = A;
    rhs[2] = C;

    mapping.resize(3);
    mapping[0] = 1;  // lhs[0] matches rhs[1]
    mapping[1] = 0;  // lhs[1] matches rhs[0]
    mapping[2] = 2;  // lhs[2] matches rhs[2]

    samples.push_back(make_pair(lhs,rhs));
    labels.push_back(mapping);

    // ------------------------

    lhs[0] = C;
    lhs[1] = A;
    lhs[2] = B;

    rhs[0] = A;
    rhs[1] = B;
    rhs[2] = D;

    mapping[0] = -1;  // The -1 indicates that lhs[0] doesn't match anything in rhs.
    mapping[1] = 0;   // lhs[1] matches rhs[0]
    mapping[2] = 1;   // lhs[2] matches rhs[1]

    samples.push_back(make_pair(lhs,rhs));
    labels.push_back(mapping);

    // ------------------------

    lhs[0] = A;
    lhs[1] = B;
    lhs[2] = C;

    rhs.resize(4);
    rhs[0] = C;
    rhs[1] = B;
    rhs[2] = A;
    rhs[3] = D;

    mapping[0] = 2;
    mapping[1] = 1;
    mapping[2] = 0;

    samples.push_back(make_pair(lhs,rhs));
    labels.push_back(mapping);

    // ------------------------

    lhs.resize(2);
    lhs[0] = B;
    lhs[1] = C;

    rhs.resize(3);
    rhs[0] = C;
    rhs[1] = A;
    rhs[2] = D;

    mapping.resize(2);
    mapping[0] = -1;
    mapping[1] = 0;

    samples.push_back(make_pair(lhs,rhs));
    labels.push_back(mapping);

    // ------------------------

    lhs.resize(3);
    lhs[0] = D;
    lhs[1] = B;
    lhs[2] = C;

    // rhs will be empty.  So none of the items in lhs can match anything.
    rhs.resize(0);

    mapping.resize(3);
    mapping[0] = -1;
    mapping[1] = -1;
    mapping[2] = -1;

    samples.push_back(make_pair(lhs,rhs));
    labels.push_back(mapping);

}

