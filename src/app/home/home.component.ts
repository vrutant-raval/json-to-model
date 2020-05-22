import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, FormControl } from '@angular/forms';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit {
  form: FormGroup;

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      inputJSON: new FormControl(''),
      output: new FormControl(''),
    });
  }

  processInput() {
    let inputStr = this.form.get('inputJSON').value;
    try {
      let inputJSON = JSON.parse(inputStr);
    } catch (ex) {
      this.form.get('output').setValue('Invlid Input JSON');
    }
  }
}
