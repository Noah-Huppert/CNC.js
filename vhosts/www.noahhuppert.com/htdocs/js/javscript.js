function setBackground() {
	if ($(window).width() >= 767) {
		$('body').css({
			'background' : 'url("/img/backgroundL.jpg")'
		});
	}

	if ($(window).width() < 767 && $(window).width() >= 553) {
		$('body').css({
			'background' : 'url("/img/backgroundM.jpg")'
		});
	}

	if ($(window).width() < 553 && $(window).width() >= 350) {
		$('body').css({
			'background' : 'url("/img/backgroundS.jpg")'
		});
	}

	if ($(window).width() < 350) {
		$('body').css({
			'background' : 'url("/img/backgroundXS.jpg")'
		});
	}
	
	return $.Deferred();
}

function setSize(prevW) {
	$('#blogMenuOptions').css({
		'y' : '-120'
	});

	$('#portfolioMenuOptions').css({
		'y' : '-120'
	});
	if ($(window).width() >= 767 && (($(window).width() / 4) * 3) <= 1440) {//making sure there is a little space on the side of content
		$('.container').width(($(window).width() / 4) * 3);
		$('.mobileCollapse').hide();
		//remove easier expand collapse button
		$('#mNavBar').hide();
		$('#navContainer').show();
	}
	if ($(window).width() <= 767) {//making sure there is a little space on the side of content
		$('.container').width($(window).width() - 20);
		$('.mobileCollapse').show();
		//easier expand collapse button
		$('#mNavBar').show();
		$('#navContainer').hide();
	}
	if ($(window).width() <= 553) {//Making sure rating stars do now leak outside of content area
		$('#opmlList details details').css({//Makes indent size of each item less
			'margin-left' : '-25px'
		});
		$('#opmlList details details li').css({//Makes indent size of each content item less
			'margin-left' : '-25px'
		});
		//$('details').details('close');
		$('.mobileCollapse').html('More');
		$('.altRatingStar').show();
		$('.skillListDivider').hide();
		$('.ratingStarContainer').hide();
	}

	if ($(window).width() > 553) {//Making sure rating stars do now leak outside of content area
		$('#opmlList details details').css({
			'margin-left' : ''
		});
		$('#opmlList details details li').css({
			'margin-left' : ''
		});
		//$('details').details('open');
		$('.mobileCollapse').html('Less');
		$('.altRatingStar').hide();
		$('.skillListDivider').show();
		$('.ratingStarContainer').show();
	}
	$('.mobileCollapse').click(function() {//Make so label corsponds to details state
		switch($(this).html()) {
			case 'More':
				$(this).html('Less');
				break;

			case 'Less':
				$(this).html('More');
				break;
		}
	});
	$('#opmlList details details summary').click(function() {//Make so label corsponds to details state
		switch($(this).children(".mobileCollapse").first().html()) {
			case 'More':
				$(this).children(".mobileCollapse").first().html('Less');
				break;

			case 'Less':
				$(this).children(".mobileCollapse").first().html('More');
				break;
		}
	});
		$("#mMenuButton").unbind().click(function() {
			if($('#mOptions').css('display') == 'none') {
				$('#mOptions').show();
			} else{
				$('#mOptions').hide();
			}
		});
		return $.Deferred();
}

