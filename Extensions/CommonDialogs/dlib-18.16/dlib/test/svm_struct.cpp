// Copyright (C) 2011  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.

#include <sstream>
#include <string>
#include <cstdlib>
#include <ctime>
#include <dlib/svm_threaded.h>

#include "tester.h"

namespace  
{
    using namespace test;
    using namespace dlib;
    using namespace std;

    logger dlog("test.svm_struct");


    template <
        typename matrix_type,
        typename sample_type,
        typename label_type
        >
    class test_multiclass_svm_problem : public structural_svm_problem_threaded<matrix_type,
                                                                 std::vector<std::pair<unsigned long,typename matrix_type::type> > > 
    {

    public:
        typedef typename matrix_type::type scalar_type;
        typedef std::vector<std::pair<unsigned long,scalar_type> > feature_vector_type;

        test_multiclass_svm_problem (
            const std::vector<sample_type>& samples_,
            const std::vector<label_type>& labels_
        ) :
            structural_svm_problem_threaded<matrix_type,
                std::vector<std::pair<unsigned long,typename matrix_type::type> > >(2),
            samples(samples_),
            labels(labels_),
            dims(10+1) // +1 for the bias
        {
            for (int i = 0; i < 10; ++i)
            {
                distinct_labels.push_back(i);
            }
        }

        virtual long get_num_dimensions (
        ) const
        {
            return dims*10;
        }

        virtual long get_num_samples (
        ) const 
        {
            return static_cast<long>(samples.size());
        }

        virtual void get_truth_joint_feature_vector (
            long idx,
            feature_vector_type& psi
        ) const 
        {
            assign(psi, samples[idx]);
            // Add a constant -1 to account for the bias term.
            psi.push_back(std::make_pair(dims-1,static_cast<scalar_type>(-1)));

            // Find which distinct label goes with this psi.
            const long label_idx = index_of_max(mat(distinct_labels) == labels[idx]);

            offset_feature_vector(psi, dims*label_idx);
        }

        virtual void separation_oracle (
            const long idx,
            const matrix_type& current_solution,
            scalar_type& loss,
            feature_vector_type& psi
        ) const 
        {
            scalar_type best_val = -std::numeric_limits<scalar_type>::infinity();
            unsigned long best_idx = 0;

            // Figure out which label is the best.  That is, what label maximizes
            // LOSS(idx,y) + F(x,y).  Note that y in this case is given by distinct_labels[i].
            for (unsigned long i = 0; i < distinct_labels.size(); ++i)
            {
                // Compute the F(x,y) part:
                // perform: temp == dot(relevant part of current solution, samples[idx]) - current_bias
                scalar_type temp = dot(rowm(current_solution, range(i*dims, (i+1)*dims-2)), samples[idx]) - current_solution((i+1)*dims-1);

                // Add the LOSS(idx,y) part:
                if (labels[idx] != distinct_labels[i])
                    temp += 1;

                // Now temp == LOSS(idx,y) + F(x,y).  Check if it is the biggest we have seen.
                if (temp > best_val)
                {
                    best_val = temp;
                    best_idx = i;
                }
            }

            assign(psi, samples[idx]);
            // add a constant -1 to account for the bias term
            psi.push_back(std::make_pair(dims-1,static_cast<scalar_type>(-1)));

            offset_feature_vector(psi, dims*best_idx);

            if (distinct_labels[best_idx] == labels[idx])
                loss = 0;
            else
                loss = 1;
        }

    private:

        void offset_feature_vector (
            feature_vector_type& sample,
            const unsigned long val
        ) const
        {
            if (val != 0)
            {
                for (typename feature_vector_type::iterator i = sample.begin(); i != sample.end(); ++i)
                {
                    i->first += val;
                }
            }
        }


        const std::vector<sample_type>& samples;
        const std::vector<label_type>& labels;
        std::vector<label_type> distinct_labels;
        const long dims;
    };

// ----------------------------------------------------------------------------------------

    template <
        typename K,
        typename label_type_ = typename K::scalar_type 
        >
    class test_svm_multiclass_linear_trainer2
    {
    public:
        typedef label_type_ label_type;
        typedef K kernel_type;
        typedef typename kernel_type::scalar_type scalar_type;
        typedef typename kernel_type::sample_type sample_type;
        typedef typename kernel_type::mem_manager_type mem_manager_type;

