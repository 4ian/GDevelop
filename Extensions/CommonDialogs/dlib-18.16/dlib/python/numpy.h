// Copyright (C) 2014  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#ifndef DLIB_PYTHON_NuMPY_Hh_
#define DLIB_PYTHON_NuMPY_Hh_

#include <boost/python.hpp>
#include <dlib/error.h>
#include <dlib/algs.h>
#include <dlib/string.h>

// ----------------------------------------------------------------------------------------

template <typename T>
void validate_numpy_array_type (
    boost::python::object& obj
)
{
    using namespace boost::python;
    const char ch = extract<char>(obj.attr("dtype").attr("char"));

    if (dlib::is_same_type<T,double>::value && ch != 'd')
        throw dlib::error("Expected numpy.ndarray of float64");
    if (dlib::is_same_type<T,float>::value && ch != 'f')
        throw dlib::error("Expected numpy.ndarray of float32");
    if (dlib::is_same_type<T,dlib::int32>::value && ch != 'i')
        throw dlib::error("Expected numpy.ndarray of int32");
    if (dlib::is_same_type<T,unsigned char>::value && ch != 'B')
        throw dlib::error("Expected numpy.ndarray of uint8");
}

// ----------------------------------------------------------------------------------------

template <typename T, int dims>
void get_numpy_ndarray_parts (
    boost::python::object& obj,
    T*& data,
    long (&shape)[dims]
)
/*!
    ensures
        - extracts the pointer to the data from the given numpy ndarray.  Stores the shape
          of the array into #shape.
!*/
{
    Py_buffer pybuf;
    if (PyObject_GetBuffer(obj.ptr(), &pybuf, PyBUF_ND | PyBUF_WRITABLE ))
        throw dlib::error("Expected contiguous and writable numpy.ndarray.");

    try
    {
        validate_numpy_array_type<T>(obj);
        data = (T*)pybuf.buf;

        if (pybuf.ndim > dims)
            throw dlib::error("Expected array with " + dlib::cast_to_string(dims) + " dimensions.");

        for (int i = 0; i < dims; ++i)
        {
            if (i < pybuf.ndim)
                shape[i] = pybuf.shape[i];
            else
                shape[i] = 1;
        }
    }
    catch(...)
    {
        PyBuffer_Release(&pybuf);
        throw;
    }
    PyBuffer_Release(&pybuf);
}

// ----------------------------------------------------------------------------------------

template <typename T, int dims>
void get_numpy_ndarray_parts (
    const boost::python::object& obj,
    const T*& data,
    long (&shape)[dims]
)
/*!
    ensures
        - extracts the pointer to the data from the given numpy ndarray.  Stores the shape
          of the array into #shape.
!*/
{
    Py_buffer pybuf;
    if (PyObject_GetBuffer(obj.ptr(), &pybuf, PyBUF_ND ))
        throw dlib::error("Expected contiguous numpy.ndarray.");

    try
    {
        validate_numpy_array_type<T>(obj);
        data = (const T*)pybuf.buf;

        if (pybuf.ndim > dims)
            throw dlib::error("Expected array with " + dlib::cast_to_string(dims) + " dimensions.");

        for (int i = 0; i < dims; ++i)
        {
            if (i < pybuf.ndim)
                shape[i] = pybuf.shape[i];
            else
                shape[i] = 1;
        }
    }
    catch(...)
    {
        PyBuffer_Release(&pybuf);
        throw;
    }
    PyBuffer_Release(&pybuf);
}

// ----------------------------------------------------------------------------------------

#endif // DLIB_PYTHON_NuMPY_Hh_

