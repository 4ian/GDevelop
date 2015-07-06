// Copyright (C) 2010  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#ifndef DLIB_MATRIx_OP_H_
#define DLIB_MATRIx_OP_H_

#include "matrix_exp.h"


namespace dlib
{

// ----------------------------------------------------------------------------------------

    template <typename OP >
    class matrix_op;

    template < typename OP >
    struct matrix_traits<matrix_op<OP> >
    {
        typedef typename OP::type type;
        typedef typename OP::const_ret_type const_ret_type;
        typedef typename OP::mem_manager_type mem_manager_type;
        typedef typename OP::layout_type layout_type;
        const static long NR = OP::NR;
        const static long NC = OP::NC;
        const static long cost = OP::cost;
    };

    template <
        typename OP
        >
    class matrix_op : public matrix_exp<matrix_op<OP> >
    {
        /*!
            WHAT THIS OBJECT REPRESENTS
                The matrix_op is simply a tool for reducing the amount of boilerplate
                you need to write when creating matrix expressions.  
        !*/

    public:
        typedef typename matrix_traits<matrix_op>::type type;
        typedef typename matrix_traits<matrix_op>::const_ret_type const_ret_type;
        typedef typename matrix_traits<matrix_op>::mem_manager_type mem_manager_type;
        typedef typename matrix_traits<matrix_op>::layout_type layout_type;
        const static long NR = matrix_traits<matrix_op>::NR;
        const static long NC = matrix_traits<matrix_op>::NC;
        const static long cost = matrix_traits<matrix_op>::cost;

    private:
        // This constructor exists simply for the purpose of causing a compile time error if
        // someone tries to create an instance of this object with the wrong kind of object.
        template <typename T1>
        matrix_op (T1); 
    public:

        matrix_op (
            const OP& op_
        ) :
            op(op_)
        {}

        const_ret_type operator() (
            long r, 
            long c
        ) const { return op.apply(r,c); }

        const_ret_type operator() ( long i ) const 
        { return matrix_exp<matrix_op>::operator()(i); }

        template <typename U>
        bool aliases (
            const matrix_exp<U>& item
        ) const { return op.aliases(item); }

        template <typename U>
        bool destructively_aliases (
            const matrix_exp<U>& item
        ) const { return op.destructively_aliases(item); }

        long nr (
        ) const { return op.nr(); }

        long nc (
        ) const { return op.nc(); }


        const OP op;
    };

// ----------------------------------------------------------------------------------------

    template <typename OP >
    class matrix_diag_op;

    template < typename OP >
    struct matrix_traits<matrix_diag_op<OP> >
    {
        typedef typename OP::type type;
        typedef typename OP::const_ret_type const_ret_type;
        typedef typename OP::mem_manager_type mem_manager_type;
        typedef typename OP::layout_type layout_type;
        const static long NR = OP::NR;
        const static long NC = OP::NC;
        const static long cost = OP::cost;
    };

    template <
        typename OP
        >
    class matrix_diag_op : public matrix_diag_exp<matrix_diag_op<OP> >
    {
        /*!
            WHAT THIS OBJECT REPRESENTS
                The matrix_diag_op is simply a tool for reducing the amount of boilerplate
                you need to write when creating matrix expressions.  
        !*/

    public:
        typedef typename matrix_traits<matrix_diag_op>::type type;
        typedef typename matrix_traits<matrix_diag_op>::const_ret_type const_ret_type;
        typedef typename matrix_traits<matrix_diag_op>::mem_manager_type mem_manager_type;
        typedef typename matrix_traits<matrix_diag_op>::layout_type layout_type;
        const static long NR = matrix_traits<matrix_diag_op>::NR;
        const static long NC = matrix_traits<matrix_diag_op>::NC;
        const static long cost = matrix_traits<matrix_diag_op>::cost;

    private:
        // This constructor exists simply for the purpose of causing a compile time error if
        // someone tries to create an instance of this object with the wrong kind of object.
        template <typename T1>
        matrix_diag_op (T1); 
    public:

