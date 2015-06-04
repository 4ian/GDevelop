// Copyright (C) 2013  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#undef DLIB_SEQUENCE_SeGMENTER_ABSTRACT_H_h_
#ifdef DLIB_SEQUENCE_SeGMENTER_ABSTRACT_H_h_

#include "../matrix.h"
#include <vector>
#include "sequence_labeler_abstract.h"

namespace dlib
{

// ----------------------------------------------------------------------------------------

    class example_feature_extractor
    {
        /*!
            WHAT THIS OBJECT REPRESENTS
                This object defines the interface a feature extractor must implement if it
                is to be used with the sequence_segmenter defined at the bottom of this
                file.  
                
                The model used by sequence_segmenter objects is the following.  Given an
                input sequence x, predict an output label sequence y such that:
                    y == argmax_Y dot(w, PSI(x,Y))
                Where w is a parameter vector and the label sequence defines a segmentation
                of x.

                Recall that a sequence_segmenter uses the BIO or BILOU tagging model and is
                also an instantiation of the dlib::sequence_labeler.  Selecting to use the
                BIO model means that each element of the label sequence y takes on one of
                three possible values (B, I, or O) and together these labels define a
                segmentation of the sequence.  For example, to represent a segmentation of
                the sequence of words "The dog ran to Bob Jones" where only "Bob Jones" was
                segmented out we would use the label sequence OOOOBI.  The BILOU model is
                similar except that it uses five different labels and each segment is
                labeled as U, BL, BIL, BIIL, BIIIL, and so on depending on its length.
                Therefore, the BILOU model is able to more explicitly model the ends of the
                segments than the BIO model, but has more parameters to estimate.
                
                Keeping all this in mind, the purpose of a sequence_segmenter is to take
                care of the bookkeeping associated with creating BIO/BILOU tagging models
                for segmentation tasks.  In particular, it presents the user with a
                simplified version of the interface used by the dlib::sequence_labeler.  It
                does this by completely hiding the BIO/BILOU tags from the user and instead
                exposes an explicit sub-segment based labeling representation.  It also
                simplifies the construction of the PSI() feature vector. 

                Like in the dlib::sequence_labeler, PSI() is a sum of feature vectors, each
                derived from the entire input sequence x but only part of the label
                sequence y.  In the case of the sequence_segmenter, we use an order one
                Markov model.  This means that 
                    PSI(x,y) == sum_i XI(x, y_{i-1}, y_{i}, i)
                where the sum is taken over all the elements in the sequence.  At each
                element we extract a feature vector, XI(), that is expected to encode
                important details describing what the i-th position of the sequence looks
                like in the context of the current and previous labels.  To do this, XI()
                is allowed to look at any part of the input sequence x, the current and
                previous labels, and of course it must also know the position in question, i.  
                
                The sequence_segmenter simplifies this further by decomposing XI() into
                components which model the current window around each position as well as
                the conjunction of the current window around each position and the previous
                label.  In particular, the sequence_segmenter only asks a user to provide a
                single feature vector which characterizes a position of the sequence
                independent of any labeling.  We denote this feature vector by ZI(x,i), where
                x is the sequence and i is the position in question.  
                
                For example, suppose we use a window size of 3 and BIO tags, then we can
                put all this together and define XI() in terms of ZI().  To do this, we can
                think of XI() as containing 12*3 slots which contain either a zero vector
                or a ZI() vector.  Each combination of window position and labeling has a
                different slot.  To explain further, consider the following examples where
                we have annotated which parts of XI() correspond to each slot.  

                If the previous and current label are both B and we use a window size of 3
                then XI() would be instantiated as:
                    XI(x, B, B, i) = [ZI(x,i-1)  \ 
                                      ZI(x,i)     > If current label is B
                                      ZI(x,i+1)  /  
                                      0          \                        
                                      0           > If current label is I 
                                      0          /                        
                                      0          \                        
                                      0           > If current label is O 
                                      0          /  

                                      ZI(x,i-1)  \ 
                                      ZI(x,i)     > If previous label is B and current label is B
                                      ZI(x,i+1)  /  
                                      0          \                        
                                      0           > If previous label is B and current label is I 
                                      0          /                        
                                      0          \                        
                                      0           > If previous label is B and current label is O 
                                      0          /  

                                      0          \ 
                                      0           > If previous label is I and current label is B
                                      0          /  
                                      0          \                        
                                      0           > If previous label is I and current label is I 
                                      0          /                        
                                      0          \                        
                                      0           > If previous label is I and current label is O 
                                      0          /  

                                      0          \ 
                                      0           > If previous label is O and current label is B
                                      0          /  
                                      0          \                        
                                      0           > If previous label is O and current label is I 
                                      0          /                        
                                      0          \                        
                                      0           > If previous label is O and current label is O 
                                      0]         /  


                If the previous label is I and the current label is O and we use a window
                size of 3 then XI() would be instantiated as:
                    XI(x, I, O, i) = [0          \ 
                                      0           > If current label is B
                                      0          /  
                                      0          \                        
                                      0           > If current label is I 
                                      0          /                        
                                      ZI(x,i-1)  \                        
                                      ZI(x,i)     > If current label is O 
                                      ZI(x,i+1)  /  

                                      0          \ 
                                      0           > If previous label is B and current label is B
                                      0          /  
                                      0          \                        
                                      0           > If previous label is B and current label is I 
                                      0          /                        
                                      0          \                        
                                      0           > If previous label is B and current label is O 
                                      0          /  
                                                                                                   
                                      0          \ 
                                      0           > If previous label is I and current label is B
                                      0          /  
                                      0          \                        
                                      0           > If previous label is I and current label is I 
                                      0          /                        
                                      ZI(x,i-1)  \                        
                                      ZI(x,i)     > If previous label is I and current label is O 
                                      ZI(x,i+1)  /  
                                                                                                   
                                      0          \ 
                                      0           > If previous label is O and current label is B
                                      0          /  
                                      0          \                        
                                      0           > If previous label is O and current label is I 
                                      0          /                        
                                      0          \                        
                                      0           > If previous label is O and current label is O 
                                      0]         /  
                    
                    If we had instead used the BILOU tagging model the XI() vector would
                    have been similarly defined except that there would be 30*3 slots for
                    the various label combination instead of 12*3.

                    Finally, while not shown here, we also include indicator features in
                    XI() to model label transitions and individual label biases.  These are
                    12 extra features in the case of the BIO tagging model and 30 extra in
                    the case of the BILOU tagging model.

            THREAD SAFETY
                Instances of this object are required to be threadsafe, that is, it should
                be safe for multiple threads to make concurrent calls to the member
                functions of this object.
        !*/

