// Copyright (C) 2009  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#ifndef DLIB_PEGASoS_
#define DLIB_PEGASoS_

#include "pegasos_abstract.h"
#include <cmath>
#include "../algs.h"
#include "function.h"
#include "kernel.h"
#include "kcentroid.h"
#include <iostream>
#include "../smart_pointers.h"

namespace dlib
{

// ----------------------------------------------------------------------------------------

    template <
        typename K 
        >
    class svm_pegasos
    {
        typedef kcentroid<offset_kernel<K> > kc_type;

    public:
        typedef K kernel_type;
        typedef typename kernel_type::scalar_type scalar_type;
        typedef typename kernel_type::sample_type sample_type;
        typedef typename kernel_type::mem_manager_type mem_manager_type;
        typedef decision_function<kernel_type> trained_function_type;

        template <typename K_>
        struct rebind {
            typedef svm_pegasos<K_> other;
        };

        svm_pegasos (
        ) :
            max_sv(40),
            lambda_c1(0.0001),
            lambda_c2(0.0001),
            tau(0.01),
            tolerance(0.01),
            train_count(0),
            w(offset_kernel<kernel_type>(kernel,tau),tolerance, max_sv, false)
        {
        }

        svm_pegasos (
            const kernel_type& kernel_, 
            const scalar_type& lambda_,
            const scalar_type& tolerance_,
            unsigned long max_num_sv
        ) :
            max_sv(max_num_sv),
            kernel(kernel_),
            lambda_c1(lambda_),
            lambda_c2(lambda_),
            tau(0.01),
            tolerance(tolerance_),
            train_count(0),
            w(offset_kernel<kernel_type>(kernel,tau),tolerance, max_sv, false)
        {
            // make sure requires clause is not broken
            DLIB_ASSERT(lambda_ > 0 && tolerance > 0 && max_num_sv > 0,
                        "\tsvm_pegasos::svm_pegasos(kernel,lambda,tolerance)"
                        << "\n\t invalid inputs were given to this function"
                        << "\n\t lambda_: " << lambda_ 
                        << "\n\t max_num_sv: " << max_num_sv 
            );
        }

        void clear (
        )
        {
            // reset the w vector back to its initial state
            w = kc_type(offset_kernel<kernel_type>(kernel,tau),tolerance, max_sv, false);
            train_count = 0;
        }

        void set_kernel (
            kernel_type k
        )
        {
            kernel = k;
            clear();
        }

        void set_max_num_sv (
            unsigned long max_num_sv
        )
        {
            // make sure requires clause is not broken
            DLIB_ASSERT(max_num_sv > 0,
                        "\tvoid svm_pegasos::set_max_num_sv(max_num_sv)"
                        << "\n\t invalid inputs were given to this function"
                        << "\n\t max_num_sv: " << max_num_sv 
            );
            max_sv = max_num_sv; 
            clear();
        }

        unsigned long get_max_num_sv (
        ) const
        {
            return max_sv;
        }

        void set_tolerance (
            double tol
        )
        {
            // make sure requires clause is not broken
            DLIB_ASSERT(0 < tol,
                        "\tvoid svm_pegasos::set_tolerance(tol)"
                        << "\n\t invalid inputs were given to this function"
                        << "\n\t tol: " << tol 
            );
            tolerance = tol;
            clear();
        }

        void set_lambda (
            scalar_type lambda_
        )
        {
            // make sure requires clause is not broken
            DLIB_ASSERT(0 < lambda_,
                        "\tvoid svm_pegasos::set_lambda(lambda_)"
                        << "\n\t invalid inputs were given to this function"
                        << "\n\t lambda_: " << lambda_ 
            );
            lambda_c1 = lambda_;
            lambda_c2 = lambda_;

            max_wnorm = 1/std::sqrt(std::min(lambda_c1, lambda_c2));
            clear();
        }

