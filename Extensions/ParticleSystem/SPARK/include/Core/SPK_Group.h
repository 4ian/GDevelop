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


#ifndef H_SPK_GROUP
#define H_SPK_GROUP

#include "Core/SPK_DEF.h"
#include "Core/SPK_Registerable.h"
#include "Core/SPK_Transformable.h"
#include "Core/SPK_Vector3D.h"
#include "Core/SPK_Pool.h"
#include "Core/SPK_Particle.h"


namespace SPK
{
	class Renderer;
	class Emitter;
	class Modifier;
	class Zone;
	class Model;
	class Buffer;
	class BufferCreator;

	/**
	* @class Group
	* @brief A group of many particles
	*
	* A Group is the structure the user will interact with the most to build up a full Particle System.<br>
	* More than only storing many particles, a Group also defines and entire environment for Particle generation and Evolution.<br>
	* <br>
	* This class is the spine of the SPARK engine.
	*/
	class SPK_PREFIX Group : public Registerable, public Transformable
	{
		friend class Renderer;
		friend class Particle;
		friend void swapParticles(Particle& a,Particle& b);

		SPK_IMPLEMENT_REGISTERABLE(Group)

	public :

		//////////////////
		// Constructors //
		//////////////////

		/**
		* @brief Constructor for a Group
		*
		* A Group is constructed with a Model (if NULL, the default Model will be used to generate particles).
		* This Model will be used to handle Particle's generation and evolution within the Group.<br>
		* <br>
		* A Group also needs a maximum capacity which is the maximum number of particles the Group can handle. This is necessary to reserve some memory space.
		* Note that the capacity can be changed by calling reallocate(unsigned int).
		* By default, the capacity is set to Pool::DEFAULT_CAPACITY.
		*
		* @param model : the Model of this Group
		* @param capacity : The maximum number of particles of this Group
		*/
		Group(Model* model = NULL,size_t capacity = Pool<Particle>::DEFAULT_CAPACITY);

		/**
		* @brief Copy Constructor of Group
		* @param group : the Group to construct the new Group from
		*/
		Group(const Group& group);

		/**
		* @brief Creates and registers a new Group
		* @param model : the Model of this Group
		* @param capacity : The maximum number of particles of this Group
		* @return A new registered Group
		* @since 1.04.00
		*/
		static Group* create(Model* model = NULL,size_t capacity = Pool<Particle>::DEFAULT_CAPACITY);

		////////////////
		// Destructor //
		////////////////

		/** @brief The destructor of Group */
		~Group();

		/////////////
		// Setters //
		/////////////

		/**
		* @brief change the Model of this Group
		*
		* If the model parameter is set to NULL, the default model will be used. No changes are done if the model parameter is equal
		* to the Model of this Group. Changing the Model of this Group will empty it.
		*
		* @param model : the Model of this Group
		*/
		void setModel(Model* model);

		/**
		* @brief Sets the Renderer of this Group
		*
		* If the Renderer is set to NULL, the particles of the Group will not be renderered with a call to render().<br>
		* <br>
		* Note that if the bufferManagement is on (see enableBuffersManagement(bool)), setting the Renderer will first
		* destroys the buffers needed for the previous Renderer held by this Group and create buffers needed for the new Renderer.
		*
		* @param renderer : the Renderer of this Group
		*/
		void setRenderer(Renderer* renderer);

		/**
		* @brief Sets the friction of this Group
		*
		* The friction defines the way particles are accelerated or decelerated in their environment.<br>
		* <ul>
		* <li>If the friction is 0.0f, particles in the Group are neither accelerated nor decelerated (it is the default setting).</li>
		* <li>If the friction is positive, particles will be decelerated function of their speed.</li>
		* <li>If the friction is negative, particles will be accelerated function of their speed.</li>
		* </ul>
		* The friction is applied on each Particle as followed :<br>
		* <i>velocity *= 1 - min(1,friction * deltaTime / weight)</i><br>
		* <br>
		* Note that the lighter the Particle, the more effect has the friction on it.
		*
		* @param friction the friction of the Group
		*/
		void setFriction(float friction);

