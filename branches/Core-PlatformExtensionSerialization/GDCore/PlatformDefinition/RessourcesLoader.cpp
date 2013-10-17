#include "GDCore/PlatformDefinition/RessourcesLoader.h"
#include <SFML/Graphics.hpp>
#include <SFML/Audio.hpp>
#include <string>
#include <fstream>
#include <iostream>
#include <cstring>
#undef LoadImage //Undef a macro from windows.h

using namespace std;

namespace gd
{

RessourcesLoader * RessourcesLoader::_singleton = NULL;

sf::Texture * RessourcesLoader::LoadSFMLTexture(const string & filename)
{
    sf::Texture * image = new sf::Texture();
    if (!image->loadFromFile(filename)) //Chargement depuis un fichier externe
        cout << "Failed to load a SFML texture: " << filename << endl;

    return image;
}

sf::Font * RessourcesLoader::LoadFont(const string & filename)
{
    sf::Font * font = new sf::Font();
    if (!font->loadFromFile(filename)) //Chargement depuis un fichier externe
    {
        cout << "Failed to load a font: " << filename << endl;
        return NULL;
    }

    return font;
}

sf::SoundBuffer RessourcesLoader::LoadSoundBuffer( const string & filename )
{
    sf::SoundBuffer sbuffer;
    if (!sbuffer.loadFromFile(filename)) //Chargement depuis un fichier externe
        cout << "Failed to load a sound buffer: " << filename << endl;

    return sbuffer;
}

std::string RessourcesLoader::LoadPlainText( const string & filename )
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
char* RessourcesLoader::LoadBinaryFile( const string & filename )
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

long int RessourcesLoader::GetBinaryFileSize( const string & filename)
{
    ifstream file (filename.c_str(), ios::in|ios::binary|ios::ate);
    if (file.is_open()) {
        return file.tellg();
    }

    std::cout << "Binary file " << filename << " cannot be read. " << std::endl;
    return 0;
}

}
