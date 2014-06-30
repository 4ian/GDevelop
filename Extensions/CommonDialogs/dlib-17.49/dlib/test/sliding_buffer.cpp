// Copyright (C) 2004  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.


#include <sstream>
#include <string>
#include <ctime>
#include <cstdlib>

#include <dlib/sliding_buffer.h>
#include "tester.h"

namespace  
{

    using namespace test;
    using namespace std;
    using namespace dlib;

    logger dlog("test.sliding_buffer");

    template <
        typename buf
        >
    void sliding_buffer_kernel_test (
    )
    /*!
        requires
            - buf is an implementation of sliding_buffer/sliding_buffer_kernel_abstract.h 
            - buf is instantiated with T=unsigned char
        ensures
            - runs tests on buf for compliance with the specs 
    !*/
    {        

        print_spinner();

        buf test;

        DLIB_TEST(test.size() == 0);

        test.set_size(3);
        buf test2;

        DLIB_TEST(test.size() == 8);

        for (int g = 0; g < 2; ++g)
        {

            test.clear();

            DLIB_TEST(test.size() == 0);
            test.set_size(2);

            DLIB_TEST(test.size() == 4);



            test[0] = 'a';
            test[1] = 's';
            test[2] = 'd';
            test[3] = 'f';

            unsigned long id = test.get_element_id(2);
            DLIB_TEST(test[test.get_element_index(id)] == 'd');


            DLIB_TEST(test[0] == 'a');
            DLIB_TEST(test[1] == 's');
            DLIB_TEST(test[2] == 'd');
            DLIB_TEST(test[3] == 'f');

            DLIB_TEST(test2.size() == 0);
            swap(test,test2);
            DLIB_TEST(test2.size() == 4);

            DLIB_TEST(test2[0] == 'a');
            DLIB_TEST(test2[1] == 's');
            DLIB_TEST(test2[2] == 'd');
            DLIB_TEST(test2[3] == 'f');

            swap(test,test2);

            test.rotate_left(4);


            DLIB_TEST(test[test.get_element_index(id)] == 'd');

            DLIB_TEST(test[0] == 'a');
            DLIB_TEST(test[1] == 's');
            DLIB_TEST(test[2] == 'd');
            DLIB_TEST(test[3] == 'f');

            test.rotate_right(1);

            DLIB_TEST(test[test.get_element_index(id)] == 'd');

            DLIB_TEST(test[0] == 's');
            DLIB_TEST(test[1] == 'd');
            DLIB_TEST(test[2] == 'f');
            DLIB_TEST(test[3] == 'a');   


            test.rotate_left(1);

            DLIB_TEST(test[test.get_element_index(id)] == 'd');
            DLIB_TEST(test[0] == 'a');
            DLIB_TEST(test[1] == 's');
            DLIB_TEST(test[2] == 'd');
            DLIB_TEST(test[3] == 'f');


            test.rotate_left(16);

            DLIB_TEST(test[test.get_element_index(id)] == 'd');
            DLIB_TEST(test[0] == 'a');
            DLIB_TEST(test[1] == 's');
            DLIB_TEST(test[2] == 'd');
            DLIB_TEST(test[3] == 'f');


            test.rotate_left(2);

            DLIB_TEST(test[test.get_element_index(id)] == 'd');

            DLIB_TEST(test[0] == 'd');
            DLIB_TEST(test[1] == 'f');
            DLIB_TEST(test[2] == 'a');
            DLIB_TEST(test[3] == 's');

            test.rotate_left(1);

            DLIB_TEST(test[test.get_element_index(id)] == 'd');
            DLIB_TEST(test[0] == 's');
            DLIB_TEST(test[1] == 'd');
            DLIB_TEST(test[2] == 'f');
            DLIB_TEST(test[3] == 'a');

            test.rotate_left(1);

            DLIB_TEST(test[test.get_element_index(id)] == 'd');
            DLIB_TEST(test[0] == 'a');
            DLIB_TEST(test[1] == 's');
            DLIB_TEST(test[2] == 'd');
            DLIB_TEST(test[3] == 'f');

            DLIB_TEST(test.size() == 4);

            test[0] = 'x';

            DLIB_TEST(test[0] == 'x');
            DLIB_TEST(test[1] == 's');
            DLIB_TEST(test[2] == 'd');
            DLIB_TEST(test[3] == 'f');

            test.rotate_left(1);

            DLIB_TEST_MSG(test[0] == 'f',test[0]);
            DLIB_TEST(test[1] == 'x');
            DLIB_TEST(test[2] == 's');
            DLIB_TEST(test[3] == 'd');


            test[0] = 'x';

            DLIB_TEST(test[0] == 'x');
            DLIB_TEST(test[1] == 'x');
            DLIB_TEST(test[2] == 's');
            DLIB_TEST(test[3] == 'd');


            test.rotate_left(1);


            DLIB_TEST(test[0] == 'd');
            DLIB_TEST(test[1] == 'x');
            DLIB_TEST(test[2] == 'x');
            DLIB_TEST(test[3] == 's');



            DLIB_TEST(test.at_start() == true);
            DLIB_TEST(test.current_element_valid() == false);
            DLIB_TEST(test.move_next() == true);
            DLIB_TEST(test.at_start() == false);
            DLIB_TEST(test.current_element_valid() == true);

            test.clear();
            test2.clear();


            DLIB_TEST(test.size() == 0);
            DLIB_TEST(test.at_start() == true);
            DLIB_TEST(test.current_element_valid() == false);
            DLIB_TEST(test.move_next() == false);
            DLIB_TEST(test.at_start() == false);
            DLIB_TEST(test.current_element_valid() == false);

            swap(test,test2);

            DLIB_TEST(test2.at_start() == false);
            DLIB_TEST(test2.current_element_valid() == false);
            DLIB_TEST(test2.move_next() == false);
            DLIB_TEST(test2.at_start() == false);
            DLIB_TEST(test2.current_element_valid() == false);


            DLIB_TEST(test.at_start() == true);
            DLIB_TEST(test.current_element_valid() == false);
            DLIB_TEST(test.move_next() == false);
            DLIB_TEST(test.at_start() == false);

            test.set_size(3);
            DLIB_TEST(test.size() == 8);

            DLIB_TEST(test.at_start() == true);
            DLIB_TEST(test.current_element_valid() == false);
            DLIB_TEST(test.move_next() == true);
            DLIB_TEST(test.at_start() == false);
            DLIB_TEST(test.current_element_valid() == true);
            test.reset();
            DLIB_TEST(test.size() == 8);
            DLIB_TEST(test.at_start() == true);
            DLIB_TEST(test.current_element_valid() == false);
            DLIB_TEST(test.move_next() == true);
            DLIB_TEST(test.at_start() == false);
            DLIB_TEST(test.current_element_valid() == true);


            test.rotate_right(1);
            DLIB_TEST(test.size() == 8);
            DLIB_TEST(test.at_start() == true);
            DLIB_TEST(test.current_element_valid() == false);
            DLIB_TEST(test.move_next() == true);
            DLIB_TEST(test.at_start() == false);
            DLIB_TEST(test.current_element_valid() == true);

            test.rotate_left(1);
            DLIB_TEST(test.size() == 8);
            DLIB_TEST(test.at_start() == true);
            DLIB_TEST(test.current_element_valid() == false);
            DLIB_TEST(test.move_next() == true);
            DLIB_TEST(test.at_start() == false);
            DLIB_TEST(test.current_element_valid() == true);
            test.reset();


            for (unsigned long i = 0; i < test.size(); ++i)
            {
                test[i] = static_cast<unsigned char>(i);
            }

            unsigned long count = 0;
            while (test.move_next())
            {
                DLIB_TEST(test.element() == count);
                ++count;
            }

            DLIB_TEST(count == test.size());


            test2.clear();
            ostringstream sout;
            istringstream sin;

            serialize(test,sout);
            sin.str(sout.str());
            deserialize(test2,sin);

            char ch;
            sin >> ch;
            DLIB_TEST( !sin);

            DLIB_TEST(test2.size() == test.size());


            for (unsigned long i = 0; i < test.size(); ++i)
            {
                DLIB_TEST_MSG(test[i] == test2[i],
                             "\ni:        " << i <<
                             "\ntest[i]:  " << test[i] <<
                             "\ntest2[i]: " << test2[i]);
            }

            count = 0;
            while (test.move_next() && test2.move_next())
            {
                DLIB_TEST(test.element() == count);
                DLIB_TEST(test2.element() == count);
                ++count;
            }

            DLIB_TEST(test2.size() == count);
            DLIB_TEST(test.size() == count);

            test2.clear();


        } // for (int g = 0; g < 2; ++g)


    }



