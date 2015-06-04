// Copyright (C) 2009  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#ifndef DLIB_MATRIx_LA_FUNCTS_
#define DLIB_MATRIx_LA_FUNCTS_ 

#include "matrix_la_abstract.h"
#include "matrix_utilities.h"
#include "../sparse_vector.h"
#include "../optimization/optimization_line_search.h"

// The 4 decomposition objects described in the matrix_la_abstract.h file are
// actually implemented in the following 4 files.  
#include "matrix_lu.h"
#include "matrix_qr.h"
#include "matrix_cholesky.h"
#include "matrix_eigenvalue.h"

#ifdef DLIB_USE_LAPACK
#include "lapack/potrf.h"
#include "lapack/gesdd.h"
#include "lapack/gesvd.h"
#endif

namespace dlib
{

// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------

    namespace nric
    {
        // This namespace contains stuff adapted from the algorithms 
        // described in the book Numerical Recipes in C

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
            typename MM4,
            typename L1,
            typename L2,
            typename L3,
            typename L4
            >
        bool svdcmp(
            matrix<T,M,N,MM1,L1>& a,  
            matrix<T,wN,wX,MM2,L2>& w,
            matrix<T,vN,vN,MM3,L3>& v,
            matrix<T,rN,rX,MM4,L4>& rv1
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
            const long max_iter = 300;
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

    // ------------------------------------------------------------------------------------

    }

// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------

    template <
        typename EXP,
        long qN, long qX,
        long uM, 
        long vN, 
        typename MM1,
        typename MM2,
        typename MM3,
        typename L1
        >
    long svd2 (
        bool withu, 
        bool withv, 
        const matrix_exp<EXP>& a,
        matrix<typename EXP::type,uM,uM,MM1,L1>& u, 
        matrix<typename EXP::type,qN,qX,MM2,L1>& q, 
        matrix<typename EXP::type,vN,vN,MM3,L1>& v
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

#ifdef DLIB_USE_LAPACK
        matrix<typename EXP::type,0,0,MM1,L1> temp(a);

        char jobu = 'A';
        char jobvt = 'A';
        if (withu == false)
            jobu = 'N';
        if (withv == false)
            jobvt = 'N';

        int info;
        if (withu == withv)
        {
            info = lapack::gesdd(jobu, temp, q, u, v);
        }
        else
        {
            info = lapack::gesvd(jobu, jobvt, temp, q, u, v);
        }

        // pad q with zeros if it isn't the length we want
        if (q.nr() < a.nc())
            q = join_cols(q, zeros_matrix<T>(a.nc()-q.nr(),1));

        v = trans(v);

        return info;
#else
        using std::abs;
        using std::sqrt;

        T eps = std::numeric_limits<T>::epsilon();
        T tol = std::numeric_limits<T>::min()/eps;

        const long m = a.nr();
        const long n = a.nc();
        long i, j, k, l = 0, l1, iter, retval;
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
            if (iter > 300) 
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
#endif
    }

// ----------------------------------------------------------------------------------------

    template <
        typename T,
        long NR,
        long NC,
        typename MM,
        typename L
        >
    void orthogonalize (
        matrix<T,NR,NC,MM,L>& m
    )
    {
        qr_decomposition<matrix<T,NR,NC,MM,L> >(m).get_q(m);
    }

// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------

