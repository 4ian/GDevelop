// Copyright (C) 2010  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#undef DLIB_KRR_TRAInER_ABSTRACT_H__
#ifdef DLIB_KRR_TRAInER_ABSTRACT_H__

#include "../algs.h"
#include "function_abstract.h"
#include "kernel_abstract.h"
#include "empirical_kernel_map_abstract.h"

namespace dlib
{
    template <
        typename K 
        >
    class krr_trainer
    {
        /*!
            REQUIREMENTS ON K 
                is a kernel function object as defined in dlib/svm/kernel_abstract.h 

            INITIAL VALUE
                - get_lambda() == 0
                - basis_loaded() == false
                - get_max_basis_size() == 400
                - will_use_regression_loss_for_loo_cv() == true
                - get_search_lambdas() == logspace(-9, 2, 50) 
                - this object will not be verbose unless be_verbose() is called

            WHAT THIS OBJECT REPRESENTS
                This object represents a tool for performing kernel ridge regression 
                (This basic algorithm is also known my many other names, e.g. regularized 
                least squares or least squares SVM). 

                The exact definition of what this algorithm does is this:
                    Find w and b that minimizes the following (x_i are input samples and y_i are target values):
                        lambda*dot(w,w) + sum_over_i( (f(x_i) - y_i)^2 )
                        where f(x) == dot(x,w) - b

                    Except the dot products are replaced by kernel functions.  So this
                    algorithm is just regular old least squares regression but with the
                    addition of a regularization term which encourages small w and the
                    application of the kernel trick.


                It is implemented using the empirical_kernel_map and thus allows you 
                to run the algorithm on large datasets and obtain sparse outputs.  It is also
                capable of estimating the lambda parameter using leave-one-out cross-validation.


                The leave-one-out cross-validation implementation is based on the techniques
                discussed in this paper:
                    Notes on Regularized Least Squares by Ryan M. Rifkin and Ross A. Lippert.
        !*/

    public:
        typedef K kernel_type;
        typedef typename kernel_type::scalar_type scalar_type;
        typedef typename kernel_type::sample_type sample_type;
        typedef typename kernel_type::mem_manager_type mem_manager_type;
        typedef decision_function<kernel_type> trained_function_type;

        krr_trainer (
        );
        /*!
            ensures
                - This object is properly initialized and ready to be used.
        !*/

        void be_verbose (
        );
        /*!
            ensures
                - This object will print status messages to standard out.
        !*/

        void be_quiet (
        );
        /*!
            ensures
                - this object will not print anything to standard out
        !*/

        const kernel_type get_kernel (
        ) const;
        /*!
            ensures
                - returns a copy of the kernel function in use by this object
        !*/

        void set_kernel (
            const kernel_type& k
        );
        /*!
            ensures
                - #get_kernel() == k 
        !*/

        template <typename T>
        void set_basis (
            const T& basis_samples
        );
        /*!
            requires
                - T must be a dlib::matrix type or something convertible to a matrix via vector_to_matrix()
                  (e.g. a std::vector)
                - is_vector(basis_samples) == true
                - basis_samples.size() > 0
                - get_kernel() must be capable of operating on the elements of basis_samples.  That is,
                  expressions such as get_kernel()(basis_samples(0), basis_samples(0)) should make sense.
            ensures
                - #basis_loaded() == true
                - training will be carried out in the span of the given basis_samples
        !*/

        bool basis_loaded (
        ) const;
        /*!
            ensures
                - returns true if this object has been loaded with user supplied basis vectors and false otherwise.
        !*/

        void clear_basis (
        );
        /*!
            ensures
                - #basis_loaded() == false
        !*/

        unsigned long get_max_basis_size (
        ) const;
        /*!
            ensures
                - returns the maximum number of basis vectors this object is allowed
                  to use.  This parameter only matters when the user has not supplied 
                  a basis via set_basis().
        !*/

        void set_max_basis_size (
            unsigned long max_basis_size
        );
        /*!
            requires
                - max_basis_size > 0
            ensures
                - #get_max_basis_size() == max_basis_size 
        !*/

        void set_lambda (
            scalar_type lambda 
        );
        /*!
            requires
                - lambda >= 0
            ensures
                - #get_lambda() == lambda 
        !*/

        const scalar_type get_lambda (
        ) const;
        /*!
            ensures
                - returns the regularization parameter.  It is the parameter that 
                  determines the trade off between trying to fit the training data 
                  exactly or allowing more errors but hopefully improving the 
                  generalization ability of the resulting function.  Smaller values 
                  encourage exact fitting while larger values of lambda may encourage 
                  better generalization. 

                  Note that a lambda of 0 has a special meaning.  It indicates to this
                  object that it should automatically determine an appropriate lambda
                  value.  This is done using leave-one-out cross-validation.
        !*/