    public:
        // This should be the type used to represent an input sequence.  It can be
        // anything so long as it has a .size() which returns the length of the sequence.
        typedef the_type_used_to_represent_a_sequence sequence_type;

        // If you want to use the BIO tagging model then set this bool to true.  Set it to
        // false to use the BILOU tagging model.
        const static bool use_BIO_model = true;

        // In the WHAT THIS OBJECT REPRESENTS section above we discussed how we model the
        // conjunction of the previous label and the window around each position.  Doing
        // this greatly expands the size of the parameter vector w.  You can optionally
        // disable these higher order features by setting the use_high_order_features bool
        // to false.  This will cause XI() to include only slots which are independent of
        // the previous label. 
        const static bool use_high_order_features = true;

        // You use a tool like the structural_sequence_segmentation_trainer to learn the weight
        // vector needed by a sequence_segmenter.  You can tell the trainer to force all the
        // elements of the weight vector corresponding to ZI() to be non-negative.  This is all
        // the elements of w except for the elements corresponding to the label transition and
        // bias indicator features.  To do this, just set allow_negative_weights to false.  
        const static bool allow_negative_weights = true;


        example_feature_extractor (
        ); 
        /*!
            ensures
                - this object is properly initialized
        !*/

        unsigned long num_features(
        ) const; 
        /*!
            ensures
                - returns the dimensionality of the ZI() feature vector.  This number is
                  always >= 1
        !*/

        unsigned long window_size(
        ) const;
        /*!
            ensures
                - returns the size of the window ZI() vectors are extracted from.  This
                  number is always >= 1.
        !*/

        template <typename feature_setter>
        void get_features (
            feature_setter& set_feature,
            const sequence_type& x,
            unsigned long position
        ) const;
        /*!
            requires
                - position < x.size()
                - set_feature is a function object which allows expressions of the form:
                    - set_features((unsigned long)feature_index, (double)feature_value);
                    - set_features((unsigned long)feature_index);
            ensures
                - This function computes the ZI(x,position) feature vector.  This is a
                  feature vector which should capture the properties of x[position] that
                  are informative relative to the sequence segmentation task you are trying
                  to perform.
                - ZI(x,position) is returned as a sparse vector by invoking set_feature().
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

    };

// ----------------------------------------------------------------------------------------

    void serialize(
        const example_feature_extractor& item,
        std::ostream& out
    );
    /*!
        provides serialization support 
    !*/

    void deserialize(
        example_feature_extractor& item, 
        std::istream& in
    );
    /*!
        provides deserialization support 
    !*/

// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------

    template <
        typename feature_extractor
        >
    unsigned long total_feature_vector_size (
        const feature_extractor& fe
    );
    /*!
        requires
            - fe must be an object that implements an interface compatible with the
              example_feature_extractor discussed above.
        ensures
            - returns the dimensionality of the PSI() vector defined by the given feature
              extractor.  
    !*/

// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------

