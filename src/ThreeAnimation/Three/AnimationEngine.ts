import * as THREE from "three";
import {
  Clock,
  Mesh,
  Object3D,
  OrthographicCamera,
  PlaneGeometry,
  Raycaster,
  Scene,
  ShaderMaterial,
  WebGLRenderer,
} from "three";
// @ts-ignore
import vertex from "./glsl/vertex.glsl";
// @ts-ignore
import fragment from "./glsl/fragment.glsl";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer";
import { ShaderPass } from "three/examples/jsm/postprocessing/ShaderPass";
import { CustomShader } from "./CustomShader";

interface MouseI {
  x: number;
  y: number;
  prevX: number;
  prevY: number;
  speedX: number;
  speedY: number;
}

export class AnimationEngine {
  private readonly canvas: Element | null;
  private readonly scene: Scene;
  private renderer: WebGLRenderer | undefined;
  private camera: OrthographicCamera | undefined;
  private composer: EffectComposer | undefined;
  private raycaster: Raycaster;
  private mesh: Mesh<PlaneGeometry, ShaderMaterial> | undefined;
  private clock: Clock;
  private geometry: PlaneGeometry | undefined;
  private mouse: MouseI;
  private previouslySelectedObject: Object3D<THREE.Event> | null;
  private imageRatio: number;
  constructor(id: string, textureFile: string, imageRatio: number) {
    this.canvas = document.getElementById(id);
    this.scene = new THREE.Scene();
    this.getRenderer();
    this.getCamera();
    this.getComposer();
    this.raycaster = new THREE.Raycaster();
    this.clock = new THREE.Clock();
    this.previouslySelectedObject = null;
    this.imageRatio = imageRatio;
    this.mouse = {
      x: 0,
      y: 0,
      prevX: 0,
      prevY: 0,
      speedX: 0,
      speedY: 0,
    };
    this.getMesh(textureFile).then(() => {
      if (!this.mesh) {
        throw new Error("mesh is not defined");
      }
      this.scene.add(this.mesh);

      if (!this.camera) {
        throw new Error("camera is not defined");
      }
      this.scene.add(this.camera);

      window.addEventListener("resize", () => {
        this.onResize();
      });

      this.onResize();

      window.addEventListener("mousemove", (e) => {
        this.onMouseMove(e);
      });

      this.animate();
    });
  }

  private getRenderer() {
    if (!this.canvas) {
      throw new Error("canvas is not defined");
    }

    const renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: true,
      alpha: true,
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer = renderer;
  }

  private getCamera() {
    const range = 1;
    const camera = new THREE.OrthographicCamera(
      -range / 2,
      range / 2,
      range / 2,
      -range / 2,
      0.1,
      1000,
    );
    camera.position.x = 0;
    camera.position.y = 0;
    camera.position.z = 3;
    this.camera = camera;
  }

  private getComposer() {
    if (!this.renderer) {
      throw new Error("renderer is not defined");
    }
    if (!this.scene) {
      throw new Error("scene is not defined");
    }
    if (!this.camera) {
      throw new Error("camera is not defined");
    }
    const composer = new EffectComposer(this.renderer);
    composer.addPass(new RenderPass(this.scene, this.camera));

    const customShader = new ShaderPass(CustomShader);
    composer.addPass(customShader);

    this.composer = composer;
  }

  private async getMesh(textureFile: string) {
    if (!this.geometry) {
      this.getGeometry();
    }
    this.mesh = new THREE.Mesh(
      this.geometry,
      await this.getMaterial(textureFile),
    );
  }

  private animate() {
    if (!this.renderer || !this.mesh || !this.composer) return;

    this.mesh.material.uniforms.uTime.value = this.clock.getElapsedTime();
    this.mesh.material.uniforms.needsUpdate = new THREE.Uniform(true);

    this.composer.render();
    window.requestAnimationFrame(this.animate.bind(this));
  }

  private getGeometry() {
    this.geometry = new THREE.PlaneGeometry(1, 1, 1, 1);
  }

  private async getMaterial(textureFile: string) {
    return new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uTexture: { value: await this.getTexture(textureFile) },
        resolution: { value: new THREE.Vector4() },
        progress: { value: 1 },
      },
      vertexShader: vertex,
      fragmentShader: fragment,
    });
  }

  private async getTexture(textureFile: string) {
    return new THREE.TextureLoader().load(textureFile, (texture) => texture);
  }

  private getResolution() {
    const width = window.innerWidth;
    const height = window.innerHeight;
    const screenRatio = width / height;
    let a1;
    let a2;
    if (this.imageRatio < screenRatio) {
      a1 = 1;
      a2 = this.imageRatio / screenRatio;
    } else {
      a1 = screenRatio / this.imageRatio;
      a2 = 1;
    }
    return { x: width, y: height, z: a1, w: a2 };
  }
  private onResize() {
    const resolution = this.getResolution();

    // this.camera.aspect = resolution.x / resolution.y;
    // this.camera.updateProjectionMatrix();

    if (!this.mesh) {
      throw new Error("mesh is not defined");
    }

    this.mesh.material.uniforms.resolution.value = resolution;
    this.mesh.material.uniforms.needsUpdate = new THREE.Uniform(true);

    if (!this.renderer) {
      throw new Error("renderer is not defined");
    }
    this.renderer.setSize(resolution.x, resolution.y);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    if (!this.composer) {
      throw new Error("composer is not defined");
    }
    this.composer.setSize(resolution.x, resolution.y);
  }
  onMouseMove(e: MouseEvent) {
    this.mouse.prevX = this.mouse.x;
    this.mouse.prevY = this.mouse.y;
    this.mouse.x = e.clientX / window.innerWidth;
    this.mouse.y = 1 - e.clientY / window.innerHeight;
    this.mouse.speedX = this.mouse.x - this.mouse.prevX;
    this.mouse.speedY = this.mouse.y - this.mouse.prevY;
  }

  checkIntersection() {
    if (!this.camera) {
      return;
    }

    this.raycaster.setFromCamera(
      new THREE.Vector2(this.mouse.x, this.mouse.y),
      this.camera,
    );

    const intersects = this.raycaster.intersectObject(this.scene, true);

    if (intersects.length > 0) {
      const selectedObject = intersects[0].object;
      if (
        !this.previouslySelectedObject ||
        selectedObject.name !== this.previouslySelectedObject.name
      ) {
        this.previouslySelectedObject = selectedObject;
        console.log(selectedObject);
      }
    } else {
      if (this.previouslySelectedObject) {
        console.log(this.previouslySelectedObject);
        this.previouslySelectedObject = null;
      }
    }
  }
}
