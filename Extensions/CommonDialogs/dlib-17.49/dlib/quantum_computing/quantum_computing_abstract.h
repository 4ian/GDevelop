// Copyright (C) 2008  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#undef DLIB_QUANTUM_COMPUTINg_ABSTRACT_
#ifdef DLIB_QUANTUM_COMPUTINg_ABSTRACT_

#include <complex>
#include "../matrix.h"
#include "../rand.h"

namespace dlib
{

// ----------------------------------------------------------------------------------------

    typedef std::complex<double> qc_scalar_type;

// ----------------------------------------------------------------------------------------

    class quantum_register
    {
        /*!
            INITIAL VALUE
                - num_bits() == 1
                - state_vector().nr() == 2
                - state_vector().nc() == 1
                - state_vector()(0) == 1
                - state_vector()(1) == 0
                - probability_of_bit(0) == 0

                - i.e. This register represents a single quantum bit and it is
                  completely in the 0 state.

            WHAT THIS OBJECT REPRESENTS
                This object represents a set of quantum bits.
        !*/

    public:

        quantum_register(
        );
        /*!
            ensures
                - this object is properly initialized
        !*/

        int num_bits (
        ) const;
        /*!
            ensures
                - returns the number of quantum bits in this register
        !*/

        void set_num_bits (
            int new_num_bits
        );
        /*!
            requires
                - 1 <= new_num_bits <= 30
            ensures
                - #num_bits() == new_num_bits
                - #state_vector().nr() == 2^new_num_bits
                  (i.e. the size of the state_vector is exponential in the number of bits in a register)
                - for all valid i:
                    - probability_of_bit(i) == 0
        !*/

        void zero_all_bits(
        );
        /*!
            ensures
                - for all valid i:
                    - probability_of_bit(i) == 0
        !*/

        void append ( 
            const quantum_register& reg
        );
        /*!
            ensures
                - #num_bits() == num_bits() + reg.num_bits()
                - #this->state_vector() == tensor_product(this->state_vector(), reg.state_vector())
                - The original bits in *this become the high order bits of the resulting 
                  register and all the bits in reg end up as the low order bits in the
                  resulting register.
        !*/

        double probability_of_bit (
            int bit
        ) const;
        /*!
            requires
                - 0 <= bit < num_bits()
            ensures
                - returns the probability of measuring the given bit and it being in the 1 state.
                - The returned value is also equal to the sum of norm(state_vector()(i)) for all
                  i where the bit'th bit in i is set to 1. (note that the lowest order bit is bit 0)
        !*/

        template <typename rand_type>
        bool measure_bit (
            int bit,
            rand_type& rnd
        );
        /*!
            requires
                - 0 <= bit < num_bits()
                - rand_type == an implementation of dlib/rand/rand_float_abstract.h
            ensures
                - measures the given bit in this register.  Let R denote the boolean
                  result of the measurement, where true means the bit was measured to
                  have value 1 and false means it had a value of 0.
                - if (R == true) then
                    - returns true
                    - #probability_of_bit(bit) == 1
                - else
                    - returns false
                    - #probability_of_bit(bit) == 0
        !*/

        template <typename rand_type>
        bool measure_and_remove_bit (
            int bit,
            rand_type& rnd
        );
        /*!
            requires
                - num_bits() > 1
                - 0 <= bit < num_bits()
                - rand_type == an implementation of dlib/rand/rand_float_abstract.h
            ensures
                - measures the given bit in this register.  Let R denote the boolean
                  result of the measurement, where true means the bit was measured to
                  have value 1 and false means it had a value of 0.
                - #num_bits() == num_bits() - 1
                - removes the bit that was measured from this register.
                - if (R == true) then
                    - returns true
                - else
                    - returns false
        !*/

        const matrix<qc_scalar_type,0,1>& state_vector(
        ) const;
        /*!
            ensures
                - returns a const reference to the state vector that describes the state of
                  the quantum bits in this register.
        !*/

        matrix<qc_scalar_type,0,1>& state_vector(
        );
        /*!
            ensures
                - returns a non-const reference to the state vector that describes the state of
                  the quantum bits in this register.
        !*/

        void swap (
            quantum_register& item
        );
        /*!
            ensures
                - swaps *this and item
        !*/

    };

    inline void swap (
        quantum_register& a,
        quantum_register& b
    ) { a.swap(b); }
    /*!
        provides a global swap function
    !*/

// ----------------------------------------------------------------------------------------

    template <typename T>
    class gate_exp
    {
        /*!
            REQUIREMENTS ON T
                T must be some object that inherits from gate_exp and implements its own
                version of operator() and compute_state_element().

            WHAT THIS OBJECT REPRESENTS
                This object represents an expression that evaluates to a quantum gate 
                that operates on T::num_bits qubits.

                This object makes it easy to create new types of gate objects. All
                you need to do is inherit from gate_exp in the proper way and 
                then you can use your new gate objects in conjunction with all the 
                others.
        !*/

    public:

