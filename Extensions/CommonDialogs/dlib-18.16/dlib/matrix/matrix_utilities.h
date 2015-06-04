// Copyright (C) 2006  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#ifndef DLIB_MATRIx_UTILITIES_
#define DLIB_MATRIx_UTILITIES_

#include "matrix_utilities_abstract.h"
#include "matrix.h"
#include <cmath>
#include <complex>
#include <limits>
#include "../pixel.h"
#include "../stl_checked.h"
#include <vector>
#include <algorithm>
#include "../std_allocator.h"
#include "matrix_expressions.h"
#include "matrix_math_functions.h"
#include "matrix_op.h"
#include "../general_hash/random_hashing.h"
#include "matrix_mat.h"


namespace dlib
{

// ----------------------------------------------------------------------------------------

    /*!A is_complex
        This is a template that can be used to determine if a type is a specialization
        of the std::complex template class.

        For example:
            is_complex<float>::value == false              
            is_complex<std::complex<float> >::value == true   
    !*/

    template <typename T>
    struct is_complex { static const bool value = false; };

    template <typename T>
    struct is_complex<std::complex<T> >         { static const bool value = true; };
    template <typename T>
    struct is_complex<std::complex<T>& >        { static const bool value = true; };
    template <typename T>
    struct is_complex<const std::complex<T>& >  { static const bool value = true; };
    template <typename T>
    struct is_complex<const std::complex<T> >   { static const bool value = true; };

// ----------------------------------------------------------------------------------------

    template <typename EXP>
    inline bool is_row_vector (
        const matrix_exp<EXP>& m
    ) { return m.nr() == 1; }

    template <typename EXP>
    inline bool is_col_vector (
        const matrix_exp<EXP>& m
    ) { return m.nc() == 1; }

    template <typename EXP>
    inline bool is_vector (
        const matrix_exp<EXP>& m
    ) { return is_row_vector(m) || is_col_vector(m); }

// ----------------------------------------------------------------------------------------

    template <typename EXP>
    inline bool is_finite (
        const matrix_exp<EXP>& m
    ) 
    { 
        for (long r = 0; r < m.nr(); ++r)
        {
            for (long c = 0; c < m.nc(); ++c)
            {
                if (!is_finite(m(r,c)))
                    return false;
            }
        }
        return true;
    }

// ----------------------------------------------------------------------------------------

    namespace impl
    {
        template <typename T>
        const T& magnitude (const T& item) { return item; }
        template <typename T>
        T magnitude (const std::complex<T>& item) { return std::norm(item); }
    }

    template <
        typename EXP
        >
    void find_min_and_max (
        const matrix_exp<EXP>& m,
        typename EXP::type& min_val,
        typename EXP::type& max_val
    )
    {
        DLIB_ASSERT(m.size() > 0, 
            "\ttype find_min_and_max(const matrix_exp& m, min_val, max_val)"
            << "\n\tYou can't ask for the min and max of an empty matrix"
            << "\n\tm.size():     " << m.size() 
            );
        typedef typename matrix_exp<EXP>::type type;

        min_val = m(0,0);
        max_val = min_val;
        for (long r = 0; r < m.nr(); ++r)
        {
            for (long c = 0; c < m.nc(); ++c)
            {
                type temp = m(r,c);
                if (dlib::impl::magnitude(temp) > dlib::impl::magnitude(max_val))
                    max_val = temp;
                if (dlib::impl::magnitude(temp) < dlib::impl::magnitude(min_val))
                    min_val = temp;
            }
        }
    }

// ----------------------------------------------------------------------------------------

    template <
        typename EXP
        >
    point max_point (
        const matrix_exp<EXP>& m
    )
    {
        DLIB_ASSERT(m.size() > 0, 
            "\tpoint max_point(const matrix_exp& m)"
            << "\n\tm can't be empty"
            << "\n\tm.size():   " << m.size() 
            << "\n\tm.nr():     " << m.nr() 
            << "\n\tm.nc():     " << m.nc() 
            );
        typedef typename matrix_exp<EXP>::type type;

        point best_point(0,0);
        type val = m(0,0);
        for (long r = 0; r < m.nr(); ++r)
        {
            for (long c = 0; c < m.nc(); ++c)
            {
                type temp = m(r,c);
                if (dlib::impl::magnitude(temp) > dlib::impl::magnitude(val))
                {
                    val = temp;
                    best_point = point(c,r);
                }
            }
        }
        return best_point;
    }

// ----------------------------------------------------------------------------------------

    template <
        typename EXP
        >
    point min_point (
        const matrix_exp<EXP>& m
    )
    {
        DLIB_ASSERT(m.size() > 0, 
            "\tpoint min_point(const matrix_exp& m)"
            << "\n\tm can't be empty"
            << "\n\tm.size():   " << m.size() 
            << "\n\tm.nr():     " << m.nr() 
            << "\n\tm.nc():     " << m.nc() 
            );
        typedef typename matrix_exp<EXP>::type type;

        point best_point(0,0);
        type val = m(0,0);
        for (long r = 0; r < m.nr(); ++r)
        {
            for (long c = 0; c < m.nc(); ++c)
            {
                type temp = m(r,c);
                if (dlib::impl::magnitude(temp) < dlib::impl::magnitude(val))
                {
                    val = temp;
                    best_point = point(c,r);
                }
            }
        }
        return best_point;
    }

// ----------------------------------------------------------------------------------------

    template <
        typename EXP
        >
    long index_of_max (
        const matrix_exp<EXP>& m
    )
    {
        DLIB_ASSERT(m.size() > 0 && is_vector(m) == true, 
            "\tlong index_of_max(const matrix_exp& m)"
            << "\n\tm must be a row or column matrix"
            << "\n\tm.size():   " << m.size() 
            << "\n\tm.nr():     " << m.nr() 
            << "\n\tm.nc():     " << m.nc() 
            );
        typedef typename matrix_exp<EXP>::type type;

        type val = m(0);
        long best_idx = 0;
        for (long i = 1; i < m.size(); ++i)
        {
            type temp = m(i);
            if (dlib::impl::magnitude(temp) > dlib::impl::magnitude(val))
            {
                val = temp;
                best_idx = i;
            }
        }
        return best_idx;
    }

// ----------------------------------------------------------------------------------------

    template <
        typename EXP
        >
    long index_of_min (
        const matrix_exp<EXP>& m
    )
    {
        DLIB_ASSERT(m.size() > 0 && is_vector(m), 
            "\tlong index_of_min(const matrix_exp& m)"
            << "\n\tm must be a row or column matrix"
            << "\n\tm.size():   " << m.size() 
            << "\n\tm.nr():     " << m.nr() 
            << "\n\tm.nc():     " << m.nc() 
            );
        typedef typename matrix_exp<EXP>::type type;

        type val = m(0);
        long best_idx = 0;
        for (long i = 1; i < m.size(); ++i)
        {
            type temp = m(i);
            if (dlib::impl::magnitude(temp) < dlib::impl::magnitude(val))
            {
                val = temp;
                best_idx = i;
            }
        }
        return best_idx;
    }

// ----------------------------------------------------------------------------------------

    template <
        typename EXP
        >
    const typename matrix_exp<EXP>::type max (
        const matrix_exp<EXP>& m
    )
    {
        DLIB_ASSERT(m.size() > 0, 
            "\ttype max(const matrix_exp& m)"
            << "\n\tYou can't ask for the max() of an empty matrix"
            << "\n\tm.size():     " << m.size() 
            );
        typedef typename matrix_exp<EXP>::type type;

        type val = m(0,0);
        for (long r = 0; r < m.nr(); ++r)
        {
            for (long c = 0; c < m.nc(); ++c)
            {
                type temp = m(r,c);
                if (dlib::impl::magnitude(temp) > dlib::impl::magnitude(val))
                    val = temp;
            }
        }
        return val;
    }

// ----------------------------------------------------------------------------------------

    template <
        typename EXP
        >
    const typename matrix_exp<EXP>::type min (
        const matrix_exp<EXP>& m
    )
    {
        DLIB_ASSERT(m.size() > 0, 
            "\ttype min(const matrix_exp& m)"
            << "\n\tYou can't ask for the min() of an empty matrix"
            << "\n\tm.size():     " << m.size() 
            );
        typedef typename matrix_exp<EXP>::type type;

        type val = m(0,0);
        for (long r = 0; r < m.nr(); ++r)
        {
            for (long c = 0; c < m.nc(); ++c)
            {
                type temp = m(r,c);
                if (dlib::impl::magnitude(temp) < dlib::impl::magnitude(val))
                    val = temp;
            }
        }
        return val;
    }

// ----------------------------------------------------------------------------------------

    template <
        typename EXP
        >
    typename enable_if_c<std::numeric_limits<typename EXP::type>::is_integer, double>::type length (
        const matrix_exp<EXP>& m
    )
    {
        DLIB_ASSERT(is_vector(m) == true, 
            "\ttype length(const matrix_exp& m)"
            << "\n\tm must be a row or column vector"
            << "\n\tm.nr():     " << m.nr() 
            << "\n\tm.nc():     " << m.nc() 
            );
        
        return std::sqrt(static_cast<double>(sum(squared(m))));
    }
    
    template <
        typename EXP
        >
    typename disable_if_c<std::numeric_limits<typename EXP::type>::is_integer, const typename EXP::type>::type length (
        const matrix_exp<EXP>& m
    )
    {
        DLIB_ASSERT(is_vector(m) == true, 
            "\ttype length(const matrix_exp& m)"
            << "\n\tm must be a row or column vector"
            << "\n\tm.nr():     " << m.nr() 
            << "\n\tm.nc():     " << m.nc() 
            );
        return std::sqrt(sum(squared(m)));
    }
 
// ----------------------------------------------------------------------------------------

    template <
        typename EXP
        >
    const typename matrix_exp<EXP>::type length_squared (
        const matrix_exp<EXP>& m
    )
    {
        DLIB_ASSERT(is_vector(m) == true, 
            "\ttype length_squared(const matrix_exp& m)"
            << "\n\tm must be a row or column vector"
            << "\n\tm.nr():     " << m.nr() 
            << "\n\tm.nc():     " << m.nc() 
            );
        return sum(squared(m));
    }

// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------
    
    template <typename M>
    struct op_trans 
    {
        op_trans( const M& m_) : m(m_){}

        const M& m;

        const static long cost = M::cost;
        const static long NR = M::NC;
        const static long NC = M::NR;
        typedef typename M::type type;
        typedef typename M::const_ret_type const_ret_type;
        typedef typename M::mem_manager_type mem_manager_type;
        typedef typename M::layout_type layout_type;

        const_ret_type apply (long r, long c) const { return m(c,r); }

        long nr () const { return m.nc(); }
        long nc () const { return m.nr(); }

        template <typename U> bool aliases               ( const matrix_exp<U>& item) const { return m.aliases(item); }
        template <typename U> bool destructively_aliases ( const matrix_exp<U>& item) const { return m.aliases(item); }

    }; 

    template <
        typename M
        >
    const matrix_op<op_trans<M> > trans (
        const matrix_exp<M>& m
    )
    {
        typedef op_trans<M> op;
        return matrix_op<op>(op(m.ref()));
    }

// ----------------------------------------------------------------------------------------

// don't to anything at all for diagonal matrices
    template <
        typename M
        >
    const matrix_diag_exp<M>& trans (
        const matrix_diag_exp<M>& m
    )
    {
        return m;
    }

// ----------------------------------------------------------------------------------------

// I introduced this struct because it avoids an inane compiler warning from gcc
    template <typename EXP>
    struct is_not_ct_vector{ static const bool value = (EXP::NR != 1 && EXP::NC != 1); };

    template <
        typename EXP1,
        typename EXP2
        >
    typename enable_if_c<(is_not_ct_vector<EXP1>::value) || (is_not_ct_vector<EXP2>::value),
                         typename EXP1::type>::type 
    dot (
        const matrix_exp<EXP1>& m1,
        const matrix_exp<EXP2>& m2
    )
    {
        // You are getting an error on this line because you are trying to 
        // compute the dot product between two matrices that aren't both vectors (i.e. 
        // they aren't column or row matrices).
        COMPILE_TIME_ASSERT(EXP1::NR*EXP1::NC == 0 ||
                            EXP2::NR*EXP2::NC == 0);

        DLIB_ASSERT(is_vector(m1) && is_vector(m2) && m1.size() == m2.size() &&
                    m1.size() > 0, 
            "\t type dot(const matrix_exp& m1, const matrix_exp& m2)"
            << "\n\t You can only compute the dot product between non-empty vectors of equal length."
            << "\n\t is_vector(m1): " << is_vector(m1) 
            << "\n\t is_vector(m2): " << is_vector(m2) 
            << "\n\t m1.size():     " << m1.size() 
            << "\n\t m2.size():     " << m2.size() 
            );

        if (is_col_vector(m1) && is_col_vector(m2)) return (trans(m1)*m2)(0);
        if (is_col_vector(m1) && is_row_vector(m2)) return (m2*m1)(0);
        if (is_row_vector(m1) && is_col_vector(m2)) return (m1*m2)(0);

        //if (is_row_vector(m1) && is_row_vector(m2)) 
        return (m1*trans(m2))(0);
    }

    template < typename EXP1, typename EXP2 >
    typename enable_if_c<EXP1::NR == 1 && EXP2::NR == 1 && EXP1::NC != 1 && EXP2::NC != 1, typename EXP1::type>::type 
    dot ( const matrix_exp<EXP1>& m1, const matrix_exp<EXP2>& m2) 
    { 
        DLIB_ASSERT(m1.size() == m2.size(), 
            "\t type dot(const matrix_exp& m1, const matrix_exp& m2)"
            << "\n\t You can only compute the dot product between vectors of equal length"
            << "\n\t m1.size():     " << m1.size() 
            << "\n\t m2.size():     " << m2.size() 
            );
        
        return m1*trans(m2); 
    }

    template < typename EXP1, typename EXP2 >
    typename enable_if_c<EXP1::NR == 1 && EXP2::NC == 1 && EXP1::NC != 1 && EXP2::NR != 1, typename EXP1::type>::type 
    dot ( const matrix_exp<EXP1>& m1, const matrix_exp<EXP2>& m2) 
    { 
        DLIB_ASSERT(m1.size() == m2.size(), 
            "\t type dot(const matrix_exp& m1, const matrix_exp& m2)"
            << "\n\t You can only compute the dot product between vectors of equal length"
            << "\n\t m1.size():     " << m1.size() 
            << "\n\t m2.size():     " << m2.size() 
            );
        
        return m1*m2; 
    }

    template < typename EXP1, typename EXP2 >
    typename enable_if_c<EXP1::NC == 1 && EXP2::NR == 1 && EXP1::NR != 1 && EXP2::NC != 1, typename EXP1::type>::type 
    dot ( const matrix_exp<EXP1>& m1, const matrix_exp<EXP2>& m2) 
    { 
        DLIB_ASSERT(m1.size() == m2.size(), 
            "\t type dot(const matrix_exp& m1, const matrix_exp& m2)"
            << "\n\t You can only compute the dot product between vectors of equal length"
            << "\n\t m1.size():     " << m1.size() 
            << "\n\t m2.size():     " << m2.size() 
            );
        
        return m2*m1; 
    }

    template < typename EXP1, typename EXP2 >
    typename enable_if_c<EXP1::NC == 1 && EXP2::NC == 1 && EXP1::NR != 1 && EXP2::NR != 1, typename EXP1::type>::type 
    dot ( const matrix_exp<EXP1>& m1, const matrix_exp<EXP2>& m2) 
    { 
        DLIB_ASSERT(m1.size() == m2.size(), 
            "\t type dot(const matrix_exp& m1, const matrix_exp& m2)"
            << "\n\t You can only compute the dot product between vectors of equal length"
            << "\n\t m1.size():     " << m1.size() 
            << "\n\t m2.size():     " << m2.size() 
            );
        
        return trans(m1)*m2; 
    }

    template < typename EXP1, typename EXP2 >
    typename enable_if_c<(EXP1::NC*EXP1::NR == 1) || (EXP2::NC*EXP2::NR == 1), typename EXP1::type>::type 
    dot ( const matrix_exp<EXP1>& m1, const matrix_exp<EXP2>& m2) 
    { 
        DLIB_ASSERT(m1.size() == m2.size(), 
            "\t type dot(const matrix_exp& m1, const matrix_exp& m2)"
            << "\n\t You can only compute the dot product between vectors of equal length"
            << "\n\t m1.size():     " << m1.size() 
            << "\n\t m2.size():     " << m2.size() 
            );
        
        return m1(0)*m2(0);
    }

// ----------------------------------------------------------------------------------------

    template <typename M, long R, long C>
    struct op_removerc 
    {
        op_removerc( const M& m_) : m(m_){}

        const M& m;

        const static long cost = M::cost+2;
        const static long NR = (M::NR==0) ? 0 : (M::NR - 1);
        const static long NC = (M::NC==0) ? 0 : (M::NC - 1);
        typedef typename M::type type;
        typedef typename M::const_ret_type const_ret_type;
        typedef typename M::mem_manager_type mem_manager_type;
        typedef typename M::layout_type layout_type;
        const_ret_type apply (long r, long c) const
        { 
            if (r < R)
            {
                if (c < C)
                    return m(r,c); 
                else
                    return m(r,c+1); 
            }
            else
            {
                if (c < C)
                    return m(r+1,c); 
                else
                    return m(r+1,c+1); 
            }
        }

