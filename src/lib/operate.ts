/*
 * @Author: cyy
 * @Date: 2021-03-22 20:27:35
 * @LastEditors: cyy
 * @LastEditTime: 2021-03-22 20:27:36
 * @Description: 
 */
import { CSSProperties } from "@vue/runtime-dom";
import Util from "./util";


interface currentItemStyle {
  top: number
  left: number
  width: number
  height: number
  transform: number
}
interface ItemStyle {
  top: string
  left: string
  width: string
  height: string
  transform: string
  opacity: number
  filter: string
}

interface MoveState {
  moving: boolean
  type: string
}
interface TangramOffset {
  left: number
  top: number
}
interface OldEleStyle {
  eleLeft: number
  eleTop: number
  eleWidth: number
  eleHeight: number
  rotate: number
}
interface MouseStartPosition {
  clientX: number
  clientY: number
}
/**
 * 元素操作
 */
class Operate {
  moveState: MoveState
  tangramOffset: TangramOffset 
  oldEleStyle: OldEleStyle 
  mouseStartPosition: MouseStartPosition 
  constructor() {
    // 移动状态
    this.moveState = {
      moving: false,
      type: "move"
    };
    // 画布位置
    this.tangramOffset = {
      left: 0,
      top: 0
    };
    // 操作元素前的样式
    this.oldEleStyle = {
      eleLeft: 0,
      eleTop: 0,
      eleWidth: 0,
      eleHeight: 0,
      rotate: 0
    };
    // 鼠标操作初始位置
    this.mouseStartPosition = {
      clientX: 0,
      clientY: 0
    };
  }

  setMoveStartConfig(currentItemStyle:currentItemStyle, clientX: number, clientY: number, type: string) {
    this.moveState.type = type;
    this.mouseStartPosition.clientX = clientX;
    this.mouseStartPosition.clientY = clientY;
    this.oldEleStyle.eleLeft = currentItemStyle.left;
    this.oldEleStyle.eleTop = currentItemStyle.top;
    this.oldEleStyle.eleWidth = currentItemStyle.width;
    this.oldEleStyle.eleHeight = currentItemStyle.height;
    let rotate = currentItemStyle.transform % 360;
    this.oldEleStyle.rotate = rotate > 0 ? rotate : 360 - rotate;
    this.moveState.moving = true;
  }

