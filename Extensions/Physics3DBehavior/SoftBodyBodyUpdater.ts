namespace gdjs {
  export namespace Physics3DRuntimeBehavior {
    export class SoftBodyBodyUpdater implements gdjs.Physics3DRuntimeBehavior.BodyUpdater {
      behavior: gdjs.Physics3DRuntimeBehavior;
      constructor(behavior: gdjs.Physics3DRuntimeBehavior) {
        this.behavior = behavior;
      }

      createAndAddBody(): Jolt.Body | null {
        const { behavior } = this;
        const shared = behavior._sharedData;
        const bodyInterface = shared.bodyInterface;

        // Try to create soft body creation settings and map some properties.
        // The behavior may not expose soft-specific properties yet; use defaults
        // and gracefully handle missing APIs.
        try {
          const settings = new Jolt.SoftBodyCreationSettings();

          // Map common properties if present on behavior, otherwise use sensible defaults
          if ((behavior as any).softLinearDamping !== undefined) {
            settings.set_mLinearDamping((behavior as any).softLinearDamping);
          } else {
            settings.set_mLinearDamping(0.02);
          }
          if ((behavior as any).softMaxLinearVelocity !== undefined) {
            settings.set_mMaxLinearVelocity((behavior as any).softMaxLinearVelocity);
          }
          if ((behavior as any).softRestitution !== undefined) {
            settings.set_mRestitution((behavior as any).softRestitution);
          }
          if ((behavior as any).softFriction !== undefined) {
            settings.set_mFriction((behavior as any).softFriction);
          }
          if ((behavior as any).softPressure !== undefined) {
            settings.set_mPressure((behavior as any).softPressure);
          }
          if ((behavior as any).softGravityFactor !== undefined) {
            settings.set_mGravityFactor((behavior as any).softGravityFactor);
          }
          if ((behavior as any).softVertexRadius !== undefined) {
            settings.set_mVertexRadius((behavior as any).softVertexRadius);
          } else {
            settings.set_mVertexRadius(0.02);
          }
          if ((behavior as any).softUpdatePosition !== undefined) {
            settings.set_mUpdatePosition(!!(behavior as any).softUpdatePosition);
          }
          if ((behavior as any).softEnableSkinConstraints !== undefined) {
            settings.set_mEnableSkinConstraints(!!(behavior as any).softEnableSkinConstraints);
          }
          if ((behavior as any).softFacesDoubleSided !== undefined) {
            settings.set_mFacesDoubleSided(!!(behavior as any).softFacesDoubleSided);
          }

          // If the owner is a model and has mesh, attempt to build a soft body mesh from it.
          // For now, rely on the behavior to specify vertices/faces (future improvement: generate cloth grid)

          // Create and add soft body to the physics system. The CreateAndAddSoftBody returns a BodyID.
          const bodyID = bodyInterface.CreateAndAddSoftBody(
            settings,
            Jolt.EActivation_Activate
          );

          Jolt.destroy(settings);

          if (!bodyID) return null;

          // Get the body pointer via the BodyLockInterface
          const bodyLockInterface = shared.physicsSystem.GetBodyLockInterface();
          const body = bodyLockInterface.TryGetBody(bodyID);
          if (!body) return null;

          // Associate behavior to the body
          body.gdjsAssociatedBehavior = behavior;

          return body;
        } catch (err) {
          console.warn('SoftBody creation failed, falling back to rigid body', err);
          return new gdjs.Physics3DRuntimeBehavior.DefaultBodyUpdater(behavior).createAndAddBody();
        }
      }

      updateObjectFromBody(): void {
        const { behavior } = this;
        const body = behavior._body;
        if (!body) return;

        // Try to update the owner visual mesh from the soft-body vertices.
        try {
          SoftBodyVisualizer.updateGeometryFromBody(body, behavior.owner3D, behavior._sharedData);
        } catch (err) {
          // Fallback: update position/rotation if possible
          if (body.IsActive && body.IsActive()) {
            behavior._moveObjectToPhysicsPosition(body.GetPosition());
            behavior._moveObjectToPhysicsRotation(body.GetRotation());
          }
        }
      }

      updateBodyFromObject(): void {
        const { behavior } = this;
        // For soft bodies, we might want to update a root transform or skinning transform.
        // For now, update the global transform if the owner moved.
        if (behavior._body === null) {
          if (!behavior._createBody()) return;
        }
        const body = behavior._body!;
        const shared = behavior._sharedData;

        if (
          behavior._objectOldX !== behavior.owner3D.getX() ||
          behavior._objectOldY !== behavior.owner3D.getY() ||
          behavior._objectOldZ !== behavior.owner3D.getZ() ||
          behavior._objectOldRotationX !== behavior.owner3D.getRotationX() ||
          behavior._objectOldRotationY !== behavior.owner3D.getRotationY() ||
          behavior._objectOldRotationZ !== behavior.owner3D.getAngle()
        ) {
          shared.bodyInterface.SetPositionAndRotationWhenChanged(
            body.GetID(),
            behavior._getPhysicsPosition(shared.getRVec3(0, 0, 0)),
            behavior._getPhysicsRotation(shared.getQuat(0, 0, 0, 1)),
            Jolt.EActivation_Activate
          );
        }
      }

      recreateShape(): void {
        // Recreate by destroying and creating again
        this.destroyBody();
        this.createAndAddBody();
      }

      destroyBody(): void {
        const { behavior } = this;
        const shared = behavior._sharedData;
        if (behavior._body !== null) {
          shared.bodyInterface.RemoveBody(behavior._body.GetID());
          shared.bodyInterface.DestroyBody(behavior._body.GetID());
          behavior._body = null;
        }
      }
    }
  }
}