		/**
		* @brief Sets the gravity of this Group
		*
		* The gravity is a vector which defines an attractive force that will be applied to each Particle in the Group during the update.<br>
		* By default the gravity is the null vector (i.e. a Vector3D equal to (0,0,0)) which means no gravity is applied.<br>
		* <br>
		* The gravity is applied on each Particle as followed :<br>
		* <i>velocity += gravity * deltaTime</i><br>
		*
		* @param gravity : the Vector3D that will be used as the gravity for this Group
		*/
		void setGravity(const Vector3D& gravity);

		/**
		* @brief Assigns a callback for the custom update
		*
		* The user has the possibility to assign a callback function for update that will be called for each Particle right after the standard update.<br>
		* The signature of the function must be of the form :<br>
		* <i>bool customUpdate(Particle&,unsigned int)</i><br>
		* with :
		* <ul>
		* <li>Particle& being the Particle which is currently updated</li>
		* <li>float being the time step</li>
		* <li> the return bool being true if the Particle has to die at the end of the update, false otherwise</li>
		* </ul>
		*
		* @param fupdate : A pointer to the callback function that will perform custom update for this Group
		*/
		void setCustomUpdate(bool (*fupdate)(Particle&,float));

		/**
		* @brief Assigns a callback for custom birth
		*
		* This method allows to assign a callback function that will be called each time a Particle borns.<br>
		* The signature of the function must be of the form :<br>
		* <i>void customUpdate(Particle&)</i><br>
		* with Particle& being the Particle which is just born.
		*
		* @param fbirth : A pointer to the callback function that will perform custom birth for this Group
		*/
		void setCustomBirth(void (*fbirth)(Particle&));

		/**
		* @brief Assigns a callback for custom death
		*
		* This method allows to assign a callback function that will be called each time a Particle dies.<br>
		* The signature of the function must be of the form :<br>
		* <i>void customUpdate(Particle&)</i><br>
		* with Particle& being the Particle which has just died.
		*
		* @param fdeath : A pointer to the callback function that will perform custom death for this Group
		*/
		void setCustomDeath(void (*fdeath)(Particle&));

		/**
		* @brief Enables or disables the sorting of particles
		*
		* The sorting is performed from particles further to the camera to particles closer to the camera.<br>
		* Sorting particles allows to well draw particles with alpha.<br>
		* <br>
		* If the sorting is enabled/disabled, the distance computation is enabled/disabled as well.<br>
		* <br>
		* Note that sorting a Group is a computationnaly expensive operation that should be avoided when possible.
		*
		* @param sort : true to enable the sorting of particles, false otherwise
		*/
		void enableSorting(bool sort);

		/**
		* @brief Enables or disables the computation of the distance of a Particle from the camera
		*
		* The distance computation happens at each call to update(unsigned int).<br>
		* The distance of a Particle from the camera can be gotten with a call to Particle::getDistanceFromCamera() or Particle::getSqrDistanceFromCamera()<br>
		* <br>
		* Note that the distance is defined by the difference vector between the Particle and the the camera set with System::setCameraPosition(Vector3D&).<br>
		* <br>
		* If the distance computation is disabled, then the sorting of particles is disabled as well.
		*
		* @param distanceComputation : true to enable the computation of the camera distance, false not to
		* @since 1.01.00
		*/
		void enableDistanceComputation(bool distanceComputation);

		/**
		* @brief Enables or disables the computation of the axis aligned bouding box of the Group
		*
		* if the computing of the AABB is enabled, after each call to update(unsigned int), 2 Vector3D are updated with the coordinates information of the AABB.
		* Those Vector3D can be gotten with getAABBMin() and getAABBMax() which give respectively the minimum and maximum coordinates of the bounding box in each axis.<br>
		* <br>
		* Knowing the AABB of a Group of particles can be useful in some case like frustum culling for instance.<br>
		* <br>
		* Note that the bounding box does not use the size information of the particles which means when computing the bounding box, particles are considered to be points in the space.
		*
		* @param AABB : true to enable the computing of the AABB of the Group, false to disable it
		*/
		void enableAABBComputing(bool AABB);

