import { Controller, Get, UseGuards, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { SpendingReportService } from '../services/spending-report.service';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/role.decorator';
import { Role } from '../../../common/enums/role.enum';

@ApiTags('Spending Report')
@Controller('spendings-report')
export class SpendingReportController {
  constructor(private readonly spendingReportService: SpendingReportService) { }

  @Get('search')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.USER)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Cari data gabungan employee - department - spending (berdasarkan nama karyawan atau nama departemen), terurut value ASC',
  })
  @ApiResponse({ status: 200, description: 'List data gabungan sesuai pencarian' })
  async search(
    @Query('q') q?: string,
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
  ) {
    return this.spendingReportService.search(q, Number(page), Number(limit));
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.USER)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Ambil seluruh data gabungan employee - department - spending, terurut value ASC' })
  @ApiResponse({ status: 200, description: 'List seluruh data gabungan' })
  async getSpendingReportPaginate(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
  ) {
    return this.spendingReportService.paginate(Number(page), Number(limit));
  }
}