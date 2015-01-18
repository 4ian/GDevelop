/*
 * GDevelop C++ Platform
 * Copyright 2008-2014 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */
#if !defined(GD_IDE_ONLY)
#include "GDCpp/ResourcesLoader.h"
#include <SFML/Graphics.hpp>
#include <SFML/Audio.hpp>
#include <string>
#include <fstream>
#include <iostream>
#include <utility>
#include <cstring>
#include "GDCpp/Music.h"
#undef LoadImage //Undef a macro from windows.h

using namespace std;

namespace gd
{

ResourcesLoader * ResourcesLoader::_singleton = NULL;

bool ResourcesLoader::SetResourceFile(const string & filename)
{
    if ( resFile.Read(filename) )
    {
        std::cout << "Resource file set to " << filename << std::endl;
        return true;
    }

    return false;
}

sf::Texture ResourcesLoader::LoadSFMLTexture(const string & filename)
{
    sf::Texture texture;

    if (resFile.ContainsFile(filename))
    {
        char* buffer = resFile.GetFile(filename);
        if (buffer==NULL)
            cout << "Failed to get the file of a SFML texture from resource file: " << filename << endl;

        if (!texture.loadFromMemory(buffer, resFile.GetFileSize(filename)))
            cout << "Failed to load a SFML texture from resource file: " << filename << endl;
    }
    else if (!texture.loadFromFile(filename))
        cout << "Failed to load a SFML texture: " << filename << endl;

    return texture;
}

std::pair<sf::Font *, char *> ResourcesLoader::LoadFont(const string & filename)
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
        if (!font->loadFromFile(filename))
        {
            cout << "Failed to load a font from a file: " << filename << endl;
            delete font;
            return std::make_pair<sf::Font*, char*>(NULL, NULL);
        }

        return std::make_pair(font, (char*)nullptr);
    }
}

sf::SoundBuffer ResourcesLoader::LoadSoundBuffer( const string & filename )
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
    else if (!sbuffer.loadFromFile(filename))
        cout << "Failed to load a sound buffer: " << filename << endl;

    return sbuffer;
}

std::string ResourcesLoader::LoadPlainText( const string & filename )
{
    std::string text;

    if (resFile.ContainsFile(filename))
    {
        char* buffer = resFile.GetFile(filename);
        if (buffer==NULL)
            cout << "Failed to read a file from resource file: " << filename << endl;

        text = buffer;
    }
    else
    {
        ifstream file(filename.c_str(), ios::in);

        if(!file.fail())
        {
            string ligne;
            while(getline(file, ligne))
                text += ligne+"\n";

            file.close();
        }
        else
            cout << "Failed to read a file: " << filename << endl;
    }

    return text;
}


/**
 * Load a binary text file
 */
char* ResourcesLoader::LoadBinaryFile( const string & filename )
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
        ifstream file (filename.c_str(), ios::in|ios::binary|ios::ate);
        if (file.is_open()) {
            ifstream::pos_type size = file.tellg();
            char * memblock = new char [size];
            file.seekg (0, ios::beg);
            file.read (memblock, size);
            file.close();

            return memblock;
        }
    }

    cout << "Binary file " << filename << " can't be loaded into memory " << endl;
    return NULL;
}

long int ResourcesLoader::GetBinaryFileSize( const string & filename)
{
    if (resFile.ContainsFile(filename))
        return resFile.GetFileSize(filename);
    else
    {
        ifstream file (filename.c_str(), ios::in|ios::binary|ios::ate);
        if (file.is_open()) {
            return file.tellg();
        }
    }

    std::cout << "Binary file " << filename << " cannot be read. " << std::endl;
    return 0;
}

bool ResourcesLoader::HasFile(const std::string & filename)
{
    return resFile.ContainsFile(filename);
}

}
#endif
