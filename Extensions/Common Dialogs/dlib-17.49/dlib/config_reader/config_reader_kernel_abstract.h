// Copyright (C) 2003  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#undef DLIB_CONFIG_READER_KERNEl_ABSTRACT_
#ifdef DLIB_CONFIG_READER_KERNEl_ABSTRACT_

#include <string>
#include <iosfwd>

namespace dlib
{

    class config_reader 
    {

        /*!                
            INITIAL VALUE
                - there aren't any keys defined for this object
                - there aren't any blocks defined for this object

            POINTERS AND REFERENCES TO INTERNAL DATA
                The destructor, clear(), and load_from() invalidate pointers
                and references to internal data.  All other functions are guaranteed
                to NOT invalidate pointers or references to internal data.

            WHAT THIS OBJECT REPRESENTS
                This object represents something which is intended to be used to read
                text configuration files that are defined by the following EBNF (with
                config_file as the starting symbol):
            
                config_file    = block;
                block          = { key_value_pair | sub_block };
                key_value_pair = key_name, "=", value;
                sub_block      = block_name, "{", block, "}";

                key_name       = identifier;
                block_name     = identifier;
                value          = matches any string of text that ends with a newline character, # or }.  
                                 note that the trailing newline, # or } is not part of the value though.
                identifier     = Any string that matches the following regular expression:
                                 [a-zA-Z][a-zA-Z0-9_-\.]*
                                 i.e. Any string that starts with a letter and then is continued
                                 with any number of letters, numbers, _ . or - characters.

                Whitespace and comments are ignored.  A comment is text that starts with # (but not \#
                since the \ escapes the # so that you can have a # symbol in a value if you want) and 
                ends in a new line.  You can also escape a } (e.g. "\}") if you want to have one in a 
                value.

                Note that in a value the leading and trailing white spaces are stripped off but any 
                white space inside the value is preserved.

                Also note that all key_names and block_names within a block syntax group must be unique 
                but don't have to be globally unique.  I.e. different blocks can reuse names. 

                EXAMPLE CONFIG FILES:

                    Example 1:
                        #comment.  This line is ignored because it starts with #

                        #here we have key1 which will have the value of "my value"
                        key1 = my value 

                        another_key=  another value  # this is another key called "another_key" with
                                                     # a value of "another value"

                        # this key's value is the empty string.  I.e. ""
                        key2=

                    Example 2:
                        #this example illustrates the use of blocks
                        some_key = blah blah

                        # now here is a block
                        our_block
                        {
                            # here we can define some keys and values that are local to this block.
                            a_key = something
                            foo = bar
                            some_key = more stuff  # note that it is ok to name our key this even though
                                                   # there is a key called some_key above.  This is because
                                                   # we are doing so inside a different block
                        }

                        another_block { foo = bar2 }  # this block has only one key and is all on a single line
        !*/
    
    public:

        // exception classes
        class config_reader_error : public dlib::error 
        {
            /*!
                GENERAL
                    This exception is thrown if there is an error while parsing the
                    config file.  The type member of this exception will be set
                    to ECONFIG_READER.

                INTERPRETING THIS EXCEPTION
                    - line_number == the line number the parser was at when the 
                      error occurred.
                    - if (redefinition) then
                        - The key or block name on line line_number has already
                          been defined in this scope which is an error.
                    - else
                        - Some other general syntax error was detected
            !*/
        public:
            const unsigned long line_number;
            const bool redefinition;
        };

        class file_not_found : public dlib::error 
        {
            /*!
                GENERAL
                    This exception is thrown if the config file can't be opened for
                    some reason.  The type member of this exception will be set
                    to ECONFIG_READER.

                INTERPRETING THIS EXCEPTION
                    - file_name == the name of the config file which we failed to open
            !*/
        public:
            const std::string file_name;
        };


        class config_reader_access_error : public dlib::error
        {
            /*!
                GENERAL
                    This exception is thrown if you try to access a key or
                    block that doesn't exist inside a config reader.  The type 
                    member of this exception will be set to ECONFIG_READER.
            !*/
        public:
            config_reader_access_error(
                const std::string& block_name_,
                const std::string& key_name_
            );
            /*!
                ensures
                    - #block_name == block_name_
                    - #key_name == key_name_
            !*/

            const std::string block_name;
            const std::string key_name;
        };

    // --------------------------

        config_reader(
        );
        /*!
            ensures 
                - #*this is properly initialized
                - This object will not have any keys or blocks defined in it.  
            throws
                - std::bad_alloc
                - config_reader_error
        !*/

        config_reader(
            std::istream& in
        );
        /*!
            ensures 
                - #*this is properly initialized
                - reads the config file to parse from the given input stream,
                  parses it and loads this object up with all the sub blocks and
                  key/value pairs it finds.
                - before the load is performed, the previous state of the config file
                  reader is erased.  So after the load the config file reader will contain
                  only information from the given config file.
                - This object will represent the top most block of the config file.
            throws
                - std::bad_alloc
                - config_reader_error
        !*/

