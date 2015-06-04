// The contents of this file are in the public domain. 
// See LICENSE_FOR_EXAMPLE_PROGRAMS.txt (in trunk/examples)
// Authors:
//   Gregory Sharp
//   Davis King


#include "regression.h"
#include "dlib/mlp.h"
#include "dlib/svm.h"
#include "option_range.h"
#include "dlib/string.h"
#include <cmath>
#include <cfloat>

using namespace dlib;
using namespace std;

// ----------------------------------------------------------------------------------------

static const char*
get_kernel (
    command_line_parser& parser
)
{
    const char* kernel = "rbk";
    if (parser.option ("k")) {
        kernel = parser.option("k").argument().c_str();
    }
    return kernel;
}

// ----------------------------------------------------------------------------------------

static void
get_rbk_gamma (
    command_line_parser& parser,
    std::vector<dense_sample_type>& dense_samples,
    option_range& range
) {
    float default_gamma = 3.0 / compute_mean_squared_distance (
        randomly_subsample (dense_samples, 2000));
    range.set_option (parser, "rbk-gamma", default_gamma);
}

// ----------------------------------------------------------------------------------------

static void
get_krls_tolerance (
    command_line_parser& parser,
    std::vector<dense_sample_type>& dense_samples, 
    option_range& range
)
{
    float default_krls_tolerance = 0.001;
    range.set_option (parser, "krls-tolerance", default_krls_tolerance);
}

// ----------------------------------------------------------------------------------------

static double
get_mlp_hidden_units (
    command_line_parser& parser,
    std::vector<dense_sample_type>& dense_samples
)
{
    int num_hidden = 5;
    if (parser.option ("mlp-hidden-units")) {
        num_hidden = sa = parser.option("mlp-hidden-units").argument();
    }
    return num_hidden;
}

// ----------------------------------------------------------------------------------------

static double
get_mlp_num_iterations (
    command_line_parser& parser,
    std::vector<dense_sample_type>& dense_samples
)
{
    int num_iterations = 5000;
    if (parser.option ("mlp-num-iterations")) {
        num_iterations = sa = parser.option("mlp-num-iterations").argument();
    }
    return num_iterations;
}

// ----------------------------------------------------------------------------------------

static void
get_svr_c (
    command_line_parser& parser,
    std::vector<dense_sample_type>& dense_samples, 
    option_range& range
)
{
    float default_svr_c = 1000.;
    range.set_option (parser, "svr-c", default_svr_c);
}

// ----------------------------------------------------------------------------------------

static double
get_svr_epsilon_insensitivity (
    command_line_parser& parser,
    std::vector<dense_sample_type>& dense_samples
)
{
    // Epsilon-insensitive regression means we do regression but stop 
    // trying to fit a data point once it is "close enough" to its 
    // target value.  This parameter is the value that controls what 
    // we mean by "close enough".  In this case, I'm saying I'm happy 
    // if the resulting regression function gets within 0.001 of the 
    // target value.
    double epsilon_insensitivity = 0.001;
    if (parser.option ("svr-epsilon-insensitivity")) {
        epsilon_insensitivity 
            = sa = parser.option("svr-epsilon-insensitivity").argument();
    }
    return epsilon_insensitivity;
}

// ----------------------------------------------------------------------------------------

void
krls_test (
    command_line_parser& parser,
    std::vector<dense_sample_type>& dense_samples,
    std::vector<double>& labels
)
{
    typedef radial_basis_kernel<dense_sample_type> kernel_type;
    option_range gamma_range, krls_tol_range;

    get_rbk_gamma (parser, dense_samples, gamma_range);
    get_krls_tolerance (parser, dense_samples, krls_tol_range);

    // Split into training set and testing set
    float training_pct = 0.8;
    unsigned int training_samples = (unsigned int) floor (
        training_pct * dense_samples.size());

    for (float krls_tol = krls_tol_range.get_min_value(); 
         krls_tol <= krls_tol_range.get_max_value();
         krls_tol = krls_tol_range.get_next_value (krls_tol))
    {
        for (float gamma = gamma_range.get_min_value(); 
             gamma <= gamma_range.get_max_value();
             gamma = gamma_range.get_next_value (gamma))
        {
            krls<kernel_type> net (kernel_type(gamma), krls_tol);

            // Krls doesn't seem to come with any batch training function
            for (unsigned int j = 0; j < training_samples; j++) {
                net.train (dense_samples[j], labels[j]);
            }

            // Test the performance (sorry, no cross-validation)
            double total_err = 0.0;
            for (unsigned int j = training_samples + 1; 
                 j < dense_samples.size(); j++)
            {
                double diff = net(dense_samples[j]) - labels[j];
                total_err += diff * diff;
            }

            double testset_error = total_err 
                / (dense_samples.size() - training_samples);
            printf ("%3.6f %3.6f %3.9f\n", krls_tol, gamma, testset_error);
        }
    }
}

// ----------------------------------------------------------------------------------------

