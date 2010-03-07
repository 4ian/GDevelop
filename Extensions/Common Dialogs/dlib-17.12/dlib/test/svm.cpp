// Copyright (C) 2006  Davis E. King (davisking@users.sourceforge.net)
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

        dlib::rand::float_1a rnd;

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
            DLIB_CASSERT(test(samples[i]) == class1, " ");
            DLIB_CASSERT(test(samples[i+num]) == class2, "");
            DLIB_CASSERT(test(samples[i+2*num]) == class3, "");
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
        rbf_network_trainer<kernel_type> rbf_test;
        rbf_test.set_kernel(test.get_kernel());
        rbf_test.set_num_centers(13);

        print_spinner();
        std::vector<sample_type> samples;
        std::vector<double> labels;
        // now we train our object on a few samples of the sinc function.
        sample_type m;
        for (double x = -10; x <= 5; x += 0.6)
        {
            m(0) = x;
            test.train(m, sinc(x));

            samples.push_back(m);
            labels.push_back(sinc(x));
        }

        print_spinner();
        decision_function<kernel_type> test2 = rvm_test.train(samples, labels);
        print_spinner();
        decision_function<kernel_type> test3 = rbf_test.train(samples, labels);
        print_spinner();

        // now we output the value of the sinc function for a few test points as well as the 
        // value predicted by krls object.
        m(0) = 2.5; dlog << LDEBUG << "krls: " << sinc(m(0)) << "   " << test(m); DLIB_CASSERT(abs(sinc(m(0)) - test(m)) < 0.01,"");
        m(0) = 0.1; dlog << LDEBUG << "krls: " << sinc(m(0)) << "   " << test(m); DLIB_CASSERT(abs(sinc(m(0)) - test(m)) < 0.01,"");
        m(0) = -4;  dlog << LDEBUG << "krls: " << sinc(m(0)) << "   " << test(m); DLIB_CASSERT(abs(sinc(m(0)) - test(m)) < 0.01,"");
        m(0) = 5.0; dlog << LDEBUG << "krls: " << sinc(m(0)) << "   " << test(m); DLIB_CASSERT(abs(sinc(m(0)) - test(m)) < 0.01,"");

        m(0) = 2.5; dlog << LDEBUG << "rvm: " << sinc(m(0)) << "   " << test2(m); DLIB_CASSERT(abs(sinc(m(0)) - test2(m)) < 0.01,"");
        m(0) = 0.1; dlog << LDEBUG << "rvm: " << sinc(m(0)) << "   " << test2(m); DLIB_CASSERT(abs(sinc(m(0)) - test2(m)) < 0.01,"");
        m(0) = -4;  dlog << LDEBUG << "rvm: " << sinc(m(0)) << "   " << test2(m); DLIB_CASSERT(abs(sinc(m(0)) - test2(m)) < 0.01,"");
        m(0) = 5.0; dlog << LDEBUG << "rvm: " << sinc(m(0)) << "   " << test2(m); DLIB_CASSERT(abs(sinc(m(0)) - test2(m)) < 0.01,"");

        m(0) = 2.5; dlog << LDEBUG << "rbf: " << sinc(m(0)) << "   " << test3(m); DLIB_CASSERT(abs(sinc(m(0)) - test3(m)) < 0.01,"");
        m(0) = 0.1; dlog << LDEBUG << "rbf: " << sinc(m(0)) << "   " << test3(m); DLIB_CASSERT(abs(sinc(m(0)) - test3(m)) < 0.01,"");
        m(0) = -4;  dlog << LDEBUG << "rbf: " << sinc(m(0)) << "   " << test3(m); DLIB_CASSERT(abs(sinc(m(0)) - test3(m)) < 0.01,"");
        m(0) = 5.0; dlog << LDEBUG << "rbf: " << sinc(m(0)) << "   " << test3(m); DLIB_CASSERT(abs(sinc(m(0)) - test3(m)) < 0.01,"");
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

        // now we train our object on a few samples of the sinc function.
        sample_type m;
        for (double x = -15; x <= 8; x += 1)
        {
            m(0) = x;
            m(1) = sinc(x);
            test.train(m);
        }

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

        m(0) = -1.5; m(1) = sinc(m(0)); DLIB_CASSERT(rs.scale(test(m)) < 2, rs.scale(test(m)));
        m(0) = -1.5; m(1) = sinc(m(0)); DLIB_CASSERT(rs.scale(test(m)) < 2, rs.scale(test(m)));
        m(0) = -0;   m(1) = sinc(m(0)); DLIB_CASSERT(rs.scale(test(m)) < 2, rs.scale(test(m)));
        m(0) = -0.5; m(1) = sinc(m(0)); DLIB_CASSERT(rs.scale(test(m)) < 2, rs.scale(test(m)));
        m(0) = -4.1; m(1) = sinc(m(0)); DLIB_CASSERT(rs.scale(test(m)) < 2, rs.scale(test(m)));
        m(0) = -1.5; m(1) = sinc(m(0)); DLIB_CASSERT(rs.scale(test(m)) < 2, rs.scale(test(m)));
        m(0) = -0.5; m(1) = sinc(m(0)); DLIB_CASSERT(rs.scale(test(m)) < 2, rs.scale(test(m)));

        dlog << LDEBUG;
        // Lets output the distance from the centroid to some points that are NOT from the sinc function.
        // These numbers should all be significantly bigger than previous set of numbers.  We will also
        // use the rs.scale() function to find out how many standard deviations they are away from the 
        // mean of the test points from the sinc function.  So in this case our criterion for "significantly bigger"
        // is > 3 or 4 standard deviations away from the above points that actually are on the sinc function.
        dlog << LDEBUG << "Points that are NOT on the sinc function:\n";
        m(0) = -1.5; m(1) = sinc(m(0))+4;   
        dlog << LDEBUG << "   " << test(m) << " is " << rs.scale(test(m)) << " standard deviations from sinc.";
        DLIB_CASSERT(rs.scale(test(m)) > 6, rs.scale(test(m)));

        m(0) = -1.5; m(1) = sinc(m(0))+3;   
        dlog << LDEBUG << "   " << test(m) << " is " << rs.scale(test(m)) << " standard deviations from sinc.";
        DLIB_CASSERT(rs.scale(test(m)) > 6, rs.scale(test(m)));

        m(0) = -0;   m(1) = -sinc(m(0));    
        dlog << LDEBUG << "   " << test(m) << " is " << rs.scale(test(m)) << " standard deviations from sinc.";
        DLIB_CASSERT(rs.scale(test(m)) > 6, rs.scale(test(m)));

        m(0) = -0.5; m(1) = -sinc(m(0));    
        dlog << LDEBUG << "   " << test(m) << " is " << rs.scale(test(m)) << " standard deviations from sinc.";
        DLIB_CASSERT(rs.scale(test(m)) > 6, rs.scale(test(m)));

        m(0) = -4.1; m(1) = sinc(m(0))+2;   
        dlog << LDEBUG << "   " << test(m) << " is " << rs.scale(test(m)) << " standard deviations from sinc.";
        DLIB_CASSERT(rs.scale(test(m)) > 6, rs.scale(test(m)));

        m(0) = -1.5; m(1) = sinc(m(0))+0.9; 
        dlog << LDEBUG << "   " << test(m) << " is " << rs.scale(test(m)) << " standard deviations from sinc.";
        DLIB_CASSERT(rs.scale(test(m)) > 6, rs.scale(test(m)));

        m(0) = -0.5; m(1) = sinc(m(0))+1;   
        dlog << LDEBUG << "   " << test(m) << " is " << rs.scale(test(m)) << " standard deviations from sinc.";
        DLIB_CASSERT(rs.scale(test(m)) > 6, rs.scale(test(m)));

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
        std::vector<scalar_type> y;

        get_checkerboard_problem(x,y, 300, 3);
        const scalar_type gamma = 1;

        typedef radial_basis_kernel<sample_type> kernel_type;

        rbf_network_trainer<kernel_type> rbf_trainer;
        rbf_trainer.set_kernel(kernel_type(gamma));
        rbf_trainer.set_num_centers(30);

        rvm_trainer<kernel_type> rvm_trainer;
        rvm_trainer.set_kernel(kernel_type(gamma));

        svm_nu_trainer<kernel_type> trainer;
        trainer.set_kernel(kernel_type(gamma));
        trainer.set_nu(0.05);

        print_spinner();
        matrix<scalar_type> rvm_cv = cross_validate_trainer_threaded(rvm_trainer, x,y, 4, 2);
        print_spinner();
        matrix<scalar_type> svm_cv = cross_validate_trainer(trainer, x,y, 4);
        print_spinner();
        matrix<scalar_type> rbf_cv = cross_validate_trainer_threaded(rbf_trainer, x,y, 4, 2);
        print_spinner();

        dlog << LDEBUG << "rvm cv: " << rvm_cv;
        dlog << LDEBUG << "svm cv: " << svm_cv;
        dlog << LDEBUG << "rbf cv: " << rbf_cv;

        DLIB_CASSERT(mean(rvm_cv) > 0.9, rvm_cv);
        DLIB_CASSERT(mean(svm_cv) > 0.9, svm_cv);
        DLIB_CASSERT(mean(rbf_cv) > 0.9, rbf_cv);

        const long num_sv = trainer.train(x,y).support_vectors.size();
        print_spinner();
        const long num_rv = rvm_trainer.train(x,y).support_vectors.size();
        print_spinner();
        dlog << LDEBUG << "num sv: " << num_sv;
        dlog << LDEBUG << "num rv: " << num_rv;

        DLIB_CASSERT(num_rv <= 17, "");
        DLIB_CASSERT(num_sv <= 45, "");

        decision_function<kernel_type> df = reduced2(trainer, 19).train(x,y);
        print_spinner();

        matrix<scalar_type> svm_reduced_error = test_binary_decision_function(df, x, y);
        print_spinner();
        dlog << LDEBUG << "svm reduced test error: " << svm_reduced_error;
        dlog << LDEBUG << "svm reduced num sv: " << df.support_vectors.size();
        DLIB_CASSERT(mean(svm_reduced_error) > 0.9, "");

        svm_cv = cross_validate_trainer(reduced(trainer,30), x,y, 4);
        dlog << LDEBUG << "svm reduced cv: " << svm_cv;
        DLIB_CASSERT(mean(svm_cv) > 0.9, svm_cv);

        DLIB_CASSERT(df.support_vectors.size() == 19,"");
        dlog << LINFO << "   end test_binary_classification()";
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
            test_binary_classification();
            test_clutering();
            test_regression();
            test_anomaly_detection();
        }
    } a;

}


