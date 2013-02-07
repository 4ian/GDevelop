// Copyright (C) 2007  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#include <sstream>
#include <string>
#include <cstdlib>
#include <ctime>
#include <dlib/graph.h>
#include <dlib/graph_utils.h>
#include <dlib/set.h>

#include "tester.h"

// This is called an unnamed-namespace and it has the effect of making everything inside this file "private"
// so that everything you declare will have static linkage.  Thus we won't have any multiply
// defined symbol errors coming out of the linker when we try to compile the test suite.
namespace  
{

    using namespace test;
    using namespace dlib;
    using namespace std;



    // Declare the logger we will use in this test.  The name of the tester 
    // should start with "test."
    logger dlog("test.graph");

    template <
        typename graph
        >
    void graph_test (
    )
    /*!
        requires
            - graph is an implementation of graph/graph_kernel_abstract.h 
              is instantiated with int
        ensures
            - runs tests on graph for compliance with the specs
    !*/
    {        

        print_spinner();

        COMPILE_TIME_ASSERT(is_graph<graph>::value);

        graph a, b;
        dlib::set<unsigned long>::compare_1b_c s;

        DLIB_TEST(graph_contains_length_one_cycle(a) == false);
        DLIB_TEST(graph_contains_undirected_cycle(a) == false);

        DLIB_TEST(a.number_of_nodes() == 0);

        a.set_number_of_nodes(5);
        DLIB_TEST(graph_is_connected(a) == false);
        DLIB_TEST(graph_contains_undirected_cycle(a) == false);
        DLIB_TEST(a.number_of_nodes() == 5);
        DLIB_TEST(graph_contains_length_one_cycle(a) == false);

        for (int i = 0; i < 5; ++i)
        {
            a.node(i).data = i;
            DLIB_TEST(a.node(i).index() == (unsigned int)i);
        }

        a.remove_node(1);

        DLIB_TEST(a.number_of_nodes() == 4);


        // make sure that only the number with data == 1 was removed
        int count = 0;
        for (int i = 0; i < 4; ++i)
        {
            count += a.node(i).data;
            DLIB_TEST(a.node(i).number_of_neighbors() == 0);
            DLIB_TEST(a.node(i).index() == (unsigned int)i);
        }

        DLIB_TEST(count == 9);


        a.add_edge(1,1);
        DLIB_TEST(graph_contains_length_one_cycle(a) == true);
        DLIB_TEST(graph_contains_undirected_cycle(a) == true);
        DLIB_TEST(a.has_edge(1,1));
        DLIB_TEST(a.node(1).number_of_neighbors() == 1);

        a.add_edge(1,3);
        DLIB_TEST(a.node(1).number_of_neighbors() == 2);
        DLIB_TEST(a.node(2).number_of_neighbors() == 0);
        DLIB_TEST(a.node(3).number_of_neighbors() == 1);
        DLIB_TEST(a.has_edge(1,1));
        DLIB_TEST(a.has_edge(1,3));
        DLIB_TEST(a.has_edge(3,1));
        DLIB_TEST(graph_contains_undirected_cycle(a) == true);
        a.remove_edge(1,1);
        DLIB_TEST(graph_contains_length_one_cycle(a) == false);
        DLIB_TEST(graph_contains_undirected_cycle(a) == false);
        DLIB_TEST(a.node(1).number_of_neighbors() == 1);
        DLIB_TEST(a.node(2).number_of_neighbors() == 0);
        DLIB_TEST(a.node(3).number_of_neighbors() == 1);
        DLIB_TEST(a.has_edge(1,1) == false);
        DLIB_TEST(a.has_edge(1,3));
        DLIB_TEST(a.has_edge(3,1));
        DLIB_TEST(graph_contains_undirected_cycle(a) == false);

        swap(a,b);


        DLIB_TEST(graph_contains_undirected_cycle(b) == false);
        DLIB_TEST(b.node(1).number_of_neighbors() == 1);
        DLIB_TEST(b.node(2).number_of_neighbors() == 0);
        DLIB_TEST(b.node(3).number_of_neighbors() == 1);
        DLIB_TEST(b.has_edge(1,1) == false);
        DLIB_TEST(b.has_edge(1,3));
        DLIB_TEST(b.has_edge(3,1));
        DLIB_TEST(graph_contains_undirected_cycle(b) == false);

        DLIB_TEST(a.number_of_nodes() == 0);
        DLIB_TEST(b.number_of_nodes() == 4);

        copy_graph_structure(b,b);
        DLIB_TEST(b.number_of_nodes() == 4);

        b.add_edge(1,2);
        DLIB_TEST(graph_contains_undirected_cycle(b) == false);
        DLIB_TEST(graph_contains_undirected_cycle(b) == false);
        b.add_edge(3,2);
        DLIB_TEST(graph_contains_undirected_cycle(b) == true);
        b.add_edge(1,1);
        DLIB_TEST(graph_is_connected(b) == false);
        b.add_edge(0,2);
        DLIB_TEST(graph_is_connected(b) == true);

        DLIB_TEST(graph_contains_undirected_cycle(b) == true);

        DLIB_TEST(a.number_of_nodes() == 0);

        for (unsigned long i = 0; i < b.number_of_nodes(); ++i)
        {
            for (unsigned long j = 0; j < b.node(i).number_of_neighbors(); ++j)
            {
                b.node(i).edge(j) = 'c';
            }
        }

        b.node(1).edge(0) = 'a';
        const unsigned long e1 = b.node(1).neighbor(0).index();
        b.node(0).edge(0) = 'n';
        const unsigned long e2 = b.node(0).neighbor(0).index();

        ostringstream sout;
        serialize(b, sout);
        istringstream sin(sout.str());

        DLIB_TEST(graph_contains_undirected_cycle(a) == false);

        a.set_number_of_nodes(10);
        deserialize(a, sin);
        DLIB_TEST(graph_contains_undirected_cycle(a) == true);

        for (unsigned long i = 0; i < a.number_of_nodes(); ++i)
        {
            for (unsigned long j = 0; j < a.node(i).number_of_neighbors(); ++j)
            {
                if ((i == 0 && a.node(i).neighbor(j).index() == e2) ||
                    (i == e2 && a.node(i).neighbor(j).index() == 0) )
                {
                    DLIB_TEST(a.node(i).edge(j) == 'n');
                }
                else if ((i == 1 && a.node(i).neighbor(j).index() == e1) ||
                         (i == e1 && a.node(i).neighbor(j).index() == 1))
                {
                    DLIB_TEST(a.node(i).edge(j) == 'a');
                }
                else 
                {
                    DLIB_TEST(i != 0 || a.node(i).neighbor(j).index() != e2);
                    DLIB_TEST_MSG(a.node(i).edge(j) == 'c',a.node(i).edge(j));
                }
            }
        }

        DLIB_TEST(a.number_of_nodes() == 4);
        DLIB_TEST(a.has_edge(1,2) == true);
        DLIB_TEST(a.has_edge(3,2) == true);
        DLIB_TEST(a.has_edge(1,1) == true);
        DLIB_TEST(a.has_edge(0,2) == true);
        DLIB_TEST(a.has_edge(1,3) == true);
        DLIB_TEST(a.has_edge(0,1) == false);
        DLIB_TEST(a.has_edge(0,3) == false);
        DLIB_TEST(a.has_edge(0,0) == false);
        DLIB_TEST(a.has_edge(1,0) == false);
        DLIB_TEST(a.has_edge(3,0) == false);


        for (unsigned long i = 0; i < a.number_of_nodes(); ++i)
        {
            a.node(i).data = static_cast<int>(i);
        }

        a.remove_node(2);
        DLIB_TEST(a.number_of_nodes() == 3);
        DLIB_TEST(graph_contains_undirected_cycle(a) == true);

        count = 0;
        for (unsigned long i = 0; i < a.number_of_nodes(); ++i)
        {
            if (a.node(i).data == 0)
            {
                DLIB_TEST(a.node(i).number_of_neighbors() == 0);
            }
            else if (a.node(i).data == 1)
            {
                DLIB_TEST(a.node(i).number_of_neighbors() == 2);
            }
            else if (a.node(i).data == 3)
            {
                DLIB_TEST(a.node(i).number_of_neighbors() == 1);
            }
            else
            {
                DLIB_TEST_MSG(false,"this is impossible");
            }

            for (unsigned long j = 0; j < a.number_of_nodes(); ++j)
            {
                if ((a.node(i).data == 1 && a.node(j).data == 1) || 
                    (a.node(i).data == 1 && a.node(j).data == 3) ||
                    (a.node(i).data == 3 && a.node(j).data == 1))
                {
                    DLIB_TEST(a.has_edge(i,j) == true);
                    ++count;
                }
                else
                {
                    DLIB_TEST(a.has_edge(i,j) == false);
                }
            }
        }
        DLIB_TEST_MSG(count == 3,count);
        DLIB_TEST(graph_contains_undirected_cycle(a) == true);
        a.remove_edge(1,1);
        DLIB_TEST(graph_contains_undirected_cycle(a) == false);

        DLIB_TEST(b.number_of_nodes() == 4);
        b.clear();
        DLIB_TEST(b.number_of_nodes() == 0);


        a.clear();

            /*
                1      7
                |     / \
                2    6   0
                 \  /    |
                   3    /
                  / \  /
                 4    5
            */
        a.set_number_of_nodes(8);
        a.add_edge(1,2);
        a.add_edge(2,3);
        a.add_edge(3,4);
        a.add_edge(3,5);
        a.add_edge(3,6);
        a.add_edge(6,7);
        a.add_edge(7,0);
        a.add_edge(0,5);

        DLIB_TEST(graph_is_connected(a));

        dlib::set<dlib::set<unsigned long>::compare_1b_c>::kernel_1b_c sos;

        dlib::graph<dlib::set<unsigned long>::compare_1b_c, dlib::set<unsigned long>::compare_1b_c>::kernel_1a_c join_tree;
        unsigned long temp;
        triangulate_graph_and_find_cliques(a,sos);
        DLIB_TEST(a.number_of_nodes() == 8);

        create_join_tree(a, join_tree);
        DLIB_TEST(join_tree.number_of_nodes() == 6);
        DLIB_TEST(graph_is_connected(join_tree) == true);
        DLIB_TEST(graph_contains_undirected_cycle(join_tree) == false);
        DLIB_TEST(is_join_tree(a, join_tree));

        // check old edges
        DLIB_TEST(a.has_edge(1,2));
        DLIB_TEST(a.has_edge(2,3));
        DLIB_TEST(a.has_edge(3,4));
        DLIB_TEST(a.has_edge(3,5));
        DLIB_TEST(a.has_edge(3,6));
        DLIB_TEST(a.has_edge(6,7));
        DLIB_TEST(a.has_edge(7,0));
        DLIB_TEST(a.has_edge(0,5));

        DLIB_TEST(graph_is_connected(a));

        DLIB_TEST(sos.size() == 6);


        temp = 1; s.add(temp);
        temp = 2; s.add(temp);
        DLIB_TEST(sos.is_member(s));
        s.clear();
        temp = 2; s.add(temp);
        temp = 3; s.add(temp);
        DLIB_TEST(sos.is_member(s));
        s.clear();
        temp = 4; s.add(temp);
        temp = 3; s.add(temp);
        DLIB_TEST(sos.is_member(s));

        sos.reset();
        while (sos.move_next())
        {
            DLIB_TEST(is_clique(a, sos.element()));
            DLIB_TEST(is_maximal_clique(a, sos.element()));
        }

    }


