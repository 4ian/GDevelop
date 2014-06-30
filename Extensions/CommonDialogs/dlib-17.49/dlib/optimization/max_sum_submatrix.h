// Copyright (C) 2011  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#ifndef DLIB_MAX_SUM_SUBMaTRIX_H__
#define DLIB_MAX_SUM_SUBMaTRIX_H__

#include "max_sum_submatrix_abstract.h"
#include "../matrix.h"
#include <vector>
#include <queue>
#include "../geometry.h"

namespace dlib
{
    namespace impl
    {

    // ------------------------------------------------------------------------------------

        template <typename T>
        struct range_set
        {
            int top_min;
            int top_max;
            int bottom_min;
            int bottom_max;
            T weight;

            bool operator<(const range_set& item) const { return weight < item.weight; }
        };

    // ------------------------------------------------------------------------------------

        template <typename T>
        bool is_terminal_set (
            const range_set<T>& item
        )
        {
            return (item.top_min  >= item.top_max &&
                    item.bottom_min >= item.bottom_max);
        }

    // ------------------------------------------------------------------------------------

        template <typename T>
        void split (
            const range_set<T>& rset,
            range_set<T>& a,
            range_set<T>& b
        )
        {
            if (rset.top_max - rset.top_min > rset.bottom_max - rset.bottom_min)
            {
                // split top
                const int middle = (rset.top_max + rset.top_min)/2;
                a.top_min = rset.top_min;
                a.top_max = middle;
                b.top_min = middle+1;
                b.top_max = rset.top_max;

                a.bottom_min = rset.bottom_min;
                a.bottom_max = rset.bottom_max;
                b.bottom_min = rset.bottom_min;
                b.bottom_max = rset.bottom_max;
            }
            else
            {
                // split bottom
                const int middle = (rset.bottom_max + rset.bottom_min)/2;
                a.bottom_min = rset.bottom_min;
                a.bottom_max = middle;
                b.bottom_min = middle+1;
                b.bottom_max = rset.bottom_max;

                a.top_min = rset.top_min;
                a.top_max = rset.top_max;
                b.top_min = rset.top_min;
                b.top_max = rset.top_max;
            }
        }

    // ------------------------------------------------------------------------------------

        template <typename EXP, typename T>
        void find_best_column_range (
            const matrix_exp<EXP>& sum_pos,
            const matrix_exp<EXP>& sum_neg,
            const range_set<T>& row_range,
            T& weight,
            int& left,
            int& right
        )
        {
            left = 0;
            right = -1;
            weight = 0;
            T cur_sum = 0;
            int cur_pos = 0;
            for (long c = 0; c < sum_pos.nc(); ++c)
            {
                // compute the value for the current column
                T temp = sum_pos(row_range.bottom_max+1,c) - sum_pos(row_range.top_min,c);
                if (row_range.top_max <= row_range.bottom_min)
                    temp += sum_neg(row_range.bottom_min+1,c) - sum_neg(row_range.top_max,c);


                cur_sum += temp;
                if (cur_sum > weight)
                {
                    left = cur_pos;
                    right = c;
                    weight = cur_sum;
                }

                if (cur_sum <= 0)
                {
                    cur_sum = 0;
                    cur_pos = c+1;
                }

            }
        }
    }

// ----------------------------------------------------------------------------------------

