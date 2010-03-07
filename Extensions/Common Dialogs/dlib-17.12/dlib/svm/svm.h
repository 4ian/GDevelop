// Copyright (C) 2007  Davis E. King (davisking@users.sourceforge.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#ifndef DLIB_SVm_
#define DLIB_SVm_

#include "svm_abstract.h"
#include <cmath>
#include <limits>
#include <sstream>
#include "../matrix.h"
#include "../algs.h"
#include "../serialize.h"
#include "../rand.h"
#include "../std_allocator.h"
#include "function.h"
#include "kernel.h"
#include "../enable_if.h"

namespace dlib
{

// ----------------------------------------------------------------------------------------

    class invalid_svm_nu_error : public dlib::error 
    { 
    public: 
        invalid_svm_nu_error(const std::string& msg, double nu_) : dlib::error(msg), nu(nu_) {};
        const double nu;
    };

// ----------------------------------------------------------------------------------------

    template <
        typename T
        >
    typename T::type maximum_nu_impl (
        const T& y
    )
    {
        typedef typename T::type scalar_type;
        // make sure requires clause is not broken
        DLIB_ASSERT(y.nr() > 1 && y.nc() == 1,
            "\ttypedef T::type maximum_nu(y)"
            << "\n\ty should be a column vector with more than one entry"
            << "\n\ty.nr(): " << y.nr() 
            << "\n\ty.nc(): " << y.nc() 
            );

        long pos_count = 0;
        long neg_count = 0;
        for (long r = 0; r < y.nr(); ++r)
        {
            if (y(r) == 1.0)
            {
                ++pos_count;
            }
            else if (y(r) == -1.0)
            {
                ++neg_count;
            }
            else
            {
                // make sure requires clause is not broken
                DLIB_ASSERT(y(r) == -1.0 || y(r) == 1.0,
                       "\ttypedef T::type maximum_nu(y)"
                       << "\n\ty should contain only 1 and 0 entries"
                       << "\n\tr:    " << r 
                       << "\n\ty(r): " << y(r) 
                );
            }
        }
        return static_cast<scalar_type>(2.0*(scalar_type)std::min(pos_count,neg_count)/(scalar_type)y.nr());
    }

    template <
        typename T
        >
    typename T::type maximum_nu (
        const T& y
    )
    {
        return maximum_nu_impl(vector_to_matrix(y));
    }

    template <
        typename T
        >
    typename T::value_type maximum_nu (
        const T& y
    )
    {
        return maximum_nu_impl(vector_to_matrix(y));
    }

// ----------------------------------------------------------------------------------------

    template <
        typename T,
        typename U
        >
    bool is_binary_classification_problem_impl (
        const T& x,
        const U& x_labels
    )
    {
        if (x.nc() != 1 || x_labels.nc() != 1) return false; 
        if (x.nr() != x_labels.nr()) return false;
        if (x.nr() <= 1) return false;
        for (long r = 0; r < x_labels.nr(); ++r)
        {
            if (x_labels(r) != -1 && x_labels(r) != 1)
                return false;
        }

        return true;
    }

    template <
        typename T,
        typename U
        >
    bool is_binary_classification_problem (
        const T& x,
        const U& x_labels
    )
    {
        return is_binary_classification_problem_impl(vector_to_matrix(x), vector_to_matrix(x_labels));
    }

// ----------------------------------------------------------------------------------------

    template <
        typename K,
        typename sample_vector_type,
        typename scalar_vector_type
        >
    class kernel_matrix_cache
    {
        typedef typename K::scalar_type scalar_type;
        typedef typename K::sample_type sample_type;
        typedef typename K::mem_manager_type mem_manager_type;

        const sample_vector_type& x;
        const scalar_vector_type& y;
        K kernel_function;

        mutable matrix<scalar_type,0,0,mem_manager_type> cache;
        mutable matrix<scalar_type,0,1,mem_manager_type> diag_cache;
        mutable matrix<long,0,1,mem_manager_type> lookup;
        mutable matrix<long,0,1,mem_manager_type> rlookup;
        mutable long next;

        /*!
        INITIAL VALUE
            - for all valid x:
                - lookup(x) == -1 
                - rlookup(x) == -1 

        CONVENTION
            - if (lookup(c) != -1) then
                - cache(lookup(c),*) == the cached column c of the kernel matrix
                - rlookup(lookup(c)) == c

            - if (rlookup(x) != -1) then
                - lookup(rlookup(x)) == x
                - cache(x,*) == the cached column rlookup(x) of the kernel matrix

            - next == the next row in the cache table to use to cache something 
        !*/

    public:
        kernel_matrix_cache (
            const sample_vector_type& x_,
            const scalar_vector_type& y_,
            K kernel_function_,
            long max_size_megabytes
        ) : x(x_), y(y_), kernel_function(kernel_function_) 
        {
            // figure out how many rows of the kernel matrix we can have
            // with the given amount of memory.
            long max_size = (max_size_megabytes*1024*1024)/(x.nr()*sizeof(scalar_type));
            // don't let it be 0
            if (max_size == 0)
                max_size = 1;
            long size = std::min(max_size,x.nr());

            diag_cache.set_size(x.nr(),1);
            cache.set_size(size,x.nr());
            lookup.set_size(x.nr(),1);
            rlookup.set_size(size,1);
            set_all_elements(lookup,-1);
            set_all_elements(rlookup,-1);
            next = 0;

            for (long i = 0; i < diag_cache.nr(); ++i)
                diag_cache(i) = kernel_function(x(i),x(i));
        }

