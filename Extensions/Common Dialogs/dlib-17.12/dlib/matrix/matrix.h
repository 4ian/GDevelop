// Copyright (C) 2006  Davis E. King (davisking@users.sourceforge.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#ifndef DLIB_MATRIx_
#define DLIB_MATRIx_

#include "matrix_abstract.h"
#include "../algs.h"
#include "../serialize.h"
#include "../enable_if.h"
#include <sstream>
#include <algorithm>
#include "../memory_manager.h"
#include "../is_kind.h"

#ifdef _MSC_VER
// Disable the following warnings for Visual Studio

// This warning is:
//    "warning C4355: 'this' : used in base member initializer list"
// Which we get from this code but it is not an error so I'm turning this
// warning off and then turning it back on at the end of the file.
#pragma warning(disable : 4355)

#endif

namespace dlib
{

// ----------------------------------------------------------------------------------------

    template <
        typename T,
        long num_rows = 0,
        long num_cols = 0,
        typename mem_manager = memory_manager<char>::kernel_1a
        >
    class matrix; 

// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------

    template <
        typename T,
        long num_rows,
        long num_cols,
        typename mem_manager
        >
    class matrix_ref
    {
    public:
        typedef T type;
        typedef matrix_ref ref_type;
        typedef mem_manager mem_manager_type;
        const static long NR = num_rows;
        const static long NC = num_cols;

        matrix_ref (
            const matrix<T,num_rows,num_cols,mem_manager>& m_
        ) : m(m_) {}

        matrix_ref (
            const matrix_ref& i_
        ) : m(i_.m) {}

        const T& operator() (
            long r,
            long c
        ) const { return m(r,c); }

        long nr (
        ) const { return m.nr(); }

        long nc (
        ) const { return m.nc(); }

        long size (
        ) const { return m.size(); }

        template <typename U, long iNR, long iNC, typename mm >
        bool aliases (
            const matrix<U,iNR,iNC,mm>& item
        ) const  { return false; }

        template <typename U, long iNR, long iNC, typename mm>
        bool destructively_aliases (
            const matrix<U,iNR,iNC,mm>& item
        ) const { return false; }

        bool aliases (
            const matrix<T,num_rows,num_cols,mem_manager>& item
        ) const { return (&m == &item); }

        const matrix_ref ref(
        ) const { return *this; }

    private:
        // no assignment operator
        matrix_ref& operator=(const matrix_ref&);

        const matrix<T,num_rows,num_cols,mem_manager>& m; // This is the item contained by this expression.
    };

// ----------------------------------------------------------------------------------------

    // this is a hack to avoid a compile time error in visual studio 8.  I would just 
    // use sizeof(T) and be done with it but that won't compile.  The idea here 
    // is to avoid using the stack allocation of the matrix_data object if it 
    // is going to contain another matrix and also avoid asking for the sizeof()
    // the contained matrix.
    template <typename T>
    struct get_sizeof_helper
    {
        const static std::size_t val = sizeof(T);
    };

    template <typename T, long NR, long NC, typename mm>
    struct get_sizeof_helper<matrix<T,NR,NC,mm> >
    {
        const static std::size_t val = 1000000;
    };

    template <
        typename T,
        long num_rows,
        long num_cols,
        typename mem_manager,
        int val = static_switch <
            // when the sizes are all non zero and small
            (num_rows*num_cols*get_sizeof_helper<T>::val <= 64) && (num_rows != 0 && num_cols != 0),
            // when the sizes are all non zero and big 
            (num_rows*num_cols*get_sizeof_helper<T>::val >=  65) && (num_rows != 0 && num_cols != 0),
            num_rows == 0 && num_cols != 0,
            num_rows != 0 && num_cols == 0,
            num_rows == 0 && num_cols == 0
            >::value
        >
    class matrix_data ;
    /*!
        WHAT THIS OBJECT REPRESENTS
            This object represents the actual allocation of space for a matrix.
            Small matrices allocate all their data on the stack and bigger ones
            use a memory_manager to get their memory.
    !*/

// ----------------------------------------------------------------------------------------

    template <
        typename T,
        long num_rows,
        long num_cols,
        typename mem_manager
        >
    class matrix_data<T,num_rows,num_cols,mem_manager,1> : noncopyable // when the sizes are all non zero and small
    {
    public:
        const static long NR = num_rows;
        const static long NC = num_cols;

        matrix_data() {}

        T& operator() (
            long r, 
            long c
        ) { return data[r][c]; }

        const T& operator() (
            long r, 
            long c
        ) const { return data[r][c]; }

        T& operator() (
            long i 
        ) { return *(*data + i); }

        const T& operator() (
            long i
        ) const { return *(*data + i); }

        void swap(
            matrix_data& item
        )
        {
            for (long r = 0; r < num_rows; ++r)
            {
                for (long c = 0; c < num_cols; ++c)
                {
                    exchange((*this)(r,c),item(r,c));
                }
            }
        }

        long nr (
        ) const { return num_rows; }

        long nc (
        ) const { return num_cols; }

        void set_size (
            long nr,
            long nc
        )
        {
        }

    private:
        T data[num_rows][num_cols];
    };

// ----------------------------------------------------------------------------------------

    template <
        typename T,
        long num_rows,
        long num_cols,
        typename mem_manager
        >
    class matrix_data<T,num_rows,num_cols,mem_manager,2> : noncopyable // when the sizes are all non zero and big 
    {
    public:
        const static long NR = num_rows;
        const static long NC = num_cols;

        matrix_data (
        ) { data = pool.allocate_array(num_rows*num_cols); }

        ~matrix_data ()
        { pool.deallocate_array(data); }

        T& operator() (
            long r, 
            long c
        ) { return data[r*num_cols + c]; }

        const T& operator() (
            long r, 
            long c
        ) const { return data[r*num_cols + c]; }

        T& operator() (
            long i 
        ) { return data[i]; }

        const T& operator() (
            long i 
        ) const { return data[i]; }

        void swap(
            matrix_data& item
        )
        {
            std::swap(item.data,data);
            pool.swap(item.pool);
        }

        long nr (
        ) const { return num_rows; }

        long nc (
        ) const { return num_cols; }

        void set_size (
            long nr,
            long nc
        )
        {
        }

    private:

        T* data;
        typename mem_manager::template rebind<T>::other pool;
    };

// ----------------------------------------------------------------------------------------

    template <
        typename T,
        long num_rows,
        long num_cols,
        typename mem_manager
        >
    class matrix_data<T,num_rows,num_cols,mem_manager,3> : noncopyable // when num_rows == 0 && num_cols != 0,
    {
    public:
        const static long NR = num_rows;
        const static long NC = num_cols;

        matrix_data (
        ):data(0), nr_(0) { }

        ~matrix_data ()
        { 
            if (data) 
                pool.deallocate_array(data); 
        }

        T& operator() (
            long r, 
            long c
        ) { return data[r*num_cols + c]; }

