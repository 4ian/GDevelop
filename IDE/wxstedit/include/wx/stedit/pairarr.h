///////////////////////////////////////////////////////////////////////////////
// Name:        pairarr.h
// Purpose:     Sorted Key/Value pairs of wxArrays using a binary search lookup
// Author:      John Labenski
// Modified by:
// Created:     1/08/2004
// RCS-ID:
// Copyright:   (c) John Labenski
// Licence:     wxWidgets licence
///////////////////////////////////////////////////////////////////////////////

#ifndef __WX_PAIRARR_H__
#define __WX_PAIRARR_H__

// Note: there is no cpp file as all the code is contained in these macros.

#include "wx/dynarray.h"

// ============================================================================
// Provides macros for creating your own (key, value) pair arrays using a binary
// search to insert/retrieve values using a key. While this doesn't have the
// performance of a good hash table O(n), it is smaller and with a lookup speed
// O(log(n)) is suitable for some applications. You can use virtually any
// class for keys and values that can be put into wxArrays so long as they
// define the standard comparison operators ==, <, >, <=, >=.
//
// Implementation note: I've chosen to use two independent arrays instead of
// a single array of a data struct with (key, value) members to squeeze out the
// slightest increase in performance. My testing using a single class with
// key, value members and a wxSortedArray can be either as much as 2x faster
// for (int, int), but more than 2x slower for (int, bigclass).
// ----------------------------------------------------------------------------
// DECLARE_PAIRARRAY(Tkey, TkeyArray, Tval, TvalArray, name, classexp)
// DEFINE_PAIRARRAY(Tkey, Tval, name)
//   Tkey must have the operators =, ==, <, >, <=, >=
//     They'll be sorted by using the <, >, <=, >= operators
//   Tval must have a default constructor and be able to be passed as const Tval& val
//   You must have created wx(Object)Arrays of Tkey with name TkeyArray
//     and of Tval named TvalArray, for example wxArrayInt and wxArrayString
//
// Creates a class named "name" that manages the TkeyArray, TvalArray data.
//   It keeps the pairs sorted in order of Tkey and uses a binary search
//   to retrieve and set the values.
//
// ----------------------------------------------------------------------------
// DECLARE_PAIRARRAY_NUMKEY(Tkey, TkeyArray, Tval, TvalArray, name, classexp)
// DEFINE_PAIRARRAY_NUMKEY(Tkey, Tval, name)
//   This requires that Tkey has the operators +, -. It probably only makes
//   sense if they're numbers like int, long, float, double...
//   UpdatePos(Tkey pos, Tkey numpos) is added for inserting if num > 0 or
//     deleting if num < 0, the remaining keys above pos are shifted either
//     upwards or downwards by numpos.
//
// ----------------------------------------------------------------------------
// DECLARE_PAIRARRAY_INTKEY(Tval, TvalArray, name, classexp)
// DEFINE_PAIRARRAY_INTKEY(Tval, name)
//   Simple defs for when Tkey is an int (wxArrayInt), Tval may be anything.
//   UpdatePos(int pos, int numpos) is added for inserting if num > 0 or
//     deleting if num < 0, the remaining keys above pos are shifted either
//     upwards or downwards by numpos.
//
// ----------------------------------------------------------------------------
// name() - default constructor
// name(const Tval& defaultVal) - initialize the class with the default value,
//     see Get/SetDefaultValue to change it later.
// name(const name& other) - full copy constructor
// name(Tkey key, const Tval& val) - create with the first pair
// size_t GetCount() - get the number of pairs
// int Index(Tkey) - find this key returning position in pair array or wxNOT_FOUND
// size_t IndexForInsert(Tkey) - find array position to insert key at, returns
//     GetCount for append (check first in case count=0), the pos to insert
//     before, or the pos with existing key  (see Add for code)
// bool HasKey(Tkey) - does this key exist
// Tval& GetValue(Tkey) - get the value for this key or it it doesn't exist
//     the default value, see also Get/SetDefaultValue.
// Tval& GetOrCreateValue(Tkey key) - get or create a GetDefaultValue() value
//     for this key returning the created value that you can set.
// bool Add(Tkey, Tval) - set the Tval for this Tkey, replacing if exists
//                        returns true if the pair didn't previously exist
// bool Remove(Tkey) - remove pair with this Tkey, returns if it existed
// void RemoveAt(index) - remove the key and value at this array index
// void Clear() - clears the pair arrays
// const Tval& ItemValue(index) const - get the Tval at this array index
// const Tkey& ItemKey(index) const - get the Tkey at this array index
// Tval& ItemValue(index) - get the Tval at this array index
// Tkey& ItemKey(index) - get the Tkey at this array index
// TvalArray& GetValues() - get the TvalArray
// TkeyArray& GetKeys() - get the TkeyArray (don't unsort them)
// const Tval& GetDefaultValue() const - get the default value to return for
//   GetValue(Tkey) when the key doesn't exist. (inits to Tval())
// void SetDefaultValue(const Tval& val) - set the default value to return for
//   GetValue(Tkey) when the key doesn't exist. If your values don't have a
//   default constructor (eg. ints) you'll want to set this.
// void Copy(const name& other) - make full copy of other
// void Sort() - sort the pairs by the keys (only necessary if you want to
//   quickly add unorderered pairs using GetKeys().Add(x); GetValues().Add(x);)
//   You MUST keep them sorted for the lookup mechanism to work.
// name& operator=(const name& other) - make full copy of other
// Tval& operator[](size_t index) - get the value at this array index
// const Tval& operator[](size_t index) const - get the value at this array index
//
// ----------------------------------------------------------------------------
// DECLARE_PAIRARRAY_NUMKEY and DECLARE_PAIRARRAY_INTKEY - added function
// bool UpdatePos(int pos, int numPos) -
//   if numPos > 0 - shifts keys greater than pos by numPos
//   if numPos < 0 - deletes keys between pos and pos-numPos,
//     shifts keys greater than by pos-numPos by -numPos
//
// ============================================================================
// Examples:
//
// 1.) For string arrays you'll write this in the header
// DECLARE_PAIRARRAY(wxString, wxArrayString, wxString, wxArrayString,
//                   wxPairArrayStringString, class WXDLLIMPEXP_ADV)
// And this code in some cpp file.
// DEFINE_PAIRARRAY(wxString, wxString, wxPairArrayStringString)
//
// ----------------------------------------------------------------------------
// 2.) For int keys and wxString values, it's simpler, in your header
// DECLARE_PAIRARRAY_INTKEY(wxString, wxArrayString,
//                          wxPairArrayIntSheetString, class WXDLLIMPEXP_ADV)
//
// You can even make nested pair arrays, 2D arrays (wxSheetStringSparseTable)
// WX_DECLARE_OBJARRAY_WITH_DECL(wxPairArrayIntSheetString,
//                               wxArrayPairArrayIntSheetString,
//                               class WXDLLIMPEXP_ADV);
// DECLARE_PAIRARRAY_INTKEY(wxPairArrayIntSheetString, wxArrayPairArrayIntSheetString,
//                          wxPairArrayIntPairArraySheetString, class WXDLLIMPEXP_ADV)
//
// Then in some source file have
// DEFINE_PAIRARRAY_INTKEY(wxString, wxPairArrayIntSheetString)
// DEFINE_PAIRARRAY_INTKEY(wxPairArrayIntSheetString,
//                         wxPairArrayIntPairArraySheetString)
//
// ----------------------------------------------------------------------------
// 3.) For arbitrary "number" type arrays that will use the UpdatePos function
//
// Create your own "number" array, lets use double
// WX_DEFINE_USER_EXPORTED_ARRAY_DOUBLE(double, wxArrayDouble, class WXDLLIMPEXP_PLOTLIB)
// Now declare the pair array in a header file
// DECLARE_PAIRARRAY_NUMKEY( double, wxArrayDouble, wxString, wxArrayString,
//                           wxPairArrayDoubleString, class );
// and define the code for it in a source file
// DEFINE_PAIRARRAY_NUMKEY(double, wxString, wxPairArrayDoubleString);
// wxPairArrayDoubleString pairDblStr;
//
// ============================================================================

