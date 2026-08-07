package org.gdevelop.kotlin.ir

import org.gdevelop.kotlin.diagnostics.SourceLocation
import org.gdevelop.kotlin.extensions.ExtensionIdentity
import org.gdevelop.kotlin.extensions.RuntimeCapabilityId
import org.gdevelop.kotlin.extensions.QualifiedMemberId
import org.gdevelop.kotlin.extensions.ResolvedArgument
import org.gdevelop.kotlin.extensions.ParameterDescriptor
import org.gdevelop.kotlin.extensions.ContractVersions
import org.gdevelop.kotlin.project.Value

data class ProgramIr(val globals:Map<String,Value>, val scenes:List<SceneIr>, val firstScene:String)
data class SceneIr(val name:String, val variables:Map<String,Value>, val events:List<EventIr>, val objects:Map<String,ObjectIr> = emptyMap(), val groups:Map<String,List<String>> = emptyMap(), val instances:List<InstanceIr> = emptyList(), val origin:SourceLocation = SourceLocation("project", ""))
data class ObjectIr(val name:String,val type:String,val variables:Map<String,Value>,val origin:SourceLocation)
data class InstanceIr(val objectName:String,val stableId:String,val x:Double,val y:Double,val variables:Map<String,Value>,val origin:SourceLocation)
data class EventIr(val conditions:List<ConditionIr>,val actions:List<ActionIr>,val children:List<EventIr>,val origin:SourceLocation,val locals:Map<String,Value> = emptyMap())
data class SelectionIr(val objectOrGroup:String,val orderedStableIds:List<String>,val origin:SourceLocation)
enum class VariableScope { GLOBAL, SCENE, OBJECT, PARAMETER, LOCAL }
data class VariableRefIr(val scope:VariableScope,val name:String,val objectName:String?=null,val origin:SourceLocation)
sealed interface ConditionIr {
 data object Always:ConditionIr
 data class CompareNumber(val variable:VariableRefIr,val operator:String,val value:Double):ConditionIr
 data class PickByX(val objectOrGroup:String,val operator:String,val value:Double,val origin:SourceLocation):ConditionIr
 data class Once(val triggerId:String,val origin:SourceLocation):ConditionIr
 data class TimerElapsed(val timer:String,val milliseconds:Long,val origin:SourceLocation):ConditionIr
 data class HostOperation(val operation:ExtensionHostOperation):ConditionIr
}
sealed interface ActionIr {
 data class WriteNumber(val variable:VariableRefIr,val operator:String,val value:Double):ActionIr
 data class SetString(val variable:VariableRefIr,val value:String):ActionIr
 data class CreateObject(val objectName:String,val x:Double,val y:Double,val origin:SourceLocation):ActionIr
 data class DeleteSelected(val objectOrGroup:String,val origin:SourceLocation):ActionIr
 data class SetSelectedX(val objectOrGroup:String,val operator:String,val value:Double,val origin:SourceLocation):ActionIr
 data class SetSelectedString(val objectOrGroup:String,val property:String,val value:String,val origin:SourceLocation):ActionIr
 data class ReplaceScene(val sceneName:String,val origin:SourceLocation):ActionIr
 data class ResetTimer(val timer:String,val origin:SourceLocation):ActionIr
 data class ExtensionCall(val memberId:QualifiedMemberId,val serializedType:String,val arguments:List<ResolvedArgument>,val runtimeEntry:String):ActionIr
 data class HostOperation(val operation:ExtensionHostOperation):ActionIr
}
data class ExtensionHostOperation(val memberId:QualifiedMemberId,val serializedType:String,val runtimeEntry:String,val arguments:List<ResolvedArgument>,val parameters:List<ParameterDescriptor>,val requiredCapabilities:Set<RuntimeCapabilityId>,val contracts:ContractVersions,val origin:SourceLocation){ val descriptorType get()=memberId.path.joinToString("::");val extensionIdentity get()=memberId.extension;val parameterOrder get()=parameters.map{it.name} }
