// Copyright (C) 2008  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#ifndef DLIB_QUANTUM_COMPUTINg_1_
#define DLIB_QUANTUM_COMPUTINg_1_

#include <complex>
#include <cmath>
#include "../matrix.h"
#include "../rand.h"
#include "../enable_if.h"
#include "../algs.h"
#include "quantum_computing_abstract.h"

namespace dlib
{

    template <typename T>
    struct gate_traits {};

    namespace qc_helpers
    {

    // ------------------------------------------------------------------------------------

    // This is a template to compute the value of 2^n at compile time
        template <long n>
        struct exp_2_n
        {
            COMPILE_TIME_ASSERT(0 <= n && n <= 30);
            static const long value = exp_2_n<n-1>::value*2;
        };

        template <>
        struct exp_2_n<0>
        {
            static const long value = 1;
        };

    // ------------------------------------------------------------------------------------

    }

    typedef std::complex<double> qc_scalar_type;

// ----------------------------------------------------------------------------------------

    class quantum_register
    {
    public:

        quantum_register()
        {
            set_num_bits(1);
        }

        int num_bits (
        ) const
        {
            return num_bits_in_register;
        }

        void set_num_bits (
            int num_bits
        )
        {
            // make sure requires clause is not broken
            DLIB_CASSERT(1 <= num_bits && num_bits <= 30,
                "\tvoid quantum_register::set_num_bits()"
                << "\n\tinvalid arguments to this function"
                << "\n\tnum_bits: " << num_bits 
                << "\n\tthis:     " << this
                );

            num_bits_in_register = num_bits;

            unsigned long size = 1;
            for (int i = 0; i < num_bits; ++i)
                size *= 2;

            state.set_size(size);

            zero_all_bits();
        }

        void zero_all_bits()
        {
            set_all_elements(state,0);
            state(0) = 1;
        }

        void append ( 
            const quantum_register& reg
        )
        {
            num_bits_in_register += reg.num_bits_in_register;
            state = tensor_product(state, reg.state);
        }

        template <typename rand_type>
        bool measure_bit (
            int bit,
            rand_type& rnd
        )
        {
            // make sure requires clause is not broken
            DLIB_CASSERT(0 <= bit && bit < num_bits(),
                "\tbool quantum_register::measure_bit()"
                << "\n\tinvalid arguments to this function"
                << "\n\tbit:        " << bit 
                << "\n\tnum_bits(): " << num_bits() 
                << "\n\tthis:       " << this
                );

            const bool value = (rnd.get_random_double() < probability_of_bit(bit));

            // Next we set all the states where this bit doesn't have the given value to 0

            // But first make a mask that selects our bit
            unsigned long mask = 1;
            for (int i = 0; i < bit; ++i)
                mask <<= 1;

            // loop over all the elements in the state vector and zero out those that
            // conflict with the measurement we just made.
            for (long r = 0; r < state.nr(); ++r)
            {
                const unsigned long field = r;
                // if this state indicates that the bit should be set and it isn't
                if ((field & mask) && !value)
                {
                    state(r) = 0;
                }
                // else if this state indicates that the bit should not be set and it is 
                else if (!(field & mask) && value)
                {
                    state(r) = 0;
                }
            }

            // normalize the state
            state = state/(std::sqrt(sum(norm(state))));

            return value;
        }

        template <typename rand_type>
        bool measure_and_remove_bit (
            int bit,
            rand_type& rnd
        )
        {
            // make sure requires clause is not broken
            DLIB_CASSERT(0 <= bit && bit < num_bits() && num_bits() > 0,
                "\tbool quantum_register::measure_and_remove_bit()"
                << "\n\tinvalid arguments to this function"
                << "\n\tbit:        " << bit 
                << "\n\tnum_bits(): " << num_bits() 
                << "\n\tthis:       " << this
                );


            const bool value = (rnd.get_random_double() < probability_of_bit(bit));
            quantum_register temp;
            temp.set_num_bits(num_bits()-1);


            // Next we set all the states where this bit doesn't have the given value to 0

            // But first make a mask that selects our bit
            unsigned long mask = 1;
            for (int i = 0; i < bit; ++i)
                mask <<= 1;

            long count = 0;
            for (long r = 0; r < state.nr(); ++r)
            {
                const unsigned long field = r;
                // if this basis vector is one that matches the measured state then keep it
                if (((field & mask) != 0) == value)
                {
                    temp.state(count) = state(r);
                    ++count;
                }
            }

            // normalize the state
            temp.state = temp.state/std::sqrt(sum(norm(temp.state)));

            temp.swap(*this);

            return value;
        }

