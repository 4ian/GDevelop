// Copyright (C) 2010  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.


#include <sstream>
#include <string>
#include <cstdlib>
#include <ctime>
#include <dlib/statistics.h>
#include <dlib/rand.h>
#include <dlib/svm.h>
#include <algorithm>

#include "tester.h"

namespace  
{

    using namespace test;
    using namespace dlib;
    using namespace std;

    logger dlog("test.statistics");



    class statistics_tester : public tester
    {
    public:
        statistics_tester (
        ) :
            tester ("test_statistics",
                    "Runs tests on the statistics component.")
        {}

        void test_random_subset_selector ()
        {
            random_subset_selector<double> rand_set;

            for (int j = 0; j < 30; ++j)
            {
                print_spinner();

                running_stats<double> rs, rs2;

                rand_set.set_max_size(1000);

                for (double i = 0; i < 100000; ++i)
                {
                    rs.add(i);
                    rand_set.add(i);
                }


                for (unsigned long i = 0; i < rand_set.size(); ++i)
                    rs2.add(rand_set[i]);


                dlog << LDEBUG << "true mean:    " << rs.mean();
                dlog << LDEBUG << "true sampled: " << rs2.mean();
                double ratio = rs.mean()/rs2.mean();
                DLIB_TEST_MSG(0.96 < ratio  && ratio < 1.04, " ratio: " << ratio);
            }


            {
                random_subset_selector<int> r1, r2;
                r1.set_max_size(300);
                for (int i = 0; i < 4000; ++i)
                    r1.add(i);

                ostringstream sout;
                serialize(r1, sout);
                istringstream sin(sout.str());
                deserialize(r2, sin);

                DLIB_TEST(r1.size() == r2.size());
                DLIB_TEST(r1.max_size() == r2.max_size());
                DLIB_TEST(r1.next_add_accepts() == r2.next_add_accepts());
                DLIB_TEST(std::equal(r1.begin(), r1.end(), r2.begin()));

                for (int i = 0; i < 4000; ++i)
                {
                    r1.add(i);
                    r2.add(i);
                }

                DLIB_TEST(r1.size() == r2.size());
                DLIB_TEST(r1.max_size() == r2.max_size());
                DLIB_TEST(r1.next_add_accepts() == r2.next_add_accepts());
                DLIB_TEST(std::equal(r1.begin(), r1.end(), r2.begin()));
            }
        }

        void test_random_subset_selector2 ()
        {
            random_subset_selector<double> rand_set;
            DLIB_TEST(rand_set.next_add_accepts() == false);
            DLIB_TEST(rand_set.size() == 0);
            DLIB_TEST(rand_set.max_size() == 0);

            for (int j = 0; j < 30; ++j)
            {
                print_spinner();

                running_stats<double> rs, rs2;

                rand_set.set_max_size(1000);
                DLIB_TEST(rand_set.next_add_accepts() == true);

                for (double i = 0; i < 100000; ++i)
                {
                    rs.add(i);
                    if (rand_set.next_add_accepts())
                        rand_set.add(i);
                    else
                        rand_set.add();
                }

                DLIB_TEST(rand_set.size() == 1000);
                DLIB_TEST(rand_set.max_size() == 1000);

                for (unsigned long i = 0; i < rand_set.size(); ++i)
                    rs2.add(rand_set[i]);


                dlog << LDEBUG << "true mean:    " << rs.mean();
                dlog << LDEBUG << "true sampled: " << rs2.mean();
                double ratio = rs.mean()/rs2.mean();
                DLIB_TEST_MSG(0.96 < ratio  && ratio < 1.04, " ratio: " << ratio);
            }
        }

