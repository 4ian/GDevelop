<?xml version="1.0" encoding="ISO-8859-1" ?>
   
<!--
   To the extent possible under law, Davis E King  has waived all copyright and 
   related or neighboring rights to dlib documentation (XML, HTML, and XSLT files).
   This work is published from United States. 
-->

<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
   <xsl:output method='html' version='1.0' encoding='UTF-8' indent='yes' />
   
   
   <!-- ************************************************************************* -->

   <xsl:variable name="lcletters">abcdefghijklmnopqrstuvwxyz </xsl:variable>
   <xsl:variable name="ucletters">ABCDEFGHIJKLMNOPQRSTUVWXYZ </xsl:variable>
   
   <!-- ************************************************************************* -->

   <xsl:template match="/doc">
      <html>
         <head>
            <title>
               <xsl:if test="title">
                 <xsl:value-of select="title" />
               </xsl:if>
            </title>


            <!-- [client side code for collapsing and unfolding branches] -->
            <script language="JavaScript">

            // ---------------------------------------------
            // --- Name:    Easy DHTML Treeview           --
            // --- Author:  D.D. de Kerf                  --
            // --- Version: 0.2          Date: 13-6-2001  --
            // ---------------------------------------------
            function Toggle(node)
            {
               // Unfold the branch if it isn't visible
               var next_node = node.nextSibling;
               if (next_node.style.display == 'none')
               {
                  // Change the image (if there is an image)
                  if (node.childNodes.length > 0)
                  {
                     if (node.childNodes.length > 0)
                     { 
                        if (node.childNodes.item(0).nodeName == "IMG")
                        {
                           node.childNodes.item(0).src = "minus.gif";
                        }
                     }
                  }

                  next_node.style.display = 'block';
               }
               // Collapse the branch if it IS visible
               else
               {
                  // Change the image (if there is an image)
                  if (node.childNodes.length > 0)
                  {
                     if (node.childNodes.length > 0)
                     { 
                        if (node.childNodes.item(0).nodeName == "IMG")
                        {
                           node.childNodes.item(0).src = "plus.gif";
                        }
                     }
                  }

                  next_node.style.display = 'none';
               }

            }
            function BigToggle(node)
            {
               // Unfold the branch if it isn't visible
               var next_node = node.nextSibling;
               if (next_node.style.display == 'none')
               {
                  // Change the image (if there is an image)
                  if (node.childNodes.length > 0)
                  {
                     if (node.childNodes.length > 0)
                     { 
                        if (node.childNodes.item(0).nodeName == "IMG")
                        {
                           node.childNodes.item(0).src = "bigminus.gif";
                        }
                     }
                  }

                  next_node.style.display = 'block';
               }
               // Collapse the branch if it IS visible
               else
               {
                  // Change the image (if there is an image)
                  if (node.childNodes.length > 0)
                  {
                     if (node.childNodes.length > 0)
                     { 
                        if (node.childNodes.item(0).nodeName == "IMG")
                        {
                           node.childNodes.item(0).src = "bigplus.gif";
                        }
                     }
                  }

                  next_node.style.display = 'none';
               }

            }
            </script>
            
            <style type="text/css">
               pre {margin:0px;}

               ul.tree  li { list-style: none;  margin-left:10px;} 
               ul.tree  { margin:0px; padding:0px; margin-left:5px; font-size:0.95em; }
               ul.tree  li ul { margin-left:10px; padding:0px; }

               div#component {
                  background-color:white; 
                  border: 2px solid rgb(102,102,102); 
                  text-align:left;
                  margin-top: 1.5em;
                  padding: 0.7em;
               }

               div#function {
                  background-color:white; 
                  border: 2px solid rgb(102,102,255); 
                  text-align:left;
                  margin-top: 0.3em;
                  padding: 0.3em;
               }

               div#class {
                  background-color:white; 
                  border: 2px solid rgb(255,102,102); 
                  text-align:left;
                  margin-top: 0.3em;
                  padding: 0.3em;
               }

            </style>
         </head>
         <body>
            <xsl:if test="title">
               <center><h1> <xsl:value-of select="title" /> </h1></center>
            </xsl:if>
            <xsl:apply-templates select="body"/>
         </body>
      </html>
   </xsl:template>
   
         


   
   <!-- ************************************************************************* -->
         
   <xsl:template match="body">
       <xsl:choose>
           <xsl:when test="@from_file">
               <xsl:apply-templates select="document(@from_file)"/>            
               <xsl:apply-templates/>
         </xsl:when>
           <xsl:otherwise>
               <xsl:apply-templates/>
           </xsl:otherwise>
       </xsl:choose>
   </xsl:template>

   
   <!-- ************************************************************************* -->
   <!-- ************************************************************************* -->
   <!-- XSLT for dealing with <code> blocks generated by the htmlify to-xml option -->
   <!-- ************************************************************************* -->
   <!-- ************************************************************************* -->

   <xsl:template match="code">

      <h1>Classes and Structs:</h1>
      <xsl:for-each select="classes/class">  
         <xsl:sort select="translate(concat(name,.),$lcletters, $ucletters)"/>  
         <xsl:apply-templates select="."/>
      </xsl:for-each>

      <h1>Global Functions:</h1>
      <xsl:for-each select="global_functions/function">  
         <xsl:sort select="translate(concat(name,.),$lcletters, $ucletters)"/>  
         <div id="function">
            <a onclick="Toggle(this)" style="cursor: pointer"><img src="plus.gif" border="0"/><font color="blue">
               <u><b><xsl:value-of select="name"/>()</b></u></font></a>
            <div style="display:none;">
               <br/>
               <xsl:if test="scope != ''">
                  <u>Scope</u>: <xsl:value-of select="scope"/> <br/>
               </xsl:if>
               <u>File</u>: <xsl:value-of select="file"/> <br/><br/>
               <div style="margin-left:1.5em">
               <pre style="font-size:1.1em;"><xsl:value-of select="declaration"/>;</pre> 
               <font color="#009900"><pre><xsl:value-of select="comment"/></pre></font> 
               </div>
               <br/>
            </div>
         </div>
      </xsl:for-each>

   </xsl:template>

   <!-- ************************************************************************* -->

   <xsl:template match="class">
         <div id="class">
            <a onclick="Toggle(this)" style="cursor: pointer"><img src="plus.gif" border="0"/><font color="blue">
               <u><b><xsl:value-of select="name"/></b></u></font></a>
            <div style="display:none;">
               <br/>
               <xsl:if test="scope != ''">
                  <u>Scope</u>: <xsl:value-of select="scope"/> <br/>
               </xsl:if>
               <u>File</u>: <xsl:value-of select="file"/> <br/><br/>
               <div style="margin-left:1.5em">
               <pre style="font-size:1.1em;"><xsl:value-of select="declaration"/>;</pre> <br/>
               <font color="#009900"><pre><xsl:value-of select="comment"/></pre></font> <br/>
               </div>

               <xsl:if test="protected_typedefs">
                  <a onclick="BigToggle(this)" style="cursor: pointer"><img src="bigplus.gif" border="0"/><font color="blue">
                     <u style="font-size:2em">Protected Typedefs</u></font></a>
                     <div style="display:none;">
                        <ul>
                           <xsl:for-each select="protected_typedefs/typedef">
                              <li><xsl:value-of select="."/>;</li>
                           </xsl:for-each>
                        </ul>
                     </div>
                  <br/>
               </xsl:if>

               <xsl:if test="public_typedefs">
                  <a onclick="BigToggle(this)" style="cursor: pointer"><img src="bigplus.gif" border="0" style="size:2em"/><font color="blue">
                     <u style="font-size:2em">Public Typedefs</u></font></a>
                     <div style="display:none;">
                        <ul>
                           <xsl:for-each select="public_typedefs/typedef">
                              <li><xsl:value-of select="."/>;</li>
                           </xsl:for-each>
                        </ul>
                     </div>
                  <br/>
               </xsl:if>

               <xsl:if test="protected_variables">
                  <a onclick="BigToggle(this)" style="cursor: pointer"><img src="bigplus.gif" border="0"/><font color="blue">
                     <u style="font-size:2em">Protected Variables</u></font></a>
                  <div style="display:none;">
                     <ul>
                        <xsl:for-each select="protected_variables/variable">
                           <li><xsl:value-of select="."/>;</li>
                        </xsl:for-each>
                     </ul>
                  </div>
                  <br/>
               </xsl:if>

               <xsl:if test="public_variables">
                  <a onclick="BigToggle(this)" style="cursor: pointer"><img src="bigplus.gif" border="0"/><font color="blue">
                     <u style="font-size:2em">Public Variables</u></font></a>
                  <div style="display:none;">
                     <ul>
                        <xsl:for-each select="public_variables/variable">
                           <li><xsl:value-of select="."/>;</li>
                        </xsl:for-each>
                     </ul>
                  </div>
                  <br/>
               </xsl:if>

               <xsl:if test="protected_methods">
                  <a onclick="BigToggle(this)" style="cursor: pointer"><img src="bigplus.gif" border="0"/><font color="blue">
                     <u style="font-size:2em">Protected Methods</u></font></a>
                  <div style="display:none;">
                  <xsl:for-each select="protected_methods/method">
                     <div id="function">
                        <u>Method Name</u>: <b><xsl:value-of select="name"/></b> <br/><br/>
                        <div style="margin-left:1.5em">
                           <pre style="font-size:1.1em;"><xsl:value-of select="declaration"/>;</pre> 
                           <font color="#009900"><pre><xsl:value-of select="comment"/></pre></font> <br/>
                        </div>
                     </div>
                  </xsl:for-each>
                  </div>
                  <br/>
               </xsl:if>

               <xsl:if test="public_methods">
                  <a onclick="BigToggle(this)" style="cursor: pointer"><img src="bigplus.gif" border="0"/><font color="blue">
                     <u style="font-size:2em">Public Methods</u></font></a>
                  <div style="display:none;">
                  <xsl:for-each select="public_methods/method">
                     <div id="function">
                        <u>Method Name</u>: <b><xsl:value-of select="name"/></b> <br/><br/>
                        <div style="margin-left:1.5em">
                           <pre style="font-size:1.1em;"><xsl:value-of select="declaration"/>;</pre> 
                           <font color="#009900"><pre><xsl:value-of select="comment"/></pre></font> <br/>
                        </div>
                     </div>
                  </xsl:for-each>
                  </div>
                  <br/>
               </xsl:if>

               <xsl:if test="protected_inner_classes">
                  <a onclick="BigToggle(this)" style="cursor: pointer"><img src="bigplus.gif" border="0"/><font color="blue">
                     <u style="font-size:2em">Protected Inner Classes</u></font></a>
                  <div style="display:none;">
                  <xsl:for-each select="protected_inner_classes/class">
                     <xsl:apply-templates select="."/>
                  </xsl:for-each>
                  </div>
                  <br/>
               </xsl:if>

               <xsl:if test="public_inner_classes">
                  <a onclick="BigToggle(this)" style="cursor: pointer"><img src="bigplus.gif" border="0"/><font color="blue">
                     <u style="font-size:2em">Public Inner Classes</u></font></a>
                  <div style="display:none;">
                  <xsl:for-each select="public_inner_classes/class">
                     <xsl:apply-templates select="."/>
                  </xsl:for-each>
                  </div>
                  <br/>
               </xsl:if>

            </div>
         </div>
   </xsl:template>


   <!-- ************************************************************************* -->
   <!-- ************************************************************************* -->
   <!-- ************************************************************************* -->
   <!-- ************************************************************************* -->



   
</xsl:stylesheet>
