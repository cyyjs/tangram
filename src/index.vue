<template>
  <div>
    <div
      class="wap-box"
      :style="{ cursor: moving ? 'move' : 'default' }"
      @mousemove.stop="_mousemove"
      @mouseup.stop="_mouseup"
      @contextmenu.prevent="_contextmenu"
      @click="_clickBox"
    >
      <EditBox
        v-if="active !== undefined"
        v-model="items[active]"
        :option="editBoxOption"
        @moveStart="_moveStart"
        ref="editBox"
      />
      <Menu ref="menu" :activeIndex.sync="active" :items.sync="items" />
      <div class="tangram-box" ref="tangramBox" :style="editBoxStyle">
        <div class="tangram" ref="tangram" :style="tangramStyle">
          <item
            v-for="(item, index) in items"
            :key="index + item.value"
            :index="index"
            :active="active"
            :data="item"
            @init="_initItem($event, index)"
            @change="_changeItem($event, index)"
            @changeActive="_changeActive"
            @moveStart="_moveStart"
          />
        </div>
      </div>
    </div>
  </div>
</template>
<script lang="ts">
import { CSSProperties, defineComponent, PropType } from 'vue';
import Menu from "./menu.vue";
import Item from "./item.vue";
import EditBox from "./editBox.vue";
import operate from "./lib/operate";
import Util from "./lib/util";
import download from "./lib/download";
import Memento from "./lib/memento";

interface Item {
  type: string
  value: string
  style: ItemStyle
}
interface ItemStyle {
  top: string | number
  left: string | number
  width: string | number
  height: string | number
  transform: string | number
  opacity?: number | number
  filter?: string | number
}
interface CanvasStyle {
  width: string
  height: string
  backgroundColor: string
  backgroundImage: string
}

export interface TangramData {
  scale?: number
  canvas: CanvasStyle,
  items: Item[]
}

interface DataInterface {
  memento: object | null
  copyData: object | null,
  scale: number // 画布缩放比
  canvas: CanvasStyle
  items: Item[]
  active?: number,
  moving: boolean,
  editBoxOption: {
    left: number,
    top: number,
    scale: number
  }
}
// 默认样式
const defaultStyle: ItemStyle = {
  top: "0px",
  left: "0px",
  width: "",
  height: "",
  transform: "none",
  opacity: 1,
  filter: "none"
};

const defaultCanvas: CanvasStyle = {
  width: "600px",
  height: "300px",
  backgroundColor: "",
  backgroundImage: ""
};