        const T& operator() (
            long r, 
            long c
        ) const { return data[r*num_cols + c]; }

        T& operator() (
            long i 
        ) { return data[i]; }

        const T& operator() (
            long i 
        ) const { return data[i]; }

        void swap(
            matrix_data& item
        )
        {
            std::swap(item.data,data);
            std::swap(item.nr_,nr_);
            pool.swap(item.pool);
        }

        long nr (
        ) const { return nr_; }

        long nc (
        ) const { return num_cols; }

        void set_size (
            long nr,
            long nc
        )
        {
            if (data) 
            {
                pool.deallocate_array(data);
            }
            data = pool.allocate_array(nr*nc);
            nr_ = nr;
        }

    private:

        T* data;
        long nr_;
        typename mem_manager::template rebind<T>::other pool;
    };

// ----------------------------------------------------------------------------------------

    template <
        typename T,
        long num_rows,
        long num_cols,
        typename mem_manager
        >
    class matrix_data<T,num_rows,num_cols,mem_manager,4> : noncopyable // when num_rows != 0 && num_cols == 0
    {
    public:
        const static long NR = num_rows;
        const static long NC = num_cols;

        matrix_data (
        ):data(0), nc_(0) { }

        ~matrix_data ()
        { 
            if (data) 
            {
                pool.deallocate_array(data);
            }
        }

        T& operator() (
            long r, 
            long c
        ) { return data[r*nc_ + c]; }

        const T& operator() (
            long r, 
            long c
        ) const { return data[r*nc_ + c]; }

        T& operator() (
            long i 
        ) { return data[i]; }

        const T& operator() (
            long i 
        ) const { return data[i]; }

        void swap(
            matrix_data& item
        )
        {
            std::swap(item.data,data);
            std::swap(item.nc_,nc_);
            pool.swap(item.pool);
        }

        long nr (
        ) const { return num_rows; }

        long nc (
        ) const { return nc_; }

        void set_size (
            long nr,
            long nc
        )
        {
            if (data) 
            {
                pool.deallocate_array(data);
            }
            data = pool.allocate_array(nr*nc);
            nc_ = nc;
        }

    private:

        T* data;
        long nc_;
        typename mem_manager::template rebind<T>::other pool;
    };

// ----------------------------------------------------------------------------------------

    template <
        typename T,
        long num_rows,
        long num_cols,
        typename mem_manager
        >
    class matrix_data<T,num_rows,num_cols,mem_manager,5> : noncopyable // when num_rows == 0 && num_cols == 0
    {
    public:
        const static long NR = num_rows;
        const static long NC = num_cols;

        matrix_data (
        ):data(0), nr_(0), nc_(0) { }

        ~matrix_data ()
        { 
            if (data) 
            {
                pool.deallocate_array(data);
            }
        }

        T& operator() (
            long r, 
            long c
        ) { return data[r*nc_ + c]; }

        const T& operator() (
            long r, 
            long c
        ) const { return data[r*nc_ + c]; }

        T& operator() (
            long i 
        ) { return data[i]; }

        const T& operator() (
            long i 
        ) const { return data[i]; }

        void swap(
            matrix_data& item
        )
        {
            std::swap(item.data,data);
            std::swap(item.nc_,nc_);
            std::swap(item.nr_,nr_);
            pool.swap(item.pool);
        }

        long nr (
        ) const { return nr_; }

        long nc (
        ) const { return nc_; }

        void set_size (
            long nr,
            long nc
        )
        {
            if (data) 
            {
                pool.deallocate_array(data);
            }
            data = pool.allocate_array(nr*nc);
            nr_ = nr;
            nc_ = nc;
        }

    private:
        T* data;
        long nr_;
        long nc_;
        typename mem_manager::template rebind<T>::other pool;
    };

// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------

    // We want to return the compile time constant if our NR and NC dimensions
    // aren't zero but if they are then we want to call ref_.nx() and return
    // the correct values. 
    template < typename ref_type, long NR >
    struct get_nr_helper
    {
        static inline long get(const ref_type&) { return NR; }
    };

    template < typename ref_type >
    struct get_nr_helper<ref_type,0>
    {
        static inline long get(const ref_type& m) { return m.nr(); }
    };

    template < typename ref_type, long NC >
    struct get_nc_helper
    {
        static inline long get(const ref_type&) { return NC; }
    };

    template < typename ref_type >
    struct get_nc_helper<ref_type,0>
    {
        static inline long get(const ref_type& m) { return m.nc(); }
    };


    // the matrix_exp for statically sized matrices 
    template <
        typename EXP
        >
    class matrix_exp
    {
    public:
        typedef typename EXP::type type;
        typedef typename EXP::ref_type ref_type;
        typedef typename EXP::mem_manager_type mem_manager_type;
        const static long NR = EXP::NR;
        const static long NC = EXP::NC;
        typedef matrix<type,NR,NC,mem_manager_type> matrix_type;

        matrix_exp (
            const EXP& exp
        ) : ref_(exp.ref()) {}

        inline const type operator() (
            long r,
            long c
        ) const 
        { 
            DLIB_ASSERT(r < nr() && c < nc() && r >= 0 && c >= c, 
                "\tconst type matrix_exp::operator(r,c)"
                << "\n\tYou must give a valid row and column"
                << "\n\tr:    " << r 
                << "\n\tc:    " << c
                << "\n\tnr(): " << nr()
                << "\n\tnc(): " << nc() 
                << "\n\tthis: " << this
                );
            return ref_(r,c); 
        }

        const type operator() (
            long i
        ) const 
        {
            COMPILE_TIME_ASSERT(NC == 1 || NC == 0 || NR == 1 || NR == 0);
            DLIB_ASSERT(nc() == 1 || nr() == 1, 
                "\tconst type matrix_exp::operator(i)"
                << "\n\tYou can only use this operator on column or row vectors"
                << "\n\ti:    " << i
                << "\n\tnr(): " << nr()
                << "\n\tnc(): " << nc()
                << "\n\tthis: " << this
                );
            DLIB_ASSERT( ((nc() == 1 && i < nr()) || (nr() == 1 && i < nc())) && i >= 0, 
                "\tconst type matrix_exp::operator(i)"
                << "\n\tYou must give a valid row/column number"
                << "\n\ti:    " << i
                << "\n\tnr(): " << nr()
                << "\n\tnc(): " << nc()
                << "\n\tthis: " << this
                );
            if (nc() == 1)
                return ref_(i,0);
            else
                return ref_(0,i);
        }

        long size (
        ) const { return nr()*nc(); }

        long nr (
        ) const { return get_nr_helper<ref_type,NR>::get(ref_); }

        long nc (
        ) const { return get_nc_helper<ref_type,NC>::get(ref_); }

        template <typename U, long iNR, long iNC, typename mm >
        bool aliases (
            const matrix<U,iNR,iNC,mm>& item
        ) const { return ref_.aliases(item); }

