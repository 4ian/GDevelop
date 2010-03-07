// Copyright (C) 2003  Davis E. King (davisking@users.sourceforge.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#ifndef DLIB_CONFIG_READER_KERNEl_1_
#define DLIB_CONFIG_READER_KERNEl_1_

#include "config_reader_kernel_abstract.h"
#include <string>
#include <iostream>
#include <sstream>
#include "../algs.h"
#include "../interfaces/enumerable.h"

namespace dlib
{

    template <
        typename map_string_string,
        typename map_string_void,
        typename tokenizer,
        bool checking = false
        >
    class config_reader_kernel_1 : public enumerable<config_reader_kernel_1<map_string_string,
                                                                            map_string_void,
                                                                            tokenizer,
                                                                            checking> >
    {

        /*!                
            REQUIREMENTS ON map_string_string
                is an implementation of map/map_kernel_abstract.h that maps std::string to std::string

            REQUIREMENTS ON map_string_void 
                is an implementation of map/map_kernel_abstract.h that maps std::string to void*

            REQUIREMENTS ON tokenizer
                is an implementation of tokenizer/tokenizer_kernel_abstract.h 

            REQUIREMENTS ON checking
                - if (checking == true) then
                    - The preconditions for this object will be checked.
                - else
                    - The preconditions for this object will NOT be checked.

            CONVENTION
                key_table.is_in_domain(x) == is_key_defined(x)
                block_table.is_in_domain(x) == is_block_defined(x)

                key_table[x] == operator[](x)
                block_table[x] == (void*)&block(x)
        !*/
        
    public:

        config_reader_kernel_1();

        class config_reader_error : public dlib::error 
        {
            friend class config_reader_kernel_1;
            config_reader_error(
                unsigned long ln, 
                bool r = false
            ) : 
                dlib::error(ECONFIG_READER),
                line_number(ln), 
                redefinition(r)
            {
                std::ostringstream sout;
                sout << "Error in config_reader while parsing at line number " << line_number << ".";
                if (redefinition)
                    sout << "\nThe identifier on this line has already been defined in this scope.";
                const_cast<std::string&>(info) = sout.str();
            }
        public:
            const unsigned long line_number;
            const bool redefinition;
        };


        config_reader_kernel_1(
            std::istream& in
        );

        virtual ~config_reader_kernel_1(
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

        typedef config_reader_kernel_1 this_type;
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

    private:

        static void parse_config_file (
            config_reader_kernel_1& cr,
            tokenizer& tok,
            unsigned long& line_number,
            const bool top_of_recursion = true
        );
        /*!
            requires
                - line_number == 1
                - cr == *this
                - top_of_recursion == true
            ensures
                - parses the data coming from tok and puts it into cr.
            throws
                - config_reader_error
        !*/

        map_string_string key_table;
        map_string_void block_table;

        // restricted functions
        config_reader_kernel_1(config_reader_kernel_1&);     
        config_reader_kernel_1& operator=(config_reader_kernel_1&);

    };

// ----------------------------------------------------------------------------------------

    /* 
        This is a bunch of crap so we can enable and disable the DLIB_CASSERT statements
        without getting warnings about conditions always being true or false.
    */
    namespace config_reader_kernel_1_helpers
    {
        template <typename cr_type, bool do_check>
        struct helper;

        template <typename cr_type>
        struct helper<cr_type,false>
        {
            static void check_operator_bracket_precondition (const cr_type&, const std::string& ) {}
            static void check_block_precondition (const cr_type&,  const std::string& ) {}
            static void check_current_block_name_precondition (const cr_type& cr) {} 
            static void check_element_precondition (const cr_type& cr) {}
        };

        template <typename cr_type>
        struct helper<cr_type,true>
        {
            static void check_operator_bracket_precondition (const cr_type& cr, const std::string& key) 
            {
                DLIB_CASSERT ( cr.is_key_defined(key) == true ,
                          "\tconst std::string& config_reader::operator[](key)"
                          << "\n\tTo access a key's value in the config_reader the key must actually exist."
                          << "\n\tkey == " << key 
                          << "\n\t&cr:  " << &cr 
                );
            }

            static void check_block_precondition (const cr_type& cr, const std::string& name) 
            {
                DLIB_CASSERT ( cr.is_block_defined(name) == true ,
                          "\tconst this_type& config_reader::block(name)"
                          << "\n\tTo access a sub block in the config_reader the block must actually exist."
                          << "\n\tname == " << name 
                          << "\n\t&cr:   " << &cr 
                );
            }

            static void check_current_block_name_precondition (const cr_type& cr) 
            {
                DLIB_CASSERT ( cr.current_element_valid() == true ,
                          "\tconst std::string& config_reader::current_block_name()"
                          << "\n\tYou can't call current_block_name() if the current element isn't valid."
                          << "\n\t&cr: " << &cr 
                );
            }

            static void check_element_precondition (const cr_type& cr) 
            {
                DLIB_CASSERT ( cr.current_element_valid() == true ,
                          "\tthis_type& config_reader::element()"
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
        typename map_string_string,
        typename map_string_void,
        typename tokenizer,
        bool checking
        >
    config_reader_kernel_1<map_string_string,map_string_void,tokenizer,checking>::
    config_reader_kernel_1(
    )
    {
    }

// ----------------------------------------------------------------------------------------

    template <
        typename map_string_string,
        typename map_string_void,
        typename tokenizer,
        bool checking
        >
    void config_reader_kernel_1<map_string_string,map_string_void,tokenizer,checking>::
    clear(
    )
    {
        // free all our blocks
        block_table.reset();
        while (block_table.move_next())
        {
            delete reinterpret_cast<config_reader_kernel_1*>(block_table.element().value());
        }
        block_table.clear();
        key_table.clear();
    }

// ----------------------------------------------------------------------------------------

    template <
        typename map_string_string,
        typename map_string_void,
        typename tokenizer,
        bool checking
        >
    void config_reader_kernel_1<map_string_string,map_string_void,tokenizer,checking>::
    load_from(
        std::istream& in
    )
    {
        clear();

        tokenizer tok;
        tok.set_stream(in);
        tok.set_identifier_token(
            tok.lowercase_letters() + tok.uppercase_letters(),
            tok.lowercase_letters() + tok.uppercase_letters() + tok.numbers() + "_-."
        );

        unsigned long line_number = 1;
        try
        {
            parse_config_file(*this,tok,line_number);
        }
        catch (...)
        {
            clear();
            throw;
        }
    }

// ----------------------------------------------------------------------------------------

    template <
        typename map_string_string,
        typename map_string_void,
        typename tokenizer,
        bool checking
        >
    config_reader_kernel_1<map_string_string,map_string_void,tokenizer,checking>::
    config_reader_kernel_1(
        std::istream& in
    )
    {
        load_from(in);
    }

// ----------------------------------------------------------------------------------------

    template <
        typename map_string_string,
        typename map_string_void,
        typename tokenizer,
        bool checking
        >
    void config_reader_kernel_1<map_string_string,map_string_void,tokenizer,checking>::
    parse_config_file(
        config_reader_kernel_1<map_string_string,map_string_void,tokenizer,checking>& cr,
        tokenizer& tok,
        unsigned long& line_number,
        const bool top_of_recursion
    )
    {
        int type;
        std::string token;
        bool in_comment = false;
        bool seen_identifier = false;
        std::string identifier;
        while (true)
        {
            tok.get_token(type,token);
            // ignore white space
            if (type == tokenizer::WHITE_SPACE)
                continue;

            // basically ignore end of lines
            if (type == tokenizer::END_OF_LINE)
            {
                ++line_number;
                in_comment = false;
                continue;
            }

            // we are in a comment still so ignore this
            if (in_comment)
                continue;

            // if this is the start of a comment
            if (type == tokenizer::CHAR && token[0] == '#')
            {
                in_comment = true;
                continue;
            }

            // if this is the case then we have just finished parsing a block so we should
            // quit this function
            if ( (type == tokenizer::CHAR && token[0] == '}' && !top_of_recursion) ||
                 (type == tokenizer::END_OF_FILE && top_of_recursion) )
            {
                break;
            }

            if (seen_identifier)
            {
                seen_identifier = false;
                // the next character should be either a '=' or a '{'
                if (type != tokenizer::CHAR || (token[0] != '=' && token[0] != '{'))
                    throw config_reader_error(line_number);
                
                if (token[0] == '=')
                {
                    // we should parse the value out now
                    // first discard any white space
                    if (tok.peek_type() == tokenizer::WHITE_SPACE)
                        tok.get_token(type,token);

                    std::string value;
                    type = tok.peek_type();
                    token = tok.peek_token();
                    while (true)
                    {
                        if (type == tokenizer::END_OF_FILE || type == tokenizer::END_OF_LINE)
                            break;

                        if (type == tokenizer::CHAR && token[0] == '\\')
                        {
                            tok.get_token(type,token);
                            if (tok.peek_type() == tokenizer::CHAR && 
                                tok.peek_token()[0] == '#')
                            {
                                tok.get_token(type,token);
                                value += '#';
                            }
                            else if (tok.peek_type() == tokenizer::CHAR && 
                                tok.peek_token()[0] == '}')
                            {
                                tok.get_token(type,token);
                                value += '}';
                            }
                            else
                            {
                                value += '\\';
                            }
                        }
                        else if (type == tokenizer::CHAR && 
                                 (token[0] == '#' || token[0] == '}'))
                        {
                            break;
                        }
                        else
                        {
                            value += token;
                            tok.get_token(type,token);
                        }
                        type = tok.peek_type();
                        token = tok.peek_token();
                    } // while(true)

                    // strip of any tailing white space from value
                    std::string::size_type pos = value.find_last_not_of(" \t\r\n");
                    if (pos == std::string::npos)
                        value.clear();
                    else
                        value.erase(pos+1);

                    // make sure this key isn't already in the key_table
                    if (cr.key_table.is_in_domain(identifier))
                        throw config_reader_error(line_number,true);

                    // add this key/value pair to the key_table
                    cr.key_table.add(identifier,value);

                }
                else  // when token[0] == '{'
                {
                    // make sure this identifier isn't already in the block_table
                    if (cr.block_table.is_in_domain(identifier))
                        throw config_reader_error(line_number,true);

                    config_reader_kernel_1* new_cr = new config_reader_kernel_1;
                    void* vtemp = new_cr;
                    try { cr.block_table.add(identifier,vtemp); }
                    catch (...) { delete new_cr; throw; }

                    // now parse this block 
                    parse_config_file(*new_cr,tok,line_number,false);
                }
            }
            else
            {
                // the next thing should be an identifier but if it isn't this is an error
                if (type != tokenizer::IDENTIFIER)
                    throw config_reader_error(line_number);

                seen_identifier = true;
                identifier = token;
            }
        } // while (true) 
    }

// ----------------------------------------------------------------------------------------

    template <
        typename map_string_string,
        typename map_string_void,
        typename tokenizer,
        bool checking
        >
    config_reader_kernel_1<map_string_string,map_string_void,tokenizer,checking>::
    ~config_reader_kernel_1(
    ) 
    {
        clear();
    }

// ----------------------------------------------------------------------------------------

    template <
        typename map_string_string,
        typename map_string_void,
        typename tokenizer,
        bool checking
        >
    bool config_reader_kernel_1<map_string_string,map_string_void,tokenizer,checking>::
    is_key_defined (
        const std::string& key
    ) const
    {
        return key_table.is_in_domain(key);
    }

// ----------------------------------------------------------------------------------------

    template <
        typename map_string_string,
        typename map_string_void,
        typename tokenizer,
        bool checking
        >
    bool config_reader_kernel_1<map_string_string,map_string_void,tokenizer,checking>::
    is_block_defined (
        const std::string& name
    ) const
    {
        return block_table.is_in_domain(name);
    }

// ----------------------------------------------------------------------------------------

    template <
        typename mss,
        typename msv,
        typename tokenizer,
        bool checking
        >
    const config_reader_kernel_1<mss,msv,tokenizer,checking>& config_reader_kernel_1<mss,msv,tokenizer,checking>::
    block (
        const std::string& name
    ) const
    {
        config_reader_kernel_1_helpers::helper<config_reader_kernel_1,checking>::
            check_block_precondition(*this,name);
        return *reinterpret_cast<config_reader_kernel_1*>(block_table[name]);
    }

// ----------------------------------------------------------------------------------------

    template <
        typename map_string_string,
        typename map_string_void,
        typename tokenizer,
        bool checking
        >
    const std::string& config_reader_kernel_1<map_string_string,map_string_void,tokenizer,checking>::
    operator[] (
        const std::string& key
    ) const
    {
        config_reader_kernel_1_helpers::helper<config_reader_kernel_1,checking>::
            check_operator_bracket_precondition(*this,key);
        return key_table[key];
    }

// ----------------------------------------------------------------------------------------

    template <
        typename map_string_string,
        typename map_string_void,
        typename tokenizer,
        bool checking
        >
    template <
        typename queue_of_strings
        >
    void config_reader_kernel_1<map_string_string,map_string_void,tokenizer,checking>::
    get_keys (
        queue_of_strings& keys
    ) const
    {
        keys.clear();
        key_table.reset();
        std::string temp;
        while (key_table.move_next())
        {
            temp = key_table.element().key();
            keys.enqueue(temp);
        }
    }

// ----------------------------------------------------------------------------------------

    template <
        typename map_string_string,
        typename map_string_void,
        typename tokenizer,
        bool checking
        >
    bool config_reader_kernel_1<map_string_string,map_string_void,tokenizer,checking>::
    at_start (
    ) const 
    {
        return block_table.at_start();
    }

// ----------------------------------------------------------------------------------------

    template <
        typename map_string_string,
        typename map_string_void,
        typename tokenizer,
        bool checking
        >
    void config_reader_kernel_1<map_string_string,map_string_void,tokenizer,checking>::
    reset (
    ) const 
    {
        block_table.reset();
    }

// ----------------------------------------------------------------------------------------

    template <
        typename map_string_string,
        typename map_string_void,
        typename tokenizer,
        bool checking
        >
    bool config_reader_kernel_1<map_string_string,map_string_void,tokenizer,checking>::
    current_element_valid (
    ) const 
    {
        return block_table.current_element_valid();
    }

// ----------------------------------------------------------------------------------------

    template <
        typename mss,
        typename msv,
        typename tokenizer,
        bool checking
        >
    const config_reader_kernel_1<mss,msv,tokenizer,checking>& config_reader_kernel_1<mss,msv,tokenizer,checking>::
    element (
    ) const 
    {
        config_reader_kernel_1_helpers::helper<config_reader_kernel_1,checking>::
            check_element_precondition(*this);
        return *reinterpret_cast<config_reader_kernel_1*>(block_table.element().value());
    }

// ----------------------------------------------------------------------------------------

    template <
        typename mss,
        typename msv,
        typename tokenizer,
        bool checking
        >
    config_reader_kernel_1<mss,msv,tokenizer,checking>& config_reader_kernel_1<mss,msv,tokenizer,checking>::
    element (
    ) 
    {
        config_reader_kernel_1_helpers::helper<config_reader_kernel_1,checking>::
            check_element_precondition(*this);
        return *reinterpret_cast<config_reader_kernel_1*>(block_table.element().value());
    }

// ----------------------------------------------------------------------------------------

    template <
        typename map_string_string,
        typename map_string_void,
        typename tokenizer,
        bool checking
        >
    bool config_reader_kernel_1<map_string_string,map_string_void,tokenizer,checking>::
    move_next (
    ) const 
    {
        return block_table.move_next();
    }

// ----------------------------------------------------------------------------------------

    template <
        typename map_string_string,
        typename map_string_void,
        typename tokenizer,
        bool checking
        >
    unsigned long config_reader_kernel_1<map_string_string,map_string_void,tokenizer,checking>::
    size (
    ) const 
    {
        return block_table.size();
    }

// ----------------------------------------------------------------------------------------

    template <
        typename map_string_string,
        typename map_string_void,
        typename tokenizer,
        bool checking
        >
    const std::string& config_reader_kernel_1<map_string_string,map_string_void,tokenizer,checking>::
    current_block_name (
    ) const
    {
        config_reader_kernel_1_helpers::helper<config_reader_kernel_1,checking>::
            check_current_block_name_precondition(*this);
        return block_table.element().key();
    }

// ----------------------------------------------------------------------------------------

}

#endif // DLIB_CONFIG_READER_KERNEl_1_

