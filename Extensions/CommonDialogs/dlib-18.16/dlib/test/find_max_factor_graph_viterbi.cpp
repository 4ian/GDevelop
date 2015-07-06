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

    logger dlog("test.find_max_factor_graph_viterbi");

// ----------------------------------------------------------------------------------------

    dlib::rand rnd;

// ----------------------------------------------------------------------------------------

    template <
        unsigned long O,
        unsigned long NS,
        unsigned long num_nodes,
        bool all_negative 
        >
    class map_problem
    {
    public:
        unsigned long order() const { return O; }
        unsigned long num_states() const { return NS; }

        map_problem()
        {
            data = randm(number_of_nodes(),(long)std::pow(num_states(),(double)order()+1), rnd);
            if (all_negative)
                data = -data;
        }

        unsigned long number_of_nodes (
        ) const
        {
            return num_nodes;
        }

        template <
            typename EXP 
            >
        double factor_value (
            unsigned long node_id,
            const matrix_exp<EXP>& node_states
        ) const
        {
            if (node_states.size() == 1)
                return data(node_id, node_states(0));
            else if (node_states.size() == 2)
                return data(node_id, node_states(0) + node_states(1)*NS);
            else if (node_states.size() == 3)
                return data(node_id, (node_states(0) + node_states(1)*NS)*NS + node_states(2));
            else 
                return data(node_id, ((node_states(0) + node_states(1)*NS)*NS + node_states(2))*NS + node_states(3));
        }

        matrix<double> data;
    };


// ----------------------------------------------------------------------------------------

    template <
        typename map_problem
        >
    void brute_force_find_max_factor_graph_viterbi (
        const map_problem& prob,
        std::vector<unsigned long>& map_assignment
    )
    {
        using namespace dlib::impl;
        const int order = prob.order();
        const int num_states = prob.num_states();

        map_assignment.resize(prob.number_of_nodes());
        double best_score = -std::numeric_limits<double>::infinity();
        matrix<unsigned long,1,0> node_states;
        node_states.set_size(prob.number_of_nodes());
        node_states = 0;
        do
        {
            double score = 0;
            for (unsigned long i = 0; i < prob.number_of_nodes(); ++i)
            {
                score += prob.factor_value(i, (colm(node_states,range(i,i-std::min<int>(order,i)))));
            }

            if (score > best_score)
            {
                for (unsigned long i = 0; i < map_assignment.size(); ++i)
                    map_assignment[i] = node_states(i);
                best_score = score;
            }

        } while(advance_state(node_states,num_states));

    }

// ----------------------------------------------------------------------------------------

    template <
        unsigned long order,
        unsigned long num_states,
        unsigned long num_nodes,
        bool all_negative
        >
    void do_test_()
    {
        dlog << LINFO << "order: "<< order 
                      << "  num_states:   " << num_states
                      << "  num_nodes:    " << num_nodes
                      << "  all_negative: " << all_negative;

        for (int i = 0; i < 25; ++i)
        {
            print_spinner();
            map_problem<order,num_states,num_nodes,all_negative> prob;
            std::vector<unsigned long> assign, assign2;
            brute_force_find_max_factor_graph_viterbi(prob, assign);
            find_max_factor_graph_viterbi(prob, assign2);

            DLIB_TEST_MSG(mat(assign) == mat(assign2),
                          trans(mat(assign))
                          << trans(mat(assign2))
                          );
        }
    }

    template <
        unsigned long order,
        unsigned long num_states,
        unsigned long num_nodes
        >
    void do_test()
    {
        do_test_<order,num_states,num_nodes,false>();
    }

    template <
        unsigned long order,
        unsigned long num_states,
        unsigned long num_nodes
        >
    void do_test_negative()
    {
        do_test_<order,num_states,num_nodes,true>();
    }

// ----------------------------------------------------------------------------------------

    class test_find_max_factor_graph_viterbi : public tester
    {
    public:
        test_find_max_factor_graph_viterbi (
        ) :
            tester ("test_find_max_factor_graph_viterbi",
                    "Runs tests on the find_max_factor_graph_viterbi routine.")
        {}

        void perform_test (
        )
        {
            do_test<1,3,0>();
            do_test<1,3,1>();
            do_test<1,3,2>();
            do_test<0,3,2>();
            do_test_negative<0,3,2>();

            do_test<1,3,8>();
            do_test<2,3,7>();
            do_test_negative<2,3,7>();
            do_test<3,3,8>();
            do_test<4,3,8>();
            do_test_negative<4,3,8>();
            do_test<0,3,8>();
            do_test<4,3,1>();
            do_test<4,3,0>();

            do_test<3,2,1>();
            do_test<3,2,0>();
            do_test<3,2,2>();
            do_test<2,2,1>();
            do_test_negative<3,2,1>();
            do_test_negative<3,2,0>();
            do_test_negative<3,2,2>();
            do_test_negative<2,2,1>();

            do_test<0,3,0>();
            do_test<1,2,8>();
            do_test<2,2,7>();
            do_test<3,2,8>();
            do_test<0,2,8>();

            do_test<1,1,8>();
            do_test<2,1,8>();
            do_test<3,1,8>();
            do_test<0,1,8>();
        }
    } a;

}




