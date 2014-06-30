// Copyright (C) 2011  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.


#include <dlib/matrix.h>
#include <sstream>
#include <string>
#include <cstdlib>
#include <ctime>
#include <vector>
#include "../stl_checked.h"
#include "../array.h"
#include "../rand.h"
#include "checkerboard.h"
#include <dlib/statistics.h>

#include "tester.h"
#include <dlib/svm_threaded.h>


namespace  
{

    using namespace test;
    using namespace dlib;
    using namespace std;

    logger dlog("test.probabilistic");

// ----------------------------------------------------------------------------------------

    class test_probabilistic : public tester
    {
    public:
        test_probabilistic (
        ) :
            tester ("test_probabilistic",
                    "Runs tests on the probabilistic trainer adapter.")
        {}

        void perform_test (
        )
        {
            print_spinner();


            typedef double scalar_type;
            typedef matrix<scalar_type,2,1> sample_type;

            std::vector<sample_type> x;
            std::vector<matrix<double,0,1> > x_linearized;
            std::vector<scalar_type> y;

            get_checkerboard_problem(x,y, 1000, 2);

            random_subset_selector<sample_type> rx;
            random_subset_selector<scalar_type> ry;
            rx.set_max_size(x.size());
            ry.set_max_size(x.size());

            dlog << LINFO << "pos labels: "<< sum(vector_to_matrix(y) == +1);
            dlog << LINFO << "neg labels: "<< sum(vector_to_matrix(y) == -1);

            for (unsigned long i = 0; i < x.size(); ++i)
            {
                rx.add(x[i]);
                ry.add(y[i]);
            }

            const scalar_type gamma = 2.0;

            typedef radial_basis_kernel<sample_type> kernel_type;

            krr_trainer<kernel_type> krr_trainer;
            krr_trainer.use_classification_loss_for_loo_cv();
            krr_trainer.set_kernel(kernel_type(gamma));
            krr_trainer.set_basis(randomly_subsample(x, 100));
            probabilistic_decision_function<kernel_type> df;

            dlog << LINFO << "cross validation: " << cross_validate_trainer(krr_trainer, rx,ry, 4);
            print_spinner();

            running_stats<scalar_type> rs_pos, rs_neg;

            print_spinner();
            df = probabilistic(krr_trainer,3).train(x, y);
            for (unsigned long i = 0; i < x.size(); ++i)
            {
                if (y[i] > 0)
                    rs_pos.add(df(x[i]));
                else
                    rs_neg.add(df(x[i]));
            }
            dlog << LINFO << "rs_pos.mean(): "<< rs_pos.mean();
            dlog << LINFO << "rs_neg.mean(): "<< rs_neg.mean();
            DLIB_TEST_MSG(rs_pos.mean() > 0.95, rs_pos.mean());
            DLIB_TEST_MSG(rs_neg.mean() < 0.05, rs_neg.mean());
            rs_pos.clear();
            rs_neg.clear();


            print_spinner();
            df = probabilistic(krr_trainer,3).train(rx, ry);
            for (unsigned long i = 0; i < x.size(); ++i)
            {
                if (y[i] > 0)
                    rs_pos.add(df(x[i]));
                else
                    rs_neg.add(df(x[i]));
            }
            dlog << LINFO << "rs_pos.mean(): "<< rs_pos.mean();
            dlog << LINFO << "rs_neg.mean(): "<< rs_neg.mean();
            DLIB_TEST_MSG(rs_pos.mean() > 0.95, rs_pos.mean());
            DLIB_TEST_MSG(rs_neg.mean() < 0.05, rs_neg.mean());
            rs_pos.clear();
            rs_neg.clear();

        }
    } a;

}