function orderPosts() {
	var months = new Array("null", "Jan", "Feb", "Mar", "Apr", "May", "June", "July", "Aug", "Sept", "Oct", "Nov", "Dec");
	var baseYear = 2013;
	var counter = 0;
	var monthCounter = 0;
	var dayCounter = 0;
	var yearCounter = baseYear;
	var dates = new Array();
	var tempDate;
	var tempDateArray = new Array();
	var sortA = new Array();
	var sortB = new Array();
	$('#blogPage .post').each(function() {
		tempDate = $(this).data("created");
		tempDateArray = tempDate.split(",");
		tempDate = tempDateArray[1];
		tempDateArray = tempDate.split(" ");
		var tempNewDate = new Date();
		tempNewDate.setFullYear(tempDateArray[3]);
		tempNewDate.setMonth(months.indexOf(tempDateArray[2]));
		tempNewDate.setDate(tempDateArray[1]);
		tempNewDate.setHours('0');
		tempNewDate.setMinutes('0');
		tempNewDate.setSeconds('0');
		tempNewDate.setMilliseconds(counter);
		dates.push(tempNewDate);
		$(this).attr("data-postnumber", tempNewDate.getMilliseconds());
		counter = counter + 1;
	});
	var sortedDates = dates.slice(0).sort(function(a, b) {
		return (new Date(b)) - (new Date(a))
	});
	while (monthCounter < dates.length) {
		//$('#order').append(sortedDates[monthCounter] + " | " + '#blogPage .post[data-postnumber=' + sortedDates[monthCounter].toString().split(" ")[4].split(":")[2] + ']' + "<br>");
		$('#blogPage .post[data-postnumber=' + dates[monthCounter].getMilliseconds() + ']').attr("data-postorder", monthCounter);
		monthCounter = monthCounter + 1;
	}
	counter = 0;
	while (counter < $('#blogPage .post').length) {
		$('#top').append("<details open>" + $('#blogPage .post[data-postorder="' + counter + '"]').html() + "</details>");
		counter = counter + 1;
	}
	return $.Deferred();
}

function doubleNumber(inputNumber) {
	if (inputNumber < 10) {
		return "0" + inputNumber;
	}
	return inputNumber;
}

function setPage() {
	var rawURL = document.URL;
	var splitURL = rawURL.split('/');
	var URLOffset = 3;
	//Were new paths start for page. In this case http: | //127.0.0.1/ | Blog3/ | aboutMe <-- New pages start here on 4th split
	var URLSelectCounter = 0;
	var URLCatagory = splitURL[URLOffset];
	var URLPage = ['0'];
	while (URLSelectCounter < splitURL.length - URLOffset) {
		URLPage[URLSelectCounter] = splitURL[URLOffset + URLSelectCounter];
		URLSelectCounter = URLSelectCounter + 1;
	}
	$('.page').hide();
	//If urlPage is not set show aboutMe
	if (URLPage[0] != 'Blog' && URLPage[0] != 'Portfolio') {
		$('#portfolioButton').click(function() {
			window.location = '/Portfolio';
		});
		$('#blogButton').click(function() {
			window.location = '/Blog';
		});
		$('#aboutMePage').show();
	}
	if (URLPage[0] == 'Blog' || URLPage[0] == 'Portfolio') {//If urlPage is defined as valid
		switch(URLPage[0]) {
			case 'Blog':
				$('#portfolioButton').click(function() {
					window.location = '/Portfolio';
				});
				$('#blogPage').show();
				$('#opmlList').hide();
				switch(URLPage[1]) {
					case 'Programming':
						$('#blogPage #Animation').hide();
						$('#blogPage #Robotics').hide();
						$('#blogPage #Other').hide();
						$('#blogPage #Programming').show();
						$('#opmlListClone').hide();
						$('#opmlList').show();
						showPost();
						break;

					case 'Animation':
						$('#blogPage #Programming').hide();
						$('#blogPage #Robotics').hide();
						$('#blogPage #Other').hide();
						$('#blogPage #Animation').show();
						$('#opmlListClone').hide();
						$('#opmlList').show();
						showPost();
						break;

					case 'Robotics':
						$('#blogPage #Animation').hide();
						$('#blogPage #Programming').hide();
						$('#blogPage #Other').hide();
						$('#blogPage #Robotics').show();
						$('#opmlListClone').hide();
						$('#opmlList').show();
						showPost();
						break;

					case 'Other':
						$('#blogPage #Animation').hide();
						$('#blogPage #Robotics').hide();
						$('#blogPage #Programming').hide();
						$('#blogPage #Other').show();
						$('#opmlListClone').hide();
						$('#opmlList').show();
						showPost();
						break;
				}
				break;

			case 'Portfolio':
				$('#blogButton').click(function() {
					window.location = '/Blog';
				});
				$('#portfolioPage').show();
				switch(URLPage[1]) {
					case 'Programming':
						$('#portfolioPage #Animation').hide();
						$('#portfolioPage #Robotics').hide();
						$('#portfolioPage #Other').hide();
						$('#portfolioPage #Programming').show();
						showPost();
						break;

					case 'Animation':
						$('#portfolioPage #Programming').hide();
						$('#portfolioPage #Robotics').hide();
						$('#portfolioPage #Other').hide();
						$('#portfolioPage #Animation').show();
						showPost();
						break;

					case 'Robotics':
						$('#portfolioPage #Animation').hide();
						$('#portfolioPage #Programming').hide();
						$('#portfolioPage #Other').hide();
						$('#portfolioPage #Robotics').show();
						showPost();
						break;

					case 'Other':
						$('#portfolioPage #Animation').hide();
						$('#portfolioPage #Robotics').hide();
						$('#portfolioPage #Programming').hide();
						$('#portfolioPage #Other').show();
						showPost();
						break;
				}
				break;
		}
	}
	//If url page is aboutMe show about me page
	if (URLPage[0] == 'aboutMe') {
		$('#aboutMePage').show();
	}

	function showPost() {
		if (URLPage.length >= 3 && URLPage[2] != '') {
			switch(URLPage[0]) {
				case 'Blog':
					$('#blogPage .post').hide();
					$('#blogPage #' + URLPage[2]).show();
					break;

				case 'Portfolio':
					$('#portfolioPage .post').hide();
					$('#portfolioPage #' + URLPage[2]).show();
					break;
			}
		}
	}
	return $.Deferred();
}

