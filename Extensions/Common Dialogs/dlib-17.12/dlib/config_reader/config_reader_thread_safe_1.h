// Copyright (C) 2007  Davis E. King (davisking@users.sourceforge.net)
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
        typename map_string_void,
        bool checking
        >
    class config_reader_thread_safe_1 : public enumerable<config_reader_thread_safe_1<config_reader_base,map_string_void,checking> >
    {

        /*!                
            CONVENTION
                - get_mutex() == m
                - *cr == the config reader being extended
                - block_table[x] == (void*)&block(x)
                - cr->size == block_table.size()
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

        config_reader_thread_safe_1(
            std::istream& in
        );

        virtual ~config_reader_thread_safe_1(
        ); 

        void clear (
        );

        void load_from (
            std::istream& in
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

        inline bool at_start (
        ) const ;

        inline void reset (
        ) const ;

        inline bool current_element_valid (
        ) const ;

        inline const this_type& element (
        ) const ;

        inline this_type& element (
        ) ;

        inline bool move_next (
        ) const ;

        inline unsigned long size (
        ) const ;

        inline const std::string& current_block_name (
        ) const;

        inline const rmutex& get_mutex (
        ) const;

    private:

        void fill_block_table (
        );
        /*!
            ensures
                - block_table.size() == cr->size()
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

    /* 
        This is a bunch of crap so we can enable and disable the DLIB_CASSERT statements
        without getting warnings about conditions always being true or false.
    */
    namespace config_reader_thread_safe_1_helpers
    {
        template <typename cr_type, bool do_check>
        struct helper;

        template <typename cr_type>
        struct helper<cr_type,false>
        {
            static void check_block_precondition (const cr_type&,  const std::string& ) {}
            static void check_current_block_name_precondition (const cr_type& cr) {} 
            static void check_element_precondition (const cr_type& cr) {}
        };

        template <typename cr_type>
        struct helper<cr_type,true>
        {
            static void check_block_precondition (const cr_type& cr, const std::string& name) 
            {
                DLIB_CASSERT ( cr.is_block_defined(name) == true ,
                          "\tconst this_type& config_reader_thread_safe::block(name)"
                          << "\n\tTo access a sub block in the config_reader the block must actually exist."
                          << "\n\tname == " << name 
                          << "\n\t&cr:   " << &cr 
                );
            }

            static void check_current_block_name_precondition (const cr_type& cr) 
            {
                DLIB_CASSERT ( cr.current_element_valid() == true ,
                          "\tconst std::string& config_reader_thread_safe::current_block_name()"
                          << "\n\tYou can't call current_block_name() if the current element isn't valid."
                          << "\n\t&cr: " << &cr 
                );
            }

            static void check_element_precondition (const cr_type& cr) 
            {
                DLIB_CASSERT ( cr.current_element_valid() == true ,
                          "\tthis_type& config_reader_thread_safe::element()"
                          << "\n\tYou can't call element() if the current element isn't valid."
                          << "\n\t&cr: " << &cr 
                );
            }
        };
    }

// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------
    // member function definitions
// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------

    template <
        typename config_reader_base,
        typename map_string_void,
        bool checking
        >
    config_reader_thread_safe_1<config_reader_base,map_string_void,checking>::
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
        typename map_string_void,
        bool checking
        >
    config_reader_thread_safe_1<config_reader_base,map_string_void,checking>::
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
        typename map_string_void,
        bool checking
        >
    void config_reader_thread_safe_1<config_reader_base,map_string_void,checking>::
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
        typename map_string_void,
        bool checking
        >
    void config_reader_thread_safe_1<config_reader_base,map_string_void,checking>::
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
        typename map_string_void,
        bool checking
        >
    config_reader_thread_safe_1<config_reader_base,map_string_void,checking>::
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
        typename map_string_void,
        bool checking
        >
    config_reader_thread_safe_1<config_reader_base,map_string_void,checking>::
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
            delete reinterpret_cast<config_reader_thread_safe_1*>(block_table.element().value());
        }
        block_table.clear();
    }

// ----------------------------------------------------------------------------------------

    template <
        typename config_reader_base,
        typename map_string_void,
        bool checking
        >
    bool config_reader_thread_safe_1<config_reader_base,map_string_void,checking>::
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
        typename map_string_void,
        bool checking
        >
    bool config_reader_thread_safe_1<config_reader_base,map_string_void,checking>::
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
        typename map_string_void,
        bool checking
        >
    const config_reader_thread_safe_1<config_reader_base,map_string_void,checking>& config_reader_thread_safe_1<config_reader_base,map_string_void,checking>::
    block (
        const std::string& name
    ) const
    {
        auto_mutex M(*m);
        config_reader_thread_safe_1_helpers::helper<config_reader_thread_safe_1,checking>::
            check_block_precondition(*this,name);
        return *reinterpret_cast<config_reader_thread_safe_1*>(block_table[name]);
    }

