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

#include "AdvancedXMLTools.h"
#include "GDCpp/RuntimeScene.h"
#include "GDCpp/tinyxml/tinyxml.h"
#include "AdvancedXMLRefManager.h"

#include <iostream>
#include <fstream>
#include <string>

using namespace std;

namespace AdvancedXML
{
    void GD_EXTENSION_API CreateNewDocument(const std::string &refname, RuntimeScene &scene)
    {
        RefManager::Get(&scene)->CreateNewDocument(refname);
    }

    void GD_EXTENSION_API LoadXmlFile(const std::string &filename, const std::string &refname, RuntimeScene &scene)
    {
        RefManager::Get(&scene)->LoadDocument(filename, refname);
    }

    void GD_EXTENSION_API SaveXmlFile(const std::string &filename, const std::string &refname, RuntimeScene &scene)
    {
        RefManager::Get(&scene)->SaveDocument(filename, refname);
    }

    void GD_EXTENSION_API CreateNewElement(const std::string &refname, const int type, const std::string &content, RuntimeScene &scene)
    {
        if(type == 0)
            RefManager::Get(&scene)->CreateElement<TiXmlElement>(refname, content);
        else if(type == 1)
            RefManager::Get(&scene)->CreateElement<TiXmlText>(refname, content);
        else if(type == 2)
            RefManager::Get(&scene)->CreateElement<TiXmlComment>(refname, content);
    }

    void GD_EXTENSION_API DeleteAnElement(const std::string &refname, RuntimeScene &scene)
    {
        TiXmlNode *nodeToRemove = RefManager::Get(&scene)->GetRef(refname);

        if(nodeToRemove)
        {
            RefManager::Get(&scene)->DeleteChildRefs(refname);
            if(nodeToRemove->Parent())
            {
                nodeToRemove->Parent()->RemoveChild(nodeToRemove);
            }
            RefManager::Get(&scene)->SetRef(refname, 0);
        }
    }

    void GD_EXTENSION_API InsertElementIntoAnother(const std::string &refNameOfElementToAdd, const std::string &refNameOfParentElement, const std::string &refNameOfNextElement, RuntimeScene &scene)
    {
        TiXmlNode *parentEle = RefManager::Get(&scene)->GetRef(refNameOfParentElement);
        TiXmlNode *nextEle = RefManager::Get(&scene)->GetRef(refNameOfNextElement);
        TiXmlNode *toBeAddedEle = RefManager::Get(&scene)->GetRef(refNameOfElementToAdd);

        if ( parentEle == NULL || toBeAddedEle == NULL )
            return; //These element cannot be invalid
        else
        {
            if(!nextEle || nextEle->Parent() != parentEle)
            {
                parentEle->LinkEndChild(toBeAddedEle);
            }
            else
            {
                TiXmlNode *insertedEle = 0;
                insertedEle = parentEle->InsertBeforeChild(nextEle, *toBeAddedEle);
                RefManager::Get(&scene)->SetRef(refNameOfElementToAdd, insertedEle);
            }

        }
    }

    void GD_EXTENSION_API BrowseTo(const std::string baseRefName, const std::string &futureRefName, const std::string &pathToFutureRefName, RuntimeScene &scene)
    {
        RefManager::Get(&scene)->CreateRef(baseRefName, futureRefName, pathToFutureRefName);
    }

    void GD_EXTENSION_API NextSibling(const std::string &futureRefName, const std::string &baseRefName, const std::string &tagName, RuntimeScene &scene)
    {
        if(!RefManager::Get(&scene)->GetRef(baseRefName))
            return;

        RefManager::Get(&scene)->SetRef(futureRefName,
                                                tagName == "" ? RefManager::Get(&scene)->GetRef(baseRefName)->NextSibling() :
                                                                RefManager::Get(&scene)->GetRef(baseRefName)->NextSibling(tagName.c_str()));
    }

    bool GD_EXTENSION_API IsRefValid(const std::string &refName, RuntimeScene &scene)
    {
        return RefManager::Get(&scene)->GetRef(refName) ? true : false;
    }

    int GD_EXTENSION_API GetRefType(const std::string &refName, RuntimeScene &scene)
    {
        if(!RefManager::Get(&scene)->GetRef(refName))
            return -1;

        int type = RefManager::Get(&scene)->GetRef(refName)->Type();

        if(type == TiXmlNode::ELEMENT)
            return 0;
        if(type == TiXmlNode::TEXT)
            return 1;
        if(type == TiXmlNode::COMMENT)
            return 2;
        if(type == TiXmlNode::DOCUMENT)
            return 3;
        else
            return -1;

        return -1;
    }

    std::string GD_EXTENSION_API GetText(const std::string &refName, RuntimeScene &scene)
    {
        TiXmlNode *refNode = RefManager::Get(&scene)->GetRef(refName);

        if(refNode)
        {
            return std::string(refNode->Value());
        }

        return "";
    }

    void GD_EXTENSION_API SetText(const std::string &refName, const std::string &text, RuntimeScene &scene)
    {
        TiXmlNode *refNode = RefManager::Get(&scene)->GetRef(refName);

        if(refNode)
        {
            refNode->SetValue(text.c_str());
        }
    }

    std::string GD_EXTENSION_API GetAttributeString(const std::string &refname, const std::string &property, RuntimeScene &scene)
    {
        TiXmlNode *refNode = RefManager::Get(&scene)->GetRef(refname);

        if(refNode)
        {
            TiXmlElement *refEle = refNode->ToElement();
            if(refEle)
            {
                std::string attributeStr = refEle->Attribute(property.c_str());
                return attributeStr;
            }
            else
            {
                return "";
            }
        }
        else
        {
            return "";
        }
    }

    double GD_EXTENSION_API GetAttributeNumber(const std::string &refname, const std::string &property, RuntimeScene &scene)
    {
        TiXmlNode *refNode = RefManager::Get(&scene)->GetRef(refname);

        if(refNode)
        {
            TiXmlElement *refEle = refNode->ToElement();
            if(refEle)
            {
                double attributeDouble = 0;
                refEle->QueryDoubleAttribute(property.c_str(), &attributeDouble);

                return attributeDouble;
            }
            else
            {
                return 0;
            }
        }
        else
        {
            return 0;
        }
    }

    void GD_EXTENSION_API SetAttributeString(const std::string &refname, const std::string &property, const std::string &value, RuntimeScene &scene)
    {
        TiXmlNode *refNode = RefManager::Get(&scene)->GetRef(refname);

        if(refNode)
        {
            TiXmlElement *refEle = refNode->ToElement();
            if(refEle)
            {
                refEle->SetAttribute(property.c_str(), value.c_str());
            }
        }
    }

    void GD_EXTENSION_API SetAttributeNumber(const std::string &refname, const std::string &property, const double &value, RuntimeScene &scene)
    {
        TiXmlNode *refNode = RefManager::Get(&scene)->GetRef(refname);

        if(refNode)
        {
            TiXmlElement *refEle = refNode->ToElement();
            if(refEle)
            {
                refEle->SetDoubleAttribute(property.c_str(), value);
            }
        }
    }

    void GD_EXTENSION_API RemoveAttribute(const std::string &refname, const std::string &property, RuntimeScene &scene)
    {
        TiXmlNode *refNode = RefManager::Get(&scene)->GetRef(refname);

        if(refNode)
        {
            TiXmlElement *refEle = refNode->ToElement();
            if(refEle)
            {
                refEle->RemoveAttribute(property.c_str());
            }
        }
    }
}

