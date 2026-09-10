/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

export class CellType {
    x!: number;
    y!: number;
    v1!: string;
    v2!: string;
    cl!: string;
    t!: string;
    rx!: string;
    ry!: string;
}


export class MapType {
    p!: number;
    c: Array<CellType> = [];

}
