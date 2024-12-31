declare namespace Jolt {
  function destroy(obj: any): void;
  function _malloc(size: number): number;
  function _free(ptr: number): void;
  function wrapPointer<C extends new (...args: any) => any>(
    ptr: number,
    Class: C
  ): InstanceType<C>;
  function getPointer(obj: unknown): number;
  function castObject<C extends new (...args: any) => any>(
    object: unknown,
    Class: C
  ): InstanceType<C>;
  function compare(object1: unknown, object2: unknown): boolean;
  const HEAP8: Int8Array;
  const HEAP16: Int16Array;
  const HEAP32: Int32Array;
  const HEAPU8: Uint8Array;
  const HEAPU16: Uint16Array;
  const HEAPU32: Uint32Array;
  const HEAPF32: Float32Array;
  const HEAPF64: Float64Array;
  class JPHString {
    constructor(str: string, length: number);
    c_str(): string;
    size(): number;
  }
  class ArrayVec3 {
    empty(): boolean;
    size(): number;
    at(inIndex: number): Vec3;
    push_back(inValue: Vec3): void;
    reserve(inSize: number): void;
    resize(inSize: number): void;
    clear(): void;
    data(): Vec3MemRef;
  }
  class ArrayQuat {
    empty(): boolean;
    size(): number;
    at(inIndex: number): Quat;
    push_back(inValue: Quat): void;
    reserve(inSize: number): void;
    resize(inSize: number): void;
    clear(): void;
    data(): QuatMemRef;
  }
  class ArrayMat44 {
    empty(): boolean;
    size(): number;
    at(inIndex: number): Mat44;
    push_back(inValue: Mat44): void;
    reserve(inSize: number): void;
    resize(inSize: number): void;
    clear(): void;
    data(): Mat44MemRef;
  }
  class ArrayBodyID {
    empty(): boolean;
    size(): number;
    at(inIndex: number): BodyID;
    push_back(inValue: BodyID): void;
    reserve(inSize: number): void;
    resize(inSize: number): void;
    clear(): void;
    data(): BodyIDMemRef;
  }
  class ArrayBodyPtr {
    empty(): boolean;
    size(): number;
    at(inIndex: number): Body;
    push_back(inValue: Body): void;
    reserve(inSize: number): void;
    resize(inSize: number): void;
    clear(): void;
    data(): BodyPtrMemRef;
  }
  const EBodyType_RigidBody: number;
  const EBodyType_SoftBody: number;
  type EBodyType = typeof EBodyType_RigidBody | typeof EBodyType_SoftBody;
  function _emscripten_enum_EBodyType_EBodyType_RigidBody(): EBodyType;
  function _emscripten_enum_EBodyType_EBodyType_SoftBody(): EBodyType;
  const EMotionType_Static: number;
  const EMotionType_Kinematic: number;
  const EMotionType_Dynamic: number;
  type EMotionType =
    | typeof EMotionType_Static
    | typeof EMotionType_Kinematic
    | typeof EMotionType_Dynamic;
  function _emscripten_enum_EMotionType_EMotionType_Static(): EMotionType;
  function _emscripten_enum_EMotionType_EMotionType_Kinematic(): EMotionType;
  function _emscripten_enum_EMotionType_EMotionType_Dynamic(): EMotionType;
  const EMotionQuality_Discrete: number;
  const EMotionQuality_LinearCast: number;
  type EMotionQuality =
    | typeof EMotionQuality_Discrete
    | typeof EMotionQuality_LinearCast;
  function _emscripten_enum_EMotionQuality_EMotionQuality_Discrete(): EMotionQuality;
  function _emscripten_enum_EMotionQuality_EMotionQuality_LinearCast(): EMotionQuality;
  const EActivation_Activate: number;
  const EActivation_DontActivate: number;
  type EActivation =
    | typeof EActivation_Activate
    | typeof EActivation_DontActivate;
  function _emscripten_enum_EActivation_EActivation_Activate(): EActivation;
  function _emscripten_enum_EActivation_EActivation_DontActivate(): EActivation;
  const EShapeType_Convex: number;
  const EShapeType_Compound: number;
  const EShapeType_Decorated: number;
  const EShapeType_Mesh: number;
  const EShapeType_HeightField: number;
  const EShapeType_Plane: number;
  const EShapeType_Empty: number;
  type EShapeType =
    | typeof EShapeType_Convex
    | typeof EShapeType_Compound
    | typeof EShapeType_Decorated
    | typeof EShapeType_Mesh
    | typeof EShapeType_HeightField
    | typeof EShapeType_Plane
    | typeof EShapeType_Empty;
  function _emscripten_enum_EShapeType_EShapeType_Convex(): EShapeType;
  function _emscripten_enum_EShapeType_EShapeType_Compound(): EShapeType;
  function _emscripten_enum_EShapeType_EShapeType_Decorated(): EShapeType;
  function _emscripten_enum_EShapeType_EShapeType_Mesh(): EShapeType;
  function _emscripten_enum_EShapeType_EShapeType_HeightField(): EShapeType;
  function _emscripten_enum_EShapeType_EShapeType_Plane(): EShapeType;
  function _emscripten_enum_EShapeType_EShapeType_Empty(): EShapeType;
  const EShapeSubType_Sphere: number;
  const EShapeSubType_Box: number;
  const EShapeSubType_Capsule: number;
  const EShapeSubType_TaperedCapsule: number;
  const EShapeSubType_Cylinder: number;
  const EShapeSubType_TaperedCylinder: number;
  const EShapeSubType_ConvexHull: number;
  const EShapeSubType_StaticCompound: number;
  const EShapeSubType_MutableCompound: number;
  const EShapeSubType_RotatedTranslated: number;
  const EShapeSubType_Scaled: number;
  const EShapeSubType_OffsetCenterOfMass: number;
  const EShapeSubType_Mesh: number;
  const EShapeSubType_HeightField: number;
  const EShapeSubType_Plane: number;
  const EShapeSubType_Empty: number;
  type EShapeSubType =
    | typeof EShapeSubType_Sphere
    | typeof EShapeSubType_Box
    | typeof EShapeSubType_Capsule
    | typeof EShapeSubType_TaperedCapsule
    | typeof EShapeSubType_Cylinder
    | typeof EShapeSubType_TaperedCylinder
    | typeof EShapeSubType_ConvexHull
    | typeof EShapeSubType_StaticCompound
    | typeof EShapeSubType_MutableCompound
    | typeof EShapeSubType_RotatedTranslated
    | typeof EShapeSubType_Scaled
    | typeof EShapeSubType_OffsetCenterOfMass
    | typeof EShapeSubType_Mesh
    | typeof EShapeSubType_HeightField
    | typeof EShapeSubType_Plane
    | typeof EShapeSubType_Empty;
  function _emscripten_enum_EShapeSubType_EShapeSubType_Sphere(): EShapeSubType;
  function _emscripten_enum_EShapeSubType_EShapeSubType_Box(): EShapeSubType;
  function _emscripten_enum_EShapeSubType_EShapeSubType_Capsule(): EShapeSubType;
  function _emscripten_enum_EShapeSubType_EShapeSubType_TaperedCapsule(): EShapeSubType;
  function _emscripten_enum_EShapeSubType_EShapeSubType_Cylinder(): EShapeSubType;
  function _emscripten_enum_EShapeSubType_EShapeSubType_TaperedCylinder(): EShapeSubType;
  function _emscripten_enum_EShapeSubType_EShapeSubType_ConvexHull(): EShapeSubType;
  function _emscripten_enum_EShapeSubType_EShapeSubType_StaticCompound(): EShapeSubType;
  function _emscripten_enum_EShapeSubType_EShapeSubType_MutableCompound(): EShapeSubType;
  function _emscripten_enum_EShapeSubType_EShapeSubType_RotatedTranslated(): EShapeSubType;
  function _emscripten_enum_EShapeSubType_EShapeSubType_Scaled(): EShapeSubType;
  function _emscripten_enum_EShapeSubType_EShapeSubType_OffsetCenterOfMass(): EShapeSubType;
  function _emscripten_enum_EShapeSubType_EShapeSubType_Mesh(): EShapeSubType;
  function _emscripten_enum_EShapeSubType_EShapeSubType_HeightField(): EShapeSubType;
  function _emscripten_enum_EShapeSubType_EShapeSubType_Plane(): EShapeSubType;
  function _emscripten_enum_EShapeSubType_EShapeSubType_Empty(): EShapeSubType;
  const EConstraintSpace_LocalToBodyCOM: number;
  const EConstraintSpace_WorldSpace: number;
  type EConstraintSpace =
    | typeof EConstraintSpace_LocalToBodyCOM
    | typeof EConstraintSpace_WorldSpace;
  function _emscripten_enum_EConstraintSpace_EConstraintSpace_LocalToBodyCOM(): EConstraintSpace;
  function _emscripten_enum_EConstraintSpace_EConstraintSpace_WorldSpace(): EConstraintSpace;
  const ESpringMode_FrequencyAndDamping: number;
  const ESpringMode_StiffnessAndDamping: number;
  type ESpringMode =
    | typeof ESpringMode_FrequencyAndDamping
    | typeof ESpringMode_StiffnessAndDamping;
  function _emscripten_enum_ESpringMode_ESpringMode_FrequencyAndDamping(): ESpringMode;
  function _emscripten_enum_ESpringMode_ESpringMode_StiffnessAndDamping(): ESpringMode;
  const EOverrideMassProperties_CalculateMassAndInertia: number;
  const EOverrideMassProperties_CalculateInertia: number;
  const EOverrideMassProperties_MassAndInertiaProvided: number;
  type EOverrideMassProperties =
    | typeof EOverrideMassProperties_CalculateMassAndInertia
    | typeof EOverrideMassProperties_CalculateInertia
    | typeof EOverrideMassProperties_MassAndInertiaProvided;
  function _emscripten_enum_EOverrideMassProperties_EOverrideMassProperties_CalculateMassAndInertia(): EOverrideMassProperties;
  function _emscripten_enum_EOverrideMassProperties_EOverrideMassProperties_CalculateInertia(): EOverrideMassProperties;
  function _emscripten_enum_EOverrideMassProperties_EOverrideMassProperties_MassAndInertiaProvided(): EOverrideMassProperties;
  const EAllowedDOFs_TranslationX: number;
  const EAllowedDOFs_TranslationY: number;
  const EAllowedDOFs_TranslationZ: number;
  const EAllowedDOFs_RotationX: number;
  const EAllowedDOFs_RotationY: number;
  const EAllowedDOFs_RotationZ: number;
  const EAllowedDOFs_Plane2D: number;
  const EAllowedDOFs_All: number;
  type EAllowedDOFs =
    | typeof EAllowedDOFs_TranslationX
    | typeof EAllowedDOFs_TranslationY
    | typeof EAllowedDOFs_TranslationZ
    | typeof EAllowedDOFs_RotationX
    | typeof EAllowedDOFs_RotationY
    | typeof EAllowedDOFs_RotationZ
    | typeof EAllowedDOFs_Plane2D
    | typeof EAllowedDOFs_All;
  function _emscripten_enum_EAllowedDOFs_EAllowedDOFs_TranslationX(): EAllowedDOFs;
  function _emscripten_enum_EAllowedDOFs_EAllowedDOFs_TranslationY(): EAllowedDOFs;
  function _emscripten_enum_EAllowedDOFs_EAllowedDOFs_TranslationZ(): EAllowedDOFs;
  function _emscripten_enum_EAllowedDOFs_EAllowedDOFs_RotationX(): EAllowedDOFs;
  function _emscripten_enum_EAllowedDOFs_EAllowedDOFs_RotationY(): EAllowedDOFs;
  function _emscripten_enum_EAllowedDOFs_EAllowedDOFs_RotationZ(): EAllowedDOFs;
  function _emscripten_enum_EAllowedDOFs_EAllowedDOFs_Plane2D(): EAllowedDOFs;
  function _emscripten_enum_EAllowedDOFs_EAllowedDOFs_All(): EAllowedDOFs;
  const EStateRecorderState_None: number;
  const EStateRecorderState_Global: number;
  const EStateRecorderState_Bodies: number;
  const EStateRecorderState_Contacts: number;
  const EStateRecorderState_Constraints: number;
  const EStateRecorderState_All: number;
  type EStateRecorderState =
    | typeof EStateRecorderState_None
    | typeof EStateRecorderState_Global
    | typeof EStateRecorderState_Bodies
    | typeof EStateRecorderState_Contacts
    | typeof EStateRecorderState_Constraints
    | typeof EStateRecorderState_All;
  function _emscripten_enum_EStateRecorderState_EStateRecorderState_None(): EStateRecorderState;
  function _emscripten_enum_EStateRecorderState_EStateRecorderState_Global(): EStateRecorderState;
  function _emscripten_enum_EStateRecorderState_EStateRecorderState_Bodies(): EStateRecorderState;
  function _emscripten_enum_EStateRecorderState_EStateRecorderState_Contacts(): EStateRecorderState;
  function _emscripten_enum_EStateRecorderState_EStateRecorderState_Constraints(): EStateRecorderState;
  function _emscripten_enum_EStateRecorderState_EStateRecorderState_All(): EStateRecorderState;
  const EBackFaceMode_IgnoreBackFaces: number;
  const EBackFaceMode_CollideWithBackFaces: number;
  type EBackFaceMode =
    | typeof EBackFaceMode_IgnoreBackFaces
    | typeof EBackFaceMode_CollideWithBackFaces;
  function _emscripten_enum_EBackFaceMode_EBackFaceMode_IgnoreBackFaces(): EBackFaceMode;
  function _emscripten_enum_EBackFaceMode_EBackFaceMode_CollideWithBackFaces(): EBackFaceMode;
  const EGroundState_OnGround: number;
  const EGroundState_OnSteepGround: number;
  const EGroundState_NotSupported: number;
  const EGroundState_InAir: number;
  type EGroundState =
    | typeof EGroundState_OnGround
    | typeof EGroundState_OnSteepGround
    | typeof EGroundState_NotSupported
    | typeof EGroundState_InAir;
  function _emscripten_enum_EGroundState_EGroundState_OnGround(): EGroundState;
  function _emscripten_enum_EGroundState_EGroundState_OnSteepGround(): EGroundState;
  function _emscripten_enum_EGroundState_EGroundState_NotSupported(): EGroundState;
  function _emscripten_enum_EGroundState_EGroundState_InAir(): EGroundState;
  const ValidateResult_AcceptAllContactsForThisBodyPair: number;
  const ValidateResult_AcceptContact: number;
  const ValidateResult_RejectContact: number;
  const ValidateResult_RejectAllContactsForThisBodyPair: number;
  type ValidateResult =
    | typeof ValidateResult_AcceptAllContactsForThisBodyPair
    | typeof ValidateResult_AcceptContact
    | typeof ValidateResult_RejectContact
    | typeof ValidateResult_RejectAllContactsForThisBodyPair;
  function _emscripten_enum_ValidateResult_ValidateResult_AcceptAllContactsForThisBodyPair(): ValidateResult;
  function _emscripten_enum_ValidateResult_ValidateResult_AcceptContact(): ValidateResult;
  function _emscripten_enum_ValidateResult_ValidateResult_RejectContact(): ValidateResult;
  function _emscripten_enum_ValidateResult_ValidateResult_RejectAllContactsForThisBodyPair(): ValidateResult;
  const SoftBodyValidateResult_AcceptContact: number;
  const SoftBodyValidateResult_RejectContact: number;
  type SoftBodyValidateResult =
    | typeof SoftBodyValidateResult_AcceptContact
    | typeof SoftBodyValidateResult_RejectContact;
  function _emscripten_enum_SoftBodyValidateResult_SoftBodyValidateResult_AcceptContact(): SoftBodyValidateResult;
  function _emscripten_enum_SoftBodyValidateResult_SoftBodyValidateResult_RejectContact(): SoftBodyValidateResult;
  const EActiveEdgeMode_CollideOnlyWithActive: number;
  const EActiveEdgeMode_CollideWithAll: number;
  type EActiveEdgeMode =
    | typeof EActiveEdgeMode_CollideOnlyWithActive
    | typeof EActiveEdgeMode_CollideWithAll;
  function _emscripten_enum_EActiveEdgeMode_EActiveEdgeMode_CollideOnlyWithActive(): EActiveEdgeMode;
  function _emscripten_enum_EActiveEdgeMode_EActiveEdgeMode_CollideWithAll(): EActiveEdgeMode;
  const ECollectFacesMode_CollectFaces: number;
  const ECollectFacesMode_NoFaces: number;
  type ECollectFacesMode =
    | typeof ECollectFacesMode_CollectFaces
    | typeof ECollectFacesMode_NoFaces;
  function _emscripten_enum_ECollectFacesMode_ECollectFacesMode_CollectFaces(): ECollectFacesMode;
  function _emscripten_enum_ECollectFacesMode_ECollectFacesMode_NoFaces(): ECollectFacesMode;
  const SixDOFConstraintSettings_EAxis_TranslationX: number;
  const SixDOFConstraintSettings_EAxis_TranslationY: number;
  const SixDOFConstraintSettings_EAxis_TranslationZ: number;
  const SixDOFConstraintSettings_EAxis_RotationX: number;
  const SixDOFConstraintSettings_EAxis_RotationY: number;
  const SixDOFConstraintSettings_EAxis_RotationZ: number;
  type SixDOFConstraintSettings_EAxis =
    | typeof SixDOFConstraintSettings_EAxis_TranslationX
    | typeof SixDOFConstraintSettings_EAxis_TranslationY
    | typeof SixDOFConstraintSettings_EAxis_TranslationZ
    | typeof SixDOFConstraintSettings_EAxis_RotationX
    | typeof SixDOFConstraintSettings_EAxis_RotationY
    | typeof SixDOFConstraintSettings_EAxis_RotationZ;
  function _emscripten_enum_SixDOFConstraintSettings_EAxis_SixDOFConstraintSettings_EAxis_TranslationX(): SixDOFConstraintSettings_EAxis;
  function _emscripten_enum_SixDOFConstraintSettings_EAxis_SixDOFConstraintSettings_EAxis_TranslationY(): SixDOFConstraintSettings_EAxis;
  function _emscripten_enum_SixDOFConstraintSettings_EAxis_SixDOFConstraintSettings_EAxis_TranslationZ(): SixDOFConstraintSettings_EAxis;
  function _emscripten_enum_SixDOFConstraintSettings_EAxis_SixDOFConstraintSettings_EAxis_RotationX(): SixDOFConstraintSettings_EAxis;
  function _emscripten_enum_SixDOFConstraintSettings_EAxis_SixDOFConstraintSettings_EAxis_RotationY(): SixDOFConstraintSettings_EAxis;
  function _emscripten_enum_SixDOFConstraintSettings_EAxis_SixDOFConstraintSettings_EAxis_RotationZ(): SixDOFConstraintSettings_EAxis;
  const EConstraintType_Constraint: number;
  const EConstraintType_TwoBodyConstraint: number;
  type EConstraintType =
    | typeof EConstraintType_Constraint
    | typeof EConstraintType_TwoBodyConstraint;
  function _emscripten_enum_EConstraintType_EConstraintType_Constraint(): EConstraintType;
  function _emscripten_enum_EConstraintType_EConstraintType_TwoBodyConstraint(): EConstraintType;
  const EConstraintSubType_Fixed: number;
  const EConstraintSubType_Point: number;
  const EConstraintSubType_Hinge: number;
  const EConstraintSubType_Slider: number;
  const EConstraintSubType_Distance: number;
  const EConstraintSubType_Cone: number;
  const EConstraintSubType_SwingTwist: number;
  const EConstraintSubType_SixDOF: number;
  const EConstraintSubType_Path: number;
  const EConstraintSubType_Vehicle: number;
  const EConstraintSubType_RackAndPinion: number;
  const EConstraintSubType_Gear: number;
  const EConstraintSubType_Pulley: number;
  type EConstraintSubType =
    | typeof EConstraintSubType_Fixed
    | typeof EConstraintSubType_Point
    | typeof EConstraintSubType_Hinge
    | typeof EConstraintSubType_Slider
    | typeof EConstraintSubType_Distance
    | typeof EConstraintSubType_Cone
    | typeof EConstraintSubType_SwingTwist
    | typeof EConstraintSubType_SixDOF
    | typeof EConstraintSubType_Path
    | typeof EConstraintSubType_Vehicle
    | typeof EConstraintSubType_RackAndPinion
    | typeof EConstraintSubType_Gear
    | typeof EConstraintSubType_Pulley;
  function _emscripten_enum_EConstraintSubType_EConstraintSubType_Fixed(): EConstraintSubType;
  function _emscripten_enum_EConstraintSubType_EConstraintSubType_Point(): EConstraintSubType;
  function _emscripten_enum_EConstraintSubType_EConstraintSubType_Hinge(): EConstraintSubType;
  function _emscripten_enum_EConstraintSubType_EConstraintSubType_Slider(): EConstraintSubType;
  function _emscripten_enum_EConstraintSubType_EConstraintSubType_Distance(): EConstraintSubType;
  function _emscripten_enum_EConstraintSubType_EConstraintSubType_Cone(): EConstraintSubType;
  function _emscripten_enum_EConstraintSubType_EConstraintSubType_SwingTwist(): EConstraintSubType;
  function _emscripten_enum_EConstraintSubType_EConstraintSubType_SixDOF(): EConstraintSubType;
  function _emscripten_enum_EConstraintSubType_EConstraintSubType_Path(): EConstraintSubType;
  function _emscripten_enum_EConstraintSubType_EConstraintSubType_Vehicle(): EConstraintSubType;
  function _emscripten_enum_EConstraintSubType_EConstraintSubType_RackAndPinion(): EConstraintSubType;
  function _emscripten_enum_EConstraintSubType_EConstraintSubType_Gear(): EConstraintSubType;
  function _emscripten_enum_EConstraintSubType_EConstraintSubType_Pulley(): EConstraintSubType;
  const EMotorState_Off: number;
  const EMotorState_Velocity: number;
  const EMotorState_Position: number;
  type EMotorState =
    | typeof EMotorState_Off
    | typeof EMotorState_Velocity
    | typeof EMotorState_Position;
  function _emscripten_enum_EMotorState_EMotorState_Off(): EMotorState;
  function _emscripten_enum_EMotorState_EMotorState_Velocity(): EMotorState;
  function _emscripten_enum_EMotorState_EMotorState_Position(): EMotorState;
  const ETransmissionMode_Auto: number;
  const ETransmissionMode_Manual: number;
  type ETransmissionMode =
    | typeof ETransmissionMode_Auto
    | typeof ETransmissionMode_Manual;
  function _emscripten_enum_ETransmissionMode_ETransmissionMode_Auto(): ETransmissionMode;
  function _emscripten_enum_ETransmissionMode_ETransmissionMode_Manual(): ETransmissionMode;
  const ETireFrictionDirection_Longitudinal: number;
  const ETireFrictionDirection_Lateral: number;
  type ETireFrictionDirection =
    | typeof ETireFrictionDirection_Longitudinal
    | typeof ETireFrictionDirection_Lateral;
  function _emscripten_enum_ETireFrictionDirection_ETireFrictionDirection_Longitudinal(): ETireFrictionDirection;
  function _emscripten_enum_ETireFrictionDirection_ETireFrictionDirection_Lateral(): ETireFrictionDirection;
  const ESwingType_Cone: number;
  const ESwingType_Pyramid: number;
  type ESwingType = typeof ESwingType_Cone | typeof ESwingType_Pyramid;
  function _emscripten_enum_ESwingType_ESwingType_Cone(): ESwingType;
  function _emscripten_enum_ESwingType_ESwingType_Pyramid(): ESwingType;
  const EPathRotationConstraintType_Free: number;
  const EPathRotationConstraintType_ConstrainAroundTangent: number;
  const EPathRotationConstraintType_ConstrainAroundNormal: number;
  const EPathRotationConstraintType_ConstrainAroundBinormal: number;
  const EPathRotationConstraintType_ConstrainToPath: number;
  const EPathRotationConstraintType_FullyConstrained: number;
  type EPathRotationConstraintType =
    | typeof EPathRotationConstraintType_Free
    | typeof EPathRotationConstraintType_ConstrainAroundTangent
    | typeof EPathRotationConstraintType_ConstrainAroundNormal
    | typeof EPathRotationConstraintType_ConstrainAroundBinormal
    | typeof EPathRotationConstraintType_ConstrainToPath
    | typeof EPathRotationConstraintType_FullyConstrained;
  function _emscripten_enum_EPathRotationConstraintType_EPathRotationConstraintType_Free(): EPathRotationConstraintType;
  function _emscripten_enum_EPathRotationConstraintType_EPathRotationConstraintType_ConstrainAroundTangent(): EPathRotationConstraintType;
  function _emscripten_enum_EPathRotationConstraintType_EPathRotationConstraintType_ConstrainAroundNormal(): EPathRotationConstraintType;
  function _emscripten_enum_EPathRotationConstraintType_EPathRotationConstraintType_ConstrainAroundBinormal(): EPathRotationConstraintType;
  function _emscripten_enum_EPathRotationConstraintType_EPathRotationConstraintType_ConstrainToPath(): EPathRotationConstraintType;
  function _emscripten_enum_EPathRotationConstraintType_EPathRotationConstraintType_FullyConstrained(): EPathRotationConstraintType;
  const SoftBodySharedSettings_EBendType_None: number;
  const SoftBodySharedSettings_EBendType_Distance: number;
  const SoftBodySharedSettings_EBendType_Dihedral: number;
  type SoftBodySharedSettings_EBendType =
    | typeof SoftBodySharedSettings_EBendType_None
    | typeof SoftBodySharedSettings_EBendType_Distance
    | typeof SoftBodySharedSettings_EBendType_Dihedral;
  function _emscripten_enum_SoftBodySharedSettings_EBendType_SoftBodySharedSettings_EBendType_None(): SoftBodySharedSettings_EBendType;
  function _emscripten_enum_SoftBodySharedSettings_EBendType_SoftBodySharedSettings_EBendType_Distance(): SoftBodySharedSettings_EBendType;
  function _emscripten_enum_SoftBodySharedSettings_EBendType_SoftBodySharedSettings_EBendType_Dihedral(): SoftBodySharedSettings_EBendType;
  const SoftBodySharedSettings_ELRAType_None: number;
  const SoftBodySharedSettings_ELRAType_EuclideanDistance: number;
  const SoftBodySharedSettings_ELRAType_GeodesicDistance: number;
  type SoftBodySharedSettings_ELRAType =
    | typeof SoftBodySharedSettings_ELRAType_None
    | typeof SoftBodySharedSettings_ELRAType_EuclideanDistance
    | typeof SoftBodySharedSettings_ELRAType_GeodesicDistance;
  function _emscripten_enum_SoftBodySharedSettings_ELRAType_SoftBodySharedSettings_ELRAType_None(): SoftBodySharedSettings_ELRAType;
  function _emscripten_enum_SoftBodySharedSettings_ELRAType_SoftBodySharedSettings_ELRAType_EuclideanDistance(): SoftBodySharedSettings_ELRAType;
  function _emscripten_enum_SoftBodySharedSettings_ELRAType_SoftBodySharedSettings_ELRAType_GeodesicDistance(): SoftBodySharedSettings_ELRAType;
  class Vec3MemRef {}
  class QuatMemRef {}
  class Mat44MemRef {}
  class BodyIDMemRef {}
  class BodyPtrMemRef {}
  class FloatMemRef {}
  class Uint8MemRef {}
  class UintMemRef {}
  class Vec3 {
    constructor();
    constructor(inV: Float3);
    constructor(inX: number, inY: number, inZ: number);
    sZero(): Vec3;
    sAxisX(): Vec3;
    sAxisY(): Vec3;
    sAxisZ(): Vec3;
    sReplicate(inValue: number): Vec3;
    sMin(inLHS: Vec3, inRHS: Vec3): Vec3;
    sMax(inLHS: Vec3, inRHS: Vec3): Vec3;
    sClamp(inValue: Vec3, inMin: Vec3, inMax: Vec3): Vec3;
    sFusedMultiplyAdd(inMul1: Vec3, inMul2: Vec3, inAdd: Vec3): Vec3;
    sOr(inV1: Vec3, inV2: Vec3): Vec3;
    sXor(inV1: Vec3, inV2: Vec3): Vec3;
    sAnd(inV1: Vec3, inV2: Vec3): Vec3;
    sUnitSpherical(inTheta: number, inPhi: number): Vec3;
    GetComponent(inCoordinate: number): number;
    Equals(inV: Vec3): boolean;
    NotEquals(inV: Vec3): boolean;
    LengthSq(): number;
    Length(): number;
    Normalized(): Vec3;
    NormalizedOr(inZeroValue: Vec3): Vec3;
    GetNormalizedPerpendicular(): Vec3;
    GetX(): number;
    GetY(): number;
    GetZ(): number;
    SetX(inX: number): void;
    SetY(inY: number): void;
    SetZ(inZ: number): void;
    Set(inX: number, inY: number, inZ: number): void;
    SetComponent(inCoordinate: number, inValue: number): void;
    IsNearZero(inMaxDistSq?: number): boolean;
    IsClose(inV: Vec3, inMaxDistSq?: number): boolean;
    IsNormalized(inTolerance?: number): boolean;
    GetLowestComponentIndex(): number;
    GetHighestComponentIndex(): number;
    Abs(): Vec3;
    Reciprocal(): Vec3;
    Cross(inRHS: Vec3): Vec3;
    Dot(inRHS: Vec3): number;
    DotV(inRHS: Vec3): Vec3;
    DotV4(inRHS: Vec3): Vec4;
    Add(inV: Vec3): Vec3;
    Sub(inV: Vec3): Vec3;
    Mul(inV: number): Vec3;
    Div(inV: number): Vec3;
    MulVec3(inV: Vec3): Vec3;
    MulFloat(inV: number): Vec3;
    DivVec3(inV: Vec3): Vec3;
    DivFloat(inV: number): Vec3;
    AddVec3(inV: Vec3): Vec3;
    SubVec3(inV: Vec3): Vec3;
    SplatX(): Vec4;
    SplatY(): Vec4;
    SplatZ(): Vec4;
    ReduceMin(): number;
    ReduceMax(): number;
    Sqrt(): Vec3;
    GetSign(): Vec3;
  }
  class RVec3 {
    constructor();
    constructor(inX: number, inY: number, inZ: number);
    sZero(): RVec3;
    sAxisX(): RVec3;
    sAxisY(): RVec3;
    sAxisZ(): RVec3;
    sReplicate(inValue: number): RVec3;
    sMin(inLHS: RVec3, inRHS: RVec3): RVec3;
    sMax(inLHS: RVec3, inRHS: RVec3): RVec3;
    sClamp(inValue: RVec3, inMin: RVec3, inMax: RVec3): RVec3;
    GetComponent(inCoordinate: number): number;
    Equals(inV: RVec3): boolean;
    NotEquals(inV: RVec3): boolean;
    LengthSq(): number;
    Length(): number;
    Normalized(): RVec3;
    GetX(): number;
    GetY(): number;
    GetZ(): number;
    SetX(inX: number): void;
    SetY(inY: number): void;
    SetZ(inZ: number): void;
    Set(inX: number, inY: number, inZ: number): void;
    SetComponent(inCoordinate: number, inValue: number): void;
    IsNearZero(inMaxDistSq?: number): boolean;
    IsClose(inV: RVec3, inMaxDistSq?: number): boolean;
    IsNormalized(inTolerance?: number): boolean;
    Abs(): RVec3;
    Reciprocal(): RVec3;
    Cross(inRHS: RVec3): RVec3;
    Dot(inRHS: RVec3): number;
    Add(inV: Vec3): RVec3;
    Sub(inV: Vec3): RVec3;
    Mul(inV: number): RVec3;
    Div(inV: number): RVec3;
    MulRVec3(inV: RVec3): RVec3;
    MulFloat(inV: number): RVec3;
    DivRVec3(inV: RVec3): RVec3;
    DivFloat(inV: number): RVec3;
    AddRVec3(inV: RVec3): RVec3;
    SubRVec3(inV: RVec3): RVec3;
    Sqrt(): RVec3;
    GetSign(): RVec3;
  }
  class Vec4 {
    constructor();
    constructor(inV: Vec4);
    constructor(inV: Vec3, inW: number);
    constructor(inX: number, inY: number, inZ: number, inW: number);
    sZero(): Vec4;
    sReplicate(inV: number): Vec4;
    sMin(inLHS: Vec4, inRHS: Vec4): Vec4;
    sMax(inLHS: Vec4, inRHS: Vec4): Vec4;
    sFusedMultiplyAdd(inMul1: Vec4, inMul2: Vec4, inAdd: Vec4): Vec4;
    sOr(inV1: Vec4, inV2: Vec4): Vec4;
    sXor(inV1: Vec4, inV2: Vec4): Vec4;
    sAnd(inV1: Vec4, inV2: Vec4): Vec4;
    GetX(): number;
    GetY(): number;
    GetZ(): number;
    GetW(): number;
    SetX(inX: number): void;
    SetY(inY: number): void;
    SetZ(inZ: number): void;
    SetW(inW: number): void;
    Set(inX: number, inY: number, inZ: number, inW: number): void;
    GetComponent(inCoordinate: number): number;
    IsClose(inV: Vec4, inMaxDistSq?: number): boolean;
    IsNormalized(inTolerance?: number): boolean;
    Add(inV: Vec4): Vec4;
    Sub(inV: Vec4): Vec4;
    Mul(inV: number): Vec4;
    Div(inV: number): Vec4;
    MulVec4(inV: Vec4): Vec4;
    MulFloat(inV: number): Vec4;
    DivVec4(inV: Vec4): Vec4;
    DivFloat(inV: number): Vec4;
    AddVec4(inV: Vec4): Vec4;
    SubVec4(inV: Vec4): Vec4;
  }
  class Vector2 {
    constructor();
    SetZero(): void;
    IsZero(): void;
    IsClose(inV: Vector2, inMaxDistSq?: number): void;
    IsNormalized(inTolerance?: number): void;
    Normalized(): Vector2;
    GetComponent(inCoordinate: number): number;
    Add(inV: Vector2): Vector2;
    Sub(inV: Vector2): Vector2;
    Mul(inV: number): Vector2;
    Div(inV: number): Vector2;
    MulFloat(inV: number): Vector2;
    DivFloat(inV: number): Vector2;
    AddVector2(inV: Vector2): Vector2;
    SubVector2(inV: Vector2): Vector2;
    Dot(inRHS: Vector2): number;
  }
  class Quat {
    constructor();
    constructor(inX: number, inY: number, inZ: number, inW: number);
    sZero(): Quat;
    sIdentity(): Quat;
    sRotation(inRotation: Vec3, inAngle: number): Quat;
    sFromTo(inFrom: Vec3, inTo: Vec3): Quat;
    Equals(inQ: Quat): boolean;
    NotEquals(inQ: Quat): boolean;
    MulQuat(inQ: Quat): Quat;
    MulVec3(inV: Vec3): Vec3;
    MulFloat(inV: number): Quat;
    IsClose(inQ: Quat, inMaxDistSq?: number): boolean;
    IsNormalized(inTolerance?: number): boolean;
    Length(): number;
    LengthSq(): number;
    Normalized(): Quat;
    sEulerAngles(inInput: Vec3): Quat;
    GetEulerAngles(): Vec3;
    GetX(): number;
    GetY(): number;
    GetZ(): number;
    GetW(): number;
    GetXYZ(): Vec3;
    SetX(inX: number): void;
    SetY(inY: number): void;
    SetZ(inZ: number): void;
    SetW(inW: number): void;
    Set(inX: number, inY: number, inZ: number, inW: number): void;
    InverseRotate(inV: Vec3): Vec3;
    RotateAxisX(): Vec3;
    RotateAxisY(): Vec3;
    RotateAxisZ(): Vec3;
    Dot(inQ: Quat): number;
    Conjugated(): Quat;
    Inversed(): Quat;
    EnsureWPositive(): Quat;
    GetPerpendicular(): Quat;
    GetRotationAngle(inAxis: Vec3): number;
    GetTwist(inAxis: Vec3): Quat;
    GetSwingTwist(outSwing: Quat, outTwist: Quat): void;
    LERP(inDestination: Quat, inFraction: number): Quat;
    SLERP(inDestination: Quat, inFraction: number): Quat;
  }
  class Float3 {
    constructor(inX: number, inY: number, inZ: number);
    Equals(inV: Float3): boolean;
    NotEquals(inV: Float3): boolean;
    get_x(): number;
    set_x(x: number): void;
    x: number;
    get_y(): number;
    set_y(y: number): void;
    y: number;
    get_z(): number;
    set_z(z: number): void;
    z: number;
  }
  class Mat44 {
    constructor();
    sZero(): Mat44;
    sIdentity(): Mat44;
    sRotationX(inX: number): Mat44;
    sRotationY(inY: number): Mat44;
    sRotationZ(inZ: number): Mat44;
    sRotation(inQ: Quat): Mat44;
    sRotationAxisAngle(inAxis: Vec3, inAngle: number): Mat44;
    sTranslation(inTranslation: Vec3): Mat44;
    sRotationTranslation(inRotation: Quat, inTranslation: Vec3): Mat44;
    sInverseRotationTranslation(inRotation: Quat, inTranslation: Vec3): Mat44;
    sScale(inScale: number): Mat44;
    sScaleVec3(inScale: Vec3): Mat44;
    sOuterProduct(inV1: Vec3, inV2: Vec3): Mat44;
    sCrossProduct(inV: Vec3): Mat44;
    sQuatLeftMultiply(inQ: Quat): Mat44;
    sQuatRightMultiply(inQ: Quat): Mat44;
    sLookAt(inPos: Vec3, inTarget: Vec3, inUp: Vec3): Mat44;
    sPerspective(
      inFovY: number,
      inAspect: number,
      inNear: number,
      inFar: number
    ): Mat44;
    GetAxisX(): Vec3;
    GetAxisY(): Vec3;
    GetAxisZ(): Vec3;
    GetDiagonal3(): Vec3;
    GetDiagonal4(): Vec4;
    GetRotation(): Mat44;
    GetRotationSafe(): Mat44;
    GetQuaternion(): Quat;
    GetTranslation(): Vec3;
    Equals(inV: Mat44): boolean;
    NotEquals(inV: Mat44): boolean;
    IsClose(inM: Mat44, inMaxDistSq?: number): boolean;
    Add(inM: Mat44): Mat44;
    MulFloat(inV: number): Mat44;
    MulMat44(inM: Mat44): Mat44;
    MulVec3(inV: Vec3): Vec3;
    MulVec4(inV: Vec4): Vec4;
    AddMat44(inM: Mat44): Mat44;
    SubMat44(inM: Mat44): Mat44;
    Multiply3x3(inV: Vec3): Vec3;
    Multiply3x3Transposed(inV: Vec3): Vec3;
    Multiply3x3LeftTransposed(inM: Mat44): Mat44;
    Multiply3x3RightTransposed(inM: Mat44): Mat44;
    Transposed(): Mat44;
    Transposed3x3(): Mat44;
    Inversed(): Mat44;
    InversedRotationTranslation(): Mat44;
    Adjointed3x3(): Mat44;
    SetInversed3x3(inM: Mat44): boolean;
    GetDeterminant3x3(): number;
    Inversed3x3(): Mat44;
    GetDirectionPreservingMatrix(): Mat44;
    PreTranslated(inTranslation: Vec3): Mat44;
    PostTranslated(inTranslation: Vec3): Mat44;
    PreScaled(inScale: Vec3): Mat44;
    PostScaled(inScale: Vec3): Mat44;
    Decompose(outScale: Vec3): Mat44;
    SetColumn3(inCol: number, inV: Vec3): void;
    SetColumn4(inCol: number, inV: Vec4): void;
    SetAxisX(inV: Vec3): void;
    SetAxisY(inV: Vec3): void;
    SetAxisZ(inV: Vec3): void;
    SetDiagonal3(inV: Vec3): void;
    SetDiagonal4(inV: Vec4): void;
    SetTranslation(inV: Vec3): void;
    GetColumn3(inCol: number): Vec3;
    GetColumn4(inCol: number): Vec4;
  }
  class RMat44 {
    constructor();
    sZero(): RMat44;
    sIdentity(): RMat44;
    sRotation(inQ: Quat): RMat44;
    sTranslation(inTranslation: RVec3): RMat44;
    sRotationTranslation(inRotation: Quat, inTranslation: RVec3): RMat44;
    sInverseRotationTranslation(inRotation: Quat, inTranslation: RVec3): RMat44;
    ToMat44(): Mat44;
    Equals(inV: RMat44): boolean;
    NotEquals(inV: RMat44): boolean;
    MulVec3(inV: Vec3): RVec3;
    MulRVec3(inV: RVec3): RVec3;
    MulMat44(inM: Mat44): RMat44;
    MulRMat44(inM: RMat44): RMat44;
    GetAxisX(): Vec3;
    GetAxisY(): Vec3;
    GetAxisZ(): Vec3;
    GetRotation(): Mat44;
    SetRotation(inRotation: Mat44): void;
    GetQuaternion(): Quat;
    GetTranslation(): RVec3;
    IsClose(inM: RMat44, inMaxDistSq?: number): boolean;
    Multiply3x3(inV: Vec3): Vec3;
    Multiply3x3Transposed(inV: Vec3): Vec3;
    Transposed3x3(): Mat44;
    Inversed(): RMat44;
    InversedRotationTranslation(): RMat44;
    PreTranslated(inTranslation: Vec3): RMat44;
    PostTranslated(inTranslation: Vec3): RMat44;
    PreScaled(inScale: Vec3): RMat44;
    PostScaled(inScale: Vec3): RMat44;
    GetDirectionPreservingMatrix(): Mat44;
    SetColumn3(inCol: number, inV: Vec3): void;
    GetColumn3(inCol: number): Vec3;
    SetAxisX(inV: Vec3): void;
    SetAxisY(inV: Vec3): void;
    SetAxisZ(inV: Vec3): void;
    SetTranslation(inV: RVec3): void;
    SetColumn4(inCol: number, inV: Vec4): void;
    GetColumn4(inCol: number): Vec4;
    Decompose(outScale: Vec3): RMat44;
  }
  class AABox {
    constructor();
    constructor(inMin: Vec3, inMax: Vec3);
    sBiggest(): AABox;
    sFromTwoPoints(inP1: Vec3, inP2: Vec3): AABox;
    sFromTriangle(inVertices: VertexList, inTriangle: IndexedTriangle): AABox;
    Equals(inB: AABox): boolean;
    NotEquals(inB: AABox): boolean;
    SetEmpty(): void;
    IsValid(): boolean;
    EncapsulateVec3(inV: Vec3): void;
    EncapsulateAABox(inBox: AABox): void;
    EncapsulateTriangle(inTriangle: Triangle): void;
    EncapsulateIndexedTriangle(
      inVertices: VertexList,
      inTriangle: IndexedTriangle
    ): void;
    Intersect(inOther: AABox): AABox;
    EnsureMinimalEdgeLength(inMinEdgeLength: number): void;
    ExpandBy(inV: Vec3): void;
    GetCenter(): Vec3;
    GetExtent(): Vec3;
    GetSize(): Vec3;
    GetSurfaceArea(): number;
    GetVolume(): number;
    ContainsVec3(inOther: Vec3): boolean;
    ContainsRVec3(inOther: RVec3): boolean;
    OverlapsAABox(inOther: AABox): boolean;
    OverlapsPlane(inOther: AABox): boolean;
    TranslateVec3(inOther: Vec3): void;
    TranslateRVec3(inOther: RVec3): void;
    TransformedMat44(inOther: Mat44): AABox;
    TransformedRMat44(inOther: RMat44): AABox;
    Scaled(inScale: Vec3): AABox;
    GetClosestPoint(inV: Vec3): Vec3;
    GetSqDistanceTo(inV: Vec3): number;
    get_mMin(): Vec3;
    set_mMin(mMin: Vec3): void;
    mMin: Vec3;
    get_mMax(): Vec3;
    set_mMax(mMax: Vec3): void;
    mMax: Vec3;
  }
  class OrientedBox {
    constructor();
    constructor(inOrientation: Mat44, inHalfExtents: Vec3);
    get_mOrientation(): Mat44;
    set_mOrientation(mOrientation: Mat44): void;
    mOrientation: Mat44;
    get_mHalfExtents(): Vec3;
    set_mHalfExtents(mHalfExtents: Vec3): void;
    mHalfExtents: Vec3;
  }
  class RayCast {
    constructor();
    constructor(inOrigin: Vec3, inDirection: Vec3);
    Transformed(inTransform: Mat44): RayCast;
    Translated(inTranslation: Vec3): RayCast;
    GetPointOnRay(inFraction: number): Vec3;
    get_mOrigin(): Vec3;
    set_mOrigin(mOrigin: Vec3): void;
    mOrigin: Vec3;
    get_mDirection(): Vec3;
    set_mDirection(mDirection: Vec3): void;
    mDirection: Vec3;
  }
  class RRayCast {
    constructor();
    constructor(inOrigin: RVec3, inDirection: Vec3);
    Transformed(inTransform: RMat44): RRayCast;
    Translated(inTranslation: RVec3): RRayCast;
    GetPointOnRay(inFraction: number): RVec3;
    get_mOrigin(): RVec3;
    set_mOrigin(mOrigin: RVec3): void;
    mOrigin: RVec3;
    get_mDirection(): Vec3;
    set_mDirection(mDirection: Vec3): void;
    mDirection: Vec3;
  }
  class BroadPhaseCastResult {
    constructor();
    Reset(): void;
    get_mBodyID(): BodyID;
    set_mBodyID(mBodyID: BodyID): void;
    mBodyID: BodyID;
    get_mFraction(): number;
    set_mFraction(mFraction: number): void;
    mFraction: number;
  }
  class RayCastResult extends BroadPhaseCastResult {
    constructor();
    get_mSubShapeID2(): SubShapeID;
    set_mSubShapeID2(mSubShapeID2: SubShapeID): void;
    mSubShapeID2: SubShapeID;
  }
  class AABoxCast {
    constructor();
    get_mBox(): AABox;
    set_mBox(mBox: AABox): void;
    mBox: AABox;
    get_mDirection(): Vec3;
    set_mDirection(mDirection: Vec3): void;
    mDirection: Vec3;
  }
  class ShapeCast {
    constructor(
      inShape: Shape,
      inScale: Vec3,
      inCenterOfMassStart: Mat44,
      inDirection: Vec3
    );
    get_mShape(): Shape;
    set_mShape(mShape: Shape): void;
    readonly mShape: Shape;
    get_mScale(): Vec3;
    set_mScale(mScale: Vec3): void;
    readonly mScale: Vec3;
    get_mCenterOfMassStart(): Mat44;
    set_mCenterOfMassStart(mCenterOfMassStart: Mat44): void;
    readonly mCenterOfMassStart: Mat44;
    get_mDirection(): Vec3;
    set_mDirection(mDirection: Vec3): void;
    readonly mDirection: Vec3;
    GetPointOnRay(inFraction: number): Vec3;
  }
  class RShapeCast {
    constructor(
      inShape: Shape,
      inScale: Vec3,
      inCenterOfMassStart: RMat44,
      inDirection: Vec3
    );
    get_mShape(): Shape;
    set_mShape(mShape: Shape): void;
    readonly mShape: Shape;
    get_mScale(): Vec3;
    set_mScale(mScale: Vec3): void;
    readonly mScale: Vec3;
    get_mCenterOfMassStart(): RMat44;
    set_mCenterOfMassStart(mCenterOfMassStart: RMat44): void;
    readonly mCenterOfMassStart: RMat44;
    get_mDirection(): Vec3;
    set_mDirection(mDirection: Vec3): void;
    readonly mDirection: Vec3;
    GetPointOnRay(inFraction: number): RVec3;
  }
  class Plane {
    constructor(inNormal: Vec3, inConstant: number);
    GetNormal(): Vec3;
    SetNormal(inNormal: Vec3): void;
    GetConstant(): number;
    SetConstant(inConstant: number): void;
    sFromPointAndNormal(inPoint: Vec3, inNormal: Vec3): Plane;
    sFromPointsCCW(inPoint1: Vec3, inPoint2: Vec3, inPoint3: Vec3): Plane;
    Offset(inDistance: number): Plane;
    Scaled(inScale: Vec3): Plane;
    GetTransformed(inTransform: Mat44): Plane;
    ProjectPointOnPlane(inPoint: Vec3): Vec3;
    SignedDistance(inPoint: Vec3): number;
  }
  class TransformedShape {
    constructor();
    CastRay(inRay: RRayCast, ioHit: RayCastResult): void;
    CastRay(
      inRay: RRayCast,
      inRayCastSettings: RayCastSettings,
      ioCollector: CastRayCollector,
      inShapeFilter: ShapeFilter
    ): void;
    CollidePoint(
      inPoint: RVec3,
      ioCollector: CollidePointCollector,
      inShapeFilter: ShapeFilter
    ): void;
    CollideShape(
      inShape: Shape,
      inShapeScale: Vec3,
      inCenterOfMassTransform: RMat44,
      inCollideShapeSettings: CollideShapeSettings,
      inBaseOffset: RVec3,
      ioCollector: CollideShapeCollector,
      inShapeFilter: ShapeFilter
    ): void;
    CastShape(
      inShapeCast: RShapeCast,
      inShapeCastSettings: ShapeCastSettings,
      inBaseOffset: RVec3,
      ioCollector: CastShapeCollector,
      inShapeFilter: ShapeFilter
    ): void;
    CollectTransformedShapes(
      inBox: AABox,
      ioCollector: TransformedShapeCollector,
      inShapeFilter: ShapeFilter
    ): void;
    GetShapeScale(): Vec3;
    SetShapeScale(inScale: Vec3): void;
    GetCenterOfMassTransform(): RMat44;
    GetInverseCenterOfMassTransform(): RMat44;
    SetWorldTransform(inPosition: RVec3, inRotation: Quat, inScale: Vec3): void;
    SetWorldTransform(inTransform: RMat44): void;
    GetWorldTransform(): RMat44;
    GetWorldSpaceBounds(): AABox;
    GetWorldSpaceSurfaceNormal(
      inSubShapeID: SubShapeID,
      inPosition: RVec3
    ): Vec3;
    GetMaterial(inSubShapeID: SubShapeID): PhysicsMaterial;
    get_mShapePositionCOM(): RVec3;
    set_mShapePositionCOM(mShapePositionCOM: RVec3): void;
    mShapePositionCOM: RVec3;
    get_mShapeRotation(): Quat;
    set_mShapeRotation(mShapeRotation: Quat): void;
    mShapeRotation: Quat;
    get_mShape(): Shape;
    set_mShape(mShape: Shape): void;
    mShape: Shape;
    get_mShapeScale(): Float3;
    set_mShapeScale(mShapeScale: Float3): void;
    mShapeScale: Float3;
    get_mBodyID(): BodyID;
    set_mBodyID(mBodyID: BodyID): void;
    mBodyID: BodyID;
  }
  class PhysicsMaterial {
    constructor();
    GetRefCount(): number;
    AddRef(): void;
    Release(): void;
  }
  class PhysicsMaterialList {
    constructor();
    empty(): boolean;
    size(): number;
    at(inIndex: number): PhysicsMaterial;
    push_back(inMaterial: PhysicsMaterial): void;
    reserve(inSize: number): void;
    resize(inSize: number): void;
    clear(): void;
  }
  class Triangle {
    constructor();
    constructor(
      inV1: Vec3,
      inV2: Vec3,
      inV3: Vec3,
      inMaterialIndex?: number,
      inUserData?: number
    );
    get_mV(index: number): Float3;
    set_mV(index: number, mV: Float3): void;
    mV: Float3;
    get_mMaterialIndex(): number;
    set_mMaterialIndex(mMaterialIndex: number): void;
    mMaterialIndex: number;
    get_mUserData(): number;
    set_mUserData(mUserData: number): void;
    mUserData: number;
  }
  class TriangleList {
    constructor();
    empty(): boolean;
    size(): number;
    at(inIndex: number): Triangle;
    push_back(inTriangle: Triangle): void;
    reserve(inSize: number): void;
    resize(inSize: number): void;
    clear(): void;
  }
  class VertexList {
    constructor();
    empty(): boolean;
    size(): number;
    at(inIndex: number): Float3;
    push_back(inVertex: Float3): void;
    reserve(inSize: number): void;
    resize(inSize: number): void;
    clear(): void;
  }
  class IndexedTriangle {
    constructor();
    constructor(
      inI1: number,
      inI2: number,
      inI3: number,
      inMaterialIndex: number,
      inUserData?: number
    );
    get_mIdx(index: number): number;
    set_mIdx(index: number, mIdx: number): void;
    mIdx: number;
    get_mMaterialIndex(): number;
    set_mMaterialIndex(mMaterialIndex: number): void;
    mMaterialIndex: number;
    get_mUserData(): number;
    set_mUserData(mUserData: number): void;
    mUserData: number;
  }
  class IndexedTriangleList {
    constructor();
    empty(): boolean;
    size(): number;
    at(inIndex: number): IndexedTriangle;
    push_back(inTriangle: IndexedTriangle): void;
    reserve(inSize: number): void;
    resize(inSize: number): void;
    clear(): void;
  }
  class ShapeResult {
    IsValid(): boolean;
    HasError(): boolean;
    GetError(): JPHString;
    Get(): Shape;
    Clear(): void;
  }
  class ShapeSettings {
    GetRefCount(): number;
    AddRef(): void;
    Release(): void;
    Create(): ShapeResult;
    ClearCachedResult(): void;
    get_mUserData(): number;
    set_mUserData(mUserData: number): void;
    mUserData: number;
  }
  class Shape {
    GetRefCount(): number;
    AddRef(): void;
    Release(): void;
    GetType(): EShapeType;
    GetSubType(): EShapeSubType;
    MustBeStatic(): boolean;
    GetLocalBounds(): AABox;
    GetWorldSpaceBounds(inCenterOfMassTransform: Mat44, inScale: Vec3): AABox;
    GetCenterOfMass(): Vec3;
    GetUserData(): number;
    SetUserData(inUserData: number): void;
    GetSubShapeIDBitsRecursive(): number;
    GetInnerRadius(): number;
    GetMassProperties(): MassProperties;
    GetLeafShape(inSubShapeID: SubShapeID, outRemainder: SubShapeID): Shape;
    GetMaterial(inSubShapeID: SubShapeID): PhysicsMaterial;
    GetSurfaceNormal(
      inSubShapeID: SubShapeID,
      inLocalSurfacePosition: Vec3
    ): Vec3;
    GetSubShapeUserData(inSubShapeID: SubShapeID): number;
    GetSubShapeTransformedShape(
      inSubShapeID: SubShapeID,
      inPositionCOM: Vec3,
      inRotation: Quat,
      inScale: Vec3,
      outRemainder: SubShapeID
    ): TransformedShape;
    GetVolume(): number;
    IsValidScale(inScale: Vec3): boolean;
    MakeScaleValid(inScale: Vec3): Vec3;
    ScaleShape(inScale: Vec3): ShapeResult;
  }
  class ShapeGetTriangles {
    constructor(
      inShape: Shape,
      inBox: AABox,
      inPositionCOM: Vec3,
      inRotation: Quat,
      inScale: Vec3
    );
    GetNumTriangles(): number;
    GetVerticesSize(): number;
    GetVerticesData(): any;
    GetMaterial(inTriangle: number): PhysicsMaterial;
  }
  class ConvexShapeSettings extends ShapeSettings {
    get_mMaterial(): PhysicsMaterial;
    set_mMaterial(mMaterial: PhysicsMaterial): void;
    mMaterial: PhysicsMaterial;
    get_mDensity(): number;
    set_mDensity(mDensity: number): void;
    mDensity: number;
  }
  class ConvexShape extends Shape {
    SetMaterial(inMaterial: PhysicsMaterial): void;
    GetDensity(): number;
    SetDensity(inDensity: number): void;
  }
  class SphereShapeSettings extends ConvexShapeSettings {
    constructor(inRadius: number, inMaterial?: PhysicsMaterial);
    get_mRadius(): number;
    set_mRadius(mRadius: number): void;
    mRadius: number;
  }
  class SphereShape extends ConvexShape {
    constructor(inRadius: number, inMaterial?: PhysicsMaterial);
    GetRadius(): number;
  }
  class BoxShapeSettings extends ConvexShapeSettings {
    constructor(
      inHalfExtent: Vec3,
      inConvexRadius?: number,
      inMaterial?: PhysicsMaterial
    );
    get_mHalfExtent(): Vec3;
    set_mHalfExtent(mHalfExtent: Vec3): void;
    mHalfExtent: Vec3;
    get_mConvexRadius(): number;
    set_mConvexRadius(mConvexRadius: number): void;
    mConvexRadius: number;
  }
  class BoxShape extends ConvexShape {
    constructor(
      inHalfExtent: Vec3,
      inConvexRadius?: number,
      inMaterial?: PhysicsMaterial
    );
    GetHalfExtent(): Vec3;
  }
  class CylinderShapeSettings extends ConvexShapeSettings {
    constructor(
      inHalfHeight: number,
      inRadius: number,
      inConvexRadius?: number,
      inMaterial?: PhysicsMaterial
    );
    get_mHalfHeight(): number;
    set_mHalfHeight(mHalfHeight: number): void;
    mHalfHeight: number;
    get_mRadius(): number;
    set_mRadius(mRadius: number): void;
    mRadius: number;
    get_mConvexRadius(): number;
    set_mConvexRadius(mConvexRadius: number): void;
    mConvexRadius: number;
  }
  class CylinderShape extends ConvexShape {
    constructor(
      inHalfHeight: number,
      inRadius: number,
      inConvexRadius: number,
      inMaterial?: PhysicsMaterial
    );
    GetRadius(): number;
    GetHalfHeight(): number;
  }
  class TaperedCylinderShapeSettings extends ConvexShapeSettings {
    constructor(
      inHalfHeightOfTaperedCylinder: number,
      inTopRadius: number,
      inBottomRadius: number,
      inConvexRadius?: number,
      inMaterial?: PhysicsMaterial
    );
    get_mHalfHeight(): number;
    set_mHalfHeight(mHalfHeight: number): void;
    mHalfHeight: number;
    get_mTopRadius(): number;
    set_mTopRadius(mTopRadius: number): void;
    mTopRadius: number;
    get_mBottomRadius(): number;
    set_mBottomRadius(mBottomRadius: number): void;
    mBottomRadius: number;
    get_mConvexRadius(): number;
    set_mConvexRadius(mConvexRadius: number): void;
    mConvexRadius: number;
  }
  class TaperedCylinderShape extends ConvexShape {
    GetHalfHeight(): number;
    GetTopRadius(): number;
    GetBottomRadius(): number;
    GetConvexRadius(): number;
  }
  class CapsuleShapeSettings extends ConvexShapeSettings {
    constructor(
      inHalfHeight: number,
      inRadius: number,
      inMaterial?: PhysicsMaterial
    );
    get_mRadius(): number;
    set_mRadius(mRadius: number): void;
    mRadius: number;
    get_mHalfHeightOfCylinder(): number;
    set_mHalfHeightOfCylinder(mHalfHeightOfCylinder: number): void;
    mHalfHeightOfCylinder: number;
  }
  class CapsuleShape extends ConvexShape {
    constructor(
      inHalfHeight: number,
      inRadius: number,
      inMaterial?: PhysicsMaterial
    );
    GetRadius(): number;
    GetHalfHeightOfCylinder(): number;
  }
  class TaperedCapsuleShapeSettings extends ConvexShapeSettings {
    constructor(
      inHalfHeightOfTaperedCylinder: number,
      inTopRadius: number,
      inBottomRadius: number,
      inMaterial?: PhysicsMaterial
    );
    get_mHalfHeightOfTaperedCylinder(): number;
    set_mHalfHeightOfTaperedCylinder(
      mHalfHeightOfTaperedCylinder: number
    ): void;
    mHalfHeightOfTaperedCylinder: number;
    get_mTopRadius(): number;
    set_mTopRadius(mTopRadius: number): void;
    mTopRadius: number;
    get_mBottomRadius(): number;
    set_mBottomRadius(mBottomRadius: number): void;
    mBottomRadius: number;
  }
  class TaperedCapsuleShape extends ConvexShape {
    GetHalfHeight(): number;
    GetTopRadius(): number;
    GetBottomRadius(): number;
  }
  class ConvexHullShapeSettings extends ConvexShapeSettings {
    constructor();
    get_mPoints(): ArrayVec3;
    set_mPoints(mPoints: ArrayVec3): void;
    mPoints: ArrayVec3;
    get_mMaxConvexRadius(): number;
    set_mMaxConvexRadius(mMaxConvexRadius: number): void;
    mMaxConvexRadius: number;
    get_mMaxErrorConvexRadius(): number;
    set_mMaxErrorConvexRadius(mMaxErrorConvexRadius: number): void;
    mMaxErrorConvexRadius: number;
    get_mHullTolerance(): number;
    set_mHullTolerance(mHullTolerance: number): void;
    mHullTolerance: number;
  }
  class ConvexHullShape extends ConvexShape {}
  class CompoundShapeSettings extends ShapeSettings {
    AddShape(
      inPosition: Vec3,
      inRotation: Quat,
      inShape: ShapeSettings,
      inUserData: number
    ): void;
  }
  class CompoundShapeSubShape {
    GetPositionCOM(): Vec3;
    GetRotation(): Quat;
    get_mShape(): Shape;
    set_mShape(mShape: Shape): void;
    mShape: Shape;
    get_mUserData(): number;
    set_mUserData(mUserData: number): void;
    mUserData: number;
  }
  class CompoundShape extends Shape {
    GetNumSubShapes(): number;
    GetSubShape(inIdx: number): CompoundShapeSubShape;
  }
  class StaticCompoundShapeSettings extends CompoundShapeSettings {
    constructor();
  }
  class StaticCompoundShape extends CompoundShape {}
  class MutableCompoundShapeSettings extends CompoundShapeSettings {
    constructor();
  }
  class MutableCompoundShape extends CompoundShape {
    AddShape(
      inPosition: Vec3,
      inRotation: Quat,
      inShape: Shape,
      inUserData: number,
      inIndex?: number
    ): number;
    RemoveShape(inIndex: number): void;
    ModifyShape(inIndex: number, inPosition: Vec3, inRotation: Quat): void;
    ModifyShape(
      inIndex: number,
      inPosition: Vec3,
      inRotation: Quat,
      inShape: Shape
    ): void;
    ModifyShapes(
      inStartIndex: number,
      inNumber: number,
      inPositions: Vec3MemRef,
      inRotations: QuatMemRef
    ): void;
    AdjustCenterOfMass(): void;
  }
  class DecoratedShapeSettings extends ShapeSettings {}
  class DecoratedShape extends Shape {
    GetInnerShape(): Shape;
  }
  class ScaledShapeSettings extends DecoratedShapeSettings {
    constructor(inShape: ShapeSettings, inScale: Vec3);
    get_mScale(): Vec3;
    set_mScale(mScale: Vec3): void;
    mScale: Vec3;
  }
  class ScaledShape extends DecoratedShape {
    constructor(inShape: Shape, inScale: Vec3);
    GetScale(): Vec3;
  }
  class OffsetCenterOfMassShapeSettings extends DecoratedShapeSettings {
    constructor(inOffset: Vec3, inShape: ShapeSettings);
    get_mOffset(): Vec3;
    set_mOffset(mOffset: Vec3): void;
    mOffset: Vec3;
  }
  class OffsetCenterOfMassShape extends DecoratedShape {
    constructor(inShape: Shape, inOffset: Vec3);
  }
  class RotatedTranslatedShapeSettings extends DecoratedShapeSettings {
    constructor(inPosition: Vec3, inRotation: Quat, inShape: ShapeSettings);
    get_mPosition(): Vec3;
    set_mPosition(mPosition: Vec3): void;
    mPosition: Vec3;
    get_mRotation(): Quat;
    set_mRotation(mRotation: Quat): void;
    mRotation: Quat;
  }
  class RotatedTranslatedShape extends DecoratedShape {
    GetRotation(): Quat;
    GetPosition(): Vec3;
  }
  class MeshShapeSettings extends ShapeSettings {
    constructor();
    constructor(
      inTriangleList: TriangleList,
      inMaterialList?: PhysicsMaterialList
    );
    constructor(
      inVertices: VertexList,
      inTriangles: IndexedTriangleList,
      inMaterialList: PhysicsMaterialList
    );
    Sanitize(): void;
    get_mTriangleVertices(): VertexList;
    set_mTriangleVertices(mTriangleVertices: VertexList): void;
    mTriangleVertices: VertexList;
    get_mIndexedTriangles(): IndexedTriangleList;
    set_mIndexedTriangles(mIndexedTriangles: IndexedTriangleList): void;
    mIndexedTriangles: IndexedTriangleList;
    get_mMaterials(): PhysicsMaterialList;
    set_mMaterials(mMaterials: PhysicsMaterialList): void;
    mMaterials: PhysicsMaterialList;
    get_mMaxTrianglesPerLeaf(): number;
    set_mMaxTrianglesPerLeaf(mMaxTrianglesPerLeaf: number): void;
    mMaxTrianglesPerLeaf: number;
    get_mActiveEdgeCosThresholdAngle(): number;
    set_mActiveEdgeCosThresholdAngle(
      mActiveEdgeCosThresholdAngle: number
    ): void;
    mActiveEdgeCosThresholdAngle: number;
    get_mPerTriangleUserData(): boolean;
    set_mPerTriangleUserData(mPerTriangleUserData: boolean): void;
    mPerTriangleUserData: boolean;
  }
  class MeshShape extends Shape {
    GetTriangleUserData(inSubShapeID: SubShapeID): number;
  }
  class HeightFieldShapeConstantValues {
    get_cNoCollisionValue(): number;
    set_cNoCollisionValue(cNoCollisionValue: number): void;
    readonly cNoCollisionValue: number;
  }
  class HeightFieldShapeSettings extends ShapeSettings {
    constructor();
    get_mOffset(): Vec3;
    set_mOffset(mOffset: Vec3): void;
    mOffset: Vec3;
    get_mScale(): Vec3;
    set_mScale(mScale: Vec3): void;
    mScale: Vec3;
    get_mSampleCount(): number;
    set_mSampleCount(mSampleCount: number): void;
    mSampleCount: number;
    get_mMinHeightValue(): number;
    set_mMinHeightValue(mMinHeightValue: number): void;
    mMinHeightValue: number;
    get_mMaxHeightValue(): number;
    set_mMaxHeightValue(mMaxHeightValue: number): void;
    mMaxHeightValue: number;
    get_mMaterialsCapacity(): number;
    set_mMaterialsCapacity(mMaterialsCapacity: number): void;
    mMaterialsCapacity: number;
    get_mBlockSize(): number;
    set_mBlockSize(mBlockSize: number): void;
    mBlockSize: number;
    get_mBitsPerSample(): number;
    set_mBitsPerSample(mBitsPerSample: number): void;
    mBitsPerSample: number;
    get_mHeightSamples(): ArrayFloat;
    set_mHeightSamples(mHeightSamples: ArrayFloat): void;
    mHeightSamples: ArrayFloat;
    get_mMaterialIndices(): ArrayUint8;
    set_mMaterialIndices(mMaterialIndices: ArrayUint8): void;
    mMaterialIndices: ArrayUint8;
    get_mMaterials(): PhysicsMaterialList;
    set_mMaterials(mMaterials: PhysicsMaterialList): void;
    mMaterials: PhysicsMaterialList;
    get_mActiveEdgeCosThresholdAngle(): number;
    set_mActiveEdgeCosThresholdAngle(
      mActiveEdgeCosThresholdAngle: number
    ): void;
    mActiveEdgeCosThresholdAngle: number;
  }
  class HeightFieldShape extends Shape {
    GetSampleCount(): number;
    GetBlockSize(): number;
    GetPosition(inX: number, inY: number): Vec3;
    IsNoCollision(inX: number, inY: number): boolean;
    GetMinHeightValue(): number;
    GetMaxHeightValue(): number;
    GetHeights(
      inX: number,
      inY: number,
      inSizeX: number,
      inSizeY: number,
      outHeights: FloatMemRef,
      inHeightsStride: number
    ): void;
    SetHeights(
      inX: number,
      inY: number,
      inSizeX: number,
      inSizeY: number,
      inHeights: FloatMemRef,
      inHeightsStride: number,
      inAllocator: TempAllocator,
      inActiveEdgeCosThresholdAngle?: number
    ): void;
    GetMaterials(
      inX: number,
      inY: number,
      inSizeX: number,
      inSizeY: number,
      outMaterials: Uint8MemRef,
      inMaterialsStride: number
    ): void;
    SetMaterials(
      inX: number,
      inY: number,
      inSizeX: number,
      inSizeY: number,
      inMaterials: Uint8MemRef,
      inMaterialsStride: number,
      inMaterialList: PhysicsMaterialList,
      inAllocator: TempAllocator
    ): boolean;
  }
  class PlaneShapeSettings extends ShapeSettings {
    constructor(
      inPlane: Plane,
      inMaterial?: PhysicsMaterial,
      inHalfExtent?: number
    );
    get_mPlane(): Plane;
    set_mPlane(mPlane: Plane): void;
    mPlane: Plane;
    get_mMaterial(): PhysicsMaterial;
    set_mMaterial(mMaterial: PhysicsMaterial): void;
    mMaterial: PhysicsMaterial;
    get_mHalfExtent(): number;
    set_mHalfExtent(mHalfExtent: number): void;
    mHalfExtent: number;
  }
  class PlaneShape extends Shape {
    constructor(
      inPlane: Plane,
      inMaterial?: PhysicsMaterial,
      inHalfExtent?: number
    );
    SetMaterial(inMaterial: PhysicsMaterial): void;
    GetPlane(): Plane;
    GetHalfExtent(): number;
  }
  class EmptyShapeSettings extends ShapeSettings {
    constructor();
    get_mCenterOfMass(): Vec3;
    set_mCenterOfMass(mCenterOfMass: Vec3): void;
    mCenterOfMass: Vec3;
  }
  class EmptyShape extends Shape {
    constructor(inCenterOfMass?: Vec3);
  }
  class ConstraintSettings {
    GetRefCount(): number;
    AddRef(): void;
    Release(): void;
    get_mEnabled(): boolean;
    set_mEnabled(mEnabled: boolean): void;
    mEnabled: boolean;
    get_mNumVelocityStepsOverride(): number;
    set_mNumVelocityStepsOverride(mNumVelocityStepsOverride: number): void;
    mNumVelocityStepsOverride: number;
    get_mNumPositionStepsOverride(): number;
    set_mNumPositionStepsOverride(mNumPositionStepsOverride: number): void;
    mNumPositionStepsOverride: number;
  }
  class Constraint {
    GetRefCount(): number;
    AddRef(): void;
    Release(): void;
    GetType(): EConstraintType;
    GetSubType(): EConstraintSubType;
    GetConstraintPriority(): number;
    SetConstraintPriority(inPriority: number): void;
    SetNumVelocityStepsOverride(inN: number): void;
    GetNumVelocityStepsOverride(): number;
    SetNumPositionStepsOverride(inN: number): void;
    GetNumPositionStepsOverride(): number;
    SetEnabled(inEnabled: boolean): void;
    GetEnabled(): boolean;
    IsActive(): boolean;
    GetUserData(): number;
    SetUserData(inUserData: number): void;
    ResetWarmStart(): void;
    SaveState(inStream: StateRecorder): void;
    RestoreState(inStream: StateRecorder): void;
  }
  class TwoBodyConstraintSettings extends ConstraintSettings {
    Create(inBody1: Body, inBody2: Body): Constraint;
  }
  class TwoBodyConstraint extends Constraint {
    GetBody1(): Body;
    GetBody2(): Body;
    GetConstraintToBody1Matrix(): Mat44;
    GetConstraintToBody2Matrix(): Mat44;
  }
  class FixedConstraintSettings extends TwoBodyConstraintSettings {
    constructor();
    get_mSpace(): EConstraintSpace;
    set_mSpace(mSpace: EConstraintSpace): void;
    mSpace: EConstraintSpace;
    get_mAutoDetectPoint(): boolean;
    set_mAutoDetectPoint(mAutoDetectPoint: boolean): void;
    mAutoDetectPoint: boolean;
    get_mPoint1(): RVec3;
    set_mPoint1(mPoint1: RVec3): void;
    mPoint1: RVec3;
    get_mAxisX1(): Vec3;
    set_mAxisX1(mAxisX1: Vec3): void;
    mAxisX1: Vec3;
    get_mAxisY1(): Vec3;
    set_mAxisY1(mAxisY1: Vec3): void;
    mAxisY1: Vec3;
    get_mPoint2(): RVec3;
    set_mPoint2(mPoint2: RVec3): void;
    mPoint2: RVec3;
    get_mAxisX2(): Vec3;
    set_mAxisX2(mAxisX2: Vec3): void;
    mAxisX2: Vec3;
    get_mAxisY2(): Vec3;
    set_mAxisY2(mAxisY2: Vec3): void;
    mAxisY2: Vec3;
  }
  class SpringSettings {
    constructor();
    HasStiffness(): boolean;
    get_mMode(): ESpringMode;
    set_mMode(mMode: ESpringMode): void;
    mMode: ESpringMode;
    get_mFrequency(): number;
    set_mFrequency(mFrequency: number): void;
    mFrequency: number;
    get_mStiffness(): number;
    set_mStiffness(mStiffness: number): void;
    mStiffness: number;
    get_mDamping(): number;
    set_mDamping(mDamping: number): void;
    mDamping: number;
  }
  class MotorSettings {
    constructor();
    get_mSpringSettings(): SpringSettings;
    set_mSpringSettings(mSpringSettings: SpringSettings): void;
    mSpringSettings: SpringSettings;
    get_mMinForceLimit(): number;
    set_mMinForceLimit(mMinForceLimit: number): void;
    mMinForceLimit: number;
    get_mMaxForceLimit(): number;
    set_mMaxForceLimit(mMaxForceLimit: number): void;
    mMaxForceLimit: number;
    get_mMinTorqueLimit(): number;
    set_mMinTorqueLimit(mMinTorqueLimit: number): void;
    mMinTorqueLimit: number;
    get_mMaxTorqueLimit(): number;
    set_mMaxTorqueLimit(mMaxTorqueLimit: number): void;
    mMaxTorqueLimit: number;
  }
  class DistanceConstraintSettings extends TwoBodyConstraintSettings {
    constructor();
    get_mSpace(): EConstraintSpace;
    set_mSpace(mSpace: EConstraintSpace): void;
    mSpace: EConstraintSpace;
    get_mPoint1(): RVec3;
    set_mPoint1(mPoint1: RVec3): void;
    mPoint1: RVec3;
    get_mPoint2(): RVec3;
    set_mPoint2(mPoint2: RVec3): void;
    mPoint2: RVec3;
    get_mMinDistance(): number;
    set_mMinDistance(mMinDistance: number): void;
    mMinDistance: number;
    get_mMaxDistance(): number;
    set_mMaxDistance(mMaxDistance: number): void;
    mMaxDistance: number;
    get_mLimitsSpringSettings(): SpringSettings;
    set_mLimitsSpringSettings(mLimitsSpringSettings: SpringSettings): void;
    mLimitsSpringSettings: SpringSettings;
  }
  class DistanceConstraint extends TwoBodyConstraint {
    SetDistance(inMinDistance: number, inMaxDistance: number): void;
    GetMinDistance(): number;
    GetMaxDistance(): number;
    GetLimitsSpringSettings(): SpringSettings;
    SetLimitsSpringSettings(inSettings: SpringSettings): void;
    GetTotalLambdaPosition(): number;
  }
  class PointConstraintSettings extends TwoBodyConstraintSettings {
    constructor();
    get_mSpace(): EConstraintSpace;
    set_mSpace(mSpace: EConstraintSpace): void;
    mSpace: EConstraintSpace;
    get_mPoint1(): RVec3;
    set_mPoint1(mPoint1: RVec3): void;
    mPoint1: RVec3;
    get_mPoint2(): RVec3;
    set_mPoint2(mPoint2: RVec3): void;
    mPoint2: RVec3;
  }
  class PointConstraint extends TwoBodyConstraint {
    GetLocalSpacePoint1(): Vec3;
    GetLocalSpacePoint2(): Vec3;
    GetTotalLambdaPosition(): Vec3;
  }
  class HingeConstraintSettings extends TwoBodyConstraintSettings {
    constructor();
    get_mSpace(): EConstraintSpace;
    set_mSpace(mSpace: EConstraintSpace): void;
    mSpace: EConstraintSpace;
    get_mPoint1(): RVec3;
    set_mPoint1(mPoint1: RVec3): void;
    mPoint1: RVec3;
    get_mHingeAxis1(): Vec3;
    set_mHingeAxis1(mHingeAxis1: Vec3): void;
    mHingeAxis1: Vec3;
    get_mNormalAxis1(): Vec3;
    set_mNormalAxis1(mNormalAxis1: Vec3): void;
    mNormalAxis1: Vec3;
    get_mPoint2(): RVec3;
    set_mPoint2(mPoint2: RVec3): void;
    mPoint2: RVec3;
    get_mHingeAxis2(): Vec3;
    set_mHingeAxis2(mHingeAxis2: Vec3): void;
    mHingeAxis2: Vec3;
    get_mNormalAxis2(): Vec3;
    set_mNormalAxis2(mNormalAxis2: Vec3): void;
    mNormalAxis2: Vec3;
    get_mLimitsMin(): number;
    set_mLimitsMin(mLimitsMin: number): void;
    mLimitsMin: number;
    get_mLimitsMax(): number;
    set_mLimitsMax(mLimitsMax: number): void;
    mLimitsMax: number;
    get_mLimitsSpringSettings(): SpringSettings;
    set_mLimitsSpringSettings(mLimitsSpringSettings: SpringSettings): void;
    mLimitsSpringSettings: SpringSettings;
    get_mMaxFrictionTorque(): number;
    set_mMaxFrictionTorque(mMaxFrictionTorque: number): void;
    mMaxFrictionTorque: number;
    get_mMotorSettings(): MotorSettings;
    set_mMotorSettings(mMotorSettings: MotorSettings): void;
    mMotorSettings: MotorSettings;
  }
  class HingeConstraint extends TwoBodyConstraint {
    GetLocalSpacePoint1(): Vec3;
    GetLocalSpacePoint2(): Vec3;
    GetLocalSpaceHingeAxis1(): Vec3;
    GetLocalSpaceHingeAxis2(): Vec3;
    GetLocalSpaceNormalAxis1(): Vec3;
    GetLocalSpaceNormalAxis2(): Vec3;
    GetCurrentAngle(): number;
    SetMaxFrictionTorque(inFrictionTorque: number): void;
    GetMaxFrictionTorque(): number;
    GetMotorSettings(): MotorSettings;
    SetMotorState(inState: EMotorState): void;
    GetMotorState(): EMotorState;
    SetTargetAngularVelocity(inAngularVelocity: number): void;
    GetTargetAngularVelocity(): number;
    SetTargetAngle(inAngle: number): void;
    GetTargetAngle(): number;
    SetLimits(inLimitsMin: number, inLimitsMax: number): void;
    GetLimitsMin(): number;
    GetLimitsMax(): number;
    HasLimits(): boolean;
    GetLimitsSpringSettings(): SpringSettings;
    SetLimitsSpringSettings(inLimitsSpringSettings: SpringSettings): void;
    GetTotalLambdaPosition(): Vec3;
    GetTotalLambdaRotation(): Vector2;
    GetTotalLambdaRotationLimits(): number;
    GetTotalLambdaMotor(): number;
  }
  class ConeConstraintSettings extends TwoBodyConstraintSettings {
    constructor();
    get_mSpace(): EConstraintSpace;
    set_mSpace(mSpace: EConstraintSpace): void;
    mSpace: EConstraintSpace;
    get_mPoint1(): RVec3;
    set_mPoint1(mPoint1: RVec3): void;
    mPoint1: RVec3;
    get_mTwistAxis1(): Vec3;
    set_mTwistAxis1(mTwistAxis1: Vec3): void;
    mTwistAxis1: Vec3;
    get_mPoint2(): RVec3;
    set_mPoint2(mPoint2: RVec3): void;
    mPoint2: RVec3;
    get_mTwistAxis2(): Vec3;
    set_mTwistAxis2(mTwistAxis2: Vec3): void;
    mTwistAxis2: Vec3;
    get_mHalfConeAngle(): number;
    set_mHalfConeAngle(mHalfConeAngle: number): void;
    mHalfConeAngle: number;
  }
  class ConeConstraint extends TwoBodyConstraint {
    SetHalfConeAngle(inHalfConeAngle: number): void;
    GetCosHalfConeAngle(): number;
    GetTotalLambdaPosition(): Vec3;
    GetTotalLambdaRotation(): number;
  }
  class SliderConstraintSettings extends TwoBodyConstraintSettings {
    constructor();
    get_mSpace(): EConstraintSpace;
    set_mSpace(mSpace: EConstraintSpace): void;
    mSpace: EConstraintSpace;
    get_mAutoDetectPoint(): boolean;
    set_mAutoDetectPoint(mAutoDetectPoint: boolean): void;
    mAutoDetectPoint: boolean;
    get_mPoint1(): RVec3;
    set_mPoint1(mPoint1: RVec3): void;
    mPoint1: RVec3;
    get_mSliderAxis1(): Vec3;
    set_mSliderAxis1(mSliderAxis1: Vec3): void;
    mSliderAxis1: Vec3;
    get_mNormalAxis1(): Vec3;
    set_mNormalAxis1(mNormalAxis1: Vec3): void;
    mNormalAxis1: Vec3;
    get_mPoint2(): RVec3;
    set_mPoint2(mPoint2: RVec3): void;
    mPoint2: RVec3;
    get_mSliderAxis2(): Vec3;
    set_mSliderAxis2(mSliderAxis2: Vec3): void;
    mSliderAxis2: Vec3;
    get_mNormalAxis2(): Vec3;
    set_mNormalAxis2(mNormalAxis2: Vec3): void;
    mNormalAxis2: Vec3;
    get_mLimitsMin(): number;
    set_mLimitsMin(mLimitsMin: number): void;
    mLimitsMin: number;
    get_mLimitsMax(): number;
    set_mLimitsMax(mLimitsMax: number): void;
    mLimitsMax: number;
    get_mLimitsSpringSettings(): SpringSettings;
    set_mLimitsSpringSettings(mLimitsSpringSettings: SpringSettings): void;
    mLimitsSpringSettings: SpringSettings;
    get_mMaxFrictionForce(): number;
    set_mMaxFrictionForce(mMaxFrictionForce: number): void;
    mMaxFrictionForce: number;
    get_mMotorSettings(): MotorSettings;
    set_mMotorSettings(mMotorSettings: MotorSettings): void;
    mMotorSettings: MotorSettings;
  }
  class SliderConstraint extends TwoBodyConstraint {
    GetCurrentPosition(): number;
    SetMaxFrictionForce(inFrictionForce: number): void;
    GetMaxFrictionForce(): number;
    GetMotorSettings(): MotorSettings;
    SetMotorState(inState: EMotorState): void;
    GetMotorState(): EMotorState;
    SetTargetVelocity(inVelocity: number): void;
    GetTargetVelocity(): number;
    SetTargetPosition(inPosition: number): void;
    GetTargetPosition(): number;
    SetLimits(inLimitsMin: number, inLimitsMax: number): void;
    GetLimitsMin(): number;
    GetLimitsMax(): number;
    HasLimits(): boolean;
    GetLimitsSpringSettings(): SpringSettings;
    SetLimitsSpringSettings(inLimitsSpringSettings: SpringSettings): void;
    GetTotalLambdaPosition(): Vector2;
    GetTotalLambdaPositionLimits(): number;
    GetTotalLambdaRotation(): Vec3;
    GetTotalLambdaMotor(): number;
  }
  class SwingTwistConstraintSettings extends TwoBodyConstraintSettings {
    constructor();
    get_mSpace(): EConstraintSpace;
    set_mSpace(mSpace: EConstraintSpace): void;
    mSpace: EConstraintSpace;
    get_mPosition1(): RVec3;
    set_mPosition1(mPosition1: RVec3): void;
    mPosition1: RVec3;
    get_mTwistAxis1(): Vec3;
    set_mTwistAxis1(mTwistAxis1: Vec3): void;
    mTwistAxis1: Vec3;
    get_mPlaneAxis1(): Vec3;
    set_mPlaneAxis1(mPlaneAxis1: Vec3): void;
    mPlaneAxis1: Vec3;
    get_mPosition2(): RVec3;
    set_mPosition2(mPosition2: RVec3): void;
    mPosition2: RVec3;
    get_mTwistAxis2(): Vec3;
    set_mTwistAxis2(mTwistAxis2: Vec3): void;
    mTwistAxis2: Vec3;
    get_mPlaneAxis2(): Vec3;
    set_mPlaneAxis2(mPlaneAxis2: Vec3): void;
    mPlaneAxis2: Vec3;
    get_mSwingType(): ESwingType;
    set_mSwingType(mSwingType: ESwingType): void;
    mSwingType: ESwingType;
    get_mNormalHalfConeAngle(): number;
    set_mNormalHalfConeAngle(mNormalHalfConeAngle: number): void;
    mNormalHalfConeAngle: number;
    get_mPlaneHalfConeAngle(): number;
    set_mPlaneHalfConeAngle(mPlaneHalfConeAngle: number): void;
    mPlaneHalfConeAngle: number;
    get_mTwistMinAngle(): number;
    set_mTwistMinAngle(mTwistMinAngle: number): void;
    mTwistMinAngle: number;
    get_mTwistMaxAngle(): number;
    set_mTwistMaxAngle(mTwistMaxAngle: number): void;
    mTwistMaxAngle: number;
    get_mMaxFrictionTorque(): number;
    set_mMaxFrictionTorque(mMaxFrictionTorque: number): void;
    mMaxFrictionTorque: number;
    get_mSwingMotorSettings(): MotorSettings;
    set_mSwingMotorSettings(mSwingMotorSettings: MotorSettings): void;
    mSwingMotorSettings: MotorSettings;
    get_mTwistMotorSettings(): MotorSettings;
    set_mTwistMotorSettings(mTwistMotorSettings: MotorSettings): void;
    mTwistMotorSettings: MotorSettings;
  }
  class SwingTwistConstraint extends TwoBodyConstraint {
    GetLocalSpacePosition1(): Vec3;
    GetLocalSpacePosition2(): Vec3;
    GetConstraintToBody1(): Quat;
    GetConstraintToBody2(): Quat;
    GetNormalHalfConeAngle(): number;
    SetNormalHalfConeAngle(inAngle: number): void;
    GetPlaneHalfConeAngle(): number;
    SetPlaneHalfConeAngle(inAngle: number): void;
    GetTwistMinAngle(): number;
    SetTwistMinAngle(inAngle: number): void;
    GetTwistMaxAngle(): number;
    SetTwistMaxAngle(inAngle: number): void;
    GetSwingMotorSettings(): MotorSettings;
    GetTwistMotorSettings(): MotorSettings;
    SetMaxFrictionTorque(inFrictionTorque: number): void;
    GetMaxFrictionTorque(): number;
    SetSwingMotorState(inState: EMotorState): void;
    GetSwingMotorState(): EMotorState;
    SetTwistMotorState(inState: EMotorState): void;
    GetTwistMotorState(): EMotorState;
    SetTargetAngularVelocityCS(inAngularVelocity: Vec3): void;
    GetTargetAngularVelocityCS(): Vec3;
    SetTargetOrientationCS(inOrientation: Quat): void;
    GetTargetOrientationCS(): Quat;
    SetTargetOrientationBS(inOrientation: Quat): void;
    GetRotationInConstraintSpace(): Quat;
    GetTotalLambdaPosition(): Vec3;
    GetTotalLambdaTwist(): number;
    GetTotalLambdaSwingY(): number;
    GetTotalLambdaSwingZ(): number;
    GetTotalLambdaMotor(): Vec3;
  }
  class SixDOFConstraintSettings extends TwoBodyConstraintSettings {
    constructor();
    MakeFreeAxis(inAxis: SixDOFConstraintSettings_EAxis): void;
    IsFreeAxis(inAxis: SixDOFConstraintSettings_EAxis): boolean;
    MakeFixedAxis(inAxis: SixDOFConstraintSettings_EAxis): void;
    IsFixedAxis(inAxis: SixDOFConstraintSettings_EAxis): boolean;
    SetLimitedAxis(
      inAxis: SixDOFConstraintSettings_EAxis,
      inMin: number,
      inMax: number
    ): void;
    get_mSpace(): EConstraintSpace;
    set_mSpace(mSpace: EConstraintSpace): void;
    mSpace: EConstraintSpace;
    get_mPosition1(): RVec3;
    set_mPosition1(mPosition1: RVec3): void;
    mPosition1: RVec3;
    get_mAxisX1(): Vec3;
    set_mAxisX1(mAxisX1: Vec3): void;
    mAxisX1: Vec3;
    get_mAxisY1(): Vec3;
    set_mAxisY1(mAxisY1: Vec3): void;
    mAxisY1: Vec3;
    get_mPosition2(): RVec3;
    set_mPosition2(mPosition2: RVec3): void;
    mPosition2: RVec3;
    get_mAxisX2(): Vec3;
    set_mAxisX2(mAxisX2: Vec3): void;
    mAxisX2: Vec3;
    get_mAxisY2(): Vec3;
    set_mAxisY2(mAxisY2: Vec3): void;
    mAxisY2: Vec3;
    get_mMaxFriction(index: number): number;
    set_mMaxFriction(index: number, mMaxFriction: number): void;
    mMaxFriction: number;
    get_mSwingType(): ESwingType;
    set_mSwingType(mSwingType: ESwingType): void;
    mSwingType: ESwingType;
    get_mLimitMin(index: number): number;
    set_mLimitMin(index: number, mLimitMin: number): void;
    mLimitMin: number;
    get_mLimitMax(index: number): number;
    set_mLimitMax(index: number, mLimitMax: number): void;
    mLimitMax: number;
    get_mLimitsSpringSettings(index: number): SpringSettings;
    set_mLimitsSpringSettings(
      index: number,
      mLimitsSpringSettings: SpringSettings
    ): void;
    mLimitsSpringSettings: SpringSettings;
    get_mMotorSettings(index: number): MotorSettings;
    set_mMotorSettings(index: number, mMotorSettings: MotorSettings): void;
    mMotorSettings: MotorSettings;
  }
  class SixDOFConstraint extends TwoBodyConstraint {
    SetTranslationLimits(inLimitMin: Vec3, inLimitMax: Vec3): void;
    SetRotationLimits(inLimitMin: Vec3, inLimitMax: Vec3): void;
    GetLimitsMin(inAxis: SixDOFConstraintSettings_EAxis): number;
    GetLimitsMax(inAxis: SixDOFConstraintSettings_EAxis): number;
    GetTranslationLimitsMin(): Vec3;
    GetTranslationLimitsMax(): Vec3;
    GetRotationLimitsMin(): Vec3;
    GetRotationLimitsMax(): Vec3;
    IsFixedAxis(inAxis: SixDOFConstraintSettings_EAxis): boolean;
    IsFreeAxis(inAxis: SixDOFConstraintSettings_EAxis): boolean;
    GetLimitsSpringSettings(
      inAxis: SixDOFConstraintSettings_EAxis
    ): SpringSettings;
    SetLimitsSpringSettings(
      inAxis: SixDOFConstraintSettings_EAxis,
      inLimitsSpringSettings: SpringSettings
    ): void;
    SetMaxFriction(
      inAxis: SixDOFConstraintSettings_EAxis,
      inFriction: number
    ): void;
    GetMaxFriction(inAxis: SixDOFConstraintSettings_EAxis): number;
    GetRotationInConstraintSpace(): Quat;
    GetMotorSettings(inAxis: SixDOFConstraintSettings_EAxis): MotorSettings;
    SetMotorState(
      inAxis: SixDOFConstraintSettings_EAxis,
      inState: EMotorState
    ): void;
    GetMotorState(inAxis: SixDOFConstraintSettings_EAxis): EMotorState;
    GetTargetVelocityCS(): Vec3;
    SetTargetVelocityCS(inVelocity: Vec3): void;
    SetTargetAngularVelocityCS(inAngularVelocity: Vec3): void;
    GetTargetAngularVelocityCS(): Vec3;
    GetTargetPositionCS(): Vec3;
    SetTargetPositionCS(inPosition: Vec3): void;
    SetTargetOrientationCS(inOrientation: Quat): void;
    GetTargetOrientationCS(): Quat;
    SetTargetOrientationBS(inOrientation: Quat): void;
    GetTotalLambdaPosition(): Vec3;
    GetTotalLambdaRotation(): Vec3;
    GetTotalLambdaMotorTranslation(): Vec3;
    GetTotalLambdaMotorRotation(): Vec3;
  }
  class PathConstraintSettings extends TwoBodyConstraintSettings {
    constructor();
    get_mPath(): PathConstraintPath;
    set_mPath(mPath: PathConstraintPath): void;
    mPath: PathConstraintPath;
    get_mPathPosition(): Vec3;
    set_mPathPosition(mPathPosition: Vec3): void;
    mPathPosition: Vec3;
    get_mPathRotation(): Quat;
    set_mPathRotation(mPathRotation: Quat): void;
    mPathRotation: Quat;
    get_mPathFraction(): number;
    set_mPathFraction(mPathFraction: number): void;
    mPathFraction: number;
    get_mMaxFrictionForce(): number;
    set_mMaxFrictionForce(mMaxFrictionForce: number): void;
    mMaxFrictionForce: number;
    get_mRotationConstraintType(): EPathRotationConstraintType;
    set_mRotationConstraintType(
      mRotationConstraintType: EPathRotationConstraintType
    ): void;
    mRotationConstraintType: EPathRotationConstraintType;
    get_mPositionMotorSettings(): MotorSettings;
    set_mPositionMotorSettings(mPositionMotorSettings: MotorSettings): void;
    mPositionMotorSettings: MotorSettings;
  }
  class PathConstraintPath {
    IsLooping(): boolean;
    SetIsLooping(inIsLooping: boolean): void;
    GetRefCount(): number;
    AddRef(): void;
    Release(): void;
  }
  class PathConstraintPathHermite extends PathConstraintPath {
    AddPoint(inPosition: Vec3, inTangent: Vec3, inNormal: Vec3): void;
  }
  class PathConstraintPathEm extends PathConstraintPath {}
  class PathConstraintPathJS extends PathConstraintPathEm {
    constructor();
    GetPathMaxFraction(): number;
    GetClosestPoint(inPosition: number, inFractionHint: number): number;
    GetPointOnPath(
      inFraction: number,
      outPathPosition: number,
      outPathTangent: number,
      outPathNormal: number,
      outPathBinormal: number
    ): void;
  }
  class PathConstraint extends TwoBodyConstraint {
    SetPath(inPath: PathConstraintPath, inPathFraction: number): void;
    GetPath(): PathConstraintPath;
    GetPathFraction(): number;
    SetMaxFrictionForce(inFrictionForce: number): void;
    GetMaxFrictionForce(): number;
    GetPositionMotorSettings(): MotorSettings;
    SetPositionMotorState(inState: EMotorState): void;
    GetPositionMotorState(): EMotorState;
    SetTargetVelocity(inVelocity: number): void;
    GetTargetVelocity(): number;
    SetTargetPathFraction(inFraction: number): void;
    GetTargetPathFraction(): number;
  }
  class PulleyConstraintSettings extends TwoBodyConstraintSettings {
    constructor();
    get_mSpace(): EConstraintSpace;
    set_mSpace(mSpace: EConstraintSpace): void;
    mSpace: EConstraintSpace;
    get_mBodyPoint1(): RVec3;
    set_mBodyPoint1(mBodyPoint1: RVec3): void;
    mBodyPoint1: RVec3;
    get_mFixedPoint1(): RVec3;
    set_mFixedPoint1(mFixedPoint1: RVec3): void;
    mFixedPoint1: RVec3;
    get_mBodyPoint2(): RVec3;
    set_mBodyPoint2(mBodyPoint2: RVec3): void;
    mBodyPoint2: RVec3;
    get_mFixedPoint2(): RVec3;
    set_mFixedPoint2(mFixedPoint2: RVec3): void;
    mFixedPoint2: RVec3;
    get_mRatio(): number;
    set_mRatio(mRatio: number): void;
    mRatio: number;
    get_mMinLength(): number;
    set_mMinLength(mMinLength: number): void;
    mMinLength: number;
    get_mMaxLength(): number;
    set_mMaxLength(mMaxLength: number): void;
    mMaxLength: number;
  }
  class PulleyConstraint extends TwoBodyConstraint {
    SetLength(inMinLength: number, inMaxLength: number): void;
    GetMinLength(): number;
    GetMaxLength(): number;
    GetCurrentLength(): number;
  }
  class GearConstraintSettings extends TwoBodyConstraintSettings {
    constructor();
    SetRatio(inNumTeethGear1: number, inNumTeethGear2: number): void;
    get_mSpace(): EConstraintSpace;
    set_mSpace(mSpace: EConstraintSpace): void;
    mSpace: EConstraintSpace;
    get_mHingeAxis1(): Vec3;
    set_mHingeAxis1(mHingeAxis1: Vec3): void;
    mHingeAxis1: Vec3;
    get_mHingeAxis2(): Vec3;
    set_mHingeAxis2(mHingeAxis2: Vec3): void;
    mHingeAxis2: Vec3;
    get_mRatio(): number;
    set_mRatio(mRatio: number): void;
    mRatio: number;
  }
  class GearConstraint extends TwoBodyConstraint {
    SetConstraints(inGear1: Constraint, inGear2: Constraint): void;
    GetTotalLambda(): number;
  }
  class RackAndPinionConstraintSettings extends TwoBodyConstraintSettings {
    constructor();
    SetRatio(
      inNumTeethRack: number,
      inRackLength: number,
      inNumTeethPinion: number
    ): void;
    get_mSpace(): EConstraintSpace;
    set_mSpace(mSpace: EConstraintSpace): void;
    mSpace: EConstraintSpace;
    get_mHingeAxis(): Vec3;
    set_mHingeAxis(mHingeAxis: Vec3): void;
    mHingeAxis: Vec3;
    get_mSliderAxis(): Vec3;
    set_mSliderAxis(mSliderAxis: Vec3): void;
    mSliderAxis: Vec3;
    get_mRatio(): number;
    set_mRatio(mRatio: number): void;
    mRatio: number;
  }
  class RackAndPinionConstraint extends TwoBodyConstraint {
    SetConstraints(inPinion: Constraint, inRack: Constraint): void;
    GetTotalLambda(): number;
  }
  class BodyID {
    constructor();
    constructor(inIndexAndSequenceNumber: number);
    GetIndex(): number;
    GetIndexAndSequenceNumber(): number;
  }
  class SubShapeID {
    constructor();
    GetValue(): number;
    SetValue(inValue: number): void;
  }
  class MotionProperties {
    GetMotionQuality(): EMotionQuality;
    GetAllowedDOFs(): EAllowedDOFs;
    GetAllowSleeping(): boolean;
    GetLinearVelocity(): Vec3;
    SetLinearVelocity(inVelocity: Vec3): void;
    SetLinearVelocityClamped(inVelocity: Vec3): void;
    GetAngularVelocity(): Vec3;
    SetAngularVelocity(inVelocity: Vec3): void;
    SetAngularVelocityClamped(inVelocity: Vec3): void;
    MoveKinematic(
      inPosition: Vec3,
      inRotation: Quat,
      inDeltaTime: number
    ): void;
    GetMaxLinearVelocity(): number;
    SetMaxLinearVelocity(inVelocity: number): void;
    GetMaxAngularVelocity(): number;
    SetMaxAngularVelocity(inVelocity: number): void;
    ClampLinearVelocity(): void;
    ClampAngularVelocity(): void;
    GetLinearDamping(): number;
    SetLinearDamping(inDamping: number): void;
    GetAngularDamping(): number;
    SetAngularDamping(inDamping: number): void;
    GetGravityFactor(): number;
    SetGravityFactor(inFactor: number): void;
    SetMassProperties(
      inAllowedDOFs: EAllowedDOFs,
      inMassProperties: MassProperties
    ): void;
    GetInverseMass(): number;
    GetInverseMassUnchecked(): number;
    SetInverseMass(inInvM: number): void;
    GetInverseInertiaDiagonal(): Vec3;
    GetInertiaRotation(): Quat;
    SetInverseInertia(inInvI: Vec3, inRotation: Quat): void;
    ScaleToMass(inMass: number): void;
    GetLocalSpaceInverseInertia(): Mat44;
    GetInverseInertiaForRotation(inRotation: Mat44): Mat44;
    MultiplyWorldSpaceInverseInertiaByVector(inRotation: Quat, inV: Vec3): Vec3;
    GetPointVelocityCOM(inPointRelativeToCOM: Vec3): Vec3;
    GetAccumulatedForce(): Vec3;
    GetAccumulatedTorque(): Vec3;
    ResetForce(): void;
    ResetTorque(): void;
    ResetMotion(): void;
    LockTranslation(inV: Vec3): Vec3;
    LockAngular(inV: Vec3): Vec3;
    SetNumVelocityStepsOverride(inN: number): void;
    GetNumVelocityStepsOverride(): number;
    SetNumPositionStepsOverride(inN: number): void;
    GetNumPositionStepsOverride(): number;
  }
  class GroupFilter {
    GetRefCount(): number;
    AddRef(): void;
    Release(): void;
  }
  class GroupFilterJS extends GroupFilter {
    constructor();
    CanCollide(inGroup1: number, inGroup2: number): boolean;
  }
  class GroupFilterTable extends GroupFilter {
    constructor(inNumGroups: number);
    DisableCollision(inSubGroup1: number, inSubGroup2: number): void;
    EnableCollision(inSubGroup1: number, inSubGroup2: number): void;
    IsCollisionEnabled(inSubGroup1: number, inSubGroup2: number): boolean;
  }
  class CollisionGroup {
    constructor();
    constructor(inFilter: GroupFilter, inGroupID: number, inSubGroupID: number);
    SetGroupFilter(inFilter: GroupFilter): void;
    GetGroupFilter(): GroupFilter;
    SetGroupID(inGroupID: number): void;
    GetGroupID(): number;
    SetSubGroupID(inSubGroupID: number): void;
    GetSubGroupID(): number;
  }
  class Body {
    GetID(): BodyID;
    IsActive(): boolean;
    IsRigidBody(): boolean;
    IsSoftBody(): boolean;
    IsStatic(): boolean;
    IsKinematic(): boolean;
    IsDynamic(): boolean;
    CanBeKinematicOrDynamic(): boolean;
    GetBodyType(): EBodyType;
    GetMotionType(): EMotionType;
    SetIsSensor(inIsSensor: boolean): void;
    IsSensor(): boolean;
    SetCollideKinematicVsNonDynamic(inCollide: boolean): void;
    GetCollideKinematicVsNonDynamic(): boolean;
    SetUseManifoldReduction(inUseReduction: boolean): void;
    GetUseManifoldReduction(): boolean;
    SetApplyGyroscopicForce(inApply: boolean): void;
    GetApplyGyroscopicForce(): boolean;
    SetEnhancedInternalEdgeRemoval(inApply: boolean): void;
    GetEnhancedInternalEdgeRemoval(): boolean;
    GetObjectLayer(): number;
    GetCollisionGroup(): CollisionGroup;
    GetAllowSleeping(): boolean;
    SetAllowSleeping(inAllow: boolean): void;
    ResetSleepTimer(): void;
    GetFriction(): number;
    SetFriction(inFriction: number): void;
    GetRestitution(): number;
    SetRestitution(inRestitution: number): void;
    GetLinearVelocity(): Vec3;
    SetLinearVelocity(inVelocity: Vec3): void;
    SetLinearVelocityClamped(inVelocity: Vec3): void;
    GetAngularVelocity(): Vec3;
    SetAngularVelocity(inVelocity: Vec3): void;
    SetAngularVelocityClamped(inVelocity: Vec3): void;
    AddForce(inForce: Vec3): void;
    AddForce(inForce: Vec3, inPosition: RVec3): void;
    AddTorque(inTorque: Vec3): void;
    GetAccumulatedForce(): Vec3;
    GetAccumulatedTorque(): Vec3;
    ResetForce(): void;
    ResetTorque(): void;
    ResetMotion(): void;
    AddImpulse(inImpulse: Vec3): void;
    AddImpulse(inImpulse: Vec3, inPosition: RVec3): void;
    AddAngularImpulse(inAngularImpulse: Vec3): void;
    MoveKinematic(
      inPosition: RVec3,
      inRotation: Quat,
      inDeltaTime: number
    ): void;
    ApplyBuoyancyImpulse(
      inSurfacePosition: RVec3,
      inSurfaceNormal: Vec3,
      inBuoyancy: number,
      inLinearDrag: number,
      inAngularDrag: number,
      inFluidVelocity: Vec3,
      inGravity: Vec3,
      inDeltaTime: number
    ): boolean;
    IsInBroadPhase(): boolean;
    GetInverseInertia(): Mat44;
    GetShape(): Shape;
    GetPosition(): RVec3;
    GetRotation(): Quat;
    GetWorldTransform(): RMat44;
    GetCenterOfMassPosition(): RVec3;
    GetCenterOfMassTransform(): RMat44;
    GetInverseCenterOfMassTransform(): RMat44;
    GetWorldSpaceBounds(): AABox;
    GetTransformedShape(): TransformedShape;
    GetBodyCreationSettings(): BodyCreationSettings;
    GetSoftBodyCreationSettings(): SoftBodyCreationSettings;
    GetMotionProperties(): MotionProperties;
    GetWorldSpaceSurfaceNormal(
      inSubShapeID: SubShapeID,
      inPosition: RVec3
    ): Vec3;
    GetUserData(): number;
    SetUserData(inUserData: number): void;
    SaveState(inStream: StateRecorder): void;
    RestoreState(inStream: StateRecorder): void;
  }
  class BodyInterface_AddState {}
  class BodyInterface {
    CreateBody(inSettings: BodyCreationSettings): Body;
    CreateSoftBody(inSettings: SoftBodyCreationSettings): Body;
    CreateBodyWithID(inBodyID: BodyID, inSettings: BodyCreationSettings): Body;
    CreateSoftBodyWithID(
      inBodyID: BodyID,
      inSettings: SoftBodyCreationSettings
    ): Body;
    CreateBodyWithoutID(inSettings: BodyCreationSettings): Body;
    CreateSoftBodyWithoutID(inSettings: SoftBodyCreationSettings): Body;
    DestroyBodyWithoutID(inBody: Body): void;
    AssignBodyID(ioBody: Body): boolean;
    AssignBodyID(ioBody: Body, inBodyID: BodyID): boolean;
    UnassignBodyID(inBodyID: BodyID): Body;
    UnassignBodyIDs(
      inBodyIDs: BodyIDMemRef,
      inNumber: number,
      outBodies: BodyPtrMemRef
    ): void;
    DestroyBody(inBodyID: BodyID): void;
    DestroyBodies(inBodyIDs: BodyIDMemRef, inNumber: number): void;
    AddBody(inBodyID: BodyID, inActivationMode: EActivation): void;
    RemoveBody(inBodyID: BodyID): void;
    IsAdded(inBodyID: BodyID): boolean;
    CreateAndAddBody(
      inSettings: BodyCreationSettings,
      inActivationMode: EActivation
    ): BodyID;
    CreateAndAddSoftBody(
      inSettings: SoftBodyCreationSettings,
      inActivationMode: EActivation
    ): BodyID;
    AddBodiesPrepare(
      ioBodies: BodyIDMemRef,
      inNumber: number
    ): BodyInterface_AddState;
    AddBodiesFinalize(
      ioBodies: BodyIDMemRef,
      inNumber: number,
      inAddState: BodyInterface_AddState,
      inActivationMode: EActivation
    ): void;
    AddBodiesAbort(
      ioBodies: BodyIDMemRef,
      inNumber: number,
      inAddState: BodyInterface_AddState
    ): void;
    RemoveBodies(ioBodies: BodyIDMemRef, inNumber: number): void;
    CreateConstraint(
      inSettings: TwoBodyConstraintSettings,
      inBodyID1: BodyID,
      inBodyID2: BodyID
    ): TwoBodyConstraint;
    ActivateConstraint(inConstraint: TwoBodyConstraint): void;
    GetShape(inBodyID: BodyID): Shape;
    SetShape(
      inBodyID: BodyID,
      inShape: Shape,
      inUpdateMassProperties: boolean,
      inActivationMode: EActivation
    ): void;
    NotifyShapeChanged(
      inBodyID: BodyID,
      inPreviousCenterOfMass: Vec3,
      inUpdateMassProperties: boolean,
      inActivationMode: EActivation
    ): void;
    SetObjectLayer(inBodyID: BodyID, inLayer: number): void;
    GetObjectLayer(inBodyID: BodyID): number;
    SetPositionAndRotation(
      inBodyID: BodyID,
      inPosition: RVec3,
      inRotation: Quat,
      inActivationMode: EActivation
    ): void;
    SetPositionAndRotationWhenChanged(
      inBodyID: BodyID,
      inPosition: RVec3,
      inRotation: Quat,
      inActivationMode: EActivation
    ): void;
    GetPositionAndRotation(
      inBodyID: BodyID,
      outPosition: RVec3,
      outRotation: Quat
    ): void;
    SetPosition(
      inBodyID: BodyID,
      inPosition: RVec3,
      inActivationMode: EActivation
    ): void;
    GetPosition(inBodyID: BodyID): RVec3;
    SetRotation(
      inBodyID: BodyID,
      inRotation: Quat,
      inActivationMode: EActivation
    ): void;
    GetRotation(inBodyID: BodyID): Quat;
    GetWorldTransform(inBodyID: BodyID): RMat44;
    GetCenterOfMassTransform(inBodyID: BodyID): RMat44;
    SetLinearAndAngularVelocity(
      inBodyID: BodyID,
      inLinearVelocity: Vec3,
      inAngularVelocity: Vec3
    ): void;
    GetLinearAndAngularVelocity(
      inBodyID: BodyID,
      outLinearVelocity: Vec3,
      outAngularVelocity: Vec3
    ): void;
    SetLinearVelocity(inBodyID: BodyID, inLinearVelocity: Vec3): void;
    GetLinearVelocity(inBodyID: BodyID): Vec3;
    AddLinearVelocity(inBodyID: BodyID, inLinearVelocity: Vec3): void;
    AddLinearAndAngularVelocity(
      inBodyID: BodyID,
      inLinearVelocity: Vec3,
      inAngularVelocity: Vec3
    ): void;
    SetAngularVelocity(inBodyID: BodyID, inAngularVelocity: Vec3): void;
    GetAngularVelocity(inBodyID: BodyID): Vec3;
    GetPointVelocity(inBodyID: BodyID, inPoint: RVec3): Vec3;
    SetPositionRotationAndVelocity(
      inBodyID: BodyID,
      inPosition: RVec3,
      inRotation: Quat,
      inLinearVelocity: Vec3,
      inAngularVelocity: Vec3
    ): void;
    MoveKinematic(
      inBodyID: BodyID,
      inPosition: RVec3,
      inRotation: Quat,
      inDeltaTime: number
    ): void;
    ActivateBody(inBodyID: BodyID): void;
    ActivateBodies(inBodyIDs: BodyIDMemRef, inNumber: number): void;
    ActivateBodiesInAABox(
      inBox: AABox,
      inBroadPhaseLayerFilter: BroadPhaseLayerFilter,
      inObjectLayerFilter: ObjectLayerFilter
    ): void;
    DeactivateBody(inBodyID: BodyID): void;
    DeactivateBodies(inBodyIDs: BodyIDMemRef, inNumber: number): void;
    IsActive(inBodyID: BodyID): boolean;
    ResetSleepTimer(inBodyID: BodyID): void;
    GetBodyType(inBodyID: BodyID): EBodyType;
    SetMotionType(
      inBodyID: BodyID,
      inMotionType: EMotionType,
      inActivationMode: EActivation
    ): void;
    GetMotionType(inBodyID: BodyID): EMotionType;
    SetMotionQuality(inBodyID: BodyID, inMotionQuality: EMotionQuality): void;
    GetMotionQuality(inBodyID: BodyID): EMotionQuality;
    GetInverseInertia(inBodyID: BodyID): Mat44;
    SetRestitution(inBodyID: BodyID, inRestitution: number): void;
    GetRestitution(inBodyID: BodyID): number;
    SetFriction(inBodyID: BodyID, inFriction: number): void;
    GetFriction(inBodyID: BodyID): number;
    SetGravityFactor(inBodyID: BodyID, inFactor: number): void;
    GetGravityFactor(inBodyID: BodyID): number;
    SetUseManifoldReduction(inBodyID: BodyID, inUseReduction: boolean): void;
    GetUseManifoldReduction(inBodyID: BodyID): boolean;
    AddForce(
      inBodyID: BodyID,
      inForce: Vec3,
      inActivationMode: EActivation
    ): void;
    AddForce(
      inBodyID: BodyID,
      inForce: Vec3,
      inPoint: RVec3,
      inActivationMode: EActivation
    ): void;
    AddTorque(
      inBodyID: BodyID,
      inTorque: Vec3,
      inActivationMode: EActivation
    ): void;
    AddForceAndTorque(
      inBodyID: BodyID,
      inForce: Vec3,
      inTorque: Vec3,
      inActivationMode: EActivation
    ): void;
    ApplyBuoyancyImpulse(
      inBodyID: BodyID,
      inSurfacePosition: RVec3,
      inSurfaceNormal: Vec3,
      inBuoyancy: number,
      inLinearDrag: number,
      inAngularDrag: number,
      inFluidVelocity: Vec3,
      inGravity: Vec3,
      inDeltaTime: number
    ): boolean;
    AddImpulse(inBodyID: BodyID, inImpulse: Vec3): void;
    AddImpulse(inBodyID: BodyID, inImpulse: Vec3, inPosition: RVec3): void;
    AddAngularImpulse(inBodyID: BodyID, inAngularImpulse: Vec3): void;
    GetTransformedShape(inBodyID: BodyID): TransformedShape;
    GetUserData(inBodyID: BodyID): number;
    SetUserData(inBodyID: BodyID, inUserData: number): void;
    GetMaterial(inBodyID: BodyID, inSubShapeID: SubShapeID): PhysicsMaterial;
    InvalidateContactCache(inBodyID: BodyID): void;
  }
  class StateRecorderFilter {}
  class StateRecorderFilterJS extends StateRecorderFilter {
    constructor();
    ShouldSaveBody(inBody: number): boolean;
    ShouldSaveConstraint(inConstraint: number): boolean;
    ShouldSaveContact(inBody1: number, inBody2: number): boolean;
    ShouldRestoreContact(inBody1: number, inBody2: number): boolean;
  }
  class StateRecorder {
    SetValidating(inValidating: boolean): void;
    IsValidating(): boolean;
    SetIsLastPart(inIsLastPart: boolean): void;
    IsLastPart(): boolean;
  }
  class StateRecorderEm extends StateRecorder {}
  class StateRecorderJS extends StateRecorderEm {
    constructor();
    ReadBytes(outData: number, inNumBytes: number): void;
    WriteBytes(inData: number, inNumBytes: number): void;
    IsEOF(): boolean;
    IsFailed(): boolean;
  }
  class StateRecorderImpl extends StateRecorder {
    constructor();
    Clear(): void;
    Rewind(): void;
    IsEqual(inReference: StateRecorderImpl): boolean;
  }
  class BodyLockInterface {
    TryGetBody(inBodyID: BodyID): Body;
  }
  class BodyLockInterfaceNoLock extends BodyLockInterface {}
  class BodyLockInterfaceLocking extends BodyLockInterface {}
  class PhysicsSettings {
    constructor();
    get_mMaxInFlightBodyPairs(): number;
    set_mMaxInFlightBodyPairs(mMaxInFlightBodyPairs: number): void;
    mMaxInFlightBodyPairs: number;
    get_mStepListenersBatchSize(): number;
    set_mStepListenersBatchSize(mStepListenersBatchSize: number): void;
    mStepListenersBatchSize: number;
    get_mStepListenerBatchesPerJob(): number;
    set_mStepListenerBatchesPerJob(mStepListenerBatchesPerJob: number): void;
    mStepListenerBatchesPerJob: number;
    get_mBaumgarte(): number;
    set_mBaumgarte(mBaumgarte: number): void;
    mBaumgarte: number;
    get_mSpeculativeContactDistance(): number;
    set_mSpeculativeContactDistance(mSpeculativeContactDistance: number): void;
    mSpeculativeContactDistance: number;
    get_mPenetrationSlop(): number;
    set_mPenetrationSlop(mPenetrationSlop: number): void;
    mPenetrationSlop: number;
    get_mLinearCastThreshold(): number;
    set_mLinearCastThreshold(mLinearCastThreshold: number): void;
    mLinearCastThreshold: number;
    get_mLinearCastMaxPenetration(): number;
    set_mLinearCastMaxPenetration(mLinearCastMaxPenetration: number): void;
    mLinearCastMaxPenetration: number;
    get_mManifoldToleranceSq(): number;
    set_mManifoldToleranceSq(mManifoldToleranceSq: number): void;
    mManifoldToleranceSq: number;
    get_mMaxPenetrationDistance(): number;
    set_mMaxPenetrationDistance(mMaxPenetrationDistance: number): void;
    mMaxPenetrationDistance: number;
    get_mBodyPairCacheMaxDeltaPositionSq(): number;
    set_mBodyPairCacheMaxDeltaPositionSq(
      mBodyPairCacheMaxDeltaPositionSq: number
    ): void;
    mBodyPairCacheMaxDeltaPositionSq: number;
    get_mBodyPairCacheCosMaxDeltaRotationDiv2(): number;
    set_mBodyPairCacheCosMaxDeltaRotationDiv2(
      mBodyPairCacheCosMaxDeltaRotationDiv2: number
    ): void;
    mBodyPairCacheCosMaxDeltaRotationDiv2: number;
    get_mContactNormalCosMaxDeltaRotation(): number;
    set_mContactNormalCosMaxDeltaRotation(
      mContactNormalCosMaxDeltaRotation: number
    ): void;
    mContactNormalCosMaxDeltaRotation: number;
    get_mContactPointPreserveLambdaMaxDistSq(): number;
    set_mContactPointPreserveLambdaMaxDistSq(
      mContactPointPreserveLambdaMaxDistSq: number
    ): void;
    mContactPointPreserveLambdaMaxDistSq: number;
    get_mNumVelocitySteps(): number;
    set_mNumVelocitySteps(mNumVelocitySteps: number): void;
    mNumVelocitySteps: number;
    get_mNumPositionSteps(): number;
    set_mNumPositionSteps(mNumPositionSteps: number): void;
    mNumPositionSteps: number;
    get_mMinVelocityForRestitution(): number;
    set_mMinVelocityForRestitution(mMinVelocityForRestitution: number): void;
    mMinVelocityForRestitution: number;
    get_mTimeBeforeSleep(): number;
    set_mTimeBeforeSleep(mTimeBeforeSleep: number): void;
    mTimeBeforeSleep: number;
    get_mPointVelocitySleepThreshold(): number;
    set_mPointVelocitySleepThreshold(
      mPointVelocitySleepThreshold: number
    ): void;
    mPointVelocitySleepThreshold: number;
    get_mDeterministicSimulation(): boolean;
    set_mDeterministicSimulation(mDeterministicSimulation: boolean): void;
    mDeterministicSimulation: boolean;
    get_mConstraintWarmStart(): boolean;
    set_mConstraintWarmStart(mConstraintWarmStart: boolean): void;
    mConstraintWarmStart: boolean;
    get_mUseBodyPairContactCache(): boolean;
    set_mUseBodyPairContactCache(mUseBodyPairContactCache: boolean): void;
    mUseBodyPairContactCache: boolean;
    get_mUseManifoldReduction(): boolean;
    set_mUseManifoldReduction(mUseManifoldReduction: boolean): void;
    mUseManifoldReduction: boolean;
    get_mUseLargeIslandSplitter(): boolean;
    set_mUseLargeIslandSplitter(mUseLargeIslandSplitter: boolean): void;
    mUseLargeIslandSplitter: boolean;
    get_mAllowSleeping(): boolean;
    set_mAllowSleeping(mAllowSleeping: boolean): void;
    mAllowSleeping: boolean;
    get_mCheckActiveEdges(): boolean;
    set_mCheckActiveEdges(mCheckActiveEdges: boolean): void;
    mCheckActiveEdges: boolean;
  }
  class CollideShapeResultFace {
    empty(): boolean;
    size(): number;
    at(inIndex: number): Vec3;
    push_back(inValue: Vec3): void;
    resize(inSize: number): void;
    clear(): void;
  }
  class CollideShapeResult {
    constructor();
    get_mContactPointOn1(): Vec3;
    set_mContactPointOn1(mContactPointOn1: Vec3): void;
    mContactPointOn1: Vec3;
    get_mContactPointOn2(): Vec3;
    set_mContactPointOn2(mContactPointOn2: Vec3): void;
    mContactPointOn2: Vec3;
    get_mPenetrationAxis(): Vec3;
    set_mPenetrationAxis(mPenetrationAxis: Vec3): void;
    mPenetrationAxis: Vec3;
    get_mPenetrationDepth(): number;
    set_mPenetrationDepth(mPenetrationDepth: number): void;
    mPenetrationDepth: number;
    get_mSubShapeID1(): SubShapeID;
    set_mSubShapeID1(mSubShapeID1: SubShapeID): void;
    mSubShapeID1: SubShapeID;
    get_mSubShapeID2(): SubShapeID;
    set_mSubShapeID2(mSubShapeID2: SubShapeID): void;
    mSubShapeID2: SubShapeID;
    get_mBodyID2(): BodyID;
    set_mBodyID2(mBodyID2: BodyID): void;
    mBodyID2: BodyID;
    get_mShape1Face(): CollideShapeResultFace;
    set_mShape1Face(mShape1Face: CollideShapeResultFace): void;
    mShape1Face: CollideShapeResultFace;
    get_mShape2Face(): CollideShapeResultFace;
    set_mShape2Face(mShape2Face: CollideShapeResultFace): void;
    mShape2Face: CollideShapeResultFace;
  }
  class ContactPoints {
    empty(): boolean;
    size(): number;
    at(inIndex: number): Vec3;
    push_back(inValue: Vec3): void;
    resize(inSize: number): void;
    clear(): void;
  }
  class ContactManifold {
    constructor();
    SwapShapes(): ContactManifold;
    GetWorldSpaceContactPointOn1(inIndex: number): RVec3;
    GetWorldSpaceContactPointOn2(inIndex: number): RVec3;
    get_mBaseOffset(): RVec3;
    set_mBaseOffset(mBaseOffset: RVec3): void;
    mBaseOffset: RVec3;
    get_mWorldSpaceNormal(): Vec3;
    set_mWorldSpaceNormal(mWorldSpaceNormal: Vec3): void;
    mWorldSpaceNormal: Vec3;
    get_mPenetrationDepth(): number;
    set_mPenetrationDepth(mPenetrationDepth: number): void;
    mPenetrationDepth: number;
    get_mSubShapeID1(): SubShapeID;
    set_mSubShapeID1(mSubShapeID1: SubShapeID): void;
    mSubShapeID1: SubShapeID;
    get_mSubShapeID2(): SubShapeID;
    set_mSubShapeID2(mSubShapeID2: SubShapeID): void;
    mSubShapeID2: SubShapeID;
    get_mRelativeContactPointsOn1(): ContactPoints;
    set_mRelativeContactPointsOn1(
      mRelativeContactPointsOn1: ContactPoints
    ): void;
    mRelativeContactPointsOn1: ContactPoints;
    get_mRelativeContactPointsOn2(): ContactPoints;
    set_mRelativeContactPointsOn2(
      mRelativeContactPointsOn2: ContactPoints
    ): void;
    mRelativeContactPointsOn2: ContactPoints;
  }
  class ContactSettings {
    constructor();
    get_mCombinedFriction(): number;
    set_mCombinedFriction(mCombinedFriction: number): void;
    mCombinedFriction: number;
    get_mCombinedRestitution(): number;
    set_mCombinedRestitution(mCombinedRestitution: number): void;
    mCombinedRestitution: number;
    get_mInvMassScale1(): number;
    set_mInvMassScale1(mInvMassScale1: number): void;
    mInvMassScale1: number;
    get_mInvInertiaScale1(): number;
    set_mInvInertiaScale1(mInvInertiaScale1: number): void;
    mInvInertiaScale1: number;
    get_mInvMassScale2(): number;
    set_mInvMassScale2(mInvMassScale2: number): void;
    mInvMassScale2: number;
    get_mInvInertiaScale2(): number;
    set_mInvInertiaScale2(mInvInertiaScale2: number): void;
    mInvInertiaScale2: number;
    get_mIsSensor(): boolean;
    set_mIsSensor(mIsSensor: boolean): void;
    mIsSensor: boolean;
    get_mRelativeLinearSurfaceVelocity(): Vec3;
    set_mRelativeLinearSurfaceVelocity(
      mRelativeLinearSurfaceVelocity: Vec3
    ): void;
    mRelativeLinearSurfaceVelocity: Vec3;
    get_mRelativeAngularSurfaceVelocity(): Vec3;
    set_mRelativeAngularSurfaceVelocity(
      mRelativeAngularSurfaceVelocity: Vec3
    ): void;
    mRelativeAngularSurfaceVelocity: Vec3;
  }
  class SubShapeIDPair {
    constructor();
    GetBody1ID(): BodyID;
    GetSubShapeID1(): SubShapeID;
    GetBody2ID(): BodyID;
    GetSubShapeID2(): SubShapeID;
  }
  class ContactListener {}
  class ContactListenerEm extends ContactListener {}
  class ContactListenerJS extends ContactListenerEm {
    constructor();
    OnContactValidate(
      inBody1: number,
      inBody2: number,
      inBaseOffset: number,
      inCollisionResult: number
    ): number;
    OnContactAdded(
      inBody1: number,
      inBody2: number,
      inManifold: number,
      ioSettings: number
    ): void;
    OnContactPersisted(
      inBody1: number,
      inBody2: number,
      inManifold: number,
      ioSettings: number
    ): void;
    OnContactRemoved(inSubShapePair: number): void;
  }
  class SoftBodyManifold {
    GetVertices(): ArraySoftBodyVertex;
    HasContact(inVertex: SoftBodyVertex): boolean;
    GetLocalContactPoint(inVertex: SoftBodyVertex): Vec3;
    GetContactNormal(inVertex: SoftBodyVertex): Vec3;
    GetContactBodyID(inVertex: SoftBodyVertex): BodyID;
    GetNumSensorContacts(): number;
    GetSensorContactBodyID(inIndex: number): BodyID;
  }
  class SoftBodyContactSettings {
    get_mInvMassScale1(): number;
    set_mInvMassScale1(mInvMassScale1: number): void;
    mInvMassScale1: number;
    get_mInvMassScale2(): number;
    set_mInvMassScale2(mInvMassScale2: number): void;
    mInvMassScale2: number;
    get_mInvInertiaScale2(): number;
    set_mInvInertiaScale2(mInvInertiaScale2: number): void;
    mInvInertiaScale2: number;
    get_mIsSensor(): boolean;
    set_mIsSensor(mIsSensor: boolean): void;
    mIsSensor: boolean;
  }
  class SoftBodyContactListener {}
  class SoftBodyContactListenerEm extends SoftBodyContactListener {}
  class SoftBodyContactListenerJS extends SoftBodyContactListenerEm {
    constructor();
    OnSoftBodyContactValidate(
      inSoftBody: number,
      inOtherBody: number,
      ioSettings: number
    ): number;
    OnSoftBodyContactAdded(inSoftBody: number, inManifold: number): void;
  }
  class RayCastBodyCollector {
    Reset(): void;
    SetContext(inContext: TransformedShape): void;
    GetContext(): TransformedShape;
    UpdateEarlyOutFraction(inFraction: number): void;
    ResetEarlyOutFraction(inFraction?: number): void;
    ForceEarlyOut(): void;
    ShouldEarlyOut(): boolean;
    GetEarlyOutFraction(): number;
    GetPositiveEarlyOutFraction(): number;
  }
  class RayCastBodyCollectorJS extends RayCastBodyCollector {
    constructor();
    Reset(): void;
    AddHit(inResult: number): void;
  }
  class CollideShapeBodyCollector {
    Reset(): void;
    SetContext(inContext: TransformedShape): void;
    GetContext(): TransformedShape;
    UpdateEarlyOutFraction(inFraction: number): void;
    ResetEarlyOutFraction(inFraction?: number): void;
    ForceEarlyOut(): void;
    ShouldEarlyOut(): boolean;
    GetEarlyOutFraction(): number;
    GetPositiveEarlyOutFraction(): number;
  }
  class CollideShapeBodyCollectorJS extends CollideShapeBodyCollector {
    constructor();
    Reset(): void;
    AddHit(inResult: number): void;
  }
  class CastShapeBodyCollector {
    Reset(): void;
    SetContext(inContext: TransformedShape): void;
    GetContext(): TransformedShape;
    UpdateEarlyOutFraction(inFraction: number): void;
    ResetEarlyOutFraction(inFraction?: number): void;
    ForceEarlyOut(): void;
    ShouldEarlyOut(): boolean;
    GetEarlyOutFraction(): number;
    GetPositiveEarlyOutFraction(): number;
  }
  class CastShapeBodyCollectorJS extends CastShapeBodyCollector {
    constructor();
    Reset(): void;
    AddHit(inResult: number): void;
  }
  class BroadPhaseQuery {
    CastRay(
      inRay: RayCast,
      ioCollector: RayCastBodyCollector,
      inBroadPhaseFilter: BroadPhaseLayerFilter,
      inObjectLayerFilter: ObjectLayerFilter
    ): void;
    CollideAABox(
      inBox: AABox,
      ioCollector: CollideShapeBodyCollector,
      inBroadPhaseFilter: BroadPhaseLayerFilter,
      inObjectLayerFilter: ObjectLayerFilter
    ): void;
    CollideSphere(
      inCenter: Vec3,
      inRadius: number,
      ioCollector: CollideShapeBodyCollector,
      inBroadPhaseLayerFilter: BroadPhaseLayerFilter,
      inObjectLayerFilter: ObjectLayerFilter
    ): void;
    CollidePoint(
      inPoint: Vec3,
      ioCollector: CollideShapeBodyCollector,
      inBroadPhaseFilter: BroadPhaseLayerFilter,
      inObjectLayerFilter: ObjectLayerFilter
    ): void;
    CollideOrientedBox(
      inBox: OrientedBox,
      ioCollector: CollideShapeBodyCollector,
      inBroadPhaseFilter: BroadPhaseLayerFilter,
      inObjectLayerFilter: ObjectLayerFilter
    ): void;
    CastAABox(
      inBox: AABoxCast,
      ioCollector: CastShapeBodyCollector,
      inBroadPhaseFilter: BroadPhaseLayerFilter,
      inObjectLayerFilter: ObjectLayerFilter
    ): void;
  }
  class RayCastSettings {
    constructor();
    SetBackFaceMode(inBackFaceMode: EBackFaceMode): void;
    get_mBackFaceModeTriangles(): EBackFaceMode;
    set_mBackFaceModeTriangles(mBackFaceModeTriangles: EBackFaceMode): void;
    mBackFaceModeTriangles: EBackFaceMode;
    get_mBackFaceModeConvex(): EBackFaceMode;
    set_mBackFaceModeConvex(mBackFaceModeConvex: EBackFaceMode): void;
    mBackFaceModeConvex: EBackFaceMode;
    get_mTreatConvexAsSolid(): boolean;
    set_mTreatConvexAsSolid(mTreatConvexAsSolid: boolean): void;
    mTreatConvexAsSolid: boolean;
  }
  class CastRayCollector {
    Reset(): void;
    SetContext(inContext: TransformedShape): void;
    GetContext(): TransformedShape;
    UpdateEarlyOutFraction(inFraction: number): void;
    ResetEarlyOutFraction(inFraction?: number): void;
    ForceEarlyOut(): void;
    ShouldEarlyOut(): boolean;
    GetEarlyOutFraction(): number;
    GetPositiveEarlyOutFraction(): number;
  }
  class CastRayCollectorJS extends CastRayCollector {
    constructor();
    Reset(): void;
    OnBody(inBody: number): void;
    AddHit(inResult: number): void;
  }
  class ArrayRayCastResult {
    empty(): boolean;
    size(): number;
    at(inIndex: number): RayCastResult;
    push_back(inValue: RayCastResult): void;
    reserve(inSize: number): void;
    resize(inSize: number): void;
    clear(): void;
  }
  class CastRayAllHitCollisionCollector extends CastRayCollector {
    constructor();
    Sort(): void;
    HadHit(): boolean;
    get_mHits(): ArrayRayCastResult;
    set_mHits(mHits: ArrayRayCastResult): void;
    mHits: ArrayRayCastResult;
  }
  class CastRayClosestHitCollisionCollector extends CastRayCollector {
    constructor();
    HadHit(): boolean;
    get_mHit(): RayCastResult;
    set_mHit(mHit: RayCastResult): void;
    mHit: RayCastResult;
  }
  class CastRayAnyHitCollisionCollector extends CastRayCollector {
    constructor();
    HadHit(): boolean;
    get_mHit(): RayCastResult;
    set_mHit(mHit: RayCastResult): void;
    mHit: RayCastResult;
  }
  class CollidePointResult {
    constructor();
    get_mBodyID(): BodyID;
    set_mBodyID(mBodyID: BodyID): void;
    mBodyID: BodyID;
    get_mSubShapeID2(): SubShapeID;
    set_mSubShapeID2(mSubShapeID2: SubShapeID): void;
    mSubShapeID2: SubShapeID;
  }
  class CollidePointCollector {
    Reset(): void;
    SetContext(inContext: TransformedShape): void;
    GetContext(): TransformedShape;
    UpdateEarlyOutFraction(inFraction: number): void;
    ResetEarlyOutFraction(inFraction?: number): void;
    ForceEarlyOut(): void;
    ShouldEarlyOut(): boolean;
    GetEarlyOutFraction(): number;
    GetPositiveEarlyOutFraction(): number;
  }
  class CollidePointCollectorJS extends CollidePointCollector {
    constructor();
    Reset(): void;
    OnBody(inBody: number): void;
    AddHit(inResult: number): void;
  }
  class ArrayCollidePointResult {
    empty(): boolean;
    size(): number;
    at(inIndex: number): CollidePointResult;
    push_back(inValue: CollidePointResult): void;
    reserve(inSize: number): void;
    resize(inSize: number): void;
    clear(): void;
  }
  class CollidePointAllHitCollisionCollector extends CollidePointCollector {
    constructor();
    Sort(): void;
    HadHit(): boolean;
    get_mHits(): ArrayCollidePointResult;
    set_mHits(mHits: ArrayCollidePointResult): void;
    mHits: ArrayCollidePointResult;
  }
  class CollidePointClosestHitCollisionCollector extends CollidePointCollector {
    constructor();
    HadHit(): boolean;
    get_mHit(): CollidePointResult;
    set_mHit(mHit: CollidePointResult): void;
    mHit: CollidePointResult;
  }
  class CollidePointAnyHitCollisionCollector extends CollidePointCollector {
    constructor();
    HadHit(): boolean;
    get_mHit(): CollidePointResult;
    set_mHit(mHit: CollidePointResult): void;
    mHit: CollidePointResult;
  }
  class CollideSettingsBase {
    get_mActiveEdgeMode(): EActiveEdgeMode;
    set_mActiveEdgeMode(mActiveEdgeMode: EActiveEdgeMode): void;
    mActiveEdgeMode: EActiveEdgeMode;
    get_mCollectFacesMode(): ECollectFacesMode;
    set_mCollectFacesMode(mCollectFacesMode: ECollectFacesMode): void;
    mCollectFacesMode: ECollectFacesMode;
    get_mCollisionTolerance(): number;
    set_mCollisionTolerance(mCollisionTolerance: number): void;
    mCollisionTolerance: number;
    get_mPenetrationTolerance(): number;
    set_mPenetrationTolerance(mPenetrationTolerance: number): void;
    mPenetrationTolerance: number;
    get_mActiveEdgeMovementDirection(): Vec3;
    set_mActiveEdgeMovementDirection(mActiveEdgeMovementDirection: Vec3): void;
    mActiveEdgeMovementDirection: Vec3;
  }
  class CollideShapeSettings extends CollideSettingsBase {
    constructor();
    get_mMaxSeparationDistance(): number;
    set_mMaxSeparationDistance(mMaxSeparationDistance: number): void;
    mMaxSeparationDistance: number;
    get_mBackFaceMode(): EBackFaceMode;
    set_mBackFaceMode(mBackFaceMode: EBackFaceMode): void;
    mBackFaceMode: EBackFaceMode;
  }
  class CollideShapeCollector {
    Reset(): void;
    SetContext(inContext: TransformedShape): void;
    GetContext(): TransformedShape;
    UpdateEarlyOutFraction(inFraction: number): void;
    ResetEarlyOutFraction(inFraction?: number): void;
    ForceEarlyOut(): void;
    ShouldEarlyOut(): boolean;
    GetEarlyOutFraction(): number;
    GetPositiveEarlyOutFraction(): number;
  }
  class CollideShapeCollectorJS extends CollideShapeCollector {
    constructor();
    Reset(): void;
    OnBody(inBody: number): void;
    AddHit(inResult: number): void;
  }
  class ArrayCollideShapeResult {
    empty(): boolean;
    size(): number;
    at(inIndex: number): CollideShapeResult;
    push_back(inValue: CollideShapeResult): void;
    reserve(inSize: number): void;
    resize(inSize: number): void;
    clear(): void;
  }
  class CollideShapeAllHitCollisionCollector extends CollideShapeCollector {
    constructor();
    Sort(): void;
    HadHit(): boolean;
    get_mHits(): ArrayCollideShapeResult;
    set_mHits(mHits: ArrayCollideShapeResult): void;
    mHits: ArrayCollideShapeResult;
  }
  class CollideShapeClosestHitCollisionCollector extends CollideShapeCollector {
    constructor();
    HadHit(): boolean;
    get_mHit(): CollideShapeResult;
    set_mHit(mHit: CollideShapeResult): void;
    mHit: CollideShapeResult;
  }
  class CollideShapeAnyHitCollisionCollector extends CollideShapeCollector {
    constructor();
    HadHit(): boolean;
    get_mHit(): CollideShapeResult;
    set_mHit(mHit: CollideShapeResult): void;
    mHit: CollideShapeResult;
  }
  class ShapeCastSettings extends CollideSettingsBase {
    constructor();
    get_mBackFaceModeTriangles(): EBackFaceMode;
    set_mBackFaceModeTriangles(mBackFaceModeTriangles: EBackFaceMode): void;
    mBackFaceModeTriangles: EBackFaceMode;
    get_mBackFaceModeConvex(): EBackFaceMode;
    set_mBackFaceModeConvex(mBackFaceModeConvex: EBackFaceMode): void;
    mBackFaceModeConvex: EBackFaceMode;
    get_mUseShrunkenShapeAndConvexRadius(): boolean;
    set_mUseShrunkenShapeAndConvexRadius(
      mUseShrunkenShapeAndConvexRadius: boolean
    ): void;
    mUseShrunkenShapeAndConvexRadius: boolean;
    get_mReturnDeepestPoint(): boolean;
    set_mReturnDeepestPoint(mReturnDeepestPoint: boolean): void;
    mReturnDeepestPoint: boolean;
  }
  class ShapeCastResult extends CollideShapeResult {
    constructor();
    get_mFraction(): number;
    set_mFraction(mFraction: number): void;
    mFraction: number;
    get_mIsBackFaceHit(): boolean;
    set_mIsBackFaceHit(mIsBackFaceHit: boolean): void;
    mIsBackFaceHit: boolean;
  }
  class CastShapeCollector {
    Reset(): void;
    SetContext(inContext: TransformedShape): void;
    GetContext(): TransformedShape;
    UpdateEarlyOutFraction(inFraction: number): void;
    ResetEarlyOutFraction(inFraction?: number): void;
    ForceEarlyOut(): void;
    ShouldEarlyOut(): boolean;
    GetEarlyOutFraction(): number;
    GetPositiveEarlyOutFraction(): number;
  }
  class CastShapeCollectorJS extends CastShapeCollector {
    constructor();
    Reset(): void;
    OnBody(inBody: number): void;
    AddHit(inResult: number): void;
  }
  class ArrayShapeCastResult {
    empty(): boolean;
    size(): number;
    at(inIndex: number): ShapeCastResult;
    push_back(inValue: ShapeCastResult): void;
    reserve(inSize: number): void;
    resize(inSize: number): void;
    clear(): void;
  }
  class CastShapeAllHitCollisionCollector extends CastShapeCollector {
    constructor();
    Sort(): void;
    HadHit(): boolean;
    get_mHits(): ArrayShapeCastResult;
    set_mHits(mHits: ArrayShapeCastResult): void;
    mHits: ArrayShapeCastResult;
  }
  class CastShapeClosestHitCollisionCollector extends CastShapeCollector {
    constructor();
    HadHit(): boolean;
    get_mHit(): ShapeCastResult;
    set_mHit(mHit: ShapeCastResult): void;
    mHit: ShapeCastResult;
  }
  class CastShapeAnyHitCollisionCollector extends CastShapeCollector {
    constructor();
    HadHit(): boolean;
    get_mHit(): ShapeCastResult;
    set_mHit(mHit: ShapeCastResult): void;
    mHit: ShapeCastResult;
  }
  class TransformedShapeCollector {
    Reset(): void;
    SetContext(inContext: TransformedShape): void;
    GetContext(): TransformedShape;
    UpdateEarlyOutFraction(inFraction: number): void;
    ResetEarlyOutFraction(inFraction?: number): void;
    ForceEarlyOut(): void;
    ShouldEarlyOut(): boolean;
    GetEarlyOutFraction(): number;
    GetPositiveEarlyOutFraction(): number;
  }
  class TransformedShapeCollectorJS extends TransformedShapeCollector {
    constructor();
    Reset(): void;
    OnBody(inBody: number): void;
    AddHit(inResult: number): void;
  }
  class NarrowPhaseQuery {
    CastRay(
      inRay: RRayCast,
      inRayCastSettings: RayCastSettings,
      ioCollector: CastRayCollector,
      inBroadPhaseLayerFilter: BroadPhaseLayerFilter,
      inObjectLayerFilter: ObjectLayerFilter,
      inBodyFilter: BodyFilter,
      inShapeFilter: ShapeFilter
    ): void;
    CollidePoint(
      inPoint: RVec3,
      ioCollector: CollidePointCollector,
      inBroadPhaseLayerFilter: BroadPhaseLayerFilter,
      inObjectLayerFilter: ObjectLayerFilter,
      inBodyFilter: BodyFilter,
      inShapeFilter: ShapeFilter
    ): void;
    CollideShape(
      inShape: Shape,
      inShapeScale: Vec3,
      inCenterOfMassTransform: RMat44,
      inCollideShapeSettings: CollideShapeSettings,
      inBaseOffset: RVec3,
      ioCollector: CollideShapeCollector,
      inBroadPhaseLayerFilter: BroadPhaseLayerFilter,
      inObjectLayerFilter: ObjectLayerFilter,
      inBodyFilter: BodyFilter,
      inShapeFilter: ShapeFilter
    ): void;
    CollideShapeWithInternalEdgeRemoval(
      inShape: Shape,
      inShapeScale: Vec3,
      inCenterOfMassTransform: RMat44,
      inCollideShapeSettings: CollideShapeSettings,
      inBaseOffset: RVec3,
      ioCollector: CollideShapeCollector,
      inBroadPhaseLayerFilter: BroadPhaseLayerFilter,
      inObjectLayerFilter: ObjectLayerFilter,
      inBodyFilter: BodyFilter,
      inShapeFilter: ShapeFilter
    ): void;
    CastShape(
      inShapeCast: RShapeCast,
      inShapeCastSettings: ShapeCastSettings,
      inBaseOffset: RVec3,
      ioCollector: CastShapeCollector,
      inBroadPhaseLayerFilter: BroadPhaseLayerFilter,
      inObjectLayerFilter: ObjectLayerFilter,
      inBodyFilter: BodyFilter,
      inShapeFilter: ShapeFilter
    ): void;
    CollectTransformedShapes(
      inBox: AABox,
      ioCollector: TransformedShapeCollector,
      inBroadPhaseLayerFilter: BroadPhaseLayerFilter,
      inObjectLayerFilter: ObjectLayerFilter,
      inBodyFilter: BodyFilter,
      inShapeFilter: ShapeFilter
    ): void;
  }
  class PhysicsStepListenerContext {
    get_mDeltaTime(): number;
    set_mDeltaTime(mDeltaTime: number): void;
    mDeltaTime: number;
    get_mIsFirstStep(): boolean;
    set_mIsFirstStep(mIsFirstStep: boolean): void;
    mIsFirstStep: boolean;
    get_mIsLastStep(): boolean;
    set_mIsLastStep(mIsLastStep: boolean): void;
    mIsLastStep: boolean;
    get_mPhysicsSystem(): PhysicsSystem;
    set_mPhysicsSystem(mPhysicsSystem: PhysicsSystem): void;
    mPhysicsSystem: PhysicsSystem;
  }
  class PhysicsStepListener {}
  class PhysicsStepListenerJS extends PhysicsStepListener {
    constructor();
    OnStep(inContext: number): void;
  }
  class BodyActivationListener {}
  class BodyActivationListenerJS extends BodyActivationListener {
    constructor();
    OnBodyActivated(inBodyID: number, inBodyUserData: number): void;
    OnBodyDeactivated(inBodyID: number, inBodyUserData: number): void;
  }
  class BodyIDVector {
    constructor();
    empty(): boolean;
    size(): number;
    at(inIndex: number): BodyID;
    push_back(inBodyID: BodyID): void;
    reserve(inSize: number): void;
    resize(inSize: number): void;
    clear(): void;
  }
  class PhysicsSystem {
    SetGravity(inGravity: Vec3): void;
    GetGravity(): Vec3;
    GetPhysicsSettings(): PhysicsSettings;
    SetPhysicsSettings(inPhysicsSettings: PhysicsSettings): void;
    GetNumBodies(): number;
    GetNumActiveBodies(inBodyType: EBodyType): number;
    GetMaxBodies(): number;
    GetBodies(outBodies: BodyIDVector): void;
    GetActiveBodies(inBodyType: EBodyType, outBodies: BodyIDVector): void;
    GetBounds(): AABox;
    AddConstraint(inConstraint: Constraint): void;
    RemoveConstraint(inConstraint: Constraint): void;
    SetContactListener(inListener: ContactListener): void;
    GetContactListener(): ContactListener;
    SetSoftBodyContactListener(inListener: SoftBodyContactListener): void;
    GetSoftBodyContactListener(): SoftBodyContactListener;
    OptimizeBroadPhase(): void;
    GetBodyInterface(): BodyInterface;
    GetBodyInterfaceNoLock(): BodyInterface;
    GetBodyLockInterfaceNoLock(): BodyLockInterfaceNoLock;
    GetBodyLockInterface(): BodyLockInterfaceLocking;
    GetBroadPhaseQuery(): BroadPhaseQuery;
    GetNarrowPhaseQuery(): NarrowPhaseQuery;
    GetNarrowPhaseQueryNoLock(): NarrowPhaseQuery;
    SaveState(
      inStream: StateRecorder,
      inState?: EStateRecorderState,
      inFilter?: StateRecorderFilter
    ): void;
    RestoreState(
      inStream: StateRecorder,
      inFilter?: StateRecorderFilter
    ): boolean;
    AddStepListener(inListener: PhysicsStepListener): void;
    RemoveStepListener(inListener: PhysicsStepListener): void;
    SetBodyActivationListener(inListener: BodyActivationListener): void;
    GetBodyActivationListener(): BodyActivationListener;
    WereBodiesInContact(inBodyID1: BodyID, inBodyID2: BodyID): boolean;
    SetSimShapeFilter(inShapeFilter: SimShapeFilter): void;
    GetSimShapeFilter(): SimShapeFilter;
  }
  class MassProperties {
    constructor();
    SetMassAndInertiaOfSolidBox(inBoxSize: Vec3, inDensity: number): void;
    ScaleToMass(inMass: number): void;
    sGetEquivalentSolidBoxSize(inMass: number, inInertiaDiagonal: Vec3): Vec3;
    Rotate(inRotation: Mat44): void;
    Translate(inTranslation: Vec3): void;
    Scale(inScale: Vec3): void;
    get_mMass(): number;
    set_mMass(mMass: number): void;
    mMass: number;
    get_mInertia(): Mat44;
    set_mInertia(mInertia: Mat44): void;
    mInertia: Mat44;
  }
  class BodyCreationSettings {
    constructor();
    constructor(
      inShape: Shape,
      inPosition: RVec3,
      inRotation: Quat,
      inMotionType: EMotionType,
      inObjectLayer: number
    );
    GetShapeSettings(): ShapeSettings;
    SetShapeSettings(inShape: ShapeSettings): void;
    ConvertShapeSettings(): ShapeResult;
    GetShape(): Shape;
    SetShape(inShape: Shape): void;
    HasMassProperties(): boolean;
    GetMassProperties(): MassProperties;
    get_mPosition(): RVec3;
    set_mPosition(mPosition: RVec3): void;
    mPosition: RVec3;
    get_mRotation(): Quat;
    set_mRotation(mRotation: Quat): void;
    mRotation: Quat;
    get_mLinearVelocity(): Vec3;
    set_mLinearVelocity(mLinearVelocity: Vec3): void;
    mLinearVelocity: Vec3;
    get_mAngularVelocity(): Vec3;
    set_mAngularVelocity(mAngularVelocity: Vec3): void;
    mAngularVelocity: Vec3;
    get_mUserData(): number;
    set_mUserData(mUserData: number): void;
    mUserData: number;
    get_mObjectLayer(): number;
    set_mObjectLayer(mObjectLayer: number): void;
    mObjectLayer: number;
    get_mCollisionGroup(): CollisionGroup;
    set_mCollisionGroup(mCollisionGroup: CollisionGroup): void;
    mCollisionGroup: CollisionGroup;
    get_mMotionType(): EMotionType;
    set_mMotionType(mMotionType: EMotionType): void;
    mMotionType: EMotionType;
    get_mAllowedDOFs(): EAllowedDOFs;
    set_mAllowedDOFs(mAllowedDOFs: EAllowedDOFs): void;
    mAllowedDOFs: EAllowedDOFs;
    get_mAllowDynamicOrKinematic(): boolean;
    set_mAllowDynamicOrKinematic(mAllowDynamicOrKinematic: boolean): void;
    mAllowDynamicOrKinematic: boolean;
    get_mIsSensor(): boolean;
    set_mIsSensor(mIsSensor: boolean): void;
    mIsSensor: boolean;
    get_mUseManifoldReduction(): boolean;
    set_mUseManifoldReduction(mUseManifoldReduction: boolean): void;
    mUseManifoldReduction: boolean;
    get_mCollideKinematicVsNonDynamic(): boolean;
    set_mCollideKinematicVsNonDynamic(
      mCollideKinematicVsNonDynamic: boolean
    ): void;
    mCollideKinematicVsNonDynamic: boolean;
    get_mApplyGyroscopicForce(): boolean;
    set_mApplyGyroscopicForce(mApplyGyroscopicForce: boolean): void;
    mApplyGyroscopicForce: boolean;
    get_mMotionQuality(): EMotionQuality;
    set_mMotionQuality(mMotionQuality: EMotionQuality): void;
    mMotionQuality: EMotionQuality;
    get_mEnhancedInternalEdgeRemoval(): boolean;
    set_mEnhancedInternalEdgeRemoval(
      mEnhancedInternalEdgeRemoval: boolean
    ): void;
    mEnhancedInternalEdgeRemoval: boolean;
    get_mAllowSleeping(): boolean;
    set_mAllowSleeping(mAllowSleeping: boolean): void;
    mAllowSleeping: boolean;
    get_mFriction(): number;
    set_mFriction(mFriction: number): void;
    mFriction: number;
    get_mRestitution(): number;
    set_mRestitution(mRestitution: number): void;
    mRestitution: number;
    get_mLinearDamping(): number;
    set_mLinearDamping(mLinearDamping: number): void;
    mLinearDamping: number;
    get_mAngularDamping(): number;
    set_mAngularDamping(mAngularDamping: number): void;
    mAngularDamping: number;
    get_mMaxLinearVelocity(): number;
    set_mMaxLinearVelocity(mMaxLinearVelocity: number): void;
    mMaxLinearVelocity: number;
    get_mMaxAngularVelocity(): number;
    set_mMaxAngularVelocity(mMaxAngularVelocity: number): void;
    mMaxAngularVelocity: number;
    get_mGravityFactor(): number;
    set_mGravityFactor(mGravityFactor: number): void;
    mGravityFactor: number;
    get_mNumVelocityStepsOverride(): number;
    set_mNumVelocityStepsOverride(mNumVelocityStepsOverride: number): void;
    mNumVelocityStepsOverride: number;
    get_mNumPositionStepsOverride(): number;
    set_mNumPositionStepsOverride(mNumPositionStepsOverride: number): void;
    mNumPositionStepsOverride: number;
    get_mOverrideMassProperties(): EOverrideMassProperties;
    set_mOverrideMassProperties(
      mOverrideMassProperties: EOverrideMassProperties
    ): void;
    mOverrideMassProperties: EOverrideMassProperties;
    get_mInertiaMultiplier(): number;
    set_mInertiaMultiplier(mInertiaMultiplier: number): void;
    mInertiaMultiplier: number;
    get_mMassPropertiesOverride(): MassProperties;
    set_mMassPropertiesOverride(mMassPropertiesOverride: MassProperties): void;
    mMassPropertiesOverride: MassProperties;
  }
  class SoftBodySharedSettingsVertex {
    constructor();
    get_mPosition(): Float3;
    set_mPosition(mPosition: Float3): void;
    mPosition: Float3;
    get_mVelocity(): Float3;
    set_mVelocity(mVelocity: Float3): void;
    mVelocity: Float3;
    get_mInvMass(): number;
    set_mInvMass(mInvMass: number): void;
    mInvMass: number;
  }
  class SoftBodySharedSettingsFace {
    constructor(
      inVertex1: number,
      inVertex2: number,
      inVertex3: number,
      inMaterialIndex: number
    );
    get_mVertex(index: number): number;
    set_mVertex(index: number, mVertex: number): void;
    mVertex: number;
    get_mMaterialIndex(): number;
    set_mMaterialIndex(mMaterialIndex: number): void;
    mMaterialIndex: number;
  }
  class SoftBodySharedSettingsEdge {
    constructor(inVertex1: number, inVertex2: number, inCompliance: number);
    get_mVertex(index: number): number;
    set_mVertex(index: number, mVertex: number): void;
    mVertex: number;
    get_mRestLength(): number;
    set_mRestLength(mRestLength: number): void;
    mRestLength: number;
    get_mCompliance(): number;
    set_mCompliance(mCompliance: number): void;
    mCompliance: number;
  }
  class SoftBodySharedSettingsDihedralBend {
    constructor(
      inVertex1: number,
      inVertex2: number,
      inVertex3: number,
      inVertex4: number,
      inCompliance: number
    );
    get_mVertex(index: number): number;
    set_mVertex(index: number, mVertex: number): void;
    mVertex: number;
    get_mCompliance(): number;
    set_mCompliance(mCompliance: number): void;
    mCompliance: number;
    get_mInitialAngle(): number;
    set_mInitialAngle(mInitialAngle: number): void;
    mInitialAngle: number;
  }
  class SoftBodySharedSettingsVolume {
    constructor(
      inVertex1: number,
      inVertex2: number,
      inVertex3: number,
      inVertex4: number,
      inCompliance: number
    );
    get_mVertex(index: number): number;
    set_mVertex(index: number, mVertex: number): void;
    mVertex: number;
    get_mSixRestVolume(): number;
    set_mSixRestVolume(mSixRestVolume: number): void;
    mSixRestVolume: number;
    get_mCompliance(): number;
    set_mCompliance(mCompliance: number): void;
    mCompliance: number;
  }
  class SoftBodySharedSettingsInvBind {
    get_mJointIndex(): number;
    set_mJointIndex(mJointIndex: number): void;
    mJointIndex: number;
    get_mInvBind(): Mat44;
    set_mInvBind(mInvBind: Mat44): void;
    mInvBind: Mat44;
  }
  class SoftBodySharedSettingsSkinWeight {
    get_mInvBindIndex(): number;
    set_mInvBindIndex(mInvBindIndex: number): void;
    mInvBindIndex: number;
    get_mWeight(): number;
    set_mWeight(mWeight: number): void;
    mWeight: number;
  }
  class SoftBodySharedSettingsSkinned {
    get_mVertex(): number;
    set_mVertex(mVertex: number): void;
    mVertex: number;
    get_mWeights(index: number): SoftBodySharedSettingsSkinWeight;
    set_mWeights(
      index: number,
      mWeights: SoftBodySharedSettingsSkinWeight
    ): void;
    mWeights: SoftBodySharedSettingsSkinWeight;
    get_mMaxDistance(): number;
    set_mMaxDistance(mMaxDistance: number): void;
    mMaxDistance: number;
    get_mBackStopDistance(): number;
    set_mBackStopDistance(mBackStopDistance: number): void;
    mBackStopDistance: number;
    get_mBackStopRadius(): number;
    set_mBackStopRadius(mBackStopRadius: number): void;
    mBackStopRadius: number;
  }
  class SoftBodySharedSettingsLRA {
    constructor(inVertex1: number, inVertex2: number, inMaxDistance: number);
    get_mVertex(index: number): number;
    set_mVertex(index: number, mVertex: number): void;
    mVertex: number;
    get_mMaxDistance(): number;
    set_mMaxDistance(mMaxDistance: number): void;
    mMaxDistance: number;
  }
  class ArraySoftBodySharedSettingsVertex {
    empty(): boolean;
    size(): number;
    at(inIndex: number): SoftBodySharedSettingsVertex;
    push_back(inValue: SoftBodySharedSettingsVertex): void;
    reserve(inSize: number): void;
    resize(inSize: number): void;
    clear(): void;
  }
  class ArraySoftBodySharedSettingsFace {
    empty(): boolean;
    size(): number;
    at(inIndex: number): SoftBodySharedSettingsFace;
    push_back(inValue: SoftBodySharedSettingsFace): void;
    reserve(inSize: number): void;
    resize(inSize: number): void;
    clear(): void;
  }
  class ArraySoftBodySharedSettingsEdge {
    empty(): boolean;
    size(): number;
    at(inIndex: number): SoftBodySharedSettingsEdge;
    push_back(inValue: SoftBodySharedSettingsEdge): void;
    reserve(inSize: number): void;
    resize(inSize: number): void;
    clear(): void;
  }
  class ArraySoftBodySharedSettingsDihedralBend {
    empty(): boolean;
    size(): number;
    at(inIndex: number): SoftBodySharedSettingsDihedralBend;
    push_back(inValue: SoftBodySharedSettingsDihedralBend): void;
    reserve(inSize: number): void;
    resize(inSize: number): void;
    clear(): void;
  }
  class ArraySoftBodySharedSettingsVolume {
    empty(): boolean;
    size(): number;
    at(inIndex: number): SoftBodySharedSettingsVolume;
    push_back(inValue: SoftBodySharedSettingsVolume): void;
    reserve(inSize: number): void;
    resize(inSize: number): void;
    clear(): void;
  }
  class ArraySoftBodySharedSettingsInvBind {
    empty(): boolean;
    size(): number;
    at(inIndex: number): SoftBodySharedSettingsInvBind;
    push_back(inValue: SoftBodySharedSettingsInvBind): void;
    reserve(inSize: number): void;
    resize(inSize: number): void;
    clear(): void;
  }
  class ArraySoftBodySharedSettingsSkinned {
    empty(): boolean;
    size(): number;
    at(inIndex: number): SoftBodySharedSettingsSkinned;
    push_back(inValue: SoftBodySharedSettingsSkinned): void;
    reserve(inSize: number): void;
    resize(inSize: number): void;
    clear(): void;
  }
  class ArraySoftBodySharedSettingsLRA {
    empty(): boolean;
    size(): number;
    at(inIndex: number): SoftBodySharedSettingsLRA;
    push_back(inValue: SoftBodySharedSettingsLRA): void;
    reserve(inSize: number): void;
    resize(inSize: number): void;
    clear(): void;
  }
  class SoftBodySharedSettingsVertexAttributes {
    constructor();
    get_mCompliance(): number;
    set_mCompliance(mCompliance: number): void;
    mCompliance: number;
    get_mShearCompliance(): number;
    set_mShearCompliance(mShearCompliance: number): void;
    mShearCompliance: number;
    get_mBendCompliance(): number;
    set_mBendCompliance(mBendCompliance: number): void;
    mBendCompliance: number;
    get_mLRAType(): SoftBodySharedSettings_ELRAType;
    set_mLRAType(mLRAType: SoftBodySharedSettings_ELRAType): void;
    mLRAType: SoftBodySharedSettings_ELRAType;
    get_mLRAMaxDistanceMultiplier(): number;
    set_mLRAMaxDistanceMultiplier(mLRAMaxDistanceMultiplier: number): void;
    mLRAMaxDistanceMultiplier: number;
  }
  class ArraySoftBodySharedSettingsVertexAttributes {
    empty(): boolean;
    size(): number;
    at(inIndex: number): SoftBodySharedSettingsVertexAttributes;
    push_back(inValue: SoftBodySharedSettingsVertexAttributes): void;
    reserve(inSize: number): void;
    resize(inSize: number): void;
    clear(): void;
    data(): SoftBodySharedSettingsVertexAttributes;
  }
  class SoftBodySharedSettings {
    constructor();
    GetRefCount(): number;
    AddRef(): void;
    Release(): void;
    CreateConstraints(
      inVertexAttributes: SoftBodySharedSettingsVertexAttributes,
      inVertexAttributesLength: number,
      inBendType?: SoftBodySharedSettings_EBendType,
      inAngleTolerance?: number
    ): void;
    AddFace(inFace: SoftBodySharedSettingsFace): void;
    CalculateEdgeLengths(): void;
    CalculateLRALengths(): void;
    CalculateBendConstraintConstants(): void;
    CalculateVolumeConstraintVolumes(): void;
    CalculateSkinnedConstraintNormals(): void;
    Optimize(): void;
    Clone(): SoftBodySharedSettings;
    get_mVertices(): ArraySoftBodySharedSettingsVertex;
    set_mVertices(mVertices: ArraySoftBodySharedSettingsVertex): void;
    mVertices: ArraySoftBodySharedSettingsVertex;
    get_mFaces(): ArraySoftBodySharedSettingsFace;
    set_mFaces(mFaces: ArraySoftBodySharedSettingsFace): void;
    mFaces: ArraySoftBodySharedSettingsFace;
    get_mEdgeConstraints(): ArraySoftBodySharedSettingsEdge;
    set_mEdgeConstraints(
      mEdgeConstraints: ArraySoftBodySharedSettingsEdge
    ): void;
    mEdgeConstraints: ArraySoftBodySharedSettingsEdge;
    get_mDihedralBendConstraints(): ArraySoftBodySharedSettingsDihedralBend;
    set_mDihedralBendConstraints(
      mDihedralBendConstraints: ArraySoftBodySharedSettingsDihedralBend
    ): void;
    mDihedralBendConstraints: ArraySoftBodySharedSettingsDihedralBend;
    get_mVolumeConstraints(): ArraySoftBodySharedSettingsVolume;
    set_mVolumeConstraints(
      mVolumeConstraints: ArraySoftBodySharedSettingsVolume
    ): void;
    mVolumeConstraints: ArraySoftBodySharedSettingsVolume;
    get_mSkinnedConstraints(): ArraySoftBodySharedSettingsSkinned;
    set_mSkinnedConstraints(
      mSkinnedConstraints: ArraySoftBodySharedSettingsSkinned
    ): void;
    mSkinnedConstraints: ArraySoftBodySharedSettingsSkinned;
    get_mInvBindMatrices(): ArraySoftBodySharedSettingsInvBind;
    set_mInvBindMatrices(
      mInvBindMatrices: ArraySoftBodySharedSettingsInvBind
    ): void;
    mInvBindMatrices: ArraySoftBodySharedSettingsInvBind;
    get_mLRAConstraints(): ArraySoftBodySharedSettingsLRA;
    set_mLRAConstraints(mLRAConstraints: ArraySoftBodySharedSettingsLRA): void;
    mLRAConstraints: ArraySoftBodySharedSettingsLRA;
    get_mMaterials(): PhysicsMaterialList;
    set_mMaterials(mMaterials: PhysicsMaterialList): void;
    mMaterials: PhysicsMaterialList;
    get_mVertexRadius(): number;
    set_mVertexRadius(mVertexRadius: number): void;
    mVertexRadius: number;
  }
  class SoftBodyCreationSettings {
    constructor(
      inSettings: SoftBodySharedSettings,
      inPosition: RVec3,
      inRotation: Quat,
      inObjectLayer: number
    );
    get_mPosition(): RVec3;
    set_mPosition(mPosition: RVec3): void;
    mPosition: RVec3;
    get_mRotation(): Quat;
    set_mRotation(mRotation: Quat): void;
    mRotation: Quat;
    get_mUserData(): number;
    set_mUserData(mUserData: number): void;
    mUserData: number;
    get_mObjectLayer(): number;
    set_mObjectLayer(mObjectLayer: number): void;
    mObjectLayer: number;
    get_mCollisionGroup(): CollisionGroup;
    set_mCollisionGroup(mCollisionGroup: CollisionGroup): void;
    mCollisionGroup: CollisionGroup;
    get_mNumIterations(): number;
    set_mNumIterations(mNumIterations: number): void;
    mNumIterations: number;
    get_mLinearDamping(): number;
    set_mLinearDamping(mLinearDamping: number): void;
    mLinearDamping: number;
    get_mMaxLinearVelocity(): number;
    set_mMaxLinearVelocity(mMaxLinearVelocity: number): void;
    mMaxLinearVelocity: number;
    get_mRestitution(): number;
    set_mRestitution(mRestitution: number): void;
    mRestitution: number;
    get_mFriction(): number;
    set_mFriction(mFriction: number): void;
    mFriction: number;
    get_mPressure(): number;
    set_mPressure(mPressure: number): void;
    mPressure: number;
    get_mGravityFactor(): number;
    set_mGravityFactor(mGravityFactor: number): void;
    mGravityFactor: number;
    get_mUpdatePosition(): boolean;
    set_mUpdatePosition(mUpdatePosition: boolean): void;
    mUpdatePosition: boolean;
    get_mMakeRotationIdentity(): boolean;
    set_mMakeRotationIdentity(mMakeRotationIdentity: boolean): void;
    mMakeRotationIdentity: boolean;
    get_mAllowSleeping(): boolean;
    set_mAllowSleeping(mAllowSleeping: boolean): void;
    mAllowSleeping: boolean;
  }
  class SoftBodyVertex {
    get_mPreviousPosition(): Vec3;
    set_mPreviousPosition(mPreviousPosition: Vec3): void;
    mPreviousPosition: Vec3;
    get_mPosition(): Vec3;
    set_mPosition(mPosition: Vec3): void;
    mPosition: Vec3;
    get_mVelocity(): Vec3;
    set_mVelocity(mVelocity: Vec3): void;
    mVelocity: Vec3;
    get_mInvMass(): number;
    set_mInvMass(mInvMass: number): void;
    mInvMass: number;
  }
  class SoftBodyVertexTraits {
    get_mPreviousPositionOffset(): number;
    set_mPreviousPositionOffset(mPreviousPositionOffset: number): void;
    readonly mPreviousPositionOffset: number;
    get_mPositionOffset(): number;
    set_mPositionOffset(mPositionOffset: number): void;
    readonly mPositionOffset: number;
    get_mVelocityOffset(): number;
    set_mVelocityOffset(mVelocityOffset: number): void;
    readonly mVelocityOffset: number;
  }
  class ArraySoftBodyVertex {
    empty(): boolean;
    size(): number;
    at(inIndex: number): SoftBodyVertex;
    push_back(inValue: SoftBodyVertex): void;
    reserve(inSize: number): void;
    resize(inSize: number): void;
    clear(): void;
  }
  class SoftBodyMotionProperties extends MotionProperties {
    GetSettings(): SoftBodySharedSettings;
    GetVertices(): ArraySoftBodyVertex;
    GetVertex(inIndex: number): SoftBodyVertex;
    GetMaterials(): PhysicsMaterialList;
    GetFaces(): ArraySoftBodySharedSettingsFace;
    GetFace(inIndex: number): SoftBodySharedSettingsFace;
    GetNumIterations(): number;
    SetNumIterations(inNumIterations: number): void;
    GetPressure(): number;
    SetPressure(inPressure: number): void;
    GetUpdatePosition(): boolean;
    SetUpdatePosition(inUpdatePosition: boolean): void;
    GetEnableSkinConstraints(): boolean;
    SetEnableSkinConstraints(inEnableSkinConstraints: boolean): void;
    GetSkinnedMaxDistanceMultiplier(): number;
    SetSkinnedMaxDistanceMultiplier(
      inSkinnedMaxDistanceMultiplier: number
    ): void;
    GetLocalBounds(): AABox;
    CustomUpdate(
      inDeltaTime: number,
      ioSoftBody: Body,
      inSystem: PhysicsSystem
    ): void;
    SkinVertices(
      inRootTransform: RMat44,
      inJointMatrices: Mat44MemRef,
      inNumJoints: number,
      inHardSkinAll: boolean,
      ioTempAllocator: TempAllocator
    ): void;
  }
  class SoftBodyShape extends Shape {
    GetSubShapeIDBits(): number;
    GetFaceIndex(inSubShapeID: SubShapeID): number;
  }
  class CharacterBaseSettings {
    GetRefCount(): number;
    AddRef(): void;
    Release(): void;
    get_mUp(): Vec3;
    set_mUp(mUp: Vec3): void;
    mUp: Vec3;
    get_mSupportingVolume(): Plane;
    set_mSupportingVolume(mSupportingVolume: Plane): void;
    mSupportingVolume: Plane;
    get_mMaxSlopeAngle(): number;
    set_mMaxSlopeAngle(mMaxSlopeAngle: number): void;
    mMaxSlopeAngle: number;
    get_mEnhancedInternalEdgeRemoval(): boolean;
    set_mEnhancedInternalEdgeRemoval(
      mEnhancedInternalEdgeRemoval: boolean
    ): void;
    mEnhancedInternalEdgeRemoval: boolean;
    get_mShape(): Shape;
    set_mShape(mShape: Shape): void;
    mShape: Shape;
  }
  class CharacterVirtualSettings extends CharacterBaseSettings {
    constructor();
    get_mMass(): number;
    set_mMass(mMass: number): void;
    mMass: number;
    get_mMaxStrength(): number;
    set_mMaxStrength(mMaxStrength: number): void;
    mMaxStrength: number;
    get_mShapeOffset(): Vec3;
    set_mShapeOffset(mShapeOffset: Vec3): void;
    mShapeOffset: Vec3;
    get_mBackFaceMode(): EBackFaceMode;
    set_mBackFaceMode(mBackFaceMode: EBackFaceMode): void;
    mBackFaceMode: EBackFaceMode;
    get_mPredictiveContactDistance(): number;
    set_mPredictiveContactDistance(mPredictiveContactDistance: number): void;
    mPredictiveContactDistance: number;
    get_mMaxCollisionIterations(): number;
    set_mMaxCollisionIterations(mMaxCollisionIterations: number): void;
    mMaxCollisionIterations: number;
    get_mMaxConstraintIterations(): number;
    set_mMaxConstraintIterations(mMaxConstraintIterations: number): void;
    mMaxConstraintIterations: number;
    get_mMinTimeRemaining(): number;
    set_mMinTimeRemaining(mMinTimeRemaining: number): void;
    mMinTimeRemaining: number;
    get_mCollisionTolerance(): number;
    set_mCollisionTolerance(mCollisionTolerance: number): void;
    mCollisionTolerance: number;
    get_mCharacterPadding(): number;
    set_mCharacterPadding(mCharacterPadding: number): void;
    mCharacterPadding: number;
    get_mMaxNumHits(): number;
    set_mMaxNumHits(mMaxNumHits: number): void;
    mMaxNumHits: number;
    get_mHitReductionCosMaxAngle(): number;
    set_mHitReductionCosMaxAngle(mHitReductionCosMaxAngle: number): void;
    mHitReductionCosMaxAngle: number;
    get_mPenetrationRecoverySpeed(): number;
    set_mPenetrationRecoverySpeed(mPenetrationRecoverySpeed: number): void;
    mPenetrationRecoverySpeed: number;
    get_mInnerBodyShape(): Shape;
    set_mInnerBodyShape(mInnerBodyShape: Shape): void;
    mInnerBodyShape: Shape;
    get_mInnerBodyLayer(): number;
    set_mInnerBodyLayer(mInnerBodyLayer: number): void;
    mInnerBodyLayer: number;
  }
  class CharacterContactSettings {
    constructor();
    get_mCanPushCharacter(): boolean;
    set_mCanPushCharacter(mCanPushCharacter: boolean): void;
    mCanPushCharacter: boolean;
    get_mCanReceiveImpulses(): boolean;
    set_mCanReceiveImpulses(mCanReceiveImpulses: boolean): void;
    mCanReceiveImpulses: boolean;
  }
  class CharacterContactListener {}
  class CharacterContactListenerEm extends CharacterContactListener {}
  class CharacterContactListenerJS extends CharacterContactListenerEm {
    constructor();
    OnAdjustBodyVelocity(
      inCharacter: number,
      inBody2: number,
      ioLinearVelocity: number,
      ioAngularVelocity: number
    ): void;
    OnContactValidate(
      inCharacter: number,
      inBodyID2: number,
      inSubShapeID2: number
    ): boolean;
    OnCharacterContactValidate(
      inCharacter: number,
      inOtherCharacter: number,
      inSubShapeID2: number
    ): boolean;
    OnContactAdded(
      inCharacter: number,
      inBodyID2: number,
      inSubShapeID2: number,
      inContactPosition: number,
      inContactNormal: number,
      ioSettings: number
    ): void;
    OnCharacterContactAdded(
      inCharacter: number,
      inOtherCharacter: number,
      inSubShapeID2: number,
      inContactPosition: number,
      inContactNormal: number,
      ioSettings: number
    ): void;
    OnContactSolve(
      inCharacter: number,
      inBodyID2: number,
      inSubShapeID2: number,
      inContactPosition: number,
      inContactNormal: number,
      inContactVelocity: number,
      inContactMaterial: number,
      inCharacterVelocity: number,
      ioNewCharacterVelocity: number
    ): void;
    OnCharacterContactSolve(
      inCharacter: number,
      inOtherCharacter: number,
      inSubShapeID2: number,
      inContactPosition: number,
      inContactNormal: number,
      inContactVelocity: number,
      inContactMaterial: number,
      inCharacterVelocity: number,
      ioNewCharacterVelocity: number
    ): void;
  }
  class CharacterVsCharacterCollision {}
  class CharacterVsCharacterCollisionSimple extends CharacterVsCharacterCollision {
    constructor();
    Add(inCharacter: CharacterVirtual): void;
    Remove(inCharacter: CharacterVirtual): void;
  }
  class ExtendedUpdateSettings {
    constructor();
    get_mStickToFloorStepDown(): Vec3;
    set_mStickToFloorStepDown(mStickToFloorStepDown: Vec3): void;
    mStickToFloorStepDown: Vec3;
    get_mWalkStairsStepUp(): Vec3;
    set_mWalkStairsStepUp(mWalkStairsStepUp: Vec3): void;
    mWalkStairsStepUp: Vec3;
    get_mWalkStairsMinStepForward(): number;
    set_mWalkStairsMinStepForward(mWalkStairsMinStepForward: number): void;
    mWalkStairsMinStepForward: number;
    get_mWalkStairsStepForwardTest(): number;
    set_mWalkStairsStepForwardTest(mWalkStairsStepForwardTest: number): void;
    mWalkStairsStepForwardTest: number;
    get_mWalkStairsCosAngleForwardContact(): number;
    set_mWalkStairsCosAngleForwardContact(
      mWalkStairsCosAngleForwardContact: number
    ): void;
    mWalkStairsCosAngleForwardContact: number;
    get_mWalkStairsStepDownExtra(): Vec3;
    set_mWalkStairsStepDownExtra(mWalkStairsStepDownExtra: Vec3): void;
    mWalkStairsStepDownExtra: Vec3;
  }
  class CharacterVirtualContact {
    IsSameBody(inOther: CharacterVirtualContact): boolean;
    get_mPosition(): RVec3;
    set_mPosition(mPosition: RVec3): void;
    mPosition: RVec3;
    get_mLinearVelocity(): Vec3;
    set_mLinearVelocity(mLinearVelocity: Vec3): void;
    mLinearVelocity: Vec3;
    get_mContactNormal(): Vec3;
    set_mContactNormal(mContactNormal: Vec3): void;
    mContactNormal: Vec3;
    get_mSurfaceNormal(): Vec3;
    set_mSurfaceNormal(mSurfaceNormal: Vec3): void;
    mSurfaceNormal: Vec3;
    get_mDistance(): number;
    set_mDistance(mDistance: number): void;
    mDistance: number;
    get_mFraction(): number;
    set_mFraction(mFraction: number): void;
    mFraction: number;
    get_mBodyB(): BodyID;
    set_mBodyB(mBodyB: BodyID): void;
    mBodyB: BodyID;
    get_mCharacterB(): CharacterVirtual;
    set_mCharacterB(mCharacterB: CharacterVirtual): void;
    mCharacterB: CharacterVirtual;
    get_mSubShapeIDB(): SubShapeID;
    set_mSubShapeIDB(mSubShapeIDB: SubShapeID): void;
    mSubShapeIDB: SubShapeID;
    get_mMotionTypeB(): EMotionType;
    set_mMotionTypeB(mMotionTypeB: EMotionType): void;
    mMotionTypeB: EMotionType;
    get_mIsSensorB(): boolean;
    set_mIsSensorB(mIsSensorB: boolean): void;
    mIsSensorB: boolean;
    get_mUserData(): number;
    set_mUserData(mUserData: number): void;
    mUserData: number;
    get_mMaterial(): PhysicsMaterial;
    set_mMaterial(mMaterial: PhysicsMaterial): void;
    mMaterial: PhysicsMaterial;
    get_mHadCollision(): boolean;
    set_mHadCollision(mHadCollision: boolean): void;
    mHadCollision: boolean;
    get_mWasDiscarded(): boolean;
    set_mWasDiscarded(mWasDiscarded: boolean): void;
    mWasDiscarded: boolean;
    get_mCanPushCharacter(): boolean;
    set_mCanPushCharacter(mCanPushCharacter: boolean): void;
    mCanPushCharacter: boolean;
  }
  class ArrayCharacterVirtualContact {
    empty(): boolean;
    size(): number;
    at(inIndex: number): CharacterVirtualContact;
  }
  class TempAllocator {}
  class BroadPhaseLayerFilter {
    constructor();
  }
  class ObjectVsBroadPhaseLayerFilter {
    constructor();
  }
  class ObjectVsBroadPhaseLayerFilterEm extends ObjectVsBroadPhaseLayerFilter {}
  class ObjectVsBroadPhaseLayerFilterJS extends ObjectVsBroadPhaseLayerFilterEm {
    constructor();
    ShouldCollide(inLayer1: number, inLayer2: number): boolean;
  }
  class DefaultBroadPhaseLayerFilter extends ObjectLayerFilter {
    constructor(inFilter: ObjectVsBroadPhaseLayerFilter, inObjectLayer: number);
  }
  class ObjectLayerFilter {
    constructor();
  }
  class ObjectLayerFilterJS extends ObjectLayerFilter {
    constructor();
    ShouldCollide(inLayer: number): boolean;
  }
  class ObjectLayerPairFilter {
    constructor();
    ShouldCollide(inLayer1: number, inLayer2: number): boolean;
  }
  class ObjectLayerPairFilterJS extends ObjectLayerPairFilter {
    constructor();
    ShouldCollide(inLayer1: number, inLayer2: number): boolean;
  }
  class DefaultObjectLayerFilter extends ObjectLayerFilter {
    constructor(inFilter: ObjectLayerPairFilter, inObjectLayer: number);
  }
  class SpecifiedObjectLayerFilter extends ObjectLayerFilter {
    constructor(inObjectLayer: number);
  }
  class BodyFilter {
    constructor();
  }
  class BodyFilterJS extends BodyFilter {
    constructor();
    ShouldCollide(inBodyID: number): boolean;
    ShouldCollideLocked(inBody: number): boolean;
  }
  class IgnoreSingleBodyFilter extends BodyFilter {
    constructor(inBodyID: BodyID);
  }
  class IgnoreMultipleBodiesFilter extends BodyFilter {
    constructor();
    Clear(): void;
    Reserve(inSize: number): void;
    IgnoreBody(inBodyID: BodyID): void;
  }
  class ShapeFilter {
    constructor();
  }
  class ShapeFilterJS extends ShapeFilter {
    constructor();
    ShouldCollide(inShape2: number, inSubShapeIDOfShape2: number): boolean;
  }
  class ShapeFilterJS2 extends ShapeFilter {
    constructor();
    ShouldCollide(
      inShape1: number,
      inSubShapeIDOfShape1: number,
      inShape2: number,
      inSubShapeIDOfShape2: number
    ): boolean;
  }
  class SimShapeFilter {
    constructor();
  }
  class SimShapeFilterJS extends SimShapeFilter {
    constructor();
    ShouldCollide(
      inBody1: number,
      inShape1: number,
      inSubShapeIDOfShape1: number,
      inBody2: number,
      inShape2: number,
      inSubShapeIDOfShape2: number
    ): boolean;
  }
  class CharacterBase {
    GetRefCount(): number;
    AddRef(): void;
    Release(): void;
    SetMaxSlopeAngle(inMaxSlopeAngle: number): void;
    GetCosMaxSlopeAngle(): number;
    SetUp(inUp: Vec3): void;
    GetUp(): Vec3;
    GetShape(): Shape;
    GetGroundState(): EGroundState;
    IsSlopeTooSteep(inNormal: Vec3): boolean;
    IsSupported(): boolean;
    GetGroundPosition(): RVec3;
    GetGroundNormal(): Vec3;
    GetGroundVelocity(): Vec3;
    GetGroundMaterial(): PhysicsMaterial;
    GetGroundBodyID(): BodyID;
    SaveState(inStream: StateRecorder): void;
    RestoreState(inStream: StateRecorder): void;
  }
  class CharacterVirtual extends CharacterBase {
    constructor(
      inSettings: CharacterVirtualSettings,
      inPosition: RVec3,
      inRotation: Quat,
      inSystem: PhysicsSystem
    );
    SetListener(inListener: CharacterContactListener): void;
    SetCharacterVsCharacterCollision(
      inCharacterVsCharacterCollision: CharacterVsCharacterCollision
    ): void;
    GetListener(): CharacterContactListener;
    GetLinearVelocity(): Vec3;
    SetLinearVelocity(inLinearVelocity: Vec3): void;
    GetPosition(): RVec3;
    SetPosition(inPosition: RVec3): void;
    GetRotation(): Quat;
    SetRotation(inRotation: Quat): void;
    GetCenterOfMassPosition(): RVec3;
    GetWorldTransform(): RMat44;
    GetCenterOfMassTransform(): RMat44;
    GetMass(): number;
    SetMass(inMass: number): void;
    GetMaxStrength(): number;
    SetMaxStrength(inMaxStrength: number): void;
    GetPenetrationRecoverySpeed(): number;
    SetPenetrationRecoverySpeed(inSpeed: number): void;
    GetCharacterPadding(): number;
    GetMaxNumHits(): number;
    SetMaxNumHits(inMaxHits: number): void;
    GetHitReductionCosMaxAngle(): number;
    SetHitReductionCosMaxAngle(inCosMaxAngle: number): void;
    GetMaxHitsExceeded(): boolean;
    GetShapeOffset(): Vec3;
    SetShapeOffset(inShapeOffset: Vec3): void;
    GetUserData(): number;
    SetUserData(inUserData: number): void;
    GetInnerBodyID(): BodyID;
    CancelVelocityTowardsSteepSlopes(inDesiredVelocity: Vec3): Vec3;
    Update(
      inDeltaTime: number,
      inGravity: Vec3,
      inBroadPhaseLayerFilter: BroadPhaseLayerFilter,
      inObjectLayerFilter: ObjectLayerFilter,
      inBodyFilter: BodyFilter,
      inShapeFilter: ShapeFilter,
      inAllocator: TempAllocator
    ): void;
    CanWalkStairs(inLinearVelocity: Vec3): boolean;
    WalkStairs(
      inDeltaTime: number,
      inStepUp: Vec3,
      inStepForward: Vec3,
      inStepForwardTest: Vec3,
      inStepDownExtra: Vec3,
      inBroadPhaseLayerFilter: BroadPhaseLayerFilter,
      inObjectLayerFilter: ObjectLayerFilter,
      inBodyFilter: BodyFilter,
      inShapeFilter: ShapeFilter,
      inAllocator: TempAllocator
    ): boolean;
    StickToFloor(
      inStepDown: Vec3,
      inBroadPhaseLayerFilter: BroadPhaseLayerFilter,
      inObjectLayerFilter: ObjectLayerFilter,
      inBodyFilter: BodyFilter,
      inShapeFilter: ShapeFilter,
      inAllocator: TempAllocator
    ): boolean;
    ExtendedUpdate(
      inDeltaTime: number,
      inGravity: Vec3,
      inSettings: ExtendedUpdateSettings,
      inBroadPhaseLayerFilter: BroadPhaseLayerFilter,
      inObjectLayerFilter: ObjectLayerFilter,
      inBodyFilter: BodyFilter,
      inShapeFilter: ShapeFilter,
      inAllocator: TempAllocator
    ): void;
    RefreshContacts(
      inBroadPhaseLayerFilter: BroadPhaseLayerFilter,
      inObjectLayerFilter: ObjectLayerFilter,
      inBodyFilter: BodyFilter,
      inShapeFilter: ShapeFilter,
      inAllocator: TempAllocator
    ): void;
    UpdateGroundVelocity(): void;
    SetShape(
      inShape: Shape,
      inMaxPenetrationDepth: number,
      inBroadPhaseLayerFilter: BroadPhaseLayerFilter,
      inObjectLayerFilter: ObjectLayerFilter,
      inBodyFilter: BodyFilter,
      inShapeFilter: ShapeFilter,
      inAllocator: TempAllocator
    ): boolean;
    SetInnerBodyShape(inShape: Shape): void;
    GetTransformedShape(): TransformedShape;
    HasCollidedWith(inBodyID: BodyID): boolean;
    HasCollidedWithCharacter(inCharacter: CharacterVirtual): boolean;
    GetActiveContacts(): ArrayCharacterVirtualContact;
  }
  class LinearCurve {
    constructor();
    Clear(): void;
    Reserve(inSize: number): void;
    AddPoint(inX: number, inY: number): void;
    Sort(): void;
    GetMinX(): number;
    GetMaxX(): number;
    GetValue(inX: number): number;
  }
  class ArrayFloat {
    empty(): boolean;
    size(): number;
    at(inIndex: number): number;
    push_back(inValue: number): void;
    reserve(inSize: number): void;
    resize(inSize: number): void;
    clear(): void;
    data(): FloatMemRef;
  }
  class ArrayUint {
    empty(): boolean;
    size(): number;
    at(inIndex: number): number;
    push_back(inValue: number): void;
    reserve(inSize: number): void;
    resize(inSize: number): void;
    clear(): void;
    data(): UintMemRef;
  }
  class ArrayUint8 {
    empty(): boolean;
    size(): number;
    at(inIndex: number): number;
    push_back(inValue: number): void;
    reserve(inSize: number): void;
    resize(inSize: number): void;
    clear(): void;
    data(): Uint8MemRef;
  }
  class ArrayVehicleAntiRollBar {
    empty(): boolean;
    size(): number;
    at(inIndex: number): VehicleAntiRollBar;
    push_back(inValue: VehicleAntiRollBar): void;
    resize(inSize: number): void;
    clear(): void;
  }
  class ArrayWheelSettings {
    empty(): boolean;
    size(): number;
    at(inIndex: number): WheelSettings;
    push_back(inValue: WheelSettings): void;
    resize(inSize: number): void;
    clear(): void;
  }
  class ArrayVehicleDifferentialSettings {
    empty(): boolean;
    size(): number;
    at(inIndex: number): VehicleDifferentialSettings;
    push_back(inValue: VehicleDifferentialSettings): void;
    resize(inSize: number): void;
    clear(): void;
  }
  class VehicleCollisionTester {
    GetRefCount(): number;
    AddRef(): void;
    Release(): void;
  }
  class VehicleCollisionTesterRay extends VehicleCollisionTester {
    constructor(inObjectLayer: number, inUp?: Vec3, inMaxSlopeAngle?: number);
  }
  class VehicleCollisionTesterCastSphere extends VehicleCollisionTester {
    constructor(
      inObjectLayer: number,
      inRadius: number,
      inUp?: Vec3,
      inMaxSlopeAngle?: number
    );
  }
  class VehicleCollisionTesterCastCylinder extends VehicleCollisionTester {
    constructor(inObjectLayer: number, inConvexRadiusFraction?: number);
  }
  class VehicleConstraintSettings extends ConstraintSettings {
    constructor();
    get_mUp(): Vec3;
    set_mUp(mUp: Vec3): void;
    mUp: Vec3;
    get_mForward(): Vec3;
    set_mForward(mForward: Vec3): void;
    mForward: Vec3;
    get_mMaxPitchRollAngle(): number;
    set_mMaxPitchRollAngle(mMaxPitchRollAngle: number): void;
    mMaxPitchRollAngle: number;
    get_mWheels(): ArrayWheelSettings;
    set_mWheels(mWheels: ArrayWheelSettings): void;
    mWheels: ArrayWheelSettings;
    get_mAntiRollBars(): ArrayVehicleAntiRollBar;
    set_mAntiRollBars(mAntiRollBars: ArrayVehicleAntiRollBar): void;
    mAntiRollBars: ArrayVehicleAntiRollBar;
    get_mController(): VehicleControllerSettings;
    set_mController(mController: VehicleControllerSettings): void;
    mController: VehicleControllerSettings;
  }
  class VehicleConstraint extends Constraint {
    constructor(inVehicleBody: Body, inSettings: VehicleConstraintSettings);
    SetMaxPitchRollAngle(inMaxPitchRollAngle: number): void;
    SetVehicleCollisionTester(inTester: VehicleCollisionTester): void;
    OverrideGravity(inGravity: Vec3): void;
    IsGravityOverridden(): boolean;
    GetGravityOverride(): Vec3;
    ResetGravityOverride(): void;
    GetLocalUp(): Vec3;
    GetLocalForward(): Vec3;
    GetWorldUp(): Vec3;
    GetVehicleBody(): Body;
    GetController(): VehicleController;
    GetWheel(inIdx: number): Wheel;
    GetWheelLocalTransform(
      inWheelIndex: number,
      inWheelRight: Vec3,
      inWheelUp: Vec3
    ): Mat44;
    GetWheelWorldTransform(
      inWheelIndex: number,
      inWheelRight: Vec3,
      inWheelUp: Vec3
    ): RMat44;
    SetNumStepsBetweenCollisionTestActive(inSteps: number): void;
    GetNumStepsBetweenCollisionTestActive(): number;
    SetNumStepsBetweenCollisionTestInactive(inSteps: number): void;
    GetNumStepsBetweenCollisionTestInactive(): number;
  }
  class VehicleConstraintStepListener extends PhysicsStepListener {
    constructor(inConstraint: VehicleConstraint);
  }
  class VehicleConstraintCallbacksEm {
    SetVehicleConstraint(inConstraint: VehicleConstraint): void;
  }
  class VehicleConstraintCallbacksJS extends VehicleConstraintCallbacksEm {
    constructor();
    GetCombinedFriction(
      inWheelIndex: number,
      inTireFrictionDirection: number,
      inTireFriction: number,
      inBody2: number,
      inSubShapeID2: number
    ): number;
    OnPreStepCallback(inVehicle: number, inContext: number): void;
    OnPostCollideCallback(inVehicle: number, inContext: number): void;
    OnPostStepCallback(inVehicle: number, inContext: number): void;
  }
  class TireMaxImpulseCallbackResult {
    get_mLongitudinalImpulse(): number;
    set_mLongitudinalImpulse(mLongitudinalImpulse: number): void;
    mLongitudinalImpulse: number;
    get_mLateralImpulse(): number;
    set_mLateralImpulse(mLateralImpulse: number): void;
    mLateralImpulse: number;
  }
  class WheeledVehicleControllerCallbacksEm {
    SetWheeledVehicleController(inController: WheeledVehicleController): void;
  }
  class WheeledVehicleControllerCallbacksJS extends WheeledVehicleControllerCallbacksEm {
    constructor();
    OnTireMaxImpulseCallback(
      inWheelIndex: number,
      outResult: number,
      inSuspensionImpulse: number,
      inLongitudinalFriction: number,
      inLateralFriction: number,
      inLongitudinalSlip: number,
      inLateralSlip: number,
      inDeltaTime: number
    ): void;
  }
  class WheelSettings {
    constructor();
    GetRefCount(): number;
    AddRef(): void;
    Release(): void;
    get_mPosition(): Vec3;
    set_mPosition(mPosition: Vec3): void;
    mPosition: Vec3;
    get_mSuspensionForcePoint(): Vec3;
    set_mSuspensionForcePoint(mSuspensionForcePoint: Vec3): void;
    mSuspensionForcePoint: Vec3;
    get_mSuspensionDirection(): Vec3;
    set_mSuspensionDirection(mSuspensionDirection: Vec3): void;
    mSuspensionDirection: Vec3;
    get_mSteeringAxis(): Vec3;
    set_mSteeringAxis(mSteeringAxis: Vec3): void;
    mSteeringAxis: Vec3;
    get_mWheelUp(): Vec3;
    set_mWheelUp(mWheelUp: Vec3): void;
    mWheelUp: Vec3;
    get_mWheelForward(): Vec3;
    set_mWheelForward(mWheelForward: Vec3): void;
    mWheelForward: Vec3;
    get_mSuspensionSpring(): SpringSettings;
    set_mSuspensionSpring(mSuspensionSpring: SpringSettings): void;
    mSuspensionSpring: SpringSettings;
    get_mSuspensionMinLength(): number;
    set_mSuspensionMinLength(mSuspensionMinLength: number): void;
    mSuspensionMinLength: number;
    get_mSuspensionMaxLength(): number;
    set_mSuspensionMaxLength(mSuspensionMaxLength: number): void;
    mSuspensionMaxLength: number;
    get_mSuspensionPreloadLength(): number;
    set_mSuspensionPreloadLength(mSuspensionPreloadLength: number): void;
    mSuspensionPreloadLength: number;
    get_mRadius(): number;
    set_mRadius(mRadius: number): void;
    mRadius: number;
    get_mWidth(): number;
    set_mWidth(mWidth: number): void;
    mWidth: number;
    get_mEnableSuspensionForcePoint(): boolean;
    set_mEnableSuspensionForcePoint(mEnableSuspensionForcePoint: boolean): void;
    mEnableSuspensionForcePoint: boolean;
  }
  class VehicleAntiRollBar {
    constructor();
    get_mLeftWheel(): number;
    set_mLeftWheel(mLeftWheel: number): void;
    mLeftWheel: number;
    get_mRightWheel(): number;
    set_mRightWheel(mRightWheel: number): void;
    mRightWheel: number;
    get_mStiffness(): number;
    set_mStiffness(mStiffness: number): void;
    mStiffness: number;
  }
  class Wheel {
    constructor(inSettings: WheelSettings);
    GetSettings(): WheelSettings;
    GetAngularVelocity(): number;
    SetAngularVelocity(inVel: number): void;
    GetRotationAngle(): number;
    SetRotationAngle(inAngle: number): void;
    GetSteerAngle(): number;
    SetSteerAngle(inAngle: number): void;
    HasContact(): boolean;
    GetContactBodyID(): BodyID;
    GetContactPosition(): RVec3;
    GetContactPointVelocity(): Vec3;
    GetContactNormal(): Vec3;
    GetContactLongitudinal(): Vec3;
    GetContactLateral(): Vec3;
    GetSuspensionLength(): number;
    HasHitHardPoint(): boolean;
    GetSuspensionLambda(): number;
    GetLongitudinalLambda(): number;
    GetLateralLambda(): number;
  }
  class WheelSettingsWV extends WheelSettings {
    constructor();
    get_mInertia(): number;
    set_mInertia(mInertia: number): void;
    mInertia: number;
    get_mAngularDamping(): number;
    set_mAngularDamping(mAngularDamping: number): void;
    mAngularDamping: number;
    get_mMaxSteerAngle(): number;
    set_mMaxSteerAngle(mMaxSteerAngle: number): void;
    mMaxSteerAngle: number;
    get_mLongitudinalFriction(): LinearCurve;
    set_mLongitudinalFriction(mLongitudinalFriction: LinearCurve): void;
    mLongitudinalFriction: LinearCurve;
    get_mLateralFriction(): LinearCurve;
    set_mLateralFriction(mLateralFriction: LinearCurve): void;
    mLateralFriction: LinearCurve;
    get_mMaxBrakeTorque(): number;
    set_mMaxBrakeTorque(mMaxBrakeTorque: number): void;
    mMaxBrakeTorque: number;
    get_mMaxHandBrakeTorque(): number;
    set_mMaxHandBrakeTorque(mMaxHandBrakeTorque: number): void;
    mMaxHandBrakeTorque: number;
  }
  class WheelWV extends Wheel {
    constructor(inWheel: WheelSettingsWV);
    GetSettings(): WheelSettingsWV;
    get_mLongitudinalSlip(): number;
    set_mLongitudinalSlip(mLongitudinalSlip: number): void;
    mLongitudinalSlip: number;
    get_mLateralSlip(): number;
    set_mLateralSlip(mLateralSlip: number): void;
    mLateralSlip: number;
    get_mCombinedLongitudinalFriction(): number;
    set_mCombinedLongitudinalFriction(
      mCombinedLongitudinalFriction: number
    ): void;
    mCombinedLongitudinalFriction: number;
    get_mCombinedLateralFriction(): number;
    set_mCombinedLateralFriction(mCombinedLateralFriction: number): void;
    mCombinedLateralFriction: number;
    get_mBrakeImpulse(): number;
    set_mBrakeImpulse(mBrakeImpulse: number): void;
    mBrakeImpulse: number;
  }
  class WheelSettingsTV extends WheelSettings {
    constructor();
    get_mLongitudinalFriction(): number;
    set_mLongitudinalFriction(mLongitudinalFriction: number): void;
    mLongitudinalFriction: number;
    get_mLateralFriction(): number;
    set_mLateralFriction(mLateralFriction: number): void;
    mLateralFriction: number;
  }
  class WheelTV extends Wheel {
    constructor(inWheel: WheelSettingsTV);
    GetSettings(): WheelSettingsTV;
    get_mTrackIndex(): number;
    set_mTrackIndex(mTrackIndex: number): void;
    mTrackIndex: number;
    get_mCombinedLongitudinalFriction(): number;
    set_mCombinedLongitudinalFriction(
      mCombinedLongitudinalFriction: number
    ): void;
    mCombinedLongitudinalFriction: number;
    get_mCombinedLateralFriction(): number;
    set_mCombinedLateralFriction(mCombinedLateralFriction: number): void;
    mCombinedLateralFriction: number;
    get_mBrakeImpulse(): number;
    set_mBrakeImpulse(mBrakeImpulse: number): void;
    mBrakeImpulse: number;
  }
  class VehicleTrackSettings {
    get_mDrivenWheel(): number;
    set_mDrivenWheel(mDrivenWheel: number): void;
    mDrivenWheel: number;
    get_mWheels(): ArrayUint;
    set_mWheels(mWheels: ArrayUint): void;
    mWheels: ArrayUint;
    get_mInertia(): number;
    set_mInertia(mInertia: number): void;
    mInertia: number;
    get_mAngularDamping(): number;
    set_mAngularDamping(mAngularDamping: number): void;
    mAngularDamping: number;
    get_mMaxBrakeTorque(): number;
    set_mMaxBrakeTorque(mMaxBrakeTorque: number): void;
    mMaxBrakeTorque: number;
    get_mDifferentialRatio(): number;
    set_mDifferentialRatio(mDifferentialRatio: number): void;
    mDifferentialRatio: number;
  }
  class VehicleTrack extends VehicleTrackSettings {
    get_mAngularVelocity(): number;
    set_mAngularVelocity(mAngularVelocity: number): void;
    mAngularVelocity: number;
  }
  class WheeledVehicleControllerSettings extends VehicleControllerSettings {
    constructor();
    get_mEngine(): VehicleEngineSettings;
    set_mEngine(mEngine: VehicleEngineSettings): void;
    mEngine: VehicleEngineSettings;
    get_mTransmission(): VehicleTransmissionSettings;
    set_mTransmission(mTransmission: VehicleTransmissionSettings): void;
    mTransmission: VehicleTransmissionSettings;
    get_mDifferentials(): ArrayVehicleDifferentialSettings;
    set_mDifferentials(mDifferentials: ArrayVehicleDifferentialSettings): void;
    mDifferentials: ArrayVehicleDifferentialSettings;
    get_mDifferentialLimitedSlipRatio(): number;
    set_mDifferentialLimitedSlipRatio(
      mDifferentialLimitedSlipRatio: number
    ): void;
    mDifferentialLimitedSlipRatio: number;
  }
  class TrackedVehicleControllerSettings extends VehicleControllerSettings {
    constructor();
    get_mEngine(): VehicleEngineSettings;
    set_mEngine(mEngine: VehicleEngineSettings): void;
    mEngine: VehicleEngineSettings;
    get_mTransmission(): VehicleTransmissionSettings;
    set_mTransmission(mTransmission: VehicleTransmissionSettings): void;
    mTransmission: VehicleTransmissionSettings;
    get_mTracks(index: number): VehicleTrackSettings;
    set_mTracks(index: number, mTracks: VehicleTrackSettings): void;
    mTracks: VehicleTrackSettings;
  }
  class TrackedVehicleController extends VehicleController {
    constructor(
      inSettings: TrackedVehicleControllerSettings,
      inConstraint: VehicleConstraint
    );
    SetDriverInput(
      inForward: number,
      inLeftRatio: number,
      inRightRatio: number,
      inBrake: number
    ): void;
    SetForwardInput(inForward: number): void;
    GetForwardInput(): number;
    SetLeftRatio(inLeftRatio: number): void;
    GetLeftRatio(): number;
    SetRightRatio(inRightRatio: number): void;
    GetRightRatio(): number;
    SetBrakeInput(inBrake: number): void;
    GetBrakeInput(): number;
    GetEngine(): VehicleEngine;
    GetTransmission(): VehicleTransmission;
    GetTracks(): ReadonlyArray<VehicleTrack>;
  }
  class VehicleEngineSettings {
    get_mMaxTorque(): number;
    set_mMaxTorque(mMaxTorque: number): void;
    mMaxTorque: number;
    get_mMinRPM(): number;
    set_mMinRPM(mMinRPM: number): void;
    mMinRPM: number;
    get_mMaxRPM(): number;
    set_mMaxRPM(mMaxRPM: number): void;
    mMaxRPM: number;
    get_mNormalizedTorque(): LinearCurve;
    set_mNormalizedTorque(mNormalizedTorque: LinearCurve): void;
    mNormalizedTorque: LinearCurve;
    get_mInertia(): number;
    set_mInertia(mInertia: number): void;
    mInertia: number;
    get_mAngularDamping(): number;
    set_mAngularDamping(mAngularDamping: number): void;
    mAngularDamping: number;
  }
  class VehicleEngine extends VehicleEngineSettings {
    ClampRPM(): void;
    GetCurrentRPM(): number;
    SetCurrentRPM(inRPM: number): void;
    GetAngularVelocity(): number;
    GetTorque(inAcceleration: number): number;
  }
  class VehicleTransmissionSettings {
    get_mMode(): ETransmissionMode;
    set_mMode(mMode: ETransmissionMode): void;
    mMode: ETransmissionMode;
    get_mGearRatios(): ArrayFloat;
    set_mGearRatios(mGearRatios: ArrayFloat): void;
    mGearRatios: ArrayFloat;
    get_mReverseGearRatios(): ArrayFloat;
    set_mReverseGearRatios(mReverseGearRatios: ArrayFloat): void;
    mReverseGearRatios: ArrayFloat;
    get_mSwitchTime(): number;
    set_mSwitchTime(mSwitchTime: number): void;
    mSwitchTime: number;
    get_mClutchReleaseTime(): number;
    set_mClutchReleaseTime(mClutchReleaseTime: number): void;
    mClutchReleaseTime: number;
    get_mSwitchLatency(): number;
    set_mSwitchLatency(mSwitchLatency: number): void;
    mSwitchLatency: number;
    get_mShiftUpRPM(): number;
    set_mShiftUpRPM(mShiftUpRPM: number): void;
    mShiftUpRPM: number;
    get_mShiftDownRPM(): number;
    set_mShiftDownRPM(mShiftDownRPM: number): void;
    mShiftDownRPM: number;
    get_mClutchStrength(): number;
    set_mClutchStrength(mClutchStrength: number): void;
    mClutchStrength: number;
  }
  class VehicleTransmission extends VehicleTransmissionSettings {
    Set(inCurrentGear: number, inClutchFriction: number): void;
    GetCurrentGear(): number;
    GetClutchFriction(): number;
    IsSwitchingGear(): boolean;
    GetCurrentRatio(): number;
  }
  class VehicleDifferentialSettings {
    constructor();
    get_mLeftWheel(): number;
    set_mLeftWheel(mLeftWheel: number): void;
    mLeftWheel: number;
    get_mRightWheel(): number;
    set_mRightWheel(mRightWheel: number): void;
    mRightWheel: number;
    get_mDifferentialRatio(): number;
    set_mDifferentialRatio(mDifferentialRatio: number): void;
    mDifferentialRatio: number;
    get_mLeftRightSplit(): number;
    set_mLeftRightSplit(mLeftRightSplit: number): void;
    mLeftRightSplit: number;
    get_mLimitedSlipRatio(): number;
    set_mLimitedSlipRatio(mLimitedSlipRatio: number): void;
    mLimitedSlipRatio: number;
    get_mEngineTorqueRatio(): number;
    set_mEngineTorqueRatio(mEngineTorqueRatio: number): void;
    mEngineTorqueRatio: number;
  }
  class VehicleControllerSettings {}
  class VehicleController {
    GetRefCount(): number;
    AddRef(): void;
    Release(): void;
    GetConstraint(): VehicleConstraint;
  }
  class WheeledVehicleController extends VehicleController {
    constructor(
      inSettings: WheeledVehicleControllerSettings,
      inConstraint: VehicleConstraint
    );
    SetDriverInput(
      inForward: number,
      inRight: number,
      inBrake: number,
      inHandBrake: number
    ): void;
    SetForwardInput(inForward: number): void;
    GetForwardInput(): number;
    SetRightInput(inRight: number): void;
    GetRightInput(): number;
    SetBrakeInput(inBrake: number): void;
    GetBrakeInput(): number;
    SetHandBrakeInput(inHandBrake: number): void;
    GetHandBrakeInput(): number;
    GetEngine(): VehicleEngine;
    GetTransmission(): VehicleTransmission;
    GetDifferentials(): ArrayVehicleDifferentialSettings;
    GetDifferentialLimitedSlipRatio(): number;
    SetDifferentialLimitedSlipRatio(inV: number): void;
    GetWheelSpeedAtClutch(): number;
  }
  class MotorcycleControllerSettings extends WheeledVehicleControllerSettings {
    constructor();
    get_mMaxLeanAngle(): number;
    set_mMaxLeanAngle(mMaxLeanAngle: number): void;
    mMaxLeanAngle: number;
    get_mLeanSpringConstant(): number;
    set_mLeanSpringConstant(mLeanSpringConstant: number): void;
    mLeanSpringConstant: number;
    get_mLeanSpringDamping(): number;
    set_mLeanSpringDamping(mLeanSpringDamping: number): void;
    mLeanSpringDamping: number;
    get_mLeanSpringIntegrationCoefficient(): number;
    set_mLeanSpringIntegrationCoefficient(
      mLeanSpringIntegrationCoefficient: number
    ): void;
    mLeanSpringIntegrationCoefficient: number;
    get_mLeanSpringIntegrationCoefficientDecay(): number;
    set_mLeanSpringIntegrationCoefficientDecay(
      mLeanSpringIntegrationCoefficientDecay: number
    ): void;
    mLeanSpringIntegrationCoefficientDecay: number;
    get_mLeanSmoothingFactor(): number;
    set_mLeanSmoothingFactor(mLeanSmoothingFactor: number): void;
    mLeanSmoothingFactor: number;
  }
  class MotorcycleController extends WheeledVehicleController {
    constructor(
      inSettings: MotorcycleControllerSettings,
      inConstraint: VehicleConstraint
    );
    GetWheelBase(): number;
    EnableLeanController(inEnable: boolean): void;
    IsLeanControllerEnabled(): boolean;
  }
  class Skeleton {
    constructor();
    AddJoint(inName: JPHString, inParentIndex: number): number;
    GetJointCount(): number;
    AreJointsCorrectlyOrdered(): boolean;
    CalculateParentJointIndices(): void;
  }
  class SkeletalAnimationJointState {
    FromMatrix(inMatrix: Mat44): void;
    ToMatrix(): Mat44;
    get_mTranslation(): Vec3;
    set_mTranslation(mTranslation: Vec3): void;
    mTranslation: Vec3;
    get_mRotation(): Quat;
    set_mRotation(mRotation: Quat): void;
    mRotation: Quat;
  }
  class SkeletalAnimationKeyframe extends SkeletalAnimationJointState {
    constructor();
    get_mTime(): number;
    set_mTime(mTime: number): void;
    mTime: number;
  }
  class ArraySkeletonKeyframe {
    constructor();
    empty(): boolean;
    size(): number;
    at(inIndex: number): SkeletalAnimationKeyframe;
    push_back(inValue: SkeletalAnimationKeyframe): void;
    reserve(inSize: number): void;
    resize(inSize: number): void;
    clear(): void;
  }
  class SkeletalAnimationAnimatedJoint {
    constructor();
    get_mJointName(): JPHString;
    set_mJointName(mJointName: JPHString): void;
    mJointName: JPHString;
    get_mKeyframes(): ArraySkeletonKeyframe;
    set_mKeyframes(mKeyframes: ArraySkeletonKeyframe): void;
    mKeyframes: ArraySkeletonKeyframe;
  }
  class ArraySkeletonAnimatedJoint {
    constructor();
    empty(): boolean;
    size(): number;
    at(inIndex: number): SkeletalAnimationAnimatedJoint;
    push_back(inValue: SkeletalAnimationAnimatedJoint): void;
    reserve(inSize: number): void;
    resize(inSize: number): void;
    clear(): void;
  }
  class SkeletalAnimation {
    constructor();
    SetIsLooping(inLooping: boolean): void;
    IsLooping(): boolean;
    GetDuration(): number;
    ScaleJoints(inScale: number): void;
    Sample(inTime: number, ioPose: SkeletonPose): void;
    GetAnimatedJoints(): ArraySkeletonAnimatedJoint;
  }
  class SkeletonPose {
    constructor();
    SetSkeleton(inSkeleton: Skeleton): void;
    GetSkeleton(): Skeleton;
    SetRootOffset(inOffset: RVec3): void;
    GetRootOffset(): RVec3;
    GetJointCount(): number;
    GetJoint(inJoint: number): SkeletalAnimationJointState;
    GetJointMatrices(): ArrayMat44;
    GetJointMatrix(inJoint: number): Mat44;
    CalculateJointMatrices(): void;
    CalculateJointStates(): void;
  }
  class RagdollPart extends BodyCreationSettings {
    get_mToParent(): TwoBodyConstraintSettings;
    set_mToParent(mToParent: TwoBodyConstraintSettings): void;
    mToParent: TwoBodyConstraintSettings;
  }
  class ArrayRagdollPart {
    constructor();
    empty(): boolean;
    size(): number;
    at(inIndex: number): RagdollPart;
    push_back(inValue: RagdollPart): void;
    reserve(inSize: number): void;
    resize(inSize: number): void;
    clear(): void;
  }
  class RagdollAdditionalConstraint {
    get_mBodyIdx(index: number): number;
    set_mBodyIdx(index: number, mBodyIdx: number): void;
    mBodyIdx: number;
    get_mConstraint(): TwoBodyConstraintSettings;
    set_mConstraint(mConstraint: TwoBodyConstraintSettings): void;
    mConstraint: TwoBodyConstraintSettings;
  }
  class ArrayRagdollAdditionalConstraint {
    constructor();
    empty(): boolean;
    size(): number;
    at(inIndex: number): RagdollAdditionalConstraint;
    push_back(inValue: RagdollAdditionalConstraint): void;
    reserve(inSize: number): void;
    resize(inSize: number): void;
    clear(): void;
  }
  class RagdollSettings {
    constructor();
    Stabilize(): boolean;
    CreateRagdoll(
      inCollisionGroup: number,
      inUserData: number,
      inSystem: PhysicsSystem
    ): Ragdoll;
    GetSkeleton(): Skeleton;
    DisableParentChildCollisions(
      inJointMatrices?: Mat44MemRef,
      inMinSeparationDistance?: number
    ): void;
    CalculateBodyIndexToConstraintIndex(): void;
    CalculateConstraintIndexToBodyIdxPair(): void;
    get_mSkeleton(): Skeleton;
    set_mSkeleton(mSkeleton: Skeleton): void;
    mSkeleton: Skeleton;
    get_mParts(): ArrayRagdollPart;
    set_mParts(mParts: ArrayRagdollPart): void;
    mParts: ArrayRagdollPart;
    get_mAdditionalConstraints(): ArrayRagdollAdditionalConstraint;
    set_mAdditionalConstraints(
      mAdditionalConstraints: ArrayRagdollAdditionalConstraint
    ): void;
    mAdditionalConstraints: ArrayRagdollAdditionalConstraint;
  }
  class Ragdoll {
    constructor(inSystem: PhysicsSystem);
    AddToPhysicsSystem(
      inActivationMode: EActivation,
      inLockBodies?: boolean
    ): void;
    RemoveFromPhysicsSystem(inLockBodies?: boolean): void;
    Activate(inLockBodies?: boolean): void;
    IsActive(inLockBodies?: boolean): boolean;
    SetGroupID(inGroupID: number, inLockBodies?: boolean): void;
    SetPose(inPose: SkeletonPose, inLockBodies?: boolean): void;
    GetPose(outPose: SkeletonPose, inLockBodies?: boolean): void;
    ResetWarmStart(): void;
    DriveToPoseUsingKinematics(
      inPose: SkeletonPose,
      inDeltaTime: number,
      inLockBodies?: boolean
    ): void;
    DriveToPoseUsingMotors(inPose: SkeletonPose): void;
    SetLinearAndAngularVelocity(
      inLinearVelocity: Vec3,
      inAngularVelocity: Vec3,
      inLockBodies?: boolean
    ): void;
    SetLinearVelocity(inLinearVelocity: Vec3, inLockBodies?: boolean): void;
    AddLinearVelocity(inLinearVelocity: Vec3, inLockBodies?: boolean): void;
    AddImpulse(inImpulse: Vec3, inLockBodies?: boolean): void;
    GetRootTransform(
      outPosition: RVec3,
      outRotation: Quat,
      inLockBodies?: boolean
    ): void;
    GetBodyCount(): number;
    GetBodyID(inBodyIndex: number): BodyID;
    GetBodyIDs(): BodyIDVector;
    GetConstraintCount(): number;
    GetWorldSpaceBounds(inLockBodies?: boolean): AABox;
    GetConstraint(inConstraintIndex: number): TwoBodyConstraint;
    GetRagdollSettings(): RagdollSettings;
  }
  class BroadPhaseLayerInterface {
    GetNumBroadPhaseLayers(): number;
  }
  class BroadPhaseLayer {
    constructor(inLayer: number);
    GetValue(): number;
  }
  class BroadPhaseLayerInterfaceEm extends BroadPhaseLayerInterface {}
  class BroadPhaseLayerInterfaceJS extends BroadPhaseLayerInterfaceEm {
    constructor();
    GetNumBroadPhaseLayers(): number;
    GetBPLayer(inLayer: number): number;
  }
  class BroadPhaseLayerInterfaceTable extends BroadPhaseLayerInterface {
    constructor(inNumObjectLayers: number, inNumBroadPhaseLayers: number);
    MapObjectToBroadPhaseLayer(
      inObjectLayer: number,
      inBroadPhaseLayer: BroadPhaseLayer
    ): void;
  }
  class ObjectVsBroadPhaseLayerFilterTable extends ObjectVsBroadPhaseLayerFilter {
    constructor(
      inBroadPhaseLayerInterface: BroadPhaseLayerInterface,
      inNumBroadPhaseLayers: number,
      inObjectLayerPairFilter: ObjectLayerPairFilter,
      inNumObjectLayers: number
    );
  }
  class ObjectLayerPairFilterTable extends ObjectLayerPairFilter {
    constructor(inNumObjectLayers: number);
    GetNumObjectLayers(): number;
    DisableCollision(inLayer1: number, inLayer2: number): void;
    EnableCollision(inLayer1: number, inLayer2: number): void;
  }
  class BroadPhaseLayerInterfaceMask extends BroadPhaseLayerInterface {
    constructor(inNumBroadPhaseLayers: number);
    ConfigureLayer(
      inBroadPhaseLayer: BroadPhaseLayer,
      inGroupsToInclude: number,
      inGroupsToExclude: number
    ): void;
  }
  class ObjectVsBroadPhaseLayerFilterMask extends ObjectVsBroadPhaseLayerFilter {
    constructor(inBroadPhaseLayerInterface: BroadPhaseLayerInterfaceMask);
  }
  class ObjectLayerPairFilterMask extends ObjectLayerPairFilter {
    constructor();
    sGetObjectLayer(inGroup: number, inMask: number): number;
    sGetGroup(inObjectLayer: number): number;
    sGetMask(inObjectLayer: number): number;
  }
  class JoltSettings {
    constructor();
    get_mMaxBodies(): number;
    set_mMaxBodies(mMaxBodies: number): void;
    mMaxBodies: number;
    get_mMaxBodyPairs(): number;
    set_mMaxBodyPairs(mMaxBodyPairs: number): void;
    mMaxBodyPairs: number;
    get_mMaxContactConstraints(): number;
    set_mMaxContactConstraints(mMaxContactConstraints: number): void;
    mMaxContactConstraints: number;
    get_mMaxWorkerThreads(): number;
    set_mMaxWorkerThreads(mMaxWorkerThreads: number): void;
    mMaxWorkerThreads: number;
    get_mBroadPhaseLayerInterface(): BroadPhaseLayerInterface;
    set_mBroadPhaseLayerInterface(
      mBroadPhaseLayerInterface: BroadPhaseLayerInterface
    ): void;
    mBroadPhaseLayerInterface: BroadPhaseLayerInterface;
    get_mObjectVsBroadPhaseLayerFilter(): ObjectVsBroadPhaseLayerFilter;
    set_mObjectVsBroadPhaseLayerFilter(
      mObjectVsBroadPhaseLayerFilter: ObjectVsBroadPhaseLayerFilter
    ): void;
    mObjectVsBroadPhaseLayerFilter: ObjectVsBroadPhaseLayerFilter;
    get_mObjectLayerPairFilter(): ObjectLayerPairFilter;
    set_mObjectLayerPairFilter(
      mObjectLayerPairFilter: ObjectLayerPairFilter
    ): void;
    mObjectLayerPairFilter: ObjectLayerPairFilter;
  }
  class JoltInterface {
    constructor(inSettings: JoltSettings);
    Step(inDeltaTime: number, inCollisionSteps: number): void;
    GetPhysicsSystem(): PhysicsSystem;
    GetTempAllocator(): TempAllocator;
    GetObjectLayerPairFilter(): ObjectLayerPairFilter;
    GetObjectVsBroadPhaseLayerFilter(): ObjectVsBroadPhaseLayerFilter;
    sGetTotalMemory(): number;
    sGetFreeMemory(): number;
  }
}
