// Copyright (C) 2004  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#ifndef DLIB_LZ77_BUFFER_KERNEl_1_
#define DLIB_LZ77_BUFFER_KERNEl_1_

#include "lz77_buffer_kernel_abstract.h"
#include "../algs.h"



namespace dlib
{

    template <
        typename sliding_buffer
        >
    class lz77_buffer_kernel_1 
    {
        /*!
            REQUIREMENTS ON sliding_buffer
                sliding_buffer must be an implementation of sliding_buffer/sliding_buffer_kernel_abstract.h

            INITIAL VALUE
                history_limit == defined by constructor arguments
                lookahead_limit == defined by constructor arguments
                history_size == 0
                lookahead_size == 0
                buffer.size() == history_limit + lookahead_limit


            CONVENTION           
                history_limit == get_history_buffer_limit()
                lookahead_limit == get_lookahead_buffer_limit()
                history_size == get_history_buffer_size()
                lookahead_limit == get_lookahead_buffer_size()
                              
                buffer.size() == history_limit + lookahead_limit

                lookahead_buffer(i) == buffer[lookahead_limit-1-i]
                history_buffer(i) == buffer[lookahead_limit+i]
        !*/

    public:

        lz77_buffer_kernel_1 (
            unsigned long total_limit_,
            unsigned long lookahead_limit_  
        );

        virtual ~lz77_buffer_kernel_1 (
        ) {}

        void clear(
        );

        void add (
            unsigned char symbol
        );

        void find_match (
            unsigned long& index,
            unsigned long& length,
            unsigned long min_match_length
        );

        inline unsigned long get_history_buffer_limit (
        ) const { return history_limit; }

        inline unsigned long get_lookahead_buffer_limit (
        ) const { return lookahead_limit; }

        inline unsigned long get_history_buffer_size (
        ) const { return history_size; }

        inline unsigned long get_lookahead_buffer_size (
        ) const { return lookahead_size; }

        inline unsigned char lookahead_buffer (
            unsigned long index
        ) const { return buffer[lookahead_limit-1-index]; }

        inline unsigned char history_buffer (
            unsigned long index
        ) const { return buffer[lookahead_limit+index]; }


        inline void shift_buffers (
            unsigned long N
        ) { shift_buffer(N); }

    private:


        inline void shift_buffer (
            unsigned long N
        )
        /*!
            requires
                - N <= lookahead_size
            ensuers
                - #lookahead_size == lookahead_size - N
                - if (history_size+N < history_limit) then
                    - #history_size == history_size+N
                - else
                    - #history_size == history_limit
                - for all i where 0 <= i < N:
                  #history_buffer(N-1-i) == lookahead_buffer(i)
                - for all i where 0 <= i < #history_size-N:
                  #history_buffer(N+i) == history_buffer(i)
                - for all i where 0 <= i < #lookahead_size
                  #lookahead_buffer(i) == lookahead_buffer(N+i)                
        !*/
        {
            unsigned long temp = history_size+N;
            buffer.rotate_left(N);
            lookahead_size -= N;
            if (temp < history_limit)
                history_size = temp;
            else
                history_size = history_limit;
        }


        // member data        
        sliding_buffer buffer;
        unsigned long lookahead_limit;
        unsigned long history_limit;
        

        unsigned long lookahead_size;
        unsigned long history_size;


        // restricted functions
        lz77_buffer_kernel_1(lz77_buffer_kernel_1<sliding_buffer>&);        // copy constructor
        lz77_buffer_kernel_1<sliding_buffer>& operator=(lz77_buffer_kernel_1<sliding_buffer>&);    // assignment operator
    };   

// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------
    // member function definitions
// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------
    
    template <
        typename sliding_buffer
        >
    lz77_buffer_kernel_1<sliding_buffer>::
    lz77_buffer_kernel_1 (
        unsigned long total_limit_,
        unsigned long lookahead_limit_  
    ) :        
        lookahead_size(0), 
        history_size(0)
    {
        buffer.set_size(total_limit_);
        lookahead_limit = lookahead_limit_;
        history_limit = buffer.size() - lookahead_limit_;
    }

// ----------------------------------------------------------------------------------------
    
    template <
        typename sliding_buffer
        >
    void lz77_buffer_kernel_1<sliding_buffer>::
    clear(
    )
    {
        lookahead_size = 0;
        history_size = 0;
    }

// ----------------------------------------------------------------------------------------
    
    template <
        typename sliding_buffer
        >
    void lz77_buffer_kernel_1<sliding_buffer>::
    add (
        unsigned char symbol
    )
    {
        if (lookahead_size == lookahead_limit)
        {
            shift_buffer(1);            
        }
        buffer[lookahead_limit-1-lookahead_size] = symbol;
        ++lookahead_size;
    }

// ----------------------------------------------------------------------------------------
    
    template <
        typename sliding_buffer
        >
    void lz77_buffer_kernel_1<sliding_buffer>::
    find_match (
        unsigned long& index,
        unsigned long& length,
        unsigned long min_match_length
    )
    {
        unsigned long hpos = history_size;  // current position in the history buffer
        unsigned long lpos = 0;             // current position in the lookahead buffer

        unsigned long match_length = 0;   // the length of the longest match we find
        unsigned long match_index = 0;    // the index of the longest match we find

        // try to find a match
        while (hpos != 0)
        {
            --hpos;
            // if we are finding a match
            if (history_buffer(hpos) == lookahead_buffer(lpos))
            {
                ++lpos;   
                // if we have found a match that is as long as the lookahead buffer
                // then we are done
                if (lpos == lookahead_size)
                    break;
            }
            // else if we found the end of a match
            else if (lpos > 0)
            {
                // if this match is longer than the last match we saw
                if (lpos > match_length)
                {
                    match_length = lpos;
                    match_index = hpos + lpos;
                }
                lpos = 0;
            }
        } // while (hpos != 0)

        // if we found a match at the end of the loop that is greater than 
        // the match in match_index
        if (lpos > match_length)
        {
            match_length = lpos;
            match_index = hpos + lpos - 1;
        }


        // if we found a match that was long enough then report it
        if (match_length >= min_match_length)
        {
            shift_buffer(match_length);
            index = match_index;
            length = match_length;
        }
        else
        {
            length = 0;
        }
    }

// ----------------------------------------------------------------------------------------

}

#endif // DLIB_LZ77_BUFFER_KERNEl_1_

