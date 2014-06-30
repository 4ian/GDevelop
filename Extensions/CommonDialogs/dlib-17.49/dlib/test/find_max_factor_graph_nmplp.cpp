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

    logger dlog("test.find_max_factor_graph_nmplp");

// ----------------------------------------------------------------------------------------

    class map_problem 
    {
        /*
            This is a simple 8 node problem with two cycles in it.
        */

    public:


        struct node_iterator
        {
            node_iterator() {}
            node_iterator(unsigned long nid_): nid(nid_) {}
            bool operator== (const node_iterator& item) const { return item.nid == nid; }
            bool operator!= (const node_iterator& item) const { return item.nid != nid; }

            node_iterator& operator++()
            {
                ++nid;
                return *this;
            }

            unsigned long nid;
        };

        struct neighbor_iterator
        {
            neighbor_iterator() : count(0) {}

            bool operator== (const neighbor_iterator& item) const { return item.node_id() == node_id(); }
            bool operator!= (const neighbor_iterator& item) const { return item.node_id() != node_id(); }
            neighbor_iterator& operator++() 
            {
                ++count;
                return *this;
            }

            unsigned long node_id () const
            {
                if (home_node < 4)
                {
                    if (count == 0)
                        return (home_node + 4 + 1)%4;
                    else if (count == 1)
                        return (home_node + 4 - 1)%4;
                    else
                        return 8; // one past the end
                }
                else
                {
                    if (count == 0)
                        return (home_node + 4 + 1)%4 + 4;
                    else if (count == 1)
                        return (home_node + 4 - 1)%4 + 4;
                    else
                        return 8; // one past the end
                }
            }

            unsigned long home_node;
            unsigned long count;
        };

        unsigned long number_of_nodes (
        ) const
        {
            return 8;
        }

        node_iterator begin(
        ) const
        {
            node_iterator temp;
            temp.nid = 0;
            return temp;
        }

        node_iterator end(
        ) const
        {
            node_iterator temp;
            temp.nid = 8;
            return temp;
        }

        neighbor_iterator begin(
            const node_iterator& it
        ) const
        {
            neighbor_iterator temp;
            temp.home_node = it.nid;
            return temp;
        }

        neighbor_iterator begin(
            const neighbor_iterator& it
        ) const
        {
            neighbor_iterator temp;
            temp.home_node = it.node_id();
            return temp;
        }

        neighbor_iterator end(
            const node_iterator& 
        ) const
        {
            neighbor_iterator temp;
            temp.home_node = 8;
            temp.count = 8;
            return temp;
        }

        neighbor_iterator end(
            const neighbor_iterator& 
        ) const
        {
            neighbor_iterator temp;
            temp.home_node = 8;
            temp.count = 8;
            return temp;
        }


        unsigned long node_id (
            const node_iterator& it
        ) const
        {
            return it.nid;
        }

        unsigned long node_id (
            const neighbor_iterator& it
        ) const
        {
            return it.node_id();
        }


        unsigned long num_states (
            const node_iterator& 
        ) const
        {
            return 2;
        }

        unsigned long num_states (
            const neighbor_iterator& 
        ) const
        {
            return 2;
        }

        double factor_value (const node_iterator& it1, const node_iterator& it2, unsigned long s1, unsigned long s2) const
        { return basic_factor_value(it1.nid, it2.nid, s1, s2); }
        double factor_value (const neighbor_iterator& it1, const node_iterator& it2, unsigned long s1, unsigned long s2) const
        { return basic_factor_value(it1.node_id(), it2.nid, s1, s2); }
        double factor_value (const node_iterator& it1, const neighbor_iterator& it2, unsigned long s1, unsigned long s2) const
        { return basic_factor_value(it1.nid, it2.node_id(), s1, s2); }
        double factor_value (const neighbor_iterator& it1, const neighbor_iterator& it2, unsigned long s1, unsigned long s2) const
        { return basic_factor_value(it1.node_id(), it2.node_id(), s1, s2); }

    private:

        double basic_factor_value (
            unsigned long n1,
            unsigned long n2,
            unsigned long s1,
            unsigned long s2
        ) const
        {
            if (n1 > n2)
            {
                swap(n1,n2);
                swap(s1,s2);
            }

            if (n1 == 0 && n2 == 1)
            {
                if (s1 && s2)   return 100;
                if (!s1 && s2)  return 0;
                if (s1 && !s2)  return 0;
                if (!s1 && !s2) return 0;
            }
            if (n1 == 1 && n2 == 2)
            {
                if (s1 && s2)   return 5;
                if (!s1 && s2)  return 9;
                if (s1 && !s2)  return -100;
                if (!s1 && !s2) return 9;
            }
            if (n1 == 2 && n2 == 3)
            {
                if (s1 && s2)   return 10;
                if (!s1 && s2)  return 0;
                if (s1 && !s2)  return 10;
                if (!s1 && !s2) return 10;
            }
            if (n1 == 0 && n2 == 3)
            {
                if (s1 && s2)   return -5;
                if (!s1 && s2)  return 0;
                if (s1 && !s2)  return 0;
                if (!s1 && !s2) return 0;
            }



            if (n1 == 4 && n2 == 5)
            {
                if (s1 && s2)   return -100;
                if (!s1 && s2)  return 0;
                if (s1 && !s2)  return 0;
                if (!s1 && !s2) return 0;
            }
            if (n1 == 5 && n2 == 6)
            {
                if (s1 && s2)   return -5;
                if (!s1 && s2)  return -9;
                if (s1 && !s2)  return 100;
                if (!s1 && !s2) return -9;
            }
            if (n1 == 6 && n2 == 7)
            {
                if (s1 && s2)   return -10;
                if (!s1 && s2)  return 0;
                if (s1 && !s2)  return -10;
                if (!s1 && !s2) return -10;
            }
            if (n1 == 4 && n2 == 7)
            {
                if (s1 && s2)   return 5;
                if (!s1 && s2)  return 0;
                if (s1 && !s2)  return 0;
                if (!s1 && !s2) return 0;
            }

            DLIB_CASSERT(false, "n1: "<< n1 << "  n2: "<< n2 << "  s1: "<< s1 << "  s2: "<< s2);
            return 0;
        }

    };

