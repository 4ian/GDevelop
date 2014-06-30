// Copyright (C) 2011  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#ifndef DLIB_CREATE_IRIS_DAtAFILE_H__
#define DLIB_CREATE_IRIS_DAtAFILE_H__

namespace dlib
{
    void create_iris_datafile (
    );
    /*!
        ensures
            - Creates a local file called iris.scale that contains the
              150 samples from the 3-class Iris dataset from the UCI
              repository.  The file will be in LIBSVM format (it was
              originally downloaded from the LIBSVM website).
    !*/
}

#endif // DLIB_CREATE_IRIS_DAtAFILE_H__
