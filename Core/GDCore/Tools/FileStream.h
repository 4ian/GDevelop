#ifndef GDCORE_FSTREAMTOOLS
#define GDCORE_FSTREAMTOOLS

#include <memory>
#include <iostream>

#include <SFML/System.hpp>

#include "GDCore/String.h"

#define FSTREAM_WINDOWS_MINGW defined(WINDOWS) && __GLIBCXX__

#if FSTREAM_WINDOWS_MINGW
#include <ext/stdio_filebuf.h>
#else
#include <fstream> //for std::filebuf
#endif

namespace gd
{

/**
 * Similar to std::i/ofstream except that it can open file with
 * gd::String paths (useful on Windows where fstream doesn't
 * support wide paths).
 */
class GD_CORE_API FileStream : public std::iostream
{
public:
#if FSTREAM_WINDOWS_MINGW
	using InternalBufferType = __gnu_cxx::stdio_filebuf<char>;
#else
	using InternalBufferType = std::filebuf;
#endif

	FileStream();
	FileStream(const gd::String & path, std::ios_base::openmode mode = std::ios_base::in | std::ios_base::out);
	~FileStream();

	FileStream(const FileStream & other) = delete;
	FileStream(FileStream && other) = delete; //HACK for GCC 4.9 (Windows)
	//FileStream(FileStream && other); WILL WORK with GCC>=5 (not 4.9 used on Windows)

	FileStream& operator=(const FileStream & other) = delete;
	FileStream& operator=(FileStream && other) = delete; //HACK for GCC 4.9 (Windows)
	//FileStream& operator=(FileStream && other); WILL WORK with GCC>=5 (not 4.9 used on Windows)

	void open(const gd::String & path, std::ios_base::openmode mode = std::ios_base::in | std::ios_base::out);

	bool is_open() const;

	void close();

	// void swap(FileStream & other); //WILL WORK with GCC>=5 (not 4.9 used on Windows)

private:
	FILE * m_file;
	std::unique_ptr<InternalBufferType> m_buffer;
};

class GD_CORE_API SFMLFileStream : public sf::InputStream
{
public :

    SFMLFileStream();
	~SFMLFileStream();

    bool open(const gd::String& filename);

    virtual sf::Int64 read(void* data, sf::Int64 size);

    virtual sf::Int64 seek(sf::Int64 position);

    virtual sf::Int64 tell();

    virtual sf::Int64 getSize();

private :

    FILE * m_file;
};

}

#endif
