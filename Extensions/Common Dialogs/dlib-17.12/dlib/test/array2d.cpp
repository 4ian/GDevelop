// Copyright (C) 2006  Davis E. King (davisking@users.sourceforge.net)
// License: Boost Software License   See LICENSE.txt for the full license.


#include <sstream>
#include <string>
#include <cstdlib>
#include <ctime>
#include <dlib/interfaces/enumerable.h>
#include <dlib/array2d.h>
#include "tester.h"

namespace  
{
    using namespace test;
    using namespace dlib;
    using namespace std;

    logger dlog("test.array2d");

    template <
        typename array2d
        >
    void array2d_kernel_test (
    )
    /*!
        requires
            - array2d is an implementation of array2d/array2d_kernel_abstract.h 
              is instantiated with unsigned long 
        ensures
            - runs tests on array2d for compliance with the specs
    !*/
    {        
        srand(static_cast<unsigned int>(time(0)));

        array2d test,test2;

        long nc, nr;



        enumerable<unsigned long>& e = test;
        DLIB_CASSERT(e.at_start() == true,"");


        DLIB_CASSERT(e.size() == 0,"");
        DLIB_CASSERT(e.at_start() == true,"");
        DLIB_CASSERT(e.current_element_valid() == false, "");

        DLIB_CASSERT (e.move_next() == false,"");
        DLIB_CASSERT (e.move_next() == false,"");
        DLIB_CASSERT (e.move_next() == false,"");
        DLIB_CASSERT (e.move_next() == false,"");
        DLIB_CASSERT (e.move_next() == false,"");
        DLIB_CASSERT (e.move_next() == false,"");


        DLIB_CASSERT(e.size() == 0,"");
        DLIB_CASSERT(e.at_start() == false,"");
        DLIB_CASSERT(e.current_element_valid() == false, "");


        e.reset();

        DLIB_CASSERT(e.size() == 0,"");
        DLIB_CASSERT(e.at_start() == true,"");
        DLIB_CASSERT(e.current_element_valid() == false, "");





        DLIB_CASSERT(test.at_start() == true,"");


        DLIB_CASSERT(test.size() == 0,"");
        DLIB_CASSERT(test.at_start() == true,"");
        DLIB_CASSERT(test.current_element_valid() == false, "");

        DLIB_CASSERT (test.move_next() == false,"");
        DLIB_CASSERT (test.move_next() == false,"");
        DLIB_CASSERT (test.move_next() == false,"");
        DLIB_CASSERT (test.move_next() == false,"");
        DLIB_CASSERT (test.move_next() == false,"");
        DLIB_CASSERT (test.move_next() == false,"");


        DLIB_CASSERT(test.size() == 0,"");
        DLIB_CASSERT(test.at_start() == false,"");
        DLIB_CASSERT(test.current_element_valid() == false, "");


        test.reset();

        DLIB_CASSERT(test.size() == 0,"");
        DLIB_CASSERT(test.at_start() == true,"");
        DLIB_CASSERT(test.current_element_valid() == false, "");

        test.clear();


        DLIB_CASSERT(test.at_start() == true,"");


        DLIB_CASSERT(test.size() == 0,"");
        DLIB_CASSERT(test.at_start() == true,"");
        DLIB_CASSERT(test.current_element_valid() == false, "");

        DLIB_CASSERT (test.move_next() == false,"");
        DLIB_CASSERT (test.move_next() == false,"");
        DLIB_CASSERT (test.move_next() == false,"");
        DLIB_CASSERT (test.move_next() == false,"");
        DLIB_CASSERT (test.move_next() == false,"");
        DLIB_CASSERT (test.move_next() == false,"");


        test.set_size(0,0);


        DLIB_CASSERT(test.at_start() == true,"");


        DLIB_CASSERT(test.size() == 0,"");
        DLIB_CASSERT(test.at_start() == true,"");
        DLIB_CASSERT(test.current_element_valid() == false, "");

        DLIB_CASSERT (test.move_next() == false,"");
        DLIB_CASSERT (test.move_next() == false,"");
        DLIB_CASSERT (test.move_next() == false,"");
        DLIB_CASSERT (test.move_next() == false,"");
        DLIB_CASSERT (test.move_next() == false,"");
        DLIB_CASSERT (test.move_next() == false,"");

        swap(test,test2);
        DLIB_CASSERT (test2.at_start() == false,"");
        DLIB_CASSERT (test2.current_element_valid() == false,"");
        DLIB_CASSERT(test.at_start() == true,"");
        DLIB_CASSERT(test.current_element_valid() == false, "");
        swap(test,test2);
        DLIB_CASSERT(test2.at_start() == true,"");
        DLIB_CASSERT(test2.current_element_valid() == false, "");


        DLIB_CASSERT(test.size() == 0,"");
        DLIB_CASSERT(test.at_start() == false,"");
        DLIB_CASSERT(test.current_element_valid() == false, "");


        test.reset();

        DLIB_CASSERT(test.size() == 0,"");
        DLIB_CASSERT(test.at_start() == true,"");
        DLIB_CASSERT(test.current_element_valid() == false, "");




        for (int j = 0; j < 30; ++j)
        {
            test2.clear();
            switch (j)
            {
                case 0:
                    nc = 10;
                    nr = 11;
                    break;
                case 1:
                    nc = 1;
                    nr = 1;
                    break;
                case 2:
                    nc = 100;
                    nr = 1;
                    break;
                case 3:
                    nc = 1;
                    nr = 100;
                    break;
                default:
                    nc = ::rand()%100 + 1;
                    nr = ::rand()%100 + 1;
                    break;
            }

            test.set_size(nr,nc);

            DLIB_CASSERT(test.size() == static_cast<unsigned long>(nc*nr),"");
            DLIB_CASSERT(test.nr() == nr,"");
            DLIB_CASSERT(test.nc() == nc,"");
            DLIB_CASSERT(test.at_start() == true,"");
            DLIB_CASSERT(test.current_element_valid() == false,"");

            unsigned long i = 0;
            while (test.move_next())
            {
                DLIB_CASSERT(test.current_element_valid() == true,"");
                DLIB_CASSERT(test.at_start() == false,"");
                test.element() = i;
                DLIB_CASSERT(const_cast<const array2d&>(test).element() == i,"");
                ++i;
            }
            DLIB_CASSERT(i == test.size(),"");
            DLIB_CASSERT(test.current_element_valid() == false,"");

            DLIB_CASSERT(test.nr() == nr,"");
            DLIB_CASSERT(test.nc() == nc,"");
            DLIB_CASSERT(test.at_start() == false,"");
            DLIB_CASSERT(test.size() == static_cast<unsigned long>(nc*nr),"");

            i = 0;
            for (long row = 0; row < test.nr(); ++row)
            {
                for (long col = 0; col < test.nc(); ++col)
                {
                    DLIB_CASSERT(test[row][col] == i,
                                 "\n\trow: " << row <<
                                 "\n\tcol: " << col <<
                                 "\n\ti:   " << i <<
                                 "\n\ttest[row][col]: " << test[row][col]);
                    DLIB_CASSERT(test[row].nc() == test.nc(),"");
                    DLIB_CASSERT(test.current_element_valid() == false,"");

                    DLIB_CASSERT(test.nr() == nr,"");
                    DLIB_CASSERT(test.nc() == nc,"");
                    DLIB_CASSERT(test.at_start() == false,"");
                    DLIB_CASSERT(test.size() == static_cast<unsigned long>(nc*nr),"");
                    ++i;
                }
            }

            test.reset();

            i = 0;
            while (test.move_next())
            {
                DLIB_CASSERT(test.element() == i,"");
                ++i;
                DLIB_CASSERT(test.current_element_valid() == true,"");
                DLIB_CASSERT(test.at_start() == false,"");
            }
            DLIB_CASSERT(i == test.size(),"");

            test.reset();




            swap(test,test2);

            DLIB_CASSERT(test2.size() == static_cast<unsigned long>(nc*nr),"");
            DLIB_CASSERT(test2.nr() == nr,"");
            DLIB_CASSERT(test2.nc() == nc,"");
            DLIB_CASSERT(test2.at_start() == true,"");
            DLIB_CASSERT(test2.current_element_valid() == false,"");

            i = 0;
            while (test2.move_next())
            {
                DLIB_CASSERT(test2.current_element_valid() == true,"");
                DLIB_CASSERT(test2.at_start() == false,"");
                test2.element() = i;
                ++i;
            }
            DLIB_CASSERT(i == test2.size(),"");
            DLIB_CASSERT(test2.current_element_valid() == false,"");

            DLIB_CASSERT(test2.nr() == nr,"");
            DLIB_CASSERT(test2.nr() == test2.nr(),"");
            DLIB_CASSERT(test2.nc() == nc,"");
            DLIB_CASSERT(test2.nc() == test2.nc(),"");
            DLIB_CASSERT(test2.at_start() == false,"");
            DLIB_CASSERT(test2.size() == static_cast<unsigned long>(nc*nr),"");

            i = 0;
            for (long row = 0; row < test2.nr(); ++row)
            {
                for (long col = 0; col < test2.nc(); ++col)
                {
                    DLIB_CASSERT(test2[row][col] == i,"");
                    DLIB_CASSERT(const_cast<const array2d&>(test2)[row][col] == i,"");
                    DLIB_CASSERT(test2[row].nc() == test2.nc(),"");
                    DLIB_CASSERT(test2.current_element_valid() == false,"");

                    DLIB_CASSERT(test2.nr() == nr,"");
                    DLIB_CASSERT(test2.nr() == test2.nr(),"");
                    DLIB_CASSERT(test2.nc() == nc,"");
                    DLIB_CASSERT(test2.nc() == test2.nc(),"");
                    DLIB_CASSERT(test2.at_start() == false,"");
                    DLIB_CASSERT(test2.size() == static_cast<unsigned long>(nc*nr),"");
                    ++i;
                }
            }

            test2.reset();

            i = 0;
            while (test2.move_next())
            {
                DLIB_CASSERT(test2.element() == i,"");
                DLIB_CASSERT(const_cast<const array2d&>(test2).element() == i,"");
                ++i;
                DLIB_CASSERT(test2.current_element_valid() == true,"");
                DLIB_CASSERT(test2.at_start() == false,"");
            }
            DLIB_CASSERT(i == test2.size(),"");


            test2.clear();
            DLIB_CASSERT(test2.size() == 0,"");
            DLIB_CASSERT(test2.nr() == 0,"");
            DLIB_CASSERT(test2.nc() == 0,"");
            DLIB_CASSERT(test2.current_element_valid() == false,"");
            DLIB_CASSERT(test2.at_start() == true,"");

            DLIB_CASSERT(test.size() == 0,"");
            DLIB_CASSERT(test.nc() == 0,"");
            DLIB_CASSERT(test.nr() == 0,"");

            test.set_size(nr,nc);
            DLIB_CASSERT(test.size() == static_cast<unsigned long>(nc*nr),"");
            DLIB_CASSERT(test.nc() == nc,"");
            DLIB_CASSERT(test.nr() == nr,"");



        }





        // test the serialization
        istringstream sin;
        ostringstream sout;
        test.clear();
        test2.clear();

        DLIB_CASSERT(test.size() == 0,"");
        DLIB_CASSERT(test.nc() == 0,"");
        DLIB_CASSERT(test.nr() == 0,"");
        DLIB_CASSERT(test2.size() == 0,"");
        DLIB_CASSERT(test2.nc() == 0,"");
        DLIB_CASSERT(test2.nr() == 0,"");

        test.set_size(10,10);

        for (long row = 0; row < test.nr(); ++row)
        {
            for (long col = 0; col < test.nc(); ++col)
            {
                test[row][col] = row*col;
            }
        }

        serialize(test,sout);
        sin.str(sout.str());
        deserialize(test2,sin);

        DLIB_CASSERT(test2.size() == test.size(),"");
        DLIB_CASSERT(test2.nc() == test.nc(),"");
        DLIB_CASSERT(test2.nr() == test.nr(),"");
        DLIB_CASSERT(test2.size() == 100,"");
        DLIB_CASSERT(test2.nc() == 10,"");
        DLIB_CASSERT(test2.nr() == 10,"");


        for (long row = 0; row < test.nr(); ++row)
        {
            for (long col = 0; col < test.nc(); ++col)
            {
                DLIB_CASSERT(test[row][col] == static_cast<unsigned long>(row*col),"");
                DLIB_CASSERT(test2[row][col] == static_cast<unsigned long>(row*col),"");
            }
        }






        test.set_size(10,11);
        DLIB_CASSERT(test.nr() == 10,"");
        DLIB_CASSERT(test.nc() == 11,"");
        test.set_size(0,0);
        DLIB_CASSERT(test.nr() == 0,"");
        DLIB_CASSERT(test.nc() == 0,"");

    }


    class array2d_tester : public tester
    {
    public:
        array2d_tester (
        ) :
            tester ("test_array2d",
                    "Runs tests on the array2d component.")
        {}

        void perform_test (
        )
        {
            dlog << LINFO << "testing kernel_1a";
            array2d_kernel_test<array2d<unsigned long>::kernel_1a>  ();
            print_spinner();
            dlog << LINFO << "testing kernel_1a_c";
            array2d_kernel_test<array2d<unsigned long>::kernel_1a_c> ();
            print_spinner();
        }
    } a;

}


