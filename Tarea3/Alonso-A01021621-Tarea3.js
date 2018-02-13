var renderer = null, 
scene = null, 
camera = null,
sceneGroup = null,
cube = null,
sphereGroup = null,
sphere = null,
cone = null;


var duration = 5000; // ms
var currentTime = Date.now();

var planetGroup, bluePlanet, moon;
var bluePlanetOrbit;

// Aquí se encuentran definidas las orbitas de las lunas del planeta azul
function animate(){
    var now = Date.now();
    var deltat = now - currentTime;
    currentTime = now;
    var fract = deltat / duration;
    var angle = Math.PI * 2 * fract;
    var movement = now * 0.001;

    // Rotate the cube about its Y axis
    cube.rotation.y += angle;

    // Rotate the sphere group about its Y axis
    sphereGroup.rotation.y -= angle / 2;
    sphere.rotation.x += angle;

    // Rotate the cone about its X axis (tumble forward)
    cone.rotation.z += angle;

    // Lunas del planeta azul
    bluePlanet.rotation.y += angle * 0.1;
    bluePlanetOrbit.rotation.y += angle;
    moon.rotation.y += angle;
}

function run() {
    requestAnimationFrame(function() { run(); });
    
        // Render the scene
        renderer.render( scene, camera );

        // Spin the cube for next frame
        animate();
            
}

// Esta funcion genera el planeta azul de la derecha y sus lunas
function createPlanet(){
    // Cargar UV Colors texture (una manera de cargar textura)
    var mapUrl = "images/ash_uvgrid01.jpg";
    var textureMap = new THREE.TextureLoader().load(mapUrl);
    var UVMaterial = new THREE.MeshPhongMaterial({ map: textureMap });

    // Companion Cube texture (Otra manera de cargar textura)
    var companionCubeTexture = new THREE.MeshPhongMaterial({map: new THREE.TextureLoader().load("images/companionCube.png")});

    // Cargar turquoise texture
    var turquoiseTexture = new THREE.MeshPhongMaterial({map: new THREE.TextureLoader().load("images/turquoise-texture.jpg")});

    // Cargar test texture
    var testTexture = new THREE.MeshPhongMaterial({map: new THREE.TextureLoader().load("images/test1.png")});

    // Contenedor de planetas de la derecha
    planetGroup = new THREE.Object3D();
    planetGroup.position.set(3,0,0);
    scene.add(planetGroup);

    // Esfera con luna
    //Los atributos de SphereGeometry son scale, (algo que ver con ser esfera), (algo que ver con ser esfera)
    bluePlanet = new THREE.Mesh(new THREE.SphereGeometry(1, 20, 20), turquoiseTexture);
    bluePlanetOrbit = new THREE.Group();

    // Luna de esfera
    moon = new THREE.Mesh(new THREE.SphereGeometry(0.4, 20, 20), companionCubeTexture);
    moon.position.set(1.5, 0, 0);

    // no está en el scene
    planet_3 = new THREE.Mesh(new THREE.SphereGeometry(0.4, 20, 20), testTexture);
    planet_3.position.set(-3, 0, 0);

    // Agregar el planeta al grupo
    planetGroup.add(bluePlanet);

    // Asignar orbita de lunas al planeta
    bluePlanet.add(bluePlanetOrbit);

    // Asignar lunas a la órbita
    bluePlanetOrbit.add(moon);
    bluePlanetOrbit.add(planet_3);
}

// Esta función genera el grupo de figuras de la izquierda
function createScene(canvas){    
    // Create the Three.js renderer and attach it to our canvas
    renderer = new THREE.WebGLRenderer( { canvas: canvas, antialias: true } );

    // Set the viewport size
    renderer.setSize(canvas.width, canvas.height);
    
    // Create a new Three.js scene
    scene = new THREE.Scene();

    createPlanet();

    // Set the background color 
    scene.background = new THREE.Color( 0.2, 0.2, 0.2 );
    scene.background = new THREE.Color( "rgb(100, 100, 100)" );

    // Add  a camera so we can view the scene
    camera = new THREE.PerspectiveCamera( 45, canvas.width / canvas.height, 1, 4000 );
    camera.position.z = 10;
    scene.add(camera);

    // Create a group to hold all the objects
    sceneGroup = new THREE.Object3D;
    
    // Add a directional light to show off the objects
    var light = new THREE.DirectionalLight( 0xffffff, 1.5);
    //var light = new THREE.DirectionalLight( "rgb(255, 255, 100)", 1.5);

    // Position the light out from the scene, pointing at the origin
    light.position.set(-.5, .2, 1);
    light.target.position.set(0,-2,0);
    sceneGroup.add(light);

    // Create a textre phong material for the cube
    // First, create the texture map
    var mapUrl = "images/turquoise-texture.jpg";
    var mapUrl = "images/ash_uvgrid01.jpg";
    var textureMap = new THREE.TextureLoader().load(mapUrl);
    var material = new THREE.MeshPhongMaterial({ map: textureMap });

    // Create the cube geometry
    var geometry = new THREE.CubeGeometry(2, 2, 2);

    // And put the geometry and material together into a mesh
    cube = new THREE.Mesh(geometry, material);

    // Tilt the mesh toward the viewer
    cube.rotation.x = Math.PI / 5;
    cube.rotation.y = Math.PI / 5;

    // Add the cube mesh to our group
    sceneGroup.add( cube );
    sceneGroup.position.set(-2.5, 0 ,0);

    // Create a group for the sphere
    sphereGroup = new THREE.Object3D;
    sceneGroup.add(sphereGroup);
    
    // Move the sphere group up and back from the cube
    sphereGroup.position.set(0, 3, -4);

    // Create the sphere geometry
    geometry = new THREE.SphereGeometry(1, 20, 20);
    
    // And put the geometry and material together into a mesh
    sphere = new THREE.Mesh(geometry, material);

    // Add the sphere mesh to our group
    sphereGroup.add( sphere );

    // Create the cone geometry
    geometry = new THREE.CylinderGeometry(0, .333, .444, 20, 5);

    // And put the geometry and material together into a mesh
    cone = new THREE.Mesh(geometry, material);

    // Move the cone up and out from the sphere
    cone.position.set(1, 1, -.667);
        
    // Add the cone mesh to our group
    sphereGroup.add( cone );
    
    // Agregar el grupo de planetas de la derecha al sceneGroup para que también se vea afectado por los mouse/scale shifts
    planetGroup.position.set(5, 0, 0);
    sceneGroup.add(planetGroup);

    // Now add the group to our scene
    scene.add( sceneGroup );
}

// Esta función quiero pensar que es el callback de cuando se rota la escena en x
function rotateScene(deltax){
    sceneGroup.rotation.y += deltax / 100;
    $("#rotation").html("rotation:" + sceneGroup.rotation.x.toFixed(2) + "," + sceneGroup.rotation.y.toFixed(2) + ",0");
}

// Esta función la escribí yo basándome en la función de arriba
function rotateSceneY(deltay){
    sceneGroup.rotation.x += deltay / 100;
    $("#rotation").html("rotation:" + sceneGroup.rotation.x.toFixed(2) + "," + sceneGroup.rotation.y.toFixed(2) + ",0");
}

// Esta función quiero pensar que es el callback de cuando se escala la escena
function scaleScene(scale){
    sceneGroup.scale.set(scale, scale, scale);
    $("#scale").html("scale: " + scale);
}