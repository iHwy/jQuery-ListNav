/*
 *
 * jQuery listnav plugin
 * Copyright (c) 2008 iHwy, Inc.
 * Author: Jack Killpatrick
 *
 * Version 1.0.1 (10/07/2008)
 * Requires jquery 1.2+ and jquery dimensions plugin OR jquery 1.2.6 (which includes dimensions plugin)
 *
 * History:
 * 1.0.1 - released 2008-10-07: bug fix for LI's with nested lists
 * 1.0.0 - released 2008-10-02
 *
 * Visit http://www.ihwy.com/labs/jquery-listnav-plugin.aspx for more information.
 *
 * Dual licensed under the MIT and GPL licenses:
 *   http://www.opensource.org/licenses/mit-license.php
 *   http://www.gnu.org/licenses/gpl.html
 *
 * OPTIONS:
 *
 *	option			default					description
 *	initLetter		''						Letter than you would like the list to initialize at. IE, set it to 'C' and when the list gets bound the items starting with 'C' will be displayed.
 *	includeAll		true					True means to include the 'All' item in the nav bar. False means not to show it.
 *	flagDisabled	true					True means to apply the disabledClass (see below) to letters in the navbar that have no entries in the list. IE: it can be used to make those letters look 'disabled' using CSS. False means not to apply the style.
 *	noMatchText		'No matching entries'	This is the text that appears in place of the list if the user clicks a letter that has no mathing entries.
 *	lastClass		'ln-last'				This is the CSS class name that is used to style the right-hand border of the navigation control.
 *	selectedClass	'ln-selected'			This is the CSS class name used to style the 'selected' navigation letter. IE: when the user clicks 'A', this style gets applied to 'A'.
 *	disabledClass	'ln-disabled'			This is the CSS class name used to style 'disabled' letters (see the flagDisabled option above).
 *	showCounts		true					True means to show the numerical count above each letter when they are moused-over. False means not to.
 * 
 * 
 * Example usage (overriding each of the default options). Notice the naming convention for the id of the 
 * div for the navbar and the id of the list: the div where the navbar will be rendered must start with 
 * the same id as the list it will be bound to, plus "-nav" at the end.
 * 
 *	<div id="categoryList-nav"></div>
 *
 *	<ul id="categoryList" class="listnav">
 *		<li>A one</li>
 *		<li>A two</li>
 *		<li><a href="bOne.html">B one</a></li>
 *		<li><a href="bTwo.html">B two</a></li>
 *		<li><div style="color:red"><a href="cOne.html">C one</a></div></li>
 *		<li><div style="color:red"><a href="cTwo.html">C two</a></div></li>
 *		<li>
 *	</ul>
 *
 *	var opts = {
 *		initLetter: 'c',
 *		includeAll: false,
 *		flagDisabled: false,
 *		noMatchText: 'Nothing matched your filter, please click another letter.',
 *		lastClass: 'letters-last',
 *		selectedClass: 'letters-selected',
 *		disabledClass: 'letters-disabled'
 *	};
 *
 *	$('#categoryList').listnav(opts);
 */

