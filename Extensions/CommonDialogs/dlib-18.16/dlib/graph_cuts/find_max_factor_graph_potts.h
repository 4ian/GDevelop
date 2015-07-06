// Copyright (C) 2012  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#ifndef DLIB_FIND_MAX_FACTOR_GRAPH_PoTTS_Hh_
#define DLIB_FIND_MAX_FACTOR_GRAPH_PoTTS_Hh_

#include "find_max_factor_graph_potts_abstract.h"
#include "../matrix.h"
#include "min_cut.h"
#include "general_potts_problem.h"
#include "../algs.h"
#include "../graph_utils.h"
#include "../array2d.h"

namespace dlib
{

// ----------------------------------------------------------------------------------------

    namespace impl
    {

        template <
            typename potts_problem,
            typename T = void
            >
        class flows_container
        {
            /*
                This object notionally represents a matrix of flow values.  It's
                overloaded to represent this matrix efficiently though.  In this case
                it represents the matrix using a sparse representation.
            */

            typedef typename potts_problem::value_type edge_type;
            std::vector<std::vector<edge_type> > flows;
        public:

            void setup(
                const potts_problem& p
            )
            {
                flows.resize(p.number_of_nodes());
                for (unsigned long i = 0; i < flows.size(); ++i)
                {
                    flows[i].resize(p.number_of_neighbors(i));
                }
            }

            edge_type& operator() (
                const long r,
                const long c
            ) { return flows[r][c]; }

            const edge_type& operator() (
                const long r,
                const long c
            ) const { return flows[r][c]; }
        };

// ----------------------------------------------------------------------------------------

        template <
            typename potts_problem
            >
        class flows_container<potts_problem, 
                              typename enable_if_c<potts_problem::max_number_of_neighbors!=0>::type>
        {
            /*
                This object notionally represents a matrix of flow values.  It's
                overloaded to represent this matrix efficiently though.  In this case
                it represents the matrix using a dense representation.

            */
            typedef typename potts_problem::value_type edge_type;
            const static unsigned long max_number_of_neighbors = potts_problem::max_number_of_neighbors;
            matrix<edge_type,0,max_number_of_neighbors> flows;
        public:

            void setup(
                const potts_problem& p
            )
            {
                flows.set_size(p.number_of_nodes(), max_number_of_neighbors);
            }

            edge_type& operator() (
                const long r,
                const long c
            ) { return flows(r,c); }

            const edge_type& operator() (
                const long r,
                const long c
            ) const { return flows(r,c); }
        };

// ----------------------------------------------------------------------------------------

        template <
            typename potts_problem 
            >
        class potts_flow_graph 
        {
        public:
            typedef typename potts_problem::value_type edge_type;
        private:
            /*!
                This is a utility class used by dlib::min_cut to convert a potts_problem 
                into the kind of flow graph expected by the min_cut object's main block
                of code.

                Within this object, we will use the convention that one past 
                potts_problem::number_of_nodes() is the source node and two past is 
                the sink node.
            !*/

            potts_problem& g;

            // flows(i,j) == the flow from node id i to it's jth neighbor
            flows_container<potts_problem> flows;
            // source_flows(i,0) == flow from source to node i, 
            // source_flows(i,1) == flow from node i to source
            matrix<edge_type,0,2> source_flows;

            // sink_flows(i,0) == flow from sink to node i, 
            // sink_flows(i,1) == flow from node i to sink
            matrix<edge_type,0,2> sink_flows;

            node_label source_label, sink_label;
        public:

            potts_flow_graph(
                potts_problem& g_
            ) : g(g_)
            {
                flows.setup(g);

                source_flows.set_size(g.number_of_nodes(), 2);
                sink_flows.set_size(g.number_of_nodes(), 2);
                source_flows = 0;
                sink_flows = 0;

                source_label = FREE_NODE;
                sink_label = FREE_NODE;

                // setup flows based on factor potentials
                for (unsigned long i = 0; i < g.number_of_nodes(); ++i)
                {
                    const edge_type temp = g.factor_value(i);
                    if (temp < 0)
                        source_flows(i,0) = -temp;
                    else
                        sink_flows(i,1) = temp;

                    for (unsigned long j = 0; j < g.number_of_neighbors(i); ++j)
                    {
                        flows(i,j) = g.factor_value_disagreement(i, g.get_neighbor(i,j));
                    }
                }
            }

