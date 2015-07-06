// Copyright (C) 2009  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
// This code was adapted from code from the JAMA part of NIST's TNT library.
//    See: http://math.nist.gov/tnt/ 
#ifndef DLIB_MATRIX_EIGENVALUE_DECOMPOSITION_H
#define DLIB_MATRIX_EIGENVALUE_DECOMPOSITION_H

#include "matrix.h" 
#include "matrix_utilities.h"
#include "matrix_subexp.h"
#include <algorithm>
#include <complex>
#include <cmath>

#ifdef DLIB_USE_LAPACK
#include "lapack/geev.h"
#include "lapack/syev.h"
#include "lapack/syevr.h"
#endif

#define DLIB_LAPACK_EIGENVALUE_DECOMP_SIZE_THRESH 4

namespace dlib 
{

    template <
        typename matrix_exp_type
        >
    class eigenvalue_decomposition
    {

    public:

        const static long NR = matrix_exp_type::NR;
        const static long NC = matrix_exp_type::NC;
        typedef typename matrix_exp_type::type type;
        typedef typename matrix_exp_type::mem_manager_type mem_manager_type;
        typedef typename matrix_exp_type::layout_type layout_type;

        typedef typename matrix_exp_type::matrix_type matrix_type;
        typedef matrix<type,NR,1,mem_manager_type,layout_type> column_vector_type;

        typedef matrix<std::complex<type>,0,0,mem_manager_type,layout_type> complex_matrix_type;
        typedef matrix<std::complex<type>,NR,1,mem_manager_type,layout_type> complex_column_vector_type;


        // You have supplied an invalid type of matrix_exp_type.  You have
        // to use this object with matrices that contain float or double type data.
        COMPILE_TIME_ASSERT((is_same_type<float, type>::value || 
                             is_same_type<double, type>::value ));


        template <typename EXP>
        eigenvalue_decomposition(
            const matrix_exp<EXP>& A
        ); 

        template <typename EXP>
        eigenvalue_decomposition(
            const matrix_op<op_make_symmetric<EXP> >& A
        ); 

        long dim (
        ) const;

        const complex_column_vector_type get_eigenvalues (
        ) const;

        const column_vector_type& get_real_eigenvalues (
        ) const;

        const column_vector_type& get_imag_eigenvalues (
        ) const;

        const complex_matrix_type get_v (
        ) const;

        const complex_matrix_type get_d (
        ) const; 

        const matrix_type& get_pseudo_v (
        ) const;

        const matrix_type get_pseudo_d (
        ) const; 

    private:

        /** Row and column dimension (square matrix).  */
        long n;

        bool issymmetric; 

        /** Arrays for internal storage of eigenvalues. */

        column_vector_type d;         /* real part */
        column_vector_type e;         /* img part */

        /** Array for internal storage of eigenvectors. */
        matrix_type V;

        /** Array for internal storage of nonsymmetric Hessenberg form.
        @serial internal storage of nonsymmetric Hessenberg form.
        */
        matrix_type H;


        /** Working storage for nonsymmetric algorithm.
        @serial working storage for nonsymmetric algorithm.
        */
        column_vector_type ort;

        // Symmetric Householder reduction to tridiagonal form.
        void tred2();


        // Symmetric tridiagonal QL algorithm.
        void tql2 ();


        // Nonsymmetric reduction to Hessenberg form.
        void orthes ();


        // Complex scalar division.
        type cdivr, cdivi;
        void cdiv_(type xr, type xi, type yr, type yi);


        // Nonsymmetric reduction from Hessenberg to real Schur form.
        void hqr2 (); 
    };

// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------
//                        Public member functions
// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------

