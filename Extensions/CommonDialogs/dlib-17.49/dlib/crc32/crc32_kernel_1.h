// Copyright (C) 2005  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#ifndef DLIB_CRC32_KERNEl_1_
#define DLIB_CRC32_KERNEl_1_

#include "../algs.h"
#include <string>
#include "crc32_kernel_abstract.h"

namespace dlib
{

    class crc32 
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

        // this is here for backwards compatibility with older versions of dlib.
        typedef crc32 kernel_1a;

        inline crc32 (        
        );

        inline crc32 (        
            const std::string& item
        );

        inline virtual ~crc32 (
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
            crc32& item
        );

        inline crc32& operator=(
            const crc32&
        );  

    private:

        inline void fill_crc_table(
        );

        unsigned long checksum;
        unsigned long table[256];


    };    

    inline void swap (
        crc32& a, 
        crc32& b 
    ) { a.swap(b); }   

// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------
    // member function definitions
// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------

    void crc32::
    fill_crc_table (
    )
    {
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

    crc32::
    crc32 (        
    )
    {
        checksum = 0xFFFFFFFF;
        fill_crc_table();
    }

// ----------------------------------------------------------------------------------------

    crc32::
    crc32 (        
        const std::string& item
    )
    {
        checksum = 0xFFFFFFFF;
        fill_crc_table();
        add(item);
    }

// ----------------------------------------------------------------------------------------

    crc32::
    ~crc32 (
    )
    {
    }

// ----------------------------------------------------------------------------------------

    void crc32::
    clear(
    )
    {
        checksum = 0xFFFFFFFF;
    }

// ----------------------------------------------------------------------------------------

    void crc32::
    add (
        unsigned char item
    )
    {
        checksum = (checksum>>8) ^ table[(checksum^item) & 0xFF];
    }

// ----------------------------------------------------------------------------------------

    void crc32::
    add (
        const std::string& item
    )
    {
        for (std::string::size_type i = 0; i < item.size(); ++i)
            checksum = (checksum>>8) ^ table[(checksum^item[i]) & 0xFF];
    }

// ----------------------------------------------------------------------------------------

    unsigned long crc32::
    get_checksum (
    ) const
    {
        return checksum ^ 0xFFFFFFFF;
    }

// ----------------------------------------------------------------------------------------

    void crc32::
    swap (
        crc32& item
    )
    {
        exchange(checksum,item.checksum);
    }

// ----------------------------------------------------------------------------------------

    crc32& crc32::
    operator=(
        const crc32& item
    )
    {
        checksum = item.checksum;
        return *this;
    }

// ----------------------------------------------------------------------------------------

}

#endif // DLIB_CRC32_KERNEl_1_

