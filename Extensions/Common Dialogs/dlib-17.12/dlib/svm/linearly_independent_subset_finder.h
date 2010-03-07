// Copyright (C) 2008  Davis E. King (davisking@users.sourceforge.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#ifndef DLIB_LISf__
#define DLIB_LISf__

#include <vector>

#include "linearly_independent_subset_finder_abstract.h"
#include "../matrix.h"
#include "function.h"
#include "../std_allocator.h"
#include "../algs.h"
#include "../serialize.h"

namespace dlib
{

// ----------------------------------------------------------------------------------------

    template <typename kernel_type>
    class linearly_independent_subset_finder
    {
        /*!
            INITIAL VALUE
                - min_strength == 0
                - min_vect_idx == 0
                - K_inv.size() == 0
                - K.size() == 0
                - dictionary.size() == 0

            CONVENTION
                - max_dictionary_size() == my_max_dictionary_size
                - get_kernel() == kernel
                - minimum_tolerance() == min_tolerance
                - dictionary_size() == dictionary.size()
                - get_dictionary() == vector_to_matrix(dictionary)
                - K.nr() == dictionary.size()
                - K.nc() == dictionary.size()
                - for all valid r,c:
                    - K(r,c) == kernel(dictionary[r], dictionary[c])
                - K_inv == inv(K)

                - if (dictionary.size() == my_max_dictionary_size) then
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


        linearly_independent_subset_finder (
            const kernel_type& kernel_, 
            unsigned long max_dictionary_size_,
            scalar_type min_tolerance_ = 0.001
        ) : 
            kernel(kernel_), 
            my_max_dictionary_size(max_dictionary_size_),
            min_tolerance(min_tolerance_)
        {
            // make sure requires clause is not broken
            DLIB_ASSERT(min_tolerance_ > 0,
                "\tlinearly_independent_subset_finder()"
                << "\n\tinvalid argument to constructor"
                << "\n\tmin_tolerance_: " << min_tolerance_
                << "\n\tthis:           " << this
                );
            clear_dictionary();
        }

        unsigned long max_dictionary_size() const
        {
            return my_max_dictionary_size;
        }

        const kernel_type& get_kernel (
        ) const
        {
            return kernel;
        }

        scalar_type minimum_tolerance(
        ) const
        {
            return min_tolerance;
        }

        void clear_dictionary ()
        {
            dictionary.clear();
            min_strength = 0;
            min_vect_idx = 0;

            K_inv.set_size(0,0);
            K.set_size(0,0);
        }

        void add (
            const sample_type& x
        )
        {
            const scalar_type kx = kernel(x,x);
            if (dictionary.size() == 0)
            {
                // set initial state since this is the first sample we have seen
                K_inv.set_size(1,1);
                K_inv(0,0) = 1/kx;

                K.set_size(1,1);
                K(0,0) = kx;

                dictionary.push_back(x);
            }
            else
            {
                // fill in k
                k.set_size(dictionary.size());
                for (long r = 0; r < k.nr(); ++r)
                    k(r) = kernel(x,dictionary[r]);

                // compute the error we would have if we approximated the new x sample
                // with the dictionary.  That is, do the ALD test from the KRLS paper.
                a = K_inv*k;
                scalar_type delta = kx - trans(k)*a;

                // if this new vector is approximately linearly independent of the vectors
                // in our dictionary.  Or if our dictionary just isn't full yet.
                if (delta > min_strength && delta > min_tolerance)
                {
                    if (dictionary.size() == my_max_dictionary_size)
                    {

                        const long i = min_vect_idx;

                        // replace the min strength vector with x.  Put the new vector onto the end of
                        // dictionary and remove the vector at position i.
                        dictionary.erase(dictionary.begin()+i);
                        dictionary.push_back(x);

                        // compute reduced K_inv.
                        // Remove the i'th vector from the inverse kernel matrix.  This formula is basically
                        // just the reverse of the way K_inv is updated by equation 3.14 below.
                        temp = removerc(K_inv,i,i) - remove_row(colm(K_inv,i)/K_inv(i,i),i)*remove_col(rowm(K_inv,i),i);

                        // recompute these guys since they were computed with the old
                        // kernel matrix
                        k2 = remove_row(k,i);
                        a2 = temp*k2;
                        delta = kx - trans(k2)*a2;

                        // now update temp with the new dictionary vector
                        // update the middle part of the matrix
                        set_subm(K_inv, get_rect(temp)) = temp + a2*trans(a2)/delta;
                        // update the right column of the matrix
                        set_subm(K_inv, 0, temp.nr(),temp.nr(),1) = -a2/delta;
                        // update the bottom row of the matrix
                        set_subm(K_inv, temp.nr(), 0, 1, temp.nr()) = trans(-a2/delta);
                        // update the bottom right corner of the matrix
                        K_inv(temp.nr(), temp.nc()) = 1/delta;

                        // now update the kernel matrix K
                        set_subm(K,get_rect(temp)) = removerc(K, i,i);
                        set_subm(K, 0, K.nr()-1,K.nr()-1,1) = k2;
                        // update the bottom row of the matrix
                        set_subm(K, K.nr()-1, 0, 1, K.nr()-1) = trans(k2);
                        K(K.nr()-1, K.nc()-1) = kx;

                        // now we have to recompute the min_strength in this case
                        recompute_min_strength();
                    }
                    else
                    {
                        // update K_inv by computing the new one in the temp matrix (equation 3.14 from Engel)
                        temp.set_size(K_inv.nr()+1, K_inv.nc()+1);
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


                        // add x to the dictionary
                        dictionary.push_back(x);

                    }
                }
            }
        }

        void swap (
            linearly_independent_subset_finder& item
        )
        {
            exchange(kernel, item.kernel);
            dictionary.swap(item.dictionary);
            exchange(min_strength, item.min_strength);
            exchange(min_vect_idx, item.min_vect_idx);
            K_inv.swap(item.K_inv);
            K.swap(item.K);
            exchange(my_max_dictionary_size, item.my_max_dictionary_size);
            exchange(min_tolerance, item.min_tolerance);

            // non-state temp members
            a.swap(item.a);
            k.swap(item.k);
            a2.swap(item.a2);
            k2.swap(item.k2);
            temp.swap(item.temp);
        }

        unsigned long dictionary_size (
        ) const { return dictionary.size(); }

        const matrix<sample_type,0,1,mem_manager_type> get_dictionary (
        ) const
        { 
            return vector_to_matrix(dictionary);
        }

        friend void serialize(const linearly_independent_subset_finder& item, std::ostream& out)
        {
            serialize(item.kernel, out);
            serialize(item.dictionary, out);
            serialize(item.min_strength, out);
            serialize(item.min_vect_idx, out);
            serialize(item.K_inv, out);
            serialize(item.K, out);
            serialize(item.my_max_dictionary_size, out);
            serialize(item.min_tolerance, out);
        }

        friend void deserialize(linearly_independent_subset_finder& item, std::istream& in)
        {
            deserialize(item.kernel, in);
            deserialize(item.dictionary, in);
            deserialize(item.min_strength, in);
            deserialize(item.min_vect_idx, in);
            deserialize(item.K_inv, in);
            deserialize(item.K, in);
            deserialize(item.my_max_dictionary_size, in);
            deserialize(item.min_tolerance, in);
        }

        const sample_type& operator[] (
            unsigned long index
        ) const
        {
            return dictionary[index];
        }

    private:

        typedef std_allocator<sample_type, mem_manager_type> alloc_sample_type;
        typedef std_allocator<scalar_type, mem_manager_type> alloc_scalar_type;
        typedef std::vector<sample_type,alloc_sample_type> dictionary_vector_type;
        typedef std::vector<scalar_type,alloc_scalar_type> scalar_vector_type;

        void recompute_min_strength (
        )
        /*!
            ensures
                - recomputes the min_strength and min_vect_idx values
                  so that they are correct with respect to the CONVENTION
        !*/
        {
            min_strength = std::numeric_limits<scalar_type>::max();

            // here we loop over each dictionary vector and compute what its delta would be if
            // we were to remove it from the dictionary and then try to add it back in.
            for (unsigned long i = 0; i < dictionary.size(); ++i)
            {
                // compute a2 = K_inv*k but where dictionary vector i has been removed
                a2 = (removerc(K_inv,i,i) - remove_row(colm(K_inv,i)/K_inv(i,i),i)*remove_col(rowm(K_inv,i),i)) *
                    (remove_row(colm(K,i),i));
                scalar_type delta = K(i,i) - trans(remove_row(colm(K,i),i))*a2;

                if (delta < min_strength)
                {
                    min_strength = delta;
                    min_vect_idx = i;
                }
            }
        }


        kernel_type kernel;
        dictionary_vector_type dictionary;
        scalar_type min_strength;
        unsigned long min_vect_idx;

        matrix<scalar_type,0,0,mem_manager_type> K_inv;
        matrix<scalar_type,0,0,mem_manager_type> K;

        unsigned long my_max_dictionary_size;
        scalar_type min_tolerance;

        // temp variables here just so we don't have to reconstruct them over and over.  Thus, 
        // they aren't really part of the state of this object.
        matrix<scalar_type,0,1,mem_manager_type> a, a2;
        matrix<scalar_type,0,1,mem_manager_type> k, k2;
        matrix<scalar_type,0,0,mem_manager_type> temp;

    };

// ----------------------------------------------------------------------------------------

    template <typename kernel_type>
    void swap(linearly_independent_subset_finder<kernel_type>& a, linearly_independent_subset_finder<kernel_type>& b)
    { a.swap(b); }

// ----------------------------------------------------------------------------------------

}

#endif // DLIB_LISf__

