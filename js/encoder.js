/*
################################################################################
#
#   Rather than read in the map images at runtime (as the code used to do) this
#   code is used to read & parse the map images and spit out a javascript array
#   that you then save into the map.js file
#
#   I know the code to "output" the resulting map is a bit grim and in reality
#   I should just dump the object into a textarea or something, I actually quite
#   like it doing it this way. The whole thing is simple so why not.
#
#   Also: I know I could pack up the data using RLE or convert each x,y map
#   'stack' into binary and then hex, i.e. position 0,0 = "0010111" which would
#   be a 3 cube high wall, with a space above it and then another cube then more
#   space. In hex that would be 17, then each x,y co-ord on the map could be
#   represented by 2 character long hex, that could then itself be RLE encoded
#   *but* I like looking at pretty maps, so for the moment this will do and I'll
#   leave packing the data for another day.
#
################################################################################
*/

control = {
	
    currentLevel: 0,
    maxLevel: 6,
    map: [],

	init: function() {
		
        this.canvas = $('#mapholder')[0];
        this.loadLevel();

	},

    loadLevel: function() {
        
        $('#level').remove();
        var l = $('<img>').attr('id', 'level');
        l.load(control.parseLevel);
        $('#map').append(l);
        $('#level').attr('src', 'maps/antchester/level' + control.currentLevel + '.bmp');

    },

    parseLevel: function() {

        var ctx = control.canvas.getContext('2d');
        ctx.drawImage($('#level')[0], 0, 0);

        var level = [];


        for (var y = 0; y < ctx.canvas.height; y++) {
            var row = '';
            for (var x = 0; x < ctx.canvas.width; x++) {
                var imageData = ctx.getImageData(x, y, 1, 1);
                var total = imageData.data[0] + imageData.data[1] + imageData.data[2];
                if (total === 0) {
                    //  Add block
                    row+='#';
                } else {
                    //  Add space
                    row+='.';
                }
            }
            level.push(row);
        }

        control.map.push(level);

        control.currentLevel++;
        if (control.currentLevel <= control.maxLevel) {
            control.loadLevel();
        } else {
            control.finishMap();
        }

    },

    finishMap: function() {
        
        $('#map').remove();
        $('#mapholder').remove();

        var newHtml = 'map = [<br />';
        for (var level in control.map) {
            newHtml+='&nbsp;&nbsp;[<br />';
            for (var row in control.map[level]) {
                newHtml+='&nbsp;&nbsp;&nbsp;&nbsp;"' + control.map[level][row] + '"';
                if (row < control.map[level].length-1) newHtml+=',';
                newHtml+='<br />';
            }
            newHtml+='&nbsp;&nbsp;]';
            if (level < control.map.length-1) newHtml+=',';
            newHtml+='<br />';
        }
        newHtml+=']<br />';

        $('#result').html(newHtml);

    }

};