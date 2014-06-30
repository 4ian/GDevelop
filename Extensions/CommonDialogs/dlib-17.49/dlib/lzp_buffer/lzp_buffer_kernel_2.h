// Copyright (C) 2005  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#ifndef DLIB_LZP_BUFFER_KERNEl_2_
#define DLIB_LZP_BUFFER_KERNEl_2_

#include "../algs.h"
#include "lzp_buffer_kernel_abstract.h"
#include <new>

namespace dlib
{

    template <
        typename sbuf
        >
    class lzp_buffer_kernel_2 
    {
        /*!
            REQUIREMENTS ON sbuf
                sbuf is an implementation of sliding_buffer/sliding_buffer_kernel_abstract.h
                T == unsigned char

            INITIAL VALUE
                - buffer.size() == the size as defined by the constructor
                - table_size == the number of elements in the table3 and table4 arrays
                - for all i: buffer[i] == 0
                - for all i: table3[i] == buffer.size()
                - for all i: table4[i] == buffer.size()

            CONVENTION
                - table_size == the number of elements in the table3 and table4 arrays
                - size() == buffer.size()
                - operator[](i) == buffer[i]

                

                - last_element == buffer.size()-1

                
                This is LZP with an order-5-4-3 model with context confirmation.
                To save memory the order5 and order3 predictions exist in the same
                table, that is, table3.
        
        !*/

    public:

        explicit lzp_buffer_kernel_2 (
            unsigned long buffer_size           
        );

        virtual ~lzp_buffer_kernel_2 (
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

        inline bool verify (
            unsigned long index
        ) const
        /*!
            ensures
                - returns true if buffer[index]'s context matches the current context
        !*/
        { 
            if (index+3 < buffer.size())
            {
                if (buffer[0] != buffer[index+1])
                    return false;
                if (buffer[1] != buffer[index+2])
                    return false;
                if (buffer[2] != buffer[index+3])
                    return false;
                return true;
            }
            else
            {
                // just call this a match
                return true;
            }
        }


        sbuf buffer;        
        unsigned long* table3;
        unsigned long* table4;
        unsigned long last_element;
        const unsigned long table_size;

        // restricted functions
        lzp_buffer_kernel_2(const lzp_buffer_kernel_2<sbuf>&);        // copy constructor
        lzp_buffer_kernel_2<sbuf>& operator=(const lzp_buffer_kernel_2<sbuf>&);    // assignment operator

    };      

// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------
    // member function definitions
// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------

    template <
        typename sbuf
        >
    lzp_buffer_kernel_2<sbuf>::
    lzp_buffer_kernel_2 (
        unsigned long buffer_size           
    ) :
        table3(0),
        table4(0),
        table_size(65536)
    {
        buffer.set_size(buffer_size);

        table3 = new (std::nothrow) unsigned long[table_size];
        table4 = new (std::nothrow) unsigned long[table_size];

        if (!table3 || !table4)
        {
            if (!table3)
                delete [] table3;
            if (!table4)
                delete [] table4;

            throw std::bad_alloc();
        }
        
        

        for (unsigned long i = 0; i < buffer.size(); ++i)
            buffer[i] = 0;

        for (unsigned long i = 0; i < table_size; ++i)
        {
            table3[i] = buffer.size();
            table4[i] = buffer.size();
        }

        last_element = buffer.size()-1;
    }

// ----------------------------------------------------------------------------------------

    template <
        typename sbuf
        >
    lzp_buffer_kernel_2<sbuf>::
    ~lzp_buffer_kernel_2 (
    )
    {
        delete [] table3;
        delete [] table4;
    }

// ----------------------------------------------------------------------------------------

    template <
        typename sbuf
        >
    void lzp_buffer_kernel_2<sbuf>::
    clear(
    )
    {
        for (unsigned long i = 0; i < buffer.size(); ++i)
            buffer[i] = 0;

        for (unsigned long i = 0; i < table_size; ++i)
        {
            table3[i] = buffer.size();
            table4[i] = buffer.size();
        }
    }

// ----------------------------------------------------------------------------------------

    template <
        typename sbuf
        >
    void lzp_buffer_kernel_2<sbuf>::
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
    unsigned long lzp_buffer_kernel_2<sbuf>::
    predict_match (
        unsigned long& index
    )
    {
        unsigned long temp1 = buffer[0];
        unsigned long temp2 = buffer[1];
        temp2 <<= 8;
        unsigned long temp3 = buffer[2];
        temp3 <<= 16;
        unsigned long temp4 = buffer[3];
        temp4 <<= 24;
        unsigned long temp5 = buffer[4];
        temp5 <<= 12;
        
        unsigned long context1 = temp1|temp2|temp3;    
        unsigned long context2 = context1|temp4;


        const unsigned long i5 = ((temp5|(context2>>20))^context2)&0xFFFF;
        const unsigned long i4 = ((context2>>15)^context2)&0xFFFF;
        const unsigned long i3 = ((context1>>11)^context1)&0xFFFF;
      


        // check the 5-order context's prediction
        if (table3[i5] != buffer.size() && 
            verify(buffer.get_element_index(table3[i5])) )
        {
            index = buffer.get_element_index(table3[i5]);
            if (index > 20)
            {
                // update the prediction for this context
                table3[i3] = buffer.get_element_id(last_element);
                table4[i4] = table3[i3];     
                table3[i5] = table3[i3];
            }
            return 5;
        }
        // check the 4-order context's prediction
        else if (table4[i4] != buffer.size() && 
            verify(buffer.get_element_index(table4[i4])) )
        {
            index = buffer.get_element_index(table4[i4]);
            if (index > 20)
            {
                // update the prediction for this context
                table3[i3] = buffer.get_element_id(last_element);
                table4[i4] = table3[i3];           
                table3[i5] = table3[i3];          
            }
            return 4;
        }
        // check the 3-order context's prediction
        else if (table3[i3] != buffer.size() &&
            verify(buffer.get_element_index(table3[i3])))
        {
            index = buffer.get_element_index(table3[i3]);
            
            if (index > 20)
            {
                // update the prediction for this context
                table3[i3] = buffer.get_element_id(last_element);
                table4[i4] = table3[i3];        
                table3[i5] = table3[i3];             
            }
            return 3;
        } 
        else
        {
            // update the prediction for this context
            table3[i3] = buffer.get_element_id(last_element);
            table4[i4] = table3[i3];            
            table3[i5] = table3[i3];         
            
            return 0;
        }
    }

// ----------------------------------------------------------------------------------------

    template <
        typename sbuf
        >
    unsigned long lzp_buffer_kernel_2<sbuf>::
    size (
    ) const 
    { 
        return buffer.size(); 
    }

// ----------------------------------------------------------------------------------------

    template <
        typename sbuf
        >
    unsigned char lzp_buffer_kernel_2<sbuf>::
    operator[] (
        unsigned long index
    ) const 
    { 
        return buffer[index]; 
    }

// ----------------------------------------------------------------------------------------

}

#endif // DLIB_LZP_BUFFER_KERNEl_2_

