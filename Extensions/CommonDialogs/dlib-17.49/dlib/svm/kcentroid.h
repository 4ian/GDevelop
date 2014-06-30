// Copyright (C) 2008  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#ifndef DLIB_KCENTROId_
#define DLIB_KCENTROId_

#include <vector>

#include "kcentroid_abstract.h"
#include "../matrix.h"
#include "function.h"
#include "../std_allocator.h"

namespace dlib
{

// ----------------------------------------------------------------------------------------

    template <typename kernel_type>
    class kcentroid
    {
        /*!
            This object represents a weighted sum of sample points in a kernel induced
            feature space.  It can be used to kernelize any algorithm that requires only
            the ability to perform vector addition, subtraction, scalar multiplication,
            and inner products.  It uses the sparsification technique described in the 
            paper The Kernel Recursive Least Squares Algorithm by Yaakov Engel.

            To understand the code it would also be useful to consult page 114 of the book 
            Kernel Methods for Pattern Analysis by Taylor and Cristianini as well as page 554 
            (particularly equation 18.31) of the book Learning with Kernels by Scholkopf and 
            Smola.  Everything you really need to know is in the Engel paper.  But the other 
            books help give more perspective on the issues involved.


            INITIAL VALUE
                - min_strength == 0
                - min_vect_idx == 0
                - K_inv.size() == 0
                - K.size() == 0
                - dictionary.size() == 0
                - bias == 0
                - bias_is_stale == false

            CONVENTION
                - max_dictionary_size() == my_max_dictionary_size
                - get_kernel() == kernel

                - K.nr() == dictionary.size()
                - K.nc() == dictionary.size()
                - for all valid r,c:
                    - K(r,c) == kernel(dictionary[r], dictionary[c])
                - K_inv == inv(K)

                - if (dictionary.size() == my_max_dictionary_size && my_remove_oldest_first == false) then
                    - for all valid 0 < i < dictionary.size():
                        - Let STRENGTHS[i] == the delta you would get for dictionary[i] (i.e. Approximately 
                          Linearly Dependent value) if you removed dictionary[i] from this object and then 
                          tried to add it back in.
                        - min_strength == the minimum value from STRENGTHS
                        - min_vect_idx == the index of the element in STRENGTHS with the smallest value

        !*/

    public:
        typedef typename kernel_type::scalar_type scalar_type;
        typedef typename kernel_type::sample_type sample_type;
        typedef typename kernel_type::mem_manager_type mem_manager_type;

        kcentroid (
        ) : 
            my_remove_oldest_first(false),
            my_tolerance(0.001),
            my_max_dictionary_size(1000000),
            bias(0),
            bias_is_stale(false)
        {
            clear_dictionary();
        }

        explicit kcentroid (
            const kernel_type& kernel_, 
            scalar_type tolerance_ = 0.001,
            unsigned long max_dictionary_size_ = 1000000,
            bool remove_oldest_first_ = false 
        ) : 
            my_remove_oldest_first(remove_oldest_first_),
            kernel(kernel_), 
            my_tolerance(tolerance_),
            my_max_dictionary_size(max_dictionary_size_),
            bias(0),
            bias_is_stale(false)
        {
            // make sure requires clause is not broken
            DLIB_ASSERT(tolerance_ > 0 && max_dictionary_size_ > 1,
                "\tkcentroid::kcentroid()"
                << "\n\t You have to give a positive tolerance"
                << "\n\t this:                 " << this
                << "\n\t tolerance_:           " << tolerance_ 
                << "\n\t max_dictionary_size_: " << max_dictionary_size_ 
                );

            clear_dictionary();
        }

        scalar_type tolerance() const
        {
            return my_tolerance;
        }

        unsigned long max_dictionary_size() const
        {
            return my_max_dictionary_size;
        }

        bool remove_oldest_first (
        ) const
        {
            return my_remove_oldest_first;
        }

        const kernel_type& get_kernel (
        ) const
        {
            return kernel;
        }

        void clear_dictionary ()
        {
            dictionary.clear();
            alpha.clear();

            min_strength = 0;
            min_vect_idx = 0;
            K_inv.set_size(0,0);
            K.set_size(0,0);
            samples_seen = 0;
            bias = 0;
            bias_is_stale = false;
        }

        scalar_type operator() (
            const kcentroid& x
        ) const
        {
            // make sure requires clause is not broken
            DLIB_ASSERT(x.get_kernel() == get_kernel(),
                "\tscalar_type kcentroid::operator()(const kcentroid& x)"
                << "\n\tYou can only compare two kcentroid objects if they use the same kernel"
                << "\n\tthis: " << this
                );

            // make sure the bias terms are up to date
            refresh_bias();
            x.refresh_bias();

            scalar_type temp = x.bias + bias - 2*inner_product(x);

            if (temp > 0)
                return std::sqrt(temp);
            else
                return 0;
        }

