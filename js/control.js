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
    demoMode: true,
    velocity: {turn: 0.0, move: 0.0, strafe: 0.0, fly: 0.0},
    orientation: {x: 0.0, y: 0.0, z: 0.0},
    keyControls: {
        isLeftDown: false,
        isRightDown: false,
        isForwardDown: false,
        isBackwardDown: false,
        isUpDown: false,
        isDownDown: false,
        isStrafeLeftDown: false,
        isStrafeRightDown: false
    },
    grabScreenshot: false,
    imgData: null,
    hidden: false,

	init: function() {

        //  create a scene ;)
        control.scene                   = new THREE.Scene();
        control.scene.fog               = new THREE.Fog( 0xefefef, 1, 10000 );

        //  add the camera
        control.camera                  = new THREE.PerspectiveCamera( 60, window.innerWidth / window.innerHeight, 1, 20000 );
        control.scene.add( control.camera );

        //  Set the starting position
        //  TODO: Hardcoding these positons is bad, we should be able to
        //  set the starting position and orintation in a "header" part
        //  of the map data.
        control.camera.position.x = -1200;
        control.camera.position.y = 160;
        control.camera.position.z = 6400;

        //  Now a light so we can see stuff
        control.light = new THREE.DirectionalLight( 0xCCCCCC );
        control.light.position.set( -3600, 4800, 8000).normalize();
        control.scene.add( control.light );

        control.light = new THREE.DirectionalLight( 0xffffff );
        control.light.position.set( 3600, 8000, -6000).normalize();
        control.scene.add( control.light );

        control.mergedGeo               = new THREE.Geometry();

        control.renderer                = new THREE.WebGLRenderer({preserveDrawingBuffer: true});
        control.renderer.setSize( window.innerWidth, window.innerHeight );
        control.renderer.setClearColor( 0xffffff );
        control.renderer.sortObjects    = false;
        document.body.appendChild( control.renderer.domElement );

        this.loadLevel();

        //  Bind the keys
        //  Yeah ok, so this kinda grew & not the idea way to do this, but it'll do
        //  for the moment.
        $(document).bind('keydown', function(e) {

            if (e.keyCode == 39 || e.keyCode == 68) {control.keyControls.isRightDown = true; control.turnDemoOff() }     //  right key
            if (e.keyCode == 37 || e.keyCode == 65) {control.keyControls.isLeftDown = true; control.turnDemoOff() }      //  left key
            if (e.keyCode == 38 || e.keyCode == 87) {control.keyControls.isForwardDown = true; control.turnDemoOff() }   //  forward key
            if (e.keyCode == 40 || e.keyCode == 83) {control.keyControls.isBackwardDown = true; control.turnDemoOff() }  //  backward key
            if (e.keyCode == 32) {control.keyControls.isUpDown = true; control.turnDemoOff() }                           //  up key
            if (e.keyCode == 88) {control.keyControls.isDownDown = true; control.turnDemoOff() }                         //  down key
            if (e.keyCode == 81) {control.keyControls.isStrafeLeftDown = true; control.turnDemoOff() }                   //  strafe left
            if (e.keyCode == 69) {control.keyControls.isStrafeRightDown = true; control.turnDemoOff() }                  //  strafe right

            //  toggle the demo
            if (e.keyCode == 70) {
                if (control.demoMode) {
                    control.turnDemoOff();
                } else {
                    control.demoMode = true;
                }
            }

        });

        $(document).bind('keyup', function(e) {

            if (e.keyCode == 39 || e.keyCode == 68) control.keyControls.isRightDown = false;   //  right key
            if (e.keyCode == 37 || e.keyCode == 65) control.keyControls.isLeftDown = false;     //  left key
            if (e.keyCode == 38 || e.keyCode == 87) control.keyControls.isForwardDown = false;  //  forward key
            if (e.keyCode == 40 || e.keyCode == 83) control.keyControls.isBackwardDown = false; //  backward key
            if (e.keyCode == 32) control.keyControls.isUpDown = false;                          //  up key
            if (e.keyCode == 88) control.keyControls.isDownDown = false;                        //  down key
            if (e.keyCode == 81) control.keyControls.isStrafeLeftDown = false;                  //  strafe left
            if (e.keyCode == 69) control.keyControls.isStrafeRightDown = false;                 //  strafe right

            if (e.keyCode == 85) {
              if (control.hidden == false) {
                $('.hideme').css("display", "none");
                $(stats.getDomElement()).css("display", "none");
                control.hidden = true;
              } else {
                control.hidden = false;
                $('.hideme').css("display", "inherit");
                $(stats.getDomElement()).css("display", "inherit");
              }
            };

        });

	},


    loadLevel: function() {

      var mergedGeometry = new THREE.Geometry();
      var material    = new THREE.MeshLambertMaterial( {map: new THREE.TextureLoader().load( "imgs/cubeside2.png" ), color: 0xFFFFFF, flatShading: true } );
      var geometry = new THREE.BoxGeometry( 100, 100, 100 );

      for (var z in map) {
          for (var y in map[z]) {
              for (var x in map[z][y]) {
                  if (map[z][y][x] == '#') {
                      var nx = (x*100) - (map[z][y].length * 50);
                      var ny = (z*100);
                      var nz = (y*100) - (map[z].length * 50);
                      geometry.translate(nx, ny, nz);
                      mergedGeometry.merge(geometry);
                      geometry.translate(-nx, -ny, -nz);
                  }
              }
          }
      }

      control.mergedGeo = new THREE.Mesh(mergedGeometry, material);
      control.mergedGeo.updateMatrix();
      control.scene.add( control.mergedGeo );

      control.finishMap();

    },

    finishMap: function() {

        control.animate();

    },

    turnDemoOff: function() {

        //  if the demo is currently on then we need to reset the position
        //  and turn it off
        if (this.demoMode) {
            this.velocity = {turn: 0.0, move: 0.0, strafe: 0.0, fly: 0.0};
            this.orientation = {x: 0.0, y: 0.0, z: 0.0};
            control.camera.rotation.x = 0;
            control.camera.rotation.z = 0;
            control.camera.position.x = -1200;
            control.camera.position.y = 160;
            control.camera.position.z = 6400;
            this.demoMode = false;
        }

    },

	animate: function() {


        //  NOTE: Note sure if all this movement update stuff is in the right place
        //  to not be effected by framerate. We want people to be able to
        //  move forwards the same distance in the same amount of time independent
        //  of framerate.
        //  Need to check to see if this is the right place for this, or I need to
        //  put this into it's own thread.
        var dampening = 0.9;
        var speed = 20;
        var maxturn = 2;

        requestAnimationFrame( control.animate );

        //  dampen the velocities
        //  Do this stops movement from being an on/off thing but a bit more
        //  swooshy and smooth :)
        control.velocity.turn = control.velocity.turn * dampening;
        control.velocity.move = control.velocity.move * dampening;
        control.velocity.fly = control.velocity.fly * dampening;
        control.velocity.strafe = control.velocity.strafe * dampening;

        //  Work out which keys are pressed down

        //  If we are turning left or right increase the velocity in that
        //  direction
        if (control.keyControls.isLeftDown) {
            control.velocity.turn += 0.2;
            if (control.velocity.turn > maxturn) control.velocity.turn = maxturn;
        }

        if (control.keyControls.isRightDown) {
            control.velocity.turn -= 0.2;
            if (control.velocity.turn < -maxturn) control.velocity.turn = -maxturn;
        }

        //  forwards and back stuff
        if (control.keyControls.isForwardDown) {
            control.velocity.move -= speed;
            if (control.velocity.move < -speed) control.velocity.move = -speed;
        }

        if (control.keyControls.isBackwardDown) {
            control.velocity.move += speed;
            if (control.velocity.move > speed) control.velocity.move = speed;
        }

        //  FLYING!!
        if (control.keyControls.isUpDown) {
            control.velocity.fly += speed;
            if (control.velocity.fly > speed) control.velocity.fly = speed;
        }

        if (control.keyControls.isDownDown) {
            control.velocity.fly -= speed;
            if (control.velocity.fly < -speed) control.velocity.fly = -speed;
        }

        //  strafe, slightly slower than moving
        //  At the moment moving forwards and strafing would allow you to move
        //  along a diagonal line faster than if you were running directly
        //  along that line. If this were a multiplayer game that would be a problem
        //  we should modify the forward velocity based on the amount of strafing
        //  so that forwards + strafing moves you at the same speed at just moving
        //  (infact we should rething the whole velocity thing, but you get the idea)
        if (control.keyControls.isStrafeRightDown) {
            control.velocity.strafe += speed/1.3;
            if (control.velocity.strafe > speed/1.3) control.velocity.strafe = speed/1.3;
        }

        if (control.keyControls.isStrafeLeftDown) {
            control.velocity.strafe -= speed/1.3;
            if (control.velocity.strafe < -speed/1.3) control.velocity.strafe = -speed/1.3;
        }

        //  now actually change the orientation based on the velocity
        control.orientation.y+=control.velocity.turn;

        control.render();

	},

	render: function() {


        //  If we are in demo flyover mode then move the camera around.
        if (control.demoMode) {
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
        } else {

            //  turn the camera
            //control.camera.rotateY(control.orientation.y*(Math.PI/180)/1000);
            control.camera.rotateY(control.velocity.turn*(Math.PI/180));
            //  move the camera. Fortunately THREE makes this very easy
            //  with the translates being local to the camera and not the
            //  world in general.
            control.camera.translateX(control.velocity.strafe);
            control.camera.translateY(control.velocity.fly);
            control.camera.translateZ(control.velocity.move);

            //  check the collision detection (HAHAHAHAHA TODO!!!)
            //  We should see if the camera is now "inside" the mesh, if so we
            //  need to somehow move it back out. I can't just move the camera
            //  to the last known good position because that would cause the
            //  camera to stick, when really we want it to slide down the wall.
            //
            //  because we are just dealing with cubes we can cheat a little
            //  by "turning" the camera once it's moved so it's exactly on the
            //  90degree axis "facing" the cube, backing it out of the cube
            //  until it's nolonger in it (and we know the cubes are on a grid
            //  so this is easy), and then "turn" the camera back to the original
            //  orientation



            //  but to start with we'll stop the using going down thru the floor
            if (control.camera.position.y < 160) control.camera.position.y = 160;

        }

        //  Display the co-ords
        $('#status').html('x: ' + parseInt(control.camera.position.x, 10) + ' y:' + parseInt(control.camera.position.y, 10) + ' z: ' + parseInt(control.camera.position.z, 10));

        control.renderer.render( control.scene, control.camera );
        if(control.grabScreenshot == true){
            control.imgData = control.renderer.domElement.toDataURL("image/png");
            control.grabScreenshot = false;
        }
	}

};
