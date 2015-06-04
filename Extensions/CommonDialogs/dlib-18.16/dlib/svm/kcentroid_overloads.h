// Copyright (C) 2009  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#ifndef DLIB_KCENTROId_OVERLOADS_
#define DLIB_KCENTROId_OVERLOADS_

#include "kcentroid_abstract.h"
#include "sparse_kernel.h"
#include "sparse_vector.h"
#include <map>

namespace dlib
{
    /*
        This file contains optimized overloads of the kcentroid object for the following
        linear cases:
            kcentroid<linear_kernel<T>>
            kcentroid<sparse_linear_kernel<T>>
            kcentroid<offset_kernel<linear_kernel<T>>>
            kcentroid<offset_kernel<sparse_linear_kernel<T>>>
    */

// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------
//                     Overloads for when kernel_type == linear_kernel
// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------

    template <typename T>
    class kcentroid<linear_kernel<T> >
    {
        
        
        typedef linear_kernel<T> kernel_type;
    public:
        typedef typename kernel_type::scalar_type scalar_type;
        typedef typename kernel_type::sample_type sample_type;
        typedef typename kernel_type::mem_manager_type mem_manager_type;


        explicit kcentroid (
            const kernel_type& kernel_, 
            scalar_type tolerance_ = 0.001,
            unsigned long max_dictionary_size_ = 1000000,
            bool remove_oldest_first_ = false 
        ) : 
            my_remove_oldest_first(remove_oldest_first_),
            kernel(kernel_), 
            my_tolerance(tolerance_),
            my_max_dictionary_size(max_dictionary_size_)
        {
            // make sure requires clause is not broken
            DLIB_ASSERT(tolerance_ >= 0 && max_dictionary_size_ > 0,
                "\tkcentroid::kcentroid()"
                << "\n\t You have to give a positive tolerance"
                << "\n\t this:                 " << this
                << "\n\t tolerance_:           " << tolerance_ 
                << "\n\t max_dictionary_size_: " << max_dictionary_size_ 
                );

            clear_dictionary();
        }

        scalar_type     tolerance() const               { return my_tolerance; }
        unsigned long   max_dictionary_size() const     { return my_max_dictionary_size; }
        bool            remove_oldest_first () const    { return my_remove_oldest_first; }
        const kernel_type& get_kernel () const          { return kernel; }
        scalar_type     samples_trained () const        { return samples_seen; }

        void clear_dictionary ()
        {
            samples_seen = 0;
            set_all_elements(w, 0);
            alpha = 0;
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

            if (w.size() > 0)
            {
                if (x.w.size() > 0)
                    return length(alpha*w - x.alpha*x.w);
                else
                    return alpha*length(w);
            }
            else
            {
                if (x.w.size() > 0)
                    return x.alpha*length(x.w);
                else
                    return 0;
            }
        }

        scalar_type inner_product (
            const sample_type& x
        ) const
        {
            if (w.size() > 0)
                return alpha*trans(w)*x;
            else 
                return 0;
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

            if (w.size() > 0 && x.w.size() > 0)
                return alpha*x.alpha*trans(w)*x.w;
            else
                return 0;
        }

        scalar_type squared_norm (
        ) const
        {
            if (w.size() > 0)
                return alpha*alpha*trans(w)*w;
            else
                return 0;
        }

        scalar_type operator() (
            const sample_type& x
        ) const
        {
            if (w.size() > 0)
                return length(x-alpha*w);
            else
                return length(x);
        }

        scalar_type test_and_train (
            const sample_type& x
        )
        {
            ++samples_seen;
            const scalar_type xscale = 1/samples_seen;
            const scalar_type cscale = 1-xscale;

            do_train(x, cscale, xscale);

            return (*this)(x);
        }

        void train (
            const sample_type& x
        )
        {
            ++samples_seen;
            const scalar_type xscale = 1/samples_seen;
            const scalar_type cscale = 1-xscale;

            do_train(x, cscale, xscale);
        }

