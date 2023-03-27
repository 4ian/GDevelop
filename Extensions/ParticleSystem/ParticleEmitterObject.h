/**

GDevelop - Particle System Extension
Copyright (c) 2010-2016 Florian Rival (Florian.Rival@gmail.com)
This project is released under the MIT License.
*/

#ifndef PARTICLEEMITTEROBJECT_H
#define PARTICLEEMITTEROBJECT_H

#include "GDCore/Project/ObjectConfiguration.h"
namespace gd {
class InitialInstance;
class Project;
}  // namespace gd

/**
 * \brief Base class containing the parameters of an emitter as well as the
 * wrapper to this emitter if asked for.
 */
class GD_EXTENSION_API ParticleEmitterBase {
 public:
  ParticleEmitterBase();
  virtual ~ParticleEmitterBase();
  ParticleEmitterBase(const ParticleEmitterBase& other) { Init(other); };
  ParticleEmitterBase& operator=(const ParticleEmitterBase& other) {
    if (&other != this) Init(other);
    return *this;
  }

  void SetParticleTexture(const gd::String& imageName) {
    textureParticleName = imageName;
  };
  const gd::String& GetParticleTexture() const { return textureParticleName; };

  void SetRendererParam1(double newValue) { rendererParam1 = newValue; };
  void SetRendererParam2(double newValue) { rendererParam2 = newValue; };
  void SetTank(double newValue);
  void SetFlow(double newValue);
  void SetEmitterForceMin(double newValue);
  void SetEmitterForceMax(double newValue);
  void SetEmitterAngleA(double newValue);
  void SetEmitterAngleB(double newValue);
  void SetConeSprayAngle(double newValue) { SetEmitterAngleB(newValue); };
  void SetZoneRadius(double newValue);
  void SetParticleGravityX(double newValue);
  void SetParticleGravityY(double newValue);
  void SetParticleGravityAngle(double newAngleInDegree);
  void SetParticleGravityLength(double newLength);

  void SetParticleColor1(const gd::String& color);
  void SetParticleColor2(const gd::String& color);

  void SetParticleRed1(double newValue) { particleRed1 = newValue; };
  void SetParticleRed2(double newValue) { particleRed2 = newValue; };
  void SetParticleGreen1(double newValue) { particleGreen1 = newValue; };
  void SetParticleGreen2(double newValue) { particleGreen2 = newValue; };
  void SetParticleBlue1(double newValue) { particleBlue1 = newValue; };
  void SetParticleBlue2(double newValue) { particleBlue2 = newValue; };
  void SetParticleAlpha1(double newValue) { particleAlpha1 = newValue; };
  void SetParticleAlpha2(double newValue) { particleAlpha2 = newValue; };
  void SetParticleSize1(double newValue) { particleSize1 = newValue; };
  void SetParticleSize2(double newValue) { particleSize2 = newValue; };
  void SetParticleAngle1(double newValue) { particleAngle1 = newValue; };
  void SetParticleAngle2(double newValue) { particleAngle2 = newValue; };
  void SetParticleAlphaRandomness1(double newValue) {
    particleAlphaRandomness1 = newValue;
  };
  void SetParticleAlphaRandomness2(double newValue) {
    particleAlphaRandomness2 = newValue;
  };
  void SetParticleSizeRandomness1(double newValue) {
    particleSizeRandomness1 = newValue;
  };
  void SetParticleSizeRandomness2(double newValue) {
    particleSizeRandomness2 = newValue;
  };
  void SetParticleAngleRandomness1(double newValue) {
    particleAngleRandomness1 = newValue;
  };
  void SetParticleAngleRandomness2(double newValue) {
    particleAngleRandomness2 = newValue;
  };
  void SetParticleLifeTimeMin(double newValue) {
    particleLifeTimeMin = newValue;
  };
  void SetParticleLifeTimeMax(double newValue) {
    particleLifeTimeMax = newValue;
  };
  void SetMaxParticleNb(std::size_t newValue) { maxParticleNb = newValue; };
  void SetDestroyWhenNoParticles(bool enable = true) {
    destroyWhenNoParticles = enable;
  };
  void SetJumpForwardInTimeOnCreation(double newValue) { 
    jumpForwardInTimeOnCreation = newValue;
  };

