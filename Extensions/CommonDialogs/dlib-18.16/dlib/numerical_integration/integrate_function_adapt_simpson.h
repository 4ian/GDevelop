// Copyright (C) 2013 Steve Taylor (steve98654@gmail.com)
// License: Boost Software License  See LICENSE.txt for full license
#ifndef DLIB_INTEGRATE_FUNCTION_ADAPT_SIMPSONh_
#define DLIB_INTEGRATE_FUNCTION_ADAPT_SIMPSONh_

#include "integrate_function_adapt_simpson_abstract.h"
#include "../assert.h"

// ----------------------------------------------------------------------------------------

namespace dlib
{
    template <typename T, typename funct>
    T impl_adapt_simp_stop(const funct& f, T a, T b, T fa, T fm, T fb, T is, int cnt)
    {
        const int maxint = 500;

        T m   = (a + b)/2.0;
        T h   = (b - a)/4.0;
        T fml = f(a + h);
        T fmr = f(b - h);
        T i1 = h/1.5*(fa+4.0*fm+fb);
        T i2 = h/3.0*(fa+4.0*(fml+fmr)+2.0*fm+fb);
        i1 = (16.0*i2 - i1)/15.0;
        T Q = 0;

        if ((std::abs(i1-i2) <= std::abs(is)) || (m <= a) || (b <= m))
        {
            Q = i1;
        }
        else 
        {
            if(cnt < maxint)
            {
                cnt = cnt + 1;

                Q = impl_adapt_simp_stop(f,a,m,fa,fml,fm,is,cnt) 
                    + impl_adapt_simp_stop(f,m,b,fm,fmr,fb,is,cnt); 
            }
        }

        return Q;
    }

// ----------------------------------------------------------------------------------------

    template <typename T, typename funct>
    T integrate_function_adapt_simp(
        const funct& f,
        T a,
        T b,
        T tol = 1e-10
    )
    {
        // make sure requires clause is not broken
        DLIB_ASSERT(b > a && tol > 0,
            "\t T integrate_function_adapt_simp()"
            << "\n\t Invalid arguments were given to this function."
            << "\n\t a:   " << a
            << "\n\t b:   " << b
            << "\n\t tol: " << tol 
            );

        T eps = std::numeric_limits<T>::epsilon();
        if(tol < eps)
        {
            tol = eps;
        }

        const T ba = b-a;
        const T fa = f(a);
        const T fb = f(b);
        const T fm = f((a+b)/2);

        T is = ba/8*(fa+fb+fm+ f(a + 0.9501*ba) + f(a + 0.2311*ba) + f(a + 0.6068*ba)
            + f(a + 0.4860*ba) + f(a + 0.8913*ba));

        if(is == 0)
        {
            is = b-a;
        }

        is = is*tol;

        int cnt = 0;

        return impl_adapt_simp_stop(f, a, b, fa, fm, fb, is, cnt);
    }
}

// ----------------------------------------------------------------------------------------

#endif // DLIB_INTEGRATE_FUNCTION_ADAPT_SIMPSONh_
