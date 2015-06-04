// Copyright (C) 2006  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#ifndef DLIB_MATRIx_EXPRESSIONS_H_
#define DLIB_MATRIx_EXPRESSIONS_H_

#include "matrix_fwd.h"

#ifdef _MSC_VER
// This #pragma directive is also located in the algs.h file but for whatever
// reason visual studio 9 just ignores it when it is only there. 

// this is to disable the "'this' : used in base member initializer list"
// warning you get from some of the GUI objects since all the objects
// require that their parent class be passed into their constructor. 
// In this case though it is totally safe so it is ok to disable this warning.
#pragma warning(disable : 4355)
#endif

namespace dlib
{

// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------
//            Helper templates for making operators used by expression objects
// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------

    template <typename T>
    class matrix_range_exp;

    template <typename T>
    struct matrix_traits<matrix_range_exp<T> >
    {
        typedef T type;
        typedef const T const_ret_type;
        typedef default_memory_manager mem_manager_type;
        typedef row_major_layout layout_type;
        const static long NR = 1;
        const static long NC = 0;
        const static long cost = 1;
    };

    template <typename T>
    class matrix_range_exp : public matrix_exp<matrix_range_exp<T> >
    {
    public:
        typedef typename matrix_traits<matrix_range_exp>::type type;
        typedef typename matrix_traits<matrix_range_exp>::const_ret_type const_ret_type;
        typedef typename matrix_traits<matrix_range_exp>::mem_manager_type mem_manager_type;
        const static long NR = matrix_traits<matrix_range_exp>::NR;
        const static long NC = matrix_traits<matrix_range_exp>::NC;
        const static long cost = matrix_traits<matrix_range_exp>::cost;
        typedef typename matrix_traits<matrix_range_exp>::layout_type layout_type;


        matrix_range_exp (
            T start_,
            T end_
        ) 
        {
            start = start_;
            if (start_ <= end_)
                inc = 1;
            else 
                inc = -1;
            nc_ = std::abs(end_ - start_) + 1;
        }
        matrix_range_exp (
            T start_,
            T inc_,
            T end_
        ) 
        {
            start = start_;
            nc_ = std::abs(end_ - start_)/inc_ + 1;
            if (start_ <= end_)
                inc = inc_;
            else
                inc = -inc_;
        }

        matrix_range_exp (
            T start_,
            T end_,
            long num,
            bool
        ) 
        {
            start = start_;
            nc_ = num;
            if (num > 1)
            {
                inc = (end_-start_)/(num-1);
            }
            else 
            {
                inc = 0;
                start = end_;
            }

        }

        const_ret_type operator() (
            long, 
            long c
        ) const { return start + c*inc;  }

        const_ret_type operator() (
            long c
        ) const { return start + c*inc;  }

        template <typename U>
        bool aliases (
            const matrix_exp<U>& 
        ) const { return false; }

        template <typename U>
        bool destructively_aliases (
            const matrix_exp<U>& 
        ) const { return false; }

        long nr (
        ) const { return NR; }

        long nc (
        ) const { return nc_; }

        long nc_;
        T start;
        T inc;
    };

// ----------------------------------------------------------------------------------------

    template <typename T>
    class matrix_log_range_exp;

    template <typename T>
    struct matrix_traits<matrix_log_range_exp<T> >
    {
        typedef T type;
        typedef const T const_ret_type;
        typedef default_memory_manager mem_manager_type;
        typedef row_major_layout layout_type;
        const static long NR = 1;
        const static long NC = 0;
        const static long cost = 1;
    };

    template <typename T>
    class matrix_log_range_exp : public matrix_exp<matrix_log_range_exp<T> >
    {
    public:
        typedef typename matrix_traits<matrix_log_range_exp>::type type;
        typedef typename matrix_traits<matrix_log_range_exp>::const_ret_type const_ret_type;
        typedef typename matrix_traits<matrix_log_range_exp>::mem_manager_type mem_manager_type;
        const static long NR = matrix_traits<matrix_log_range_exp>::NR;
        const static long NC = matrix_traits<matrix_log_range_exp>::NC;
        const static long cost = matrix_traits<matrix_log_range_exp>::cost;
        typedef typename matrix_traits<matrix_log_range_exp>::layout_type layout_type;


        matrix_log_range_exp (
            T start_,
            T end_,
            long num
        ) 
        {
            start = start_;
            nc_ = num;
            if (num > 1)
            {
                inc = (end_-start_)/(num-1);
            }
            else 
            {
                inc = 0;
                start = end_;
            }

        }

        const_ret_type operator() (
            long,
            long c
        ) const { return std::pow((T)10,start + c*inc);  }

        const_ret_type operator() (
            long c
        ) const { return std::pow((T)10,start + c*inc);  }

        template <typename U>
        bool aliases (
            const matrix_exp<U>& 
        ) const { return false; }

        template <typename U>
        bool destructively_aliases (
            const matrix_exp<U>& 
        ) const { return false; }

        long nr (
        ) const { return NR; }

        long nc (
        ) const { return nc_; }

        long nc_;
        T start;
        T inc;
    };

// ----------------------------------------------------------------------------------------

    template <long start, long inc_, long end>
    class matrix_range_static_exp;

    template <long start, long inc_, long end>
    struct matrix_traits<matrix_range_static_exp<start,inc_,end> >
    {
        typedef long type;
        typedef const long const_ret_type;
        typedef default_memory_manager mem_manager_type;
        const static long NR = 1;
        const static long NC = tabs<(end - start)>::value/inc_ + 1;
        const static long cost = 1;
        typedef row_major_layout layout_type;
    };

    template <long start, long inc_, long end_>
    class matrix_range_static_exp : public matrix_exp<matrix_range_static_exp<start,inc_,end_> > 
    {
    public:
        typedef typename matrix_traits<matrix_range_static_exp>::type type;
        typedef typename matrix_traits<matrix_range_static_exp>::const_ret_type const_ret_type;
        typedef typename matrix_traits<matrix_range_static_exp>::mem_manager_type mem_manager_type;
        const static long NR = matrix_traits<matrix_range_static_exp>::NR;
        const static long NC = matrix_traits<matrix_range_static_exp>::NC;
        const static long cost = matrix_traits<matrix_range_static_exp>::cost;
        typedef typename matrix_traits<matrix_range_static_exp>::layout_type layout_type;

        const static long inc = (start <= end_)?inc_:-inc_;


        matrix_range_static_exp (
        ) {}

        const_ret_type operator() (
            long , 
            long c
        ) const { return start + c*inc;  }

        const_ret_type operator() (
            long c
        ) const { return start + c*inc;  }

        template <typename U>
        bool aliases (
            const matrix_exp<U>& 
        ) const { return false; }

        template <typename U>
        bool destructively_aliases (
            const matrix_exp<U>& 
        ) const { return false; }

        long nr (
        ) const { return NR; }

        long nc (
        ) const { return NC; }

    };

// ----------------------------------------------------------------------------------------

}

#endif // DLIB_MATRIx_EXPRESSIONS_H_

