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


#ifndef H_SPK_MODEL
#define H_SPK_MODEL

#include "Core/SPK_DEF.h"
#include "Core/SPK_Registerable.h"
#include "Core/SPK_Interpolator.h"


namespace SPK
{
	/**
	* @enum ModelParamFlag
	* @brief Constants used to set bits in Model flags
	*
	* These constant values are simply <i>1 << ModelParam</i> constants
	*/
	enum ModelParamFlag
	{
		FLAG_NONE = 0,										/**< the flag bit for no parameter */
		FLAG_RED = 1 << PARAM_RED,							/**< the flag bit for PARAM_RED */
		FLAG_GREEN = 1 << PARAM_GREEN,						/**< the flag bit for PARAM_GREEN */
		FLAG_BLUE = 1 << PARAM_BLUE,						/**< the flag bit for PARAM_BLUE */
		FLAG_ALPHA = 1 << PARAM_ALPHA,						/**< the flag bit for PARAM_ALPHA */
		FLAG_SIZE = 1 << PARAM_SIZE,						/**< the flag bit for PARAM_SIZE */
		FLAG_MASS = 1 << PARAM_MASS,						/**< the flag bit for PARAM_MASS */
		FLAG_ANGLE = 1 << PARAM_ANGLE,						/**< the flag bit for PARAM_ANGLE */
		FLAG_TEXTURE_INDEX = 1 << PARAM_TEXTURE_INDEX,		/**< the flag bit for PARAM_TEXTURE_INDEX */
		FLAG_ROTATION_SPEED = 1 << PARAM_ROTATION_SPEED,	/**< the flag bit for PARAM_ROTATION_SPEED */
		FLAG_CUSTOM_0 = 1 << PARAM_CUSTOM_0,				/**< the flag bit for PARAM_CUSTOM_0 */
		FLAG_CUSTOM_1 = 1 << PARAM_CUSTOM_1,				/**< the flag bit for PARAM_CUSTOM_1 */
		FLAG_CUSTOM_2 = 1 << PARAM_CUSTOM_2,				/**< the flag bit for PARAM_CUSTOM_2 */
	};

	/**
	* @class Model
	* @brief A model of particles for particles' generation and evolution
	*
	* This class defines a behavior for particles generation and evolution over time.<br>
	* A Particle is generated under a Model that cannot be changed during its life time.
	* A Particle Model can however be changed but it will reinitialize the Particle parameters and life.<br>
	* <br>
	* A Model defines which parameters to use/update for a Particle. To do that an Model holds 4 flags that are :
	* <ul>
	* <li>Enabled : The parameter is enabled and can be set. Otherwise its default value is used.</li>
	* <li>Mutable : The parameter will vary linearly over the life time of the Particle.</li>
	* <li>Random : The parameter will be randomly generated for the Particle.</li>
	* <li>Interpolated : The parameter will be interpolated by an object Interpolator to allow flexible variations.</li>
	* </ul>
	* The flags are processed when building up a model so that they are consistent :
	* <ul>
	* <li>All flags are masked so that they have not bit set at a higher position than the number of parameters.</li>
	* <li>The mutable,random and interpolated flags are masked with the enabled flag : a parameter must be enabled to be either random, mutable or interpolated.</li>
	* <li>An interpolated parameter cannot be mutable or/and random as well. The interpolated flag has the priority.</li>
	* </ul>
	* The life time of a particle and immortality is also defined by the Model.<br>
	* <br>
	* The default values for the parameters are the following :
	* <ul>
	* <li>PARAM_RED : 1.0</li>
	* <li>PARAM_GREEN : 1.0</li>
	* <li>PARAM_BLUE : 1.0</li>
	* <li>PARAM_ALPHA : 1.0</li>
	* <li>PARAM_SIZE : 1.0</li>
	* <li>PARAM_MASS : 1.0</li>
	* <li>PARAM_ANGLE : 0.0</li>
	* <li>PARAM_TEXTURE_INDEX : 0.0</li>
	* <li>PARAM_ROTATION_SPEED : 0.0</li>
	* <li>PARAM_CUSTOM_0 : 0.0</li>
	* <li>PARAM_CUSTOM_1 : 0.0</li>
	* <li>PARAM_CUSTOM_2 : 0.0</li>
	* </ul>
	*/
	class SPK_PREFIX Model : public Registerable
	{
	friend class Particle;

		SPK_IMPLEMENT_REGISTERABLE(Model)	
	
	public :

		//////////////////
		// Constructors //
		//////////////////

