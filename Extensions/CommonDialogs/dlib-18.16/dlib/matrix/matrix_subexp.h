// Copyright (C) 2006  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#ifndef DLIB_MATRIx_SUBEXP_
#define DLIB_MATRIx_SUBEXP_

#include "matrix_subexp_abstract.h"
#include "matrix_op.h"
#include "matrix.h"
#include "../geometry/rectangle.h"
#include "matrix_expressions.h"



namespace dlib
{

// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------
    
    template <long start, long inc, long end>
    const matrix_range_static_exp<start,inc,end> range (
    ) 
    { 
        COMPILE_TIME_ASSERT(inc > 0);
        return matrix_range_static_exp<start,inc,end>(); 
    }

    template <long start, long end>
    const matrix_range_static_exp<start,1,end> range (
    ) 
    { 
        return matrix_range_static_exp<start,1,end>(); 
    }

    inline const matrix_range_exp<long> range (
        long start,
        long end
    ) 
    { 
        return matrix_range_exp<long>(start,end); 
    }

    inline const matrix_range_exp<long> range (
        long start,
        long inc,
        long end
    ) 
    { 
        DLIB_ASSERT(inc > 0, 
            "\tconst matrix_exp range(start, inc, end)"
            << "\n\tInvalid inputs to this function"
            << "\n\tstart: " << start 
            << "\n\tinc:   " << inc
            << "\n\tend:   " << end
            );

        return matrix_range_exp<long>(start,inc,end); 
    }

// ----------------------------------------------------------------------------------------

    template <typename M>
    struct op_subm 
    {
        op_subm (
            const M& m_x,
            const long& r_x,
            const long& c_x,
            const long& nr_x,
            const long& nc_x
        ) : m(m_x), r_(r_x), c_(c_x), nr_(nr_x), nc_(nc_x) { }

        const M& m;
        const long r_;
        const long c_;
        const long nr_;
        const long nc_;

        const static long cost = M::cost+1;
        typedef typename M::type type;
        typedef typename M::const_ret_type const_ret_type;
        typedef typename M::mem_manager_type mem_manager_type;
        typedef typename M::layout_type layout_type;
        const static long NR = 0;
        const static long NC = 0;

        const_ret_type apply ( long r, long c) const { return m(r+r_,c+c_); }

        long nr () const { return nr_; }
        long nc () const { return nc_; }

        template <typename U> bool aliases               ( const matrix_exp<U>& item) const { return m.aliases(item); } 
        template <typename U> bool destructively_aliases ( const matrix_exp<U>& item) const { return m.aliases(item); }
    };

    template <
        typename EXP
        >
    const matrix_op<op_subm<EXP> > subm (
        const matrix_exp<EXP>& m,
        long r, 
        long c,
        long nr,
        long nc
    )
    {
        DLIB_ASSERT(r >= 0 && c >= 0 && nr >= 0 && nc >= 0 && r+nr <= m.nr() && c+nc <= m.nc(), 
            "\tconst matrix_exp subm(const matrix_exp& m, r, c, nr, nc)"
            << "\n\tYou have specified invalid sub matrix dimensions"
            << "\n\tm.nr(): " << m.nr()
            << "\n\tm.nc(): " << m.nc() 
            << "\n\tr:      " << r 
            << "\n\tc:      " << c 
            << "\n\tnr:     " << nr 
            << "\n\tnc:     " << nc 
            );

        typedef op_subm<EXP> op;
        return matrix_op<op>(op(m.ref(),r,c,nr,nc));
    }

// ----------------------------------------------------------------------------------------

    template <
        typename EXP
        >
    const matrix_op<op_subm<EXP> > subm (
        const matrix_exp<EXP>& m,
        const rectangle& rect
    )
    {
        DLIB_ASSERT(get_rect(m).contains(rect) == true, 
            "\tconst matrix_exp subm(const matrix_exp& m, const rectangle& rect)"
            << "\n\tYou have specified invalid sub matrix dimensions"
            << "\n\tm.nr(): " << m.nr()
            << "\n\tm.nc(): " << m.nc() 
            << "\n\trect.left():   " << rect.left()
            << "\n\trect.top():    " << rect.top()
            << "\n\trect.right():  " << rect.right()
            << "\n\trect.bottom(): " << rect.bottom()
            );

        typedef op_subm<EXP> op;
        return matrix_op<op>(op(m.ref(),rect.top(),rect.left(),rect.height(),rect.width()));
    }

// ----------------------------------------------------------------------------------------

    template <typename M1, typename M2, typename M3>
    struct op_subm_range 
    {
        op_subm_range( const M1& m1_, const M2& rows_, const M3& cols_) : 
            m1(m1_), rows(rows_), cols(cols_) {}
        const M1& m1;
        const M2& rows;
        const M3& cols;

        const static long cost = M1::cost+M2::cost+M3::cost;
        typedef typename M1::type type;
        typedef typename M1::const_ret_type const_ret_type;
        typedef typename M1::mem_manager_type mem_manager_type;
        typedef typename M1::layout_type layout_type;
        const static long NR = M2::NC*M2::NR;
        const static long NC = M3::NC*M3::NR;

        const_ret_type apply ( long r, long c) const { return m1(rows(r),cols(c)); }

