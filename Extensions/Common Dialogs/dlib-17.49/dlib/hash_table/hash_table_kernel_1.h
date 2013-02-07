// Copyright (C) 2003  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#ifndef DLIB_HASH_TABLE_KERNEl_1_
#define DLIB_HASH_TABLE_KERNEl_1_

#include "hash_table_kernel_abstract.h"
#include "../general_hash/general_hash.h"
#include "../algs.h"
#include "../interfaces/map_pair.h"
#include "../interfaces/enumerable.h"
#include "../interfaces/remover.h"
#include "../assert.h"
#include "../serialize.h"
#include <functional>


namespace dlib 
{

    template <
        typename domain,
        typename range,
        typename mem_manager = default_memory_manager,
        typename compare = std::less<domain>
        >
    class hash_table_kernel_1 : public enumerable<map_pair<domain, range> >,
                                public pair_remover<domain,range>
    {

        /*!
            INITIAL VALUE
                hash_size == 0
                table == pointer to an array of num_of_buckets node pointers
                num_of_buckets == the number of buckets in the hash table
                current_element == 0
                at_start_ == true
                mask == num_of_buckets-1

            CONVENTION
                current_element_valid() == (current_element != 0)
                element() == current_element->d and current_element->r
                at_start_ == at_start()
                if (current_element != 0) then
                    table[current_bucket] == a pointer to the linked list that contains
                                             the node pointed to by current_element

                mask == num_of_buckets-1



                hash_size = size() == the number of elements in the hash_table and
                table == pointer to an array of num_of_buckets node pointers and
                num_of_buckets == the number of buckets in the hash table and
                for all i:
                    table[i] == pointer to the first node in a linked list or
                    table[i] == 0 if this bucket is currently not in use
                        

                for all nodes:
                    d == the domain element stored in this node
                    r == the range element stored in this node which is associated with
                         d.
                    next == pointer to the next node in the linked list or
                    next == 0 if this is the last node in the linked list

        !*/

        struct node
        {
            node* next;
            domain d;
            range r;
        };


        class mpair : public map_pair<domain,range>
        {
        public:
            const domain* d;
            range* r;

            const domain& key( 
            ) const { return *d; }

            const range& value(
            ) const { return *r; }

            range& value(
            ) { return *r; }
        };


        public:

            typedef domain domain_type;
            typedef range range_type;
            typedef compare compare_type;
            typedef mem_manager mem_manager_type;

            explicit hash_table_kernel_1(
                unsigned long expnum
            );

            virtual ~hash_table_kernel_1(
            ); 

            void clear(
            );

            unsigned long count (
                const domain& item
            ) const;

            void add (
                domain& d,
                range& r
            );

            void remove (
                const domain& d,
                domain& d_copy,
                range& r
            );

            void destroy (
                const domain& d
            );

            const range* operator[] (
                const domain& d
            ) const;

            range* operator[] (
                const domain& d
            );

            void swap (
                hash_table_kernel_1& item
            );

            // functions from the remover interface
            void remove_any (
                domain& d,
                range& r
            );

            // functions from the enumerable interface
            inline unsigned long size (
            ) const;

            bool at_start (
            ) const;

            inline void reset (
            ) const;

            bool current_element_valid (
            ) const;

            const map_pair<domain,range>& element (
            ) const;

            map_pair<domain,range>& element (
            );

            bool move_next (
            ) const;

        private:

            // data members
            typename mem_manager::template rebind<node>::other pool;         
            typename mem_manager::template rebind<node*>::other ppool;         
            unsigned long hash_size;
            node** table;
            general_hash<domain> hash;
            unsigned long num_of_buckets;
            unsigned long mask;
            
            mutable mpair p;

            mutable unsigned long current_bucket;
            mutable node* current_element;
            mutable bool at_start_;
            compare comp;

            // restricted functions
            hash_table_kernel_1(hash_table_kernel_1&);      
            hash_table_kernel_1& operator=(hash_table_kernel_1&);

    };

    template <
        typename domain,
        typename range,
        typename mem_manager,
        typename compare
        >
    inline void swap (
        hash_table_kernel_1<domain,range,mem_manager,compare>& a, 
        hash_table_kernel_1<domain,range,mem_manager,compare>& b 
    ) { a.swap(b); }

