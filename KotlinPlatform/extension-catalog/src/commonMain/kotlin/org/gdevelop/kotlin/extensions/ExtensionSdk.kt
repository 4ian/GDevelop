package org.gdevelop.kotlin.extensions

import kotlinx.serialization.Serializable
import kotlin.jvm.JvmInline
import org.gdevelop.kotlin.diagnostics.*

@Serializable data class ExtensionIdentity(val namespace: String, val version: String, val origin: String)
@Serializable data class QualifiedMemberId(val extension: ExtensionIdentity, val path: List<String>) { init { require(path.isNotEmpty() && path.none(String::isBlank)) } }
@Serializable data class CompatibilityAlias(val serializedName: String, val canonical: QualifiedMemberId)
@Serializable data class DependencyRequirement(val namespace: String, val versionRange: String, val origin: String? = null)
@Serializable data class ContractVersions(val metadata: Int = 1, val lowering: Int = 1, val runtimeEntry: Int = 1, val capability: Int = 1)

@Serializable @JvmInline value class ValueTypeId(val value: String)
object ValueTypes {
    val Number = ValueTypeId("org.gdevelop.value.number.v1")
    val Boolean = ValueTypeId("org.gdevelop.value.boolean.v1")
    val String = ValueTypeId("org.gdevelop.value.string.v1")
    val Identifier = ValueTypeId("org.gdevelop.value.identifier.v1")
    val Variable = ValueTypeId("org.gdevelop.value.variable.v1")
    val Longitude = ValueTypeId("org.gdevelop.value.longitude-degrees.v1")
    val Latitude = ValueTypeId("org.gdevelop.value.latitude-degrees.v1")
    fun legacy(value: String) = when(value) { "number", "expression" -> Number; "boolean" -> Boolean; "variable" -> Variable; "identifier", "layer" -> Identifier; "longitude" -> Longitude; "latitude" -> Latitude; else -> String }
}
@Serializable enum class ValueLoweringKind { NUMBER, BOOLEAN, TEXT, IDENTIFIER }
@Serializable data class ValueTypeDescriptor(val id:ValueTypeId,val loweringVersion:Int,val kind:ValueLoweringKind,val minimum:Double?=null,val maximum:Double?=null)
object StandardValueTypeDescriptors {
 val all=listOf(ValueTypeDescriptor(ValueTypes.Number,1,ValueLoweringKind.NUMBER),ValueTypeDescriptor(ValueTypes.Boolean,1,ValueLoweringKind.BOOLEAN),ValueTypeDescriptor(ValueTypes.String,1,ValueLoweringKind.TEXT),ValueTypeDescriptor(ValueTypes.Identifier,1,ValueLoweringKind.IDENTIFIER),ValueTypeDescriptor(ValueTypes.Variable,1,ValueLoweringKind.IDENTIFIER),ValueTypeDescriptor(ValueTypes.Longitude,1,ValueLoweringKind.NUMBER,-180.0,180.0),ValueTypeDescriptor(ValueTypes.Latitude,1,ValueLoweringKind.NUMBER,-90.0,90.0))
}
@Serializable sealed interface ResolvedArgument { val source: String
    @Serializable data class Number(override val source:String,val value:Double):ResolvedArgument
    @Serializable data class Boolean(override val source:String,val value:kotlin.Boolean):ResolvedArgument
    @Serializable data class Text(override val source:String,val value:String):ResolvedArgument
}
@Serializable data class ParameterDescriptor(val name:String,val valueType:ValueTypeId,val optional:Boolean=false,val defaultValue:String?=null) {
    constructor(name:String,type:String):this(name,ValueTypes.legacy(type))
    val type:String get()=valueType.value
    init { require(!optional || defaultValue != null) { "Optional parameter $name requires a default" } }
}

@Serializable @JvmInline value class RuntimeCapabilityId(val value: String)
object RuntimeCapabilities { val BrowserMapRenderingHost = RuntimeCapabilityId("org.gdevelop.runtime.browser-map-rendering-host.v1") }

