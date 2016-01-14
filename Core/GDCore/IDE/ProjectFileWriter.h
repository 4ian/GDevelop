/*
 * GDevelop Core
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */
#if !defined(EMSCRIPTEN)
#ifndef GDCORE_PROJECTFILEWRITER_H
#define GDCORE_PROJECTFILEWRITER_H
#include "GDCore/String.h"
namespace gd { class Project; }
class TiXmlHandle;
class TiXmlDocument;

namespace gd
{

/**
 * \brief Read and write project to file(s) using wxWidgets.
 *
 * \note gd::Project provides you with gd::Project::SerializeTo
 * and gd::Project::UnserializeFrom member functions (like other classes
 * that are part of a project). This class provides tool functions
 * that write the "real" project file.
 */
class GD_CORE_API ProjectFileWriter
{
public:

    #if defined(GD_IDE_ONLY)
    /**
     * \brief Save the project to a XML file.
     *
     * "Dirty" flag is set to false when save is done.
     */
    static bool SaveToFile(const gd::Project & project, const gd::String & filename, bool forceSingleFile = false);

    /**
     * \brief Save the project to a JSON file.
     *
     * "Dirty" flag is set to false when save is done.
     */
    static bool SaveToJSONFile(const gd::Project & project, const gd::String & filename);

    /**
     * \brief Load the project from a JSON file.
     */
    static bool LoadFromJSONFile(gd::Project & project, const gd::String & filename);
    #endif

    /**
     * \brief Load the project from a XML file.
     */
    static bool LoadFromFile(gd::Project & project, const gd::String & filename);
private:

    /**
     * \brief Check if the current TinyXML file (represented by hdl and doc) is in UTF8.
     * If not, the file is converted to UTF8 and reopened.
     */
    static void ConvertANSIXMLFile(TiXmlHandle & hdl, TiXmlDocument & doc, const gd::String & filename);
};

}

#endif // GDCORE_PROJECTFILEWRITER_H
#endif
