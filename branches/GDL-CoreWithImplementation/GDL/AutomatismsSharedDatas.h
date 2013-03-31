/** \file
 *  Game Develop
 *  2008-2013 Florian Rival (Florian.Rival@gmail.com)
 */

#ifndef AUTOMATISMSSHAREDDATAS_H
#define AUTOMATISMSSHAREDDATAS_H

#include "GDL/AutomatismsRuntimeSharedDatas.h"
#include <boost/shared_ptr.hpp>
#include <string>
class TiXmlElement;

/**
 * \brief Base class for defining automatisms shared datas.
 *
 * Automatisms can use shared datas, as if they were extending the Scene members.
 * Inherit from this class, and redefine Clone and CreateRuntimeSharedDatas.
 *
 * \ingroup GameEngine
 */
class GD_API AutomatismsSharedDatas
{
    public:
        AutomatismsSharedDatas(std::string typeName);
        virtual ~AutomatismsSharedDatas() {};
        virtual boost::shared_ptr<AutomatismsSharedDatas> Clone() const { return boost::shared_ptr<AutomatismsSharedDatas>(new AutomatismsSharedDatas(*this));}

        /**
         * Change the name identifying the automatism. Change also AutomatismId.
         */
        void SetName(std::string name_);

        /**
         * Return the name identifying the automatism
         */
        std::string GetName() { return name; }

        /**
         * Return the name identifying the type of the automatism
         */
        std::string GetTypeName() { return type; }

        /**
         * Create Runtime equivalent of the shared datas.
         * Derived class have to redefine this so as to create an appropriate
         * object containing runtime shared datas.
         */
        virtual boost::shared_ptr<AutomatismsRuntimeSharedDatas> CreateRuntimeSharedDatas()
        {
            return boost::shared_ptr<AutomatismsRuntimeSharedDatas>();
        }

        #if defined(GD_IDE_ONLY)
        /**
         * Save AutomatismsSharedDatas to XML
         */
        virtual void SaveToXml(TiXmlElement * eventElem) const {}
        #endif

        /**
         * Load AutomatismsSharedDatas from XML
         */
        virtual void LoadFromXml(const TiXmlElement * eventElem) {}

    private:
        std::string name;
        std::string type; ///< The type indicate of which type is the automatism.
};

#endif // AUTOMATISMSSHAREDDATAS_H