		/**
		* @brief Enables or not Renderer buffers management in a statix way
		*
		* If the buffer management is enabled, then a call to setRenderer(Renderer*) will destroy the existing buffers of the previous Renderer
		* held by this Group, and create the needed buffer for the new Renderer.<br>
		* <br>
		* By default, the renderer buffers management is enabled.
		*
		* @param manage : true to enable buffers management, false to disable it
		* @since 1.03.00
		*/
		static void enableBuffersManagement(bool manage);

		/////////////
		// Getters //
		/////////////

		/**
		* @brief Gets the Pool of particles of the Group
		*
		* Note that the Pool returned is constant as the user is not allowed to modify the internal structure of particles.
		*
		* @return the Pool of the Group
		*/
		const Pool<Particle>& getParticles() const;

		/**
		* @brief Gets a single Particle in the Group by its index
		*
		* Note that a given Particle in a Group is not ensured to keep the same index all over its life.
		* Particle index can be changed when inactivating particles.
		*
		* @param index : the position in the Group's Pool of the Particle to get
		* @return : the Particle at index
		*/
		Particle& getParticle(size_t index);

		/**
		* @brief Gets a single Particle in the Group by its index
		*
		* This is the constant version of getParticle(size_t).
		*
		* @param index : the index of the Particle to get
		* @return the Particle at index
		* @since 1.02.00
		*/
		const Particle& getParticle(size_t index) const;

		/**
		* @brief Gets the number of particles in the Group
		* @return the number of particles in the Group
		*/
		size_t getNbParticles() const;

		/**
		* @brief Gets the emitters of the Group
		* @return the vector of emitters of the Group
		*/
		const std::vector<Emitter*>& getEmitters() const;

		/**
		* @brief Gets an Emitter of the Group by its index
		* @param index : the position in the vector of emitters of the Emitter to get
		* @return : the Emitter at index
		*/
		Emitter* getEmitter(size_t index) const;

		/**
		* @brief Gets the number of emitters in this Group
		* @return the number of emitters in this Group
		*/
		size_t getNbEmitters() const;

		/**
		* @brief Gets the modifiers of the Group
		* @return the vector of modifiers of the Group
		*/
		const std::vector<Modifier*>& getModifiers() const;

		/**
		* @brief Gets an Modifier of the Group by its index
		* @param index : the position in the vector of modifiers of the Modifier to get
		* @return : the Modifier at index
		*/
		Modifier* getModifier(size_t index) const;

		/**
		* @brief Gets the number of modifiers in this Group
		* @return the number of modifiers in this Group
		*/
		size_t getNbModifiers() const;

		/**
		* @brief Gets the Model of this Group
		* @return the Model of this Group
		*/
		Model* getModel() const;

		/**
		* @brief Gets the Renderer of this Group
		* @return the Renderer of this Group
		*/
		Renderer* getRenderer() const;

		/**
		* @brief Gets the friction coefficient of this Group
		*
		* For a description of the friction see setFriction(float).
		*
		* @return the friction coefficient of this Group
		*/
		float getFriction() const;

		/**
		* @brief Gets the gravity Vector3D of this Group
		*
		* For a description of the gravity see setGravity(Vector3D&).
		*
		* @return the gravity Vector3D of this Group
		*/
		const Vector3D& getGravity() const;

		/**
		* @brief Tells whether the sorting of particles from back to front is enabled
		*
		* For a description of the sorting of particles, see enableSorting(bool).
		*
		* @return true if the sorting is enabled, false otherwise
		*/
		bool isSortingEnabled() const;

		/**
		* @brief Tells whether the distance computation between particles and camera is enabled
		* @return true is the distance computation is enabled, false if not
		* @since 1.01.00
		*/
		bool isDistanceComputationEnabled() const;

		/**
		* @brief Tells whether the computation of the axis aligned bouding box is enabled
		*
		* For a description of the computation of the AABB, see enableAABBComputing(bool).
		*
		* @return true if the computation of the AABB is enabled, false if it is disabled
		*/
		bool isAABBComputingEnabled() const;

		/**
		* @brief Gets a Vector3D holding the minimum coordinates of the AABB of the Group.
		*
		* Note that this method is only useful when the AABB computation is enabled (see enableAABBComputing(bool)).
		*
		* @return a Vector3D holding the minimum coordinates of the AABB of the Group
		*/
		const Vector3D& getAABBMin() const;

