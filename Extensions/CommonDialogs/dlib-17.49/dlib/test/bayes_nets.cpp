// Copyright (C) 2007  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.


#include "dlib/graph_utils.h"
#include "dlib/graph.h"
#include "dlib/directed_graph.h"
#include "dlib/bayes_utils.h"
#include "dlib/set.h"
#include <sstream>
#include <string>
#include <cstdlib>
#include <ctime>

#include "tester.h"

namespace  
{
    using namespace test;
    using namespace dlib;
    using namespace std;

    logger dlog("test.bayes_nets");
    enum nodes
    {
        A, T, S, L, O, B, D, X
    };

    template <typename gtype>
    void setup_simple_network (
        gtype& bn
    )
    {
        /*
               A
              / \
             T   S
        */

        using namespace bayes_node_utils;

        bn.set_number_of_nodes(3);
        bn.add_edge(A, T);
        bn.add_edge(A, S);


        set_node_num_values(bn, A, 2);
        set_node_num_values(bn, T, 2);
        set_node_num_values(bn, S, 2);

        assignment parents;

        // set probabilities for node A
        set_node_probability(bn, A, 1, parents, 0.1);
        set_node_probability(bn, A, 0, parents, 1-0.1);

        // set probabilities for node T
        parents.add(A, 1);
        set_node_probability(bn, T, 1, parents, 0.5);
        set_node_probability(bn, T, 0, parents, 1-0.5);
        parents[A] = 0;
        set_node_probability(bn, T, 1, parents, 0.5);
        set_node_probability(bn, T, 0, parents, 1-0.5);

        // set probabilities for node S
        parents[A] = 1;
        set_node_probability(bn, S, 1, parents, 0.5);
        set_node_probability(bn, S, 0, parents, 1-0.5);
        parents[A] = 0;
        set_node_probability(bn, S, 1, parents, 0.5);
        set_node_probability(bn, S, 0, parents, 1-0.5);


        // test the serialization code here by pushing this network though it
        ostringstream sout;
        serialize(bn, sout);
        bn.clear();
        DLIB_TEST(bn.number_of_nodes() == 0);
        istringstream sin(sout.str());
        deserialize(bn, sin);
        DLIB_TEST(bn.number_of_nodes() == 3);
    }


    template <typename gtype>
    void setup_dyspnea_network (
        gtype& bn,
        bool deterministic_o_node = true
    )
    {
        /*
            This is the example network used by David Zaret in his
            reasoning under uncertainty class at Johns Hopkins
        */

        using namespace bayes_node_utils;

        bn.set_number_of_nodes(8);
        bn.add_edge(A, T);
        bn.add_edge(T, O);

        bn.add_edge(O, D);
        bn.add_edge(O, X);

        bn.add_edge(S, B);
        bn.add_edge(S, L);

        bn.add_edge(L, O);
        bn.add_edge(B, D);


        set_node_num_values(bn, A, 2);
        set_node_num_values(bn, T, 2);
        set_node_num_values(bn, O, 2);
        set_node_num_values(bn, X, 2);
        set_node_num_values(bn, L, 2);
        set_node_num_values(bn, S, 2);
        set_node_num_values(bn, B, 2);
        set_node_num_values(bn, D, 2);

        assignment parents;

        // set probabilities for node A
        set_node_probability(bn, A, 1, parents, 0.01);
        set_node_probability(bn, A, 0, parents, 1-0.01);

        // set probabilities for node S
        set_node_probability(bn, S, 1, parents, 0.5);
        set_node_probability(bn, S, 0, parents, 1-0.5);

        // set probabilities for node T
        parents.add(A, 1);
        set_node_probability(bn, T, 1, parents, 0.05);
        set_node_probability(bn, T, 0, parents, 1-0.05);
        parents[A] = 0;
        set_node_probability(bn, T, 1, parents, 0.01);
        set_node_probability(bn, T, 0, parents, 1-0.01);

        // set probabilities for node L
        parents.clear();
        parents.add(S,1);
        set_node_probability(bn, L, 1, parents, 0.1);
        set_node_probability(bn, L, 0, parents, 1-0.1);
        parents[S] = 0;
        set_node_probability(bn, L, 1, parents, 0.01);
        set_node_probability(bn, L, 0, parents, 1-0.01);


        // set probabilities for node B
        parents[S] = 1;
        set_node_probability(bn, B, 1, parents, 0.6);
        set_node_probability(bn, B, 0, parents, 1-0.6);
        parents[S] = 0;
        set_node_probability(bn, B, 1, parents, 0.3);
        set_node_probability(bn, B, 0, parents, 1-0.3);


        // set probabilities for node O
        double v;
        if (deterministic_o_node)
            v = 1;
        else
            v = 0.99;

        parents.clear();
        parents.add(T,1);
        parents.add(L,1);
        set_node_probability(bn, O, 1, parents, v);
        set_node_probability(bn, O, 0, parents, 1-v);
        parents[T] = 0; parents[L] = 1;
        set_node_probability(bn, O, 1, parents, v);
        set_node_probability(bn, O, 0, parents, 1-v);
        parents[T] = 1; parents[L] = 0;
        set_node_probability(bn, O, 1, parents, v);
        set_node_probability(bn, O, 0, parents, 1-v);
        parents[T] = 0; parents[L] = 0;
        set_node_probability(bn, O, 1, parents, 1-v);
        set_node_probability(bn, O, 0, parents, v);


        // set probabilities for node D
        parents.clear();
        parents.add(O,1);
        parents.add(B,1);
        set_node_probability(bn, D, 1, parents, 0.9);
        set_node_probability(bn, D, 0, parents, 1-0.9);
        parents[O] = 1; parents[B] = 0;
        set_node_probability(bn, D, 1, parents, 0.7);
        set_node_probability(bn, D, 0, parents, 1-0.7);
        parents[O] = 0; parents[B] = 1;
        set_node_probability(bn, D, 1, parents, 0.8);
        set_node_probability(bn, D, 0, parents, 1-0.8);
        parents[O] = 0; parents[B] = 0;
        set_node_probability(bn, D, 1, parents, 0.1);
        set_node_probability(bn, D, 0, parents, 1-0.1);


        // set probabilities for node X
        parents.clear();
        parents.add(O,1);
        set_node_probability(bn, X, 1, parents, 0.98);
        set_node_probability(bn, X, 0, parents, 1-0.98);
        parents[O] = 0;
        set_node_probability(bn, X, 1, parents, 0.05);
        set_node_probability(bn, X, 0, parents, 1-0.05);


        // test the serialization code here by pushing this network though it
        ostringstream sout;
        serialize(bn, sout);
        bn.clear();
        DLIB_TEST(bn.number_of_nodes() == 0);
        istringstream sin(sout.str());
        deserialize(bn, sin);
        DLIB_TEST(bn.number_of_nodes() == 8);
    }