        matrix_diag_op (
            const OP& op_
        ) :
            op(op_)
        {}

        const_ret_type operator() (
            long r, 
            long c
        ) const { return op.apply(r,c); }

        const_ret_type operator() ( long i ) const 
        { return matrix_exp<matrix_diag_op>::operator()(i); }

        template <typename U>
        bool aliases (
            const matrix_exp<U>& item
        ) const { return op.aliases(item); }

        template <typename U>
        bool destructively_aliases (
            const matrix_exp<U>& item
        ) const { return op.destructively_aliases(item); }

        long nr (
        ) const { return op.nr(); }

        long nc (
        ) const { return op.nc(); }


        const OP op;
    };

// ----------------------------------------------------------------------------------------

    struct does_not_alias 
    {
        /*!
            This is a partial implementation of a matrix operator that never aliases
            another expression.
        !*/

        template <typename U> bool aliases               ( const U& ) const { return false; }
        template <typename U> bool destructively_aliases ( const U& ) const { return false; }
    }; 

// ----------------------------------------------------------------------------------------

    template <typename M>
    struct basic_op_m 
    {
        /*!
            This is a partial implementation of a matrix operator that preserves
            the dimensions of its argument and doesn't have destructive aliasing.
        !*/

    private:
        // This constructor exists simply for the purpose of causing a compile time error if
        // someone tries to create an instance of this object with the wrong kind of object.
        template <typename T1>
        basic_op_m (T1); 
    public:

        basic_op_m(
            const M& m_
        ) : m(m_){}

        const M& m;

        const static long NR = M::NR;
        const static long NC = M::NC;
        typedef typename M::mem_manager_type mem_manager_type;
        typedef typename M::layout_type layout_type;

        long nr () const { return m.nr(); }
        long nc () const { return m.nc(); }

        template <typename U> bool aliases               ( const matrix_exp<U>& item) const 
        { return m.aliases(item); }
        template <typename U> bool destructively_aliases ( const matrix_exp<U>& item) const 
        { return m.destructively_aliases(item); }

    }; 

// ----------------------------------------------------------------------------------------

    template <typename M1, typename M2>
    struct basic_op_mm 
    {
        /*!
            This is a partial implementation of a matrix operator that preserves
            the dimensions of its arguments and doesn't have destructive aliasing.
        !*/

    private:
        // This constructor exists simply for the purpose of causing a compile time error if
        // someone tries to create an instance of this object with the wrong kind of object.
        template <typename T1, typename T2>
        basic_op_mm (T1, T2); 
    public:

        basic_op_mm(
            const M1& m1_,
            const M2& m2_
        ) : m1(m1_), m2(m2_){}

        const M1& m1;
        const M2& m2;

        const static long NR = M1::NR;
        const static long NC = M1::NC;
        typedef typename M1::mem_manager_type mem_manager_type;
        typedef typename M1::layout_type layout_type;

        long nr () const { return m1.nr(); }
        long nc () const { return m1.nc(); }

        template <typename U> bool aliases               ( const matrix_exp<U>& item) const 
        { return m1.aliases(item) || m2.aliases(item); }
        template <typename U> bool destructively_aliases ( const matrix_exp<U>& item) const 
        { return m1.destructively_aliases(item) || m2.destructively_aliases(item); }

    }; 

// ----------------------------------------------------------------------------------------

    template <typename M1, typename M2, typename M3>
    struct basic_op_mmm 
    {
        /*!
            This is a partial implementation of a matrix operator that preserves
            the dimensions of its arguments and doesn't have destructive aliasing.
        !*/

    private:
        // This constructor exists simply for the purpose of causing a compile time error if
        // someone tries to create an instance of this object with the wrong kind of object.
        template <typename T1, typename T2, typename T3>
        basic_op_mmm (T1, T2, T3); 
    public:

        basic_op_mmm(
            const M1& m1_,
            const M2& m2_,
            const M3& m3_
        ) : m1(m1_), m2(m2_), m3(m3_){}

        const M1& m1;
        const M2& m2;
        const M3& m3;

