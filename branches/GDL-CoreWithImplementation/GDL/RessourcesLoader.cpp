#if !defined(GD_IDE_ONLY)

#include "GDL/RessourcesLoader.h"
#include <SFML/Graphics.hpp>
#include <SFML/Audio.hpp>
#include <string>
#include <fstream>
#include <iostream>
#include <cstring>
#include "GDL/Music.h"
#undef LoadImage //Undef a macro from windows.h

using namespace std;

namespace gd
{

RessourcesLoader * RessourcesLoader::_singleton = NULL;

bool RessourcesLoader::SetResourceFile(const string & filename)
{
    if ( resFile.Read(filename) )
    {
        std::cout << "Resource file set to " << filename << std::endl;
        return true;
    }

    return false;
}

sf::Texture * RessourcesLoader::LoadSFMLTexture(const string & filename)
{
    sf::Texture * image = new sf::Texture();

    if ( resFile.ContainsFile(filename)) //Priorité aux fichiers contenu dans l'egd
    {
        char* buffer = resFile.GetFile(filename);
        if (buffer==NULL)
            cout << "Failed to get the file of a SFML texture from resource file: " << filename << endl;

        if (!image->loadFromMemory(buffer, resFile.GetFileSize(filename)))
            cout << "Failed to load a SFML texture from resource file: " << filename << endl;
    }
    else if (!image->loadFromFile(filename)) //Chargement depuis un fichier externe
        cout << "Failed to load a SFML texture: " << filename << endl;

    return image;
}

sf::Font * RessourcesLoader::LoadFont(const string & filename)
{
    sf::Font * font = new sf::Font();

    if ( resFile.ContainsFile(filename)) //Priorité aux fichiers contenu dans l'egd
    {
        char* buffer = resFile.GetFile(filename);
        if (buffer==NULL)
            cout << "Failed to get the file of a font from resource file:" << filename << endl;

        //TODO : Manage this
        char * fontBuffer = new char[resFile.GetFileSize(filename)];
        memcpy(fontBuffer, buffer, resFile.GetFileSize(filename));

        if (!font->loadFromMemory(fontBuffer, resFile.GetFileSize(filename)))
            cout << "Failed to load a font from resource file: " << filename << endl;
    }
    else if (!font->loadFromFile(filename)) //Chargement depuis un fichier externe
        cout << "Failed to load a font: " << filename << endl;

    return font;
}

sf::SoundBuffer RessourcesLoader::LoadSoundBuffer( const string & filename )
{
    sf::SoundBuffer sbuffer;

    if ( resFile.ContainsFile(filename)) //Priorité aux fichiers contenu dans l'egd
    {
        char* buffer = resFile.GetFile(filename);
        if (buffer==NULL)
            cout << "Failed to get the file of a sound buffer from resource file: " << filename << endl;

        if (!sbuffer.loadFromMemory(buffer, resFile.GetFileSize(filename)))
            cout << "Failed to load a sound buffer from resource file: " << filename << endl;
    }
    else if (!sbuffer.loadFromFile(filename)) //Chargement depuis un fichier externe
        cout << "Failed to load a sound buffer: " << filename << endl;

    return sbuffer;
}

std::string RessourcesLoader::LoadPlainText( const string & filename )
{
    std::string text;

    if ( resFile.ContainsFile(filename)) //Priorité aux fichiers contenu dans l'egd
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
char* RessourcesLoader::LoadBinaryFile( const string & filename )
{
    if ( resFile.ContainsFile(filename)) //Priorité aux fichiers contenu dans l'egd
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

long int RessourcesLoader::GetBinaryFileSize( const string & filename)
{
    if ( resFile.ContainsFile(filename))
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

bool RessourcesLoader::HasFile(const std::string & filename)
{
    return resFile.ContainsFile(filename);
}

}
#endif
