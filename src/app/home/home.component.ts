import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, FormControl } from '@angular/forms';
import { stringify } from 'querystring';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit {
  form: FormGroup;
  outputData = '';
  isObj = false;
  isArr = false;
  appendStr = '';
  tempColl: string[] = [];
  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      inputJSON: new FormControl(''),
      output: new FormControl(''),
      appendStr: new FormControl(''),
    });
  }

  processInput() {
    this.outputData = '';
    let inputStr = this.form.get('inputJSON').value;
    this.appendStr = this.form.get('appendStr').value;

    try {
      let inputJSON = JSON.parse(inputStr);
      let obj = Object.entries(inputJSON);
      obj.forEach(([prop, val]) => {
        this.checkValType(prop, val);
      });
      this.form.get('output').setValue('Processing');
    } catch (ex) {
      console.log(ex);
      this.form.get('output').setValue('Invlid Input JSON');
    }

    this.form.get('output').setValue(this.outputData);
  }

  checkValType(key: any, val: any) {
    let isArr = val instanceof Array;
    let isObj = val instanceof Object;
    if (isArr) {
      this.tempColl = [];
      this.outputData += this.prettifyKey(key, false) + ': [{';
      (val as Array<any>).forEach((x) => {
        if (x instanceof Object) {
          let obj = Object.entries(x);
          obj.forEach(([prop, val]) => {
            this.checkValType(prop, val);
          });
        } else {
          // this.checkValType(null, x);
        }
      });
      this.outputData += '}];';
      this.tempColl = [];
    } else if (!isArr && isObj) {
      this.tempColl = [];
      this.outputData += this.prettifyKey(key, false) + ': {';
      let obj = Object.entries(val);
      obj.forEach(([prop2, val2]) => {
        this.checkValType(prop2, val2);
      });
      this.outputData += '};';
      this.tempColl = [];
    } else {
      this.outputData += this.generateProp(key, val);
    }
  }

  generateProp(key: string, val: string) {
    let prop = '';
    if (this.tempColl && this.tempColl.findIndex((x) => x === key) >= 0) {
    } else {
      if (key) {
        prop = this.prettifyKey(key) + ':' + this.getValDataType(val);
        prop += ';';
        this.tempColl.push(key);
      } else {
        prop = this.prettifyKey(val) + ':' + this.getValDataType(val);
        prop += ';';
      }
    }
    return prop;
  }

  prettifyKey(key: string, append = true) {
    let betterKey = '';
    if (key.match(/[!@#$%^&*(),.?":{}|\-<> ]/)) {
      betterKey += '"';
      betterKey += key;
      if (append && this.appendStr && !betterKey.endsWith(this.appendStr)) {
        betterKey = betterKey + this.appendStr;
      }
      betterKey += '"';
    } else {
      betterKey = key;
      if (append && this.appendStr && !betterKey.endsWith(this.appendStr)) {
        betterKey = betterKey + this.appendStr;
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
