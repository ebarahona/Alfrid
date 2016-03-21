(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

// console.log('alfrid : ', alfrid);

// import glslify from 'glslify';


var cnt = 0;
var GL = alfrid.GL;
var mesh = void 0,
    shader = void 0,
    cameraOrtho = void 0,
    cameraPersp = void 0,
    meshPlane = void 0,
    meshSphere = void 0,
    batchSphere = void 0,
    shaderUV = void 0,
    meshPlane2 = void 0;
var texture = void 0;
var batchCopy = void 0,
    batch = void 0,
    batch2 = void 0;
var fbo = void 0;

var img = new Image();
img.onload = function () {
	if (window.body) {
		_init();
	} else {
		window.addEventListener('load', function () {
			return _init();
		});
	}
};
img.src = './assets/image.jpg';

window.addEventListener('resize', function () {
	return resize();
});

function _init() {
	// alfrid.log();

	var canvas = document.createElement("canvas");
	canvas.className = 'Main-Canvas';
	document.body.appendChild(canvas);

	GL.init(canvas);
	// alfrid.GL.showExtensions();

	//	LOOPING
	alfrid.Scheduler.addEF(loop);

	//	CREATE CAMERA
	cameraOrtho = new alfrid.CameraOrtho();

	cameraPersp = new alfrid.CameraPerspective();
	cameraPersp.setPerspective(45 * Math.PI / 180, GL.aspectRatio, 1, 1000);
	// var eye                = vec3.clone( [0, 0, 5]  );
	// var center             = vec3.create( );
	// var up                 = vec3.clone( [0, 1, 0] );
	// cameraPersp.lookAt(eye, center, up);

	var orbitalControl = new alfrid.OrbitalControl(cameraPersp, window, 15);
	orbitalControl.radius.value = 10;

	GL.setMatrices(cameraPersp);

	//	CREATE TEXTURE
	texture = new alfrid.GLTexture(img);

	//	CREATE SHADER
	shader = new alfrid.GLShader(null, "// basic.frag\n\n#define SHADER_NAME BASIC_FRAGMENT\n\nprecision highp float;\n#define GLSLIFY 1\nvarying vec2 vTextureCoord;\nuniform sampler2D texture;\nuniform float time;\n\nvoid main(void) {\n    gl_FragColor = texture2D(texture, vTextureCoord);\n    // gl_FragColor = vec4(vTextureCoord, sin(time) * .5 + .5, 1.0);\n}");
	shaderUV = new alfrid.GLShader(null, "// basic.frag\n\n#define SHADER_NAME BASIC_FRAGMENT\n\nprecision highp float;\n#define GLSLIFY 1\nvarying vec2 vTextureCoord;\n// uniform sampler2D texture;\nuniform float time;\n\nvoid main(void) {\n    // gl_FragColor = texture2D(texture, vTextureCoord);\n    gl_FragColor = vec4(vTextureCoord, sin(time) * .5 + .5, 1.0);\n}");
	shader.bind();
	shader.uniform("texture", "uniform1i", 0);
	texture.bind(0);

	//	CREATE GEOMETRY
	var positions = [];
	var coords = [];
	var indices = [0, 1, 2, 0, 2, 3, 4, 5, 6, 4, 6, 7];

	var size = 1;
	var xOffset = .5;
	positions.push([-size - xOffset, -size, -0.5]);
	positions.push([size - xOffset, -size, -0.5]);
	positions.push([size - xOffset, size, -0.5]);
	positions.push([-size - xOffset, size, -0.5]);

	coords.push([0, 0]);
	coords.push([1, 0]);
	coords.push([1, 1]);
	coords.push([0, 1]);

	positions.push([-size + xOffset, -size, 0.5]);
	positions.push([size + xOffset, -size, 0.5]);
	positions.push([size + xOffset, size, 0.5]);
	positions.push([-size + xOffset, size, 0.5]);

	coords.push([0, 0]);
	coords.push([1, 0]);
	coords.push([1, 1]);
	coords.push([0, 1]);

	mesh = new alfrid.Mesh();
	mesh.bufferVertex(positions);
	mesh.bufferTexCoords(coords);
	mesh.bufferIndices(indices);

	//	MESH VIA GEOM

	meshPlane = alfrid.Geom.plane(7, 7 * 983 / 736, 12, false, 'xz');
	meshPlane2 = alfrid.Geom.plane(1.5, 1.5 * 983 / 736, 1);
	meshSphere = alfrid.Geom.sphere(1, 48);

	//	BATCH

	batch = new alfrid.Batch(meshPlane, shader);
	batch2 = new alfrid.Batch(meshPlane2, shader);
	batchSphere = new alfrid.Batch(meshSphere, shaderUV);
	batchCopy = new alfrid.BatchCopy();

	//	FRAME BUFFER
	var fboSize = 1024 * 2;
	fbo = new alfrid.FrameBuffer(fboSize, fboSize, {
		minFilter: GL.LINEAR_MIPMAP_LINEAR,
		magFilter: GL.LINEAR
	});
}

function loop() {
	/*
 const max = 60 * 5;
 let gray = 0;
 
 GL.enable(GL.DEPTH_TEST);
 GL.viewport(0, 0, GL.width, GL.height);
 fbo.bind();
 GL.setMatrices(cameraPersp);
 GL.clear(0, 0, 0, 0);
 
 //	WITHOUT BATCH : BIND SHADER THEN DRAW MESH
 	shader.bind();
 GL.draw(mesh);
 
 //	DRAWING USING BATCH
 	batch.draw();
 batch2.draw();
 shader.uniform("time", "float", cnt*.1);
 
 	shaderUV.bind();
 shaderUV.uniform("time", "uniform1f", cnt*.1);
 
 batchSphere.draw();
 fbo.unbind();
 
 GL.setMatrices(cameraOrtho);
 GL.disable(GL.DEPTH_TEST);
 	GL.viewport(0, 0, GL.width, GL.height);
 batchCopy.draw(fbo.getTexture());
 	GL.viewport(0, 0, 200, 200/GL.aspectRatio);
 batchCopy.draw(fbo.getDepthTexture());
 	GL.viewport(200, 0, 100, 100 *983/736);
 batchCopy.draw(texture);
 
 	if(cnt++ > max) {
 	// window.location.href = './';
 }
 	*/
}

function resize() {
	GL.setSize(window.innerWidth, window.innerHeight);
	cameraPersp.setAspectRatio(GL.aspectRatio);
}

},{}]},{},[1]);

//# sourceMappingURL=bundle.js.map