@Serializable data class ActionDescriptor(val type:String,val parameters:List<ParameterDescriptor>,val runtimeEntry:String,val requiredCapabilities:Set<RuntimeCapabilityId> = emptySet(),val memberPath:List<String> = type.split("::"),val contracts:ContractVersions=ContractVersions())
@Serializable data class ConditionDescriptor(val type:String,val parameters:List<ParameterDescriptor>,val runtimeEntry:String,val requiredCapabilities:Set<RuntimeCapabilityId> = emptySet(),val memberPath:List<String> = type.split("::"),val contracts:ContractVersions=ContractVersions())
@Serializable enum class ExtensionMemberKind { EXPRESSION, BEHAVIOR, OBJECT, EFFECT }
@Serializable data class MetadataMemberDescriptor(val kind:ExtensionMemberKind,val path:List<String>,val parameters:List<ParameterDescriptor> = emptyList(),val runtimeEntry:String? = null,val contracts:ContractVersions=ContractVersions())
@Serializable data class ExtensionDescriptor(val identity:ExtensionIdentity,val actions:List<ActionDescriptor>,val lifecycleHooks:List<String>,val conditions:List<ConditionDescriptor> = emptyList(),val aliases:List<CompatibilityAlias> = emptyList(),val dependencies:List<DependencyRequirement> = emptyList(),val contracts:ContractVersions=ContractVersions(),val valueTypes:List<ValueTypeDescriptor> = emptyList(),val metadataMembers:List<MetadataMemberDescriptor> = emptyList())

interface ExtensionProvider { val descriptor:ExtensionDescriptor; val runtime:ExtensionRuntime }
interface ExtensionRuntime {
    fun invoke(entry:String,arguments:List<String>,context:ExtensionContext):Boolean
    fun invokeResolved(entry:String,arguments:List<ResolvedArgument>,context:ExtensionContext)=invoke(entry,arguments.map{it.source},context)
    fun onSceneLoaded(context:ExtensionContext)=Unit; fun onSceneUnloaded(context:ExtensionContext)=Unit
}
interface ExtensionContext { fun readNumber(scope:String,name:String):Double?;fun writeNumber(scope:String,name:String,value:Double);fun trace(kind:String,detail:String) }

data class CatalogSnapshot(val descriptors:List<ExtensionDescriptor>,val canonical:String,val digest:String)
data class CatalogConflict(val key:String,val providers:List<ExtensionIdentity>)
class CatalogConflictException(val conflicts:List<CatalogConflict>):IllegalArgumentException(conflicts.joinToString { "Duplicate extension member ${it.key}" })

