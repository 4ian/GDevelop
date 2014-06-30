// Copyright (C) 2010  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#undef DLIB_MULTICLASS_TOoLS_ABSTRACT_H__
#ifdef DLIB_MULTICLASS_TOoLS_ABSTRACT_H__

#include <vector>
#include <map>
#include "../unordered_pair.h"

namespace dlib
{

// ----------------------------------------------------------------------------------------

    template <typename label_type>
    std::vector<label_type> select_all_distinct_labels (
        const std::vector<label_type>& labels
    );
    /*!
        ensures
            - Determines all distinct values present in labels and stores them
              into a sorted vector and returns it.  They are sorted in ascending 
              order.
    !*/

// ----------------------------------------------------------------------------------------

    template <typename label_type, typename U>
    std::vector<unordered_pair<label_type> > find_missing_pairs (
        const std::map<unordered_pair<label_type>,U>& binary_decision_functions 
    );
    /*!
        ensures
            - Let L denote the set of all label_type values present in binary_decision_functions.
            - This function finds all the label pairs with both elements distinct and in L but
              not also in binary_decision_functions.  All these missing pairs are stored
              in a sorted vector and returned.  They are sorted in ascending order.
    !*/

// ----------------------------------------------------------------------------------------

}

#endif // DLIB_MULTICLASS_TOoLS_ABSTRACT_H__

