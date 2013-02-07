// Copyright (C) 2003  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#ifndef DLIB_CONDITIONING_CLASS_KERNEl_1_
#define DLIB_CONDITIONING_CLASS_KERNEl_1_

#include "conditioning_class_kernel_abstract.h"
#include "../assert.h"
#include "../algs.h"

namespace dlib
{

    template <
        unsigned long alphabet_size
        >
    class conditioning_class_kernel_1 
    {
        /*!
            INITIAL VALUE
                total == 1
                counts == pointer to an array of alphabet_size unsigned shorts
                for all i except i == alphabet_size-1: counts[i] == 0
                counts[alphabet_size-1] == 1

            CONVENTION
                counts == pointer to an array of alphabet_size unsigned shorts
                get_total() == total
                get_count(symbol) == counts[symbol]

                LOW_COUNT(symbol) == sum of counts[0] though counts[symbol-1]
                                     or 0 if symbol == 0

                get_memory_usage() == global_state.memory_usage
        !*/

    public:

        class global_state_type
        {
        public:
            global_state_type () : memory_usage(0) {}
        private:
            unsigned long memory_usage;

            friend class conditioning_class_kernel_1<alphabet_size>;
        };

        conditioning_class_kernel_1 (
            global_state_type& global_state_
        );

        ~conditioning_class_kernel_1 (
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

        unsigned long get_total (
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
        conditioning_class_kernel_1(conditioning_class_kernel_1<alphabet_size>&);        // copy constructor
        conditioning_class_kernel_1& operator=(conditioning_class_kernel_1<alphabet_size>&);    // assignment operator

        // data members
        unsigned short total;
        unsigned short* counts;
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
    conditioning_class_kernel_1<alphabet_size>::
    conditioning_class_kernel_1 (
        global_state_type& global_state_
    ) :
        total(1),
        counts(new unsigned short[alphabet_size]),
        global_state(global_state_)
    {
        COMPILE_TIME_ASSERT( 1 < alphabet_size && alphabet_size < 65536 );

        unsigned short* start = counts;
        unsigned short* end = counts+alphabet_size-1;
        while (start != end)
        {
            *start = 0;
            ++start;
        }
        *start = 1;

        // update memory usage
        global_state.memory_usage += sizeof(unsigned short)*alphabet_size + 
                                     sizeof(conditioning_class_kernel_1);
    }

// ----------------------------------------------------------------------------------------

    template <
        unsigned long alphabet_size
        >
    conditioning_class_kernel_1<alphabet_size>::
    ~conditioning_class_kernel_1 (
    )
    {
        delete [] counts;
        // update memory usage
        global_state.memory_usage -= sizeof(unsigned short)*alphabet_size + 
                                     sizeof(conditioning_class_kernel_1);
    }

// ----------------------------------------------------------------------------------------

    template <
        unsigned long alphabet_size
        >
    void conditioning_class_kernel_1<alphabet_size>::
    clear(
    )
    {
        total = 1;
        unsigned short* start = counts;
        unsigned short* end = counts+alphabet_size-1;
        while (start != end)
        {
            *start = 0;
            ++start;
        }
        *start = 1;
    }

// ----------------------------------------------------------------------------------------

    template <
        unsigned long alphabet_size
        >
    unsigned long conditioning_class_kernel_1<alphabet_size>::
    get_memory_usage(
    ) const
    {
        return global_state.memory_usage;
    }

// ----------------------------------------------------------------------------------------

    template <
        unsigned long alphabet_size
        >
    typename conditioning_class_kernel_1<alphabet_size>::global_state_type& conditioning_class_kernel_1<alphabet_size>::
    get_global_state(
    )
    {
        return global_state;
    }

// ----------------------------------------------------------------------------------------

    template <
        unsigned long alphabet_size
        >
    bool conditioning_class_kernel_1<alphabet_size>::
    increment_count (
        unsigned long symbol,
        unsigned short amount
    )
    {        
        // if we are going over a total of 65535 then scale down all counts by 2
        if (static_cast<unsigned long>(total)+static_cast<unsigned long>(amount) >= 65536)
        {
            total = 0;
            unsigned short* start = counts;
            unsigned short* end = counts+alphabet_size;
            while (start != end)
            {
                *start >>= 1;
                total += *start;
                ++start;
            }    
            // make sure it is at least one
            if (counts[alphabet_size-1]==0)
            {
                ++total;
                counts[alphabet_size-1] = 1;
            }
        }
        counts[symbol] += amount;
        total += amount;
        return true;
    }

// ----------------------------------------------------------------------------------------

    template <
        unsigned long alphabet_size
        >
    unsigned long conditioning_class_kernel_1<alphabet_size>::
    get_count (
        unsigned long symbol
    ) const
    {
        return counts[symbol];
    }

// ----------------------------------------------------------------------------------------

    template <
        unsigned long alphabet_size
        >
    unsigned long conditioning_class_kernel_1<alphabet_size>::
    get_alphabet_size (        
    ) 
    {
        return alphabet_size;
    }

// ----------------------------------------------------------------------------------------

    template <
        unsigned long alphabet_size
        >
    unsigned long conditioning_class_kernel_1<alphabet_size>::
    get_total (
    ) const
    {
        return total;
    }

// ----------------------------------------------------------------------------------------

    template <
        unsigned long alphabet_size
        >
    unsigned long conditioning_class_kernel_1<alphabet_size>::
    get_range (
        unsigned long symbol,
        unsigned long& low_count,
        unsigned long& high_count,
        unsigned long& total_count
    ) const
    {
        if (counts[symbol] == 0)
            return 0;

        total_count = total;
        
        const unsigned short* start = counts;
        const unsigned short* end = counts+symbol;
        unsigned short high_count_temp = *start;
        while (start != end)
        {
            ++start;
            high_count_temp += *start;            
        }  
        low_count = high_count_temp - *start;
        high_count = high_count_temp;
        return *start;
    }

// ----------------------------------------------------------------------------------------

    template <
        unsigned long alphabet_size
        >
    void conditioning_class_kernel_1<alphabet_size>::
    get_symbol (
        unsigned long target,
        unsigned long& symbol,            
        unsigned long& low_count,
        unsigned long& high_count
    ) const
    {
        unsigned long high_count_temp = *counts;
        const unsigned short* start = counts;        
        while (target >= high_count_temp)
        {
            ++start;
            high_count_temp += *start;            
        } 

        low_count = high_count_temp - *start;
        high_count = high_count_temp;
        symbol = static_cast<unsigned long>(start-counts);
    }

// ----------------------------------------------------------------------------------------

}

#endif // DLIB_CONDITIONING_CLASS_KERNEl_1_

