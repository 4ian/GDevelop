// Copyright (C) 2009  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.


#include <dlib/matrix.h>
#include <sstream>
#include <string>
#include <cstdlib>
#include <ctime>
#include <vector>
#include <map>
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

    logger dlog("test.kcentroid");

// ----------------------------------------------------------------------------------------

    template <typename T>
    struct unopt_sparse_linear_kernel
    {
        typedef typename T::value_type::second_type scalar_type;
        typedef T sample_type;
        typedef default_memory_manager mem_manager_type;

        scalar_type operator() (
            const sample_type& a,
            const sample_type& b
        ) const
        { 
            return dot(a,b);
        }

        bool operator== (
            const unopt_sparse_linear_kernel& 
        ) const
        {
            return true;
        }
    };

    template <typename T>
    struct unopt_linear_kernel
    {
        typedef typename T::type scalar_type;
        typedef T sample_type;
        typedef typename T::mem_manager_type mem_manager_type;

        scalar_type operator() (
            const sample_type& a,
            const sample_type& b
        ) const
        { 
            return trans(a)*b;
        }

        bool operator== (
            const unopt_linear_kernel& 
        ) const
        {
            return true;
        }
    };

    bool approx_equal(double a, double b)
    {
        return (std::abs(a-b) < 1000*(std::numeric_limits<double>::epsilon()));
    }

    bool approx_equal(double a, double b, double eps)
    {
        return (std::abs(a-b) < eps);
    }

    template <typename K>
    double dist (
        const K& k,
        const matrix<double,4,1>& a,
        const matrix<double,5,1>& b
    )
    /*!
        ensures
            - returns the distance between the a and b vectors in the
              feature space defined by the given kernel k.
    !*/
    {
        const double bias = std::sqrt(k.offset);
        return std::sqrt(length_squared(a-colm(b,0,4)) + std::pow(b(4)-bias,2.0));

    }

    template <typename K>
    double dist (
        const K& k,
        std::map<unsigned long,double> a,
        std::map<unsigned long,double> b
    )
    /*!
        ensures
            - returns the distance between the a and b vectors in the
              feature space defined by the given kernel k.
    !*/
    {
        double temp = 0;
        const double bias = std::sqrt(k.offset);
        temp += std::pow(a[0]-b[0],2.0);
        temp += std::pow(a[1]-b[1],2.0);
        temp += std::pow(a[2]-b[2],2.0);
        temp += std::pow(a[3]-b[3],2.0);
        temp += std::pow(bias-b[4],2.0);

        return std::sqrt(temp);

    }