        scalar_type inner_product (
            const sample_type& x
        ) const
        {
            scalar_type temp = 0; 
            for (unsigned long i = 0; i < alpha.size(); ++i)
                temp += alpha[i]*kernel(dictionary[i], x);
            return temp;
        }

        scalar_type inner_product (
            const kcentroid& x
        ) const
        {
            // make sure requires clause is not broken
            DLIB_ASSERT(x.get_kernel() == get_kernel(),
                "\tscalar_type kcentroid::inner_product(const kcentroid& x)"
                << "\n\tYou can only compare two kcentroid objects if they use the same kernel"
                << "\n\tthis: " << this
                );

            scalar_type temp = 0; 
            for (unsigned long i = 0; i < alpha.size(); ++i)
            {
                for (unsigned long j = 0; j < x.alpha.size(); ++j)
                {
                    temp += alpha[i]*x.alpha[j]*kernel(dictionary[i], x.dictionary[j]);
                }
            }
            return temp;
        }

        scalar_type squared_norm (
        ) const
        {
            refresh_bias();
            return bias;
        }

        scalar_type operator() (
            const sample_type& x
        ) const
        {
            // make sure the bias terms are up to date
            refresh_bias();

            const scalar_type kxx = kernel(x,x);

            scalar_type temp = kxx + bias - 2*inner_product(x);
            if (temp > 0)
                return std::sqrt(temp);
            else
                return 0;
        }

        scalar_type samples_trained (
        ) const
        {
            return samples_seen;
        }

        scalar_type test_and_train (
            const sample_type& x
        )
        {
            ++samples_seen;
            const scalar_type xscale = 1/samples_seen;
            const scalar_type cscale = 1-xscale;
            return train_and_maybe_test(x,cscale,xscale,true);
        }

        void train (
            const sample_type& x
        )
        {
            ++samples_seen;
            const scalar_type xscale = 1/samples_seen;
            const scalar_type cscale = 1-xscale;
            train_and_maybe_test(x,cscale,xscale,false);
        }

        scalar_type test_and_train (
            const sample_type& x,
            scalar_type cscale,
            scalar_type xscale
        )
        {
            ++samples_seen;
            return train_and_maybe_test(x,cscale,xscale,true);
        }

        void scale_by (
            scalar_type cscale
        )
        {
            for (unsigned long i = 0; i < alpha.size(); ++i)
            {
                alpha[i] = cscale*alpha[i];
            }
        }

        void train (
            const sample_type& x,
            scalar_type cscale,
            scalar_type xscale
        )
        {
            ++samples_seen;
            train_and_maybe_test(x,cscale,xscale,false);
        }

        void swap (
            kcentroid& item
        )
        {
            exchange(min_strength, item.min_strength);
            exchange(min_vect_idx, item.min_vect_idx);
            exchange(my_remove_oldest_first, item.my_remove_oldest_first);

            exchange(kernel, item.kernel);
            dictionary.swap(item.dictionary);
            alpha.swap(item.alpha);
            K_inv.swap(item.K_inv);
            K.swap(item.K);
            exchange(my_tolerance, item.my_tolerance);
            exchange(samples_seen, item.samples_seen);
            exchange(bias, item.bias);
            a.swap(item.a);
            k.swap(item.k);
            exchange(bias_is_stale, item.bias_is_stale);
            exchange(my_max_dictionary_size, item.my_max_dictionary_size);
        }

        unsigned long dictionary_size (
        ) const { return dictionary.size(); }

        friend void serialize(const kcentroid& item, std::ostream& out)
        {
            serialize(item.min_strength, out);
            serialize(item.min_vect_idx, out);
            serialize(item.my_remove_oldest_first, out);

            serialize(item.kernel, out);
            serialize(item.dictionary, out);
            serialize(item.alpha, out);
            serialize(item.K_inv, out);
            serialize(item.K, out);
            serialize(item.my_tolerance, out);
            serialize(item.samples_seen, out);
            serialize(item.bias, out);
            serialize(item.bias_is_stale, out);
            serialize(item.my_max_dictionary_size, out);
        }

