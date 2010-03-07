// Copyright (C) 2003  Davis E. King (davisking@users.sourceforge.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#ifndef DLIB_ARRAY_KERNEl_1_
#define DLIB_ARRAY_KERNEl_1_

#include "array_kernel_abstract.h"
#include "../interfaces/enumerable.h"
#include "../algs.h"
#include "../serialize.h"
#include "../memory_manager.h"

namespace dlib
{


    template <
        typename T,
        typename mem_manager = memory_manager<char>::kernel_1a
        >
    class array_kernel_1 : public enumerable<T>
    {

        /*!
            INITIAL VALUE
                - array_size == 0
                - array_nodes == 0 
                - max_array_size == 0 
                - number_of_nodes == 0
                - mask == 0 
                - mask_size == 0
                - _at_start == true
                - pos == 0


            CONVENTION
                - current_element_valid() == (pos != array_size)
                - at_start() == _at_start
                - if (pos != array_size)
                    - element() == (*this)[pos]

                array_size == number of elements in the array.
                array_nodes == pointer to array of number_of_nodes pointers.
                max_array_size == the maximum allowed number of elements in the array.
                mask_size == the number of bits set to 1 in mask
                
        
                if (array_size > 0)
                {
                    Only array_nodes[0] though array_nodes[(array_size-1)/number_of_nodes] 
                    point to valid addresses.  All other elements in array_nodes
                    are set to 0.
                }
                else
                {
                    for all x: array_nodes[x] == 0
                }
                
                operator[](pos) == array_nodes[pos>>mask_size][pos&mask]

                if (max_array_size == 0)
                {
                    number_of_nodes == 0
                    array_nodes == 0
                    array_size == 0
                }                
        !*/
        
        public:

            typedef T type;
            typedef mem_manager mem_manager_type;

            array_kernel_1 (
            ) :
                array_nodes(0)
            {
                update_max_array_size(0);
            }

            virtual ~array_kernel_1 (
            ); 

            void clear (
            );

            inline const T& operator[] (
                unsigned long pos
            ) const;
            
            inline T& operator[] (
                unsigned long pos
            );

            void set_size (
                unsigned long size
            );

            inline unsigned long max_size(
            ) const;

            void set_max_size(
                unsigned long max
            );
            
            void swap (
                array_kernel_1& item
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

            inline const T& element (
            ) const;

            inline T& element (
            );

            bool move_next (
            ) const;


        private:


            void update_max_array_size (
                unsigned long new_max_array_size
            );
            /*!
                ensures
                    - everything in the CONVENTION is satisfied
                    - #max_array_size == new_max_array_size
                    - #array_size == 0
                    - mask_size, mask, and number_of_nodes have been set proper
                      values for the new max array size
                    - if (new_max_array_size != 0) then
                        - #array_nodes == pointer to an array of size #number_of_nodes 
                    - else
                        - #array_nodes == 0
                    - #at_start() == true
            !*/

            // data members
            T** array_nodes;
            unsigned long max_array_size;
            unsigned long array_size;
            unsigned long number_of_nodes;            
            mutable unsigned long pos;
            unsigned long mask;
            unsigned long mask_size;
            mutable bool _at_start;

            

            // restricted functions
            array_kernel_1(array_kernel_1<T>&);        // copy constructor
            array_kernel_1<T>& operator=(array_kernel_1<T>&);    // assignment operator        

    };

    template <
        typename T,
        typename mem_manager
        >
    inline void swap (
        array_kernel_1<T,mem_manager>& a, 
        array_kernel_1<T,mem_manager>& b 
    ) { a.swap(b); }

// ----------------------------------------------------------------------------------------

    template <
        typename T,
        typename mem_manager
        >
    void serialize (
        const array_kernel_1<T,mem_manager>& item,  
        std::ostream& out
    )
    {
        try
        {
            serialize(item.max_size(),out);
            serialize(item.size(),out);

            for (unsigned long i = 0; i < item.size(); ++i)
                serialize(item[i],out);
        }
        catch (serialization_error e)
        { 
            throw serialization_error(e.info + "\n   while serializing object of type array_kernel_1"); 
        }
    }

    template <
        typename T,
        typename mem_manager
        >
    void deserialize (
        array_kernel_1<T,mem_manager>& item,  
        std::istream& in
    )
    {
        try
        {
            unsigned long max_size, size;
            deserialize(max_size,in);
            deserialize(size,in);
            item.set_max_size(max_size);
            item.set_size(size);
            for (unsigned long i = 0; i < size; ++i)
                deserialize(item[i],in);
        }
        catch (serialization_error e)
        { 
            item.clear();
            throw serialization_error(e.info + "\n   while deserializing object of type array_kernel_1"); 
        }
    }

// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------
    // member function definitions
// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------

