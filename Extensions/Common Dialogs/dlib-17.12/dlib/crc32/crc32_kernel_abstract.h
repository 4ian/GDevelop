// Copyright (C) 2005  Davis E. King (davisking@users.sourceforge.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#undef DLIB_CRC32_KERNEl_ABSTRACT_
#ifdef DLIB_CRC32_KERNEl_ABSTRACT_

#include "../algs.h"
#include <string>

namespace dlib
{

    class crc32 
    {
        /*!
            INITIAL VALUE
                The current checksum covers zero bytes. 
                get_checksum() == 0x00000000

            WHAT THIS OBJECT REPRESENTS
                This object represents the CRC32 algorithm for calculating
                checksums.  
        !*/

    public:

        crc32 (        
        );
        /*!
            ensures                
                - #*this is properly initialized
            throws
                - std::bad_alloc
        !*/

        virtual ~crc32 (
        );
        /*!
            ensures
                - any resources associated with *this have been released
        !*/

        void clear(
        );
        /*!
            ensures
                - #*this has its initial value
            throws
                - std::bad_alloc
                    if this exception is thrown then #*this is unusable 
                    until clear() is called and succeeds
        !*/

        void add (
            unsigned char item
        );
        /*!
            ensures
                - #get_checksum() == The checksum of all items added to *this previously
                  concatenated with item.
        !*/

        void add (
            const std::string& item
        );
        /*!
            ensures
                - #get_checksum() == The checksum of all items added to *this previously
                  concatenated with item.
        !*/

        unsigned long get_checksum (
        ) const;
        /*!
            ensures
                - returns the current checksum
        !*/

        void swap (
            crc32& item
        );
        /*!
            ensures
                - swaps *this and item
        !*/ 

    private:

        // restricted functions
        crc32(const crc32&);        // copy constructor
        crc32& operator=(const crc32&);    // assignment operator

    };    

    void swap (
        crc32& a, 
        crc32& b 
    ) { a.swap(b); }   
    /*!
        provides a global swap function
    !*/

}

#endif // DLIB_CRC32_KERNEl_ABSTRACT_

