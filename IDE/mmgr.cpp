/*  ---------------------------------------------------------------------------------------------------------------------------------
 *
 *
 *   _ __ ___  _ __ ___   __ _ _ __      ___ _ __  _ __
 *  | '_ ` _ \| '_ ` _ \ / _` | '__|    / __| '_ \| '_ \
 *  | | | | | | | | | | | (_| | |    _ | (__| |_) | |_) |
 *  |_| |_| |_|_| |_| |_|\__, |_|   (_) \___| .__/| .__/
 *                        __/ |             | |   | |
 *                       |___/              |_|   |_|
 *
 *  Memory manager & tracking software
 *
 *  Best viewed with 8-character tabs and (at least) 132 columns
 *
 *  ---------------------------------------------------------------------------------------------------------------------------------
 *
 *  Restrictions & freedoms pertaining to usage and redistribution of this software:
 *
 *   * This software is 100% free
 *   * If you use this software (in part or in whole) you must credit the author.
 *   * This software may not be re-distributed (in part or in whole) in a modified
 *     form without clear documentation on how to obtain a copy of the original work.
 *   * You may not use this software to directly or indirectly cause harm to others.
 *   * This software is provided as-is and without warrantee. Use at your own risk.
 *
 *  For more information, visit HTTP://www.FluidStudios.com
 *
 *  ---------------------------------------------------------------------------------------------------------------------------------
 *  Originally created on 12/22/2000 by Paul Nettle
 *
 *  Copyright 2000, Fluid Studios, Inc., all rights reserved.
 *  ---------------------------------------------------------------------------------------------------------------------------------
 *
 *  !!IMPORTANT!!
 *
 *  This software is self-documented with periodic comments. Before you start using this software, perform a search for the string
 *  "-DOC-" to locate pertinent information about how to use this software.
 *
 *  You are also encouraged to read the comment blocks throughout this source file. They will help you understand how this memory
 *  tracking software works, so you can better utilize it within your applications.
 *
 *  NOTES:
 *
 *  1. If you get compiler errors having to do with set_new_handler, then go through this source and search/replace
 *     "std::set_new_handler" with "set_new_handler".
 *
 *  2. This code purposely uses no external routines that allocate RAM (other than the raw allocation routines, such as malloc). We
 *     do this because we want this to be as self-contained as possible. As an example, we don't use assert, because when running
 *     under WIN32, the assert brings up a dialog box, which allocates RAM. Doing this in the middle of an allocation would be bad.
 *
 *  3. When trying to override new/delete under MFC (which has its own version of global new/delete) the linker will complain. In
 *     order to fix this error, use the compiler option: /FORCE, which will force it to build an executable even with linker errors.
 *     Be sure to check those errors each time you compile, otherwise, you may miss a valid linker error.
 *
 *  4. If you see something that looks odd to you or seems like a strange way of going about doing something, then consider that this
 *     code was carefully thought out. If something looks odd, then just assume I've got a good reason for doing it that way (an
 *     example is the use of the class MemStaticTimeTracker.)
 *
 *  5. With MFC applications, you will need to comment out any occurance of "#define new DEBUG_NEW" from all source files.
 *
 *  6. Include file dependencies are _very_important_ for getting the MMGR to integrate nicely into your application. Be careful if
 *     you're including standard includes from within your own project inclues; that will break this very specific dependency order.
 *     It should look like this:
 *
 * 		#include <stdio.h>   // Standard includes MUST come first
 * 		#include <stdlib.h>  //
 * 		#include <streamio>  //
 *
 * 		#include "mmgr.h"    // mmgr.h MUST come next
 *
 * 		#include "myfile1.h" // Project includes MUST come last
 * 		#include "myfile2.h" //
 * 		#include "myfile3.h" //
 *
 *  ---------------------------------------------------------------------------------------------------------------------------------
 */

/*#include "stdafx.h"*/
#include <iostream>
#include <stdio.h>
#include <stdlib.h>
#include <assert.h>
#include <string.h>
#include <time.h>
#include <stdarg.h>
#include <new>

using namespace std;

#ifndef	WIN32
#include <unistd.h>
#endif

#include "mmgr.h"

// ---------------------------------------------------------------------------------------------------------------------------------
// -DOC- If you're like me, it's hard to gain trust in foreign code. This memory manager will try to INDUCE your code to crash (for
// very good reasons... like making bugs obvious as early as possible.) Some people may be inclined to remove this memory tracking
// software if it causes crashes that didn't exist previously. In reality, these new crashes are the BEST reason for using this
// software!
//
// Whether this software causes your application to crash, or if it reports errors, you need to be able to TRUST this software. To
// this end, you are given some very simple debugging tools.
//
// The quickest way to locate problems is to enable the STRESS_TEST macro (below.) This should catch 95% of the crashes before they
// occur by validating every allocation each time this memory manager performs an allocation function. If that doesn't work, keep
// reading...
//
// If you enable the TEST_MEMORY_MANAGER #define (below), this memory manager will log an entry in the memory.log file each time it
// enters and exits one of its primary allocation handling routines. Each call that succeeds should place an "ENTER" and an "EXIT"
// into the log. If the program crashes within the memory manager, it will log an "ENTER", but not an "EXIT". The log will also
// report the name of the routine.
//
// Just because this memory manager crashes does not mean that there is a bug here! First, an application could inadvertantly damage
// the heap, causing malloc(), realloc() or free() to crash. Also, an application could inadvertantly damage some of the memory used
// by this memory tracking software, causing it to crash in much the same way that a damaged heap would affect the standard
// allocation routines.
//
// In the event of a crash within this code, the first thing you'll want to do is to locate the actual line of code that is
// crashing. You can do this by adding log() entries throughout the routine that crashes, repeating this process until you narrow
// in on the offending line of code. If the crash happens in a standard C allocation routine (i.e. malloc, realloc or free) don't
// bother contacting me, your application has damaged the heap. You can help find the culprit in your code by enabling the
// STRESS_TEST macro (below.)
//
// If you truely suspect a bug in this memory manager (and you had better be sure about it! :) you can contact me at
// midnight@FluidStudios.com. Before you do, however, check for a newer version at:
//
//	http://www.FluidStudios.com/publications.html
//
// When using this debugging aid, make sure that you are NOT setting the alwaysLogAll variable on, otherwise the log could be
// cluttered and hard to read.
// ---------------------------------------------------------------------------------------------------------------------------------

//#define	TEST_MEMORY_MANAGER

// ---------------------------------------------------------------------------------------------------------------------------------
// -DOC- Enable this sucker if you really want to stress-test your app's memory usage, or to help find hard-to-find bugs
// ---------------------------------------------------------------------------------------------------------------------------------

//#define	STRESS_TEST

// ---------------------------------------------------------------------------------------------------------------------------------
// -DOC- Enable this sucker if you want to stress-test your app's error-handling. Set RANDOM_FAIL to the percentage of failures you
//       want to test with (0 = none, >100 = all failures).
// ---------------------------------------------------------------------------------------------------------------------------------

//#define	RANDOM_FAILURE 10.0

// ---------------------------------------------------------------------------------------------------------------------------------
// -DOC- Locals -- modify these flags to suit your needs
// ---------------------------------------------------------------------------------------------------------------------------------

#ifdef	STRESS_TEST
static	const	unsigned int	hashBits               = 12;
static		bool		randomWipe             = true;
static		bool		alwaysValidateAll      = true;
static		bool		alwaysLogAll           = true;
static		bool		alwaysWipeAll          = true;
static		bool		cleanupLogOnFirstRun   = true;
static	const	unsigned int	paddingSize            = 1024; // An extra 8K per allocation!
#else
static	const	unsigned int	hashBits               = 12;
static		bool		randomWipe             = false;
static		bool		alwaysValidateAll      = false;
static		bool		alwaysLogAll           = false;
static		bool		alwaysWipeAll          = true;
static		bool		cleanupLogOnFirstRun   = true;
static	const	unsigned int	paddingSize            = 4;
#endif

// ---------------------------------------------------------------------------------------------------------------------------------
// We define our own assert, because we don't want to bring up an assertion dialog, since that allocates RAM. Our new assert
// simply declares a forced breakpoint.
//
// The BEOS assert added by Arvid Norberg <arvid@iname.com>.
// ---------------------------------------------------------------------------------------------------------------------------------

