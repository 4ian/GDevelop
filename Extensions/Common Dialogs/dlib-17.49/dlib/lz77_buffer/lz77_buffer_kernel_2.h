// Copyright (C) 2004  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#ifndef DLIB_LZ77_BUFFER_KERNEl_2_
#define DLIB_LZ77_BUFFER_KERNEl_2_

#include "lz77_buffer_kernel_abstract.h"
#include "../algs.h"



namespace dlib
{

    template <
        typename sliding_buffer
        >
    class lz77_buffer_kernel_2 
    {
        /*!
            REQUIREMENTS ON sliding_buffer
                sliding_buffer must be an implementation of sliding_buffer/sliding_buffer_kernel_abstract.h
                and must be instantiated to contain unsigned char data

            INITIAL VALUE
                history_limit == defined by constructor arguments
                lookahead_limit == defined by constructor arguments
                history_size == 0
                lookahead_size == 0
                buffer.size() == history_limit + lookahead_limit
                buffer[i] == 0 for all valid i

                nodes == an array of history_limit-3 nodes
                id_table == an array of buffer.size() pointers
                hash_table == an array of buffer.size() pointers and all are set to 0
                mask == buffer.size() - 1
                next_free_node == 0


            CONVENTION           
                history_limit == get_history_buffer_limit()
                lookahead_limit == get_lookahead_buffer_limit()
                history_size == get_history_buffer_size()
                lookahead_limit == get_lookahead_buffer_size()
                              
                buffer.size() == history_limit + lookahead_limit

                lookahead_buffer(i) == buffer[lookahead_limit-1-i]
                history_buffer(i) == buffer[lookahead_limit+i]


                hash_table[hash(a,b,c,d)] points to the head of a linked list.
                    Each node in this linked list tells the location in the buffer
                    of a string that begins with abcd or a string who's first four
                    letters have the same hash.  The linked list is terminated by a
                    node with a null next pointer.

                hash_table[i] == 0 if there is no linked list for this element of the hash
                    table.

                each node in the hash table is allocated from the array nodes.
                When adding a node to hash_table:
                    if (if all nodes aren't already in the hash_table) then
                    {
                        the next node to use is nodes[next_free_node].                
                    }
                    else
                    {
                        recycle nodes from the hash_table itself.  This works because
                        when we add new nodes we also have to remove nodes.
                    }

                if (there is a node defined with an id of i) then
                {
                    if (id_table[i] != 0) then
                        id_table[i]->next->id == i
                    else
                        hash_table[some_hash]->id == i
                }
        !*/

    public:

        lz77_buffer_kernel_2 (
            unsigned long total_limit_,
            unsigned long lookahead_limit_  
        );

        virtual ~lz77_buffer_kernel_2 (
        );

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

        inline unsigned long hash (
            unsigned char a,
            unsigned char b,
            unsigned char c,
            unsigned char d
        ) const
        /*!
            ensures
                - returns a hash of the 4 arguments and the hash is in the range
        !*/
        {
            unsigned long B = b << 3;
            unsigned long C = c << 6;
            unsigned long D = d << 9;

            unsigned long temp = a + B;
            temp += C;
            temp += D;

            return (temp&mask); /**/
        }

        void shift_buffer (
            unsigned long N
        );
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



        // member data        
        sliding_buffer buffer;
        unsigned long lookahead_limit;
        unsigned long history_limit;

        struct node
        {
            unsigned long id;
            node* next;
        };
        
        node** hash_table;
        node* nodes;
        node** id_table;
        unsigned long next_free_node;
        unsigned long mask;

        unsigned long lookahead_size;
        unsigned long history_size;


        // restricted functions
        lz77_buffer_kernel_2(lz77_buffer_kernel_2<sliding_buffer>&);        // copy constructor
        lz77_buffer_kernel_2<sliding_buffer>& operator=(lz77_buffer_kernel_2<sliding_buffer>&);    // assignment operator
    };   

// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------
    // member function definitions
// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------
    
    template <
        typename sliding_buffer
        >
    lz77_buffer_kernel_2<sliding_buffer>::
    lz77_buffer_kernel_2 (
        unsigned long total_limit_,
        unsigned long lookahead_limit_  
    ) :        
        lookahead_size(0),       
        history_size(0)
    {
        buffer.set_size(total_limit_);
        lookahead_limit = lookahead_limit_;
        history_limit = buffer.size() - lookahead_limit_;

        nodes = new node[history_limit-3];

        try { id_table = new node*[buffer.size()]; }
        catch (...) { delete [] nodes; throw; }

        try { hash_table = new node*[buffer.size()]; }
        catch (...) { delete [] id_table; delete [] nodes; throw; }

        mask = buffer.size()-1;
        next_free_node = 0;

            
        node** start = hash_table;
        node** end = hash_table + buffer.size();
        while (start != end)
        {
            *start = 0;
            ++start;
        }

        for (unsigned long i = 0; i < buffer.size(); ++i)
            buffer[i] = 0;

    }

// ----------------------------------------------------------------------------------------

    template <
        typename sliding_buffer
        >
    lz77_buffer_kernel_2<sliding_buffer>::
    ~lz77_buffer_kernel_2 (
    )      
    {
        delete [] nodes;
        delete [] hash_table;
        delete [] id_table;
    }

// ----------------------------------------------------------------------------------------
    
