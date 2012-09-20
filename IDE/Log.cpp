/**
 * Game Develop
 *    Editor
 *
 *  Par Florian "4ian" Rival
 *
 */
/**
 * Fonction de logging
 */

#include <string>
#include <vector>
#include <iostream>
#include "VersionWrapper.h"
#include "Log.h"

using namespace std;

////////////////////////////////////////////////////////////
/// Initialisation du log
///
/// Initialisation du log pour suivre le programme
////////////////////////////////////////////////////////////
void InitLog()
{
    FILE* fichier = NULL;

    fichier = fopen("log.txt", "w");

    string nbversion = VersionWrapper::FullString();
    string status = VersionWrapper::Status();
    string version ="Game Develop Editor - "+nbversion+" "+status+"\n";

    string date = VersionWrapper::Date();
    string month = VersionWrapper::Month();
    string year = VersionWrapper::Year();
    string fulldate = "Version du "+date+"/"+month+"/"+year+"\n";

    #ifdef LINUX
        string sys = "Systeme cible : Linux\n";
    #endif
    #ifdef WINDOWS
        string sys = "Systeme cible : Windows\n";
    #endif


    if (fichier != NULL)
    {
        fputs(version.c_str(), fichier);
        std::string version;
        version = fulldate+"\n-----------------------------------------\n\n\n";

        fputs(version.c_str(), fichier);
        fputs(sys.c_str(), fichier);
        fclose(fichier);
    }

    //En plus dans la console
    cout << version << fulldate << sys << endl;

    return;
}


////////////////////////////////////////////////////////////
/// Ecriture
///
/// Ecriture dans le log
////////////////////////////////////////////////////////////
void EcrireLog(string localisation, string autreinfos)
{
    FILE* fichier = NULL;

    fichier = fopen("log.txt", "a");

    string texte = localisation+" : "+autreinfos+"\n";

    if (fichier != NULL)
    {
        fputs(texte.c_str(), fichier);
        fclose(fichier);
    }


    //En plus dans la console
    cout << texte;
    return;
}