// ----------------------------------------------------------------------------------------

    dlib::rand rnd;

    class map_problem2 
    {
        /*
            This is a simple tree structured graph.  In particular, it is a star made
            up of 6 nodes.
        */
    public:
        matrix<double> numbers;

        map_problem2()
        {
            numbers = randm(5,3,rnd);
        }

        struct node_iterator
        {
            node_iterator() {}
            node_iterator(unsigned long nid_): nid(nid_) {}
            bool operator== (const node_iterator& item) const { return item.nid == nid; }
            bool operator!= (const node_iterator& item) const { return item.nid != nid; }

            node_iterator& operator++()
            {
                ++nid;
                return *this;
            }

            unsigned long nid;
        };

        struct neighbor_iterator
        {
            neighbor_iterator() : count(0) {}

            bool operator== (const neighbor_iterator& item) const { return item.node_id() == node_id(); }
            bool operator!= (const neighbor_iterator& item) const { return item.node_id() != node_id(); }
            neighbor_iterator& operator++() 
            {
                ++count;
                return *this;
            }

            unsigned long node_id () const
            {
                if (home_node == 6)
                    return 6;

                if (home_node < 5)
                {
                    // all the nodes are connected to node 5 and nothing else
                    if (count == 0)
                        return 5;
                    else
                        return 6; // the number returned by the end() functions.
                }
                else if (count < 5)
                {
                    return count;
                }
                else
                {
                    return 6;
                }

            }

            unsigned long home_node;
            unsigned long count;
        };

        unsigned long number_of_nodes (
        ) const
        {
            return 6;
        }

        node_iterator begin(
        ) const
        {
            node_iterator temp;
            temp.nid = 0;
            return temp;
        }

        node_iterator end(
        ) const
        {
            node_iterator temp;
            temp.nid = 6;
            return temp;
        }

        neighbor_iterator begin(
            const node_iterator& it
        ) const
        {
            neighbor_iterator temp;
            temp.home_node = it.nid;
            return temp;
        }

        neighbor_iterator begin(
            const neighbor_iterator& it
        ) const
        {
            neighbor_iterator temp;
            temp.home_node = it.node_id();
            return temp;
        }

        neighbor_iterator end(
            const node_iterator& 
        ) const
        {
            neighbor_iterator temp;
            temp.home_node = 6;
            return temp;
        }

        neighbor_iterator end(
            const neighbor_iterator& 
        ) const
        {
            neighbor_iterator temp;
            temp.home_node = 6;
            return temp;
        }


        unsigned long node_id (
            const node_iterator& it
        ) const
        {
            return it.nid;
        }

        unsigned long node_id (
            const neighbor_iterator& it
        ) const
        {
            return it.node_id();
        }


        unsigned long num_states (
            const node_iterator& 
        ) const
        {
            return 3;
        }

        unsigned long num_states (
            const neighbor_iterator& 
        ) const
        {
            return 3;
        }

        double factor_value (const node_iterator& it1, const node_iterator& it2, unsigned long s1, unsigned long s2) const
        { return basic_factor_value(it1.nid, it2.nid, s1, s2); }
        double factor_value (const neighbor_iterator& it1, const node_iterator& it2, unsigned long s1, unsigned long s2) const
        { return basic_factor_value(it1.node_id(), it2.nid, s1, s2); }
        double factor_value (const node_iterator& it1, const neighbor_iterator& it2, unsigned long s1, unsigned long s2) const
        { return basic_factor_value(it1.nid, it2.node_id(), s1, s2); }
        double factor_value (const neighbor_iterator& it1, const neighbor_iterator& it2, unsigned long s1, unsigned long s2) const
        { return basic_factor_value(it1.node_id(), it2.node_id(), s1, s2); }

    private:

        double basic_factor_value (
            unsigned long n1,
            unsigned long n2,
            unsigned long s1,
            unsigned long s2
        ) const
        {
            if (n1 > n2)
            {
                swap(n1,n2);
                swap(s1,s2);
            }


            // basically ignore the other node in this factor.  The node we
            // are ignoring is the center node of this star graph.  So we basically
            // let it always have a value of 0.
            if (s2 == 0)
                return numbers(n1,s1) + 1;
            else
                return numbers(n1,s1);
        }

    };

