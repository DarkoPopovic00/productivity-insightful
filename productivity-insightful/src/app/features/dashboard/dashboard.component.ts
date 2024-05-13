import { Component } from '@angular/core';
import { EmployeeService } from '../../shared/data-access/http-services';
import { AsyncPipe } from '@angular/common';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [AsyncPipe],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent {
  employees$ = this.employeeService.getAll();
  constructor(private employeeService: EmployeeService) {

  }
}
