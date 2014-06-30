// Copyright (C) 2010  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#undef DLIB_LIBSVM_iO_ABSTRACT_H__
#ifdef DLIB_LIBSVM_iO_ABSTRACT_H__

#include <fstream>
#include <string>
#include <utility>
#include "../algs.h"
#include "../matrix.h"
#include <vector>

namespace dlib
{
    struct sample_data_io_error : public error
    {
        /*!
            This is the exception class used by the file IO functions defined below.
        !*/
    };

// ----------------------------------------------------------------------------------------

    template <
        typename sample_type, 
        typename label_type, 
        typename alloc1, 
        typename alloc2
        >
    void load_libsvm_formatted_data (
        const std::string& file_name,
        std::vector<sample_type, alloc1>& samples,
        std::vector<label_type, alloc2>& labels
    );
    /*!
        requires
            - sample_type must be an STL container
            - sample_type::value_type == std::pair<T,U> where T is some kind of 
              unsigned integral type
        ensures
            - attempts to read a file of the given name that should contain libsvm
              formatted data.  We turn the data into sparse vectors and store it
              in samples
            - #labels.size() == #samples.size()
            - for all valid i: #labels[i] is the label for #samples[i]
        throws
            - sample_data_io_error
                This exception is thrown if there is any problem loading data from file
    !*/

// ----------------------------------------------------------------------------------------

    template <
        typename sample_type,
        typename label_type,
        typename alloc1,
        typename alloc2
        >
    void save_libsvm_formatted_data (
        const std::string& file_name,
        const std::vector<sample_type, alloc1>& samples,
        const std::vector<label_type, alloc2>& labels
    );
    /*!
        requires
            - sample_type must be an STL container
            - sample_type::value_type == std::pair<T,U> where T is some kind of 
              unsigned integral type
            - samples.size() == labels.size()
        ensures
            - saves the data to the given file in libsvm format
        throws
            - sample_data_io_error
                This exception is thrown if there is any problem saving data to file
    !*/

// ----------------------------------------------------------------------------------------

    template <
        typename sample_type, 
        typename label_type, 
        typename alloc1, 
        typename alloc2
        >
    void save_libsvm_formatted_data (
        const std::string& file_name,
        const std::vector<sample_type, alloc1>& samples,
        const std::vector<label_type, alloc2>& labels
    );
    /*!
        requires
            - sample_type == a dense matrix (i.e. dlib::matrix)
            - for all valid i: is_vector(samples[i]) == true
            - samples.size() == labels.size()
        ensures
            - saves the data to the given file in libsvm format
        throws
            - sample_data_io_error
                This exception is thrown if there is any problem saving data to file
    !*/

// ----------------------------------------------------------------------------------------

    template <typename sample_type, typename alloc>
    void fix_nonzero_indexing (
        std::vector<sample_type,alloc>& samples
    );
    /*!
        requires
            - samples must only contain valid sparse vectors.  The definition of
              a sparse vector can be found at the top of dlib/svm/sparse_vector_abstract.h
        ensures
            - Adjusts the sparse vectors in samples so that they are zero-indexed.  
              Or in other words, assume the smallest used index value in any of the sparse 
              vectors is N.  Then this function subtracts N from all the index values in 
              samples.  This is useful, for example, if you load a libsvm formatted datafile 
              with features indexed from 1 rather than 0 and you would like to fix this.
    !*/

// ----------------------------------------------------------------------------------------

}

#endif // DLIB_LIBSVM_iO_ABSTRACT_H__

