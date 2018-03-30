var camera, scene, renderer, controls;

var objects = [];

var raycaster;

var floor;

var blocker,  instructions;

var bullet, alienContainer;

var bulletduration = 0.3; // seconds
var spinduration = 0.3; // seconds

var controlsEnabled = false;

var moveForward = false;
var moveBackward = false;
var moveLeft = false;
var moveRight = false;
var canJump = false;

var prevTime = performance.now();
var velocity, direction;

var floorUrl = "../images/checker_large.gif";
var cubeUrl = "../images/wooden_crate_texture_by_zackseeker-d38ddsb.png";

var mouse = new THREE.Vector2(), INTERSECTED;

// http://www.html5rocks.com/en/tutorials/pointerlock/intro/

// POINTERLOCK lit lo que hace es ocultar el mouse alv
function initPointerLock(){

    // var para guardar el elemento
    var havePointerLock = 'pointerLockElement' in document || 'mozPointerLockElement' in document || 'webkitPointerLockElement' in document;

    // si existe el elemento
    if ( havePointerLock ){
        var element = document.body;

        var pointerlockchange = function ( event ) {

            // checar que el elemento tenga todos los atributos necesarios
            if ( document.pointerLockElement === element || document.mozPointerLockElement === element || document.webkitPointerLockElement === element ) {

                // habilitar controles de webGL
                controlsEnabled = true;
                controls.enabled = true;

                // ocultar
                blocker.style.display = 'none';

            } else {

                controls.enabled = false;

                blocker.style.display = 'block';

                instructions.style.display = '';

            }

        };

        var pointerlockerror = function ( event ) {

            instructions.style.display = '';

        };

        // aquí estamos sobrecargando las funciones de event listeners
        
        // Hook pointer lock state change events
        document.addEventListener( 'pointerlockchange', pointerlockchange, false );
        document.addEventListener( 'mozpointerlockchange', pointerlockchange, false );
        document.addEventListener( 'webkitpointerlockchange', pointerlockchange, false );

        document.addEventListener( 'pointerlockerror', pointerlockerror, false );
        document.addEventListener( 'mozpointerlockerror', pointerlockerror, false );
        document.addEventListener( 'webkitpointerlockerror', pointerlockerror, false );

        instructions.addEventListener( 'click', function ( event ) 
        {
            instructions.style.display = 'none';

            // Ask the browser to lock the pointer
            element.requestPointerLock = element.requestPointerLock || element.mozRequestPointerLock || element.webkitRequestPointerLock;
            element.requestPointerLock();

        }, false );

    } else {

        instructions.innerHTML = 'Your browser doesn\'t seem to support Pointer Lock API';

    }
}

// listener para eventos relacionados a las teclas
function onKeyDown ( event ){
    switch ( event.keyCode ) {

        case 38: // up
        case 87: // w
            moveForward = true;
            break;

        case 37: // left
        case 65: // a
            moveLeft = true;
            break;

        case 40: // down
        case 83: // s
            moveBackward = true;
            break;

        case 39: // right
        case 68: // d
            moveRight = true;
            break;

        case 32: // space
            if ( canJump === true ) velocity.y += 350;
            canJump = false;
            break;

    }

}

function onKeyUp( event ) {

    switch( event.keyCode ) {

        case 38: // up
        case 87: // w
            moveForward = false;
            break;

        case 37: // left
        case 65: // a
            moveLeft = false;
            break;

        case 40: // down
        case 83: // s
            moveBackward = false;
            break;

        case 39: // right
        case 68: // d
            moveRight = false;
            break;

    }
}