        template <typename U, long iNR, long iNC , typename mm>
        bool destructively_aliases (
            const matrix<U,iNR,iNC,mm>& item
        ) const { return ref_.destructively_aliases(item); }

        const ref_type& ref (
        ) const { return ref_; }

        inline operator const type (
        ) const 
        {
            COMPILE_TIME_ASSERT(NC == 1 || NC == 0);
            COMPILE_TIME_ASSERT(NR == 1 || NR == 0);
            DLIB_ASSERT(nr() == 1 && nc() == 1, 
                "\tmatrix_exp::operator const type&() const"
                << "\n\tYou can only use this operator on a 1x1 matrix"
                << "\n\tnr(): " << nr()
                << "\n\tnc(): " << nc()
                << "\n\tthis: " << this
                );
            return ref_(0,0);
        }


    private:


        const ref_type ref_;
    };

// ----------------------------------------------------------------------------------------

    template <typename T>
    struct is_matrix<matrix_exp<T> > { static const bool value = true; }; 
    template <typename T, long NR, long NC, typename mm>
    struct is_matrix<matrix_ref<T,NR,NC,mm> > { static const bool value = true; }; 
    template <typename T, long NR, long NC, typename mm>
    struct is_matrix<matrix<T,NR,NC,mm> > { static const bool value = true; }; 
    template <typename T>
    struct is_matrix<T&> { static const bool value = is_matrix<T>::value; }; 
    template <typename T>
    struct is_matrix<const T&> { static const bool value = is_matrix<T>::value; }; 
    template <typename T>
    struct is_matrix<const T> { static const bool value = is_matrix<T>::value; }; 
    /*
        is_matrix<T>::value == 1 if T is a matrix type else 0
    */

 // ----------------------------------------------------------------------------------------

    // This template will perform the needed loop for element multiplication using whichever
    // dimension is provided as a compile time constant (if one is at all).
    template <
        typename LHS,
        typename RHS,
        long lhs_nc = LHS::NC,
        long rhs_nr = RHS::NR
        >
    struct matrix_multiply_helper 
    {
        typedef typename LHS::type type;
        inline const static type  eval (
            const RHS& rhs,
            const LHS& lhs,
            long r, 
            long c
        )  
        { 
            type temp = type();
            for (long i = 0; i < rhs.nr(); ++i)
            {
                temp += lhs(r,i)*rhs(i,c);
            }
            return temp;
        }
    };

    template <
        typename LHS,
        typename RHS,
        long lhs_nc 
        >
    struct matrix_multiply_helper <LHS,RHS,lhs_nc,0>
    {
        typedef typename LHS::type type;
        inline const static type  eval (
            const RHS& rhs,
            const LHS& lhs,
            long r, 
            long c
        )  
        { 
            type temp = type();
            for (long i = 0; i < lhs.nc(); ++i)
            {
                temp += lhs(r,i)*rhs(i,c);
            }
            return temp;
        }
    };

    template <
        typename LHS,
        typename RHS,
        unsigned long count = 0
        >
    class matrix_multiply_exp 
    {
        /*!
            REQUIREMENTS ON LHS AND RHS
                - they must be matrix_exp or matrix_ref objects (or
                  objects with a compatible interface).
        !*/
    public:
        typedef typename LHS::type type;
        typedef matrix_multiply_exp ref_type;
        typedef typename LHS::mem_manager_type mem_manager_type;
        const static long NR = LHS::NR;
        const static long NC = RHS::NC;

        matrix_multiply_exp (
            const matrix_multiply_exp& item
        ) : lhs(item.lhs), rhs(item.rhs) {}

        inline matrix_multiply_exp (
            const LHS& lhs_,
            const RHS& rhs_
        ) :
            lhs(lhs_),
            rhs(rhs_)
        {
            // You are trying to multiply two incompatible matrices together.  The number of columns 
            // in the matrix on the left must match the number of rows in the matrix on the right.
            COMPILE_TIME_ASSERT(LHS::NC == RHS::NR || LHS::NC*RHS::NR == 0);
            DLIB_ASSERT(lhs.nc() == rhs.nr(), 
                "\tconst matrix_exp operator*(const matrix_exp& lhs, const matrix_exp& rhs)"
                << "\n\tYou are trying to multiply two incompatible matrices together"
                << "\n\tlhs.nr(): " << lhs.nr()
                << "\n\tlhs.nc(): " << lhs.nc()
                << "\n\trhs.nr(): " << rhs.nr()
                << "\n\trhs.nc(): " << rhs.nc()
                << "\n\t&lhs: " << &lhs 
                << "\n\t&rhs: " << &rhs 
                );

            // You can't multiply matrices together if they don't both contain the same type of elements.
            COMPILE_TIME_ASSERT((is_same_type<typename LHS::type, typename RHS::type>::value == true));
        }

        inline const type operator() (
            long r, 
            long c
        ) const 
        { 
            return matrix_multiply_helper<LHS,RHS>::eval(rhs,lhs,r,c);
        }

        long nr (
        ) const { return lhs.nr(); }

        long nc (
        ) const { return rhs.nc(); }

        template <typename U, long iNR, long iNC, typename mm >
        bool aliases (
            const matrix<U,iNR,iNC,mm>& item
        ) const { return lhs.aliases(item) || rhs.aliases(item); }

        template <typename U, long iNR, long iNC , typename mm>
        bool destructively_aliases (
            const matrix<U,iNR,iNC,mm>& item
        ) const { return aliases(item); }

        const ref_type& ref(
        ) const { return *this; }

        const LHS lhs;
        const RHS rhs;
    };

    template <
        typename T,
        long NR,
        long NC,
        typename EXP1,
        typename EXP2,
        typename MM
        >
    inline const matrix_exp<matrix_multiply_exp<EXP1, matrix_multiply_exp<EXP2,typename matrix<T,NR,NC,MM>::ref_type >,0 > > operator* (
        const matrix_exp<matrix_multiply_exp<EXP1,EXP2,1> >& m1,
        const matrix<T,NR,NC,MM>& m2
    )
    {
        // We are going to reorder the order of evaluation of the terms here.  This way the
        // multiplication will go faster.
        typedef matrix_multiply_exp<EXP2,typename matrix<T,NR,NC,MM>::ref_type > exp_inner;
        typedef matrix_multiply_exp<EXP1, exp_inner,0 >  exp_outer;
        return matrix_exp<exp_outer>(exp_outer(m1.ref().lhs,exp_inner(m1.ref().rhs,m2)));
    }

    template <
        typename EXP1,
        typename EXP2
        >
    inline const matrix_exp<matrix_multiply_exp<EXP1, EXP2 > >  operator* (
        const matrix_exp<EXP1>& m1,
        const matrix_exp<EXP2>& m2
    )
    {
        typedef matrix_multiply_exp<EXP1, EXP2>  exp;
        return matrix_exp<exp>(exp(m1.ref(),m2.ref()));
    }

