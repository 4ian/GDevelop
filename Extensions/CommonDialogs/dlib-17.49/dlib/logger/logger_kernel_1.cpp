// Copyright (C) 2006  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#ifndef DLIB_LOGGER_KERNEL_1_CPp_
#define DLIB_LOGGER_KERNEL_1_CPp_

#include "logger_kernel_1.h"
#include <iostream>
#include <sstream>

namespace dlib
{
    
// ----------------------------------------------------------------------------------------

    void set_all_logging_output_streams (
        std::ostream& out_
    )
    {
        logger::global_data& gd = logger::get_global_data();
        auto_mutex M(gd.m);
        gd.loggers.reset();
        while (gd.loggers.move_next())
        {
            gd.loggers.element()->out.rdbuf(out_.rdbuf());
            gd.loggers.element()->hook.clear();
        }

        gd.set_output_stream("",out_);

        // set the default hook to be an empty member function pointer
        logger::hook_mfp hook;
        gd.set_output_hook("",hook);
    }

    void set_all_logging_levels (
        const log_level& new_level
    )
    {
        logger::global_data& gd = logger::get_global_data();
        auto_mutex M(gd.m);
        gd.loggers.reset();
        while (gd.loggers.move_next())
        {
            gd.loggers.element()->cur_level = new_level;
        }

        gd.set_level("",new_level);
    }

// ----------------------------------------------------------------------------------------

    namespace logger_helper_stuff
    {
        class helper
        {
        public:
            helper()
            {
                std::ostringstream sout;
                print_default_logger_header(sout,"some_name",LDEBUG,0);
            }
        };
        // do this to make sure all the static members of print_default_logger_header get 
        // initialized when the program turns on.
        static helper a;
        // make a logger to make extra sure the static global_data object gets
        // initialized before any threads start up.  Also do this so that there is always
        // at least one logger so that the global data won't be deleted until the 
        // program is terminating.
        static logger log("dlib");
    }

// ----------------------------------------------------------------------------------------

    void print_default_logger_header (
        std::ostream& out,
        const std::string& logger_name,
        const log_level& l,
        const uint64 thread_id
    )
    {
        using namespace std;
        static timestamper ts;
        static const uint64 first_time = ts.get_timestamp();

        const uint64 cur_time = (ts.get_timestamp() - first_time)/1000;
        streamsize old_width = out.width(); out.width(5);
        out << cur_time << " " << l.name; 
        out.width(old_width);

        out << " [" << thread_id << "] " << logger_name << ": ";
    }

// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------
//                 global_data stuff
// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------

    logger::global_data::
    ~global_data (
    )
    {
        unregister_thread_end_handler(*this,&global_data::thread_end_handler);
    }

// ----------------------------------------------------------------------------------------

    logger::global_data::
    global_data(
    ) : 
        next_thread_name(1) 
    { 
        // make sure the main program thread always has id 0.  Since there is
        // a global logger object declared in this file we should expect that 
        // the global_data object will be initialized in the main program thread
        // so if we call get_thread_id() now we should get the main thread id.
        thread_id_type main_id = get_thread_id();
        uint64 id_zero = 0;
        thread_names.add(main_id,id_zero);

        // set up the defaults
        auto_flush_table.val = true;
        streambuf_table.val = std::cout.rdbuf(); 
        header_table.val = print_default_logger_header;

        // also allocate an initial buffer for hook based logging
        hookbuf.buffer.reserve(1000);
    }

    logger::global_data::level_container::
    level_container (
    ) : val(300,"ERROR") {}

// ----------------------------------------------------------------------------------------

    template <typename T>
    const T& search_tables (
        const T& c,
        const std::string& name
    )
    {
        if (c.table.size() == 0 || name.size() == 0)
            return c;

        const std::string::size_type pos = name.find_first_of(".");
        const std::string first = name.substr(0,pos);
        std::string last;
        if (pos != std::string::npos)
            last = name.substr(pos+1);

        if (c.table.is_in_domain(first))
        {
            return search_tables(*c.table[first], last); 
        }
        else
        {
            return c;
        }
    }

// ----------------------------------------------------------------------------------------

    template <typename T, typename U>
    void assign_tables (
        T& c,
        const std::string& name,
        const U& val
    )
    {
        if (name.size() == 0)
        {
            c.val = val;
            c.table.clear();
            return;
        }

        const std::string::size_type pos = name.find_first_of(".");
        std::string first = name.substr(0,pos);
        std::string last;
        if (pos != std::string::npos)
            last = name.substr(pos+1);

        if (c.table.is_in_domain(first))
        {
            assign_tables(*c.table[first], last, val); 
        }
        else
        {
            scoped_ptr<T> temp (new T);
            temp->val = c.val;
            assign_tables(*temp, last, val);
            c.table.add(first,temp);
        }
    }

// ----------------------------------------------------------------------------------------

    const log_level logger::global_data::
    level (
        const std::string& name
    ) const 
    {  
        auto_mutex M(m);
        return search_tables(level_table, name).val;
    }

// ----------------------------------------------------------------------------------------

    void logger::global_data::
    set_level (
        const std::string& name,
        const log_level& new_level
    )
    {
        auto_mutex M(m);
        assign_tables(level_table, name, new_level);
    }

// ----------------------------------------------------------------------------------------

    bool logger::global_data::
    auto_flush (
        const std::string& name
    ) const
    {
        auto_mutex M(m);
        return search_tables(auto_flush_table, name).val;
    }

// ----------------------------------------------------------------------------------------

