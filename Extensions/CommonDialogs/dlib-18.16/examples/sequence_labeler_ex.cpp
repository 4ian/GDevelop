// The contents of this file are in the public domain. See LICENSE_FOR_EXAMPLE_PROGRAMS.txt
/*

    This is an example illustrating the use of the machine learning
    tools for sequence labeling in the dlib C++ Library.  
    
    The general problem addressed by these tools is the following.  
    Suppose you have a set of sequences of some kind and you want to 
    learn to predict a label for each element of a sequence.  So for 
    example, you might have a set of English sentences where each 
    word is labeled with its part of speech and you want to learn a 
    model which can predict the part of speech for each word in a new 
    sentence.  
    
    Central to these tools is the sequence_labeler object.  It is the
    object which represents the label prediction model. In particular,
    the model used by this object is the following.  Given an input 
    sequence x, predict an output label sequence y such that:
        y == argmax_y dot(weight_vector, PSI(x,y))
    where PSI() is supplied by the user and defines the form of the 
    model.  In this example program we will define it such that we 
    obtain a simple Hidden Markov Model.  However, it's possible to 
    define much more sophisticated models.  You should take a look 
    at the following papers for a few examples:
        - Hidden Markov Support Vector Machines by 
          Y. Altun, I. Tsochantaridis, T. Hofmann
        - Shallow Parsing with Conditional Random Fields by 
          Fei Sha and Fernando Pereira



    In the remainder of this example program we will show how to
    define your own PSI(), as well as how to learn the "weight_vector"
    parameter.  Once you have these two items you will be able to
    use the sequence_labeler to predict the labels of new sequences.
*/


#include <iostream>
#include <dlib/svm_threaded.h>
#include <dlib/rand.h>

using namespace std;
using namespace dlib;


/*
    In this example we will be working with a Hidden Markov Model where
    the hidden nodes and observation nodes both take on 3 different states. 
    The task will be to take a sequence of observations and predict the state
    of the corresponding hidden nodes.  
*/

const unsigned long num_label_states = 3; 
const unsigned long num_sample_states = 3;

// ----------------------------------------------------------------------------------------

class feature_extractor
{
    /*
        This object is where you define your PSI().  To ensure that the argmax_y
        remains a tractable problem, the PSI(x,y) vector is actually a sum of vectors, 
        each derived from the entire input sequence x but only part of the label
        sequence y.  This allows the argmax_y to be efficiently solved using the 
        well known Viterbi algorithm.  
    */

public:
    // This defines the type used to represent the observed sequence.  You can use 
    // any type here so long as it has a .size() which returns the number of things
    // in the sequence.  
    typedef std::vector<unsigned long> sequence_type; 

    unsigned long num_features() const
    /*!
        ensures
            - returns the dimensionality of the PSI() feature vector.  
    !*/
    {
        // Recall that we are defining a HMM.  So in this case the PSI() vector 
        // should have the same dimensionality as the number of parameters in the HMM.  
        return num_label_states*num_label_states + num_label_states*num_sample_states;
    }

    unsigned long order() const 
    /*!
        ensures
            - This object represents a Markov model on the output labels.
              This parameter defines the order of the model.  That is, this 
              value controls how many previous label values get to be taken 
              into consideration when performing feature extraction for a
              particular element of the input sequence.  Note that the runtime
              of the algorithm is exponential in the order.  So don't make order
              very large.
    !*/
    { 
        // In this case we are using a HMM model that only looks at the 
        // previous label. 
        return 1; 
    }

    unsigned long num_labels() const 
    /*!
        ensures
            - returns the number of possible output labels.
    !*/
    { 
        return num_label_states; 
    }

    template <typename feature_setter, typename EXP>
    void get_features (
        feature_setter& set_feature,
        const sequence_type& x,
        const matrix_exp<EXP>& y,
        unsigned long position
    ) const
    /*!
        requires
            - EXP::type == unsigned long
              (i.e. y contains unsigned longs)
            - position < x.size()
            - y.size() == min(position, order) + 1
            - is_vector(y) == true
            - max(y) < num_labels() 
            - set_feature is a function object which allows expressions of the form:
                - set_features((unsigned long)feature_index, (double)feature_value);
                - set_features((unsigned long)feature_index);
        ensures
            - for all valid i:
                - interprets y(i) as the label corresponding to x[position-i]
            - This function computes the part of PSI() corresponding to the x[position]
              element of the input sequence.  Moreover, this part of PSI() is returned as 
              a sparse vector by invoking set_feature().  For example, to set the feature 
              with an index of 55 to the value of 1 this method would call:
                set_feature(55);
              Or equivalently:
                set_feature(55,1);
              Therefore, the first argument to set_feature is the index of the feature 
              to be set while the second argument is the value the feature should take.
              Additionally, note that calling set_feature() multiple times with the same 
              feature index does NOT overwrite the old value, it adds to the previous 
              value.  For example, if you call set_feature(55) 3 times then it will
              result in feature 55 having a value of 3.
            - This function only calls set_feature() with feature_index values < num_features()
    !*/
    {
        // Again, the features below only define a simple HMM.  But in general, you can 
        // use a wide variety of sophisticated feature extraction methods here.

        // Pull out an indicator feature for the type of transition between the
        // previous label and the current label.
        if (y.size() > 1)
            set_feature(y(1)*num_label_states + y(0));

        // Pull out an indicator feature for the type of observed node given 
        // the current label.
        set_feature(num_label_states*num_label_states +
                    y(0)*num_sample_states + x[position]);
    }
};

