control = {
	
    renderer: null,
    scene: null,
	camera: null,
    light: null,
    mergedGeo: null,
    canvas: null,
    currentLevel: 0,
    maxLevel: 6,
    counter: 0,

	init: function() {
		
        //  create a scene ;)
        control.scene                   = new THREE.Scene();
        control.scene.fog               = new THREE.Fog( 0xefefef, 1, 15000 );

        //  add the camera
        control.camera                  = new THREE.PerspectiveCamera( 60, window.innerWidth / window.innerHeight, 1, 20000 );
        control.scene.add( control.camera );

        //  Now a light so we can see stuff
        control.light = new THREE.PointLight( 0xFFFFFF );
        control.light.position.set( -3600, 4800, 8000 );
        control.scene.add( control.light );

        control.mergedGeo               = new THREE.Geometry();

        control.renderer                = new THREE.WebGLRenderer();
        control.renderer.setSize( window.innerWidth, window.innerHeight );
        control.renderer.sortObjects    = false;
        document.body.appendChild( control.renderer.domElement );

        this.loadLevel();


	},

    loadLevel: function() {
        
        var geometry = new THREE.CubeGeometry( 100, 100, 100 );
        var mesh = new THREE.Mesh( geometry );

        for (var z in map) {
            for (var y in map[z]) {
                for (var x in map[z][y]) {
                    if (map[z][y][x] == '#') {
                        mesh.position.x= (x*100) - (map[z][y].length * 50);
                        mesh.position.y= (z*100);
                        mesh.position.z= (y*100) - (map[z].length * 50);
                        THREE.GeometryUtils.merge(control.mergedGeo, mesh);
                        control.counter++;
                    }
                }
            }
        }

        control.finishMap();

    },

    finishMap: function() {
        
        var material    = new THREE.MeshLambertMaterial( { color: 0x999999, shading: 3 } );
        control.mergedGeo.computeFaceNormals();
        var group   = new THREE.Mesh( control.mergedGeo, material );
        group.matrixAutoUpdate = false;
        group.updateMatrix();
        control.scene.addObject( group );

        control.animate();
    },

	animate: function() {

        requestAnimationFrame( control.animate );
        control.render();
		
	},

	render: function() {
		
        var timer = new Date().getTime() * 0.0002;
        var timey = new Date().getTime() * 0.0001;
        var timerd = new Date().getTime() * 0.00001;
        var timert = new Date().getTime() * -0.00023;

        var dist = (Math.cos(timerd)+1)/2*3000+2000;
        var distt = (Math.cos(timerd)+1)/2*1800+1000;

        control.camera.position.x = Math.cos( timer ) * dist;
        control.camera.position.z = Math.sin( timer ) * dist;
        control.camera.position.y = (((Math.sin( timey )+1)/3)+0.2) * 3000;

        this.camera.lookAt( new THREE.Vector3(Math.sin( timert ) * distt, 0, Math.sin( timert ) * distt) );
        

        control.renderer.render( control.scene, control.camera );
	}

};