// Alonso Iturbe Sotomayor
// A01021621
// Tarea 2

var projectionMatrix;

var shaderProgram, shaderVertexPositionAttribute, shaderVertexColorAttribute, 
    shaderProjectionMatrixUniform, shaderModelViewMatrixUniform;

var duration = 5000; // ms

// Attributes: Input variables used in the vertex shader. Since the vertex shader is called on each vertex, these will be different every time the vertex shader is invoked.
// Uniforms: Input variables for both the vertex and fragment shaders. These do not change values from vertex to vertex.
// Varyings: Used for passing data from the vertex shader to the fragment shader. Represent information for which the shader can output different value for each vertex.
var vertexShaderSource =    
    "    attribute vec3 vertexPos;\n" +
    "    attribute vec4 vertexColor;\n" +
    "    uniform mat4 modelViewMatrix;\n" +
    "    uniform mat4 projectionMatrix;\n" +
    "    varying vec4 vColor;\n" +
    "    void main(void) {\n" +
    "		// Return the transformed and projected vertex value\n" +
    "        gl_Position = projectionMatrix * modelViewMatrix * \n" +
    "            vec4(vertexPos, 1.0);\n" +
    "        // Output the vertexColor in vColor\n" +
    "        vColor = vertexColor;\n" +
    "    }\n";

// precision lowp float
// This determines how much precision the GPU uses when calculating floats. The use of highp depends on the system.
// - highp for vertex positions,
// - mediump for texture coordinates,
// - lowp for colors.
var fragmentShaderSource = 
    "    precision lowp float;\n" +
    "    varying vec4 vColor;\n" +
    "    void main(void) {\n" +
    "    // Return the pixel color: always output white\n" +
    "    gl_FragColor = vColor;\n" +
    "}\n";

function initWebGL(canvas)
{
    var gl = null;
    var msg = "Your browser does not support WebGL, " +
        "or it is not enabled by default.";
    try 
    {
        gl = canvas.getContext("experimental-webgl");
    } 
    catch (e)
    {
        msg = "Error creating WebGL Context!: " + e.toString();
    }

    if (!gl)
    {
        alert(msg);
        throw new Error(msg);
    }

    return gl;        
 }

function initViewport(gl, canvas)
{
    gl.viewport(0, 0, canvas.width, canvas.height);
}

function initGL(canvas)
{
    // Create a project matrix with 45 degree field of view
    projectionMatrix = mat4.create();
    mat4.perspective(projectionMatrix, Math.PI / 4, canvas.width / canvas.height, 1, 10000);

    rotationAxis = vec3.create();
    vec3.normalize(rotationAxis, [1, 1, 1]);
    // vec3.normalize(rotationAxis, [1, 0, 0.2]);
}

