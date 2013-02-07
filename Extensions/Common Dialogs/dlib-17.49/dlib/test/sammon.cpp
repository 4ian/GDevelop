// Copyright (C) 2012  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.


#include <sstream>
#include <string>
#include <cstdlib>
#include <ctime>
#include <cmath>
#include <dlib/statistics.h>

#include "tester.h"

namespace  
{

    using namespace test;
    using namespace dlib;
    using namespace std;

    logger dlog("test.sammon");


    std::vector<matrix<double,4,1> > make_test_data4(
    )
    {
        std::vector<matrix<double,4,1> > data;

        matrix<double,4,1> m;

        m = 0,0,0, 0; data.push_back(m);
        m = 1,0,0, 0; data.push_back(m);
        m = 0,1,0, 0; data.push_back(m);
        m = 0,0,1, 0; data.push_back(m);

        return data;
    }

    std::vector<matrix<double,3,1> > make_test_data3(
    )
    {
        std::vector<matrix<double,3,1> > data;

        matrix<double,3,1> m;

        m = 0,0,0; data.push_back(m);
        m = 1,0,0; data.push_back(m);
        m = 0,1,0; data.push_back(m);
        m = 0,0,1; data.push_back(m);

        return data;
    }

    std::vector<matrix<double> > make_test_data3d(
    )
    {
        std::vector<matrix<double> > data;

        matrix<double,3,1> m;

        m = 0,0,0; data.push_back(m);
        m = 1,0,0; data.push_back(m);
        m = 0,1,0; data.push_back(m);
        m = 0,0,1; data.push_back(m);

        return data;
    }


    void runtest()
    {
        sammon_projection s;
        std::vector<matrix<double, 0, 1> >  projs = s(make_test_data3(),2);
        running_stats<double> rs1, rs2;

        rs1.add(length(projs[0] - projs[1]));
        rs1.add(length(projs[0] - projs[2]));
        rs1.add(length(projs[0] - projs[3]));

        rs2.add(length(projs[1] - projs[2]));
        rs2.add(length(projs[2] - projs[3]));
        rs2.add(length(projs[3] - projs[1]));

        DLIB_TEST(rs1.stddev()/rs1.mean() < 1e-4);
        DLIB_TEST(rs2.stddev()/rs2.mean() < 1e-4);



        projs = s(make_test_data4(),2);
        rs1.clear();
        rs2.clear();

        rs1.add(length(projs[0] - projs[1]));
        rs1.add(length(projs[0] - projs[2]));
        rs1.add(length(projs[0] - projs[3]));

        rs2.add(length(projs[1] - projs[2]));
        rs2.add(length(projs[2] - projs[3]));
        rs2.add(length(projs[3] - projs[1]));

        DLIB_TEST(rs1.stddev()/rs1.mean() < 1e-4);
        DLIB_TEST(rs2.stddev()/rs2.mean() < 1e-4);

        projs = s(make_test_data3d(),2);
        rs1.clear();
        rs2.clear();

        rs1.add(length(projs[0] - projs[1]));
        rs1.add(length(projs[0] - projs[2]));
        rs1.add(length(projs[0] - projs[3]));

        rs2.add(length(projs[1] - projs[2]));
        rs2.add(length(projs[2] - projs[3]));
        rs2.add(length(projs[3] - projs[1]));

        DLIB_TEST(rs1.stddev()/rs1.mean() < 1e-4);
        DLIB_TEST(rs2.stddev()/rs2.mean() < 1e-4);
    }

    void runtest2()
    {
        sammon_projection s;
        std::vector<matrix<double, 0, 1> >  projs, temp;

        DLIB_TEST(s(projs,3).size() == 0);

        matrix<double,2,1> m;
        m = 1,2;
        projs.push_back(m);
        temp = s(projs,2);
        DLIB_TEST(temp.size() == 1);
        DLIB_TEST(temp[0].size() == 2);

        projs.push_back(m);
        temp = s(projs,1);
        DLIB_TEST(temp.size() == 2);
        DLIB_TEST(temp[0].size() == 1);
        DLIB_TEST(temp[1].size() == 1);
    }

    void runtest3(int num_dims)
    {
        sammon_projection s;
        std::vector<matrix<double, 0, 1> >  projs;
        matrix<double,3,1> m;
        m = 1, 1, 1;
        projs.push_back(m);

        m = 1, 2, 1;
        projs.push_back(m);

        m = 1, 3, 1;
        projs.push_back(m);

        projs = s(projs,num_dims);

        const double d1a = length(projs[0] - projs[1]);
        const double d1b = length(projs[1] - projs[2]);
        const double d2  = length(projs[0] - projs[2]);

        DLIB_TEST(std::abs(d1a-d1b)/d1a < 1e-8);
        DLIB_TEST(std::abs(d2/d1a-2) < 1e-8);
    }

    void runtest4(int num_dims)
    {
        sammon_projection s;
        std::vector<matrix<double, 0, 1> >  projs;
        matrix<double,3,1> m;
        m = 1, 1, 1;
        projs.push_back(m);

        m = 1, 2, 1;
        projs.push_back(m);


        projs = s(projs,num_dims);

        DLIB_TEST(length(projs[0] - projs[1]) > 1e-5); 
    }

    class sammon_tester : public tester
    {
    public:
        sammon_tester (
        ) :
            tester ("test_sammon",
                    "Runs tests on the sammon_projection component.")
        {}

        void perform_test (
        )
        {
            print_spinner();
            runtest();
            print_spinner();
            runtest2();
            print_spinner();
            runtest3(2);
            print_spinner();
            runtest4(2);
            runtest3(1);
            print_spinner();
            runtest4(1);
        }
    } a;

}