        scalar_type test_and_train (
            const sample_type& x,
            scalar_type cscale,
            scalar_type xscale
        )
        {
            ++samples_seen;

            do_train(x, cscale, xscale);

            return (*this)(x);
        }

        void scale_by (
            scalar_type cscale
        )
        {
            alpha *= cscale;
        }

        void train (
            const sample_type& x,
            scalar_type cscale,
            scalar_type xscale
        )
        {
            ++samples_seen;
            do_train(x, cscale, xscale);
        }

        void swap (
            kcentroid& item
        )
        {
            exchange(my_remove_oldest_first, item.my_remove_oldest_first);
            exchange(kernel, item.kernel);
            exchange(w, item.w);
            exchange(alpha, item.alpha);
            exchange(my_tolerance, item.my_tolerance);
            exchange(my_max_dictionary_size, item.my_max_dictionary_size);
            exchange(samples_seen, item.samples_seen);
        }

        unsigned long dictionary_size (
        ) const 
        { 
            if (samples_seen > 0)
                return 1;
            else
                return 0;
        }

        friend void serialize(const kcentroid& item, std::ostream& out)
        {
            serialize(item.my_remove_oldest_first, out);
            serialize(item.kernel, out);
            serialize(item.w, out);
            serialize(item.alpha, out);
            serialize(item.my_tolerance, out);
            serialize(item.my_max_dictionary_size, out);
            serialize(item.samples_seen, out);
        }

        friend void deserialize(kcentroid& item, std::istream& in)
        {
            deserialize(item.my_remove_oldest_first, in);
            deserialize(item.kernel, in);
            deserialize(item.w, in);
            deserialize(item.alpha, in);
            deserialize(item.my_tolerance, in);
            deserialize(item.my_max_dictionary_size, in);
            deserialize(item.samples_seen, in);
        }

        distance_function<kernel_type> get_distance_function (
        ) const
        {
            if (samples_seen > 0)
            {
                typename distance_function<kernel_type>::sample_vector_type temp_basis_vectors; 
                typename distance_function<kernel_type>::scalar_vector_type temp_alpha; 

                temp_basis_vectors.set_size(1);
                temp_basis_vectors(0) = w;
                temp_alpha.set_size(1);
                temp_alpha(0) = alpha;

                return distance_function<kernel_type>(temp_alpha, squared_norm(), kernel, temp_basis_vectors);
            }
            else
            {
                return distance_function<kernel_type>(kernel);
            }
        }

    private:

        void do_train (
            const sample_type& x,
            scalar_type cscale,
            scalar_type xscale
        )
        {
            set_size_of_w(x);

            const scalar_type temp = cscale*alpha;

            if (temp != 0)
            {
                w = w + xscale*x/temp;
                alpha = temp;
            }
            else
            {
                w = cscale*alpha*w + xscale*x;
                alpha = 1;
            }
        }

        void set_size_of_w (
            const sample_type& x
        )
        {
            if (x.size() != w.size())
            {
                w.set_size(x.nr(), x.nc());
                set_all_elements(w, 0);
                alpha = 0;
            }
        }

        bool my_remove_oldest_first;

        kernel_type kernel;

        sample_type w;
        scalar_type alpha;


        scalar_type my_tolerance;
        unsigned long my_max_dictionary_size;
        scalar_type samples_seen;

    };

// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------
//               Overloads for when kernel_type == offset_kernel<linear_kernel>
// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------

    template <typename T>
    class kcentroid<offset_kernel<linear_kernel<T> > >
    {
        
        /*!
            INITIAL VALUE
                - x_extra == sqrt(kernel.offset)

            CONVENTION
                - x_extra == sqrt(kernel.offset)
                - w_extra == the value of the extra dimension tacked onto the
                  end of the w vector
        !*/
        
        typedef offset_kernel<linear_kernel<T> > kernel_type;
    public:
        typedef typename kernel_type::scalar_type scalar_type;
        typedef typename kernel_type::sample_type sample_type;
        typedef typename kernel_type::mem_manager_type mem_manager_type;


