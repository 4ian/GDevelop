// The contents of this file are in the public domain. See LICENSE_FOR_EXAMPLE_PROGRAMS.txt
/*
    This is an example illustrating the use of the quantum computing
    simulation classes from the dlib C++ Library.

    This example assumes you are familiar with quantum computing and 
    Grover's search algorithm and Shor's 9 bit error correcting code
    in particular.   The example shows how to simulate both of these
    algorithms.


    The code to simulate Grover's algorithm is primarily here to show
    you how to make custom quantum gate objects.  The Shor ECC example
    is simpler and uses just the default gates that come with the 
    library.

*/


#include <iostream>
#include <complex>
#include <ctime>
#include <dlib/quantum_computing.h>
#include <dlib/string.h>


using namespace std;
using namespace dlib;

// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------

// This declares a random number generator that we will be using below  
dlib::rand rnd;

// ----------------------------------------------------------------------------------------

void shor_encode (
    quantum_register& reg
)
/*!
    requires
        - reg.num_bits() == 1
    ensures
        - #reg.num_bits() == 9
        - #reg == the Shor error coding of the input register
!*/
{
    DLIB_CASSERT(reg.num_bits() == 1,"");

    quantum_register zeros;
    zeros.set_num_bits(8);
    reg.append(zeros);

    using namespace dlib::quantum_gates;
    const gate<1> h = hadamard();
    const gate<1> i = noop();

    // Note that the expression (h,i) represents the tensor product of the 1 qubit 
    // h gate with the 1 qubit i gate and larger versions of this expression 
    // represent even bigger tensor products.  So as you see below, we make gates 
    // big enough to apply to our quantum register by listing out all the gates we 
    // want to go into the tensor product and then we just apply the resulting gate 
    // to the quantum register.

    // Now apply the gates that constitute Shor's encoding to the input register.  
    (cnot<3,0>(),i,i,i,i,i).apply_gate_to(reg);
    (cnot<6,0>(),i,i).apply_gate_to(reg);
    (h,i,i,h,i,i,h,i,i).apply_gate_to(reg);
    (cnot<1,0>(),i,cnot<1,0>(),i,cnot<1,0>(),i).apply_gate_to(reg);
    (cnot<2,0>(),cnot<2,0>(),cnot<2,0>()).apply_gate_to(reg);
}

// ----------------------------------------------------------------------------------------

void shor_decode (
    quantum_register& reg
)
/*!
    requires
        - reg.num_bits() == 9
    ensures
        - #reg.num_bits() == 1
        - #reg == the decoded qubit that was in the given input register 
!*/
{
    DLIB_CASSERT(reg.num_bits() == 9,"");

    using namespace dlib::quantum_gates;
    const gate<1> h = hadamard();
    const gate<1> i = noop();

    // Now apply the gates that constitute Shor's decoding to the input register

    (cnot<2,0>(),cnot<2,0>(),cnot<2,0>()).apply_gate_to(reg);
    (cnot<1,0>(),i,cnot<1,0>(),i,cnot<1,0>(),i).apply_gate_to(reg);

    (toffoli<0,1,2>(),toffoli<0,1,2>(),toffoli<0,1,2>()).apply_gate_to(reg);

    (h,i,i,h,i,i,h,i,i).apply_gate_to(reg);

    (cnot<6,0>(),i,i).apply_gate_to(reg);
    (cnot<3,0>(),i,i,i,i,i).apply_gate_to(reg);
    (toffoli<0,3,6>(),i,i).apply_gate_to(reg);

    // Now that we have decoded the value we don't need the extra 8 bits any more so 
    // remove them from the register.
    for (int i = 0; i < 8; ++i)
        reg.measure_and_remove_bit(0,rnd);
}

// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------

// This is the function we will use in Grover's search algorithm.  In this
// case the value we are searching for is 257.
bool is_key (unsigned long n)
{
    return n == 257;
}

// ----------------------------------------------------------------------------------------

template <int bits>
class uf_gate;

namespace dlib {
template <int bits>
struct gate_traits<uf_gate<bits> >
{
    static const long num_bits = bits;
    static const long dims = dlib::qc_helpers::exp_2_n<num_bits>::value;
};}

template <int bits>
class uf_gate : public gate_exp<uf_gate<bits> >
{
    /*!
        This gate represents the black box function in Grover's search algorithm.
        That is, it is the gate defined as follows:
            Uf|x>|y> = |x>|y XOR is_key(x)>

        See the documentation for the gate_exp object for the details regarding
        the compute_state_element() and operator() functions defined below.
    !*/
public:
    uf_gate() : gate_exp<uf_gate>(*this) {}

    static const long num_bits = gate_traits<uf_gate>::num_bits;
    static const long dims = gate_traits<uf_gate>::dims;

