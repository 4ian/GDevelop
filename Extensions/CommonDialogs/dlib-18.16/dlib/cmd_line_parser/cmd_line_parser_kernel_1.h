// Copyright (C) 2003  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#ifndef DLIB_CMD_LINE_PARSER_KERNEl_1_
#define DLIB_CMD_LINE_PARSER_KERNEl_1_

#include "cmd_line_parser_kernel_abstract.h"
#include "../algs.h"
#include <string>
#include <sstream>
#include "../interfaces/enumerable.h"
#include "../interfaces/cmd_line_parser_option.h"
#include "../assert.h"
#include "../string.h"

namespace dlib
{

    template <
        typename charT,
        typename map,
        typename sequence,
        typename sequence2
        >
    class cmd_line_parser_kernel_1 : public enumerable<cmd_line_parser_option<charT> >
    {
        /*!
            REQUIREMENTS ON map
                is an implementation of map/map_kernel_abstract.h 
                is instantiated to map items of type std::basic_string<charT> to void*     

            REQUIREMENTS ON sequence
                is an implementation of sequence/sequence_kernel_abstract.h and
                is instantiated with std::basic_string<charT>

            REQUIREMENTS ON sequence2
                is an implementation of sequence/sequence_kernel_abstract.h and
                is instantiated with std::basic_string<charT>*

            INITIAL VALUE
                options.size()   == 0
                argv.size()      == 0
                have_parsed_line == false

            CONVENTION
                have_parsed_line           == parsed_line()
                argv[index]                == operator[](index)
                argv.size()                == number_of_arguments()
                *((option_t*)options[name])  == option(name)
                options.is_in_domain(name) == option_is_defined(name)
        !*/




    public:

        typedef charT char_type;
        typedef std::basic_string<charT> string_type;
        typedef cmd_line_parser_option<charT> option_type;

        // exception class
        class cmd_line_parse_error : public dlib::error 
        { 
            void set_info_string (
            )
            {
                std::ostringstream sout;
                switch (type)
                {
                    case EINVALID_OPTION:
                        sout << "Command line error: '" << narrow(item) << "' is not a valid option.";
                        break;
                    case ETOO_FEW_ARGS:
                        if (num > 1)
                        {
                            sout << "Command line error: The '" << narrow(item) << "' option requires " << num 
                                << " arguments."; 
                        }
                        else
                        {
                            sout << "Command line error: The '" << narrow(item) << "' option requires " << num 
                                << " argument."; 
                        }
                        break;
                    case ETOO_MANY_ARGS:
                        sout << "Command line error: The '" << narrow(item) << "' option does not take any arguments.\n";
                        break;
                    default:
                        sout << "Command line error.";
                        break;
                }
                const_cast<std::string&>(info) = wrap_string(sout.str(),0,0);
            }

        public: 
            cmd_line_parse_error(
                error_type t,
                const std::basic_string<charT>& _item
            ) :
                dlib::error(t),
                item(_item),
                num(0)
            { set_info_string();}

            cmd_line_parse_error(
                error_type t,
                const std::basic_string<charT>& _item,
                unsigned long _num
            ) :
                dlib::error(t),
                item(_item),
                num(_num)
            { set_info_string();}

            cmd_line_parse_error(
            ) :
                dlib::error(),
                item(),
                num(0)
            { set_info_string();}

            ~cmd_line_parse_error() throw() {}

            const std::basic_string<charT> item;
            const unsigned long num;
        };


    private:

        class option_t : public cmd_line_parser_option<charT>
        {
            /*!
                INITIAL VALUE
                    options.size()      == 0

                CONVENTION
                    name_                == name()
                    description_         == description()
                    number_of_arguments_ == number_of_arguments()
                    options[N][arg]      == argument(arg,N)
                    num_present          == count()                    
            !*/

            friend class cmd_line_parser_kernel_1<charT,map,sequence,sequence2>;

        public:

            const std::basic_string<charT>& name (
            ) const { return name_; }

            const std::basic_string<charT>& group_name (
            ) const { return group_name_; }

            const std::basic_string<charT>& description (
            ) const { return description_; }

            unsigned long number_of_arguments( 
            ) const { return number_of_arguments_; }

            unsigned long count (
            ) const { return num_present; }

            const std::basic_string<charT>& argument (
                unsigned long arg,
                unsigned long N
            ) const
            {  
                // make sure requires clause is not broken
                DLIB_CASSERT( N < count() && arg < number_of_arguments(),
                    "\tconst string_type& cmd_line_parser_option::argument(unsigned long,unsigned long)"
                    << "\n\tInvalid arguments were given to this function."
                    << "\n\tthis:                  " << this
                    << "\n\tN:                     " << N
                    << "\n\targ:                   " << arg 
                    << "\n\tname():                " << narrow(name())
                    << "\n\tcount():               " << count()
                    << "\n\tnumber_of_arguments(): " << number_of_arguments()
                    );

                return options[N][arg]; 
            }