        const static long NR = M1::NR;
        const static long NC = M1::NC;
        typedef typename M1::mem_manager_type mem_manager_type;
        typedef typename M1::layout_type layout_type;

        long nr () const { return m1.nr(); }
        long nc () const { return m1.nc(); }

        template <typename U> bool aliases               ( const matrix_exp<U>& item) const 
        { return m1.aliases(item) || m2.aliases(item) || m3.aliases(item); }
        template <typename U> bool destructively_aliases ( const matrix_exp<U>& item) const 
        { return m1.destructively_aliases(item) || m2.destructively_aliases(item) ||
                 m3.destructively_aliases(item);}

    }; 

// ----------------------------------------------------------------------------------------

    template <typename M1, typename M2, typename M3, typename M4>
    struct basic_op_mmmm 
    {
        /*!
            This is a partial implementation of a matrix operator that preserves
            the dimensions of its arguments and doesn't have destructive aliasing.
        !*/

    private:
        // This constructor exists simply for the purpose of causing a compile time error if
        // someone tries to create an instance of this object with the wrong kind of object.
        template <typename T1, typename T2, typename T3, typename T4>
        basic_op_mmmm (T1, T2, T3, T4); 
    public:

        basic_op_mmmm(
            const M1& m1_,
            const M2& m2_,
            const M3& m3_,
            const M4& m4_
        ) : m1(m1_), m2(m2_), m3(m3_), m4(m4_){}

        const M1& m1;
        const M2& m2;
        const M3& m3;
        const M4& m4;

        const static long NR = M1::NR;
        const static long NC = M1::NC;
        typedef typename M1::mem_manager_type mem_manager_type;
        typedef typename M1::layout_type layout_type;

        long nr () const { return m1.nr(); }
        long nc () const { return m1.nc(); }