    template <typename matrix_exp_type>
    template <typename EXP>
    eigenvalue_decomposition<matrix_exp_type>::
    eigenvalue_decomposition(
        const matrix_exp<EXP>& A_
    ) 
    {
        COMPILE_TIME_ASSERT((is_same_type<type, typename EXP::type>::value));


        const_temp_matrix<EXP> A(A_);

        // make sure requires clause is not broken
        DLIB_ASSERT(A.nr() == A.nc() && A.size() > 0,
            "\teigenvalue_decomposition::eigenvalue_decomposition(A)"
            << "\n\tYou can only use this on square matrices"
            << "\n\tA.nr():   " << A.nr()
            << "\n\tA.nc():   " << A.nc()
            << "\n\tA.size(): " << A.size()
            << "\n\tthis:     " << this
            );


        n = A.nc();
        V.set_size(n,n);
        d.set_size(n);
        e.set_size(n);


        issymmetric = true;
        for (long j = 0; (j < n) && issymmetric; j++) 
        {
            for (long i = 0; (i < n) && issymmetric; i++) 
            {
                issymmetric = (A(i,j) == A(j,i));
            }
        }

        if (issymmetric) 
        {
            V = A;

#ifdef DLIB_USE_LAPACK
            if (A.nr() > DLIB_LAPACK_EIGENVALUE_DECOMP_SIZE_THRESH)
            {
                e = 0;

                // We could compute the result using syev()
                //lapack::syev('V', 'L', V,  d);

                // Instead, we use syevr because its faster and maybe more stable.
                matrix_type tempA(A);
                matrix<lapack::integer,0,0,mem_manager_type,layout_type> isupz;

                lapack::integer temp;
                lapack::syevr('V','A','L',tempA,0,0,0,0,-1,temp,d,V,isupz);
                return;
            }
#endif
            // Tridiagonalize.
            tred2();

            // Diagonalize.
            tql2();

        } 
        else 
        {

#ifdef DLIB_USE_LAPACK
            if (A.nr() > DLIB_LAPACK_EIGENVALUE_DECOMP_SIZE_THRESH)
            {
                matrix<type,0,0,mem_manager_type, column_major_layout> temp, vl, vr;
                temp = A;
                lapack::geev('N', 'V', temp, d, e, vl, vr);
                V = vr;
                return;
            }
#endif
            H = A;

            ort.set_size(n);

            // Reduce to Hessenberg form.
            orthes();

            // Reduce Hessenberg to real Schur form.
            hqr2();
        }
    }

// ----------------------------------------------------------------------------------------

    template <typename matrix_exp_type>
    template <typename EXP>
    eigenvalue_decomposition<matrix_exp_type>::
    eigenvalue_decomposition(
        const matrix_op<op_make_symmetric<EXP> >& A
    ) 
    {
        COMPILE_TIME_ASSERT((is_same_type<type, typename EXP::type>::value));


        // make sure requires clause is not broken
        DLIB_ASSERT(A.nr() == A.nc() && A.size() > 0,
            "\teigenvalue_decomposition::eigenvalue_decomposition(A)"
            << "\n\tYou can only use this on square matrices"
            << "\n\tA.nr():   " << A.nr()
            << "\n\tA.nc():   " << A.nc()
            << "\n\tA.size(): " << A.size()
            << "\n\tthis:     " << this
            );


        n = A.nc();
        V.set_size(n,n);
        d.set_size(n);
        e.set_size(n);


        V = A;

#ifdef DLIB_USE_LAPACK
        if (A.nr() > DLIB_LAPACK_EIGENVALUE_DECOMP_SIZE_THRESH)
        {
            e = 0;

            // We could compute the result using syev()
            //lapack::syev('V', 'L', V,  d);

            // Instead, we use syevr because its faster and maybe more stable.
            matrix_type tempA(A);
            matrix<lapack::integer,0,0,mem_manager_type,layout_type> isupz;

            lapack::integer temp;
            lapack::syevr('V','A','L',tempA,0,0,0,0,-1,temp,d,V,isupz);
            return;
        }
#endif
        // Tridiagonalize.
        tred2();

        // Diagonalize.
        tql2();

    }

// ----------------------------------------------------------------------------------------

    template <typename matrix_exp_type>
    const typename eigenvalue_decomposition<matrix_exp_type>::matrix_type& eigenvalue_decomposition<matrix_exp_type>::
    get_pseudo_v (
    ) const
    {
        return V;
    }

// ----------------------------------------------------------------------------------------

    template <typename matrix_exp_type>
    long eigenvalue_decomposition<matrix_exp_type>::
    dim (
    ) const
    {
        return V.nr();
    }

// ----------------------------------------------------------------------------------------

    template <typename matrix_exp_type>
    const typename eigenvalue_decomposition<matrix_exp_type>::complex_column_vector_type eigenvalue_decomposition<matrix_exp_type>::
    get_eigenvalues (
    ) const
    {
        return complex_matrix(get_real_eigenvalues(), get_imag_eigenvalues());
    }

// ----------------------------------------------------------------------------------------

    template <typename matrix_exp_type>
    const typename eigenvalue_decomposition<matrix_exp_type>::column_vector_type& eigenvalue_decomposition<matrix_exp_type>::
    get_real_eigenvalues (
    ) const
    {
        return d;
    }

// ----------------------------------------------------------------------------------------

