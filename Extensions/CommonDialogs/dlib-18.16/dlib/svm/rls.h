// Copyright (C) 2012  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#ifndef DLIB_RLs_Hh_
#define DLIB_RLs_Hh_

#include "rls_abstract.h"
#include "../matrix.h"
#include "function.h"

namespace dlib
{

// ----------------------------------------------------------------------------------------

    class rls
    {

    public:


        explicit rls(
            double forget_factor_,
            double C_ = 1000
        )
        {
            // make sure requires clause is not broken
            DLIB_ASSERT(0 < forget_factor_ && forget_factor_ <= 1 &&
                        0 < C_,
                "\t rls::rls()"
                << "\n\t invalid arguments were given to this function"
                << "\n\t forget_factor_: " << forget_factor_ 
                << "\n\t C_:   " << C_ 
                << "\n\t this: " << this
                );


            C = C_;
            forget_factor = forget_factor_;
        }

        rls(
        )
        {
            C = 1000;
            forget_factor = 1;
        }

        double get_c(
        ) const
        {
            return C;
        }

        double get_forget_factor(
        ) const
        {
            return forget_factor;
        }

        template <typename EXP>
        void train (
            const matrix_exp<EXP>& x,
            double y
        )
        {
            // make sure requires clause is not broken
            DLIB_ASSERT(is_col_vector(x) &&
                        (get_w().size() == 0 || get_w().size() == x.size()),
                "\t void rls::train()"
                << "\n\t invalid arguments were given to this function"
                << "\n\t is_col_vector(x): " << is_col_vector(x) 
                << "\n\t x.size():         " << x.size() 
                << "\n\t get_w().size():   " << get_w().size() 
                << "\n\t this: " << this
                );

            if (R.size() == 0)
            {
                R = identity_matrix<double>(x.size())*C;
                w.set_size(x.size());
                w = 0;
            }

            // multiply by forget factor and incorporate x*trans(x) into R.
            const double l = 1.0/forget_factor;
            const double temp = 1 + l*trans(x)*R*x;
            matrix<double,0,1> tmp = R*x;
            R = l*R - l*l*(tmp*trans(tmp))/temp;

            // Since we multiplied by the forget factor, we need to add (1-forget_factor) of the
            // identity matrix back in to keep the regularization alive.  
            add_eye_to_inv(R, (1-forget_factor)/C);

            // R should always be symmetric.  This line improves numeric stability of this algorithm.
            R = 0.5*(R + trans(R));

            w = w + R*x*(y - trans(x)*w);

        }

        const matrix<double,0,1>& get_w(
        ) const
        {
            return w;
        }

        template <typename EXP>
        double operator() (
            const matrix_exp<EXP>& x
        ) const
        {
            // make sure requires clause is not broken
            DLIB_ASSERT(is_col_vector(x) && get_w().size() == x.size(),
                "\t double rls::operator()()"
                << "\n\t invalid arguments were given to this function"
                << "\n\t is_col_vector(x): " << is_col_vector(x) 
                << "\n\t x.size():         " << x.size() 
                << "\n\t get_w().size():   " << get_w().size() 
                << "\n\t this: " << this
                );

            return dot(x,w);
        }

        decision_function<linear_kernel<matrix<double,0,1> > > get_decision_function (
        ) const
        {
            // make sure requires clause is not broken
            DLIB_ASSERT(get_w().size() != 0,
                "\t decision_function rls::get_decision_function()"
                << "\n\t invalid arguments were given to this function"
                << "\n\t get_w().size():   " << get_w().size() 
                << "\n\t this: " << this
                );

            decision_function<linear_kernel<matrix<double,0,1> > > df;
            df.alpha.set_size(1);
            df.basis_vectors.set_size(1);
            df.b = 0;
            df.alpha = 1;
            df.basis_vectors(0) = w;

            return df;
        }

        friend inline void serialize(const rls& item, std::ostream& out)
        {
            int version = 1;
            serialize(version, out);
            serialize(item.w, out);
            serialize(item.R, out);
            serialize(item.C, out);
            serialize(item.forget_factor, out);
        }

        friend inline void deserialize(rls& item, std::istream& in)
        {
            int version = 0;
            deserialize(version, in);
            if (version != 1)
                throw dlib::serialization_error("Unknown version number found while deserializing rls object.");

            deserialize(item.w, in);
            deserialize(item.R, in);
            deserialize(item.C, in);
            deserialize(item.forget_factor, in);
        }

    private:

        void add_eye_to_inv(
            matrix<double>& m,
            double C
        )
        /*!
            ensures
                - Let m == inv(M)
                - this function returns inv(M + C*identity_matrix<double>(m.nr()))
        !*/
        {
            for (long r = 0; r < m.nr(); ++r)
            {
                m = m - colm(m,r)*trans(colm(m,r))/(1/C + m(r,r));
            }
        }


        matrix<double,0,1> w;
        matrix<double> R;
        double C;
        double forget_factor;
    };

// ----------------------------------------------------------------------------------------

}

#endif // DLIB_RLs_Hh_

