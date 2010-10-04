//////////////////////////////////////////////////////////////////////////////////
// SPARK Irrlicht Rendering library												//
// Copyright (C) 2009															//
// Thibault Lescoat -  info-tibo <at> orange <dot> fr							//
// Julien Fryer - julienfryer@gmail.com											//
//																				//
// This software is provided 'as-is', without any express or implied			//
// warranty.  In no event will the authors be held liable for any damages		//
// arising from the use of this software.										//
//																				//
// Permission is granted to anyone to use this software for any purpose,		//
// including commercial applications, and to alter it and redistribute it		//
// freely, subject to the following restrictions:								//
//																				//
// 1. The origin of this software must not be misrepresented; you must not		//
//    claim that you wrote the original software. If you use this software		//
//    in a product, an acknowledgment in the product documentation would be		//
//    appreciated but is not required.											//
// 2. Altered source versions must be plainly marked as such, and must not be	//
//    misrepresented as being the original software.							//
// 3. This notice may not be removed or altered from any source distribution.	//
//////////////////////////////////////////////////////////////////////////////////

#include "RenderingAPIs/Irrlicht/SPK_IRRSystem.h"
#include "Core/SPK_Group.h"

namespace SPK
{
namespace IRR
{
    IRRSystem::IRRSystem(irr::scene::ISceneNode* parent, irr::scene::ISceneManager* mgr,bool worldTransformed,irr::s32 id) :
		irr::scene::ISceneNode(parent,mgr,id),
		System(),
		worldTransformed(worldTransformed),
		AutoUpdate(true),
		AlwaysUpdate(false),
		finished(false),
		lastUpdatedTime(0)
    {}

	IRRSystem::IRRSystem(const IRRSystem& system) :
		System(system),
		ISceneNode(system.getParent(),system.getSceneManager()),
		AutoUpdate(system.AutoUpdate),
		AlwaysUpdate(system.AlwaysUpdate),
		worldTransformed(system.worldTransformed),
		finished(system.finished),
		lastUpdatedTime(0)
	{
		cloneMembers(&const_cast<IRRSystem&>(system),NULL);
		//updateAbsolutePosition();
	}

    void IRRSystem::OnRegisterSceneNode()
    {
        if(IsVisible)
			SceneManager->registerNodeForRendering(this,irr::scene::ESNRP_TRANSPARENT_EFFECT); // Draws in transparent effect pass (may be optimized)

        irr::scene::ISceneNode::OnRegisterSceneNode();
    }

    void IRRSystem::render() const
    {
        // Sets the transform matrix
        SceneManager->getVideoDriver()->setTransform(irr::video::ETS_WORLD,AbsoluteTransformation);

        // Renders particles
        SPK::System::render();
    }

    void IRRSystem::OnAnimate(irr::u32 timeMs)
    {
		if (lastUpdatedTime == 0)
		{
			lastUpdatedTime = timeMs;
			return;
		}

        if(AutoUpdate && (AlwaysUpdate || (IsVisible/* && !SceneManager->isCulled(this)*/))) // check culling (disabled atm)
			update((timeMs - lastUpdatedTime) * 0.001f);

        lastUpdatedTime = timeMs;
    }

	void IRRSystem::updateAbsolutePosition()
	{
		irr::scene::ISceneNode::updateAbsolutePosition();

		if (worldTransformed)
		{
			this->setTransform(AbsoluteTransformation.pointer());
			updateTransform();
			AbsoluteTransformation.makeIdentity();
		}
	}

    const irr::core::aabbox3d<irr::f32>& IRRSystem::getBoundingBox() const
    {
        BBox.MaxEdge = spk2irr(getAABBMax());
        BBox.MinEdge = spk2irr(getAABBMin());
        return BBox;
    }

	void IRRSystem::updateCameraPosition() const
	{
		for (std::vector<Group*>::const_iterator it = groups.begin(); it != groups.end(); ++it)
			if ((*it)->isDistanceComputationEnabled())
			{
				irr::core::vector3df pos = SceneManager->getActiveCamera()->getAbsolutePosition();
				if (!worldTransformed)
				{
					irr::core::matrix4 invTransform;
					AbsoluteTransformation.getInversePrimitive(invTransform);
					invTransform.transformVect(pos);
				}
				setCameraPosition(irr2spk(pos));
				break;
			}
	}
}}