            class out_edge_iterator
            {
                friend class potts_flow_graph;
                unsigned long idx; // base node idx
                unsigned long cnt; // count over the neighbors of idx
            public:

                out_edge_iterator(
                ):idx(0),cnt(0){}

                out_edge_iterator(
                    unsigned long idx_,
                    unsigned long cnt_
                ):idx(idx_),cnt(cnt_)
                {}

                bool operator!= (
                    const out_edge_iterator& item
                ) const { return cnt != item.cnt; }

                out_edge_iterator& operator++(
                )
                {
                    ++cnt;
                    return *this;
                }
            };

            class in_edge_iterator
            {
                friend class potts_flow_graph;
                unsigned long idx; // base node idx
                unsigned long cnt; // count over the neighbors of idx
            public:

                in_edge_iterator(
                ):idx(0),cnt(0)  
                {}


                in_edge_iterator(
                    unsigned long idx_,
                    unsigned long cnt_
                ):idx(idx_),cnt(cnt_)
                {}

                bool operator!= (
                    const in_edge_iterator& item
                ) const { return cnt != item.cnt; }

                in_edge_iterator& operator++(
                )
                {
                    ++cnt;
                    return *this;
                }
            };

            unsigned long number_of_nodes (
            ) const { return g.number_of_nodes() + 2; }

            out_edge_iterator out_begin(
                const unsigned long& it
            ) const { return out_edge_iterator(it, 0); }

            in_edge_iterator in_begin(
                const unsigned long& it
            ) const { return in_edge_iterator(it, 0); }

            out_edge_iterator out_end(
                const unsigned long& it
            ) const 
            { 
                if (it >= g.number_of_nodes())
                    return out_edge_iterator(it, g.number_of_nodes()); 
                else
                    return out_edge_iterator(it, g.number_of_neighbors(it)+2); 
            }

            in_edge_iterator in_end(
                const unsigned long& it
            ) const 
            { 
                if (it >= g.number_of_nodes())
                    return in_edge_iterator(it, g.number_of_nodes()); 
                else
                    return in_edge_iterator(it, g.number_of_neighbors(it)+2); 
            }


            template <typename iterator_type>
            unsigned long node_id (
                const iterator_type& it
            ) const 
            { 
                // if this isn't an iterator over the source or sink nodes
                if (it.idx < g.number_of_nodes())
                {
                    const unsigned long num = g.number_of_neighbors(it.idx);
                    if (it.cnt < num)
                        return g.get_neighbor(it.idx, it.cnt); 
                    else if (it.cnt == num)
                        return g.number_of_nodes();
                    else
                        return g.number_of_nodes()+1;
                }
                else
                {
                    return it.cnt;
                }
            }


            edge_type get_flow (
                const unsigned long& it1,     
                const unsigned long& it2
            ) const
            {
                if (it1 >= g.number_of_nodes())
                {
                    // if it1 is the source
                    if (it1 == g.number_of_nodes())
                    {
                        return source_flows(it2,0);
                    }
                    else // if it1 is the sink
                    {
                        return sink_flows(it2,0);
                    }
                }
                else if (it2 >= g.number_of_nodes())
                {
                    // if it2 is the source
                    if (it2 == g.number_of_nodes())
                    {
                        return source_flows(it1,1);
                    }
                    else // if it2 is the sink
                    {
                        return sink_flows(it1,1);
                    }
                }
                else
                {
                    return flows(it1, g.get_neighbor_idx(it1, it2));
                }

            }