        friend void deserialize(kcentroid& item, std::istream& in)
        {
            deserialize(item.min_strength, in);
            deserialize(item.min_vect_idx, in);
            deserialize(item.my_remove_oldest_first, in);

            deserialize(item.kernel, in);
            deserialize(item.dictionary, in);
            deserialize(item.alpha, in);
            deserialize(item.K_inv, in);
            deserialize(item.K, in);
            deserialize(item.my_tolerance, in);
            deserialize(item.samples_seen, in);
            deserialize(item.bias, in);
            deserialize(item.bias_is_stale, in);
            deserialize(item.my_max_dictionary_size, in);
        }

        distance_function<kernel_type> get_distance_function (
        ) const
        {
            refresh_bias();
            return distance_function<kernel_type>(vector_to_matrix(alpha),
                                                  bias, 
                                                  kernel, 
                                                  vector_to_matrix(dictionary));
        }

    private:

        void refresh_bias (
        ) const 
        {
            if (bias_is_stale)
            {
                bias_is_stale = false;
                // recompute the bias term
                bias = sum(pointwise_multiply(K, vector_to_matrix(alpha)*trans(vector_to_matrix(alpha))));
            }
        }

        scalar_type train_and_maybe_test (
            const sample_type& x,
            scalar_type cscale,
            scalar_type xscale,
            bool do_test
        )
        {
            scalar_type test_result = 0;
            const scalar_type kx = kernel(x,x);
            if (alpha.size() == 0)
            {
                // just ignore this sample if it is the zero vector (or really close to being zero)
                if (std::abs(kx) > std::numeric_limits<scalar_type>::epsilon())
                {
                    // set initial state since this is the first training example we have seen

                    K_inv.set_size(1,1);
                    K_inv(0,0) = 1/kx;
                    K.set_size(1,1);
                    K(0,0) = kx;

                    alpha.push_back(xscale);
                    dictionary.push_back(x);
                }
                else
                {
                    // the distance from an empty kcentroid and the zero vector is zero by definition.
                    return 0;
                }
            }
            else
            {
                // fill in k
                k.set_size(alpha.size());
                for (long r = 0; r < k.nr(); ++r)
                    k(r) = kernel(x,dictionary[r]);

                if (do_test)
                {
                    refresh_bias();
                    test_result = std::sqrt(kx + bias - 2*trans(vector_to_matrix(alpha))*k);
                }

                // compute the error we would have if we approximated the new x sample
                // with the dictionary.  That is, do the ALD test from the KRLS paper.
                a = K_inv*k;
                scalar_type delta = kx - trans(k)*a;

                // if this new vector isn't approximately linearly dependent on the vectors
                // in our dictionary.
                if (delta > min_strength && delta > my_tolerance)
                {
                    bool need_to_update_min_strength = false;
                    if (dictionary.size() >= my_max_dictionary_size)
                    {
                        // We need to remove one of the old members of the dictionary before
                        // we proceed with adding a new one.  
                        long idx_to_remove;
                        if (my_remove_oldest_first)
                        {
                            // remove the oldest one
                            idx_to_remove = 0;
                        }
                        else
                        {
                            // if we have never computed the min_strength then we should compute it 
                            if (min_strength == 0)
                                recompute_min_strength();

                            // select the dictionary vector that is most linearly dependent for removal
                            idx_to_remove = min_vect_idx;
                            need_to_update_min_strength = true;
                        }

                        remove_dictionary_vector(idx_to_remove);

                        // recompute these guys since they were computed with the old
                        // kernel matrix
                        k = remove_row(k,idx_to_remove);
                        a = K_inv*k;
                        delta = kx - trans(k)*a;
                    }

                    // add x to the dictionary
                    dictionary.push_back(x);


                    // update K_inv by computing the new one in the temp matrix (equation 3.14)
                    matrix<scalar_type,0,0,mem_manager_type> temp(K_inv.nr()+1, K_inv.nc()+1);
                    // update the middle part of the matrix
                    set_subm(temp, get_rect(K_inv)) = K_inv + a*trans(a)/delta;
                    // update the right column of the matrix
                    set_subm(temp, 0, K_inv.nr(),K_inv.nr(),1) = -a/delta;
                    // update the bottom row of the matrix
                    set_subm(temp, K_inv.nr(), 0, 1, K_inv.nr()) = trans(-a/delta);
                    // update the bottom right corner of the matrix
                    temp(K_inv.nr(), K_inv.nc()) = 1/delta;
                    // put temp into K_inv
                    temp.swap(K_inv);



                    // update K (the kernel matrix)
                    temp.set_size(K.nr()+1, K.nc()+1);
                    set_subm(temp, get_rect(K)) = K;
                    // update the right column of the matrix
                    set_subm(temp, 0, K.nr(),K.nr(),1) = k;
                    // update the bottom row of the matrix
                    set_subm(temp, K.nr(), 0, 1, K.nr()) = trans(k);
                    temp(K.nr(), K.nc()) = kx;
                    // put temp into K
                    temp.swap(K);


                    // now update the alpha vector 
                    for (unsigned long i = 0; i < alpha.size(); ++i)
                    {
                        alpha[i] *= cscale;
                    }
                    alpha.push_back(xscale);


                    if (need_to_update_min_strength)
                    {
                        // now we have to recompute the min_strength in this case
                        recompute_min_strength();
                    }
                }
                else
                {
                    // update the alpha vector so that this new sample has been added into
                    // the mean vector we are accumulating
                    for (unsigned long i = 0; i < alpha.size(); ++i)
                    {
                        alpha[i] = cscale*alpha[i] + xscale*a(i);
                    }
                }
            }

            bias_is_stale = true;
            
            return test_result;
        }

