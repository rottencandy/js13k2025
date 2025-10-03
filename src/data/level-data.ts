export const EMPTY = 0
export const STATIC1 = 1
export const STATIC2 = 2
export const STATIC3 = 3
export const STATIC4 = 4
export const WIN = 5
export const LOSE = 6
export const GROW_ITEM = 7
export const SHRINK_ITEM = 8
export const PLAYER_HEAD = 9
export const PLAYER_BODY = 10

const O = EMPTY
const _ = STATIC1
const X = STATIC2
const Y = STATIC3
const __ = STATIC4
const W = WIN
const L = LOSE
const G = GROW_ITEM
const S = SHRINK_ITEM
const P = PLAYER_HEAD
const B = PLAYER_BODY

// prettier-ignore
export const levelsData: number[][][] = [
    [
        [O, O, O, O, O, O, O, O, O, O],
        [O, O, O, O, O, O, O, O, O, O],
        [O, O, O, O, O, G, O, O, O, O],
        [B, B, P, O, O, Y, O, O, W, O],
        [X, Y, Y, X, _,__, X, Y, X, X],
        [__,__,__,__,__,__,__,__,__,__],
        [__,__,__,__,__,__,__,__,__,__],
    ],
    [
        [O, O, O, O, O, O, O, O, O, O],
        [O, O, O, O, G, O, L, O, O, O],
        [O, O, O, O, X, O, O, O, O, O],
        [B, P, O, X, O, O, O, O, O, O],
        [_, Y, Y, __,_, L ,_, O, W, O],
        [__,__,__,__,__,__,__,Y, _, X],
        [__,__,__,__,__,__,__,__,__,__],
    ],
    [
        [O, O, O, O, O],
        [O, O, O, O, O],
        [O, B, O, G, L],
        [O, B, O, X, O],
        [W, P, G, O, O],
        [X, Y, L, X, L],
    ],
    [
        [O, O, O, O, O, O, O, O, O],
        [O, O, X, G, O, O, G, O, O],
        [O, O,__, O, O, O, X, O, O],
        [B, B, P, O, O, O, O, O, W],
        [O, X, Y, Y, O, O, X, O, O],
        [O, O, O,__, L ,O, O, O, O],
        [O, O, O,__, __,X, X, O ,O],
    ],
    [
        [O, O, O, O, O, O, O, O, S, O],
        [O, O, O, O, O, O, O, O, X, O],
        [O, O, O, O, O, O, O, O, W, Y],
        [O, O, O, O, O, O, O, X, O, __],
        [B, B, P, O, O, G, L, O, O, __],
        [X, Y, Y, X, _, X, X, Y, __,__],
    ],
    [
        [O, O, O, O, O, O, O, O, O, O],
        [O, O, O, O, W, O, L, O, O, O],
        [O, O, O, O, X, O, O, O, O, O],
        [B, P, O, O, G, O, Y, O, O, O],
        [_, Y, Y, X, _, L, O, O, L, X],
        [__,__,__,__,__,__,X, Y,__,__],
        [__,__,__,__,__,__,__,__,__,__],
    ],
    [
        [O, O, O, O, O, O, O, O, O, O, O],
        [O, O, O, O, O, O, O, O, O, O, O],
        [O, O, O, O, O, O, O, G, O, O, O],
        [O, O, O, O, O, O, O, _, L, O, O],
        [B, P, W, O, G, G, O, O, O, L, O],
        [X, Y, Y, X, _, X, X, O, G, _, O],
        [__,__,__,__,__,__,__,__,__,__,__],
        [__,__,__,__,__,__,__,__,__,__,__],
    ],
    [
        [O, O, O, O, O, O, O],
        [O, O, O, O, O, O, O],
        [O, O, O, O, G, O, O],
        [O, O, O, L, X, O, O],
        [O, G, O, G, L, O, O],
        [O, X, O, O, O, O, O],
        [B, B, P, O, L, O, O],
        [X, Y, Y, O, O, X, Y],
        [O, O, O, O, W, O, O],
    ],
    [
        [O, O, O, O, O, O, O, O, O],
        [O, O, O, O, O, O, O, O, O],
        [O, O, O, O, O, O, O, O, G],
        [O, O, O, O, O, S, O, O, X],
        [B, B, P, S, O, W, S, X, O],
        [X, Y, Y, X, _, X, X, Y,__],
    ],
]