    void test_circular_buffer()
    {
        circular_buffer<int> buf;

        DLIB_TEST(buf.size() == 0);

        buf.assign(4, 0);
        DLIB_TEST(buf.size() == 4);

        DLIB_TEST(buf[0] == 0);
        DLIB_TEST(buf[1] == 0);
        DLIB_TEST(buf[2] == 0);
        DLIB_TEST(buf[3] == 0);
        buf.push_back(1);
        DLIB_TEST(buf[0] == 0);
        DLIB_TEST(buf[1] == 0);
        DLIB_TEST(buf[2] == 0);
        DLIB_TEST(buf[3] == 1);
        buf.push_back(2);
        DLIB_TEST(buf[0] == 0);
        DLIB_TEST(buf[1] == 0);
        DLIB_TEST(buf[2] == 1);
        DLIB_TEST(buf[3] == 2);
        buf.push_front(3);
        DLIB_TEST(buf[0] == 3);
        DLIB_TEST(buf[1] == 0);
        DLIB_TEST(buf[2] == 0);
        DLIB_TEST(buf[3] == 1);
        buf.push_front(4);
        DLIB_TEST(buf.front() == 4);
        DLIB_TEST(buf[0] == 4);
        DLIB_TEST(buf[1] == 3);
        DLIB_TEST(buf[2] == 0);
        DLIB_TEST(buf[3] == 0);

        buf.assign(4, 5);
        DLIB_TEST(buf[0] == 5);
        DLIB_TEST(buf[1] == 5);
        DLIB_TEST(buf[2] == 5);
        DLIB_TEST(buf[3] == 5);

        buf.push_back(3);
        DLIB_TEST(buf[0] == 5);
        DLIB_TEST(buf[1] == 5);
        DLIB_TEST(buf[2] == 5);
        DLIB_TEST(buf[3] == 3);
        buf.push_back(2);
        DLIB_TEST(buf[0] == 5);
        DLIB_TEST(buf[1] == 5);
        DLIB_TEST(buf[2] == 3);
        DLIB_TEST(buf[3] == 2);
        buf.push_back(1);
        DLIB_TEST(buf[0] == 5);
        DLIB_TEST(buf[1] == 3);
        DLIB_TEST(buf[2] == 2);
        DLIB_TEST(buf[3] == 1);
        buf.push_back(0);
        DLIB_TEST(buf[0] == 3);
        DLIB_TEST(buf[1] == 2);
        DLIB_TEST(buf[2] == 1);
        DLIB_TEST(buf[3] == 0);
        buf.push_back(-1);
        DLIB_TEST(buf.back() == -1);
        DLIB_TEST(buf[0] == 2);
        DLIB_TEST(buf[1] == 1);
        DLIB_TEST(buf[2] == 0);
        DLIB_TEST(buf[3] == -1);

        buf.resize(1);
        buf[0] = 9;
        DLIB_TEST(buf.size() == 1);
        DLIB_TEST(buf[0] == 9);
        buf.push_back(1);
        DLIB_TEST(buf[0] == 1);
        buf.push_back(4);
        DLIB_TEST(buf[0] == 4);
        buf.push_front(3);
        DLIB_TEST(buf[0] == 3);

        buf.clear();
        DLIB_TEST(buf.size() == 0);

        buf.assign(3, 0);

        circular_buffer<int> buf2, buf3;

        buf.push_back(1);
        buf.push_back(2);

        ostringstream sout;
        serialize(buf, sout);
        istringstream sin(sout.str());
        deserialize(buf2, sin);

        DLIB_TEST(buf.size() == buf2.size());
        for (unsigned long i = 0; i < buf.size(); ++i)
            DLIB_TEST(buf[i] == buf2[i]);

        buf.swap(buf3);
        DLIB_TEST(buf.size() == 0);
        DLIB_TEST(buf3.size() == buf2.size());
        for (unsigned long i = 0; i < buf3.size(); ++i)
            DLIB_TEST(buf3[i] == buf2[i]);



    }



    class sliding_buffer_tester : public tester
    {
    public:
        sliding_buffer_tester (
        ) :
            tester ("test_sliding_buffer",
                    "Runs tests on the sliding_buffer component.")
        {}

        void perform_test (
        )
        {
            dlog << LINFO << "testing kernel_1a";
            sliding_buffer_kernel_test<sliding_buffer<unsigned char>::kernel_1a>  ();
            dlog << LINFO << "testing kernel_1a_c";
            sliding_buffer_kernel_test<sliding_buffer<unsigned char>::kernel_1a_c>();

            test_circular_buffer();
        }
    } a;

}

