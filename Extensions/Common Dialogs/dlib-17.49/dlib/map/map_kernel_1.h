// Copyright (C) 2003  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#ifndef DLIB_MAP_KERNEl_1_
#define DLIB_MAP_KERNEl_1_

#include "map_kernel_abstract.h"
#include "../algs.h"
#include "../interfaces/enumerable.h"
#include "../interfaces/map_pair.h"
#include "../interfaces/remover.h"
#include "../serialize.h"

namespace dlib
{

    template <
        typename domain,
        typename range,
        typename bst_base,  
        typename mem_manager = default_memory_manager 
        >
    class map_kernel_1 : public enumerable<map_pair<domain,range> >,
                         public asc_pair_remover<domain,range,typename bst_base::compare_type>
    {

        /*!
            REQUIREMENTS ON BST_BASE
                bst_base is instantiated with domain and range and
                implements binary_search_tree/binary_search_tree_kernel_abstract.h

            INITIAL VALUE
                bst has its initial value

            CONVENTION
                bst.size() == the number of elements in the map and
                the elements in map are stored in bst_base
        !*/
        
        public:

            typedef domain domain_type;
            typedef range range_type;
            typedef typename bst_base::compare_type compare_type;
            typedef mem_manager mem_manager_type;

            map_kernel_1(
            ) 
            {}

            virtual ~map_kernel_1(
            )
            {}

            inline void clear(
            );            

            inline void add (
                domain& d,
                range& r
            );

            inline bool is_in_domain (
                const domain& d
            ) const;

            inline void remove_any (
                domain& d,
                range& r
            );

            inline void remove (
                const domain& d,
                domain& d_copy,
                range& r
            );
 
            inline void destroy (
                const domain& d
            );
 
            inline range& operator[] (
                const domain& d
            );

            inline const range& operator[] (
                const domain& d
            ) const;

            inline void swap (
                map_kernel_1& item
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

            bst_base bst;

            // restricted functions
            map_kernel_1(map_kernel_1&);      
            map_kernel_1& operator= ( map_kernel_1&);
    };


    template <
        typename domain,
        typename range,
        typename bst_base,
        typename mem_manager
        >
    inline void swap (
        map_kernel_1<domain,range,bst_base,mem_manager>& a, 
        map_kernel_1<domain,range,bst_base,mem_manager>& b 
    ) { a.swap(b); }   


    template <
        typename domain,
        typename range,
        typename bst_base,
        typename mem_manager
        >
    void deserialize (
        map_kernel_1<domain,range,bst_base,mem_manager>& item, 
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
            throw serialization_error(e.info + "\n   while deserializing object of type map_kernel_1"); 
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
        typename mem_manager
        >
    void map_kernel_1<domain,range,bst_base,mem_manager>::
    clear (
    )
    {
        bst.clear();
    }

// ----------------------------------------------------------------------------------------

    template <
        typename domain,
        typename range,
        typename bst_base,
        typename mem_manager
        >
    void map_kernel_1<domain,range,bst_base,mem_manager>::
    add(
        domain& d,
        range& r
    )
    {
        // try to add pair to bst_base
        bst.add(d,r); 
    }

// ----------------------------------------------------------------------------------------

    template <
        typename domain,
        typename range,
        typename bst_base,
        typename mem_manager
        >
    bool map_kernel_1<domain,range,bst_base,mem_manager>::
    is_in_domain(
        const domain& d
    ) const
    {
        return (bst[d] != 0);
    }

// ----------------------------------------------------------------------------------------

    template <
        typename domain,
        typename range,
        typename bst_base,
        typename mem_manager
        >
    void map_kernel_1<domain,range,bst_base,mem_manager>::
    remove_any(
        domain& d,
        range& r
    )
    {
        bst.remove_any(d,r);
    }

// ----------------------------------------------------------------------------------------

    template <
        typename domain,
        typename range,
        typename bst_base,
        typename mem_manager
        >
    void map_kernel_1<domain,range,bst_base,mem_manager>::
    remove (
        const domain& d,
        domain& d_copy,
        range& r
    )
    {
        bst.remove(d,d_copy,r);
    }

// ----------------------------------------------------------------------------------------

    template <
        typename domain,
        typename range,
        typename bst_base,
        typename mem_manager
        >
    void map_kernel_1<domain,range,bst_base,mem_manager>::
    destroy (
        const domain& d
    )
    {
        bst.destroy(d);
    }

// ----------------------------------------------------------------------------------------

    template <
        typename domain,
        typename range,
        typename bst_base,
        typename mem_manager
        >
    range& map_kernel_1<domain,range,bst_base,mem_manager>::
    operator[](
        const domain& d
    )
    {
        return *bst[d];
    }

// ----------------------------------------------------------------------------------------

    template <
        typename domain,
        typename range,
        typename bst_base,
        typename mem_manager
        >
    const range& map_kernel_1<domain,range,bst_base,mem_manager>::
    operator[](
        const domain& d
    ) const
    {
        return *bst[d];
    }

// ----------------------------------------------------------------------------------------

    template <
        typename domain,
        typename range,
        typename bst_base,
        typename mem_manager
        >
    unsigned long map_kernel_1<domain,range,bst_base,mem_manager>::
    size (
    ) const
    {
        return bst.size();
    }

// ----------------------------------------------------------------------------------------

    template <
        typename domain,
        typename range,
        typename bst_base,
        typename mem_manager
        >
    void map_kernel_1<domain,range,bst_base,mem_manager>::
    swap (
        map_kernel_1<domain,range,bst_base,mem_manager>& item
    )
    {
        bst.swap(item.bst);
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
        typename mem_manager
        >
    bool map_kernel_1<domain,range,bst_base,mem_manager>::
    at_start (
    ) const
    {
        return bst.at_start();
    }

// ----------------------------------------------------------------------------------------

    template <
        typename domain,
        typename range,
        typename bst_base,
        typename mem_manager
        >
    void map_kernel_1<domain,range,bst_base,mem_manager>::
    reset (
    ) const
    {
        bst.reset();
    }

// ----------------------------------------------------------------------------------------

    template <
        typename domain,
        typename range,
        typename bst_base,
        typename mem_manager
        >
    bool map_kernel_1<domain,range,bst_base,mem_manager>::
    current_element_valid (
    ) const
    {
        return bst.current_element_valid();
    }

// ----------------------------------------------------------------------------------------

    template <
        typename domain,
        typename range,
        typename bst_base,
        typename mem_manager
        >
    const map_pair<domain,range>& map_kernel_1<domain,range,bst_base,mem_manager>::
    element (
    ) const
    {
        return bst.element();
    }

// ----------------------------------------------------------------------------------------

    template <
        typename domain,
        typename range,
        typename bst_base,
        typename mem_manager
        >
    map_pair<domain,range>& map_kernel_1<domain,range,bst_base,mem_manager>::
    element (
    )
    {
        return bst.element();
    }

// ----------------------------------------------------------------------------------------

    template <
        typename domain,
        typename range,
        typename bst_base,
        typename mem_manager
        >
    bool map_kernel_1<domain,range,bst_base,mem_manager>::
    move_next (
    ) const
    {
        return bst.move_next();
    }

// ----------------------------------------------------------------------------------------

}

#endif // DLIB_MAP_KERNEl_1_

