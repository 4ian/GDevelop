// Copyright (C) 2013  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#include <dlib/python.h>
#include <dlib/matrix.h>
#include <sstream>
#include <string>
#include <boost/python/suite/indexing/vector_indexing_suite.hpp>
#include <boost/python/suite/indexing/map_indexing_suite.hpp>
#include <boost/python/suite/indexing/indexing_suite.hpp>
#include <boost/shared_ptr.hpp>

#include <dlib/string.h>

using namespace std;
using namespace dlib;
using namespace boost::python;


boost::shared_ptr<std::vector<double> > array_from_object(object obj)
{
    extract<long> thesize(obj);
    if (thesize.check())
    {
        long nr = thesize;
        boost::shared_ptr<std::vector<double> > temp(new std::vector<double>(nr));
        return temp;
    }
    else
    {
        const long nr = len(obj);
        boost::shared_ptr<std::vector<double> > temp(new std::vector<double>(nr));
        for ( long r = 0; r < nr; ++r)
        {
            (*temp)[r] = extract<double>(obj[r]);
        }
        return temp;
    }
}

string array__str__ (const std::vector<double>& v)
{
    std::ostringstream sout;
    for (unsigned long i = 0; i < v.size(); ++i)
    {
        sout << v[i];
        if (i+1 < v.size())
            sout << "\n";
    }
    return sout.str();
}

string array__repr__ (const std::vector<double>& v)
{
    std::ostringstream sout;
    sout << "dlib.array([";
    for (unsigned long i = 0; i < v.size(); ++i)
    {
        sout << v[i];
        if (i+1 < v.size())
            sout << ", ";
    }
    sout << "])";
    return sout.str();
}

string range__str__ (const std::pair<unsigned long,unsigned long>& p)
{
    std::ostringstream sout;
    sout << p.first << ", " << p.second;
    return sout.str();
}

string range__repr__ (const std::pair<unsigned long,unsigned long>& p)
{
    std::ostringstream sout;
    sout << "dlib.range(" << p.first << ", " << p.second << ")";
    return sout.str();
}

struct range_iter
{
    std::pair<unsigned long,unsigned long> range;
    unsigned long cur;

    unsigned long next()
    {
        if (cur < range.second)
        {
            return cur++;
        }
        else
        {
            PyErr_SetString(PyExc_StopIteration, "No more data.");
            boost::python::throw_error_already_set();
            return 0;
        }
    }
};

range_iter make_range_iterator (const std::pair<unsigned long,unsigned long>& p)
{
    range_iter temp;
    temp.range = p;
    temp.cur = p.first;
    return temp;
}

string pair__str__ (const std::pair<unsigned long,double>& p)
{
    std::ostringstream sout;
    sout << p.first << ": " << p.second;
    return sout.str();
}

string pair__repr__ (const std::pair<unsigned long,double>& p)
{
    std::ostringstream sout;
    sout << "dlib.pair(" << p.first << ", " << p.second << ")";
    return sout.str();
}

string sparse_vector__str__ (const std::vector<std::pair<unsigned long,double> >& v)
{
    std::ostringstream sout;
    for (unsigned long i = 0; i < v.size(); ++i)
    {
        sout << v[i].first << ": " << v[i].second;
        if (i+1 < v.size())
            sout << "\n";
    }
    return sout.str();
}

string sparse_vector__repr__ (const std::vector<std::pair<unsigned long,double> >& v)
{
    std::ostringstream sout;
    sout << "< dlib.sparse_vector containing: \n" << sparse_vector__str__(v) << " >";
    return sout.str();
}

unsigned long range_len(const std::pair<unsigned long, unsigned long>& r)
{
    if (r.second > r.first)
        return r.second-r.first;
    else
        return 0;
}

template <typename T>
void resize(T& v, unsigned long n) { v.resize(n); }

