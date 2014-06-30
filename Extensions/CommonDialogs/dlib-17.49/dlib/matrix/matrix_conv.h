// Copyright (C) 2011  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#ifndef DLIB_MATRIx_CONV_H__
#define DLIB_MATRIx_CONV_H__

#include "matrix_conv_abstract.h"
#include "matrix.h"

namespace dlib
{

// ----------------------------------------------------------------------------------------

    namespace impl
    {
        template <typename T>
        const T& conj(const T& item) { return item; }
        template <typename T>
        std::complex<T> conj(const std::complex<T>& item) { return std::conj(item); }
    }

// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------

    template <typename M1, typename M2, bool flip_m2 = false>
    struct op_conv 
    {
        op_conv( const M1& m1_, const M2& m2_) : 
            m1(m1_),
            m2(m2_), 
            nr_(m1.nr()+m2.nr()-1),
            nc_(m1.nc()+m2.nc()-1)
        {
            if (nr_ < 0 || m1.size() == 0 || m2.size() == 0)
                nr_ = 0;
            if (nc_ < 0 || m1.size() == 0 || m2.size() == 0)
                nc_ = 0;
        }

        const M1& m1;
        const M2& m2;
        long nr_; 
        long nc_;

        const static long cost = (M1::cost+M2::cost)*10;
        const static long NR = (M1::NR*M2::NR==0) ? (0) : (M1::NR+M2::NR-1);
        const static long NC = (M1::NC*M2::NC==0) ? (0) : (M1::NC+M2::NC-1);
        typedef typename M1::type type;
        typedef type const_ret_type;
        typedef typename M1::mem_manager_type mem_manager_type;
        typedef typename M1::layout_type layout_type;

        const_ret_type apply (long r, long c) const 
        { 
            type temp = 0;

            const long min_rr = std::max<long>(r-m2.nr()+1, 0);
            const long max_rr = std::min<long>(m1.nr()-1, r);

            const long min_cc = std::max<long>(c-m2.nc()+1, 0);
            const long max_cc = std::min<long>(m1.nc()-1, c);

            for (long rr = min_rr; rr <= max_rr; ++rr)
            {
                for (long cc = min_cc; cc <= max_cc; ++cc)
                {
                    if (flip_m2)
                        temp += m1(rr,cc)*dlib::impl::conj(m2(m2.nr()-r+rr-1, m2.nc()-c+cc-1));
                    else
                        temp += m1(rr,cc)*m2(r-rr,c-cc);
                }
            }

            return temp; 
        }

        long nr () const { return nr_; }
        long nc () const { return nc_; }

        template <typename U> bool aliases               ( const matrix_exp<U>& item) const { return m1.aliases(item) || m2.aliases(item); }
        template <typename U> bool destructively_aliases ( const matrix_exp<U>& item) const { return m1.aliases(item) || m2.aliases(item); }

    }; 

    template <
        typename M1,
        typename M2
        >
    const matrix_op<op_conv<M1,M2> > conv (
        const matrix_exp<M1>& m1,
        const matrix_exp<M2>& m2
    )
    {
        COMPILE_TIME_ASSERT((is_same_type<typename M1::type,typename M2::type>::value == true));

        typedef op_conv<M1,M2> op;
        return matrix_op<op>(op(m1.ref(),m2.ref()));
    }

    template <
        typename M1,
        typename M2
        >
    const matrix_op<op_conv<M1,M2,true> > xcorr (
        const matrix_exp<M1>& m1,
        const matrix_exp<M2>& m2
    )
    {
        COMPILE_TIME_ASSERT((is_same_type<typename M1::type,typename M2::type>::value == true));

        typedef op_conv<M1,M2,true> op;
        return matrix_op<op>(op(m1.ref(),m2.ref()));
    }

// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------

    template <typename M1, typename M2, bool flip_m2 = false>
    struct op_conv_same 
    {
        op_conv_same( const M1& m1_, const M2& m2_) : m1(m1_),m2(m2_),nr_(m1.nr()),nc_(m1.nc())
        {
            if (m1.size() == 0 || m2.size() == 0)
                nr_ = 0;
            if (m1.size() == 0 || m2.size() == 0)
                nc_ = 0;
        }

        const M1& m1;
        const M2& m2;
        long nr_;
        long nc_;

        const static long cost = (M1::cost+M2::cost)*10;
        const static long NR = M1::NR;
        const static long NC = M1::NC;
        typedef typename M1::type type;
        typedef type const_ret_type;
        typedef typename M1::mem_manager_type mem_manager_type;
        typedef typename M1::layout_type layout_type;

        const_ret_type apply (long r, long c) const 
        { 
            r += m2.nr()/2;
            c += m2.nc()/2;

            type temp = 0;

            const long min_rr = std::max<long>(r-m2.nr()+1, 0);
            const long max_rr = std::min<long>(m1.nr()-1, r);

            const long min_cc = std::max<long>(c-m2.nc()+1, 0);
            const long max_cc = std::min<long>(m1.nc()-1, c);

            for (long rr = min_rr; rr <= max_rr; ++rr)
            {
                for (long cc = min_cc; cc <= max_cc; ++cc)
                {
                    if (flip_m2)
                        temp += m1(rr,cc)*dlib::impl::conj(m2(m2.nr()-r+rr-1, m2.nc()-c+cc-1));
                    else
                        temp += m1(rr,cc)*m2(r-rr,c-cc);
                }
            }

            return temp; 
        }

