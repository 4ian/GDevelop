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

RessourcesLoader * RessourcesLoader::_singleton = NULL;

bool RessourcesLoader::SetExeGD(const string & filename)
{
    if ( ExeGD.Read(filename) )
    {
        std::cout << "Resource file set to " << filename << std::endl;
        return true;
    }

    return false;
}

sf::Texture * RessourcesLoader::LoadSFMLTexture(const string & filename)
{
    sf::Texture * image = new sf::Texture();

    if ( ExeGD.ContainsFile(filename)) //Priorité aux fichiers contenu dans l'egd
    {
        char* buffer = ExeGD.GetFile(filename);
        if (buffer==NULL)
            cout << "Failed to get the file of a SFML texture from resource file: " << filename << endl;

        if (!image->LoadFromMemory(buffer, ExeGD.GetFileSize(filename)))
            cout << "Failed to load a SFML texture from resource file: " << filename << endl;
    }
    else if (!image->LoadFromFile(filename)) //Chargement depuis un fichier externe
        cout << "Failed to load a SFML texture: " << filename << endl;

    return image;
}

sf::Font * RessourcesLoader::LoadFont(const string & filename)
{
    sf::Font * font = new sf::Font();

    if ( ExeGD.ContainsFile(filename)) //Priorité aux fichiers contenu dans l'egd
    {
        char* buffer = ExeGD.GetFile(filename);
        if (buffer==NULL)
            cout << "Failed to get the file of a font from resource file:" << filename << endl;

        //TODO : Manage this
        char * fontBuffer = new char[ExeGD.GetFileSize(filename)];
        memcpy(fontBuffer, buffer, ExeGD.GetFileSize(filename));

        if (!font->LoadFromMemory(fontBuffer, ExeGD.GetFileSize(filename)))
            cout << "Failed to load a font from resource file: " << filename << endl;
    }
    else if (!font->LoadFromFile(filename)) //Chargement depuis un fichier externe
        cout << "Failed to load a font: " << filename << endl;

    return font;
}

sf::SoundBuffer RessourcesLoader::LoadSoundBuffer( const string & filename )
{
    sf::SoundBuffer sbuffer;

    if ( ExeGD.ContainsFile(filename)) //Priorité aux fichiers contenu dans l'egd
    {
        char* buffer = ExeGD.GetFile(filename);
        if (buffer==NULL)
            cout << "Failed to get the file of a sound buffer from resource file: " << filename << endl;

        if (!sbuffer.LoadFromMemory(buffer, ExeGD.GetFileSize(filename)))
            cout << "Failed to load a sound buffer from resource file: " << filename << endl;
    }
    else if (!sbuffer.LoadFromFile(filename)) //Chargement depuis un fichier externe
        cout << "Failed to load a sound buffer: " << filename << endl;

    return sbuffer;
}

std::string RessourcesLoader::LoadPlainText( const string & filename )
{
    std::string text;

    if ( ExeGD.ContainsFile(filename)) //Priorité aux fichiers contenu dans l'egd
    {
        char* buffer = ExeGD.GetFile(filename);
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
    if ( ExeGD.ContainsFile(filename)) //Priorité aux fichiers contenu dans l'egd
    {
        char* buffer = ExeGD.GetFile(filename);
        if (buffer==NULL)
            cout << "Failed to read a binary file from resource file: " << filename << endl;

        return buffer;
    }
    else
        cout << "Binary file can't be loaded from external file for " << filename << endl;

    return NULL;
}

int RessourcesLoader::GetBinaryFileSize( const string & filename)
{
    if ( ExeGD.ContainsFile(filename))
        return ExeGD.GetFileSize(filename);

    cout << "Internal file " << filename << " not found for GetFileSize.";
    return 0;
}

Music * RessourcesLoader::LoadMusic( const string & filename )
{
    Music * music = new Music;

    if ( ExeGD.ContainsFile(filename)) //Priorité aux fichiers contenu dans l'egd
    {
        music->SetBuffer(ExeGD.GetFile(filename), ExeGD.GetFileSize(filename));

        if (!music->OpenFromMemory(ExeGD.GetFileSize(filename)))
            cout << "Failed to load a music from resource file: " << filename << endl;
    }
    else if (!music->OpenFromFile(filename)) //Chargement depuis un fichier externe
        cout << "Failed to load a music: " << filename << endl;

    return music;
}