        protected:

            option_t (
            ) : 
                num_present(0)
            {}

            ~option_t()
            {
                clear();
            }

        private:

            void clear()
            /*!
                ensures
                    - #count() == 0
                    - clears everything out of options and frees memory
            !*/
            {
                for (unsigned long i = 0; i < options.size(); ++i)
                {
                    delete [] options[i];
                }
                options.clear();
                num_present = 0;
            }

            // data members
            std::basic_string<charT> name_;
            std::basic_string<charT> group_name_;
            std::basic_string<charT> description_;
            sequence2 options;
            unsigned long number_of_arguments_;
            unsigned long num_present;



            // restricted functions
            option_t(option_t&);        // copy constructor
            option_t& operator=(option_t&);    // assignment operator
        };

    // --------------------------

    public:

        cmd_line_parser_kernel_1 (
        );

        virtual ~cmd_line_parser_kernel_1 (
        );

        void clear(
        );

        void parse (
            int argc,
            const charT** argv
        );

        void parse (
            int argc,
            charT** argv
        )
        {
            parse(argc, const_cast<const charT**>(argv));
        }

        bool parsed_line(
        ) const;

        bool option_is_defined (
            const string_type& name
        ) const;

        void add_option (
            const string_type& name,
            const string_type& description,
            unsigned long number_of_arguments = 0
        );

        void set_group_name (
            const string_type& group_name
        );

        string_type get_group_name (
        ) const { return group_name; }

        const cmd_line_parser_option<charT>& option (
            const string_type& name
        ) const;

        unsigned long number_of_arguments( 
        ) const;

        const string_type& operator[] (
            unsigned long index
        ) const;

        void swap (
            cmd_line_parser_kernel_1& item
        );

        // functions from the enumerable interface
        bool at_start (
        ) const { return options.at_start(); }

        void reset (
        ) const { options.reset(); }

        bool current_element_valid (
        ) const { return options.current_element_valid(); }

        const cmd_line_parser_option<charT>& element (
        ) const { return *static_cast<cmd_line_parser_option<charT>*>(options.element().value()); }

        cmd_line_parser_option<charT>& element (
        ) { return *static_cast<cmd_line_parser_option<charT>*>(options.element().value()); }

        bool move_next (
        ) const { return options.move_next(); }

        unsigned long size (
        ) const { return options.size(); }

    private:

        // data members
        map options;
        sequence argv;
        bool have_parsed_line;
        string_type group_name;

        // restricted functions
        cmd_line_parser_kernel_1(cmd_line_parser_kernel_1&);        // copy constructor
        cmd_line_parser_kernel_1& operator=(cmd_line_parser_kernel_1&);    // assignment operator

    };   
   
// ----------------------------------------------------------------------------------------

    template <
        typename charT,
        typename map,
        typename sequence,
        typename sequence2
        >
    inline void swap (
        cmd_line_parser_kernel_1<charT,map,sequence,sequence2>& a, 
        cmd_line_parser_kernel_1<charT,map,sequence,sequence2>& b 
    ) { a.swap(b); }   

// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------
    // member function definitions
// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------

    template <
        typename charT,
        typename map,
        typename sequence,
        typename sequence2
        >
    cmd_line_parser_kernel_1<charT,map,sequence,sequence2>::
    cmd_line_parser_kernel_1 (
    ) :
        have_parsed_line(false)
    {
    }

// ----------------------------------------------------------------------------------------

    template <
        typename charT,
        typename map,
        typename sequence,
        typename sequence2
        >
    cmd_line_parser_kernel_1<charT,map,sequence,sequence2>::
    ~cmd_line_parser_kernel_1 (
    ) 
    {
        // delete all option_t objects in options
        options.reset();
        while (options.move_next())
        {
            delete static_cast<option_t*>(options.element().value());
        }
    }

// ----------------------------------------------------------------------------------------

    template <
        typename charT,
        typename map,
        typename sequence,
        typename sequence2
        >
    void cmd_line_parser_kernel_1<charT,map,sequence,sequence2>::
    clear(
    )
    {
        have_parsed_line = false;
        argv.clear();


        // delete all option_t objects in options
        options.reset();
        while (options.move_next())
        {
            delete static_cast<option_t*>(options.element().value());
        }
        options.clear();
        reset();
    }

// ----------------------------------------------------------------------------------------

