// Copyright (C) 2011  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#ifndef DLIB_MURMUR_HAsH_3_Hh_ 
#define DLIB_MURMUR_HAsH_3_Hh_ 

#include "murmur_hash3_abstract.h"
#include "../uintn.h"
#include <utility>
#include <string.h>

namespace dlib
{
    //-----------------------------------------------------------------------------
    // The original MurmurHash3 code was written by Austin Appleby, and is placed 
    // in the public domain. The author hereby disclaims copyright to this source code.
    // The code in this particular file was modified by Davis E. King.  In
    // particular, endian-swapping was added along with some other minor code
    // changes like avoiding strict aliasing violations.


    //-----------------------------------------------------------------------------
    // Platform-specific functions and macros

    // Microsoft Visual Studio

#if defined(_MSC_VER)

#define DLIB_FORCE_INLINE	__forceinline

#include <stdlib.h>

#define DLIB_ROTL32(x,y)	_rotl(x,y)
#define DLIB_ROTL64(x,y)	_rotl64(x,y)

#define DLIB_BIG_CONSTANT(x) (x)

    // Other compilers

#else	// defined(_MSC_VER)

#define	DLIB_FORCE_INLINE __attribute__((always_inline)) inline 

    inline uint32 murmur_rotl32 ( uint32 x, int8 r )
    {
        return (x << r) | (x >> (32 - r));
    }

    inline uint64 murmur_rotl64 ( uint64 x, int8 r )
    {
        return (x << r) | (x >> (64 - r));
    }

#define	DLIB_ROTL32(x,y)	dlib::murmur_rotl32(x,y)
#define DLIB_ROTL64(x,y)	dlib::murmur_rotl64(x,y)

#define DLIB_BIG_CONSTANT(x) (x##LLU)

#endif // !defined(_MSC_VER)

// ----------------------------------------------------------------------------------------
    // Block read - if your platform needs to do endian-swapping or can only
    // handle aligned reads, do the conversion here

    DLIB_FORCE_INLINE uint32 murmur_getblock ( const uint32 * p, int i )
    {
        // The reason we do a memcpy() here instead of simply returning p[i] is because
        // doing it this way avoids violations of the strict aliasing rule when all these
        // functions are inlined into the user's code.
        uint32 temp;
        memcpy(&temp, p+i, 4);
        return temp;
    }

    DLIB_FORCE_INLINE uint32 murmur_getblock_byte_swap ( const uint32 * p, int i )
    {
        union 
        {
            uint8 bytes[4];
            uint32 val;
        } temp;

        const uint8* pp = reinterpret_cast<const uint8*>(p + i);
        temp.bytes[0] = pp[3];
        temp.bytes[1] = pp[2];
        temp.bytes[2] = pp[1];
        temp.bytes[3] = pp[0];

        return temp.val;
    }

    DLIB_FORCE_INLINE uint64 murmur_getblock ( const uint64 * p, int i )
    {
        // The reason we do a memcpy() here instead of simply returning p[i] is because
        // doing it this way avoids violations of the strict aliasing rule when all these
        // functions are inlined into the user's code.
        uint64 temp;
        memcpy(&temp, p+i, 8);
        return temp;
    }

    DLIB_FORCE_INLINE uint64 murmur_getblock_byte_swap ( const uint64 * p, int i )
    {
        union 
        {
            uint8 bytes[8];
            uint64 val;
        } temp;

        const uint8* pp = reinterpret_cast<const uint8*>(p + i);
        temp.bytes[0] = pp[7];
        temp.bytes[1] = pp[6];
        temp.bytes[2] = pp[5];
        temp.bytes[3] = pp[4];
        temp.bytes[4] = pp[3];
        temp.bytes[5] = pp[2];
        temp.bytes[6] = pp[1];
        temp.bytes[7] = pp[0];

        return temp.val;
    }

// ----------------------------------------------------------------------------------------
    // Finalization mix - force all bits of a hash block to avalanche

    DLIB_FORCE_INLINE uint32 murmur_fmix ( uint32 h )
    {
        h ^= h >> 16;
        h *= 0x85ebca6b;
        h ^= h >> 13;
        h *= 0xc2b2ae35;
        h ^= h >> 16;

        return h;
    }

// ----------------------------------------------------------------------------------------

    DLIB_FORCE_INLINE uint64 murmur_fmix ( uint64 k )
    {
        k ^= k >> 33;
        k *= DLIB_BIG_CONSTANT(0xff51afd7ed558ccd);
        k ^= k >> 33;
        k *= DLIB_BIG_CONSTANT(0xc4ceb9fe1a85ec53);
        k ^= k >> 33;

        return k;
    }

// ----------------------------------------------------------------------------------------

