// Copyright (C) 2012  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#include <sstream>
#include <string>
#include <cstdlib>
#include <ctime>
#include <dlib/graph_cuts.h>
#include <dlib/graph_utils.h>
#include <dlib/directed_graph.h>
#include <dlib/graph.h>
#include <dlib/rand.h>
#include <dlib/hash.h>
#include <dlib/image_transforms.h>

#include "tester.h"

namespace  
{

    using namespace test;
    using namespace dlib;
    using namespace std;


    logger dlog("test.graph_cuts");

// ----------------------------------------------------------------------------------------

    class dense_potts_problem 
    {
    public:
        typedef double value_type;
    private:

        matrix<value_type,0,1> factors1;
        matrix<value_type> factors2;
        matrix<node_label,0,1> labels;
    public:

        dense_potts_problem (
            unsigned long num_nodes,
            dlib::rand& rnd
        )
        {
            factors1 = -7*(randm(num_nodes, 1, rnd)-0.5);
            factors2 = make_symmetric(randm(num_nodes, num_nodes, rnd) > 0.5);
            labels.set_size(num_nodes);
            labels = FREE_NODE;
        }

        unsigned long number_of_nodes (
        ) const { return factors1.nr(); }

        unsigned long number_of_neighbors (
            unsigned long // idx
        ) const { return number_of_nodes()-1; }

        unsigned long get_neighbor_idx (
            unsigned long node_id1,
            unsigned long node_id2
        ) const
        {
            if (node_id2 < node_id1)
                return node_id2;
            else
                return node_id2-1;
        }

        unsigned long get_neighbor (
            unsigned long node_id,
            unsigned long idx
        ) const
        {
            DLIB_TEST(node_id < number_of_nodes());
            DLIB_TEST(idx < number_of_neighbors(node_id));
            if (idx < node_id)
                return idx;
            else
                return idx+1;
        }

        void set_label (
            const unsigned long& idx,
            node_label value
        )
        {
            labels(idx) = value;
        }

        node_label get_label (
            const unsigned long& idx
        ) const
        {
            return labels(idx);
        }


        value_type factor_value (unsigned long idx) const
        {
            DLIB_TEST(idx < number_of_nodes());

            return factors1(idx);
        }

        value_type factor_value_disagreement (unsigned long idx1, unsigned long idx2) const
        {
            DLIB_TEST(idx1 != idx2);
            DLIB_TEST(idx1 < number_of_nodes());
            DLIB_TEST(idx2 < number_of_nodes());
            DLIB_TEST(get_neighbor_idx(idx1,idx2) < number_of_neighbors(idx1));
            DLIB_TEST(get_neighbor_idx(idx2,idx1) < number_of_neighbors(idx2));

            return factors2(idx1, idx2);
        }

    };

// ----------------------------------------------------------------------------------------

    class image_potts_problem 
    {
    public:
        typedef double value_type;
        const static unsigned long max_number_of_neighbors = 4;
    private:

        matrix<value_type,0,1> factors1;
        matrix<value_type> factors2;
        matrix<node_label,0,1> labels;
        long nr;
        long nc;
        rectangle rect, inner_rect;
        mutable long count;
    public:

        image_potts_problem (
            long nr_,
            long nc_,
            dlib::rand& rnd
        ) : nr(nr_), nc(nc_)
        {
            rect = rectangle(0,0,nc-1,nr-1);
            inner_rect = shrink_rect(rect,1);
            const unsigned long num_nodes = nr*nc;
            factors1 = -7*(randm(num_nodes, 1, rnd));
            factors2 = randm(num_nodes, 4, rnd) > 0.5;

            //factors1 = 0;
            //set_rowm(factors1, range(0, factors1.nr()/2)) = -1;

            labels.set_size(num_nodes);
            labels = FREE_NODE;

            count = 0;
        }

        ~image_potts_problem()
        {
            dlog << LTRACE << "interface calls: " << count;
            dlog << LTRACE << "labels hash: "<< murmur_hash3_128bit(&labels(0), labels.size()*sizeof(labels(0)), 0).first;
        }

        unsigned long number_of_nodes (
        ) const { return factors1.nr(); }

        unsigned long number_of_neighbors (
            unsigned long idx
        ) const 
        { 
            ++count;
            const point& p = get_loc(idx);
            if (inner_rect.contains(p))
                return 4;
            else if (p == rect.tl_corner() ||
                     p == rect.bl_corner() ||
                     p == rect.tr_corner() ||
                     p == rect.br_corner() )
                return 2;
            else
                return 3;
        }

