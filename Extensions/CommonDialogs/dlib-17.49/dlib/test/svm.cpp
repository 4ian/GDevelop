// Copyright (C) 2006  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.


#include <dlib/matrix.h>
#include <sstream>
#include <string>
#include <cstdlib>
#include <ctime>
#include <vector>
#include "../stl_checked.h"
#include "../array.h"
#include "../rand.h"
#include "checkerboard.h"
#include <dlib/statistics.h>

#include "tester.h"
#include <dlib/svm_threaded.h>


namespace  
{

    using namespace test;
    using namespace dlib;
    using namespace std;

    logger dlog("test.svm");

// ----------------------------------------------------------------------------------------

    void test_clutering (
    )
    {
        dlog << LINFO << "   being test_clutering()";
        // Here we declare that our samples will be 2 dimensional column vectors.  
        typedef matrix<double,2,1> sample_type;

        // Now we are making a typedef for the kind of kernel we want to use.  I picked the
        // radial basis kernel because it only has one parameter and generally gives good
        // results without much fiddling.
        typedef radial_basis_kernel<sample_type> kernel_type;

        // Here we declare an instance of the kcentroid object.  The first argument to the constructor
        // is the kernel we wish to use.  The second is a parameter that determines the numerical 
        // accuracy with which the object will perform part of the learning algorithm.  Generally
        // smaller values give better results but cause the algorithm to run slower.  You just have
        // to play with it to decide what balance of speed and accuracy is right for your problem.
        // Here we have set it to 0.01.
        kcentroid<kernel_type> kc(kernel_type(0.1),0.01);

        // Now we make an instance of the kkmeans object and tell it to use kcentroid objects
        // that are configured with the parameters from the kc object we defined above.
        kkmeans<kernel_type> test(kc);

        std::vector<sample_type> samples;
        std::vector<sample_type> initial_centers;

        sample_type m;

        dlib::rand rnd;

        print_spinner();
        // we will make 50 points from each class
        const long num = 50;

        // make some samples near the origin
        double radius = 0.5;
        for (long i = 0; i < num; ++i)
        {
            double sign = 1;
            if (rnd.get_random_double() < 0.5)
                sign = -1;
            m(0) = 2*radius*rnd.get_random_double()-radius;
            m(1) = sign*sqrt(radius*radius - m(0)*m(0));

            // add this sample to our set of samples we will run k-means 
            samples.push_back(m);
        }

        // make some samples in a circle around the origin but far away
        radius = 10.0;
        for (long i = 0; i < num; ++i)
        {
            double sign = 1;
            if (rnd.get_random_double() < 0.5)
                sign = -1;
            m(0) = 2*radius*rnd.get_random_double()-radius;
            m(1) = sign*sqrt(radius*radius - m(0)*m(0));

            // add this sample to our set of samples we will run k-means 
            samples.push_back(m);
        }

        // make some samples in a circle around the point (25,25) 
        radius = 4.0;
        for (long i = 0; i < num; ++i)
        {
            double sign = 1;
            if (rnd.get_random_double() < 0.5)
                sign = -1;
            m(0) = 2*radius*rnd.get_random_double()-radius;
            m(1) = sign*sqrt(radius*radius - m(0)*m(0));

            // translate this point away from the origin
            m(0) += 25;
            m(1) += 25;

            // add this sample to our set of samples we will run k-means 
            samples.push_back(m);
        }
        print_spinner();

        // tell the kkmeans object we made that we want to run k-means with k set to 3. 
        // (i.e. we want 3 clusters)
        test.set_number_of_centers(3);

        // You need to pick some initial centers for the k-means algorithm.  So here
        // we will use the dlib::pick_initial_centers() function which tries to find
        // n points that are far apart (basically).  
        pick_initial_centers(3, initial_centers, samples, test.get_kernel());

        print_spinner();
        // now run the k-means algorithm on our set of samples.  
        test.train(samples,initial_centers);
        print_spinner();

        const unsigned long class1 = test(samples[0]);
        const unsigned long class2 = test(samples[num]);
        const unsigned long class3 = test(samples[2*num]);
        // now loop over all our samples and print out their predicted class.  In this example
        // all points are correctly identified.
        for (unsigned long i = 0; i < samples.size()/3; ++i)
        {
            DLIB_TEST(test(samples[i]) == class1);
            DLIB_TEST(test(samples[i+num]) == class2);
            DLIB_TEST(test(samples[i+2*num]) == class3);
        }

        dlog << LINFO << "   end test_clutering()";
    }

// ----------------------------------------------------------------------------------------