    template <
        typename sliding_buffer
        >
    void lz77_buffer_kernel_2<sliding_buffer>::
    clear(
    )
    {
        lookahead_size = 0;
        history_size = 0;
        next_free_node = 0;

        node** start = hash_table;
        node** end = hash_table + buffer.size();
        while (start != end)
        {
            *start = 0;
            ++start;
        }
    }

// ----------------------------------------------------------------------------------------
      
    template <
        typename sliding_buffer
        >      
    void lz77_buffer_kernel_2<sliding_buffer>::
    shift_buffer (
        unsigned long N
    )        
    {
        unsigned long old_history_size = history_size;
        unsigned long temp = history_size+N;    
        unsigned long new_nodes; // the number of nodes to pull from the nodes array
        unsigned long recycled_nodes; // the number of nodes to pull from hash_table
        lookahead_size -= N;
        if (temp <= history_limit)
        {               
            if (history_size <= 3)
            {
                if ((3-history_size) >= N)
                    new_nodes = 0;
                else
                    new_nodes = N - (3-history_size);
            }
            else
            {
                new_nodes = N;
            }
                
            recycled_nodes = 0;
            history_size = temp;
        }
        else
        {
            if (history_size != history_limit)
            {
                new_nodes = history_limit - history_size;
                recycled_nodes = temp - history_limit;
                history_size = history_limit;                
            }
            else
            {
                new_nodes = 0;
                recycled_nodes = N;
            }
        }

        unsigned long i = lookahead_limit + 2;
    
        // if there are any "new" nodes to add to the hash table 
        if (new_nodes != 0)
        {
            unsigned long stop = i - new_nodes;             
            for (; i > stop; --i)
            {
                nodes[next_free_node].next = 0;
                nodes[next_free_node].id = buffer.get_element_id(i);
                id_table[nodes[next_free_node].id] = 0;

                unsigned long new_hash = hash(buffer[i],buffer[i-1],buffer[i-2],buffer[i-3]);

                if (hash_table[new_hash] != 0)
                    id_table[hash_table[new_hash]->id] = &nodes[next_free_node];
                nodes[next_free_node].next = hash_table[new_hash];
                hash_table[new_hash] = &nodes[next_free_node];

                ++next_free_node;                
            }
        } // if (new_nodes != 0)


    
        unsigned long stop = i - recycled_nodes;     
        unsigned long old = old_history_size-1+lookahead_limit;
        for (; i > stop; --i)
        {            
            // find the next node to recycle in hash_table
            node* recycled_node;
            
            
            unsigned long old_id = buffer.get_element_id(old);
            
            // find the node with id old_id  
            if (id_table[old_id] == 0)
            {
                unsigned long old_hash = hash(buffer[old],buffer[old-1],buffer[old-2],buffer[old-3]);
                recycled_node = hash_table[old_hash];

                // fill the gap left by removing this node
                hash_table[old_hash] = recycled_node->next;
            }
            else
            {
                recycled_node = id_table[old_id]->next;

                // fill the gap left by removing this node
                id_table[old_id]->next = recycled_node->next;
            }

            --old;






            recycled_node->next = 0;
            recycled_node->id = buffer.get_element_id(i);
            id_table[recycled_node->id] = 0;

            unsigned long new_hash = hash(buffer[i],buffer[i-1],buffer[i-2],buffer[i-3]);

            if (hash_table[new_hash] != 0) 
                id_table[hash_table[new_hash]->id] = recycled_node;

            recycled_node->next = hash_table[new_hash];
            hash_table[new_hash] = recycled_node;
       
        } // for (; i > stop; --i)




        buffer.rotate_left(N);
    }

// ----------------------------------------------------------------------------------------

    template <
        typename sliding_buffer
        >
    void lz77_buffer_kernel_2<sliding_buffer>::
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
    void lz77_buffer_kernel_2<sliding_buffer>::
    find_match (
        unsigned long& index,
        unsigned long& length,
        unsigned long min_match_length
    )
    {
        unsigned long match_length = 0;   // the length of the longest match we find
        unsigned long match_index = 0;    // the index of the longest match we find

 
        const unsigned long hash_value = hash(lookahead_buffer(0),
                                              lookahead_buffer(1),
                                              lookahead_buffer(2),
                                              lookahead_buffer(3)
                                              );


 
        node* temp = hash_table[hash_value];
        while (temp != 0)
        {             
            // current position in the history buffer
            unsigned long hpos = buffer.get_element_index(temp->id)-lookahead_limit;  
            // current position in the lookahead buffer
            unsigned long lpos = 0;             

            // find length of this match
            while (history_buffer(hpos) == lookahead_buffer(lpos))
            {
                ++lpos;
                if (hpos == 0)
                    break;
                --hpos;
                if (lpos == lookahead_size)
                    break;                    
            }

            if (lpos > match_length)
            {
                match_length = lpos;
                match_index = buffer.get_element_index(temp->id)-lookahead_limit;
                // if this is the longest possible match then stop looking
                if (lpos == lookahead_limit)
                    break;
            }
            

            temp = temp->next;
        } // while (temp != 0)




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

#endif // DLIB_LZ77_BUFFER_KERNEl_2_

