// Copyright (C) 2006  Davis E. King (davisking@users.sourceforge.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#ifndef DLIB_LOGGER_KERNEl_1_
#define DLIB_LOGGER_KERNEl_1_

#include "../threads.h"
#include "../misc_api.h"
#include "../set.h"
#include "logger_kernel_abstract.h"
#include <limits>
#include <cstring>
#include "../algs.h"
#include "../assert.h"
#include "../uintn.h"
#include "../map.h"
#include "../smart_pointers.h"

namespace dlib
{

// ----------------------------------------------------------------------------------------

    class log_level
    {
    public:
        log_level(
            int priority_, 
            const char* name_
        ) : 
            priority(priority_)
        {
            strncpy(name,name_,19);
            name[19] = '\0';
        }

        int priority;
        char name[20];
    };

    const log_level LALL  (std::numeric_limits<int>::min(),"ALL");
    const log_level LNONE (std::numeric_limits<int>::max(),"NONE");
    const log_level LTRACE(-100,"TRACE");
    const log_level LDEBUG(0  ,"DEBUG");
    const log_level LINFO (100,"INFO ");
    const log_level LWARN (200,"WARN ");
    const log_level LERROR(300,"ERROR");
    const log_level LFATAL(400,"FATAL");

// ----------------------------------------------------------------------------------------

    void set_all_logging_output_streams (
        std::ostream& out
    );

    void set_all_logging_levels (
        const log_level& new_level
    );

// ----------------------------------------------------------------------------------------

    void print_default_logger_header (
        std::ostream& out,
        const std::string& logger_name,
        const log_level& l,
        const uint64 thread_id
    );

// ----------------------------------------------------------------------------------------

    class logger 
    {
        /*!
            INITIAL VALUE
                - print_header == print_default_logger_header
                - out.rdbuf() == std::cout.rdbuf()
                - cur_level == LERROR
                - auto_flush_enabled == true 

            CONVENTION
                - print_header == logger_header()
                - out.rdbuf() == output_streambuf()
                - cur_level == level()
                - logger_name == name()
                - auto_flush_enabled == auto_flush()

                - logger::gd::loggers == a set containing all currently existing loggers.
                - logger::gd::m == the mutex used to lock everything in the logger
                - logger::gd::thread_names == a map of thread ids to thread names.  
                - logger::gd::next_thread_name == the next thread name that will be given out
                  to a thread when we find that it isn't already in thread_names.
        !*/

        class logger_stream
        {
            /*!
                INITIAL VALUE
                    - been_used == false

                CONVENTION
                    - enabled == is_enabled()
                    - if (been_used) then
                        - logger::gd::m is locked
                        - someone has used the << operator to write something to the
                          output stream.
            !*/
        public:
            logger_stream (
                const log_level& l_,
                logger& log_
            ) :
                l(l_),
                log(log_),
                been_used(false),
                enabled (l.priority >= log.cur_level.priority)
            {}

            inline ~logger_stream(
            )
            {
                if (!been_used)
                {
                    return;
                }
                else
                {
                    print_end_of_line();
                }
            }

            bool is_enabled (
            ) const { return enabled; }

            template <typename T>
            inline logger_stream& operator << (
                const T& item
            )
            {
                if (!enabled)
                {
                    return *this;
                }
                else
                {
                    print_header_and_stuff();
                    log.out << item;
                    return *this;
                }
            }

        private:

            void print_header_and_stuff (
            );
            /*!
                ensures
                    - if (!been_used) then
                        - prints the logger header 
                        - locks log.gd.m
                        - #been_used == true
            !*/

            void print_end_of_line (
            );
            /*!
                ensures
                    - prints a newline to log.out
                    - unlocks log.gd.m
            !*/

            const log_level& l;
            logger& log;
            bool been_used;
            const bool enabled;
        };

        friend class logger_stream;
    public:

        logger (  
            const char* name_
        );

        virtual ~logger (
        ); 

        const std::string& name (
        ) const { return logger_name; }

        logger_stream operator << (
            const log_level& l
        ) const { return logger_stream(l,const_cast<logger&>(*this)); }

        bool is_child_of (
            const logger& log
        ) const
        {
            return (name().find(log.name() + ".") == 0) || (log.name() == name());
        }

        const log_level level (
        ) const 
        { 
            auto_mutex M(gd.m);
            return log_level(cur_level); 
        };

        void set_level (
            const log_level& new_level
        )
        {
            auto_mutex M(gd.m);
            gd.loggers.reset();
            while (gd.loggers.move_next())
            {
                if (gd.loggers.element()->is_child_of(*this))
                    gd.loggers.element()->cur_level = new_level;
            }

            gd.set_level(logger_name, new_level);
        }

        bool auto_flush (
        ) const 
        { 
            auto_mutex M(gd.m);
            return auto_flush_enabled;
        };

        void set_auto_flush (
            bool enabled
        )
        {
            auto_mutex M(gd.m);
            gd.loggers.reset();
            while (gd.loggers.move_next())
            {
                if (gd.loggers.element()->is_child_of(*this))
                    gd.loggers.element()->auto_flush_enabled = enabled;
            }

            gd.set_auto_flush(logger_name, enabled);
        }