  /**
   * 移动拖拽操作
   * @param {Object} style 操作元素样式
   * @param {Number} nclientX 鼠标停止位坐标
   * @param {Number} nclientY 鼠标停止位坐标
   */
  move(style:ItemStyle, nclientX:number, nclientY:number) {
    let { eleLeft, eleTop, eleWidth, eleHeight } = this.oldEleStyle;
    let { clientX, clientY } = this.mouseStartPosition;
    if (this.moveState.type === "move") {
      let left = nclientX - (this.mouseStartPosition.clientX - eleLeft) + "px";
      let top = nclientY - (this.mouseStartPosition.clientY - eleTop) + "px";
      style.left = left;
      style.top = top;
    } else {
      let left = nclientX - clientX;
      let top = nclientY - clientY;
      switch (this.moveState.type) {
        case "rightBorder":
          style.width = eleWidth + left > 5 ? eleWidth + left + "px" : "5px";
          break;
        case "bottomBorder":
          style.height = eleHeight + top > 5 ? eleHeight + top + "px" : "5px";
          break;
        case "leftBorder":
          if (eleWidth - left > 5) {
            style.width = eleWidth - left + "px";
            style.left = eleLeft + left + "px";
          } else {
            this.moveState.moving = false;
          }
          break;
        case "topBorder":
          if (eleHeight - top > 5) {
            style.height = eleHeight - top + "px";
            style.top = eleTop + top + "px";
          } else {
            this.moveState.moving = false;
          }
          break;
        case "topRight":
          if (eleHeight - top > 5 && eleWidth - left > 5) {
            let newWidth = eleWidth + left;
            let newHeight = newWidth * (eleHeight / eleWidth);
            style.width = newWidth + "px";
            style.height = newHeight + "px";
            style.top = eleTop + (eleHeight - newHeight) + "px";
          } else {
            this.moveState.moving = false;
          }
          break;
        case "topLeft":
          if (eleHeight - top > 5 && eleWidth - left > 5) {
            let newWidth = eleWidth - left;
            let newHeight = newWidth * (eleHeight / eleWidth);
            style.width = newWidth + "px";
            style.height = newHeight + "px";
            style.top = eleTop + (eleHeight - newHeight) + "px";
            style.left = eleLeft + (eleWidth - newWidth) + "px";
          } else {
            this.moveState.moving = false;
          }
          break;
        case "leftBottom":
          if (eleHeight - top > 5 && eleWidth - left > 5) {
            let newWidth = eleWidth - left;
            style.width = newWidth + "px";
            style.height = newWidth * (eleHeight / eleWidth) + "px";
            style.left = eleLeft + left + "px";
          } else {
            this.moveState.moving = false;
          }
          break;
        case "rightBottom":
          if (eleHeight - top > 5 && eleWidth - left > 5) {
            let newWidth = eleWidth + left;
            style.width = newWidth + "px";
            style.height = newWidth * (eleHeight / eleWidth) + "px";
          } else {
            this.moveState.moving = false;
          }
          break;
        case "rotate":
          {
            let x1 = eleLeft + eleWidth / 2 + this.tangramOffset.left;
            let y1 = eleTop + eleHeight / 2 + this.tangramOffset.top;
            let x2 = clientX;
            let y2 = clientY;
            let x3 = nclientX;
            let y3 = nclientY;
            let a = Math.abs(Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2));
            let b = Math.abs(Math.sqrt((x3 - x2) ** 2 + (y3 - y2) ** 2));
            let c = Math.abs(Math.sqrt((x3 - x1) ** 2 + (y3 - y1) ** 2));
            let cosB = (a ** 2 + c ** 2 - b ** 2) / (2 * a * c);
            let angleB = Math.round((Math.acos(cosB) * 180) / Math.PI);

            this.setAngleB(style, x3, y3, angleB);
          }
          break;
      }
    }
  }

  /**
   * 计算实际旋转角度，是增加还是减少
   * @param {Object} style 当前操作元素的样式对象
   * @param {Number} startX 鼠标开始x坐标
   * @param {Number} startY 鼠标开始Y坐标
   * @param {Number} endX 鼠标结束X坐标
   * @param {Number} endY 鼠标结束Y坐标
   * @param {Number} angleB 旋转的角度
   */
  setAngleB(style: ItemStyle, endX: number, endY: number, angleB: number,) {
    let { clientX: startX, clientY: startY } = this.mouseStartPosition;
    let { rotate } = this.oldEleStyle; // 初始角度
    if (rotate > 45 && rotate < 135) {
      if (startY > endY) {
        angleB = -angleB;
      }
    } else if (rotate > 135 && rotate < 225) {
      if (startX < endX) {
        angleB = -angleB;
      }
    } else if (rotate > 225 && rotate < 315) {
      if (startY < endY) {
        angleB = -angleB;
      }
    } else {
      if (startX > endX) {
        angleB = -angleB;
      }
    }
    let nRotate = rotate - angleB;
    if (nRotate < 0) {
      nRotate = 360 + nRotate;
    }
    if (nRotate > 360) {
      nRotate = nRotate - 360;
    }
    if (Math.abs(angleB) > 90) {
      this.mouseStartPosition.clientX = endX;
      this.mouseStartPosition.clientY = endY;
      this.oldEleStyle.rotate = nRotate;
      return;
    }
    Util.setTransformStyle(style, "rotate", `${nRotate}deg`);
  }
}
export default new Operate();
