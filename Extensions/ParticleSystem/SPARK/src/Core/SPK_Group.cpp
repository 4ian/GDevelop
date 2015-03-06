//////////////////////////////////////////////////////////////////////////////////
// SPARK particle engine														//
// Copyright (C) 2008-2009 - Julien Fryer - julienfryer@gmail.com				//
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


#include "Core/SPK_Group.h"
#include "Core/SPK_Emitter.h"
#include "Core/SPK_Modifier.h"
#include "Core/SPK_Renderer.h"
#include "Core/SPK_Factory.h"
#include "Core/SPK_Buffer.h"


namespace SPK
{
	bool Group::bufferManagement = true;

	Group::Group(Model* m,size_t capacity) :
		Registerable(),
		Transformable(),
		model(m != NULL ? m : &getDefaultModel()),
		renderer(NULL),
		friction(0.0f),
		gravity(Vector3D()),
		pool(Pool<Particle>(capacity)),
		particleData(new Particle::ParticleData[capacity]),
		particleCurrentParams(new float[capacity * model->getSizeOfParticleCurrentArray()]),
		particleExtendedParams(new float[capacity * model->getSizeOfParticleExtendedArray()]),
		sortingEnabled(false),
		distanceComputationEnabled(false),
		creationBuffer(),
		nbBufferedParticles(0),
		fupdate(NULL),
		fbirth(NULL),
		fdeath(NULL),
		boundingBoxEnabled(false),
		emitters(),
		modifiers(),
		activeModifiers(),
		additionalBuffers(),
		swappableBuffers()
	{}

	Group::Group(const Group& group) :
		Registerable(group),
		Transformable(group),
		model(group.model),
		renderer(group.renderer),
		friction(group.friction),
		gravity(group.gravity),
		pool(group.pool),
		sortingEnabled(group.sortingEnabled),
		distanceComputationEnabled(group.distanceComputationEnabled),
		creationBuffer(group.creationBuffer),
		nbBufferedParticles(group.nbBufferedParticles),
		fupdate(group.fupdate),
		fbirth(group.fbirth),
		fdeath(group.fdeath),
		boundingBoxEnabled(group.boundingBoxEnabled),
		emitters(group.emitters),
		modifiers(group.modifiers),
		activeModifiers(group.activeModifiers.capacity()),
		additionalBuffers(),
		swappableBuffers()
	{
		particleData = new Particle::ParticleData[pool.getNbReserved()];
		particleCurrentParams = new float[pool.getNbReserved() * model->getSizeOfParticleCurrentArray()];
		particleExtendedParams = new float[pool.getNbReserved() * model->getSizeOfParticleExtendedArray()];

		std::memcpy(particleData,group.particleData,pool.getNbTotal() * sizeof(Particle::ParticleData));
		std::memcpy(particleCurrentParams,group.particleCurrentParams,pool.getNbTotal() * sizeof(float) * model->getSizeOfParticleCurrentArray());
		std::memcpy(particleExtendedParams,group.particleExtendedParams,pool.getNbTotal() * sizeof(float) * model->getSizeOfParticleExtendedArray());

		for (Pool<Particle>::iterator it = pool.begin(); it != pool.endInactive(); ++it)
		{
			it->group = this;
			it->data = particleData + it->index;
			it->currentParams = particleCurrentParams + it->index * model->getSizeOfParticleCurrentArray();
			it->extendedParams = particleExtendedParams + it->index * model->getSizeOfParticleExtendedArray();
		}
	}

	Group::~Group()
	{
		delete[] particleData;
		delete[] particleCurrentParams;
		delete[] particleExtendedParams;

		// destroys additional buffers
		destroyAllBuffers();
	}

