/*

GDevelop - AdvancedXML Extension
Copyright (c) 2012-2015 Victor Levasseur
This project is released under the MIT License.
*/

#include "AdvancedXMLRefManager.h"

#include <algorithm>
#include <vector>

#include "GDCpp/CommonTools.h"
#include "GDCpp/TinyXml/tinyxml.h"

namespace AdvancedXML
{
    std::map< RuntimeScene*, RefManager* > *RefManager::inst = new std::map< RuntimeScene*, RefManager* >;

    RefManager::RefManager()
    {

    }

    RefManager::~RefManager()
    {
        std::map<gd::String, TiXmlNode*>::iterator it;
        for(it = m_refs.begin(); it != m_refs.end(); it++)
        {
            if(it->second)
                delete it->second;
        }
        m_refs.clear();
    }

    RefManager* RefManager::Get(RuntimeScene *scene)
    {
        if((*inst)[scene] == NULL)
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

    TiXmlNode* RefManager::GetRef(const gd::String &refName)
    {
        return m_refs[refName];
    }

    void RefManager::SetRef(const gd::String &refName, TiXmlNode *node)
    {
        m_refs[refName] = node;
    }

    void RefManager::DeleteChildRefs(const gd::String &parentRef)
    {
        TiXmlNode *parentNode = GetRef(parentRef);

        if(parentNode)
        {
            TiXmlNode *childNode = parentNode->FirstChild();
            while(childNode)
            {
                //Search the element in the map
                std::map<gd::String, TiXmlNode*>::iterator findedEle = m_refs.begin();
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
        TiXmlDocument *doc = new TiXmlDocument();
        m_refs[refname] = doc;
    }

    void RefManager::LoadDocument(const gd::String &filename, const gd::String &refName)
    {
        TiXmlDocument *doc = new TiXmlDocument(filename.ToLocale().c_str());

        if(doc->LoadFile())
            m_refs[refName] = doc;
        else
            m_refs[refName] = 0;
    }

    void RefManager::SaveDocument(const gd::String &filename, const gd::String &refName)
    {
        if(!GetRef(refName))
            return;

        TiXmlDocument *doc = GetRef(refName)->ToDocument();
        if(doc) doc->SaveFile(filename.ToLocale().c_str());
    }

    void RefManager::CreateRef(const gd::String &baseRef, const gd::String &newRef, const gd::String &path)
    {
        /** Note :  .. => Browse to its parent
                    .  => Browse to the document it lives in
                    *  => Browse to the first (don't take care of tag name) child element
                    else browse to first child element with the given tag name.
            Each path elements has to be separated by "/"
        */

        TiXmlNode *baseNode = GetRef(baseRef);

        if(!baseNode)
            return;

        std::vector<gd::String> pathArgs = path.Split('/');
        TiXmlNode *currentNode = baseNode;

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
                    currentNode = 0;
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
                    currentNode = 0;
                }
            }
            else if(pathArgs.at(a) == "*")
            {
                currentNode = currentNode->FirstChild();
            }
            else
            {
                currentNode = currentNode->FirstChild(pathArgs.at(a).c_str());
            }
        }

        m_refs[newRef] = currentNode;
    }
}
