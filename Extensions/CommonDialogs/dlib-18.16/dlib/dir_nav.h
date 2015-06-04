// Copyright (C) 2003  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#ifndef DLIB_DIR_NAv_
#define DLIB_DIR_NAv_


#include "platform.h"


#ifdef WIN32
#include "dir_nav/windows.h"
#endif

#ifndef WIN32
#include "dir_nav/posix.h"
#endif

#include "dir_nav/dir_nav_extensions.h"

#endif // DLIB_DIR_NAv_

