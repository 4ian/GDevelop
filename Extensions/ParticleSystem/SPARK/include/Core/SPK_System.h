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


#ifndef H_SPK_SYSTEM
#define H_SPK_SYSTEM

#include "Core/SPK_DEF.h"
#include "Core/SPK_Registerable.h"
#include "Core/SPK_Transformable.h"
#include "Core/SPK_Vector3D.h"


namespace SPK
{
	class Group;
	class Vector3D;


	/**
	* @enum StepMode
	* @brief Enumeration defining how to handle the step time of particle systems
	* @since 1.05.00
	*/
	enum StepMode
	{
		STEP_REAL,			/**< The step time is the deltatime passed by the user */
		STEP_CONSTANT,		/**< The step time is a constant time therefore 0 to many updates may occur in a call */
		STEP_ADAPTIVE,		/**< The step time is a range between 2 values therefore 0 to many updates may occur in a call */
	};

	/**
	* @class System
	* @brief A whole system of particles
	*
	* This class defines a whole system of particles. It contains particle groups.<br>
	* It offers a way to handle a system very easily.<br>
	* Basically a particle system is updated by calling update(unsigned int) and renderered with render() at each frame.<br>
	* <br>
	* Note that a System is only a helper class to manage many Groups. However it can be omitted and groups can be updated and rendered alone.<br>
	* <br>
	* A System is transformable. If the system is transformed, all its sub emitters will be transformed as well. However, its modifiers will not
	* (modifiers can be described in the world coordinates already). If you wish to transform some of its modifiers as well, you will have to do it aside.
	*/
	class SPK_PREFIX System : public Registerable, public Transformable
	{
		SPK_IMPLEMENT_REGISTERABLE(System)

	public :

		/////////////////
		// Constructor //
		/////////////////

		/** @brief Constructor of System */
		System();

		/**
		* @brief Creates and registers a new System
		* @return A new registered System
		* @since 1.04.00
		*/
		static System* create();

		////////////////
		// Destructor //
		////////////////

		virtual ~System() {}

		/////////////
		// Setters //
		/////////////

		/**
		* @brief Sets the camera position
		*
		* Note that the camera position is only useful if a group has to be sorted.<br>
		* In that case this vector will be used as the camera position to derive the distance between the particle and the camera position.<br>
		* The camera position has to be updated before an update of the sorted group.
		*
		* @param cameraPosition the camera position
		*/
		static void setCameraPosition(const Vector3D& cameraPosition);

		/**
		* @brief Enables or not the clamping on the deltaTime when updating systems
		*
		* This allows to limit too big deltaTime which may spoil your particle systems.<br>
		* Basically if the deltaTime is higher than the clamp value, the clamp calue is used as the deltaTime.<br>
		* <br>
		* It allows in real step mode to avoid having too big deltaTimes and in the other 2 modes to avoid having too
		* many updates that may slow down the application.<br>
		* <br>
		* Note that setting the clamp value too low may slow down your systems
		*
		* @param useClampStep : true to use a clamp value on the step, false not to
		* @param clamp : the clamp value
		* @since 1.05.00
		*/
		static void setClampStep(bool useClampStep,float clamp = 1.0f);

		/**
		* @brief Uses a constant step to update the systems
		*
		* This tells the system to be updated with a constant time.<br>
		* Depending on the deltaTime passed for the update, 0 to many updates can occur.<br>
		* For example if the delta time is 1.0 and the constant step is 0.1 then 10 updates of time 0.1 will occur.<br>
		* <br>
		* This mode is useful when the update must be constant (accurate collisions...) but be aware it can be very computationnaly intensive.
		* 
		* @param constantStep : the value of the step
		* @since 1.05.00
		*/
		static void useConstantStep(float constantStep);

		/**
		* @brief Uses an adaptive step to update the systems
		*
		* This tells the system to be updated with a time between min and max.<br>
		* If the deltaTime passed is higher than maxStep or lower than minStep then this mode operates like the constant step mode with
		* either constant time being maxStep or minStep (respectivally).<br>
		* If the deltaTime lies between minStep and maxStep then this mode performs like the real step mode.<br>
		* <br>
		* This mode is a good alternative between the other two.<br>
		* Combined with the clamp step, it allows to correctly handle the step time without being to much frame rate dependant.
		*
		* @param minStep : the minimal time step
		* @param maxStep : the maximal time step
		* @since 1.05.00
		*/
		static void useAdaptiveStep(float minStep,float maxStep);