// Create the vertex, color and index data for a multi-colored cube
function createCube(gl, translation, rotationAxis)
{    
    // Vertex Data
    var vertexBuffer;
    vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);

    var verts = [
       // Front face
       -1.0, -1.0,  1.0,
        1.0, -1.0,  1.0,
        1.0,  1.0,  1.0,
       -1.0,  1.0,  1.0,

       // Back face
       -1.0, -1.0, -1.0,
       -1.0,  1.0, -1.0,
        1.0,  1.0, -1.0,
        1.0, -1.0, -1.0,

       // Top face
       -1.0,  1.0, -1.0,
       -1.0,  1.0,  1.0,
        1.0,  1.0,  1.0,
        1.0,  1.0, -1.0,

       // Bottom face
       -1.0, -1.0, -1.0,
        1.0, -1.0, -1.0,
        1.0, -1.0,  1.0,
       -1.0, -1.0,  1.0,

       // Right face
        1.0, -1.0, -1.0,
        1.0,  1.0, -1.0,
        1.0,  1.0,  1.0,
        1.0, -1.0,  1.0,

       // Left face
       -1.0, -1.0, -1.0,
       -1.0, -1.0,  1.0,
       -1.0,  1.0,  1.0,
       -1.0,  1.0, -1.0
       ];
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(verts), gl.STATIC_DRAW);

    // Color data
    var colorBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
    var faceColors = [
        [1.0, 0.0, 0.0, 1.0], // Front face
        [0.0, 1.0, 0.0, 1.0], // Back face
        [0.0, 0.0, 1.0, 1.0], // Top face
        [1.0, 1.0, 0.0, 1.0], // Bottom face
        [1.0, 0.0, 1.0, 1.0], // Right face
        [0.0, 1.0, 1.0, 1.0]  // Left face
    ];

    // Each vertex must have the color information, that is why the same color is concatenated 4 times, one for each vertex of the cube's face.
    var vertexColors = [];
    for (var i in faceColors) 
    {
        var color = faceColors[i];
        for (var j=0; j < 4; j++)
            vertexColors = vertexColors.concat(faceColors[(j + 0) % 6]);
            //vertexColors = vertexColors.concat(color);
    }

    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexColors), gl.STATIC_DRAW);

    // Index data (defines the triangles to be drawn).
    var cubeIndexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, cubeIndexBuffer);
    var cubeIndices = [
        0, 1, 2,      0, 2, 3,    // Front face
        4, 5, 6,      4, 6, 7,    // Back face
        8, 9, 10,     8, 10, 11,  // Top face
        12, 13, 14,   12, 14, 15, // Bottom face
        16, 17, 18,   16, 18, 19, // Right face
        20, 21, 22,   20, 22, 23  // Left face
    ];

    // gl.ELEMENT_ARRAY_BUFFER: Buffer used for element indices.
    // Uint16Array: Array of 16-bit unsigned integers.
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(cubeIndices), gl.STATIC_DRAW);
    
    var cube = {
            buffer:vertexBuffer, colorBuffer:colorBuffer, indices:cubeIndexBuffer,
            vertSize:3, nVerts:24, colorSize:4, nColors: 24, nIndices:36,
            primtype:gl.TRIANGLES, modelViewMatrix: mat4.create(), currentTime : Date.now()};

    mat4.translate(cube.modelViewMatrix, cube.modelViewMatrix, translation);

    cube.update = function()
    {
        var now = Date.now();
        var deltat = now - this.currentTime;
        this.currentTime = now;
        var fract = deltat / duration;
        var angle = Math.PI * 2 * fract;
    
        // Rotates a mat4 by the given angle
        // mat4 out the receiving matrix
        // mat4 a the matrix to rotate
        // Number rad the angle to rotate the matrix by
        // vec3 axis the axis to rotate around
        mat4.rotate(this.modelViewMatrix, this.modelViewMatrix, angle, rotationAxis);
    };
    
    return cube;
}