    void logger::global_data::
    set_auto_flush (
        const std::string& name,
        bool enabled
    )
    {
        auto_mutex M(m);
        assign_tables(auto_flush_table, name, enabled);
    }

// ----------------------------------------------------------------------------------------

    std::streambuf* logger::global_data::
    output_streambuf (
        const std::string& name
    )
    {
        auto_mutex M(m);
        return search_tables(streambuf_table, name).val;
    }

// ----------------------------------------------------------------------------------------

    void logger::global_data::
    set_output_stream (
        const std::string& name,
        std::ostream& out_
    )
    {
        auto_mutex M(m);
        assign_tables( streambuf_table, name, out_.rdbuf());
    }

// ----------------------------------------------------------------------------------------

    void logger::global_data::
    set_output_stream (
        const std::string& name,
        std::streambuf& buf 
    )
    {
        auto_mutex M(m);
        assign_tables( streambuf_table, name, &buf);
    }

// ----------------------------------------------------------------------------------------

    logger::hook_mfp logger::global_data::
    output_hook (
        const std::string& name
    )
    {
        auto_mutex M(m);
        return search_tables(hook_table, name).val;
    }

// ----------------------------------------------------------------------------------------

    void logger::global_data::
    set_output_hook (
        const std::string& name,
        const hook_mfp& hook
    )
    {
        auto_mutex M(m);
        assign_tables( hook_table, name, hook);
    }

// ----------------------------------------------------------------------------------------

    logger::print_header_type logger::global_data::
    logger_header (
        const std::string& name
    )
    {
        auto_mutex M(m);
        return search_tables(header_table, name).val;
    }

// ----------------------------------------------------------------------------------------

    void logger::global_data::
    set_logger_header (
        const std::string& name,
        print_header_type ph
    )
    {
        auto_mutex M(m);
        assign_tables(header_table, name, ph);
    }

// ----------------------------------------------------------------------------------------

    logger::global_data& logger::get_global_data()
    {
        // Allocate the global_data on the heap rather than on the stack because
        // we want to guard against the case where this static object would be destroyed
        // during program termination BEFORE all logger objects are destroyed.
        static global_data* gd = new global_data;
        return *gd;
    }

// ----------------------------------------------------------------------------------------

    void logger::global_data::
    thread_end_handler (
    )
    {
        auto_mutex M(m);
        thread_id_type id = get_thread_id();
        thread_id_type junkd;
        uint64 junkr;
        thread_names.remove(id,junkd,junkr);
    }

// ----------------------------------------------------------------------------------------

    uint64 logger::global_data::
    get_thread_name (
    )
    {
        thread_id_type id = get_thread_id();
        uint64 thread_name;
        if (thread_names.is_in_domain(id))
        {
            thread_name = thread_names[id];
        }
        else
        {
            if (is_dlib_thread(id))
                register_thread_end_handler(*this,&global_data::thread_end_handler);
            thread_name = next_thread_name;
            thread_names.add(id,thread_name);
            thread_name = next_thread_name;
            ++next_thread_name;
        }
        return thread_name;
    }

// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------
//               logger_stream stuff
// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------

    void logger::logger_stream::
    print_header_and_stuff (
    )
    {
        if (!been_used)
        {
            log.gd.m.lock();

            // Check if the output hook is setup.  If it isn't then we print the logger
            // header like normal.  Otherwise we need to remember to clear out the output
            // stringstream we always write to.
            if (log.hook.is_set() == false)
            {
                log.logger_header()(log.out,log.name(),l,log.gd.get_thread_name());
            }
            else
            {
                // Make sure the hook buffer doesn't have any old data in it before we start
                // logging a new message into it.
                log.gd.hookbuf.buffer.resize(0);
            }
            been_used = true;
        }
    }

// ----------------------------------------------------------------------------------------

    void logger::logger_stream::
    print_end_of_line (
    )
    {
        auto_unlock M(log.gd.m);

        if (log.hook.is_set() == false)
        {
            if (log.auto_flush_enabled)
                log.out << std::endl;
            else
                log.out << "\n";
        }
        else
        {
            // Make sure the buffer is a proper C-string
            log.gd.hookbuf.buffer.push_back('\0');
            // call the output hook with all the info regarding this log message.
            log.hook(log.name(), l, log.gd.get_thread_name(), &log.gd.hookbuf.buffer[0]);
        }
    }

// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------
//         logger stuff
// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------

    logger::
    logger (  
        const char* name_
    ) : 
        gd(get_global_data()),
        logger_name(name_),
        out(gd.output_streambuf(logger_name)),
        cur_level(gd.level(logger_name))
    {
        DLIB_ASSERT(name_[0] != '\0',
                    "\tlogger::logger()"
                    << "\n\tYou can't make a logger with an empty name"
                    << "\n\tthis: " << this
        );

        auto_mutex M(gd.m);
        logger* temp = this;
        gd.loggers.add(temp);

        // load the appropriate settings
        print_header        = gd.logger_header(logger_name);
        auto_flush_enabled  = gd.auto_flush(logger_name);
        hook                = gd.output_hook(logger_name);
    }

// ----------------------------------------------------------------------------------------

    logger::
    ~logger (
    ) 
    { 
        gd.m.lock();
        gd.loggers.destroy(this);            
        // if this was the last logger then delete the global data
        if (gd.loggers.size() == 0)
        {
            gd.m.unlock();
            delete &gd;
        }
        else
        {
            gd.m.unlock();
        }
    }

// ----------------------------------------------------------------------------------------

}

#endif // DLIB_LOGGER_KERNEL_1_CPp_

