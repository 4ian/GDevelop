// Copyright (C) 2012  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#ifndef DLIB_ORDERED_SAMPLE_PaIR_Hh_
#define DLIB_ORDERED_SAMPLE_PaIR_Hh_

#include "ordered_sample_pair_abstract.h"
#include <limits>
#include "../serialize.h"

namespace dlib
{

// ----------------------------------------------------------------------------------------

    class ordered_sample_pair 
    {
    public:
        ordered_sample_pair(
        ) : 
            _index1(0),
            _index2(0)
        {
            _distance = 1;
        }

        ordered_sample_pair (
            const unsigned long idx1,
            const unsigned long idx2
        )
        {
            _distance = 1;
            _index1 = idx1;
            _index2 = idx2;
        }

        ordered_sample_pair (
            const unsigned long idx1,
            const unsigned long idx2,
            const double dist
        )
        {
            _distance = dist;
            _index1 = idx1;
            _index2 = idx2;
        }

        const unsigned long& index1 (
        ) const { return _index1; }

        const unsigned long& index2 (
        ) const { return _index2; }

        const double& distance (
        ) const { return _distance; }

    private:
        unsigned long _index1;
        unsigned long _index2;
        double _distance;
    };

// ----------------------------------------------------------------------------------------

    inline bool operator == (
        const ordered_sample_pair& a,
        const ordered_sample_pair& b
    ) 
    {
        return a.index1() == b.index1() && a.index2() == b.index2();
    }

    inline bool operator != (
        const ordered_sample_pair& a,
        const ordered_sample_pair& b
    ) 
    {
        return !(a == b); 
    }

// ----------------------------------------------------------------------------------------

    inline void serialize (
        const ordered_sample_pair& item,
        std::ostream& out
    )
    {
        try
        {
            serialize(item.index1(),out);
            serialize(item.index2(),out);
            serialize(item.distance(),out);
        }
        catch (serialization_error& e)
        { 
            throw serialization_error(e.info + "\n   while serializing object of type ordered_sample_pair"); 
        }
    }

    inline void deserialize (
        ordered_sample_pair& item,
        std::istream& in 
    )
    {
        try
        {
            unsigned long idx1, idx2;
            double dist;

            deserialize(idx1,in);
            deserialize(idx2,in);
            deserialize(dist,in);
            item = ordered_sample_pair(idx1, idx2, dist);
        }
        catch (serialization_error& e)
        { 
            throw serialization_error(e.info + "\n   while deserializing object of type ordered_sample_pair"); 
        }
    }

// ----------------------------------------------------------------------------------------

}

#endif // DLIB_ORDERED_SAMPLE_PaIR_Hh_