	void Group::registerChildren(bool registerAll)
	{
		Registerable::registerChildren(registerAll);

		registerChild(model,registerAll);
		registerChild(renderer,registerAll);

		for (std::vector<Emitter*>::const_iterator it = emitters.begin(); it != emitters.end(); ++it)
			registerChild(*it,registerAll);
		for (std::vector<Modifier*>::const_iterator it = modifiers.begin(); it != modifiers.end(); ++it)
			registerChild(*it,registerAll);
	}

	void Group::copyChildren(const Registerable& object,bool createBase)
	{
		const Group& group = dynamic_cast<const Group&>(object);
		Registerable::copyChildren(group,createBase);

		model = dynamic_cast<Model*>(copyChild(group.model,createBase));
		renderer = dynamic_cast<Renderer*>(copyChild(group.renderer,createBase));

		// we clear the copies of pointers pushed in the vectors by the copy constructor
		emitters.clear();
		modifiers.clear();

		for (std::vector<Emitter*>::const_iterator it = group.emitters.begin(); it != group.emitters.end(); ++it)
			emitters.push_back(dynamic_cast<Emitter*>(copyChild(*it,createBase)));
		for (std::vector<Modifier*>::const_iterator it = group.modifiers.begin(); it != group.modifiers.end(); ++it)
			modifiers.push_back(dynamic_cast<Modifier*>(copyChild(*it,createBase)));
	}

	void Group::destroyChildren(bool keepChildren)
	{
		destroyChild(model,keepChildren);
		destroyChild(renderer,keepChildren);

		for (std::vector<Emitter*>::const_iterator it = emitters.begin(); it != emitters.end(); ++it)
			destroyChild(*it,keepChildren);
		for (std::vector<Modifier*>::const_iterator it = modifiers.begin(); it != modifiers.end(); ++it)
			destroyChild(*it,keepChildren);

		Registerable::destroyChildren(keepChildren);
	}

	Registerable* Group::findByName(const std::string& name)
	{
		Registerable* object = Registerable::findByName(name);
		if (object != NULL)
			return object;

		object = model->findByName(name);
		if (object != NULL)
			return object;

		if (renderer != NULL)
		{
			object = renderer->findByName(name);
			if (object != NULL)
				return object;
		}

		for (std::vector<Emitter*>::const_iterator it = emitters.begin(); it != emitters.end(); ++it)
		{
			object = (*it)->findByName(name);
			if (object != NULL)
				return object;
		}

		for (std::vector<Modifier*>::const_iterator it = modifiers.begin(); it != modifiers.end(); ++it)
		{
			object = (*it)->findByName(name);
			if (object != NULL)
				return object;
		}

		return NULL;
	}

	void Group::setModel(Model* newmodel)
	{
		if(!newmodel) newmodel = &getDefaultModel();
		if(model == newmodel) return;

		// empty and change model
		empty();

		decrementChildReference(model);
		incrementChildReference(newmodel);
		model = newmodel;

		// recreate data
		delete[] particleData;
		delete[] particleCurrentParams;
		delete[] particleExtendedParams;

		particleData = new Particle::ParticleData[pool.getNbReserved()];
		particleCurrentParams = new float[pool.getNbReserved() * model->getSizeOfParticleCurrentArray()];
		particleExtendedParams = new float[pool.getNbReserved() * model->getSizeOfParticleExtendedArray()];

		pool.clear();

		// Destroys all the buffers
		destroyAllBuffers();
	}

	void Group::setRenderer(Renderer* renderer)
	{
		decrementChildReference(this->renderer);
		incrementChildReference(renderer);

		if ((bufferManagement)&&(renderer != this->renderer))
		{
			if (this->renderer != NULL) this->renderer->destroyBuffers(*this);
			if (renderer != NULL) renderer->createBuffers(*this);
		}

		this->renderer = renderer;
	}

	void Group::addEmitter(Emitter* emitter)
	{
		if (emitter == NULL)
			return;

		// Checks if the emitter is already in the group (since 1.03.03)
		std::vector<Emitter*>::const_iterator it = std::find(emitters.begin(),emitters.end(),emitter);
		if (it != emitters.end())
			return;

		incrementChildReference(emitter);
		emitters.push_back(emitter);
	}

