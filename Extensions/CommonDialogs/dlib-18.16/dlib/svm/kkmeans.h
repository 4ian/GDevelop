// Copyright (C) 2008  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#ifndef DLIB_KKMEANs_
#define DLIB_KKMEANs_

#include <cmath>
#include "../matrix/matrix_abstract.h"
#include "../algs.h"
#include "../serialize.h"
#include "kernel.h"
#include "../array.h"
#include "kcentroid.h"
#include "kkmeans_abstract.h"
#include "../noncopyable.h"
#include "../smart_pointers.h"
#include <vector>

namespace dlib
{

    template <
        typename kernel_type
        >
    class kkmeans : public noncopyable
    {
    public:
        typedef typename kernel_type::scalar_type scalar_type;
        typedef typename kernel_type::sample_type sample_type;
        typedef typename kernel_type::mem_manager_type mem_manager_type;

        kkmeans (
            const kcentroid<kernel_type>& kc_ 
        ):
            kc(kc_),
            min_change(0.01)
        {
            set_number_of_centers(1);
        }

        ~kkmeans()
        {
        }

        const kernel_type& get_kernel (
        ) const
        {
            return kc.get_kernel();
        }

        void set_kcentroid (
            const kcentroid<kernel_type>& kc_
        )
        {
            kc = kc_;
            set_number_of_centers(number_of_centers());
        }

        const kcentroid<kernel_type>& get_kcentroid (
            unsigned long i
        ) const
        {
            // make sure requires clause is not broken
            DLIB_ASSERT(i < number_of_centers(),
                "\tkcentroid kkmeans::get_kcentroid(i)"
                << "\n\tYou have given an invalid value for i"
                << "\n\ti:                   " << i 
                << "\n\tnumber_of_centers(): " << number_of_centers() 
                << "\n\tthis:                " << this
                );

            return *centers[i];
        }

        void set_number_of_centers (
            unsigned long num
        )
        {
            // make sure requires clause is not broken
            DLIB_ASSERT(num > 0,
                "\tvoid kkmeans::set_number_of_centers()"
                << "\n\tYou can't set the number of centers to zero"
                << "\n\tthis: " << this
                );

            centers.set_max_size(num);
            centers.set_size(num);

            for (unsigned long i = 0; i < centers.size(); ++i)
            {
                centers[i].reset(new kcentroid<kernel_type>(kc));
            }
        }

        unsigned long number_of_centers (
        ) const
        {
            return centers.size();
        }

        template <typename T, typename U>
        void train (
            const T& samples,
            const U& initial_centers,
            long max_iter = 1000
        )
        {
            do_train(mat(samples),mat(initial_centers),max_iter);
        }

        unsigned long operator() (
            const sample_type& sample
        ) const
        {
            unsigned long label = 0;
            scalar_type best_score = (*centers[0])(sample);

            // figure out which center the given sample is closest too
            for (unsigned long i = 1; i < centers.size(); ++i)
            {
                scalar_type temp = (*centers[i])(sample);
                if (temp < best_score)
                {
                    label = i;
                    best_score = temp;
                }
            }

            return label;
        }

        void set_min_change (
            scalar_type min_change_
        )
        {
            // make sure requires clause is not broken
            DLIB_ASSERT( 0 <= min_change_ < 1,
                "\tvoid kkmeans::set_min_change()"
                << "\n\tInvalid arguments to this function"
                << "\n\tthis: " << this
                << "\n\tmin_change_: " << min_change_ 
                );
            min_change = min_change_;
        }

        const scalar_type get_min_change (
        ) const
        {
            return min_change;
        }

        void swap (
            kkmeans& item
        )
        {
            centers.swap(item.centers);
            kc.swap(item.kc);
            assignments.swap(item.assignments);
            exchange(min_change, item.min_change);
        }

        friend void serialize(const kkmeans& item, std::ostream& out)
        {
            serialize(item.centers.size(),out);
            for (unsigned long i = 0; i < item.centers.size(); ++i)
            {
                serialize(*item.centers[i], out);
            }
            serialize(item.kc, out);
            serialize(item.min_change, out);
        }

        friend void deserialize(kkmeans& item, std::istream& in)
        {
            unsigned long num;
            deserialize(num, in);
            item.centers.resize(num);
            for (unsigned long i = 0; i < item.centers.size(); ++i)
            {
                scoped_ptr<kcentroid<kernel_type> > temp(new kcentroid<kernel_type>(kernel_type()));
                deserialize(*temp, in);
                item.centers[i].swap(temp);
            }

            deserialize(item.kc, in);
            deserialize(item.min_change, in);
        }

    private:

