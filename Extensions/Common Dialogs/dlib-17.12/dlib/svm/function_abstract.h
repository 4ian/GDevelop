// Copyright (C) 2007  Davis E. King (davisking@users.sourceforge.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#undef DLIB_SVm_FUNCTION_ABSTRACT_
#ifdef DLIB_SVm_FUNCTION_ABSTRACT_

#include <cmath>
#include <limits>
#include <sstream>
#include "../matrix/matrix_abstract.h"
#include "../algs.h"
#include "../serialize.h"
#include "../statistics/statistics_abstract.h"

namespace dlib
{

// ----------------------------------------------------------------------------------------

    template <
        typename K
        >
    struct decision_function 
    {
        /*!
            REQUIREMENTS ON K
                K must be a kernel function object type as defined at the
                top of dlib/svm/kernel_abstract.h

            WHAT THIS OBJECT REPRESENTS 
                This object represents a decision or regression function that was 
                learned by a kernel based learning algorithm.  
        !*/

        typedef typename K::scalar_type scalar_type;
        typedef typename K::sample_type sample_type;
        typedef typename K::mem_manager_type mem_manager_type;

        typedef matrix<scalar_type,0,1,mem_manager_type> scalar_vector_type;
        typedef matrix<sample_type,0,1,mem_manager_type> sample_vector_type;

        scalar_vector_type alpha;
        scalar_type        b;
        K                  kernel_function;
        sample_vector_type support_vectors;

        decision_function (
        );
        /*!
            ensures
                - #b == 0
                - #alpha.nr() == 0
                - #support_vectors.nr() == 0
        !*/

        decision_function (
            const decision_function& f
        );
        /*!
            ensures
                - #*this is a copy of f
        !*/

        decision_function (
            const scalar_vector_type& alpha_,
            const scalar_type& b_,
            const K& kernel_function_,
            const sample_vector_type& support_vectors_
        ) : alpha(alpha_), b(b_), kernel_function(kernel_function_), support_vectors(support_vectors_) {}
        /*!
            ensures
                - populates the decision function with the given support vectors, weights(i.e. alphas),
                  b term, and kernel function.
        !*/

        decision_function& operator= (
            const decision_function& d
        );
        /*!
            ensures
                - #*this is identical to d
                - returns *this
        !*/

        scalar_type operator() (
            const sample_type& x
        ) const
        /*!
            ensures
                - evaluates this sample according to the decision
                  function contained in this object.
        !*/
        {
            scalar_type temp = 0;
            for (long i = 0; i < alpha.nr(); ++i)
                temp += alpha(i) * kernel_function(x,support_vectors(i));

            return temp - b;
        }
    };

    template <
        typename K
        >
    void serialize (
        const decision_function<K>& item,
        std::ostream& out
    );
    /*!
        provides serialization support for decision_function
    !*/

    template <
        typename K
        >
    void deserialize (
        decision_function<K>& item,
        std::istream& in 
    );
    /*!
        provides serialization support for decision_function
    !*/

// ----------------------------------------------------------------------------------------

    template <
        typename K
        >
    struct probabilistic_decision_function 
    {
        /*!
            REQUIREMENTS ON K
                K must be a kernel function object type as defined at the
                top of dlib/svm/kernel_abstract.h

            WHAT THIS OBJECT REPRESENTS 
                This object represents a binary decision function that returns an 
                estimate of the probability that a given sample is in the +1 class.
        !*/

        typedef typename K::scalar_type scalar_type;
        typedef typename K::sample_type sample_type;
        typedef typename K::mem_manager_type mem_manager_type;

        scalar_type a;
        scalar_type b;
        decision_function<K> decision_funct;

        probabilistic_decision_function (
        );
        /*!
            ensures
                - #a == 0
                - #b == 0
                - #decision_function has its initial value
        !*/

        probabilistic_decision_function (
            const probabilistic_decision_function& f
        );
        /*!
            ensures
                - #*this is a copy of f
        !*/

        probabilistic_decision_function (
            const scalar_type a_,
            const scalar_type b_,
            const decision_function<K>& decision_funct_ 
        ) : a(a_), b(b_), decision_funct(decision_funct_) {}
        /*!
            ensures
                - populates the probabilistic decision function with the given a, b, 
                  and decision_function.
        !*/

        probabilistic_decision_function& operator= (
            const probabilistic_decision_function& d
        );
        /*!
            ensures
                - #*this is identical to d
                - returns *this
        !*/

        scalar_type operator() (
            const sample_type& x
        ) const
        /*!
            ensures
                - returns a number P such that:
                    - 0 <= P <= 1
                    - P represents the probability that sample x is from 
                      the class +1
        !*/
        {
            // Evaluate the normal SVM decision function
            scalar_type f = decision_funct(x);
            // Now basically normalize the output so that it is a properly
            // conditioned probability of x being in the +1 class given
            // the output of the SVM.
            return 1/(1 + std::exp(a*f + b));
        }
    };

    template <
        typename K
        >
    void serialize (
        const probabilistic_decision_function<K>& item,
        std::ostream& out
    );
    /*!
        provides serialization support for probabilistic_decision_function
    !*/

    template <
        typename K
        >
    void deserialize (
        probabilistic_decision_function<K>& item,
        std::istream& in 
    );
    /*!
        provides serialization support for probabilistic_decision_function
    !*/

// ----------------------------------------------------------------------------------------