// Create the vertex, color and index data for a multi-colored pyramid
function createPyramid(gl, translation, rotationAxis)
{    
    // Vertex Data
    var vertexBuffer;
    vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);

    var verts = [
       // Face 1
       -1.0, -1.0,  0.0,
        1.0, -1.0,  0.0,
        0.0,  0.0,  2.0,

       // Face 2
        1.0, -1.0,  0.0,
        1.0,  1.0,  0.0,
        0.0,  0.0,  2.0,

       // Face 3
        1.0,  1.0,  0.0,
        -1.0, 1.0,  0.0,
        0.0,  0.0,  2.0,

       // Face 4
       -1.0,  1.0,  0.0,
       -1.0, -1.0,  0.0,
        0.0,  0.0,  2.0,

       // Bottom
       -1.0, -1.0,  0.0,
        1.0, -1.0,  0.0,
        1.0,  1.0,  0.0,
		-1.0, 1.0,  0.0
       ];
	
	var vertsCorrected = [
       // Face 1
       0.0, 1.0,  0.0,
      -1.0, -1.0,  1.0,
       1.0,  -1.0,  1.0,

       // Face 2
       0.0, 1.0,  0.0,
       -1.0, -1.0,  -1.0,
       1.0,  -1.0,  -1.0,

       // Face 3
       0.0, 1.0,  0.0,
        -1.0, -1.0,  -1.0,
        -1.0,  -1.0,  1.0,

       // Face 4
       0.0, 1.0,  0.0,
        1.0, -1.0,  -1.0,
        1.0,  -1.0,  1.0,

       // Bottom 1
       1.0, -1.0, 1.0,
       1.0, -1.0, -1.0,
       -1.0, -1.0, -1.0,

	   // Bottom 2
       1.0, -1.0, 1.0,
       -1.0, -1.0, 1.0,
       -1.0, -1.0, -1.0
       ];
	
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertsCorrected), gl.STATIC_DRAW);

    // Color data
    var colorBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
    var faceColors = [
        [1.0, 0.0, 0.0, 1.0], // Face 1 - Red
        [0.0, 1.0, 0.0, 1.0], // Face 2 - Green
        [0.0, 0.0, 1.0, 1.0], // Face 3 - Blue
        [1.0, 1.0, 0.0, 1.0], // Face 4 - Yellow
        [0.0, 1.0, 1.0, 1.0], // Bottom - Cyan
		[0.0, 1.0, 1.0, 1.0]  // Bottom 2.0 - Cyan
    ];

    // Each vertex must have the color information, that is why the same color is concatenated 4 times, one for each vertex of the cube's face.
    var vertexColors = [];
    for (var i in faceColors) 
    {
        var color = faceColors[i];
        for (var j=0; j < 3; j++)
            //vertexColors = vertexColors.concat(faceColors[(j + 0) % 6]);
            vertexColors = vertexColors.concat(color);
    }

    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexColors), gl.STATIC_DRAW);

    // Index data (defines the triangles to be drawn).
    var pyramidIndexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, pyramidIndexBuffer);
    var pyramidIndices = [
        0, 1, 2,    // Cara 1
		3, 4, 5,    // Cara 2
        6, 7, 8,    // Cara 3
		9, 10, 11,  // Cara 4
        12, 13, 14, // Cara 5 (bottom)
		15, 16, 17  // Cara 5 2.0 (bottom)
    ];

    // gl.ELEMENT_ARRAY_BUFFER: Buffer used for element indices.
    // Uint16Array: Array of 16-bit unsigned integers.
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(pyramidIndices), gl.STATIC_DRAW);
    
    var pyramid = {
            buffer:vertexBuffer, colorBuffer:colorBuffer, indices:pyramidIndexBuffer,
            vertSize:3, nVerts:18, colorSize:4, nColors: 18, nIndices:18,
            primtype:gl.TRIANGLES, modelViewMatrix: mat4.create(), currentTime : Date.now()};

    mat4.translate(pyramid.modelViewMatrix, pyramid.modelViewMatrix, translation);

    pyramid.update = function()
    {
        var now = Date.now();
        var deltat = now - this.currentTime;
        this.currentTime = now;
        var fract = deltat / duration;
        var angle = Math.PI * 2 * fract;
    
        // Rotates a mat4 by the given angle
        // mat4 out the receiving matrix
        // mat4 a the matrix to rotate
        // Number rad the angle to rotate the matrix by
        // vec3 axis the axis to rotate around
        mat4.rotate(this.modelViewMatrix, this.modelViewMatrix, angle, rotationAxis);
    };
    
    return pyramid;
}