#define DECLARE_PAIRARRAY_BASE(Tkey, TkeyArray, Tval, TvalArray, name, classexp) \
\
classexp name                                                                \
{                                                                            \
public:                                                                      \
    name() {}                                                                \
    name(const Tval& defaultVal) : m_defaultValue(defaultVal) {}             \
    name(const name& other) { Copy(other); }                                 \
    name(const Tkey& key, const Tval& val) { m_keys.Add(key); m_values.Add(val); } \
    size_t GetCount() const { return m_keys.GetCount(); }                    \
    int Index(const Tkey& key) const;                                        \
    size_t IndexForInsert(const Tkey& pos) const;                            \
    bool HasKey(const Tkey& key) const { return Index(key) != wxNOT_FOUND; } \
    const Tval& GetValue(const Tkey& key) const;                             \
    Tval& GetValue(const Tkey& key);                                         \
    Tval& GetOrCreateValue(const Tkey& key);                                 \
    const Tval& ItemValue(size_t index) const { return m_values[index]; }    \
    const Tkey& ItemKey(size_t index)   const { return m_keys[index]; }      \
    Tval& ItemValue(size_t index) { return m_values[index]; }                \
    Tkey& ItemKey(size_t index)   { return m_keys[index]; }                  \
    bool Add(const Tkey& key, const Tval& value);                            \
    bool Remove(const Tkey& key);                                            \
    void RemoveAt(size_t index) { m_keys.RemoveAt(index); m_values.RemoveAt(index); } \
    void Clear() { m_keys.Clear(); m_values.Clear(); }                       \
    const TvalArray& GetValues() const { return m_values; }                  \
    const TkeyArray& GetKeys()   const { return m_keys; }                    \
    TvalArray& GetValues() { return m_values; }                              \
    TkeyArray& GetKeys()   { return m_keys; }                                \
    const Tval& GetDefaultValue() const { return m_defaultValue; }           \
    void SetDefaultValue(const Tval& val) { m_defaultValue = val; }          \
    void Copy(const name& other);                                            \
    bool IsEqualTo(const name& other) const;                                 \
    void Sort() { if (GetCount() > 1) q_sort(0, GetCount()-1); }             \
    name& operator=(const name& other) { Copy(other); return *this; }        \
    bool operator==(const name& other) const { return IsEqualTo(other); }    \
    bool operator!=(const name& other) const { return !IsEqualTo(other); }   \
    Tval& operator[](size_t index) { return ItemValue(index); }              \
    const Tval& operator[](size_t index) const { return ItemValue(index); }  \
protected :                                                                  \
    void q_sort(int left, int right);                                        \
    TkeyArray m_keys;                                                        \
    TvalArray m_values;                                                      \
    Tval m_defaultValue;

// ----------------------------------------------------------------------------
// Note: The above macros is incomplete to allow you to extend the class.

#define DECLARE_PAIRARRAY(Tkey, TkeyArray, Tval, TvalArray, name, classexp) \
DECLARE_PAIRARRAY_BASE(Tkey, TkeyArray, Tval, TvalArray, name, classexp)    \
};

