/*
 * GDevelop C++ Platform
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */
#include <memory>
#include <string>
#include <iostream>
#include <sstream>
#include "GDCpp/Runtime/RuntimeScene.h"
#include "GDCpp/Runtime/Project/Variable.h"
#include "GDCpp/Runtime/CommonTools.h"
#include "GDCpp/Runtime/XmlFilesHelper.h"
#include "FileTools.h"

using namespace std;

bool GD_API FileExists( const gd::String & file )
{
    tinyxml2::XMLDocument doc;
    if ( !gd::LoadXmlFromFile( doc, file ) && doc.ErrorID() == tinyxml2::XML_ERROR_FILE_NOT_FOUND)
        return false;

    return true ;
}

bool GD_API GroupExists( const gd::String & filename, const gd::String & group )
{
    std::shared_ptr<XmlFile> file = XmlFilesManager::GetFile(filename);
    tinyxml2::XMLHandle hdl( &file->GetTinyXmlDocument() );

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
    tinyxml2::XMLHandle hdl( &file->GetTinyXmlDocument() );

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
        if ( hdl.FirstChildElement(groups.at(i).c_str()).ToElement() == nullptr )
            return;

        //Si on arrive au groupe parent du groupe
        //� supprimer
        if ( i >= (groups.size()-1)-1 )
        {
            hdl.ToNode()->DeleteChild(hdl.FirstChildElement(groups.at(i).c_str()).ToNode());
            return;
        }

        hdl = hdl.FirstChildElement(groups.at(i).c_str());
    }

    return;
}

void GD_API WriteValueInFile( const gd::String & filename, const gd::String & group, double value )
{
    std::shared_ptr<XmlFile> file = XmlFilesManager::GetFile(filename);
    tinyxml2::XMLHandle hdl( &file->GetTinyXmlDocument() );

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

    //Cr�ation si besoin est de la racine
    if ( hdl.FirstChildElement(groups.at(0).c_str()).ToElement() == nullptr )
    {
        tinyxml2::XMLElement * root = file->GetTinyXmlDocument().NewElement(groups.at(0).c_str());
        file->GetTinyXmlDocument().InsertEndChild(root);
    }

    //A chaque fois, on v�rifie si le groupe voulu existe, si non on le cr��,
    //et on se d�place dedans.
    for (std::size_t i =0;i<groups.size();i++)
    {
        if ( hdl.FirstChildElement(groups.at(i).c_str()).ToElement() == nullptr )
        {
            tinyxml2::XMLElement * le_nouveau = file->GetTinyXmlDocument().NewElement(groups.at(i).c_str());
            hdl.ToElement()->InsertEndChild(le_nouveau);
        }

        hdl = hdl.FirstChildElement(groups.at(i).c_str());
    }

    //Ecriture dans le groupe
    if ( hdl.ToElement() != nullptr )
        hdl.ToElement()->SetAttribute("value", value);

    return;
}

void GD_API WriteStringInFile( const gd::String & filename, const gd::String & group, const gd::String & str )
{
    std::shared_ptr<XmlFile> file = XmlFilesManager::GetFile(filename);
    tinyxml2::XMLHandle hdl( &file->GetTinyXmlDocument() );

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

    //Cr�ation si besoin est de la racine
    if ( hdl.FirstChildElement(groups.at(0).c_str()).ToElement() == nullptr )
    {
        tinyxml2::XMLElement * root = file->GetTinyXmlDocument().NewElement(groups.at(0).c_str());
        file->GetTinyXmlDocument().InsertEndChild(root);
    }

    //A chaque fois, on v�rifie si le groupe voulu existe, si non on le cr��,
    //et on se d�place dedans.
    for (std::size_t i =0;i<groups.size();i++)
    {
        if ( hdl.FirstChildElement(groups.at(i).c_str()).ToElement() == nullptr )
        {
            tinyxml2::XMLElement * le_nouveau = file->GetTinyXmlDocument().NewElement(groups.at(i).c_str());
            hdl.ToElement()->InsertEndChild(le_nouveau);
        }

        hdl = hdl.FirstChildElement(groups.at(i).c_str());
    }

    //Ecriture dans le groupe
    if ( hdl.ToElement() != nullptr ) hdl.ToElement()->SetAttribute("texte", str.c_str());

    return;
}

void GD_API ReadValueFromFile( const gd::String & filename, const gd::String & group, RuntimeScene & scene, gd::Variable & variable )
{
    std::shared_ptr<XmlFile> file = XmlFilesManager::GetFile(filename, false);
    tinyxml2::XMLHandle hdl( &file->GetTinyXmlDocument() );

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
    if ( hdl.ToElement()->Attribute("value") == nullptr ) return;
    double value = variable.GetValue();
    hdl.ToElement()->QueryDoubleAttribute("value", &value);

    //Update variable value
    variable.SetValue(value);

    return;
}

void GD_API ReadStringFromFile( const gd::String & filename, const gd::String & group, RuntimeScene & scene, gd::Variable & variable )
{
    std::shared_ptr<XmlFile> file = XmlFilesManager::GetFile(filename, false);
    tinyxml2::XMLHandle hdl( &file->GetTinyXmlDocument() );

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
    if ( hdl.ToElement()->Attribute("texte") == nullptr ) return;

    //Update variable texte
    variable.SetString(hdl.ToElement()->Attribute("texte"));

    return;
}
