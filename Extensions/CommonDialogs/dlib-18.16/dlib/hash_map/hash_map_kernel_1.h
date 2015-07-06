// Copyright (C) 2003  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#ifndef DLIB_HASH_MAP_KERNEl_1_
#define DLIB_HASH_MAP_KERNEl_1_

#include "hash_map_kernel_abstract.h"
#include "../algs.h"
#include "../general_hash/general_hash.h"
#include "../interfaces/enumerable.h"
#include "../interfaces/map_pair.h"
#include "../interfaces/remover.h"
#include "../assert.h"
#include "../serialize.h"

namespace dlib
{

    template <
        typename domain,
        typename range,
        unsigned long expnum,
        typename hash_table,
        typename mem_manager = default_memory_manager
        >
    class hash_map_kernel_1 : public enumerable<map_pair<domain,range> >,
                              public pair_remover<domain,range>
    {

        /*!
            REQUIREMENTS ON hash_table
                hash_table is instantiated with domain and range and
                T_is_POD must be set to false and
                implements hash_table/hash_table_kernel_abstract.h

            INITIAL VALUE
                table.size() == 0

            CONVENTION
                table.size() = size() == the number of elements in the map 
                the elements in this hash_map are stored in table
        !*/
        

        public:

            typedef domain domain_type;
            typedef range range_type;
            typedef typename hash_table::compare_type compare_type;
            typedef mem_manager mem_manager_type;

            hash_map_kernel_1(
            ) :
                table(expnum)
            {
                COMPILE_TIME_ASSERT(expnum < 32);
            }

            virtual ~hash_map_kernel_1(
            )
            {}

            inline void clear(
            );            

            void add (
                domain& d,
                range& r
            );

            inline bool is_in_domain (
                const domain& d
            ) const;

            void remove (
                const domain& d,
                domain& d_copy,
                range& r
            );
 
            void destroy (
                const domain& d
            );
 
            range& operator[] (
                const domain& d
            );

            const range& operator[] (
                const domain& d
            ) const;

            inline void swap (
                hash_map_kernel_1& item
            );

            // functions from the remover interface
            inline void remove_any (
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

            inline bool current_element_valid (
            ) const;

            inline const map_pair<domain,range>& element (
            ) const;

            inline map_pair<domain,range>& element (
            );

            inline bool move_next (
            ) const;
    
        private:

            hash_table table;

            // restricted functions
            hash_map_kernel_1(hash_map_kernel_1&);    
            hash_map_kernel_1& operator= ( hash_map_kernel_1&);

    };

    template <
        typename domain,
        typename range,
        unsigned long expnum,
        typename hash_table,
        typename mem_manager
        >
    inline void swap (
        hash_map_kernel_1<domain,range,expnum,hash_table,mem_manager>& a, 
        hash_map_kernel_1<domain,range,expnum,hash_table,mem_manager>& b 
    ) { a.swap(b); } 

    template <
        typename domain,
        typename range,
        unsigned long expnum,
        typename hash_table,
        typename mem_manager
        >
    void deserialize (
        hash_map_kernel_1<domain,range,expnum,hash_table,mem_manager>& item,
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
            throw serialization_error(e.info + "\n   while deserializing object of type hash_map_kernel_1"); 
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
        unsigned long expnum,
        typename hash_table,
        typename mem_manager
        >
    void hash_map_kernel_1<domain,range,expnum,hash_table,mem_manager>::
    clear (
    )
    {
        table.clear();
    }

// ----------------------------------------------------------------------------------------

    template <
        typename domain,
        typename range,
        unsigned long expnum,
        typename hash_table,
        typename mem_manager
        >
    void hash_map_kernel_1<domain,range,expnum,hash_table,mem_manager>::
    add (
        domain& d,
        range& r
    )
    {
        table.add(d,r); 
    }

// ----------------------------------------------------------------------------------------

    template <
        typename domain,
        typename range,
        unsigned long expnum,
        typename hash_table,
        typename mem_manager
        >
    bool hash_map_kernel_1<domain,range,expnum,hash_table,mem_manager>::
    is_in_domain(
        const domain& d
    ) const
    {
        return (table[d] != 0);
    }

// ----------------------------------------------------------------------------------------

    template <
        typename domain,
        typename range,
        unsigned long expnum,
        typename hash_table,
        typename mem_manager
        >
    void hash_map_kernel_1<domain,range,expnum,hash_table,mem_manager>::
    remove_any (
        domain& d,
        range& r
    )
    {
        table.remove_any(d,r);
    }

// ----------------------------------------------------------------------------------------

    template <
        typename domain,
        typename range,
        unsigned long expnum,
        typename hash_table,
        typename mem_manager
        >
    void hash_map_kernel_1<domain,range,expnum,hash_table,mem_manager>::
    remove(
        const domain& d,
        domain& d_copy,
        range& r
    )
    {
        table.remove(d,d_copy,r);
    }

// ----------------------------------------------------------------------------------------

    template <
        typename domain,
        typename range,
        unsigned long expnum,
        typename hash_table,
        typename mem_manager
        >
    void hash_map_kernel_1<domain,range,expnum,hash_table,mem_manager>::
    destroy(
        const domain& d
    )
    {
        table.destroy(d);
    }

// ----------------------------------------------------------------------------------------

    template <
        typename domain,
        typename range,
        unsigned long expnum,
        typename hash_table,
        typename mem_manager
        >
    range& hash_map_kernel_1<domain,range,expnum,hash_table,mem_manager>::
    operator[](
        const domain& d
    )
    {
        return *table[d];
    }

// ----------------------------------------------------------------------------------------

    template <
        typename domain,
        typename range,
        unsigned long expnum,
        typename hash_table,
        typename mem_manager
        >
    const range& hash_map_kernel_1<domain,range,expnum,hash_table,mem_manager>::
    operator[](
        const domain& d
    ) const
    {
        return *table[d];
    }

// ----------------------------------------------------------------------------------------

    template <
        typename domain,
        typename range,
        unsigned long expnum,
        typename hash_table,
        typename mem_manager
        >
    unsigned long hash_map_kernel_1<domain,range,expnum,hash_table,mem_manager>::
    size (
    ) const
    {
        return table.size();
    }

// ----------------------------------------------------------------------------------------

    template <
        typename domain,
        typename range,
        unsigned long expnum,
        typename hash_table,
        typename mem_manager
        >
    void hash_map_kernel_1<domain,range,expnum,hash_table,mem_manager>::
    swap (
        hash_map_kernel_1<domain,range,expnum,hash_table,mem_manager>& item
    )
    {
        table.swap(item.table);      
    }

// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------
    // enumerable function definitions
// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------

    template <
        typename domain,
        typename range,
        unsigned long expnum,
        typename hash_table,
        typename mem_manager
        >
    bool hash_map_kernel_1<domain,range,expnum,hash_table,mem_manager>::
    at_start (
    ) const
    {
        return table.at_start();
    }

// ----------------------------------------------------------------------------------------

    template <
        typename domain,
        typename range,
        unsigned long expnum,
        typename hash_table,
        typename mem_manager
        >
    void hash_map_kernel_1<domain,range,expnum,hash_table,mem_manager>::
    reset (
    ) const
    {
        table.reset();
    }

// ----------------------------------------------------------------------------------------

    template <
        typename domain,
        typename range,
        unsigned long expnum,
        typename hash_table,
        typename mem_manager
        >
    bool hash_map_kernel_1<domain,range,expnum,hash_table,mem_manager>::
    current_element_valid (
    ) const
    {
        return table.current_element_valid();
    }

// ----------------------------------------------------------------------------------------

    template <
        typename domain,
        typename range,
        unsigned long expnum,
        typename hash_table,
        typename mem_manager
        >
    const map_pair<domain,range>& hash_map_kernel_1<domain,range,expnum,hash_table,mem_manager>::
    element (
    ) const
    {
        return table.element();
    }

// ----------------------------------------------------------------------------------------

    template <
        typename domain,
        typename range,
        unsigned long expnum,
        typename hash_table,
        typename mem_manager
        >
    map_pair<domain,range>& hash_map_kernel_1<domain,range,expnum,hash_table,mem_manager>::
    element (
    )
    {
        return table.element();
    }

// ----------------------------------------------------------------------------------------

    template <
        typename domain,
        typename range,
        unsigned long expnum,
        typename hash_table,
        typename mem_manager
        >
    bool hash_map_kernel_1<domain,range,expnum,hash_table,mem_manager>::
    move_next (
    ) const
    {
        return table.move_next();
    }

// ----------------------------------------------------------------------------------------

}

#endif // DLIB_HASH_MAP_KERNEl_1_

