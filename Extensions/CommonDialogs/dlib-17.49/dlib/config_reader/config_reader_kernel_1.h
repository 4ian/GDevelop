// Copyright (C) 2003  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#ifndef DLIB_CONFIG_READER_KERNEl_1_
#define DLIB_CONFIG_READER_KERNEl_1_

#include "config_reader_kernel_abstract.h"
#include <string>
#include <iostream>
#include <sstream>
#include <fstream>
#include "../algs.h"
#include "../stl_checked/std_vector_c.h"

#ifndef DLIB_ISO_CPP_ONLY
#include "config_reader_thread_safe_1.h"
#endif

namespace dlib
{

    template <
        typename map_string_string,
        typename map_string_void,
        typename tokenizer
        >
    class config_reader_kernel_1 
    {

        /*!                
            REQUIREMENTS ON map_string_string
                is an implementation of map/map_kernel_abstract.h that maps std::string to std::string

            REQUIREMENTS ON map_string_void 
                is an implementation of map/map_kernel_abstract.h that maps std::string to void*

            REQUIREMENTS ON tokenizer
                is an implementation of tokenizer/tokenizer_kernel_abstract.h 

            CONVENTION
                key_table.is_in_domain(x) == is_key_defined(x)
                block_table.is_in_domain(x) == is_block_defined(x)

                key_table[x] == operator[](x)
                block_table[x] == (void*)&block(x)
        !*/
        
    public:

        // These two typedefs are defined for backwards compatibility with older versions of dlib.
        typedef config_reader_kernel_1 kernel_1a;
#ifndef DLIB_ISO_CPP_ONLY
        typedef config_reader_thread_safe_1<
            config_reader_kernel_1,
            map_string_void 
            > thread_safe_1a;
#endif // DLIB_ISO_CPP_ONLY


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

        class file_not_found : public dlib::error 
        {
            friend class config_reader_kernel_1;
            file_not_found(
                const std::string& file_name_
            ) : 
                dlib::error(ECONFIG_READER, "Error in config_reader, unable to open file " + file_name_),
                file_name(file_name_)
            {}

            ~file_not_found() throw() {}

        public:
            const std::string file_name;
        };

        class config_reader_access_error : public dlib::error
        {
        public:
            config_reader_access_error(
                const std::string& block_name_,
                const std::string& key_name_
            ) : 
                dlib::error(ECONFIG_READER),
                block_name(block_name_), 
                key_name(key_name_)
            {
                std::ostringstream sout;
                sout << "Error in config_reader.\n";
                if (block_name.size() > 0)
                    sout << "   A block with the name '" << block_name << "' was expected but not found.";
                else if (key_name.size() > 0)
                    sout << "   A key with the name '" << key_name << "' was expected but not found.";

                const_cast<std::string&>(info) = sout.str();
            }

            ~config_reader_access_error() throw() {}
            const std::string block_name;
            const std::string key_name;
        };

        config_reader_kernel_1(
            const std::string& config_file 
        );

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