#ifdef	WIN32
	#ifdef	_DEBUG
	#define	m_assert(x) if ((x) == false) __asm { int 3 }
	#else
	#define	m_assert(x) {}
	#endif
#elif defined(__BEOS__)
	#ifdef DEBUG
		extern void debugger(const char *message);
		#define	m_assert(x) if ((x) == false) debugger("mmgr: assert failed")
	#else
		#define m_assert(x) {}
	#endif
#else	// Linux uses assert, which we can use safely, since it doesn't bring up a dialog within the program.
	#define	m_assert(cond) assert(cond)
#endif

// ---------------------------------------------------------------------------------------------------------------------------------
// Here, we turn off our macros because any place in this source file where the word 'new' or the word 'delete' (etc.)
// appear will be expanded by the macro. So to avoid problems using them within this source file, we'll just #undef them.
// ---------------------------------------------------------------------------------------------------------------------------------

#undef	new
#undef	delete
#undef	malloc
#undef	calloc
#undef	realloc
#undef	free

// ---------------------------------------------------------------------------------------------------------------------------------
// Defaults for the constants & statics in the MemoryManager class
// ---------------------------------------------------------------------------------------------------------------------------------

const		unsigned int	m_alloc_unknown        = 0;
const		unsigned int	m_alloc_new            = 1;
const		unsigned int	m_alloc_new_array      = 2;
const		unsigned int	m_alloc_malloc         = 3;
const		unsigned int	m_alloc_calloc         = 4;
const		unsigned int	m_alloc_realloc        = 5;
const		unsigned int	m_alloc_delete         = 6;
const		unsigned int	m_alloc_delete_array   = 7;
const		unsigned int	m_alloc_free           = 8;

// ---------------------------------------------------------------------------------------------------------------------------------
// -DOC- Get to know these values. They represent the values that will be used to fill unused and deallocated RAM.
// ---------------------------------------------------------------------------------------------------------------------------------

static		unsigned int	prefixPattern          = 0xbaadf00d; // Fill pattern for bytes preceeding allocated blocks
static		unsigned int	postfixPattern         = 0xdeadc0de; // Fill pattern for bytes following allocated blocks
static		unsigned int	unusedPattern          = 0xfeedface; // Fill pattern for freshly allocated blocks
static		unsigned int	releasedPattern        = 0xdeadbeef; // Fill pattern for deallocated blocks

// ---------------------------------------------------------------------------------------------------------------------------------
// Other locals
// ---------------------------------------------------------------------------------------------------------------------------------

static	const	unsigned int	hashSize               = 1 << hashBits;
static	const	char		*allocationTypes[]     = {"Unknown",
							  "new",     "new[]",  "malloc",   "calloc",
							  "realloc", "delete", "delete[]", "free"};
static		sAllocUnit	*hashTable[hashSize];
static		sAllocUnit	*reservoir;
static		unsigned int	currentAllocationCount = 0;
static		unsigned int	breakOnAllocationCount = 0;
static		sMStats		stats;
static	const	char		*sourceFile            = "??";
static	const	char		*sourceFunc            = "??";
static		unsigned int	sourceLine             = 0;
static		bool		staticDeinitTime       = false;
static		sAllocUnit	**reservoirBuffer      = NULL;
static		unsigned int	reservoirBufferSize    = 0;
static const	char		*memoryLogFile         = "memory.log";
static const	char		*memoryLeakLogFile     = "memleaks.log";
static		void		doCleanupLogOnFirstRun();

// ---------------------------------------------------------------------------------------------------------------------------------
// Local functions only
// ---------------------------------------------------------------------------------------------------------------------------------

static	void	log(const char *format, ...)
{
	// Cleanup the log?

	if (cleanupLogOnFirstRun) doCleanupLogOnFirstRun();

	// Build the buffer

	static char buffer[2048];
	va_list	ap;
	va_start(ap, format);
	vsprintf(buffer, format, ap);
	va_end(ap);

	// Open the log file

	FILE	*fp = fopen(memoryLogFile, "ab");

	// If you hit this assert, then the memory logger is unable to log information to a file (can't open the file for some
	// reason.) You can interrogate the variable 'buffer' to see what was supposed to be logged (but won't be.)
	m_assert(fp);

	if (!fp) return;

	// Spit out the data to the log

	fprintf(fp, "%s\r\n", buffer);
	fclose(fp);
}

// ---------------------------------------------------------------------------------------------------------------------------------

static	void	doCleanupLogOnFirstRun()
{
	if (cleanupLogOnFirstRun)
	{
		unlink(memoryLogFile);
		cleanupLogOnFirstRun = false;

		// Print a header for the log

		time_t	t = time(NULL);
		log("--------------------------------------------------------------------------------");
		log("");
		log("      %s - Memory logging file created on %s", memoryLogFile, asctime(localtime(&t)));
		log("--------------------------------------------------------------------------------");
		log("");
		log("This file contains a log of all memory operations performed during the last run.");
		log("");
		log("Interrogate this file to track errors or to help track down memory-related");
		log("issues. You can do this by tracing the allocations performed by a specific owner");
		log("or by tracking a specific address through a series of allocations and");
		log("reallocations.");
		log("");
		log("There is a lot of useful information here which, when used creatively, can be");
		log("extremely helpful.");
		log("");
		log("Note that the following guides are used throughout this file:");
		log("");
		log("   [!] - Error");
		log("   [+] - Allocation");
		log("   [~] - Reallocation");
		log("   [-] - Deallocation");
		log("   [I] - Generic information");
		log("   [F] - Failure induced for the purpose of stress-testing your application");
		log("   [D] - Information used for debugging this memory manager");
		log("");
		log("...so, to find all errors in the file, search for \"[!]\"");
		log("");
		log("--------------------------------------------------------------------------------");
	}
}

// ---------------------------------------------------------------------------------------------------------------------------------

static	const char	*sourceFileStripper(const char *sourceFile)
{
	const char	*ptr = strrchr(sourceFile, '\\');
	if (ptr) return ptr + 1;
	ptr = strrchr(sourceFile, '/');
	if (ptr) return ptr + 1;
	return sourceFile;
}

// ---------------------------------------------------------------------------------------------------------------------------------

static	const char	*ownerString(const char *sourceFile, const unsigned int sourceLine, const char *sourceFunc)
{
	static	char	str[90];
	memset(str, 0, sizeof(str));
	sprintf(str, "%s(%05d)::%s", sourceFileStripper(sourceFile), sourceLine, sourceFunc);
	return str;
}

// ---------------------------------------------------------------------------------------------------------------------------------

static	const char	*insertCommas(unsigned int value)
{
	static	char	str[30];
	memset(str, 0, sizeof(str));

	sprintf(str, "%u", value);
	if (strlen(str) > 3)
	{
		memmove(&str[strlen(str)-3], &str[strlen(str)-4], 4);
		str[strlen(str) - 4] = ',';
	}
	if (strlen(str) > 7)
	{
		memmove(&str[strlen(str)-7], &str[strlen(str)-8], 8);
		str[strlen(str) - 8] = ',';
	}
	if (strlen(str) > 11)
	{
		memmove(&str[strlen(str)-11], &str[strlen(str)-12], 12);
		str[strlen(str) - 12] = ',';
	}

	return str;
}

// ---------------------------------------------------------------------------------------------------------------------------------

static	const char	*memorySizeString(unsigned long size)
{
	static	char	str[90];
	     if (size > (1024*1024))	sprintf(str, "%10s (%7.2fM)", insertCommas(size), static_cast<float>(size) / (1024.0f * 1024.0f));
	else if (size > 1024)		sprintf(str, "%10s (%7.2fK)", insertCommas(size), static_cast<float>(size) / 1024.0f);
	else				sprintf(str, "%10s bytes     ", insertCommas(size));
	return str;
}

// ---------------------------------------------------------------------------------------------------------------------------------

static	sAllocUnit	*findAllocUnit(const void *reportedAddress)
{
	// Just in case...
	m_assert(reportedAddress != NULL);

	// Use the address to locate the hash index. Note that we shift off the lower four bits. This is because most allocated
	// addresses will be on four-, eight- or even sixteen-byte boundaries. If we didn't do this, the hash index would not have
	// very good coverage.

	unsigned int	hashIndex = (reinterpret_cast<unsigned int>(const_cast<void *>(reportedAddress)) >> 4) & (hashSize - 1);
	sAllocUnit	*ptr = hashTable[hashIndex];
	while(ptr)
	{
		if (ptr->reportedAddress == reportedAddress) return ptr;
		ptr = ptr->next;
	}

	return NULL;
}