//Top Menus
$('#blogButton').click(function() {//Blog Menu Options
	switch($('#headerImage').css('opacity')) {
		case '0':
			$('#headerImage').transition({
				y : 0,
				opacity : 1,
				delay : 300
			});
			$('#portfolioButton').transition({
				y : 0,
				opacity : 1,
				delay : 300
			});
			$('#blogButton').transition({
				x : 0
			});
			$('#blogMenuOptions').transition({
				y : -120
			});
			break;

		case '1':
			$('#headerImage').transition({
				y : 120,
				opacity : 0
			});
			$('#portfolioButton').transition({
				y : -120,
				opacity : 0
			});
			$('#blogButton').transition({
				x : -100,
				delay : 200
			});
			$('#blogMenuOptions').transition({
				y : 45,
				delay : 300
			});
			break;
	}
});

$('#portfolioButton').click(function() {
	switch($('#headerImage').css('opacity')) {//Portfolio Menu Options
		case '0':
			$('#headerImage').transition({
				y : 0,
				opacity : 1,
				delay : 300
			});
			$('#blogButton').transition({
				y : 0,
				opacity : 1,
				delay : 300
			});
			$('#portfolioButton').transition({
				x : 0
			});
			$('#portfolioMenuOptions').transition({
				y : -120
			});
			break;

		case '1':
			$('#headerImage').transition({
				y : 120,
				opacity : 0
			});
			$('#blogButton').transition({
				y : -120,
				opacity : 0
			});
			$('#portfolioButton').transition({
				x : 110,
				delay : 200
			});
			$('#portfolioMenuOptions').transition({
				y : 45,
				delay : 300
			});
			break;
	}
});

//Header image on click
$('#headerImage').click(function() {
	$('#headerImage').transition({
		rotate : 360,
		duration : 1000
	}).transition({
		rotate : 0,
		duration : 0
	});
	setTimeout(function() {
		window.location = '/aboutMe';
	}, 1000);
}); 

$('.collapseAll').click(function(){
	switch($('details details').details()){
		case true:
			$('details details').details('close');
		break;
		
		case false:
			$('details details').details('open');
		break;
	}
});
