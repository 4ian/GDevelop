// Copyright (C) 2008  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#undef DLIB_REDUCED_TRAINERs_ABSTRACT_
#ifdef DLIB_REDUCED_TRAINERs_ABSTRACT_

#include "../matrix.h"
#include "../algs.h"
#include "function_abstract.h"
#include "kernel_abstract.h"
#include "../optimization.h"

namespace dlib
{

// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------

    template <
        typename trainer_type 
        >
    class reduced_decision_function_trainer
    {
        /*!
            REQUIREMENTS ON trainer_type
                - trainer_type == some kind of batch trainer object (e.g. svm_nu_trainer)

            WHAT THIS OBJECT REPRESENTS
                This object represents an implementation of a reduced set algorithm.  
                This object acts as a post processor for anything that creates 
                decision_function objects.  It wraps another trainer object and 
                performs this reduced set post processing with the goal of 
                representing the original decision function in a form that 
                involves fewer basis vectors.
        !*/

    public:
        typedef typename trainer_type::kernel_type kernel_type;
        typedef typename trainer_type::scalar_type scalar_type;
        typedef typename trainer_type::sample_type sample_type;
        typedef typename trainer_type::mem_manager_type mem_manager_type;
        typedef typename trainer_type::trained_function_type trained_function_type;

        reduced_decision_function_trainer (
        );
        /*!
            ensures
                - This object is in an uninitialized state.  You must
                  construct a real one with the other constructor and assign it
                  to this instance before you use this object.
        !*/

        reduced_decision_function_trainer (
            const trainer_type& trainer,
            const unsigned long num_bv 
        );
        /*!
            requires
                - num_bv > 0
            ensures
                - returns a trainer object that applies post processing to the decision_function
                  objects created by the given trainer object with the goal of creating
                  decision_function objects with fewer basis vectors.
                - The reduced decision functions that are output will have at most
                  num_bv basis vectors.
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
            ensures
                - trains a decision_function using the trainer that was supplied to
                  this object's constructor and then finds a reduced representation
                  for it and returns the reduced version.  
            throws
                - std::bad_alloc
                - any exceptions thrown by the trainer_type object
        !*/

    }; 

// ----------------------------------------------------------------------------------------

    template <
        typename trainer_type
        >
    const reduced_decision_function_trainer<trainer_type> reduced (
        const trainer_type& trainer,
        const unsigned long num_bv
    ) { return reduced_decision_function_trainer<trainer_type>(trainer, num_bv); }
    /*!
        requires
            - num_bv > 0
            - trainer_type == some kind of batch trainer object that creates decision_function
              objects (e.g. svm_nu_trainer)
        ensures
            - returns a reduced_decision_function_trainer object that has been
              instantiated with the given arguments.
    !*/

// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------

    template <
        typename K,
        typename stop_strategy_type,
        typename T
        >
    distance_function<K> approximate_distance_function (
        stop_strategy_type stop_strategy,
        const distance_function<K>& target,
        const T& starting_basis
    );
    /*!
        requires
            - stop_strategy == an object that defines a stop strategy such as one of 
              the objects from dlib/optimization/optimization_stop_strategies_abstract.h
            - requirements on starting_basis
                - T must be a dlib::matrix type or something convertible to a matrix via vector_to_matrix()
                  (e.g. a std::vector).  Additionally, starting_basis must contain K::sample_type
                  objects which can be supplied to the kernel function used by target.
                - is_vector(starting_basis) == true
                - starting_basis.size() > 0
            - target.get_basis_vectors().size() > 0 
            - kernel_derivative<K> is defined
              (i.e. The analytic derivative for the given kernel must be defined)
            - K::sample_type must be a dlib::matrix object and the basis_vectors inside target
              and starting_basis must be column vectors.
        ensures
            - This routine attempts to find a distance_function object which is close
              to the given target.  That is, it searches for an X such that target(X) is
              minimized.  The optimization begins with an X in the span of the elements
              of starting_basis and searches for an X which locally minimizes target(X).  
              Since this problem can have many local minima, the quality of the starting 
              basis can significantly influence the results.   
            - The optimization is over all variables in a distance_function, however,
              the size of the basis set is constrained to no more than starting_basis.size().
              That is, in the returned distance_function DF, we will have: 
                - DF.get_basis_vectors().size() <= starting_basis.size()
            - The optimization is carried out until the stop_strategy indicates it 
              should stop.
    !*/

// ----------------------------------------------------------------------------------------

    template <
        typename trainer_type 
        >
    class reduced_decision_function_trainer2
    {
        /*!
            REQUIREMENTS ON trainer_type
                - trainer_type == some kind of batch trainer object (e.g. svm_nu_trainer)
                - trainer_type::sample_type must be a dlib::matrix object
                - kernel_derivative<trainer_type::kernel_type> must be defined

            WHAT THIS OBJECT REPRESENTS
                This object represents an implementation of a reduced set algorithm.  
                This object acts as a post processor for anything that creates 
                decision_function objects.  It wraps another trainer object and 
                performs this reduced set post processing with the goal of 
                representing the original decision function in a form that 
                involves fewer basis vectors.

                This object's implementation is the same as that in the above
                reduced_decision_function_trainer object except it also performs 
                a global gradient based optimization at the end to further
                improve the approximation to the original decision function
                object. 
        !*/

    public:
        typedef typename trainer_type::kernel_type kernel_type;
        typedef typename trainer_type::scalar_type scalar_type;
        typedef typename trainer_type::sample_type sample_type;
        typedef typename trainer_type::mem_manager_type mem_manager_type;
        typedef typename trainer_type::trained_function_type trained_function_type;

        reduced_decision_function_trainer2 (
        );
        /*!
            ensures
                - This object is in an uninitialized state.  You must
                  construct a real one with the other constructor and assign it
                  to this instance before you use this object.
        !*/

        reduced_decision_function_trainer2 (
            const trainer_type& trainer,
            const unsigned long num_bv,
            double eps = 1e-3
        );
        /*!
            requires
                - num_bv > 0
                - eps > 0
            ensures
                - returns a trainer object that applies post processing to the decision_function
                  objects created by the given trainer object with the goal of creating
                  decision_function objects with fewer basis vectors.
                - The reduced decision functions that are output will have at most
                  num_bv basis vectors.
                - the gradient based optimization will continue until the change in the
                  objective function is less than eps.  So smaller values of eps will
                  give better results but take longer to compute.
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
                - x must be a list of objects which are each some kind of dlib::matrix 
                  which represents column or row vectors.
            ensures
                - trains a decision_function using the trainer that was supplied to
                  this object's constructor and then finds a reduced representation
                  for it and returns the reduced version.  
            throws
                - std::bad_alloc
                - any exceptions thrown by the trainer_type object
        !*/

    }; 

// ----------------------------------------------------------------------------------------

    template <
        typename trainer_type
        >
    const reduced_decision_function_trainer2<trainer_type> reduced2 (
        const trainer_type& trainer,
        const unsigned long num_bv,
        double eps = 1e-3
    ) { return reduced_decision_function_trainer2<trainer_type>(trainer, num_bv, eps); }
    /*!
        requires
            - num_bv > 0
            - trainer_type == some kind of batch trainer object that creates decision_function
              objects (e.g. svm_nu_trainer)
            - kernel_derivative<trainer_type::kernel_type> is defined
            - eps > 0
        ensures
            - returns a reduced_decision_function_trainer2 object that has been
              instantiated with the given arguments.
    !*/

// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------

}

#endif // DLIB_REDUCED_TRAINERs_ABSTRACT_