        inline bool is_cached (
            long r
        ) const
        {
            return (lookup(r) != -1);
        }

        inline scalar_type operator () (
            long r,
            long c
        ) const
        {
            if (lookup(c) != -1)
            {
                return cache(lookup(c),r);
            }
            else if (r == c)
            {
                return diag_cache(r);
            }
            else if (lookup(r) != -1)
            {
                // the kernel is symmetric so this is legit
                return cache(lookup(r),c);
            }
            else
            {
                // if the lookup table is pointing to cache(next,*) then clear lookup(next)
                if (rlookup(next) != -1)
                    lookup(rlookup(next)) = -1;

                // make the lookup table os that it says c is now cached at the spot indicated by next
                lookup(c) = next;
                rlookup(next) = c;

                // compute this column in the kernel matrix and store it in the cache
                for (long i = 0; i < cache.nc(); ++i)
                    cache(next,i) = y(c)*y(i)*kernel_function(x(c),x(i));

                scalar_type val = cache(next,r);
                next = (next + 1)%cache.nr();
                return val;
            }
        }

    };

// ----------------------------------------------------------------------------------------

    template <
        typename dec_funct_type,
        typename in_sample_vector_type,
        typename in_scalar_vector_type
        >
    const matrix<typename dec_funct_type::scalar_type, 1, 2, typename dec_funct_type::mem_manager_type> 
    test_binary_decision_function_impl (
        const dec_funct_type& dec_funct,
        const in_sample_vector_type& x_test,
        const in_scalar_vector_type& y_test
    )
    {
        typedef typename dec_funct_type::scalar_type scalar_type;
        typedef typename dec_funct_type::sample_type sample_type;
        typedef typename dec_funct_type::mem_manager_type mem_manager_type;
        typedef matrix<sample_type,0,1,mem_manager_type> sample_vector_type;
        typedef matrix<scalar_type,0,1,mem_manager_type> scalar_vector_type;

        // make sure requires clause is not broken
        DLIB_ASSERT( is_binary_classification_problem(x_test,y_test) == true,
                    "\tmatrix test_binary_decision_function()"
                    << "\n\t invalid inputs were given to this function"
                    << "\n\t is_binary_classification_problem(x_test,y_test): " 
                    << ((is_binary_classification_problem(x_test,y_test))? "true":"false"));


        // count the number of positive and negative examples
        long num_pos = 0;
        long num_neg = 0;


        long num_pos_correct = 0;
        long num_neg_correct = 0;


        // now test this trained object 
        for (long i = 0; i < x_test.nr(); ++i)
        {
            // if this is a positive example
            if (y_test(i) == +1.0)
            {
                ++num_pos;
                if (dec_funct(x_test(i)) >= 0)
                    ++num_pos_correct;
            }
            else if (y_test(i) == -1.0)
            {
                ++num_neg;
                if (dec_funct(x_test(i)) < 0)
                    ++num_neg_correct;
            }
            else
            {
                throw dlib::error("invalid input labels to the test_binary_decision_function() function");
            }
        }


        matrix<scalar_type, 1, 2, mem_manager_type> res;
        res(0) = (scalar_type)num_pos_correct/(scalar_type)(num_pos); 
        res(1) = (scalar_type)num_neg_correct/(scalar_type)(num_neg); 
        return res;
    }

    template <
        typename dec_funct_type,
        typename in_sample_vector_type,
        typename in_scalar_vector_type
        >
    const matrix<typename dec_funct_type::scalar_type, 1, 2, typename dec_funct_type::mem_manager_type> 
    test_binary_decision_function (
        const dec_funct_type& dec_funct,
        const in_sample_vector_type& x_test,
        const in_scalar_vector_type& y_test
    )
    {
        return test_binary_decision_function_impl(dec_funct,
                                 vector_to_matrix(x_test),
                                 vector_to_matrix(y_test));
    }

// ----------------------------------------------------------------------------------------