	void Group::removeEmitter(Emitter* emitter)
	{
		std::vector<Emitter*>::iterator it = std::find(emitters.begin(),emitters.end(),emitter);
		if (it != emitters.end())
		{
			decrementChildReference(emitter);
			emitters.erase(it);
		}
	}

	void Group::addModifier(Modifier* modifier)
	{
		if (modifier == NULL)
			return;

		incrementChildReference(modifier);

		if (bufferManagement)
			modifier->createBuffers(*this);

		modifiers.push_back(modifier);
	}

	void Group::removeModifier(Modifier* modifier)
	{
		std::vector<Modifier*>::iterator it = std::find(modifiers.begin(),modifiers.end(),modifier);
		if (it != modifiers.end())
		{
			decrementChildReference(modifier);

			if (bufferManagement)
				(*it)->createBuffers(*this);

			modifiers.erase(it);
		}
	}

	bool Group::update(float deltaTime)
	{
		unsigned int nbManualBorn = nbBufferedParticles;
		unsigned int nbAutoBorn = 0;

		bool hasActiveEmitters = false;

		// Updates emitters
		activeEmitters.clear();
		std::vector<Emitter*>::const_iterator endIt = emitters.end();
		for (std::vector<Emitter*>::const_iterator it = emitters.begin(); it != endIt; ++it)
		{
			if ((*it)->isActive())
			{
				int nb = (*it)->updateNumber(deltaTime);
				if (nb > 0)
				{
					EmitterData data = {*it,static_cast<unsigned int>(nb)};
					activeEmitters.push_back(data);
					nbAutoBorn += nb;
				}
			}

			hasActiveEmitters |= !((*it)->isSleeping());
		}
		std::vector<EmitterData>::iterator emitterIt = activeEmitters.begin();

		unsigned int nbBorn = nbAutoBorn + nbManualBorn;

		// Inits bounding box
		if (boundingBoxEnabled)
		{
			const float maxFloat = std::numeric_limits<float>::max();
			AABBMin.set(maxFloat,maxFloat,maxFloat);
			AABBMax.set(-maxFloat,-maxFloat,-maxFloat);
		}

		// Prepare modifiers for processing
		activeModifiers.clear();
		for (std::vector<Modifier*>::iterator it = modifiers.begin(); it != modifiers.end(); ++it)
		{
			(*it)->beginProcess(*this);
			if ((*it)->isActive())
				activeModifiers.push_back(*it);
		}

		// Updates particles
		for (size_t i = 0; i < pool.getNbActive(); ++i)
		{
			if ((pool[i].update(deltaTime))||((fupdate != NULL)&&((*fupdate)(pool[i],deltaTime))))
			{
				if (fdeath != NULL)
					(*fdeath)(pool[i]);

				if (nbBorn > 0)
				{
					pool[i].init();
					launchParticle(pool[i],emitterIt,nbManualBorn);
					--nbBorn;
				}
				else
				{
					particleData[i].sqrDist = 0.0f;
					pool.makeInactive(i);
					--i;
				}
			}
			else
			{
				if (boundingBoxEnabled)
					updateAABB(pool[i]);

				if (distanceComputationEnabled)
					pool[i].computeSqrDist();
			}
		}

		// Terminates modifiers processing
		for (std::vector<Modifier*>::iterator it = modifiers.begin(); it != modifiers.end(); ++it)
			(*it)->endProcess(*this);

		// Emits new particles if some left
		for (int i = nbBorn; i > 0; --i)
			pushParticle(emitterIt,nbManualBorn);

		// Sorts particles if enabled
		if ((sortingEnabled)&&(pool.getNbActive() > 1))
			sortParticles(0,pool.getNbActive() - 1);

		if ((!boundingBoxEnabled)||(pool.getNbActive() == 0))
		{
			AABBMin.set(0.0f,0.0f,0.0f);
			AABBMax.set(0.0f,0.0f,0.0f);
		}

		return (hasActiveEmitters)||(pool.getNbActive() > 0);
	}