        long nr () const { return m.nr() - 1; }
        long nc () const { return m.nc() - 1; }

        template <typename U> bool aliases               ( const matrix_exp<U>& item) const { return m.aliases(item); }
        template <typename U> bool destructively_aliases ( const matrix_exp<U>& item) const { return m.aliases(item); }
    };

    template <typename M>
    struct op_removerc2 
    {
        op_removerc2( const M& m_, const long R_, const long C_) : m(m_), R(R_), C(C_){}
        const M& m;
        const long R;
        const long C;

        const static long cost = M::cost+2;
        const static long NR = (M::NR==0) ? 0 : (M::NR - 1);
        const static long NC = (M::NC==0) ? 0 : (M::NC - 1);
        typedef typename M::type type;
        typedef typename M::const_ret_type const_ret_type;
        typedef typename M::mem_manager_type mem_manager_type;
        typedef typename M::layout_type layout_type;
        const_ret_type apply (long r, long c) const
        { 
            if (r < R)
            {
                if (c < C)
                    return m(r,c); 
                else
                    return m(r,c+1); 
            }
            else
            {
                if (c < C)
                    return m(r+1,c); 
                else
                    return m(r+1,c+1); 
            }
        }

        long nr () const { return m.nr() - 1; }
        long nc () const { return m.nc() - 1; }

        template <typename U> bool aliases               ( const matrix_exp<U>& item) const { return m.aliases(item); }
        template <typename U> bool destructively_aliases ( const matrix_exp<U>& item) const { return m.aliases(item); }
    };

    template <
        long R,
        long C,
        typename EXP
        >
    const matrix_op<op_removerc<EXP,R,C> > removerc (
        const matrix_exp<EXP>& m
    )
    {
        // you can't remove a row from a matrix with only one row
        COMPILE_TIME_ASSERT((EXP::NR > R && R >= 0) || EXP::NR == 0);
        // you can't remove a column from a matrix with only one column 
        COMPILE_TIME_ASSERT((EXP::NC > C && C >= 0) || EXP::NR == 0);
        DLIB_ASSERT(m.nr() > R && R >= 0 && m.nc() > C && C >= 0, 
            "\tconst matrix_exp removerc<R,C>(const matrix_exp& m)"
            << "\n\tYou can't remove a row/column from a matrix if it doesn't have that row/column"
            << "\n\tm.nr(): " << m.nr()
            << "\n\tm.nc(): " << m.nc() 
            << "\n\tR:      " << R 
            << "\n\tC:      " << C 
            );
        typedef op_removerc<EXP,R,C> op;
        return matrix_op<op>(op(m.ref()));
    }

    template <
        typename EXP
        >
    const matrix_op<op_removerc2<EXP> >  removerc (
        const matrix_exp<EXP>& m,
        long R,
        long C
    )
    {
        DLIB_ASSERT(m.nr() > R && R >= 0 && m.nc() > C && C >= 0, 
            "\tconst matrix_exp removerc(const matrix_exp& m,R,C)"
            << "\n\tYou can't remove a row/column from a matrix if it doesn't have that row/column"
            << "\n\tm.nr(): " << m.nr()
            << "\n\tm.nc(): " << m.nc() 
            << "\n\tR:      " << R 
            << "\n\tC:      " << C 
            );
        typedef op_removerc2<EXP> op;
        return matrix_op<op>(op(m.ref(),R,C));
    }

// ----------------------------------------------------------------------------------------

    template <typename M, long C>
    struct op_remove_col 
    {
        op_remove_col( const M& m_) : m(m_){}
        const M& m;

        const static long cost = M::cost+2;
        const static long NR = M::NR;
        const static long NC = (M::NC==0) ? 0 : (M::NC - 1);
        typedef typename M::type type;
        typedef typename M::const_ret_type const_ret_type;
        typedef typename M::mem_manager_type mem_manager_type;
        typedef typename M::layout_type layout_type;
        const_ret_type apply ( long r, long c) const
        { 
            if (c < C)
            {
                return m(r,c); 
            }
            else
            {
                return m(r,c+1); 
            }
        }

        long nr () const { return m.nr(); }
        long nc () const { return m.nc() - 1; }

        template <typename U> bool aliases               ( const matrix_exp<U>& item) const { return m.aliases(item); }
        template <typename U> bool destructively_aliases ( const matrix_exp<U>& item) const { return m.aliases(item); }
    };

    template <typename M>
    struct op_remove_col2 
    {
        op_remove_col2( const M& m_,  const long C_) : m(m_), C(C_){}
        const M& m;
        const long C;

        const static long cost = M::cost+2;
        const static long NR = M::NR;
        const static long NC = (M::NC==0) ? 0 : (M::NC - 1);
        typedef typename M::type type;
        typedef typename M::const_ret_type const_ret_type;
        typedef typename M::mem_manager_type mem_manager_type;
        typedef typename M::layout_type layout_type;
        const_ret_type apply ( long r, long c) const
        { 
            if (c < C)
            {
                return m(r,c); 
            }
            else
            {
                return m(r,c+1); 
            }
        }

        long nr () const { return m.nr(); }
        long nc () const { return m.nc() - 1; }

        template <typename U> bool aliases               ( const matrix_exp<U>& item) const { return m.aliases(item); }
        template <typename U> bool destructively_aliases ( const matrix_exp<U>& item) const { return m.aliases(item); }
    };

    template <
        long C,
        typename EXP
        >
    const matrix_op<op_remove_col<EXP, C> > remove_col (
        const matrix_exp<EXP>& m
    )
    {
        // You can't remove the given column from the matrix because the matrix doesn't
        // have a column with that index.
        COMPILE_TIME_ASSERT((EXP::NC > C && C >= 0) || EXP::NC == 0);
        DLIB_ASSERT(m.nc() > C && C >= 0 , 
            "\tconst matrix_exp remove_col<C>(const matrix_exp& m)"
            << "\n\tYou can't remove a col from a matrix if it doesn't have it"
            << "\n\tm.nr(): " << m.nr()
            << "\n\tm.nc(): " << m.nc() 
            << "\n\tC:      " << C 
            );
        typedef op_remove_col<EXP,C> op;
        return matrix_op<op>(op(m.ref()));
    }

    template <
        typename EXP
        >
    const matrix_op<op_remove_col2<EXP> > remove_col (
        const matrix_exp<EXP>& m,
        long C
    )
    {
        DLIB_ASSERT(m.nc() > C && C >= 0 , 
            "\tconst matrix_exp remove_col(const matrix_exp& m,C)"
            << "\n\tYou can't remove a col from a matrix if it doesn't have it"
            << "\n\tm.nr(): " << m.nr()
            << "\n\tm.nc(): " << m.nc() 
            << "\n\tC:      " << C 
            );
        typedef op_remove_col2<EXP> op;
        return matrix_op<op>(op(m.ref(),C));
    }

// ----------------------------------------------------------------------------------------

    template <typename M, long R>
    struct op_remove_row 
    {
        op_remove_row( const M& m_) : m(m_){}
        const M& m;

        const static long cost = M::cost+2;
        const static long NR = (M::NR==0) ? 0 : (M::NR - 1);
        const static long NC = M::NC;
        typedef typename M::type type;
        typedef typename M::const_ret_type const_ret_type;
        typedef typename M::mem_manager_type mem_manager_type;
        typedef typename M::layout_type layout_type;
        const_ret_type apply ( long r, long c) const
        { 
            if (r < R)
            {
                return m(r,c); 
            }
            else
            {
                return m(r+1,c); 
            }
        }

        long nr () const { return m.nr() - 1; }
        long nc () const { return m.nc(); }

        template <typename U> bool aliases               ( const matrix_exp<U>& item) const { return m.aliases(item); }
        template <typename U> bool destructively_aliases ( const matrix_exp<U>& item) const { return m.aliases(item); }
    };

    template <typename M>
    struct op_remove_row2 
    {
        op_remove_row2( const M& m_,  const long R_) : m(m_), R(R_){}
        const M& m;
        const long R;

        const static long cost = M::cost+2;
        const static long NR = (M::NR==0) ? 0 : (M::NR - 1);
        const static long NC = M::NC;
        typedef typename M::type type;
        typedef typename M::const_ret_type const_ret_type;
        typedef typename M::mem_manager_type mem_manager_type;
        typedef typename M::layout_type layout_type;
        const_ret_type apply ( long r, long c) const
        { 
            if (r < R)
            {
                return m(r,c); 
            }
            else
            {
                return m(r+1,c); 
            }
        }

        long nr () const { return m.nr() - 1; }
        long nc () const { return m.nc(); }

        template <typename U> bool aliases               ( const matrix_exp<U>& item) const { return m.aliases(item); }
        template <typename U> bool destructively_aliases ( const matrix_exp<U>& item) const { return m.aliases(item); }
    };

    template <
        long R,
        typename EXP
        >
    const matrix_op<op_remove_row<EXP,R> > remove_row (
        const matrix_exp<EXP>& m
    )
    {
        // You can't remove the given row from the matrix because the matrix doesn't
        // have a row with that index.
        COMPILE_TIME_ASSERT((EXP::NR > R && R >= 0) || EXP::NR == 0);
        DLIB_ASSERT(m.nr() > R && R >= 0, 
            "\tconst matrix_exp remove_row<R>(const matrix_exp& m)"
            << "\n\tYou can't remove a row from a matrix if it doesn't have it"
            << "\n\tm.nr(): " << m.nr()
            << "\n\tm.nc(): " << m.nc() 
            << "\n\tR:      " << R 
            );
        typedef op_remove_row<EXP,R> op;
        return matrix_op<op>(op(m.ref()));
    }

    template <
        typename EXP
        >
    const matrix_op<op_remove_row2<EXP> > remove_row (
        const matrix_exp<EXP>& m,
        long R
    )
    {
        DLIB_ASSERT(m.nr() > R && R >= 0, 
            "\tconst matrix_exp remove_row(const matrix_exp& m, long R)"
            << "\n\tYou can't remove a row from a matrix if it doesn't have it"
            << "\n\tm.nr(): " << m.nr()
            << "\n\tm.nc(): " << m.nc() 
            << "\n\tR:      " << R 
            );
        typedef op_remove_row2<EXP> op;
        return matrix_op<op>(op(m.ref(),R));
    }

// ----------------------------------------------------------------------------------------

    template <typename M>
    struct op_diagm 
    {
        op_diagm( const M& m_) : m(m_){}
        const M& m;

        const static long cost = M::cost+2;
        const static long N = M::NC*M::NR;
        const static long NR = N;
        const static long NC = N;
        typedef typename M::type type;
        typedef const typename M::type const_ret_type;
        typedef typename M::mem_manager_type mem_manager_type;
        typedef typename M::layout_type layout_type;
        const_ret_type apply ( long r, long c) const
        { 
            if (r==c)
                return m(r); 
            else
                return 0;
        }

        long nr () const { return (m.nr()>m.nc())? m.nr():m.nc(); }
        long nc () const { return (m.nr()>m.nc())? m.nr():m.nc(); }

        template <typename U> bool aliases               ( const matrix_exp<U>& item) const { return m.aliases(item); }
        template <typename U> bool destructively_aliases ( const matrix_exp<U>& item) const { return m.aliases(item); }
    };

    template <
        typename EXP
        >
    const matrix_diag_op<op_diagm<EXP> > diagm (
        const matrix_exp<EXP>& m
    )
    {
        // You can only make a diagonal matrix out of a row or column vector
        COMPILE_TIME_ASSERT(EXP::NR == 0 || EXP::NR == 1 || EXP::NC == 1 || EXP::NC == 0);
        DLIB_ASSERT(is_vector(m), 
            "\tconst matrix_exp diagm(const matrix_exp& m)"
            << "\n\tYou can only apply diagm() to a row or column matrix"
            << "\n\tm.nr(): " << m.nr()
            << "\n\tm.nc(): " << m.nc() 
            );
        typedef op_diagm<EXP> op;
        return matrix_diag_op<op>(op(m.ref()));
    }

// ----------------------------------------------------------------------------------------

    template <typename M1, typename M2>
    struct op_diagm_mult : basic_op_mm<M1,M2>
    {
        op_diagm_mult( const M1& m1_, const M2& m2_) : basic_op_mm<M1,M2>(m1_,m2_){}

        typedef typename M1::type type;
        typedef const type const_ret_type;
        const static long cost = M1::cost + M2::cost + 1;

        const_ret_type apply ( long r, long c) const
        { 
            if (r == c)
                return this->m1(r,c)*this->m2(r,c); 
            else
                return 0;
        }
    };

    template <
        typename EXP1,
        typename EXP2
        >
    inline const matrix_diag_op<op_diagm_mult<EXP1,EXP2> > operator* (
        const matrix_diag_exp<EXP1>& a,
        const matrix_diag_exp<EXP2>& b 
    )
    {
        COMPILE_TIME_ASSERT((is_same_type<typename EXP1::type, typename EXP2::type>::value));
        COMPILE_TIME_ASSERT(EXP1::NR == EXP2::NR || EXP1::NR == 0 || EXP2::NR == 0);
        COMPILE_TIME_ASSERT(EXP1::NC == EXP2::NC || EXP1::NC == 0 || EXP2::NC == 0);
        DLIB_ASSERT(a.nr() == b.nr() &&
                    a.nc() == b.nc(), 
            "\tconst matrix_exp operator(const matrix_diag_exp& a, const matrix_diag_exp& b)"
            << "\n\tYou can only multiply diagonal matrices together if they are the same size"
            << "\n\ta.nr(): " << a.nr()
            << "\n\ta.nc(): " << a.nc() 
            << "\n\tb.nr(): " << b.nr()
            << "\n\tb.nc(): " << b.nc() 
            );
        typedef op_diagm_mult<EXP1,EXP2> op;
        return matrix_diag_op<op>(op(a.ref(),b.ref()));
    }

// ----------------------------------------------------------------------------------------

    template <typename M>
    struct op_diag 
    {
        op_diag( const M& m_) : m(m_){}
        const M& m;

        const static long cost = M::cost;
        const static long NR = tmin<M::NR,M::NC>::value;
        const static long NC = 1;
        typedef typename M::type type;
        typedef typename M::const_ret_type const_ret_type;
        typedef typename M::mem_manager_type mem_manager_type;
        typedef typename M::layout_type layout_type;
        const_ret_type apply ( long r, long ) const { return m(r,r); }

        long nr () const { return std::min(m.nc(),m.nr()); }
        long nc () const { return 1; }

        template <typename U> bool aliases               ( const matrix_exp<U>& item) const { return m.aliases(item); }
        template <typename U> bool destructively_aliases ( const matrix_exp<U>& item) const { return m.aliases(item); }
    };

    template <
        typename EXP
        >
    const matrix_op<op_diag<EXP> > diag (
        const matrix_exp<EXP>& m
    )
    {
        typedef op_diag<EXP> op;
        return matrix_op<op>(op(m.ref()));
    }

    template <typename EXP>
    struct diag_exp
    {
        typedef matrix_op<op_diag<EXP> > type;
    };

// ----------------------------------------------------------------------------------------

    template <typename M, typename target_type>
    struct op_cast 
    {
        op_cast( const M& m_) : m(m_){}
        const M& m;

        const static long cost = M::cost+2;
        const static long NR = M::NR;
        const static long NC = M::NC;
        typedef target_type type;
        typedef const target_type const_ret_type;
        typedef typename M::mem_manager_type mem_manager_type;
        typedef typename M::layout_type layout_type;
        const_ret_type apply ( long r, long c) const { return static_cast<target_type>(m(r,c)); }

        long nr () const { return m.nr(); }
        long nc () const { return m.nc(); }

        template <typename U> bool aliases               ( const matrix_exp<U>& item) const { return m.aliases(item); }
        template <typename U> bool destructively_aliases ( const matrix_exp<U>& item) const { return m.destructively_aliases(item); }
    };

    template <
        typename target_type,
        typename EXP
        >
    const matrix_op<op_cast<EXP, target_type> > matrix_cast (
        const matrix_exp<EXP>& m
    )
    {
        typedef op_cast<EXP, target_type> op;
        return matrix_op<op>(op(m.ref()));
    }

// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------

    namespace impl
    {
        template <typename type, typename S>
        inline type lessthan(const type& val, const S& s)
        {
            if (val < s)
                return 1;
            else
                return 0;
        }
        
    }
    DLIB_DEFINE_OP_MS(op_lessthan, impl::lessthan, 1);

    template <
        typename EXP,
        typename S
        >
    const typename enable_if<is_built_in_scalar_type<S>, matrix_op<op_lessthan<EXP,S> > >::type operator< (
        const matrix_exp<EXP>& m,
        const S& s
    )
    {
        // you can only use this relational operator with the built in scalar types like
        // long, float, etc.
        COMPILE_TIME_ASSERT(is_built_in_scalar_type<typename EXP::type>::value);

        typedef op_lessthan<EXP,S> op;
        return matrix_op<op>(op(m.ref(),s));
    }