// Create the vertex, color and index data for a multi-colored rhombus
function createRhombus(gl, translation, rotationAxis)
{    
    // Vertex Data
    var vertexBuffer;
    vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
	
	var verts = [
       // Front face
        0.0, 1.0,  0.0,
       -1.0, 0.0,  1.0,
        1.0,  0.0,  1.0,

        //Front bottom
        0.0, -1.0,  0.0,
       -1.0, 0.0,  1.0,
        1.0,  0.0,  1.0,

       // Top Back face
        0.0, 1.0,  0.0,
       -1.0, 0.0,  -1.0,
        1.0,  0.0,  -1.0,

        // Bottom Back face
        0.0, -1.0,  0.0,
       -1.0, 0.0,  -1.0,
        1.0,  0.0,  -1.0,

       // Top Left face
         0.0, 1.0,  0.0,
        -1.0, 0.0,  -1.0,
        -1.0,  0.0,  1.0,
        
        // Bottom Left face
        0.0, -1.0,  0.0,
       -1.0, 0.0,  -1.0,
       -1.0,  0.0,  1.0,

        // Top right face
        0.0, 1.0,  0.0,
        1.0, 0.0,  -1.0,
        1.0,  0.0,  1.0,

        // Bottom right face
        0.0, -1.0,  0.0,
        1.0, 0.0,  -1.0,
        1.0,  0.0,  1.0,

       ];
	
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(verts), gl.STATIC_DRAW);

    // Color data
    var colorBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
    var faceColors = [
        
		//Pure RGB
		[1.0, 0.0, 0.0, 1.0], // Face 1 - Red
        [0.0, 1.0, 0.0, 1.0], // Face 2 - Green
        [0.0, 0.0, 1.0, 1.0], // Face 3 - Blue
		
		//Secondary colors
        [1.0, 1.0, 0.0, 1.0], // Face 4 - Yellow
        [1.0, 0.0, 1.0, 1.0], // Face 5 - Purple
		[0.0, 1.0, 1.0, 1.0], // Face 6 - Cyan
		[1.0, 1.0, 1.0, 1.0], // Face 7 - White
		
		//Tertiary colors
        [1.0, 0.5, 0.0, 1.0]  // Face 8 - Orange
    ];

    // Each vertex must have the color information, that is why the same color is concatenated 4 times, one for each vertex of the cube's face.
    var vertexColors = [];
    for (var i in faceColors) 
    {
        var color = faceColors[i];
        for (var j=0; j < 3; j++)
            //vertexColors = vertexColors.concat(faceColors[(j + 0) % 6]);
            vertexColors = vertexColors.concat(color);
    }

    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexColors), gl.STATIC_DRAW);

    // Index data (defines the triangles to be drawn).
    var rhombusIndexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, rhombusIndexBuffer);
    var rhombusIndices = [
        0, 1, 2,     // Cara 1
		3, 4, 5,     // Cara 2
        6, 7, 8,     // Cara 3
		9, 10, 11,   // Cara 4
        12, 13, 14,  // Cara 5
		15, 16, 17,  // Cara 6
        18, 19, 20,  // Cara 7
        21, 22, 23   // Cara 8
    ];

    // gl.ELEMENT_ARRAY_BUFFER: Buffer used for element indices.
    // Uint16Array: Array of 16-bit unsigned integers.
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(rhombusIndices), gl.STATIC_DRAW);
    
    var rhombus = {
            buffer:vertexBuffer, colorBuffer:colorBuffer, indices:rhombusIndexBuffer,
            vertSize:3, nVerts:24, colorSize:4, nColors: 24, nIndices:24,
            primtype:gl.TRIANGLES, modelViewMatrix: mat4.create(), currentTime : Date.now()};

    mat4.translate(rhombus.modelViewMatrix, rhombus.modelViewMatrix, translation);

    rhombus.update = function()
    {
        var now = Date.now();
        var deltat = now - this.currentTime;
        this.currentTime = now;
        var fract = deltat / duration;
        var angle = Math.PI * 2 * fract;
    
        // Rotates a mat4 by the given angle
        // mat4 out the receiving matrix
        // mat4 a the matrix to rotate
        // Number rad the angle to rotate the matrix by
        // vec3 axis the axis to rotate around
        mat4.rotate(this.modelViewMatrix, this.modelViewMatrix, angle, rotationAxis);
    };
    
    return rhombus;
}

