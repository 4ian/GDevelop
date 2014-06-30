// Copyright (C) 2008  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#undef DLIB_KRLs_ABSTRACT_
#ifdef DLIB_KRLs_ABSTRACT_

#include <cmath>
#include "../matrix/matrix_abstract.h"
#include "../algs.h"
#include "../serialize.h"
#include "kernel_abstract.h"

namespace dlib
{

    template <
        typename kernel_type
        >
    class krls
    {
        /*!
            REQUIREMENTS ON kernel_type
                is a kernel function object as defined in dlib/svm/kernel_abstract.h 

            INITIAL VALUE
                - dictionary_size() == 0

            WHAT THIS OBJECT REPRESENTS
                This is an implementation of the kernel recursive least squares algorithm 
                described in the paper:
                    The Kernel Recursive Least Squares Algorithm by Yaakov Engel.

                The long and short of this algorithm is that it is an online kernel based 
                regression algorithm.  You give it samples (x,y) and it learns the function
                f(x) == y.  For a detailed description of the algorithm read the above paper.

                Also note that the algorithm internally keeps a set of "dictionary vectors" 
                that are used to represent the regression function.  You can force the 
                algorithm to use no more than a set number of vectors by setting 
                the 3rd constructor argument to whatever you want.  However, note that 
                doing this causes the algorithm to bias it's results towards more 
                recent training examples.  
        !*/

    public:
        typedef typename kernel_type::scalar_type scalar_type;
        typedef typename kernel_type::sample_type sample_type;
        typedef typename kernel_type::mem_manager_type mem_manager_type;


        explicit krls (
            const kernel_type& kernel_, 
            scalar_type tolerance_ = 0.001,
            unsigned long max_dictionary_size_ = 1000000
        );
        /*!
            requires
                - tolerance >= 0
            ensures
                - this object is properly initialized
                - #tolerance() == tolerance_
                - #get_decision_function().kernel_function == kernel_
                  (i.e. this object will use the given kernel function)
                - #get_kernel() == kernel_
                - #max_dictionary_size() == max_dictionary_size_
        !*/

        scalar_type tolerance(
        ) const;
        /*!
            ensures
                - returns the tolerance to use for the approximately linearly dependent 
                  test in the KRLS algorithm.  This is a number which governs how 
                  accurately this object will approximate the decision function it is 
                  learning.  Smaller values generally result in a more accurate 
                  estimate while also resulting in a bigger set of dictionary vectors in 
                  the learned decision function.  Bigger tolerances values result in a 
                  less accurate decision function but also in less dictionary vectors.
                - The exact meaning of the tolerance parameter is the following: 
                  Imagine that we have an empirical_kernel_map that contains all
                  the current dictionary vectors.  Then the tolerance is the minimum
                  projection error (as given by empirical_kernel_map::project()) required
                  to cause us to include a new vector in the dictionary.  So each time
                  you call train() the krls object basically just computes the projection
                  error for that new sample and if it is larger than the tolerance
                  then that new sample becomes part of the dictionary.
        !*/

        const kernel_type& get_kernel (
        ) const;
        /*!
            ensures
                - returns a const reference to the kernel used by this object
        !*/

        unsigned long max_dictionary_size(
        ) const;
        /*!
            ensures
                - returns the maximum number of dictionary vectors this object
                  will use at a time.  That is, dictionary_size() will never be
                  greater than max_dictionary_size().
        !*/

        void clear_dictionary (
        );
        /*!
            ensures
                - clears out all learned data 
                  (e.g. #get_decision_function().basis_vectors.size() == 0)
        !*/

        scalar_type operator() (
            const sample_type& x
        ) const;
        /*!
            ensures
                - returns the current y estimate for the given x
        !*/

        void train (
            const sample_type& x,
            scalar_type y
        );
        /*!
            ensures
                - trains this object that the given x should be mapped to the given y
                - if (dictionary_size() == max_dictionary_size() and training
                  would add another dictionary vector to this object) then
                    - discards the oldest dictionary vector so that we can still
                      add a new one and remain below the max number of dictionary
                      vectors.
        !*/

        void swap (
            krls& item
        );
        /*!
            ensures
                - swaps *this with item
        !*/

        unsigned long dictionary_size (
        ) const;
        /*!
            ensures
                - returns the number of vectors in the dictionary.  That is,
                  returns a number equal to get_decision_function().basis_vectors.size()
        !*/

        decision_function<kernel_type> get_decision_function (
        ) const;
        /*!
            ensures
                - returns a decision function F that represents the function learned
                  by this object so far.  I.e. it is the case that:
                    - for all x: F(x) == (*this)(x)
        !*/

    };

// ----------------------------------------------------------------------------------------

    template <
        typename kernel_type
        >
    void swap(
        krls<kernel_type>& a, 
        krls<kernel_type>& b
    )
    { a.swap(b); }
    /*!
        provides a global swap function
    !*/

    template <
        typename kernel_type
        >
    void serialize (
        const krls<kernel_type>& item,
        std::ostream& out
    );
    /*!
        provides serialization support for krls objects
    !*/

    template <
        typename kernel_type 
        >
    void deserialize (
        krls<kernel_type>& item,
        std::istream& in 
    );
    /*!
        provides serialization support for krls objects
    !*/

// ----------------------------------------------------------------------------------------

}

#endif // DLIB_KRLs_ABSTRACT_

