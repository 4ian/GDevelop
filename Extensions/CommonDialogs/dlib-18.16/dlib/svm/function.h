// Copyright (C) 2007  Davis E. King (davis@dlib.net)
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
#include "kernel_matrix.h"
#include "kernel.h"
#include "sparse_kernel.h"

namespace dlib
{

// ----------------------------------------------------------------------------------------

    template <
        typename K
        >
    struct decision_function
    {
        typedef K kernel_type;
        typedef typename K::scalar_type scalar_type;
        typedef typename K::scalar_type result_type;
        typedef typename K::sample_type sample_type;
        typedef typename K::mem_manager_type mem_manager_type;

        typedef matrix<scalar_type,0,1,mem_manager_type> scalar_vector_type;
        typedef matrix<sample_type,0,1,mem_manager_type> sample_vector_type;

        scalar_vector_type alpha;
        scalar_type b;
        K kernel_function;
        sample_vector_type basis_vectors;

        decision_function (
        ) : b(0), kernel_function(K()) {}

        decision_function (
            const decision_function& d
        ) : 
            alpha(d.alpha), 
            b(d.b),
            kernel_function(d.kernel_function),
            basis_vectors(d.basis_vectors) 
        {}

        decision_function (
            const scalar_vector_type& alpha_,
            const scalar_type& b_,
            const K& kernel_function_,
            const sample_vector_type& basis_vectors_
        ) :
            alpha(alpha_),
            b(b_),
            kernel_function(kernel_function_),
            basis_vectors(basis_vectors_)
        {}

        result_type operator() (
            const sample_type& x
        ) const
        {
            result_type temp = 0;
            for (long i = 0; i < alpha.nr(); ++i)
                temp += alpha(i) * kernel_function(x,basis_vectors(i));

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
            serialize(item.basis_vectors, out);
        }
        catch (serialization_error& e)
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
            deserialize(item.basis_vectors, in);
        }
        catch (serialization_error& e)
        { 
            throw serialization_error(e.info + "\n   while deserializing object of type decision_function"); 
        }
    }

// ----------------------------------------------------------------------------------------

    template <
        typename function_type
        >
    struct probabilistic_function
    {
        typedef typename function_type::scalar_type scalar_type;
        typedef typename function_type::result_type result_type;
        typedef typename function_type::sample_type sample_type;
        typedef typename function_type::mem_manager_type mem_manager_type;

        scalar_type alpha;
        scalar_type beta;
        function_type decision_funct;

        probabilistic_function (
        ) : alpha(0), beta(0), decision_funct(function_type()) {}

        probabilistic_function (
            const probabilistic_function& d
        ) : 
            alpha(d.alpha),
            beta(d.beta),
            decision_funct(d.decision_funct)
        {}

        probabilistic_function (
            const scalar_type a_,
            const scalar_type b_,
            const function_type& decision_funct_ 
        ) :
            alpha(a_),
            beta(b_),
            decision_funct(decision_funct_)
        {}

        result_type operator() (
            const sample_type& x
        ) const
        {
            result_type f = decision_funct(x);
            return 1/(1 + std::exp(alpha*f + beta));
        }
    };

    template <
        typename function_type 
        >
    void serialize (
        const probabilistic_function<function_type>& item,
        std::ostream& out
    )
    {
        try
        {
            serialize(item.alpha, out);
            serialize(item.beta, out);
            serialize(item.decision_funct, out);
        }
        catch (serialization_error& e)
        { 
            throw serialization_error(e.info + "\n   while serializing object of type probabilistic_function"); 
        }
    }

    template <
        typename function_type
        >
    void deserialize (
        probabilistic_function<function_type>& item,
        std::istream& in 
    )
    {
        try
        {
            deserialize(item.alpha, in);
            deserialize(item.beta, in);
            deserialize(item.decision_funct, in);
        }
        catch (serialization_error& e)
        { 
            throw serialization_error(e.info + "\n   while deserializing object of type probabilistic_function"); 
        }
    }