        double probability_of_bit (
            int bit
        ) const
        {
            // make sure requires clause is not broken
            DLIB_CASSERT(0 <= bit && bit < num_bits(),
                "\tdouble quantum_register::probability_of_bit()"
                << "\n\tinvalid arguments to this function"
                << "\n\tbit:        " << bit 
                << "\n\tnum_bits(): " << num_bits() 
                << "\n\tthis:       " << this
                );


            // make a mask that selects our bit
            unsigned long mask = 1;
            for (int i = 0; i < bit; ++i)
                mask <<= 1;

            // now find the total probability of all the states that have the given bit set
            double prob = 0;
            for (long r = 0; r < state.nr(); ++r)
            {
                const unsigned long field = r;
                if (field & mask)
                {
                    prob += std::norm(state(r));
                }
            }


            return prob;
        }

        const matrix<qc_scalar_type,0,1>& state_vector() const { return state; }
        matrix<qc_scalar_type,0,1>& state_vector() { return state; }

        void swap (
            quantum_register& item
        )
        {
            exchange(num_bits_in_register, item.num_bits_in_register);
            state.swap(item.state);
        }

    private:

        int num_bits_in_register;
        matrix<qc_scalar_type,0,1> state;
    };

    inline void swap (
        quantum_register& a,
        quantum_register& b
    ) { a.swap(b); }

// ----------------------------------------------------------------------------------------

    template <typename T>
    class gate_exp
    {
    public:
        static const long num_bits = gate_traits<T>::num_bits;
        static const long dims = gate_traits<T>::dims;

        gate_exp(T& exp_) : exp(exp_) {}

        const qc_scalar_type operator() (long r, long c) const { return exp(r,c); }

        const matrix<qc_scalar_type> mat (
        ) const
        {
            matrix<qc_scalar_type,dims,dims> m;
            for (long r = 0; r < m.nr(); ++r)
            {
                for (long c = 0; c < m.nc(); ++c)
                {
                    m(r,c) = exp(r,c);
                }
            }
            return m;
        }

        void apply_gate_to (quantum_register& reg) const
        {
            // make sure requires clause is not broken
            DLIB_CASSERT(reg.num_bits() == num_bits,
                "\tvoid gate_exp::apply_gate_to()"
                << "\n\tinvalid arguments to this function"
                << "\n\treg.num_bits(): " << reg.num_bits() 
                << "\n\tnum_bits:       " << num_bits 
                << "\n\tthis:           " << this
                );


            quantum_register temp(reg);


            // check if any of the elements of the register are 1 and if so then
            // we don't have to do the full matrix multiply.  Or check if only a small number are non-zero.
            long non_zero_elements = 0;
            for (long r = 0; r < dims; ++r)
            {
                if (reg.state_vector()(r) != qc_scalar_type(0))
                    ++non_zero_elements;

                reg.state_vector()(r) = 0;
            }


            if (non_zero_elements > 3)
            {
                // do a full matrix multiply to compute the output state
                for (long r = 0; r < dims; ++r)
                {
                    reg.state_vector()(r) = compute_state_element(temp.state_vector(),r);
                }
            }
            else
            {
                // do a matrix multiply but only use the columns in the gate matrix 
                // that correspond to the non-zero register elements
                for (long r = 0; r < dims; ++r)
                {
                    if (temp.state_vector()(r) != qc_scalar_type(0))
                    {
                        for (long i = 0; i < dims; ++i)
                        {
                            reg.state_vector()(i) += temp.state_vector()(r)*exp(i,r);
                        }
                    }
                }
            }
        }

