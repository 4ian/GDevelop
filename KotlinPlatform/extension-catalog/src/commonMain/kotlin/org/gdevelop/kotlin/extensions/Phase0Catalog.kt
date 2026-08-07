package org.gdevelop.kotlin.extensions

/** Frozen portable descriptor oracle captured for the Phase 0 built-in/MyDummyExtension gate. */
object Phase0Catalog {
    val builtins = ExtensionDescriptor(
        ExtensionIdentity("BuiltinCommonInstructions", "phase0", "gdevelop-core"),
        actions = listOf(
            ActionDescriptor("BuiltinCommonInstructions::SetNumberVariable", listOf(ParameterDescriptor("variable", ValueTypes.Variable), ParameterDescriptor("operator", ValueTypes.Identifier), ParameterDescriptor("value", ValueTypes.Number)), "builtin.setNumber"),
        ),
        lifecycleHooks = emptyList(),
        conditions = listOf(ConditionDescriptor("BuiltinCommonInstructions::Always", emptyList(), "builtin.always")),
    )
    val myDummyExtension = ExtensionDescriptor(
        ExtensionIdentity("MyDummyExtension", "source@23f965f5290c176de3666cca9f5ae82ffa70e24a", "builtin-js-extension"),
        actions = listOf(ActionDescriptor("MyDummyExtension::DoSomething", listOf(ParameterDescriptor("number1", "expression"), ParameterDescriptor("number2", "expression")), "gdjs._myExtension.doSomething")),
        lifecycleHooks = emptyList(),
        conditions = listOf(ConditionDescriptor("MyDummyExtension::MyCondition", listOf(ParameterDescriptor("number1", "expression"), ParameterDescriptor("number2", "expression")), "gdjs._myExtension.myConditionFunction")),
        metadataMembers = listOf(
            MetadataMemberDescriptor(ExtensionMemberKind.EXPRESSION, listOf("MyDummyExtension", "MyExpression"), listOf(ParameterDescriptor("number1", "expression")), "gdjs._myExtension.myExpressionFunction"),
            MetadataMemberDescriptor(ExtensionMemberKind.BEHAVIOR, listOf("MyDummyExtension", "DummyBehavior")),
            MetadataMemberDescriptor(ExtensionMemberKind.OBJECT, listOf("MyDummyExtension", "DummyObject")),
            MetadataMemberDescriptor(ExtensionMemberKind.EFFECT, listOf("MyDummyExtension", "DummyEffect")),
        ),
    )
    val descriptors = listOf(builtins, myDummyExtension)
}
