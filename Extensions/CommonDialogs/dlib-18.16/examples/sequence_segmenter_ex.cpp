// The contents of this file are in the public domain. See LICENSE_FOR_EXAMPLE_PROGRAMS.txt
/*

    This example shows how to use dlib to learn to do sequence segmentation.  In a sequence
    segmentation task we are given a sequence of objects (e.g. words in a sentence) and we
    are supposed to detect certain subsequences (e.g. the names of people).  Therefore, in
    the code below we create some very simple training sequences and use them to learn a
    sequence segmentation model.  In particular, our sequences will be sentences
    represented as arrays of words and our task will be to learn to identify person names.
    Once we have our segmentation model we can use it to find names in new sentences, as we
    will show.

*/


#include <iostream>
#include <cctype>
#include <dlib/svm_threaded.h>
#include <dlib/string.h>

using namespace std;
using namespace dlib;


// ----------------------------------------------------------------------------------------

class feature_extractor
{
    /*
        The sequence segmentation models we work with in this example are chain structured
        conditional random field style models.  Therefore, central to a sequence
        segmentation model is a feature extractor object.  This object defines all the
        properties of the model such as how many features it will use, and more importantly,
        how they are calculated.  
    */

public:
    // This should be the type used to represent an input sequence.  It can be
    // anything so long as it has a .size() which returns the length of the sequence.
    typedef std::vector<std::string> sequence_type;

    // The next four lines define high-level properties of the feature extraction model.
    // See the documentation for the sequence_labeler object for an extended discussion of
    // how they are used (note that the main body of the documentation is at the top of the
    // file documenting the sequence_labeler).
    const static bool use_BIO_model           = true;
    const static bool use_high_order_features = true;
    const static bool allow_negative_weights  = true;
    unsigned long window_size()  const { return 3; }

    // This function defines the dimensionality of the vectors output by the get_features()
    // function defined below.
    unsigned long num_features() const { return 1; }

    template <typename feature_setter>
    void get_features (
        feature_setter& set_feature,
        const sequence_type& sentence,
        unsigned long position
    ) const
    /*!
        requires
            - position < sentence.size()
            - set_feature is a function object which allows expressions of the form:
                - set_features((unsigned long)feature_index, (double)feature_value);
                - set_features((unsigned long)feature_index);
        ensures
            - This function computes a feature vector which should capture the properties
              of sentence[position] that are informative relative to the sequence
              segmentation task you are trying to perform.
            - The output feature vector is returned as a sparse vector by invoking set_feature().
              For example, to set the feature with an index of 55 to the value of 1
              this method would call:
                set_feature(55);
              Or equivalently:
                set_feature(55,1);
              Therefore, the first argument to set_feature is the index of the feature
              to be set while the second argument is the value the feature should take.
              Additionally, note that calling set_feature() multiple times with the
              same feature index does NOT overwrite the old value, it adds to the
              previous value.  For example, if you call set_feature(55) 3 times then it
              will result in feature 55 having a value of 3.
            - This function only calls set_feature() with feature_index values < num_features()
    !*/
    {
        // The model in this example program is very simple.  Our features only look at the 
        // capitalization pattern of the words.  So we have a single feature which checks
        // if the first letter is capitalized or not.  
        if (isupper(sentence[position][0]))
            set_feature(0);
    }
};

// We need to define serialize() and deserialize() for our feature extractor if we want 
// to be able to serialize and deserialize our learned models.  In this case the 
// implementation is empty since our feature_extractor doesn't have any state.  But you 
// might define more complex feature extractors which have state that needs to be saved.
void serialize(const feature_extractor&, std::ostream&) {}
void deserialize(feature_extractor&, std::istream&) {}

// ----------------------------------------------------------------------------------------