        template <typename exp>
        qc_scalar_type compute_state_element (
            const matrix_exp<exp>& reg,
            long row_idx
        ) const
        {
            // make sure requires clause is not broken
            DLIB_ASSERT(reg.nr() == dims && reg.nc() == 1 && 
                         0 <= row_idx && row_idx < dims,
                "\tqc_scalar_type gate_exp::compute_state_element(reg,row_idx)"
                << "\n\tinvalid arguments to this function"
                << "\n\treg.nr(): " << reg.nr() 
                << "\n\treg.nc(): " << reg.nc()
                << "\n\tdims:     " << dims
                << "\n\trow_idx:  " << row_idx 
                << "\n\tthis:     " << this
                );


            return this->exp.compute_state_element(reg,row_idx);
        }

        const T& ref() const { return exp; }

    private:
        T& exp;
    };

// ----------------------------------------------------------------------------------------


    template <typename T, typename U>
    class composite_gate;

    template <typename T, typename U>
    struct gate_traits<composite_gate<T,U> >
    {
        static const long num_bits = T::num_bits + U::num_bits;
        static const long dims = qc_helpers::exp_2_n<num_bits>::value;
    };

    template <typename T, typename U>
    class composite_gate : public gate_exp<composite_gate<T,U> >
    {
    public:

        typedef T lhs_type;
        typedef U rhs_type;

        composite_gate(const composite_gate& g) : gate_exp<composite_gate>(*this), lhs(g.lhs), rhs(g.rhs) {}

        composite_gate(
            const gate_exp<T>& lhs_,
            const gate_exp<U>& rhs_
        ) : gate_exp<composite_gate>(*this), lhs(lhs_.ref()), rhs(rhs_.ref()) {}



        static const long num_bits = gate_traits<composite_gate>::num_bits;
        static const long dims = gate_traits<composite_gate>::dims;

        const qc_scalar_type operator() (long r, long c) const { return lhs(r/U::dims,c/U::dims)*rhs(r%U::dims, c%U::dims); }

        template <typename exp>
        qc_scalar_type compute_state_element (
            const matrix_exp<exp>& reg,
            long row_idx
        ) const
        {
            // make sure requires clause is not broken
            DLIB_ASSERT(reg.nr() == dims && reg.nc() == 1 && 
                         0 <= row_idx && row_idx < dims,
                "\tqc_scalar_type composite_gate::compute_state_element(reg,row_idx)"
                << "\n\tinvalid arguments to this function"
                << "\n\treg.nr(): " << reg.nr() 
                << "\n\treg.nc(): " << reg.nc()
                << "\n\tdims:     " << dims
                << "\n\trow_idx:  " << row_idx 
                << "\n\tthis:     " << this
                );


            qc_scalar_type result = 0;
            for (long c = 0; c < T::dims; ++c)
            {
                if (lhs(row_idx/U::dims,c) != qc_scalar_type(0))
                {
                    result += lhs(row_idx/U::dims,c) * rhs.compute_state_element(subm(reg,c*U::dims,0,U::dims,1), row_idx%U::dims);
                }
            }

            return result;
        }


        const T lhs;
        const U rhs;
    };

// ----------------------------------------------------------------------------------------

    template <long bits>
    class gate;
    template <long bits>
    struct gate_traits<gate<bits> >
    {
        static const long num_bits = bits;
        static const long dims = qc_helpers::exp_2_n<num_bits>::value;
    };

// ----------------------------------------------------------------------------------------

    template <long bits>
    class gate : public gate_exp<gate<bits> >
    {
    public:
        gate() : gate_exp<gate>(*this) { set_all_elements(data,0); }
        gate(const gate& g) :gate_exp<gate>(*this), data(g.data) {}

        template <typename T>
        explicit gate(const gate_exp<T>& g) : gate_exp<gate>(*this) 
        {
            COMPILE_TIME_ASSERT(T::num_bits == num_bits);
            for (long r = 0; r < dims; ++r)
            {
                for (long c = 0; c < dims; ++c)
                {
                    data(r,c) = g(r,c);
                }
            }
        }