    // Here is the sinc function we will be trying to learn with the krls
    // object.
    double sinc(double x)
    {
        if (x == 0)
            return 1;
        return sin(x)/x;
    }


    void test_regression (
    )
    {
        dlog << LINFO << "   being test_regression()";
        // Here we declare that our samples will be 1 dimensional column vectors.  The reason for
        // using a matrix here is that in general you can use N dimensional vectors as inputs to the
        // krls object.  But here we only have 1 dimension to make the example simple.
        typedef matrix<double,1,1> sample_type;

        // Now we are making a typedef for the kind of kernel we want to use.  I picked the
        // radial basis kernel because it only has one parameter and generally gives good
        // results without much fiddling.
        typedef radial_basis_kernel<sample_type> kernel_type;

        // Here we declare an instance of the krls object.  The first argument to the constructor
        // is the kernel we wish to use.  The second is a parameter that determines the numerical 
        // accuracy with which the object will perform part of the regression algorithm.  Generally
        // smaller values give better results but cause the algorithm to run slower.  You just have
        // to play with it to decide what balance of speed and accuracy is right for your problem.
        // Here we have set it to 0.001.
        krls<kernel_type> test(kernel_type(0.1),0.001);
        rvm_regression_trainer<kernel_type> rvm_test;
        rvm_test.set_kernel(test.get_kernel());

        krr_trainer<kernel_type> krr_test;
        krr_test.set_kernel(test.get_kernel());

        svr_trainer<kernel_type> svr_test;
        svr_test.set_kernel(test.get_kernel());
        svr_test.set_epsilon_insensitivity(0.0001);
        svr_test.set_c(10);

        rbf_network_trainer<kernel_type> rbf_test;
        rbf_test.set_kernel(test.get_kernel());
        rbf_test.set_num_centers(13);

        print_spinner();
        std::vector<sample_type> samples;
        std::vector<sample_type> samples2;
        std::vector<double> labels;
        std::vector<double> labels2;
        // now we train our object on a few samples of the sinc function.
        sample_type m;
        for (double x = -10; x <= 5; x += 0.6)
        {
            m(0) = x;
            test.train(m, sinc(x));

            samples.push_back(m);
            samples2.push_back(m);
            labels.push_back(sinc(x));
            labels2.push_back(2);
        }

        print_spinner();
        decision_function<kernel_type> test2 = rvm_test.train(samples, labels);
        print_spinner();
        decision_function<kernel_type> test3 = rbf_test.train(samples, labels);
        print_spinner();
        decision_function<kernel_type> test4 = krr_test.train(samples, labels);
        print_spinner();
        decision_function<kernel_type> test5 = svr_test.train(samples, labels);
        print_spinner();

        // now we output the value of the sinc function for a few test points as well as the 
        // value predicted by krls object.
        m(0) = 2.5; dlog << LDEBUG << "krls: " << sinc(m(0)) << "   " << test(m); DLIB_TEST(abs(sinc(m(0)) - test(m)) < 0.01);
        m(0) = 0.1; dlog << LDEBUG << "krls: " << sinc(m(0)) << "   " << test(m); DLIB_TEST(abs(sinc(m(0)) - test(m)) < 0.01);
        m(0) = -4;  dlog << LDEBUG << "krls: " << sinc(m(0)) << "   " << test(m); DLIB_TEST(abs(sinc(m(0)) - test(m)) < 0.01);
        m(0) = 5.0; dlog << LDEBUG << "krls: " << sinc(m(0)) << "   " << test(m); DLIB_TEST(abs(sinc(m(0)) - test(m)) < 0.01);

        m(0) = 2.5; dlog << LDEBUG << "rvm: " << sinc(m(0)) << "   " << test2(m); DLIB_TEST(abs(sinc(m(0)) - test2(m)) < 0.01);
        m(0) = 0.1; dlog << LDEBUG << "rvm: " << sinc(m(0)) << "   " << test2(m); DLIB_TEST(abs(sinc(m(0)) - test2(m)) < 0.01);
        m(0) = -4;  dlog << LDEBUG << "rvm: " << sinc(m(0)) << "   " << test2(m); DLIB_TEST(abs(sinc(m(0)) - test2(m)) < 0.01);
        m(0) = 5.0; dlog << LDEBUG << "rvm: " << sinc(m(0)) << "   " << test2(m); DLIB_TEST(abs(sinc(m(0)) - test2(m)) < 0.01);

        m(0) = 2.5; dlog << LDEBUG << "rbf: " << sinc(m(0)) << "   " << test3(m); DLIB_TEST(abs(sinc(m(0)) - test3(m)) < 0.01);
        m(0) = 0.1; dlog << LDEBUG << "rbf: " << sinc(m(0)) << "   " << test3(m); DLIB_TEST(abs(sinc(m(0)) - test3(m)) < 0.01);
        m(0) = -4;  dlog << LDEBUG << "rbf: " << sinc(m(0)) << "   " << test3(m); DLIB_TEST(abs(sinc(m(0)) - test3(m)) < 0.01);
        m(0) = 5.0; dlog << LDEBUG << "rbf: " << sinc(m(0)) << "   " << test3(m); DLIB_TEST(abs(sinc(m(0)) - test3(m)) < 0.01);

        m(0) = 2.5; dlog << LDEBUG << "krr: " << sinc(m(0)) << "   " << test4(m); DLIB_TEST(abs(sinc(m(0)) - test4(m)) < 0.01);
        m(0) = 0.1; dlog << LDEBUG << "krr: " << sinc(m(0)) << "   " << test4(m); DLIB_TEST(abs(sinc(m(0)) - test4(m)) < 0.01);
        m(0) = -4;  dlog << LDEBUG << "krr: " << sinc(m(0)) << "   " << test4(m); DLIB_TEST(abs(sinc(m(0)) - test4(m)) < 0.01);
        m(0) = 5.0; dlog << LDEBUG << "krr: " << sinc(m(0)) << "   " << test4(m); DLIB_TEST(abs(sinc(m(0)) - test4(m)) < 0.01);

        m(0) = 2.5; dlog << LDEBUG << "svr: " << sinc(m(0)) << "   " << test5(m); DLIB_TEST(abs(sinc(m(0)) - test5(m)) < 0.01);
        m(0) = 0.1; dlog << LDEBUG << "svr: " << sinc(m(0)) << "   " << test5(m); DLIB_TEST(abs(sinc(m(0)) - test5(m)) < 0.01);
        m(0) = -4;  dlog << LDEBUG << "svr: " << sinc(m(0)) << "   " << test5(m); DLIB_TEST(abs(sinc(m(0)) - test5(m)) < 0.01);
        m(0) = 5.0; dlog << LDEBUG << "svr: " << sinc(m(0)) << "   " << test5(m); DLIB_TEST(abs(sinc(m(0)) - test5(m)) < 0.01);


        randomize_samples(samples, labels);
        dlog << LINFO << "KRR MSE and R-squared: "<< cross_validate_regression_trainer(krr_test, samples, labels, 6);
        dlog << LINFO << "SVR MSE and R-squared: "<< cross_validate_regression_trainer(svr_test, samples, labels, 6);
        matrix<double,1,2> cv = cross_validate_regression_trainer(krr_test, samples, labels, 6);
        DLIB_TEST(cv(0) < 1e-4);
        DLIB_TEST(cv(1) > 0.99);
        cv = cross_validate_regression_trainer(svr_test, samples, labels, 6);
        DLIB_TEST(cv(0) < 1e-4);
        DLIB_TEST(cv(1) > 0.99);




        randomize_samples(samples2, labels2);
        dlog << LINFO << "KRR MSE and R-squared: "<< cross_validate_regression_trainer(krr_test, samples2, labels2, 6);
        dlog << LINFO << "SVR MSE and R-squared: "<< cross_validate_regression_trainer(svr_test, samples2, labels2, 6);
        cv = cross_validate_regression_trainer(krr_test, samples2, labels2, 6);
        DLIB_TEST(cv(0) < 1e-4);
        cv = cross_validate_regression_trainer(svr_test, samples2, labels2, 6);
        DLIB_TEST(cv(0) < 1e-4);

        dlog << LINFO << "   end test_regression()";
    }

// ----------------------------------------------------------------------------------------