        void use_regression_loss_for_loo_cv (
        );
        /*!
            ensures
                - #will_use_regression_loss_for_loo_cv() == true
        !*/

        void use_classification_loss_for_loo_cv (
        );
        /*!
            ensures
                - #will_use_regression_loss_for_loo_cv() == false 
        !*/

        bool will_use_regression_loss_for_loo_cv (
        ) const;
        /*!
            ensures
                - returns true if the automatic lambda estimation will attempt to estimate a lambda
                  appropriate for a regression task.  Otherwise it will try and find one which
                  minimizes the number of classification errors.
        !*/

        template <typename EXP>
        void set_search_lambdas (
            const matrix_exp<EXP>& lambdas
        );
        /*!
            requires
                - is_vector(lambdas) == true
                - lambdas.size() > 0
                - min(lambdas) > 0
                - lambdas must contain floating point numbers
            ensures
                - #get_search_lambdas() == lambdas
        !*/

        const matrix<scalar_type,0,0,mem_manager_type>& get_search_lambdas (
        ) const;
        /*!
            ensures
                - returns a matrix M such that:
                    - is_vector(M) == true
                    - M == a list of all the lambda values which will be tried when performing
                      LOO cross-validation for determining the best lambda. 
        !*/

        template <
            typename in_sample_vector_type,
            typename in_scalar_vector_type
            >
        const decision_function<kernel_type> train (
            const in_sample_vector_type& x,
            const in_scalar_vector_type& y
        ) const;
        /*!
            requires
                - x == a matrix or something convertible to a matrix via vector_to_matrix().
                  Also, x should contain sample_type objects.
                - y == a matrix or something convertible to a matrix via vector_to_matrix().
                  Also, y should contain scalar_type objects.
                - is_learning_problem(x,y) == true
                - if (get_lambda() == 0 && will_use_regression_loss_for_loo_cv() == false) then
                    - is_binary_classification_problem(x,y) == true
                      (i.e. if you want this algorithm to estimate a lambda appropriate for
                      classification functions then you had better give a valid classification
                      problem)
            ensures
                - performs kernel ridge regression given the training samples in x and target values in y.  
                - returns a decision_function F with the following properties:
                    - F(new_x) == predicted y value

                - if (basis_loaded()) then
                    - training will be carried out in the span of the user supplied basis vectors
                - else
                    - this object will attempt to automatically select an appropriate basis

                - if (get_lambda() == 0) then
                    - This object will perform internal leave-one-out cross-validation to determine an 
                      appropriate lambda automatically.  It will compute the LOO error for each lambda
                      in get_search_lambdas() and select the best one.
                    - if (will_use_regression_loss_for_loo_cv()) then
                        - the lambda selected will be the one that minimizes the mean squared error.
                    - else
                        - the lambda selected will be the one that minimizes the number classification 
                          mistakes.  We say a point is classified correctly if the output of the
                          decision_function has the same sign as its label.
                    - #get_lambda() == 0
                      (i.e. we don't change the get_lambda() value.  If you want to know what the
                      automatically selected lambda value was then call the version of train()
                      defined below)
                - else
                    - The user supplied value of get_lambda() will be used to perform the kernel
                      ridge regression.
        !*/

        template <
            typename in_sample_vector_type,
            typename in_scalar_vector_type
            >
        const decision_function<kernel_type> train (
            const in_sample_vector_type& x,
            const in_scalar_vector_type& y,
            std::vector<scalar_type>& loo_values
        ) const;
        /*!
            requires
                - all the requirements for train(x,y) must be satisfied
            ensures
                - returns train(x,y)
                  (i.e. executes train(x,y) and returns its result)
                - #loo_values.size() == y.size()
                - for all valid i:
                    - #loo_values[i] == leave-one-out prediction for the value of y(i) based 
                      on all the training samples other than (x(i),y(i)).
        !*/

        template <
            typename in_sample_vector_type,
            typename in_scalar_vector_type
            >
        const decision_function<kernel_type> train (
            const in_sample_vector_type& x,
            const in_scalar_vector_type& y,
            std::vector<scalar_type>& loo_values,
            scalar_type& lambda_used 
        ) const;
        /*!
            requires
                - all the requirements for train(x,y) must be satisfied
            ensures
                - returns train(x,y)
                  (i.e. executes train(x,y) and returns its result)
                - #loo_values.size() == y.size()
                - for all valid i:
                    - #loo_values[i] == leave-one-out prediction for the value of y(i) based 
                      on all the training samples other than (x(i),y(i)).
                - #lambda_used == the value of lambda used to generate the 
                  decision_function.  Note that this lambda value is always 
                  equal to get_lambda() if get_lambda() isn't 0.
        !*/

    }; 

}

#endif // DLIB_KRR_TRAInER_ABSTRACT_H__