// ---------------------------------------------------------------------------------------------------------------------------------

static	size_t	calculateActualSize(const size_t reportedSize)
{
	// We use DWORDS as our padding, and a long is guaranteed to be 4 bytes, but an int is not (ANSI defines an int as
	// being the standard word size for a processor; on a 32-bit machine, that's 4 bytes, but on a 64-bit machine, it's
	// 8 bytes, which means an int can actually be larger than a long.)

	return reportedSize + paddingSize * sizeof(long) * 2;
}

// ---------------------------------------------------------------------------------------------------------------------------------

static	size_t	calculateReportedSize(const size_t actualSize)
{
	// We use DWORDS as our padding, and a long is guaranteed to be 4 bytes, but an int is not (ANSI defines an int as
	// being the standard word size for a processor; on a 32-bit machine, that's 4 bytes, but on a 64-bit machine, it's
	// 8 bytes, which means an int can actually be larger than a long.)

	return actualSize - paddingSize * sizeof(long) * 2;
}

// ---------------------------------------------------------------------------------------------------------------------------------

static	void	*calculateReportedAddress(const void *actualAddress)
{
	// We allow this...

	if (!actualAddress) return NULL;

	// JUst account for the padding

	return reinterpret_cast<void *>(const_cast<char *>(reinterpret_cast<const char *>(actualAddress) + sizeof(long) * paddingSize));
}

// ---------------------------------------------------------------------------------------------------------------------------------

static	void	wipeWithPattern(sAllocUnit *allocUnit, unsigned long pattern, const unsigned int originalReportedSize = 0)
{
	// For a serious test run, we use wipes of random a random value. However, if this causes a crash, we don't want it to
	// crash in a differnt place each time, so we specifically DO NOT call srand. If, by chance your program calls srand(),
	// you may wish to disable that when running with a random wipe test. This will make any crashes more consistent so they
	// can be tracked down easier.

	if (randomWipe)
	{
		pattern = ((rand() & 0xff) << 24) | ((rand() & 0xff) << 16) | ((rand() & 0xff) << 8) | (rand() & 0xff);
	}

	// -DOC- We should wipe with 0's if we're not in debug mode, so we can help hide bugs if possible when we release the
	// product. So uncomment the following line for releases.
	//
	// Note that the "alwaysWipeAll" should be turned on for this to have effect, otherwise it won't do much good. But we'll
	// leave it this way (as an option) because this does slow things down.
//	pattern = 0;

	// This part of the operation is optional

	if (alwaysWipeAll && allocUnit->reportedSize > originalReportedSize)
	{
		// Fill the bulk

		long	*lptr = reinterpret_cast<long *>(reinterpret_cast<char *>(allocUnit->reportedAddress) + originalReportedSize);
		int	length = static_cast<int>(allocUnit->reportedSize - originalReportedSize);
		int	i;
		for (i = 0; i < (length >> 2); i++, lptr++)
		{
			*lptr = pattern;
		}

		// Fill the remainder

		unsigned int	shiftCount = 0;
		char		*cptr = reinterpret_cast<char *>(lptr);
		for (i = 0; i < (length & 0x3); i++, cptr++, shiftCount += 8)
		{
			*cptr = static_cast<char>((pattern & (0xff << shiftCount)) >> shiftCount);
		}
	}

	// Write in the prefix/postfix bytes

	long		*pre = reinterpret_cast<long *>(allocUnit->actualAddress);
	long		*post = reinterpret_cast<long *>(reinterpret_cast<char *>(allocUnit->actualAddress) + allocUnit->actualSize - paddingSize * sizeof(long));
	for (unsigned int i = 0; i < paddingSize; i++, pre++, post++)
	{
		*pre = prefixPattern;
		*post = postfixPattern;
	}
}

// ---------------------------------------------------------------------------------------------------------------------------------

static	void	dumpAllocations(FILE *fp)
{
	fprintf(fp, "Alloc.   Addr       Size       Addr       Size                        BreakOn BreakOn              \r\n");
	fprintf(fp, "Number Reported   Reported    Actual     Actual     Unused    Method  Dealloc Realloc Allocated by \r\n");
	fprintf(fp, "------ ---------- ---------- ---------- ---------- ---------- -------- ------- ------- --------------------------------------------------- \r\n");


	for (unsigned int i = 0; i < hashSize; i++)
	{
		sAllocUnit *ptr = hashTable[i];
		while(ptr)
		{
			fprintf(fp, "%06d 0x%08X 0x%08X 0x%08X 0x%08X 0x%08X %-8s    %c       %c    %s\r\n",
				ptr->allocationNumber,
				reinterpret_cast<unsigned int>(ptr->reportedAddress), ptr->reportedSize,
				reinterpret_cast<unsigned int>(ptr->actualAddress), ptr->actualSize,
				m_calcUnused(ptr),
				allocationTypes[ptr->allocationType],
				ptr->breakOnDealloc ? 'Y':'N',
				ptr->breakOnRealloc ? 'Y':'N',
				ownerString(ptr->sourceFile, ptr->sourceLine, ptr->sourceFunc));
			ptr = ptr->next;
		}
	}
}

// ---------------------------------------------------------------------------------------------------------------------------------

static	void	dumpLeakReport()
{
	// Open the report file

	FILE	*fp = fopen(memoryLeakLogFile, "w+b");

	// If you hit this assert, then the memory report generator is unable to log information to a file (can't open the file for
	// some reason.)
	m_assert(fp);
	if (!fp) return;

	// Any leaks?

	// Header

	static  char    timeString[25];
	memset(timeString, 0, sizeof(timeString));
	time_t  t = time(NULL);
	struct  tm *tme = localtime(&t);
	fprintf(fp, " ---------------------------------------------------------------------------------------------------------------------------------- \r\n");
	fprintf(fp, "|                                          Memory leak report for:  %02d/%02d/%04d %02d:%02d:%02d                                            |\r\n", tme->tm_mon + 1, tme->tm_mday, tme->tm_year + 1900, tme->tm_hour, tme->tm_min, tme->tm_sec);
	fprintf(fp, " ---------------------------------------------------------------------------------------------------------------------------------- \r\n");
	fprintf(fp, "\r\n");
	fprintf(fp, "\r\n");
	if (stats.totalAllocUnitCount)
	{
		fprintf(fp, "%d memory leak%s found:\r\n", stats.totalAllocUnitCount, stats.totalAllocUnitCount == 1 ? "":"s");
	}
	else
	{
		fprintf(fp, "Congratulations! No memory leaks found!\r\n");

		// We can finally free up our own memory allocations

		if (reservoirBuffer)
		{
			for (unsigned int i = 0; i < reservoirBufferSize; i++)
			{
				free(reservoirBuffer[i]);
			}
			free(reservoirBuffer);
			reservoirBuffer = 0;
			reservoirBufferSize = 0;
			reservoir = NULL;
		}
	}
	fprintf(fp, "\r\n");

	if (stats.totalAllocUnitCount)
	{
		dumpAllocations(fp);
	}

	fclose(fp);
}

// ---------------------------------------------------------------------------------------------------------------------------------
// We use a static class to let us know when we're in the midst of static deinitialization
// ---------------------------------------------------------------------------------------------------------------------------------

class	MemStaticTimeTracker
{
public:
	MemStaticTimeTracker() {doCleanupLogOnFirstRun();}
	~MemStaticTimeTracker() {staticDeinitTime = true; dumpLeakReport();}
};
static	MemStaticTimeTracker	mstt;

// ---------------------------------------------------------------------------------------------------------------------------------
// -DOC- Flags & options -- Call these routines to enable/disable the following options
// ---------------------------------------------------------------------------------------------------------------------------------

bool	&m_alwaysValidateAll()
{
	// Force a validation of all allocation units each time we enter this software
	return alwaysValidateAll;
}

// ---------------------------------------------------------------------------------------------------------------------------------

bool	&m_alwaysLogAll()
{
	// Force a log of every allocation & deallocation into memory.log
	return alwaysLogAll;
}

// ---------------------------------------------------------------------------------------------------------------------------------

bool	&m_alwaysWipeAll()
{
	// Force this software to always wipe memory with a pattern when it is being allocated/dallocated
	return alwaysWipeAll;
}

// ---------------------------------------------------------------------------------------------------------------------------------