    template <
        typename T,
        long Anr, long Anc,
        typename MM,
        typename L
        >
    void find_matrix_range (
        const matrix<T,Anr,Anc,MM,L>& A,
        unsigned long l,
        matrix<T,Anr,0,MM,L>& Q,
        unsigned long q 
    )
    /*!
        requires
            - A.nr() >= l
        ensures
            - #Q.nr() == A.nr() 
            - #Q.nc() == l
            - #Q == an orthonormal matrix whose range approximates the range of the
              matrix A.  
            - This function implements the randomized subspace iteration defined 
              in the algorithm 4.4 box of the paper: 
                Finding Structure with Randomness: Probabilistic Algorithms for
                Constructing Approximate Matrix Decompositions by Halko et al.
            - q defines the number of extra subspace iterations this algorithm will
              perform.  Often q == 0 is fine, but performing more iterations can lead to a
              more accurate approximation of the range of A if A has slowly decaying
              singular values.  In these cases, using a q of 1 or 2 is good.
    !*/
    {
        DLIB_ASSERT(A.nr() >= (long)l, "Invalid inputs were given to this function.");
        Q = A*matrix_cast<T>(gaussian_randm(A.nc(), l));

        orthogonalize(Q);

        // Do some extra iterations of the power method to make sure we get Q into the 
        // span of the most important singular vectors of A.
        if (q != 0)
        {
            for (unsigned long itr = 0; itr < q; ++itr)
            {
                Q = trans(A)*Q;
                orthogonalize(Q);

                Q = A*Q;
                orthogonalize(Q);
            }
        }
    }

// ----------------------------------------------------------------------------------------

    template <
        typename T,
        long Anr, long Anc,
        long Unr, long Unc,
        long Wnr, long Wnc,
        long Vnr, long Vnc,
        typename MM,
        typename L
        >
    void svd_fast (
        const matrix<T,Anr,Anc,MM,L>& A,
        matrix<T,Unr,Unc,MM,L>& u,
        matrix<T,Wnr,Wnc,MM,L>& w,
        matrix<T,Vnr,Vnc,MM,L>& v,
        unsigned long l,
        unsigned long q = 1
    )
    {
        const unsigned long k = std::min(l, std::min<unsigned long>(A.nr(),A.nc()));

        DLIB_ASSERT(l > 0 && A.size() > 0, 
            "\t void svd_fast()"
            << "\n\t Invalid inputs were given to this function."
            << "\n\t l: " << l 
            << "\n\t A.size(): " << A.size() 
            );

        matrix<T,Anr,0,MM,L> Q;
        find_matrix_range(A, k, Q, q);

        // Compute trans(B) = trans(Q)*A.   The reason we store B transposed
        // is so that when we take its SVD later using svd3() it doesn't consume
        // a whole lot of RAM.  That is, we make sure the square matrix coming out
        // of svd3() has size lxl rather than the potentially much larger nxn.
        matrix<T,0,0,MM,L> B = trans(A)*Q;
        svd3(B, v,w,u);
        u = Q*u;
    }

// ----------------------------------------------------------------------------------------

    template <
        typename sparse_vector_type, 
        typename T,
        typename MM,
        typename L
        >
    void find_matrix_range (
        const std::vector<sparse_vector_type>& A,
        unsigned long l,
        matrix<T,0,0,MM,L>& Q,
        unsigned long q 
    )
    /*!
        requires
            - A.size() >= l
        ensures
            - #Q.nr() == A.size()
            - #Q.nc() == l
            - #Q == an orthonormal matrix whose range approximates the range of the
              matrix A.  In this case, we interpret A as a matrix of A.size() rows,
              where each row is defined by a sparse vector.
            - This function implements the randomized subspace iteration defined 
              in the algorithm 4.4 box of the paper: 
                Finding Structure with Randomness: Probabilistic Algorithms for
                Constructing Approximate Matrix Decompositions by Halko et al.
            - q defines the number of extra subspace iterations this algorithm will
              perform.  Often q == 0 is fine, but performing more iterations can lead to a
              more accurate approximation of the range of A if A has slowly decaying
              singular values.  In these cases, using a q of 1 or 2 is good.
    !*/
    {
        DLIB_ASSERT(A.size() >= l, "Invalid inputs were given to this function.");
        Q.set_size(A.size(), l);

        // Compute Q = A*gaussian_randm()
        for (long r = 0; r < Q.nr(); ++r)
        {
            for (long c = 0; c < Q.nc(); ++c)
            {
                Q(r,c) = dot(A[r], gaussian_randm(std::numeric_limits<long>::max(), 1, c));
            }
        }

        orthogonalize(Q);

        // Do some extra iterations of the power method to make sure we get Q into the 
        // span of the most important singular vectors of A.
        if (q != 0)
        {
            const unsigned long n = max_index_plus_one(A);
            for (unsigned long itr = 0; itr < q; ++itr)
            {
                matrix<T,0,0,MM,L> Z(n, l);
                // Compute Z = trans(A)*Q
                Z = 0;
                for (unsigned long m = 0; m < A.size(); ++m)
                {
                    for (unsigned long r = 0; r < l; ++r)
                    {
                        typename sparse_vector_type::const_iterator i;
                        for (i = A[m].begin(); i != A[m].end(); ++i)
                        {
                            const unsigned long c = i->first;
                            const T val = i->second;

                            Z(c,r) += Q(m,r)*val;
                        }
                    }
                }

                Q.set_size(0,0); // free RAM
                orthogonalize(Z);

                // Compute Q = A*Z
                Q.set_size(A.size(), l);
                for (long r = 0; r < Q.nr(); ++r)
                {
                    for (long c = 0; c < Q.nc(); ++c)
                    {
                        Q(r,c) = dot(A[r], colm(Z,c));
                    }
                }

                Z.set_size(0,0); // free RAM
                orthogonalize(Q);
            }
        }
    }

// ----------------------------------------------------------------------------------------