    template <
        typename EXP,
        typename S
        >
    const typename enable_if<is_built_in_scalar_type<S>, matrix_op<op_lessthan<EXP,S> > >::type operator> (
        const S& s,
        const matrix_exp<EXP>& m
    )
    {
        // you can only use this relational operator with the built in scalar types like
        // long, float, etc.
        COMPILE_TIME_ASSERT(is_built_in_scalar_type<typename EXP::type>::value);

        typedef op_lessthan<EXP,S> op;
        return matrix_op<op>(op(m.ref(),s));
    }

// ----------------------------------------------------------------------------------------

    namespace impl
    {
        template <typename type, typename S>
        inline type lessthan_eq(const type& val, const S& s)
        {
            if (val <= s)
                return 1;
            else
                return 0;
        }
        
    }
    DLIB_DEFINE_OP_MS(op_lessthan_eq, impl::lessthan_eq, 1);

    template <
        typename EXP,
        typename S
        >
    const typename enable_if<is_built_in_scalar_type<S>, matrix_op<op_lessthan_eq<EXP,S> > >::type operator<= (
        const matrix_exp<EXP>& m,
        const S& s
    )
    {
        // you can only use this relational operator with the built in scalar types like
        // long, float, etc.
        COMPILE_TIME_ASSERT(is_built_in_scalar_type<typename EXP::type>::value);

        typedef op_lessthan_eq<EXP,S> op;
        return matrix_op<op>(op(m.ref(),s));
    }

    template <
        typename EXP,
        typename S
        >
    const typename enable_if<is_built_in_scalar_type<S>, matrix_op<op_lessthan_eq<EXP,S> > >::type operator>= (
        const S& s,
        const matrix_exp<EXP>& m
    )
    {
        // you can only use this relational operator with the built in scalar types like
        // long, float, etc.
        COMPILE_TIME_ASSERT(is_built_in_scalar_type<typename EXP::type>::value);

        typedef op_lessthan_eq<EXP,S> op;
        return matrix_op<op>(op(m.ref(),s));
    }

// ----------------------------------------------------------------------------------------

    namespace impl
    {
        template <typename type, typename S>
        inline type greaterthan(const type& val, const S& s)
        {
            if (val > s)
                return 1;
            else
                return 0;
        }
        
    }
    DLIB_DEFINE_OP_MS(op_greaterthan, impl::greaterthan, 1);

    template <
        typename EXP,
        typename S
        >
    const typename enable_if<is_built_in_scalar_type<S>, matrix_op<op_greaterthan<EXP,S> > >::type operator> (
        const matrix_exp<EXP>& m,
        const S& s
    )
    {
        // you can only use this relational operator with the built in scalar types like
        // long, float, etc.
        COMPILE_TIME_ASSERT(is_built_in_scalar_type<typename EXP::type>::value);

        typedef op_greaterthan<EXP,S> op;
        return matrix_op<op>(op(m.ref(),s));
    }

    template <
        typename EXP,
        typename S
        >
    const typename enable_if<is_built_in_scalar_type<S>, matrix_op<op_greaterthan<EXP,S> > >::type operator< (
        const S& s,
        const matrix_exp<EXP>& m
    )
    {
        // you can only use this relational operator with the built in scalar types like
        // long, float, etc.
        COMPILE_TIME_ASSERT(is_built_in_scalar_type<typename EXP::type>::value);

        typedef op_greaterthan<EXP,S> op;
        return matrix_op<op>(op(m.ref(),s));
    }

// ----------------------------------------------------------------------------------------

    namespace impl
    {
        template <typename type, typename S>
        inline type greaterthan_eq(const type& val, const S& s)
        {
            if (val >= s)
                return 1;
            else
                return 0;
        }
        
    }
    DLIB_DEFINE_OP_MS(op_greaterthan_eq, impl::greaterthan_eq, 1);

    template <
        typename EXP,
        typename S
        >
    const typename enable_if<is_built_in_scalar_type<S>, matrix_op<op_greaterthan_eq<EXP,S> > >::type operator>= (
        const matrix_exp<EXP>& m,
        const S& s
    )
    {
        // you can only use this relational operator with the built in scalar types like
        // long, float, etc.
        COMPILE_TIME_ASSERT(is_built_in_scalar_type<typename EXP::type>::value);

        typedef op_greaterthan_eq<EXP,S> op;
        return matrix_op<op>(op(m.ref(),s));
    }

    template <
        typename EXP,
        typename S
        >
    const typename enable_if<is_built_in_scalar_type<S>, matrix_op<op_greaterthan_eq<EXP,S> > >::type operator<= (
        const S& s,
        const matrix_exp<EXP>& m
    )
    {
        // you can only use this relational operator with the built in scalar types like
        // long, float, etc.
        COMPILE_TIME_ASSERT(is_built_in_scalar_type<typename EXP::type>::value);

        typedef op_greaterthan_eq<EXP,S> op;
        return matrix_op<op>(op(m.ref(),s));
    }

// ----------------------------------------------------------------------------------------

    namespace impl
    {
        template <typename type, typename S>
        inline type equal_to(const type& val, const S& s)
        {
            if (val == s)
                return 1;
            else
                return 0;
        }
        
    }
    DLIB_DEFINE_OP_MS(op_equal_to, impl::equal_to, 1);

    template <
        typename EXP,
        typename S
        >
    const typename enable_if<is_built_in_scalar_type<S>, matrix_op<op_equal_to<EXP,S> > >::type operator== (
        const matrix_exp<EXP>& m,
        const S& s
    )
    {
        // you can only use this relational operator with the built in scalar types like
        // long, float, etc.
        COMPILE_TIME_ASSERT( is_built_in_scalar_type<typename EXP::type>::value);

        typedef op_equal_to<EXP,S> op;
        return matrix_op<op>(op(m.ref(),s));
    }

    template <
        typename EXP,
        typename S
        >
    const typename enable_if<is_built_in_scalar_type<S>, matrix_op<op_equal_to<EXP,S> > >::type operator== (
        const S& s,
        const matrix_exp<EXP>& m
    )
    {
        // you can only use this relational operator with the built in scalar types like
        // long, float, etc.
        COMPILE_TIME_ASSERT( is_built_in_scalar_type<typename EXP::type>::value);

        typedef op_equal_to<EXP,S> op;
        return matrix_op<op>(op(m.ref(),s));
    }

// ----------------------------------------------------------------------------------------

    namespace impl
    {
        template <typename type, typename S>
        inline type not_equal_to(const type& val, const S& s)
        {
            if (val != s)
                return 1;
            else
                return 0;
        }
        
    }
    DLIB_DEFINE_OP_MS(op_not_equal_to, impl::not_equal_to, 1);


    template <
        typename EXP,
        typename S
        >
    const typename enable_if<is_built_in_scalar_type<S>, matrix_op<op_not_equal_to<EXP,S> > >::type operator!= (
        const matrix_exp<EXP>& m,
        const S& s
    )
    {
        // you can only use this relational operator with the built in scalar types like
        // long, float, etc.
        COMPILE_TIME_ASSERT(is_built_in_scalar_type<typename EXP::type>::value);

        typedef op_not_equal_to<EXP,S> op;
        return matrix_op<op>(op(m.ref(),s));
    }

    template <
        typename EXP,
        typename S
        >
    const typename enable_if<is_built_in_scalar_type<S>, matrix_op<op_not_equal_to<EXP,S> > >::type operator!= (
        const S& s,
        const matrix_exp<EXP>& m
    )
    {
        // you can only use this relational operator with the built in scalar types like
        // long, float, etc.
        COMPILE_TIME_ASSERT(is_built_in_scalar_type<typename EXP::type>::value);

        typedef op_not_equal_to<EXP,S> op;
        return matrix_op<op>(op(m.ref(),s));
    }

// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------

    template <
        typename T,
        long NR,
        long NC,
        typename MM,
        typename U,
        typename L
        >
    typename disable_if<is_matrix<U>,void>::type set_all_elements (
        matrix<T,NR,NC,MM,L>& m,
        const U& value
    )
    {
        // The value you are trying to assign to each element of the m matrix
        // doesn't have the appropriate type.
        COMPILE_TIME_ASSERT(is_matrix<T>::value == is_matrix<U>::value);

        for (long r = 0; r < m.nr(); ++r)
        {
            for (long c = 0; c < m.nc(); ++c)
            {
                m(r,c) = static_cast<T>(value);
            }
        }
    }

// ----------------------------------------------------------------------------------------

    template <
        typename T,
        long NR,
        long NC,
        typename MM,
        typename U,
        typename L
        >
    typename enable_if<is_matrix<U>,void>::type set_all_elements (
        matrix<T,NR,NC,MM,L>& m,
        const U& value
    )
    {
        for (long r = 0; r < m.nr(); ++r)
        {
            for (long c = 0; c < m.nc(); ++c)
            {
                m(r,c) = value;
            }
        }
    }

// ----------------------------------------------------------------------------------------

    template <
        typename EXP
        >
    inline const typename matrix_exp<EXP>::matrix_type tmp (
        const matrix_exp<EXP>& m
    )
    {
        return typename matrix_exp<EXP>::matrix_type (m);
    }

// ----------------------------------------------------------------------------------------

    template <
        typename EXP
        >
    const typename lazy_disable_if<is_matrix<typename EXP::type>, EXP>::type sum (
        const matrix_exp<EXP>& m
    )
    {
        typedef typename matrix_exp<EXP>::type type;

        type val = 0;
        for (long r = 0; r < m.nr(); ++r)
        {
            for (long c = 0; c < m.nc(); ++c)
            {
                val += m(r,c);
            }
        }
        return val;
    }

    template <
        typename EXP
        >
    const typename lazy_enable_if<is_matrix<typename EXP::type>, EXP>::type sum (
        const matrix_exp<EXP>& m
    )
    {
        typedef typename matrix_exp<EXP>::type type;

        type val;
        if (m.size() > 0)
            val.set_size(m(0,0).nr(),m(0,0).nc()); 
        set_all_elements(val,0);

        for (long r = 0; r < m.nr(); ++r)
        {
            for (long c = 0; c < m.nc(); ++c)
            {
                val += m(r,c);
            }
        }
        return val;
    }

// ----------------------------------------------------------------------------------------

    template <typename M>
    struct op_sumr 
    {
        op_sumr(const M& m_) : m(m_) {}
        const M& m;

        const static long cost = M::cost+10;
        const static long NR = 1;
        const static long NC = M::NC;
        typedef typename M::type type;
        typedef const typename M::type const_ret_type;
        typedef typename M::mem_manager_type mem_manager_type;
        typedef typename M::layout_type layout_type;
        const_ret_type apply ( long , long c) const
        { 
            type temp = m(0,c);
            for (long r = 1; r < m.nr(); ++r)
                temp += m(r,c);
            return temp; 
        }

        long nr () const { return 1; }
        long nc () const { return m.nc(); }

        template <typename U> bool aliases               ( const matrix_exp<U>& item) const { return m.aliases(item); }
        template <typename U> bool destructively_aliases ( const matrix_exp<U>& item) const { return m.aliases(item); }
    }; 

    template <
        typename EXP
        >
    const matrix_op<op_sumr<EXP> > sum_rows (
        const matrix_exp<EXP>& m
    )
    {
        DLIB_ASSERT(m.size() > 0 , 
                    "\tconst matrix_exp sum_rows(m)"
                    << "\n\t The matrix can't be empty"
                    << "\n\t m.size(): " << m.size() 
        );
        typedef op_sumr<EXP> op;
        return matrix_op<op>(op(m.ref()));
    }

// ----------------------------------------------------------------------------------------

    template <typename M>
    struct op_sumc 
    {
        op_sumc(const M& m_) : m(m_) {}
        const M& m;

        const static long cost = M::cost + 10;
        const static long NR = M::NR;
        const static long NC = 1;
        typedef typename M::type type;
        typedef const typename M::type const_ret_type;
        typedef typename M::mem_manager_type mem_manager_type;
        typedef typename M::layout_type layout_type;
        const_ret_type apply ( long r, long ) const
        { 
            type temp = m(r,0);
            for (long c = 1; c < m.nc(); ++c)
                temp += m(r,c);
            return temp; 
        }

        long nr () const { return m.nr(); }
        long nc () const { return 1; }

        template <typename U> bool aliases               ( const matrix_exp<U>& item) const { return m.aliases(item); }
        template <typename U> bool destructively_aliases ( const matrix_exp<U>& item) const { return m.aliases(item); }
    }; 

    template <
        typename EXP
        >
    const matrix_op<op_sumc<EXP> > sum_cols (
        const matrix_exp<EXP>& m
    )
    {
        DLIB_ASSERT(m.size() > 0 , 
                    "\tconst matrix_exp sum_cols(m)"
                    << "\n\t The matrix can't be empty"
                    << "\n\t m.size(): " << m.size() 
        );
        typedef op_sumc<EXP> op;
        return matrix_op<op>(op(m.ref()));
    }

// ----------------------------------------------------------------------------------------

    template <
        typename EXP
        >
    inline const typename disable_if<is_complex<typename EXP::type>, typename matrix_exp<EXP>::type>::type mean (
        const matrix_exp<EXP>& m
    )
    {
        return sum(m)/(m.nr()*m.nc());
    }

// ----------------------------------------------------------------------------------------

    template <
        typename EXP
        >
    inline const typename enable_if<is_complex<typename EXP::type>, typename matrix_exp<EXP>::type>::type mean (
        const matrix_exp<EXP>& m
    )
    {
        typedef typename EXP::type::value_type type;
        return sum(m)/(type)(m.nr()*m.nc());
    }

// ----------------------------------------------------------------------------------------

    template <
        typename EXP
        >
    const typename matrix_exp<EXP>::type variance (
        const matrix_exp<EXP>& m
    )
    {
        using std::pow;
        using dlib::pow;
        const typename matrix_exp<EXP>::type avg = mean(m);

        typedef typename matrix_exp<EXP>::type type;

        type val;
        val = 0;
        for (long r = 0; r < m.nr(); ++r)
        {
            for (long c = 0; c < m.nc(); ++c)
            {
                val += pow(m(r,c) - avg,2);
            }
        }

        if (m.nr() * m.nc() <= 1)
        {
            return val;
        }
        else
        {
            // Note, for some reason, in gcc 4.1 performing this division using a
            // double instead of a long value avoids a segmentation fault.  That is, 
            // using 1.0 instead of 1 does the trick.
            return val/(m.nr()*m.nc() - 1.0);
        }
    }

// ----------------------------------------------------------------------------------------

    template <
        typename EXP
        >
    const typename matrix_exp<EXP>::type stddev (
        const matrix_exp<EXP>& m
    )
    {
        using std::sqrt;
        using dlib::sqrt;
        return sqrt(variance(m));
    }

// ----------------------------------------------------------------------------------------

// this is a workaround for a bug in visual studio 7.1
    template <typename EXP>
    struct visual_studio_sucks_cov_helper
    {
        typedef typename EXP::type inner_type;
        typedef matrix<typename inner_type::type, inner_type::NR, inner_type::NR, typename EXP::mem_manager_type> type;
    };

    template <
        typename EXP
        >
    const typename visual_studio_sucks_cov_helper<EXP>::type covariance (
        const matrix_exp<EXP>& m
    )
    {
        // perform static checks to make sure m is a column vector 
        COMPILE_TIME_ASSERT(EXP::NR == 0 || EXP::NR > 1);
        COMPILE_TIME_ASSERT(EXP::NC == 1 || EXP::NC == 0);

        // perform static checks to make sure the matrices contained in m are column vectors
        COMPILE_TIME_ASSERT(EXP::type::NC == 1 || EXP::type::NC == 0 );

        DLIB_ASSERT(m.size() > 1 && is_col_vector(m), 
            "\tconst matrix covariance(const matrix_exp& m)"
            << "\n\tYou can only apply covariance() to a column matrix"
            << "\n\tm.nr(): " << m.nr()
            << "\n\tm.nc(): " << m.nc() 
            );
#ifdef ENABLE_ASSERTS
        for (long i = 0; i < m.nr(); ++i)
        {
            DLIB_ASSERT(m(0).size() == m(i).size() && m(i).size() > 0 && is_col_vector(m(i)), 
                   "\tconst matrix covariance(const matrix_exp& m)"
                   << "\n\tYou can only apply covariance() to a column matrix of column matrices"
                   << "\n\tm(0).size(): " << m(0).size()
                   << "\n\tm(i).size(): " << m(i).size() 
                   << "\n\tis_col_vector(m(i)): " << (is_col_vector(m(i)) ? "true" : "false")
                   << "\n\ti:         " << i 
                );
        }
#endif

        // now perform the actual calculation of the covariance matrix.
        typename visual_studio_sucks_cov_helper<EXP>::type cov(m(0).nr(),m(0).nr());
        set_all_elements(cov,0);

        const typename EXP::type avg = mean(m);

        for (long r = 0; r < m.nr(); ++r)
        {
            cov += (m(r) - avg)*trans(m(r) - avg);
        }

        cov *= 1.0 / (m.nr() - 1.0);
        return cov;
    }

// ----------------------------------------------------------------------------------------

    template <
        typename EXP
        >
    const typename matrix_exp<EXP>::type prod (
        const matrix_exp<EXP>& m
    )
    {
        typedef typename matrix_exp<EXP>::type type;

        type val = 1;
        for (long r = 0; r < m.nr(); ++r)
        {
            for (long c = 0; c < m.nc(); ++c)
            {
                val *= m(r,c);
            }
        }
        return val;
    }

// ----------------------------------------------------------------------------------------

