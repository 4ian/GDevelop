// Copyright (C) 2003  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#ifndef DLIB_CONDITIONING_CLASS_KERNEl_2_
#define DLIB_CONDITIONING_CLASS_KERNEl_2_

#include "conditioning_class_kernel_abstract.h"
#include "../assert.h"
#include "../algs.h"

namespace dlib
{

    template <
        unsigned long alphabet_size
        >
    class conditioning_class_kernel_2 
    {
        /*!
            INITIAL VALUE
                total == 1
                symbols == pointer to array of alphabet_size data structs
                for all i except i == alphabet_size-1: symbols[i].count == 0
                                                       symbols[i].left_count == 0

                symbols[alphabet_size-1].count == 1
                symbols[alpahbet_size-1].left_count == 0

            CONVENTION
                symbols == pointer to array of alphabet_size data structs
                get_total() == total
                get_count(symbol) == symbols[symbol].count

                symbols is organized as a tree with symbols[0] as the root.

                the left subchild of symbols[i] is symbols[i*2+1] and
                the right subchild is symbols[i*2+2].
                the partent of symbols[i] == symbols[(i-1)/2]

                symbols[i].left_count == the sum of the counts of all the
                                         symbols to the left of symbols[i]

                get_memory_usage() == global_state.memory_usage                                         
        !*/

    public:

        class global_state_type
        {
        public:
            global_state_type () : memory_usage(0) {}
        private:
            unsigned long memory_usage;

            friend class conditioning_class_kernel_2<alphabet_size>;
        };

        conditioning_class_kernel_2 (
            global_state_type& global_state_
        );

        ~conditioning_class_kernel_2 (
        );

        void clear(
        );

        bool increment_count (
            unsigned long symbol,
            unsigned short amount = 1
        );

        unsigned long get_count (
            unsigned long symbol
        ) const;

        inline unsigned long get_total (
        ) const;
        
        unsigned long get_range (
            unsigned long symbol,
            unsigned long& low_count,
            unsigned long& high_count,
            unsigned long& total_count
        ) const;

        void get_symbol (
            unsigned long target,
            unsigned long& symbol,            
            unsigned long& low_count,
            unsigned long& high_count
        ) const;

        unsigned long get_memory_usage (
        ) const;

        global_state_type& get_global_state (
        );

        static unsigned long get_alphabet_size (
        );

    private:

        // restricted functions
        conditioning_class_kernel_2(conditioning_class_kernel_2<alphabet_size>&);        // copy constructor
        conditioning_class_kernel_2& operator=(conditioning_class_kernel_2<alphabet_size>&);    // assignment operator

        // data members
        unsigned short total;
        struct data
        {
            unsigned short count;
            unsigned short left_count;
        };

        data* symbols;
        global_state_type& global_state;

    };   

// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------
    // member function definitions
// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------

    template <
        unsigned long alphabet_size
        >
    conditioning_class_kernel_2<alphabet_size>::
    conditioning_class_kernel_2 (
        global_state_type& global_state_
    ) :
        total(1),
        symbols(new data[alphabet_size]),
        global_state(global_state_)
    {
        COMPILE_TIME_ASSERT( 1 < alphabet_size && alphabet_size < 65536 );

        data* start = symbols;
        data* end = symbols + alphabet_size-1;
        
        while (start != end)
        {            
            start->count = 0;            
            start->left_count = 0;
            ++start;
        }

        start->count = 1;
        start->left_count = 0;


        // update the left_counts for the symbol alphabet_size-1
        unsigned short temp;
        unsigned long symbol = alphabet_size-1;
        while (symbol != 0)
        {
            // temp will be 1 if symbol is odd, 0 if it is even
            temp = static_cast<unsigned short>(symbol&0x1);

            // set symbol to its parent
            symbol = (symbol-1)>>1;
            
            // note that all left subchidren are odd and also that 
            // if symbol was a left subchild then we want to increment
            // its parents left_count 
            if (temp)
                ++symbols[symbol].left_count;
        }

        global_state.memory_usage += sizeof(data)*alphabet_size + 
                                     sizeof(conditioning_class_kernel_2);
    }

// ----------------------------------------------------------------------------------------

    template <
        unsigned long alphabet_size
        >
    conditioning_class_kernel_2<alphabet_size>::
    ~conditioning_class_kernel_2 (
    )
    {
        delete [] symbols;
        global_state.memory_usage -= sizeof(data)*alphabet_size + 
                                     sizeof(conditioning_class_kernel_2);
    }

// ----------------------------------------------------------------------------------------

    template <
        unsigned long alphabet_size
        >
    void conditioning_class_kernel_2<alphabet_size>::
    clear(
    )
    {
        data* start = symbols;
        data* end = symbols + alphabet_size-1;
        
        total = 1;

        while (start != end)
        {            
            start->count = 0;            
            start->left_count = 0;
            ++start;
        }

        start->count = 1;
        start->left_count = 0;

        // update the left_counts 
        unsigned short temp;
        unsigned long symbol = alphabet_size-1;
        while (symbol != 0)
        {
            // temp will be 1 if symbol is odd, 0 if it is even
            temp = static_cast<unsigned short>(symbol&0x1);

            // set symbol to its parent
            symbol = (symbol-1)>>1;
            
            // note that all left subchidren are odd and also that 
            // if symbol was a left subchild then we want to increment
            // its parents left_count 
            symbols[symbol].left_count += temp;
        }
    }

// ----------------------------------------------------------------------------------------

    template <
        unsigned long alphabet_size
        >
    unsigned long conditioning_class_kernel_2<alphabet_size>::
    get_memory_usage(
    ) const
    {
        return global_state.memory_usage;
    }

// ----------------------------------------------------------------------------------------