        static const long num_bits = gate_traits<gate>::num_bits;
        static const long dims = gate_traits<gate>::dims;

        const qc_scalar_type& operator() (long r, long c) const { return data(r,c); }
        qc_scalar_type& operator() (long r, long c)  { return data(r,c); }

        template <typename exp>
        qc_scalar_type compute_state_element (
            const matrix_exp<exp>& reg,
            long row_idx
        ) const
        {
            // make sure requires clause is not broken
            DLIB_ASSERT(reg.nr() == dims && reg.nc() == 1 && 
                         0 <= row_idx && row_idx < dims,
                "\tqc_scalar_type gate::compute_state_element(reg,row_idx)"
                << "\n\tinvalid arguments to this function"
                << "\n\treg.nr(): " << reg.nr() 
                << "\n\treg.nc(): " << reg.nc()
                << "\n\tdims:     " << dims
                << "\n\trow_idx:  " << row_idx 
                << "\n\tthis:     " << this
                );


            return (data*reg)(row_idx);
        }

    private:

        matrix<qc_scalar_type,dims,dims> data;
    };

// ----------------------------------------------------------------------------------------

    namespace qc_helpers
    {
        // This is the maximum number of bits used for cached sub-matrices in composite_gate expressions
        const int qc_block_chunking_size = 8;

        template <typename T>
        struct is_composite_gate { const static bool value = false; };
        template <typename T, typename U>
        struct is_composite_gate<composite_gate<T,U> > { const static bool value = true; };


        // These overloads all deal with intelligently composing chains of composite_gate expressions
        // such that the resulting expression has the form:
        //    (gate_exp,(gate_exp,(gate_exp,(gate_exp()))))
        // and each gate_exp contains a cached gate matrix for a gate of at most qc_block_chunking_size bits.  
        // This facilitates the optimizations in the compute_state_element() function. 
        template <typename T, typename U, typename V, typename enabled = void>
        struct combine_gates;

        // This is a base case of this recursive template.  It takes care of converting small composite_gates into
        // cached gate objects.
        template <typename T, typename U, typename V>
        struct combine_gates<T,U,V,typename enable_if_c<(T::num_bits + U::num_bits <= qc_block_chunking_size)>::type >
        {
            typedef composite_gate<gate<T::num_bits + U::num_bits>,V>  result_type;

            static const result_type eval (
                const composite_gate<T,U>& lhs,
                const gate_exp<V>& rhs
            ) 
            {
                typedef gate<T::num_bits + U::num_bits> gate_type;
                return composite_gate<gate_type,V>(gate_type(lhs), rhs);
            }
        };

        // this is the recursive step of this template
        template <typename T, typename U, typename V>
        struct combine_gates<T,U,V,typename enable_if_c<(is_composite_gate<U>::value == true)>::type >
        {
            typedef typename combine_gates<typename U::lhs_type, typename U::rhs_type, V>::result_type inner_type;
            typedef composite_gate<T,inner_type> result_type;

            static const result_type eval (
                const composite_gate<T,U>& lhs,
                const gate_exp<V>& rhs
            )
            {
                return composite_gate<T,inner_type>(lhs.lhs, combine_gates<typename U::lhs_type, typename U::rhs_type, V>::eval(lhs.rhs,rhs));
            }

        };

        // This is a base case of this recursive template.  It takes care of adding new gates when the left
        // hand side is too big to just turn it into a cached gate object.
        template <typename T, typename U, typename V>
        struct combine_gates<T,U,V,typename enable_if_c<(T::num_bits + U::num_bits > qc_block_chunking_size && 
                                                         is_composite_gate<U>::value == false)>::type >
        {
            typedef composite_gate<T,composite_gate<U, V> > result_type;

            static const result_type eval (
                const composite_gate<T,U>& lhs,
                const gate_exp<V>& rhs
            ) 
            {
                return result_type(lhs.lhs, composite_gate<U,V>(lhs.rhs, rhs)); 
            }

        };

    }

