// Copyright (C) 2013  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.

#include <dlib/python.h>
#include <dlib/matrix.h>
#include <boost/python/args.hpp>
#include <dlib/svm.h>


using namespace dlib;
using namespace std;
using namespace boost::python;

template <typename psi_type>
class svm_struct_prob : public structural_svm_problem<matrix<double,0,1>, psi_type>
{
    typedef structural_svm_problem<matrix<double,0,1>, psi_type> base;
    typedef typename base::feature_vector_type feature_vector_type;
    typedef typename base::matrix_type matrix_type;
    typedef typename base::scalar_type scalar_type;
public:
    svm_struct_prob (
        object& problem_,
        long num_dimensions_,
        long num_samples_
    ) : 
        num_dimensions(num_dimensions_),
        num_samples(num_samples_),
        problem(problem_)
    {} 

    virtual long get_num_dimensions (
    ) const { return num_dimensions; }

    virtual long get_num_samples (
    ) const { return num_samples; }

    virtual void get_truth_joint_feature_vector (
        long idx,
        feature_vector_type& psi 
    ) const 
    {
        psi = extract<feature_vector_type&>(problem.attr("get_truth_joint_feature_vector")(idx));
    }

    virtual void separation_oracle (
        const long idx,
        const matrix_type& current_solution,
        scalar_type& loss,
        feature_vector_type& psi
    ) const 
    {
        object res = problem.attr("separation_oracle")(idx,boost::ref(current_solution));
        pyassert(len(res) == 2, "separation_oracle() must return two objects, the loss and the psi vector");
        // let the user supply the output arguments in any order.
        if (extract<double>(res[0]).check())
        {
            loss = extract<double>(res[0]);
            psi = extract<feature_vector_type&>(res[1]);
        }
        else
        {
            psi = extract<feature_vector_type&>(res[0]);
            loss = extract<double>(res[1]);
        }
    }

private:

    const long num_dimensions;
    const long num_samples;
    object& problem;
};

// ----------------------------------------------------------------------------------------

template <typename psi_type>
matrix<double,0,1> solve_structural_svm_problem_impl(
    object problem
)
{
    const double C = extract<double>(problem.attr("C"));
    const bool be_verbose = hasattr(problem,"be_verbose") && extract<bool>(problem.attr("be_verbose"));
    const bool use_sparse_feature_vectors = hasattr(problem,"use_sparse_feature_vectors") && 
                                            extract<bool>(problem.attr("use_sparse_feature_vectors"));
    const bool learns_nonnegative_weights = hasattr(problem,"learns_nonnegative_weights") && 
                                            extract<bool>(problem.attr("learns_nonnegative_weights"));

    double eps = 0.001;
    unsigned long max_cache_size = 10;
    if (hasattr(problem, "epsilon"))
        eps = extract<double>(problem.attr("epsilon"));
    if (hasattr(problem, "max_cache_size"))
        max_cache_size = extract<double>(problem.attr("max_cache_size"));

    const long num_samples = extract<long>(problem.attr("num_samples"));
    const long num_dimensions = extract<long>(problem.attr("num_dimensions"));

    pyassert(num_samples > 0, "You can't train a Structural-SVM if you don't have any training samples.");

    if (be_verbose)
    {
        cout << "C:              " << C << endl;
        cout << "epsilon:        " << eps << endl;
        cout << "max_cache_size: " << max_cache_size << endl;
        cout << "num_samples:    " << num_samples << endl;
        cout << "num_dimensions: " << num_dimensions << endl;
        cout << "use_sparse_feature_vectors: " << std::boolalpha << use_sparse_feature_vectors << endl;
        cout << "learns_nonnegative_weights: " << std::boolalpha << learns_nonnegative_weights << endl;
        cout << endl;
    }

    svm_struct_prob<psi_type> prob(problem, num_dimensions, num_samples);
    prob.set_c(C);
    prob.set_epsilon(eps);
    prob.set_max_cache_size(max_cache_size);
    if (be_verbose)
        prob.be_verbose();

    oca solver;
    matrix<double,0,1> w;
    if (learns_nonnegative_weights)
        solver(prob, w, prob.get_num_dimensions());
    else
        solver(prob, w);
    return w;
}

// ----------------------------------------------------------------------------------------

matrix<double,0,1> solve_structural_svm_problem(
    object problem
)
{
    // Check if the python code is using sparse or dense vectors to represent PSI()
    extract<matrix<double,0,1> > isdense(problem.attr("get_truth_joint_feature_vector")(0));
    if (isdense.check())
        return solve_structural_svm_problem_impl<matrix<double,0,1> >(problem);
    else
        return solve_structural_svm_problem_impl<std::vector<std::pair<unsigned long,double> > >(problem);
}

// ----------------------------------------------------------------------------------------

void bind_svm_struct()
{
    using boost::python::arg;

    def("solve_structural_svm_problem",solve_structural_svm_problem, (arg("problem")),
"This function solves a structural SVM problem and returns the weight vector    \n\
that defines the solution.  See the example program python_examples/svm_struct.py    \n\
for documentation about how to create a proper problem object.   " 
        );
}

// ----------------------------------------------------------------------------------------

