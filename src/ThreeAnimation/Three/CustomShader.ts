// @ts-ignore
import customFragmentShader from "./glsl/customFragment.glsl";
// @ts-ignore
import customVertexShader from "./glsl/customVertex.glsl";
const CustomShader = {
  uniforms: {
    tDiffuse: { value: null },
  },
  vertexShader: customVertexShader,
  fragmentShader: customFragmentShader,
};

export { CustomShader };
