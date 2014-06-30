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
            - T == a matrix or something convertible to a matrix via vector_to_matrix()
            - U == a matrix or something convertible to a matrix via vector_to_matrix()
        ensures
            - returns true if all of the following are true and false otherwise:
                - is_col_vector(x) == true
                - is_col_vector(x_labels) == true
                - x.size() == x_labels.size() 
                - x.size() > 0
    !*/

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
            - T == a matrix or something convertible to a matrix via vector_to_matrix()
            - U == a matrix or something convertible to a matrix via vector_to_matrix()
        ensures
            - returns true if all of the following are true and false otherwise:
                - is_learning_problem(x, x_labels) == true
                - x.size() > 1
                - there exists at least one sample from both the +1 and -1 classes.
                  (i.e. all samples can't have the same label)
                - for all valid i:
                    - x_labels(i) == -1 or +1
    !*/

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
// ----------------------------------------------------------------------------------------
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
            - 1 < folds <= x.nr()
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


