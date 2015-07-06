// Copyright (C) 2013  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#ifndef DLIB_CCA_hh_
#define DLIB_CCA_hh_

#include "cca_abstract.h"
#include "../algs.h"
#include "../matrix.h"
#include "../sparse_vector.h"
#include "random_subset_selector.h"

namespace dlib
{

// ----------------------------------------------------------------------------------------

    template <
        typename T
        >
    matrix<typename T::type,0,1> compute_correlations (
        const matrix_exp<T>& L,
        const matrix_exp<T>& R
    )
    {
        DLIB_ASSERT( L.size() > 0 && R.size() > 0 && L.nr() == R.nr(), 
            "\t matrix compute_correlations()"
            << "\n\t Invalid inputs were given to this function."
            << "\n\t L.size(): " << L.size()
            << "\n\t R.size(): " << R.size()
            << "\n\t L.nr():   " << L.nr()
            << "\n\t R.nr():   " << R.nr()
            );

        typedef typename T::type type;
        matrix<type> A, B, C;
        A = diag(trans(R)*L);
        B = sqrt(diag(trans(L)*L));
        C = sqrt(diag(trans(R)*R));
        A = pointwise_multiply(A , reciprocal(pointwise_multiply(B,C)));
        return A;
    }

// ----------------------------------------------------------------------------------------

    template <
        typename matrix_type, 
        typename T
        >
    matrix<T,0,1> impl_cca (
        const matrix_type& L,
        const matrix_type& R,
        matrix<T>& Ltrans,
        matrix<T>& Rtrans,
        unsigned long num_correlations,
        unsigned long extra_rank,
        unsigned long q,
        unsigned long num_output_correlations,
        double regularization
    )
    {
        matrix<T> Ul, Vl;
        matrix<T> Ur, Vr;
        matrix<T> U, V;
        matrix<T,0,1> Dr, Dl, D;


        // Note that we add a few more singular vectors in because it helps improve the
        // final results if we run this part with a little higher rank than the final SVD.
        svd_fast(L, Ul, Dl, Vl, num_correlations+extra_rank, q);
        svd_fast(R, Ur, Dr, Vr, num_correlations+extra_rank, q);

        // Zero out singular values that are essentially zero so they don't cause numerical
        // difficulties in the code below.
        const double eps = std::numeric_limits<T>::epsilon()*std::max(max(Dr),max(Dl))*100;
        Dl = round_zeros(Dl+regularization,eps);
        Dr = round_zeros(Dr+regularization,eps);

        // This matrix is really small so we can do a normal full SVD on it.  Note that we
        // also throw away the columns of Ul and Ur corresponding to zero singular values.
        svd3(diagm(Dl>0)*tmp(trans(Ul)*Ur)*diagm(Dr>0), U, D, V);

        // now throw away extra columns of the transformations.  We do this in a way
        // that keeps the directions that have the highest correlations.
        matrix<T,0,1> temp = D;
        rsort_columns(U, temp);
        rsort_columns(V, D);
        U = colm(U, range(0, num_output_correlations-1));
        V = colm(V, range(0, num_output_correlations-1));
        D = rowm(D, range(0, num_output_correlations-1));

        Ltrans = Vl*inv(diagm(Dl))*U;
        Rtrans = Vr*inv(diagm(Dr))*V;

        // Note that the D matrix contains the correlation values for the transformed
        // vectors.  However, when the L and R matrices have rank higher than
        // num_correlations+extra_rank then the values in D become only approximate.
        return D; 
    }

// ----------------------------------------------------------------------------------------

    template <typename T>
    matrix<T,0,1> cca (
        const matrix<T>& L,
        const matrix<T>& R,
        matrix<T>& Ltrans,
        matrix<T>& Rtrans,
        unsigned long num_correlations,
        unsigned long extra_rank = 5,
        unsigned long q = 2,
        double regularization = 0
    )
    {
        DLIB_ASSERT( num_correlations > 0 && L.size() > 0 && R.size() > 0 && L.nr() == R.nr() &&
            regularization >= 0, 
            "\t matrix cca()"
            << "\n\t Invalid inputs were given to this function."
            << "\n\t num_correlations: " << num_correlations 
            << "\n\t regularization:   " << regularization 
            << "\n\t L.size(): " << L.size()
            << "\n\t R.size(): " << R.size()
            << "\n\t L.nr():   " << L.nr()
            << "\n\t R.nr():   " << R.nr()
            );

        using std::min;
        const unsigned long n = min(num_correlations, (unsigned long)min(R.nr(),min(L.nc(), R.nc())));
        return impl_cca(L,R,Ltrans, Rtrans, num_correlations, extra_rank, q, n, regularization); 
    }

// ----------------------------------------------------------------------------------------

    template <typename sparse_vector_type, typename T>
    matrix<T,0,1> cca (
        const std::vector<sparse_vector_type>& L,
        const std::vector<sparse_vector_type>& R,
        matrix<T>& Ltrans,
        matrix<T>& Rtrans,
        unsigned long num_correlations,
        unsigned long extra_rank = 5,
        unsigned long q = 2,
        double regularization = 0
    )
    {
        DLIB_ASSERT( num_correlations > 0 && L.size() == R.size() && 
                     max_index_plus_one(L) > 0 && max_index_plus_one(R) > 0 &&
                     regularization >= 0, 
            "\t matrix cca()"
            << "\n\t Invalid inputs were given to this function."
            << "\n\t num_correlations: " << num_correlations 
            << "\n\t regularization:   " << regularization 
            << "\n\t L.size(): " << L.size()
            << "\n\t R.size(): " << R.size()
            << "\n\t max_index_plus_one(L):   " << max_index_plus_one(L)
            << "\n\t max_index_plus_one(R):   " << max_index_plus_one(R)
            );

        using std::min;
        const unsigned long n = min(max_index_plus_one(L), max_index_plus_one(R));
        const unsigned long num_output_correlations = min(num_correlations, std::min<unsigned long>(R.size(),n));
        return impl_cca(L,R,Ltrans, Rtrans, num_correlations, extra_rank, q, num_output_correlations, regularization); 
    }

// ----------------------------------------------------------------------------------------

    template <typename sparse_vector_type, typename Rand_type, typename T>
    matrix<T,0,1> cca (
        const random_subset_selector<sparse_vector_type,Rand_type>& L,
        const random_subset_selector<sparse_vector_type,Rand_type>& R,
        matrix<T>& Ltrans,
        matrix<T>& Rtrans,
        unsigned long num_correlations,
        unsigned long extra_rank = 5,
        unsigned long q = 2
    )
    {
        return cca(L.to_std_vector(), R.to_std_vector(), Ltrans, Rtrans, num_correlations, extra_rank, q);
    }

// ----------------------------------------------------------------------------------------

}

#endif // DLIB_CCA_hh_


