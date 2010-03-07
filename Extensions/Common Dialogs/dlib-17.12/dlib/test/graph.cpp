// Copyright (C) 2007  Davis E. King (davisking@users.sourceforge.net)
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
        set<unsigned long>::compare_1b_c s;

        DLIB_CASSERT(graph_contains_length_one_cycle(a) == false,"");
        DLIB_CASSERT(graph_contains_undirected_cycle(a) == false,"");

        DLIB_CASSERT(a.number_of_nodes() == 0,"");

        a.set_number_of_nodes(5);
        DLIB_CASSERT(graph_is_connected(a) == false,"");
        DLIB_CASSERT(graph_contains_undirected_cycle(a) == false,"");
        DLIB_CASSERT(a.number_of_nodes() == 5,"");
        DLIB_CASSERT(graph_contains_length_one_cycle(a) == false,"");

        for (int i = 0; i < 5; ++i)
        {
            a.node(i).data = i;
            DLIB_CASSERT(a.node(i).index() == (unsigned int)i,"");
        }

        a.remove_node(1);

        DLIB_CASSERT(a.number_of_nodes() == 4,"");


        // make sure that only the number with data == 1 was removed
        int count = 0;
        for (int i = 0; i < 4; ++i)
        {
            count += a.node(i).data;
            DLIB_CASSERT(a.node(i).number_of_neighbors() == 0,"");
            DLIB_CASSERT(a.node(i).index() == (unsigned int)i,"");
        }

        DLIB_CASSERT(count == 9,"");


        a.add_edge(1,1);
        DLIB_CASSERT(graph_contains_length_one_cycle(a) == true,"");
        DLIB_CASSERT(graph_contains_undirected_cycle(a) == true,"");
        DLIB_CASSERT(a.has_edge(1,1),"");
        DLIB_CASSERT(a.node(1).number_of_neighbors() == 1,"");

        a.add_edge(1,3);
        DLIB_CASSERT(a.node(1).number_of_neighbors() == 2,"");
        DLIB_CASSERT(a.node(2).number_of_neighbors() == 0,"");
        DLIB_CASSERT(a.node(3).number_of_neighbors() == 1,"");
        DLIB_CASSERT(a.has_edge(1,1),"");
        DLIB_CASSERT(a.has_edge(1,3),"");
        DLIB_CASSERT(a.has_edge(3,1),"");
        DLIB_CASSERT(graph_contains_undirected_cycle(a) == true,"");
        a.remove_edge(1,1);
        DLIB_CASSERT(graph_contains_length_one_cycle(a) == false,"");
        DLIB_CASSERT(graph_contains_undirected_cycle(a) == false,"");
        DLIB_CASSERT(a.node(1).number_of_neighbors() == 1,"");
        DLIB_CASSERT(a.node(2).number_of_neighbors() == 0,"");
        DLIB_CASSERT(a.node(3).number_of_neighbors() == 1,"");
        DLIB_CASSERT(a.has_edge(1,1) == false,"");
        DLIB_CASSERT(a.has_edge(1,3),"");
        DLIB_CASSERT(a.has_edge(3,1),"");
        DLIB_CASSERT(graph_contains_undirected_cycle(a) == false,"");

        swap(a,b);


        DLIB_CASSERT(graph_contains_undirected_cycle(b) == false,"");
        DLIB_CASSERT(b.node(1).number_of_neighbors() == 1,"");
        DLIB_CASSERT(b.node(2).number_of_neighbors() == 0,"");
        DLIB_CASSERT(b.node(3).number_of_neighbors() == 1,"");
        DLIB_CASSERT(b.has_edge(1,1) == false,"");
        DLIB_CASSERT(b.has_edge(1,3),"");
        DLIB_CASSERT(b.has_edge(3,1),"");
        DLIB_CASSERT(graph_contains_undirected_cycle(b) == false,"");

        DLIB_CASSERT(a.number_of_nodes() == 0,"");
        DLIB_CASSERT(b.number_of_nodes() == 4,"");

        copy_graph_structure(b,b);
        DLIB_CASSERT(b.number_of_nodes() == 4,"");

        b.add_edge(1,2);
        DLIB_CASSERT(graph_contains_undirected_cycle(b) == false,"");
        DLIB_CASSERT(graph_contains_undirected_cycle(b) == false,"");
        b.add_edge(3,2);
        DLIB_CASSERT(graph_contains_undirected_cycle(b) == true,"");
        b.add_edge(1,1);
        DLIB_CASSERT(graph_is_connected(b) == false,"");
        b.add_edge(0,2);
        DLIB_CASSERT(graph_is_connected(b) == true,"");

        DLIB_CASSERT(graph_contains_undirected_cycle(b) == true,"");

        DLIB_CASSERT(a.number_of_nodes() == 0,"");

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

        DLIB_CASSERT(graph_contains_undirected_cycle(a) == false,"");

        a.set_number_of_nodes(10);
        deserialize(a, sin);
        DLIB_CASSERT(graph_contains_undirected_cycle(a) == true,"");

        for (unsigned long i = 0; i < a.number_of_nodes(); ++i)
        {
            for (unsigned long j = 0; j < a.node(i).number_of_neighbors(); ++j)
            {
                if ((i == 0 && a.node(i).neighbor(j).index() == e2) ||
                    (i == e2 && a.node(i).neighbor(j).index() == 0) )
                {
                    DLIB_CASSERT(a.node(i).edge(j) == 'n',"");
                }
                else if ((i == 1 && a.node(i).neighbor(j).index() == e1) ||
                         (i == e1 && a.node(i).neighbor(j).index() == 1))
                {
                    DLIB_CASSERT(a.node(i).edge(j) == 'a',"");
                }
                else 
                {
                    DLIB_CASSERT(i != 0 || a.node(i).neighbor(j).index() != e2,"");
                    DLIB_CASSERT(a.node(i).edge(j) == 'c',a.node(i).edge(j));
                }
            }
        }

        DLIB_CASSERT(a.number_of_nodes() == 4,"");
        DLIB_CASSERT(a.has_edge(1,2) == true,"");
        DLIB_CASSERT(a.has_edge(3,2) == true,"");
        DLIB_CASSERT(a.has_edge(1,1) == true,"");
        DLIB_CASSERT(a.has_edge(0,2) == true,"");
        DLIB_CASSERT(a.has_edge(1,3) == true,"");
        DLIB_CASSERT(a.has_edge(0,1) == false,"");
        DLIB_CASSERT(a.has_edge(0,3) == false,"");
        DLIB_CASSERT(a.has_edge(0,0) == false,"");
        DLIB_CASSERT(a.has_edge(1,0) == false,"");
        DLIB_CASSERT(a.has_edge(3,0) == false,"");


        for (unsigned long i = 0; i < a.number_of_nodes(); ++i)
        {
            a.node(i).data = static_cast<int>(i);
        }

        a.remove_node(2);
        DLIB_CASSERT(a.number_of_nodes() == 3,"");
        DLIB_CASSERT(graph_contains_undirected_cycle(a) == true,"");

        count = 0;
        for (unsigned long i = 0; i < a.number_of_nodes(); ++i)
        {
            if (a.node(i).data == 0)
            {
                DLIB_CASSERT(a.node(i).number_of_neighbors() == 0,"");
            }
            else if (a.node(i).data == 1)
            {
                DLIB_CASSERT(a.node(i).number_of_neighbors() == 2,"");
            }
            else if (a.node(i).data == 3)
            {
                DLIB_CASSERT(a.node(i).number_of_neighbors() == 1,"");
            }
            else
            {
                DLIB_CASSERT(false,"this is impossible");
            }

            for (unsigned long j = 0; j < a.number_of_nodes(); ++j)
            {
                if ((a.node(i).data == 1 && a.node(j).data == 1) || 
                    (a.node(i).data == 1 && a.node(j).data == 3) ||
                    (a.node(i).data == 3 && a.node(j).data == 1))
                {
                    DLIB_CASSERT(a.has_edge(i,j) == true,"");
                    ++count;
                }
                else
                {
                    DLIB_CASSERT(a.has_edge(i,j) == false,"");
                }
            }
        }
        DLIB_CASSERT(count == 3,count);
        DLIB_CASSERT(graph_contains_undirected_cycle(a) == true,"");
        a.remove_edge(1,1);
        DLIB_CASSERT(graph_contains_undirected_cycle(a) == false,"");

        DLIB_CASSERT(b.number_of_nodes() == 4,"");
        b.clear();
        DLIB_CASSERT(b.number_of_nodes() == 0,"");


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

        DLIB_CASSERT(graph_is_connected(a),"");

        set<set<unsigned long>::compare_1b_c>::kernel_1b_c sos;

        dlib::graph<set<unsigned long>::compare_1b_c, set<unsigned long>::compare_1b_c>::kernel_1a_c join_tree;
        unsigned long temp;
        triangulate_graph_and_find_cliques(a,sos);
        DLIB_CASSERT(a.number_of_nodes() == 8,"");

        create_join_tree(a, join_tree);
        DLIB_CASSERT(join_tree.number_of_nodes() == 6,"");
        DLIB_CASSERT(graph_is_connected(join_tree) == true,"");
        DLIB_CASSERT(graph_contains_undirected_cycle(join_tree) == false,"");
        DLIB_CASSERT(is_join_tree(a, join_tree),"");

        // check old edges
        DLIB_CASSERT(a.has_edge(1,2),"");
        DLIB_CASSERT(a.has_edge(2,3),"");
        DLIB_CASSERT(a.has_edge(3,4),"");
        DLIB_CASSERT(a.has_edge(3,5),"");
        DLIB_CASSERT(a.has_edge(3,6),"");
        DLIB_CASSERT(a.has_edge(6,7),"");
        DLIB_CASSERT(a.has_edge(7,0),"");
        DLIB_CASSERT(a.has_edge(0,5),"");

        DLIB_CASSERT(graph_is_connected(a),"");

        DLIB_CASSERT(sos.size() == 6,"");


        temp = 1; s.add(temp);
        temp = 2; s.add(temp);
        DLIB_CASSERT(sos.is_member(s),"");
        s.clear();
        temp = 2; s.add(temp);
        temp = 3; s.add(temp);
        DLIB_CASSERT(sos.is_member(s),"");
        s.clear();
        temp = 4; s.add(temp);
        temp = 3; s.add(temp);
        DLIB_CASSERT(sos.is_member(s),"");

        sos.reset();
        while (sos.move_next())
        {
            DLIB_CASSERT(is_clique(a, sos.element()),"");
            DLIB_CASSERT(is_maximal_clique(a, sos.element()),"");
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
        }
    } a;


}



