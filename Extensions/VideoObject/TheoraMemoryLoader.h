#ifndef _THEORAMEMORYLOADER_H
#define _THEORAMEMORYLOADER_H

#include <string>
#include <stdio.h>
#include "TheoraDataSource.h"

/**
 * \brief Simple class to load a video from memory
 */
class TheoraMemoryLoader : public TheoraDataSource
{
    std::string mName;
	unsigned long mSize,mReadPointer;
	unsigned char* mData;
public:
	TheoraMemoryLoader(std::string name, unsigned char *source, unsigned long size);
	~TheoraMemoryLoader();

	int read(void* output,int nBytes);
	void seek(unsigned long byte_index);

	std::string repr() { return "Memory:"+mName; }
	unsigned long size();
	unsigned long tell();
};

#endif