            edge_type get_flow (
                const out_edge_iterator& it
            ) const
            {
                if (it.idx < g.number_of_nodes())
                {
                    const unsigned long num = g.number_of_neighbors(it.idx);
                    if (it.cnt < num)
                        return flows(it.idx, it.cnt);
                    else if (it.cnt == num)
                        return source_flows(it.idx,1);
                    else
                        return sink_flows(it.idx,1);
                }
                else
                {
                    // if it.idx is the source
                    if (it.idx == g.number_of_nodes())
                    {
                        return source_flows(it.cnt,0);
                    }
                    else // if it.idx is the sink
                    {
                        return sink_flows(it.cnt,0);
                    }
                }
            }

            edge_type get_flow (
                const in_edge_iterator& it
            ) const
            {
                return get_flow(node_id(it), it.idx); 
            }

            void adjust_flow (
                const unsigned long& it1,     
                const unsigned long& it2,     
                const edge_type& value
            )
            {
                if (it1 >= g.number_of_nodes())
                {
                    // if it1 is the source
                    if (it1 == g.number_of_nodes())
                    {
                        source_flows(it2,0) += value;
                        source_flows(it2,1) -= value;
                    }
                    else // if it1 is the sink
                    {
                        sink_flows(it2,0) += value;
                        sink_flows(it2,1) -= value;
                    }
                }
                else if (it2 >= g.number_of_nodes())
                {
                    // if it2 is the source
                    if (it2 == g.number_of_nodes())
                    {
                        source_flows(it1,1) += value;
                        source_flows(it1,0) -= value;
                    }
                    else // if it2 is the sink
                    {
                        sink_flows(it1,1) += value;
                        sink_flows(it1,0) -= value;
                    }
                }
                else
                {
                    flows(it1, g.get_neighbor_idx(it1, it2)) += value;
                    flows(it2, g.get_neighbor_idx(it2, it1)) -= value;
                }

            }

            void set_label (
                const unsigned long& it,
                node_label value
            )
            {
                if (it < g.number_of_nodes())
                    g.set_label(it, value);
                else if (it == g.number_of_nodes())
                    source_label = value;
                else 
                    sink_label = value;
            }

            node_label get_label (
                const unsigned long& it
            ) const
            {
                if (it < g.number_of_nodes())
                    return g.get_label(it);
                if (it == g.number_of_nodes())
                    return source_label;
                else
                    return sink_label;
            }

        };

// ----------------------------------------------------------------------------------------

        template <
            typename label_image_type,
            typename image_potts_model
            >
        class potts_grid_problem 
        {
            label_image_type& label_img;
            long nc;
            long num_nodes;
            unsigned char* labels;
            const image_potts_model& model;

        public:
            const static unsigned long max_number_of_neighbors = 4;

            potts_grid_problem (
                label_image_type& label_img_,
                const image_potts_model& image_potts_model_
            ) : 
                label_img(label_img_),
                model(image_potts_model_)
            {
                num_nodes = model.nr()*model.nc();
                nc = model.nc();
                labels = &label_img[0][0];
            }

            unsigned long number_of_nodes (
            ) const { return num_nodes; }

            unsigned long number_of_neighbors (
                unsigned long 
            ) const 
            { 
                return 4;
            }

            unsigned long get_neighbor_idx (
                long node_id1,
                long node_id2
            ) const
            {
                long diff = node_id2-node_id1;
                if (diff > nc)
                    diff -= (long)number_of_nodes();
                else if (diff < -nc)
                    diff += (long)number_of_nodes();

                if (diff == 1) 
                    return 0;
                else if (diff == -1)
                    return 1;
                else if (diff == nc)
                    return 2;
                else
                    return 3;
            }

