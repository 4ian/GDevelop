// The contents of this file are in the public domain. See LICENSE_FOR_EXAMPLE_PROGRAMS.txt
/*

    This is an example illustrating the use the general purpose non-linear 
    least squares optimization routines from the dlib C++ Library.

    This example program will demonstrate how these routines can be used for data fitting.
    In particular, we will generate a set of data and then use the least squares  
    routines to infer the parameters of the model which generated the data.
*/


#include <dlib/optimization.h>
#include <iostream>
#include <vector>


using namespace std;
using namespace dlib;

// ----------------------------------------------------------------------------------------

typedef matrix<double,2,1> input_vector;
typedef matrix<double,3,1> parameter_vector;

// ----------------------------------------------------------------------------------------

// We will use this function to generate data.  It represents a function of 2 variables
// and 3 parameters.   The least squares procedure will be used to infer the values of 
// the 3 parameters based on a set of input/output pairs.
double model (
    const input_vector& input,
    const parameter_vector& params
)
{
    const double p0 = params(0);
    const double p1 = params(1);
    const double p2 = params(2);

    const double i0 = input(0);
    const double i1 = input(1);

    const double temp = p0*i0 + p1*i1 + p2;

    return temp*temp;
}

// ----------------------------------------------------------------------------------------

// This function is the "residual" for a least squares problem.   It takes an input/output
// pair and compares it to the output of our model and returns the amount of error.  The idea
// is to find the set of parameters which makes the residual small on all the data pairs.
double residual (
    const std::pair<input_vector, double>& data,
    const parameter_vector& params
)
{
    return model(data.first, params) - data.second;
}

// ----------------------------------------------------------------------------------------

// This function is the derivative of the residual() function with respect to the parameters.
parameter_vector residual_derivative (
    const std::pair<input_vector, double>& data,
    const parameter_vector& params
)
{
    parameter_vector der;

    const double p0 = params(0);
    const double p1 = params(1);
    const double p2 = params(2);

    const double i0 = data.first(0);
    const double i1 = data.first(1);

    const double temp = p0*i0 + p1*i1 + p2;

    der(0) = i0*2*temp;
    der(1) = i1*2*temp;
    der(2) = 2*temp;

    return der;
}

// ----------------------------------------------------------------------------------------

int main()
{
    try
    {
        // randomly pick a set of parameters to use in this example
        const parameter_vector params = 10*randm(3,1);
        cout << "params: " << trans(params) << endl;


        // Now let's generate a bunch of input/output pairs according to our model.
        std::vector<std::pair<input_vector, double> > data_samples;
        input_vector input;
        for (int i = 0; i < 1000; ++i)
        {
            input = 10*randm(2,1);
            const double output = model(input, params);

            // save the pair
            data_samples.push_back(make_pair(input, output));
        }

        // Before we do anything, let's make sure that our derivative function defined above matches
        // the approximate derivative computed using central differences (via derivative()).  
        // If this value is big then it means we probably typed the derivative function incorrectly.
        cout << "derivative error: " << length(residual_derivative(data_samples[0], params) - 
                                               derivative(residual)(data_samples[0], params) ) << endl;





        // Now let's use the solve_least_squares_lm() routine to figure out what the
        // parameters are based on just the data_samples.
        parameter_vector x;
        x = 1;

        cout << "Use Levenberg-Marquardt" << endl;
        // Use the Levenberg-Marquardt method to determine the parameters which
        // minimize the sum of all squared residuals.
        solve_least_squares_lm(objective_delta_stop_strategy(1e-7).be_verbose(), 
                               residual,
                               residual_derivative,
                               data_samples,
                               x);

        // Now x contains the solution.  If everything worked it will be equal to params.
        cout << "inferred parameters: "<< trans(x) << endl;
        cout << "solution error:      "<< length(x - params) << endl;
        cout << endl;




        x = 1;
        cout << "Use Levenberg-Marquardt, approximate derivatives" << endl;
        // If we didn't create the residual_derivative function then we could
        // have used this method which numerically approximates the derivatives for you.
        solve_least_squares_lm(objective_delta_stop_strategy(1e-7).be_verbose(), 
                               residual,
                               derivative(residual),
                               data_samples,
                               x);

        // Now x contains the solution.  If everything worked it will be equal to params.
        cout << "inferred parameters: "<< trans(x) << endl;
        cout << "solution error:      "<< length(x - params) << endl;
        cout << endl;




        x = 1;
        cout << "Use Levenberg-Marquardt/quasi-newton hybrid" << endl;
        // This version of the solver uses a method which is appropriate for problems
        // where the residuals don't go to zero at the solution.  So in these cases
        // it may provide a better answer.
        solve_least_squares(objective_delta_stop_strategy(1e-7).be_verbose(), 
                            residual,
                            residual_derivative,
                            data_samples,
                            x);

        // Now x contains the solution.  If everything worked it will be equal to params.
        cout << "inferred parameters: "<< trans(x) << endl;
        cout << "solution error:      "<< length(x - params) << endl;

    }
    catch (std::exception& e)
    {
        cout << e.what() << endl;
    }
}

// Example output:
/*
params: 8.40188 3.94383 7.83099 

derivative error: 9.78267e-06
Use Levenberg-Marquardt
iteration: 0   objective: 2.14455e+10
iteration: 1   objective: 1.96248e+10
iteration: 2   objective: 1.39172e+10
iteration: 3   objective: 1.57036e+09
iteration: 4   objective: 2.66917e+07
iteration: 5   objective: 4741.9
iteration: 6   objective: 0.000238674
iteration: 7   objective: 7.8815e-19
iteration: 8   objective: 0
inferred parameters: 8.40188 3.94383 7.83099 

solution error:      0

Use Levenberg-Marquardt, approximate derivatives
iteration: 0   objective: 2.14455e+10
iteration: 1   objective: 1.96248e+10
iteration: 2   objective: 1.39172e+10
iteration: 3   objective: 1.57036e+09
iteration: 4   objective: 2.66917e+07
iteration: 5   objective: 4741.87
iteration: 6   objective: 0.000238701
iteration: 7   objective: 1.0571e-18
iteration: 8   objective: 4.12469e-22
inferred parameters: 8.40188 3.94383 7.83099 

solution error:      5.34754e-15

Use Levenberg-Marquardt/quasi-newton hybrid
iteration: 0   objective: 2.14455e+10
iteration: 1   objective: 1.96248e+10
iteration: 2   objective: 1.3917e+10
iteration: 3   objective: 1.5572e+09
iteration: 4   objective: 2.74139e+07
iteration: 5   objective: 5135.98
iteration: 6   objective: 0.000285539
iteration: 7   objective: 1.15441e-18
iteration: 8   objective: 3.38834e-23
inferred parameters: 8.40188 3.94383 7.83099 

solution error:      1.77636e-15
*/
