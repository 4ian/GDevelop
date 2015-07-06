// Copyright (C) 2009  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#ifndef DLIB_SVm_SPARSE_VECTOR
#define DLIB_SVm_SPARSE_VECTOR

#include "sparse_vector_abstract.h"
#include <cmath>
#include <limits>
#include "../algs.h"
#include <vector>
#include <map>
#include "../graph_utils/edge_list_graphs.h"
#include "../matrix.h"


namespace dlib
{

// ----------------------------------------------------------------------------------------

    template <typename T, typename U>
    typename T::value_type::second_type distance_squared (
        const T& a,
        const U& b
    )
    {
        typedef typename T::value_type::second_type scalar_type;
        typedef typename U::value_type::second_type scalar_typeU;
        // Both T and U must contain the same kinds of elements
        COMPILE_TIME_ASSERT((is_same_type<scalar_type, scalar_typeU>::value));

        typename T::const_iterator ai = a.begin();
        typename U::const_iterator bi = b.begin();

        scalar_type sum = 0, temp = 0;
        while (ai != a.end() && bi != b.end())
        {
            if (ai->first == bi->first)
            {
                temp = ai->second - bi->second;
                ++ai;
                ++bi;
            }
            else if (ai->first < bi->first)
            {
                temp = ai->second;
                ++ai;
            }
            else 
            {
                temp = bi->second;
                ++bi;
            }

            sum += temp*temp;
        }

        while (ai != a.end())
        {
            sum += ai->second*ai->second;
            ++ai;
        }
        while (bi != b.end())
        {
            sum += bi->second*bi->second;
            ++bi;
        }

        return sum;
    }

// ------------------------------------------------------------------------------------

    template <typename T, typename U, typename V, typename W>
    typename T::value_type::second_type distance_squared (
        const V& a_scale,
        const T& a,
        const W& b_scale,
        const U& b
    )
    {
        typedef typename T::value_type::second_type scalar_type;
        typedef typename U::value_type::second_type scalar_typeU;
        // Both T and U must contain the same kinds of elements
        COMPILE_TIME_ASSERT((is_same_type<scalar_type, scalar_typeU>::value));

        typename T::const_iterator ai = a.begin();
        typename U::const_iterator bi = b.begin();

        scalar_type sum = 0, temp = 0;
        while (ai != a.end() && bi != b.end())
        {
            if (ai->first == bi->first)
            {
                temp = a_scale*ai->second - b_scale*bi->second;
                ++ai;
                ++bi;
            }
            else if (ai->first < bi->first)
            {
                temp = a_scale*ai->second;
                ++ai;
            }
            else 
            {
                temp = b_scale*bi->second;
                ++bi;
            }

            sum += temp*temp;
        }

        while (ai != a.end())
        {
            sum += a_scale*a_scale*ai->second*ai->second;
            ++ai;
        }
        while (bi != b.end())
        {
            sum += b_scale*b_scale*bi->second*bi->second;
            ++bi;
        }

        return sum;
    }

// ------------------------------------------------------------------------------------

    template <typename T, typename U>
    typename T::value_type::second_type distance (
        const T& a,
        const U& b
    )
    {
        return std::sqrt(distance_squared(a,b));
    }

// ------------------------------------------------------------------------------------

    template <typename T, typename U, typename V, typename W>
    typename T::value_type::second_type distance (
        const V& a_scale,
        const T& a,
        const W& b_scale,
        const U& b
    )
    {
        return std::sqrt(distance_squared(a_scale,a,b_scale,b));
    }

// ------------------------------------------------------------------------------------
    // ------------------------------------------------------------------------------------

    template <typename T, typename EXP>
    typename enable_if<is_matrix<T> >::type assign (
        T& dest,
        const matrix_exp<EXP>& src
    )
    {
        // make sure requires clause is not broken
        DLIB_ASSERT(is_vector(src),
                    "\t void assign(dest,src)"
                    << "\n\t the src matrix must be a row or column vector"
        );

        dest = src;
    }