        void remove_dictionary_vector (
            long i
        )
        /*!
            requires
                - 0 <= i < dictionary.size()
            ensures
                - #dictionary.size() == dictionary.size() - 1
                - #alpha.size() == alpha.size() - 1
                - updates the K_inv matrix so that it is still a proper inverse of the
                  kernel matrix
                - also removes the necessary row and column from the K matrix
                - uses the this->a variable so after this function runs that variable
                  will contain a different value.  
        !*/
        {
            // remove the dictionary vector 
            dictionary.erase(dictionary.begin()+i);

            // remove the i'th vector from the inverse kernel matrix.  This formula is basically
            // just the reverse of the way K_inv is updated by equation 3.14 during normal training.
            K_inv = removerc(K_inv,i,i) - remove_row(colm(K_inv,i)/K_inv(i,i),i)*remove_col(rowm(K_inv,i),i);

            // now compute the updated alpha values to take account that we just removed one of 
            // our dictionary vectors
            a = (K_inv*remove_row(K,i)*vector_to_matrix(alpha));

            // now copy over the new alpha values
            alpha.resize(alpha.size()-1);
            for (unsigned long k = 0; k < alpha.size(); ++k)
            {
                alpha[k] = a(k);
            }

            // update the K matrix as well
            K = removerc(K,i,i);
        }

        void recompute_min_strength (
        )
        /*!
            ensures
                - recomputes the min_strength and min_vect_idx values
                  so that they are correct with respect to the CONVENTION
                - uses the this->a variable so after this function runs that variable
                  will contain a different value.  
        !*/
        {
            min_strength = std::numeric_limits<scalar_type>::max();

            // here we loop over each dictionary vector and compute what its delta would be if
            // we were to remove it from the dictionary and then try to add it back in.
            for (unsigned long i = 0; i < dictionary.size(); ++i)
            {
                // compute a = K_inv*k but where dictionary vector i has been removed
                a = (removerc(K_inv,i,i) - remove_row(colm(K_inv,i)/K_inv(i,i),i)*remove_col(rowm(K_inv,i),i)) *
                    (remove_row(colm(K,i),i));
                scalar_type delta = K(i,i) - trans(remove_row(colm(K,i),i))*a;

                if (delta < min_strength)
                {
                    min_strength = delta;
                    min_vect_idx = i;
                }
            }
        }



        typedef std_allocator<sample_type, mem_manager_type> alloc_sample_type;
        typedef std_allocator<scalar_type, mem_manager_type> alloc_scalar_type;
        typedef std::vector<sample_type,alloc_sample_type> dictionary_vector_type;
        typedef std::vector<scalar_type,alloc_scalar_type> alpha_vector_type;


        scalar_type min_strength;
        unsigned long min_vect_idx;
        bool my_remove_oldest_first;

        kernel_type kernel;
        dictionary_vector_type dictionary;
        alpha_vector_type alpha;

        matrix<scalar_type,0,0,mem_manager_type> K_inv;
        matrix<scalar_type,0,0,mem_manager_type> K;

        scalar_type my_tolerance;
        unsigned long my_max_dictionary_size;
        scalar_type samples_seen;
        mutable scalar_type bias;
        mutable bool bias_is_stale;


        // temp variables here just so we don't have to reconstruct them over and over.  Thus, 
        // they aren't really part of the state of this object.
        matrix<scalar_type,0,1,mem_manager_type> a;
        matrix<scalar_type,0,1,mem_manager_type> k;

    };

// ----------------------------------------------------------------------------------------

    template <typename kernel_type>
    void swap(kcentroid<kernel_type>& a, kcentroid<kernel_type>& b)
    { a.swap(b); }

// ----------------------------------------------------------------------------------------

}

#endif // DLIB_KCENTROId_