// ----------------------------------------------------------------------------------------

    template <typename map_problem>
    double find_total_score (
        const map_problem& prob,
        const std::vector<unsigned long>& map_assignment
    )
    {
        typedef typename map_problem::node_iterator node_iterator;
        typedef typename map_problem::neighbor_iterator neighbor_iterator;

        double score = 0;
        for (node_iterator i = prob.begin(); i != prob.end(); ++i)
        {
            const unsigned long id_i = prob.node_id(i);
            for (neighbor_iterator j = prob.begin(i); j != prob.end(i); ++j)
            {
                const unsigned long id_j = prob.node_id(j);
                score += prob.factor_value(i,j, map_assignment[id_i], map_assignment[id_j]);
            }
        }

        return score;
    }

// ----------------------------------------------------------------------------------------


    template <
        typename map_problem
        >
    void brute_force_find_max_factor_graph_nmplp (
        const map_problem& prob,
        std::vector<unsigned long>& map_assignment
    )
    {
        std::vector<unsigned long> temp_assignment; 
        temp_assignment.resize(prob.number_of_nodes(),0);

        double best_score = -std::numeric_limits<double>::infinity();

        for (unsigned long i = 0; i < 255; ++i)
        {
            temp_assignment[0] = (i&0x01)!=0;
            temp_assignment[1] = (i&0x02)!=0;
            temp_assignment[2] = (i&0x04)!=0;
            temp_assignment[3] = (i&0x08)!=0;
            temp_assignment[4] = (i&0x10)!=0;
            temp_assignment[5] = (i&0x20)!=0;
            temp_assignment[6] = (i&0x40)!=0;
            temp_assignment[7] = (i&0x80)!=0;

            double score = find_total_score(prob,temp_assignment);
            if (score > best_score)
            {
                best_score = score;
                map_assignment = temp_assignment;
            }
        }
    }

// ----------------------------------------------------------------------------------------

    template <typename map_problem>
    void do_test(
    )
    {
        print_spinner();
        std::vector<unsigned long> map_assignment1, map_assignment2;
        map_problem prob;
        find_max_factor_graph_nmplp(prob, map_assignment1, 1000, 1e-8);

        const double score1 = find_total_score(prob, map_assignment1); 

        brute_force_find_max_factor_graph_nmplp(prob, map_assignment2);
        const double score2 = find_total_score(prob, map_assignment2); 

        dlog << LINFO << "score NMPLP: " << score1;
        dlog << LINFO << "score MAP:   " << score2;

        DLIB_TEST(std::abs(score1 - score2) < 1e-10);
        DLIB_TEST(vector_to_matrix(map_assignment1) == vector_to_matrix(map_assignment2));
    }

// ----------------------------------------------------------------------------------------

    template <typename map_problem>
    void do_test2(
    )
    {
        print_spinner();
        std::vector<unsigned long> map_assignment1, map_assignment2;
        map_problem prob;
        find_max_factor_graph_nmplp(prob, map_assignment1, 10, 1e-8);

        const double score1 = find_total_score(prob, map_assignment1); 

        map_assignment2.resize(6);
        map_assignment2[0] = index_of_max(rowm(prob.numbers,0));
        map_assignment2[1] = index_of_max(rowm(prob.numbers,1));
        map_assignment2[2] = index_of_max(rowm(prob.numbers,2));
        map_assignment2[3] = index_of_max(rowm(prob.numbers,3));
        map_assignment2[4] = index_of_max(rowm(prob.numbers,4));
        map_assignment2[5] = 0;
        const double score2 = find_total_score(prob, map_assignment2); 

        dlog << LINFO << "score NMPLP: " << score1;
        dlog << LINFO << "score MAP:   " << score2;
        dlog << LINFO << "MAP assignment: "<< trans(vector_to_matrix(map_assignment1));

        DLIB_TEST(std::abs(score1 - score2) < 1e-10);
        DLIB_TEST(vector_to_matrix(map_assignment1) == vector_to_matrix(map_assignment2));
    }

// ----------------------------------------------------------------------------------------

    class test_find_max_factor_graph_nmplp : public tester
    {
    public:
        test_find_max_factor_graph_nmplp (
        ) :
            tester ("test_find_max_factor_graph_nmplp",
                    "Runs tests on the find_max_factor_graph_nmplp routine.")
        {}

        void perform_test (
        )
        {
            do_test<map_problem>();

            for (int i = 0; i < 10; ++i)
                do_test2<map_problem2>();
        }
    } a;

}