        explicit kcentroid (
            const kernel_type& kernel_, 
            scalar_type tolerance_ = 0.001,
            unsigned long max_dictionary_size_ = 1000000,
            bool remove_oldest_first_ = false 
        ) : 
            my_remove_oldest_first(remove_oldest_first_),
            kernel(kernel_), 
            my_tolerance(tolerance_),
            my_max_dictionary_size(max_dictionary_size_)
        {
            // make sure requires clause is not broken
            DLIB_ASSERT(tolerance_ >= 0 && max_dictionary_size_ > 0,
                "\tkcentroid::kcentroid()"
                << "\n\t You have to give a positive tolerance"
                << "\n\t this:                 " << this
                << "\n\t tolerance_:           " << tolerance_ 
                << "\n\t max_dictionary_size_: " << max_dictionary_size_ 
                );

            x_extra = std::sqrt(kernel.offset);

            clear_dictionary();
        }

        scalar_type     tolerance() const               { return my_tolerance; }
        unsigned long   max_dictionary_size() const     { return my_max_dictionary_size; }
        bool            remove_oldest_first () const    { return my_remove_oldest_first; }
        const kernel_type& get_kernel () const          { return kernel; }
        scalar_type     samples_trained () const        { return samples_seen; }

        void clear_dictionary ()
        {
            samples_seen = 0;
            set_all_elements(w, 0);
            alpha = 0;
            w_extra = x_extra;
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

            if (w.size() > 0)
            {
                if (x.w.size() > 0)
                {
                    scalar_type temp1 = length_squared(alpha*w - x.alpha*x.w);
                    scalar_type temp2 = alpha*w_extra - x.alpha*x.w_extra;
                    return std::sqrt(temp1 + temp2*temp2);
                }
                else
                {
                    return alpha*std::sqrt(length_squared(w) + w_extra*w_extra);
                }
            }
            else
            {
                if (x.w.size() > 0)
                    return x.alpha*std::sqrt(length_squared(x.w) + x.w_extra*x.w_extra);
                else
                    return 0;
            }
        }

        scalar_type inner_product (
            const sample_type& x
        ) const
        {
            if (w.size() > 0)
                return alpha*(trans(w)*x + w_extra*x_extra);
            else 
                return 0;
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

            if (w.size() > 0 && x.w.size() > 0)
                return alpha*x.alpha*(trans(w)*x.w + w_extra*x.w_extra);
            else
                return 0;
        }

        scalar_type squared_norm (
        ) const
        {
            if (w.size() > 0)
                return alpha*alpha*(trans(w)*w + w_extra*w_extra);
            else
                return 0;
        }

        scalar_type operator() (
            const sample_type& x
        ) const
        {
            if (w.size() > 0)
            {
                scalar_type temp1 = length_squared(x-alpha*w);
                scalar_type temp2 = x_extra - alpha*w_extra;
                return std::sqrt(temp1 + temp2*temp2);
            }
            else
            {
                return std::sqrt(length_squared(x) + x_extra*x_extra);
            }
        }

        scalar_type test_and_train (
            const sample_type& x
        )
        {
            ++samples_seen;
            const scalar_type xscale = 1/samples_seen;
            const scalar_type cscale = 1-xscale;

            do_train(x, cscale, xscale);

            return (*this)(x);
        }

        void train (
            const sample_type& x
        )
        {
            ++samples_seen;
            const scalar_type xscale = 1/samples_seen;
            const scalar_type cscale = 1-xscale;

            do_train(x, cscale, xscale);
        }

        scalar_type test_and_train (
            const sample_type& x,
            scalar_type cscale,
            scalar_type xscale
        )
        {
            ++samples_seen;

            do_train(x, cscale, xscale);

            return (*this)(x);
        }

        void scale_by (
            scalar_type cscale
        )
        {
            alpha *= cscale;
            w_extra *= cscale;
        }

        void train (
            const sample_type& x,
            scalar_type cscale,
            scalar_type xscale
        )
        {
            ++samples_seen;
            do_train(x, cscale, xscale);
        }