// setup inicial
function createScene(canvas){    
    renderer = new THREE.WebGLRenderer( { canvas: canvas, antialias: true } );

    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setSize( window.innerWidth, window.innerHeight );

    window.addEventListener( 'resize', onWindowResize, false );

    velocity = new THREE.Vector3();
    direction = new THREE.Vector3();

    blocker = document.getElementById( 'blocker' );
    instructions = document.getElementById( 'instructions' );
    
    camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 1, 1000 );

    scene = new THREE.Scene();
    scene.background = new THREE.Color( 0xffffff );
    scene.fog = new THREE.Fog( 0xffffff, 0, 550 );

    // A light source positioned directly above the scene, with color fading from the sky color to the ground color. 
    // HemisphereLight( skyColor, groundColor, intensity )
    // skyColor - (optional) hexadecimal color of the sky. Default is 0xffffff.
    // groundColor - (optional) hexadecimal color of the ground. Default is 0xffffff.
    // intensity - (optional) numeric value of the light's strength/intensity. Default is 1.

    var light = new THREE.HemisphereLight( 0xeeeeff, 0x777788, 0.75 );
    light.position.set( 0.5, 1, 0.75 );
    scene.add( light );

    controls = new THREE.PointerLockControls( camera );
    scene.add( controls.getObject() );

    document.addEventListener( 'keydown', onKeyDown, false );
    document.addEventListener( 'keyup', onKeyUp, false );

    // Raycaster( origin, direction, near, far )
    // origin — The origin vector where the ray casts from.
    // direction — The direction vector that gives direction to the ray. Should be normalized.
    // near — All results returned are further away than near. Near can't be negative. Default value is 0.
    // far — All results returned are closer then far. Far can't be lower then near . Default value is Infinity.
    raycaster = new THREE.Raycaster( new THREE.Vector3(), new THREE.Vector3( 0, - 1, 0 ), 0, 10 );

    // floor
    var map = new THREE.TextureLoader().load(floorUrl);
    map.wrapS = map.wrapT = THREE.RepeatWrapping;
    map.repeat.set(8, 8);

    var floorGeometry = new THREE.PlaneGeometry( 2000, 2000, 100, 100 );
    floor = new THREE.Mesh(floorGeometry, new THREE.MeshPhongMaterial({color:0xffffff, map:map, side:THREE.DoubleSide}));
    floor.rotation.x = -Math.PI / 2;
    scene.add( floor );

    // objects

    var boxGeometry = new THREE.BoxGeometry( 20, 20, 20 );
    var cubeMap = new THREE.TextureLoader().load(cubeUrl);

    // Generar las cajas
    for ( var i = 0; i < 500; i ++ ) 
    {
        var boxMaterial = new THREE.MeshPhongMaterial( { specular: 0xffffff, flatShading: true, map:cubeMap } );

        var box = new THREE.Mesh( boxGeometry, boxMaterial );
        box.position.x = Math.floor( Math.random() * 20 - 10 ) * 20;
        box.position.y = Math.floor( Math.random() * 20 ) * 20 + 10;
        box.position.z = Math.floor( Math.random() * 20 - 10 ) * 20;

        scene.add( box );
        objects.push( box );
    }

    // crear bala
    var material = new THREE.MeshBasicMaterial( {color: "red"} );
    var bulletGeometry = new THREE.SphereGeometry(.5, 32, 32);
    bullet = new THREE.Mesh( bulletGeometry, material );

    // crear alien
    var manager = new THREE.LoadingManager();
    var loader = new THREE.OBJLoader(manager);

    alienContainer = new THREE.Mesh(
        new THREE.BoxGeometry(15, 15, 15),
        new THREE.MeshPhongMaterial({
            color: 0xffffff,
            transparent: true,
            opacity: 0.1,
            overdraw: 0.5
        }));
        alienContainer.position.set(0, 10, -60);
        //scene.add(alienContainer);

    loader.load("models/space_invader.obj",
    
        // called when resource is loaded
        function (alien) {

            // Escalar
            alien.scale.set(0.15, 0.15, 0.15);

            alien.position.set(0, -5, 0);

            // Agregarselo al contenedor
            alienContainer.add(alien);
            
            //objects.push(alien);
        },
        
        // called when loading is in progresses
        function ( xhr ) {console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded' );},
        
        // called when loading has errors
        function ( error ) {console.log( 'An error happened' );}
    );
    

    // target del mouse
    bullseyeRaycaster = new THREE.Raycaster();
    
    // Literal a lo que suena, funciones que se mandan llamar cuando suceden ciertos eventos
    document.addEventListener( 'mousemove', onDocumentMouseMove );
    document.addEventListener('mousedown', onDocumentMouseDown);
}