    template <
        typename feature_extractor
        >
    class sequence_segmenter
    {
        /*!
            REQUIREMENTS ON feature_extractor
                It must be an object that implements an interface compatible with 
                the example_feature_extractor discussed above.

            WHAT THIS OBJECT REPRESENTS
                This object is a tool for segmenting a sequence of objects into a set of
                non-overlapping chunks.  An example sequence segmentation task is to take
                English sentences and identify all the named entities.  In this example,
                you would be using a sequence_segmenter to find all the chunks of
                contiguous words which refer to proper names.

                Internally, the sequence_segmenter uses the BIO (Begin, Inside, Outside) or
                BILOU (Begin, Inside, Last, Outside, Unit) sequence tagging model.
                Moreover, it is implemented using a dlib::sequence_labeler object and
                therefore sequence_segmenter objects are examples of chain structured
                conditional random field style sequence taggers. 

            THREAD SAFETY
                It is always safe to use distinct instances of this object in different
                threads.  However, when a single instance is shared between threads then
                the following rules apply:
                    It is safe to call the const members of this object from multiple
                    threads so long as the feature_extractor is also threadsafe.  This is
                    because the const members are purely read-only operations.  However,
                    any operation that modifies a sequence_segmenter is not threadsafe.
        !*/

    public:
        typedef typename feature_extractor::sequence_type sample_sequence_type;
        typedef std::vector<std::pair<unsigned long, unsigned long> > segmented_sequence_type;

        sequence_segmenter(
        );
        /*!
            ensures
                - #get_feature_extractor() == feature_extractor() 
                  (i.e. it will have its default value)
                - #get_weights().size() == total_feature_vector_size(#get_feature_extractor())
                - #get_weights() == 0
        !*/

        explicit sequence_segmenter(
            const matrix<double,0,1>& weights
        ); 
        /*!
            requires
                - total_feature_vector_size(feature_extractor()) == weights.size()
            ensures
                - #get_feature_extractor() == feature_extractor() 
                  (i.e. it will have its default value)
                - #get_weights() == weights
        !*/

        sequence_segmenter(
            const matrix<double,0,1>& weights,
            const feature_extractor& fe
        ); 
        /*!
            requires
                - total_feature_vector_size(fe) == weights.size()
            ensures
                - #get_feature_extractor() == fe
                - #get_weights() == weights
        !*/

        const feature_extractor& get_feature_extractor (
        ) const; 
        /*!
            ensures
                - returns the feature extractor used by this object.
        !*/

        const matrix<double,0,1>& get_weights (
        ) const;
        /*!
            ensures
                - returns the parameter vector associated with this sequence segmenter. 
                  The length of the vector is total_feature_vector_size(get_feature_extractor()).  
        !*/

        segmented_sequence_type operator() (
            const sample_sequence_type& x
        ) const;
        /*!
            ensures
                - Takes an input sequence and returns a list of detected segments within
                  that sequence.
                - None of the returned segments will overlap.
                - The returned segments are listed in the order they appeared in the input sequence.
                - To be precise, this function returns a std::vector Y of segments such that:
                    - Y.size() == the number of segments detected in the input sequence x.
                    - for all valid i:
                        - Y[i].first  == the start of the i-th segment.
                        - Y[i].second == one past the end of the i-th segment.
                        - Therefore, the i-th detected segment in x is composed of the elements
                          x[Y[i].first], x[Y[i].first+1], ..., x[Y[i].second-1]
                        - Y[i].first < x.size()
                        - Y[i].second <= x.size()
                        - Y[i].first < Y[i].second
                          (i.e. This function never outputs empty segments)
                        - Y[i].second <= Y[i+1].first
                          (i.e. the segments are listed in order of appearance and do not overlap)
        !*/

        void segment_sequence (
            const sample_sequence_type& x,
            segmented_sequence_type& y
        ) const;
        /*!
            ensures
                - #y == (*this)(x)
                  (i.e. This is just another interface to the operator() routine
                  above.  This one avoids returning the results by value and therefore
                  might be a little faster in some cases)
        !*/

    };

// ----------------------------------------------------------------------------------------

    template <
        typename feature_extractor
        >
    void serialize (
        const sequence_segmenter<feature_extractor>& item,
        std::ostream& out
    );
    /*!
        provides serialization support 
    !*/

// ----------------------------------------------------------------------------------------

    template <
        typename feature_extractor
        >
    void deserialize (
        sequence_segmenter<feature_extractor>& item,
        std::istream& in 
    );
    /*!
        provides deserialization support 
    !*/

// ----------------------------------------------------------------------------------------

}

#endif // DLIB_SEQUENCE_SeGMENTER_ABSTRACT_H_h_