    void test_copy()
    {
        {
            graph<int,int>::kernel_1a_c a,b;

            a.set_number_of_nodes(3);
            a.node(0).data = 1;
            a.node(1).data = 2;
            a.node(2).data = 3;
            a.add_edge(0,1);
            a.add_edge(0,2);
            edge(a,0,1) = 4;
            edge(a,0,2) = 5;

            a.add_edge(0,0);
            edge(a,0,0) = 9;
            copy_graph(a, b);

            DLIB_TEST(b.number_of_nodes() == 3);
            DLIB_TEST(b.node(0).data == 1);
            DLIB_TEST(b.node(1).data == 2);
            DLIB_TEST(b.node(2).data == 3);
            DLIB_TEST(edge(b,0,1) == 4);
            DLIB_TEST(edge(b,0,2) == 5);
            DLIB_TEST(edge(b,0,0) == 9);
        }
        {
            graph<int,int>::kernel_1a_c a,b;

            a.set_number_of_nodes(4);
            a.node(0).data = 1;
            a.node(1).data = 2;
            a.node(2).data = 3;
            a.node(3).data = 8;
            a.add_edge(0,1);
            a.add_edge(0,2);
            a.add_edge(2,3);
            edge(a,0,1) = 4;
            edge(a,0,2) = 5;
            edge(a,2,3) = 6;

            copy_graph(a, b);

            DLIB_TEST(b.number_of_nodes() == 4);
            DLIB_TEST(b.node(0).data == 1);
            DLIB_TEST(b.node(1).data == 2);
            DLIB_TEST(b.node(2).data == 3);
            DLIB_TEST(b.node(3).data == 8);
            DLIB_TEST(edge(b,0,1) == 4);
            DLIB_TEST(edge(b,0,2) == 5);
            DLIB_TEST(edge(b,2,3) == 6);
        }
    }



    class graph_tester : public tester
    {
        /*!
            WHAT THIS OBJECT REPRESENTS
                This object represents a test for the graph object.  When it is constructed
                it adds itself into the testing framework.  The command line switch is
                specified as test_directed_graph by passing that string to the tester constructor.
        !*/
    public:
        graph_tester (
        ) :
            tester ("test_graph",
                    "Runs tests on the graph component.")
        {}

        void perform_test (
        )
        {
            dlog << LINFO << "testing kernel_1a_c";
            graph_test<graph<int>::kernel_1a_c>();

            dlog << LINFO << "testing kernel_1a";
            graph_test<graph<int>::kernel_1a>();

            test_copy();
        }
    } a;


}