    template <
        typename charT,
        typename map,
        typename sequence,
        typename sequence2
        >
    void cmd_line_parser_kernel_1<charT,map,sequence,sequence2>::
    parse (
        int argc_,
        const charT** argv
    )
    {
        using namespace std;

        // make sure there aren't any arguments hanging around from the last time
        // parse was called
        this->argv.clear();

        // make sure that the options have been cleared of any arguments since
        // the last time parse() was called
        if (have_parsed_line)
        {
            options.reset();
            while (options.move_next())
            {
                static_cast<option_t*>(options.element().value())->clear();                
            }
            options.reset();
        }

        // this tells us if we have seen -- on the command line all by itself
        // or not.  
        bool escape = false;

        const unsigned long argc = static_cast<unsigned long>(argc_);
        try 
        {     

            for (unsigned long i = 1; i < argc; ++i)
            {            
                if (argv[i][0] == _dT(charT,'-') && !escape)
                {
                    // we are looking at the start of an option                

                    // --------------------------------------------------------------------
                    if (argv[i][1] == _dT(charT,'-'))
                    {
                        // we are looking at the start of a "long named" option
                        string_type temp = &argv[i][2];
                        string_type first_argument;
                        typename string_type::size_type pos = temp.find_first_of(_dT(charT,'='));
                        // This variable will be 1 if there is an argument supplied via the = sign
                        // and 0 otherwise.
                        unsigned long extra_argument = 0;
                        if (pos != string_type::npos)
                        {
                            // there should be an extra argument
                            extra_argument = 1;
                            first_argument = temp.substr(pos+1);
                            temp = temp.substr(0,pos);
                        }

                        // make sure this name is defined
                        if (!options.is_in_domain(temp))
                        {
                            // the long name is not a valid option                            
                            if (argv[i][2] == _dT(charT,'\0'))
                            {
                                // there was nothing after the -- on the command line
                                escape = true;
                                continue;
                            }
                            else
                            {
                                // there was something after the command line but it 
                                // wasn't a valid option
                                throw cmd_line_parse_error(EINVALID_OPTION,temp);
                            }                            
                        }
                        

                        option_t* o = static_cast<option_t*>(options[temp]);

                        // check the number of arguments after this option and make sure
                        // it is correct
                        if (argc + extra_argument <= o->number_of_arguments() + i) 
                        {
                            // there are too few arguments
                            throw cmd_line_parse_error(ETOO_FEW_ARGS,temp,o->number_of_arguments());    
                        }
                        if (extra_argument && first_argument.size() == 0 ) 
                        {
                            // if there would be exactly the right number of arguments if 
                            // the first_argument wasn't empty
                            if (argc == o->number_of_arguments() + i)
                                throw cmd_line_parse_error(ETOO_FEW_ARGS,temp,o->number_of_arguments());    
                            else
                            {
                                // in this case we just ignore the trailing = and parse everything
                                // the same.
                                extra_argument = 0;
                            }
                        }
                        // you can't force an option that doesn't have any arguments to take
                        // one by using the --option=arg syntax
                        if (extra_argument == 1 && o->number_of_arguments() == 0)
                        {
                            throw cmd_line_parse_error(ETOO_MANY_ARGS,temp);
                        }
                        





                        // at this point we know that the option is ok and we should
                        // populate its options object
                        if (o->number_of_arguments() > 0)
                        {

                            string_type* stemp = new string_type[o->number_of_arguments()];
                            unsigned long j = 0;

                            // add the argument after the = sign if one is present
                            if (extra_argument)
                            {
                                stemp[0] = first_argument;
                                ++j;
                            }

                            for (; j < o->number_of_arguments(); ++j)
                            {                            
                                stemp[j] = argv[i+j+1-extra_argument];
                            }
                            o->options.add(o->options.size(),stemp);
                        }
                        o->num_present += 1;


                        // adjust the value of i to account for the arguments to 
                        // this option
                        i += o->number_of_arguments() - extra_argument;
                    }
                    // --------------------------------------------------------------------
                    else
                    {
                        // we are looking at the start of a list of a single char options

                        // make sure there is something in this string other than -
                        if (argv[i][1] == _dT(charT,'\0'))
                        {
                            throw cmd_line_parse_error();                            
                        }

                        string_type temp = &argv[i][1];
                        const typename string_type::size_type num = temp.size();
                        for (unsigned long k = 0; k < num; ++k)
                        {
                            string_type name;
                            // Doing this instead of name = temp[k] seems to avoid a bug in g++ (Ubuntu/Linaro 4.5.2-8ubuntu4) 4.5.2
                            // which results in name[0] having the wrong value.
                            name.resize(1);
                            name[0] = temp[k];


                            // make sure this name is defined
                            if (!options.is_in_domain(name))
                            {
                                // the name is not a valid option
                                throw cmd_line_parse_error(EINVALID_OPTION,name);
                            }

                            option_t* o = static_cast<option_t*>(options[name]);

                            // if there are chars immediately following this option
                            int delta = 0;
                            if (num != k+1)
                            {
                                delta = 1;
                            }

                            // check the number of arguments after this option and make sure
                            // it is correct                            
                            if (argc + delta <= o->number_of_arguments() + i)
                            {
                                // there are too few arguments
                                std::ostringstream sout;
                                throw cmd_line_parse_error(ETOO_FEW_ARGS,name,o->number_of_arguments());    
                            }

                            
                            o->num_present += 1;

                            // at this point we know that the option is ok and we should
                            // populate its options object
                            if (o->number_of_arguments() > 0)
                            {
                                string_type* stemp = new string_type[o->number_of_arguments()];
                                if (delta == 1)
                                {
                                    temp = &argv[i][2+k];
                                    k = (unsigned long)num;  // this ensures that the argument to this 
                                              // option isn't going to be treated as a 
                                              // list of options
                                    
                                    stemp[0] = temp;
                                }
                                for (unsigned long j = 0; j < o->number_of_arguments()-delta; ++j)
                                {
                                    stemp[j+delta] = argv[i+j+1];
                                }
                                o->options.add(o->options.size(),stemp);

                                // adjust the value of i to account for the arguments to 
                                // this option
                                i += o->number_of_arguments()-delta;
                            }
                        } // for (unsigned long k = 0; k < num; ++k)
                    }
                    // --------------------------------------------------------------------

                }
                else
                {
                    // this is just a normal argument
                    string_type temp = argv[i];
                    this->argv.add(this->argv.size(),temp);             
                }

            }
            have_parsed_line = true;

        }
        catch (...)
        {
            have_parsed_line = false;

            // clear all the option objects
            options.reset();
            while (options.move_next())
            {
                static_cast<option_t*>(options.element().value())->clear();                
            }
            options.reset();

            throw;            
        }
    }

// ----------------------------------------------------------------------------------------

