<?xml version="1.0" encoding="ISO-8859-1" ?>
   
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
<xsl:output method='html' version='1.0' encoding='UTF-8' indent='yes' />

<!-- ************************************************************************* -->

   <xsl:variable name="max_images_displayed">30</xsl:variable>

<!-- ************************************************************************* -->

   <xsl:template match="/dataset">
      <html>
         <head>
            
            <style type="text/css">
               div#box{
                  position: absolute; 
                  border-style:solid; 
                  border-width:1px; 
                  border-color:red;
               }

               div#circle{
                  position: absolute; 
                  border-style:solid; 
                  border-width:1px; 
                  border-color:red;
                  border-radius:7px;
                  width:1px; 
                  height: 1px;
               }

               div#label{
                  position: absolute; 
                  color: red;
               }

               div#img{
                  position: relative;
                  margin-bottom:2em;
               }


               pre {
                  color: black;
                  margin: 1em 0.25in;
                  padding: 0.5em;
                  background: rgb(240,240,240);
                  border-top: black dotted 1px;
                  border-left: black dotted 1px;
                  border-right: black solid 2px;
                  border-bottom: black solid 2px;
               }

            </style>
            
         </head>

         <body>
            Dataset name: <b><xsl:value-of select='/dataset/name'/></b> <br/>
            Dataset comment: <pre><xsl:value-of select='/dataset/comment'/></pre> <br/> 
            Number of images: <xsl:value-of select="count(images/image)"/> <br/>
            Number of boxes: <xsl:value-of select="count(images/image/box)"/> <br/>
            <br/>
            <hr/>
             
            <!-- Show a warning if we aren't going to show all the images -->
            <xsl:if test="count(images/image) &gt; $max_images_displayed">
               <h2>Only displaying the first <xsl:value-of select="$max_images_displayed"/> images.</h2>
               <hr/>
            </xsl:if>

            
            <xsl:for-each select="images/image">
               <!-- Don't try to display too many images.  It makes your browser hang -->
               <xsl:if test="position() &lt;= $max_images_displayed">
                  <b><xsl:value-of select="@file"/></b> (Number of boxes: <xsl:value-of select="count(box)"/>) 
                  <div id="img">
                     <img src="{@file}"/>
                     <xsl:for-each select="box">
                        <div id="box" style="top: {@top}px; left: {@left}px; width: {@width}px; height: {@height}px;"></div>

                        <!-- If there is a label then display it in the lower right corner. -->
                        <xsl:if test="label">
                           <div id="label" style="top: {@top+@height}px; left: {@left+@width}px;">
                              <xsl:value-of select="label"/>
                           </div>
                        </xsl:if>

                        <xsl:for-each select="part">
                           <!--
                           <div id="label" style="top: {@y+7}px; left: {@x}px;">
                              <xsl:value-of select="@name"/>
                           </div>
                           -->
                           <div id="circle" style="top: {(@y)}px; left: {(@x)}px; "></div>
                        </xsl:for-each>
                     </xsl:for-each>
                  </div>
               </xsl:if>
            </xsl:for-each>
         </body>
      </html>
   </xsl:template>
   
   <!-- ************************************************************************* -->

</xsl:stylesheet>
