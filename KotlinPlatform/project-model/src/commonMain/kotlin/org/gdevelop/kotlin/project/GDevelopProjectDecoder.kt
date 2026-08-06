package org.gdevelop.kotlin.project

import kotlinx.serialization.json.Json
import kotlinx.serialization.json.JsonArray
import kotlinx.serialization.json.JsonElement
import kotlinx.serialization.json.JsonObject
import kotlinx.serialization.json.JsonPrimitive
import kotlinx.serialization.json.booleanOrNull
import kotlinx.serialization.json.contentOrNull
import kotlinx.serialization.json.doubleOrNull
import kotlinx.serialization.json.jsonArray
import kotlinx.serialization.json.jsonObject
import kotlinx.serialization.json.jsonPrimitive
import org.gdevelop.kotlin.diagnostics.Diagnostic
import org.gdevelop.kotlin.diagnostics.ResultWithDiagnostics
import org.gdevelop.kotlin.diagnostics.Severity
import org.gdevelop.kotlin.diagnostics.SourceLocation

/** Decodes source shape only. It never resolves operations or executes semantics. */
class GDevelopProjectDecoder {
    fun decode(sourceId: String, text: String): ResultWithDiagnostics<ProjectDocument> {
        val diagnostics = mutableListOf<Diagnostic>()
        val root = try {
            Json.parseToJsonElement(text).jsonObject
        } catch (error: Exception) {
            return ResultWithDiagnostics(null, listOf(error("GDKP_DEC_INVALID_JSON", error.message ?: "Invalid JSON", sourceId, "")))
        }

        val version = root["gdVersion"]?.jsonPrimitive?.contentOrNull
        if (version == null) diagnostics += error("GDKP_DEC_MISSING_VERSION", "gdVersion must be a string", sourceId, "/gdVersion")

        rejectNonEmpty(root, "objects", sourceId, diagnostics, "Global objects are outside milestone 1")
        rejectNonEmpty(root, "objectsGroups", sourceId, diagnostics, "Object groups are outside this prototype slice")
        rejectNonEmpty(root, "externalEvents", sourceId, diagnostics, "External events are outside milestone 1")
        rejectNonEmpty(root, "eventsFunctionsExtensions", sourceId, diagnostics, "Project-embedded extensions are outside milestone 1")

        val globals = decodeVariables(root["variables"], sourceId, "/variables", diagnostics)
        val layouts = root["layouts"] as? JsonArray
        if (layouts == null || layouts.isEmpty()) {
            diagnostics += error("GDKP_DEC_MISSING_SCENES", "layouts must contain at least one scene", sourceId, "/layouts")
        }
        val scenes = layouts.orEmpty().mapIndexedNotNull { index, element ->
            decodeScene(element, sourceId, "/layouts/$index", diagnostics)
        }
        val firstScene = root["firstLayout"]?.jsonPrimitive?.contentOrNull ?: scenes.firstOrNull()?.name.orEmpty()
        val project = ProjectDocument(version.orEmpty(), firstScene, globals, scenes)
        return ResultWithDiagnostics(if (diagnostics.any { it.severity == Severity.ERROR }) null else project, diagnostics)
    }

    private fun decodeScene(element: JsonElement, sourceId: String, pointer: String, diagnostics: MutableList<Diagnostic>): SceneDeclaration? {
        val scene = element as? JsonObject ?: run {
            diagnostics += error("GDKP_DEC_INVALID_SCENE", "Scene must be an object", sourceId, pointer)
            return null
        }
        val name = scene["name"]?.jsonPrimitive?.contentOrNull
        if (name == null) diagnostics += error("GDKP_DEC_MISSING_SCENE_NAME", "Scene name must be a string", sourceId, "$pointer/name")
        rejectNonEmpty(scene, "objects", sourceId, diagnostics, "Scene objects are outside this prototype slice", pointer)
        rejectNonEmpty(scene, "instances", sourceId, diagnostics, "Object instances are outside this prototype slice", pointer)
        val variables = decodeVariables(scene["variables"], sourceId, "$pointer/variables", diagnostics)
        val events = (scene["events"] as? JsonArray).orEmpty().mapIndexedNotNull { index, event ->
            decodeEvent(event, sourceId, "$pointer/events/$index", diagnostics)
        }
        return SceneDeclaration(name.orEmpty(), variables, events)
    }