    template <typename T, typename EXP>
    typename disable_if<is_matrix<T> >::type assign (
        T& dest,
        const matrix_exp<EXP>& src
    )
    {
        // make sure requires clause is not broken
        DLIB_ASSERT(is_vector(src),
                    "\t void assign(dest,src)"
                    << "\n\t the src matrix must be a row or column vector"
        );

        dest.clear();
        typedef typename T::value_type item_type;
        for (long i = 0; i < src.size(); ++i)
        {
            dest.insert(dest.end(),item_type(i, src(i)));
        }
    }

    template <typename T, typename U>
    typename disable_if_c<is_matrix<T>::value || is_matrix<U>::value>::type assign (
        T& dest,        // sparse
        const U& src    // sparse
    )
    {
        dest.assign(src.begin(), src.end());
    }

    template <typename T, typename U, typename Comp, typename Alloc, typename S>
    typename disable_if<is_matrix<S> >::type assign (
        std::map<T,U,Comp,Alloc>& dest, // sparse
        const S& src                    // sparse
    )
    {
        dest.clear();
        dest.insert(src.begin(), src.end());
    }

// ------------------------------------------------------------------------------------
    // ------------------------------------------------------------------------------------

    template <typename T>
    struct has_unsigned_keys
    {
        static const bool value = is_unsigned_type<typename T::value_type::first_type>::value;
    };

// ------------------------------------------------------------------------------------