bool	&m_randomeWipe()
{
	// Force this software to use a random pattern when wiping memory -- good for stress testing
	return randomWipe;
}

// ---------------------------------------------------------------------------------------------------------------------------------
// -DOC- Simply call this routine with the address of an allocated block of RAM, to cause it to force a breakpoint when it is
// reallocated.
// ---------------------------------------------------------------------------------------------------------------------------------

bool	&m_breakOnRealloc(void *reportedAddress)
{
	// Locate the existing allocation unit

	sAllocUnit	*au = findAllocUnit(reportedAddress);

	// If you hit this assert, you tried to set a breakpoint on reallocation for an address that doesn't exist. Interrogate the
	// stack frame or the variable 'au' to see which allocation this is.
	m_assert(au != NULL);

	// If you hit this assert, you tried to set a breakpoint on reallocation for an address that wasn't allocated in a way that
	// is compatible with reallocation.
	m_assert(au->allocationType == m_alloc_malloc ||
		 au->allocationType == m_alloc_calloc ||
		 au->allocationType == m_alloc_realloc);

	return au->breakOnRealloc;
}

// ---------------------------------------------------------------------------------------------------------------------------------
// -DOC- Simply call this routine with the address of an allocated block of RAM, to cause it to force a breakpoint when it is
// deallocated.
// ---------------------------------------------------------------------------------------------------------------------------------

bool	&m_breakOnDealloc(void *reportedAddress)
{
	// Locate the existing allocation unit

	sAllocUnit	*au = findAllocUnit(reportedAddress);

	// If you hit this assert, you tried to set a breakpoint on deallocation for an address that doesn't exist. Interrogate the
	// stack frame or the variable 'au' to see which allocation this is.
	m_assert(au != NULL);

	return au->breakOnDealloc;
}

// ---------------------------------------------------------------------------------------------------------------------------------
// -DOC- When tracking down a difficult bug, use this routine to force a breakpoint on a specific allocation count
// ---------------------------------------------------------------------------------------------------------------------------------

void	m_breakOnAllocation(unsigned int count)
{
	breakOnAllocationCount = count;
}

// ---------------------------------------------------------------------------------------------------------------------------------
// Used by the macros
// ---------------------------------------------------------------------------------------------------------------------------------

void	m_setOwner(const char *file, const unsigned int line, const char *func)
{
	// You're probably wondering about this...
	//
	// It's important for this memory manager to primarily work with global new/delete in their original forms (i.e. with
	// no extra parameters.) In order to do this, we use macros that call this function prior to operators new & delete. This
	// is fine... usually. Here's what actually happens when you use this macro to delete an object:
	//
	// m_setOwner(__FILE__, __LINE__, __FUNCTION__) --> object::~object() --> delete
	//
	// Note that the compiler inserts a call to the object's destructor just prior to calling our overridden operator delete.
	// But what happens when we delete an object whose destructor deletes another object, whose desctuctor deletes another
	// object? Here's a diagram (indentation follows stack depth):
	//
	// m_setOwner(...) -> ~obj1()                          // original call to delete obj1
	//     m_setOwner(...) -> ~obj2()                      // obj1's destructor deletes obj2
	//         m_setOwner(...) -> ~obj3()                  // obj2's destructor deletes obj3
	//             ...                                     // obj3's destructor just does some stuff
	//         delete                                      // back in obj2's destructor, we call delete
	//     delete                                          // back in obj1's destructor, we call delete
	// delete                                              // back to our original call, we call delete
	//
	// Because m_setOwner() just sets up some static variables (below) it's important that each call to m_setOwner() and
	// successive calls to new/delete alternate. However, in this case, three calls to m_setOwner() happen in succession
	// followed by three calls to delete in succession (with a few calls to destructors mixed in for fun.) This means that
	// only the final call to delete (in this chain of events) will have the proper reporting, and the first two in the chain
	// will not have ANY owner-reporting information. The deletes will still work fine, we just won't know who called us.
	//
	// "Then build a stack, my friend!" you might think... but it's a very common thing that people will be working with third-
	// party libraries (including MFC under Windows) which is not compiled with this memory manager's macros. In those cases,
	// m_setOwner() is never called, and rightfully should not have the proper trace-back information. So if one of the
	// destructors in the chain ends up being a call to a delete from a non-mmgr-compiled library, the stack will get confused.
	//
	// I've been unable to find a solution to this problem, but at least we can detect it and report the data before we
	// lose it. That's what this is all about. It makes it somewhat confusing to read in the logs, but at least ALL the
	// information is present...
	//
	// There's a caveat here... The compiler is not required to call operator delete if the value being deleted is NULL.
	// In this case, any call to delete with a NULL will sill call m_setOwner(), which will make m_setOwner() think that
	// there is a destructor chain becuase we setup the variables, but nothing gets called to clear them. Because of this
	// we report a "Possible destructor chain".
	//
	// Thanks to J. Woznack (from Kodiak Interactive Software Studios -- www.kodiakgames.com) for pointing this out.

	if (sourceLine && alwaysLogAll)
	{
		log("[I] NOTE! Possible destructor chain: previous owner is %s", ownerString(sourceFile, sourceLine, sourceFunc));
	}

	// Okay... save this stuff off so we can keep track of the caller

	sourceFile = file;
	sourceLine = line;
	sourceFunc = func;
}

// ---------------------------------------------------------------------------------------------------------------------------------

static	void	resetGlobals()
{
	sourceFile = "??";
	sourceLine = 0;
	sourceFunc = "??";
}

// ---------------------------------------------------------------------------------------------------------------------------------
// Global new/new[]
//
// These are the standard new/new[] operators. They are merely interface functions that operate like normal new/new[], but use our
// memory tracking routines.
// ---------------------------------------------------------------------------------------------------------------------------------

void	*operator new(size_t reportedSize)
{
	#ifdef TEST_MEMORY_MANAGER
	log("[D] ENTER: new");
	#endif

	// Save these off...

	const	char		*file = sourceFile;
	const	unsigned int	line = sourceLine;
	const	char		*func = sourceFunc;

	// ANSI says: allocation requests of 0 bytes will still return a valid value

	if (reportedSize == 0) reportedSize = 1;

	// ANSI says: loop continuously because the error handler could possibly free up some memory

	for(;;)
	{
		// Try the allocation

		void	*ptr = m_allocator(file, line, func, m_alloc_new, reportedSize);
		if (ptr)
		{
			#ifdef TEST_MEMORY_MANAGER
			log("[D] EXIT : new");
			#endif
			return ptr;
		}

		// There isn't a way to determine the new handler, except through setting it. So we'll just set it to NULL, then
		// set it back again.

		new_handler	nh = std::set_new_handler(0);
		std::set_new_handler(nh);

		// If there is an error handler, call it

		if (nh)
		{
			(*nh)();
		}

		// Otherwise, throw the exception

		else
		{
			#ifdef TEST_MEMORY_MANAGER
			log("[D] EXIT : new");
			#endif
			throw std::bad_alloc();
		}
	}
}

// ---------------------------------------------------------------------------------------------------------------------------------

void	*operator new[](size_t reportedSize)
{
	#ifdef TEST_MEMORY_MANAGER
	log("[D] ENTER: new[]");
	#endif

	// Save these off...

	const	char		*file = sourceFile;
	const	unsigned int	line = sourceLine;
	const	char		*func = sourceFunc;

	// The ANSI standard says that allocation requests of 0 bytes will still return a valid value

	if (reportedSize == 0) reportedSize = 1;

	// ANSI says: loop continuously because the error handler could possibly free up some memory

	for(;;)
	{
		// Try the allocation

		void	*ptr = m_allocator(file, line, func, m_alloc_new_array, reportedSize);
		if (ptr)
		{
			#ifdef TEST_MEMORY_MANAGER
			log("[D] EXIT : new[]");
			#endif
			return ptr;
		}

		// There isn't a way to determine the new handler, except through setting it. So we'll just set it to NULL, then
		// set it back again.

		new_handler	nh = std::set_new_handler(0);
		std::set_new_handler(nh);

		// If there is an error handler, call it

		if (nh)
		{
			(*nh)();
		}

		// Otherwise, throw the exception

		else
		{
			#ifdef TEST_MEMORY_MANAGER
			log("[D] EXIT : new[]");
			#endif
			throw std::bad_alloc();
		}
	}
}