        unsigned long get_neighbor_idx (
            long node_id1,
            long node_id2
        ) const
        {
            ++count;
            const point& p = get_loc(node_id1);
            long ret = 0;
            if (rect.contains(p + point(1,0)))
            {
                if (node_id2-node_id1 == 1)
                    return ret;
                ++ret;
            }

            if (rect.contains(p - point(1,0)))
            {
                if (node_id2-node_id1 == -1)
                    return ret;
                ++ret;
            }

            if (rect.contains(p + point(0,1)))
            {
                if (node_id2-node_id1 == nc)
                    return ret;
                ++ret;
            }

            return ret;
        }

        unsigned long get_neighbor (
            long node_id,
            long idx
        ) const
        {
            ++count;
            const point& p = get_loc(node_id);
            if (rect.contains(p + point(1,0)))
            {
                if (idx == 0)
                    return node_id+1;
                --idx;
            }

            if (rect.contains(p - point(1,0)))
            {
                if (idx == 0)
                    return node_id-1;
                --idx;
            }

            if (rect.contains(p + point(0,1)))
            {
                if (idx == 0)
                    return node_id+nc;
                --idx;
            }

            return node_id-nc;
        }

        void set_label (
            const unsigned long& idx,
            node_label value
        )
        {
            ++count;
            labels(idx) = value;
        }

        node_label get_label (
            const unsigned long& idx
        ) const
        {
            ++count;
            return labels(idx);
        }

        value_type factor_value (unsigned long idx) const
        {
            ++count;
            DLIB_TEST(idx < (unsigned long)number_of_nodes());

            return factors1(idx);
        }

        value_type factor_value_disagreement (unsigned long idx1, unsigned long idx2) const
        {
            ++count;
            DLIB_TEST(idx1 != idx2);
            DLIB_TEST(idx1 < (unsigned long)number_of_nodes());
            DLIB_TEST(idx2 < (unsigned long)number_of_nodes());

            // make this function symmetric
            if (idx1 > idx2)
                swap(idx1,idx2);


            DLIB_TEST(get_neighbor(idx1, get_neighbor_idx(idx1, idx2)) == idx2);
            DLIB_TEST(get_neighbor(idx2, get_neighbor_idx(idx2, idx1)) == idx1);

            // the neighbor relationship better be symmetric
            DLIB_TEST(get_neighbor_idx(idx1,idx2) < number_of_neighbors(idx1));
            DLIB_TEST_MSG(get_neighbor_idx(idx2,idx1) < number_of_neighbors(idx2),
                         "\n idx1: "<< idx1  <<
                         "\n idx2: "<< idx2  <<
                         "\n get_neighbor_idx(idx2,idx1): "<< get_neighbor_idx(idx2,idx1) <<
                         "\n number_of_neighbors(idx2): " << number_of_neighbors(idx2) <<
                         "\n nr: "<< nr << 
                         "\n nc: "<< nc 
            );

            return factors2(idx1, get_neighbor_idx(idx1,idx2));
        }

    private:
        point get_loc (
            const unsigned long& idx
        ) const
        {
            return point(idx%nc, idx/nc);
        }

    };

// ----------------------------------------------------------------------------------------

    template <typename potts_model>
    void brute_force_potts_model (
        potts_model& g
    )
    {
        potts_model m(g);

        const unsigned long num = (unsigned long)std::pow(2.0, (double)m.number_of_nodes());

        double best_score = -std::numeric_limits<double>::infinity();
        for (unsigned long i = 0; i < num; ++i)
        {
            for (unsigned long j = 0; j < m.number_of_nodes(); ++j)
            {
                unsigned long T = (1)<<j;
                T = (T&i);
                if (T != 0)
                    m.set_label(j,SINK_CUT);
                else
                    m.set_label(j,SOURCE_CUT);
            }


            double score = potts_model_score(m);
            if (score > best_score)
            {
                best_score = score;
                g = m;
            }
        }
    }

// ----------------------------------------------------------------------------------------

    template <typename graph_type>
    void brute_force_potts_model_on_graph (
        const graph_type& g,
        std::vector<node_label>& labels_
    )
    {
        std::vector<node_label> labels;
        labels.resize(g.number_of_nodes());

        const unsigned long num = (unsigned long)std::pow(2.0, (double)g.number_of_nodes());

        double best_score = -std::numeric_limits<double>::infinity();
        for (unsigned long i = 0; i < num; ++i)
        {
            for (unsigned long j = 0; j < g.number_of_nodes(); ++j)
            {
                unsigned long T = (1)<<j;
                T = (T&i);
                if (T != 0)
                    labels[j] = SINK_CUT;
                else
                    labels[j] = SOURCE_CUT;
            }


            double score = potts_model_score(g,labels);
            if (score > best_score)
            {
                best_score = score;
                labels_ = labels;
            }
        }
    }

// ----------------------------------------------------------------------------------------

