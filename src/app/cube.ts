import { Mesh } from "three";

export class Cube {
    mesh: Mesh;
    mesh2: Mesh;
    cilindre1: Mesh;
    cilindre2: Mesh;
    cilindre3: Mesh;
    size: number;
    dfRotateX: number;
    dfRotateY: number;
    dfRotateZ: number;
    dfTranslateX: number;
    dfTranslateY: number;
    dfTranslateZ: number;
    stopTranslate: boolean;
    stopRotate: boolean;
    changed: boolean;
}