/*
 *
 * jQuery listnav plugin
 * Copyright (c) 2009 iHwy, Inc.
 * Author: Jack Killpatrick
 *
 * Version 2.0 (03/02/2009)
 * Requires jQuery 1.3.2, jquery 1.2.6 or jquery 1.2.x plus the jquery dimensions plugin
 *
 * Visit http://www.ihwy.com/labs/jquery-listnav-plugin.aspx for more information.
 *
 * Dual licensed under the MIT and GPL licenses:
 *   http://www.opensource.org/licenses/mit-license.php
 *   http://www.gnu.org/licenses/gpl.html
 *
*/

(function($) {
	$.fn.listnav = function(options) {
		var opts = $.extend({}, $.fn.listnav.defaults, options);
		var letters = ['_','a','b','c','d','e','f','g','h','i','j','k','l','m','n','o','p','q','r','s','t','u','v','w','x','y','z'];
		var firstClick = false;
		
		return this.each(function(){
			var $wrapper, list, $list, $letters, $letterCount, id;
			id = this.id;
			$wrapper = $('#' + id + '-nav'); // user must abide by the convention: <ul id="myList"> for list and <div id="myList-nav"> for nav wrapper
			$list = $(this);

			var counts = {}, allCount = 0, isAll = true, numCount = 0, prevLetter = '';

			function init(){
				$wrapper.append( createLettersHtml() );
				
				$letters = $('.ln-letters', $wrapper).slice(0,1); // will always be a single item
				if (opts.showCounts) $letterCount = $('.ln-letter-count', $wrapper).slice(0,1); // will always be a single item

				$('.z', $letters).addClass('ln-last'); // allows for styling a case where last item needs right border set (because items before that only have top, left and bottom so that border between items isn't doubled)

				addClasses();
				addNoMatchLI();
				if (opts.flagDisabled) addDisabledClass();
				bindHandlers();
				
				if (! opts.includeAll) $list.show(); // show the list in case the recommendation for includeAll=false was taken

				// decide whether to show all or click on a letter
				//
				if (! opts.includeAll) $('.all', $letters).hide();
				if (! opts.includeNums) $('._', $letters).hide();
				
				if($.cookie && (opts.cookieName != null)){
					var cookieLetter = $.cookie(opts.cookieName);
					if(cookieLetter != null) opts.initLetter = cookieLetter;
				}
				
				if (opts.initLetter != ''){
					firstClick = true;
					$('.' + opts.initLetter.toLowerCase(), $letters).slice(0,1).click(); // click the initLetter if there was one
				}
				else {
					if (opts.includeAll) $('.all', $letters).addClass('ln-selected'); // showing all: we don't need to click this: the whole list is already loaded
					else { // ALL link is hidden, click the first letter that will display LI's
						for(var i=((opts.includeNums)?0:1);i<letters.length;i++){
							if(counts[letters[i]] > 0){
								firstClick = true;
								$('.' + letters[i], $letters).slice(0,1).click();
								break;
							}
						}				
					}
				}
			}
			
			// positions the letter count div above the letter links (so we only have to do it once: after this we just change it's left position via mouseover)
			//
			function setLetterCountTop(){
				$letterCount.css({top: $('.a', $letters).slice(0,1).offset({margin:false, border:true}).top - $letterCount.outerHeight({margin:true})}); // note: don't set top based on '.all': it might not be visible
			}
		
			// adds a class to each LI that has text content inside of it (ie, inside an <a>, a <div>, nested DOM nodes, etc)
			//
			function addClasses(){
				var str, firstChar;
				$($list).children().each(function(){
					str = $(this).text().replace(/\s+/g,''); //.toLowerCase(); // strip all white space from text (including tabs and linebreaks that might have been in the HTML) // thanks to Liam Byrne, liam@onsight.ie
					if (str != '') {
						firstChar = str.slice(0,1).toLowerCase();
						if(! isNaN(firstChar)) firstChar = '_'; // use '_' if the first char is a number
						$(this).addClass('ln-' + firstChar);

						if(counts[firstChar] == undefined) counts[firstChar] = 0;
						counts[firstChar]++;
						allCount++;
					}
				});
			}
			
			function addDisabledClass(){
				for(var i=0;i<letters.length;i++){
					if(counts[letters[i]] == undefined) $('.' + letters[i], $letters).addClass('ln-disabled');
				}
			}

			function addNoMatchLI(){
				$list.append('<li class="ln-no-match" style="display:none">' + opts.noMatchText + '</li>');
			}
		
			function getLetterCount(el){
				if($(el).hasClass('all')) return allCount;
				else {
					var count = counts[ $(el).attr('class').split(' ')[0] ];
					return (count != undefined) ? count : 0; // some letters may not have a count in the hash
				}
			}
	
			function bindHandlers(){
			
				// sets the top position of the count div in case something above it on the page has resized
				//
				if (opts.showCounts){
					$wrapper.mouseover(function(){
						setLetterCountTop();
					});
				}
				
				// mouseover for each letter: shows the count above the letter
				//
				if (opts.showCounts){
					$('a', $letters).mouseover(function(){
						var left = $(this).position().left;
						var width = ($(this).outerWidth({margin:true})-1) + 'px'; // the -1 is to tweak the width a bit due to a seeming inaccuracy in jquery ui/dimensions outerWidth (same result in FF2 and IE6/7)
						var count = getLetterCount(this);
						$letterCount.css({left:left, width:width}).text( count ).show() ; // set left position and width of letter count, set count text and show it
					});
								
					// mouseout for each letter: hide the count
					//
					$('a', $letters).mouseout(function(){
						$letterCount.hide();
					});
				}
				
				// click handler for letters: shows/hides relevant LI's
				//
				$('a', $letters).click(function(){
					$('a.ln-selected', $letters).removeClass('ln-selected');

					var letter = $(this).attr('class').split(' ')[0];
					
					if(letter == 'all'){
						$list.children().show();
						$list.children('.ln-no-match').hide();
						isAll = true;
					} else {
						if(isAll){
							$list.children().hide();
							isAll = false;
						} else if (prevLetter != '') $list.children('.ln-' + prevLetter).hide();
						
						var count = getLetterCount(this);
						if (count > 0) {
							$list.children('.ln-no-match').hide(); // in case it's showing
							$list.children('.ln-' + letter).show();
						}
						else $list.children('.ln-no-match').show();
						
						prevLetter = letter;
					}
					
					if($.cookie && (opts.cookieName != null)) $.cookie(opts.cookieName, letter);

					
					$(this).addClass('ln-selected');
					$(this).blur();
					if (!firstClick && (opts.onClick != null)) opts.onClick(letter);
					else firstClick = false;
					return false;
				});
			}
			
			// creates the HTML for the letter links
			//	
			function createLettersHtml(){
				var html = [];
				for(var i=1;i<letters.length;i++){
					if (html.length == 0) html.push('<a class="all" href="#">ALL</a><a class="_" href="#">0-9</a>');
					html.push('<a class="' + letters[i] + '" href="#">' + letters[i].toUpperCase() + '</a>');
				}
				return '<div class="ln-letters">' + html.join('') + '</div>' + ((opts.showCounts) ? '<div class="ln-letter-count" style="display:none; position:absolute; top:0; left:0; width:20px;">0</div>' : ''); // the styling for ln-letter-count is to give us a starting point for the element, which will be repositioned when made visible (ie, should not need to be styled by the user)
			}

			init();
		});
	};

	$.fn.listnav.defaults = {
		initLetter: '',
		includeAll: true,
		includeNums: true,
		flagDisabled: true,
		noMatchText: 'No matching entries',
		showCounts: true,
		cookieName: null,
		onClick: null
	};
})(jQuery);
