/*

GDevelop - AdvancedXML Extension
Copyright (c) 2012-2016 Victor Levasseur
This project is released under the MIT License.
*/

#include "AdvancedXMLTools.h"
#include "GDCpp/Runtime/RuntimeScene.h"
#include "GDCpp/Runtime/TinyXml/tinyxml.h"
#include "AdvancedXMLRefManager.h"

#include <iostream>
#include <fstream>
#include <string>

using namespace std;

namespace AdvancedXML
{
    void GD_EXTENSION_API CreateNewDocument(const gd::String &refname, RuntimeScene &scene)
    {
        RefManager::Get(&scene)->CreateNewDocument(refname);
    }

    void GD_EXTENSION_API LoadXmlFile(const gd::String &filename, const gd::String &refname, RuntimeScene &scene)
    {
        RefManager::Get(&scene)->LoadDocument(filename, refname);
    }

    void GD_EXTENSION_API SaveXmlFile(const gd::String &filename, const gd::String &refname, RuntimeScene &scene)
    {
        RefManager::Get(&scene)->SaveDocument(filename, refname);
    }

    void GD_EXTENSION_API CreateNewElement(const gd::String &refname, const int type, const gd::String &content, RuntimeScene &scene)
    {
        if(type == 0)
            RefManager::Get(&scene)->CreateElement<TiXmlElement>(refname, content);
        else if(type == 1)
            RefManager::Get(&scene)->CreateElement<TiXmlText>(refname, content);
        else if(type == 2)
            RefManager::Get(&scene)->CreateElement<TiXmlComment>(refname, content);
    }

    void GD_EXTENSION_API DeleteAnElement(const gd::String &refname, RuntimeScene &scene)
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

    void GD_EXTENSION_API InsertElementIntoAnother(const gd::String &refNameOfElementToAdd, const gd::String &refNameOfParentElement, const gd::String &refNameOfNextElement, RuntimeScene &scene)
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

    void GD_EXTENSION_API BrowseTo(const gd::String baseRefName, const gd::String &futureRefName, const gd::String &pathToFutureRefName, RuntimeScene &scene)
    {
        RefManager::Get(&scene)->CreateRef(baseRefName, futureRefName, pathToFutureRefName);
    }

    void GD_EXTENSION_API NextSibling(const gd::String &futureRefName, const gd::String &baseRefName, const gd::String &tagName, RuntimeScene &scene)
    {
        if(!RefManager::Get(&scene)->GetRef(baseRefName))
            return;

        RefManager::Get(&scene)->SetRef(futureRefName,
                                                tagName == "" ? RefManager::Get(&scene)->GetRef(baseRefName)->NextSibling() :
                                                                RefManager::Get(&scene)->GetRef(baseRefName)->NextSibling(tagName.c_str()));
    }

    bool GD_EXTENSION_API IsRefValid(const gd::String &refName, RuntimeScene &scene)
    {
        return RefManager::Get(&scene)->GetRef(refName) ? true : false;
    }

    int GD_EXTENSION_API GetRefType(const gd::String &refName, RuntimeScene &scene)
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

    gd::String GD_EXTENSION_API GetText(const gd::String &refName, RuntimeScene &scene)
    {
        TiXmlNode *refNode = RefManager::Get(&scene)->GetRef(refName);

        if(refNode)
        {
            return gd::String(refNode->Value());
        }

        return "";
    }

    void GD_EXTENSION_API SetText(const gd::String &refName, const gd::String &text, RuntimeScene &scene)
    {
        TiXmlNode *refNode = RefManager::Get(&scene)->GetRef(refName);

        if(refNode)
        {
            refNode->SetValue(text.c_str());
        }
    }

    gd::String GD_EXTENSION_API GetAttributeString(const gd::String &refname, const gd::String &property, RuntimeScene &scene)
    {
        TiXmlNode *refNode = RefManager::Get(&scene)->GetRef(refname);

        if(refNode)
        {
            TiXmlElement *refEle = refNode->ToElement();
            if(refEle)
            {
                gd::String attributeStr = refEle->Attribute(property.c_str());
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

    double GD_EXTENSION_API GetAttributeNumber(const gd::String &refname, const gd::String &property, RuntimeScene &scene)
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

    void GD_EXTENSION_API SetAttributeString(const gd::String &refname, const gd::String &property, const gd::String &value, RuntimeScene &scene)
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

    void GD_EXTENSION_API SetAttributeNumber(const gd::String &refname, const gd::String &property, const double &value, RuntimeScene &scene)
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

    void GD_EXTENSION_API RemoveAttribute(const gd::String &refname, const gd::String &property, RuntimeScene &scene)
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