    template <typename matrix_exp_type>
    const typename eigenvalue_decomposition<matrix_exp_type>::column_vector_type& eigenvalue_decomposition<matrix_exp_type>::
    get_imag_eigenvalues (
    ) const
    {
        return e;
    }

// ----------------------------------------------------------------------------------------

    template <typename matrix_exp_type>
    const typename eigenvalue_decomposition<matrix_exp_type>::complex_matrix_type eigenvalue_decomposition<matrix_exp_type>::
    get_d (
    ) const 
    {
        return diagm(complex_matrix(get_real_eigenvalues(), get_imag_eigenvalues()));
    }

// ----------------------------------------------------------------------------------------

    template <typename matrix_exp_type>
    const typename eigenvalue_decomposition<matrix_exp_type>::complex_matrix_type eigenvalue_decomposition<matrix_exp_type>::
    get_v (
    ) const 
    {
        complex_matrix_type CV(n,n);

        for (long i = 0; i < n; i++) 
        {
            if (e(i) > 0) 
            {
                set_colm(CV,i) = complex_matrix(colm(V,i), colm(V,i+1));
            } 
            else if (e(i) < 0) 
            {
                set_colm(CV,i) = complex_matrix(colm(V,i), colm(V,i-1));
            }
            else
            {
                set_colm(CV,i) = complex_matrix(colm(V,i), uniform_matrix<type>(n,1,0));
            }
        }

        return CV;
    }

// ----------------------------------------------------------------------------------------

    template <typename matrix_exp_type>
    const typename eigenvalue_decomposition<matrix_exp_type>::matrix_type eigenvalue_decomposition<matrix_exp_type>::
    get_pseudo_d (
    ) const 
    {
        matrix_type D(n,n);

        for (long i = 0; i < n; i++) 
        {
            for (long j = 0; j < n; j++) 
            {
                D(i,j) = 0.0;
            }
            D(i,i) = d(i);
            if (e(i) > 0) 
            {
                D(i,i+1) = e(i);
            } 
            else if (e(i) < 0) 
            {
                D(i,i-1) = e(i);
            }
        }

        return D;
    }

// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------
//                        Private member functions
// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------

// Symmetric Householder reduction to tridiagonal form.
    template <typename matrix_exp_type>
    void eigenvalue_decomposition<matrix_exp_type>::
    tred2() 
    {
        using std::abs;
        using std::sqrt;

        //  This is derived from the Algol procedures tred2 by
        //  Bowdler, Martin, Reinsch, and Wilkinson, Handbook for
        //  Auto. Comp., Vol.ii-Linear Algebra, and the corresponding
        //  Fortran subroutine in EISPACK.

        for (long j = 0; j < n; j++) 
        {
            d(j) = V(n-1,j);
        }

        // Householder reduction to tridiagonal form.

        for (long i = n-1; i > 0; i--) 
        {

            // Scale to avoid under/overflow.

            type scale = 0.0;
            type h = 0.0;
            for (long k = 0; k < i; k++) 
            {
                scale = scale + abs(d(k));
            }
            if (scale == 0.0) 
            {
                e(i) = d(i-1);
                for (long j = 0; j < i; j++) 
                {
                    d(j) = V(i-1,j);
                    V(i,j) = 0.0;
                    V(j,i) = 0.0;
                }
            }
            else 
            {

                // Generate Householder vector.

                for (long k = 0; k < i; k++) 
                {
                    d(k) /= scale;
                    h += d(k) * d(k);
                }
                type f = d(i-1);
                type g = sqrt(h);
                if (f > 0) 
                {
                    g = -g;
                }
                e(i) = scale * g;
                h = h - f * g;
                d(i-1) = f - g;
                for (long j = 0; j < i; j++) 
                {
                    e(j) = 0.0;
                }

                // Apply similarity transformation to remaining columns.

                for (long j = 0; j < i; j++) 
                {
                    f = d(j);
                    V(j,i) = f;
                    g = e(j) + V(j,j) * f;
                    for (long k = j+1; k <= i-1; k++) 
                    {
                        g += V(k,j) * d(k);
                        e(k) += V(k,j) * f;
                    }
                    e(j) = g;
                }
                f = 0.0;
                for (long j = 0; j < i; j++) 
                {
                    e(j) /= h;
                    f += e(j) * d(j);
                }
                type hh = f / (h + h);
                for (long j = 0; j < i; j++) 
                {
                    e(j) -= hh * d(j);
                }
                for (long j = 0; j < i; j++) 
                {
                    f = d(j);
                    g = e(j);
                    for (long k = j; k <= i-1; k++) 
                    {
                        V(k,j) -= (f * e(k) + g * d(k));
                    }
                    d(j) = V(i-1,j);
                    V(i,j) = 0.0;
                }
            }
            d(i) = h;
        }

        // Accumulate transformations.

        for (long i = 0; i < n-1; i++) 
        {
            V(n-1,i) = V(i,i);
            V(i,i) = 1.0;
            type h = d(i+1);
            if (h != 0.0) 
            {
                for (long k = 0; k <= i; k++) 
                {
                    d(k) = V(k,i+1) / h;
                }
                for (long j = 0; j <= i; j++) 
                {
                    type g = 0.0;
                    for (long k = 0; k <= i; k++) 
                    {
                        g += V(k,i+1) * V(k,j);
                    }
                    for (long k = 0; k <= i; k++) 
                    {
                        V(k,j) -= g * d(k);
                    }
                }
            }
            for (long k = 0; k <= i; k++) 
            {
                V(k,i+1) = 0.0;
            }
        }
        for (long j = 0; j < n; j++) 
        {
            d(j) = V(n-1,j);
            V(n-1,j) = 0.0;
        }
        V(n-1,n-1) = 1.0;
        e(0) = 0.0;
    } 

// ----------------------------------------------------------------------------------------