    template <
        typename T 
        >
    struct op_uniform_matrix_3 : does_not_alias 
    {
        op_uniform_matrix_3(const long& rows_, const long& cols_, const T& val_ ) : 
            rows(rows_), cols(cols_), val(val_)  {}

        const long rows;
        const long cols;
        const T val;

        const static long cost = 1;
        const static long NR = 0;
        const static long NC = 0;
        typedef default_memory_manager mem_manager_type;
        typedef row_major_layout layout_type;
        typedef T type;
        typedef const T& const_ret_type;
        const_ret_type apply (long, long ) const { return val; }

        long nr() const { return rows; }
        long nc() const { return cols; }
    };

    template <
        typename T
        >
    const matrix_op<op_uniform_matrix_3<T> > uniform_matrix (
        long nr,
        long nc,
        const T& val
    )
    {
        DLIB_ASSERT(nr >= 0 && nc >= 0, 
            "\tconst matrix_exp uniform_matrix<T>(nr, nc, val)"
            << "\n\tnr and nc have to be bigger than 0"
            << "\n\tnr: " << nr
            << "\n\tnc: " << nc
            );
        typedef op_uniform_matrix_3<T> op;
        return matrix_op<op>(op(nr, nc, val));
    }

// ----------------------------------------------------------------------------------------

    template <
        typename T
        >
    const matrix_op<op_uniform_matrix_3<T> > zeros_matrix (
        long nr,
        long nc
    )
    {
        DLIB_ASSERT(nr >= 0 && nc >= 0, 
            "\tconst matrix_exp zeros_matrix<T>(nr, nc)"
            << "\n\tnr and nc have to be >= 0"
            << "\n\tnr: " << nr
            << "\n\tnc: " << nc
            );
        typedef op_uniform_matrix_3<T> op;
        return matrix_op<op>(op(nr, nc, 0));
    }

// ----------------------------------------------------------------------------------------

    template <
        typename EXP
        >
    const matrix_op<op_uniform_matrix_3<typename EXP::type> > zeros_matrix (
        const matrix_exp<EXP>& mat
    )
    {
        DLIB_ASSERT(mat.nr() >= 0 && mat.nc() >= 0, 
            "\tconst matrix_exp zeros_matrix(mat)"
            << "\n\t nr and nc have to be >= 0"
            << "\n\t mat.nr(): " << mat.nr()
            << "\n\t mat.nc(): " << mat.nc()
            );
        typedef typename EXP::type T;
        typedef op_uniform_matrix_3<T> op;
        return matrix_op<op>(op(mat.nr(), mat.nc(), 0));
    }

// ----------------------------------------------------------------------------------------

    template <
        typename T
        >
    const matrix_op<op_uniform_matrix_3<T> > ones_matrix (
        long nr,
        long nc
    )
    {
        DLIB_ASSERT(nr >= 0 && nc >= 0, 
            "\tconst matrix_exp ones_matrix<T>(nr, nc)"
            << "\n\tnr and nc have to be >= 0"
            << "\n\tnr: " << nr
            << "\n\tnc: " << nc
            );
        typedef op_uniform_matrix_3<T> op;
        return matrix_op<op>(op(nr, nc, 1));
    }

// ----------------------------------------------------------------------------------------

    template <
        typename EXP
        >
    const matrix_op<op_uniform_matrix_3<typename EXP::type> > ones_matrix (
        const matrix_exp<EXP>& mat
    )
    {
        DLIB_ASSERT(mat.nr() >= 0 && mat.nc() >= 0, 
            "\tconst matrix_exp ones_matrix(mat)"
            << "\n\t nr and nc have to be >= 0"
            << "\n\t mat.nr(): " << mat.nr()
            << "\n\t mat.nc(): " << mat.nc()
            );
        typedef typename EXP::type T;
        typedef op_uniform_matrix_3<T> op;
        return matrix_op<op>(op(mat.nr(), mat.nc(), 1));
    }

// ----------------------------------------------------------------------------------------

    template <
        typename T, 
        long NR_, 
        long NC_ 
        >
    struct op_uniform_matrix_2 : does_not_alias 
    {
        op_uniform_matrix_2( const T& val_ ) : val(val_) {}
        const T val;

        const static long cost = 1;
        const static long NR = NR_;
        const static long NC = NC_;
        typedef default_memory_manager mem_manager_type;
        typedef row_major_layout layout_type;
        typedef T type;
        typedef const T& const_ret_type;

        const_ret_type apply (long , long ) const { return val; }

        long nr() const { return NR; }
        long nc() const { return NC; }
    };

    template <
        typename T,
        long NR, 
        long NC
        >
    const matrix_op<op_uniform_matrix_2<T,NR,NC> > uniform_matrix (
        const T& val
    )
    {
        COMPILE_TIME_ASSERT(NR > 0 && NC > 0);

        typedef op_uniform_matrix_2<T,NR,NC> op;
        return matrix_op<op>(op(val));
    }

// ----------------------------------------------------------------------------------------

    template <
        typename T, 
        long NR_, 
        long NC_, 
        T val
        >
    struct op_uniform_matrix : does_not_alias 
    {
        const static long cost = 1;
        const static long NR = NR_;
        const static long NC = NC_;
        typedef default_memory_manager mem_manager_type;
        typedef row_major_layout layout_type;
        typedef T type;
        typedef const T const_ret_type;
        const_ret_type apply ( long , long ) const { return val; }

        long nr() const { return NR; }
        long nc() const { return NC; }
    };

    template <
        typename T, 
        long NR, 
        long NC, 
        T val
        >
    const matrix_op<op_uniform_matrix<T,NR,NC,val> > uniform_matrix (
    )
    {
        COMPILE_TIME_ASSERT(NR > 0 && NC > 0);
        typedef op_uniform_matrix<T,NR,NC,val> op;
        return matrix_op<op>(op());
    }

// ----------------------------------------------------------------------------------------

    struct op_gaussian_randm : does_not_alias 
    {
        op_gaussian_randm (
            long nr_,
            long nc_,
            unsigned long seed_
        ) :_nr(nr_), _nc(nc_), seed(seed_){}

        const long _nr;
        const long _nc;
        const unsigned long seed;

        const static long cost = 100;
        const static long NR = 0;
        const static long NC = 0;
        typedef default_memory_manager mem_manager_type;
        typedef row_major_layout layout_type;
        typedef double type;
        typedef double const_ret_type;
        const_ret_type apply ( long r, long c) const { return gaussian_random_hash(r,c,seed); }

        long nr() const { return _nr; }
        long nc() const { return _nc; }
    };

    inline const matrix_op<op_gaussian_randm> gaussian_randm (
        long nr,
        long nc,
        unsigned long seed = 0
    )
    {
        DLIB_ASSERT(nr >= 0 && nc >= 0, 
            "\tmatrix_exp gaussian_randm(nr, nc, seed)"
            << "\n\tInvalid inputs to this function"
            << "\n\tnr: " << nr 
            << "\n\tnc: " << nc 
            );

        typedef op_gaussian_randm op;
        return matrix_op<op>(op(nr,nc,seed));
    }

// ----------------------------------------------------------------------------------------

    template <typename M>
    struct op_add_diag 
    {
        op_add_diag( const M& m_, const typename M::type& value_) : m(m_), value(value_){}
        const M& m;
        const typename M::type value;

        const static long cost = M::cost+1;
        const static long NR = M::NR;
        const static long NC = M::NC;
        typedef typename M::type type;
        typedef const typename M::type const_ret_type;
        typedef typename M::mem_manager_type mem_manager_type;
        typedef typename M::layout_type layout_type;
        const_ret_type apply ( long r, long c) const
        { 
            if (r==c)
                return m(r,c)+value; 
            else
                return m(r,c);
        }

        long nr () const { return m.nr(); }
        long nc () const { return m.nc(); }

        template <typename U> bool aliases               ( const matrix_exp<U>& item) const { return m.aliases(item); }
        template <typename U> bool destructively_aliases ( const matrix_exp<U>& item) const { return m.destructively_aliases(item); }
    };

// ----------------------------------------------------------------------------------------

    template <
        typename T 
        >
    struct op_identity_matrix_2 : does_not_alias 
    {
        op_identity_matrix_2(const long& size_) : size(size_) {}

        const long size;

        const static long cost = 1;
        const static long NR = 0;
        const static long NC = 0;
        typedef default_memory_manager mem_manager_type;
        typedef row_major_layout layout_type;
        typedef T type;
        typedef const T const_ret_type;
        const_ret_type apply (long r, long c) const { return static_cast<type>(r == c); }

        long nr() const { return size; }
        long nc() const { return size; }
    };

    template <
        typename T,
        typename U
        >
    const matrix_diag_op<op_identity_matrix_2<T> > identity_matrix (
        const U& size 
    )
    {
        // the size argument must be some scalar value, not a matrix!
        COMPILE_TIME_ASSERT(is_matrix<U>::value == false);

        DLIB_ASSERT(size > 0, 
            "\tconst matrix_exp identity_matrix<T>(size)"
            << "\n\tsize must be bigger than 0"
            << "\n\tsize: " << size 
            );
        typedef op_identity_matrix_2<T> op;
        return matrix_diag_op<op>(op(size));
    }

    template <
        typename EXP 
        >
    const matrix_diag_op<op_identity_matrix_2<typename EXP::type> > identity_matrix (
        const matrix_exp<EXP>& mat
    )
    {
        DLIB_ASSERT(mat.nr() == mat.nc(), 
            "\tconst matrix_exp identity_matrix(mat)"
            << "\n\t mat must be a square matrix."
            << "\n\t mat.nr(): " << mat.nr() 
            << "\n\t mat.nc(): " << mat.nc() 
            );
        typedef typename EXP::type T;
        typedef op_identity_matrix_2<T> op;
        return matrix_diag_op<op>(op(mat.nr()));
    }

// ----------------------------------------------------------------------------------------

    template <
        typename EXP,
        typename T
        >
    const matrix_op<op_add_diag<EXP> > operator+ (
        const matrix_exp<EXP>& lhs,
        const matrix_exp<matrix_diag_op<op_identity_matrix_2<T> > >& DLIB_IF_ASSERT(rhs)
    )
    {
        // both matrices must contain the same type of element
        COMPILE_TIME_ASSERT((is_same_type<T,typename EXP::type>::value == true));

        // You can only add matrices together if they both have the same number of rows and columns.
        DLIB_ASSERT(lhs.nc() == rhs.nc() &&
                    lhs.nr() == rhs.nr(), 
            "\tconst matrix_exp operator+(const matrix_exp& lhs, const matrix_exp& rhs)"
            << "\n\tYou are trying to add two incompatible matrices together"
            << "\n\tlhs.nr(): " << lhs.nr()
            << "\n\tlhs.nc(): " << lhs.nc()
            << "\n\trhs.nr(): " << rhs.nr()
            << "\n\trhs.nc(): " << rhs.nc()
            << "\n\t&lhs: " << &lhs 
            << "\n\t&rhs: " << &rhs 
            );


        typedef op_add_diag<EXP> op;
        return matrix_op<op>(op(lhs.ref(),1));
    }

// ----------------------------------------------------------------------------------------

    template <
        typename EXP,
        typename T
        >
    const matrix_op<op_add_diag<EXP> > operator+ (
        const matrix_exp<matrix_diag_op<op_identity_matrix_2<T> > >& DLIB_IF_ASSERT(lhs), 
        const matrix_exp<EXP>& rhs
    )
    {
        // both matrices must contain the same type of element
        COMPILE_TIME_ASSERT((is_same_type<T,typename EXP::type>::value == true));

        // You can only add matrices together if they both have the same number of rows and columns.
        DLIB_ASSERT(lhs.nc() == rhs.nc() &&
                    lhs.nr() == rhs.nr(), 
            "\tconst matrix_exp operator+(const matrix_exp& lhs, const matrix_exp& rhs)"
            << "\n\tYou are trying to add two incompatible matrices together"
            << "\n\tlhs.nr(): " << lhs.nr()
            << "\n\tlhs.nc(): " << lhs.nc()
            << "\n\trhs.nr(): " << rhs.nr()
            << "\n\trhs.nc(): " << rhs.nc()
            << "\n\t&lhs: " << &lhs 
            << "\n\t&rhs: " << &rhs 
            );


        typedef op_add_diag<EXP> op;
        return matrix_op<op>(op(rhs.ref(),1));
    }

// ----------------------------------------------------------------------------------------

    template <
        typename T,
        long N
        >
    struct op_const_diag_matrix : does_not_alias 
    {
        op_const_diag_matrix(const long& size_, const T& value_) : size(size_),value(value_) {}

        const long size;
        const T value;

        const static long cost = 1;
        const static long NR = N;
        const static long NC = N;
        typedef default_memory_manager mem_manager_type;
        typedef row_major_layout layout_type;
        typedef T type;
        typedef const T const_ret_type;
        const_ret_type apply (long r, long c) const 
        { 
            if (r == c)
                return value;
            else
                return 0;
        }

        long nr() const { return size; }
        long nc() const { return size; }
    };

    template <
        typename T,
        typename U
        >
    const typename disable_if<is_matrix<U>, matrix_diag_op<op_const_diag_matrix<T,0> > >::type operator* (
        const matrix_exp<matrix_diag_op<op_identity_matrix_2<T> > >& m,
        const U& value
    )
    {
        typedef op_const_diag_matrix<T,0> op;
        return matrix_diag_op<op>(op(m.nr(), value));
    }

    template <
        typename T,
        typename U
        >
    const typename disable_if<is_matrix<U>, matrix_diag_op<op_const_diag_matrix<T,0> > >::type operator* (
        const U& value,
        const matrix_exp<matrix_diag_op<op_identity_matrix_2<T> > >& m
    )
    {
        typedef op_const_diag_matrix<T,0> op;
        return matrix_diag_op<op>(op(m.nr(), value));
    }

// ----------------------------------------------------------------------------------------

    template <
        typename EXP,
        typename T,
        long N
        >
    const matrix_op<op_add_diag<EXP> > operator+ (
        const matrix_exp<EXP>& lhs,
        const matrix_exp<matrix_diag_op<op_const_diag_matrix<T,N> > >& rhs 
    )
    {
        // both matrices must contain the same type of element
        COMPILE_TIME_ASSERT((is_same_type<T,typename EXP::type>::value == true));

        // You can only add matrices together if they both have the same number of rows and columns.
        DLIB_ASSERT(lhs.nc() == rhs.nc() &&
                    lhs.nr() == rhs.nr(), 
            "\tconst matrix_exp operator+(const matrix_exp& lhs, const matrix_exp& rhs)"
            << "\n\tYou are trying to add two incompatible matrices together"
            << "\n\tlhs.nr(): " << lhs.nr()
            << "\n\tlhs.nc(): " << lhs.nc()
            << "\n\trhs.nr(): " << rhs.nr()
            << "\n\trhs.nc(): " << rhs.nc()
            << "\n\t&lhs: " << &lhs 
            << "\n\t&rhs: " << &rhs 
            );


        typedef op_add_diag<EXP> op;
        return matrix_op<op>(op(lhs.ref(),rhs.ref().op.value));
    }

    template <
        typename EXP,
        typename T,
        long N
        >
    const matrix_op<op_add_diag<EXP> > operator+ (
        const matrix_exp<matrix_diag_op<op_const_diag_matrix<T,N> > >& lhs, 
        const matrix_exp<EXP>& rhs
    )
    {
        // both matrices must contain the same type of element
        COMPILE_TIME_ASSERT((is_same_type<T,typename EXP::type>::value == true));

        // You can only add matrices together if they both have the same number of rows and columns.
        DLIB_ASSERT(lhs.nc() == rhs.nc() &&
                    lhs.nr() == rhs.nr(), 
            "\tconst matrix_exp operator+(const matrix_exp& lhs, const matrix_exp& rhs)"
            << "\n\tYou are trying to add two incompatible matrices together"
            << "\n\tlhs.nr(): " << lhs.nr()
            << "\n\tlhs.nc(): " << lhs.nc()
            << "\n\trhs.nr(): " << rhs.nr()
            << "\n\trhs.nc(): " << rhs.nc()
            << "\n\t&lhs: " << &lhs 
            << "\n\t&rhs: " << &rhs 
            );


        typedef op_add_diag<EXP> op;
        return matrix_op<op>(op(rhs.ref(),lhs.ref().op.value));
    }

// ----------------------------------------------------------------------------------------

    template <
        typename T, 
        long N
        >
    struct op_identity_matrix : does_not_alias 
    {
        const static long cost = 1;
        const static long NR = N;
        const static long NC = N;
        typedef default_memory_manager mem_manager_type;
        typedef row_major_layout layout_type;
        typedef T type;
        typedef const T const_ret_type;
        const_ret_type apply ( long r, long c) const { return static_cast<type>(r == c); }

        long nr () const { return NR; }
        long nc () const { return NC; }
    };

    template <
        typename T, 
        long N
        >
    const matrix_diag_op<op_identity_matrix<T,N> > identity_matrix (
    )
    {
        COMPILE_TIME_ASSERT(N > 0);

        typedef op_identity_matrix<T,N> op;
        return matrix_diag_op<op>(op());
    }

