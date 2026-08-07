package org.gdevelop.kotlin.ir

import org.gdevelop.kotlin.diagnostics.Diagnostic
import org.gdevelop.kotlin.diagnostics.ResultWithDiagnostics
import org.gdevelop.kotlin.diagnostics.Severity
import org.gdevelop.kotlin.diagnostics.SourceLocation
import org.gdevelop.kotlin.extensions.*
import org.gdevelop.kotlin.project.EventDeclaration
import org.gdevelop.kotlin.project.OperationDeclaration
import org.gdevelop.kotlin.project.ProjectDocument

class ProjectLowerer(private val catalog: ExtensionCatalog) {
	fun lower(p: ProjectDocument): ResultWithDiagnostics<ProgramIr> {
		val d = mutableListOf<Diagnostic>();
		val scenes = p.scenes.map { s ->
			SceneIr(
				s.name,
				s.variables.associate { it.name to it.value },
				s.events.map { event(it, d) },
				s.objects.associate {
					it.name to ObjectIr(
						it.name,
						it.type,
						it.variables.associate { v -> v.name to v.value },
						it.location
					)
				},
				s.groups.associate { it.name to it.objectNames },
				s.instances.map {
					InstanceIr(
						it.objectName,
						it.stableId,
						it.x,
						it.y,
						it.initialVariables.associate { v -> v.name to v.value },
						it.location
					)
				},
				s.location
			)
		}; if (scenes.none { it.name == p.firstScene }) d += Diagnostic(
			"GDKP_SEM_UNKNOWN_FIRST_SCENE",
			Severity.ERROR,
			"Unknown first scene: ${p.firstScene}",
			SourceLocation("project", "/firstLayout")
		);
		val ir = ProgramIr(
			p.globalVariables.associate { it.name to it.value },
			scenes,
			p.firstScene
		); return ResultWithDiagnostics(if (d.any { it.severity == Severity.ERROR }) null else ir, d)
	}

	private fun event(e: EventDeclaration, d: MutableList<Diagnostic>): EventIr =
		EventIr(
			e.conditions.mapNotNull { condition(it, d) },
			e.actions.mapNotNull { action(it, d) },
			e.children.map { event(it, d) },
			e.location,
			e.localVariables.associate { it.name to it.value })

	private fun ref(scope: String, name: String, o: OperationDeclaration, obj: String? = null) = VariableRefIr(
		when (scope.lowercase()) {
			"global" -> VariableScope.GLOBAL; "scene" -> VariableScope.SCENE; "object" -> VariableScope.OBJECT; "parameter" -> VariableScope.PARAMETER; "local" -> VariableScope.LOCAL; else -> VariableScope.SCENE
		}, name, obj, o.location
	)

	private fun comparison(o: OperationDeclaration, scope: String, d: MutableList<Diagnostic>): ConditionIr? {
		val a = o.parameters;
		val offset = if (a.size == 4) 1 else 0;
		val name = a.getOrNull(offset) ?: return bad(o, d);
		val op = a.getOrNull(offset + 1) ?: return bad(o, d);
		val value = a.getOrNull(offset + 2)?.toDoubleOrNull() ?: return number(o, d, offset + 2); if (op !in setOf(
				"=",
				"!=",
				"<",
				"<=",
				">",
				">="
			)
		) return operator(o, d, op); return ConditionIr.CompareNumber(ref(scope, name, o), op, value)
	}

	private fun condition(o: OperationDeclaration, d: MutableList<Diagnostic>): ConditionIr? = when (o.type) {
		"BuiltinCommonInstructions::Always", "Always" -> ConditionIr.Always
		"VarGlobal" -> comparison(
			o,
			"global",
			d
		); "VarScene", "BuiltinCommonInstructions::CompareNumberVariable" -> comparison(o, "scene", d)
		"VarLocal" -> comparison(o, "local", d); "VarParam" -> comparison(o, "parameter", d)
		"PosX" -> {
			val a = o.parameters; if (a.size != 3) bad(o, d) else a[2].toDoubleOrNull()
				?.let { ConditionIr.PickByX(a[0], a[1], it, o.location) } ?: number(o, d, 2)
		}

		"BuiltinCommonInstructions::Once" -> ConditionIr.Once(
			"${o.location.sourceId}:${o.location.jsonPointer}",
			o.location
		)

		"BuiltinCommonInstructions::Timer" -> {
			val a = o.parameters; if (a.size < 2) bad(o, d) else a[1].toDoubleOrNull()
				?.let { ConditionIr.TimerElapsed(a[0], it.toLong(), o.location) } ?: number(o, d, 1)
		}

		else -> {
			val c = catalog.resolveCondition(o.type) ?: return unsupported(o, d, "condition");
			val args = params(o, c.descriptor.parameters, d) ?: return null; ConditionIr.HostOperation(host(o, c, args))
		}
	}