        long nr () const { return rows.size(); }
        long nc () const { return cols.size(); }

        template <typename U> bool aliases               ( const matrix_exp<U>& item) const 
        { return m1.aliases(item) || rows.aliases(item) || cols.aliases(item); }
        template <typename U> bool destructively_aliases ( const matrix_exp<U>& item) const 
        { return m1.aliases(item) || rows.aliases(item) || cols.aliases(item); }
    };

    template <
        typename EXP,
        typename EXPr,
        typename EXPc
        >
    const matrix_op<op_subm_range<EXP,EXPr,EXPc> > subm (
        const matrix_exp<EXP>& m,
        const matrix_exp<EXPr>& rows,
        const matrix_exp<EXPc>& cols
    )
    {
        // the rows and cols matrices must contain integer elements 
        COMPILE_TIME_ASSERT(std::numeric_limits<typename EXPr::type>::is_integer);
        COMPILE_TIME_ASSERT(std::numeric_limits<typename EXPc::type>::is_integer);

        DLIB_ASSERT(0 <= min(rows) && max(rows) < m.nr() && 0 <= min(cols) && max(cols) < m.nc() &&
                    (rows.nr() == 1 || rows.nc() == 1) && (cols.nr() == 1 || cols.nc() == 1), 
            "\tconst matrix_exp subm(const matrix_exp& m, const matrix_exp& rows, const matrix_exp& cols)"
            << "\n\tYou have given invalid arguments to this function"
            << "\n\tm.nr():     " << m.nr()
            << "\n\tm.nc():     " << m.nc() 
            << "\n\tmin(rows):  " << min(rows) 
            << "\n\tmax(rows):  " << max(rows) 
            << "\n\tmin(cols):  " << min(cols) 
            << "\n\tmax(cols):  " << max(cols) 
            << "\n\trows.nr():  " << rows.nr()
            << "\n\trows.nc():  " << rows.nc()
            << "\n\tcols.nr():  " << cols.nr()
            << "\n\tcols.nc():  " << cols.nc()
            );

        typedef op_subm_range<EXP,EXPr,EXPc> op;
        return matrix_op<op>(op(m.ref(),rows.ref(),cols.ref()));
    }

// ----------------------------------------------------------------------------------------

    template <typename M>
    struct op_rowm 
    {
        op_rowm(const M& m_, const long& row_) : m(m_), row(row_) {}
        const M& m;
        const long row;

        const static long cost = M::cost;
        const static long NR = 1;
        const static long NC = M::NC;
        typedef typename M::type type;
        typedef typename M::const_ret_type const_ret_type;
        typedef typename M::mem_manager_type mem_manager_type;
        typedef typename M::layout_type layout_type;
        const_ret_type apply ( long, long c) const { return m(row,c); }

        long nr () const { return 1; }
        long nc () const { return m.nc(); }

        template <typename U> bool aliases               ( const matrix_exp<U>& item) const { return m.aliases(item); }
        template <typename U> bool destructively_aliases ( const matrix_exp<U>& item) const { return m.aliases(item); }
    };

    template <
        typename EXP
        >
    const matrix_op<op_rowm<EXP> > rowm (
        const matrix_exp<EXP>& m,
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

        typedef op_rowm<EXP> op;
        return matrix_op<op>(op(m.ref(),row));
    }

    template <typename EXP>
    struct rowm_exp
    {
        typedef matrix_op<op_rowm<EXP> > type;
    };

// ----------------------------------------------------------------------------------------

    template <typename M>
    struct op_rowm2 
    {
        op_rowm2(const M& m_, const long& row_, const long& len) : m(m_), row(row_), length(len) {}
        const M& m;
        const long row;
        const long length;

        const static long cost = M::cost;
        const static long NR = 1;
        const static long NC = 0;
        typedef typename M::type type;
        typedef typename M::const_ret_type const_ret_type;
        typedef typename M::mem_manager_type mem_manager_type;
        typedef typename M::layout_type layout_type;
        const_ret_type apply ( long , long c) const { return m(row,c); }

        long nr () const { return 1; }
        long nc () const { return length; }

        template <typename U> bool aliases               ( const matrix_exp<U>& item) const { return m.aliases(item); }
        template <typename U> bool destructively_aliases ( const matrix_exp<U>& item) const { return m.aliases(item); }
    };

    template <
        typename EXP
        >
    const matrix_op<op_rowm2<EXP> > rowm (
        const matrix_exp<EXP>& m,
        long row,
        long length
    )
    {
        DLIB_ASSERT(row >= 0 && row < m.nr() && 
                    length >= 0 && length <= m.nc(), 
            "\tconst matrix_exp rowm(const matrix_exp& m, row, length)"
            << "\n\tYou have specified invalid sub matrix dimensions"
            << "\n\tm.nr(): " << m.nr()
            << "\n\tm.nc(): " << m.nc() 
            << "\n\trow:    " << row 
            << "\n\tlength: " << length 
            );

        typedef op_rowm2<EXP> op;
        return matrix_op<op>(op(m.ref(), row, length));
    }

// ----------------------------------------------------------------------------------------

    template <typename M1, typename M2>
    struct op_rowm_range 
    {
        op_rowm_range( const M1& m1_, const M2& rows_) : m1(m1_), rows(rows_) {}
        const M1& m1;
        const M2& rows;