        void set_lambda_class1 (
            scalar_type lambda_
        )
        {
            // make sure requires clause is not broken
            DLIB_ASSERT(0 < lambda_,
                        "\tvoid svm_pegasos::set_lambda_class1(lambda_)"
                        << "\n\t invalid inputs were given to this function"
                        << "\n\t lambda_: " << lambda_ 
            );
            lambda_c1 = lambda_;
            max_wnorm = 1/std::sqrt(std::min(lambda_c1, lambda_c2));
            clear();
        }

        void set_lambda_class2 (
            scalar_type lambda_
        )
        {
            // make sure requires clause is not broken
            DLIB_ASSERT(0 < lambda_,
                        "\tvoid svm_pegasos::set_lambda_class2(lambda_)"
                        << "\n\t invalid inputs were given to this function"
                        << "\n\t lambda_: " << lambda_ 
            );
            lambda_c2 = lambda_;
            max_wnorm = 1/std::sqrt(std::min(lambda_c1, lambda_c2));
            clear();
        }

        const scalar_type get_lambda_class1 (
        ) const
        {
            return lambda_c1;
        }

        const scalar_type get_lambda_class2 (
        ) const
        {
            return lambda_c2;
        }

        const scalar_type get_tolerance (
        ) const
        {
            return tolerance;
        }

        const kernel_type get_kernel (
        ) const
        {
            return kernel;
        }

        unsigned long get_train_count (
        ) const
        {
            return static_cast<unsigned long>(train_count);
        }

        scalar_type train (
            const sample_type& x,
            const scalar_type& y
        ) 
        {
            // make sure requires clause is not broken
            DLIB_ASSERT(y == -1 || y == 1,
                        "\tscalar_type svm_pegasos::train(x,y)"
                        << "\n\t invalid inputs were given to this function"
                        << "\n\t y: " << y
            );

            const double lambda = (y==+1)? lambda_c1 : lambda_c2;

            ++train_count;
            const scalar_type learning_rate = 1/(lambda*train_count);

            // if this sample point is within the margin of the current hyperplane
            if (y*w.inner_product(x) < 1)
            {

                // compute: w = (1-learning_rate*lambda)*w + y*learning_rate*x
                w.train(x,  1 - learning_rate*lambda,  y*learning_rate);

                scalar_type wnorm = std::sqrt(w.squared_norm());
                scalar_type temp = max_wnorm/wnorm;
                if (temp < 1)
                    w.scale_by(temp);
            }
            else
            {
                w.scale_by(1 - learning_rate*lambda);
            }

            // return the current learning rate
            return 1/(std::min(lambda_c1,lambda_c2)*train_count);
        }

        scalar_type operator() (
            const sample_type& x
        ) const
        {
            return w.inner_product(x);
        }

        const decision_function<kernel_type> get_decision_function (
        ) const
        {
            distance_function<offset_kernel<kernel_type> > df = w.get_distance_function();
            return decision_function<kernel_type>(df.get_alpha(), -tau*sum(df.get_alpha()), kernel, df.get_basis_vectors());
        }

        void swap (
            svm_pegasos& item
        )
        {
            exchange(max_sv,         item.max_sv);
            exchange(kernel,         item.kernel);
            exchange(lambda_c1,      item.lambda_c1);
            exchange(lambda_c2,      item.lambda_c2);
            exchange(max_wnorm,      item.max_wnorm);
            exchange(tau,            item.tau);
            exchange(tolerance,      item.tolerance);
            exchange(train_count,    item.train_count);
            exchange(w,              item.w);
        }

        friend void serialize(const svm_pegasos& item, std::ostream& out)
        {
            serialize(item.max_sv, out);
            serialize(item.kernel, out);
            serialize(item.lambda_c1, out);
            serialize(item.lambda_c2, out);
            serialize(item.max_wnorm, out);
            serialize(item.tau, out);
            serialize(item.tolerance, out);
            serialize(item.train_count, out);
            serialize(item.w, out);
        }

