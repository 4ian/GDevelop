package org.gdevelop.kotlin.project

import kotlinx.serialization.json.*
import org.gdevelop.kotlin.diagnostics.*

/** Lossless-enough bounded decoder for the pinned Phase 0/Phase 1 semantic slice. */
class GDevelopProjectDecoder {
 fun decode(sourceId:String,text:String):ResultWithDiagnostics<ProjectDocument>{
  val d=mutableListOf<Diagnostic>(); val root=try{Json.parseToJsonElement(text).jsonObject}catch(e:Exception){return ResultWithDiagnostics(null,listOf(err("GDKP_DEC_INVALID_JSON",e.message?:"Invalid JSON",sourceId,"")))}
  val version=when(val v=root["gdVersion"]){is JsonPrimitive->v.content; is JsonObject->listOf("major","minor","revision","build").mapNotNull{v[it]?.jsonPrimitive?.contentOrNull}.joinToString("."); else->""}
  val globals=variables(root["variables"],sourceId,"/variables",d)
  val scenes=(root["layouts"] as? JsonArray).orEmpty().mapIndexedNotNull{i,e->scene(e,sourceId,"/layouts/$i",d)}
  if(scenes.isEmpty())d+=err("GDKP_DEC_MISSING_SCENES","layouts must contain at least one scene",sourceId,"/layouts")
  reject(root,"externalEvents",sourceId,"",d); reject(root,"objects",sourceId,"",d); reject(root,"objectsGroups",sourceId,"",d)
  val p=ProjectDocument(version,root["firstLayout"]?.jsonPrimitive?.contentOrNull?:scenes.firstOrNull()?.name.orEmpty(),globals,scenes)
  return ResultWithDiagnostics(if(d.any{it.severity==Severity.ERROR})null else p,d)
 }
 private fun scene(e:JsonElement,s:String,p:String,d:MutableList<Diagnostic>):SceneDeclaration?{
  val o=e as? JsonObject?:return null.also{d+=err("GDKP_DEC_INVALID_SCENE","Scene must be an object",s,p)}; val name=o["name"]?.jsonPrimitive?.contentOrNull?:""
  val objects=(o["objects"] as? JsonArray).orEmpty().mapIndexedNotNull{i,x->val q=x as? JsonObject?:return@mapIndexedNotNull null; val n=q["name"]?.jsonPrimitive?.contentOrNull?:return@mapIndexedNotNull null; ObjectDeclaration(n,q["type"]?.jsonPrimitive?.contentOrNull.orEmpty(),variables(q["variables"],s,"$p/objects/$i/variables",d)+(q["string"]?.jsonPrimitive?.contentOrNull?.let{listOf(VariableDeclaration("text",Value.StringValue(it),SourceLocation(s,"$p/objects/$i/string")))}?:emptyList()),SourceLocation(s,"$p/objects/$i"))}
  val groups=(o["objectsGroups"] as? JsonArray).orEmpty().mapIndexedNotNull{i,x->val q=x as? JsonObject?:return@mapIndexedNotNull null; val n=q["name"]?.jsonPrimitive?.contentOrNull?:return@mapIndexedNotNull null; ObjectGroupDeclaration(n,(q["objects"] as? JsonArray).orEmpty().mapNotNull{(it as? JsonObject)?.get("name")?.jsonPrimitive?.contentOrNull},SourceLocation(s,"$p/objectsGroups/$i"))}
  val instances=(o["instances"] as? JsonArray).orEmpty().mapIndexedNotNull{i,x->val q=x as? JsonObject?:return@mapIndexedNotNull null; val n=q["name"]?.jsonPrimitive?.contentOrNull?:return@mapIndexedNotNull null; InstanceDeclaration(n,q["persistentUuid"]?.jsonPrimitive?.contentOrNull?:"$name:$n:$i",q["x"]?.jsonPrimitive?.doubleOrNull?:0.0,q["y"]?.jsonPrimitive?.doubleOrNull?:0.0,variables(q["initialVariables"],s,"$p/instances/$i/initialVariables",d),SourceLocation(s,"$p/instances/$i"))}
  val events=(o["events"] as? JsonArray).orEmpty().mapIndexedNotNull{i,x->event(x,s,"$p/events/$i",d)}
  return SceneDeclaration(name,variables(o["variables"],s,"$p/variables",d),events,objects,groups,instances,SourceLocation(s,p))
 }
 private fun event(e:JsonElement,s:String,p:String,d:MutableList<Diagnostic>):EventDeclaration?{
  val o=e as? JsonObject?:return null.also{d+=err("GDKP_DEC_INVALID_EVENT","Event must be an object",s,p)}; val type=o["type"]?.jsonPrimitive?.contentOrNull
  if(type!="BuiltinCommonInstructions::Standard")d+=err("GDKP_UNSUPPORTED_EVENT","Unsupported event type: ${type?:"<missing>"}",s,"$p/type")
  fun ops(k:String)=(o[k] as? JsonArray).orEmpty().mapIndexedNotNull{i,x->operation(x,s,"$p/$k/$i",d)}
  val children=(o["events"] as? JsonArray).orEmpty().mapIndexedNotNull{i,x->event(x,s,"$p/events/$i",d)}
  return EventDeclaration(ops("conditions"),ops("actions"),children,SourceLocation(s,p),variables(o["variables"],s,"$p/variables",d))
 }
 private fun operation(e:JsonElement,s:String,p:String,d:MutableList<Diagnostic>):OperationDeclaration?{val o=e as? JsonObject?:return null;val t=(o["type"] as? JsonObject)?.get("value")?.jsonPrimitive?.contentOrNull;if(t==null)d+=err("GDKP_DEC_MISSING_OPERATION_TYPE","Operation type.value must be a string",s,"$p/type/value");return OperationDeclaration(t.orEmpty(),(o["parameters"] as? JsonArray).orEmpty().map{it.jsonPrimitive.content},SourceLocation(s,p))}
 private fun variables(e:JsonElement?,s:String,p:String,d:MutableList<Diagnostic>)=(e as? JsonArray).orEmpty().mapIndexedNotNull{i,x->val o=x as? JsonObject?:return@mapIndexedNotNull null;val n=o["name"]?.jsonPrimitive?.contentOrNull?:return@mapIndexedNotNull null;val r=o["value"]?.jsonPrimitive;val v=when{r?.booleanOrNull!=null->Value.BooleanValue(r.boolean);r?.doubleOrNull!=null->Value.NumberValue(r.double);r?.contentOrNull!=null->Value.StringValue(r.content);else->null};if(v==null)d+=err("GDKP_DEC_INVALID_VARIABLE_VALUE","Variable value must be scalar",s,"$p/$i/value");v?.let{VariableDeclaration(n,it,SourceLocation(s,"$p/$i"))}}
 private fun reject(o:JsonObject,k:String,s:String,p:String,d:MutableList<Diagnostic>){if((o[k] as? JsonArray)?.isNotEmpty()==true)d+=err("GDKP_UNSUPPORTED_CONSTRUCT","$k is outside the pinned Phase 1 subset",s,"$p/$k")}
 private fun err(c:String,m:String,s:String,p:String)=Diagnostic(c,Severity.ERROR,m,SourceLocation(s,p))
}
