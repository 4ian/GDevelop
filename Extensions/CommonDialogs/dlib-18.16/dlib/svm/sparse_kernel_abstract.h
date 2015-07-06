// Copyright (C) 2009  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#undef DLIB_SVm_SPARSE_KERNEL_ABSTRACT_
#ifdef DLIB_SVm_SPARSE_KERNEL_ABSTRACT_

#include <cmath>
#include <limits>
#include "../algs.h"
#include "../serialize.h"
#include "kernel_abstract.h"
#include "sparse_vector_abstract.h"

namespace dlib
{

// ----------------------------------------------------------------------------------------

    template <
        typename T
        >
    struct sparse_radial_basis_kernel
    {
        /*!
            REQUIREMENTS ON T
                Must be a sparse vector as defined in dlib/svm/sparse_vector_abstract.h

            WHAT THIS OBJECT REPRESENTS
                This object represents a radial basis function kernel
                that works with sparse vectors.

            THREAD SAFETY
                This kernel is threadsafe.  
        !*/

        typedef typename T::value_type::second_type scalar_type;
        typedef T sample_type;
        typedef default_memory_manager mem_manager_type;

        const scalar_type gamma;

        sparse_radial_basis_kernel(
        );
        /*!
            ensures
                - #gamma == 0.1 
        !*/

        sparse_radial_basis_kernel(
            const sparse_radial_basis_kernel& k
        );
        /*!
            ensures
                - #gamma == k.gamma
        !*/

        sparse_radial_basis_kernel(
            const scalar_type g
        );
        /*!
            ensures
                - #gamma == g
        !*/

        scalar_type operator() (
            const sample_type& a,
            const sample_type& b
        ) const;
        /*!
            requires
                - a is a sparse vector
                - b is a sparse vector
            ensures
                - returns exp(-gamma * distance_squared(a,b))
        !*/

        sparse_radial_basis_kernel& operator= (
            const sparse_radial_basis_kernel& k
        );
        /*!
            ensures
                - #gamma = k.gamma
                - returns *this
        !*/

        bool operator== (
            const sparse_radial_basis_kernel& k
        ) const;
        /*!
            ensures
                - if (k and *this are identical) then
                    - returns true
                - else
                    - returns false
        !*/

    };

    template <
        typename T
        >
    void serialize (
        const sparse_radial_basis_kernel<T>& item,
        std::ostream& out
    );
    /*!
        provides serialization support for sparse_radial_basis_kernel
    !*/

    template <
        typename T
        >
    void deserialize (
        sparse_radial_basis_kernel<T>& item,
        std::istream& in 
    );
    /*!
        provides deserialization support for sparse_radial_basis_kernel
    !*/

// ----------------------------------------------------------------------------------------

    template <
        typename T
        >
    struct sparse_sigmoid_kernel
    {
        /*!
            REQUIREMENTS ON T
                Must be a sparse vector as defined in dlib/svm/sparse_vector_abstract.h

            WHAT THIS OBJECT REPRESENTS
                This object represents a sigmoid kernel
                that works with sparse vectors.

            THREAD SAFETY
                This kernel is threadsafe.  
        !*/

        typedef typename T::value_type::second_type scalar_type;
        typedef T sample_type;
        typedef default_memory_manager mem_manager_type;

        const scalar_type gamma;
        const scalar_type coef;

        sparse_sigmoid_kernel(
        );
        /*!
            ensures
                - #gamma == 0.1 
                - #coef == -1.0 
        !*/

        sparse_sigmoid_kernel(
            const sparse_sigmoid_kernel& k
        );
        /*!
            ensures
                - #gamma == k.gamma
                - #coef == k.coef
        !*/

        sparse_sigmoid_kernel(
            const scalar_type g,
            const scalar_type c
        );
        /*!
            ensures
                - #gamma == g
                - #coef == c
        !*/

        scalar_type operator() (
            const sample_type& a,
            const sample_type& b
        ) const;
        /*!
            requires
                - a is a sparse vector
                - b is a sparse vector
            ensures
                - returns tanh(gamma * dot(a,b) + coef)
        !*/

        sparse_sigmoid_kernel& operator= (
            const sparse_sigmoid_kernel& k
        );
        /*!
            ensures
                - #gamma = k.gamma
                - #coef = k.coef
                - returns *this
        !*/

        bool operator== (
            const sparse_sigmoid_kernel& k
        ) const;
        /*!
            ensures
                - if (k and *this are identical) then
                    - returns true
                - else
                    - returns false
        !*/
    };

    template <
        typename T
        >
    void serialize (
        const sparse_sigmoid_kernel<T>& item,
        std::ostream& out
    );
    /*!
        provides serialization support for sparse_sigmoid_kernel
    !*/

    template <
        typename T
        >
    void deserialize (
        sparse_sigmoid_kernel<T>& item,
        std::istream& in 
    );
    /*!
        provides deserialization support for sparse_sigmoid_kernel
    !*/


// ----------------------------------------------------------------------------------------

    template <
        typename T
        >
    struct sparse_polynomial_kernel
    {
        /*!
            REQUIREMENTS ON T
                Must be a sparse vector as defined in dlib/svm/sparse_vector_abstract.h

            WHAT THIS OBJECT REPRESENTS
                This object represents a polynomial kernel
                that works with sparse vectors.

            THREAD SAFETY
                This kernel is threadsafe.  
        !*/

