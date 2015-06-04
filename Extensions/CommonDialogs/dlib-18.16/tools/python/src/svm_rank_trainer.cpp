// Copyright (C) 2013  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.

#include <dlib/python.h>
#include <boost/shared_ptr.hpp>
#include <dlib/matrix.h>
#include <dlib/svm.h>
#include <boost/python/suite/indexing/vector_indexing_suite.hpp>
#include "testing_results.h"
#include <boost/python/args.hpp>

using namespace dlib;
using namespace std;
using namespace boost::python;

typedef matrix<double,0,1> sample_type; 
typedef std::vector<std::pair<unsigned long,double> > sparse_vect;


// ----------------------------------------------------------------------------------------

namespace dlib
{
    template <typename T>
    bool operator== (
        const ranking_pair<T>& ,
        const ranking_pair<T>& 
    )
    {
        pyassert(false, "It is illegal to compare ranking pair objects for equality.");
        return false;
    }
}

template <typename T>
void resize(T& v, unsigned long n) { v.resize(n); }

// ----------------------------------------------------------------------------------------

template <typename trainer_type>
typename trainer_type::trained_function_type train1 (
    const trainer_type& trainer,
    const ranking_pair<typename trainer_type::sample_type>& sample
)
{
    typedef ranking_pair<typename trainer_type::sample_type> st;
    pyassert(is_ranking_problem(std::vector<st>(1, sample)), "Invalid inputs");
    return trainer.train(sample);
}

template <typename trainer_type>
typename trainer_type::trained_function_type train2 (
    const trainer_type& trainer,
    const std::vector<ranking_pair<typename trainer_type::sample_type> >& samples
)
{
    pyassert(is_ranking_problem(samples), "Invalid inputs");
    return trainer.train(samples);
}

template <typename trainer_type>
void set_epsilon ( trainer_type& trainer, double eps)
{
    pyassert(eps > 0, "epsilon must be > 0");
    trainer.set_epsilon(eps);
}

template <typename trainer_type>
double get_epsilon ( const trainer_type& trainer) { return trainer.get_epsilon(); }

template <typename trainer_type>
void set_c ( trainer_type& trainer, double C)
{
    pyassert(C > 0, "C must be > 0");
    trainer.set_c(C);
}

template <typename trainer_type>
double get_c (const trainer_type& trainer)
{
    return trainer.get_c();
}


template <typename trainer>
void add_ranker (
    const char* name
)
{
    class_<trainer>(name)
        .add_property("epsilon", get_epsilon<trainer>, set_epsilon<trainer>)
        .add_property("c", get_c<trainer>, set_c<trainer>)
        .add_property("max_iterations", &trainer::get_max_iterations, &trainer::set_max_iterations)
        .add_property("force_last_weight_to_1", &trainer::forces_last_weight_to_1, &trainer::force_last_weight_to_1)
        .add_property("learns_nonnegative_weights", &trainer::learns_nonnegative_weights, &trainer::set_learns_nonnegative_weights)
        .add_property("has_prior", &trainer::has_prior)
        .def("train", train1<trainer>)
        .def("train", train2<trainer>)
        .def("set_prior", &trainer::set_prior)
        .def("be_verbose", &trainer::be_verbose)
        .def("be_quiet", &trainer::be_quiet);
}

// ----------------------------------------------------------------------------------------

template <
    typename trainer_type,
    typename T
    >
const ranking_test _cross_ranking_validate_trainer (
    const trainer_type& trainer,
    const std::vector<ranking_pair<T> >& samples,
    const unsigned long folds
)
{
    pyassert(is_ranking_problem(samples), "Training data does not make a valid training set.");
    pyassert(1 < folds && folds <= samples.size(), "Invalid number of folds given.");
    return cross_validate_ranking_trainer(trainer, samples, folds);
}

// ----------------------------------------------------------------------------------------

void bind_svm_rank_trainer()
{
    using boost::python::arg;
    class_<ranking_pair<sample_type> >("ranking_pair")
        .add_property("relevant", &ranking_pair<sample_type>::relevant)
        .add_property("nonrelevant", &ranking_pair<sample_type>::nonrelevant)
        .def_pickle(serialize_pickle<ranking_pair<sample_type> >());

    class_<ranking_pair<sparse_vect> >("sparse_ranking_pair")
        .add_property("relevant", &ranking_pair<sparse_vect>::relevant)
        .add_property("nonrelevant", &ranking_pair<sparse_vect>::nonrelevant)
        .def_pickle(serialize_pickle<ranking_pair<sparse_vect> >());

    typedef std::vector<ranking_pair<sample_type> > ranking_pairs;
    class_<ranking_pairs>("ranking_pairs")
        .def(vector_indexing_suite<ranking_pairs>())
        .def("clear", &ranking_pairs::clear)
        .def("resize", resize<ranking_pairs>)
        .def_pickle(serialize_pickle<ranking_pairs>());

    typedef std::vector<ranking_pair<sparse_vect> > sparse_ranking_pairs;
    class_<sparse_ranking_pairs>("sparse_ranking_pairs")
        .def(vector_indexing_suite<sparse_ranking_pairs>())
        .def("clear", &sparse_ranking_pairs::clear)
        .def("resize", resize<sparse_ranking_pairs>)
        .def_pickle(serialize_pickle<sparse_ranking_pairs>());

    add_ranker<svm_rank_trainer<linear_kernel<sample_type> > >("svm_rank_trainer");
    add_ranker<svm_rank_trainer<sparse_linear_kernel<sparse_vect> > >("svm_rank_trainer_sparse");

    def("cross_validate_ranking_trainer", &_cross_ranking_validate_trainer<
                svm_rank_trainer<linear_kernel<sample_type> >,sample_type>,
                (arg("trainer"), arg("samples"), arg("folds")) );
    def("cross_validate_ranking_trainer", &_cross_ranking_validate_trainer<
                svm_rank_trainer<sparse_linear_kernel<sparse_vect> > ,sparse_vect>,
                (arg("trainer"), arg("samples"), arg("folds")) );
}



