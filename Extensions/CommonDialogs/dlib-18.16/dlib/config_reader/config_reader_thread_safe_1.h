// Copyright (C) 2007  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#ifndef DLIB_CONFIG_READER_THREAD_SAFe_
#define DLIB_CONFIG_READER_THREAD_SAFe_

#include "config_reader_kernel_abstract.h"
#include <string>
#include <iostream>
#include <sstream>
#include "../algs.h"
#include "../interfaces/enumerable.h"
#include "../threads.h"
#include "config_reader_thread_safe_abstract.h"

namespace dlib
{

    template <
        typename config_reader_base,
        typename map_string_void
        >
    class config_reader_thread_safe_1 
    {

        /*!                
            CONVENTION
                - get_mutex() == *m
                - *cr == the config reader being extended
                - block_table[x] == (void*)&block(x)
                - block_table.size() == the number of blocks in *cr
                - block_table[key] == a config_reader_thread_safe_1 that contains &cr.block(key)
                - if (own_pointers) then
                    - this object owns the m and cr pointers and should delete them when destructed 
        !*/
        
    public:

        config_reader_thread_safe_1 (
            const config_reader_base* base,
            rmutex* m_
        );

        config_reader_thread_safe_1();

        typedef typename config_reader_base::config_reader_error config_reader_error;
        typedef typename config_reader_base::config_reader_access_error config_reader_access_error;

        config_reader_thread_safe_1(
            std::istream& in
        );

        config_reader_thread_safe_1(
            const std::string& config_file 
        );

        virtual ~config_reader_thread_safe_1(
        ); 

        void clear (
        );

        void load_from (
            std::istream& in
        );

        void load_from (
            const std::string& config_file 
        );

        bool is_key_defined (
            const std::string& key
        ) const;

        bool is_block_defined (
            const std::string& name
        ) const;

        typedef config_reader_thread_safe_1 this_type;
        const this_type& block (
            const std::string& name
        ) const;

        const std::string& operator[] (
            const std::string& key
        ) const;

        template <
            typename queue_of_strings
            >
        void get_keys (
            queue_of_strings& keys
        ) const;

        template <
            typename queue_of_strings
            >
        void get_blocks (
            queue_of_strings& blocks
        ) const;

        inline const rmutex& get_mutex (
        ) const;

    private:

        void fill_block_table (
        );
        /*!
            ensures
                - block_table.size() == the number of blocks in cr 
                - block_table[key] == a config_reader_thread_safe_1 that contains &cr.block(key)
        !*/

        rmutex* m;
        config_reader_base* cr;
        map_string_void block_table;
        const bool own_pointers;

        // restricted functions
        config_reader_thread_safe_1(config_reader_thread_safe_1&);     
        config_reader_thread_safe_1& operator=(config_reader_thread_safe_1&);

    };

// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------
    // member function definitions
// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------

    template <
        typename config_reader_base,
        typename map_string_void
        >
    config_reader_thread_safe_1<config_reader_base,map_string_void>::
    config_reader_thread_safe_1(
        const config_reader_base* base,
        rmutex* m_
    ) :
        m(m_),
        cr(const_cast<config_reader_base*>(base)),
        own_pointers(false)
    {
        fill_block_table();
    }

// ----------------------------------------------------------------------------------------

    template <
        typename config_reader_base,
        typename map_string_void
        >
    config_reader_thread_safe_1<config_reader_base,map_string_void>::
    config_reader_thread_safe_1(
    ) :
        m(0),
        cr(0),
        own_pointers(true)
    {
        try
        {
            m = new rmutex;
            cr = new config_reader_base;
        }
        catch (...)
        {
            if (m) delete m;
            if (cr) delete cr;
            throw;
        }
    }

// ----------------------------------------------------------------------------------------

    template <
        typename config_reader_base,
        typename map_string_void
        >
    void config_reader_thread_safe_1<config_reader_base,map_string_void>::
    clear(
    )
    {
        auto_mutex M(*m);
        cr->clear();
        fill_block_table();
    }

// ----------------------------------------------------------------------------------------

    template <
        typename config_reader_base,
        typename map_string_void
        >
    void config_reader_thread_safe_1<config_reader_base,map_string_void>::
    load_from(
        std::istream& in
    )
    {
        auto_mutex M(*m);
        cr->load_from(in);
        fill_block_table();
    }

// ----------------------------------------------------------------------------------------

    template <
        typename config_reader_base,
        typename map_string_void
        >
    void config_reader_thread_safe_1<config_reader_base,map_string_void>::
    load_from(
        const std::string& config_file
    )
    {
        auto_mutex M(*m);
        cr->load_from(config_file);
        fill_block_table();
    }

// ----------------------------------------------------------------------------------------