    template <
        typename T,
        long NR,
        long NC,
        typename EXP,
        typename MM
        >
    inline const matrix_exp<matrix_multiply_exp<typename matrix<T,NR,NC,MM>::ref_type, matrix_exp<EXP> > >  operator* (
        const matrix<T,NR,NC,MM>& m1,
        const matrix_exp<EXP>& m2
    )
    {
        typedef matrix_multiply_exp<typename matrix<T,NR,NC,MM>::ref_type, matrix_exp<EXP> >  exp;
        return matrix_exp<exp>(exp(m1,m2));
    }

    template <
        typename T,
        long NR,
        long NC,
        typename EXP,
        typename MM
        >
    inline const matrix_exp<matrix_multiply_exp< matrix_exp<EXP>, typename matrix<T,NR,NC,MM>::ref_type, 1> >  operator* (
        const matrix_exp<EXP>& m1,
        const matrix<T,NR,NC,MM>& m2
    )
    {
        typedef matrix_multiply_exp< matrix_exp<EXP>, typename matrix<T,NR,NC,MM>::ref_type, 1 >  exp;
        return matrix_exp<exp>(exp(m1,m2));
    }

    template <
        typename T,
        long NR1,
        long NC1,
        long NR2,
        long NC2,
        typename MM1,
        typename MM2
        >
    inline const matrix_exp<matrix_multiply_exp<typename matrix<T,NR1,NC1,MM1>::ref_type,typename matrix<T,NR2,NC2,MM2>::ref_type > >  operator* (
        const matrix<T,NR1,NC1,MM1>& m1,
        const matrix<T,NR2,NC2,MM2>& m2
    )
    {
        typedef matrix_multiply_exp<typename matrix<T,NR1,NC1,MM1>::ref_type, typename matrix<T,NR2,NC2,MM2>::ref_type >  exp;
        return matrix_exp<exp>(exp(m1,m2));
    }

// ----------------------------------------------------------------------------------------

    template <
        typename LHS,
        typename RHS
        >
    class matrix_add_expression 
    {
        /*!
            REQUIREMENTS ON LHS AND RHS
                - they must be matrix_exp or matrix_ref objects (or
                  objects with a compatible interface).
        !*/
    public:
        typedef typename LHS::type type;
        typedef typename LHS::mem_manager_type mem_manager_type;
        typedef matrix_add_expression ref_type;
        const static long NR = (RHS::NR > LHS::NR) ? RHS::NR : LHS::NR;
        const static long NC = (RHS::NC > LHS::NC) ? RHS::NC : LHS::NC;

        matrix_add_expression (
            const matrix_add_expression& item
        ) : lhs(item.lhs), rhs(item.rhs) {}

        matrix_add_expression (
            const LHS& lhs_,
            const RHS& rhs_
        ) :
            lhs(lhs_),
            rhs(rhs_)
        {
            // You can only add matrices together if they both have the same number of rows and columns.
            COMPILE_TIME_ASSERT(LHS::NR == RHS::NR || LHS::NR == 0 || RHS::NR == 0);
            COMPILE_TIME_ASSERT(LHS::NC == RHS::NC || LHS::NC == 0 || RHS::NC == 0);
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

            // You can only add matrices together if they both contain the same types of elements.
            COMPILE_TIME_ASSERT((is_same_type<typename LHS::type, typename RHS::type>::value == true));
        }

        const type operator() (
            long r, 
            long c
        ) const { return lhs(r,c) + rhs(r,c); }

        template <typename U, long iNR, long iNC , typename mm>
        bool aliases (
            const matrix<U,iNR,iNC,mm>& item
        ) const { return lhs.aliases(item) || rhs.aliases(item); }

        template <typename U, long iNR, long iNC, typename mm >
        bool destructively_aliases (
            const matrix<U,iNR,iNC,mm>& item
        ) const { return lhs.destructively_aliases(item) || rhs.destructively_aliases(item); }

        const ref_type& ref(
        ) const { return *this; }

        long nr (
        ) const { return lhs.nr(); }

        long nc (
        ) const { return lhs.nc(); }

        const LHS lhs;
        const RHS rhs;
    };

    template <
        typename EXP1,
        typename EXP2
        >
    inline const matrix_exp<matrix_add_expression<EXP1, EXP2 > > operator+ (
        const matrix_exp<EXP1>& m1,
        const matrix_exp<EXP2>& m2
    )
    {
        typedef matrix_add_expression<EXP1, EXP2 >  exp;
        return matrix_exp<exp>(exp(m1.ref(),m2.ref()));
    }

// ----------------------------------------------------------------------------------------

    template <
        typename LHS,
        typename RHS
        >
    class matrix_subtract_exp 
    {
        /*!
            REQUIREMENTS ON LHS AND RHS
                - they must be matrix_exp or matrix_ref objects (or
                  objects with a compatible interface).
        !*/
    public:
        typedef typename LHS::type type;
        typedef typename LHS::mem_manager_type mem_manager_type;
        typedef matrix_subtract_exp ref_type;
        const static long NR = (RHS::NR > LHS::NR) ? RHS::NR : LHS::NR;
        const static long NC = (RHS::NC > LHS::NC) ? RHS::NC : LHS::NC;

        matrix_subtract_exp (
            const LHS& lhs_,
            const RHS& rhs_
        ) :
            lhs(lhs_),
            rhs(rhs_)
        {
            // You can only subtract one matrix from another if they both have the same number of rows and columns.
            COMPILE_TIME_ASSERT(LHS::NR == RHS::NR || LHS::NR == 0 || RHS::NR == 0);
            COMPILE_TIME_ASSERT(LHS::NC == RHS::NC || LHS::NC == 0 || RHS::NC == 0);
            DLIB_ASSERT(lhs.nc() == rhs.nc() &&
                   lhs.nr() == rhs.nr(), 
                "\tconst matrix_exp operator-(const matrix_exp& lhs, const matrix_exp& rhs)"
                << "\n\tYou are trying to add two incompatible matrices together"
                << "\n\tlhs.nr(): " << lhs.nr()
                << "\n\tlhs.nc(): " << lhs.nc()
                << "\n\trhs.nr(): " << rhs.nr()
                << "\n\trhs.nc(): " << rhs.nc()
                << "\n\t&lhs: " << &lhs 
                << "\n\t&rhs: " << &rhs 
                );

            // You can only subtract one matrix from another if they both contain elements of the same type.
            COMPILE_TIME_ASSERT((is_same_type<typename LHS::type, typename RHS::type>::value == true));
        }

        const type operator() (
            long r, 
            long c
        ) const { return lhs(r,c) - rhs(r,c); }

        template <typename U, long iNR, long iNC, typename mm >
        bool aliases (
            const matrix<U,iNR,iNC, mm>& item
        ) const { return lhs.aliases(item) || rhs.aliases(item); }