    template <typename graph_type>
    void make_random_undirected_graph(
        dlib::rand& rnd,
        graph_type& g
    )
    {
        typedef typename graph_type::edge_type edge_weight_type;
        g.clear();
        const unsigned int num_nodes = rnd.get_random_32bit_number()%8;
        g.set_number_of_nodes(num_nodes);

        const unsigned int num_edges = static_cast<unsigned int>(num_nodes*(num_nodes-1)/2*rnd.get_random_double() + 0.5);

        // add the right number of randomly selected edges
        unsigned int count = 0;
        while (count < num_edges)
        {
            unsigned long i = rnd.get_random_32bit_number()%g.number_of_nodes();
            unsigned long j = rnd.get_random_32bit_number()%g.number_of_nodes();
            if (i != j && g.has_edge(i, j) == false)
            {
                ++count;
                g.add_edge(i, j);
                edge(g, i, j) = static_cast<edge_weight_type>(rnd.get_random_double()*50);
            }
        }

        for (unsigned long i = 0; i < g.number_of_nodes(); ++i)
        {
            g.node(i).data = static_cast<edge_weight_type>(rnd.get_random_gaussian()*200);
        }
    }

// ----------------------------------------------------------------------------------------

    void test_graph_potts_model(
        dlib::rand& rnd
    )
    {
        using namespace std;
        double brute_force_score;
        double graph_cut_score;

        graph<double,double>::kernel_1a_c temp;
        make_random_undirected_graph(rnd,temp);

        {
            std::vector<node_label> labels;

            brute_force_potts_model_on_graph(temp, labels);

            for (unsigned long i = 0; i < temp.number_of_nodes(); ++i)
            {
                dlog << LTRACE << "node " << i << ": "<< (int)labels[i];
            }

            brute_force_score = potts_model_score(temp, labels);
            dlog << LTRACE << "brute force score: "<< brute_force_score;
        }
        dlog << LTRACE << "******************";

        {
            std::vector<node_label> labels;
            find_max_factor_graph_potts(temp, labels);
            DLIB_TEST(temp.number_of_nodes() == labels.size());

            for (unsigned long i = 0; i < temp.number_of_nodes(); ++i)
            {
                dlog << LTRACE << "node " << i << ": "<< (int)labels[i];
            }
            graph_cut_score = potts_model_score(temp, labels);
            dlog << LTRACE << "graph cut score: "<< graph_cut_score;
        }

        DLIB_TEST_MSG(graph_cut_score == brute_force_score, std::abs(graph_cut_score - brute_force_score));

        dlog << LTRACE << "##################";
        dlog << LTRACE << "##################";
        dlog << LTRACE << "##################";
    }

// ----------------------------------------------------------------------------------------

    template <typename potts_prob>
    void impl_test_potts_model (
        potts_prob& p
    )
    {
        using namespace std;
        double brute_force_score;
        double graph_cut_score;

        {
            potts_prob temp(p);
            brute_force_potts_model(temp);

            for (unsigned long i = 0; i < temp.number_of_nodes(); ++i)
            {
                dlog << LTRACE << "node " << i << ": "<< (int)temp.get_label(i);
            }
            brute_force_score = potts_model_score(temp);
            dlog << LTRACE << "brute force score: "<< brute_force_score;
        }
        dlog << LTRACE << "******************";

        {
            potts_prob temp(p);
            find_max_factor_graph_potts(temp);

            for (unsigned long i = 0; i < temp.number_of_nodes(); ++i)
            {
                dlog << LTRACE << "node " << i << ": "<< (int)temp.get_label(i);
            }
            graph_cut_score = potts_model_score(temp);
            dlog << LTRACE << "graph cut score: "<< graph_cut_score;
        }

        DLIB_TEST_MSG(graph_cut_score == brute_force_score, std::abs(graph_cut_score - brute_force_score));

        dlog << LTRACE << "##################";
        dlog << LTRACE << "##################";
        dlog << LTRACE << "##################";
    }

// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------
//                                   BASIC MIN CUT STUFF
// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------

