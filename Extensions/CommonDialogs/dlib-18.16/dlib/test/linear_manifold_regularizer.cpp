// Copyright (C) 2010  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.

#include "tester.h"
#include <dlib/manifold_regularization.h>
#include <dlib/svm.h>
#include <dlib/rand.h>
#include <dlib/string.h>
#include <dlib/graph_utils_threaded.h>
#include <vector>
#include <sstream>
#include <ctime>

namespace  
{
    using namespace test;
    using namespace dlib;
    using namespace std;
    dlib::logger dlog("test.linear_manifold_regularizer");

    template <typename hash_type, typename samples_type>
    void test_find_k_nearest_neighbors_lsh(
        const samples_type& samples
    )
    {
        std::vector<sample_pair> edges1, edges2;

        find_k_nearest_neighbors(samples, cosine_distance(), 2, edges1);
        find_k_nearest_neighbors_lsh(samples, cosine_distance(), hash_type(), 2, 6, edges2, 2);

        std::sort(edges1.begin(), edges1.end(), order_by_index<sample_pair>);
        std::sort(edges2.begin(), edges2.end(), order_by_index<sample_pair>);

        DLIB_TEST_MSG(edges1.size() == edges2.size(), edges1.size() << "    " << edges2.size());
        for (unsigned long i = 0; i < edges1.size(); ++i)
        {
            DLIB_TEST(edges1[i] == edges2[i]);
            DLIB_TEST_MSG(std::abs(edges1[i].distance() - edges2[i].distance()) < 1e-7,
                edges1[i].distance() - edges2[i].distance());
        }
    }

    template <typename scalar_type>
    void test_knn_lsh_sparse()
    {
        dlib::rand rnd;
        std::vector<std::map<unsigned long,scalar_type> > samples;
        samples.resize(20);
        for (unsigned int i = 0; i < samples.size(); ++i)
        {
            samples[i][0] = rnd.get_random_gaussian();
            samples[i][2] = rnd.get_random_gaussian();
        }

        test_find_k_nearest_neighbors_lsh<hash_similar_angles_64>(samples);
        test_find_k_nearest_neighbors_lsh<hash_similar_angles_128>(samples);
        test_find_k_nearest_neighbors_lsh<hash_similar_angles_256>(samples);
        test_find_k_nearest_neighbors_lsh<hash_similar_angles_512>(samples);
    }

    template <typename scalar_type>
    void test_knn_lsh_dense()
    {
        dlib::rand rnd;
        std::vector<matrix<scalar_type,0,1> > samples;
        samples.resize(20);
        for (unsigned int i = 0; i < samples.size(); ++i)
        {
            samples[i].set_size(2);
            samples[i](0) = rnd.get_random_gaussian();
            samples[i](1) = rnd.get_random_gaussian();
        }

        test_find_k_nearest_neighbors_lsh<hash_similar_angles_64>(samples);
        test_find_k_nearest_neighbors_lsh<hash_similar_angles_128>(samples);
        test_find_k_nearest_neighbors_lsh<hash_similar_angles_256>(samples);
        test_find_k_nearest_neighbors_lsh<hash_similar_angles_512>(samples);
    }



    class linear_manifold_regularizer_tester : public tester
    {
        /*!
            WHAT THIS OBJECT REPRESENTS
                This object represents a unit test.  When it is constructed
                it adds itself into the testing framework.
        !*/
    public:
        linear_manifold_regularizer_tester (
        ) :
            tester (
                "test_linear_manifold_regularizer",       // the command line argument name for this test
                "Run tests on the linear_manifold_regularizer object.", // the command line argument description
                0                     // the number of command line arguments for this test
            )
        {
            seed = 1;
        }

        dlib::rand rnd;

        unsigned long seed;

        typedef matrix<double, 0, 1> sample_type;
        typedef radial_basis_kernel<sample_type> kernel_type;

