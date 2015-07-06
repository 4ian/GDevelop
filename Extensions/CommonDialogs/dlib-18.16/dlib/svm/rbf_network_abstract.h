// Copyright (C) 2008  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#undef DLIB_RBf_NETWORK_ABSTRACT_
#ifdef DLIB_RBf_NETWORK_ABSTRACT_

#include "../algs.h"
#include "function_abstract.h"
#include "kernel_abstract.h"

namespace dlib
{

// ----------------------------------------------------------------------------------------

    template <
        typename K 
        >
    class rbf_network_trainer 
    {
        /*!
            REQUIREMENTS ON K 
                is a kernel function object as defined in dlib/svm/kernel_abstract.h 
                (since this is supposed to be a RBF network it is probably reasonable
                to use some sort of radial basis kernel)

            INITIAL VALUE
                - get_num_centers() == 10 

            WHAT THIS OBJECT REPRESENTS
                This object implements a trainer for a radial basis function network.

                The implementation of this algorithm follows the normal RBF training 
                process.  For more details see the code or the Wikipedia article
                about RBF networks.  
        !*/

    public:
        typedef K kernel_type;
        typedef typename kernel_type::scalar_type scalar_type;
        typedef typename kernel_type::sample_type sample_type;
        typedef typename kernel_type::mem_manager_type mem_manager_type;
        typedef decision_function<kernel_type> trained_function_type;

        rbf_network_trainer (
        ); 
        /*!
            ensures
                - this object is properly initialized
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

        void set_num_centers (
            const unsigned long num_centers
        );
        /*!
            ensures
                - #get_num_centers() == num_centers
        !*/

        const unsigned long get_num_centers (
        ) const;
        /*!
            ensures
                - returns the maximum number of centers (a.k.a. basis_vectors in the 
                  trained decision_function) you will get when you train this object on data.
        !*/

        template <
            typename in_sample_vector_type,
            typename in_scalar_vector_type
            >
        const decision_function<kernel_type> train (
            const in_sample_vector_type& x,
            const in_scalar_vector_type& y
        ) const
        /*!
            requires
                - x == a matrix or something convertible to a matrix via mat().
                  Also, x should contain sample_type objects.
                - y == a matrix or something convertible to a matrix via mat().
                  Also, y should contain scalar_type objects.
                - is_learning_problem(x,y) == true
            ensures
                - trains a RBF network given the training samples in x and 
                  labels in y and returns the resulting decision_function
            throws
                - std::bad_alloc
        !*/

        void swap (
            rbf_network_trainer& item
        );
        /*!
            ensures
                - swaps *this and item
        !*/

    }; 

// ----------------------------------------------------------------------------------------

    template <typename K>
    void swap (
        rbf_network_trainer<K>& a,
        rbf_network_trainer<K>& b
    ) { a.swap(b); }
    /*!
        provides a global swap
    !*/

// ----------------------------------------------------------------------------------------

}

#endif // DLIB_RBf_NETWORK_ABSTRACT_