    template <
        typename trainer_type,
        typename in_sample_vector_type,
        typename in_scalar_vector_type
        >
    const matrix<typename trainer_type::scalar_type, 1, 2, typename trainer_type::mem_manager_type> 
    cross_validate_trainer_impl (
        const trainer_type& trainer,
        const in_sample_vector_type& x,
        const in_scalar_vector_type& y,
        const long folds
    )
    {
        typedef typename trainer_type::scalar_type scalar_type;
        typedef typename trainer_type::sample_type sample_type;
        typedef typename trainer_type::mem_manager_type mem_manager_type;
        typedef matrix<sample_type,0,1,mem_manager_type> sample_vector_type;
        typedef matrix<scalar_type,0,1,mem_manager_type> scalar_vector_type;

        // make sure requires clause is not broken
        DLIB_ASSERT(is_binary_classification_problem(x,y) == true &&
                    1 < folds && folds <= x.nr(),
            "\tmatrix cross_validate_trainer()"
            << "\n\t invalid inputs were given to this function"
            << "\n\t x.nr(): " << x.nr() 
            << "\n\t folds:  " << folds 
            << "\n\t is_binary_classification_problem(x,y): " << ((is_binary_classification_problem(x,y))? "true":"false")
            );


        // count the number of positive and negative examples
        long num_pos = 0;
        long num_neg = 0;
        for (long r = 0; r < y.nr(); ++r)
        {
            if (y(r) == +1.0)
                ++num_pos;
            else
                ++num_neg;
        }

        // figure out how many positive and negative examples we will have in each fold
        const long num_pos_test_samples = num_pos/folds; 
        const long num_pos_train_samples = num_pos - num_pos_test_samples; 
        const long num_neg_test_samples = num_neg/folds; 
        const long num_neg_train_samples = num_neg - num_neg_test_samples; 


        typename trainer_type::trained_function_type d;
        sample_vector_type x_test, x_train;
        scalar_vector_type y_test, y_train;
        x_test.set_size (num_pos_test_samples  + num_neg_test_samples);
        y_test.set_size (num_pos_test_samples  + num_neg_test_samples);
        x_train.set_size(num_pos_train_samples + num_neg_train_samples);
        y_train.set_size(num_pos_train_samples + num_neg_train_samples);

        long pos_idx = 0;
        long neg_idx = 0;

        matrix<scalar_type, 1, 2, mem_manager_type> res;
        set_all_elements(res,0);

        for (long i = 0; i < folds; ++i)
        {
            long cur = 0;

            // load up our positive test samples
            while (cur < num_pos_test_samples)
            {
                if (y(pos_idx) == +1.0)
                {
                    x_test(cur) = x(pos_idx);
                    y_test(cur) = +1.0;
                    ++cur;
                }
                pos_idx = (pos_idx+1)%x.nr();
            }

            // load up our negative test samples
            while (cur < x_test.nr())
            {
                if (y(neg_idx) == -1.0)
                {
                    x_test(cur) = x(neg_idx);
                    y_test(cur) = -1.0;
                    ++cur;
                }
                neg_idx = (neg_idx+1)%x.nr();
            }

            // load the training data from the data following whatever we loaded
            // as the testing data
            long train_pos_idx = pos_idx;
            long train_neg_idx = neg_idx;
            cur = 0;

            // load up our positive train samples
            while (cur < num_pos_train_samples)
            {
                if (y(train_pos_idx) == +1.0)
                {
                    x_train(cur) = x(train_pos_idx);
                    y_train(cur) = +1.0;
                    ++cur;
                }
                train_pos_idx = (train_pos_idx+1)%x.nr();
            }

            // load up our negative train samples
            while (cur < x_train.nr())
            {
                if (y(train_neg_idx) == -1.0)
                {
                    x_train(cur) = x(train_neg_idx);
                    y_train(cur) = -1.0;
                    ++cur;
                }
                train_neg_idx = (train_neg_idx+1)%x.nr();
            }

            // do the training and testing
            res += test_binary_decision_function(trainer.train(x_train,y_train),x_test,y_test);

        } // for (long i = 0; i < folds; ++i)

        return res/(scalar_type)folds;
    }

    template <
        typename trainer_type,
        typename in_sample_vector_type,
        typename in_scalar_vector_type
        >
    const matrix<typename trainer_type::scalar_type, 1, 2, typename trainer_type::mem_manager_type> 
    cross_validate_trainer (
        const trainer_type& trainer,
        const in_sample_vector_type& x,
        const in_scalar_vector_type& y,
        const long folds
    )
    {
        return cross_validate_trainer_impl(trainer,
                                           vector_to_matrix(x),
                                           vector_to_matrix(y),
                                           folds);
    }

// ----------------------------------------------------------------------------------------