    template <
        unsigned long alphabet_size
        >
    typename conditioning_class_kernel_2<alphabet_size>::global_state_type& conditioning_class_kernel_2<alphabet_size>::
    get_global_state(
    )
    {
        return global_state;
    }

// ----------------------------------------------------------------------------------------

    template <
        unsigned long alphabet_size
        >
    bool conditioning_class_kernel_2<alphabet_size>::
    increment_count (
        unsigned long symbol,
        unsigned short amount
    )
    {        
        // if we need to renormalize then do so
        if (static_cast<unsigned long>(total)+static_cast<unsigned long>(amount) >= 65536)
        {
            unsigned long s;
            unsigned short temp;
            for (unsigned short i = 0; i < alphabet_size-1; ++i)
            {
                s = i;

                // divide the count for this symbol by 2                
                symbols[i].count >>= 1;
                
                symbols[i].left_count = 0;

                // bubble this change up though the tree                
                while (s != 0)
                {
                    // temp will be 1 if symbol is odd, 0 if it is even
                    temp = static_cast<unsigned short>(s&0x1);

                    // set s to its parent
                    s = (s-1)>>1;
                    
                    // note that all left subchidren are odd and also that 
                    // if s was a left subchild then we want to increment
                    // its parents left_count 
                    if (temp)
                        symbols[s].left_count += symbols[i].count;
                }   
            }

            // update symbols alphabet_size-1
            {
                s = alphabet_size-1;

                // divide alphabet_size-1 symbol by 2 if it's > 1
                if (symbols[alphabet_size-1].count > 1)
                    symbols[alphabet_size-1].count >>= 1;
                
                // bubble this change up though the tree                
                while (s != 0)
                {
                    // temp will be 1 if symbol is odd, 0 if it is even
                    temp = static_cast<unsigned short>(s&0x1);

                    // set s to its parent
                    s = (s-1)>>1;
                    
                    // note that all left subchidren are odd and also that 
                    // if s was a left subchild then we want to increment
                    // its parents left_count 
                    if (temp)
                        symbols[s].left_count += symbols[alphabet_size-1].count;
                }   
            }        
            





            // calculate the new total
            total = 0;
            unsigned long m = 0;
            while (m < alphabet_size)
            {
                total += symbols[m].count + symbols[m].left_count;
                m = (m<<1) + 2;        
            }
            
        }

        


        // increment the count for the specified symbol      
        symbols[symbol].count += amount;;
        total += amount;

        
        unsigned short temp;
        while (symbol != 0)
        {
            // temp will be 1 if symbol is odd, 0 if it is even
            temp = static_cast<unsigned short>(symbol&0x1);

            // set symbol to its parent
            symbol = (symbol-1)>>1;
            
            // note that all left subchidren are odd and also that 
            // if symbol was a left subchild then we want to increment
            // its parents left_count 
            if (temp)
                symbols[symbol].left_count += amount;
        }

        return true;
    }

// ----------------------------------------------------------------------------------------

    template <
        unsigned long alphabet_size
        >
    unsigned long conditioning_class_kernel_2<alphabet_size>::
    get_count (
        unsigned long symbol
    ) const
    {
        return symbols[symbol].count;
    }

// ----------------------------------------------------------------------------------------

    template <
        unsigned long alphabet_size
        >
    unsigned long conditioning_class_kernel_2<alphabet_size>::
    get_alphabet_size (        
    ) 
    {
        return alphabet_size;
    }

// ----------------------------------------------------------------------------------------

    template <
        unsigned long alphabet_size
        >
    unsigned long conditioning_class_kernel_2<alphabet_size>::
    get_total (
    ) const
    {
        return total;
    }

// ----------------------------------------------------------------------------------------

    template <
        unsigned long alphabet_size
        >
    unsigned long conditioning_class_kernel_2<alphabet_size>::
    get_range (
        unsigned long symbol,
        unsigned long& low_count,
        unsigned long& high_count,
        unsigned long& total_count
    ) const
    {
        if (symbols[symbol].count == 0)
            return 0;

        unsigned long current = symbol;
        total_count = total;
        unsigned long high_count_temp = 0;
        bool came_from_right = true;
        while (true)
        {                        
            if (came_from_right)
            {
                high_count_temp += symbols[current].count + symbols[current].left_count;
            }

            // note that if current is even then it is a right child
            came_from_right = !(current&0x1);

            if (current == 0)
                break;

            // set current to its parent
            current = (current-1)>>1 ;
        }


        low_count = high_count_temp - symbols[symbol].count;
        high_count = high_count_temp;

        return symbols[symbol].count;
    }

// ----------------------------------------------------------------------------------------

    template <
        unsigned long alphabet_size
        >
    void conditioning_class_kernel_2<alphabet_size>::
    get_symbol (
        unsigned long target,
        unsigned long& symbol,            
        unsigned long& low_count,
        unsigned long& high_count
    ) const
    {
        unsigned long current = 0;
        unsigned long low_count_temp = 0;
        
        while (true)
        {
            if (static_cast<unsigned short>(target) < symbols[current].left_count)
            {
                // we should go left
                current = (current<<1) + 1;
            }
            else 
            {
                target -= symbols[current].left_count;
                low_count_temp += symbols[current].left_count;
                if (static_cast<unsigned short>(target) < symbols[current].count)
                {
                    // we have found our target
                    symbol = current;
                    high_count = low_count_temp + symbols[current].count;
                    low_count = low_count_temp;
                    break;
                }
                else
                {   
                    // go right
                    target -= symbols[current].count;
                    low_count_temp += symbols[current].count;
                    current = (current<<1) + 2;
                }
            }

        }

    }

// ----------------------------------------------------------------------------------------

}

#endif // DLIB_CONDITIONING_CLASS_KERNEl_1_

