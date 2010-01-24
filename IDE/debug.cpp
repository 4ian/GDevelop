#ifdef _WIN32
#pragma warning(disable:4786)
#endif
#include <assert.h>
#include <map>
#include <stdio.h>
#include <string.h>
#include <stdarg.h>
#ifdef DEBUG_MEM
#include <windows.h>
#include "MapFile.h"
#endif

#include "debug.h"

#ifndef _WIN32
#define _vsnprintf vsnprintf
#endif

static const int DEBUG_KEYS[] = { DMEMLEAK, 0 };
static const int* Keys = DEBUG_KEYS;
FILE* _file = 0;

#ifdef DEBUG
void odsHandler( const char* str )
{
#ifdef _WIN32
    OutputDebugString( str );
#endif
}

static DebugHandler handler = odsHandler;

void dbgSetHandler( DebugHandler handlers )
{
    if ( handler == 0 ) {
        handler = odsHandler;
    } else {
        handler = handlers;
    }
}

void dbgSetKeys( const int* keys )
{
    Keys = keys;
}


void dbgInitOutput()
{
    const char* env = getenv("DEBUG_OUTPUT");
    if ( env == 0 ) {
        return;
    }

    _file = fopen( env, "wt+" );
    if ( _file == 0 ) {
        return;
    }

 //   handler = fileHandler;
}

/******************************************************************************
 *****************************************************************************/
void _dbgprint( unsigned short level, const char* msg, ... )
{
    const int* key = Keys;
    int found = 0;
    char buffer[1024];
    int offset = 0;
    va_list args;

    while( *key ) {
        if ( *key == level ) {
            found = 1;
            break;
        }
        key++;
    }

    if ( ! found ) {
        return;
    }

    va_start( args, msg );
    _vsnprintf( &buffer[offset], sizeof(buffer)/sizeof(*buffer)-1, msg, args );
	buffer[sizeof(buffer)/sizeof(*buffer)-1-1] = 0;
    va_end( args );
    strcat( buffer, "\n" );
    handler(buffer);
}
#endif

#ifdef DEBUG_MEM

#undef malloc
#undef calloc
#undef realloc
#undef free
#undef strdup
#undef _strdup
#undef InvalidateRect

typedef struct _list_entry_t {
    struct _list_entry_t* next;
    struct _list_entry_t* prev;
} list_entry_t;
#define list_init( entry ) \
    (entry)->prev = (entry)->next = entry
#define container_of( ptr, type, member ) \
    ((type *)((char *)(ptr)-(unsigned long)(&((type *)0)->member)))
#define list_entry( ptr, type, member )\
    container_of(ptr, type, member)
#define list_empty( list ) \
    ((list)->next == (list))
#define list_head( list ) \
    (list)->next
#define list_add_tail( list, entry ) \
    (entry)->next = (list); \
    (entry)->prev = (list)->prev; \
    (list)->prev->next = (entry); \
    (list)->prev = (entry) 
#define list_remove( entry ) \
    assert( (entry)->next != 0 ); \
    (entry)->prev->next = (entry)->next; \
    (entry)->next->prev = (entry)->prev;

static const unsigned SENTRY = 0x12345678;
#define STACK_SIZE 5

struct MemBlock {
    unsigned sentry;
    list_entry_t list;
    size_t size;
    char* file;
    int line;
    unsigned stack[STACK_SIZE];
};

list_entry_t _blockList;

static bool _init = false;
static MapFile* _mapFile = 0;
static CRITICAL_SECTION _cs;

/******************************************************************************
 *****************************************************************************/
static void
dump_blocks()
{
    list_entry_t* entry = list_head( &_blockList );
    while( entry != &_blockList ) {
        MemBlock* block = list_entry( entry, MemBlock, list );
        dbgprint(( DMEMLEAK, "Leaked %d bytes from %s:%d [%08x]",
                    block->size, block->file, block->line, block + 1
                 ));
        
        entry = entry->next;
    }

    if ( list_empty(&_blockList ) ) {
        dbgprint(( DMEMLEAK, "No memory leaks detected." ));
    }
}

/******************************************************************************
 *****************************************************************************/
static class Heap {
public:
    Heap() {
        char buffer[1024];
        GetModuleFileName( GetModuleHandle(NULL), buffer, sizeof(buffer) );
        char* slash = strrchr( buffer, '\\' );
        if ( slash ) {
            slash++;
        } else {
            slash = buffer;
        }

        char* dot = strrchr(buffer, '.');
        if ( dot ) {
            *dot = 0;
        }
        strcat( slash, ".map");
        _mapFile = new MapFile();
        _mapFile->read( slash );
        list_init(&_blockList);

        InitializeCriticalSection(&_cs);
        
        _init = true;
        dbgprint(( DMEMLEAK, "Debug heap starting up."));
    }