// ----------------------------------------------------------------------------------------

    template <typename kernel_type>
    void test_kcentroid_with_linear_kernel(
    )
    /*!
        requires
            - kernel_type::sample_type == a matrix<double,5,1>
            - kernel_type == a kernel that just computes a dot product
              between its inputs.  I.e. a linear kernel
        ensures
            - tests the kcentroid object with the given kernel
    !*/
    {
        // Here we declare that our samples will be 2 dimensional column vectors.  
        typedef typename kernel_type::sample_type sample_type;

        kernel_type default_kernel;
        kcentroid<kernel_type> test(default_kernel,0.001,20);

        sample_type temp, temp2;

        temp = 2,0,0,0,0;
        dlog << LDEBUG << test(temp) ;
        dlog << LDEBUG << "squared_norm(): " << test.squared_norm() ;

        DLIB_TEST(approx_equal(test(temp), 2));
        DLIB_TEST(approx_equal(test.squared_norm(), 0));

        // make test store the point(2,0,0,0,0)
        test.train(temp, 0, 1);
        dlog << LDEBUG << test(temp) ;
        dlog << LDEBUG << "squared_norm(): " << test.squared_norm() ;
        DLIB_TEST(approx_equal(test(temp), 0));
        DLIB_TEST(approx_equal(test.get_distance_function()(temp), 0));
        DLIB_TEST(approx_equal(test.squared_norm(), 4));

        temp = 0,2,0,0,0;
        dlog << LDEBUG << test(temp) ;
        DLIB_TEST(approx_equal(test(temp), std::sqrt(2*2 + 2*2.0)));
        DLIB_TEST(approx_equal(test.squared_norm(), 4));

        // make test store the point(0,2,0,0,0)
        test.train(temp, 0, 1);

        dlog << LDEBUG << test(temp) ;
        DLIB_TEST(approx_equal(test(temp), 0));
        DLIB_TEST(approx_equal(test.squared_norm(), 4));

        temp = 2,0,0,0,0;
        DLIB_TEST(approx_equal(test(temp), std::sqrt(2*2 + 2*2.0)));
        DLIB_TEST(approx_equal(test.squared_norm(), 4));

        // make test store the point(1,1,0,0,0)
        test.train(temp, 0.5, 0.5);

        temp = 0;
        DLIB_TEST(approx_equal(test(temp), std::sqrt(2.0)));
        DLIB_TEST(approx_equal(test.squared_norm(), 2));

        // make test store the point(1,1,0,3,0)
        temp = 0,0,0,3,0;
        temp2 = 1,1,0,3,0;
        test.train(temp, 1, 1);

        temp = 0;
        DLIB_TEST(approx_equal(test(temp), length(temp2)));
        DLIB_TEST(approx_equal(test.squared_norm(), length_squared(temp2)));
        temp = 1,2,3,4,5;
        DLIB_TEST(approx_equal(test(temp), length(temp2-temp)));
        DLIB_TEST(approx_equal(test.get_distance_function()(temp), length(temp2-temp)));

        // make test store the point(0,1,0,3,-1)
        temp = 1,0,0,0,1;
        test.train(temp, 1, -1);
        temp2 = 0,1,0,3,-1;

        temp = 0;
        DLIB_TEST(approx_equal(test(temp), length(temp2)));
        DLIB_TEST(approx_equal(test.squared_norm(), length_squared(temp2)));
        temp = 1,2,3,4,5;
        DLIB_TEST(approx_equal(test(temp), length(temp2-temp)));


        // make test store the -1*point(0,1,0,3,-1)
        temp = 0,0,0,0,0;
        test.train(temp, -1, 0);
        temp2 = -temp2;

        temp = 0;
        DLIB_TEST(approx_equal(test(temp), length(temp2)));
        DLIB_TEST(approx_equal(test.squared_norm(), length_squared(temp2)));
        temp = 1,2,-3,4,5;
        DLIB_TEST(approx_equal(test(temp), length(temp2-temp)));



        // make test store the point(0,0,0,0,0)
        temp = 0,0,0,0,0;
        test.train(temp, 0, 0);
        temp2 = 0;

        temp = 0;
        DLIB_TEST(approx_equal(test(temp), length(temp2)));
        DLIB_TEST(approx_equal(test.squared_norm(), length_squared(temp2)));
        temp = 1,2,-3,4,5;
        DLIB_TEST(approx_equal(test(temp), length(temp2-temp)));



        // make test store the point(1,0,0,0,0)
        temp = 1,0,0,0,0;
        test.train(temp, 1, 1);
        temp2 = 1,0,0,0,0;

        temp = 0;
        DLIB_TEST(approx_equal(test(temp), length(temp2)));
        DLIB_TEST(approx_equal(test.squared_norm(), length_squared(temp2)));
        DLIB_TEST(approx_equal(test.inner_product(test), length_squared(temp2)));
        temp = 1,2,-3,4,5;
        DLIB_TEST(approx_equal(test(temp), length(temp2-temp)));
        DLIB_TEST(approx_equal(test(test), 0));
        DLIB_TEST(approx_equal(test.get_distance_function()(test.get_distance_function()), 0));

    }

