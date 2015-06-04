// Copyright (C) 2007  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#undef DLIB_SVm_ABSTRACT_
#ifdef DLIB_SVm_ABSTRACT_

#include <cmath>
#include <limits>
#include <sstream>
#include "../matrix/matrix_abstract.h"
#include "../algs.h"
#include "../serialize.h"
#include "function_abstract.h"
#include "kernel_abstract.h"
#include "svm_nu_trainer_abstract.h"

namespace dlib
{

// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------

    template <
        typename T,
        typename U
        >
    bool is_learning_problem (
        const T& x,
        const U& x_labels
    );
    /*!
        requires
            - T == a matrix or something convertible to a matrix via mat()
            - U == a matrix or something convertible to a matrix via mat()
        ensures
            - returns true if all of the following are true and false otherwise:
                - is_col_vector(x) == true
                - is_col_vector(x_labels) == true
                - x.size() == x_labels.size() 
                - x.size() > 0
    !*/

// ----------------------------------------------------------------------------------------

    template <
        typename T,
        typename U
        >
    bool is_binary_classification_problem (
        const T& x,
        const U& x_labels
    );
    /*!
        requires
            - T == a matrix or something convertible to a matrix via mat()
            - U == a matrix or something convertible to a matrix via mat()
        ensures
            - returns true if all of the following are true and false otherwise:
                - is_learning_problem(x, x_labels) == true
                - x.size() > 1
                - there exists at least one sample from both the +1 and -1 classes.
                  (i.e. all samples can't have the same label)
                - for all valid i:
                    - x_labels(i) == -1 or +1
    !*/

// ----------------------------------------------------------------------------------------

    template <
        typename sequence_type 
        >
    bool is_sequence_labeling_problem (
        const std::vector<sequence_type>& samples,
        const std::vector<std::vector<unsigned long> >& labels
    );
    /*!
        ensures
            - returns true if all of the following are true and false otherwise:
                - is_learning_problem(samples, labels) == true
                - for all valid i:
                    - samples[i].size() == labels[i].size()
                      (i.e. The size of a label sequence need to match the size of 
                      its corresponding sample sequence)
    !*/

// ----------------------------------------------------------------------------------------

    template <
        typename sequence_type 
        >
    bool is_sequence_segmentation_problem (
        const std::vector<sequence_type>& samples,
        const std::vector<std::vector<std::pair<unsigned long,unsigned long> > >& segments
    );
    /*!
        ensures
            - Note that a sequence segmentation problem is a task where you are given a
              sequence of objects (e.g. words in a sentence) and your task is to find
              certain types of sub-sequences (e.g. proper names).
            - returns true if all of the following are true and false otherwise:
                - is_learning_problem(samples, segments) == true
                - for all valid i and j:
                    - We interpret segments[i][j] as defining a half open range starting
                      with segments[i][j].first and ending just before segments[i][j].second.
                    - segments[i][j].first < segments[i][j].second
                    - segments[i][j].second <= samples[i].size()
                      (i.e. Each segment must be contained within its associated sequence)
                    - segments[i][j] does not overlap with any of the other ranges in
                      segments[i].
    !*/

// ----------------------------------------------------------------------------------------

    template <
        typename lhs_type, 
        typename rhs_type
        >
    bool is_assignment_problem (
        const std::vector<std::pair<std::vector<lhs_type>, std::vector<rhs_type> > >& samples,
        const std::vector<std::vector<long> >& labels
    );
    /*!
        ensures
            - Note that an assignment problem is a task to associate each element of samples[i].first
              to an element of samples[i].second, or to indicate that the element doesn't associate 
              with anything.  Therefore, labels[i] should contain the association information for
              samples[i].
            - This function returns true if all of the following are true and false otherwise:
                - is_learning_problem(samples, labels) == true
                - for all valid i:
                    - samples[i].first.size() == labels[i].size()
                    - for all valid j:
                        -1 <= labels[i][j] < samples[i].second.size()
                        (A value of -1 indicates that samples[i].first[j] isn't associated with anything.
                        All other values indicate the associating element of samples[i].second)
                    - All elements of labels[i] which are not equal to -1 are unique.  That is,
                      multiple elements of samples[i].first can't associate to the same element
                      in samples[i].second.
    !*/

// ----------------------------------------------------------------------------------------