        const static long cost = M1::cost+M2::cost;
        typedef typename M1::type type;
        typedef typename M1::const_ret_type const_ret_type;
        typedef typename M1::mem_manager_type mem_manager_type;
        typedef typename M1::layout_type layout_type;
        const static long NR = M2::NC*M2::NR;
        const static long NC = M1::NC;

        const_ret_type apply ( long r, long c) const { return m1(rows(r),c); }

        long nr () const { return rows.size(); }
        long nc () const { return m1.nc(); }

        template <typename U> bool aliases               ( const matrix_exp<U>& item) const 
        { return m1.aliases(item) || rows.aliases(item); }
        template <typename U> bool destructively_aliases ( const matrix_exp<U>& item) const 
        { return m1.aliases(item) || rows.aliases(item); }
    };

    template <
        typename EXP1,
        typename EXP2
        >
    const matrix_op<op_rowm_range<EXP1,EXP2> > rowm (
        const matrix_exp<EXP1>& m,
        const matrix_exp<EXP2>& rows
    )
    {
        // the rows matrix must contain integer elements 
        COMPILE_TIME_ASSERT(std::numeric_limits<typename EXP2::type>::is_integer);

        DLIB_ASSERT(0 <= min(rows) && max(rows) < m.nr() && (rows.nr() == 1 || rows.nc() == 1), 
            "\tconst matrix_exp rowm(const matrix_exp& m, const matrix_exp& rows)"
            << "\n\tYou have given invalid arguments to this function"
            << "\n\tm.nr():     " << m.nr()
            << "\n\tm.nc():     " << m.nc() 
            << "\n\tmin(rows):  " << min(rows) 
            << "\n\tmax(rows):  " << max(rows) 
            << "\n\trows.nr():  " << rows.nr()
            << "\n\trows.nc():  " << rows.nc()
            );

        typedef op_rowm_range<EXP1,EXP2> op;
        return matrix_op<op>(op(m.ref(),rows.ref()));
    }

// ----------------------------------------------------------------------------------------

    template <typename M>
    struct op_colm 
    {
        op_colm(const M& m_, const long& col_) : m(m_), col(col_) {}
        const M& m;
        const long col;

        const static long cost = M::cost;
        const static long NR = M::NR;
        const static long NC = 1;
        typedef typename M::type type;
        typedef typename M::const_ret_type const_ret_type;
        typedef typename M::mem_manager_type mem_manager_type;
        typedef typename M::layout_type layout_type;
        const_ret_type apply ( long r, long) const { return m(r,col); }

        long nr () const { return m.nr(); }
        long nc () const { return 1; }

        template <typename U> bool aliases               ( const matrix_exp<U>& item) const { return m.aliases(item); }
        template <typename U> bool destructively_aliases ( const matrix_exp<U>& item) const { return m.aliases(item); }
    };

    template <
        typename EXP
        >
    const matrix_op<op_colm<EXP> > colm (
        const matrix_exp<EXP>& m,
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

        typedef op_colm<EXP> op;
        return matrix_op<op>(op(m.ref(),col));
    }

    template <typename EXP>
    struct colm_exp
    {
        typedef matrix_op<op_colm<EXP> > type;
    };

// ----------------------------------------------------------------------------------------

    template <typename M>
    struct op_colm2 
    {
        op_colm2(const M& m_, const long& col_, const long& len) : m(m_), col(col_), length(len) {}
        const M& m;
        const long col;
        const long length;

        const static long cost = M::cost;
        const static long NR = 0;
        const static long NC = 1;
        typedef typename M::type type;
        typedef typename M::const_ret_type const_ret_type;
        typedef typename M::mem_manager_type mem_manager_type;
        typedef typename M::layout_type layout_type;
        const_ret_type apply ( long r, long ) const { return m(r,col); }

        long nr () const { return length; }
        long nc () const { return 1; }

        template <typename U> bool aliases               ( const matrix_exp<U>& item) const { return m.aliases(item); }
        template <typename U> bool destructively_aliases ( const matrix_exp<U>& item) const { return m.aliases(item); }
    };

    template <
        typename EXP
        >
    const matrix_op<op_colm2<EXP> > colm (
        const matrix_exp<EXP>& m,
        long col,
        long length
    )
    {
        DLIB_ASSERT(col >= 0 && col < m.nc() && 
                    length >= 0 && length <= m.nr(), 
            "\tconst matrix_exp colm(const matrix_exp& m, col, length)"
            << "\n\tYou have specified invalid sub matrix dimensions"
            << "\n\tm.nr(): " << m.nr()
            << "\n\tm.nc(): " << m.nc() 
            << "\n\tcol:    " << col 
            << "\n\tlength: " << length 
            );

        typedef op_colm2<EXP> op;
        return matrix_op<op>(op(m.ref(),col, length));
    }

// ----------------------------------------------------------------------------------------

    template <typename M1, typename M2>
    struct op_colm_range 
    {
        op_colm_range( const M1& m1_, const M2& cols_) : m1(m1_), cols(cols_) {}
        const M1& m1;
        const M2& cols;

        typedef typename M1::type type;
        typedef typename M1::const_ret_type const_ret_type;
        typedef typename M1::mem_manager_type mem_manager_type;
        typedef typename M1::layout_type layout_type;
        const static long NR = M1::NR;
        const static long NC = M2::NC*M2::NR;
        const static long cost = M1::cost+M2::cost;

