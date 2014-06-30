// Copyright (C) 2007  Davis E. King (davis@dlib.net)
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
#include "../optimization.h"
#include "svm_nu_trainer.h"
#include <vector>

namespace dlib
{

// ----------------------------------------------------------------------------------------

    template <
        typename T,
        typename U
        >
    inline bool is_learning_problem_impl (
        const T& x,
        const U& x_labels
    )
    {
        return is_col_vector(x) && 
               is_col_vector(x_labels) && 
               x.size() == x_labels.size() && 
               x.size() > 0;
    }

    template <
        typename T,
        typename U
        >
    inline bool is_learning_problem (
        const T& x,
        const U& x_labels
    )
    {
        return is_learning_problem_impl(vector_to_matrix(x), vector_to_matrix(x_labels));
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
        bool seen_neg_class = false;
        bool seen_pos_class = false;

        if (is_learning_problem_impl(x,x_labels) == false)
            return false;

        if (x.size() <= 1) return false;

        for (long r = 0; r < x_labels.nr(); ++r)
        {
            if (x_labels(r) != -1 && x_labels(r) != 1)
                return false;

            if (x_labels(r) == 1)
                seen_pos_class = true;
            if (x_labels(r) == -1)
                seen_neg_class = true;
        }

        return seen_pos_class && seen_neg_class;
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
        typename dec_funct_type,
        typename in_sample_vector_type,
        typename in_scalar_vector_type
        >
    const matrix<double,1,2> test_binary_decision_function_impl (
        const dec_funct_type& dec_funct,
        const in_sample_vector_type& x_test,
        const in_scalar_vector_type& y_test
    )
    {
        typedef typename dec_funct_type::sample_type sample_type;
        typedef typename dec_funct_type::mem_manager_type mem_manager_type;
        typedef matrix<sample_type,0,1,mem_manager_type> sample_vector_type;

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


        matrix<double, 1, 2> res;
        res(0) = (double)num_pos_correct/(double)(num_pos); 
        res(1) = (double)num_neg_correct/(double)(num_neg); 
        return res;
    }

    template <
        typename dec_funct_type,
        typename in_sample_vector_type,
        typename in_scalar_vector_type
        >
    const matrix<double,1,2> test_binary_decision_function (
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
        typename sequence_type 
        >
    bool is_sequence_labeling_problem (
        const std::vector<sequence_type>& samples,
        const std::vector<std::vector<unsigned long> >& labels
    )
    {
        if (is_learning_problem(samples, labels))
        {
            for (unsigned long i = 0; i < samples.size(); ++i)
            {
                if (samples[i].size() != labels[i].size())
                    return false;
            }
            return true;
        }

        return false;
    }

// ----------------------------------------------------------------------------------------

    template <
        typename lhs_type, 
        typename rhs_type
        >
    bool is_assignment_problem (
        const std::vector<std::pair<std::vector<lhs_type>, std::vector<rhs_type> > >& samples,
        const std::vector<std::vector<long> >& labels
    )
    {
        std::vector<bool> seen_label;

        if (is_learning_problem(samples, labels))
        {
            for (unsigned long i = 0; i < samples.size(); ++i)
            {
                if (samples[i].first.size() != labels[i].size())
                    return false;

                seen_label.assign(samples[i].second.size(), false);

                for (unsigned long j = 0; j < labels[i].size(); ++j)
                {
                    if (!(-1 <= labels[i][j] && labels[i][j] < (long)samples[i].second.size()))
                        return false;

                    if (labels[i][j] != -1)
                    {
                        // check label uniqueness
                        if (seen_label[labels[i][j]])
                            return false;

                        seen_label[labels[i][j]] = true;
                    }
                }
            }
            return true;
        }

        return false;
    }

// ----------------------------------------------------------------------------------------

    template <
        typename lhs_type, 
        typename rhs_type
        >
    bool is_forced_assignment_problem (
        const std::vector<std::pair<std::vector<lhs_type>, std::vector<rhs_type> > >& samples,
        const std::vector<std::vector<long> >& labels
    )
    {
        if (is_assignment_problem(samples, labels))
        {
            for (unsigned long i = 0; i < samples.size(); ++i)
            {
                const unsigned long N = sum(vector_to_matrix(labels[i]) != -1);
                if (std::min(samples[i].first.size(), samples[i].second.size()) != N)
                    return false;
            }
            return true;
        }

        return false;
    }

// ----------------------------------------------------------------------------------------

    template <
        typename trainer_type,
        typename in_sample_vector_type,
        typename in_scalar_vector_type
        >
    const matrix<double, 1, 2, typename trainer_type::mem_manager_type> 
    cross_validate_trainer_impl (
        const trainer_type& trainer,
        const in_sample_vector_type& x,
        const in_scalar_vector_type& y,
        const long folds
    )
    {
        typedef typename in_scalar_vector_type::value_type scalar_type;
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


        sample_vector_type x_test, x_train;
        scalar_vector_type y_test, y_train;
        x_test.set_size (num_pos_test_samples  + num_neg_test_samples);
        y_test.set_size (num_pos_test_samples  + num_neg_test_samples);
        x_train.set_size(num_pos_train_samples + num_neg_train_samples);
        y_train.set_size(num_pos_train_samples + num_neg_train_samples);

        long pos_idx = 0;
        long neg_idx = 0;

        matrix<double, 1, 2, mem_manager_type> res;
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

            try
            {
                // do the training and testing
                res += test_binary_decision_function(trainer.train(x_train,y_train),x_test,y_test);
            }
            catch (invalid_nu_error&)
            {
                // Just ignore the error in this case since we are going to
                // interpret an invalid nu value the same as generating a decision
                // function that miss-classifies everything.
            }

        } // for (long i = 0; i < folds; ++i)

        return res/(double)folds;
    }

    template <
        typename trainer_type,
        typename in_sample_vector_type,
        typename in_scalar_vector_type
        >
    const matrix<double, 1, 2, typename trainer_type::mem_manager_type> 
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

    namespace prob_impl
    {
        template <typename vect_type>
        struct objective
        {
            objective (
                const vect_type& f_,
                const vect_type& t_
            ) : f(f_), t(t_) {}

            double operator() (
                const matrix<double,2,1>& x
            ) const
            {
                const double A = x(0);
                const double B = x(1);

                double res = 0;
                for (unsigned long i = 0; i < f.size(); ++i)
                {
                    const double val = A*f[i]+B;
                    // See the paper "A Note on Platt's Probabilistic Outputs for Support Vector Machines"
                    // for an explanation of why this code looks the way it does (rather than being the 
                    // obvious formula).
                    if (val < 0)
                        res += (t[i] - 1)*val + std::log(1 + std::exp(val));
                    else
                        res += t[i]*val + std::log(1 + std::exp(-val));
                }

                return res;
            }

            const vect_type& f;
            const vect_type& t;
        };

        template <typename vect_type>
        struct der
        {
            der (
                const vect_type& f_,
                const vect_type& t_
            ) : f(f_), t(t_) {}

            matrix<double,2,1> operator() (
                const matrix<double,2,1>& x
            ) const
            {
                const double A = x(0);
                const double B = x(1);

                double derA = 0;
                double derB = 0;

                for (unsigned long i = 0; i < f.size(); ++i)
                {
                    const double val = A*f[i]+B;
                    double p;
                    // compute p = 1/(1+exp(val)) 
                    // but do so in a way that avoids numerical overflow.
                    if (val < 0)
                        p = 1.0/(1 + std::exp(val));
                    else
                        p = std::exp(-val)/(1 + std::exp(-val));

                    derA += f[i]*(t[i] - p);
                    derB +=      (t[i] - p);
                }

                matrix<double,2,1> res;
                res = derA, derB;
                return res;
            }

            const vect_type& f;
            const vect_type& t;
        };

        template <typename vect_type>
        struct hessian 
        {
            hessian (
                const vect_type& f_,
                const vect_type& t_
            ) : f(f_), t(t_) {}

            matrix<double,2,2> operator() (
                const matrix<double,2,1>& x
            ) const
            {
                const double A = x(0);
                const double B = x(1);

                matrix<double,2,2> h;
                h = 0;

                for (unsigned long i = 0; i < f.size(); ++i)
                {
                    const double val = A*f[i]+B;
                    // compute pp = 1/(1+exp(val)) and
                    // compute pn = 1 - pp
                    // but do so in a way that avoids numerical overflow and catastrophic cancellation.
                    double pp, pn;
                    if (val < 0)
                    {
                        const double temp = std::exp(val);
                        pp = 1.0/(1 + temp);
                        pn = temp*pp; 
                    }
                    else
                    {
                        const double temp = std::exp(-val);
                        pn = 1.0/(1 + temp);
                        pp = temp*pn; 
                    }

                    h(0,0) += f[i]*f[i]*pp*pn;
                    const double temp2 = f[i]*pp*pn;
                    h(0,1) += temp2;
                    h(1,0) += temp2;
                    h(1,1) += pp*pn;
                }

                return h;
            }

            const vect_type& f;
            const vect_type& t;
        };
    }

// ----------------------------------------------------------------------------------------

    template <
        typename trainer_type,
        typename sample_vector_type,
        typename label_vector_type
        >
    const probabilistic_function<typename trainer_type::trained_function_type> 
    train_probabilistic_decision_function (
        const trainer_type& trainer,
        const sample_vector_type& x,
        const label_vector_type& y,
        const long folds
    )
    {
        typedef typename sample_vector_type::value_type sample_type;
        typedef typename label_vector_type::value_type scalar_type;

        /*
            This function fits a sigmoid function to the output of the 
            svm trained by svm_nu_trainer or a similar trainer.  The 
            technique used is the one described in the papers:
                
                Probabilistic Outputs for Support Vector Machines and
                Comparisons to Regularized Likelihood Methods by 
                John C. Platt.  March 26, 1999

                A Note on Platt's Probabilistic Outputs for Support Vector Machines
                by Hsuan-Tien Lin, Chih-Jen Lin, and Ruby C. Weng
        */

        // make sure requires clause is not broken
        DLIB_ASSERT(is_binary_classification_problem(x,y) == true &&
                    1 < folds && folds <= (long)x.size(),
            "\tprobabilistic_decision_function train_probabilistic_decision_function()"
            << "\n\t invalid inputs were given to this function"
            << "\n\t x.size(): " << x.size() 
            << "\n\t y.size(): " << y.size() 
            << "\n\t folds:  " << folds 
            << "\n\t is_binary_classification_problem(x,y): " << is_binary_classification_problem(x,y)
            );

        // count the number of positive and negative examples
        const long num_pos = (long)sum(vector_to_matrix(y) > 0);
        const long num_neg = (long)sum(vector_to_matrix(y) < 0);

        // figure out how many positive and negative examples we will have in each fold
        const long num_pos_test_samples = num_pos/folds; 
        const long num_pos_train_samples = num_pos - num_pos_test_samples; 
        const long num_neg_test_samples = num_neg/folds; 
        const long num_neg_train_samples = num_neg - num_neg_test_samples; 

        typename trainer_type::trained_function_type d;
        std::vector<sample_type> x_test, x_train;
        std::vector<scalar_type> y_test, y_train;
        x_test.resize (num_pos_test_samples  + num_neg_test_samples);
        y_test.resize (num_pos_test_samples  + num_neg_test_samples);
        x_train.resize(num_pos_train_samples + num_neg_train_samples);
        y_train.resize(num_pos_train_samples + num_neg_train_samples);

        typedef std::vector<scalar_type > dvector;

        dvector out;
        dvector target;

        long pos_idx = 0;
        long neg_idx = 0;

        const scalar_type prior0 = num_pos_test_samples*folds; 
        const scalar_type prior1 = num_neg_test_samples*folds; 
        const scalar_type hi_target = (prior1+1)/(prior1+2);
        const scalar_type lo_target = 1.0/(prior0+2);

        for (long i = 0; i < folds; ++i)
        {
            long cur = 0;

            // load up our positive test samples
            while (cur < num_pos_test_samples)
            {
                if (y[pos_idx] == +1.0)
                {
                    x_test[cur] = x[pos_idx];
                    y_test[cur] = +1.0;
                    ++cur;
                }
                pos_idx = (pos_idx+1)%x.size();
            }

            // load up our negative test samples
            while (cur < (long)x_test.size())
            {
                if (y[neg_idx] == -1.0)
                {
                    x_test[cur] = x[neg_idx];
                    y_test[cur] = -1.0;
                    ++cur;
                }
                neg_idx = (neg_idx+1)%x.size();
            }

            // load the training data from the data following whatever we loaded
            // as the testing data
            long train_pos_idx = pos_idx;
            long train_neg_idx = neg_idx;
            cur = 0;

            // load up our positive train samples
            while (cur < num_pos_train_samples)
            {
                if (y[train_pos_idx] == +1.0)
                {
                    x_train[cur] = x[train_pos_idx];
                    y_train[cur] = +1.0;
                    ++cur;
                }
                train_pos_idx = (train_pos_idx+1)%x.size();
            }

            // load up our negative train samples
            while (cur < (long)x_train.size())
            {
                if (y[train_neg_idx] == -1.0)
                {
                    x_train[cur] = x[train_neg_idx];
                    y_train[cur] = -1.0;
                    ++cur;
                }
                train_neg_idx = (train_neg_idx+1)%x.size();
            }

            // do the training
            d = trainer.train (x_train,y_train);

            // now test this fold 
            for (unsigned long i = 0; i < x_test.size(); ++i)
            {
                out.push_back(d(x_test[i]));
                // if this was a positive example
                if (y_test[i] == +1.0)
                {
                    target.push_back(hi_target);
                }
                else if (y_test[i] == -1.0)
                {
                    target.push_back(lo_target);
                }
                else
                {
                    throw dlib::error("invalid input labels to the train_probabilistic_decision_function() function");
                }
            }

        } // for (long i = 0; i < folds; ++i)

        // Now find the maximum likelihood parameters of the sigmoid.  

        prob_impl::objective<dvector> obj(out, target);
        prob_impl::der<dvector> obj_der(out, target);
        prob_impl::hessian<dvector> obj_hessian(out, target);

        matrix<double,2,1> val;
        val = 0;
        find_min(newton_search_strategy(obj_hessian),
                 objective_delta_stop_strategy(),
                 obj,
                 obj_der,
                 val,
                 0);

        const double A = val(0);
        const double B = val(1);

        return probabilistic_function<typename trainer_type::trained_function_type>( A, B, trainer.train(x,y) );
    }

// ----------------------------------------------------------------------------------------

    template <typename trainer_type>
    struct trainer_adapter_probabilistic
    {
        typedef probabilistic_function<typename trainer_type::trained_function_type> trained_function_type;

        const trainer_type& trainer;
        const long folds;

        trainer_adapter_probabilistic (
            const trainer_type& trainer_,
            const long folds_
        ) : trainer(trainer_),folds(folds_) {}

        template <
            typename T, 
            typename U
            >
        const trained_function_type train (
            const T& samples,
            const U& labels
        ) const
        {
            return train_probabilistic_decision_function(trainer, samples, labels, folds);
        }

    };

    template <
        typename trainer_type
        >
    trainer_adapter_probabilistic<trainer_type> probabilistic (
        const trainer_type& trainer,
        const long folds
    )
    {
        return trainer_adapter_probabilistic<trainer_type>(trainer,folds); 
    }

// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------

    template <
        typename T,
        typename U,
        typename V,
        typename rand_type 
        >
    typename enable_if<is_matrix<T>,void>::type randomize_samples (
        T& t,
        U& u,
        V& v,
        rand_type& r
    )
    {
        // make sure requires clause is not broken
        DLIB_ASSERT(is_vector(t) && is_vector(u) && is_vector(v) && u.size() == t.size() &&
                    u.size() == v.size(),
            "\t randomize_samples(t,u,v)"
            << "\n\t invalid inputs were given to this function"
            << "\n\t t.size(): " << t.size()
            << "\n\t u.size(): " << u.size()
            << "\n\t v.size(): " << v.size()
            << "\n\t is_vector(t): " << is_vector(t)
            << "\n\t is_vector(u): " << is_vector(u)
            << "\n\t is_vector(v): " << is_vector(v)
            );

        long n = t.size()-1;
        while (n > 0)
        {
            // put a random integer into idx
            unsigned long idx = r.get_random_32bit_number();

            // make idx be less than n
            idx %= n;

            // swap our randomly selected index into the n position
            exchange(t(idx), t(n));
            exchange(u(idx), u(n));
            exchange(v(idx), v(n));

            --n;
        }
    }

// ----------------------------------------------------------------------------------------

    template <
        typename T,
        typename U,
        typename V,
        typename rand_type
        >
    typename disable_if<is_matrix<T>,void>::type randomize_samples (
        T& t,
        U& u,
        V& v,
        rand_type& r
    )
    {
        // make sure requires clause is not broken
        DLIB_ASSERT(u.size() == t.size() && u.size() == v.size(),
            "\t randomize_samples(t,u,v)"
            << "\n\t invalid inputs were given to this function"
            << "\n\t t.size(): " << t.size()
            << "\n\t u.size(): " << u.size()
            << "\n\t v.size(): " << v.size()
            );

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
            exchange(v[idx], v[n]);

            --n;
        }
    }

// ----------------------------------------------------------------------------------------