        friend void deserialize(svm_pegasos& item, std::istream& in)
        {
            deserialize(item.max_sv, in);
            deserialize(item.kernel, in);
            deserialize(item.lambda_c1, in);
            deserialize(item.lambda_c2, in);
            deserialize(item.max_wnorm, in);
            deserialize(item.tau, in);
            deserialize(item.tolerance, in);
            deserialize(item.train_count, in);
            deserialize(item.w, in);
        }

    private:

        unsigned long max_sv;
        kernel_type kernel;
        scalar_type lambda_c1;
        scalar_type lambda_c2;
        scalar_type max_wnorm;
        scalar_type tau;
        scalar_type tolerance;
        scalar_type train_count;
        kc_type w;

    }; // end of class svm_pegasos

    template <
        typename K 
        >
    void swap (
        svm_pegasos<K>& a,
        svm_pegasos<K>& b
    ) { a.swap(b); }

// ----------------------------------------------------------------------------------------

    template <
        typename T,
        typename U
        >
    void replicate_settings (
        const svm_pegasos<T>& source,
        svm_pegasos<U>& dest
    )
    {
        dest.set_tolerance(source.get_tolerance());
        dest.set_lambda_class1(source.get_lambda_class1());
        dest.set_lambda_class2(source.get_lambda_class2());
        dest.set_max_num_sv(source.get_max_num_sv());
    }

// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------

    template <
        typename trainer_type
        >
    class batch_trainer 
    {

    // ------------------------------------------------------------------------------------

        template <
            typename K,
            typename sample_vector_type
            >
        class caching_kernel 
        {
        public:
            typedef typename K::scalar_type scalar_type;
            typedef long sample_type;
            //typedef typename K::sample_type sample_type;
            typedef typename K::mem_manager_type mem_manager_type;

            caching_kernel () : samples(0), counter(0), counter_threshold(0) {}

            caching_kernel (
                const K& kern,
                const sample_vector_type& samps,
                long cache_size_
            ) : real_kernel(kern), samples(&samps), counter(0)  
            {
                cache_size = std::min<long>(cache_size_, samps.size());

                cache.reset(new cache_type);
                cache->frequency_of_use.resize(samps.size());
                for (long i = 0; i < samps.size(); ++i)
                    cache->frequency_of_use[i] = std::make_pair(0, i);

                // Set the cache build/rebuild threshold so that we have to have
                // as many cache misses as there are entries in the cache before
                // we build/rebuild.
                counter_threshold = samps.size()*cache_size;
                cache->sample_location.assign(samples->size(), -1);
            }

            scalar_type operator() (
                const sample_type& a,
                const sample_type& b
            )  const
            { 
                // rebuild the cache every so often
                if (counter > counter_threshold )
                {
                    build_cache();
                }

                const long a_loc = cache->sample_location[a];
                const long b_loc = cache->sample_location[b];

                cache->frequency_of_use[a].first += 1;
                cache->frequency_of_use[b].first += 1;

                if (a_loc != -1)
                {
                    return cache->kernel(a_loc, b);
                }
                else if (b_loc != -1)
                {
                    return cache->kernel(b_loc, a);
                }
                else
                {
                    ++counter;
                    return real_kernel((*samples)(a), (*samples)(b));
                }
            }

            bool operator== (
                const caching_kernel& item
            ) const
            {
                return item.real_kernel == real_kernel &&
                    item.samples == samples;
            }

        private:
            K real_kernel;

            void build_cache (
            ) const
            {
                std::sort(cache->frequency_of_use.rbegin(), cache->frequency_of_use.rend());
                counter = 0;


                cache->kernel.set_size(cache_size, samples->size());
                cache->sample_location.assign(samples->size(), -1);

                // loop over all the samples in the cache
                for (long i = 0; i < cache_size; ++i)
                {
                    const long cur = cache->frequency_of_use[i].second;
                    cache->sample_location[cur] = i;

                    // now populate all possible kernel products with the current sample
                    for (long j = 0; j < samples->size(); ++j)
                    {
                        cache->kernel(i, j) = real_kernel((*samples)(cur), (*samples)(j));
                    }

                }

                // reset the frequency of use metrics
                for (long i = 0; i < samples->size(); ++i)
                    cache->frequency_of_use[i] = std::make_pair(0, i);
            }