    template <
        typename K
        >
    struct distance_function 
    {
        /*!
            REQUIREMENTS ON K
                K must be a kernel function object type as defined at the
                top of dlib/svm/kernel_abstract.h

            WHAT THIS OBJECT REPRESENTS 
                This object represents a point in kernel induced feature space. 
                You may use this object to find the distance from the point it 
                represents to points in input space.
        !*/

        typedef typename K::scalar_type scalar_type;
        typedef typename K::sample_type sample_type;
        typedef typename K::mem_manager_type mem_manager_type;

        typedef matrix<scalar_type,0,1,mem_manager_type> scalar_vector_type;
        typedef matrix<sample_type,0,1,mem_manager_type> sample_vector_type;

        scalar_vector_type alpha;
        scalar_type        b;
        K                  kernel_function;
        sample_vector_type support_vectors;

        distance_function (
        );
        /*!
            ensures
                - #b == 0
                - #alpha.nr() == 0
                - #support_vectors.nr() == 0
        !*/

        distance_function (
            const distance_function& f
        );
        /*!
            ensures
                - #*this is a copy of f
        !*/

        distance_function (
            const scalar_vector_type& alpha_,
            const scalar_type& b_,
            const K& kernel_function_,
            const sample_vector_type& support_vectors_
        ) : alpha(alpha_), b(b_), kernel_function(kernel_function_), support_vectors(support_vectors_) {}
        /*!
            ensures
                - populates the decision function with the given support vectors, weights(i.e. alphas),
                  b term, and kernel function.
        !*/

        distance_function& operator= (
            const distance_function& d
        );
        /*!
            ensures
                - #*this is identical to d
                - returns *this
        !*/

        scalar_type operator() (
            const sample_type& x
        ) const
        /*!
            ensures
                - Let O(x) represent the point x projected into kernel induced feature space.
                - let c == sum alpha(i)*O(support_vectors(i)) == the point in kernel space that
                  this object represents.
                - Then this object returns the distance between the points O(x) and c in kernel
                  space. 
        !*/
        {
            scalar_type temp = 0;
            for (long i = 0; i < alpha.nr(); ++i)
                temp += alpha(i) * kernel_function(x,support_vectors(i));

            temp = b + kernel_function(x,x) - 2*temp; 
            if (temp > 0)
                return std::sqrt(temp);
            else
                return 0;
        }

        scalar_type operator() (
            const distance_function& x
        ) const
        /*!
            ensures
                - returns the distance between the points in kernel space represented by *this and x.
        !*/
        {
            scalar_type temp = 0;
            for (long i = 0; i < alpha.nr(); ++i)
                for (long j = 0; j < x.alpha.nr(); ++j)
                    temp += alpha(i)*x.alpha(j) * kernel_function(support_vectors(i), x.support_vectors(j));

            temp = b + x.b - 2*temp;
            if (temp > 0)
                return std::sqrt(temp);
            else
                return 0;
        }
    };

    template <
        typename K
        >
    void serialize (
        const distance_function<K>& item,
        std::ostream& out
    );
    /*!
        provides serialization support for distance_function
    !*/

    template <
        typename K
        >
    void deserialize (
        distance_function<K>& item,
        std::istream& in 
    );
    /*!
        provides serialization support for distance_function
    !*/

// ----------------------------------------------------------------------------------------

    template <
        typename function_type
        >
    struct normalized_function 
    {
        /*!
            REQUIREMENTS ON function_type 
                - function_type must be a function object with an overloaded
                  operator() similar to the other function objects defined in
                  this file.
                - function_type::sample_type must be a dlib::matrix column
                  matrix type

            WHAT THIS OBJECT REPRESENTS 
                This object represents a container for another function
                object and an instance of the vector_normalizer object.  

                It automatically noramlizes all inputs before passing them
                off to the contained function object.
        !*/

        typedef typename function_type::scalar_type scalar_type;
        typedef typename function_type::sample_type sample_type;
        typedef typename function_type::mem_manager_type mem_manager_type;

        vector_normalizer<sample_type> normalizer;
        function_type function;

        normalized_function (
        );
        /*!
            ensures
                - the members of this object have their default values
        !*/

        normalized_function (
            const normalized_function& f
        );
        /*!
            ensures
                - #*this is a copy of f
        !*/

        normalized_function (
            const vector_normalizer<sample_type>& normalizer_,
            const function_type& funct 
        ) : normalizer(normalizer_), function(funct) {}
        /*!
            ensures
                - populates this object with the vector_normalizer and function object 
        !*/

        normalized_function& operator= (
            const normalized_function& d
        );
        /*!
            ensures
                - #*this is identical to d
                - returns *this
        !*/

        scalar_type operator() (
            const sample_type& x
        ) const
        /*!
            ensures
                - returns function(normalizer(x))
        !*/
    };

    template <
        typename K
        >
    void serialize (
        const normalized_function<K>& item,
        std::ostream& out
    );
    /*!
        provides serialization support for normalized_function
    !*/

    template <
        typename K
        >
    void deserialize (
        normalized_function<K>& item,
        std::istream& in 
    );
    /*!
        provides serialization support for normalized_function
    !*/

// ----------------------------------------------------------------------------------------

}

#endif // DLIB_SVm_FUNCTION_ABSTRACT_



