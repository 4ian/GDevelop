// The contents of this file are in the public domain. 
// See LICENSE_FOR_EXAMPLE_PROGRAMS.txt (in trunk/examples)
// Authors:
//   Gregory Sharp
//   Davis King

/*
    This is a command line program that can try different regression 
    algorithms on a libsvm-formatted data set.
*/

#include "regression.h"

#include <iostream>
#include <map>
#include <vector>


#include "dlib/cmd_line_parser.h"
#include "dlib/data_io.h"
#include "dlib/svm.h"

using namespace dlib;

// ----------------------------------------------------------------------------------------

static void
parse_args (command_line_parser& parser, int argc, char* argv[])
{
    try {
        // Algorithm-independent options
        parser.add_option ("a",
                           "Choose the learning algorithm: {krls,krr,mlp,svr}.",1);
        parser.add_option ("h","Display this help message.");
        parser.add_option ("help","Display this help message.");
        parser.add_option ("k",
                           "Learning kernel (for krls,krr,svr methods): {lin,rbk}.",1);
        parser.add_option ("in","A libsvm-formatted file to test.",1);
        parser.add_option ("normalize",
                           "Normalize the sample inputs to zero-mean unit variance.");
        parser.add_option ("train-best",
                           "Train and save a network using best parameters", 1);

        parser.set_group_name("Algorithm Specific Options");
        // Algorithm-specific options
        parser.add_option ("rbk-gamma",
                           "Width of radial basis kernels: {float}.",1);
        parser.add_option ("krls-tolerance",
                           "Numerical tolerance of krls linear dependency test: {float}.",1);
        parser.add_option ("mlp-hidden-units",
                           "Number of hidden units in mlp: {integer}.",1);
        parser.add_option ("mlp-num-iterations",
                           "Number of epochs to train the mlp: {integer}.",1);
        parser.add_option ("svr-c",
                           "SVR regularization parameter \"C\": "
                           "{float}.",1);
        parser.add_option ("svr-epsilon-insensitivity",
                           "SVR fitting tolerance parameter: "
                           "{float}.",1);
        parser.add_option ("verbose", "Use verbose trainers");

        // Parse the command line arguments
        parser.parse(argc,argv);

        // Check that options aren't given multiple times
        const char* one_time_opts[] = {"a", "h", "help", "in"};
        parser.check_one_time_options(one_time_opts);

        const char* valid_kernels[] = {"lin", "rbk"};
        const char* valid_algs[]    = {"krls", "krr", "mlp", "svr"};
        parser.check_option_arg_range("a", valid_algs);
        parser.check_option_arg_range("k", valid_kernels);
        parser.check_option_arg_range("rbk-gamma", 1e-200, 1e200);
        parser.check_option_arg_range("krls-tolerance", 1e-200, 1e200);
        parser.check_option_arg_range("mlp-hidden-units", 1, 10000000);
        parser.check_option_arg_range("mlp-num-iterations", 1, 10000000);
        parser.check_option_arg_range("svr-c", 1e-200, 1e200);
        parser.check_option_arg_range("svr-epsilon-insensitivity", 1e-200, 1e200);

        // Check if the -h option was given
        if (parser.option("h") || parser.option("help")) {
            std::cout << "Usage: mltool [-a algorithm] --in input_file\n";
            parser.print_options(std::cout);
            std::cout << std::endl;
            exit (0);
        }

        // Check that an input file was given
        if (!parser.option("in")) {
            std::cout 
                << "Error in command line:\n"
                << "You must specify an input file with the --in option.\n"
                << "\nTry the -h option for more information\n";
            exit (0);
        }
    }
    catch (std::exception& e) {
        // Catch cmd_line_parse_error exceptions and print usage message.
        std::cout << e.what() << std::endl;
        exit (1);
    }
    catch (...) {
        std::cout << "Some error occurred" << std::endl;
    }
}

// ----------------------------------------------------------------------------------------

int 
main (int argc, char* argv[])
{
    command_line_parser parser;

    parse_args(parser, argc, argv);


    std::vector<sparse_sample_type> sparse_samples;
    std::vector<double> labels;

    load_libsvm_formatted_data (
        parser.option("in").argument(), 
        sparse_samples, 
        labels
    );

    if (sparse_samples.size() < 1) {
        std::cout 
            << "Sorry, I couldn't find any samples in your data set.\n"
            << "Aborting the operation.\n";
        exit (0);
    }

    std::vector<dense_sample_type> dense_samples;
    dense_samples = sparse_to_dense (sparse_samples);

    /* GCS FIX: The sparse_to_dense converter adds an extra column, 
       because libsvm files are indexed starting with "1". */
    std::cout 
        << "Loaded " << sparse_samples.size() << " samples"
        << std::endl
        << "Each sample has size " << sparse_samples[0].size() 
        << std::endl
        << "Each dense sample has size " << dense_samples[0].size() 
        << std::endl;

    // Normalize inputs to N(0,1)
    if (parser.option ("normalize")) {
        vector_normalizer<dense_sample_type> normalizer;
        normalizer.train (dense_samples);
        for (unsigned long i = 0; i < dense_samples.size(); ++i) {
            dense_samples[i] = normalizer (dense_samples[i]);
        }
    }

    // Randomize the order of the samples, labels
    randomize_samples (dense_samples, labels);

    const command_line_parser::option_type& option_alg = parser.option("a");
    if (!option_alg) {
        // Do KRR if user didn't specify an algorithm
        std::cout << "No algorithm specified, default to KRR\n";
        krr_test (parser, dense_samples, labels);
    }
    else if (option_alg.argument() == "krls") {
        krls_test (parser, dense_samples, labels);
    }
    else if (option_alg.argument() == "krr") {
        krr_test (parser, dense_samples, labels);
    }
    else if (option_alg.argument() == "mlp") {
        mlp_test (parser, dense_samples, labels);
    }
    else if (option_alg.argument() == "svr") {
        svr_test (parser, dense_samples, labels);
    }
    else {
        fprintf (stderr, 
                 "Error, algorithm \"%s\" is unknown.\n"
                 "Please use -h to see the command line options\n",
                 option_alg.argument().c_str());
        exit (-1);
    }
}

// ----------------------------------------------------------------------------------------