        void swap (
            kcentroid& item
        )
        {
            exchange(my_remove_oldest_first, item.my_remove_oldest_first);
            exchange(kernel, item.kernel);
            exchange(w, item.w);
            exchange(alpha, item.alpha);
            exchange(w_extra, item.w_extra);
            exchange(x_extra, item.x_extra);
            exchange(my_tolerance, item.my_tolerance);
            exchange(my_max_dictionary_size, item.my_max_dictionary_size);
            exchange(samples_seen, item.samples_seen);
        }

        unsigned long dictionary_size (
        ) const 
        { 
            if (samples_seen > 0)
            {
                if (std::abs(w_extra) > std::numeric_limits<scalar_type>::epsilon())
                    return 1;
                else
                    return 2;
            }
            else
                return 0;
        }

        friend void serialize(const kcentroid& item, std::ostream& out)
        {
            serialize(item.my_remove_oldest_first, out);
            serialize(item.kernel, out);
            serialize(item.w, out);
            serialize(item.alpha, out);
            serialize(item.w_extra, out);
            serialize(item.x_extra, out);
            serialize(item.my_tolerance, out);
            serialize(item.my_max_dictionary_size, out);
            serialize(item.samples_seen, out);
        }

        friend void deserialize(kcentroid& item, std::istream& in)
        {
            deserialize(item.my_remove_oldest_first, in);
            deserialize(item.kernel, in);
            deserialize(item.w, in);
            deserialize(item.alpha, in);
            deserialize(item.w_extra, in);
            deserialize(item.x_extra, in);
            deserialize(item.my_tolerance, in);
            deserialize(item.my_max_dictionary_size, in);
            deserialize(item.samples_seen, in);
        }

        distance_function<kernel_type> get_distance_function (
        ) const
        {

            if (samples_seen > 0)
            {
                typename distance_function<kernel_type>::sample_vector_type temp_basis_vectors; 
                typename distance_function<kernel_type>::scalar_vector_type temp_alpha; 

                // What we are doing here needs a bit of explanation.  The w vector
                // has an implicit extra dimension tacked on to it with the value of w_extra.
                // The kernel we are using takes normal vectors and implicitly tacks the value
                // x_extra onto their end.  So what we are doing here is scaling w so that
                // the value it should have tacked onto it is x_scale.  Note that we also
                // adjust alpha so that the combination of alpha*w stays the same.
                scalar_type scale;

                // if w_extra is basically greater than 0
                if (std::abs(w_extra) > std::numeric_limits<scalar_type>::epsilon())
                {
                    scale = (x_extra/w_extra);
                    temp_basis_vectors.set_size(1);
                    temp_alpha.set_size(1);
                    temp_basis_vectors(0) = w*scale;
                    temp_alpha(0) = alpha/scale;
                }
                else
                {
                    // In this case w_extra is zero. So the only way we can get the same
                    // thing in the output basis vector set is by using two vectors
                    temp_basis_vectors.set_size(2);
                    temp_alpha.set_size(2);
                    temp_basis_vectors(0) = 2*w;
                    temp_alpha(0) = alpha;
                    temp_basis_vectors(1) = w;
                    temp_alpha(1) = -alpha;
                }


                return distance_function<kernel_type>(temp_alpha, squared_norm(), kernel, temp_basis_vectors);
            }
            else
            {
                return distance_function<kernel_type>(kernel);
            }
        }

    private:

        void do_train (
            const sample_type& x,
            scalar_type cscale,
            scalar_type xscale
        )
        {
            set_size_of_w(x);

            const scalar_type temp = cscale*alpha;

            if (temp != 0)
            {
                w = w + xscale*x/temp;
                w_extra = w_extra + xscale*x_extra/temp;
                alpha = temp;
            }
            else
            {
                w = cscale*alpha*w + xscale*x;
                w_extra = cscale*alpha*w_extra + xscale*x_extra;
                alpha = 1;
            }
        }

        void set_size_of_w (
            const sample_type& x
        )
        {
            if (x.size() != w.size())
            {
                w.set_size(x.nr(), x.nc());
                set_all_elements(w, 0);
                alpha = 0;
                w_extra = x_extra;
            }
        }

