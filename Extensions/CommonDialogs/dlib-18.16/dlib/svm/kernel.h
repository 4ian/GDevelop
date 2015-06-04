// Copyright (C) 2007  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#ifndef DLIB_SVm_KERNEL
#define DLIB_SVm_KERNEL

#include "kernel_abstract.h"
#include <cmath>
#include <limits>
#include <sstream>
#include "../matrix.h"
#include "../algs.h"
#include "../serialize.h"

namespace dlib
{

// ----------------------------------------------------------------------------------------

    template < typename kernel_type > struct kernel_derivative;

// ----------------------------------------------------------------------------------------

    template <
        typename T
        >
    struct radial_basis_kernel
    {
        typedef typename T::type scalar_type;
        typedef T sample_type;
        typedef typename T::mem_manager_type mem_manager_type;

        // T must be capable of representing a column vector.
        COMPILE_TIME_ASSERT(T::NC == 1 || T::NC == 0);

        radial_basis_kernel(const scalar_type g) : gamma(g) {}
        radial_basis_kernel() : gamma(0.1) {}
        radial_basis_kernel(
            const radial_basis_kernel& k
        ) : gamma(k.gamma) {}


        const scalar_type gamma;

        scalar_type operator() (
            const sample_type& a,
            const sample_type& b
        ) const
        { 
            const scalar_type d = trans(a-b)*(a-b);
            return std::exp(-gamma*d);
        }

        radial_basis_kernel& operator= (
            const radial_basis_kernel& k
        )
        {
            const_cast<scalar_type&>(gamma) = k.gamma;
            return *this;
        }

        bool operator== (
            const radial_basis_kernel& k
        ) const
        {
            return gamma == k.gamma;
        }
    };

    template <
        typename T
        >
    void serialize (
        const radial_basis_kernel<T>& item,
        std::ostream& out
    )
    {
        try
        {
            serialize(item.gamma, out);
        }
        catch (serialization_error& e)
        { 
            throw serialization_error(e.info + "\n   while serializing object of type radial_basis_kernel"); 
        }
    }

    template <
        typename T
        >
    void deserialize (
        radial_basis_kernel<T>& item,
        std::istream& in 
    )
    {
        typedef typename T::type scalar_type;
        try
        {
            deserialize(const_cast<scalar_type&>(item.gamma), in);
        }
        catch (serialization_error& e)
        { 
            throw serialization_error(e.info + "\n   while deserializing object of type radial_basis_kernel"); 
        }
    }

    template <
        typename T 
        >
    struct kernel_derivative<radial_basis_kernel<T> >
    {
        typedef typename T::type scalar_type;
        typedef T sample_type;
        typedef typename T::mem_manager_type mem_manager_type;

        kernel_derivative(const radial_basis_kernel<T>& k_) : k(k_){}

        const sample_type& operator() (const sample_type& x, const sample_type& y) const
        {
            // return the derivative of the rbf kernel
            temp = 2*k.gamma*(x-y)*k(x,y);
            return temp;
        }

        const radial_basis_kernel<T>& k;
        mutable sample_type temp;
    };

// ----------------------------------------------------------------------------------------

    template <
        typename T
        >
    struct polynomial_kernel
    {
        typedef typename T::type scalar_type;
        typedef T sample_type;
        typedef typename T::mem_manager_type mem_manager_type;

        // T must be capable of representing a column vector.
        COMPILE_TIME_ASSERT(T::NC == 1 || T::NC == 0);

        polynomial_kernel(const scalar_type g, const scalar_type c, const scalar_type d) : gamma(g), coef(c), degree(d) {}
        polynomial_kernel() : gamma(1), coef(0), degree(1) {}
        polynomial_kernel(
            const polynomial_kernel& k
        ) : gamma(k.gamma), coef(k.coef), degree(k.degree) {}

        typedef T type;
        const scalar_type gamma;
        const scalar_type coef;
        const scalar_type degree;

        scalar_type operator() (
            const sample_type& a,
            const sample_type& b
        ) const
        { 
            return std::pow(gamma*(trans(a)*b) + coef, degree);
        }

        polynomial_kernel& operator= (
            const polynomial_kernel& k
        )
        {
            const_cast<scalar_type&>(gamma) = k.gamma;
            const_cast<scalar_type&>(coef) = k.coef;
            const_cast<scalar_type&>(degree) = k.degree;
            return *this;
        }

        bool operator== (
            const polynomial_kernel& k
        ) const
        {
            return (gamma == k.gamma) && (coef == k.coef) && (degree == k.degree);
        }
    };

