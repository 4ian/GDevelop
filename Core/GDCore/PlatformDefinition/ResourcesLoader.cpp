#include "GDCore/PlatformDefinition/ResourcesLoader.h"
#include <SFML/Graphics.hpp>
#include <SFML/Audio.hpp>
#include <string>
#include <fstream>
#include <iostream>
#include <utility>
#include <cstring>
#undef LoadImage //Undef a macro from windows.h

using namespace std;

namespace gd
{

ResourcesLoader * ResourcesLoader::_singleton = NULL;

sf::Texture ResourcesLoader::LoadSFMLTexture(const string & filename)
{
    sf::Texture texture;
    if (!texture.loadFromFile(filename))
        cout << "Failed to load a SFML texture: " << filename << endl;

    return texture;
}

std::pair<sf::Font *, char *> ResourcesLoader::LoadFont(const string & filename)
{
    sf::Font * font = new sf::Font;
    if (!font->loadFromFile(filename))
    {
        cout << "Failed to load a font from a file: " << filename << endl;
        return std::make_pair<sf::Font*, char*>(NULL, NULL);
    }

    //Extra (sf::Font*) added to avoid a compilation error with Clang 3.3
    return std::make_pair<sf::Font*, char*>((sf::Font*)font, NULL);
}

sf::SoundBuffer ResourcesLoader::LoadSoundBuffer( const string & filename )
{
    sf::SoundBuffer sbuffer;
    if (!sbuffer.loadFromFile(filename))
        cout << "Failed to load a sound buffer: " << filename << endl;

    return sbuffer;
}

std::string ResourcesLoader::LoadPlainText( const string & filename )
{
    std::string text;
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

    return text;
}


/**
 * Load a binary text file
 */
char* ResourcesLoader::LoadBinaryFile( const string & filename )
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

    cout << "Binary file " << filename << " can't be loaded into memory " << endl;
    return NULL;
}

long int ResourcesLoader::GetBinaryFileSize( const string & filename)
{
    ifstream file (filename.c_str(), ios::in|ios::binary|ios::ate);
    if (file.is_open()) {
        return file.tellg();
    }

    std::cout << "Binary file " << filename << " cannot be read. " << std::endl;
    return 0;
}

}
