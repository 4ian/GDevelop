// Copyright (C) 2012  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#include <sstream>
#include <string>
#include <cstdlib>
#include <ctime>
#include <dlib/svm_threaded.h>
#include <dlib/data_io.h>

#include "tester.h"

namespace  
{

    using namespace test;
    using namespace dlib;
    using namespace std;



    logger dlog("test.graph_cuts");


    template <
        typename graph_type,
        typename samples_type,
        typename labels_type
        >
    void make_data(
        samples_type& samples,
        labels_type& labels
    )
    {
        //samples.clear();
        //labels.clear();

        std::vector<bool> label;
        graph_type g;

    // ---------------------------
        g.set_number_of_nodes(4);
        label.resize(g.number_of_nodes());
        g.node(0).data = 0, 0, 1; label[0] = true;
        g.node(1).data = 0, 0, 1; label[1] = true;
        g.node(2).data = 0, 1, 0; label[2] = false;
        g.node(3).data = 0, 1, 0; label[3] = false;

        g.add_edge(0,1);
        g.add_edge(1,2);
        g.add_edge(2,3);
        g.add_edge(3,0);

        edge(g,0,1) = 1, 1;
        edge(g,1,2) = 1, 1;
        edge(g,2,3) = 1, 1;
        edge(g,3,0) = 1, 1;
        samples.push_back(g);
        labels.push_back(label);
    // ---------------------------

        g.clear();
        g.set_number_of_nodes(4);
        label.resize(g.number_of_nodes());
        g.node(0).data = 0, 0, 1; label[0] = true;
        g.node(1).data = 0, 0, 0; label[1] = true;
        g.node(2).data = 0, 1, 0; label[2] = false;
        g.node(3).data = 0, 0, 0; label[3] = false;

        g.add_edge(0,1);
        g.add_edge(1,2);
        g.add_edge(2,3);
        g.add_edge(3,0);

        edge(g,0,1) = 1, 0;
        edge(g,1,2) = 0, 1;
        edge(g,2,3) = 1, 0;
        edge(g,3,0) = 0, 1;
        samples.push_back(g);
        labels.push_back(label);
    // ---------------------------

        g.clear();
        g.set_number_of_nodes(4);
        label.resize(g.number_of_nodes());
        g.node(0).data = 0, 1, 0; label[0] = false;
        g.node(1).data = 0, 1, 0; label[1] = false;
        g.node(2).data = 0, 1, 0; label[2] = false;
        g.node(3).data = 0, 0, 0; label[3] = false;

        g.add_edge(0,1);
        g.add_edge(1,2);
        g.add_edge(2,3);
        g.add_edge(3,0);

        edge(g,0,1) = 1, 0;
        edge(g,1,2) = 0, 1;
        edge(g,2,3) = 1, 0;
        edge(g,3,0) = 0, 1;
        samples.push_back(g);
        labels.push_back(label);
    // ---------------------------
    }




    template <
        typename graph_type,
        typename samples_type,
        typename labels_type
        >
    void make_data_sparse(
        samples_type& samples,
        labels_type& labels
    )
    {
        //samples.clear();
        //labels.clear();

        std::vector<bool> label;
        graph_type g;
        typename graph_type::edge_type v;

    // ---------------------------
        g.set_number_of_nodes(4);
        label.resize(g.number_of_nodes());
        g.node(0).data[2] = 1; label[0] = true;
        g.node(1).data[2] = 1; label[1] = true;
        g.node(2).data[1] = 1; label[2] = false;
        g.node(3).data[1] = 1; label[3] = false;

        g.add_edge(0,1);
        g.add_edge(1,2);
        g.add_edge(2,3);
        g.add_edge(3,0);
        g.add_edge(3,1);

        v[0] = 1; v[1] = 1;
        edge(g,0,1) = v;
        edge(g,1,2) = v;
        edge(g,2,3) = v;
        edge(g,3,0) = v;
        samples.push_back(g);
        labels.push_back(label);
    // ---------------------------

        g.clear();
        g.set_number_of_nodes(5);
        label.resize(g.number_of_nodes());
        g.node(0).data[2] = 1; label[0] = true;
        g.node(1).data[0] = 0; label[1] = true;
        g.node(2).data[1] = 1; label[2] = false;
        g.node(3).data[0] = 0; label[3] = false;
                               label[4] = true;

        g.add_edge(0,1);
        g.add_edge(1,4);
        g.add_edge(1,2);
        g.add_edge(2,3);
        g.add_edge(3,0);

        edge(g,0,1)[0] = 1;
        edge(g,1,4)[0] = 1;
        edge(g,1,2)[1] = 1;
        edge(g,2,3)[0] = 1;
        edge(g,3,0)[1] = 1;
        samples.push_back(g);
        labels.push_back(label);
    // ---------------------------

        g.clear();
        g.set_number_of_nodes(4);
        label.resize(g.number_of_nodes());
        g.node(0).data[1] = 1; label[0] = false;
        g.node(1).data[1] = 1; label[1] = false;
        g.node(2).data[1] = 1; label[2] = false;
        g.node(3).data[1] = 0; label[3] = false;

        g.add_edge(0,1);
        g.add_edge(1,2);
        g.add_edge(2,3);
        g.add_edge(3,0);

        edge(g,0,1)[0] = 1;
        edge(g,1,2)[1] = 1;
        edge(g,2,3)[0] = 1;
        edge(g,3,0)[1] = 1;
        samples.push_back(g);
        labels.push_back(label);
    // ---------------------------
    }






