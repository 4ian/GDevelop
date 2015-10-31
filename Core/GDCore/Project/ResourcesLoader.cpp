#include "GDCore/Project/ResourcesLoader.h"
#include <SFML/Graphics.hpp>
#include <SFML/Audio.hpp>
#include "GDCore/String.h"
#include <fstream>
#include <iostream>
#include <utility>
#include <cstring>
#undef LoadImage //Undef a macro from windows.h

using namespace std;

namespace gd
{

ResourcesLoader * ResourcesLoader::_singleton = NULL;

sf::Texture ResourcesLoader::LoadSFMLTexture(const gd::String & filename)
{
    sf::Texture texture;
    if (!texture.loadFromFile(filename.ToLocale()))
        cout << "Failed to load a SFML texture: " << filename << endl;

    return texture;
}

std::pair<sf::Font *, char *> ResourcesLoader::LoadFont(const gd::String & filename)
{
    sf::Font * font = new sf::Font;
    if (!font->loadFromFile(filename.ToLocale()))
    {
        cout << "Failed to load a font from a file: " << filename << endl;
        return std::make_pair<sf::Font*, char*>(NULL, NULL);
    }

    //Extra (sf::Font*) added to avoid a compilation error with Clang 3.3
    return std::make_pair<sf::Font*, char*>((sf::Font*)font, NULL);
}

sf::SoundBuffer ResourcesLoader::LoadSoundBuffer( const gd::String & filename )
{
    sf::SoundBuffer sbuffer;
    if (!sbuffer.loadFromFile(filename.ToLocale()))
        cout << "Failed to load a sound buffer: " << filename << endl;

    return sbuffer;
}

gd::String ResourcesLoader::LoadPlainText( const gd::String & filename )
{
    gd::String text;
    ifstream file(filename.ToLocale().c_str(), ios::in);

    if(!file.fail())
    {
        std::string ligne;
        while(getline(file, ligne))
            text += gd::String::FromUTF8(ligne)+"\n";

        file.close();
    }
    else
        cout << "Failed to read a file: " << filename << endl;

    return text;
}


/**
 * Load a binary text file
 */
char* ResourcesLoader::LoadBinaryFile( const gd::String & filename )
{
    ifstream file (filename.ToLocale().c_str(), ios::in|ios::binary|ios::ate);
    if (file.is_open()) {
        ifstream::pos_type size = file.tellg();
        char * memblock = new char [size];
        file.seekg (0, ios::beg);
        file.read (memblock, size);
        file.close();

        return memblock;
    }

    cout << "Binary file " << filename << " can't be loaded into memory " << endl;
    return NULL;
}

long int ResourcesLoader::GetBinaryFileSize( const gd::String & filename)
{
    ifstream file (filename.ToLocale().c_str(), ios::in|ios::binary|ios::ate);
    if (file.is_open()) {
        return file.tellg();
    }

    std::cout << "Binary file " << filename << " cannot be read. " << std::endl;
    return 0;
}

}