		/**
		* @brief Gets a Vector3D holding the maximum coordinates of the AABB of the Group.
		*
		* Note that this method is only useful when the AABB computation is enabled (see enableAABBComputing(bool)).
		*
		* @return a Vector3D holding the maximum coordinates of the AABB of the Group
		*/
		const Vector3D& getAABBMax() const;

		/**
		* @brief Gets the start address of the given param
		*
		* This method is used by a Renderer to define the start position of an array to pass to the GPU.<br>
		* You will not generally need it unless you re designing your own Renderer.<br>
		* <br>
		* Note that if the parameter is not enabled, the return value will point to an enabled parameter starting address.
		*
		* @param param : the parameter whose start address is gotten
		* @since 1.03.00
		*/
		const void* getParamAddress(ModelParam param) const;

		/**
		* @brief Gets the start address of the position
		*
		* This method is used by a Renderer to define the start position of an array to pass to the GPU.<br>
		* You will not generally need it unless you re designing your own Renderer.
		*
		* @since 1.03.00
		*/
		const void* getPositionAddress() const;

		/**
		* @brief Gets the stride for parameters
		*
		* This method is used by a Renderer to know the stride of an array to pass to the GPU.<br>
		* You will not generally need it unless you re designing your own Renderer.
		*
		* @since 1.03.00
		*/
		size_t getParamStride() const;

		/**
		* @brief Gets the stride for positions
		*
		* This method is used by a Renderer to know the stride of an array to pass to the GPU.<br>
		* You will not generally need it unless you re designing your own Renderer.
		*
		* @since 1.03.00
		*/
		size_t getPositionStride() const;

		/**
		* @brief Tells whether renderers buffer management is enabled or not
		*
		* see enableBuffersManagement(bool) for more information.
		*
		* @return true if renderers buffer management is enabled, false if it is disable
		* @since 1.03.00
		*/
		static bool isBuffersManagementEnabled();

		///////////////
		// Interface //
		///////////////

		/**
		* @brief Adds some Particles to this Group
		*
		* This method and all the methods of type addParticles will add a given number of Particles at the given position with the given velocity.<br>
		* Note that even if a Zone and an Emitter is passed, the position and the velocity will be the same for all Particles.<br>
		* <br>
		* In case a Zone is passed, Zone::generatePosition(Particle,bool) is used to generate the position.<br>
		* In case an Emitter is passed, Emitter::generateVelocity(Particle) with a mass of 1 is used to generate the velocity.
		* The velocity will then be updated with the Particle's mass when the Particle will be generated.<br>
		* In case a delta time is passed instead of a fixed number, the number will be computed thanks to the flow of the Emitter passed.<br>
		* <br>
		* Particles will be added to the Group at the next call to update(unsigned int) or flushAddedParticles().<br>
		* This is why any Emitter and Zone used to generate particles must be valid at the next call of either update(unsigned int) or flushAddedParticles().<br>
		* <br>
		* On some methods addParticles, the full variable is present. This variable defines where to generate positions in a Zone :
		* <ul>
		* <li>true to generate position somewhere within the whole Zone.</li>
		* <li>false to generate position somewhere on the Zone border.</li>
		* </ul>
		*
		* @param nb : the number of Particles to add
		* @param position : the position where the Particles will be added
		* @param velocity : the velocity of the Particles
		*/
		void addParticles(unsigned int nb,const Vector3D& position,const Vector3D& velocity);

		/**
		* @brief Adds some Particles to this Group
		*
		* See addParticles(unsigned int,const Vector3D&,const Vector3D&) for a complete description.
		*
		* @param nb : the number of Particles to add
		* @param zone : the Zone that will be used to generate the position
		* @param emitter : the Emitter that will be used to generate the velocity
		* @param full : true to generate a position within the whole Zonz, false only at its borders
		*/
		void addParticles(unsigned int nb,const Zone* zone,Emitter* emitter,bool full = true);

