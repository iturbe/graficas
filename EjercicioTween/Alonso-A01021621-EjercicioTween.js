// Alonso Iturbe
// A01021621

// Ejercicio - Tween.js

// 1. Enable shadow mapping in the renderer. 
// 2. Enable shadows and set shadow parameters for the lights that cast shadows. 
// Both the THREE.DirectionalLight type and the THREE.SpotLight type support shadows. 
// 3. Indicate which geometry objects cast and receive shadows.

var renderer = null, 
scene = null, 
camera = null,
root = null,
gun = null,
monster = null,
cube = null,
object = null,
group = null,
orbitControls = null;

var animator = null;

var objLoader = null, jsonLoader = null;

var duration = 2; // ms
var currentTime = Date.now();

function loadJson()
{
    if(!jsonLoader)
    jsonLoader = new THREE.JSONLoader();
    
    jsonLoader.load(
        'models/monster/monster.js',

        function(geometry, materials)
        {
            var material = materials[0];
            
            object = new THREE.Mesh(geometry, material);
            object.castShadow = true;
            object. receiveShadow = true;
            object.scale.set(0.002, 0.002, 0.002);
            object.position.set(1, 0, 0);
            // object.position.y = 0;
            // object.position.x = 0;
            // object.position.z = 0;
            monster = object;
            group.add(monster);
            //scene.add(object);
        },
        function ( xhr ) {

            console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded' );
    
        },
        // called when loading has errors
        function ( error ) {
    
            console.log( 'An error happened' );
    
        });
}

function loadObj()
{
    if(!objLoader)
        objLoader = new THREE.OBJLoader();
    
    objLoader.load(
        '../models/cerberus/Cerberus.obj',

        function(object)
        {
            var texture = new THREE.TextureLoader().load('../models/cerberus/Cerberus_A.jpg');
            var normalMap = new THREE.TextureLoader().load('../models/cerberus/Cerberus_N.jpg');
            var specularMap = new THREE.TextureLoader().load('../models/cerberus/Cerberus_M.jpg');

            object.traverse( function ( child ) 
            {
                if ( child instanceof THREE.Mesh ) 
                {
                    child.castShadow = true;
                    child.receiveShadow = true;
                    child.material.map = texture;
                    child.material.normalMap = normalMap;
                    child.material.specularMap = specularMap;
                }
            } );
                    
            gun = object;
            gun.scale.set(3,3,3);
            gun.position.z = -3;
            gun.position.x = -1.5;
            gun.rotation.x = Math.PI / 180 * 15;
            gun.rotation.y = -3;
            scene.add(object);
        },
        function ( xhr ) {

            console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded' );
    
        },
        // called when loading has errors
        function ( error ) {
    
            console.log( 'An error happened' );
    
        });
}

function animate() {

    var now = Date.now();
    var deltat = now - currentTime;
    currentTime = now;
    var fract = deltat / duration;
    var angle = Math.PI * 2 * fract;

    cube.rotation.y += angle / 2;

    
    if(gun)
        gun.rotation.y += angle / 2;

    if(object)
        object.rotation.y += angle / 2;
}

function run() {
    requestAnimationFrame(function() { run(); });
    
        // Render the scene
        renderer.render( scene, camera );

        // Spin the cube for next frame
        //animate();

        // Update animations
        KF.update();

        // Update the camera controller
        orbitControls.update();
}

function setLightColor(light, r, g, b)
{
    r /= 255;
    g /= 255;
    b /= 255;
    
    light.color.setRGB(r, g, b);
}

var directionalLight = null;
var spotLight = null;
var ambientLight = null;
var mapUrl = "images/checker_large.gif";

var SHADOW_MAP_WIDTH = 2048, SHADOW_MAP_HEIGHT = 2048;