class ExtensionCatalog private constructor(val snapshot:CatalogSnapshot,private val actions:Map<String,RegisteredAction>,private val conditions:Map<String,RegisteredCondition>,private val providers:List<ExtensionProvider>,private val valueTypes:Map<ValueTypeId,ValueTypeDescriptor>){
 val descriptors get()=snapshot.descriptors
 fun resolveAction(serializedName:String)=actions[serializedName]
 fun resolveCondition(serializedName:String)=conditions[serializedName]
 fun resolveValueType(id:ValueTypeId)=valueTypes[id]
 fun lifecycleProviders()=providers
 companion object {
  fun build(providers:List<ExtensionProvider>):ResultWithDiagnostics<ExtensionCatalog> = try {
   ResultWithDiagnostics(of(*providers.toTypedArray()),emptyList())
  } catch(conflict:CatalogConflictException) {
   ResultWithDiagnostics(null,conflict.conflicts.map{Diagnostic("GDKP_CATALOG_MEMBER_CONFLICT",Severity.ERROR,"Conflicting registration for ${it.key}: ${it.providers.joinToString()}",SourceLocation("extension-catalog",it.key))})
  } catch(unresolved:IllegalArgumentException) {
   ResultWithDiagnostics(null,listOf(Diagnostic("GDKP_CATALOG_DEPENDENCY_VERSION",Severity.ERROR,unresolved.message?:"Unresolved extension dependency",SourceLocation("extension-catalog","dependencies"))))
  }
  fun of(vararg providers:ExtensionProvider):ExtensionCatalog{
   val sorted=providers.sortedWith(compareBy({it.descriptor.identity.namespace},{it.descriptor.identity.version},{it.descriptor.identity.origin}))
   val selected=resolveDependencies(sorted)
   val actionEntries=selected.flatMap{p->p.descriptor.actions.flatMap{d->names(p.descriptor,d.type,d.memberPath).map{it to RegisteredAction(p.descriptor.identity,QualifiedMemberId(p.descriptor.identity,d.memberPath),d,p.runtime)}}}
   val conditionEntries=selected.flatMap{p->p.descriptor.conditions.flatMap{d->names(p.descriptor,d.type,d.memberPath).map{it to RegisteredCondition(p.descriptor.identity,QualifiedMemberId(p.descriptor.identity,d.memberPath),d,p.runtime)}}}
   val conflicts=actionEntries.groupBy{it.first}.filterValues{it.size>1}.map{CatalogConflict(it.key,it.value.map{x->x.second.identity})}+conditionEntries.groupBy{it.first}.filterValues{it.size>1}.map{CatalogConflict(it.key,it.value.map{x->x.second.identity})}
   if(conflicts.isNotEmpty())throw CatalogConflictException(conflicts.sortedBy{it.key})
   val descriptors=selected.map{freeze(it.descriptor)};val canonical=canonical(descriptors)
   val types=(StandardValueTypeDescriptors.all+selected.flatMap{it.descriptor.valueTypes}).associateBy{it.id}
   return ExtensionCatalog(CatalogSnapshot(descriptors,canonical,fnv(canonical)),actionEntries.associate{it},conditionEntries.associate{it},selected,types)
  }
  private fun freeze(e:ExtensionDescriptor)=e.copy(actions=e.actions.map{it.copy(parameters=it.parameters.toList(),requiredCapabilities=it.requiredCapabilities.toSet(),memberPath=it.memberPath.toList())},conditions=e.conditions.map{it.copy(parameters=it.parameters.toList(),requiredCapabilities=it.requiredCapabilities.toSet(),memberPath=it.memberPath.toList())},lifecycleHooks=e.lifecycleHooks.toList(),aliases=e.aliases.map{it.copy(canonical=it.canonical.copy(path=it.canonical.path.toList()))},dependencies=e.dependencies.toList(),valueTypes=e.valueTypes.toList(),metadataMembers=e.metadataMembers.map{it.copy(path=it.path.toList(),parameters=it.parameters.toList())})
  private fun names(e:ExtensionDescriptor,type:String,path:List<String>)=listOf(type)+e.aliases.filter{it.canonical.path==path&&it.canonical.extension==e.identity}.map{it.serializedName}
  private fun resolveDependencies(p:List<ExtensionProvider>):List<ExtensionProvider>{
   p.forEach{owner->owner.descriptor.dependencies.forEach{r->require(p.any{it.descriptor.identity.namespace==r.namespace&&(r.origin==null||it.descriptor.identity.origin==r.origin)&&matches(it.descriptor.identity.version,r.versionRange)}){"Unresolved extension dependency ${r.namespace} ${r.versionRange}"}}};return p
  }
  private fun matches(v:String,r:String):Boolean=when{r=="*"->true;r.startsWith("^")->v.substringBefore('.').toIntOrNull()==r.drop(1).substringBefore('.').toIntOrNull();r.contains("..")->{val(a,b)=r.split("..",limit=2);v>=a&&v<=b};else->v==r}
  private fun canonical(ds:List<ExtensionDescriptor>)=ds.joinToString("\n"){e->listOf(e.identity.namespace,e.identity.version,e.identity.origin,e.contracts.toString(),e.dependencies.sortedBy{it.namespace}.joinToString(),(e.actions.map{"a:${it.memberPath.joinToString("/")}:${it.parameters.joinToString{p->"${p.name}:${p.valueType.value}:${p.optional}:${p.defaultValue}"}}:${it.runtimeEntry}:${it.contracts}"}+e.conditions.map{"c:${it.memberPath.joinToString("/")}:${it.parameters.joinToString{p->"${p.name}:${p.valueType.value}:${p.optional}:${p.defaultValue}"}}:${it.runtimeEntry}:${it.contracts}"}+e.metadataMembers.map{"m:${it.kind}:${it.path.joinToString("/")}:${it.parameters.joinToString{p->"${p.name}:${p.valueType.value}:${p.optional}:${p.defaultValue}"}}:${it.runtimeEntry}:${it.contracts}"}).sorted().joinToString("|"),e.aliases.sortedBy{it.serializedName}.joinToString()).joinToString(";")}
  private fun fnv(s:String):String{var h=1469598103934665603L;s.encodeToByteArray().forEach{h=(h xor (it.toLong() and 255))*1099511628211L};return h.toULong().toString(16).padStart(16,'0')}
 }
}
data class RegisteredAction(val identity:ExtensionIdentity,val id:QualifiedMemberId,val descriptor:ActionDescriptor,val runtime:ExtensionRuntime)
data class RegisteredCondition(val identity:ExtensionIdentity,val id:QualifiedMemberId,val descriptor:ConditionDescriptor,val runtime:ExtensionRuntime)
