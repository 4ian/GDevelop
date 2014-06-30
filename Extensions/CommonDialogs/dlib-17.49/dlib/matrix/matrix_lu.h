// Copyright (C) 2009  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
// This code was adapted from code from the JAMA part of NIST's TNT library.
//    See: http://math.nist.gov/tnt/ 
#ifndef DLIB_MATRIX_LU_DECOMPOSITION_H
#define DLIB_MATRIX_LU_DECOMPOSITION_H

#include "matrix.h" 
#include "matrix_utilities.h"
#include "matrix_subexp.h"
#include "matrix_trsm.h"
#include <algorithm>

#ifdef DLIB_USE_LAPACK 
#include "lapack/getrf.h"
#endif


namespace dlib 
{

    template <
        typename matrix_exp_type
        >
    class lu_decomposition
    {
    public:

        const static long NR = matrix_exp_type::NR;
        const static long NC = matrix_exp_type::NC;
        typedef typename matrix_exp_type::type type;
        typedef typename matrix_exp_type::mem_manager_type mem_manager_type;
        typedef typename matrix_exp_type::layout_type layout_type;

        typedef matrix<type,0,0,mem_manager_type,layout_type>  matrix_type;
        typedef matrix<type,NR,1,mem_manager_type,layout_type> column_vector_type;
        typedef matrix<long,NR,1,mem_manager_type,layout_type> pivot_column_vector_type;

        // You have supplied an invalid type of matrix_exp_type.  You have
        // to use this object with matrices that contain float or double type data.
        COMPILE_TIME_ASSERT((is_same_type<float, type>::value || 
                             is_same_type<double, type>::value ));

        template <typename EXP>
        lu_decomposition (
            const matrix_exp<EXP> &A
        );

        bool is_square (
        ) const;

        bool is_singular (
        ) const;

        long nr(
        ) const;

        long nc(
        ) const;

        const matrix_type get_l (
        ) const; 

        const matrix_type get_u (
        ) const;

        const pivot_column_vector_type& get_pivot (
        ) const;

        type det (
        ) const;

        template <typename EXP>
        const matrix_type solve (
            const matrix_exp<EXP> &B
        ) const;

    private:

        /* Array for internal storage of decomposition.  */
        matrix<type,0,0,mem_manager_type,column_major_layout>  LU;
        long m, n, pivsign; 
        pivot_column_vector_type piv;


    }; 

// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------
//                              Public member functions
// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------

    template <typename matrix_exp_type>
    template <typename EXP>
    lu_decomposition<matrix_exp_type>::
    lu_decomposition (
        const matrix_exp<EXP>& A
    ) : 
        LU(A),
        m(A.nr()),
        n(A.nc())
    {
        using namespace std;
        using std::abs;

        COMPILE_TIME_ASSERT((is_same_type<type, typename EXP::type>::value));

        // make sure requires clause is not broken
        DLIB_ASSERT(A.size() > 0,
            "\tlu_decomposition::lu_decomposition(A)"
            << "\n\tInvalid inputs were given to this function"
            << "\n\tA.size(): " << A.size()
            << "\n\tthis:     " << this
            );

#ifdef DLIB_USE_LAPACK
        matrix<lapack::integer,0,1,mem_manager_type,layout_type> piv_temp;
        lapack::getrf(LU, piv_temp);

        pivsign = 1;

        // Turn the piv_temp vector into a more useful form.  This way we will have the identity
        // rowm(A,piv) == L*U.  The permutation vector that comes out of LAPACK is somewhat
        // different.
        piv = trans(range(0,m-1));
        for (long i = 0; i < piv_temp.size(); ++i)
        {
            // -1 because FORTRAN is indexed starting with 1 instead of 0
            if (piv(piv_temp(i)-1) != piv(i))
            {
                std::swap(piv(i), piv(piv_temp(i)-1));
                pivsign = -pivsign;
            }
        }

#else

        // Use a "left-looking", dot-product, Crout/Doolittle algorithm.


        piv = trans(range(0,m-1));
        pivsign = 1;

        column_vector_type LUcolj(m);

        // Outer loop.
        for (long j = 0; j < n; j++) 
        {

            // Make a copy of the j-th column to localize references.
            LUcolj = colm(LU,j);

            // Apply previous transformations.
            for (long i = 0; i < m; i++) 
            {
                // Most of the time is spent in the following dot product.
                const long kmax = std::min(i,j);
                type s;
                if (kmax > 0)
                    s = rowm(LU,i, kmax)*colm(LUcolj,0,kmax);
                else 
                    s = 0;

                LU(i,j) = LUcolj(i) -= s;
            }

            // Find pivot and exchange if necessary.
            long p = j;
            for (long i = j+1; i < m; i++) 
            {
                if (abs(LUcolj(i)) > abs(LUcolj(p))) 
                {
                    p = i;
                }
            }
            if (p != j) 
            {
                long k=0;
                for (k = 0; k < n; k++) 
                {
                    type t = LU(p,k); 
                    LU(p,k) = LU(j,k); 
                    LU(j,k) = t;
                }
                k = piv(p); 
                piv(p) = piv(j); 
                piv(j) = k;
                pivsign = -pivsign;
            }

            // Compute multipliers.
            if ((j < m) && (LU(j,j) != 0.0)) 
            {
                for (long i = j+1; i < m; i++) 
                {
                    LU(i,j) /= LU(j,j);
                }
            }
        }

#endif
    }

// ----------------------------------------------------------------------------------------