function createScene(canvas) {
    
    // Create the Three.js renderer and attach it to our canvas
    renderer = new THREE.WebGLRenderer( { canvas: canvas, antialias: true } );

    // Set the viewport size
    renderer.setSize(canvas.width, canvas.height);

    // Turn on shadows
    renderer.shadowMap.enabled = true;
    // Options are THREE.BasicShadowMap, THREE.PCFShadowMap, PCFSoftShadowMap
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    
    // Create a new Three.js scene
    scene = new THREE.Scene();

    // Add  a camera so we can view the scene
    camera = new THREE.PerspectiveCamera( 45, canvas.width / canvas.height, 1, 4000 );
    camera.position.set(-2, 6, 12);
    scene.add(camera);
    
    // Create a group to hold all the objects
    root = new THREE.Object3D;
    
    // Add a directional light to show off the object
    directionalLight = new THREE.DirectionalLight( 0xffffff, 1);

    // Create and add all the lights
    directionalLight.position.set(.5, 0, 3);
    root.add(directionalLight);

    spotLight = new THREE.SpotLight (0xffffff);
    spotLight.position.set(2, 8, 15);
    spotLight.target.position.set(-2, 0, -2);
    root.add(spotLight);

    spotLight.castShadow = true;

    spotLight.shadow.camera.near = 1;
    spotLight.shadow. camera.far = 200;
    spotLight.shadow.camera.fov = 45;
    
    spotLight.shadow.mapSize.width = SHADOW_MAP_WIDTH;
    spotLight.shadow.mapSize.height = SHADOW_MAP_HEIGHT;

    ambientLight = new THREE.AmbientLight ( 0x888888 );
    root.add(ambientLight);

    // Create a group to hold the objects
    group = new THREE.Object3D;
    root.add(group);

    // Create the objects
    //loadObj();

    loadJson(); // Esta función carga al monstruo

    console.log(object);

    // Create a texture map
    var map = new THREE.TextureLoader().load(mapUrl);
    map.wrapS = map.wrapT = THREE.RepeatWrapping;
    map.repeat.set(8, 8);

    var color = 0xffffff;

    // Generar el piso de tipo ajedrez
    planeGeometry = new THREE.PlaneGeometry(200, 200, 50, 50);
    var checkeredPlane = new THREE.Mesh(planeGeometry, new THREE.MeshPhongMaterial({color:color, map:map, side:THREE.DoubleSide}));
    checkeredPlane.rotation.x = -Math.PI / 2;
    checkeredPlane.position.y = 0;
    checkeredPlane.castShadow = false;
    checkeredPlane.receiveShadow = true;
    
    // Agregar al grupo
    group.add( checkeredPlane );
    
    // Generar el cubo
    cubeGeometry = new THREE.CubeGeometry(2, 2, 2);
    cube = new THREE.Mesh(cubeGeometry, new THREE.MeshPhongMaterial({color:color}));
    cube.position.y = 3;
    cube.castShadow = true;
    cube.receiveShadow = false;

    // Agregar al grupo
    //group.add( cube );

    // Create the cylinder geometry
    cylGeometry = new THREE.CylinderGeometry(1, 2, 2, 50, 10);
    cylinder = new THREE.Mesh(cylGeometry, new THREE.MeshPhongMaterial({color:color}));
    cylinder.position.y = -3;
    cylinder.castShadow = true;
    cylinder.receiveShadow = false;

    // Agregar al grupo
    //group.add(cylinder);
    
    // Agregar todo el grupo a la escena
    scene.add( root );
    
    console.log(object);
}

function initAnimations(){
    console.log(cube);
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

    animator.init({ 
        interps:
            [
                { 
                    keys:keyArray,
                    values:positionsArray,
                    target:monster.position
                },
                { 
                    keys:keyArray, 
                    values:rotationArray,
                    target:monster.rotation
                },
            ],
        loop: true,
        duration:duration * 1000,
        easing:TWEEN.Easing.Linear.None,
    });
}

function playAnimations()
{
    console.log(cube);
    animator.start();
}