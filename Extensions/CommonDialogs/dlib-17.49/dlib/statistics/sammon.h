// Copyright (C) 2012  Emanuele Cesena (emanuele.cesena@gmail.com), Davis E. King
// License: Boost Software License   See LICENSE.txt for the full license.
#ifndef DLIB_SAMMoN_H__
#define DLIB_SAMMoN_H__

#include "sammon_abstract.h"
#include "../matrix.h"
#include "../algs.h"
#include "dpca.h"
#include <vector>

namespace dlib
{

    class sammon_projection
    {

    public:

    // ------------------------------------------------------------------------------------

        template <typename matrix_type>
        std::vector<matrix<double,0,1> > operator() (
            const std::vector<matrix_type>& data,       
            const long num_dims                      
        )
        {
            // make sure requires clause is not broken
            DLIB_ASSERT(num_dims > 0,
                "\t std::vector<matrix<double,0,1> > sammon_projection::operator()"
                << "\n\t Invalid inputs were given to this function."
                << "\n\t num_dims:    " << num_dims
                );
            std::vector<matrix<double,0,1> > result;    // projections
            if (data.size() == 0)
            {
                return result;
            }

#ifdef ENABLE_ASSERTS
            DLIB_ASSERT(0 < num_dims && num_dims <= data[0].size(),
                "\t std::vector<matrix<double,0,1> > sammon_projection::operator()"
                << "\n\t Invalid inputs were given to this function."
                << "\n\t data.size():    " << data.size()
                << "\n\t num_dims:       " << num_dims
                << "\n\t data[0].size(): " << data[0].size() 
                );
            for (unsigned long i = 0; i < data.size(); ++i)
            {
                DLIB_ASSERT(is_col_vector(data[i]) && data[i].size() == data[0].size(),
                        "\t std::vector<matrix<double,0,1> > sammon_projection::operator()"
                        << "\n\t Invalid inputs were given to this function."
                        << "\n\t data["<<i<<"].size():    " << data[i].size()
                        << "\n\t data[0].size(): " << data[0].size() 
                        << "\n\t is_col_vector(data["<<i<<"]): " << is_col_vector(data[i])
                );
            }
#endif

            double err;                                 // error (discarded)
            do_sammon_projection(data, num_dims, result, err);
            return result;
        }

    // ------------------------------------------------------------------------------------

        template <typename matrix_type>
        void operator() (
            const std::vector<matrix_type>& data,       
            const long num_dims,                     
            std::vector<matrix<double,0,1> >& result,   
            double &err,                                
            const unsigned long num_iters = 1000,             
            const double err_delta = 1.0e-9            
        )
        {
            // make sure requires clause is not broken
            DLIB_ASSERT(num_dims > 0 && num_iters > 0 && err_delta > 0.0,
                "\t std::vector<matrix<double,0,1> > sammon_projection::operator()"
                << "\n\t Invalid inputs were given to this function."
                << "\n\t data.size(): " << data.size()
                << "\n\t num_dims:    " << num_dims
                << "\n\t num_iters:   " << num_iters
                << "\n\t err_delta:   " << err_delta
                );
            if (data.size() == 0)
            {
                result.clear();
                err = 0;
                return;
            }

#ifdef ENABLE_ASSERTS
            DLIB_ASSERT(0 < num_dims && num_dims <= data[0].size(),
                "\t std::vector<matrix<double,0,1> > sammon_projection::operator()"
                << "\n\t Invalid inputs were given to this function."
                << "\n\t data.size():    " << data.size()
                << "\n\t num_dims:       " << num_dims
                << "\n\t data[0].size(): " << data[0].size() 
                );
            for (unsigned long i = 0; i < data.size(); ++i)
            {
                DLIB_ASSERT(is_col_vector(data[i]) && data[i].size() == data[0].size(),
                        "\t std::vector<matrix<double,0,1> > sammon_projection::operator()"
                        << "\n\t Invalid inputs were given to this function."
                        << "\n\t data["<<i<<"].size():    " << data[i].size()
                        << "\n\t data[0].size(): " << data[0].size() 
                        << "\n\t is_col_vector(data["<<i<<"]): " << is_col_vector(data[i])
                );
            }
#endif

            do_sammon_projection(data, num_dims, result, err, num_iters, err_delta);
        }

        // ----------------------------------------------------------------------------------------
        // ----------------------------------------------------------------------------------------

    private:

        void compute_relative_distances(
            matrix<double,0,1>& dist,                   // relative distances (output)
            matrix<double,0,0>& data,                   // input data (matrix whose columns are the input vectors)
            double eps_ratio = 1.0e-7                   // to compute the minimum distance eps
        )
        /*!
            requires
                - dist.nc() == comb( data.nc(), 2 ), preallocated
                - eps_ratio > 0
            ensures
                - dist[k] == lenght(data[i] - data[j]) for k = j(j-1)/2 + i
        !*/
        {
            const long N = data.nc();                   // num of points
            double eps;                                 // minimum distance, forced to avoid vectors collision
                                                        // computed at runtime as eps_ration * mean(vectors distances)
            for (int k = 0, i = 1; i < N; ++i)
                for (int j = 0; j < i; ++j)
                    dist(k++) = length(colm(data, i) - colm(data, j));

            eps = eps_ratio * mean(dist);
            dist = lowerbound(dist, eps);
        }