        typedef multiclass_linear_decision_function<kernel_type, label_type> trained_function_type;


        test_svm_multiclass_linear_trainer2 (
        ) :
            C(10),
            eps(1e-4),
            verbose(false)
        {
        }

        trained_function_type train (
            const std::vector<sample_type>& all_samples,
            const std::vector<label_type>& all_labels
        ) const
        {
            scalar_type svm_objective = 0;
            return train(all_samples, all_labels, svm_objective);
        }

        trained_function_type train (
            const std::vector<sample_type>& all_samples,
            const std::vector<label_type>& all_labels,
            scalar_type& svm_objective
        ) const
        {
            // make sure requires clause is not broken
            DLIB_ASSERT(is_learning_problem(all_samples,all_labels),
                "\t trained_function_type test_svm_multiclass_linear_trainer2::train(all_samples,all_labels)"
                << "\n\t invalid inputs were given to this function"
                << "\n\t all_samples.size():     " << all_samples.size() 
                << "\n\t all_labels.size():      " << all_labels.size() 
                );

            typedef matrix<scalar_type,0,1> w_type;
            w_type weights;
            std::vector<sample_type> samples1(all_samples.begin(), all_samples.begin()+all_samples.size()/2);
            std::vector<sample_type> samples2(all_samples.begin()+all_samples.size()/2, all_samples.end());

            std::vector<label_type> labels1(all_labels.begin(), all_labels.begin()+all_labels.size()/2);
            std::vector<label_type> labels2(all_labels.begin()+all_labels.size()/2, all_labels.end());
            test_multiclass_svm_problem<w_type, sample_type, label_type> problem1(samples1, labels1);
            test_multiclass_svm_problem<w_type, sample_type, label_type> problem2(samples2, labels2);
            problem1.set_max_cache_size(3);
            problem2.set_max_cache_size(0);

            svm_struct_processing_node node1(problem1, 12345, 3);
            svm_struct_processing_node node2(problem2, 12346, 0);

            solver.set_inactive_plane_threshold(50);
            solver.set_subproblem_epsilon(1e-4);

            svm_struct_controller_node controller;
            controller.set_c(C);
            controller.set_epsilon(eps);
            if (verbose)
                controller.be_verbose();
            controller.add_processing_node("127.0.0.1", 12345);
            controller.add_processing_node("localhost:12346");
            svm_objective = controller(solver, weights);



            trained_function_type df;

            const long dims = max_index_plus_one(all_samples);
            df.labels  = select_all_distinct_labels(all_labels);
            df.weights = colm(reshape(weights, df.labels.size(), dims+1), range(0,dims-1));
            df.b       = colm(reshape(weights, df.labels.size(), dims+1), dims);
            return df;
        }

    private:
        scalar_type C;
        scalar_type eps;
        bool verbose;
        mutable oca solver;
    };

// ----------------------------------------------------------------------------------------

    template <
        typename K,
        typename label_type_ = typename K::scalar_type 
        >
    class test_svm_multiclass_linear_trainer3
    {
    public:
        typedef label_type_ label_type;
        typedef K kernel_type;
        typedef typename kernel_type::scalar_type scalar_type;
        typedef typename kernel_type::sample_type sample_type;
        typedef typename kernel_type::mem_manager_type mem_manager_type;

        typedef multiclass_linear_decision_function<kernel_type, label_type> trained_function_type;


        test_svm_multiclass_linear_trainer3 (
        ) :
            C(10),
            eps(1e-4),
            verbose(false)
        {
        }

        trained_function_type train (
            const std::vector<sample_type>& all_samples,
            const std::vector<label_type>& all_labels
        ) const
        {
            scalar_type svm_objective = 0;
            return train(all_samples, all_labels, svm_objective);
        }