// Create the vertex, color and index data for a multi-colored icosahedron
function createIcosahedron(gl, translation, rotationAxis)
{    
    // Vertex Data
    var vertexBuffer;
    vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);

	// ICOSAHEDRON COORDINATE SYSTEM
	/*
		(0, ±1, ± φ)
		(±1, ± φ, 0) 
		(± φ, 0, ±1)
    */
	// This gives us a regular icosahedron of edge length 2
	// Resize: multiply times 1/2 to get edge length 1
	
    var phi = 1.618033988749895; // Golden ratio constant
	var resize = 0.5;
	
	
	var verts = [
        resize*-phi, resize*1.0, 0.0,
        resize*-phi, resize*-1.0, 0.0,
        resize*-1.0, 0.0, resize*phi,
        
        resize*-phi, resize*1.0, 0.0,
        resize*-phi, resize*-1.0, 0.0,
        resize*-1.0, 0.0, resize*-phi,
        
        resize*1.0, 0.0, resize*-phi,
        resize*-1.0, 0.0, resize*-phi,
        0.0, resize*-phi, resize*-1.0,
        
        resize*1.0, 0.0, resize*-phi,
        resize*-1.0, 0.0, resize*-phi,
        0.0, resize*phi, resize*-1.0,
        
        0.0, resize*phi, resize*1.0,
        0.0, resize*phi, resize*-1.0,
        resize*phi, resize*1.0, 0.0,
        
        0.0, resize*phi, resize*1.0,
        0.0, resize*phi, resize*-1.0,
        resize*-phi, resize*1.0, 0.0,
        
        0.0, resize*-phi, resize*1.0,
        0.0, resize*-phi, resize*-1.0,
        resize*phi, resize*-1.0, 0.0,
        
        0.0, resize*-phi, resize*1.0,
        0.0, resize*-phi, resize*-1.0,
        resize*-phi, resize*-1.0, 0.0,
        
        resize*-phi, resize*1.0, 0.0,
        resize*-1.0, 0.0, resize*phi,
        0.0, resize*phi, resize*1.0,
        
        resize*phi, resize*1.0, 0.0,
        resize*1.0, 0.0, resize*phi,
        0.0, resize*phi, resize*1.0,
        
        resize*-phi, resize*-1.0, 0.0,
        resize*-1.0, 0.0, resize*phi,
        0.0, resize*-phi, resize*1.0,
        
        resize*phi, resize*-1.0, 0.0,
        resize*1.0, 0.0, resize*phi,
        0.0, resize*-phi, resize*1.0,
        
        resize*-phi, resize*1.0, 0.0,
        resize*-1.0, 0.0, resize*-phi,
        0.0, resize*phi, resize*-1.0,
        
        resize*phi, resize*1.0, 0.0,
        resize*1.0, 0.0, resize*-phi,
        0.0, resize*phi, resize*-1.0,
        
        resize*-phi, resize*-1.0, 0.0,
        resize*-1.0, 0.0, resize*-phi,
        0.0, resize*-phi, resize*-1.0,
        
        resize*phi, resize*-1.0, 0.0,
        resize*1.0, 0.0, resize*-phi,
        0.0, resize*-phi, resize*-1.0,
        
        resize*phi, resize*1.0, 0.0,
        resize*phi, resize*-1.0, 0.0,
        resize*1.0, 0.0, resize*phi,
        
        resize*phi, resize*1.0, 0.0,
        resize*phi, resize*-1.0, 0.0,
        resize*1.0, 0.0, resize*-phi,
        
        resize*1.0, 0.0, resize*phi,
        resize*-1.0, 0.0, resize*phi,
        0.0, resize*-phi, resize*1.0,
        
        resize*1.0, 0.0, resize*phi,
        resize*-1.0, 0.0, resize*phi,
        0.0, resize*phi, resize*1.0
       ];
	
	/*
	//Why don't these vertices work?
	var a = resize;
	var b = resize*phi;
	
	var otherVerts = [
		[0,  b, -a],
		[b,  a,  0],
		[-b,  a,  0],
		[0,  b,  a],
		[0, -b,  a],
		[-a,  0,  b],
		[0, -b, -a],
		[a,  0, -b],
		[a,  0,  b],
		[-a,  0, -b],
		[b, -a,  0],
		[-b, -a,  0]
	];
	*/
	
	
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(verts), gl.STATIC_DRAW);

    // Color data
    var colorBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
	
	//HTML Color spectrum adapted from https://www.w3schools.com/colors/colors_picker.asp
    var faceColors = [
        [255/255, 0, 0, 1.0],
		[255/255, 64/255, 0, 1.0],
		[255/255, 128/255, 0, 1.0],
		[255/255, 191/255, 0, 1.0],
		[255/255, 255/255, 0, 1.0],
		[191/255, 255/255, 0, 1.0],
		[128/255, 255/255, 0, 1.0],
		[64/255, 255/255, 0, 1.0],
		[0, 255/255, 0, 1.0],
		[0, 255/255, 64/255, 1.0],
		[0, 255/255, 128/255, 1.0],
		[0, 255/255, 191/255, 1.0],
		[0, 255/255, 255/255, 1.0],
		[0, 191/255, 255/255, 1.0],
		[0, 128/255, 255/255, 1.0],
		[0, 64/255, 255/255, 1.0],
		[0, 0, 255/255, 1.0],
		[64/255, 0, 255/255, 1.0],
		[128/255, 0, 255/255, 1.0],
		[191/255, 0, 255/255, 1.0],
		[255/255, 0, 255/255, 1.0],
		[255/255, 0, 191/255, 1.0],
		[255/255, 0, 128/255, 1.0],
		[255/255, 0, 64/255, 1.0]
    ];

    // Each vertex must have the color information, that is why the same color is concatenated 4 times, one for each vertex of the cube's face.
    var vertexColors = [];
    for (var i in faceColors) 
    {
        var color = faceColors[i];
        for (var j=0; j < 3; j++)
            //vertexColors = vertexColors.concat(faceColors[(j + 0) % 6]);
            vertexColors = vertexColors.concat(color);
    }

    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexColors), gl.STATIC_DRAW);

    // Index data (defines the triangles to be drawn).
    var icosahedronIndexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, icosahedronIndexBuffer);
	
	
	// icosahedronIndices = [0, 1, 2, ..., 58, 59]
	// Create indices (0-59, in order)
	var icosahedronIndices = [];
	for (var a = 0; a < 60; a++)
		icosahedronIndices = icosahedronIndices.concat(a);
		
	/*
	//Why don't these indices work?
	var otherIndices = [
   0, 1, 2,
   3, 2, 1,
   3, 4, 5,
   3, 8, 4,
   0, 6, 7,
   0, 9, 6,
   4, 10, 11,
   6, 11, 10,
   2, 5, 9,
   11, 9, 5,
   1, 7, 8,
   10, 8, 7,
   3, 5, 2,
   3, 1, 8,
   0, 2, 9,
   0, 7, 1,
   6, 9, 11,
   6, 10, 7,
   4, 11, 5,
   4, 8, 10
	];
	*/

    // gl.ELEMENT_ARRAY_BUFFER: Buffer used for element indices.
    // Uint16Array: Array of 16-bit unsigned integers.
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(icosahedronIndices), gl.STATIC_DRAW);
    
    var icosahedron = {
            buffer:vertexBuffer, colorBuffer:colorBuffer, indices:icosahedronIndexBuffer,
            vertSize:3, nVerts:60, colorSize:4, nColors: 24, nIndices:60,
            primtype:gl.TRIANGLES, modelViewMatrix: mat4.create(), currentTime : Date.now()};

    mat4.translate(icosahedron.modelViewMatrix, icosahedron.modelViewMatrix, translation);

    var goingUp = 0;
	var yaxis = 0;
	
	icosahedron.update = function()
    {
        var now = Date.now();
        var deltat = now - this.currentTime;
        this.currentTime = now;
        var fract = deltat / duration;
        var angle = Math.PI * 2 * fract;
		
		
		// Standard update cases
		if (goingUp === 1){
			yaxis += 0.01;
		}
		if (goingUp === 0) {
			yaxis -= 0.1;
		}
		
		// Check for edges
		if (yaxis > 0.5){ //turn around, start going down
			goingUp = 0;
			yaxis = 0.5;
		}
		if (yaxis < -0.5){ //turn around, start going up
			goingUp = 1;
			yaxis = -0.5;
		}
		
		
		//yaxis = Math.sin(now);
		//console.log(yaxis);
		
		var translationAxis = [0, yaxis, 0];
    
        // Rotates a mat4 by the given angle
        // mat4 out the receiving matrix
        // mat4 a the matrix to rotate
        // Number rad the angle to rotate the matrix by
        // vec3 axis the axis to rotate around
		//mat4.translate(this.modelViewMatrix, this.modelViewMatrix, translationAxis);
        mat4.rotate(this.modelViewMatrix, this.modelViewMatrix, angle, rotationAxis);
    };
    
    return icosahedron;
}