// We need to define serialize() and deserialize() for our feature extractor if we want 
// to be able to serialize and deserialize our learned models.  In this case the 
// implementation is empty since our feature_extractor doesn't have any state.  But you 
// might define more complex feature extractors which have state that needs to be saved.
void serialize(const feature_extractor&, std::ostream&) {}
void deserialize(feature_extractor&, std::istream&) {}

// ----------------------------------------------------------------------------------------

void make_dataset (
    const matrix<double>& transition_probabilities,
    const matrix<double>& emission_probabilities,
    std::vector<std::vector<unsigned long> >& samples,
    std::vector<std::vector<unsigned long> >& labels,
    unsigned long dataset_size
);
/*!
    requires
        - transition_probabilities.nr() == transition_probabilities.nc()
        - transition_probabilities.nr() == emission_probabilities.nr()
        - The rows of transition_probabilities and emission_probabilities must sum to 1.
          (i.e. sum_cols(transition_probabilities) and sum_cols(emission_probabilities)
          must evaluate to vectors of all 1s.)
    ensures
        - This function randomly samples a bunch of sequences from the HMM defined by 
          transition_probabilities and emission_probabilities. 
        - The HMM is defined by:
            - The probability of transitioning from hidden state H1 to H2 
              is given by transition_probabilities(H1,H2).
            - The probability of a hidden state H producing an observed state
              O is given by emission_probabilities(H,O).
        - #samples.size() == #labels.size() == dataset_size
        - for all valid i:
            - #labels[i] is a randomly sampled sequence of hidden states from the
              given HMM.  #samples[i] is its corresponding randomly sampled sequence
              of observed states.
!*/

// ----------------------------------------------------------------------------------------

int main()
{
    // We need a dataset to test the machine learning algorithms.  So we are going to 
    // define a HMM based on the following two matrices and then randomly sample a
    // set of data from it.  Then we will see if the machine learning method can
    // recover the HMM model from the training data. 


    matrix<double> transition_probabilities(num_label_states, num_label_states);
    transition_probabilities = 0.05, 0.90, 0.05,
                               0.05, 0.05, 0.90,
                               0.90, 0.05, 0.05;

    matrix<double> emission_probabilities(num_label_states,num_sample_states);
    emission_probabilities = 0.5, 0.5, 0.0,
                             0.0, 0.5, 0.5,
                             0.5, 0.0, 0.5;

    std::vector<std::vector<unsigned long> > samples;
    std::vector<std::vector<unsigned long> > labels;
    // sample 1000 labeled sequences from the HMM.
    make_dataset(transition_probabilities,emission_probabilities, 
                 samples, labels, 1000);

    // print out some of the randomly sampled sequences
    for (int i = 0; i < 10; ++i)
    {
        cout << "hidden states:   " << trans(mat(labels[i]));
        cout << "observed states: " << trans(mat(samples[i]));
        cout << "******************************" << endl;
    }

    // Next we use the structural_sequence_labeling_trainer to learn our
    // prediction model based on just the samples and labels.
    structural_sequence_labeling_trainer<feature_extractor> trainer;
    // This is the common SVM C parameter.  Larger values encourage the
    // trainer to attempt to fit the data exactly but might overfit. 
    // In general, you determine this parameter by cross-validation.
    trainer.set_c(4);
    // This trainer can use multiple CPU cores to speed up the training.  
    // So set this to the number of available CPU cores. 
    trainer.set_num_threads(4);


    // Learn to do sequence labeling from the dataset
    sequence_labeler<feature_extractor> labeler = trainer.train(samples, labels);

    // Test the learned labeler on one of the training samples.  In this
    // case it will give the correct sequence of labels.
    std::vector<unsigned long> predicted_labels = labeler(samples[0]);
    cout << "true hidden states:      "<< trans(mat(labels[0]));
    cout << "predicted hidden states: "<< trans(mat(predicted_labels));



    // We can also do cross-validation.  The confusion_matrix is defined as:
    //  - confusion_matrix(T,P) == the number of times a sequence element with label T 
    //    was predicted to have a label of P.
    // So if all predictions are perfect then only diagonal elements of this matrix will
    // be non-zero. 
    matrix<double> confusion_matrix;
    confusion_matrix = cross_validate_sequence_labeler(trainer, samples, labels, 4);
    cout << "\ncross-validation: " << endl;
    cout << confusion_matrix;
    cout << "label accuracy: "<< sum(diag(confusion_matrix))/sum(confusion_matrix) << endl;

    // In this case, the label accuracy is about 88%.  At this point, we want to know if
    // the machine learning method was able to recover the HMM model from the data.  So
    // to test this, we can load the true HMM model into another sequence_labeler and 
    // test it out on the data and compare the results.  

    matrix<double,0,1> true_hmm_model_weights = log(join_cols(reshape_to_column_vector(transition_probabilities),
                                                              reshape_to_column_vector(emission_probabilities)));
    // With this model, labeler_true will predict the most probable set of labels
    // given an input sequence.  That is, it will predict using the equation:
    //    y == argmax_y dot(true_hmm_model_weights, PSI(x,y))
    sequence_labeler<feature_extractor> labeler_true(true_hmm_model_weights); 

    confusion_matrix = test_sequence_labeler(labeler_true, samples, labels);
    cout << "\nTrue HMM model: " << endl;
    cout << confusion_matrix;
    cout << "label accuracy: "<< sum(diag(confusion_matrix))/sum(confusion_matrix) << endl;

    // Happily, we observe that the true model also obtains a label accuracy of 88%.






    // Finally, the labeler can be serialized to disk just like most dlib objects.
    serialize("labeler.dat") << labeler;

    // recall from disk
    deserialize("labeler.dat") >> labeler;
}

// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------
//              Code for creating a bunch of random samples from our HMM.
// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------

void sample_hmm (
    dlib::rand& rnd,
    const matrix<double>& transition_probabilities,
    const matrix<double>& emission_probabilities,
    unsigned long previous_label,
    unsigned long& next_label,
    unsigned long& next_sample
)
/*!
    requires
        - previous_label < transition_probabilities.nr()
        - transition_probabilities.nr() == transition_probabilities.nc()
        - transition_probabilities.nr() == emission_probabilities.nr()
        - The rows of transition_probabilities and emission_probabilities must sum to 1.
          (i.e. sum_cols(transition_probabilities) and sum_cols(emission_probabilities)
          must evaluate to vectors of all 1s.)
    ensures
        - This function randomly samples the HMM defined by transition_probabilities
          and emission_probabilities assuming that the previous hidden state
          was previous_label. 
        - The HMM is defined by:
            - P(next_label |previous_label) == transition_probabilities(previous_label, next_label)
            - P(next_sample|next_label)     == emission_probabilities  (next_label,     next_sample)
        - #next_label == the sampled value of the hidden state
        - #next_sample == the sampled value of the observed state
!*/
{
    // sample next_label
    double p = rnd.get_random_double();
    for (long c = 0; p >= 0 && c < transition_probabilities.nc(); ++c)
    {
        next_label = c;
        p -= transition_probabilities(previous_label, c);
    }

    // now sample next_sample
    p = rnd.get_random_double();
    for (long c = 0; p >= 0 && c < emission_probabilities.nc(); ++c)
    {
        next_sample = c;
        p -= emission_probabilities(next_label, c);
    }
}

// ----------------------------------------------------------------------------------------

void make_dataset (
    const matrix<double>& transition_probabilities,
    const matrix<double>& emission_probabilities,
    std::vector<std::vector<unsigned long> >& samples,
    std::vector<std::vector<unsigned long> >& labels,
    unsigned long dataset_size
)
{
    samples.clear();
    labels.clear();

    dlib::rand rnd;

    // now randomly sample some labeled sequences from our Hidden Markov Model
    for (unsigned long iter = 0; iter < dataset_size; ++iter)
    {
        const unsigned long sequence_size = rnd.get_random_32bit_number()%20+3;
        std::vector<unsigned long> sample(sequence_size);
        std::vector<unsigned long> label(sequence_size);

        unsigned long previous_label = rnd.get_random_32bit_number()%num_label_states;
        for (unsigned long i = 0; i < sample.size(); ++i)
        {
            unsigned long next_label = 0, next_sample = 0;
            sample_hmm(rnd, transition_probabilities, emission_probabilities, 
                       previous_label, next_label, next_sample);

            label[i] = next_label;
            sample[i] = next_sample;

            previous_label = next_label;
        }

        samples.push_back(sample);
        labels.push_back(label);
    }
}

// ----------------------------------------------------------------------------------------

