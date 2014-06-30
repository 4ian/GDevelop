// Copyright (C) 2010  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#ifndef DLIB_SYMMETRIC_MATRIX_CAcHE_H__
#define DLIB_SYMMETRIC_MATRIX_CAcHE_H__

#include "symmetric_matrix_cache_abstract.h"
#include <vector>
#include "../matrix.h"
#include "../algs.h"
#include "../array.h"

namespace dlib 
{

// ----------------------------------------------------------------------------------------

    template <typename M, typename cache_element_type>
    struct op_symm_cache : basic_op_m<M>
    {
        inline op_symm_cache( 
            const M& m_,
            long max_size_megabytes_
        ) : 
            basic_op_m<M>(m_),
            max_size_megabytes(max_size_megabytes_),
            is_initialized(false)
        {
            lookup.assign(this->m.nr(), -1);

            diag_cache = matrix_cast<cache_element_type>(dlib::diag(m_));
        }

        op_symm_cache (
            const op_symm_cache& item
        ) :
            basic_op_m<M>(item.m),
            diag_cache(item.diag_cache),
            max_size_megabytes(item.max_size_megabytes),
            is_initialized(false)
        {
            lookup.assign(this->m.nr(), -1);
        }

        typedef cache_element_type type;
        typedef const cache_element_type& const_ret_type;
        const static long cost = M::cost + 3;

        inline const_ret_type apply ( long r, long c) const
        { 
            if (lookup[c] != -1)
            {
                return cache[lookup[c]](r);
            }
            else if (r == c)
            {
                return diag_cache(r);
            }
            else if (lookup[r] != -1)
            {
                // the matrix is symmetric so this is legit
                return cache[lookup[r]](c);
            }
            else
            {
                add_col_to_cache(c);
                return cache[lookup[c]](r);
            }
        }

        inline std::pair<const type*,long*> col(long i) const 
        /*!
            requires
                - 0 <= i < nc()
            ensures
                - returns a pair P such that:
                    - P.first == a pointer to the first element of the ith column
                    - P.second == a pointer to the integer used to count the number of
                      outstanding references to the ith column.
        !*/
        { 
            if (is_cached(i) == false)
                add_col_to_cache(i);

            // find where this column is in the cache
            long idx = lookup[i];
            if (idx == next)
            {
                // if this column was the next to be replaced
                // then make sure that doesn't happen
                next = (next + 1)%cache.size();
            }

            return std::make_pair(&cache[idx](0), &references[idx]); 
        }

        const type* diag() const { init(); return &diag_cache(0); }

        long* diag_ref_count() const
        {
            return &diag_reference_count;
        }

    private:
        inline bool is_cached (
            long r
        ) const
        {
            return (lookup[r] != -1);
        }

        inline void init() const
        {
            if (is_initialized == false)
            {
                // figure out how many columns of the matrix we can have
                // with the given amount of memory.
                long max_size = (max_size_megabytes*1024*1024)/(this->m.nr()*sizeof(type));
                // don't let it be 0 or 1
                if (max_size <= 1)
                    max_size = 2;

                const long size = std::min(max_size,this->m.nr());

                diag_reference_count = 0;

                references.set_max_size(this->m.nr());
                references.set_size(size);
                for (unsigned long i = 0; i < references.size(); ++i)
                    references[i] = 0;

                cache.set_max_size(this->m.nr());
                cache.set_size(size);

                rlookup.assign(size,-1);
                next = 0;

                is_initialized = true;
            }
        }

        void make_sure_next_is_unreferenced (
        ) const
        {
            if (references[next] != 0)
            {
                // find an unreferenced element of the cache
                unsigned long i;
                for (i = 1; i < references.size(); ++i)
                {
                    const unsigned long idx = (next+i)%references.size();
                    if (references[idx] == 0)
                    {
                        next = idx;
                        break;
                    }
                }

                // if all elements of the cache are referenced then make the cache bigger
                // and use the new element.
                if (references[next] != 0)
                {
                    cache.resize(cache.size()+1);

                    next = references.size();
                    references.resize(references.size()+1);
                    references[next] = 0;

                    rlookup.push_back(-1);
                }
            }
        }