        static const long num_bits = T::num_bits;
        static const long dims = T::dims; 

        gate_exp(
            T& exp
        );
        /*!
            ensures
                - #&ref() == &exp
        !*/

        const qc_scalar_type operator() (
            long r, 
            long c
        ) const;
        /*!
            requires
                - 0 <= r < dims
                - 0 <= c < dims
            ensures
                - returns ref()(r,c)
        !*/

        void apply_gate_to (
            quantum_register& reg
        ) const;
        /*!
            requires
                - reg.num_bits() == num_bits
            ensures
                - applies this quantum gate to the given quantum register
                - Let M represent the matrix for this quantum gate, then
                  #reg().state_vector() = M*reg().state_vector()
        !*/

        template <typename exp>
        qc_scalar_type compute_state_element (
            const matrix_exp<exp>& reg,
            long row_idx
        ) const;
        /*!
            requires
                - reg.nr() == dims
                - reg.nc() == 1
                - 0 <= row_idx < dims
            ensures
                - Let M represent the matrix for this gate, then   
                  this function returns rowm(M*reg, row_idx)
                  (i.e. returns the row_idx row of what you get when you apply this
                  gate to the given column vector in reg)
                - This function works by calling ref().compute_state_element(reg,row_idx)
        !*/

        const T& ref(
        );
        /*!
            ensures
                - returns a reference to the subexpression contained in this object
        !*/

        const matrix<qc_scalar_type> mat (
        ) const;
        /*!
            ensures
                - returns a dense matrix object that contains the matrix for this gate
        !*/
    };

// ----------------------------------------------------------------------------------------

    template <typename T, typename U>
    class composite_gate : public gate_exp<composite_gate<T,U> >
    {
        /*!
            REQUIREMENTS ON T AND U
                Both must be gate expressions that inherit from gate_exp

            WHAT THIS OBJECT REPRESENTS
                This object represents a quantum gate that is the tensor product of 
                two other quantum gates.


                As an example, suppose you have 3 registers, reg_high, reg_low, and reg_all.  Also
                suppose that reg_all is what you get when you append reg_high and reg_low,
                so reg_all.state_vector() == tensor_product(reg_high.state_vector(),reg_low.state_vector()).
                
                Then applying a composite gate to reg_all would give you the same thing as
                applying the lhs gate to reg_high and the rhs gate to reg_low and then appending 
                the two resulting registers.  So the lhs gate of a composite_gate applies to
                the high order bits of a regitser and the rhs gate applies to the lower order bits.
        !*/
    public:

        composite_gate (
            const composite_gate& g
        );
        /*!
            ensures
                - *this is a copy of g
        !*/

        composite_gate(
            const gate_exp<T>& lhs_, 
            const gate_exp<U>& rhs_
        ): 
        /*!
            ensures
                - #lhs == lhs_.ref()
                - #rhs == rhs_.ref()
                - #num_bits == T::num_bits + U::num_bits
                - #dims == 2^num_bits
                - #&ref() == this
        !*/

        const qc_scalar_type operator() (
            long r, 
            long c
        ) const; 
        /*!
            requires
                - 0 <= r < dims
                - 0 <= c < dims
            ensures
                - Let M denote the tensor product of lhs with rhs, then this function
                  returns M(r,c)
                  (i.e. returns lhs(r/U::dims,c/U::dims)*rhs(r%U::dims, c%U::dims))
        !*/

        template <typename exp>
        qc_scalar_type compute_state_element (
            const matrix_exp<exp>& reg,
            long row_idx
        ) const;
        /*!
            requires
                - reg.nr() == dims
                - reg.nc() == 1
                - 0 <= row_idx < dims
            ensures
                - Let M represent the matrix for this gate, then this function
                  returns rowm(M*reg, row_idx)
                  (i.e. returns the row_idx row of what you get when you apply this
                  gate to the given column vector in reg)
                - This function works by calling rhs.compute_state_element() and using elements
                  of the matrix in lhs.  
        !*/

        static const long num_bits;
        static const long dims;

        const T lhs;
        const U rhs;
    };

// ----------------------------------------------------------------------------------------

    template <long bits>
    class gate : public gate_exp<gate<bits> >
    {
        /*!
            REQUIREMENTS ON bits
                0 < bits <= 30

            WHAT THIS OBJECT REPRESENTS
                This object represents a quantum gate that operates on bits qubits. 
                It stores its gate matrix explicitly in a dense in-memory matrix. 
        !*/

    public:
        gate(
        );
        /*!
            ensures
                - num_bits == bits
                - dims == 2^bits
                - #&ref() == this
                - for all valid r and c:
                    #(*this)(r,c) == 0
        !*/

        gate (
            const gate& g
        );
        /*!
            ensures
                - *this is a copy of g
        !*/

        template <typename T>
        explicit gate(
            const gate_exp<T>& g
        );
        /*!
            requires
                - T::num_bits == num_bits
            ensures
                - num_bits == bits
                - dims == 2^bits
                - #&ref() == this
                - for all valid r and c:
                    #(*this)(r,c) == g(r,c)
        !*/

