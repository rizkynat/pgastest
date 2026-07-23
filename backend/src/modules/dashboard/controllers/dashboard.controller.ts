import { Controller, Get, UseGuards, Request, Patch, Param, Body, Delete, Query, Res, Response, Post, HttpStatus, HttpCode } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { DashboardService } from '../services/dashboard.service';

@ApiTags('Dashboards')
@Controller('dashboards')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) { }
  @Get('summary')
  getSummary() {
    return this.dashboardService.getSummaryCards();
  }


  @Get('chart/collection')
  getCollectionTrend(@Query('range') range?: '7d' | '30d' | '90d') {
    return this.dashboardService.getCollectionTrend(range ?? '90d');
  }

  @Get('chart/login-trend')
  getLoginTrend(@Query('range') range?: '7d' | '30d' | '90d') {
    return this.dashboardService.getLoginTrend(range ?? '90d');
  }
}