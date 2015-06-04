// Copyright (C) 2013  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.

#include "tester.h"
#include <dlib/threads.h>
#include <vector>
#include <sstream>

namespace  
{
    using namespace test;
    using namespace dlib;
    using namespace std;
    dlib::logger dlog("test.parallel_for");

    class assign_element
    {
    public:

        assign_element(
            std::vector<int>& vect_
        ) : vect(vect_){}

        std::vector<int>& vect;

        void go (long i ) 
        {
            DLIB_TEST( 0 <= i && i < (long)vect.size());
            vect[i] = i;
        }

        void operator() (long i ) const
        {
            DLIB_TEST( 0 <= i && i < (long)vect.size());
            vect[i] = i;
        }

    };

    void test_parallel_for(long start)
    {
        std::vector<int> vect(200,0);

        parallel_for(4, start, vect.size(), assign_element(vect));

        for (long i = 0; i < start;  ++i)
        {
            DLIB_TEST(vect[i] == 0);
        }
        for (long i = start; i < (long)vect.size(); ++i)
        {
            DLIB_TEST(vect[i] == i);
        }
    }

    void test_parallel_for2(long start)
    {
        std::vector<int> vect(200,0);

        assign_element temp(vect);
        parallel_for(4, start, vect.size(), temp, &assign_element::go);

        for (long i = 0; i < start;  ++i)
        {
            DLIB_TEST(vect[i] == 0);
        }
        for (long i = start; i < (long)vect.size(); ++i)
        {
            DLIB_TEST(vect[i] == i);
        }
    }

    struct parfor_test_helper
    {
        mutable std::vector<int> test;

        parfor_test_helper() : test(400,100000)
        {
        }

        void go(long begin, long end)
        {
            for (long i = begin; i < end; ++i)
                test[i] = i;
        }

        void operator()(long begin, long end) const
        {
            for (long i = begin; i < end; ++i)
                test[i] = i;
        }

        void go2(long i)
        {
            test[i] = i;
        }

    };

    struct parfor_test_helper2
    {
        mutable std::vector<int> test;

        parfor_test_helper2() : test(400,100000)
        {
        }

        void operator()(long i) const
        {
            test[i] = i;
        }

    };

