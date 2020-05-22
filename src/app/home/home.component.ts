import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, FormControl } from '@angular/forms';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit {
  form: FormGroup;
  outputObj = {};
  outputData = '';
  isObj = false;
  isArr = false;
  appendStr = '';
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

    this.outputObj = {};
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
    // this.form.get('output').setValue(JSON.stringify(this.outputObj));

    this.form.get('output').setValue(this.outputData);
  }

  checkValType(key: any, val: any) {
    let isArr = val instanceof Array;
    let isObj = val instanceof Object;
    if (isArr) {
      debugger;
      this.outputData += this.prettifyKey(key, false) + ': [{';
      (val as Array<any>).forEach((x) => {
        if (x instanceof Object) {
          let obj = Object.entries(x);
          obj.forEach(([prop, val]) => {
            this.checkValType(prop, val);
          });
        } else {
          this.checkValType(null, x);
        }
      });
      this.outputData += '}];';
    } else if (!isArr && isObj) {
      this.outputData += this.prettifyKey(key, false) + ': {';
      let obj = Object.entries(val);
      obj.forEach(([prop2, val2]) => {
        this.checkValType(prop2, val2);
      });
      this.outputData += '};';
    } else {
      if (key) {
        this.outputData +=
          this.prettifyKey(key) + ':' + this.getValDataType(val);
        this.outputData += ';';
        this.outputObj[key] = 'string';
      } else {
        this.outputData +=
          this.prettifyKey(val) + ':' + this.getValDataType(val);
        this.outputData += ';';
        this.outputObj[val] = 'string';
      }
    }
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
    let type = '';
    if (
      // val.match(/^(?:(1|y(?:es)?|t(?:rue)?|on)|(0|n(?:o)?|f(?:alse)?|off))$/i)
      val.toString().match(/^(true|false)$/i)
    ) {
      type = 'boolean';
    } else if (val.toString().match(/^[0-9]*$/)) {
      type = 'number';
    } else {
      type = 'string';
    }
    return type;
  }
}