        typedef typename T::value_type::second_type scalar_type;
        typedef T sample_type;
        typedef default_memory_manager mem_manager_type;

        const scalar_type gamma;
        const scalar_type coef;
        const scalar_type degree;

        sparse_polynomial_kernel(
        );
        /*!
            ensures
                - #gamma == 1 
                - #coef == 0 
                - #degree == 1 
        !*/

        sparse_polynomial_kernel(
            const sparse_polynomial_kernel& k
        );
        /*!
            ensures
                - #gamma == k.gamma
                - #coef == k.coef
                - #degree == k.degree
        !*/

        sparse_polynomial_kernel(
            const scalar_type g,
            const scalar_type c,
            const scalar_type d
        );
        /*!
            ensures
                - #gamma == g
                - #coef == c
                - #degree == d
        !*/

        scalar_type operator() (
            const sample_type& a,
            const sample_type& b
        ) const;
        /*!
            requires
                - a is a sparse vector
                - b is a sparse vector
            ensures
                - returns pow(gamma * dot(a,b) + coef, degree)
        !*/

        sparse_polynomial_kernel& operator= (
            const sparse_polynomial_kernel& k
        );
        /*!
            ensures
                - #gamma = k.gamma
                - #coef = k.coef
                - #degree = k.degree
                - returns *this
        !*/

        bool operator== (
            const sparse_polynomial_kernel& k
        ) const;
        /*!
            ensures
                - if (k and *this are identical) then
                    - returns true
                - else
                    - returns false
        !*/
    };

    template <
        typename T
        >
    void serialize (
        const sparse_polynomial_kernel<T>& item,
        std::ostream& out
    );
    /*!
        provides serialization support for sparse_polynomial_kernel
    !*/

    template <
        typename T
        >
    void deserialize (
        sparse_polynomial_kernel<T>& item,
        std::istream& in 
    );
    /*!
        provides deserialization support for sparse_polynomial_kernel
    !*/

// ----------------------------------------------------------------------------------------

    template <
        typename T
        >
    struct sparse_linear_kernel
    {
        /*!
            REQUIREMENTS ON T
                Must be a sparse vector as defined in dlib/svm/sparse_vector_abstract.h

            WHAT THIS OBJECT REPRESENTS
                This object represents a linear function kernel
                that works with sparse vectors.

            THREAD SAFETY
                This kernel is threadsafe.  
        !*/

        typedef typename T::value_type::second_type scalar_type;
        typedef T sample_type;
        typedef default_memory_manager mem_manager_type;

        scalar_type operator() (
            const sample_type& a,
            const sample_type& b
        ) const;
        /*!
            requires
                - a is a sparse vector
                - b is a sparse vector
            ensures
                - returns dot(a,b) 
        !*/

        bool operator== (
            const sparse_linear_kernel& k
        ) const;
        /*!
            ensures
                - returns true
        !*/
    };

    template <
        typename T
        >
    void serialize (
        const sparse_linear_kernel<T>& item,
        std::ostream& out
    );
    /*!
        provides serialization support for sparse_linear_kernel
    !*/

    template <
        typename T
        >
    void deserialize (
        sparse_linear_kernel<T>& item,
        std::istream& in 
    );
    /*!
        provides deserialization support for sparse_linear_kernel 
    !*/

// ----------------------------------------------------------------------------------------

    template <
        typename T
        >
    struct sparse_histogram_intersection_kernel
    {
        /*!
            REQUIREMENTS ON T
                Must be a sparse vector as defined in dlib/svm/sparse_vector_abstract.h

            WHAT THIS OBJECT REPRESENTS
                This object represents a histogram intersection kernel 
                that works with sparse vectors.

            THREAD SAFETY
                This kernel is threadsafe.  
        !*/

        typedef typename T::value_type::second_type scalar_type;
        typedef T sample_type;
        typedef default_memory_manager mem_manager_type;

        scalar_type operator() (
            const sample_type& a,
            const sample_type& b
        ) const;
        /*!
            requires
                - a is a sparse vector
                - b is a sparse vector
                - all the values in a and b are >= 0
            ensures
                - Let A(i) denote the value of the ith dimension of the a vector.
                - Let B(i) denote the value of the ith dimension of the b vector.
                - returns sum over all i: std::min(A(i), B(i)) 
        !*/

        bool operator== (
            const sparse_histogram_intersection_kernel& k
        ) const;
        /*!
            ensures
                - returns true
        !*/
    };

    template <
        typename T
        >
    void serialize (
        const sparse_histogram_intersection_kernel<T>& item,
        std::ostream& out
    );
    /*!
        provides serialization support for sparse_histogram_intersection_kernel
    !*/

    template <
        typename T
        >
    void deserialize (
        sparse_histogram_intersection_kernel<T>& item,
        std::istream& in 
    );
    /*!
        provides deserialization support for sparse_histogram_intersection_kernel 
    !*/

// ----------------------------------------------------------------------------------------

}

#endif // DLIB_SVm_SPARSE_KERNEL_ABSTRACT_