        template <typename matrix_type, typename matrix_type2>
        void do_train (
            const matrix_type& samples,
            const matrix_type2& initial_centers,
            long max_iter = 1000
        )
        {
            COMPILE_TIME_ASSERT((is_same_type<typename matrix_type::type, sample_type>::value));
            COMPILE_TIME_ASSERT((is_same_type<typename matrix_type2::type, sample_type>::value));

            // make sure requires clause is not broken
            DLIB_ASSERT(samples.nc() == 1 && initial_centers.nc() == 1 &&
                         initial_centers.nr() == static_cast<long>(number_of_centers()),
                "\tvoid kkmeans::train()"
                << "\n\tInvalid arguments to this function"
                << "\n\tthis: " << this
                << "\n\tsamples.nc(): " << samples.nc() 
                << "\n\tinitial_centers.nc(): " << initial_centers.nc() 
                << "\n\tinitial_centers.nr(): " << initial_centers.nr() 
                );

            // clear out the old data and initialize the centers
            for (unsigned long i = 0; i < centers.size(); ++i)
            {
                centers[i]->clear_dictionary();
                centers[i]->train(initial_centers(i));
            }

            assignments.resize(samples.size());

            bool assignment_changed = true;

            // loop until the centers stabilize 
            long count = 0;
            const unsigned long min_num_change = static_cast<unsigned long>(min_change*samples.size());
            unsigned long num_changed = min_num_change;
            while (assignment_changed && count < max_iter && num_changed >= min_num_change)
            {
                ++count;
                assignment_changed = false;
                num_changed = 0;

                // loop over all the samples and assign them to their closest centers
                for (long i = 0; i < samples.size(); ++i)
                {
                    // find the best center
                    unsigned long best_center = 0;
                    scalar_type best_score = (*centers[0])(samples(i));
                    for (unsigned long c = 1; c < centers.size(); ++c)
                    {
                        scalar_type temp = (*centers[c])(samples(i));
                        if (temp < best_score)
                        {
                            best_score = temp;
                            best_center = c;
                        }
                    }

                    // if the current sample changed centers then make note of that
                    if (assignments[i] != best_center)
                    {
                        assignments[i] = best_center;
                        assignment_changed = true;
                        ++num_changed;
                    }
                }

                if (assignment_changed)
                {
                    // now clear out the old data 
                    for (unsigned long i = 0; i < centers.size(); ++i)
                        centers[i]->clear_dictionary();

                    // recalculate the cluster centers 
                    for (unsigned long i = 0; i < assignments.size(); ++i)
                        centers[assignments[i]]->train(samples(i));
                }

            }


        }

        array<scoped_ptr<kcentroid<kernel_type> > > centers;
        kcentroid<kernel_type> kc;
        scalar_type min_change;

        // temp variables
        array<unsigned long> assignments;
    };

// ----------------------------------------------------------------------------------------

    template <typename kernel_type>
    void swap(kkmeans<kernel_type>& a, kkmeans<kernel_type>& b)
    { a.swap(b); }

// ----------------------------------------------------------------------------------------

    struct dlib_pick_initial_centers_data
    {
        dlib_pick_initial_centers_data():idx(0), dist(1e200){}
        long idx;
        double dist;
        bool operator< (const dlib_pick_initial_centers_data& d) const { return dist < d.dist; }
    };

    template <
        typename vector_type1, 
        typename vector_type2, 
        typename kernel_type
        >
    void pick_initial_centers(
        long num_centers, 
        vector_type1& centers, 
        const vector_type2& samples, 
        const kernel_type& k, 
        double percentile = 0.01
    )
    {
        /*
            This function is basically just a non-randomized version of the kmeans++ algorithm
            described in the paper:
                kmeans++: The Advantages of Careful Seeding by Arthur and Vassilvitskii

        */


        // make sure requires clause is not broken
        DLIB_ASSERT(num_centers > 1 && 0 <= percentile && percentile < 1 && samples.size() > 1,
            "\tvoid pick_initial_centers()"
            << "\n\tYou passed invalid arguments to this function"
            << "\n\tnum_centers: " << num_centers 
            << "\n\tpercentile: " << percentile 
            << "\n\tsamples.size(): " << samples.size() 
            );

        std::vector<dlib_pick_initial_centers_data> scores(samples.size());
        std::vector<dlib_pick_initial_centers_data> scores_sorted(samples.size());
        centers.clear();

        // pick the first sample as one of the centers
        centers.push_back(samples[0]);

        const long best_idx = static_cast<long>(samples.size() - samples.size()*percentile - 1);

        // pick the next center
        for (long i = 0; i < num_centers-1; ++i)
        {
            // Loop over the samples and compare them to the most recent center.  Store
            // the distance from each sample to its closest center in scores.
            const double k_cc = k(centers[i], centers[i]);
            for (unsigned long s = 0; s < samples.size(); ++s)
            {
                // compute the distance between this sample and the current center
                const double dist = k_cc + k(samples[s],samples[s]) - 2*k(samples[s], centers[i]);

                if (dist < scores[s].dist)
                {
                    scores[s].dist = dist;
                    scores[s].idx = s;
                }
            }

            scores_sorted = scores;

            // now find the winning center and add it to centers.  It is the one that is 
            // far away from all the other centers.
            sort(scores_sorted.begin(), scores_sorted.end());
            centers.push_back(samples[scores_sorted[best_idx].idx]);
        }
        
    }

// ----------------------------------------------------------------------------------------