        bool my_remove_oldest_first;

        kernel_type kernel;

        sample_type w;
        scalar_type alpha;

        scalar_type w_extra;
        scalar_type x_extra;


        scalar_type my_tolerance;
        unsigned long my_max_dictionary_size;
        scalar_type samples_seen;

    };

// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------
//                     Overloads for when kernel_type == sparse_linear_kernel
// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------

    template <typename T>
    class kcentroid<sparse_linear_kernel<T> >
    {
        
        
        typedef sparse_linear_kernel<T> kernel_type;
    public:
        typedef typename kernel_type::scalar_type scalar_type;
        typedef typename kernel_type::sample_type sample_type;
        typedef typename kernel_type::mem_manager_type mem_manager_type;


        explicit kcentroid (
            const kernel_type& kernel_, 
            scalar_type tolerance_ = 0.001,
            unsigned long max_dictionary_size_ = 1000000,
            bool remove_oldest_first_ = false 
        ) : 
            my_remove_oldest_first(remove_oldest_first_),
            kernel(kernel_), 
            my_tolerance(tolerance_),
            my_max_dictionary_size(max_dictionary_size_)
        {
            // make sure requires clause is not broken
            DLIB_ASSERT(tolerance_ >= 0 && max_dictionary_size_ > 0,
                "\tkcentroid::kcentroid()"
                << "\n\t You have to give a positive tolerance"
                << "\n\t this:                 " << this
                << "\n\t tolerance_:           " << tolerance_ 
                << "\n\t max_dictionary_size_: " << max_dictionary_size_ 
                );

            clear_dictionary();
        }

        scalar_type     tolerance() const               { return my_tolerance; }
        unsigned long   max_dictionary_size() const     { return my_max_dictionary_size; }
        bool            remove_oldest_first () const    { return my_remove_oldest_first; }
        const kernel_type& get_kernel () const          { return kernel; }
        scalar_type     samples_trained () const        { return samples_seen; }

        void clear_dictionary ()
        {
            samples_seen = 0;
            w.clear();
            alpha = 0;
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

            return distance(alpha,w , x.alpha,x.w);
        }

        scalar_type inner_product (
            const sample_type& x
        ) const
        {
            return alpha*dot(w,x);
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

            return alpha*x.alpha*dot(w,x.w);
        }

        scalar_type squared_norm (
        ) const
        {
            return alpha*alpha*length_squared(w);
        }

        scalar_type operator() (
            const sample_type& x
        ) const
        {
            return distance(static_cast<scalar_type>(1), x, alpha, w);
        }

        scalar_type test_and_train (
            const sample_type& x
        )
        {
            ++samples_seen;
            const scalar_type xscale = 1/samples_seen;
            const scalar_type cscale = 1-xscale;

            do_train(x, cscale, xscale);

            return (*this)(x);
        }

        void train (
            const sample_type& x
        )
        {
            ++samples_seen;
            const scalar_type xscale = 1/samples_seen;
            const scalar_type cscale = 1-xscale;

            do_train(x, cscale, xscale);
        }

        scalar_type test_and_train (
            const sample_type& x,
            scalar_type cscale,
            scalar_type xscale
        )
        {
            ++samples_seen;

            do_train(x, cscale, xscale);

            return (*this)(x);
        }

        void scale_by (
            scalar_type cscale
        )
        {
            alpha *= cscale;
        }

        void train (
            const sample_type& x,
            scalar_type cscale,
            scalar_type xscale
        )
        {
            ++samples_seen;
            do_train(x, cscale, xscale);
        }

        void swap (
            kcentroid& item
        )
        {
            exchange(my_remove_oldest_first, item.my_remove_oldest_first);
            exchange(kernel, item.kernel);
            exchange(w, item.w);
            exchange(alpha, item.alpha);
            exchange(my_tolerance, item.my_tolerance);
            exchange(my_max_dictionary_size, item.my_max_dictionary_size);
            exchange(samples_seen, item.samples_seen);
        }

        unsigned long dictionary_size (
        ) const 
        { 
            if (samples_seen > 0)
                return 1;
            else
                return 0;
        }