        void do_the_test()
        {
            print_spinner();
            std::vector<sample_type> samples;

            // Declare an instance of the kernel we will be using.  
            const kernel_type kern(0.1);

            const unsigned long num_points = 200;

            // create a large dataset with two concentric circles.  
            generate_circle(samples, 1, num_points);  // circle of radius 1
            generate_circle(samples, 5, num_points);  // circle of radius 5

            std::vector<sample_pair> edges;
            find_percent_shortest_edges_randomly(samples, squared_euclidean_distance(0.1, 4), 1, 10000, "random seed", edges);

            dlog << LTRACE << "number of edges generated: " << edges.size();

            empirical_kernel_map<kernel_type> ekm;

            ekm.load(kern, randomly_subsample(samples, 100));

            // Project all the samples into the span of our 50 basis samples
            for (unsigned long i = 0; i < samples.size(); ++i)
                samples[i] = ekm.project(samples[i]);


            // Now create the manifold regularizer.   The result is a transformation matrix that
            // embodies the manifold assumption discussed above. 
            linear_manifold_regularizer<sample_type> lmr;
            lmr.build(samples, edges, use_gaussian_weights(0.1));
            matrix<double> T = lmr.get_transformation_matrix(10000);

            print_spinner();

            // generate the T matrix manually and make sure it matches.  The point of this test
            // is to make sure that the more complex version of this that happens inside the linear_manifold_regularizer
            // is correct.  It uses a tedious block of loops to do it in a way that is a lot faster for sparse
            // W matrices but isn't super straight forward.  
            matrix<double> X(samples[0].size(), samples.size());
            for (unsigned long i = 0; i < samples.size(); ++i)
                set_colm(X,i) = samples[i];

            matrix<double> W(samples.size(), samples.size());
            W = 0;
            for (unsigned long i = 0; i < edges.size(); ++i)
            {
                W(edges[i].index1(), edges[i].index2()) = use_gaussian_weights(0.1)(edges[i]);
                W(edges[i].index2(), edges[i].index1()) = use_gaussian_weights(0.1)(edges[i]);
            }
            matrix<double> L = diagm(sum_rows(W)) - W;
            matrix<double> trueT = inv_lower_triangular(chol(identity_matrix<double>(X.nr()) + (10000.0/sum(lowerm(W)))*X*L*trans(X)));

            dlog << LTRACE << "T error: "<< max(abs(T - trueT));
            DLIB_TEST(max(abs(T - trueT)) < 1e-7);


            print_spinner();
            // Apply the transformation generated by the linear_manifold_regularizer to 
            // all our samples.
            for (unsigned long i = 0; i < samples.size(); ++i)
                samples[i] = T*samples[i];


            // For convenience, generate a projection_function and merge the transformation
            // matrix T into it.  
            projection_function<kernel_type> proj = ekm.get_projection_function();
            proj.weights = T*proj.weights;


            // Pick 2 different labeled points.  One on the inner circle and another on the outer.  
            // For each of these test points we will see if using the single plane that separates
            // them is a good way to separate the concentric circles.  Also do this a bunch 
            // of times with different randomly chosen points so we can see how robust the result is.
            for (int itr = 0; itr < 10; ++itr)
            {
                print_spinner();
                std::vector<sample_type> test_points;
                // generate a random point from the radius 1 circle
                generate_circle(test_points, 1, 1);
                // generate a random point from the radius 5 circle
                generate_circle(test_points, 5, 1);

                // project the two test points into kernel space.  Recall that this projection_function
                // has the manifold regularizer incorporated into it.  
                const sample_type class1_point = proj(test_points[0]);
                const sample_type class2_point = proj(test_points[1]);

                double num_wrong = 0;

                // Now attempt to classify all the data samples according to which point
                // they are closest to.  The output of this program shows that without manifold 
                // regularization this test will fail but with it it will perfectly classify
                // all the points.
                for (unsigned long i = 0; i < samples.size(); ++i)
                {
                    double distance_to_class1 = length(samples[i] - class1_point);
                    double distance_to_class2 = length(samples[i] - class2_point);

                    bool predicted_as_class_1 = (distance_to_class1 < distance_to_class2);

                    bool really_is_class_1 = (i < num_points);

                    // now count how many times we make a mistake
                    if (predicted_as_class_1 != really_is_class_1)
                        ++num_wrong;
                }

                DLIB_TEST_MSG(num_wrong == 0, num_wrong);
            }

        }

        void generate_circle (
            std::vector<sample_type>& samples,
            double radius,
            const long num
        )
        {
            sample_type m(2,1);

            for (long i = 0; i < num; ++i)
            {
                double sign = 1;
                if (rnd.get_random_double() < 0.5)
                    sign = -1;
                m(0) = 2*radius*rnd.get_random_double()-radius;
                m(1) = sign*sqrt(radius*radius - m(0)*m(0));

                samples.push_back(m);
            }
        }


        void test_knn1()
        {
            std::vector<matrix<double,2,1> > samples;

            matrix<double,2,1> test;
            
            test = 0,0;  samples.push_back(test);
            test = 1,1;  samples.push_back(test);
            test = 1,-1;  samples.push_back(test);
            test = -1,1;  samples.push_back(test);
            test = -1,-1;  samples.push_back(test);

            std::vector<sample_pair> edges;
            find_k_nearest_neighbors(samples, squared_euclidean_distance(), 1, edges);
            DLIB_TEST(edges.size() == 4);

            std::sort(edges.begin(), edges.end(), &order_by_index<sample_pair>);

            DLIB_TEST(edges[0] == sample_pair(0,1,0));
            DLIB_TEST(edges[1] == sample_pair(0,2,0));
            DLIB_TEST(edges[2] == sample_pair(0,3,0));
            DLIB_TEST(edges[3] == sample_pair(0,4,0));

            find_k_nearest_neighbors(samples, squared_euclidean_distance(), 3, edges);
            DLIB_TEST(edges.size() == 8);

            find_k_nearest_neighbors(samples, squared_euclidean_distance(3.9, 4.1), 3, edges);
            DLIB_TEST(edges.size() == 4);

            std::sort(edges.begin(), edges.end(), &order_by_index<sample_pair>);

            DLIB_TEST(edges[0] == sample_pair(1,2,0));
            DLIB_TEST(edges[1] == sample_pair(1,3,0));
            DLIB_TEST(edges[2] == sample_pair(2,4,0));
            DLIB_TEST(edges[3] == sample_pair(3,4,0));

            find_k_nearest_neighbors(samples, squared_euclidean_distance(30000, 4.1), 3, edges);
            DLIB_TEST(edges.size() == 0);
        }