    template <
        typename lhs_type, 
        typename rhs_type
        >
    bool is_forced_assignment_problem (
        const std::vector<std::pair<std::vector<lhs_type>, std::vector<rhs_type> > >& samples,
        const std::vector<std::vector<long> >& labels
    );
    /*!
        ensures
            - A regular assignment problem is allowed to indicate that all elements of 
              samples[i].first don't associate to anything.  However, a forced assignment
              problem is required to always associate an element of samples[i].first to 
              something in samples[i].second if there is an element of samples[i].second
              that hasn't already been associated to something.  
            - This function returns true if all of the following are true and false otherwise:
                - is_assignment_problem(samples, labels) == true
                - for all valid i:
                    - let N denote the number of elements in labels[i] that are not equal to -1.
                    - min(samples[i].first.size(), samples[i].second.size()) == N
    !*/

// ----------------------------------------------------------------------------------------

    template <
        typename detection_type_,
        typename label_type_ = long
        >
    struct labeled_detection
    {
        /*!
            WHAT THIS OBJECT REPRESENTS
                This is a simple object, like std::pair, it just holds two objects.  It
                serves the same purpose as std::pair except that it has informative names
                describing its two members and is intended for use with track association
                problems.
        !*/

        typedef detection_type_ detection_type;
        typedef label_type_ label_type;

        detection_type det;
        label_type label;
    };

    template <
        typename detection_type_,
        typename label_type_ 
        >
    void serialize (const labeled_detection<detection_type_,label_type_>& item, std::ostream& out);
    /*!
        provides serialization support
    !*/

    template <
        typename detection_type_,
        typename label_type_ 
        >
    void deserialize (labeled_detection<detection_type_,label_type_>& item, std::istream& in);
    /*!
        provides deserialization support
    !*/

// ----------------------------------------------------------------------------------------

    template <
        typename detection_type, 
        typename label_type 
        >
    bool is_track_association_problem (
        const std::vector<std::vector<labeled_detection<detection_type,label_type> > >& samples
    );
    /*!
        ensures
            - In this tracking model you get a set of detections at each time step and are
              expected to associate each detection with a track or have it spawn a new
              track.  Therefore, a track association problem is a machine learning problem
              where you are given a dataset of example input detections and are expected to
              learn to perform the proper detection to track association.  
            - This function checks if samples can form a valid dataset for this machine
              learning problem and returns true if this is the case.  This means we should
              interpret samples in the following way:
                - samples is a track history and for each valid i:
                    - samples[i] is a set of labeled detections from the i-th time step.
                      Each detection has been labeled with its "true object identity".
                      That is, all the detection throughout the history with the same
                      label_type value are detections from the same object and therefore
                      should be associated to the same track.
              Putting this all together, samples is a valid track association learning
              problem if and only if the following are all true:
                - samples.size() > 0
                - There are at least two values, i and j such that:
                    - i != j
                    - samples[i].size() > 0
                    - samples[j].size() > 0
                  Or in other words, there needs to be some detections in samples somewhere
                  or it is impossible to learn anything.
                - for all valid i:
                    - for all valid j and k where j!=k:
                        - samples[i][j].label != samples[i][k].label
                          (i.e. the label_type values must be unique within each time step.
                          Or in other words, you can't have two detections on the same
                          object in a single time step.)
    !*/

    template <
        typename detection_type, 
        typename label_type 
        >
    bool is_track_association_problem (
        const std::vector<std::vector<std::vector<labeled_detection<detection_type,label_type> > > >& samples
    );
    /*!
        ensures
            - returns true if is_track_association_problem(samples[i]) == true for all
              valid i and false otherwise.
    !*/

// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------

    double platt_scale (
        const std::pair<double,double>& params,
        const double score
    );
    /*!
        ensures
            - returns 1/(1 + std::exp(params.first*score + params.second))
    !*/

// ----------------------------------------------------------------------------------------

    template <typename T, typename alloc>
    std::pair<double,double> learn_platt_scaling (
        const std::vector<T,alloc>& scores,
        const std::vector<T,alloc>& labels
    );
    /*!
        requires
            - T should be either float, double, or long double 
            - is_binary_classification_problem(scores,labels) == true
        ensures
            - This function learns to map scalar values into well calibrated probabilities
              using Platt scaling.  In particular, it returns a params object such that, 
              for all valid i:
                - platt_scale(params,scores[i]) == the scaled version of the scalar value
                  scores[i].  That is, the output is a number between 0 and 1.  In
                  particular, platt_scale(params,scores[i]) is meant to represent the
                  probability that labels[i] == +1.
            - This function is an implementation of the algorithm described in the following
              papers: 
                Probabilistic Outputs for Support Vector Machines and Comparisons to
                Regularized Likelihood Methods by John C. Platt.  March 26, 1999

                A Note on Platt's Probabilistic Outputs for Support Vector Machines
                by Hsuan-Tien Lin, Chih-Jen Lin, and Ruby C. Weng
    !*/

// ----------------------------------------------------------------------------------------

