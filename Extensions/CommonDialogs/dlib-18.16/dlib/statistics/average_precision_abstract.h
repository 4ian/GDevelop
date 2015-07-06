// Copyright (C) 2013  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#undef DLIB_AVERAGE_PREcISION_ABSTRACT_Hh_
#ifdef DLIB_AVERAGE_PREcISION_ABSTRACT_Hh_

#include <vector>

namespace dlib
{

// ----------------------------------------------------------------------------------------

    template <
        typename alloc
        >
    double average_precision (
        const std::vector<bool,alloc>& items,
        unsigned long missing_relevant_items = 0
    );
    /*!
        ensures
            - Interprets items as a list of relevant and non-relevant items in a response
              from an information retrieval system.  In particular, items with a true value
              are relevant and false items are non-relevant.  This function then returns
              the average precision of the ranking of the given items.  For, example, the
              ranking [true, true, true, true, false] would have an average precision of 1.
              On the other hand, the ranking of [true false false true] would have an
              average precision of 0.75 (because the first true has a precision of 1 and
              the second true has a precision of 0.5, giving an average of 0.75).
            - As a special case, if item contains no true elements then the average
              precision is considered to be 1.
            - Note that we use the interpolated precision.  That is, the interpolated
              precision at a recall value r is set to the maximum precision obtained at any
              higher recall value.  Or in other words, we interpolate the precision/recall
              curve so that precision is monotonically decreasing.  Therefore, the average
              precision value returned by this function is the area under this interpolated
              precision/recall curve.
            - This function will add in missing_relevant_items number of items with a
              precision of zero into the average value returned.  For example, the average
              precision of the ranking [true, true] if there are 2 missing relevant items
              is 0.5.
    !*/

// ----------------------------------------------------------------------------------------

    template <
        typename T, 
        typename alloc
        >
    double average_precision (
        const std::vector<std::pair<T,bool>,alloc>& items,
        unsigned long missing_relevant_items = 0
    );
    /*!
        ensures
            - this function is equivalent to copying the bool values from items into a
              std::vector<bool> and then calling the above average_precision() routine on
              it and returning the result. 
    !*/

// ----------------------------------------------------------------------------------------

}

#endif // DLIB_AVERAGE_PREcISION_ABSTRACT_Hh_


