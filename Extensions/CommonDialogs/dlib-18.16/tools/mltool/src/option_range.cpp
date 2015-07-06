// The contents of this file are in the public domain. 
// See LICENSE_FOR_EXAMPLE_PROGRAMS.txt (in trunk/examples)
// Authors:
//   Gregory Sharp
//   Davis King


#include "option_range.h"
#include <iostream>

// ----------------------------------------------------------------------------------------

/* exp10() is not in C/C++ standard */
double
exp10_ (double m)
{
    return exp (2.3025850929940456840179914546844 * m);
}

// ----------------------------------------------------------------------------------------

void
option_range::set_option (
    command_line_parser& parser,
    std::string const& option, 
    float default_val
)
{
    int rc;

    /* No option specified */
    if (!parser.option (option)) {
        log_range = 0;
        min_value = default_val;
        max_value = default_val;
        incr = 1;
        return;
    }

    /* Range specified */
    rc = sscanf (parser.option(option).argument().c_str(), "%f:%f:%f", 
                 &min_value, &incr, &max_value);
    if (rc == 3) {
        log_range = 1;
        return;
    }

    /* Single value specified */
    if (rc == 1) {
        log_range = 0;
        max_value = min_value;
        incr = 1;
        return;
    }

    else {
        std::cerr << "Error parsing option" << option << "\n";
        exit (-1);
    }
}

// ----------------------------------------------------------------------------------------

float 
option_range::get_min_value ()
{
    if (log_range) {
        return exp10_ (min_value);
    } else {
        return min_value;
    }
}

// ----------------------------------------------------------------------------------------

float 
option_range::get_max_value ()
{
    if (log_range) {
        return exp10_ (max_value);
    } else {
        return max_value;
    }
}

// ----------------------------------------------------------------------------------------

float 
option_range::get_next_value (float curr_value)
{
    if (log_range) {
        curr_value = log10 (curr_value);
        curr_value += incr;
        curr_value = exp10_ (curr_value);
    } else {
        curr_value += incr;
    }
    return curr_value;
}

// ----------------------------------------------------------------------------------------