        trained_function_type train (
            const std::vector<sample_type>& all_samples,
            const std::vector<label_type>& all_labels,
            scalar_type& svm_objective
        ) const
        {
            // make sure requires clause is not broken
            DLIB_ASSERT(is_learning_problem(all_samples,all_labels),
                "\t trained_function_type test_svm_multiclass_linear_trainer3::train(all_samples,all_labels)"
                << "\n\t invalid inputs were given to this function"
                << "\n\t all_samples.size():     " << all_samples.size() 
                << "\n\t all_labels.size():      " << all_labels.size() 
                );

            typedef matrix<scalar_type,0,1> w_type;
            w_type weights;
            test_multiclass_svm_problem<w_type, sample_type, label_type> problem(all_samples, all_labels);
            problem.set_max_cache_size(0);

            problem.set_c(C);
            problem.set_epsilon(eps);

            if (verbose)
                problem.be_verbose();
            
            solver.set_inactive_plane_threshold(50);
            solver.set_subproblem_epsilon(1e-4);
            svm_objective = solver(problem, weights);


            trained_function_type df;

            const long dims = max_index_plus_one(all_samples);
            df.labels  = select_all_distinct_labels(all_labels);
            df.weights = colm(reshape(weights, df.labels.size(), dims+1), range(0,dims-1));
            df.b       = colm(reshape(weights, df.labels.size(), dims+1), dims);
            return df;
        }

    private:
        scalar_type C;
        scalar_type eps;
        bool verbose;
        mutable oca solver;
    };

// ----------------------------------------------------------------------------------------

    template <
        typename K,
        typename label_type_ = typename K::scalar_type 
        >
    class test_svm_multiclass_linear_trainer4
    {
    public:
        typedef label_type_ label_type;
        typedef K kernel_type;
        typedef typename kernel_type::scalar_type scalar_type;
        typedef typename kernel_type::sample_type sample_type;
        typedef typename kernel_type::mem_manager_type mem_manager_type;

        typedef multiclass_linear_decision_function<kernel_type, label_type> trained_function_type;


        test_svm_multiclass_linear_trainer4 (
        ) :
            C(10),
            eps(1e-4),
            verbose(false)
        {
        }

        trained_function_type train (
            const std::vector<sample_type>& all_samples,
            const std::vector<label_type>& all_labels
        ) const
        {
            scalar_type svm_objective = 0;
            return train(all_samples, all_labels, svm_objective);
        }

        trained_function_type train (
            const std::vector<sample_type>& all_samples,
            const std::vector<label_type>& all_labels,
            scalar_type& svm_objective
        ) const
        {
            // make sure requires clause is not broken
            DLIB_ASSERT(is_learning_problem(all_samples,all_labels),
                "\t trained_function_type test_svm_multiclass_linear_trainer4::train(all_samples,all_labels)"
                << "\n\t invalid inputs were given to this function"
                << "\n\t all_samples.size():     " << all_samples.size() 
                << "\n\t all_labels.size():      " << all_labels.size() 
                );

            typedef matrix<scalar_type,0,1> w_type;
            w_type weights;
            test_multiclass_svm_problem<w_type, sample_type, label_type> problem(all_samples, all_labels);
            problem.set_max_cache_size(3);

            problem.set_c(C);
            problem.set_epsilon(eps);

            if (verbose)
                problem.be_verbose();
            
            solver.set_inactive_plane_threshold(50);
            solver.set_subproblem_epsilon(1e-4);
            svm_objective = solver(problem, weights);


            trained_function_type df;

            const long dims = max_index_plus_one(all_samples);
            df.labels  = select_all_distinct_labels(all_labels);
            df.weights = colm(reshape(weights, df.labels.size(), dims+1), range(0,dims-1));
            df.b       = colm(reshape(weights, df.labels.size(), dims+1), dims);
            return df;
        }

    private:
        scalar_type C;
        scalar_type eps;
        bool verbose;
        mutable oca solver;
    };

// ----------------------------------------------------------------------------------------

    template <
        typename K,
        typename label_type_ = typename K::scalar_type 
        >
    class test_svm_multiclass_linear_trainer5
    {
    public:
        typedef label_type_ label_type;
        typedef K kernel_type;
        typedef typename kernel_type::scalar_type scalar_type;
        typedef typename kernel_type::sample_type sample_type;
        typedef typename kernel_type::mem_manager_type mem_manager_type;

        typedef multiclass_linear_decision_function<kernel_type, label_type> trained_function_type;


