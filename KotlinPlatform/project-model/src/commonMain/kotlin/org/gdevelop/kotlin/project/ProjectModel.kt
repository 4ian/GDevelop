package org.gdevelop.kotlin.project

import org.gdevelop.kotlin.diagnostics.SourceLocation

data class ProjectDocument(
    val formatVersion: String,
    val firstScene: String,
    val globalVariables: List<VariableDeclaration>,
    val scenes: List<SceneDeclaration>,
)

data class VariableDeclaration(val name: String, val value: Value)

sealed interface Value {
    data class NumberValue(val value: Double) : Value
    data class StringValue(val value: String) : Value
    data class BooleanValue(val value: Boolean) : Value
}

data class SceneDeclaration(
    val name: String,
    val variables: List<VariableDeclaration>,
    val events: List<EventDeclaration>,
)

data class EventDeclaration(
    val conditions: List<OperationDeclaration>,
    val actions: List<OperationDeclaration>,
    val children: List<EventDeclaration>,
    val location: SourceLocation,
)

data class OperationDeclaration(
    val type: String,
    val parameters: List<String>,
    val location: SourceLocation,
)