// ----------------------------------------------------------------------------------------

    template <
        typename K 
        >
    struct probabilistic_decision_function
    {
        typedef K kernel_type;
        typedef typename K::scalar_type scalar_type;
        typedef typename K::scalar_type result_type;
        typedef typename K::sample_type sample_type;
        typedef typename K::mem_manager_type mem_manager_type;

        scalar_type alpha;
        scalar_type beta;
        decision_function<K> decision_funct;

        probabilistic_decision_function (
        ) : alpha(0), beta(0), decision_funct(decision_function<K>()) {}

        probabilistic_decision_function (
            const probabilistic_function<decision_function<K> >& d
        ) : 
            alpha(d.alpha),
            beta(d.beta),
            decision_funct(d.decision_funct)
        {}

        probabilistic_decision_function (
            const probabilistic_decision_function& d
        ) : 
            alpha(d.alpha),
            beta(d.beta),
            decision_funct(d.decision_funct)
        {}

        probabilistic_decision_function (
            const scalar_type a_,
            const scalar_type b_,
            const decision_function<K>& decision_funct_ 
        ) :
            alpha(a_),
            beta(b_),
            decision_funct(decision_funct_)
        {}

        result_type operator() (
            const sample_type& x
        ) const
        {
            result_type f = decision_funct(x);
            return 1/(1 + std::exp(alpha*f + beta));
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
            serialize(item.alpha, out);
            serialize(item.beta, out);
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
        try
        {
            deserialize(item.alpha, in);
            deserialize(item.beta, in);
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
    class distance_function
    {
    public:
        typedef K kernel_type;
        typedef typename K::scalar_type scalar_type;
        typedef typename K::scalar_type result_type;
        typedef typename K::sample_type sample_type;
        typedef typename K::mem_manager_type mem_manager_type;

        typedef matrix<scalar_type,0,1,mem_manager_type> scalar_vector_type;
        typedef matrix<sample_type,0,1,mem_manager_type> sample_vector_type;


        distance_function (
        ) : b(0), kernel_function(K()) {}

        explicit distance_function (
            const kernel_type& kern
        ) : b(0), kernel_function(kern) {}

        distance_function (
            const kernel_type& kern,
            const sample_type& samp
        ) :
            alpha(ones_matrix<scalar_type>(1,1)),
            b(kern(samp,samp)),
            kernel_function(kern)
        {
            basis_vectors.set_size(1,1);
            basis_vectors(0) = samp;
        }

        distance_function (
            const decision_function<K>& f
        ) :
            alpha(f.alpha),
            b(trans(f.alpha)*kernel_matrix(f.kernel_function,f.basis_vectors)*f.alpha),
            kernel_function(f.kernel_function),
            basis_vectors(f.basis_vectors)
        {
            // make sure requires clause is not broken
            DLIB_ASSERT(f.alpha.size() == f.basis_vectors.size(),
                "\t distance_function(f)"
                << "\n\t The supplied decision_function is invalid."
                << "\n\t f.alpha.size(): " << f.alpha.size()
                << "\n\t f.basis_vectors.size(): " << f.basis_vectors.size()
                );
        }

        distance_function (
            const distance_function& d
        ) : 
            alpha(d.alpha), 
            b(d.b),
            kernel_function(d.kernel_function),
            basis_vectors(d.basis_vectors) 
        {
        }

        distance_function (
            const scalar_vector_type& alpha_,
            const scalar_type& b_,
            const K& kernel_function_,
            const sample_vector_type& basis_vectors_
        ) :
            alpha(alpha_),
            b(b_),
            kernel_function(kernel_function_),
            basis_vectors(basis_vectors_)
        {
            // make sure requires clause is not broken
            DLIB_ASSERT(alpha_.size() == basis_vectors_.size(),
                "\t distance_function()"
                << "\n\t The supplied arguments are invalid."
                << "\n\t alpha_.size(): " << alpha_.size()
                << "\n\t basis_vectors_.size(): " << basis_vectors_.size()
                );
        }

        distance_function (
            const scalar_vector_type& alpha_,
            const K& kernel_function_,
            const sample_vector_type& basis_vectors_
        ) :
            alpha(alpha_),
            b(trans(alpha)*kernel_matrix(kernel_function_,basis_vectors_)*alpha),
            kernel_function(kernel_function_),
            basis_vectors(basis_vectors_)
        {
            // make sure requires clause is not broken
            DLIB_ASSERT(alpha_.size() == basis_vectors_.size(),
                "\t distance_function()"
                << "\n\t The supplied arguments are invalid."
                << "\n\t alpha_.size(): " << alpha_.size()
                << "\n\t basis_vectors_.size(): " << basis_vectors_.size()
                );
        }

        const scalar_vector_type& get_alpha (
        ) const { return alpha; }

        const scalar_type& get_squared_norm (
        ) const { return b; }

        const K& get_kernel(
        ) const { return kernel_function; }

        const sample_vector_type& get_basis_vectors (
        ) const { return basis_vectors; }

        result_type operator() (
            const sample_type& x
        ) const
        {
            result_type temp = 0;
            for (long i = 0; i < alpha.nr(); ++i)
                temp += alpha(i) * kernel_function(x,basis_vectors(i));

            temp = b + kernel_function(x,x) - 2*temp; 
            if (temp > 0)
                return std::sqrt(temp);
            else
                return 0;
        }

        result_type operator() (
            const distance_function& x
        ) const
        {
            result_type temp = 0;
            for (long i = 0; i < alpha.nr(); ++i)
                for (long j = 0; j < x.alpha.nr(); ++j)
                    temp += alpha(i)*x.alpha(j) * kernel_function(basis_vectors(i), x.basis_vectors(j));

            temp = b + x.b - 2*temp;
            if (temp > 0)
                return std::sqrt(temp);
            else
                return 0;
        }

        distance_function operator* (
            const scalar_type& val
        ) const
        {
            return distance_function(val*alpha,
                                     val*val*b,
                                     kernel_function,
                                     basis_vectors);
        }

        distance_function operator/ (
            const scalar_type& val
        ) const
        {
            return distance_function(alpha/val,
                                     b/val/val,
                                     kernel_function,
                                     basis_vectors);
        }

        distance_function operator+ (
            const distance_function& rhs
        ) const
        {
            // make sure requires clause is not broken
            DLIB_ASSERT(get_kernel() == rhs.get_kernel(),
                "\t distance_function distance_function::operator+()"
                << "\n\t You can only add two distance_functions together if they use the same kernel."
                );

            if (alpha.size() == 0)
                return rhs;
            else if (rhs.alpha.size() == 0)
                return *this;
            else
                return distance_function(join_cols(alpha, rhs.alpha),
                                        b + rhs.b + 2*trans(alpha)*kernel_matrix(kernel_function,basis_vectors,rhs.basis_vectors)*rhs.alpha,
                                        kernel_function,
                                        join_cols(basis_vectors, rhs.basis_vectors));
        }

        distance_function operator- (
            const distance_function& rhs
        ) const
        {
            // make sure requires clause is not broken
            DLIB_ASSERT(get_kernel() == rhs.get_kernel(),
                "\t distance_function distance_function::operator-()"
                << "\n\t You can only subtract two distance_functions if they use the same kernel."
                );

            if (alpha.size() == 0 && rhs.alpha.size() == 0)
                return distance_function(kernel_function);
            else if (alpha.size() != 0 && rhs.alpha.size() == 0)
                return *this;
            else if (alpha.size() == 0 && rhs.alpha.size() != 0)
                return -1*rhs;
            else
                return distance_function(join_cols(alpha, -rhs.alpha),
                                        b + rhs.b - 2*trans(alpha)*kernel_matrix(kernel_function,basis_vectors,rhs.basis_vectors)*rhs.alpha,
                                        kernel_function,
                                        join_cols(basis_vectors, rhs.basis_vectors));
        }

    private:

        scalar_vector_type alpha;
        scalar_type b;
        K kernel_function;
        sample_vector_type basis_vectors;

    };

    template <
        typename K
        >
    distance_function<K> operator* (
        const typename K::scalar_type& val,
        const distance_function<K>& df
    ) { return df*val; }

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
            serialize(item.basis_vectors, out);
        }
        catch (serialization_error& e)
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
            deserialize(item.basis_vectors, in);
        }
        catch (serialization_error& e)
        { 
            throw serialization_error(e.info + "\n   while deserializing object of type distance_function"); 
        }
    }