  double GetRendererParam1() const { return rendererParam1; };
  double GetRendererParam2() const { return rendererParam2; };
  double GetTank() const { return tank; };
  double GetFlow() const { return flow; };
  double GetEmitterForceMin() const { return emitterForceMin; };
  double GetEmitterForceMax() const { return emitterForceMax; };
  double GetEmitterAngleA() const { return emitterAngleA; };
  double GetEmitterAngleB() const { return emitterAngleB; };
  double GetConeSprayAngle() const { return GetEmitterAngleB(); };
  double GetZoneRadius() const { return zoneRadius; };
  double GetParticleGravityX() const { return particleGravityX; };
  double GetParticleGravityY() const { return particleGravityY; };
  double GetParticleGravityAngle() const;
  double GetParticleGravityLength() const;
  double GetParticleLifeTimeMin() const { return particleLifeTimeMin; };
  double GetParticleLifeTimeMax() const { return particleLifeTimeMax; };
  std::size_t GetMaxParticleNb() const { return maxParticleNb; };
  bool GetDestroyWhenNoParticles() const { return destroyWhenNoParticles; };

  double GetParticleRed1() const { return particleRed1; };
  double GetParticleRed2() const { return particleRed2; };
  double GetParticleGreen1() const { return particleGreen1; };
  double GetParticleGreen2() const { return particleGreen2; };
  double GetParticleBlue1() const { return particleBlue1; };
  double GetParticleBlue2() const { return particleBlue2; };
  double GetParticleAlpha1() const { return particleAlpha1; };
  double GetParticleAlpha2() const { return particleAlpha2; };
  double GetParticleSize1() const { return particleSize1; };
  double GetParticleSize2() const { return particleSize2; };
  double GetParticleAngle1() const { return particleAngle1; };
  double GetParticleAngle2() const { return particleAngle2; };
  double GetParticleAlphaRandomness1() const {
    return particleAlphaRandomness1;
  };
  double GetParticleAlphaRandomness2() const {
    return particleAlphaRandomness2;
  };
  double GetParticleSizeRandomness1() const { return particleSizeRandomness1; };
  double GetParticleSizeRandomness2() const { return particleSizeRandomness2; };
  double GetParticleAngleRandomness1() const {
    return particleAngleRandomness1;
  };
  double GetParticleAngleRandomness2() const {
    return particleAngleRandomness2;
  };
  double GetJumpForwardInTimeOnCreation() const { return jumpForwardInTimeOnCreation; };

  enum RendererType { Point, Line, Quad };
  void SetRendererType(RendererType type) { rendererType = type; };
  RendererType GetRendererType() const { return rendererType; };

  bool IsRenderingAdditive() { return additive; };
  void SetRenderingAdditive() { additive = true; };
  void SetRenderingAlpha() { additive = false; };

 protected:
  virtual void UnserializeParticleEmitterBaseFrom(
      const gd::SerializerElement& element);
  virtual void SerializeParticleEmitterBaseTo(
      gd::SerializerElement& element) const;

 private:
  void Init(const ParticleEmitterBase& other);

  gd::String textureParticleName;
  RendererType rendererType;
  double rendererParam1;
  double rendererParam2;
  bool additive;
  double tank;
  double flow;
  double emitterForceMin;
  double emitterForceMax;
  double emitterAngleA;
  double emitterAngleB;
  double zoneRadius;
  double particleGravityX, particleGravityY;
  double particleLifeTimeMin, particleLifeTimeMax;
  double particleRed1, particleRed2, particleGreen1, particleGreen2,
      particleBlue1, particleBlue2, particleAlpha1, particleAlpha2;
  double particleSize1, particleSize2, particleAngle1, particleAngle2;
  double particleAlphaRandomness1, particleAlphaRandomness2;
  double particleSizeRandomness1, particleSizeRandomness2,
      particleAngleRandomness1, particleAngleRandomness2;
  std::size_t maxParticleNb;
  bool destroyWhenNoParticles;  ///< If set to true, the object will removed
                                ///< itself from the scene when it has no more
                                ///< particles.
  double jumpForwardInTimeOnCreation;
};

/**
 * \brief Particle Emitter object used for storage and for the IDE.
 */
class GD_EXTENSION_API ParticleEmitterObject : public gd::ObjectConfiguration,
                                               public ParticleEmitterBase {
 public:
  ParticleEmitterObject();
  virtual ~ParticleEmitterObject(){};
  virtual std::unique_ptr<gd::ObjectConfiguration> Clone() const {
    return gd::make_unique<ParticleEmitterObject>(*this);
  }

  virtual void ExposeResources(gd::ArbitraryResourceWorker& worker);

 private:
  virtual void DoUnserializeFrom(gd::Project& project,
                                 const gd::SerializerElement& element);
  virtual void DoSerializeTo(gd::SerializerElement& element) const;
};

#endif  // PARTICLEEMITTEROBJECT_H
