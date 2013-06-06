jQuery-ListNav
==============

This plugin makes it easy for a web developer or designer to add a slick "letter-based" navigation bar to what would otherwise be an ordinary list of things. Clicking a letter quicky filters the list to show only items in that list.

This jQuery plugin supplies an easy way to unobtrusively add a letter-based navigation widget to any UL or OL list. An easily stylable (via CSS) nav bar appears above the list, showing the user the letters A-through-Z. Clicking one of the letters filters the list to show only the items in the list that start with that letter. Hovering over a letter (optionally) shows a count above the letter, indicating how many items will be displayed if that letter is clicked. Other options give you control over the basic functionality.

Features

* Easy to unobtrusively add to existing lists
* Works great on long lists: tuned for performance
* Works on both UL and OL (numbered) lists: when using an OL the numbers start at 1 for each filtered letter
* Can store the clicked letter in a cookie and reload the list using that letter (requires jquery.cookie plugin).
* Can work on multiple lists on the same page (content reflows when list size shrinks and grows)
* Designed with CSS styling in mind
* Works when LI items are floated (which opens the door for some interesting use cases)
* Works with any HTML inside LI's: first letter of actual text is found and used for filtering
* Demos are available to help you implement the plugin

**Options**

* Optional hovering "record count" over each letter gives user a hint of how many items will appear
* Optional "ALL" nav item lets your users see all the items in the list
* Optionally loads up first letter that contains items (ie, if none start with A, but some start with B, B will preload)
* Optionally force a specific letter to preload (ie, preload with C selected)
* Optionally use a CSS class for making letters with no list items appear "disabled"
* Optionally set the text that appears if a letter with no list items is clicked
* Set the name of the cookie you'd like to store the last clicked letter in.
* Optionally fire a custom javascript callback after a letter is clicked.
* Optionally specify prefixes (like "The" or "A") to ignore.
* Optional '[...]' menu item for access to list items that start with punctuation or chars like Ä and Ü.