    template <
        typename T,
        typename U,
        long N
        >
    const typename disable_if<is_matrix<U>, matrix_diag_op<op_const_diag_matrix<T,N> > >::type operator* (
        const matrix_exp<matrix_diag_op<op_identity_matrix<T,N> > >& m,
        const U& value
    )
    {
        typedef op_const_diag_matrix<T,N> op;
        return matrix_diag_op<op>(op(m.nr(), value));
    }

    template <
        typename T,
        typename U,
        long N
        >
    const typename disable_if<is_matrix<U>, matrix_diag_op<op_const_diag_matrix<T,N> > >::type operator* (
        const U& value,
        const matrix_exp<matrix_diag_op<op_identity_matrix<T,N> > >& m
    )
    {
        typedef op_const_diag_matrix<T,N> op;
        return matrix_diag_op<op>(op(m.nr(), value));
    }

// ----------------------------------------------------------------------------------------

    template <
        typename EXP,
        typename T,
        long N
        >
    const matrix_op<op_add_diag<EXP> > operator+ (
        const matrix_exp<matrix_diag_op<op_identity_matrix<T,N> > >& DLIB_IF_ASSERT(lhs), 
        const matrix_exp<EXP>& rhs
    )
    {
        // both matrices must contain the same type of element
        COMPILE_TIME_ASSERT((is_same_type<T,typename EXP::type>::value == true));

        // You can only add matrices together if they both have the same number of rows and columns.
        DLIB_ASSERT(lhs.nc() == rhs.nc() &&
                    lhs.nr() == rhs.nr(), 
            "\tconst matrix_exp operator+(const matrix_exp& lhs, const matrix_exp& rhs)"
            << "\n\tYou are trying to add two incompatible matrices together"
            << "\n\tlhs.nr(): " << lhs.nr()
            << "\n\tlhs.nc(): " << lhs.nc()
            << "\n\trhs.nr(): " << rhs.nr()
            << "\n\trhs.nc(): " << rhs.nc()
            << "\n\t&lhs: " << &lhs 
            << "\n\t&rhs: " << &rhs 
            );


        typedef op_add_diag<EXP> op;
        return matrix_op<op>(op(rhs.ref(),1));
    }

    template <
        typename EXP,
        typename T,
        long N
        >
    const matrix_op<op_add_diag<EXP> > operator+ (
        const matrix_exp<EXP>& lhs,
        const matrix_exp<matrix_diag_op<op_identity_matrix<T,N> > >& DLIB_IF_ASSERT(rhs)
    )
    {
        // both matrices must contain the same type of element
        COMPILE_TIME_ASSERT((is_same_type<T,typename EXP::type>::value == true));

        // You can only add matrices together if they both have the same number of rows and columns.
        DLIB_ASSERT(lhs.nc() == rhs.nc() &&
                    lhs.nr() == rhs.nr(), 
            "\tconst matrix_exp operator+(const matrix_exp& lhs, const matrix_exp& rhs)"
            << "\n\tYou are trying to add two incompatible matrices together"
            << "\n\tlhs.nr(): " << lhs.nr()
            << "\n\tlhs.nc(): " << lhs.nc()
            << "\n\trhs.nr(): " << rhs.nr()
            << "\n\trhs.nc(): " << rhs.nc()
            << "\n\t&lhs: " << &lhs 
            << "\n\t&rhs: " << &rhs 
            );


        typedef op_add_diag<EXP> op;
        return matrix_op<op>(op(lhs.ref(),1));
    }

// ----------------------------------------------------------------------------------------

    template <typename M, long R, long C>
    struct op_rotate 
    {
        op_rotate(const M& m_) : m(m_) {}
        const M& m;

        const static long cost = M::cost + 2;
        const static long NR = M::NR;
        const static long NC = M::NC;
        typedef typename M::type type;
        typedef typename M::const_ret_type const_ret_type;
        typedef typename M::mem_manager_type mem_manager_type;
        typedef typename M::layout_type layout_type;
        const_ret_type apply ( long r, long c) const { return m((r+R)%m.nr(),(c+C)%m.nc()); }

        long nr () const { return m.nr(); }
        long nc () const { return m.nc(); }

        template <typename U> bool aliases               ( const matrix_exp<U>& item) const { return m.aliases(item); }
        template <typename U> bool destructively_aliases ( const matrix_exp<U>& item) const { return m.aliases(item); }
    };

    template <
        long R,
        long C,
        typename EXP
        >
    const matrix_op<op_rotate<EXP,R,C> > rotate (
        const matrix_exp<EXP>& m
    )
    {
        typedef op_rotate<EXP,R,C> op;
        return matrix_op<op>(op(m.ref()));
    }

// ----------------------------------------------------------------------------------------

    namespace impl
    {
        // A template to tell me if two types can be multiplied together in a sensible way.  Here
        // I'm saying it is ok if they are both the same type or one is the complex version of the other.
        template <typename T, typename U> struct compatible { static const bool value = false;  typedef T type; };
        template <typename T>             struct compatible<T,T> { static const bool value = true; typedef T type; };
        template <typename T>             struct compatible<std::complex<T>,T> { static const bool value = true; typedef std::complex<T> type;  };
        template <typename T>             struct compatible<T,std::complex<T> > { static const bool value = true; typedef std::complex<T> type; };
    }


    template <typename M1, typename M2>
    struct op_pointwise_multiply : basic_op_mm<M1,M2>
    {
        op_pointwise_multiply( const M1& m1_, const M2& m2_) : basic_op_mm<M1,M2>(m1_,m2_){}

        typedef typename impl::compatible<typename M1::type, typename M2::type>::type type;
        typedef const type const_ret_type;
        const static long cost = M1::cost + M2::cost + 1;

        const_ret_type apply ( long r, long c) const
        { return this->m1(r,c)*this->m2(r,c); }
    };

    template <
        typename EXP1,
        typename EXP2
        >
    inline const matrix_op<op_pointwise_multiply<EXP1,EXP2> > pointwise_multiply (
        const matrix_exp<EXP1>& a,
        const matrix_exp<EXP2>& b 
    )
    {
        COMPILE_TIME_ASSERT((impl::compatible<typename EXP1::type,typename EXP2::type>::value == true));
        COMPILE_TIME_ASSERT(EXP1::NR == EXP2::NR || EXP1::NR == 0 || EXP2::NR == 0);
        COMPILE_TIME_ASSERT(EXP1::NC == EXP2::NC || EXP1::NC == 0 || EXP2::NC == 0);
        DLIB_ASSERT(a.nr() == b.nr() &&
               a.nc() == b.nc(), 
            "\tconst matrix_exp pointwise_multiply(const matrix_exp& a, const matrix_exp& b)"
            << "\n\tYou can only make a do a pointwise multiply with two equally sized matrices"
            << "\n\ta.nr(): " << a.nr()
            << "\n\ta.nc(): " << a.nc() 
            << "\n\tb.nr(): " << b.nr()
            << "\n\tb.nc(): " << b.nc() 
            );
        typedef op_pointwise_multiply<EXP1,EXP2> op;
        return matrix_op<op>(op(a.ref(),b.ref()));
    }

// ----------------------------------------------------------------------------------------

    template <typename M1, typename M2, typename M3>
    struct op_pointwise_multiply3 : basic_op_mmm<M1,M2,M3>
    {
        op_pointwise_multiply3( const M1& m1_, const M2& m2_, const M3& m3_) : 
            basic_op_mmm<M1,M2,M3>(m1_,m2_,m3_){}

        typedef typename M1::type type;
        typedef const typename M1::type const_ret_type;
        const static long cost = M1::cost + M2::cost + M3::cost + 2;

        const_ret_type apply (long r, long c) const
        { return this->m1(r,c)*this->m2(r,c)*this->m3(r,c); }
    };

    template <
        typename EXP1,
        typename EXP2,
        typename EXP3
        >
    inline const matrix_op<op_pointwise_multiply3<EXP1,EXP2,EXP3> > 
        pointwise_multiply (
        const matrix_exp<EXP1>& a,
        const matrix_exp<EXP2>& b, 
        const matrix_exp<EXP3>& c
    )
    {
        COMPILE_TIME_ASSERT((is_same_type<typename EXP1::type,typename EXP2::type>::value == true));
        COMPILE_TIME_ASSERT((is_same_type<typename EXP2::type,typename EXP3::type>::value == true));
        COMPILE_TIME_ASSERT(EXP1::NR == EXP2::NR || EXP1::NR == 0 || EXP2::NR == 0);
        COMPILE_TIME_ASSERT(EXP1::NC == EXP2::NC || EXP1::NR == 0 || EXP2::NC == 0);
        COMPILE_TIME_ASSERT(EXP2::NR == EXP3::NR || EXP2::NR == 0 || EXP3::NR == 0);
        COMPILE_TIME_ASSERT(EXP2::NC == EXP3::NC || EXP2::NC == 0 || EXP3::NC == 0);
        DLIB_ASSERT(a.nr() == b.nr() &&
               a.nc() == b.nc() &&
               b.nr() == c.nr() &&
               b.nc() == c.nc(), 
            "\tconst matrix_exp pointwise_multiply(a,b,c)"
            << "\n\tYou can only make a do a pointwise multiply between equally sized matrices"
            << "\n\ta.nr(): " << a.nr()
            << "\n\ta.nc(): " << a.nc() 
            << "\n\tb.nr(): " << b.nr()
            << "\n\tb.nc(): " << b.nc() 
            << "\n\tc.nr(): " << c.nr()
            << "\n\tc.nc(): " << c.nc() 
            );

        typedef op_pointwise_multiply3<EXP1,EXP2,EXP3> op;
        return matrix_op<op>(op(a.ref(),b.ref(),c.ref()));
    }

// ----------------------------------------------------------------------------------------

    template <typename M1, typename M2, typename M3, typename M4>
    struct op_pointwise_multiply4 : basic_op_mmmm<M1,M2,M3,M4>
    {
        op_pointwise_multiply4( const M1& m1_, const M2& m2_, const M3& m3_, const M4& m4_) : 
            basic_op_mmmm<M1,M2,M3,M4>(m1_,m2_,m3_,m4_){}

        typedef typename M1::type type;
        typedef const typename M1::type const_ret_type;
        const static long cost = M1::cost + M2::cost + M3::cost + M4::cost + 3;

        const_ret_type apply (long r, long c) const
        { return this->m1(r,c)*this->m2(r,c)*this->m3(r,c)*this->m4(r,c); }
    };


    template <
        typename EXP1,
        typename EXP2,
        typename EXP3,
        typename EXP4
        >
    inline const matrix_op<op_pointwise_multiply4<EXP1,EXP2,EXP3,EXP4> > pointwise_multiply (
        const matrix_exp<EXP1>& a,
        const matrix_exp<EXP2>& b, 
        const matrix_exp<EXP3>& c,
        const matrix_exp<EXP4>& d
    )
    {
        COMPILE_TIME_ASSERT((is_same_type<typename EXP1::type,typename EXP2::type>::value == true));
        COMPILE_TIME_ASSERT((is_same_type<typename EXP2::type,typename EXP3::type>::value == true));
        COMPILE_TIME_ASSERT((is_same_type<typename EXP3::type,typename EXP4::type>::value == true));
        COMPILE_TIME_ASSERT(EXP1::NR == EXP2::NR || EXP1::NR == 0 || EXP2::NR == 0);
        COMPILE_TIME_ASSERT(EXP1::NC == EXP2::NC || EXP1::NC == 0 || EXP2::NC == 0 );
        COMPILE_TIME_ASSERT(EXP2::NR == EXP3::NR || EXP2::NR == 0 || EXP3::NR == 0);
        COMPILE_TIME_ASSERT(EXP2::NC == EXP3::NC || EXP2::NC == 0 || EXP3::NC == 0);
        COMPILE_TIME_ASSERT(EXP3::NR == EXP4::NR || EXP3::NR == 0 || EXP4::NR == 0);
        COMPILE_TIME_ASSERT(EXP3::NC == EXP4::NC || EXP3::NC == 0 || EXP4::NC == 0);
        DLIB_ASSERT(a.nr() == b.nr() &&
               a.nc() == b.nc() &&
               b.nr() == c.nr() &&
               b.nc() == c.nc() &&
               c.nr() == d.nr() &&
               c.nc() == d.nc(), 
            "\tconst matrix_exp pointwise_multiply(a,b,c,d)"
            << "\n\tYou can only make a do a pointwise multiply between equally sized matrices"
            << "\n\ta.nr(): " << a.nr()
            << "\n\ta.nc(): " << a.nc() 
            << "\n\tb.nr(): " << b.nr()
            << "\n\tb.nc(): " << b.nc() 
            << "\n\tc.nr(): " << c.nr()
            << "\n\tc.nc(): " << c.nc() 
            << "\n\td.nr(): " << d.nr()
            << "\n\td.nc(): " << d.nc() 
            );

        typedef op_pointwise_multiply4<EXP1,EXP2,EXP3,EXP4> op;
        return matrix_op<op>(op(a.ref(),b.ref(),c.ref(),d.ref()));
    }

// ----------------------------------------------------------------------------------------

    template <
        typename P,
        int type = static_switch<
            pixel_traits<P>::grayscale,
            pixel_traits<P>::rgb,
            pixel_traits<P>::hsi,
            pixel_traits<P>::rgb_alpha
            >::value
        >
    struct pixel_to_vector_helper;

    template <typename P>
    struct pixel_to_vector_helper<P,1>
    {
        template <typename M>
        static void assign (
            M& m,
            const P& pixel
        )
        {
            m(0) = static_cast<typename M::type>(pixel);
        }
    };

    template <typename P>
    struct pixel_to_vector_helper<P,2>
    {
        template <typename M>
        static void assign (
            M& m,
            const P& pixel
        )
        {
            m(0) = static_cast<typename M::type>(pixel.red);
            m(1) = static_cast<typename M::type>(pixel.green);
            m(2) = static_cast<typename M::type>(pixel.blue);
        }
    };

    template <typename P>
    struct pixel_to_vector_helper<P,3>
    {
        template <typename M>
        static void assign (
            M& m,
            const P& pixel
        )
        {
            m(0) = static_cast<typename M::type>(pixel.h);
            m(1) = static_cast<typename M::type>(pixel.s);
            m(2) = static_cast<typename M::type>(pixel.i);
        }
    };

    template <typename P>
    struct pixel_to_vector_helper<P,4>
    {
        template <typename M>
        static void assign (
            M& m,
            const P& pixel
        )
        {
            m(0) = static_cast<typename M::type>(pixel.red);
            m(1) = static_cast<typename M::type>(pixel.green);
            m(2) = static_cast<typename M::type>(pixel.blue);
            m(3) = static_cast<typename M::type>(pixel.alpha);
        }
    };


    template <
        typename T,
        typename P
        >
    inline const matrix<T,pixel_traits<P>::num,1> pixel_to_vector (
        const P& pixel
    )
    {
        COMPILE_TIME_ASSERT(pixel_traits<P>::num > 0);
        matrix<T,pixel_traits<P>::num,1> m;
        pixel_to_vector_helper<P>::assign(m,pixel);
        return m;
    }

// ----------------------------------------------------------------------------------------

    template <
        typename P,
        int type = static_switch<
            pixel_traits<P>::grayscale,
            pixel_traits<P>::rgb,
            pixel_traits<P>::hsi,
            pixel_traits<P>::rgb_alpha
            >::value
        >
    struct vector_to_pixel_helper;

    template <typename P>
    struct vector_to_pixel_helper<P,1>
    {
        template <typename M>
        static void assign (
            P& pixel,
            const M& m
        )
        {
            pixel = static_cast<unsigned char>(m(0));
        }
    };

    template <typename P>
    struct vector_to_pixel_helper<P,2>
    {
        template <typename M>
        static void assign (
            P& pixel,
            const M& m
        )
        {
            pixel.red = static_cast<unsigned char>(m(0));
            pixel.green = static_cast<unsigned char>(m(1));
            pixel.blue = static_cast<unsigned char>(m(2));
        }
    };

    template <typename P>
    struct vector_to_pixel_helper<P,3>
    {
        template <typename M>
        static void assign (
            P& pixel,
            const M& m
        )
        {
            pixel.h = static_cast<unsigned char>(m(0));
            pixel.s = static_cast<unsigned char>(m(1));
            pixel.i = static_cast<unsigned char>(m(2));
        }
    };

    template <typename P>
    struct vector_to_pixel_helper<P,4>
    {
        template <typename M>
        static void assign (
            P& pixel,
            const M& m
        )
        {
            pixel.red = static_cast<unsigned char>(m(0));
            pixel.green = static_cast<unsigned char>(m(1));
            pixel.blue = static_cast<unsigned char>(m(2));
            pixel.alpha = static_cast<unsigned char>(m(3));
        }
    };

    template <
        typename P,
        typename EXP
        >
    inline void vector_to_pixel (
        P& pixel,
        const matrix_exp<EXP>& vector 
    )
    {
        COMPILE_TIME_ASSERT(pixel_traits<P>::num == matrix_exp<EXP>::NR);
        COMPILE_TIME_ASSERT(matrix_exp<EXP>::NC == 1);
        vector_to_pixel_helper<P>::assign(pixel,vector);
    }

// ----------------------------------------------------------------------------------------

