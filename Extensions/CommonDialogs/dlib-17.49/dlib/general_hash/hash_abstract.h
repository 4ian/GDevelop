// Copyright (C) 2011  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#undef DLIB_HAsH_ABSTRACT_H__
#ifdef DLIB_HAsH_ABSTRACT_H__ 

#include "murmur_hash3_abstract.h"
#include <vector>
#include <string>
#include <map>

namespace dlib
{

// ----------------------------------------------------------------------------------------

    uint32 hash (
        const std::string& item,
        uint32 seed = 0
    );
    /*!
        ensures
            - returns a 32bit hash of the data stored in item.  
            - Each value of seed results in a different hash function being used.  
              (e.g. hash(item,0) should generally not be equal to hash(item,1))
            - uses the murmur_hash3() routine to compute the actual hash.
            - This routine will always give the same hash value when presented
              with the same input string.
    !*/

// ----------------------------------------------------------------------------------------

    uint32 hash (
        const std::wstring& item,
        uint32 seed = 0
    );
    /*!
        ensures
            - returns a 32bit hash of the data stored in item.  
            - Each value of seed results in a different hash function being used.  
              (e.g. hash(item,0) should generally not be equal to hash(item,1))
            - uses the murmur_hash3() routine to compute the actual hash.
            - Note that if the memory layout of the elements in item change between
              hardware platforms then hash() will give different outputs.  If you want
              hash() to always give the same output for the same input then you must 
              ensure that elements of item always have the same layout in memory.
              Typically this means using fixed width types and performing byte swapping
              to account for endianness before passing item to hash().
    !*/

// ----------------------------------------------------------------------------------------

    template <typename T, typename alloc>
    uint32 hash (
        const std::vector<T,alloc>& item,
        uint32 seed = 0
    );
    /*!
        requires
            - T is a standard layout type (e.g. a POD type like int, float, 
              or a simple struct).
        ensures
            - returns a 32bit hash of the data stored in item.  
            - Each value of seed results in a different hash function being used.  
              (e.g. hash(item,0) should generally not be equal to hash(item,1))
            - uses the murmur_hash3() routine to compute the actual hash.
            - Note that if the memory layout of the elements in item change between
              hardware platforms then hash() will give different outputs.  If you want
              hash() to always give the same output for the same input then you must 
              ensure that elements of item always have the same layout in memory.
              Typically this means using fixed width types and performing byte swapping
              to account for endianness before passing item to hash().
    !*/

// ----------------------------------------------------------------------------------------

    template <typename T, typename U, typename alloc>
    uint32 hash (
        const std::vector<std::pair<T,U>,alloc>& item,
        uint32 seed = 0
    );
    /*!
        requires
            - T and U are standard layout types (e.g. POD types like int, float, 
              or simple structs).
        ensures
            - returns a 32bit hash of the data stored in item.  
            - Each value of seed results in a different hash function being used.  
              (e.g. hash(item,0) should generally not be equal to hash(item,1))
            - uses the murmur_hash3() routine to compute the actual hash.
            - Note that if the memory layout of the elements in item change between
              hardware platforms then hash() will give different outputs.  If you want
              hash() to always give the same output for the same input then you must 
              ensure that elements of item always have the same layout in memory.
              Typically this means using fixed width types and performing byte swapping
              to account for endianness before passing item to hash().
    !*/

// ----------------------------------------------------------------------------------------

    template <typename T, typename U, typename comp, typename alloc>
    uint32 hash (
        const std::map<T,U,comp,alloc>& item,
        uint32 seed = 0
    );
    /*!
        requires
            - T and U are standard layout types (e.g. POD types like int, float, 
              or simple structs).
        ensures
            - returns a 32bit hash of the data stored in item.  
            - Each value of seed results in a different hash function being used.  
              (e.g. hash(item,0) should generally not be equal to hash(item,1))
            - uses the murmur_hash3() routine to compute the actual hash.
            - Note that if the memory layout of the elements in item change between
              hardware platforms then hash() will give different outputs.  If you want
              hash() to always give the same output for the same input then you must 
              ensure that elements of item always have the same layout in memory.
              Typically this means using fixed width types and performing byte swapping
              to account for endianness before passing item to hash().  However, since
              you can't modify the keys in a map you may have to copy it into a 
              std::vector and then work from there.
    !*/

// ----------------------------------------------------------------------------------------

}

#endif // DLIB_HAsH_ABSTRACT_H__