        template <typename U, long iNR, long iNC , typename mm>
        bool destructively_aliases (
            const matrix<U,iNR,iNC,mm>& item
        ) const { return lhs.destructively_aliases(item) || rhs.destructively_aliases(item); }

        const ref_type& ref(
        ) const { return *this; }

        long nr (
        ) const { return lhs.nr(); }

        long nc (
        ) const { return lhs.nc(); }

        const LHS lhs;
        const RHS rhs;
    };

    template <
        typename EXP1,
        typename EXP2
        >
    inline const matrix_exp<matrix_subtract_exp<EXP1, EXP2 > > operator- (
        const matrix_exp<EXP1>& m1,
        const matrix_exp<EXP2>& m2
    )
    {
        typedef matrix_subtract_exp<EXP1, EXP2 >  exp;
        return matrix_exp<exp>(exp(m1.ref(),m2.ref()));
    }

// ----------------------------------------------------------------------------------------

    template <
        typename M,
        typename S
        >
    class matrix_divscal_exp  
    {
        /*!
            REQUIREMENTS ON M 
                - must be a matrix_exp or matrix_ref object (or
                  an object with a compatible interface).

            REQUIREMENTS ON S
                - must be some kind of scalar type
        !*/
    public:
        typedef typename M::type type;
        typedef typename M::mem_manager_type mem_manager_type;
        typedef matrix_divscal_exp ref_type;
        const static long NR = M::NR;
        const static long NC = M::NC;

        matrix_divscal_exp (
            const M& m_,
            const S& s_
        ) :
            m(m_),
            s(s_)
        {}

        const type operator() (
            long r, 
            long c
        ) const { return m(r,c)/s; }

        template <typename U, long iNR, long iNC, typename mm >
        bool aliases (
            const matrix<U,iNR,iNC,mm>& item
        ) const { return m.aliases(item); }

        template <typename U, long iNR, long iNC, typename mm >
        bool destructively_aliases (
            const matrix<U,iNR,iNC,mm>& item
        ) const { return m.destructively_aliases(item); }

        const ref_type& ref(
        ) const { return *this; }

        long nr (
        ) const { return m.nr(); }

        long nc (
        ) const { return m.nc(); }

        const M m;
        const S s;
    };

    template <
        typename EXP,
        typename S 
        >
    inline const matrix_exp<matrix_divscal_exp<matrix_exp<EXP>, S> > operator/ (
        const matrix_exp<EXP>& m,
        const S& s
    )
    {
        typedef matrix_divscal_exp<matrix_exp<EXP>,S >  exp;
        return matrix_exp<exp>(exp(m,s));
    }

// ----------------------------------------------------------------------------------------

    template <
        typename M,
        typename S
        >
    class matrix_mulscal_exp  
    {
        /*!
            REQUIREMENTS ON M 
                - must be a matrix_exp or matrix_ref object (or
                  an object with a compatible interface).

            REQUIREMENTS ON S
                - must be some kind of scalar type
        !*/
    public:
        typedef typename M::type type;
        typedef typename M::mem_manager_type mem_manager_type;
        typedef matrix_mulscal_exp ref_type;
        const static long NR = M::NR;
        const static long NC = M::NC;

        matrix_mulscal_exp (
            const M& m_,
            const S& s_
        ) :
            m(m_),
            s(s_)
        {}

        const type operator() (
            long r, 
            long c
        ) const { return m(r,c)*s; }

        template <typename U, long iNR, long iNC , typename mm>
        bool aliases (
            const matrix<U,iNR,iNC,mm>& item
        ) const { return m.aliases(item); }

        template <typename U, long iNR, long iNC, typename mm >
        bool destructively_aliases (
            const matrix<U,iNR,iNC,mm>& item
        ) const { return m.destructively_aliases(item); }

        const ref_type& ref(
        ) const { return *this; }

        long nr (
        ) const { return m.nr(); }

        long nc (
        ) const { return m.nc(); }

        const M m;
        const S s;
    };

    template <
        typename EXP,
        typename S 
        >
    inline const matrix_exp<matrix_mulscal_exp<matrix_exp<EXP>, S> > operator* (
        const matrix_exp<EXP>& m,
        const S& s
    )
    {
        typedef matrix_mulscal_exp<matrix_exp<EXP>,S >  exp;
        return matrix_exp<exp>(exp(m,s));
    }

    template <
        typename EXP,
        typename S 
        >
    inline const matrix_exp<matrix_mulscal_exp<matrix_exp<EXP>, S> > operator* (
        const S& s,
        const matrix_exp<EXP>& m
    )
    {
        typedef matrix_mulscal_exp<matrix_exp<EXP>,S >  exp;
        return matrix_exp<exp>(exp(m,s));
    }

    template <
        typename EXP 
        >
    inline const matrix_exp<matrix_mulscal_exp<matrix_exp<EXP>, float> > operator/ (
        const matrix_exp<EXP>& m,
        const float& s
    )
    {
        typedef matrix_mulscal_exp<matrix_exp<EXP>,float >  exp;
        return matrix_exp<exp>(exp(m,1.0f/s));
    }

    template <
        typename EXP
        >
    inline const matrix_exp<matrix_mulscal_exp<matrix_exp<EXP>, double> > operator/ (
        const matrix_exp<EXP>& m,
        const double& s
    )
    {
        typedef matrix_mulscal_exp<matrix_exp<EXP>,double >  exp;
        return matrix_exp<exp>(exp(m,1.0/s));
    }

    template <
        typename EXP
        >
    inline const matrix_exp<matrix_mulscal_exp<matrix_exp<EXP>, long double> > operator/ (
        const matrix_exp<EXP>& m,
        const long double& s
    )
    {
        typedef matrix_mulscal_exp<matrix_exp<EXP>,long double >  exp;
        return matrix_exp<exp>(exp(m,1.0/s));
    }

    template <
        typename EXP
        >
    inline const matrix_exp<matrix_mulscal_exp<matrix_exp<EXP>, int> > operator- (
        const matrix_exp<EXP>& m
    )
    {
        typedef matrix_mulscal_exp<matrix_exp<EXP>,int >  exp;
        return matrix_exp<exp>(exp(m,-1));
    }

// ----------------------------------------------------------------------------------------

    template <
        typename EXP1,
        typename EXP2
        >
    bool operator== (
        const matrix_exp<EXP1>& m1,
        const matrix_exp<EXP2>& m2
    )
    {
        if (m1.nr() == m2.nr() && m1.nc() == m2.nc())
        {
            for (long r = 0; r < m1.nr(); ++r)
            {
                for (long c = 0; c < m1.nc(); ++c)
                {
                    if (m1(r,c) != m2(r,c))
                        return false;
                }
            }
            return true;
        }
        return false;
    }

    template <
        typename EXP1,
        typename EXP2
        >
    inline bool operator!= (
        const matrix_exp<EXP1>& m1,
        const matrix_exp<EXP2>& m2
    ) { return !(m1 == m2); }

// ----------------------------------------------------------------------------------------