    template <typename directed_graph>
    void brute_force_min_cut (
        directed_graph& g,
        unsigned long source,
        unsigned long sink
    )
    {
        typedef typename directed_graph::edge_type edge_weight_type;
        const unsigned long num = (unsigned long)std::pow(2.0, (double)g.number_of_nodes());

        std::vector<node_label> best_cut(g.number_of_nodes(),FREE_NODE);

        edge_weight_type best_score = std::numeric_limits<edge_weight_type>::max();
        for (unsigned long i = 0; i < num; ++i)
        {
            for (unsigned long j = 0; j < g.number_of_nodes(); ++j)
            {
                unsigned long T = (1)<<j;
                T = (T&i);
                if (T != 0)
                    g.node(j).data = SINK_CUT;
                else
                    g.node(j).data = SOURCE_CUT;
            }

            // ignore cuts that don't label the source or sink node the way we want.
            if (g.node(source).data != SOURCE_CUT ||
                g.node(sink).data != SINK_CUT)
                continue;

            edge_weight_type score = graph_cut_score(g);
            if (score < best_score)
            {
                best_score = score;
                for (unsigned long j = 0; j < g.number_of_nodes(); ++j)
                    best_cut[j] = g.node(j).data;
            }
        }

        for (unsigned long j = 0; j < g.number_of_nodes(); ++j)
            g.node(j).data =  best_cut[j];
    }

// ----------------------------------------------------------------------------------------

    template <typename directed_graph>
    void print_graph(
        const directed_graph& g
    )
    {
        using namespace std;
        dlog << LTRACE << "number of nodes: "<< g.number_of_nodes();
        for (unsigned long i = 0; i < g.number_of_nodes(); ++i)
        {
            for (unsigned long n = 0; n < g.node(i).number_of_children(); ++n)
                dlog << LTRACE << i << " -(" << g.node(i).child_edge(n) << ")-> " << g.node(i).child(n).index();
        }
    }

    template <typename directed_graph>
    void copy_edge_weights (
        directed_graph& dest,
        const directed_graph& src
    )
    {
        for (unsigned long i = 0; i < src.number_of_nodes(); ++i)
        {
            for (unsigned long n = 0; n < src.node(i).number_of_children(); ++n)
            {
                dest.node(i).child_edge(n) = src.node(i).child_edge(n);
            }
        }
    }

// ----------------------------------------------------------------------------------------

    template <typename graph_type>
    void pick_random_source_and_sink (
        dlib::rand& rnd,
        const graph_type& g,
        unsigned long& source,
        unsigned long& sink
    )
    {
        source = rnd.get_random_32bit_number()%g.number_of_nodes();
        sink = rnd.get_random_32bit_number()%g.number_of_nodes();
        while (sink == source)
            sink = rnd.get_random_32bit_number()%g.number_of_nodes();
    }

// ----------------------------------------------------------------------------------------

    template <typename dgraph_type>
    void make_random_graph(
        dlib::rand& rnd,
        dgraph_type& g,
        unsigned long& source,
        unsigned long& sink
    )
    {
        typedef typename dgraph_type::edge_type edge_weight_type;
        g.clear();
        const unsigned int num_nodes = rnd.get_random_32bit_number()%7 + 2;
        g.set_number_of_nodes(num_nodes);

        const unsigned int num_edges = static_cast<unsigned int>(num_nodes*(num_nodes-1)/2*rnd.get_random_double() + 0.5);

        // add the right number of randomly selected edges
        unsigned int count = 0;
        while (count < num_edges)
        {
            unsigned long parent = rnd.get_random_32bit_number()%g.number_of_nodes();
            unsigned long child = rnd.get_random_32bit_number()%g.number_of_nodes();
            if (parent != child && g.has_edge(parent, child) == false)
            {
                ++count;
                g.add_edge(parent, child);
                edge(g, parent, child) = static_cast<edge_weight_type>(rnd.get_random_double()*50);

                // have to have edges both ways
                swap(parent, child);
                g.add_edge(parent, child);
                edge(g, parent, child) = static_cast<edge_weight_type>(rnd.get_random_double()*50);
            }
        }

        pick_random_source_and_sink(rnd, g, source, sink);
    }

// ----------------------------------------------------------------------------------------

    template <typename dgraph_type>
    void make_random_chain_graph(
        dlib::rand& rnd,
        dgraph_type& g,
        unsigned long& source,
        unsigned long& sink
    )
    {
        typedef typename dgraph_type::edge_type edge_weight_type;
        g.clear();
        const unsigned int num_nodes = rnd.get_random_32bit_number()%7 + 2;
        g.set_number_of_nodes(num_nodes);

        for (unsigned long i = 1; i < g.number_of_nodes(); ++i)
        {
            g.add_edge(i,i-1);
            g.add_edge(i-1,i);
            edge(g, i, i-1) = static_cast<edge_weight_type>(rnd.get_random_double()*50);
            edge(g, i-1, i) = static_cast<edge_weight_type>(rnd.get_random_double()*50);
        }

        pick_random_source_and_sink(rnd, g, source, sink);
    }

// ----------------------------------------------------------------------------------------