	void Group::pushParticle(std::vector<EmitterData>::iterator& emitterIt,unsigned int& nbManualBorn)
	{
		Particle* ptr = pool.makeActive();
		if (ptr == NULL)
		{
			if (pool.getNbEmpty() > 0)
			{
				Particle p(this,pool.getNbActive());
				launchParticle(p,emitterIt,nbManualBorn);
				pool.pushActive(p);
			}
			else if (nbManualBorn > 0)
				popNextManualAdding(nbManualBorn);
		}
		else
		{
			ptr->init();
			launchParticle(*ptr,emitterIt,nbManualBorn);
		}
	}

	void Group::launchParticle(Particle& p,std::vector<EmitterData>::iterator& emitterIt,unsigned int& nbManualBorn)
	{
		if (nbManualBorn == 0)
		{
			emitterIt->emitter->emit(p);
			if (--emitterIt->nbParticles == 0)
				++emitterIt;
		}
		else
		{
			CreationData creationData = creationBuffer.front();

			if (creationData.zone != NULL)
				creationData.zone->generatePosition(p,creationData.full);
			else
				p.position() = creationData.position;

			if (creationData.emitter != NULL)
				creationData.emitter->generateVelocity(p);
			else
				p.velocity() = creationData.velocity;

			popNextManualAdding(nbManualBorn);
		}

		// Resets old position (fix 1.04.00)
		p.oldPosition() = p.position();

		// first parameter interpolation
		// must be here so that the velocity has already been initialized
		p.interpolateParameters();

		if (fbirth != NULL)
			(*fbirth)(p);

		if (boundingBoxEnabled)
			updateAABB(p);

		if (distanceComputationEnabled)
			p.computeSqrDist();
	}

	void Group::render()
	{
		if ((renderer == NULL)||(!renderer->isActive()))
			return;

		renderer->render(*this);
	}

	void Group::empty()
	{
		for (size_t i = 0; i < pool.getNbActive(); ++i)
			particleData[i].sqrDist = 0.0f;

		pool.makeAllInactive();
		creationBuffer.clear();
		nbBufferedParticles = 0;
	}

	void Group::flushAddedParticles()
	{
		unsigned int nbManualBorn = nbBufferedParticles;
		std::vector<EmitterData>::iterator emitterIt; // dummy emitterIt because we dont care
		while(nbManualBorn > 0)
			pushParticle(emitterIt,nbManualBorn);
	}

	float Group::addParticles(const Vector3D& start,const Vector3D& end,Emitter* emitter,float step,float offset)
	{
		if ((step <= 0.0f)||(offset < 0.0f))
			return 0.0f;

		Vector3D displacement = end - start;
		float totalDist = displacement.getNorm();

		while(offset < totalDist)
		{
			Vector3D position = start;
			position += displacement * offset / totalDist;
			addParticles(1,position,Vector3D(),NULL,emitter);
			offset += step;
		}

		return offset - totalDist;
	}

	float Group::addParticles(const Vector3D& start,const Vector3D& end,const Vector3D& velocity,float step,float offset)
	{
		if ((step <= 0.0f)||(offset < 0.0f))
			return 0.0f;

		Vector3D displacement = end - start;
		float totalDist = displacement.getNorm();

		while(offset < totalDist)
		{
			Vector3D position = start;
			position += displacement * (offset / totalDist);
			addParticles(1,position,velocity,NULL,NULL);
			offset += step;
		}

		return offset - totalDist;
	}

	void Group::addParticles(unsigned int nb,const Vector3D& position,const Vector3D& velocity,const Zone* zone,Emitter* emitter,bool full)
	{
		if (nb == 0)
			return;

		CreationData data = {nb,position,velocity,zone,emitter,full};
		creationBuffer.push_back(data);
		nbBufferedParticles += nb;
	}