        template <
            typename matrix_dest_type,
            typename src_exp 
            >
        void matrix_assign (
            matrix_dest_type& dest,
            const matrix_exp<src_exp>& src,
            const long row_offset = 0,
            const long col_offset = 0
        )
        /*!
            requires
                - src.destructively_aliases(dest) == false
                - dest.nr() == src.nr()-row_offset
                - dest.nc() == src.nc()-col_offset
            ensures
                - #subm(dest, row_offset, col_offset, src.nr(), src.nc()) == src
                - the part of dest outside the above sub matrix remains unchanged
        !*/
        {
            for (long r = 0; r < src.nr(); ++r)
            {
                for (long c = 0; c < src.nc(); ++c)
                {
                    dest(r+row_offset,c+col_offset) = src(r,c);
                }
            }
        }

// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------

    template <
        typename T,
        long num_rows,
        long num_cols,
        typename mem_manager 
        >
    class matrix : public matrix_exp<matrix_ref<T,num_rows,num_cols, mem_manager> > 
    {

        COMPILE_TIME_ASSERT(num_rows >= 0 && num_cols >= 0); 

    public:
        typedef T type;
        typedef matrix_ref<T,num_rows,num_cols,mem_manager> ref_type;
        typedef mem_manager mem_manager_type;
        const static long NR = num_rows;
        const static long NC = num_cols;

        matrix () : matrix_exp<matrix_ref<T,num_rows,num_cols, mem_manager> >(ref_type(*this)) 
        {
        }

        explicit matrix (
            long length 
        ) : matrix_exp<matrix_ref<T,num_rows,num_cols, mem_manager> >(ref_type(*this)) 
        {
            // This object you are trying to call matrix(length) on is not a column or 
            // row vector.
            COMPILE_TIME_ASSERT(NR == 1 || NC == 1);
            DLIB_ASSERT( length >= 0, 
                "\tmatrix::matrix(length)"
                << "\n\tlength must be at least 0"
                << "\n\tlength: " << length 
                << "\n\tNR:     " << NR 
                << "\n\tNC:     " << NC 
                << "\n\tthis:   " << this
                );

            if (NR == 1)
            {
                DLIB_ASSERT(NC == 0 || NC == length,
                    "\tmatrix::matrix(length)"
                    << "\n\tSince this is a statically sized matrix length must equal NC"
                    << "\n\tlength: " << length 
                    << "\n\tNR:     " << NR 
                    << "\n\tNC:     " << NC 
                    << "\n\tthis:   " << this
                    );

                data.set_size(1,length);
            }
            else
            {
                DLIB_ASSERT(NR == 0 || NR == length,
                    "\tvoid matrix::set_size(length)"
                    << "\n\tSince this is a statically sized matrix length must equal NR"
                    << "\n\tlength: " << length 
                    << "\n\tNR:     " << NR 
                    << "\n\tNC:     " << NC 
                    << "\n\tthis:   " << this
                    );

                data.set_size(length,1);
            }
        }

        matrix (
            long rows,
            long cols 
        ) : matrix_exp<matrix_ref<T,num_rows,num_cols, mem_manager> >(ref_type(*this)) 
        {
            DLIB_ASSERT( (NR == 0 || NR == rows) && ( NC == 0 || NC == cols) && 
                    rows >= 0 && cols >= 0, 
                "\tvoid matrix::matrix(rows, cols)"
                << "\n\tYou have supplied conflicting matrix dimensions"
                << "\n\trows: " << rows
                << "\n\tcols: " << cols
                << "\n\tNR:   " << NR 
                << "\n\tNC:   " << NC 
                );
            data.set_size(rows,cols);
        }

        template <typename EXP>
        matrix (
            const matrix_exp<EXP>& m
        ): matrix_exp<matrix_ref<T,num_rows,num_cols, mem_manager> >(ref_type(*this)) 
        {
            // You get an error on this line if the matrix m contains a type that isn't
            // the same as the type contained in the target matrix.
            COMPILE_TIME_ASSERT((is_same_type<typename EXP::type,type>::value == true) ||
                                (is_matrix<typename EXP::type>::value == true));

            // The matrix you are trying to assign m to is a statically sized matrix and 
            // m's dimensions don't match that of *this. 
            COMPILE_TIME_ASSERT(EXP::NR == NR || NR == 0 || EXP::NR == 0);
            COMPILE_TIME_ASSERT(EXP::NC == NC || NC == 0 || EXP::NC == 0);
            DLIB_ASSERT((NR == 0 || NR == m.nr()) && (NC == 0 || NC == m.nc()), 
                "\tmatrix& matrix::matrix(const matrix_exp& m)"
                << "\n\tYou are trying to assign a dynamically sized matrix to a statically sized matrix with the wrong size"
                << "\n\tNR:     " << NR
                << "\n\tNC:     " << NC
                << "\n\tm.nr(): " << m.nr()
                << "\n\tm.nc(): " << m.nc()
                << "\n\tthis:   " << this
                );

            data.set_size(m.nr(),m.nc());

            matrix_assign(*this, m);
        }

        matrix (
            const matrix& m
        ): matrix_exp<matrix_ref<T,num_rows,num_cols, mem_manager> >(ref_type(*this)) 
        {
            data.set_size(m.nr(),m.nc());
            matrix_assign(*this, m);
        }

        template <typename U, size_t len>
        matrix (
            U (&array)[len]
        ): matrix_exp<matrix_ref<T,num_rows,num_cols, mem_manager> >(ref_type(*this)) 
        {
            COMPILE_TIME_ASSERT(NR*NC == len && len > 0);
            size_t idx = 0;
            for (long r = 0; r < NR; ++r)
            {
                for (long c = 0; c < NC; ++c)
                {
                    data(r,c) = static_cast<T>(array[idx]);
                    ++idx;
                }
            }
        }

        T& operator() (
            long r, 
            long c
        ) 
        { 
            DLIB_ASSERT(r < nr() && c < nc() &&
                   r >= 0 && c >= 0, 
                "\tT& matrix::operator(r,c)"
                << "\n\tYou must give a valid row and column"
                << "\n\tr:    " << r 
                << "\n\tc:    " << c
                << "\n\tnr(): " << nr()
                << "\n\tnc(): " << nc() 
                << "\n\tthis: " << this
                );
            return data(r,c); 
        }

        const T& operator() (
            long r, 
            long c
        ) const 
        { 
            DLIB_ASSERT(r < nr() && c < nc() &&
                   r >= 0 && c >= 0, 
                "\tconst T& matrix::operator(r,c)"
                << "\n\tYou must give a valid row and column"
                << "\n\tr:    " << r 
                << "\n\tc:    " << c
                << "\n\tnr(): " << nr()
                << "\n\tnc(): " << nc() 
                << "\n\tthis: " << this
                );
            return data(r,c);
        }

