$('#loadingScreen').css({
	'padding-top' : ($(window).height() - 120) / 2
});
parse('http://dl.dropboxusercontent.com/s/8u8lxfczjhrbkda/noahhuppert.opml', '#blogPage #opmlList', 'Blog').done(loading(20));//For Blog
parse('http://dl.dropbox.com/s/b38ye2ds2x31nch/noahHuppertPortfolio.opml', '#portfolioPage #opmlList', 'Portfolio', true);//For Portfolio
var html = new Array();
var progress = 0;
var i = 0;
function parse(xmlFile, displayElement, subURL, final) {
	var xmlDoc;
	var $xml;
	$.get(xmlFile, function(data) {//Get XML File
		xmlDoc = $.parseXML(data);
		$xml = $(xmlDoc);
		html = [];
		$xml.find('outline').each(function() {
			if ($(this).attr('catagory') == 'true') {
				html.push('<details id="' + $(this).attr('text') + '" open><summary><a href="/' + subURL + "/" + $(this).attr('text') + '/">' + $(this).attr('text') + '</a><span class="mobileCollapse">Less</span></summary>');
				checkChildren($(this), displayElement, subURL, $(this).attr('text'));
				html.push('</details>');
			}

		});
		html = html.join('');
		$(displayElement).append(html);
		if(final == true){
			$('details').details('open');//For Firefox, don't ask why
			$('.closed').details('close');
			setSize().done(loading(40));
			setPage().done(loading(60));
			orderPosts().done(loading(80));
			$(".noContentWarning").hide();
			setBackground().done(loading(100));
		}
	});
	return $.Deferred();
}

function loading(progress){
	if(progress == 100){
		$('#loadingProgressBar').width(progress + "%");
		$('#loadingProgress').html(progress + '% Complete');
		setTimeout(function(){
			$('#loadingScreen').transition({y: $(window).height()}).transition({display: 'none'});
		}, 300);
	}
	if(progress < 100){
		$('#loadingProgressBar').width(progress + "%");
		$('#loadingProgress').html(progress + '% Complete');
	}
}

function checkChildren(node, displayElement, subURL, catagory) {
	if(catagory === undefined){
		catagory = 'null';
	}
	if (node.children().length > 0) {//Check if node has children
		html.push('<ul style="list-style: none;">');
		node.children().each(function() {
			if ($(this).children().length > 0) {//Has children
				if ($(this).parent().attr('catagory') == 'true') {//Post
					html.push('<details class="post" id="' + $(this).attr('text').split(' ').join('_') + '" data-created="' + $(this).attr('created') + '" open><summary><a href="/' + subURL + "/" + catagory + "/" + $(this).attr('text').split(' ').join('_') + '/">' + $(this).attr('text') + '</a><span class="mobileCollapse">Less</span></summary>');
					checkChildren($(this), displayElement, subURL);
					html.push('</details>');
				} else {//Not Post
					if($(this).attr('image') == 'true'){
						html.push('<img class="embededIMG thumbnail" src="' + $(this).attr('imageSRC') + '" />');
					}
					if($(this).attr('closed') == 'true'){
						html.push('<details class="closed" close><summary>' + $(this).attr('text') + '<span class="mobileCollapse">Less</span></summary>');
						checkChildren($(this), displayElement, subURL);
						html.push('</details>');
					}
					if($(this).attr('image') != 'true' && $(this).attr('closed') != 'true'){
						html.push('<details open><summary>' + $(this).attr('text') + '<span class="mobileCollapse">Less</span></summary>');
						checkChildren($(this), displayElement, subURL);
						html.push('</details>');
					}
				}
			} else {//Does not have children
				if ($(this).parent().attr('catagory') == 'true') {//Post
					html.push('<details class="post" id="' + $(this).attr('text').split(' ').join('_') + '" data-created="' + $(this).attr('created') + '" open><summary><a href="/' + subURL + "/" + catagory + "/" + $(this).attr('text').split(' ').join('_') + '/">' + $(this).attr('text') + '</a></summary></details>');
				} else {//Not Post
					if($(this).attr('image') == 'true'){
						html.push('<img class="embededIMG thumbnail" src="' + $(this).attr('imageSRC') + '" />');
					}
					if($(this).attr('image') != 'true' && $(this).attr('closed') != 'true'){
						html.push('<li>' + $(this).attr('text') + '</li>');
					}
				}
			}
		});
		html.push('</ul>');
	}
}