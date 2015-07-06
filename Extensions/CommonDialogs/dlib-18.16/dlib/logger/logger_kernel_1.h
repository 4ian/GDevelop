// Copyright (C) 2006  Davis E. King (davis@dlib.net)
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
#include "../member_function_pointer.h"
#include <streambuf>
#include <vector>

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

        bool operator< (const log_level& rhs) const { return priority <  rhs.priority; }
        bool operator<=(const log_level& rhs) const { return priority <= rhs.priority; }
        bool operator> (const log_level& rhs) const { return priority >  rhs.priority; }
        bool operator>=(const log_level& rhs) const { return priority >= rhs.priority; }

        int priority;
        char name[20];
    };

    inline std::ostream& operator<< (std::ostream& out, const log_level& item)
    {
        out << item.name;
        return out;
    }

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

    typedef void (*print_header_type)(
        std::ostream& out, 
        const std::string& logger_name, 
        const log_level& l,
        const uint64 thread_id
    );

    void set_all_logging_headers (
        const print_header_type& new_header
    );

// ----------------------------------------------------------------------------------------

    void print_default_logger_header (
        std::ostream& out,
        const std::string& logger_name,
        const log_level& l,
        const uint64 thread_id
    );

    template <
        typename T
        >
    void set_all_logging_output_hooks (
        T& object,
        void (T::*hook_)(const std::string& logger_name, 
                         const log_level& l,
                         const uint64 thread_id,
                         const char* message_to_log)
    );

    template <
        typename T
        >
    void set_all_logging_output_hooks (
        T& object
    )
    {
        set_all_logging_output_hooks(object, &T::log);
    }

