// Copyright (C) 2011  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.


#include <dlib/optimization.h>
#include <sstream>
#include <string>
#include <cstdlib>
#include <ctime>
#include <vector>
#include "../rand.h"

#include "tester.h"


namespace  
{

    using namespace test;
    using namespace dlib;
    using namespace std;

    logger dlog("test.max_cost_assignment");

// ----------------------------------------------------------------------------------------

    std::vector<std::vector<long> > permutations (
        matrix<long,1,0> vals
    )
    {
        if (vals.size() == 0)
        {
            return std::vector<std::vector<long> >();
        }
        else if (vals.size() == 1)
        {
            return std::vector<std::vector<long> >(1,std::vector<long>(1,vals(0)));
        }


        std::vector<std::vector<long> > temp;


        for (long i = 0; i < vals.size(); ++i)
        {
            const std::vector<std::vector<long> >& res = permutations(remove_col(vals,i));       

            for (unsigned long j = 0; j < res.size(); ++j)
            {
                temp.resize(temp.size()+1);
                std::vector<long>& part = temp.back();
                part.push_back(vals(i));
                part.insert(part.end(), res[j].begin(), res[j].end());
            }
        }


        return temp;
    }

// ----------------------------------------------------------------------------------------

    template <typename T>
    std::vector<long> brute_force_max_cost_assignment (
        matrix<T> cost
    )
    {
        if (cost.size() == 0)
            return std::vector<long>();

        const std::vector<std::vector<long> >& perms = permutations(range(0,cost.nc()-1));

        T best_cost = std::numeric_limits<T>::min();
        unsigned long best_idx = 0;
        for (unsigned long i = 0; i < perms.size(); ++i)
        {
            const T temp = assignment_cost(cost, perms[i]);
            if (temp > best_cost)
            {
                best_idx = i;
                best_cost = temp;
            }
        }

        return perms[best_idx];
    }

// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------

    class test_max_cost_assignment : public tester
    {
    public:
        test_max_cost_assignment (
        ) :
            tester ("test_max_cost_assignment",
                    "Runs tests on the max_cost_assignment function.")
        {}

        dlib::rand rnd;

        template <typename T>
        void test_hungarian()
        {
            long size = rnd.get_random_32bit_number()%7;
            long range = rnd.get_random_32bit_number()%100;
            matrix<T> cost = matrix_cast<T>(randm(size,size,rnd)*range) - range/2;

            // use a uniform cost matrix sometimes
            if ((rnd.get_random_32bit_number()%100) == 0)
                cost = rnd.get_random_32bit_number()%100;

            // negate the cost matrix every now and then
            if ((rnd.get_random_32bit_number()%100) == 0)
                cost = -cost;


            std::vector<long> assign = brute_force_max_cost_assignment(cost);
            T true_eval = assignment_cost(cost, assign);
            assign = max_cost_assignment(cost);
            DLIB_TEST(assignment_cost(cost,assign) == true_eval);
            assign = max_cost_assignment(matrix_cast<char>(cost));
            DLIB_TEST(assignment_cost(cost,assign) == true_eval);


            cost = matrix_cast<T>(randm(size,size,rnd)*range);
            assign = brute_force_max_cost_assignment(cost);
            true_eval = assignment_cost(cost, assign);
            assign = max_cost_assignment(cost);
            DLIB_TEST(assignment_cost(cost,assign) == true_eval);
            assign = max_cost_assignment(matrix_cast<unsigned char>(cost));
            DLIB_TEST(assignment_cost(cost,assign) == true_eval);
            assign = max_cost_assignment(matrix_cast<typename unsigned_type<T>::type>(cost));
            DLIB_TEST(assignment_cost(cost,assign) == true_eval);
        }

        void perform_test (
        )
        {
            for (long i = 0; i < 1000; ++i)
            {
                if ((i%100) == 0)
                    print_spinner();

                test_hungarian<short>();
                test_hungarian<int>();
                test_hungarian<long>();
                test_hungarian<int64>();
            }
        }
    } a;

}