    template <typename T, typename U>
    const composite_gate<T,U> operator, ( 
        const gate_exp<T>& lhs,
        const gate_exp<U>& rhs
    )
    {
        return composite_gate<T,U>(lhs,rhs);
    }

    template <typename T, typename U, typename V>
    const typename qc_helpers::combine_gates<T,U,V>::result_type operator, ( 
        const composite_gate<T,U>& lhs,
        const gate_exp<V>& rhs
    )
    {
        return qc_helpers::combine_gates<T,U,V>::eval(lhs,rhs);
    }

    // If you are getting an error here then it means that you are trying to combine a gate expression
    // with an integer somewhere (and that is an error).  
    template <typename T> void operator, ( const gate_exp<T>&, int) { COMPILE_TIME_ASSERT(sizeof(T) > 100000000); }
    template <typename T> void operator, ( int, const gate_exp<T>&) { COMPILE_TIME_ASSERT(sizeof(T) > 100000000); }

// ----------------------------------------------------------------------------------------

    namespace quantum_gates
    {
        template <int control_bit, int target_bit>
        class cnot;

        template <int control_bit1, int control_bit2, int target_bit>
        class toffoli;
    }

    template <int control_bit, int target_bit>
    struct gate_traits<quantum_gates::cnot<control_bit, target_bit> >
    {
        static const long num_bits = tabs<control_bit-target_bit>::value+1;
        static const long dims = qc_helpers::exp_2_n<num_bits>::value;
    };

    template <int control_bit1, int control_bit2, int target_bit>
    struct gate_traits<quantum_gates::toffoli<control_bit1, control_bit2, target_bit> >
    {
        static const long num_bits = tmax<tabs<control_bit1-target_bit>::value, 
                                            tabs<control_bit2-target_bit>::value>::value+1;
        static const long dims = qc_helpers::exp_2_n<num_bits>::value;
    };


// ----------------------------------------------------------------------------------------

    namespace quantum_gates
    {

        inline const gate<1> hadamard(
        )
        {
            gate<1> h;
            h(0,0) = std::sqrt(1/2.0);
            h(0,1) = std::sqrt(1/2.0);
            h(1,0) = std::sqrt(1/2.0);
            h(1,1) = -std::sqrt(1/2.0);
            return h;
        }

    // ------------------------------------------------------------------------------------

        inline const gate<1> x(
        )
        {
            gate<1> x;
            x(0,1) = 1;
            x(1,0) = 1;
            return x;
        }

    // ------------------------------------------------------------------------------------

        inline const gate<1> y(
        )
        {
            gate<1> x;
            qc_scalar_type i(0,1);
            x(0,1) = -i;
            x(1,0) = i;
            return x;
        }

    // ------------------------------------------------------------------------------------

        inline const gate<1> z(
        )
        {
            gate<1> z;
            z(0,0) = 1;
            z(1,1) = -1;
            return z;
        }

    // ------------------------------------------------------------------------------------

        inline const gate<1> noop(
        )
        {
            gate<1> i;
            i(0,0) = 1;
            i(1,1) = 1;
            return i;
        }

    // ------------------------------------------------------------------------------------

        template <int control_bit, int target_bit>
        class cnot : public gate_exp<cnot<control_bit, target_bit> >
        {
        public:
            COMPILE_TIME_ASSERT(control_bit != target_bit);

            cnot() : gate_exp<cnot>(*this) 
            {
                const int min_bit = std::min(control_bit, target_bit);

                control_mask = 1;
                target_mask = 1;

                // make the masks so that their only on bit corresponds to the given control_bit and target_bit bits
                for (int i = 0; i < control_bit-min_bit; ++i)
                    control_mask <<= 1;
                for (int i = 0; i < target_bit-min_bit; ++i)
                    target_mask <<= 1;
            }

            static const long num_bits = gate_traits<cnot>::num_bits;
            static const long dims = gate_traits<cnot>::dims;