    template <
        typename domain,
        typename range,
        typename mem_manager,
        typename compare
        >
    void deserialize (
        hash_table_kernel_1<domain,range,mem_manager,compare>& item, 
        std::istream& in
    )
    {
        try
        {
            item.clear();
            unsigned long size;
            deserialize(size,in);
            domain d;
            range r;
            for (unsigned long i = 0; i < size; ++i)
            {
                deserialize(d,in);
                deserialize(r,in);
                item.add(d,r);
            }
        }
        catch (serialization_error e)
        { 
            item.clear();
            throw serialization_error(e.info + "\n   while deserializing object of type hash_table_kernel_1"); 
        }
    }

// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------
    // member function definitions
// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------

    template <
        typename domain,
        typename range,
        typename mem_manager,
        typename compare
        >
    hash_table_kernel_1<domain,range,mem_manager,compare>::
    hash_table_kernel_1(
        unsigned long expnum
    ) :
        hash_size(0),
        current_element(0),
        at_start_(true)
    {

        num_of_buckets = 1;
        while (expnum != 0)
        {
            --expnum;
            num_of_buckets <<= 1;            
        }
        mask = num_of_buckets-1;

        table = ppool.allocate_array(num_of_buckets);
        for (unsigned long i = 0; i < num_of_buckets; ++i)
        {
            table[i] = 0;
        }
    }

// ----------------------------------------------------------------------------------------

    template <
        typename domain,
        typename range,
        typename mem_manager,
        typename compare
        >
    hash_table_kernel_1<domain,range,mem_manager,compare>::
    ~hash_table_kernel_1(
    )
    {
        for (unsigned long i = 0; i < num_of_buckets; ++i)
        {
            // delete this linked list
            node* temp = table[i];
            while (temp)
            {
                node* t = temp;
                temp = temp->next;
                pool.deallocate(t);                    
            }
            table[i] = 0;
        }
        ppool.deallocate_array(table);
    }

// ----------------------------------------------------------------------------------------

    template <
        typename domain,
        typename range,
        typename mem_manager,
        typename compare
        >
    void hash_table_kernel_1<domain,range,mem_manager,compare>::
    clear(
    )
    {
        if (hash_size > 0)
        {
            for (unsigned long i = 0; i < num_of_buckets; ++i)
            {
                // delete this linked list
                node* temp = table[i];
                while (temp)
                {
                    node* t = temp;
                    temp = temp->next;
                    pool.deallocate(t);                    
                }
                table[i] = 0;
            }            
            hash_size = 0;
        }
        // reset the enumerator
        reset();
    }

// ----------------------------------------------------------------------------------------

    template <
        typename domain,
        typename range,
        typename mem_manager,
        typename compare
        >
    unsigned long hash_table_kernel_1<domain,range,mem_manager,compare>::
    size(
    ) const
    {
        return hash_size;
    }

// ----------------------------------------------------------------------------------------
 
    template <
        typename domain,
        typename range,
        typename mem_manager,
        typename compare
        >
    unsigned long hash_table_kernel_1<domain,range,mem_manager,compare>::
    count(
        const domain& d
    ) const
    {
        unsigned long items_found = 0;
        node* temp = table[hash(d)&mask];

        while (temp != 0)
        {
            // look for an element equivalent to d
            if ( !(comp(temp->d , d) || comp(d , temp->d)) )
            {
                ++items_found;                
            }
            temp = temp->next;
        }      

        return items_found;
    }

// ----------------------------------------------------------------------------------------
    
    template <
        typename domain,
        typename range,
        typename mem_manager,
        typename compare
        >
    void hash_table_kernel_1<domain,range,mem_manager,compare>::
    add(
        domain& d,
        range& r
    )
    {
        unsigned long hash_value = hash(d)&mask;
        
        // make a new node for this item
        node& temp = *(pool.allocate());
        exchange(d,temp.d);
        exchange(r,temp.r);
        
        // add this new node to the head of the linked list in bucket number hash_value
        temp.next = table[hash_value];
        table[hash_value] = &temp;
        
        ++hash_size;

        // reset the enumerator
        reset();
    }

// ----------------------------------------------------------------------------------------

