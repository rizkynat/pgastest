import { Controller, Get, UseGuards, Request, Patch, Param, Body, Delete, Query, Response, Post, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { EmployeeService } from '../services/employee.service';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/role.decorator';
import { Role } from '../../../common/enums/role.enum';
import { Response as ExpressResponse } from 'express';

@ApiTags('Employees')
@Controller('employees')
export class EmployeeController {
  constructor(private readonly employeeService: EmployeeService) { }

  @Get('me')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get current employee profile' })
  @ApiResponse({ status: 200, description: 'Employee profile retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getCurrentEmployee(@Request() req) {
    return this.employeeService.findById(req.employee.id);
  }

  @Get('search')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Find employee' })
  @ApiResponse({ status: 200, description: 'List of all employees' })
  @ApiResponse({ status: 403, description: 'Forbidden - insufficient permissions' })
  async search(
    @Query('q') q?: string,
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10'
  ) {
    return this.employeeService.search(q, Number(page), Number(limit));
  }

  @Post('create')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.USER)
  async create(
    @Body() data: { employee_name: string; department_id: number },
  ) {
    return this.employeeService.create({
      employee_name: data.employee_name,
      department_id: Number(data.department_id),
    });
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  async updateEmployee(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { employee_name?: string; department_id?: number },
  ) {
    return this.employeeService.update(id, body);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Delete employee (ADMIN only)' })
  @ApiResponse({ status: 200, description: 'Employee deleted successfully' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async deleteEmployee(@Param('id', ParseIntPipe) id: number) {
    return this.employeeService.delete(id);
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get all employees (ADMIN only)' })
  @ApiResponse({ status: 200, description: 'List of all employees' })
  @ApiResponse({ status: 403, description: 'Forbidden - insufficient permissions' })
  async getEmployeePaginate(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
  ) {
    return this.employeeService.paginate(Number(page), Number(limit));
  }

  @Get('export/xlsx')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.USER, Role.ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get documents (USER, ADMIN)' })
  @ApiResponse({ status: 200, description: 'Employee documents retrieved' })
  @ApiResponse({ status: 403, description: 'Forbidden - insufficient permissions' })
  async exportEmployees(@Response({ passthrough: true }) res: ExpressResponse) {
    const buffer = await this.employeeService.generateExcel();

    res.set({
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': 'attachment; filename=employees.xlsx',
    });

    res.send(buffer);
  }
}