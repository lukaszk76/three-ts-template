# three-ts-template
Basic ThreeJS template (TypeScript, Vite)

This project provides a basic component and class for ThreeJS animation in React apps with TypeScript. It is intended to be used rather as a copy/paste source for your project then a selfstanding one.

It renders a simple PlaneGeometry entity with a texture being an image lodaed from external file. It can be easily adjusted to any geometry or material by modification of ```getMaterial``` and ```getGeometry``` methods. It is assumed that a custom shader material is used. Adjust ```vertex.glsl``` or ```fragment.glsl``` to implement desired features of the material. You can also replace the shader material with a built in one (adjust ```getMaterial```).

It also provides an opportunity to use a custom posprocessing with GLSL. Adjust ```CustomShader``` for that.
