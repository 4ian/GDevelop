// Copyright (C) 2011  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#undef DLIB_MAX_SUM_SUBMaTRIX_ABSTRACT_H__
#ifdef DLIB_MAX_SUM_SUBMaTRIX_ABSTRACT_H__

#include "../matrix.h"
#include <vector>
#include "../geometry.h"

namespace dlib
{

// ----------------------------------------------------------------------------------------

    template <
        typename EXP
        >
    std::vector<rectangle> max_sum_submatrix(
        const matrix_exp<EXP>& mat,
        unsigned long max_rects,
        double thresh = 0
    );
    /*!
        requires
            - thresh >= 0
            - mat.size() != 0
        ensures
            - This function finds the submatrix within mat which has the largest sum.  It then
              zeros out that submatrix and repeats the process until no more maximal submatrices can 
              be found.  The std::vector returned will be ordered so that the rectangles with the
              largest sum come first. 
            - Each submatrix must have a sum greater than thresh.  If no such submatrix exists then
              the algorithm terminates and returns an empty std::vector.  
            - At most max_rects rectangles are returned. 

            - This function is basically an implementation of the efficient subwindow search (I-ESS)
              algorithm presented in the following paper: 
                Efficient Algorithms for Subwindow Search in Object Detection and Localization
                by Senjian An, Patrick Peursum, Wanquan Liu and Svetha Venkatesh
                In CVPR 2009
    !*/

// ----------------------------------------------------------------------------------------

}

#endif // DLIB_MAX_SUM_SUBMaTRIX_ABSTRACT_H__