    void test_anomaly_detection (
    ) 
    {
        dlog << LINFO << "   begin test_anomaly_detection()";
        // Here we declare that our samples will be 2 dimensional column vectors.  
        typedef matrix<double,2,1> sample_type;

        // Now we are making a typedef for the kind of kernel we want to use.  I picked the
        // radial basis kernel because it only has one parameter and generally gives good
        // results without much fiddling.
        typedef radial_basis_kernel<sample_type> kernel_type;

        // Here we declare an instance of the kcentroid object.  The first argument to the constructor
        // is the kernel we wish to use.  The second is a parameter that determines the numerical 
        // accuracy with which the object will perform part of the learning algorithm.  Generally
        // smaller values give better results but cause the algorithm to run slower.  You just have
        // to play with it to decide what balance of speed and accuracy is right for your problem.
        // Here we have set it to 0.01.
        kcentroid<kernel_type> test(kernel_type(0.1),0.01);


        svm_one_class_trainer<kernel_type> one_class_trainer;
        one_class_trainer.set_nu(0.4);
        one_class_trainer.set_kernel(kernel_type(0.2));

        std::vector<sample_type> samples;

        // now we train our object on a few samples of the sinc function.
        sample_type m;
        for (double x = -15; x <= 8; x += 1)
        {
            m(0) = x;
            m(1) = sinc(x);
            test.train(m);
            samples.push_back(m);
        }

        decision_function<kernel_type> df = one_class_trainer.train(samples);

        running_stats<double> rs;

        // Now lets output the distance from the centroid to some points that are from the sinc function.
        // These numbers should all be similar.  We will also calculate the statistics of these numbers
        // by accumulating them into the running_stats object called rs.  This will let us easily
        // find the mean and standard deviation of the distances for use below.
        dlog << LDEBUG << "Points that are on the sinc function:\n";
        m(0) = -1.5; m(1) = sinc(m(0)); dlog << LDEBUG << "   " << test(m);  rs.add(test(m));
        m(0) = -1.5; m(1) = sinc(m(0)); dlog << LDEBUG << "   " << test(m);  rs.add(test(m));
        m(0) = -0;   m(1) = sinc(m(0)); dlog << LDEBUG << "   " << test(m);  rs.add(test(m));
        m(0) = -0.5; m(1) = sinc(m(0)); dlog << LDEBUG << "   " << test(m);  rs.add(test(m));
        m(0) = -4.1; m(1) = sinc(m(0)); dlog << LDEBUG << "   " << test(m);  rs.add(test(m));
        m(0) = -1.5; m(1) = sinc(m(0)); dlog << LDEBUG << "   " << test(m);  rs.add(test(m));
        m(0) = -0.5; m(1) = sinc(m(0)); dlog << LDEBUG << "   " << test(m);  rs.add(test(m));

        m(0) = -1.5; m(1) = sinc(m(0)); DLIB_TEST_MSG(rs.scale(test(m)) < 2, rs.scale(test(m)));
        m(0) = -1.5; m(1) = sinc(m(0)); DLIB_TEST_MSG(rs.scale(test(m)) < 2, rs.scale(test(m)));
        m(0) = -0;   m(1) = sinc(m(0)); DLIB_TEST_MSG(rs.scale(test(m)) < 2, rs.scale(test(m)));
        m(0) = -0.5; m(1) = sinc(m(0)); DLIB_TEST_MSG(rs.scale(test(m)) < 2, rs.scale(test(m)));
        m(0) = -4.1; m(1) = sinc(m(0)); DLIB_TEST_MSG(rs.scale(test(m)) < 2, rs.scale(test(m)));
        m(0) = -1.5; m(1) = sinc(m(0)); DLIB_TEST_MSG(rs.scale(test(m)) < 2, rs.scale(test(m)));
        m(0) = -0.5; m(1) = sinc(m(0)); DLIB_TEST_MSG(rs.scale(test(m)) < 2, rs.scale(test(m)));

        const double thresh = 0.01;
        m(0) = -1.5; m(1) = sinc(m(0)); DLIB_TEST_MSG(df(m)+thresh > 0, df(m));
        m(0) = -1.5; m(1) = sinc(m(0)); DLIB_TEST_MSG(df(m)+thresh > 0, df(m));
        m(0) = -0;   m(1) = sinc(m(0)); DLIB_TEST_MSG(df(m)+thresh > 0, df(m));
        m(0) = -0.5; m(1) = sinc(m(0)); DLIB_TEST_MSG(df(m)+thresh > 0, df(m));
        m(0) = -4.1; m(1) = sinc(m(0)); DLIB_TEST_MSG(df(m)+thresh > 0, df(m));
        m(0) = -1.5; m(1) = sinc(m(0)); DLIB_TEST_MSG(df(m)+thresh > 0, df(m));
        m(0) = -0.5; m(1) = sinc(m(0)); DLIB_TEST_MSG(df(m)+thresh > 0, df(m));

        dlog << LDEBUG;
        // Lets output the distance from the centroid to some points that are NOT from the sinc function.
        // These numbers should all be significantly bigger than previous set of numbers.  We will also
        // use the rs.scale() function to find out how many standard deviations they are away from the 
        // mean of the test points from the sinc function.  So in this case our criterion for "significantly bigger"
        // is > 3 or 4 standard deviations away from the above points that actually are on the sinc function.
        dlog << LDEBUG << "Points that are NOT on the sinc function:\n";
        m(0) = -1.5; m(1) = sinc(m(0))+4;   
        dlog << LDEBUG << "   " << test(m) << " is " << rs.scale(test(m)) << " standard deviations from sinc.";
        DLIB_TEST_MSG(rs.scale(test(m)) > 6, rs.scale(test(m)));
        DLIB_TEST_MSG(df(m) + thresh < 0, df(m));

        m(0) = -1.5; m(1) = sinc(m(0))+3;   
        dlog << LDEBUG << "   " << test(m) << " is " << rs.scale(test(m)) << " standard deviations from sinc.";
        DLIB_TEST_MSG(rs.scale(test(m)) > 6, rs.scale(test(m)));
        DLIB_TEST_MSG(df(m) + thresh < 0, df(m));

        m(0) = -0;   m(1) = -sinc(m(0));    
        dlog << LDEBUG << "   " << test(m) << " is " << rs.scale(test(m)) << " standard deviations from sinc.";
        DLIB_TEST_MSG(rs.scale(test(m)) > 6, rs.scale(test(m)));
        DLIB_TEST_MSG(df(m) + thresh < 0, df(m));

        m(0) = -0.5; m(1) = -sinc(m(0));    
        dlog << LDEBUG << "   " << test(m) << " is " << rs.scale(test(m)) << " standard deviations from sinc.";
        DLIB_TEST_MSG(rs.scale(test(m)) > 6, rs.scale(test(m)));
        DLIB_TEST_MSG(df(m) + thresh < 0, df(m));

        m(0) = -4.1; m(1) = sinc(m(0))+2;   
        dlog << LDEBUG << "   " << test(m) << " is " << rs.scale(test(m)) << " standard deviations from sinc.";
        DLIB_TEST_MSG(rs.scale(test(m)) > 6, rs.scale(test(m)));
        DLIB_TEST_MSG(df(m) + thresh < 0, df(m));

        m(0) = -1.5; m(1) = sinc(m(0))+0.9; 
        dlog << LDEBUG << "   " << test(m) << " is " << rs.scale(test(m)) << " standard deviations from sinc.";
        DLIB_TEST_MSG(rs.scale(test(m)) > 6, rs.scale(test(m)));
        DLIB_TEST_MSG(df(m) + thresh < 0, df(m));

        m(0) = -0.5; m(1) = sinc(m(0))+1;   
        dlog << LDEBUG << "   " << test(m) << " is " << rs.scale(test(m)) << " standard deviations from sinc.";
        DLIB_TEST_MSG(rs.scale(test(m)) > 6, rs.scale(test(m)));
        DLIB_TEST_MSG(df(m) + thresh < 0, df(m));

        dlog << LINFO << "   end test_anomaly_detection()";
    }

// ----------------------------------------------------------------------------------------

