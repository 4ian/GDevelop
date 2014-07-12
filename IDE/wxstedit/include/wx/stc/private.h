////////////////////////////////////////////////////////////////////////////
// Name:        wx/stc/private.h
// Purpose:     Private declarations for wxSTC
// Author:      Robin Dunn
// Created:     2007-07-15
// Copyright:   (c) 2000 by Total Control Software
// Licence:     wxWindows licence
/////////////////////////////////////////////////////////////////////////////

#ifndef _WX_STC_PRIVATE_H_
#define _WX_STC_PRIVATE_H_

#include "wx/defs.h"
#include "wx/string.h"

//----------------------------------------------------------------------
// Utility functions used within wxSTC

#if wxUSE_UNICODE

extern wxString stc2wx(const char* str);
extern wxString stc2wx(const char* str, size_t len);
extern wxCharBuffer wx2stc(const wxString& str);

// This function takes both wxString and wxCharBuffer because it uses either
// one or the other of them depending on the build mode. In Unicode it uses the
// length of the already converted buffer to avoid doing the conversion again
// just to compute the length.
inline size_t wx2stclen(const wxString& WXUNUSED(str), const wxCharBuffer& buf)
{
    return buf.length() - 1;
}

#else // not UNICODE

inline wxString stc2wx(const char* str) {
    return wxString(str);
}
inline wxString stc2wx(const char* str, size_t len) {
    return wxString(str, len);
}
inline const char* wx2stc(const wxString& str) {
    return str.mbc_str();
}

// As explained above, the buffer argument is only used in Unicode build.
inline size_t wx2stclen(const wxString& str, const char* WXUNUSED(buf))
{
    return str.length();
}

#endif // UNICODE

#endif // _WX_STC_PRIVATE_H_