// ----------------------------------------------------------------------------------------

    template <
        typename function_type,
        typename normalizer_type = vector_normalizer<typename function_type::sample_type>
        >
    struct normalized_function 
    {
        typedef typename function_type::result_type result_type;
        typedef typename function_type::sample_type sample_type;
        typedef typename function_type::mem_manager_type mem_manager_type;

        normalizer_type normalizer;
        function_type function;

        normalized_function (
        ){}

        normalized_function (
            const normalized_function& f
        ) :
            normalizer(f.normalizer),
            function(f.function)
        {}

        const std::vector<result_type> get_labels(
        ) const { return function.get_labels(); }

        unsigned long number_of_classes (
        ) const { return function.number_of_classes(); }

        normalized_function (
            const vector_normalizer<sample_type>& normalizer_,
            const function_type& funct 
        ) : normalizer(normalizer_), function(funct) {}

        result_type operator() (
            const sample_type& x
        ) const { return function(normalizer(x)); }
    };

    template <
        typename function_type,
        typename normalizer_type 
        >
    void serialize (
        const normalized_function<function_type,normalizer_type>& item,
        std::ostream& out
    )
    {
        try
        {
            serialize(item.normalizer, out);
            serialize(item.function,     out);
        }
        catch (serialization_error& e)
        { 
            throw serialization_error(e.info + "\n   while serializing object of type normalized_function"); 
        }
    }

    template <
        typename function_type,
        typename normalizer_type 
        >
    void deserialize (
        normalized_function<function_type,normalizer_type>& item,
        std::istream& in 
    )
    {
        try
        {
            deserialize(item.normalizer, in);
            deserialize(item.function, in);
        }
        catch (serialization_error& e)
        { 
            throw serialization_error(e.info + "\n   while deserializing object of type normalized_function"); 
        }
    }