		/**
		* @brief Adds some Particles to this Group
		*
		* See addParticles(unsigned int,const Vector3D&,const Vector3D&) for a complete description.
		*
		* @param nb : the number of Particles to add
		* @param zone : the Zone that will be used to generate the position
		* @param velocity : the velocity of the Particles
		* @param full : true to generate a position within the whole Zonz, false only at its borders
		*/
		void addParticles(unsigned int nb,const Zone* zone,const Vector3D& velocity,bool full = true);

		/**
		* @brief Adds some Particles to this Group
		*
		* See addParticles(unsigned int,const Vector3D&,const Vector3D&) for a complete description.
		*
		* @param nb : the number of Particles to add
		* @param position : the position where the Particles will be added
		* @param emitter : the Emitter that will be used to generate the velocity
		*/
		void addParticles(unsigned int nb,const Vector3D& position,Emitter* emitter);

		/**
		* @brief Adds some Particles to this Group
		*
		* See addParticles(unsigned int,const Vector3D&,const Vector3D&) for a complete description.
		*
		* @param nb : the number of Particles to add
		* @param emitter : the Emitter that will be used to generate the velocity and whose Zone will be used to generate the position
		*/
		void addParticles(unsigned int nb,Emitter* emitter);

		/**
		* @brief Adds some Particles to this Group
		*
		* See addParticles(unsigned int,const Vector3D&,const Vector3D&) for a complete description.
		*
		* @param zone : the Zone that will be used to generate the position
		* @param emitter : the Emitter that will be used to generate the velocity
		* @param deltaTime : the step time that will be used to determine how many particles to generate
		* @param full : true to generate a position within the whole Zonz, false only at its borders
		*/
		void addParticles(const Zone* zone,Emitter* emitter,float deltaTime,bool full = true);

		/**
		* @brief Adds some Particles to this Group
		*
		* See addParticles(unsigned int,const Vector3D&,const Vector3D&) for a complete description.
		*
		* @param position : the position where the Particles will be added
		* @param emitter : the Emitter that will be used to generate the velocity
		* @param deltaTime : the step time that will be used to determine how many particles to generate
		*/
		void addParticles(const Vector3D& position,Emitter* emitter,float deltaTime);

		/**
		* @brief Adds some Particles to this Group
		*
		* See addParticles(unsigned int,const Vector3D&,const Vector3D&) for a complete description.
		*
		* @param emitter : the Emitter that will be used to generate the velocity and whose Zone will be used to generate the position
		* @param deltaTime : the step time that will be used to determine how many particles to generate
		*/
		void addParticles(Emitter* emitter,float deltaTime);

		/**
		* @brief Adds some Particles to this Group
		*
		* This method is slightly different to other addParticles methods as Particles are generated not at a point but on a line defined by start and end.<br>
		* The step is the distance between each Particle on the line and the offset is the starting distance to compute the first Particle's position.<br>
		* The offset is useful to generate equidistant particles on several lines. the returned offset has to be used as the passed offset for the next line.<br>
		* <br>
		* This method is useful to generate equidistant particles on lines no matter the framerate.<br>
		* <br>
		* See addParticles(unsigned int,const Vector3D&,const Vector3D&) for some complementary information.
		*
		* @param start : the position of the start of the line
		* @param end : the position of the end of the line
		* @param emitter : the Emitter that will be used to generate the velocity
		* @param step : the distance between each generated Particle
		* @param offset : the starting distance of the beginning of the line
		* @return the new offset at the end of the line
		*/
		float addParticles(const Vector3D& start,const Vector3D& end,Emitter* emitter,float step,float offset = 0.0f);

		/**
		* @brief Adds some Particles to this Group
		*
		* See addParticles(const Vector3D&,const Vector3D&,const Emitter*,float,float) for a complete description.
		*
		* @param start : the position of the start of the line
		* @param end : the position of the end of the line
		* @param velocity : the velocity of the Particles
		* @param step : the distance between each generated Particle
		* @param offset : the starting distance of the beginning of the line
		* @return the new offset at the end of the line
		*/
		float addParticles(const Vector3D& start,const Vector3D& end,const Vector3D& velocity,float step,float offset = 0.0f);

		/**
		* @brief Removes a Particle from this Group
		*
		* Note that the Particle object is not destroyed but only inactivated in the Pool.
		*
		* @param index : the position of the Particle in this Group
		*/
		void removeParticle(size_t index);

