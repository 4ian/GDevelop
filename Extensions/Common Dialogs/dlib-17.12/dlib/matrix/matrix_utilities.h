// Copyright (C) 2006  Davis E. King (davisking@users.sourceforge.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#ifndef DLIB_MATRIx_UTILITIES_
#define DLIB_MATRIx_UTILITIES_

#include "matrix_utilities_abstract.h"
#include "matrix.h"
#include <cmath>
#include <complex>
#include <limits>
#include "../pixel.h"
#include "../geometry/rectangle.h"
#include "../stl_checked.h"
#include <vector>
#include <algorithm>
#include "../std_allocator.h"



namespace dlib
{

// ----------------------------------------------------------------------------------------

    /*
        templates for finding the max of two matrix expressions' dimensions
    */

    template <typename EXP1, typename EXP2 = void, typename EXP3 = void, typename EXP4 = void>
    struct max_nr;

    template <typename EXP1>
    struct max_nr<EXP1,void,void,void>
    {
        const static long val = EXP1::NR;
    };

    template <typename EXP1, typename EXP2>
    struct max_nr<EXP1,EXP2,void,void>
    {
        const static long val = (EXP1::NR > EXP2::NR) ? (EXP1::NR) : (EXP2::NR);
    };

    template <typename EXP1, typename EXP2, typename EXP3>
    struct max_nr<EXP1,EXP2,EXP3,void>
    {
    private:
        const static long max12 = (EXP1::NR > EXP2::NR) ? (EXP1::NR) : (EXP2::NR);
    public:
        const static long val = (max12 > EXP3::NR) ? (max12) : (EXP3::NR);
    };

    template <typename EXP1, typename EXP2, typename EXP3, typename EXP4>
    struct max_nr
    {
    private:
        const static long max12 = (EXP1::NR > EXP2::NR) ? (EXP1::NR) : (EXP2::NR);
        const static long max34 = (EXP3::NR > EXP4::NR) ? (EXP3::NR) : (EXP4::NR);
    public:
        const static long val = (max12 > max34) ? (max12) : (max34);
    };


    template <typename EXP1, typename EXP2 = void, typename EXP3 = void, typename EXP4 = void>
    struct max_nc;

    template <typename EXP1>
    struct max_nc<EXP1,void,void,void>
    {
        const static long val = EXP1::NC;
    };

    template <typename EXP1, typename EXP2>
    struct max_nc<EXP1,EXP2,void,void>
    {
        const static long val = (EXP1::NC > EXP2::NC) ? (EXP1::NC) : (EXP2::NC);
    };

    template <typename EXP1, typename EXP2, typename EXP3>
    struct max_nc<EXP1,EXP2,EXP3,void>
    {
    private:
        const static long max12 = (EXP1::NC > EXP2::NC) ? (EXP1::NC) : (EXP2::NC);
    public:
        const static long val = (max12 > EXP3::NC) ? (max12) : (EXP3::NC);
    };

    template <typename EXP1, typename EXP2, typename EXP3, typename EXP4>
    struct max_nc
    {
    private:
        const static long max12 = (EXP1::NC > EXP2::NC) ? (EXP1::NC) : (EXP2::NC);
        const static long max34 = (EXP3::NC > EXP4::NC) ? (EXP3::NC) : (EXP4::NC);
    public:
        const static long val = (max12 > max34) ? (max12) : (max34);
    };

// ----------------------------------------------------------------------------------------

    template <
        typename OP
        >
    class matrix_zeroary_exp;  

    template <
        typename M,
        typename OP
        >
    class matrix_unary_exp;  

    template <
        typename M1,
        typename M2,
        typename OP
        >
    class matrix_binary_exp;

    struct has_destructive_aliasing
    {
        template <typename M, typename U, long iNR, long iNC, typename MM >
        static bool destructively_aliases (
            const M& m,
            const matrix<U,iNR,iNC,MM>& item
        ) { return m.aliases(item); }

        template <typename M1, typename M2, typename U, long iNR, long iNC, typename MM >
        static bool destructively_aliases (
            const M1& m1,
            const M2& m2,
            const matrix<U,iNR,iNC,MM>& item
        ) { return m1.aliases(item) || m2.aliases(item) ; }
    };

    struct has_nondestructive_aliasing
    {
        template <typename M, typename U, long iNR, long iNC, typename MM >
        static bool destructively_aliases (
            const M& m,
            const matrix<U,iNR,iNC,MM>& item
        ) { return m.destructively_aliases(item); }

        template <typename M1, typename M2, typename U, long iNR, long iNC, typename MM >
        static bool destructively_aliases (
            const M1& m1,
            const M2& m2,
            const matrix<U,iNR,iNC, MM>& item
        ) { return m1.destructively_aliases(item) || m2.destructively_aliases(item) ; }
    };

    template <typename EXP1, typename EXP2 = void, typename EXP3 = void, typename EXP4 = void>
    struct preserves_dimensions
    {
        const static long NR = max_nr<EXP1,EXP2,EXP3,EXP4>::val;
        const static long NC = max_nc<EXP1,EXP2,EXP3,EXP4>::val;

        typedef typename EXP1::mem_manager_type mem_manager_type;

        template <typename M>
        static long nr (const M& m) { return m.nr(); }
        template <typename M>
        static long nc (const M& m) { return m.nc(); }
        template <typename M1, typename M2>
        static long nr (const M1& m1, const M2& ) { return m1.nr(); }
        template <typename M1, typename M2>
        static long nc (const M1& m1, const M2& ) { return m1.nc(); }
    };

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
                if (temp > val)
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
                if (temp < val)
                    val = temp;
            }
        }
        return val;
    }