    const qc_scalar_type operator() (long r, long c) const 
    { 
        unsigned long output = c;
        // if the input control bit is set
        if (is_key(output>>1))
        {
            output = output^0x1;
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
        unsigned long output = row_idx;
        // if the input control bit is set
        if (is_key(output>>1))
        {
            output = output^0x1;
        }

        return reg(output);
    }
};

// ----------------------------------------------------------------------------------------

template <int bits>
class w_gate;

namespace dlib {
template <int bits>
struct gate_traits<w_gate<bits> >
{
    static const long num_bits = bits;
    static const long dims = dlib::qc_helpers::exp_2_n<num_bits>::value;
}; }

template <int bits>
class w_gate : public gate_exp<w_gate<bits> >
{
    /*!
        This is the W gate from the Grover algorithm
    !*/
public:

    w_gate() : gate_exp<w_gate>(*this) {}

    static const long num_bits = gate_traits<w_gate>::num_bits;
    static const long dims = gate_traits<w_gate>::dims;

    const qc_scalar_type operator() (long r, long c) const 
    { 
        qc_scalar_type res = 2.0/dims;
        if (r != c)
            return res;
        else
            return res - 1.0;
    }

    template <typename exp>
    qc_scalar_type compute_state_element (
        const matrix_exp<exp>& reg,
        long row_idx
    ) const
    {
        qc_scalar_type temp = sum(reg)*2.0/dims;
        // compute this value: temp = temp - reg(row_idx)*2.0/dims + reg(row_idx)*(2.0/dims - 1.0)
        temp = temp - reg(row_idx);

        return temp;
    }
};

// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------

int main()
{
    // seed the random number generator
    rnd.set_seed(cast_to_string(time(0)));

    // Pick out some of the gates we will be using below
    using namespace dlib::quantum_gates;
    const gate<1> h = quantum_gates::hadamard();
    const gate<1> z = quantum_gates::z();
    const gate<1> x = quantum_gates::x();
    const gate<1> i = quantum_gates::noop();

    quantum_register reg;

    // We will be doing the 12 qubit version of Grover's search algorithm.
    const int bits=12;
    reg.set_num_bits(bits);


    // set the quantum register to its initial state
    (i,i, i,i,i,i,i, i,i,i,i,x).apply_gate_to(reg);

    // Print out the starting bits
    cout << "starting bits: ";
    for (int i = reg.num_bits()-1; i >= 0; --i)
        cout << reg.probability_of_bit(i);
    cout << endl;


    // Now apply the Hadamard gate to all the input bits
    (h,h, h,h,h,h,h, h,h,h,h,h).apply_gate_to(reg);

    // Here we do the grover iteration
    for (int j = 0; j < 35; ++j)
    {
        (uf_gate<bits>()).apply_gate_to(reg);
        (w_gate<bits-1>(),i).apply_gate_to(reg);


        cout << j << " probability: bit 1 = " << reg.probability_of_bit(1) << ", bit 9 = " << reg.probability_of_bit(9) << endl;
    }

    cout << endl;

    // Print out the final probability of measuring a 1 for each of the bits
    for (int i = reg.num_bits()-1; i >= 1; --i)
        cout << "probability for bit " << i << " = " << reg.probability_of_bit(i) << endl;
    cout << endl;

    cout << "The value we want grover's search to find is 257 which means we should measure a bit pattern of 00100000001" << endl;
    cout << "Measured bits: ";
    // finally, measure all the bits and print out what they are.
    for (int i = reg.num_bits()-1; i >= 1; --i)
        cout << reg.measure_bit(i,rnd);
    cout << endl;

    



    // Now let's test out the Shor 9 bit encoding
    cout << "\n\n\n\nNow let's try playing around with Shor's 9bit error correcting code" << endl;

    // Reset the quantum register to contain a single bit
    reg.set_num_bits(1);
    // Set the state of this single qubit to some random mixture of the two computational bases
    reg.state_vector()(0) = qc_scalar_type(rnd.get_random_double(),rnd.get_random_double());
    reg.state_vector()(1) = qc_scalar_type(rnd.get_random_double(),rnd.get_random_double());
    // Make sure the state of the quantum register is a unit vector
    reg.state_vector() /= sqrt(sum(norm(reg.state_vector())));

    cout << "state: " << trans(reg.state_vector());

    shor_encode(reg);
    cout << "x bit corruption on bit 8" << endl;
    (x,i,i,i,i,i,i,i,i).apply_gate_to(reg); // mess up the high order bit 
    shor_decode(reg); // try to decode the register

    cout << "state: " << trans(reg.state_vector());

    shor_encode(reg);
    cout << "x bit corruption on bit 1" << endl;
    (i,i,i,i,i,i,i,x,i).apply_gate_to(reg);
    shor_decode(reg);

    cout << "state: " << trans(reg.state_vector());

    shor_encode(reg);
    cout << "z bit corruption on bit 8" << endl;
    (z,i,i,i,i,i,i,i,i).apply_gate_to(reg);
    shor_decode(reg);

    cout << "state: " << trans(reg.state_vector());

    cout << "\nThe state of the input qubit survived all the corruptions in tact so the code works." << endl;

}


