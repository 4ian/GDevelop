// Copyright (C) 2003  Davis E. King (davis@dlib.net)
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

#define TIME_THIS_TO(_tt_op,_tt_out)                                                        \
    {                                                                                       \
        clock_t _tt_start, _tt_end;                                                         \
        tms _tt_timesbuf;                                                                   \
        _tt_start = times(&_tt_timesbuf);                                                   \
        _tt_op;                                                                             \
        _tt_end = times(&_tt_timesbuf);                                                     \
        long _tt_ticks = sysconf(_SC_CLK_TCK);                                              \
        if ((double)(_tt_end-_tt_start)/(double)_tt_ticks < 1)                              \
        {                                                                                   \
            _tt_out << "\ntime: "                                                           \
            << (int)(1000*((double)(_tt_end-_tt_start)/(double)_tt_ticks)) << "ms\n";       \
        }                                                                                   \
        else                                                                                \
        {                                                                                   \
            _tt_out << "\ntime: "                                                           \
                      << (double)(_tt_end-_tt_start)/(double)_tt_ticks << "sec\n";          \
        }                                                                                   \
    }                                                                                       \


#define TIME_THIS(_tt_op)  TIME_THIS_TO(_tt_op,std::cout)

// ----------------------------------------------------------------------------------------


#endif

#ifdef WIN32

#include "windows_magic.h"
#include <windows.h>    // for GetTickCount()
#include <iostream>

// ----------------------------------------------------------------------------------------

#define TIME_THIS_TO(_tt_op,_tt_out)                                                        \
    {                                                                                       \
        unsigned long _tt_count = GetTickCount();                                           \
        _tt_op;                                                                             \
        _tt_count = GetTickCount() - _tt_count;                                             \
        if (_tt_count < 1000)                                                               \
        {                                                                                   \
            _tt_out << "\ntime: " << _tt_count << "ms\n";                                   \
        }                                                                                   \
        else                                                                                \
        {                                                                                   \
            _tt_out << "\ntime: " << static_cast<double>(_tt_count)/1000 << "sec\n";        \
        }                                                                                   \
    }                                                                                       \

#define TIME_THIS(_tt_op) TIME_THIS_TO(_tt_op,std::cout)

// ----------------------------------------------------------------------------------------

#endif

#endif // DLIB_TIME_THIs_

