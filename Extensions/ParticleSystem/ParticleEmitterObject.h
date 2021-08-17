/**

GDevelop - Particle System Extension
Copyright (c) 2010-2016 Florian Rival (Florian.Rival@gmail.com)
This project is released under the MIT License.
*/

#ifndef PARTICLEEMITTEROBJECT_H
#define PARTICLEEMITTEROBJECT_H

#include "GDCore/Project/Object.h"
namespace gd {
class InitialInstance;
class Project;
}

/**
 * \brief Base class containing the parameters of an emitter as well as the
 * wrapper to this emitter if asked for.
 */
class GD_EXTENSION_API ParticleEmitterBase {
 public:
  ParticleEmitterBase();
  virtual ~ParticleEmitterBase();
  ParticleEmitterBase(const ParticleEmitterBase& other) {
    Init(other);
  };
  ParticleEmitterBase& operator=(const ParticleEmitterBase& other) {
    if (&other != this) Init(other);
    return *this;
  }

  void SetParticleTexture(const gd::String & imageName) {
    textureParticleName = imageName;
  };
  const gd::String & GetParticleTexture() const { return textureParticleName; };

  void SetRendererParam1(float newValue) { rendererParam1 = newValue; };
  void SetRendererParam2(float newValue) { rendererParam2 = newValue; };
  void SetTank(float newValue);
  void SetFlow(float newValue);
  void SetEmitterForceMin(float newValue);
  void SetEmitterForceMax(float newValue);
  void SetEmitterXDirection(float newValue);
  void SetEmitterYDirection(float newValue);
  void SetEmitterZDirection(float newValue);
  void SetEmitterAngleA(float newValue);
  void SetEmitterAngleB(float newValue);
  void SetConeSprayAngle(float newValue) { SetEmitterAngleB(newValue); };
  void SetZoneRadius(float newValue);
  void SetParticleGravityX(float newValue);
  void SetParticleGravityY(float newValue);
  void SetParticleGravityZ(float newValue);
  void SetParticleGravityAngle(float newAngleInDegree);
  void SetParticleGravityLength(float newLength);
  void SetFriction(float newValue);

  enum ParticleParameterType { Nothing, Enabled, Mutable, Random };
  void SetRedParameterType(ParticleParameterType type) { redParam = type; };
  void SetGreenParameterType(ParticleParameterType type) { greenParam = type; };
  void SetBlueParameterType(ParticleParameterType type) { blueParam = type; };
  void SetAlphaParameterType(ParticleParameterType type) { alphaParam = type; };
  void SetSizeParameterType(ParticleParameterType type) { sizeParam = type; };
  void SetAngleParameterType(ParticleParameterType type) { angleParam = type; };

  void SetParticleColor1(const gd::String& color);
  void SetParticleColor2(const gd::String& color);

  void SetParticleRed1(float newValue) {
    particleRed1 = newValue;
  };
  void SetParticleRed2(float newValue) {
    particleRed2 = newValue;
  };
  void SetParticleGreen1(float newValue) {
    particleGreen1 = newValue;
  };
  void SetParticleGreen2(float newValue) {
    particleGreen2 = newValue;
  };
  void SetParticleBlue1(float newValue) {
    particleBlue1 = newValue;
  };
  void SetParticleBlue2(float newValue) {
    particleBlue2 = newValue;
  };
  void SetParticleAlpha1(float newValue) {
    particleAlpha1 = newValue;
  };
  void SetParticleAlpha2(float newValue) {
    particleAlpha2 = newValue;
  };
  void SetParticleSize1(float newValue) {
    particleSize1 = newValue;
  };
  void SetParticleSize2(float newValue) {
    particleSize2 = newValue;
  };
  void SetParticleAngle1(float newValue) {
    particleAngle1 = newValue;
  };
  void SetParticleAngle2(float newValue) {
    particleAngle2 = newValue;
  };
  void SetParticleAlphaRandomness1(float newValue) {
    particleAlphaRandomness1 = newValue;
  };
  void SetParticleAlphaRandomness2(float newValue) {
    particleAlphaRandomness2 = newValue;
  };
  void SetParticleSizeRandomness1(float newValue) {
    particleSizeRandomness1 = newValue;
  };
  void SetParticleSizeRandomness2(float newValue) {
    particleSizeRandomness2 = newValue;
  };
  void SetParticleAngleRandomness1(float newValue) {
    particleAngleRandomness1 = newValue;
  };
  void SetParticleAngleRandomness2(float newValue) {
    particleAngleRandomness2 = newValue;
  };
  void SetParticleLifeTimeMin(float newValue) {
    particleLifeTimeMin = newValue;
  };
  void SetParticleLifeTimeMax(float newValue) {
    particleLifeTimeMax = newValue;
  };
  void SetMaxParticleNb(std::size_t newValue) { maxParticleNb = newValue; };
  void SetDestroyWhenNoParticles(bool enable = true) {
    destroyWhenNoParticles = enable;
  };

