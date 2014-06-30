// Copyright (C) 2011  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#undef DLIB_STRUCTURAL_SVM_PRObLEM_ABSTRACT_H__
#ifdef DLIB_STRUCTURAL_SVM_PRObLEM_ABSTRACT_H__

#include "../optimization/optimization_oca_abstract.h"
#include "sparse_vector_abstract.h"
#include "../matrix.h"

namespace dlib
{

// ----------------------------------------------------------------------------------------

    template <
        typename matrix_type_,
        typename feature_vector_type_ = matrix_type_
        >
    class structural_svm_problem : public oca_problem<matrix_type_> 
    {
    public:
        /*!
            REQUIREMENTS ON matrix_type_
                - matrix_type_ == a dlib::matrix capable of storing column vectors

            REQUIREMENTS ON feature_vector_type_ 
                - feature_vector_type_ == a dlib::matrix capable of storing column vectors
                  or an unsorted sparse vector type as defined in dlib/svm/sparse_vector_abstract.h.

            INITIAL VALUE
                - get_epsilon() == 0.001
                - get_max_cache_size() == 10
                - get_c() == 1
                - This object will not be verbose

            WHAT THIS OBJECT REPRESENTS
                This object is a tool for solving the optimization problem associated 
                with a structural support vector machine.  A structural SVM is a supervised 
                machine learning method for learning to predict complex outputs.  This is
                contrasted with a binary classifier which makes only simple yes/no predictions.  
                A structural SVM, on the other hand, can learn to predict outputs as complex
                as entire parse trees.  To do this, it learns a function F(x,y) which measures 
                how well a particular data sample x matches a label y.  When used for prediction,
                the best label for a new x is given by the y which maximizes F(x,y).   

                To use this object you inherit from it, provide implementations of its four 
                pure virtual functions, and then pass your object to the oca optimizer.


                To define the optimization problem precisely, we first introduce some notation:
                    - let PSI(x,y)    == the joint feature vector for input x and a label y.
                    - let F(x,y|w)    == dot(w,PSI(x,y)).  
                    - let LOSS(idx,y) == the loss incurred for predicting that the idx-th training 
                      sample has a label of y.  Note that LOSS() should always be >= 0 and should
                      become exactly 0 when y is the correct label for the idx-th sample.
                    - let x_i == the i-th training sample.
                    - let y_i == the correct label for the i-th training sample.
                    - The number of data samples is N.

                Then the optimization problem solved using this object is the following:
                    Minimize: h(w) == 0.5*dot(w,w) + C*R(w)

                    Where R(w) == sum from i=1 to N: 1/N * sample_risk(i,w)
                    and sample_risk(i,w) == max over all Y: LOSS(i,Y) + F(x_i,Y|w) - F(x_i,y_i|w)
                    and C > 0

                

                For an introduction to structured support vector machines you should consult 
                the following paper: 
                    Predicting Structured Objects with Support Vector Machines by 
                    Thorsten Joachims, Thomas Hofmann, Yisong Yue, and Chun-nam Yu

                For a more detailed discussion of the particular algorithm implemented by this
                object see the following paper:  
                    T. Joachims, T. Finley, Chun-Nam Yu, Cutting-Plane Training of Structural SVMs, 
                    Machine Learning, 77(1):27-59, 2009.

                    Note that this object is essentially a tool for solving the 1-Slack structural
                    SVM with margin-rescaling.  Specifically, see Algorithm 3 in the above referenced 
                    paper.
        !*/

        typedef matrix_type_ matrix_type;
        typedef typename matrix_type::type scalar_type;
        typedef feature_vector_type_ feature_vector_type;

        structural_svm_problem (
        );
        /*!
            ensures
                - this object is properly initialized
        !*/

        void set_epsilon (
            scalar_type eps
        );
        /*!
            requires
                - eps > 0
            ensures
                - #get_epsilon() == eps
        !*/

