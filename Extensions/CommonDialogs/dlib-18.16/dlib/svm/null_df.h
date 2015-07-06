// Copyright (C) 2010  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#ifndef DLIB_NULL_DECISION_FUnCTION_Hh_
#define DLIB_NULL_DECISION_FUnCTION_Hh_

#include <iostream>

namespace dlib
{

// ----------------------------------------------------------------------------------------

    struct null_df
    {
        /*!
            WHAT THIS OBJECT REPRESENTS
                This is a type used to represent an unused field in the list of template 
                arguments of the one_vs_one_decision_function and one_vs_all_decision_function 
                templates.  As such, null_df doesn't actually do anything.
        !*/
        template <typename T>
        double operator() ( const T&) const { return 0; }
    };

    inline void serialize(const null_df&, std::ostream&) {}
    inline void deserialize(null_df&, std::istream&) {}

// ----------------------------------------------------------------------------------------

}

#endif // DLIB_NULL_DECISION_FUnCTION_Hh_