    template <typename EXP>
    std::vector<rectangle> max_sum_submatrix(
        const matrix_exp<EXP>& mat,
        unsigned long max_rects,
        double thresh_ = 0
    )
    {
        // make sure requires clause is not broken
        DLIB_ASSERT(thresh_ >= 0 && mat.size() > 0,
            "\t std::vector<rectangle> max_sum_submatrix()"
            << "\n\t Invalid arguments were given to this function."
            << "\n\t mat.size(): " << mat.size()
            << "\n\t thresh_:    " << thresh_
            );

        /*
            This function is basically an implementation of the efficient subwindow search (I-ESS)
            algorithm presented in the following paper: 
                Efficient Algorithms for Subwindow Search in Object Detection and Localization
                by Senjian An, Patrick Peursum, Wanquan Liu and Svetha Venkatesh
                In CVPR 2009

        */


        if (max_rects == 0)
            return std::vector<rectangle>();

        using namespace dlib::impl;
        typedef typename EXP::type element_type;
        typedef typename promote<element_type>::type scalar_type;

        const scalar_type thresh = static_cast<scalar_type>(thresh_);


        matrix<scalar_type> sum_pos;
        matrix<scalar_type> sum_neg;
        sum_pos.set_size(mat.nr()+1, mat.nc());
        sum_neg.set_size(mat.nr()+1, mat.nc());
        // integrate over the rows.  
        for (long c = 0; c < mat.nc(); ++c)
        {
            sum_pos(0,c) = 0;
            sum_neg(0,c) = 0;
        }
        for (long r = 0; r < mat.nr(); ++r)
        {
            for (long c = 0; c < mat.nc(); ++c)
            {
                if (mat(r,c) > 0)
                {
                    sum_pos(r+1,c) = mat(r,c) + sum_pos(r,c);
                    sum_neg(r+1,c) = sum_neg(r,c);
                }
                else
                {
                    sum_pos(r+1,c) = sum_pos(r,c);
                    sum_neg(r+1,c) = mat(r,c) + sum_neg(r,c);
                }
            }
        }

        std::priority_queue<range_set<scalar_type> > q;

        // the range_sets will represent ranges of columns 
        range_set<scalar_type> universe_set;
        universe_set.bottom_min = 0;
        universe_set.top_min = 0;
        universe_set.bottom_max = mat.nr()-1;
        universe_set.top_max = mat.nr()-1;
        universe_set.weight = sum(rowm(array_to_matrix(sum_pos),mat.nr()));

        q.push(universe_set);

        std::vector<rectangle> results;
        std::vector<scalar_type> temp_pos(mat.nc());
        std::vector<scalar_type> temp_neg(mat.nc());

        while (q.size() > 0)
        {
            if (is_terminal_set(q.top()))
            {
                int left, right;
                scalar_type weight;
                find_best_column_range(sum_pos, sum_neg, q.top(), weight, left, right);

                rectangle rect(left, q.top().top_min, 
                               right, q.top().bottom_min);

                if (weight <= thresh)
                    break;

                results.push_back(rect);

                if (results.size() >= max_rects)
                    break;

                q = std::priority_queue<range_set<scalar_type> >();
                // We are going to blank out the weights we just used.  So adjust the sum images appropriately.
                for (long c = rect.left(); c <= rect.right(); ++c)
                {
                    temp_pos[c] = sum_pos(rect.bottom()+1,c) - sum_pos(rect.top(),c);
                    temp_neg[c] = sum_neg(rect.bottom()+1,c) - sum_neg(rect.top(),c);
                }
                // blank out the area inside the rectangle
                for (long r = rect.top(); r <= rect.bottom(); ++r)
                {
                    for (long c = rect.left(); c <= rect.right(); ++c)
                    {
                        sum_pos(r+1,c) = sum_pos(r,c);
                        sum_neg(r+1,c) = sum_neg(r,c);
                    }
                }
                // account for the area below the rectangle
                for (long r = rect.bottom()+2; r < sum_pos.nr(); ++r)
                {
                    for (long c = rect.left(); c <= rect.right(); ++c)
                    {
                        sum_pos(r,c) -= temp_pos[c];
                        sum_neg(r,c) -= temp_neg[c];
                    }
                }


                universe_set.weight = sum(rowm(array_to_matrix(sum_pos),mat.nr()));
                if (universe_set.weight <= thresh)
                    break;

                q.push(universe_set);
                continue;
            }

            range_set<scalar_type> a, b;
            split(q.top(), a,b);
            q.pop();

            // these variables are not used at this point in the algorithm.
            int a_left, a_right;
            int b_left, b_right;

            find_best_column_range(sum_pos, sum_neg, a, a.weight, a_left, a_right);
            find_best_column_range(sum_pos, sum_neg, b, b.weight, b_left, b_right);

            if (a.weight > thresh)
                q.push(a);
            if (b.weight > thresh)
                q.push(b);

        }


        return results;
    }

// ----------------------------------------------------------------------------------------

}

#endif // DLIB_MAX_SUM_SUBMaTRIX_H__

