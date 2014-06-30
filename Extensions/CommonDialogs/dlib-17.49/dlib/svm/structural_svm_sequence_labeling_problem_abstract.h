// Copyright (C) 2011  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#undef DLIB_STRUCTURAL_SVM_SEQUENCE_LaBELING_PROBLEM_ABSTRACT_H__
#ifdef DLIB_STRUCTURAL_SVM_SEQUENCE_LaBELING_PROBLEM_ABSTRACT_H__


#include "../matrix.h"
#include <vector>
#include "structural_svm_problem_threaded_abstract.h"
#include "sequence_labeler_abstract.h"

// ----------------------------------------------------------------------------------------

namespace dlib
{

    template <
        typename feature_extractor
        >
    class structural_svm_sequence_labeling_problem : noncopyable,
                                                     public structural_svm_problem_threaded<matrix<double,0,1>, 
                                                            std::vector<std::pair<unsigned long,double> > >
    {
        /*!
            REQUIREMENTS ON feature_extractor
                It must be an object that implements an interface compatible with 
                the example_feature_extractor defined in dlib/svm/sequence_labeler_abstract.h.

            WHAT THIS OBJECT REPRESENTS
                This object is a tool for learning the weight vector needed to use
                a sequence_labeler object.  

                It learns the parameter vector by formulating the problem as a structural 
                SVM problem.  The general approach is discussed in the paper:
                    Hidden Markov Support Vector Machines by 
                    Y. Altun, I. Tsochantaridis, T. Hofmann
                While the particular optimization strategy used is the method from: 
                    T. Joachims, T. Finley, Chun-Nam Yu, Cutting-Plane Training of 
                    Structural SVMs, Machine Learning, 77(1):27-59, 2009.
        !*/

    public:
        typedef typename feature_extractor::sequence_type sequence_type;

        structural_svm_sequence_labeling_problem(
            const std::vector<sequence_type>& samples,
            const std::vector<std::vector<unsigned long> >& labels,
            const feature_extractor& fe,
            unsigned long num_threads = 2
        );
        /*!
            requires
                - is_sequence_labeling_problem(samples, labels) == true
                - contains_invalid_labeling(fe, samples, labels) == false
                - for all valid i and j: labels[i][j] < fe.num_labels()
            ensures
                - This object attempts to learn a mapping from the given samples to the 
                  given labels.  In particular, it attempts to learn to predict labels[i] 
                  based on samples[i].  Or in other words, this object can be used to learn 
                  a parameter vector, w, such that a sequence_labeler declared as:
                    sequence_labeler<feature_extractor> labeler(w,fe)
                  results in a labeler object which attempts to compute the following mapping:
                    labels[i] == labeler(samples[i])
                - This object will use num_threads threads during the optimization 
                  procedure.  You should set this parameter equal to the number of 
                  available processing cores on your machine.
                - #num_labels() == fe.num_labels()
                - for all valid i: #get_loss(i) == 1
        !*/

        unsigned long num_labels (
        ) const;
        /*!
            ensures
                - returns the number of possible labels in this learning problem
        !*/

        double get_loss (
            unsigned long label
        ) const;
        /*!
            requires
                - label < num_labels()
            ensures
                - returns the loss incurred when a sequence element with the given
                  label is misclassified.  This value controls how much we care about
                  correctly classifying this type of label.  Larger loss values indicate
                  that we care more strongly than smaller values.
        !*/

        void set_loss (
            unsigned long label,
            double value
        );
        /*!
            requires
                - label < num_labels()
                - value >= 0
            ensures
                - #get_loss(label) == value
        !*/
    };

// ----------------------------------------------------------------------------------------

}

#endif // DLIB_STRUCTURAL_SVM_SEQUENCE_LaBELING_PROBLEM_ABSTRACT_H__