            struct cache_type
            {
                matrix<scalar_type> kernel;  

                std::vector<long> sample_location; // where in the cache a sample is.  -1 means not in cache
                std::vector<std::pair<long,long> > frequency_of_use;  
            };

            const sample_vector_type* samples;

            shared_ptr<cache_type> cache;
            mutable unsigned long counter;
            unsigned long counter_threshold;
            long cache_size;
        };

    // ------------------------------------------------------------------------------------

    public:
        typedef typename trainer_type::kernel_type kernel_type;
        typedef typename trainer_type::scalar_type scalar_type;
        typedef typename trainer_type::sample_type sample_type;
        typedef typename trainer_type::mem_manager_type mem_manager_type;
        typedef typename trainer_type::trained_function_type trained_function_type;


        batch_trainer (
        ) :
            min_learning_rate(0.1),
            use_cache(false),
            cache_size(100)
        {
        }

        batch_trainer (
            const trainer_type& trainer_, 
            const scalar_type min_learning_rate_,
            bool verbose_,
            bool use_cache_,
            long cache_size_ = 100
        ) :
            trainer(trainer_),
            min_learning_rate(min_learning_rate_),
            verbose(verbose_),
            use_cache(use_cache_),
            cache_size(cache_size_)
        {
            // make sure requires clause is not broken
            DLIB_ASSERT(0 < min_learning_rate_ &&
                        cache_size_ > 0,
                        "\tbatch_trainer::batch_trainer()"
                        << "\n\t invalid inputs were given to this function"
                        << "\n\t min_learning_rate_: " << min_learning_rate_ 
                        << "\n\t cache_size_: " << cache_size_ 
            );
            
            trainer.clear();
        }

        const scalar_type get_min_learning_rate (
        ) const 
        {
            return min_learning_rate;
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
            if (use_cache)
                return do_train_cached(vector_to_matrix(x), vector_to_matrix(y));
            else
                return do_train(vector_to_matrix(x), vector_to_matrix(y));
        }

    private:

        template <
            typename in_sample_vector_type,
            typename in_scalar_vector_type
            >
        const decision_function<kernel_type> do_train (
            const in_sample_vector_type& x,
            const in_scalar_vector_type& y
        ) const
        {
            typedef typename decision_function<kernel_type>::sample_vector_type sample_vector_type;
            typedef typename decision_function<kernel_type>::scalar_vector_type scalar_vector_type;

            dlib::rand rnd;

            trainer_type my_trainer(trainer);

            scalar_type cur_learning_rate = min_learning_rate + 10;
            unsigned long count = 0;

            while (cur_learning_rate > min_learning_rate)
            {
                const long i = rnd.get_random_32bit_number()%x.size();
                // keep feeding the trainer data until its learning rate goes below our threshold
                cur_learning_rate = my_trainer.train(x(i), y(i));

                if (verbose)
                {
                    if ( (count&0x7FF) == 0)
                    {
                        std::cout << "\rbatch_trainer(): Percent complete: " 
                                  << 100*min_learning_rate/cur_learning_rate << "             " << std::flush;
                    }
                    ++count;
                }
            }

            if (verbose)
            {
                decision_function<kernel_type> df = my_trainer.get_decision_function();
                std::cout << "\rbatch_trainer(): Percent complete: 100           " << std::endl;
                std::cout << "    Num sv: " << df.basis_vectors.size() << std::endl;
                std::cout << "    bias:   " << df.b << std::endl;
                return df;
            }
            else
            {
                return my_trainer.get_decision_function();
            }
        }

