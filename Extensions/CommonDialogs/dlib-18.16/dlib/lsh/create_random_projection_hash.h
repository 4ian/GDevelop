// Copyright (C) 2011  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#ifndef DLIB_CREATE_RANDOM_PROJECTION_HAsH_Hh_
#define DLIB_CREATE_RANDOM_PROJECTION_HAsH_Hh_

#include "create_random_projection_hash_abstract.h"
#include "projection_hash.h"
#include "../matrix.h"
#include "../rand.h"
#include "../statistics.h"
#include "../svm.h"
#include <vector>

namespace dlib
{

// ----------------------------------------------------------------------------------------

    template <
        typename vector_type
        >
    projection_hash create_random_projection_hash (
        const vector_type& v,
        const int bits,
        dlib::rand& rnd
    ) 
    {
        // make sure requires clause is not broken
        DLIB_ASSERT(0 < bits && bits <= 32 &&
                    v.size() > 1,
            "\t projection_hash create_random_projection_hash()"
            << "\n\t Invalid arguments were given to this function."
            << "\n\t bits: " << bits
            << "\n\t v.size(): " << v.size() 
            );

#ifdef ENABLE_ASSERTS
        for (unsigned long i = 0; i < v.size(); ++i)
        {
            DLIB_ASSERT(v[0].size() == v[i].size() && v[i].size() > 0 && is_col_vector(v[i]), 
                    "\t projection_hash create_random_projection_hash()"
                   << "\n\t Invalid arguments were given to this function."
                   << "\n\t m(0).size(): " << v[0].size()
                   << "\n\t m("<<i<<").size(): " << v[i].size() 
                   << "\n\t is_col_vector(v["<<i<<"]): " << is_col_vector(v[i]) 
                );
        }
#endif

        running_covariance<matrix<double> > rc;
        for (unsigned long i = 0; i < v.size(); ++i)
            rc.add(matrix_cast<double>(v[i]));

        // compute a whitening matrix
        matrix<double> whiten = trans(chol(pinv(rc.covariance())));


        // hashes
        std::vector<unsigned long> h(v.size(),0);

        std::vector<double> vals(v.size(),0);

        // number of hits for each hash value
        std::vector<unsigned long> counts;

        std::vector<double> temp;

        // build a random projection matrix
        matrix<double> proj(bits, v[0].size());
        for (long r = 0; r < proj.nr(); ++r)
            for (long c = 0; c < proj.nc(); ++c)
                proj(r,c) = rnd.get_random_gaussian();

        // merge whitening matrix with projection matrix
        proj = proj*whiten;

        matrix<double,0,1> offset(bits);


        // figure out what the offset values should be
        for (int itr = 0; itr < offset.size(); ++itr)
        {
            counts.assign(static_cast<unsigned long>(std::pow(2.0,bits)), 0);
            // count the popularity of each hash value
            for (unsigned long i = 0; i < h.size(); ++i)
            {
                h[i] <<= 1;
                counts[h[i]] += 1;
            }

            const unsigned long max_h = index_of_max(mat(counts));

            temp.clear();
            for (unsigned long i = 0; i < v.size(); ++i)
            {
                vals[i] = dot(rowm(proj,itr), matrix_cast<double>(v[i]));
                if (h[i] == max_h)
                    temp.push_back(vals[i]);
            }

            // split down the middle
            std::sort(temp.begin(), temp.end());
            const double split = temp[temp.size()/2];
            offset(itr) = -split;

            for (unsigned long i = 0; i < vals.size(); ++i)
            {
                if (vals[i] - split > 0)
                    h[i] |= 1;
            }
        }


        return projection_hash(proj, offset);
    }

// ----------------------------------------------------------------------------------------

    template <
        typename vector_type
        >
    projection_hash create_random_projection_hash (
        const vector_type& v,
        const int bits
    ) 
    {
        dlib::rand rnd;
        return create_random_projection_hash(v,bits,rnd);
    }

// ----------------------------------------------------------------------------------------

    template <
        typename vector_type
        >
    projection_hash create_max_margin_projection_hash (
        const vector_type& v,
        const int bits,
        const double C,
        dlib::rand& rnd
    ) 
    {
        // make sure requires clause is not broken
        DLIB_ASSERT(0 < bits && bits <= 32 &&
                    v.size() > 1,
            "\t projection_hash create_max_margin_projection_hash()"
            << "\n\t Invalid arguments were given to this function."
            << "\n\t bits: " << bits
            << "\n\t v.size(): " << v.size() 
            );

#ifdef ENABLE_ASSERTS
        for (unsigned long i = 0; i < v.size(); ++i)
        {
            DLIB_ASSERT(v[0].size() == v[i].size() && v[i].size() > 0 && is_col_vector(v[i]), 
                    "\t projection_hash create_max_margin_projection_hash()"
                   << "\n\t Invalid arguments were given to this function."
                   << "\n\t m(0).size(): " << v[0].size()
                   << "\n\t m("<<i<<").size(): " << v[i].size() 
                   << "\n\t is_col_vector(v["<<i<<"]): " << is_col_vector(v[i]) 
                );
        }
#endif

        running_covariance<matrix<double> > rc;
        for (unsigned long i = 0; i < v.size(); ++i)
            rc.add(matrix_cast<double>(v[i]));

        // compute a whitening matrix
        matrix<double> whiten = trans(chol(pinv(rc.covariance())));
        const matrix<double,0,1> meanval = whiten*rc.mean();



        typedef matrix<double,0,1> sample_type;
        random_subset_selector<sample_type> training_samples;
        random_subset_selector<double> training_labels;
        // We set this up to use enough samples to cover the vector space used by elements
        // of v.  
        training_samples.set_max_size(v[0].size()*10);
        training_labels.set_max_size(v[0].size()*10);

        matrix<double> proj(bits, v[0].size());
        matrix<double,0,1> offset(bits);

        // learn the random planes and put them into proj and offset.
        for (int itr = 0; itr < offset.size(); ++itr)
        {
            training_samples.make_empty();
            training_labels.make_empty();
            // pick random training data and give each sample a random label.
            for (unsigned long i = 0; i < v.size(); ++i)
            {
                training_samples.add(whiten*v[i]-meanval);
                if (rnd.get_random_double() > 0.5)
                    training_labels.add(+1);
                else
                    training_labels.add(-1);
            }

            svm_c_linear_dcd_trainer<linear_kernel<sample_type> > trainer;
            trainer.set_c(C);
            decision_function<linear_kernel<sample_type> > df = trainer.train(training_samples, training_labels);
            offset(itr) = -df.b;
            set_rowm(proj,itr) = trans(df.basis_vectors(0));
        }


        return projection_hash(proj*whiten, offset-proj*meanval);
    }

// ----------------------------------------------------------------------------------------

    template <
        typename vector_type
        >
    projection_hash create_max_margin_projection_hash (
        const vector_type& v,
        const int bits,
        const double C = 10
    ) 
    {
        dlib::rand rnd;
        return create_max_margin_projection_hash(v,bits,C,rnd);
    }

// ----------------------------------------------------------------------------------------

}

#endif // DLIB_CREATE_RANDOM_PROJECTION_HAsH_Hh_