    template <typename dgraph_type>
    void make_random_grid_graph(
        dlib::rand& rnd,
        dgraph_type& g,
        unsigned long& source,
        unsigned long& sink
    )
    /*!
        ensures
            - makes a grid graph like the kind used for potts models.
    !*/
    {
        typedef typename dgraph_type::edge_type edge_weight_type;
        g.clear();
        const long nr = rnd.get_random_32bit_number()%2 + 2;
        const long nc = rnd.get_random_32bit_number()%2 + 2;
        g.set_number_of_nodes(nr*nc+2);

        const rectangle rect(0,0,nc-1,nr-1);
        for (long r = 0; r < nr; ++r)
        {
            for (long c = 0; c < nc; ++c)
            {
                const point p(c,r);
                const unsigned long i = p.y()*nc + p.x();

                const point n2(c-1,r);
                if (rect.contains(n2))
                {
                    const unsigned long j = n2.y()*nc + n2.x();
                    g.add_edge(i,j);
                    g.add_edge(j,i);
                    edge(g,i,j) = static_cast<edge_weight_type>(rnd.get_random_double()*50);
                    edge(g,j,i) = static_cast<edge_weight_type>(rnd.get_random_double()*50);
                }

                const point n4(c,r-1);
                if (rect.contains(n4))
                {
                    const unsigned long j = n4.y()*nc + n4.x();
                    g.add_edge(i,j);
                    g.add_edge(j,i);
                    edge(g,i,j) = static_cast<edge_weight_type>(rnd.get_random_double()*50);
                    edge(g,j,i) = static_cast<edge_weight_type>(rnd.get_random_double()*50);
                }
            }
        }

        // use the last two nodes as source and sink.  Also connect them to all the other nodes.
        source = g.number_of_nodes()-1;
        sink = g.number_of_nodes()-2;
        for (unsigned long i = 0; i < g.number_of_nodes()-2; ++i)
        {
            g.add_edge(i,source);
            g.add_edge(source,i);
            g.add_edge(i,sink);
            g.add_edge(sink,i);

            edge(g,i,source) = static_cast<edge_weight_type>(rnd.get_random_double()*50);
            edge(g,source,i) = static_cast<edge_weight_type>(rnd.get_random_double()*50);
            edge(g,i,sink) = static_cast<edge_weight_type>(rnd.get_random_double()*50);
            edge(g,sink,i) = static_cast<edge_weight_type>(rnd.get_random_double()*50);
        }
    }

// ----------------------------------------------------------------------------------------

    template <typename min_cut, typename dgraph_type>
    void run_test_on_graphs (
        const min_cut& mc,
        dgraph_type& g1,
        dgraph_type& g2,
        unsigned long source,
        unsigned long sink
    )
    {
        typedef typename dgraph_type::edge_type edge_weight_type;
        using namespace std;


        dlog << LTRACE << "number of nodes: "<< g1.number_of_nodes();
        dlog << LTRACE << "is graph connected: "<< graph_is_connected(g1);
        dlog << LTRACE << "has self loops:     "<< graph_contains_length_one_cycle(g1);
        dlog << LTRACE << "SOURCE_CUT: " << source;
        dlog << LTRACE << "SINK_CUT:   " << sink;
        mc(g1, source, sink);
        brute_force_min_cut(g2, source, sink);

        print_graph(g1);

        // make sure the flow residuals are 0 at the cut locations
        for (unsigned long i = 0; i < g1.number_of_nodes(); ++i)
        {
            for (unsigned long j = 0; j < g1.node(i).number_of_children(); ++j)
            {
                if ((g1.node(i).data == SOURCE_CUT && g1.node(i).child(j).data != SOURCE_CUT) ||
                    (g1.node(i).data != SINK_CUT && g1.node(i).child(j).data == SINK_CUT)
                    )
                {
                    DLIB_TEST_MSG(g1.node(i).child_edge(j) == 0, g1.node(i).child_edge(j));
                }
            }
        }

        // copy the edge weights from g2 back to g1 so we can compute cut scores
        copy_edge_weights(g1, g2);

        DLIB_TEST(g1.number_of_nodes() == g2.number_of_nodes());
        for (unsigned long i = 0; i < g1.number_of_nodes(); ++i)
        {
            dlog << LTRACE << "node " << i << ": " << (int)g1.node(i).data << ", " << (int)g2.node(i).data;
            if (g1.node(i).data != g2.node(i).data)
            {
                edge_weight_type cut_score = graph_cut_score(g1);
                edge_weight_type brute_force_score = graph_cut_score(g2);
                dlog << LTRACE << "graph cut score: "<< cut_score;
                dlog << LTRACE << "brute force score: "<< brute_force_score;

                if (brute_force_score != cut_score)
                    print_graph(g1);
                DLIB_TEST_MSG(brute_force_score == cut_score,std::abs(brute_force_score-cut_score));
            }
        }

    }

// ----------------------------------------------------------------------------------------

