/*
 Copyright (c) 2017-2023 Xiamen Yaji Software Co., Ltd.

 http://www.cocos.com

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

import { JSB } from 'internal:constants';
import { UIRenderer } from '../2d/framework/ui-renderer';
import { warnID } from '../core/platform/debug';
import { UIMeshRenderer } from '../2d';
import type { Node } from './node';
import type { UITransform } from '../2d/framework';
import type { UISkew } from '../2d/framework/ui-skew';

/**
 * @en Node's UI properties abstraction
 * @zh 节点上 UI 相关的属性抽象类
 */
export class NodeUIProperties {
    /**
     * @en The UI transform component
     * @zh UI 变换组件
     */
    get uiTransformComp (): UITransform | null {
        if (!this._uiTransformComp) {
            this._uiTransformComp = this._node.getComponent('cc.UITransform') as UITransform;
        }

        return this._uiTransformComp;
    }
    set uiTransformComp (value: UITransform | null) {
        this._uiTransformComp = value;
    }

    /**
     * @en The base UI component
     * @zh UI 基类组件
     */
    get uiComp (): UIMeshRenderer | UIRenderer | null {
        return this._uiComp;
    }
    set uiComp (comp: UIMeshRenderer | UIRenderer | null) {
        if (this._uiComp && comp) {
            warnID(12002);
            return;
        }
        this._uiComp = comp;
    }

    private _uiComp: UIMeshRenderer | UIRenderer | null = null;

    /**
     * @en The opacity of the UI node for final rendering
     * @zh 最终显示的 UI 透明度，受父节点透明度影响
     */
    private _opacity = 1;
    /**
     * NOTE: engineInternal tag cannot only mark opacity setter as internal.
     * @engineInternal
     * @mangle
     */
    public setOpacity (v: number): void { this._opacity = v; }
    public get opacity (): number {
        if (JSB) {
            this._opacity = (this._node as any)._getFinalOpacity();
        }
        return this._opacity;
    }

    /**
     * @en The opacity of the UI node itself
     * @zh 本节点的 UI 透明度
     */
    private _localOpacity = 1;
    get localOpacity (): number { return this._localOpacity; }
    set localOpacity (val) {
        this._localOpacity = val;
        this.colorDirty = true;
        if (JSB) {
            const node = this._node as any;
            node._colorDirty = true;
            node._setLocalOpacity(val);
        }
    }

    public colorDirty = true;

    /**
     * @en If greater than 0, this node becomes a multi-layers parent and its direct children are the items
     * (e.g. the items of a list). The items are rendered layer by layer instead of one item after another:
     * layer 0 is the item itself, layer `k` (1 ~ `multiLayersNum`) is the `k`-th child (and its subtree) of every item,
     * the last layer also contains all the remaining children of the item.
     * So renderers of the same kind in different items (e.g. backgrounds, icons, labels) are submitted together and
     * can be batched. Neither the items nor their children need any additional setting.
     * Only use it when the items do not overlap each other.
     * Items that enter a mask are still rendered depth-first. When 2D sorting is enabled, the order is decided by the priority.
     * @zh 大于 0 时，该节点成为多层父节点，它的直接子节点是各个子项（例如列表的 item）。
     * 子项不再一个接一个地渲染，而是按层渲染：第 0 层是子项自身，第 `k` 层（1 ~ `multiLayersNum`）是每个子项的
     * 第 `k` 个子节点（及其子树），最后一层还包含该子项剩余的所有子节点。
     * 这样不同子项中同类的渲染组件（如背景、图标、文字）会连续提交，从而可以合批。子项及其子节点都不需要额外设置。
     * 仅在各子项互不重叠时使用。进入 Mask 的子项仍按深度优先渲染。开启 2D 排序时，顺序由 priority 决定。
     */
    get multiLayersNum (): number {
        if (JSB) {
            return (this._node as any)._getMultiLayersNum();
        }
        return this._multiLayersNum;
    }
    set multiLayersNum (val: number) {
        // Stored as Uint8 in the shared memory with native
        val = val > 0 ? Math.min(Math.floor(val), 255) : 0;
        this._multiLayersNum = val;
        if (JSB) {
            (this._node as any)._setMultiLayersNum(val);
        }
    }
    private _multiLayersNum = 0;
    protected _uiTransformComp: UITransform | null = null;
    /**
     * @engineInternal
     * @mangle
     */
    public _uiSkewComp: UISkew | null = null;
    private declare _node: Node;

    constructor (node: Node) {
        this._node = node;
    }

    /**
     * @deprecated since v3.4
     */
    public applyOpacity (effectOpacity: number): void {
        this._opacity = this._localOpacity * effectOpacity;
    }

    /**
     * @en Make the opacity state of node tree is dirty, not effect anymore
     * @zh 为结点树的透明度状态设置脏标签，不再有效果
     * @deprecated since v3.4
     */
    public static markOpacityTree (node, isDirty = true): void {}
}
