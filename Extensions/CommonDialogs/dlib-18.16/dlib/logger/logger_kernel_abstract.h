// Copyright (C) 2006  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#undef DLIB_LOGGER_KERNEl_ABSTRACT_
#ifdef DLIB_LOGGER_KERNEl_ABSTRACT_

#include "../threads.h"
#include <limits>
#include <string>
#include <iostream>
#include "../uintn.h"

namespace dlib
{

// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------

    class log_level
    {
        /*!
            WHAT THIS OBJECT REPRESENTS
                This object is a simple named level to log at.  It contains a numeric 
                priority and a name to use in the logging messages.
        !*/
    public:
        log_level(
            int priority_, 
            const char* name_
        );  
        /*!
            ensures
                - #priority = priority_
                - the first 19 characters of name_ are copied into name and name
                  is null terminated.
        !*/

        bool operator< (const log_level& rhs) const { return priority <  rhs.priority; }
        bool operator<=(const log_level& rhs) const { return priority <= rhs.priority; }
        bool operator> (const log_level& rhs) const { return priority >  rhs.priority; }
        bool operator>=(const log_level& rhs) const { return priority >= rhs.priority; }

        int priority;
        char name[20];
    };

    inline std::ostream& operator<< (std::ostream& out, const log_level& item);
    /*!
        ensures
            - performs out << item.name
            - returns out
    !*/

// ----------------------------------------------------------------------------------------

    const log_level LALL  (std::numeric_limits<int>::min(),"ALL");
    const log_level LNONE (std::numeric_limits<int>::max(),"NONE");
    const log_level LTRACE(-100,"TRACE");
    const log_level LDEBUG(0   ,"DEBUG");
    const log_level LINFO (100 ,"INFO ");
    const log_level LWARN (200 ,"WARN ");
    const log_level LERROR(300 ,"ERROR");
    const log_level LFATAL(400 ,"FATAL");

// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------

    void set_all_logging_output_streams (
        std::ostream& out
    );
    /*!
        ensures
            - for all loggers L (even loggers not yet constructed):
                - #L.output_streambuf() == out.rdbuf() 
                - Removes any previous output hook from L.  So now the logger
                  L will write all its messages to the given output stream.
        throws
            - std::bad_alloc
    !*/

// ----------------------------------------------------------------------------------------

    typedef void (*print_header_type)(
        std::ostream& out, 
        const std::string& logger_name, 
        const log_level& l,
        const uint64 thread_id
    );

    void set_all_logging_headers (
        const print_header_type& new_header
    );
    /*!
        ensures
            - for all loggers L (even loggers not yet constructed):
                - #L.logger_header() == new_header 
        throws
            - std::bad_alloc
    !*/

// ----------------------------------------------------------------------------------------

    template <
        typename T
        >
    void set_all_logging_output_hooks (
        T& object,
        void (T::*hook)(const std::string& logger_name, 
                        const log_level& l,
                        const uint64 thread_id,
                        const char* message_to_log)
    );
    /*!
        ensures
            - for all loggers L (even loggers not yet constructed):
                - #L.output_streambuf() == 0
                - performs the equivalent to calling L.set_output_hook(object, hook);
                  (i.e. sets all loggers so that they will use the given hook function)
        throws
            - std::bad_alloc
    !*/

    template <
        typename T
        >
    void set_all_logging_output_hooks (
        T& object
    );
    /*!
        ensures
            - calls set_all_logging_output_hooks(object, &T::log);
    !*/

// ----------------------------------------------------------------------------------------

    void set_all_logging_levels (
        const log_level& new_level
    );
    /*!
        ensures
            - for all loggers L (even loggers not yet constructed):
                - #L.level() == new_level
        throws
            - std::bad_alloc
    !*/

// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------

    void print_default_logger_header (
        std::ostream& out,
        const std::string& logger_name,
        const log_level& l,
        const uint64 thread_id
    );
    /*!
        requires
            - is not called more than once at a time (i.e. is not called from multiple
              threads at the same time).
        ensures
            - let MS be the number of milliseconds since program start.  
            - prints a string to out in the form:  "MS l.name [thread_id] logger_name:"
    !*/

// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------

    class logger 
    {
        /*!
            INITIAL VALUE
                - name() == a user supplied value given to the constructor
                - The values of level(), output_streambuf(), logger_header(), and
                  auto_flush() are inherited from the parent of this logger. 

            WHAT THIS OBJECT REPRESENTS
                This object represents a logging output stream in the style of the log4j
                logger available for Java.  
                
                Additionally, the logger doesn't perform any memory allocations during
                each logging action.  It just writes directly into the user supplied output
                stream.  Alternatively, if you use a logging output hook no memory allocations
                are performed either.  Logging just goes straight into a memory buffer
                which gets passed to the user supplied logging hook.

            DEFAULTS
                If the user hasn't specified values for the four inherited values level(),
                output_streambuf(), logger_header(), or auto_flush() then the default
                values will be used.  The defaults are as follows:
                - level() == LERROR
                - output_streambuf() == std::cout.rdbuf() (i.e. the default is to log
                  to standard output).  
                - logger_header() == print_default_logger_header
                - auto_flush() == true
            
            THREAD SAFETY
                All methods of this class are thread safe.  Note that it is safe to 
                chain calls to operator << such as:
                    log << LINFO << "message " << variable << " more message";
                The logger ensures that the entire statement executes atomically so the 
                message won't be broken up by other loggers in other threads.
        !*/