    template <typename min_cut, typename edge_weight_type>
    void test_graph_cuts(dlib::rand& rnd)
    {
        typedef typename dlib::directed_graph<node_label, edge_weight_type>::kernel_1a_c dgraph_type;
        // we will create two identical graphs.
        dgraph_type g1, g2;
        min_cut mc;

        unsigned long source, sink;

        dlib::rand rnd_copy(rnd);
        make_random_graph(rnd,g1, source, sink);
        make_random_graph(rnd_copy,g2, source, sink);
        run_test_on_graphs(mc, g1, g2, source, sink);

        rnd_copy = rnd;
        make_random_grid_graph(rnd,g1, source, sink);
        make_random_grid_graph(rnd_copy,g2, source, sink);
        run_test_on_graphs(mc, g1, g2, source, sink);

        rnd_copy = rnd;
        make_random_chain_graph(rnd,g1, source, sink);
        make_random_chain_graph(rnd_copy,g2, source, sink);
        run_test_on_graphs(mc, g1, g2, source, sink);

    }

// ----------------------------------------------------------------------------------------

    class test_potts_grid_problem
    {
    public:
        test_potts_grid_problem(int seed_) :seed(seed_){}
        int seed;

        long nr() const { return 3;}
        long nc() const { return 3;}

        typedef double value_type;

        value_type factor_value(unsigned long idx) const
        {
            // Copy idx into a char buffer to avoid warnings about violation of strict aliasing 
            // rules when murmur_hash3() gets inlined into this function.
            char buf[sizeof(idx)];
            memcpy(buf,&idx,sizeof(idx));
            // now hash the buffer rather than idx.
            return ((double)murmur_hash3(buf, sizeof(buf), seed) - std::numeric_limits<uint32>::max()/2.0)/1000.0;
        }

        value_type factor_value_disagreement(unsigned long idx1, unsigned long idx2) const
        {
            return std::abs(factor_value(idx1+idx2)/10.0);
        }
    };

// ----------------------------------------------------------------------------------------

    template <typename prob_type>
    void brute_force_potts_grid_problem(
        const prob_type& prob,
        array2d<unsigned char>& labels
    )
    {
        const unsigned long num = (unsigned long)std::pow(2.0, (double)prob.nr()*prob.nc());

        array2d<unsigned char> temp(prob.nr(), prob.nc());
        unsigned char* data = &temp[0][0];

        double best_score = -std::numeric_limits<double>::infinity();
        for (unsigned long i = 0; i < num; ++i)
        {
            for (unsigned long j = 0; j < temp.size(); ++j)
            {
                unsigned long T = (1)<<j;
                T = (T&i);
                if (T != 0)
                    *(data + j) = SINK_CUT;
                else
                    *(data + j) = SOURCE_CUT;
            }


            double score = potts_model_score(prob, temp);
            if (score > best_score)
            {
                best_score = score;
                assign_image(labels, temp);
            }
        }
    }