    template <
        typename T,
        typename mem_manager
        >
    array_kernel_1<T,mem_manager>::
    ~array_kernel_1 (
    )
    {
        update_max_array_size(0);
    }

// ----------------------------------------------------------------------------------------

    template <
        typename T,
        typename mem_manager
        >
    void array_kernel_1<T,mem_manager>::
    clear (
    )
    {
        update_max_array_size(0);                
    }

// ----------------------------------------------------------------------------------------

    template <
        typename T,
        typename mem_manager
        >
    const T& array_kernel_1<T,mem_manager>::
    operator[] (
        unsigned long pos
    ) const
    {
        return array_nodes[pos>>mask_size][pos&mask];
    }

// ----------------------------------------------------------------------------------------

    template <
        typename T,
        typename mem_manager
        >
    T& array_kernel_1<T,mem_manager>::
    operator[] (
        unsigned long pos
    )
    {
        return array_nodes[pos>>mask_size][pos&mask];
    }

// ----------------------------------------------------------------------------------------

    template <
        typename T,
        typename mem_manager
        >
    unsigned long array_kernel_1<T,mem_manager>::
    max_size (
    ) const
    {
        return max_array_size;
    }

// ----------------------------------------------------------------------------------------

    template <
        typename T,
        typename mem_manager
        >
    void array_kernel_1<T,mem_manager>::
    set_max_size (
        unsigned long max
    )
    {       
        update_max_array_size(max);       
    }

// ----------------------------------------------------------------------------------------

    template <
        typename T,
        typename mem_manager
        >
    void array_kernel_1<T,mem_manager>::
    set_size (
        unsigned long size
    )
    {
        if (array_size == 0 && size != 0)
        {
            const unsigned long new_biggest_node = (size-1)/(mask+1);
            try
            {
                // we need to initialize some array nodes
                for (unsigned long i = 0; i <= new_biggest_node; ++i)
                    array_nodes[i] = new T[mask+1];
            }
            catch (...)
            {
                // undo any changes
                for (unsigned long i = 0; i <= new_biggest_node; ++i)
                {
                    if (array_nodes[i] != 0)
                        delete [] array_nodes[i];
                    array_nodes[i] = 0;
                }
                throw;                
            }            
        }
        else if (size == 0)
        {
            // free all nodes
            for (unsigned long i = 0; i < number_of_nodes; ++i)
            {
                if (array_nodes[i] != 0)
                    delete [] array_nodes[i];
                array_nodes[i] = 0;
            }
        }
        else
        {
            const unsigned long biggest_node = (array_size-1)/(mask+1);
            const unsigned long new_biggest_node = (size-1)/(mask+1);
            try
            {
                if (biggest_node < new_biggest_node)
                {
                    // we need to initialize more array nodes
                    for (unsigned long i = biggest_node+1; i <= new_biggest_node; ++i)
                        array_nodes[i] = new T[mask+1];
                }
                else if (biggest_node > new_biggest_node)
                {
                    // we need to free some array nodes
                    for (unsigned long i = new_biggest_node+1; i <= biggest_node; ++i)
                    {
                        delete [] array_nodes[i];
                        array_nodes[i] = 0;
                    }
                }
            }
            catch (...)
            {
                // undo any changes
                for (unsigned long i = biggest_node+1; i <= new_biggest_node; ++i)
                {
                    if (array_nodes[i] != 0)
                        delete [] array_nodes[i];
                    array_nodes[i] = 0;
                }
                throw;
            }
        }
        array_size = size;        
        reset();
    }

// ----------------------------------------------------------------------------------------

    template <
        typename T,
        typename mem_manager
        >
    void array_kernel_1<T,mem_manager>::
    swap (
        array_kernel_1<T,mem_manager>& item
    )
    {
        exchange(_at_start,item._at_start);
        exchange(pos,item.pos);
        exchange(mask_size,item.mask_size);
        exchange(mask,item.mask);

        unsigned long    max_array_size_temp    = item.max_array_size;
        unsigned long    array_size_temp        = item.array_size;
        unsigned long    number_of_nodes_temp   = item.number_of_nodes;
        T**                array_nodes_temp     = item.array_nodes;

        item.max_array_size     = max_array_size;
        item.array_size         = array_size;
        item.number_of_nodes    = number_of_nodes;
        item.array_nodes        = array_nodes;

        max_array_size          = max_array_size_temp;
        array_size              = array_size_temp;
        number_of_nodes         = number_of_nodes_temp;
        array_nodes             = array_nodes_temp;
    }

// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------
    // private member function definitions
// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------