		/**
		* @brief The constructor for Model
		*
		* The user have to pass the Model flags that cannot be changed afterwards.<br>
		* To set up flags enumerators from ModelParamFlag can be used in a OR way.<br>
		* For instance, <i>Model(FLAG_RED | FLAG_GREEN | FLAG_BLUE | FLAG_ALPHA,FLAG_NONE,FLAG_NONE,FLAG_NONE)</i>
		* constructs a Model that will generate Particles with a defined color that will not change over time.<br>
		* <br>
		* Since 1.03.00, PARAM_RED, PARAM_GREEN and PARAM_BLUE are enabled by default. 
		* This is needed to pass the values to the GPU in an optimized way.<br>
		* Note that even the enable flag passed by the user does not containt those params, they will be enabled anyway.
		*
		* @param enableFlag : the enable flag
		* @param mutableFlag : the mutable flag
		* @param randomFlag : the random flag
		* @param interpolatedFlag : the interpolated flag
		*/
		Model(int enableFlag = FLAG_RED | FLAG_GREEN | FLAG_BLUE,int mutableFlag = FLAG_NONE,int randomFlag = FLAG_NONE,int interpolatedFlag = FLAG_NONE);

		/**
		* @brief The copy constructor for Model
		* @param model : The Model to construct the new Model from
		*/
		Model(const Model& model);

		/**
		* @brief Creates and registers a new Model
		* @param enableFlag : the enable flag
		* @param mutableFlag : the mutable flag
		* @param randomFlag : the random flag
		* @param interpolatedFlag : the interpolated flag
		* @return A new registered Model
		* @since 1.04.00
		*/
		static inline Model* create(int enableFlag = FLAG_RED | FLAG_GREEN | FLAG_BLUE,int mutableFlag = FLAG_NONE,int randomFlag = FLAG_NONE,int interpolatedFlag = FLAG_NONE);

		////////////////
		// Destructor //
		////////////////

		/** @brief The destructor for Model */
		~Model();

		/////////////
		// Setters //
		/////////////

		/**
		* @brief Sets the life time
		*
		* All particles generated under this Model will be given a life time randomly generated within [lifeTimeMin,lifeTimeMax[.<br>
		* To generate particles with a non random life time, simply use <i>setLifeTime(a,a)</i>.
		*
		* @param lifeTimeMin : the minimum life time
		* @param lifeTimeMax : the maximum life time
		*/
		inline void setLifeTime(float lifeTimeMin,float lifeTimeMax);

		/**
		* @brief Defines whether to generate immortal particles or not
		*
		* Immortal particles will still be given a life time. However the age of immortal particles will not increase so that they cannot die.
		* An immortal Particle whose Model immortality is unset will grow older again.<br>
		* The immortality is therefore dynamic and can be granted or removed by impacting all particles generated under this Model.
		*
		* @param immortal : whether the Model will generate immortal particles or not
		*/
		inline void setImmortal(bool immortal);

		/**
		* @brief Sets a given parameter with 4 values
		*
		* This method will only set parameters that are enabled, mutable and random.<br>
		* If not nothing will happen and the method will return false.
		*
		* @param type : the parameter to set
		* @param startMin : the minimum value at the Particle birth
		* @param startMax : the maximum value at the Particle birth
		* @param endMin : the minimum value at the Particle death
		* @param endMax : the maximum value at the Particle death
		* @return true if the parameter can be set (right flags), false otherwise
		*/
		bool setParam(ModelParam type,float startMin,float startMax,float endMin,float endMax);

		/**
		* @brief Sets a given parameter with 2 values
		*
		* This method will only set parameters that are enabled and <b>either</b> mutable or random.<br>
		* If not nothing will happen and the method will return false.<br>
		* <br>
		* In case of a mutable parameter : value0 defines the birth value and value0 defines the death value.<br>
		* In case of a random parameter : value0 defines the minimum value and value1 defines the maximum value.<br>
		*
		* @param type : the parameter to set
		* @param value0 : the first value (the meaning depends on the flag)
		* @param value1 : the second value (the meaning depends on the flag)
		* @return true if the parameter can be set (right flags), false otherwise
		*/
		bool setParam(ModelParam type,float value0,float value1);

		/**
		* @brief Sets a given parameter with 1 value
		*
		* This method will only set parameters that are enabled and <b>neither</b> mutable or random.<br>
		* If not nothing will happen and the method will return false.<br>
		* <br>
		* Note that to set the value of an interpolated parameter cannot be set with this function,
		* you must used the interpolator object associated to the parameter to control its value.
		*
		* @param type : the parameter to set
		* @param value : the value of the parameter
		* @return true if the parameter can be set (right flags), false otherwise
		*/
		bool setParam(ModelParam type,float value);

		/////////////
		// Getters //
		/////////////

		/**
		* @brief Gets the minimum life time
		* @return the minimum life time
		*/
		inline float getLifeTimeMin() const;

		/**
		* @brief Gets the maximum life time
		* @return the minimum life time
		*/
		inline float getLifeTimeMax() const;