    void bayes_nets_test (
    )
        /*!
            ensures
                - runs tests on the bayesian network objects and functions for compliance with the specs 
        !*/
    {        

        print_spinner();

        directed_graph<bayes_node>::kernel_1a_c bn;
        setup_dyspnea_network(bn);

        using namespace bayes_node_utils;


        graph<dlib::set<unsigned long>::compare_1b_c, dlib::set<unsigned long>::compare_1b_c>::kernel_1a_c join_tree;

        create_moral_graph(bn, join_tree);
        create_join_tree(join_tree, join_tree);

        bayesian_network_join_tree solution(bn, join_tree);

        matrix<double,1,2> dist;

        dist = solution.probability(A);
        DLIB_TEST(abs(sum(dist) - 1.0) < 1e-5);
        DLIB_TEST(abs(dist(1) - 0.01 ) < 1e-5);

        dist = solution.probability(T);
        DLIB_TEST(abs(sum(dist) - 1.0) < 1e-5);
        DLIB_TEST(abs(dist(1) - 0.0104) < 1e-5);

        dist = solution.probability(O);
        DLIB_TEST(abs(sum(dist) - 1.0) < 1e-5);
        DLIB_TEST(abs(dist(1) - 0.064828) < 1e-5);

        dist = solution.probability(X);
        DLIB_TEST(abs(sum(dist) - 1.0) < 1e-5);
        DLIB_TEST(abs(dist(1) - 0.11029004) < 1e-5);

        dist = solution.probability(L);
        DLIB_TEST(abs(sum(dist) - 1.0) < 1e-5);
        DLIB_TEST(abs(dist(1) - 0.055) < 1e-5);

        dist = solution.probability(S);
        DLIB_TEST(abs(sum(dist) - 1.0) < 1e-5);
        DLIB_TEST(abs(dist(1) - 0.5) < 1e-5);

        dist = solution.probability(B);
        DLIB_TEST(abs(sum(dist) - 1.0) < 1e-5);
        DLIB_TEST(abs(dist(1) - 0.4499999) < 1e-5);

        dist = solution.probability(D);
        DLIB_TEST(abs(sum(dist) - 1.0) < 1e-5);
        DLIB_TEST(abs(dist(1) - 0.4359706 ) < 1e-5);

        // now lets modify the probabilities of the bayesian network by making O 
        // not a deterministic node anymore but otherwise leave the network alone
        setup_dyspnea_network(bn, false);

        set_node_value(bn, A, 1);
        set_node_value(bn, X, 1);
        set_node_value(bn, S, 1);
        // lets also make some of these nodes evidence nodes
        set_node_as_evidence(bn, A);
        set_node_as_evidence(bn, X);
        set_node_as_evidence(bn, S);

        // reload the solution now that we have changed the probabilities of node O
        bayesian_network_join_tree(bn, join_tree).swap(solution);
        DLIB_TEST(solution.number_of_nodes() == bn.number_of_nodes());

        dist = solution.probability(A);
        DLIB_TEST(abs(sum(dist) - 1.0) < 1e-5);
        DLIB_TEST(abs(dist(1) - 1.0 ) < 1e-5);

        dist = solution.probability(T);
        DLIB_TEST(abs(sum(dist) - 1.0) < 1e-5);
        DLIB_TEST(abs(dist(1) - 0.253508694039 ) < 1e-5);

        dist = solution.probability(O);
        DLIB_TEST(abs(sum(dist) - 1.0) < 1e-5);
        DLIB_TEST(abs(dist(1) - 0.77856184024 ) < 1e-5);

        dist = solution.probability(X);
        DLIB_TEST(abs(sum(dist) - 1.0) < 1e-5);
        DLIB_TEST(abs(dist(1) - 1.0 ) < 1e-5);

        dist = solution.probability(L);
        DLIB_TEST(abs(sum(dist) - 1.0) < 1e-5);
        DLIB_TEST(abs(dist(1) - 0.5070173880 ) < 1e-5);

        dist = solution.probability(S);
        DLIB_TEST(abs(sum(dist) - 1.0) < 1e-5);
        DLIB_TEST(abs(dist(1) - 1.0 ) < 1e-5);

        dist = solution.probability(B);
        DLIB_TEST(abs(sum(dist) - 1.0) < 1e-5);
        DLIB_TEST(abs(dist(1) - 0.6  ) < 1e-5);

        dist = solution.probability(D);
        DLIB_TEST(abs(sum(dist) - 1.0) < 1e-5);
        DLIB_TEST(abs(dist(1) - 0.7535685520 ) < 1e-5);


        // now lets test the bayesian_network_gibbs_sampler 
        set_node_value(bn, A, 1);
        set_node_value(bn, T, 1);
        set_node_value(bn, O, 1);
        set_node_value(bn, X, 1);
        set_node_value(bn, S, 1);
        set_node_value(bn, L, 1);
        set_node_value(bn, B, 1);
        set_node_value(bn, D, 1);

        bayesian_network_gibbs_sampler sampler;
        matrix<double,1,8> counts;
        set_all_elements(counts, 0);
        const unsigned long rounds = 200000;
        for (unsigned long i = 0; i < rounds; ++i)
        {
            sampler.sample_graph(bn);

            for (long c = 0; c < counts.nc(); ++c)
            {
                if (node_value(bn, c) == 1)
                    counts(c) += 1;
            }

            if ((i&0x3FF) == 0)
            {
                print_spinner();
            }
        }

        counts /= rounds;

        DLIB_TEST(abs(counts(A) - 1.0 ) < 1e-2);
        DLIB_TEST(abs(counts(T) - 0.253508694039 ) < 1e-2);
        DLIB_TEST_MSG(abs(counts(O) - 0.77856184024 ) < 1e-2,abs(counts(O) - 0.77856184024 ) );
        DLIB_TEST(abs(counts(X) - 1.0 ) < 1e-2);
        DLIB_TEST(abs(counts(L) - 0.5070173880 ) < 1e-2);
        DLIB_TEST(abs(counts(S) - 1.0 ) < 1e-2);
        DLIB_TEST(abs(counts(B) - 0.6  ) < 1e-2);
        DLIB_TEST(abs(counts(D) - 0.7535685520 ) < 1e-2);


        setup_simple_network(bn);
        create_moral_graph(bn, join_tree);
        create_join_tree(join_tree, join_tree);
        bayesian_network_join_tree(bn, join_tree).swap(solution);
        DLIB_TEST(solution.number_of_nodes() == bn.number_of_nodes());

        dist = solution.probability(A);
        DLIB_TEST(abs(sum(dist) - 1.0) < 1e-5);
        DLIB_TEST(abs(dist(1) - 0.1 ) < 1e-5);

        dist = solution.probability(T);
        DLIB_TEST(abs(sum(dist) - 1.0) < 1e-5);
        DLIB_TEST(abs(dist(1) - 0.5 ) < 1e-5);

        dist = solution.probability(S);
        DLIB_TEST(abs(sum(dist) - 1.0) < 1e-5);
        DLIB_TEST(abs(dist(1) - 0.5 ) < 1e-5);


    }




    class bayes_nets_tester : public tester
    {
    public:
        bayes_nets_tester (
        ) :
            tester ("test_bayes_nets",
                    "Runs tests on the bayes_nets objects and functions.")
        {}

        void perform_test (
        )
        {
            bayes_nets_test();
        }
    } a;

}