    template <
        typename trainer_type,
        typename in_sample_vector_type,
        typename in_scalar_vector_type
        >
    const probabilistic_decision_function<typename trainer_type::kernel_type> train_probabilistic_decision_function_impl (
        const trainer_type& trainer,
        const in_sample_vector_type& x,
        const in_scalar_vector_type& y,
        const long folds
    )
    {
        typedef typename trainer_type::sample_type sample_type;
        typedef typename trainer_type::scalar_type scalar_type;
        typedef typename trainer_type::mem_manager_type mem_manager_type;
        typedef typename trainer_type::kernel_type K;


        /*
            This function fits a sigmoid function to the output of the 
            svm trained by svm_nu_train().  The technique used is the one
            described in the paper:
                
                Probabilistic Outputs for Support Vector Machines and
                Comparisons to Regularized Likelihood Methods by 
                John C. Platt.  Match 26, 1999
        */

        // make sure requires clause is not broken
        DLIB_ASSERT(is_binary_classification_problem(x,y) == true &&
                    1 < folds && folds <= x.nr(),
            "\tprobabilistic_decision_function train_probabilistic_decision_function()"
            << "\n\t invalid inputs were given to this function"
            << "\n\t x.nr(): " << x.nr() 
            << "\n\t y.nr(): " << y.nr() 
            << "\n\t x.nc(): " << x.nc() 
            << "\n\t y.nc(): " << y.nc() 
            << "\n\t folds:  " << folds 
            << "\n\t is_binary_classification_problem(x,y): " << ((is_binary_classification_problem(x,y))? "true":"false")
            );

        // count the number of positive and negative examples
        long num_pos = 0;
        long num_neg = 0;
        for (long r = 0; r < y.nr(); ++r)
        {
            if (y(r) == +1.0)
                ++num_pos;
            else
                ++num_neg;
        }

        // figure out how many positive and negative examples we will have in each fold
        const long num_pos_test_samples = num_pos/folds; 
        const long num_pos_train_samples = num_pos - num_pos_test_samples; 
        const long num_neg_test_samples = num_neg/folds; 
        const long num_neg_train_samples = num_neg - num_neg_test_samples; 

        decision_function<K> d;
        typename decision_function<K>::sample_vector_type x_test, x_train;
        typename decision_function<K>::scalar_vector_type y_test, y_train;
        x_test.set_size (num_pos_test_samples  + num_neg_test_samples);
        y_test.set_size (num_pos_test_samples  + num_neg_test_samples);
        x_train.set_size(num_pos_train_samples + num_neg_train_samples);
        y_train.set_size(num_pos_train_samples + num_neg_train_samples);

        typedef std_allocator<scalar_type, mem_manager_type> alloc_scalar_type_vector;
        typedef std::vector<scalar_type, alloc_scalar_type_vector > dvector;
        typedef std_allocator<int, mem_manager_type> alloc_int_vector;
        typedef std::vector<int, alloc_int_vector > ivector;

        dvector out;
        ivector target;

        long pos_idx = 0;
        long neg_idx = 0;

        for (long i = 0; i < folds; ++i)
        {
            long cur = 0;

            // load up our positive test samples
            while (cur < num_pos_test_samples)
            {
                if (y(pos_idx) == +1.0)
                {
                    x_test(cur) = x(pos_idx);
                    y_test(cur) = +1.0;
                    ++cur;
                }
                pos_idx = (pos_idx+1)%x.nr();
            }

            // load up our negative test samples
            while (cur < x_test.nr())
            {
                if (y(neg_idx) == -1.0)
                {
                    x_test(cur) = x(neg_idx);
                    y_test(cur) = -1.0;
                    ++cur;
                }
                neg_idx = (neg_idx+1)%x.nr();
            }

            // load the training data from the data following whatever we loaded
            // as the testing data
            long train_pos_idx = pos_idx;
            long train_neg_idx = neg_idx;
            cur = 0;

            // load up our positive train samples
            while (cur < num_pos_train_samples)
            {
                if (y(train_pos_idx) == +1.0)
                {
                    x_train(cur) = x(train_pos_idx);
                    y_train(cur) = +1.0;
                    ++cur;
                }
                train_pos_idx = (train_pos_idx+1)%x.nr();
            }

            // load up our negative train samples
            while (cur < x_train.nr())
            {
                if (y(train_neg_idx) == -1.0)
                {
                    x_train(cur) = x(train_neg_idx);
                    y_train(cur) = -1.0;
                    ++cur;
                }
                train_neg_idx = (train_neg_idx+1)%x.nr();
            }

            // do the training
            d = trainer.train (x_train,y_train);

            // now test this fold 
            for (long i = 0; i < x_test.nr(); ++i)
            {
                out.push_back(d(x_test(i)));
                // if this was a positive example
                if (y_test(i) == +1.0)
                {
                    target.push_back(1);
                }
                else if (y_test(i) == -1.0)
                {
                    target.push_back(0);
                }
                else
                {
                    throw dlib::error("invalid input labels to the train_probabilistic_decision_function() function");
                }
            }

        } // for (long i = 0; i < folds; ++i)

        // Now find the parameters of the sigmoid.  Do so using the method from the
        // above referenced paper.
        scalar_type prior0 = num_pos_test_samples*folds; 
        scalar_type prior1 = num_neg_test_samples*folds; 
        scalar_type A = 0;
        scalar_type B = std::log((prior0+1)/(prior1+1));

        const scalar_type hiTarget = (prior1+1)/(prior1+2);
        const scalar_type loTarget = 1.0/(prior0+2);
        scalar_type lambda = 1e-3;
        scalar_type olderr = std::numeric_limits<scalar_type>::max();;
        dvector pp(out.size(),(prior1+1)/(prior1+prior0+2));
        const scalar_type min_log = -200.0;

        scalar_type t = 0;
        int count = 0;
        for (int it = 0; it < 100; ++it)
        {
            scalar_type a = 0;
            scalar_type b = 0;
            scalar_type c = 0;
            scalar_type d = 0;
            scalar_type e = 0;

            // First, compute Hessian & gradient of error function with 
            // respect to A & B
            for (unsigned long i = 0; i < out.size(); ++i)
            {
                if (target[i])
                    t = hiTarget;
                else
                    t = loTarget;

                const scalar_type d1 = pp[i] - t;
                const scalar_type d2 = pp[i]*(1-pp[i]);
                a += out[i]*out[i]*d2;
                b += d2;
                c += out[i]*d2;
                d += out[i]*d1;
                e += d1;
            }
            
            // If gradient is really tiny, then stop.
            if (std::abs(d) < 1e-9 && std::abs(e) < 1e-9)
                break;

            scalar_type oldA = A;
            scalar_type oldB = B;
            scalar_type err = 0;

            // Loop until goodness of fit increases
            while (true)
            {
                scalar_type det = (a+lambda)*(b+lambda)-c*c;
                // if determinant of Hessian is really close to zero then increase stabilizer.
                if (std::abs(det) <= std::numeric_limits<scalar_type>::epsilon())
                {
                    lambda *= 10;
                    continue;
                }

                A = oldA + ((b+lambda)*d-c*e)/det;
                B = oldB + ((a+lambda)*e-c*d)/det;

                // Now, compute the goodness of fit
                err = 0;
                for (unsigned long i = 0; i < out.size(); ++i)
                {
                    if (target[i])
                        t = hiTarget;
                    else
                        t = loTarget;
                    scalar_type p = 1.0/(1.0+std::exp(out[i]*A+B));
                    pp[i] = p;
                    // At this step, make sure log(0) returns min_log 
                    err -= t*std::max(std::log(p),min_log) + (1-t)*std::max(std::log(1-p),min_log);
                }

                if (err < olderr*(1+1e-7))
                {
                    lambda *= 0.1;
                    break;
                }

                // error did not decrease: increase stabilizer by factor of 10 
                // & try again
                lambda *= 10;
                if (lambda >= 1e6) // something is broken. Give up
                    break;
            }

            scalar_type diff = err-olderr;
            scalar_type scale = 0.5*(err+olderr+1.0);
            if (diff > -1e-3*scale && diff < 1e-7*scale)
                ++count;
            else
                count = 0;

            olderr = err;

            if (count == 3)
                break;
        }

        return probabilistic_decision_function<K>( A, B, trainer.train(x,y) );
    }