    template <
        typename T,
        typename mem_manager
        >
    void array_kernel_1<T,mem_manager>::
    update_max_array_size (
        unsigned long new_max_array_size
    )
    {   
        max_array_size = new_max_array_size;

        // first free all memory 
        if (array_nodes != 0)
        {
            for (unsigned long i = 0; i < number_of_nodes; ++i)
            {
                if (array_nodes[i] != 0)
                    delete [] array_nodes[i];
                else
                    break;
            }
            delete [] array_nodes;
        }

        if (max_array_size > 0)
        {
            // select new values for number_of_nodes, mask_size, and mask
            if (max_array_size <= 0x1000)
            {
                number_of_nodes = 0x10;
                mask = 0xFF;
                mask_size = 8;
            }
            else if (max_array_size <= 0x10000)
            {
                number_of_nodes = 0x100;
                mask = 0xFF;
                mask_size = 8;
            }
            else if (max_array_size <= 0x100000)
            {
                number_of_nodes = 1024;
                mask = 0x3FF;
                mask_size = 10;
            }
            else if (max_array_size <= 0x1000000)
            {
                number_of_nodes = 4096;
                mask = 0xFFF;
                mask_size = 12;
            }
            else if (max_array_size <= 0x10000000)
            {
                number_of_nodes = 16384;
                mask = 0x3FFF;
                mask_size = 14;
            }
            else if (max_array_size <= 0x40000000)
            {
                number_of_nodes = 32768;
                mask = 0x7FFF;
                mask_size = 15;
            }
            else 
            {
                number_of_nodes = 65536;
                mask = 0xFFFF;
                mask_size = 16;                
            }

            try 
            {
                array_nodes = new T*[number_of_nodes];
                for (unsigned long i = 0; i < number_of_nodes; ++i)
                    array_nodes[i] = 0;
            }
            catch (...)
            {
                max_array_size = 0;
                array_nodes = 0;
                number_of_nodes = 0;
                array_size = 0;
                reset();
                throw;
            }
        }
        else
        {
            array_nodes = 0;
            number_of_nodes = 0;
        }
     
        array_size = 0;
        reset();
    }

// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------
//           enumerable function definitions
// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------

    template <
        typename T,
        typename mem_manager
        >
    bool array_kernel_1<T,mem_manager>::
    at_start (
    ) const
    {
        return _at_start;
    }

// ----------------------------------------------------------------------------------------

    template <
        typename T,
        typename mem_manager
        >
    void array_kernel_1<T,mem_manager>::
    reset (
    ) const
    {
        _at_start = true;
        pos = array_size;
    }

// ----------------------------------------------------------------------------------------

    template <
        typename T,
        typename mem_manager
        >
    bool array_kernel_1<T,mem_manager>::
    current_element_valid (
    ) const
    {
        return (pos != array_size);
    }

// ----------------------------------------------------------------------------------------

    template <
        typename T,
        typename mem_manager
        >
    const T& array_kernel_1<T,mem_manager>::
    element (
    ) const
    {
        return operator[](pos);
    }

// ----------------------------------------------------------------------------------------

    template <
        typename T,
        typename mem_manager
        >
    T& array_kernel_1<T,mem_manager>::
    element (
    )
    {
        return operator[](pos);
    }

// ----------------------------------------------------------------------------------------

    template <
        typename T,
        typename mem_manager
        >
    bool array_kernel_1<T,mem_manager>::
    move_next (
    ) const
    {
        if (!_at_start)
        {
            if (pos+1 < array_size)
            {
                ++pos;
                return true;
            }
            else
            {
                pos = array_size;
                return false;
            }
        }
        else
        {
            _at_start = false;
            pos = 0;
            if (array_size == 0)
                return false;
            else
                return true;
        }
    }

// ----------------------------------------------------------------------------------------

    template <
        typename T,
        typename mem_manager
        >
    unsigned long array_kernel_1<T,mem_manager>::
    size (
    ) const
    {
        return array_size;
    }

// ----------------------------------------------------------------------------------------

}

#endif // DLIB_ARRAY_KERNEl_1_

