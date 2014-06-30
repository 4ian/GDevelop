// Copyright (C) 2009  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#ifndef DLIB_SVm_SPARSE_KERNEL
#define DLIB_SVm_SPARSE_KERNEL

#include "sparse_kernel_abstract.h"
#include <cmath>
#include <limits>
#include "../algs.h"
#include "../serialize.h"
#include "sparse_vector.h"


namespace dlib
{

// ----------------------------------------------------------------------------------------

    template <
        typename T
        >
    struct sparse_radial_basis_kernel
    {
        typedef typename T::value_type::second_type scalar_type;
        typedef T sample_type;
        typedef default_memory_manager mem_manager_type;

        sparse_radial_basis_kernel(const scalar_type g) : gamma(g) {}
        sparse_radial_basis_kernel() : gamma(0.1) {}
        sparse_radial_basis_kernel(
            const sparse_radial_basis_kernel& k
        ) : gamma(k.gamma) {}


        const scalar_type gamma;

        scalar_type operator() (
            const sample_type& a,
            const sample_type& b
        ) const
        { 
            const scalar_type d = distance_squared(a,b);
            return std::exp(-gamma*d);
        }

        sparse_radial_basis_kernel& operator= (
            const sparse_radial_basis_kernel& k
        )
        {
            const_cast<scalar_type&>(gamma) = k.gamma;
            return *this;
        }

        bool operator== (
            const sparse_radial_basis_kernel& k
        ) const
        {
            return gamma == k.gamma;
        }
    };

    template <
        typename T
        >
    void serialize (
        const sparse_radial_basis_kernel<T>& item,
        std::ostream& out
    )
    {
        try
        {
            serialize(item.gamma, out);
        }
        catch (serialization_error& e)
        { 
            throw serialization_error(e.info + "\n   while serializing object of type sparse_radial_basis_kernel"); 
        }
    }

    template <
        typename T
        >
    void deserialize (
        sparse_radial_basis_kernel<T>& item,
        std::istream& in 
    )
    {
        typedef typename T::value_type::second_type scalar_type;
        try
        {
            deserialize(const_cast<scalar_type&>(item.gamma), in);
        }
        catch (serialization_error& e)
        { 
            throw serialization_error(e.info + "\n   while deserializing object of type sparse_radial_basis_kernel"); 
        }
    }

// ----------------------------------------------------------------------------------------

    template <
        typename T
        >
    struct sparse_polynomial_kernel
    {
        typedef typename T::value_type::second_type scalar_type;
        typedef T sample_type;
        typedef default_memory_manager mem_manager_type;

        sparse_polynomial_kernel(const scalar_type g, const scalar_type c, const scalar_type d) : gamma(g), coef(c), degree(d) {}
        sparse_polynomial_kernel() : gamma(1), coef(0), degree(1) {}
        sparse_polynomial_kernel(
            const sparse_polynomial_kernel& k
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
            return std::pow(gamma*(dot(a,b)) + coef, degree);
        }

        sparse_polynomial_kernel& operator= (
            const sparse_polynomial_kernel& k
        )
        {
            const_cast<scalar_type&>(gamma) = k.gamma;
            const_cast<scalar_type&>(coef) = k.coef;
            const_cast<scalar_type&>(degree) = k.degree;
            return *this;
        }

        bool operator== (
            const sparse_polynomial_kernel& k
        ) const
        {
            return (gamma == k.gamma) && (coef == k.coef) && (degree == k.degree);
        }
    };

    template <
        typename T
        >
    void serialize (
        const sparse_polynomial_kernel<T>& item,
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
            throw serialization_error(e.info + "\n   while serializing object of type sparse_polynomial_kernel"); 
        }
    }

    template <
        typename T
        >
    void deserialize (
        sparse_polynomial_kernel<T>& item,
        std::istream& in 
    )
    {
        typedef typename T::value_type::second_type scalar_type;
        try
        {
            deserialize(const_cast<scalar_type&>(item.gamma), in);
            deserialize(const_cast<scalar_type&>(item.coef), in);
            deserialize(const_cast<scalar_type&>(item.degree), in);
        }
        catch (serialization_error& e)
        { 
            throw serialization_error(e.info + "\n   while deserializing object of type sparse_polynomial_kernel"); 
        }
    }