        inline void add_col_to_cache(
            long c
        ) const
        {
            init();
            make_sure_next_is_unreferenced();

            // if the lookup table is pointing to cache[next] then clear lookup[next]
            if (rlookup[next] != -1)
                lookup[rlookup[next]] = -1;

            // make the lookup table so that it says c is now cached at the spot indicated by next
            lookup[c] = next;
            rlookup[next] = c;

            // compute this column in the matrix and store it in the cache
            cache[next] = matrix_cast<cache_element_type>(colm(this->m,c));

            next = (next + 1)%cache.size();
        }

        /*!
        INITIAL VALUE
            - for all valid x:
                - lookup(x) == -1 

            - diag_cache == the diagonal of the original matrix
            - is_initialized == false 
            - max_size_megabytes == the max_size_megabytes from symmetric_matrix_cache()

        CONVENTION
            - diag_cache == the diagonal of the original matrix
            - lookup.size() == diag_cache.size()

            - if (is_initialized) then
                - if (lookup[c] != -1) then
                    - cache[lookup[c]] == the cached column c of the matrix
                    - rlookup[lookup[c]] == c

                - if (rlookup[x] != -1) then
                    - lookup[rlookup[x]] == x
                    - cache[x] == the cached column rlookup[x] of the matrix

                - next == the next element in the cache table to use to cache something 
                - references[i] == the number of outstanding references to cache element cache[i]

                - diag_reference_count == the number of outstanding references to diag_cache. 
                  (this isn't really needed.  It's just here so that we can reuse the matrix
                  expression from colm() to implement diag())
        !*/


        mutable array<matrix<type,0,1,typename M::mem_manager_type> > cache;
        mutable array<long> references;
        matrix<type,0,1,typename M::mem_manager_type> diag_cache;
        mutable std::vector<long> lookup;
        mutable std::vector<long> rlookup;
        mutable long next;

        const long max_size_megabytes;
        mutable bool is_initialized;
        mutable long diag_reference_count;

    };

    template <
        typename cache_element_type,
        typename EXP
        >
    const matrix_op<op_symm_cache<EXP,cache_element_type> >  symmetric_matrix_cache (
        const matrix_exp<EXP>& m,
        long max_size_megabytes
    )
    {
        // Don't check that m is symmetric since doing so would be extremely onerous for the
        // kinds of matrices intended for use with the symmetric_matrix_cache.  Check everything
        // else though.
        DLIB_ASSERT(m.size() > 0 && m.nr() == m.nc() && max_size_megabytes >= 0, 
            "\tconst matrix_exp symmetric_matrix_cache(const matrix_exp& m, max_size_megabytes)"
            << "\n\t You have given invalid arguments to this function"
            << "\n\t m.nr():             " << m.nr()
            << "\n\t m.nc():             " << m.nc() 
            << "\n\t m.size():           " << m.size() 
            << "\n\t max_size_megabytes: " << max_size_megabytes 
            );

        typedef op_symm_cache<EXP,cache_element_type> op;
        return matrix_op<op>(op(m.ref(), max_size_megabytes));
    }

// ----------------------------------------------------------------------------------------

    template <typename M, typename cache_element_type>
    struct op_colm_symm_cache 
    {
        typedef cache_element_type type;

        op_colm_symm_cache(
            const M& m_,
            const type* data_,
            long* ref_count_ 
        ) : 
            m(m_), 
            data(data_),
            ref_count(ref_count_)
        {
            *ref_count += 1;
        }

        op_colm_symm_cache (
            const op_colm_symm_cache& item
        ) :
            m(item.m), 
            data(item.data),
            ref_count(item.ref_count)
        {
            *ref_count += 1;
        }

        ~op_colm_symm_cache(
        )
        {
            *ref_count -= 1;
        }

        const M& m;

        const type* const data;
        long* const ref_count;

        const static long cost = M::cost;
        const static long NR = M::NR;
        const static long NC = 1;
        typedef const type& const_ret_type;
        typedef typename M::mem_manager_type mem_manager_type;
        typedef typename M::layout_type layout_type;
        inline const_ret_type apply ( long r, long) const { return data[r]; }

        long nr () const { return m.nr(); }
        long nc () const { return 1; }

        template <typename U> bool aliases               ( const matrix_exp<U>& item) const { return m.aliases(item); }
        template <typename U> bool destructively_aliases ( const matrix_exp<U>& item) const { return m.aliases(item); }
    };

