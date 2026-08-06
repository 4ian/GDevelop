package org.gdevelop.kotlin.project

import org.gdevelop.kotlin.diagnostics.SourceLocation

data class ProjectDocument(val formatVersion: String, val firstScene: String, val globalVariables: List<VariableDeclaration>, val scenes: List<SceneDeclaration>)
data class VariableDeclaration(val name: String, val value: Value, val location: SourceLocation? = null)
sealed interface Value { data class NumberValue(val value: Double):Value; data class StringValue(val value:String):Value; data class BooleanValue(val value:Boolean):Value }
data class ObjectDeclaration(val name:String, val type:String, val variables:List<VariableDeclaration>, val location:SourceLocation)
data class ObjectGroupDeclaration(val name:String, val objectNames:List<String>, val location:SourceLocation)
data class InstanceDeclaration(val objectName:String, val stableId:String, val x:Double, val y:Double, val initialVariables:List<VariableDeclaration>, val location:SourceLocation)
data class SceneDeclaration(val name:String, val variables:List<VariableDeclaration>, val events:List<EventDeclaration>, val objects:List<ObjectDeclaration> = emptyList(), val groups:List<ObjectGroupDeclaration> = emptyList(), val instances:List<InstanceDeclaration> = emptyList(), val location:SourceLocation = SourceLocation("project", ""))
data class EventDeclaration(val conditions:List<OperationDeclaration>, val actions:List<OperationDeclaration>, val children:List<EventDeclaration>, val location:SourceLocation, val localVariables:List<VariableDeclaration> = emptyList())
data class OperationDeclaration(val type:String, val parameters:List<String>, val location:SourceLocation)