    template <typename matrix_exp_type>
    void eigenvalue_decomposition<matrix_exp_type>::
    tql2 () 
    {
        using std::pow;
        using std::min;
        using std::max;
        using std::abs;

        //  This is derived from the Algol procedures tql2, by
        //  Bowdler, Martin, Reinsch, and Wilkinson, Handbook for
        //  Auto. Comp., Vol.ii-Linear Algebra, and the corresponding
        //  Fortran subroutine in EISPACK.

        for (long i = 1; i < n; i++) 
        {
            e(i-1) = e(i);
        }
        e(n-1) = 0.0;

        type f = 0.0;
        type tst1 = 0.0;
        const type eps = std::numeric_limits<type>::epsilon();
        for (long l = 0; l < n; l++) 
        {

            // Find small subdiagonal element

            tst1 = max(tst1,abs(d(l)) + abs(e(l)));
            long m = l;

            // Original while-loop from Java code
            while (m < n) 
            {
                if (abs(e(m)) <= eps*tst1) 
                {
                    break;
                }
                m++;
            }
            if (m == n)
                --m;


            // If m == l, d(l) is an eigenvalue,
            // otherwise, iterate.

            if (m > l) 
            {
                long iter = 0;
                do 
                {
                    iter = iter + 1;  // (Could check iteration count here.)

                    // Compute implicit shift

                    type g = d(l);
                    type p = (d(l+1) - g) / (2.0 * e(l));
                    type r = hypot(p,1.0);
                    if (p < 0) 
                    {
                        r = -r;
                    }
                    d(l) = e(l) / (p + r);
                    d(l+1) = e(l) * (p + r);
                    type dl1 = d(l+1);
                    type h = g - d(l);
                    for (long i = l+2; i < n; i++) 
                    {
                        d(i) -= h;
                    }
                    f = f + h;

                    // Implicit QL transformation.

                    p = d(m);
                    type c = 1.0;
                    type c2 = c;
                    type c3 = c;
                    type el1 = e(l+1);
                    type s = 0.0;
                    type s2 = 0.0;
                    for (long i = m-1; i >= l; i--) 
                    {
                        c3 = c2;
                        c2 = c;
                        s2 = s;
                        g = c * e(i);
                        h = c * p;
                        r = hypot(p,e(i));
                        e(i+1) = s * r;
                        s = e(i) / r;
                        c = p / r;
                        p = c * d(i) - s * g;
                        d(i+1) = h + s * (c * g + s * d(i));

                        // Accumulate transformation.

                        for (long k = 0; k < n; k++) 
                        {
                            h = V(k,i+1);
                            V(k,i+1) = s * V(k,i) + c * h;
                            V(k,i) = c * V(k,i) - s * h;
                        }
                    }
                    p = -s * s2 * c3 * el1 * e(l) / dl1;
                    e(l) = s * p;
                    d(l) = c * p;

                    // Check for convergence.

                } while (abs(e(l)) > eps*tst1);
            }
            d(l) = d(l) + f;
            e(l) = 0.0;
        }

        /*
            The code to sort the eigenvalues and eigenvectors 
            has been removed from here since, in the non-symmetric case,
            we can't sort the eigenvalues in a meaningful way.  If we left this
            code in here then the user might supply what they thought was a symmetric
            matrix but was actually slightly non-symmetric due to rounding error
            and then they would end up in the non-symmetric eigenvalue solver
            where the eigenvalues don't end up getting sorted.  So to avoid
            any possible user confusion I'm just removing this.
        */
    }

// ----------------------------------------------------------------------------------------

