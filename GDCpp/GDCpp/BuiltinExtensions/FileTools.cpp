/*
 * GDevelop C++ Platform
 * Copyright 2008-2015 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */
#include <memory>
#include <string>
#include <iostream>
#include <sstream>
#include "GDCpp/RuntimeScene.h"
#include "GDCpp/Variable.h"
#include "GDCpp/CommonTools.h"
#include "GDCpp/XmlFilesHelper.h"
#include "FileTools.h"

using namespace std;

bool GD_API FileExists( const std::string & file )
{
    TiXmlDocument doc;
    if ( !doc.LoadFile(file.c_str()) && doc.ErrorId() == 2)
        return false;

    return true ;
}

bool GD_API GroupExists( const std::string & filename, const std::string & group )
{
    std::shared_ptr<XmlFile> file = XmlFilesManager::GetFile(filename);
    TiXmlHandle hdl( &file->GetTinyXmlDocument() );

    //Découpage des groupes
    istringstream groupsStr( group );
    string Str;
    vector < string > groups;
    while ( std::getline( groupsStr, Str, '/' ) )
        groups.push_back(Str);

    groups.erase(std::remove_if(groups.begin(), groups.end(), StringEmpty()), groups.end());

    //On avance petit à petit dans le fichier
    for (unsigned int i =0;i<groups.size();i++)
    {
        if ( !hdl.FirstChildElement(groups.at(i).c_str()).ToElement())
            return false;

        hdl = hdl.FirstChildElement(groups.at(i).c_str());
    }

    return true;
}


/**
 * Launch a file
 */
void GD_API LaunchFile( const std::string & file )
{
#ifdef WINDOWS
    //Création de l'adresse internet à lancer
    string appel = "start \"\" \""+file+"\""; //quotes are important

    system(appel.c_str());
#elif defined(LINUX)
    //Nécessite le paquet xdg-utils
    string appel = "xdg-open \""+file+"\"";

    system(appel.c_str());
#elif defined(MAC)
    string appel = "open \""+file+"\"";

    system(appel.c_str());
#endif

    return;
}

/**
 * Execute a system-specific command
 */
void GD_API ExecuteCmd( const std::string & cmd )
{
    system(cmd.c_str());

    return;
}

/**
 * Delete a file
 */
void GD_API GDDeleteFile( const std::string & filename )
{
    remove(filename.c_str());

    return;
}

/**
 * Load a file in memory
 */
void GD_API LoadFileInMemory( const std::string & filename )
{
    XmlFilesManager::LoadFile(filename);

    return;
}

/**
 * Unload a file from memory
 */
void GD_API UnloadFileFromMemory( const std::string & filename )
{
    XmlFilesManager::UnloadFile(filename);

    return;
}

void GD_API DeleteGroupFromFile( const std::string & filename, const std::string & group )
{
    std::shared_ptr<XmlFile> file = XmlFilesManager::GetFile(filename);
    TiXmlHandle hdl( &file->GetTinyXmlDocument() );

    //Découpage des groupes
    istringstream groupsStr( group );
    string Str;
    vector < string > groups;
    while ( std::getline( groupsStr, Str, '/' ) )
    {
        groups.push_back(Str);
    }
    groups.erase(std::remove_if(groups.begin(), groups.end(), StringEmpty()), groups.end());

    if ( groups.empty() )
        return;
    groups.push_back("");

    //A chaque fois, on vérifie si le groupe voulu existe
    for (unsigned int i =0;i<groups.size();i++)
    {
        if ( hdl.FirstChildElement(groups.at(i).c_str()).Element() == NULL )
            return;

        //Si on arrive au groupe parent du groupe
        //à supprimer
        if ( i >= (groups.size()-1)-1 )
        {
            hdl.ToNode()->RemoveChild(hdl.FirstChildElement(groups.at(i).c_str()).ToNode());
            return;
        }

        hdl = hdl.FirstChildElement(groups.at(i).c_str());
    }

    return;
}

void GD_API WriteValueInFile( const std::string & filename, const std::string & group, double value )
{
    std::shared_ptr<XmlFile> file = XmlFilesManager::GetFile(filename);
    TiXmlHandle hdl( &file->GetTinyXmlDocument() );

    //Découpage des groupes
    istringstream groupsStr( group );
    string Str;
    vector < string > groups;
    while ( std::getline( groupsStr, Str, '/' ) )
    {
        groups.push_back(Str);
    }
    groups.erase(std::remove_if(groups.begin(), groups.end(), StringEmpty()), groups.end());

    if ( groups.empty() )
        return;

    //Insertion de la déclaration
    TiXmlDeclaration decl( "1.0", "ISO-8859-1", "" );
    if ( hdl.FirstChildElement().Element() != NULL )
    {
        //Il y a déjà un noeud, on vérifie que c'est pas une déclaration
        if ( hdl.FirstChild().ToNode()->ToDeclaration() == NULL )
            file->GetTinyXmlDocument().InsertBeforeChild(hdl.FirstChildElement().Element(), decl);
    }
    else
        file->GetTinyXmlDocument().InsertEndChild(decl); //Il n'y a rien, on peut insérer notre déclaration

    //Création si besoin est de la racine
    if ( hdl.FirstChildElement(groups.at(0).c_str()).Element() == NULL )
    {
        TiXmlElement root(groups.at(0).c_str());
        file->GetTinyXmlDocument().InsertEndChild(root);
    }

    //A chaque fois, on vérifie si le groupe voulu existe, si non on le créé,
    //et on se déplace dedans.
    for (unsigned int i =0;i<groups.size();i++)
    {
        if ( hdl.FirstChildElement(groups.at(i).c_str()).Element() == NULL )
        {
            TiXmlElement le_nouveau (groups.at(i).c_str());
            hdl.Element()->InsertEndChild(le_nouveau);
        }

        hdl = hdl.FirstChildElement(groups.at(i).c_str());
    }

    //Ecriture dans le groupe
    if ( hdl.Element() != NULL )
        hdl.Element()->SetDoubleAttribute("value", value);

    return;
}

