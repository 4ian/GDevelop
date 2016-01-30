/*

GDevelop - AdvancedXML Extension
Copyright (c) 2012-2016 Victor Levasseur
This project is released under the MIT License.
*/

#ifndef ADVANCEDXMLACTIONS_H_INCLUDED
#define ADVANCEDXMLACTIONS_H_INCLUDED

#include <string>
#include "GDCpp/Runtime/String.h"

class RuntimeScene;

namespace AdvancedXML
{
    void GD_EXTENSION_API CreateNewDocument(const gd::String &refname, RuntimeScene &scene);
    void GD_EXTENSION_API LoadXmlFile(const gd::String &filename, const gd::String &refname, RuntimeScene &scene);
    void GD_EXTENSION_API SaveXmlFile(const gd::String &filename, const gd::String &refname, RuntimeScene &scene);

    void GD_EXTENSION_API CreateNewElement(const gd::String &refname, const int type, const gd::String &content, RuntimeScene &scene); ///< 0 -> TiXmlElement / 1 -> TiXmlText / 2 -> TiXmlComment
    void GD_EXTENSION_API DeleteAnElement(const gd::String &refname, RuntimeScene &scene);

    void GD_EXTENSION_API InsertElementIntoAnother(const gd::String &refNameOfElementToAdd, const gd::String &refNameOfParentElement, const gd::String &refNameOfNextElement, RuntimeScene &scene);
    void GD_EXTENSION_API BrowseTo(const gd::String baseRefName, const gd::String &futureRefName, const gd::String &pathToFutureRefName, RuntimeScene &scene);
    void GD_EXTENSION_API NextSibling(const gd::String &futureRefName, const gd::String &baseRefName, const gd::String &tagName, RuntimeScene &scene);

    bool GD_EXTENSION_API IsRefValid(const gd::String &refName, RuntimeScene &scene);
    int GD_EXTENSION_API GetRefType(const gd::String &refName, RuntimeScene &scene);

    gd::String GD_EXTENSION_API GetText(const gd::String &refName, RuntimeScene &scene);
    void GD_EXTENSION_API SetText(const gd::String &refName, const gd::String &text, RuntimeScene &scene);

    gd::String GD_EXTENSION_API GetAttributeString(const gd::String &refname, const gd::String &property, RuntimeScene &scene);
    double GD_EXTENSION_API GetAttributeNumber(const gd::String &refname, const gd::String &property, RuntimeScene &scene);

    void GD_EXTENSION_API SetAttributeString(const gd::String &refname, const gd::String &property, const gd::String &value, RuntimeScene &scene);
    void GD_EXTENSION_API SetAttributeNumber(const gd::String &refname, const gd::String &property, const double &value, RuntimeScene &scene);

    void GD_EXTENSION_API RemoveAttribute(const gd::String &refname, const gd::String &property, RuntimeScene &scene);
}

#endif // AESACTIONS_H_INCLUDED