    template <
        typename graph_type,
        typename samples_type,
        typename labels_type
        >
    void make_data2(
        samples_type& samples,
        labels_type& labels
    )
    {
        //samples.clear();
        //labels.clear();

        std::vector<bool> label;
        graph_type g;

    // ---------------------------
        g.set_number_of_nodes(4);
        label.resize(g.number_of_nodes());
        g.node(0).data = 0, 0, 1; label[0] = true;
        g.node(1).data = 0, 0, 1; label[1] = true;
        g.node(2).data = 0, 1, 0; label[2] = false;
        g.node(3).data = 0, 1, 0; label[3] = false;

        g.add_edge(0,1);
        g.add_edge(1,2);
        g.add_edge(2,3);
        g.add_edge(3,0);

        edge(g,0,1) = 1, 1;
        edge(g,1,2) = 1, 1;
        edge(g,2,3) = 1, 1;
        edge(g,3,0) = 1, 1;
        samples.push_back(g);
        labels.push_back(label);
    // ---------------------------
    }




    template <
        typename graph_type,
        typename samples_type,
        typename labels_type
        >
    void make_data2_sparse(
        samples_type& samples,
        labels_type& labels
    )
    {
        //samples.clear();
        //labels.clear();

        std::vector<bool> label;
        graph_type g;
        typename graph_type::edge_type v;

    // ---------------------------
        g.set_number_of_nodes(4);
        label.resize(g.number_of_nodes());
        g.node(0).data[2] = 1; label[0] = true;
        g.node(1).data[2] = 1; label[1] = true;
        g.node(2).data[1] = 1; label[2] = false;
        g.node(3).data[1] = 1; label[3] = false;

        g.add_edge(0,1);
        g.add_edge(1,2);
        g.add_edge(2,3);
        g.add_edge(3,0);

        v[0] = 1; v[1] = 1;
        edge(g,0,1) = v;
        edge(g,1,2) = v;
        edge(g,2,3) = v;
        edge(g,3,0) = v;
        samples.push_back(g);
        labels.push_back(label);
    // ---------------------------

    }





    template <
        typename node_vector_type,
        typename edge_vector_type,
        typename vector_type,
        typename graph_type
        >
    void test1(
        const dlib::array<graph_type>& samples,
        const std::vector<std::vector<bool> >& labels
    )
    {
        dlog << LINFO << "begin test1()";

        structural_graph_labeling_trainer<vector_type> trainer;
        //trainer.be_verbose();
        trainer.set_epsilon(1e-12);
        graph_labeler<vector_type> labeler = trainer.train(samples, labels);


        // test serialization code for the labeler.
        std::ostringstream sout;
        serialize(labeler, sout);
        std::istringstream sin(sout.str());
        labeler = graph_labeler<vector_type>();
        deserialize(labeler, sin);

        std::vector<bool> temp;
        for (unsigned long k = 0; k < samples.size(); ++k)
        {
            temp = labeler(samples[k]);
            for (unsigned long i = 0; i < temp.size(); ++i)
            {
                const bool true_label = (labels[k][i] != 0);
                const bool pred_label = (temp[i] != 0);
                DLIB_TEST(true_label == pred_label);
            }
        }

        matrix<double> cv;

        cv = test_graph_labeling_function(labeler, samples, labels);
        DLIB_TEST(sum(cv) == 2);
        cv = cross_validate_graph_labeling_trainer(trainer, samples, labels, 4);
        DLIB_TEST(sum(cv) == 2);

        dlog << LINFO << "edge weights: " << trans(sparse_to_dense(labeler.get_edge_weights()));
        dlog << LINFO << "node weights: " << trans(sparse_to_dense(labeler.get_node_weights()));
    }