        const_ret_type apply (long r, long c) const { return m1(r,cols(c)); }

        long nr () const { return m1.nr(); }
        long nc () const { return cols.size(); }

        template <typename U> bool aliases               ( const matrix_exp<U>& item) const 
        { return m1.aliases(item) || cols.aliases(item); }
        template <typename U> bool destructively_aliases ( const matrix_exp<U>& item) const 
        { return m1.aliases(item) || cols.aliases(item); }
    };

    template <
        typename EXP1,
        typename EXP2
        >
    const matrix_op<op_colm_range<EXP1,EXP2> > colm (
        const matrix_exp<EXP1>& m,
        const matrix_exp<EXP2>& cols
    )
    {
        // the rows matrix must contain integer elements 
        COMPILE_TIME_ASSERT(std::numeric_limits<typename EXP2::type>::is_integer);

        DLIB_ASSERT(0 <= min(cols) && max(cols) < m.nc() && (cols.nr() == 1 || cols.nc() == 1), 
            "\tconst matrix_exp colm(const matrix_exp& m, const matrix_exp& cols)"
            << "\n\tYou have given invalid arguments to this function"
            << "\n\tm.nr():     " << m.nr()
            << "\n\tm.nc():     " << m.nc() 
            << "\n\tmin(cols):  " << min(cols) 
            << "\n\tmax(cols):  " << max(cols) 
            << "\n\tcols.nr():  " << cols.nr()
            << "\n\tcols.nc():  " << cols.nc()
            );

        typedef op_colm_range<EXP1,EXP2> op;
        return matrix_op<op>(op(m.ref(),cols.ref()));
    }

// ----------------------------------------------------------------------------------------


    template <typename T, long NR, long NC, typename mm, typename l>
    class assignable_sub_matrix
    {
    public:
        typedef T type;
        typedef l layout_type;
        typedef matrix<T,NR,NC,mm,l> matrix_type;

        assignable_sub_matrix(
            matrix<T,NR,NC,mm,l>& m_,
            long top_,
            long left_,
            long height_,
            long width_
        ) : m(m_), left(left_), top(top_), width(width_), height(height_) {}

        T& operator() (
            long r,
            long c
        )
        {
            return m(r+top,c+left);
        }

        const T& operator() (
            long r,
            long c
        ) const
        {
            return m(r+top,c+left);
        }

        long nr() const { return height; }
        long nc() const { return width; }

        template <typename EXP>
        assignable_sub_matrix& operator= (
            const matrix_exp<EXP>& exp
        ) 
        {
            DLIB_ASSERT( exp.nr() == height && exp.nc() == width,
                "\tassignable_matrix_expression set_subm()"
                << "\n\tYou have tried to assign to this object using a matrix that isn't the right size"
                << "\n\texp.nr() (source matrix): " << exp.nr()
                << "\n\texp.nc() (source matrix): " << exp.nc() 
                << "\n\twidth (target matrix):    " << width
                << "\n\theight (target matrix):   " << height
                );

            if (exp.destructively_aliases(m) == false)
            {
                matrix_assign(*this, exp); 
            }
            else
            {
                // make a temporary copy of the matrix we are going to assign to m to 
                // avoid aliasing issues during the copy
                this->operator=(tmp(exp));
            }

            return *this;
        }

        template <typename EXP>
        assignable_sub_matrix& operator+= (
            const matrix_exp<EXP>& exp
        ) 
        {
            DLIB_ASSERT( exp.nr() == height && exp.nc() == width,
                "\tassignable_matrix_expression set_subm()"
                << "\n\tYou have tried to assign to this object using a matrix that isn't the right size"
                << "\n\texp.nr() (source matrix): " << exp.nr()
                << "\n\texp.nc() (source matrix): " << exp.nc() 
                << "\n\twidth (target matrix):    " << width
                << "\n\theight (target matrix):   " << height
                );

            if (exp.destructively_aliases(m) == false)
            {
                matrix_assign(*this, subm(m,top,left,height,width)+exp); 
            }
            else
            {
                // make a temporary copy of the matrix we are going to assign to m to 
                // avoid aliasing issues during the copy
                this->operator+=(tmp(exp));
            }

            return *this;
        }

        template <typename EXP>
        assignable_sub_matrix& operator-= (
            const matrix_exp<EXP>& exp
        ) 
        {
            DLIB_ASSERT( exp.nr() == height && exp.nc() == width,
                "\tassignable_matrix_expression set_subm()"
                << "\n\tYou have tried to assign to this object using a matrix that isn't the right size"
                << "\n\texp.nr() (source matrix): " << exp.nr()
                << "\n\texp.nc() (source matrix): " << exp.nc() 
                << "\n\twidth (target matrix):    " << width
                << "\n\theight (target matrix):   " << height
                );

            if (exp.destructively_aliases(m) == false)
            {
                matrix_assign(*this, subm(m,top,left,height,width)-exp); 
            }
            else
            {
                // make a temporary copy of the matrix we are going to assign to m to 
                // avoid aliasing issues during the copy
                this->operator-=(tmp(exp));
            }

            return *this;
        }

