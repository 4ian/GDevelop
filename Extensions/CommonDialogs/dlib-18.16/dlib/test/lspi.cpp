// Copyright (C) 2015  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.

#include "tester.h"
#include <dlib/control.h>
#include <vector>
#include <sstream>
#include <ctime>

namespace  
{
    using namespace test;
    using namespace dlib;
    using namespace std;
    dlib::logger dlog("test.lspi");

    template <bool have_prior>
    struct chain_model
    {
        typedef int state_type;
        typedef int action_type; // 0 is move left, 1 is move right
        const static bool force_last_weight_to_1 = have_prior;


        const static int num_states = 4; // not required in the model interface

        matrix<double,8,1> offset;
        chain_model()
        {
            offset = 
                2.048 ,
                2.56 ,
                2.048 ,
                3.2 ,
                2.56 ,
                4 ,
                3.2, 
                5 ;
            if (!have_prior)
                offset = 0;

        }

        unsigned long num_features(
        ) const 
        {
            if (have_prior)
                return num_states*2 + 1; 
            else
                return num_states*2; 
        }

        action_type find_best_action (
            const state_type& state,
            const matrix<double,0,1>& w
        ) const
        {
            if (w(state*2)+offset(state*2) >= w(state*2+1)+offset(state*2+1))
                //if (w(state*2) >= w(state*2+1))
                return 0;
            else
                return 1;
        }

        void get_features (
            const state_type& state,
            const action_type& action,
            matrix<double,0,1>& feats
        ) const
        {
            feats.set_size(num_features());
            feats = 0;
            feats(state*2 + action) = 1;
            if (have_prior)
                feats(num_features()-1) = offset(state*2+action);
        }

    };

    void test_lspi_prior1()
    {
        print_spinner();
        typedef process_sample<chain_model<true> > sample_type;
        std::vector<sample_type> samples;

        samples.push_back(sample_type(0,0,0,0));
        samples.push_back(sample_type(0,1,1,0));

        samples.push_back(sample_type(1,0,0,0));
        samples.push_back(sample_type(1,1,2,0));

        samples.push_back(sample_type(2,0,1,0));
        samples.push_back(sample_type(2,1,3,0));

        samples.push_back(sample_type(3,0,2,0));
        samples.push_back(sample_type(3,1,3,1));


        lspi<chain_model<true> > trainer;
        //trainer.be_verbose();
        trainer.set_lambda(0);
        policy<chain_model<true> > pol = trainer.train(samples);

        dlog << LINFO << pol.get_weights();

        matrix<double,0,1> w = pol.get_weights();
        DLIB_TEST(pol.get_weights().size() == 9);
        DLIB_TEST(w(w.size()-1) == 1);
        w(w.size()-1) = 0;
        DLIB_TEST_MSG(length(w) < 1e-12, length(w));

        dlog << LINFO << "action: " << pol(0);
        dlog << LINFO << "action: " << pol(1);
        dlog << LINFO << "action: " << pol(2);
        dlog << LINFO << "action: " << pol(3);
        DLIB_TEST(pol(0) == 1);
        DLIB_TEST(pol(1) == 1);
        DLIB_TEST(pol(2) == 1);
        DLIB_TEST(pol(3) == 1);
    }

    void test_lspi_prior2()
    {
        print_spinner();
        typedef process_sample<chain_model<true> > sample_type;
        std::vector<sample_type> samples;

        samples.push_back(sample_type(0,0,0,0));
        samples.push_back(sample_type(0,1,1,0));

        samples.push_back(sample_type(1,0,0,0));
        samples.push_back(sample_type(1,1,2,0));

        samples.push_back(sample_type(2,0,1,0));
        samples.push_back(sample_type(2,1,3,1));

        samples.push_back(sample_type(3,0,2,0));
        samples.push_back(sample_type(3,1,3,0));


        lspi<chain_model<true> > trainer;
        //trainer.be_verbose();
        trainer.set_lambda(0);
        policy<chain_model<true> > pol = trainer.train(samples);


        dlog << LINFO << "action: " << pol(0);
        dlog << LINFO << "action: " << pol(1);
        dlog << LINFO << "action: " << pol(2);
        dlog << LINFO << "action: " << pol(3);
        DLIB_TEST(pol(0) == 1);
        DLIB_TEST(pol(1) == 1);
        DLIB_TEST(pol(2) == 1);
        DLIB_TEST(pol(3) == 0);
    }

    void test_lspi_noprior1()
    {
        print_spinner();
        typedef process_sample<chain_model<false> > sample_type;
        std::vector<sample_type> samples;

        samples.push_back(sample_type(0,0,0,0));
        samples.push_back(sample_type(0,1,1,0));

        samples.push_back(sample_type(1,0,0,0));
        samples.push_back(sample_type(1,1,2,0));

        samples.push_back(sample_type(2,0,1,0));
        samples.push_back(sample_type(2,1,3,0));

        samples.push_back(sample_type(3,0,2,0));
        samples.push_back(sample_type(3,1,3,1));


        lspi<chain_model<false> > trainer;
        //trainer.be_verbose();
        trainer.set_lambda(0.01);
        policy<chain_model<false> > pol = trainer.train(samples);

        dlog << LINFO << pol.get_weights();
        DLIB_TEST(pol.get_weights().size() == 8);


        dlog << LINFO << "action: " << pol(0);
        dlog << LINFO << "action: " << pol(1);
        dlog << LINFO << "action: " << pol(2);
        dlog << LINFO << "action: " << pol(3);
        DLIB_TEST(pol(0) == 1);
        DLIB_TEST(pol(1) == 1);
        DLIB_TEST(pol(2) == 1);
        DLIB_TEST(pol(3) == 1);
    }
    void test_lspi_noprior2()
    {
        print_spinner();
        typedef process_sample<chain_model<false> > sample_type;
        std::vector<sample_type> samples;

        samples.push_back(sample_type(0,0,0,0));
        samples.push_back(sample_type(0,1,1,0));

        samples.push_back(sample_type(1,0,0,0));
        samples.push_back(sample_type(1,1,2,1));

        samples.push_back(sample_type(2,0,1,0));
        samples.push_back(sample_type(2,1,3,0));

        samples.push_back(sample_type(3,0,2,0));
        samples.push_back(sample_type(3,1,3,0));


        lspi<chain_model<false> > trainer;
        //trainer.be_verbose();
        trainer.set_lambda(0.01);
        policy<chain_model<false> > pol = trainer.train(samples);

        dlog << LINFO << pol.get_weights();
        DLIB_TEST(pol.get_weights().size() == 8);


        dlog << LINFO << "action: " << pol(0);
        dlog << LINFO << "action: " << pol(1);
        dlog << LINFO << "action: " << pol(2);
        dlog << LINFO << "action: " << pol(3);
        DLIB_TEST(pol(0) == 1);
        DLIB_TEST(pol(1) == 1);
        DLIB_TEST(pol(2) == 0);
        DLIB_TEST(pol(3) == 0);
    }

    class lspi_tester : public tester
    {
    public:
        lspi_tester (
        ) :
            tester (
                "test_lspi",       // the command line argument name for this test
                "Run tests on the lspi object.", // the command line argument description
                0                     // the number of command line arguments for this test
            )
        {
        }

        void perform_test (
        )
        {
            test_lspi_prior1();
            test_lspi_prior2();

            test_lspi_noprior1();
            test_lspi_noprior2();
        }
    };

    lspi_tester a;
}

