// Copyright (C) 2008  Davis E. King (davisking@users.sourceforge.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#undef DLIB_RVm_ABSTRACT_
#ifdef DLIB_RVm_ABSTRACT_

#include "rvm_abstract.h"
#include <cmath>
#include <limits>
#include "../matrix.h"
#include "../algs.h"
#include "function.h"
#include "kernel.h"

namespace dlib
{

// ----------------------------------------------------------------------------------------

    template <
        typename kern_type 
        >
    class rvm_trainer 
    {
        /*!
            REQUIREMENTS ON kern_type
                is a kernel function object as defined in dlib/svm/kernel_abstract.h 

            WHAT THIS OBJECT REPRESENTS
                This object implements a trainer for a relevance vector machine for 
                solving binary classification problems.

                The implementation of the RVM training algorithm used by this object is based
                on the following excellent paper:
                    Tipping, M. E. and A. C. Faul (2003). Fast marginal likelihood maximisation 
                    for sparse Bayesian models. In C. M. Bishop and B. J. Frey (Eds.), Proceedings 
                    of the Ninth International Workshop on Artificial Intelligence and Statistics, 
                    Key West, FL, Jan 3-6.
        !*/

    public:
        typedef kern_type kernel_type;
        typedef typename kernel_type::scalar_type scalar_type;
        typedef typename kernel_type::sample_type sample_type;
        typedef typename kernel_type::mem_manager_type mem_manager_type;
        typedef decision_function<kernel_type> trained_function_type;

        rvm_trainer (
        );
        /*!
            ensures
                - This object is properly initialized and ready to be used
                  to train a relevance vector machine.
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
                - is_binary_classification_problem(x,y) == true
                - x == a matrix or something convertible to a matrix via vector_to_matrix().
                  Also, x should contain sample_type objects.
                - y == a matrix or something convertible to a matrix via vector_to_matrix().
                  Also, y should contain scalar_type objects.
            ensures
                - trains a relevance vector classifier given the training samples in x and 
                  labels in y.  
                - returns a decision function F with the following properties:
                    - if (new_x is a sample predicted have +1 label) then
                        - F(new_x) >= 0
                    - else
                        - F(new_x) < 0
            throws
                - std::bad_alloc
        !*/

        void swap (
            rvm_trainer& item
        );
        /*!
            ensures
                - swaps *this and item
        !*/

    };  

// ----------------------------------------------------------------------------------------

    template <typename K>
    void swap (
        rvm_trainer<K>& a,
        rvm_trainer<K>& b
    ) { a.swap(b); }
    /*!
        provides a global swap
    !*/

// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------

    template <
        typename kern_type 
        >
    class rvm_regression_trainer
    {
        /*!
            REQUIREMENTS ON kern_type
                is a kernel function object as defined in dlib/svm/kernel_abstract.h 

            WHAT THIS OBJECT REPRESENTS
                This object implements a trainer for a relevance vector machine for 
                solving regression problems.

                The implementation of the RVM training algorithm used by this object is based
                on the following excellent paper:
                    Tipping, M. E. and A. C. Faul (2003). Fast marginal likelihood maximisation 
                    for sparse Bayesian models. In C. M. Bishop and B. J. Frey (Eds.), Proceedings 
                    of the Ninth International Workshop on Artificial Intelligence and Statistics, 
                    Key West, FL, Jan 3-6.
        !*/

    public:
        typedef kern_type kernel_type;
        typedef typename kernel_type::scalar_type scalar_type;
        typedef typename kernel_type::sample_type sample_type;
        typedef typename kernel_type::mem_manager_type mem_manager_type;
        typedef decision_function<kernel_type> trained_function_type;

        rvm_regression_trainer (
        );
        /*!
            ensures
                - This object is properly initialized and ready to be used
                  to train a relevance vector machine.
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
                - x.nr() > 1
                - x.nr() == y.nr() && x.nc() == 1 && y.nc() == 1 
                  (i.e. x and y are both column vectors of the same length)
            ensures
                - trains a RVM given the training samples in x and 
                  labels in y and returns the resulting decision_function.  
            throws
                - std::bad_alloc
        !*/

        void swap (
            rvm_regression_trainer& item
        );
        /*!
            ensures
                - swaps *this and item
        !*/

    };  

// ----------------------------------------------------------------------------------------

    template <typename K>
    void swap (
        rvm_regression_trainer<K>& a,
        rvm_regression_trainer<K>& b
    ) { a.swap(b); }
    /*!
        provides a global swap
    !*/

// ----------------------------------------------------------------------------------------

}

#endif // DLIB_RVm_ABSTRACT_

