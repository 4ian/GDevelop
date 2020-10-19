/**
 * Modified version of sole (https://github.com/r-lyeh-archived/sole) C++11 library
 * to only generate UUID v4.
 *
 * Sole is a lightweight C++11 library to generate universally unique identificators.
 * Sole provides interface for UUID versions 0, 1 and 4.
 *
 * https://github.com/r-lyeh/sole
 * Copyright (c) 2013,2014,2015 r-lyeh. zlib/libpng licensed.
 *
 * Based on code by Dmitri Bouianov, Philip O'Toole, Poco C++ libraries and anonymous
 * code found on the net. Thanks guys!
 *
 * Theory: (see Hoylen's answer at [1])
 * - UUID version 1 (48-bit MAC address + 60-bit clock with a resolution of 100ns)
 *   Clock wraps in 3603 A.D.
 *   Up to 10000000 UUIDs per second.
 *   MAC address revealed.
 *
 * - UUID Version 4 (122-bits of randomness)
 *   See [2] or other analysis that describe how very unlikely a duplicate is.
 *
 * - Use v1 if you need to sort or classify UUIDs per machine.
 *   Use v1 if you are worried about leaving it up to probabilities (e.g. your are the
 *   type of person worried about the earth getting destroyed by a large asteroid in your
 *   lifetime). Just use a v1 and it is guaranteed to be unique till 3603 AD.
 *
 * - Use v4 if you are worried about security issues and determinism. That is because
 *   v1 UUIDs reveal the MAC address of the machine it was generated on and they can be
 *   predictable. Use v4 if you need more than 10 million uuids per second, or if your
 *   application wants to live past 3603 A.D.
 * Additionally a custom UUID v0 is provided:
 * - 16-bit PID + 48-bit MAC address + 60-bit clock with a resolution of 100ns since Unix epoch
 * - Format is EPOCH_LOW-EPOCH_MID-VERSION(0)|EPOCH_HI-PID-MAC
 * - Clock wraps in 3991 A.D.
 * - Up to 10000000 UUIDs per second.
 * - MAC address and PID revealed.
 * References:
 * - [1] http://stackoverflow.com/questions/1155008/how-unique-is-uuid
 * - [2] http://en.wikipedia.org/wiki/UUID#Random%5FUUID%5Fprobability%5Fof%5Fduplicates
 * - http://en.wikipedia.org/wiki/Universally_unique_identifier
 * - http://en.cppreference.com/w/cpp/numeric/random/random_device
 * - http://www.itu.int/ITU-T/asn1/uuid.html f81d4fae-7dec-11d0-a765-00a0c91e6bf6
 * - rlyeh ~~ listening to Hedon Cries / Until The Sun Goes up
 */

//////////////////////////////////////////////////////////////////////////////////////

#pragma once
#include <stdint.h>
#include <stdio.h>     // for size_t; should be stddef.h instead; however, clang+archlinux fails when compiling it (@Travis-Ci)
#include <sys/types.h> // for uint32_t; should be stdint.h instead; however, GCC 5 on OSX fails when compiling it (See issue #11)
#include <functional>
#include <string>

// public API

namespace sole
{
    // 128-bit basic UUID type that allows comparison and sorting.
    // Use .str() for printing and .pretty() for pretty printing.
    // Also, ostream friendly.
    struct uuid
    {
        uint64_t ab;
        uint64_t cd;

        bool operator==( const uuid &other ) const;
        bool operator!=( const uuid &other ) const;
        bool operator <( const uuid &other ) const;

        std::string base62() const;
        std::string str() const;

        template<typename ostream>
        inline friend ostream &operator<<( ostream &os, const uuid &self ) {
            return os << self.str(), os;
        }
    };

    // Generators
    uuid uuid4(); // UUID v4, pros: anonymous, fast; con: uuids "can clash"

    // Rebuilders
    uuid rebuild( uint64_t ab, uint64_t cd );
    uuid rebuild( const std::string &uustr );
}

#ifdef _MSC_VER
#pragma warning(push)
#pragma warning(disable:4127)
#endif

namespace std {
    template<>
    struct hash< sole::uuid > {
    public:
        // hash functor: hash uuid to size_t value by pseudorandomizing transform
        size_t operator()( const sole::uuid &uuid ) const {
            if( sizeof(size_t) > 4 ) {
                return size_t( uuid.ab ^ uuid.cd );
            } else {
                uint64_t hash64 = uuid.ab ^ uuid.cd;
                return size_t( uint32_t( hash64 >> 32 ) ^ uint32_t( hash64 ) );
            }
        }
    };
}

