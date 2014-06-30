// Copyright (C) 2008  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#ifndef DLIB_KRLs_
#define DLIB_KRLs_

#include <vector>

#include "krls_abstract.h"
#include "../matrix.h"
#include "function.h"
#include "../std_allocator.h"

namespace dlib
{

// ----------------------------------------------------------------------------------------

    template <typename kernel_type>
    class krls
    {
        /*!
            This is an implementation of the kernel recursive least squares algorithm described in the paper:
            The Kernel Recursive Least Squares Algorithm by Yaakov Engel.
        !*/

    public:
        typedef typename kernel_type::scalar_type scalar_type;
        typedef typename kernel_type::sample_type sample_type;
        typedef typename kernel_type::mem_manager_type mem_manager_type;


        explicit krls (
            const kernel_type& kernel_, 
            scalar_type tolerance_ = 0.001,
            unsigned long max_dictionary_size_ = 1000000
        ) : 
            kernel(kernel_), 
            my_tolerance(tolerance_),
            my_max_dictionary_size(max_dictionary_size_)
        {
            // make sure requires clause is not broken
            DLIB_ASSERT(tolerance_ >= 0,
                "\tkrls::krls()"
                << "\n\t You have to give a positive tolerance"
                << "\n\t this: " << this
                << "\n\t tolerance: " << tolerance_ 
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

        const kernel_type& get_kernel (
        ) const
        {
            return kernel;
        }

        void clear_dictionary ()
        {
            dictionary.clear();
            alpha.clear();

            K_inv.set_size(0,0);
            K.set_size(0,0);
            P.set_size(0,0);
        }

        scalar_type operator() (
            const sample_type& x
        ) const
        {
            scalar_type temp = 0;
            for (unsigned long i = 0; i < alpha.size(); ++i)
                temp += alpha[i]*kern(dictionary[i], x);

            return temp;
        }

        void train (
            const sample_type& x,
            scalar_type y
        )
        {
            const scalar_type kx = kern(x,x);
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

                    alpha.push_back(y/kx);
                    dictionary.push_back(x);
                    P.set_size(1,1);
                    P(0,0) = 1;
                }
            }
            else
            {
                // fill in k
                k.set_size(alpha.size());
                for (long r = 0; r < k.nr(); ++r)
                    k(r) = kern(x,dictionary[r]);

                // compute the error we would have if we approximated the new x sample
                // with the dictionary.  That is, do the ALD test from the KRLS paper.
                a = K_inv*k;
                scalar_type delta = kx - trans(k)*a;

                // if this new vector isn't approximately linearly dependent on the vectors
                // in our dictionary.
                if (delta > my_tolerance)
                {
                    if (dictionary.size() >= my_max_dictionary_size)
                    {
                        // We need to remove one of the old members of the dictionary before
                        // we proceed with adding a new one.  So remove the oldest one. 
                        remove_dictionary_vector(0);

                        // recompute these guys since they were computed with the old
                        // kernel matrix
                        k = remove_row(k,0);
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




                    // Now update the P matrix (equation 3.15)
                    temp.set_size(P.nr()+1, P.nc()+1);
                    set_subm(temp, get_rect(P)) = P;
                    // initialize the new sides of P 
                    set_rowm(temp,P.nr()) = 0;
                    set_colm(temp,P.nr()) = 0;
                    temp(P.nr(), P.nc()) = 1;
                    temp.swap(P);

                    // now update the alpha vector (equation 3.16)
                    const scalar_type k_a = (y-trans(k)*vector_to_matrix(alpha))/delta;
                    for (unsigned long i = 0; i < alpha.size(); ++i)
                    {
                        alpha[i] -= a(i)*k_a;
                    }
                    alpha.push_back(k_a);
                }
                else
                {
                    q = P*a/(1+trans(a)*P*a);

                    // update P (equation 3.12)
                    temp_matrix = trans(a)*P;
                    P -= q*temp_matrix;

                    // update the alpha vector (equation 3.13)
                    const scalar_type k_a = y-trans(k)*vector_to_matrix(alpha);
                    for (unsigned long i = 0; i < alpha.size(); ++i)
                    {
                        alpha[i] += (K_inv*q*k_a)(i);
                    }
                }
            }
        }

        void swap (
            krls& item
        )
        {
            exchange(kernel, item.kernel);
            dictionary.swap(item.dictionary);
            alpha.swap(item.alpha);
            K_inv.swap(item.K_inv);
            K.swap(item.K);
            P.swap(item.P);
            exchange(my_tolerance, item.my_tolerance);
            q.swap(item.q);
            a.swap(item.a);
            k.swap(item.k);
            temp_matrix.swap(item.temp_matrix);
            exchange(my_max_dictionary_size, item.my_max_dictionary_size);
        }

        unsigned long dictionary_size (
        ) const { return dictionary.size(); }

        decision_function<kernel_type> get_decision_function (
        ) const
        {
            return decision_function<kernel_type>(
                vector_to_matrix(alpha),
                -sum(vector_to_matrix(alpha))*tau, 
                kernel,
                vector_to_matrix(dictionary)
            );
        }

        friend void serialize(const krls& item, std::ostream& out)
        {
            serialize(item.kernel, out);
            serialize(item.dictionary, out);
            serialize(item.alpha, out);
            serialize(item.K_inv, out);
            serialize(item.K, out);
            serialize(item.P, out);
            serialize(item.my_tolerance, out);
            serialize(item.my_max_dictionary_size, out);
        }

        friend void deserialize(krls& item, std::istream& in)
        {
            deserialize(item.kernel, in);
            deserialize(item.dictionary, in);
            deserialize(item.alpha, in);
            deserialize(item.K_inv, in);
            deserialize(item.K, in);
            deserialize(item.P, in);
            deserialize(item.my_tolerance, in);
            deserialize(item.my_max_dictionary_size, in);
        }

    private:

        inline scalar_type kern (const sample_type& m1, const sample_type& m2) const
        { 
            return kernel(m1,m2) + tau;
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

            // update the P matrix as well
            P = removerc(P,i,i);

            // update the K matrix as well
            K = removerc(K,i,i);
        }


        kernel_type kernel;

        typedef std_allocator<sample_type, mem_manager_type> alloc_sample_type;
        typedef std_allocator<scalar_type, mem_manager_type> alloc_scalar_type;
        typedef std::vector<sample_type,alloc_sample_type> dictionary_vector_type;
        typedef std::vector<scalar_type,alloc_scalar_type> alpha_vector_type;

        dictionary_vector_type dictionary;
        alpha_vector_type alpha;

        matrix<scalar_type,0,0,mem_manager_type> K_inv;
        matrix<scalar_type,0,0,mem_manager_type> K;
        matrix<scalar_type,0,0,mem_manager_type> P;

        scalar_type my_tolerance;
        unsigned long my_max_dictionary_size;


        // temp variables here just so we don't have to reconstruct them over and over.  Thus, 
        // they aren't really part of the state of this object.
        matrix<scalar_type,0,1,mem_manager_type> q;
        matrix<scalar_type,0,1,mem_manager_type> a;
        matrix<scalar_type,0,1,mem_manager_type> k;
        matrix<scalar_type,1,0,mem_manager_type> temp_matrix;

        const static scalar_type tau;

    };

    template <typename kernel_type>
    const typename kernel_type::scalar_type krls<kernel_type>::tau = static_cast<typename kernel_type::scalar_type>(0.01);

// ----------------------------------------------------------------------------------------

    template <typename kernel_type>
    void swap(krls<kernel_type>& a, krls<kernel_type>& b)
    { a.swap(b); }

// ----------------------------------------------------------------------------------------

}

#endif // DLIB_KRLs_