    template <
        typename config_reader_base,
        typename map_string_void
        >
    config_reader_thread_safe_1<config_reader_base,map_string_void>::
    config_reader_thread_safe_1(
        std::istream& in
    ) :
        m(0),
        cr(0),
        own_pointers(true)
    {
        try
        {
            m = new rmutex;
            cr = new config_reader_base(in);
            fill_block_table();
        }
        catch (...)
        {
            if (m) delete m;
            if (cr) delete cr;
            throw;
        }
    }

// ----------------------------------------------------------------------------------------

    template <
        typename config_reader_base,
        typename map_string_void
        >
    config_reader_thread_safe_1<config_reader_base,map_string_void>::
    config_reader_thread_safe_1(
        const std::string& config_file
    ) :
        m(0),
        cr(0),
        own_pointers(true)
    {
        try
        {
            m = new rmutex;
            cr = new config_reader_base(config_file);
            fill_block_table();
        }
        catch (...)
        {
            if (m) delete m;
            if (cr) delete cr;
            throw;
        }
    }

// ----------------------------------------------------------------------------------------

    template <
        typename config_reader_base,
        typename map_string_void
        >
    config_reader_thread_safe_1<config_reader_base,map_string_void>::
    ~config_reader_thread_safe_1(
    ) 
    {
        if (own_pointers)
        {
            delete m;
            delete cr;
        }

        // clear out the block table
        block_table.reset();
        while (block_table.move_next())
        {
            delete static_cast<config_reader_thread_safe_1*>(block_table.element().value());
        }
        block_table.clear();
    }

// ----------------------------------------------------------------------------------------

    template <
        typename config_reader_base,
        typename map_string_void
        >
    bool config_reader_thread_safe_1<config_reader_base,map_string_void>::
    is_key_defined (
        const std::string& key
    ) const
    {
        auto_mutex M(*m);
        return cr->is_key_defined(key);
    }

// ----------------------------------------------------------------------------------------

    template <
        typename config_reader_base,
        typename map_string_void
        >
    bool config_reader_thread_safe_1<config_reader_base,map_string_void>::
    is_block_defined (
        const std::string& name
    ) const
    {
        auto_mutex M(*m);
        return cr->is_block_defined(name);
    }

// ----------------------------------------------------------------------------------------

    template <
        typename config_reader_base,
        typename map_string_void
        >
    const config_reader_thread_safe_1<config_reader_base,map_string_void>& config_reader_thread_safe_1<config_reader_base,map_string_void>::
    block (
        const std::string& name
    ) const
    {
        auto_mutex M(*m);
        if (block_table.is_in_domain(name) == false)
        {
            throw config_reader_access_error(name,"");
        }

        return *static_cast<config_reader_thread_safe_1*>(block_table[name]);
    }

// ----------------------------------------------------------------------------------------

    template <
        typename config_reader_base,
        typename map_string_void
        >
    const std::string& config_reader_thread_safe_1<config_reader_base,map_string_void>::
    operator[] (
        const std::string& key
    ) const
    {
        auto_mutex M(*m);
        return (*cr)[key];
    }

// ----------------------------------------------------------------------------------------

    template <
        typename config_reader_base,
        typename map_string_void
        >
    template <
        typename queue_of_strings
        >
    void config_reader_thread_safe_1<config_reader_base,map_string_void>::
    get_keys (
        queue_of_strings& keys
    ) const
    {
        auto_mutex M(*m);
        cr->get_keys(keys);
    }

// ----------------------------------------------------------------------------------------

    template <
        typename config_reader_base,
        typename map_string_void
        >
    template <
        typename queue_of_strings
        >
    void config_reader_thread_safe_1<config_reader_base,map_string_void>::
    get_blocks (
        queue_of_strings& blocks
    ) const
    {
        auto_mutex M(*m);
        cr->get_blocks(blocks);
    }

// ----------------------------------------------------------------------------------------

    template <
        typename config_reader_base,
        typename map_string_void
        >
    const rmutex& config_reader_thread_safe_1<config_reader_base,map_string_void>::
    get_mutex (
    ) const
    {
        return *m;
    }

// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------
//      private member functions
// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------

    template <
        typename config_reader_base,
        typename map_string_void
        >
    void config_reader_thread_safe_1<config_reader_base,map_string_void>::
    fill_block_table (
    ) 
    {
        using namespace std;
        // first empty out the block table
        block_table.reset();
        while (block_table.move_next())
        {
            delete static_cast<config_reader_thread_safe_1*>(block_table.element().value());
        }
        block_table.clear();

        std::vector<std::string> blocks;
        cr->get_blocks(blocks);

        // now fill the block table up to match what is in cr
        for (unsigned long i = 0; i < blocks.size(); ++i)
        {
            config_reader_thread_safe_1* block = new config_reader_thread_safe_1(&cr->block(blocks[i]),m);
            void* temp = block;
            block_table.add(blocks[i],temp);
        }
    }

// ----------------------------------------------------------------------------------------

}

#endif // DLIB_CONFIG_READER_THREAD_SAFe_