        T& operator() (
            long i
        ) 
        {
            // You can only use this operator on column vectors.
            COMPILE_TIME_ASSERT(NC == 1 || NC == 0 || NR == 1 || NR == 0);
            DLIB_ASSERT(nc() == 1 || nr() == 1, 
                "\tconst type matrix::operator(i)"
                << "\n\tYou can only use this operator on column or row vectors"
                << "\n\ti:    " << i
                << "\n\tnr(): " << nr()
                << "\n\tnc(): " << nc()
                << "\n\tthis: " << this
                );
            DLIB_ASSERT( ((nc() == 1 && i < nr()) || (nr() == 1 && i < nc())) && i >= 0, 
                "\tconst type matrix::operator(i)"
                << "\n\tYou must give a valid row/column number"
                << "\n\ti:    " << i
                << "\n\tnr(): " << nr()
                << "\n\tnc(): " << nc()
                << "\n\tthis: " << this
                );
            return data(i);
        }

        const T& operator() (
            long i
        ) const
        {
            // You can only use this operator on column vectors.
            COMPILE_TIME_ASSERT(NC == 1 || NC == 0 || NR == 1 || NR == 0);
            DLIB_ASSERT(nc() == 1 || nr() == 1, 
                "\tconst type matrix::operator(i)"
                << "\n\tYou can only use this operator on column or row vectors"
                << "\n\ti:    " << i
                << "\n\tnr(): " << nr()
                << "\n\tnc(): " << nc()
                << "\n\tthis: " << this
                );
            DLIB_ASSERT( ((nc() == 1 && i < nr()) || (nr() == 1 && i < nc())) && i >= 0, 
                "\tconst type matrix::operator(i)"
                << "\n\tYou must give a valid row/column number"
                << "\n\ti:    " << i
                << "\n\tnr(): " << nr()
                << "\n\tnc(): " << nc()
                << "\n\tthis: " << this
                );
            return data(i);
        }

        inline operator const type (
        ) const 
        {
            COMPILE_TIME_ASSERT(NC == 1 || NC == 0);
            COMPILE_TIME_ASSERT(NR == 1 || NR == 0);
            DLIB_ASSERT( nr() == 1 && nc() == 1 , 
                "\tmatrix::operator const type"
                << "\n\tYou can only attempt to implicit convert a matrix to a scalar if"
                << "\n\tthe matrix is a 1x1 matrix"
                << "\n\tnr(): " << nr() 
                << "\n\tnc(): " << nc() 
                << "\n\tthis: " << this
                );
            return data(0);
        }

        void set_size (
            long rows,
            long cols
        )
        {
            DLIB_ASSERT( (NR == 0 || NR == rows) && ( NC == 0 || NC == cols) &&
                    rows >= 0 && cols >= 0, 
                "\tvoid matrix::set_size(rows, cols)"
                << "\n\tYou have supplied conflicting matrix dimensions"
                << "\n\trows: " << rows
                << "\n\tcols: " << cols
                << "\n\tNR:   " << NR 
                << "\n\tNC:   " << NC 
                << "\n\tthis: " << this
                );
            if (nr() != rows || nc() != cols)
                data.set_size(rows,cols);
        }

        void set_size (
            long length
        )
        {
            // This object you are trying to call set_size(length) on is not a column or 
            // row vector.
            COMPILE_TIME_ASSERT(NR == 1 || NC == 1);
            DLIB_ASSERT( length >= 0, 
                "\tvoid matrix::set_size(length)"
                << "\n\tlength must be at least 0"
                << "\n\tlength: " << length 
                << "\n\tNR:     " << NR 
                << "\n\tNC:     " << NC 
                << "\n\tthis:   " << this
                );

            if (NR == 1)
            {
                DLIB_ASSERT(NC == 0 || NC == length,
                    "\tvoid matrix::set_size(length)"
                    << "\n\tSince this is a statically sized matrix length must equal NC"
                    << "\n\tlength: " << length 
                    << "\n\tNR:     " << NR 
                    << "\n\tNC:     " << NC 
                    << "\n\tthis:   " << this
                    );

                if (nc() != length)
                    data.set_size(1,length);
            }
            else
            {
                DLIB_ASSERT(NR == 0 || NR == length,
                    "\tvoid matrix::set_size(length)"
                    << "\n\tSince this is a statically sized matrix length must equal NR"
                    << "\n\tlength: " << length 
                    << "\n\tNR:     " << NR 
                    << "\n\tNC:     " << NC 
                    << "\n\tthis:   " << this
                    );

                if (nr() != length)
                    data.set_size(length,1);
            }
        }

        long nr (
        ) const { return data.nr(); }

        long nc (
        ) const { return data.nc(); }

        long size (
        ) const { return data.nr()*data.nc(); }

        template <typename U, size_t len>
        matrix& operator= (
            U (&array)[len]
        )
        {
            COMPILE_TIME_ASSERT(NR*NC == len && len > 0);
            size_t idx = 0;
            for (long r = 0; r < NR; ++r)
            {
                for (long c = 0; c < NC; ++c)
                {
                    data(r,c) = static_cast<T>(array[idx]);
                    ++idx;
                }
            }
            return *this;
        }

        template <typename EXP>
        matrix& operator= (
            const matrix_exp<EXP>& m
        )
        {
            // You get an error on this line if the matrix you are trying to 
            // assign m to is a statically sized matrix and  m's dimensions don't 
            // match that of *this. 
            COMPILE_TIME_ASSERT(EXP::NR == NR || NR == 0 || EXP::NR == 0);
            COMPILE_TIME_ASSERT(EXP::NC == NC || NC == 0 || EXP::NC == 0);
            DLIB_ASSERT((NR == 0 || nr() == m.nr()) && 
                   (NC == 0 || nc() == m.nc()), 
                "\tmatrix& matrix::operator=(const matrix_exp& m)"
                << "\n\tYou are trying to assign a dynamically sized matrix to a statically sized matrix with the wrong size"
                << "\n\tnr():   " << nr()
                << "\n\tnc():   " << nc()
                << "\n\tm.nr(): " << m.nr()
                << "\n\tm.nc(): " << m.nc()
                << "\n\tthis:   " << this
                );

            // You get an error on this line if the matrix m contains a type that isn't
            // the same as the type contained in the target matrix.
            COMPILE_TIME_ASSERT((is_same_type<typename EXP::type,type>::value == true) ||
                                (is_matrix<typename EXP::type>::value == true));
            if (m.destructively_aliases(*this) == false)
            {
                set_size(m.nr(),m.nc());
                matrix_assign(*this, m);
            }
            else
            {
                // we have to use a temporary matrix object here because
                // *this is aliased inside the matrix_exp m somewhere.
                matrix temp;
                temp.set_size(m.nr(),m.nc());
                matrix_assign(temp, m);
                temp.swap(*this);
            }
            return *this;
        }

