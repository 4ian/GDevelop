/*

GDevelop - AdvancedXML Extension
Copyright (c) 2012-2016 Victor Levasseur
This project is released under the MIT License.
*/

#ifndef ADVANCEDXMLREFMANAGER_H_INCLUDED
#define ADVANCEDXMLREFMANAGER_H_INCLUDED

#include <map>
#include "GDCpp/Runtime/String.h"

namespace tinyxml2 { class XMLNode; }
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
            Get the tinyxml2::XMLNode corresponding to the ref name.
         */
        tinyxml2::XMLNode* GetRef(const gd::String &refName);

        void SetRef(const gd::String &refName, tinyxml2::XMLNode *node);

        /**
            Delete all child (tinyxml2::XMLNode) refs from a given ref (use to prevent memory leaks and pointers pointing on invalid data to avoid crashs).
         */
        void DeleteChildRefs(const gd::String &parentRef);

        /**
            Create a new document (empty)
         */
        void CreateNewDocument(const gd::String &refname);

        /**
            Load a document and store it in a ref with the given name.
         */
        void LoadDocument(const gd::String &filename, const gd::String &refName);

        /**
            Save the document (if the ref refers to a tinyxml2::XMLDocument).
         */
        void SaveDocument(const gd::String &filename, const gd::String &refName);

        /**
            Create a ref from an other (on its sub-elements or parent).
            Note : It doesn't create an element, it just create a ref on an element.
         */
        void CreateRef(const gd::String &baseRef, const gd::String &newRef, const gd::String &path);

        /**
            Create an element with the given reference name.
         */
        void CreateElement(const gd::String &refName, const gd::String &content, const gd::String &documentRef);

        void CreateText(const gd::String &refName, const gd::String &content, const gd::String &documentRef);

        void CreateComment(const gd::String &refName, const gd::String &content, const gd::String &documentRef);

        void CreateDeclaration(const gd::String &refName, const gd::String &content, const gd::String &documentRef);

        private:
        RefManager();

        std::map< gd::String, tinyxml2::XMLNode* > m_refs;

        //Singleton instance
        static std::map< RuntimeScene*, RefManager* > *inst;
    };
}

#endif
