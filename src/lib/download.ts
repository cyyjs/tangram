import html2canvas from "html2canvas";
import Canvas2Image from "./canvas2image";

class Download {
  // 创建用于绘制的基础canvas画布
  createBaseCanvas(width:number, height:number, scale:number) {
    const canvas = document.createElement("canvas");
    canvas.width = width * scale;
    canvas.height = height * scale;
    canvas.style.width = width + "px";
    canvas.style.height = height + "px";
    // canvas.getContext("2d").scale(scale, scale);
    const context = canvas.getContext("2d");

    // 关闭抗锯齿
    if (context) {
      context.imageSmoothingEnabled = false
    }
    return canvas;
  }

  convertToImage(container: HTMLElement, options = {}, { type }: {type:string}) {
    type = type.toLocaleLowerCase();
    if (type === "jpeg") {
      type = "jpg";
    }
    if (!["png", "jpg"].includes(type)) {
      throw Error("Export picture type only supports png or jpg");
    }
    // 设置放大倍数
    const scale = window.devicePixelRatio;

    // 传入节点原始宽高
    const width = container.offsetWidth;
    const height = container.offsetHeight;

    // 创建用于绘制的基础canvas画布
    const canvas = this.createBaseCanvas(width, height, scale);

    // html2canvas配置项
    const ops = {
      width: width,
      height: height,
      scrollX: 0,
      scrollY: 0,
      canvas,
      // scale: 4,
      useCORS: true,
      allowTaint: false,
      ...options
    };

    return html2canvas(container, ops).then(canvas => {
      const imageEl = Canvas2Image.convertToImage(
        canvas,
        canvas.width / scale,
        canvas.height / scale,
        type
      );
      return imageEl?.src;
    });
  }

  downloadImage(src:string, { name, type }: {name: string, type: string}) {
    const alink = document.createElement("a");
    alink.href = src;
    alink.download = `${name}.${type}`;
    alink.click();
  }
}

export default new Download();
