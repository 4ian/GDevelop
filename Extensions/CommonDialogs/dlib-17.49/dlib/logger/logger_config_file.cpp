// Copyright (C) 2007  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#ifndef DLIB_LOGGER_CONFIg_FILE_CPP
#define DLIB_LOGGER_CONFIg_FILE_CPP

#include "logger_config_file.h"
#include <string>
#include "../config_reader.h"
#include <fstream>
#include <sstream>
#include "../error.h"
#include "../map.h"
#include "../string.h"

// ----------------------------------------------------------------------------------------

namespace dlib
{

    namespace logger_config_file_helpers 
    {
        typedef config_reader::kernel_1a cr_type;

// ----------------------------------------------------------------------------------------

        std::ostream& get_file_stream (
            const std::string& file_name
        )
        {
            using namespace std;
            static dlib::mutex m;
            auto_mutex M(m);
            static dlib::map<string,ostream*>::kernel_1a_c file_map;

            if (file_map.is_in_domain(file_name) == false)
            {
                // We won't ever delete this output stream.  It should be around for the
                // entire life of the program so just let the OS take care of it.
                ostream* fout = new ofstream(file_name.c_str());
                if (!(*fout))
                {
                    delete fout;
                    throw error("logger_config: unable to open output file " + file_name);
                }

                // add this file to our file map
                string temp(file_name);
                file_map.add(temp,fout);
            }

            return *file_map[file_name];
        }

// ----------------------------------------------------------------------------------------

        log_level string_to_log_level (
            const std::string& level 
        )
        {
            using namespace std;
            if (level == "LALL" || level == "ALL" || level == "all")
                return LALL;
            else if (level == "LNONE" || level == "NONE" || level == "none")
                return LNONE;
            else if (level == "LTRACE" || level == "TRACE" || level == "trace")
                return LTRACE;
            else if (level == "LDEBUG" || level == "DEBUG" || level == "debug")
                return LDEBUG;
            else if (level == "LINFO" || level == "INFO" || level == "info")
                return LINFO;
            else if (level == "LWARN" || level == "WARN" || level == "warn")
                return LWARN;
            else if (level == "LERROR" || level == "ERROR" || level == "error")
                return LERROR;
            else if (level == "LFATAL" || level == "FATAL" || level == "fatal")
                return LFATAL;
            else
            {
                const int priority = string_cast<int>(level);
                return log_level(priority,"CONFIG_FILE_DEFINED");
            }
        }

// ----------------------------------------------------------------------------------------
        
        void configure_sub_blocks (
            const cr_type& cr,
            const std::string& name 
        )
        {
            using namespace std;

            logger dlog(name.c_str());

            if (cr.is_key_defined("logging_level"))
            {
                dlog.set_level(string_to_log_level(cr["logging_level"]));
            }

            if (cr.is_key_defined("output"))
            {
                string output = cr["output"];
                if (output == "cout")
                    dlog.set_output_stream(cout);
                else if (output == "cerr")
                    dlog.set_output_stream(cerr);
                else if (output == "clog")
                    dlog.set_output_stream(clog);
                else
                {
                    istringstream sin(output);
                    string one, two, three;
                    sin >> one;
                    sin >> two;
                    sin >> three;
                    if (one == "file" && three.size() == 0)
                        dlog.set_output_stream(get_file_stream(two));
                    else
                        throw error("logger_config: invalid argument to output option: " + output);
                }

            } // if (cr.is_key_defined("output"))

            // now configure all the sub-blocks
            std_vector_c<std::string> blocks;
            cr.get_blocks(blocks);
            for (unsigned long i = 0; i < blocks.size(); ++i)
            {
                configure_sub_blocks(cr.block(blocks[i]), name + "." + blocks[i]);
            }

        }

// ----------------------------------------------------------------------------------------

    } // namespace

// ----------------------------------------------------------------------------------------

    void configure_loggers_from_file (
        const std::string& file_name
    )
    {
        using namespace logger_config_file_helpers;
        using namespace std;
        ifstream fin(file_name.c_str());

        if (!fin)
            throw logger_config_file_error("logger_config: unable to open config file " + file_name);


        cr_type main_cr;
        main_cr.load_from(fin);


        if (main_cr.is_block_defined("logger_config"))
        {
            const cr_type& cr = main_cr.block("logger_config");

            if (cr.is_key_defined("logging_level"))
            {
                set_all_logging_levels(string_to_log_level(cr["logging_level"]));
            }

            if (cr.is_key_defined("output"))
            {
                string output = cr["output"];
                if (output == "cout")
                    set_all_logging_output_streams(cout);
                else if (output == "cerr")
                    set_all_logging_output_streams(cerr);
                else if (output == "clog")
                    set_all_logging_output_streams(clog);
                else
                {
                    istringstream sin(output);
                    string one, two, three;
                    sin >> one;
                    sin >> two;
                    sin >> three;
                    if (one == "file" && three.size() == 0)
                        set_all_logging_output_streams(get_file_stream(two));
                    else
                        throw logger_config_file_error("logger_config: invalid argument to output option: " + output);
                }

            } // if (cr.is_key_defined("output"))

            // now configure all the sub-blocks
            std_vector_c<std::string> blocks;
            cr.get_blocks(blocks);
            for (unsigned long i = 0; i < blocks.size(); ++i)
            {
                configure_sub_blocks(cr.block(blocks[i]), blocks[i]);
            }

        }
    }

// ----------------------------------------------------------------------------------------

}

// ----------------------------------------------------------------------------------------

#endif // DLIB_LOGGER_CONFIg_FILE_CPP



