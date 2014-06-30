// Copyright (C) 2005  Davis E. King (davis@dlib.net)
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
        !*/

        crc32 (        
            const std::string& item
        );
        /*!
            ensures                
                - #*this is properly initialized
                - calls this->add(item).
                  (i.e. Using this constructor is the same as using the default 
                  constructor and then calling add() on item)
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