        friend void serialize(const kcentroid& item, std::ostream& out)
        {
            serialize(item.my_remove_oldest_first, out);
            serialize(item.kernel, out);
            serialize(item.w, out);
            serialize(item.alpha, out);
            serialize(item.my_tolerance, out);
            serialize(item.my_max_dictionary_size, out);
            serialize(item.samples_seen, out);
        }

        friend void deserialize(kcentroid& item, std::istream& in)
        {
            deserialize(item.my_remove_oldest_first, in);
            deserialize(item.kernel, in);
            deserialize(item.w, in);
            deserialize(item.alpha, in);
            deserialize(item.my_tolerance, in);
            deserialize(item.my_max_dictionary_size, in);
            deserialize(item.samples_seen, in);
        }

        distance_function<kernel_type> get_distance_function (
        ) const
        {
            if (samples_seen > 0)
            {
                typename distance_function<kernel_type>::sample_vector_type temp_basis_vectors; 
                typename distance_function<kernel_type>::scalar_vector_type temp_alpha; 

                temp_basis_vectors.set_size(1);
                temp_basis_vectors(0) = sample_type(w.begin(), w.end());
                temp_alpha.set_size(1);
                temp_alpha(0) = alpha;

                return distance_function<kernel_type>(temp_alpha, squared_norm(), kernel, temp_basis_vectors);
            }
            else
            {
                return distance_function<kernel_type>(kernel);
            }
        }

    private:

        void do_train (
            const sample_type& x,
            scalar_type cscale,
            scalar_type xscale
        )
        {
            const scalar_type temp = cscale*alpha;

            if (temp != 0)
            {
                // compute w += xscale*x/temp
                typename sample_type::const_iterator i;
                for (i = x.begin(); i != x.end(); ++i)
                {
                    w[i->first] += xscale*(i->second)/temp;
                }

                alpha = temp;
            }
            else
            {
                // first compute w = cscale*alpha*w
                for (typename std::map<unsigned long,scalar_type>::iterator i = w.begin(); i != w.end(); ++i)
                {
                    i->second *= cscale*alpha;
                }

                // now compute w += xscale*x
                for (typename sample_type::const_iterator i = x.begin(); i != x.end(); ++i)
                {
                    w[i->first] += xscale*(i->second);
                }

                alpha = 1;
            }
        }

        bool my_remove_oldest_first;

        kernel_type kernel;

        std::map<unsigned long,scalar_type> w;
        scalar_type alpha;


        scalar_type my_tolerance;
        unsigned long my_max_dictionary_size;
        scalar_type samples_seen;

    };

// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------
//               Overloads for when kernel_type == offset_kernel<sparse_linear_kernel>
// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------

    template <typename T>
    class kcentroid<offset_kernel<sparse_linear_kernel<T> > >
    {
        
        /*!
            INITIAL VALUE
                - x_extra == sqrt(kernel.offset)

            CONVENTION
                - x_extra == sqrt(kernel.offset)
                - w_extra == the value of the extra dimension tacked onto the
                  end of the w vector
        !*/
        
        typedef offset_kernel<sparse_linear_kernel<T> > kernel_type;
    public:
        typedef typename kernel_type::scalar_type scalar_type;
        typedef typename kernel_type::sample_type sample_type;
        typedef typename kernel_type::mem_manager_type mem_manager_type;


        explicit kcentroid (
            const kernel_type& kernel_, 
            scalar_type tolerance_ = 0.001,
            unsigned long max_dictionary_size_ = 1000000,
            bool remove_oldest_first_ = false 
        ) : 
            my_remove_oldest_first(remove_oldest_first_),
            kernel(kernel_), 
            my_tolerance(tolerance_),
            my_max_dictionary_size(max_dictionary_size_)
        {
            // make sure requires clause is not broken
            DLIB_ASSERT(tolerance_ >= 0 && max_dictionary_size_ > 0,
                "\tkcentroid::kcentroid()"
                << "\n\t You have to give a positive tolerance"
                << "\n\t this:                 " << this
                << "\n\t tolerance_:           " << tolerance_ 
                << "\n\t max_dictionary_size_: " << max_dictionary_size_ 
                );

            x_extra = std::sqrt(kernel.offset);

            clear_dictionary();
        }

