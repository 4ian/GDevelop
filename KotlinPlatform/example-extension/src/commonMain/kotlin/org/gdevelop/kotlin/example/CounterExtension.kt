package org.gdevelop.kotlin.example

import org.gdevelop.kotlin.extensions.*

/** A statically linked SDK extension. No reflection or classpath scanning is used. */
object CounterExtension : ExtensionProvider {
	override val descriptor = ExtensionDescriptor(
		identity = ExtensionIdentity("KotlinExample", "1.0.0", "prototype"),
		actions = listOf(
			ActionDescriptor(
				type = "KotlinExample::IncrementVariable",
				parameters = listOf(
					ParameterDescriptor("scope", "string"),
					ParameterDescriptor("variable", "variable"),
					ParameterDescriptor("amount", "number"),
				),
				runtimeEntry = "incrementVariable",
			),
		),
		lifecycleHooks = listOf("sceneLoaded", "sceneUnloaded"),
	)

	override val runtime = object : ExtensionRuntime {
		override fun invoke(entry: String, arguments: List<String>, context: ExtensionContext): Boolean {
			if (entry != "incrementVariable") return false
			val amount = arguments[2].toDoubleOrNull() ?: return false
			val current = context.readNumber(arguments[0], arguments[1]) ?: 0.0
			context.writeNumber(arguments[0], arguments[1], current + amount)
			context.trace("extension", "incremented:${arguments[0]}:${arguments[1]}:$amount")
			return true
		}

		override fun onSceneLoaded(context: ExtensionContext) = context.trace("extension-lifecycle", "loaded")
		override fun onSceneUnloaded(context: ExtensionContext) = context.trace("extension-lifecycle", "unloaded")
	}
}
