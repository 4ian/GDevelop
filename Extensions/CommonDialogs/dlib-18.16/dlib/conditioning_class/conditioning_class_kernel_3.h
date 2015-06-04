// Copyright (C) 2004  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#ifndef DLIB_CONDITIONING_CLASS_KERNEl_3_
#define DLIB_CONDITIONING_CLASS_KERNEl_3_

#include "conditioning_class_kernel_abstract.h"
#include "../assert.h"
#include "../algs.h"


namespace dlib
{

    template <
        unsigned long alphabet_size
        >
    class conditioning_class_kernel_3 
    {
        /*!
            INITIAL VALUE
                total == 1
                counts == pointer to an array of alphabet_size data structs                
                for all i except i == 0: counts[i].count == 0
                counts[0].count == 1
                counts[0].symbol == alphabet_size-1
                for all i except i == alphabet_size-1:  counts[i].present == false
                counts[alphabet_size-1].present == true

            CONVENTION
                counts == pointer to an array of alphabet_size data structs
                get_total() == total
                get_count(symbol) == counts[x].count where 
                                     counts[x].symbol == symbol


                LOW_COUNT(symbol) == sum of counts[0].count though counts[x-1].count
                                     where counts[x].symbol == symbol
                                     if (counts[0].symbol == symbol) LOW_COUNT(symbol)==0


                if (counts[i].count == 0) then
                    counts[i].symbol == undefined value

                if (symbol has a nonzero count) then
                    counts[symbol].present == true

                get_memory_usage() == global_state.memory_usage
        !*/

    public:

        class global_state_type
        {
        public:
            global_state_type () : memory_usage(0) {}
        private:
            unsigned long memory_usage;

            friend class conditioning_class_kernel_3<alphabet_size>;
        };

        conditioning_class_kernel_3 (
            global_state_type& global_state_
        );

