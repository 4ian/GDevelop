// Copyright (C) 2011  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#undef DLIB_MURMUR_HAsH_3_ABSTRACT_Hh_ 
#ifdef DLIB_MURMUR_HAsH_3_ABSTRACT_Hh_ 

#include "../uintn.h"
#include <utility>

namespace dlib
{

// ----------------------------------------------------------------------------------------

    uint32 murmur_hash3 ( 
        const void* key, 
        const int len, 
        const uint32 seed = 0
    );
    /*!
        requires
            - key == a pointer to a block of memory len bytes long
        ensures
            - returns a 32bit hash of the len bytes pointed to by key.  
            - Each value of seed results in a different hash function being used.  
              (e.g. murmur_hash3(key,len,0) should generally not be equal to murmur_hash3(key,len,1))
            - This function is machine architecture agnostic and should always give the same
              hash value when presented with the same inputs.
            - This hashing algorithm is Austin Appleby's excellent MurmurHash3_x86_32.  
              See: http://code.google.com/p/smhasher/
    !*/

// ----------------------------------------------------------------------------------------

    inline uint32 murmur_hash3_2 ( 
        const uint32 v1,
        const uint32 v2 
    );
    /*!
        ensures
            - returns a 32bit hash of the two integers given to this function.  
            - This function is machine architecture agnostic and should always give the same
              hash value when presented with the same inputs.
            - This hashing algorithm is Austin Appleby's excellent MurmurHash3_x86_32.  
              See: http://code.google.com/p/smhasher/
    !*/

// ----------------------------------------------------------------------------------------

    inline uint32 murmur_hash3_3 ( 
        const uint32 v1,
        const uint32 v2,
        const uint32 v3 
    );
    /*!
        ensures
            - returns a 32bit hash of the three integers given to this function.  
            - This function is machine architecture agnostic and should always give the same
              hash value when presented with the same inputs.
            - This hashing algorithm is Austin Appleby's excellent MurmurHash3_x86_32.  
              See: http://code.google.com/p/smhasher/
    !*/

// ----------------------------------------------------------------------------------------

    std::pair<uint64,uint64> murmur_hash3_128bit ( 
        const void* key, 
        const int len,
        const uint32 seed = 0
    );
    /*!
        requires
            - key == a pointer to a block of memory len bytes long
        ensures
            - returns a 128bit hash (as two 64bit numbers) of the len bytes pointed to by key.  
            - Each value of seed results in a different hash function being used.  
              (e.g. murmur_hash3_128bit(key,len,0) should generally not be equal to 
              murmur_hash3_128bit(key,len,1))
            - This function is machine architecture agnostic and should always give the same
              hash value when presented with the same inputs.
            - This hashing algorithm is Austin Appleby's excellent MurmurHash3_x64_128.  
              See: http://code.google.com/p/smhasher/
    !*/

// ----------------------------------------------------------------------------------------

    std::pair<uint64,uint64> murmur_hash3_128bit ( 
        const uint32& v1, 
        const uint32& v2, 
        const uint32& v3, 
        const uint32& v4 
    );
    /*!
        ensures
            - returns a 128bit hash (as two 64bit numbers) of the 4 integers given to this
              function. 
            - This function is machine architecture agnostic and should always give the
              same hash value when presented with the same inputs.
            - This hashing algorithm is Austin Appleby's excellent MurmurHash3_x64_128.  
              See: http://code.google.com/p/smhasher/
    !*/

// ----------------------------------------------------------------------------------------

    std::pair<uint64,uint64> murmur_hash3_128bit_3 ( 
        uint64 k1, 
        uint64 k2,
        uint64 k3 
    );
    /*!
        ensures
            - returns a 128bit hash (as two 64bit numbers) of the 3 integers given to this
              function. 
            - This function is machine architecture agnostic and should always give the
              same hash value when presented with the same inputs.
            - This hashing algorithm is Austin Appleby's excellent MurmurHash3_x64_128.  
              See: http://code.google.com/p/smhasher/
    !*/

// ----------------------------------------------------------------------------------------

}

#endif // DLIB_MURMUR_HAsH_3_ABSTRACT_Hh_


