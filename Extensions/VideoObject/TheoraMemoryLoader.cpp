#include "TheoraMemoryLoader.h"
#include <memory.h>

TheoraMemoryLoader::TheoraMemoryLoader(std::string name, unsigned char *source, unsigned long size) :
	mReadPointer(0),
	mData(0)
{
	mName = name;
	mData = source;
	mSize = size;
}

TheoraMemoryLoader::~TheoraMemoryLoader()
{
	//if (mData) delete [] mData;
}

int TheoraMemoryLoader::read(void* output,int nBytes)
{
	int n=(mReadPointer+nBytes <= mSize) ? nBytes : mSize-mReadPointer;
	if (!n) return 0;
	memcpy(output,mData+mReadPointer,n);
	mReadPointer+=n;
	return n;
}

void TheoraMemoryLoader::seek(unsigned long byte_index)
{
	mReadPointer=byte_index;
}

unsigned long TheoraMemoryLoader::size()
{
	return mSize;
}

unsigned long TheoraMemoryLoader::tell()
{
	return mReadPointer;
}

