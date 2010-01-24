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
 *  Suivi des allocations avec new/delete
 */

#define DWORD unsigned long
#include <list>
#include <iostream>
#include <stdlib.h>
#include <stdio.h>
#include <string.h>

/*
Désactivé car incompatible avec GCC 4.1
*/

/*
typedef struct {
    DWORD	address;
    DWORD	size;
    char	file[128];
    DWORD	line;
} ALLOC_INFO;

typedef std::list<ALLOC_INFO*> AllocList;
AllocList *allocList;

void AddTrack(DWORD addr,  DWORD asize,  const char *fname, DWORD lnum)
{
    ALLOC_INFO *info;

    if(!allocList) {
        allocList = new(AllocList);
    }

    info = new(ALLOC_INFO);
    info->address = addr;
    strncpy(info->file, fname, 128);
    info->line = lnum;
    info->size = asize;
    allocList->insert(allocList->begin(), info);
}

void RemoveTrack(DWORD addr)
{
    AllocList::iterator i;

    if(!allocList)
        return;
    for(i = allocList->begin(); i != allocList->end(); i++)
    {
        if((*i)->address == addr)
        {
            delete (*i);
            allocList->erase(i);
            break;
        }
    }
}

void DumpUnfreed()
{
    AllocList::iterator i;
    DWORD totalSize = 0;
    char buf[1024];

    if(!allocList)
        return;

    std::cout << "\nRapport de Memory Tracker----------------------------------\n\n";
    //std::cout<<buf;

    for(i = allocList->begin(); i != allocList->end(); i++) {
        sprintf(buf, "%s\nLigne %d Adresse %d, %d bytes non lib\202r\202s\n",
                (*i)->file, (*i)->line, (*i)->address, (*i)->size);
        std::cout<<buf;
        totalSize += (*i)->size;
    }
    sprintf(buf, "-----------------------------------------------------------\n");
    std::cout<<buf;
    sprintf(buf, "Total non libéré: %d bytes\n", totalSize);
    std::cout<<buf;
}

void* operator new(size_t size, const char* file, int line)
{
    void *ptr = (void *)malloc(size);
    AddTrack((DWORD)ptr, size, file, line);
    return(ptr);
}

void * operator new[](size_t size, const char* file, int line)
{
    void *ptr = (void *)malloc(size);
    AddTrack((DWORD)ptr, size, file, line);
    return(ptr);
}

void operator delete (void *p)
{
    RemoveTrack((DWORD)p);
    free(p);
}
*/