// ----------------------------------------------------------------------------------------

    class logger 
    {
        /*!
            INITIAL VALUE
                - print_header == print_default_logger_header
                - out.rdbuf() == std::cout.rdbuf()
                - cur_level == LERROR
                - auto_flush_enabled == true 
                - hook.is_set() == false

            CONVENTION
                - print_header == logger_header()
                - if (hook.is_set() == false) then
                    - out.rdbuf() == output_streambuf()
                - else
                    - out.rdbuf() == &gd.hookbuf
                    - output_streambuf() == 0

                - cur_level == level()
                - logger_name == name()
                - auto_flush_enabled == auto_flush()

                - logger::gd::loggers == a set containing all currently existing loggers.
                - logger::gd::m == the mutex used to lock everything in the logger
                - logger::gd::thread_names == a map of thread ids to thread names.  
                - logger::gd::next_thread_name == the next thread name that will be given out
                  to a thread when we find that it isn't already in thread_names.
        !*/

    // ------------------------------------------------------------------------------------
    // ------------------------------------------------------------------------------------

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
        }; // end of class logger_stream

    // ------------------------------------------------------------------------------------
    // ------------------------------------------------------------------------------------

        friend class logger_stream;
    public:

        typedef member_function_pointer<const std::string&, const log_level&, 
                                        const uint64, const char*> hook_mfp;

        logger (  
            const std::string& name_
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

            // if there is an output hook set then we are supposed to return 0.
            if (hook)
                return 0;
            else
                return out.rdbuf();
        }

        template <
            typename T
            >
        void set_output_hook (
            T& object,
            void (T::*hook_)(const std::string& logger_name, 
                            const log_level& l,
                            const uint64 thread_id,
                            const char* message_to_log)
        )
        {
            auto_mutex M(gd.m);
            hook.set(object, hook_);

            gd.loggers.reset();
            while (gd.loggers.move_next())
            {
                if (gd.loggers.element()->is_child_of(*this))
                {
                    gd.loggers.element()->out.rdbuf(&gd.hookbuf);
                    gd.loggers.element()->hook = hook;
                }
            }

            gd.set_output_hook(logger_name, hook);
            gd.set_output_stream(logger_name, gd.hookbuf);
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
                {
                    gd.loggers.element()->out.rdbuf(out_.rdbuf());
                    gd.loggers.element()->hook.clear();
                }
            }

            gd.set_output_stream(logger_name, out_);

            hook.clear();
            gd.set_output_hook(logger_name, hook);
        }

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

    // ------------------------------------------------------------------------------------
    // ------------------------------------------------------------------------------------

        struct global_data
        {
            rmutex m;
            set<logger*>::kernel_1b loggers;
            map<thread_id_type,uint64>::kernel_1b thread_names;
            uint64 next_thread_name;

            // Make a very simple streambuf that writes characters into a std::vector<char>.  We can
            // use this as the output target for hooks.  The reason we don't just use a std::ostringstream
            // instead is that this way we can be guaranteed that logging doesn't perform memory allocations.
            // This is because a std::vector never frees memory.  I.e. its capacity() doesn't go down when
            // you resize it back to 0.  It just stays the same.
            class hook_streambuf : public std::streambuf
            {
            public:
                std::vector<char> buffer;
                int_type overflow ( int_type c)
                {
                    if (c != EOF) buffer.push_back(static_cast<char>(c));
                    return c;
                }

                std::streamsize xsputn ( const char* s, std::streamsize num)
                {
                    buffer.insert(buffer.end(), s, s+num);
                    return num;
                }
            };

            hook_streambuf hookbuf;

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

            void set_output_stream (
                const std::string& name,
                std::streambuf& buf 
            );
            /*!
                ensures
                    - for all children C of name:
                        - #output_streambuf(C) == &buf 
                    - if name == "" then
                        - for all loggers L:
                            - #output_streambuf(L) == &buf 
            !*/

            struct output_hook_container
            {
                hook_mfp val;
                map<std::string,scoped_ptr<output_hook_container> >::kernel_1b_c table;
            } hook_table;

            hook_mfp output_hook (
                const std::string& name
            );
            /*!
                ensures
                    - returns the hook loggers with the given name are supposed 
                      to have
            !*/

            void set_output_hook (
                const std::string& name,
                const hook_mfp& hook
            );
            /*!
                ensures
                    - for all children C of name:
                        - #output_hook(C) == hook 
                    - if name == "" then
                        - for all loggers L:
                            - #output_hook(L) == hook 
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

    // ------------------------------------------------------------------------------------
    // ------------------------------------------------------------------------------------

        friend void set_all_logging_levels (
            const log_level& new_level
        );

        friend void set_all_logging_headers (
            const print_header_type& new_header 
        );

        friend void set_all_logging_output_streams (
            std::ostream& out
        );

        template <
            typename T
            >
        friend void set_all_logging_output_hooks (
            T& object,
            void (T::*hook_)(const std::string& logger_name, 
                            const log_level& l,
                            const uint64 thread_id,
                            const char* message_to_log)
        )
        {
            logger::hook_mfp hook;

            // There is a bug in one of the versions (but not all apparently) of 
            // Visual studio 2005 that causes it to error out if <T> isn't in the
            // following line of code.  However, there is also a bug in gcc-3.3 
            // that causes it to error out if <T> is present.  So this works around
            // this problem.
#if defined(_MSC_VER) && _MSC_VER == 1400
            hook.set<T>(object, hook_);
#else
            hook.set(object, hook_);
#endif

            logger::global_data& gd = logger::get_global_data();
            auto_mutex M(gd.m);
            gd.loggers.reset();
            while (gd.loggers.move_next())
            {
                gd.loggers.element()->out.rdbuf(&gd.hookbuf);
                gd.loggers.element()->hook = hook;
            }

            gd.set_output_stream("",gd.hookbuf);
            gd.set_output_hook("",hook);
        }

    // ------------------------------------------------------------------------------------

        global_data& gd;

        const std::string logger_name;

        print_header_type print_header;
        bool auto_flush_enabled;
        std::ostream out;
        log_level cur_level;

        hook_mfp hook;


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

