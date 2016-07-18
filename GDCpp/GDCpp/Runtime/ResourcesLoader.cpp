/*
 * GDevelop C++ Platform
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */
#if !defined(GD_IDE_ONLY)
#include "GDCpp/Runtime/ResourcesLoader.h"
#include <SFML/Graphics.hpp>
#include <SFML/Audio.hpp>
#include <string>
#include <fstream>
#include <iostream>
#include <utility>
#include <cstring>
#include "GDCpp/Runtime/Music.h"
#undef LoadImage //Undef a macro from windows.h
#if defined(ANDROID)
#include <SFML/System/FileInputStream.hpp>
#endif

using namespace std;

namespace gd
{

ResourcesLoader * ResourcesLoader::_singleton = NULL;

bool ResourcesLoader::SetResourceFile(const gd::String & filename)
{
    if ( resFile.Read(filename) )
    {
        std::cout << "Resource file set to " << filename << std::endl;
        return true;
    }

    return false;
}

void ResourcesLoader::LoadSFMLImage( const gd::String & filename, sf::Image & image )
{
    if (resFile.ContainsFile(filename))
    {
        char* buffer = resFile.GetFile(filename);
        if (buffer==NULL)
            cout << "Failed to get the file of a SFML image from resource file: " << filename << endl;

        if (!image.loadFromMemory(buffer, resFile.GetFileSize(filename)))
            cout << "Failed to load a SFML image from resource file: " << filename << endl;
    }
    else if (!image.loadFromFile(filename.ToLocale()))
        cout << "Failed to load a SFML texture: " << filename << endl;
}

sf::Texture ResourcesLoader::LoadSFMLTexture(const gd::String & filename)
{
    sf::Texture texture;

    LoadSFMLTexture(filename, texture);

    return texture;
}

void ResourcesLoader::LoadSFMLTexture( const gd::String & filename, sf::Texture & texture )
{
    if (resFile.ContainsFile(filename))
    {
        char* buffer = resFile.GetFile(filename);
        if (buffer==NULL)
            cout << "Failed to get the file of a SFML texture from resource file: " << filename << endl;

        if (!texture.loadFromMemory(buffer, resFile.GetFileSize(filename)))
            cout << "Failed to load a SFML texture from resource file: " << filename << endl;
    }
    else if (!texture.loadFromFile(filename.ToLocale()))
        cout << "Failed to load a SFML texture: " << filename << endl;
}

std::pair<sf::Font *, char *> ResourcesLoader::LoadFont(const gd::String & filename)
{
    if (resFile.ContainsFile(filename))
    {
        char* buffer = resFile.GetFile(filename);
        size_t bufferSize = resFile.GetFileSize(filename);
        if (buffer==NULL) {
            cout << "Failed to get the file of a font from resource file:" << filename << endl;
            return std::make_pair((sf::Font*)NULL, (char*)NULL);
        }

        sf::Font * font = new sf::Font();
        char * fontBuffer = new char[bufferSize];
        memcpy(fontBuffer, buffer, bufferSize);

        if (!font->loadFromMemory(fontBuffer, bufferSize))
        {
            cout << "Failed to load a font from resource file: " << filename << endl;
            delete font;
            delete fontBuffer;
            return std::make_pair((sf::Font*)NULL, (char*)NULL);
        }

        return std::make_pair(font, fontBuffer);
    }
    else
    {
        sf::Font * font = new sf::Font();
        if (!font->loadFromFile(filename.ToLocale()))
        {
            cout << "Failed to load a font from a file: " << filename << endl;
            delete font;
            return std::make_pair<sf::Font*, char*>(NULL, NULL);
        }

        return std::make_pair(font, (char*)nullptr);
    }
}

sf::SoundBuffer ResourcesLoader::LoadSoundBuffer( const gd::String & filename )
{
    sf::SoundBuffer sbuffer;

    if (resFile.ContainsFile(filename))
    {
        char* buffer = resFile.GetFile(filename);
        if (buffer==NULL)
            cout << "Failed to get the file of a sound buffer from resource file: " << filename << endl;

        if (!sbuffer.loadFromMemory(buffer, resFile.GetFileSize(filename)))
            cout << "Failed to load a sound buffer from resource file: " << filename << endl;
    }
    else if (!sbuffer.loadFromFile(filename.ToLocale()))
        cout << "Failed to load a sound buffer: " << filename << endl;

    return sbuffer;
}

gd::String ResourcesLoader::LoadPlainText( const gd::String & filename )
{
    gd::String text;

    if (resFile.ContainsFile(filename))
    {
        char* buffer = resFile.GetFile(filename);
        if (!buffer) {
            cout << "Failed to read a file from resource file: " << filename << endl;
        } else {
            text = gd::String::FromUTF8(std::string(buffer));
        }
    }
    else
    {
        char* buffer = LoadBinaryFile(filename);
        if (!buffer)
            cout << "Failed to read plain text from a file: " << filename << endl;
        else
        {
            text = gd::String::FromUTF8(std::string(buffer));
            delete[] buffer;
        }
    }

    return text;
}


/**
 * Load a binary text file
 */
char* ResourcesLoader::LoadBinaryFile( const gd::String & filename )
{
    if (resFile.ContainsFile(filename))
    {
        char* buffer = resFile.GetFile(filename);
        if (buffer==NULL)
            cout << "Failed to read a binary file from resource file: " << filename << endl;

        return buffer;
    }
    else
    {
        #if defined(ANDROID)
        sf::FileInputStream file;
        if (file.open(filename.ToLocale()))
        {
            sf::Int64 size = file.getSize();
            char * memblock = new char [size];

            file.read(memblock, size);
            return memblock;
        }
        #else //TODO: Also use the SFML implementation?
        ifstream file (filename.ToLocale().c_str(), ios::in|ios::binary|ios::ate);
        if (file.is_open()) {
            ifstream::pos_type size = file.tellg();
            char * memblock = new char [size];
            file.seekg (0, ios::beg);
            file.read (memblock, size);
            file.close();

            return memblock;
        }
        #endif
    }

    cout << "Binary file " << filename << " can't be loaded into memory " << endl;
    return NULL;
}

long int ResourcesLoader::GetBinaryFileSize( const gd::String & filename)
{
    if (resFile.ContainsFile(filename))
        return resFile.GetFileSize(filename);
    else
    {
        #if defined(ANDROID)
        sf::FileInputStream file;
        if (file.open(filename.ToLocale()))
            return file.getSize();
        #else //TODO: Also use the SFML implementation?
        ifstream file (filename.ToLocale().c_str(), ios::in|ios::binary|ios::ate);
        if (file.is_open()) {
            return file.tellg();
        }
        #endif
    }

    std::cout << "Binary file " << filename << " cannot be read. " << std::endl;
    return 0;
}

bool ResourcesLoader::HasFile(const gd::String & filename)
{
    return resFile.ContainsFile(filename);
}

}
#endif