// ----------------------------------------------------------------------------------------

    template <typename kernel_type>
    void test_kcentroid_with_offset_linear_kernel(
    )
    /*!
        requires
            - kernel_type::sample_type == a matrix<double,4,1>
            - kernel_type == a kernel that just computes a dot product
              between its inputs + some constant.  I.e. a linear kernel
              wrapped by offset_kernel
        ensures
            - tests the kcentroid object with the given kernel
    !*/
    {
        // Here we declare that our samples will be 2 dimensional column vectors.  
        typedef typename kernel_type::sample_type sample_type;

        kernel_type k;
        kcentroid<kernel_type> test(k,0.001,20);

        sample_type temp, temp2, temp3;

        matrix<double,5,1> val, val2;

        const double b = std::sqrt(k.offset);

        temp = 2,0,0,0;
        temp2 = 0;
        val = 0;
        DLIB_TEST(approx_equal(test(temp), dist(k,temp,val)));
        DLIB_TEST(approx_equal(test(temp2), dist(k,temp2,val)));
        DLIB_TEST(approx_equal(test.squared_norm(), length_squared(val)));


        temp2 = 0;

        // make test store the point(0,0,0,0,b)
        val = 0,0,0,0,b;
        test.train(temp2, 0,1);

        temp = 2,0,0,0;
        dlog << LDEBUG << test(temp) ;
        dlog << LDEBUG << "squared_norm(): " << test.squared_norm() ;

        DLIB_TEST(approx_equal(test(temp), dist(k,temp,val)));
        DLIB_TEST(approx_equal(test(temp2), dist(k,temp2,val)));
        DLIB_TEST_MSG(approx_equal(test.get_distance_function()(temp2), dist(k,temp2,val), 1e-6), 
                     test.get_distance_function()(temp2) - dist(k,temp2,val) << "  compare to: " <<
                     test(temp2) - dist(k,temp2,val)
        );
        DLIB_TEST(approx_equal(test.squared_norm(), length_squared(val)));


        // make test store the point(0,0,0,0,0)
        val = 0,0,0,0,0;
        test.train(temp2, 1,-1);
        DLIB_TEST(approx_equal(test(temp), dist(k,temp,val)));
        DLIB_TEST(approx_equal(test(temp2), dist(k,temp2,val)));
        DLIB_TEST_MSG(approx_equal(test.get_distance_function()(temp2), dist(k,temp2,val)), 
                     test.get_distance_function()(temp2) - dist(k,temp2,val) << "  compare to: " <<
                     test(temp2) - dist(k,temp2,val)
        );
        DLIB_TEST(approx_equal(test.squared_norm(), length_squared(val)));



        val2 = 0,1,0,0,b;
        val += val2;
        temp2 = 0,1,0,0;
        // make test store the point val
        test.train(temp2, 1,1);

        temp = 1,0,3,0;
        DLIB_TEST(approx_equal(test(temp), dist(k,temp,val)));
        DLIB_TEST_MSG(approx_equal(test(temp2), dist(k,temp2,val), 1e-7), 
                     test(temp2) - dist(k,temp2,val));
        DLIB_TEST(approx_equal(test.squared_norm(), length_squared(val)));
        DLIB_TEST_MSG(approx_equal(test(test), 0, 1e-7), test(test));


        val2 =  0,1,2.6,8,b;
        val += val2;
        temp2 = 0,1,2.6,8;
        // make test store the point val
        test.train(temp2, 1,1);

        temp = 1,1,3,0;
        DLIB_TEST(approx_equal(test(temp), dist(k,temp,val)));
        DLIB_TEST_MSG(approx_equal(test(temp2), dist(k,temp2,val)), test(temp2) - dist(k,temp2,val));
        DLIB_TEST(approx_equal(test.squared_norm(), length_squared(val)));
        DLIB_TEST(approx_equal(test.inner_product(test), length_squared(val)));
        DLIB_TEST(approx_equal(test(test), 0));
        DLIB_TEST_MSG(approx_equal(test.get_distance_function()(test.get_distance_function()), 0, 1e-6), 
                     test.get_distance_function()(test.get_distance_function()));
    }