    inline uint32 murmur_hash3 ( 
        const void * key, 
        const int len, 
        const uint32 seed = 0
    )
    {
        const uint8 * data = (const uint8*)key;
        const int nblocks = len / 4;

        uint32 h1 = seed;

        uint32 c1 = 0xcc9e2d51;
        uint32 c2 = 0x1b873593;

        //----------
        // body

        const uint32 * blocks = (const uint32 *)(data + nblocks*4);

        bool is_little_endian = true;
        uint32 endian_test = 1;
        if (*reinterpret_cast<unsigned char*>(&endian_test) != 1)
            is_little_endian = false;


        if (is_little_endian)
        {
            for(int i = -nblocks; i; i++)
            {
                uint32 k1 = murmur_getblock(blocks,i);

                k1 *= c1;
                k1 = DLIB_ROTL32(k1,15);
                k1 *= c2;

                h1 ^= k1;
                h1 = DLIB_ROTL32(h1,13); 
                h1 = h1*5+0xe6546b64;
            }
        }
        else
        {
            for(int i = -nblocks; i; i++)
            {
                uint32 k1 = murmur_getblock_byte_swap(blocks,i);

                k1 *= c1;
                k1 = DLIB_ROTL32(k1,15);
                k1 *= c2;

                h1 ^= k1;
                h1 = DLIB_ROTL32(h1,13); 
                h1 = h1*5+0xe6546b64;
            }
        }

        //----------
        // tail

        const uint8 * tail = (const uint8*)(data + nblocks*4);

        uint32 k1 = 0;

        switch(len & 3)
        {
            case 3: k1 ^= tail[2] << 16;
            case 2: k1 ^= tail[1] << 8;
            case 1: k1 ^= tail[0];
                    k1 *= c1; k1 = DLIB_ROTL32(k1,15); k1 *= c2; h1 ^= k1;
        };

        //----------
        // finalization

        h1 ^= len;

        h1 = murmur_fmix(h1);

        return h1;
    } 

// ----------------------------------------------------------------------------------------

    inline uint32 murmur_hash3_2 ( 
        const uint32 v1,
        const uint32 v2 
    )
    {
        uint32 h1 = v2;

        uint32 c1 = 0xcc9e2d51;
        uint32 c2 = 0x1b873593;

        //----------
        // body


        uint32 k1 = v1;

        k1 *= c1;
        k1 = DLIB_ROTL32(k1,15);
        k1 *= c2;

        h1 ^= k1;
        h1 = DLIB_ROTL32(h1,13); 
        h1 = h1*5+0xe6546b64;


        //----------
        // finalization

        h1 ^= 4; // =^ by length in bytes

        h1 = murmur_fmix(h1);

        return h1;
    } 

// ----------------------------------------------------------------------------------------

    inline uint32 murmur_hash3_3 ( 
        const uint32 v1,
        const uint32 v2, 
        const uint32 v3 
    )
    {

        uint32 h1 = v3;

        uint32 c1 = 0xcc9e2d51;
        uint32 c2 = 0x1b873593;

        //----------
        // body


        uint32 k1 = v1;

        k1 *= c1;
        k1 = DLIB_ROTL32(k1,15);
        k1 *= c2;

        h1 ^= k1;
        h1 = DLIB_ROTL32(h1,13); 
        h1 = h1*5+0xe6546b64;

        k1 = v2;
        k1 *= c1;
        k1 = DLIB_ROTL32(k1,15);
        k1 *= c2;

        h1 ^= k1;
        h1 = DLIB_ROTL32(h1,13); 
        h1 = h1*5+0xe6546b64;

        //----------
        // finalization

        h1 ^= 8; // =^ by length in bytes

        h1 = murmur_fmix(h1);

        return h1;
    } 

// ----------------------------------------------------------------------------------------

