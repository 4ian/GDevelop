// Copyright (C) 2005  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#ifndef DLIB_LZP_BUFFER_KERNEl_1_
#define DLIB_LZP_BUFFER_KERNEl_1_

#include "../algs.h"
#include "lzp_buffer_kernel_abstract.h"

namespace dlib
{

    template <
        typename sbuf
        >
    class lzp_buffer_kernel_1 
    {
        /*!
            REQUIREMENTS ON sbuf
                sbuf is an implementation of sliding_buffer/sliding_buffer_kernel_abstract.h
                T == unsigned char

            INITIAL VALUE
                - buffer.size() == the size as defined by the constructor
                - table_size == the number of elements in the table array
                - for all i: buffer[i] == 0
                - for all i: table[i] == buffer.size()                

            CONVENTION
                - table_size == the number of elements in the table array
                - size() == buffer.size()
                - operator[](i) == buffer[i]

                - if (table[hash()] != buffer.size()) then
                    - buffer.get_element_index(table[hash()]) == the index we will 
                      predict for the current context
                - else
                    - there is no prediction for the current context

                - last_element == buffer.size()-1

                
                This is LZP with just an order-3 model without context confirmation.
        
        !*/

    public:

        explicit lzp_buffer_kernel_1 (
            unsigned long buffer_size           
        );

        virtual ~lzp_buffer_kernel_1 (
        );

        void clear(
        );

        inline void add (
            unsigned char symbol
        );

        inline unsigned long predict_match (
            unsigned long& index
        );

        inline unsigned long size (
        ) const;

        inline unsigned char operator[] (
            unsigned long index
        ) const;

    private:

        inline unsigned long hash (
        ) const
        /*!
            ensures
                - returns a hash computed from the current context.  This hash
                  is always in the range for table.
        !*/
        {
            unsigned long temp = buffer[0];
            temp <<= 16;
            unsigned long temp2 = buffer[1];
            temp2 <<= 8;
            unsigned long temp3 = buffer[2];
            temp = temp|temp2|temp3;

            temp = ((temp>>11)^temp)&0xFFFF;
           
            return temp;
        }

        sbuf buffer;
        const unsigned long table_size;
        unsigned long* const table;
        unsigned long last_element;

        // restricted functions
        lzp_buffer_kernel_1(const lzp_buffer_kernel_1<sbuf>&);        // copy constructor
        lzp_buffer_kernel_1<sbuf>& operator=(const lzp_buffer_kernel_1<sbuf>&);    // assignment operator

    };      

// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------
    // member function definitions
// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------

    template <
        typename sbuf
        >
    lzp_buffer_kernel_1<sbuf>::
    lzp_buffer_kernel_1 (
        unsigned long buffer_size           
    ) :
        table_size(65536),
        table(new unsigned long[table_size])
    {
        buffer.set_size(buffer_size);

        for (unsigned long i = 0; i < buffer.size(); ++i)
            buffer[i] = 0;

        for (unsigned long i = 0; i < table_size; ++i)
            table[i] = buffer.size();

        last_element = buffer.size()-1;
    }

// ----------------------------------------------------------------------------------------

    template <
        typename sbuf
        >
    lzp_buffer_kernel_1<sbuf>::
    ~lzp_buffer_kernel_1 (
    )
    {
        delete [] table;
    }

// ----------------------------------------------------------------------------------------

    template <
        typename sbuf
        >
    void lzp_buffer_kernel_1<sbuf>::
    clear(
    )
    {
        for (unsigned long i = 0; i < buffer.size(); ++i)
            buffer[i] = 0;

        for (unsigned long i = 0; i < table_size; ++i)
            table[i] = buffer.size();
    }

// ----------------------------------------------------------------------------------------

    template <
        typename sbuf
        >
    void lzp_buffer_kernel_1<sbuf>::
    add (
        unsigned char symbol
    ) 
    { 
        buffer.rotate_left(1); 
        buffer[0] = symbol; 
    }

// ----------------------------------------------------------------------------------------

    template <
        typename sbuf
        >
    unsigned long lzp_buffer_kernel_1<sbuf>::
    predict_match (
        unsigned long& index
    )
    {
        const unsigned long i = hash();

        if (table[i] != buffer.size())
        {
            index = buffer.get_element_index(table[i]);

            if (index > 20)
            {
                // update the prediction for this context
                table[i] = buffer.get_element_id(last_element);
            }
            return 3;
        }
        else
        {
            // update the prediction for this context
            table[i] = buffer.get_element_id(last_element);
            return 0;
        }
    }

// ----------------------------------------------------------------------------------------

    template <
        typename sbuf
        >
    unsigned long lzp_buffer_kernel_1<sbuf>::
    size (
    ) const 
    { 
        return buffer.size(); 
    }

// ----------------------------------------------------------------------------------------

    template <
        typename sbuf
        >
    unsigned char lzp_buffer_kernel_1<sbuf>::
    operator[] (
        unsigned long index
    ) const 
    { 
        return buffer[index]; 
    }

// ----------------------------------------------------------------------------------------

}

#endif // DLIB_LZP_BUFFER_KERNEl_1_