    template <typename matrix_exp_type>
    bool lu_decomposition<matrix_exp_type>::
    is_square (
    ) const
    {
        return m == n;
    }

// ----------------------------------------------------------------------------------------

    template <typename matrix_exp_type>
    long lu_decomposition<matrix_exp_type>::
    nr (
    ) const
    {
        return m;
    }

// ----------------------------------------------------------------------------------------

    template <typename matrix_exp_type>
    long lu_decomposition<matrix_exp_type>::
    nc (
    ) const
    {
        return n;
    }

// ----------------------------------------------------------------------------------------

    template <typename matrix_exp_type>
    bool lu_decomposition<matrix_exp_type>::
    is_singular (
    ) const
    {
        /* Is the matrix singular?
          if upper triangular factor U (and hence A) is singular, false otherwise.
        */
        // make sure requires clause is not broken
        DLIB_ASSERT(is_square() == true,
            "\tbool lu_decomposition::is_singular()"
            << "\n\tYou can only use this on square matrices"
            << "\n\tthis: " << this
            );

        type max_val, min_val;
        find_min_and_max (abs(diag(LU)), min_val, max_val);
        type eps = max_val;
        if (eps != 0)
            eps *= std::sqrt(std::numeric_limits<type>::epsilon())/10;
        else
            eps = 1;  // there is no max so just use 1

        return min_val < eps;
    }

// ----------------------------------------------------------------------------------------

    template <typename matrix_exp_type>
    const typename lu_decomposition<matrix_exp_type>::matrix_type lu_decomposition<matrix_exp_type>::
    get_l (
    ) const
    {
        if (LU.nr() >= LU.nc())
            return lowerm(LU,1.0);
        else
            return lowerm(subm(LU,0,0,m,m), 1.0);
    }

// ----------------------------------------------------------------------------------------

    template <typename matrix_exp_type>
    const typename lu_decomposition<matrix_exp_type>::matrix_type lu_decomposition<matrix_exp_type>::
    get_u (
    ) const 
    {
        if (LU.nr() >= LU.nc())
            return upperm(subm(LU,0,0,n,n));
        else
            return upperm(LU);
    }

// ----------------------------------------------------------------------------------------

    template <typename matrix_exp_type>
    const typename lu_decomposition<matrix_exp_type>::pivot_column_vector_type& lu_decomposition<matrix_exp_type>::
    get_pivot (
    ) const
    {
        return piv;
    }

// ----------------------------------------------------------------------------------------

    template <typename matrix_exp_type>
    typename lu_decomposition<matrix_exp_type>::type lu_decomposition<matrix_exp_type>::
    det (
    ) const
    {
        // make sure requires clause is not broken
        DLIB_ASSERT(is_square() == true,
            "\ttype lu_decomposition::det()"
            << "\n\tYou can only use this on square matrices"
            << "\n\tthis: " << this
            );

        // Check if it is singular and if it is just return 0.  
        // We want to do this because a prod() operation can easily
        // overcome a single diagonal element that is effectively 0 when
        // LU is a big enough matrix.
        if (is_singular())
            return 0;

        return prod(diag(LU))*static_cast<type>(pivsign);
    }

// ----------------------------------------------------------------------------------------

    template <typename matrix_exp_type>
    template <typename EXP>
    const typename lu_decomposition<matrix_exp_type>::matrix_type lu_decomposition<matrix_exp_type>::
    solve (
        const matrix_exp<EXP> &B
    ) const
    {
        COMPILE_TIME_ASSERT((is_same_type<type, typename EXP::type>::value));

        // make sure requires clause is not broken
        DLIB_ASSERT(is_square() == true && B.nr() == nr(),
            "\ttype lu_decomposition::solve()"
            << "\n\tInvalid arguments to this function"
            << "\n\tis_square():   " << (is_square()? "true":"false" )
            << "\n\tB.nr():        " << B.nr() 
            << "\n\tnr():          " << nr() 
            << "\n\tthis:          " << this
            );

        // Copy right hand side with pivoting
        matrix<type,0,0,mem_manager_type,column_major_layout> X(rowm(B, piv));

        using namespace blas_bindings;
        // Solve L*Y = B(piv,:)
        triangular_solver(CblasLeft, CblasLower, CblasNoTrans, CblasUnit, LU, X);
        // Solve U*X = Y;
        triangular_solver(CblasLeft, CblasUpper, CblasNoTrans, CblasNonUnit, LU, X);
        return X;
    }

// ----------------------------------------------------------------------------------------

} 

#endif // DLIB_MATRIX_LU_DECOMPOSITION_H 


