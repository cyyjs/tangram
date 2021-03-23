import { CSSProperties } from "@vue/runtime-dom";
type styleValue = string | number

class Util {
  cloneDeep(obj: object) {
    if (typeof obj !== "object") {
      return obj;
    }
    return JSON.parse(JSON.stringify(obj));
  }
  // 设置有多个值的css属性
  _setMultipleValueStyle(style: any, key:styleValue, type:string, value:styleValue) {
    let oldValue = style[key] || "";
    let values = oldValue.split(" ");
    let v = `${type}(${value})`;
    if (!oldValue || oldValue === "none") {
      style[key] = v;
      return;
    }
    let index = values.findIndex((i:string) => i.startsWith(type));
    if (index >= 0) {
      values.splice(index, 1, v);
    } else {
      values.push(v);
    }
    style[key] = values.join(" ");
  }

  setTransformStyle(style: CSSProperties, type: string, value: styleValue) {
    this._setMultipleValueStyle(style, "transform", type, value);
  }

  // 设置元素水平翻转
  setRotateY(style: CSSProperties) {
    if (!style) {
      return;
    }
    let transform = style.transform || "";
    if (transform.includes("rotateY(180deg)")) {
      this.setTransformStyle(style, "rotateY", "0deg");
    } else {
      this.setTransformStyle(style, "rotateY", "180deg");
    }
  }

  // 设置元素垂直翻转
  setRotateX(style: CSSProperties) {
    if (!style) {
      return;
    }
    let transform = style.transform || "";
    if (transform.includes("rotateX(180deg)")) {
      this.setTransformStyle(style, "rotateX", "0deg");
    } else {
      this.setTransformStyle(style, "rotateX", "180deg");
    }
  }

  // 设置透明度
  setOpacity(style: CSSProperties, v: styleValue) {
    style.opacity = v;
  }

  // 设置亮度
  setBrightness(style: CSSProperties, v: styleValue) {
    this._setMultipleValueStyle(style, "filter", "brightness", v);
  }

  // 设置亮度
  setSaturate(style:CSSProperties , v: styleValue) {
    this._setMultipleValueStyle(style, "filter", "saturate", v);
  }
  // 设置色相旋转0-360
  setHueRotate(style: CSSProperties, v: styleValue) {
    this._setMultipleValueStyle(style, "filter", "hue-rotate", v + "deg");
  }
}

export default new Util();
