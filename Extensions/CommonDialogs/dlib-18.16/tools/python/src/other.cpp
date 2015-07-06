// Copyright (C) 2013  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.

#include <dlib/python.h>
#include <boost/shared_ptr.hpp>
#include <dlib/matrix.h>
#include <dlib/data_io.h>
#include <dlib/sparse_vector.h>
#include <boost/python/args.hpp>
#include <dlib/optimization.h>

using namespace dlib;
using namespace std;
using namespace boost::python;

typedef std::vector<std::pair<unsigned long,double> > sparse_vect;


void _make_sparse_vector (
    sparse_vect& v
)
{
    make_sparse_vector_inplace(v);
}

void _make_sparse_vector2 (
    std::vector<sparse_vect>& v
)
{
    for (unsigned long i = 0; i < v.size(); ++i)
        make_sparse_vector_inplace(v[i]);
}

boost::python::tuple _load_libsvm_formatted_data(
    const std::string& file_name
) 
{ 
    std::vector<sparse_vect> samples;
    std::vector<double> labels;
    load_libsvm_formatted_data(file_name, samples, labels); 
    return boost::python::make_tuple(samples, labels);
}

void _save_libsvm_formatted_data (
    const std::string& file_name,
    const std::vector<sparse_vect>& samples,
    const std::vector<double>& labels
) 
{ 
    pyassert(samples.size() == labels.size(), "Invalid inputs");
    save_libsvm_formatted_data(file_name, samples, labels); 
}

// ----------------------------------------------------------------------------------------

list _max_cost_assignment (
    const matrix<double>& cost
)
{
    // max_cost_assignment() only works with integer matrices, so convert from
    // double to integer.
    const double scale = (std::numeric_limits<dlib::int64>::max()/1000)/max(abs(cost));
    matrix<dlib::int64> int_cost = matrix_cast<dlib::int64>(round(cost*scale));
    return vector_to_python_list(max_cost_assignment(int_cost));
}

double _assignment_cost (
    const matrix<double>& cost,
    const list& assignment
)
{
    return assignment_cost(cost, python_list_to_vector<long>(assignment));
}

// ----------------------------------------------------------------------------------------

void hit_enter_to_continue()
{
    std::cout << "Hit enter to continue";
    std::cin.get();
}

// ----------------------------------------------------------------------------------------

void bind_other()
{
    using boost::python::arg;

    def("max_cost_assignment", _max_cost_assignment, (arg("cost")),
"requires    \n\
    - cost.nr() == cost.nc()    \n\
      (i.e. the input must be a square matrix)    \n\
ensures    \n\
    - Finds and returns the solution to the following optimization problem:    \n\
    \n\
        Maximize: f(A) == assignment_cost(cost, A)    \n\
        Subject to the following constraints:    \n\
            - The elements of A are unique. That is, there aren't any     \n\
              elements of A which are equal.      \n\
            - len(A) == cost.nr()    \n\
    \n\
    - Note that this function converts the input cost matrix into a 64bit fixed    \n\
      point representation.  Therefore, you should make sure that the values in    \n\
      your cost matrix can be accurately represented by 64bit fixed point values.    \n\
      If this is not the case then the solution my become inaccurate due to    \n\
      rounding error.  In general, this function will work properly when the ratio    \n\
      of the largest to the smallest value in cost is no more than about 1e16.   " 
        );

    def("assignment_cost", _assignment_cost, (arg("cost"),arg("assignment")),
"requires    \n\
    - cost.nr() == cost.nc()    \n\
      (i.e. the input must be a square matrix)    \n\
    - for all valid i:    \n\
        - 0 <= assignment[i] < cost.nr()    \n\
ensures    \n\
    - Interprets cost as a cost assignment matrix. That is, cost[i][j]     \n\
      represents the cost of assigning i to j.      \n\
    - Interprets assignment as a particular set of assignments. That is,    \n\
      i is assigned to assignment[i].    \n\
    - returns the cost of the given assignment. That is, returns    \n\
      a number which is:    \n\
        sum over i: cost[i][assignment[i]]   " 
        );

    def("make_sparse_vector", _make_sparse_vector , 
"This function modifies its argument so that it is a properly sorted sparse vector.    \n\
This means that the elements of the sparse vector will be ordered so that pairs    \n\
with smaller indices come first.  Additionally, there won't be any pairs with    \n\
identical indices.  If such pairs were present in the input sparse vector then    \n\
their values will be added together and only one pair with their index will be    \n\
present in the output.   " 
        );
    def("make_sparse_vector", _make_sparse_vector2 , 
        "This function modifies a sparse_vectors object so that all elements it contains are properly sorted sparse vectors.");

    def("load_libsvm_formatted_data",_load_libsvm_formatted_data, (arg("file_name")),
"ensures    \n\
    - Attempts to read a file of the given name that should contain libsvm    \n\
      formatted data.  The data is returned as a tuple where the first tuple    \n\
      element is an array of sparse vectors and the second element is an array of    \n\
      labels.    " 
    );

    def("save_libsvm_formatted_data",_save_libsvm_formatted_data, (arg("file_name"), arg("samples"), arg("labels")),
"requires    \n\
    - len(samples) == len(labels)    \n\
ensures    \n\
    - saves the data to the given file in libsvm format   " 
    );

    def("hit_enter_to_continue", hit_enter_to_continue, 
        "Asks the user to hit enter to continue and pauses until they do so.");
}