    template <
        typename EXP,
        typename cache_element_type
        >
    inline const matrix_op<op_colm_symm_cache<EXP,cache_element_type> > colm (
        const matrix_exp<matrix_op<op_symm_cache<EXP,cache_element_type> > >& m,
        long col 
    )
    {
        DLIB_ASSERT(col >= 0 && col < m.nc(), 
            "\tconst matrix_exp colm(const matrix_exp& m, row)"
            << "\n\tYou have specified invalid sub matrix dimensions"
            << "\n\tm.nr(): " << m.nr()
            << "\n\tm.nc(): " << m.nc() 
            << "\n\tcol:    " << col 
            );

        std::pair<const cache_element_type*,long*> p = m.ref().op.col(col);

        typedef op_colm_symm_cache<EXP,cache_element_type> op;
        return matrix_op<op>(op(m.ref().op.m, 
                                p.first,
                                p.second));
    }

// ----------------------------------------------------------------------------------------

    template <
        typename EXP,
        typename cache_element_type
        >
    inline const matrix_op<op_colm_symm_cache<EXP,cache_element_type> > diag (
        const matrix_exp<matrix_op<op_symm_cache<EXP,cache_element_type> > >& m
    )
    {
        typedef op_colm_symm_cache<EXP,cache_element_type> op;
        return matrix_op<op>(op(m.ref().op.m, 
                                m.ref().op.diag(),
                                m.ref().op.diag_ref_count()));
    }

// ----------------------------------------------------------------------------------------

    template <typename M, typename cache_element_type>
    struct op_rowm_symm_cache 
    {
        typedef cache_element_type type;

        op_rowm_symm_cache(
            const M& m_,
            const type* data_,
            long* ref_count_ 
        ) : 
            m(m_), 
            data(data_),
            ref_count(ref_count_)
        {
            *ref_count += 1;
        }

        op_rowm_symm_cache (
            const op_rowm_symm_cache& item
        ) :
            m(item.m), 
            data(item.data),
            ref_count(item.ref_count)
        {
            *ref_count += 1;
        }

        ~op_rowm_symm_cache(
        )
        {
            *ref_count -= 1;
        }

        const M& m;

        const type* const data;
        long* const ref_count;

        const static long cost = M::cost;
        const static long NR = 1;
        const static long NC = M::NC;
        typedef const type& const_ret_type;
        typedef typename M::mem_manager_type mem_manager_type;
        typedef typename M::layout_type layout_type;
        inline const_ret_type apply ( long , long c) const { return data[c]; }

        long nr () const { return 1; }
        long nc () const { return m.nc(); }

        template <typename U> bool aliases               ( const matrix_exp<U>& item) const { return m.aliases(item); }
        template <typename U> bool destructively_aliases ( const matrix_exp<U>& item) const { return m.aliases(item); }
    };

    template <
        typename EXP,
        typename cache_element_type
        >
    inline const matrix_op<op_rowm_symm_cache<EXP,cache_element_type> > rowm (
        const matrix_exp<matrix_op<op_symm_cache<EXP,cache_element_type> > >& m,
        long row 
    )
    {
        DLIB_ASSERT(row >= 0 && row < m.nr(), 
            "\tconst matrix_exp rowm(const matrix_exp& m, row)"
            << "\n\tYou have specified invalid sub matrix dimensions"
            << "\n\tm.nr(): " << m.nr()
            << "\n\tm.nc(): " << m.nc() 
            << "\n\trow:    " << row 
            );

        std::pair<const cache_element_type*,long*> p = m.ref().op.col(row);

        typedef op_rowm_symm_cache<EXP,cache_element_type> op;
        return matrix_op<op>(op(m.ref().op.m, 
                                p.first,
                                p.second));
    }

// ----------------------------------------------------------------------------------------

    template <typename EXP, typename cache_element_type>
    struct colm_exp<matrix_op<op_symm_cache<EXP, cache_element_type> > >
    {
        typedef matrix_op<op_colm_symm_cache<EXP, cache_element_type> > type;
    };

    template <typename EXP, typename cache_element_type>
    struct rowm_exp<matrix_op<op_symm_cache<EXP, cache_element_type> > >
    {
        typedef matrix_op<op_rowm_symm_cache<EXP, cache_element_type> > type;
    };

    template <typename EXP, typename cache_element_type>
    struct diag_exp<matrix_op<op_symm_cache<EXP, cache_element_type> > >
    {
        typedef matrix_op<op_colm_symm_cache<EXP, cache_element_type> > type;
    };

// ----------------------------------------------------------------------------------------

}

#endif // DLIB_SYMMETRIC_MATRIX_CAcHE_H__