// ---------------------------------------------------------------------------------------------------------------------------------
// Other global new/new[]
//
// These are the standard new/new[] operators as used by Microsoft's memory tracker. We don't want them interfering with our memory
// tracking efforts. Like the previous versions, these are merely interface functions that operate like normal new/new[], but use
// our memory tracking routines.
// ---------------------------------------------------------------------------------------------------------------------------------

void	*operator new(size_t reportedSize, const char *sourceFile, int sourceLine)
{
	#ifdef TEST_MEMORY_MANAGER
	log("[D] ENTER: new");
	#endif

	// The ANSI standard says that allocation requests of 0 bytes will still return a valid value

	if (reportedSize == 0) reportedSize = 1;

	// ANSI says: loop continuously because the error handler could possibly free up some memory

	for(;;)
	{
		// Try the allocation

		void	*ptr = m_allocator(sourceFile, sourceLine, "??", m_alloc_new, reportedSize);
		if (ptr)
		{
			#ifdef TEST_MEMORY_MANAGER
			log("[D] EXIT : new");
			#endif
			return ptr;
		}

		// There isn't a way to determine the new handler, except through setting it. So we'll just set it to NULL, then
		// set it back again.

		new_handler	nh = std::set_new_handler(0);
		std::set_new_handler(nh);

		// If there is an error handler, call it

		if (nh)
		{
			(*nh)();
		}

		// Otherwise, throw the exception

		else
		{
			#ifdef TEST_MEMORY_MANAGER
			log("[D] EXIT : new");
			#endif
			throw std::bad_alloc();
		}
	}
}

// ---------------------------------------------------------------------------------------------------------------------------------

void	*operator new[](size_t reportedSize, const char *sourceFile, int sourceLine)
{
	#ifdef TEST_MEMORY_MANAGER
	log("[D] ENTER: new[]");
	#endif

	// The ANSI standard says that allocation requests of 0 bytes will still return a valid value

	if (reportedSize == 0) reportedSize = 1;

	// ANSI says: loop continuously because the error handler could possibly free up some memory

	for(;;)
	{
		// Try the allocation

		void	*ptr = m_allocator(sourceFile, sourceLine, "??", m_alloc_new_array, reportedSize);
		if (ptr)
		{
			#ifdef TEST_MEMORY_MANAGER
			log("[D] EXIT : new[]");
			#endif
			return ptr;
		}

		// There isn't a way to determine the new handler, except through setting it. So we'll just set it to NULL, then
		// set it back again.

		new_handler	nh = std::set_new_handler(0);
		std::set_new_handler(nh);

		// If there is an error handler, call it

		if (nh)
		{
			(*nh)();
		}

		// Otherwise, throw the exception

		else
		{
			#ifdef TEST_MEMORY_MANAGER
			log("[D] EXIT : new[]");
			#endif
			throw std::bad_alloc();
		}
	}
}

// ---------------------------------------------------------------------------------------------------------------------------------
// Global delete/delete[]
//
// These are the standard delete/delete[] operators. They are merely interface functions that operate like normal delete/delete[],
// but use our memory tracking routines.
// ---------------------------------------------------------------------------------------------------------------------------------

void	operator delete(void *reportedAddress)
{
	#ifdef TEST_MEMORY_MANAGER
	log("[D] ENTER: delete");
	#endif

	// ANSI says: delete & delete[] allow NULL pointers (they do nothing)

	if (reportedAddress) m_deallocator(sourceFile, sourceLine, sourceFunc, m_alloc_delete, reportedAddress);
	else if (alwaysLogAll) log("[-] ----- %8s of NULL                      by %s", allocationTypes[m_alloc_delete], ownerString(sourceFile, sourceLine, sourceFunc));

	// Resetting the globals insures that if at some later time, somebody calls our memory manager from an unknown
	// source (i.e. they didn't include our H file) then we won't think it was the last allocation.

	resetGlobals();

	#ifdef TEST_MEMORY_MANAGER
	log("[D] EXIT : delete");
	#endif
}

// ---------------------------------------------------------------------------------------------------------------------------------

void	operator delete[](void *reportedAddress)
{
	#ifdef TEST_MEMORY_MANAGER
	log("[D] ENTER: delete[]");
	#endif

	// ANSI says: delete & delete[] allow NULL pointers (they do nothing)

	if (reportedAddress) m_deallocator(sourceFile, sourceLine, sourceFunc, m_alloc_delete_array, reportedAddress);
	else if (alwaysLogAll)
		log("[-] ----- %8s of NULL                      by %s", allocationTypes[m_alloc_delete_array], ownerString(sourceFile, sourceLine, sourceFunc));

	// Resetting the globals insures that if at some later time, somebody calls our memory manager from an unknown
	// source (i.e. they didn't include our H file) then we won't think it was the last allocation.

	resetGlobals();

	#ifdef TEST_MEMORY_MANAGER
	log("[D] EXIT : delete[]");
	#endif
}

// ---------------------------------------------------------------------------------------------------------------------------------
// Allocate memory and track it
// ---------------------------------------------------------------------------------------------------------------------------------

void	*m_allocator(const char *sourceFile, const unsigned int sourceLine, const char *sourceFunc, const unsigned int allocationType, const size_t reportedSize)
{
	try
	{
		#ifdef TEST_MEMORY_MANAGER
		log("[D] ENTER: m_allocator()");
		#endif

		// Increase our allocation count

		currentAllocationCount++;

		// Log the request

		if (alwaysLogAll) log("[+] %05d %8s of size 0x%08X(%08d) by %s", currentAllocationCount, allocationTypes[allocationType], reportedSize, reportedSize, ownerString(sourceFile, sourceLine, sourceFunc));

		// If you hit this assert, you requested a breakpoint on a specific allocation count
		m_assert(currentAllocationCount != breakOnAllocationCount);

		// If necessary, grow the reservoir of unused allocation units

		if (!reservoir)
		{
			// Allocate 256 reservoir elements

			reservoir = (sAllocUnit *) malloc(sizeof(sAllocUnit) * 256);

			// If you hit this assert, then the memory manager failed to allocate internal memory for tracking the
			// allocations
			m_assert(reservoir != NULL);

			// Danger Will Robinson!

			if (reservoir == NULL) throw "Unable to allocate RAM for internal memory tracking data";

			// Build a linked-list of the elements in our reservoir

			memset(reservoir, 0, sizeof(sAllocUnit) * 256);
			for (unsigned int i = 0; i < 256 - 1; i++)
			{
				reservoir[i].next = &reservoir[i+1];
			}

			// Add this address to our reservoirBuffer so we can free it later

			sAllocUnit	**temp = (sAllocUnit **) realloc(reservoirBuffer, (reservoirBufferSize + 1) * sizeof(sAllocUnit *));
			m_assert(temp);
			if (temp)
			{
				reservoirBuffer = temp;
				reservoirBuffer[reservoirBufferSize++] = reservoir;
			}
		}

		// Logical flow says this should never happen...
		m_assert(reservoir != NULL);

		// Grab a new allocaton unit from the front of the reservoir

		sAllocUnit	*au = reservoir;
		reservoir = au->next;

		// Populate it with some real data

		memset(au, 0, sizeof(sAllocUnit));
		au->actualSize        = calculateActualSize(reportedSize);
		#ifdef RANDOM_FAILURE
		double	a = rand();
		double	b = RAND_MAX / 100.0 * RANDOM_FAILURE;
		if (a > b)
		{
			au->actualAddress = malloc(au->actualSize);
		}
		else
		{
			log("[F] Random faiure");
			au->actualAddress = NULL;
		}
		#else
		au->actualAddress     = malloc(au->actualSize);
		#endif
		au->reportedSize      = reportedSize;
		au->reportedAddress   = calculateReportedAddress(au->actualAddress);
		au->allocationType    = allocationType;
		au->sourceLine        = sourceLine;
		au->allocationNumber  = currentAllocationCount;
		if (sourceFile) strncpy(au->sourceFile, sourceFileStripper(sourceFile), sizeof(au->sourceFile) - 1);
		else		strcpy (au->sourceFile, "??");
		if (sourceFunc) strncpy(au->sourceFunc, sourceFunc, sizeof(au->sourceFunc) - 1);
		else		strcpy (au->sourceFunc, "??");

		// We don't want to assert with random failures, because we want the application to deal with them.

		#ifndef RANDOM_FAILURE
		// If you hit this assert, then the requested allocation simply failed (you're out of memory.) Interrogate the
		// variable 'au' or the stack frame to see what you were trying to do.
		m_assert(au->actualAddress != NULL);
		#endif

		if (au->actualAddress == NULL)
		{
			throw "Request for allocation failed. Out of memory.";
		}

		// If you hit this assert, then this allocation was made from a source that isn't setup to use this memory tracking
		// software, use the stack frame to locate the source and include our H file.
		m_assert(allocationType != m_alloc_unknown);

		// Insert the new allocation into the hash table

		unsigned int	hashIndex = (reinterpret_cast<unsigned int>(au->reportedAddress) >> 4) & (hashSize - 1);
		if (hashTable[hashIndex]) hashTable[hashIndex]->prev = au;
		au->next = hashTable[hashIndex];
		au->prev = NULL;
		hashTable[hashIndex] = au;

		// Account for the new allocatin unit in our stats

		stats.totalReportedMemory += static_cast<unsigned int>(au->reportedSize);
		stats.totalActualMemory   += static_cast<unsigned int>(au->actualSize);
		stats.totalAllocUnitCount++;
		if (stats.totalReportedMemory > stats.peakReportedMemory) stats.peakReportedMemory = stats.totalReportedMemory;
		if (stats.totalActualMemory   > stats.peakActualMemory)   stats.peakActualMemory   = stats.totalActualMemory;
		if (stats.totalAllocUnitCount > stats.peakAllocUnitCount) stats.peakAllocUnitCount = stats.totalAllocUnitCount;
		stats.accumulatedReportedMemory += static_cast<unsigned int>(au->reportedSize);
		stats.accumulatedActualMemory += static_cast<unsigned int>(au->actualSize);
		stats.accumulatedAllocUnitCount++;

		// Prepare the allocation unit for use (wipe it with recognizable garbage)

		wipeWithPattern(au, unusedPattern);

		// calloc() expects the reported memory address range to be filled with 0's

		if (allocationType == m_alloc_calloc)
		{
			memset(au->reportedAddress, 0, au->reportedSize);
		}

		// Validate every single allocated unit in memory

		if (alwaysValidateAll) m_validateAllAllocUnits();

		// Log the result

		if (alwaysLogAll) log("[+] ---->             addr 0x%08X", reinterpret_cast<unsigned int>(au->reportedAddress));

		// Resetting the globals insures that if at some later time, somebody calls our memory manager from an unknown
		// source (i.e. they didn't include our H file) then we won't think it was the last allocation.

		resetGlobals();

		// Return the (reported) address of the new allocation unit

		#ifdef TEST_MEMORY_MANAGER
		log("[D] EXIT : m_allocator()");
		#endif

		return au->reportedAddress;
	}
	catch(const char *err)
	{
		// Deal with the errors

		log("[!] %s", err);
		resetGlobals();

		#ifdef TEST_MEMORY_MANAGER
		log("[D] EXIT : m_allocator()");
		#endif

		return NULL;
	}
}

