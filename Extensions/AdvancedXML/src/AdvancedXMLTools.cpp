/*

GDevelop - AdvancedXML Extension
Copyright (c) 2012-2016 Victor Levasseur
This project is released under the MIT License.
*/

#include "AdvancedXMLTools.h"
#include "GDCpp/Runtime/RuntimeScene.h"
#include "GDCpp/Runtime/TinyXml/tinyxml2.h"
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

    void GD_EXTENSION_API CreateNewElement(const gd::String &refname, const int type, const gd::String &content, const gd::String &docRef, RuntimeScene &scene)
    {
        if(type == 0)
            RefManager::Get(&scene)->CreateElement(refname, content, docRef);
        else if(type == 1)
            RefManager::Get(&scene)->CreateText(refname, content, docRef);
        else if(type == 2)
            RefManager::Get(&scene)->CreateComment(refname, content, docRef);
        else if(type == 4)
            RefManager::Get(&scene)->CreateDeclaration(refname, content, docRef);
    }

    void GD_EXTENSION_API DeleteAnElement(const gd::String &refname, RuntimeScene &scene)
    {
        tinyxml2::XMLNode *nodeToRemove = RefManager::Get(&scene)->GetRef(refname);

        if(nodeToRemove)
        {
            RefManager::Get(&scene)->DeleteChildRefs(refname);
            if(nodeToRemove->Parent())
            {
                nodeToRemove->Parent()->DeleteChild(nodeToRemove);
            }
            RefManager::Get(&scene)->SetRef(refname, 0);
        }
    }

    void GD_EXTENSION_API InsertElementIntoAnother(const gd::String &refNameOfElementToAdd, const gd::String &refNameOfParentElement, const gd::String &refNameOfNextElement, RuntimeScene &scene)
    {
        tinyxml2::XMLNode *parentEle = RefManager::Get(&scene)->GetRef(refNameOfParentElement);
        tinyxml2::XMLNode *nextEle = RefManager::Get(&scene)->GetRef(refNameOfNextElement);
        tinyxml2::XMLNode *toBeAddedEle = RefManager::Get(&scene)->GetRef(refNameOfElementToAdd);

        if ( !parentEle || !toBeAddedEle )
            return; //These elements cannot be invalid
        else
        {
            if(!nextEle || nextEle->Parent() != parentEle)
            {
                parentEle->LinkEndChild(toBeAddedEle);
            }
            else
            {
                tinyxml2::XMLNode *insertedEle = nullptr;

                // To emulate an "insert before child" with InsertAfterChild,
                // we get the previous sibling of the element after the
                // insertion position or if it's the first, we use the
                // InsertFirstChild function.
                tinyxml2::XMLNode * previousEle = nextEle->PreviousSibling();
                if(previousEle)
                    insertedEle = parentEle->InsertAfterChild(previousEle, toBeAddedEle);
                else
                    insertedEle = parentEle->InsertFirstChild(toBeAddedEle);

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
                                                                RefManager::Get(&scene)->GetRef(baseRefName)->NextSiblingElement(tagName.c_str()));
    }

    bool GD_EXTENSION_API IsRefValid(const gd::String &refName, RuntimeScene &scene)
    {
        return RefManager::Get(&scene)->GetRef(refName) ? true : false;
    }

    int GD_EXTENSION_API GetRefType(const gd::String &refName, RuntimeScene &scene)
    {
        if(!RefManager::Get(&scene)->GetRef(refName))
            return -1;

        tinyxml2::XMLNode * node = RefManager::Get(&scene)->GetRef(refName);

        if(node->ToElement())
            return 0;
        else if(node->ToText())
            return 1;
        else if(node->ToComment())
            return 2;
        else if(node->ToDocument())
            return 3;
        else if(node->ToDeclaration())
            return 4;
        else
            return -1;
    }

    gd::String GD_EXTENSION_API GetText(const gd::String &refName, RuntimeScene &scene)
    {
        tinyxml2::XMLNode *refNode = RefManager::Get(&scene)->GetRef(refName);

        if(refNode)
        {
            return gd::String(refNode->Value());
        }

        return "";
    }

    void GD_EXTENSION_API SetText(const gd::String &refName, const gd::String &text, RuntimeScene &scene)
    {
        tinyxml2::XMLNode *refNode = RefManager::Get(&scene)->GetRef(refName);

        if(refNode)
        {
            refNode->SetValue(text.c_str());
        }
    }

    gd::String GD_EXTENSION_API GetAttributeString(const gd::String &refname, const gd::String &property, RuntimeScene &scene)
    {
        tinyxml2::XMLNode *refNode = RefManager::Get(&scene)->GetRef(refname);

        if(refNode)
        {
            tinyxml2::XMLElement *refEle = refNode->ToElement();
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
        tinyxml2::XMLNode *refNode = RefManager::Get(&scene)->GetRef(refname);

        if(refNode)
        {
            tinyxml2::XMLElement *refEle = refNode->ToElement();
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
        tinyxml2::XMLNode *refNode = RefManager::Get(&scene)->GetRef(refname);

        if(refNode)
        {
            tinyxml2::XMLElement *refEle = refNode->ToElement();
            if(refEle)
            {
                refEle->SetAttribute(property.c_str(), value.c_str());
            }
        }
    }

    void GD_EXTENSION_API SetAttributeNumber(const gd::String &refname, const gd::String &property, const double &value, RuntimeScene &scene)
    {
        tinyxml2::XMLNode *refNode = RefManager::Get(&scene)->GetRef(refname);

        if(refNode)
        {
            tinyxml2::XMLElement *refEle = refNode->ToElement();
            if(refEle)
            {
                refEle->SetAttribute(property.c_str(), value);
            }
        }
    }

    void GD_EXTENSION_API RemoveAttribute(const gd::String &refname, const gd::String &property, RuntimeScene &scene)
    {
        tinyxml2::XMLNode *refNode = RefManager::Get(&scene)->GetRef(refname);

        if(refNode)
        {
            tinyxml2::XMLElement *refEle = refNode->ToElement();
            if(refEle)
            {
                refEle->DeleteAttribute(property.c_str());
            }
        }
    }
}
