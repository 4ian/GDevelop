// Copyright (C) 2003  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#ifndef DLIB_BINARY_SEARCH_TREE_KERNEl_TEST_
#define DLIB_BINARY_SEARCH_TREE_KERNEl_TEST_


#include <sstream>
#include <string>
#include <cstdlib>
#include <ctime>

#include <dlib/memory_manager_global.h>
#include <dlib/memory_manager_stateless.h>
#include <dlib/binary_search_tree.h>
#include "tester.h"
#include "binary_search_tree.h"

namespace  
{

    class binary_search_tree_tester : public tester
    {
        struct factory
        {
            template <typename U>
            struct return_type {
                typedef typename memory_manager<U>::kernel_1c type;
            };

            template <typename U>
            static typename return_type<U>::type* get_instance (
            )
            {
                static typename return_type<U>::type instance;
                return &instance;
            }

        };


    public:
        binary_search_tree_tester (
        ) :
            tester ("test_binary_search_tree_mm1",
                    "Runs tests on the binary_search_tree component with memory managers.")
        {}

        void perform_test (
        )
        {
            dlog << LINFO << "testing kernel_1a /w memory_manager_global";
            binary_search_tree_kernel_test<binary_search_tree<int,int, 
            memory_manager_global<char,factory>::kernel_1a>::kernel_1a>();
            print_spinner();


            dlog << LINFO << "testing kernel_1a /w memory_manager_stateless";
            binary_search_tree_kernel_test<binary_search_tree<int,int, 
            memory_manager_stateless<char>::kernel_1a>::kernel_1a>();
            print_spinner();
        }
    } a;

}

#endif
