// Copyright (C) 2010  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#ifndef DLIB_MULTICLASS_TOoLS_Hh_
#define DLIB_MULTICLASS_TOoLS_Hh_

#include "multiclass_tools_abstract.h"

#include <vector>
#include <set>
#include "../unordered_pair.h"

namespace dlib
{

// ----------------------------------------------------------------------------------------

    template <typename label_type>
    std::vector<label_type> select_all_distinct_labels (
        const std::vector<label_type>& labels
    )
    {
        std::set<label_type> temp;
        temp.insert(labels.begin(), labels.end());
        return std::vector<label_type>(temp.begin(), temp.end());
    }

// ----------------------------------------------------------------------------------------

    template <typename label_type, typename U>
    std::vector<unordered_pair<label_type> > find_missing_pairs (
        const std::map<unordered_pair<label_type>,U>& bdfs 
    )
    {
        typedef std::map<unordered_pair<label_type>,U> map_type;

        // find all the labels
        std::set<label_type> temp;
        for (typename map_type::const_iterator i = bdfs.begin(); i != bdfs.end(); ++i)
        {
            temp.insert(i->first.first);
            temp.insert(i->first.second);
        }

        std::vector<unordered_pair<label_type> > missing_pairs;

        // now make sure all label pairs are present
        typename std::set<label_type>::const_iterator i, j;
        for (i = temp.begin(); i != temp.end(); ++i)
        {
            for (j = i, ++j; j != temp.end(); ++j)
            {
                const unordered_pair<label_type> p(*i, *j);

                if (bdfs.count(p) == 0)
                    missing_pairs.push_back(p);
            }
        }

        return missing_pairs;
    }

// ----------------------------------------------------------------------------------------

}

#endif // DLIB_MULTICLASS_TOoLS_Hh_


