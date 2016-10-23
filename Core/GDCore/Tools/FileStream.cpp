#include "GDCore/Tools/FileStream.h"

#if defined(WINDOWS)
#if __GLIBCXX__
#include <ext/stdio_filebuf.h>
#endif
#endif

namespace gd
{

namespace
{

#if FSTREAM_WINDOWS_MINGW

#define MODE( in_val, out_val, trunc_val, app_val ) \
	( \
		((( mode & std::ios_base::in ) != 0) == in_val) && \
		((( mode & std::ios_base::out ) != 0) == out_val) && \
		((( mode & std::ios_base::trunc ) != 0) == trunc_val) && \
		((( mode & std::ios_base::app ) != 0) == app_val) \
	)

std::wstring GetStdioMode(std::ios_base::openmode mode)
{
	std::wstring strMode;

	/// Thanks to https://gcc.gnu.org/ml/libstdc++/2007-06/msg00013.html
	if(MODE(false, true, false, false)) strMode += L"w";
	else if(MODE(false, true, false, true)) strMode += L"a";
	else if(MODE(true, true, false, true)) strMode += L"a+";
	else if(MODE(false, true, true, false)) strMode += L"w";
	else if(MODE(true, false, false, false)) strMode += L"r";
	else if(MODE(true, true, false, false)) strMode += L"r+";
	else if(MODE(true, true, true, false)) strMode += L"w+";

	if(mode & std::ios_base::binary) strMode += L"b";

	return strMode;
}
#endif

FileStream::InternalBufferType* OpenBuffer(const gd::String & path, std::ios_base::openmode mode) {
#if FSTREAM_WINDOWS_MINGW
	FILE* c_file = _wfopen(path.ToWide().c_str(), GetStdioMode(mode).c_str());
	if(!c_file)
		return nullptr;
	return new __gnu_cxx::stdio_filebuf<char>(c_file, mode, 1);
#else
	auto * filebuffer =  new std::filebuf();
	return filebuffer->open(path.ToUTF8().c_str(), mode);
#endif
}

}

FileStream::FileStream()
{

}

FileStream::FileStream(const gd::String & path, std::ios_base::openmode mode) :
	std::iostream(),
	m_buffer(OpenBuffer(path, mode))
{
	setstate(ios_base::goodbit);
	if(m_buffer)
	{
		std::iostream::rdbuf(m_buffer.get());
		if((mode & std::ios_base::ate) != 0)
			seekg(0, end);
	}
	else
		setstate(ios_base::badbit);
}

/*
WILL WORK with GCC>=5 (not 4.9 used on Windows)
FileStream::FileStream(FileStream && other) :
	std::iostream(std::move(other)),
	m_buffer(std::move(other.m_buffer))
{

}*/

/*FileStream& FileStream::operator=(FileStream && other)
{
	std::iostream::operator=(std::move(other));
	m_buffer = std::move(other.m_buffer);
}*/

void FileStream::open(const gd::String & path, std::ios_base::openmode mode)
{
	setstate(ios_base::goodbit);

	if(is_open())
	{
		setstate(ios_base::failbit);
	}
	else
	{
		auto * newBuffer = OpenBuffer(path, mode);
		if(newBuffer)
		{
			m_buffer.reset(newBuffer);
			std::iostream::rdbuf(m_buffer.get());
			if((mode & std::ios_base::ate) != 0)
				seekg(0, end);
		}
		else
			setstate(ios_base::badbit);
	}

}

bool FileStream::is_open() const
{
	if(!m_buffer)
		return false;
	return m_buffer->is_open();
}

void FileStream::close()
{
	if(!m_buffer->close())
		setstate(ios_base::failbit);
}

/*void FileStream::swap(FileStream & other) //WILL WORK with GCC>=5 (not 4.9 used on Windows)
{
	std::iostream::swap(other);
	std::swap(m_buffer, other.m_buffer);
}*/

SFMLFileStream::SFMLFileStream() :
	m_file(nullptr)
{
}

SFMLFileStream::~SFMLFileStream()
{
    if (m_file)
        fclose(m_file);
}

bool SFMLFileStream::open(const gd::String & filename)
{
    if (m_file)
        fclose(m_file);

#if FSTREAM_WINDOWS_MINGW
	m_file = _wfopen(filename.ToWide().c_str(), L"rb");
#else
    m_file = fopen(filename.ToLocale().c_str(), "rb");
#endif

    return m_file != NULL;
}

sf::Int64 SFMLFileStream::read(void* data, sf::Int64 size)
{
    if (m_file)
        return fread(data, 1, static_cast<std::size_t>(size), m_file);
    else
        return -1;
}

sf::Int64 SFMLFileStream::seek(sf::Int64 position)
{
    if (m_file)
    {
        fseek(m_file, static_cast<std::size_t>(position), SEEK_SET);
        return tell();
    }
    else
    {
        return -1;
    }
}

sf::Int64 SFMLFileStream::tell()
{
    if (m_file)
        return ftell(m_file);
    else
        return -1;
}

sf::Int64 SFMLFileStream::getSize()
{
    if (m_file)
    {
        sf::Int64 position = tell();
        fseek(m_file, 0, SEEK_END);
        sf::Int64 size = tell();
        seek(position);
        return size;
    }
    else
    {
        return -1;
    }
}

}