        const scalar_type get_epsilon (
        ) const;
        /*!
            ensures
                - returns the error epsilon that determines when training should stop.
                  Smaller values may result in a more accurate solution but take longer 
                  to execute.  Specifically, the algorithm stops when the average sample
                  risk (i.e. R(w) as defined above) is within epsilon of its optimal value.

                  Also note that sample risk is an upper bound on a sample's loss.  So
                  you can think of this epsilon value as saying "solve the optimization
                  problem until the average loss per sample is within epsilon of it's 
                  optimal value".
        !*/

        void set_max_cache_size (
            unsigned long max_size
        );
        /*!
            ensures
                - #get_max_cache_size() == max_size
        !*/

        unsigned long get_max_cache_size (
        ) const; 
        /*!
            ensures
                - Returns the number of joint feature vectors per training sample kept in 
                  the separation oracle cache.  This cache is used to avoid unnecessary 
                  calls to the user supplied separation_oracle() function.  Note that a 
                  value of 0 means that caching is not used at all.  This is appropriate 
                  if the separation oracle is cheap to evaluate. 
        !*/

        void be_verbose (
        );
        /*!
            ensures
                - This object will print status messages to standard out so that a 
                  user can observe the progress of the algorithm.
        !*/

        void be_quiet(
        );
        /*!
            ensures
                - this object will not print anything to standard out
        !*/

        scalar_type get_c (
        ) const; 
        /*!
            ensures
                - returns the SVM regularization parameter.  It is the parameter that 
                  determines the trade off between trying to fit the training data 
                  exactly or allowing more errors but hopefully improving the 
                  generalization of the resulting classifier.  Larger values encourage 
                  exact fitting while smaller values of C may encourage better 
                  generalization. 
        !*/

        void set_c (
            scalar_type C
        );
        /*!
            requires
                - C > 0
            ensures
                - #get_c() == C
        !*/

    // --------------------------------
    //     User supplied routines
    // --------------------------------

        virtual long get_num_dimensions (
        ) const = 0;
        /*!
            ensures
                - returns the dimensionality of a joint feature vector
        !*/

        virtual long get_num_samples (
        ) const = 0;
        /*!
            ensures
                - returns the number of training samples in this problem. 
        !*/

        virtual void get_truth_joint_feature_vector (
            long idx,
            feature_vector_type& psi 
        ) const = 0;
        /*!
            requires
                - 0 <= idx < get_num_samples()
            ensures
                - #psi == PSI(x_idx, y_idx)
                  (i.e. the joint feature vector for the idx-th training sample its true label.)
        !*/

        virtual void separation_oracle (
            const long idx,
            const matrix_type& current_solution,
            scalar_type& loss,
            feature_vector_type& psi
        ) const = 0;
        /*!
            requires
                - 0 <= idx < get_num_samples()
                - current_solution.size() == get_num_dimensions()
            ensures
                - runs the separation oracle on the idx-th sample.  We define this as follows: 
                    - let X           == the idx-th training sample.
                    - let PSI(X,y)    == the joint feature vector for input X and an arbitrary label y.
                    - let F(X,y)      == dot(current_solution,PSI(X,y)).  
                    - let LOSS(idx,y) == the loss incurred for predicting that the idx-th sample
                      has a label of y.  Note that LOSS() should always be >= 0 and should
                      become exactly 0 when y is the correct label for the idx-th sample.

                        Then the separation oracle finds a Y such that: 
                            Y = argmax over all y: LOSS(idx,y) + F(X,y) 
                            (i.e. It finds the label which maximizes the above expression.)

                        Finally, we can define the outputs of this function as:
                        - #loss == LOSS(idx,Y) 
                        - #psi == PSI(X,Y) 
        !*/
    };

// ----------------------------------------------------------------------------------------

}

#endif // DLIB_STRUCTURAL_SVM_PRObLEM_ABSTRACT_H__