        assignable_sub_matrix& operator= (
            const T& value
        )
        {
            const long bottom = top+height-1;
            const long right = left+width-1;
            for (long r = top; r <= bottom; ++r)
            {
                for (long c = left; c <= right; ++c)
                {
                    m(r,c) = value;
                }
            }

            return *this;
        }

        assignable_sub_matrix& operator+= (
            const T& value
        )
        {
            const long bottom = top+height-1;
            const long right = left+width-1;
            for (long r = top; r <= bottom; ++r)
            {
                for (long c = left; c <= right; ++c)
                {
                    m(r,c) += value;
                }
            }

            return *this;
        }

        assignable_sub_matrix& operator-= (
            const T& value
        )
        {
            const long bottom = top+height-1;
            const long right = left+width-1;
            for (long r = top; r <= bottom; ++r)
            {
                for (long c = left; c <= right; ++c)
                {
                    m(r,c) -= value;
                }
            }

            return *this;
        }


        matrix<T,NR,NC,mm,l>& m;
        const long left, top, width, height;
    };


    template <typename T, long NR, long NC, typename mm, typename l>
    assignable_sub_matrix<T,NR,NC,mm,l> set_subm (
        matrix<T,NR,NC,mm,l>& m,
        const rectangle& rect
    )
    {
        DLIB_ASSERT(get_rect(m).contains(rect) == true, 
            "\tassignable_matrix_expression set_subm(matrix& m, const rectangle& rect)"
            << "\n\tYou have specified invalid sub matrix dimensions"
            << "\n\tm.nr(): " << m.nr()
            << "\n\tm.nc(): " << m.nc() 
            << "\n\trect.left():   " << rect.left()
            << "\n\trect.top():    " << rect.top()
            << "\n\trect.right():  " << rect.right()
            << "\n\trect.bottom(): " << rect.bottom()
            );


        return assignable_sub_matrix<T,NR,NC,mm,l>(m,rect.top(), rect.left(), rect.height(), rect.width());
    }


    template <typename T, long NR, long NC, typename mm, typename l>
    assignable_sub_matrix<T,NR,NC,mm,l> set_subm (
        matrix<T,NR,NC,mm,l>& m,
        long r, 
        long c,
        long nr,
        long nc
    )
    {
        DLIB_ASSERT(r >= 0 && c >= 0 && nr >= 0 && nc >= 0 && r+nr <= m.nr() && c+nc <= m.nc(), 
                    "\tassignable_matrix_expression set_subm(matrix& m, r, c, nr, nc)"
                    << "\n\tYou have specified invalid sub matrix dimensions"
                    << "\n\tm.nr(): " << m.nr()
                    << "\n\tm.nc(): " << m.nc() 
                    << "\n\tr:      " << r 
                    << "\n\tc:      " << c 
                    << "\n\tnr:     " << nr 
                    << "\n\tnc:     " << nc 
        );

        return assignable_sub_matrix<T,NR,NC,mm,l>(m,r,c, nr, nc);
    }

// ----------------------------------------------------------------------------------------

    template <typename T, long NR, long NC, typename mm, typename l, typename EXPr, typename EXPc>
    class assignable_sub_range_matrix
    {
    public:
        typedef T type;
        typedef l layout_type;
        typedef matrix<T,NR,NC,mm,l> matrix_type;

        assignable_sub_range_matrix(
            matrix<T,NR,NC,mm,l>& m_,
            const EXPr& rows_,
            const EXPc& cols_
        ) : m(m_), rows(rows_), cols(cols_) {}

        T& operator() (
            long r,
            long c
        )
        {
            return m(rows(r),cols(c));
        }

        long nr() const { return rows.size(); }
        long nc() const { return cols.size(); }


        template <typename EXP>
        assignable_sub_range_matrix& operator= (
            const matrix_exp<EXP>& exp
        ) 
        {
            DLIB_ASSERT( exp.nr() == rows.size() && exp.nc() == cols.size(),
                "\tassignable_matrix_expression set_subm(matrix& m, const matrix_exp rows, const matrix_exp cols)"
                << "\n\tYou have tried to assign to this object using a matrix that isn't the right size"
                << "\n\texp.nr() (source matrix): " << exp.nr()
                << "\n\texp.nc() (source matrix): " << exp.nc() 
                << "\n\trows.size() (target matrix):  " << rows.size()
                << "\n\tcols.size() (target matrix):  " << cols.size()
                );

            if (exp.destructively_aliases(m) == false)
            {
                matrix_assign(*this, exp);
            }
            else
            {
                // make a temporary copy of the matrix we are going to assign to m to 
                // avoid aliasing issues during the copy
                this->operator=(tmp(exp));
            }

            return *this;
        }

        template <typename EXP>
        assignable_sub_range_matrix& operator+= (
            const matrix_exp<EXP>& exp
        ) 
        {
            DLIB_ASSERT( exp.nr() == rows.size() && exp.nc() == cols.size(),
                "\tassignable_matrix_expression set_subm(matrix& m, const matrix_exp rows, const matrix_exp cols)"
                << "\n\tYou have tried to assign to this object using a matrix that isn't the right size"
                << "\n\texp.nr() (source matrix): " << exp.nr()
                << "\n\texp.nc() (source matrix): " << exp.nc() 
                << "\n\trows.size() (target matrix):  " << rows.size()
                << "\n\tcols.size() (target matrix):  " << cols.size()
                );

            if (exp.destructively_aliases(m) == false)
            {
                matrix_assign(*this, subm(m,rows,cols)+exp);
            }
            else
            {
                // make a temporary copy of the matrix we are going to assign to m to 
                // avoid aliasing issues during the copy
                this->operator+=(tmp(exp));
            }

            return *this;
        }

