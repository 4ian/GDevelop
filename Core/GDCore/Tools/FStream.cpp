#include "GDCore/Tools/FStream.h"

#if defined(WINDOWS)
#if __GLIBCXX__
#include <ext/stdio_filebuf.h>
#endif
#endif

namespace gd
{

namespace
{

FileStream::InternalBufferType* OpenBuffer(const gd::String & path, std::ios_base::openmode mode) {
#if FSTREAM_WINDOWS_MINGW
	FILE* c_file = _wfopen(path.ToWide().c_str(), mode == std::ios_base::in ? L"rb" : L"wb");
	if(!c_file)
		return nullptr;
	return new __gnu_cxx::stdio_filebuf<char>(c_file, mode, 1);
#else
	auto * filebuffer =  new std::filebuf();
	return filebuffer->open(path.ToUTF8().c_str());
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
		std::iostream::rdbuf(m_buffer.get());
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
			std::iostream::rdbuf(m_buffer.get());
			m_buffer.reset(newBuffer);
		}
		else
			setstate(ios_base::badbit);
	}

}

bool FileStream::is_open() const
{
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
	m_file()
{

}

SFMLFileStream::~SFMLFileStream()
{
	if(m_file.is_open())
		m_file.close();
}

bool SFMLFileStream::open(const gd::String& filename)
{
	m_file.open(filename, std::ios_base::binary|std::ios_base::in);
	return m_file.good();
}

sf::Int64 SFMLFileStream::read(void* data, sf::Int64 size)
{
	if(m_file.is_open())
	{
		m_file.read(reinterpret_cast<char*>(data), static_cast<std::size_t>(size));
		return static_cast<sf::Int64>(m_file.gcount());
	}
	else
	{
		return -1;
	}
}

sf::Int64 SFMLFileStream::seek(sf::Int64 position)
{
	if(m_file.is_open())
	{
		m_file.seekg(static_cast<std::size_t>(position));
		return tell();
	}
	else
	{
		return -1;
	}
}

sf::Int64 SFMLFileStream::tell()
{
	if(m_file.is_open())
		return static_cast<sf::Int64>(m_file.tellg());
	else
		return -1;
}

sf::Int64 SFMLFileStream::getSize()
{
	if(m_file.is_open())
	{
		sf::Int64 currentPosition = tell();

		m_file.seekg(m_file.end);
		sf::Int64 size = tell();

		seek(currentPosition);

		return size;
	}
	else
	{
		return -1;
	}
}

}