        test_svm_multiclass_linear_trainer5 (
        ) :
            C(10),
            eps(1e-4),
            verbose(false)
        {
        }

        trained_function_type train (
            const std::vector<sample_type>& all_samples,
            const std::vector<label_type>& all_labels
        ) const
        {
            scalar_type svm_objective = 0;
            return train(all_samples, all_labels, svm_objective);
        }

        trained_function_type train (
            const std::vector<sample_type>& all_samples,
            const std::vector<label_type>& all_labels,
            scalar_type& svm_objective
        ) const
        {
            // make sure requires clause is not broken
            DLIB_ASSERT(is_learning_problem(all_samples,all_labels),
                "\t trained_function_type test_svm_multiclass_linear_trainer5::train(all_samples,all_labels)"
                << "\n\t invalid inputs were given to this function"
                << "\n\t all_samples.size():     " << all_samples.size() 
                << "\n\t all_labels.size():      " << all_labels.size() 
                );

            typedef matrix<scalar_type,0,1> w_type;
            w_type weights;
            const long dims = max_index_plus_one(all_samples);
            trained_function_type df;
            df.labels  = select_all_distinct_labels(all_labels);
            multiclass_svm_problem<w_type, sample_type, label_type> problem(all_samples, all_labels, df.labels, dims, 4);
            problem.set_max_cache_size(3);

            problem.set_c(C);
            problem.set_epsilon(eps);

            if (verbose)
                problem.be_verbose();
            
            solver.set_inactive_plane_threshold(50);
            solver.set_subproblem_epsilon(1e-4);
            svm_objective = solver(problem, weights);



            df.weights = colm(reshape(weights, df.labels.size(), dims+1), range(0,dims-1));
            df.b       = colm(reshape(weights, df.labels.size(), dims+1), dims);
            return df;
        }

    private:
        scalar_type C;
        scalar_type eps;
        bool verbose;
        mutable oca solver;
    };


// ----------------------------------------------------------------------------------------

    typedef matrix<double,10,1> sample_type;
    typedef double scalar_type;

    void make_dataset (
        std::vector<sample_type>& samples,
        std::vector<scalar_type>& labels,
        int num,
        dlib::rand& rnd
    )
    {
        samples.clear();
        labels.clear();
        for (int i = 0; i < 10; ++i)
        {
            for (int j = 0; j < num; ++j)
            {
                sample_type samp;
                samp = 0;
                samp(i) = 10*rnd.get_random_double()+1;

                samples.push_back(samp);
                labels.push_back(i);
            }
        }
    }

// ----------------------------------------------------------------------------------------

    class test_svm_struct : public tester
    {
    public:
        test_svm_struct (
        ) :
            tester ("test_svm_struct",
                    "Runs tests on the structural svm components.")
        {}

