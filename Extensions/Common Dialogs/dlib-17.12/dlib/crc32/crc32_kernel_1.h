// Copyright (C) 2005  Davis E. King (davisking@users.sourceforge.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#ifndef DLIB_CRC32_KERNEl_1_
#define DLIB_CRC32_KERNEl_1_

#include "../algs.h"
#include <string>
#include "crc32_kernel_abstract.h"

namespace dlib
{

    class crc32_kernel_1 
    {
        /*!
            INITIAL VALUE
                checksum == 0xFFFFFFFF
                table == crc table

            CONVENTION
                get_checksum() == checksum ^ 0xFFFFFFFF
                table == crc table
        !*/

    public:

        inline crc32_kernel_1 (        
        );

        inline virtual ~crc32_kernel_1 (
        );

        inline void clear(
        );

        inline void add (
            unsigned char item
        );

        inline void add (
            const std::string& item
        );

        inline unsigned long get_checksum (
        ) const;

        inline void swap (
            crc32_kernel_1& item
        );

    private:

        unsigned long checksum;
        unsigned long table[256];

        // restricted functions
        crc32_kernel_1(const crc32_kernel_1&);        // copy constructor
        crc32_kernel_1& operator=(const crc32_kernel_1&);    // assignment operator

    };    

    inline void swap (
        crc32_kernel_1& a, 
        crc32_kernel_1& b 
    ) { a.swap(b); }   

// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------
    // member function definitions
// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------

    crc32_kernel_1::
    crc32_kernel_1 (        
    )
    {
        checksum = 0xFFFFFFFF;
        unsigned long temp;

        // fill out the crc table
        for (unsigned long i = 0; i < 256; ++i)
        {
            temp = i;
            for (unsigned long j = 0; j < 8; ++j)
            {
                if (temp&1)
                    temp = (temp>>1)^0xedb88320;
                else
                    temp >>= 1;
            }
            table[i] = temp;
        }

    }

// ----------------------------------------------------------------------------------------

    crc32_kernel_1::
    ~crc32_kernel_1 (
    )
    {
    }

// ----------------------------------------------------------------------------------------

    void crc32_kernel_1::
    clear(
    )
    {
        checksum = 0xFFFFFFFF;
    }

// ----------------------------------------------------------------------------------------

    void crc32_kernel_1::
    add (
        unsigned char item
    )
    {
        checksum = (checksum>>8) ^ table[(checksum^item) & 0xFF];
    }

// ----------------------------------------------------------------------------------------

    void crc32_kernel_1::
    add (
        const std::string& item
    )
    {
        for (std::string::size_type i = 0; i < item.size(); ++i)
            checksum = (checksum>>8) ^ table[(checksum^item[i]) & 0xFF];
    }

// ----------------------------------------------------------------------------------------

    unsigned long crc32_kernel_1::
    get_checksum (
    ) const
    {
        return checksum ^ 0xFFFFFFFF;
    }

// ----------------------------------------------------------------------------------------

    void crc32_kernel_1::
    swap (
        crc32_kernel_1& item
    )
    {
        exchange(checksum,item.checksum);
    }

// ----------------------------------------------------------------------------------------

}

#endif // DLIB_CRC32_KERNEl_1_

