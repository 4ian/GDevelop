// Copyright (C) 2015  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#ifndef DLIB_SPECTRAL_CLUSTEr_H_
#define DLIB_SPECTRAL_CLUSTEr_H_

#include "spectral_cluster_abstract.h"
#include <vector>
#include "../matrix.h"
#include "../svm/kkmeans.h"

namespace dlib
{
    template <
        typename kernel_type,
        typename vector_type
        >
    std::vector<unsigned long> spectral_cluster (
        const kernel_type& k,
        const vector_type& samples,
        const unsigned long num_clusters
    )
    {
        DLIB_CASSERT(num_clusters > 0, 
            "\t std::vector<unsigned long> spectral_cluster(k,samples,num_clusters)"
            << "\n\t num_clusters can't be 0."
            );

        if (num_clusters == 1)
        {
            // nothing to do, just assign everything to the 0 cluster.
            return std::vector<unsigned long>(samples.size(), 0);
        }

        // compute the similarity matrix.
        matrix<double> K(samples.size(), samples.size());
        for (long r = 0; r < K.nr(); ++r)
            for (long c = r+1; c < K.nc(); ++c)
                K(r,c) = K(c,r) = (double)k(samples[r], samples[c]);
        for (long r = 0; r < K.nr(); ++r)
            K(r,r) = 0;

        matrix<double,0,1> D(K.nr());
        for (long r = 0; r < K.nr(); ++r)
            D(r) = sum(rowm(K,r));
        D = sqrt(reciprocal(D));
        K = diagm(D)*K*diagm(D); 
        matrix<double> u,w,v;
        // Use the normal SVD routine unless the matrix is really big, then use the fast
        // approximate version.
        if (K.nr() < 1000)
            svd3(K,u,w,v);
        else
            svd_fast(K,u,w,v, num_clusters+100, 5);
        // Pick out the eigenvectors associated with the largest eigenvalues.
        rsort_columns(v,w);
        v = colm(v, range(0,num_clusters-1));
        // Now build the normalized spectral vectors, one for each input vector.
        std::vector<matrix<double,0,1> > spec_samps, centers;
        for (long r = 0; r < v.nr(); ++r)
        {
            spec_samps.push_back(trans(rowm(v,r)));
            spec_samps.back() /= length(spec_samps.back());
        }
        // Finally do the K-means clustering
        pick_initial_centers(num_clusters, centers, spec_samps);
        find_clusters_using_kmeans(spec_samps, centers);
        // And then compute the cluster assignments based on the output of K-means.
        std::vector<unsigned long> assignments;
        for (unsigned long i = 0; i < spec_samps.size(); ++i)
            assignments.push_back(nearest_center(centers, spec_samps[i]));

        return assignments;
    }

}

#endif // DLIB_SPECTRAL_CLUSTEr_H_