	private fun action(o: OperationDeclaration, d: MutableList<Diagnostic>): ActionIr? = when (o.type) {
		"SetNumberVariable", "BuiltinCommonInstructions::SetNumberVariable", "BuiltinCommonInstructions::AddNumberVariable" -> {
			val a = o.parameters; if (a.size != 3) bad(o, d) else a[2].toDoubleOrNull()
				?.let { ActionIr.WriteNumber(ref("scene", a[0], o), if (o.type.contains("Add")) "+" else a[1], it) }
				?: number(o, d, 2)
		}

		"SetGlobalNumberVariable" -> {
			val a = o.parameters; if (a.size != 3) bad(o, d) else a[2].toDoubleOrNull()
				?.let { ActionIr.WriteNumber(ref("global", a[0], o), a[1], it) } ?: number(o, d, 2)
		}

		"SetStringVariable" -> {
			val a = o.parameters; if (a.size != 2) bad(o, d) else ActionIr.SetString(ref("scene", a[0], o), a[1])
		}

		"MettreX" -> {
			val a = o.parameters; if (a.size != 3) bad(o, d) else a[2].toDoubleOrNull()
				?.let { ActionIr.SetSelectedX(a[0], a[1], it, o.location) } ?: number(o, d, 2)
		}

		"TextObject::String" -> {
			val a = o.parameters; if (a.size != 3) bad(o, d) else ActionIr.SetSelectedString(a[0], "text", a[2], o.location)
		}

		"Delete", "BuiltinCommonInstructions::Delete" -> o.parameters.firstOrNull()
			?.let { ActionIr.DeleteSelected(it, o.location) } ?: bad(o, d)

		"Create", "BuiltinCommonInstructions::Create" -> {
			val a = o.parameters; if (a.size < 3) bad(o, d) else {
				val x = a[a.size - 2].toDoubleOrNull();
				val y = a.last().toDoubleOrNull(); if (x == null || y == null) number(
					o,
					d,
					a.size - 2
				) else ActionIr.CreateObject(a[0], x, y, o.location)
			}
		}

		"Scene", "BuiltinCommonInstructions::Scene" -> o.parameters.firstOrNull()
			?.let { ActionIr.ReplaceScene(it, o.location) } ?: bad(o, d)

		"ResetTimer" -> o.parameters.firstOrNull()?.let { ActionIr.ResetTimer(it, o.location) } ?: bad(o, d)
		else -> {
			val a = catalog.resolveAction(o.type) ?: return unsupported(o, d, "action");
			val args = params(o, a.descriptor.parameters, d)
				?: return null; if (a.descriptor.capabilityRequirements.isNotEmpty()) ActionIr.HostOperation(
				host(
					o,
					a,
					args
				)
			) else ActionIr.ExtensionCall(a.id, o.originalSerializedType, args, a.descriptor.runtimeEntry)
		}
	}

	private fun host(o: OperationDeclaration, r: RegisteredAction, args: List<ResolvedArgument>) = ExtensionHostOperation(
		r.id,
		o.originalSerializedType,
		r.descriptor.runtimeEntry,
		args,
		r.descriptor.parameters,
		r.descriptor.requiredCapabilities,
		r.descriptor.contracts,
		o.location,
		r.descriptor.capabilityRequirements
	)

	private fun host(o: OperationDeclaration, r: RegisteredCondition, args: List<ResolvedArgument>) =
		ExtensionHostOperation(
			r.id,
			o.originalSerializedType,
			r.descriptor.runtimeEntry,
			args,
			r.descriptor.parameters,
			r.descriptor.requiredCapabilities,
			r.descriptor.contracts,
			o.location,
			r.descriptor.capabilityRequirements
		)