#define DECLARE_PAIRARRAY_NUMKEY_BASE(Tkey, TkeyArray, Tval, TvalArray, name, classexp) \
DECLARE_PAIRARRAY_BASE(Tkey, TkeyArray, Tval, TvalArray, name, classexp) \
public: \
    bool UpdatePos( Tkey pos, Tkey numPos );

#define DECLARE_PAIRARRAY_NUMKEY(Tkey, TkeyArray, Tval, TvalArray, name, classexp) \
DECLARE_PAIRARRAY_NUMKEY_BASE(Tkey, TkeyArray, Tval, TvalArray, name, classexp)    \
};

#define DECLARE_PAIRARRAY_INTKEY(Tval, TvalArray, name, classexp) \
DECLARE_PAIRARRAY_NUMKEY_BASE(int, wxArrayInt, Tval, TvalArray, name, classexp) \
};

// ============================================================================
#define DEFINE_PAIRARRAY(Tkey, Tval, name) \
\
const Tval& name::GetValue(const Tkey& key) const \
{ \
    const int n = Index(key); \
    if (n != wxNOT_FOUND) return m_values[n]; \
    return m_defaultValue; \
} \
Tval& name::GetValue(const Tkey& key) \
{ \
    const int n = Index(key); \
    if (n != wxNOT_FOUND) return m_values[n]; \
    return m_defaultValue; \
} \
Tval& name::GetOrCreateValue(const Tkey& key) \
{ \
    const size_t n = IndexForInsert(key); \
    if (n == m_keys.GetCount())  \
        { m_keys.Add(key); m_values.Add(Tval(m_defaultValue)); } \
    else if (key != m_keys[n])  \
        { m_keys.Insert(key, n); m_values.Insert(Tval(m_defaultValue), n); } \
    return m_values[n]; \
} \
bool name::Add(const Tkey& key, const Tval& value) \
{ \
    const size_t n = IndexForInsert(key); \
    if (n == m_keys.GetCount())  \
        { m_keys.Add(key); m_values.Add(value); return true; } \
    else if (key == m_keys[n])  \
        m_values[n] = value; \
    else \
        { m_keys.Insert(key, n); m_values.Insert(value, n); return true; } \
    return false; \
} \
bool name::Remove(const Tkey& key) \
{ \
    const int n = Index(key); \
    if (n != wxNOT_FOUND) { RemoveAt(n); return true; } \
    return false; \
} \
int name::Index(const Tkey& key) const \
{ \
    size_t n, lo = 0, hi = m_keys.GetCount(); \
    while ( lo < hi ) \
    { \
        n = (lo + hi)/2;             \
        const Tkey &tmp = m_keys[n]; \
        if (tmp == key) return n;    \
        if (tmp  > key) hi = n;      \
        else            lo = n + 1;  \
    } \
    return wxNOT_FOUND; \
} \
size_t name::IndexForInsert(const Tkey& key) const \
{ \
    size_t n, lo = 0, hi = m_keys.GetCount(); \
    while ( lo < hi ) \
    { \
        n = (lo + hi)/2;             \
        const Tkey &tmp = m_keys[n]; \
        if (tmp == key) return n;    \
        if (tmp  > key) hi = n;      \
        else            lo = n + 1;  \
    } \
    return lo; \
} \
void name::Copy(const name& other) \
{ \
    m_keys = other.GetKeys();                 \
    m_values = other.GetValues();             \
    m_defaultValue = other.GetDefaultValue(); \
} \
bool name::IsEqualTo(const name& other) const \
{ \
    if (GetCount() != other.GetCount()) return false; \
    size_t n, count = GetCount(); \
    for (n = 0; n < count; n++) \
        if ((ItemKey(n) != other.ItemKey(n)) || \
            (ItemValue(n) != other.ItemValue(n))) return false; \
    return true; \
} \
void name::q_sort(int left, int right) \
{ \
    int l_hold = left, r_hold = right; \
    Tkey pivot = m_keys[left]; Tval pivotVal = m_values[left]; \
    while (left < right) \
    { \
        while ((m_keys[right] >= pivot) && (left < right)) right--;       \
        if (left != right) { m_keys[left]   = m_keys[right];              \
                             m_values[left] = m_values[right]; left++; }  \
        while ((m_keys[left] <= pivot) && (left < right)) left++;         \
        if (left != right) { m_keys[right]   = m_keys[left];              \
                             m_values[right] = m_values[left]; right--; } \
    } \
    m_keys[left] = pivot; m_values[left] = pivotVal; \
    if (l_hold < left) q_sort(l_hold, left-1); \
    if (r_hold > left) q_sort(left+1, r_hold); \
}

// ----------------------------------------------------------------------------

#define DEFINE_PAIRARRAY_INTKEY(Tval, name) \
DEFINE_PAIRARRAY_NUMKEY(int, Tval, name)

#define DEFINE_PAIRARRAY_NUMKEY(Tkey, Tval, name) \
DEFINE_PAIRARRAY(Tkey, Tval, name)                \
bool name::UpdatePos( Tkey pos, Tkey numPos )     \
{ \
    int n, count = m_keys.GetCount(), start_idx = IndexForInsert(pos); \
    if ((numPos == 0) || (start_idx >= count)) return false; \
    if ( numPos > 0 ) \
    { \
        for (n=start_idx; n<count; n++) \
            m_keys[n] += numPos; \
    } \
    else if ( numPos < 0 ) \
    { \
        Tkey pos_right = pos-numPos;    \
        for (n=start_idx; n<count; n++) \
        { \
            Tkey &k = m_keys[n];                              \
            if (k < pos_right) { RemoveAt(n); n--; count--; } \
            else if (k >= pos_right) { k += numPos; }         \
        } \
    } \
    return true; \
}

#endif  // __WX_PAIRARR_H__