// ----------------------------------------------------------------------------------------

    template <
        typename K
        >
    struct projection_function 
    {
        typedef K kernel_type;
        typedef typename K::scalar_type scalar_type;
        typedef typename K::sample_type sample_type;
        typedef typename K::mem_manager_type mem_manager_type;

        typedef matrix<scalar_type,0,1,mem_manager_type> scalar_vector_type;
        typedef matrix<scalar_type,0,0,mem_manager_type> scalar_matrix_type;
        typedef matrix<sample_type,0,1,mem_manager_type> sample_vector_type;
        typedef scalar_vector_type result_type;

        scalar_matrix_type weights;
        K                  kernel_function;
        sample_vector_type basis_vectors;

        projection_function (
        ) {}

        projection_function (
            const projection_function& f
        ) : weights(f.weights), kernel_function(f.kernel_function), basis_vectors(f.basis_vectors) {}

        projection_function (
            const scalar_matrix_type& weights_,
            const K& kernel_function_,
            const sample_vector_type& basis_vectors_
        ) : weights(weights_), kernel_function(kernel_function_), basis_vectors(basis_vectors_) {}

        long out_vector_size (
        ) const { return weights.nr(); }

        const result_type& operator() (
            const sample_type& x
        ) const
        {
            // Run the x sample through all the basis functions we have and then
            // multiply it by the weights matrix and return the result.  Note that
            // the temp vectors are here to avoid reallocating their memory every
            // time this function is called.
            temp1 = kernel_matrix(kernel_function, basis_vectors, x);
            temp2 = weights*temp1;
            return temp2;
        }

    private:
        mutable result_type temp1, temp2;
    };

    template <
        typename K
        >
    void serialize (
        const projection_function<K>& item,
        std::ostream& out
    )
    {
        try
        {
            serialize(item.weights, out);
            serialize(item.kernel_function,     out);
            serialize(item.basis_vectors,     out);
        }
        catch (serialization_error& e)
        { 
            throw serialization_error(e.info + "\n   while serializing object of type projection_function"); 
        }
    }

    template <
        typename K
        >
    void deserialize (
        projection_function<K>& item,
        std::istream& in 
    )
    {
        try
        {
            deserialize(item.weights, in);
            deserialize(item.kernel_function,     in);
            deserialize(item.basis_vectors,     in);
        }
        catch (serialization_error& e)
        { 
            throw serialization_error(e.info + "\n   while deserializing object of type projection_function"); 
        }
    }