    template <
        typename domain,
        typename range,
        typename mem_manager,
        typename compare
        >
    void hash_table_kernel_1<domain,range,mem_manager,compare>::
    destroy(
        const domain& d
    )
    {
        node* last;
        const unsigned long hash_value = hash(d)&mask;
        node* temp = table[hash_value];
        
        // if there is more than one thing in this bucket
        if (temp->next != 0)
        {
            // start looking with the second item in the list
            last = temp;
            temp = temp->next;
            while (true)
            {
                // if we hit the end of the list without finding item then it must
                // be the first element in the list so splice it out
                if (temp == 0)
                {
                    temp = table[hash_value];
                    table[hash_value] = temp->next;

                    break;
                }

                // look for an element equivalent to item
                if ( !(comp(temp->d , d) || comp(d , temp->d)) )
                {
                    // splice out the node we want to remove
                    last->next = temp->next;
                    break;
                }
    
                last = temp;
                temp = temp->next;
            }

        }
        // else there is only one node in this linked list
        else
        {
            table[hash_value] = 0;
        }

        pool.deallocate(temp);

        --hash_size;

        // reset the enumerator
        reset();
    }

// ----------------------------------------------------------------------------------------

    template <
        typename domain,
        typename range,
        typename mem_manager,
        typename compare
        >
    void hash_table_kernel_1<domain,range,mem_manager,compare>::
    remove(
        const domain& d,
        domain& d_copy,
        range& r
    )
    {
        node* last;
        const unsigned long hash_value = hash(d)&mask;
        node* temp = table[hash_value];
        
        // if there is more than one thing in this bucket
        if (temp->next != 0)
        {
            // start looking with the second item in the list
            last = temp;
            temp = temp->next;
            while (true)
            {
                // if we hit the end of the list without finding item then it must
                // be the first element in the list so splice it out
                if (temp == 0)
                {
                    temp = table[hash_value];
                    table[hash_value] = temp->next;

                    break;
                }

                // look for an element equivalent to item
                if ( !(comp(temp->d , d) || comp(d , temp->d)) )
                {
                    // splice out the node we want to remove
                    last->next = temp->next;
                    break;
                }
    
                last = temp;
                temp = temp->next;
            }

        }
        // else there is only one node in this linked list
        else
        {
            table[hash_value] = 0;
        }

        
        exchange(d_copy,temp->d);
        exchange(r,temp->r);
        pool.deallocate(temp);

        --hash_size;

        // reset the enumerator
        reset();
    }

// ----------------------------------------------------------------------------------------

    template <
        typename domain,
        typename range,
        typename mem_manager,
        typename compare
        >
    void hash_table_kernel_1<domain,range,mem_manager,compare>::
    remove_any(
        domain& d,
        range& r
    )
    {
        unsigned long i = 0;

        // while the ith bucket is empty keep looking
        while (table[i] == 0)
        {
            ++i;
        }

        // remove the first node in the linked list in the ith bucket
        node& temp = *(table[i]);

        exchange(temp.d,d);
        exchange(temp.r,r);
        table[i] = temp.next;
        
        pool.deallocate(&temp);        

        --hash_size;

        // reset the enumerator
        reset();
    }

// ----------------------------------------------------------------------------------------

    template <
        typename domain,
        typename range,
        typename mem_manager,
        typename compare
        >
    const range* hash_table_kernel_1<domain,range,mem_manager,compare>::
    operator[](
        const domain& d
    ) const
    {        
        node* temp = table[hash(d)&mask];

        while (temp != 0)
        {
            // look for an element equivalent to item
            if ( !(comp(temp->d , d) || comp(d , temp->d)) )
                return &(temp->r);             

            temp = temp->next;
        }      

        return 0;
    }

// ----------------------------------------------------------------------------------------

    template <
        typename domain,
        typename range,
        typename mem_manager,
        typename compare
        >
    range* hash_table_kernel_1<domain,range,mem_manager,compare>::
    operator[](
        const domain& d
    )
    {
        node* temp = table[hash(d)&mask];

        while (temp != 0)
        {
            // look for an element equivalent to item
            if ( !(comp(temp->d , d) || comp(d , temp->d)) )
                return &(temp->r);             

            temp = temp->next;
        }      

        return 0;
    }

// ----------------------------------------------------------------------------------------

