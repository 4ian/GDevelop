// Copyright (C) 2003  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#ifndef DLIB_SET_KERNEl_1_
#define DLIB_SET_KERNEl_1_

#include "set_kernel_abstract.h"
#include "../algs.h"
#include "../interfaces/enumerable.h"
#include "../interfaces/remover.h"
#include "../serialize.h"

namespace dlib
{

    template <
        typename T,
        typename bst_base,
        typename mem_manager = default_memory_manager
        >
    class set_kernel_1 : public enumerable<const T>,
                         public asc_remover<T,typename bst_base::compare_type>
    {

        /*!
            REQUIREMENTS ON bst_base
                bst_base is instantiated with <domain=T,range=char> and
                implements binray_search_tree/binary_search_tree_kernel_abstract.h

            INITIAL VALUE
                bst has its initial value

            CONVENTION
                bst.size() == the number of elements in the set and
                the elements in the set are stored in bst
        !*/
        

        public:

            typedef T type;
            typedef typename bst_base::compare_type compare_type;
            typedef mem_manager mem_manager_type;

            set_kernel_1(
            )
            {
            }

            virtual ~set_kernel_1(
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
                set_kernel_1& item
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

            bst_base bst;
            char junk;

            // restricted functions
            set_kernel_1(set_kernel_1&);        
            set_kernel_1& operator=(set_kernel_1&); 

    };

    template <
        typename T,
        typename bst_base,
        typename mem_manager
        >
    inline void swap (
        set_kernel_1<T,bst_base,mem_manager>& a, 
        set_kernel_1<T,bst_base,mem_manager>& b 
    ) { a.swap(b); } 

    template <
        typename T,
        typename bst_base,
        typename mem_manager
        >
    void deserialize (
        set_kernel_1<T,bst_base,mem_manager>& item, 
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
            throw serialization_error(e.info + "\n   while deserializing object of type set_kernel_1"); 
        }
    }

// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------
    // member function definitions
// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------

    template <
        typename T,
        typename bst_base,
        typename mem_manager
        >
    void set_kernel_1<T,bst_base,mem_manager>::
    clear (
    )
    {
        bst.clear();
    }

// ----------------------------------------------------------------------------------------

    template <
        typename T,
        typename bst_base,
        typename mem_manager
        >
    void set_kernel_1<T,bst_base,mem_manager>::
    add (
        T& item
    )
    {
        bst.add(item,junk);
    }

// ----------------------------------------------------------------------------------------

    template <
        typename T,
        typename bst_base,
        typename mem_manager
        >
    bool set_kernel_1<T,bst_base,mem_manager>::
    is_member(
        const T& item
    ) const
    {
        return (bst[item] != 0);
    }

// ----------------------------------------------------------------------------------------

    template <
        typename T,
        typename bst_base,
        typename mem_manager
        >
    void set_kernel_1<T,bst_base,mem_manager>::
    remove_any (
        T& item
    )
    {
        bst.remove_any(item,junk);
    }

// ----------------------------------------------------------------------------------------

    template <
        typename T,
        typename bst_base,
        typename mem_manager
        >
    void set_kernel_1<T,bst_base,mem_manager>::
    remove(
        const T& item,
        T& item_copy
    )
    {
        bst.remove(item,item_copy,junk);
    }

// ----------------------------------------------------------------------------------------

    template <
        typename T,
        typename bst_base,
        typename mem_manager
        >
    void set_kernel_1<T,bst_base,mem_manager>::
    destroy(
        const T& item
    )
    {
        bst.destroy(item);
    }

// ----------------------------------------------------------------------------------------

    template <
        typename T,
        typename bst_base,
        typename mem_manager
        >
    unsigned long set_kernel_1<T,bst_base,mem_manager>::
    size (
    ) const
    {
        return bst.size();
    }

// ----------------------------------------------------------------------------------------

    template <
        typename T,
        typename bst_base,
        typename mem_manager
        >
    void set_kernel_1<T,bst_base,mem_manager>::
    swap (
        set_kernel_1<T,bst_base,mem_manager>& item
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
        typename T,
        typename bst_base,
        typename mem_manager
        >
    bool set_kernel_1<T,bst_base,mem_manager>::
    at_start (
    ) const
    {
        return bst.at_start();
    }

// ----------------------------------------------------------------------------------------

    template <
        typename T,
        typename bst_base,
        typename mem_manager
        >
    void set_kernel_1<T,bst_base,mem_manager>::
    reset (
    ) const
    {
        bst.reset();
    }

// ----------------------------------------------------------------------------------------

    template <
        typename T,
        typename bst_base,
        typename mem_manager
        >
    bool set_kernel_1<T,bst_base,mem_manager>::
    current_element_valid (
    ) const
    {
        return bst.current_element_valid();
    }

// ----------------------------------------------------------------------------------------

    template <
        typename T,
        typename bst_base,
        typename mem_manager
        >
    const T& set_kernel_1<T,bst_base,mem_manager>::
    element (
    ) const
    {
        return bst.element().key();
    }

// ----------------------------------------------------------------------------------------

    template <
        typename T,
        typename bst_base,
        typename mem_manager
        >
    const T& set_kernel_1<T,bst_base,mem_manager>::
    element (
    )
    {
        return bst.element().key();
    }

// ----------------------------------------------------------------------------------------

    template <
        typename T,
        typename bst_base,
        typename mem_manager
        >
    bool set_kernel_1<T,bst_base,mem_manager>::
    move_next (
    ) const
    {
        return bst.move_next();
    }

// ----------------------------------------------------------------------------------------

}

#endif // DLIB_SET_KERNEl_1_

