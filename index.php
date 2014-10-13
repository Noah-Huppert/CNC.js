<!DOCTYPE HTML>
<html>
	<head>
		<title>CNC JS</title>
		<meta charset="UTF-8">
		<meta name="viewport" content="width=device-width, initial-scale=1.0">
		<link rel="stylesheet" href="./css/styles.css" />
		<link rel="stylesheet" href="./css/bootstrap.min.css">
		<link rel="stylesheet" href="./css/bootstrap-theme.min.css">
		<link href='http://fonts.googleapis.com/css?family=Roboto+Condensed:400,700' rel='stylesheet' type='text/css'>
		
		<script src="//ajax.googleapis.com/ajax/libs/jquery/1.10.2/jquery.min.js" type="text/javascript"></script>
		<script src="./js/bootstrap/bootstrap.min.js"></script>
		<script src="./js/javascript.js"></script>
	</head>
	<body onload="init();">
		<canvas id="canvas" width="1000" height="900"></canvas>
		<div id="panelContiner">
			<div id="panel">
				<div class="label label-primary" id="mousePos">X: 0 Y: 0</div>
				<div id="setup">
					<h4>Setup</h4>
					<hr>
					<button id="setOrigin" class="flat">Set Origin</button>
					<button id="setScale" class="flat">Set Scale</button>
					<br>
					<br>
					<button id="export" class="flat">Export</button>
					<button id="import" class="flat">Import</button>
					<br>
					<br>
					<input type="file" id="importFile" />
				</div>
				<br>
				<br>
				<div id="shapes">
					<h4>Shapes</h4>
					<hr>
					<button id="newShape" class="flat">Create New</button>
					<button id="finishButton" class="flat">Finish</button>
					<br>
					<br>
					<button id="xLock" class="flat">X Lock</button>
					<button id="yLock" class="flat">Y Lock</button>
				</div>
				<br>
				<br>
				<div id="gCode">
					<h4>G Code</h4>
					<hr>
					<button class="flat" id="genGcode">Generate G Code</button>
					<br>
					<label>Cut depth:</label>
					<input type="text" id="zVal"/>
					<br>
					<textarea style="width: 100%;" id="gArea"></textarea>
				</div>
			</div>
		</div>
		
		<div class="label label-info" id="prompt">
			&nbsp;
		</div>
		
		<script>
			console.log("To import example go to http://www.noahhuppert.com/area51/cnc.js/example.json and either save file and import");
			console.log("Or use importSet('<http://www.noahhuppert.com/area51/cnc.js/example.json content>');");
		
			var canvas = document.getElementById('canvas');
			var ctx = canvas.getContext('2d');
			
			var windowX;//Mouse X
			var windowY;//Mouse Y
			
			var clickX = 0;
			var clickY = 0;
			
			var xLock = false;
			var yLock = false;
			
			var origin = false;
			var scaleObj = false;
			var shapes = [];
			var calcShapes = [];
			
			var scale = 1;
			
			var originSet = false;
			var scaleSet = false;
			
			var renderCounter = 0;
			var renderShapeCounter = 1;
			var renderShape;//Active Render Shape
			
			var activeShape;
			
			var gCode = "";
			var gz;
			var gShape;
			var gCounter = 0;
			var gPointCounter = 0;
			
			var exportJSONContent = "{";
			var shapesJSON = "";
			
			var importJSON;
			
			var activeJShape;
			
			var shapesJSONCounter = 0;
			var shapesJSONPointCounter = 0;
			
			var importCounter = 0;
			var importActiveShape;
			
			var extraPrompt = "You must set an origin and scale as well as make at least one shape before exporting";
			
			canvas.addEventListener("mousemove", mouseMove, false);
			canvas.addEventListener("mousedown", mouseDown, false);
			
			function render(){
				canvas.width = canvas.width;
				ctx.beginPath();
				
				if(originSet === true){
					ctx.arc(origin.points[0].x, origin.points[0].y, 5, 0, 2 * Math.PI, false);
					ctx.closePath();
					//ctx.beginPath();
					
					ctx.fillStyle = 'red';
			      	ctx.fill();
			      	ctx.lineWidth = 1;
			      	ctx.strokeStyle = '#003300';
				}
				if(scaleSet === true){
					ctx.moveTo(scaleObj.points[0].x, scaleObj.points[0].y);
					ctx.lineTo(scaleObj.points[1].x, scaleObj.points[1].y);
				}
				if(shapes.length != 0){
					while(renderCounter <= shapes.length - 1){
						renderShape = shapes[renderCounter];
						if(renderShape.points.length > 1){
							ctx.moveTo(renderShape.points[0].x, renderShape.points[0].y);
							while(renderShapeCounter <= renderShape.points.length - 1){
								ctx.lineTo(renderShape.points[renderShapeCounter].x, renderShape.points[renderShapeCounter].y);
								renderShapeCounter = renderShapeCounter + 1;
							}
							renderShapeCounter = 1;
						}
						renderCounter = renderCounter + 1;
					}
					renderCounter = 0;
				}
				ctx.stroke();
			}
			
			
			function mouseMove(){
				windowX = event.x;
				windowY = event.y;
				$('#mousePos').html("X: " + windowX + " Y: " + windowY);
				render();
			}
			
			function mouseDown(){
				clickX = windowX;
				clickY = windowY;
			}
			
			function importSet(jsonImport){
				json = JSON.parse(jsonImport);
				
				//Setting up prerequisets
				shapes = [];
				scaleObj = new shape();
				origin = new shape();
				
				
				//Scale\\
				scaleObj.id = json.scale.id;
				if(scaleObj.points.length == 0){
					scaleObj.points.push(new Point(json.scale.point0X, json.scale.point0Y));
					scaleObj.points.push(new Point(json.scale.point1X, json.scale.point1Y));
				} else{
					scaleObj.points[0].x = json.scale.point0X;
					scaleObj.points[0].y = json.scale.point0Y;
					
					scaleObj.points[1].x = json.scale.point1X;
					scaleObj.points[1].y = json.scale.point1Y;
				}
				
				scale = json.scale.scale;
				scaleSet = Boolean(json.scale.scaleSet);
				
				//Origin\\
				origin.id= json.origin.id;
				if(origin.points.length == 0){
					origin.points.push(new Point(json.origin.point0X, json.origin.point0Y));
				} else{
					origin.points[0].x = json.origin.point0X;
					origin.points[0].y = json.origin.point0Y;
				}
				
				originSet = Boolean(json.origin.originSet);
				
				
				//Shapes\\
				while(importCounter <= json.shapes.length - 1){
					importActiveShape = json.shapes[importCounter];
					
					importActiveShape.id = importCounter;
					importActiveShape.editing = Boolean(json.shapes[importCounter].editing);
					
					shapes.push(importActiveShape);
					
					importCounter = importCounter +  1;
				}
				
				render();
			}
			
			function download(filename, text) {
				var pom = document.createElement('a');
				pom.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
				pom.setAttribute('download', filename);
				pom.click();
			}
			
			$('#import').click(function(){
				if($('#importFile').val() != ""){
					var file = document.getElementById("importFile").files[0];
					if (file) {
					    var reader = new FileReader();
					    reader.readAsText(file, "UTF-8");
					    reader.onload = function (evt) {
					        importJSON = evt.target.result;
					        importSet(importJSON);
					    }
					    reader.onerror = function (evt) {
					        prompt("Error reading file.");
					    }
					}
				} else{
					prompt("Please select a file");
				}
			});
			
			
			$('#export').click(function(){
				if(scaleSet === true && originSet === true && shapes.length != 0){
					shapesJSONCounter = 0;
					shapesJSONPointCounter = 0;
					
					while(shapesJSONCounter <= shapes.length - 1){
						activeJShape = shapes[shapesJSONCounter];
						console.log("Starting..." + "Active shape ID: " + activeJShape.id + " | Counter: " + shapesJSONCounter + " | Real ID: " + shapes[shapesJSONCounter].id);
						shapesJSON = shapesJSON + 
						'{' +
							'"editing" : "' + activeJShape.editing + '",' +
							'"points" : [';
						
						while(shapesJSONPointCounter <= activeJShape.points.length - 1){
							console.log("Shapes counter: " + shapesJSONCounter + " | Point counter: " + shapesJSONPointCounter + " | Active Shape length: " + activeJShape.points.length + " | Active shape ID: " + activeJShape.id);
							shapesJSON =  shapesJSON + 
								'{' +
									'"x" : "' + activeJShape.points[shapesJSONPointCounter].x + '",' + 
									'"y" : "' + activeJShape.points[shapesJSONPointCounter].y + '"' +
								'},';
							shapesJSONPointCounter = shapesJSONPointCounter + 1;
						}
						shapesJSONPointCounter = 0;
						
						shapesJSON = shapesJSON.substring(0, shapesJSON.length - 1);
						
						shapesJSON = shapesJSON + 
							']' +
						'},';
						
						
						shapesJSONCounter = shapesJSONCounter + 1;
					}
					
					shapesJSON = shapesJSON.substring(0, shapesJSON.length - 1);
					
					exportJSONContent = exportJSONContent + 
					'"scale" : {' +
						'"id" : "' + scaleObj.id + '",' +
						'"point0X" : "' + scaleObj.points[0].x + '",' +
						'"point0Y" : "' + scaleObj.points[0].y +'",' +
						'"point1X" : "' + scaleObj.points[1].x + '",' +
						'"point1Y" : "' + scaleObj.points[1].y + '",' +
						'"scale" : "' + scale + '",' +
						'"scaleSet" : "' + scaleSet + '"' +
					'},' +
					'"origin" : {' +
						'"id" : "' + origin.id + '",' +
						'"point0X" : "' + origin.points[0].x + '",' +
						'"point0Y" : "' + origin.points[0].y + '",' +
						'"originSet" : "' + originSet + '"' +
					'},' +
					'"shapes" : [' +
						shapesJSON + 
					']}';
					
					download("export.json", exportJSONContent);
				} else{
					if(scaleSet != true && originSet === true && shapes.length != 0){
						prompt("Set a scale before exporting.");
						extraPrompt = "";
					}
					if(originSet != true && scaleSet === true && shapes.length != 0){
						prompt("Set an origin before exporting.");
						extraPrompt = "";
					}
					if(shapes.length == 0 && originSet != true && scaleSet === true){
						prompt("You must have at least one shape before exporting.");
						extraPrompt = "";
					}
					if(extraPrompt != ""){
						prompt(extraPrompt);
					}
				}
			});
			
			$('#setScale').click(function(){
				scaleObj = new shape();
				prompt("Create 2 points. The length of the line created by the points will represent 1 unit in GCode");
				scaleObj.points = [];
				scaleSet = 0;
			})
			
			$('#setOrigin').click(function(){
				if(scaleSet === true){
					origin = new shape();
					origin.points = [];
					originSet = 0;
					prompt("Click to set origin");	
				} else{
					prompt('Set scale first.');
				}
			});
			
			$('#xLock').click(function(){
				if(xLock === false){
					xLock = true
					$(this).addClass('green');
				} else{
					xLock = false;
					$(this).removeClass('green');
				}
			});
			
			$('#yLock').click(function(){
				if(yLock === false){
					yLock = true
					$(this).addClass('green');
				} else{
					yLock = false;
					$(this).removeClass('green');
				}
			});
			
			$('#genGcode').click(function(){
				if(shapes.length != 0 && $('#zVal').val().length != 0){
					gCode = gCode + "M3\n";
					gz = $('#zVal').val();
					
					while(gCounter <= shapes.length - 1){
						gShape = shapes[gCounter];
						calcShapes.push(new shape());
						
						if(gShape.points.length > 0){
							while(gPointCounter <= gShape.points.length - 1){
								calcShapes[gCounter].addPoint(
									Math.round(((origin.points[0].x - gShape.points[gPointCounter].x) / scale) * 100) / 100
									, Math.round(((origin.points[0].y - gShape.points[gPointCounter].y) / scale) * 100) / 100, true);
								gPointCounter = gPointCounter + 1;
							}
							gPointCounter = 0;
						}
						
						gCounter = gCounter + 1;
					}
					
					gCounter = 0;
					gPointCounter = 0;
					
					while(gCounter <= calcShapes.length - 1){
						gShape = calcShapes[gCounter];
						
						if(gShape.points.length > 0){
							gCode = gCode + "N100 Z0\nN100 X" + gShape.points[0].x + " Y" + gShape.points[0].y + "\n";
							while(gPointCounter <= gShape.points.length - 1){
								gCode = gCode + "N100 X" + gShape.points[gPointCounter].x + " Y" + gShape.points[gPointCounter].y + " Z" + gz + "\n";
								gPointCounter = gPointCounter + 1;
							}
							gPointCounter = 0;
						}
						
						gCounter = gCounter + 1;
					}
					gCode = gCode + "N100 Z0\nM5";
					$('#gArea').val(gCode);
				} else{
					prompt("Must have at least one shape and a valid Z Value", 5);
				}
			});
			
			$('#newShape').click(function(){
				if(originSet === true){
					shapes.push(new shape());
					activeShape = shapes[shapes.length - 1];
					$('#finishButton').show('slide');
					prompt('Click to add point');
				} else{
					prompt("First set an origin.");
				}
				
			});
			
			$('#canvas').click(function(){
				if(originSet === true){
					if(typeof activeShape === 'undefined'){
						
					} else{
						activeShape.addPoint(clickX, clickY);
					}
				}
				if(originSet === false || scaleSet === false){
					
				}
				if(scaleSet == 0){
					if(scaleObj.points. length == 1){
						scaleObj.addPoint(clickX, scaleObj.points[0].y);
					} else{
						scaleObj.addPoint(clickX, clickY);
					}
					
					if(scaleObj.points.length == 2){
						scale = Math.abs(scaleObj.points[0].x - scaleObj.points[1].x);
						scaleSet = true;
						prompt("Scale set.");
					}
				}
				if(originSet === 0){
					origin.addPoint(clickX, clickY);
					originSet = true;
					prompt("Origin Created");
				}
			});
			
			$('#finishButton').click(function(){
				activeShape.editing = false;
				$(this).hide('slide');
				prompt("done");
			});
			
			function Point(x, y){
				this.x = x;
				this.y = y;
			}
			

			function shape(){
				this.id = shapes.length;
				this.points = new Array();
				this.editing = true;
				
				this.addPoint = function(x, y, silent){
					if(this.editing === true){
						if(xLock === true){
							x = this.points[this.points.length - 1].x;
						}
						if(yLock === true){
							y = this.points[this.points.length - 1].y;
						}
						
						this.points.push(new Point(x, y));
						
						if(typeof silent === 'undefined'){
							prompt("New point created at X: " + this.points[this.points.length - 1].x + " Y: " + this.points[this.points.length - 1].y);	
						}
					}
				}
			}
			
			function prompt(message, time){
				if(message == 'done'){
					$('#prompt').hide('slide');
				}
				if(typeof time === 'undefined'){
					time = null;
				} else{
					time = time * 1000;
					setTimeout(function (){
						$('#prompt').hide('slide');		
			         }, time);
				}
				if($('#prompt').html() != message){
					$('#prompt').html(message);
					$('#prompt').show('slide');	
				}
			}
		</script>
	</body>
</html>