    template <typename matrix_exp_type>
    void eigenvalue_decomposition<matrix_exp_type>::
    orthes () 
    {
        using std::abs;
        using std::sqrt;

        //  This is derived from the Algol procedures orthes and ortran,
        //  by Martin and Wilkinson, Handbook for Auto. Comp.,
        //  Vol.ii-Linear Algebra, and the corresponding
        //  Fortran subroutines in EISPACK.

        long low = 0;
        long high = n-1;

        for (long m = low+1; m <= high-1; m++) 
        {

            // Scale column.

            type scale = 0.0;
            for (long i = m; i <= high; i++) 
            {
                scale = scale + abs(H(i,m-1));
            }
            if (scale != 0.0) 
            {

                // Compute Householder transformation.

                type h = 0.0;
                for (long i = high; i >= m; i--) 
                {
                    ort(i) = H(i,m-1)/scale;
                    h += ort(i) * ort(i);
                }
                type g = sqrt(h);
                if (ort(m) > 0) 
                {
                    g = -g;
                }
                h = h - ort(m) * g;
                ort(m) = ort(m) - g;

                // Apply Householder similarity transformation
                // H = (I-u*u'/h)*H*(I-u*u')/h)

                for (long j = m; j < n; j++) 
                {
                    type f = 0.0;
                    for (long i = high; i >= m; i--) 
                    {
                        f += ort(i)*H(i,j);
                    }
                    f = f/h;
                    for (long i = m; i <= high; i++) 
                    {
                        H(i,j) -= f*ort(i);
                    }
                }

                for (long i = 0; i <= high; i++) 
                {
                    type f = 0.0;
                    for (long j = high; j >= m; j--) 
                    {
                        f += ort(j)*H(i,j);
                    }
                    f = f/h;
                    for (long j = m; j <= high; j++) 
                    {
                        H(i,j) -= f*ort(j);
                    }
                }
                ort(m) = scale*ort(m);
                H(m,m-1) = scale*g;
            }
        }

        // Accumulate transformations (Algol's ortran).

        for (long i = 0; i < n; i++) 
        {
            for (long j = 0; j < n; j++) 
            {
                V(i,j) = (i == j ? 1.0 : 0.0);
            }
        }

        for (long m = high-1; m >= low+1; m--) 
        {
            if (H(m,m-1) != 0.0) 
            {
                for (long i = m+1; i <= high; i++) 
                {
                    ort(i) = H(i,m-1);
                }
                for (long j = m; j <= high; j++) 
                {
                    type g = 0.0;
                    for (long i = m; i <= high; i++) 
                    {
                        g += ort(i) * V(i,j);
                    }
                    // Double division avoids possible underflow
                    g = (g / ort(m)) / H(m,m-1);
                    for (long i = m; i <= high; i++) 
                    {
                        V(i,j) += g * ort(i);
                    }
                }
            }
        }
    }

// ----------------------------------------------------------------------------------------

    template <typename matrix_exp_type>
    void eigenvalue_decomposition<matrix_exp_type>::
    cdiv_(type xr, type xi, type yr, type yi)  
    {
        using std::abs;
        type r,d;
        if (abs(yr) > abs(yi)) 
        {
            r = yi/yr;
            d = yr + r*yi;
            cdivr = (xr + r*xi)/d;
            cdivi = (xi - r*xr)/d;
        } 
        else 
        {
            r = yr/yi;
            d = yi + r*yr;
            cdivr = (r*xr + xi)/d;
            cdivi = (r*xi - xr)/d;
        }
    }

// ----------------------------------------------------------------------------------------