		/**
		* @brief Returns whether immortility is set or not
		* @return whether immortility is set or not
		*/
		inline bool isImmortal() const;

		/**
		* @brief Checks whether a parameter is enabled or not
		* @param type : the parameter
		* @return 0 is the parameter is not enabled, a flag with the parameter bit set otherwise
		*/
		inline int isEnabled(ModelParam type) const;

		/**
		* @brief Checks whether a parameter is mutable or not
		* @param type : the parameter
		* @return 0 is the parameter is not mutable, a flag with the parameter bit set otherwise
		*/
		inline int isMutable(ModelParam type) const;

		/**
		* @brief Checks whether a parameter is random or not
		* @param type : the parameter
		* @return 0 is the parameter is not random, a flag with the parameter bit set otherwise
		*/
		inline int isRandom(ModelParam type) const;

		/**
		* @brief Checks whether a parameter is interpolated or not
		* @param type : the parameter
		* @return 0 is the parameter is not interpolated, a flag with the parameter bit set otherwise
		* @since 1.05.00
		*/
		inline int isInterpolated(ModelParam type) const;

		/**
		* @brief Gets a parameter value
		*
		* If index is superior or equal to the number of values for the parameter, the default value of the parameter is returned.<br>
		* Otherwise the value returned depending on the index is :
		* <ul>
		* <li>Enabled parameters :
		*   <ul>
		*   <li>0 : the value of the parameter</li>
		*   </ul>
		* </li>
		* <li>Mutable parameters :
		*   <ul>
		*   <li>0 : the birth value of the parameter</li>
		*   <li>1 : the death value of the parameter</li>
		*   </ul>
		* </li>
		* <li>Random parameters :
		*   <ul>
		*   <li>0 : the minimum value of the parameter</li>
		*   <li>1 : the maximum value of the parameter</li>
		*   </ul>
		* </li>
		* <li>Mutable and random parameters :
		*   <ul>
		*   <li>0 : the minimum birth value of the parameter</li>
		*   <li>1 : the maximum birth value of the parameter</li>
		*   <li>2 : the minimum death value of the parameter</li>
		*   <li>3 : the maximum death value of the parameter</li>
		*   </ul>
		* </li>
		* </ul>
		*
		* Note that in case of an interpolated parameter, the default value is always returned.<br>
		* The user has to use the interpolator object associated to the parameter to get its values.
		*
		* @param type : the parameter
		* @param index : the index of the value to get
		* @return the value
		*/
		float getParamValue(ModelParam type,size_t index) const;

		/**
		* @brief Gets the number of values for a parameter
		*
		* The number of values depends on the Model flags :
		* <ul>
		* <li>Enabled parameter : 1</li>
		* <li>Mutable <b>or</b> random parameter : 2</li>
		* <li>Mutable <b>and</b> random parameter : 4</li>
		* <li>Interpolated parameter : 0</li>
		* <li>Not Enabled : 0</li>
		* </ul>
		* @param type : the parameter
		* @return the number of values stored in the Model for the parameter
		*/
		unsigned int getNbValues(ModelParam type) const;

		/**
		* @brief Gets the number of enabled parameters
		* @return the number of enabled parameters in the model
		* @since 1.05.00
		*/
		inline size_t getNbEnabled() const;

		/**
		* @brief Gets the number of mutable parameters
		* @return the number of mutable parameters in the model
		* @since 1.05.00
		*/
		inline size_t getNbMutable() const;


		/**
		* @brief Gets the number of random parameters
		* @return the number of random parameters in the model
		* @since 1.05.00
		*/
		inline size_t getNRandom() const;

		/**
		* @brief Gets the interpolator for the given parameter
		* @param param : the parameter whose intepolator must be retrieved
		* @return a pointer to the interpolator of the given parameter or NULL if the parameter is not interpolated
		* @since 1.05.00
		*/
		inline Interpolator* getInterpolator(ModelParam param);

		/**
		* @brief Gets the number of interpolated parameters
		* @return the number of interpolated parameters in the model
		* @since 1.05.00
		*/
		inline size_t getNbInterpolated() const;

		/**
		* @brief Gets the number of float values in the particle current array
		*
		* The particle current array holds the current values of enabled parameters for a particle.<br>
		* This is used internally and should not be needed by the user.
		*
		* @return the number of float values in the particle current array
		* @since 1.02.00
		*/
		inline size_t getSizeOfParticleCurrentArray() const;

		/**
		* @brief Gets the number of float values in the particle extended array
		*
		* The particle extended array holds the extended values needed for parameters interpolation for a particle.<br>
		* This is used internally and should not be needed by the user.
		*
		* @return the number of float values in the particle extended array
		* @since 1.03.00
		*/
		inline size_t getSizeOfParticleExtendedArray() const;