            unsigned long get_neighbor (
                long node_id,
                long idx
            ) const
            {
                switch(idx)
                {
                    case 0: 
                        {
                            long temp = node_id+1;
                            if (temp < (long)number_of_nodes())
                                return temp;
                            else
                                return temp - (long)number_of_nodes();
                        }
                    case 1: 
                        {
                            long temp = node_id-1;
                            if (node_id >= 1)
                                return temp;
                            else
                                return temp + (long)number_of_nodes();
                        }
                    case 2: 
                        {
                            long temp = node_id+nc;
                            if (temp < (long)number_of_nodes())
                                return temp;
                            else
                                return temp - (long)number_of_nodes();
                        }
                    case 3: 
                        {
                            long temp = node_id-nc;
                            if (node_id >= nc)
                                return temp;
                            else
                                return temp + (long)number_of_nodes();
                        }
                }
                return 0;
            }

            void set_label (
                const unsigned long& idx,
                node_label value
            )
            {
                *(labels+idx) = value;
            }

            node_label get_label (
                const unsigned long& idx
            ) const
            {
                return *(labels+idx);
            }

            typedef typename image_potts_model::value_type value_type;

            value_type factor_value (unsigned long idx) const
            {
                return model.factor_value(idx);
            }

            value_type factor_value_disagreement (unsigned long idx1, unsigned long idx2) const
            {
                return model.factor_value_disagreement(idx1,idx2);
            }

        };

    }

// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------

    template <
        typename potts_model
        >
    typename potts_model::value_type potts_model_score (
        const potts_model& prob
    )
    {
#ifdef ENABLE_ASSERTS
        for (unsigned long i = 0; i < prob.number_of_nodes(); ++i)
        {
            for (unsigned long jj = 0; jj < prob.number_of_neighbors(i); ++jj)
            {
                unsigned long j = prob.get_neighbor(i,jj);
                DLIB_ASSERT(prob.factor_value_disagreement(i,j) >= 0,
                    "\t value_type potts_model_score(prob)"
                    << "\n\t Invalid inputs were given to this function." 
                    << "\n\t i: " << i 
                    << "\n\t j: " << j 
                    << "\n\t prob.factor_value_disagreement(i,j): " << prob.factor_value_disagreement(i,j)
                    );
                DLIB_ASSERT(prob.factor_value_disagreement(i,j) == prob.factor_value_disagreement(j,i),
                    "\t value_type potts_model_score(prob)"
                    << "\n\t Invalid inputs were given to this function." 
                    << "\n\t i: " << i 
                    << "\n\t j: " << j 
                    << "\n\t prob.factor_value_disagreement(i,j): " << prob.factor_value_disagreement(i,j)
                    << "\n\t prob.factor_value_disagreement(j,i): " << prob.factor_value_disagreement(j,i)
                    );
            }
        }
#endif 

        typename potts_model::value_type score = 0;
        for (unsigned long i = 0; i < prob.number_of_nodes(); ++i)
        {
            const bool label = (prob.get_label(i)!=0);
            if (label)
                score += prob.factor_value(i);
        }

        for (unsigned long i = 0; i < prob.number_of_nodes(); ++i)
        {
            for (unsigned long n = 0; n < prob.number_of_neighbors(i); ++n)
            {
                const unsigned long idx2 = prob.get_neighbor(i,n);
                const bool label_i = (prob.get_label(i)!=0);
                const bool label_idx2 = (prob.get_label(idx2)!=0);
                if (label_i != label_idx2 && i < idx2)
                    score -= prob.factor_value_disagreement(i, idx2);
            }
        }

        return score;
    }

// ----------------------------------------------------------------------------------------