        const qc_scalar_type& operator() (
            long r, 
            long c
        ) const;
        /*!
            requires
                - 0 <= r < dims
                - 0 <= c < dims
            ensures
                - Let M denote the matrix for this gate, then this function
                  returns a const reference to M(r,c)
        !*/

        qc_scalar_type& operator() (
            long r, 
            long c
        );
        /*!
            requires
                - 0 <= r < dims
                - 0 <= c < dims
            ensures
                - Let M denote the matrix for this gate, then this function 
                  returns a non-const reference to M(r,c)
        !*/

        template <typename exp>
        qc_scalar_type compute_state_element (
            const matrix_exp<exp>& reg,
            long row_idx
        ) const;
        /*!
            requires
                - reg.nr() == dims
                - reg.nc() == 1
                - 0 <= row_idx < dims
            ensures
                - Let M represent the matrix for this gate, then this function
                  returns rowm(M*reg, row_idx)
                  (i.e. returns the row_idx row of what you get when you apply this
                  gate to the given column vector in reg)
        !*/

        static const long num_bits;
        static const long dims;

    };

// ----------------------------------------------------------------------------------------

    template <typename T, typename U>
    const composite_gate<T,U> operator, ( 
        const gate_exp<T>& lhs,
        const gate_exp<U>& rhs
    ) { return composite_gate<T,U>(lhs,rhs); }
    /*!
        ensures
            - returns a composite_gate that represents the tensor product of the lhs
              gate with the rhs gate.
    !*/

// ----------------------------------------------------------------------------------------

    namespace quantum_gates
    {

        inline const gate<1> hadamard(
        );
        /*!
            ensures
                - returns the Hadamard gate.
                  (i.e. A gate with a matrix of
                                 |1, 1|
                     1/sqrt(2) * |1,-1|   )
        !*/

        inline const gate<1> x(
        );
        /*!
            ensures
                - returns the not gate.
                  (i.e. A gate with a matrix of
                      |0, 1|
                      |1, 0|   )
        !*/

        inline const gate<1> y(
        );
        /*!
            ensures
                - returns the y gate.
                  (i.e. A gate with a matrix of
                      |0,-i|
                      |i, 0|   )
        !*/

        inline const gate<1> z(
        );
        /*!
            ensures
                - returns the z gate.
                  (i.e. A gate with a matrix of
                      |1, 0|
                      |0,-1|   )
        !*/

        inline const gate<1> noop(
        );
        /*!
            ensures
                - returns the no-op or identity gate.
                  (i.e. A gate with a matrix of
                      |1, 0|
                      |0, 1|   )
        !*/

        template <
            int control_bit,
            int target_bit
            >
        class cnot : public gate_exp<cnot<control_bit, target_bit> >
        {
            /*!
                REQUIREMENTS ON control_bit AND target_bit
                    - control_bit != target_bit

                WHAT THIS OBJECT REPRESENTS
                    This object represents the controlled-not quantum gate.  It is a gate that
                    operates on abs(control_bit-target_bit)+1 qubits.   

                    In terms of the computational basis vectors, this gate maps input
                    vectors to output vectors in the following way:
                        - if (the input vector corresponds to a state where the control_bit
                          qubit is 1) then
                            - this gate outputs the computational basis vector that
                              corresponds to the state where the target_bit has been flipped
                              with respect to the input vector
                        - else
                            - this gate outputs the input vector unmodified

            !*/
        };

        template <
            int control_bit1,
            int control_bit2,
            int target_bit
            >
        class toffoli : public gate_exp<toffoli<control_bit1, control_bit2, target_bit> >
        {
            /*!
                REQUIREMENTS ON control_bit1, control_bit2, AND target_bit
                    - all the arguments denote different bits, i.e.:
                        - control_bit1 != target_bit
                        - control_bit2 != target_bit
                        - control_bit1 != control_bit2
                    - The target bit can't be in-between the control bits, i.e.:
                        - (control_bit1 < target_bit && control_bit2 < target_bit) ||
                          (control_bit1 > target_bit && control_bit2 > target_bit) 

                WHAT THIS OBJECT REPRESENTS
                    This object represents the toffoli variant of a controlled-not quantum gate.  
                    It is a gate that operates on max(abs(control_bit2-target_bit),abs(control_bit1-target_bit))+1 
                    qubits.   

                    In terms of the computational basis vectors, this gate maps input
                    vectors to output vectors in the following way:
                        - if (the input vector corresponds to a state where the control_bit1 and
                          control_bit2 qubits are 1) then
                            - this gate outputs the computational basis vector that
                              corresponds to the state where the target_bit has been flipped
                              with respect to the input vector
                        - else
                            - this gate outputs the input vector unmodified

            !*/
        };

    // ------------------------------------------------------------------------------------

    }

// ----------------------------------------------------------------------------------------

}

#endif // DLIB_QUANTUM_COMPUTINg_ABSTRACT_