		/**
		* @brief Adds an Emitter in this Group
		*
		* Note that if the emitter is already in the group, it will not be inserted again.
		*
		* @param emitter : the Emitter to add
		*/
		void addEmitter(Emitter* emitter);

		/**
		* @brief Removes an Emitter from this Group
		* @param emitter : the Emitter to remove
		*/
		void removeEmitter(Emitter* emitter);

		/**
		* @brief Adds an Modifier in this Group
		* @param modifier : the Modifier to add
		*/
		void addModifier(Modifier* modifier);

		/**
		* @brief Removes an Modifier from this Group
		* @param modifier : the Modifier to remove
		*/
		void removeModifier(Modifier* modifier);

		/**
		* @brief Updates this Group by a step time
		*
		* The update process performs those operations :
		* <ul>
		* <li>Updates the mutable parameters of each Particle.</li>
		* <li>Updates the velocity of each Particle function of the friction and the gravity of the Group.</li>
		* <li>Applies each Modifier of the Group to each Particle.</li>
		* <li>Removes all dead particles</li>
		* <li>Adds particles generated by the emitters of the Group.</li>
		* <li>Adds particles added manually by the user (with calls to addParticles).</li>
		* </ul>
		* Those operations are optimized to limit the swaps and shifts of particles in the Pool to its minimum.<br>
		* This method tells whether the Group still has some Particles, or if some Particles will still be generated by the Emitters at the next updates by returning a boolean.
		*
		* @param deltaTime : the time step used to update the Group
		* @return true if the Group has still some current or future Particles to update, false otherwise
		*/
		bool update(float deltaTime);

		/**
		* @brief Renders this Group
		*
		* Note that if no Renderer is attached to the Group, nothing will happen.
		*/
		void render();

		/**
		* @brief Empties this Group
		*
		* Not that this method does not release resource of this Group.
		* Particles are only inactivated, not destroyed.
		*/
		void empty();

		/**
		* @brief Adds all manually added particles to the Group
		*
		* This method adds all particles added with the addParticles methods immediatly to the Group without waiting the next call to update(unsigned int).
		* The Particles are added in FIFO order until there is no more or the capacity limit of the Group is reached.
		*/
		void flushAddedParticles();

		/**
		* @brief Sorts the particles within this Group
		*
		* The particles are sorted only if the sorting of this Group is enabled. See enableSorting(bool).<br>
		* Note that update(unsigned int) also sorts the particles.<br>
		* This method is therefore only useful when the camera position changes several times between 2 updates.<br>
		* <br>
		* This method also makes a call to computeDistances().
		*
		* @since 1.01.00
		*/
		void sortParticles();

		/**
		* @brief Computes the distance between each Particle within this Group and the camera
		*
		* The distances are computed only if the computation of distances of this Group is enabled. See enableDistanceComputation(bool).<br>
		* Note that update(unsigned int) also computes the distances between particles and camera.<br>
		* This method is therefore only useful when the camera position changes several times between 2 updates.
		*
		* @since 1.01.00
		*/
		void computeDistances();

		/**
		* @brief Computes the bounding box of this Group
		*
		* The bounding box is computed only if the computation of the bounding box of this Group is enabled. See enableAABBComputing(bool).<br>
		* Note that update(unsigned int) also computes the bounding box.<br>
		* This method is therefore only useful when the bounding boxe has to be recomputed between 2 updates.
		*
		* @since 1.01.00
		*/
		void computeAABB();

		/**
		* @brief Increases the maximum number of particles this Group can hold
		*
		* Note that decreasing the capacity will have no effect.<br>
		* A reallocation of the group capacity will destroy all its current buffers.
		*
		* @param capacity The maximum number of particles of this Group
		* @since 1.02.00
		*/
		void reallocate(size_t capacity);

