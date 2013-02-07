// Copyright (C) 2009  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#ifndef DLIB_SVm_KERNEL_MATRIX_
#define DLIB_SVm_KERNEL_MATRIX_

#include <vector>
#include "kernel_matrix_abstract.h"
#include "../matrix.h"
#include "../algs.h"

namespace dlib
{

// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------

    namespace impl
    {
        template <typename kernel_type, typename T>
        inline const typename T::type& access ( const matrix_exp<T>& m, long i)
        {
            return m(i);
        }

        // bind to anything that looks like an array and isn't a matrix
        template <typename kernel_type, typename T>
        inline const typename disable_if<is_matrix<T>,typename T::type>::type& access ( const T& m, long i)
        {
            return m[i];
        }

        // Only use this function if T isn't a std::pair because in that case the entire vector is
        // probably itself a sparse sample.
        template <typename kernel_type, typename T, typename alloc>
        inline typename disable_if<is_pair<T>,const T&>::type access ( const std::vector<T,alloc>& m, long i)
        {
            return m[i];
        }

        // Only use this function if T isn't a std::pair because in that case the entire vector is
        // probably a sparse sample.
        template <typename kernel_type, typename T, typename alloc>
        inline typename disable_if<is_pair<T>,const T&>::type access ( const std_vector_c<T,alloc>& m, long i)
        {
            return m[i];
        }

        template <typename kernel_type>
        inline const typename kernel_type::sample_type& access ( 
            const typename kernel_type::sample_type& samp, 
            long 
        )
        {
            return samp;
        }

        // --------------------------------------------

        template <typename kernel_type, typename T>
        inline typename disable_if<is_same_type<T,typename kernel_type::sample_type>,unsigned long>::type 
        size ( const T& m)
        {
            return m.size();
        }

        template <typename kernel_type>
        inline unsigned long size ( 
            const typename kernel_type::sample_type&  
        )
        {
            return 1;
        }

        // --------------------------------------------

        template <typename T>
        typename disable_if<is_matrix<T> >::type assert_is_vector(const T&)
        {}

        template <typename T>
        // This funny #ifdef thing is here because gcc sometimes gives a warning 
        // about v being unused otherwise.
#ifdef ENABLE_ASSERTS
        void assert_is_vector(const matrix_exp<T>& v)
#else
        void assert_is_vector(const matrix_exp<T>& )
#endif
        {
            // make sure requires clause is not broken
            DLIB_ASSERT(is_vector(v) == true,
                "\tconst matrix_exp kernel_matrix()"
                << "\n\t You have to supply this function with row or column vectors"
                << "\n\t v.nr(): " << v.nr()
                << "\n\t v.nc(): " << v.nc()
                );
        }

    }

    template <typename K, typename vect_type1, typename vect_type2>
    struct op_kern_mat  
    {
        op_kern_mat( 
            const K& kern_, 
            const vect_type1& vect1_,
            const vect_type2& vect2_
        ) : 
            kern(kern_), 
            vect1(vect1_),
            vect2(vect2_) 
        {
            // make sure the requires clauses get checked eventually
            impl::assert_is_vector(vect1);
            impl::assert_is_vector(vect2);
        }

        const K& kern;
        const vect_type1& vect1;
        const vect_type2& vect2;

        typedef typename K::scalar_type type;

        const static long cost = 100;
        const static long NR = (is_same_type<vect_type1,typename K::sample_type>::value) ? 1 : 0;
        const static long NC = (is_same_type<vect_type2,typename K::sample_type>::value) ? 1 : 0;

        typedef const type const_ret_type;
        typedef typename K::mem_manager_type mem_manager_type;
        typedef row_major_layout layout_type;

        const_ret_type apply (long r, long c ) const 
        { 
            return kern(impl::access<K>(vect1,r), impl::access<K>(vect2,c)); 
        }

        long nr () const { return impl::size<K>(vect1); }
        long nc () const { return impl::size<K>(vect2); }

        template <typename U> bool aliases               ( const matrix_exp<U>& item ) const { return alias_helper(item.ref()); }
        template <typename U> bool destructively_aliases ( const matrix_exp<U>& item ) const { return alias_helper(item.ref()); }