    private fun decodeEvent(element: JsonElement, sourceId: String, pointer: String, diagnostics: MutableList<Diagnostic>): EventDeclaration? {
        val event = element as? JsonObject ?: run {
            diagnostics += error("GDKP_DEC_INVALID_EVENT", "Event must be an object", sourceId, pointer)
            return null
        }
        val type = event["type"]?.jsonPrimitive?.contentOrNull
        if (type != "BuiltinCommonInstructions::Standard") {
            diagnostics += error("GDKP_UNSUPPORTED_EVENT", "Unsupported event type: ${type ?: "<missing>"}", sourceId, "$pointer/type")
        }
        fun operations(field: String) = (event[field] as? JsonArray).orEmpty().mapIndexedNotNull { index, operation ->
            decodeOperation(operation, sourceId, "$pointer/$field/$index", diagnostics)
        }
        val children = (event["events"] as? JsonArray).orEmpty().mapIndexedNotNull { index, child ->
            decodeEvent(child, sourceId, "$pointer/events/$index", diagnostics)
        }
        return EventDeclaration(operations("conditions"), operations("actions"), children, SourceLocation(sourceId, pointer))
    }

    private fun decodeOperation(element: JsonElement, sourceId: String, pointer: String, diagnostics: MutableList<Diagnostic>): OperationDeclaration? {
        val operation = element as? JsonObject ?: run {
            diagnostics += error("GDKP_DEC_INVALID_OPERATION", "Operation must be an object", sourceId, pointer)
            return null
        }
        val type = (operation["type"] as? JsonObject)?.get("value")?.jsonPrimitive?.contentOrNull
        if (type == null) diagnostics += error("GDKP_DEC_MISSING_OPERATION_TYPE", "Operation type.value must be a string", sourceId, "$pointer/type/value")
        val parameters = (operation["parameters"] as? JsonArray).orEmpty().mapNotNull { it.jsonPrimitive.contentOrNull }
        return OperationDeclaration(type.orEmpty(), parameters, SourceLocation(sourceId, pointer))
    }

    private fun decodeVariables(element: JsonElement?, sourceId: String, pointer: String, diagnostics: MutableList<Diagnostic>): List<VariableDeclaration> {
        return (element as? JsonArray).orEmpty().mapIndexedNotNull { index, item ->
            val variable = item as? JsonObject ?: return@mapIndexedNotNull null.also {
                diagnostics += error("GDKP_DEC_INVALID_VARIABLE", "Variable must be an object", sourceId, "$pointer/$index")
            }
            val name = variable["name"]?.jsonPrimitive?.contentOrNull ?: return@mapIndexedNotNull null.also {
                diagnostics += error("GDKP_DEC_MISSING_VARIABLE_NAME", "Variable name must be a string", sourceId, "$pointer/$index/name")
            }
            val raw = variable["value"]?.jsonPrimitive
            val value = when {
                raw?.booleanOrNull != null -> Value.BooleanValue(raw.booleanOrNull!!)
                raw?.doubleOrNull != null -> Value.NumberValue(raw.doubleOrNull!!)
                raw?.contentOrNull != null -> Value.StringValue(raw.content)
                else -> null
            }
            if (value == null) diagnostics += error("GDKP_DEC_INVALID_VARIABLE_VALUE", "Variable value must be scalar", sourceId, "$pointer/$index/value")
            value?.let { VariableDeclaration(name, it) }
        }
    }

    private fun rejectNonEmpty(root: JsonObject, field: String, sourceId: String, diagnostics: MutableList<Diagnostic>, message: String, prefix: String = "") {
        val value = root[field]
        val nonEmpty = when (value) {
            is JsonArray -> value.isNotEmpty()
            is JsonObject -> value.isNotEmpty()
            null -> false
            else -> true
        }
        if (nonEmpty) diagnostics += error("GDKP_UNSUPPORTED_CONSTRUCT", message, sourceId, "$prefix/$field")
    }

    private fun error(code: String, message: String, sourceId: String, pointer: String) =
        Diagnostic(code, Severity.ERROR, message, SourceLocation(sourceId, pointer))
}