	void Group::addParticles(unsigned int nb,Emitter* emitter)
	{
		addParticles(nb,Vector3D(),Vector3D(),emitter->getZone(),emitter,emitter->isFullZone());
	}

	void Group::addParticles(const Zone* zone,Emitter* emitter,float deltaTime,bool full)
	{
		addParticles(emitter->updateNumber(deltaTime),Vector3D(),Vector3D(),zone,emitter,full);
	}

	void Group::addParticles(const Vector3D& position,Emitter* emitter,float deltaTime)
	{
		addParticles(emitter->updateNumber(deltaTime),position,Vector3D(),NULL,emitter);
	}

	void Group::addParticles(Emitter* emitter,float deltaTime)
	{
		addParticles(emitter->updateNumber(deltaTime),Vector3D(),Vector3D(),emitter->getZone(),emitter,emitter->isFullZone());
	}

	void Group::sortParticles()
	{
		computeDistances();

		if (sortingEnabled)
			sortParticles(0,pool.getNbActive() - 1);
	}

	void Group::computeDistances()
	{
		if (!distanceComputationEnabled)
			return;

		Pool<Particle>::const_iterator endIt = pool.end();
		for (Pool<Particle>::iterator it = pool.begin(); it != endIt; ++it)
			it->computeSqrDist();
	}

	void Group::computeAABB()
	{
		if ((!boundingBoxEnabled)||(pool.getNbActive() == 0))
		{
			AABBMin.set(0.0f,0.0f,0.0f);
			AABBMax.set(0.0f,0.0f,0.0f);
			return;
		}

		const float maxFloat = std::numeric_limits<float>::max();
		AABBMin.set(maxFloat,maxFloat,maxFloat);
		AABBMax.set(-maxFloat,-maxFloat,-maxFloat);

		Pool<Particle>::iterator endIt = pool.end();
		for (Pool<Particle>::iterator it = pool.begin(); it != endIt; ++it)
			updateAABB(*it);
	}

	void Group::reallocate(size_t capacity)
	{
		if (capacity > pool.getNbReserved())
		{
			pool.reallocate(capacity);

			Particle::ParticleData* newData = new Particle::ParticleData[pool.getNbReserved()];
			float* newCurrentParams = new float[pool.getNbReserved() * model->getSizeOfParticleCurrentArray()];
			float* newExtendedParams = new float[pool.getNbReserved() * model->getSizeOfParticleExtendedArray()];

			std::memcpy(newData,particleData,pool.getNbTotal() * sizeof(Particle::ParticleData));
			std::memcpy(newCurrentParams,particleCurrentParams,pool.getNbTotal() * sizeof(float) * model->getSizeOfParticleCurrentArray());
			std::memcpy(newExtendedParams,particleExtendedParams,pool.getNbTotal() * sizeof(float) * model->getSizeOfParticleExtendedArray());

			delete[] particleData;
			delete[] particleCurrentParams;
			delete[] particleExtendedParams;

			particleData = newData;
			particleCurrentParams = newCurrentParams;
			particleExtendedParams = newExtendedParams;

			for (Pool<Particle>::iterator it = pool.begin(); it != pool.endInactive(); ++it)
			{
				it->group = this;
				it->data = particleData + it->index;
				it->currentParams = particleCurrentParams + it->index * model->getSizeOfParticleCurrentArray();
				it->extendedParams = particleExtendedParams + it->index * model->getSizeOfParticleExtendedArray();
			}

			// Destroys all the buffers
			destroyAllBuffers();
		}
	}

	void Group::popNextManualAdding(unsigned int& nbManualBorn)
	{
		--creationBuffer.front().nb;
		--nbManualBorn;
		--nbBufferedParticles;
		if (creationBuffer.front().nb <= 0)
			creationBuffer.pop_front();
	}

