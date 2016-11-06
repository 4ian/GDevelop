const gd = global.gd;
var instrFormatter = gd.InstructionSentenceFormatter.get();
instrFormatter.loadTypesFormattingFromConfig();

export default {
    getInstructionHtml: function(instruction, isCondition) {
        var metadata = isCondition ?
            gd.MetadataProvider.getConditionMetadata(gd.JsPlatform.get(), instruction.getType()) :
            gd.MetadataProvider.getActionMetadata(gd.JsPlatform.get(), instruction.getType());
        var formattedTexts = instrFormatter.getAsFormattedText(instruction, metadata);
        var iconSrc = metadata.getSmallIconFilename();

        var instructionText = "";
        for(var i = 0, len = formattedTexts.size();i<len;++i) {
            var formatting = formattedTexts.getTextFormatting(i);
            var style = "color: rgb(" + formatting.getColorRed() + "," + formatting.getColorGreen()
                + "," + formatting.getColorBlue() + ");"
                + (formatting.isBold() ? "font-weight: bold;" : "")
                + (formatting.isItalic() ? "font-style: italic;" : "");
            instructionText += "<span style=\""+style+"\">"+formattedTexts.getString(i)+"</span>";
        }

        return {html: instructionText, icon: iconSrc};
    }
};