// ----------------------------------------------------------------------------------------

    template <
        typename EXP
        >
    const typename matrix_exp<EXP>::type length (
        const matrix_exp<EXP>& m
    )
    {
        DLIB_ASSERT(m.nr() == 1 || m.nc() == 1, 
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
        DLIB_ASSERT(m.nr() == 1 || m.nc() == 1, 
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

    namespace nric
    {
        // This namespace contains stuff from Numerical Recipes in C

        template <typename T>
        inline T pythag(const T& a, const T& b)
        {
            T absa,absb;
            absa=std::abs(a);
            absb=std::abs(b);
            if (absa > absb) 
            {
                T val = absb/absa;
                val *= val;
                return absa*std::sqrt(1.0+val);
            }
            else 
            {
                if (absb == 0.0)
                {
                    return 0.0;
                }
                else
                {
                    T val = absa/absb;
                    val *= val;
                    return  absb*std::sqrt(1.0+val);
                }
            }
        }

        template <typename T>
        inline T sign(const T& a, const T& b)
        {
            if (b < 0)
            {
                return -std::abs(a);
            }
            else
            {
                return std::abs(a);
            }
        }


        template <
            typename T,
            long M, long N,
            long wN, long wX,
            long vN, 
            long rN, long rX,
            typename MM1,
            typename MM2,
            typename MM3,
            typename MM4
            >
        bool svdcmp(
            matrix<T,M,N,MM1>& a,  
            matrix<T,wN,wX,MM2>& w,
            matrix<T,vN,vN,MM3>& v,
            matrix<T,rN,rX,MM4>& rv1
        )
        /*!  ( this function is derived from the one in numerical recipes in C chapter 2.6)
            requires
                - w.nr() == a.nc()
                - w.nc() == 1
                - v.nr() == a.nc()
                - v.nc() == a.nc()
                - rv1.nr() == a.nc()
                - rv1.nc() == 1
            ensures
                - computes the singular value decomposition of a
                - let W be the matrix such that diag(W) == #w then:
                    - a == #a*W*trans(#v)
                - trans(#a)*#a == identity matrix
                - trans(#v)*#v == identity matrix
                - #rv1 == some undefined value
                - returns true for success and false for failure
        !*/
        {

            DLIB_ASSERT(
                 w.nr() == a.nc() &&
                 w.nc() == 1 &&
                 v.nr() == a.nc() &&
                 v.nc() == a.nc() &&
                 rv1.nr() == a.nc() &&
                 rv1.nc() == 1, "");

            COMPILE_TIME_ASSERT(wX == 0 || wX == 1);
            COMPILE_TIME_ASSERT(rX == 0 || rX == 1);

            const T one = 1.0;
            const long max_iter = 30;
            const long n = a.nc();
            const long m = a.nr();
            const T eps = std::numeric_limits<T>::epsilon();
            long nm = 0, l = 0;
            bool flag;
            T anorm,c,f,g,h,s,scale,x,y,z;
            g = 0.0;
            scale = 0.0;
            anorm = 0.0; 

            for (long i = 0; i < n; ++i) 
            {
                l = i+1;
                rv1(i) = scale*g;
                g = s = scale = 0.0;
                if (i < m) 
                {
                    for (long k = i; k < m; ++k) 
                        scale += std::abs(a(k,i));

                    if (scale) 
                    {
                        for (long k = i; k < m; ++k) 
                        {
                            a(k,i) /= scale;
                            s += a(k,i)*a(k,i);
                        }
                        f = a(i,i);
                        g = -sign(std::sqrt(s),f);
                        h = f*g - s;
                        a(i,i) = f - g;
                        for (long j = l; j < n; ++j) 
                        {
                            s = 0.0;
                            for (long k = i; k < m; ++k) 
                                s += a(k,i)*a(k,j);

                            f = s/h;

                            for (long k = i; k < m; ++k) 
                                a(k,j) += f*a(k,i);
                        }
                        for (long k = i; k < m; ++k) 
                            a(k,i) *= scale;
                    }
                }

                w(i) = scale *g;

                g=s=scale=0.0;

                if (i < m && i < n-1) 
                {
                    for (long k = l; k < n; ++k) 
                        scale += std::abs(a(i,k));

                    if (scale) 
                    {
                        for (long k = l; k < n; ++k) 
                        {
                            a(i,k) /= scale;
                            s += a(i,k)*a(i,k);
                        }
                        f = a(i,l);
                        g = -sign(std::sqrt(s),f);
                        h = f*g - s;
                        a(i,l) = f - g;

                        for (long k = l; k < n; ++k) 
                            rv1(k) = a(i,k)/h;

                        for (long j = l; j < m; ++j) 
                        {
                            s = 0.0;
                            for (long k = l; k < n; ++k) 
                                s += a(j,k)*a(i,k);

                            for (long k = l; k < n; ++k) 
                                a(j,k) += s*rv1(k);
                        }
                        for (long k = l; k < n; ++k) 
                            a(i,k) *= scale;
                    }
                }
                anorm = std::max(anorm,(std::abs(w(i))+std::abs(rv1(i))));
            }
            for (long i = n-1; i >= 0; --i) 
            { 
                if (i < n-1) 
                {
                    if (g != 0) 
                    {
                        for (long j = l; j < n ; ++j) 
                            v(j,i) = (a(i,j)/a(i,l))/g;

                        for (long j = l; j < n; ++j) 
                        {
                            s = 0.0;
                            for (long k = l; k < n; ++k) 
                                s += a(i,k)*v(k,j);

                            for (long k = l; k < n; ++k) 
                                v(k,j) += s*v(k,i);
                        }
                    }

                    for (long j = l; j < n; ++j) 
                        v(i,j) = v(j,i) = 0.0;
                }

                v(i,i) = 1.0;
                g = rv1(i);
                l = i;
            }

            for (long i = std::min(m,n)-1; i >= 0; --i) 
            { 
                l = i + 1;
                g = w(i);

                for (long j = l; j < n; ++j) 
                    a(i,j) = 0.0;

                if (g != 0) 
                {
                    g = 1.0/g;

                    for (long j = l; j < n; ++j) 
                    {
                        s = 0.0;
                        for (long k = l; k < m; ++k) 
                            s += a(k,i)*a(k,j);

                        f=(s/a(i,i))*g;

                        for (long k = i; k < m; ++k) 
                            a(k,j) += f*a(k,i);
                    }
                    for (long j = i; j < m; ++j) 
                        a(j,i) *= g;
                } 
                else 
                {
                    for (long j = i; j < m; ++j) 
                        a(j,i) = 0.0;
                }

                ++a(i,i);
            }

            for (long k = n-1; k >= 0; --k) 
            { 
                for (long its = 1; its <= max_iter; ++its) 
                { 
                    flag = true;
                    for (l = k; l >= 1; --l) 
                    { 
                        nm = l - 1; 
                        if (std::abs(rv1(l)) <= eps*anorm) 
                        {
                            flag = false;
                            break;
                        }
                        if (std::abs(w(nm)) <= eps*anorm) 
                        {
                            break;
                        }
                    }

                    if (flag) 
                    {
                        c = 0.0;  
                        s = 1.0;
                        for (long i = l; i <= k; ++i) 
                        {
                            f = s*rv1(i);
                            rv1(i) = c*rv1(i);
                            if (std::abs(f) <= eps*anorm) 
                                break;

                            g = w(i);
                            h = pythag(f,g);
                            w(i) = h;
                            h = 1.0/h;
                            c = g*h;
                            s = -f*h;
                            for (long j = 0; j < m; ++j) 
                            {
                                y = a(j,nm);
                                z = a(j,i);
                                a(j,nm) = y*c + z*s;
                                a(j,i) = z*c - y*s;
                            }
                        }
                    }

                    z = w(k);
                    if (l == k) 
                    { 
                        if (z < 0.0) 
                        {
                            w(k) = -z;
                            for (long j = 0; j < n; ++j) 
                                v(j,k) = -v(j,k);
                        }
                        break;
                    }

                    if (its == max_iter) 
                        return false;

                    x = w(l); 
                    nm = k - 1;
                    y = w(nm);
                    g = rv1(nm);
                    h = rv1(k);
                    f = ((y-z)*(y+z) + (g-h)*(g+h))/(2.0*h*y);
                    g = pythag(f,one);
                    f = ((x-z)*(x+z) + h*((y/(f+sign(g,f)))-h))/x;
                    c = s = 1.0; 
                    for (long j = l; j <= nm; ++j) 
                    {
                        long i = j + 1;
                        g = rv1(i);
                        y = w(i);
                        h = s*g;
                        g = c*g;
                        z = pythag(f,h);
                        rv1(j) = z;
                        c = f/z;
                        s = h/z;
                        f = x*c + g*s;
                        g = g*c - x*s;
                        h = y*s;
                        y *= c;
                        for (long jj = 0; jj < n; ++jj) 
                        {
                            x = v(jj,j);
                            z = v(jj,i);
                            v(jj,j) = x*c + z*s;
                            v(jj,i) = z*c - x*s;
                        }
                        z = pythag(f,h);
                        w(j) = z; 
                        if (z != 0) 
                        {
                            z = 1.0/z;
                            c = f*z;
                            s = h*z;
                        }
                        f = c*g + s*y;
                        x = c*y - s*g;
                        for (long jj = 0; jj < m; ++jj) 
                        {
                            y = a(jj,j);
                            z = a(jj,i);
                            a(jj,j) = y*c + z*s;
                            a(jj,i) = z*c - y*s;
                        }
                    }
                    rv1(l) = 0.0;
                    rv1(k) = f;
                    w(k) = x;
                }
            }
            return true;
        }


        template <
            typename T,
            long N,
            long NX,
            typename MM1,
            typename MM2,
            typename MM3
            >
        bool ludcmp (
            matrix<T,N,N,MM1>& a,
            matrix<long,N,NX,MM2>& indx,
            T& d,
            matrix<T,N,NX,MM3> vv
        )
        /*!
            ( this function is derived from the one in numerical recipes in C chapter 2.3)
            ensures
                - #a == both the L and U matrices
                - #indx == the permutation vector (see numerical recipes in C)
                - #d == some other thing (see numerical recipes in C)
                - #vv == some undefined value.  this is just used for scratch space
                - if (the matrix is singular and we can't do anything) then
                    - returns false
                - else
                    - returns true
        !*/
        {
            DLIB_ASSERT(indx.nc() == 1,"in dlib::nric::ludcmp() the indx matrix must be a column vector");
            DLIB_ASSERT(vv.nc() == 1,"in dlib::nric::ludcmp() the vv matrix must be a column vector");
            const long n = a.nr();
            long imax = 0;
            T big, dum, sum, temp;

            d = 1.0;
            for (long i = 0; i < n; ++i)
            {
                big = 0;
                for (long j = 0; j < n; ++j)
                {
                    if ((temp=std::abs(a(i,j))) > big)
                        big = temp;
                }
                if (big == 0.0)
                {
                    return false;
                }
                vv(i) = 1/big;
            }

            for (long j = 0; j < n; ++j)
            {
                for (long i = 0; i < j; ++i)
                {
                    sum = a(i,j);
                    for (long k = 0; k < i; ++k)
                        sum -= a(i,k)*a(k,j);
                    a(i,j) = sum;
                }
                big = 0;
                for (long i = j; i < n; ++i)
                {
                    sum = a(i,j);
                    for (long k = 0; k < j; ++k)
                        sum -= a(i,k)*a(k,j);
                    a(i,j) = sum;
                    if ( (dum=vv(i)*std::abs(sum)) >= big)
                    {
                        big = dum;
                        imax = i;
                    }
                }
                if (j != imax)
                {
                    for (long k = 0; k < n; ++k)
                    {
                        dum = a(imax,k);
                        a(imax,k) = a(j,k);
                        a(j,k) = dum;
                    }
                    d = -d;
                    vv(imax) = vv(j);
                }
                indx(j) = imax;

                if (j < n-1)
                {
                    dum = 1/a(j,j);
                    for (long i = j+1; i < n; ++i)
                        a(i,j) *= dum;
                }
            }
            return true;
        }

// ----------------------------------------------------------------------------------------

        template <
            typename T,
            long N,
            long NX,
            typename MM1,
            typename MM2,
            typename MM3
            >
        void lubksb (
            const matrix<T,N,N,MM1>& a,
            const matrix<long,N,NX,MM2>& indx,
            matrix<T,N,NX,MM3>& b
        )
        /*!
            ( this function is derived from the one in numerical recipes in C chapter 2.3)
            requires
                - a == the LU decomposition you get from ludcmp()
                - indx == the indx term you get out of ludcmp()
                - b == the right hand side vector from the expression a*x = b
            ensures
                - #b == the solution vector x from the expression a*x = b
                  (basically, this function solves for x given b and a)
        !*/
        {
            DLIB_ASSERT(indx.nc() == 1,"in dlib::nric::lubksb() the indx matrix must be a column vector");
            DLIB_ASSERT(b.nc() == 1,"in dlib::nric::lubksb() the b matrix must be a column vector");
            const long n = a.nr();
            long i, ii = -1, ip, j;
            T sum;

            for (i = 0; i < n; ++i)
            {
                ip = indx(i);
                sum=b(ip);
                b(ip) = b(i);
                if (ii != -1)
                {
                    for (j = ii; j < i; ++j)
                        sum -= a(i,j)*b(j);
                }
                else if (sum)
                {
                    ii = i;
                }
                b(i) = sum;
            }
            for (i = n-1; i >= 0; --i)
            {
                sum = b(i);
                for (j = i+1; j < n; ++j)
                    sum -= a(i,j)*b(j);
                b(i) = sum/a(i,i);
            }
        }

    // ------------------------------------------------------------------------------------

    }

    template <
        typename EXP,
        long qN, long qX,
        long uM, 
        long vN, 
        typename MM1,
        typename MM2,
        typename MM3
        >
    long svd2 (
        bool withu, 
        bool withv, 
        const matrix_exp<EXP>& a,
        matrix<typename EXP::type,uM,uM,MM1>& u, 
        matrix<typename EXP::type,qN,qX,MM2>& q, 
        matrix<typename EXP::type,vN,vN,MM3>& v
    )
    {
        /*  
            Singular value decomposition. Translated to 'C' from the
            original Algol code in "Handbook for Automatic Computation,
            vol. II, Linear Algebra", Springer-Verlag.  Note that this
            published algorithm is considered to be the best and numerically
            stable approach to computing the real-valued svd and is referenced
            repeatedly in ieee journal papers, etc where the svd is used.

            This is almost an exact translation from the original, except that
            an iteration counter is added to prevent stalls. This corresponds
            to similar changes in other translations.

            Returns an error code = 0, if no errors and 'k' if a failure to
            converge at the 'kth' singular value.

            USAGE: given the singular value decomposition a = u * diagm(q) * trans(v) for an m*n 
                    matrix a with m >= n ...  
                    After the svd call u is an m x m matrix which is columnwise 
                    orthogonal. q will be an n element vector consisting of singular values 
                    and v an n x n orthogonal matrix. eps and tol are tolerance constants. 
                    Suitable values are eps=1e-16 and tol=(1e-300)/eps if T == double. 

                    If withu == false then u won't be computed and similarly if withv == false
                    then v won't be computed.
        */

        const long NR = matrix_exp<EXP>::NR;
        const long NC = matrix_exp<EXP>::NC;

        // make sure the output matrices have valid dimensions if they are statically dimensioned
        COMPILE_TIME_ASSERT(qX == 0 || qX == 1);
        COMPILE_TIME_ASSERT(NR == 0 || uM == 0 || NR == uM);
        COMPILE_TIME_ASSERT(NC == 0 || vN == 0 || NC == vN);

        DLIB_ASSERT(a.nr() >= a.nc(), 
            "\tconst matrix_exp svd2()"
            << "\n\tYou have given an invalidly sized matrix"
            << "\n\ta.nr(): " << a.nr()
            << "\n\ta.nc(): " << a.nc() 
            );


        typedef typename EXP::type T;

        using std::abs;
        using std::sqrt;

        T eps = std::numeric_limits<T>::epsilon();
        T tol = std::numeric_limits<T>::min()/eps;

        const long m = a.nr();
        const long n = a.nc();
        long i, j, k, l, l1, iter, retval;
        T c, f, g, h, s, x, y, z;

        matrix<T,qN,1,MM2> e(n,1); 
        q.set_size(n,1);
        u.set_size(m,m);
        retval = 0;

        if (withv)
        {
            v.set_size(n,n);
        }

        /* Copy 'a' to 'u' */    
        for (i=0; i<m; i++) 
        {
            for (j=0; j<n; j++)
                u(i,j) = a(i,j);
        }

        /* Householder's reduction to bidiagonal form. */
        g = x = 0.0;    
        for (i=0; i<n; i++) 
        {
            e(i) = g;
            s = 0.0;
            l = i + 1;

            for (j=i; j<m; j++)
                s += (u(j,i) * u(j,i));

            if (s < tol)
                g = 0.0;
            else 
            {
                f = u(i,i);
                g = (f < 0) ? sqrt(s) : -sqrt(s);
                h = f * g - s;
                u(i,i) = f - g;

                for (j=l; j<n; j++) 
                {
                    s = 0.0;

                    for (k=i; k<m; k++)
                        s += (u(k,i) * u(k,j));

                    f = s / h;

                    for (k=i; k<m; k++)
                        u(k,j) += (f * u(k,i));
                } /* end j */
            } /* end s */

            q(i) = g;
            s = 0.0;

            for (j=l; j<n; j++)
                s += (u(i,j) * u(i,j));

            if (s < tol)
                g = 0.0;
            else 
            {
                f = u(i,i+1);
                g = (f < 0) ? sqrt(s) : -sqrt(s);
                h = f * g - s;
                u(i,i+1) = f - g;

                for (j=l; j<n; j++) 
                    e(j) = u(i,j) / h;

                for (j=l; j<m; j++) 
                {
                    s = 0.0;

                    for (k=l; k<n; k++) 
                        s += (u(j,k) * u(i,k));

                    for (k=l; k<n; k++)
                        u(j,k) += (s * e(k));
                } /* end j */
            } /* end s */

            y = abs(q(i)) + abs(e(i));                         
            if (y > x)
                x = y;
        } /* end i */

        /* accumulation of right-hand transformations */
        if (withv) 
        {
            for (i=n-1; i>=0; i--) 
            {
                if (g != 0.0) 
                {
                    h = u(i,i+1) * g;

                    for (j=l; j<n; j++)
                        v(j,i) = u(i,j)/h;

                    for (j=l; j<n; j++) 
                    {
                        s = 0.0;

                        for (k=l; k<n; k++) 
                            s += (u(i,k) * v(k,j));

                        for (k=l; k<n; k++)
                            v(k,j) += (s * v(k,i));
                    } /* end j */
                } /* end g */

                for (j=l; j<n; j++)
                    v(i,j) = v(j,i) = 0.0;

                v(i,i) = 1.0;
                g = e(i);
                l = i;
            } /* end i */
        } /* end withv, parens added for clarity */

        /* accumulation of left-hand transformations */
        if (withu) 
        {
            for (i=n; i<m; i++) 
            {
                for (j=n;j<m;j++)
                    u(i,j) = 0.0;

                u(i,i) = 1.0;
            }
        }

        if (withu) 
        {
            for (i=n-1; i>=0; i--) 
            {
                l = i + 1;
                g = q(i);

                for (j=l; j<m; j++)  /* upper limit was 'n' */
                    u(i,j) = 0.0;

                if (g != 0.0) 
                {
                    h = u(i,i) * g;

                    for (j=l; j<m; j++) 
                    { /* upper limit was 'n' */
                        s = 0.0;

                        for (k=l; k<m; k++)
                            s += (u(k,i) * u(k,j));

                        f = s / h;

                        for (k=i; k<m; k++) 
                            u(k,j) += (f * u(k,i));
                    } /* end j */

                    for (j=i; j<m; j++) 
                        u(j,i) /= g;
                } /* end g */
                else 
                {
                    for (j=i; j<m; j++)
                        u(j,i) = 0.0;
                }

                u(i,i) += 1.0;
            } /* end i*/
        } /* end withu, parens added for clarity */

        /* diagonalization of the bidiagonal form */
        eps *= x;

        for (k=n-1; k>=0; k--) 
        {
            iter = 0;

test_f_splitting:

            for (l=k; l>=0; l--) 
            {
                if (abs(e(l)) <= eps) 
                    goto test_f_convergence;

                if (abs(q(l-1)) <= eps) 
                    goto cancellation;
            } /* end l */

            /* cancellation of e(l) if l > 0 */

cancellation:

            c = 0.0;
            s = 1.0;
            l1 = l - 1;

            for (i=l; i<=k; i++) 
            {
                f = s * e(i);
                e(i) *= c;

                if (abs(f) <= eps) 
                    goto test_f_convergence;

                g = q(i);
                h = q(i) = sqrt(f*f + g*g);
                c = g / h;
                s = -f / h;

                if (withu) 
                {
                    for (j=0; j<m; j++) 
                    {
                        y = u(j,l1);
                        z = u(j,i);
                        u(j,l1) = y * c + z * s;
                        u(j,i) = -y * s + z * c;
                    } /* end j */
                } /* end withu, parens added for clarity */
            } /* end i */

test_f_convergence:

            z = q(k);
            if (l == k) 
                goto convergence;

            /* shift from bottom 2x2 minor */
            iter++;
            if (iter > 30) 
            {
                retval = k;
                break;
            }
            x = q(l);
            y = q(k-1);
            g = e(k-1);
            h = e(k);
            f = ((y - z) * (y + z) + (g - h) * (g + h)) / (2 * h * y);
            g = sqrt(f * f + 1.0);
            f = ((x - z) * (x + z) + h * (y / ((f < 0)?(f - g) : (f + g)) - h)) / x;

            /* next QR transformation */
            c = s = 1.0;

            for (i=l+1; i<=k; i++) 
            {
                g = e(i);
                y = q(i);
                h = s * g;
                g *= c;
                e(i-1) = z = sqrt(f * f + h * h);
                c = f / z;
                s = h / z;
                f = x * c + g * s;
                g = -x * s + g * c;
                h = y * s;
                y *= c;

                if (withv) 
                {
                    for (j=0;j<n;j++) 
                    {
                        x = v(j,i-1);
                        z = v(j,i);
                        v(j,i-1) = x * c + z * s;
                        v(j,i) = -x * s + z * c;
                    } /* end j */
                } /* end withv, parens added for clarity */

                q(i-1) = z = sqrt(f * f + h * h);
                c = f / z;
                s = h / z;
                f = c * g + s * y;
                x = -s * g + c * y;
                if (withu) 
                {
                    for (j=0; j<m; j++) 
                    {
                        y = u(j,i-1);
                        z = u(j,i);
                        u(j,i-1) = y * c + z * s;
                        u(j,i) = -y * s + z * c;
                    } /* end j */
                } /* end withu, parens added for clarity */
            } /* end i */

            e(l) = 0.0;
            e(k) = f;
            q(k) = x;

            goto test_f_splitting;

convergence:

            if (z < 0.0) 
            {
                /* q(k) is made non-negative */
                q(k) = -z;
                if (withv) 
                {
                    for (j=0; j<n; j++)
                        v(j,k) = -v(j,k);
                } /* end withv, parens added for clarity */
            } /* end z */
        } /* end k */

        return retval;
    }

// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------

    template <
        typename OP
        >
    class matrix_zeroary_exp  
    {
    public:
        typedef typename OP::type type;
        typedef matrix_zeroary_exp ref_type;
        typedef typename OP::mem_manager_type mem_manager_type;
        const static long NR = OP::NR;
        const static long NC = OP::NC;

        const typename OP::type operator() (
            long r, 
            long c
        ) const { return OP::apply(r,c); }

        template <typename U, long iNR, long iNC , typename MM>
        bool aliases (
            const matrix<U,iNR,iNC,MM>& item
        ) const { return false; }

        template <typename U, long iNR, long iNC, typename MM >
        bool destructively_aliases (
            const matrix<U,iNR,iNC,MM>& item
        ) const { return false; }

        long nr (
        ) const { return NR; }

        long nc (
        ) const { return NC; }

        const ref_type& ref(
        ) const { return *this; }

    };

// ----------------------------------------------------------------------------------------

    template <
        typename S,
        typename OP
        >
    class dynamic_matrix_scalar_unary_exp  
    {
        /*!
            REQUIREMENTS ON S 
                - must NOT be a matrix_exp or matrix_ref object (or
                  an object with a compatible interface).
        !*/
    public:
        typedef typename OP::type type;
        typedef dynamic_matrix_scalar_unary_exp ref_type;
        typedef typename OP::mem_manager_type mem_manager_type;
        const static long NR = OP::NR;
        const static long NC = OP::NC;

        dynamic_matrix_scalar_unary_exp (
            long nr__,
            long nc__,
            const S& s_
        ) :
            nr_(nr__),
            nc_(nc__),
            s(s_)
        {
            COMPILE_TIME_ASSERT(is_matrix<S>::value == false);
        }

        const typename OP::type operator() (
            long r, 
            long c
        ) const { return OP::apply(s,r,c); }

        template <typename U, long iNR, long iNC, typename MM >
        bool aliases (
            const matrix<U,iNR,iNC,MM>& item
        ) const { return false; }

        template <typename U, long iNR, long iNC , typename MM>
        bool destructively_aliases (
            const matrix<U,iNR,iNC,MM>& item
        ) const { return false; }

        const ref_type& ref(
        ) const { return *this; }

        long nr (
        ) const { return nr_; }

        long nc (
        ) const { return nc_; }

    private:

        const long nr_;
        const long nc_;
        const S s;
    };

// ----------------------------------------------------------------------------------------

    template <
        typename S,
        typename OP
        >
    class matrix_scalar_unary_exp  
    {
        /*!
            REQUIREMENTS ON S 
                - must NOT be a matrix_exp or matrix_ref object (or
                  an object with a compatible interface).
        !*/
    public:
        typedef typename OP::type type;
        typedef matrix_scalar_unary_exp ref_type;
        typedef typename OP::mem_manager_type mem_manager_type;
        const static long NR = OP::NR;
        const static long NC = OP::NC;

        matrix_scalar_unary_exp (
            const S& s_
        ) :
            s(s_)
        {
            COMPILE_TIME_ASSERT(is_matrix<S>::value == false);
        }

        const typename OP::type operator() (
            long r, 
            long c
        ) const { return OP::apply(s,r,c); }

        template <typename U, long iNR, long iNC, typename MM >
        bool aliases (
            const matrix<U,iNR,iNC,MM>& item
        ) const { return false; }

        template <typename U, long iNR, long iNC, typename MM >
        bool destructively_aliases (
            const matrix<U,iNR,iNC,MM>& item
        ) const { return false; }

        const ref_type& ref(
        ) const { return *this; }

        long nr (
        ) const { return NR; }

        long nc (
        ) const { return NC; }

    private:

        const S s;
    };

// ----------------------------------------------------------------------------------------

    template <
        typename M,
        typename OP_
        >
    class matrix_unary_exp  
    {
        /*!
            REQUIREMENTS ON M 
                - must be a matrix_exp or matrix_ref object (or
                  an object with a compatible interface).
        !*/
        typedef typename OP_::template op<M> OP;

    public:
        typedef typename OP::type type;
        typedef matrix_unary_exp ref_type;
        typedef typename OP::mem_manager_type mem_manager_type;
        const static long NR = OP::NR;
        const static long NC = OP::NC;

        matrix_unary_exp (
            const M& m_
        ) :
            m(m_)
        {}

        const typename OP::type operator() (
            long r, 
            long c
        ) const { return OP::apply(m,r,c); }

        template <typename U, long iNR, long iNC, typename MM >
        bool aliases (
            const matrix<U,iNR,iNC,MM>& item
        ) const { return m.aliases(item); }

        template <typename U, long iNR, long iNC, typename MM >
        bool destructively_aliases (
            const matrix<U,iNR,iNC,MM>& item
        ) const { return OP::destructively_aliases(m,item); }

        const ref_type& ref(
        ) const { return *this; }

        long nr (
        ) const { return OP::nr(m); }

        long nc (
        ) const { return OP::nc(m); }

    private:

        const M m;
    };

// ----------------------------------------------------------------------------------------

    template <
        typename M
        >
    class matrix_std_vector_exp  
    {
        /*!
            REQUIREMENTS ON M 
                - must be a std::vector object (or
                  an object with a compatible interface).
        !*/
    public:
        typedef typename M::value_type type;
        typedef matrix_std_vector_exp ref_type;
        typedef typename memory_manager<char>::kernel_1a mem_manager_type;
        const static long NR = 0;
        const static long NC = 1;

        matrix_std_vector_exp (
            const M& m_
        ) :
            m(m_)
        {
        }

        const typename M::value_type operator() (
            long r, 
            long 
        ) const { return m[r]; }

        template <typename U, long iNR, long iNC, typename MM>
        bool aliases (
            const matrix<U,iNR,iNC,MM>& item
        ) const { return false; }

        template <typename U, long iNR, long iNC , typename MM>
        bool destructively_aliases (
            const matrix<U,iNR,iNC,MM>& item
        ) const { return false; }

        const ref_type& ref(
        ) const { return *this; }

        long nr (
        ) const { return m.size(); }

        long nc (
        ) const { return 1; }

    private:
        const M& m;
    };

// ----------------------------------------------------------------------------------------


    template <
        typename M
        >
    class matrix_vector_exp  
    {
        /*!
            REQUIREMENTS ON M 
                - must be a dlib::array object (or
                  an object with a compatible interface).
        !*/
    public:
        typedef typename M::type type;
        typedef matrix_vector_exp ref_type;
        typedef typename M::mem_manager_type mem_manager_type;
        const static long NR = 0;
        const static long NC = 1;

        matrix_vector_exp (
            const M& m_
        ) :
            m(m_)
        {
        }

        const typename M::type operator() (
            long r, 
            long 
        ) const { return m[r]; }

        template <typename U, long iNR, long iNC, typename MM>
        bool aliases (
            const matrix<U,iNR,iNC,MM>& item
        ) const { return false; }

        template <typename U, long iNR, long iNC , typename MM>
        bool destructively_aliases (
            const matrix<U,iNR,iNC,MM>& item
        ) const { return false; }

        const ref_type& ref(
        ) const { return *this; }

        long nr (
        ) const { return m.size(); }

        long nc (
        ) const { return 1; }

    private:
        const M& m;
    };

// ----------------------------------------------------------------------------------------

    template <
        typename M
        >
    class matrix_array_exp  
    {
        /*!
            REQUIREMENTS ON M 
                - must be a dlib::array2d object (or
                  an object with a compatible interface).
        !*/
    public:
        typedef typename M::type type;
        typedef matrix_array_exp ref_type;
        typedef typename M::mem_manager_type mem_manager_type;
        const static long NR = 0;
        const static long NC = 0;

        matrix_array_exp (
            const M& m_
        ) :
            m(m_)
        {
        }

        const typename M::type operator() (
            long r, 
            long c
        ) const { return m[r][c]; }

        template <typename U, long iNR, long iNC, typename MM>
        bool aliases (
            const matrix<U,iNR,iNC,MM>& item
        ) const { return false; }

        template <typename U, long iNR, long iNC , typename MM>
        bool destructively_aliases (
            const matrix<U,iNR,iNC,MM>& item
        ) const { return false; }

        const ref_type& ref(
        ) const { return *this; }

        long nr (
        ) const { return m.nr(); }

        long nc (
        ) const { return m.nc(); }

    private:
        const M& m;
    };

// ----------------------------------------------------------------------------------------

    template <
        typename M
        >
    class matrix_sub_exp  
    {
        /*!
            REQUIREMENTS ON M 
                - must be a matrix_exp or matrix_ref object (or
                  an object with a compatible interface).
        !*/
    public:
        typedef typename M::type type;
        typedef matrix_sub_exp ref_type;
        typedef typename M::mem_manager_type mem_manager_type;
        const static long NR = 0;
        const static long NC = 0;

        matrix_sub_exp (
            const M& m_,
            const long& r__,
            const long& c__,
            const long& nr__,
            const long& nc__
        ) :
            m(m_),
            r_(r__),
            c_(c__),
            nr_(nr__),
            nc_(nc__)
        {
        }

        const typename M::type operator() (
            long r, 
            long c
        ) const { return m(r+r_,c+c_); }

        template <typename U, long iNR, long iNC, typename MM >
        bool aliases (
            const matrix<U,iNR,iNC,MM>& item
        ) const { return m.aliases(item); }

        template <typename U, long iNR, long iNC , typename MM>
        bool destructively_aliases (
            const matrix<U,iNR,iNC,MM>& item
        ) const { return m.aliases(item); }

        const ref_type& ref(
        ) const { return *this; }

        long nr (
        ) const { return nr_; }

        long nc (
        ) const { return nc_; }

    private:

        const M m;
        const long r_, c_, nr_, nc_;
    };

// ----------------------------------------------------------------------------------------

    template <
        typename M,
        typename S,
        typename OP_
        >
    class matrix_scalar_binary_exp  
    {
        /*!
            REQUIREMENTS ON M 
                - must be a matrix_exp or matrix_ref object (or
                  an object with a compatible interface).
        !*/
        typedef typename OP_::template op<M> OP;

    public:
        typedef typename OP::type type;
        typedef matrix_scalar_binary_exp ref_type;
        typedef typename OP::mem_manager_type mem_manager_type;
        const static long NR = OP::NR;
        const static long NC = OP::NC;

        matrix_scalar_binary_exp (
            const M& m_,
            const S& s_
        ) :
            m(m_),
            s(s_)
        {
            COMPILE_TIME_ASSERT(is_matrix<S>::value == false);
        }

        const typename OP::type operator() (
            long r, 
            long c
        ) const { return OP::apply(m,s,r,c); }

        template <typename U, long iNR, long iNC, typename MM >
        bool aliases (
            const matrix<U,iNR,iNC,MM>& item
        ) const { return m.aliases(item); }

        template <typename U, long iNR, long iNC , typename MM>
        bool destructively_aliases (
            const matrix<U,iNR,iNC,MM>& item
        ) const { return OP::destructively_aliases(m,item); }

        const ref_type& ref(
        ) const { return *this; }

        long nr (
        ) const { return OP::nr(m); }

        long nc (
        ) const { return OP::nc(m); }

    private:

        const M m;
        const S s;
    };

// ----------------------------------------------------------------------------------------

    template <
        typename M,
        typename S,
        typename OP_
        >
    class matrix_scalar_trinary_exp  
    {
        /*!
            REQUIREMENTS ON M 
                - must be a matrix_exp or matrix_ref object (or
                  an object with a compatible interface).
        !*/
        typedef typename OP_::template op<M> OP;

    public:
        typedef typename OP::type type;
        typedef matrix_scalar_trinary_exp ref_type;
        typedef typename OP::mem_manager_type mem_manager_type;
        const static long NR = OP::NR;
        const static long NC = OP::NC;

        matrix_scalar_trinary_exp (
            const M& m_,
            const S& s1_,
            const S& s2_
        ) :
            m(m_),
            s1(s1_),
            s2(s2_)
        {
            COMPILE_TIME_ASSERT(is_matrix<S>::value == false);
        }

        const typename OP::type operator() (
            long r, 
            long c
        ) const { return OP::apply(m,s1,s2,r,c); }

        template <typename U, long iNR, long iNC, typename MM >
        bool aliases (
            const matrix<U,iNR,iNC,MM>& item
        ) const { return m.aliases(item); }

        template <typename U, long iNR, long iNC , typename MM>
        bool destructively_aliases (
            const matrix<U,iNR,iNC,MM>& item
        ) const { return OP::destructively_aliases(m,item); }

        const ref_type& ref(
        ) const { return *this; }

        long nr (
        ) const { return OP::nr(m); }

        long nc (
        ) const { return OP::nc(m); }

    private:

        const M m;
        const S s1;
        const S s2;
    };

// ----------------------------------------------------------------------------------------

    template <
        typename M1,
        typename M2,
        typename OP_
        >
    class matrix_binary_exp  
    {
        /*!
            REQUIREMENTS ON M1 AND M2 
                - must be a matrix_exp or matrix_ref object (or
                  an object with a compatible interface).
        !*/
        typedef typename OP_::template op<M1,M2> OP;

    public:
        typedef typename OP::type type;
        typedef matrix_binary_exp ref_type;
        typedef typename OP::mem_manager_type mem_manager_type;
        const static long NR = OP::NR;
        const static long NC = OP::NC;

        matrix_binary_exp (
            const M1& m1_,
            const M2& m2_
        ) :
            m1(m1_),
            m2(m2_)
        {}

        const typename OP::type operator() (
            long r, 
            long c
        ) const { return OP::apply(m1,m2,r,c); }

        template <typename U, long iNR, long iNC, typename MM >
        bool aliases (
            const matrix<U,iNR,iNC,MM>& item
        ) const { return m1.aliases(item) || m2.aliases(item); }

        template <typename U, long iNR, long iNC, typename MM >
        bool destructively_aliases (
            const matrix<U,iNR,iNC,MM>& item
        ) const { return OP::destructively_aliases(m1,m2,item); }

        const ref_type& ref(
        ) const { return *this; }

        long nr (
        ) const { return OP::nr(m1,m2); }

        long nc (
        ) const { return OP::nc(m1,m2); }

    private:

        const M1 m1;
        const M2 m2;
    };

// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------

    template <
        typename array_type
        >
    const typename enable_if<is_matrix<array_type>,array_type>::type& 
    array_to_matrix (
        const array_type& array
    )
    {
        return array;
    }

// ----------------------------------------------------------------------------------------

    template <
        typename array_type
        >
    const typename disable_if<is_matrix<array_type>,matrix_exp<matrix_array_exp<array_type> > >::type 
    array_to_matrix (
        const array_type& array
    )
    {
        typedef matrix_array_exp<array_type> exp;
        return matrix_exp<exp>(exp(array));
    }

// ----------------------------------------------------------------------------------------

    template <
        typename vector_type
        >
    const typename disable_if<is_matrix<vector_type>,matrix_exp<matrix_vector_exp<vector_type> > >::type 
    vector_to_matrix (
        const vector_type& vector
    )
    {
        typedef matrix_vector_exp<vector_type> exp;
        return matrix_exp<exp>(exp(vector));
    }

// ----------------------------------------------------------------------------------------

    template <
        typename vector_type
        >
    const typename enable_if<is_matrix<vector_type>,vector_type>::type& vector_to_matrix (
        const vector_type& vector
    )
    {
        return vector;
    }

// ----------------------------------------------------------------------------------------

    template <
        typename value_type,
        typename alloc
        >
    const matrix_exp<matrix_std_vector_exp<std::vector<value_type,alloc> > > vector_to_matrix (
        const std::vector<value_type,alloc>& vector
    )
    {
        typedef matrix_std_vector_exp<std::vector<value_type,alloc> > exp;
        return matrix_exp<exp>(exp(vector));
    }

// ----------------------------------------------------------------------------------------

    template <
        typename value_type,
        typename alloc
        >
    const matrix_exp<matrix_std_vector_exp<std_vector_c<value_type,alloc> > > vector_to_matrix (
        const std_vector_c<value_type,alloc>& vector
    )
    {
        typedef matrix_std_vector_exp<std_vector_c<value_type,alloc> > exp;
        return matrix_exp<exp>(exp(vector));
    }

// ----------------------------------------------------------------------------------------

    template <
        typename EXP
        >
    const rectangle get_rect (
        const matrix_exp<EXP>& m
    )
    {
        return rectangle(0, 0, m.nc()-1, m.nr()-1);
    }

// ----------------------------------------------------------------------------------------

    template <
        typename EXP
        >
    const matrix_exp<matrix_sub_exp<matrix_exp<EXP> > > subm (
        const matrix_exp<EXP>& m,
        long r, 
        long c,
        long nr,
        long nc
    )
    {
        DLIB_ASSERT(r >= 0 && c >= 0 && r+nr <= m.nr() && c+nc <= m.nc(), 
            "\tconst matrix_exp subm(const matrix_exp& m, r, c, nr, nc)"
            << "\n\tYou have specified invalid sub matrix dimensions"
            << "\n\tm.nr(): " << m.nr()
            << "\n\tm.nc(): " << m.nc() 
            << "\n\tr:      " << r 
            << "\n\tc:      " << c 
            << "\n\tnr:     " << nr 
            << "\n\tnc:     " << nc 
            );

        typedef matrix_sub_exp<matrix_exp<EXP> > exp;
        return matrix_exp<exp>(exp(m,r,c,nr,nc));
    }

// ----------------------------------------------------------------------------------------

    template <
        typename EXP
        >
    const matrix_exp<matrix_sub_exp<matrix_exp<EXP> > > subm (
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

        typedef matrix_sub_exp<matrix_exp<EXP> > exp;
        return matrix_exp<exp>(exp(m,rect.top(),rect.left(),rect.height(),rect.width()));
    }

// ----------------------------------------------------------------------------------------

    struct op_rowm
    {
        template <typename EXP>
        struct op : has_destructive_aliasing
        {
            const static long NR = 1;
            const static long NC = EXP::NC;
            typedef typename EXP::type type;
            typedef typename EXP::mem_manager_type mem_manager_type;
            template <typename M>
            static type apply ( const M& m, long row, long, long c)
            { return m(row,c); }

            template <typename M>
            static long nr (const M& m) { return 1; }
            template <typename M>
            static long nc (const M& m) { return m.nc(); }
        };
    };

    template <
        typename EXP
        >
    const matrix_exp<matrix_scalar_binary_exp<matrix_exp<EXP>,long,op_rowm> > rowm (
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

        typedef matrix_scalar_binary_exp<matrix_exp<EXP>,long,op_rowm> exp;
        return matrix_exp<exp>(exp(m,row));
    }

// ----------------------------------------------------------------------------------------

    struct op_colm
    {
        template <typename EXP>
        struct op : has_destructive_aliasing
        {
            const static long NR = EXP::NR;
            const static long NC = 1;
            typedef typename EXP::type type;
            typedef typename EXP::mem_manager_type mem_manager_type;
            template <typename M>
            static type apply ( const M& m, long col, long r, long)
            { return m(r,col); }

            template <typename M>
            static long nr (const M& m) { return m.nr(); }
            template <typename M>
            static long nc (const M& m) { return 1; }
        };
    };

    template <
        typename EXP
        >
    const matrix_exp<matrix_scalar_binary_exp<matrix_exp<EXP>,long,op_colm> > colm (
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

        typedef matrix_scalar_binary_exp<matrix_exp<EXP>,long,op_colm> exp;
        return matrix_exp<exp>(exp(m,col));
    }

// ----------------------------------------------------------------------------------------


    template <typename T, long NR, long NC, typename mm>
    class assignable_sub_matrix
    {
    public:
        assignable_sub_matrix(
            matrix<T,NR,NC,mm>& m_,
            const rectangle& rect_
        ) : m(m_), rect(rect_) {}

        template <typename EXP>
        assignable_sub_matrix& operator= (
            const matrix_exp<EXP>& exp
        ) 
        {
            DLIB_ASSERT( exp.nr() == (long)rect.height() && exp.nc() == (long)rect.width(),
                "\tassignable_matrix_expression set_subm()"
                << "\n\tYou have tried to assign to this object using a matrix that isn't the right size"
                << "\n\texp.nr() (source matrix): " << exp.nr()
                << "\n\texp.nc() (source matrix): " << exp.nc() 
                << "\n\trect.width() (target matrix):   " << rect.width()
                << "\n\trect.height() (target matrix):  " << rect.height()
                );

            if (exp.destructively_aliases(m) == false)
            {
                matrix_assign(m, exp, rect.top(), rect.left()); 
            }
            else
            {
                // make a temporary copy of the matrix we are going to assign to m to 
                // avoid aliasing issues during the copy
                this->operator=(tmp(exp));
            }

            return *this;
        }

        assignable_sub_matrix& operator= (
            const T& value
        )
        {
            for (long r = rect.top(); r <= rect.bottom(); ++r)
            {
                for (long c = rect.left(); c <= rect.right(); ++c)
                {
                    m(r,c) = value;
                }
            }

            return *this;
        }

    private:

        matrix<T,NR,NC,mm>& m;
        const rectangle rect;
    };


    template <typename T, long NR, long NC, typename mm>
    assignable_sub_matrix<T,NR,NC,mm> set_subm (
        matrix<T,NR,NC,mm>& m,
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


        return assignable_sub_matrix<T,NR,NC,mm>(m,rect);
    }


    template <typename T, long NR, long NC, typename mm>
    assignable_sub_matrix<T,NR,NC,mm> set_subm (
        matrix<T,NR,NC,mm>& m,
        long r, 
        long c,
        long nr,
        long nc
    )
    {
        DLIB_ASSERT(r >= 0 && c >= 0 && r+nr <= m.nr() && c+nc <= m.nc(), 
                    "\tassignable_matrix_expression set_subm(matrix& m, r, c, nr, nc)"
                    << "\n\tYou have specified invalid sub matrix dimensions"
                    << "\n\tm.nr(): " << m.nr()
                    << "\n\tm.nc(): " << m.nc() 
                    << "\n\tr:      " << r 
                    << "\n\tc:      " << c 
                    << "\n\tnr:     " << nr 
                    << "\n\tnc:     " << nc 
        );

        return assignable_sub_matrix<T,NR,NC,mm>(m,rectangle(c,r, c+nc-1, r+nr-1));
    }

// ----------------------------------------------------------------------------------------


    template <typename T, long NR, long NC, typename mm>
    class assignable_col_matrix
    {
    public:
        assignable_col_matrix(
            matrix<T,NR,NC,mm>& m_,
            const long col_ 
        ) : m(m_), col(col_) {}

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
                matrix_assign(m, exp, 0, col); 
            }
            else
            {
                // make a temporary copy of the matrix we are going to assign to m to 
                // avoid aliasing issues during the copy
                this->operator=(tmp(exp));
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

    private:

        matrix<T,NR,NC,mm>& m;
        const long col;
    };


    template <typename T, long NR, long NC, typename mm>
    assignable_col_matrix<T,NR,NC,mm> set_colm (
        matrix<T,NR,NC,mm>& m,
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


        return assignable_col_matrix<T,NR,NC,mm>(m,col);
    }

// ----------------------------------------------------------------------------------------


    template <typename T, long NR, long NC, typename mm>
    class assignable_row_matrix
    {
    public:
        assignable_row_matrix(
            matrix<T,NR,NC,mm>& m_,
            const long row_ 
        ) : m(m_), row(row_) {}

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
                matrix_assign(m, exp, row, 0); 
            }
            else
            {
                // make a temporary copy of the matrix we are going to assign to m to 
                // avoid aliasing issues during the copy
                this->operator=(tmp(exp));
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

    private:

        matrix<T,NR,NC,mm>& m;
        const long row;
    };


    template <typename T, long NR, long NC, typename mm>
    assignable_row_matrix<T,NR,NC,mm> set_rowm (
        matrix<T,NR,NC,mm>& m,
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


        return assignable_row_matrix<T,NR,NC,mm>(m,row);
    }

// ----------------------------------------------------------------------------------------

    struct op_trans 
    {
        template <typename EXP>
        struct op : has_destructive_aliasing
        {
            const static long NR = EXP::NC;
            const static long NC = EXP::NR;
            typedef typename EXP::type type;
            typedef typename EXP::mem_manager_type mem_manager_type;
            template <typename M>
            static type apply ( const M& m, long r, long c)
            { return m(c,r); }

            template <typename M>
            static long nr (const M& m) { return m.nc(); }
            template <typename M>
            static long nc (const M& m) { return m.nr(); }
        }; 
    };

    template <
        typename EXP
        >
    const matrix_exp<matrix_unary_exp<matrix_exp<EXP>,op_trans> > trans (
        const matrix_exp<EXP>& m
    )
    {
        typedef matrix_unary_exp<matrix_exp<EXP>,op_trans> exp;
        return matrix_exp<exp>(exp(m));
    }

// ----------------------------------------------------------------------------------------

    template <long R, long C>
    struct op_removerc
    {
        template <typename EXP>
        struct op : has_destructive_aliasing
        {
            const static long NR = (EXP::NR==0) ? 0 : (EXP::NR - 1);
            const static long NC = (EXP::NC==0) ? 0 : (EXP::NC - 1);
            typedef typename EXP::type type;
            typedef typename EXP::mem_manager_type mem_manager_type;
            template <typename M>
            static type apply ( const M& m, long r, long c)
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

            template <typename M>
            static long nr (const M& m) { return m.nr() - 1; }
            template <typename M>
            static long nc (const M& m) { return m.nc() - 1; }
        };
    };

    struct op_removerc2
    {
        template <typename EXP>
        struct op : has_destructive_aliasing
        {
            const static long NR = (EXP::NR==0) ? 0 : (EXP::NR - 1);
            const static long NC = (EXP::NC==0) ? 0 : (EXP::NC - 1);
            typedef typename EXP::type type;
            typedef typename EXP::mem_manager_type mem_manager_type;
            template <typename M>
            static type apply ( const M& m, long R, long C, long r, long c)
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

            template <typename M>
            static long nr (const M& m) { return m.nr() - 1; }
            template <typename M>
            static long nc (const M& m) { return m.nc() - 1; }
        };
    };

    template <
        long R,
        long C,
        typename EXP
        >
    const matrix_exp<matrix_unary_exp<matrix_exp<EXP>,op_removerc<R,C> > > removerc (
        const matrix_exp<EXP>& m
    )
    {
        // you can't remove a row from a matrix with only one row
        COMPILE_TIME_ASSERT(EXP::NR > R || EXP::NR == 0);
        // you can't remove a column from a matrix with only one column 
        COMPILE_TIME_ASSERT(EXP::NC > C || EXP::NR == 0);
        DLIB_ASSERT(m.nr() > R && m.nc() > C, 
            "\tconst matrix_exp removerc<R,C>(const matrix_exp& m)"
            << "\n\tYou can't remove a row/column from a matrix if it doesn't have that row/column"
            << "\n\tm.nr(): " << m.nr()
            << "\n\tm.nc(): " << m.nc() 
            << "\n\tR:      " << R 
            << "\n\tC:      " << C 
            );
        typedef matrix_unary_exp<matrix_exp<EXP>,op_removerc<R,C> > exp;
        return matrix_exp<exp>(exp(m));
    }

    template <
        typename EXP
        >
    const matrix_exp<matrix_scalar_trinary_exp<matrix_exp<EXP>,long,op_removerc2> > removerc (
        const matrix_exp<EXP>& m,
        long R,
        long C
    )
    {
        DLIB_ASSERT(m.nr() > R && m.nc() > C, 
            "\tconst matrix_exp removerc(const matrix_exp& m,R,C)"
            << "\n\tYou can't remove a row/column from a matrix if it doesn't have that row/column"
            << "\n\tm.nr(): " << m.nr()
            << "\n\tm.nc(): " << m.nc() 
            << "\n\tR:      " << R 
            << "\n\tC:      " << C 
            );
        typedef matrix_scalar_trinary_exp<matrix_exp<EXP>,long,op_removerc2 > exp;
        return matrix_exp<exp>(exp(m,R,C));
    }

// ----------------------------------------------------------------------------------------

    template <long C>
    struct op_remove_col
    {
        template <typename EXP>
        struct op : has_destructive_aliasing
        {
            const static long NR = EXP::NR;
            const static long NC = (EXP::NC==0) ? 0 : (EXP::NC - 1);
            typedef typename EXP::type type;
            typedef typename EXP::mem_manager_type mem_manager_type;
            template <typename M>
            static type apply ( const M& m, long r, long c)
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

            template <typename M>
            static long nr (const M& m) { return m.nr(); }
            template <typename M>
            static long nc (const M& m) { return m.nc() - 1; }
        };
    };

    struct op_remove_col2
    {
        template <typename EXP>
        struct op : has_destructive_aliasing
        {
            const static long NR = EXP::NR;
            const static long NC = (EXP::NC==0) ? 0 : (EXP::NC - 1);
            typedef typename EXP::type type;
            typedef typename EXP::mem_manager_type mem_manager_type;
            template <typename M>
            static type apply ( const M& m, long C, long r, long c)
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

            template <typename M>
            static long nr (const M& m) { return m.nr(); }
            template <typename M>
            static long nc (const M& m) { return m.nc() - 1; }
        };
    };

    template <
        long C,
        typename EXP
        >
    const matrix_exp<matrix_unary_exp<matrix_exp<EXP>,op_remove_col<C> > > remove_col (
        const matrix_exp<EXP>& m
    )
    {
        // You can't remove the given column from the matrix because the matrix doesn't
        // have a column with that index.
        COMPILE_TIME_ASSERT(EXP::NC > C || EXP::NC == 0);
        DLIB_ASSERT(m.nc() > C , 
            "\tconst matrix_exp remove_col<C>(const matrix_exp& m)"
            << "\n\tYou can't remove a col from a matrix if it doesn't have it"
            << "\n\tm.nr(): " << m.nr()
            << "\n\tm.nc(): " << m.nc() 
            << "\n\tC:      " << C 
            );
        typedef matrix_unary_exp<matrix_exp<EXP>,op_remove_col<C> > exp;
        return matrix_exp<exp>(exp(m));
    }

    template <
        typename EXP
        >
    const matrix_exp<matrix_scalar_binary_exp<matrix_exp<EXP>,long,op_remove_col2 > > remove_col (
        const matrix_exp<EXP>& m,
        long C
    )
    {
        DLIB_ASSERT(m.nc() > C , 
            "\tconst matrix_exp remove_col(const matrix_exp& m,C)"
            << "\n\tYou can't remove a col from a matrix if it doesn't have it"
            << "\n\tm.nr(): " << m.nr()
            << "\n\tm.nc(): " << m.nc() 
            << "\n\tC:      " << C 
            );
        typedef matrix_scalar_binary_exp<matrix_exp<EXP>,long,op_remove_col2 > exp;
        return matrix_exp<exp>(exp(m,C));
    }

// ----------------------------------------------------------------------------------------

    template <long R>
    struct op_remove_row
    {
        template <typename EXP>
        struct op : has_destructive_aliasing
        {
            const static long NR = (EXP::NR==0) ? 0 : (EXP::NR - 1);
            const static long NC = EXP::NC;
            typedef typename EXP::type type;
            typedef typename EXP::mem_manager_type mem_manager_type;
            template <typename M>
            static type apply ( const M& m, long r, long c)
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

            template <typename M>
            static long nr (const M& m) { return m.nr() - 1; }
            template <typename M>
            static long nc (const M& m) { return m.nc(); }
        };
    };

    struct op_remove_row2
    {
        template <typename EXP>
        struct op : has_destructive_aliasing
        {
            const static long NR = (EXP::NR==0) ? 0 : (EXP::NR - 1);
            const static long NC = EXP::NC;
            typedef typename EXP::type type;
            typedef typename EXP::mem_manager_type mem_manager_type;
            template <typename M>
            static type apply ( const M& m, long R, long r, long c)
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

            template <typename M>
            static long nr (const M& m) { return m.nr() - 1; }
            template <typename M>
            static long nc (const M& m) { return m.nc(); }
        };
    };

    template <
        long R,
        typename EXP
        >
    const matrix_exp<matrix_unary_exp<matrix_exp<EXP>,op_remove_row<R> > > remove_row (
        const matrix_exp<EXP>& m
    )
    {
        // You can't remove the given row from the matrix because the matrix doesn't
        // have a row with that index.
        COMPILE_TIME_ASSERT(EXP::NR > R || EXP::NR == 0);
        DLIB_ASSERT(m.nr() > R , 
            "\tconst matrix_exp remove_row<R>(const matrix_exp& m)"
            << "\n\tYou can't remove a row from a matrix if it doesn't have it"
            << "\n\tm.nr(): " << m.nr()
            << "\n\tm.nc(): " << m.nc() 
            << "\n\tR:      " << R 
            );
        typedef matrix_unary_exp<matrix_exp<EXP>,op_remove_row<R> > exp;
        return matrix_exp<exp>(exp(m));
    }

    template <
        typename EXP
        >
    const matrix_exp<matrix_scalar_binary_exp<matrix_exp<EXP>,long,op_remove_row2> > remove_row (
        const matrix_exp<EXP>& m,
        long R
    )
    {
        DLIB_ASSERT(m.nr() > R , 
            "\tconst matrix_exp remove_row(const matrix_exp& m, long R)"
            << "\n\tYou can't remove a row from a matrix if it doesn't have it"
            << "\n\tm.nr(): " << m.nr()
            << "\n\tm.nc(): " << m.nc() 
            << "\n\tR:      " << R 
            );
        typedef matrix_scalar_binary_exp<matrix_exp<EXP>,long,op_remove_row2 > exp;
        return matrix_exp<exp>(exp(m,R));
    }

// ----------------------------------------------------------------------------------------

    struct op_diagm
    {
        template <typename EXP>
        struct op : has_destructive_aliasing
        {
            const static long N = EXP::NC*EXP::NR;
            const static long NR = N;
            const static long NC = N;
            typedef typename EXP::type type;
            typedef typename EXP::mem_manager_type mem_manager_type;
            template <typename M>
            static type apply ( const M& m, long r, long c)
            { 
                if (r==c)
                    return m(r); 
                else
                    return 0;
            }

            template <typename M>
            static long nr (const M& m) { return (m.nr()>m.nc())? m.nr():m.nc(); }
            template <typename M>
            static long nc (const M& m) { return (m.nr()>m.nc())? m.nr():m.nc(); }
        };
    };

    template <
        typename EXP
        >
    const matrix_exp<matrix_unary_exp<matrix_exp<EXP>,op_diagm> > diagm (
        const matrix_exp<EXP>& m
    )
    {
        // You can only make a diagonal matrix out of a row or column vector
        COMPILE_TIME_ASSERT(EXP::NR == 0 || EXP::NR == 1 || EXP::NC == 1 || EXP::NC == 0);
        DLIB_ASSERT(m.nr() == 1 || m.nc() == 1, 
            "\tconst matrix_exp diagm(const matrix_exp& m)"
            << "\n\tYou can only apply diagm() to a row or column matrix"
            << "\n\tm.nr(): " << m.nr()
            << "\n\tm.nc(): " << m.nc() 
            );
        typedef matrix_unary_exp<matrix_exp<EXP>,op_diagm> exp;
        return matrix_exp<exp>(exp(m));
    }

// ----------------------------------------------------------------------------------------

    struct op_diag
    {
        template <typename EXP>
        struct op : has_destructive_aliasing
        {
            const static long NR = EXP::NC;
            const static long NC = 1;
            typedef typename EXP::type type;
            typedef typename EXP::mem_manager_type mem_manager_type;
            template <typename M>
            static type apply ( const M& m, long r, long c)
            { return m(r,r); }

            template <typename M>
            static long nr (const M& m) { return m.nr(); }
            template <typename M>
            static long nc (const M& m) { return 1; }
        };
    };

    template <
        typename EXP
        >
    const matrix_exp<matrix_unary_exp<matrix_exp<EXP>,op_diag> > diag (
        const matrix_exp<EXP>& m
    )
    {
        // You can only get the diagonal for square matrices.
        COMPILE_TIME_ASSERT(EXP::NR == EXP::NC);
        DLIB_ASSERT(m.nr() == m.nc(), 
            "\tconst matrix_exp diag(const matrix_exp& m)"
            << "\n\tYou can only apply diag() to a square matrix"
            << "\n\tm.nr(): " << m.nr()
            << "\n\tm.nc(): " << m.nc() 
            );
        typedef matrix_unary_exp<matrix_exp<EXP>,op_diag> exp;
        return matrix_exp<exp>(exp(m));
    }

// ----------------------------------------------------------------------------------------

    template <typename target_type>
    struct op_cast
    {
        template <typename EXP>
        struct op : has_nondestructive_aliasing, preserves_dimensions<EXP>
        {
            typedef target_type type;
            template <typename M>
            static type apply ( const M& m, long r, long c)
            { return static_cast<target_type>(m(r,c)); }
        };
    };

    template <
        typename target_type,
        typename EXP
        >
    const matrix_exp<matrix_unary_exp<matrix_exp<EXP>,op_cast<target_type> > > matrix_cast (
        const matrix_exp<EXP>& m
    )
    {
        typedef matrix_unary_exp<matrix_exp<EXP>,op_cast<target_type> > exp;
        return matrix_exp<exp>(exp(m));
    }

// ----------------------------------------------------------------------------------------

    template <
        typename T,
        long NR,
        long NC,
        typename MM,
        typename U
        >
    typename disable_if<is_matrix<U>,void>::type set_all_elements (
        matrix<T,NR,NC,MM>& m,
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
        typename U
        >
    typename enable_if<is_matrix<U>,void>::type set_all_elements (
        matrix<T,NR,NC,MM>& m,
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
        typename EXP,
        long uNR, 
        long uNC,
        long wN, 
        long vN,
        long wX,
        typename MM1,
        typename MM2,
        typename MM3
        >
    inline void svd3 (
        const matrix_exp<EXP>& m,
        matrix<typename matrix_exp<EXP>::type, uNR, uNC,MM1>& u,
        matrix<typename matrix_exp<EXP>::type, wN, wX,MM2>& w,
        matrix<typename matrix_exp<EXP>::type, vN, vN,MM3>& v
    )
    {
        typedef typename matrix_exp<EXP>::type T;
        const long NR = matrix_exp<EXP>::NR;
        const long NC = matrix_exp<EXP>::NC;

        // make sure the output matrices have valid dimensions if they are statically dimensioned
        COMPILE_TIME_ASSERT(NR == 0 || uNR == 0 || NR == uNR);
        COMPILE_TIME_ASSERT(NC == 0 || uNC == 0 || NC == uNC);
        COMPILE_TIME_ASSERT(NC == 0 || wN == 0 || NC == wN);
        COMPILE_TIME_ASSERT(NC == 0 || vN == 0 || NC == vN);
        COMPILE_TIME_ASSERT(wX == 0 || wX == 1);

        v.set_size(m.nc(),m.nc());

        typedef typename matrix_exp<EXP>::type T;
        u = m;

        w.set_size(m.nc(),1);
        matrix<T,matrix_exp<EXP>::NC,1,MM1> rv1(m.nc(),1);
        nric::svdcmp(u,w,v,rv1);
    }

// ----------------------------------------------------------------------------------------

    template <
        typename EXP,
        long uNR, 
        long uNC,
        long wN, 
        long vN,
        typename MM1,
        typename MM2,
        typename MM3
        >
    inline void svd (
        const matrix_exp<EXP>& m,
        matrix<typename matrix_exp<EXP>::type, uNR, uNC,MM1>& u,
        matrix<typename matrix_exp<EXP>::type, wN, wN,MM2>& w,
        matrix<typename matrix_exp<EXP>::type, vN, vN,MM3>& v
    )
    {
        typedef typename matrix_exp<EXP>::type T;
        const long NR = matrix_exp<EXP>::NR;
        const long NC = matrix_exp<EXP>::NC;

        // make sure the output matrices have valid dimensions if they are statically dimensioned
        COMPILE_TIME_ASSERT(NR == 0 || uNR == 0 || NR == uNR);
        COMPILE_TIME_ASSERT(NC == 0 || uNC == 0 || NC == uNC);
        COMPILE_TIME_ASSERT(NC == 0 || wN == 0 || NC == wN);
        COMPILE_TIME_ASSERT(NC == 0 || vN == 0 || NC == vN);

        matrix<T,matrix_exp<EXP>::NC,1,MM1> W;
        svd3(m,u,W,v);
        w = diagm(W);
    }

// ----------------------------------------------------------------------------------------

    template <
        typename EXP
        >
    inline const matrix<typename EXP::type,EXP::NC,EXP::NR,typename EXP::mem_manager_type> pinv ( 
        const matrix_exp<EXP>& m
    )
    { 
        typename matrix_exp<EXP>::matrix_type u;
        typedef typename EXP::mem_manager_type MM1;
        matrix<typename EXP::type, EXP::NC, EXP::NC,MM1 > v;

        typedef typename matrix_exp<EXP>::type T;

        v.set_size(m.nc(),m.nc());

        typedef typename matrix_exp<EXP>::type T;
        u = m;

        matrix<T,matrix_exp<EXP>::NC,1,MM1> w(m.nc(),1);
        matrix<T,matrix_exp<EXP>::NC,1,MM1> rv1(m.nc(),1);

        nric::svdcmp(u,w,v,rv1);

        const double machine_eps = std::numeric_limits<typename EXP::type>::epsilon();
        // compute a reasonable epsilon below which we round to zero before doing the
        // reciprocal
        const double eps = machine_eps*std::max(m.nr(),m.nc())*max(w);

        // now compute the pseudoinverse
        return tmp(scale_columns(v,reciprocal(round_zeros(w,eps))))*trans(u);
    }

// ----------------------------------------------------------------------------------------

    template <
        typename EXP,
        long N
        >
    struct inv_helper
    {
        static const typename matrix_exp<EXP>::matrix_type inv (
            const matrix_exp<EXP>& m
        )
        {
            using namespace nric;
            typedef typename EXP::mem_manager_type MM;
            // you can't invert a non-square matrix
            COMPILE_TIME_ASSERT(matrix_exp<EXP>::NR == matrix_exp<EXP>::NC || 
                                matrix_exp<EXP>::NR == 0 ||
                                matrix_exp<EXP>::NC == 0);
            DLIB_ASSERT(m.nr() == m.nc(), 
                "\tconst matrix_exp::type inv(const matrix_exp& m)"
                << "\n\tYou can only apply inv() to a square matrix"
                << "\n\tm.nr(): " << m.nr()
                << "\n\tm.nc(): " << m.nc() 
                );
            typedef typename matrix_exp<EXP>::type type;

            matrix<type, N, N,MM> a(m), y(m.nr(),m.nr());
            matrix<long,N,1,MM> indx(m.nr(),1);
            matrix<type,N,1,MM> col(m.nr(),1);
            matrix<type,N,1,MM> vv(m.nr(),1);
            type d;
            long i, j;
            if (ludcmp(a,indx,d,vv))
            {
                for (j = 0; j < m.nr(); ++j)
                {
                    for (i = 0; i < m.nr(); ++i)
                        col(i) = 0;
                    col(j) = 1;
                    lubksb(a,indx,col);
                    for (i = 0; i < m.nr(); ++i)
                        y(i,j) = col(i);
                }
            }
            else
            {
                // m is singular so lets just set y equal to m just so that 
                // it has some value
                y = m;
            }
            return y;
        }
    };

    template <
        typename EXP
        >
    struct inv_helper<EXP,1>
    {
        static const typename matrix_exp<EXP>::matrix_type inv (
            const matrix_exp<EXP>& m
        )
        {
            COMPILE_TIME_ASSERT(matrix_exp<EXP>::NR == matrix_exp<EXP>::NC);
            typedef typename matrix_exp<EXP>::type type;

            matrix<type, 1, 1, typename EXP::mem_manager_type> a;
            a(0) = 1/m(0);
            return a;
        }
    };

    template <
        typename EXP
        >
    struct inv_helper<EXP,2>
    {
        static const typename matrix_exp<EXP>::matrix_type inv (
            const matrix_exp<EXP>& m
        )
        {
            COMPILE_TIME_ASSERT(matrix_exp<EXP>::NR == matrix_exp<EXP>::NC);
            typedef typename matrix_exp<EXP>::type type;

            matrix<type, 2, 2, typename EXP::mem_manager_type> a;
            type d = static_cast<type>(1.0/det(m));
            a(0,0) = m(1,1)*d;
            a(0,1) = m(0,1)*-d;
            a(1,0) = m(1,0)*-d;
            a(1,1) = m(0,0)*d;
            return a;
        }
    };

    template <
        typename EXP
        >
    struct inv_helper<EXP,3>
    {
        static const typename matrix_exp<EXP>::matrix_type inv (
            const matrix_exp<EXP>& m
        )
        {
            COMPILE_TIME_ASSERT(matrix_exp<EXP>::NR == matrix_exp<EXP>::NC);
            typedef typename matrix_exp<EXP>::type type;

            matrix<type, 3, 3, typename EXP::mem_manager_type> ret;
            const type de = static_cast<type>(1.0/det(m));
            const type a = m(0,0);
            const type b = m(0,1);
            const type c = m(0,2);
            const type d = m(1,0);
            const type e = m(1,1);
            const type f = m(1,2);
            const type g = m(2,0);
            const type h = m(2,1);
            const type i = m(2,2);

            ret(0,0) = (e*i - f*h)*de;
            ret(1,0) = (f*g - d*i)*de;
            ret(2,0) = (d*h - e*g)*de;

            ret(0,1) = (c*h - b*i)*de;
            ret(1,1) = (a*i - c*g)*de;
            ret(2,1) = (b*g - a*h)*de;

            ret(0,2) = (b*f - c*e)*de;
            ret(1,2) = (c*d - a*f)*de;
            ret(2,2) = (a*e - b*d)*de;

            return ret;
        }
    };

    template <
        typename EXP
        >
    struct inv_helper<EXP,4>
    {
        static const typename matrix_exp<EXP>::matrix_type inv (
            const matrix_exp<EXP>& m
        )
        {
            COMPILE_TIME_ASSERT(matrix_exp<EXP>::NR == matrix_exp<EXP>::NC);
            typedef typename matrix_exp<EXP>::type type;

            matrix<type, 4, 4, typename EXP::mem_manager_type> ret;
            const type de = static_cast<type>(1.0/det(m));
            ret(0,0) =  det(removerc<0,0>(m));
            ret(0,1) = -det(removerc<0,1>(m));
            ret(0,2) =  det(removerc<0,2>(m));
            ret(0,3) = -det(removerc<0,3>(m));

            ret(1,0) = -det(removerc<1,0>(m));
            ret(1,1) =  det(removerc<1,1>(m));
            ret(1,2) = -det(removerc<1,2>(m));
            ret(1,3) =  det(removerc<1,3>(m));

            ret(2,0) =  det(removerc<2,0>(m));
            ret(2,1) = -det(removerc<2,1>(m));
            ret(2,2) =  det(removerc<2,2>(m));
            ret(2,3) = -det(removerc<2,3>(m));

            ret(3,0) = -det(removerc<3,0>(m));
            ret(3,1) =  det(removerc<3,1>(m));
            ret(3,2) = -det(removerc<3,2>(m));
            ret(3,3) =  det(removerc<3,3>(m));

            return trans(ret)*de;
        }
    };

    template <
        typename EXP
        >
    inline const typename matrix_exp<EXP>::matrix_type inv (
        const matrix_exp<EXP>& m
    ) { return inv_helper<EXP,matrix_exp<EXP>::NR>::inv(m); }

// ----------------------------------------------------------------------------------------

    template <typename EXP>
    const typename matrix_exp<EXP>::matrix_type  inv_lower_triangular (
        const matrix_exp<EXP>& A 
    )
    {
        DLIB_ASSERT(A.nr() == A.nc(), 
            "\tconst matrix inv_lower_triangular(const matrix_exp& A)"
            << "\n\tA must be a square matrix"
            << "\n\tA.nr(): " << A.nr()
            << "\n\tA.nc(): " << A.nc() 
            );

        typedef typename matrix_exp<EXP>::matrix_type matrix_type;
        typedef typename matrix_type::type type;

        matrix_type m(A);

        for(long c = 0; c < m.nc(); ++c)
        {
            if( m(c,c) == 0 )
            {
                // there isn't an inverse so just give up
                return m;
            }

            // compute m(c,c)
            m(c,c) = 1/m(c,c);

            // compute the values in column c that are below m(c,c).
            // We do this by just doing the same thing we do for upper triangular
            // matrices because we take the transpose of m which turns m into an
            // upper triangular matrix.
            for(long r = 0; r < c; ++r)
            {
                const long n = c-r;
                m(c,r) = -m(c,c)*subm(trans(m),r,r,1,n)*subm(trans(m),r,c,n,1);
            }
        }

        return m;

    }

// ----------------------------------------------------------------------------------------

    template <typename EXP>
    const typename matrix_exp<EXP>::matrix_type  inv_upper_triangular (
        const matrix_exp<EXP>& A 
    )
    {
        DLIB_ASSERT(A.nr() == A.nc(), 
            "\tconst matrix inv_upper_triangular(const matrix_exp& A)"
            << "\n\tA must be a square matrix"
            << "\n\tA.nr(): " << A.nr()
            << "\n\tA.nc(): " << A.nc() 
            );

        typedef typename matrix_exp<EXP>::matrix_type matrix_type;
        typedef typename matrix_type::type type;

        matrix_type m(A);

        for(long c = 0; c < m.nc(); ++c)
        {
            if( m(c,c) == 0 )
            {
                // there isn't an inverse so just give up
                return m;
            }

            // compute m(c,c)
            m(c,c) = 1/m(c,c);

            // compute the values in column c that are above m(c,c)
            for(long r = 0; r < c; ++r)
            {
                const long n = c-r;
                m(r,c) = -m(c,c)*subm(m,r,r,1,n)*subm(m,r,c,n,1);
            }
        }

        return m;

    }

// ----------------------------------------------------------------------------------------

    template <
        typename EXP
        >
    inline const typename matrix_exp<EXP>::matrix_type cholesky_decomposition (
        const matrix_exp<EXP>& A
    )
    {
        DLIB_ASSERT(A.nr() == A.nc(), 
            "\tconst matrix cholesky_decomposition(const matrix_exp& A)"
            << "\n\tYou can only apply the cholesky_decomposition to a square matrix"
            << "\n\tA.nr(): " << A.nr()
            << "\n\tA.nc(): " << A.nc() 
            );

        typename matrix_exp<EXP>::matrix_type L(A.nr(),A.nc());
        typedef typename EXP::type T;
        set_all_elements(L,0);

        // do nothing if the matrix is empty
        if (A.size() == 0)
            return L;

        // compute the upper left corner
        if (A(0,0) > 0)
            L(0,0) = std::sqrt(A(0,0));

        // compute the first column
        for (long r = 1; r < A.nr(); ++r)
        {
            if (L(0,0) > 0)
                L(r,0) = A(r,0)/L(0,0);
            else
                L(r,0) = A(r,0);
        }

        // now compute all the other columns
        for (long c = 1; c < A.nc(); ++c)
        {
            // compute the diagonal element
            T temp = A(c,c);
            for (long i = 0; i < c; ++i)
            {
                temp -= L(c,i)*L(c,i);
            }
            if (temp > 0)
                L(c,c) = std::sqrt(temp);

            // compute the non diagonal elements
            for (long r = c+1; r < A.nr(); ++r)
            {
                temp = A(r,c);
                for (long i = 0; i < c; ++i)
                {
                    temp -= L(r,i)*L(c,i);
                }
                if (L(c,c) > 0)
                    L(r,c) = temp/L(c,c);
                else
                    L(r,c) = temp;
            }
        }

        return L;
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

    template <
        typename EXP
        >
    inline const typename matrix_exp<EXP>::type mean (
        const matrix_exp<EXP>& m
    )
    {
        return sum(m)/(m.nr()*m.nc());
    }

// ----------------------------------------------------------------------------------------

    template <
        typename EXP
        >
    const typename lazy_disable_if<is_matrix<typename EXP::type>, EXP>::type variance (
        const matrix_exp<EXP>& m
    )
    {
        const typename matrix_exp<EXP>::type avg = mean(m);

        typedef typename matrix_exp<EXP>::type type;

        type val = 0;
        for (long r = 0; r < m.nr(); ++r)
        {
            for (long c = 0; c < m.nc(); ++c)
            {
                val += std::pow(m(r,c) - avg,2);
            }
        }

        if (m.nr() * m.nc() == 1)
            return val;
        else
            return val/(m.nr()*m.nc() - 1);
    }

    template <
        typename EXP
        >
    const typename lazy_enable_if<is_matrix<typename EXP::type>, EXP >::type variance (
        const matrix_exp<EXP>& m
    )
    {
        const typename matrix_exp<EXP>::type avg = mean(m);

        typedef typename matrix_exp<EXP>::type type;

        type val;
        if (m.size() > 0)
            val.set_size(m(0,0).nr(), m(0,0).nc());

        set_all_elements(val,0);
        for (long r = 0; r < m.nr(); ++r)
        {
            for (long c = 0; c < m.nc(); ++c)
            {
                val += pow(m(r,c) - avg,2);
            }
        }

        if (m.nr() * m.nc() <= 1)
            return val;
        else
            return val/(m.nr()*m.nc() - 1);
    }

// ----------------------------------------------------------------------------------------

    template <
        typename EXP
        >
    const matrix<typename EXP::type::type, EXP::type::NR, EXP::type::NR, typename EXP::mem_manager_type> covariance (
        const matrix_exp<EXP>& m
    )
    {
        // perform static checks to make sure m is a column vector 
        COMPILE_TIME_ASSERT(EXP::NR == 0 || EXP::NR > 1);
        COMPILE_TIME_ASSERT(EXP::NC == 1 || EXP::NC == 0);

        // perform static checks to make sure the matrices contained in m are column vectors
        COMPILE_TIME_ASSERT(EXP::type::NC == 1 || EXP::type::NC == 0 );

        DLIB_ASSERT(m.nr() > 1 && m.nc() == 1, 
            "\tconst matrix covariance(const matrix_exp& m)"
            << "\n\tYou can only apply covariance() to a column matrix"
            << "\n\tm.nr(): " << m.nr()
            << "\n\tm.nc(): " << m.nc() 
            );
#ifdef ENABLE_ASSERTS
        for (long i = 0; i < m.nr(); ++i)
        {
            DLIB_ASSERT(m(0).nr() == m(i).nr() && m(i).nr() > 0 && m(i).nc() == 1, 
                   "\tconst matrix covariance(const matrix_exp& m)"
                   << "\n\tYou can only apply covariance() to a column matrix of column matrices"
                   << "\n\tm(0).nr(): " << m(0).nr()
                   << "\n\tm(i).nr(): " << m(i).nr() 
                   << "\n\tm(i).nc(): " << m(i).nc() 
                   << "\n\ti:         " << i 
                );
        }
#endif

        // now perform the actual calculation of the covariance matrix.
        matrix<typename EXP::type::type, EXP::type::NR, EXP::type::NR, typename EXP::mem_manager_type> cov(m(0).nr(),m(0).nr());
        set_all_elements(cov,0);

        const matrix<double,EXP::type::NR,EXP::type::NC, typename EXP::mem_manager_type> avg = mean(m);

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
        typename EXP,
        long N = EXP::NR
        >
    struct det_helper
    {
        static const typename matrix_exp<EXP>::type det (
            const matrix_exp<EXP>& m
        )
        {
            using namespace nric;
            COMPILE_TIME_ASSERT(matrix_exp<EXP>::NR == matrix_exp<EXP>::NC ||
                                matrix_exp<EXP>::NR == 0 ||
                                matrix_exp<EXP>::NC == 0 
                                );
            DLIB_ASSERT(m.nr() == m.nc(), 
                "\tconst matrix_exp::type det(const matrix_exp& m)"
                << "\n\tYou can only apply det() to a square matrix"
                << "\n\tm.nr(): " << m.nr()
                << "\n\tm.nc(): " << m.nc() 
                );
            typedef typename matrix_exp<EXP>::type type;
            typedef typename matrix_exp<EXP>::mem_manager_type MM;

            matrix<type, N, N,MM> lu(m);
            matrix<long,N,1,MM> indx(m.nr(),1);
            matrix<type,N,1,MM> vv(m.nr(),1);
            type d;
            if (ludcmp(lu,indx,d,vv) == false)
            {
                // the matrix is singular so its det is 0
                return 0;
            }

            return prod(diag(lu))*d;
        }
    };

    template <
        typename EXP
        >
    struct det_helper<EXP,1>
    {
        static const typename matrix_exp<EXP>::type det (
            const matrix_exp<EXP>& m
        )
        {
            COMPILE_TIME_ASSERT(matrix_exp<EXP>::NR == matrix_exp<EXP>::NC);
            typedef typename matrix_exp<EXP>::type type;

            return m(0);
        }
    };

    template <
        typename EXP
        >
    struct det_helper<EXP,2>
    {
        static const typename matrix_exp<EXP>::type det (
            const matrix_exp<EXP>& m
        )
        {
            COMPILE_TIME_ASSERT(matrix_exp<EXP>::NR == matrix_exp<EXP>::NC);
            typedef typename matrix_exp<EXP>::type type;

            return m(0,0)*m(1,1) - m(0,1)*m(1,0);
        }
    };

    template <
        typename EXP
        >
    struct det_helper<EXP,3>
    {
        static const typename matrix_exp<EXP>::type det (
            const matrix_exp<EXP>& m
        )
        {
            COMPILE_TIME_ASSERT(matrix_exp<EXP>::NR == matrix_exp<EXP>::NC);
            typedef typename matrix_exp<EXP>::type type;

            type temp = m(0,0)*(m(1,1)*m(2,2) - m(1,2)*m(2,1)) -
                        m(0,1)*(m(1,0)*m(2,2) - m(1,2)*m(2,0)) +
                        m(0,2)*(m(1,0)*m(2,1) - m(1,1)*m(2,0));
            return temp;
        }
    };


    template <
        typename EXP
        >
    inline const typename matrix_exp<EXP>::type det (
        const matrix_exp<EXP>& m
    ) { return det_helper<EXP>::det(m); }


    template <
        typename EXP
        >
    struct det_helper<EXP,4>
    {
        static const typename matrix_exp<EXP>::type det (
            const matrix_exp<EXP>& m
        )
        {
            COMPILE_TIME_ASSERT(matrix_exp<EXP>::NR == matrix_exp<EXP>::NC);
            typedef typename matrix_exp<EXP>::type type;

            type temp = m(0,0)*(dlib::det(removerc<0,0>(m))) -
                        m(0,1)*(dlib::det(removerc<0,1>(m))) +
                        m(0,2)*(dlib::det(removerc<0,2>(m))) -
                        m(0,3)*(dlib::det(removerc<0,3>(m)));
            return temp;
        }
    };

// ----------------------------------------------------------------------------------------

    template <
        typename T 
        >
    struct op_uniform_matrix_3 : has_nondestructive_aliasing 
    {
        const static long NR = 0;
        const static long NC = 0;
        typedef typename memory_manager<char>::kernel_1a mem_manager_type;
        typedef T type;
        static type apply (const T& val, long r, long c)
        { return val; }
    };

    template <
        typename T
        >
    const matrix_exp<dynamic_matrix_scalar_unary_exp<T,op_uniform_matrix_3<T> > > uniform_matrix (
        long nr,
        long nc,
        const T& val
    )
    {
        DLIB_ASSERT(nr > 0 && nc > 0, 
            "\tconst matrix_exp uniform_matrix<T>(nr, nc)"
            << "\n\tnr and nc have to be bigger than 0"
            << "\n\tnr: " << nr
            << "\n\tnc: " << nc
            );
        typedef dynamic_matrix_scalar_unary_exp<T,op_uniform_matrix_3<T> > exp;
        return matrix_exp<exp>(exp(nr,nc,val));
    }

// ----------------------------------------------------------------------------------------

    template <
        typename T, 
        long NR_, 
        long NC_ 
        >
    struct op_uniform_matrix_2 : has_nondestructive_aliasing 
    {
        const static long NR = NR_;
        const static long NC = NC_;
        typedef typename memory_manager<char>::kernel_1a mem_manager_type;
        typedef T type;
        static type apply (const T& val, long r, long c)
        { return val; }
    };

    template <
        typename T,
        long NR, 
        long NC
        >
    const matrix_exp<matrix_scalar_unary_exp<T,op_uniform_matrix_2<T,NR,NC> > > uniform_matrix (
        const T& val
    )
    {
        COMPILE_TIME_ASSERT(NR > 0 && NC > 0);

        typedef matrix_scalar_unary_exp<T,op_uniform_matrix_2<T,NR,NC> > exp;
        return matrix_exp<exp>(exp(val));
    }

// ----------------------------------------------------------------------------------------

    template <
        typename T, 
        long NR_, 
        long NC_, 
        T val
        >
    struct op_uniform_matrix : has_nondestructive_aliasing
    {
        const static long NR = NR_;
        const static long NC = NC_;
        typedef typename memory_manager<char>::kernel_1a mem_manager_type;
        typedef T type;
        static type apply ( long r, long c)
        { return val; }
    };

    template <
        typename T, 
        long NR, 
        long NC, 
        T val
        >
    const matrix_exp<matrix_zeroary_exp<op_uniform_matrix<T,NR,NC,val> > > uniform_matrix (
    )
    {
        COMPILE_TIME_ASSERT(NR > 0 && NC > 0);
        typedef matrix_zeroary_exp<op_uniform_matrix<T,NR,NC,val> > exp;
        return matrix_exp<exp>(exp());
    }

// ----------------------------------------------------------------------------------------

    template <
        typename T 
        >
    struct op_identity_matrix_2 : has_nondestructive_aliasing 
    {
        const static long NR = 0;
        const static long NC = 0;
        typedef typename memory_manager<char>::kernel_1a mem_manager_type;
        typedef T type;
        static type apply (const T&, long r, long c)
        { return static_cast<type>(r == c); }
    };

    template <
        typename T
        >
    const matrix_exp<dynamic_matrix_scalar_unary_exp<T,op_identity_matrix_2<T> > > identity_matrix (
        const long& size 
    )
    {
        DLIB_ASSERT(size > 0, 
            "\tconst matrix_exp identity_matrix<T>(size)"
            << "\n\tsize must be bigger than 0"
            << "\n\tsize: " << size 
            );
        typedef dynamic_matrix_scalar_unary_exp<T,op_identity_matrix_2<T> > exp;
        // the scalar value of the dynamic_matrix_scalar_unary_exp just isn't
        // used by this operator
        return matrix_exp<exp>(exp(size,size,0));
    }

// ----------------------------------------------------------------------------------------

    template <
        typename T, 
        long N
        >
    struct op_identity_matrix : has_nondestructive_aliasing
    {
        const static long NR = N;
        const static long NC = N;
        typedef typename memory_manager<char>::kernel_1a mem_manager_type;
        typedef T type;
        static type apply ( long r, long c)
        { return static_cast<type>(r == c); }

        template <typename M>
        static long nr (const M&) { return NR; }
        template <typename M>
        static long nc (const M&) { return NC; }
    };

    template <
        typename T, 
        long N
        >
    const matrix_exp<matrix_zeroary_exp<op_identity_matrix<T,N> > > identity_matrix (
    )
    {
        COMPILE_TIME_ASSERT(N > 0);

        typedef matrix_zeroary_exp<op_identity_matrix<T,N> > exp;
        return matrix_exp<exp>(exp());
    }

// ----------------------------------------------------------------------------------------

    template <long R, long C>
    struct op_rotate
    {
        template <typename EXP>
        struct op : has_destructive_aliasing, preserves_dimensions<EXP>
        {
            typedef typename EXP::type type;
            template <typename M>
            static type apply ( const M& m, long r, long c)
            { return m((r+R)%m.nr(),(c+C)%m.nc()); }
        };
    };

    template <
        long R,
        long C,
        typename EXP
        >
    const matrix_exp<matrix_unary_exp<matrix_exp<EXP>,op_rotate<R,C> > > rotate (
        const matrix_exp<EXP>& m
    )
    {
        // You can't rotate a matrix by more rows than it has.
        COMPILE_TIME_ASSERT(R < EXP::NR || EXP::NR == 0);
        // You can't rotate a matrix by more columns than it has.
        COMPILE_TIME_ASSERT(C < EXP::NC || EXP::NC == 0);
        DLIB_ASSERT( R < m.nr() && C < m.nc(),
            "\tconst matrix_exp::type rotate(const matrix_exp& m)"
            << "\n\tYou can't rotate a matrix by more rows or columns than it has"
            << "\n\tm.nr(): " << m.nr()
            << "\n\tm.nc(): " << m.nc() 
            << "\n\tR:      " << R 
            << "\n\tC:      " << C 
            );
        typedef matrix_unary_exp<matrix_exp<EXP>,op_rotate<R,C> > exp;
        return matrix_exp<exp>(exp(m));
    }

// ----------------------------------------------------------------------------------------

    struct op_pointwise_multiply
    {
        template <typename EXP1, typename EXP2>
        struct op : public has_nondestructive_aliasing, public preserves_dimensions<EXP1,EXP2>
        {
            typedef typename EXP1::type type;

            template <typename M1, typename M2>
            static type apply ( const M1& m1, const M2& m2 , long r, long c)
            { return m1(r,c)*m2(r,c); }
        };
    };

    template <
        typename EXP1,
        typename EXP2
        >
    inline const matrix_exp<matrix_binary_exp<EXP1,EXP2,op_pointwise_multiply> > pointwise_multiply (
        const matrix_exp<EXP1>& a,
        const matrix_exp<EXP2>& b 
    )
    {
        COMPILE_TIME_ASSERT((is_same_type<typename EXP1::type,typename EXP2::type>::value == true));
        COMPILE_TIME_ASSERT(EXP1::NR == EXP2::NR || EXP1::NR == 0 || EXP2::NR == 0);
        COMPILE_TIME_ASSERT(EXP1::NC == EXP2::NC || EXP1::NC == 0 || EXP2::NC == 0);
        DLIB_ASSERT(a.nr() == b.nr() &&
               a.nc() == b.nc(), 
            "\tconst matrix_exp::type pointwise_multiply(const matrix_exp& a, const matrix_exp& b)"
            << "\n\tYou can only make a do a pointwise multiply with two equally sized matrices"
            << "\n\ta.nr(): " << a.nr()
            << "\n\ta.nc(): " << a.nc() 
            << "\n\tb.nr(): " << b.nr()
            << "\n\tb.nc(): " << b.nc() 
            );
        typedef matrix_binary_exp<EXP1,EXP2,op_pointwise_multiply> exp;
        return matrix_exp<exp>(exp(a.ref(),b.ref()));
    }

    template <
        typename EXP1,
        typename EXP2,
        typename EXP3
        >
    inline const matrix_exp<matrix_binary_exp<matrix_binary_exp<EXP1,EXP2,op_pointwise_multiply>,EXP3,op_pointwise_multiply> >
        pointwise_multiply (
        const matrix_exp<EXP1>& a,
        const matrix_exp<EXP2>& b, 
        const matrix_exp<EXP3>& c
    )
    {
        COMPILE_TIME_ASSERT((is_same_type<typename EXP1::type,typename EXP2::type>::value == true));
        COMPILE_TIME_ASSERT(EXP1::NR == EXP2::NR || EXP1::NR == 0 || EXP2::NR == 0);
        COMPILE_TIME_ASSERT(EXP1::NC == EXP2::NC || EXP1::NR == 0 || EXP2::NC == 0);
        COMPILE_TIME_ASSERT(EXP2::NR == EXP3::NR || EXP2::NR == 0 || EXP3::NR == 0);
        COMPILE_TIME_ASSERT(EXP2::NC == EXP3::NC || EXP2::NC == 0 || EXP3::NC == 0);
        DLIB_ASSERT(a.nr() == b.nr() &&
               a.nc() == b.nc() &&
               b.nr() == c.nr() &&
               b.nc() == c.nc(), 
            "\tconst matrix_exp::type pointwise_multiply(a,b,c)"
            << "\n\tYou can only make a do a pointwise multiply between equally sized matrices"
            << "\n\ta.nr(): " << a.nr()
            << "\n\ta.nc(): " << a.nc() 
            << "\n\tb.nr(): " << b.nr()
            << "\n\tb.nc(): " << b.nc() 
            << "\n\tc.nr(): " << c.nr()
            << "\n\tc.nc(): " << c.nc() 
            );
        typedef matrix_binary_exp<EXP1,EXP2,op_pointwise_multiply> exp; 
        typedef matrix_binary_exp<exp , EXP3, op_pointwise_multiply> exp2;

        return matrix_exp<exp2>(exp2(exp(a.ref(),b.ref()),c.ref()));
    }

    template <
        typename EXP1,
        typename EXP2,
        typename EXP3,
        typename EXP4
        >
    inline const matrix_exp<
        matrix_binary_exp<matrix_binary_exp<EXP1,EXP2,op_pointwise_multiply> ,
                          matrix_binary_exp<EXP3,EXP4,op_pointwise_multiply>, 
                          op_pointwise_multiply> >
        pointwise_multiply (
        const matrix_exp<EXP1>& a,
        const matrix_exp<EXP2>& b, 
        const matrix_exp<EXP3>& c,
        const matrix_exp<EXP4>& d
    )
    {
        COMPILE_TIME_ASSERT((is_same_type<typename EXP1::type,typename EXP2::type>::value == true));
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
            "\tconst matrix_exp::type pointwise_multiply(a,b,c,d)"
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
        typedef matrix_binary_exp<EXP1,EXP2,op_pointwise_multiply> exp1;
        typedef matrix_binary_exp<EXP3,EXP4,op_pointwise_multiply> exp2;

        typedef matrix_binary_exp<  exp1  ,  exp2, op_pointwise_multiply> exp3;
        return matrix_exp<exp3>(exp3(exp1(a.ref(),b.ref()),exp2(c.ref(),d.ref())));
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

    template <long lower, long upper>
    struct op_clamp
    {
        template <typename EXP>
        struct op : has_nondestructive_aliasing, preserves_dimensions<EXP>
        {
            typedef typename EXP::type type;

            template <typename M>
            static type apply ( const M& m, long r, long c)
            { 
                const type temp = m(r,c);
                if (temp > static_cast<type>(upper))
                    return static_cast<type>(upper);
                else if (temp < static_cast<type>(lower))
                    return static_cast<type>(lower);
                else
                    return temp;
            }
        };
    };

    template <
        long l, 
        long u,
        typename EXP
        >
    const matrix_exp<matrix_unary_exp<matrix_exp<EXP>,op_clamp<l,u> > > clamp (
        const matrix_exp<EXP>& m
    )
    {
        typedef matrix_unary_exp<matrix_exp<EXP>,op_clamp<l,u> > exp;
        return matrix_exp<exp>(exp(m));
    }

// ----------------------------------------------------------------------------------------

    template <
        typename EXP1,
        typename EXP2
        >
    bool equal (
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

// ----------------------------------------------------------------------------------------

    struct op_scale_columns
    {
        template <typename EXP1, typename EXP2>
        struct op : has_nondestructive_aliasing
        {
            typedef typename EXP1::type type;
            typedef typename EXP1::mem_manager_type mem_manager_type;
            const static long NR = EXP1::NR;
            const static long NC = EXP1::NC;

            template <typename M1, typename M2>
            static type apply ( const M1& m1, const M2& m2 , long r, long c)
            { return m1(r,c)*m2(c); }

            template <typename M1, typename M2>
            static long nr (const M1& m1, const M2& ) { return m1.nr(); }
            template <typename M1, typename M2>
            static long nc (const M1& m1, const M2& ) { return m1.nc(); }
        };
    };

    template <
        typename EXP1,
        typename EXP2
        >
    const matrix_exp<matrix_binary_exp<matrix_exp<EXP1>,matrix_exp<EXP2>,op_scale_columns> > scale_columns (
        const matrix_exp<EXP1>& m,
        const matrix_exp<EXP2>& v 
    )
    {
        COMPILE_TIME_ASSERT((is_same_type<typename EXP1::type,typename EXP2::type>::value == true));
        COMPILE_TIME_ASSERT(EXP2::NC == 1 || EXP2::NC == 0);
        COMPILE_TIME_ASSERT(EXP1::NC == EXP2::NR || EXP1::NC == 0 || EXP2::NR == 0);

        DLIB_ASSERT(v.nc() == 1 && v.nr() == m.nc(), 
            "\tconst matrix_exp scale_columns(m, v)"
            << "\n\tv must be a column vector and its length must match the number of columns in m"
            << "\n\tm.nr(): " << m.nr()
            << "\n\tm.nc(): " << m.nc() 
            << "\n\tv.nr(): " << v.nr()
            << "\n\tv.nc(): " << v.nc() 
            );
        typedef matrix_binary_exp<matrix_exp<EXP1>,matrix_exp<EXP2>,op_scale_columns> exp;
        return matrix_exp<exp>(exp(m,v));
    }

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
        typename T, long NR, long NC, typename mm,
        long NR2, long NC2, typename mm2
        >
    void sort_columns (
        matrix<T,NR,NC,mm>& m,
        matrix<T,NR2,NC2,mm2>& v
    )
    {
        COMPILE_TIME_ASSERT(NC2 == 1 || NC2 == 0);
        COMPILE_TIME_ASSERT(NC == NR2 || NC == 0 || NR2 == 0);

        DLIB_ASSERT(v.nc() == 1 && v.nr() == m.nc(), 
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
        typename T, long NR, long NC, typename mm,
        long NR2, long NC2, typename mm2
        >
    void rsort_columns (
        matrix<T,NR,NC,mm>& m,
        matrix<T,NR2,NC2,mm2>& v
    )
    {
        COMPILE_TIME_ASSERT(NC2 == 1 || NC2 == 0);
        COMPILE_TIME_ASSERT(NC == NR2 || NC == 0 || NR2 == 0);

        DLIB_ASSERT(v.nc() == 1 && v.nr() == m.nc(), 
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

    struct op_tensor_product
    {
        template <typename EXP1, typename EXP2>
        struct op : public has_destructive_aliasing
        {
            const static long NR = EXP1::NR*EXP2::NR;
            const static long NC = EXP1::NC*EXP2::NC;
            typedef typename EXP1::type type;
            typedef typename EXP1::mem_manager_type mem_manager_type;

            template <typename M1, typename M2>
            static type apply ( const M1& m1, const M2& m2 , long r, long c)
            { 
                return m1(r/m2.nr(),c/m2.nc())*m2(r%m2.nr(),c%m2.nc()); 
            }


            template <typename M1, typename M2>
            static long nr (const M1& m1, const M2& m2 ) { return m1.nr()*m2.nr(); }
            template <typename M1, typename M2>
            static long nc (const M1& m1, const M2& m2 ) { return m1.nc()*m2.nc(); }
        };
    };

    template <
        typename EXP1,
        typename EXP2
        >
    inline const matrix_exp<matrix_binary_exp<EXP1,EXP2,op_tensor_product> > tensor_product (
        const matrix_exp<EXP1>& a,
        const matrix_exp<EXP2>& b 
    )
    {
        COMPILE_TIME_ASSERT((is_same_type<typename EXP1::type,typename EXP2::type>::value == true));
        typedef matrix_binary_exp<EXP1,EXP2,op_tensor_product> exp;
        return matrix_exp<exp>(exp(a.ref(),b.ref()));
    }

// ----------------------------------------------------------------------------------------

}

#endif // DLIB_MATRIx_UTILITIES_