    void test_parallel_for_additional()
    {
        {
            parfor_test_helper helper;
            parallel_for(4, 0, helper.test.size(), helper, &parfor_test_helper::go2);

            for (unsigned long i = 0; i < helper.test.size(); ++i)
            {
                DLIB_CASSERT(helper.test[i] == (long)i, helper.test[i]);
            }
        }
        {
            parfor_test_helper helper;
            parallel_for(4, 10, helper.test.size(), helper, &parfor_test_helper::go2);

            for (unsigned long i = 0; i < 10; ++i)
            {
                DLIB_CASSERT(helper.test[i] == 100000, helper.test[i]);
            }
            for (unsigned long i = 10; i < helper.test.size(); ++i)
            {
                DLIB_CASSERT(helper.test[i] == (long)i, helper.test[i]);
            }
        }
        {
            parfor_test_helper helper;
            parallel_for_blocked(4, 0, helper.test.size(), helper, &parfor_test_helper::go);

            for (unsigned long i = 0; i < helper.test.size(); ++i)
            {
                DLIB_CASSERT(helper.test[i] == (long)i, helper.test[i]);
            }
        }
        {
            parfor_test_helper helper;
            parallel_for_blocked(4, 10, helper.test.size(), helper, &parfor_test_helper::go);

            for (unsigned long i = 0; i < 10; ++i)
            {
                DLIB_CASSERT(helper.test[i] == 100000, helper.test[i]);
            }
            for (unsigned long i = 10; i < helper.test.size(); ++i)
            {
                DLIB_CASSERT(helper.test[i] == (long)i, helper.test[i]);
            }
        }
        {
            parfor_test_helper helper;
            parallel_for_blocked(4, 0, helper.test.size(), helper);

            for (unsigned long i = 0; i < helper.test.size(); ++i)
            {
                DLIB_CASSERT(helper.test[i] == (long)i, helper.test[i]);
            }
        }
        {
            parfor_test_helper helper;
            parallel_for_blocked(4, 10, helper.test.size(), helper);

            for (unsigned long i = 0; i < 10; ++i)
            {
                DLIB_CASSERT(helper.test[i] == 100000, helper.test[i]);
            }
            for (unsigned long i = 10; i < helper.test.size(); ++i)
            {
                DLIB_CASSERT(helper.test[i] == (long)i, helper.test[i]);
            }
        }
        {
            parfor_test_helper2 helper;
            parallel_for(4, 0, helper.test.size(), helper);

            for (unsigned long i = 0; i < helper.test.size(); ++i)
            {
                DLIB_CASSERT(helper.test[i] == (long)i, helper.test[i]);
            }
        }
        {
            parfor_test_helper2 helper;
            parallel_for(4, 10, helper.test.size(), helper);

            for (unsigned long i = 0; i < 10; ++i)
            {
                DLIB_CASSERT(helper.test[i] == 100000, helper.test[i]);
            }
            for (unsigned long i = 10; i < helper.test.size(); ++i)
            {
                DLIB_CASSERT(helper.test[i] == (long)i, helper.test[i]);
            }
        }






        {
            parfor_test_helper helper;
            parallel_for_verbose(4, 0, helper.test.size(), helper, &parfor_test_helper::go2);

            for (unsigned long i = 0; i < helper.test.size(); ++i)
            {
                DLIB_CASSERT(helper.test[i] == (long)i, helper.test[i]);
            }
        }
        {
            parfor_test_helper helper;
            parallel_for_verbose(4, 10, helper.test.size(), helper, &parfor_test_helper::go2);

            for (unsigned long i = 0; i < 10; ++i)
            {
                DLIB_CASSERT(helper.test[i] == 100000, helper.test[i]);
            }
            for (unsigned long i = 10; i < helper.test.size(); ++i)
            {
                DLIB_CASSERT(helper.test[i] == (long)i, helper.test[i]);
            }
        }
        {
            parfor_test_helper helper;
            parallel_for_blocked_verbose(4, 0, helper.test.size(), helper, &parfor_test_helper::go);

            for (unsigned long i = 0; i < helper.test.size(); ++i)
            {
                DLIB_CASSERT(helper.test[i] == (long)i, helper.test[i]);
            }
        }
        {
            parfor_test_helper helper;
            parallel_for_blocked_verbose(4, 10, helper.test.size(), helper, &parfor_test_helper::go);

            for (unsigned long i = 0; i < 10; ++i)
            {
                DLIB_CASSERT(helper.test[i] == 100000, helper.test[i]);
            }
            for (unsigned long i = 10; i < helper.test.size(); ++i)
            {
                DLIB_CASSERT(helper.test[i] == (long)i, helper.test[i]);
            }
        }
        {
            parfor_test_helper helper;
            parallel_for_blocked_verbose(4, 0, helper.test.size(), helper);

            for (unsigned long i = 0; i < helper.test.size(); ++i)
            {
                DLIB_CASSERT(helper.test[i] == (long)i, helper.test[i]);
            }
        }
        {
            parfor_test_helper helper;
            parallel_for_blocked_verbose(4, 10, helper.test.size(), helper);

            for (unsigned long i = 0; i < 10; ++i)
            {
                DLIB_CASSERT(helper.test[i] == 100000, helper.test[i]);
            }
            for (unsigned long i = 10; i < helper.test.size(); ++i)
            {
                DLIB_CASSERT(helper.test[i] == (long)i, helper.test[i]);
            }
        }
        {
            parfor_test_helper2 helper;
            parallel_for_verbose(4, 0, helper.test.size(), helper);

            for (unsigned long i = 0; i < helper.test.size(); ++i)
            {
                DLIB_CASSERT(helper.test[i] == (long)i, helper.test[i]);
            }
        }
        {
            parfor_test_helper2 helper;
            parallel_for_verbose(4, 10, helper.test.size(), helper);

            for (unsigned long i = 0; i < 10; ++i)
            {
                DLIB_CASSERT(helper.test[i] == 100000, helper.test[i]);
            }
            for (unsigned long i = 10; i < helper.test.size(); ++i)
            {
                DLIB_CASSERT(helper.test[i] == (long)i, helper.test[i]);
            }
        }
    }

    class test_parallel_for_routines : public tester
    {
    public:
        test_parallel_for_routines (
        ) :
            tester (
                "test_parallel_for",       // the command line argument name for this test
                "Run tests on the parallel_for routines.", // the command line argument description
                0                     // the number of command line arguments for this test
            )
        {
        }

        void perform_test (
        )
        {
            test_parallel_for(0);
            test_parallel_for(30);
            test_parallel_for(50);
            test_parallel_for2(0);
            test_parallel_for2(30);
            test_parallel_for2(50);

            test_parallel_for_additional();
        }
    };

    test_parallel_for_routines a;

}




