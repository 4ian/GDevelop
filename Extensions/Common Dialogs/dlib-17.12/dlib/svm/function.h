// Copyright (C) 2007  Davis E. King (davisking@users.sourceforge.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#ifndef DLIB_SVm_FUNCTION
#define DLIB_SVm_FUNCTION

#include "function_abstract.h"
#include <cmath>
#include <limits>
#include <sstream>
#include "../matrix.h"
#include "../algs.h"
#include "../serialize.h"
#include "../rand.h"
#include "../statistics.h"

namespace dlib
{

// ----------------------------------------------------------------------------------------

    template <
        typename K
        >
    struct decision_function
    {
        typedef typename K::scalar_type scalar_type;
        typedef typename K::sample_type sample_type;
        typedef typename K::mem_manager_type mem_manager_type;

        typedef matrix<scalar_type,0,1,mem_manager_type> scalar_vector_type;
        typedef matrix<sample_type,0,1,mem_manager_type> sample_vector_type;

        scalar_vector_type alpha;
        scalar_type b;
        K kernel_function;
        sample_vector_type support_vectors;

        decision_function (
        ) : b(0), kernel_function(K()) {}

        decision_function (
            const decision_function& d
        ) : 
            alpha(d.alpha), 
            b(d.b),
            kernel_function(d.kernel_function),
            support_vectors(d.support_vectors) 
        {}

        decision_function (
            const scalar_vector_type& alpha_,
            const scalar_type& b_,
            const K& kernel_function_,
            const sample_vector_type& support_vectors_
        ) :
            alpha(alpha_),
            b(b_),
            kernel_function(kernel_function_),
            support_vectors(support_vectors_)
        {}

        decision_function& operator= (
            const decision_function& d
        )
        {
            if (this != &d)
            {
                alpha = d.alpha;
                b = d.b;
                kernel_function = d.kernel_function;
                support_vectors = d.support_vectors;
            }
            return *this;
        }

        scalar_type operator() (
            const sample_type& x
        ) const
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
    )
    {
        try
        {
            serialize(item.alpha, out);
            serialize(item.b,     out);
            serialize(item.kernel_function, out);
            serialize(item.support_vectors, out);
        }
        catch (serialization_error e)
        { 
            throw serialization_error(e.info + "\n   while serializing object of type decision_function"); 
        }
    }

    template <
        typename K
        >
    void deserialize (
        decision_function<K>& item,
        std::istream& in 
    )
    {
        try
        {
            deserialize(item.alpha, in);
            deserialize(item.b, in);
            deserialize(item.kernel_function, in);
            deserialize(item.support_vectors, in);
        }
        catch (serialization_error e)
        { 
            throw serialization_error(e.info + "\n   while deserializing object of type decision_function"); 
        }
    }

// ----------------------------------------------------------------------------------------

    template <
        typename K 
        >
    struct probabilistic_decision_function
    {
        typedef typename K::scalar_type scalar_type;
        typedef typename K::sample_type sample_type;
        typedef typename K::mem_manager_type mem_manager_type;

        scalar_type a;
        scalar_type b;
        decision_function<K> decision_funct;

        probabilistic_decision_function (
        ) : a(0), b(0), decision_funct(decision_function<K>()) {}

        probabilistic_decision_function (
            const probabilistic_decision_function& d
        ) : 
            a(d.a),
            b(d.b),
            decision_funct(d.decision_funct)
        {}

        probabilistic_decision_function (
            const scalar_type a_,
            const scalar_type b_,
            const decision_function<K>& decision_funct_ 
        ) :
            a(a_),
            b(b_),
            decision_funct(decision_funct_)
        {}

        probabilistic_decision_function& operator= (
            const probabilistic_decision_function& d
        )
        {
            if (this != &d)
            {
                a = d.a;
                b = d.b;
                decision_funct = d.decision_funct;
            }
            return *this;
        }

        scalar_type operator() (
            const sample_type& x
        ) const
        {
            scalar_type f = decision_funct(x);
            return 1/(1 + std::exp(a*f + b));
        }
    };

    template <
        typename K 
        >
    void serialize (
        const probabilistic_decision_function<K>& item,
        std::ostream& out
    )
    {
        try
        {
            serialize(item.a, out);
            serialize(item.b, out);
            serialize(item.decision_funct, out);
        }
        catch (serialization_error& e)
        { 
            throw serialization_error(e.info + "\n   while serializing object of type probabilistic_decision_function"); 
        }
    }