// ---------------------------------------------------------------------------------------------------------------------------------
// Reallocate memory and track it
// ---------------------------------------------------------------------------------------------------------------------------------

void	*m_reallocator(const char *sourceFile, const unsigned int sourceLine, const char *sourceFunc, const unsigned int reallocationType, const size_t reportedSize, void *reportedAddress)
{
	try
	{
		#ifdef TEST_MEMORY_MANAGER
		log("[D] ENTER: m_reallocator()");
		#endif

		// Calling realloc with a NULL should force same operations as a malloc

		if (!reportedAddress)
		{
			return m_allocator(sourceFile, sourceLine, sourceFunc, reallocationType, reportedSize);
		}

		// Increase our allocation count

		currentAllocationCount++;

		// If you hit this assert, you requested a breakpoint on a specific allocation count
		m_assert(currentAllocationCount != breakOnAllocationCount);

		// Log the request

		if (alwaysLogAll) log("[~] %05d %8s of size 0x%08X(%08d) by %s", currentAllocationCount, allocationTypes[reallocationType], reportedSize, reportedSize, ownerString(sourceFile, sourceLine, sourceFunc));

		// Locate the existing allocation unit

		sAllocUnit	*au = findAllocUnit(reportedAddress);

		// If you hit this assert, you tried to reallocate RAM that wasn't allocated by this memory manager.
		m_assert(au != NULL);
		if (au == NULL) throw "Request to reallocate RAM that was never allocated";

		// If you hit this assert, then the allocation unit that is about to be reallocated is damaged. But you probably
		// already know that from a previous assert you should have seen in validateAllocUnit() :)
		m_assert(m_validateAllocUnit(au));

		// If you hit this assert, then this reallocation was made from a source that isn't setup to use this memory
		// tracking software, use the stack frame to locate the source and include our H file.
		m_assert(reallocationType != m_alloc_unknown);

		// If you hit this assert, you were trying to reallocate RAM that was not allocated in a way that is compatible with
		// realloc. In other words, you have a allocation/reallocation mismatch.
		m_assert(au->allocationType == m_alloc_malloc ||
			 au->allocationType == m_alloc_calloc ||
			 au->allocationType == m_alloc_realloc);

		// If you hit this assert, then the "break on realloc" flag for this allocation unit is set (and will continue to be
		// set until you specifically shut it off. Interrogate the 'au' variable to determine information about this
		// allocation unit.
		m_assert(au->breakOnRealloc == false);

		// Keep track of the original size

		unsigned int	originalReportedSize = static_cast<unsigned int>(au->reportedSize);

		if (alwaysLogAll) log("[~] ---->             from 0x%08X(%08d)", originalReportedSize, originalReportedSize);

		// Do the reallocation

		void	*oldReportedAddress = reportedAddress;
		size_t	newActualSize = calculateActualSize(reportedSize);
		void	*newActualAddress = NULL;
		#ifdef RANDOM_FAILURE
		double	a = rand();
		double	b = RAND_MAX / 100.0 * RANDOM_FAILURE;
		if (a > b)
		{
			newActualAddress = realloc(au->actualAddress, newActualSize);
		}
		else
		{
			log("[F] Random faiure");
		}
		#else
		newActualAddress = realloc(au->actualAddress, newActualSize);
		#endif

		// We don't want to assert with random failures, because we want the application to deal with them.

		#ifndef RANDOM_FAILURE
		// If you hit this assert, then the requested allocation simply failed (you're out of memory) Interrogate the
		// variable 'au' to see the original allocation. You can also query 'newActualSize' to see the amount of memory
		// trying to be allocated. Finally, you can query 'reportedSize' to see how much memory was requested by the caller.
		m_assert(newActualAddress);
		#endif

		if (!newActualAddress) throw "Request for reallocation failed. Out of memory.";

		// Remove this allocation from our stats (we'll add the new reallocation again later)

		stats.totalReportedMemory -= static_cast<unsigned int>(au->reportedSize);
		stats.totalActualMemory   -= static_cast<unsigned int>(au->actualSize);

		// Update the allocation with the new information

		au->actualSize        = newActualSize;
		au->actualAddress     = newActualAddress;
		au->reportedSize      = calculateReportedSize(newActualSize);
		au->reportedAddress   = calculateReportedAddress(newActualAddress);
		au->allocationType    = reallocationType;
		au->sourceLine        = sourceLine;
		au->allocationNumber  = currentAllocationCount;
		if (sourceFile) strncpy(au->sourceFile, sourceFileStripper(sourceFile), sizeof(au->sourceFile) - 1);
		else		strcpy (au->sourceFile, "??");
		if (sourceFunc) strncpy(au->sourceFunc, sourceFunc, sizeof(au->sourceFunc) - 1);
		else		strcpy (au->sourceFunc, "??");

		// The reallocation may cause the address to change, so we should relocate our allocation unit within the hash table

		unsigned int	hashIndex = static_cast<unsigned int>(-1);
		if (oldReportedAddress != au->reportedAddress)
		{
			// Remove this allocation unit from the hash table

			{
				unsigned int	hashIndex = (reinterpret_cast<unsigned int>(oldReportedAddress) >> 4) & (hashSize - 1);
				if (hashTable[hashIndex] == au)
				{
					hashTable[hashIndex] = hashTable[hashIndex]->next;
				}
				else
				{
					if (au->prev)	au->prev->next = au->next;
					if (au->next)	au->next->prev = au->prev;
				}
			}

			// Re-insert it back into the hash table

			hashIndex = (reinterpret_cast<unsigned int>(au->reportedAddress) >> 4) & (hashSize - 1);
			if (hashTable[hashIndex]) hashTable[hashIndex]->prev = au;
			au->next = hashTable[hashIndex];
			au->prev = NULL;
			hashTable[hashIndex] = au;
		}

		// Account for the new allocatin unit in our stats

		stats.totalReportedMemory += static_cast<unsigned int>(au->reportedSize);
		stats.totalActualMemory   += static_cast<unsigned int>(au->actualSize);
		if (stats.totalReportedMemory > stats.peakReportedMemory) stats.peakReportedMemory = stats.totalReportedMemory;
		if (stats.totalActualMemory   > stats.peakActualMemory)   stats.peakActualMemory   = stats.totalActualMemory;
		int	deltaReportedSize = static_cast<int>(reportedSize - originalReportedSize);
		if (deltaReportedSize > 0)
		{
			stats.accumulatedReportedMemory += deltaReportedSize;
			stats.accumulatedActualMemory += deltaReportedSize;
		}

		// Prepare the allocation unit for use (wipe it with recognizable garbage)

		wipeWithPattern(au, unusedPattern, originalReportedSize);

		// If you hit this assert, then something went wrong, because the allocation unit was properly validated PRIOR to
		// the reallocation. This should not happen.
		m_assert(m_validateAllocUnit(au));

		// Validate every single allocated unit in memory

		if (alwaysValidateAll) m_validateAllAllocUnits();

		// Log the result

		if (alwaysLogAll) log("[~] ---->             addr 0x%08X", reinterpret_cast<unsigned int>(au->reportedAddress));

		// Resetting the globals insures that if at some later time, somebody calls our memory manager from an unknown
		// source (i.e. they didn't include our H file) then we won't think it was the last allocation.

		resetGlobals();

		// Return the (reported) address of the new allocation unit

		#ifdef TEST_MEMORY_MANAGER
		log("[D] EXIT : m_reallocator()");
		#endif

		return au->reportedAddress;
	}
	catch(const char *err)
	{
		// Deal with the errors

		log("[!] %s", err);
		resetGlobals();

		#ifdef TEST_MEMORY_MANAGER
		log("[D] EXIT : m_reallocator()");
		#endif

		return NULL;
	}
}

