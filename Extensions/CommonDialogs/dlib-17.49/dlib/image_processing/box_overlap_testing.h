// Copyright (C) 2011  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#ifndef DLIB_BOX_OVERlAP_TESTING_H__
#define DLIB_BOX_OVERlAP_TESTING_H__

#include "box_overlap_testing_abstract.h"
#include "../geometry.h"
#include <vector>

namespace dlib
{

// ----------------------------------------------------------------------------------------

    class test_box_overlap
    {
    public:
        test_box_overlap (
        ) : match_thresh(0.5), overlap_thresh(0.5)
        {}

        test_box_overlap (
            double match_thresh_,
            double overlap_thresh_
        ) : match_thresh(match_thresh_), overlap_thresh(overlap_thresh_) 
        {
            // make sure requires clause is not broken
            DLIB_ASSERT(0 <= match_thresh && match_thresh <= 1  &&
                        0 <= overlap_thresh && overlap_thresh <= 1,
                "\t test_box_overlap::test_box_overlap(match_thresh, overlap_thresh)"
                << "\n\t Invalid inputs were given to this function "
                << "\n\t match_thresh:   " << match_thresh
                << "\n\t overlap_thresh: " << overlap_thresh
                << "\n\t this: " << this
                );

        }

        bool operator() (
            const dlib::rectangle& a,
            const dlib::rectangle& b
        ) const
        {
            const double inner = a.intersect(b).area();
            const double outer = (a+b).area();
            if (inner/outer > match_thresh || 
                inner/a.area() > overlap_thresh || 
                inner/b.area() > overlap_thresh)
                return true;
            else
                return false;
        }

        double get_overlap_thresh (
        ) const
        {
            return overlap_thresh;
        }

        double get_match_thresh (
        ) const
        {
            return match_thresh;
        }

    private:
        double match_thresh;
        double overlap_thresh;
    };

// ----------------------------------------------------------------------------------------

    inline void serialize (
        const test_box_overlap& item,
        std::ostream& out
    )
    {
        serialize(item.get_match_thresh(), out);
        serialize(item.get_overlap_thresh(), out);
    }

    inline void deserialize (
        test_box_overlap& item,
        std::istream& in 
    )
    {
        double overlap_thresh, match_thresh;
        deserialize(match_thresh, in);
        deserialize(overlap_thresh, in);
        item = test_box_overlap(match_thresh, overlap_thresh);
    }

// ----------------------------------------------------------------------------------------

    inline test_box_overlap find_tight_overlap_tester (
        const std::vector<std::vector<rectangle> >& rects
    )
    {
        double max_overlap = 0;
        double max_match_score = 0;
        for (unsigned long i = 0; i < rects.size(); ++i)
        {
            for (unsigned long j = 0; j < rects[i].size(); ++j)
            {
                for (unsigned long k = j+1; k < rects[i].size(); ++k)
                {
                    const rectangle a = rects[i][j];
                    const rectangle b = rects[i][k];
                    const double match_score = (a.intersect(b)).area()/(double)(a+b).area();
                    const double overlap_a   = (a.intersect(b)).area()/(double)(a).area();
                    const double overlap_b   = (a.intersect(b)).area()/(double)(b).area();

                    if (match_score > max_match_score)
                        max_match_score = match_score;

                    if (overlap_a > max_overlap)
                        max_overlap = overlap_a;
                    if (overlap_b > max_overlap)
                        max_overlap = overlap_b;
                }
            }
        }

        return test_box_overlap(max_match_score, max_overlap);
    }

// ----------------------------------------------------------------------------------------

}

#endif // DLIB_BOX_OVERlAP_TESTING_H__