	void Group::updateAABB(const Particle& particle)
	{
		const Vector3D& position = particle.position();
		if (AABBMin.x > position.x)
			AABBMin.x = position.x;
		if (AABBMin.y > position.y)
			AABBMin.y = position.y;
		if (AABBMin.z > position.z)
			AABBMin.z = position.z;
		if (AABBMax.x < position.x)
			AABBMax.x = position.x;
		if (AABBMax.y < position.y)
			AABBMax.y = position.y;
		if (AABBMax.z < position.z)
			AABBMax.z = position.z;
	}

	const void* Group::getParamAddress(ModelParam param) const
	{
		return particleCurrentParams + model->getParameterOffset(param);
	}

	size_t Group::getParamStride() const
	{
		return model->getSizeOfParticleCurrentArray() * sizeof(float);
	}

	Buffer* Group::createBuffer(const std::string& ID,const BufferCreator& creator,unsigned int flag,bool swapEnabled) const
	{
		destroyBuffer(ID);

		Buffer* buffer = creator.createBuffer(pool.getNbReserved(),*this);

		buffer->flag = flag;
		buffer->swapEnabled = swapEnabled;

		additionalBuffers.insert(std::pair<std::string,Buffer*>(ID,buffer));
		if (swapEnabled)
			swappableBuffers.insert(buffer);

		return buffer;
	}

	void Group::destroyBuffer(const std::string& ID) const
	{
		std::map<std::string,Buffer*>::iterator it = additionalBuffers.find(ID);

		if (it != additionalBuffers.end())
		{
			if (it->second->isSwapEnabled())
				swappableBuffers.erase(it->second);
			delete it->second;
			additionalBuffers.erase(it);

		}
	}

	void Group::destroyAllBuffers() const
	{
		for (std::map<std::string,Buffer*>::const_iterator it = additionalBuffers.begin(); it != additionalBuffers.end(); ++it)
			delete it->second;
		additionalBuffers.clear();
		swappableBuffers.clear();
	}

	Buffer* Group::getBuffer(const std::string& ID,unsigned int flag) const
	{
		Buffer* buffer = getBuffer(ID);

		if ((buffer != NULL)&&(buffer->flag == flag))
			return buffer;

		return NULL;
	}

	Buffer* Group::getBuffer(const std::string& ID) const
	{
		std::map<std::string,Buffer*>::const_iterator it = additionalBuffers.find(ID);

		if (it != additionalBuffers.end())
			return it->second;

		return NULL;
	}

	void Group::enableBuffersManagement(bool manage)
	{
		bufferManagement = manage;
	}

	bool Group::isBuffersManagementEnabled()
	{
		return bufferManagement;
	}

	void Group::sortParticles(int start,int end)
	{
		if (start < end)
		{
			int i = start - 1;
			int j = end + 1;
			float pivot = particleData[(start + end) >> 1].sqrDist;
			while (true)
			{
				do ++i;
				while (particleData[i].sqrDist > pivot);
				do --j;
				while (particleData[j].sqrDist < pivot);
				if (i < j)
					swapParticles(pool[i],pool[j]);
				else break;
			}

			sortParticles(start,j);
			sortParticles(j + 1,end);
		}
	}

	void Group::propagateUpdateTransform()
	{
		for (std::vector<Emitter*>::const_iterator emitterIt = emitters.begin(); emitterIt != emitters.end(); ++emitterIt)
			(*emitterIt)->updateTransform(this);
		for (std::vector<Modifier*>::const_iterator modifierIt = modifiers.begin(); modifierIt != modifiers.end(); ++modifierIt)
			if ((*modifierIt)->isLocalToSystem())
				(*modifierIt)->updateTransform(this);
	}

	Model& Group::getDefaultModel()
	{
		static Model defaultModel;
		return defaultModel;
	}
}