// ---------------------------------------------------------------------------------------------------------------------------------
// Deallocate memory and track it
// ---------------------------------------------------------------------------------------------------------------------------------

void	m_deallocator(const char *sourceFile, const unsigned int sourceLine, const char *sourceFunc, const unsigned int deallocationType, const void *reportedAddress)
{
	try
	{
		#ifdef TEST_MEMORY_MANAGER
		log("[D] ENTER: m_deallocator()");
		#endif

		// Log the request

		if (alwaysLogAll) log("[-] ----- %8s of addr 0x%08X           by %s", allocationTypes[deallocationType], reinterpret_cast<unsigned int>(const_cast<void *>(reportedAddress)), ownerString(sourceFile, sourceLine, sourceFunc));

		// We should only ever get here with a null pointer if they try to do so with a call to free() (delete[] and delete will
		// both bail before they get here.) So, since ANSI allows free(NULL), we'll not bother trying to actually free the allocated
		// memory or track it any further.

		if (reportedAddress)
		{
			// Go get the allocation unit

			sAllocUnit	*au = findAllocUnit(reportedAddress);

			// If you hit this assert, you tried to deallocate RAM that wasn't allocated by this memory manager.
			m_assert(au != NULL);
			if (au == NULL) throw "Request to deallocate RAM that was never allocated";

			// If you hit this assert, then the allocation unit that is about to be deallocated is damaged. But you probably
			// already know that from a previous assert you should have seen in validateAllocUnit() :)
			m_assert(m_validateAllocUnit(au));

			// If you hit this assert, then this deallocation was made from a source that isn't setup to use this memory
			// tracking software, use the stack frame to locate the source and include our H file.
			m_assert(deallocationType != m_alloc_unknown);

			// If you hit this assert, you were trying to deallocate RAM that was not allocated in a way that is compatible with
			// the deallocation method requested. In other words, you have a allocation/deallocation mismatch.
			m_assert((deallocationType == m_alloc_delete       && au->allocationType == m_alloc_new      ) ||
				(deallocationType == m_alloc_delete_array && au->allocationType == m_alloc_new_array) ||
				(deallocationType == m_alloc_free         && au->allocationType == m_alloc_malloc   ) ||
				(deallocationType == m_alloc_free         && au->allocationType == m_alloc_calloc   ) ||
				(deallocationType == m_alloc_free         && au->allocationType == m_alloc_realloc  ) ||
				(deallocationType == m_alloc_unknown                                                ) );

			// If you hit this assert, then the "break on dealloc" flag for this allocation unit is set. Interrogate the 'au'
			// variable to determine information about this allocation unit.
			m_assert(au->breakOnDealloc == false);

			// Wipe the deallocated RAM with a new pattern. This doen't actually do us much good in debug mode under WIN32,
			// because Microsoft's memory debugging & tracking utilities will wipe it right after we do. Oh well.

			wipeWithPattern(au, releasedPattern);

			// Do the deallocation

			free(au->actualAddress);

			// Remove this allocation unit from the hash table

			unsigned int	hashIndex = (reinterpret_cast<unsigned int>(au->reportedAddress) >> 4) & (hashSize - 1);
			if (hashTable[hashIndex] == au)
			{
				hashTable[hashIndex] = au->next;
			}
			else
			{
				if (au->prev)	au->prev->next = au->next;
				if (au->next)	au->next->prev = au->prev;
			}

			// Remove this allocation from our stats

			stats.totalReportedMemory -= static_cast<unsigned int>(au->reportedSize);
			stats.totalActualMemory   -= static_cast<unsigned int>(au->actualSize);
			stats.totalAllocUnitCount--;

			// Add this allocation unit to the front of our reservoir of unused allocation units

			memset(au, 0, sizeof(sAllocUnit));
			au->next = reservoir;
			reservoir = au;
		}

		// Resetting the globals insures that if at some later time, somebody calls our memory manager from an unknown
		// source (i.e. they didn't include our H file) then we won't think it was the last allocation.

		resetGlobals();

		// Validate every single allocated unit in memory

		if (alwaysValidateAll) m_validateAllAllocUnits();

		// If we're in the midst of static deinitialization time, track any pending memory leaks

		if (staticDeinitTime) dumpLeakReport();
	}
	catch(const char *err)
	{
		// Deal with errors

		log("[!] %s", err);
		resetGlobals();
	}

	#ifdef TEST_MEMORY_MANAGER
	log("[D] EXIT : m_deallocator()");
	#endif
}

// ---------------------------------------------------------------------------------------------------------------------------------
// -DOC- The following utilitarian allow you to become proactive in tracking your own memory, or help you narrow in on those tough
// bugs.
// ---------------------------------------------------------------------------------------------------------------------------------

bool	m_validateAddress(const void *reportedAddress)
{
	// Just see if the address exists in our allocation routines

	return findAllocUnit(reportedAddress) != NULL;
}

// ---------------------------------------------------------------------------------------------------------------------------------

bool	m_validateAllocUnit(const sAllocUnit *allocUnit)
{
	// Make sure the padding is untouched

	long	*pre = reinterpret_cast<long *>(allocUnit->actualAddress);
	long	*post = reinterpret_cast<long *>((char *)allocUnit->actualAddress + allocUnit->actualSize - paddingSize * sizeof(long));
	bool	errorFlag = false;
	for (unsigned int i = 0; i < paddingSize; i++, pre++, post++)
	{
		if (*pre != (long) prefixPattern)
		{
			log("[!] A memory allocation unit was corrupt because of an underrun:");
			m_dumpAllocUnit(allocUnit, "  ");
			errorFlag = true;
		}

		// If you hit this assert, then you should know that this allocation unit has been damaged. Something (possibly the
		// owner?) has underrun the allocation unit (modified a few bytes prior to the start). You can interrogate the
		// variable 'allocUnit' to see statistics and information about this damaged allocation unit.
		m_assert(*pre == static_cast<long>(prefixPattern));

		if (*post != static_cast<long>(postfixPattern))
		{
			log("[!] A memory allocation unit was corrupt because of an overrun:");
			m_dumpAllocUnit(allocUnit, "  ");
			errorFlag = true;
		}

		// If you hit this assert, then you should know that this allocation unit has been damaged. Something (possibly the
		// owner?) has overrun the allocation unit (modified a few bytes after the end). You can interrogate the variable
		// 'allocUnit' to see statistics and information about this damaged allocation unit.
		m_assert(*post == static_cast<long>(postfixPattern));
	}

	// Return the error status (we invert it, because a return of 'false' means error)

	return !errorFlag;
}

