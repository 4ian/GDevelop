// Copyright (C) 2013  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#ifndef DLIB_PYaSSERT_Hh_
#define DLIB_PYaSSERT_Hh_

#include <boost/python.hpp>

#define pyassert(_exp,_message)                                             \
    {if ( !(_exp) )                                                         \
    {                                                                       \
        PyErr_SetString( PyExc_ValueError, _message );                      \
        boost::python::throw_error_already_set();                           \
    }}                                                                      

#endif // DLIB_PYaSSERT_Hh_