    void test_binary_classification (
    )
    /*!
        ensures
            - runs tests on the svm stuff compliance with the specs
    !*/
    {        
        dlog << LINFO << "   begin test_binary_classification()";
        print_spinner();


        typedef double scalar_type;
        typedef matrix<scalar_type,2,1> sample_type;

        std::vector<sample_type> x;
        std::vector<matrix<double,0,1> > x_linearized;
        std::vector<scalar_type> y;

        get_checkerboard_problem(x,y, 300, 2);
        const scalar_type gamma = 1;

        typedef radial_basis_kernel<sample_type> kernel_type;

        rbf_network_trainer<kernel_type> rbf_trainer;
        rbf_trainer.set_kernel(kernel_type(gamma));
        rbf_trainer.set_num_centers(100);

        rvm_trainer<kernel_type> rvm_trainer;
        rvm_trainer.set_kernel(kernel_type(gamma));

        krr_trainer<kernel_type> krr_trainer;
        krr_trainer.use_classification_loss_for_loo_cv();
        krr_trainer.set_kernel(kernel_type(gamma));

        svm_pegasos<kernel_type> pegasos_trainer;
        pegasos_trainer.set_kernel(kernel_type(gamma));
        pegasos_trainer.set_lambda(0.00001);


        svm_c_ekm_trainer<kernel_type> ocas_ekm_trainer;
        ocas_ekm_trainer.set_kernel(kernel_type(gamma));
        ocas_ekm_trainer.set_c(100000);

        svm_nu_trainer<kernel_type> trainer;
        trainer.set_kernel(kernel_type(gamma));
        trainer.set_nu(0.05);

        svm_c_trainer<kernel_type> c_trainer;
        c_trainer.set_kernel(kernel_type(gamma));
        c_trainer.set_c(100);

        svm_c_linear_trainer<linear_kernel<matrix<double,0,1> > > lin_trainer;
        lin_trainer.set_c(100000);
        // use an ekm to linearize this dataset so we can use it with the lin_trainer
        empirical_kernel_map<kernel_type> ekm;
        ekm.load(kernel_type(gamma), x);
        for (unsigned long i = 0; i < x.size(); ++i)
            x_linearized.push_back(ekm.project(x[i]));


        print_spinner();
        matrix<scalar_type> rvm_cv = cross_validate_trainer_threaded(rvm_trainer, x,y, 4, 2);
        print_spinner();
        matrix<scalar_type> krr_cv = cross_validate_trainer_threaded(krr_trainer, x,y, 4, 2);
        print_spinner();
        matrix<scalar_type> svm_cv = cross_validate_trainer(trainer, x,y, 4);
        print_spinner();
        matrix<scalar_type> svm_c_cv = cross_validate_trainer(c_trainer, x,y, 4);
        print_spinner();
        matrix<scalar_type> rbf_cv = cross_validate_trainer_threaded(rbf_trainer, x,y, 10, 2);
        print_spinner();
        matrix<scalar_type> lin_cv = cross_validate_trainer_threaded(lin_trainer, x_linearized, y, 4, 2);
        print_spinner();
        matrix<scalar_type> ocas_ekm_cv = cross_validate_trainer_threaded(ocas_ekm_trainer, x, y, 4, 2);
        print_spinner();
        ocas_ekm_trainer.set_basis(randomly_subsample(x, 300));
        matrix<scalar_type> ocas_ekm_cv2 = cross_validate_trainer_threaded(ocas_ekm_trainer, x, y, 4, 2);
        print_spinner();
        matrix<scalar_type> peg_cv = cross_validate_trainer_threaded(batch(pegasos_trainer,1.0), x,y, 4, 2);
        print_spinner();
        matrix<scalar_type> peg_c_cv = cross_validate_trainer_threaded(batch_cached(pegasos_trainer,1.0), x,y, 4, 2);
        print_spinner();

        dlog << LDEBUG << "rvm cv:        " << rvm_cv;
        dlog << LDEBUG << "krr cv:        " << krr_cv;
        dlog << LDEBUG << "nu-svm cv:     " << svm_cv;
        dlog << LDEBUG << "C-svm cv:      " << svm_c_cv;
        dlog << LDEBUG << "rbf cv:        " << rbf_cv;
        dlog << LDEBUG << "lin cv:        " << lin_cv;
        dlog << LDEBUG << "ocas_ekm cv:   " << ocas_ekm_cv;
        dlog << LDEBUG << "ocas_ekm cv2:  " << ocas_ekm_cv2;
        dlog << LDEBUG << "peg cv:        " << peg_cv;
        dlog << LDEBUG << "peg cached cv: " << peg_c_cv;

        // make sure the cached version of pegasos computes the same result
        DLIB_TEST_MSG(sum(abs(peg_cv - peg_c_cv)) < std::sqrt(std::numeric_limits<double>::epsilon()),
                      sum(abs(peg_cv - peg_c_cv)) << "   \n" << peg_cv << peg_c_cv  );

        DLIB_TEST_MSG(mean(rvm_cv) > 0.9, rvm_cv);
        DLIB_TEST_MSG(mean(krr_cv) > 0.9, krr_cv);
        DLIB_TEST_MSG(mean(svm_cv) > 0.9, svm_cv);
        DLIB_TEST_MSG(mean(svm_c_cv) > 0.9, svm_c_cv);
        DLIB_TEST_MSG(mean(rbf_cv) > 0.9, rbf_cv);
        DLIB_TEST_MSG(mean(lin_cv) > 0.9, lin_cv);
        DLIB_TEST_MSG(mean(peg_cv) > 0.9, peg_cv);
        DLIB_TEST_MSG(mean(peg_c_cv) > 0.9, peg_c_cv);
        DLIB_TEST_MSG(mean(ocas_ekm_cv) > 0.9, ocas_ekm_cv);
        DLIB_TEST_MSG(mean(ocas_ekm_cv2) > 0.9, ocas_ekm_cv2);

        const long num_sv = trainer.train(x,y).basis_vectors.size();
        print_spinner();
        const long num_rv = rvm_trainer.train(x,y).basis_vectors.size();
        print_spinner();
        dlog << LDEBUG << "num sv: " << num_sv;
        dlog << LDEBUG << "num rv: " << num_rv;
        print_spinner();
        ocas_ekm_trainer.clear_basis();
        const long num_bv = ocas_ekm_trainer.train(x,y).basis_vectors.size();
        dlog << LDEBUG << "num ekm bv: " << num_bv;

        DLIB_TEST(num_rv <= 17);
        DLIB_TEST_MSG(num_sv <= 45, num_sv);
        DLIB_TEST_MSG(num_bv <= 45, num_bv);

        decision_function<kernel_type> df = reduced2(trainer, 19).train(x,y);
        print_spinner();

        matrix<scalar_type> svm_reduced_error = test_binary_decision_function(df, x, y);
        print_spinner();
        dlog << LDEBUG << "svm reduced test error: " << svm_reduced_error;
        dlog << LDEBUG << "svm reduced num sv: " << df.basis_vectors.size();
        DLIB_TEST(mean(svm_reduced_error) > 0.9);

        svm_cv = cross_validate_trainer(reduced(trainer,30), x,y, 4);
        dlog << LDEBUG << "svm reduced cv: " << svm_cv;
        DLIB_TEST_MSG(mean(svm_cv) > 0.9, svm_cv);

        DLIB_TEST(df.basis_vectors.size() <= 19);
        dlog << LINFO << "   end test_binary_classification()";
    }

// ----------------------------------------------------------------------------------------

