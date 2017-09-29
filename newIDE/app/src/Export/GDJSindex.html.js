//TODO: Download the file then read it instead of hardcoding it.
export default `<html><head><meta http-equiv="Content-Type" content="text/html; charset=UTF-8">

	<style>
		body {
			margin: 0;
			padding: 0;
			background-color: #000000;
            overflow: hidden;
		}
        #canvasArea {
            margin-left: auto;
            margin-right: auto;
            overflow: hidden;
        }

        /* GDJS_CUSTOM_STYLE */
	</style>
    <!-- Libs and GDJS core files : -->
	<!-- GDJS_CODE_FILES -->

</head>
<body>
    <div id="canvasArea"></div>

    <!-- GDJS_CUSTOM_HTML -->
	<script>

    (function() {
        //Initialization
        gdjs.registerObjects();
        gdjs.registerBehaviors();
        gdjs.registerGlobalCallbacks();

        var game = new gdjs.RuntimeGame(gdjs.projectData, {}/*GDJS_ADDITIONAL_SPEC*/);

        //Create a renderer
        var canvasArea = document.getElementById("canvasArea");
        game.getRenderer().createStandardCanvas(canvasArea);

        //Bind keyboards/mouse/touch events
        game.getRenderer().bindStandardEvents(game.getInputManager(), window, document);

        //Load all assets and start the game
        game.loadAllAssets(function() {
            game.startGameLoop();
        });
    })();

	</script>


</body></html>
`;