    void test_inf()
    {
        graph<double,double>::kernel_1a_c g;
        g.set_number_of_nodes(4);
        g.add_edge(0,1);
        g.add_edge(1,2);
        g.add_edge(2,3);
        g.add_edge(3,0);

        g.node(0).data = std::numeric_limits<double>::infinity();
        g.node(1).data = -std::numeric_limits<double>::infinity();
        g.node(2).data = std::numeric_limits<double>::infinity();
        g.node(3).data = -std::numeric_limits<double>::infinity();

        edge(g,0,1) = 1;
        edge(g,1,2) = 1;
        edge(g,2,3) = 1;
        edge(g,3,0) = 1;

        std::vector<node_label> labels;
        find_max_factor_graph_potts(g, labels);

        DLIB_TEST(labels[0] != 0);
        DLIB_TEST(labels[1] == 0);
        DLIB_TEST(labels[2] != 0);
        DLIB_TEST(labels[3] == 0);

        // --------------------------

        g.node(0).data = std::numeric_limits<double>::infinity();
        g.node(1).data = 0;
        g.node(2).data = 0;
        g.node(3).data = -3;

        edge(g,0,1) = 1;
        edge(g,1,2) = 1;
        edge(g,2,3) = 1;
        edge(g,3,0) = 1;

        find_max_factor_graph_potts(g, labels);

        DLIB_TEST(labels[0] != 0);
        DLIB_TEST(labels[1] != 0);
        DLIB_TEST(labels[2] != 0);
        DLIB_TEST(labels[3] == 0);

        // --------------------------

        g.node(0).data = std::numeric_limits<double>::infinity();
        g.node(1).data = 0;
        g.node(2).data = 0;
        g.node(3).data = -0.1;

        edge(g,0,1) = 1;
        edge(g,1,2) = 1;
        edge(g,2,3) = 1;
        edge(g,3,0) = 1;

        find_max_factor_graph_potts(g, labels);

        DLIB_TEST(labels[0] != 0);
        DLIB_TEST(labels[1] != 0);
        DLIB_TEST(labels[2] != 0);
        DLIB_TEST(labels[3] != 0);

        // --------------------------

        g.node(0).data = std::numeric_limits<double>::infinity();
        g.node(1).data = 0;
        g.node(2).data = 0;
        g.node(3).data = -0.1;

        edge(g,0,1) = 1;
        edge(g,1,2) = 1;
        edge(g,2,3) = 0;
        edge(g,3,0) = 0;

        find_max_factor_graph_potts(g, labels);

        DLIB_TEST(labels[0] != 0);
        DLIB_TEST(labels[1] != 0);
        DLIB_TEST(labels[2] != 0);
        DLIB_TEST(labels[3] == 0);

        // --------------------------

        g.node(0).data = -std::numeric_limits<double>::infinity();
        g.node(1).data = 0;
        g.node(2).data = 0;
        g.node(3).data = 0.1;

        edge(g,0,1) = 1;
        edge(g,1,2) = 1;
        edge(g,2,3) = 0;
        edge(g,3,0) = 0;

        find_max_factor_graph_potts(g, labels);

        DLIB_TEST(labels[0] == 0);
        DLIB_TEST(labels[1] == 0);
        DLIB_TEST(labels[2] == 0);
        DLIB_TEST(labels[3] != 0);

        // --------------------------

        g.node(0).data = -std::numeric_limits<double>::infinity();
        g.node(1).data = std::numeric_limits<double>::infinity();
        g.node(2).data = 0;
        g.node(3).data = 0.1;

        edge(g,0,1) = 1;
        edge(g,1,2) = 1;
        edge(g,2,3) = 0;
        edge(g,3,0) = 0;

        find_max_factor_graph_potts(g, labels);

        DLIB_TEST(labels[0] == 0);
        DLIB_TEST(labels[1] != 0);
        DLIB_TEST(labels[2] != 0);
        DLIB_TEST(labels[3] != 0);

        // --------------------------

        g.node(0).data = -10;
        g.node(1).data = std::numeric_limits<double>::infinity();
        g.node(2).data = 0;
        g.node(3).data = 0.1;

        edge(g,0,1) = std::numeric_limits<double>::infinity();
        edge(g,1,2) = std::numeric_limits<double>::infinity();
        edge(g,2,3) = std::numeric_limits<double>::infinity();
        edge(g,3,0) = std::numeric_limits<double>::infinity();

        find_max_factor_graph_potts(g, labels);

        DLIB_TEST(labels[0] != 0);
        DLIB_TEST(labels[1] != 0);
        DLIB_TEST(labels[2] != 0);
        DLIB_TEST(labels[3] != 0);

        // --------------------------

        g.node(0).data = 10;
        g.node(1).data = -std::numeric_limits<double>::infinity();
        g.node(2).data = 20.05;
        g.node(3).data = -0.1;

        edge(g,0,1) = std::numeric_limits<double>::infinity();
        edge(g,1,2) = 10;
        edge(g,2,3) = std::numeric_limits<double>::infinity();
        edge(g,3,0) = 10;

        find_max_factor_graph_potts(g, labels);

        DLIB_TEST(labels[0] == 0);
        DLIB_TEST(labels[1] == 0);
        DLIB_TEST(labels[2] == 0);
        DLIB_TEST(labels[3] == 0);

        // --------------------------

        g.node(0).data = 10;
        g.node(1).data = -std::numeric_limits<double>::infinity();
        g.node(2).data = 20.2;
        g.node(3).data = -0.1;

        edge(g,0,1) = std::numeric_limits<double>::infinity();
        edge(g,1,2) = 10;
        edge(g,2,3) = std::numeric_limits<double>::infinity();
        edge(g,3,0) = 10;

        find_max_factor_graph_potts(g, labels);

        DLIB_TEST(labels[0] == 0);
        DLIB_TEST(labels[1] == 0);
        DLIB_TEST(labels[2] != 0);
        DLIB_TEST(labels[3] != 0);
    }