    template <typename M, long lower, long upper>
    struct op_clamp : basic_op_m<M>
    {
        op_clamp( const M& m_) : basic_op_m<M>(m_){}

        typedef typename M::type type;
        typedef const typename M::type const_ret_type;
        const static long cost = M::cost + 2;

        const_ret_type apply ( long r, long c) const
        { 
            const type temp = this->m(r,c);
            if (temp > static_cast<type>(upper))
                return static_cast<type>(upper);
            else if (temp < static_cast<type>(lower))
                return static_cast<type>(lower);
            else
                return temp;
        }
    };

    template <
        long l, 
        long u,
        typename EXP
        >
    const matrix_op<op_clamp<EXP,l,u> > clamp (
        const matrix_exp<EXP>& m
    )
    {
        typedef op_clamp<EXP,l,u> op;
        return matrix_op<op>(op(m.ref()));
    }

// ----------------------------------------------------------------------------------------

    template <typename M>
    struct op_clamp2 : basic_op_m<M>
    {
        typedef typename M::type type;

        op_clamp2( const M& m_, const type& l, const type& u) : 
            basic_op_m<M>(m_), lower(l), upper(u){}

        const type& lower;
        const type& upper;

        typedef const typename M::type const_ret_type;
        const static long cost = M::cost + 2;

        const_ret_type apply ( long r, long c) const
        { 
            const type temp = this->m(r,c);
            if (temp > upper)
                return upper;
            else if (temp < lower)
                return lower;
            else
                return temp;
        }
    };

    template <
        typename EXP
        >
    const matrix_op<op_clamp2<EXP> > clamp (
        const matrix_exp<EXP>& m,
        const typename EXP::type& lower,
        const typename EXP::type& upper
    )
    {
        typedef op_clamp2<EXP> op;
        return matrix_op<op>(op(m.ref(),lower, upper));
    }

// ----------------------------------------------------------------------------------------

    template <typename M1, typename M2, typename M3>
    struct op_clamp_m : basic_op_mmm<M1,M2,M3>
    {
        op_clamp_m( const M1& m1_, const M2& m2_, const M3& m3_) : 
            basic_op_mmm<M1,M2,M3>(m1_,m2_,m3_){}

        typedef typename M1::type type;
        typedef const typename M1::type const_ret_type;
        const static long cost = M1::cost + M2::cost + M3::cost + 2;

        const_ret_type apply (long r, long c) const
        { 
            const type val = this->m1(r,c);
            const type lower = this->m2(r,c);
            const type upper = this->m3(r,c);
            if (val <= upper)
            {
                if (lower <= val)
                    return val;
                else
                    return lower;
            }
            else 
            {
                return upper;
            }
        }
    };

    template <
        typename EXP1,
        typename EXP2,
        typename EXP3
        >
    const matrix_op<op_clamp_m<EXP1,EXP2,EXP3> > 
    clamp (
        const matrix_exp<EXP1>& m,
        const matrix_exp<EXP2>& lower, 
        const matrix_exp<EXP3>& upper
    )
    {
        COMPILE_TIME_ASSERT((is_same_type<typename EXP1::type,typename EXP2::type>::value == true));
        COMPILE_TIME_ASSERT((is_same_type<typename EXP2::type,typename EXP3::type>::value == true));
        COMPILE_TIME_ASSERT(EXP1::NR == EXP2::NR || EXP1::NR == 0 || EXP2::NR == 0);
        COMPILE_TIME_ASSERT(EXP1::NC == EXP2::NC || EXP1::NR == 0 || EXP2::NC == 0);
        COMPILE_TIME_ASSERT(EXP2::NR == EXP3::NR || EXP2::NR == 0 || EXP3::NR == 0);
        COMPILE_TIME_ASSERT(EXP2::NC == EXP3::NC || EXP2::NC == 0 || EXP3::NC == 0);
        DLIB_ASSERT(m.nr() == lower.nr() &&
                    m.nc() == lower.nc() &&
                    m.nr() == upper.nr() &&
                    m.nc() == upper.nc(),
            "\tconst matrix_exp clamp(m,lower,upper)"
            << "\n\t Invalid inputs were given to this function."
            << "\n\t m.nr():     " << m.nr()
            << "\n\t m.nc():     " << m.nc() 
            << "\n\t lower.nr(): " << lower.nr()
            << "\n\t lower.nc(): " << lower.nc() 
            << "\n\t upper.nr(): " << upper.nr()
            << "\n\t upper.nc(): " << upper.nc() 
            );

        typedef op_clamp_m<EXP1,EXP2,EXP3> op;
        return matrix_op<op>(op(m.ref(),lower.ref(),upper.ref()));
    }

// ----------------------------------------------------------------------------------------

    template <typename M>
    struct op_lowerbound : basic_op_m<M>
    {
        typedef typename M::type type;

        op_lowerbound( const M& m_, const type& thresh_) : 
            basic_op_m<M>(m_), thresh(thresh_){}

        const type& thresh;

        typedef const typename M::type const_ret_type;
        const static long cost = M::cost + 2;

        const_ret_type apply ( long r, long c) const
        { 
            const type temp = this->m(r,c);
            if (temp >= thresh)
                return temp;
            else
                return thresh;
        }
    };

    template <
        typename EXP
        >
    const matrix_op<op_lowerbound<EXP> > lowerbound (
        const matrix_exp<EXP>& m,
        const typename EXP::type& thresh
    )
    {
        typedef op_lowerbound<EXP> op;
        return matrix_op<op>(op(m.ref(), thresh));
    }

// ----------------------------------------------------------------------------------------

    template <typename M>
    struct op_upperbound : basic_op_m<M>
    {
        typedef typename M::type type;

        op_upperbound( const M& m_, const type& thresh_) : 
            basic_op_m<M>(m_), thresh(thresh_){}

        const type& thresh;

        typedef const typename M::type const_ret_type;
        const static long cost = M::cost + 2;

        const_ret_type apply ( long r, long c) const
        { 
            const type temp = this->m(r,c);
            if (temp <= thresh)
                return temp;
            else
                return thresh;
        }
    };

    template <
        typename EXP
        >
    const matrix_op<op_upperbound<EXP> > upperbound (
        const matrix_exp<EXP>& m,
        const typename EXP::type& thresh
    )
    {
        typedef op_upperbound<EXP> op;
        return matrix_op<op>(op(m.ref(), thresh));
    }

// ----------------------------------------------------------------------------------------

    template <typename M>
    struct op_reshape 
    {
        op_reshape(const M& m_, const long& rows_, const long& cols_) : m(m_),rows(rows_),cols(cols_) {}
        const M& m;
        const long rows;
        const long cols;

        const static long cost = M::cost+2;
        const static long NR = 0;
        const static long NC = 0;
        typedef typename M::type type;
        typedef typename M::const_ret_type const_ret_type;
        typedef typename M::mem_manager_type mem_manager_type;
        typedef typename M::layout_type layout_type;

        const_ret_type apply ( long r, long c) const
        { 
            const long idx = r*cols + c;
            return m(idx/m.nc(), idx%m.nc());
        }

        long nr () const { return rows; }
        long nc () const { return cols; }

        template <typename U> bool aliases               ( const matrix_exp<U>& item) const { return m.aliases(item); }
        template <typename U> bool destructively_aliases ( const matrix_exp<U>& item) const { return m.aliases(item); }
    };

    template <
        typename EXP
        >
    const matrix_op<op_reshape<EXP> > reshape (
        const matrix_exp<EXP>& m,
        const long& rows,
        const long& cols 
    )
    {
        DLIB_ASSERT(m.size() == rows*cols && rows > 0 && cols > 0, 
            "\tconst matrix_exp reshape(m, rows, cols)"
            << "\n\t The size of m must match the dimensions you want to reshape it into."
            << "\n\t m.size():  " << m.size()
            << "\n\t rows*cols: " << rows*cols 
            << "\n\t rows:      " << rows 
            << "\n\t cols:      " << cols 
            );

        typedef op_reshape<EXP> op;
        return matrix_op<op>(op(m.ref(), rows, cols));
    }

// ----------------------------------------------------------------------------------------

    template <
        typename EXP1,
        typename EXP2
        >
    typename disable_if<is_complex<typename EXP1::type>,bool>::type equal (
        const matrix_exp<EXP1>& a,
        const matrix_exp<EXP2>& b,
        const typename EXP1::type eps = 100*std::numeric_limits<typename EXP1::type>::epsilon()
    )
    {
        // check if the dimensions don't match
        if (a.nr() != b.nr() || a.nc() != b.nc())
            return false;

        for (long r = 0; r < a.nr(); ++r)
        {
            for (long c = 0; c < a.nc(); ++c)
            {
                if (std::abs(a(r,c)-b(r,c)) > eps)
                    return false;
            }
        }

        // no non-equal points found so we return true 
        return true;
    }

    template <
        typename EXP1,
        typename EXP2
        >
    typename enable_if<is_complex<typename EXP1::type>,bool>::type equal (
        const matrix_exp<EXP1>& a,
        const matrix_exp<EXP2>& b,
        const typename EXP1::type::value_type eps = 100*std::numeric_limits<typename EXP1::type::value_type>::epsilon()
    )
    {
        // check if the dimensions don't match
        if (a.nr() != b.nr() || a.nc() != b.nc())
            return false;

        for (long r = 0; r < a.nr(); ++r)
        {
            for (long c = 0; c < a.nc(); ++c)
            {
                if (std::abs(real(a(r,c)-b(r,c))) > eps ||
                    std::abs(imag(a(r,c)-b(r,c))) > eps)
                    return false;
            }
        }

        // no non-equal points found so we return true 
        return true;
    }

// ----------------------------------------------------------------------------------------

    template <typename M1, typename M2>
    struct op_scale_columns  
    {
        op_scale_columns(const M1& m1_, const M2& m2_) : m1(m1_), m2(m2_) {}
        const M1& m1;
        const M2& m2;

        const static long cost = M1::cost + M2::cost + 1;
        typedef typename M1::type type;
        typedef const typename M1::type const_ret_type;
        typedef typename M1::mem_manager_type mem_manager_type;
        typedef typename M1::layout_type layout_type;
        const static long NR = M1::NR;
        const static long NC = M1::NC;

        const_ret_type apply ( long r, long c) const { return m1(r,c)*m2(c); }

        long nr () const { return m1.nr(); }
        long nc () const { return m1.nc(); }

        template <typename U> bool aliases               ( const matrix_exp<U>& item) const 
        { return m1.aliases(item) || m2.aliases(item) ; }
        template <typename U> bool destructively_aliases ( const matrix_exp<U>& item) const 
        { return m1.destructively_aliases(item) || m2.aliases(item); }
    };

    template <
        typename EXP1,
        typename EXP2
        >
    const matrix_op<op_scale_columns<EXP1,EXP2> > scale_columns (
        const matrix_exp<EXP1>& m,
        const matrix_exp<EXP2>& v 
    )
    {
        // Both arguments to this function must contain the same type of element
        COMPILE_TIME_ASSERT((is_same_type<typename EXP1::type,typename EXP2::type>::value == true));
        // The v argument must be a row or column vector.
        COMPILE_TIME_ASSERT((EXP2::NC == 1 || EXP2::NC == 0) || (EXP2::NR == 1 || EXP2::NR == 0));

        // figure out the compile time known length of v
        const long v_len = ((EXP2::NR)*(EXP2::NC) == 0)? 0 : (tmax<EXP2::NR,EXP2::NC>::value);

        // the length of v must match the number of columns in m
        COMPILE_TIME_ASSERT(EXP1::NC == v_len || EXP1::NC == 0 || v_len == 0);

        DLIB_ASSERT(is_vector(v) == true && v.size() == m.nc(), 
            "\tconst matrix_exp scale_columns(m, v)"
            << "\n\tv must be a row or column vector and its length must match the number of columns in m"
            << "\n\tm.nr(): " << m.nr()
            << "\n\tm.nc(): " << m.nc() 
            << "\n\tv.nr(): " << v.nr()
            << "\n\tv.nc(): " << v.nc() 
            );
        typedef op_scale_columns<EXP1,EXP2> op;
        return matrix_op<op>(op(m.ref(),v.ref()));
    }

// ----------------------------------------------------------------------------------------

    template <typename M1, typename M2>
    struct op_scale_columns_diag  
    {
        op_scale_columns_diag(const M1& m1_, const M2& m2_) : m1(m1_), m2(m2_) {}
        const M1& m1;
        const M2& m2;

        const static long cost = M1::cost + M2::cost + 1;
        typedef typename M1::type type;
        typedef const typename M1::type const_ret_type;
        typedef typename M1::mem_manager_type mem_manager_type;
        typedef typename M1::layout_type layout_type;
        const static long NR = M1::NR;
        const static long NC = M1::NC;

        const_ret_type apply ( long r, long c) const { return m1(r,c)*m2(c,c); }

        long nr () const { return m1.nr(); }
        long nc () const { return m1.nc(); }

        template <typename U> bool aliases               ( const matrix_exp<U>& item) const 
        { return m1.aliases(item) || m2.aliases(item) ; }
        template <typename U> bool destructively_aliases ( const matrix_exp<U>& item) const 
        { return m1.destructively_aliases(item) || m2.aliases(item); }
    };

// turn expressions of the form mat*diagonal_matrix into scale_columns(mat, d)
    template <
        typename EXP1,
        typename EXP2
        >
    const matrix_op<op_scale_columns_diag<EXP1,EXP2> > operator* (
        const matrix_exp<EXP1>& m,
        const matrix_diag_exp<EXP2>& d 
    )
    {
        // Both arguments to this function must contain the same type of element
        COMPILE_TIME_ASSERT((is_same_type<typename EXP1::type,typename EXP2::type>::value == true));

        // figure out the compile time known length of d
        const long v_len = ((EXP2::NR)*(EXP2::NC) == 0)? 0 : (tmax<EXP2::NR,EXP2::NC>::value);

        // the length of d must match the number of columns in m
        COMPILE_TIME_ASSERT(EXP1::NC == v_len || EXP1::NC == 0 || v_len == 0);

        DLIB_ASSERT(m.nc() == d.nr(), 
            "\tconst matrix_exp operator*(m, d)"
            << "\n\tmatrix dimensions don't match"
            << "\n\tm.nr(): " << m.nr()
            << "\n\tm.nc(): " << m.nc() 
            << "\n\td.nr(): " << d.nr()
            << "\n\td.nc(): " << d.nc() 
            );
        typedef op_scale_columns_diag<EXP1,EXP2> op;
        return matrix_op<op>(op(m.ref(),d.ref()));
    }

// ----------------------------------------------------------------------------------------

    template <typename M1, typename M2>
    struct op_scale_rows  
    {
        op_scale_rows(const M1& m1_, const M2& m2_) : m1(m1_), m2(m2_) {}
        const M1& m1;
        const M2& m2;

        const static long cost = M1::cost + M2::cost + 1;
        typedef typename M1::type type;
        typedef const typename M1::type const_ret_type;
        typedef typename M1::mem_manager_type mem_manager_type;
        typedef typename M1::layout_type layout_type;
        const static long NR = M1::NR;
        const static long NC = M1::NC;

        const_ret_type apply ( long r, long c) const { return m1(r,c)*m2(r); }

        long nr () const { return m1.nr(); }
        long nc () const { return m1.nc(); }

        template <typename U> bool aliases               ( const matrix_exp<U>& item) const 
        { return m1.aliases(item) || m2.aliases(item) ; }
        template <typename U> bool destructively_aliases ( const matrix_exp<U>& item) const 
        { return m1.destructively_aliases(item) || m2.aliases(item); }
    };

    template <
        typename EXP1,
        typename EXP2
        >
    const matrix_op<op_scale_rows<EXP1,EXP2> > scale_rows (
        const matrix_exp<EXP1>& m,
        const matrix_exp<EXP2>& v 
    )
    {
        // Both arguments to this function must contain the same type of element
        COMPILE_TIME_ASSERT((is_same_type<typename EXP1::type,typename EXP2::type>::value == true));
        // The v argument must be a row or column vector.
        COMPILE_TIME_ASSERT((EXP2::NC == 1 || EXP2::NC == 0) || (EXP2::NR == 1 || EXP2::NR == 0));

        // figure out the compile time known length of v
        const long v_len = ((EXP2::NR)*(EXP2::NC) == 0)? 0 : (tmax<EXP2::NR,EXP2::NC>::value);

        // the length of v must match the number of rows in m
        COMPILE_TIME_ASSERT(EXP1::NR == v_len || EXP1::NR == 0 || v_len == 0);

        DLIB_ASSERT(is_vector(v) == true && v.size() == m.nr(), 
            "\tconst matrix_exp scale_rows(m, v)"
            << "\n\tv must be a row or column vector and its length must match the number of rows in m"
            << "\n\tm.nr(): " << m.nr()
            << "\n\tm.nc(): " << m.nc() 
            << "\n\tv.nr(): " << v.nr()
            << "\n\tv.nc(): " << v.nc() 
            );
        typedef op_scale_rows<EXP1,EXP2> op;
        return matrix_op<op>(op(m.ref(),v.ref()));
    }

// ----------------------------------------------------------------------------------------

    template <typename M1, typename M2>
    struct op_scale_rows_diag  
    {
        op_scale_rows_diag(const M1& m1_, const M2& m2_) : m1(m1_), m2(m2_) {}
        const M1& m1;
        const M2& m2;

