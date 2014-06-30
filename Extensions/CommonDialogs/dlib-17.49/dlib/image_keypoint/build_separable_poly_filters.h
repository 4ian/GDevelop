// Copyright (C) 2011  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#ifndef DLIB_BUILD_SEPARABLE_PoLY_FILTERS_H__
#define DLIB_BUILD_SEPARABLE_PoLY_FILTERS_H__

#include "../matrix.h"
#include "surf.h"
#include "../uintn.h"
#include <vector>

namespace dlib
{

// ----------------------------------------------------------------------------------------

    typedef std::pair<matrix<double,0,1>, matrix<double,0,1> > separable_filter_type;
    typedef std::pair<matrix<int32,0,1>, matrix<int32,0,1> > separable_int32_filter_type;

// ----------------------------------------------------------------------------------------

    inline std::vector<std::vector<separable_filter_type> > build_separable_poly_filters (
        const long order,
        const long window_size
    ) 
    /*!
        requires
            - 1 <= order <= 6
            - window_size >= 3 && window_size is odd
        ensures
            - the "first" element is the row_filter, the second is the col_filter.
            - Some filters are not totally separable and that's why they are grouped
              into vectors of vectors.  The groups are all the parts of a partially
              separable filter.
    !*/
    {
        long num_filters = 6;
        switch (order)
        {
            case 1: num_filters = 3; break;
            case 2: num_filters = 6; break;
            case 3: num_filters = 10; break;
            case 4: num_filters = 15; break;
            case 5: num_filters = 21; break;
            case 6: num_filters = 28; break;
        }

        matrix<double> X(window_size*window_size,num_filters);
        matrix<double,0,1> G(window_size*window_size,1);
        const double sigma = window_size/4.0;


        long cnt = 0;
        for (double x = -window_size/2; x <= window_size/2; ++x)
        {
            for (double y = -window_size/2; y <= window_size/2; ++y)
            {
                X(cnt, 0) = 1;
                X(cnt, 1) = x;
                X(cnt, 2) = y;

                if (X.nc() > 5)
                {
                    X(cnt, 3) = x*x;
                    X(cnt, 4) = x*y;
                    X(cnt, 5) = y*y;
                }
                if (X.nc() > 9)
                {
                    X(cnt, 6) = x*x*x;
                    X(cnt, 7) = y*x*x;
                    X(cnt, 8) = y*y*x;
                    X(cnt, 9) = y*y*y;
                }
                if (X.nc() > 14)
                {
                    X(cnt, 10) = x*x*x*x;
                    X(cnt, 11) = y*x*x*x;
                    X(cnt, 12) = y*y*x*x;
                    X(cnt, 13) = y*y*y*x;
                    X(cnt, 14) = y*y*y*y;
                }
                if (X.nc() > 20)
                {
                    X(cnt, 15) = x*x*x*x*x;
                    X(cnt, 16) = y*x*x*x*x;
                    X(cnt, 17) = y*y*x*x*x;
                    X(cnt, 18) = y*y*y*x*x;
                    X(cnt, 19) = y*y*y*y*x;
                    X(cnt, 20) = y*y*y*y*y;
                }
                if (X.nc() > 27)
                {
                    X(cnt, 21) = x*x*x*x*x*x;
                    X(cnt, 22) = y*x*x*x*x*x;
                    X(cnt, 23) = y*y*x*x*x*x;
                    X(cnt, 24) = y*y*y*x*x*x;
                    X(cnt, 25) = y*y*y*y*x*x;
                    X(cnt, 26) = y*y*y*y*y*x;
                    X(cnt, 27) = y*y*y*y*y*y;
                }

                G(cnt) = std::sqrt(gaussian(x,y,sigma));
                ++cnt;
            }
        }
         
        X = diagm(G)*X;

        const matrix<double> S = inv(trans(X)*X)*trans(X)*diagm(G);

        matrix<double,0,1> row_filter, col_filter;

        matrix<double> u,v, temp;
        matrix<double,0,1> w;

        std::vector<std::vector<separable_filter_type> > results(num_filters);

        for (long r = 0; r < S.nr(); ++r)
        {
            temp = reshape(rowm(S,r), window_size, window_size);
            svd3(temp,u,w,v);
            const double thresh = max(w)*1e-8;
            for (long i = 0; i < w.size(); ++i)
            {
                if (w(i) > thresh)
                {
                    col_filter = std::sqrt(w(i))*colm(u,i);
                    row_filter = std::sqrt(w(i))*colm(v,i);
                    results[r].push_back(std::make_pair(row_filter, col_filter));
                }
            }
        }

        return results;
    }

// ----------------------------------------------------------------------------------------

    inline std::vector<std::vector<separable_int32_filter_type> > build_separable_int32_poly_filters (
        const long order,
        const long window_size,
        const double max_range = 300.0
    ) 
    /*!
        requires
            - 1 <= order <= 6
            - window_size >= 3 && window_size is odd
            - max_range > 1
        ensures
            - the "first" element is the row_filter, the second is the col_filter.
    !*/
    {
        const std::vector<std::vector<separable_filter_type> >& filters = build_separable_poly_filters(order, window_size);
        std::vector<std::vector<separable_int32_filter_type> > int_filters(filters.size());

        for (unsigned long i = 0; i < filters.size(); ++i)
        {

            double max_val = 0;
            for (unsigned long j = 0; j < filters[i].size(); ++j)
            {
                const separable_filter_type& filt = filters[i][j];
                max_val = std::max(max_val, max(abs(filt.first)));
                max_val = std::max(max_val, max(abs(filt.second)));
            }
            if (max_val == 0)
                max_val = 1;

            int_filters[i].resize(filters[i].size());
            for (unsigned long j = 0; j < filters[i].size(); ++j)
            {
                const separable_filter_type& filt = filters[i][j];
                int_filters[i][j].first  = matrix_cast<int32>(round(filt.first*max_range/max_val));
                int_filters[i][j].second = matrix_cast<int32>(round(filt.second*max_range/max_val));
            }
        }

        return int_filters;
    }

}

// ----------------------------------------------------------------------------------------

#endif // DLIB_BUILD_SEPARABLE_PoLY_FILTERS_H__