(function($) {
	$.fn.listnav = function(options) {
		var opts = $.extend({}, $.fn.listnav.defaults, options);
		var letters = ['A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','Q','R','S','T','U','V','W','X','Y','Z'];
		
		return this.each(function(){
			var $wrapper, list, $list, $letters, $letterCount, id;
			id = this.id;
			$wrapper = $('#' + id + '-nav'); // user must abide by the convention: <ul id="myList"> for list and <div id="myList-nav"> for nav wrapper
			$list = $(this);

			var counts, allCount, isAll, prevLetter;
			counts = [];
			allCount = 0;
			isAll = true;
			prevLetter = '';

			function init(){
				$wrapper.append( createLettersHtml() );
				
				$letters = $('.ln-letters', $wrapper).slice(0,1); // will always be a single item
				if (opts.showCounts) $letterCount = $('.ln-letterCount', $wrapper).slice(0,1); // will always be a single item

				$('.z', $letters).addClass(opts.lastClass); // allows for styling a case where last item needs right border set (because items before that only have top, left and bottom so that border between items isn't doubled)

				addLIClasses();
				addNoMatchLI();
				storeLetterCounts();
				bindHandlers();

				if (! opts.includeAll) $list.show(); // show the list in case the recommendation for includeAll=false was taken

				// decide whether to show all or click on a letter
				//
				if (! opts.includeAll) $('.all', $letters).hide();
				
				if (opts.initLetter != '') $('.' + opts.initLetter, $letters).slice(0,1).click(); // click the initLetter if there was one
				else {
					if (opts.includeAll) $('.all', $letters).addClass(opts.selectedClass); // showing all: we don't need to click this: the whole list is already loaded
					else { // ALL link is hidden, click the first letter that will display LI's
						for(var i=0;i<counts.length;i++){
							if (counts[i] > 0){
								$('.' + letters[i].toLowerCase(), $letters).slice(0,1).click();
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
			function addLIClasses(){
				var str;
				$('>li', $list).each(function(){
					str = $(this).text().replace(/\s+/g,'').toLowerCase(); // strip all white space from text (including tabs and linebreaks that might have been in the HTML) // thanks to Liam Byrne, liam@onsight.ie
					if (str != '') $(this).addClass( str.slice(0,1) ); // uses the first letter of the text in the class name
				});
			}
	
			// populate the counts, allCount
			//
			function storeLetterCounts(){
				var count = 0; var letter;
				for(var i=0;i<letters.length;i++){
					letter = letters[i].toLowerCase();
					count = $('>li.' + letter, $list).length;
					counts.push(count);
					allCount += count;

					// if the count is 0 and we're supposed to flag the disabled items, add the disabled class
					//
					if (opts.flagDisabled && (count == 0)) $('.' + letter, $letters).addClass(opts.disabledClass);
				}
			}

			function addNoMatchLI(){
				$list.append('<li class="noMatch" style="display:none">' + opts.noMatchText + '</li>');
			}
		
			function getLetterCount(el){
				return ( $(el).hasClass('all') ) ? allCount : counts[ $.inArray( $(el).attr('class').split(' ')[0].toUpperCase(), letters ) ]; // doing [0] because we might have class="a disabled" (disabled will always be after the letter)
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
					$('a.' + opts.selectedClass, $letters).removeClass(opts.selectedClass);

					var letter = $(this).attr('class').split(' ')[0];
					
					if(letter == 'all'){
						$('>li', $list).show();
						$('>li.noMatch', $list).hide();
						isAll = true;
					} else {
						if(isAll){
							$('>li', $list).hide();
							isAll = false;
						} else if (prevLetter != '') $('>li.' + prevLetter, $list).hide();
						
						var count = getLetterCount(this);
						if (count > 0) {
							$('>li.noMatch', $list).hide(); // in case it's showing
							$('>li.' + letter, $list).show();
						}
						else $('>li.noMatch', $list).show();
						
						prevLetter = letter;
					}
					
					$(this).addClass(opts.selectedClass);
					$(this).blur();
					return false;
				});
			}

			// creates the HTML for the letter links
			//	
			function createLettersHtml(){
				var html = [];
				for(var i=0;i<letters.length;i++){
					if (html.length == 0) html.push('<a class="all" href="#">ALL</a>');
					html.push('<a class="' + letters[i].toLowerCase() + '" href="#">' + letters[i] + '</a>');
				}
				return '<div class="ln-letters">' + html.join('') + '</div><div style="clear:both"></div>' + ((opts.showCounts) ? '<div class="ln-letterCount" style="display:none; position:absolute; top:0; left:0; width:20px;">0</div>' : ''); // the styling for letterCount is to give us a starting point for the element, which will be repositioned when made visible (ie, should not need to be styled by the user)
			}

			init();
		});
	};

	$.fn.listnav.defaults = {
		initLetter: '',
		includeAll: true,
		flagDisabled: true,
		noMatchText: 'No matching entries',
		lastClass: 'ln-last',
		selectedClass: 'ln-selected',
		disabledClass: 'ln-disabled',
		showCounts: true
	};
})(jQuery);
