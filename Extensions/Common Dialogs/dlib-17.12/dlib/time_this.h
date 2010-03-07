// Copyright (C) 2003  Davis E. King (davisking@users.sourceforge.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#ifndef DLIB_TIME_THIs_
#define DLIB_TIME_THIs_


#include "platform.h"



#ifndef WIN32

#include <sys/times.h>
#include <limits.h>
#include <unistd.h>
#include <iostream>
// ----------------------------------------------------------------------------------------

#define TIME_THIS_TO(op,out)                                                        \
    {                                                                               \
        clock_t start, end;                                                         \
        tms timesbuf;                                                               \
        start = times(&timesbuf);                                                   \
        op;                                                                         \
        end = times(&timesbuf);                                                     \
        long ticks = sysconf(_SC_CLK_TCK);                                          \
        if ((double)(end-start)/(double)ticks < 1)                                  \
        {                                                                           \
            out << "\ntime: "                                                       \
            << (int)(1000*((double)(end-start)/(double)ticks)) << "ms\n";           \
        }                                                                           \
        else                                                                        \
        {                                                                           \
            out << "\ntime: "                                                       \
                      << (double)(end-start)/(double)ticks << "sec\n";              \
        }                                                                           \
    }                                                                               \


#define TIME_THIS(op)  TIME_THIS_TO(op,std::cout)

// ----------------------------------------------------------------------------------------


#endif

#ifdef WIN32

#include "windows_magic.h"
#include <windows.h>    // for GetTickCount()
#include <iostream>

// ----------------------------------------------------------------------------------------

#define TIME_THIS_TO(op,out)                                                        \
    {                                                                               \
        unsigned long count = GetTickCount();                                       \
        op;                                                                         \
        count = GetTickCount() - count;                                             \
        if (count < 1000)                                                           \
        {                                                                           \
            out << "\ntime: " << count << "ms\n";                                   \
        }                                                                           \
        else                                                                        \
        {                                                                           \
            out << "\ntime: " << static_cast<double>(count)/1000 << "sec\n";        \
        }                                                                           \
    }                                                                               \

#define TIME_THIS(op) TIME_THIS_TO(op,std::cout)

// ----------------------------------------------------------------------------------------

#endif

#endif // DLIB_TIME_THIs_