    template <
        typename K 
        >
    void deserialize (
        probabilistic_decision_function<K>& item,
        std::istream& in 
    )
    {
        typedef typename K::scalar_type scalar_type;
        try
        {
            deserialize(item.a, in);
            deserialize(item.b, in);
            deserialize(item.decision_funct, in);
        }
        catch (serialization_error& e)
        { 
            throw serialization_error(e.info + "\n   while deserializing object of type probabilistic_decision_function"); 
        }
    }

// ----------------------------------------------------------------------------------------

    template <
        typename K
        >
    struct distance_function
    {
        typedef typename K::scalar_type scalar_type;
        typedef typename K::sample_type sample_type;
        typedef typename K::mem_manager_type mem_manager_type;

        typedef matrix<scalar_type,0,1,mem_manager_type> scalar_vector_type;
        typedef matrix<sample_type,0,1,mem_manager_type> sample_vector_type;

        scalar_vector_type alpha;
        scalar_type b;
        K kernel_function;
        sample_vector_type support_vectors;

        distance_function (
        ) : b(0), kernel_function(K()) {}

        distance_function (
            const distance_function& d
        ) : 
            alpha(d.alpha), 
            b(d.b),
            kernel_function(d.kernel_function),
            support_vectors(d.support_vectors) 
        {}

        distance_function (
            const scalar_vector_type& alpha_,
            const scalar_type& b_,
            const K& kernel_function_,
            const sample_vector_type& support_vectors_
        ) :
            alpha(alpha_),
            b(b_),
            kernel_function(kernel_function_),
            support_vectors(support_vectors_)
        {}

        distance_function& operator= (
            const distance_function& d
        )
        {
            if (this != &d)
            {
                alpha = d.alpha;
                b = d.b;
                kernel_function = d.kernel_function;
                support_vectors = d.support_vectors;
            }
            return *this;
        }

        scalar_type operator() (
            const sample_type& x
        ) const
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
    )
    {
        try
        {
            serialize(item.alpha, out);
            serialize(item.b,     out);
            serialize(item.kernel_function, out);
            serialize(item.support_vectors, out);
        }
        catch (serialization_error e)
        { 
            throw serialization_error(e.info + "\n   while serializing object of type distance_function"); 
        }
    }

    template <
        typename K
        >
    void deserialize (
        distance_function<K>& item,
        std::istream& in 
    )
    {
        try
        {
            deserialize(item.alpha, in);
            deserialize(item.b, in);
            deserialize(item.kernel_function, in);
            deserialize(item.support_vectors, in);
        }
        catch (serialization_error e)
        { 
            throw serialization_error(e.info + "\n   while deserializing object of type distance_function"); 
        }
    }

// ----------------------------------------------------------------------------------------

    template <
        typename function_type
        >
    struct normalized_function 
    {
        typedef typename function_type::scalar_type scalar_type;
        typedef typename function_type::sample_type sample_type;
        typedef typename function_type::mem_manager_type mem_manager_type;

        vector_normalizer<sample_type> normalizer;
        function_type function;

        normalized_function (
        ){}

        normalized_function (
            const normalized_function& f
        ) :
            normalizer(f.normalizer),
            function(f.function)
        {}

        normalized_function (
            const vector_normalizer<sample_type>& normalizer_,
            const function_type& funct 
        ) : normalizer(normalizer_), function(funct) {}

        scalar_type operator() (
            const sample_type& x
        ) const { return function(normalizer(x)); }
    };

    template <
        typename function_type
        >
    void serialize (
        const normalized_function<function_type>& item,
        std::ostream& out
    )
    {
        try
        {
            serialize(item.normalizer, out);
            serialize(item.function,     out);
        }
        catch (serialization_error e)
        { 
            throw serialization_error(e.info + "\n   while serializing object of type normalized_function"); 
        }
    }

    template <
        typename function_type
        >
    void deserialize (
        normalized_function<function_type>& item,
        std::istream& in 
    )
    {
        try
        {
            deserialize(item.normalizer, in);
            deserialize(item.function, in);
        }
        catch (serialization_error e)
        { 
            throw serialization_error(e.info + "\n   while deserializing object of type normalized_function"); 
        }
    }

// ----------------------------------------------------------------------------------------

}

#endif // DLIB_SVm_FUNCTION