    template <
        typename graph_type 
        >
    typename graph_type::edge_type potts_model_score (
        const graph_type& g,
        const std::vector<node_label>& labels
    )
    {
        DLIB_ASSERT(graph_contains_length_one_cycle(g) == false,
                    "\t edge_type potts_model_score(g,labels)"
                    << "\n\t Invalid inputs were given to this function." 
                    );
        typedef typename graph_type::edge_type edge_type;
        typedef typename graph_type::type type;

        // The edges and node's have to use the same type to represent factor weights!
        COMPILE_TIME_ASSERT((is_same_type<edge_type, type>::value == true));

#ifdef ENABLE_ASSERTS
        for (unsigned long i = 0; i < g.number_of_nodes(); ++i)
        {
            for (unsigned long jj = 0; jj < g.node(i).number_of_neighbors(); ++jj)
            {
                unsigned long j = g.node(i).neighbor(jj).index();
                DLIB_ASSERT(edge(g,i,j) >= 0,
                    "\t edge_type potts_model_score(g,labels)"
                    << "\n\t Invalid inputs were given to this function." 
                    << "\n\t i: " << i 
                    << "\n\t j: " << j 
                    << "\n\t edge(g,i,j): " << edge(g,i,j)
                    );
            }
        }
#endif 

        typename graph_type::edge_type score = 0;
        for (unsigned long i = 0; i < g.number_of_nodes(); ++i)
        {
            const bool label = (labels[i]!=0);
            if (label)
                score += g.node(i).data;
        }

        for (unsigned long i = 0; i < g.number_of_nodes(); ++i)
        {
            for (unsigned long n = 0; n < g.node(i).number_of_neighbors(); ++n)
            {
                const unsigned long idx2 = g.node(i).neighbor(n).index();
                const bool label_i = (labels[i]!=0);
                const bool label_idx2 = (labels[idx2]!=0);
                if (label_i != label_idx2 && i < idx2)
                    score -= g.node(i).edge(n);
            }
        }

        return score;
    }

// ----------------------------------------------------------------------------------------

    template <
        typename potts_grid_problem,
        typename mem_manager
        >
    typename potts_grid_problem::value_type potts_model_score (
        const potts_grid_problem& prob,
        const array2d<node_label,mem_manager>& labels
    )
    {
        DLIB_ASSERT(prob.nr() == labels.nr() && prob.nc() == labels.nc(),
            "\t value_type potts_model_score(prob,labels)"
            << "\n\t Invalid inputs were given to this function." 
            << "\n\t prob.nr(): " << labels.nr()
            << "\n\t prob.nc(): " << labels.nc()
            );
        typedef array2d<node_label,mem_manager> image_type;
        // This const_cast is ok because the model object won't actually modify labels
        dlib::impl::potts_grid_problem<image_type,potts_grid_problem> model(const_cast<image_type&>(labels),prob);
        return potts_model_score(model);
    }

// ----------------------------------------------------------------------------------------