    template <typename kernel_type>
    struct kernel_der_obj
    {
        typename kernel_type::sample_type x;
        kernel_type k;

        double operator()(const typename kernel_type::sample_type& y) const { return k(x,y); }
    };


    template <typename kernel_type>
    void test_kernel_derivative (
        const kernel_type& k,
        const typename kernel_type::sample_type& x, 
        const typename kernel_type::sample_type& y 
    )
    {
        kernel_der_obj<kernel_type> obj;
        obj.x = x;
        obj.k = k;
        kernel_derivative<kernel_type> der(obj.k);
        DLIB_TEST(dlib::equal(derivative(obj)(y) , der(obj.x,y), 1e-5));
    }

    void test_kernel_derivative (
    )
    {
        typedef matrix<double, 2, 1> sample_type;

        sigmoid_kernel<sample_type> k1;
        radial_basis_kernel<sample_type> k2;
        linear_kernel<sample_type> k3;
        polynomial_kernel<sample_type> k4(2,3,4);

        offset_kernel<sigmoid_kernel<sample_type> > k5;
        offset_kernel<radial_basis_kernel<sample_type> > k6;

        dlib::rand rnd;

        sample_type x, y;
        for (int i = 0; i < 10; ++i)
        {
            x = randm(2,1,rnd);
            y = randm(2,1,rnd);
            test_kernel_derivative(k1, x, y);
            test_kernel_derivative(k2, x, y);
            test_kernel_derivative(k3, x, y);
            test_kernel_derivative(k4, x, y);
            test_kernel_derivative(k5, x, y);
            test_kernel_derivative(k6, x, y);
        }
    }

// ----------------------------------------------------------------------------------------

