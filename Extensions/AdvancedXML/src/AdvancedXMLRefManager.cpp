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

#include "AdvancedXMLRefManager.h"

#include <algorithm>
#include <vector>

#include "GDCpp/CommonTools.h"
#include "GDCpp/tinyxml/tinyxml.h"

namespace AdvancedXML
{
    std::map< RuntimeScene*, RefManager* > *RefManager::inst = new std::map< RuntimeScene*, RefManager* >;

    RefManager::RefManager()
    {

    }

    RefManager::~RefManager()
    {
        std::map<std::string, TiXmlNode*>::iterator it;
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

    TiXmlNode* RefManager::GetRef(const std::string &refName)
    {
        return m_refs[refName];
    }

    void RefManager::SetRef(const std::string &refName, TiXmlNode *node)
    {
        m_refs[refName] = node;
    }

    void RefManager::DeleteChildRefs(const std::string &parentRef)
    {
        TiXmlNode *parentNode = GetRef(parentRef);

        if(parentNode)
        {
            TiXmlNode *childNode = parentNode->FirstChild();
            while(childNode)
            {
                //Search the element in the map
                std::map<std::string, TiXmlNode*>::iterator findedEle = m_refs.begin();
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

    void RefManager::CreateNewDocument(const std::string &refname)
    {
        TiXmlDocument *doc = new TiXmlDocument();
        m_refs[refname] = doc;
    }

    void RefManager::LoadDocument(const std::string &filename, const std::string &refName)
    {
        TiXmlDocument *doc = new TiXmlDocument(filename.c_str());

        if(doc->LoadFile())
            m_refs[refName] = doc;
        else
            m_refs[refName] = 0;
    }

    void RefManager::SaveDocument(const std::string &filename, const std::string &refName)
    {
        if(!GetRef(refName))
            return;

        TiXmlDocument *doc = GetRef(refName)->ToDocument();
        if(doc) doc->SaveFile(filename.c_str());
    }

    void RefManager::CreateRef(const std::string &baseRef, const std::string &newRef, const std::string &path)
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

        std::vector<std::string> pathArgs = SplitString<std::string>(path, '/');
        TiXmlNode *currentNode = baseNode;

        for(unsigned int a = 0;
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

