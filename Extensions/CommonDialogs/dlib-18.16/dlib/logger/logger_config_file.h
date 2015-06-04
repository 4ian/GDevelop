// Copyright (C) 2007  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#ifndef DLIB_LOGGER_CONFIg_FILE_
#define DLIB_LOGGER_CONFIg_FILE_ 

#include "logger_kernel_abstract.h"
#include "logger_kernel_1.h"
#include <string>
#include "../config_reader.h"

// ----------------------------------------------------------------------------------------

namespace dlib
{
    class logger_config_file_error : public error 
    {
        /*!
            WHAT THIS OBJECT REPRESENTS
                This is the exception class used by the configure_loggers_from_file()
                function defined below.
        !*/
    public: 
        logger_config_file_error(const std::string& s):error(s){}
    };

    void configure_loggers_from_file (
        const std::string& file_name
    );
    /*!
        ensures
            - configures the loggers with the contents of the file_name file
        throws
            - dlib::logger_config_file_error
                this exception is thrown if there is a problem reading the config file
    !*/

    void configure_loggers_from_file (
        const config_reader& cr 
    );
    /*!
        ensures
            - configures the loggers with the contents of cr.  This function is just like
              the above version that reads from a file except that it reads from an in-memory
              config_reader instead.
        throws
            - dlib::logger_config_file_error
                this exception is thrown if there is a problem reading the config file
    !*/

// ----------------------------------------------------------------------------------------

    /*!  
        #  -----------------------------------------------
        #  ------------- EXAMPLE CONFIG FILE -------------
        #  -----------------------------------------------

        # The overall format of the config file is the same as the one defined by
        # the config_reader component of this library.  
        
        # This line is a comment line

        # The config file always has a block named logger_config.  This is where all the 
        # config data for the loggers reside.
        logger_config
        {
            # This sets all loggers to the level LINFO since it is just inside the 
            # logger_config block
            logging_level = info

            # Alternatively we could specify a user defined logging level by
            # supplying a priority number.  The following line would specify 
            # that only logging levels at or above 100 are printed.  (note that 
            # you would have to comment out the logging_level statement above 
            # to avoid a conflict).
            # logging_level = 100 

            parent_logger 
            {
                # This sets all loggers named "parent_logger" or children of
                # loggers with that name to not log at all (i.e. to logging level
                # LNONE).
                logging_level = none
            }


            parent_logger2
            {
                # set loggers named "parent_logger2" and its children loggers
                # to write their output to a file named out.txt
                output = file out.txt 

                child_logger
                {
                    # Set loggers named "parent_logger2.child_logger" and children of loggers
                    # with this name to logging level LALL
                    logging_level = all

                    # Note that this logger will also log to out.txt because that is what
                    # its parent does and we haven't overridden it here with something else.
                    # if we wanted this logger to write to cout instead we could uncomment
                    # the following line:
                    # output = cout
                }
            }
        }

        # So in summary, all logger config stuff goes inside a block named logger_config.  Then
        # inside that block all blocks must be the names of loggers.  There are only two keys,
        # logging_level and output.
        #
        # The valid values of logging_level are:
        #   "LALL", "LNONE", "LTRACE", "LDEBUG", "LINFO", "LWARN", "LERROR", "LFATAL",  
        #   "ALL",   "NONE",  "TRACE",  "DEBUG",  "INFO",  "WARN",  "ERROR",  "FATAL", 
        #   "all",   "none",  "trace",  "debug",  "info",  "warn",  "error",  "fatal", or  
        #   any integral value
        # 
        # The valid values of output are:
        #   "cout", "cerr", "clog", or a string of the form "file some_file_name"
        #   which causes the output to be logged to the specified file.
        #
    !*/


}

// ----------------------------------------------------------------------------------------

#ifdef NO_MAKEFILE
#include "logger_config_file.cpp"
#endif

#endif // DLIB_LOGGER_CONFIg_FILE_



