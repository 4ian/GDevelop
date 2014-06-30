// Copyright (C) 2011  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#undef DLIB_STRUCTURAL_SVM_ASSiGNMENT_PROBLEM_ABSTRACT_H__
#ifdef DLIB_STRUCTURAL_SVM_ASSiGNMENT_PROBLEM_ABSTRACT_H__


#include "../matrix.h"
#include <vector>
#include "structural_svm_problem_threaded_abstract.h"
#include "assignment_function_abstract.h"

// ----------------------------------------------------------------------------------------

namespace dlib
{

    template <
        typename feature_extractor
        >
    class structural_svm_assignment_problem : noncopyable,
                                              public structural_svm_problem_threaded<matrix<double,0,1>, 
                                                     typename feature_extractor::feature_vector_type >
    {
        /*!
            REQUIREMENTS ON feature_extractor
                It must be an object that implements an interface compatible with 
                the example_feature_extractor defined in dlib/svm/assignment_function_abstract.h.

            WHAT THIS OBJECT REPRESENTS
                This object is a tool for learning the weight vector needed to use
                an assignment_function object.  It learns the parameter vector by 
                formulating the problem as a structural SVM problem.  
        !*/

    public:
        typedef matrix<double,0,1> matrix_type;
        typedef typename feature_extractor::feature_vector_type feature_vector_type;
        typedef typename feature_extractor::lhs_element lhs_element;
        typedef typename feature_extractor::rhs_element rhs_element;
        typedef std::pair<std::vector<lhs_element>, std::vector<rhs_element> > sample_type;
        typedef std::vector<long> label_type;

        structural_svm_assignment_problem(
            const std::vector<sample_type>& samples,
            const std::vector<label_type>& labels,
            const feature_extractor& fe,
            bool force_assignment,
            unsigned long num_threads = 2
        );
        /*!
            requires
                - is_assignment_problem(samples,labels) == true
                - if (force_assignment) then
                    - is_forced_assignment_problem(samples,labels) == true
            ensures
                - This object attempts to learn a mapping from the given samples to the 
                  given labels.  In particular, it attempts to learn to predict labels[i] 
                  based on samples[i].  Or in other words, this object can be used to learn 
                  a parameter vector, w, such that an assignment_function declared as:
                    assignment_function<feature_extractor> assigner(w,fe,force_assignment)
                  results in an assigner object which attempts to compute the following mapping:
                    labels[i] == labeler(samples[i])
                - This object will use num_threads threads during the optimization 
                  procedure.  You should set this parameter equal to the number of 
                  available processing cores on your machine.
        !*/

    };

// ----------------------------------------------------------------------------------------

}

#endif // DLIB_STRUCTURAL_SVM_ASSiGNMENT_PROBLEM_ABSTRACT_H__