    template <
        typename trainer_type,
        typename in_sample_vector_type,
        typename in_scalar_vector_type
        >
    const probabilistic_decision_function<typename trainer_type::kernel_type> train_probabilistic_decision_function (
        const trainer_type& trainer,
        const in_sample_vector_type& x,
        const in_scalar_vector_type& y,
        const long folds
    )
    {
        return train_probabilistic_decision_function_impl(trainer,
                                                          vector_to_matrix(x),
                                                          vector_to_matrix(y),
                                                          folds);
    }

// ----------------------------------------------------------------------------------------

    template <
        typename T,
        typename U
        >
    typename enable_if<is_matrix<T>,void>::type randomize_samples (
        T& t,
        U& u
    )
    {
        rand::kernel_1a r;

        long n = t.nr()-1;
        while (n > 0)
        {
            // put a random integer into idx
            unsigned long idx = r.get_random_32bit_number();

            // make idx be less than n
            idx %= n;

            // swap our randomly selected index into the n position
            exchange(t(idx), t(n));
            exchange(u(idx), u(n));

            --n;
        }
    }

// ----------------------------------------------------------------------------------------

    template <
        typename T,
        typename U
        >
    typename disable_if<is_matrix<T>,void>::type randomize_samples (
        T& t,
        U& u
    )
    {
        rand::kernel_1a r;

        long n = t.size()-1;
        while (n > 0)
        {
            // put a random integer into idx
            unsigned long idx = r.get_random_32bit_number();

            // make idx be less than n
            idx %= n;

            // swap our randomly selected index into the n position
            exchange(t[idx], t[n]);
            exchange(u[idx], u[n]);

            --n;
        }
    }

// ----------------------------------------------------------------------------------------

    template <
        typename T
        >
    typename enable_if<is_matrix<T>,void>::type randomize_samples (
        T& t
    )
    {
        rand::kernel_1a r;

        long n = t.nr()-1;
        while (n > 0)
        {
            // put a random integer into idx
            unsigned long idx = r.get_random_32bit_number();

            // make idx be less than n
            idx %= n;

            // swap our randomly selected index into the n position
            exchange(t(idx), t(n));

            --n;
        }
    }

// ----------------------------------------------------------------------------------------

    template <
        typename T
        >
    typename disable_if<is_matrix<T>,void>::type randomize_samples (
        T& t
    )
    {
        rand::kernel_1a r;

        long n = t.size()-1;
        while (n > 0)
        {
            // put a random integer into idx
            unsigned long idx = r.get_random_32bit_number();

            // make idx be less than n
            idx %= n;

            // swap our randomly selected index into the n position
            exchange(t[idx], t[n]);

            --n;
        }
    }

// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------

    template <
        typename K 
        >
    class svm_nu_trainer
    {
    public:
        typedef K kernel_type;
        typedef typename kernel_type::scalar_type scalar_type;
        typedef typename kernel_type::sample_type sample_type;
        typedef typename kernel_type::mem_manager_type mem_manager_type;
        typedef decision_function<kernel_type> trained_function_type;

        svm_nu_trainer (
        ) :
            nu(0.1),
            cache_size(200),
            eps(0.001)
        {
        }