function createShader(gl, str, type)
{
    var shader;
    if (type == "fragment") {
        shader = gl.createShader(gl.FRAGMENT_SHADER);
    } else if (type == "vertex") {
        shader = gl.createShader(gl.VERTEX_SHADER);
    } else {
        return null;
    }

    gl.shaderSource(shader, str);
    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        alert(gl.getShaderInfoLog(shader));
        return null;
    }

    return shader;
}

function initShader(gl)
{
    // load and compile the fragment and vertex shader
    var fragmentShader = createShader(gl, fragmentShaderSource, "fragment");
    var vertexShader = createShader(gl, vertexShaderSource, "vertex");

    // link them together into a new program
    shaderProgram = gl.createProgram();
    gl.attachShader(shaderProgram, vertexShader);
    gl.attachShader(shaderProgram, fragmentShader);
    gl.linkProgram(shaderProgram);

    // get pointers to the shader params
    shaderVertexPositionAttribute = gl.getAttribLocation(shaderProgram, "vertexPos");
    gl.enableVertexAttribArray(shaderVertexPositionAttribute);

    shaderVertexColorAttribute = gl.getAttribLocation(shaderProgram, "vertexColor");
    gl.enableVertexAttribArray(shaderVertexColorAttribute);
    
    shaderProjectionMatrixUniform = gl.getUniformLocation(shaderProgram, "projectionMatrix");
    shaderModelViewMatrixUniform = gl.getUniformLocation(shaderProgram, "modelViewMatrix");

    if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
        alert("Could not initialise shaders");
    }
}