		/**
		* @brief Creates a new additional buffer attached to the Group.
		*
		* Additional buffers are used to attach data to a particles. They are mainly used by renderers to store data to transfer to the GPU
		* but can be used by the user in any other way.<br>
		* <br>
		* A buffer is defined by a ID which is a std::string.<br>
		* A buffer also has a flag, which can give information about the way it is configured.<br>
		* <br>
		* Note that ID starting with <i>SPK_</i> are reserved by the engine.
		* Note also that creating a buffer with an already existing ID will destroy the previous buffer.
		* <br>
		* A buffer needs a BufferCreator to allow the group to create it.
		*
		* @param ID : the ID of the additinal buffer
		* @param creator : the buffer creator object
		* @param flag : the flag of the buffer
		* @param swapData : true to swap data when particle are swapped, false not to (faster but dont keep right order)
		* @since 1.03.00
		*/
		Buffer* createBuffer(const std::string& ID,const BufferCreator& creator,unsigned int flag = 0,bool swapData = true) const;

		/**
		* @brief Destroys the buffer with the given ID
		*
		* If no buffer with this ID exists, nothing happens.<br>
		* Note that destroying a buffer must never freeze the engine. Checks must be performed.
		*
		* @param ID : the ID of the buffer to destroyed
		* @since 1.03.00
		*/
		void destroyBuffer(const std::string& ID) const;

		/**
		* @brief Destroys all the buffers held by this Group
		* @since 1.03.00
		*/
		void destroyAllBuffers() const;

		/**
		* @brief Gets the buffer with the given ID and checks its flag
		*
		* The flag is used as a check. the passed flag must be the same as the stored flag.<br>
		* If not or if no buffer with the given ID exists, NULL is returned.<br>
		* <br>
		* The method returns a pointer on the buffer.
		*
		* @param ID : the ID of the buffer to get
		* @param flag : the flag used for the flag check
		* @return a pointer to the buffer, or NULL if not found or with an incorrect flag
		* @since 1.03.00
		*/
		Buffer* getBuffer(const std::string& ID,unsigned int flag) const;

		/**
		* @brief Gets the buffer with the given ID
		*
		* NULL is returned if the buffer does not exist
		*
		* @param ID : the ID of the buffer
		* @return a pointer to the buffer, or NULL if not found
		* @since 1.03.02
		*/
		Buffer* getBuffer(const std::string& ID) const;

		virtual Registerable* findByName(const std::string& name);

	protected :

		virtual void registerChildren(bool registerAll);
		virtual void copyChildren(const Registerable& object,bool createBase);
		virtual void destroyChildren(bool keepChildren);

		virtual void propagateUpdateTransform();

	private :

		struct CreationData
		{
			unsigned int nb;
			Vector3D position;
			Vector3D velocity;
			const Zone* zone;
			Emitter* emitter;
			bool full;
		};

		struct EmitterData
		{
			Emitter* emitter;
			unsigned int nbParticles;
		};

		// statics
		static bool bufferManagement;
		static Model& getDefaultModel();

		// registerables
		Model* model;
		Renderer* renderer;
		std::vector<Emitter*> emitters;
		std::vector<Modifier*> modifiers;

		mutable std::vector<EmitterData> activeEmitters;
		mutable std::vector<Modifier*> activeModifiers; // Vector of active modifiers to optimise the parsing when updating

		// physics parameters
		float friction;
		Vector3D gravity;

		// particles data
		Pool<Particle> pool;
		Particle::ParticleData* particleData;
		float* particleCurrentParams; // Stores the current parameters values of the particles
		float* particleExtendedParams; // Stores the extended parameters values of the particles (final values and interpolated data)

		// sorting
		bool sortingEnabled;
		bool distanceComputationEnabled;

		// creation data
		std::deque<CreationData> creationBuffer;
		unsigned int nbBufferedParticles;

		// callbacks
		bool (*fupdate)(Particle&,float);
		void (*fbirth)(Particle&);
		void (*fdeath)(Particle&);

		// bounding box
		bool boundingBoxEnabled;
		Vector3D AABBMin;
		Vector3D AABBMax;

		// additional buffers
		mutable std::map<std::string,Buffer*> additionalBuffers;
		mutable std::set<Buffer*> swappableBuffers;

		void pushParticle(std::vector<EmitterData>::iterator& emitterIt,unsigned int& nbManualBorn);
		void launchParticle(Particle& p,std::vector<EmitterData>::iterator& emitterIt,unsigned int& nbManualBorn);

		void addParticles(unsigned int nb,const Vector3D& position,const Vector3D& velocity,const Zone* zone,Emitter* emitter,bool full = false);

