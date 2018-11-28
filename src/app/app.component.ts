import { AfterViewInit, OnInit, Component, ElementRef, Input, ViewChild, HostListener } from '@angular/core';
import { CubeGeometry, Scene, PointLight, PerspectiveCamera, Vector3, BoxBufferGeometry, MeshBasicMaterial, Mesh, WebGLRenderer, PCFSoftShadowMap, Color, DoubleSide, Vector2, Geometry, Face3, Raycaster, ShaderMaterial, LineSegments, Box3, Ray, BoxGeometry, Matrix4, Matrix3, Line3, Line, AmbientLight, DirectionalLight, PlaneGeometry, LineBasicMaterial, CylinderGeometry, Material, MeshPhongMaterial } from 'three';

declare var THREE;

//import * as ParticleEngine from './js/ParticleEngine';

//declare var ParticleEngine: any;

//declare var Type:any;

// http://squarefeet.github.io/ShaderParticleEngine/
declare var SPE: any;


@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit, AfterViewInit {

    private renderer: THREE.WebGLRenderer;
    private camera: THREE.PerspectiveCamera;
    private scene: THREE.Scene;

    private loaderTextures: THREE.TextureLoader;

    private controls: THREE.OrbitControls;

    private manager: THREE.LoadingManager;

    private clock = new THREE.Clock();

    private light: THREE.DirectionalLight;

    @ViewChild('canvas')
    private canvasRef: ElementRef;

    // parameters ocean
    parameters = {
        oceanSide: 2000,
        size: 1.0,
        distortionScale: 3.7,
        alpha: 1.0,
        sizeRain: 2,
        transparentRain: true,
        sizeAttenuationRain: true,
        opacityRain: 0.6,
        colorRain: 0xffffff

    };

    constructor() {
        this.createManagements();
    }

    private get canvas(): HTMLCanvasElement {
        return this.canvasRef.nativeElement;
    }

    private createManagements() {
        this.render = this.render.bind(this);
        this.animate = this.animate.bind(this);

        this.manager = new THREE.LoadingManager();
        this.manager.onProgress = function ( item, loaded, total ) {
            console.log( item, loaded, total );
        };
        this.loaderTextures = new THREE.TextureLoader( this.manager );
    }

    private createScene() {
        this.scene = new THREE.Scene();
        //this.scene.fog = new THREE.FogExp2( 0xaabbbb, 0.002 );
        //this.scene.add(new THREE.AxisHelper(200));
    }

    private createLights() {
        this.light = new THREE.DirectionalLight( 0xffffff, 0.8 );
        this.light.position.set( - 1000, 1000, 1000 );
        
        this.light.castShadow = true;
        this.light.shadow.camera.visible = true;

        this.light.shadow.camera.top = 200;
        this.light.shadow.camera.right = 200;
        this.light.shadow.camera.left = -200
        this.light.shadow.camera.bottom = -200;

        this.light.shadow.camera.near = 1;
        this.light.shadow.camera.far = 20000;

        this.scene.add( this.light );

        var ambientLight = new THREE.AmbientLight( 0xcccccc, 0.4 );

        this.scene.add( ambientLight );
    }

    private createCamera() {
        this.camera = new THREE.PerspectiveCamera( 55, window.innerWidth/window.innerHeight, 1, 2000000 );
        this.camera.position.set( 30, 30, 100 );
    }

    private createRenderer() {
        this.renderer = new THREE.WebGLRenderer({
            canvas: this.canvas,
            antialias: true
        });
        this.renderer.setPixelRatio( window.devicePixelRatio );
        this.renderer.setSize( window.innerWidth - 2, window.innerHeight - 6 );
        this.renderer.shadowMap.enabled = true;
    }

    private getAspectRatio(): number {
        let height = window.innerHeight;
        if (height === 0) {
            return 0;
        }
        return window.innerWidth/window.innerHeight;
    }

    private getRandomNumber( base ) {
        return Math.abs(Math.random() * base - (base/2));
    }

    /* EVENTS */

    public onMouseMove(event: MouseEvent) {
        console.log("onMouse");
    }


    public onMouseDown(event: MouseEvent) {
        console.log("onMouseDown");
        event.preventDefault();

        // Example of mesh selection/pick:
        var raycaster = new THREE.Raycaster();
        var mouse = new THREE.Vector2();
        mouse.x = (event.clientX / this.renderer.domElement.clientWidth) * 2 - 1;
        mouse.y = - (event.clientY / this.renderer.domElement.clientHeight) * 2 + 1;
        raycaster.setFromCamera(mouse, this.camera);

        var obj: THREE.Object3D[] = [];
        this.findAllObjects(obj, this.scene);
        var intersects = raycaster.intersectObjects(obj);
        console.log("Scene has " + obj.length + " objects");
        console.log(intersects.length + " intersected objects found")
        let trobat = false;
        let parent = this;
        intersects.forEach((i) => {
            console.log(i.object); // do what you want to do with object
            //i.object.position.y = i.object.position.y + 1;                 
        });
    }

    private findAllObjects(pred: THREE.Object3D[], parent: THREE.Object3D) {
        // NOTE: Better to keep separate array of selected objects
        if (parent.children.length > 0) {
            parent.children.forEach((i) => {
                pred.push(i);
                this.findAllObjects(pred, i);                
            });
        }
    }

    public onMouseUp(event: MouseEvent) {
        console.log("onMouseUp");
    }


    @HostListener('window:resize', ['$event'])
    public onResize(event: Event) {

        console.log("onResize: " + (window.innerWidth - 2) + ", "  + (window.innerHeight - 6));

        this.camera.aspect = this.getAspectRatio();
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth - 2, window.innerHeight - 6);
        this.render();
    }

    @HostListener('document:keypress', ['$event'])
    public onKeyPress(event: KeyboardEvent) {
        console.log("onKeyPress: " + event.key);
    }

    ngAfterViewInit() {
        requestAnimationFrame( this.animate );
    }
    
    /* LIFECYCLE */
    ngOnInit() {
        // Create Configuration
        this.createRenderer();
        this.createScene();
        this.createCamera();
        this.createLights();

        // Init Options
        this.initOptionsEvents();
        //this.initOptionsParameters();

        // Create Scene
        this.loadMap();
    }

    onProgress = function ( xhr ) {
        if ( xhr.lengthComputable ) {
            var percentComplete = xhr.loaded / xhr.total * 100;
            console.log( Math.round(percentComplete) + '% downloaded' );
        }
    };
    onError = function ( xhr ) {
        console.log(xhr);
    };

    private initOptionsEvents() {
        this.controls = new THREE.OrbitControls( this.camera, this.renderer.domElement );
        this.controls.maxPolarAngle = Math.PI * 0.495;
        //this.controls.target.set( 0, 0, 0 );
        this.controls.enablePan = true;
        this.controls.minDistance = 40.0;
        this.controls.maxDistance = 200.0;
    }

    private loadMap() {
      let geometry = new BoxGeometry(10, 10, 10, 1, 1, 1);
    
      // Make a material
      var material = new MeshPhongMaterial({
        color: 0x555555,
        specular: 0xffffff,
        shininess: 50,
        flatShading: THREE.SmoothShading
      });

      let mesh = new Mesh(geometry, material);
      
      this.scene.add(mesh);
    }

    animate(time) {
        requestAnimationFrame( this.animate );
        this.render();
    }

    render() {
        //console.log(this.clock.getElapsedTime())

        /*
        if(this.controls.target) {
            console.log(this.controls.target)
            if(this.emitterClouds) {
                this.emitterClouds.position.value.x = this.controls.target.x;
                this.emitterClouds.position.value.z = this.controls.target.z;
                if(!this.emitterSnow.position.value.y) {
                    this.emitterSnow.position.value.y = 0;
                }
                console.log(this.emitterClouds.position);
            }

            if(this.emitterSnow) {
                this.emitterSnow.position.value.x = this.controls.target.x;
                this.emitterSnow.position.value.z = this.controls.target.z;
                if(!this.emitterSnow.position.value.y) {
                    this.emitterSnow.position.value.y = 0;
                }
                console.log(this.emitterSnow.position);
            }
        }
        */
        //console.log(Math.round(this.clock.getElapsedTime()));

        this.renderer.render( this.scene, this.camera );
    }

}