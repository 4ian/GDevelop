// Copyright (C) 2013  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#ifndef DLIB_BOOST_PYTHON_UtILS_Hh_
#define DLIB_BOOST_PYTHON_UtILS_Hh_

#include <boost/python.hpp>
#include <vector>
#include <string>
#include <dlib/serialize.h>

inline bool hasattr(
    boost::python::object obj, 
    const std::string& attr_name
) 
/*!
    ensures
        - if (obj has an attribute named attr_name) then
            - returns true
        - else
            - returns false
!*/
{
     return PyObject_HasAttrString(obj.ptr(), attr_name.c_str());
}

// ----------------------------------------------------------------------------------------

template <typename T>
std::vector<T> python_list_to_vector (
    const boost::python::object& obj
)
/*!
    ensures
        - converts a python object into a std::vector<T> and returns it.
!*/
{
    std::vector<T> vect(len(obj));
    for (unsigned long i = 0; i < vect.size(); ++i)
    {
        vect[i] = boost::python::extract<T>(obj[i]);
    }
    return vect;
}

template <typename T>
boost::python::list vector_to_python_list (
    const std::vector<T>& vect
)
/*!
    ensures
        - converts a std::vector<T> into a python list object.
!*/
{
    boost::python::list obj;
    for (unsigned long i = 0; i < vect.size(); ++i)
        obj.append(vect[i]);
    return obj;
}

// ----------------------------------------------------------------------------------------

template <typename T>
boost::shared_ptr<T> load_object_from_file (
    const std::string& filename
)
/*!
    ensures
        - deserializes an object of type T from the given file and returns it.
!*/
{
    std::ifstream fin(filename.c_str(), std::ios::binary);
    if (!fin)
        throw dlib::error("Unable to open " + filename);
    boost::shared_ptr<T> obj(new T());
    deserialize(*obj, fin);
    return obj;
}

// ----------------------------------------------------------------------------------------


#endif // DLIB_BOOST_PYTHON_UtILS_Hh_

