// Copyright (C) 2011  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.


#include <sstream>
#include <string>
#include <cstdlib>
#include <ctime>
#include <dlib/disjoint_subsets.h>

#include "tester.h"

namespace  
{

    using namespace test;
    using namespace dlib;
    using namespace std;

    logger dlog("test.disjoint_subsets");

    void test_disjoint_subset()
    {
        print_spinner();
        disjoint_subsets s;

        DLIB_TEST(s.size() == 0);

        s.set_size(5);
        DLIB_TEST(s.size() == 5);

        DLIB_TEST(s.find_set(0) == 0);
        DLIB_TEST(s.find_set(1) == 1);
        DLIB_TEST(s.find_set(2) == 2);
        DLIB_TEST(s.find_set(3) == 3);
        DLIB_TEST(s.find_set(4) == 4);


        unsigned long id = s.merge_sets(1,3);
        DLIB_TEST(s.find_set(0) == 0);
        DLIB_TEST(s.find_set(1) == id);
        DLIB_TEST(s.find_set(2) == 2);
        DLIB_TEST(s.find_set(3) == id);
        DLIB_TEST(s.find_set(4) == 4);

        id = s.merge_sets(s.find_set(1),4);
        DLIB_TEST(s.find_set(0) == 0);
        DLIB_TEST(s.find_set(1) == id);
        DLIB_TEST(s.find_set(2) == 2);
        DLIB_TEST(s.find_set(3) == id);
        DLIB_TEST(s.find_set(4) == id);

        unsigned long id2 = s.merge_sets(0,2);
        DLIB_TEST(s.find_set(0) == id2);
        DLIB_TEST(s.find_set(1) == id);
        DLIB_TEST(s.find_set(2) == id2);
        DLIB_TEST(s.find_set(3) == id);
        DLIB_TEST(s.find_set(4) == id);

        id = s.merge_sets(s.find_set(1),s.find_set(0));
        DLIB_TEST(s.find_set(0) == id);
        DLIB_TEST(s.find_set(1) == id);
        DLIB_TEST(s.find_set(2) == id);
        DLIB_TEST(s.find_set(3) == id);
        DLIB_TEST(s.find_set(4) == id);

        DLIB_TEST(s.size() == 5);
        s.set_size(1);
        DLIB_TEST(s.size() == 1);
        DLIB_TEST(s.find_set(0) == 0);
        s.set_size(2);
        DLIB_TEST(s.size() == 2);
        DLIB_TEST(s.find_set(0) == 0);
        DLIB_TEST(s.find_set(1) == 1);
        id = s.merge_sets(0,1);
        DLIB_TEST(s.size() == 2);
        DLIB_TEST(id == s.find_set(0));
        DLIB_TEST(id == s.find_set(1));
        DLIB_TEST(s.size() == 2);
        s.clear();
        DLIB_TEST(s.size() == 0);

    }


    class tester_disjoint_subsets : public tester
    {
    public:
        tester_disjoint_subsets (
        ) :
            tester ("test_disjoint_subsets",
                    "Runs tests on the disjoint_subsets component.")
        {}

        void perform_test (
        )
        {
            test_disjoint_subset();
        }
    } a;


}