    template <
        typename T
        >
    void serialize (
        const polynomial_kernel<T>& item,
        std::ostream& out
    )
    {
        try
        {
            serialize(item.gamma, out);
            serialize(item.coef, out);
            serialize(item.degree, out);
        }
        catch (serialization_error& e)
        { 
            throw serialization_error(e.info + "\n   while serializing object of type polynomial_kernel"); 
        }
    }

    template <
        typename T
        >
    void deserialize (
        polynomial_kernel<T>& item,
        std::istream& in 
    )
    {
        typedef typename T::type scalar_type;
        try
        {
            deserialize(const_cast<scalar_type&>(item.gamma), in);
            deserialize(const_cast<scalar_type&>(item.coef), in);
            deserialize(const_cast<scalar_type&>(item.degree), in);
        }
        catch (serialization_error& e)
        { 
            throw serialization_error(e.info + "\n   while deserializing object of type polynomial_kernel"); 
        }
    }

    template <
        typename T 
        >
    struct kernel_derivative<polynomial_kernel<T> >
    {
        typedef typename T::type scalar_type;
        typedef T sample_type;
        typedef typename T::mem_manager_type mem_manager_type;

        kernel_derivative(const polynomial_kernel<T>& k_) : k(k_){}

        const sample_type& operator() (const sample_type& x, const sample_type& y) const
        {
            // return the derivative of the rbf kernel
            temp = k.degree*k.gamma*x*std::pow(k.gamma*(trans(x)*y) + k.coef, k.degree-1);
            return temp;
        }

        const polynomial_kernel<T>& k;
        mutable sample_type temp;
    };

// ----------------------------------------------------------------------------------------

    template <
        typename T
        >
    struct sigmoid_kernel
    {
        typedef typename T::type scalar_type;
        typedef T sample_type;
        typedef typename T::mem_manager_type mem_manager_type;

        // T must be capable of representing a column vector.
        COMPILE_TIME_ASSERT(T::NC == 1 || T::NC == 0);

        sigmoid_kernel(const scalar_type g, const scalar_type c) : gamma(g), coef(c) {}
        sigmoid_kernel() : gamma(0.1), coef(-1.0) {}
        sigmoid_kernel(
            const sigmoid_kernel& k
        ) : gamma(k.gamma), coef(k.coef) {}

        typedef T type;
        const scalar_type gamma;
        const scalar_type coef;

        scalar_type operator() (
            const sample_type& a,
            const sample_type& b
        ) const
        { 
            return std::tanh(gamma*(trans(a)*b) + coef);
        }

        sigmoid_kernel& operator= (
            const sigmoid_kernel& k
        )
        {
            const_cast<scalar_type&>(gamma) = k.gamma;
            const_cast<scalar_type&>(coef) = k.coef;
            return *this;
        }

        bool operator== (
            const sigmoid_kernel& k
        ) const
        {
            return (gamma == k.gamma) && (coef == k.coef);
        }
    };

    template <
        typename T
        >
    void serialize (
        const sigmoid_kernel<T>& item,
        std::ostream& out
    )
    {
        try
        {
            serialize(item.gamma, out);
            serialize(item.coef, out);
        }
        catch (serialization_error& e)
        { 
            throw serialization_error(e.info + "\n   while serializing object of type sigmoid_kernel"); 
        }
    }

    template <
        typename T
        >
    void deserialize (
        sigmoid_kernel<T>& item,
        std::istream& in 
    )
    {
        typedef typename T::type scalar_type;
        try
        {
            deserialize(const_cast<scalar_type&>(item.gamma), in);
            deserialize(const_cast<scalar_type&>(item.coef), in);
        }
        catch (serialization_error& e)
        { 
            throw serialization_error(e.info + "\n   while deserializing object of type sigmoid_kernel"); 
        }
    }

    template <
        typename T 
        >
    struct kernel_derivative<sigmoid_kernel<T> >
    {
        typedef typename T::type scalar_type;
        typedef T sample_type;
        typedef typename T::mem_manager_type mem_manager_type;

        kernel_derivative(const sigmoid_kernel<T>& k_) : k(k_){}

        const sample_type& operator() (const sample_type& x, const sample_type& y) const
        {
            // return the derivative of the rbf kernel
            temp = k.gamma*x*(1-std::pow(k(x,y),2));
            return temp;
        }

        const sigmoid_kernel<T>& k;
        mutable sample_type temp;
    };

// ----------------------------------------------------------------------------------------