void bind_basic_types() 
{
    class_<std::vector<double> >("array", "This object represents a 1D array of floating point numbers. "
        "Moreover, it binds directly to the C++ type std::vector<double>.", init<>() 
        )
        .def(vector_indexing_suite<std::vector<double> >())
        .def("__init__", make_constructor(&array_from_object))
        .def("__str__", array__str__)
        .def("__repr__", array__repr__)
        .def("clear", &std::vector<double>::clear)
        .def("resize", resize<std::vector<double> >)
        .def_pickle(serialize_pickle<std::vector<double> >());

    class_<std::vector<matrix<double,0,1> > >("vectors", "This object is an array of vector objects.")
        .def(vector_indexing_suite<std::vector<matrix<double,0,1> > >())
        .def("clear", &std::vector<matrix<double,0,1> >::clear)
        .def("resize", resize<std::vector<matrix<double,0,1> > >)
        .def_pickle(serialize_pickle<std::vector<matrix<double,0,1> > >());

    {
    typedef std::vector<std::vector<matrix<double,0,1> > > type;
    class_<type>("vectorss", "This object is an array of arrays of vector objects.")
        .def(vector_indexing_suite<type>())
        .def("clear", &type::clear)
        .def("resize", resize<type>)
        .def_pickle(serialize_pickle<type>());
    }

    typedef pair<unsigned long,unsigned long> range_type;
    class_<range_type>("range", "This object is used to represent a range of elements in an array.", init<>() )
        .def(init<unsigned long,unsigned long>())
        .def_readwrite("begin",&range_type::first, "The index of the first element in the range.  This is represented using an unsigned integer.")
        .def_readwrite("end",&range_type::second, "One past the index of the last element in the range.  This is represented using an unsigned integer.")
        .def("__str__", range__str__)
        .def("__repr__", range__repr__)
        .def("__iter__", &make_range_iterator)
        .def("__len__", &range_len)
        .def_pickle(serialize_pickle<range_type>());

    class_<range_iter>("_range_iter")
        .def("next", &range_iter::next);

    {
    typedef std::vector<std::pair<unsigned long, unsigned long> > type;
    class_<type>("ranges", "This object is an array of range objects.")
        .def(vector_indexing_suite<type>())
        .def("clear", &type::clear)
        .def("resize", resize<type>)
        .def_pickle(serialize_pickle<type>());
    }

    {
    typedef std::vector<std::vector<std::pair<unsigned long, unsigned long> > > type;
    class_<type>("rangess", "This object is an array of arrays of range objects.")
        .def(vector_indexing_suite<type>())
        .def("clear", &type::clear)
        .def("resize", resize<type>)
        .def_pickle(serialize_pickle<type>());
    }


    typedef pair<unsigned long,double> pair_type;
    class_<pair_type>("pair", "This object is used to represent the elements of a sparse_vector.", init<>() )
        .def(init<unsigned long,double>())
        .def_readwrite("first",&pair_type::first, "This field represents the index/dimension number.")
        .def_readwrite("second",&pair_type::second, "This field contains the value in a vector at dimension specified by the first field.")
        .def("__str__", pair__str__)
        .def("__repr__", pair__repr__)
        .def_pickle(serialize_pickle<pair_type>());

    class_<std::vector<pair_type> >("sparse_vector", 
"This object represents the mathematical idea of a sparse column vector.  It is    \n\
simply an array of dlib.pair objects, each representing an index/value pair in    \n\
the vector.  Any elements of the vector which are missing are implicitly set to    \n\
zero.      \n\
    \n\
Unless otherwise noted, any routines taking a sparse_vector assume the sparse    \n\
vector is sorted and has unique elements.  That is, the index values of the    \n\
pairs in a sparse_vector should be listed in increasing order and there should    \n\
not be duplicates.  However, some functions work with \"unsorted\" sparse    \n\
vectors.  These are dlib.sparse_vector objects that have either duplicate    \n\
entries or non-sorted index values.  Note further that you can convert an    \n\
\"unsorted\" sparse_vector into a properly sorted sparse vector by calling    \n\
dlib.make_sparse_vector() on it.   " 
        )
        .def(vector_indexing_suite<std::vector<pair_type> >())
        .def("__str__", sparse_vector__str__)
        .def("__repr__", sparse_vector__repr__)
        .def("clear", &std::vector<pair_type >::clear)
        .def("resize", resize<std::vector<pair_type > >)
        .def_pickle(serialize_pickle<std::vector<pair_type> >());

    class_<std::vector<std::vector<pair_type> > >("sparse_vectors", "This object is an array of sparse_vector objects.")
        .def(vector_indexing_suite<std::vector<std::vector<pair_type> > >())
        .def("clear", &std::vector<std::vector<pair_type> >::clear)
        .def("resize", resize<std::vector<std::vector<pair_type> > >)
        .def_pickle(serialize_pickle<std::vector<std::vector<pair_type> > >());

    {
    typedef std::vector<std::vector<std::vector<pair_type> > > type;
    class_<type>("sparse_vectorss", "This object is an array of arrays of sparse_vector objects.")
        .def(vector_indexing_suite<type>())
        .def("clear", &type::clear)
        .def("resize", resize<type>)
        .def_pickle(serialize_pickle<type>());
    }

}