  float GetRendererParam1() const { return rendererParam1; };
  float GetRendererParam2() const { return rendererParam2; };
  float GetTank() const { return tank; };
  float GetFlow() const { return flow; };
  float GetEmitterForceMin() const { return emitterForceMin; };
  float GetEmitterForceMax() const { return emitterForceMax; };
  float GetEmitterXDirection() const { return emitterXDirection; };
  float GetEmitterYDirection() const { return emitterYDirection; };
  float GetEmitterZDirection() const { return emitterZDirection; };
  float GetEmitterAngleA() const { return emitterAngleA; };
  float GetEmitterAngleB() const { return emitterAngleB; };
  float GetConeSprayAngle() const { return GetEmitterAngleB(); };
  float GetZoneRadius() const { return zoneRadius; };
  float GetParticleGravityX() const { return particleGravityX; };
  float GetParticleGravityY() const { return particleGravityY; };
  float GetParticleGravityZ() const { return particleGravityZ; };
  float GetParticleGravityAngle() const;
  float GetParticleGravityLength() const;
  float GetFriction() const { return friction; };
  float GetParticleLifeTimeMin() const { return particleLifeTimeMin; };
  float GetParticleLifeTimeMax() const { return particleLifeTimeMax; };
  std::size_t GetMaxParticleNb() const { return maxParticleNb; };
  bool GetDestroyWhenNoParticles() const { return destroyWhenNoParticles; };

  ParticleParameterType GetRedParameterType() const { return redParam; };
  ParticleParameterType GetGreenParameterType() const { return greenParam; };
  ParticleParameterType GetBlueParameterType() const { return blueParam; };
  ParticleParameterType GetAlphaParameterType() const { return alphaParam; };
  ParticleParameterType GetSizeParameterType() const { return sizeParam; };
  ParticleParameterType GetAngleParameterType() const { return angleParam; };

  float GetParticleRed1() const { return particleRed1; };
  float GetParticleRed2() const { return particleRed2; };
  float GetParticleGreen1() const { return particleGreen1; };
  float GetParticleGreen2() const { return particleGreen2; };
  float GetParticleBlue1() const { return particleBlue1; };
  float GetParticleBlue2() const { return particleBlue2; };
  float GetParticleAlpha1() const { return particleAlpha1; };
  float GetParticleAlpha2() const { return particleAlpha2; };
  float GetParticleSize1() const { return particleSize1; };
  float GetParticleSize2() const { return particleSize2; };
  float GetParticleAngle1() const { return particleAngle1; };
  float GetParticleAngle2() const { return particleAngle2; };
  float GetParticleAlphaRandomness1() const {
    return particleAlphaRandomness1;
  };
  float GetParticleAlphaRandomness2() const {
    return particleAlphaRandomness2;
  };
  float GetParticleSizeRandomness1() const { return particleSizeRandomness1; };
  float GetParticleSizeRandomness2() const { return particleSizeRandomness2; };
  float GetParticleAngleRandomness1() const {
    return particleAngleRandomness1;
  };
  float GetParticleAngleRandomness2() const {
    return particleAngleRandomness2;
  };

  enum RendererType { Point, Line, Quad };
  void SetRendererType(RendererType type) { rendererType = type; };
  RendererType GetRendererType() const { return rendererType; };

  bool IsRenderingAdditive() { return additive; };
  void SetRenderingAdditive() { additive = true; };
  void SetRenderingAlpha() { additive = false; };

 protected:
  virtual void UnserializeParticleEmitterBaseFrom(
      const gd::SerializerElement& element);
#if defined(GD_IDE_ONLY)
  virtual void SerializeParticleEmitterBaseTo(
      gd::SerializerElement& element) const;
#endif

 private:
  void Init(const ParticleEmitterBase& other);

  gd::String textureParticleName;
  RendererType rendererType;
  float rendererParam1;
  float rendererParam2;
  bool additive;
  float tank;
  float flow;
  float emitterForceMin;
  float emitterForceMax;
  float emitterXDirection;
  float emitterYDirection;
  float emitterZDirection;
  float emitterAngleA;
  float emitterAngleB;
  float zoneRadius;
  float particleGravityX, particleGravityY, particleGravityZ;
  float friction;
  float particleLifeTimeMin, particleLifeTimeMax;
  ParticleParameterType redParam, greenParam, blueParam, alphaParam, sizeParam,
      angleParam;
  float particleRed1, particleRed2, particleGreen1, particleGreen2,
      particleBlue1, particleBlue2, particleAlpha1, particleAlpha2;
  float particleSize1, particleSize2, particleAngle1, particleAngle2;
  float particleAlphaRandomness1, particleAlphaRandomness2;
  float particleSizeRandomness1, particleSizeRandomness2,
      particleAngleRandomness1, particleAngleRandomness2;
  std::size_t maxParticleNb;
  bool destroyWhenNoParticles;  ///< If set to true, the object will removed
                                ///< itself from the scene when it has no more
                                ///< particles.
};

/**
 * \brief Particle Emitter object used for storage and for the IDE.
 */
class GD_EXTENSION_API ParticleEmitterObject : public gd::Object,
                                               public ParticleEmitterBase {
 public:
  ParticleEmitterObject(gd::String name_);
  virtual ~ParticleEmitterObject(){};
  virtual std::unique_ptr<gd::Object> Clone() const {
    return gd::make_unique<ParticleEmitterObject>(*this);
  }

#if defined(GD_IDE_ONLY)
  virtual void ExposeResources(gd::ArbitraryResourceWorker& worker);
  bool particleEditionSimpleMode;  ///< User preference related to object's
                                   ///< edition
  bool emissionEditionSimpleMode;  ///< User preference related to object's
                                   ///< edition
  bool gravityEditionSimpleMode;   ///< User preference related to object's
                                   ///< edition
#endif

 private:
  virtual void DoUnserializeFrom(gd::Project& project,
                                 const gd::SerializerElement& element);
#if defined(GD_IDE_ONLY)
  virtual void DoSerializeTo(gd::SerializerElement& element) const;
#endif
};

#endif  // PARTICLEEMITTEROBJECT_H