            const qc_scalar_type operator() (long r, long c) const 
            { 
                unsigned long output;
                // if the input control bit is set
                if (control_mask&c)
                {
                    output = c^target_mask;
                }
                else
                {
                    output = c;
                }

                if ((unsigned long)r == output)
                    return 1;
                else
                    return 0;
            }

            template <typename exp>
            qc_scalar_type compute_state_element (
                const matrix_exp<exp>& reg,
                long row_idx
            ) const
            {
                // make sure requires clause is not broken
                DLIB_ASSERT(reg.nr() == dims && reg.nc() == 1 && 
                            0 <= row_idx && row_idx < dims,
                    "\tqc_scalar_type cnot::compute_state_element(reg,row_idx)"
                    << "\n\tinvalid arguments to this function"
                    << "\n\treg.nr(): " << reg.nr() 
                    << "\n\treg.nc(): " << reg.nc()
                    << "\n\tdims:     " << dims
                    << "\n\trow_idx:  " << row_idx 
                    << "\n\tthis:     " << this
                    );


                unsigned long output = row_idx;
                // if the input control bit is set
                if (control_mask&output)
                {
                    output = output^target_mask;
                }

                return reg(output);
            }

        private:

            unsigned long control_mask;
            unsigned long target_mask;


        };

    // ------------------------------------------------------------------------------------

        template <int control_bit1, int control_bit2, int target_bit>
        class toffoli : public gate_exp<toffoli<control_bit1, control_bit2, target_bit> >
        {
        public:
            COMPILE_TIME_ASSERT(control_bit1 != target_bit && control_bit2 != target_bit && control_bit1 != control_bit2);
            COMPILE_TIME_ASSERT((control_bit1 < target_bit && control_bit2 < target_bit) ||(control_bit1 > target_bit && control_bit2 > target_bit) );

            toffoli() : gate_exp<toffoli>(*this) 
            {
                const int min_bit = std::min(std::min(control_bit1, control_bit2), target_bit);

                control1_mask = 1;
                control2_mask = 1;
                target_mask = 1;

                // make the masks so that their only on bit corresponds to the given control_bit1 and target_bit bits
                for (int i = 0; i < control_bit1-min_bit; ++i)
                    control1_mask <<= 1;
                for (int i = 0; i < control_bit2-min_bit; ++i)
                    control2_mask <<= 1;
                for (int i = 0; i < target_bit-min_bit; ++i)
                    target_mask <<= 1;
            }

            static const long num_bits = gate_traits<toffoli>::num_bits;
            static const long dims = gate_traits<toffoli>::dims;

            const qc_scalar_type operator() (long r, long c) const 
            { 
                unsigned long output;
                // if the input control bits are set
                if ((control1_mask&c) && (control2_mask&c))
                {
                    output = c^target_mask;
                }
                else
                {
                    output = c;
                }

                if ((unsigned long)r == output)
                    return 1;
                else
                    return 0;
            }

            template <typename exp>
            qc_scalar_type compute_state_element (
                const matrix_exp<exp>& reg,
                long row_idx
            ) const
            {
                // make sure requires clause is not broken
                DLIB_ASSERT(reg.nr() == dims && reg.nc() == 1 && 
                            0 <= row_idx && row_idx < dims,
                    "\tqc_scalar_type toffoli::compute_state_element(reg,row_idx)"
                    << "\n\tinvalid arguments to this function"
                    << "\n\treg.nr(): " << reg.nr() 
                    << "\n\treg.nc(): " << reg.nc()
                    << "\n\tdims:     " << dims
                    << "\n\trow_idx:  " << row_idx 
                    << "\n\tthis:     " << this
                    );


                unsigned long output;
                // if the input control bits are set
                if ((control1_mask&row_idx) && (control2_mask&row_idx))
                {
                    output = row_idx^target_mask;
                }
                else
                {
                    output = row_idx;
                }

                return reg(output);

            }

        private:

            unsigned long control1_mask;
            unsigned long control2_mask;
            unsigned long target_mask;


        };


    // ------------------------------------------------------------------------------------

    }

// ----------------------------------------------------------------------------------------

}

#endif // DLIB_QUANTUM_COMPUTINg_1_