    template <
        typename vector_type1, 
        typename vector_type2
        >
    void pick_initial_centers(
        long num_centers, 
        vector_type1& centers, 
        const vector_type2& samples, 
        double percentile = 0.01
    )
    {
        typedef typename vector_type1::value_type sample_type;
        linear_kernel<sample_type> kern;
        pick_initial_centers(num_centers, centers, samples, kern, percentile);
    }

// ----------------------------------------------------------------------------------------

    template <
        typename array_type, 
        typename sample_type,
        typename alloc
        >
    void find_clusters_using_kmeans (
        const array_type& samples,
        std::vector<sample_type, alloc>& centers,
        unsigned long max_iter = 1000
    )
    {
        // make sure requires clause is not broken
        DLIB_ASSERT(samples.size() > 0 && centers.size() > 0,
            "\tvoid find_clusters_using_kmeans()"
            << "\n\tYou passed invalid arguments to this function"
            << "\n\t samples.size(): " << samples.size() 
            << "\n\t centers.size(): " << centers.size() 
            );

#ifdef ENABLE_ASSERTS
        {
        const long nr = samples[0].nr();
        const long nc = samples[0].nc();
        for (unsigned long i = 0; i < samples.size(); ++i)
        {
            DLIB_ASSERT(is_vector(samples[i]) && samples[i].nr() == nr && samples[i].nc() == nc,
                "\tvoid find_clusters_using_kmeans()"
                << "\n\t You passed invalid arguments to this function"
                << "\n\t is_vector(samples[i]): " << is_vector(samples[i])
                << "\n\t samples[i].nr():       " << samples[i].nr()
                << "\n\t nr:                    " << nr
                << "\n\t samples[i].nc():       " << samples[i].nc()
                << "\n\t nc:                    " << nc
                << "\n\t i:                     " << i
                );
        }
        }
#endif

        typedef typename sample_type::type scalar_type;

        sample_type zero(centers[0]);
        set_all_elements(zero, 0);

        std::vector<unsigned long> center_element_count;

        // tells which center a sample belongs to
        std::vector<unsigned long> assignments(samples.size(), samples.size());


        unsigned long iter = 0;
        bool centers_changed = true;
        while (centers_changed && iter < max_iter)
        {
            ++iter;
            centers_changed = false;
            center_element_count.assign(centers.size(), 0);

            // loop over each sample and see which center it is closest to
            for (unsigned long i = 0; i < samples.size(); ++i)
            {
                // find the best center for sample[i]
                scalar_type best_dist = std::numeric_limits<scalar_type>::max();
                unsigned long best_center = 0;
                for (unsigned long j = 0; j < centers.size(); ++j)
                {
                    scalar_type dist = length(centers[j] - samples[i]);
                    if (dist < best_dist)
                    {
                        best_dist = dist;
                        best_center = j;
                    }
                }

                if (assignments[i] != best_center)
                {
                    centers_changed = true;
                    assignments[i] = best_center;
                }

                center_element_count[best_center] += 1;
            }

            // now update all the centers
            centers.assign(centers.size(), zero);
            for (unsigned long i = 0; i < samples.size(); ++i)
            {
                centers[assignments[i]] += samples[i];
            }
            for (unsigned long i = 0; i < centers.size(); ++i)
            {
                if (center_element_count[i] != 0)
                    centers[i] /= center_element_count[i];
            }
        }

    }

// ----------------------------------------------------------------------------------------

    template <
        typename array_type, 
        typename EXP 
        >
    unsigned long nearest_center (
        const array_type& centers,
        const matrix_exp<EXP>& sample
    )
    {
        // make sure requires clause is not broken
        DLIB_ASSERT(centers.size() > 0 && sample.size() > 0 && is_vector(sample),
            "\t unsigned long nearest_center()"
            << "\n\t You have given invalid inputs to this function."
            << "\n\t centers.size():    " << centers.size() 
            << "\n\t sample.size():     " << sample.size() 
            << "\n\t is_vector(sample): " << is_vector(sample) 
            );

        double best_dist = length_squared(centers[0] - sample);
        unsigned long best_idx = 0;
        for (unsigned long i = 1; i < centers.size(); ++i)
        {
            const double dist = length_squared(centers[i] - sample);
            if (dist < best_dist)
            {
                best_dist = dist;
                best_idx = i;
            }
        }
        return best_idx;
    }

// ----------------------------------------------------------------------------------------

}

#endif // DLIB_KKMEANs_


