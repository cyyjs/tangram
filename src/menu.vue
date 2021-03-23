<template>
  <ul v-show="showMenu" class="menu" :style="menuStyle">
    <li @click="moveTop">移至顶层</li>
    <li @click="moveUp">上移一层</li>
    <li @click="moveDown">下移一层</li>
    <li @click="moveBottom">移至底层</li>
  </ul>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import Util from "./lib/util";
interface MenuData {
  showMenu: boolean
  menuLeft: number
  menuTop: number
  active: number
  list: any[]
}

export default defineComponent({
  props: {
    activeIndex: {
      type: [String, Number],
      default: ""
    },
    items: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      showMenu: false,
      menuLeft: 0,
      menuTop: 0,
      active:  this.activeIndex,
      list: Util.cloneDeep(this.items)
    } as MenuData;
  },
  computed: {
    menuStyle(): {left: string, top: string} {
      return {
        left: this.menuLeft + "px",
        top: this.menuTop + "px"
      };
    },
    eleCount() : number {
      return this.items.length;
    }
  },
  watch: {
    items: {
      handler: function(v) {
        this.list = Util.cloneDeep(v);
      },
      deep: true
    },
    activeIndex(v) {
      this.active = v;
    }
  },
  methods: {
    show(left = 0, top = 0) {
      this.menuLeft = left;
      this.menuTop = top;
      this.showMenu = true;
    },
    hide() {
      this.showMenu = false;
    },
    changeZIndex(index1: number, index2:number) {
      [this.list[index1], this.list[index2]] = [
        this.list[index2],
        this.list[index1]
      ];
      this.$emit("update:items", this.list);
    },
    moveTop() {
      this.changeZIndex(this.eleCount - 1, this.active);
      this.showMenu = false;
      this.$emit("update:activeIndex", this.eleCount - 1);
    },
    moveBottom() {
      this.changeZIndex(0, this.active);
      this.showMenu = false;
      this.$emit("update:activeIndex", 0);
    },
    moveUp() {
      if (this.active < this.eleCount - 1) {
        this.changeZIndex(this.active, this.active + 1);
        this.$emit("update:activeIndex", this.active + 1);
      }
      this.showMenu = false;
    },
    moveDown() {
      if (this.active > 0) {
        this.changeZIndex(this.active, this.active - 1);
        this.$emit("update:activeIndex", this.active - 1);
      }
      this.showMenu = false;
    }
  }
});
</script>

<style lang="scss" scoped>
.menu {
  position: absolute;
  z-index: 9999;
  background-color: #fff;
  list-style: none;
  padding: 0;
  border-radius: 5px;
  overflow: hidden;
  margin: 0;
  & > li {
    padding: 5px 15px;
    font-size: 12px;
    cursor: pointer;
    &:hover {
      background-color: #eee;
    }
  }
}
</style>
