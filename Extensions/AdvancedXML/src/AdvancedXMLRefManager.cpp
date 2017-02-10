/*

GDevelop - AdvancedXML Extension
Copyright (c) 2012-2016 Victor Levasseur
This project is released under the MIT License.
*/

#include "AdvancedXMLRefManager.h"

#include <algorithm>
#include <vector>

#include "GDCpp/Runtime/CommonTools.h"
#include "GDCpp/Runtime/TinyXml/tinyxml2.h"
#include "GDCpp/Runtime/Tools/XmlLoader.h"

namespace AdvancedXML
{
    std::map< RuntimeScene*, RefManager* > *RefManager::inst = new std::map< RuntimeScene*, RefManager* >;

    RefManager::RefManager()
    {

    }

    RefManager::~RefManager()
    {
        std::map<gd::String, tinyxml2::XMLNode*>::iterator it;
        for(it = m_refs.begin(); it != m_refs.end(); it++)
        {
            if(it->second && it->second->ToDocument())
                delete it->second->ToDocument(); // Only documents can be deleted
        }
        m_refs.clear();
    }

    RefManager* RefManager::Get(RuntimeScene *scene)
    {
        if((*inst)[scene] == nullptr)
        {
            (*inst)[scene] = new RefManager();
        }
        return inst->at(scene);
    }

    void RefManager::Destroy()
    {
        std::map<RuntimeScene*, RefManager*>::iterator it;
        for(it = inst->begin(); it != inst->end(); it++)
        {
            if(it->second)
                delete it->second;
        }
    }

    tinyxml2::XMLNode* RefManager::GetRef(const gd::String &refName)
    {
        return m_refs[refName];
    }

    void RefManager::SetRef(const gd::String &refName, tinyxml2::XMLNode *node)
    {
        m_refs[refName] = node;
    }

    void RefManager::DeleteChildRefs(const gd::String &parentRef)
    {
        tinyxml2::XMLNode *parentNode = GetRef(parentRef);

        if(parentNode)
        {
            tinyxml2::XMLNode *childNode = parentNode->FirstChild();
            while(childNode)
            {
                //Search the element in the map
                std::map<gd::String, tinyxml2::XMLNode*>::iterator findedEle = m_refs.begin();
                while(findedEle->second != childNode && findedEle != m_refs.end())
                {
                    findedEle++;
                }

                //Delete childs of the element
                if(findedEle != m_refs.end())
                {
                    DeleteChildRefs(findedEle->first);
                    m_refs.erase(findedEle);
                }

                childNode = childNode->NextSibling();
            }
        }
    }

    void RefManager::CreateNewDocument(const gd::String &refname)
    {
        tinyxml2::XMLDocument *doc = new tinyxml2::XMLDocument();
        m_refs[refname] = doc;
    }

    void RefManager::LoadDocument(const gd::String &filename, const gd::String &refName)
    {
        tinyxml2::XMLDocument *doc = new tinyxml2::XMLDocument();

        if(gd::LoadXmlFromFile(*doc, filename))
            m_refs[refName] = doc;
        else
        {
            delete doc;
            m_refs[refName] = 0;
        }
    }

    void RefManager::SaveDocument(const gd::String &filename, const gd::String &refName)
    {
        if(!GetRef(refName))
            return;

        tinyxml2::XMLDocument *doc = GetRef(refName)->ToDocument();
        if(doc) gd::SaveXmlToFile(*doc, filename);
    }

    void RefManager::CreateRef(const gd::String &baseRef, const gd::String &newRef, const gd::String &path)
    {
        /** Note :  .. => Browse to its parent
                    .  => Browse to the document it lives in
                    *  => Browse to the first (don't take care of tag name) child element
                    else browse to first child element with the given tag name.
            Each path elements has to be separated by "/"
        */

        tinyxml2::XMLNode *baseNode = GetRef(baseRef);

        if(!baseNode)
            return;

        std::vector<gd::String> pathArgs = path.Split('/');
        tinyxml2::XMLNode *currentNode = baseNode;

        for(std::size_t a = 0;
            a < pathArgs.size() && currentNode;
            a++)
        {
            if(pathArgs.at(a) == ".")
            {
                if(currentNode->GetDocument())
                {
                    currentNode = currentNode->GetDocument();
                }
                else
                {
                    currentNode = nullptr;
                }
            }
            else if(pathArgs.at(a) == "..")
            {
                if(currentNode->Parent())
                {
                    currentNode = currentNode->Parent();
                }
                else
                {
                    currentNode = nullptr;
                }
            }
            else if(pathArgs.at(a) == "*")
            {
                currentNode = currentNode->FirstChild();
            }
            else
            {
                currentNode = currentNode->FirstChildElement(pathArgs.at(a).c_str());
            }
        }

        m_refs[newRef] = currentNode;
    }

    void RefManager::CreateElement(const gd::String &refName, const gd::String &content, const gd::String &documentRef)
    {
        tinyxml2::XMLDocument * doc = GetRef(documentRef)->ToDocument();
        if(!doc)
            return;

        m_refs[refName] = doc->NewElement(content.c_str());
    }

    void RefManager::CreateText(const gd::String &refName, const gd::String &content, const gd::String &documentRef)
    {
        tinyxml2::XMLDocument * doc = GetRef(documentRef)->ToDocument();
        if(!doc)
            return;

        m_refs[refName] = doc->NewText(content.c_str());
    }

    void RefManager::CreateComment(const gd::String &refName, const gd::String &content, const gd::String &documentRef)
    {
        tinyxml2::XMLDocument * doc = GetRef(documentRef)->ToDocument();
        if(!doc)
            return;

        m_refs[refName] = doc->NewComment(content.c_str());
    }

    void RefManager::CreateDeclaration(const gd::String &refName, const gd::String &content, const gd::String &documentRef)
    {
        tinyxml2::XMLDocument * doc = GetRef(documentRef)->ToDocument();
        if(!doc)
            return;

        m_refs[refName] = doc->NewDeclaration(content.c_str());
    }
}