// ----------------------------------------------------------------------------------------

    template <
        typename config_reader_base,
        typename map_string_void,
        bool checking
        >
    const std::string& config_reader_thread_safe_1<config_reader_base,map_string_void,checking>::
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
        typename map_string_void,
        bool checking
        >
    template <
        typename queue_of_strings
        >
    void config_reader_thread_safe_1<config_reader_base,map_string_void,checking>::
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
        typename map_string_void,
        bool checking
        >
    bool config_reader_thread_safe_1<config_reader_base,map_string_void,checking>::
    at_start (
    ) const 
    {
        auto_mutex M(*m);
        return block_table.at_start();
    }

// ----------------------------------------------------------------------------------------

    template <
        typename config_reader_base,
        typename map_string_void,
        bool checking
        >
    void config_reader_thread_safe_1<config_reader_base,map_string_void,checking>::
    reset (
    ) const 
    {
        auto_mutex M(*m);
        block_table.reset();
    }

// ----------------------------------------------------------------------------------------

    template <
        typename config_reader_base,
        typename map_string_void,
        bool checking
        >
    bool config_reader_thread_safe_1<config_reader_base,map_string_void,checking>::
    current_element_valid (
    ) const 
    {
        auto_mutex M(*m);
        return block_table.current_element_valid();
    }

// ----------------------------------------------------------------------------------------

    template <
        typename config_reader_base,
        typename map_string_void,
        bool checking
        >
    const config_reader_thread_safe_1<config_reader_base,map_string_void,checking>& config_reader_thread_safe_1<config_reader_base,map_string_void,checking>::
    element (
    ) const 
    {
        auto_mutex M(*m);
        config_reader_thread_safe_1_helpers::helper<config_reader_thread_safe_1,checking>::
            check_element_precondition(*this);
        return *reinterpret_cast<config_reader_thread_safe_1*>(block_table.element().value());
    }

// ----------------------------------------------------------------------------------------

    template <
        typename config_reader_base,
        typename map_string_void,
        bool checking
        >
    config_reader_thread_safe_1<config_reader_base,map_string_void,checking>& config_reader_thread_safe_1<config_reader_base,map_string_void,checking>::
    element (
    ) 
    {
        auto_mutex M(*m);
        config_reader_thread_safe_1_helpers::helper<config_reader_thread_safe_1,checking>::
            check_element_precondition(*this);
        return *reinterpret_cast<config_reader_thread_safe_1*>(block_table.element().value());
    }

// ----------------------------------------------------------------------------------------

    template <
        typename config_reader_base,
        typename map_string_void,
        bool checking
        >
    bool config_reader_thread_safe_1<config_reader_base,map_string_void,checking>::
    move_next (
    ) const 
    {
        auto_mutex M(*m);
        return block_table.move_next();
    }

// ----------------------------------------------------------------------------------------

    template <
        typename config_reader_base,
        typename map_string_void,
        bool checking
        >
    unsigned long config_reader_thread_safe_1<config_reader_base,map_string_void,checking>::
    size (
    ) const 
    {
        auto_mutex M(*m);
        return block_table.size();
    }

// ----------------------------------------------------------------------------------------

    template <
        typename config_reader_base,
        typename map_string_void,
        bool checking
        >
    const std::string& config_reader_thread_safe_1<config_reader_base,map_string_void,checking>::
    current_block_name (
    ) const
    {
        auto_mutex M(*m);
        config_reader_thread_safe_1_helpers::helper<config_reader_thread_safe_1,checking>::
            check_current_block_name_precondition(*this);
        return block_table.element().key();
    }

// ----------------------------------------------------------------------------------------

    template <
        typename config_reader_base,
        typename map_string_void,
        bool checking
        >
    const rmutex& config_reader_thread_safe_1<config_reader_base,map_string_void,checking>::
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
        typename map_string_void,
        bool checking
        >
    void config_reader_thread_safe_1<config_reader_base,map_string_void,checking>::
    fill_block_table (
    ) 
    {
        using namespace std;
        // first empty out the block table
        block_table.reset();
        while (block_table.move_next())
        {
            delete reinterpret_cast<config_reader_thread_safe_1*>(block_table.element().value());
        }
        block_table.clear();

        // now fill the block table up to match what is in cr
        cr->reset();
        while (cr->move_next())
        {
            config_reader_thread_safe_1* block = new config_reader_thread_safe_1(&cr->element(),m);
            void* temp = block;
            std::string key(cr->current_block_name());
            block_table.add(key,temp);
        }
    }

// ----------------------------------------------------------------------------------------

}

#endif // DLIB_CONFIG_READER_THREAD_SAFe_