    template <
        typename sparse_vector_type, 
        typename T,
        long Unr, long Unc,
        long Wnr, long Wnc,
        long Vnr, long Vnc,
        typename MM,
        typename L
        >
    void svd_fast (
        const std::vector<sparse_vector_type>& A,
        matrix<T,Unr,Unc,MM,L>& u,
        matrix<T,Wnr,Wnc,MM,L>& w,
        matrix<T,Vnr,Vnc,MM,L>& v,
        unsigned long l,
        unsigned long q = 1
    )
    {
        const long n = max_index_plus_one(A);
        const unsigned long k = std::min(l, std::min<unsigned long>(A.size(),n));

        DLIB_ASSERT(l > 0 && A.size() > 0 && n > 0, 
            "\t void svd_fast()"
            << "\n\t Invalid inputs were given to this function."
            << "\n\t l: " << l 
            << "\n\t n (i.e. max_index_plus_one(A)): " << n 
            << "\n\t A.size(): " << A.size() 
            );

        matrix<T,0,0,MM,L> Q;
        find_matrix_range(A, k, Q, q);

        // Compute trans(B) = trans(Q)*A.   The reason we store B transposed
        // is so that when we take its SVD later using svd3() it doesn't consume
        // a whole lot of RAM.  That is, we make sure the square matrix coming out
        // of svd3() has size lxl rather than the potentially much larger nxn.
        matrix<T,0,0,MM,L> B(n,k);
        B = 0;
        for (unsigned long m = 0; m < A.size(); ++m)
        {
            for (unsigned long r = 0; r < k; ++r)
            {
                typename sparse_vector_type::const_iterator i;
                for (i = A[m].begin(); i != A[m].end(); ++i)
                {
                    const unsigned long c = i->first;
                    const T val = i->second;

                    B(c,r) += Q(m,r)*val;
                }
            }
        }

        svd3(B, v,w,u);
        u = Q*u;
    }

// ----------------------------------------------------------------------------------------
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

            lu_decomposition<EXP> lu(m);
            return lu.solve(identity_matrix<type>(m.nr()));
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
            // if m is invertible
            if (m(0) != 0)
                a(0) = 1/m(0);
            else
                a(0) = 1;
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
            type d = det(m);
            if (d != 0)
            {
                d = static_cast<type>(1.0/d);
                a(0,0) = m(1,1)*d;
                a(0,1) = m(0,1)*-d;
                a(1,0) = m(1,0)*-d;
                a(1,1) = m(0,0)*d;
            }
            else
            {
                // Matrix isn't invertible so just return the identity matrix.
                a = identity_matrix<type,2>();
            }
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
            type de = det(m);
            if (de != 0)
            {
                de = static_cast<type>(1.0/de);
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
            }
            else
            {
                ret = identity_matrix<type,3>();
            }

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
            type de = det(m);
            if (de != 0)
            {
                de = static_cast<type>(1.0/de);
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
            else
            {
                return identity_matrix<type,4>();
            }
        }
    };