        template <typename EXP>
        assignable_sub_range_matrix& operator-= (
            const matrix_exp<EXP>& exp
        ) 
        {
            DLIB_ASSERT( exp.nr() == rows.size() && exp.nc() == cols.size(),
                "\tassignable_matrix_expression set_subm(matrix& m, const matrix_exp rows, const matrix_exp cols)"
                << "\n\tYou have tried to assign to this object using a matrix that isn't the right size"
                << "\n\texp.nr() (source matrix): " << exp.nr()
                << "\n\texp.nc() (source matrix): " << exp.nc() 
                << "\n\trows.size() (target matrix):  " << rows.size()
                << "\n\tcols.size() (target matrix):  " << cols.size()
                );

            if (exp.destructively_aliases(m) == false)
            {
                matrix_assign(*this, subm(m,rows,cols)-exp);
            }
            else
            {
                // make a temporary copy of the matrix we are going to assign to m to 
                // avoid aliasing issues during the copy
                this->operator-=(tmp(exp));
            }

            return *this;
        }

        assignable_sub_range_matrix& operator= (
            const T& value
        )
        {
            for (long r = 0; r < rows.size(); ++r)
            {
                for (long c = 0; c < cols.size(); ++c)
                {
                    m(rows(r),cols(c)) = value;
                }
            }

            return *this;
        }

        assignable_sub_range_matrix& operator+= (
            const T& value
        )
        {
            for (long r = 0; r < rows.size(); ++r)
            {
                for (long c = 0; c < cols.size(); ++c)
                {
                    m(rows(r),cols(c)) += value;
                }
            }

            return *this;
        }

        assignable_sub_range_matrix& operator-= (
            const T& value
        )
        {
            for (long r = 0; r < rows.size(); ++r)
            {
                for (long c = 0; c < cols.size(); ++c)
                {
                    m(rows(r),cols(c)) -= value;
                }
            }

            return *this;
        }

    private:

        matrix<T,NR,NC,mm,l>& m;
        const EXPr rows;
        const EXPc cols;
    };

    template <typename T, long NR, long NC, typename mm, typename l, typename EXPr, typename EXPc>
    assignable_sub_range_matrix<T,NR,NC,mm,l,EXPr,EXPc > set_subm (
        matrix<T,NR,NC,mm,l>& m,
        const matrix_exp<EXPr>& rows,
        const matrix_exp<EXPc>& cols
    )
    {
        DLIB_ASSERT(0 <= min(rows) && max(rows) < m.nr() && 0 <= min(cols) && max(cols) < m.nc() &&
                    (rows.nr() == 1 || rows.nc() == 1) && (cols.nr() == 1 || cols.nc() == 1), 
            "\tassignable_matrix_expression set_subm(matrix& m, const matrix_exp& rows, const matrix_exp& cols)"
            << "\n\tYou have specified invalid sub matrix dimensions"
            << "\n\tm.nr():     " << m.nr()
            << "\n\tm.nc():     " << m.nc() 
            << "\n\tmin(rows):  " << min(rows) 
            << "\n\tmax(rows):  " << max(rows) 
            << "\n\tmin(cols):  " << min(cols) 
            << "\n\tmax(cols):  " << max(cols) 
            << "\n\trows.nr():  " << rows.nr()
            << "\n\trows.nc():  " << rows.nc()
            << "\n\tcols.nr():  " << cols.nr()
            << "\n\tcols.nc():  " << cols.nc()
            );

        return assignable_sub_range_matrix<T,NR,NC,mm,l,EXPr,EXPc >(m,rows.ref(),cols.ref());
    }

// ----------------------------------------------------------------------------------------

    template <typename T, long NR, long NC, typename mm, typename l, typename EXPr>
    assignable_sub_range_matrix<T,NR,NC,mm,l,EXPr,matrix_range_exp<long> > set_rowm (
        matrix<T,NR,NC,mm,l>& m,
        const matrix_exp<EXPr>& rows
    )
    {
        DLIB_ASSERT(0 <= min(rows) && max(rows) < m.nr() && (rows.nr() == 1 || rows.nc() == 1), 
            "\tassignable_matrix_expression set_rowm(matrix& m, const matrix_exp& rows)"
            << "\n\tYou have specified invalid sub matrix dimensions"
            << "\n\tm.nr():     " << m.nr()
            << "\n\tm.nc():     " << m.nc() 
            << "\n\tmin(rows):  " << min(rows) 
            << "\n\tmax(rows):  " << max(rows) 
            << "\n\trows.nr():  " << rows.nr()
            << "\n\trows.nc():  " << rows.nc()
            );

        return assignable_sub_range_matrix<T,NR,NC,mm,l,EXPr,matrix_range_exp<long> >(m,rows.ref(),range(0,m.nc()-1));
    }

// ----------------------------------------------------------------------------------------