        void test_running_covariance (
        )
        {
            dlib::rand rnd;
            std::vector<matrix<double,0,1> > vects;

            running_covariance<matrix<double,0,1> > cov, cov2;
            DLIB_TEST(cov.in_vector_size() == 0);

            for (unsigned long dims = 1; dims < 5; ++dims)
            {
                for (unsigned long samps = 2; samps < 10; ++samps)
                {
                    vects.clear();
                    cov.clear();
                    DLIB_TEST(cov.in_vector_size() == 0);
                    for (unsigned long i = 0; i < samps; ++i)
                    {
                        vects.push_back(randm(dims,1,rnd));
                        cov.add(vects.back());

                    }
                    DLIB_TEST(cov.in_vector_size() == (long)dims);

                    DLIB_TEST(equal(mean(vector_to_matrix(vects)), cov.mean()));
                    DLIB_TEST_MSG(equal(covariance(vector_to_matrix(vects)), cov.covariance()),
                              max(abs(covariance(vector_to_matrix(vects)) - cov.covariance()))
                              << "   dims = " << dims << "   samps = " << samps
                              );
                }
            }

            for (unsigned long dims = 1; dims < 5; ++dims)
            {
                for (unsigned long samps = 2; samps < 10; ++samps)
                {
                    vects.clear();
                    cov.clear();
                    cov2.clear();
                    DLIB_TEST(cov.in_vector_size() == 0);
                    for (unsigned long i = 0; i < samps; ++i)
                    {
                        vects.push_back(randm(dims,1,rnd));
                        if ((i%2) == 0)
                            cov.add(vects.back());
                        else
                            cov2.add(vects.back());

                    }
                    DLIB_TEST((cov+cov2).in_vector_size() == (long)dims);

                    DLIB_TEST(equal(mean(vector_to_matrix(vects)), (cov+cov2).mean()));
                    DLIB_TEST_MSG(equal(covariance(vector_to_matrix(vects)), (cov+cov2).covariance()),
                              max(abs(covariance(vector_to_matrix(vects)) - (cov+cov2).covariance()))
                              << "   dims = " << dims << "   samps = " << samps
                              );
                }
            }

        }

        void test_running_stats()
        {
            print_spinner();

            running_stats<double> rs, rs2;

            running_scalar_covariance<double> rsc1, rsc2;

            for (double i = 0; i < 100; ++i)
            {
                rs.add(i);

                rsc1.add(i,i);
                rsc2.add(i,i);
                rsc2.add(i,-i);
            }

            // make sure the running_stats and running_scalar_covariance agree
            DLIB_TEST_MSG(std::abs(rs.mean() - rsc1.mean_x()) < 1e-10, std::abs(rs.mean() - rsc1.mean_x()));
            DLIB_TEST(std::abs(rs.mean() - rsc1.mean_y()) < 1e-10);
            DLIB_TEST(std::abs(rs.stddev() - rsc1.stddev_x()) < 1e-10);
            DLIB_TEST(std::abs(rs.stddev() - rsc1.stddev_y()) < 1e-10);
            DLIB_TEST(std::abs(rs.variance() - rsc1.variance_x()) < 1e-10);
            DLIB_TEST(std::abs(rs.variance() - rsc1.variance_y()) < 1e-10);
            DLIB_TEST(rs.current_n() == rsc1.current_n());

            DLIB_TEST(std::abs(rsc1.correlation() - 1) < 1e-10);
            DLIB_TEST(std::abs(rsc2.correlation() - 0) < 1e-10);



            // test serialization of running_stats
            ostringstream sout;
            serialize(rs, sout);
            istringstream sin(sout.str());
            deserialize(rs2, sin);
            // make sure the running_stats and running_scalar_covariance agree
            DLIB_TEST_MSG(std::abs(rs2.mean() - rsc1.mean_x()) < 1e-10, std::abs(rs2.mean() - rsc1.mean_x()));
            DLIB_TEST(std::abs(rs2.mean() - rsc1.mean_y()) < 1e-10);
            DLIB_TEST(std::abs(rs2.stddev() - rsc1.stddev_x()) < 1e-10);
            DLIB_TEST(std::abs(rs2.stddev() - rsc1.stddev_y()) < 1e-10);
            DLIB_TEST(std::abs(rs2.variance() - rsc1.variance_x()) < 1e-10);
            DLIB_TEST(std::abs(rs2.variance() - rsc1.variance_y()) < 1e-10);
            DLIB_TEST(rs2.current_n() == rsc1.current_n());

        }