    template <
        typename EXP
        >
    inline const typename matrix_exp<EXP>::matrix_type inv (
        const matrix_exp<EXP>& m
    ) { return inv_helper<EXP,matrix_exp<EXP>::NR>::inv(m); }

// ----------------------------------------------------------------------------------------

    template <typename M>
    struct op_diag_inv
    {
        template <typename EXP>
        op_diag_inv( const matrix_exp<EXP>& m_) : m(m_){}


        const static long cost = 1;
        const static long NR = ((M::NC!=0)&&(M::NR!=0))? (tmax<M::NR,M::NC>::value) : (0);
        const static long NC = NR;
        typedef typename M::type type;
        typedef const type const_ret_type;
        typedef typename M::mem_manager_type mem_manager_type;
        typedef typename M::layout_type layout_type;


        // hold the matrix by value
        const matrix<type,NR,1,mem_manager_type,layout_type> m;

        const_ret_type apply ( long r, long c) const 
        { 
            if (r==c)
                return m(r);
            else
                return 0;
        }

        long nr () const { return m.size(); }
        long nc () const { return m.size(); }

        template <typename U> bool aliases               ( const matrix_exp<U>& item) const { return m.aliases(item); }
        template <typename U> bool destructively_aliases ( const matrix_exp<U>& item) const { return m.aliases(item); }
    };

    template <
        typename EXP
        >
    const matrix_diag_op<op_diag_inv<EXP> > inv (
        const matrix_diag_exp<EXP>& m
    ) 
    { 
        typedef op_diag_inv<EXP> op;
        return matrix_diag_op<op>(op(reciprocal(diag(m))));
    }

    template <
        typename EXP
        >
    const matrix_diag_op<op_diag_inv<EXP> > pinv (
        const matrix_diag_exp<EXP>& m
    ) 
    { 
        typedef op_diag_inv<EXP> op;
        return matrix_diag_op<op>(op(reciprocal(diag(m))));
    }

// ----------------------------------------------------------------------------------------

    template <
        typename EXP
        >
    const matrix_diag_op<op_diag_inv<EXP> > pinv (
        const matrix_diag_exp<EXP>& m,
        double tol
    ) 
    { 
        DLIB_ASSERT(tol >= 0, 
            "\tconst matrix_exp::type pinv(const matrix_exp& m)"
            << "\n\t tol can't be negative"
            << "\n\t tol: "<<tol 
            );
        typedef op_diag_inv<EXP> op;
        return matrix_diag_op<op>(op(reciprocal(round_zeros(diag(m),tol))));
    }

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
    inline const typename matrix_exp<EXP>::matrix_type chol (
        const matrix_exp<EXP>& A
    )
    {
        DLIB_ASSERT(A.nr() == A.nc(), 
            "\tconst matrix chol(const matrix_exp& A)"
            << "\n\tYou can only apply the chol to a square matrix"
            << "\n\tA.nr(): " << A.nr()
            << "\n\tA.nc(): " << A.nc() 
            );
        typename matrix_exp<EXP>::matrix_type L(A.nr(),A.nc());

#ifdef DLIB_USE_LAPACK
        // Only call LAPACK if the matrix is big enough.  Otherwise,
        // our own code is faster, especially for statically dimensioned 
        // matrices.
        if (A.nr() > 4)
        {
            L = A;
            lapack::potrf('L', L);
            // mask out upper triangular area
            return lowerm(L);
        }
#endif
        typedef typename EXP::type T;
        set_all_elements(L,0);

        // do nothing if the matrix is empty
        if (A.size() == 0)
            return L;

        const T eps = std::numeric_limits<T>::epsilon();

        // compute the upper left corner
        if (A(0,0) > 0)
            L(0,0) = std::sqrt(A(0,0));

        // compute the first column
        for (long r = 1; r < A.nr(); ++r)
        {
            // if (L(0,0) > 0)
            if (L(0,0) > eps*std::abs(A(r,0)))
                L(r,0) = A(r,0)/L(0,0);
            else
                return L;
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

                // if (L(c,c) > 0)
                if (L(c,c) > eps*std::abs(temp))
                    L(r,c) = temp/L(c,c);
                else
                    return L;
            }
        }

