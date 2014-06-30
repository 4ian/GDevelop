// Copyright (C) 2012  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.


#include <dlib/filtering.h>
#include <sstream>
#include <string>
#include <cstdlib>
#include <ctime>
#include <dlib/matrix.h>
#include <dlib/rand.h>

#include "tester.h"

namespace  
{

    using namespace test;
    using namespace dlib;
    using namespace std;

    logger dlog("test.filtering");

// ----------------------------------------------------------------------------------------

    template <typename filter_type>
    double test_filter (
        filter_type kf,
        int size
    )
    {
        // This test has a point moving in a circle around the origin.  The point
        // also gets a random bump in a random direction at each time step.

        running_stats<double> rs;

        dlib::rand rnd;
        int count = 0;
        const dlib::vector<double,3> z(0,0,1);
        dlib::vector<double,2> p(10,10), temp;
        for (int i = 0; i < size; ++i)
        {
            // move the point around in a circle
            p += z.cross(p).normalize()/0.5;
            // randomly drop measurements
            if (rnd.get_random_double() < 0.7 || count < 4)
            {
                // make a random bump
                dlib::vector<double,2> pp(rnd.get_random_gaussian()/3,
                                          rnd.get_random_gaussian()/3);
                ++count;
                kf.update(p+pp);
            }
            else
            {
                kf.update();
                dlog << LTRACE << "MISSED MEASUREMENT";
            }
            // figure out the next position
            temp = (p+z.cross(p).normalize()/0.5);
            const double error = length(temp - rowm(kf.get_predicted_next_state(),range(0,1)));
            rs.add(error);

            dlog << LTRACE << temp << "("<< error << "): " << trans(kf.get_predicted_next_state());

            // test the serialization a few times.
            if (count < 10)
            {
                ostringstream sout;
                serialize(kf, sout);
                istringstream sin(sout.str());
                filter_type temp;
                deserialize(temp, sin);
                kf = temp;
            }
        }


        return rs.mean();

    }

// ----------------------------------------------------------------------------------------

    void test_kalman_filter()
    {
        matrix<double,2,2> R;
        R = 0.3, 0,
        0,  0.3;

        // the variables in the state are 
        // x,y, x velocity, y velocity, x acceleration, and y acceleration
        matrix<double,6,6> A;
        A = 1, 0, 1, 0, 0, 0,
        0, 1, 0, 1, 0, 0,
        0, 0, 1, 0, 1, 0,
        0, 0, 0, 1, 0, 1,
        0, 0, 0, 0, 1, 0,
        0, 0, 0, 0, 0, 1;

        // the measurements only tell us the positions
        matrix<double,2,6> H;
        H = 1, 0, 0, 0, 0, 0,
        0, 1, 0, 0, 0, 0;


        kalman_filter<6,2> kf; 
        kf.set_measurement_noise(R);  
        matrix<double> pn = 0.01*identity_matrix<double,6>();
        kf.set_process_noise(pn);
        kf.set_observation_model(H);
        kf.set_transition_model(A);

        DLIB_TEST(equal(kf.get_observation_model() , H));
        DLIB_TEST(equal(kf.get_transition_model() , A));
        DLIB_TEST(equal(kf.get_measurement_noise() , R));
        DLIB_TEST(equal(kf.get_process_noise() , pn));
        DLIB_TEST(equal(kf.get_current_estimation_error_covariance() , identity_matrix(pn)));

        double kf_error = test_filter(kf, 300);

        dlog << LINFO << "kf error: "<< kf_error;
        DLIB_TEST_MSG(kf_error < 0.75, kf_error);
    }

// ----------------------------------------------------------------------------------------

    void test_rls_filter()
    {

        rls_filter rls(10, 0.99, 0.1);

        DLIB_TEST(rls.get_window_size() == 10);
        DLIB_TEST(rls.get_forget_factor() == 0.99);
        DLIB_TEST(rls.get_c() == 0.1);

        double rls_error = test_filter(rls, 300);

        dlog << LINFO << "rls error: "<< rls_error;
        DLIB_TEST_MSG(rls_error < 0.75, rls_error);
    }

// ----------------------------------------------------------------------------------------

    class filtering_tester : public tester
    {
    public:
        filtering_tester (
        ) :
            tester ("test_filtering",
                    "Runs tests on the filtering stuff (rls and kalman filters).")
        {}

        void perform_test (
        )
        {
            test_rls_filter();
            test_kalman_filter();
        }
    } a;

}


