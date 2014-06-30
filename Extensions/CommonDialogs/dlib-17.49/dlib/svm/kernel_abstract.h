// Copyright (C) 2007  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#undef DLIB_SVm_KERNEL_ABSTRACT_
#ifdef DLIB_SVm_KERNEL_ABSTRACT_

#include <cmath>
#include <limits>
#include <sstream>
#include "../matrix/matrix_abstract.h"
#include "../algs.h"
#include "../serialize.h"

namespace dlib
{

// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------
/*!A                               Kernel_Function_Objects                               */
// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------

    /*! 
        WHAT IS A KERNEL FUNCTION OBJECT?
            In the context of the dlib library documentation a kernel function object
            is an object with an interface with the following properties:
                - a public typedef named sample_type
                - a public typedef named scalar_type which should be a float, double, or 
                  long double type.
                - an overloaded operator() that operates on two items of sample_type 
                  and returns a scalar_type.  
                  (e.g. scalar_type val = kernel_function(sample1,sample2); 
                   would be a valid expression)
                - a public typedef named mem_manager_type that is an implementation of 
                  dlib/memory_manager/memory_manager_kernel_abstract.h or
                  dlib/memory_manager_global/memory_manager_global_kernel_abstract.h or
                  dlib/memory_manager_stateless/memory_manager_stateless_kernel_abstract.h 
                - an overloaded == operator that tells you if two kernels are
                  identical or not.

        For examples of kernel functions see the following objects
        (e.g. the radial_basis_kernel).
    !*/

    template <
        typename T
        >
    struct radial_basis_kernel
    {
        /*!
            REQUIREMENTS ON T
                T must be a dlib::matrix object 

            WHAT THIS OBJECT REPRESENTS
                This object represents a radial basis function kernel
        !*/

        typedef typename T::type scalar_type;
        typedef T sample_type;
        typedef typename T::mem_manager_type mem_manager_type;

        const scalar_type gamma;

        radial_basis_kernel(
        );
        /*!
            ensures
                - #gamma == 0.1 
        !*/

        radial_basis_kernel(
            const radial_basis_kernel& k
        );
        /*!
            ensures
                - #gamma == k.gamma
        !*/

