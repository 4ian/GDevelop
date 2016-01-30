/*
 * GDevelop C++ Platform
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */

#ifndef XMLFILESHELPER_H
#define XMLFILESHELPER_H

#include "GDCpp/Runtime/TinyXml/tinyxml.h"
#include <string>
#include <memory>
#include <map>
#include "GDCpp/Runtime/String.h"

/**
 * \brief Helper class wrapping a tinyxml document in RAII fashion
 *
 * \ingroup FileExtension
 */
class XmlFile
{
    public :

        /**
         * Open file
         */
        XmlFile(gd::String filename) : doc(filename.ToLocale().c_str()), modified(false) { doc.LoadFile(); };

        /**
         * Save file is the document was marked as modified.
         */
        ~XmlFile() { if (modified) doc.SaveFile(); }

        /**
         * Set the file to be saved when the object is destroyed.
         */
        void MarkAsModified() { modified = true; }

        /**
         * Access to the tinyxml representation of the file
         */
        TiXmlDocument & GetTinyXmlDocument() { return doc; };

        /**
         * Access to the tinyxml representation of the file
         */
        const TiXmlDocument & GetTinyXmlDocument() const { return doc; };

    private :
        TiXmlDocument doc;
        bool modified;
};

/**
 * \brief Helper class for opening XML files.
 *
 * \ingroup FileExtension
 */
class XmlFilesManager
{
    static std::map<gd::String, std::shared_ptr<XmlFile> > openedFiles;

    public:

    /**
     * Load a file and keep it in memory
     */
    static void LoadFile(gd::String filename)
    {
        if ( openedFiles.find(filename) == openedFiles.end() )
            openedFiles[filename] = std::shared_ptr<XmlFile>(new XmlFile(filename));
    }

    /**
     * Unload a file kept in memory
     */
    static void UnloadFile(gd::String filename)
    {
        if ( openedFiles.find(filename) != openedFiles.end() )
            openedFiles.erase(filename);
    }

    /**
     * Get access to a file. If the file has not been loaded with LoadFile,
     * it will be loaded now, and unload as soon as it is not used anymore.
     */
    static std::shared_ptr<XmlFile> GetFile(gd::String filename, bool isGoingToModifyFile = true)
    {
        std::shared_ptr<XmlFile> file = openedFiles.find(filename) != openedFiles.end() ? openedFiles[filename] : std::shared_ptr<XmlFile>(new XmlFile(filename));
        if ( isGoingToModifyFile ) file->MarkAsModified();

        return file;
    }


    static std::map<gd::String, std::shared_ptr<XmlFile> > GetOpenedFilesList() { return openedFiles; }
};

#endif // XMLFILESHELPER_H