    template <
        typename domain,
        typename range,
        typename mem_manager,
        typename compare
        >
    void hash_table_kernel_1<domain,range,mem_manager,compare>::
    swap(
        hash_table_kernel_1<domain,range,mem_manager,compare>& item
    )
    {
        exchange(mask,item.mask);
        exchange(table,item.table);
        exchange(hash_size,item.hash_size);
        exchange(num_of_buckets,item.num_of_buckets);
        exchange(current_bucket,item.current_bucket);
        exchange(current_element,item.current_element);
        exchange(at_start_,item.at_start_);
        pool.swap(item.pool);
        ppool.swap(item.ppool);
        exchange(p,item.p);
        exchange(comp,item.comp);
    }

// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------
    // enumerable function definitions
// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------

    template <
        typename domain,
        typename range,
        typename mem_manager,
        typename compare
        >
    bool hash_table_kernel_1<domain,range,mem_manager,compare>::
    at_start (
    ) const
    {
        return at_start_;
    }

// ----------------------------------------------------------------------------------------

    template <
        typename domain,
        typename range,
        typename mem_manager,
        typename compare
        >
    void hash_table_kernel_1<domain,range,mem_manager,compare>::
    reset (
    ) const
    {
        at_start_ = true;
        current_element = 0;
    }

// ----------------------------------------------------------------------------------------

    template <
        typename domain,
        typename range,
        typename mem_manager,
        typename compare
        >
    bool hash_table_kernel_1<domain,range,mem_manager,compare>::
    current_element_valid (
    ) const
    {
        return (current_element != 0);
    }

// ----------------------------------------------------------------------------------------

    template <
        typename domain,
        typename range,
        typename mem_manager,
        typename compare
        >
    const map_pair<domain,range>& hash_table_kernel_1<domain,range,mem_manager,compare>::
    element (
    ) const
    {
        p.d = &(current_element->d);
        p.r = &(current_element->r);
        return p;
    }

// ----------------------------------------------------------------------------------------

    template <
        typename domain,
        typename range,
        typename mem_manager,
        typename compare
        >
    map_pair<domain,range>& hash_table_kernel_1<domain,range,mem_manager,compare>::
    element (
    )
    {
        p.d = &(current_element->d);
        p.r = &(current_element->r);
        return p;
    }

// ----------------------------------------------------------------------------------------

    template <
        typename domain,
        typename range,
        typename mem_manager,
        typename compare
        >
    bool hash_table_kernel_1<domain,range,mem_manager,compare>::
    move_next (
    ) const
    {
        if (at_start_)
        {
            at_start_ = false;
            // if the queue is empty then there is nothing to do
            if (hash_size == 0)
            {
                return false;
            }
            else
            {
                // find the first element in the hash table
                for (current_bucket = 0; true ; ++current_bucket)
                {
                    if (table[current_bucket] != 0)
                    {
                        current_element = table[current_bucket];
                        break;
                    }
                }
                return true;
            }
        }
        else
        {
            // if we have already enumerated every element
            if (current_element == 0)
            {
                return false;
            }
            else
            {
                // find the next element if it exists
                if (current_element->next != 0)
                {
                    current_element = current_element->next;
                    return true;
                }
                else
                {
                    // find next bucket with something in it
                    for (current_bucket+=1; current_bucket<num_of_buckets; ++current_bucket)
                    {
                        if (table[current_bucket] != 0)
                        {
                            // we just found the next bucket
                            current_element = table[current_bucket];
                            break;
                        }
                    }
                    // make sure we actually found another nonempty bucket
                    if (current_bucket == num_of_buckets)
                    {
                        // we didn't find anything
                        current_element = 0;
                        return false;
                    }
                    else
                    {
                        // we found another bucket
                        return true;
                    }
                }
            }
        }
    }
    
// ----------------------------------------------------------------------------------------

}

#endif // DLIB_HASH_TABLE_KERNEl_1_

