// Copyright (C) 2012  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.


#include <dlib/optimization.h>
#include <dlib/svm.h>
#include <sstream>
#include <string>
#include <cstdlib>
#include <ctime>
#include <vector>

#include "tester.h"


namespace  
{

    using namespace test;
    using namespace dlib;
    using namespace std;

    logger dlog("test.oca");

// ----------------------------------------------------------------------------------------

    class test_oca : public tester
    {

    public:
        test_oca (
        ) :
            tester ("test_oca",
                    "Runs tests on the oca component.")
        {
        }

        void perform_test(
        )
        {
            print_spinner();

            typedef matrix<double,0,1> w_type;
            w_type w;

            decision_function<linear_kernel<w_type> > df;
            svm_c_linear_trainer<linear_kernel<w_type> > trainer;
            trainer.set_c_class1(2);
            trainer.set_c_class1(3);
            trainer.set_learns_nonnegative_weights(true);
            trainer.set_epsilon(1e-12);

            std::vector<w_type> x;
            w_type temp(2);
            temp = -1, 1;
            x.push_back(temp);
            temp = 1, -1;
            x.push_back(temp);

            std::vector<double> y;
            y.push_back(+1);
            y.push_back(-1);

            w_type true_w(3);

            oca solver;

            // test the version without a non-negativity constraint on w.
            solver(make_oca_problem_c_svm<w_type>(2.0, 3.0, mat(x), mat(y), false, 1e-12, 40, max_index_plus_one(x)), w, 0);
            dlog << LINFO << trans(w);
            true_w = -0.5, 0.5, 0;
            dlog << LINFO << "error: "<< max(abs(w-true_w));
            DLIB_TEST(max(abs(w-true_w)) < 1e-10);

            w_type prior = true_w;
            solver(make_oca_problem_c_svm<w_type>(20.0, 30.0, mat(x), mat(y), false, 1e-12, 40, max_index_plus_one(x)), w, prior);
            dlog << LINFO << trans(w);
            true_w = -0.5, 0.5, 0;
            dlog << LINFO << "error: "<< max(abs(w-true_w));
            DLIB_TEST(max(abs(w-true_w)) < 1e-10);

            prior = 0,0,0;
            solver(make_oca_problem_c_svm<w_type>(20.0, 30.0, mat(x), mat(y), false, 1e-12, 40, max_index_plus_one(x)), w, prior);
            dlog << LINFO << trans(w);
            true_w = -0.5, 0.5, 0;
            dlog << LINFO << "error: "<< max(abs(w-true_w));
            DLIB_TEST(max(abs(w-true_w)) < 1e-10);

            prior = -1,1,0;
            solver(make_oca_problem_c_svm<w_type>(20.0, 30.0, mat(x), mat(y), false, 1e-12, 40, max_index_plus_one(x)), w, prior);
            dlog << LINFO << trans(w);
            true_w = -1.0, 1.0, 0;
            dlog << LINFO << "error: "<< max(abs(w-true_w));
            DLIB_TEST(max(abs(w-true_w)) < 1e-10);

            prior = -0.2,0.2,0;
            solver(make_oca_problem_c_svm<w_type>(20.0, 30.0, mat(x), mat(y), false, 1e-12, 40, max_index_plus_one(x)), w, prior);
            dlog << LINFO << trans(w);
            true_w = -0.5, 0.5, 0;
            dlog << LINFO << "error: "<< max(abs(w-true_w));
            DLIB_TEST(max(abs(w-true_w)) < 1e-10);

            prior = -10.2,-1,0;
            solver(make_oca_problem_c_svm<w_type>(20.0, 30.0, mat(x), mat(y), false, 1e-12, 40, max_index_plus_one(x)), w, prior);
            dlog << LINFO << trans(w);
            true_w = -10.2, -1.0, 0;
            dlog << LINFO << "error: "<< max(abs(w-true_w));
            DLIB_TEST(max(abs(w-true_w)) < 1e-10);

            print_spinner();

            // test the version with a non-negativity constraint on w.
            solver(make_oca_problem_c_svm<w_type>(2.0, 3.0, mat(x), mat(y), false, 1e-12, 40, max_index_plus_one(x)), w, 9999);
            dlog << LINFO << trans(w);
            true_w = 0, 1, 0;
            dlog << LINFO << "error: "<< max(abs(w-true_w));
            DLIB_TEST(max(abs(w-true_w)) < 1e-10);

            df = trainer.train(x,y);
            w = join_cols(df.basis_vectors(0), uniform_matrix<double>(1,1,-df.b));
            true_w = 0, 1, 0;
            dlog << LINFO << "error: "<< max(abs(w-true_w));
            DLIB_TEST(max(abs(w-true_w)) < 1e-10);


            print_spinner();

            // test the version with a non-negativity constraint on w.
            solver(make_oca_problem_c_svm<w_type>(2.0, 3.0, mat(x), mat(y), false, 1e-12, 40, max_index_plus_one(x)), w, 2);
            dlog << LINFO << trans(w);
            true_w = 0, 1, 0;
            dlog << LINFO << "error: "<< max(abs(w-true_w));
            DLIB_TEST(max(abs(w-true_w)) < 1e-10);

            print_spinner();


            // test the version with a non-negativity constraint on w.
            solver(make_oca_problem_c_svm<w_type>(2.0, 3.0, mat(x), mat(y), false, 1e-12, 40, max_index_plus_one(x)), w, 1);
            dlog << LINFO << trans(w);
            true_w = 0, 1, 0;
            dlog << LINFO << "error: "<< max(abs(w-true_w));
            DLIB_TEST(max(abs(w-true_w)) < 1e-10);

            print_spinner();


            // switching the labels should change which w weight goes negative.
            y.clear();
            y.push_back(-1);
            y.push_back(+1);


            solver(make_oca_problem_c_svm<w_type>(2.0, 3.0, mat(x), mat(y), false, 1e-12, 40, max_index_plus_one(x)), w, 0);
            dlog << LINFO << trans(w);
            true_w = 0.5, -0.5, 0;
            dlog << LINFO << "error: "<< max(abs(w-true_w));
            DLIB_TEST(max(abs(w-true_w)) < 1e-10);

            print_spinner();

            solver(make_oca_problem_c_svm<w_type>(2.0, 3.0, mat(x), mat(y), false, 1e-12, 40, max_index_plus_one(x)), w, 1);
            dlog << LINFO << trans(w);
            true_w = 0.5, -0.5, 0;
            dlog << LINFO << "error: "<< max(abs(w-true_w));
            DLIB_TEST(max(abs(w-true_w)) < 1e-10);

            print_spinner();

            solver(make_oca_problem_c_svm<w_type>(2.0, 3.0, mat(x), mat(y), false, 1e-12, 40, max_index_plus_one(x)), w, 2);
            dlog << LINFO << trans(w);
            true_w = 1, 0, 0;
            dlog << LINFO << "error: "<< max(abs(w-true_w));
            DLIB_TEST(max(abs(w-true_w)) < 1e-10);

            print_spinner();

            solver(make_oca_problem_c_svm<w_type>(2.0, 3.0, mat(x), mat(y), false, 1e-12, 40, max_index_plus_one(x)), w, 5);
            dlog << LINFO << trans(w);
            true_w = 1, 0, 0;
            dlog << LINFO << "error: "<< max(abs(w-true_w));
            DLIB_TEST(max(abs(w-true_w)) < 1e-10);

            df = trainer.train(x,y);
            w = join_cols(df.basis_vectors(0), uniform_matrix<double>(1,1,-df.b));
            true_w = 1, 0, 0;
            dlog << LINFO << "error: "<< max(abs(w-true_w));
            DLIB_TEST(max(abs(w-true_w)) < 1e-10);



            x.clear();
            y.clear();
            temp = -2, 2;
            x.push_back(temp);
            temp = 0, -0;
            x.push_back(temp);

            y.push_back(+1);
            y.push_back(-1);

            trainer.set_c(10);
            df = trainer.train(x,y);
            w = join_cols(df.basis_vectors(0), uniform_matrix<double>(1,1,-df.b));
            true_w = 0, 1, -1;
            dlog << LINFO << "w: " << trans(w);
            dlog << LINFO << "error: "<< max(abs(w-true_w));
            DLIB_TEST(max(abs(w-true_w)) < 1e-10);


            x.clear();
            y.clear();
            temp = -2, 2;
            x.push_back(temp);
            temp = 0, -0;
            x.push_back(temp);

            y.push_back(-1);
            y.push_back(+1);

            trainer.set_c(10);
            df = trainer.train(x,y);
            w = join_cols(df.basis_vectors(0), uniform_matrix<double>(1,1,-df.b));
            true_w = 1, 0, 1;
            dlog << LINFO << "w: " << trans(w);
            dlog << LINFO << "error: "<< max(abs(w-true_w));
            DLIB_TEST(max(abs(w-true_w)) < 1e-10);

        }

    } a;

}



