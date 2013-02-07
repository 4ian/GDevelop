// Copyright (C) 2003  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#ifndef DLIB_HASH_SET_KERNEl_1_
#define DLIB_HASH_SET_KERNEl_1_

#include "hash_set_kernel_abstract.h"
#include "../algs.h"
#include "../general_hash/general_hash.h"
#include "../interfaces/enumerable.h"
#include "../interfaces/remover.h"
#include "../assert.h"
#include "../serialize.h"

namespace dlib
{

    template <
        typename T,
        unsigned long expnum,
        typename hash_table,
        typename mem_manager = default_memory_manager 
        >
    class hash_set_kernel_1 : public enumerable<const T>,
                              public remover<T>
    {

        /*!
            REQUIREMENTS ON hash_table
                hash_table is instantiated with <domain=T,range=char> and
                T_is_POD must be set to false and
                is an implementation of hash_table/hash_table_kernel_abstract.h

            INITIAL VALUE
                table.size() == 0

            CONVENTION
                table.size() = size() == the number of elements in the set and
                the elements in this hash_set are stored in table
        !*/
        
        public:

            typedef T type;
            typedef typename hash_table::compare_type compare_type;
            typedef mem_manager mem_manager_type;

            hash_set_kernel_1(
            ) :
                table(expnum)
            {
                COMPILE_TIME_ASSERT(expnum < 32);
            }

            virtual ~hash_set_kernel_1(
            )
            {}

            inline void clear(
            );

            inline void add (
                T& item
            );

            inline bool is_member (
                const T& item
            ) const;

            inline void remove (
                const T& item,
                T& item_copy
            );

            inline void destroy (
                const T& item
            );

            inline void swap (
                hash_set_kernel_1& item
            );

            // functions from the remover interface
            inline void remove_any (
                T& item
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

            inline const T& element (
            ) const;

            inline const T& element (
            );

            inline bool move_next (
            ) const;

        private:

            hash_table table;
            char junk;

            // restricted functions
            hash_set_kernel_1(hash_set_kernel_1&);    
            hash_set_kernel_1& operator= ( hash_set_kernel_1&);

    };

    template <
        typename T,
        unsigned long expnum,
        typename hash_table,
        typename mem_manager
        >
    inline void swap (
        hash_set_kernel_1<T,expnum,hash_table,mem_manager>& a, 
        hash_set_kernel_1<T,expnum,hash_table,mem_manager>& b 
    ) { a.swap(b); } 

    template <
        typename T,
        unsigned long expnum,
        typename hash_table,
        typename mem_manager
        >
    void deserialize (
        hash_set_kernel_1<T,expnum,hash_table,mem_manager>& item,
        std::istream& in
    )
    {
        try
        {
            item.clear();
            unsigned long size;
            deserialize(size,in);
            T temp;
            for (unsigned long i = 0; i < size; ++i)
            {
                deserialize(temp,in);
                item.add(temp);
            }
        }
        catch (serialization_error e)
        { 
            item.clear();
            throw serialization_error(e.info + "\n   while deserializing object of type hash_set_kernel_1"); 
        }
    }

// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------
    // member function definitions
// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------

    template <
        typename T,
        unsigned long expnum,
        typename hash_table,
        typename mem_manager
        >
    void hash_set_kernel_1<T,expnum,hash_table,mem_manager>::
    clear (
    )
    {
        table.clear();
    }

// ----------------------------------------------------------------------------------------

    template <
        typename T,
        unsigned long expnum,
        typename hash_table,
        typename mem_manager
        >
    void hash_set_kernel_1<T,expnum,hash_table,mem_manager>::
    add (
        T& item
    )
    {
        table.add(item,junk);
    }

// ----------------------------------------------------------------------------------------

    template <
        typename T,
        unsigned long expnum,
        typename hash_table,
        typename mem_manager
        >
    bool hash_set_kernel_1<T,expnum,hash_table,mem_manager>::
    is_member(
        const T& item
    ) const
    {
        return (table[item] != 0);
    }

// ----------------------------------------------------------------------------------------

    template <
        typename T,
        unsigned long expnum,
        typename hash_table,
        typename mem_manager
        >
    void hash_set_kernel_1<T,expnum,hash_table,mem_manager>::
    remove_any (
        T& item
    )
    {
        table.remove_any(item,junk);
    }

// ----------------------------------------------------------------------------------------

    template <
        typename T,
        unsigned long expnum,
        typename hash_table,
        typename mem_manager
        >
    void hash_set_kernel_1<T,expnum,hash_table,mem_manager>::
    remove(
        const T& item,
        T& item_copy
    )
    {
        table.remove(item,item_copy,junk);
    }

// ----------------------------------------------------------------------------------------

    template <
        typename T,
        unsigned long expnum,
        typename hash_table,
        typename mem_manager
        >
    void hash_set_kernel_1<T,expnum,hash_table,mem_manager>::
    destroy(
        const T& item
    )
    {
        table.destroy(item);
    }

// ----------------------------------------------------------------------------------------

    template <
        typename T,
        unsigned long expnum,
        typename hash_table,
        typename mem_manager
        >
    unsigned long hash_set_kernel_1<T,expnum,hash_table,mem_manager>::
    size (
    ) const
    {
        return table.size();
    }

// ----------------------------------------------------------------------------------------

    template <
        typename T,
        unsigned long expnum,
        typename hash_table,
        typename mem_manager
        >
    void hash_set_kernel_1<T,expnum,hash_table,mem_manager>::
    swap (
        hash_set_kernel_1<T,expnum,hash_table,mem_manager>& item
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
        typename T,
        unsigned long expnum,
        typename hash_table,
        typename mem_manager
        >
    bool hash_set_kernel_1<T,expnum,hash_table,mem_manager>::
    at_start (
    ) const
    {
        return table.at_start();
    }

// ----------------------------------------------------------------------------------------

    template <
        typename T,
        unsigned long expnum,
        typename hash_table,
        typename mem_manager
        >
    void hash_set_kernel_1<T,expnum,hash_table,mem_manager>::
    reset (
    ) const
    {
        table.reset();
    }

// ----------------------------------------------------------------------------------------

    template <
        typename T,
        unsigned long expnum,
        typename hash_table,
        typename mem_manager
        >
    bool hash_set_kernel_1<T,expnum,hash_table,mem_manager>::
    current_element_valid (
    ) const
    {
        return table.current_element_valid();
    }

// ----------------------------------------------------------------------------------------

    template <
        typename T,
        unsigned long expnum,
        typename hash_table,
        typename mem_manager
        >
    const T& hash_set_kernel_1<T,expnum,hash_table,mem_manager>::
    element (
    ) const
    {
        return table.element().key();
    }

// ----------------------------------------------------------------------------------------

    template <
        typename T,
        unsigned long expnum,
        typename hash_table,
        typename mem_manager
        >
    const T& hash_set_kernel_1<T,expnum,hash_table,mem_manager>::
    element (
    )
    {
        return table.element().key();
    }

// ----------------------------------------------------------------------------------------

    template <
        typename T,
        unsigned long expnum,
        typename hash_table,
        typename mem_manager
        >
    bool hash_set_kernel_1<T,expnum,hash_table,mem_manager>::
    move_next (
    ) const
    {
        return table.move_next();
    }

// ----------------------------------------------------------------------------------------

}

#endif // DLIB_HASH_SET_KERNEl_1_

