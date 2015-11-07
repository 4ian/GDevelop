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
#include "GDCpp/Project/Variable.h"
#include "GDCpp/CommonTools.h"
#include "GDCpp/XmlFilesHelper.h"
#include "FileTools.h"

using namespace std;

bool GD_API FileExists( const gd::String & file )
{
    TiXmlDocument doc;
    if ( !doc.LoadFile(file.ToLocale().c_str()) && doc.ErrorId() == 2)
        return false;

    return true ;
}

bool GD_API GroupExists( const gd::String & filename, const gd::String & group )
{
    std::shared_ptr<XmlFile> file = XmlFilesManager::GetFile(filename);
    TiXmlHandle hdl( &file->GetTinyXmlDocument() );

    //D�coupage des groupes
    istringstream groupsStr( group.Raw() );
    std::string str;
    vector < gd::String > groups;
    while ( std::getline( groupsStr, str, '/' ) )
        groups.push_back(gd::String::FromUTF8(str));

    groups.erase(std::remove_if(groups.begin(), groups.end(), StringEmpty()), groups.end());

    //On avance petit � petit dans le fichier
    for (std::size_t i =0;i<groups.size();i++)
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
void GD_API LaunchFile( const gd::String & file )
{
#ifdef WINDOWS
    //Cr�ation de l'adresse internet � lancer
    gd::String appel = "start \"\" \""+file+"\""; //quotes are important

    system(appel.ToLocale().c_str());
#elif defined(LINUX)
    //N�cessite le paquet xdg-utils
    gd::String appel = "xdg-open \""+file+"\"";

    system(appel.ToLocale().c_str());
#elif defined(MACOS)
    gd::String appel = "open \""+file+"\"";

    system(appel.ToLocale().c_str());
#endif

    return;
}

/**
 * Execute a system-specific command
 */
void GD_API ExecuteCmd( const gd::String & cmd )
{
    system(cmd.ToLocale().c_str());

    return;
}

/**
 * Delete a file
 */
void GD_API GDDeleteFile( const gd::String & filename )
{
    remove(filename.ToLocale().c_str());

    return;
}

/**
 * Load a file in memory
 */
void GD_API LoadFileInMemory( const gd::String & filename )
{
    XmlFilesManager::LoadFile(filename);

    return;
}

/**
 * Unload a file from memory
 */
void GD_API UnloadFileFromMemory( const gd::String & filename )
{
    XmlFilesManager::UnloadFile(filename);

    return;
}

void GD_API DeleteGroupFromFile( const gd::String & filename, const gd::String & group )
{
    std::shared_ptr<XmlFile> file = XmlFilesManager::GetFile(filename);
    TiXmlHandle hdl( &file->GetTinyXmlDocument() );

    //D�coupage des groupes
    istringstream groupsStr( group.Raw() );
    std::string str;
    vector < gd::String > groups;
    while ( std::getline( groupsStr, str, '/' ) )
    {
        groups.push_back(gd::String::FromUTF8(str));
    }
    groups.erase(std::remove_if(groups.begin(), groups.end(), StringEmpty()), groups.end());

    if ( groups.empty() )
        return;
    groups.push_back("");

    //A chaque fois, on v�rifie si le groupe voulu existe
    for (std::size_t i =0;i<groups.size();i++)
    {
        if ( hdl.FirstChildElement(groups.at(i).c_str()).Element() == NULL )
            return;

        //Si on arrive au groupe parent du groupe
        //� supprimer
        if ( i >= (groups.size()-1)-1 )
        {
            hdl.ToNode()->RemoveChild(hdl.FirstChildElement(groups.at(i).c_str()).ToNode());
            return;
        }

        hdl = hdl.FirstChildElement(groups.at(i).c_str());
    }

    return;
}

void GD_API WriteValueInFile( const gd::String & filename, const gd::String & group, double value )
{
    std::shared_ptr<XmlFile> file = XmlFilesManager::GetFile(filename);
    TiXmlHandle hdl( &file->GetTinyXmlDocument() );

    //D�coupage des groupes
    istringstream groupsStr( group.Raw() );
    std::string str;
    vector < gd::String > groups;
    while ( std::getline( groupsStr, str, '/' ) )
    {
        groups.push_back(gd::String::FromUTF8(str));
    }
    groups.erase(std::remove_if(groups.begin(), groups.end(), StringEmpty()), groups.end());

    if ( groups.empty() )
        return;

    //Insertion de la d�claration
    TiXmlDeclaration decl( "1.0", "UTF-8", "" );
    if ( hdl.FirstChildElement().Element() != NULL )
    {
        //Il y a d�j� un noeud, on v�rifie que c'est pas une d�claration
        if ( hdl.FirstChild().ToNode()->ToDeclaration() == NULL )
            file->GetTinyXmlDocument().InsertBeforeChild(hdl.FirstChildElement().Element(), decl);
    }
    else
        file->GetTinyXmlDocument().InsertEndChild(decl); //Il n'y a rien, on peut ins�rer notre d�claration

    //Cr�ation si besoin est de la racine
    if ( hdl.FirstChildElement(groups.at(0).c_str()).Element() == NULL )
    {
        TiXmlElement root(groups.at(0).c_str());
        file->GetTinyXmlDocument().InsertEndChild(root);
    }

    //A chaque fois, on v�rifie si le groupe voulu existe, si non on le cr��,
    //et on se d�place dedans.
    for (std::size_t i =0;i<groups.size();i++)
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

void GD_API WriteStringInFile( const gd::String & filename, const gd::String & group, const gd::String & str )
{
    std::shared_ptr<XmlFile> file = XmlFilesManager::GetFile(filename);
    TiXmlHandle hdl( &file->GetTinyXmlDocument() );

    //D�coupage des groupes
    istringstream groupsStr( group.Raw() );
    std::string gstr;
    vector < gd::String > groups;
    while ( std::getline( groupsStr, gstr, '/' ) )
    {
        groups.push_back(gd::String::FromUTF8(gstr));
    }
    groups.erase(std::remove_if(groups.begin(), groups.end(), StringEmpty()), groups.end());

    if ( groups.empty() )
        return;

    //Insertion de la d�claration
    TiXmlDeclaration decl( "1.0", "ISO-8859-1", "" );
    if ( hdl.FirstChildElement().Element() != NULL )
    {
        //Il y a d�j� un noeud, on v�rifie que c'est pas une d�claration
        if ( hdl.FirstChild().ToNode()->ToDeclaration() == NULL )
            file->GetTinyXmlDocument().InsertBeforeChild(hdl.FirstChildElement().Element(), decl);
    }
    else
        file->GetTinyXmlDocument().InsertEndChild(decl); //Il n'y a rien, on peut ins�rer notre d�claration

    //Cr�ation si besoin est de la racine
    if ( hdl.FirstChildElement(groups.at(0).c_str()).Element() == NULL )
    {
        TiXmlElement root(groups.at(0).c_str());
        file->GetTinyXmlDocument().InsertEndChild(root);
    }

    //A chaque fois, on v�rifie si le groupe voulu existe, si non on le cr��,
    //et on se d�place dedans.
    for (std::size_t i =0;i<groups.size();i++)
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

void GD_API ReadValueFromFile( const gd::String & filename, const gd::String & group, RuntimeScene & scene, gd::Variable & variable )
{
    std::shared_ptr<XmlFile> file = XmlFilesManager::GetFile(filename, false);
    TiXmlHandle hdl( &file->GetTinyXmlDocument() );

    //D�coupage des groupes
    istringstream groupsStr( group.Raw() );
    std::string str;
    vector < gd::String > groups;
    while ( std::getline( groupsStr, str, '/' ) )
    {
        groups.push_back(gd::String::FromUTF8(str));
    }
    groups.erase(std::remove_if(groups.begin(), groups.end(), StringEmpty()), groups.end());

    //On avance petit � petit dans le fichier
    for (std::size_t i =0;i<groups.size();i++)
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

void GD_API ReadStringFromFile( const gd::String & filename, const gd::String & group, RuntimeScene & scene, gd::Variable & variable )
{
    std::shared_ptr<XmlFile> file = XmlFilesManager::GetFile(filename, false);
    TiXmlHandle hdl( &file->GetTinyXmlDocument() );

    //D�coupage des groupes
    istringstream groupsStr( group.Raw() );
    std::string str;
    vector < gd::String > groups;
    while ( std::getline( groupsStr, str, '/' ) )
    {
        groups.push_back(gd::String::FromUTF8(str));
    }
    groups.erase(std::remove_if(groups.begin(), groups.end(), StringEmpty()), groups.end());

    //On avance petit � petit dans le fichier
    for (std::size_t i =0;i<groups.size();i++)
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