        radial_basis_kernel(
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
                - a.nc() == 1
                - b.nc() == 1
                - a.nr() == b.nr()
            ensures
                - returns exp(-gamma * ||a-b||^2)
        !*/

        radial_basis_kernel& operator= (
            const radial_basis_kernel& k
        );
        /*!
            ensures
                - #gamma = k.gamma
                - returns *this
        !*/

        bool operator== (
            const radial_basis_kernel& k
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
        const radial_basis_kernel<T>& item,
        std::ostream& out
    );
    /*!
        provides serialization support for radial_basis_kernel
    !*/

    template <
        typename T
        >
    void deserialize (
        radial_basis_kernel<T>& item,
        std::istream& in 
    );
    /*!
        provides deserialization support for radial_basis_kernel
    !*/

// ----------------------------------------------------------------------------------------

    template <
        typename T
        >
    struct sigmoid_kernel
    {
        /*!
            REQUIREMENTS ON T
                T must be a dlib::matrix object 

            WHAT THIS OBJECT REPRESENTS
                This object represents a sigmoid kernel
        !*/

        typedef typename T::type scalar_type;
        typedef T sample_type;
        typedef typename T::mem_manager_type mem_manager_type;

        const scalar_type gamma;
        const scalar_type coef;

        sigmoid_kernel(
        );
        /*!
            ensures
                - #gamma == 0.1 
                - #coef == -1.0 
        !*/

        sigmoid_kernel(
            const sigmoid_kernel& k
        );
        /*!
            ensures
                - #gamma == k.gamma
                - #coef == k.coef
        !*/

        sigmoid_kernel(
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
                - a.nc() == 1
                - b.nc() == 1
                - a.nr() == b.nr()
            ensures
                - returns tanh(gamma*trans(a)*b + coef)
        !*/

        sigmoid_kernel& operator= (
            const sigmoid_kernel& k
        );
        /*!
            ensures
                - #gamma = k.gamma
                - #coef = k.coef
                - returns *this
        !*/

        bool operator== (
            const sigmoid_kernel& k
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
        const sigmoid_kernel<T>& item,
        std::ostream& out
    );
    /*!
        provides serialization support for sigmoid_kernel
    !*/

    template <
        typename T
        >
    void deserialize (
        sigmoid_kernel<T>& item,
        std::istream& in 
    );
    /*!
        provides deserialization support for sigmoid_kernel
    !*/


// ----------------------------------------------------------------------------------------

    template <
        typename T
        >
    struct polynomial_kernel
    {
        /*!
            REQUIREMENTS ON T
                T must be a dlib::matrix object 

            WHAT THIS OBJECT REPRESENTS
                This object represents a polynomial kernel
        !*/

        typedef typename T::type scalar_type;
        typedef T sample_type;
        typedef typename T::mem_manager_type mem_manager_type;

        const scalar_type gamma;
        const scalar_type coef;
        const scalar_type degree;

        polynomial_kernel(
        );
        /*!
            ensures
                - #gamma == 1 
                - #coef == 0 
                - #degree == 1 
        !*/

        polynomial_kernel(
            const polynomial_kernel& k
        );
        /*!
            ensures
                - #gamma == k.gamma
                - #coef == k.coef
                - #degree == k.degree
        !*/

        polynomial_kernel(
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
                - a.nc() == 1
                - b.nc() == 1
                - a.nr() == b.nr()
            ensures
                - returns pow(gamma*trans(a)*b + coef, degree)
        !*/

        polynomial_kernel& operator= (
            const polynomial_kernel& k
        );
        /*!
            ensures
                - #gamma = k.gamma
                - #coef = k.coef
                - #degree = k.degree
                - returns *this
        !*/

        bool operator== (
            const polynomial_kernel& k
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
        const polynomial_kernel<T>& item,
        std::ostream& out
    );
    /*!
        provides serialization support for polynomial_kernel
    !*/

    template <
        typename T
        >
    void deserialize (
        polynomial_kernel<T>& item,
        std::istream& in 
    );
    /*!
        provides deserialization support for polynomial_kernel
    !*/

// ----------------------------------------------------------------------------------------

    template <
        typename T
        >
    struct linear_kernel
    {
        /*!
            REQUIREMENTS ON T
                T must be a dlib::matrix object 

            WHAT THIS OBJECT REPRESENTS
                This object represents a linear function kernel
        !*/

        typedef typename T::type scalar_type;
        typedef T sample_type;
        typedef typename T::mem_manager_type mem_manager_type;

        scalar_type operator() (
            const sample_type& a,
            const sample_type& b
        ) const;
        /*!
            requires
                - a.nc() == 1
                - b.nc() == 1
                - a.nr() == b.nr()
            ensures
                - returns trans(a)*b
        !*/

        bool operator== (
            const linear_kernel& k
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
        const linear_kernel<T>& item,
        std::ostream& out
    );
    /*!
        provides serialization support for linear_kernel
    !*/

    template <
        typename T
        >
    void deserialize (
        linear_kernel<T>& item,
        std::istream& in 
    );
    /*!
        provides deserialization support for linear_kernel 
    !*/

// ----------------------------------------------------------------------------------------

    template <
        typename T
        >
    struct histogram_intersection_kernel
    {
        /*!
            REQUIREMENTS ON T
                T must be a dlib::matrix object 

            WHAT THIS OBJECT REPRESENTS
                This object represents a histogram intersection kernel kernel
        !*/

        typedef typename T::type scalar_type;
        typedef T sample_type;
        typedef typename T::mem_manager_type mem_manager_type;

        scalar_type operator() (
            const sample_type& a,
            const sample_type& b
        ) const;
        /*!
            requires
                - is_vector(a) 
                - is_vector(b) 
                - a.size() == b.size()
                - min(a) >= 0
                - min(b) >= 0
            ensures
                - returns sum over all i: std::min(a(i), b(i)) 
        !*/

        bool operator== (
            const histogram_intersection_kernel& k
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
        const histogram_intersection_kernel<T>& item,
        std::ostream& out
    );
    /*!
        provides serialization support for histogram_intersection_kernel
    !*/

    template <
        typename T
        >
    void deserialize (
        histogram_intersection_kernel<T>& item,
        std::istream& in 
    );
    /*!
        provides deserialization support for histogram_intersection_kernel 
    !*/

// ----------------------------------------------------------------------------------------

    template <
        typename T
        >
    struct offset_kernel
    {
        /*!
            REQUIREMENTS ON T
                T must be a kernel object (e.g. radial_basis_kernel, polynomial_kernel, etc.) 

            WHAT THIS OBJECT REPRESENTS
                This object represents a kernel with a fixed value offset
                added to it.
        !*/

        typedef typename T::scalar_type scalar_type;
        typedef typename T::sample_type sample_type;
        typedef typename T::mem_manager_type mem_manager_type;

        const T kernel;
        const scalar_type offset;

        offset_kernel(
        );
        /*!
            ensures
                - #offset == 0.01 
        !*/

        offset_kernel(
            const offset_kernel& k
        );
        /*!
            ensures
                - #offset == k.offset
                - #kernel == k.kernel
        !*/

        offset_kernel(
            const T& k,
            const scalar_type& off
        );
        /*!
            ensures
                - #kernel == k 
                - #offset == off 
        !*/

        scalar_type operator() (
            const sample_type& a,
            const sample_type& b
        ) const;
        /*!
            ensures
                - returns kernel(a,b) + offset
        !*/

        offset_kernel& operator= (
            const offset_kernel& k
        );
        /*!
            ensures
                - #offset == k.offset
                - #kernel == k.kernel
        !*/

        bool operator== (
            const offset_kernel& k
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
        const offset_kernel<T>& item,
        std::ostream& out
    );
    /*!
        provides serialization support for offset_kernel
    !*/

    template <
        typename T
        >
    void deserialize (
        offset_kernel<T>& item,
        std::istream& in 
    );
    /*!
        provides deserialization support for offset_kernel
    !*/

// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------

    template <
        typename kernel_type
        >
    struct kernel_derivative
    {
        /*!
            REQUIREMENTS ON kernel_type
                kernel_type must be one of the following kernel types:
                    - radial_basis_kernel
                    - polynomial_kernel 
                    - sigmoid_kernel
                    - linear_kernel
                    - offset_kernel

            WHAT THIS OBJECT REPRESENTS
                This is a function object that computes the derivative of a kernel 
                function object.
        !*/

        typedef typename kernel_type::scalar_type scalar_type;
        typedef typename kernel_type::sample_type sample_type;
        typedef typename kernel_type::mem_manager_type mem_manager_type;

        kernel_derivative(
            const kernel_type& k_
        ); 
        /*!
            ensures
                - this object will return derivatives of the kernel object k_
                - #k == k_
        !*/

        const sample_type operator() (
            const sample_type& x, 
            const sample_type& y
        ) const;
        /*!
            ensures
                - returns the derivative of k with respect to y.  
        !*/

        const kernel_type& k;
    };

// ----------------------------------------------------------------------------------------

}

#endif // DLIB_SVm_KERNEL_ABSTRACT_