        long nr () const { return nr_; }
        long nc () const { return nc_; }

        template <typename U> bool aliases               ( const matrix_exp<U>& item) const { return m1.aliases(item) || m2.aliases(item); }
        template <typename U> bool destructively_aliases ( const matrix_exp<U>& item) const { return m1.aliases(item) || m2.aliases(item); }

    }; 

    template <
        typename M1,
        typename M2
        >
    const matrix_op<op_conv_same<M1,M2> > conv_same (
        const matrix_exp<M1>& m1,
        const matrix_exp<M2>& m2
    )
    {
        COMPILE_TIME_ASSERT((is_same_type<typename M1::type,typename M2::type>::value == true));

        typedef op_conv_same<M1,M2> op;
        return matrix_op<op>(op(m1.ref(),m2.ref()));
    }

    template <
        typename M1,
        typename M2
        >
    const matrix_op<op_conv_same<M1,M2,true> > xcorr_same (
        const matrix_exp<M1>& m1,
        const matrix_exp<M2>& m2
    )
    {
        COMPILE_TIME_ASSERT((is_same_type<typename M1::type,typename M2::type>::value == true));

        typedef op_conv_same<M1,M2,true> op;
        return matrix_op<op>(op(m1.ref(),m2.ref()));
    }

// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------

    template <typename M1, typename M2, bool flip_m2 = false>
    struct op_conv_valid 
    {
        op_conv_valid( const M1& m1_, const M2& m2_) : 
            m1(m1_),m2(m2_),
            nr_(m1.nr()-m2.nr()+1),
            nc_(m1.nc()-m2.nc()+1)
        {
            if (nr_ < 0 || nc_ <= 0 || m1.size() == 0 || m2.size() == 0)
                nr_ = 0;
            if (nc_ < 0 || nr_ <= 0 || m1.size() == 0 || m2.size() == 0)
                nc_ = 0;
        }

        const M1& m1;
        const M2& m2;
        long nr_; 
        long nc_;

        const static long cost = (M1::cost+M2::cost)*10;
        const static long NR = (M1::NR*M2::NR==0) ? (0) : (M1::NR-M2::NR+1);
        const static long NC = (M1::NC*M2::NC==0) ? (0) : (M1::NC-M2::NC+1);
        typedef typename M1::type type;
        typedef type const_ret_type;
        typedef typename M1::mem_manager_type mem_manager_type;
        typedef typename M1::layout_type layout_type;

        const_ret_type apply (long r, long c) const 
        { 
            r += m2.nr()-1;
            c += m2.nc()-1;

            type temp = 0;

            const long min_rr = std::max<long>(r-m2.nr()+1, 0);
            const long max_rr = std::min<long>(m1.nr()-1, r);

            const long min_cc = std::max<long>(c-m2.nc()+1, 0);
            const long max_cc = std::min<long>(m1.nc()-1, c);

            for (long rr = min_rr; rr <= max_rr; ++rr)
            {
                for (long cc = min_cc; cc <= max_cc; ++cc)
                {
                    if (flip_m2)
                        temp += m1(rr,cc)*dlib::impl::conj(m2(m2.nr()-r+rr-1, m2.nc()-c+cc-1));
                    else
                        temp += m1(rr,cc)*m2(r-rr,c-cc);
                }
            }

            return temp; 
        }

        long nr () const { return nr_; }
        long nc () const { return nc_; }

        template <typename U> bool aliases               ( const matrix_exp<U>& item) const { return m1.aliases(item) || m2.aliases(item); }
        template <typename U> bool destructively_aliases ( const matrix_exp<U>& item) const { return m1.aliases(item) || m2.aliases(item); }

    }; 

    template <
        typename M1,
        typename M2
        >
    const matrix_op<op_conv_valid<M1,M2> > conv_valid (
        const matrix_exp<M1>& m1,
        const matrix_exp<M2>& m2
    )
    {
        COMPILE_TIME_ASSERT((is_same_type<typename M1::type,typename M2::type>::value == true));

        typedef op_conv_valid<M1,M2> op;
        return matrix_op<op>(op(m1.ref(),m2.ref()));
    }

    template <
        typename M1,
        typename M2
        >
    const matrix_op<op_conv_valid<M1,M2,true> > xcorr_valid (
        const matrix_exp<M1>& m1,
        const matrix_exp<M2>& m2
    )
    {
        COMPILE_TIME_ASSERT((is_same_type<typename M1::type,typename M2::type>::value == true));

        typedef op_conv_valid<M1,M2,true> op;
        return matrix_op<op>(op(m1.ref(),m2.ref()));
    }

// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------

}

#endif // DLIB_MATRIx_CONV_H__

