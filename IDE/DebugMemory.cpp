#ifdef DEBUG_MEMORY
#define DEBUG_MEMORY_IMPLEMENTATION 1
#include "DebugMemory.h"
#ifndef WIN32
#include <unistd.h>
#endif

#define _MAX_FILE 128

// Flag that controls the logging of all allocations if enabled by DumpMemoryLogAllAllocations()

static BOOL _g_bDebugMemoryLogAllAllocations = FALSE;

// This is the data structure that holds an allocated block's information.
typedef struct 
 {
		void *address;
	  DWORD	size;
	  char	file[_MAX_FILE];
	  DWORD	line;
 } ALLOC_INFO;      			
typedef ALLOC_INFO* LPALLOC_INFO;      

// Prototypes for Adding and Deleting the breadcrumb's or the memory trail.
static void AddMemoryBreadcrumb(void *addr,  DWORD asize,  const char *fname, DWORD lnum);			
static void AddUnallocatedBreadcrumb(void *addr);
static BOOL DelMemoryBreadcrumb(void *addr);
static void DebugMemoryLog(BOOL bAlloc, LPALLOC_INFO pInfo);

// new operator override.
void* __cdecl operator new(unsigned int size, const char *file, int line)
{
	  void *ptr = (void *)malloc(size);
	  AddMemoryBreadcrumb(ptr, size, file, line);
	  return(ptr);
};
    
// delete operator override
void __cdecl operator delete(void *p, const char *file, int line)
{
		file;		// stop compiler complaint
		line;
	  if (DelMemoryBreadcrumb(p))
				free(p);
};

// delete operator override.
void __cdecl operator delete(void *p)
{
	  if (DelMemoryBreadcrumb(p))
				free(p);
};

// new [] operator override.
void * __cdecl operator new [](unsigned int size, const char *file, int line) 
{
	  void *ptr = (void *)malloc(size);
	  AddMemoryBreadcrumb(ptr, size, file, line);
	  return(ptr);
};

// delete [] operator override
void __cdecl operator delete [] (void *p, const char *file, int line) 
{
		file;		// stop compiler complaint
		line;
	  if (DelMemoryBreadcrumb(p))
				free(p);
};

// delete [] operator override
void __cdecl operator delete [] (void *p) 
{
	  if (DelMemoryBreadcrumb(p))
				free(p);
};

// debug version of malloc
void * __cdecl _debug_malloc(unsigned int size, const char *file, int line) 
{
	  void *ptr = (void *)malloc(size);
	  AddMemoryBreadcrumb(ptr, size, file, line);
	  return(ptr);
};

// debug version of calloc
void * __cdecl _debug_calloc(unsigned int nNum, unsigned int size, const char *file, int line)
{
	  void *ptr = (void *)calloc(nNum, size);
	  AddMemoryBreadcrumb(ptr, nNum*size, file, line);
	  return(ptr);
}

// debug version of free
void __cdecl _debug_free(void *p) 
{
		// if we did not find this address in our list, then somehow it is getting freed by
		// us, but we did not allocate the block using one of the debug routines.  Make note
		// of this case, but free the block anyhow to avoid a leak.
	  if (DelMemoryBreadcrumb(p) == FALSE)
				AddUnallocatedBreadcrumb(p);
		free(p);
};


// global memory block allocation list.
LPALLOC_INFO allocList = NULL;
// counters needed
DWORD dwBlocksAvail = 0;
DWORD dwBlocksUsed = 0;

// If our list if full, make room for more.
void ReallocMemoryBlockList()
{
		dwBlocksAvail += 100;
		void * pzNewList = malloc(sizeof(ALLOC_INFO) * dwBlocksAvail);
		memset(pzNewList,0,sizeof(ALLOC_INFO) * dwBlocksAvail);
		if (allocList)
				memcpy(pzNewList, allocList, sizeof(ALLOC_INFO) * dwBlocksUsed);
		allocList = (LPALLOC_INFO) pzNewList;
}