        scalar_type     tolerance() const               { return my_tolerance; }
        unsigned long   max_dictionary_size() const     { return my_max_dictionary_size; }
        bool            remove_oldest_first () const    { return my_remove_oldest_first; }
        const kernel_type& get_kernel () const          { return kernel; }
        scalar_type     samples_trained () const        { return samples_seen; }

        void clear_dictionary ()
        {
            samples_seen = 0;
            w.clear();
            alpha = 0;
            w_extra = x_extra;
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

            if (samples_seen > 0)
            {
                scalar_type temp1 = distance_squared(alpha,w , x.alpha,x.w);
                scalar_type temp2 = alpha*w_extra - x.alpha*x.w_extra;
                return std::sqrt(temp1 + temp2*temp2);
            }
            else
            {
                return 0;
            }
        }

        scalar_type inner_product (
            const sample_type& x
        ) const
        {
            if (samples_seen > 0)
                return alpha*(dot(w,x) + w_extra*x_extra);
            else 
                return 0;
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

            if (samples_seen > 0 && x.samples_seen > 0)
                return alpha*x.alpha*(dot(w,x.w) + w_extra*x.w_extra);
            else
                return 0;
        }

        scalar_type squared_norm (
        ) const
        {
            if (samples_seen > 0)
                return alpha*alpha*(length_squared(w) + w_extra*w_extra);
            else
                return 0;
        }

        scalar_type operator() (
            const sample_type& x
        ) const
        {
            if (samples_seen > 0)
            {
                scalar_type temp1 = distance_squared(1,x,alpha,w);
                scalar_type temp2 = x_extra - alpha*w_extra;
                return std::sqrt(temp1 + temp2*temp2);
            }
            else
            {
                return std::sqrt(length_squared(x) + x_extra*x_extra);
            }
        }

        scalar_type test_and_train (
            const sample_type& x
        )
        {
            ++samples_seen;
            const scalar_type xscale = 1/samples_seen;
            const scalar_type cscale = 1-xscale;

            do_train(x, cscale, xscale);

            return (*this)(x);
        }

        void train (
            const sample_type& x
        )
        {
            ++samples_seen;
            const scalar_type xscale = 1/samples_seen;
            const scalar_type cscale = 1-xscale;

            do_train(x, cscale, xscale);
        }

        scalar_type test_and_train (
            const sample_type& x,
            scalar_type cscale,
            scalar_type xscale
        )
        {
            ++samples_seen;

            do_train(x, cscale, xscale);

            return (*this)(x);
        }

        void scale_by (
            scalar_type cscale
        )
        {
            alpha *= cscale;
            w_extra *= cscale;
        }

        void train (
            const sample_type& x,
            scalar_type cscale,
            scalar_type xscale
        )
        {
            ++samples_seen;
            do_train(x, cscale, xscale);
        }

        void swap (
            kcentroid& item
        )
        {
            exchange(my_remove_oldest_first, item.my_remove_oldest_first);
            exchange(kernel, item.kernel);
            exchange(w, item.w);
            exchange(alpha, item.alpha);
            exchange(w_extra, item.w_extra);
            exchange(x_extra, item.x_extra);
            exchange(my_tolerance, item.my_tolerance);
            exchange(my_max_dictionary_size, item.my_max_dictionary_size);
            exchange(samples_seen, item.samples_seen);
        }

        unsigned long dictionary_size (
        ) const 
        { 
            if (samples_seen > 0)
            {
                if (std::abs(w_extra) > std::numeric_limits<scalar_type>::epsilon())
                    return 1;
                else
                    return 2;
            }
            else
            {
                return 0;
            }
        }

