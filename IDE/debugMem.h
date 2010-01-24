/**
 * Game Develop
 *    Editor
 *
 *  Par Florian "4ian" Rival
 *
 */
/**
 *
 *
 *  Header pour le suivi des allocations new/delete
 */

#ifndef MEMTRACKER_HPP__
#define MEMTRACKER_HPP__

/*
Désactivé car incompatible avec GCC 4.1
*/

/*
#ifdef _MEMORY_TRACKER

#define DWORD unsigned long

#include <list>
#include <iostream>

typedef struct {
    DWORD	address;
    DWORD	size;
    char	file[128];
    DWORD	line;
} ALLOC_INFO;

typedef std::list<ALLOC_INFO*> AllocList;

void AddTrack(DWORD addr,  DWORD asize,  const char *fname, DWORD lnum);

bool RemoveTrack(DWORD addr);

void DumpUnfreed();

void* operator new(size_t size, const char* file, int line);

void * operator new[](size_t size, const char* file, int line);

void operator delete (void *p);

//replace the new operator calls in the rest of the code
#define MEM_TRACKER_NEW new(__FILE__, __LINE__)
#else
#define MEM_TRACKER_NEW new
#endif
#define new MEM_TRACKER_NEW
*/
#endif //MEMTRACKER_HPP__