        void run_test (
            const std::vector<sample_type>& samples,
            const std::vector<scalar_type>& labels,
            const double true_obj
        )
        {
            typedef linear_kernel<sample_type> kernel_type;
            svm_multiclass_linear_trainer<kernel_type> trainer1;
            test_svm_multiclass_linear_trainer2<kernel_type> trainer2;
            test_svm_multiclass_linear_trainer3<kernel_type> trainer3;
            test_svm_multiclass_linear_trainer4<kernel_type> trainer4;
            test_svm_multiclass_linear_trainer5<kernel_type> trainer5;

            trainer1.set_epsilon(1e-4);
            trainer1.set_c(10);


            multiclass_linear_decision_function<kernel_type,double> df1, df2, df3, df4, df5;
            double obj1, obj2, obj3, obj4, obj5;

            // Solve a multiclass SVM a whole bunch of different ways and make sure
            // they all give the same answer.
            print_spinner();
            df1 = trainer1.train(samples, labels, obj1);
            print_spinner();
            df2 = trainer2.train(samples, labels, obj2);
            print_spinner();
            df3 = trainer3.train(samples, labels, obj3);
            print_spinner();
            df4 = trainer4.train(samples, labels, obj4);
            print_spinner();
            df5 = trainer5.train(samples, labels, obj5);
            print_spinner();

            dlog << LINFO << "obj1: "<< obj1;
            dlog << LINFO << "obj2: "<< obj2;
            dlog << LINFO << "obj3: "<< obj3;
            dlog << LINFO << "obj4: "<< obj4;
            dlog << LINFO << "obj5: "<< obj5;
            DLIB_TEST(std::abs(obj1 - obj2) < 1e-2);
            DLIB_TEST(std::abs(obj1 - obj3) < 1e-2);
            DLIB_TEST(std::abs(obj1 - obj4) < 1e-2);
            DLIB_TEST(std::abs(obj1 - obj5) < 1e-2);
            DLIB_TEST(std::abs(obj1 - true_obj) < 1e-2);
            DLIB_TEST(std::abs(obj2 - true_obj) < 1e-2);
            DLIB_TEST(std::abs(obj3 - true_obj) < 1e-2);
            DLIB_TEST(std::abs(obj4 - true_obj) < 1e-2);
            DLIB_TEST(std::abs(obj5 - true_obj) < 1e-2);

            dlog << LINFO << "weight error: "<< max(abs(df1.weights - df2.weights));
            dlog << LINFO << "weight error: "<< max(abs(df1.weights - df3.weights));
            dlog << LINFO << "weight error: "<< max(abs(df1.weights - df4.weights));
            dlog << LINFO << "weight error: "<< max(abs(df1.weights - df5.weights));

            DLIB_TEST(max(abs(df1.weights - df2.weights)) < 1e-2);
            DLIB_TEST(max(abs(df1.weights - df3.weights)) < 1e-2);
            DLIB_TEST(max(abs(df1.weights - df4.weights)) < 1e-2);
            DLIB_TEST(max(abs(df1.weights - df5.weights)) < 1e-2);

            dlog << LINFO << "b error: "<< max(abs(df1.b - df2.b));
            dlog << LINFO << "b error: "<< max(abs(df1.b - df3.b));
            dlog << LINFO << "b error: "<< max(abs(df1.b - df4.b));
            dlog << LINFO << "b error: "<< max(abs(df1.b - df5.b));
            DLIB_TEST(max(abs(df1.b - df2.b)) < 1e-2);
            DLIB_TEST(max(abs(df1.b - df3.b)) < 1e-2);
            DLIB_TEST(max(abs(df1.b - df4.b)) < 1e-2);
            DLIB_TEST(max(abs(df1.b - df5.b)) < 1e-2);

            matrix<double> res = test_multiclass_decision_function(df1, samples, labels);
            dlog << LINFO << res;
            dlog << LINFO << "accuracy: " << sum(diag(res))/sum(res);
            DLIB_TEST(sum(diag(res)) == samples.size());

            res = test_multiclass_decision_function(df2, samples, labels);
            dlog << LINFO << res;
            dlog << LINFO << "accuracy: " << sum(diag(res))/sum(res);
            DLIB_TEST(sum(diag(res)) == samples.size());

            res = test_multiclass_decision_function(df3, samples, labels);
            dlog << LINFO << res;
            dlog << LINFO << "accuracy: " << sum(diag(res))/sum(res);
            DLIB_TEST(sum(diag(res)) == samples.size());

            res = test_multiclass_decision_function(df4, samples, labels);
            dlog << LINFO << res;
            dlog << LINFO << "accuracy: " << sum(diag(res))/sum(res);
            DLIB_TEST(sum(diag(res)) == samples.size());

            res = test_multiclass_decision_function(df5, samples, labels);
            dlog << LINFO << res;
            dlog << LINFO << "accuracy: " << sum(diag(res))/sum(res);
            DLIB_TEST(sum(diag(res)) == samples.size());
        }

        void perform_test (
        )
        {
            std::vector<sample_type> samples;
            std::vector<scalar_type> labels;

            dlib::rand rnd;

            dlog << LINFO << "test with 100 samples per class";
            make_dataset(samples, labels, 100, rnd);
            run_test(samples, labels, 1.155);

            dlog << LINFO << "test with 1 sample per class";
            make_dataset(samples, labels, 1, rnd);
            run_test(samples, labels, 0.251);

            dlog << LINFO << "test with 2 sample per class";
            make_dataset(samples, labels, 2, rnd);
            run_test(samples, labels, 0.444);
        }
    } a;



}




