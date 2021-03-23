<template>
  <div>
    <div
      :class="{ item: true, active: active === index }"
      ref="item"
      :style="itemStyle"
      @click.stop="() => {}"
      @mousedown.stop="mousedown"
      @dblclick="dblclick"
    >
      <img
        v-if="data?.type === 'img'"
        :src="data.value"
        :style="eleStyle"
        draggable="false"
        @load="loadImg"
        ref="img"
      />
      <div
        class="text"
        :style="eleStyle"
        v-if="data?.type === 'text'"
        draggable="false"
        @blur="blur"
        title="双击修改文本"
        :contenteditable="contenteditable"
      >
        {{ data.value }}
      </div>
    </div>
  </div>
</template>
<script lang="ts">
import { defineComponent, Events, PropType} from 'vue';
interface Item {
  type: string
  value: string
}
export default defineComponent({
  props: {
    index: {
      type: Number
    },
    active: {
      type: Number,
      default: undefined
    },
    data: {
      type: Object as PropType<Item>,
      require: true
    }
  },
  data() {
    return {
      contenteditable: false,
      styleData: {
        transform: '',
        width: 0,
        height: 0
      }
    };
  },
  computed: {
    itemStyle(): object {
      let transform = this.styleData.transform;
      let values = transform.split(" ").filter(i => {
        return !/rotate[X|Y]\(/.test(i);
      });
      if (values.length) {
        transform = values.join(" ");
      } else {
        transform = "none";
      }
      return {
        ...this.styleData,
        transform
      };
    },
    eleStyle(): object {
      let transform = this.styleData.transform;
      let values = transform.split(" ").filter(i => {
        return /rotate[X|Y]\(/.test(i);
      });
      if (values.length) {
        return {
          transform: values.join(" ")
        };
      }
      return {};
    }
  },
  watch: {
    data: {
      handler: function(v) {
        this.styleData = v.style;
      },
      deep: true,
      immediate: true
    }
  },
  mounted() {
    this.$nextTick(() => {
      if (this.data?.type === "text") {
        this.initSize();
      }
    });
  },
  methods: {
    loadImg() {
      this.initSize();
    },
    initSize() {
      let el = this.$refs.item as HTMLElement;
      if (this.$refs.img) {
        el = this.$refs.img as HTMLElement;
      }
      if (!this.styleData.width || !this.styleData.height) {
        let width = el.offsetWidth + "px";
        let height = el.offsetHeight + "px";
        let left = el.offsetLeft - 2 + "px";
        let top = el.offsetTop - 2 + "px";
        this.$emit("init", {
          ...this.data,
          style: {
            ...this.styleData,
            width,
            height,
            left,
            top
          }
        });
      }
    },
    mousedown(e: MouseEvent) {
      if (this.contenteditable) {
        return;
      }
      this.$emit("changeActive", this.index);
      this.$emit("moveStart", e.clientX, e.clientY);
    },
    dblclick(e: MouseEvent ) {
      if (this.data?.type === "text") {
        this.contenteditable = true;
        let selection = window.getSelection() as Selection;
        let range = document.createRange();
        range.selectNodeContents(e.target as Node);
        selection.removeAllRanges();
        selection.addRange(range);
      }
    },
    blur(e: FocusEvent) {
      this.contenteditable = false;
      const target = e.target as HTMLElement
      const value = target.innerText
      this.$emit("change", {
        ...this.data,
        value
      });
    }
  }
});
</script>
<style lang="scss" scoped>
.item {
  transform-origin: center center;
  position: absolute;
  overflow: hidden;
  cursor: pointer;
}
img {
  width: 100%;
  height: 100%;
  display: block;
}
.text {
  width: 100%;
  height: 100%;
  user-select: auto;
  &[contenteditable="true"] {
    cursor: text;
  }
}
</style>