        class logger_stream
        {
        public:

            bool is_enabled (
            ) const;
            /*!
                ensures
                    - returns true if this logger stream will print out items
                      given to it by the << operator.  returns false otherwise.
            !*/

            template <typename T>
            logger_stream& operator << (
                const T& item
            );
            /*!
                ensures
                    - if (is_enabled()) then
                        - writes item to this output stream
                    - returns *this
            !*/
        };

    public:

        logger (  
            const std::string& name_
        );
        /*!
            requires
                - name_ != ""
            ensures                
                - #*this is properly initialized
                - #name() == name_
            throws
                - std::bad_alloc
                - dlib::thread_error
        !*/

        virtual ~logger (
        );
        /*!
            ensures
                - any resources associated with *this have been released
        !*/

        const std::string& name (
        ) const;
        /*!
            ensures
                - returns the name of this logger
        !*/

        logger_stream operator << (
            const log_level& l
        ) const;
        /*!
            ensures
                - if (l.priority >= level().priority) then
                    - returns a logger_stream with is_enabled() == true.  I.e. this
                      returned stream will write its output to the I/O destination 
                      used by this logger object.
                - else
                    - returns a logger stream with is_enabled() == false 
            throws
                - std::bad_alloc
        !*/

        bool is_child_of (
            const logger& log
        ) const;
        /*!
            ensures
                - if ( (name().find(log.name() + ".") == 0) || (log.name() == name()) ) then
                    - returns true
                      (i.e. if log.name() + "." is a prefix of name() or if both *this and log
                      have the same name then return true)
                - else
                    - returns false
        !*/

        const log_level level (
        ) const;
        /*!
            ensures
                - returns the current log level of this logger.
        !*/

        void set_level (
            const log_level& new_level
        );
        /*!
            ensures
                - for all loggers L such that L.is_child_of(*this) == true:
                    - #L.level() == new_level
            throws
                - std::bad_alloc
        !*/

        bool auto_flush (
        );
        /*!
            ensures
                - returns true if the output stream is flushed after every logged message.
                  returns false otherwise.  (Note that flushing only does anything if
                  the logger is set to use an output stream rather than a hook)
        !*/

        void set_auto_flush (
            bool enabled
        );
        /*!
            ensures
                - for all loggers L such that L.is_child_of(*this) == true:
                    - #L.auto_flush() == enabled 
            throws
                - std::bad_alloc
        !*/

                
        template <
            typename T
            >
        void set_output_hook (
            T& object,
            void (T::*hook)(const std::string& logger_name, 
                            const log_level& l,
                            const uint64 thread_id,
                            const char* message_to_log)
        );
        /*!
            requires
                - hook is a valid pointer to a member function in T 
            ensures
                - for all loggers L such that L.is_child_of(*this) == true:
                    - #L.output_streambuf() == 0
                    - #L will not send its log messages to an ostream object anymore.  Instead
                      it will call the given hook member function (i.e. (object.*hook)(name,l,id,msg) )
                      for each message that needs to be logged.
                    - The arguments to the hook function have the following meanings:
                        - logger_name == The name of the logger that is printing the log message.
                        - l == The level of the logger that is printing the log message.
                        - thread_id == A number that uniquely identifies the thread trying to log
                          the message.  Note that this number is unique among all threads, past and
                          present.  Also note that this id is not the same one returned by
                          get_thread_id().
                        - message_to_log == the actual text of the message the user is giving to
                          the logger object to log.
                    - All hook functions will also only be called one at a time. This means
                      that hook functions don't need to be thread safe.
        !*/

        std::streambuf* output_streambuf (
        );
        /*!
            ensures
                - if (an output hook isn't set) then
                    - returns the output stream buffer that this logger writes all
                      messages to.
                - else
                    - returns 0
        !*/

        void set_output_stream (
            std::ostream& out
        );
        /*!
            ensures
                - for all loggers L such that L.is_child_of(*this) == true:
                    - #L.output_streambuf() == out.rdbuf() 
                    - Removes any previous output hook from L.  So now the logger
                      L will write all its messages to the given output stream.
            throws
                - std::bad_alloc
        !*/

        print_header_type logger_header (
        ) const;
        /*!
            ensures
                - returns the function that is called to print the header information 
                  onto each logged message.  The arguments to the function have the following
                  meanings:
                    - out == The output stream this function writes the header to.
                    - logger_name == The name of the logger that is printing the log message.
                    - l == The level of the logger that is printing the log message.
                    - thread_id == A number that uniquely identifies the thread trying to log
                      the message.  Note that this number is unique among all threads, past and
                      present.  Also note that this id is not the same one returned by
                      get_thread_id().
                - This logger_header function will also only be called once at a time. This means
                  the logger_header function doesn't need to be thread safe.
                - the logger_header function is only used when output_streambuf() != 0
        !*/

        void set_logger_header (
            print_header_type print_header
        );
        /*!
            ensures
                - for all loggers L such that L.is_child_of(*this) == true:
                    - #L.logger_header() == print_header 
            throws
                - std::bad_alloc
        !*/

    private:

        // restricted functions
        logger(const logger&);        // copy constructor
        logger& operator=(const logger&);    // assignment operator

    };    

// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------

}

#endif // DLIB_LOGGER_KERNEl_ABSTRACT_