    template <typename matrix_exp_type>
    void eigenvalue_decomposition<matrix_exp_type>::
    hqr2 ()
    {
        using std::pow;
        using std::min;
        using std::max;
        using std::abs;
        using std::sqrt;

        //  This is derived from the Algol procedure hqr2,
        //  by Martin and Wilkinson, Handbook for Auto. Comp.,
        //  Vol.ii-Linear Algebra, and the corresponding
        //  Fortran subroutine in EISPACK.

        // Initialize

        long nn = this->n;
        long n = nn-1;
        long low = 0;
        long high = nn-1;
        const type eps = std::numeric_limits<type>::epsilon();
        type exshift = 0.0;
        type p=0,q=0,r=0,s=0,z=0,t,w,x,y;

        // Store roots isolated by balanc and compute matrix norm

        type norm = 0.0;
        for (long i = 0; i < nn; i++) 
        {
            if ((i < low) || (i > high)) 
            {
                d(i) = H(i,i);
                e(i) = 0.0;
            }
            for (long j = max(i-1,0L); j < nn; j++) 
            {
                norm = norm + abs(H(i,j));
            }
        }

        // Outer loop over eigenvalue index

        long iter = 0;
        while (n >= low) 
        {

            // Look for single small sub-diagonal element

            long l = n;
            while (l > low) 
            {
                s = abs(H(l-1,l-1)) + abs(H(l,l));
                if (s == 0.0) 
                {
                    s = norm;
                }
                if (abs(H(l,l-1)) < eps * s) 
                {
                    break;
                }
                l--;
            }

            // Check for convergence
            // One root found

            if (l == n) 
            {
                H(n,n) = H(n,n) + exshift;
                d(n) = H(n,n);
                e(n) = 0.0;
                n--;
                iter = 0;

                // Two roots found

            } 
            else if (l == n-1) 
            {
                w = H(n,n-1) * H(n-1,n);
                p = (H(n-1,n-1) - H(n,n)) / 2.0;
                q = p * p + w;
                z = sqrt(abs(q));
                H(n,n) = H(n,n) + exshift;
                H(n-1,n-1) = H(n-1,n-1) + exshift;
                x = H(n,n);

                // type pair

                if (q >= 0) 
                {
                    if (p >= 0) 
                    {
                        z = p + z;
                    } 
                    else 
                    {
                        z = p - z;
                    }
                    d(n-1) = x + z;
                    d(n) = d(n-1);
                    if (z != 0.0) 
                    {
                        d(n) = x - w / z;
                    }
                    e(n-1) = 0.0;
                    e(n) = 0.0;
                    x = H(n,n-1);
                    s = abs(x) + abs(z);
                    p = x / s;
                    q = z / s;
                    r = sqrt(p * p+q * q);
                    p = p / r;
                    q = q / r;

                    // Row modification

                    for (long j = n-1; j < nn; j++) 
                    {
                        z = H(n-1,j);
                        H(n-1,j) = q * z + p * H(n,j);
                        H(n,j) = q * H(n,j) - p * z;
                    }

                    // Column modification

                    for (long i = 0; i <= n; i++) 
                    {
                        z = H(i,n-1);
                        H(i,n-1) = q * z + p * H(i,n);
                        H(i,n) = q * H(i,n) - p * z;
                    }

                    // Accumulate transformations

                    for (long i = low; i <= high; i++) 
                    {
                        z = V(i,n-1);
                        V(i,n-1) = q * z + p * V(i,n);
                        V(i,n) = q * V(i,n) - p * z;
                    }

                    // Complex pair

                } 
                else 
                {
                    d(n-1) = x + p;
                    d(n) = x + p;
                    e(n-1) = z;
                    e(n) = -z;
                }
                n = n - 2;
                iter = 0;

                // No convergence yet

            } 
            else 
            {

                // Form shift

                x = H(n,n);
                y = 0.0;
                w = 0.0;
                if (l < n) 
                {
                    y = H(n-1,n-1);
                    w = H(n,n-1) * H(n-1,n);
                }

                // Wilkinson's original ad hoc shift

                if (iter == 10) 
                {
                    exshift += x;
                    for (long i = low; i <= n; i++) 
                    {
                        H(i,i) -= x;
                    }
                    s = abs(H(n,n-1)) + abs(H(n-1,n-2));
                    x = y = 0.75 * s;
                    w = -0.4375 * s * s;
                }

                // MATLAB's new ad hoc shift

                if (iter == 30) 
                {
                    s = (y - x) / 2.0;
                    s = s * s + w;
                    if (s > 0) 
                    {
                        s = sqrt(s);
                        if (y < x) 
                        {
                            s = -s;
                        }
                        s = x - w / ((y - x) / 2.0 + s);
                        for (long i = low; i <= n; i++) 
                        {
                            H(i,i) -= s;
                        }
                        exshift += s;
                        x = y = w = 0.964;
                    }
                }

                iter = iter + 1;   // (Could check iteration count here.)

                // Look for two consecutive small sub-diagonal elements

                long m = n-2;
                while (m >= l) 
                {
                    z = H(m,m);
                    r = x - z;
                    s = y - z;
                    p = (r * s - w) / H(m+1,m) + H(m,m+1);
                    q = H(m+1,m+1) - z - r - s;
                    r = H(m+2,m+1);
                    s = abs(p) + abs(q) + abs(r);
                    p = p / s;
                    q = q / s;
                    r = r / s;
                    if (m == l) 
                    {
                        break;
                    }
                    if (abs(H(m,m-1)) * (abs(q) + abs(r)) <
                        eps * (abs(p) * (abs(H(m-1,m-1)) + abs(z) +
                                         abs(H(m+1,m+1))))) 
                    {
                        break;
                    }
                    m--;
                }

                for (long i = m+2; i <= n; i++) 
                {
                    H(i,i-2) = 0.0;
                    if (i > m+2) 
                    {
                        H(i,i-3) = 0.0;
                    }
                }

                // Double QR step involving rows l:n and columns m:n

                for (long k = m; k <= n-1; k++) 
                {
                    long notlast = (k != n-1);
                    if (k != m) 
                    {
                        p = H(k,k-1);
                        q = H(k+1,k-1);
                        r = (notlast ? H(k+2,k-1) : 0.0);
                        x = abs(p) + abs(q) + abs(r);
                        if (x != 0.0) 
                        {
                            p = p / x;
                            q = q / x;
                            r = r / x;
                        }
                    }
                    if (x == 0.0) 
                    {
                        break;
                    }
                    s = sqrt(p * p + q * q + r * r);
                    if (p < 0) 
                    {
                        s = -s;
                    }
                    if (s != 0) 
                    {
                        if (k != m) 
                        {
                            H(k,k-1) = -s * x;
                        } 
                        else if (l != m) 
                        {
                            H(k,k-1) = -H(k,k-1);
                        }
                        p = p + s;
                        x = p / s;
                        y = q / s;
                        z = r / s;
                        q = q / p;
                        r = r / p;

                        // Row modification

                        for (long j = k; j < nn; j++) 
                        {
                            p = H(k,j) + q * H(k+1,j);
                            if (notlast) 
                            {
                                p = p + r * H(k+2,j);
                                H(k+2,j) = H(k+2,j) - p * z;
                            }
                            H(k,j) = H(k,j) - p * x;
                            H(k+1,j) = H(k+1,j) - p * y;
                        }

                        // Column modification

                        for (long i = 0; i <= min(n,k+3); i++) 
                        {
                            p = x * H(i,k) + y * H(i,k+1);
                            if (notlast) 
                            {
                                p = p + z * H(i,k+2);
                                H(i,k+2) = H(i,k+2) - p * r;
                            }
                            H(i,k) = H(i,k) - p;
                            H(i,k+1) = H(i,k+1) - p * q;
                        }

                        // Accumulate transformations

                        for (long i = low; i <= high; i++) 
                        {
                            p = x * V(i,k) + y * V(i,k+1);
                            if (notlast) 
                            {
                                p = p + z * V(i,k+2);
                                V(i,k+2) = V(i,k+2) - p * r;
                            }
                            V(i,k) = V(i,k) - p;
                            V(i,k+1) = V(i,k+1) - p * q;
                        }
                    }  // (s != 0)
                }  // k loop
            }  // check convergence
        }  // while (n >= low)

        // Backsubstitute to find vectors of upper triangular form

        if (norm == 0.0) 
        {
            return;
        }

        for (n = nn-1; n >= 0; n--) 
        {
            p = d(n);
            q = e(n);

            // Real vector

            if (q == 0) 
            {
                long l = n;
                H(n,n) = 1.0;
                for (long i = n-1; i >= 0; i--) 
                {
                    w = H(i,i) - p;
                    r = 0.0;
                    for (long j = l; j <= n; j++) 
                    {
                        r = r + H(i,j) * H(j,n);
                    }
                    if (e(i) < 0.0) 
                    {
                        z = w;
                        s = r;
                    } 
                    else 
                    {
                        l = i;
                        if (e(i) == 0.0) 
                        {
                            if (w != 0.0) 
                            {
                                H(i,n) = -r / w;
                            } 
                            else 
                            {
                                H(i,n) = -r / (eps * norm);
                            }

                            // Solve real equations

                        } 
                        else 
                        {
                            x = H(i,i+1);
                            y = H(i+1,i);
                            q = (d(i) - p) * (d(i) - p) + e(i) * e(i);
                            t = (x * s - z * r) / q;
                            H(i,n) = t;
                            if (abs(x) > abs(z)) 
                            {
                                H(i+1,n) = (-r - w * t) / x;
                            } 
                            else 
                            {
                                H(i+1,n) = (-s - y * t) / z;
                            }
                        }

                        // Overflow control

                        t = abs(H(i,n));
                        if ((eps * t) * t > 1) 
                        {
                            for (long j = i; j <= n; j++) 
                            {
                                H(j,n) = H(j,n) / t;
                            }
                        }
                    }
                }

                // Complex vector

            } 
            else if (q < 0) 
            {
                long l = n-1;

                // Last vector component imaginary so matrix is triangular

                if (abs(H(n,n-1)) > abs(H(n-1,n))) 
                {
                    H(n-1,n-1) = q / H(n,n-1);
                    H(n-1,n) = -(H(n,n) - p) / H(n,n-1);
                } 
                else 
                {
                    cdiv_(0.0,-H(n-1,n),H(n-1,n-1)-p,q);
                    H(n-1,n-1) = cdivr;
                    H(n-1,n) = cdivi;
                }
                H(n,n-1) = 0.0;
                H(n,n) = 1.0;
                for (long i = n-2; i >= 0; i--) 
                {
                    type ra,sa,vr,vi;
                    ra = 0.0;
                    sa = 0.0;
                    for (long j = l; j <= n; j++) 
                    {
                        ra = ra + H(i,j) * H(j,n-1);
                        sa = sa + H(i,j) * H(j,n);
                    }
                    w = H(i,i) - p;

                    if (e(i) < 0.0) 
                    {
                        z = w;
                        r = ra;
                        s = sa;
                    } 
                    else 
                    {
                        l = i;
                        if (e(i) == 0) 
                        {
                            cdiv_(-ra,-sa,w,q);
                            H(i,n-1) = cdivr;
                            H(i,n) = cdivi;
                        } 
                        else 
                        {

                            // Solve complex equations

                            x = H(i,i+1);
                            y = H(i+1,i);
                            vr = (d(i) - p) * (d(i) - p) + e(i) * e(i) - q * q;
                            vi = (d(i) - p) * 2.0 * q;
                            if ((vr == 0.0) && (vi == 0.0)) 
                            {
                                vr = eps * norm * (abs(w) + abs(q) +
                                                   abs(x) + abs(y) + abs(z));
                            }
                            cdiv_(x*r-z*ra+q*sa,x*s-z*sa-q*ra,vr,vi);
                            H(i,n-1) = cdivr;
                            H(i,n) = cdivi;
                            if (abs(x) > (abs(z) + abs(q))) 
                            {
                                H(i+1,n-1) = (-ra - w * H(i,n-1) + q * H(i,n)) / x;
                                H(i+1,n) = (-sa - w * H(i,n) - q * H(i,n-1)) / x;
                            }
                            else 
                            {
                                cdiv_(-r-y*H(i,n-1),-s-y*H(i,n),z,q);
                                H(i+1,n-1) = cdivr;
                                H(i+1,n) = cdivi;
                            }
                        }

                        // Overflow control

                        t = max(abs(H(i,n-1)),abs(H(i,n)));
                        if ((eps * t) * t > 1) 
                        {
                            for (long j = i; j <= n; j++) 
                            {
                                H(j,n-1) = H(j,n-1) / t;
                                H(j,n) = H(j,n) / t;
                            }
                        }
                    }
                }
            }
        }

        // Vectors of isolated roots

        for (long i = 0; i < nn; i++) 
        {
            if (i < low || i > high) 
            {
                for (long j = i; j < nn; j++) 
                {
                    V(i,j) = H(i,j);
                }
            }
        }

        // Back transformation to get eigenvectors of original matrix

        for (long j = nn-1; j >= low; j--) 
        {
            for (long i = low; i <= high; i++) 
            {
                z = 0.0;
                for (long k = low; k <= min(j,high); k++) 
                {
                    z = z + V(i,k) * H(k,j);
                }
                V(i,j) = z;
            }
        }
    }

// ----------------------------------------------------------------------------------------


} 

#endif // DLIB_MATRIX_EIGENVALUE_DECOMPOSITION_H 