        svm_nu_trainer (
            const kernel_type& kernel_, 
            const scalar_type& nu_
        ) :
            kernel_function(kernel_),
            nu(nu_),
            cache_size(200),
            eps(0.001)
        {
            // make sure requires clause is not broken
            DLIB_ASSERT(0 < nu && nu <= 1,
                "\tsvm_nu_trainer::svm_nu_trainer(kernel,nu)"
                << "\n\t invalid inputs were given to this function"
                << "\n\t nu: " << nu 
                );
        }

        void set_cache_size (
            long cache_size_
        )
        {
            // make sure requires clause is not broken
            DLIB_ASSERT(cache_size_ > 0,
                "\tvoid svm_nu_trainer::set_cache_size(cache_size_)"
                << "\n\t invalid inputs were given to this function"
                << "\n\t cache_size: " << cache_size_ 
                );
            cache_size = cache_size_;
        }

        long get_cache_size (
        ) const
        {
            return cache_size;
        }

        void set_epsilon (
            scalar_type eps_
        )
        {
            // make sure requires clause is not broken
            DLIB_ASSERT(eps_ > 0,
                "\tvoid svm_nu_trainer::set_epsilon(eps_)"
                << "\n\t invalid inputs were given to this function"
                << "\n\t eps: " << eps_ 
                );
            eps = eps_;
        }

        const scalar_type get_epsilon (
        ) const
        { 
            return eps;
        }

        void set_kernel (
            const kernel_type& k
        )
        {
            kernel_function = k;
        }

        const kernel_type& get_kernel (
        ) const
        {
            return kernel_function;
        }

        void set_nu (
            scalar_type nu_
        )
        {
            // make sure requires clause is not broken
            DLIB_ASSERT(0 < nu_ && nu_ <= 1,
                "\tvoid svm_nu_trainer::set_nu(nu_)"
                << "\n\t invalid inputs were given to this function"
                << "\n\t nu: " << nu_ 
                );
            nu = nu_;
        }

        const scalar_type get_nu (
        ) const
        {
            return nu;
        }

        template <
            typename in_sample_vector_type,
            typename in_scalar_vector_type
            >
        const decision_function<kernel_type> train (
            const in_sample_vector_type& x,
            const in_scalar_vector_type& y
        ) const
        {
            return do_train(vector_to_matrix(x), vector_to_matrix(y));
        }

        void swap (
            svm_nu_trainer& item
        )
        {
            exchange(kernel_function, item.kernel_function);
            exchange(nu,              item.nu);
            exchange(cache_size,      item.cache_size);
            exchange(eps,             item.eps);
        }

    private:

    // ------------------------------------------------------------------------------------

        template <
            typename in_sample_vector_type,
            typename in_scalar_vector_type
            >
        const decision_function<kernel_type> do_train (
            const in_sample_vector_type& x,
            const in_scalar_vector_type& y
        ) const
        {
            typedef typename K::scalar_type scalar_type;
            typedef typename decision_function<K>::sample_vector_type sample_vector_type;
            typedef typename decision_function<K>::scalar_vector_type scalar_vector_type;

            // make sure requires clause is not broken
            DLIB_ASSERT(is_binary_classification_problem(x,y) == true,
                "\tdecision_function svm_nu_trainer::train(x,y)"
                << "\n\t invalid inputs were given to this function"
                << "\n\t x.nr(): " << x.nr() 
                << "\n\t y.nr(): " << y.nr() 
                << "\n\t x.nc(): " << x.nc() 
                << "\n\t y.nc(): " << y.nc() 
                << "\n\t is_binary_classification_problem(x,y): " << ((is_binary_classification_problem(x,y))? "true":"false")
                );


            const scalar_type tau = 1e-12;
            scalar_vector_type df; // delta f(alpha)
            scalar_vector_type alpha;

            kernel_matrix_cache<K, in_sample_vector_type, in_scalar_vector_type> Q(x,y,kernel_function,cache_size);

            alpha.set_size(x.nr());
            df.set_size(x.nr());

            // now initialize alpha
            set_initial_alpha(y, nu, alpha);


            // initialize df.  Compute df = Q*alpha
            for (long r = 0; r < df.nr(); ++r)
            {
                df(r) = 0;
                for (long c = 0; c < alpha.nr(); ++c)
                {
                    if (alpha(c) != 0)
                        df(r) += Q(c,r)*alpha(c);
                }
            }

            // now perform the actual optimization of alpha
            long i, j;
            while (find_working_group(y,alpha,Q,df,tau,eps,i,j))
            {
                const scalar_type old_alpha_i = alpha(i);
                const scalar_type old_alpha_j = alpha(j);

                optimize_working_pair(y,alpha,Q,df,tau,i,j);

                // update the df vector now that we have modified alpha(i) and alpha(j)
                scalar_type delta_alpha_i = alpha(i) - old_alpha_i;
                scalar_type delta_alpha_j = alpha(j) - old_alpha_j;
                for(long k = 0; k < df.nr(); ++k)
                    df(k) += Q(k,i)*delta_alpha_i + Q(k,j)*delta_alpha_j;

            }

            scalar_type rho, b;
            calculate_rho_and_b(y,alpha,df,rho,b);
            alpha = pointwise_multiply(alpha,y)/rho;

            // count the number of support vectors
            long sv_count = 0;
            for (long i = 0; i < alpha.nr(); ++i)
            {
                if (alpha(i) != 0)
                    ++sv_count;
            }

            scalar_vector_type sv_alpha;
            sample_vector_type support_vectors;

            // size these column vectors so that they have an entry for each support vector
            sv_alpha.set_size(sv_count);
            support_vectors.set_size(sv_count);

            // load the support vectors and their alpha values into these new column matrices
            long idx = 0;
            for (long i = 0; i < alpha.nr(); ++i)
            {
                if (alpha(i) != 0)
                {
                    sv_alpha(idx) = alpha(i);
                    support_vectors(idx) = x(i);
                    ++idx;
                }
            }

            // now return the decision function
            return decision_function<K> (sv_alpha, b, kernel_function, support_vectors);
        }