	private fun params(
		o: OperationDeclaration,
		p: List<ParameterDescriptor>,
		d: MutableList<Diagnostic>
	): List<ResolvedArgument>? {
		val required = p.count { !it.optional }; if (o.parameters.size !in required..p.size) {
			bad(o, d, p.size); return null
		}
		val values = o.parameters + p.drop(o.parameters.size).map { checkNotNull(it.defaultValue) }
		return values.zip(p).mapIndexed { i, (value, descriptor) -> resolve(value, descriptor, i, o, d) ?: return null }
	}

	private fun resolve(
		value: String,
		p: ParameterDescriptor,
		index: Int,
		o: OperationDeclaration,
		d: MutableList<Diagnostic>
	): ResolvedArgument? {
		val contract = catalog.resolveValueType(p.valueType) ?: return typed(o, d, index, p)
		return when (contract.kind) {
			ValueLoweringKind.NUMBER -> {
				val number = value.toDoubleOrNull() ?: return typed(o, d, index, p); if (!number.isFinite()) return typed(
					o,
					d,
					index,
					p
				);
				val minimum = contract.minimum;
				val maximum =
					contract.maximum; if (minimum != null && number < minimum || maximum != null && number > maximum) return range(
					o,
					d,
					index,
					p,
					minimum ?: Double.NEGATIVE_INFINITY,
					maximum ?: Double.POSITIVE_INFINITY
				); ResolvedArgument.Number(value, number)
			}

			ValueLoweringKind.BOOLEAN -> when (value) {
				"true" -> ResolvedArgument.Boolean(value, true); "false" -> ResolvedArgument.Boolean(
					value,
					false
				); else -> typed(o, d, index, p)
			}

			ValueLoweringKind.TEXT -> ResolvedArgument.Text(value, value)
			ValueLoweringKind.IDENTIFIER -> value.takeIf { it.isNotBlank() }?.let { ResolvedArgument.Text(value, it) }
				?: typed(o, d, index, p)
		}
	}

	private fun typed(o: OperationDeclaration, d: MutableList<Diagnostic>, i: Int, p: ParameterDescriptor): Nothing? {
		d += Diagnostic(
			"GDKP_SEM_PARAMETER_TYPE",
			Severity.ERROR,
			"Parameter $i (${p.name}) must be ${p.valueType.value}",
			o.location
		); return null
	}

	private fun range(
		o: OperationDeclaration,
		d: MutableList<Diagnostic>,
		i: Int,
		p: ParameterDescriptor,
		min: Double,
		max: Double
	): Nothing? {
		d += Diagnostic(
			"GDKP_SEM_COORDINATE_RANGE",
			Severity.ERROR,
			"Parameter $i (${p.name}) is outside $min..$max",
			o.location
		); return null
	}

	private fun unsupported(o: OperationDeclaration, d: MutableList<Diagnostic>, k: String): Nothing? {
		d += Diagnostic("GDKP_UNSUPPORTED_OPERATION", Severity.ERROR, "Unsupported $k: ${o.type}", o.location); return null
	}

	private fun bad(o: OperationDeclaration, d: MutableList<Diagnostic>, n: Int = -1): Nothing? {
		d += Diagnostic(
			"GDKP_SEM_PARAMETER_COUNT",
			Severity.ERROR,
			if (n < 0) "Invalid parameters for ${o.type}" else "${o.type} expects $n parameters",
			o.location
		); return null
	}

	private fun number(o: OperationDeclaration, d: MutableList<Diagnostic>, i: Int): Nothing? {
		d += Diagnostic("GDKP_SEM_INVALID_NUMBER", Severity.ERROR, "Parameter $i must be a number", o.location); return null
	}

	private fun operator(o: OperationDeclaration, d: MutableList<Diagnostic>, v: String): Nothing? {
		d += Diagnostic(
			"GDKP_SEM_INVALID_OPERATOR",
			Severity.ERROR,
			"Unsupported numeric comparison operator: $v",
			o.location
		); return null
	}
}
