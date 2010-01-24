#ifndef DBGPRINT_H
#define DBGPRINT_H
#ifdef DEBUG_MEM
#include <windows.h>
#endif

/*****************************************************************************
    Purpose:
        Implements a debug printing function. 

        The macro uses a variable number of arguments, so it must be called
        with double brackets. Eg:

        dbgprint(( GENERAL, "Your value is: %d\n", 64 )); 

        A bunch of keys are defined below, approximately one per module.
        You can selectively pick which modules get to print stuff by including
        the key in the DEBUG_KEYS string.
 ****************************************************************************/
#ifdef DEBUG
#define dbgprint(A) _dbgprint A
#ifdef DEBUG_MEM
#include <new>
#define malloc(A) _dbgmalloc( __FILE__, __LINE__, (A) )
#define calloc(A, B) _dbgcalloc( __FILE__, __LINE__, (A), (B) )
#define realloc(A, B) _dbgrealloc( __FILE__, __LINE__, (A), (B) )
#define free(A) _dbgfree( __FILE__, __LINE__, (A) )
#define strdup(A) _dbgstrdup( __FILE__, __LINE__, (A) )
#define _strdup(A) _dbgstrdup( __FILE__, __LINE__, (A) )
#define InvalidateRect(A,B,C) _dbgInvalidateRect(A,B,C)

#ifdef _tcsdup
#undef _tcsdup
#define _tcsdup(A) _dbgstrdup( __FILE__, __LINE__, (A) )
#endif

#pragma warning(disable:4290)

void* operator new( size_t size ) throw ( std::bad_alloc );
#endif //DEBUG_MEM

#define dbgtrace(A) \
class LocalTrace { \
    public: \
    LocalTrace() { dbgprint((DTRACE, #A " ENTERED {{{----" )); } \
    ~LocalTrace() { dbgprint((DTRACE, #A " EXITTED ----}}}")); } \
    } localTrace;

#else 
#define dbgprint(A)
#define dbgtrace(A)
#endif

void _dbgprint( unsigned short key, const char* msg, ... );

#ifdef DEBUG_MEM
void _dbgfree( const char* file, int line, void* );
void* _dbgmalloc( const char* file, int line, size_t size );
void* _dbgcalloc( const char* file, int line, size_t nmemb, size_t size );
void* _dbgrealloc( const char* file, int line, void* ptr, size_t size );
char* _dbgstrdup( const char* file, int line, const char* ptr );
BOOL _dbgInvalidateRect( HWND hWnd, const RECT* lpRect, BOOL bErase );
#endif

#define DTRACE   'a'
#define DMEMORY  'b'
#define DMEMLEAK 'c'
#define DFILE    'd'
#define DWND     'e'

#ifndef DBG
#define DBG     __FILE__, __LINE__
#endif

#define DSOCKET 0x1000
#define DTHREAD 0x1001

typedef void (*DebugHandler)(const char*);

#ifdef DEBUG
void dbgSetHandler( DebugHandler handler );
void dbgInitOutput(); // set up to output to file named by ENV DEBUG_OUTPUT
// Null terminated list of debug keys.
void dbgSetKeys( const int* keys );
#else
#define dbgSetHandler(A)
#define dbgInitOutput()
#define dbgSetKeys(A)
#endif

#endif // DBGPRINT_H