        template <typename EXP>
        matrix& operator += (
            const matrix_exp<EXP>& m
        )
        {
            // The matrix you are trying to assign m to is a statically sized matrix and 
            // m's dimensions don't match that of *this. 
            COMPILE_TIME_ASSERT(EXP::NR == NR || NR == 0 || EXP::NR == 0);
            COMPILE_TIME_ASSERT(EXP::NC == NC || NC == 0 || EXP::NC == 0);
            DLIB_ASSERT(this->nr() == m.nr() && this->nc() == m.nc(), 
                "\tmatrix& matrix::operator+=(const matrix_exp& m)"
                << "\n\tYou are trying to add a dynamically sized matrix to a statically sized matrix with the wrong size"
                << "\n\tthis->nr(): " << nr()
                << "\n\tthis->nc(): " << nc()
                << "\n\tm.nr():     " << m.nr()
                << "\n\tm.nc():     " << m.nc()
                << "\n\tthis:       " << this
                );
            COMPILE_TIME_ASSERT((is_same_type<typename EXP::type,type>::value == true));
            if (m.destructively_aliases(*this) == false)
            {
                matrix_assign(*this, m + *this);
            }
            else
            {
                // we have to use a temporary matrix_data object here because
                // this->data is aliased inside the matrix_exp m somewhere.
                matrix temp;
                temp.set_size(m.nr(),m.nc());
                matrix_assign(temp, m + *this);
                temp.swap(*this);
            }
            return *this;
        }


        template <typename EXP>
        matrix& operator -= (
            const matrix_exp<EXP>& m
        )
        {
            // The matrix you are trying to assign m to is a statically sized matrix and 
            // m's dimensions don't match that of *this. 
            COMPILE_TIME_ASSERT(EXP::NR == NR || NR == 0 || EXP::NR == 0);
            COMPILE_TIME_ASSERT(EXP::NC == NC || NC == 0 || EXP::NC == 0);
            DLIB_ASSERT(this->nr() == m.nr() && this->nc() == m.nc(), 
                "\tmatrix& matrix::operator-=(const matrix_exp& m)"
                << "\n\tYou are trying to subtract a dynamically sized matrix from a statically sized matrix with the wrong size"
                << "\n\tthis->nr(): " << nr()
                << "\n\tthis->nc(): " << nc()
                << "\n\tm.nr():     " << m.nr()
                << "\n\tm.nc():     " << m.nc()
                << "\n\tthis:       " << this
                );
            COMPILE_TIME_ASSERT((is_same_type<typename EXP::type,type>::value == true));
            if (m.destructively_aliases(*this) == false)
            {
                matrix_assign(*this, *this - m);
            }
            else
            {
                // we have to use a temporary matrix_data object here because
                // this->data is aliased inside the matrix_exp m somewhere.
                matrix temp;
                temp.set_size(m.nr(),m.nc());
                matrix_assign(temp, *this - m);
                temp.swap(*this);
            }
            return *this;
        }

        matrix& operator += (
            const matrix& m
        )
        {
            const long size = m.nr()*m.nc();
            for (long i = 0; i < size; ++i)
                data(i) += m.data(i);
            return *this;
        }

        matrix& operator -= (
            const matrix& m
        )
        {
            const long size = m.nr()*m.nc();
            for (long i = 0; i < size; ++i)
                data(i) -= m.data(i);
            return *this;
        }

        matrix& operator *= (
            const T& a
        )
        {
            const long size = data.nr()*data.nc();
            for (long i = 0; i < size; ++i)
                data(i) *= a;
            return *this;
        }

        matrix& operator /= (
            const T& a
        )
        {
            const long size = data.nr()*data.nc();
            for (long i = 0; i < size; ++i)
                data(i) /= a;
            return *this;
        }

        matrix& operator= (
            const matrix& m
        )
        {
            if (this != &m)
            {
                set_size(m.nr(),m.nc());
                const long size = m.nr()*m.nc();
                for (long i = 0; i < size; ++i)
                    data(i) = m.data(i);
            }
            return *this;
        }

        void swap (
            matrix& item
        )
        {
            data.swap(item.data);
        }

    private:
        matrix_data<T,NR,NC, mem_manager> data;
    };

// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------


    template <
        typename T,
        long NR,
        long NC,
        typename mm
        >
    void swap(
        matrix<T,NR,NC,mm>& a,
        matrix<T,NR,NC,mm>& b
    ) { a.swap(b); }

    template <
        typename T,
        long NR,
        long NC,
        typename mm
        >
    void serialize (
        const matrix<T,NR,NC,mm>& item, 
        std::ostream& out
    )
    {
        try
        {
            serialize(item.nr(),out);
            serialize(item.nc(),out);
            for (long r = 0; r < item.nr(); ++r)
            {
                for (long c = 0; c < item.nc(); ++c)
                {
                    serialize(item(r,c),out);
                }
            }
        }
        catch (serialization_error& e)
        {
            throw serialization_error(e.info + "\n   while serializing dlib::matrix");
        }
    }

    template <
        typename T,
        long NR,
        long NC,
        typename mm
        >
    void deserialize (
        matrix<T,NR,NC,mm>& item, 
        std::istream& in
    )
    {
        try
        {
            long nr, nc;
            deserialize(nr,in); 
            deserialize(nc,in); 

            if (NR != 0 && nr != NR)
                throw serialization_error("Error while deserializing a dlib::matrix.  Invalid rows");
            if (NC != 0 && nc != NC)
                throw serialization_error("Error while deserializing a dlib::matrix.  Invalid columns");

            item.set_size(nr,nc);
            for (long r = 0; r < nr; ++r)
            {
                for (long c = 0; c < nc; ++c)
                {
                    deserialize(item(r,c),in);
                }
            }
        }
        catch (serialization_error& e)
        {
            throw serialization_error(e.info + "\n   while deserializing a dlib::matrix");
        }
    }

    template <
        typename EXP
        >
    std::ostream& operator<< (
        std::ostream& out,
        const matrix_exp<EXP>& m
    )
    {
        using namespace std;
        const streamsize old = out.width();

        // first figure out how wide we should make each field
        string::size_type w = 0;
        ostringstream sout;
        for (long r = 0; r < m.nr(); ++r)
        {
            for (long c = 0; c < m.nc(); ++c)
            {
                sout << m(r,c); 
                w = std::max(sout.str().size(),w);
                sout.str("");
            }
        }

        // now actually print it
        for (long r = 0; r < m.nr(); ++r)
        {
            for (long c = 0; c < m.nc(); ++c)
            {
                out.width(static_cast<streamsize>(w));
                out << m(r,c) << " ";
            }
            out << "\n";
        }
        out.width(old);
        return out;
    }

// ----------------------------------------------------------------------------------------

}

#ifdef _MSC_VER
// put that warning back to its default setting
#pragma warning(default : 4355)
#endif

#endif // DLIB_MATRIx_

