// Copyright (C) 2014  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#ifndef DLIB_LDA_Hh_
#define DLIB_LDA_Hh_

#include "lda_abstract.h"
#include "../algs.h"
#include <map>
#include "../matrix.h"
#include <vector>

namespace dlib
{

// ----------------------------------------------------------------------------------------

    namespace impl
    {

        inline std::map<unsigned long,unsigned long> make_class_labels(
            const std::vector<unsigned long>& row_labels
        )
        {
            std::map<unsigned long,unsigned long> class_labels;
            for (unsigned long i = 0; i < row_labels.size(); ++i)
            {
                const unsigned long next = class_labels.size();
                if (class_labels.count(row_labels[i]) == 0)
                    class_labels[row_labels[i]] = next;
            }
            return class_labels;
        }

    // ------------------------------------------------------------------------------------

        template <
            typename T
            >
        matrix<T,0,1> center_matrix (
            matrix<T>& X
        )
        {
            matrix<T,1> mean;
            for (long r = 0; r < X.nr(); ++r)
                mean += rowm(X,r);
            mean /= X.nr();

            for (long r = 0; r < X.nr(); ++r)
                set_rowm(X,r) -= mean;

            return trans(mean);
        }
    }

// ----------------------------------------------------------------------------------------

    template <
        typename T
        >
    void compute_lda_transform (
        matrix<T>& X,
        matrix<T,0,1>& mean,
        const std::vector<unsigned long>& row_labels,
        unsigned long lda_dims = 500,
        unsigned long extra_pca_dims = 200
    )
    {
        std::map<unsigned long,unsigned long> class_labels = impl::make_class_labels(row_labels);
        // LDA can only give out at most class_labels.size()-1 dimensions so don't try to
        // compute more than that.
        lda_dims = std::min<unsigned long>(lda_dims, class_labels.size()-1);

        // make sure requires clause is not broken
        DLIB_CASSERT(class_labels.size() > 1,
            "\t void compute_lda_transform()"
            << "\n\t You can't call this function if the number of distinct class labels is less than 2."
            );
        DLIB_CASSERT(X.size() != 0 && (long)row_labels.size() == X.nr() && lda_dims != 0,
            "\t void compute_lda_transform()"
            << "\n\t Invalid inputs were given to this function."
            << "\n\t X.size():          " << X.size()
            << "\n\t row_labels.size(): " << row_labels.size()
            << "\n\t lda_dims:          " << lda_dims
            );


        mean = impl::center_matrix(X);
        // Do PCA to reduce dims
        matrix<T> pu,pw,pv;
        svd_fast(X, pu, pw, pv, lda_dims+extra_pca_dims, 4);
        pu.set_size(0,0); // free RAM, we don't need pu.
        X = X*pv;


        matrix<T> class_means(class_labels.size(), X.nc());
        class_means = 0;
        matrix<T,0,1> class_counts(class_labels.size());
        class_counts = 0;

        // First compute the means of each class
        for (unsigned long i = 0; i < row_labels.size(); ++i)
        {
            const unsigned long class_idx = class_labels[row_labels[i]];
            set_rowm(class_means,class_idx) += rowm(X,i);
            class_counts(class_idx)++;
        }
        class_means = inv(diagm(class_counts))*class_means;
        // subtract means from the data
        for (unsigned long i = 0; i < row_labels.size(); ++i)
        {
            const unsigned long class_idx = class_labels[row_labels[i]];
            set_rowm(X,i) -= rowm(class_means,class_idx);
        }

        // Note that we are using the formulas from the paper Using Discriminant
        // Eigenfeatures for Image Retrieval by Swets and Weng.
        matrix<T> Sw = trans(X)*X;
        matrix<T> Sb = trans(class_means)*class_means;
        matrix<T> A, H;
        matrix<T,0,1> W;
        svd3(Sw, A, W, H);
        W = sqrt(W);
        W = reciprocal(lowerbound(W,max(W)*1e-5));
        A = trans(H*diagm(W))*Sb*H*diagm(W);
        matrix<T> v,s,u;
        svd3(A, v, s, u);
        matrix<T> tform = H*diagm(W)*u;
        // pick out only the number of dimensions we are supposed to for the output, unless
        // we should just keep them all, then don't do anything. 
        if ((long)lda_dims <= tform.nc())
        {
            rsort_columns(tform, s);
            tform = colm(tform, range(0, lda_dims-1));
        }

        X = trans(pv*tform);
        mean = X*mean;
    }

// ----------------------------------------------------------------------------------------

    inline std::pair<double,double> equal_error_rate (
        const std::vector<double>& low_vals,
        const std::vector<double>& high_vals 
    )
    {
        std::vector<std::pair<double,int> > temp;
        temp.reserve(low_vals.size()+high_vals.size());
        for (unsigned long i = 0; i < low_vals.size(); ++i)
            temp.push_back(std::make_pair(low_vals[i], -1));
        for (unsigned long i = 0; i < high_vals.size(); ++i)
            temp.push_back(std::make_pair(high_vals[i], +1));

        std::sort(temp.begin(), temp.end());

        if (temp.size() == 0)
            return std::make_pair(0,0);

        double thresh = temp[0].first;

        unsigned long num_low_wrong = low_vals.size();
        unsigned long num_high_wrong = 0;
        double low_error = num_low_wrong/(double)low_vals.size();
        double high_error = num_high_wrong/(double)high_vals.size();
        for (unsigned long i = 0; i < temp.size() && high_error < low_error; ++i)
        {
            thresh = temp[i].first;
            if (temp[i].second > 0)
            {
                num_high_wrong++;
                high_error = num_high_wrong/(double)high_vals.size();
            }
            else
            {
                num_low_wrong--;
                low_error = num_low_wrong/(double)low_vals.size();
            }
        }

        return std::make_pair((low_error+high_error)/2, thresh);
    }

// ----------------------------------------------------------------------------------------

}

#endif // DLIB_LDA_Hh_

