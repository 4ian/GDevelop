// Copyright (C) 2010  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#ifndef DLIB_CBLAS_CONSTAnTS_Hh_
#define DLIB_CBLAS_CONSTAnTS_Hh_

namespace dlib
{
    namespace blas_bindings
    {
        enum CBLAS_ORDER {CblasRowMajor=101, CblasColMajor=102};
        enum CBLAS_TRANSPOSE {CblasNoTrans=111, CblasTrans=112, CblasConjTrans=113};
        enum CBLAS_UPLO {CblasUpper=121, CblasLower=122};
        enum CBLAS_DIAG {CblasNonUnit=131, CblasUnit=132};
        enum CBLAS_SIDE {CblasLeft=141, CblasRight=142};

    }
}

#endif // DLIB_CBLAS_CONSTAnTS_Hh_