// ----------------------------------------------------------------------------------------

    template <
        typename T
        >
    struct sparse_sigmoid_kernel
    {
        typedef typename T::value_type::second_type scalar_type;
        typedef T sample_type;
        typedef default_memory_manager mem_manager_type;

        sparse_sigmoid_kernel(const scalar_type g, const scalar_type c) : gamma(g), coef(c) {}
        sparse_sigmoid_kernel() : gamma(0.1), coef(-1.0) {}
        sparse_sigmoid_kernel(
            const sparse_sigmoid_kernel& k
        ) : gamma(k.gamma), coef(k.coef) {}

        typedef T type;
        const scalar_type gamma;
        const scalar_type coef;

        scalar_type operator() (
            const sample_type& a,
            const sample_type& b
        ) const
        { 
            return std::tanh(gamma*(dot(a,b)) + coef);
        }

        sparse_sigmoid_kernel& operator= (
            const sparse_sigmoid_kernel& k
        )
        {
            const_cast<scalar_type&>(gamma) = k.gamma;
            const_cast<scalar_type&>(coef) = k.coef;
            return *this;
        }

        bool operator== (
            const sparse_sigmoid_kernel& k
        ) const
        {
            return (gamma == k.gamma) && (coef == k.coef);
        }
    };

    template <
        typename T
        >
    void serialize (
        const sparse_sigmoid_kernel<T>& item,
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
            throw serialization_error(e.info + "\n   while serializing object of type sparse_sigmoid_kernel"); 
        }
    }

    template <
        typename T
        >
    void deserialize (
        sparse_sigmoid_kernel<T>& item,
        std::istream& in 
    )
    {
        typedef typename T::value_type::second_type scalar_type;
        try
        {
            deserialize(const_cast<scalar_type&>(item.gamma), in);
            deserialize(const_cast<scalar_type&>(item.coef), in);
        }
        catch (serialization_error& e)
        { 
            throw serialization_error(e.info + "\n   while deserializing object of type sparse_sigmoid_kernel"); 
        }
    }

// ----------------------------------------------------------------------------------------

    template <typename T>
    struct sparse_linear_kernel
    {
        typedef typename T::value_type::second_type scalar_type;
        typedef T sample_type;
        typedef default_memory_manager mem_manager_type;

        scalar_type operator() (
            const sample_type& a,
            const sample_type& b
        ) const
        { 
            return dot(a,b);
        }

        bool operator== (
            const sparse_linear_kernel& 
        ) const
        {
            return true;
        }
    };

    template <
        typename T
        >
    void serialize (
        const sparse_linear_kernel<T>& ,
        std::ostream& 
    ){}

    template <
        typename T
        >
    void deserialize (
        sparse_linear_kernel<T>& ,
        std::istream&  
    ){}

// ----------------------------------------------------------------------------------------

    template <typename T>
    struct sparse_histogram_intersection_kernel
    {
        typedef typename T::value_type::second_type scalar_type;
        typedef T sample_type;
        typedef default_memory_manager mem_manager_type;

        scalar_type operator() (
            const sample_type& a,
            const sample_type& b
        ) const
        { 
            typename sample_type::const_iterator ai = a.begin();
            typename sample_type::const_iterator bi = b.begin();

            scalar_type sum = 0;
            while (ai != a.end() && bi != b.end())
            {
                if (ai->first == bi->first)
                {
                    sum += std::min(ai->second , bi->second);
                    ++ai;
                    ++bi;
                }
                else if (ai->first < bi->first)
                {
                    ++ai;
                }
                else 
                {
                    ++bi;
                }
            }

            return sum;
        }

        bool operator== (
            const sparse_histogram_intersection_kernel& 
        ) const
        {
            return true;
        }
    };

    template <
        typename T
        >
    void serialize (
        const sparse_histogram_intersection_kernel<T>& ,
        std::ostream& 
    ){}

    template <
        typename T
        >
    void deserialize (
        sparse_histogram_intersection_kernel<T>& ,
        std::istream&  
    ){}

// ----------------------------------------------------------------------------------------

}

#endif // DLIB_SVm_SPARSE_KERNEL



