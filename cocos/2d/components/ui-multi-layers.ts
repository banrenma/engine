/*
 Copyright (c) 2024 Xiamen Yaji Software Co., Ltd.

 https://www.cocos.com/

 Permission is hereby granted, free of charge, to any person obtaining a copy
 of this software and associated documentation files (the "Software"), to deal
 in the Software without restriction, including without limitation the rights to
 use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies
 of the Software, and to permit persons to whom the Software is furnished to do so,
 subject to the following conditions:

 The above copyright notice and this permission notice shall be included in
 all copies or substantial portions of the Software.

 THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 THE SOFTWARE.
*/

import { ccclass, disallowMultiple, editable, executeInEditMode, executionOrder, menu, serializable, tooltip, type, range } from 'cc.decorator';
import { Component } from '../../scene-graph/component';
import { CCInteger } from '../../core';

/**
 * @en
 * Render the direct children of this node (the items, e.g. the items of a list) layer by layer
 * instead of one item after another:
 * layer 0 is the item itself, layer `k` (1 ~ `layersNum`) is the `k`-th child (and its subtree) of every item,
 * and the last layer also contains all the remaining children of the item.
 * So renderers of the same kind in different items (e.g. backgrounds, icons, labels) are submitted together and can be batched.
 * Neither the items nor their children need any additional setting.
 * Only use it when the items do not overlap each other. Items that enter a mask are still rendered depth-first.
 * When 2D sorting is enabled, the order is decided by the priority.
 *
 * @zh
 * 将该节点的直接子节点（子项，例如列表的 item）按层渲染，而不是一个子项接一个子项地渲染：
 * 第 0 层是子项自身，第 `k` 层（1 ~ `layersNum`）是每个子项的第 `k` 个子节点（及其子树），最后一层还包含该子项剩余的所有子节点。
 * 这样不同子项中同类的渲染组件（如背景、图标、文字）会连续提交，从而可以合批。
 * 子项及其子节点都不需要额外设置。
 * 仅在各子项互不重叠时使用。进入 Mask 的子项仍按深度优先渲染。开启 2D 排序时，顺序由 priority 决定。
 */
@ccclass('cc.UIMultiLayers')
@executionOrder(110)
@menu('UI/UIMultiLayers')
@executeInEditMode
@disallowMultiple
export class UIMultiLayers extends Component {
    /**
     * @en
     * The number of layers. The value is an integer in the range of [1, 255].
     * Layer 1 ~ `layersNum` are the first `layersNum` children of every item, the last layer also takes the remaining children.
     *
     * @zh
     * 层数，取值为 [1, 255] 的整数。
     * 第 1 ~ `layersNum` 层分别是每个子项的前 `layersNum` 个子节点，最后一层还包含剩余的所有子节点。
     */
    @editable
    @type(CCInteger)
    @range([1, 255, 1])
    @tooltip('i18n:UIMultiLayers.layersNum')
    get layersNum (): number {
        return this._layersNum;
    }
    set layersNum (value: number) {
        value = UIMultiLayers._clampLayersNum(value);
        if (this._layersNum === value) {
            return;
        }
        this._layersNum = value;
        if (this.enabledInHierarchy) {
            this._syncLayersNum(value);
        }
    }

    @serializable
    protected _layersNum = 2;

    public onEnable (): void {
        this._syncLayersNum(this._layersNum);
    }

    public onDisable (): void {
        this._syncLayersNum(0);
    }

    private _syncLayersNum (layersNum: number): void {
        this.node._uiProps.multiLayersNum = layersNum;
    }

    private static _clampLayersNum (value: number): number {
        // Stored as Uint8 in the shared memory with native
        return value > 1 ? Math.min(Math.floor(value), 255) : 1;
    }
}