void make_training_examples (
    std::vector<std::vector<std::string> >& samples,
    std::vector<std::vector<std::pair<unsigned long, unsigned long> > >& segments
)
/*!
    ensures
        - This function fills samples with example sentences and segments with the
          locations of person names that should be segmented out.
        - #samples.size() == #segments.size()
!*/
{
    std::vector<std::pair<unsigned long, unsigned long> > names;


    // Here we make our first training example.  split() turns the string into an array of
    // 10 words and then we store that into samples.
    samples.push_back(split("The other day I saw a man named Jim Smith"));
    // We want to detect person names.  So we note that the name is located within the
    // range [8, 10).  Note that we use half open ranges to identify segments.  So in this
    // case, the segment identifies the string "Jim Smith".
    names.push_back(make_pair(8, 10));
    segments.push_back(names); names.clear();

    // Now we add a few more example sentences

    samples.push_back(split("Davis King is the main author of the dlib Library"));
    names.push_back(make_pair(0, 2));
    segments.push_back(names); names.clear();


    samples.push_back(split("Bob Jones is a name and so is George Clinton"));
    names.push_back(make_pair(0, 2));
    names.push_back(make_pair(8, 10));
    segments.push_back(names); names.clear();


    samples.push_back(split("My dog is named Bob Barker"));
    names.push_back(make_pair(4, 6));
    segments.push_back(names); names.clear();


    samples.push_back(split("ABC is an acronym but John James Smith is a name"));
    names.push_back(make_pair(5, 8));
    segments.push_back(names); names.clear();


    samples.push_back(split("No names in this sentence at all"));
    segments.push_back(names); names.clear();
}

// ----------------------------------------------------------------------------------------

void print_segment (
    const std::vector<std::string>& sentence,
    const std::pair<unsigned long,unsigned long>& segment
)
{
    // Recall that a segment is a half open range starting with .first and ending just
    // before .second. 
    for (unsigned long i = segment.first; i < segment.second; ++i)
        cout << sentence[i] << " ";
    cout << endl;
}

// ----------------------------------------------------------------------------------------

int main()
{
    // Finally we make it into the main program body.  So the first thing we do is get our
    // training data.
    std::vector<std::vector<std::string> > samples;
    std::vector<std::vector<std::pair<unsigned long, unsigned long> > > segments;
    make_training_examples(samples, segments);


    // Next we use the structural_sequence_segmentation_trainer to learn our segmentation
    // model based on just the samples and segments.  But first we setup some of its
    // parameters.
    structural_sequence_segmentation_trainer<feature_extractor> trainer;
    // This is the common SVM C parameter.  Larger values encourage the trainer to attempt
    // to fit the data exactly but might overfit.  In general, you determine this parameter
    // by cross-validation.
    trainer.set_c(10);
    // This trainer can use multiple CPU cores to speed up the training.  So set this to
    // the number of available CPU cores. 
    trainer.set_num_threads(4);


    // Learn to do sequence segmentation from the dataset
    sequence_segmenter<feature_extractor> segmenter = trainer.train(samples, segments);


    // Let's print out all the segments our segmenter detects.
    for (unsigned long i = 0; i < samples.size(); ++i)
    {
        // get all the detected segments in samples[i]
        std::vector<std::pair<unsigned long,unsigned long> > seg = segmenter(samples[i]);
        // Print each of them
        for (unsigned long j = 0; j < seg.size(); ++j)
        {
            print_segment(samples[i], seg[j]);
        }
    }


    // Now let's test it on a new sentence and see what it detects.  
    std::vector<std::string> sentence(split("There once was a man from Nantucket whose name rhymed with Bob Bucket"));
    std::vector<std::pair<unsigned long,unsigned long> > seg = segmenter(sentence);
    for (unsigned long j = 0; j < seg.size(); ++j)
    {
        print_segment(sentence, seg[j]);
    }



    // We can also test the accuracy of the segmenter on a dataset.  This statement simply
    // tests on the training data.  In this case we will see that it predicts everything
    // correctly.
    cout << "\nprecision, recall, f1-score: " << test_sequence_segmenter(segmenter, samples, segments);
    // Similarly, we can do 5-fold cross-validation and print the results.  Just as before,
    // we see everything is predicted correctly.
    cout << "precision, recall, f1-score: " << cross_validate_sequence_segmenter(trainer, samples, segments, 5);





    // Finally, the segmenter can be serialized to disk just like most dlib objects.
    serialize("segmenter.dat") << segmenter;

    // recall from disk
    deserialize("segmenter.dat") >> segmenter;
}

// ----------------------------------------------------------------------------------------