    template <
        typename trainer_type,
        typename sample_vector_type,
        typename label_vector_type
        >
    const probabilistic_function<typename trainer_type::trained_function_type> 
    train_probabilistic_decision_function (
        const trainer_type& trainer,
        const sample_vector_type& x,
        const label_vector_type& y,
        const long folds
    );
    /*!
        requires
            - 1 < folds <= x.size()
            - is_binary_classification_problem(x,y) == true
            - x and y must be std::vector objects or types with a compatible interface.
            - trainer_type == some kind of batch trainer object (e.g. svm_nu_trainer)
        ensures
            - trains a classifier given the training samples in x and labels in y.  
            - returns a probabilistic_decision_function that represents the trained classifier.
            - The parameters of the probability model are estimated by performing k-fold 
              cross validation. 
            - The number of folds used is given by the folds argument.
            - This function is implemented using learn_platt_scaling()
        throws
            - any exceptions thrown by trainer.train()
            - std::bad_alloc
    !*/

// ----------------------------------------------------------------------------------------

    template <
        typename trainer_type
        >
    trainer_adapter_probabilistic<trainer_type> probabilistic (
        const trainer_type& trainer,
        const long folds
    );
    /*!
        requires
            - 1 < folds <= x.size()
            - trainer_type == some kind of batch trainer object (e.g. svm_nu_trainer)
        ensures
            - returns a trainer adapter TA such that calling TA.train(samples, labels)
              returns the same object as calling train_probabilistic_decision_function(trainer,samples,labels,folds).
    !*/

// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------
//                                  Miscellaneous functions
// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------

    template <
        typename trainer_type,
        typename in_sample_vector_type,
        typename in_scalar_vector_type
        >
    const matrix<double,1,2> cross_validate_trainer (
        const trainer_type& trainer,
        const in_sample_vector_type& x,
        const in_scalar_vector_type& y,
        const long folds
    );
    /*!
        requires
            - is_binary_classification_problem(x,y) == true
            - 1 < folds <= std::min(sum(y>0),sum(y<0))
              (e.g. There must be at least as many examples of each class as there are folds)
            - trainer_type == some kind of binary classification trainer object (e.g. svm_nu_trainer)
        ensures
            - performs k-fold cross validation by using the given trainer to solve the
              given binary classification problem for the given number of folds.
              Each fold is tested using the output of the trainer and the average 
              classification accuracy from all folds is returned.  
            - The average accuracy is computed by running test_binary_decision_function()
              on each fold and its output is averaged and returned.
            - The number of folds used is given by the folds argument.
        throws
            - any exceptions thrown by trainer.train()
            - std::bad_alloc
    !*/

// ----------------------------------------------------------------------------------------

    template <
        typename dec_funct_type,
        typename in_sample_vector_type,
        typename in_scalar_vector_type
        >
    const matrix<double,1,2> test_binary_decision_function (
        const dec_funct_type& dec_funct,
        const in_sample_vector_type& x_test,
        const in_scalar_vector_type& y_test
    );
    /*!
        requires
            - is_binary_classification_problem(x_test,y_test) == true
            - dec_funct_type == some kind of decision function object (e.g. decision_function)
        ensures
            - Tests the given decision function by calling it on the x_test and y_test samples.
              The output of dec_funct is interpreted as a prediction for the +1 class
              if its output is >= 0 and as a prediction for the -1 class otherwise.
            - The test accuracy is returned in a row vector, let us call it R.  Both 
              quantities in R are numbers between 0 and 1 which represent the fraction 
              of examples correctly classified.  R(0) is the fraction of +1 examples 
              correctly classified and R(1) is the fraction of -1 examples correctly 
              classified.
        throws
            - std::bad_alloc
    !*/

// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------

    template <
        typename T,
        typename U
        >
    void randomize_samples (
        T& samples,
        U& labels 
    );
    /*!
        requires
            - T == a matrix object or an object compatible with std::vector that contains 
              a swappable type.
            - U == a matrix object or an object compatible with std::vector that contains 
              a swappable type.
            - if samples or labels are matrix objects then is_vector(samples) == true and
              is_vector(labels) == true
            - samples.size() == labels.size()
        ensures
            - randomizes the order of the samples and labels but preserves
              the pairing between each sample and its label
            - A default initialized random number generator is used to perform the randomizing.
              Note that this means that each call this this function does the same thing.  
              That is, the random number generator always uses the same seed.
            - for all valid i:
                - let r == the random index samples(i) was moved to.  then:
                    - #labels(r) == labels(i)
    !*/

// ----------------------------------------------------------------------------------------

