<template>
  <div class="edit-box" :style="editBoxStyle" @click.stop="() => {}">
    <div class="top-line" :style="topLine"></div>
    <div class="bottom-line" :style="bottomLine"></div>
    <div class="left-line" :style="leftLine"></div>
    <div class="right-line" :style="rightLine"></div>
    <div
      class="border"
      v-for="item in list"
      :key="item.name"
      :style="item.style"
      draggable="false"
      @click.stop="() => {}"
      @mousedown.stop="mousedown($event, item.name)"
    ></div>
    <div
      class="rotate"
      :style="rotateStyle"
      @click.stop="() => {}"
      @mousedown.stop="mousedown($event, 'rotate')"
    ></div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

interface Item {
  name: string
  style: object
}
export default defineComponent({
  props: {
    value: {
      type: Object,
      default: () => {
        return {
          type: "img",
          style: {
            left: 0,
            top: 0,
            height: 0,
            width: 0
          }
        };
      }
    },
    option: {
      type: Object,
      default: () => {
        return {
          left: 0,
          top: 0,
          scale: 1
        };
      }
    }
  },
  data() {
    return {
      style: { ...this.value.style },
      type: this.value.type,
      moving: false,
      oldStyle: {},
      clientX: 0,
      clientY: 0
    };
  },
  watch: {
    value: {
      handler: function(v) {
        this.style = { ...v.style };
        this.type = v.type;
      },
      deep: true
    }
  },
  computed: {
    editBoxStyle(): {} {
      let transform = this.style.transform;
      if (!transform || transform === "none") {
        transform = "rotate(0deg)";
      }
      let values = transform.split(" ").filter(i => {
        return !/rotate[X|Y]\(/.test(i);
      });
      if (values.length) {
        transform = values.join(" ");
      }
      return {
        left: this.left + "px",
        top: this.top + "px",
        transform,
        transformOrigin: `${this.width / 2}px ${this.height / 2}px`
      };
    },
    top(): number {
      return (
        (+this.style.top.replace("px", "") || 0) * this.option.scale +
        this.option.top
      );
    },
    left(): number {
      return (
        (+this.style.left.replace("px", "") || 0) * this.option.scale +
        this.option.left
      );
    },
    height(): number {
      return (+this.style.height.replace("px", "") || 0) * this.option.scale;
    },
    width() : number {
      return (+this.style.width.replace("px", "") || 0) * this.option.scale;
    },
    topLine() {
      return {
        width: this.width + "px"
      };
    },
    bottomLine() {
      return {
        top: this.height + "px",
        width: this.width + "px"
      };
    },
    leftLine() {
      return {
        height: this.height + "px"
      };
    },
    rightLine(): {} {
      return {
        left: this.width + "px",
        height: this.height + 2 + "px"
      };
    },
    leftBottom(): Item {
      return {
        name: "leftBottom",
        style: {
          left: "-7px",
          top: this.height - 5 + "px",
          cursor: "sw-resize"
        }
      };
    },
    rightBottom(): Item {
      return {
        name: "rightBottom",
        style: {
          left: this.width - 5 + "px",
          top: this.height - 5 + "px",
          cursor: "se-resize"
        }
      };
    },
    topLeft(): Item {
      return {
        name: "topLeft",
        style: {
          left: "-7px",
          top: "-7px",
          cursor: "nw-resize"
        }
      };
    },
    topRight(): Item {
      return {
        name: "topRight",
        style: {
          left: this.width - 5 + "px",
          top: "-7px",
          cursor: "ne-resize"
        }
      };
    },
    leftBorder(): Item {
      return {
        name: "leftBorder",
        style: {
          left: "-6px",
          top: this.height / 2 - 10 + "px",
          width: "8px",
          height: "20px",
          cursor: "w-resize",
          display: this.height > 40 ? "block" : "none"
        }
      };
    },
    rightBorder(): Item {
      return {
        name: "rightBorder",
        style: {
          left: this.width - 4 + "px",
          top: this.height / 2 - 10 + "px",
          height: "20px",
          width: "8px",
          cursor: "e-resize",
          display: this.height > 40 ? "block" : "none"
        }
      };
    },
    topBorder(): Item {
      let display = this.width > 40 ? "block" : "none";
      if (this.type === "text") {
        display = "none";
      }
      return {
        name: "topBorder",
        style: {
          left: this.width / 2 - 10 + "px",
          top: "-6px",
          width: "20px",
          height: "8px",
          cursor: "n-resize",
          display
        }
      };
    },
    bottomBorder(): Item {
      let display = this.width > 40 ? "block" : "none";
      if (this.type === "text") {
        display = "none";
      }
      return {
        name: "bottomBorder",
        style: {
          left: this.width / 2 - 10 + "px",
          top: this.height - 4 + "px",
          width: "20px",
          height: "8px",
          cursor: "s-resize",
          display
        }
      };
    },
    rotateStyle(): {} {
      return {
        left: this.width / 2 - 12 + "px",
        top: this.height + 4 + "px"
      };
    },
    list(): Item[] {
      return [
        this.leftBottom,
        this.rightBottom,
        this.topLeft,
        this.topRight,
        this.leftBorder,
        this.rightBorder,
        this.topBorder,
        this.bottomBorder
      ];
    }
  },
  methods: {
    mousedown(e: MouseEvent, name: string) {
      this.$emit("moveStart", e.clientX, e.clientY, name);
    }
  }
});
</script>

<style lang="scss" scoped>
.edit-box {
  position: absolute;
  user-select: none;
  left: 0;
  top: 0;
  z-index: 1;
  & > div {
    left: -2px;
    top: -2px;
    position: absolute;
  }
  .top-line,
  .bottom-line {
    border-top: 2px dashed #ccc;
  }
  .left-line,
  .right-line {
    border-left: 2px dashed #ccc;
  }
  .border {
    border: 1px solid rgba(0, 87, 255, 0.5);
    border-radius: 10px;
    background: #fff;
    width: 10px;
    height: 10px;
  }
  .rotate {
    background-image: url("./rotate.svg");
    width: 28px;
    height: 28px;
    position: absolute;
    &:hover {
      cursor: grab;
    }
    &:focus {
      outline: none;
    }
  }
}
</style>