        void load_from (
            const std::string& config_file
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

        template <
            typename alloc 
            >
        void get_keys (
            std::vector<std::string,alloc>& keys
        ) const;

        template <
            typename alloc 
            >
        void get_keys (
            std_vector_c<std::string,alloc>& keys
        ) const;

        template <
            typename queue_of_strings
            >
        void get_blocks (
            queue_of_strings& blocks
        ) const;

        template <
            typename alloc 
            >
        void get_blocks (
            std::vector<std::string,alloc>& blocks
        ) const;

        template <
            typename alloc 
            >
        void get_blocks (
            std_vector_c<std::string,alloc>& blocks
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
// ----------------------------------------------------------------------------------------
    // member function definitions
// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------

    template <
        typename map_string_string,
        typename map_string_void,
        typename tokenizer
        >
    config_reader_kernel_1<map_string_string,map_string_void,tokenizer>::
    config_reader_kernel_1(
    )
    {
    }

// ----------------------------------------------------------------------------------------

    template <
        typename map_string_string,
        typename map_string_void,
        typename tokenizer
        >
    void config_reader_kernel_1<map_string_string,map_string_void,tokenizer>::
    clear(
    )
    {
        // free all our blocks
        block_table.reset();
        while (block_table.move_next())
        {
            delete static_cast<config_reader_kernel_1*>(block_table.element().value());
        }
        block_table.clear();
        key_table.clear();
    }

// ----------------------------------------------------------------------------------------

    template <
        typename map_string_string,
        typename map_string_void,
        typename tokenizer
        >
    void config_reader_kernel_1<map_string_string,map_string_void,tokenizer>::
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
        typename tokenizer
        >
    void config_reader_kernel_1<map_string_string,map_string_void,tokenizer>::
    load_from(
        const std::string& config_file
    )
    {
        clear();
        std::ifstream fin(config_file.c_str());
        if (!fin)
            throw file_not_found(config_file);

        load_from(fin);
    }

// ----------------------------------------------------------------------------------------

    template <
        typename map_string_string,
        typename map_string_void,
        typename tokenizer
        >
    config_reader_kernel_1<map_string_string,map_string_void,tokenizer>::
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
        typename tokenizer
        >
    config_reader_kernel_1<map_string_string,map_string_void,tokenizer>::
    config_reader_kernel_1(
        const std::string& config_file
    )
    {
        load_from(config_file);
    }

// ----------------------------------------------------------------------------------------

    template <
        typename map_string_string,
        typename map_string_void,
        typename tokenizer
        >
    void config_reader_kernel_1<map_string_string,map_string_void,tokenizer>::
    parse_config_file(
        config_reader_kernel_1<map_string_string,map_string_void,tokenizer>& cr,
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
        typename tokenizer
        >
    config_reader_kernel_1<map_string_string,map_string_void,tokenizer>::
    ~config_reader_kernel_1(
    ) 
    {
        clear();
    }

// ----------------------------------------------------------------------------------------

    template <
        typename map_string_string,
        typename map_string_void,
        typename tokenizer
        >
    bool config_reader_kernel_1<map_string_string,map_string_void,tokenizer>::
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
        typename tokenizer
        >
    bool config_reader_kernel_1<map_string_string,map_string_void,tokenizer>::
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
        typename tokenizer
        >
    const config_reader_kernel_1<mss,msv,tokenizer>& config_reader_kernel_1<mss,msv,tokenizer>::
    block (
        const std::string& name
    ) const
    {
        if (is_block_defined(name) == false)
        {
            throw config_reader_access_error(name,"");
        }

        return *static_cast<config_reader_kernel_1*>(block_table[name]);
    }

// ----------------------------------------------------------------------------------------

    template <
        typename map_string_string,
        typename map_string_void,
        typename tokenizer
        >
    const std::string& config_reader_kernel_1<map_string_string,map_string_void,tokenizer>::
    operator[] (
        const std::string& key
    ) const
    {
        if (is_key_defined(key) == false)
        {
            throw config_reader_access_error("",key);
        }

        return key_table[key];
    }

// ----------------------------------------------------------------------------------------

    template <
        typename map_string_string,
        typename map_string_void,
        typename tokenizer
        >
    template <
        typename queue_of_strings
        >
    void config_reader_kernel_1<map_string_string,map_string_void,tokenizer>::
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
        typename tokenizer
        >
    template <
        typename alloc 
        >
    void config_reader_kernel_1<map_string_string,map_string_void,tokenizer>::
    get_keys (
        std::vector<std::string,alloc>& keys
    ) const
    {
        keys.clear();
        key_table.reset();
        while (key_table.move_next())
        {
            keys.push_back(key_table.element().key());
        }
    }

// ----------------------------------------------------------------------------------------

    template <
        typename map_string_string,
        typename map_string_void,
        typename tokenizer
        >
    template <
        typename alloc 
        >
    void config_reader_kernel_1<map_string_string,map_string_void,tokenizer>::
    get_keys (
        std_vector_c<std::string,alloc>& keys
    ) const
    {
        keys.clear();
        key_table.reset();
        while (key_table.move_next())
        {
            keys.push_back(key_table.element().key());
        }
    }

// ----------------------------------------------------------------------------------------

    template <
        typename map_string_string,
        typename map_string_void,
        typename tokenizer
        >
    template <
        typename queue_of_strings
        >
    void config_reader_kernel_1<map_string_string,map_string_void,tokenizer>::
    get_blocks (
        queue_of_strings& blocks
    ) const
    {
        blocks.clear();
        block_table.reset();
        std::string temp;
        while (block_table.move_next())
        {
            temp = block_table.element().key();
            blocks.enqueue(temp);
        }
    }

// ----------------------------------------------------------------------------------------

    template <
        typename map_string_string,
        typename map_string_void,
        typename tokenizer
        >
    template <
        typename alloc 
        >
    void config_reader_kernel_1<map_string_string,map_string_void,tokenizer>::
    get_blocks (
        std::vector<std::string,alloc>& blocks
    ) const
    {
        blocks.clear();
        block_table.reset();
        while (block_table.move_next())
        {
            blocks.push_back(block_table.element().key());
        }
    }

// ----------------------------------------------------------------------------------------

    template <
        typename map_string_string,
        typename map_string_void,
        typename tokenizer
        >
    template <
        typename alloc 
        >
    void config_reader_kernel_1<map_string_string,map_string_void,tokenizer>::
    get_blocks (
        std_vector_c<std::string,alloc>& blocks
    ) const
    {
        blocks.clear();
        block_table.reset();
        while (block_table.move_next())
        {
            blocks.push_back(block_table.element().key());
        }
    }

// ----------------------------------------------------------------------------------------

}

#endif // DLIB_CONFIG_READER_KERNEl_1_