// ----------------------------------------------------------------------------------------

    template <typename kernel_type>
    void test_kcentroid_with_sparse_linear_kernel(
    )
    /*!
        requires
            - kernel_type::sample_type == a std::map<unsigned long,double> 
            - kernel_type == a kernel that just computes a dot product
              between its inputs.  I.e. a linear kernel
        ensures
            - tests the kcentroid object with the given kernel
    !*/
    {
        // Here we declare that our samples will be 2 dimensional column vectors.  
        typedef typename kernel_type::sample_type sample_type;

        kernel_type default_kernel;
        kcentroid<kernel_type> test(default_kernel,0.001,20);

        dlog << LDEBUG << "AAAA 1" ;

        sample_type temp, temp2;

        temp[0] = 2;
        dlog << LDEBUG << test(temp) ;
        dlog << LDEBUG << "squared_norm(): " << test.squared_norm() ;

        DLIB_TEST(approx_equal(test(temp), 2));
        DLIB_TEST(approx_equal(test.squared_norm(), 0));

        // make test store the point(2,0,0,0,0)
        test.train(temp, 0, 1);
        dlog << LDEBUG << test(temp) ;
        dlog << LDEBUG << "squared_norm(): " << test.squared_norm() ;
        DLIB_TEST(approx_equal(test(temp), 0));
        DLIB_TEST(approx_equal(test.squared_norm(), 4));

        dlog << LDEBUG << "AAAA 2" ;
        temp.clear();
        temp[1] = 2;
        dlog << LDEBUG << test(temp) ;
        DLIB_TEST(approx_equal(test(temp), std::sqrt(2*2 + 2*2.0)));
        DLIB_TEST(approx_equal(test.squared_norm(), 4));

        // make test store the point(0,2,0,0,0)
        test.train(temp, 0, 1);

        dlog << LDEBUG << test(temp) ;
        DLIB_TEST(approx_equal(test(temp), 0));
        DLIB_TEST(approx_equal(test.squared_norm(), 4));

        temp.clear();
        temp[0] = 2;
        DLIB_TEST(approx_equal(test(temp), std::sqrt(2*2 + 2*2.0)));
        DLIB_TEST(approx_equal(test.squared_norm(), 4));

        // make test store the point(1,1,0,0,0)
        test.train(temp, 0.5, 0.5);

        dlog << LDEBUG << "AAAA 3" ;
        temp.clear();
        DLIB_TEST(approx_equal(test(temp), std::sqrt(2.0)));
        DLIB_TEST(approx_equal(test.squared_norm(), 2));
        DLIB_TEST(approx_equal(test(test), 0));
        DLIB_TEST(approx_equal(test.get_distance_function()(test.get_distance_function()), 0));

        dlog << LDEBUG << "AAAA 3.1" ;
        // make test store the point(1,1,0,3,0)
        temp.clear(); temp[3] = 3;
        temp2.clear(); 
        temp2[0] = 1;
        temp2[1] = 1;
        temp2[3] = 3;
        test.train(temp, 1, 1);

        dlog << LDEBUG << "AAAA 3.2" ;
        temp.clear();
        DLIB_TEST(approx_equal(test(temp), length(temp2)));
        DLIB_TEST(approx_equal(test.squared_norm(), length_squared(temp2)));
        dlog << LDEBUG << "AAAA 3.3" ;
        temp[0] = 1;
        temp[1] = 2;
        temp[2] = 3;
        temp[3] = 4;
        temp[4] = 5;
        dlog << LDEBUG << "AAAA 3.4" ;
        double junk = dlib::distance(temp2,temp);
        dlog << LDEBUG << "AAAA 3.5" ;
        DLIB_TEST(approx_equal(test(temp), junk) );

        dlog << LDEBUG << "AAAA 4" ;
        // make test store the point(0,1,0,3,-1)
        temp.clear();
        temp[0] = 1;
        temp[4] = 1;
        test.train(temp, 1, -1);
        temp2.clear();
        temp2[1] = 1;
        temp2[3] = 3;
        temp2[4] = -1;

        temp.clear();
        DLIB_TEST(approx_equal(test(temp), length(temp2)));
        DLIB_TEST(approx_equal(test.squared_norm(), length_squared(temp2)));
        temp[0] = 1;
        temp[1] = 2;
        temp[2] = 3;
        temp[3] = 4;
        temp[4] = 5;
        DLIB_TEST(approx_equal(test(temp), dlib::distance(temp2,temp)));


        // make test store the -1*point(0,1,0,3,-1)
        temp.clear();
        test.train(temp, -1, 0);
        temp2[0] = -temp2[0];
        temp2[1] = -temp2[1];
        temp2[2] = -temp2[2];
        temp2[3] = -temp2[3];
        temp2[4] = -temp2[4];

        dlog << LDEBUG << "AAAA 5" ;
        temp.clear();
        DLIB_TEST(approx_equal(test(temp), length(temp2)));
        DLIB_TEST(approx_equal(test.squared_norm(), length_squared(temp2)));
        temp[0] = 1;
        temp[1] = 2;
        temp[2] = -3;
        temp[3] = 4;
        temp[4] = 5;
        DLIB_TEST(approx_equal(test(temp), dlib::distance(temp2,temp)));



        // make test store the point(0,0,0,0,0)
        temp.clear();
        test.train(temp, 0, 0);
        temp2.clear();

        temp.clear();
        DLIB_TEST(approx_equal(test(temp), length(temp2)));
        DLIB_TEST(approx_equal(test.squared_norm(), length_squared(temp2)));
        temp[0] = 1;
        temp[1] = 2;
        temp[2] = -3;
        temp[3] = 4;
        temp[4] = 5;
        DLIB_TEST(approx_equal(test(temp), dlib::distance(temp2,temp)));
        DLIB_TEST(approx_equal(test.get_distance_function()(temp), dlib::distance(temp2,temp)));


        dlog << LDEBUG << "AAAA 6" ;

        // make test store the point(1,0,0,0,0)
        temp.clear();
        temp[0] = 1;
        test.train(temp, 1, 1);
        temp2.clear();
        temp2[0] = 1;

        temp.clear();
        DLIB_TEST(approx_equal(test(temp), length(temp2)));
        DLIB_TEST(approx_equal(test.squared_norm(), length_squared(temp2)));
        DLIB_TEST(approx_equal(test.inner_product(test), length_squared(temp2)));
        temp[0] = 1;
        temp[1] = 2;
        temp[2] = -3;
        temp[3] = 4;
        temp[4] = 5;
        DLIB_TEST(approx_equal(test(temp), dlib::distance(temp2,temp)));
        DLIB_TEST(approx_equal(test.get_distance_function()(temp), dlib::distance(temp2,temp)));
        DLIB_TEST(approx_equal(test(test), 0));
        DLIB_TEST(approx_equal(test.get_distance_function()(test.get_distance_function()), 0));

        dlog << LDEBUG << "AAAA 7" ;
    }

