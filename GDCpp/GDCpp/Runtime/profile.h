#if defined(GD_IDE_ONLY) || defined(DEBUG) || defined(DEV)

/***************************************************************************************************
**
** Real-Time Hierarchical Profiling for Game Programming Gems 3
**
** by Greg Hjelstrom & Byon Garrabrant
**
***************************************************************************************************/

// Credits: The Clock class was inspired by the Timer classes in
// Ogre (www.ogre3d.org).
#ifndef QUICK_PROF_H
#define QUICK_PROF_H

//To disable built-in profiling, please comment out next line
//#define BT_NO_PROFILE 1
#ifndef BT_NO_PROFILE

#include "GDCpp/Runtime/btScalar.h"
#include "GDCpp/Runtime/btAlignedAllocator.h"
#include <new>

//if you don't need btClock, you can comment next line
#define USE_BT_CLOCK 1

#ifdef USE_BT_CLOCK
#ifdef __CELLOS_LV2__
#include <sys/sys_time.h>
#include <sys/time_util.h>
#include <stdio.h>
#endif

#if defined (SUNOS) || defined (__SUNOS__)
#include <stdio.h>
#endif

#if defined(WIN32) || defined(_WIN32)

#define USE_WINDOWS_TIMERS
#define WIN32_LEAN_AND_MEAN
#define NOWINRES
#define NOMCX
#define NOIME
#ifdef _XBOX
#include <Xtl.h>
#else

#include <windows.h>

#if defined(GD_IDE_ONLY)

#ifdef ___WXMSW___
#include <wx/msw/winundef.h>
#endif

#endif

#endif
#include <time.h>

#else
#include <sys/time.h>
#endif

#define mymin(a,b) (a > b ? a : b)

///The btClock is a portable basic clock that measures accurate time in seconds, use for profiling.
class btClock
{
public:
	btClock()
	{
#ifdef USE_WINDOWS_TIMERS
		QueryPerformanceFrequency(&mClockFrequency);
#endif
		reset();
	}

	~btClock()
	{
	}

	/// Resets the initial reference time.
	void reset()
	{
#ifdef USE_WINDOWS_TIMERS
		QueryPerformanceCounter(&mStartTime);
		mStartTick = GetTickCount();
		mPrevElapsedTime = 0;
#else
#ifdef __CELLOS_LV2__

		typedef uint64_t  ClockSize;
		ClockSize newTime;
		//__asm __volatile__( "mftb %0" : "=r" (newTime) : : "memory");
		SYS_TIMEBASE_GET( newTime );
		mStartTime = newTime;
#else
		gettimeofday(&mStartTime, 0);
#endif

#endif
	}

	/// Returns the time in ms since the last call to reset or since
	/// the btClock was created.
	unsigned long int getTimeMilliseconds()
	{
#ifdef USE_WINDOWS_TIMERS
		LARGE_INTEGER currentTime;
		QueryPerformanceCounter(&currentTime);
		LONGLONG elapsedTime = currentTime.QuadPart -
			mStartTime.QuadPart;

		// Compute the number of millisecond ticks elapsed.
		unsigned long msecTicks = (unsigned long)(1000 * elapsedTime /
			mClockFrequency.QuadPart);

		// Check for unexpected leaps in the Win32 performance counter.
		// (This is caused by unexpected data across the PCI to ISA
		// bridge, aka south bridge.  See Microsoft KB274323.)
		unsigned long elapsedTicks = GetTickCount() - mStartTick;
		signed long msecOff = (signed long)(msecTicks - elapsedTicks);
		if (msecOff < -100 || msecOff > 100)
		{
			// Adjust the starting time forwards.
			LONGLONG msecAdjustment = mymin(msecOff *
				mClockFrequency.QuadPart / 1000, elapsedTime -
				mPrevElapsedTime);
			mStartTime.QuadPart += msecAdjustment;
			elapsedTime -= msecAdjustment;

			// Recompute the number of millisecond ticks elapsed.
			msecTicks = (unsigned long)(1000 * elapsedTime /
				mClockFrequency.QuadPart);
		}

		// Store the current elapsed time for adjustments next time.
		mPrevElapsedTime = elapsedTime;

		return msecTicks;
#else

#ifdef __CELLOS_LV2__
		uint64_t freq=sys_time_get_timebase_frequency();
		double dFreq=((double) freq) / 1000.0;
		typedef uint64_t  ClockSize;
		ClockSize newTime;
		SYS_TIMEBASE_GET( newTime );
		//__asm __volatile__( "mftb %0" : "=r" (newTime) : : "memory");

		return (unsigned long int)((double(newTime-mStartTime)) / dFreq);
#else

		struct timeval currentTime;
		gettimeofday(&currentTime, 0);
		return (currentTime.tv_sec - mStartTime.tv_sec) * 1000 +
			(currentTime.tv_usec - mStartTime.tv_usec) / 1000;
#endif //__CELLOS_LV2__
#endif
	}

