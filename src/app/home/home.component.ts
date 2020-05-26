import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, FormControl } from '@angular/forms';

export enum ObjType {
  MODELSTR = 'MODELSTR',
  FIELDSSTR = 'FIELDSSTR',
}
@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit {
  form: FormGroup;
  outputData = {};

  isObj = false;
  isArr = false;
  appendStr = '';
  appendStrFieldsStr = '';
  tempColl: string[] = [];

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.outputData[ObjType.MODELSTR] = '';
    this.outputData[ObjType.FIELDSSTR] = '';

    this.form = this.fb.group({
      inputJSON: new FormControl(''),
      MODELSTR: new FormControl(''),
      FIELDSSTR: new FormControl(''),
      appendStr: new FormControl(''),
      appendStrFields: new FormControl(''),
    });
  }

  clearInput() {
    this.form.get('inputJSON').reset();
  }

  processInput() {
    this.generateData(ObjType.MODELSTR);
    this.generateData(ObjType.FIELDSSTR);
  }

  generateData(type: ObjType) {
    this.tempColl = [];
    this.outputData[type] = '';
    let inputStr = this.form.get('inputJSON').value;
    this.appendStr = this.form.get('appendStr').value;
    this.appendStrFieldsStr = this.form.get('appendStrFields').value;

    try {
      let inputJSON = JSON.parse(inputStr);
      let obj = Object.entries(inputJSON);
      obj.forEach(([prop, val]) => {
        this.checkValType(prop, val, this.outputData, type);
      });
      this.form.get(type).setValue('Processing');
    } catch (ex) {
      console.log(ex);
      this.form.get(type).setValue('Invlid Input JSON');
    }
    this.outputData[type] = this.outputData[type].replace(/\[{}\]/g, '[]');
    this.form.get(type).setValue(this.outputData[type]);
  }

  checkValType(
    key: any,
    val: any,
    objData: Object,
    type: ObjType,
    partOfObj = false
  ) {
    let isArr = val instanceof Array;
    let isObj = val instanceof Object;
    // console.log('###', ind);
    if (isArr) {
      this.tempColl = [];
      partOfObj = true;
      objData[type];
      objData[type] += this.prettifyKey(key, '', false) + ': [{';
      (val as Array<any>).forEach((x) => {
        if (x instanceof Object) {
          let obj = Object.entries(x);
          obj.forEach(([prop, val], ind) => {
            this.checkValType(prop, val, objData, type, partOfObj);
          });
        } else {
          // this.checkValType(null, x);
        }
      });
      if (type === ObjType.MODELSTR) {
        objData[type] += '}];';
      } else if (type === ObjType.FIELDSSTR) {
        objData[type] += '}],';
      }

      partOfObj = false;
      this.tempColl = [];
    } else if (!isArr && isObj) {
      this.tempColl = [];
      partOfObj = true;
      if (type === ObjType.MODELSTR) {
        objData[type] += this.prettifyKey(key, '', false) + ': {';
      } else if (type === ObjType.FIELDSSTR) {
        objData[type] += this.prettifyKey(key, '', false) + ' : {' + '\n';
      }

      let obj = Object.entries(val);
      obj.forEach(([prop2, val2], ind) => {
        this.checkValType(prop2, val2, objData, type, partOfObj);
      });
      if (type === ObjType.MODELSTR) {
        objData[type] += '};';
      } else if (type === ObjType.FIELDSSTR) {
        objData[type] += '\n' + '},' + '\n';
      }
      partOfObj = false;
      this.tempColl = [];
    } else {
      let propVal = '';
      if (type === ObjType.MODELSTR) {
        propVal = this.generateProp(key, val, type, this.appendStr, false);
      } else if (type === ObjType.FIELDSSTR) {
        if (this.appendStrFieldsStr) {
          this.appendStrFieldsStr.split(',').forEach((x) => {
            propVal += this.generateProp(key, val, type, x, partOfObj);
          });
        }
      }
      objData[type] += propVal;
    }
  }

  generateProp(
    key: string,
    val: string,
    type: ObjType,
    appenderStr: string,
    partOfObj: boolean
  ) {
    let prop = '';
    let prittierKey = this.prettifyKey(key, appenderStr);
    if (
      this.tempColl &&
      this.tempColl.findIndex((x) => x === prittierKey) >= 0
    ) {
    } else {
      if (prittierKey) {
        if (type === ObjType.MODELSTR) {
          prop = prittierKey + ':' + this.getValDataType(val);
          prop += ';';
        } else if (type === ObjType.FIELDSSTR) {
          if (partOfObj && partOfObj === true) {
            // prettier-ignore
            prop = prittierKey + ' : ' +'"' + prittierKey + '"';
            prop += ',';
          } else {
            // prettier-ignore
            prop = prittierKey + ' = ' +'"' + prittierKey + '"';
            prop += ';';
          }
        }
        this.tempColl.push(prittierKey);
      }
    }
    return prop;
  }

  prettifyKey(key: string, appendStr: string, append = true) {
    let betterKey = '';
    if (key.match(/[!@#$%^&*(),.?":{}|\-<> ]/)) {
      betterKey += '"';
      betterKey += key;
      if (append && appendStr && !betterKey.endsWith(appendStr)) {
        betterKey = betterKey + appendStr;
      }
      betterKey += '"';
    } else {
      betterKey = key;
      if (append && appendStr && !betterKey.endsWith(appendStr)) {
        betterKey = betterKey + appendStr;
      }
    }

    return betterKey;
  }

  getValDataType(val: string) {
    let type = 'string';
    if (val) {
      if (val.toString().match(/^(true|false)$/i)) {
        type = 'boolean';
      } else if (val.toString().match(/^[0-9]*$/)) {
        type = 'number';
      } else {
        type = 'string';
      }
    }
    return type;
  }
}