        void test_randomize_samples()
        {
            std::vector<unsigned int> t(15),u(15),v(15);

            for (unsigned long i = 0; i < t.size(); ++i)
            {
                t[i] = i;
                u[i] = i+1;
                v[i] = i+2;
            }
            randomize_samples(t,u,v);

            DLIB_TEST(t.size() == 15);
            DLIB_TEST(u.size() == 15);
            DLIB_TEST(v.size() == 15);

            for (unsigned long i = 0; i < t.size(); ++i)
            {
                const unsigned long val = t[i];
                DLIB_TEST(u[i] == val+1);
                DLIB_TEST(v[i] == val+2);
            }
        }
        void test_randomize_samples2()
        {
            dlib::matrix<int,15,1> t(15),u(15),v(15);

            for (long i = 0; i < t.size(); ++i)
            {
                t(i) = i;
                u(i) = i+1;
                v(i) = i+2;
            }
            randomize_samples(t,u,v);

            DLIB_TEST(t.size() == 15);
            DLIB_TEST(u.size() == 15);
            DLIB_TEST(v.size() == 15);

            for (long i = 0; i < t.size(); ++i)
            {
                const long val = t(i);
                DLIB_TEST(u(i) == val+1);
                DLIB_TEST(v(i) == val+2);
            }
        }

        void another_test()
        {
            std::vector<double> a;

            running_stats<double> rs1, rs2;

            for (int i = 0; i < 10; ++i)
            {
                rs1.add(i);
                a.push_back(i);
            }

            DLIB_TEST(std::abs(variance(vector_to_matrix(a)) - rs1.variance()) < 1e-13);
            DLIB_TEST(std::abs(stddev(vector_to_matrix(a)) - rs1.stddev()) < 1e-13);
            DLIB_TEST(std::abs(mean(vector_to_matrix(a)) - rs1.mean()) < 1e-13);

            for (int i = 10; i < 20; ++i)
            {
                rs2.add(i);
                a.push_back(i);
            }

            DLIB_TEST(std::abs(variance(vector_to_matrix(a)) - (rs1+rs2).variance()) < 1e-13);
            DLIB_TEST(std::abs(mean(vector_to_matrix(a)) - (rs1+rs2).mean()) < 1e-13);
            DLIB_TEST((rs1+rs2).current_n() == 20);

            running_scalar_covariance<double> rc1, rc2, rc3;
            dlib::rand rnd;
            for (double i = 0; i < 10; ++i)
            {
                const double a = i + rnd.get_random_gaussian();
                const double b = i + rnd.get_random_gaussian();
                rc1.add(a,b);
                rc3.add(a,b);
            }
            for (double i = 11; i < 20; ++i)
            {
                const double a = i + rnd.get_random_gaussian();
                const double b = i + rnd.get_random_gaussian();
                rc2.add(a,b);
                rc3.add(a,b);
            }

            DLIB_TEST(std::abs((rc1+rc2).mean_x() - rc3.mean_x()) < 1e-13);
            DLIB_TEST(std::abs((rc1+rc2).mean_y() - rc3.mean_y()) < 1e-13);
            DLIB_TEST_MSG(std::abs((rc1+rc2).variance_x() - rc3.variance_x()) < 1e-13, std::abs((rc1+rc2).variance_x() - rc3.variance_x()));
            DLIB_TEST(std::abs((rc1+rc2).variance_y() - rc3.variance_y()) < 1e-13);
            DLIB_TEST(std::abs((rc1+rc2).covariance() - rc3.covariance()) < 1e-13);
            DLIB_TEST((rc1+rc2).current_n() == rc3.current_n());

            rs1.set_max_n(50);
            DLIB_TEST(rs1.max_n() == 50);
        }

        void perform_test (
        )
        {
            test_random_subset_selector();
            test_random_subset_selector2();
            test_running_covariance();
            test_running_stats();
            test_randomize_samples();
            test_randomize_samples2();
            another_test();
        }
    } a;

}