    // ------------------------------------------------------------------------------------

        template <
            typename scalar_type,
            typename scalar_vector_type,
            typename scalar_vector_type2
            >
        inline void set_initial_alpha (
            const scalar_vector_type& y,
            const scalar_type nu,
            scalar_vector_type2& alpha
        ) const
        {
            set_all_elements(alpha,0);
            const scalar_type l = y.nr();
            scalar_type temp = nu*l/2;
            long num = (long)std::floor(temp);
            long num_total = (long)std::ceil(temp);

            int count = 0;
            for (int i = 0; i < alpha.nr(); ++i)
            {
                if (y(i) == 1)
                {
                    if (count < num)
                    {
                        ++count;
                        alpha(i) = 1;
                    }
                    else 
                    {
                        if (temp > num)
                        {
                            ++count;
                            alpha(i) = temp - std::floor(temp);
                        }
                        break;
                    }
                }
            }

            if (count != num_total)
            {
                std::ostringstream sout;
                sout << "invalid nu of " << nu << ".  Must be between 0 and " << (scalar_type)count/y.nr();
                throw invalid_svm_nu_error(sout.str(),nu);
            }

            count = 0;
            for (int i = 0; i < alpha.nr(); ++i)
            {
                if (y(i) == -1)
                {
                    if (count < num)
                    {
                        ++count;
                        alpha(i) = 1;
                    }
                    else 
                    {
                        if (temp > num)
                        {
                            ++count;
                            alpha(i) = temp - std::floor(temp);
                        }
                        break;
                    }
                }
            }

            if (count != num_total)
            {
                std::ostringstream sout;
                sout << "invalid nu of " << nu << ".  Must be between 0 and " << (scalar_type)count/y.nr();
                throw invalid_svm_nu_error(sout.str(),nu);
            }
        }

    // ------------------------------------------------------------------------------------

        template <
            typename sample_vector_type,
            typename scalar_vector_type,
            typename scalar_vector_type2,
            typename scalar_type
            >
        inline bool find_working_group (
            const scalar_vector_type2& y,
            const scalar_vector_type& alpha,
            const kernel_matrix_cache<K,sample_vector_type, scalar_vector_type2>& Q,
            const scalar_vector_type& df,
            const scalar_type tau,
            const scalar_type eps,
            long& i_out,
            long& j_out
        ) const
        {
            using namespace std;
            long ip = -1;
            long jp = -1;
            long in = -1;
            long jn = -1;

            scalar_type ip_val = -numeric_limits<scalar_type>::infinity();
            scalar_type jp_val = numeric_limits<scalar_type>::infinity();
            scalar_type in_val = -numeric_limits<scalar_type>::infinity();
            scalar_type jn_val = numeric_limits<scalar_type>::infinity();

            // loop over the alphas and find the maximum ip and in indices.
            for (long i = 0; i < alpha.nr(); ++i)
            {
                if (y(i) == 1)
                {
                    if (alpha(i) < 1.0)
                    {
                        if (-df(i) > ip_val)
                        {
                            ip_val = -df(i);
                            ip = i;
                        }
                    }
                }
                else
                {
                    if (alpha(i) > 0.0)
                    {
                        if (df(i) > in_val)
                        {
                            in_val = df(i);
                            in = i;
                        }
                    }
                }
            }

            scalar_type Mp = numeric_limits<scalar_type>::infinity();
            scalar_type Mn = numeric_limits<scalar_type>::infinity();
            scalar_type bp = -numeric_limits<scalar_type>::infinity();
            scalar_type bn = -numeric_limits<scalar_type>::infinity();

            // now we need to find the minimum jp and jn indices
            for (long j = 0; j < alpha.nr(); ++j)
            {
                if (y(j) == 1)
                {
                    if (alpha(j) > 0.0)
                    {
                        scalar_type b = ip_val + df(j);
                        if (-df(j) < Mp)
                            Mp = -df(j);

                        if (b > 0 && (Q.is_cached(j) || b > bp || jp == -1 ))
                        {
                            bp = b;
                            scalar_type a = Q(ip,ip) + Q(j,j) - 2*Q(j,ip); 
                            if (a <= 0)
                                a = tau;
                            scalar_type temp = -b*b/a;
                            if (temp < jp_val)
                            {
                                jp_val = temp;
                                jp = j;
                            }
                        }
                    }
                }
                else
                {
                    if (alpha(j) < 1.0)
                    {
                        scalar_type b = in_val - df(j);
                        if (df(j) < Mn)
                            Mn = df(j);

                        if (b > 0 && (Q.is_cached(j) || b > bn || jn == -1 ))
                        {
                            bn = b;
                            scalar_type a = Q(in,in) + Q(j,j) - 2*Q(j,in); 
                            if (a <= 0)
                                a = tau;
                            scalar_type temp = -b*b/a;
                            if (temp < jn_val)
                            {
                                jn_val = temp;
                                jn = j;
                            }
                        }
                    }
                }
            }

            // if we are at the optimal point then return false so the caller knows
            // to stop optimizing
            if (std::max(ip_val - Mp, in_val - Mn) < eps)
                return false;

            if (jp_val < jn_val)
            {
                i_out = ip;
                j_out = jp;
            }
            else
            {
                i_out = in;
                j_out = jn;
            }

            if (j_out >= 0 && i_out >= 0)
                return true;
            else
                return false;
        }