		/**
		* @brief Uses the real step to update the systems
		*
		* This is the basic mode (and the mode per default) to update the systems.<br>
		* One call to update means one update of time deltaTime.<br>
		* <br>
		* This mode is the simpler and the one that allows best performance on low end systems.<br>
		* However the update may be inaccurate (due to too big deltaTime) and it performs badly with frame rate variation.
		*
		* @since 1.05.00
		*/
		static void useRealStep();

		/**
		* @brief Enables or disables the computation of the axis aligned Vector for this System
		*
		* Enabling the computation of the AABB for the System only takes the AABB of all AABB of the Groups within the System where AABB computation is enabled.<br>
		* see Group::enableAABBComputing(bool) for more details.
		*
		* @param AABB : true to enable the computing of the AABB of this System, false to disable it
		*/
		void enableAABBComputing(bool AABB);

		/////////////
		// Getters //
		/////////////

		/**
		* @brief Gets the camera position
		*
		* Note that the camera position vector is only read by SPARK. Only the user modifies it.
		*
		* @return the camera position
		*/
		static const Vector3D& getCameraPosition();

		/**
		* @brief Gets the current step mode
		* @return the current step mode
		*/
		static StepMode getStepMode();

		/**
		* @brief Gets the number of active particles in this system
		*
		* The number of active particles in the system is the addition of the number of active particles in each group of the system.<br>
		* Note that the number of active particle of the system is updated after each update of the system.<br>
		* This means if the user changes manually the number of particles in a group and call this method before an update, the number returned will not be up to date.<br>
		* To compute and get the real number of active particles in the System, see computeNbParticles().
		*
		* @return the number of active particle in the system
		*/
		size_t getNbParticles() const;

		/**
		* @brief Computes the number of active particles in this System and returns it
		*
		* Unlike getNbParticles() which returns the last number of particles computed (after a call to update(float) or empty()),
		* this method recomputes the current number of active particles by parsing all the groups of this System.<br>
		* In that way, this method must not be used as an accessor but call once when necesseray between 2 updates.<br>
		* <br>
		* Note that this method updates the inner number of particles of this System, which means a call to getNbParticles() will
		* then return the computed number.
		*
		* @return the number of active particle in the system
		* @since 1.02.01
		*/
		size_t computeNbParticles();

		/**
		* @brief Gets the number of groups in the System
		* @return the number of groups in the System
		*/
		size_t getNbGroups() const;

		/**
		* @brief Gets the vector of the groups (pointers) in this System
		*
		* This method allows to modify Group parameters within the System.<br>
		* Note that for addition and removal, methods <i>addGroup(Group*)</i> and <i>removeGroup(Group*)</i> must exist.<br>
		*
		* @return a STL vector containing the groups in the System
		*/
		const std::vector<Group*>& getGroups() const;

		/**
		* @brief Gets the Group at index
		*
		* Note that no bound check is performed.
		*
		* @param index : the index of the Group to get
		* @return the Group at index
		* @since 1.03.00
		*/
		Group* getGroup(size_t index);

		/**
		* @brief Tells whether the computation of the axis aligned bouding box is enabled
		*
		* For a description of the computation of the AABB, see enableAABBComputing(bool).
		*
		* @return true if the computation of the AABB is enabled, false if it is disabled
		*/
		bool isAABBComputingEnabled() const;

		/**
		* @brief Gets a Vector3D holding the minimum coordinates of the AABB of this System.
		*
		* Note that this method is only useful when the AABB computation is enabled (see enableAABBComputing(bool)).
		*
		* @return a Vector3D holding the minimum coordinates of the AABB of this System
		* @since 1.01.00
		*/
		const Vector3D& getAABBMin() const;

		/**
		* @brief Gets a Vector3D holding the maximum coordinates of the AABB of this System.
		*
		* Note that this method is only useful when the AABB computation is enabled (see enableAABBComputing(bool)).
		*
		* @return a Vector3D holding the maximum coordinates of the AABB of this System
		* @since 1.01.00
		*/
		const Vector3D& getAABBMax() const;