		void popNextManualAdding(unsigned int& nbManualBorn);

		void updateAABB(const Particle& particle);

		void sortParticles(int start,int end);
	};


	inline Group* Group::create(Model* model,size_t capacity)
	{
		Group* obj = new Group(model,capacity);
		registerObject(obj);
		return obj;
	}

	inline void Group::setFriction(float friction)
	{
		this->friction = friction;
	}

	inline void Group::setGravity(const Vector3D& gravity)
	{
		this->gravity = gravity;
	}

	inline void Group::setCustomUpdate(bool (*fupdate)(Particle&,float))
	{
		this->fupdate = fupdate;
	}

	inline void Group::setCustomBirth(void (*fbirth)(Particle&))
	{
		this->fbirth = fbirth;
	}

	inline void Group::setCustomDeath(void (*fdeath)(Particle&))
	{
		this->fdeath = fdeath;
	}

	inline void Group::enableSorting(bool sort)
	{
		sortingEnabled = sort;
		distanceComputationEnabled = sort;
	}

	inline void Group::enableDistanceComputation(bool distanceComputation)
	{
		distanceComputationEnabled = distanceComputation;
		if (!distanceComputation) enableSorting(false);
	}

	inline void Group::enableAABBComputing(bool AABB)
	{
		boundingBoxEnabled = AABB;
	}

	inline const Pool<Particle>& Group::getParticles() const
	{
		return pool;
	}

	inline Particle& Group::getParticle(size_t index)
	{
		return pool[index];
	}

	inline const Particle& Group::getParticle(size_t index) const
	{
		return pool[index];
	}

	inline size_t Group::getNbParticles() const
	{
		return pool.getNbActive();
	}

	inline const std::vector<Emitter*>& Group::getEmitters() const
	{
		return emitters;
	}

	inline Emitter* Group::getEmitter(size_t index) const
	{
		return emitters[index];
	}

	inline size_t Group::getNbEmitters() const
	{
		return emitters.size();
	}

	inline const std::vector<Modifier*>& Group::getModifiers() const
	{
		return modifiers;
	}

	inline Modifier* Group::getModifier(size_t index) const
	{
		return modifiers[index];
	}

	inline size_t Group::getNbModifiers() const
	{
		return modifiers.size();
	}

	inline Model* Group::getModel() const
	{
		return model;
	}

	inline Renderer* Group::getRenderer() const
	{
		return renderer;
	}

	inline float Group::getFriction() const
	{
		return friction;
	}

	inline const Vector3D& Group::getGravity() const
	{
		return gravity;
	}

	inline bool Group::isSortingEnabled() const
	{
		return sortingEnabled;
	}

	inline bool Group::isDistanceComputationEnabled() const
	{
		return distanceComputationEnabled;
	}

	inline bool Group::isAABBComputingEnabled() const
	{
		return boundingBoxEnabled;
	}

	inline const Vector3D& Group::getAABBMin() const
	{
		return AABBMin;
	}

	inline const Vector3D& Group::getAABBMax() const
	{
		return AABBMax;
	}

	inline void Group::addParticles(unsigned int nb,const Vector3D& position,const Vector3D& velocity)
	{
		addParticles(nb,position,velocity,NULL,NULL);
	}

	inline void Group::addParticles(unsigned int nb,const Zone* zone,Emitter* emitter,bool full)
	{
		addParticles(nb,Vector3D(),Vector3D(),zone,emitter,full);
	}

	inline void Group::addParticles(unsigned int nb,const Zone* zone,const Vector3D& velocity,bool full)
	{
		addParticles(nb,Vector3D(),velocity,zone,NULL,full);
	}

	inline void Group::addParticles(unsigned int nb,const Vector3D& position,Emitter* emitter)
	{
		addParticles(nb,position,Vector3D(),NULL,emitter);
	}

	inline void Group::removeParticle(size_t index)
	{
		pool.makeInactive(index);
	}

	inline const void* Group::getPositionAddress() const
	{
		return &(particleData[0].position);
	}

	inline size_t Group::getPositionStride() const
	{
		return sizeof(Particle::ParticleData);
	}
}

#endif
