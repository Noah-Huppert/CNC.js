function init() {//On load function
	setSize();
	
}

function setSize() {//Set size function
	setCanvas();
	$('#gArea').css({
		'height' : $(window).height() - ($('#panelContiner').height() - $('#gArea').height()) - 50
	});
}

function setCanvas(){
	var cWidth = $(window).width() - 240;
	var cHeight = $(window).height() - 50;
	//if(cWidth < 700){
	//	cWidth = 700;
	//}
	
	if(cHeight < 500){
		cHeight = 500;
	}
	$('#canvas').attr('width', cWidth);
	$('#canvas').attr('height', cHeight);
}