    struct potts_pair_image_model 
    {
        typedef double value_type;

        template <typename pixel_type1, typename pixel_type2>
        value_type factor_value (
            const pixel_type1& ,
            const pixel_type2& v2 
        ) const
        {
            return v2;
        }

        template <typename pixel_type>
        value_type factor_value_disagreement (
            const pixel_type& v1,
            const pixel_type& v2 
        ) const
        {
            if (v1 == v2)
                return 10;
            else
                return 0;
        }
    };

    void test_potts_pair_grid()
    {
        array2d<int> img1(40,40);
        array2d<double> img2(40,40);

        assign_all_pixels(img1, -1);
        assign_all_pixels(img2, -1);

        img1[4][4] = 1000;

        img2[4][3] = 1;
        img2[4][4] = 1;
        img2[4][5] = 1;
        img2[3][3] = 1;
        img2[3][4] = 1;
        img2[3][5] = 1;
        img2[5][3] = 1;
        img2[5][4] = 1;
        img2[5][5] = 1;

        array2d<unsigned char> labels;
        find_max_factor_graph_potts(make_potts_grid_problem(potts_pair_image_model(),img2,img1), labels);

        dlog << LINFO << "num true labels: " << sum(matrix_cast<int>(mat(labels)!=0));
        DLIB_TEST(sum(matrix_cast<int>(mat(labels)!=0)) == 9);
        DLIB_TEST(sum(matrix_cast<int>(mat(labels)==0)) == (int)img1.size()-9);

        DLIB_TEST(labels[4][3] != 0);
        DLIB_TEST(labels[4][4] != 0);
        DLIB_TEST(labels[4][5] != 0);
        DLIB_TEST(labels[3][3] != 0);
        DLIB_TEST(labels[3][4] != 0);
        DLIB_TEST(labels[3][5] != 0);
        DLIB_TEST(labels[5][3] != 0);
        DLIB_TEST(labels[5][4] != 0);
        DLIB_TEST(labels[5][5] != 0);
    }

// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------

    class graph_cuts_tester : public tester
    {
    public:
        graph_cuts_tester (
        ) :
            tester ("test_graph_cuts",
                    "Runs tests on the graph cuts tools.")
        {}

        dlib::rand rnd;

        void perform_test (
        )
        {
            test_potts_pair_grid();
            test_inf();

            for (int i = 0; i < 500; ++i)
            {
                array2d<unsigned char> labels, brute_labels;
                test_potts_grid_problem prob(i);
                find_max_factor_graph_potts(prob, labels);
                brute_force_potts_grid_problem(prob, brute_labels);

                DLIB_TEST(labels.nr() == brute_labels.nr());
                DLIB_TEST(labels.nc() == brute_labels.nc());
                for (long r = 0; r < labels.nr(); ++r)
                {
                    for (long c = 0; c < labels.nc(); ++c)
                    {
                        bool normal = (labels[r][c] != 0);
                        bool brute = (brute_labels[r][c] != 0);
                        DLIB_TEST(normal == brute);
                    }
                }
            }

            for (int i = 0; i < 1000; ++i)
            {
                print_spinner();
                dlog << LTRACE << "test_grpah_cuts<short> iter: " << i;
                test_graph_cuts<min_cut,short>(rnd);
                print_spinner();
                dlog << LTRACE << "test_grpah_cuts<double> iter: " << i;
                test_graph_cuts<min_cut,double>(rnd);
            }


            for (int k = 0; k < 300; ++k)
            {
                dlog << LTRACE << "image_potts_problem iter " << k;
                print_spinner();
                image_potts_problem p(3,3, rnd);
                impl_test_potts_model(p);
            }
            for (int k = 0; k < 300; ++k)
            {
                dlog << LTRACE << "dense_potts_problem iter " << k;
                print_spinner();
                dense_potts_problem p(6, rnd);
                impl_test_potts_model(p);
            }

            for (int k = 0; k < 300; ++k)
            {
                dlog << LTRACE << "dense_potts_problem iter " << k;
                print_spinner();
                test_graph_potts_model(rnd);
            }
        }
    } a;


}