        return L;

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
        typename MM3,
        typename L1
        >
    inline void svd3 (
        const matrix_exp<EXP>& m,
        matrix<typename matrix_exp<EXP>::type, uNR, uNC,MM1,L1>& u,
        matrix<typename matrix_exp<EXP>::type, wN, wX,MM2,L1>& w,
        matrix<typename matrix_exp<EXP>::type, vN, vN,MM3,L1>& v
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

#ifdef DLIB_USE_LAPACK
        // use LAPACK but only if it isn't a really small matrix we are taking the SVD of.
        if (NR*NC == 0 || NR*NC > 3*3)
        {
            matrix<typename matrix_exp<EXP>::type, uNR, uNC,MM1,L1> temp(m);
            lapack::gesvd('S','A', temp, w, u, v);
            v = trans(v);
            // if u isn't the size we want then pad it (and v) with zeros
            if (u.nc() < m.nc())
            {
                w = join_cols(w, zeros_matrix<T>(m.nc()-u.nc(),1));
                u = join_rows(u, zeros_matrix<T>(u.nr(), m.nc()-u.nc()));
            }
            return;
        }
#endif
        v.set_size(m.nc(),m.nc());

        u = m;

        w.set_size(m.nc(),1);
        matrix<T,matrix_exp<EXP>::NC,1,MM1> rv1(m.nc(),1);
        nric::svdcmp(u,w,v,rv1);
    }

// ----------------------------------------------------------------------------------------

    template <
        typename EXP
        >
    const matrix<typename EXP::type,EXP::NC,EXP::NR,typename EXP::mem_manager_type> pinv_helper ( 
        const matrix_exp<EXP>& m,
        double tol
    )
    /*!
        ensures
            - computes the results of pinv(m) but does so using a method that is fastest
              when m.nc() <= m.nr().  So if m.nc() > m.nr() then it is best to use
              trans(pinv_helper(trans(m))) to compute pinv(m).
    !*/
    { 
        typename matrix_exp<EXP>::matrix_type u;
        typedef typename EXP::mem_manager_type MM1;
        typedef typename EXP::layout_type layout_type;
        matrix<typename EXP::type, EXP::NC, EXP::NC,MM1, layout_type > v;

        typedef typename matrix_exp<EXP>::type T;

        matrix<T,matrix_exp<EXP>::NC,1,MM1, layout_type> w;

        svd3(m, u,w,v);

        const double machine_eps = std::numeric_limits<typename EXP::type>::epsilon();
        // compute a reasonable epsilon below which we round to zero before doing the
        // reciprocal.  Unless a non-zero tol is given then we just use tol.
        const double eps = (tol!=0) ? tol :  machine_eps*std::max(m.nr(),m.nc())*max(w);

        // now compute the pseudoinverse
        return tmp(scale_columns(v,reciprocal(round_zeros(w,eps))))*trans(u);
    }