// Cachar evento de movimiento de mouse -> se usa para highlightear las selecciones
function onDocumentMouseMove(event){
    
    // Prevenir que el manejador de eventos utilice el evento default
    event.preventDefault();

    // IMPORTANT: conversión entre sistema de coordenadas de HTML y OpenGL
    mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
    mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;

    // Posicionar camara
    bullseyeRaycaster.setFromCamera( mouse, camera );

    // obtener intersecciones
    var intersects = bullseyeRaycaster.intersectObjects(scene.children);

    console.log(intersects);

    // intersects es un arreglo de objetos

    // checar intersecciones
    if ( intersects.length > 0 ) // hay más de una intersección
    {
        if ( INTERSECTED != intersects[ 0 ].object ) // no hace mucho sentido si lo piensas en la primera vez, pero es para checar que sigas teniendo el actual y no estar recalculando
        {
            // únicamente relevante para el primer caso, antes de que exista la primera intersección
            if ( INTERSECTED ){
                INTERSECTED.material.emissive.setHex( INTERSECTED.currentHex );
            }
            
            // ahora si, settear la intersección
            INTERSECTED = intersects[ 0 ].object;

            // Actualizar el material para que se vea como highlight SIEMPRE Y CUANDO NO SEA EL PISO
            if (INTERSECTED != floor) {
                INTERSECTED.currentHex = INTERSECTED.material.emissive.getHex();
                INTERSECTED.material.emissive.setHex( 0xff0000 );
            }
        }
    } 
    else // sólo hay un elemento intersectado
    { 
        // igual, checar si hay intersección y si no, borrar
        if ( INTERSECTED ){

            // sólo hay una intersección con el raycast
            INTERSECTED.material.emissive.setHex( INTERSECTED.currentHex );
        } else {

            // no hay overlap con nada, quitar hex
            INTERSECTED = null;
        }
    }
}

// Cachar evento de click de mouse
function onDocumentMouseDown(event){

    //console.log("user clicked, cs: " + currentScore + ", ts: " + tempScore);
    
    // Prevenir que el manejador de eventos utilice el evento default
    event.preventDefault();

    // checar si se hizo click sobre un cubo y NO el piso
    if (INTERSECTED != null && INTERSECTED != floor) {

        // si hay un target válido, vamos a disparar
        shootEnemy(INTERSECTED);
        
        // esperar a que la bala viaje (250 ms que dura el disparo)
        setTimeout(function(){ spinObject(INTERSECTED); }, spinduration*1000);

        //borrar enemigo y bala del mapa, esperando a la bala y la animación de spin
        setTimeout(function(){
            scene.remove(bullet);
            scene.remove(INTERSECTED);
        }, (spinduration+bulletduration)*1000);
    }
}

// cachar el evento de resize de la ventana
function onWindowResize() {

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize( window.innerWidth, window.innerHeight );

}

// genera un enemigo en un punto aleatorio del mapa y lo acerca al jugador
function spawnRandomEnemy(){
    // obtener coordenadas del jugador

    // establecer posición del alien a 5 + rand[0-5] espacios del jugador

    // hacerlo acercarse al jugador con duración 5 segundos
}

// setup para la animación de girar un objeto
function spinAnimation(object){
    
    // generar el animador
    animator = new KF.KeyFrameAnimator;

    var radius = 5; // radio del círculo sobre el cual queremos que se mueva el monstruo
    var slices = 360; // cuántas subdivisiones se harán
    var positionsArray = [];
    var rotationArray = [];
    var temp = "";
    var keyArray = []
    var angle = 0;
    
    // Generar valores de círculo
    for (var a = 0; a <= slices; a++) {
        
        // cada posición se calcula basado en el ángulo subsecuente del círculo unitario
        angle = ((2 * Math.PI)/slices) * a;

        // Generar un string con los valores
        temp = "{\"x\":" + Math.cos(angle)*radius + ",\"y\":0,\"z\":" + Math.sin(angle)*radius + '}';
        
        // parsear y meter al arreglo
        positionsArray.push(JSON.parse(temp))
        
        // generar valor de la llave y meterla al arreglo también
        keyArray.push(a/slices);

        // Generar string con el valor
        temp = "{\"y\":" + angle + '}';

        // obtener ángulo de rotación y meterlo al arreglo de ángulos
        rotationArray.push(JSON.parse(temp));
    }

    // z-value de la posición es el que hay que modificar
    var currentPosition = object.position;

    var myValues = []

    myValues.push({x:currentPosition.x, y:currentPosition.y, z:-200});
    myValues.push({x:currentPosition.x, y:currentPosition.y, z:-210});
    myValues.push({x:currentPosition.x, y:currentPosition.y, z:-220});
    myValues.push({x:currentPosition.x, y:currentPosition.y, z:-210});
    myValues.push({x:currentPosition.x, y:currentPosition.y, z:-200});

    animator.init({ 
        interps:
            [
                { 
                    keys:keyArray, 
                    values:rotationArray,
                    target:object.rotation
                },
                // NO FUNCIONA
                { 
                    keys:[0, 0.25, 0.5, 0.75, 1], 
                    values:[1, 0.75, 0.5, 0.25, 0],
                    target:object.size
                },
            ],
        loop: false,
        duration:spinduration * 1000,
        easing:TWEEN.Easing.Linear.None,
    });
}