// ---------------------------------------------------------------------------------------------------------------------------------

bool	m_validateAllAllocUnits()
{
	// Just go through each allocation unit in the hash table and count the ones that have errors

	unsigned int	errors = 0;
	unsigned int	allocCount = 0;
	for (unsigned int i = 0; i < hashSize; i++)
	{
		sAllocUnit	*ptr = hashTable[i];
		while(ptr)
		{
			allocCount++;
			if (!m_validateAllocUnit(ptr)) errors++;
			ptr = ptr->next;
		}
	}

	// Test for hash-table correctness

	if (allocCount != stats.totalAllocUnitCount)
	{
		log("[!] Memory tracking hash table corrupt!");
		errors++;
	}

	// If you hit this assert, then the internal memory (hash table) used by this memory tracking software is damaged! The
	// best way to track this down is to use the alwaysLogAll flag in conjunction with STRESS_TEST macro to narrow in on the
	// offending code. After running the application with these settings (and hitting this assert again), interrogate the
	// memory.log file to find the previous successful operation. The corruption will have occurred between that point and this
	// assertion.
	m_assert(allocCount == stats.totalAllocUnitCount);

	// If you hit this assert, then you've probably already been notified that there was a problem with a allocation unit in a
	// prior call to validateAllocUnit(), but this assert is here just to make sure you know about it. :)
	m_assert(errors == 0);

	// Log any errors

	if (errors) log("[!] While validting all allocation units, %d allocation unit(s) were found to have problems", errors);

	// Return the error status

	return errors != 0;
}

// ---------------------------------------------------------------------------------------------------------------------------------
// -DOC- Unused RAM calculation routines. Use these to determine how much of your RAM is unused (in bytes)
// ---------------------------------------------------------------------------------------------------------------------------------

unsigned int	m_calcUnused(const sAllocUnit *allocUnit)
{
	const unsigned long	*ptr = reinterpret_cast<const unsigned long *>(allocUnit->reportedAddress);
	unsigned int		count = 0;

	for (unsigned int i = 0; i < allocUnit->reportedSize; i += sizeof(long), ptr++)
	{
		if (*ptr == unusedPattern) count += sizeof(long);
	}

	return count;
}

// ---------------------------------------------------------------------------------------------------------------------------------

unsigned int	m_calcAllUnused()
{
	// Just go through each allocation unit in the hash table and count the unused RAM

	unsigned int	total = 0;
	for (unsigned int i = 0; i < hashSize; i++)
	{
		sAllocUnit	*ptr = hashTable[i];
		while(ptr)
		{
			total += m_calcUnused(ptr);
			ptr = ptr->next;
		}
	}

	return total;
}

// ---------------------------------------------------------------------------------------------------------------------------------
// -DOC- The following functions are for logging and statistics reporting.
// ---------------------------------------------------------------------------------------------------------------------------------

void	m_dumpAllocUnit(const sAllocUnit *allocUnit, const char *prefix)
{
	log("[I] %sAddress (reported): %010p",       prefix, allocUnit->reportedAddress);
	log("[I] %sAddress (actual)  : %010p",       prefix, allocUnit->actualAddress);
	log("[I] %sSize (reported)   : 0x%08X (%s)", prefix, static_cast<unsigned int>(allocUnit->reportedSize), memorySizeString(static_cast<unsigned int>(allocUnit->reportedSize)));
	log("[I] %sSize (actual)     : 0x%08X (%s)", prefix, static_cast<unsigned int>(allocUnit->actualSize), memorySizeString(static_cast<unsigned int>(allocUnit->actualSize)));
	log("[I] %sOwner             : %s(%d)::%s",  prefix, allocUnit->sourceFile, allocUnit->sourceLine, allocUnit->sourceFunc);
	log("[I] %sAllocation type   : %s",          prefix, allocationTypes[allocUnit->allocationType]);
	log("[I] %sAllocation number : %d",          prefix, allocUnit->allocationNumber);
}

// ---------------------------------------------------------------------------------------------------------------------------------

void	m_dumpMemoryReport(const char *filename, const bool overwrite)
{
	// Open the report file

	FILE	*fp = NULL;

	if (overwrite)	fp = fopen(filename, "w+b");
	else		fp = fopen(filename, "ab");

	// If you hit this assert, then the memory report generator is unable to log information to a file (can't open the file for
	// some reason.)
	m_assert(fp);
	if (!fp) return;

        // Header

        static  char    timeString[25];
        memset(timeString, 0, sizeof(timeString));
        time_t  t = time(NULL);
        struct  tm *tme = localtime(&t);
	fprintf(fp, " ---------------------------------------------------------------------------------------------------------------------------------- \r\n");
        fprintf(fp, "|                                             Memory report for: %02d/%02d/%04d %02d:%02d:%02d                                               |\r\n", tme->tm_mon + 1, tme->tm_mday, tme->tm_year + 1900, tme->tm_hour, tme->tm_min, tme->tm_sec);
	fprintf(fp, " ---------------------------------------------------------------------------------------------------------------------------------- \r\n");
	fprintf(fp, "\r\n");
	fprintf(fp, "\r\n");

	// Report summary

	fprintf(fp, " ---------------------------------------------------------------------------------------------------------------------------------- \r\n");
	fprintf(fp, "|                                                           T O T A L S                                                            |\r\n");
	fprintf(fp, " ---------------------------------------------------------------------------------------------------------------------------------- \r\n");
	fprintf(fp, "              Allocation unit count: %10s\r\n", insertCommas(stats.totalAllocUnitCount));
	fprintf(fp, "            Reported to application: %s\r\n", memorySizeString(stats.totalReportedMemory));
	fprintf(fp, "         Actual total memory in use: %s\r\n", memorySizeString(stats.totalActualMemory));
	fprintf(fp, "           Memory tracking overhead: %s\r\n", memorySizeString(stats.totalActualMemory - stats.totalReportedMemory));
	fprintf(fp, "\r\n");

	fprintf(fp, " ---------------------------------------------------------------------------------------------------------------------------------- \r\n");
	fprintf(fp, "|                                                            P E A K S                                                             |\r\n");
	fprintf(fp, " ---------------------------------------------------------------------------------------------------------------------------------- \r\n");
	fprintf(fp, "              Allocation unit count: %10s\r\n", insertCommas(stats.peakAllocUnitCount));
	fprintf(fp, "            Reported to application: %s\r\n", memorySizeString(stats.peakReportedMemory));
	fprintf(fp, "                             Actual: %s\r\n", memorySizeString(stats.peakActualMemory));
	fprintf(fp, "           Memory tracking overhead: %s\r\n", memorySizeString(stats.peakActualMemory - stats.peakReportedMemory));
	fprintf(fp, "\r\n");

	fprintf(fp, " ---------------------------------------------------------------------------------------------------------------------------------- \r\n");
	fprintf(fp, "|                                                      A C C U M U L A T E D                                                       |\r\n");
	fprintf(fp, " ---------------------------------------------------------------------------------------------------------------------------------- \r\n");
	fprintf(fp, "              Allocation unit count: %s\r\n", memorySizeString(stats.accumulatedAllocUnitCount));
	fprintf(fp, "            Reported to application: %s\r\n", memorySizeString(stats.accumulatedReportedMemory));
	fprintf(fp, "                             Actual: %s\r\n", memorySizeString(stats.accumulatedActualMemory));
	fprintf(fp, "\r\n");

	fprintf(fp, " ---------------------------------------------------------------------------------------------------------------------------------- \r\n");
	fprintf(fp, "|                                                           U N U S E D                                                            |\r\n");
	fprintf(fp, " ---------------------------------------------------------------------------------------------------------------------------------- \r\n");
	fprintf(fp, "    Memory allocated but not in use: %s\r\n", memorySizeString(m_calcAllUnused()));
	fprintf(fp, "\r\n");

	dumpAllocations(fp);

	fclose(fp);
}

// ---------------------------------------------------------------------------------------------------------------------------------

sMStats	m_getMemoryStatistics()
{
	return stats;
}

// ---------------------------------------------------------------------------------------------------------------------------------
// mmgr.cpp - End of file
// ---------------------------------------------------------------------------------------------------------------------------------