    namespace impl
    {
        template <typename T, typename U>
        typename T::value_type::second_type general_dot (
            const T& a,
            const U& b
        )
        {
            typedef typename T::value_type::second_type scalar_type;

            typename T::const_iterator ai = a.begin();
            typename U::const_iterator bi = b.begin();

            scalar_type sum = 0;
            while (ai != a.end() && bi != b.end())
            {
                if (ai->first == bi->first)
                {
                    sum += ai->second * bi->second;
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

        template <typename T, typename U>
        inline typename T::value_type::second_type dot (
            const T& a,
            const U& b
        )
        {
            return general_dot(a,b);
        }

        template <typename T, typename U, typename alloc>
        U dot (
            const std::vector<std::pair<T,U>,alloc>& a,
            const std::vector<std::pair<T,U>,alloc>& b
        )
        {
            // You are getting this error because you are attempting to use sparse sample vectors 
            // but you aren't using an unsigned integer as your key type in the sparse vectors.
            COMPILE_TIME_ASSERT(is_unsigned_type<T>::value);

            if (a.size() == 0 || b.size() == 0)
                return 0;

            // if a is really a dense vector but just represented in a sparse container
            if (a.back().first == a.size()-1)
            {
                double sum = 0;
                for (unsigned long i = 0; i < b.size(); ++i)
                {
                    if (b[i].first >= a.size())
                        break;
                    sum += a[b[i].first].second * b[i].second;
                }
                return sum;
            }
            // if b is really a dense vector but just represented in a sparse container
            else if (b.back().first == b.size()-1)
            {
                double sum = 0;
                for (unsigned long i = 0; i < a.size(); ++i)
                {
                    if (a[i].first >= b.size())
                        break;
                    sum += b[a[i].first].second * a[i].second;
                }
                return sum;
            }
            else
            {
                return general_dot(a,b);
            }
        }
    }

    template <typename T>
    inline typename T::value_type::second_type dot (
        const T& a,
        const T& b
    )
    {
        return impl::dot(a,b);
    }

    template <typename T1, typename T2, typename T3, typename T4, typename T5, typename T6>
    inline T4 dot (
        const std::vector<T1,T2>& a,
        const std::map<T3,T4,T5,T6>& b
    )
    {
        return impl::dot(a,b);
    }

    template <typename T1, typename T2, typename T3, typename T4, typename T5, typename T6>
    inline T4 dot (
        const std::map<T3,T4,T5,T6>& a,
        const std::vector<T1,T2>& b
    )
    {
        return impl::dot(a,b);
    }

// ------------------------------------------------------------------------------------

    template <typename T, typename EXP>
    typename T::value_type::second_type dot (
        const T& a,
        const matrix_exp<EXP>& b
    )
    {
        // make sure requires clause is not broken
        DLIB_ASSERT(is_vector(b),
                    "\t scalar_type dot(sparse_vector a, dense_vector b)"
                    << "\n\t 'b' must be a vector to be used in a dot product." 
        );

        typedef typename T::value_type::second_type scalar_type;
        typedef typename T::value_type::first_type first_type;

        scalar_type sum = 0;
        for (typename T::const_iterator ai = a.begin(); 
             (ai != a.end()) && (ai->first < static_cast<first_type>(b.size())); 
             ++ai)
        {
            sum += ai->second * b(ai->first);
        }

        return sum;
    }

// ------------------------------------------------------------------------------------

    template <typename T, typename EXP>
    typename T::value_type::second_type dot (
        const matrix_exp<EXP>& b,
        const T& a
    )
    {
        return dot(a,b);
    }

// ------------------------------------------------------------------------------------

    template <typename T>
    typename T::value_type::second_type length_squared (
        const T& a
    )
    {
        typedef typename T::value_type::second_type scalar_type;

        typename T::const_iterator i;

        scalar_type sum = 0;

        for (i = a.begin(); i != a.end(); ++i)
        {
            sum += i->second * i->second;
        }

        return sum;
    }

// ------------------------------------------------------------------------------------

    template <typename T>
    typename T::value_type::second_type length (
        const T& a
    )
    {
        return std::sqrt(length_squared(a));
    }

// ------------------------------------------------------------------------------------

    template <typename T, typename U>
    typename disable_if<is_matrix<T>,void>::type scale_by (
        T& a,
        const U& value
    )
    {
        for (typename T::iterator i = a.begin(); i != a.end(); ++i)
        {
            i->second *= value;
        }
    }

    template <typename T, typename U>
    typename enable_if<is_matrix<T>,void>::type scale_by (
        T& a,
        const U& value
    )
    {
        a *= value;
    }

// ------------------------------------------------------------------------------------

    template <typename T>
    typename disable_if<is_matrix<T>,T>::type add (
        const T& a,
        const T& b
    )
    {
        T temp;

        typename T::const_iterator i = a.begin();
        typename T::const_iterator j = b.begin();
        while (i != a.end() && j != b.end())
        {
            if (i->first == j->first)
            {
                temp.insert(temp.end(), std::make_pair(i->first, i->second + j->second));
                ++i;
                ++j;
            }
            else if (i->first < j->first)
            {
                temp.insert(temp.end(), *i);
                ++i;
            }
            else
            {
                temp.insert(temp.end(), *j);
                ++j;
            }
        }

        while (i != a.end())
        {
            temp.insert(temp.end(), *i);
            ++i;
        }
        while (j != b.end())
        {
            temp.insert(temp.end(), *j);
            ++j;
        }

        return temp;
    }

    template <typename T, typename U>
    typename enable_if_c<is_matrix<T>::value && is_matrix<U>::value, matrix_add_exp<T,U> >::type add (
        const T& a,
        const U& b
    )
    {
        return matrix_add_exp<T,U>(a.ref(),b.ref());
    }

// ------------------------------------------------------------------------------------

    template <typename T>
    typename disable_if<is_matrix<T>,T>::type subtract (
        const T& a,
        const T& b
    )
    {
        T temp;

        typename T::const_iterator i = a.begin();
        typename T::const_iterator j = b.begin();
        while (i != a.end() && j != b.end())
        {
            if (i->first == j->first)
            {
                temp.insert(temp.end(), std::make_pair(i->first, i->second - j->second));
                ++i;
                ++j;
            }
            else if (i->first < j->first)
            {
                temp.insert(temp.end(), *i);
                ++i;
            }
            else
            {
                temp.insert(temp.end(), std::make_pair(j->first, -j->second));
                ++j;
            }
        }

        while (i != a.end())
        {
            temp.insert(temp.end(), *i);
            ++i;
        }
        while (j != b.end())
        {
            temp.insert(temp.end(), std::make_pair(j->first, -j->second));
            ++j;
        }

        return temp;
    }

    template <typename T, typename U>
    typename enable_if_c<is_matrix<T>::value && is_matrix<U>::value, matrix_subtract_exp<T,U> >::type subtract (
        const T& a,
        const U& b
    )
    {
        return matrix_subtract_exp<T,U>(a.ref(),b.ref());
    }

// ------------------------------------------------------------------------------------
// ------------------------------------------------------------------------------------

    namespace impl
    {
        template <typename T>
        typename enable_if<is_matrix<typename T::type>,unsigned long>::type max_index_plus_one (
            const T& samples
        ) 
        {
            if (samples.size() > 0)
                return samples(0).size();
            else
                return 0;
        }

        template <typename T>
        typename enable_if<is_built_in_scalar_type<typename T::type>,unsigned long>::type max_index_plus_one (
            const T& sample
        ) 
        {
            return sample.size();
        }

        // This !is_built_in_scalar_type<typename T::type>::value is here to avoid an inexplicable bug in Vistual Studio 2005
        template <typename T>
        typename enable_if_c<(!is_built_in_scalar_type<typename T::type>::value) && (is_pair<typename T::type::value_type>::value) ,unsigned long>::type 
        max_index_plus_one (
            const T& samples
        ) 
        {
            typedef typename T::type sample_type;
            // You are getting this error because you are attempting to use sparse sample vectors 
            // but you aren't using an unsigned integer as your key type in the sparse vectors.
            COMPILE_TIME_ASSERT(has_unsigned_keys<sample_type>::value);


            // these should be sparse samples so look over all them to find the max index.
            unsigned long max_dim = 0;
            for (long i = 0; i < samples.size(); ++i)
            {
                if (samples(i).size() > 0)
                    max_dim = std::max<unsigned long>(max_dim, (--samples(i).end())->first + 1);
            }

            return max_dim;
        }
    }

    template <typename T>
    typename enable_if<is_pair<typename T::value_type>,unsigned long>::type max_index_plus_one (
        const T& sample
    ) 
    {
        if (sample.size() > 0)
            return (--sample.end())->first + 1;
        return 0;
    }

    template <typename T>
    typename disable_if_c<is_pair<typename T::value_type>::value ||
                          is_same_type<typename T::value_type,sample_pair>::value ||
                          is_same_type<typename T::value_type,ordered_sample_pair>::value , unsigned long>::type 
    max_index_plus_one (
        const T& samples
    ) 
    {
        return impl::max_index_plus_one(mat(samples));
    }

// ------------------------------------------------------------------------------------

    template <typename T, long NR, long NC, typename MM, typename L, typename EXP>
    inline void add_to (
        matrix<T,NR,NC,MM,L>& dest,
        const matrix_exp<EXP>& src 
    ) 
    {
        // make sure requires clause is not broken
        DLIB_ASSERT(is_vector(dest) && max_index_plus_one(src) <= static_cast<unsigned long>(dest.size()),
                    "\t void add_to(dest,src)"
                    << "\n\t dest must be a vector large enough to hold the src vector."
                    << "\n\t is_vector(dest):         " << is_vector(dest)
                    << "\n\t max_index_plus_one(src): " << max_index_plus_one(src)
                    << "\n\t dest.size():             " << dest.size() 
        );

        for (long r = 0; r < src.size(); ++r)
            dest(r) += src(r);
    }

    template <typename T, long NR, long NC, typename MM, typename L, typename EXP>
    inline typename disable_if<is_matrix<EXP> >::type add_to (
        matrix<T,NR,NC,MM,L>& dest,
        const EXP& src
    ) 
    {
        // make sure requires clause is not broken
        DLIB_ASSERT(is_vector(dest) && max_index_plus_one(src) <= static_cast<unsigned long>(dest.size()),
                    "\t void add_to(dest,src)"
                    << "\n\t dest must be a vector large enough to hold the src vector."
                    << "\n\t is_vector(dest):         " << is_vector(dest)
                    << "\n\t max_index_plus_one(src): " << max_index_plus_one(src)
                    << "\n\t dest.size():             " << dest.size() 
        );

        for (typename EXP::const_iterator i = src.begin(); i != src.end(); ++i)
            dest(i->first) += i->second;
    }

// ------------------------------------------------------------------------------------

    template <typename T, long NR, long NC, typename MM, typename L, typename EXP, typename U>
    inline void add_to (
        matrix<T,NR,NC,MM,L>& dest,
        const matrix_exp<EXP>& src,
        const U& C
    ) 
    {
        // make sure requires clause is not broken
        DLIB_ASSERT(is_vector(dest) && max_index_plus_one(src) <= static_cast<unsigned long>(dest.size()),
                    "\t void add_to(dest,src)"
                    << "\n\t dest must be a vector large enough to hold the src vector."
                    << "\n\t is_vector(dest):         " << is_vector(dest)
                    << "\n\t max_index_plus_one(src): " << max_index_plus_one(src)
                    << "\n\t dest.size():             " << dest.size() 
        );

        for (long r = 0; r < src.size(); ++r)
            dest(r) += C*src(r);
    }

    template <typename T, long NR, long NC, typename MM, typename L, typename EXP, typename U>
    inline typename disable_if<is_matrix<EXP> >::type add_to (
        matrix<T,NR,NC,MM,L>& dest,
        const EXP& src,
        const U& C
    ) 
    {
        // make sure requires clause is not broken
        DLIB_ASSERT(is_vector(dest) && max_index_plus_one(src) <= static_cast<unsigned long>(dest.size()),
                    "\t void add_to(dest,src)"
                    << "\n\t dest must be a vector large enough to hold the src vector."
                    << "\n\t is_vector(dest):         " << is_vector(dest)
                    << "\n\t max_index_plus_one(src): " << max_index_plus_one(src)
                    << "\n\t dest.size():             " << dest.size() 
        );

        for (typename EXP::const_iterator i = src.begin(); i != src.end(); ++i)
            dest(i->first) += C*i->second;
    }

// ------------------------------------------------------------------------------------

    template <typename T, long NR, long NC, typename MM, typename L, typename EXP>
    inline void subtract_from (
        matrix<T,NR,NC,MM,L>& dest,
        const matrix_exp<EXP>& src 
    ) 
    {
        // make sure requires clause is not broken
        DLIB_ASSERT(is_vector(dest) && max_index_plus_one(src) <= static_cast<unsigned long>(dest.size()),
                    "\t void subtract_from(dest,src)"
                    << "\n\t dest must be a vector large enough to hold the src vector."
                    << "\n\t is_vector(dest):         " << is_vector(dest)
                    << "\n\t max_index_plus_one(src): " << max_index_plus_one(src)
                    << "\n\t dest.size():             " << dest.size() 
        );

        for (long r = 0; r < src.size(); ++r)
            dest(r) -= src(r);
    }

    template <typename T, long NR, long NC, typename MM, typename L, typename EXP>
    inline typename disable_if<is_matrix<EXP> >::type subtract_from (
        matrix<T,NR,NC,MM,L>& dest,
        const EXP& src
    ) 
    {
        // make sure requires clause is not broken
        DLIB_ASSERT(is_vector(dest) && max_index_plus_one(src) <= static_cast<unsigned long>(dest.size()),
                    "\t void subtract_from(dest,src)"
                    << "\n\t dest must be a vector large enough to hold the src vector."
                    << "\n\t is_vector(dest):         " << is_vector(dest)
                    << "\n\t max_index_plus_one(src): " << max_index_plus_one(src)
                    << "\n\t dest.size():             " << dest.size() 
        );

        for (typename EXP::const_iterator i = src.begin(); i != src.end(); ++i)
            dest(i->first) -= i->second;
    }

// ------------------------------------------------------------------------------------

    template <typename T, long NR, long NC, typename MM, typename L, typename EXP, typename U>
    inline void subtract_from (
        matrix<T,NR,NC,MM,L>& dest,
        const matrix_exp<EXP>& src,
        const U& C
    ) 
    {
        // make sure requires clause is not broken
        DLIB_ASSERT(is_vector(dest) && max_index_plus_one(src) <= static_cast<unsigned long>(dest.size()),
                    "\t void subtract_from(dest,src)"
                    << "\n\t dest must be a vector large enough to hold the src vector."
                    << "\n\t is_vector(dest):         " << is_vector(dest)
                    << "\n\t max_index_plus_one(src): " << max_index_plus_one(src)
                    << "\n\t dest.size():             " << dest.size() 
        );

        for (long r = 0; r < src.size(); ++r)
            dest(r) -= C*src(r);
    }

    template <typename T, long NR, long NC, typename MM, typename L, typename EXP, typename U>
    inline typename disable_if<is_matrix<EXP> >::type subtract_from (
        matrix<T,NR,NC,MM,L>& dest,
        const EXP& src,
        const U& C
    ) 
    {
        // make sure requires clause is not broken
        DLIB_ASSERT(is_vector(dest) && max_index_plus_one(src) <= static_cast<unsigned long>(dest.size()),
                    "\t void subtract_from(dest,src)"
                    << "\n\t dest must be a vector large enough to hold the src vector."
                    << "\n\t is_vector(dest):         " << is_vector(dest)
                    << "\n\t max_index_plus_one(src): " << max_index_plus_one(src)
                    << "\n\t dest.size():             " << dest.size() 
        );

        for (typename EXP::const_iterator i = src.begin(); i != src.end(); ++i)
            dest(i->first) -= C*i->second;
    }

// ------------------------------------------------------------------------------------

    template <typename T>
    typename T::value_type::second_type min (
        const T& a
    )
    {
        typedef typename T::value_type::second_type type;

        type temp = 0;
        for (typename T::const_iterator i = a.begin(); i != a.end(); ++i)
        {
            if (temp > i->second)
                temp = i->second;
        }
        return temp;
    }

// ------------------------------------------------------------------------------------

    template <typename T>
    typename T::value_type::second_type max (
        const T& a
    )
    {
        typedef typename T::value_type::second_type type;

        type temp = 0;
        for (typename T::const_iterator i = a.begin(); i != a.end(); ++i)
        {
            if (temp < i->second)
                temp = i->second;
        }
        return temp;
    }

// ----------------------------------------------------------------------------------------

    namespace impl
    {
        template <typename sparse_vector_type>
        inline matrix<typename sparse_vector_type::value_type::second_type,0,1> sparse_to_dense (
            const sparse_vector_type& vect,
            unsigned long num_dimensions 
        )
        {
            // You must use unsigned integral key types in your sparse vectors
            typedef typename sparse_vector_type::value_type::first_type idx_type;
            typedef typename sparse_vector_type::value_type::second_type value_type;
            COMPILE_TIME_ASSERT(is_unsigned_type<idx_type>::value);

            matrix<value_type,0,1> result;

            if (vect.size() == 0)
                return result;

            result.set_size(num_dimensions);
            result = 0;

            for (typename sparse_vector_type::const_iterator j = vect.begin(); j != vect.end(); ++j)
            {
                if ((long)(j->first) < result.size())
                {
                    result(j->first) += j->second;
                }
            }

            return result;
        }
    }

// ----------------------------------------------------------------------------------------

    template <typename idx_type, typename value_type, typename alloc>
    matrix<value_type,0,1> sparse_to_dense (
        const std::vector<std::pair<idx_type,value_type>,alloc>& vect,
        unsigned long num_dimensions 
    )
    {
        return impl::sparse_to_dense(vect,num_dimensions);
    }

// ----------------------------------------------------------------------------------------

    template <typename idx_type, typename value_type, typename alloc>
    matrix<value_type,0,1> sparse_to_dense (
        const std::vector<std::pair<idx_type,value_type>,alloc>& vect
    )
    {
        return impl::sparse_to_dense(vect, max_index_plus_one(vect));
    }

// ----------------------------------------------------------------------------------------

    template <typename T1, typename T2, typename T3, typename T4>
    matrix<T2,0,1> sparse_to_dense (
        const std::map<T1,T2,T3,T4>& vect,
        unsigned long num_dimensions 
    )
    {
        return impl::sparse_to_dense(vect,num_dimensions);
    }

// ----------------------------------------------------------------------------------------

    template <typename T1, typename T2, typename T3, typename T4>
    matrix<T2,0,1> sparse_to_dense (
        const std::map<T1,T2,T3,T4>& vect
    )
    {
        return impl::sparse_to_dense(vect, max_index_plus_one(vect));
    }

// ----------------------------------------------------------------------------------------

    template <typename T>
    typename enable_if<is_matrix<T>,T&>::type sparse_to_dense(
        T& item
    ) { return item; }
    
    template <typename EXP>
    matrix<typename EXP::type,0,1> sparse_to_dense(
        const matrix_exp<EXP>& item,
        unsigned long num
    ) 
    { 
        typedef typename EXP::type type;
        if (item.size() == (long)num)
            return item; 
        else if (item.size() < (long)num)
            return join_cols(item, zeros_matrix<type>((long)num-item.size(),1));
        else
            return colm(item,0,(long)num);
    }
    
// ----------------------------------------------------------------------------------------

    template <typename sample_type, typename alloc>
    std::vector<matrix<typename sample_type::value_type::second_type,0,1> > sparse_to_dense (
        const std::vector<sample_type, alloc>& samples,
        unsigned long num_dimensions
    )
    {
        typedef typename sample_type::value_type pair_type;
        typedef typename pair_type::second_type value_type;

        std::vector< matrix<value_type,0,1> > result;

        // now turn all the samples into dense samples
        result.resize(samples.size());

        for (unsigned long i = 0; i < samples.size(); ++i)
        {
            result[i] = sparse_to_dense(samples[i],num_dimensions);
        }

        return result;
    }

// ----------------------------------------------------------------------------------------

    template <typename sample_type, typename alloc>
    std::vector<matrix<typename sample_type::value_type::second_type,0,1> > sparse_to_dense (
        const std::vector<sample_type, alloc>& samples
    )
    {
        return sparse_to_dense(samples, max_index_plus_one(samples));
    }

// ----------------------------------------------------------------------------------------

    template <
        typename T
        >
    T make_sparse_vector (
        const T& v
    )
    {
        // You must use unsigned integral key types in your sparse vectors
        typedef typename T::value_type::first_type idx_type;
        typedef typename T::value_type::second_type value_type;
        COMPILE_TIME_ASSERT(is_unsigned_type<idx_type>::value);
        std::map<idx_type,value_type> temp;
        for (typename T::const_iterator i = v.begin(); i != v.end(); ++i)
        {
            temp[i->first] += i->second;
        }

        return T(temp.begin(), temp.end());
    }

// ----------------------------------------------------------------------------------------

    template <
        typename T
        >
    void make_sparse_vector_inplace(
        T& vect
    )
    {
        vect = make_sparse_vector(vect);
    }

// ----------------------------------------------------------------------------------------

    template <
        typename T,
        typename U,
        typename alloc
        >
    void make_sparse_vector_inplace (
        std::vector<std::pair<T,U>,alloc>& vect
    )
    {
        if (vect.size() > 0)
        {
            std::sort(vect.begin(), vect.end());

            // merge duplicates
            for (unsigned long i = 1; i < vect.size(); ++i)
            {
                // if we found a duplicate
                if (vect[i-1].first == vect[i].first)
                {
                    // now start collapsing and merging the vector
                    unsigned long j = i-1;
                    for (unsigned long k = i; k < vect.size(); ++k)
                    {
                        if (vect[j].first == vect[k].first)
                        {
                            vect[j].second += vect[k].second;
                        }
                        else
                        {
                            ++j;
                            vect[j] = vect[k];
                        }
                    }


                    // we removed elements when we merged so we need to adjust the size.
                    vect.resize(j+1);
                    return;
                }
            }
        }
    }

// ----------------------------------------------------------------------------------------

    template <typename EXP, typename T, long NR, long NC, typename MM, typename L>
    void sparse_matrix_vector_multiply (
        const std::vector<sample_pair>& edges,
        const matrix_exp<EXP>& v,
        matrix<T,NR,NC,MM,L>& result
    )
    {
        // make sure requires clause is not broken
        DLIB_ASSERT(max_index_plus_one(edges) <= (unsigned long)v.size() &&
                    is_col_vector(v),
                    "\t void sparse_matrix_vector_multiply()"
                    << "\n\t Invalid inputs were given to this function"
                    << "\n\t max_index_plus_one(edges): " << max_index_plus_one(edges)
                    << "\n\t v.size():                  " << v.size() 
                    << "\n\t is_col_vector(v):          " << is_col_vector(v) 
        );

        result.set_size(v.nr(),v.nc());
        result = 0;

        for (unsigned long k = 0; k < edges.size(); ++k)
        {
            const long i = edges[k].index1();
            const long j = edges[k].index2();
            const double d = edges[k].distance();

            result(i) += v(j)*d;
            if (i != j)
                result(j) += v(i)*d;
        }
    }

// ----------------------------------------------------------------------------------------

    template <typename EXP>
    matrix<typename EXP::type,0,1> sparse_matrix_vector_multiply (
        const std::vector<sample_pair>& edges,
        const matrix_exp<EXP>& v
    )
    {
        matrix<typename EXP::type,0,1> result;
        sparse_matrix_vector_multiply(edges,v,result);
        return result;
    }

// ----------------------------------------------------------------------------------------

    template <typename EXP, typename T, long NR, long NC, typename MM, typename L>
    void sparse_matrix_vector_multiply (
        const std::vector<ordered_sample_pair>& edges,
        const matrix_exp<EXP>& v,
        matrix<T,NR,NC,MM,L>& result
    )
    {
        // make sure requires clause is not broken
        DLIB_ASSERT(max_index_plus_one(edges) <= (unsigned long)v.size() &&
                    is_col_vector(v),
                    "\t void sparse_matrix_vector_multiply()"
                    << "\n\t Invalid inputs were given to this function"
                    << "\n\t max_index_plus_one(edges): " << max_index_plus_one(edges)
                    << "\n\t v.size():                  " << v.size() 
                    << "\n\t is_col_vector(v):          " << is_col_vector(v) 
        );


        result.set_size(v.nr(),v.nc());
        result = 0;

        for (unsigned long k = 0; k < edges.size(); ++k)
        {
            const long i = edges[k].index1();
            const long j = edges[k].index2();
            const double d = edges[k].distance();

            result(i) += v(j)*d;
        }
    }

// ----------------------------------------------------------------------------------------

    template <typename EXP>
    matrix<typename EXP::type,0,1> sparse_matrix_vector_multiply (
        const std::vector<ordered_sample_pair>& edges,
        const matrix_exp<EXP>& v
    )
    {
        matrix<typename EXP::type,0,1> result;
        sparse_matrix_vector_multiply(edges,v,result);
        return result;
    }

// ----------------------------------------------------------------------------------------

    template <
        typename EXP, 
        typename sparse_vector_type,
        typename T,
        long NR,
        long NC,
        typename MM,
        typename L
        >
    void sparse_matrix_vector_multiply (
        const matrix_exp<EXP>& m,
        const sparse_vector_type& v,
        matrix<T,NR,NC,MM,L>& result
    )
    {
        // make sure requires clause is not broken
        DLIB_ASSERT(max_index_plus_one(v) <= (unsigned long)m.nc(),
                    "\t void sparse_matrix_vector_multiply()"
                    << "\n\t Invalid inputs were given to this function"
                    << "\n\t max_index_plus_one(v): " << max_index_plus_one(v)
                    << "\n\t m.size():              " << m.size() 
        );

        result.set_size(m.nr(),1);
        result = 0;

        for (typename sparse_vector_type::const_iterator i = v.begin(); i != v.end(); ++i)
        {
            for (long r = 0; r < result.nr(); ++r)
            {
                result(r) += m(r, i->first)*i->second;
            }
        }
    }

// ----------------------------------------------------------------------------------------

    template <
        typename EXP, 
        typename sparse_vector_type
        >
    matrix<typename EXP::type,0,1> sparse_matrix_vector_multiply (
        const matrix_exp<EXP>& m,
        const sparse_vector_type& v
    )
    {
        matrix<typename EXP::type,0,1> result;
        sparse_matrix_vector_multiply(m,v,result);
        return result;
    }

// ----------------------------------------------------------------------------------------

}

#endif // DLIB_SVm_SPARSE_VECTOR