        template <typename U> bool aliases               ( const matrix_exp<U>& item) const 
        { return m1.aliases(item) || m2.aliases(item) || m3.aliases(item) || m4.aliases(item); }
        template <typename U> bool destructively_aliases ( const matrix_exp<U>& item) const 
        { return m1.destructively_aliases(item) || m2.destructively_aliases(item) ||
                 m3.destructively_aliases(item) || m4.destructively_aliases(item);}

    }; 

// ----------------------------------------------------------------------------------------

#define DLIB_DEFINE_OP_M(op_name, function, extra_cost)                                         \
    template <typename M>                                                                       \
    struct op_name                                                                              \
    {                                                                                           \
        op_name(                                                                                \
            const M& m_                                                                         \
        ) : m(m_){}                                                                             \
                                                                                                \
        const M& m;                                                                             \
                                                                                                \
        const static long cost = M::cost+(extra_cost);                                          \
        const static long NR = M::NR;                                                           \
        const static long NC = M::NC;                                                           \
        typedef typename M::type type;                                                          \
        typedef const typename M::type const_ret_type;                                          \
        typedef typename M::mem_manager_type mem_manager_type;                                  \
        typedef typename M::layout_type layout_type;                                            \
                                                                                                \
        const_ret_type apply (long r, long c) const { return function(m(r,c)); }                \
                                                                                                \
        long nr () const { return m.nr(); }                                                     \
        long nc () const { return m.nc(); }                                                     \
                                                                                                \
        template <typename U> bool aliases               ( const matrix_exp<U>& item) const     \
        { return m.aliases(item); }                                                             \
        template <typename U> bool destructively_aliases ( const matrix_exp<U>& item) const     \
        { return m.destructively_aliases(item); }                                               \
                                                                                                \
    };                                                                                          

#define DLIB_DEFINE_FUNCTION_M(op_name, name, function, extra_cost)                             \
    DLIB_DEFINE_OP_M(op_name, function, extra_cost)                                             \
    template < typename M >                                                                     \
    const matrix_op<op_name<M> > name ( const matrix_exp<M>& m)                                 \
    {                                                                                           \
        typedef op_name<M> op;                                                                  \
        return matrix_op<op>(op(m.ref()));                                                      \
    }

// ----------------------------------------------------------------------------------------

#define DLIB_DEFINE_OP_MS(op_name, function, extra_cost)                                        \
    template <typename M, typename S>                                                           \
    struct op_name                                                                              \
    {                                                                                           \
        op_name(                                                                                \
            const M& m_,                                                                        \
            const S& s_                                                                         \
        ) : m(m_), s(s_){}                                                                      \
                                                                                                \
        const M& m;                                                                             \
        const S s;                                                                              \
                                                                                                \
        const static long cost = M::cost+(extra_cost);                                          \
        const static long NR = M::NR;                                                           \
        const static long NC = M::NC;                                                           \
        typedef typename M::type type;                                                          \
        typedef const typename M::type const_ret_type;                                          \
        typedef typename M::mem_manager_type mem_manager_type;                                  \
        typedef typename M::layout_type layout_type;                                            \
                                                                                                \
        const_ret_type apply (long r, long c) const { return function(m(r,c), s); }             \
                                                                                                \
        long nr () const { return m.nr(); }                                                     \
        long nc () const { return m.nc(); }                                                     \
                                                                                                \
        template <typename U> bool aliases               ( const matrix_exp<U>& item) const     \
        { return m.aliases(item); }                                                             \
        template <typename U> bool destructively_aliases ( const matrix_exp<U>& item) const     \
        { return m.destructively_aliases(item); }                                               \
                                                                                                \
    };                                                                                          
                                                                                                
#define DLIB_DEFINE_FUNCTION_MS(op_name, name, function, extra_cost)                            \
    DLIB_DEFINE_OP_MS(op_name, function, extra_cost)                                            \
    template < typename M, typename S >                                                         \
    const matrix_op<op_name<M, S> > name ( const matrix_exp<M>& m, const S& s)                  \
    {                                                                                           \
        typedef op_name<M, S> op;                                                               \
        return matrix_op<op>(op(m.ref(), s));                                                   \
    }

// ----------------------------------------------------------------------------------------

#define DLIB_DEFINE_OP_SM(op_name, function, extra_cost)                                        \
    template <typename S, typename M>                                                           \
    struct op_name                                                                              \
    {                                                                                           \
        op_name(                                                                                \
            const S& s_,                                                                        \
            const M& m_                                                                         \
        ) : m(m_), s(s_){}                                                                      \
                                                                                                \
        const M& m;                                                                             \
        const S s;                                                                              \
                                                                                                \
        const static long cost = M::cost+(extra_cost);                                          \
        const static long NR = M::NR;                                                           \
        const static long NC = M::NC;                                                           \
        typedef typename M::type type;                                                          \
        typedef const typename M::type const_ret_type;                                          \
        typedef typename M::mem_manager_type mem_manager_type;                                  \
        typedef typename M::layout_type layout_type;                                            \
                                                                                                \
        const_ret_type apply (long r, long c) const { return function(s, m(r,c)); }             \
                                                                                                \
        long nr () const { return m.nr(); }                                                     \
        long nc () const { return m.nc(); }                                                     \
                                                                                                \
        template <typename U> bool aliases               ( const matrix_exp<U>& item) const     \
        { return m.aliases(item); }                                                             \
        template <typename U> bool destructively_aliases ( const matrix_exp<U>& item) const     \
        { return m.destructively_aliases(item); }                                               \
                                                                                                \
    };                                                                                          
                                                                                                
#define DLIB_DEFINE_FUNCTION_SM(op_name, name, function, extra_cost)                            \
    DLIB_DEFINE_OP_SM(op_name, function, extra_cost)                                            \
    template < typename S, typename M >                                                         \
    const matrix_op<op_name<S, M> > name (const S& s, const matrix_exp<M>& m)                   \
    {                                                                                           \
        typedef op_name<S, M> op;                                                               \
        return matrix_op<op>(op(s, m.ref()));                                                   \
    }

// ----------------------------------------------------------------------------------------

}

#endif // DLIB_MATRIx_OP_H_

