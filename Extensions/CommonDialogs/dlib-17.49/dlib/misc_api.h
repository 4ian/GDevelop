// Copyright (C) 2004  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.

#ifndef DLIB_MISC_APi_
#define DLIB_MISC_APi_

#include "platform.h"

#ifdef WIN32
#include "misc_api/windows.h"
#endif

#ifndef WIN32
#include "misc_api/posix.h"
#endif

#endif // DLIB_MISC_APi_