    template <
        typename EXP
        >
    const matrix<typename EXP::type,EXP::NC,EXP::NR,typename EXP::mem_manager_type> pinv ( 
        const matrix_exp<EXP>& m,
        double tol = 0
    )
    { 
        DLIB_ASSERT(tol >= 0, 
            "\tconst matrix_exp::type pinv(const matrix_exp& m)"
            << "\n\t tol can't be negative"
            << "\n\t tol: "<<tol 
            );
        // if m has more columns then rows then it is more efficient to
        // compute the pseudo-inverse of its transpose (given the way I'm doing it below).
        if (m.nc() > m.nr())
            return trans(pinv_helper(trans(m),tol));
        else
            return pinv_helper(m,tol);
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
        typename MM3,
        typename L1
        >
    inline void svd (
        const matrix_exp<EXP>& m,
        matrix<typename matrix_exp<EXP>::type, uNR, uNC,MM1,L1>& u,
        matrix<typename matrix_exp<EXP>::type, wN, wN,MM2,L1>& w,
        matrix<typename matrix_exp<EXP>::type, vN, vN,MM3,L1>& v
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

        matrix<T,matrix_exp<EXP>::NC,1,MM1, L1> W;
        svd3(m,u,W,v);
        w = diagm(W);
    }

// ----------------------------------------------------------------------------------------

    template <
        typename EXP
        >
    const typename matrix_exp<EXP>::type trace (
        const matrix_exp<EXP>& m
    ) 
    { 
        COMPILE_TIME_ASSERT(matrix_exp<EXP>::NR == matrix_exp<EXP>::NC ||
                            matrix_exp<EXP>::NR == 0 ||
                            matrix_exp<EXP>::NC == 0 
                            );
        DLIB_ASSERT(m.nr() == m.nc(), 
            "\tconst matrix_exp::type trace(const matrix_exp& m)"
            << "\n\tYou can only apply trace() to a square matrix"
            << "\n\tm.nr(): " << m.nr()
            << "\n\tm.nc(): " << m.nc() 
            );
        return sum(diag(m));
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

            return lu_decomposition<EXP>(m).det();
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

    template <typename EXP>
    const matrix<typename EXP::type, EXP::NR, 1, typename EXP::mem_manager_type, typename EXP::layout_type> real_eigenvalues (
        const matrix_exp<EXP>& m
    )
    {
        // You can only use this function with matrices that contain float or double values
        COMPILE_TIME_ASSERT((is_same_type<typename EXP::type, float>::value ||
                             is_same_type<typename EXP::type, double>::value));

        DLIB_ASSERT(m.nr() == m.nc(), 
            "\tconst matrix real_eigenvalues()"
            << "\n\tYou have given an invalidly sized matrix"
            << "\n\tm.nr(): " << m.nr()
            << "\n\tm.nc(): " << m.nc() 
            );

        if (m.nr() == 2)
        {
            typedef typename EXP::type T;
            const T m00 = m(0,0);
            const T m01 = m(0,1);
            const T m10 = m(1,0);
            const T m11 = m(1,1);

            const T b = -(m00 + m11);
            const T c = m00*m11 - m01*m10;
            matrix<T,EXP::NR,1, typename EXP::mem_manager_type, typename EXP::layout_type> v(2);


            T disc = b*b - 4*c;
            if (disc >= 0)
                disc = std::sqrt(disc);
            else
                disc = 0;

            v(0) = (-b + disc)/2;
            v(1) = (-b - disc)/2;
            return v;
        }
        else
        {
            // Call .ref() so that the symmetric matrix overload can take effect if m 
            // has the appropriate type.
            return eigenvalue_decomposition<EXP>(m.ref()).get_real_eigenvalues();
        }
    }

// ----------------------------------------------------------------------------------------

    template <
        typename EXP 
        >
    dlib::vector<double,2> max_point_interpolated (
        const matrix_exp<EXP>& m
    )
    {
        DLIB_ASSERT(m.size() > 0, 
            "\tdlib::vector<double,2> point max_point_interpolated(const matrix_exp& m)"
            << "\n\tm can't be empty"
            << "\n\tm.size():   " << m.size() 
            << "\n\tm.nr():     " << m.nr() 
            << "\n\tm.nc():     " << m.nc() 
            );
        const point p = max_point(m);

        // If this is a column vector then just do interpolation along a line.
        if (m.nc()==1)
        {
            const long pos = p.y();
            if (0 < pos && pos+1 < m.nr())
            {
                double v1 = dlib::impl::magnitude(m(pos-1));
                double v2 = dlib::impl::magnitude(m(pos));
                double v3 = dlib::impl::magnitude(m(pos+1));
                double y = lagrange_poly_min_extrap(pos-1,pos,pos+1, -v1, -v2, -v3);
                return vector<double,2>(0,y);
            }
        }
        // If this is a row vector then just do interpolation along a line.
        if (m.nr()==1)
        {
            const long pos = p.x();
            if (0 < pos && pos+1 < m.nc())
            {
                double v1 = dlib::impl::magnitude(m(pos-1));
                double v2 = dlib::impl::magnitude(m(pos));
                double v3 = dlib::impl::magnitude(m(pos+1));
                double x = lagrange_poly_min_extrap(pos-1,pos,pos+1, -v1, -v2, -v3);
                return vector<double,2>(x,0);
            }
        }


        // If it's on the border then just return the regular max point.
        if (shrink_rect(get_rect(m),1).contains(p) == false)
            return p;

        //matrix<double> A(9,6);
        //matrix<double,0,1> G(9);

        matrix<double,9,1> pix;
        long i = 0;
        for (long r = -1; r <= +1; ++r)
        {
            for (long c = -1; c <= +1; ++c)
            {
                pix(i) = dlib::impl::magnitude(m(p.y()+r,p.y()+c));
                /*
                A(i,0) = c*c;
                A(i,1) = c*r;
                A(i,2) = r*r;
                A(i,3) = c;
                A(i,4) = r;
                A(i,5) = 1;
                G(i) = std::exp(-1*(r*r+c*c)/2.0); // Use a gaussian windowing function around p.
                */
                ++i;
            }
        }

        // This bit of code is how we generated the derivative_filters matrix below.  
        //A = diagm(G)*A; 
        //std::cout << std::setprecision(20) << inv(trans(A)*A)*trans(A)*diagm(G) << std::endl; exit(1);

        const double m10 = 0.10597077880854270659;
        const double m21 = 0.21194155761708535768;
        const double m28 = 0.28805844238291455905;
        const double m57 = 0.57611688476582878504;
        // So this derivative_filters finds the parameters of the quadratic surface that best fits
        // the 3x3 region around p.  Then we find the maximizer of that surface within that
        // small region and return that as the maximum location.
        const double derivative_filters[] = {
                // xx
                m10,-m21,m10,
                m28,-m57,m28,
                m10,-m21,m10,

                // xy
                0.25 ,0,-0.25,
                0    ,0, 0,
                -0.25,0,0.25,

                // yy
                m10,  m28, m10,
                -m21,-m57,-m21,
                m10,  m28, m10,

                // x
                -m10,0,m10,
                -m28,0,m28,
                -m10,0,m10,

                // y
                -m10,-m28,-m10,
                0,   0,   0,
                m10, m28, m10
            };
        const matrix<double,5,9> filt(derivative_filters);
        // Now w contains the parameters of the quadratic surface
        const matrix<double,5,1> w = filt*pix;


        // Now newton step to the max point on the surface
        matrix<double,2,2> H;
        matrix<double,2,1> g;
        H = 2*w(0), w(1),
              w(1), 2*w(2);
        g = w(3), 
            w(4);
        const dlib::vector<double,2> delta = -inv(H)*g;

        // if delta isn't in an ascent direction then just use the normal max point.
        if (dot(delta, g) < 0)
            return p;
        else
            return vector<double,2>(p)+clamp(delta, -1, 1);
    }

// ----------------------------------------------------------------------------------------

}

#endif // DLIB_MATRIx_LA_FUNCTS_