    void test_svm_trainer2()
    {
        typedef matrix<double, 2, 1> sample_type;
        typedef linear_kernel<sample_type> kernel_type;


        std::vector<sample_type> samples;
        std::vector<double> labels;

        sample_type samp;
        samp(0) = 1;
        samp(1) = 1;
        samples.push_back(samp);
        labels.push_back(+1);

        samp(0) = 1;
        samp(1) = 2;
        samples.push_back(samp);
        labels.push_back(-1);

        svm_c_trainer<kernel_type> trainer;

        decision_function<kernel_type> df = trainer.train(samples, labels);

        samp(0) = 1;
        samp(1) = 1;
        dlog << LINFO << "test +1 : "<< df(samp);
        DLIB_TEST(df(samp) > 0);
        samp(0) = 1;
        samp(1) = 2;
        dlog << LINFO << "test -1 : "<< df(samp);
        DLIB_TEST(df(samp) < 0);

        svm_nu_trainer<kernel_type> trainer2;
        df = trainer2.train(samples, labels);

        samp(0) = 1;
        samp(1) = 1;
        dlog << LINFO << "test +1 : "<< df(samp);
        DLIB_TEST(df(samp) > 0);
        samp(0) = 1;
        samp(1) = 2;
        dlog << LINFO << "test -1 : "<< df(samp);
        DLIB_TEST(df(samp) < 0);

    }

// ----------------------------------------------------------------------------------------

    class svm_tester : public tester
    {
    public:
        svm_tester (
        ) :
            tester ("test_svm",
                    "Runs tests on the svm/kernel algorithm components.")
        {}

        void perform_test (
        )
        {
            test_kernel_derivative();
            test_binary_classification();
            test_clutering();
            test_regression();
            test_anomaly_detection();
            test_svm_trainer2();
        }
    } a;

}


