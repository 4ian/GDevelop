// Copyright (C) 2012  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.

#include <dlib/clustering.h>

#include "tester.h"

namespace  
{
    using namespace test;
    using namespace dlib;
    using namespace std;

    logger dlog("test.clustering");

// ----------------------------------------------------------------------------------------

    void make_test_graph(
        dlib::rand& rnd,
        std::vector<sample_pair>& edges,
        std::vector<unsigned long>& labels,
        const int groups,
        const int group_size,
        const int noise_level,
        const double missed_edges
    )
    {
        labels.resize(groups*group_size);

        for (unsigned long i = 0; i < labels.size(); ++i)
        {
            labels[i] = i/group_size;
        }

        edges.clear();
        for (int i = 0; i < groups; ++i)
        {
            for (int j = 0; j < group_size; ++j)
            {
                for (int k = 0; k < group_size; ++k)
                {
                    if (j == k)
                        continue;

                    if (rnd.get_random_double() < missed_edges)
                        continue;

                    edges.push_back(sample_pair(j+group_size*i, k+group_size*i, 1));
                }
            }
        }

        for (int k = 0; k < groups*noise_level; ++k)
        {
            const int i = rnd.get_random_32bit_number()%labels.size();
            const int j = rnd.get_random_32bit_number()%labels.size();
            edges.push_back(sample_pair(i,j,1));
        }

    }

// ----------------------------------------------------------------------------------------

    void make_modularity_matrices (
        const std::vector<sample_pair>& edges,
        matrix<double>& A,
        matrix<double>& P,
        double& m
    )
    {
        const unsigned long num_nodes = max_index_plus_one(edges);
        A.set_size(num_nodes, num_nodes);
        P.set_size(num_nodes, num_nodes);
        A = 0;
        P = 0;
        std::vector<double> k(num_nodes,0);

        for (unsigned long i = 0; i < edges.size(); ++i)
        {
            const unsigned long n1 = edges[i].index1();
            const unsigned long n2 = edges[i].index2();
            k[n1] += edges[i].distance();
            if (n1 != n2)
            {
                k[n2] += edges[i].distance();
                A(n2,n1) += edges[i].distance();
            }

            A(n1,n2) += edges[i].distance();
        }

        m = sum(A)/2;

        for (long r = 0; r < P.nr(); ++r)
        {
            for (long c = 0; c < P.nc(); ++c)
            {
                P(r,c) = k[r]*k[c]/(2*m);
            }
        }

    }

    double compute_modularity_simple (
        const std::vector<sample_pair>& edges,
        std::vector<unsigned long> labels
    )
    {
        double m;
        matrix<double> A,P;
        make_modularity_matrices(edges, A, P, m);
        matrix<double> B = A - P;

        double Q = 0;
        for (long r = 0; r < B.nr(); ++r)
        {
            for (long c = 0; c < B.nc(); ++c)
            {
                if (labels[r] == labels[c])
                {
                    Q += B(r,c);
                }
            }
        }
        return 1.0/(2*m) * Q;
    }

// ----------------------------------------------------------------------------------------

    void test_modularity(dlib::rand& rnd)
    {
        print_spinner();
        std::vector<sample_pair> edges;
        std::vector<ordered_sample_pair> oedges;
        std::vector<unsigned long> labels;

        make_test_graph(rnd, edges, labels, 10, 30, 3, 0.10);
        if (rnd.get_random_double() < 0.5)
            remove_duplicate_edges(edges);
        convert_unordered_to_ordered(edges, oedges);


        const double m1 = modularity(edges, labels);
        const double m2 = compute_modularity_simple(edges, labels);
        const double m3 = modularity(oedges, labels);

        DLIB_TEST(std::abs(m1-m2) < 1e-12);
        DLIB_TEST(std::abs(m2-m3) < 1e-12);
        DLIB_TEST(std::abs(m3-m1) < 1e-12);
    }