        ~conditioning_class_kernel_3 (
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
        conditioning_class_kernel_3(conditioning_class_kernel_3<alphabet_size>&);        // copy constructor
        conditioning_class_kernel_3& operator=(conditioning_class_kernel_3<alphabet_size>&);    // assignment operator

        struct data
        {
            unsigned short count;
            unsigned short symbol;
            bool present;
        };

        // data members
        unsigned short total;
        data* counts;
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
    conditioning_class_kernel_3<alphabet_size>::
    conditioning_class_kernel_3 (
        global_state_type& global_state_
    ) :
        total(1),
        counts(new data[alphabet_size]),
        global_state(global_state_)
    {
        COMPILE_TIME_ASSERT( 1 < alphabet_size && alphabet_size < 65536 );

        data* start = counts;
        data* end = counts+alphabet_size;
        start->count = 1;
        start->symbol = alphabet_size-1;
        start->present = false;
        ++start;
        while (start != end)
        {
            start->count = 0;
            start->present = false;
            ++start;
        }        
        counts[alphabet_size-1].present = true;

        // update memory usage
        global_state.memory_usage += sizeof(data)*alphabet_size + 
                                     sizeof(conditioning_class_kernel_3);

    }

// ----------------------------------------------------------------------------------------

    template <
        unsigned long alphabet_size
        >
    conditioning_class_kernel_3<alphabet_size>::
    ~conditioning_class_kernel_3 (
    )
    {
        delete [] counts;
        // update memory usage
        global_state.memory_usage -= sizeof(data)*alphabet_size + 
                                     sizeof(conditioning_class_kernel_3);
    }

// ----------------------------------------------------------------------------------------

    template <
        unsigned long alphabet_size
        >
    void conditioning_class_kernel_3<alphabet_size>::
    clear(
    )
    {
        total = 1;
        data* start = counts;
        data* end = counts+alphabet_size;
        start->count = 1;
        start->symbol = alphabet_size-1;
        start->present = false;
        ++start;
        while (start != end)
        {
            start->count = 0;
            start->present = false;
            ++start;
        }        
        counts[alphabet_size-1].present = true; 

    }

// ----------------------------------------------------------------------------------------

    template <
        unsigned long alphabet_size
        >
    typename conditioning_class_kernel_3<alphabet_size>::global_state_type& conditioning_class_kernel_3<alphabet_size>::
    get_global_state(
    )
    {
        return global_state;
    }

// ----------------------------------------------------------------------------------------

    template <
        unsigned long alphabet_size
        >
    unsigned long conditioning_class_kernel_3<alphabet_size>::
    get_memory_usage(
    ) const
    {
        return global_state.memory_usage;
    }

// ----------------------------------------------------------------------------------------

    template <
        unsigned long alphabet_size
        >
    bool conditioning_class_kernel_3<alphabet_size>::
    increment_count (
        unsigned long symbol,
        unsigned short amount
    )
    {        
        // if we are going over a total of 65535 then scale down all counts by 2
        if (static_cast<unsigned long>(total)+static_cast<unsigned long>(amount) >= 65536)
        {
            total = 0;
            data* start = counts;
            data* end = counts+alphabet_size;
            
            while (start != end)
            {
                if (start->count == 1)
                {
                    if (start->symbol == alphabet_size-1)
                    {
                        // this symbol must never be zero so we will leave its count at 1
                        ++total;
                    }
                    else
                    {
                        start->count = 0;
                        counts[start->symbol].present = false;
                    }
                }
                else
                {
                    start->count >>= 1;
                    total += start->count;
                }
 
                ++start;
            }  
        }


        data* start = counts;   
        data* swap_spot = counts;

        if (counts[symbol].present)
        {
            while (true)
            {                
                if (start->symbol == symbol && start->count!=0)
                {                
                    unsigned short temp = start->count + amount;

                    start->symbol = swap_spot->symbol;
                    start->count = swap_spot->count;

                    swap_spot->symbol = static_cast<unsigned short>(symbol);                
                    swap_spot->count  = temp;
                    break;
                }
                
                if ( (start->count) < (swap_spot->count))
                {
                    swap_spot = start;
                }


                ++start;
            }
        }
        else
        {
            counts[symbol].present = true;
            while (true)
            {
                if (start->count == 0)
                {
                    start->symbol = swap_spot->symbol;
                    start->count = swap_spot->count;
                    
                    swap_spot->symbol = static_cast<unsigned short>(symbol);                
                    swap_spot->count  = amount;
                    break;
                }
                    
                if ((start->count) < (swap_spot->count))
                {
                    swap_spot = start;
                }

                ++start;
            }
        }
        
        total += amount;

        return true;
    }

// ----------------------------------------------------------------------------------------

    template <
        unsigned long alphabet_size
        >
    unsigned long conditioning_class_kernel_3<alphabet_size>::
    get_count (
        unsigned long symbol
    ) const
    {
        if (counts[symbol].present == false)
            return 0;

        data* start = counts;        
        while (start->symbol != symbol)
        {
            ++start;
        }
        return start->count;
    }

// ----------------------------------------------------------------------------------------

    template <
        unsigned long alphabet_size
        >
    unsigned long conditioning_class_kernel_3<alphabet_size>::
    get_alphabet_size (        
    ) 
    {
        return alphabet_size;
    }

// ----------------------------------------------------------------------------------------

    template <
        unsigned long alphabet_size
        >
    unsigned long conditioning_class_kernel_3<alphabet_size>::
    get_total (
    ) const
    {
        return total;
    }

// ----------------------------------------------------------------------------------------

    template <
        unsigned long alphabet_size
        >
    unsigned long conditioning_class_kernel_3<alphabet_size>::
    get_range (
        unsigned long symbol,
        unsigned long& low_count,
        unsigned long& high_count,
        unsigned long& total_count
    ) const
    {
        if (counts[symbol].present == false)
            return 0;

        total_count = total;
        unsigned long low_count_temp = 0;
        data* start = counts;        
        while (start->symbol != symbol)
        {
            low_count_temp += start->count;
            ++start;
        } 

        low_count = low_count_temp;
        high_count = low_count_temp + start->count;
        return start->count;
    }

// ----------------------------------------------------------------------------------------

    template <
        unsigned long alphabet_size
        >
    void conditioning_class_kernel_3<alphabet_size>::
    get_symbol (
        unsigned long target,
        unsigned long& symbol,            
        unsigned long& low_count,
        unsigned long& high_count
    ) const
    {
        unsigned long high_count_temp = counts->count;
        const data* start = counts;        
        while (target >= high_count_temp)
        {
            ++start;
            high_count_temp += start->count;
        } 

        low_count = high_count_temp - start->count;
        high_count = high_count_temp;
        symbol = static_cast<unsigned long>(start->symbol);
    }

// ----------------------------------------------------------------------------------------

}

#endif // DLIB_CONDITIONING_CLASS_KERNEl_3_

