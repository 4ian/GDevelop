/** \file
 *  Game Develop
 *  2008-2014 Florian Rival (Florian.Rival@gmail.com)
 */

#ifndef AUTOMATISMSRUNTIMESHAREDDATAS_H
#define AUTOMATISMSRUNTIMESHAREDDATAS_H

namespace gd { class AutomatismsSharedData; }
#include <boost/shared_ptr.hpp>

/**
 * \brief Base class for defining automatisms shared datas used at runtime.
 *
 * Automatisms can use shared datas, as if they were extending the RuntimeScene members.
 * Inherit from this class, and define an appropriate constructor, which will be called by the
 * CreateRuntimeSharedDatas member function of AutomatismsharedDatas.
 *
 * \see AutomatismsharedDatas::CreateRuntimeSharedDatas
 *
 * \ingroup GameEngine
 */
class AutomatismsRuntimeSharedData
{
    public:
        AutomatismsRuntimeSharedData() {};
        virtual ~AutomatismsRuntimeSharedData() {};
        virtual boost::shared_ptr<AutomatismsRuntimeSharedData> Clone() const { return boost::shared_ptr<AutomatismsRuntimeSharedData>(new AutomatismsRuntimeSharedData(*this));}

};

#endif // AUTOMATISMSRUNTIMESHAREDDATAS_H

