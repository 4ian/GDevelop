// Copyright (C) 2003  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#ifndef DLIB_HASH_TABLE_KERNEl_2_
#define DLIB_HASH_TABLE_KERNEl_2_

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
        typename bst_base,
        typename mem_manager = default_memory_manager,
        typename compare = std::less<domain>
        >
    class hash_table_kernel_2 : public enumerable<map_pair<domain,range> >,
                                public pair_remover<domain,range>
    {

        /*!
            REQUIREMENTS ON bst_base
                bst_base is instantiated with domain and range and
                implements binray_search_tree/binary_search_tree_kernel_abstract.h

             INITIAL VALUE
                hash_size == 0
                table == pointer to an array of num_of_buckets bst_base objects
                num_of_buckets == the number of buckets in the hash table
                current_bucket == 0
                at_start_ == true

            CONVENTION
                current_element_valid() == (current_bucket != 0)
                element() == current_bucket->element()
                at_start_ == at_start()

                mask == num_of_buckets-1

                for all integers i where &table[i] != current_bucket
                    table[i].at_start() == true


                hash_size = size() == the number of elements in the hash_table and
                table == pointer to an array of num_of_buckets bst_base objects
                num_of_buckets == the number of buckets in the hash table and
                the elements in this hash table are stored in the bst_base objects in the
                array table

        !*/
        

 
        public:

            typedef domain domain_type;
            typedef range range_type;
            typedef compare compare_type;
            typedef mem_manager mem_manager_type;

            explicit hash_table_kernel_2(
                unsigned long expnum
            );

            virtual ~hash_table_kernel_2(
            )
            { pool.deallocate_array(table); }

            void clear(
            );

            unsigned long count (
                const domain& item
            ) const;

            inline void add (
                domain& d,
                range& r
            );

            void destroy (
                const domain& d
            );

            void remove (
                const domain& d,
                domain& d_copy,
                range& r
            );

            const range* operator[] (
                const domain& item
            ) const;

            range* operator[] (
                const domain& item
            );

            inline void swap (
                hash_table_kernel_2& item
            );

            // functions from the remover interface
            void remove_any (
                domain& d,
                range& r
            );

            // functions from the enumerable interface
            inline unsigned long size (
            ) const;

            inline bool at_start (
            ) const;

            inline void reset (
            ) const;

            bool current_element_valid (
            ) const;

            inline const map_pair<domain,range>& element (
            ) const;

            inline map_pair<domain,range>& element (
            );

            bool move_next (
            ) const;

        private:

            // data members   
            typename mem_manager::template rebind<bst_base>::other pool;         
            unsigned long mask;
            unsigned long hash_size;
            unsigned long num_of_buckets;
            bst_base* table;
            general_hash<domain> hash;
            mutable bst_base* current_bucket;
            mutable bool at_start_;
            compare comp;

            // restricted functions
            hash_table_kernel_2(hash_table_kernel_2&);      
            hash_table_kernel_2& operator=(hash_table_kernel_2&);

    };

    template <
        typename domain,
        typename range,
        typename bst_base,
        typename mem_manager,
        typename compare
        >
    inline void swap (
        hash_table_kernel_2<domain,range,bst_base,mem_manager,compare>& a, 
        hash_table_kernel_2<domain,range,bst_base,mem_manager,compare>& b 
    ) { a.swap(b); }

    template <
        typename domain,
        typename range,
        typename bst_base,
        typename mem_manager,
        typename compare
        >
    void deserialize (
        hash_table_kernel_2<domain,range,bst_base,mem_manager,compare>& item, 
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
            throw serialization_error(e.info + "\n   while deserializing object of type hash_table_kernel_2"); 
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
        typename bst_base,
        typename mem_manager,
        typename compare
        >
    hash_table_kernel_2<domain,range,bst_base,mem_manager,compare>::
    hash_table_kernel_2(
        unsigned long expnum
    ) :
        hash_size(0),
        current_bucket(0),
        at_start_(true)
    {

        num_of_buckets = 1;
        while (expnum != 0)
        {
            --expnum;
            num_of_buckets <<= 1;            
        }
        mask = num_of_buckets-1;

        table = pool.allocate_array(num_of_buckets);
    }

// ----------------------------------------------------------------------------------------

    template <
        typename domain,
        typename range,
        typename bst_base,
        typename mem_manager,
        typename compare
        >
    void hash_table_kernel_2<domain,range,bst_base,mem_manager,compare>::
    clear(
    )
    {
        if (hash_size != 0)
        {
            hash_size = 0;
            for (unsigned long i = 0; i < num_of_buckets; ++i)
                table[i].clear();
        }
        // reset the enumerator
        reset();
    }

// ----------------------------------------------------------------------------------------

    template <
        typename domain,
        typename range,
        typename bst_base,
        typename mem_manager,
        typename compare
        >
    unsigned long hash_table_kernel_2<domain,range,bst_base,mem_manager,compare>::
    size(
    ) const
    {
        return hash_size;
    }
// ----------------------------------------------------------------------------------------

    template <
        typename domain,
        typename range,
        typename bst_base,
        typename mem_manager,
        typename compare
        >
    unsigned long hash_table_kernel_2<domain,range,bst_base,mem_manager,compare>::
    count(
        const domain& item
    ) const
    {
        return table[hash(item)&mask].count(item);
    }

// ----------------------------------------------------------------------------------------

    template <
        typename domain,
        typename range,
        typename bst_base,
        typename mem_manager,
        typename compare
        >
    void hash_table_kernel_2<domain,range,bst_base,mem_manager,compare>::
    destroy(
        const domain& item
    ) 
    {
        table[hash(item)&mask].destroy(item);
        --hash_size;

        // reset the enumerator
        reset();
    }

// ----------------------------------------------------------------------------------------

    template <
        typename domain,
        typename range,
        typename bst_base,
        typename mem_manager,
        typename compare
        >
    void hash_table_kernel_2<domain,range,bst_base,mem_manager,compare>::
    add(
        domain& d,
        range& r
    )
    {
        table[hash(d)&mask].add(d,r);
        ++hash_size;

        // reset the enumerator
        reset();
    }

// ----------------------------------------------------------------------------------------

    template <
        typename domain,
        typename range,
        typename bst_base,
        typename mem_manager,
        typename compare
        >
    void hash_table_kernel_2<domain,range,bst_base,mem_manager,compare>::
    remove(
        const domain& d,
        domain& d_copy,
        range& r
    )
    {
        table[hash(d)&mask].remove(d,d_copy,r);
        --hash_size;

        // reset the enumerator
        reset();
    }

// ----------------------------------------------------------------------------------------

    template <
        typename domain,
        typename range,
        typename bst_base,
        typename mem_manager,
        typename compare
        >
    void hash_table_kernel_2<domain,range,bst_base,mem_manager,compare>::
    remove_any(
        domain& d,
        range& r
    )
    {
        unsigned long i = 0;
        while (table[i].size() == 0)
        {
            ++i;
        }
        table[i].remove_any(d,r);
        --hash_size;

        // reset the enumerator
        reset();
    }

// ----------------------------------------------------------------------------------------

    template <
        typename domain,
        typename range,
        typename bst_base,
        typename mem_manager,
        typename compare
        >
    const range* hash_table_kernel_2<domain,range,bst_base,mem_manager,compare>::
    operator[](
        const domain& d
    ) const
    {
        return table[hash(d)&mask][d];
    }

// ----------------------------------------------------------------------------------------

    template <
        typename domain,
        typename range,
        typename bst_base,
        typename mem_manager,
        typename compare
        >
    range* hash_table_kernel_2<domain,range,bst_base,mem_manager,compare>::
    operator[](
        const domain& d
    )
    {
        return table[hash(d)&mask][d];
    }

// ----------------------------------------------------------------------------------------

    template <
        typename domain,
        typename range,
        typename bst_base,
        typename mem_manager,
        typename compare
        >
    void hash_table_kernel_2<domain,range,bst_base,mem_manager,compare>::
    swap(
        hash_table_kernel_2<domain,range,bst_base,mem_manager,compare>& item
    )
    {
        pool.swap(item.pool);
        exchange(mask,item.mask);
        exchange(hash_size,item.hash_size);
        exchange(num_of_buckets,item.num_of_buckets);
        exchange(table,item.table);
        exchange(current_bucket,item.current_bucket);
        exchange(at_start_,item.at_start_);        
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
        typename bst_base,
        typename mem_manager,
        typename compare
        >
    bool hash_table_kernel_2<domain,range,bst_base,mem_manager,compare>::
    at_start (
    ) const
    {
        return at_start_;
    }

// ----------------------------------------------------------------------------------------

    template <
        typename domain,
        typename range,
        typename bst_base,
        typename mem_manager,
        typename compare
        >
    void hash_table_kernel_2<domain,range,bst_base,mem_manager,compare>::
    reset (
    ) const
    {
        at_start_ = true;
        if (current_bucket != 0)
        {
            current_bucket->reset();
            current_bucket = 0;
        }
    }

// ----------------------------------------------------------------------------------------

    template <
        typename domain,
        typename range,
        typename bst_base,
        typename mem_manager,
        typename compare
        >
    bool hash_table_kernel_2<domain,range,bst_base,mem_manager,compare>::
    current_element_valid (
    ) const
    {
        return (current_bucket != 0);
    }

// ----------------------------------------------------------------------------------------

    template <
        typename domain,
        typename range,
        typename bst_base,
        typename mem_manager,
        typename compare
        >
    const map_pair<domain,range>& hash_table_kernel_2<domain,range,bst_base,mem_manager,compare>::
    element (
    ) const
    {
        return current_bucket->element();
    }

// ----------------------------------------------------------------------------------------

    template <
        typename domain,
        typename range,
        typename bst_base,
        typename mem_manager,
        typename compare
        >
    map_pair<domain,range>& hash_table_kernel_2<domain,range,bst_base,mem_manager,compare>::
    element (
    )
    {
        return current_bucket->element();
    }

// ----------------------------------------------------------------------------------------

    template <
        typename domain,
        typename range,
        typename bst_base,
        typename mem_manager,
        typename compare
        >
    bool hash_table_kernel_2<domain,range,bst_base,mem_manager,compare>::
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
                current_bucket = table;
                while (current_bucket->size() == 0)
                {
                    ++current_bucket;
                }

                current_bucket->move_next();
                
                return true;
            }
        }
        else
        {
            // if we have already enumerated every element
            if (current_bucket == 0)
            {
                return false;
            }
            else
            {
                if (current_bucket->move_next())
                {
                    // if there is another element in this current bucket then use that
                    return true;
                }
                else
                {
                    // find the next bucket
                    bst_base* end = table + num_of_buckets;
                    current_bucket->reset();
                    
                    while (true)
                    {   
                        ++current_bucket;
                        // if we ran out of buckets and didn't find anything
                        if (current_bucket == end)
                        {
                            current_bucket = 0;
                            return false;
                        }
                        if (current_bucket->size() > 0)
                        {
                            current_bucket->move_next();
                            return true;
                        }
                    }
                }
            }
        }
    }
    
// ----------------------------------------------------------------------------------------

}

#endif // DLIB_HASH_TABLE_KERNEl_2_

