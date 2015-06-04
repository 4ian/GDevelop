// The contents of this file are in the public domain. 
// See LICENSE_FOR_EXAMPLE_PROGRAMS.txt (in trunk/examples)
// Authors:
//   Gregory Sharp
//   Davis King

#ifndef DLIB_MLTOOL_OPTION_RaNGE_H__
#define DLIB_MLTOOL_OPTION_RaNGE_H__

#include "common.h"
#include <string>

// ----------------------------------------------------------------------------------------

struct option_range 
{
    /*!
        WHAT THIS OBJECT REPRESENTS
            This object is a tool for representing a range of possible parameter values.
            The range is determined based on the contents of the command line.
    !*/

public:
    bool log_range;
    float min_value;
    float max_value;
    float incr;
public:
    option_range () {
        log_range = false;
        min_value = 0;
        max_value = 100;
        incr = 10;
    }
    void set_option (command_line_parser& parser, std::string const& option, 
                     float default_val);
    float get_min_value ();
    float get_max_value ();
    float get_next_value (float curr_val);
};

// ----------------------------------------------------------------------------------------

#endif // DLIB_MLTOOL_OPTION_RaNGE_H__

