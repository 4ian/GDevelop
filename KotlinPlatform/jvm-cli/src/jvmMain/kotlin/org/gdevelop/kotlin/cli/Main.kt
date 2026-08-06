package org.gdevelop.kotlin.cli

import java.io.File
import kotlinx.serialization.encodeToString
import kotlinx.serialization.json.*
import org.gdevelop.kotlin.diagnostics.Diagnostic
import org.gdevelop.kotlin.example.CounterExtension
import org.gdevelop.kotlin.extensions.ExtensionCatalog
import org.gdevelop.kotlin.ir.ProjectLowerer
import org.gdevelop.kotlin.project.GDevelopProjectDecoder
import org.gdevelop.kotlin.runtime.HeadlessRuntime

private val outputJson=Json{encodeDefaults=true;explicitNulls=false;prettyPrint=false}
fun main(args:Array<String>){
 val values=args.toList();if(values.firstOrNull()=="--corpus"){runCorpus(values);return}
 val parsed=CliArguments.parse(values);val report=runFixture(File(parsed.fixture),parsed.frames);if(report==null)throw IllegalArgumentException("Project rejected with structured diagnostics");println(report)
}
private fun runFixture(file:File,frames:Int):String?{val decoder=GDevelopProjectDecoder().decode(file.path,file.readText());val project=decoder.value;if(project==null){System.err.println(outputJson.encodeToString(decoder.diagnostics));return null};val catalog=ExtensionCatalog.of(CounterExtension);val lower=ProjectLowerer(catalog).lower(project);val program=lower.value;if(program==null){System.err.println(outputJson.encodeToString(decoder.diagnostics+lower.diagnostics));return null};return outputJson.encodeToString(HeadlessRuntime(catalog).execute(program,frames))}
private fun runCorpus(args:List<String>){require(args.size==4&&args[2]=="--reports"){"Usage: --corpus <manifest.json> --reports <directory>"};val manifestFile=File(args[1]);val root=manifestFile.parentFile;val manifest=Json.parseToJsonElement(manifestFile.readText()).jsonObject;val out=File(args[3]).apply{mkdirs()};val summary=buildJsonArray{manifest["fixtures"]!!.jsonArray.forEach{item->val f=item.jsonObject;val id=f["id"]!!.jsonPrimitive.content;val project=File(root,f["project"]!!.jsonObject["path"]!!.jsonPrimitive.content);val frames=f["frameBudget"]!!.jsonPrimitive.int;val report=runFixture(project,frames);val status=if(report==null)"unsupported" else "executed";if(report!=null)File(out,"$id.kotlin.json").writeText(report+"\n");add(buildJsonObject{put("fixtureId",id);put("status",status);put("report",if(report==null)JsonNull else JsonPrimitive("$id.kotlin.json"))})}}
 File(out,"corpus-summary.json").writeText(outputJson.encodeToString(buildJsonObject{put("schemaVersion",2);put("gdevelopRevision",manifest["gdevelopRevision"]!!);put("fixtures",summary)})+"\n")
}
private data class CliArguments(val fixture:String,val frames:Int){companion object{fun parse(args:List<String>):CliArguments{require(args.isNotEmpty()){ "Usage: <fixture.json> [--frames <0..10000>]"};var frames=1;var i=1;while(i<args.size){require(args[i]=="--frames"&&i+1<args.size);frames=args[i+1].toInt();i+=2};require(frames in 0..10_000);return CliArguments(args[0],frames)}}}