// Add a breadcrumb to the memory trail.
void AddMemoryBreadcrumb(void *addr,  DWORD asize,  const char *fname, DWORD lnum)
{
	  LPALLOC_INFO info = NULL;	 
		BOOL bFound = FALSE;
		DWORD ii;

		// if we need to create the list or grow it, do that now.
		if(!allocList || dwBlocksUsed >= dwBlocksAvail) {
				ReallocMemoryBlockList();
	  }

		// try to find an unused block.
	  for(ii = 0; ii < dwBlocksUsed; ii++)
	  {
				info = allocList+ii;
		    if(info->address == 0)
				{
						bFound = TRUE;
						break;
				}
		}
		if (bFound == FALSE)
		{
				// didn't find an unused block, so use one at the end of
				// the list.
				ii = dwBlocksUsed;
				info = allocList+dwBlocksUsed;
				dwBlocksUsed++;
		}
		// populate the breadcrumb
		memset(info->file, 0, _MAX_FILE);
	  info->address = addr;
		if (strlen(fname) > _MAX_FILE-1)
		{
				strcpy(info->file, "too long: ");
				strcat(info->file, (fname+strlen(fname)-32));
		}
		else
				strcpy(info->file, fname);
	  info->line = lnum;
	  info->size = asize;
		DebugMemoryLog(TRUE, info);
 };

// Add a trail for blocks we freed but we didn't allocate.
void AddUnallocatedBreadcrumb(void *addr)
{
		AddMemoryBreadcrumb(addr,  0,  "freed unallocated block.  File unknown", 0);
}
		
// Delete a breadcrumb from our trail.
BOOL DelMemoryBreadcrumb(void *addr)
{
		DWORD ii;
		if(!allocList || dwBlocksAvail <= 0)
		    return FALSE;
		if (addr == 0)
				return FALSE;
	  for(ii = 0; ii < dwBlocksUsed; ii++)
	  {
				LPALLOC_INFO info = allocList+ii;
		    if(info->address == addr && info->line != 0 && info->size != 0)
		    {
						DebugMemoryLog(FALSE, info);
						info->address = 0;
						memset(info->file, 0, _MAX_FILE);
						info->line = 0;
						info->size = 0;
						return TRUE;
		    }
	  }
		return FALSE;
 }

void DumpMemoryLogAllAllocations(BOOL bEnable)
{
		_g_bDebugMemoryLogAllAllocations = bEnable;
		if (bEnable)
				unlink("debugmemorylog.txt"); // reset the file.
}


void DebugMemoryLog(BOOL bAlloc, LPALLOC_INFO pInfo)
{
		if (_g_bDebugMemoryLogAllAllocations != TRUE)
				return;
		if (pInfo != NULL)
		{
				FILE *fp = fopen("debugmemorylog.txt","a+");
				if (!fp)
						return;
				fprintf(fp,"%p:\t%s\t%d %s\n",pInfo->address, pInfo->file, pInfo->line,(bAlloc ? "allocated" : "freed"));
				fflush(fp);
				fclose(fp);
		}
}

// Write the memory leak report to memoryleak.txt
void DumpUnfreed(BOOL bFreeList)
{
	  DWORD totalSize = 0;
		DWORD ii;
	  char buf[1024];
		FILE *fp = fopen("memoryleak.txt","w");
		if(!allocList || !fp)
		    return;	      
		for(ii = 0; ii < dwBlocksAvail; ii++) {
				LPALLOC_INFO info = allocList+ii;
				if (info->address != 0 && info->line != 0 && info->size != 0)
				{
						sprintf(buf, "%d:%-50s:\t\tLINE %d,\tADDRESS %p\t%d unfreed\tblock %d\n",
								ii+1,info->file, info->line, info->address, info->size,ii);
						fprintf(fp,buf);
						totalSize += info->size;
				}
	  }
	  sprintf(buf, "-----------------------------------------------------------\n");
		for(ii = 0; ii < dwBlocksAvail; ii++) {
				LPALLOC_INFO info = allocList+ii;
				if (info->address != 0 && info->line == 0 && info->size == 0)
				{
						sprintf(buf, "%d:%-50s:\t\tFreed address %p that was not allocated by DebugMemory\n",
								ii+1,info->file, info->address);
						fprintf(fp,buf);
				}
	  }
	  sprintf(buf, "-----------------------------------------------------------\n");
	  fprintf(fp,buf);
	  sprintf(buf, "Total Unfreed: %d bytes\n", totalSize);
	  fprintf(fp,buf);
		fclose(fp);
		if (bFreeList)
		{
				free(allocList);
				allocList = NULL;
		}
 };

#endif
