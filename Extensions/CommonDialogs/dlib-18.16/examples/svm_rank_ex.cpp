// The contents of this file are in the public domain. See LICENSE_FOR_EXAMPLE_PROGRAMS.txt
/*

    This is an example illustrating the use of the SVM-Rank tool from the dlib
    C++ Library.  This is a tool useful for learning to rank objects.  For
    example, you might use it to learn to rank web pages in response to a
    user's query.  The idea being to rank the most relevant pages higher than
    non-relevant pages.


    In this example, we will create a simple test dataset and show how to learn
    a ranking function from it.  The purpose of the function will be to give
    "relevant" objects higher scores than "non-relevant" objects.  The idea is
    that you use this score to order the objects so that the most relevant
    objects come to the top of the ranked list.
    


    Note that we use dense vectors (i.e. dlib::matrix objects) in this example,
    however, the ranking tools can also use sparse vectors as well.  See
    svm_sparse_ex.cpp for an example.
*/

#include <dlib/svm.h>
#include <iostream>


using namespace std;
using namespace dlib;


int main()
{
    try
    {
        // Make a typedef for the kind of object we will be ranking.  In this
        // example, we are ranking 2-dimensional vectors.  
        typedef matrix<double,2,1> sample_type;


        // Now let's make some testing data.  To make it really simple, let's
        // suppose that vectors with positive values in the first dimension
        // should rank higher than other vectors.  So what we do is make
        // examples of relevant (i.e. high ranking) and non-relevant (i.e. low
        // ranking) vectors and store them into a ranking_pair object like so:
        ranking_pair<sample_type> data;
        sample_type samp;

        // Make one relevant example.
        samp = 1, 0; 
        data.relevant.push_back(samp);

        // Now make a non-relevant example.
        samp = 0, 1; 
        data.nonrelevant.push_back(samp);


        // Now that we have some data, we can use a machine learning method to
        // learn a function that will give high scores to the relevant vectors
        // and low scores to the non-relevant vectors.

        // The first thing we do is select the kernel we want to use.  For the
        // svm_rank_trainer there are only two options.  The linear_kernel and
        // sparse_linear_kernel.  The later is used if you want to use sparse
        // vectors to represent your objects.  Since we are using dense vectors
        // (i.e. dlib::matrix objects to represent the vectors) we use the
        // linear_kernel.
        typedef linear_kernel<sample_type> kernel_type;

        // Now make a trainer and tell it to learn a ranking function based on
        // our data.
        svm_rank_trainer<kernel_type> trainer;
        decision_function<kernel_type> rank = trainer.train(data);

        // Now if you call rank on a vector it will output a ranking score.  In
        // particular, the ranking score for relevant vectors should be larger
        // than the score for non-relevant vectors.  
        cout << "ranking score for a relevant vector:     " << rank(data.relevant[0]) << endl;
        cout << "ranking score for a non-relevant vector: " << rank(data.nonrelevant[0]) << endl;
        // These output the following:
        /*
            ranking score for a relevant vector:     0.5
            ranking score for a non-relevant vector: -0.5
        */


        // If we want an overall measure of ranking accuracy we can compute the
        // ordering accuracy and mean average precision values by calling
        // test_ranking_function().  In this case, the ordering accuracy tells
        // us how often a non-relevant vector was ranked ahead of a relevant
        // vector.  This function will return a 1 by 2 matrix containing these
        // measures.  In this case, it returns 1 1 indicating that the rank
        // function outputs a perfect ranking.
        cout << "testing (ordering accuracy, mean average precision): " << test_ranking_function(rank, data) << endl;

        // We can also see the ranking weights:
        cout << "learned ranking weights: \n" << rank.basis_vectors(0) << endl;
        // In this case they are:
        //  0.5 
        // -0.5 





        // In the above example, our data contains just two sets of objects.
        // The relevant set and non-relevant set.  The trainer is attempting to
        // find a ranking function that gives every relevant vector a higher
        // score than every non-relevant vector.  Sometimes what you want to do
        // is a little more complex than this. 
        //
        // For example, in the web page ranking example we have to rank pages
        // based on a user's query.  In this case, each query will have its own
        // set of relevant and non-relevant documents.  What might be relevant
        // to one query may well be non-relevant to another.  So in this case
        // we don't have a single global set of relevant web pages and another
        // set of non-relevant web pages.  
        //
        // To handle cases like this, we can simply give multiple ranking_pair
        // instances to the trainer.  Therefore, each ranking_pair would
        // represent the relevant/non-relevant sets for a particular query.  An
        // example is shown below (for simplicity, we reuse our data from above
        // to make 4 identical "queries").

        std::vector<ranking_pair<sample_type> > queries;
        queries.push_back(data);
        queries.push_back(data);
        queries.push_back(data);
        queries.push_back(data);

        // We train just as before.  
        rank = trainer.train(queries);


        // Now that we have multiple ranking_pair instances, we can also use
        // cross_validate_ranking_trainer().  This performs cross-validation by
        // splitting the queries up into folds.  That is, it lets the trainer
        // train on a subset of ranking_pair instances and tests on the rest.
        // It does this over 4 different splits and returns the overall ranking
        // accuracy based on the held out data.  Just like test_ranking_function(),
        // it reports both the ordering accuracy and mean average precision.
        cout << "cross-validation (ordering accuracy, mean average precision): " 
             << cross_validate_ranking_trainer(trainer, queries, 4) << endl;

    }
    catch (std::exception& e)
    {
        cout << e.what() << endl;
    }
} 