        // ----------------------------------------------------------------------------------------

        template <typename matrix_type>
        void do_sammon_projection(
            const std::vector<matrix_type>& data,       // input data
            unsigned long num_dims,                     // dimension of the reduced space
            std::vector<matrix<double,0,1> >& result,   // projections (output)
            double &err,                                // error (output)
            unsigned long num_iters = 1000,             // max num of iterations: stop condition
            const double err_delta = 1.0e-9             // delta error: stop condition
        )
        /*!
            requires
                - matrix_type should be a kind of dlib::matrix<double,N,1>
                - num_dims > 0
                - num_iters > 0
                - err_delta > 0
            ensures
                - result == a set of matrix<double,num_dims,1> objects that represent
                  the Sammon's projections of data vectors.
                - err == the estimated error done in the projection, with the extra
                  property that err(at previous iteration) - err < err_delta
        !*/
        {
            // other params
            const double mf = 0.3;                      // magic factor

            matrix<double> mdata;                // input data as matrix
            matrix<double> projs;                // projected vectors, i.e. output data as matrix

            // std::vector<matrix> -> matrix
            mdata.set_size(data[0].size(), data.size());
            for (unsigned int i = 0; i < data.size(); i++)
                set_colm(mdata, i) = data[i];

            const long N = mdata.nc();           // num of points
            const long d = num_dims;             // size of the reduced space
            const long nd = N * (N - 1) / 2;     // num of pairs of points = size of the distances vectors

            matrix<double, 0, 1> dsij, inv_dsij; // d*_ij: pair-wise distances in the input space (and inverses)
            dsij.set_size(nd, 1);
            inv_dsij.set_size(nd, 1);
            double ic; // 1.0 / sum of dsij

            matrix<double, 0, 1> dij;            // d_ij: pair-wise distances in the reduced space
            dij.set_size(nd, 1);

            matrix<double, 0, 0> dE, dE2, dtemp; // matrices representing error partial derivatives
            dE.set_size(d, N);
            dE2.set_size(d, N);
            dtemp.set_size(d, N);

            matrix<double, 0, 1> inv_dij, alpha; // utility vectors used to compute the partial derivatives
            inv_dij.set_size(N, 1);              // inv_dij is 1.0/dij, but we only need it column-wise
            alpha.set_size(N, 1);                // (slightly wasting a bit of computation)
            // alpha = 1.0/dij - 1.0/dsij, again column-wise


            // initialize projs with PCA
            discriminant_pca<matrix<double> > dpca;
            for (int i = 0; i < mdata.nc(); ++i)
            {
                dpca.add_to_total_variance(colm(mdata, i));
            }
            matrix<double> mat = dpca.dpca_matrix_of_size(num_dims);
            projs = mat * mdata;

            // compute dsij, inv_dsij and ic
            compute_relative_distances(dsij, mdata);
            inv_dsij = 1.0 / dsij;
            ic = 1.0 / sum(dsij);

            // compute dij and err
            compute_relative_distances(dij, projs);
            err = ic * sum(pointwise_multiply(squared(dij - dsij), inv_dsij));

            // start iterating
            while (num_iters--)
            {
                // compute dE, dE2 progressively column by column
                for (int p = 0; p < N; ++p)
                {
                    // compute
                    // - alpha_p, the column vector with 1/d_pj - 1/d*_pj
                    // - dtemp, the matrix with the p-th column repeated all along
                    //TODO: optimize constructions
                    for (int i = 0; i < N; ++i)
                    {
                        int pos = (i < p) ? p * (p - 1) / 2 + i : i * (i - 1) / 2 + p;
                        inv_dij(i) = (i == p) ? 0.0 : 1.0 / dij(pos);
                        alpha(i) = (i == p) ? 0.0 : inv_dij(i) - inv_dsij(pos);
                        set_colm(dtemp, i) = colm(projs, p);
                    }

                    dtemp -= projs;
                    set_colm(dE, p) = dtemp * alpha;

                    double sum_alpha = sum(alpha);
                    set_colm(dE2, p) = abs( sum_alpha + squared(dtemp) * cubed(inv_dij) );
                }


                // compute the update projections
                projs += pointwise_multiply(dE, mf * reciprocal(dE2));

                // compute new dij and error
                compute_relative_distances(dij, projs);
                double err_new = ic * sum( pointwise_multiply(squared(dij - dsij), inv_dsij) );
                if (err - err_new < err_delta)
                    break;
                err = err_new;
            }

            // matrix -> std::vector<matrix>
            result.clear();
            for (int i = 0; i < projs.nc(); ++i)
                result.push_back(colm(projs, i));
        }

    };

} // namespace dlib

#endif // DLIB_SAMMoN_H__