    template <
        typename potts_model
        >
    void find_max_factor_graph_potts (
        potts_model& prob
    )
    {
#ifdef ENABLE_ASSERTS
        for (unsigned long node_i = 0; node_i < prob.number_of_nodes(); ++node_i)
        {
            for (unsigned long jj = 0; jj < prob.number_of_neighbors(node_i); ++jj)
            {
                unsigned long node_j = prob.get_neighbor(node_i,jj);
                DLIB_ASSERT(prob.get_neighbor_idx(node_j,node_i) < prob.number_of_neighbors(node_j),
                    "\t void find_max_factor_graph_potts(prob)"
                    << "\n\t The supplied potts problem defines an invalid graph." 
                    << "\n\t node_i: " << node_i 
                    << "\n\t node_j: " << node_j 
                    << "\n\t prob.get_neighbor_idx(node_j,node_i): " << prob.get_neighbor_idx(node_j,node_i)
                    << "\n\t prob.number_of_neighbors(node_j):     " << prob.number_of_neighbors(node_j)
                            );

                DLIB_ASSERT(prob.get_neighbor_idx(node_i,prob.get_neighbor(node_i,jj)) == jj,
                    "\t void find_max_factor_graph_potts(prob)"
                    << "\n\t The get_neighbor_idx() and get_neighbor() functions must be inverses of each other." 
                    << "\n\t node_i: " << node_i 
                    << "\n\t jj:     " << jj
                    << "\n\t prob.get_neighbor(node_i,jj): " << prob.get_neighbor(node_i,jj)
                    << "\n\t prob.get_neighbor_idx(node_i,prob.get_neighbor(node_i,jj)): " << prob.get_neighbor_idx(node_i,node_j)
                            );

                DLIB_ASSERT(prob.get_neighbor(node_j,prob.get_neighbor_idx(node_j,node_i))==node_i,
                    "\t void find_max_factor_graph_potts(prob)"
                    << "\n\t The get_neighbor_idx() and get_neighbor() functions must be inverses of each other." 
                    << "\n\t node_i: " << node_i 
                    << "\n\t node_j: " << node_j 
                    << "\n\t prob.get_neighbor_idx(node_j,node_i): " << prob.get_neighbor_idx(node_j,node_i)
                    << "\n\t prob.get_neighbor(node_j,prob.get_neighbor_idx(node_j,node_i)): " << prob.get_neighbor(node_j,prob.get_neighbor_idx(node_j,node_i))
                            );

                DLIB_ASSERT(prob.factor_value_disagreement(node_i,node_j) >= 0,
                    "\t void find_max_factor_graph_potts(prob)"
                    << "\n\t Invalid inputs were given to this function." 
                    << "\n\t node_i: " << node_i 
                    << "\n\t node_j: " << node_j 
                    << "\n\t prob.factor_value_disagreement(node_i,node_j): " << prob.factor_value_disagreement(node_i,node_j)
                    );
                DLIB_ASSERT(prob.factor_value_disagreement(node_i,node_j) == prob.factor_value_disagreement(node_j,node_i),
                    "\t void find_max_factor_graph_potts(prob)"
                    << "\n\t Invalid inputs were given to this function." 
                    << "\n\t node_i: " << node_i 
                    << "\n\t node_j: " << node_j 
                    << "\n\t prob.factor_value_disagreement(node_i,node_j): " << prob.factor_value_disagreement(node_i,node_j)
                    << "\n\t prob.factor_value_disagreement(node_j,node_i): " << prob.factor_value_disagreement(node_j,node_i)
                    );
            }
        }
#endif 
        COMPILE_TIME_ASSERT(is_signed_type<typename potts_model::value_type>::value);
        min_cut mc;
        dlib::impl::potts_flow_graph<potts_model> pfg(prob);
        mc(pfg, prob.number_of_nodes(), prob.number_of_nodes()+1);
    }

// ----------------------------------------------------------------------------------------

    template <
        typename graph_type 
        >
    void find_max_factor_graph_potts (
        const graph_type& g,
        std::vector<node_label>& labels
    )
    {
        DLIB_ASSERT(graph_contains_length_one_cycle(g) == false,
                    "\t void find_max_factor_graph_potts(g,labels)"
                    << "\n\t Invalid inputs were given to this function." 
                    );
        typedef typename graph_type::edge_type edge_type;
        typedef typename graph_type::type type;

        // The edges and node's have to use the same type to represent factor weights!
        COMPILE_TIME_ASSERT((is_same_type<edge_type, type>::value == true));
        COMPILE_TIME_ASSERT(is_signed_type<edge_type>::value);

#ifdef ENABLE_ASSERTS
        for (unsigned long i = 0; i < g.number_of_nodes(); ++i)
        {
            for (unsigned long jj = 0; jj < g.node(i).number_of_neighbors(); ++jj)
            {
                unsigned long j = g.node(i).neighbor(jj).index();
                DLIB_ASSERT(edge(g,i,j) >= 0,
                    "\t void find_max_factor_graph_potts(g,labels)"
                    << "\n\t Invalid inputs were given to this function." 
                    << "\n\t i: " << i 
                    << "\n\t j: " << j 
                    << "\n\t edge(g,i,j): " << edge(g,i,j)
                    );
            }
        }
#endif 

        dlib::impl::general_potts_problem<graph_type> gg(g, labels);
        find_max_factor_graph_potts(gg);

    }

// ----------------------------------------------------------------------------------------