    inline std::pair<uint64,uint64> murmur_hash3_128bit ( 
        const void* key, 
        const int len,
        const uint32 seed = 0
    )
    {
        const uint8 * data = (const uint8*)key;
        const int nblocks = len / 16;

        uint64 h1 = seed;
        uint64 h2 = seed;

        uint64 c1 = DLIB_BIG_CONSTANT(0x87c37b91114253d5);
        uint64 c2 = DLIB_BIG_CONSTANT(0x4cf5ad432745937f);

        //----------
        // body

        const uint64 * blocks = (const uint64 *)(data);

        bool is_little_endian = true;
        uint32 endian_test = 1;
        if (*reinterpret_cast<unsigned char*>(&endian_test) != 1)
            is_little_endian = false;


        if (is_little_endian)
        {
            for(int i = 0; i < nblocks; i++)
            {
                uint64 k1 = murmur_getblock(blocks,i*2+0);
                uint64 k2 = murmur_getblock(blocks,i*2+1);

                k1 *= c1; k1  = DLIB_ROTL64(k1,31); k1 *= c2; h1 ^= k1;

                h1 = DLIB_ROTL64(h1,27); h1 += h2; h1 = h1*5+0x52dce729;

                k2 *= c2; k2  = DLIB_ROTL64(k2,33); k2 *= c1; h2 ^= k2;

                h2 = DLIB_ROTL64(h2,31); h2 += h1; h2 = h2*5+0x38495ab5;
            }
        }
        else
        {
            for(int i = 0; i < nblocks; i++)
            {
                uint64 k1 = murmur_getblock_byte_swap(blocks,i*2+0);
                uint64 k2 = murmur_getblock_byte_swap(blocks,i*2+1);

                k1 *= c1; k1  = DLIB_ROTL64(k1,31); k1 *= c2; h1 ^= k1;

                h1 = DLIB_ROTL64(h1,27); h1 += h2; h1 = h1*5+0x52dce729;

                k2 *= c2; k2  = DLIB_ROTL64(k2,33); k2 *= c1; h2 ^= k2;

                h2 = DLIB_ROTL64(h2,31); h2 += h1; h2 = h2*5+0x38495ab5;
            }
        }

        //----------
        // tail

        const uint8 * tail = (const uint8*)(data + nblocks*16);

        uint64 k1 = 0;
        uint64 k2 = 0;

        switch(len & 15)
        {
            case 15: k2 ^= uint64(tail[14]) << 48;
            case 14: k2 ^= uint64(tail[13]) << 40;
            case 13: k2 ^= uint64(tail[12]) << 32;
            case 12: k2 ^= uint64(tail[11]) << 24;
            case 11: k2 ^= uint64(tail[10]) << 16;
            case 10: k2 ^= uint64(tail[ 9]) << 8;
            case  9: k2 ^= uint64(tail[ 8]) << 0;
                     k2 *= c2; k2  = DLIB_ROTL64(k2,33); k2 *= c1; h2 ^= k2;

            case  8: k1 ^= uint64(tail[ 7]) << 56;
            case  7: k1 ^= uint64(tail[ 6]) << 48;
            case  6: k1 ^= uint64(tail[ 5]) << 40;
            case  5: k1 ^= uint64(tail[ 4]) << 32;
            case  4: k1 ^= uint64(tail[ 3]) << 24;
            case  3: k1 ^= uint64(tail[ 2]) << 16;
            case  2: k1 ^= uint64(tail[ 1]) << 8;
            case  1: k1 ^= uint64(tail[ 0]) << 0;
                     k1 *= c1; k1  = DLIB_ROTL64(k1,31); k1 *= c2; h1 ^= k1;
        };

        //----------
        // finalization

        h1 ^= len; h2 ^= len;

        h1 += h2;
        h2 += h1;

        h1 = murmur_fmix(h1);
        h2 = murmur_fmix(h2);

        h1 += h2;
        h2 += h1;

        return std::make_pair(h1,h2);
    }

// ----------------------------------------------------------------------------------------

    inline std::pair<uint64,uint64> murmur_hash3_128bit ( 
        const uint32& v1, 
        const uint32& v2, 
        const uint32& v3, 
        const uint32& v4 
    )
    {
        uint64 h1 = 0;
        uint64 h2 = 0;

        const uint64 c1 = DLIB_BIG_CONSTANT(0x87c37b91114253d5);
        const uint64 c2 = DLIB_BIG_CONSTANT(0x4cf5ad432745937f);

        //----------
        // body

        uint64 k1 = (static_cast<uint64>(v2)<<32)|v1; 
        uint64 k2 = (static_cast<uint64>(v4)<<32)|v3; 

        k1 *= c1; k1  = DLIB_ROTL64(k1,31); k1 *= c2;

        h1 = DLIB_ROTL64(k1,27); h1 = h1*5+0x52dce729;

        k2 *= c2; k2  = DLIB_ROTL64(k2,33); k2 *= c1; 

        h2 = DLIB_ROTL64(k2,31); h2 += h1; h2 = h2*5+0x38495ab5;

        //----------
        // finalization

        h1 ^= 16; h2 ^= 16;

        h1 += h2;
        h2 += h1;

        h1 = murmur_fmix(h1);
        h2 = murmur_fmix(h2);

        h1 += h2;
        h2 += h1;

        return std::make_pair(h1,h2);
    }

// ----------------------------------------------------------------------------------------

    inline std::pair<uint64,uint64> murmur_hash3_128bit_3 ( 
        uint64 k1, 
        uint64 k2,
        uint64 k3 
    )
    {
        uint64 h1 = k3;
        uint64 h2 = k3;

        const uint64 c1 = DLIB_BIG_CONSTANT(0x87c37b91114253d5);
        const uint64 c2 = DLIB_BIG_CONSTANT(0x4cf5ad432745937f);

        //----------
        // body

        k1 *= c1; k1  = DLIB_ROTL64(k1,31); k1 *= c2; h1 ^= k1;

        h1 = DLIB_ROTL64(h1,27); h1 += h2; h1 = h1*5+0x52dce729;

        k2 *= c2; k2  = DLIB_ROTL64(k2,33); k2 *= c1; h2 ^= k2;

        h2 = DLIB_ROTL64(h2,31); h2 += h1; h2 = h2*5+0x38495ab5;

        //----------
        // finalization

        h1 ^= 16; h2 ^= 16;

        h1 += h2;
        h2 += h1;

        h1 = murmur_fmix(h1);
        h2 = murmur_fmix(h2);

        h1 += h2;
        h2 += h1;

        return std::make_pair(h1,h2);
    }

// ----------------------------------------------------------------------------------------

}

#endif // DLIB_MURMUR_HAsH_3_Hh_