static void
krr_rbk_test (
    command_line_parser& parser,
    std::vector<dense_sample_type>& dense_samples,
    std::vector<double>& labels
)
{
    typedef radial_basis_kernel<dense_sample_type> kernel_type;
    krr_trainer<kernel_type> trainer;
    option_range gamma_range;
    double best_gamma = DBL_MAX;
    float best_loo = FLT_MAX;

    get_rbk_gamma (parser, dense_samples, gamma_range);

    for (float gamma = gamma_range.get_min_value(); 
         gamma <= gamma_range.get_max_value();
         gamma = gamma_range.get_next_value (gamma))
    {
        // LOO cross validation
        std::vector<double> loo_values;

        if (parser.option("verbose")) {
            trainer.set_search_lambdas(logspace(-9, 4, 100));
            trainer.be_verbose();
        }
        trainer.set_kernel (kernel_type (gamma));
        trainer.train (dense_samples, labels, loo_values);
        const double loo_error = mean_squared_error(loo_values, labels);
        if (loo_error < best_loo) {
            best_loo = loo_error;
            best_gamma = gamma;
        }
        printf ("10^%f %9.6f\n", log10(gamma), loo_error);
    }

    printf ("Best result: gamma=10^%f (%g), loo_error=%9.6f\n",
            log10(best_gamma), best_gamma, best_loo);
    if (parser.option("train-best")) {
        printf ("Training network with best parameters\n");
        trainer.set_kernel (kernel_type (best_gamma));
        decision_function<kernel_type> best_network = 
            trainer.train (dense_samples, labels);

        std::ofstream fout (parser.option("train-best").argument().c_str(), 
                            std::ios::binary);
        serialize (best_network, fout);
        fout.close();
    }
}

// ----------------------------------------------------------------------------------------

static void
krr_lin_test (
    command_line_parser& parser,
    std::vector<dense_sample_type>& dense_samples,
    std::vector<double>& labels
)
{
    typedef linear_kernel<dense_sample_type> kernel_type;
    krr_trainer<kernel_type> trainer;

    // LOO cross validation
    std::vector<double> loo_values;
    trainer.train(dense_samples, labels, loo_values);
    const double loo_error = mean_squared_error(loo_values, labels);
    const double rs = r_squared(loo_values, labels);
    std::cout << "mean squared LOO error: " << loo_error << std::endl;
    std::cout << "R-Squared LOO: " << rs << std::endl;
}

// ----------------------------------------------------------------------------------------

void
krr_test (
    command_line_parser& parser,
    std::vector<dense_sample_type>& dense_samples,
    std::vector<double>& labels
)
{
    const char* kernel = get_kernel (parser);

    if (!strcmp (kernel, "lin")) {
        krr_lin_test (parser, dense_samples, labels);
    } else if (!strcmp (kernel, "rbk")) {
        krr_rbk_test (parser, dense_samples, labels);
    } else {
        fprintf (stderr, "Unknown kernel type: %s\n", kernel);
        exit (-1);
    }
}

// ----------------------------------------------------------------------------------------

void
mlp_test (
    command_line_parser& parser,
    std::vector<dense_sample_type>& dense_samples,
    std::vector<double>& labels
)
{
    // Create a multi-layer perceptron network.
    const int num_input = dense_samples[0].size();
    int num_hidden = get_mlp_hidden_units (parser, dense_samples);
    printf ("Creating ANN with size (%d, %d)\n", num_input, num_hidden);
    mlp::kernel_1a_c net (num_input, num_hidden);

    // Dlib barfs if output values are not normalized to [0,1]
    double label_min = *(std::min_element (labels.begin(), labels.end()));
    double label_max = *(std::max_element (labels.begin(), labels.end()));
    std::vector<double>::iterator it;
    for (it = labels.begin(); it != labels.end(); it++) {
        (*it) = ((*it) - label_min) / (label_max - label_min);
    }

    // Split into training set and testing set
    float training_pct = 0.8;
    unsigned int training_samples = (unsigned int) floor (
        training_pct * dense_samples.size());

    // Dlib doesn't seem to come with any batch training functions for mlp.
    // Also, note that only backprop is supported.
    int num_iterations = get_mlp_num_iterations (parser, dense_samples);
    for (int i = 0; i < num_iterations; i++) {
        for (unsigned int j = 0; j < training_samples; j++) {
            net.train (dense_samples[j], labels[j]);
        }
    }

    // Test the performance (sorry, no cross-validation) */
    double total_err = 0.0;
    for (unsigned int j = training_samples + 1; j < dense_samples.size(); j++)
    {
        double diff = net(dense_samples[j]) - labels[j];
        diff = diff * (label_max - label_min);
        total_err += diff * diff;
    }
    std::cout 
        << "MSE (no cross-validation): " 
            << total_err / (dense_samples.size() - training_samples) << std::endl;
}

// ----------------------------------------------------------------------------------------

void
svr_test (
    command_line_parser& parser,
    std::vector<dense_sample_type>& dense_samples,
    std::vector<double>& labels
)
{
    typedef radial_basis_kernel<dense_sample_type> kernel_type;
    svr_trainer<kernel_type> trainer;
    option_range gamma_range, svr_c_range;

    get_rbk_gamma (parser, dense_samples, gamma_range);
    get_svr_c (parser, dense_samples, svr_c_range);

    double epsilon_insensitivity = get_svr_epsilon_insensitivity (
        parser, dense_samples);
    trainer.set_epsilon_insensitivity (epsilon_insensitivity);

    for (float svr_c = svr_c_range.get_min_value(); 
         svr_c <= svr_c_range.get_max_value();
         svr_c = svr_c_range.get_next_value (svr_c))
    {
        trainer.set_c (svr_c);
        for (float gamma = gamma_range.get_min_value(); 
             gamma <= gamma_range.get_max_value();
             gamma = gamma_range.get_next_value (gamma))
        {
            cout << "test with svr-C: " << svr_c << "   gamma: "<< gamma << flush;
            matrix<double,1,2> cv;
            trainer.set_kernel (kernel_type (gamma));
            cv = cross_validate_regression_trainer (trainer, dense_samples, labels, 10);
            cout << "   10-fold-MSE:       "<< cv(0) << endl;
            cout << "   10-fold-R-Squared: "<< cv(1) << endl;
        }
    }
}

// ----------------------------------------------------------------------------------------

