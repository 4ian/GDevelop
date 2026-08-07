package org.gdevelop.kotlin.extensions

import kotlin.test.*

private class FixtureProvider(override val descriptor:ExtensionDescriptor):ExtensionProvider {
 override val runtime=object:ExtensionRuntime{override fun invoke(entry:String,arguments:List<String>,context:ExtensionContext)=true}
}
class ExtensionCatalogTest {
 @Test fun phase0SnapshotHasFrozenBuiltinsAndDummyIdentity() {
  val catalog=ExtensionCatalog.of(*Phase0Catalog.descriptors.map(::FixtureProvider).toTypedArray())
  assertEquals(listOf("BuiltinCommonInstructions","MyDummyExtension"),catalog.snapshot.descriptors.map{it.identity.namespace})
  assertEquals("source@23f965f5290c176de3666cca9f5ae82ffa70e24a",catalog.resolveAction("MyDummyExtension::DoSomething")?.identity?.version)
  assertEquals(setOf(ExtensionMemberKind.EXPRESSION,ExtensionMemberKind.BEHAVIOR,ExtensionMemberKind.OBJECT,ExtensionMemberKind.EFFECT),catalog.snapshot.descriptors.last().metadataMembers.map{it.kind}.toSet())
  assertEquals(16,catalog.snapshot.digest.length)
 }
 @Test fun aliasesPreserveCanonicalIdentityAndConflictsAreDiagnosed() {
  val identity=ExtensionIdentity("Renamed","1.0.0","fixture")
  val id=QualifiedMemberId(identity,listOf("Renamed","New"))
  val descriptor=ExtensionDescriptor(identity,listOf(ActionDescriptor("Renamed::New",emptyList(),"new")),emptyList(),aliases=listOf(CompatibilityAlias("Old::Name",id)))
  val catalog=ExtensionCatalog.of(FixtureProvider(descriptor))
  assertEquals(id,catalog.resolveAction("Old::Name")?.id)
  assertFailsWith<CatalogConflictException>{ExtensionCatalog.of(FixtureProvider(descriptor),FixtureProvider(descriptor))}
  assertTrue(ExtensionCatalog.build(listOf(FixtureProvider(descriptor),FixtureProvider(descriptor))).diagnostics.all{it.code=="GDKP_CATALOG_MEMBER_CONFLICT"})
 }
 @Test fun dependenciesResolveDeterministically() {
  val dependency=ExtensionDescriptor(ExtensionIdentity("Base","2.1.0","fixture"),emptyList(),emptyList())
  val dependent=ExtensionDescriptor(ExtensionIdentity("Use","1.0.0","fixture"),emptyList(),emptyList(),dependencies=listOf(DependencyRequirement("Base","^2.0.0")))
  assertEquals(listOf("Base","Use"),ExtensionCatalog.of(FixtureProvider(dependent),FixtureProvider(dependency)).descriptors.map{it.identity.namespace})
 }
}
