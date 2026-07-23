import { Controller, Get, UseGuards, Patch, Param, Body, Delete, Query, Response, Post, ParseIntPipe, BadRequestException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { DepartmentService } from '../services/department.service';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/role.decorator';
import { Role } from '../../../common/enums/role.enum';
import { Response as ExpressResponse } from 'express';

@ApiTags('Departments')
@Controller('departments')
export class DepartmentController {
  constructor(private readonly departmentService: DepartmentService) { }

  @Get('search')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Find department' })
  @ApiResponse({ status: 200, description: 'List of matching departments' })
  async search(
    @Query('q') q?: string,
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10'
  ) {
    return this.departmentService.search(q, Number(page), Number(limit));
  }

  @Post('create')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  async create(
    @Body() data: { department_name: string },
  ) {
    if (!data || !data.department_name) {
      throw new BadRequestException('department_name wajib diisi');
    }

    return this.departmentService.create({
      department_name: data.department_name,
    });
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  async updateDepartment(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { department_name?: string },
  ) {
    return this.departmentService.update(id, body);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Delete department (ADMIN only)' })
  @ApiResponse({ status: 200, description: 'Department deleted successfully' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async deleteDepartment(@Param('id', ParseIntPipe) id: number) {
    return this.departmentService.delete(id);
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.USER)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get all departments' })
  @ApiResponse({ status: 200, description: 'List of all departments' })
  async getDepartmentPaginate(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
  ) {
    return this.departmentService.paginate(Number(page), Number(limit));
  }

  @Get('export/xlsx')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.USER, Role.ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Export department documents' })
  @ApiResponse({ status: 200, description: 'Department documents retrieved' })
  async exportDepartments(@Response({ passthrough: true }) res: ExpressResponse) {
    const buffer = await this.departmentService.generateExcel();

    res.set({
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': 'attachment; filename=departments.xlsx',
    });

    res.send(buffer);
  }
}