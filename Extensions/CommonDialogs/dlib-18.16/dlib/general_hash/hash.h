// Copyright (C) 2011  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#ifndef DLIB_HAsH_Hh_ 
#define DLIB_HAsH_Hh_ 

#include "hash_abstract.h"
#include <vector>
#include <string>
#include <map>
#include "murmur_hash3.h"
#include "../algs.h"

namespace dlib
{

// ----------------------------------------------------------------------------------------

    inline uint32 hash (
        const std::string& item,
        uint32 seed = 0
    )
    {
        if (item.size() == 0)
            return 0;
        else
            return murmur_hash3(&item[0], sizeof(item[0])*item.size(), seed);
    }

// ----------------------------------------------------------------------------------------

    inline uint32 hash (
        const std::wstring& item,
        uint32 seed = 0
    )
    {
        if (item.size() == 0)
            return 0;
        else
            return murmur_hash3(&item[0], sizeof(item[0])*item.size(), seed);
    }

// ----------------------------------------------------------------------------------------

    template <typename T, typename alloc>
    uint32 hash (
        const std::vector<T,alloc>& item,
        uint32 seed = 0
    )
    {
        DLIB_ASSERT_HAS_STANDARD_LAYOUT(T);

        if (item.size() == 0)
            return 0;
        else
            return murmur_hash3(&item[0], sizeof(T)*item.size(), seed);
    }

// ----------------------------------------------------------------------------------------

    template <typename T, typename U, typename alloc>
    uint32 hash (
        const std::vector<std::pair<T,U>,alloc>& item,
        uint32 seed = 0
    )
    {
        DLIB_ASSERT_HAS_STANDARD_LAYOUT(T);
        DLIB_ASSERT_HAS_STANDARD_LAYOUT(U);

        if (item.size() == 0)
            return 0;
        else
            return murmur_hash3(&item[0], sizeof(item[0])*item.size(), seed);
    }

// ----------------------------------------------------------------------------------------

    template <typename T, typename U, typename comp, typename alloc>
    uint32 hash (
        const std::map<T,U,comp,alloc>& item,
        uint32 seed = 0
    )
    {
        return hash(std::vector<std::pair<T,U> >(item.begin(), item.end()), seed);
    }

// ----------------------------------------------------------------------------------------

    inline uint32 hash (
        uint32 val,
        uint32 seed = 0
    )
    {
        return murmur_hash3_2(val,seed);
    }

// ----------------------------------------------------------------------------------------

    inline uint32 hash (
        uint64 val,
        uint32 seed = 0
    )
    {
        return static_cast<uint32>(murmur_hash3_128bit_3(val,seed,0).first);
    }

// ----------------------------------------------------------------------------------------

    inline uint32 hash (
        const std::pair<uint64,uint64>& item,
        uint32 seed = 0
    )
    {
        return static_cast<uint32>(murmur_hash3_128bit_3(item.first,item.second,seed).first);
    }

// ----------------------------------------------------------------------------------------

    inline uint32 hash (
        const std::pair<uint32,uint32>& item,
        uint32 seed = 0
    )
    {
        return murmur_hash3_3(item.first,item.second,seed);
    }

// ----------------------------------------------------------------------------------------

    template <typename T, typename U>
    uint32 hash (
        const std::pair<T,U>& item,
        uint32 seed = 0
    )
    {
        return hash(item.first, seed) ^ hash(item.second, seed+1); 
    }

// ----------------------------------------------------------------------------------------

}

#endif // DLIB_HAsH_Hh_