	/// Returns the time in us since the last call to reset or since
	/// the Clock was created.
	unsigned long int getTimeMicroseconds()
	{
#ifdef USE_WINDOWS_TIMERS
		LARGE_INTEGER currentTime;
		QueryPerformanceCounter(&currentTime);
		LONGLONG elapsedTime = currentTime.QuadPart -
			mStartTime.QuadPart;

		// Compute the number of millisecond ticks elapsed.
		unsigned long msecTicks = (unsigned long)(1000 * elapsedTime /
			mClockFrequency.QuadPart);

		// Check for unexpected leaps in the Win32 performance counter.
		// (This is caused by unexpected data across the PCI to ISA
		// bridge, aka south bridge.  See Microsoft KB274323.)
		unsigned long elapsedTicks = GetTickCount() - mStartTick;
		signed long msecOff = (signed long)(msecTicks - elapsedTicks);
		if (msecOff < -100 || msecOff > 100)
		{
			// Adjust the starting time forwards.
			LONGLONG msecAdjustment = mymin(msecOff *
				mClockFrequency.QuadPart / 1000, elapsedTime -
				mPrevElapsedTime);
			mStartTime.QuadPart += msecAdjustment;
			elapsedTime -= msecAdjustment;
		}

		// Store the current elapsed time for adjustments next time.
		mPrevElapsedTime = elapsedTime;

		// Convert to microseconds.
		unsigned long usecTicks = (unsigned long)(1000000 * elapsedTime /
			mClockFrequency.QuadPart);

		return usecTicks;
#else

#ifdef __CELLOS_LV2__
		uint64_t freq=sys_time_get_timebase_frequency();
		double dFreq=((double) freq)/ 1000000.0;
		typedef uint64_t  ClockSize;
		ClockSize newTime;
		//__asm __volatile__( "mftb %0" : "=r" (newTime) : : "memory");
		SYS_TIMEBASE_GET( newTime );

		return (unsigned long int)((double(newTime-mStartTime)) / dFreq);
#else

		struct timeval currentTime;
		gettimeofday(&currentTime, 0);
		return (currentTime.tv_sec - mStartTime.tv_sec) * 1000000 +
			(currentTime.tv_usec - mStartTime.tv_usec);
#endif//__CELLOS_LV2__
#endif
	}

private:
#ifdef USE_WINDOWS_TIMERS
	LARGE_INTEGER mClockFrequency;
	DWORD mStartTick;
	LONGLONG mPrevElapsedTime;
	LARGE_INTEGER mStartTime;
#else
#ifdef __CELLOS_LV2__
	uint64_t	mStartTime;
#else
	struct timeval mStartTime;
#endif
#endif //__CELLOS_LV2__

};

#endif //USE_BT_CLOCK

///A node in the Profile Hierarchy Tree
class	CProfileNode {

public:
	CProfileNode( const char * name, CProfileNode * parent );
	~CProfileNode( void );

	CProfileNode * Get_Sub_Node( const char * name );

	CProfileNode * Get_Parent( void )		{ return Parent; }
	CProfileNode * Get_Sibling( void )		{ return Sibling; }
	CProfileNode * Get_Child( void )			{ return Child; }

	void				CleanupMemory();
	void				Reset( void );
	void				Call( void );
	bool				Return( void );

	const char *	Get_Name( void )				{ return Name; }
	int				Get_Total_Calls( void )		{ return TotalCalls; }
	float				Get_Total_Time( void )		{ return TotalTime; }

protected:

	const char *	Name;
	int				TotalCalls;
	float				TotalTime;
	unsigned long int			StartTime;
	int				RecursionCounter;

	CProfileNode *	Parent;
	CProfileNode *	Child;
	CProfileNode *	Sibling;
};

///An iterator to navigate through the tree
class CProfileIterator
{
public:
	// Access all the children of the current parent
	void				First(void);
	void				Next(void);
	bool				Is_Done(void);
	bool                Is_Root(void) { return (CurrentParent->Get_Parent() == 0); }

	void				Enter_Child( int index );		// Make the given child the new parent
	void				Enter_Largest_Child( void );	// Make the largest child the new parent
	void				Enter_Parent( void );			// Make the current parent's parent the new parent

	// Access the current child
	const char *	Get_Current_Name( void )			{ return CurrentChild->Get_Name(); }
	int				Get_Current_Total_Calls( void )	{ return CurrentChild->Get_Total_Calls(); }
	float				Get_Current_Total_Time( void )	{ return CurrentChild->Get_Total_Time(); }

	// Access the current parent
	const char *	Get_Current_Parent_Name( void )			{ return CurrentParent->Get_Name(); }
	int				Get_Current_Parent_Total_Calls( void )	{ return CurrentParent->Get_Total_Calls(); }
	float				Get_Current_Parent_Total_Time( void )	{ return CurrentParent->Get_Total_Time(); }

protected:

	CProfileNode *	CurrentParent;
	CProfileNode *	CurrentChild;

	CProfileIterator( CProfileNode * start );
	friend	class		CProfileManager;
};


///The Manager for the Profile system
class	GD_API CProfileManager {
public:
	static	void						Start_Profile( const char * name );
	static	void						Stop_Profile( void );

	static	void						CleanupMemory(void)
	{
		Root.CleanupMemory();
	}

	static	void						Reset( void );
	static	void						Increment_Frame_Counter( void );
	static	int						Get_Frame_Count_Since_Reset( void )		{ return FrameCounter; }
	static	float						Get_Time_Since_Reset( void );

	static	CProfileIterator *	Get_Iterator( void )
	{

		return new CProfileIterator( &Root );
	}
	static	void						Release_Iterator( CProfileIterator * iterator ) { delete ( iterator); }

	static void	dumpRecursive(CProfileIterator* profileIterator, int spacing);

	static void	dumpAll();

private:
	static	CProfileNode			Root;
	static	CProfileNode *			CurrentNode;
	static	int						FrameCounter;
	static	unsigned long int					ResetTime;
};


///ProfileSampleClass is a simple way to profile a function's scope
///Use the BT_PROFILE macro at the start of scope to time
class	CProfileSample {
public:
	CProfileSample( const char * name )
	{
		CProfileManager::Start_Profile( name );
	}

	~CProfileSample( void )
	{
		CProfileManager::Stop_Profile();
	}
};


#define	BT_PROFILE( name )			CProfileSample __profile( name )

#else

#define	BT_PROFILE( name )

#endif //#ifndef BT_NO_PROFILE
#endif //QUICK_PROF_H

#undef LoadImage

#endif

