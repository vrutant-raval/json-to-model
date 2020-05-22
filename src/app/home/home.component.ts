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
  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      inputJSON: new FormControl(''),
      output: new FormControl(''),
    });
  }

  processInput() {
    this.outputData = '';
    this.outputData += '{';
    this.outputObj = {};
    let inputStr = this.form.get('inputJSON').value;
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
    this.outputData += '}';
    this.form.get('output').setValue(this.outputData);
  }

  checkValType(key: any, val: any) {
    let isArr = val instanceof Array;
    let isObj = val instanceof Object;
    if (isArr) {
      (val as Array<any>).forEach((x) => {
        let obj = Object.entries(x);
        obj.forEach(([prop, val]) => {
          this.checkValType(prop, val);
        });
      });
    } else if (!isArr && isObj) {
      let obj = Object.entries(val);
      obj.forEach(([prop, val]) => {
        if (val instanceof Object) {
          this.outputData += this.prettifyKey(prop) + ': {' + '\n';
        }

        this.checkValType(prop, val);
        if (val instanceof Object) {
          this.outputData += '};' + '\n';
        }
      });
    } else {
      this.outputData +=
        this.prettifyKey(key) + ':' + this.getValDataType(val) + ';' + '\n';
      this.outputObj[key] = 'string';

      // console.log(key, val);
    }
  }

  prettifyKey(key: string) {
    let betterKey = '';
    if (key.match(/[!@#$%^&*(),.?":{}|\-<> ]/)) {
      betterKey += '"';
      betterKey += key;
      betterKey += '"';
    } else {
      betterKey = key;
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