        template <typename U> bool alias_helper  ( const U& ) const { return false; }

        typedef typename K::sample_type samp_type;

        // Say we destructively alias if one of the vect* objects is actually item.
        bool alias_helper                   (const samp_type& item ) const { return are_same(item, vect1) || are_same(item, vect2); }
        template <typename U> bool are_same (const samp_type& , const U& )         const { return false; }
        bool are_same                       (const samp_type& a, const samp_type& b) const { return (&a == &b); }
    }; 

// ----------------------------------------------------------------------------------------

    template <
        typename K,
        typename V1,
        typename V2 
        >
    const matrix_op<op_kern_mat<K,V1,V2> > kernel_matrix (
        const K& kern,
        const V1& v1,
        const V2& v2
        )
    {
        typedef op_kern_mat<K,V1,V2> op;
        return matrix_op<op>(op(kern,v1,v2));
    }
    
// ----------------------------------------------------------------------------------------

    /*
        It is possible to implement the kernel_matrix() operator with just one operator
        class but treating the version that takes only a single vector separately
        leads to more efficient output by gcc in certain instances.  
    */
    template <typename K, typename vect_type1>
    struct op_kern_mat_single  
    {
        op_kern_mat_single( 
            const K& kern_, 
            const vect_type1& vect1_
        ) : 
            kern(kern_), 
            vect1(vect1_)
        {
            // make sure the requires clauses get checked eventually
            impl::assert_is_vector(vect1);
        }

        const K& kern;
        const vect_type1& vect1;

        typedef typename K::scalar_type type;

        const static long cost = 100;
        const static long NR = (is_same_type<vect_type1,typename K::sample_type>::value) ? 1 : 0;
        const static long NC = (is_same_type<vect_type1,typename K::sample_type>::value) ? 1 : 0;

        typedef const type const_ret_type;
        typedef typename K::mem_manager_type mem_manager_type;
        typedef row_major_layout layout_type;

        const_ret_type apply (long r, long c ) const 
        { 
            return kern(impl::access<K>(vect1,r), impl::access<K>(vect1,c)); 
        }

        long nr () const { return impl::size<K>(vect1); }
        long nc () const { return impl::size<K>(vect1); }

        template <typename U> bool aliases               ( const matrix_exp<U>& item ) const { return alias_helper(item.ref()); }
        template <typename U> bool destructively_aliases ( const matrix_exp<U>& item ) const { return alias_helper(item.ref()); }

        template <typename U> bool alias_helper  ( const U& ) const { return false; }

        typedef typename K::sample_type samp_type;

        // Say we destructively alias if vect1 is actually item.
        bool alias_helper                   (const samp_type& item ) const { return are_same(item, vect1); }
        template <typename U> bool are_same (const samp_type& , const U& )         const { return false; }
        bool are_same                       (const samp_type& a, const samp_type& b) const { return (&a == &b); }
    }; 

    template <
        typename K,
        typename V
        >
    const matrix_op<op_kern_mat_single<K,V> > kernel_matrix (
        const K& kern,
        const V& v
        )
    {
        typedef op_kern_mat_single<K,V> op;
        return matrix_op<op>(op(kern,v));
    }
    
// ----------------------------------------------------------------------------------------

    template <
        typename matrix_dest_type,
        typename K,
        typename V
        >
    inline void matrix_assign (
        matrix_dest_type& dest,
        const matrix_exp<matrix_op<op_kern_mat_single<K,V> > >& src
    )
    /*!
        Overload matrix assignment so that when a kernel_matrix expression
        gets assigned it only evaluates half the kernel matrix (since it is symmetric)
    !*/
    {
        for (long r = 0; r < src.nr(); ++r)
        {
            for (long c = r; c < src.nc(); ++c)
            {
                dest(r,c) = dest(c,r) = src(r,c);
            }
        }
    }

// ----------------------------------------------------------------------------------------

}

#endif // DLIB_SVm_KERNEL_MATRIX_

