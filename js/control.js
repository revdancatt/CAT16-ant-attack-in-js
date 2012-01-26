control = {
	
	camera: null,
    light: null,
	scene: null,
    target: null,
	renderer: null,
    geometry: null,
    material: null,
    mesh: null,
    viewer: {x: -3000, y: 4000, z: 8000},
    canvas: null,
    currentLevel: 0,
    maxLevel: 6,

	init: function() {
		
        this.canvas = $('#mapholder')[0];

//        this.canvas = $('#mapholder')[0];
//        var ctx = this.canvas.getContext('2d');
//        ctx.drawImage($('#level1')[0], 0, 0);

        //  create the initial empty scene
        this.scene = new THREE.Scene();

        this.target = new THREE.Vector3(-300, -4500, 1000);

        this.camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 1, 30000 );
        this.camera.position.set(this.viewer.x, this.viewer.y, this.viewer.z);
        this.scene.add( this.camera );

        this.light = new THREE.PointLight( 0xFFFFFF );
        this.light.position.set( this.viewer.x*1.2, this.viewer.y*1.2, this.viewer.z );
        this.scene.add( this.light );

        //  add the onload function to the image so we can do all that stuff
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
        for (var y = 0; y < ctx.canvas.height; y++) {
            for (var x = 0; x < ctx.canvas.width; x++) {
                var imageData = ctx.getImageData(x, y, 1, 1);
                var total = imageData.data[0] + imageData.data[1] + imageData.data[2];
                if (total === 0) {
                    control.geometry = new THREE.CubeGeometry( 100, 100, 100 );
                    control.material = new THREE.MeshLambertMaterial( { color: 0x999999, shading: 3 } );
                    control.mesh = new THREE.Mesh( control.geometry, control.material );
                    control.mesh.position.x+= (x*100) - (ctx.canvas.width * 50);
                    control.mesh.position.y+= (control.currentLevel*100);
                    control.mesh.position.z+= (y*100) - (ctx.canvas.height * 50);
                    control.scene.add( control.mesh );
                }
            }
        }

        control.currentLevel++;
        if (control.currentLevel <= control.maxLevel) {
            control.loadLevel();
        } else {
            $('#map').remove();
            $('#mapholder').remove();
            control.finishMap();
        }
    },

    finishMap: function() {
        
        control.renderer = new THREE.CanvasRenderer();
        control.renderer.setSize( window.innerWidth, window.innerHeight );
        document.body.appendChild( control.renderer.domElement );
        control.animate();

    },

	animate: function() {

        requestAnimationFrame( control.animate );
        control.render();
		
	},

	render: function() {
		
        this.camera.position.x += 50;
        this.light.position.x += 50;
        this.camera.lookAt( this.target );
        this.renderer.render( this.scene, this.camera );
	}

};