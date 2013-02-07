// Copyright (C) 2003  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#ifndef DLIB_SOCKETs_
#define DLIB_SOCKETs_

#include "platform.h"


#ifdef WIN32
#include "sockets/windows.h"
#endif

#ifndef WIN32
#include "sockets/posix.h"
#endif

#include "sockets/sockets_extensions.h"

#endif // DLIB_SOCKETs_