    template <
        typename T,
        typename U,
        typename V
        >
    typename disable_if<is_rand<V>,void>::type randomize_samples (
        T& t,
        U& u,
        V& v
    )
    {
        rand r;
        randomize_samples(t,u,v,r);
    }

// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------

    template <
        typename T,
        typename U,
        typename rand_type 
        >
    typename enable_if_c<is_matrix<T>::value && is_rand<rand_type>::value,void>::type randomize_samples (
        T& t,
        U& u,
        rand_type& r
    )
    {
        // make sure requires clause is not broken
        DLIB_ASSERT(is_vector(t) && is_vector(u) && u.size() == t.size(),
            "\t randomize_samples(t,u)"
            << "\n\t invalid inputs were given to this function"
            << "\n\t t.size(): " << t.size()
            << "\n\t u.size(): " << u.size()
            << "\n\t is_vector(t): " << (is_vector(t)? "true" : "false")
            << "\n\t is_vector(u): " << (is_vector(u)? "true" : "false")
            );

        long n = t.size()-1;
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
        typename U,
        typename rand_type
        >
    typename disable_if_c<is_matrix<T>::value || !is_rand<rand_type>::value,void>::type randomize_samples (
        T& t,
        U& u,
        rand_type& r
    )
    {
        // make sure requires clause is not broken
        DLIB_ASSERT(u.size() == t.size(),
            "\t randomize_samples(t,u)"
            << "\n\t invalid inputs were given to this function"
            << "\n\t t.size(): " << t.size()
            << "\n\t u.size(): " << u.size()
            );

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
        typename T,
        typename U
        >
    typename disable_if<is_rand<U>,void>::type randomize_samples (
        T& t,
        U& u
    )
    {
        rand r;
        randomize_samples(t,u,r);
    }

// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------

    template <
        typename T,
        typename rand_type
        >
    typename enable_if_c<is_matrix<T>::value && is_rand<rand_type>::value,void>::type randomize_samples (
        T& t,
        rand_type& r
    )
    {
        // make sure requires clause is not broken
        DLIB_ASSERT(is_vector(t),
            "\t randomize_samples(t)"
            << "\n\t invalid inputs were given to this function"
            << "\n\t is_vector(t): " << (is_vector(t)? "true" : "false")
            );

        long n = t.size()-1;
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
        typename T,
        typename rand_type
        >
    typename disable_if_c<(is_matrix<T>::value==true)||(is_rand<rand_type>::value==false),void>::type randomize_samples (
        T& t,
        rand_type& r
    )
    {
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

    template <
        typename T
        >
    void randomize_samples (
        T& t
    )
    {
        rand r;
        randomize_samples(t,r);
    }

// ----------------------------------------------------------------------------------------

}

#endif // DLIB_SVm_