    template <typename T, long NR, long NC, typename mm, typename l, typename EXPc>
    assignable_sub_range_matrix<T,NR,NC,mm,l,matrix_range_exp<long>,EXPc > set_colm (
        matrix<T,NR,NC,mm,l>& m,
        const matrix_exp<EXPc>& cols
    )
    {
        DLIB_ASSERT(0 <= min(cols) && max(cols) < m.nc() && (cols.nr() == 1 || cols.nc() == 1), 
            "\tassignable_matrix_expression set_colm(matrix& m, const matrix_exp& cols)"
            << "\n\tYou have specified invalid sub matrix dimensions"
            << "\n\tm.nr():     " << m.nr()
            << "\n\tm.nc():     " << m.nc() 
            << "\n\tmin(cols):  " << min(cols) 
            << "\n\tmax(cols):  " << max(cols) 
            << "\n\tcols.nr():  " << cols.nr()
            << "\n\tcols.nc():  " << cols.nc()
            );

        return assignable_sub_range_matrix<T,NR,NC,mm,l,matrix_range_exp<long>,EXPc >(m,range(0,m.nr()-1),cols.ref());
    }

// ----------------------------------------------------------------------------------------

    template <typename T, long NR, long NC, typename mm, typename l>
    class assignable_col_matrix
    {
    public:
        typedef T type;
        typedef l layout_type;
        typedef matrix<T,NR,NC,mm,l> matrix_type;

        assignable_col_matrix(
            matrix<T,NR,NC,mm,l>& m_,
            const long col_ 
        ) : m(m_), col(col_) {}

        T& operator() (
            long r,
            long 
        )
        {
            return m(r,col);
        }

        const T& operator() (
            long r,
            long 
        ) const
        {
            return m(r,col);
        }

        long nr() const { return m.nr(); }
        long nc() const { return 1; }

        template <typename EXP>
        assignable_col_matrix& operator= (
            const matrix_exp<EXP>& exp
        ) 
        {
            DLIB_ASSERT( exp.nc() == 1 && exp.nr() == m.nr(),
                "\tassignable_matrix_expression set_colm()"
                << "\n\tYou have tried to assign to this object using a matrix that isn't the right size"
                << "\n\texp.nr() (source matrix): " << exp.nr()
                << "\n\texp.nc() (source matrix): " << exp.nc() 
                << "\n\tm.nr() (target matrix):   " << m.nr()
                );

            if (exp.destructively_aliases(m) == false)
            {
                matrix_assign(*this, exp); 
            }
            else
            {
                // make a temporary copy of the matrix we are going to assign to m to 
                // avoid aliasing issues during the copy
                this->operator=(tmp(exp));
            }

            return *this;
        }

        template <typename EXP>
        assignable_col_matrix& operator+= (
            const matrix_exp<EXP>& exp
        ) 
        {
            DLIB_ASSERT( exp.nc() == 1 && exp.nr() == m.nr(),
                "\tassignable_matrix_expression set_colm()"
                << "\n\tYou have tried to assign to this object using a matrix that isn't the right size"
                << "\n\texp.nr() (source matrix): " << exp.nr()
                << "\n\texp.nc() (source matrix): " << exp.nc() 
                << "\n\tm.nr() (target matrix):   " << m.nr()
                );

            if (exp.destructively_aliases(m) == false)
            {
                matrix_assign(*this, colm(m,col)+exp); 
            }
            else
            {
                // make a temporary copy of the matrix we are going to assign to m to 
                // avoid aliasing issues during the copy
                this->operator+=(tmp(exp));
            }

            return *this;
        }

        template <typename EXP>
        assignable_col_matrix& operator-= (
            const matrix_exp<EXP>& exp
        ) 
        {
            DLIB_ASSERT( exp.nc() == 1 && exp.nr() == m.nr(),
                "\tassignable_matrix_expression set_colm()"
                << "\n\tYou have tried to assign to this object using a matrix that isn't the right size"
                << "\n\texp.nr() (source matrix): " << exp.nr()
                << "\n\texp.nc() (source matrix): " << exp.nc() 
                << "\n\tm.nr() (target matrix):   " << m.nr()
                );

            if (exp.destructively_aliases(m) == false)
            {
                matrix_assign(*this, colm(m,col)-exp); 
            }
            else
            {
                // make a temporary copy of the matrix we are going to assign to m to 
                // avoid aliasing issues during the copy
                this->operator-=(tmp(exp));
            }

            return *this;
        }

        assignable_col_matrix& operator= (
            const T& value
        )
        {
            for (long i = 0; i < m.nr(); ++i)
            {
                m(i,col) = value;
            }

            return *this;
        }

        assignable_col_matrix& operator+= (
            const T& value
        )
        {
            for (long i = 0; i < m.nr(); ++i)
            {
                m(i,col) += value;
            }

            return *this;
        }

        assignable_col_matrix& operator-= (
            const T& value
        )
        {
            for (long i = 0; i < m.nr(); ++i)
            {
                m(i,col) -= value;
            }

            return *this;
        }


        matrix<T,NR,NC,mm,l>& m;
        const long col;
    };


