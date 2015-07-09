/*
 * GDevelop C++ Platform
 * Copyright 2008-2015 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */
#ifndef AUTOMATISMSRUNTIMESHAREDDATAS_HOLDER_H
#define AUTOMATISMSRUNTIMESHAREDDATAS_HOLDER_H
#include <string>
#include <map>
#include <memory>
#include "GDCpp/String.h"
class AutomatismsRuntimeSharedData;
namespace gd { class AutomatismsSharedData; }

/**
 * \brief Contains all the shared data of the automatisms of a RuntimeScene.
 */
class GD_API AutomatismsRuntimeSharedDataHolder
{
public:
	AutomatismsRuntimeSharedDataHolder() {};
    AutomatismsRuntimeSharedDataHolder(const AutomatismsRuntimeSharedDataHolder & other);
    AutomatismsRuntimeSharedDataHolder & operator=(const AutomatismsRuntimeSharedDataHolder & other);

	/**
	 * \brief Return the shared data for an automatism.
     * \warning Be careful, no check is made to ensure that the shared data exist.
     * \param name The name of the automatism for which shared data must be fetched.
	 */
    const std::shared_ptr<AutomatismsRuntimeSharedData> & GetAutomatismSharedData(const gd::String & automatismName) const;

    /**
     * \brief Create all runtime shared data according to the initial shared data passed as argument.
     */
    void LoadFrom(const std::map < gd::String, std::shared_ptr<gd::AutomatismsSharedData> > & sharedData);

private:
    void Init(const AutomatismsRuntimeSharedDataHolder & other);

	std::map < gd::String, std::shared_ptr<AutomatismsRuntimeSharedData> > automatismsSharedDatas;
};

#endif