        const static long cost = M1::cost + M2::cost + 1;
        typedef typename M1::type type;
        typedef const typename M1::type const_ret_type;
        typedef typename M1::mem_manager_type mem_manager_type;
        typedef typename M1::layout_type layout_type;
        const static long NR = M1::NR;
        const static long NC = M1::NC;

        const_ret_type apply ( long r, long c) const { return m1(r,c)*m2(r,r); }

        long nr () const { return m1.nr(); }
        long nc () const { return m1.nc(); }

        template <typename U> bool aliases               ( const matrix_exp<U>& item) const 
        { return m1.aliases(item) || m2.aliases(item) ; }
        template <typename U> bool destructively_aliases ( const matrix_exp<U>& item) const 
        { return m1.destructively_aliases(item) || m2.aliases(item); }
    };

// turn expressions of the form diagonal_matrix*mat into scale_rows(mat, d)
    template <
        typename EXP1,
        typename EXP2
        >
    const matrix_op<op_scale_rows_diag<EXP1,EXP2> > operator* (
        const matrix_diag_exp<EXP2>& d, 
        const matrix_exp<EXP1>& m
    )
    {
        // Both arguments to this function must contain the same type of element
        COMPILE_TIME_ASSERT((is_same_type<typename EXP1::type,typename EXP2::type>::value == true));

        // figure out the compile time known length of d
        const long v_len = ((EXP2::NR)*(EXP2::NC) == 0)? 0 : (tmax<EXP2::NR,EXP2::NC>::value);

        // the length of d must match the number of rows in m
        COMPILE_TIME_ASSERT(EXP1::NR == v_len || EXP1::NR == 0 || v_len == 0);

        DLIB_ASSERT(d.nc() == m.nr(), 
            "\tconst matrix_exp operator*(d, m)"
            << "\n\tThe dimensions of the d and m matrices don't match."
            << "\n\tm.nr(): " << m.nr()
            << "\n\tm.nc(): " << m.nc() 
            << "\n\td.nr(): " << d.nr()
            << "\n\td.nc(): " << d.nc() 
            );
        typedef op_scale_rows_diag<EXP1,EXP2> op;
        return matrix_op<op>(op(m.ref(),d.ref()));
    }

// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------

    /*
        The idea here is to catch expressions of the form d*M*d where d is diagonal and M
        is some square matrix and turn them into something equivalent to 
        pointwise_multiply(diag(d)*trans(diag(d)), M).

        The reason for this is that doing it this way is more numerically stable.  In particular,
        doing 2 matrix multiplies as suggested by d*M*d could result in an asymmetric matrix even 
        if M is symmetric to begin with. 
    */

    template <typename M1, typename M2, typename M3>
    struct op_diag_m_diag  
    {
        // This operator represents M1*M2*M3 where M1 and M3 are diagonal

        op_diag_m_diag(const M1& m1_, const M2& m2_, const M3& m3_) : m1(m1_), m2(m2_), m3(m3_) {}
        const M1& m1;
        const M2& m2;
        const M3& m3;

        const static long cost = M1::cost + M2::cost + M3::cost + 1;
        typedef typename M2::type type;
        typedef const typename M2::type const_ret_type;
        typedef typename M2::mem_manager_type mem_manager_type;
        typedef typename M2::layout_type layout_type;
        const static long NR = M2::NR;
        const static long NC = M2::NC;

        const_ret_type apply ( long r, long c) const { return (m1(r,r)*m3(c,c))*m2(r,c); }

        long nr () const { return m2.nr(); }
        long nc () const { return m2.nc(); }

        template <typename U> bool aliases               ( const matrix_exp<U>& item) const 
        { return m1.aliases(item) || m2.aliases(item) || m3.aliases(item) ; }
        template <typename U> bool destructively_aliases ( const matrix_exp<U>& item) const 
        { return m2.destructively_aliases(item) || m1.aliases(item) || m3.aliases(item) ; }
    };

    // catch d*(M*d) = EXP1*EXP2*EXP3
    template <
        typename EXP1,
        typename EXP2,
        typename EXP3
        >
    const matrix_op<op_diag_m_diag<EXP1,EXP2,EXP3> > operator* (
        const matrix_diag_exp<EXP1>& d,
        const matrix_exp<matrix_op<op_scale_columns_diag<EXP2,EXP3> > >& m
    )
    {
        // Both arguments to this function must contain the same type of element
        COMPILE_TIME_ASSERT((is_same_type<typename EXP1::type,typename EXP2::type>::value == true));

        // figure out the compile time known length of d
        const long v_len = ((EXP1::NR)*(EXP1::NC) == 0)? 0 : (tmax<EXP1::NR,EXP1::NC>::value);

        // the length of d must match the number of rows in m
        COMPILE_TIME_ASSERT(EXP2::NR == v_len || EXP2::NR == 0 || v_len == 0);

        DLIB_ASSERT(d.nc() == m.nr(), 
            "\tconst matrix_exp operator*(d, m)"
            << "\n\tmatrix dimensions don't match"
            << "\n\td.nr(): " << d.nr()
            << "\n\td.nc(): " << d.nc() 
            << "\n\tm.nr(): " << m.nr()
            << "\n\tm.nc(): " << m.nc() 
            );
        typedef op_diag_m_diag<EXP1,EXP2,EXP3> op;
        return matrix_op<op>(op(d.ref(), m.ref().op.m1, m.ref().op.m2));
    }

    // catch (d*M)*d = EXP1*EXP2*EXP3
    template <
        typename EXP1,
        typename EXP2,
        typename EXP3
        >
    const matrix_op<op_diag_m_diag<EXP1,EXP2,EXP3> > operator* (
        const matrix_exp<matrix_op<op_scale_rows_diag<EXP2,EXP1> > >& m,
        const matrix_diag_exp<EXP3>& d 
    )
    {
        // Both arguments to this function must contain the same type of element
        COMPILE_TIME_ASSERT((is_same_type<typename EXP3::type,typename EXP2::type>::value == true));

        // figure out the compile time known length of d
        const long v_len = ((EXP3::NR)*(EXP3::NC) == 0)? 0 : (tmax<EXP3::NR,EXP3::NC>::value);

        // the length of d must match the number of columns in m
        COMPILE_TIME_ASSERT(EXP2::NC == v_len || EXP2::NC == 0 || v_len == 0);

        DLIB_ASSERT(m.nc() == d.nr(), 
            "\tconst matrix_exp operator*(m, d)"
            << "\n\tmatrix dimensions don't match"
            << "\n\tm.nr(): " << m.nr()
            << "\n\tm.nc(): " << m.nc() 
            << "\n\td.nr(): " << d.nr()
            << "\n\td.nc(): " << d.nc() 
            );
        typedef op_diag_m_diag<EXP1,EXP2,EXP3> op;
        return matrix_op<op>(op(m.ref().op.m2, m.ref().op.m1, d.ref()));
    }

// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------

    struct sort_columns_sort_helper
    {
        template <typename T>
        bool operator() (
            const T& item1,
            const T& item2
        ) const
        {
            return item1.first < item2.first;
        }
    };

    template <
        typename T, long NR, long NC, typename mm, typename l1,
        long NR2, long NC2, typename mm2, typename l2
        >
    void sort_columns (
        matrix<T,NR,NC,mm,l1>& m,
        matrix<T,NR2,NC2,mm2,l2>& v
    )
    {
        COMPILE_TIME_ASSERT(NC2 == 1 || NC2 == 0);
        COMPILE_TIME_ASSERT(NC == NR2 || NC == 0 || NR2 == 0);

        DLIB_ASSERT(is_col_vector(v) == true && v.size() == m.nc(), 
            "\tconst matrix_exp sort_columns(m, v)"
            << "\n\tv must be a column vector and its length must match the number of columns in m"
            << "\n\tm.nr(): " << m.nr()
            << "\n\tm.nc(): " << m.nc() 
            << "\n\tv.nr(): " << v.nr()
            << "\n\tv.nc(): " << v.nc() 
            );



        // Now we have to sort the given vectors in the m matrix according
        // to how big their corresponding v(column index) values are.
        typedef std::pair<T, matrix<T,0,1,mm> > col_pair;
        typedef std_allocator<col_pair, mm> alloc;
        std::vector<col_pair,alloc> colvalues;
        col_pair p;
        for (long r = 0; r < v.nr(); ++r)
        {
            p.first = v(r);
            p.second = colm(m,r);
            colvalues.push_back(p);
        }
        std::sort(colvalues.begin(), colvalues.end(), sort_columns_sort_helper());
        
        for (long i = 0; i < v.nr(); ++i)
        {
            v(i) = colvalues[i].first;
            set_colm(m,i) = colvalues[i].second;
        }

    }

// ----------------------------------------------------------------------------------------

    template <
        typename T, long NR, long NC, typename mm, typename l1,
        long NR2, long NC2, typename mm2, typename l2
        >
    void rsort_columns (
        matrix<T,NR,NC,mm,l1>& m,
        matrix<T,NR2,NC2,mm2,l2>& v
    )
    {
        COMPILE_TIME_ASSERT(NC2 == 1 || NC2 == 0);
        COMPILE_TIME_ASSERT(NC == NR2 || NC == 0 || NR2 == 0);

        DLIB_ASSERT(is_col_vector(v) == true && v.size() == m.nc(), 
            "\tconst matrix_exp rsort_columns(m, v)"
            << "\n\tv must be a column vector and its length must match the number of columns in m"
            << "\n\tm.nr(): " << m.nr()
            << "\n\tm.nc(): " << m.nc() 
            << "\n\tv.nr(): " << v.nr()
            << "\n\tv.nc(): " << v.nc() 
            );



        // Now we have to sort the given vectors in the m matrix according
        // to how big their corresponding v(column index) values are.
        typedef std::pair<T, matrix<T,0,1,mm> > col_pair;
        typedef std_allocator<col_pair, mm> alloc;
        std::vector<col_pair,alloc> colvalues;
        col_pair p;
        for (long r = 0; r < v.nr(); ++r)
        {
            p.first = v(r);
            p.second = colm(m,r);
            colvalues.push_back(p);
        }
        std::sort(colvalues.rbegin(), colvalues.rend(), sort_columns_sort_helper());
        
        for (long i = 0; i < v.nr(); ++i)
        {
            v(i) = colvalues[i].first;
            set_colm(m,i) = colvalues[i].second;
        }

    }

// ----------------------------------------------------------------------------------------

    template <typename M1, typename M2>
    struct op_tensor_product 
    {
        op_tensor_product(const M1& m1_, const M2& m2_) : m1(m1_),m2(m2_) {}
        const M1& m1;
        const M2& m2;

        const static long cost = M1::cost + M2::cost + 1;
        const static long NR = M1::NR*M2::NR;
        const static long NC = M1::NC*M2::NC;
        typedef typename M1::type type;
        typedef const typename M1::type const_ret_type;
        typedef typename M1::mem_manager_type mem_manager_type;
        typedef typename M1::layout_type layout_type;

        const_ret_type apply ( long r, long c) const
        { 
            return m1(r/m2.nr(),c/m2.nc())*m2(r%m2.nr(),c%m2.nc()); 
        }

        long nr () const { return m1.nr()*m2.nr(); }
        long nc () const { return m1.nc()*m2.nc(); }

        template <typename U> bool aliases               ( const matrix_exp<U>& item) const 
        { return m1.aliases(item) || m2.aliases(item); }
        template <typename U> bool destructively_aliases ( const matrix_exp<U>& item) const 
        { return m1.aliases(item) || m2.aliases(item); }
    };

    template <
        typename EXP1,
        typename EXP2
        >
    inline const matrix_op<op_tensor_product<EXP1,EXP2> > tensor_product (
        const matrix_exp<EXP1>& a,
        const matrix_exp<EXP2>& b 
    )
    {
        COMPILE_TIME_ASSERT((is_same_type<typename EXP1::type,typename EXP2::type>::value == true));
        typedef op_tensor_product<EXP1,EXP2> op;
        return matrix_op<op>(op(a.ref(),b.ref()));
    }

// ----------------------------------------------------------------------------------------

    template <typename M>
    struct op_make_symmetric : basic_op_m<M>
    {
        op_make_symmetric ( const M& m_) : basic_op_m<M>(m_){}

        const static long cost = M::cost+1;
        typedef typename M::type type;
        typedef typename M::const_ret_type const_ret_type;
        const_ret_type apply ( long r, long c) const
        { 
            if (r >= c)
                return this->m(r,c);
            else
                return this->m(c,r);
        }
    };

    template <
        typename EXP
        >
    const matrix_op<op_make_symmetric<EXP> > make_symmetric (
        const matrix_exp<EXP>& m
    )
    {
        DLIB_ASSERT(m.nr() == m.nc(), 
            "\tconst matrix make_symmetric(m)"
            << "\n\t m must be a square matrix"
            << "\n\t m.nr(): " << m.nr()
            << "\n\t m.nc(): " << m.nc()
            );

        typedef op_make_symmetric<EXP> op;
        return matrix_op<op>(op(m.ref()));
    }

// ----------------------------------------------------------------------------------------

    template <typename M>
    struct op_lowerm : basic_op_m<M>
    {
        op_lowerm( const M& m_) : basic_op_m<M>(m_){}

        const static long cost = M::cost+2;
        typedef typename M::type type;
        typedef const typename M::type const_ret_type;
        const_ret_type apply ( long r, long c) const
        { 
            if (r >= c)
                return this->m(r,c); 
            else
                return 0;
        }
    };

    template <typename M>
    struct op_lowerm_s : basic_op_m<M>
    {
        typedef typename M::type type;
        op_lowerm_s( const M& m_, const type& s_) : basic_op_m<M>(m_), s(s_){}

        const type s;

        const static long cost = M::cost+2;
        typedef const typename M::type const_ret_type;
        const_ret_type apply ( long r, long c) const
        { 
            if (r > c)
                return this->m(r,c); 
            else if (r==c)
                return s;
            else
                return 0;
        }
    };

    template <
        typename EXP
        >
    const matrix_op<op_lowerm<EXP> > lowerm (
        const matrix_exp<EXP>& m
    )
    {
        typedef op_lowerm<EXP> op;
        return matrix_op<op>(op(m.ref()));
    }

    template <
        typename EXP
        >
    const matrix_op<op_lowerm_s<EXP> > lowerm (
        const matrix_exp<EXP>& m,
        typename EXP::type s
        )
    {
        typedef op_lowerm_s<EXP> op;
        return matrix_op<op>(op(m.ref(),s));
    }

// ----------------------------------------------------------------------------------------

    template <typename M>
    struct op_upperm : basic_op_m<M>
    {
        op_upperm( const M& m_) : basic_op_m<M>(m_){}

        const static long cost = M::cost+2;
        typedef typename M::type type;
        typedef const typename M::type const_ret_type;
        const_ret_type apply ( long r, long c) const
        { 
            if (r <= c)
                return this->m(r,c); 
            else
                return 0;
        }
    };

    template <typename M>
    struct op_upperm_s : basic_op_m<M>
    {
        typedef typename M::type type;
        op_upperm_s( const M& m_, const type& s_) : basic_op_m<M>(m_), s(s_){}

        const type s;

        const static long cost = M::cost+2;
        typedef const typename M::type const_ret_type;
        const_ret_type apply ( long r, long c) const
        { 
            if (r < c)
                return this->m(r,c); 
            else if (r==c)
                return s;
            else
                return 0;
        }
    };

    template <
        typename EXP
        >
    const matrix_op<op_upperm<EXP> > upperm (
        const matrix_exp<EXP>& m
    )
    {
        typedef op_upperm<EXP> op;
        return matrix_op<op>(op(m.ref()));
    }

    template <
        typename EXP
        >
    const matrix_op<op_upperm_s<EXP> > upperm (
        const matrix_exp<EXP>& m,
        typename EXP::type s
        )
    {
        typedef op_upperm_s<EXP> op;
        return matrix_op<op>(op(m.ref(),s));
    }

// ----------------------------------------------------------------------------------------

    template <typename rand_gen>
    inline const matrix<double> randm( 
        long nr,
        long nc,
        rand_gen& rnd
    )
    {
        DLIB_ASSERT(nr >= 0 && nc >= 0, 
            "\tconst matrix randm(nr, nc, rnd)"
            << "\n\tInvalid inputs to this function"
            << "\n\tnr: " << nr 
            << "\n\tnc: " << nc 
            );

        matrix<double> m(nr,nc);
        for (long r = 0; r < m.nr(); ++r)
        {
            for (long c = 0; c < m.nc(); ++c)
            {
                m(r,c) = rnd.get_random_double();
            }
        }

        return m;
    }

// ----------------------------------------------------------------------------------------

    inline const matrix<double> randm( 
        long nr,
        long nc
    )
    {
        DLIB_ASSERT(nr >= 0 && nc >= 0, 
            "\tconst matrix randm(nr, nc)"
            << "\n\tInvalid inputs to this function"
            << "\n\tnr: " << nr 
            << "\n\tnc: " << nc 
            );

        matrix<double> m(nr,nc);
        // make a double that contains RAND_MAX + the smallest number that still
        // makes the resulting double slightly bigger than static_cast<double>(RAND_MAX)
        double max_val = RAND_MAX;
        max_val += std::numeric_limits<double>::epsilon()*RAND_MAX;

        for (long r = 0; r < m.nr(); ++r)
        {
            for (long c = 0; c < m.nc(); ++c)
            {
                m(r,c) = std::rand()/max_val;
            }
        }

        return m;
    }

// ----------------------------------------------------------------------------------------

