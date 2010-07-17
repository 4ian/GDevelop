/****************************************************************************
  
  GLUI User Interface Toolkit
  ---------------------------

     glui.cpp


          --------------------------------------------------

  Copyright (c) 1998 Paul Rademacher (this file, Bill Baxter 2005)

  This library is free software; you can redistribute it and/or modify
  it under the terms of the GNU Lesser General Public License as
  published by the Free Software Foundation; either version 2.1 of the
  License, or (at your option) any later version.

  This library is distributed in the hope that it will be useful, but
  WITHOUT ANY WARRANTY; without even the implied warranty of
  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
  Lesser General Public License for more details.

  You should have received a copy of the GNU Lesser General Public
  License along with this library; if not, write to the Free Software
  Foundation, Inc., 59 Temple Place, Suite 330, Boston, MA 02111-1307
  USA

  This program is -not- in the public domain.

*****************************************************************************/

#include "GL/glui.h"
#include <stdarg.h>

#ifdef _MSC_VER
#define vsnprintf _vsnprintf
#endif

GLUI_String& glui_format_str(GLUI_String& str, const char* fmt, ...)
{
  const size_t ISIZE = 128;
  char stackbuf[ISIZE];
  size_t bufsz = ISIZE;
  char *buf = stackbuf;
  str = "";
  va_list arg;
  while (1) {
    va_start(arg, fmt);
    int ret = vsnprintf(buf,299,fmt,arg);
    va_end(arg);
    if (ret>=0) {
      break;
    }
    // else make a bigger buf, try again
    bufsz <<= 1;
    if (buf==stackbuf) buf = (char*)malloc(sizeof(char)*bufsz);
    else buf = (char*)realloc(buf, sizeof(char)*bufsz);
  }
  if (buf!=stackbuf) free(buf);
  str=buf;
  return str;
}