    // ------------------------------------------------------------------------------------

        template <
            typename scalar_vector_type,
            typename scalar_vector_type2,
            typename scalar_type
            >
        void calculate_rho_and_b(
            const scalar_vector_type2& y,
            const scalar_vector_type& alpha,
            const scalar_vector_type& df,
            scalar_type& rho, 
            scalar_type& b
        ) const
        {
            using namespace std;
            long num_p_free = 0;
            long num_n_free = 0;
            scalar_type sum_p_free = 0;
            scalar_type sum_n_free = 0;

            scalar_type upper_bound_p = -numeric_limits<scalar_type>::infinity();
            scalar_type upper_bound_n = -numeric_limits<scalar_type>::infinity();
            scalar_type lower_bound_p = numeric_limits<scalar_type>::infinity();
            scalar_type lower_bound_n = numeric_limits<scalar_type>::infinity();

            for(long i = 0; i < alpha.nr(); ++i)
            {
                if(y(i) == 1)
                {
                    if(alpha(i) == 1)
                    {
                        if (df(i) > upper_bound_p)
                            upper_bound_p = df(i);
                    }
                    else if(alpha(i) == 0)
                    {
                        if (df(i) < lower_bound_p)
                            lower_bound_p = df(i);
                    }
                    else
                    {
                        ++num_p_free;
                        sum_p_free += df(i);
                    }
                }
                else
                {
                    if(alpha(i) == 1)
                    {
                        if (df(i) > upper_bound_n)
                            upper_bound_n = df(i);
                    }
                    else if(alpha(i) == 0)
                    {
                        if (df(i) < lower_bound_n)
                            lower_bound_n = df(i);
                    }
                    else
                    {
                        ++num_n_free;
                        sum_n_free += df(i);
                    }
                }
            }

            scalar_type r1,r2;
            if(num_p_free > 0)
                r1 = sum_p_free/num_p_free;
            else
                r1 = (upper_bound_p+lower_bound_p)/2;

            if(num_n_free > 0)
                r2 = sum_n_free/num_n_free;
            else
                r2 = (upper_bound_n+lower_bound_n)/2;

            rho = (r1+r2)/2;
            b = (r1-r2)/2/rho;
        }

    // ------------------------------------------------------------------------------------

        template <
            typename sample_vector_type,
            typename scalar_vector_type,
            typename scalar_vector_type2,
            typename scalar_type
            >
        inline void optimize_working_pair (
            const scalar_vector_type2& y,
            scalar_vector_type& alpha,
            const kernel_matrix_cache<K, sample_vector_type, scalar_vector_type2>& Q,
            const scalar_vector_type& df,
            const scalar_type tau,
            const long i,
            const long j
        ) const
        {
            scalar_type quad_coef = Q(i,i)+Q(j,j)-2*Q(j,i);
            if (quad_coef <= 0)
                quad_coef = tau;
            scalar_type delta = (df(i)-df(j))/quad_coef;
            scalar_type sum = alpha(i) + alpha(j);
            alpha(i) -= delta;
            alpha(j) += delta;

            if(sum > 1)
            {
                if(alpha(i) > 1)
                {
                    alpha(i) = 1;
                    alpha(j) = sum - 1;
                }
                else if(alpha(j) > 1)
                {
                    alpha(j) = 1;
                    alpha(i) = sum - 1;
                }
            }
            else
            {
                if(alpha(j) < 0)
                {
                    alpha(j) = 0;
                    alpha(i) = sum;
                }
                else if(alpha(i) < 0)
                {
                    alpha(i) = 0;
                    alpha(j) = sum;
                }
            }
        }

    // ------------------------------------------------------------------------------------

        kernel_type kernel_function;
        scalar_type nu;
        long cache_size;
        scalar_type eps;
    }; // end of class svm_nu_trainer

// ----------------------------------------------------------------------------------------

    template <typename K>
    void swap (
        svm_nu_trainer<K>& a,
        svm_nu_trainer<K>& b
    ) { a.swap(b); }

// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------
}

#endif // DLIB_SVm_

