// 备忘录撤销重做封装
class Memento {
  constructor(obj, option = {}) {
    this.initState = obj;
    this.state = obj;
    this.size = option.size || 30; // 默认记录个数
    this.recordList = []; // 记录列表
    this.redoRecordList = []; // 被撤销的记录
    this.firstUndo = true;
  }
  _clone(obj) {
    return JSON.parse(JSON.stringify(obj));
  }
  // 备份
  backup() {
    this.firstUndo = true;
    this.recordList.push(this._clone(this.state));
    // 备份后清空撤销列表
    this.redoRecordList = [];
    if (this.recordList.length > this.size) {
      this.recordList.shift();
    }
  }
  // 是否可以撤销
  canUndo() {
    console.log("uuu", this.recordList);
    return !!this.recordList.length;
  }

  // 是否可以重做
  canRedo() {
    return !!this.redoRecordList.length;
  }

  // 撤销
  undo() {
    let recod = this.recordList.pop();
    console.log(this.recordList);
    if (recod) {
      // 将当前状态保存到已撤销列表
      this.redoRecordList.push(this._clone(recod));
      if (this.firstUndo) {
        recod = this.recordList.pop();
        console.log(recod);
        this.firstUndo = false;
      }
      console.log(recod);
      this.state = recod;
      return recod || this.initState;
    }
    return this.state;
  }

  // 重做
  redo() {
    let recod = this.redoRecordList.pop();
    if (recod) {
      this.recordList.push(this._clone(this.state));
      this.state = recod;
      return recod;
    }
    return this.state || this.initState;
  }
}

export default Memento;
