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

#ifndef ADVANCEDXMLREFMANAGER_H_INCLUDED
#define ADVANCEDXMLREFMANAGER_H_INCLUDED

#include <string>
#include <map>

class TiXmlNode;
class RuntimeScene;

namespace AdvancedXML
{
    class RefManager
    {
        public:
        ~RefManager();
        static RefManager* GetInstance(RuntimeScene *scene);
        static void Destroy();

        /**
            Get the TiXmlNode corresponding to the ref name.
         */
        TiXmlNode* GetRef(const std::string &refName);

        void SetRef(const std::string &refName, TiXmlNode *node);

        /**
            Delete all child (TiXmlNode) refs from a given ref (use to prevent memory leaks and pointers pointing on invalid data to avoid crashs).
         */
        void DeleteChildRefs(const std::string &parentRef);

        /**
            Create a new document (empty)
         */
        void CreateNewDocument(const std::string &refname);

        /**
            Load a document and store it in a ref with the given name.
         */
        void LoadDocument(const std::string &filename, const std::string &refName);

        /**
            Save the document (if the ref refers to a TiXmlDocument).
         */
        void SaveDocument(const std::string &filename, const std::string &refName);

        /**
            Create a ref from an other (on its sub-elements or parent).
            Note : It doesn't create an element, it just create a ref on an element.
         */
        void CreateRef(const std::string &baseRef, const std::string &newRef, const std::string &path);

        /**
            Create an element with the given reference name.
         */
        template<class T>
        void CreateElement(const std::string &refName, const std::string &content);

        private:
        RefManager();

        std::map< std::string, TiXmlNode* > m_refs;

        //Singleton instance
        static std::map< RuntimeScene*, RefManager* > *inst;
    };

    //TEMPLATES IMPL
    template<class T>
    void RefManager::CreateElement(const std::string &refName, const std::string &content)
    {
        m_refs[refName] = new T(content.c_str());
    }
}

#endif