        void test_knn1_approx()
        {
            std::vector<matrix<double,2,1> > samples;

            matrix<double,2,1> test;
            
            test = 0,0;  samples.push_back(test);
            test = 1,1;  samples.push_back(test);
            test = 1,-1;  samples.push_back(test);
            test = -1,1;  samples.push_back(test);
            test = -1,-1;  samples.push_back(test);

            std::vector<sample_pair> edges;
            find_approximate_k_nearest_neighbors(samples, squared_euclidean_distance(), 1, 10000, seed, edges);
            DLIB_TEST(edges.size() == 4);

            std::sort(edges.begin(), edges.end(), &order_by_index<sample_pair>);

            DLIB_TEST(edges[0] == sample_pair(0,1,0));
            DLIB_TEST(edges[1] == sample_pair(0,2,0));
            DLIB_TEST(edges[2] == sample_pair(0,3,0));
            DLIB_TEST(edges[3] == sample_pair(0,4,0));

            find_approximate_k_nearest_neighbors(samples, squared_euclidean_distance(), 3, 10000, seed, edges);
            DLIB_TEST(edges.size() == 8);

            find_approximate_k_nearest_neighbors(samples, squared_euclidean_distance(3.9, 4.1), 3, 10000, seed, edges);
            DLIB_TEST(edges.size() == 4);

            std::sort(edges.begin(), edges.end(), &order_by_index<sample_pair>);

            DLIB_TEST(edges[0] == sample_pair(1,2,0));
            DLIB_TEST(edges[1] == sample_pair(1,3,0));
            DLIB_TEST(edges[2] == sample_pair(2,4,0));
            DLIB_TEST(edges[3] == sample_pair(3,4,0));

            find_approximate_k_nearest_neighbors(samples, squared_euclidean_distance(30000, 4.1), 3, 10000, seed, edges);
            DLIB_TEST(edges.size() == 0);
        }

        void test_knn2()
        {
            std::vector<matrix<double,2,1> > samples;

            matrix<double,2,1> test;
            
            test = 1,1;  samples.push_back(test);
            test = 1,-1;  samples.push_back(test);
            test = -1,1;  samples.push_back(test);
            test = -1,-1;  samples.push_back(test);

            std::vector<sample_pair> edges;
            find_k_nearest_neighbors(samples, squared_euclidean_distance(), 2, edges);
            DLIB_TEST(edges.size() == 4);

            std::sort(edges.begin(), edges.end(), &order_by_index<sample_pair>);

            DLIB_TEST(edges[0] == sample_pair(0,1,0));
            DLIB_TEST(edges[1] == sample_pair(0,2,0));
            DLIB_TEST(edges[2] == sample_pair(1,3,0));
            DLIB_TEST(edges[3] == sample_pair(2,3,0));

            find_k_nearest_neighbors(samples, squared_euclidean_distance(), 200, edges);
            DLIB_TEST(edges.size() == 4*3/2);
        }

        void test_knn2_approx()
        {
            std::vector<matrix<double,2,1> > samples;

            matrix<double,2,1> test;
            
            test = 1,1;  samples.push_back(test);
            test = 1,-1;  samples.push_back(test);
            test = -1,1;  samples.push_back(test);
            test = -1,-1;  samples.push_back(test);

            std::vector<sample_pair> edges;
            // For this simple graph and high number of samples we will do we should obtain the exact 
            // knn solution.
            find_approximate_k_nearest_neighbors(samples, squared_euclidean_distance(), 2, 10000, seed,  edges);
            DLIB_TEST(edges.size() == 4);

            std::sort(edges.begin(), edges.end(), &order_by_index<sample_pair>);

            DLIB_TEST(edges[0] == sample_pair(0,1,0));
            DLIB_TEST(edges[1] == sample_pair(0,2,0));
            DLIB_TEST(edges[2] == sample_pair(1,3,0));
            DLIB_TEST(edges[3] == sample_pair(2,3,0));


            find_approximate_k_nearest_neighbors(samples, squared_euclidean_distance(), 200, 10000, seed,  edges);
            DLIB_TEST(edges.size() == 4*3/2);
        }

        void perform_test (
        )
        {
            for (int i = 0; i < 5; ++i)
            {
                do_the_test();

                ++seed;
                test_knn1_approx();
                test_knn2_approx();
            }
            test_knn1();
            test_knn2();
            test_knn_lsh_sparse<double>();
            test_knn_lsh_sparse<float>();
            test_knn_lsh_dense<double>();
            test_knn_lsh_dense<float>();

        }
    };

    // Create an instance of this object.  Doing this causes this test
    // to be automatically inserted into the testing framework whenever this cpp file
    // is linked into the project.  Note that since we are inside an unnamed-namespace 
    // we won't get any linker errors about the symbol a being defined multiple times. 
    linear_manifold_regularizer_tester a;

}