    ~Heap() {
        dbgprint(( DMEMLEAK, "Debug heap shutting down."));
        _init = false;
        DeleteCriticalSection(&_cs);
        // if this assert goes off, we are dumping unfreed memory blocks to
        // the debug window.
        dump_blocks();
        //assert( list_empty(&_blockList ) );
    }
} heap;

/******************************************************************************
 *****************************************************************************/
void
del_record( const char* file, int line, void* ptr )
{
    assert(_init);
    if ( ptr == 0 ) {
        return;
    }
    
    MemBlock* block = (MemBlock*)ptr - 1;
    if ( block->sentry != SENTRY ) {
        dbgprint((DMEMORY, "Invalid free of [%08x] in %s:%d\n", 
                    ptr, file, line));
        assert(0);
        return;
    }

    if ( 0 != memcmp( (char*)ptr + block->size, &SENTRY, sizeof( SENTRY ) ) )
    {
        dbgprint(( DMEMORY, "%s:%d: free(%p): Sentry corrupted.", file, line,
            ptr ));
        assert(0);
    }
    free( block->file );

    EnterCriticalSection(&_cs);
    list_remove( &block->list );
    LeaveCriticalSection(&_cs);
    memset( block, 0xdd, sizeof( block + block->size + sizeof(SENTRY) ) );
    free( block );
}

/******************************************************************************
 *****************************************************************************/
void _dbgfree( const char* file, int line, void* ptr )
{
    if ( ptr == 0 ) {
        return;
    }

    if ( !_init ) {
        free( ptr );
        return;
    }

    MemBlock* block = (MemBlock*)ptr - 1;
    int size = block->size;

    del_record( file, line, ptr );

    dbgprint(( DMEMORY, "%s:%d: free( [%p], %d )", file, line, ptr, size ));
}



/******************************************************************************
 *****************************************************************************/
void*
add_record( const char* file, int line, size_t size )
{
    MemBlock* block;
    assert(_init);

    block = (MemBlock*)malloc( sizeof( MemBlock ) + size + 4 );

    if ( block == 0 ) {
        dbgprint(( DMEMORY, "Out of memory." ));
        return 0;
    }

    block->sentry = SENTRY;
    block->size = size;
    block->line = line;
    block->file = _strdup( file );
    if ( 0 == block->file && file ) {
        free( block );
        dbgprint(( DMEMORY, "Out of memory." ));
        return 0;
    }

    memcpy( (char*)block + sizeof(*block) + size, &SENTRY, 
        sizeof( SENTRY ) );

    EnterCriticalSection(&_cs);
    list_add_tail( &_blockList, &block->list );
    LeaveCriticalSection(&_cs);

    return block + 1;
}


/******************************************************************************
 *****************************************************************************/
void*
_dbgmalloc( const char* file, int line, size_t size )
{
    void* ptr;

    if ( !_init ) {
        return malloc( size );
    }

    ptr = add_record( file, line, size );
    if ( ptr == 0 ) {
        dbgprint(( DMEMORY, "Out of memory." ));
        return 0;
    }

    dbgprint(( DMEMORY, "%s:%d: malloc( %d ) [%p]", file, line, size, ptr ));

    return ptr;
}

/******************************************************************************
 *****************************************************************************/
void*
_dbgrealloc( const char* file, int line, void* ptr, size_t size )
{
    if ( !_init ) {
        return realloc( ptr, size );
    }

    if ( ptr == 0 ) {
        return _dbgmalloc( file, line, size );
    }

    if ( size == 0 ) {
        del_record( file, line, ptr );
        dbgprint(( DMEMORY, "%s:%d: realloc/free( [%08x], %d )", file, line,
                    ptr, size ));
        return 0;
    }

    MemBlock* block = (MemBlock*)ptr - 1;
    if ( block->sentry != SENTRY ) {
        dbgprint(( DMEMLEAK, "%s:%d: realloc( [%08x], %d ): ptr is bad.",
                    file, line, ptr, size));
        assert( 0 );
        return ptr;
    }

    EnterCriticalSection(&_cs);
    list_remove( &block->list );
    LeaveCriticalSection(&_cs);

    block = (MemBlock*)realloc( block, size + sizeof(MemBlock) + sizeof(SENTRY));
    if ( block == 0 ) {
        block = (MemBlock*)ptr - 1;
        dbgprint(( DMEMORY, "%s:%d: realloc( %08x, %d ): failed.",
                    file, line, ptr, size ));
        list_add_tail( &_blockList, &block->list );
        return 0;
    }

	ptr = block + 1;
    block->size = size;

    memcpy( (char*)block + sizeof(*block) + size, &SENTRY, 
        sizeof( SENTRY ) );

    EnterCriticalSection(&_cs);
    list_add_tail( &_blockList, &block->list );
    LeaveCriticalSection(&_cs);

    dbgprint(( DMEMORY, "%s:%d: malloc( %d ) [%p]", file, line, size, ptr ));

    return ptr;
}