// ----------------------------------------------------------------------------------------

    template <typename kernel_type>
    void test_kcentroid_with_offset_sparse_linear_kernel(
    )
    /*!
        requires
            - kernel_type::sample_type == a std::map<unsigned long,double> 
            - kernel_type == a kernel that just computes a dot product
              between its inputs + some constant.  I.e. a linear kernel
              wrapped by offset_kernel
        ensures
            - tests the kcentroid object with the given kernel
    !*/
    {
        // Here we declare that our samples will be 2 dimensional column vectors.  
        typedef typename kernel_type::sample_type sample_type;

        kernel_type k;
        kcentroid<kernel_type> test(k,0.001,20);

        sample_type temp, temp2, temp3;

        std::map<unsigned long,double> val, val2;

        const double b = std::sqrt(k.offset);

        temp.clear();
        temp[0] = 2;
        temp2.clear();
        val.clear();
        DLIB_TEST(approx_equal(test(temp), dist(k,temp,val)));
        DLIB_TEST(approx_equal(test(temp2), dist(k,temp2,val)));
        DLIB_TEST(approx_equal(test.squared_norm(), length_squared(val)));


        temp2.clear();

        // make test store the point(0,0,0,0,b)
        val.clear();
        val[4] = b;
        test.train(temp2, 0,1);

        temp.clear();
        temp[0] = 2;
        dlog << LDEBUG << test(temp) ;
        dlog << LDEBUG << "squared_norm(): " << test.squared_norm() ;

        DLIB_TEST(approx_equal(test(temp), dist(k,temp,val)));
        DLIB_TEST(approx_equal(test(temp2), dist(k,temp2,val)));
        DLIB_TEST_MSG(approx_equal(test.get_distance_function()(temp2), dist(k,temp2,val), 1e-7), 
                     test.get_distance_function()(temp2) - dist(k,temp2,val)
        );
        DLIB_TEST(approx_equal(test.squared_norm(), length_squared(val)));
        DLIB_TEST(approx_equal(test(test), 0));
        DLIB_TEST(approx_equal(test.get_distance_function()(test.get_distance_function()), 0, 1e-6));

        // make test store the point(0,0,0,0,0)
        val.clear();
        test.train(temp2, 1,-1);

        temp.clear();
        temp[0] = 2;
        dlog << LDEBUG << test(temp) ;
        dlog << LDEBUG << "squared_norm(): " << test.squared_norm() ;

        DLIB_TEST_MSG(approx_equal(test(temp), dist(k,temp,val)), test(temp) - dist(k,temp,val));
        DLIB_TEST(approx_equal(test(temp2), dist(k,temp2,val)));
        DLIB_TEST(approx_equal(test.get_distance_function()(temp2), dist(k,temp2,val)));
        DLIB_TEST(approx_equal(test.squared_norm(), length_squared(val)));
        DLIB_TEST(approx_equal(test(test), 0));
        DLIB_TEST(approx_equal(test.get_distance_function()(test.get_distance_function()), 0));

        val2.clear();
        val2[0] = 0;
        val2[1] = 1;
        val2[2] = 0;
        val2[3] = 0;
        val2[4] = b;
        for (unsigned int i = 0; i < 5; ++i) val[i] += val2[i];
        temp2.clear();
        temp2[1] = 1;
        // make test store the point val
        test.train(temp2, 1,1);

        temp.clear();
        temp[0] = 1;
        temp[2] = 3;
        DLIB_TEST(approx_equal(test(temp), dist(k,temp,val)));
        DLIB_TEST_MSG(approx_equal(test(temp2), dist(k,temp2,val), 1e-7), 
                     test(temp2) - dist(k,temp2,val));
        DLIB_TEST(approx_equal(test.squared_norm(), length_squared(val)));


        val2.clear();
        val2[0] = 0;
        val2[1] = 1;
        val2[2] = 2.6;
        val2[3] = 8;
        val2[4] = b;
        for (unsigned int i = 0; i < 5; ++i) val[i] += val2[i];

        temp2.clear();
        temp2[0] = 0;
        temp2[1] = 1;
        temp2[2] = 2.6;
        temp2[3] = 8;
        // make test store the point val
        test.train(temp2, 1,1);

        temp.clear();
        temp[0] = 1;
        temp[1] = 1;
        temp[2] = 3;
        temp[3] = 0;
        DLIB_TEST(approx_equal(test(temp), dist(k,temp,val)));
        DLIB_TEST_MSG(approx_equal(test(temp2), dist(k,temp2,val)), test(temp2) - dist(k,temp2,val));
        DLIB_TEST(approx_equal(test.squared_norm(), length_squared(val)));
        DLIB_TEST(approx_equal(test.inner_product(test), length_squared(val)));
        DLIB_TEST_MSG(approx_equal(test(test), 0, 1e-6), test(test));
        DLIB_TEST(approx_equal(test.get_distance_function()(test.get_distance_function()), 0));
    }