		///////////////
		// Interface //
		///////////////

		/**
		* @brief Adds a Group to the System
		* @param group : a pointer on the Group to add to the System
		*/
		void addGroup(Group* group);

		/**
		* @brief Removes a Group from the System
		*
		* If the Group cannot be found, nothing happens.
		*
		* @param group : a pointer on the Group to remove from the System
		*/
		void removeGroup(Group* group);

		/**
		* @brief Updates the System of the current time step
		*
		* Note that this method updates all groups in the System from first to last.
		*
		* @param deltaTime : the time step
		* @return true if the System is still active (has active groups)
		*/
		virtual bool update(float deltaTime);

		/**
		* @brief Renders particles in the System
		*
		* Note that this method renders all groups in the System from first to last.
		*/
		virtual void render() const;

		/**
		* @brief Makes this System grow to the given time
		*
		* This method is useful to get a newwly created System to a mature state.<br>
		* This method only calls update(float) with the step until the total update time reaches the time.
		*
		* @param time : the total time of which to update this System
		* @param step : the time the System is updated at each call to update(float)
		*
		* @since 1.01.00
		*/
		void grow(float time,float step);

		/**
		* @brief Empties the System
		*
		* This method will make all particles in the System inactive.<br>
		* However all connections are kept which means groups are still in theSystem.
		*/
		void empty();

		/**
		* @brief Sorts the particles in all the group of this System where the sorting is enabled
		*
		* Note that the sorting is also performed during the update.<br>
		* This method is therefore only useful when the camera position changes several times between 2 updates.<br>
		* <br>
		* This methods calls the Group::sortParticles() of each Group in this System.
		*
		* @since 1.01.00
		*/
		void sortParticles();

		/**
		* @brief Computes the distances between each Particle in each Group of this System
		*
		* Note that the distances computation is also performed during the update.<br>
		* This method is therefore only useful when the camera position changes several times between 2 updates.<br>
		* <br>
		* This methods calls the Group::computeDistances() of each Group in this System.
		*
		* @since 1.01.00
		*/
		void computeDistances();

		/**
		* @brief Computes the bounding box of this System and of all groups in the System
		*
		* The bounding box of the System is only computed if the System has its bounding box computing enabled.<br>
		* In the same way, the bounding box of a Group within the System is only computed if the Group has its bounding box computing enabled.<br>
		* <br>
		* Note that the computation of bounding boxes is also performed during the update.<br>
		* This method is therefore only useful when the bounding boxes have to be recomputed between 2 updates.<br>
		* <br>
		* This methods calls the Group::computeAABB() of each Group in this System.
		*
		* @since 1.01.00
		*/
		void computeAABB();

		virtual Registerable* findByName(const std::string& name);

	protected :

		std::vector<Group*> groups;

		virtual void registerChildren(bool registerAll);
		virtual void copyChildren(const Registerable& object,bool keepChildren);
		virtual void destroyChildren(bool createBase);

		virtual void propagateUpdateTransform();

	private :

		static Vector3D cameraPosition;

		static StepMode stepMode;
		static float constantStep;
		static float minStep;
		static float maxStep;

		static bool clampStepEnabled;
		static float clampStep;

		float deltaStep;

		size_t nbParticles;

		bool boundingBoxEnabled;
		Vector3D AABBMin;
		Vector3D AABBMax;

		bool innerUpdate(float deltaTime);
	};


	inline System* System::create()
	{
		System* obj = new System;
		registerObject(obj);
		return obj;
	}
	
	inline void System::enableAABBComputing(bool AABB)
	{
		boundingBoxEnabled = AABB;
	}

	inline size_t System::getNbParticles() const
	{
		return nbParticles;
	}

	inline size_t System::getNbGroups() const
	{
		return groups.size();
	}

	inline const std::vector<Group*>& System::getGroups() const
	{
		return groups;
	}

	inline Group* System::getGroup(size_t index)
	{
		return groups[index];
	}

	inline bool System::isAABBComputingEnabled() const
	{
		return boundingBoxEnabled;
	}

	inline const Vector3D& System::getAABBMin() const
	{
		return AABBMin;
	}

	inline const Vector3D& System::getAABBMax() const
	{
		return AABBMax;
	}
}

#endif