    template <typename T, long NR, long NC, typename mm, typename l>
    assignable_col_matrix<T,NR,NC,mm,l> set_colm (
        matrix<T,NR,NC,mm,l>& m,
        const long col 
    )
    {
        DLIB_ASSERT(col >= 0 && col < m.nc(), 
            "\tassignable_matrix_expression set_colm(matrix& m, col)"
            << "\n\tYou have specified invalid sub matrix dimensions"
            << "\n\tm.nr(): " << m.nr()
            << "\n\tm.nc(): " << m.nc() 
            << "\n\tcol:    " << col 
            );


        return assignable_col_matrix<T,NR,NC,mm,l>(m,col);
    }

// ----------------------------------------------------------------------------------------


    template <typename T, long NR, long NC, typename mm, typename l>
    class assignable_row_matrix
    {
    public:
        typedef T type;
        typedef l layout_type;
        typedef matrix<T,NR,NC,mm,l> matrix_type;

        assignable_row_matrix(
            matrix<T,NR,NC,mm,l>& m_,
            const long row_ 
        ) : m(m_), row(row_) {}


        T& operator() (
            long ,
            long c
        )
        {
            return m(row,c);
        }

        const T& operator() (
            long ,
            long c
        ) const
        {
            return m(row,c);
        }

        long nr() const { return 1; }
        long nc() const { return m.nc(); }


        template <typename EXP>
        assignable_row_matrix& operator= (
            const matrix_exp<EXP>& exp
        ) 
        {
            DLIB_ASSERT( exp.nr() == 1 && exp.nc() == m.nc(),
                "\tassignable_matrix_expression set_rowm()"
                << "\n\tYou have tried to assign to this object using a matrix that isn't the right size"
                << "\n\texp.nr() (source matrix): " << exp.nr()
                << "\n\texp.nc() (source matrix): " << exp.nc() 
                << "\n\tm.nc() (target matrix):   " << m.nc()
                );

            if (exp.destructively_aliases(m) == false)
            {
                matrix_assign(*this, exp); 
            }
            else
            {
                // make a temporary copy of the matrix we are going to assign to m to 
                // avoid aliasing issues during the copy
                this->operator=(tmp(exp));
            }

            return *this;
        }

        template <typename EXP>
        assignable_row_matrix& operator+= (
            const matrix_exp<EXP>& exp
        ) 
        {
            DLIB_ASSERT( exp.nr() == 1 && exp.nc() == m.nc(),
                "\tassignable_matrix_expression set_rowm()"
                << "\n\tYou have tried to assign to this object using a matrix that isn't the right size"
                << "\n\texp.nr() (source matrix): " << exp.nr()
                << "\n\texp.nc() (source matrix): " << exp.nc() 
                << "\n\tm.nc() (target matrix):   " << m.nc()
                );

            if (exp.destructively_aliases(m) == false)
            {
                matrix_assign(*this, rowm(m,row)+exp); 
            }
            else
            {
                // make a temporary copy of the matrix we are going to assign to m to 
                // avoid aliasing issues during the copy
                this->operator+=(tmp(exp));
            }

            return *this;
        }

        template <typename EXP>
        assignable_row_matrix& operator-= (
            const matrix_exp<EXP>& exp
        ) 
        {
            DLIB_ASSERT( exp.nr() == 1 && exp.nc() == m.nc(),
                "\tassignable_matrix_expression set_rowm()"
                << "\n\tYou have tried to assign to this object using a matrix that isn't the right size"
                << "\n\texp.nr() (source matrix): " << exp.nr()
                << "\n\texp.nc() (source matrix): " << exp.nc() 
                << "\n\tm.nc() (target matrix):   " << m.nc()
                );

            if (exp.destructively_aliases(m) == false)
            {
                matrix_assign(*this, rowm(m,row)-exp); 
            }
            else
            {
                // make a temporary copy of the matrix we are going to assign to m to 
                // avoid aliasing issues during the copy
                this->operator-=(tmp(exp));
            }

            return *this;
        }

        assignable_row_matrix& operator= (
            const T& value
        )
        {
            for (long i = 0; i < m.nc(); ++i)
            {
                m(row,i) = value;
            }

            return *this;
        }

        assignable_row_matrix& operator+= (
            const T& value
        )
        {
            for (long i = 0; i < m.nc(); ++i)
            {
                m(row,i) += value;
            }

            return *this;
        }

        assignable_row_matrix& operator-= (
            const T& value
        )
        {
            for (long i = 0; i < m.nc(); ++i)
            {
                m(row,i) -= value;
            }

            return *this;
        }


        matrix<T,NR,NC,mm,l>& m;
        const long row;
    };


    template <typename T, long NR, long NC, typename mm, typename l>
    assignable_row_matrix<T,NR,NC,mm,l> set_rowm (
        matrix<T,NR,NC,mm,l>& m,
        const long row 
    )
    {
        DLIB_ASSERT(row >= 0 && row < m.nr(), 
            "\tassignable_matrix_expression set_rowm(matrix& m, row)"
            << "\n\tYou have specified invalid sub matrix dimensions"
            << "\n\tm.nr(): " << m.nr()
            << "\n\tm.nc(): " << m.nc() 
            << "\n\trow:    " << row 
            );


        return assignable_row_matrix<T,NR,NC,mm,l>(m,row);
    }

// ----------------------------------------------------------------------------------------

}

#endif // DLIB_MATRIx_SUBEXP_

