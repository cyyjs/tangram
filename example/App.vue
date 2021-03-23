<template>
  <div class="app">
    <div class="tangram">
      <Tangram
        :data="data"
        ref="tangram"
        @select="select"
        @change="changeTangram"
      />
    </div>
    <div class="tool">
      <button
        :disabled="canUndo"
        @click="
          $refs.tangram.undo();
          changeTangram();
        "
        style="margin-right:10px;"
      >
        撤销
      </button>
      <button
        :disabled="canRedo"
        @click="
          $refs.tangram.redo();
          changeTangram();
        "
      >
        重做
      </button>
      <div class="title">{{ title }}</div>
      <template v-if="currentType === 'background'">
        <div>宽：<input type="text" v-model="data.canvas.width" /></div>
        <div>高：<input type="text" v-model="data.canvas.height" /></div>
        <div>
          背景色：<input type="color" v-model="data.canvas.backgroundColor" />
        </div>
        <div>
          背景图地址：<input
            type="input"
            v-model="data.canvas.backgroundImage"
          />
        </div>
        <div>
          缩放比
          <input
            type="range"
            min="0.05"
            max="2"
            step="0.01"
            v-model="data.scale"
            @change="$refs.tangram.setScale(data.scale)"
          />
          {{ ~~(data.scale * 100) }}%
        </div>
        <button @click="$refs.tangram.setCanvas(data.canvas)">确定</button>
      </template>
      <template v-if="currentType === 'img'">
        <button @click="$refs.tangram.setRotateY()">水平翻转</button>
        <button @click="$refs.tangram.setRotateX()">垂直翻转</button>
        <div>
          透明度
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            v-model="style.opacity"
            @change="$refs.tangram.setOpacity(style.opacity)"
          />
          {{ ~~(style.opacity * 100) }}%
        </div>
        <div>
          亮度
          <input
            type="range"
            min="0"
            max="2"
            step="0.01"
            v-model="style.brightness"
            @change="$refs.tangram.setBrightness(style.brightness)"
          />
          {{ (style.brightness - 1).toFixed(2) }}
        </div>
        <div>
          饱和度
          <input
            type="range"
            min="0"
            max="2"
            step="0.01"
            v-model="style.saturate"
            @change="$refs.tangram.setSaturate(style.saturate)"
          />
          {{ (style.saturate - 1).toFixed(2) }}
        </div>
        <div>
          偏色
          <input
            type="range"
            min="0"
            max="360"
            step="1"
            v-model="style.hueRotate"
            @change="$refs.tangram.setHueRotate(style.hueRotate)"
          />
          {{ style.hueRotate }}
        </div>
      </template>
      <template v-if="currentType === 'text'"> </template>

      <div><button @click="save">生成图片</button></div>
    </div>
  </div>
</template>

<script lang="ts">
import Tangram, { TangramData } from '../src/index.vue';
import { ref, defineComponent } from 'vue'
let style = {
  top: "0px",
  left: "0px",
  width: "",
  height: "",
  transform: "none",
  opacity: 1,
  filter: "none"
};
type currentType = 'background' | 'img' | 'text'

interface DataStyle {
  opacity: number
  brightness: number // 亮度
  saturate: number // 饱和度
  hueRotate: number // 色相旋转
}

interface Data {
  currentType: currentType,
  style: DataStyle,
  data: TangramData,
  canUndo: boolean
  canRedo: boolean
}

export default defineComponent({
  name: "app",
  components: { Tangram },
  data() {
    return {
      currentType: "background",
      style: {
        opacity: 1,
        brightness: 1, // 亮度
        saturate: 1, // 饱和度
        hueRotate: 0 // 色相旋转
      },
      data: {
        scale: 1, // 画布缩放比例
        canvas: {
          width: "600px",
          height: "300px",
          backgroundColor: "",
          backgroundImage: ""
        },
        items: [
          {
            type: "img",
            value: "https://i.alibt.top/img/y.png",
            style: { ...style }
          },
          {
            type: "img",
            value: "https://i.alibt.top/img/m.png",
            style: { ...style }
          },
          {
            type: "text",
            value: "又到了桃花盛开的季节",
            style: { ...style, textAlign: "right" }
          }
        ]
      },
      canUndo: false,
      canRedo: false
    } as Data;
  },
  computed: {
    title(): string {
      return {
        background: "画布",
        img: "元素",
        text: "文本"
      }[this.currentType];
    }
  },
  mounted() {
    this.changeTangram();
  },
  methods: {
    changeTangram() {
      this.canUndo = !this.$refs.tangram.canUndo();
      this.canRedo = !this.$refs.tangram.canRedo();
    },
    select(t:currentType) {
      this.currentType = t;
      // console.log(t, style);
    },
    save() {
      this.$refs.tangram.saveImage("png");
    }
  }
});
</script>

<style lang="scss">
html,
body {
  padding: 0;
  margin: 0;
  height: 100%;
}
#app {
  height: 100%;
}
.app {
  display: flex;
  height: 100%;
  & > .tangram {
    position: relative;
    width: 100%;
  }
  & > .tool {
    background-color: #fff;
    z-index: 1;
    width: 260px;
    padding: 10px;
    font-size: 14px;
    & > .title {
      border-bottom: 1px solid #eee;
      padding-bottom: 10px;
      margin-bottom: 10px;
      font-weight: bold;
      font-size: 16px;
    }
    & > div,
    & > button {
      margin-bottom: 10px;
    }
  }
}
</style>
