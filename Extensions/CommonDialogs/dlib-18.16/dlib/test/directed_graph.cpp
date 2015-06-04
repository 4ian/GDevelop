// Copyright (C) 2007  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.


#include <sstream>
#include <string>
#include <cstdlib>
#include <ctime>
#include <dlib/directed_graph.h>
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
    logger dlog("test.directed_graph");

    template <
        typename directed_graph
        >
    void directed_graph_test (
    )
    /*!
        requires
            - directed_graph is an implementation of directed_graph/directed_graph_kernel_abstract.h 
              is instantiated with int
        ensures
            - runs tests on directed_graph for compliance with the specs
    !*/
    {        
        print_spinner();

        COMPILE_TIME_ASSERT(is_directed_graph<directed_graph>::value == true);
        directed_graph a, b;
        dlib::set<unsigned long>::compare_1b_c s;

        DLIB_TEST(graph_contains_directed_cycle(a) == false);
        DLIB_TEST(graph_contains_undirected_cycle(a) == false);

        DLIB_TEST(a.number_of_nodes() == 0);

        DLIB_TEST(graph_contains_length_one_cycle(a) == false);

        a.set_number_of_nodes(5);
        DLIB_TEST(graph_contains_length_one_cycle(a) == false);
        DLIB_TEST(graph_is_connected(a) == false);
        DLIB_TEST(graph_contains_directed_cycle(a) == false);
        DLIB_TEST(graph_contains_undirected_cycle(a) == false);
        DLIB_TEST(a.number_of_nodes() == 5);

        for (int i = 0; i < 5; ++i)
        {
            a.node(i).data = i;
            DLIB_TEST(a.node(i).index() == (unsigned int)i);
        }

        a.remove_node(1);

        DLIB_TEST(a.number_of_nodes() == 4);


        // make sure that only the number with data == 1 was remove
        int count = 0;
        for (int i = 0; i < 4; ++i)
        {
            count += a.node(i).data;
            DLIB_TEST(a.node(i).number_of_children() == 0);
            DLIB_TEST(a.node(i).number_of_parents() == 0);
            DLIB_TEST(a.node(i).index() == (unsigned int)i);
        }

        DLIB_TEST(count == 9);

        DLIB_TEST(graph_contains_directed_cycle(a) == false);

        a.add_edge(1,1);
        DLIB_TEST(graph_contains_length_one_cycle(a) == true);
        DLIB_TEST(graph_contains_undirected_cycle(a) == true);

        DLIB_TEST(graph_contains_directed_cycle(a) == true);

        a.add_edge(1,2);

        DLIB_TEST(graph_contains_directed_cycle(a) == true);

        DLIB_TEST(a.node(1).number_of_children() == 2);
        DLIB_TEST(a.node(1).number_of_parents() == 1);
        DLIB_TEST_MSG(a.node(1).parent(0).index() == 1,"")

            DLIB_TEST_MSG(a.node(1).child(0).index() + a.node(1).child(1).index() == 3,"")
            DLIB_TEST(a.node(2).number_of_children() == 0);
        DLIB_TEST(a.node(2).number_of_parents() == 1);
        DLIB_TEST(a.node(2).index() == 2);

        int val = a.node(1).data;
        a.remove_node(1);
        DLIB_TEST(graph_contains_length_one_cycle(a) == false);

        DLIB_TEST(graph_contains_directed_cycle(a) == false);
        DLIB_TEST(graph_contains_undirected_cycle(a) == false);


        DLIB_TEST(a.number_of_nodes() == 3);

        count = 0;
        for (int i = 0; i < 3; ++i)
        {
            count += a.node(i).data;
            DLIB_TEST(a.node(i).number_of_children() == 0);
            DLIB_TEST(a.node(i).number_of_parents() == 0);
            DLIB_TEST(a.node(i).index() == (unsigned int)i);
        }
        DLIB_TEST(count == 9-val);


        val = a.add_node();
        DLIB_TEST(val == 3);
        DLIB_TEST(a.number_of_nodes() == 4);

        for (int i = 0; i < 4; ++i)
        {
            a.node(i).data = i;
            DLIB_TEST(a.node(i).index() == (unsigned int)i);
        }

        for (int i = 0; i < 4; ++i)
        {
            DLIB_TEST(a.node(i).data == i);
            DLIB_TEST(a.node(i).index() == (unsigned int)i);
        }

        a.add_edge(0, 1);
        a.add_edge(0, 2);
        DLIB_TEST(graph_is_connected(a) == false);
        a.add_edge(1, 3);
        DLIB_TEST(graph_is_connected(a) == true);
        a.add_edge(2, 3);
        DLIB_TEST(graph_is_connected(a) == true);
        DLIB_TEST(graph_contains_length_one_cycle(a) == false);

        DLIB_TEST(a.has_edge(0, 1));
        DLIB_TEST(a.has_edge(0, 2));
        DLIB_TEST(a.has_edge(1, 3));
        DLIB_TEST(a.has_edge(2, 3));

        DLIB_TEST(!a.has_edge(1, 0));
        DLIB_TEST(!a.has_edge(2, 0));
        DLIB_TEST(!a.has_edge(3, 1));
        DLIB_TEST(!a.has_edge(3, 2));

        DLIB_TEST(a.node(0).number_of_parents() == 0);
        DLIB_TEST(a.node(0).number_of_children() == 2);

        DLIB_TEST(a.node(1).number_of_parents() == 1);
        DLIB_TEST(a.node(1).number_of_children() == 1);
        DLIB_TEST(a.node(1).child(0).index() == 3);
        DLIB_TEST(a.node(1).parent(0).index() == 0);

        DLIB_TEST(a.node(2).number_of_parents() == 1);
        DLIB_TEST(a.node(2).number_of_children() == 1);
        DLIB_TEST(a.node(2).child(0).index() == 3);
        DLIB_TEST(a.node(2).parent(0).index() == 0);

        DLIB_TEST(a.node(3).number_of_parents() == 2);
        DLIB_TEST(a.node(3).number_of_children() == 0);

        DLIB_TEST(graph_contains_directed_cycle(a) == false);
        DLIB_TEST(graph_contains_undirected_cycle(a) == true);

        a.remove_edge(0,1);

        DLIB_TEST(graph_contains_directed_cycle(a) == false);

        DLIB_TEST(!a.has_edge(0, 1));
        DLIB_TEST(a.has_edge(0, 2));
        DLIB_TEST(a.has_edge(1, 3));
        DLIB_TEST(a.has_edge(2, 3));

        DLIB_TEST(!a.has_edge(1, 0));
        DLIB_TEST(!a.has_edge(2, 0));
        DLIB_TEST(!a.has_edge(3, 1));
        DLIB_TEST(!a.has_edge(3, 2));


        DLIB_TEST(a.node(0).number_of_parents() == 0);
        DLIB_TEST(a.node(0).number_of_children() == 1);

        DLIB_TEST(a.node(1).number_of_parents() == 0);
        DLIB_TEST(a.node(1).number_of_children() == 1);
        DLIB_TEST(a.node(1).child(0).index() == 3);

        DLIB_TEST(a.node(2).number_of_parents() == 1);
        DLIB_TEST(a.node(2).number_of_children() == 1);
        DLIB_TEST(a.node(2).child(0).index() == 3);
        DLIB_TEST(a.node(2).parent(0).index() == 0);

        DLIB_TEST(a.node(3).number_of_parents() == 2);
        DLIB_TEST(a.node(3).number_of_children() == 0);

        for (int i = 0; i < 4; ++i)
        {
            DLIB_TEST(a.node(i).data == i);
            DLIB_TEST(a.node(i).index() == (unsigned int)i);
        }



        swap(a,b);

        DLIB_TEST(a.number_of_nodes() == 0);
        DLIB_TEST(b.number_of_nodes() == 4);
        DLIB_TEST(b.node(0).number_of_parents() == 0);
        DLIB_TEST(b.node(0).number_of_children() == 1);

        DLIB_TEST(b.node(1).number_of_parents() == 0);
        DLIB_TEST(b.node(1).number_of_children() == 1);
        DLIB_TEST(b.node(1).child(0).index() == 3);

        DLIB_TEST(b.node(2).number_of_parents() == 1);
        DLIB_TEST(b.node(2).number_of_children() == 1);
        DLIB_TEST(b.node(2).child(0).index() == 3);
        DLIB_TEST(b.node(2).parent(0).index() == 0);

        DLIB_TEST(b.node(3).number_of_parents() == 2);
        DLIB_TEST(b.node(3).number_of_children() == 0);
        b.node(0).child_edge(0) = static_cast<unsigned short>(b.node(0).child(0).index()+1);
        b.node(1).child_edge(0) = static_cast<unsigned short>(b.node(1).child(0).index()+1);
        b.node(2).child_edge(0) = static_cast<unsigned short>(b.node(2).child(0).index()+1);

        DLIB_TEST_MSG(b.node(0).child_edge(0) == b.node(0).child(0).index()+1,
                     b.node(0).child_edge(0) << "  " << b.node(0).child(0).index()+1);
        DLIB_TEST_MSG(b.node(1).child_edge(0) == b.node(1).child(0).index()+1,
                     b.node(1).child_edge(0) << "  " << b.node(1).child(0).index()+1);
        DLIB_TEST_MSG(b.node(2).child_edge(0) == b.node(2).child(0).index()+1,
                     b.node(2).child_edge(0) << "  " << b.node(2).child(0).index()+1);

        DLIB_TEST_MSG(b.node(2).parent_edge(0) == 2+1,
                     b.node(2).parent_edge(0) << "  " << 2+1);
        DLIB_TEST_MSG(b.node(3).parent_edge(0) == 3+1,
                     b.node(3).parent_edge(0) << "  " << 3+1);
        DLIB_TEST_MSG(b.node(3).parent_edge(1) == 3+1,
                     b.node(3).parent_edge(1) << "  " << 3+1);

        ostringstream sout;

        serialize(b, sout);

        istringstream sin(sout.str());

        a.set_number_of_nodes(20);
        DLIB_TEST(a.number_of_nodes() == 20);
        deserialize(a, sin);
        DLIB_TEST(a.number_of_nodes() == 4);

        DLIB_TEST(!a.has_edge(0, 1));
        DLIB_TEST(a.has_edge(0, 2));
        DLIB_TEST(a.has_edge(1, 3));
        DLIB_TEST(a.has_edge(2, 3));

        DLIB_TEST(!a.has_edge(1, 0));
        DLIB_TEST(!a.has_edge(2, 0));
        DLIB_TEST(!a.has_edge(3, 1));
        DLIB_TEST(!a.has_edge(3, 2));

        DLIB_TEST_MSG(a.node(0).child_edge(0) == a.node(0).child(0).index()+1,
                     a.node(0).child_edge(0) << "  " << a.node(0).child(0).index()+1);
        DLIB_TEST_MSG(a.node(1).child_edge(0) == a.node(1).child(0).index()+1,
                     a.node(1).child_edge(0) << "  " << a.node(1).child(0).index()+1);
        DLIB_TEST_MSG(a.node(2).child_edge(0) == a.node(2).child(0).index()+1,
                     a.node(2).child_edge(0) << "  " << a.node(2).child(0).index()+1);
        DLIB_TEST_MSG(a.node(2).parent_edge(0) == 2+1,
                     a.node(2).parent_edge(0) << "  " << 2+1);
        DLIB_TEST_MSG(a.node(3).parent_edge(0) == 3+1,
                     a.node(3).parent_edge(0) << "  " << 3+1);
        DLIB_TEST_MSG(a.node(3).parent_edge(1) == 3+1,
                     a.node(3).parent_edge(1) << "  " << 3+1);



        for (int i = 0; i < 4; ++i)
        {
            DLIB_TEST(a.node(i).data == i);
            DLIB_TEST(a.node(i).index() == (unsigned int)i);
        }


        DLIB_TEST(graph_contains_undirected_cycle(a) == false);

        DLIB_TEST(b.number_of_nodes() == 4);
        DLIB_TEST(b.node(0).number_of_parents() == 0);
        DLIB_TEST(b.node(0).number_of_children() == 1);

        DLIB_TEST(b.node(1).number_of_parents() == 0);
        DLIB_TEST(b.node(1).number_of_children() == 1);
        DLIB_TEST(b.node(1).child(0).index() == 3);

        DLIB_TEST(b.node(2).number_of_parents() == 1);
        DLIB_TEST(b.node(2).number_of_children() == 1);
        DLIB_TEST(b.node(2).child(0).index() == 3);
        DLIB_TEST(b.node(2).parent(0).index() == 0);

        DLIB_TEST(b.node(3).number_of_parents() == 2);
        DLIB_TEST(b.node(3).number_of_children() == 0);


        DLIB_TEST(a.number_of_nodes() == 4);
        DLIB_TEST(a.node(0).number_of_parents() == 0);
        DLIB_TEST(a.node(0).number_of_children() == 1);

        DLIB_TEST(a.node(1).number_of_parents() == 0);
        DLIB_TEST(a.node(1).number_of_children() == 1);
        DLIB_TEST(a.node(1).child(0).index() == 3);

        DLIB_TEST(a.node(2).number_of_parents() == 1);
        DLIB_TEST(a.node(2).number_of_children() == 1);
        DLIB_TEST(a.node(2).child(0).index() == 3);
        DLIB_TEST(a.node(2).parent(0).index() == 0);

        DLIB_TEST(a.node(3).number_of_parents() == 2);
        DLIB_TEST(a.node(3).number_of_children() == 0);

        DLIB_TEST(a.number_of_nodes() == 4);
        a.clear();
        DLIB_TEST(a.number_of_nodes() == 0);


        DLIB_TEST(graph_contains_directed_cycle(a) == false);

        a.set_number_of_nodes(10);

        DLIB_TEST(graph_contains_directed_cycle(a) == false);

        a.add_edge(0,1);
        a.add_edge(1,2);
        a.add_edge(1,3);
        a.add_edge(2,4);
        a.add_edge(3,4);
        a.add_edge(4,5);
        a.add_edge(5,1);

        DLIB_TEST(graph_contains_directed_cycle(a) == true);
        DLIB_TEST(graph_contains_undirected_cycle(a) == true);

        a.remove_edge(5,1);

        DLIB_TEST(graph_contains_undirected_cycle(a) == true);
        DLIB_TEST(graph_contains_directed_cycle(a) == false);
        a.add_edge(7,8);
        DLIB_TEST(graph_contains_directed_cycle(a) == false);
        a.add_edge(8,7);
        DLIB_TEST(graph_contains_directed_cycle(a) == true);
        DLIB_TEST(graph_contains_undirected_cycle(a) == true);


        a.clear();
            /*
                Make a graph that looks like:
                0     1
                 \   /
                   2
                   |
                   3
            */
        a.set_number_of_nodes(4);
        a.add_edge(0,2);
        a.add_edge(1,2);
        a.add_edge(2,3);
        for (unsigned long i = 0; i < 4; ++i)
            a.node(i).data = i;

        graph<int>::kernel_1a_c g;
        create_moral_graph(a,g);

        graph<dlib::set<unsigned long>::compare_1b_c, dlib::set<unsigned long>::compare_1a_c>::kernel_1a_c join_tree;
        dlib::set<dlib::set<unsigned long>::compare_1b_c>::kernel_1b_c sos;

        create_join_tree(g, join_tree);
        DLIB_TEST(is_join_tree(g, join_tree));
        DLIB_TEST(join_tree.number_of_nodes() == 2);
        DLIB_TEST(graph_contains_undirected_cycle(join_tree) == false);
        DLIB_TEST(graph_is_connected(join_tree) == true);

        unsigned long temp;
        triangulate_graph_and_find_cliques(g,sos);

        temp = 2; s.add(temp);
        temp = 3; s.add(temp);
        DLIB_TEST(sos.is_member(s));
        s.clear();
        temp = 0; s.add(temp);
        temp = 1; s.add(temp);
        temp = 2; s.add(temp);
        DLIB_TEST(sos.is_member(s));
        DLIB_TEST(sos.size() == 2);
        DLIB_TEST(sos.is_member(join_tree.node(0).data));
        DLIB_TEST(sos.is_member(join_tree.node(1).data));


        s.clear();
        temp = 0; s.add(temp);
        DLIB_TEST(is_clique(g,s) == true);
        DLIB_TEST(is_maximal_clique(g,s) == false);
        temp = 3; s.add(temp);
        DLIB_TEST(is_clique(g,s) == false);
        s.destroy(3);
        DLIB_TEST(is_clique(g,s) == true);
        temp = 2; s.add(temp);
        DLIB_TEST(is_clique(g,s) == true);
        DLIB_TEST(is_maximal_clique(g,s) == false);
        temp = 1; s.add(temp);
        DLIB_TEST(is_clique(g,s) == true);
        DLIB_TEST(is_maximal_clique(g,s) == true);
        s.clear();
        DLIB_TEST(is_clique(g,s) == true);
        temp = 3; s.add(temp);
        DLIB_TEST(is_clique(g,s) == true);
        temp = 2; s.add(temp);
        DLIB_TEST(is_clique(g,s) == true);
        DLIB_TEST(is_maximal_clique(g,s) == true);


        DLIB_TEST(a.number_of_nodes() == 4);
        DLIB_TEST(g.number_of_nodes() == 4);
        for (unsigned long i = 0; i < 4; ++i)
            DLIB_TEST( a.node(i).data == (int)i);
        DLIB_TEST(g.has_edge(0,1));
        DLIB_TEST(g.has_edge(0,2));
        DLIB_TEST(g.has_edge(1,2));
        DLIB_TEST(g.has_edge(3,2));
        DLIB_TEST(g.has_edge(0,3) == false);
        DLIB_TEST(g.has_edge(1,3) == false);

    }


    void test_copy()
    {
        {
            directed_graph<int,int>::kernel_1a_c a,b;

            a.set_number_of_nodes(3);
            a.node(0).data = 1;
            a.node(1).data = 2;
            a.node(2).data = 3;
            a.add_edge(0,1);
            a.add_edge(1,0);
            a.add_edge(0,2);
            edge(a,0,1) = 4;
            edge(a,1,0) = 3;
            edge(a,0,2) = 5;

            a.add_edge(0,0);
            edge(a,0,0) = 9;
            copy_graph(a, b);

            DLIB_TEST(b.number_of_nodes() == 3);
            DLIB_TEST(b.node(0).data == 1);
            DLIB_TEST(b.node(1).data == 2);
            DLIB_TEST(b.node(2).data == 3);
            DLIB_TEST(edge(b,0,1) == 4);
            DLIB_TEST(edge(b,1,0) == 3);
            DLIB_TEST(edge(b,0,2) == 5);
            DLIB_TEST(edge(b,0,0) == 9);
        }
        {
            directed_graph<int,int>::kernel_1a_c a,b;

            a.set_number_of_nodes(4);
            a.node(0).data = 1;
            a.node(1).data = 2;
            a.node(2).data = 3;
            a.node(3).data = 8;
            a.add_edge(0,1);
            a.add_edge(0,2);
            a.add_edge(2,3);
            a.add_edge(3,2);
            edge(a,0,1) = 4;
            edge(a,0,2) = 5;
            edge(a,2,3) = 6;
            edge(a,3,2) = 3;

            copy_graph(a, b);

            DLIB_TEST(b.number_of_nodes() == 4);
            DLIB_TEST(b.node(0).data == 1);
            DLIB_TEST(b.node(1).data == 2);
            DLIB_TEST(b.node(2).data == 3);
            DLIB_TEST(b.node(3).data == 8);
            DLIB_TEST(edge(b,0,1) == 4);
            DLIB_TEST(edge(b,0,2) == 5);
            DLIB_TEST(edge(b,2,3) == 6);
            DLIB_TEST(edge(b,3,2) == 3);
        }
    }



    class directed_graph_tester : public tester
    {
        /*!
            WHAT THIS OBJECT REPRESENTS
                This object represents a test for the directed_graph object.  When it is constructed
                it adds itself into the testing framework.  The command line switch is
                specified as test_directed_graph by passing that string to the tester constructor.
        !*/
    public:
        directed_graph_tester (
        ) :
            tester ("test_directed_graph",
                    "Runs tests on the directed_graph component.")
        {}

        void perform_test (
        )
        {
            test_copy();

            dlog << LINFO << "testing kernel_1a_c";
            directed_graph_test<directed_graph<int,unsigned short>::kernel_1a_c>();

            dlog << LINFO << "testing kernel_1a";
            directed_graph_test<directed_graph<int,unsigned short>::kernel_1a>();
        }
    } a;


}


