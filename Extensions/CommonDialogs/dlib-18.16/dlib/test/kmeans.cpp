// Copyright (C) 2011  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.

#include <sstream>
#include <string>
#include <cstdlib>
#include <ctime>
#include <dlib/svm.h>
#include <dlib/matrix.h>

#include "tester.h"

namespace  
{
    using namespace test;
    using namespace dlib;
    using namespace std;

    logger dlog("test.kmeans");

    dlib::rand rnd;

    template <typename sample_type>
    void run_test(
        const std::vector<sample_type>& seed_centers
    )
    {
        print_spinner();


        sample_type samp;

        std::vector<sample_type> samples;


        for (unsigned long j = 0; j < seed_centers.size(); ++j)
        {
            for (int i = 0; i < 250; ++i)
            {
                samp = randm(seed_centers[0].size(),1,rnd) - 0.5;
                samples.push_back(samp + seed_centers[j]);
            }
        }

        randomize_samples(samples);

        std::vector<sample_type> centers;
        pick_initial_centers(seed_centers.size(), centers, samples, linear_kernel<sample_type>());

        find_clusters_using_kmeans(samples, centers);

        DLIB_TEST(centers.size() == seed_centers.size());

        std::vector<int> hits(centers.size(),0);
        for (unsigned long i = 0; i < samples.size(); ++i)
        {
            unsigned long best_idx = 0;
            double best_dist = 1e100;
            for (unsigned long j = 0; j < centers.size(); ++j)
            {
                if (length(samples[i] - centers[j]) < best_dist)
                {
                    best_dist = length(samples[i] - centers[j]);
                    best_idx = j;
                }
            }
            hits[best_idx]++;
        }

        for (unsigned long i = 0; i < hits.size(); ++i)
        {
            DLIB_TEST(hits[i] == 250);
        }
    }


    class test_kmeans : public tester
    {
    public:
        test_kmeans (
        ) :
            tester ("test_kmeans",
                    "Runs tests on the find_clusters_using_kmeans() function.")
        {}

        void perform_test (
        )
        {
            {
                dlog << LINFO << "test dlib::vector<double,2>";
                typedef dlib::vector<double,2> sample_type;
                std::vector<sample_type> seed_centers;
                seed_centers.push_back(sample_type(10,10));
                seed_centers.push_back(sample_type(10,-10));
                seed_centers.push_back(sample_type(-10,10));
                seed_centers.push_back(sample_type(-10,-10));

                run_test(seed_centers);
            }
            {
                dlog << LINFO << "test dlib::vector<double,2>";
                typedef dlib::vector<float,2> sample_type;
                std::vector<sample_type> seed_centers;
                seed_centers.push_back(sample_type(10,10));
                seed_centers.push_back(sample_type(10,-10));
                seed_centers.push_back(sample_type(-10,10));
                seed_centers.push_back(sample_type(-10,-10));

                run_test(seed_centers);
            }
            {
                dlog << LINFO << "test dlib::matrix<double,3,1>";
                typedef dlib::matrix<double,3,1> sample_type;
                std::vector<sample_type> seed_centers;
                sample_type samp;
                samp = 10,10,0; seed_centers.push_back(samp);
                samp = -10,10,1; seed_centers.push_back(samp);
                samp = -10,-10,2; seed_centers.push_back(samp);

                run_test(seed_centers);
            }


        }
    } a;



}