        std::streambuf* output_streambuf (
        )
        {
            auto_mutex M(gd.m);
            return out.rdbuf();
        }

        void set_output_stream (
            std::ostream& out_
        ) 
        {
            auto_mutex M(gd.m);
            gd.loggers.reset();
            while (gd.loggers.move_next())
            {
                if (gd.loggers.element()->is_child_of(*this))
                    gd.loggers.element()->out.rdbuf(out_.rdbuf());
            }

            gd.set_output_stream(logger_name, out_);
        }

        typedef void (*print_header_type)(
            std::ostream& out, 
            const std::string& logger_name, 
            const log_level& l,
            const uint64 thread_id
        );

        print_header_type logger_header (
        ) const { return print_header; }

        void set_logger_header (
            print_header_type ph
        )
        {
            auto_mutex M(gd.m);
            gd.loggers.reset();
            while (gd.loggers.move_next())
            {
                if (gd.loggers.element()->is_child_of(*this))
                    gd.loggers.element()->print_header = ph;
            }

            gd.set_logger_header(logger_name, ph);
        }

    private:


        struct global_data
        {
            rmutex m;
            set<logger*>::kernel_1b loggers;
            map<thread_id_type,uint64>::kernel_1b thread_names;
            uint64 next_thread_name;

            global_data (
            );

            ~global_data(
            );

            uint64 get_thread_name (
            );
            /*!
                requires
                    - m is locked
                ensures
                    - returns a unique id for the calling thread.  also makes the number
                      small and nice unlike what you get from get_thread_id()
            !*/

            void thread_end_handler (
            );
            /*!
                ensures
                    - removes the terminated thread from thread_names
            !*/

            struct level_container
            {
                level_container ();

                log_level val;
                map<std::string,scoped_ptr<level_container> >::kernel_1b_c table;
            } level_table;

            const log_level level (
                const std::string& name
            ) const; 
            /*!
                ensures
                    - returns the level loggers with the given name are supposed 
                      to have
            !*/

            void set_level (
                const std::string& name,
                const log_level& new_level
            );
            /*!
                ensures
                    - for all children C of name:
                        - #level(C) == new_level
                    - if name == "" then
                        - for all loggers L:
                            - #level(L) == new_level
            !*/

            struct auto_flush_container
            {
                bool val;
                map<std::string,scoped_ptr<auto_flush_container> >::kernel_1b_c table;
            } auto_flush_table;

            bool auto_flush (
                const std::string& name
            ) const;
            /*!
                ensures
                    - returns the auto_flush value loggers with the given name are supposed 
                      to have
            !*/

            void set_auto_flush (
                const std::string& name,
                bool enabled
            );
            /*!
                ensures
                    - for all children C of name:
                        - #auto_flush_enabled(C) == enabled 
                    - if name == "" then
                        - for all loggers L:
                            - #auto_flush_enabled(L) == enabled 
            !*/

            struct output_streambuf_container
            {
                std::streambuf* val;
                map<std::string,scoped_ptr<output_streambuf_container> >::kernel_1b_c table;
            } streambuf_table;

            std::streambuf* output_streambuf (
                const std::string& name
            );
            /*!
                ensures
                    - returns the streambuf loggers with the given name are supposed 
                      to have
            !*/

            void set_output_stream (
                const std::string& name,
                std::ostream& out_
            );
            /*!
                ensures
                    - for all children C of name:
                        - #output_streambuf(C) == out_.rdbuf() 
                    - if name == "" then
                        - for all loggers L:
                            - #output_streambuf(L) == out_.rdbuf() 
            !*/

            struct logger_header_container
            {
                print_header_type val;
                map<std::string,scoped_ptr<logger_header_container> >::kernel_1b_c table;
            } header_table;

            print_header_type logger_header (
                const std::string& name
            );
            /*!
                ensures
                    - returns the header function loggers with the given name are supposed 
                      to have
            !*/

            void set_logger_header (
                const std::string& name,
                print_header_type ph
            );
            /*!
                ensures
                    - for all children C of name:
                        - #logger_header(C) == ph 
                    - if name == "" then
                        - for all loggers L:
                            - #logger_header(L) == ph 
            !*/

        }; // end of struct global_data

        static global_data& get_global_data();

        friend void set_all_logging_levels (
            const log_level& new_level
        );

        friend void set_all_logging_output_streams (
            std::ostream& out
        );


        global_data& gd;

        const std::string logger_name;

        print_header_type print_header;
        bool auto_flush_enabled;
        std::ostream out;
        log_level cur_level;


        // restricted functions
        logger(const logger&);        // copy constructor
        logger& operator=(const logger&);    // assignment operator

    };    

// ----------------------------------------------------------------------------------------

}

#ifdef NO_MAKEFILE
#include "logger_kernel_1.cpp"
#endif

#endif // DLIB_LOGGER_KERNEl_1_