    void test_newman_clustering(dlib::rand& rnd)
    {
        print_spinner();
        std::vector<sample_pair> edges;
        std::vector<unsigned long> labels;

        make_test_graph(rnd, edges, labels, 5, 30, 3, 0.10);
        if (rnd.get_random_double() < 0.5)
            remove_duplicate_edges(edges);


        std::vector<unsigned long> labels2;

        unsigned long num_clusters = newman_cluster(edges, labels2);
        DLIB_TEST(labels.size() == labels2.size());
        DLIB_TEST(num_clusters == 5);

        for (unsigned long i = 0; i < labels.size(); ++i)
        {
            for (unsigned long j = 0; j < labels.size(); ++j)
            {
                if (labels[i] == labels[j])
                {
                    DLIB_TEST(labels2[i] == labels2[j]);
                }
                else
                {
                    DLIB_TEST(labels2[i] != labels2[j]);
                }
            }
        }
    }

    void test_chinese_whispers(dlib::rand& rnd)
    {
        print_spinner();
        std::vector<sample_pair> edges;
        std::vector<unsigned long> labels;

        make_test_graph(rnd, edges, labels, 5, 30, 3, 0.10);
        if (rnd.get_random_double() < 0.5)
            remove_duplicate_edges(edges);


        std::vector<unsigned long> labels2;

        unsigned long num_clusters;
        if (rnd.get_random_double() < 0.5)
            num_clusters = chinese_whispers(edges, labels2, 200, rnd);
        else
            num_clusters = chinese_whispers(edges, labels2);

        DLIB_TEST(labels.size() == labels2.size());
        DLIB_TEST(num_clusters == 5);

        for (unsigned long i = 0; i < labels.size(); ++i)
        {
            for (unsigned long j = 0; j < labels.size(); ++j)
            {
                if (labels[i] == labels[j])
                {
                    DLIB_TEST(labels2[i] == labels2[j]);
                }
                else
                {
                    DLIB_TEST(labels2[i] != labels2[j]);
                }
            }
        }
    }

    class test_clustering : public tester
    {
    public:
        test_clustering (
        ) :
            tester ("test_clustering",
                    "Runs tests on the clustering routines.")
        {}

        void perform_test (
        )
        {
            dlib::rand rnd;

            std::vector<sample_pair> edges;
            std::vector<unsigned long> labels;
            DLIB_TEST(newman_cluster(edges, labels) == 0);
            DLIB_TEST(chinese_whispers(edges, labels) == 0);

            edges.push_back(sample_pair(0,1,1));
            DLIB_TEST(newman_cluster(edges, labels) == 1);
            DLIB_TEST(labels.size() == 2);
            DLIB_TEST(chinese_whispers(edges, labels) == 1);
            DLIB_TEST(labels.size() == 2);

            edges.clear();
            edges.push_back(sample_pair(0,0,1));
            DLIB_TEST(newman_cluster(edges, labels) == 1);
            DLIB_TEST(labels.size() == 1);
            DLIB_TEST(chinese_whispers(edges, labels) == 1);
            DLIB_TEST(labels.size() == 1);

            edges.clear();
            edges.push_back(sample_pair(1,1,1));
            DLIB_TEST(newman_cluster(edges, labels) == 1);
            DLIB_TEST(labels.size() == 2);
            DLIB_TEST(chinese_whispers(edges, labels) == 2);
            DLIB_TEST(labels.size() == 2);

            edges.push_back(sample_pair(0,0,1));
            DLIB_TEST(newman_cluster(edges, labels) == 2);
            DLIB_TEST(labels.size() == 2);
            DLIB_TEST(chinese_whispers(edges, labels) == 2);
            DLIB_TEST(labels.size() == 2);


            for (int i = 0; i < 10; ++i)
                test_modularity(rnd);

            for (int i = 0; i < 10; ++i)
                test_newman_clustering(rnd);

            for (int i = 0; i < 10; ++i)
                test_chinese_whispers(rnd);


        }
    } a;



}



