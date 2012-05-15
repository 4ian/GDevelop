/*

AdvancedXML
Copyright (C) 2012 Victor Levasseur

  This software is provided 'as-is', without any express or implied
  warranty.  In no event will the authors be held liable for any damages
  arising from the use of this software.

  Permission is granted to anyone to use this software for any purpose,
  including commercial applications, and to alter it and redistribute it
  freely, subject to the following restrictions:

  1. The origin of this software must not be misrepresented; you must not
     claim that you wrote the original software. If you use this software
     in a product, an acknowledgment in the product documentation would be
     appreciated but is not required.
  2. Altered source versions must be plainly marked as such, and must not be
     misrepresented as being the original software.
  3. This notice may not be removed or altered from any source distribution.

*/

#ifndef ADVANCEDXMLACTIONS_H_INCLUDED
#define ADVANCEDXMLACTIONS_H_INCLUDED

#include <string>

class RuntimeScene;

namespace AdvancedXML
{
    void GD_EXTENSION_API CreateNewDocument(const std::string &refname, RuntimeScene &scene);
    void GD_EXTENSION_API LoadXmlFile(const std::string &filename, const std::string &refname, RuntimeScene &scene);
    void GD_EXTENSION_API SaveXmlFile(const std::string &filename, const std::string &refname, RuntimeScene &scene);

    void GD_EXTENSION_API CreateNewElement(const std::string &refname, const int type, const std::string &content, RuntimeScene &scene); ///< 0 -> TiXmlElement / 1 -> TiXmlText / 2 -> TiXmlComment
    void GD_EXTENSION_API DeleteAnElement(const std::string &refname, RuntimeScene &scene);

    void GD_EXTENSION_API InsertElementIntoAnother(const std::string &refNameOfElementToAdd, const std::string &refNameOfParentElement, const std::string &refNameOfNextElement, RuntimeScene &scene);
    void GD_EXTENSION_API BrowseTo(const std::string baseRefName, const std::string &futureRefName, const std::string &pathToFutureRefName, RuntimeScene &scene);
    void GD_EXTENSION_API NextSibling(const std::string &futureRefName, const std::string &baseRefName, const std::string &tagName, RuntimeScene &scene);

    bool GD_EXTENSION_API IsRefValid(const std::string &refName, RuntimeScene &scene);
    int GD_EXTENSION_API GetRefType(const std::string &refName, RuntimeScene &scene);

    std::string GD_EXTENSION_API GetText(const std::string &refName, RuntimeScene &scene);
    void GD_EXTENSION_API SetText(const std::string &refName, const std::string &text, RuntimeScene &scene);

    std::string GD_EXTENSION_API GetAttributeString(const std::string &refname, const std::string &property, RuntimeScene &scene);
    double GD_EXTENSION_API GetAttributeNumber(const std::string &refname, const std::string &property, RuntimeScene &scene);

    void GD_EXTENSION_API SetAttributeString(const std::string &refname, const std::string &property, const std::string &value, RuntimeScene &scene);
    void GD_EXTENSION_API SetAttributeNumber(const std::string &refname, const std::string &property, const double &value, RuntimeScene &scene);

    void GD_EXTENSION_API RemoveAttribute(const std::string &refname, const std::string &property, RuntimeScene &scene);
}

#endif // AESACTIONS_H_INCLUDED