        friend void serialize(const kcentroid& item, std::ostream& out)
        {
            serialize(item.my_remove_oldest_first, out);
            serialize(item.kernel, out);
            serialize(item.w, out);
            serialize(item.alpha, out);
            serialize(item.w_extra, out);
            serialize(item.x_extra, out);
            serialize(item.my_tolerance, out);
            serialize(item.my_max_dictionary_size, out);
            serialize(item.samples_seen, out);
        }

        friend void deserialize(kcentroid& item, std::istream& in)
        {
            deserialize(item.my_remove_oldest_first, in);
            deserialize(item.kernel, in);
            deserialize(item.w, in);
            deserialize(item.alpha, in);
            deserialize(item.w_extra, in);
            deserialize(item.x_extra, in);
            deserialize(item.my_tolerance, in);
            deserialize(item.my_max_dictionary_size, in);
            deserialize(item.samples_seen, in);
        }

        distance_function<kernel_type> get_distance_function (
        ) const
        {
            if (samples_seen > 0)
            {
                typename distance_function<kernel_type>::sample_vector_type temp_basis_vectors; 
                typename distance_function<kernel_type>::scalar_vector_type temp_alpha; 

                // What we are doing here needs a bit of explanation.  The w vector
                // has an implicit extra dimension tacked on to it with the value of w_extra.
                // The kernel we are using takes normal vectors and implicitly tacks the value
                // x_extra onto their end.  So what we are doing here is scaling w so that
                // the value it should have tacked onto it is x_scale.  Note that we also
                // adjust alpha so that the combination of alpha*w stays the same.
                scalar_type scale;

                // if w_extra is basically greater than 0
                if (std::abs(w_extra) > std::numeric_limits<scalar_type>::epsilon())
                {
                    scale = (x_extra/w_extra);
                    temp_basis_vectors.set_size(1);
                    temp_alpha.set_size(1);
                    temp_basis_vectors(0) = sample_type(w.begin(), w.end());
                    dlib::scale_by(temp_basis_vectors(0), scale);
                    temp_alpha(0) = alpha/scale;
                }
                else
                {
                    // In this case w_extra is zero. So the only way we can get the same
                    // thing in the output basis vector set is by using two vectors
                    temp_basis_vectors.set_size(2);
                    temp_alpha.set_size(2);
                    temp_basis_vectors(0) = sample_type(w.begin(), w.end());
                    dlib::scale_by(temp_basis_vectors(0), 2);
                    temp_alpha(0) = alpha;
                    temp_basis_vectors(1) = sample_type(w.begin(), w.end());
                    temp_alpha(1) = -alpha;
                }

                return distance_function<kernel_type>(temp_alpha, squared_norm(), kernel, temp_basis_vectors);

            }
            else
            {
                return distance_function<kernel_type>(kernel);
            }

        }

    private:

        void do_train (
            const sample_type& x,
            scalar_type cscale,
            scalar_type xscale
        )
        {

            const scalar_type temp = cscale*alpha;

            if (temp != 0)
            {
                // compute w += xscale*x/temp
                typename sample_type::const_iterator i;
                for (i = x.begin(); i != x.end(); ++i)
                {
                    w[i->first] += xscale*(i->second)/temp;
                }

                w_extra = w_extra + xscale*x_extra/temp;
                alpha = temp;
            }
            else
            {
                // first compute w = cscale*alpha*w
                for (typename std::map<unsigned long,scalar_type>::iterator i = w.begin(); i != w.end(); ++i)
                {
                    i->second *= cscale*alpha;
                }

                // now compute w += xscale*x
                for (typename sample_type::const_iterator i = x.begin(); i != x.end(); ++i)
                {
                    w[i->first] += xscale*(i->second);
                }


                w_extra = cscale*alpha*w_extra + xscale*x_extra;
                alpha = 1;
            }
        }

        bool my_remove_oldest_first;

        kernel_type kernel;

        std::map<unsigned long,scalar_type> w;
        scalar_type alpha;

        scalar_type w_extra;
        scalar_type x_extra;


        scalar_type my_tolerance;
        unsigned long my_max_dictionary_size;
        scalar_type samples_seen;

    };

// ----------------------------------------------------------------------------------------

}

#endif // DLIB_KCENTROId_OVERLOADS_


