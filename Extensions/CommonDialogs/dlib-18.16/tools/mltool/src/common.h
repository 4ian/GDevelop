// The contents of this file are in the public domain. 
// See LICENSE_FOR_EXAMPLE_PROGRAMS.txt (in trunk/examples)
// Authors:
//   Gregory Sharp
//   Davis King


#ifndef DLIB_MLTOOL_COMMoN_H__

#include "dlib/cmd_line_parser.h"
#include <map>
#include "dlib/matrix.h"



using dlib::command_line_parser;
typedef std::map<unsigned long, double> sparse_sample_type;
typedef dlib::matrix<sparse_sample_type::value_type::second_type,0,1> dense_sample_type;



#endif // DLIB_MLTOOL_COMMoN_H__