    template <typename T>
    struct linear_kernel
    {
        typedef typename T::type scalar_type;
        typedef T sample_type;
        typedef typename T::mem_manager_type mem_manager_type;

        // T must be capable of representing a column vector.
        COMPILE_TIME_ASSERT(T::NC == 1 || T::NC == 0);

        scalar_type operator() (
            const sample_type& a,
            const sample_type& b
        ) const
        { 
            return trans(a)*b;
        }

        bool operator== (
            const linear_kernel& 
        ) const
        {
            return true;
        }
    };

    template <
        typename T
        >
    void serialize (
        const linear_kernel<T>& ,
        std::ostream& 
    ){}

    template <
        typename T
        >
    void deserialize (
        linear_kernel<T>& ,
        std::istream&  
    ){}

    template <
        typename T 
        >
    struct kernel_derivative<linear_kernel<T> >
    {
        typedef typename T::type scalar_type;
        typedef T sample_type;
        typedef typename T::mem_manager_type mem_manager_type;

        kernel_derivative(const linear_kernel<T>& k_) : k(k_){}

        const sample_type& operator() (const sample_type& x, const sample_type& ) const
        {
            return x;
        }

        const linear_kernel<T>& k;
    };

// ----------------------------------------------------------------------------------------

    template <typename T>
    struct histogram_intersection_kernel
    {
        typedef typename T::type scalar_type;
        typedef T sample_type;
        typedef typename T::mem_manager_type mem_manager_type;

        scalar_type operator() (
            const sample_type& a,
            const sample_type& b
        ) const
        { 
            scalar_type temp = 0;
            for (long i = 0; i < a.size(); ++i)
            {
                temp += std::min(a(i), b(i));
            }
            return temp;
        }

        bool operator== (
            const histogram_intersection_kernel& 
        ) const
        {
            return true;
        }
    };

    template <
        typename T
        >
    void serialize (
        const histogram_intersection_kernel<T>& ,
        std::ostream& 
    ){}

    template <
        typename T
        >
    void deserialize (
        histogram_intersection_kernel<T>& ,
        std::istream&  
    ){}

// ----------------------------------------------------------------------------------------

    template <typename T>
    struct offset_kernel
    {
        typedef typename T::scalar_type scalar_type;
        typedef typename T::sample_type sample_type;
        typedef typename T::mem_manager_type mem_manager_type;

        offset_kernel(const T& k, const scalar_type& offset_
        ) : kernel(k), offset(offset_) {}
        offset_kernel() : kernel(T()), offset(0.01) {}
        offset_kernel(
            const offset_kernel& k
        ) : kernel(k.kernel), offset(k.offset) {}

        const T kernel;
        const scalar_type offset;

        scalar_type operator() (
            const sample_type& a,
            const sample_type& b
        ) const
        { 
            return kernel(a,b) + offset;
        }

        offset_kernel& operator= (
            const offset_kernel& k
        )
        {
            const_cast<T&>(kernel) = k.kernel;
            const_cast<scalar_type&>(offset) = k.offset;
            return *this;
        }

        bool operator== (
            const offset_kernel& k
        ) const
        {
            return k.kernel == kernel && offset == k.offset;
        }
    };

    template <
        typename T
        >
    void serialize (
        const offset_kernel<T>& item,
        std::ostream& out
    )
    {
        try
        {
            serialize(item.offset, out);
            serialize(item.kernel, out);
        }
        catch (serialization_error& e)
        { 
            throw serialization_error(e.info + "\n   while serializing object of type offset_kernel"); 
        }
    }

    template <
        typename T
        >
    void deserialize (
        offset_kernel<T>& item,
        std::istream& in 
    )
    {
        typedef typename offset_kernel<T>::scalar_type scalar_type;
        try
        {
            deserialize(const_cast<scalar_type&>(item.offset), in);
            deserialize(const_cast<T&>(item.kernel), in);
        }
        catch (serialization_error& e)
        { 
            throw serialization_error(e.info + "\n   while deserializing object of type offset_kernel"); 
        }
    }

    template <
        typename T 
        >
    struct kernel_derivative<offset_kernel<T> >
    {
        typedef typename T::scalar_type scalar_type;
        typedef typename T::sample_type sample_type;
        typedef typename T::mem_manager_type mem_manager_type;

        kernel_derivative(const offset_kernel<T>& k) : der(k.kernel){}

        const sample_type operator() (const sample_type& x, const sample_type& y) const
        {
            return der(x,y);
        }

        kernel_derivative<T> der;
    };

// ----------------------------------------------------------------------------------------

}

#endif // DLIB_SVm_KERNEL