    template <
        typename T,
        typename U,
        typename rand_type
        >
    void randomize_samples (
        T& samples,
        U& labels,
        rand_type& rnd
    );
    /*!
        requires
            - T == a matrix object or an object compatible with std::vector that contains 
              a swappable type.
            - U == a matrix object or an object compatible with std::vector that contains 
              a swappable type.
            - if samples or labels are matrix objects then is_vector(samples) == true and
              is_vector(labels) == true
            - samples.size() == labels.size()
            - rand_type == a type that implements the dlib/rand/rand_kernel_abstract.h interface
        ensures
            - randomizes the order of the samples and labels but preserves
              the pairing between each sample and its label
            - the given rnd random number generator object is used to do the randomizing
            - for all valid i:
                - let r == the random index samples(i) was moved to.  then:
                    - #labels(r) == labels(i)
    !*/

// ----------------------------------------------------------------------------------------

    template <
        typename T
        >
    void randomize_samples (
        T& samples
    );
    /*!
        requires
            - T == a matrix object or an object compatible with std::vector that contains 
              a swappable type.
            - if (samples is a matrix) then 
                - is_vector(samples) == true 
        ensures
            - randomizes the order of the elements inside samples 
            - A default initialized random number generator is used to perform the randomizing.
              Note that this means that each call this this function does the same thing.  
              That is, the random number generator always uses the same seed.
    !*/

// ----------------------------------------------------------------------------------------

    template <
        typename T,
        typename rand_type
        >
    void randomize_samples (
        T& samples,
        rand_type& rnd
    );
    /*!
        requires
            - T == a matrix object or an object compatible with std::vector that contains 
              a swappable type.
            - rand_type == a type that implements the dlib/rand/rand_kernel_abstract.h interface
            - if (samples is a matrix) then 
                - is_vector(samples) == true 
        ensures
            - randomizes the order of the elements inside samples 
            - the given rnd random number generator object is used to do the randomizing
    !*/

// ----------------------------------------------------------------------------------------

    template <
        typename T,
        typename U,
        typename V
        >
    void randomize_samples (
        T& samples,
        U& labels,
        V& auxiliary
    );
    /*!
        requires
            - T == a matrix object or an object compatible with std::vector that contains 
              a swappable type.
            - U == a matrix object or an object compatible with std::vector that contains 
              a swappable type.
            - V == a matrix object or an object compatible with std::vector that contains 
              a swappable type.
            - if (samples, labels, or auxiliary are matrix objects) then 
                - is_vector(samples) == true 
                - is_vector(labels) == true
                - is_vector(auxiliary) == true
            - samples.size() == labels.size() == auxiliary.size()
        ensures
            - randomizes the order of the samples, labels, and auxiliary but preserves the
              pairing between each sample, its label, and its auxiliary value.
            - A default initialized random number generator is used to perform the
              randomizing.  Note that this means that each call this this function does the
              same thing.  That is, the random number generator always uses the same seed.
            - for all valid i:
                - let r == the random index samples(i) was moved to.  then:
                    - #labels(r) == labels(i)
                    - #auxiliary(r) == auxiliary(i)
    !*/

// ----------------------------------------------------------------------------------------

    template <
        typename T,
        typename U,
        typename V,
        typename rand_type
        >
    void randomize_samples (
        T& samples,
        U& labels,
        V& auxiliary,
        rand_type& rnd
    );
    /*!
        requires
            - T == a matrix object or an object compatible with std::vector that contains 
              a swappable type.
            - U == a matrix object or an object compatible with std::vector that contains 
              a swappable type.
            - V == a matrix object or an object compatible with std::vector that contains 
              a swappable type.
            - if (samples, labels, or auxiliary are matrix objects) then 
                - is_vector(samples) == true 
                - is_vector(labels) == true
                - is_vector(auxiliary) == true
            - samples.size() == labels.size() == auxiliary.size()
            - rand_type == a type that implements the dlib/rand/rand_kernel_abstract.h interface
        ensures
            - randomizes the order of the samples, labels, and auxiliary but preserves the
              pairing between each sample, its label, and its auxiliary value.
            - the given rnd random number generator object is used to do the randomizing
            - for all valid i:
                - let r == the random index samples(i) was moved to.  then:
                    - #labels(r) == labels(i)
                    - #auxiliary(r) == auxiliary(i)
    !*/

// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------

}

#endif // DLIB_SVm_ABSTRACT_