/******************************************************************************
 *****************************************************************************/
char*
_dbgstrdup( const char* file, int line, const char* str )
{
    if ( !_init ) {
        return _strdup( str );
    }
    int size;
    char* ptr;
    assert( str );

    size = strlen( str ) + 1;
    ptr = (char*)add_record(file, line, size);
    if ( ptr == 0 ) {
        dbgprint(( DMEMORY, "Out of memory." ));
        return 0;
    }

    dbgprint(( DMEMORY, "%s:%d: strdup( \"%s\" ) [%p]", file, line, str, 
            ptr ));

    strcpy( ptr, str );

    return ptr;
}

/******************************************************************************
 *****************************************************************************/
static int 
GetCallStack( unsigned* stack, int max )
{
    unsigned* my_ebp = 0;
    int i;

    __asm {
        mov eax, ebp
        mov dword ptr [my_ebp], eax;
    }

    if ( IsBadReadPtr( my_ebp + 1, 4 ) ) {
        return 0;
    }

    stack[0] = *(my_ebp + 1);
    for ( i = 1; i < max; i++ ) {
        unsigned addr;
        if ( IsBadReadPtr( my_ebp, 4 ) ) {
            break;
        }
        my_ebp = (unsigned*)(*my_ebp);

        if ( IsBadReadPtr( my_ebp + 1, 4 ) ) {
            break;
        }

        addr = *(my_ebp + 1);
        if ( addr ) {
            stack[i] = addr;
        } else {
			break;
		}
    }

    return i;
}

/******************************************************************************
  numUp = 0 returns the caller of getFileLine.
 *****************************************************************************/
static CrashPosition_t 
getFileLine(int numUp)
{
    unsigned stack[5];
    CrashPosition_t pos;
    int n = GetCallStack(stack, 5);
    numUp++;
    pos.function = "unknown function";
    pos.file = "unknown file";
    pos.line = 0;

    if ( n >= numUp ) {
        _mapFile->getPosition(stack[numUp], &pos );
    }

    return pos;
}

/******************************************************************************
 *****************************************************************************/
void* operator new( size_t size ) throw ( std::bad_alloc )
{
    static bool recurse = false;
    void* ret;
    CrashPosition_t pos;
    if ( recurse || !_init) {
        return malloc( size );
    }

    EnterCriticalSection(&_cs);
    pos = getFileLine(1);
    if ( pos.file == 0 ) {
        pos.file = pos.function;
    }

    ret = add_record( pos.file, pos.line, size );
    if ( ret == 0 ) {
        dbgprint(( DMEMORY, "Out of memory." ));
	    LeaveCriticalSection(&_cs);
        return 0;
    }

    dbgprint(( DMEMORY, "%s:%d: new( %d ) [%p]", pos.file, pos.line, size, ret ));
	    LeaveCriticalSection(&_cs);
    return ret;
}


/******************************************************************************
 *****************************************************************************/
void operator delete( void* ptr ) throw ()
{
    CrashPosition_t pos;
    
    if ( !_init ) {
        free( ptr );
        return;
    }

    if ( ptr == 0 ) {
        return;
    }
    EnterCriticalSection(&_cs);

    pos = getFileLine(2);
	    LeaveCriticalSection(&_cs);

    dbgprint(( DMEMORY, "%s:%d: delete [%p]", pos.file, pos.line, ptr ));
    del_record( pos.file, pos.line, ptr );
}

/******************************************************************************
 *****************************************************************************/
void*
_dbgcalloc( const char* file, int line, size_t nmemb, size_t sizem )
{

    if ( !_init ) {
        return calloc( nmemb, sizem );
    }
    void* ptr;

    int size = sizem * nmemb;

    ptr = add_record( file, line, size );

    if ( ptr == 0 ) {
        dbgprint(( DMEMORY, "%s:%d: calloc( %d, %d ) failed.", file, line, 
                    nmemb, sizem ));
        return 0;
    }

    memset( ptr, 0, size );

    dbgprint(( DMEMORY, "%s:%d: calloc( %d, %d ) [%p]", file, line, nmemb,
        sizem, ptr ));

    return ptr;
}

BOOL _dbgInvalidateRect( HWND hWnd, const RECT* lpRect, BOOL bErase )
{
    assert(hWnd != NULL);
    return InvalidateRect(hWnd,lpRect,bErase);
}

#endif // DEBUG_MEM