        config_reader(
            const std::string& config_file 
        );
        /*!
            ensures 
                - #*this is properly initialized
                - parses the config file named by the config_file string.  Specifically, 
                  parses it and loads this object up with all the sub blocks and
                  key/value pairs it finds in the file.
                - before the load is performed, the previous state of the config file
                  reader is erased.  So after the load the config file reader will contain
                  only information from the given config file.
                - This object will represent the top most block of the config file.
            throws
                - std::bad_alloc
                - config_reader_error
                - file_not_found
        !*/

        virtual ~config_reader(
        ); 
        /*!
            ensures
                - all memory associated with *this has been released
        !*/

        void clear(
        );
        /*!
            ensures
                - #*this has its initial value
            throws
                - std::bad_alloc 
                    If this exception is thrown then *this is unusable 
                    until clear() is called and succeeds
        !*/

        void load_from (
            std::istream& in
        );
        /*!
            ensures 
                - reads the config file to parse from the given input stream,
                  parses it and loads this object up with all the sub blocks and
                  key/value pairs it finds.
                - before the load is performed, the previous state of the config file
                  reader is erased.  So after the load the config file reader will contain
                  only information from the given config file.
                - *this will represent the top most block of the config file contained
                  in the input stream in.
            throws
                - std::bad_alloc 
                    If this exception is thrown then *this is unusable 
                    until clear() is called and succeeds
                - config_reader_error
                    If this exception is thrown then this object will
                    revert to its initial value.
        !*/

        void load_from (
            const std::string& config_file
        );
        /*!
            ensures 
                - parses the config file named by the config_file string.  Specifically, 
                  parses it and loads this object up with all the sub blocks and
                  key/value pairs it finds in the file.  
                - before the load is performed, the previous state of the config file
                  reader is erased.  So after the load the config file reader will contain
                  only information from the given config file.
                - This object will represent the top most block of the config file.
            throws
                - std::bad_alloc 
                    If this exception is thrown then *this is unusable 
                    until clear() is called and succeeds
                - config_reader_error
                    If this exception is thrown then this object will
                    revert to its initial value.
                - file_not_found
                    If this exception is thrown then this object will
                    revert to its initial value.
        !*/

        bool is_key_defined (
            const std::string& key_name
        ) const;
        /*!
            ensures
                - if (there is a key with the given name defined within this config_reader's block) then
                    - returns true
                - else
                    - returns false
        !*/

        bool is_block_defined (
            const std::string& block_name
        ) const;
        /*!
            ensures
                - if (there is a sub block with the given name defined within this config_reader's block) then
                    - returns true
                - else
                    - returns false
        !*/

        typedef config_reader this_type;
        const this_type& block (
            const std::string& block_name
        ) const;
        /*!
            ensures
                - if (is_block_defined(block_name) == true) then
                    - returns a const reference to the config_reader that represents the given named sub block
                - else
                    - throws config_reader_access_error
            throws
                - config_reader_access_error
                    if this exception is thrown then its block_name field will be set to the
                    given block_name string.
        !*/

        const std::string& operator[] (
            const std::string& key_name
        ) const;
        /*!
            ensures
                - if (is_key_defined(key_name) == true) then
                    - returns a const reference to the value string associated with the given key in 
                      this config_reader's block.
                - else
                    - throws config_reader_access_error
            throws
                - config_reader_access_error
                    if this exception is thrown then its key_name field will be set to the
                    given key_name string.
        !*/

        template <
            typename queue_of_strings
            >
        void get_keys (
            queue_of_strings& keys
        ) const;
        /*!
            requires
                - queue_of_strings is an implementation of queue/queue_kernel_abstract.h 
                  with T set to std::string, or std::vector<std::string>, or 
                  dlib::std_vector_c<std::string>
            ensures 
                - #keys == a collection containing all the keys defined in this config_reader's block.
                  (i.e. for all strings str in keys it is the case that is_key_defined(str) == true)
        !*/

        template <
            typename queue_of_strings
            >
        void get_blocks (
            queue_of_strings& blocks
        ) const;
        /*!
            requires
                - queue_of_strings is an implementation of queue/queue_kernel_abstract.h 
                  with T set to std::string, or std::vector<std::string>, or 
                  dlib::std_vector_c<std::string>
            ensures 
                - #blocks == a collection containing the names of all the blocks defined in this 
                  config_reader's block.
                  (i.e. for all strings str in blocks it is the case that is_block_defined(str) == true)
        !*/

    private:

        // restricted functions
        config_reader(config_reader&);        // copy constructor
        config_reader& operator=(config_reader&);    // assignment operator

    };

}

#endif // DLIB_CONFIG_READER_KERNEl_ABSTRACT_