// ----------------------------------------------------------------------------------------

    class kcentroid_tester : public tester
    {
    public:
        kcentroid_tester (
        ) :
            tester ("test_kcentroid",
                    "Runs tests on the kcentroid components.")
        {}

        void perform_test (
        )
        {
            // The idea here is to exercize all the various overloads of the kcentroid object.  We also want
            // to exercize the non-overloaded default version.  That is why we have these unopt_* linear
            // kernels
            test_kcentroid_with_linear_kernel<linear_kernel<matrix<double,5,1> > >();
            test_kcentroid_with_offset_linear_kernel<offset_kernel<linear_kernel<matrix<double,4,1> > > >();
            test_kcentroid_with_linear_kernel<unopt_linear_kernel<matrix<double,5,1> > >();
            test_kcentroid_with_offset_linear_kernel<offset_kernel<unopt_linear_kernel<matrix<double,4,1> > > >();
            test_kcentroid_with_sparse_linear_kernel<sparse_linear_kernel<std::map<unsigned long,double> > >();
            test_kcentroid_with_offset_sparse_linear_kernel<offset_kernel<sparse_linear_kernel<std::map<unsigned long,double> > > >();
            test_kcentroid_with_sparse_linear_kernel<unopt_sparse_linear_kernel<std::map<unsigned long,double> > >();
            test_kcentroid_with_offset_sparse_linear_kernel<offset_kernel<unopt_sparse_linear_kernel<std::map<unsigned long,double> > > >();
        }
    } a;

}


