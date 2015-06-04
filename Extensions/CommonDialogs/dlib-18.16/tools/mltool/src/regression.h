// The contents of this file are in the public domain. 
// See LICENSE_FOR_EXAMPLE_PROGRAMS.txt (in trunk/examples)
// Authors:
//   Gregory Sharp
//   Davis King

#ifndef DLIB_MLTOOL_REGREsSION_H__
#define DLIB_MLTOOL_REGREsSION_H__

#include "common.h"
#include <vector>

void
krr_test (
    command_line_parser& parser,
    std::vector<dense_sample_type>& dense_samples,
    std::vector<double>& labels
);

void
krls_test (
    command_line_parser& parser,
    std::vector<dense_sample_type>& dense_samples,
    std::vector<double>& labels
);

void
mlp_test (
    command_line_parser& parser,
    std::vector<dense_sample_type>& dense_samples,
    std::vector<double>& labels
);

void
svr_test (
    command_line_parser& parser,
    std::vector<dense_sample_type>& dense_samples,
    std::vector<double>& labels
);

#endif // DLIB_MLTOOL_REGREsSION_H__