        template <
            typename in_sample_vector_type,
            typename in_scalar_vector_type
            >
        const decision_function<kernel_type> do_train_cached (
            const in_sample_vector_type& x,
            const in_scalar_vector_type& y
        ) const
        {
            typedef typename decision_function<kernel_type>::sample_vector_type sample_vector_type;
            typedef typename decision_function<kernel_type>::scalar_vector_type scalar_vector_type;

            dlib::rand rnd;

            // make a caching kernel
            typedef caching_kernel<kernel_type, in_sample_vector_type> ckernel_type;
            ckernel_type ck(trainer.get_kernel(), x, cache_size);

            // now rebind the trainer to use the caching kernel
            typedef typename trainer_type::template rebind<ckernel_type>::other rebound_trainer_type;
            rebound_trainer_type my_trainer;
            my_trainer.set_kernel(ck);
            replicate_settings(trainer, my_trainer);

            scalar_type cur_learning_rate = min_learning_rate + 10;
            unsigned long count = 0;

            while (cur_learning_rate > min_learning_rate)
            {
                const long i = rnd.get_random_32bit_number()%x.size();
                // keep feeding the trainer data until its learning rate goes below our threshold
                cur_learning_rate = my_trainer.train(i, y(i));

                if (verbose)
                {
                    if ( (count&0x7FF) == 0)
                    {
                        std::cout << "\rbatch_trainer(): Percent complete: " 
                                  << 100*min_learning_rate/cur_learning_rate << "             " << std::flush;
                    }
                    ++count;
                }
            }

            if (verbose)
            {
                decision_function<ckernel_type> cached_df;
                cached_df = my_trainer.get_decision_function();

                std::cout << "\rbatch_trainer(): Percent complete: 100           " << std::endl;
                std::cout << "    Num sv: " << cached_df.basis_vectors.size() << std::endl;
                std::cout << "    bias:   " << cached_df.b << std::endl;

                return decision_function<kernel_type> (
                        cached_df.alpha,
                        cached_df.b,
                        trainer.get_kernel(),
                        rowm(x, cached_df.basis_vectors)
                        );
            }
            else
            {
                decision_function<ckernel_type> cached_df;
                cached_df = my_trainer.get_decision_function();

                return decision_function<kernel_type> (
                        cached_df.alpha,
                        cached_df.b,
                        trainer.get_kernel(),
                        rowm(x, cached_df.basis_vectors)
                        );
            }
        }

        trainer_type trainer;
        scalar_type min_learning_rate;
        bool verbose;
        bool use_cache;
        long cache_size;

    }; // end of class batch_trainer

// ----------------------------------------------------------------------------------------

    template <
        typename trainer_type
        >
    const batch_trainer<trainer_type> batch (
        const trainer_type& trainer,
        const typename trainer_type::scalar_type min_learning_rate = 0.1
    ) { return batch_trainer<trainer_type>(trainer, min_learning_rate, false, false); }

// ----------------------------------------------------------------------------------------

    template <
        typename trainer_type
        >
    const batch_trainer<trainer_type> verbose_batch (
        const trainer_type& trainer,
        const typename trainer_type::scalar_type min_learning_rate = 0.1
    ) { return batch_trainer<trainer_type>(trainer, min_learning_rate, true, false); }

// ----------------------------------------------------------------------------------------

    template <
        typename trainer_type
        >
    const batch_trainer<trainer_type> batch_cached (
        const trainer_type& trainer,
        const typename trainer_type::scalar_type min_learning_rate = 0.1,
        long cache_size = 100
    ) { return batch_trainer<trainer_type>(trainer, min_learning_rate, false, true, cache_size); }

// ----------------------------------------------------------------------------------------

    template <
        typename trainer_type
        >
    const batch_trainer<trainer_type> verbose_batch_cached (
        const trainer_type& trainer,
        const typename trainer_type::scalar_type min_learning_rate = 0.1,
        long cache_size = 100
    ) { return batch_trainer<trainer_type>(trainer, min_learning_rate, true, true, cache_size); }

// ----------------------------------------------------------------------------------------

}

#endif // DLIB_PEGASoS_

