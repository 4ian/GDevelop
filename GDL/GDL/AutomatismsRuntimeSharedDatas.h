/**
 *  Game Develop
 *  2008-2011 Florian Rival (Florian.Rival@gmail.com)
 */

#ifndef AUTOMATISMSRUNTIMESHAREDDATAS_H
#define AUTOMATISMSRUNTIMESHAREDDATAS_H

class AutomatismsSharedDatas;
#include <boost/shared_ptr.hpp>

/**
 * Base class for defining automatisms runtime shared datas.
 * Automatisms can use shared datas, as if they were extending the RuntimeScene members.
 * Inherit from this class, and define an appropriate constructor called by the
 * CreateRuntimeSharedDatas member function of AutomatismsharedDatas
 */
class AutomatismsRuntimeSharedDatas
{
    public:
        AutomatismsRuntimeSharedDatas() {};
        virtual ~AutomatismsRuntimeSharedDatas() {};
        virtual boost::shared_ptr<AutomatismsRuntimeSharedDatas> Clone() { return boost::shared_ptr<AutomatismsRuntimeSharedDatas>(new AutomatismsRuntimeSharedDatas(*this));}

};

#endif // AUTOMATISMSRUNTIMESHAREDDATAS_H