function draw(gl, objs) 
{
    // clear the background (with black)
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.enable(gl.DEPTH_TEST);
    gl.clear(gl.COLOR_BUFFER_BIT  | gl.DEPTH_BUFFER_BIT);

    // set the shader to use
    gl.useProgram(shaderProgram);

    for(i = 0; i<objs.length; i++)
    {
        obj = objs[i];
        // connect up the shader parameters: vertex position, color and projection/model matrices
        // set up the buffers
        gl.bindBuffer(gl.ARRAY_BUFFER, obj.buffer);
        gl.vertexAttribPointer(shaderVertexPositionAttribute, obj.vertSize, gl.FLOAT, false, 0, 0);

        gl.bindBuffer(gl.ARRAY_BUFFER, obj.colorBuffer);
        gl.vertexAttribPointer(shaderVertexColorAttribute, obj.colorSize, gl.FLOAT, false, 0, 0);
        
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, obj.indices);

        gl.uniformMatrix4fv(shaderProjectionMatrixUniform, false, projectionMatrix);
        gl.uniformMatrix4fv(shaderModelViewMatrixUniform, false, obj.modelViewMatrix);

        // Draw the object's primitives using indexed buffer information.
        // void gl.drawElements(mode, count, type, offset);
        // mode: A GLenum specifying the type primitive to render.
        // count: A GLsizei specifying the number of elements to be rendered.
        // type: A GLenum specifying the type of the values in the element array buffer.
        // offset: A GLintptr specifying an offset in the element array buffer.
        gl.drawElements(obj.primtype, obj.nIndices, gl.UNSIGNED_SHORT, 0);
    }
}

function update(obj)
{
    var now = Date.now();
    var deltat = now - obj.currentTime;
    obj.currentTime = now;
    var fract = deltat / duration;
    var angle = Math.PI * 2 * fract;

    // Rotates a mat4 by the given angle
    // mat4 out the receiving matrix
    // mat4 a the matrix to rotate
    // Number rad the angle to rotate the matrix by
    // vec3 axis the axis to rotate around
    mat4.rotate(obj.modelViewMatrix, obj.modelViewMatrix, angle, rotationAxis);
}

function run(gl, objs) 
{
    // The window.requestAnimationFrame() method tells the browser that you wish to perform an animation and requests that the browser call a specified function to update an animation before the next repaint. The method takes a callback as an argument to be invoked before the repaint.
    requestAnimationFrame(function() { run(gl, objs); });
    draw(gl, objs);

    for(i = 0; i<objs.length; i++)
        objs[i].update();
        //update(objs[i]);
}