    class graph_labeling_tester : public tester
    {
    public:
        graph_labeling_tester (
        ) :
            tester ("test_graph_labeling",
                    "Runs tests on the graph labeling component.")
        {}

        void perform_test (
        )
        {
            print_spinner();
            // test with dense vectors
            {
                typedef matrix<double,3,1> node_vector_type;
                typedef matrix<double,2,1> edge_vector_type;
                typedef matrix<double,0,1> vector_type;
                typedef dlib::graph<node_vector_type, edge_vector_type>::kernel_1a_c graph_type;

                dlib::array<graph_type> samples;
                std::vector<std::vector<bool> > labels;

                make_data<graph_type>(samples, labels);
                make_data<graph_type>(samples, labels);
                make_data<graph_type>(samples, labels);
                make_data<graph_type>(samples, labels);


                test1<node_vector_type,edge_vector_type,vector_type>(samples, labels);
            }
            print_spinner();
            // test with dense vectors and sparse vectors together 
            {
                typedef matrix<double,3,1> node_vector_type;
                typedef matrix<double,2,1> edge_vector_type;
                typedef std::map<unsigned long,double> vector_type;
                typedef dlib::graph<node_vector_type, edge_vector_type>::kernel_1a_c graph_type;

                dlib::array<graph_type> samples;
                std::vector<std::vector<bool> > labels;

                make_data<graph_type>(samples, labels);
                make_data<graph_type>(samples, labels);
                make_data<graph_type>(samples, labels);
                make_data<graph_type>(samples, labels);


                test1<node_vector_type,edge_vector_type,vector_type>(samples, labels);
            }
            print_spinner();
            // test with sparse vectors
            {
                typedef std::vector<std::pair<unsigned long,double> > vector_type;
                typedef std::map<unsigned long, double> edge_vector_type;
                typedef std::map<unsigned long, double> node_vector_type;
                typedef dlib::graph<node_vector_type, edge_vector_type>::kernel_1a_c graph_type;

                dlib::array<graph_type> samples;
                std::vector<std::vector<bool> > labels;

                make_data_sparse<graph_type>(samples, labels);
                make_data_sparse<graph_type>(samples, labels);
                make_data_sparse<graph_type>(samples, labels);
                make_data_sparse<graph_type>(samples, labels);


                test1<node_vector_type,edge_vector_type,vector_type>(samples, labels);
            }



            print_spinner();
            // test with dense vectors
            {
                typedef matrix<double,3,1> node_vector_type;
                typedef matrix<double,2,1> edge_vector_type;
                typedef matrix<double,0,1> vector_type;
                typedef dlib::graph<node_vector_type, edge_vector_type>::kernel_1a_c graph_type;

                dlib::array<graph_type> samples;
                std::vector<std::vector<bool> > labels;

                make_data2<graph_type>(samples, labels);
                make_data2<graph_type>(samples, labels);
                make_data2<graph_type>(samples, labels);
                make_data2<graph_type>(samples, labels);


                test1<node_vector_type,edge_vector_type,vector_type>(samples, labels);
            }
            print_spinner();
            // test with sparse vectors
            {
                typedef std::vector<std::pair<unsigned long,double> > vector_type;
                typedef std::map<unsigned long, double> edge_vector_type;
                typedef std::map<unsigned long, double> node_vector_type;
                typedef dlib::graph<node_vector_type, edge_vector_type>::kernel_1a_c graph_type;

                dlib::array<graph_type> samples;
                std::vector<std::vector<bool> > labels;

                make_data2_sparse<graph_type>(samples, labels);
                make_data2_sparse<graph_type>(samples, labels);
                make_data2_sparse<graph_type>(samples, labels);
                make_data2_sparse<graph_type>(samples, labels);


                test1<node_vector_type,edge_vector_type,vector_type>(samples, labels);
            }
            print_spinner();
            // test with sparse vectors and dense mix
            {
                typedef matrix<double,0,1> vector_type;
                typedef std::map<unsigned long, double> edge_vector_type;
                typedef std::map<unsigned long, double> node_vector_type;
                typedef dlib::graph<node_vector_type, edge_vector_type>::kernel_1a_c graph_type;

                dlib::array<graph_type> samples;
                std::vector<std::vector<bool> > labels;

                make_data2_sparse<graph_type>(samples, labels);
                make_data2_sparse<graph_type>(samples, labels);
                make_data2_sparse<graph_type>(samples, labels);
                make_data2_sparse<graph_type>(samples, labels);


                test1<node_vector_type,edge_vector_type,vector_type>(samples, labels);
            }
        }
    } a;


}