    inline const matrix_range_exp<double> linspace (
        double start,
        double end,
        long num
    ) 
    { 
        DLIB_ASSERT(num >= 0, 
            "\tconst matrix_exp linspace(start, end, num)"
            << "\n\tInvalid inputs to this function"
            << "\n\tstart: " << start 
            << "\n\tend:   " << end
            << "\n\tnum:   " << num 
            );

        return matrix_range_exp<double>(start,end,num,false); 
    }

// ----------------------------------------------------------------------------------------

    template <typename M>
    struct op_linpiece  
    {
        op_linpiece(const double val_, const M& joints_) : joints(joints_), val(val_){}

        const M& joints;
        const double val;

        const static long cost = 10; 

        const static long NR = (M::NR*M::NC==0) ? (0) : (M::NR*M::NC-1); 
        const static long NC = 1; 
        typedef typename M::type type;
        typedef default_memory_manager mem_manager_type;
        typedef row_major_layout layout_type;

        typedef type const_ret_type;
        const_ret_type apply (long i, long ) const 
        { 
            if (joints(i) < val)
                return std::min<type>(val,joints(i+1)) - joints(i);
            else
                return 0;
        }

        long nr () const { return joints.size()-1; }
        long nc () const { return 1; }

        template <typename U> bool aliases               ( const matrix_exp<U>& item) const { return joints.aliases(item); }
        template <typename U> bool destructively_aliases ( const matrix_exp<U>& item) const { return joints.aliases(item); }
    }; 

    template < typename EXP >
    const matrix_op<op_linpiece<EXP> > linpiece (
        const double val,
        const matrix_exp<EXP>& joints
    )
    {
        // make sure requires clause is not broken
        DLIB_ASSERT(is_vector(joints) && joints.size() >= 2, 
            "\t matrix_exp linpiece()"
            << "\n\t Invalid inputs were given to this function "
            << "\n\t is_vector(joints): " << is_vector(joints) 
            << "\n\t joints.size():     " << joints.size() 
            );
#ifdef ENABLE_ASSERTS
        for (long i = 1; i < joints.size(); ++i)
        {
            DLIB_ASSERT(joints(i-1) < joints(i), 
                "\t matrix_exp linpiece()"
                << "\n\t Invalid inputs were given to this function "
                << "\n\t joints("<<i-1<<"): " << joints(i-1) 
                << "\n\t joints("<<i<<"): " << joints(i) 
            );
        }
#endif
        
        typedef op_linpiece<EXP> op;
        return matrix_op<op>(op(val,joints.ref()));
    }

// ----------------------------------------------------------------------------------------
    
    inline const matrix_log_range_exp<double> logspace (
        double start,
        double end,
        long num
    ) 
    { 
        DLIB_ASSERT(num >= 0, 
            "\tconst matrix_exp logspace(start, end, num)"
            << "\n\tInvalid inputs to this function"
            << "\n\tstart: " << start 
            << "\n\tend:   " << end
            << "\n\tnum:   " << num 
            );

        return matrix_log_range_exp<double>(start,end,num); 
    }

// ----------------------------------------------------------------------------------------

    template <typename M1, typename M2>
    struct op_cart_prod  
    {
        op_cart_prod(const M1& m1_, const M2& m2_) : m1(m1_),m2(m2_) {}
        const M1& m1;
        const M2& m2;

        const static long cost = M1::cost+M2::cost+1;
        typedef typename M1::type type;
        typedef const typename M1::const_ret_type const_ret_type;

        typedef typename M1::mem_manager_type mem_manager_type;
        typedef typename M1::layout_type layout_type;
        const static long NR = M1::NR+M2::NR;
        const static long NC = M1::NC*M2::NC;

        const_ret_type apply ( long r, long c) const
        { 
            if (r < m1.nr())
                return m1(r, c/m2.nc());
            else
                return m2(r-m1.nr(), c%m2.nc());
        }

        long nr () const { return m1.nr() + m2.nr(); }
        long nc () const { return m1.nc() * m2.nc(); }

        template <typename U> bool aliases               ( const matrix_exp<U>& item) const 
        { return m1.aliases(item) || m2.aliases(item); }
        template <typename U> bool destructively_aliases ( const matrix_exp<U>& item) const 
        { return m1.aliases(item) || m2.aliases(item); }
    };

    template <
        typename EXP1,
        typename EXP2
        >
    const matrix_op<op_cart_prod<EXP1,EXP2> > cartesian_product (
        const matrix_exp<EXP1>& a,
        const matrix_exp<EXP2>& b 
    )
    {
        COMPILE_TIME_ASSERT((is_same_type<typename EXP1::type,typename EXP2::type>::value == true));

        typedef op_cart_prod<EXP1,EXP2> op;
        return matrix_op<op>(op(a.ref(),b.ref()));
    }

// ----------------------------------------------------------------------------------------

    template <typename M>
    struct op_mat_to_vect 
    {
        op_mat_to_vect(const M& m_) : m(m_) {}
        const M& m;

        const static long cost = M::cost+2;
        const static long NR = M::NC*M::NR;
        const static long NC = 1;
        typedef typename M::type type;
        typedef typename M::const_ret_type const_ret_type;
        typedef typename M::mem_manager_type mem_manager_type;
        typedef typename M::layout_type layout_type;

        const_ret_type apply ( long r, long ) const { return m(r/m.nc(), r%m.nc()); }

        long nr () const { return m.size(); }
        long nc () const { return 1; }

        template <typename U> bool aliases               ( const matrix_exp<U>& item) const { return m.aliases(item); }
        template <typename U> bool destructively_aliases ( const matrix_exp<U>& item) const { return m.aliases(item); }
    }; 

    template <
        typename EXP
        >
    const matrix_op<op_mat_to_vect<EXP> > reshape_to_column_vector (
        const matrix_exp<EXP>& m
    )
    {
        typedef op_mat_to_vect<EXP> op;
        return matrix_op<op>(op(m.ref()));
    }

// ----------------------------------------------------------------------------------------

    template <
        typename T,
        long NR_,
        long NC_,
        typename MM
        >
    struct op_mat_to_vect2
    {
        typedef matrix<T,NR_,NC_,MM,row_major_layout> M;
        op_mat_to_vect2(const M& m_) : m(m_) {}
        const M& m;

        const static long cost = M::cost+2;
        const static long NR = M::NC*M::NR;
        const static long NC = 1;
        typedef typename M::type type;
        typedef typename M::const_ret_type const_ret_type;
        typedef typename M::mem_manager_type mem_manager_type;
        typedef typename M::layout_type layout_type;

        const_ret_type apply ( long r, long ) const { return (&m(0,0))[r]; }

        long nr () const { return m.size(); }
        long nc () const { return 1; }

        template <typename U> bool aliases               ( const matrix_exp<U>& item) const { return m.aliases(item); }
        template <typename U> bool destructively_aliases ( const matrix_exp<U>& item) const { return m.aliases(item); }
    }; 

    template <
        typename T,
        long NR,
        long NC,
        typename MM
        >
    const matrix_op<op_mat_to_vect2<T,NR,NC,MM> > reshape_to_column_vector (
        const matrix<T,NR,NC,MM,row_major_layout>& m
    )
    {
        typedef op_mat_to_vect2<T,NR,NC,MM> op;
        return matrix_op<op>(op(m.ref()));
    }

// ----------------------------------------------------------------------------------------

    template <typename M1, typename M2>
    struct op_join_rows 
    {
        op_join_rows(const M1& m1_, const M2& m2_) : m1(m1_),m2(m2_) {}
        const M1& m1;
        const M2& m2;

        template <typename T, typename U, bool selection>
        struct type_selector;
        template <typename T, typename U>
        struct type_selector<T,U,true> { typedef T type; };
        template <typename T, typename U>
        struct type_selector<T,U,false> { typedef U type; };

        // If both const_ret_types are references then we should use them as the const_ret_type type
        // but otherwise we should use the normal type.  
        typedef typename M1::const_ret_type T1;
        typedef typename M1::type T2;
        typedef typename M2::const_ret_type T3;
        typedef typename type_selector<T1, T2, is_reference_type<T1>::value && is_reference_type<T3>::value>::type const_ret_type;

        const static long cost = M1::cost + M2::cost + 1;
        const static long NR = tmax<M1::NR, M2::NR>::value;
        const static long NC = (M1::NC*M2::NC != 0)? (M1::NC+M2::NC) : (0);
        typedef typename M1::type type;
        typedef typename M1::mem_manager_type mem_manager_type;
        typedef typename M1::layout_type layout_type;

        const_ret_type apply (long r, long c) const
        { 
            if (c < m1.nc())
                return m1(r,c);
            else
                return m2(r,c-m1.nc());
        }

        long nr () const { return m1.nr(); }
        long nc () const { return m1.nc()+m2.nc(); }

        template <typename U> bool aliases               ( const matrix_exp<U>& item) const 
        { return m1.aliases(item) || m2.aliases(item); }
        template <typename U> bool destructively_aliases ( const matrix_exp<U>& item) const 
        { return m1.aliases(item) || m2.aliases(item); }
    };

    template <
        typename EXP1,
        typename EXP2
        >
    inline const matrix_op<op_join_rows<EXP1,EXP2> > join_rows (
        const matrix_exp<EXP1>& a,
        const matrix_exp<EXP2>& b 
    )
    {
        COMPILE_TIME_ASSERT((is_same_type<typename EXP1::type,typename EXP2::type>::value == true));
        // You are getting an error on this line because you are trying to join two matrices that
        // don't have the same number of rows
        COMPILE_TIME_ASSERT(EXP1::NR == EXP2::NR || (EXP1::NR*EXP2::NR == 0));

        DLIB_ASSERT(a.nr() == b.nr() || a.size() == 0 || b.size() == 0,
            "\tconst matrix_exp join_rows(const matrix_exp& a, const matrix_exp& b)"
            << "\n\tYou can only use join_rows() if both matrices have the same number of rows"
            << "\n\ta.nr(): " << a.nr()
            << "\n\tb.nr(): " << b.nr()
            << "\n\ta.nc(): " << a.nc()
            << "\n\tb.nc(): " << b.nc()
            );

        typedef op_join_rows<EXP1,EXP2> op;
        return matrix_op<op>(op(a.ref(),b.ref()));
    }

// ----------------------------------------------------------------------------------------

    template <typename M1, typename M2>
    struct op_join_cols 
    {
        op_join_cols(const M1& m1_, const M2& m2_) : m1(m1_),m2(m2_) {}
        const M1& m1;
        const M2& m2;

        template <typename T, typename U, bool selection>
        struct type_selector;
        template <typename T, typename U>
        struct type_selector<T,U,true> { typedef T type; };
        template <typename T, typename U>
        struct type_selector<T,U,false> { typedef U type; };

        // If both const_ret_types are references then we should use them as the const_ret_type type
        // but otherwise we should use the normal type.  
        typedef typename M1::const_ret_type T1;
        typedef typename M1::type T2;
        typedef typename M2::const_ret_type T3;
        typedef typename type_selector<T1, T2, is_reference_type<T1>::value && is_reference_type<T3>::value>::type const_ret_type;



        const static long cost = M1::cost + M2::cost + 1;
        const static long NC = tmax<M1::NC, M2::NC>::value;
        const static long NR = (M1::NR*M2::NR != 0)? (M1::NR+M2::NR) : (0);
        typedef typename M1::type type;
        typedef typename M1::mem_manager_type mem_manager_type;
        typedef typename M1::layout_type layout_type;

        const_ret_type apply ( long r, long c) const
        { 
            if (r < m1.nr())
                return m1(r,c);
            else
                return m2(r-m1.nr(),c);
        }

        long nr () const { return m1.nr()+m2.nr(); }
        long nc () const { return m1.nc(); }

        template <typename U> bool aliases               ( const matrix_exp<U>& item) const 
        { return m1.aliases(item) || m2.aliases(item); }
        template <typename U> bool destructively_aliases ( const matrix_exp<U>& item) const 
        { return m1.aliases(item) || m2.aliases(item); }
    };

    template <
        typename EXP1,
        typename EXP2
        >
    inline const matrix_op<op_join_cols<EXP1,EXP2> > join_cols (
        const matrix_exp<EXP1>& a,
        const matrix_exp<EXP2>& b 
    )
    {
        COMPILE_TIME_ASSERT((is_same_type<typename EXP1::type,typename EXP2::type>::value == true));
        // You are getting an error on this line because you are trying to join two matrices that
        // don't have the same number of columns 
        COMPILE_TIME_ASSERT(EXP1::NC == EXP2::NC || (EXP1::NC*EXP2::NC == 0));

        DLIB_ASSERT(a.nc() == b.nc() || a.size() == 0 || b.size() == 0,
            "\tconst matrix_exp join_cols(const matrix_exp& a, const matrix_exp& b)"
            << "\n\tYou can only use join_cols() if both matrices have the same number of columns"
            << "\n\ta.nr(): " << a.nr()
            << "\n\tb.nr(): " << b.nr()
            << "\n\ta.nc(): " << a.nc()
            << "\n\tb.nc(): " << b.nc()
            );

        typedef op_join_cols<EXP1,EXP2> op;
        return matrix_op<op>(op(a.ref(),b.ref()));
    }

// ----------------------------------------------------------------------------------------

    template <typename M>
    struct op_fliplr 
    {
        op_fliplr( const M& m_) : m(m_){}

        const M& m;

        const static long cost = M::cost;
        const static long NR = M::NR;
        const static long NC = M::NC;
        typedef typename M::type type;
        typedef typename M::const_ret_type const_ret_type;
        typedef typename M::mem_manager_type mem_manager_type;
        typedef typename M::layout_type layout_type;

        const_ret_type apply (long r, long c) const { return m(r,m.nc()-c-1); }

        long nr () const { return m.nr(); }
        long nc () const { return m.nc(); }

        template <typename U> bool aliases               ( const matrix_exp<U>& item) const { return m.aliases(item); }
        template <typename U> bool destructively_aliases ( const matrix_exp<U>& item) const { return m.aliases(item); }

    }; 

    template <
        typename M
        >
    const matrix_op<op_fliplr<M> > fliplr (
        const matrix_exp<M>& m
    )
    {
        typedef op_fliplr<M> op;
        return matrix_op<op>(op(m.ref()));
    }

// ----------------------------------------------------------------------------------------

    template <typename M>
    struct op_flipud 
    {
        op_flipud( const M& m_) : m(m_){}

        const M& m;

        const static long cost = M::cost;
        const static long NR = M::NR;
        const static long NC = M::NC;
        typedef typename M::type type;
        typedef typename M::const_ret_type const_ret_type;
        typedef typename M::mem_manager_type mem_manager_type;
        typedef typename M::layout_type layout_type;

        const_ret_type apply (long r, long c) const { return m(m.nr()-r-1,c); }

        long nr () const { return m.nr(); }
        long nc () const { return m.nc(); }

        template <typename U> bool aliases               ( const matrix_exp<U>& item) const { return m.aliases(item); }
        template <typename U> bool destructively_aliases ( const matrix_exp<U>& item) const { return m.aliases(item); }

    }; 

    template <
        typename M
        >
    const matrix_op<op_flipud<M> > flipud (
        const matrix_exp<M>& m
    )
    {
        typedef op_flipud<M> op;
        return matrix_op<op>(op(m.ref()));
    }

// ----------------------------------------------------------------------------------------

    template <typename M>
    struct op_flip 
    {
        op_flip( const M& m_) : m(m_){}

        const M& m;

        const static long cost = M::cost;
        const static long NR = M::NR;
        const static long NC = M::NC;
        typedef typename M::type type;
        typedef typename M::const_ret_type const_ret_type;
        typedef typename M::mem_manager_type mem_manager_type;
        typedef typename M::layout_type layout_type;

        const_ret_type apply (long r, long c) const { return m(m.nr()-r-1, m.nc()-c-1); }

        long nr () const { return m.nr(); }
        long nc () const { return m.nc(); }

        template <typename U> bool aliases               ( const matrix_exp<U>& item) const { return m.aliases(item); }
        template <typename U> bool destructively_aliases ( const matrix_exp<U>& item) const { return m.aliases(item); }

    }; 

    template <
        typename M
        >
    const matrix_op<op_flip<M> > flip (
        const matrix_exp<M>& m
    )
    {
        typedef op_flip<M> op;
        return matrix_op<op>(op(m.ref()));
    }

// ----------------------------------------------------------------------------------------

    template <typename T, long NR, long NC, typename MM, typename L>
    uint32 hash (
        const matrix<T,NR,NC,MM,L>& item,
        uint32 seed = 0
    )
    {
        DLIB_ASSERT_HAS_STANDARD_LAYOUT(T);

        if (item.size() == 0)
            return 0;
        else
            return murmur_hash3(&item(0,0), sizeof(T)*item.size(), seed);
    }

// ----------------------------------------------------------------------------------------

}

#endif // DLIB_MATRIx_UTILITIES_

