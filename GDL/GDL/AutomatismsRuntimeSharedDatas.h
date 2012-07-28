/** \file
 *  Game Develop
 *  2008-2012 Florian Rival (Florian.Rival@gmail.com)
 */

#ifndef AUTOMATISMSRUNTIMESHAREDDATAS_H
#define AUTOMATISMSRUNTIMESHAREDDATAS_H

class AutomatismsSharedDatas;
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
class AutomatismsRuntimeSharedDatas
{
    public:
        AutomatismsRuntimeSharedDatas() {};
        virtual ~AutomatismsRuntimeSharedDatas() {};
        virtual boost::shared_ptr<AutomatismsRuntimeSharedDatas> Clone() const { return boost::shared_ptr<AutomatismsRuntimeSharedDatas>(new AutomatismsRuntimeSharedDatas(*this));}

};

#endif // AUTOMATISMSRUNTIMESHAREDDATAS_H
