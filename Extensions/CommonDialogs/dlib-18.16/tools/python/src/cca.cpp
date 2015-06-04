// Copyright (C) 2013  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.

#include <dlib/python.h>
#include <boost/shared_ptr.hpp>
#include <dlib/statistics.h>
#include <boost/python/args.hpp>

using namespace dlib;
using namespace boost::python;

typedef std::vector<std::pair<unsigned long,double> > sparse_vect;

struct cca_outputs
{
    matrix<double,0,1> correlations;
    matrix<double> Ltrans;
    matrix<double> Rtrans;
};

cca_outputs _cca1 (
    const std::vector<sparse_vect>& L,
    const std::vector<sparse_vect>& R,
    unsigned long num_correlations,
    unsigned long extra_rank,
    unsigned long q,
    double regularization
) 
{ 
    pyassert(num_correlations > 0 && L.size() > 0 && R.size() > 0 && L.size() == R.size() && regularization >= 0,
        "Invalid inputs");

    cca_outputs temp;
    temp.correlations = cca(L,R,temp.Ltrans,temp.Rtrans,num_correlations,extra_rank,q,regularization); 
    return temp;
}

// ----------------------------------------------------------------------------------------

unsigned long sparse_vector_max_index_plus_one (
    const sparse_vect& v
)
{
    return max_index_plus_one(v);
}

matrix<double,0,1> apply_cca_transform (
    const matrix<double>& m,
    const sparse_vect& v
)
{
    pyassert((long)max_index_plus_one(v) <= m.nr(), "Invalid Inputs");
    return sparse_matrix_vector_multiply(trans(m), v);
}

void bind_cca()
{
    class_<cca_outputs>("cca_outputs")
        .add_property("correlations", &cca_outputs::correlations)
        .add_property("Ltrans", &cca_outputs::Ltrans)
        .add_property("Rtrans", &cca_outputs::Rtrans);

    def("max_index_plus_one", sparse_vector_max_index_plus_one, arg("v"),
"ensures    \n\
    - returns the dimensionality of the given sparse vector.  That is, returns a    \n\
      number one larger than the maximum index value in the vector.  If the vector    \n\
      is empty then returns 0.   " 
    );


    def("apply_cca_transform", apply_cca_transform, (arg("m"), arg("v")),
"requires    \n\
    - max_index_plus_one(v) <= m.nr()    \n\
ensures    \n\
    - returns trans(m)*v    \n\
      (i.e. multiply m by the vector v and return the result)   " 
    );


    def("cca", _cca1, (arg("L"), arg("R"), arg("num_correlations"), arg("extra_rank")=5, arg("q")=2, arg("regularization")=0),
"requires    \n\
    - num_correlations > 0    \n\
    - len(L) > 0     \n\
    - len(R) > 0     \n\
    - len(L) == len(R)    \n\
    - regularization >= 0    \n\
    - L and R must be properly sorted sparse vectors.  This means they must list their  \n\
      elements in ascending index order and not contain duplicate index values.  You can use \n\
      make_sparse_vector() to ensure this is true.  \n\
ensures    \n\
    - This function performs a canonical correlation analysis between the vectors    \n\
      in L and R.  That is, it finds two transformation matrices, Ltrans and    \n\
      Rtrans, such that row vectors in the transformed matrices L*Ltrans and    \n\
      R*Rtrans are as correlated as possible (note that in this notation we    \n\
      interpret L as a matrix with the input vectors in its rows).  Note also that    \n\
      this function tries to find transformations which produce num_correlations    \n\
      dimensional output vectors.    \n\
    - Note that you can easily apply the transformation to a vector using     \n\
      apply_cca_transform().  So for example, like this:     \n\
        - apply_cca_transform(Ltrans, some_sparse_vector)    \n\
    - returns a structure containing the Ltrans and Rtrans transformation matrices    \n\
      as well as the estimated correlations between elements of the transformed    \n\
      vectors.    \n\
    - This function assumes the data vectors in L and R have already been centered    \n\
      (i.e. we assume the vectors have zero means).  However, in many cases it is    \n\
      fine to use uncentered data with cca().  But if it is important for your    \n\
      problem then you should center your data before passing it to cca().   \n\
    - This function works with reduced rank approximations of the L and R matrices.    \n\
      This makes it fast when working with large matrices.  In particular, we use    \n\
      the dlib::svd_fast() routine to find reduced rank representations of the input    \n\
      matrices by calling it as follows: svd_fast(L, U,D,V, num_correlations+extra_rank, q)     \n\
      and similarly for R.  This means that you can use the extra_rank and q    \n\
      arguments to cca() to influence the accuracy of the reduced rank    \n\
      approximation.  However, the default values should work fine for most    \n\
      problems.    \n\
    - The dimensions of the output vectors produced by L*#Ltrans or R*#Rtrans are \n\
      ordered such that the dimensions with the highest correlations come first. \n\
      That is, after applying the transforms produced by cca() to a set of vectors \n\
      you will find that dimension 0 has the highest correlation, then dimension 1 \n\
      has the next highest, and so on.  This also means that the list of estimated \n\
      correlations returned from cca() will always be listed in decreasing order. \n\
    - This function performs the ridge regression version of Canonical Correlation    \n\
      Analysis when regularization is set to a value > 0.  In particular, larger    \n\
      values indicate the solution should be more heavily regularized.  This can be    \n\
      useful when the dimensionality of the data is larger than the number of    \n\
      samples.    \n\
    - A good discussion of CCA can be found in the paper \"Canonical Correlation    \n\
      Analysis\" by David Weenink.  In particular, this function is implemented    \n\
      using equations 29 and 30 from his paper.  We also use the idea of doing CCA    \n\
      on a reduced rank approximation of L and R as suggested by Paramveer S.    \n\
      Dhillon in his paper \"Two Step CCA: A new spectral method for estimating    \n\
      vector models of words\".   " 
        
        );
}