		/**
		* @brief Gets the number of float values in the model array
		*
		* This is used internally and should not be needed by the user.
		*
		* @return the number of float values in the model array
		* @since 1.02.00
		*/
		inline size_t getSizeOfModelArray() const;

		/**
		* @brief Gets the offset of the given parameter in the current array
		*
		* This methods is used internally by the engine
		*
		* @param param : the parameter
		* @return the offset of the given parameter in the current array
		* @since 1.03.00
		*/
		inline size_t getParameterOffset(ModelParam param) const;

		/**
		* @brief Gets the default value of the parameter
		* @param param : the parameter to get the default value from
		* @return the default value of the parameter
		* @since 1.05.00
		*/
		static float getDefaultValue(ModelParam param);

	private :

		// total number of parameters
		static const size_t NB_PARAMS = 12;
		// default values for the parameters
		static const float DEFAULT_VALUES[NB_PARAMS];

		// arrays storing the values of parameters for the model following that form :
		// enable : 1 value -> value
		// mutable : 2 values -> start value | end value 
		// random : 2 values -> min value | max value
		// mutable and random : 4 values -> start min value | start max value | end min value | end max value
		// interpolated : 0 value
		float* params;
		size_t paramsSize;

		// array storing the parameters that are enabled
		size_t nbEnableParams;
		int* enableParams;

		// array storing the parameters that are mutable
		size_t nbMutableParams;
		int* mutableParams;

		// array storing the parameters that are interpolated
		size_t nbInterpolatedParams;
		int* interpolatedParams;

		// nb of random parameters
		size_t nbRandomParams;

		// array of interpolators
		Interpolator* interpolators[NB_PARAMS]; 

		// the flags of the model
		int enableFlag;
		int mutableFlag;
		int randomFlag;
		int interpolatedFlag;

		int particleEnableIndices[NB_PARAMS]; // array storing the index of a parameter in the enableParams array
		int particleMutableIndices[NB_PARAMS]; // array storing the index of a parameter in the mutableParams array
		int indices[NB_PARAMS]; // array storing the index of a parameter in the model param array

		float lifeTimeMin;
		float lifeTimeMax;
		bool immortal;

		void initParamArrays(const Model& model);
	};

	/**
	* @brief The default Model
	*
	* This Model is used when a Model is needed for initialization.<br>
	* It is a Model with all its parameter disabled.
	*
	* @since 1.01.00
	*/
	extern SPK_PREFIX Model defaultModel;


	inline Model* Model::create(int enableFlag,int mutableFlag,int randomFlag,int interpolatedFlag)
	{
		Model* obj = new Model(enableFlag,mutableFlag,randomFlag,interpolatedFlag);
		registerObject(obj);
		return obj;
	}
	
	inline void Model::setLifeTime(float lifeTimeMin,float lifeTimeMax)
	{
		this->lifeTimeMin = lifeTimeMin;
		this->lifeTimeMax = lifeTimeMax;
	}

	inline void Model::setImmortal(bool immortal)
	{
		this->immortal = immortal;
	}

	inline float Model::getLifeTimeMin() const
	{
		return lifeTimeMin;
	}

	inline float Model::getLifeTimeMax() const
	{
		return lifeTimeMax;
	}

	inline bool Model::isImmortal() const
	{
		return immortal;
	}

	inline int Model::isEnabled(ModelParam type) const
	{
		return enableFlag & (1 << type);
	}

	inline int Model::isMutable(ModelParam type) const
	{
		return mutableFlag & (1 << type);
	}

	inline int Model::isRandom(ModelParam type) const
	{
		return randomFlag & (1 << type);
	}

	inline int Model::isInterpolated(ModelParam type) const
	{
		return interpolatedFlag & (1 << type);
	}

	inline size_t Model::getNbEnabled() const
	{
		return nbEnableParams;
	}

	inline size_t Model::getNbMutable() const
	{
		return nbMutableParams;
	}

	inline size_t Model::getNRandom() const
	{
		return nbRandomParams;
	}

	inline Interpolator* Model::getInterpolator(ModelParam param)
	{
		return interpolators[param];
	}

	inline size_t Model::getNbInterpolated() const
	{
		return nbInterpolatedParams;
	}

	inline size_t Model::getSizeOfParticleCurrentArray() const
	{
		return nbEnableParams;
	}

	inline size_t Model::getSizeOfParticleExtendedArray() const
	{
		return nbMutableParams + (nbInterpolatedParams << 1) + nbInterpolatedParams; // nbMutable + nbInterpolated * 3
	}

	inline size_t Model::getSizeOfModelArray() const
	{
		return paramsSize;
	}

	inline size_t Model::getParameterOffset(ModelParam param) const
	{
		return particleEnableIndices[param];
	}
}

#endif
