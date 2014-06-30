// Copyright (C) 2010  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#undef DLIB_SVm_EPSILON_REGRESSION_TRAINER_ABSTRACT_
#ifdef DLIB_SVm_EPSILON_REGRESSION_TRAINER_ABSTRACT_

#include <cmath>
#include <limits>
#include "../matrix/matrix_abstract.h"
#include "../algs.h"
#include "function_abstract.h"
#include "kernel_abstract.h"
#include "../optimization/optimization_solve_qp3_using_smo_abstract.h"

namespace dlib
{

// ----------------------------------------------------------------------------------------

    template <
        typename K 
        >
    class svr_trainer
    {
        /*!
            REQUIREMENTS ON K 
                is a kernel function object as defined in dlib/svm/kernel_abstract.h 

            WHAT THIS OBJECT REPRESENTS
                This object implements a trainer for performing epsilon-insensitive support 
                vector regression.  It is implemented using the SMO algorithm.

                The implementation of the eps-SVR training algorithm used by this object is based
                on the following paper:
                    - Chih-Chung Chang and Chih-Jen Lin, LIBSVM : a library for support vector 
                      machines, 2001. Software available at http://www.csie.ntu.edu.tw/~cjlin/libsvm
        !*/

    public:
        typedef K kernel_type;
        typedef typename kernel_type::scalar_type scalar_type;
        typedef typename kernel_type::sample_type sample_type;
        typedef typename kernel_type::mem_manager_type mem_manager_type;
        typedef decision_function<kernel_type> trained_function_type;

        svr_trainer (
        );
        /*!
            ensures
                - This object is properly initialized and ready to be used
                  to train a support vector machine.
                - #get_c() == 1
                - #get_epsilon_insensitivity() == 0.1
                - #get_cache_size() == 200
                - #get_epsilon() == 0.001
        !*/

        void set_cache_size (
            long cache_size
        );
        /*!
            requires
                - cache_size > 0
            ensures
                - #get_cache_size() == cache_size 
        !*/

        const long get_cache_size (
        ) const;
        /*!
            ensures
                - returns the number of megabytes of cache this object will use
                  when it performs training via the this->train() function.
                  (bigger values of this may make training go faster but won't affect 
                  the result.  However, too big a value will cause you to run out of 
                  memory, obviously.)
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
                  Generally a good value for this is 0.001.  Smaller values may result
                  in a more accurate solution but take longer to execute.
        !*/

        void set_epsilon_insensitivity (
            scalar_type eps
        );
        /*!
            requires
                - eps > 0
            ensures
                - #get_epsilon_insensitivity() == eps
        !*/

        const scalar_type get_epsilon_insensitivity (
        ) const;
        /*!
            ensures
                - This object tries to find a function which minimizes the
                  regression error on a training set.  This error is measured
                  in the following way:
                    - if (abs(predicted_value - true_labeled_value) < eps) then
                        - The error is 0.  That is, any function which gets within
                          eps of the correct output is good enough.
                    - else
                        - The error grows linearly once it gets bigger than eps
                 
                  So epsilon-insensitive regression means we do regression but 
                  stop trying to fit a data point once it is "close enough".  
                  This function returns that eps value which controls what we 
                  mean by "close enough".
        !*/

        void set_kernel (
            const kernel_type& k
        );
        /*!
            ensures
                - #get_kernel() == k 
        !*/

        const kernel_type& get_kernel (
        ) const;
        /*!
            ensures
                - returns a copy of the kernel function in use by this object
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

        const scalar_type get_c (
        ) const;
        /*!
            ensures
                - returns the SVR regularization parameter.  It is the parameter that 
                  determines the trade-off between trying to reduce the training error 
                  or allowing more errors but hopefully improving the generalization 
                  of the resulting decision_function.  Larger values encourage exact 
                  fitting while smaller values of C may encourage better generalization. 
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
                - is_learning_problem(x,y) == true
                - x == a matrix or something convertible to a matrix via vector_to_matrix().
                  Also, x should contain sample_type objects.
                - y == a matrix or something convertible to a matrix via vector_to_matrix().
                  Also, y should contain scalar_type objects.
            ensures
                - performs support vector regression given the training samples in x and 
                  target values in y.  
                - returns a decision_function F with the following properties:
                    - F(new_x) == predicted y value
        !*/

        void swap (
            svr_trainer& item
        );
        /*!
            ensures
                - swaps *this and item
        !*/
    }; 

    template <typename K>
    void swap (
        svr_trainer<K>& a,
        svr_trainer<K>& b
    ) { a.swap(b); }
    /*!
        provides a global swap
    !*/

// ----------------------------------------------------------------------------------------

}

#endif // DLIB_SVm_EPSILON_REGRESSION_TRAINER_ABSTRACT_