export default defineComponent({
  name: "Tangram",
  props: {
    data: {
      type: Object as PropType<TangramData>,
      require: true,
      default: () => {
        return {
          canvas: { ...defaultCanvas },
          items: []
        };
      }
    }
  },
  components: {
    Item,
    Menu,
    EditBox
  },
  data() {
    return {
      memento: null,
      copyData: null,
      scale: this.data.scale || 1, // 画布缩放比
      canvas: Util.cloneDeep(this.data.canvas || defaultCanvas),
      items: Util.cloneDeep(this.data.items || []),
      active: undefined,
      moving: false,
      editBoxOption: {
        left: 0,
        top: 0,
        scale: this.data.scale || 1
      }
    } as DataInterface;
  },
  watch: {
    data: {
      handler() {
        this.canvas = Util.cloneDeep(this.data.canvas || defaultCanvas);
        this.items = Util.cloneDeep(this.data.items || []);
      },
      deep: true
    }
  },
  computed: {
    canvasSize(): {width: number, height: number} {
      let width = +this.canvas.width.replace("px", "");
      let height = +this.canvas.height.replace("px", "");
      return {
        width,
        height
      };
    },
    editBoxStyle() {
      let style = {
        position: "relative",
        transform: `scale(${this.scale})`
      } as CSSProperties;
      if (!this.canvas.backgroundColor && !this.canvas.backgroundImage) {
        style.backgroundSize = "20px 20px";
        style.backgroundPosition = "0 0, 10px 10px";
        style.backgroundImage =
          "linear-gradient( 45deg, #ddd 25%, rgba(0, 0, 0, 0) 0, rgba(0, 0, 0, 0) 75%, #ddd 0 ), linear-gradient( 45deg, #ddd 25%, rgba(0, 0, 0, 0) 0, rgba(0, 0, 0, 0) 75%, #ddd 0 )";
      }
      return style;
    },
    tangramStyle() {
      let style = {
        width: "600px",
        height: "300px",
        ...this.canvas
      } as CSSProperties;
      if (style.backgroundImage) {
        style.backgroundRepeat = "no-repeat";
        style.backgroundSize = "contain";
      }
      return style;
    },
    currentItemStyle():ItemStyle  {
      if (!this.items[this.active]) {
        return {
          left: 0,
          top: 0,
          width: 0,
          height: 0,
          transform: "rotate(0deg)"
        };
      }
      let current = this.items[this.active].style;
      let transform = current.transform.match(/\d+/);
      transform = +(transform && transform[0]) || 360;
      return {
        top: +current.top.replace("px", "") || 0,
        left: +current.left.replace("px", "") || 0,
        width: +current.width.replace("px", "") || 0,
        height: +current.height.replace("px", "") || 0,
        transform
      };
    }
  },
  methods: {
    // 画布更改触发
    _change() {
      this.memento.backup();
      this.$emit("change", this.getData());
    },
    _contextmenu(e) {
      if (this.active !== undefined) {
        this.$refs.menu.show(e.clientX, e.clientY);
      }
    },
    _initItem(data:Item, index:number) {
      this.items.splice(index, 1, data);
    },
    _changeItem(data:Item, index:number) {
      this.items.splice(index, 1, data);
      this._change();
    },
    _changeActive(e) {
      this.active = e;
      if (e !== undefined) {
        let item = this.items[e];
        this.$emit("select", item.type, Util.cloneDeep(item));
      }
    },
    _removeActive(e) {
      this.$refs.menu.hide();
      if (e.target.contains(this.$refs.tangram)) {
        this.active = undefined;
      }
    },
    _resize() {
      let { offsetLeft, offsetTop } = this.$refs.tangramBox as HTMLElement;
      let width = +this.canvas.width.replace("px", "");
      let height = +this.canvas.height.replace("px", "");

      let left = offsetLeft - (width * (this.scale - 1)) / 2;
      let top = offsetTop - (height * (this.scale - 1)) / 2;
      operate.tangramOffset.left = left;
      operate.tangramOffset.top = top;
      this.editBoxOption.left = left;
      this.editBoxOption.top = top;
    },
    _moveStart(clientX, clientY, type = "move") {
      operate.setMoveStartConfig(this.currentItemStyle, clientX, clientY, type);
    },
    _mousemove(e) {
      let style = this._getActiveStyle();
      if (!operate.moveState.moving || !style) {
        return;
      }
      //计算移动后的左偏移量和顶部的偏移量
      operate.move(style, e.clientX, e.clientY);
      this.moving = true;
    },
    _mouseup() {
      operate.moveState.moving = false;
      this.moving = false;
      this._change();
    },
    // 获取当前选中的元素样式
    _getActiveStyle() {
      if (this.active === undefined) {
        return null;
      }
      return this.items[this.active].style;
    },
    _clickBox() {
      this.$emit("select", "background", { ...this.canvas });
    },
    // 键盘事件
    _keyDownEvent(e) {
      if (e.keyCode === 8 && this.active !== undefined) {
        // 删除
        this.removeItem();
      } else if (
        this.active !== undefined &&
        e.keyCode == 67 &&
        (e.ctrlKey || e.metaKey)
      ) {
        // 复制
        this.copyData = Util.cloneDeep(this.items[this.active]);
      } else if (this.copyData && e.keyCode == 86 && (e.ctrlKey || e.metaKey)) {
        // 粘贴
        this._copyItem(this.copyData);
        this.copyData = null;
      }
    },
    moveUp() {
      this.$refs.menu.moveUp();
    },
    moveDown() {
      this.$refs.menu.moveDown();
    },
    // 删除元素
    removeItem() {
      if (this.active === undefined) {
        return null;
      }
      this.items.splice(this.active, 1);
      this.active = undefined;
      this._change();
    },
    // 复制处理
    _copyItem(copyData) {
      let left = +copyData.style.left.replace("px", "") + 10 + "px";
      let top = +copyData.style.top.replace("px", "") + 10 + "px";
      copyData.style.left = left;
      copyData.style.top = top;
      this.addItem(copyData);
      this.active = this.items.length - 1;
      this._change();
    },
    // 复制元素
    copyItem() {
      if (this.active === undefined) {
        return null;
      }
      let item = Util.cloneDeep(this.items[this.active]);
      this._copyItem(item);
    },
    // 添加元素
    addItem(data) {
      if (!data) {
        return;
      }
      let newItem = {
        type: data.type,
        value: data.value,
        style: {
          ...defaultStyle,
          ...data.style
        }
      };
      this.items.push(newItem);
      this._change();
    },
    // 设置画布
    setCanvas(config) {
      let canvas = {
        ...this.canvas,
        ...Util.cloneDeep(config)
      };
      if (
        canvas.backgroundImage &&
        !canvas.backgroundImage.startsWith("url(")
      ) {
        canvas.backgroundImage = `url(${canvas.backgroundImage})`;
      }
      this.$set(this, "canvas", canvas);
      this._change();
      this.$nextTick(() => {
        this._resize();
      });
    },
    // 设置画布缩放
    setScale(v: number) {
      this.scale = +v || 1;
      this.editBoxOption.scale = this.scale;
      this._change();
      this.$nextTick(() => {
        this._resize();
      });
    },
    // 水平翻转
    setRotateY() {
      let style = this._getActiveStyle();
      Util.setRotateY(style);
      this._change();
    },
    // 垂直翻转
    setRotateX() {
      let style = this._getActiveStyle();
      Util.setRotateX(style);
      this._change();
    },
    // 设置透明度
    setOpacity(v) {
      let style = this._getActiveStyle();
      Util.setOpacity(style, v);
      this._change();
    },
    // 设置亮度
    setBrightness(v) {
      let style = this._getActiveStyle();
      Util.setBrightness(style, v);
      this._change();
    },
    // 设置饱和度
    setSaturate(v) {
      let style = this._getActiveStyle();
      Util.setSaturate(style, v);
      this._change();
    },
    // 设置色相旋转
    setHueRotate(v) {
      let style = this._getActiveStyle();
      Util.setHueRotate(style, v);
      this._change();
    },
    setStyle(style) {
      if (this.active === undefined) {
        return null;
      }
      let oldStyle = this.items[this.active].style;
      this.items[this.active].style = {
        ...oldStyle,
        ...style
      };
    },
    // 保存图片
    saveImage({ name = "未命名", type = "png", options = {} }) {
      this.getImageSrc({ type, options }).then(src => {
        download.downloadImage(src, { name, type });
      });
    },
    // 获取下载图片的src
    getImageSrc({ type = "png", options = {} }) {
      const ele = this.$refs.tangram;
      return download.convertToImage(ele, options, { name, type });
    },
    // 是否可以撤销
    canUndo() {
      return this.memento.canUndo();
    },
    // 是否可以重做
    canRedo() {
      return this.memento.canRedo();
    },
    // 撤销
    undo() {
      let { canvas, items, scale } = this.memento.undo();
      this.$set(this, "canvas", canvas);
      this.$set(this, "items", items);
      this.$set(this, "scale", scale);
    },
    // 重做
    redo() {
      let { canvas, items, scale } = this.memento.redo();
      this.$set(this, "canvas", canvas);
      this.$set(this, "items", items);
      this.$set(this, "scale", scale);
    },
    // 获取配置数据
    getData() {
      return {
        canvas: this.canvas,
        items: this.items,
        scale: this.scale
      };
    }
  },
  mounted() {
    this.$nextTick(() => {
      this._resize();
    });
    this.memento = new Memento(this.getData()); // 操作历史记录
    // this.memento.backup();
    window.addEventListener("keydown", this._keyDownEvent, false);
    window.addEventListener("resize", this._resize, false);
    document.addEventListener("click", this._removeActive, false);
    this._change();
  },
  destroyed() {
    window.removeEventListener("resize", this._resize);
    window.removeEventListener("keydown", this._keyDownEvent);
    document.removeEventListener("click", this._removeActive);
  }
});
</script>
<style lang="scss" scoped>
.wap-box {
  position: absolute;
  background: #f1f3f7;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
  display: flex;
  justify-content: center;
  align-items: center;
}
.tangram-box {
  box-shadow: rgba(0, 0, 0, 0.2) 1px 1px 15px;
}
.tangram {
  user-select: none;
  width: 600px;
  height: 300px;
  position: relative;
  overflow: hidden;
}
</style>