    template <
        typename potts_grid_problem,
        typename mem_manager
        >
    void find_max_factor_graph_potts (
        const potts_grid_problem& prob,
        array2d<node_label,mem_manager>& labels
    )
    {
        typedef array2d<node_label,mem_manager> image_type;
        labels.set_size(prob.nr(), prob.nc());
        dlib::impl::potts_grid_problem<image_type,potts_grid_problem> model(labels,prob);
        find_max_factor_graph_potts(model);
    }

// ---------------------------------------------------------------------------------------- 

    namespace impl
    {
        template <
            typename pixel_type1,
            typename pixel_type2,
            typename model_type
            >
        struct potts_grid_image_pair_model
        {
            const pixel_type1* data1;
            const pixel_type2* data2;
            const model_type& model;
            const long nr_;
            const long nc_;
            template <typename image_type1, typename image_type2>
            potts_grid_image_pair_model(
                const model_type& model_,
                const image_type1& img1,
                const image_type2& img2
            ) :
                model(model_),
                nr_(img1.nr()),
                nc_(img1.nc())
            {
                data1 = &img1[0][0];
                data2 = &img2[0][0];
            }

            typedef typename model_type::value_type value_type;

            long nr() const { return nr_; }
            long nc() const { return nc_; }

            value_type factor_value (
                unsigned long idx
            ) const 
            {
                return model.factor_value(*(data1 + idx), *(data2 + idx));
            }

            value_type factor_value_disagreement (
                unsigned long idx1,
                unsigned long idx2
            ) const 
            {
                return model.factor_value_disagreement(*(data1 + idx1), *(data1 + idx2));
            }
        };

    // ---------------------------------------------------------------------------------------- 

        template <
            typename image_type,
            typename model_type
            >
        struct potts_grid_image_single_model
        {
            const typename image_type::type* data1;
            const model_type& model;
            const long nr_;
            const long nc_;
            potts_grid_image_single_model(
                const model_type& model_,
                const image_type& img1
            ) :
                model(model_),
                nr_(img1.nr()),
                nc_(img1.nc())
            {
                data1 = &img1[0][0];
            }

            typedef typename model_type::value_type value_type;

            long nr() const { return nr_; }
            long nc() const { return nc_; }

            value_type factor_value (
                unsigned long idx
            ) const 
            {
                return model.factor_value(*(data1 + idx));
            }

            value_type factor_value_disagreement (
                unsigned long idx1,
                unsigned long idx2
            ) const 
            {
                return model.factor_value_disagreement(*(data1 + idx1), *(data1 + idx2));
            }
        };

    }

// ---------------------------------------------------------------------------------------- 

    template <
        typename pair_image_model,
        typename pixel_type1,
        typename pixel_type2,
        typename mem_manager
        >
    impl::potts_grid_image_pair_model<pixel_type1, pixel_type2, pair_image_model> make_potts_grid_problem (
        const pair_image_model& model,
        const array2d<pixel_type1,mem_manager>& img1,
        const array2d<pixel_type2,mem_manager>& img2
    )
    {
        DLIB_ASSERT(get_rect(img1) == get_rect(img2),
            "\t potts_grid_problem make_potts_grid_problem()"
            << "\n\t Invalid inputs were given to this function." 
            << "\n\t get_rect(img1): " << get_rect(img1)
            << "\n\t get_rect(img2): " << get_rect(img2)
            );
        typedef impl::potts_grid_image_pair_model<pixel_type1, pixel_type2, pair_image_model> potts_type;
        return potts_type(model,img1,img2);
    }

// ---------------------------------------------------------------------------------------- 

    template <
        typename single_image_model,
        typename pixel_type,
        typename mem_manager
        >
    impl::potts_grid_image_single_model<array2d<pixel_type,mem_manager>, single_image_model> make_potts_grid_problem (
        const single_image_model& model,
        const array2d<pixel_type,mem_manager>& img
    )
    {
        typedef impl::potts_grid_image_single_model<array2d<pixel_type,mem_manager>, single_image_model> potts_type;
        return potts_type(model,img);
    }

// ---------------------------------------------------------------------------------------- 

}

#endif // DLIB_FIND_MAX_FACTOR_GRAPH_PoTTS_Hh_

