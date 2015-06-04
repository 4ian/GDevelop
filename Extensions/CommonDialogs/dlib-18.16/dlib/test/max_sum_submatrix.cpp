// Copyright (C) 2011  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#include <sstream>
#include <string>
#include <cstdlib>
#include <ctime>
#include <dlib/optimization.h>
#include <dlib/rand.h>

#include "tester.h"

namespace  
{
    using namespace test;
    using namespace dlib;
    using namespace std;

    logger dlog("test.max_sum_submatrix");

// ----------------------------------------------------------------------------------------

    bool order_rects (
        const rectangle& a,
        const rectangle& b
    )
    {
        if (a.left() < b.left()) return true;
        else if (a.left() > b.left()) return false;

        if (a.right() < b.right()) return true;
        else if (a.right() > b.right()) return false;

        if (a.top() < b.top()) return true;
        else if (a.top() > b.top()) return false;

        if (a.bottom() < b.bottom()) return true;
        else if (a.bottom() > b.bottom()) return false;

        return false;
    }

    void run_test(
        const int num
    )
    {
        static dlib::rand rnd;

        matrix<int> mat, mask;

        mat.set_size(rnd.get_random_32bit_number()%1000 + 1,
                     rnd.get_random_32bit_number()%1000 + 1);
        mask.set_size(mat.nr(), mat.nc());
        mask = 0;

        mat = -10000;

        std::vector<rectangle> true_rects;

        for (int i = 0; i < num; ++i)
        {
            const int width = rnd.get_random_32bit_number()%100 + 1;
            const int height = rnd.get_random_32bit_number()%100 + 1;

            rectangle rect = centered_rect(rnd.get_random_16bit_number()%mat.nc(),
                                           rnd.get_random_16bit_number()%mat.nr(),
                                           width,height);
            rect = get_rect(mat).intersect(rect);

            // make sure this new rectangle doesn't overlap or abut any others
            if (sum(subm(mask,grow_rect(rect,1).intersect(get_rect(mask)))) == 0)
            {
                set_subm(mat, rect) = rnd.get_random_8bit_number()%100 + 1;
                set_subm(mask, rect) = 1;
                true_rects.push_back(rect);
            }
        }


        std::vector<rectangle> res;
        res = max_sum_submatrix(mat, true_rects.size()+10, 0);

        DLIB_TEST(res.size() == true_rects.size());

        // make sure big rectangles come first
        for (unsigned long i = 0; i+1 < res.size(); ++i)
        {
            DLIB_TEST(sum(subm(mat,res[i])) >= sum(subm(mat,res[i+1])));
        }

        // make sure rectangles match
        sort(true_rects.begin(), true_rects.end(), order_rects);
        sort(res.begin(), res.end(), order_rects);
        for (unsigned long i = 0; i < res.size(); ++i)
        {
            DLIB_TEST_MSG(res[i] == true_rects[i],
                          "i: " << i << "  res[i]: " << res[i] << "  true_rects[i]: " <<  true_rects[i]);
        }

    }

// ----------------------------------------------------------------------------------------

    template <typename T>
    void run_test2()
    {
        matrix<T> mat(100,100);
        mat = 1;
        std::vector<rectangle> res = max_sum_submatrix(mat, 0, 0);

        DLIB_TEST(res.size() == 0);
        res = max_sum_submatrix(mat, 1, 0);
        DLIB_TEST(res.size() == 1);
        DLIB_TEST(res[0] == get_rect(mat));
        res = max_sum_submatrix(mat, 3, 0);
        DLIB_TEST(res.size() == 1);
        DLIB_TEST(res[0] == get_rect(mat));
        res = max_sum_submatrix(mat, 3, 10);
        DLIB_TEST(res.size() == 1);
        DLIB_TEST(res[0] == get_rect(mat));

        res = max_sum_submatrix(mat, 3, mat.size());
        DLIB_TEST(res.size() == 0);

        mat = -1;
        res = max_sum_submatrix(mat, 1, 0);
        DLIB_TEST(res.size() == 0);

        const rectangle rect1 = rectangle(10,10,40,40);
        const rectangle rect2 = rectangle(35,35,80,80);

        set_subm(mat, rect1) = 2;
        set_subm(mat, rect2) = 1;
        res = max_sum_submatrix(mat, 3, 0);
        DLIB_TEST(res.size() == 2);
        DLIB_TEST(res[0] == rect2);
        DLIB_TEST(res[1] == rect1);

        res = max_sum_submatrix(mat, 3, 2*rect1.area() - 2*(rect1.intersect(rect2)).area());
        DLIB_TEST(res.size() == 1);
        DLIB_TEST(res[0] == rect2);
    }

// ----------------------------------------------------------------------------------------


    class test_max_sum_submatrix : public tester
    {
    public:
        test_max_sum_submatrix (
        ) :
            tester ("test_max_sum_submatrix",
                    "Runs tests on the max_sum_submatrix() function.")
        {}

        void perform_test (
        )
        {
            for (int j = 0; j < 5; ++j)
            {
                print_spinner();
                for (int i = 0; i < 40; ++i)
                    run_test(i);
            }

            run_test2<int>();
            run_test2<short>();
            run_test2<signed char>();
            run_test2<float>();
            run_test2<double>();
        }
    } a;

}