#ifdef _MSC_VER
#pragma warning(pop)
#endif

// implementation

#include <memory.h>
#include <stdint.h>
#include <stdio.h>
#include <time.h>

#include <cstring>
#include <ctime>

#include <iomanip>
#include <random>
#include <sstream>
#include <string>
#include <vector>

#include <unistd.h>

inline bool sole::uuid::operator==( const sole::uuid &other ) const {
    return ab == other.ab && cd == other.cd;
}
inline bool sole::uuid::operator!=( const sole::uuid &other ) const {
    return !operator==(other);
}
inline bool sole::uuid::operator<( const sole::uuid &other ) const {
    if( ab < other.ab ) return true;
    if( ab > other.ab ) return false;
    if( cd < other.cd ) return true;
    return false;
}

namespace sole {

    inline std::string uuid::str() const {
        std::stringstream ss;
        ss << std::hex << std::nouppercase << std::setfill('0');

        uint32_t a = (ab >> 32);
        uint32_t b = (ab & 0xFFFFFFFF);
        uint32_t c = (cd >> 32);
        uint32_t d = (cd & 0xFFFFFFFF);

        ss << std::setw(8) << (a) << '-';
        ss << std::setw(4) << (b >> 16) << '-';
        ss << std::setw(4) << (b & 0xFFFF) << '-';
        ss << std::setw(4) << (c >> 16 ) << '-';
        ss << std::setw(4) << (c & 0xFFFF);
        ss << std::setw(8) << d;

        return ss.str();
    }

    inline std::string uuid::base62() const {
        int base62len = 10 + 26 + 26;
        const char base62[] =
            "0123456789"
            "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
            "abcdefghijklmnopqrstuvwxyz";
        char res[24], *end = &res[24]; *(--end) = '\0';
        uint64_t rem, AB = ab, CD = cd;
        do {
            rem = CD % base62len;
            *--end = base62[int(rem)];
            CD /= base62len;
        } while (CD > 0);
        *--end = '-';
        do {
            rem = AB % base62len;
            *--end = base62[int(rem)];
            AB /= base62len;
        } while (AB > 0);
        return end;
    }

    //////////////////////////////////////////////////////////////////////////////////////
    // UUID implementations

    inline uuid uuid4() {
        static std::random_device rd;
        static std::uniform_int_distribution<uint64_t> dist(0, (uint64_t)(~0));

        uuid my;

        my.ab = dist(rd);
        my.cd = dist(rd);

        my.ab = (my.ab & 0xFFFFFFFFFFFF0FFFULL) | 0x0000000000004000ULL;
        my.cd = (my.cd & 0x3FFFFFFFFFFFFFFFULL) | 0x8000000000000000ULL;

        return my;
    }

    inline uuid rebuild( uint64_t ab, uint64_t cd ) {
        uuid u;
        u.ab = ab; u.cd = cd;
        return u;
    }

    inline uuid rebuild( const std::string &uustr ) {
        char sep;
        uint64_t a,b,c,d,e;
        uuid u = { 0, 0 };
        auto idx = uustr.find_first_of("-");
        if( idx != std::string::npos ) {
            // single separator, base62 notation
            if( uustr.find_first_of("-",idx+1) == std::string::npos ) {
                auto rebase62 = [&]( const char *input, size_t limit ) -> uint64_t {
                    int base62len = 10 + 26 + 26;
                    auto strpos = []( char ch ) -> size_t {
                        if( ch >= 'a' ) return ch - 'a' + 10 + 26;
                        if( ch >= 'A' ) return ch - 'A' + 10;
                        return ch - '0';
                    };
                    uint64_t res = strpos( input[0] );
                    for( size_t i = 1; i < limit; ++i )
                        res = base62len * res + strpos( input[i] );
                    return res;
                };
                u.ab = rebase62( &uustr[0], idx );
                u.cd = rebase62( &uustr[idx+1], uustr.size() - (idx+1) );
            }
            // else classic hex notation
            else {
                std::stringstream ss( uustr );
                if( ss >> std::hex >> a >> sep >> b >> sep >> c >> sep >> d >> sep >> e ) {
                    if( ss.eof() ) {
                        u.ab = (a << 32) | (b << 16) | c;
                        u.cd = (d << 48) | e;
                    }
                }
            }
        }
        return u;
    }

} // ::sole
