/*

GDevelop - AdvancedXML Extension
Copyright (c) 2012 Victor Levasseur
This project is released under the MIT License.
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
        static RefManager* Get(RuntimeScene *scene);
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