void GD_API WriteStringInFile( const std::string & filename, const std::string & group, const std::string & str )
{
    std::shared_ptr<XmlFile> file = XmlFilesManager::GetFile(filename);
    TiXmlHandle hdl( &file->GetTinyXmlDocument() );

    //Découpage des groupes
    istringstream groupsStr( group );
    string Str;
    vector < string > groups;
    while ( std::getline( groupsStr, Str, '/' ) )
    {
        groups.push_back(Str);
    }
    groups.erase(std::remove_if(groups.begin(), groups.end(), StringEmpty()), groups.end());

    if ( groups.empty() )
        return;

    //Insertion de la déclaration
    TiXmlDeclaration decl( "1.0", "ISO-8859-1", "" );
    if ( hdl.FirstChildElement().Element() != NULL )
    {
        //Il y a déjà un noeud, on vérifie que c'est pas une déclaration
        if ( hdl.FirstChild().ToNode()->ToDeclaration() == NULL )
            file->GetTinyXmlDocument().InsertBeforeChild(hdl.FirstChildElement().Element(), decl);
    }
    else
        file->GetTinyXmlDocument().InsertEndChild(decl); //Il n'y a rien, on peut insérer notre déclaration

    //Création si besoin est de la racine
    if ( hdl.FirstChildElement(groups.at(0).c_str()).Element() == NULL )
    {
        TiXmlElement root(groups.at(0).c_str());
        file->GetTinyXmlDocument().InsertEndChild(root);
    }

    //A chaque fois, on vérifie si le groupe voulu existe, si non on le créé,
    //et on se déplace dedans.
    for (unsigned int i =0;i<groups.size();i++)
    {
        if ( hdl.FirstChildElement(groups.at(i).c_str()).Element() == NULL )
        {
            TiXmlElement le_nouveau (groups.at(i).c_str());
            hdl.Element()->InsertEndChild(le_nouveau);
        }

        hdl = hdl.FirstChildElement(groups.at(i).c_str());
    }

    //Ecriture dans le groupe
    if ( hdl.Element() != NULL ) hdl.Element()->SetAttribute("texte", str.c_str());

    return;
}

void GD_API ReadValueFromFile( const std::string & filename, const std::string & group, RuntimeScene & scene, gd::Variable & variable )
{
    std::shared_ptr<XmlFile> file = XmlFilesManager::GetFile(filename, false);
    TiXmlHandle hdl( &file->GetTinyXmlDocument() );

    //Découpage des groupes
    istringstream groupsStr( group );
    string Str;
    vector < string > groups;
    while ( std::getline( groupsStr, Str, '/' ) )
    {
        groups.push_back(Str);
    }
    groups.erase(std::remove_if(groups.begin(), groups.end(), StringEmpty()), groups.end());

    //On avance petit à petit dans le fichier
    for (unsigned int i =0;i<groups.size();i++)
    {
        if ( !hdl.FirstChildElement(groups.at(i).c_str()).ToElement())
        {
            return;
        }
        hdl = hdl.FirstChildElement(groups.at(i).c_str());
    }

    //On stocke la valeur
    if ( hdl.ToElement()->Attribute("value") == NULL ) return;
    double value;
    hdl.ToElement()->Attribute("value", &value);

    //Update variable value
    variable.SetValue(value);

    return;
}

void GD_API ReadStringFromFile( const std::string & filename, const std::string & group, RuntimeScene & scene, gd::Variable & variable )
{
    std::shared_ptr<XmlFile> file = XmlFilesManager::GetFile(filename, false);
    TiXmlHandle hdl( &file->GetTinyXmlDocument() );

    //Découpage des groupes
    istringstream groupsStr( group );
    string Str;
    vector < string > groups;
    while ( std::getline( groupsStr, Str, '/' ) )
    {
        groups.push_back(Str);
    }
    groups.erase(std::remove_if(groups.begin(), groups.end(), StringEmpty()), groups.end());

    //On avance petit à petit dans le fichier
    for (unsigned int i =0;i<groups.size();i++)
    {
        if ( !hdl.FirstChildElement(groups.at(i).c_str()).ToElement())
        {
            return;
        }
        hdl = hdl.FirstChildElement(groups.at(i).c_str());
    }

    //On stocke la valeur
    if ( hdl.ToElement()->Attribute("texte") == NULL ) return;

    //Update variable texte
    variable.SetString(hdl.ToElement()->Attribute("texte"));

    return;
}
