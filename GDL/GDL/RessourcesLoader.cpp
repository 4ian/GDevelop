#include "GDL/RessourcesLoader.h"
#include <SFML/Graphics.hpp>
#include <SFML/Audio.hpp>
#include <string>
#include <fstream>
#include <iostream>
#include "GDL/Music.h"
#undef LoadImage //Undef a macro from windows.h

using namespace std;

RessourcesLoader * RessourcesLoader::_singleton = NULL;

void RessourcesLoader::SetExeGD(const string & filename)
{
    ExeGD.Read(filename);
}

sf::Image RessourcesLoader::LoadImage(const string & filename)
{
    sf::Image image;

    if ( ExeGD.ContainsFile(filename)) //Priorité aux fichiers contenu dans l'egd
    {
        char* buffer = ExeGD.GetFile(filename);
        if (buffer==NULL)
            cout << "Erreur lors de la récupération interne de l'image " << filename << endl;

        if (!image.LoadFromMemory(buffer, ExeGD.GetFileSize(filename)))
            cout << "Erreur lors du chargement interne de l'image" << filename << endl;
    }
    else if (!image.LoadFromFile(filename)) //Chargement depuis un fichier externe
        cout << "Erreur lors du chargement externe de l'image " << filename << endl;

    return image;
}

sf::Font * RessourcesLoader::LoadFont(const string & filename)
{
    sf::Font * font = new sf::Font();

    if ( ExeGD.ContainsFile(filename)) //Priorité aux fichiers contenu dans l'egd
    {
        char* buffer = ExeGD.GetFile(filename);
        if (buffer==NULL)
            cout << "Erreur lors de la récupération interne de la police " << filename << endl;

        if (!font->LoadFromMemory(buffer, ExeGD.GetFileSize(filename)))
            cout << "Erreur lors du chargement interne de la police" << filename << endl;
    }
    else if (!font->LoadFromFile(filename)) //Chargement depuis un fichier externe
        cout << "Erreur lors du chargement externe de la police " << filename << endl;

    return font;
}

sf::SoundBuffer RessourcesLoader::LoadSoundBuffer( const string & filename )
{
    sf::SoundBuffer sbuffer;

    if ( ExeGD.ContainsFile(filename)) //Priorité aux fichiers contenu dans l'egd
    {
        char* buffer = ExeGD.GetFile(filename);
        if (buffer==NULL)
            cout << "Erreur lors de la récupération interne du son " << filename << endl;

        if (!sbuffer.LoadFromMemory(buffer, ExeGD.GetFileSize(filename)))
            cout << "Erreur lors du chargement interne du son " << filename << endl;
    }
    else if (!sbuffer.LoadFromFile(filename)) //Chargement depuis un fichier externe
        cout << "Erreur lors du chargement externe du son " << filename << endl;

    return sbuffer;
}

std::string RessourcesLoader::LoadPlainText( const string & filename )
{
    std::string text;

    if ( ExeGD.ContainsFile(filename)) //Priorité aux fichiers contenu dans l'egd
    {
        char* buffer = ExeGD.GetFile(filename);
        if (buffer==NULL)
            cout << "Erreur lors de la récupération interne du fichier " << filename << endl;

        text = buffer;
    }
    else
    {
        cout << "fichier externe";
        ifstream file(filename.c_str(), ios::in);

        if(!file.fail())
        {
            string ligne;
            while(getline(file, ligne))
                text += ligne;

            file.close();
        }
        else
            cout << "Erreur lors de la lecture externe du fichier " << filename << endl;
    }

    return text;
}
/*
std::string RessourcesLoader::LoadPlainText( const string & filename )
{
    std::string text;

    if ( ExeGD.ContainsFile(filename)) //Priorité aux fichiers contenu dans l'egd
    {
        char* buffer = ExeGD.GetFile(filename);
        if (buffer==NULL)
            cout << "Erreur lors de la récupération interne du fichier " << filename << endl;

        text = buffer;
    }
    else
    {
        ifstream file(filename.c_str(), ios::in);

        if(!file.fail())
        {
            string ligne;
            while(getline(file, ligne))
                text += ligne;

            file.close();
        }
        else
            cout << "Erreur lors de la lecture externe du fichier " << filename << endl;
    }

    return text;
}
*/
Music * RessourcesLoader::LoadMusic( const string & filename )
{
    Music * music = new Music;

    if ( ExeGD.ContainsFile(filename)) //Priorité aux fichiers contenu dans l'egd
    {
        music->SetBuffer(ExeGD.GetFile(filename), ExeGD.GetFileSize(filename));

        if (!music->OpenFromMemory(ExeGD.GetFileSize(filename)))
            cout << "Erreur lors du chargement interne de la musique " << filename << endl;
    }
    else if (!music->OpenFromFile(filename)) //Chargement depuis un fichier externe
        cout << "Erreur lors du chargement externe de la musique " << filename << endl;

    return music;
}