    template <
        typename charT,
        typename map,
        typename sequence,
        typename sequence2
        >
    bool cmd_line_parser_kernel_1<charT,map,sequence,sequence2>::
    parsed_line(
    ) const
    {
        return have_parsed_line;
    }

// ----------------------------------------------------------------------------------------

    template <
        typename charT,
        typename map,
        typename sequence,
        typename sequence2
        >
    bool cmd_line_parser_kernel_1<charT,map,sequence,sequence2>::
    option_is_defined (
        const string_type& name
    ) const
    {
        return options.is_in_domain(name);
    }

// ----------------------------------------------------------------------------------------

    template <
        typename charT,
        typename map,
        typename sequence,
        typename sequence2
        >
    void cmd_line_parser_kernel_1<charT,map,sequence,sequence2>::
    set_group_name (
        const string_type& group_name_
    )
    {
        group_name = group_name_;
    }

// ----------------------------------------------------------------------------------------

    template <
        typename charT,
        typename map,
        typename sequence,
        typename sequence2
        >
    void cmd_line_parser_kernel_1<charT,map,sequence,sequence2>::
    add_option (
        const string_type& name,
        const string_type& description,
        unsigned long number_of_arguments
    )
    {
        option_t* temp = new option_t;
        try
        { 
            temp->name_ = name;
            temp->group_name_ = group_name;
            temp->description_ = description;
            temp->number_of_arguments_ = number_of_arguments;
            void* t = temp;
            string_type n(name);
            options.add(n,t); 
        }catch (...) { delete temp; throw;}
    }

// ----------------------------------------------------------------------------------------

    template <
        typename charT,
        typename map,
        typename sequence,
        typename sequence2
        >
    const cmd_line_parser_option<charT>& cmd_line_parser_kernel_1<charT,map,sequence,sequence2>::
    option (
        const string_type& name
    ) const
    {
        return *static_cast<cmd_line_parser_option<charT>*>(options[name]);
    }

// ----------------------------------------------------------------------------------------

    template <
        typename charT,
        typename map,
        typename sequence,
        typename sequence2
        >
    unsigned long cmd_line_parser_kernel_1<charT,map,sequence,sequence2>::
    number_of_arguments( 
    ) const
    {
        return argv.size();
    }

// ----------------------------------------------------------------------------------------

    template <
        typename charT,
        typename map,
        typename sequence,
        typename sequence2
        >
    const std::basic_string<charT>& cmd_line_parser_kernel_1<charT,map,sequence,sequence2>::
    operator[] (
        unsigned long index
    ) const
    {
        return argv[index];
    }

// ----------------------------------------------------------------------------------------

    template <
        typename charT,
        typename map,
        typename sequence,
        typename sequence2
        >
    void cmd_line_parser_kernel_1<charT,map,sequence,sequence2>::
    swap (
        cmd_line_parser_kernel_1<charT,map,sequence,sequence2>& item
    )
    {
        options.swap(item.options);
        argv.swap(item.argv);
        exchange(have_parsed_line,item.have_parsed_line);
    }

// ----------------------------------------------------------------------------------------

}

#endif // DLIB_CMD_LINE_PARSER_KERNEl_1_

