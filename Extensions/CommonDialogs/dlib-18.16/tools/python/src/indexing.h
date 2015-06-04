// Copyright (C) 2014  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#ifndef DLIB_PYTHON_INDEXING_H__
#define DLIB_PYTHON_INDEXING_H__

#include <boost/python/suite/indexing/vector_indexing_suite.hpp>

namespace dlib
{
    template <typename T>
    void resize(T& v, unsigned long n) { v.resize(n); }
}
#endif // DLIB_PYTHON_INDEXING_H__
