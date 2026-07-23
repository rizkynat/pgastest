import { Controller, Get, UseGuards, Patch, Param, Body, Delete, Query, Response, Post, ParseIntPipe, BadRequestException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { SpendingService } from '../services/spending.service';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/role.decorator';
import { Role } from '../../../common/enums/role.enum';
import { Response as ExpressResponse } from 'express';

@ApiTags('Spendings')
@Controller('spendings')
export class SpendingController {
  constructor(private readonly spendingService: SpendingService) { }

  @Get('search')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Find spending' })
  @ApiResponse({ status: 200, description: 'List of matching spendings' })
  async search(
    @Query('q') q?: string,
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10'
  ) {
    return this.spendingService.search(q, Number(page), Number(limit));
  }

  @Post('create')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  async create(
    @Body() data: { employee_id: number; spending_date: string; value: number },
  ) {
    if (!data || !data.employee_id || !data.spending_date || data.value === undefined) {
      throw new BadRequestException('employee_id, spending_date, dan value wajib diisi');
    }

    return this.spendingService.create({
      employee_id: data.employee_id,
      spending_date: data.spending_date,
      value: data.value,
    });
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  async updateSpending(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { employee_id?: number; spending_date?: string; value?: number },
  ) {
    return this.spendingService.update(id, body);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Delete spending (ADMIN only)' })
  @ApiResponse({ status: 200, description: 'Spending deleted successfully' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async deleteSpending(@Param('id', ParseIntPipe) id: number) {
    return this.spendingService.delete(id);
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.USER)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get all spendings' })
  @ApiResponse({ status: 200, description: 'List of all spendings' })
  async getSpendingPaginate(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
  ) {
    return this.spendingService.paginate(Number(page), Number(limit));
  }

  @Get('export/xlsx')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.USER, Role.ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Export spending documents' })
  @ApiResponse({ status: 200, description: 'Spending documents retrieved' })
  async exportSpendings(@Response({ passthrough: true }) res: ExpressResponse) {
    const buffer = await this.spendingService.generateExcel();

    res.set({
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': 'attachment; filename=spendings.xlsx',
    });

    res.send(buffer);
  }
}