// setup para la animación de disparar una bala
function shoot(enemy) {
    
    // generar el animador
    animator = new KF.KeyFrameAnimator;

    // REFERENCE: poner el orígen del ray en donde tu estés (el ray apunta hacia abajo)
    //raycaster.ray.origin.copy( controls.getObject().position );

    console.log("PLAYER");
    console.log(controls.getObject().position);

    console.log("ENEMY");
    console.log(enemy.position);

    // auxiliares para la animación de la bala
    var positionsArray = [];
    var keyArray = [0, 1]

    // meter posición actual del jugador
    positionsArray.push({x:controls.getObject().position.x, y:controls.getObject().position.y, z:controls.getObject().position.z});

    // meter posición del enemigo
    positionsArray.push({x:enemy.position.x, y:enemy.position.y, z:enemy.position.z});

    console.log(positionsArray);

    bullet.position.x = controls.getObject().position.x;
    bullet.position.y = controls.getObject().position.y;
    bullet.position.z = controls.getObject().position.z;
    scene.add(bullet);

    animator.init({ 
        interps:
            [
                { 
                    keys:keyArray, 
                    values:positionsArray,
                    target:bullet.position
                }
            ],
        loop: false,
        duration:bulletduration * 1000,
        easing:TWEEN.Easing.Linear.None,
    });
}

// efectúa las animaciones en sí
function playAnimations(){
    animator.start();
}

// proxy para girar el objeto especificado
function spinObject(object){
    spinAnimation(object);
    playAnimations(object);
}

// proxy para disparar una bala
function shootEnemy(enemy) {
    shoot(enemy);
    playAnimations(enemy);
}

function run() {
    requestAnimationFrame( run );

    if ( controlsEnabled === true ){
        
        // poner el orígen del ray en donde tu estés (el ray apunta hacia abajo)
        raycaster.ray.origin.copy( controls.getObject().position );
        
        // ajustar el orígen 
        raycaster.ray.origin.y -= 10;

        var intersections = raycaster.intersectObjects( objects );

        var onObject = intersections.length > 0;

        var time = performance.now();
        var delta = ( time - prevTime ) / 1000;

        velocity.x -= velocity.x * 10.0 * delta;
        velocity.z -= velocity.z * 10.0 * delta;
        velocity.y -= 9.8 * 100.0 * delta; // 100.0 = mass

        // manera horrible de sacar movimiento
        direction.z = Number( moveForward ) - Number( moveBackward );
        direction.x = Number( moveLeft ) - Number( moveRight );
        direction.normalize(); // this ensures consistent movements in all directions

        if ( moveForward || moveBackward ) velocity.z -= direction.z * 400.0 * delta;
        if ( moveLeft || moveRight ) velocity.x -= direction.x * 400.0 * delta;

        if ( onObject === true ) 
        {
            velocity.y = Math.max( 0, velocity.y );
            canJump = true;
        }

        controls.getObject().translateX( velocity.x * delta );
        controls.getObject().translateY( velocity.y * delta );
        controls.getObject().translateZ( velocity.z * delta );

        if ( controls.getObject().position.y < 10 ) {

            velocity.y = 0;
            controls.getObject().position.y = 10;

            canJump = true;

        }

        prevTime = time;

    }

    renderer.render( scene, camera );

    // Actualizar animaciones
    KF.update();
}