// ----------------------------------------------------------------------------------------

    template <
        typename K,
        typename result_type_ = typename K::scalar_type 
        >
    struct multiclass_linear_decision_function
    {
        typedef result_type_ result_type;

        typedef K kernel_type;
        typedef typename K::scalar_type scalar_type;
        typedef typename K::sample_type sample_type;
        typedef typename K::mem_manager_type mem_manager_type;

        typedef matrix<scalar_type,0,1,mem_manager_type> scalar_vector_type;
        typedef matrix<scalar_type,0,0,mem_manager_type> scalar_matrix_type;

        // You are getting a compiler error on this line because you supplied a non-linear kernel
        // to the multiclass_linear_decision_function object.  You have to use one of the linear 
        // kernels with this object.
        COMPILE_TIME_ASSERT((is_same_type<K, linear_kernel<sample_type> >::value ||
                             is_same_type<K, sparse_linear_kernel<sample_type> >::value ));


        scalar_matrix_type       weights;
        scalar_vector_type       b;
        std::vector<result_type> labels; 

        const std::vector<result_type>& get_labels(
        ) const { return labels; }

        unsigned long number_of_classes (
        ) const { return labels.size(); }

        std::pair<result_type, scalar_type> predict (
            const sample_type& x
        ) const
        {
            // make sure requires clause is not broken
            DLIB_ASSERT(weights.size() > 0 && 
                        weights.nr() == (long)number_of_classes() &&
                        weights.nr() == b.size(),
                "\t pair<result_type,scalar_type> multiclass_linear_decision_function::predict(x)"
                << "\n\t This object must be properly initialized before you can use it."
                << "\n\t weights.size():      " << weights.size()
                << "\n\t weights.nr():        " << weights.nr()
                << "\n\t number_of_classes(): " << number_of_classes()
                );

            // Rather than doing something like, best_idx = index_of_max(weights*x-b)
            // we do the following somewhat more complex thing because this supports
            // both sparse and dense samples.
            scalar_type best_val = dot(rowm(weights,0),x) - b(0);
            unsigned long best_idx = 0;

            for (unsigned long i = 1; i < labels.size(); ++i)
            {
                scalar_type temp = dot(rowm(weights,i),x) - b(i);
                if (temp > best_val)
                {
                    best_val = temp;
                    best_idx = i;
                }
            }

            return std::make_pair(labels[best_idx], best_val);
        }

        result_type operator() (
            const sample_type& x
        ) const
        {
            // make sure requires clause is not broken
            DLIB_ASSERT(weights.size() > 0 && 
                        weights.nr() == (long)number_of_classes() &&
                        weights.nr() == b.size(),
                "\t result_type multiclass_linear_decision_function::operator()(x)"
                << "\n\t This object must be properly initialized before you can use it."
                << "\n\t weights.size():      " << weights.size()
                << "\n\t weights.nr():        " << weights.nr()
                << "\n\t number_of_classes(): " << number_of_classes()
                );

            return predict(x).first;
        }
    };

    template <
        typename K,
        typename result_type_
        >
    void serialize (
        const multiclass_linear_decision_function<K,result_type_>& item,
        std::ostream& out
    )
    {
        try
        {
            serialize(item.weights,         out);
            serialize(item.b,               out);
            serialize(item.labels,          out);
        }
        catch (serialization_error& e)
        { 
            throw serialization_error(e.info + "\n   while serializing object of type multiclass_linear_decision_function"); 
        }
    }

    template <
        typename K,
        typename result_type_
        >
    void deserialize (
        multiclass_linear_decision_function<K,result_type_>& item,
        std::istream& in 
    )
    {
        try
        {
            deserialize(item.weights,         in);
            deserialize(item.b,               in);
            deserialize(item.labels,          in);
        }
        catch (serialization_error& e)
        { 
            throw serialization_error(e.info + "\n   while deserializing object of type multiclass_linear_decision_function"); 
        }
    }

// ----------------------------------------------------------------------------------------

}

#endif // DLIB_SVm_FUNCTION


