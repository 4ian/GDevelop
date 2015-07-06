// Copyright (C) 2012  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#undef DLIB_ORDERED_SAMPLE_PaIR_ABSTRACT_Hh_
#ifdef DLIB_ORDERED_SAMPLE_PaIR_ABSTRACT_Hh_

#include <limits>
#include "../serialize.h"

namespace dlib
{

// ----------------------------------------------------------------------------------------

    class ordered_sample_pair 
    {
        /*!
            WHAT THIS OBJECT REPRESENTS
                This object is intended to represent an edge in a directed graph which has
                data samples at its vertices.  So it contains two integers (index1 and
                index2) which represent the identifying indices of the samples at the ends
                of an edge.  

                This object also contains a double which can be used for any purpose.
        !*/

    public:
        ordered_sample_pair(
        );
        /*!
            ensures
                - #index1() == 0
                - #index2() == 0
                - #distance() == 1 
        !*/

        ordered_sample_pair (
            const unsigned long idx1,
            const unsigned long idx2
        );
        /*!
            ensures
                - #index1() == idx1
                - #index2() == idx2
                - #distance() == 1 
        !*/

        ordered_sample_pair (
            const unsigned long idx1,
            const unsigned long idx2,
            const double dist
        );
        /*!
            ensures
                - #index1() == idx1
                - #index2() == idx2
                - #distance() == dist
        !*/

        const unsigned long& index1 (
        ) const; 
        /*!
            ensures
                - returns the first index value stored in this object 
        !*/

        const unsigned long& index2 (
        ) const; 
        /*!
            ensures
                - returns the second index value stored in this object 
        !*/

        const double& distance (
        ) const;
        /*!
            ensures
                - returns the floating point number stored in this object
        !*/

    };

// ----------------------------------------------------------------------------------------

    inline bool operator == (
        const ordered_sample_pair& a,
        const ordered_sample_pair& b
    );
    /*!
        ensures
            - returns a.index1() == b.index1() && a.index2() == b.index2();
              I.e. returns true if a and b both represent the same pair and false otherwise.  
              Note that the distance field is not involved in this comparison.
    !*/

    inline bool operator != (
        const ordered_sample_pair& a,
        const ordered_sample_pair& b
    );
    /*!
        ensures
            - returns !(a == b)
    !*/

// ----------------------------------------------------------------------------------------

    inline void serialize (
        const ordered_sample_pair& item,
        std::ostream& out
    );
    /*!
        provides serialization support 
    !*/

    inline void deserialize (
        ordered_sample_pair& item,
        std::istream& in 
    );
    /*!
        provides deserialization support 
    !*/

// ----------------------------------------------------------------------------------------

}

#endif // DLIB_ORDERED_SAMPLE_PaIR_ABSTRACT_Hh_


